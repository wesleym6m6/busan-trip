# 架構與資料契約

視覺規格見 [DESIGN_SPEC.md](DESIGN_SPEC.md)；現況與待辦見 [CODEX_HANDOFF.md](CODEX_HANDOFF.md)；指令與環境見 [../README.md](../README.md)。

## 1. 技術選型

- React 19 + TypeScript 5.9 + Vite 7；樣式為 CSS variables（`src/styles/tokens.css`）＋ CSS Modules。
- 執行期依賴只有 `react`、`react-dom`、`zod`（以 `zod/mini` 匯入，可 tree-shake）。
- 無 router 套件（hash routing 自寫 60 行）、無 state manager（Context 三個）、無 icon／動畫／日期套件。
- 純靜態：無 SSR、無 API proxy、無資料庫；`fetch` 只打同源的 `public/data/*.json`。
- 建置產物（`npm run build`，demo 資料）：JS 314 kB（gzip 100 kB，其中 React ≈ 60 kB gzip）、CSS 27 kB（gzip 5.6 kB）。

## 2. 目錄與責任

```
src/
  main.tsx, App.tsx          進入點；App 組合 PreferencesProvider → TripDataProvider → AppShell
  styles/                    tokens.css（唯一 token 來源）、base.css（reset、焦點、動畫總開關）
  ui/                        無領域知識的共用元件：Button/LinkButton、Tag、Dialog（原生 <dialog>）、Icons、Notice（Empty/Loading/Error/InlineStatus/Section/Card）
  app/
    routes.ts                hash 路由：parseHash / buildHash / buildShareUrl / useHashRoute
    TripDataContext.tsx      載入資料（loading / ok / error）與 reload；useTripData 只在 ok 後使用
    PreferencesContext.tsx   本機偏好（動畫、上次日期）＋ prefers-reduced-motion → <html data-motion>
    OverlayContext.tsx       全站覆蓋層：openAddress(placeId) / openMap(placeId)
    useNow.ts                每分鐘更新的現在時間；?now= 可固定
    SeaBackdrop.tsx          全頁固定背景：大橋線稿、浪帶動畫、日出光暈、一次性海鷗；分頁背景時暫停
    AppShell.tsx, BottomNav.tsx
  features/
    itinerary/               TripHeader、DateSelector、DaySummary、ItineraryTimeline、EventCard、TransitSegment、ReservationDetails、ItineraryPage
    backups/                 BackupPage（篩選、卡片、空狀態）
    tools/                   ToolsPage、AddressDialog（大字地址）、MapMenuDialog、MotionSettings
    places/                  PlaceDetails（事件卡與備案卡共用的地點展開內容）、SourceList、PlaceImages
  domain/
    schema.ts                zod/mini schema（契約的單一來源）
    types.ts                 由 schema 推導的型別；TripDataset = 檔案 + id 索引
    validate.ts              validateTripData()：schema + 跨物件規則 → ok/data 或 issues
  data/
    config.ts                VITE_DATA_MODE → 檔案路徑；withBase() 處理 /repo-name/ 子路徑
    loadTrip.ts              靜態 JSON adapter：fetch → parse → validate → 模式檢查
  lib/
    dates.ts                 Asia/Seoul 日期時間、offset、跨日顯示、?now 解析
    mapLinks.ts              Naver/Kakao/Google 連結建立與 encoding（唯一出口）
    clipboard.ts             copyText()：Clipboard API → execCommand fallback → 'failed'
    preferences.ts           localStorage / sessionStorage 讀寫（皆 try/catch）
    format.ts                列舉 → 繁中文案、金額、分鐘、來源摘要
  test/setup.ts              jsdom 補丁（dialog、matchMedia、IntersectionObserver、scrollTo）
public/data/demo/trip.json   示範資料（mode: demo）
public/data/trip.json        正式資料（尚未存在）
scripts/validate-data.ts     CLI 驗證；scripts/screenshots.mjs 視覺基準
```

責任分層：`ui/` 不 import `domain/`；`features/` 只透過 `TripDataset` 與 `lib/` 取資料；地址、地圖 URL、時間文案不得在 JSX 內硬寫。

## 3. 資料流

```mermaid
flowchart LR
  subgraph build[建置期]
    ENV[VITE_DATA_MODE / VITE_BASE_PATH] --> CFG[data/config.ts]
  end
  DEMO[public/data/demo/trip.json] -->|demo| FETCH
  PROD[public/data/trip.json] -->|production| FETCH
  CFG --> FETCH[data/loadTrip.ts fetch]
  FETCH --> VAL[domain/validate.ts\nschema + 跨物件規則]
  VAL -->|ok| DS[TripDataset\n(+ placesById 等索引)]
  VAL -->|error| ERR[AppShell 錯誤畫面\n（不 fallback）]
  DS --> CTX[TripDataContext]
  CTX --> IT[行程頁]
  CTX --> BK[備案頁]
  CTX --> TL[工具頁]
  IT & BK & TL --> OV[OverlayContext\nAddressDialog / MapMenuDialog]
  OV --> ML[lib/mapLinks.ts]
  PREF[(localStorage 偏好)] --> PC[PreferencesContext] --> IT
  NOW[useNow + Asia/Seoul] --> IT
```

## 4. 資料契約（schemaVersion 1）

型別以 `src/domain/schema.ts` 為準；這裡列欄位、可空規則與語意。「可空」= 允許 `null`；未標可空的欄位必填。

### 根層 `TripDataFile`

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `schemaVersion` | `1` | 契約版本；破壞性變更時遞增並更新 validate.ts |
| `tripId` | string | 必須等於 `trip.id` |
| `dataVersion` | string | 人讀版本，例如 `demo-0.1.0`、`2026-10-01.2` |
| `updatedAt` | ISO datetime（含 offset） | 檔案產生時間；**不是**核對時間 |
| `mode` | `demo` \| `production` | production 不得含示範日期或 demo 來源 |
| `trip`, `areas[]`, `places[]`, `days[]`, `events[]`, `transits[]`, `backups[]`, `guides[]`, `tools` | 見下 | 所有集合內 id 唯一 |

### `Trip`

`id`、`name`、`shortName`（頁首小標，如 BUSAN）、`locale: 'zh-TW'`、`timezone: 'Asia/Seoul'`、`startDate`／`endDate`（LocalDate，可空；production 必填）、`lodgingPlaceIds[]`（必須指向 `kind: 'lodging'` 的地點）。

### `Area`

`id`、`name: { zh, ko?, en? }`。地點與 DayPlan 以 `areaId` 引用。

### `Place`

| 欄位 | 可空 | 說明 |
| --- | --- | --- |
| `id`, `kind` | | kind：sight/food/cafe/lodging/transport/shop/activity/other |
| `name.zh` | | 繁中；`name.ko`、`name.en` 可空 |
| `areaId` | ✓ | |
| `address.ko/zh/en` | ✓ | 韓文地址優先給司機與地圖 |
| `precision` | | `exact`（可進司機畫面）/ `approximate`（顯示但警示）/ `area-only` / `unknown`（不顯示門牌） |
| `coordinates` | ✓ | `{lat,lng}`；只在 exact／approximate 時用於 Google 座標連結 |
| `mapLinks.naver/kakao/google` | ✓ | 經核對的連結；null 時 UI 提供標示為「搜尋」的入口 |
| `images[]` | | `{src(相對 public/), alt, width, height, caption?, credit?}`；需有授權來源 |
| `hours`, `notes` | ✓ | 自由文字；未知就 null |
| `sources[]` | | SourceRef |

### `DayPlan`

`id`、`dayNumber`（唯一、正整數）、`date`（LocalDate、唯一）、`isDemoDate`、`title`、`areaIds[]`、`summary?`、`reminders[]`（人工提醒；預約提醒由 UI 自動產生，不必重複）、`sequence[]`：`{kind:'event'|'transit', id}` 的明確順序。事件與交通段落必須且只能被一天的 sequence 引用，且其 `dayId` 需一致。

### `ItineraryEvent`

| 欄位 | 可空 | 說明 |
| --- | --- | --- |
| `id`, `dayId`, `type` | | type：sight/meal/cafe/activity/transport/lodging/free/note |
| `placeId` | ✓ | null 時必須有 `title` |
| `title` | ✓ | null → 用地點繁中名 |
| `start`, `end`, `arriveBy` | ✓ | TimePoint；`end ≥ start`、`arriveBy ≤ start` |
| `summary` | | 收合狀態也顯示的一句話 |
| `notes` | ✓ | 展開後補充 |
| `tags[]` | | 短標籤，克制使用 |
| `cost` | ✓ | `{amount, currency, note?}`；null = 未知，0 = 免費 |
| `reservation` | ✓ | ReservationInfo |
| `guideIds[]`, `toolLinks[]`, `sources[]` | | toolLinks：`address-large`（卡片直接顯示「給司機看」）、`lodging` |

### `TransitLeg`

`id`、`dayId`、`from`／`to`：`{placeId?, text?}`（至少一個非 null）、`mode`（walk/metro/bus/taxi/train/airport-bus/light-rail/ferry/car/other）、`label?`、`depart?`／`arrive?`（TimePoint；`arrive.date` 可為隔天）、`durationMinutes?`（null = 未知）、`isEstimate`（true → 顯示「約」與「估計」標籤）、`bufferMinutes?`、`cost?`、`notes?`、`sources[]`。

### `ReservationInfo`

`status`（`confirmed` / `pending` / `unknown` / `not-required`）、`provider?`、`sessionTime?`、`arriveBy?`（≤ sessionTime）、`arrivalRule?`、`meetingPoint: {placeId?, text?}`、`groups`（null = 未安排／不公開；`[]` = 明確無分組；否則 `{label, members[]}`）、`publicNotes?`。訂單編號、QR、密碼不得放任何欄位。`confirmed` 但沒有 official／user-provided 來源會產生 warning。

### `BackupOption`、`GuideEntry`、`ToolsContent`

- Backup：`id`、`placeId`、`category`（food/cafe/indoor/sight/shop/other）、`suitableFor`、`rainOk`（true/false/**null = 未標記**；全部 null 時 UI 不顯示雨天篩選）、`notes?`、`sources[]`。
- Guide：`id`、`title`、`category`（transport/food/tips/area/reservation）、`body`（純文字，空行分段）、`relatedPlaceIds[]`、`sources[]`。
- Tools：`airportTransit[]`（`id, mode, title, summary, durationMinutes?, isEstimate, cost?, link?, sources[]`）、`officialLinks[]`（`label, url, note?, source`）。

### `SourceRef`

`type`（official / user-provided / web / demo / unverified）、`label`、`url?`（http(s) 絕對 URL）、`verifiedAt?`（**只能是真正核對的時間**；demo／unverified 必須為 null）、`note?`。
UI 的「資料已核對」= 有 official 或 user-provided 且 `verifiedAt` 非 null；這與 `reservation.status` 無關。

### `TimePoint` 與時區

`{ date?: LocalDate | null, time: 'HH:mm' }`。`date` 缺省 = 所屬 DayPlan 的日期；跨日必須寫出 date。所有時間以 `trip.timezone`（Asia/Seoul）解讀；「今天」也用該時區計算（`lib/dates.ts getZonedParts`），不用裝置時區。含 offset 的 ISO 字串由 `toIsoWithOffset()` 推導，不重複儲存。

### `AppPreferences`（僅本機）

`{ motion: boolean, lastViewedDayId: string | null }`，存於 `localStorage['busan-trip:prefs:v1']`；海鷗旗標存 `sessionStorage['busan-trip:gull-shown']`。不同步、不跨裝置。

## 5. 驗證（`validateTripData`）

- schema 錯誤：缺欄位、型別、HH:mm 格式、ISO 日期、URL 協定、負數等。
- 跨物件 error：`tripId ≠ trip.id`、重複 id／dayNumber／日期、無效 areaId／placeId／dayId／guideId、sequence 引用不存在或 dayId 不符、事件／交通未排入任何一天、重複排入、時間先後、`exact` 卻無地址、無 placeId 卻無 title、`address-large` 卻無 placeId、住宿 id 非 lodging、demo／unverified 來源有 verifiedAt、production 含示範日期或 demo 來源、production 缺起訖日期。
- warning：unknown 精度卻有座標、圖片用外部 URL、confirmed 卻無可靠來源、行進時間 > 24h、緩衝 > 3h、verifiedAt 晚於 updatedAt。
- 執行：`npm run validate:data [檔案...]`；App 載入時也會執行，error 直接顯示錯誤畫面（含 issue 清單），warning 顯示於工具頁計數。

## 6. demo 與 production 切換

1. 產生符合契約的 `public/data/trip.json`，`mode: "production"`、`isDemoDate: false`、真實 `startDate/endDate`、來源不得為 demo。
2. `npm run validate:data public/data/trip.json` 通過。
3. 以 `VITE_DATA_MODE=production npm run build` 建置；`loadTrip.ts` 只會讀 `data/trip.json`，找不到、驗證失敗或檔案自稱 demo 都顯示錯誤，不會退回示範資料。
4. UI 不需修改；示範 fixture 保留在 `public/data/demo/` 供測試與截圖。

匯入來源（Google Sheets、Notion、手寫 JSON）一律在建置前轉成同一契約的 JSON；本專案刻意不內建任何第三方 API 整合。若要寫轉換腳本，放 `scripts/`，輸出後仍必須跑 `validate:data`。

## 7. 路由與網址

- `#/itinerary`（預設日：網址 > Asia/Seoul 今天 > 上次查看 > Day 1）、`#/itinerary/<dayId>`、`#/backups`、`#/tools`。
- 分享網址 = `origin + pathname + search + hash`，因此在 `/repo-name/` 子路徑下也正確。
- 查詢參數（測試用，不影響正式使用）：`?now=<ISO>`、`?expand=<eventId>`。
- 底部導覽切回「行程」時帶最近查看的日期。

## 8. GitHub Pages 前提

- repo 名稱未定；base path 由 `VITE_BASE_PATH` 決定（workflow 內以 `${{ github.event.repository.name }}` 推得），程式碼不寫死帳號。
- `.github/workflows/deploy-pages.yml` 只有 `workflow_dispatch`；啟用自動部署前需確認資料可公開，再開啟 push 觸發。
- 資產、JSON、分享網址都經過 `import.meta.env.BASE_URL` / `withBase()`；hash routing 不需 404 rewrite。
- 首版不含 Service Worker／PWA；不宣稱可離線。

## 9. 測試

`npm test`（vitest + jsdom）：

- `domain/validate.test.ts`：fixture 通過、缺欄位、重複 id、無效引用、未排入 sequence、時間格式與先後、跨日、非法 URL、demo verifiedAt、production 界線、住宿 kind。
- `lib/dates.test.ts`：時區日期、offset、ISO 推導、星期、日期範圍、翌日顯示、?now 解析。
- `lib/mapLinks.test.ts`：搜尋字串與 encoding、經核對連結優先、區域級標示、座標規則；`formatMoney` null/0。
- `app/App.test.tsx`：首屏、切換日期與網址、展開卡片與地址對話框、區域級住宿不提供門牌、備案篩選與空狀態、工具頁與動畫開關、資料錯誤狀態。

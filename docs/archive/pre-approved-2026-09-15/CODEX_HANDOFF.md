# Codex 交接

前端體驗、視覺、元件架構與資料契約已完成第一版（2026-09-13）。Codex 接手範圍：真實行程資料串接、整合測試、GitHub Pages 部署。
規格見 [DESIGN_SPEC.md](DESIGN_SPEC.md)、[ARCHITECTURE_AND_DATA.md](ARCHITECTURE_AND_DATA.md)；指令見 [../README.md](../README.md)。

## 1. 已完成（可操作）

| 項目 | 狀態 | 相關檔案 |
| --- | --- | --- |
| 三個頁面（行程／備案／工具）＋ hash 路由、底部導覽 | 完成 | `src/app/*`, `src/features/*` |
| 日期列 sticky、切換更新網址、分享此日、瀏覽器返回、時鐘更新不改變選取 | 完成 | `features/itinerary/DateSelector.tsx`, `ItineraryPage.tsx`, `app/routes.ts` |
| 事件卡收合／展開、交通段落（估計、緩衝、跨日「翌日」）、預約細節（狀態／場次／抵達／集合／分組） | 完成 | `EventCard.tsx`, `TransitSegment.tsx`, `ReservationDetails.tsx` |
| 「接下來（依計畫）」（Asia/Seoul 今天、第一個未開始事件） | 完成 | `ItineraryTimeline.tsx findNextEventId`, `lib/dates.ts` |
| 大字地址（給司機看）、複製名稱／地址、失敗提示；區域級位置不給門牌 | 完成 | `features/tools/AddressDialog.tsx`, `lib/clipboard.ts` |
| 地圖入口（Naver／Kakao／Google；經核對 vs 搜尋 vs 座標；僅區域標示） | 完成 | `lib/mapLinks.ts`, `MapMenuDialog.tsx` |
| 備案篩選（區域／類型／雨天可僅在有標記時）、空狀態 | 完成 | `features/backups/BackupPage.tsx` |
| 工具頁：住宿、預約摘要、地點快速查、機場交通、官方連結、設定與資料版本、重新載入 | 完成 | `features/tools/ToolsPage.tsx` |
| 全頁固定背景（v2）：大橋線稿、三層浪帶橫移、光暈呼吸、session 一次性海鷗；開關（頁首＋工具頁）、reduce-motion、分頁背景暫停 | 完成 | `app/SeaBackdrop.tsx`, `styles/base.css`, `PreferencesContext.tsx` |
| 資料契約（zod/mini）、跨物件驗證、CLI 驗證、示範 fixture | 完成 | `domain/*`, `scripts/validate-data.ts`, `public/data/demo/trip.json` |
| demo／production 切換、production 不 fallback、錯誤畫面與重試 | 完成 | `data/config.ts`, `data/loadTrip.ts`, `app/AppShell.tsx` |
| 可及性基礎：語意按鈕、aria-pressed／aria-selected／aria-expanded、可見焦點、dialog 焦點返回、44px 目標 | 完成（未跑自動化 a11y 掃描） | `ui/*`, 各元件 |
| build／preview／typecheck／lint／test／validate／screenshots 指令 | 完成 | `package.json`, `scripts/*` |
| GitHub Pages workflow（僅手動觸發） | 已寫、未執行 | `.github/workflows/deploy-pages.yml` |

## 2. 仍為 mock／示範

- `public/data/demo/trip.json` 全部是示範：3 天（2026-10-16 五 ～ 10-18 日，`isDemoDate: true`）、17 個事件、10 段交通、19 個地點、8 個備案、4 則攻略。
- 地址、座標憑記憶填入，`sources[].type` 為 `unverified` 或 `demo`，`verifiedAt` 全為 null。**不可直接升級為正式資料。**
- 天空膠囊列車：`reservation.status: "pending"`、場次 12:00 與抵達 11:40 為示範、`groups: null`、未購票。
- 住宿：`place-lodging-demo` 為 `precision: "area-only"`（廣安里一帶），無門牌；UI 因此不提供司機畫面。
- 機場交通三個選項的時間皆為估計、費用皆 null；官方連結（Humetro、金海機場）網址未核對。
- 圖片：fixture 沒有任何圖片；`PlaceImages` 的渲染路徑（lazy、寬高保留）只有程式碼，**未在畫面上驗證**。

## 3. 尚未完成（本階段刻意不做）

- 正式資料檔 `public/data/trip.json` 與匯入腳本。
- GitHub Pages 實際部署、repo 名稱、`VITE_BASE_PATH` 設定。
- Service Worker／PWA／離線。
- 自動化 a11y 掃描（axe）、自動化對比測試、視覺回歸比對（截圖只作人工基準）。
- 大字地址的字級調整（目前固定 28／24px）。
- 多住宿切換的 UI 只是逐一列出，未做「目前住宿」邏輯。
- 「分享此日」在不支援 `navigator.share` 的環境走複製網址；未在 iOS Safari 實機驗證。

## 4. 待使用者提供

| 資料 | 用途 | 現況 |
| --- | --- | --- |
| 正式旅行日期（起訖） | `trip.startDate/endDate`、每日 `date`、`isDemoDate: false` | 未知 |
| 住宿名稱、韓文門牌、是否可公開 | `place(kind: lodging)`、`precision: exact`、司機畫面 | 未知；公開範圍待確認 |
| 航班時間、報到規定 | Day 1／最後一天的 transport 事件 | 未知 |
| 天空膠囊列車：實際場次、票券狀態、分組 | `reservation` | 未知 |
| 正式行程（景點、餐廳、順序） | `days[].sequence`、`events`、`transits` | 只有示範 |
| 已核對的地圖連結、營業時間、票價 | `place.mapLinks`、`hours`、`cost` | 未核對 |
| 授權圖片 | `place.images` | 無 |
| GitHub repo 名稱 | `VITE_BASE_PATH` | 未知 |

## 5. 實際測試結果（2026-09-13，Windows 11、Node v22.13.1、npm 11.19.1 via `npx npm@11`）

| 命令 | 結果 |
| --- | --- |
| `npm install`（npm 10.9.2） | **失敗**：`Cannot read properties of null (reading 'edgesOut')`（arborist 解析 vitest peer 時）。改 `npx -y npm@11 install` 成功；lockfile v3 已保留 |
| `npm run typecheck` | 通過（app + node 兩組 tsconfig） |
| `npm run lint` | 通過（ESLint 10 + typescript-eslint 8.70 + react-hooks 7） |
| `npm test` | 4 檔 29 測試通過（~2.5s） |
| `npm run validate:data` | demo fixture 0 錯誤 0 警告 |
| `npm run build` | 成功：JS 314.37 kB（gzip 100.07 kB）、CSS 26.85 kB（gzip 5.57 kB）。改用 zod/mini 前為 376 kB／117 kB gzip |
| `npm run screenshots` | 11 張輸出至 `docs/screenshots/`；360px 橫向溢出 0px |
| headless Edge 行為檢查（臨時腳本，未保留） | 海鷗 session 只飛一次並寫旗標；頁首捲離／分頁背景 → `data-decor-paused=true`；dialog 開啟後焦點在對話框內、Esc 關閉、焦點回到觸發按鈕、body 捲動鎖定解除；複製地址回報「已複製地址」；動態開關寫入 localStorage 並切 `data-motion=off`；鍵盤 Enter 切換日期並更新 hash；瀏覽器返回回到前一天 |
| 首屏量測（390×844） | 頁首 144px、日期列 84px、第一張卡片頂端 y≈480px，無橫向捲動 |

未執行：iPhone Safari／Android Chrome 實機、螢幕閱讀器、axe、Lighthouse、npm 10 的 `npm ci`。

## 6. 截圖基準（`docs/screenshots/`）

固定 `?now=2026-10-17T09:30:00+09:00`、動畫關閉、海鷗已飛。`itinerary-390`、`itinerary-390-full`、`event-expanded-390`（天空膠囊列車展開）、`address-dialog-390`、`map-menu-390`、`backups-390`、`tools-390`、`tools-390-full`、`itinerary-360`、`backups-360`、`itinerary-desktop-1024`。full-page 圖中固定底部導覽會出現在中段，是全頁截圖的已知現象。

## 6b. v2 變更（2026-09-13 晚間，依使用者回饋）

- 配色：`#22768C` 青藍（被指出偏綠）→ 海藍 `#1D5FB0`；頁底改淺沙色 `#F8F5EF`；新增珊瑚 accent 只用於「接下來」與光暈。所有 token 在 `src/styles/tokens.css`，對比表在 DESIGN_SPEC 第 2 節。
- 動畫從頁首小插畫改為 `app/SeaBackdrop.tsx` 全頁固定背景；頁首移除插畫，只剩文字與開關。`CoastIllustration.tsx` 已刪除。
- 首屏量測更新：頁首 124px，第一張卡片頂端 y≈461px；360px 橫向溢出 0px；build JS 314.9 kB（gzip 100.2 kB）、CSS 27.9 kB。
- 未重新做 iOS 實機驗證；三層全寬 SVG transform 動畫在桌機 headless Edge 正常，手機耗電未實測（可用工具頁關閉動畫）。

## 7. 已知限制與假設

- npm 版本問題見上；`engines.node >= 22.12`。
- `?now=` 的 `+` 必須 URL-encode 為 `%2B`（實作刻意不用 `URLSearchParams`，避免 `+` 被解成空白）。
- 海鷗與浪帶用 `vw`／百分比位移，不依賴 container query。
- `<dialog>` 需 iOS 15.4+／Chrome 37+；jsdom 測試以 `src/test/setup.ts` 補丁。
- 示範資料把 `updatedAt` 設為產生時間；`verifiedAt` 全 null，符合「只有真正核對才填」。
- 底部導覽「行程」連結帶最近查看日期（localStorage）；清除儲存後回到預設日。

## 8. Codex 下一步優先序

1. **拿到正式資料 → 轉成契約 JSON**：放 `public/data/trip.json`，`mode: production`；每筆來源填 `type`＋`verifiedAt`（只填真正核對的）。跑 `npm run validate:data public/data/trip.json` 直到 0 錯誤，warning 逐條處理。
2. **住宿與公開邊界**：向使用者確認門牌可否公開；可公開才設 `precision: exact` 並放進 `address.ko`。
3. **整合測試**：以正式資料重跑 `npm test`（App 測試目前綁 demo fixture 的文字，可複製一份針對正式資料的冒煙測試或改成不依賴文案的斷言）；補 `VITE_DATA_MODE=production` 的建置測試（缺檔／demo 檔應顯示錯誤）。
4. **部署**：決定 repo 名稱 → workflow 內 `VITE_BASE_PATH` 自動推得；先 `workflow_dispatch` 手動跑一次，確認 `/repo-name/` 下 JSON、favicon、分享網址正確，再考慮開啟 push 觸發。`VITE_DATA_MODE` 切 production。
5. **實機驗收**：iPhone Safari／Android Chrome：safe-area、底部工具列、`100dvh`、複製、`navigator.share`、韓文字體。
6. 可選：axe 掃描、Lighthouse、`PlaceImages` 有圖時的視覺驗證、大字地址字級調整、視覺回歸（用 `npm run screenshots` 產出比對）。

修改 UI 前請先讀 DESIGN_SPEC 第 1 節；修改契約前請同時更新 `schema.ts`、`validate.ts`、ARCHITECTURE 第 4 節與 fixture，並遞增 `schemaVersion`（破壞性變更時）。

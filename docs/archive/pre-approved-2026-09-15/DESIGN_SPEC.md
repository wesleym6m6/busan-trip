# 設計規格：Busan Coastal Minimal（v2）

2026-09-13 v2：依使用者回饋，配色從偏綠的青藍改為「淺沙底 + 海藍 + 日出珊瑚」，海面動畫從頁首小角落改為整頁固定背景。

本文是視覺與互動的基準。tokens 的唯一來源是 `src/styles/tokens.css`；本文描述「為什麼」與「不能改什麼」。
架構與資料見 [ARCHITECTURE_AND_DATA.md](ARCHITECTURE_AND_DATA.md)；現況與待辦見 [CODEX_HANDOFF.md](CODEX_HANDOFF.md)。

## 1. 不得任意改動的原則

1. 首次打開直接進入「行程」，無歡迎頁、無開始按鈕。
2. 390×844、預設字級下，第一張行程卡片必須在首屏可見（v2 實測：頁首 124px，第一張卡片頂端 y≈461px）。
3. 頁首只有文字與動態開關，高度 ≤ 150px；場景（廣安大橋線稿、海面、日出光暈）全部在固定於視窗後方的 `SeaBackdrop`，極淡、不搶內容。不放照片、毛玻璃、封面；漸層只有背景由沙色到淡海色的一道，與右上光暈。
4. 海藍 `--color-primary` 只用於：選取的日期、主要操作、時間軸節點、少量標籤底色。珊瑚 `--color-accent*` 是整頁唯一暖色，只用於「接下來（依計畫）」節點／標示與背景日出光暈。卡片不做多色。
5. 正文 16px、次要 13–14px；關鍵時間（卡片時間、抵達要求、地址畫面）不得低於 15px。
6. 主要內容單一垂直捲動；只有日期列有水平捲動（備案篩選列改為換行，不做第二個水平捲動區）。
7. 動畫只有四種：背景浪帶橫移、光暈呼吸、session 首次一次性海鷗（橫越整個畫面）、120–200ms 操作微動態。不加落葉、煙火、雪、粒子、視差、滾動劫持、整串卡片依次進場。
8. 未知資料一律顯示「待確認／未知」，不補 00:00、不顯示免費、不假造連結；沒有資料的按鈕不渲染。
9. 觸控目標 ≥ 44×44 CSS px；狀態不能只靠顏色（選取日期＝實底＋白字；底部導覽＝顏色＋底線＋aria-current）。
10. 系統字體優先，不載入外部字體與 icon 套件。

## 2. Design tokens（`src/styles/tokens.css`）

### 顏色

| Token | 值 | 用途 | 對比（WCAG 2.x 計算值） |
| --- | --- | --- | --- |
| `--color-bg` | `#F8F5EF` | 頁面底：淺沙色（不是白也不是灰） | — |
| `--color-surface` | `#FFFFFF` | 卡片、對話框 | — |
| `--color-surface-muted` | `#F3F1EB` | 交通段落底色（沙色深一階） | — |
| `--color-primary` | `#1D5FB0` | 海藍：選取日期、主要按鈕、節點 | 白底 6.3:1；沙底 5.8:1；白字在其上 6.3:1 |
| `--color-primary-strong` | `#164A8C` | hover／active；淡底上的文字 | 在 soft 上 7.4:1 |
| `--color-primary-soft` | `#E3ECF8` | 今日提醒底、primary 標籤底 | — |
| `--color-accent` / `--color-accent-soft` | `#E07A57` / `#FBE9E0` | 珊瑚（裝飾）：接下來節點、光暈 | 裝飾，不承載文字 |
| `--color-accent-text` | `#B8411F` | 珊瑚（文字）：「接下來（依計畫）」 | 白底 5.5:1 |
| `--color-text` | `#1B2838` | 主文字：深海藍墨色 | 14.9:1 |
| `--color-text-secondary` | `#5B6879` | 次要文字 | 5.7:1；沙底／muted 上 5.0:1 |
| `--color-border` / `--color-border-strong` | `#E3E0D8` / `#CBC8BE` | 沙色系細邊框、時間軸線 | — |
| `--color-warn-text` / `--color-warn-soft` | `#9A5B0A` / `#FBF0DD` | 預約待確認、待確認提示 | 在 soft 上 4.8:1 |
| `--color-ok-text` / `--color-ok-soft` | `#1F6B3A` / `#E3F2E7` | 預約已確認 | 在 soft 上 5.6:1 |
| `--color-danger-text` / `--color-danger-soft` | `#B3261E` / `#FBE9E7` | 資料錯誤 | 在 soft 上 5.6:1 |
| `--color-neutral-text` / `--color-neutral-soft` | `#5B6879` / `#EEEDE8` | 示範標籤、unknown | 在 soft 上 4.8:1 |
| `--color-sea` / `--color-sea-light` | `#1D5FB0` / `#7FA9DD` | 背景浪帶（以 `--sea-wave-opacity` 疊在沙色上） | 裝飾 |
| `--sea-wave-opacity` / `--sea-glow-opacity` | 0.12 / 0.16 | 背景浪帶最深層、日出光暈強度；要調整背景存在感只改這兩個 | — |

對比值以 WCAG 2.x 相對亮度公式計算（node 腳本，未做視覺實測）；所有文字組合 ≥ 4.5:1。

### 字級與字體

- `--font-sans`：`-apple-system, BlinkMacSystemFont, 'PingFang TC', 'Noto Sans TC', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Segoe UI', Roboto, …`。韓文以 `lang="ko"` 標記，讓系統挑韓文字體。
- 12（eyebrow／版本號）、13、14、16（正文）、18（卡片標題）、20（頁面標題）、24／28（大字地址）。
- 行高：標題 1.25，正文 1.5。數字時間用 `tabular-nums`。

### 間距、圓角、邊框、陰影

- 4pt 系統：4／8／12／16／20／24／32。
- 圓角：6（標籤）、10（按鈕、交通段落）、14（卡片、對話框）。
- 邊框 1px；卡片陰影 `0 1px 2px rgba(27,40,56,.06)`；只有對話框用 `--shadow-raised`。
- 內容最大寬 640px；底部導覽 56px + safe-area。

### 動態時間

- `--motion-fast` 120ms（按鈕顏色、日期狀態）、`--motion-base` 180ms（展開淡入、chevron、sheet 進場）。
- `--wave-cycle` 28s（三層分別 ×1、×1.35 反向、×1.7；線稿浪紋 ×1.15）、光暈呼吸 16s、`--gull-duration` 7s（第二隻 ×1.15、延遲 0.9s）。

## 3. 頁面結構

### 行程（`#/itinerary/:dayId`）

由上而下：`SeaBackdrop`（固定背景，所有頁面共用）→ `TripHeader`（eyebrow＋示範標籤、旅行名稱、日期・天數、示範日期提示；右側動態開關）→ `DateSelector`（sticky）→ `DaySummary`（Day 標題、區域、摘要、今日提醒、分享）→ `ItineraryTimeline`（`EventCard` 與 `TransitSegment` 依 `DayPlan.sequence` 排列）。

`EventCard` 收合只顯示：時間或範圍（未知→「時間待確認」）、抵達要求、名稱、一句摘要、必要標籤（區域、資料標籤、預約狀態）、操作列（地圖／給司機看／詳情）。
展開：韓文名、英文名、區域與精度標籤、地址＋複製、營業時間、照片（有才顯示）、地點備註、補充說明、費用（null→「費用待確認」、0→「免費」）、`ReservationDetails`、相關攻略、資料來源。

`TransitSegment`：方式＋路線描述、起點→終點、出發–抵達（跨日顯示「翌日 HH:mm」）、約 N 分／時間待確認、+ 緩衝、費用、「估計」標籤、備註。

「接下來（依計畫）」：僅當所選日期＝Asia/Seoul 今天，標在第一個開始時間 ≥ 現在的事件；不標記「已完成」，不宣稱使用者位置。

### 備案（`#/backups`）

頁首＋「未排入正式行程的選項」、區域／類型篩選（換行 chip）、只有資料含 `rainOk` 標記時才出現「雨天可」、計數（role=status）、卡片（名稱、韓文名、區域、類型、雨天標籤、適合情境、地圖／詳情）。空資料與無篩選結果各有空狀態，後者附「清除篩選」。

### 工具（`#/tools`）

住宿（精確才有門牌與 primary「給司機看」，否則警示與「地圖（僅區域）」）、預約摘要、行程地點快速查（icon button 需 aria-label）、機場交通、官方連結（有 URL 才渲染）、設定與資料（動畫開關、模式、版本、更新時間、schema、驗證警告、重新載入）。

### 覆蓋層

- `AddressDialog`（給司機看）：韓文名 28px、韓文地址 24px、中文識別、精度標籤、複製名稱／地址、行內狀態文字。approximate 顯示地址但警示；area-only／unknown 不顯示可誤認為門牌的文字，「複製地址」停用。
- `MapMenuDialog`：Naver／Kakao／Google 三個入口；有經核對連結用 primary＋「已核對」，否則標「（搜尋）」並顯示查詢字串；區域級位置附警示。
- 兩者都用原生 `<dialog>`：`showModal()`、Esc、點背景關閉、關閉後焦點回到觸發元素、開啟時鎖 body 捲動。手機為底部 sheet，≥720px 置中。

## 4. 響應式規則

- 360–430px 優先；320px 不可橫向溢出（`overflow-wrap: anywhere`、按鈕列 `auto-fit minmax(96px,1fr)`、篩選 chip 換行）。實測 360px 溢出 0px。
- 平板／桌機：內容置中 640px，底部導覽同寬；對話框置中。
- safe-area：頁首 `padding-top` 與底部導覽、對話框 `padding-bottom` 皆加 `env(safe-area-inset-*)`；`main` 預留 `56px + safe-bottom + 24px`。
- 使用 `100dvh` 處理手機瀏覽器工具列。

## 5. 動畫規格

| 效果 | 實作 | 停止條件 |
| --- | --- | --- |
| 背景場景 | `app/SeaBackdrop.tsx`：`position: fixed; inset: 0; z-index: -1`（在 `.shell` 的 stacking context 內墊底），內含：沙→淡海色垂直漸層、右上日出光暈、頁首後方的廣安大橋線稿（`xMidYMax slice`：手機看到主跨兩塔、桌機看到整座橋，opacity 0.16）、畫面下半 54／42／30vh 三層浪帶＋一條線稿浪紋 | 靜態部分永遠顯示 |
| 浪帶橫移 | 每層 SVG 寬 200%，path 週期 = 50%，`translateX(0 → -50%)` linear infinite → 無縫循環；28s／37.8s（反向）／47.6s | 使用者關閉、系統 reduce-motion、分頁進入背景 |
| 光暈呼吸 | opacity 0.7 ↔ 1，16s ease-in-out alternate | 同上 |
| 海鷗 | 兩個 26×14／18×10 SVG，`translate` 從畫面左外側到右外側（`100vw`）7s／8s 一次；`onAnimationEnd` 移除並寫 `sessionStorage` | 同上；每個 session 只飛一次 |
| 微動態 | 按鈕 `:active scale(.98)`、日期狀態顏色 120ms、展開內容 opacity 180ms、chevron 旋轉、sheet 上移 12px | reduce-motion 時 transition 縮到 0.01ms |

機制：`<html data-motion="on|off">` 由偏好＋系統設定決定；`.motion-decor` 元素在 off 時 `animation: none`；`<html data-decor-paused="true">` 由 `visibilitychange` 設定（背景固定於視窗，不需 IntersectionObserver），使 `animation-play-state: paused`。全部 `aria-hidden`、`pointer-events: none`、不改變版面尺寸、不用 React state 驅動每一幀。

## 6. 文案規則

- 介面台灣繁體中文；韓文地名、地址、必要英文名保留原文並標 `lang="ko"`。
- 估計值前綴「約」；未知一律「待確認」；不使用「應該」「大概沒問題」。
- 示範資料：頁首「示範資料」標籤＋「示範日期，正式日期待確認」；備案／工具頁頂部一行淡色提示。
- 可讀性守則：內容一律放在白卡片或不透明沙色列（sticky 日期列、底部導覽、demo 提示列）上；不在背景場景上直接放正文。
- emoji 不用；icon 只用線稿 SVG（`src/ui/Icons.tsx`）。

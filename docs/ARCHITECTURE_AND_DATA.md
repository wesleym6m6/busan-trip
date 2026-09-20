# 架構與資料

## 1. 正式入口

`main.tsx` → `App.tsx` → `approved/ApprovedTrip.tsx` → `approved/view.tsx`。
React 19 + TypeScript + Vite；純靜態網站。`ApprovedTrip` 保存原匯出的互動邏輯，view 對應原模板，`approved.css` 保存動畫與 active 樣式。

2026-09-20 使用者另行要求改善新增內容後的排版。`ContentCards.tsx` / `content-cards.css` 負責行程卡與餐廳備案的分段、字級及間距；日期、四分頁、工具、打包與海岸頁首仍由原模組負責。這次授權及驗證見 [LAYOUT_UPDATE_20260920.md](LAYOUT_UPDATE_20260920.md)。

## 2. 設計和資源

原件位於 `design/approved-2026-09-15/`，manifest 記錄來源檔與 `public/uploads/` 五張 PNG 的 SHA-256。原件只留一份；PNG 以原始位元保留。`approved/assets.ts` 依 Vite BASE_URL 解決 project Pages 子路徑。

2026-09-16 依使用者品質優先的要求改善載入：五張 RGB 插圖使用原尺寸、逐像素相同的 `.lossless.webp` 副本，`assetUrl` 集中映射，原始 PNG 完整保留。海鷗因瀏覽器透明像素差異保留 PNG；HTML 預載頁首三張素材。驗證與容量比較見 [PERFORMANCE_20260916.md](PERFORMANCE_20260916.md)。

## 3. 狀態與外部來源

`busan-selected-day`、`busan-reduce-motion` 和 `busan-fx-v1` 的 localStorage 鍵保留。打包清單改用 `busan-pack-v2` 保存個人分類、項目及勾選，首次載入仍讀取 `busan-pack-v1` 的有效布林勾選，不刪除舊鍵。新部署網域與 Claude 預覽網域的 localStorage 不共用，已勾項目不會自動跨網域搬移。

`PackingList.tsx` 管理個人清單、編輯草稿與一次移除復原；`packingStorage.ts` 驗證並讀寫 `{ version: 2, groups, checked }`。只儲存個人新增內容與勾選，原清單仍由正式資料提供，既有 13 個 item ID 不變。元件在切換分頁時保留掛載，使用 `hidden` 隱藏，草稿及無法儲存時的暫存不因切換而消失。同來源分頁透過 storage event 更新；儲存前比對讀取時的原始快照，若資料已變更則載入最新版並提示重試，避免一般舊分頁操作覆蓋新內容。此檢查不是跨程序交易鎖。損壞紀錄或儲存失敗會顯示提示，沒有伺服器備份。功能與驗證見 [PACKING_20260920.md](PACKING_20260920.md)。

日期按 Asia/Seoul 判斷，保留原匯出所選日期優先的行為。匯率取 `https://open.er-api.com/v6/latest/KRW`，保留 24h 快取、上次資料和手動輸入行為。未加入 Service Worker 或跨裝置同步。

## 4. 資料契約

`src/data/approved-trip.json` 從已核閱的定案原件 `buildTripData` / `PLACES` / `STATUS_META` 擷取；`ApprovedTripSchema` 定義形狀，`validateApprovedTripData` 驗證重複日期/ID、地點與備案引用、圖片路徑與地圖搜尋 URL。`npm run validate:data` 會驗證正式資料，再驗證歷史 demo。

- `trip`: 名稱、顯示日期字串。
- `days`: id、日期、顯示文字、可選主題圖、依順序呈現的 items。
- `items`: event/transit、time 顯示字串、title、可選 steps/note/placeKey/status。`steps` 是收合時也能讀到的當天行動或重要限制，`note` 是展開後的當次安排。
- `items.visitMinutes?`: `{ min, max }` 正整數分鐘區間，僅供 event。這是停留預算，不是營業時間、預約、交通或保證候位時間；max 不得小於 min。沒有合理預算的項目可省略。
- `items.illustrationKey?`: 引用 `src/data/card-illustrations.json` 的裝飾插圖鍵，只允許 event。圖片跟著 item 保存，不以日期索引或標題比對推測；調整行程順序仍保留正確配圖。省略時自然呈現純文字卡片。catalog 記錄公開相對路徑、原始寬高和 `cutout`／`scene` 邊緣處理；`validate:data` 另檢查檔案存在及路徑、尺寸、處理方式。
- `backupGroups`: 所屬 dayId、標題，以及各組的 `mainPlaceKey`、`backupPlaceKey`、可選 `otherPlaceKeys` 和選擇說明 `note`。引用共用地點，不另存店名、介紹或地圖 URL。
- `tools`: fixed 航班票券、transit 交通、todo 待辦、address 地點快查。`address` 各項僅存 `placeKey`，名稱與地圖從共用地點衍生。
- `packing`: 類別與穩定 item id；ID 用於本機勾選保存。
- `lodging`: 原件中的區域、附近地標韓文地址及待確認說明，沒有新增精確住宿門牌。
- `places`: `label`、Naver 搜尋詞 `query`，可選的 `description`（自然、具體的一句介紹）與 `details`（菜色、入口、已查證規則等）。行程展開區與備案共用；只在這趟成立的時間、分桌與取捨放回 item，不寫入場所事實。
- `statusMeta`: 狀態文案/色彩。

展開內容將場所 description、details、當次 note 依序分段呈現，不先拼接成一個字串；三者皆空才不顯示展開控制。備案的 description 直接可見，details 由每間餐廳獨立展開；這項暫時狀態不持久化。空 steps 不製造佔位文字。`splitTime` 保留時刻或時段後的限制詞，像「11:00 前」「15:50 台灣時間」，不把字尾丟掉。

資料驗證涵蓋日程、備案的主／備／其他選項與工具地址的引用，及停留時間正整數與前後順序。連結一律由 query 經 encodeURIComponent 組成 Naver search URL，不製造未查證的 place ID。

2026-09-21 使用者確認逐卡重繪圖後，要求正式整合進卡片。`CardIllustration` 由 catalog 與 `assetUrl` 取圖，圖片為 `alt=""`／`aria-hidden` 的非必要裝飾；載入失敗直接移除，文字恢復完整空間。`ContentCards` 保留標題、時間、狀態、地圖與詳情完整寬度，只讓摘要文字在右側小圖旁自然環繞，長文接續至圖下。原圖保留於 `design/card-illustrations-2026-09-21/`（既有三張圖沿用原有來源），公開副本維持原解析度與無損 RGBA；新增圖片 lazy load，不加入裝飾動畫。

來源優先順序：使用者最新行程表決定安排、預約與候選；店家／營運方資料補充場所事實；編輯推算只作停留預算或條件提醒。查證日、來源與未解衝突維護在 [CONTENT_SOURCES_20260920.md](CONTENT_SOURCES_20260920.md)。資料寫入不代表航班或所有日期敏感資訊已獲第三方保證。

2026-09-16 內容依使用者新版行程表及明確回覆更新，詳見 [CONTENT_UPDATE_20260916.md](CONTENT_UPDATE_20260916.md)。資料形狀與 UI 未變；packing 的既有 id 保留。Google 原表與私人票券資訊不進 repo；公開資料只含必要航班時間、人數與地圖搜尋詞。工具頁 fixed 的 booked=false 會顯示「未購買」，不能拿來表示訂購狀態未知；未知的展覽門票放 todo 確認。

2026-09-20 採用上述共用場所與停留預算契約，整份靜態資料同步遷移，沒有外部 API 消費者或需遷移的持久化行程資料。該次內容更新未改 localStorage 鍵或 packing ID；後續個人打包功能的 v2 儲存契約見第 3 節。當次來源同步及驗證見 [CONTENT_UPDATE_20260920.md](CONTENT_UPDATE_20260920.md)。

## 5. 歷史模組與部署

`LegacyApp`、原 `app/`、`features/`、`ui/`、`styles/`、原 TripDataFileSchema 和 demo fixture 保留供歷史參考/測試；主入口不使用它們，也不依賴 VITE_DATA_MODE。不能改回 demo 當作正式資料 fallback。

GitHub Pages 維持 workflow_dispatch 手動部署；已依後續使用者要求啟用 Pages，詳見 DEPLOYMENT.md。正式建置只需 VITE_BASE_PATH，內容直接打包進網站，沒有後端或帳號。

## 6. 2026-09-16 頁首

view.tsx → CoastalHeader（獨立海鷗陣列、素材載入、可見性）→ SeaCanvas / seaRenderer / surfMotion（固定前景、生成海面底圖與原圖碎浪的 WebGL 分層合成）。ApprovedTrip 僅傳入切日序號與減少動態偏好；不再使用單一 showGull 或共用結束計時器。詳見 HEADER_MOTION.md。

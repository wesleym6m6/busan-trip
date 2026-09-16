# 架構與資料

## 1. 正式入口

`main.tsx` → `App.tsx` → `approved/ApprovedTrip.tsx` → `approved/view.tsx`。
React 19 + TypeScript + Vite；純靜態網站。`ApprovedTrip` 保存原匯出的互動邏輯，view 對應原模板，`approved.css` 保存動畫與 active 樣式。

## 2. 設計和資源

原件位於 `design/approved-2026-09-15/`，manifest 記錄來源檔與 `public/uploads/` 五張 PNG 的 SHA-256。原件只留一份；PNG 以原始位元保留。`approved/assets.ts` 依 Vite BASE_URL 解決 project Pages 子路徑。

2026-09-16 依使用者品質優先的要求改善載入：五張 RGB 插圖使用原尺寸、逐像素相同的 `.lossless.webp` 副本，`assetUrl` 集中映射，原始 PNG 完整保留。海鷗因瀏覽器透明像素差異保留 PNG；HTML 預載頁首三張素材。驗證與容量比較見 [PERFORMANCE_20260916.md](PERFORMANCE_20260916.md)。

## 3. 狀態與外部來源

`busan-selected-day`、`busan-pack-v1`、`busan-reduce-motion` 和 `busan-fx-v1` 的 localStorage 鍵保留。新部署網域與 Claude 預覽網域的 localStorage 不共用，已勾項目不會自動跨網域搬移。

日期按 Asia/Seoul 判斷，保留原匯出所選日期優先的行為。匯率取 `https://open.er-api.com/v6/latest/KRW`，保留 24h 快取、上次資料和手動輸入行為。未加入 Service Worker 或跨裝置同步。

## 4. 資料契約

`src/data/approved-trip.json` 從已核閱的定案原件 `buildTripData` / `PLACES` / `STATUS_META` 擷取；`ApprovedTripSchema` 定義形狀，`validateApprovedTripData` 驗證重複日期/ID、地點與備案引用、圖片路徑與地圖搜尋 URL。`npm run validate:data` 會驗證正式資料，再驗證歷史 demo。

- `trip`: 名稱、顯示日期字串。
- `days`: id、日期、顯示文字、可選主題圖、依順序呈現的 items。
- `items`: event/transit、time 顯示字串、title、可選 steps/note/placeKey/status。
- `backupGroups`: 所屬 dayId、標題與主/備選餐廳搜尋連結。
- `tools`: fixed 航班票券、transit 交通、todo 待辦、address 地點快查。
- `packing`: 類別與穩定 item id；ID 用於本機勾選保存。
- `lodging`: 原件中的區域、附近地標韓文地址及待確認說明，沒有新增精確住宿門牌。
- `places` / `statusMeta`: 地圖 query 和狀態文案/色彩。

空 note 代表沒有額外詳情，不製造空白展開。空 steps 不製造佔位文字。此資料是使用者定案內容，並不表示本輪重新向第三方核實了航班/營業時間/預約。

2026-09-16 內容依使用者新版行程表及明確回覆更新，詳見 [CONTENT_UPDATE_20260916.md](CONTENT_UPDATE_20260916.md)。資料形狀與 UI 未變；packing 的既有 id 保留。Google 原表與私人票券資訊不進 repo；公開資料只含必要航班時間、人數與地圖搜尋詞。工具頁 fixed 的 booked=false 會顯示「未購買」，不能拿來表示訂購狀態未知；未知的展覽門票放 todo 確認。

## 5. 歷史模組與部署

`LegacyApp`、原 `app/`、`features/`、`ui/`、`styles/`、原 TripDataFileSchema 和 demo fixture 保留供歷史參考/測試；主入口不使用它們，也不依賴 VITE_DATA_MODE。不能改回 demo 當作正式資料 fallback。

GitHub Pages 維持 workflow_dispatch 手動部署；已依後續使用者要求啟用 Pages，詳見 DEPLOYMENT.md。正式建置只需 VITE_BASE_PATH，內容直接打包進網站，沒有後端或帳號。

## 6. 2026-09-16 頁首

view.tsx → CoastalHeader（獨立海鷗陣列、素材載入、可見性）→ SeaCanvas / seaRenderer / surfMotion（固定前景、生成海面底圖與原圖碎浪的 WebGL 分層合成）。ApprovedTrip 僅傳入切日序號與減少動態偏好；不再使用單一 showGull 或共用結束計時器。詳見 HEADER_MOTION.md。

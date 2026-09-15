# 釜山家庭旅行

2026/10/03–10/07，10 人家庭旅行手機網站。正式入口已更新為使用者於 **2026-09-15 定案的 Claude Design 版本**，保留配色、字體、插圖、排版及操作體驗。

- 行程／備案／工具／打包四分頁。
- 五天真實行程、卡片詳情與 Naver 地圖搜尋。
- 韓元換算、24 小時匯率快取與手動輸入。
- 日期選擇、打包清單和減少動態偏好保存在本機。

## 開發

使用 Node 22 LTS（≥22.12）：

```sh
npm ci
npm run dev
npm run check
```

測試 GitHub Pages 子路徑：

```sh
VITE_BASE_PATH=/busan-trip/ npm run build
VITE_BASE_PATH=/busan-trip/ npm run preview
```

開啟 `http://127.0.0.1:4173/busan-trip/`。若 Node 25 的 localStorage 與 jsdom 衝突，執行 `NODE_OPTIONS=--no-experimental-webstorage npm run check`。

## 維護

行程資料在 `src/data/approved-trip.json`；樣式與操作在 `src/approved/`。後續維護技術與內容時保留定案外觀和體驗，詳見 [接手規範](AGENTS.md)。

原始 `.dc.html`、五張 PNG 的雜湊及版本來源保存在 [設計基準](design/approved-2026-09-15/manifest.json)。Claude 匯出依賴缺少的 `support.js`；正式網站已改為 React/Vite，無須 Claude 執行環境。原件不作為可直接部署的 HTML。

[移植驗證](docs/PORT_VERIFICATION.md)記錄本輪檢查與限制。舊三天 demo 的程式及測試保留為歷史參考，正式入口不讀取 demo。

## 發布狀態

本輪更新 GitHub 程式碼；GitHub Pages 尚未啟用（2026-09-15 查詢回傳 404）。部署 workflow 保留手動觸發。之後要發布時，在 Settings → Pages 選 GitHub Actions，再執行 Deploy to GitHub Pages。

網站目前沒有 Service Worker；本機保存勾選或快取匯率不等於整站可離線啟動。字型使用 Google Fonts，匯率需要網路或上次成功的快取，外部地圖由 Naver 提供。

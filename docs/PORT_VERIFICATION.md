# 定案版移植驗證 — 2026-09-15

本次驗證對象為使用者提供的 BuShan-Claude 定案匯出及其 React/Vite 移植；沒有再次設計。原件與五張 PNG 的 SHA-256 見 design/approved-2026-09-15/manifest.json。

| 檢查 | 結果 | 證據/範圍 |
| --- | --- | --- |
| 原件與圖片位元保存 | PASS | 6 個檔案 SHA-256 全數相符；canonical PNG 未壓縮或重繪 |
| 行程資料移植 | PASS | 從核閱後原件擷取的資料與 approved-trip.json deep equality：5 天、33 個 event、14 個 transit、16 張補充詳情、13 個打包項目 |
| 原始 CSS | PASS | 原件 style block 規則保留（移除行尾空白）；inline style/SVG 模板轉 React，active 樣式改 CSS class |
| 自動檢查 | PASS | typecheck、lint、37 tests（6 files）、資料驗證、Vite build |
| GitHub Pages 子路徑 | PASS | 本機 production preview 在 /busan-trip/ 實際載入；圖片來源也帶此子路徑 |
| 手機排版 | PASS | Chrome 實際 viewport 360 / 390；首屏及四分頁檢查，無橫向溢出；見 screenshots/approved-2026-09-15 |
| 五天與卡片 | PASS | 瀏覽器實際切過五天，16 張可展開卡片逐一點擊且內容非空；detail-checks.json |
| 備案 | PASS | 第五天空狀態、切換全部餐廳與湯飯插圖 |
| 匯率 | PASS | 瀏覽器取得參考匯率；手動 0.025 × 10,000 = 250；自動測試另覆蓋 0、空值、負數、無效輸入與快取 |
| 打包與選日保存 | PASS | 勾選後 reload 保留；reload 仍顯示原選第五天；測試資料最後復原 |
| 動態 | PASS（限定範圍） | 切日可見海鷗；海浪 computed animation names 正確且 running；減少動態勾選後四個 path 均 paused |
| 字型與圖片 | PASS | 瀏覽器 fonts loaded，海岸、甘川、膠囊、湯飯可見，切日可見海鷗；原始 5 圖檔完整 |
| Console | PASS | 本機測試頁未記錄 error/warn |
| 逐像素對照 Claude 現場渲染 | NOT TESTED | 來源一致性與本機目視驗證，不宣稱跨渲染器像素完全相等 |
| 真機 Safari / 螢幕閱讀器 / 200% zoom | NOT TESTED | Chrome 桌面尺寸模擬不代表真機驗收 |
| 整站離線啟動與旅行日期邊界 | NOT TESTED | 沒有 Service Worker；快取與本機保存不等於整站離線 |
| 正式 GitHub Pages | NOT DEPLOYED | 本輪更新 repo，Pages API 404，未啟用部署 |

環境：Node 25.8.1，使用 `NODE_OPTIONS=--no-experimental-webstorage VITE_BASE_PATH=/busan-trip/ npm run check`；CI 使用 Node 22。Build 出現 Zod 上游 pure annotation 的非阻塞提示，建置成功。Chrome 截圖可能包含瀏覽器擴充功能的浮動圖示，不屬於網站。

技術差異：移除正式頁面對 Claude support.js 的依賴；資料獨立 JSON/schema；圖片依 base path 載入；動畫 frame/timer 在 unmount 清理。其餘配色、字型、SVG、圖片、文字與操作流程沿用定案版。未重新核實旅行業者的即時資料。

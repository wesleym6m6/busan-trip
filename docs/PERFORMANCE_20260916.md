# 2026-09-16 無損載入改善

使用者要求加速載入，但不犧牲畫質、內容或已定案體驗。本輪採用逐像素比較通過的素材副本與較早下載的資源提示。

## 實際採用

- 原始 PNG 全部保留，位元與 provenance metadata 不變。五張 RGB 插圖另提供原尺寸 `.lossless.webp`；`assetUrl` 只對清單中的五張圖使用副本。
- HTML 預載海岸、海浪底圖與原始 PNG 海鷗，不必等主程式執行才發現資源。海岸與底圖設高優先序；fonts.gstatic.com 加入 preconnect。字型 URL、字重與顯示方式原樣保留。
- 海鷗 WebP 候選的檔案 RGBA 完全相同，但 Chrome canvas 解碼後有 130,325 個像素差異（半透明處理路徑不同）。因此排除該副本，海鷗繼續使用原始 PNG。
- 沒有縮圖、量化、降低解析度、刪除內容或降低動畫更新率。JSX、CSS、動畫演算法、姿態、路徑、本機儲存鍵與行程 JSON 均未改。

## 檔案大小（bytes，非載入秒數）

| 素材 | 原 PNG | 實際使用 | 減少 |
|---|---:|---:|---:|
| 海岸 | 2,207,760 | 1,697,126 | 23.1% |
| 海浪底圖 | 2,000,655 | 1,568,506 | 21.6% |
| 海鷗 | 853,045 | 853,045 | 保留原檔 |
| 村落插圖 | 2,294,567 | 1,486,260 | 35.2% |
| 膠囊列車 | 2,388,635 | 1,676,084 | 29.8% |
| 豬肉湯飯 | 2,028,658 | 1,319,600 | 35.0% |
| **頁首三張** | **5,061,460** | **4,118,677** | **18.63%** |
| **全部使用中圖片** | **11,773,320** | **8,600,621** | **26.95%** |

全部圖片不是每次首屏一起下載；其他日期及備案圖片仍依既有流程載入。舊 seagull.png 未被正式入口使用，不計入上表。原主程式實際 gzip 傳輸約 101,004 bytes，圖片才是主要容量，本輪不更換框架或拆改互動程式。

上述是確定的下載量改善，不能當作手機載入秒數的改善比例；CPU、連線、快取及 Google Fonts 仍影響實際時間。未做真實手機網路節流跑分，也未宣稱已解決前一輪無法重現的手機間歇載入問題。

## 品質驗證與重現

使用 Pillow 12.3.0 / libwebp 1.6，以 `lossless=True, quality=100, method=6, exact=True` 生成副本。此 quality 是無損編碼效率，不是有損畫質。五張來源為 RGB，沒有 ICC／gamma／EXIF 轉換；原始檔完整保留。

- `python3 scripts/verify-lossless.py`（需要 Pillow WebP）：原檔與副本雜湊、尺寸、全部 RGBA 位元組、色彩描述及大小均通過；見 `performance/lossless-candidates.json`。
- Vite dev server 開啟 `scripts/qa/lossless.html`，按「驗證圖片與海浪」：Chrome 解碼的五張圖全部零像素差異。
- 同頁比較原 PNG 與 WebP 的 WebGL 合成：360／390／1280px，0／1.5／3／5.5／8 秒，共 15 組零像素差異；另確認輸出非空白，0→1.5 秒確有變化，排除兩張空白的假通過。結果見 `performance/browser-pixels.json`。
- `NODE_OPTIONS=--no-experimental-webstorage VITE_BASE_PATH=/busan-trip/ npm run check`：typecheck、lint、43 tests、資料驗證與 Pages 子路徑建置通過。

正式建置另以 Chrome 390px 檢查五天圖片、四分頁與海面執行；360px 目視檢查版面。圖片均載入成功，連續切日保留兩個獨立海鷗，海面 playing=true，console error/warn 為空。字型、內容與所有原始 PNG 的 git diff 為零。

QA 頁與驗證腳本不打包進正式入口。原圖、動畫與行程基準未改；本機備份 tag `backup/performance-before-20260916` 指向 `be6732a`。部署與公開站確認見 `DEPLOYMENT.md`。

參考：[Google WebP 無損與 exact](https://developers.google.com/speed/webp/docs/cwebp)、[MDN preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload)、[MDN fetchpriority](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/fetchpriority)。

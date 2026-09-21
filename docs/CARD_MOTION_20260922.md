# 行程卡片互動（2026-09-22，本機預覽）

使用者已同意上一輪提出的「按壓回饋＋連續展開收合＋插圖首次浮現」，並強調品質。這次為既有卡片的局部互動調整；日期切換、新手勢、個別圖層動畫及發布不在這次實作範圍。

## 實作

- 按壓：底色與內框回饋，按下 60ms／放開 120ms，文字與卡片本體不縮放、不位移。
- 詳情：原本條件掛載＋淡入改為常駐的 CSS grid disclosure，0fr／1fr 在 260ms 內切換，箭頭同步，透明度 180ms。內容可即時反向，不設操作鎖或計時器。border／padding 全部位於內層，收合後為 0px，不預留圖片或動畫空間。
- 關閉中的詳情立即設為 inert／aria-hidden；visibility 在收合結束後隱藏。鍵盤焦點維持在控制按鈕。這次詳情沒有可聚焦的內部控制項。
- 插圖：IntersectionObserver 搭配圖片載入事件；可見且成功載入後執行一次 320ms、5px 的浮現。未載入、失敗、不支援 API 都不隱藏行程文字。動畫作用於 img，不改變 float 的尺寸、文字環繞或卡片幾何。
- CardMotionProvider 保存本次頁面生命週期已看過的卡片 key，切日期與分頁不重播；重新載入頁面重新開始。系統減少動態偏好即時監聽，與原站設定共同停用額外動畫。元件卸載或偏好變更時取消動畫及 observer。
- 保留水彩原圖、行程資料、39 張活動卡、9 筆交通提示、四分頁與海岸頁首。沒有新增依賴。

## 驗證

先對修改前的 4180 preview 記錄 baseline，瀏覽器測試確認舊版無展開中間高度，出現預期失敗：`opening must have intermediate heights, not jump`。加入實作後相同測試通過。

- PASS：`NODE_OPTIONS=--no-experimental-webstorage VITE_BASE_PATH=/busan-trip/ npm run check`，65 tests、型別、lint、資料驗證與正式建置通過。Rollup 仍提示 Zod 原有 PURE 註解位置警告，沒有編譯錯誤。
- PASS：Chromium 真實瀏覽器，320／360／390／1024px × 五天，156 張收合卡片高度與圖片寬度逐筆等於修改前，無橫向溢出。
- PASS：展開記錄到 17 個不同高度，標題位置保持一致；收合存在中間高度、65ms 時反向可恢復展開，完全收合後回到原高。
- PASS：Enter／Space、焦點留存、收合立即 inert／aria-hidden、系統與站內減少動態皆立即呈現結果。
- PASS：360／390px 共 74 次可展開卡片檢查（減少動態模式），內容完整、無溢出、收回後高度恢復。兩張無補充資訊的卡片維持沒有展開控制。
- PASS：插圖首次可見有動畫，滑回及切日返回不重播，插圖動畫前後卡片高度一致。瀏覽器無 runtime error。
- PASS：四分頁切換；既有 65 項測試另涵蓋圖片失敗後仍可閱讀及開地圖、備案、工具、打包保存。
- 視覺：已查看 390px 展開、360px 收合截圖，以及 app 內預覽的湯飯長內容展開／捲動。
- NOT TESTED：真實 iPhone Safari、螢幕閱讀器、低階手機實測幀率。本次沒有發布，GitHub Pages 仍為上一版。

原始 baseline、動畫逐幀高度、結果 JSON 與截圖：工作區 `outputs/busan-card-motion-20260922/`（repo 外）。

重跑：先啟動 `/busan-trip/` preview；以 `QA_BASE_URL` 指定 URL、`QA_OUTPUT_DIR` 指定證據目錄。修改前用 `MODE=baseline node scripts/qa/card-motion.mjs` 記錄基準；修改後執行 `node scripts/qa/card-motion.mjs`。預設為 4180 與 `/tmp/busan-card-motion`。不要拿修改後的新基準宣稱與修改前一致。

## 後續發布

使用者要求直接上線後，已由 Run `35627597788` 发布來源 `7ddca7b`，正式網站另完成同一套瀏覽器驗證與 37 檔案位元核對。以上「本機預覽／未發布」描述為實作完成當時的狀態，最新發布證據見 [DEPLOYMENT.md](DEPLOYMENT.md)。

# 發布紀錄

## 2026-09-16 首版：局部扭曲碎浪與獨立海鷗（歷史紀錄）

正式網址：https://wesleym6m6.github.io/busan-trip/

部署來源：`253bb43a5a04ebc25903acd3bdfdf33b8b9f92e8`。
[GitHub Actions](https://github.com/wesleym6m6/busan-trip/actions/runs/34994654332) 建置與部署均 success，40 tests 通過。

正式站已確認 WebGL 海面正在播放、原圖與新海鷗素材完整載入。連續切三日的三個獨立 id 在途中均保留，左右飛出後各自移除，最後數量為 0；過程見 `screenshots/header-motion-20260916/live-flight-check.json`。正式站未記錄 console error/warn。

技術選擇、素材、限制與備份見 [HEADER_MOTION.md](HEADER_MOTION.md)。原定案版保留在 `backup/header-before-20260916`，其他畫面與行程未改。真實手機 Safari 仍未實測。

## 2026-09-15 初次發布（歷史紀錄）


2026-09-15，使用者要求提供家人可試用的連結，授權發布現有定案版。

網址：https://wesleym6m6.github.io/busan-trip/

GitHub Actions 執行：https://github.com/wesleym6m6/busan-trip/actions/runs/34990918223

已部署來源：`5abd6d8e0ad4b2fe7d134624f2993549e5233641`。建置與部署 success，37 tests 通過；正式 URL HTTP 200，瀏覽器已確認五天日期、行程首屏、圖片、卡片內容與工具頁。部署使用 HTTPS，不需登入。Workflow 維持手動觸發。

## 動態驗收分開判斷

- 海鷗：PASS。正式站切日後連續截圖可見不同位置；transform x 從 -6 → 10 → 37px，opacity 達 1，肉眼可辨識。
- 海浪執行：PASS。正式站連續取樣的 transform / opacity 確實變化，並非只宣告動畫名稱。
- 海浪明顯度：NEEDS IMPROVEMENT。振幅總差約 4px、週期 9–13s，疊在已包含浪花的插圖上，變化非常細微；不能宣稱達到使用者強調的肉眼清楚可見。
- 卡片：內容與展開/收合、箭頭轉向正常；200ms 淡入/旋轉樣式存在，終點狀態正確。本輪未捕捉短過渡的完整逐幀序列，不將其誇大為全面動態視覺驗收。
- 底部指示線：切換工具/行程後 left 187.5 → 0px，220ms transition 存在，狀態正確；同樣未完整逐幀量測。
- 真機 Safari 與不同手機的動態表現尚未實測。

本輪沒有修改動畫或定案美術。若之後要求改善海浪，限於動態可辨識性調整，保持圖片、配色、版型與操作流程；不要重新套用早期斜白條效果。

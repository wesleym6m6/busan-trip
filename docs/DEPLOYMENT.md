# 發布紀錄

## 2026-09-16 最新：保持畫質的載入改善

正式網址：https://wesleym6m6.github.io/busan-trip/

部署來源：`c796ae3bbf6e63d215343a1867b9058d5c6eef2a`。[GitHub Actions](https://github.com/wesleym6m6/busan-trip/actions/runs/35114926108) build / deploy 均 success；typecheck、lint、43 tests、資料驗證與 Pages build 通過。上傳後整個 GitHub tree `250f4d4aa9452bce03b5ed3077d79a822d287cd6` 與本機測試版本完全一致。

公開站 HTML、`index-B6H_mOif.js`、五張 `.lossless.webp` 與原始海鷗 PNG 全部 HTTP 200，下載位元與本機正式 build 完全相同。Chrome 正式站已確認三張 header preload、五張新圖全部正常載入、海鷗仍用 PNG、海面 `layered-surf` / `playing=true`，連續畫面可見碎浪變化。390px 核對五天與四分頁、卡片展開有內容；360px 目視無水平溢出，console error / warn 為空。連續切日出現兩個獨立海鷗 id，原飛行未因切日移除，之後各自離場。

頁首圖片下載量 5,061,460 → 4,118,677 bytes（減少 18.63%）；全部使用中圖片 11,773,320 → 8,600,621 bytes（減少 26.95%）。這是下載容量改善，並非手機載入秒數的實測提升。原解析度、內容、字體、CSS 與動畫程式均未變；瀏覽器五張圖片與 15 組海浪合成零像素差異，詳見 [PERFORMANCE_20260916.md](PERFORMANCE_20260916.md)。真實手機 Safari 與先前間歇載入問題尚未實測／重現，不宣稱本次已修復該問題。

修改前基準 `be6732a` 保留於本機 tag `backup/performance-before-20260916`；本機通過測試的提交 `b3dd2f7` 保留於 `backup/performance-tested-20260916`。兩個 tag 尚未推到遠端；原始 PNG 完整保留，原基準也在 GitHub commit 歷史。CLI 認證無法使用，改經既有 GitHub 登入網頁與 macOS 原生檔案選擇器提交，再以公開 fetch 核對完整 tree。未更改瀏覽器擴充功能權限或手動部署設定。

## 2026-09-16 依家人確認更新行程內容（歷史紀錄）

正式網址：https://wesleym6m6.github.io/busan-trip/

部署來源：`4e7cb199589c963e8cfe6528cf1cac12eaefd06d`。[GitHub Actions](https://github.com/wesleym6m6/busan-trip/actions/runs/35109313783) 的 build / deploy 均 success；Node 22 的 typecheck、lint、測試、資料驗證與 Pages 子路徑 build 通過。手動部署設定保持不變。GitHub 完整檔案樹與本機通過 43 tests 的版本一致（tree `9947c04eb8415a94c70a5899e5c32cae8f92ec34`）。

正式站重新載入後，以 Chrome 390px 逐日確認五天新內容，無水平溢出；已確認 BIG5 未購買、10/5 08:00 出門、10/7 回台灣 9 人與哥哥續往大阪 1 人、接送預估 NT$3,000、李禹煥開館待確認，以及電子入境卡修正文案。膠囊與李禹煥詳情實際展開有內容，console error / warn 為空。

美術、CSS、UI 與動畫程式均未變；正式站海面仍為 `data-renderer=layered-surf` / `data-playing=true`。本輪確認新版內容載入及原動畫持續執行，未重新宣稱所有動態都經過逐幀驗收。360px / 390px、26 張詳情與本機保存驗證見 [CONTENT_UPDATE_20260916.md](CONTENT_UPDATE_20260916.md)；真實 iPhone Safari 尚未實測。

更新前基準為 `cf8e02b38ae679b775aa53d620adbdcb0423142a`；本機備份 tag `backup/content-before-20260916` 保留。CLI 憑證讀取失敗，因此透過既有 GitHub 登入網頁提交相同檔案，再以公開 fetch 核對完整 tree 相同；本機測試提交另保留在 `backup/content-local-verified-20260916`。兩個備份 tag 尚未推到遠端，原基準 commit 仍保留於 GitHub 歷史。

## 2026-09-16 分層碎浪，保留已滿意的海鷗（歷史紀錄）

正式網址：https://wesleym6m6.github.io/busan-trip/

部署來源：`0b3eda376e48c7896d5872229092801aba4d3087`。 [GitHub Actions](https://github.com/wesleym6m6/busan-trip/actions/runs/35036856110) 的 build / deploy 均 success；Node 22 的 typecheck、lint、43 tests、資料驗證與 Pages 子路徑 build 全部通過。手動部署設定保持不變。

正式站 Chrome 390px 已實際驗證 `data-renderer=layered-surf` / `data-playing=true`；兩張海面底圖載入後，逐幀能看見碎浪推進與泡沫變化。頁首保持 92px，無水平溢出。連續切換 10/04 與 10/05，原海鷗 id 保留至各自完整離場，最後為 0；海浪播放不中斷，console error/warn 為空。線上序列與截圖見 `screenshots/layered-surf-20260916/live-check.json`、`live-25.jpg`、`live-99.jpg`。

本機另驗證 360px、四分頁、卡片展開、減少動態與離開頁首暫停。尚未實測真實 iPhone Safari 或低階手機續航。素材 prompt、技術方案、來源查詢與備份見 [HEADER_MOTION.md](HEADER_MOTION.md)。本輪修改前（含使用者已滿意的海鷗）可由 `backup/waves-before-layering-20260916` 還原。

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

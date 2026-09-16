# 2026-09-16 行程內容更新

使用者已明確定案目前美術、排版、操作及最新海浪／海鷗動畫。本輪限於 `src/data/approved-trip.json` 與維護文件，不修改 UI、CSS、動畫、資源或資料契約。

## 來源與使用者確認

- 使用者提供的 Google 試算表「10月釜山家族遊」，只採用 10/3–10/7 釜山部分。日本住宿、餐飲與後續行程未匯入，10/7 離開釜山的分流除外。原表連結、私人訂單編號和管理連結不發布。
- 10/7 哥哥 1 人往大阪，其餘 9 人搭 BX791 回台灣。網站行程與工具航班人數已同步。
- Pass 選 BIG5，使用者說「要買」，維持未購買，未改成已訂。
- 10/5 按使用者最終決定 08:00 出門；08:30 尾浦膠囊時段不變。資料中不再保留 07:15 或已過時的 08:00–08:10 抵達時間。
- 李禹煥空間先保留，開館由家人確認。待確認文字同時出現在當日卡片與工具待辦，不標成已確認開館。
- 原表機場到住宿的「3000」幣別為台幣，顯示預估 NT$3,000。尚未提供車數、計價單位或確認報價，不當作全團已訂總價，也不套到回程。
- 入境卡改為「抵韓前 3 天內填寫（需要申報的人）」；ARTE 拼字統一。

## 每日內容

- 10/3：補上出發航廈／時間、BIG5 領卡、Catchtable 候位及宵夜選項。
- 10/4：移除甘川行程與快查連結；松島纜車提前，改味贊王富平午餐，南浦排在白淺灘前，新增 P.ARK，晚餐回廣安里。原裝飾插圖保留。
- 10/5：08:00 出門、08:30 膠囊；Outlet 午餐、Luge，回松亭搭海岸列車至尾浦；新增 Werner Bronkhorst 展、Ribs of Legend 與海雲台市場。
- 10/6：08:30 出門、09:00 SPA LAND 目標；新世界購物資訊放卡片詳情，保留待確認的李禹煥空間；更新西面餐廳、Strut Coffee 與採買安排。
- 10/7：加入 workingholiday、11:00 前退房與 9＋1 分流。原表的 11:00 是退房上限；未擅自把尚未安排的回程車時間寫成已訂。哥哥只列離開釜山的 BX122，不匯入日本行程。

行程、備案、工具交通、待辦、地圖搜尋與打包 BIG5 名稱一起更新。打包清單 id 與全部本機儲存鍵保持不變。

## 外部資訊核對

- [Visit Busan Pass 官方 2026 手冊](https://www.visitbusanpass.com/guidebook/en/visitbusanpass_guidebook_1.pdf)：已閱讀第二頁的實際分組表。BIG5 紫色 2 項可排 Skyline Luge、SPA LAND，藍色 3 項可排松島纜車、ARTE MUSEUM BUSAN、海岸列車；從首次使用起 180 天。天空膠囊另有原預訂，不混入海岸列車額度。
- [電子入境卡官方指南](https://www.e-arrivalcard.go.kr/portal/guide/eacGuide.do?locale=E)：抵達前 3 天開放，提交後 72 小時有效；適用與否仍依旅客本人身分。
- [韓國觀光公社假日表](https://english.visitkorea.or.kr/svc/contents/infoHtmlView.do?vcontsId=140038) 與 [李禹煥空間規則](https://art.busan.go.kr/index.nm?menuCd=50)：10/5 補休日，加上週一逢假日隔日休館，推算 10/6 可能補休。尚未取得 10 月特別開館公告；依使用者決定保留待確認。
- [Groundseesaw 展期](https://groundseesaw.co.kr/index.html) 涵蓋 10/5 的 Werner Bronkhorst 釜山展。購票狀態未知，只列入工具待辦，不假設已買或未買。

新增地圖為 NAVER 文字搜尋，沒有捏造 place ID、座標或精確門牌。餐廳分店／營業時間、接送車報價、航班臨時異動、當日無人機秀、SPALAND 特別休館日與百貨樓層不是本輪已完成的逐項實地驗證。

## 還原與驗證

更新前基準 `cf8e02b38ae679b775aa53d620adbdcb0423142a`，備份 tag 為 `backup/content-before-20260916`。新版內容只改正式 JSON；原匯出與此前動畫基準完整保留。

本機執行 `NODE_OPTIONS=--no-experimental-webstorage VITE_BASE_PATH=/busan-trip/ npm run check`：typecheck、lint、43 tests（8 files）、正式資料驗證與 Pages 子路徑 build 全部通過。Node 25 本機以既有 webstorage 相容參數測試；發布 CI 使用 Node 22。

Chrome 實際檢查結果：

- 390px 五天逐日開啟：26 張詳情全部有內容（6／4／7／6／3），開啟與關閉正常；各日圖片載入成功，沒有水平溢出。
- 360px 五天逐日開啟：scrollWidth 均為 360px；精簡第二、三天標題，避免新標題產生孤字。卡片主要時間、地圖按鈕及底部分頁正常。
- 五天內容、全部備案、工具頁的 BIG5 未購買、9 人回程、NT$3,000、08:00 出發、李禹煥待確認，以及打包 BIG5 名稱均在實際畫面確認。
- 打包 BIG5 勾選後重載仍為 1／13，測試後恢復未勾選；重載保留所選日期。
- 時間欄的既有呈現會省略文字後綴，因此把「11:00 前退房」和「台灣時間 15:50」補在可見 steps 中，不修改 UI 邏輯。
- 海面 DOM 為 layered-surf、playing=true；切日可見原海鷗，console error／warn 為空。Git diff 確認 src/approved、public/uploads 和資料 schema 沒有修改。

本輪沒有新增票券訂購、沒有真實 iPhone Safari 實測，也沒有重新驗收整段動畫的全部動作；沿用已定案動畫。部署與正式站確認見 [DEPLOYMENT.md](DEPLOYMENT.md)。

# 2026-09-16 頁首：分層碎浪與獨立海鷗

最新回饋：使用者滿意海鷗，但認為先前局部扭曲會拉動碎浪與石頭，不像浪打岸邊。此次只替換海浪技術，海鷗素材、飛行邏輯、CSS、頁首高度、頁首以下的版型與資料均保留。這是使用者授權的海浪改動，不代表重新開放整站美術設計。

## 備份與還原

本次修改前 main：`b548932417162115ecbe07ab6a805c8c6da74c39`，GitHub 標記 `backup/waves-before-layering-20260916`。本機 `/Users/pengweicheng/Documents/BuShan-Claude/備份_20260916_分層海浪修改前/` 留有 `busan-trip-b548932.zip` 與完整、已通過 `git bundle verify` 的 `busan-trip-history.bundle`，含使用者已滿意的海鷗版本。

更早的原定案版保留在 `backup/header-before-20260916`（a85d155）。所有還原都以新提交處理，再手動部署；不要 force push。原始 `.dc.html`、海岸圖、原始海鷗圖與 manifest 都未覆寫。

## 查詢方案與取捨

- [Motionleap 官方介紹](https://apps.apple.com/us/app/motionleap-3d-photo-animator/id1381206010)：方向箭頭、錨點、Freeze brush 與水流效果。
- [PhotoMirage 官方操作文件](https://help.corel.com/photomirage/how-to/en/official-help/photomirage/photomirage-workspace.html)：motion arrows 指定方向；錨點和遮罩把物件固定，遮罩邊緣可羽化。
- [Adobe cinemagraph 教學](https://helpx.adobe.com/ph_fil/premiere-pro/how-to/cinemagraph.html)：把動態區域以遮罩疊在固定影格上，重播檢查接點。教學從影片出發；本專案借用固定背景／動態前景的合成原則，沒有使用其影片素材。
- [Controllable Animation of Fluid Elements in Still Images](https://arxiv.org/abs/2112.03051)：單張圖、方向與區域遮罩可控制流體動畫；本專案沒有部署該研究模型。

採用網頁內的多層 2D 合成：可保留現有畫風、控制前景遮擋及減少動態，無需安裝付費 app。沒有下載網路浪花或替換海鷗，也沒有用 GIF 錄製整張畫面。這是插畫動畫，並非流體物理模擬或實拍海浪。

## 最新實作

`SeaCanvas` 等待兩張圖片完整載入，再建立 `seaRenderer`。原圖始終保留在底下；載入失敗或無 WebGL 時顯示原圖。

1. **固定原圖**：橋、城市、陽傘、乾沙灘、石頭不做座標變形。
2. **海面底色**：新增 `public/uploads/busan-sea-underpaint.png`，由原圖生成移除白浪的海面底圖，只在海水遮罩裡使用，避免移動浪花後露出原本固定的白浪。生成 prompt 與 SHA-256 見 [素材紀錄](animation-assets/sea-underpaint.md)。
3. **兩道浪頭**：從原插圖白色碎浪取出紋理；獨立平移、稍微展寬，交錯向岸推進。浪頭持續前進，到週期末消失。
4. **近岸泡沫**：較寬的一層先推進、攤開，之後回退與分散消失。柔和的區域遮罩讓泡沫分批消散，不把整片浪做同一個透明度閃爍。另允許泡沫覆上窄窄的岸邊（原圖 14px），底下沙灘保持固定。
5. **岩邊小水花**：獨立上拋與消散；三組礁石以輪廓遮罩置於前方。沒有用一顆大橢圓代替所有石頭。

所有坐標仍以 1983×793 原圖註冊，沿用 cover / 50% 62% 裁切及 92px 頁首。WebGL 現在負責圖層合成，已移除舊的海面 UV 正弦扭曲。30fps 上限、DPR 上限 2、離開頁首／頁面隱藏時暫停、減少動態顯示原圖都保留。沒有新增網站操作按鈕。

海鷗繼續使用原有三姿態 `seagull-flight-sheet.png`、穩定 flight id、36/43/55/65px、交替左右與不同弧線。切日新增一隻，既有海鷗由自己的 animationend 結束；本次沒有修改相關程式或素材。

## 本機驗收

- **PASS**：`NODE_OPTIONS=--no-experimental-webstorage npm run check`；43 tests、typecheck、lint、資料驗證、build。新增檢查推進／回退／消散、透明循環接點、固定前景坐標。
- **PASS**：Chrome 390px，連續切換 10/04、10/05、10/06，原飛行 id 保留、海浪仍在播放；約 12 秒的連續截圖中，各海鷗飛完後數量歸零。見 `screenshots/layered-surf-20260916/date-switch.json`。
- **PASS**：Chrome 360px 與 390px 無橫向溢出，頁首仍為 92px。四分頁、行程卡片展開有實際內容；頁首離開畫面會暫停，減少動態為 opacity=0 / playing=false，關閉後可恢復。
- **PASS**：固定相位 0、2、4、6、8 秒逐幀比較，浪頭、泡沫位置與密度有變化。天空／橋、陽傘內部、主石頭內部與乾沙灘取樣差異 0；前方小石頭的取樣最大差異 2/255，屬 JPEG 邊緣壓縮量級。這些是取樣驗證，不能當成所有邊界或 FPS 的量測。
- **PASS**：海鷗程式與 CSS、海鷗 PNG、原始海岸 PNG、行程 JSON 的 git diff 為空；瀏覽器未記錄 error/warn。
- **NOT TESTED**：真實 iPhone Safari、低階手機續航、所有 GPU／瀏覽器。無法建立 WebGL 時保留原靜態插圖。

截圖與取樣紀錄：`docs/screenshots/layered-surf-20260916/`。部分截圖上的粉紅浮動圖示來自瀏覽器擴充套件，非網站內容。

本機原尺寸檢查工具：啟動 Vite 後開 `/busan-trip/scripts/qa/surf.html`，可切固定秒數、播放、比較原圖；該入口與工具程式不會進入正式 production bundle，也未增加正式 UI。側錄短片放在工作區 `outputs/busan-layered-surf-20260916/分層海浪手機驗收.mp4`，由約 10fps 截圖組成，非網站實際 FPS 報告。

正式發布紀錄與線上檢查見 [DEPLOYMENT.md](DEPLOYMENT.md)。

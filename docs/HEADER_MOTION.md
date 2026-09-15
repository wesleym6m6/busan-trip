# 2026-09-16 頁首動畫更新

使用者明確要求讓原圖白色碎浪動起來，並讓每次切日新增的海鷗獨立完整飛入／飛出，有大小與方向差異。此要求只改頁首動態，其他定案 UI 與行程內容繼續保留。

## 備份

修改前 main：`a85d15572d37ebd2b75bcd7299f43c035f9cd479`。
GitHub 保留 `backup/header-before-20260916` 標記。使用者的 BuShan-Claude 資料夾另有「備份_20260916_動畫修改前」，含完整 source ZIP 與已驗證可讀的 Git bundle。原始 `.dc.html`、海岸 PNG、海鷗 PNG 與既有 manifest 均未覆寫。

需要退回時，以備份標記建立還原提交並重新部署；不要 force push 或刪除歷史。

## 技術選擇

採原圖局部動態（cinemagraph）而非 GIF。`SeaCanvas` / `seaRenderer` 用原海岸 PNG 作紋理，只變形海面遮罩內的像素，使原本白色碎浪推進、回捲。水域以外透明，繼續露出原圖，因此橋、城市、沙灘、陽傘保持不動。遮罩使用原圖座標，配合同一組 cover / 50% 62% 裁切；未加斜線、白條或另一套海浪插畫。

優點：保留原畫顏色與質感；不用下載整張動畫的重複影格；能暫停、配合手機尺寸。代價：需要 WebGL；無法建立或失去 GPU context 時顯示原始靜態圖，保持網站可用。requestAnimationFrame 上限約 30fps、畫布 DPR 上限 2，並在離開頁首或頁面隱藏時暫停。

海鷗新增 `seagull-flight-sheet.png`，由 imagegen 依原插圖風格生成三種翼姿；alpha 透明。三個實際剪裁範圍獨立，保留翼尖並校正身體位置，不裁掉中間姿態的長翅膀。

`CoastalHeader` 將每次日期切換加入獨立、穩定 id 的 flight；已在飛的個體不會被重設。大小 36/43/55/65px、左右交替、不同弧線、約 5.8–7.7 秒的飛行、不同拍翅節奏。以 transform 移動到完整畫面外；由每個 flight 自己的 animationend 移除，拍翅事件不會誤刪整隻海鷗。素材載入前的切日會保留，載入後再開始。

減少動態模式顯示原圖並停止海浪/海鷗；原本工具頁的設定入口保留。

參考：[MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)、[MDN animation-play-state](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-play-state)。

## 驗收

- 40 tests：包含新加的獨立生命週期、不同飛行參數、減少動態回歸測試；另有 typecheck、lint、資料驗證、build。
- Chrome 390px：連續切三個日期，三個 id 均持續存在，最後各自移到畫面外再移除；過程與坐標記錄於 `screenshots/header-motion-20260916/final-flight-sequence.json`。另完成 transform 版本的目視追蹤。
- 原圖海面實際變動：無海鷗的兩張影格比對，水面取樣區約 71% 像素差異 >12/255；天空/橋取樣區差異為 0。此數字只證明這組影格的變化，不作為 FPS 指標。
- 360px：無橫向溢出；離開頁首後 sea-playing=false、海鷗 animation-play-state=paused；減少動態時海面層 opacity=0、海鷗數量=0，恢復後正常播放。
- 與原定案版的第一天截圖比對：頁首下方內容取樣矩形（x=0–310, y=120–740）的每個 RGB 通道差異為 0；行程 JSON、原始海岸圖與原始海鷗圖 git diff 為空。
- 瀏覽器未記錄 error/warn。
- 未實測真實 iPhone Safari、低階手機續航、所有 GPU 的兼容性；WebGL 不可用時保留靜態圖。側錄短片取樣約 7fps，不代表網站實際更新頻率。

頁首高度、原圖裁切、日期列、下方文字與四分頁未改動。

正式發布後已再次以 transform 版本檢查完整飛行，三個 id 持續至各自離開畫面才移除，最終為 0；紀錄見 `screenshots/header-motion-20260916/live-flight-check.json`。

# 接手摘要

使用者於 2026-09-15 明確定案美術風格、內容、排版和使用體驗，並要求更新 GitHub。後續討論技術與內容，保留外觀/UX。不要繼續執行早期 review 的設計改動。

本輪完成獨立 React/Vite 移植，解決 Claude 專用模板與缺少 support.js 的依賴；保留五張 PNG、原 CSS/字型/SVG、文案及互動。原始匯出與雜湊留在 design/approved-2026-09-15，正式程式碼在 src/approved，資料在 src/data/approved-trip.json。

最先閱讀 AGENTS.md、DESIGN_SPEC.md、ARCHITECTURE_AND_DATA.md。驗證結果見 PORT_VERIFICATION.md。舊規格已封存至 docs/archive/pre-approved-2026-09-15，不作為新設計依據。

2026-09-15 已依使用者要求發布 GitHub Pages：https://wesleym6m6.github.io/busan-trip/ 。發布紀錄與動畫限制見 DEPLOYMENT.md。後續 push 不會自動部署；需手動執行 workflow。尚未做真實手機 Safari、螢幕閱讀器、整站離線啟動或旅途中實際日期的全面驗收。

2026-09-16 使用者授權頁首動態升級。使用者已滿意海鷗，其獨立個體與三姿態素材保留；後續回饋拒絕海面局部扭曲，現改為海面底圖＋分層碎浪＋固定前景。其他版面/資料保留。最新驗收與還原依據見 [HEADER_MOTION.md](HEADER_MOTION.md)。

2026-09-16 使用者明確定案目前外觀與動畫，開始以新版 Google 行程表更新內容。哥哥 1 人續往大阪、9 人回台灣；BIG5 尚待購買；10/5 確認 08:00 出門；李禹煥空間保留且開館待確認；機場至住宿 NT$3,000 是原表預估，車數與報價範圍仍未確認。詳細來源與維護範圍見 [CONTENT_UPDATE_20260916.md](CONTENT_UPDATE_20260916.md)。

2026-09-20 重新核對最新表後，整理行程文案與共用場所資料，修正時間附註並加入停留預算；再依使用者回饋改善卡片層級、間距與備案展開。李禹煥仍保留 10/6 16:00／可能休館。詳見 [CONTENT_UPDATE_20260920.md](CONTENT_UPDATE_20260920.md)、[CONTENT_SOURCES_20260920.md](CONTENT_SOURCES_20260920.md) 與 [LAYOUT_UPDATE_20260920.md](LAYOUT_UPDATE_20260920.md)。不要讀舊版 `backupGroups` 連結欄位作為目前契約。

使用者隨後明確要求發布給家人查看，GitHub Pages 已成功更新。部署來源 `18630283140d2d387499fbb0054bd740c3d486ee`，正式 JS 為 `index-BRHalZz0.js`；50 tests、完整來源樹比對、公開產物位元比對與 360 / 390px 操作檢查皆通過。發布證據與限制見 [DEPLOYMENT.md](DEPLOYMENT.md)。之後的紀錄文件提交不代表網站再次部署；工作流仍需手動觸發。

2026-09-20 使用者要求打包頁能自行新增分類與項目，並以容易操作為優先。新增 `PackingList`、`packingStorage` 與獨立樣式，提供連續新增、改名、移除與復原。個人資料只存在目前瀏覽器，v2 儲存仍相容讀取舊勾選；請勿把個人項目寫回公開行程 JSON。跨分頁同步與儲存前快照檢查需保留。功能操作、測試及未驗證範圍見 [PACKING_20260920.md](PACKING_20260920.md)，是否已上線以 [DEPLOYMENT.md](DEPLOYMENT.md) 最新紀錄為準。

打包功能已發布：部署來源 `42a192565d5cdcac879b191bb331f4fba6da165b`、Run `35487351453` 成功，正式 JS `index-C94WQP2l.js`。62 項測試、遠端來源樹、公開產物位元與手機尺寸操作檢查通過；舊勾選升級與新內容重載保存已在正式站驗證。後續文件提交不代表重新部署。

2026-09-21 使用者已確認 `busan-card-art-20260921` 的逐卡插圖修訂，要求整合進正式卡片並優先維持閱讀。新增 `items.illustrationKey` 與 `src/data/card-illustrations.json`；40 張活動卡片各有配圖、9 筆交通提示不配圖。標題保留完整寬度，右側小圖只環繞摘要文字；詳情及地圖不縮窄。新增 `CardIllustration`，來源及無損副本紀錄在 `design/card-illustrations-2026-09-21/manifest.json`。整合與驗證見 [CARD_ILLUSTRATIONS_20260921.md](CARD_ILLUSTRATIONS_20260921.md)。本次尚未發布，是否已上線仍以 DEPLOYMENT.md 為準。

2026-09-21 後續回饋修正：圖片與時間、標題、摘要共用整個 heading 的高度，不能重新包進有獨立留高的摘要區。圖片在 360／390px 分別為 72／80px，較寬卡片 88px；保留大圖可讀性，風景圖改以 cover 填滿真正的遮罩範圍。使用者明確要求移除哥哥續程，不留替代說明，來回航班不標人數；行程及工具頁均已同步，現為 39 張活動卡與 9 筆交通提示。最新驗證見 [CARD_DENSITY_20260921.md](CARD_DENSITY_20260921.md)，仍未發布。

2026-09-21 使用者已要求上線。卡片插圖、緊湊排版及航班文案修正已發布：來源 `89bfa102be25a7d53c7eb4ca0387e0e63f10ab9f`，Run `35616292499` 成功。正式 JS `index-BwjhgvNj.js`；37 個公開產物與本機位元一致，五天 39 張卡片插圖載入、四分頁及日期保存通過。完整證據與驗證範圍見 [DEPLOYMENT.md](DEPLOYMENT.md)。

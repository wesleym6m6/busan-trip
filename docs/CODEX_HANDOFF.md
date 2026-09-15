# 接手摘要

使用者於 2026-09-15 明確定案美術風格、內容、排版和使用體驗，並要求更新 GitHub。後續討論技術與內容，保留外觀/UX。不要繼續執行早期 review 的設計改動。

本輪完成獨立 React/Vite 移植，解決 Claude 專用模板與缺少 support.js 的依賴；保留五張 PNG、原 CSS/字型/SVG、文案及互動。原始匯出與雜湊留在 design/approved-2026-09-15，正式程式碼在 src/approved，資料在 src/data/approved-trip.json。

最先閱讀 AGENTS.md、DESIGN_SPEC.md、ARCHITECTURE_AND_DATA.md。驗證結果見 PORT_VERIFICATION.md。舊規格已封存至 docs/archive/pre-approved-2026-09-15，不作為新設計依據。

2026-09-15 已依使用者要求發布 GitHub Pages：https://wesleym6m6.github.io/busan-trip/ 。發布紀錄與動畫限制見 DEPLOYMENT.md。後續 push 不會自動部署；需手動執行 workflow。尚未做真實手機 Safari、螢幕閱讀器、整站離線啟動或旅途中實際日期的全面驗收。

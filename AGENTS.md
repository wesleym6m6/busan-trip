# AGENTS.md — 接手規範

先讀 [docs/CODEX_HANDOFF.md](docs/CODEX_HANDOFF.md) → [docs/ARCHITECTURE_AND_DATA.md](docs/ARCHITECTURE_AND_DATA.md) → [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md)。

## 使用者已定案（2026-09-15）

使用者已確認 BuShan-Claude 匯出版本的美術風格、內容、排版和使用體驗。後續以技術與內容維護為主，**未經新的明確要求，不重新設計、不替換配色／字體／插圖／動畫、不重排資訊或更換操作流程**。不得套用早期 review 建議或舊版規格覆蓋此版本。

- 視覺原件：`design/approved-2026-09-15/釜山家庭旅行.dc.html`；SHA-256 見同目錄 manifest。原件為不可覆寫的歷史基準。
- 正式入口：`src/App.tsx` → `src/approved/ApprovedTrip.tsx` / `view.tsx` / `approved.css`。
- 行程內容：`src/data/approved-trip.json`；契約為 `src/domain/schema.ts` 的 `ApprovedTripSchema`，語意驗證在 `validateApprovedTripData`。
- `src/LegacyApp.tsx`、舊 features/ui/styles、demo data 與 `docs/archive/` 僅供歷史參考，不是正式網站的 UI，也不是新設計依據。


2026-09-16 使用者另行要求並授權頁首碎浪／海鷗動畫升級，見 [HEADER_MOTION.md](docs/HEADER_MOTION.md)。最新頁首由 `CoastalHeader`、`SeaCanvas` 與 `header-motion.css` 管理；其餘定案外觀仍需保留。

2026-09-16 使用者確認滿意目前版本與設計，最新分層碎浪和海鷗也已定案。後續依新的行程表維護內容，保留這版美術與操作。內容來源、使用者確認及待確認項目見 [CONTENT_UPDATE_20260916.md](docs/CONTENT_UPDATE_20260916.md)。

## 工作規則

- 文案用台灣繁體中文；韓文地名與地址保留原文。景點、時間、地址、預約不硬寫在 JSX。
- 維持來源狀態；不假造已訂、已確認、地圖 place ID、座標或私人住宿門牌。
- API key、護照、電話、訂單編號、QR code、私人附件不得進入公開內容。原始 Excel 不隨網站發布。
- 不擅自啟用部署、不加付費服務、不新增大型依賴。GitHub Pages workflow 維持手動觸發。
- 改資料契約時同步更新 schema、validate、測試與架構文件第 4 節。資料變更不代表可順便改外觀。
- 提交前跑 `npm run check`；UI 技術變動另用真正瀏覽器檢查 360px / 390px、四分頁和相關互動。不要把編譯成功當成視覺驗收。
- 不可聲稱已離線可用／真機驗收／已部署，除非該項實際測過。

## 環境

Node 22 LTS（≥22.12）；`npm ci`。若本機使用 Node 25，測試加 `NODE_OPTIONS=--no-experimental-webstorage`，避免 Node 內建 localStorage 覆蓋 jsdom。
子路徑驗證的 build 與 preview 都必須帶 `VITE_BASE_PATH=/busan-trip/`。

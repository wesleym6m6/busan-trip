# AGENTS.md — 接手規範

先讀：[docs/CODEX_HANDOFF.md](docs/CODEX_HANDOFF.md)（現況與優先序）→ [docs/ARCHITECTURE_AND_DATA.md](docs/ARCHITECTURE_AND_DATA.md)（契約）→ [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md)（不得改動的設計原則）。

## 工作規則

- 介面文案用台灣繁體中文；韓文地名／地址保留原文並標 `lang="ko"`。
- 資料只能透過 `src/domain/schema.ts` 契約進入 UI；景點、時間、地址、預約不得硬寫在 JSX。
- 未知就顯示「待確認」；不補 00:00、不把 null 費用顯示成免費、不假造地圖 place ID／座標／連結。
- `verifiedAt` 只填真正核對的時間；示範資料維持 `mode: demo` 與 `type: demo|unverified`。
- production 建置不得 fallback 到示範資料（`src/data/loadTrip.ts` 已強制）。
- 公開網站：API key、護照、電話、訂單編號、QR code、私人附件不進 `public/`、`src/`、JSON、git 歷史。私人住宿門牌是否公開須先取得使用者確認。
- 不擅自部署、不加付費服務、不新增大型套件（router／state manager／icon／動畫／日期套件都不需要）。
- 改契約時同步更新：`schema.ts`、`validate.ts`、fixture、ARCHITECTURE_AND_DATA.md 第 4 節、對應測試。
- 提交前跑 `npm run check`（typecheck → lint → test → validate:data → build）。

## 環境提醒

- Node ≥ 22.12；npm 建議 11（npm 10.9.2 的 `npm install` 會遇到 arborist 錯誤，見 README）。
- 截圖：`npm run build && npm run preview`，另一個終端 `npm run screenshots`（需本機 Edge／Chrome）。

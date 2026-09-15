# 釜山行程網站（busan-trip）

私人用途的手機行程網站：每日行程、備案、實用工具。純靜態，部署目標為 GitHub Pages。
視覺方向「Busan Coastal Minimal」已確認，見 [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md)。

| 文件 | 內容 |
| --- | --- |
| [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md) | 視覺 tokens、頁面結構、互動、動畫、響應式規則、不得任意改動的原則 |
| [docs/ARCHITECTURE_AND_DATA.md](docs/ARCHITECTURE_AND_DATA.md) | 目錄責任、資料契約、驗證、demo／production 切換、GitHub Pages 前提 |
| [docs/CODEX_HANDOFF.md](docs/CODEX_HANDOFF.md) | 已完成／仍為 mock／未完成／待使用者提供、實測結果、下一步優先序 |
| [AGENTS.md](AGENTS.md) | 給接手 agent 的工作規範摘要 |

## 環境

- Node ≥ 22.12（開發時實測 v22.13.1；`.nvmrc` = 22）
- npm：**建議 11.x**。npm 10.9.2 在本專案 `npm install` 時遇到 arborist 錯誤
  `Cannot read properties of null (reading 'edgesOut')`（解析 vitest 的 peer 依賴時），改用 `npx -y npm@11 install` 即成功。
  `npm ci` 走 lockfile，未在 npm 10 上重現該錯誤，但仍建議統一 npm 11。
- 瀏覽器（僅截圖腳本需要）：本機已安裝的 Edge 或 Chrome，`puppeteer-core` 不會自行下載瀏覽器。

## 安裝與指令

```bash
npm ci
```

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | Vite dev server（預設 http://localhost:5173） |
| `npm run build` | 正式建置到 `dist/` |
| `npm run preview` | 以正式建置起本機伺服器 http://127.0.0.1:4173 |
| `npm run typecheck` | `tsc` 檢查 `src/` 與 `scripts/`、`vite.config.ts` |
| `npm run lint` | ESLint（含 react-hooks 規則） |
| `npm test` | Vitest（jsdom）：資料驗證、日期、地圖連結、App 冒煙測試 |
| `npm run validate:data` | 驗證 `public/data/demo/trip.json`（與存在時的 `public/data/trip.json`） |
| `npm run screenshots` | 用本機 Edge／Chrome 對 preview 伺服器截圖到 `docs/screenshots/`（需先 `build` + `preview`） |
| `npm run check` | 依序跑 typecheck → lint → test → validate:data → build |

## 環境變數（建置期常數，見 `.env.example`）

| 變數 | 值 | 用途 |
| --- | --- | --- |
| `VITE_BASE_PATH` | `/`（預設）或 `/<repo-name>/` | GitHub Pages project site 子路徑；只在 `vite.config.ts` 讀取 |
| `VITE_DATA_MODE` | `demo`（預設）或 `production` | 決定載入 `public/data/demo/trip.json` 或 `public/data/trip.json`。production 找不到檔案或檔案標記為 demo → 顯示錯誤，不 fallback |

範例：`VITE_BASE_PATH=/busan-trip/ VITE_DATA_MODE=demo npm run build`（Windows PowerShell 用 `$env:VITE_BASE_PATH='/busan-trip/'; npm run build`）。

## 資料位置

- 示範資料：`public/data/demo/trip.json`（`mode: "demo"`，所有日期、時間、地址皆為示範或未核對）
- 正式資料：`public/data/trip.json`（尚未存在；契約與匯入流程見 [docs/ARCHITECTURE_AND_DATA.md](docs/ARCHITECTURE_AND_DATA.md)）
- 契約定義：`src/domain/schema.ts`；跨物件驗證：`src/domain/validate.ts`

## 預覽方法

1. `npm run build && npm run preview`，手機與電腦同一個 Wi-Fi 時，`npm run preview -- --host` 後用電腦 IP 開啟。
2. 網址參數（僅供測試／截圖）：
   - `?now=2026-10-17T09:30:00%2B09:00` 固定「現在」時間（`+` 需寫成 `%2B`），用來測「接下來（依計畫）」與「今天」標示。
   - `?expand=<eventId>` 預設展開指定卡片。
   - 例：`http://127.0.0.1:4173/?now=2026-10-17T09:30:00%2B09:00#/itinerary/day-2`
3. 路由：`#/itinerary/<dayId>`、`#/backups`、`#/tools`；直接開啟與重新整理不需伺服器 rewrite。

## 部署（尚未執行）

`.github/workflows/deploy-pages.yml` 只保留 `workflow_dispatch`，不會因 push 自動公開。啟用前提與步驟見
[docs/ARCHITECTURE_AND_DATA.md](docs/ARCHITECTURE_AND_DATA.md) 的「GitHub Pages」一節。

## 公開資料邊界

這是公開網站。API key、護照、電話、訂單編號、可核銷 QR code、私人訂單附件不得進入 `public/`、`src/`、資料 JSON 或 git 歷史。
私人住宿精確門牌是否公開，待使用者確認；在確認前資料只保留 `precision: "area-only"`。

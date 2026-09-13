/**
 * 資料來源設定。mock 與正式資料只在這一層切換，UI 不知道差別。
 *
 * - VITE_DATA_MODE=demo（預設）→ public/data/demo/trip.json
 * - VITE_DATA_MODE=production → public/data/trip.json
 *
 * production 模式找不到檔案、驗證失敗、或檔案自稱 demo 時，一律顯示錯誤，不 fallback。
 */
export type DataMode = 'demo' | 'production';

export interface DataSourceConfig {
  mode: DataMode;
  /** 相對於 BASE_URL 的路徑。 */
  path: string;
}

export function resolveDataMode(raw: string | undefined): DataMode {
  return raw === 'production' ? 'production' : 'demo';
}

export function getDataSourceConfig(env: { VITE_DATA_MODE?: string } = import.meta.env): DataSourceConfig {
  const mode = resolveDataMode(env.VITE_DATA_MODE);
  return {
    mode,
    path: mode === 'production' ? 'data/trip.json' : 'data/demo/trip.json',
  };
}

/** 把相對於 public/ 的路徑接上 Vite base（支援 /repo-name/ 子路徑與相對 base）。 */
export function withBase(relativePath: string, base: string = import.meta.env.BASE_URL): string {
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${cleanBase}${cleanPath}`;
}

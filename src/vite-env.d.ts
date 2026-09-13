/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** demo | production；見 src/data/config.ts */
  readonly VITE_DATA_MODE?: string;
  /** 建置期由 vite.config.ts 讀取，前端不直接使用 */
  readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages project site 需要 "/<repo-name>/" 子路徑；repo 名稱未定，故由環境變數集中配置，
// 不在程式碼中寫死帳號或 repo 名稱。未設定時用 "/"（本機開發、user site、或自訂網域）。
const basePath = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

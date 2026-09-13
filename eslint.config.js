import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'tmp', 'docs/screenshots'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
    },
  },
  {
    files: ['scripts/**/*.{ts,mjs}', 'vite.config.ts'],
    // 截圖腳本內有 page.evaluate 的瀏覽器端程式碼，同時允許 node 與 browser 全域
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);

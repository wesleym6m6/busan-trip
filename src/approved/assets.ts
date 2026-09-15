/** Resolve against Vite's configured GitHub Pages subdirectory. */
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

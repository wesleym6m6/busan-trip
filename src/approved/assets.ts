// Full-resolution, lossless derivatives verified against every original RGBA pixel.
// Keep the original PNGs and their provenance metadata as the restoration source.
const losslessImages = new Set([
  'uploads/busan-coast.png',
  'uploads/busan-sea-underpaint.png',
  'uploads/gamcheon-village.png',
  'uploads/sky-capsule.png',
  'uploads/pork-soup.png',
]);

/** Resolve verified derivatives against Vite's GitHub Pages subdirectory. */
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${
  losslessImages.has(path) ? path.replace(/\.png$/, '.lossless.webp') : path
}`;

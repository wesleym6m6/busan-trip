import { createSeaRenderer } from '../seaRenderer';

// Keep the transparent seagull sprite as the original PNG: browser alpha
// rounding differs after WebP decode even when file-level RGBA is identical.
const names = ['busan-coast', 'busan-sea-underpaint', 'gamcheon-village', 'sky-capsule', 'pork-soup'];
const status = document.querySelector<HTMLElement>('#status')!;
const results = document.querySelector<HTMLElement>('#results')!;
const button = document.querySelector<HTMLButtonElement>('#run')!;
const before = document.querySelector<HTMLCanvasElement>('#before')!;
const after = document.querySelector<HTMLCanvasElement>('#after')!;

function pixels(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height).data;
}
function difference(a: Uint8Array | Uint8ClampedArray, b: Uint8Array | Uint8ClampedArray) {
  if (a.length !== b.length) throw new Error('Pixel buffer sizes differ');
  let changed = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) changed++;
  }
  return changed;
}
function frame(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl')!;
  const data = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, data);
  return data;
}
button.addEventListener('click', async () => {
  button.disabled = true; status.textContent = '正在載入並逐像素比較';
  const images: Record<string, HTMLImageElement> = {};
  const imageChecks = [];
  const waveChecks = [];
  const motionChecks = [];
  try {
    for (const name of names) {
      for (const ext of ['png', 'lossless.webp']) {
        const image = new Image();
        image.src = `${import.meta.env.BASE_URL}uploads/${name}.${ext}`;
        await image.decode(); images[`${name}.${ext}`] = image;
      }
      const original = images[`${name}.png`]!; const optimized = images[`${name}.lossless.webp`]!;
      const changedPixels = difference(pixels(original), pixels(optimized));
      const sameDimensions = original.naturalWidth === optimized.naturalWidth && original.naturalHeight === optimized.naturalHeight;
      imageChecks.push({ name, width: original.naturalWidth, height: original.naturalHeight, sameDimensions, changedPixels });
      if (!sameDimensions || changedPixels) throw new Error(`Image differs: ${name}`);
    }
    const originalRenderer = createSeaRenderer(before, images['busan-coast.png']!, images['busan-sea-underpaint.png']!);
    const optimizedRenderer = createSeaRenderer(after, images['busan-coast.lossless.webp']!, images['busan-sea-underpaint.lossless.webp']!);
    if (!originalRenderer || !optimizedRenderer) throw new Error('WebGL unavailable');
    try {
      for (const width of [360, 390, 1280]) {
        for (const canvas of [before, after]) { canvas.style.width = `${width}px`; canvas.style.height = '92px'; }
        let initial: Uint8Array | undefined;
        for (const time of [0, 1.5, 3, 5.5, 8]) {
          originalRenderer.draw(time); const original = frame(before);
          optimizedRenderer.draw(time); const optimized = frame(after);
          if (!original.some(value => value !== 0)) throw new Error('Blank WebGL output');
          const changedPixels = difference(original, optimized);
          waveChecks.push({ width, time, changedPixels });
          if (changedPixels) throw new Error(`Wave output differs at ${width}px / ${time}s`);
          if (time === 0) initial = optimized;
          if (time === 1.5 && initial) {
            const movingPixels = difference(initial, optimized);
            motionChecks.push({ width, movingPixels });
            if (!movingPixels) throw new Error('Wave is not moving');
          }
        }
      }
    } finally { originalRenderer.dispose(); optimizedRenderer.dispose(); }
    status.textContent = 'PASS：5 張圖片、15 組海浪畫面像素完全相同；海鷗保留原始 PNG';
  } catch (error) { status.textContent = `FAIL：${String(error)}`; }
  results.textContent = JSON.stringify({ imageChecks, waveChecks, motionChecks }, null, 2);
  button.disabled = false;
});

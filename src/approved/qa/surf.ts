import { createSeaRenderer } from '../seaRenderer';
const canvas = document.querySelector('canvas')!;
const state = document.querySelector('output')!;
const controls = document.querySelector('#controls')!;
const [original, clean] = await Promise.all(['busan-coast.png', 'busan-sea-underpaint.png'].map(name => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = `../../uploads/${name}`;
})));
if (!original || !clean) throw new Error('Both coast plates are required for the preview');
// Vite's base applies to the page as well as the asset URLs.
document.querySelector('img')!.src = original.src;
const renderer = createSeaRenderer(canvas, original, clean);
let seconds = 0;
let start: number | undefined;
let frame = 0;
function draw(time: number) {
  canvas.style.opacity = '1'; renderer?.draw(time); state.textContent = `${time.toFixed(2)} 秒`;
}
function stop() { cancelAnimationFrame(frame); start = undefined; }
function animate(now: number) { if(start === undefined) start = now - seconds * 1000; seconds = (now - start)/1000; draw(seconds); frame = requestAnimationFrame(animate); }
for (const time of [0,1,2,3,4,5,6,7,8,9,10,12]) {
  const button = document.createElement('button'); button.textContent = `${time} 秒`;
  button.addEventListener('click', () => { stop(); seconds = time; draw(time); }); controls.append(button);
}
document.querySelector('#play')!.addEventListener('click', () => { stop(); frame = requestAnimationFrame(animate); });
document.querySelector('#original')!.addEventListener('click', () => { stop(); canvas.style.opacity = '0'; state.textContent = '靜態原圖'; });
new ResizeObserver(() => draw(seconds)).observe(canvas);
draw(0);

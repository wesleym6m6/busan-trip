import { COAST_SIZE, FIXED_FOREGROUND, WATER_OUTLINE, SURF_OUTLINE, surfCycle } from './surfMotion';

const vertexSource = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = vec2((position.x + 1.0) * 0.5, (1.0 - position.y) * 0.5); gl_Position = vec4(position, 0.0, 1.0); }
`;
const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv;
uniform sampler2D coast;
uniform sampler2D underpaint;
uniform sampler2D seaMask;
uniform vec2 viewport;
uniform vec4 crestA;
uniform vec4 crestB;
uniform vec4 wash;
uniform vec4 splash;
const vec2 imageSize = vec2(1983.0, 793.0);

float maskAt(vec2 p) { return texture2D(seaMask, p / imageSize).r; }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
float grain(vec2 p) {
  // Smooth islands dissolve at different times, avoiding a pixel-grid fade.
  vec2 v = p / vec2(14.0, 7.0);
  vec2 cell = floor(v); vec2 f = fract(v); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(cell), hash(cell + vec2(1.0,0.0)), f.x),
    mix(hash(cell + vec2(0.0,1.0)), hash(cell + vec2(1.0,1.0)), f.x), f.y);
}
float foamAt(vec2 q) {
  vec3 ink = texture2D(coast, q / imageSize).rgb;
  float white = min(ink.r, min(ink.g, ink.b));
  float bounds = step(0.0,q.x) * step(q.x,imageSize.x) * step(0.0,q.y) * step(q.y,imageSize.y);
  return smoothstep(0.53, 0.94, white) * maskAt(q) * bounds;
}
vec3 composite(vec3 water, vec2 q, float amount, float erosion) {
  float breakup = smoothstep(erosion * 0.95 - 0.12, erosion * 0.95 + 0.22, grain(q));
  float alpha = foamAt(q) * amount * mix(1.0, breakup, erosion);
  vec3 paintedFoam = mix(vec3(0.91,0.975,0.98), texture2D(coast, q / imageSize).rgb, 0.65);
  return mix(water, paintedFoam, clamp(alpha, 0.0, 1.0));
}
vec3 breaker(vec3 color, vec2 p, vec4 wave, float variant) {
  float travel = wave.y;
  // A rigid foam layer translates shorewards and fans out behind the leading edge.
  vec2 shift = vec2(40.0 - travel * 77.0, -79.0 + travel * 85.0);
  vec2 q = p - shift;
  float line = 577.0 + 0.054 * q.x;
  q.y = line + (q.y - line) / (1.0 + wave.y * 0.50);
  q.x += variant * 54.0;
  float depth = q.y - (577.0 + 0.054 * q.x);
  float band = smoothstep(-35.0, -12.0, depth) * (1.0 - smoothstep(40.0, 66.0, depth));
  return composite(color, q, band * wave.z, wave.w);
}
void main() {
  float scale = max(viewport.x / imageSize.x, viewport.y / imageSize.y);
  vec2 origin = (viewport - imageSize * scale) * vec2(0.5, 0.62);
  vec2 p = (uv * viewport - origin) / scale;
  vec2 masks = texture2D(seaMask, p / imageSize).rg;
  float sea = masks.g * smoothstep(440.0, 456.0, p.y);

  // The scene is never warped. Clean water is a separate, stationary underpainting.
  vec3 color = mix(texture2D(coast, p / imageSize).rgb, texture2D(underpaint, p / imageSize).rgb, masks.r);
  color = breaker(color, p, crestA, 0.0);
  color = breaker(color, p, crestB, 1.0);

  // Broad aerated water: rush in, spread into lace, drain back and dissolve.
  vec2 q = p - vec2(26.0 - wash.x * 52.0, -78.0 + wash.x * 78.0);
  float shore = 575.0 + 0.070 * q.x;
  q.y = shore + (q.y - shore) / (1.0 + wash.y * 0.34);
  float nearShore = smoothstep(-15.0, 15.0, q.y - shore);
  color = composite(color, q, nearShore * wash.z, wash.w);

  // A separate, small spray layer rises at the rocks; the traced rocks occlude it.
  vec2 spray = p - vec2(-5.0 + splash.x * 10.0, 17.0 - splash.x * 36.0);
  float rockZone = smoothstep(1600.0,1740.0,spray.x) * smoothstep(520.0,538.0,spray.y)
    * (1.0 - smoothstep(623.0,645.0,spray.y));
  color = composite(color, spray, rockZone * splash.z, splash.w);
  gl_FragColor = vec4(color, sea);
}
`;

function createSeaMask() {
  const mask = document.createElement('canvas');
  [mask.width, mask.height] = COAST_SIZE;
  const context = mask.getContext('2d');
  if (!context) return null;
  context.fillStyle = '#000'; context.fillRect(0, 0, mask.width, mask.height);
  for (const [index, polygon] of [SURF_OUTLINE, WATER_OUTLINE, ...FIXED_FOREGROUND].entries()) {
    context.fillStyle = index === 0 ? '#0f0' : index === 1 ? '#ff0' : '#000';
    context.beginPath();
    polygon.forEach(([x,y], i) => { if (i === 0) context.moveTo(x,y); else context.lineTo(x,y); });
    context.closePath(); context.fill();
  }
  return mask;
}

export interface SeaRenderer { draw: (seconds: number) => void; dispose: () => void }
export function createSeaRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement, cleanSea: HTMLImageElement): SeaRenderer | null {
  const mask = createSeaMask();
  if (!mask) return null;
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const textures: WebGLTexture[] = [];
  const buffer = gl.createBuffer();
  const dispose = () => { shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); textures.forEach(t => gl.deleteTexture(t)); gl.deleteBuffer(buffer); };
  try {
    if (!program || !buffer) throw new Error('WebGL resources unavailable');
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('WebGL shader unavailable');
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Sea shader could not compile');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Sea shader could not link');
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1, -1,-1, 1,1, 1,-1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    for (const [index, source] of [image, cleanSea, mask].entries()) {
      const texture = gl.createTexture();
      if (!texture) throw new Error('Sea texture unavailable');
      textures.push(texture);
      gl.activeTexture(gl.TEXTURE0 + index); gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.uniform1i(gl.getUniformLocation(program, ['coast','underpaint','seaMask'][index]!), index);
    }
    const viewport = gl.getUniformLocation(program, 'viewport');
    const waves = ['crestA','crestB','wash','splash'].map(name => gl.getUniformLocation(program, name));
    return {
      draw(seconds) {
        const width = canvas.clientWidth; const height = canvas.clientHeight;
        if (!width || !height || gl.isContextLost()) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(width * dpr); const h = Math.round(height * dpr);
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        gl.viewport(0, 0, w, h); gl.uniform2f(viewport, width, height);
        const cycles = [seconds / 7.2 + 0.10, seconds / 7.2 + 0.60, seconds / 8.8 + 0.28, seconds / 7.2 + 0.36];
        cycles.forEach((cycle, i) => {
          const wave = surfCycle(cycle);
          gl.uniform4f(waves[i]!, wave.advance, wave.spread, wave.opacity, wave.erosion);
        });
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
      dispose,
    };
  } catch { dispose(); return null; }
}

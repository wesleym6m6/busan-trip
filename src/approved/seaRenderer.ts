/** Animate the existing illustration's water pixels; keep architecture and land fixed. */
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
uniform vec2 viewport;
uniform float time;
const vec2 imageSize = vec2(1983.0, 793.0);
float ellipse(vec2 p, vec2 center, vec2 radius) {
  return smoothstep(0.94, 1.06, length((p - center) / radius));
}
float water(vec2 p) {
  // Registration is in original-image coordinates, independent of viewport cropping.
  float shore = 546.0 + 0.12 * p.x + 0.000065 * p.x * p.x;
  float m = smoothstep(438.0, 464.0, p.y) * (1.0 - smoothstep(shore - 9.0, shore + 2.0, p.y));
  m *= ellipse(p, vec2(123.0, 519.0), vec2(139.0, 81.0));
  m *= ellipse(p, vec2(267.0, 561.0), vec2(117.0, 61.0));
  m *= ellipse(p, vec2(1904.0, 630.0), vec2(239.0, 123.0));
  return m;
}
void main() {
  float scale = max(viewport.x / imageSize.x, viewport.y / imageSize.y);
  vec2 origin = (viewport - imageSize * scale) * vec2(0.5, 0.62);
  vec2 p = (uv * viewport - origin) / scale;
  float depth = smoothstep(445.0, 710.0, p.y);
  float swell = sin(p.y * 0.034 - time * 1.65 + sin(p.x * 0.008) * 0.85);
  float ripple = sin(p.y * 0.091 - time * 2.35 + p.x * 0.018);
  vec2 flow = vec2(
    (sin(p.y * 0.045 - time * 1.1) * 19.0 + sin(p.x * 0.012 + time * 0.8) * 6.0) * depth,
    (swell * 31.0 + ripple * 6.0) * depth
  );
  float mask = water(p) * water(p + flow);
  vec4 moving = texture2D(coast, (p + flow) / imageSize);
  // Light belongs to the painted white foam, rather than an added white stripe.
  float foam = smoothstep(0.66, 0.94, min(moving.r, min(moving.g, moving.b)));
  moving.rgb *= 1.0 + foam * sin(time * 1.5 - p.y * 0.028 + p.x * 0.004) * 0.07;
  gl_FragColor = vec4(moving.rgb, mask);
}
`;

export interface SeaRenderer { draw: (seconds: number) => void; dispose: () => void }
export function createSeaRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement): SeaRenderer | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const texture = gl.createTexture();
  const buffer = gl.createBuffer();
  const dispose = () => { shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); gl.deleteTexture(texture); gl.deleteBuffer(buffer); };
  try {
    if (!program || !texture || !buffer) throw new Error('WebGL resources unavailable');
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
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    const clock = gl.getUniformLocation(program, 'time');
    const viewport = gl.getUniformLocation(program, 'viewport');
    gl.uniform1i(gl.getUniformLocation(program, 'coast'), 0);
    return {
      draw(seconds) {
        const width = canvas.clientWidth; const height = canvas.clientHeight;
        if (!width || !height || gl.isContextLost()) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(width * dpr); const h = Math.round(height * dpr);
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        gl.viewport(0, 0, w, h); gl.uniform2f(viewport, width, height); gl.uniform1f(clock, seconds);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
      dispose,
    };
  } catch { dispose(); return null; }
}

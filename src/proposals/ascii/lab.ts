// Runs the ASCII proposals: pass 1 computes the warp field per character cell into a small
// texture, pass 2 draws each cell's character from a glyph atlas in Fragment Mono.
import common from "./common.glsl?raw";
import fieldBody from "./field.frag?raw";
import glyphSource from "./glyphs.frag?raw";

const VERTEX = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const PALETTES = {
  paper: { ground: "#f7f9f8", ink: "#1a211e", accent: "#12a594" },
  mono: { ground: "#ffffff", ink: "#5f6563", accent: "#1a211e" },
  ink: { ground: "#091213", ink: "#8fa39e", accent: "#f5ede0" },
  teal: { ground: "#0d3d38", ink: "#53b9ab", accent: "#e0f8f3" },
  coral: { ground: "#f7f9f8", ink: "#1a211e", accent: "#f2785c" },
} as const;
export type PaletteName = keyof typeof PALETTES;

const MODES = { density: 0, contours: 1, decode: 2, words: 3 } as const;
const WORDS =
  "Kotlin / Java / TypeScript / Vue 3 / Astro / Three.js / WebGL / Ktor / PostgreSQL / Temporal / Docker / Kubernetes / La Rochelle / hello@thibaut-lefrancois.com / ";
const FONT_SIZE = 12; // CSS pixels
const LINE = 1.45;
const EASING = 0.05;
const SHADER_PALETTE = ["#091213", "#0d3d38", "#12a594", "#f2785c", "#f5ede0"];

/** WebGL and canvas factories return null when out of resources: fail loudly, it is a review page. */
function required<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`Could not create ${what}`);
  return value;
}

const rgb = (hex: string) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255] as const;
};

function program(gl: WebGL2RenderingContext, fragment: string) {
  const make = (type: number, source: string) => {
    const shader = required(gl.createShader(type), "a shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "");
    return shader;
  };
  const p = required(gl.createProgram(), "a program");
  gl.attachShader(p, make(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "");
  return p;
}

function texture(gl: WebGL2RenderingContext) {
  const t = required(gl.createTexture(), "a texture");
  gl.bindTexture(gl.TEXTURE_2D, t);
  for (const [k, v] of [
    [gl.TEXTURE_MIN_FILTER, gl.NEAREST],
    [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
  ] as const)
    gl.texParameteri(gl.TEXTURE_2D, k, v);
  return t;
}

/** Printable ASCII (32 to 126) side by side, one cell each, white on transparent. */
function atlas(family: string, cellW: number, cellH: number, ratio: number) {
  const canvas = document.createElement("canvas");
  canvas.width = cellW * 95;
  canvas.height = cellH;
  const ctx = required(canvas.getContext("2d"), "a 2D context");
  ctx.font = `400 ${FONT_SIZE * ratio}px ${family}`;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let code = 32; code < 127; code++) {
    ctx.fillText(String.fromCharCode(code), (code - 32) * cellW + cellW / 2, cellH / 2 + ratio);
  }
  return canvas;
}

export async function runAscii(root: HTMLElement, mode: keyof typeof MODES, getPalette: () => PaletteName) {
  const canvas = root.querySelector("canvas");
  const gl = canvas?.getContext("webgl2", { antialias: false, alpha: false });
  if (!canvas || !gl) return;

  const family = getComputedStyle(root).getPropertyValue("--font-data").trim() || "monospace";
  await document.fonts.load(`400 ${FONT_SIZE}px ${family}`);

  const fieldProgram = program(gl, `${common}\n${fieldBody}`);
  const glyphProgram = program(gl, glyphSource);
  const fieldTexture = texture(gl);
  const atlasTexture = texture(gl);
  const textTexture = texture(gl);
  const framebuffer = required(gl.createFramebuffer(), "a framebuffer");

  const codes = new Uint8Array([...WORDS].map((c) => c.charCodeAt(0)));
  gl.bindTexture(gl.TEXTURE_2D, textTexture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, codes.length, 1, 0, gl.RED, gl.UNSIGNED_BYTE, codes);

  let cols = 1;
  let rows = 1;
  let cellW = 1;
  let cellH = 1;
  const resize = () => {
    const ratio = Math.min(devicePixelRatio, 2);
    const measure = required(document.createElement("canvas").getContext("2d"), "a 2D context");
    measure.font = `400 ${FONT_SIZE * ratio}px ${family}`;
    cellW = Math.ceil(measure.measureText("M").width);
    cellH = Math.round(FONT_SIZE * LINE * ratio);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    cols = Math.ceil(canvas.width / cellW);
    rows = Math.ceil(canvas.height / cellH);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas(family, cellW, cellH, ratio));
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fieldTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const target = { x: 0.5, y: 0.5, presence: 0 };
  const pointer = { x: 0.5, y: 0.5, presence: 0 };
  root.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    target.x = (event.clientX - rect.left) / rect.width;
    target.y = 1 - (event.clientY - rect.top) / rect.height;
    target.presence = 1;
  });
  root.addEventListener("pointerleave", () => (target.presence = 0));
  let visible = false;
  new IntersectionObserver(([entry]) => (visible = entry?.isIntersecting ?? false)).observe(root);

  const u = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);
  let time = 12;
  let previous = performance.now();
  const frame = (now: number) => {
    time += Math.min(now - previous, 50) / 1000;
    previous = now;
    if (visible && !document.hidden) {
      pointer.x += (target.x - pointer.x) * EASING;
      pointer.y += (target.y - pointer.y) * EASING;
      pointer.presence += (target.presence - pointer.presence) * EASING;

      gl.useProgram(fieldProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, cols, rows);
      gl.uniform2f(u(fieldProgram, "u_resolution"), canvas.width, canvas.height);
      gl.uniform2f(u(fieldProgram, "u_canvas"), canvas.width, canvas.height);
      gl.uniform2f(u(fieldProgram, "u_cell"), cellW, cellH);
      gl.uniform1f(u(fieldProgram, "u_time"), time);
      gl.uniform2f(u(fieldProgram, "u_pointer"), pointer.x, pointer.y);
      gl.uniform1f(u(fieldProgram, "u_presence"), pointer.presence);
      SHADER_PALETTE.forEach((hex, i) => gl.uniform3fv(u(fieldProgram, `u_colors[${i}]`), rgb(hex)));
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const palette = PALETTES[getPalette()];
      gl.useProgram(glyphProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      [fieldTexture, atlasTexture, textTexture].forEach((t, i) => {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, t);
      });
      gl.uniform1i(u(glyphProgram, "u_field"), 0);
      gl.uniform1i(u(glyphProgram, "u_atlas"), 1);
      gl.uniform1i(u(glyphProgram, "u_text"), 2);
      gl.uniform2f(u(glyphProgram, "u_cell"), cellW, cellH);
      gl.uniform1f(u(glyphProgram, "u_time"), time);
      gl.uniform1i(u(glyphProgram, "u_mode"), MODES[mode]);
      gl.uniform1i(u(glyphProgram, "u_textLength"), codes.length);
      gl.uniform3fv(u(glyphProgram, "u_ground"), rgb(palette.ground));
      gl.uniform3fv(u(glyphProgram, "u_ink"), rgb(palette.ink));
      gl.uniform3fv(u(glyphProgram, "u_accent"), rgb(palette.accent));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// The live lens of the note on the 3D carousel's first shaders (LensDemo): the project's own
// fragment shader, on a grid in the shader's palette so the split shows on every line. Nothing
// moves on its own: a frame is drawn only when the pointer or a slider changes, so the demo needs
// no pause control and stays as it is under reduced motion. It starts when it nears the viewport.
import { SHADER_PALETTE } from "@/scripts/hero-shader/palette";
import lensSource from "./lens.frag?raw";

// The project's own vignette (src/experience/world/image.ts) and its cap on the pixel ratio.
const VIGNETTE = { uVignetteOffset: 1, uVignetteDarkness: 1 };
const MAX_PIXEL_RATIO = 2;
// Where the lens rests when no mouse is over the demo, in the shader's coordinates.
const REST = { x: 0.5, y: 0.5 };
// The grid, in CSS pixels.
const GRID_STEP = 40;
const GRID_WEIGHT = 2;

// Three.js hands the shader vUv from the plane's geometry; here the canvas is the image, drawn by
// one triangle that covers it.
const VERTEX_SOURCE = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

type Context = WebGL2RenderingContext | WebGLRenderingContext;

function createProgram(gl: Context): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  // Three.js adds the precision line to every ShaderMaterial, so the project's file has none.
  const sources = [
    [gl.VERTEX_SHADER, VERTEX_SOURCE],
    [gl.FRAGMENT_SHADER, `precision highp float;\n${lensSource}`],
  ] as const;
  for (const [type, source] of sources) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

// Ivory lines on ink, redrawn at the size of the drawing buffer so they stay sharp.
function drawGrid(width: number, height: number, ratio: number): HTMLCanvasElement {
  const canvas = Object.assign(document.createElement("canvas"), { width, height });
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  const [step, weight] = [GRID_STEP * ratio, Math.round(GRID_WEIGHT * ratio)];
  context.fillStyle = SHADER_PALETTE.ink;
  context.fillRect(0, 0, width, height);
  context.fillStyle = SHADER_PALETTE.ivory;
  for (let x = (width % step) / 2; x < width; x += step)
    context.fillRect(Math.round(x - weight / 2), 0, weight, height);
  for (let y = (height % step) / 2; y < height; y += step)
    context.fillRect(0, Math.round(y - weight / 2), width, weight);
  return canvas;
}

function startLensDemo(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-lens-demo-canvas]");
  const controls = root.querySelector<HTMLFieldSetElement>("[data-lens-demo-controls]");
  const fallback = root.querySelector<HTMLElement>("[data-lens-demo-fallback]");
  const form = controls?.form;
  if (!canvas || !controls || !fallback || !form) return;

  const gl = canvas.getContext("webgl2", { antialias: false }) ?? canvas.getContext("webgl", { antialias: false });
  const program = gl && createProgram(gl);
  if (!gl || !program) return;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const location = (name: string) => gl.getUniformLocation(program, name);
  gl.uniform1i(location("uTexture"), 0);
  for (const [name, value] of Object.entries(VIGNETTE)) gl.uniform1f(location(name), value);
  const mouse = location("uMouse");
  const resolution = location("uResolution");

  const pointer = { ...REST };
  let request = 0;
  const draw = () => {
    request = 0;
    gl.uniform2f(mouse, pointer.x, pointer.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const schedule = () => {
    request ||= requestAnimationFrame(draw);
  };

  const resize = () => {
    const ratio = Math.min(devicePixelRatio, MAX_PIXEL_RATIO);
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (width === canvas.width && height === canvas.height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    // The fix the note tells about: the resolution in the pixels drawn, not in CSS pixels.
    gl.uniform2f(resolution, width, height);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, drawGrid(width, height, ratio));
    draw();
  };

  const sliders = [...controls.querySelectorAll<HTMLInputElement>("input[data-uniform]")];
  const apply = () => {
    for (const slider of sliders) {
      const value = Number(slider.value);
      gl.uniform1f(location(slider.dataset.uniform ?? ""), value);
      const output = form.querySelector<HTMLOutputElement>(`output[for="${slider.id}"]`);
      if (output) output.value = value.toFixed(slider.step.split(".")[1]?.length ?? 0);
    }
    schedule();
  };
  form.addEventListener("input", apply);
  // The reset event fires before the form is reset.
  form.addEventListener("reset", () => setTimeout(apply));
  apply();

  const follow = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width;
    pointer.y = 1 - (event.clientY - rect.top) / rect.height;
    schedule();
  };
  canvas.addEventListener("pointermove", follow, { passive: true });
  canvas.addEventListener("pointerdown", follow, { passive: true });
  // A finger lifted leaves the lens where it was; a mouse that leaves sends it back to rest.
  canvas.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    Object.assign(pointer, REST);
    schedule();
  });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  canvas.addEventListener("webglcontextlost", () => {
    controls.disabled = true;
    fallback.hidden = false;
  });
  // The ClientRouter keeps the document: a demo swapped out gives its context back.
  document.addEventListener(
    "astro:before-swap",
    () => {
      cancelAnimationFrame(request);
      resizeObserver.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
    { once: true },
  );

  controls.disabled = false;
  fallback.hidden = true;
}

const start = () => {
  for (const root of document.querySelectorAll<HTMLElement>("[data-lens-demo]")) {
    if (root.dataset.lensDemoBound) continue;
    root.dataset.lensDemoBound = "true";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        startLensDemo(root);
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(root);
    document.addEventListener("astro:before-swap", () => observer.disconnect(), { once: true });
  }
};

// A module runs once: a demo swapped in by a later navigation is bound from here.
start();
document.addEventListener("astro:page-load", start);

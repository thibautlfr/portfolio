// The media kit page (src/pages/[mediakit].astro). It composes one piece of project media at
// the ratio of the `ratio` parameter, filling the window: either a capture set in the sheet
// (`src`), or a scene module drawn on a canvas in the site's colours and fonts (`scene`).
// The make-media tooling sets `render`, then steps time itself through window.mediaKit;
// without it, the piece plays live.
import { SHADER_PALETTE } from "./hero-shader/palette";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** What a scene module receives. Sizes are in CSS pixels; the canvas is already scaled. */
interface Kit {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  pixelRatio: number;
  params: URLSearchParams;
  /** The colour roles of the tokens, camel-cased (`textMuted`), and the shader's palette. */
  colors: Record<string, string>;
  /** Font stacks, ready for `context.font`. */
  fonts: Record<"title" | "text" | "data", string>;
  /** The type scale resolved at this stage size, in pixels. */
  sizes: Record<"label" | "text" | "lede" | "title" | "display", number>;
}

/** What a scene module's default export returns. */
interface Scene {
  /** Length of the loop, in seconds. */
  duration?: number;
  /** Draws the scene at `time`, in seconds. Must not depend on the previous call. */
  frame(time: number): void;
}

interface Ready {
  mode: "frame" | "scene";
  duration: number | undefined;
  /** Where the capture sits, in CSS pixels, for compositing a video under the plate. */
  window: Box | undefined;
}

declare global {
  interface Window {
    mediaKit?: { ready: Promise<Ready>; frame(time: number): Promise<void> };
  }
}

const ROLES = ["ground", "surface", "text", "text-muted", "line", "accent", "accent-text", "link"];
const SIZES = { label: "step-minus-1", text: "step-0", lede: "step-1", title: "step-3", display: "step-5" };
const VIDEO = /\.(mp4|webm|mov)$/i;

const params = new URLSearchParams(location.search);
const rendering = params.has("render");
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

// The stage fills the window at the requested ratio; the tooling sizes the window to it.
function sizeStage(stage: HTMLElement) {
  const [w = 16, h = 10] = (params.get("ratio") ?? "16:10").split(":").map(Number);
  const width = Math.floor(Math.min(innerWidth, (innerHeight * w) / h));
  const height = Math.round((width * h) / w);
  stage.style.width = `${width}px`;
  stage.style.height = `${height}px`;
  return { width, height };
}

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const colors: Record<string, string> = { ...SHADER_PALETTE };
  for (const role of ROLES) {
    const name = role.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());
    colors[name] = style.getPropertyValue(`--color-${role}`).trim();
  }
  return colors;
}

// Fluid tokens are clamp() expressions: a probe resolves them at the current window size.
function readSizes() {
  const probe = document.createElement("span");
  document.body.append(probe);
  const sizes = Object.fromEntries(
    Object.entries(SIZES).map(([name, step]) => {
      probe.style.fontSize = `var(--font-size-${step})`;
      return [name, parseFloat(getComputedStyle(probe).fontSize)];
    }),
  ) as Kit["sizes"];
  probe.remove();
  return sizes;
}

async function readFonts() {
  const style = getComputedStyle(document.documentElement);
  const stack = (name: string) => style.getPropertyValue(`--font-${name}`).trim();
  const fonts = { title: stack("title"), text: stack("text"), data: stack("data") };
  await Promise.all([
    document.fonts.load(`700 16px ${fonts.title}`),
    document.fonts.load(`400 16px ${fonts.text}`),
    document.fonts.load(`400 16px ${fonts.data}`),
  ]);
  return fonts;
}

async function frameMode(stage: HTMLElement): Promise<Ready> {
  const frame = stage.querySelector<HTMLElement>("[data-media-frame]");
  const slot = stage.querySelector<HTMLElement>("[data-media-window]");
  const data = stage.querySelector<HTMLElement>("[data-media-data]");
  if (!frame || !slot || !data) throw new Error("media kit: frame markup missing");
  frame.hidden = false;
  if (params.has("margin")) frame.style.setProperty("--frame-margin", `var(--space-${params.get("margin")})`);
  if (params.has("position")) slot.style.setProperty("--window-position", params.get("position"));

  const items = params.getAll("data");
  data.hidden = items.length === 0;
  data.replaceChildren(...items.map((item) => Object.assign(document.createElement("span"), { textContent: item })));

  const src = params.get("src");
  // `plate` leaves the window empty: the tooling lays a video under it with ffmpeg.
  if (src && !params.has("plate")) {
    if (VIDEO.test(src)) {
      const video = Object.assign(document.createElement("video"), { src, muted: true, loop: true, playsInline: true });
      slot.append(video);
      await new Promise((resolve) => video.addEventListener("loadeddata", resolve, { once: true }));
      if (!rendering) void video.play();
    } else {
      const image = Object.assign(document.createElement("img"), { src, alt: "" });
      slot.append(image);
      await image.decode();
    }
  }
  const rect = slot.getBoundingClientRect();
  const origin = stage.getBoundingClientRect();
  return {
    mode: "frame",
    duration: undefined,
    window: { x: rect.x - origin.x, y: rect.y - origin.y, width: rect.width, height: rect.height },
  };
}

async function sceneMode(stage: HTMLElement, url: string) {
  const canvas = stage.querySelector<HTMLCanvasElement>("[data-media-scene]");
  const context = canvas?.getContext("2d");
  if (!canvas || !context) throw new Error("media kit: no canvas");
  canvas.hidden = false;
  const { width, height } = stage.getBoundingClientRect();
  const pixelRatio = devicePixelRatio;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.scale(pixelRatio, pixelRatio);

  const [fonts, module] = await Promise.all([
    readFonts(),
    import(/* @vite-ignore */ url) as Promise<{ default: (kit: Kit) => Scene | Promise<Scene> }>,
  ]);
  const kit: Kit = {
    canvas,
    context,
    width,
    height,
    pixelRatio,
    params,
    colors: readColors(),
    fonts,
    sizes: readSizes(),
  };
  const scene = await module.default(kit);
  return { scene, context };
}

// Set once a scene is ready: what window.mediaKit.frame draws. A capture has nothing to step.
let drawAt: ((time: number) => void) | undefined;

async function start(): Promise<Ready> {
  const stage = document.querySelector<HTMLElement>("[data-media-stage]");
  if (!stage) throw new Error("media kit: no stage");
  // Nothing to compose: show the list of recipes instead.
  if (!params.has("scene") && !params.has("src")) {
    const index = document.querySelector<HTMLElement>("[data-media-index]");
    if (index) index.hidden = false;
    stage.hidden = true;
    return { mode: "frame", duration: undefined, window: undefined };
  }
  sizeStage(stage);
  await document.fonts.ready;

  const url = params.get("scene");
  if (!url) return frameMode(stage);

  const { scene, context } = await sceneMode(stage, url);
  const draw = (time: number) => {
    context.save();
    scene.frame(time);
    context.restore();
  };
  drawAt = draw;
  const fixed = params.get("t");
  if (rendering || fixed) draw(Number(fixed ?? 0));
  else {
    const begin = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - begin) / 1000;
      draw(scene.duration ? elapsed % scene.duration : elapsed);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  return { mode: "scene", duration: scene.duration, window: undefined };
}

window.mediaKit = {
  ready: start(),
  async frame(time) {
    drawAt?.(time);
    await nextFrame();
  },
};

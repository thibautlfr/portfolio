// The live hero shader. Hero.astro's inline boot step imports this module only
// when it may run (no reduced motion, no Save-Data), after load, the largest
// paint and idle; it then starts itself. It pauses off-screen and in hidden
// tabs, exposes a pause control, and stops when the router swaps the page away.
import { createRenderer, type FrameInput } from "./renderer";
import warpSource from "./warp.frag?raw";

// The shader's own colours: ink, teal-12, teal-9, coral, ivory.
const PALETTE = ["#091213", "#0d3d38", "#12a594", "#f2785c", "#f5ede0"] as const;
const MAX_PIXEL_RATIO = 1.5;
// An ambient effect reads the same at three quarters of the resolution.
const RESOLUTION_SCALE = 0.75;
const EASING = 0.05;
// Starts where the composition reads well, so the first live frame matches the static one.
const START_TIME = 12;

async function startHeroShader(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-hero-shader-canvas]");
  const toggle = root.querySelector<HTMLButtonElement>("[data-hero-shader-toggle]");
  if (!canvas || !toggle) return;

  const renderer = await createRenderer(canvas, warpSource, PALETTE);
  if (!renderer) return;

  const target = { x: 0.5, y: 0.5, presence: 0 };
  const frame: FrameInput = { time: START_TIME, pointer: [0.5, 0.5], presence: 0, scroll: 0 };
  let request = 0;
  let previous = 0;
  let visible = true;
  let paused = false;

  const resize = () => {
    const ratio = Math.min(devicePixelRatio, MAX_PIXEL_RATIO) * RESOLUTION_SCALE;
    renderer.resize(
      Math.max(1, Math.round(canvas.clientWidth * ratio)),
      Math.max(1, Math.round(canvas.clientHeight * ratio)),
    );
    renderer.draw(frame);
  };

  const tick = (now: number) => {
    frame.time += Math.min(now - previous, 50) / 1000;
    previous = now;
    frame.pointer[0] += (target.x - frame.pointer[0]) * EASING;
    frame.pointer[1] += (target.y - frame.pointer[1]) * EASING;
    frame.presence += (target.presence - frame.presence) * EASING;
    renderer.draw(frame);
    request = requestAnimationFrame(tick);
  };

  const sync = () => {
    cancelAnimationFrame(request);
    if (visible && !paused && !document.hidden) {
      previous = performance.now();
      request = requestAnimationFrame(tick);
    }
  };

  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    sync();
  });
  intersectionObserver.observe(root);
  document.addEventListener("visibilitychange", sync);

  root.addEventListener(
    "pointermove",
    (event) => {
      const rect = canvas.getBoundingClientRect();
      target.x = (event.clientX - rect.left) / rect.width;
      target.y = 1 - (event.clientY - rect.top) / rect.height;
      target.presence = 1;
    },
    { passive: true },
  );
  root.addEventListener("pointerleave", () => (target.presence = 0), { passive: true });
  const onScroll = () => {
    const rect = canvas.getBoundingClientRect();
    frame.scroll = Math.min(Math.max(-rect.top / rect.height, 0), 1);
  };
  addEventListener("scroll", onScroll, { passive: true });

  // The ClientRouter keeps the document: without this, a hero swapped out would keep drawing.
  document.addEventListener(
    "astro:before-swap",
    () => {
      cancelAnimationFrame(request);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      removeEventListener("scroll", onScroll);
      renderer.dispose();
    },
    { once: true },
  );

  canvas.addEventListener("webglcontextlost", () => {
    cancelAnimationFrame(request);
    root.classList.remove("is-live");
    toggle.hidden = true;
  });

  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    paused = !paused;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.textContent = paused ? "Play animation" : "Pause animation";
    sync();
  });

  root.classList.add("is-live");
  sync();
}

const start = () => {
  const root = document.querySelector<HTMLElement>("[data-hero-shader]");
  if (root && !root.classList.contains("is-live")) void startHeroShader(root);
};

// A module runs once: a hero swapped back in by the router, on a return to the home page,
// is started from here.
start();
document.addEventListener("astro:page-load", start);

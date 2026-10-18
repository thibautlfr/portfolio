// Runs every hero shader proposal on the review page, each in its own canvas, with the
// same pointer, easing and pause rules as the live hero (src/scripts/hero-shader/index.ts).
import { createRenderer, type FrameInput } from "@/scripts/hero-shader/renderer";

const PALETTE = ["#091213", "#0d3d38", "#12a594", "#f2785c", "#f5ede0"] as const;
const RESOLUTION_SCALE = 0.75;
const EASING = 0.05;

async function run(root: HTMLElement, source: string) {
  const canvas = root.querySelector("canvas");
  if (!canvas) return;
  const renderer = await createRenderer(canvas, source, PALETTE);
  if (!renderer) {
    root.dataset["failed"] = "";
    return;
  }

  const target = { x: 0.5, y: 0.5, presence: 0 };
  const frame: FrameInput = { time: 12, pointer: [0.5, 0.5], presence: 0, scroll: 0 };
  let visible = false;
  let previous = performance.now();

  const resize = () => {
    const ratio = Math.min(devicePixelRatio, 1.5) * RESOLUTION_SCALE;
    renderer.resize(Math.round(canvas.clientWidth * ratio), Math.round(canvas.clientHeight * ratio));
  };
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => (visible = entry?.isIntersecting ?? false)).observe(root);

  root.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    target.x = (event.clientX - rect.left) / rect.width;
    target.y = 1 - (event.clientY - rect.top) / rect.height;
    target.presence = 1;
  });
  root.addEventListener("pointerleave", () => (target.presence = 0));

  const tick = (now: number) => {
    const delta = Math.min(now - previous, 50) / 1000;
    previous = now;
    if (visible && !document.hidden) {
      frame.time += delta;
      frame.pointer[0] += (target.x - frame.pointer[0]) * EASING;
      frame.pointer[1] += (target.y - frame.pointer[1]) * EASING;
      frame.presence += (target.presence - frame.presence) * EASING;
      renderer.draw(frame);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const sources = import.meta.glob<string>("./*.frag", { query: "?raw", import: "default", eager: true });
const common = (await import("./common.glsl?raw")).default;
const warp = (await import("@/scripts/hero-shader/warp.frag?raw")).default;

for (const root of document.querySelectorAll<HTMLElement>("[data-proposal-shader]")) {
  const name = root.dataset["proposalShader"];
  const body = sources[`./${name}.frag`];
  void run(root, name === "warp" ? warp : `${common}\n${body ?? ""}`);
}

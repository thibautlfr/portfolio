// The hero's boot step, a module processed by the build like the site's other scripts: it is
// small enough to be minified and inlined in the page, so it costs no request competing with
// the first paint. Loads the shader module only when it may animate, after the load event, the
// largest contentful paint and idle time; otherwise the still frame stays. A module runs once
// per visit: a hero brought back by the router is started by the shader module itself.
const root = document.querySelector<HTMLElement>("[data-hero-shader]");
const shaderModule = root?.dataset["heroShader"];
const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
const mayAnimate = shaderModule && !matchMedia("(prefers-reduced-motion: reduce)").matches && !connection?.saveData;

// Compiling the shader blocks the main thread briefly; idle time keeps it off any pending
// input, but the wait is kept short so the still frame barely shows.
const IDLE_TIMEOUT = 500;

const whenIdle = (callback: () => void) =>
  "requestIdleCallback" in window
    ? requestIdleCallback(callback, { timeout: IDLE_TIMEOUT })
    : setTimeout(callback, 300);

// Chrome reports no largest paint for a page loaded in a background tab, so it is awaited
// for two seconds at most; otherwise the shader would never start there.
const LARGEST_PAINT_TIMEOUT = 2000;

const afterLargestPaint = (callback: () => void) => {
  let called = false;
  const once = () => {
    if (!called) callback();
    called = true;
  };
  setTimeout(once, LARGEST_PAINT_TIMEOUT);
  if (PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")) {
    new PerformanceObserver((_, observer) => {
      observer.disconnect();
      once();
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } else once();
};

// A script element rather than import(): the build would wrap import() in its preload helper,
// three times the size of this step.
const load = () => {
  const script = document.createElement("script");
  script.type = "module";
  script.src = String(shaderModule);
  document.head.append(script);
};
const start = () => afterLargestPaint(() => whenIdle(load));

if (mayAnimate) {
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });
}

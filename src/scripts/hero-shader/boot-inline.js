// @ts-check
// Inlined in the page by Hero.astro: a bundled script would be one more
// request competing with the first paint. Loads the shader module only when it may animate,
// after the load event, the largest contentful paint and idle time; otherwise the still frame stays.
{
  /** @type {HTMLElement | null} */
  const root = document.querySelector("[data-hero-shader]");
  const shaderModule = root?.dataset["heroShader"];
  /** @type {{ saveData?: boolean } | undefined} */
  const connection = /** @type {any} */ (navigator).connection;
  const mayAnimate = shaderModule && !matchMedia("(prefers-reduced-motion: reduce)").matches && !connection?.saveData;

  // Compiling the shader blocks the main thread briefly; idle time keeps it off any pending
  // input, but the wait is kept short so the still frame barely shows.
  const IDLE_TIMEOUT = 500;

  /** @param {() => void} callback */
  const whenIdle = (callback) =>
    "requestIdleCallback" in window
      ? requestIdleCallback(callback, { timeout: IDLE_TIMEOUT })
      : setTimeout(callback, 300);

  // Chrome reports no largest paint for a page loaded in a background tab, so it is awaited
  // for two seconds at most; otherwise the shader would never start there.
  const LARGEST_PAINT_TIMEOUT = 2000;

  /** @param {() => void} callback */
  const afterLargestPaint = (callback) => {
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

  const load = () => void import(/* @vite-ignore */ String(shaderModule));
  const start = () => afterLargestPaint(() => whenIdle(load));

  if (mayAnimate) {
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });
  }
}

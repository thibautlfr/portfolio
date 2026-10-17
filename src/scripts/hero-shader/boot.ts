// Decides whether the hero shader runs, and loads it as late as possible.
// The static frame in the HTML stays when it does not: reduced motion,
// Save-Data, or no WebGL2 (checked by the renderer itself).

interface NetworkInformation {
  saveData?: boolean;
}

function mayAnimate(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return !matchMedia("(prefers-reduced-motion: reduce)").matches && !connection?.saveData;
}

/** Resolves once the largest contentful paint has been recorded (immediately where unsupported). */
function afterLargestPaint(): Promise<void> {
  if (!PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")) return Promise.resolve();
  return new Promise((resolve) => {
    new PerformanceObserver((_, observer) => {
      observer.disconnect();
      resolve();
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
}

/** After the load event and the largest paint, on idle: the shader never competes with them. */
function whenIdle(callback: () => void) {
  const schedule = () =>
    void afterLargestPaint().then(() =>
      "requestIdleCallback" in window ? requestIdleCallback(callback, { timeout: 2500 }) : setTimeout(callback, 300),
    );
  if (document.readyState === "complete") schedule();
  else addEventListener("load", schedule, { once: true });
}

const root = document.querySelector<HTMLElement>("[data-hero-shader]");
if (root && mayAnimate()) {
  whenIdle(() => void import("./index").then(({ startHeroShader }) => startHeroShader(root)));
}

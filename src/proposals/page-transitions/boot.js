// @ts-check
// Proposals only (inlined in <head> by TransitionPicker.astro, with its CSP hash): picks the
// page transition proposal stored in localStorage and gives each navigation a type, open (into
// a case study), close (back out of one) or other, plus the geometry the variants start from.
// It also wires the picker once the page is parsed.
{
  const KEY = "proposal-transition";
  const root = document.documentElement;
  const style = localStorage.getItem(KEY) ?? "crossfade";
  root.dataset["transition"] = style;

  /** @param {string | undefined} url */
  const isCase = (url) => Boolean(url && new URL(url).pathname.startsWith("/work/"));
  /** @param {string | undefined} from @param {string | undefined} to */
  const typeOf = (from, to) => (isCase(to) && !isCase(from) ? "open" : isCase(from) && !isCase(to) ? "close" : "other");

  // The clicked card (a project row, else the link) and the click point, kept for the next page.
  addEventListener(
    "click",
    (event) => {
      const target = /** @type {Element} */ (event.target);
      const card = target.closest(".row, .experiment, .note, a");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      sessionStorage.setItem(
        "proposal-transition-from",
        JSON.stringify({
          x: event.clientX,
          y: event.clientY,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
        }),
      );
    },
    true,
  );

  /**
   * Shared-element names for the morph variant; every other variant keeps one root snapshot.
   * On a case study the title and cover are its own; on the home page, those of the row that
   * links to the case study.
   * @param {string} casePath
   */
  const name = (casePath) => {
    const morph = style === "morph";
    const onCase = isCase(location.href);
    const title = onCase
      ? document.querySelector("h1")
      : document.querySelector(`.row-title a[href="${casePath}"] .row-title-text`);
    const cover = onCase
      ? document.querySelector("article .media")
      : document.querySelector(`.row:has(a[href="${casePath}"]) .row-image .media`);
    if (title instanceof HTMLElement) title.style.viewTransitionName = morph ? "proposal-title" : "none";
    if (cover instanceof HTMLElement) cover.style.viewTransitionName = morph ? "proposal-cover" : "none";
  };

  addEventListener("pageswap", (event) => {
    const transition = /** @type {any} */ (event).viewTransition;
    if (!transition) return;
    const to = /** @type {any} */ (event).activation?.entry?.url;
    transition.types.add(typeOf(location.href, to));
    name(isCase(to) ? new URL(to).pathname : location.pathname);
  });

  addEventListener("pagereveal", (event) => {
    const transition = /** @type {any} */ (event).viewTransition;
    if (!transition) return;
    const from = /** @type {any} */ (window).navigation?.activation?.from?.url;
    transition.types.add(typeOf(from, location.href));
    name(isCase(location.href) ? location.pathname : from ? new URL(from).pathname : "");

    const saved = JSON.parse(sessionStorage.getItem("proposal-transition-from") ?? "null");
    const px = (/** @type {number} */ value) => `${Math.round(value)}px`;
    if (saved) {
      root.style.setProperty("--vt-x", px(saved.x));
      root.style.setProperty("--vt-y", px(saved.y));
      root.style.setProperty("--vt-top", px(Math.max(saved.top, 0)));
      root.style.setProperty("--vt-right", px(Math.max(innerWidth - saved.right, 0)));
      root.style.setProperty("--vt-bottom", px(Math.max(innerHeight - saved.bottom, 0)));
      root.style.setProperty("--vt-left", px(Math.max(saved.left, 0)));
    }
  });

  addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector("[data-transition-picker]");
    if (!(select instanceof HTMLSelectElement)) return;
    select.value = style;
    select.addEventListener("change", () => {
      localStorage.setItem(KEY, select.value);
      root.dataset["transition"] = select.value;
    });
  });
}

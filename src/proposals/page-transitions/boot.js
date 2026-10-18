// @ts-check
// Proposals only (inlined in <head> by TransitionPicker.astro): picks the page transition
// proposal stored in localStorage and gives each navigation a type, open (into a case study),
// close (back out of one) or other, plus the geometry the variants start from. It also wires
// the picker on every page.
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
    const morph = root.dataset["transition"] === "morph";
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

  /** The click geometry the expand and iris variants start from. @param {HTMLElement} target */
  const geometry = (target) => {
    const saved = JSON.parse(sessionStorage.getItem("proposal-transition-from") ?? "null");
    if (!saved) return;
    const px = (/** @type {number} */ value) => `${Math.round(value)}px`;
    target.style.setProperty("--vt-x", px(saved.x));
    target.style.setProperty("--vt-y", px(saved.y));
    target.style.setProperty("--vt-top", px(Math.max(saved.top, 0)));
    target.style.setProperty("--vt-right", px(Math.max(innerWidth - saved.right, 0)));
    target.style.setProperty("--vt-bottom", px(Math.max(innerHeight - saved.bottom, 0)));
    target.style.setProperty("--vt-left", px(Math.max(saved.left, 0)));
  };

  // The ClientRouter's events: names on the old page before its snapshot, the type and the
  // choice on the new one before the swap, names on the new page after it.
  let fromPath = "";
  document.addEventListener("astro:before-preparation", (event) => {
    const { from, to } = /** @type {any} */ (event);
    fromPath = from.pathname;
    name(isCase(to.href) ? to.pathname : from.pathname);
  });
  document.addEventListener("astro:before-swap", (event) => {
    const { from, to, viewTransition, newDocument } = /** @type {any} */ (event);
    viewTransition?.types?.add(typeOf(from.href, to.href));
    // The swap copies the new page's <html> attributes, which do not carry the choice.
    const next = /** @type {HTMLElement} */ (newDocument.documentElement);
    next.dataset["transition"] = root.dataset["transition"];
    geometry(next);
  });
  document.addEventListener("astro:after-swap", () => {
    name(isCase(location.href) ? location.pathname : fromPath);
  });

  // The router swaps the picker with the rest of the body: it is wired again on every page.
  document.addEventListener("astro:page-load", () => {
    const select = document.querySelector("[data-transition-picker]");
    if (!(select instanceof HTMLSelectElement)) return;
    select.value = root.dataset["transition"] ?? style;
    select.addEventListener("change", () => {
      localStorage.setItem(KEY, select.value);
      root.dataset["transition"] = select.value;
    });
  });
}

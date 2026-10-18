// A breadcrumb that leads to the page the visitor just came from acts as the browser's back
// button: the page comes back from the back-forward cache, scrolled to where it was left,
// instead of being loaded again at the top. Any other visit keeps the plain link.
const from = document.referrer ? new URL(document.referrer) : undefined;

for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-back-link]")) {
  const target = new URL(link.href);
  if (!from || from.origin !== location.origin || from.pathname !== target.pathname) continue;
  link.addEventListener("click", (event) => {
    // New tab, new window or download: the visitor asked for a link, not for "back".
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.back();
  });
}

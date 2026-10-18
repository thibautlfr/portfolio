// A breadcrumb that leads to the page the visitor just came from acts as the browser's back
// button: the router brings that page back scrolled to where it was left, instead of loading
// it again at the top. Any other visit keeps the plain link.
// The ClientRouter keeps one document, so document.referrer goes stale after the first page:
// the previous history entry comes from the Navigation API, with the referrer as a fallback.
const previousPath = (): string | undefined => {
  // Typed as always present, but missing in browsers without the Navigation API.
  const navigation = window.navigation as Navigation | undefined;
  if (navigation?.currentEntry) {
    const url = navigation.entries()[navigation.currentEntry.index - 1]?.url;
    return url && new URL(url).origin === location.origin ? new URL(url).pathname : undefined;
  }
  const from = document.referrer ? new URL(document.referrer) : undefined;
  return from?.origin === location.origin ? from.pathname : undefined;
};

const bindBackLinks = () => {
  for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-back-link]")) {
    link.addEventListener("click", (event) => {
      // New tab, new window or download: the visitor asked for a link, not for "back".
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (previousPath() !== new URL(link.href).pathname) return;
      // The router ignores clicks that are already handled.
      event.preventDefault();
      history.back();
    });
  }
};

// A module runs once: the breadcrumbs swapped in by later navigations are bound after each swap.
bindBackLinks();
document.addEventListener("astro:after-swap", bindBackLinks);

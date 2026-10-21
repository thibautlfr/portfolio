// The legal notice lets a visitor stop Umami for this browser. The tracker reads this key
// before every event it sends, so the choice applies at once, with no reload.
const key = "umami.disabled";

// Storage can be blocked (private modes, site data turned off): the switch then stays hidden.
const storage = (): Storage | undefined => {
  try {
    return localStorage;
  } catch {
    return undefined;
  }
};

const bindOptOut = () => {
  const root = document.querySelector<HTMLElement>("[data-analytics-opt-out]");
  const store = storage();
  if (!root || !store) return;

  const render = (focus: boolean) => {
    const stopped = Boolean(store.getItem(key));
    for (const state of root.querySelectorAll<HTMLElement>("[data-opt-out-state]")) {
      state.hidden = state.dataset.optOutState !== (stopped ? "stopped" : "counted");
      // The button pressed is hidden with its state: focus moves to the one that replaces it.
      if (!state.hidden && focus) state.querySelector("button")?.focus();
    }
  };

  root.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("button")) return;
    try {
      if (store.getItem(key)) store.removeItem(key);
      else store.setItem(key, "1");
    } catch {
      return;
    }
    render(true);
  });

  render(false);
  root.hidden = false;
};

// Fires on the first load and after every navigation of the router, which swaps the page in.
document.addEventListener("astro:page-load", bindOptOut);

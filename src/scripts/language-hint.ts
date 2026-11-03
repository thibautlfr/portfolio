// The one-time line that offers the French page to a browser set to French (LanguageHint.astro).
// Dismissed, followed, or a French page read: it never shows again in this browser. Without
// storage it stays hidden, since it could not keep the answer.
import { languageHintKey, shouldOfferFrench } from "@/lib/language-hint";

const storage = (): Storage | undefined => {
  try {
    return localStorage;
  } catch {
    return undefined;
  }
};

const remember = (store: Storage) => {
  try {
    store.setItem(languageHintKey, "1");
  } catch {
    // Storage full or blocked after all: the hint may show once more.
  }
};

const bindLanguageHint = () => {
  const store = storage();
  if (!store) return;
  if (document.documentElement.lang === "fr") {
    remember(store);
    return;
  }

  const hint = document.querySelector<HTMLElement>("[data-language-hint]");
  if (!hint) return;
  const forced = new URLSearchParams(location.search).has("lang-hint");
  const answered = Boolean(store.getItem(languageHintKey));
  if (!shouldOfferFrench({ languages: navigator.languages, answered, forced })) return;

  hint.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("a")) remember(store);
    if (event.target.closest("button")) {
      remember(store);
      hint.hidden = true;
    }
  });
  hint.hidden = false;
};

// A module runs once: the page swapped in by the router is checked again after each swap.
document.addEventListener("astro:page-load", bindLanguageHint);

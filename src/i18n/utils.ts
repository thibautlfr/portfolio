import { getRelativeLocaleUrl } from "astro:i18n";
import { ui, defaultLang } from "./ui";
import type { Locale, UIKey } from "./ui";

export type { Locale, UIKey };

/** Derive the current locale from the URL pathname. */
export function getLocaleFromUrl(url: URL): Locale {
  const [, segment] = url.pathname.split("/");
  return segment in ui ? (segment as Locale) : defaultLang;
}

/** Returns a t() helper bound to the given locale, falling back to defaultLang. */
export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return (
      (ui[locale] as Record<string, string>)[key] ??
      (ui[defaultLang] as Record<string, string>)[key] ??
      key
    );
  };
}

/** Returns the BCP 47 locale string for date formatting. */
export function dateLocale(locale: Locale): string {
  return locale === "en" ? "en-US" : "fr-FR";
}

/**
 * Returns a locale-prefixed URL for the given path.
 * French (default locale, no prefix) stays as-is.
 * English is prefixed with /en.
 */
export function localizedHref(path: string, locale: Locale): string {
  return getRelativeLocaleUrl(locale, path);
}

/** The other locale (toggle helper). */
export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "en" : "fr";
}

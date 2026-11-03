// The site's languages and the paths between them. English is at the root, every other
// language under its own prefix with the same slugs (see docs/i18n.md).

export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** For og:locale and the Open Graph images. */
export const ogLocales = { en: "en_GB", fr: "fr_FR" } as const satisfies Record<Locale, string>;

/** The language's own name, as the switch reads it to a screen reader. */
export const localeNames = { en: "English", fr: "Français" } as const satisfies Record<Locale, string>;

function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

/** "/fr/work/youbook/" → { locale: "fr", path: "/work/youbook/" }; the root is English. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split("/");
  if (first !== defaultLocale && isLocale(first)) return { locale: first, path: `/${rest.join("/")}` };
  return { locale: defaultLocale, path: pathname };
}

/** The same page in another language: "/work/youbook/" in French is "/fr/work/youbook/". */
export function localizePath(pathname: string, locale: Locale): string {
  const { path } = splitLocale(pathname);
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

/** The locale a page is rendered in, read from its URL. */
export function localeOf(url: URL): Locale {
  return splitLocale(url.pathname).locale;
}

/** The `[...locale]` route parameter: empty for English, at the root. */
export function localeParam(locale: Locale): string | undefined {
  return locale === defaultLocale ? undefined : locale;
}

/** getStaticPaths for a page served in every language through a `[...locale]` folder. */
export function localeStaticPaths() {
  return locales.map((locale) => ({ params: { locale: localeParam(locale) } }));
}

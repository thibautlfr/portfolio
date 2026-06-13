import type { Locale } from "./ui";

/** Strip the locale prefix from a content entry id. */
export function bareSlug(id: string): string {
  return id.replace(/^(fr|en)\//, "");
}

/** Derive the locale of a content entry from its id path. */
export function localeOf(id: string): Locale {
  return id.startsWith("en/") ? "en" : "fr";
}

/** Filter a collection to entries of a specific locale. */
export function filterByLocale<T extends { id: string }>(
  entries: T[],
  locale: Locale,
): T[] {
  return entries.filter((e) => localeOf(e.id) === locale);
}

/**
 * For each unique bareSlug, return the best entry for the requested locale.
 * If no entry exists for that locale, fall back to the French entry and mark
 * isFallback: true (so the UI can display a "FR only" notice).
 */
export function resolveForLocale<T extends { id: string }>(
  entries: T[],
  locale: Locale,
): { entry: T; isFallback: boolean }[] {
  // Index entries by locale then bareSlug
  const byLocale: Record<Locale, Map<string, T>> = { fr: new Map(), en: new Map() };
  for (const entry of entries) {
    byLocale[localeOf(entry.id)].set(bareSlug(entry.id), entry);
  }

  // Collect all unique slugs across both locales
  const allSlugs = new Set([
    ...byLocale.fr.keys(),
    ...byLocale.en.keys(),
  ]);

  const result: { entry: T; isFallback: boolean }[] = [];
  for (const slug of allSlugs) {
    const target = byLocale[locale].get(slug);
    if (target) {
      result.push({ entry: target, isFallback: false });
    } else {
      // Fall back to FR if available
      const fallback = byLocale.fr.get(slug);
      if (fallback) {
        result.push({ entry: fallback, isFallback: true });
      }
    }
  }
  return result;
}

/**
 * Find the translated version of an entry in the target locale.
 * Returns undefined if no translation exists.
 */
export function findTranslation<T extends { id: string }>(
  entries: T[],
  entry: T,
  target: Locale,
): T | undefined {
  const slug = bareSlug(entry.id);
  return entries.find((e) => localeOf(e.id) === target && bareSlug(e.id) === slug);
}

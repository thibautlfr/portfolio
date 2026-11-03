// Entries as a page in a given language reads them. Each French file is a collection of its
// own (projectsFr beside projects, see content.config.ts), laid over the English entry it
// shares an id with.
import { getCollection, render, type CollectionEntry } from "astro:content";

import { mergeTranslation } from "@/lib/content";

import { defaultLocale, type Locale } from "./locales";

const translationsOf = {
  projects: "projectsFr",
  playground: "playgroundFr",
  artworks: "artworksFr",
  notes: "notesFr",
} as const;

type Translatable = keyof typeof translationsOf;

/** An entry in the page's language. A published entry always has its French file (a test
    checks it); a draft without one reads in English. */
export type LocalizedEntry<C extends Translatable> = CollectionEntry<C> & {
  /** The French file, rendered in place of the English body when it exists. */
  translation?: CollectionEntry<(typeof translationsOf)[C]>;
};

export async function getLocalizedCollection<C extends Translatable>(
  collection: C,
  locale: Locale,
): Promise<LocalizedEntry<C>[]> {
  const entries = (await getCollection(collection)) as CollectionEntry<C>[];
  if (locale === defaultLocale) return entries as LocalizedEntry<C>[];
  const translations = new Map(
    ((await getCollection(translationsOf[collection])) as CollectionEntry<(typeof translationsOf)[C]>[]).map(
      (translation) => [translation.id, translation],
    ),
  );
  // The generic entry types do not narrow per collection: the shape is the one built here.
  return entries.map((entry) => {
    const translation = translations.get(entry.id);
    if (!translation) return entry as LocalizedEntry<C>;
    return { ...entry, data: mergeTranslation(entry.data, translation.data), translation } as LocalizedEntry<C>;
  });
}

/** The body in the entry's language: the French file's when there is one. */
export function renderLocalized<C extends Translatable>(entry: LocalizedEntry<C>) {
  return render(entry.translation ?? entry);
}

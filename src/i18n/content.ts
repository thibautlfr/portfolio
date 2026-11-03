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

/** An entry in the page's language, with the language its text is actually written in. */
export type LocalizedEntry<C extends Translatable> = CollectionEntry<C> & {
  /** The language of the text: the page's, or English while the entry has no translation. */
  contentLocale: Locale;
  /** The French file, rendered in place of the English body when it exists. */
  translation?: CollectionEntry<(typeof translationsOf)[C]>;
};

export async function getLocalizedCollection<C extends Translatable>(
  collection: C,
  locale: Locale,
): Promise<LocalizedEntry<C>[]> {
  const entries = (await getCollection(collection)) as CollectionEntry<C>[];
  if (locale === defaultLocale) return entries.map((entry) => ({ ...entry, contentLocale: defaultLocale }));
  const translations = new Map(
    ((await getCollection(translationsOf[collection])) as CollectionEntry<(typeof translationsOf)[C]>[]).map(
      (translation) => [translation.id, translation],
    ),
  );
  return entries.map((entry) => {
    const translation = translations.get(entry.id);
    if (!translation) return { ...entry, contentLocale: defaultLocale };
    return {
      ...entry,
      data: mergeTranslation(entry.data, translation.data),
      contentLocale: locale,
      translation,
    };
  });
}

/** The body in the entry's language: the French file's when there is one. */
export function renderLocalized<C extends Translatable>(entry: LocalizedEntry<C>) {
  return render(entry.translation ?? entry);
}

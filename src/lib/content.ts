// Content queries, kept free of Astro runtime imports so they can be unit
// tested. Every listing on the site goes through these, so drafts are
// filtered and ordering is decided in exactly one place.

interface Publishable {
  id: string;
  data: { draft: boolean; featured: boolean; order: number };
}

interface Dated {
  id: string;
  data: { draft: boolean; pubDate: Date };
}

const byOrder = (a: Publishable, b: Publishable) => a.data.order - b.data.order || a.id.localeCompare(b.id);

/** Every published entry, by `order` then id: each gets its page, feed entry and OG image. */
export function selectPublished<Entry extends Publishable>(entries: Entry[]): Entry[] {
  return entries.filter((entry) => !entry.data.draft).sort(byOrder);
}

/** The subset the home page shows: published and featured, in the same order. */
export function selectFeatured<Entry extends Publishable>(entries: Entry[]): Entry[] {
  return selectPublished(entries).filter((entry) => entry.data.featured);
}

type Plain = Record<string, unknown>;

const isPlain = (value: unknown): value is Plain =>
  typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);

/**
 * An entry's data with its translation laid over it: what the translation sets wins, what it
 * leaves out stays as in English. Objects merge key by key, and lists of objects item by item
 * (a cover keeps its file and takes the French alt; a link keeps its URL and takes the French
 * label). Lists of words, such as the decisions, are replaced whole.
 */
export function mergeTranslation<Data>(data: Data, translation: Plain): Data {
  const merge = (base: unknown, over: unknown): unknown => {
    if (over === undefined) return base;
    if (Array.isArray(base) && Array.isArray(over) && over.every(isPlain)) {
      return base.map((item, index) => merge(item, over[index]));
    }
    if (isPlain(base) && isPlain(over)) {
      const merged: Plain = { ...base };
      for (const [key, value] of Object.entries(over)) merged[key] = merge(base[key], value);
      return merged;
    }
    return over;
  };
  return merge(data, translation) as Data;
}

/** Published notes, newest first; `limit` keeps the most recent ones. */
export function selectLatest<Entry extends Dated>(entries: Entry[], limit = Infinity): Entry[] {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .slice(0, limit);
}

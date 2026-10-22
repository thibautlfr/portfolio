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

/** Published notes, newest first; `limit` keeps the most recent ones. */
export function selectLatest<Entry extends Dated>(entries: Entry[], limit = Infinity): Entry[] {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .slice(0, limit);
}

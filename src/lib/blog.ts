import type { CollectionEntry } from "astro:content";

type Lang = "en" | "fr";
type BlogPost = CollectionEntry<"blog">;

export function groupPostsBySlug(posts: BlogPost[]) {
  const grouped = new Map<string, Record<string, BlogPost>>();
  for (const post of posts) {
    const postSlug = post.id.split("/").slice(0, -1).join("/");
    if (!grouped.has(postSlug)) grouped.set(postSlug, {});
    grouped.get(postSlug)![post.data.lang] = post;
  }
  return grouped;
}

export function blogPostUrl(postSlug: string, lang: Lang) {
  return lang === "en" ? `/blog/${postSlug}` : `/blog/${postSlug}/${lang}`;
}

import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { groupPostsBySlug, blogPostUrl } from "../lib/blog";

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog")).filter(
    (post) => !post.data.draft,
  );

  const grouped = groupPostsBySlug(posts);

  const items = [...grouped.entries()]
    .map(([postSlug, versions]) => {
      const post = versions.en ?? versions.fr;
      const lang = versions.en ? "en" : "fr";
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: blogPostUrl(postSlug, lang),
      };
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: "Thibaut LEFRANCOIS — Blog",
    description:
      "Articles on web development, creative coding, and side projects.",
    site: context.site!,
    items,
  });
}

import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { profile } from "@/data/profile";
import { selectLatest } from "@/lib/content";

export const GET: APIRoute = async ({ site }) => {
  const notes = selectLatest(await getCollection("notes"));
  return rss({
    title: `${profile.name}, notes`,
    description: "Short notes on web development, shaders and freelance work.",
    site: site ?? "",
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.pubDate,
      link: `/notes/${note.id}/`,
      categories: note.data.tags,
    })),
    customData: "<language>en</language>",
  });
};

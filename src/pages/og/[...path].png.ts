import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

import { profile } from "@/data/profile";
import { selectFeatured, selectLatest } from "@/lib/content";
import { renderOgImage, type OgCard } from "@/lib/og";

export const getStaticPaths = (async () => {
  const projects = selectFeatured(await getCollection("projects", ({ data }) => !data.draft));
  const notes = selectLatest(await getCollection("notes"));
  const author = profile.name;
  return [
    { params: { path: "home" }, props: { title: profile.name, label: profile.role, author } },
    ...projects.map((project) => ({
      params: { path: `work/${project.id}` },
      props: { title: project.data.title, label: "Case study", author },
    })),
    ...notes.map((note) => ({
      params: { path: `notes/${note.id}` },
      props: { title: note.data.title, label: "Note", author },
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<OgCard> = async ({ props }) =>
  new Response(await renderOgImage(props), { headers: { "Content-Type": "image/png" } });

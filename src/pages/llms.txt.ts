// A plain-text summary for language models and AI assistants (llmstxt.org):
// who Thibaut is, what he offers, how to reach him, and the main pages.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { profile } from "@/data/profile";
import { selectFeatured, selectLatest } from "@/lib/content";

export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const projects = selectFeatured(await getCollection("projects", ({ data }) => !data.draft));
  const notes = selectLatest(await getCollection("notes"));
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${profile.role} based in ${profile.location.city}, ${profile.location.country}. ${profile.mobility}. ${profile.positioning}`,
    "",
    `Contact: ${profile.email}. Languages: ${profile.languages.join(", ")}.`,
    `Stack: ${Object.values(profile.stack).flat().join(", ")}.`,
    "",
    "## Case studies",
    "",
    ...projects.map((project) => `- [${project.data.title}](${url(`/work/${project.id}/`)}): ${project.data.summary}`),
    "",
    "## Notes",
    "",
    ...notes.map((note) => `- [${note.data.title}](${url(`/notes/${note.id}/`)}): ${note.data.description}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};

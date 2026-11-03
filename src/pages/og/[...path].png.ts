import type { APIRoute, GetStaticPaths } from "astro";

import { localProfile } from "@/data/profile";
import { getLocalizedCollection } from "@/i18n/content";
import { locales, localizePath } from "@/i18n/locales";
import { useTranslations } from "@/i18n/ui";
import { selectLatest, selectPublished } from "@/lib/content";
import { renderOgImage, type OgCard } from "@/lib/og";

// One card per page and language, at the page's own path under /og/ (see ogPath).
export const getStaticPaths = (async () => {
  const cards = await Promise.all(
    locales.map(async (locale) => {
      const t = useTranslations(locale);
      const profile = localProfile(locale);
      const projects = selectPublished(await getLocalizedCollection("projects", locale));
      const notes = selectLatest(await getLocalizedCollection("notes", locale));
      const author = profile.name;
      const path = (page: string) => localizePath(page, locale).slice(1);
      const homeFacts = [{ term: t("og.worksWith"), value: [...profile.stack.languages, "Vue", "React"].join(", ") }];
      return [
        { params: { path: path("/home") }, props: { title: profile.name, label: profile.role, facts: homeFacts } },
        ...projects.map((project) => ({
          params: { path: path(`/work/${project.id}`) },
          props: { title: project.data.title, label: t("og.caseStudy"), author },
        })),
        ...notes.map((note) => ({
          params: { path: path(`/notes/${note.id}`) },
          props: { title: note.data.title, label: t("og.note"), author },
        })),
      ];
    }),
  );
  return [
    ...cards.flat(),
    {
      params: { path: "design-system" },
      props: { title: "Design system", label: "Reference", author: localProfile("en").name },
    },
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<OgCard> = async ({ props }) =>
  new Response(await renderOgImage(props), { headers: { "Content-Type": "image/png" } });

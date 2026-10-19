// Content collections: the single source of truth for the shape of every
// project, experiment, artwork and note. Field by field documentation, with
// examples, lives in docs/content.md; keep both in sync.
import { defineCollection, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Folders starting with an underscore (the templates) are never loaded.
const entries = (collection: string, extensions: string) =>
  glob({ base: `./src/content/${collection}`, pattern: `[!_]*/index.${extensions}` });

/** Drives the home page without code: what shows, in which order. */
const publishing = {
  featured: z.boolean().default(false),
  order: z.number().int().default(100),
  draft: z.boolean().default(false),
};

/** An image never travels without its alternative text. */
const picture = (image: SchemaContext["image"]) =>
  z.object({
    src: image(),
    alt: z.string().min(1),
  });

/** A video next to the entry file, resolved to its built URL by src/lib/media.ts. */
const video = z.string().regex(/^\.\/[\w-]+\.(mp4|webm)$/, "Use a relative path like ./preview.mp4");

const year = z.number().int().min(2000).max(2100);

const projects = defineCollection({
  loader: entries("projects", "mdx"),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(60),
      summary: z.string().max(160),
      role: z.string(),
      context: z.enum(["client", "open-source", "personal", "hackathon"]),
      client: z
        .object({
          name: z.string(),
          url: z.url().optional(),
          group: z.string().optional(),
        })
        .optional(),
      year: year.optional(),
      stack: z.array(z.string()).min(1),
      cover: picture(image).optional(),
      preview: video.optional(),
      links: z
        .array(
          z.object({
            label: z.string(),
            url: z.url(),
            kind: z.enum(["live", "source", "demo", "article"]),
          }),
        )
        .default([]),
      award: z.string().optional(),
      // The opening of the case study: what was decided, then what was measured. Backticks set
      // an identifier as code.
      decisions: z.array(z.string().max(140)).min(2).max(4).optional(),
      figures: z
        .object({
          items: z
            .array(z.object({ value: z.string().max(12), label: z.string().max(110) }))
            .min(2)
            .max(4),
          /** Where the figures come from and under which conditions. */
          source: z.string().max(160),
        })
        .optional(),
      schemaType: z.enum(["CreativeWork", "SoftwareSourceCode", "WebApplication", "VideoGame"]).default("CreativeWork"),
      seo: z
        .object({
          title: z.string().max(60).optional(),
          description: z.string().max(160).optional(),
        })
        .optional(),
      ...publishing,
    }),
});

const playground = defineCollection({
  loader: entries("playground", "md"),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(60),
      description: z.string().max(100),
      url: z.url().optional(),
      thumbnail: picture(image),
      preview: video.optional(),
      date: z.coerce.date().optional(),
      ...publishing,
    }),
});

const artworks = defineCollection({
  loader: entries("artworks", "md"),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(60),
      kind: z.enum(["poster", "painting", "drawing", "illustration"]),
      year: year.optional(),
      image: picture(image),
      description: z.string().max(160).optional(),
      url: z.url().optional(),
      ...publishing,
    }),
});

const notes = defineCollection({
  loader: entries("notes", "{md,mdx}"),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(90),
      description: z.string().max(160),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      source: z
        .object({
          platform: z.enum(["x", "linkedin"]),
          url: z.url(),
        })
        .optional(),
      cover: picture(image).optional(),
      ...publishing,
    }),
});

export const collections = { projects, playground, artworks, notes };

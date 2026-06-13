import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.number().int(),
    status: z.enum(["finished", "wip"]),
    stack: z.array(z.string()),
    repository: z.url().optional(),
    live: z.url().optional(),
    featured: z.boolean().default(false),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/research" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.number().int(),
    tags: z.array(z.string()).default([]),
    demo: z.url().optional(),
    repository: z.url().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    project: z.string().optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
        }),
      )
      .default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    lang: z.enum(["en", "fr"]).default("en"),
  }),
});

export const collections = { projects, research, blog };

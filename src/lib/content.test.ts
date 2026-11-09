import { describe, expect, it } from "vitest";

import { mergeTranslation, selectFeatured, selectLatest, selectPublished } from "./content";

const project = (id: string, data: Partial<{ draft: boolean; featured: boolean; order: number }> = {}) => ({
  id,
  data: { draft: false, featured: true, order: 100, ...data },
});

const note = (id: string, pubDate: string, draft = false) => ({ id, data: { draft, pubDate: new Date(pubDate) } });

describe("selectFeatured", () => {
  it("keeps featured, published entries in order", () => {
    const result = selectFeatured([
      project("b", { order: 20 }),
      project("hidden", { featured: false }),
      project("wip", { draft: true }),
      project("a", { order: 10 }),
    ]);
    expect(result.map((entry) => entry.id)).toEqual(["a", "b"]);
  });

  it("breaks order ties by id so the result never depends on file system order", () => {
    expect(selectFeatured([project("b"), project("a")]).map((entry) => entry.id)).toEqual(["a", "b"]);
  });
});

describe("selectPublished", () => {
  it("keeps every published entry, featured or not, in order", () => {
    const result = selectPublished([
      project("b", { order: 20 }),
      project("hidden", { featured: false, order: 5 }),
      project("wip", { draft: true }),
    ]);
    expect(result.map((entry) => entry.id)).toEqual(["hidden", "b"]);
  });
});

describe("selectLatest", () => {
  it("returns published notes, newest first, up to the limit", () => {
    const result = selectLatest(
      [
        note("old", "2026-01-01"),
        note("draft", "2026-12-01", true),
        note("new", "2026-10-01"),
        note("mid", "2026-05-01"),
      ],
      2,
    );
    expect(result.map((entry) => entry.id)).toEqual(["new", "mid"]);
  });
});

describe("mergeTranslation", () => {
  const english = {
    title: "Steerkit",
    stack: ["TypeScript", "Vite"],
    cover: { src: "cover.png", alt: "The cover." },
    links: [
      { label: "Source", url: "https://github.com/thibautlfr/steerkit", kind: "source" },
      { label: "Demo", url: "https://steerkit.dev", kind: "demo" },
    ],
    decisions: ["One.", "Two.", "Three."],
    pubDate: new Date("2026-10-01"),
    draft: false,
  };

  it("takes what the translation sets and keeps the rest from English", () => {
    const merged = mergeTranslation(english, { title: "Steerkit FR", cover: { alt: "La couverture." } });
    expect(merged.title).toBe("Steerkit FR");
    expect(merged.cover).toEqual({ src: "cover.png", alt: "La couverture." });
    expect(merged.stack).toEqual(["TypeScript", "Vite"]);
    expect(merged.pubDate).toEqual(new Date("2026-10-01"));
  });

  it("merges lists of objects item by item, and replaces lists of words whole", () => {
    const merged = mergeTranslation(english, { links: [{ label: "Code source" }], decisions: ["Un.", "Deux."] });
    expect(merged.links).toEqual([
      { label: "Code source", url: "https://github.com/thibautlfr/steerkit", kind: "source" },
      { label: "Demo", url: "https://steerkit.dev", kind: "demo" },
    ]);
    expect(merged.decisions).toEqual(["Un.", "Deux."]);
  });

  it("leaves the English data untouched", () => {
    mergeTranslation(english, { title: "Autre", cover: { alt: "Autre." } });
    expect(english.title).toBe("Steerkit");
    expect(english.cover.alt).toBe("The cover.");
  });
});

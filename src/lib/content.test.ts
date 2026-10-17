import { describe, expect, it } from "vitest";

import { selectFeatured, selectLatest } from "./content";

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

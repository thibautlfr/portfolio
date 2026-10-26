import { describe, expect, it } from "vitest";

import { hierarchyDirection } from "./transition-direction";

describe("hierarchyDirection", () => {
  it("goes back up to a parent, whatever the history", () => {
    expect(hierarchyDirection("/notes/some-note/", "/notes/")).toBe("back");
    expect(hierarchyDirection("/work/ocarina/", "/")).toBe("back");
    expect(hierarchyDirection("/notes/", "/")).toBe("back");
  });

  it("goes forward down to a child", () => {
    expect(hierarchyDirection("/", "/notes/some-note/")).toBe("forward");
    expect(hierarchyDirection("/notes/", "/notes/some-note/")).toBe("forward");
  });

  it("leaves pages that are not in line to the history", () => {
    expect(hierarchyDirection("/notes/a/", "/notes/b/")).toBeUndefined();
    expect(hierarchyDirection("/work/ocarina/", "/legal-notice/")).toBeUndefined();
    expect(hierarchyDirection("/notes/", "/notes/")).toBeUndefined();
  });

  it("reads paths with or without a trailing slash, and never takes a prefix for a parent", () => {
    expect(hierarchyDirection("/notes/some-note", "/notes")).toBe("back");
    expect(hierarchyDirection("/notes-archive/", "/notes/")).toBeUndefined();
  });
});

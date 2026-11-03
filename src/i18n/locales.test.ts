import { describe, expect, it } from "vitest";

import { localeOf, localeStaticPaths, localizePath, ogPath, splitLocale } from "./locales";

describe("splitLocale", () => {
  it("reads the prefix of a translated page and keeps the root in English", () => {
    expect(splitLocale("/fr/work/youbook/")).toEqual({ locale: "fr", path: "/work/youbook/" });
    expect(splitLocale("/fr/")).toEqual({ locale: "fr", path: "/" });
    expect(splitLocale("/work/youbook/")).toEqual({ locale: "en", path: "/work/youbook/" });
    expect(splitLocale("/")).toEqual({ locale: "en", path: "/" });
  });

  it("never reads a slug that starts like a locale as one", () => {
    expect(splitLocale("/french-notes/")).toEqual({ locale: "en", path: "/french-notes/" });
    expect(splitLocale("/en/")).toEqual({ locale: "en", path: "/en/" });
  });
});

describe("localizePath", () => {
  it("leads to the same page in the other language", () => {
    expect(localizePath("/work/youbook/", "fr")).toBe("/fr/work/youbook/");
    expect(localizePath("/fr/work/youbook/", "en")).toBe("/work/youbook/");
    expect(localizePath("/", "fr")).toBe("/fr/");
    expect(localizePath("/fr/", "fr")).toBe("/fr/");
  });
});

describe("ogPath", () => {
  it("puts a French page's image under the same prefix as the page", () => {
    expect(ogPath("/work/youbook", "en")).toBe("/og/work/youbook.png");
    expect(ogPath("/work/youbook", "fr")).toBe("/og/fr/work/youbook.png");
    expect(ogPath("/home", "fr")).toBe("/og/fr/home.png");
  });
});

describe("localeOf", () => {
  it("takes the locale from the page's URL", () => {
    expect(localeOf(new URL("https://thibaut-lefrancois.com/fr/notes/"))).toBe("fr");
    expect(localeOf(new URL("https://thibaut-lefrancois.com/notes/"))).toBe("en");
  });
});

describe("localeStaticPaths", () => {
  it("serves English at the root and French under its prefix", () => {
    expect(localeStaticPaths()).toEqual([{ params: { locale: undefined } }, { params: { locale: "fr" } }]);
  });
});

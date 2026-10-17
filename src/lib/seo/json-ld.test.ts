import { describe, expect, it } from "vitest";

import { blogPosting, breadcrumbs, person, profilePage, work } from "./json-ld";

const site = "https://thibaut-lefrancois.com/";

const author = person({
  name: "Thibaut Lefrançois",
  givenName: "Thibaut",
  familyName: "Lefrançois",
  role: "Freelance full-stack developer",
  email: "hello@thibaut-lefrancois.com",
  image: `${site}portrait.jpg`,
  url: site,
  city: "La Rochelle",
  region: "Nouvelle-Aquitaine",
  country: "France",
  languages: ["French", "English"],
  knowsAbout: ["TypeScript"],
  sameAs: ["https://github.com/thibautlfr"],
});

describe("person and profile page", () => {
  it("wraps the person as the main entity, with a stable id", () => {
    const page = profilePage(author);
    expect(page["@type"]).toBe("ProfilePage");
    expect(page.mainEntity["@id"]).toBe(`${site}#person`);
    expect(page.mainEntity.email).toBe("mailto:hello@thibaut-lefrancois.com");
  });
});

describe("work", () => {
  it("links the author by id and leaves unknown fields out", () => {
    const data = work({
      type: "SoftwareSourceCode",
      name: "Steerkit",
      description: "Steering behaviors.",
      url: `${site}work/steerkit/`,
      authorUrl: site,
      keywords: ["TypeScript", "Three.js"],
    });
    expect(data.author).toEqual({ "@id": `${site}#person` });
    expect(data.keywords).toBe("TypeScript, Three.js");
    expect(data).not.toHaveProperty("dateCreated");
    expect(data).not.toHaveProperty("image");
  });
});

describe("blogPosting", () => {
  it("falls back to the publication date when never modified", () => {
    const data = blogPosting({
      headline: "A note",
      description: "About something.",
      url: `${site}notes/a-note/`,
      authorUrl: site,
      datePublished: "2026-10-01",
      keywords: [],
    });
    expect(data.dateModified).toBe("2026-10-01");
    expect(data).not.toHaveProperty("keywords");
  });
});

describe("breadcrumbs", () => {
  it("numbers items from one", () => {
    const data = breadcrumbs([
      { name: "Home", url: site },
      { name: "Steerkit", url: `${site}work/steerkit/` },
    ]);
    expect(data.itemListElement.map((item) => item.position)).toEqual([1, 2]);
  });
});

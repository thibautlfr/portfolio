import { describe, expect, it } from "vitest";

import { isExternal } from "./links";

const site = new URL("https://thibaut-lefrancois.com");

describe("isExternal", () => {
  it("marks other hosts, the site's subdomains included", () => {
    expect(isExternal("https://github.com/thibautlfr/steerkit", site)).toBe(true);
    expect(isExternal("https://trinity.thibaut-lefrancois.com/", site)).toBe(true);
  });

  it("keeps the site's own pages, anchors and email on the site", () => {
    expect(isExternal("/notes/bowser-bros-retrospective/", site)).toBe(false);
    expect(isExternal("https://thibaut-lefrancois.com/work/steerkit/", site)).toBe(false);
    expect(isExternal("#approach", site)).toBe(false);
    expect(isExternal("mailto:hello@thibaut-lefrancois.com", site)).toBe(false);
  });
});

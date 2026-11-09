import { describe, expect, it } from "vitest";

import { shouldOfferFrench } from "./language-hint";

describe("shouldOfferFrench", () => {
  it("offers French when the browser puts it first, in any region", () => {
    expect(shouldOfferFrench({ languages: ["fr-FR", "en"], answered: false, forced: false })).toBe(true);
    expect(shouldOfferFrench({ languages: ["fr-CA"], answered: false, forced: false })).toBe(true);
    expect(shouldOfferFrench({ languages: ["FR"], answered: false, forced: false })).toBe(true);
  });

  it("leaves visitors who chose another language first alone", () => {
    expect(shouldOfferFrench({ languages: ["en-GB", "fr-FR"], answered: false, forced: false })).toBe(false);
    expect(shouldOfferFrench({ languages: [], answered: false, forced: false })).toBe(false);
  });

  it("never comes back once answered, unless forced to be checked", () => {
    expect(shouldOfferFrench({ languages: ["fr-FR"], answered: true, forced: false })).toBe(false);
    expect(shouldOfferFrench({ languages: ["en-US"], answered: true, forced: true })).toBe(true);
  });
});

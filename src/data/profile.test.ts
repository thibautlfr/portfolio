import { describe, expect, it } from "vitest";

import { locales } from "@/i18n/locales";

import { localProfile, profile } from "./profile";

describe("testimonials", () => {
  it("pull a whole sentence of the quote, so the display line never puts words in a mouth", () => {
    for (const locale of locales) {
      for (const { testimonial } of Object.values(localProfile(locale).collaborations)) {
        if (!testimonial) continue;
        expect(testimonial.quote.some((paragraph) => paragraph.includes(testimonial.pull))).toBe(true);
        expect(testimonial.pull).toMatch(/^[A-Z].*[.!?]$/);
      }
    }
  });
});

describe("localProfile", () => {
  it("gives every collaboration its own French credit, never the English one", () => {
    const french = localProfile("fr");
    for (const [key, collaboration] of Object.entries(profile.collaborations)) {
      expect(french.collaborations[key]?.credit).not.toBe(collaboration.credit);
    }
  });

  it("shows the recommendation in the language it was written in, without a translation note", () => {
    const testimonial = localProfile("fr").collaborations["raccourci"]?.testimonial;
    expect(testimonial?.translatedFrom).toBeUndefined();
    expect(testimonial?.author).toBe(profile.collaborations["raccourci"]?.testimonial?.author);
  });
});

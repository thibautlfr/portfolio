import { describe, expect, it } from "vitest";

import { profile } from "./profile";

describe("testimonials", () => {
  it("pull a whole sentence of the quote, so the display line never puts words in a mouth", () => {
    for (const { testimonial } of Object.values(profile.collaborations)) {
      if (!testimonial) continue;
      expect(testimonial.quote.some((paragraph) => paragraph.includes(testimonial.pull))).toBe(true);
      expect(testimonial.pull).toMatch(/^[A-Z].*[.!?]$/);
    }
  });
});

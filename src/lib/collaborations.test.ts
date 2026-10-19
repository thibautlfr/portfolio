import { describe, expect, it } from "vitest";

import { findCollaboration } from "./collaborations";

const collaborations = [
  { name: "Raccourci Agency", testimonial: { quote: "Quote", author: "A. Person", role: "Lead" } },
  { name: "Areti" },
];

describe("findCollaboration", () => {
  it("finds the collaboration a client names", () => {
    expect(findCollaboration(collaborations, { name: "Raccourci Agency" })?.testimonial?.author).toBe("A. Person");
    expect(findCollaboration(collaborations, { name: "Areti" })?.testimonial).toBeUndefined();
  });

  it("finds nothing without a client, or for an unknown one", () => {
    expect(findCollaboration(collaborations)).toBeUndefined();
    expect(findCollaboration(collaborations, { name: "Someone else" })).toBeUndefined();
  });
});

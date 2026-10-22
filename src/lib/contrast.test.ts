import { describe, expect, it } from "vitest";

import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("spans 1 to 21", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
  });

  it("does not depend on the order of the pair", () => {
    expect(contrastRatio("#1a211e", "#ffffff")).toBe(contrastRatio("#ffffff", "#1a211e"));
  });

  // The values measured when the palette was chosen (docs/design/direction.md#colour).
  it("agrees with the measurements of the art direction record", () => {
    expect(contrastRatio("#1a211e", "#ffffff")).toBeCloseTo(16.4, 1);
    expect(contrastRatio("#5f6563", "#ffffff")).toBeCloseTo(5.95, 2);
    expect(contrastRatio("#008573", "#ffffff")).toBeCloseTo(4.56, 2);
    expect(contrastRatio("#ffffff", "#12a594")).toBeCloseTo(3.07, 2);
  });
});

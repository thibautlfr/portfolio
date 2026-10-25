import { describe, expect, it } from "vitest";

import { fluidRange, parseTokens, primitiveName, remToPx, resolveHex, toScope } from "./css-tokens";

describe("parseTokens", () => {
  it("reads declarations in order, across lines, and skips comments", () => {
    const css = `
      /* --ignored: 1px; */
      :root {
        --a: 1rem;
        --b: clamp(1rem,
          2vw,
          3rem);
      }`;
    expect(parseTokens(css)).toEqual([
      { name: "--a", value: "1rem" },
      { name: "--b", value: "clamp(1rem, 2vw, 3rem)" },
    ]);
  });

  it("keeps the first declaration of a name", () => {
    const css = `:root { --d: 140ms; } @media (prefers-reduced-motion: reduce) { :root { --d: 0ms; } }`;
    expect(parseTokens(css)).toEqual([{ name: "--d", value: "140ms" }]);
  });
});

describe("resolveHex", () => {
  const scope = toScope(
    parseTokens(":root { --gray-12: #202020; --text: var(--gray-12); --white: #fff; --odd: color(display-p3 1 1 1); }"),
  );

  it("follows references and normalises", () => {
    expect(resolveHex("var(--text)", scope)).toBe("#202020");
    expect(resolveHex("#fff", scope)).toBe("#ffffff");
  });

  it("gives up on anything that is not a plain hex", () => {
    expect(resolveHex("var(--odd)", scope)).toBeUndefined();
    expect(resolveHex("var(--missing)", scope)).toBeUndefined();
    expect(resolveHex("1rem", scope)).toBeUndefined();
  });
});

describe("primitiveName", () => {
  it("names the step a token points at", () => {
    expect(primitiveName("var(--teal-11)")).toBe("teal-11");
    expect(primitiveName("#fff")).toBeUndefined();
  });
});

describe("lengths", () => {
  it("turns rem into pixels", () => {
    expect(remToPx("0.25rem")).toBe(4);
    expect(remToPx("6rem")).toBe(96);
    expect(remToPx("3vw")).toBeUndefined();
  });

  it("reads the two ends of a fluid size", () => {
    expect(fluidRange("clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)")).toEqual({ min: 13, max: 14 });
    expect(fluidRange("min(1rem, 7cqi)")).toBeUndefined();
  });
});

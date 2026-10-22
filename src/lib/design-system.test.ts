import { readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { colorUse, componentRoles, layoutUse, motionUse, typeUse } from "@/data/design-system";
import { SHADER_PALETTE } from "@/scripts/hero-shader/palette";

import { buildDesignSystem, tokenFiles } from "./design-system";
import { colors as ogColors } from "./og-colors";

const system = buildDesignSystem();
const names = (tokens: readonly { name: string }[]) => tokens.map(({ name }) => name).sort();

describe("the page and the stylesheets agree", () => {
  it("describes every colour token, and only those", () => {
    expect(Object.keys(colorUse).sort()).toEqual(names(tokenFiles.color));
  });

  it("describes every layout token, and only those", () => {
    expect(Object.keys(layoutUse).sort()).toEqual(names(tokenFiles.layout));
  });

  it("describes every motion token, and only those", () => {
    expect(Object.keys(motionUse).sort()).toEqual(names(tokenFiles.motion));
  });

  it("describes every type token, and only those", () => {
    expect(Object.keys(typeUse).sort()).toEqual(names(tokenFiles.typography));
  });

  it("reads every colour as a hex, and every size as a range", () => {
    expect(system.colors.every(({ hex }) => /^#[\da-f]{6}$/.test(hex))).toBe(true);
    expect(system.steps.every(({ min, max }) => min > 0 && max >= min)).toBe(true);
  });

  it("documents every shared component", () => {
    const folders = ["ui", "site"];
    const found = folders.flatMap((folder) =>
      readdirSync(join(process.cwd(), "src/components", folder))
        .filter((file) => file.endsWith(".astro"))
        .map((file) => file.replace(".astro", "")),
    );
    expect(Object.keys(componentRoles).sort()).toEqual(found.sort());
  });
});

describe("the colour pairs", () => {
  it("meet WCAG 2.2 AA for every pair the system uses", () => {
    const failing = system.contrast.filter(({ refused, passes }) => !refused && !passes);
    expect(failing.map(({ foreground, background }) => `${foreground} on ${background}`)).toEqual([]);
  });

  it("still fail for every pair the system refuses, or the refusal is stale", () => {
    const passing = system.contrast.filter(({ refused, passes }) => refused && passes);
    expect(passing.map(({ foreground, background }) => `${foreground} on ${background}`)).toEqual([]);
  });
});

describe("the colours kept outside the stylesheets", () => {
  const hex = (name: string) => system.colors.find((role) => role.name === name)?.hex;

  it("gives the shader's still frame the ink of its palette", () => {
    expect(hex("--color-shader-ground")).toBe(SHADER_PALETTE.ink);
  });

  it("gives the Open Graph images the site's colours", () => {
    expect(ogColors).toEqual({
      ground: hex("--color-ground"),
      surface: hex("--color-surface"),
      text: hex("--color-text"),
      muted: hex("--color-text-muted"),
      line: hex("--color-line"),
      shader: hex("--color-shader-ground"),
      accent: hex("--color-accent"),
    });
  });
});

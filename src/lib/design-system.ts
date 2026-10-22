// The model behind /design-system/: every value on the page is read from the stylesheets in
// src/styles/tokens/ at build time, so the page cannot describe a system other than the one the
// site uses. What each token is for lives in src/data/design-system.ts; the test beside this
// file fails when a token and its description part ways.
import sageCss from "@radix-ui/colors/sage.css?raw";
import tealCss from "@radix-ui/colors/teal.css?raw";

import {
  colorUse,
  contrastPairs,
  faces,
  layoutUse,
  motionUse,
  shaderUse,
  spaceUse,
  typeUse,
  type ContrastPairSpec,
} from "@/data/design-system";
import { SHADER_PALETTE } from "@/scripts/hero-shader/palette";

import { contrastRatio, REQUIRED_RATIO } from "./contrast";
import { fluidRange, parseTokens, primitiveName, remToPx, resolveHex, toScope, type Token } from "./css-tokens";
import colorCss from "../styles/tokens/color.css?raw";
import layoutCss from "../styles/tokens/layout.css?raw";
import motionCss from "../styles/tokens/motion.css?raw";
import spaceCss from "../styles/tokens/space.css?raw";
import typographyCss from "../styles/tokens/typography.css?raw";

export const tokenFiles = {
  color: parseTokens(colorCss),
  typography: parseTokens(typographyCss),
  space: parseTokens(spaceCss),
  layout: parseTokens(layoutCss),
  motion: parseTokens(motionCss),
};

const colorScope = new Map([
  ...toScope(parseTokens(sageCss)),
  ...toScope(parseTokens(tealCss)),
  ...toScope(tokenFiles.color),
]);

function hexOf(name: string): string {
  const value = colorScope.get(name);
  const hex = value === undefined ? undefined : resolveHex(value, colorScope);
  if (hex === undefined) throw new Error(`The design system page cannot read ${name} as a colour.`);
  return hex;
}

export interface ColorRole {
  name: string;
  /** The Radix step it points at ("sage-12"), when it points at one. */
  primitive: string | undefined;
  hex: string;
  use: string;
}

export interface ContrastResult extends ContrastPairSpec {
  foregroundHex: string;
  backgroundHex: string;
  ratio: number;
  required: number;
  passes: boolean;
}

export interface DescribedToken extends Token {
  use: string;
}

const describe = (tokens: readonly Token[], uses: Readonly<Record<string, string>>): DescribedToken[] =>
  tokens.map((token) => ({ ...token, use: uses[token.name] ?? "" }));

const named = (tokens: readonly Token[], prefix: string) => tokens.filter(({ name }) => name.startsWith(prefix));

export function buildDesignSystem() {
  const colors: ColorRole[] = tokenFiles.color.map(({ name, value }) => ({
    name,
    primitive: primitiveName(value),
    hex: hexOf(name),
    use: colorUse[name] ?? "",
  }));

  const contrast: ContrastResult[] = contrastPairs.map((pair) => {
    const foregroundHex = hexOf(pair.foreground);
    const backgroundHex = hexOf(pair.background);
    const ratio = contrastRatio(foregroundHex, backgroundHex);
    const required = REQUIRED_RATIO[pair.kind];
    return { ...pair, foregroundHex, backgroundHex, ratio, required, passes: ratio >= required };
  });

  const typography = tokenFiles.typography;
  const steps = named(typography, "--font-size-step-").map(({ name, value }) => {
    const range = fluidRange(value);
    if (range === undefined) throw new Error(`${name} is not a fluid size the design system page can read.`);
    return { name, ...range, use: typeUse[name] ?? "" };
  });

  return {
    colors,
    shader: Object.entries(SHADER_PALETTE).map(([name, hex]) => ({ name, hex, use: shaderUse[name] ?? "" })),
    contrast,
    typeRoles: named(typography, "--font-").flatMap(({ name }) => {
      const face = faces[name];
      return face === undefined ? [] : [{ name, ...face, use: typeUse[name] ?? "" }];
    }),
    weights: describe([...named(typography, "--font-weight-"), ...named(typography, "--font-stretch-")], typeUse),
    steps,
    otherSizes: describe(
      typography.filter(({ name }) => name.startsWith("--font-size-") && !name.startsWith("--font-size-step-")),
      typeUse,
    ),
    lineHeights: describe(named(typography, "--line-height-"), typeUse),
    letterSpacings: describe(named(typography, "--letter-spacing-"), typeUse),
    spaces: tokenFiles.space.map(({ name, value }) => ({ name, value, px: remToPx(value) ?? 0, use: spaceUse })),
    layout: describe(tokenFiles.layout, layoutUse),
    durations: describe(named(tokenFiles.motion, "--duration-"), motionUse),
    easings: describe(named(tokenFiles.motion, "--ease-"), motionUse),
  };
}

// Reads custom properties out of stylesheets, so the design system page and its tests work from
// the tokens themselves and never from a copy of their values.

export interface Token {
  name: string;
  value: string;
}

/** Every `--name: value;` declaration of a stylesheet, in order. The first declaration of a name
    wins: Radix repeats each colour in Display P3 further down, and the motion tokens are set to
    zero under reduced motion. */
export function parseTokens(css: string): Token[] {
  const uncommented = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const tokens = new Map<string, string>();
  for (const match of uncommented.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match;
    if (name === undefined || value === undefined || tokens.has(name)) continue;
    tokens.set(name, value.replace(/\s+/g, " ").trim());
  }
  return [...tokens].map(([name, value]) => ({ name, value }));
}

export function toScope(tokens: readonly Token[]): ReadonlyMap<string, string> {
  return new Map(tokens.map(({ name, value }) => [name, value]));
}

/** The sRGB hex a colour token comes to, following `var()` references: `#fff` and `#ffffff`
    both give "#ffffff". Undefined for anything that is not a plain hex colour. */
export function resolveHex(value: string, scope: ReadonlyMap<string, string>, depth = 0): string | undefined {
  if (depth > 8) return undefined;
  const reference = /^var\((--[\w-]+)\)$/.exec(value);
  if (reference?.[1] !== undefined) {
    const next = scope.get(reference[1]);
    return next === undefined ? undefined : resolveHex(next, scope, depth + 1);
  }
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value);
  if (hex?.[1] === undefined) return undefined;
  const digits = hex[1].length === 3 ? [...hex[1]].map((digit) => digit + digit).join("") : hex[1];
  return `#${digits.toLowerCase()}`;
}

/** The name a colour token points at in the primitives: `var(--gray-12)` gives "gray-12". */
export function primitiveName(value: string): string | undefined {
  return /^var\(--([\w-]+)\)$/.exec(value)?.[1];
}

const REM = 16;

/** A length in rem as pixels at the browser's default size: "0.25rem" gives 4. */
export function remToPx(value: string): number | undefined {
  const match = /^(-?[\d.]+)rem$/.exec(value);
  return match?.[1] === undefined ? undefined : Number(match[1]) * REM;
}

/** The two ends of a fluid size, in pixels: `clamp(1rem, 0.9rem + 1vw, 2rem)` gives 16 and 32. */
export function fluidRange(value: string): { min: number; max: number } | undefined {
  const match = /^clamp\(\s*([\d.]+rem)\s*,.+,\s*([\d.]+rem)\s*\)$/.exec(value);
  const min = match?.[1] === undefined ? undefined : remToPx(match[1]);
  const max = match?.[2] === undefined ? undefined : remToPx(match[2]);
  return min === undefined || max === undefined ? undefined : { min, max };
}

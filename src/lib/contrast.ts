// WCAG 2.x contrast between two sRGB colours, to measure the system's colour pairs.

const channel = (value: number) => {
  const unit = value / 255;
  return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
};

function luminance(hex: string): number {
  const [red = 0, green = 0, blue = 0] = [1, 3, 5].map((start) =>
    channel(Number.parseInt(hex.slice(start, start + 2), 16)),
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** The ratio between two six-digit hex colours, from 1 to 21. */
export function contrastRatio(first: string, second: string): number {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** What WCAG 2.2 AA asks of a pair: 4.5 for text at body size, 3 for a line or a frame. */
export const REQUIRED_RATIO = { text: 4.5, "non-text": 3 } as const;

// Open Graph images, rendered at build time: a small sheet of cells in the
// site's own type and colours. Satori lays out the tree, resvg rasterises it.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { colors } from "./og-colors";

const WIDTH = 1200;
const HEIGHT = 630;
// Satori's flex layout drifts with padding and growing children: a fixed-size
// card is laid out in explicit pixels instead.
const MARGIN = 40;
const SHEET_WIDTH = WIDTH - 2 * MARGIN;
const FOOT_HEIGHT = 130;
const SHADER_WIDTH = 320;

const fontPath = (name: string) => join(process.cwd(), "src/assets/fonts/og", `${name}.woff`);

const fonts = Promise.all([
  readFile(fontPath("stack-sans-headline")).then((data) => ({ name: "Headline", data, weight: 700 as const })),
  readFile(fontPath("stack-sans-text")).then((data) => ({ name: "Text", data, weight: 400 as const })),
  readFile(fontPath("archivo-wordmark")).then((data) => ({ name: "Wordmark", data, weight: 800 as const })),
]);

type Style = Record<string, string | number>;

const box = (style: Style, children: unknown[] | string = []) => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

export interface OgCard {
  /** The page's title, set large. */
  title: string;
  /** What the page is: "Case study", "Note", the role on the home page. */
  label: string;
  /** Who it is by, set in the wordmark face. */
  author: string;
}

export async function renderOgImage({ title, label, author }: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  const cell = {
    backgroundColor: colors.surface,
    borderRight: `1px solid ${colors.line}`,
    borderBottom: `1px solid ${colors.line}`,
  };
  const tree = box({ width: WIDTH, height: HEIGHT, padding: MARGIN, backgroundColor: colors.ground }, [
    box(
      {
        flexDirection: "column",
        width: SHEET_WIDTH,
        height: HEIGHT - 2 * MARGIN,
        borderTop: `1px solid ${colors.line}`,
        borderLeft: `1px solid ${colors.line}`,
      },
      [
        box(
          {
            ...cell,
            height: HEIGHT - 2 * MARGIN - FOOT_HEIGHT,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 40,
          },
          [
            box({ fontFamily: "Text", fontSize: 26, color: colors.muted }, label),
            box(
              {
                fontFamily: "Headline",
                fontSize: title.length > 40 ? 64 : 84,
                lineHeight: 1,
                color: colors.text,
                letterSpacing: -1.5,
              },
              title,
            ),
          ],
        ),
        box({ height: FOOT_HEIGHT }, [
          box({ ...cell, width: SHEET_WIDTH - SHADER_WIDTH, alignItems: "center", padding: "0 40px" }, [
            box({ fontFamily: "Wordmark", fontSize: 40, color: colors.text, letterSpacing: -1 }, author),
          ]),
          box({ ...cell, width: SHADER_WIDTH, backgroundColor: colors.shader }, [
            box({ width: 64, height: "100%", backgroundColor: colors.accent }),
          ]),
        ]),
      ],
    ),
  ]);

  // Satori types its input as React nodes; this plain object tree has the same shape.
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: await fonts,
  });
  // Copied into a plain ArrayBuffer so it is a valid Response body.
  return new Uint8Array(new Resvg(svg).render().asPng());
}

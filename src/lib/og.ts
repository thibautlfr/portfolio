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
const HOME_SHADER_WIDTH = 320;

const fontPath = (name: string) => join(process.cwd(), "src/assets/fonts/og", `${name}.woff`);

const fonts = Promise.all([
  readFile(fontPath("stack-sans-headline")).then((data) => ({ name: "Headline", data, weight: 700 as const })),
  readFile(fontPath("stack-sans-text")).then((data) => ({ name: "Text", data, weight: 400 as const })),
  readFile(fontPath("fragment-mono")).then((data) => ({ name: "Data", data, weight: 400 as const })),
  readFile(fontPath("archivo-wordmark")).then((data) => ({ name: "Wordmark", data, weight: 800 as const })),
]);

// The hero's still frame, cropped by the cell: the one colour on the card.
const shaderFrame = readFile(join(process.cwd(), "src/assets/images/shader-frame.jpg")).then(
  (data) => `data:image/jpeg;base64,${data.toString("base64")}`,
);

type Style = Record<string, string | number>;

const box = (style: Style, children: unknown[] | string = []) => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

interface OgFact {
  term: string;
  value: string;
}

export interface OgCard {
  /** The page's title, set large. */
  title: string;
  /** What the page is: "Case study", "Note", the role on the home page. */
  label: string;
  /** Who it is by, set in the wordmark face in the foot. Left out on the home page, where the title is the name. */
  author?: string;
  /** Term and value pairs set just above the title on the home card, like the site's facts. */
  facts?: OgFact[];
}

const shaderImage = (src: string, width: number, height: number) => ({
  type: "img",
  props: { src, width, height, style: { width, height, objectFit: "cover" } },
});

export async function renderOgImage({ title, label, author, facts = [] }: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  const cell = {
    backgroundColor: colors.surface,
    borderRight: `1px solid ${colors.line}`,
    borderBottom: `1px solid ${colors.line}`,
  };
  const shader = await shaderFrame;
  const innerHeight = HEIGHT - 2 * MARGIN;
  const sheet = (children: unknown[]) =>
    box({ width: WIDTH, height: HEIGHT, padding: MARGIN, backgroundColor: colors.ground }, [
      box(
        {
          flexDirection: "column",
          width: SHEET_WIDTH,
          height: innerHeight,
          borderTop: `1px solid ${colors.line}`,
          borderLeft: `1px solid ${colors.line}`,
        },
        children,
      ),
    ]);

  const home = sheet([
    box({ height: innerHeight }, [
      box(
        {
          ...cell,
          width: SHEET_WIDTH - HOME_SHADER_WIDTH,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 40,
        },
        [
          box({ fontFamily: "Text", fontSize: 26, color: colors.muted }, label),
          box({ flexDirection: "column", gap: 28 }, [
            box(
              { flexDirection: "column", gap: 14 },
              facts.map(({ term, value }) =>
                box({ alignItems: "baseline" }, [
                  box({ width: 148, flexShrink: 0, fontFamily: "Text", fontSize: 24, color: colors.muted }, term),
                  box({ fontFamily: "Data", fontSize: 22, color: colors.text, whiteSpace: "nowrap" }, value),
                ]),
              ),
            ),
            box({ fontFamily: "Wordmark", fontSize: 64, lineHeight: 1, color: colors.text, letterSpacing: -2 }, title),
          ]),
        ],
      ),
      box({ ...cell, width: HOME_SHADER_WIDTH, height: innerHeight, backgroundColor: colors.shader }, [
        shaderImage(shader, HOME_SHADER_WIDTH, innerHeight),
      ]),
    ]),
  ]);

  const tree =
    author === undefined
      ? home
      : box({ width: WIDTH, height: HEIGHT, padding: MARGIN, backgroundColor: colors.ground }, [
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
                  shaderImage(shader, SHADER_WIDTH, FOOT_HEIGHT),
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

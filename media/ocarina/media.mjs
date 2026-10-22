// Ocarina's media. The cover and the gallery show the game as it is: the live site captured and
// set in the sheet. The preview loop and the body figure are drawn from the game's own code
// (scene.js) in the site's palette. The songs are not published as a package: the route serves
// the game's songs.ts from its repository, next to the portfolio's, with its types stripped,
// under a URL the scene imports. Built only when the renderer reads the routes, so listing this
// recipe touches nothing.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

function songsModule() {
  const source = join(process.cwd(), "../ocarina-project/ocarina/src/experience/songs/songs.ts");
  const out = join(tmpdir(), "make-media", "ocarina", "songs.js");
  mkdirSync(join(out, ".."), { recursive: true });
  writeFileSync(out, stripTypeScriptTypes(readFileSync(source, "utf8")));
  return out;
}

// The ratio of the cell a capture fills in a 16:10 frame: with the data row for the cover, without
// it for the gallery, whose images are shown at a quarter of the page and could not carry it.
const viewport = { width: 1440, height: 793 };
const gallery = { width: 1440, height: 853 };
const url = "https://ocarina.thibaut-lefrancois.com/";
const data = ["ocarina.thibaut-lefrancois.com", "1440 × 793"];
const ready = (page) => page.getByText("Press Start").waitFor({ state: "visible", timeout: 30000 });
const start = async (page) => {
  await ready(page);
  await page.keyboard.press("Space");
  // The camera's turn after Press Start
  await page.waitForTimeout(4500);
};
// The fairies start and wander from Math.random: seeded before the game loads, they fly the same
// way on every capture. This seed keeps all four in the frame.
const SEED = 2;
const seed = async (page, value) => {
  await page.addInitScript((value) => {
    let a = value >>> 0;
    Math.random = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, value);
  await page.reload({ waitUntil: "networkidle" });
};
// A player halfway through the book: the first ten songs of Ocarina of Time learned.
const LEARNED = [
  "Zelda's Lullaby",
  "Epona's Song",
  "Saria's Song",
  "Sun's Song",
  "Song of Time",
  "Song of Storms",
  "Minuet of Forest",
  "Bolero of Fire",
  "Serenade of Water",
  "Prelude of Light",
];

export default {
  out: "src/content/projects/ocarina",
  scene: "/media/ocarina/scene.js",
  get routes() {
    return { "https://ocarina.local/songs.js": songsModule() };
  },
  captures: [
    {
      name: "title",
      url,
      viewport,
      prepare: async (page) => {
        await ready(page);
        await page.waitForTimeout(1500);
        // Press Start blinks: hold every CSS animation on its first, fully lit frame.
        await page.evaluate(() => {
          for (const animation of document.getAnimations()) {
            animation.pause();
            animation.currentTime = 0;
          }
        });
      },
    },
    {
      name: "game",
      url,
      viewport: gallery,
      prepare: async (page) => {
        await seed(page, Number(process.env.OCARINA_SEED ?? SEED));
        await start(page);
      },
    },
    {
      name: "song-book",
      url,
      viewport: gallery,
      prepare: async (page) => {
        await page.evaluate((learned) => {
          localStorage.setItem("ocarina:songs", JSON.stringify({ learned, unseen: [] }));
        }, LEARNED);
        await page.reload({ waitUntil: "networkidle" });
        await start(page);
        await page.locator(".song-book-toggle").click();
        await page.waitForTimeout(1500);
      },
    },
  ],
  outputs: [
    { file: "cover.png", src: "captures/title.png", data },
    { file: "game.png", src: "captures/game.png" },
    { file: "song-book.png", src: "captures/song-book.png" },
    { file: "preview.mp4", params: { shot: "reel" } },
    { file: "detection.png", width: 640, ratio: "2:1", params: { shot: "detect" }, time: 2.4 },
  ],
};

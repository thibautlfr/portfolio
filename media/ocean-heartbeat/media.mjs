// Ocean Heartbeat's media. The cover and the gallery show the scene as it is: the live site
// captured and set in the sheet. The preview loop and the body figure are drawn from the
// project's own models, laid out as its scene lays them out (scene.js), in the site's palette.
// The models are not published anywhere the scene could import them from: the route serves them
// from the project's repository, under a URL the scene loads.
import { join } from "node:path";

const project = join(import.meta.dirname, "../../../ocean-heartbeat/public/models");

// The ratio of the cell a capture fills in a 16:10 frame: with the data row for the cover, without
// it for the gallery, whose images are shown at a quarter of the page and could not carry it.
const viewport = { width: 1440, height: 793 };
const gallery = { width: 1440, height: 853 };
const url = "https://ocean-heartbeat.thibaut-lefrancois.com/";

// Past the loader, the pointer in the middle of the window: the camera eases toward a position
// read from the pointer, so it settles facing the heart.
const start = async (page) => {
  await page.getByRole("button", { name: "Démarrer l'expérience" }).click({ timeout: 60000 });
  const { width, height } = page.viewportSize();
  await page.mouse.move(width / 2, height / 2);
  await page.waitForTimeout(5000);
};
// A click on the heart opens its two panels.
const panels = async (page) => {
  const { width, height } = page.viewportSize();
  await page.mouse.click(width / 2, height * 0.45);
  await page.waitForTimeout(2000);
};
// The arcade button, the second of the three in the corner.
const retro = async (page) => {
  await page.locator("button.hover\\:opacity-50").nth(1).click();
  const { width, height } = page.viewportSize();
  await page.mouse.move(width / 2, height / 2);
  await page.waitForTimeout(2000);
};

export default {
  out: "src/content/projects/ocean-heartbeat",
  scene: "/media/ocean-heartbeat/scene.js",
  routes: { "https://ocean-heartbeat.local/models/": project },
  captures: [
    { name: "seabed", url, viewport, prepare: start },
    {
      name: "panels",
      url,
      viewport: gallery,
      prepare: async (page) => {
        await start(page);
        await panels(page);
      },
    },
    {
      name: "retro",
      url,
      viewport: gallery,
      prepare: async (page) => {
        await start(page);
        await retro(page);
      },
    },
  ],
  outputs: [
    { file: "cover.png", src: "captures/seabed.png", data: ["ocean-heartbeat.thibaut-lefrancois.com", "1440 × 793"] },
    { file: "panels.png", src: "captures/panels.png" },
    { file: "retro-mode.png", src: "captures/retro.png" },
    { file: "preview.mp4", params: { shot: "reel" } },
    { file: "retro.png", width: 640, params: { shot: "retro" }, time: 2 },
  ],
};

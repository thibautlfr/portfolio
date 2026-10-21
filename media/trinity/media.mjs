// Trinity's media: the live site captured and set in the sheet. The look is the experiment, so
// nothing is redrawn. The thumbnail is the CD case past the loader; the loop turns it over with a
// click and back with a second one. The case floats on a motion that does not repeat in six
// seconds, so the loop closes on a half-second crossfade, the clicks kept clear of it.
const url = "https://trinity.thibaut-lefrancois.com/";
// The ratio of the cell a capture fills in a 4:3 frame.
const viewport = { width: 1236, height: 900 };

const start = async (page) => {
  await page.getByRole("button", { name: "Démarrer l'expérience" }).click({ timeout: 60000 });
  const { width, height } = page.viewportSize();
  await page.mouse.move(width * 0.56, height * 0.44);
  await page.waitForTimeout(5000);
};

// The fake clock also runs in real time, which would leak into the loop while each frame is
// screenshotted: paused here, it moves only by the renderer's steps.
const pause = async (page) => page.clock.pauseAt((await page.evaluate(() => Date.now())) + 100);

const frameOf = (t) => Math.round(t * 30);
const flip = async (page, t) => {
  const frame = frameOf(t);
  if (frame === 24 || frame === 114) {
    const { width, height } = page.viewportSize();
    await page.mouse.click(width * 0.5, height * 0.47);
    await page.mouse.move(width * 0.56, height * 0.44);
  }
};

export default {
  out: "src/content/playground/trinity",
  captures: [
    { name: "case", url, viewport, prepare: start },
    {
      name: "turn",
      url,
      viewport,
      prepare: async (page) => {
        await start(page);
        await pause(page);
      },
      loop: { seconds: 6.5, fps: 30, onFrame: flip },
    },
  ],
  outputs: [
    { file: "thumbnail.png", kind: "thumbnail", src: "captures/case.png" },
    { file: "preview.mp4", kind: "thumbnail", src: "captures/turn.mp4", crossfade: 0.5 },
  ],
};

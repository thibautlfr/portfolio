// 3D Carousel's media. The playground's are the live site captured and set in the sheet: the look
// is the experiment, so nothing is redrawn. The thumbnail catches the cards bent by a scroll; the
// loop scrolls one way and back by the same amount, so it closes on its poster.
const url = "https://3d-carousel.thibaut-lefrancois.com/";
// The ratio of the cell a capture fills in a 4:3 frame.
const viewport = { width: 1236, height: 900 };

const ready = async (page) => {
  await page.waitForTimeout(6000);
  const { width, height } = page.viewportSize();
  await page.mouse.move(width / 2, height / 2);
};

// The fake clock also runs in real time, which would leak into the loop while each frame is
// screenshotted: paused here, it moves only by the renderer's steps.
const pause = async (page) => page.clock.pauseAt((await page.evaluate(() => Date.now())) + 100);

const scroll = async (page) => {
  await ready(page);
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(150);
};

// Wheel events dispatched by the page itself, so none is coalesced: six ticks forward from 0.2 s,
// six back from 3.2 s. The carousel drifts on its own by 0.0005 rad a frame when at rest (each
// tick adds 120 × 0.0002 rad of velocity, which a friction of 0.7 turns into 0.08 rad): the way
// back is longer by that drift, so the loop ends where it began.
// Measured: 159 brings the last frame back onto the first.
const BACK = -159;
const wheel = async (page, t) => {
  const frame = Math.round(t * 30);
  const deltaY = frame >= 6 && frame < 18 ? 120 : frame >= 96 && frame < 108 ? BACK : 0;
  if (deltaY && frame % 2 === 0)
    await page.evaluate((deltaY) => window.dispatchEvent(new WheelEvent("wheel", { deltaY })), deltaY);
};

export default {
  out: "src/content/playground/3d-carousel",
  // The Retina figure of the note runs the project's own fragment shader (scene.js), served from
  // its repository next to the portfolio's.
  routes: {
    "https://3d-carousel.local/fragment.glsl": "../../../3d-carousel/src/experience/shaders/image/fragment.glsl",
  },
  captures: [
    { name: "bend", url, viewport, prepare: scroll },
    {
      name: "scroll",
      url,
      viewport,
      prepare: async (page) => {
        await ready(page);
        await pause(page);
      },
      loop: { seconds: 6, fps: 30, warmup: 8, onFrame: wheel },
    },
  ],
  outputs: [
    { file: "thumbnail.png", kind: "thumbnail", src: "captures/bend.png" },
    { file: "preview.mp4", kind: "thumbnail", src: "captures/scroll.mp4" },
    {
      file: "../../notes/first-steps-glsl-shaders-threejs/retina.mp4",
      ratio: "2:1",
      scene: "/media/3d-carousel/scene.js",
      params: { shot: "retina" },
    },
  ],
};

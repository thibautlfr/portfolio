// Steerkit's media: scenes drawn by the library itself (scene.js), rendered by make-media.
export default {
  out: "src/content/projects/steerkit",
  scene: "/media/steerkit/scene.js",
  outputs: [
    { file: "cover.png", params: { shot: "card" }, time: 0 },
    { file: "preview.mp4", params: { shot: "reel" } },
    { file: "arrive.png", width: 640, params: { shot: "arrive" }, time: 2.2 },
  ],
};

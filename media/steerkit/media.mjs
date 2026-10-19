// Steerkit's media: scenes drawn by the library itself (scene.js), rendered by make-media.
export default {
  out: "src/content/projects/steerkit",
  scene: "/media/steerkit/scene.js",
  outputs: [
    { file: "cover.png", params: { shot: "stream" }, time: 1.6 },
    { file: "preview.mp4", params: { shot: "stream" } },
    { file: "arrive.png", width: 640, params: { shot: "arrive" }, time: 2.2 },
  ],
};

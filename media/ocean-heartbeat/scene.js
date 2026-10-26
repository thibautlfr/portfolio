// Ocean Heartbeat's media, drawn from the project's own models: the GLB files of its repository
// (served by the recipe's route, see media.mjs), with the positions, rotations and scales of its
// components, lit flat in the shader's palette instead of the project's blue water and sand.
// Shots:
//   card   a title card: the mark, the name, what it is and three facts, with the heart turning
//          as a faint drawing on the white cell. Kept as a shot; the cover is now a capture.
//   reel   the preview loop: the entry's cover (its poster, the live scene), then three pages
//          of the scene, back to the cover.
//   retro  the scene beside its retro mode, one Pixelation pass: the figure of the body.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/+esm";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js/+esm";

const MODELS = "https://ocean-heartbeat.local/models/";

// The project's camera (Experience.jsx), and its Pixelation pass: granularity 15, which on a
// 1440 px window makes 96 blocks across.
const EYE = new THREE.Vector3(0, 4, 5);
const LOOK = new THREE.Vector3(0, 2, 1);
const BLOCKS = 1440 / 15;

// Every model the scene loads, where its components put it. `group` is the component's group,
// `mesh` the transform of its meshes, `at` the props it is placed with. OceanEnvironment sits at
// z = 2.
const ENV = 2;
const LAYOUT = [
  {
    file: "environment/rocks_algae.glb",
    group: { y: 0.8, scale: 3 },
    mesh: { scale: 100 },
    at: [
      { x: 3, z: -8 },
      { ry: 5, x: -9, z: -6.5 },
    ],
  },
  {
    file: "environment/rocks.glb",
    group: { scale: 15 },
    mesh: { rx: -Math.PI / 2, scale: 100 },
    at: [{ x: -3, z: -8 }],
  },
  {
    file: "environment/big_rocks.glb",
    group: { y: 0.7, scale: 20 },
    at: [
      { ry: 5, x: -8, z: -14 },
      { ry: 1.5, x: 3, z: -14 },
      { ry: 3, x: 10, z: -5 },
      { ry: 3.5, x: -16, z: -4 },
    ],
  },
  {
    file: "environment/seaweed.glb",
    group: { y: 0.7, scale: 2 },
    at: [
      { x: -1, z: -8 },
      { ry: Math.PI / 2, x: -6.5, z: -8 },
      { ry: Math.PI / 2, x: 6.3, z: -8 },
      { x: -11, z: -4 },
    ],
  },
  {
    file: "environment/sea_anemone.glb",
    group: { scale: 0.01 },
    at: [
      { x: 0.5, z: -9 },
      { x: -10, z: -3 },
    ],
  },
  {
    file: "environment/star.glb",
    group: { y: 0.3, rz: Math.PI / 2, scale: 0.007 },
    at: [
      { x: 0.5, z: -8 },
      { x: -7, z: -5 },
      { x: 5, z: -5 },
    ],
  },
  {
    file: "environment/shell.glb",
    group: { y: 0.4, scale: 0.02 },
    at: [
      { x: -5, z: -5 },
      { x: 4, y: 0, z: -5 },
    ],
  },
];

// The organs (Experience.jsx): one group each, the mesh inside scaled by GSAP between 0 and 1.
const ORGANS = [
  { name: "heart", file: "heart.glb", group: { ry: Math.PI * 1.5, x: 0, y: 1, z: 1, scale: 0.05 } },
  { name: "brain", file: "brain.glb", group: { x: 0, y: 1, z: 1, scale: 0.014 } },
  { name: "kidneys", file: "kidneys.glb", group: { x: 0, y: 1.2, z: 1, scale: 0.05 } },
];

function alpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16} ${(n >> 8) & 255} ${n & 255} / ${a})`;
}

const clamp01 = (x) => Math.min(Math.max(x, 0), 1);

// GSAP's power4.out, the organs' ease.
const power4Out = (x) => 1 - (1 - clamp01(x)) ** 4;

function transform(object, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1 } = {}) {
  object.position.set(x, y, z);
  object.rotation.set(rx, ry, rz);
  object.scale.setScalar(scale);
  return object;
}

function geometries(gltf) {
  const list = [];
  gltf.scene.traverse((node) => node.isMesh && list.push(node.geometry));
  return list;
}

// A model drawn flat: one colour lit per face, its edges as hairlines.
function solid(geometry, fill, edge, edgeOpacity) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: fill, flatShading: true }));
  const lines = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 25),
    new THREE.LineBasicMaterial({ color: edge, transparent: true, opacity: edgeOpacity }),
  );
  mesh.add(lines);
  return mesh;
}

async function load(files) {
  const loader = new GLTFLoader();
  const entries = await Promise.all(files.map(async (file) => [file, await loader.loadAsync(MODELS + file)]));
  return Object.fromEntries(entries);
}

// ---------------------------------------------------------------------------------------------
// The seabed: the project's layout, its organs and its anglerfish, at any time `t`.

function seabed(kit, models) {
  const { colors } = kit;
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(10, 10, 10);
  scene.add(sun);

  const sand = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshLambertMaterial({ color: colors.deep }));
  sand.rotation.x = -Math.PI / 2;
  scene.add(sand);

  const environment = transform(new THREE.Group(), { z: ENV });
  scene.add(environment);
  for (const { file, group, mesh, at } of LAYOUT) {
    for (const props of at) {
      const node = transform(new THREE.Group(), { ...group, ...props });
      for (const geometry of geometries(models[file])) {
        node.add(transform(solid(geometry, colors.teal, colors.ink, 0.35), mesh));
      }
      environment.add(node);
    }
  }

  const organs = ORGANS.map(({ name, file, group }) => {
    const node = transform(new THREE.Group(), group);
    const [geometry] = geometries(models[file]);
    const mesh = solid(geometry, colors.ivory, colors.ink, 0.3);
    node.add(mesh);
    scene.add(node);
    return { name, mesh };
  });

  const fish = new THREE.Group();
  for (const geometry of geometries(models["angler_fish.glb"])) {
    fish.add(solid(geometry, colors.teal, colors.ink, 0.35));
  }
  scene.add(fish);

  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

  return {
    scene,
    camera,
    // `shown` gives each organ's scale at time t.
    pose(t, shown) {
      for (const organ of organs) {
        const scale = shown(organ.name, t);
        organ.mesh.scale.setScalar(scale);
        organ.mesh.visible = scale > 1e-3;
        organ.mesh.rotation.y = t * 0.2;
      }
      // AnglerFish.jsx: a steady drift along x, wrapped at ±22.5, and a sway on y and z.
      const x = -2 - 1.8 * t;
      fish.position.set(((((x + 22.5) % 45) + 45) % 45) - 22.5, 4, -8 - Math.sin(t));
      fish.rotation.set(0, 2.6 + Math.sin(t), 0);
      fish.scale.setScalar(0.8);
      // The camera eases toward the pointer; here the pointer drifts on its own.
      camera.position.set(EYE.x + 0.5 * Math.sin(t * 0.7), EYE.y + 0.2 * Math.sin(t * 0.45), EYE.z);
      camera.lookAt(LOOK);
    },
  };
}

// One organ on show, or a list of switches: [time, name], each scaled in over a second.
function selection(first, switches = []) {
  return (name, t) => {
    let value = name === first ? 1 : 0;
    for (const [at, selected] of switches) {
      if (t < at) break;
      const target = name === selected ? 1 : 0;
      value += (target - value) * power4Out(t - at);
    }
    return value;
  };
}

// Draws a three.js scene into a 2D canvas, optionally pixelated left of `split`.
function painter(kit) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(kit.pixelRatio);
  const small = document.createElement("canvas");
  const tiny = small.getContext("2d");
  return (target, scene, camera, { clear = kit.colors.ink, clearAlpha = 1, pixelate = 0 } = {}) => {
    const { context: c, width, height } = target;
    const size = renderer.getSize(new THREE.Vector2());
    if (size.x !== width || size.y !== height) renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setClearColor(clear, clearAlpha);
    renderer.render(scene, camera);
    c.drawImage(renderer.domElement, 0, 0, width, height);
    if (pixelate > 0) {
      // Pixelation samples one point per block: drawn down without smoothing, then up.
      const block = width / BLOCKS;
      small.width = Math.round(width / block);
      small.height = Math.round(height / block);
      tiny.imageSmoothingEnabled = false;
      tiny.drawImage(renderer.domElement, 0, 0, small.width, small.height);
      c.save();
      c.beginPath();
      c.rect(0, 0, pixelate, height);
      c.clip();
      c.imageSmoothingEnabled = false;
      c.drawImage(small, 0, 0, width, height);
      c.restore();
    }
  };
}

// ---------------------------------------------------------------------------------------------
// The sheets, in the site's type.

function element(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of [children].flat()) node.append(child);
  return node;
}

// A heart cut in facets, the way the project's models are: light on the dark square.
const HEART = "M16 26.5 5 15.5V10l4-4h4l3 3.5L19 6h4l4 4v5.5Z";
const MARK = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32"/><path d="${HEART}"/></svg>`;

function mark() {
  const node = element("span", "kit-mark");
  node.innerHTML = MARK;
  return node;
}

function sheet(kit, rows) {
  const node = element("div", "kit-sheet kit-framed", rows);
  node.style.gridTemplateRows = rows.map((row) => (row.dataset.grow ? "minmax(0, 1fr)" : "auto")).join(" ");
  const page = element("div", "kit-page", node);
  kit.layer.append(page);
  return page;
}

function row(cells, grow = false) {
  const node = element("div", "kit-row", cells);
  if (grow) node.dataset.grow = "true";
  return node;
}

function fact(label, value) {
  return element("div", "kit-cell kit-fact", [element("p", "kit-label", label), element("p", "kit-text", value)]);
}

// The site's --ease-out, cubic-bezier(0.16, 1, 0.3, 1), for pages sliding up.
function easeOut(x) {
  const curve = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  let [low, high] = [0, 1];
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    if (curve(0.16, 0.3, mid) < x) low = mid;
    else high = mid;
  }
  return curve(1, 1, (low + high) / 2);
}

// Behind the card: the heart alone, white with its facets drawn in the hairline colour, turning.
function drawing(kit, models) {
  const scene = new THREE.Scene();
  const [geometry] = geometries(models["heart.glb"]);
  geometry.computeBoundingSphere();
  const { center, radius } = geometry.boundingSphere;
  const heart = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: kit.colors.surface }));
  heart.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 1),
      new THREE.LineBasicMaterial({ color: kit.colors.line }),
    ),
  );
  const pivot = new THREE.Group();
  heart.position.copy(center).negate();
  pivot.add(heart);
  scene.add(pivot);
  const camera = new THREE.PerspectiveCamera(30, 1, radius * 0.1, radius * 20);
  return (target, paint, time) => {
    const { width, height } = target;
    pivot.rotation.set(0.15, Math.PI * 1.5 + time * 0.2, 0);
    camera.position.set(0, 0, radius / Math.sin(THREE.MathUtils.degToRad(15)) / 0.82);
    camera.lookAt(0, 0, 0);
    camera.setViewOffset(width, height, -width * 0.32, 0, width, height);
    paint(target, scene, camera, { clearAlpha: 0 });
  };
}

function card(kit, paint, models) {
  const main = element("div", "kit-cell kit-card", [
    element("p", "kit-label", "Nuit de l'Info · 2024"),
    element("div", "kit-heading", [
      element("div", "kit-name", [mark(), element("h1", "kit-display", "Ocean Heartbeat")]),
      element("p", "kit-lede", "The human body and the ocean, in one underwater scene."),
    ]),
  ]);
  const node = sheet(kit, [
    row([main], true),
    row([
      fact("Made in", "One night, as a team of two"),
      fact("Award", "“On veut du gros pixel” challenge"),
      fact("Built with", "React Three Fiber"),
    ]),
  ]);
  const canvas = kit.canvasIn(main);
  main.prepend(canvas.context.canvas);
  const draw = drawing(kit, models);
  return {
    node,
    draw(time) {
      canvas.context.clearRect(0, 0, canvas.width, canvas.height);
      draw(canvas, paint, time);
    },
  };
}

function page(kit, { number, title, code, aside, draw }) {
  const ink = element("div", "kit-cell kit-flush kit-ink");
  const node = sheet(kit, [
    row([
      element("div", "kit-cell kit-case", [
        element("div", "", [
          element("p", "kit-data", number),
          element("h2", "kit-title", title),
          element("p", "kit-data kit-code", code),
        ]),
        element("p", "kit-label kit-aside", aside),
      ]),
    ]),
    row([ink], true),
    row([
      element("div", "kit-cell kit-foot", [
        element("p", "kit-text kit-name-small", [mark(), "Ocean Heartbeat"]),
        element("p", "kit-data", "ocean-heartbeat.thibaut-lefrancois.com"),
      ]),
    ]),
  ]);
  const canvas = kit.canvasIn(ink);
  return {
    node,
    draw(time) {
      draw(canvas, Math.max(time, 0));
    },
  };
}

function label(kit, c, text, x, y, align = "left") {
  c.font = `400 ${kit.sizes.label}px ${kit.fonts.data}`;
  c.fillStyle = alpha(kit.colors.ivory, 0.6);
  c.textAlign = align;
  c.textBaseline = "top";
  c.fillText(text, x, y);
}

// ---------------------------------------------------------------------------------------------

async function prepare(kit) {
  const files = [...new Set([...LAYOUT, ...ORGANS].map(({ file }) => file)), "angler_fish.glb"];
  const models = await load(files);
  return { models, paint: painter(kit), sea: seabed(kit, models) };
}

function cardShot(kit, { models, paint }) {
  const { draw } = card(kit, paint, models);
  return { duration: 6, frame: draw };
}

// The entry's cover as it is, the loop's poster: the reel opens and closes on it, so starting
// the loop on hover changes nothing on screen. Served by the dev server, beside the entry.
const COVER = "/src/content/projects/ocean-heartbeat/cover.png";

async function still(kit, src) {
  const image = element("img", "kit-still");
  image.src = src;
  image.alt = "";
  await image.decode();
  const node = element("div", "kit-page", image);
  kit.layer.append(node);
  return {
    node,
    draw() {
      // A still: nothing to draw over time.
    },
  };
}

async function reel(kit, { paint, sea }) {
  const slide = 0.55;
  const heartOnly = selection("heart");
  const swap = selection("heart", [
    [0.5, "brain"],
    [1.6, "kidneys"],
  ]);
  const scales = (t) => ORGANS.map(({ name }) => `${name} ${swap(name, t).toFixed(2)}`).join("   ");
  const parts = [
    { length: 1.2, ...(await still(kit, COVER)) },
    {
      length: 2,
      ...page(kit, {
        number: "01",
        title: "An organ on the seabed.",
        code: 'useGLTF("./models/heart.glb")',
        aside: "Eleven free low-poly models, placed by hand: 716 KB in all.",
        draw(target, t) {
          sea.pose(t + 2, heartOnly);
          paint(target, sea.scene, sea.camera);
        },
      }),
    },
    {
      length: 2.6,
      ...page(kit, {
        number: "02",
        title: "Three organs, swapped by scale.",
        code: 'gsap.to(mesh.scale, { x: 1, y: 1, z: 1, ease: "power4.out" })',
        aside: "All three are mounted at load, so a switch never waits on the network.",
        draw(target, t) {
          sea.pose(t + 4, (name) => swap(name, t));
          paint(target, sea.scene, sea.camera);
          const margin = Math.round(target.height * 0.07);
          label(kit, target.context, scales(t), margin, margin);
        },
      }),
    },
    {
      length: 2.2,
      ...page(kit, {
        number: "03",
        title: "Retro mode, one pass.",
        code: "<Pixelation granularity={15} />",
        aside: "It replaces the water and tilt-shift passes. The scene does not change.",
        draw(target, t) {
          sea.pose(t + 6.6, heartOnly);
          const split = target.width * easeOut(clamp01((t - 0.5) / 0.9));
          paint(target, sea.scene, sea.camera, { pixelate: split });
          const c = target.context;
          if (split > 0 && split < target.width) {
            c.fillStyle = kit.colors.coral;
            c.fillRect(Math.round(split) - 1, 0, 2, target.height);
          }
        },
      }),
    },
  ];
  let offset = 0;
  for (const part of parts) [part.begin, offset] = [offset, offset + part.length];
  const duration = offset;

  return {
    duration,
    frame(time) {
      const t = ((time % duration) + duration) % duration;
      parts.forEach((part, i) => {
        const closing = i === 0 && t > duration - slide;
        const local = closing ? t - duration : t - part.begin;
        const next = parts[i + 1];
        const covered = next ? t >= next.begin + slide : t >= duration;
        const visible = closing || (local >= 0 && !covered && !(i === parts.length - 1 && t > duration));
        const entering =
          i > 0 || closing ? Math.min(Math.max((closing ? t - duration + slide : local) / slide, 0), 1) : 1;
        part.node.style.visibility = visible ? "visible" : "hidden";
        part.node.style.zIndex = String(closing ? parts.length : i);
        part.node.style.transform = `translateY(${(1 - easeOut(entering)) * 100}%)`;
        if (visible) part.draw(local);
      });
    },
  };
}

function retroShot(kit, { paint, sea }) {
  const { context: c, width, height, params } = kit;
  const target = { context: c, width, height };
  return {
    duration: 4,
    frame(time) {
      sea.pose(time, selection("heart"));
      paint(target, sea.scene, sea.camera, { pixelate: width / 2 });
      c.fillStyle = kit.colors.coral;
      c.fillRect(Math.round(width / 2) - 1, 0, 2, height);
      if (!params.has("bare")) {
        const margin = Math.round(height * 0.06);
        const bottom = height - margin - kit.sizes.label;
        label(kit, c, "Pixelation, granularity 15", margin, bottom - kit.sizes.label * 1.5);
        label(kit, c, "WaterEffect and TiltShift2 off", margin, bottom);
        label(kit, c, "The same scene", width - margin, bottom, "right");
      }
    },
  };
}

const shots = { card: cardShot, reel, retro: retroShot };

export default async function setup(kit) {
  const shot = shots[kit.params.get("shot") ?? "card"];
  if (!shot) throw new Error(`ocean-heartbeat scene: unknown shot ${kit.params.get("shot")}`);
  return await shot(kit, await prepare(kit));
}

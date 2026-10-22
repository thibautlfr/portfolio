// The figures of the note on the design system, set as sheets of the site: nothing is drawn on
// the canvas, every value and picture is the site's own. Shots (`shot` of /media-kit/):
//   roles     the vocabulary: six colour roles painted with their tokens, and three type roles
//             set in their faces, each under its token's name.
//   surfaces  two places the system runs outside the CSS: an Open Graph card and a case study
//             figure drawn on /media-kit/.
//   covers    what the system leaves alone: Steerkit's title card beside Ocarina's captured cover.

function element(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of [children].flat()) node.append(child);
  return node;
}

async function picture(src, alt = "") {
  const image = element("img", "kit-picture");
  image.src = src;
  image.alt = alt;
  await image.decode();
  return image;
}

function sheet(kit, rows, template) {
  const node = element("div", "kit-sheet", rows);
  node.style.gridTemplateRows = template;
  kit.layer.append(element("div", "kit-page", node));
}

// A still: the layer holds the whole picture, nothing is drawn on the canvas.
const still = {
  duration: 1,
  frame() {
    return undefined;
  },
};

// The stylesheet writes white as #fff: shown with six digits, like the other roles.
const longHex = (value) => value.replace(/^#(\w)(\w)(\w)$/, "#$1$1$2$2$3$3");

const COLOURS = [
  ["ground", "ground"],
  ["surface", "surface"],
  ["text", "text"],
  ["text-muted", "textMuted"],
  ["line", "line"],
  ["accent", "accent"],
];

const FACES = [
  { token: "--font-title", face: "Stack Sans Headline 700", sample: "Selected work", className: "kit-title" },
  { token: "--font-text", face: "Stack Sans Text 300 to 600", sample: "Running text", className: "kit-lede" },
  { token: "--font-data", face: "Fragment Mono 400", sample: "46.16° N", className: "kit-data kit-strong" },
];

function rolesShot(kit) {
  const colour = ([role, key]) => {
    const swatch = element("div", "kit-swatch");
    swatch.style.background = `var(--color-${role})`;
    return element("div", "kit-cell kit-specimen", [
      swatch,
      element("p", "kit-data", `--color-${role}`),
      element("p", "kit-label", longHex(kit.colors[key] ?? "")),
    ]);
  };
  const face = ({ token, face: name, sample, className }) =>
    element("div", "kit-cell kit-specimen", [
      element("p", className, sample),
      element("p", "kit-data", token),
      element("p", "kit-label", name),
    ]);
  sheet(
    kit,
    [
      element("div", "kit-row", COLOURS.slice(0, 3).map(colour)),
      element("div", "kit-row", COLOURS.slice(3).map(colour)),
      element("div", "kit-row", FACES.map(face)),
    ],
    "minmax(0, 1fr) minmax(0, 1fr) auto",
  );
  return still;
}

function surface(image, title, note) {
  return [
    element("div", "kit-cell kit-ground", image),
    element("div", "kit-cell kit-specimen", [element("p", "kit-text", title), element("p", "kit-label", note)]),
  ];
}

async function pair(kit, left, right) {
  const [a, b] = await Promise.all([picture(left.src), picture(right.src)]);
  const [aImage, aText] = surface(a, left.title, left.note);
  const [bImage, bText] = surface(b, right.title, right.note);
  sheet(
    kit,
    [element("div", "kit-row", [aImage, bImage]), element("div", "kit-row", [aText, bText])],
    "auto minmax(0, 1fr)",
  );
  return still;
}

const surfacesShot = (kit) =>
  pair(
    kit,
    {
      src: "/og/notes/one-design-system-for-everything-around-me.png",
      title: "Open Graph card",
      note: "Rendered at build time by Satori, from seven colours a test compares with the tokens.",
    },
    {
      src: "/src/content/projects/steerkit/arrive.png",
      title: "Case study figure",
      note: "Drawn on /media-kit/, which loads the real tokens, fonts and shader palette.",
    },
  );

const coversShot = (kit) =>
  pair(
    kit,
    {
      src: "/src/content/projects/steerkit/cover.png",
      title: "Steerkit, a library",
      note: "A title card: its only face is its API.",
    },
    {
      src: "/src/content/projects/ocarina/cover.png",
      title: "Ocarina, a game",
      note: "The real title screen, captured and set in the sheet.",
    },
  );

const shots = { roles: rolesShot, surfaces: surfacesShot, covers: coversShot };

export default function setup(kit) {
  const shot = shots[kit.params.get("shot") ?? "roles"];
  if (!shot) throw new Error(`design system note scene: unknown shot ${kit.params.get("shot")}`);
  return shot(kit);
}

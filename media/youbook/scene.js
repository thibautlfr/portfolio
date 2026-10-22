// Youbook's media. Client work: nothing of the client's code or interface runs here. Shots
// (`shot` of /media-kit/):
//   cover         a title card: the mark, the name, what it does and three facts, beside a cell of
//                 the ground where the widget and the cart on a phone, captured live, are laid out.
//   architecture  the path of a native booking, at the level of its components. Not published:
//                 kept until Raccourci has read the case study.
//   template      the import before and after the template method, with connectors left unnamed.

function element(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of [children].flat()) node.append(child);
  return node;
}

// The components on a grid of three columns and four rows; `accent` marks the one public entry.
const BOXES = [
  { id: "widgets", col: 1, row: 0, title: "Widgets", note: "on the destination's site" },
  { id: "cart", col: 1, row: 1, title: "Cart API", note: "the only public entry", accent: true },
  { id: "workflow", col: 1, row: 2, title: "Workflow", note: "Temporal, one per cart" },
  { id: "booking", col: 2, row: 2, title: "Booking service", note: "OCTO contract" },
  { id: "payment", col: 0, row: 3, title: "Payment service", note: "Stripe, PayZen" },
  { id: "providers", col: 2, row: 3, title: "Booking software", note: "one per provider" },
];

// A component placed by a diagram: a cell framed by a hairline. Returns its geometry.
function box(kit, { x, y, w, h, title, note, accent = false }) {
  const node = element("div", accent ? "kit-box kit-accent" : "kit-box", [
    element("p", "kit-text", title),
    element("p", "kit-label", note),
  ]);
  Object.assign(node.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
  kit.layer.append(node);
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, r: x + w, b: y + h };
}

// Labels sit beside their arrow, on the ground.
function tag(kit, text, x, y, align = "start") {
  const node = element("p", "kit-data kit-tag", text);
  const shift = { start: "0", middle: "-50%", end: "-100%" }[align];
  Object.assign(node.style, { left: `${x}px`, top: `${y}px`, transform: `translate(${shift}, -50%)` });
  kit.layer.append(node);
}

// A still diagram: the ground, then each arrow as a polyline ending in a filled head.
function diagram(kit, arrows) {
  const { context: c, colors, width, height } = kit;
  return {
    duration: 1,
    frame() {
      c.fillStyle = colors.ground;
      c.fillRect(0, 0, width, height);
      c.strokeStyle = colors.textMuted;
      c.fillStyle = colors.textMuted;
      c.lineWidth = 1.25;
      const head = 7;
      for (const points of arrows) {
        c.beginPath();
        points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.stroke();
        const [x0, y0] = points.at(-2);
        const [x1, y1] = points.at(-1);
        const angle = Math.atan2(y1 - y0, x1 - x0);
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x1 - head * Math.cos(angle - 0.45), y1 - head * Math.sin(angle - 0.45));
        c.lineTo(x1 - head * Math.cos(angle + 0.45), y1 - head * Math.sin(angle + 0.45));
        c.closePath();
        c.fill();
      }
    },
  };
}

function architectureShot(kit) {
  const { width, height } = kit;
  const margin = Math.round(width * 0.04);
  const columns = 3;
  const rows = 4;
  const gapX = Math.round(width * 0.1);
  const gapY = Math.round(height * 0.085);
  const w = (width - 2 * margin - (columns - 1) * gapX) / columns;
  const h = (height - 2 * margin - (rows - 1) * gapY) / rows;
  const placed = {};
  for (const b of BOXES) {
    placed[b.id] = box(kit, { ...b, x: margin + b.col * (w + gapX), y: margin + b.row * (h + gapY), w, h });
  }

  const { widgets, cart, workflow, booking, payment, providers } = placed;
  const pad = 8;
  const arrows = [
    [
      [widgets.cx - 40, widgets.b],
      [cart.cx - 40, cart.y],
    ],
    [
      [cart.cx + 40, cart.y],
      [widgets.cx + 40, widgets.b],
    ],
    [
      [cart.cx, cart.b],
      [workflow.cx, workflow.y],
    ],
    [
      [cart.r, cart.cy],
      [booking.cx, cart.cy],
      [booking.cx, booking.y],
    ],
    [
      [workflow.r, workflow.cy],
      [booking.x, workflow.cy],
    ],
    [
      [booking.cx, booking.b],
      [providers.cx, providers.y],
    ],
    [
      [workflow.x, workflow.cy],
      [payment.cx, workflow.cy],
      [payment.cx, payment.y],
    ],
  ];
  tag(kit, "identifiers only", widgets.cx - 40 - pad, (widgets.b + cart.y) / 2, "end");
  tag(kit, "status, SSE", widgets.cx + 40 + pad, (widgets.b + cart.y) / 2);
  tag(kit, "start, signal", cart.cx + pad, (cart.b + workflow.y) / 2);
  tag(kit, "prices, holds", (cart.r + booking.cx) / 2 + pad, cart.cy - 14, "middle");
  tag(kit, "confirm", (workflow.r + booking.x) / 2, workflow.cy - 14, "middle");
  tag(kit, "adapters", booking.cx + pad, (booking.b + providers.y) / 2);
  tag(kit, "authorise, capture", payment.cx + pad, (workflow.b + payment.y) / 2);

  return diagram(kit, arrows);
}

// The import before and after the template method: on the left, every connector runs a pipeline
// of its own; on the right, one base pipeline runs the steps and asks each connector for its part.
function templateShot(kit) {
  const { width, height } = kit;
  const margin = Math.round(width * 0.04);
  const gap = Math.round(width * 0.08);
  const column = (width - 2 * margin - gap) / 2;
  const top = margin + 36;
  const bottom = height - margin;
  const left = margin;
  const right = margin + column + gap;
  tag(kit, "Before: a pipeline per connector", left, margin + 10);
  tag(kit, "After: one skeleton", right, margin + 10);

  const rows = 3;
  const space = 14;
  const h = (bottom - top - (rows - 1) * space) / rows;
  for (const [i, name] of ["A", "B", "C"].entries()) {
    box(kit, {
      x: left,
      y: top + i * (h + space),
      w: column,
      h,
      title: `Connector ${name}`,
      note: "fetch, build every field, store, count, log",
    });
  }

  const base = box(kit, {
    x: right,
    y: top,
    w: column,
    h: h * 1.25,
    title: "Base pipeline",
    note: "startup, import, store, unpublish what is gone",
    accent: true,
  });
  const childGap = 12;
  const childW = (column - 2 * childGap) / 3;
  const childH = h * 1.1;
  const childY = bottom - childH;
  const arrows = [];
  for (const [i, name] of ["A", "B", "C"].entries()) {
    const child = box(kit, {
      x: right + i * (childW + childGap),
      y: childY,
      w: childW,
      h: childH,
      title: name,
      note: "import, getters",
    });
    arrows.push([
      [child.cx, child.y],
      [child.cx, base.b],
    ]);
  }
  tag(kit, "extends", right + childW / 2 + 8, (base.b + childY) / 2);
  return diagram(kit, arrows);
}

async function capture(src) {
  const image = element("img", "kit-still kit-capture");
  image.src = src;
  image.alt = "";
  await image.decode();
  return image;
}

// The mark: the two o of Youbook's own logo and their arcs, in its blue. The style attribute wins
// over the kit's favicon fill, which the site's own marks use.
const MARK = `<svg viewBox="645 16 340 289" aria-hidden="true"><path style="fill: #2c93f4" d="M759.55,41.18v-.02c6.47.84,12.45-3.55,13.58-9.96,1.17-6.63-3.26-12.94-9.88-14.11-40.81-5.83-81.31,12.49-103.88,46.99-7.02,10.57-11.91,22.4-14.4,34.83,5.58-10.75,12.83-20.55,21.47-29.04,24.8-23.67,59.29-34.3,93.11-28.69ZM956.28,260.78c-27.36,20.66-62.85,27.25-95.8,17.78v-.02c-6.49-1.78-13.19,2.03-14.97,8.52-1.78,6.49,2.03,13.19,8.52,14.97,51.44,15.18,111.08-16.72,126.92-67.64-6.78,10.05-15.1,18.95-24.67,26.39ZM978.4399999999999,135.01999999999998c-4.6-10.87-11.23-20.77-19.52-29.17-8.35-8.37-18.22-15.07-29.09-19.72-11.34-4.85-23.56-7.31-35.89-7.24-12.25-.07-24.38,2.4-35.62,7.25-10.82,4.66-20.68,11.31-29.06,19.6-1.12,1.1-2.12,2.31-3.17,3.47-9.71-18.96-25.77-33.9-45.38-42.22-11.34-4.85-23.56-7.32-35.9-7.25-12.25-.07-24.38,2.4-35.63,7.25-10.82,4.67-20.67,11.31-29.05,19.59-8.39,8.37-15.08,18.28-19.72,29.19-4.84,11.38-7.31,23.62-7.24,35.99-.07,12.25,2.4,24.39,7.25,35.64,4.67,10.82,11.36,20.66,19.71,28.98,8.38,8.28,18.23,14.92,29.04,19.59,11.25,4.85,23.38,7.32,35.63,7.25,12.34.08,24.56-2.39,35.91-7.25,10.84-4.64,20.7-11.3,29.07-19.61,1.05-1.05,1.99-2.19,3-3.29,4.33,8.28,9.89,15.85,16.5,22.45,8.38,8.29,18.23,14.93,29.05,19.6,11.25,4.85,23.38,7.32,35.63,7.25,12.33.08,24.55-2.39,35.89-7.24,21.89-9.28,39.31-26.7,48.59-48.59,4.78-11.26,7.21-23.38,7.14-35.61.08-12.32-2.35-24.52-7.14-35.88v-.05ZM895.52,214.89999999999998c-24.68,0-44.69-20.01-44.69-44.69s20.01-44.69,44.69-44.69c24.68,0,44.69,20.01,44.69,44.69s-20.01,44.69-44.69,44.69ZM745.0899999999999,195.42999999999998c-24.68,0-44.69-20.01-44.69-44.69s20.01-44.69,44.69-44.69,44.69,20.01,44.69,44.69-20.01,44.69-44.69,44.69Z"/></svg>`;

function fact(label, value) {
  return element("div", "kit-cell kit-fact", [element("p", "kit-label", label), element("p", "kit-text", value)]);
}

// A capture framed on its cell, placed in percents of the cell. The widget's box keeps the
// ratio of the widget alone (760 of the capture's 1100 px), so the price box beside it is left out.
function shot(image, { left, top, width, height }) {
  const node = element("div", "kit-shot", image);
  Object.assign(node.style, { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` });
  return node;
}

async function coverShot(kit) {
  const [desktop, phone] = await Promise.all([
    capture("/media/youbook/captures/widget.png"),
    capture("/media/youbook/captures/cart-mobile.png"),
  ]);
  const mark = element("span", "kit-mark kit-logo");
  mark.innerHTML = MARK;
  const card = element("div", "kit-cell kit-card", [
    element("p", "kit-label", "Client work · Raccourci Agency · 2026"),
    element("div", "kit-heading", [
      element("div", "kit-name", [mark, element("h1", "kit-display kit-display-short", "Youbook")]),
      element("p", "kit-lede", "One cart and one payment for every activity of a destination."),
    ]),
  ]);
  // The captures lie on the site's ground: ink made their white pages look cut out
  const showcase = element("div", "kit-cell kit-flush kit-ground", [
    shot(desktop, { left: 7, top: 12, width: 70, height: 54 }),
    shot(phone, { left: 57, top: 28, width: 36, height: 63 }),
  ]);
  const top = element("div", "kit-row", [card, showcase]);
  top.style.gridTemplateColumns = "minmax(0, 11fr) minmax(0, 9fr)";
  const facts = element("div", "kit-row", [
    fact("Built", "Native booking, the second version"),
    fact("Back", "Kotlin, Temporal, PostgreSQL"),
    fact("Front", "Vue 3 widgets on any site"),
  ]);
  const sheet = element("div", "kit-sheet", [top, facts]);
  sheet.style.gridTemplateRows = "minmax(0, 1fr) auto";
  kit.layer.append(element("div", "kit-page", sheet));
  return {
    duration: 1,
    frame() {
      // A still: the layer holds the whole picture, nothing is drawn on the canvas
    },
  };
}

const shots = { cover: coverShot, architecture: architectureShot, template: templateShot };

export default function setup(kit) {
  const shot = shots[kit.params.get("shot") ?? "architecture"];
  if (!shot) throw new Error(`youbook scene: unknown shot ${kit.params.get("shot")}`);
  return shot(kit);
}

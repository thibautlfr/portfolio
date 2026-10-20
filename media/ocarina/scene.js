// Ocarina's media, drawn from Ocarina's own code: the songs come from the game's `songs.ts`
// (served by the recipe's route, see media.mjs) and the fairies fly on the published steerkit,
// with the options and weights of the game's fairy.ts. Nothing of Nintendo's or of the game's own
// look: ink cells in the shader's palette, inside sheets set in the site's type. Shots:
//   card    a title card: the mark, the name, what it is and three facts, over a faint staff
//           of songs scrolling on the white cell. Kept as a shot; the cover is now a capture.
//   reel    the preview loop: the entry's cover (its poster, the game's title screen), then
//           three pages of the game, back to the cover.
//   detect  Zelda's Lullaby recognized at the end of the notes played: the figure of the body.
import { add, arrive, brake, keepAway, step, zero } from "https://cdn.jsdelivr.net/npm/steerkit@0.4.0/+esm";
import { songs } from "https://ocarina.local/songs.js";

const HZ = 60;

const vec = (x = 0, y = 0) => ({ x, y, z: 0 });

// mulberry32, so every render draws the same frame.
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function alpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16} ${(n >> 8) & 255} ${n & 255} / ${a})`;
}

const clamp01 = (x) => Math.min(Math.max(x, 0), 1);

// ---------------------------------------------------------------------------------------------
// The ocarina's five buttons, in the order of OCARINA_BUTTONS: their note on the treble staff,
// in steps above its bottom line (E4), and the key that plays them.

const BUTTONS = {
  A: { step: -1, key: "Space", note: "D4" },
  CDown: { step: 1, key: "Down", note: "F4" },
  CRight: { step: 3, key: "Right", note: "A4" },
  CLeft: { step: 4, key: "Left", note: "B4" },
  CUp: { step: 6, key: "Up", note: "D5" },
};
const ORDER = ["A", "CDown", "CRight", "CLeft", "CUp"];

// The C buttons are triangles pointing their way; A is a disc.
const ANGLE = { CDown: Math.PI / 2, CRight: 0, CLeft: Math.PI, CUp: -Math.PI / 2 };

function drawGlyph(c, button, x, y, r, color) {
  c.fillStyle = color;
  c.beginPath();
  if (button === "A") {
    c.arc(x, y, r * 0.78, 0, Math.PI * 2);
  } else {
    const a = ANGLE[button];
    for (let i = 0; i < 3; i++) {
      const t = a + (i * Math.PI * 2) / 3;
      c[i ? "lineTo" : "moveTo"](x + Math.cos(t) * r, y + Math.sin(t) * r);
    }
    c.closePath();
  }
  c.fill();
}

// The detector's own test, from song-detector.ts: do the notes played end with these buttons?
const endsWith = (history, buttons) =>
  history.length >= buttons.length &&
  buttons.every((button, i) => history[history.length - buttons.length + i] === button);
const HISTORY_LENGTH = Math.max(...songs.map((song) => song.buttons.length));

function staff(c, colors, x0, x1, top, gap) {
  c.strokeStyle = alpha(colors.ivory, 0.22);
  c.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = Math.round(top + i * gap) + 0.5;
    c.beginPath();
    c.moveTo(x0, y);
    c.lineTo(x1, y);
    c.stroke();
  }
}
// The y of a button's note, `bottom` being the staff's bottom line.
const noteY = (button, bottom, gap) => bottom - (BUTTONS[button].step * gap) / 2;

function label(c, kit, text, x, y, color, align = "left") {
  c.font = `400 ${kit.sizes.label}px ${kit.fonts.data}`;
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = "middle";
  c.fillText(text, x, y);
}

// 01: notes played on the keys, each one written on the staff as it sounds.
function playing(kit) {
  const random = seeded(4);
  const presses = [];
  for (let t = 0.15, last = ""; t < 3; t += 0.28 + random() * 0.12) {
    let button;
    do button = ORDER[Math.floor(random() * 5)];
    while (button === last);
    presses.push({ t, button });
    last = button;
  }
  return (c, width, height, time) => {
    const { colors } = kit;
    const gap = height * 0.07;
    const top = height * 0.16;
    const bottom = top + gap * 4;
    staff(c, colors, 0, width, top, gap);
    // Notes enter at the right of the staff and drift left as the next ones come.
    const head = width * 0.86;
    const speed = width * 0.2;
    for (const { t, button } of presses) {
      if (t > time) continue;
      const x = head - (time - t) * speed;
      if (x < -20) continue;
      const fresh = time - t < 0.25;
      drawGlyph(c, button, x, noteY(button, bottom, gap), gap * 0.62, fresh ? colors.ivory : colors.teal);
    }
    // The five keys, the one held lit.
    const held = presses.findLast(({ t }) => t <= time && time - t < 0.22)?.button;
    const keyY = height * 0.74;
    const spacing = Math.min(width / 6, height * 0.3);
    ORDER.forEach((button, i) => {
      const x = width / 2 + (i - 2) * spacing;
      const size = spacing * 0.64;
      const on = button === held;
      c.fillStyle = on ? colors.deep : "transparent";
      c.fillRect(x - size / 2, keyY - size / 2, size, size);
      c.strokeStyle = alpha(colors.ivory, on ? 0.9 : 0.3);
      c.lineWidth = 1;
      c.strokeRect(
        Math.round(x - size / 2) + 0.5,
        Math.round(keyY - size / 2) + 0.5,
        Math.round(size),
        Math.round(size),
      );
      drawGlyph(c, button, x, keyY - size * 0.05, size * 0.2, on ? colors.ivory : alpha(colors.ivory, 0.55));
      label(
        c,
        kit,
        `${BUTTONS[button].key} · ${BUTTONS[button].note}`,
        x,
        keyY + size * 0.72,
        alpha(colors.ivory, 0.6),
        "center",
      );
    });
  };
}

// 02: a few stray notes, then Zelda's Lullaby; the detector finds it at the end of the history.
function detecting(kit) {
  const lullaby = songs.find((song) => song.name === "Zelda's Lullaby");
  const played = ["CUp", "A", ...lullaby.buttons];
  const pace = 0.17;
  return (c, width, height, time) => {
    const { colors } = kit;
    const count = Math.min(played.length, Math.floor(time / pace) + 1);
    const history = played.slice(0, count).slice(-HISTORY_LENGTH);
    const found = endsWith(history, lullaby.buttons);
    const since = found ? time - (played.length - 1) * pace : 0;

    // The history, one cell per note, the newest on the right.
    const cell = Math.min(width * 0.085, height * 0.17);
    const x0 = width / 2 - (HISTORY_LENGTH * cell) / 2;
    const y0 = height * 0.2;
    for (let i = 0; i < HISTORY_LENGTH; i++) {
      const x = x0 + i * cell;
      const button = history[history.length - HISTORY_LENGTH + i];
      const inSong = found && i >= HISTORY_LENGTH - lullaby.buttons.length;
      if (inSong) {
        c.fillStyle = alpha(colors.deep, clamp01(since / 0.2));
        c.fillRect(x, y0, cell, cell);
      }
      c.strokeStyle = alpha(colors.ivory, 0.3);
      c.lineWidth = 1;
      c.strokeRect(Math.round(x) + 0.5, Math.round(y0) + 0.5, Math.round(cell), Math.round(cell));
      if (button) drawGlyph(c, button, x + cell / 2, y0 + cell / 2, cell * 0.24, inSong ? colors.ivory : colors.teal);
    }
    label(c, kit, `history, the last ${HISTORY_LENGTH} notes`, x0, y0 - cell * 0.3, alpha(colors.ivory, 0.6));

    // The song's score under it, aligned with the cells that end the history.
    const gap = cell * 0.26;
    const top = y0 + cell * 1.9;
    const bottom = top + gap * 4;
    const sx0 = x0 + (HISTORY_LENGTH - lullaby.buttons.length) * cell;
    staff(c, colors, sx0, x0 + HISTORY_LENGTH * cell, top, gap);
    lullaby.buttons.forEach((button, i) => {
      drawGlyph(
        c,
        button,
        sx0 + (i + 0.5) * cell,
        noteY(button, bottom, gap),
        gap * 0.62,
        found ? colors.ivory : alpha(colors.ivory, 0.45),
      );
    });
    label(c, kit, lullaby.name, sx0, bottom + gap * 2.4, found ? colors.ivory : alpha(colors.ivory, 0.6));

    // The match: a coral bracket joining the end of the history to the song.
    if (found) {
      const grow = clamp01(since / 0.3);
      const y = y0 + cell + cell * 0.3;
      const x1 = sx0 + (x0 + HISTORY_LENGTH * cell - sx0) * grow;
      c.strokeStyle = colors.coral;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(sx0 + 1, y - cell * 0.15);
      c.lineTo(sx0 + 1, y);
      c.lineTo(x1 - 1, y);
      if (grow === 1) c.lineTo(x1 - 1, y - cell * 0.15);
      c.stroke();
    }
  };
}

// 03: four fairies on steerkit around the ocarina, with the game's options and weights, seen
// from above. The one in focus carries Reynolds' diagram.
function flying(width, height) {
  const random = seeded(12);
  const area = { x: width / 2 - 0.4, y: height / 2 - 0.35 };
  const ocarina = vec(0, 0);
  const ARRIVE = { slowingDistance: 1.2, weight: 1.5 };
  const BRAKE = { weight: 2 };
  const AVOID_OCARINA = { radius: 1.1, weight: 10 };
  const range = (a, b) => a + random() * (b - a);
  const pickTarget = (out) => {
    do [out.x, out.y] = [range(-area.x, area.x), range(-area.y, area.y)];
    while (Math.hypot(out.x, out.y) < 1.6);
    return out;
  };
  const fairies = Array.from({ length: 4 }, (_, i) => {
    const pace = range(0.8, 1.2);
    return {
      position: pickTarget(vec()),
      velocity: vec(),
      maxSpeed: 1.1 * pace,
      maxForce: 6,
      target: pickTarget(vec()),
      retargetIn: range(3, 7),
      hoverFor: 0,
      force: vec(),
      desired: vec(),
      flap: i * 1.7,
      trail: [],
    };
  });
  const f = vec();
  return {
    ocarina,
    radius: AVOID_OCARINA.radius,
    step(dt) {
      for (const a of fairies) {
        a.retargetIn -= dt;
        a.hoverFor = Math.max(0, a.hoverFor - dt);
        if (a.retargetIn <= 0 || Math.hypot(a.target.x - a.position.x, a.target.y - a.position.y) < 0.3) {
          pickTarget(a.target);
          a.retargetIn = range(4, 8);
          if (random() < 0.35) a.hoverFor = range(0.8, 2.5);
        }
        zero(a.force);
        if (a.hoverFor > 0) add(a.force, brake(a, f), BRAKE.weight);
        else add(a.force, arrive(a, a.target, ARRIVE, f), ARRIVE.weight);
        add(a.force, keepAway(a, ocarina, AVOID_OCARINA, f), AVOID_OCARINA.weight);
        step(a, a.force, dt);
        a.flap += dt * (8 + 10 * Math.hypot(a.velocity.x, a.velocity.y));
        a.trail.push(a.position.x, a.position.y);
        if (a.trail.length > 90) a.trail.splice(0, 2);
      }
    },
    draw(c, unit, colors, w, h) {
      const cx = w / 2;
      const cy = h / 2;
      const p = (v) => [cx + v.x * unit, cy + v.y * unit];
      // The sphere the fairies keep out of, and the ocarina in it.
      c.fillStyle = alpha(colors.teal, 0.08);
      c.beginPath();
      c.arc(cx, cy, AVOID_OCARINA.radius * unit, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = alpha(colors.ivory, 0.4);
      c.lineWidth = 1;
      c.setLineDash([5, 6]);
      c.stroke();
      c.setLineDash([]);
      drawOcarina(c, cx, cy, unit * 1.5, colors.deep);

      fairies.forEach((a, i) => {
        const focus = i === 0;
        c.strokeStyle = alpha(focus ? colors.ivory : colors.teal, 0.22);
        c.lineWidth = 1.5;
        c.beginPath();
        for (let k = 0; k < a.trail.length; k += 2) {
          const [x, y] = p({ x: a.trail[k], y: a.trail[k + 1] });
          c[k ? "lineTo" : "moveTo"](x, y);
        }
        c.stroke();
        const [x, y] = p(a.position);
        if (focus) {
          // Velocity in ivory, desired velocity (velocity plus force) in dashed teal, the force
          // between their tips in coral.
          const k = 0.9 * unit;
          const [vx, vy] = [x + a.velocity.x * k, y + a.velocity.y * k];
          const [dx, dy] = [x + (a.velocity.x + a.force.x * 0.25) * k, y + (a.velocity.y + a.force.y * 0.25) * k];
          drawArrow(c, x, y, dx, dy, colors.teal, 2, 8, [6, 5]);
          drawArrow(c, x, y, vx, vy, colors.ivory, 2, 8);
          drawArrow(c, vx, vy, dx, dy, colors.coral, 2.5, 8);
          // Its target, a small coral ring.
          const [tx, ty] = p(a.target);
          c.strokeStyle = colors.coral;
          c.lineWidth = 1.5;
          c.beginPath();
          c.arc(tx, ty, 9, 0, Math.PI * 2);
          c.stroke();
        }
        drawFairy(
          c,
          x,
          y,
          Math.atan2(a.velocity.y, a.velocity.x),
          focus ? 15 : 12,
          a.flap,
          focus ? colors.ivory : colors.teal,
        );
      });
    },
  };
}

function drawArrow(c, x0, y0, x1, y1, color, width, head, dash = []) {
  const length = Math.hypot(x1 - x0, y1 - y0);
  if (length < head * 0.5) return;
  const angle = Math.atan2(y1 - y0, x1 - x0);
  c.strokeStyle = color;
  c.lineWidth = width;
  c.setLineDash(dash);
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x1 - Math.cos(angle) * head * 0.6, y1 - Math.sin(angle) * head * 0.6);
  c.stroke();
  c.setLineDash([]);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x1 - Math.cos(angle - 0.45) * head, y1 - Math.sin(angle - 0.45) * head);
  c.lineTo(x1 - Math.cos(angle + 0.45) * head, y1 - Math.sin(angle + 0.45) * head);
  c.closePath();
  c.fill();
}

// A body and two wings that beat, flat.
function drawFairy(c, x, y, heading, r, flap, color) {
  const open = 0.55 + 0.45 * Math.abs(Math.sin(flap));
  c.save();
  c.translate(x, y);
  c.rotate(heading);
  c.fillStyle = alpha(color, 0.45);
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(-r * 0.3, side * r * 0.9 * open, r * 0.9, r * 0.42 * open, side * 0.5, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = color;
  c.beginPath();
  c.arc(0, 0, r * 0.55, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

// The ocarina, the shape of the mark: a body with its holes, and the mouthpiece, in a 32 unit box
// tilted as in the mark. Shared by the mark's SVG and the canvas.
const BODY =
  "M7.5 18a10 6.5 0 1 0 20 0a10 6.5 0 1 0 -20 0Z" +
  "M12.6 16.6a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z" +
  "M16.7 15.4a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z" +
  "M20.8 16.6a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z" +
  "M16.9 21a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 1 0 -2.2 0Z";
const MOUTHPIECE = "M3 15.6h6.5v3.8H3Z";
const TILT = -15;

function drawOcarina(c, x, y, size, color) {
  c.save();
  c.translate(x, y);
  c.rotate((TILT * Math.PI) / 180);
  c.scale(size / 32, size / 32);
  c.translate(-16, -16);
  c.fillStyle = color;
  c.fill(new Path2D(BODY), "evenodd");
  c.fill(new Path2D(MOUTHPIECE));
  c.restore();
}

function timeline(create) {
  let sim = create();
  let now = 0;
  return (time) => {
    if (time < now) {
      sim = create();
      now = 0;
    }
    for (; now + 1 / HZ <= time; now += 1 / HZ) sim.step(1 / HZ);
    return sim;
  };
}

// ---------------------------------------------------------------------------------------------
// Sheets, built in the kit's layer with its classes.

function element(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of [children].flat()) node.append(child);
  return node;
}

// The ocarina redrawn like the site's favicon: a dark square, the instrument light, its holes dark.
const MARK =
  '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32"/>' +
  `<g transform="rotate(${TILT} 16 16)"><path fill-rule="evenodd" d="${BODY}"/><path d="${MOUTHPIECE}"/></g></svg>`;

function mark() {
  const node = element("span", "kit-mark");
  node.innerHTML = MARK;
  return node;
}

function sheet(kit, rows) {
  const node = element("div", "kit-sheet", rows);
  node.style.gridTemplateRows = rows.map((row) => (row.dataset.grow ? "minmax(0, 1fr)" : "auto")).join(" ");
  const page = element("div", "kit-page", node);
  kit.layer.append(page);
  return page;
}

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

function row(cells, grow = false) {
  const node = element("div", "kit-row", cells);
  if (grow) node.dataset.grow = "true";
  return node;
}

function fact(label, value, data = false) {
  return element("div", "kit-cell kit-fact", [
    element("p", "kit-label", label),
    element("p", data ? "kit-data kit-strong" : "kit-text", value),
  ]);
}

// Behind the card: every song's buttons, one after the other, scrolling on a faint staff.
function songStrip(kit, canvas) {
  const notes = songs.flatMap((song) => song.buttons);
  return (time) => {
    const c = canvas.context;
    const { width, height } = canvas;
    const gap = height * 0.06;
    const top = height * 0.14;
    const bottom = top + gap * 4;
    const spacing = gap * 2.2;
    c.strokeStyle = kit.colors.line;
    c.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = Math.round(top + i * gap) + 0.5;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(width, y);
      c.stroke();
    }
    const shift = (time * spacing * 0.8) % (notes.length * spacing);
    for (let i = 0; i < notes.length; i++) {
      let x = width * 0.08 + i * spacing - shift;
      if (x < -spacing) x += notes.length * spacing;
      if (x > width + spacing) continue;
      drawGlyph(c, notes[i], x, noteY(notes[i], bottom, gap), gap * 0.55, kit.colors.line);
    }
  };
}

function card(kit) {
  const main = element("div", "kit-cell kit-card", [
    element("p", "kit-label", "Personal project · 2026"),
    element("div", "kit-heading", [
      element("div", "kit-name", [mark(), element("h1", "kit-display", "Ocarina")]),
      element("p", "kit-lede", "The songs of Hyrule, played in the browser."),
    ]),
  ]);
  const node = sheet(kit, [
    row([main], true),
    row([
      fact("Songs", `${songs.length}, from two games`),
      fact("Play", "Keyboard and touch"),
      fact("Built with", "Three.js and TypeScript"),
    ]),
  ]);
  const canvas = kit.canvasIn(main);
  main.prepend(canvas.context.canvas);
  const strip = songStrip(kit, canvas);
  return {
    node,
    draw(time) {
      canvas.context.clearRect(0, 0, canvas.width, canvas.height);
      strip(time);
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
        element("p", "kit-text kit-name-small", [mark(), "Ocarina"]),
        element("p", "kit-data", "ocarina.thibaut-lefrancois.com"),
      ]),
    ]),
  ]);
  const canvas = kit.canvasIn(ink);
  return {
    node,
    draw(time) {
      const c = canvas.context;
      c.clearRect(0, 0, canvas.width, canvas.height);
      draw(c, canvas.width, canvas.height, Math.max(time, 0));
    },
  };
}

function fairiesDraw(kit, start) {
  let sim;
  let unit;
  return (c, width, height, time) => {
    if (!sim) {
      unit = height / 4.6;
      sim = timeline(() => flying(width / unit, 4.6));
    }
    sim(start + time).draw(c, unit, kit.colors, width, height);
  };
}

// ---------------------------------------------------------------------------------------------

function cardShot(kit) {
  const { draw } = card(kit);
  return { duration: 6, frame: draw };
}

// The entry's cover as it is, the loop's poster: the reel opens and closes on it, so starting
// the loop on hover changes nothing on screen. Served by the dev server, beside the entry.
const COVER = "/src/content/projects/ocarina/cover.png";

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

async function reel(kit) {
  const slide = 0.55;
  const parts = [
    { length: 1.2, ...(await still(kit, COVER)) },
    {
      length: 2,
      ...page(kit, {
        number: "01",
        title: "Every key plays the game's note.",
        code: "const button = KEY_BUTTONS[e.code]",
        aside: "Keys read by position, so any layout plays. Touch presses the same keys.",
        draw: playing(kit),
      }),
    },
    {
      length: 2,
      ...page(kit, {
        number: "02",
        title: "A song, found at the end of the notes.",
        code: "endsWith(history, song.buttons)",
        aside: `${songs.length} songs. The rhythm is left out: it only drives the replay.`,
        draw: detecting(kit),
      }),
    },
    {
      length: 2,
      ...page(kit, {
        number: "03",
        title: "Four fairies, flying on steerkit.",
        code: "arrive + keepAway(ocarina, { radius: 1.1 }) + step",
        aside: "The game's own options and weights, seen from above.",
        draw: fairiesDraw(kit, 3),
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

function detectShot(kit) {
  const { context: c, colors, params } = kit;
  const draw = detecting(kit);
  return {
    duration: 3,
    frame(time) {
      c.fillStyle = colors.ink;
      c.fillRect(0, 0, kit.width, kit.height);
      c.save();
      c.translate(0, kit.height * 0.08);
      draw(c, kit.width, kit.height * 0.92, time);
      c.restore();
      if (!params.has("bare")) {
        const margin = Math.round(kit.height * 0.075);
        c.font = `400 ${kit.sizes.text}px ${kit.fonts.data}`;
        c.fillStyle = alpha(colors.ivory, 0.85);
        c.textAlign = "left";
        c.textBaseline = "top";
        c.fillText("endsWith(history, song.buttons)", margin, margin);
      }
    },
  };
}

const shots = { card: cardShot, reel, detect: detectShot };

export default async function setup(kit) {
  const shot = shots[kit.params.get("shot") ?? "card"];
  if (!shot) throw new Error(`ocarina scene: unknown shot ${kit.params.get("shot")}`);
  return await shot(kit);
}

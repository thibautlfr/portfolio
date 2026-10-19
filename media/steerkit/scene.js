// Steerkit's media, drawn by Steerkit: the published package runs every agent, on ink cells in
// the shader's palette, inside sheets set in the site's own type. Shots (`shot` of /media-kit/):
//   card    the title card: the mark, the name, what it is and three facts, over a faint crowd
//           wandering on the white cell. The cover, and the first frame of the reel.
//   reel    the preview loop: the card, then three use cases of the library, back to the card.
//   arrive  one agent overshooting a target and turning back inside the slowing distance: the
//           figure of the case study.
import {
  addWithin,
  alignment,
  arrive,
  avoidObstacles,
  cohesion,
  createGrid,
  createNeighbors,
  createWanderState,
  followPath,
  keepAway,
  queryGrid,
  separation,
  stayWithin,
  step,
  updateGrid,
  wander,
  zero,
} from "https://cdn.jsdelivr.net/npm/steerkit@0.4.0/+esm";

// Physics runs at a fixed step, so a frame drawn at any time is the same on every render.
const HZ = 60;
// Vectors are drawn as where the agent would be after this long (0.6 s in the demos, shorter
// here so the diagram stays inside a crowd).
const VECTOR_SECONDS = 0.4;

const vec = (x = 0, y = 0) => ({ x, y, z: 0 });

// A small seeded generator (mulberry32), so every render draws the same crowd.
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

function drawAgent(c, x, y, angle, size, color) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(size, 0);
  c.lineTo(-size * 0.7, size * 0.6);
  c.lineTo(-size * 0.4, 0);
  c.lineTo(-size * 0.7, -size * 0.6);
  c.closePath();
  c.fill();
  c.restore();
}

function drawArrow(c, x0, y0, x1, y1, color, width, head, dash = []) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const length = Math.hypot(dx, dy);
  if (length < head * 0.5) return;
  const angle = Math.atan2(dy, dx);
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

// Reynolds' diagram, in the palette: velocity in ivory, desired velocity in teal, and the
// steering force between their tips in coral.
function drawDiagram(c, colors, unit, p, v, f, seconds = VECTOR_SECONDS) {
  const k = seconds * unit;
  const [px, py] = [p.x * unit, p.y * unit];
  const [vx, vy] = [px + v.x * k, py + v.y * k];
  const [dx, dy] = [px + (v.x + f.x) * k, py + (v.y + f.y) * k];
  const head = 9;
  drawArrow(c, px, py, dx, dy, colors.teal, 2, head, [6, 5]);
  drawArrow(c, px, py, vx, vy, colors.ivory, 2, head);
  drawArrow(c, vx, vy, dx, dy, colors.coral, 2.5, head);
}

// ---------------------------------------------------------------------------------------------
// Simulations. Each one is created at time 0 and stepped at a fixed rate; `timeline` replays it
// to any time, from the start when asked for an earlier one, so a frame depends on its time only.

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

const box = (x0, y0, x1, y1) => ({ min: vec(x0, y0), max: vec(x1, y1) });

// The crowd behind the card: agents wandering inside the cell, faint.
function wanderers(width, height, count) {
  const random = seeded(3);
  const bounds = box(0.2, 0.2, width - 0.2, height - 0.2);
  const agents = Array.from({ length: count }, () => {
    const angle = random() * Math.PI * 2;
    return {
      agent: {
        position: vec(random() * width, random() * height),
        velocity: vec(Math.cos(angle), Math.sin(angle)),
        maxSpeed: 0.9 + random() * 0.5,
        maxForce: 2,
      },
      state: createWanderState(random),
      force: vec(),
      inside: vec(),
      roam: vec(),
    };
  });
  return {
    step(dt) {
      for (const a of agents) {
        zero(a.force);
        addWithin(a.force, a.agent.maxForce, stayWithin(a.agent, bounds, { margin: 0.6, lookAhead: 0.8 }, a.inside));
        addWithin(
          a.force,
          a.agent.maxForce,
          wander(a.agent, a.state, { radius: 1, distance: 1.5, jitter: 2, plane: "xy" }, dt, a.roam),
        );
        step(a.agent, a.force, dt);
      }
    },
    draw(c, unit, color) {
      for (const { agent: a } of agents)
        drawAgent(c, a.position.x * unit, a.position.y * unit, Math.atan2(a.velocity.y, a.velocity.x), 8, color);
    },
  };
}

// 01: one agent arriving on a target, with Reynolds' diagram.
function arriving(width, height) {
  const slowingDistance = 2.2;
  const target = vec(width * 0.54, height * 0.57);
  const agent = { position: vec(-0.2, height * 0.98), velocity: vec(3.4, -0.6), maxSpeed: 3.4, maxForce: 2.4 };
  const force = vec();
  const trail = [];
  arrive(agent, target, { slowingDistance }, force);
  return {
    slowingDistance,
    step(dt) {
      trail.push(agent.position.x, agent.position.y);
      step(agent, force, dt);
      arrive(agent, target, { slowingDistance }, force);
    },
    draw(c, unit, colors) {
      const [tx, ty] = [target.x * unit, target.y * unit];
      c.fillStyle = alpha(colors.teal, 0.08);
      c.beginPath();
      c.arc(tx, ty, slowingDistance * unit, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = alpha(colors.ivory, 0.45);
      c.lineWidth = 1;
      c.setLineDash([5, 6]);
      c.stroke();
      c.setLineDash([]);

      c.strokeStyle = alpha(colors.ivory, 0.25);
      c.lineWidth = 1.5;
      c.beginPath();
      for (let i = 0; i < trail.length; i += 2) c[i ? "lineTo" : "moveTo"](trail[i] * unit, trail[i + 1] * unit);
      c.lineTo(agent.position.x * unit, agent.position.y * unit);
      c.stroke();

      c.strokeStyle = colors.coral;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(tx, ty, 11, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = colors.coral;
      c.beginPath();
      c.arc(tx, ty, 4.5, 0, Math.PI * 2);
      c.fill();

      const { position: p, velocity: v } = agent;
      drawDiagram(c, colors, unit, p, v, force, 0.6);
      drawAgent(c, p.x * unit, p.y * unit, Math.atan2(v.y, v.x), 11, colors.ivory);
    },
  };
}

// 02: a school that holds together and keeps away from a shark, its neighbors found through the
// spatial grid.
function schooling(width, height) {
  const random = seeded(21);
  const bounds = box(0.4, 0.4, width - 0.4, height - 0.4);
  const neighborhood = { radius: 1.1 };
  const apart = { radius: 0.45 };
  const fish = Array.from({ length: 180 }, () => {
    const angle = random() * Math.PI * 2;
    return {
      position: vec(width * (0.2 + random() * 0.3), height * (0.3 + random() * 0.4)),
      velocity: vec(Math.cos(angle) * 2, Math.sin(angle) * 2),
      maxSpeed: 2.6 + random() * 0.6,
      maxForce: 7,
      state: createWanderState(random),
      force: vec(),
    };
  });
  const shark = { position: vec(width * 0.85, height * 0.5), velocity: vec(-1.5, 0.4), maxSpeed: 2.3, maxForce: 2.5 };
  const sharkState = createWanderState(seeded(5));
  const keepOff = { radius: 2.4 };
  const grid = createGrid({ cellSize: neighborhood.radius, plane: "xy" });
  const near = createNeighbors();
  const [force, f, center] = [vec(), vec(), vec()];
  return {
    keepOff,
    step(dt) {
      updateGrid(grid, fish);
      for (const a of fish) {
        zero(a.force);
        const n = queryGrid(grid, a.position, neighborhood.radius, near);
        addWithin(a.force, a.maxForce, stayWithin(a, bounds, { margin: 0.8, lookAhead: 0.6 }, f));
        addWithin(a.force, a.maxForce, keepAway(a, shark.position, keepOff, f), 4);
        addWithin(a.force, a.maxForce, separation(a, n, apart, f), 2);
        addWithin(a.force, a.maxForce, alignment(a, n, neighborhood, f), 1);
        addWithin(a.force, a.maxForce, cohesion(a, n, neighborhood, f), 0.8);
        addWithin(
          a.force,
          a.maxForce,
          wander(a, a.state, { radius: 1, distance: 2, jitter: 2, plane: "xy" }, dt, f),
          0.3,
        );
      }
      for (const a of fish) step(a, a.force, dt);
      // The shark goes for the middle of the school, wandering on the way.
      zero(center);
      for (const a of fish)
        [center.x, center.y] = [center.x + a.position.x / fish.length, center.y + a.position.y / fish.length];
      zero(force);
      addWithin(force, shark.maxForce, stayWithin(shark, bounds, { margin: 1, lookAhead: 1 }, f));
      addWithin(force, shark.maxForce, arrive(shark, center, { slowingDistance: 1 }, f));
      addWithin(
        force,
        shark.maxForce,
        wander(shark, sharkState, { radius: 1, distance: 2, jitter: 2, plane: "xy" }, dt, f),
        0.6,
      );
      step(shark, force, dt);
    },
    draw(c, unit, colors) {
      const { position: p, velocity: v } = shark;
      c.fillStyle = alpha(colors.teal, 0.08);
      c.beginPath();
      c.arc(p.x * unit, p.y * unit, keepOff.radius * unit, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = alpha(colors.ivory, 0.4);
      c.lineWidth = 1;
      c.setLineDash([5, 6]);
      c.stroke();
      c.setLineDash([]);
      for (const a of fish)
        drawAgent(c, a.position.x * unit, a.position.y * unit, Math.atan2(a.velocity.y, a.velocity.x), 7, colors.teal);
      drawAgent(c, p.x * unit, p.y * unit, Math.atan2(v.y, v.x), 20, colors.ivory);
    },
  };
}

// 03: a crowd following a closed road around rocks, the forces summed by priority.
function following(width, height) {
  const random = seeded(8);
  const road = [];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const wobble = 1 + 0.12 * Math.sin(3 * a) + 0.06 * Math.cos(5 * a);
    road.push(vec(width / 2 + Math.cos(a) * width * 0.36 * wobble, height / 2 + Math.sin(a) * height * 0.33 * wobble));
  }
  const rocks = [
    [0.5, 0.5, 1.5],
    [0.22, 0.24, 0.45],
    [0.8, 0.3, 0.5],
    [0.33, 0.83, 0.4],
    [0.7, 0.78, 0.55],
  ].map(([x, y, r]) => ({ position: vec(width * x, height * y), radius: r }));
  const lane = { radius: 0.45, lookAhead: 0.5, closed: true };
  const crowd = Array.from({ length: 46 }, (_, i) => {
    const point = road[Math.floor((i / 46) * road.length)];
    return {
      position: vec(point.x + (random() - 0.5) * 0.4, point.y + (random() - 0.5) * 0.4),
      velocity: vec(),
      maxSpeed: 2.2 + random() * 0.8,
      maxForce: 5,
      force: vec(),
    };
  });
  const f = vec();
  return {
    lane,
    step(dt) {
      for (const a of crowd) {
        zero(a.force);
        addWithin(a.force, a.maxForce, avoidObstacles(a, rocks, { radius: 0.15, lookAhead: 0.8, plane: "xy" }, f));
        addWithin(a.force, a.maxForce, separation(a, crowd, { radius: 0.5 }, f), 1.5);
        addWithin(a.force, a.maxForce, followPath(a, road, lane, f));
      }
      for (const a of crowd) step(a, a.force, dt);
    },
    draw(c, unit, colors) {
      c.strokeStyle = alpha(colors.ivory, 0.07);
      c.lineWidth = lane.radius * 2 * unit;
      c.lineJoin = "round";
      c.beginPath();
      road.forEach((p, i) => c[i ? "lineTo" : "moveTo"](p.x * unit, p.y * unit));
      c.closePath();
      c.stroke();
      c.strokeStyle = alpha(colors.ivory, 0.3);
      c.lineWidth = 1;
      c.setLineDash([5, 6]);
      c.stroke();
      c.setLineDash([]);
      c.fillStyle = colors.deep;
      for (const { position: o, radius } of rocks) {
        c.beginPath();
        c.arc(o.x * unit, o.y * unit, radius * unit, 0, Math.PI * 2);
        c.fill();
      }
      for (const a of crowd)
        drawAgent(c, a.position.x * unit, a.position.y * unit, Math.atan2(a.velocity.y, a.velocity.x), 8, colors.ivory);
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Sheets, built in the kit's layer with its classes: the site's own type and hairlines.

function element(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of [children].flat()) node.append(child);
  return node;
}

const MARK =
  '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32"/><path d="M24 16 10 23.5l3.5-7.5L10 8.5Z"/></svg>';

function mark() {
  const node = element("span", "kit-mark");
  node.innerHTML = MARK;
  return node;
}

// A page of the reel: the ground and one sheet on it, so a page sliding in covers the last one.
function sheet(kit, rows) {
  const node = element("div", "kit-sheet", rows);
  node.style.gridTemplateRows = rows.map((row) => (row.dataset.grow ? "minmax(0, 1fr)" : "auto")).join(" ");
  const page = element("div", "kit-page", node);
  kit.layer.append(page);
  return page;
}

// cubic-bezier(0.16, 1, 0.3, 1), the site's --ease-out, solved for x by bisection.
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

function card(kit) {
  const main = element("div", "kit-cell kit-card", [
    element("p", "kit-label", "Open source library · MIT · v0.4"),
    element("div", "kit-heading", [
      element("div", "kit-name", [mark(), element("h1", "kit-display", "steerkit")]),
      element("p", "kit-lede", "Steering behaviors for games, as small typed functions."),
    ]),
  ]);
  const node = sheet(kit, [
    row([main], true),
    row([
      fact("Install", "npm i steerkit", true),
      fact("Core", "TypeScript, zero dependency"),
      fact("Adapter", "Three.js, steerkit/three"),
    ]),
  ]);
  const canvas = kit.canvasIn(main);
  main.prepend(canvas.context.canvas);
  const unit = canvas.height / 10;
  const crowd = timeline(() => wanderers(canvas.width / unit, 10, 70));
  return {
    node,
    draw(time) {
      const c = canvas.context;
      c.clearRect(0, 0, canvas.width, canvas.height);
      crowd(4 + time).draw(c, unit, kit.colors.line);
    },
  };
}

function useCase(kit, { number, title, code, aside, create, height, start = 0, speed = 1 }) {
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
        element("p", "kit-text kit-name-small", [mark(), "steerkit"]),
        element("p", "kit-data", "steerkit.thibaut-lefrancois.com"),
      ]),
    ]),
  ]);
  const canvas = kit.canvasIn(ink);
  const unit = canvas.height / height;
  const sim = timeline(() => create(canvas.width / unit, height));
  return {
    node,
    draw(time) {
      const c = canvas.context;
      c.clearRect(0, 0, canvas.width, canvas.height);
      sim(start + Math.max(time, 0) * speed).draw(c, unit, kit.colors);
    },
  };
}

// ---------------------------------------------------------------------------------------------

function cardShot(kit) {
  const { draw } = card(kit);
  return { duration: 6, frame: draw };
}

function reel(kit) {
  // Pages change as the site's do: the next one slides up over the current one.
  const slide = 0.55;
  const parts = [
    { length: 1.2, ...card(kit) },
    {
      length: 2,
      ...useCase(kit, {
        number: "01",
        title: "Arrive, and stop. By name.",
        code: "arrive(agent, target, { slowingDistance: 2.2 }, force)",
        aside: "Velocity, desired velocity and the steering force between them.",
        create: arriving,
        height: 5.6,
        start: 1.2,
      }),
    },
    {
      length: 2,
      ...useCase(kit, {
        number: "02",
        title: "A school of fish, and a shark.",
        code: "separation + alignment + cohesion + keepAway",
        aside: "180 fish, their neighbors found through the spatial grid.",
        create: schooling,
        height: 10,
        start: 4,
      }),
    },
    {
      length: 2,
      ...useCase(kit, {
        number: "03",
        title: "Follow a path, dodge the rocks.",
        code: "avoidObstacles + separation + followPath",
        aside: "Summed by priority with addWithin().",
        create: following,
        height: 10,
        start: 3,
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
        // The card slides in again over the last page at the end, where the loop starts over.
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

function arriveShot(kit) {
  const { context: c, colors, params } = kit;
  // Closer than the reel: the figure is shown at the width of the text.
  const height = 5.6;
  const unit = kit.height / height;
  const sim = timeline(() => arriving(kit.width / unit, height));
  return {
    duration: 4,
    frame(time) {
      c.fillStyle = colors.ink;
      c.fillRect(0, 0, kit.width, kit.height);
      const state = sim(time);
      state.draw(c, unit, colors);
      if (!params.has("bare")) {
        const margin = Math.round(kit.height * 0.075);
        c.font = `400 ${kit.sizes.text}px ${kit.fonts.data}`;
        c.fillStyle = alpha(colors.ivory, 0.85);
        c.textBaseline = "top";
        c.fillText(`arrive(agent, target, { slowingDistance: ${state.slowingDistance} }, force)`, margin, margin);
      }
    },
  };
}

const shots = { card: cardShot, reel, arrive: arriveShot };

export default function setup(kit) {
  const shot = shots[kit.params.get("shot") ?? "card"];
  if (!shot) throw new Error(`steerkit scene: unknown shot ${kit.params.get("shot")}`);
  return shot(kit);
}

// Steerkit, drawn by Steerkit: the published package runs every agent of these scenes, in the
// shader's palette and the site's mono. Shots (the `shot` parameter of /media-kit/):
//   stream  a crowd crossing the frame and parting around two drifting obstacles; one agent
//           shows Reynolds' diagram. Cover and preview loop.
//   arrive  one agent overshooting a target and turning back inside the slowing distance.
import {
  add,
  arrive,
  avoidObstacles,
  createWanderState,
  seek,
  step,
  wander,
  zero,
} from "https://cdn.jsdelivr.net/npm/steerkit@0.4.0/+esm";

// World units: the height is 10, whatever the ratio.
const HEIGHT = 10;
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

function dataLine(c, kit, items, color) {
  const { width, height, sizes, fonts } = kit;
  const margin = Math.round(height * 0.055);
  c.font = `400 ${sizes.label}px ${fonts.data}`;
  c.fillStyle = color;
  c.textBaseline = "alphabetic";
  c.textAlign = "left";
  c.fillText(items[0] ?? "", margin, height - margin);
  c.textAlign = "right";
  c.fillText(items[1] ?? "", width - margin, height - margin);
}

// ---------------------------------------------------------------------------------------------

function stream(kit) {
  const { context: c, colors, params } = kit;
  const unit = kit.height / HEIGHT;
  const width = kit.width / unit;
  const period = Number(params.get("period") ?? 6);
  // Agents spawned per period. Each one only answers the obstacles and its own wander, never
  // the others, so its path depends on its spawn slot alone: the agent of slot j in the next period
  // runs the same path one period later, and the loop closes exactly.
  const perPeriod = Number(params.get("count") ?? 320);
  const avoidance = { radius: 0.12, lookAhead: 2, plane: "xy" };
  const margin = 1;
  const random = seeded(Number(params.get("seed") ?? 11));

  // Two obstacles drifting on closed paths of one period.
  const obstacles = [
    {
      position: vec(),
      radius: 1.9,
      at: (a) => [width * 0.6 + 0.4 * Math.sin(a + 0.8), HEIGHT * 0.46 + 0.7 * Math.sin(a)],
    },
    {
      position: vec(),
      radius: 0.9,
      at: (a) => [width * 0.3 + 0.4 * Math.sin(a + 2.4), HEIGHT * 0.72 - 0.8 * Math.sin(a + 1.2)],
    },
  ];
  const placeObstacles = (t) => {
    const a = (2 * Math.PI * t) / period;
    for (const obstacle of obstacles) [obstacle.position.x, obstacle.position.y] = obstacle.at(a);
    return obstacles;
  };

  const dt = 1 / HZ;
  const lifetime = 3 * period;
  const paths = [];
  for (let j = 0; j < perPeriod; j++) {
    const spawn = ((j + random()) * period) / perPeriod;
    const lane = 0.6 + random() * (HEIGHT - 1.2);
    const speed = 2.6 + random() * 1.2;
    const agent = { position: vec(-margin, lane), velocity: vec(speed, 0), maxSpeed: speed, maxForce: 6 };
    const state = createWanderState(seeded(j * 7919 + 1));
    const ahead = vec(width + 10, lane);
    const [force, goal, away, roam] = [vec(), vec(), vec(), vec()];
    const samples = [];
    for (let age = 0; age < lifetime && agent.position.x < width + margin; age += dt) {
      zero(force);
      add(force, seek(agent, ahead, goal), 1);
      add(force, avoidObstacles(agent, placeObstacles(spawn + age), avoidance, away), 3);
      add(force, wander(agent, state, { radius: 1, distance: 2, jitter: 2, plane: "xy" }, dt, roam), 0.4);
      // The force as step applies it, bounded by maxForce.
      const { position: p, velocity: v } = agent;
      const bound = Math.min(1, agent.maxForce / (Math.hypot(force.x, force.y) || 1));
      samples.push(p.x, p.y, v.x, v.y, force.x * bound, force.y * bound);
      step(agent, force, dt);
    }
    paths.push({ spawn, samples: Float32Array.from(samples), length: samples.length / 6 });
  }

  // The highlighted agent: by default, the one steered hardest as it reaches the big obstacle,
  // in front of it and just outside it, where the diagram reads best.
  const [big] = obstacles;
  const lead =
    params.get("lead") === null
      ? paths.reduce(
          (best, path, j) => {
            let strongest = 0;
            for (let k = 0; k < path.length; k++) {
              const [x, y] = [path.samples[k * 6], path.samples[k * 6 + 1]];
              const [ox, oy] = big.at((2 * Math.PI * (path.spawn + k * dt)) / period);
              const d = Math.hypot(x - ox, y - oy);
              if (x < ox && d > big.radius + 0.2 && d < big.radius + 1)
                strongest = Math.max(strongest, Math.hypot(path.samples[k * 6 + 4], path.samples[k * 6 + 5]));
            }
            return strongest > best.strongest ? { j, strongest } : best;
          },
          { j: 0, strongest: 0 },
        ).j
      : Number(params.get("lead"));

  // Every age at which slot j is alive at loop time u: one per period it has lived through.
  const ages = (path, u) => {
    const list = [];
    for (let age = (((u - path.spawn) % period) + period) % period; age < path.length * dt; age += period)
      list.push(age);
    return list;
  };
  const at = (path, age, j) => path.samples[Math.min(Math.round(age * HZ), path.length - 1) * 6 + j];

  const trail = 0.7;
  const trailSteps = 14;
  return {
    duration: period,
    frame(time) {
      const u = ((time % period) + period) % period;
      c.fillStyle = colors.ink;
      c.fillRect(0, 0, kit.width, kit.height);

      placeObstacles(u);
      c.fillStyle = colors.deep;
      for (const { position: o, radius } of obstacles) {
        c.beginPath();
        c.arc(o.x * unit, o.y * unit, radius * unit, 0, Math.PI * 2);
        c.fill();
      }

      // Trails fade toward their tail: one stroke per step back in time, for the whole crowd.
      const alive = [];
      paths.forEach((path, j) => ages(path, u).forEach((age) => alive.push([path, age, j])));
      c.lineWidth = 1;
      c.lineCap = "round";
      for (let s = trailSteps; s > 0; s--) {
        c.strokeStyle = alpha(colors.teal, 0.55 * (1 - (s - 1) / trailSteps));
        c.beginPath();
        for (const [path, age] of alive) {
          const a0 = age - (trail * s) / trailSteps;
          const a1 = age - (trail * (s - 1)) / trailSteps;
          if (a1 <= 0) continue;
          c.moveTo(at(path, Math.max(a0, 0), 0) * unit, at(path, Math.max(a0, 0), 1) * unit);
          c.lineTo(at(path, a1, 0) * unit, at(path, a1, 1) * unit);
        }
        c.stroke();
      }
      for (const [path, age, j] of alive) {
        if (j === lead) continue;
        drawAgent(
          c,
          at(path, age, 0) * unit,
          at(path, age, 1) * unit,
          Math.atan2(at(path, age, 3), at(path, age, 2)),
          6,
          colors.teal,
        );
      }

      for (const age of ages(paths[lead], u)) {
        const path = paths[lead];
        const p = vec(at(path, age, 0), at(path, age, 1));
        const v = vec(at(path, age, 2), at(path, age, 3));
        drawDiagram(c, colors, unit, p, v, vec(at(path, age, 4), at(path, age, 5)));
        drawAgent(c, p.x * unit, p.y * unit, Math.atan2(v.y, v.x), 9, colors.ivory);
      }

      if (!params.has("bare"))
        dataLine(
          c,
          kit,
          [`avoidObstacles(agent, obstacles, { radius: 0.12, lookAhead: 2 }, away)`, `${alive.length} agents`],
          alpha(colors.ivory, 0.6),
        );
    },
  };
}

// ---------------------------------------------------------------------------------------------

function arriveShot(kit) {
  const { context: c, colors, params } = kit;
  // Closer than the stream: the figure is shown at the width of the text.
  const height = 5.6;
  const unit = kit.height / height;
  const width = kit.width / unit;
  const slowingDistance = 2.2;
  const target = vec(width * 0.54, height * 0.57);
  const agent = { position: vec(-0.2, height * 0.98), velocity: vec(3.4, -0.6), maxSpeed: 3.4, maxForce: 2.4 };
  const force = vec();
  const dt = 1 / HZ;
  const duration = 4;
  const frames = Math.round(duration * HZ);
  const states = [];
  for (let f = 0; f < frames; f++) {
    arrive(agent, target, { slowingDistance }, force);
    states.push({ p: { ...agent.position }, v: { ...agent.velocity }, f: { ...force } });
    step(agent, force, dt);
  }

  return {
    duration,
    frame(time) {
      const index = Math.min(Math.round(time * HZ), frames - 1);
      c.fillStyle = colors.ink;
      c.fillRect(0, 0, kit.width, kit.height);

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

      // The path so far, then the agent with its diagram.
      c.strokeStyle = alpha(colors.ivory, 0.25);
      c.lineWidth = 1.5;
      c.beginPath();
      states
        .slice(0, index + 1)
        .forEach(({ p }, i) => (i ? c.lineTo(p.x * unit, p.y * unit) : c.moveTo(p.x * unit, p.y * unit)));
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

      const { p, v, f } = states[index];
      drawDiagram(c, colors, unit, p, v, f, 0.6);
      drawAgent(c, p.x * unit, p.y * unit, Math.atan2(v.y, v.x), 11, colors.ivory);

      if (!params.has("bare")) {
        const margin = Math.round(kit.height * 0.075);
        c.font = `400 ${kit.sizes.text}px ${kit.fonts.data}`;
        c.fillStyle = alpha(colors.ivory, 0.85);
        c.textBaseline = "top";
        c.fillText(`arrive(agent, target, { slowingDistance: ${slowingDistance} }, force)`, margin, margin);
      }
    },
  };
}

const shots = { stream, arrive: arriveShot };

export default function setup(kit) {
  const shot = shots[kit.params.get("shot") ?? "stream"];
  if (!shot) throw new Error(`steerkit scene: unknown shot ${kit.params.get("shot")}`);
  return shot(kit);
}

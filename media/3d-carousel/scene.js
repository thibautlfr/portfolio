// 3D Carousel's figure for the note on its first shaders: the Retina bug, before and after the
// fix, drawn by the project's own fragment shader (served by the recipe's route from the
// repository next to the portfolio's). Each ink cell is a small screen drawn at a pixel ratio of
// 2, as on a Retina display: on the left, uResolution in CSS pixels, as first committed; on the
// right, multiplied by the pixel ratio, as fixed. A coral cursor runs a closed path; the dashed
// circle is where the lens should be. Shot:
//   retina  the two cells side by side, one loop of the cursor.

const SHADER = "https://3d-carousel.local/fragment.glsl";
// The figure is about the pixel ratio, so it is fixed here rather than read from the page.
const RATIO = 2;
// The project's own values (src/experience/world/image.ts).
const UNIFORMS = { uVignetteOffset: 1, uVignetteDarkness: 1, uStereoRadius: 0.2, uStereoStrength: 0.04 };
const DURATION = 6;

// A full-cell quad. Three.js would hand the shader vUv from the plane's geometry; here the cell
// is the image, so vUv runs from 0 to 1 across it.
const VERTEX = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

function element(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of [children].flat()) node.append(child);
  return node;
}

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

// The texture: a grid in ivory on ink, so the split shows as fringes on every line. The lines
// are thick for a grid, so the fringes survive at the width of a note's text.
function texture(colors, width, height, step, weight) {
  const canvas = Object.assign(document.createElement("canvas"), { width, height });
  const c = canvas.getContext("2d");
  const [ink, ivory] = [rgb(colors.ink), rgb(colors.ivory)];
  // Blended over the ink beforehand, so the texture is opaque and its alpha plays no part.
  const line = ink.map((v, i) => Math.round(v + (ivory[i] - v) * 0.8));
  c.fillStyle = colors.ink;
  c.fillRect(0, 0, width, height);
  c.fillStyle = `rgb(${line.join(" ")})`;
  for (let x = (width % step) / 2; x < width; x += step) c.fillRect(Math.round(x - weight / 2), 0, weight, height);
  for (let y = (height % step) / 2; y < height; y += step) c.fillRect(0, Math.round(y - weight / 2), width, weight);
  return canvas;
}

function program(gl, fragment) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, `precision highp float;\n${fragment}`));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

// One cell: the shader on a WebGL canvas at RATIO times the cell's CSS size, and a 2D canvas
// over it for the cursor and the circle.
function screen(kit, cell, fragment, fixed) {
  const box = cell.getBoundingClientRect();
  const [width, height] = [box.width, box.height];
  const canvas = Object.assign(document.createElement("canvas"), {
    className: "kit-canvas",
    width: Math.round(width * RATIO),
    height: Math.round(height * RATIO),
  });
  cell.append(canvas);
  const overlay = kit.canvasIn(cell);
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
  if (!gl) throw new Error("3d-carousel scene: no WebGL");

  const p = program(gl, fragment);
  gl.useProgram(p);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(p, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    texture(kit.colors, canvas.width, canvas.height, 48 * RATIO, 3 * RATIO),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const at = (name) => gl.getUniformLocation(p, name);
  gl.uniform1i(at("uTexture"), 0);
  for (const [name, value] of Object.entries(UNIFORMS)) gl.uniform1f(at(name), value);
  // The one line the fix changed: uResolution in CSS pixels, or in the pixels drawn.
  const scale = fixed ? RATIO : 1;
  gl.uniform2f(at("uResolution"), width * scale, height * scale);
  gl.viewport(0, 0, canvas.width, canvas.height);

  return (mouse) => {
    gl.uniform2f(at("uMouse"), mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const c = overlay.context;
    const [x, y] = [mouse.x * width, (1 - mouse.y) * height];
    c.clearRect(0, 0, width, height);
    // Where the lens should be: uStereoRadius is measured in heights of the screen.
    c.strokeStyle = kit.colors.ivory;
    c.globalAlpha = 0.6;
    c.lineWidth = 1.5;
    c.setLineDash([6, 6]);
    c.beginPath();
    c.arc(x, y, UNIFORMS.uStereoRadius * height, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);
    c.globalAlpha = 1;
    // The cursor, its tip on the point.
    c.fillStyle = kit.colors.coral;
    c.strokeStyle = kit.colors.ink;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y + 26);
    c.lineTo(x + 7, y + 20);
    c.lineTo(x + 12, y + 31);
    c.lineTo(x + 16, y + 29);
    c.lineTo(x + 11, y + 18);
    c.lineTo(x + 20, y + 18);
    c.closePath();
    c.fill();
    c.stroke();
  };
}

function heading(number, title, call) {
  return element("div", "kit-cell", [
    element("p", "kit-data", number),
    element("h2", "kit-title", title),
    element("p", "kit-data kit-call", call),
  ]);
}

async function retina(kit) {
  const fragment = await fetch(SHADER).then((response) => response.text());
  const cells = [element("div", "kit-cell kit-flush kit-ink"), element("div", "kit-cell kit-flush kit-ink")];
  const rows = [
    element("div", "kit-row", [
      heading("01", "Before the fix", "uResolution = size"),
      heading("02", "After the fix", "uResolution = size × pixelRatio"),
    ]),
    element("div", "kit-row", cells),
  ];
  const sheet = element("div", "kit-sheet", rows);
  sheet.style.gridTemplateRows = "auto minmax(0, 1fr)";
  kit.layer.append(element("div", "kit-page", sheet));

  const screens = [screen(kit, cells[0], fragment, false), screen(kit, cells[1], fragment, true)];
  return {
    duration: DURATION,
    frame(time) {
      // A closed path in the shader's coordinates (0 to 1, from the bottom left), one turn a loop.
      const a = (time / DURATION) * Math.PI * 2;
      const mouse = { x: 0.56 + 0.26 * Math.cos(a), y: 0.56 + 0.2 * Math.sin(a) };
      for (const draw of screens) draw(mouse);
    },
  };
}

const shots = { retina };

export default function setup(kit) {
  const shot = shots[kit.params.get("shot") ?? "retina"];
  if (!shot) throw new Error(`3d-carousel scene: unknown shot ${kit.params.get("shot")}`);
  return shot(kit);
}

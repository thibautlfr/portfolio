// Pass 1, one fragment per character cell: the warp field, read out for the glyph pass.
// r: value, g: direction of the gradient (for contours), b: how fast the value is changing
// (for decode), a: closeness to the wandering point or the cursor.
uniform vec2 u_cell; // character cell, in canvas pixels
uniform vec2 u_canvas; // canvas size, in pixels

float field(vec2 p, float t, vec2 a) {
  vec2 q, r;
  float f = warp(p, t, q, r);
  return clamp(smoothstep(0.28, 1.0, f + 0.1 * r.x + 0.12 * exp(-3.0 * length(p - a))), 0.0, 1.0);
}

void main() {
  vec2 centre = (gl_FragCoord.xy) * u_cell;
  vec2 p = (centre - 0.5 * u_canvas) / u_canvas.y;
  vec2 a = agent();
  float t = u_time * 0.06;

  float v = field(p, t, a);
  vec2 e = u_cell / u_canvas.y;
  float dx = field(p + vec2(e.x, 0.0), t, a) - v;
  float dy = field(p + vec2(0.0, e.y), t, a) - v;
  // About 70 ms of animation earlier: how fast this cell is changing right now.
  float before = field(p, t - 0.004, a);

  float angle = atan(dy, dx) / 6.2831853 + 0.5;
  float change = clamp(abs(v - before) * 60.0, 0.0, 1.0);
  float near = exp(-6.0 * length(p - a)) * (0.35 + 0.65 * u_presence);
  outColor = vec4(v, angle, change, near);
}

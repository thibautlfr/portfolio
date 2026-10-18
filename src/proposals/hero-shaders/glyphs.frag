// Type case: the warp read out as a field of drawn marks on a character grid, from a dot
// to a full block, coloured along the palette. The marks thicken around the wandering
// point and the cursor. Strokes are drawn geometry, no font is loaded.
float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}

float glyph(int level, vec2 u) {
  const float W = 0.13;
  float d = 1e3;
  if (level == 1) d = length(u) - 0.16;
  if (level == 2) d = segment(u, vec2(-0.5, 0.0), vec2(0.5, 0.0)) - W;
  if (level == 3) d = min(segment(u, vec2(-0.5, 0.0), vec2(0.5, 0.0)), segment(u, vec2(0.0, -0.5), vec2(0.0, 0.5))) - W;
  if (level == 4) d = min(segment(u, vec2(-0.45, -0.55), vec2(0.45, 0.55)), segment(u, vec2(-0.45, 0.55), vec2(0.45, -0.55))) - W;
  if (level == 5) {
    d = min(segment(u, vec2(-0.25, -0.6), vec2(-0.25, 0.6)), segment(u, vec2(0.25, -0.6), vec2(0.25, 0.6)));
    d = min(d, min(segment(u, vec2(-0.55, -0.25), vec2(0.55, -0.25)), segment(u, vec2(-0.55, 0.25), vec2(0.55, 0.25)))) - W * 0.8;
  }
  if (level == 6) {
    vec2 b = abs(u) - vec2(0.48, 0.62);
    d = max(b.x, b.y);
  }
  return d;
}

void main() {
  const vec2 CELL = vec2(9.0, 13.0);
  vec2 block = floor(gl_FragCoord.xy / CELL);
  // Marks sit inside their cell with room around them, like set type.
  const float SIZE = 0.82;
  vec2 local = (fract(gl_FragCoord.xy / CELL) - 0.5) * vec2(1.0, CELL.y / CELL.x) * 2.0 / SIZE;
  vec2 p = centred((block + 0.5) * CELL);
  vec2 a = agent();

  vec2 q, r;
  float f = warp(p, u_time * 0.06, q, r);
  float pull = exp(-3.5 * length(p - a));
  float v = pow(smoothstep(0.25, 0.92, f + 0.22 * pull + 0.1 * r.y), 1.4);
  int level = int(floor(v * 6.99));

  float d = glyph(level, local);
  float px = 2.0 / SIZE / CELL.x;
  float ink = 1.0 - smoothstep(-px * 0.5, px, d);
  vec3 markColor = ramp(0.35 + 0.6 * v);
  vec3 color = mix(u_colors[0], markColor, ink);
  outColor = vec4(color, 1.0);
}

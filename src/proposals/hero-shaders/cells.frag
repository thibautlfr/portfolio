// Sheet: the page's own language, a sheet of cells bounded by hairlines, set loose.
// Voronoi cells drift slowly, the cursor pushes them apart, and the cells near it
// take the warp's colours while the rest stay ink and deep teal.
void main() {
  vec2 p = centred(gl_FragCoord.xy);
  vec2 a = agent();
  const float SCALE = 4.2;
  vec2 g = p * SCALE;
  vec2 ip = floor(g);
  vec2 fp = fract(g);

  float d1 = 8.0;
  float d2 = 8.0;
  vec2 id = vec2(0.0);
  vec2 centre = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash2(ip + o);
      vec2 seed = o + 0.5 + 0.36 * sin(u_time * 0.22 + 6.2831 * h);
      vec2 away = (ip + seed) / SCALE - a;
      seed += normalize(away + 1e-4) * 0.5 * exp(-5.0 * length(away));
      float d = length(seed - fp);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = ip + o;
        centre = (ip + seed) / SCALE;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }

  float h = hash(id);
  float tone = fbm(id * 0.4 + u_time * 0.04);
  vec3 color = mix(u_colors[0], u_colors[1], smoothstep(0.3, 0.75, tone));
  if (h > 0.9) color = u_colors[2];
  else if (h > 0.84) color = u_colors[3];

  vec2 q, r;
  float f = warp(p, u_time * 0.06, q, r);
  float lit = exp(-4.0 * length(centre - a));
  color = mix(color, ramp(0.35 + 0.65 * f), lit * 0.85);
  color *= 0.88 + 0.12 * fbm(p * 6.0 + id);

  // One render pixel, in cell units: the borders stay hairlines at any size.
  float px = SCALE / u_resolution.y;
  float line = 1.0 - smoothstep(px * 0.7, px * 1.9, d2 - d1);
  color = mix(color, u_colors[4], line * 0.75);
  outColor = vec4(color, 1.0);
}

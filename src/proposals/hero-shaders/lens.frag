// Loupe: the site's twelve-column grid as hairlines on ink, swaying with the warp.
// A loupe follows the wandering point and the cursor; through it the grid magnifies
// and the domain warp shows in colour, like reading a print under a lens.
void main() {
  vec2 p = centred(gl_FragCoord.xy);
  vec2 a = agent();
  float aspect = u_resolution.x / u_resolution.y;
  const float RADIUS = 0.3;

  vec2 d = p - a;
  float dist = length(d);
  float inside = smoothstep(RADIUS, RADIUS - 0.01, dist);
  float bulge = smoothstep(RADIUS, 0.0, dist);
  float zoom = 1.0 - 0.5 * bulge;
  vec2 lp = a + d * zoom;

  vec2 q, r;
  float f = warp(lp, u_time * 0.05, q, r);
  vec2 sway = (q - 0.5) * 0.05;

  float columns = 12.0;
  vec2 grid = (lp + sway) * columns / aspect;
  vec2 cellPos = abs(fract(grid) - 0.5);
  float px = columns / aspect / u_resolution.y * zoom;
  float lineDist = 0.5 - max(cellPos.x, cellPos.y);
  float line = 1.0 - smoothstep(0.0, px * 1.3, lineDist);
  // Small crosses on the intersections, as on a cutting mat.
  vec2 nearCross = abs(fract(grid + 0.5) - 0.5);
  float cross = (1.0 - smoothstep(0.0, px * 1.3, min(nearCross.x, nearCross.y))) * step(max(nearCross.x, nearCross.y), 0.08);

  vec3 outside = mix(u_colors[0], u_colors[1], smoothstep(0.3, 0.8, f) * 0.45);
  vec3 lensColor = ramp(0.15 + 0.85 * smoothstep(0.2, 0.85, f + 0.2 * r.x));
  vec3 color = mix(outside, lensColor, inside);
  color = mix(color, u_colors[4], (line * mix(0.16, 0.5, inside)) + cross * 0.6);

  float rim = 1.0 - smoothstep(0.0, 2.0 / u_resolution.y, abs(dist - RADIUS));
  color = mix(color, u_colors[4], rim * 0.8);
  outColor = vec4(color, 1.0);
}

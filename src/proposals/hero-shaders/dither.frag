// Gros pixel: the domain warp, reduced to the five colours with a 4x4 ordered (Bayer)
// dither on big pixels. A nod to the "On veut du gros pixel" award. The pixels get finer
// around the wandering point and the cursor, like a loupe on a print.
const float BAYER[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);

void main() {
  vec2 a = agent();
  float near = exp(-5.0 * length(centred(gl_FragCoord.xy) - a));
  // Two pixel sizes, blended by a hard step so blocks stay square.
  float cell = near > 0.45 ? 3.0 : 7.0;
  vec2 block = floor(gl_FragCoord.xy / cell);
  vec2 p = centred((block + 0.5) * cell);

  vec2 q, r;
  float f = warp(p, u_time * 0.06, q, r);
  float pull = exp(-3.0 * length(p - a));
  // Weighted toward ink, like the warp: coral and ivory only on the crests.
  float v = pow(smoothstep(0.34, 1.02, f + 0.14 * r.x + 0.16 * pull + u_scroll * 0.2), 1.9);

  ivec2 i = ivec2(mod(block, 4.0));
  float threshold = (BAYER[i.x + i.y * 4] + 0.5) / 16.0 - 0.5;
  int level = int(clamp(floor(v * 4.0 + threshold + 0.5), 0.0, 4.0));
  outColor = vec4(u_colors[level], 1.0);
}

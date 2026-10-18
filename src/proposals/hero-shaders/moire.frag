// Moiré: two fine line screens laid over each other at almost the same angle, as when two
// prints are stacked. Their beat makes broad bands of the palette that the warp bends;
// around the wandering point (or the cursor) the second screen turns, and the bands swirl.
float screen(float x, float px) {
  float d = abs(fract(x) - 0.5);
  return smoothstep(0.5 - px * 1.5, 0.5, d);
}

void main() {
  vec2 p = centred(gl_FragCoord.xy);
  vec2 a = agent();
  const float FREQUENCY = 34.0;
  float px = FREQUENCY / u_resolution.y;

  vec2 q, r;
  float f = warp(p * 0.7, u_time * 0.04, q, r);
  vec2 bent = p + (q - 0.5) * 0.12;

  float base = 0.35 + u_time * 0.01;
  float twist = 0.05 + 0.22 * exp(-4.0 * length(p - a));
  vec2 dirA = vec2(cos(base), sin(base));
  vec2 dirB = vec2(cos(base + twist), sin(base + twist));
  float ua = dot(bent, dirA) * FREQUENCY;
  float ub = dot(bent, dirB) * FREQUENCY;

  float beat = 0.5 + 0.5 * cos((ua - ub) * 6.2831);
  vec3 band = ramp(0.3 + 0.7 * smoothstep(0.3, 0.85, f));
  vec3 color = mix(u_colors[0], band, smoothstep(0.4, 1.0, beat) * 0.9);
  float lines = max(screen(ua, px), screen(ub, px));
  color = mix(color, u_colors[4], lines * 0.08 * (0.4 + beat));
  outColor = vec4(color, 1.0);
}

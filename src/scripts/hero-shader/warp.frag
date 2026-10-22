#version 300 es
precision highp float;

// Domain warp, carried over from the V1 gallery-redesign hero: ink, deep teal,
// teal, coral and ivory folding into each other. The warp is pulled toward a
// slow wandering point (an idea from the flow-field study), and the cursor
// takes over when it is on the cell.

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_presence;
uniform float u_scroll;
uniform vec3 u_colors[5]; // ink, deep teal, teal, coral, ivory

out vec4 outColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = p * 2.02 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float t = u_time * 0.06;

  vec2 wander = vec2(0.5 + 0.32 * sin(u_time * 0.13) * cos(u_time * 0.05), 0.5 + 0.28 * sin(u_time * 0.11 + 1.3));
  vec2 target = mix(wander, u_pointer, u_presence);
  vec2 agent = (target - 0.5) * vec2(aspect, 1.0);
  float pull = exp(-3.0 * length(p - agent));

  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 5.2));
  vec2 r = vec2(fbm(p * 1.4 + 3.0 * q + vec2(1.7, 9.2) + t * 1.5), fbm(p * 1.4 + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.4 + 3.5 * r + pull * 0.8 + u_scroll * 0.6);

  vec3 color = mix(u_colors[0], u_colors[1], smoothstep(0.25, 0.55, f));
  color = mix(color, u_colors[2], smoothstep(0.55, 0.95, length(q)) * 0.7);
  color = mix(color, u_colors[3], smoothstep(0.55, 0.8, r.x) * (0.6 + pull * 0.4));
  color = mix(color, u_colors[4], smoothstep(0.62, 0.85, f + pull * 0.12) * 0.7);
  color = mix(u_colors[0], color, smoothstep(0.2, 0.45, f));

  float vignette = smoothstep(1.25, 0.25, length(uv - 0.5));
  color *= mix(0.55, 1.0, vignette);
  color += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.035;

  outColor = vec4(color, 1.0);
}

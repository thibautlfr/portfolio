#version 300 es
precision highp float;

// Shared by every proposal: the same uniforms as the live hero shader, so any of them
// can replace warp.frag without touching the renderer.
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

vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
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

// Centred coordinates, height = 1.
vec2 centred(vec2 fragCoord) {
  return (fragCoord - 0.5 * u_resolution) / u_resolution.y;
}

// The wandering point, replaced by the cursor while it is on the cell, in centred coordinates.
vec2 agent() {
  vec2 wander = vec2(0.5 + 0.32 * sin(u_time * 0.13) * cos(u_time * 0.05), 0.5 + 0.28 * sin(u_time * 0.11 + 1.3));
  vec2 target = mix(wander, u_pointer, u_presence);
  return (target - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
}

// The domain warp field from the live shader, reduced to one value and its two layers.
float warp(vec2 p, float t, out vec2 q, out vec2 r) {
  q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 5.2));
  r = vec2(fbm(p * 1.4 + 3.0 * q + vec2(1.7, 9.2) + t * 1.5), fbm(p * 1.4 + 3.0 * q + vec2(8.3, 2.8) - t));
  return fbm(p * 1.4 + 3.5 * r);
}

// Ink to ivory through the palette, for a value in 0..1.
vec3 ramp(float v) {
  v = clamp(v, 0.0, 1.0) * 4.0;
  if (v < 1.0) return mix(u_colors[0], u_colors[1], v);
  if (v < 2.0) return mix(u_colors[1], u_colors[2], v - 1.0);
  if (v < 3.0) return mix(u_colors[2], u_colors[3], v - 2.0);
  return mix(u_colors[3], u_colors[4], v - 3.0);
}

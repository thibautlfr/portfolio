#version 300 es
precision highp float;

// Pass 2, one fragment per canvas pixel: picks a character for each cell from the field and
// draws it from a glyph atlas of printable ASCII rendered in Fragment Mono.
uniform sampler2D u_field;
uniform sampler2D u_atlas;
uniform sampler2D u_text;
uniform vec2 u_cell;
uniform float u_time;
uniform int u_mode; // 0 density, 1 contours, 2 decode, 3 words
uniform int u_textLength;
uniform vec3 u_ground;
uniform vec3 u_ink;
uniform vec3 u_accent;

out vec4 outColor;

const int RAMP[10] = int[10](32, 46, 58, 45, 61, 43, 42, 35, 37, 64); // " .:-=+*#%@"

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  ivec2 pixel = ivec2(gl_FragCoord.xy);
  ivec2 cellSize = ivec2(u_cell);
  ivec2 cell = pixel / cellSize;
  ivec2 inside = pixel - cell * cellSize;
  vec4 f = texelFetch(u_field, cell, 0);
  float v = f.r;
  float near = f.a;

  int code = 32;
  float strength = 1.0;
  float accent = 0.0;

  if (u_mode == 0) {
    // Weighted toward the light end: most of the frame stays paper, the crests go dense.
    float d = pow(v, 2.4) + near * 0.25;
    code = RAMP[int(clamp(d, 0.0, 0.999) * 10.0)];
    accent = smoothstep(0.8, 1.0, d);
  } else if (u_mode == 1) {
    float level = v * 6.0;
    float onLine = smoothstep(0.32, 0.44, abs(fract(level) - 0.5));
    float a = fract(f.g * 2.0 + 0.0625); // direction across the line, folded to half a turn
    int side = int(a * 4.0);
    int lineCode = side == 0 ? 124 : side == 1 ? 92 : side == 2 ? 45 : 47; // | \ - /
    code = onLine > 0.5 ? lineCode : (v > 0.7 ? 46 : 32);
    strength = onLine > 0.5 ? 1.0 : 0.45;
    accent = onLine * smoothstep(0.7, 0.95, v);
  } else if (u_mode == 2) {
    code = RAMP[int(clamp(pow(v, 2.4), 0.0, 0.999) * 10.0)];
    // A scan sweeps through the field (one level of it, rising and falling slowly) and the
    // cursor carries its own: on them, characters scramble before settling.
    float scan = 0.5 + 0.38 * sin(u_time * 0.35);
    float onScan = 1.0 - smoothstep(0.015, 0.05, abs(v - scan));
    float unsettled = max(onScan * 0.85, smoothstep(0.25, 0.75, near) * 0.8);
    float tick = floor(u_time * 14.0);
    if (hash(vec2(cell) + 0.37) < unsettled) {
      code = 33 + int(hash(vec2(cell) + tick) * 93.0);
      accent = 1.0;
    }
  } else {
    // The text runs left to right, top to bottom, and drifts slowly along the line.
    ivec2 grid = textureSize(u_field, 0);
    int index = (cell.x + (grid.y - 1 - cell.y) * grid.x + int(u_time * 2.0)) % u_textLength;
    code = int(texelFetch(u_text, ivec2(index, 0), 0).r * 255.0 + 0.5);
    strength = smoothstep(0.32, 0.62, v + near * 0.5);
    accent = smoothstep(0.85, 1.0, v + near * 0.4);
  }

  // The atlas row is stored top to bottom; the canvas counts from the bottom.
  ivec2 texel = ivec2((code - 32) * cellSize.x + inside.x, cellSize.y - 1 - inside.y);
  float coverage = texelFetch(u_atlas, texel, 0).a * strength;
  vec3 ink = mix(u_ink, u_accent, accent);
  outColor = vec4(mix(u_ground, ink, coverage), 1.0);
}

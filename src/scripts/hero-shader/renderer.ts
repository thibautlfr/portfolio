// The smallest WebGL2 setup that draws one fragment shader over a canvas:
// a fullscreen triangle generated from gl_VertexID, so no vertex buffer.

const VERTEX_SOURCE = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export interface FrameInput {
  time: number;
  pointer: [number, number];
  presence: number;
  scroll: number;
}

export interface Renderer {
  resize(width: number, height: number): void;
  draw(frame: FrameInput): void;
  dispose(): void;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

const toRgb = (hex: string): [number, number, number] => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

/** Returns null when WebGL2 or the shader is unavailable: the static frame stays. */
export function createRenderer(
  canvas: HTMLCanvasElement,
  fragmentSource: string,
  palette: readonly string[],
): Renderer | null {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const location = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    resolution: location("u_resolution"),
    time: location("u_time"),
    pointer: location("u_pointer"),
    presence: location("u_presence"),
    scroll: location("u_scroll"),
  };
  palette.forEach((hex, index) => gl.uniform3fv(location(`u_colors[${index}]`), toRgb(hex)));

  return {
    resize(width, height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.resolution, width, height);
    },
    draw({ time, pointer, presence, scroll }) {
      gl.uniform1f(uniforms.time, time);
      gl.uniform2f(uniforms.pointer, ...pointer);
      gl.uniform1f(uniforms.presence, presence);
      gl.uniform1f(uniforms.scroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

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
  return shader;
}

// Reading a compile or link status blocks the main thread until the GPU process is done, which
// takes hundreds of milliseconds on software GL. With KHR_parallel_shader_compile the status is
// read only once the link has finished, so the page never waits on it.
async function linked(gl: WebGL2RenderingContext, program: WebGLProgram): Promise<boolean> {
  const parallel = gl.getExtension("KHR_parallel_shader_compile");
  if (parallel) {
    while (!gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
      await new Promise(requestAnimationFrame);
    }
  }
  return Boolean(gl.getProgramParameter(program, gl.LINK_STATUS));
}

const toRgb = (hex: string): [number, number, number] => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

// Without a GPU every frame is rendered on the CPU and read back on the main thread, 50 to 100 ms
// each. Browsers do not always refuse such a context, so its renderer name is checked too.
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software/i;

function isSoftware(gl: WebGL2RenderingContext): boolean {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return SOFTWARE_RENDERER.test(String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER)));
}

/** Resolves to null when WebGL2 or the shader is unavailable: the static frame stays. */
export async function createRenderer(
  canvas: HTMLCanvasElement,
  fragmentSource: string,
  palette: readonly string[],
): Promise<Renderer | null> {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: false,
    powerPreference: "low-power",
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl || isSoftware(gl)) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!(await linked(gl, program))) return null;
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

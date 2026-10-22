const e={ink:`#091213`,deep:`#0d3d38`,teal:`#12a594`,coral:`#f2785c`,ivory:`#f5ede0`};function t(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),r):null}async function n(e,t){let n=e.getExtension(`KHR_parallel_shader_compile`);if(n)for(;!e.getProgramParameter(t,n.COMPLETION_STATUS_KHR);)await new Promise(requestAnimationFrame);return!!e.getProgramParameter(t,e.LINK_STATUS)}const r=e=>{let t=Number.parseInt(e.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]},i=/swiftshader|llvmpipe|softpipe|software/i;function a(e){let t=e.getExtension(`WEBGL_debug_renderer_info`);return i.test(String(e.getParameter(t?t.UNMASKED_RENDERER_WEBGL:e.RENDERER)))}async function o(e,i,o){let s=e.getContext(`webgl2`,{antialias:!1,alpha:!1,powerPreference:`low-power`,failIfMajorPerformanceCaveat:!0});if(!s||a(s))return null;let c=t(s,s.VERTEX_SHADER,`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`),l=t(s,s.FRAGMENT_SHADER,i),u=s.createProgram();if(!c||!l||!u||(s.attachShader(u,c),s.attachShader(u,l),s.linkProgram(u),!await n(s,u)))return null;s.useProgram(u);let d=e=>s.getUniformLocation(u,e),f={resolution:d(`u_resolution`),time:d(`u_time`),pointer:d(`u_pointer`),presence:d(`u_presence`),scroll:d(`u_scroll`)};return o.forEach((e,t)=>s.uniform3fv(d(`u_colors[${t}]`),r(e))),{resize(t,n){e.width=t,e.height=n,s.viewport(0,0,t,n),s.uniform2f(f.resolution,t,n)},draw({time:e,pointer:t,presence:n,scroll:r}){s.uniform1f(f.time,e),s.uniform2f(f.pointer,...t),s.uniform1f(f.presence,n),s.uniform1f(f.scroll,r),s.drawArrays(s.TRIANGLES,0,3)},dispose(){s.getExtension(`WEBGL_lose_context`)?.loseContext()}}}var s=`#version 300 es
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
`;const{ink:c,deep:l,teal:u,coral:d,ivory:f}=e,p=[c,l,u,d,f],m=.05;async function h(e){let t=e.querySelector(`[data-hero-shader-canvas]`),n=e.querySelector(`[data-hero-shader-toggle]`);if(!t||!n)return;let r=await o(t,s,p);if(!r)return;let i={x:.5,y:.5,presence:0},a={time:12,pointer:[.5,.5],presence:0,scroll:0},c=0,l=0,u=!0,d=!1,f=()=>{let e=Math.min(devicePixelRatio,1.5)*.75;r.resize(Math.max(1,Math.round(t.clientWidth*e)),Math.max(1,Math.round(t.clientHeight*e))),r.draw(a)},h=e=>{a.time+=Math.min(e-l,50)/1e3,l=e,a.pointer[0]+=(i.x-a.pointer[0])*m,a.pointer[1]+=(i.y-a.pointer[1])*m,a.presence+=(i.presence-a.presence)*m,r.draw(a),c=requestAnimationFrame(h)},g=()=>{cancelAnimationFrame(c),u&&!d&&!document.hidden&&(l=performance.now(),c=requestAnimationFrame(h))};f();let _=new ResizeObserver(f);_.observe(t);let v=new IntersectionObserver(([e])=>{u=e?.isIntersecting??!1,g()});v.observe(e),document.addEventListener(`visibilitychange`,g);let y=0,b=e=>{clearTimeout(y);let n=t.getBoundingClientRect();i.x=(e.clientX-n.left)/n.width,i.y=1-(e.clientY-n.top)/n.height,i.presence=1};e.addEventListener(`pointermove`,b,{passive:!0}),e.addEventListener(`pointerdown`,b,{passive:!0}),e.addEventListener(`pointerleave`,e=>{clearTimeout(y),e.pointerType===`touch`?y=window.setTimeout(()=>i.presence=0,1500):i.presence=0},{passive:!0});let x=()=>{let e=t.getBoundingClientRect();a.scroll=Math.min(Math.max(-e.top/e.height,0),1)};addEventListener(`scroll`,x,{passive:!0}),document.addEventListener(`astro:before-swap`,()=>{cancelAnimationFrame(c),clearTimeout(y),_.disconnect(),v.disconnect(),document.removeEventListener(`visibilitychange`,g),removeEventListener(`scroll`,x),r.dispose()},{once:!0}),t.addEventListener(`webglcontextlost`,()=>{cancelAnimationFrame(c),e.classList.remove(`is-live`),n.hidden=!0}),n.hidden=!1,n.addEventListener(`click`,()=>{d=!d,n.setAttribute(`aria-pressed`,String(d)),n.textContent=d?`Play animation`:`Pause animation`,g()}),e.classList.add(`is-live`),g()}const g=()=>{let e=document.querySelector(`[data-hero-shader]`);e&&!e.classList.contains(`is-live`)&&h(e)};g(),document.addEventListener(`astro:page-load`,g);
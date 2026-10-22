var e={ink:`#091213`,deep:`#0d3d38`,teal:`#12a594`,coral:`#f2785c`,ivory:`#f5ede0`},t=`// The 3D carousel's fragment shader, as it is in the project's repository
// (github.com/thibautlfr/3d-carousel, src/experience/shaders/image/fragment.glsl at 9d81b24).
// Only this header is added: the lens demo runs the project's own code.

uniform sampler2D uTexture;
uniform float uVignetteOffset;
uniform float uVignetteDarkness;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uStereoRadius;
uniform float uStereoStrength;
varying vec2 vUv;

void main() {
    vec2 screenUv = gl_FragCoord.xy / uResolution;

    float aspect = uResolution.x / uResolution.y;
    vec2 diff = screenUv - uMouse;
    diff.x *= aspect;

    float dist = length(diff);

    float mask = smoothstep(uStereoRadius, 0.0, dist);

    vec2 dir = dist > 0.001 ? normalize(diff) : vec2(0.0);

    vec2 uvOffset = dir * uStereoStrength * mask;
    uvOffset.x /= aspect;

    // Chromatic aberration: shift R forward, keep G centered, shift B backward
    // along the radial direction ; creates the RGB split (stereo) look
    float r = texture2D(uTexture, vUv + uvOffset).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - uvOffset).b;
    float a = texture2D(uTexture, vUv).a;

    vec4 color = vec4(r, g, b, a);

    // Vignette effect
    vec2 uv = (vUv - vec2(0.5)) * vec2(uVignetteOffset);
    color.rgb *= 1.0 - dot(uv, uv) * uVignetteDarkness;

    gl_FragColor = color;
}
`,n={uVignetteOffset:1,uVignetteDarkness:1},r=2,i={x:.5,y:.5},a=40,o=2,s=`
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;function c(e){let n=e.createProgram();if(!n)return null;let r=[[e.VERTEX_SHADER,s],[e.FRAGMENT_SHADER,`precision highp float;\n${t}`]];for(let[t,i]of r){let r=e.createShader(t);if(!r)return null;e.shaderSource(r,i),e.compileShader(r),e.attachShader(n,r)}return e.linkProgram(n),e.getProgramParameter(n,e.LINK_STATUS)?n:null}function l(t,n,r){let i=Object.assign(document.createElement(`canvas`),{width:t,height:n}),s=i.getContext(`2d`);if(!s)return i;let[c,l]=[a*r,Math.round(o*r)];s.fillStyle=e.ink,s.fillRect(0,0,t,n),s.fillStyle=e.ivory;for(let e=t%c/2;e<t;e+=c)s.fillRect(Math.round(e-l/2),0,l,n);for(let e=n%c/2;e<n;e+=c)s.fillRect(0,Math.round(e-l/2),t,l);return i}function u(e){let t=e.querySelector(`[data-lens-demo-canvas]`),a=e.querySelector(`[data-lens-demo-controls]`),o=e.querySelector(`[data-lens-demo-fallback]`),s=a?.form;if(!t||!a||!o||!s)return;let u=t.getContext(`webgl2`,{antialias:!1})??t.getContext(`webgl`,{antialias:!1}),d=u&&c(u);if(!u||!d)return;u.useProgram(d),u.bindBuffer(u.ARRAY_BUFFER,u.createBuffer()),u.bufferData(u.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),u.STATIC_DRAW);let f=u.getAttribLocation(d,`position`);u.enableVertexAttribArray(f),u.vertexAttribPointer(f,2,u.FLOAT,!1,0,0),u.bindTexture(u.TEXTURE_2D,u.createTexture()),u.texParameteri(u.TEXTURE_2D,u.TEXTURE_MIN_FILTER,u.LINEAR),u.texParameteri(u.TEXTURE_2D,u.TEXTURE_WRAP_S,u.CLAMP_TO_EDGE),u.texParameteri(u.TEXTURE_2D,u.TEXTURE_WRAP_T,u.CLAMP_TO_EDGE);let p=e=>u.getUniformLocation(d,e);u.uniform1i(p(`uTexture`),0);for(let[e,t]of Object.entries(n))u.uniform1f(p(e),t);let m=p(`uMouse`),h=p(`uResolution`),g={...i},_=0,v=()=>{_=0,u.uniform2f(m,g.x,g.y),u.drawArrays(u.TRIANGLES,0,3)},y=()=>{_||=requestAnimationFrame(v)},b=()=>{let e=Math.min(devicePixelRatio,r),n=Math.max(1,Math.round(t.clientWidth*e)),i=Math.max(1,Math.round(t.clientHeight*e));(n!==t.width||i!==t.height)&&(t.width=n,t.height=i,u.viewport(0,0,n,i),u.uniform2f(h,n,i),u.texImage2D(u.TEXTURE_2D,0,u.RGBA,u.RGBA,u.UNSIGNED_BYTE,l(n,i,e)),v())},x=[...a.querySelectorAll(`input[data-uniform]`)],S=()=>{for(let e of x){let t=Number(e.value);u.uniform1f(p(e.dataset.uniform??``),t);let n=s.querySelector(`output[for="${e.id}"]`);n&&(n.value=t.toFixed(e.step.split(`.`)[1]?.length??0))}y()};s.addEventListener(`input`,S),s.addEventListener(`reset`,()=>setTimeout(S)),S();let C=e=>{let n=t.getBoundingClientRect();g.x=(e.clientX-n.left)/n.width,g.y=1-(e.clientY-n.top)/n.height,y()};t.addEventListener(`pointermove`,C,{passive:!0}),t.addEventListener(`pointerdown`,C,{passive:!0}),t.addEventListener(`pointerleave`,e=>{e.pointerType!==`touch`&&(Object.assign(g,i),y())});let w=new ResizeObserver(b);w.observe(t),b(),t.addEventListener(`webglcontextlost`,()=>{a.disabled=!0,o.hidden=!1}),document.addEventListener(`astro:before-swap`,()=>{cancelAnimationFrame(_),w.disconnect(),u.getExtension(`WEBGL_lose_context`)?.loseContext()},{once:!0}),a.disabled=!1,o.hidden=!0}var d=()=>{for(let e of document.querySelectorAll(`[data-lens-demo]`)){if(e.dataset.lensDemoBound)continue;e.dataset.lensDemoBound=`true`;let t=new IntersectionObserver(([n])=>{n?.isIntersecting&&(t.disconnect(),u(e))},{rootMargin:`50% 0px`});t.observe(e),document.addEventListener(`astro:before-swap`,()=>t.disconnect(),{once:!0})}};d(),document.addEventListener(`astro:page-load`,d);
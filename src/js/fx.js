// "Shader pack" rendering: directional aerial fog, sky with clouds, bloom, god rays, grading,
// and a real-time cube-map reflection probe for the car paint.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ---------------------------------------------------------------- fog (sun-tinted aerial perspective)
export const fogU = {
  uFogSun: { value: new THREE.Vector3(0, 1, 0) },
  uFogSunCol: { value: new THREE.Color(0xffffff) },
  uFogBase: { value: 60 },
  uCaus: { value: 0 }, uCausT: { value: 0 }, uCausTop: { value: 0 },
};
const SC = THREE.ShaderChunk;
SC.fog_pars_vertex = '#ifdef USE_FOG\nvarying float vFogDepth;\nvarying vec3 vFogW;\n#endif';
SC.fog_vertex = '#ifdef USE_FOG\nvFogDepth = - mvPosition.z;\nvFogW = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif';
SC.fog_pars_fragment = `#ifdef USE_FOG
  uniform vec3 fogColor; varying float vFogDepth; varying vec3 vFogW;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear; uniform float fogFar;
  #endif
  uniform vec3 uFogSun; uniform vec3 uFogSunCol; uniform float uFogBase;
  uniform float uCaus, uCausT, uCausTop;
  // underwater caustics: bright wandering light net on everything below the surface
  float causNet(vec2 p) {
    vec2 q = p; float v = 0.0;
    for (int i = 0; i < 3; i++) { q = vec2(q.x + sin(q.y * 1.3 + uCausT * 0.9), q.y + cos(q.x * 1.1 - uCausT * 0.7)); v += abs(sin(q.x) * sin(q.y)); }
    return pow(clamp(1.0 - v / 3.0, 0.0, 1.0), 5.0);
  }
#endif`;
SC.fog_fragment = `#ifdef USE_FOG
  if (uCaus > 0.0) {
    float cd = clamp((uCausTop - vFogW.y) / 60.0, 0.0, 1.0);
    gl_FragColor.rgb *= 1.0 + uCaus * (1.0 - cd * 0.6) * (causNet(vFogW.xz * 0.22) * 2.2 + causNet(vFogW.xz * 0.5 + 3.1) * 0.8);
  }
  vec3 fv = vFogW - cameraPosition; float fd = length(fv); vec3 fdir = fv / max(fd, 1e-3);
  #ifdef FOG_EXP2
    float fogF = 1.0 - exp(-pow(fd * fogDensity, 1.5));
  #else
    float fogF = smoothstep(fogNear, fogFar, fd);
  #endif
  float hgt = clamp((vFogW.y - uFogBase) / 120.0, 0.0, 1.0);
  fogF *= mix(1.0, 0.55, hgt);
  float sunAmt = pow(max(dot(fdir, normalize(uFogSun + vec3(0.0, 1e-4, 0.0))), 0.0), 5.0);
  vec3 fc = fogColor + uFogSunCol * sunAmt * 0.55;
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fc, clamp(fogF, 0.0, 1.0));
#endif`;

export function fogPatch(mat, extra) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    if (extra) extra(sh, r);
    else if (prev) prev.call(mat, sh, r);
    sh.uniforms.uFogSun = fogU.uFogSun; sh.uniforms.uFogSunCol = fogU.uFogSunCol; sh.uniforms.uFogBase = fogU.uFogBase;
    sh.uniforms.uCaus = fogU.uCaus; sh.uniforms.uCausT = fogU.uCausT; sh.uniforms.uCausTop = fogU.uCausTop;
  };
  return mat;
}

// ---------------------------------------------------------------- sky
export const skyU = {
  zen: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) },
  sunCol: { value: new THREE.Color() }, cover: { value: 0.4 }, time: { value: 0 }, night: { value: 0 }, camPos: { value: new THREE.Vector3() },
};
export function makeSky() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }',
    fragmentShader: `uniform vec3 zen, hor, sunDir, sunCol, camPos; uniform float cover, time, night; varying vec3 vD;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<6;i++){ s+=a*vn(p); p=p*2.03+vec2(17.1,9.3); a*=0.5; } return s; }
      void main(){
        vec3 d = normalize(vD);
        float y = d.y;
        vec3 sd = normalize(sunDir);
        float mu = max(dot(d, sd), 0.0);
        vec3 c = mix(hor, zen, pow(clamp(y, 0.0, 1.0), 0.42));
        c = mix(c, hor * 1.08, exp(-max(y, 0.0) * 9.0) * 0.6);
        c += sunCol * (pow(mu, 5.0) * 0.18 + pow(mu, 48.0) * 0.5) * (1.0 - night);
        if (y < 0.0) c = mix(hor * 0.92, hor * 0.6, clamp(-y * 3.0, 0.0, 1.0));
        // sun disc
        c += sunCol * smoothstep(0.99955, 0.99975, mu) * 40.0 * (1.0 - night);
        // clouds
        if (cover > 0.0 && y > 0.0) {
          vec2 p = d.xz / (y + 0.06) * 0.9 + camPos.xz * 0.00045 + vec2(time * 0.006, time * 0.002);
          float n = fbm(p * 1.6);
          float dens = smoothstep(1.0 - cover * 0.75, 1.0 - cover * 0.75 + 0.28, n);
          float n2 = fbm(p * 1.6 + sd.xz * 0.08);
          float lit = clamp(0.55 + (n - n2) * 4.0, 0.0, 1.0);
          vec3 cc = mix(mix(hor, zen, 0.35) * 0.75, vec3(1.0, 0.98, 0.95) * 1.15, lit);
          cc += sunCol * pow(mu, 6.0) * 0.8 * (1.0 - dens * 0.5);
          dens *= smoothstep(0.0, 0.18, y);
          c = mix(c, cc, dens * 0.95);
        }
        if (night > 0.5) {
          c += vec3(0.5, 0.08, 0.0) * exp(-abs(y) * 4.0) * 0.6;
          c += vec3(0.25, 0.04, 0.0) * fbm(d.xz / (abs(y) + 0.2) * 2.0 + time * 0.01) * 0.35;
        }
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  m.renderOrder = -10; m.frustumCulled = false;
  return m;
}

// ---------------------------------------------------------------- post
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null }, tDepth: { value: null }, sunPos: { value: new THREE.Vector2(0.5, 0.5) }, sunVis: { value: 0 }, sunCol: { value: new THREE.Color() },
    sat: { value: 1.1 }, sharp: { value: 0.35 }, aoAmt: { value: 0.75 }, rays: { value: 0.38 }, aspect: { value: 1.7 }, cNear: { value: 0.1 }, cFar: { value: 3000 }, flare: { value: 0.55 },
    shadowTint: { value: new THREE.Color(0.93, 0.97, 1.06) }, hiTint: { value: new THREE.Color(1.05, 1.0, 0.94) },
    aoOn: { value: 0 }, tanHalf: { value: new THREE.Vector2(1, 1) }, px: { value: new THREE.Vector2(0.001, 0.001) }, aoTint: { value: new THREE.Color(0.2, 0.24, 0.34) },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `#include <packing>
    uniform sampler2D tDiffuse, tDepth; uniform vec2 sunPos; uniform float sunVis, sat, sharp, aoAmt, rays, aspect, cNear, cFar, flare, aoOn;
    uniform vec3 sunCol, shadowTint, hiTint, aoTint; uniform vec2 tanHalf, px; varying vec2 vUv;
    vec3 viewPos(vec2 uv) {
      float vz = perspectiveDepthToViewZ(texture2D(tDepth, uv).x, cNear, cFar);
      return vec3((uv * 2.0 - 1.0) * tanHalf * -vz, vz);
    }
    // screen-space ambient occlusion from the depth buffer (block corners, under trees, around the car)
    float ssao(vec2 uv) {
      vec3 P = viewPos(uv);
      float dist = -P.z;
      if (dist > 160.0) return 1.0;
      vec3 Pr = viewPos(uv + vec2(px.x, 0.0)), Pl = viewPos(uv - vec2(px.x, 0.0));
      vec3 Pu = viewPos(uv + vec2(0.0, px.y)), Pd = viewPos(uv - vec2(0.0, px.y));
      vec3 dx = abs(Pr.z - P.z) < abs(P.z - Pl.z) ? Pr - P : P - Pl;
      vec3 dy = abs(Pu.z - P.z) < abs(P.z - Pd.z) ? Pu - P : P - Pd;
      vec3 N = normalize(cross(dx, dy));
      if (dot(N, P) > 0.0) N = -N;
      vec3 T = normalize(abs(N.y) < 0.9 ? cross(N, vec3(0.0, 1.0, 0.0)) : cross(N, vec3(1.0, 0.0, 0.0)));
      vec3 B = cross(N, T);
      float rad = mix(0.55, 1.6, smoothstep(4.0, 60.0, dist));
      float jit = fract(sin(dot(uv * 1000.0, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831;
      float occ = 0.0;
      const int K = 8;
      for (int i = 0; i < K; i++) {
        float fi = float(i);
        float a = fi * 2.39996 + jit;
        float r = sqrt((fi + 0.5) / float(K));
        float h = sqrt(1.0 - r * r);
        vec3 dir = T * (cos(a) * r) + B * (sin(a) * r) + N * h;
        float s = mix(0.25, 1.0, fract(fi * 0.618 + jit));
        vec3 S = P + dir * rad * s + N * 0.03;
        vec2 suv = (S.xy / (-S.z * tanHalf)) * 0.5 + 0.5;
        if (suv.x < 0.0 || suv.y < 0.0 || suv.x > 1.0 || suv.y > 1.0) continue;
        float sz = viewPos(suv).z;
        float range = smoothstep(0.0, 1.0, rad / max(abs(P.z - sz), 1e-3));
        occ += (sz >= S.z + 0.02 * dist * 0.02 + 0.015 ? 1.0 : 0.0) * range;
      }
      float ao = 1.0 - occ / float(K);
      return mix(1.0, ao, 1.0 - smoothstep(70.0, 160.0, dist));
    }
    float skyMask(vec2 uv) {
      float d = texture2D(tDepth, uv).x;
      float vz = -perspectiveDepthToViewZ(d, cNear, cFar);
      return smoothstep(1200.0, 2400.0, vz);
    }
    float h12(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      // light sharpening (unsharp mask), stronger on low-contrast detail, so block edges and
      // texture detail read crisply without halos
      {
        vec3 nb = texture2D(tDiffuse, vUv + vec2(px.x, 0.0)).rgb + texture2D(tDiffuse, vUv - vec2(px.x, 0.0)).rgb
                + texture2D(tDiffuse, vUv + vec2(0.0, px.y)).rgb + texture2D(tDiffuse, vUv - vec2(0.0, px.y)).rgb;
        vec3 d = col - nb * 0.25;
        col = max(col + clamp(d, -0.08, 0.08) * sharp * 2.0, 0.0);
      }
      if (aoOn > 0.5) {
        float ao = ssao(vUv);
        ao = mix(1.0, pow(clamp(ao, 0.0, 1.0), 1.3), aoAmt);
        col *= mix(aoTint, vec3(1.0), ao) * 0.15 + ao * 0.85;
      }
      if (sunVis > 0.001) {
        // god rays: march toward the sun through the depth buffer, only sky lets light through
        const int N = 20;
        vec2 dv = (sunPos - vUv) / float(N);
        float jit = h12(vUv * 913.7);
        vec2 uv = vUv + dv * jit;
        float acc = 0.0, w = 1.0;
        for (int i = 0; i < N; i++) {
          vec2 suv = clamp(uv, 0.001, 0.999);
          float sky = skyMask(suv);
          vec2 q = (uv - sunPos) * vec2(aspect, 1.0);
          acc += sky * w * exp(-length(q) * 3.2);
          w *= 0.96;
          uv += dv;
        }
        float shafts = acc / float(N);
        vec2 qd = (vUv - sunPos) * vec2(aspect, 1.0);
        float near = exp(-length(qd) * 1.6);
        col += sunCol * shafts * rays * sunVis * (0.35 + 0.9 * near);
        // lens flare ghosts along the line through the screen centre, gated by sun visibility
        float vis = skyMask(clamp(sunPos, 0.001, 0.999));
        vec2 axis = vec2(0.5) - sunPos;
        float fl = 0.0;
        for (int k = 1; k <= 4; k++) {
          vec2 c = sunPos + axis * (0.45 * float(k));
          float r = 0.025 + 0.02 * float(k);
          float d = length((vUv - c) * vec2(aspect, 1.0));
          fl += (1.0 - smoothstep(r * 0.6, r, d)) * (0.12 / float(k));
        }
        float halo = smoothstep(0.03, 0.0, abs(length((vUv - sunPos) * vec2(aspect, 1.0)) - 0.32)) * 0.05;
        col += sunCol * (fl + halo) * vis * sunVis * flare;
      }
      // split toning: cool shadows, warm highlights, then saturation
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col *= mix(shadowTint, hiTint, smoothstep(0.05, 0.9, l));
      l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = max(mix(vec3(l), col, sat), 0.0);
      vec2 v = (vUv - 0.5) * vec2(aspect * 0.75, 1.0);
      col *= mix(0.7, 1.0, smoothstep(0.95, 0.25, length(v)));
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export class Post {
  constructor(renderer, scene, camera) {
    this.renderer = renderer; this.scene = scene; this.camera = camera;
    this.enabled = true; this.composer = null; this.q = -1;
  }
  setup(q) {
    if (this.composer && q === this.q) return;
    this.q = q;
    if (this.composer) { this.composer.dispose?.(); this.composer = null; }
    if (q === 0) { this.enabled = false; return; }
    this.enabled = true;
    const r = this.renderer;
    const size = r.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: this.msaa ?? 4 });
    rt.depthTexture = new THREE.DepthTexture(size.x, size.y);
    rt.depthTexture.type = THREE.UnsignedIntType;
    const c = this.composer = new EffectComposer(r, rt);
    // share one depth texture between both ping-pong targets so the grade pass can always read it
    c.renderTarget2.depthTexture = rt.depthTexture;
    c.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.2, 0.5, 0.95);
    c.addPass(this.bloom);
    this.grade = new ShaderPass(GradeShader);
    c.addPass(this.grade);
    c.addPass(new OutputPass());
  }
  resize(w, h) { if (this.composer) { this.composer.setPixelRatio(this.renderer.getPixelRatio()); this.composer.setSize(w, h); } }
  render(sunDir, sunCol, night) {
    if (!this.enabled || !this.composer) { this.renderer.render(this.scene, this.camera); return; }
    const g = this.grade.uniforms;
    const p = new THREE.Vector3().copy(this.camera.position).addScaledVector(sunDir, 1000).project(this.camera);
    const facing = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).dot(sunDir);
    g.sunPos.value.set(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5);
    g.sunVis.value = night ? 0 : THREE.MathUtils.smoothstep(facing, -0.05, 0.5) * (p.z < 1 ? 1 : 0);
    g.sunCol.value.copy(sunCol);
    g.aspect.value = this.camera.aspect;
    g.tDepth.value = this.composer.renderTarget1.depthTexture;
    g.cNear.value = this.camera.near; g.cFar.value = this.camera.far;
    const th = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    g.tanHalf.value.set(th * this.camera.aspect, th);
    const sz = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    g.px.value.set(1 / sz.x, 1 / sz.y);
    g.aoOn.value = this.ao ? 1 : 0;
    g.flare.value = this.noFlare ? 0 : 0.55;
    if (this.fx) { this.bloom.strength = this.fx.bloom; g.rays.value = this.fx.rays; g.sharp.value = this.fx.sharp; g.aoAmt.value = this.fx.aoAmt; }
    this.composer.render();
  }
}

// ---------------------------------------------------------------- reflection probe (one face per frame)
export class EnvProbe {
  constructor(renderer, size = 128) {
    this.rt = new THREE.WebGLCubeRenderTarget(size, { type: THREE.HalfFloatType });
    this.rt.texture.generateMipmaps = false;
    this.cam = new THREE.CubeCamera(0.5, 160, this.rt);
    this.cam.coordinateSystem = renderer.coordinateSystem;
    this.cam.updateCoordinateSystem();
    this.face = 0;
  }
  update(renderer, scene, pos, hide) {
    this.cam.position.copy(pos);
    this.cam.updateMatrixWorld(true);
    const prev = renderer.getRenderTarget();
    const prevSM = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    hide(true);
    renderer.setRenderTarget(this.rt, this.face);
    renderer.render(scene, this.cam.children[this.face]);
    renderer.setRenderTarget(prev);
    hide(false);
    renderer.shadowMap.autoUpdate = prevSM;
    this.face = (this.face + 1) % 6;
    if (this.face === 0) this.rt.texture.needsPMREMUpdate = true;
  }
}

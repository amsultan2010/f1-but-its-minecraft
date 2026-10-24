// src/js/main.js
import * as THREE5 from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

// src/js/fx.js
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
var fogU = {
  uFogSun: { value: new THREE.Vector3(0, 1, 0) },
  uFogSunCol: { value: new THREE.Color(16777215) },
  uFogBase: { value: 60 },
  uCaus: { value: 0 },
  uCausT: { value: 0 },
  uCausTop: { value: 0 }
};
var SC = THREE.ShaderChunk;
SC.fog_pars_vertex = "#ifdef USE_FOG\nvarying float vFogDepth;\nvarying vec3 vFogW;\n#endif";
SC.fog_vertex = "#ifdef USE_FOG\nvFogDepth = - mvPosition.z;\nvFogW = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif";
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
function fogPatch(mat, extra) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    if (extra) extra(sh, r);
    else if (prev) prev.call(mat, sh, r);
    sh.uniforms.uFogSun = fogU.uFogSun;
    sh.uniforms.uFogSunCol = fogU.uFogSunCol;
    sh.uniforms.uFogBase = fogU.uFogBase;
    sh.uniforms.uCaus = fogU.uCaus;
    sh.uniforms.uCausT = fogU.uCausT;
    sh.uniforms.uCausTop = fogU.uCausTop;
  };
  return mat;
}
var skyU = {
  zen: { value: new THREE.Color() },
  hor: { value: new THREE.Color() },
  sunDir: { value: new THREE.Vector3(0, 1, 0) },
  sunCol: { value: new THREE.Color() },
  cover: { value: 0.4 },
  time: { value: 0 },
  night: { value: 0 },
  camPos: { value: new THREE.Vector3() }
};
function makeSky() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), new THREE.ShaderMaterial({
    uniforms: skyU,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: "varying vec3 vD; void main(){ vD = position; vec4 p = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }",
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
      }`
  }));
  m.renderOrder = -10;
  m.frustumCulled = false;
  return m;
}
var GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    sunPos: { value: new THREE.Vector2(0.5, 0.5) },
    sunVis: { value: 0 },
    sunCol: { value: new THREE.Color() },
    sat: { value: 1.1 },
    sharp: { value: 0.35 },
    aoAmt: { value: 0.75 },
    rays: { value: 0.38 },
    aspect: { value: 1.7 },
    cNear: { value: 0.1 },
    cFar: { value: 3e3 },
    flare: { value: 0.55 },
    shadowTint: { value: new THREE.Color(0.93, 0.97, 1.06) },
    hiTint: { value: new THREE.Color(1.05, 1, 0.94) },
    aoOn: { value: 0 },
    tanHalf: { value: new THREE.Vector2(1, 1) },
    px: { value: new THREE.Vector2(1e-3, 1e-3) },
    aoTint: { value: new THREE.Color(0.2, 0.24, 0.34) }
  },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
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
    }`
};
var Post = class {
  constructor(renderer2, scene2, camera2) {
    this.renderer = renderer2;
    this.scene = scene2;
    this.camera = camera2;
    this.enabled = true;
    this.composer = null;
    this.q = -1;
  }
  setup(q) {
    if (this.composer && q === this.q) return;
    this.q = q;
    if (this.composer) {
      this.composer.dispose?.();
      this.composer = null;
    }
    if (q === 0) {
      this.enabled = false;
      return;
    }
    this.enabled = true;
    const r = this.renderer;
    const size = r.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: this.msaa ?? 4 });
    rt.depthTexture = new THREE.DepthTexture(size.x, size.y);
    rt.depthTexture.type = THREE.UnsignedIntType;
    const c = this.composer = new EffectComposer(r, rt);
    c.renderTarget2.depthTexture = rt.depthTexture;
    c.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.2, 0.5, 0.95);
    c.addPass(this.bloom);
    this.grade = new ShaderPass(GradeShader);
    c.addPass(this.grade);
    c.addPass(new OutputPass());
  }
  resize(w, h) {
    if (this.composer) {
      this.composer.setPixelRatio(this.renderer.getPixelRatio());
      this.composer.setSize(w, h);
    }
  }
  render(sunDir2, sunCol2, night) {
    if (!this.enabled || !this.composer) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    const g = this.grade.uniforms;
    const p = new THREE.Vector3().copy(this.camera.position).addScaledVector(sunDir2, 1e3).project(this.camera);
    const facing = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).dot(sunDir2);
    g.sunPos.value.set(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5);
    g.sunVis.value = night ? 0 : THREE.MathUtils.smoothstep(facing, -0.05, 0.5) * (p.z < 1 ? 1 : 0);
    g.sunCol.value.copy(sunCol2);
    g.aspect.value = this.camera.aspect;
    g.tDepth.value = this.composer.renderTarget1.depthTexture;
    g.cNear.value = this.camera.near;
    g.cFar.value = this.camera.far;
    const th = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    g.tanHalf.value.set(th * this.camera.aspect, th);
    const sz = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    g.px.value.set(1 / sz.x, 1 / sz.y);
    g.aoOn.value = this.ao ? 1 : 0;
    g.flare.value = this.noFlare ? 0 : 0.55;
    if (this.fx) {
      this.bloom.strength = this.fx.bloom;
      g.rays.value = this.fx.rays;
      g.sharp.value = this.fx.sharp;
      g.aoAmt.value = this.fx.aoAmt;
    }
    this.composer.render();
  }
};
var EnvProbe = class {
  constructor(renderer2, size = 128) {
    this.rt = new THREE.WebGLCubeRenderTarget(size, { type: THREE.HalfFloatType });
    this.rt.texture.generateMipmaps = false;
    this.cam = new THREE.CubeCamera(0.5, 160, this.rt);
    this.cam.coordinateSystem = renderer2.coordinateSystem;
    this.cam.updateCoordinateSystem();
    this.face = 0;
  }
  update(renderer2, scene2, pos, hide) {
    this.cam.position.copy(pos);
    this.cam.updateMatrixWorld(true);
    const prev = renderer2.getRenderTarget();
    const prevSM = renderer2.shadowMap.autoUpdate;
    renderer2.shadowMap.autoUpdate = false;
    hide(true);
    renderer2.setRenderTarget(this.rt, this.face);
    renderer2.render(scene2, this.cam.children[this.face]);
    renderer2.setRenderTarget(prev);
    hide(false);
    renderer2.shadowMap.autoUpdate = prevSM;
    this.face = (this.face + 1) % 6;
    if (this.face === 0) this.rt.texture.needsPMREMUpdate = true;
  }
};

// src/js/data.js
var ERAS = {
  "2026": {
    label: "2026",
    sub: "Active aero \xB7 50/50 hybrid",
    engine: "1.6L V6 turbo hybrid",
    teams: [
      { name: "Bull", short: "BUL", num: 3, model: "bull26", base: "#1e2a5e", accent: "#e0242c" },
      { name: "Laren", short: "LAR", num: 1, model: "laren26", base: "#ff8000", accent: "#1c1d21" },
      { name: "Martin", short: "MAR", num: 14, model: "martin26", base: "#00594f", accent: "#cedc00" },
      { name: "Aud", short: "AUD", num: 27, model: "aud26", base: "#b9bcbf", accent: "#d5001c" },
      { name: "Caddy", short: "CAD", num: 11, model: "caddy26", base: "#151515", accent: "#f2f2f2" }
    ]
  },
  "2010": {
    label: "2010",
    sub: "2.4L V8 \xB7 no refuelling",
    engine: "2.4L V8, 18,000 rpm",
    teams: [
      { name: "Rrari", short: "RRA", num: 8, model: "rrari10", base: "#c4000c", accent: "#f2f2f2" },
      { name: "Merc", short: "MER", num: 3, model: "merc10", base: "#c3c7cb", accent: "#00a19c" },
      { name: "Will", short: "WIL", num: 9, model: "will10", base: "#f2f2f2", accent: "#16206b" },
      { name: "Saub", short: "SAU", num: 22, model: "saub10", base: "#f2f2f2", accent: "#2b2b2b" },
      { name: "Lot", short: "LOT", num: 18, model: "lot10", base: "#0b5c2f", accent: "#f2c400" }
    ]
  },
  "2006": {
    label: "2006",
    sub: "2.4L V8 \xB7 grooved tyres",
    engine: "2.4L V8, 19,000 rpm",
    teams: [
      { name: "Nault", short: "NAU", num: 1, model: "nault06", base: "#1f8fd6", accent: "#ffd400" },
      { name: "Rrari", short: "RRA", num: 5, model: "rrari06", base: "#c4000c", accent: "#f2f2f2" },
      { name: "Hond", short: "HON", num: 12, model: "hond06", base: "#f2f2f2", accent: "#d0102a" }
    ]
  }
};
var ERA_ORDER = ["2026", "2010", "2006"];
var PHYS = {
  "2026": {
    mass: 800,
    cgH: 0.28,
    frontW: 0.45,
    izz: 1150,
    powerICE: 4e5,
    powerERS: 35e4,
    ersFadeFrom: 290 / 3.6,
    ersFadeTo: 345 / 3.6,
    rpmIdle: 4200,
    rpmMax: 12e3,
    rpmLimit: 12400,
    rpmLaunch: 8500,
    cyl: 6,
    gearsKmh: [98, 132, 166, 200, 236, 272, 310, 352],
    shiftTime: 0.035,
    claZ: 4.3,
    cdaZ: 1.26,
    claX: 2.7,
    cdaX: 0.82,
    aeroFront: 0.4,
    mu: 1.95,
    brakeTq: 9e3,
    brakeFront: 0.56,
    engBrake: 0.14,
    turboLag: 0.06,
    mode: "active",
    steerLock: 0.36,
    lineGrip: 0.78
  },
  "2010": {
    mass: 620,
    cgH: 0.28,
    frontW: 0.46,
    izz: 1050,
    powerICE: 56e4,
    powerERS: 0,
    ersFadeFrom: 999,
    ersFadeTo: 1e3,
    rpmIdle: 5e3,
    rpmMax: 18e3,
    rpmLimit: 18300,
    rpmLaunch: 11500,
    cyl: 8,
    gearsKmh: [118, 157, 194, 229, 261, 291, 321],
    shiftTime: 0.03,
    claZ: 4.1,
    cdaZ: 1.22,
    claX: 4.1,
    cdaX: 1.22,
    aeroFront: 0.41,
    mu: 1.95,
    brakeTq: 9e3,
    brakeFront: 0.57,
    engBrake: 0.14,
    turboLag: 0.02,
    mode: "none",
    steerLock: 0.36,
    lineGrip: 0.78
  },
  "2006": {
    mass: 605,
    cgH: 0.29,
    frontW: 0.46,
    izz: 1020,
    powerICE: 565e3,
    powerERS: 0,
    ersFadeFrom: 999,
    ersFadeTo: 1e3,
    rpmIdle: 5e3,
    rpmMax: 19e3,
    rpmLimit: 19300,
    rpmLaunch: 12e3,
    cyl: 8,
    gearsKmh: [116, 155, 191, 226, 258, 288, 318],
    shiftTime: 0.035,
    claZ: 3.8,
    cdaZ: 1.2,
    claX: 3.8,
    cdaX: 1.2,
    aeroFront: 0.41,
    mu: 1.8,
    brakeTq: 8800,
    brakeFront: 0.58,
    engBrake: 0.14,
    turboLag: 0.02,
    mode: "none",
    steerLock: 0.37,
    lineGrip: 0.75
  }
};
var BIOMES = {
  coast: {
    name: "Shore",
    track: "Monaco-shaped",
    circuit: "Monaco",
    seed: 89,
    icon: "stone",
    style: "shore",
    sunElev: 34,
    sunAz: 200,
    sunColor: 16773336,
    sun: 4.6,
    zenith: 2781142,
    horizon: 13624052,
    fogDensity: 9e-4,
    clouds: 0.25,
    exposure: 1,
    hemi: [11062516, 9077880, 0.8],
    base: 62,
    water: 60,
    grass: "grass",
    width: 13,
    path: ["stone", "gravel", "stone", "cobble"],
    offGrip: 0.7,
    offDrag: 0.3,
    particle: [0.6, 0.6, 0.62],
    // sea and bay (game coordinates), a sea stack plateau, and the sea cave (metres along the lap)
    sea: [[600, -900], [2200, -900], [2200, 2300], [-700, 2300], [-700, 1e3], [440, 1e3], [480, 680], [300, 570], [-110, 525], [-222, 470], [-222, 72], [300, 55], [480, -220], [540, -640]],
    rock: [-450, 690, 420, 960],
    tunnel: [740, 1090]
  },
  plains: {
    name: "Plains",
    track: "Silverstone-shaped",
    circuit: "Silverstone",
    seed: 97,
    icon: "grass_side",
    sunElev: 30,
    sunAz: 160,
    sunColor: 16773600,
    sun: 3.4,
    zenith: 5930926,
    horizon: 13818852,
    fogDensity: 12e-4,
    clouds: 0.78,
    exposure: 1.1,
    hemi: [12110044, 5925434, 1],
    base: 64,
    water: 58,
    grass: "grass",
    path: ["stone", "stone", "cobble", "stone_block", "stone", "gravel"],
    offGrip: 0.6,
    offDrag: 0.55,
    particle: [0.42, 0.36, 0.26]
  },
  monza: {
    name: "Forest",
    track: "Monza-shaped",
    circuit: "Monza",
    seed: 113,
    icon: "darkoak_leaves_o",
    style: "darkforest",
    sunElev: 40,
    sunAz: 140,
    sunColor: 16770752,
    sun: 3.6,
    zenith: 4026032,
    horizon: 12899520,
    fogDensity: 19e-4,
    fogColor: 9414026,
    clouds: 0.4,
    exposure: 1.15,
    hemi: [10270880, 3820066, 0.85],
    base: 64,
    water: 57,
    grass: "grass",
    path: ["stone", "stone", "cobble", "gravel", "stone"],
    offGrip: 0.6,
    offDrag: 0.55,
    particle: [0.32, 0.26, 0.18]
  },
  spa: {
    name: "Taiga",
    track: "Spa-shaped",
    circuit: "Spa",
    seed: 37,
    style: "taiga",
    icon: "grass",
    sunElev: 22,
    sunAz: 230,
    sunColor: 16765594,
    sun: 4.4,
    zenith: 3502022,
    horizon: 12441070,
    fogDensity: 17e-4,
    clouds: 0.62,
    exposure: 1,
    hemi: [10469614, 4872752, 0.75],
    base: 74,
    water: 54,
    grass: "grass",
    path: ["gravel", "gravel", "cobble", "stone", "gravel", "gravel"],
    offGrip: 0.62,
    offDrag: 0.5,
    particle: [0.45, 0.36, 0.25]
  },
  suzuka: {
    name: "Cherry",
    track: "Suzuka-shaped",
    circuit: "Suzuka",
    seed: 131,
    icon: "cherry_leaves_o",
    style: "cherry",
    bridge: true,
    sunElev: 30,
    sunAz: 120,
    sunColor: 16773350,
    sun: 4.2,
    zenith: 4884184,
    horizon: 15785190,
    fogDensity: 12e-4,
    clouds: 0.35,
    exposure: 1.05,
    hemi: [12636400, 6978106, 0.85],
    base: 66,
    water: 58,
    grass: "grass",
    path: ["stone", "stone", "cobble", "stone_block", "gravel"],
    offGrip: 0.6,
    offDrag: 0.55,
    particle: [0.42, 0.34, 0.26]
  },
  mexico: {
    name: "Peaks",
    track: "Mexico City-shaped",
    circuit: "Mexico City",
    seed: 149,
    icon: "snow",
    style: "peaks",
    sunElev: 46,
    sunAz: 170,
    sunColor: 16774376,
    sun: 4.8,
    zenith: 2055364,
    horizon: 13163250,
    fogDensity: 7e-4,
    clouds: 0.3,
    exposure: 0.95,
    hemi: [11585776, 6974048, 0.85],
    base: 120,
    water: 112,
    grass: "grass",
    path: ["stone", "gravel", "stone", "cobble", "stone_block"],
    offGrip: 0.62,
    offDrag: 0.5,
    particle: [0.5, 0.48, 0.45]
  },
  miami: {
    name: "Ocean",
    track: "Miami-shaped",
    circuit: "Miami",
    seed: 167,
    icon: "coral_blue",
    style: "ocean",
    sunElev: 60,
    sunAz: 150,
    sunColor: 13168895,
    sun: 2.6,
    zenith: 674406,
    horizon: 1339530,
    fogDensity: 55e-4,
    fogColor: 941948,
    clouds: 0,
    exposure: 1,
    hemi: [8378096, 1722960, 1.6],
    base: 40,
    water: 72,
    grass: "sand",
    underwater: true,
    path: ["gravel", "stone", "gravel", "cobble", "gravel"],
    offGrip: 0.55,
    offDrag: 0.7,
    particle: [0.8, 0.78, 0.62]
  },
  badlands: {
    name: "Badlands",
    track: "Austin-shaped",
    circuit: "Austin",
    seed: 181,
    icon: "tc_orange",
    style: "badlands",
    sunElev: 42,
    sunAz: 210,
    sunColor: 16769720,
    sun: 4.8,
    zenith: 3107536,
    horizon: 15520436,
    fogDensity: 9e-4,
    clouds: 0.15,
    exposure: 0.95,
    hemi: [11585776, 10510394, 0.75],
    base: 64,
    water: 55,
    grass: "red_sand",
    path: ["desert_stone", "red_sand", "desert_stone", "tc_lgray"],
    offGrip: 0.55,
    offDrag: 0.9,
    particle: [0.78, 0.45, 0.26]
  },
  vegas: {
    name: "Nether",
    track: "Las Vegas-shaped",
    circuit: "Las Vegas",
    seed: 53,
    icon: "netherrack",
    style: "nether",
    sunElev: 65,
    sunAz: 30,
    sunColor: 16742976,
    sun: 2.6,
    night: true,
    zenith: 1704707,
    horizon: 8003340,
    fogDensity: 26e-4,
    fogColor: 5903882,
    clouds: 0,
    exposure: 1.45,
    hemi: [16751205, 8006164, 1.7],
    base: 72,
    water: -999,
    lava: 44,
    grass: "netherrack",
    path: ["nether_brick", "nether_brick", "basalt_top", "nether_brick", "obsidian"],
    offGrip: 0.66,
    offDrag: 0.5,
    particle: [0.45, 0.12, 0.1]
  },
  desert: {
    name: "Desert",
    track: "Lusail-shaped",
    circuit: "Lusail",
    seed: 11,
    icon: "desert_sand",
    sunElev: 38,
    sunAz: 150,
    sunColor: 16771012,
    sun: 4.6,
    zenith: 3108804,
    horizon: 15128248,
    fogDensity: 8e-4,
    clouds: 0.22,
    exposure: 0.95,
    hemi: [11061488, 10123848, 0.75],
    base: 64,
    water: 57,
    grass: "desert_sand",
    path: ["desert_sandstone_block", "sandstone_block", "desert_sandstone_block", "sandstone"],
    offGrip: 0.55,
    offDrag: 0.9,
    particle: [0.86, 0.72, 0.48]
  },
  jungle: {
    name: "Jungle",
    track: "Interlagos-shaped",
    circuit: "Interlagos",
    seed: 23,
    icon: "jungleleaves",
    sunElev: 28,
    sunAz: 105,
    sunColor: 16769461,
    sun: 4,
    zenith: 4030412,
    horizon: 13492431,
    fogDensity: 15e-4,
    clouds: 0.55,
    exposure: 1.2,
    hemi: [11063536, 4876842, 1.15],
    base: 66,
    water: 55,
    grass: "litter",
    path: ["cobble", "mossycobble", "cobble", "gravel"],
    offGrip: 0.6,
    offDrag: 0.55,
    particle: [0.38, 0.28, 0.18]
  },
  forest: {
    name: "Meadow",
    track: "Red Bull Ring-shaped",
    circuit: "Red Bull Ring",
    seed: 37,
    icon: "grass",
    style: "meadow",
    sunElev: 32,
    sunAz: 230,
    sunColor: 16773334,
    sun: 4.6,
    zenith: 3108048,
    horizon: 13032690,
    fogDensity: 11e-4,
    clouds: 0.35,
    exposure: 1,
    hemi: [11061488, 5929520, 0.8],
    base: 74,
    water: 54,
    grass: "grass",
    path: ["gravel", "stone", "cobble", "stone", "gravel"],
    offGrip: 0.62,
    offDrag: 0.5,
    particle: [0.45, 0.36, 0.25]
  },
  arctic: {
    name: "Tundra",
    track: "Montreal-shaped",
    circuit: "Montreal",
    seed: 71,
    icon: "snow",
    sunElev: 13,
    sunAz: 245,
    sunColor: 16763048,
    sun: 3.6,
    zenith: 4618176,
    horizon: 15260646,
    fogDensity: 14e-4,
    clouds: 0.35,
    exposure: 0.95,
    hemi: [11980272, 14673650, 0.85],
    base: 66,
    water: 63,
    ice: true,
    grass: "snow",
    path: ["stone_block", "gravel", "stone", "stone_block", "cobble"],
    offGrip: 0.45,
    offDrag: 0.6,
    particle: [0.92, 0.95, 1]
  }
};
var BIOME_ORDER = ["coast", "badlands", "plains", "arctic", "suzuka", "vegas", "spa", "desert", "monza", "miami", "jungle", "mexico", "forest"];
var TRACK_WIDTH = 22;
var SPLASHES = [
  "Now with downforce!",
  "Box, box!",
  "Lights out!",
  "Also try kerbs!",
  "Creeper-free paddock!",
  "F1 but it's Minecraft!",
  "Mind the gravel!",
  "Undercut the Ender Dragon!",
  "Push now!",
  "Full send!",
  "Blocks per hour!",
  "DRS enabled!",
  "Purple sector!",
  "Tyres are gone!",
  "Hammer time!",
  "100% voxel!"
];

// src/js/world.js
import * as THREE2 from "three";

// src/js/noise.js
function mulberry32(a) {
  return function() {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hash2(x, z, s = 0) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(z | 0, 668265263) ^ Math.imul(s | 0, 2147483647);
  h = Math.imul(h ^ h >>> 13, 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
var F2 = 0.5 * (Math.sqrt(3) - 1);
var G2 = (3 - Math.sqrt(3)) / 6;
var GR = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
var Simplex = class {
  constructor(seed) {
    const r = mulberry32(seed * 9973 + 17);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = r() * (i + 1) | 0;
      const t = p[i];
      p[i] = p[j];
      p[j] = t;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }
  n2(xin, yin) {
    const perm = this.perm;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s), j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t), y0 = yin - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let n = 0, tt, g;
    tt = 0.5 - x0 * x0 - y0 * y0;
    if (tt > 0) {
      g = GR[perm[ii + perm[jj]] & 7];
      tt *= tt;
      n += tt * tt * (g[0] * x0 + g[1] * y0);
    }
    tt = 0.5 - x1 * x1 - y1 * y1;
    if (tt > 0) {
      g = GR[perm[ii + i1 + perm[jj + j1]] & 7];
      tt *= tt;
      n += tt * tt * (g[0] * x1 + g[1] * y1);
    }
    tt = 0.5 - x2 * x2 - y2 * y2;
    if (tt > 0) {
      g = GR[perm[ii + 1 + perm[jj + 1]] & 7];
      tt *= tt;
      n += tt * tt * (g[0] * x2 + g[1] * y2);
    }
    return 70 * n;
  }
  fbm(x, y, oct = 4, lac = 2, gain = 0.5) {
    let a = 1, f = 1, s = 0, n = 0;
    for (let o = 0; o < oct; o++) {
      s += a * this.n2(x * f, y * f);
      n += a;
      a *= gain;
      f *= lac;
    }
    return s / n;
  }
  ridge(x, y, oct = 4) {
    let a = 1, f = 1, s = 0, n = 0;
    for (let o = 0; o < oct; o++) {
      const v = 1 - Math.abs(this.n2(x * f, y * f));
      s += a * v * v;
      n += a;
      a *= 0.5;
      f *= 2;
    }
    return s / n;
  }
};
var smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
var lerp = (a, b, t) => a + (b - a) * t;
var clamp = (x, a, b) => x < a ? a : x > b ? b : x;

// src/js/structures.js
var vkey = (dx, dy, dz) => dy + 64 << 16 | dz + 128 << 8 | dx + 128;
var vdec = (k) => [(k & 255) - 128, (k >> 16) - 64, (k >> 8 & 255) - 128];
function pickStructure(world2, gx, gz) {
  const B = world2.B, A2 = world2.A, G3 = world2.structGrid, seed = B.seed + 77;
  if (hash2(gx, gz, seed) > { desert: 0.4, jungle: 0.5, taiga: 0.5, nether: 0.65, arctic: 0.6, shore: 0.6, plains: 0.35, darkforest: 0.4, cherry: 0.35, peaks: 0.45, ocean: 0.6, badlands: 0.3, meadow: 0.3 }[world2.st]) return null;
  const x = Math.floor(gx * G3 + G3 * 0.15 + hash2(gx, gz, seed + 1) * G3 * 0.7);
  const z = Math.floor(gz * G3 + G3 * 0.15 + hash2(gx, gz, seed + 2) * G3 * 0.7);
  const c = world2.column(x, z);
  if (c.d < 46 || c.smooth) return null;
  const r = hash2(gx, gz, seed + 3), dir = hash2(gx, gz, seed + 4) < 0.5 ? 0 : 1;
  let type = null;
  switch (world2.st) {
    // only natural features: boulders, fossils, reefs, icebergs, lava spires (no buildings)
    case "desert":
      type = c.band ? null : r < 0.6 ? "boulder" : "fossil";
      break;
    case "jungle":
      type = c.fluid ? null : "boulder";
      break;
    case "taiga":
      type = c.fluid || c.top === A2.snow ? null : "boulder";
      break;
    case "nether":
      type = c.fluid === 2 ? null : "lavaspire";
      break;
    case "shore":
      type = c.fluid === 1 && c.h < world2.water - 3 ? "reef" : null;
      break;
    case "ocean":
      type = r < 0.65 ? "reef" : "boulder";
      break;
    case "darkforest":
    case "cherry":
    case "meadow":
    case "plains":
      type = c.fluid ? null : "boulder";
      break;
    case "peaks":
      type = c.fluid ? null : "boulder";
      break;
    case "badlands":
      type = c.fluid || c.band ? null : "boulder";
      break;
    case "arctic":
      type = c.top === A2.ice ? r < 0.75 ? "iceberg" : null : r < 0.5 ? "boulder" : "iceberg";
      break;
  }
  if (!type) return null;
  if (type === "bridge") {
    for (const e of [-42, 42]) {
      const ex = dir ? x : x + e, ez = dir ? z + e : z;
      if (world2.track.near(ex, ez, false).d < 40) return null;
    }
  }
  return { type, x, z, y: Math.floor(c.h), r, dir, key: gx + "," + gz };
}
function buildStructure(world2, st) {
  const A2 = world2.A, vox = /* @__PURE__ */ new Map();
  const put = (dx, dy, dz, t) => {
    if (dx < -127 || dx > 127 || dz < -127 || dz > 127 || dy < -63 || dy > 190) return;
    vox.set(vkey(dx, dy, dz), t);
  };
  const del = (dx, dy, dz) => vox.delete(vkey(dx, dy, dz));
  const box = (x0, y0, z0, x1, y1, z1, t) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) put(x, y, z, typeof t === "function" ? t(x, y, z) : t);
  };
  const h = (a, b, c) => hash2(st.x + a * 7 + c * 3, st.z + b * 13 + c * 5, 31);
  const rot = (x, z) => st.dir ? [z, x] : [x, z];
  switch (st.type) {
    case "pyramid": {
      const H = 12;
      box(-H, -6, -H, H, -1, H, A2.sandstone);
      for (let l = 0; l <= H; l++) {
        const s = H - l;
        const t = l === 4 || l === 8 ? A2.desert_stone_brick : l === H ? A2.tc_orange : A2.sandstone_block;
        box(-s, l, -s, s, l, s, t);
      }
      for (let y = 0; y < 4; y++) for (let k = -1; k <= 1; k++) for (let d = 0; d < 4; d++) {
        const [a, b] = rot(k, -H + d);
        del(a, y, b);
      }
      for (const [a, b] of [[-H, -H], [H, -H], [-H, H], [H, H]]) box(a - 1, 0, b - 1, a + 1, 5, b + 1, (x, y) => y === 5 ? A2.tc_orange : A2.desert_sandstone);
      break;
    }
    case "well":
      box(-3, -3, -3, 3, 0, 3, A2.sandstone);
      box(-2, 1, -2, 2, 1, 2, A2.sandstone_block);
      del(0, 1, 0);
      del(0, 0, 0);
      put(0, 0, 0, A2.water);
      for (const [a, b] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) box(a, 2, b, a, 4, b, A2.sandstone);
      box(-2, 5, -2, 2, 5, 2, A2.sandstone_block);
      break;
    case "temple": {
      const tiers = [[8, 5], [6, 4], [4, 4]];
      let y0 = 0;
      box(-9, -6, -9, 9, -1, 9, A2.mossycobble);
      for (const [s, hh] of tiers) {
        box(-s, y0, -s, s, y0 + hh - 1, s, (x, y, z) => h(x, z, y) < 0.45 ? A2.mossycobble : A2.cobble);
        y0 += hh;
      }
      for (let y = 0; y < 3; y++) for (let k = -1; k <= 1; k++) {
        const [a, b] = rot(k, -8);
        del(a, y, b);
        const [c, d] = rot(k, -7);
        del(c, y, d);
      }
      for (let i = 0; i < 26; i++) {
        const side = Math.floor(h(i, 1, 2) * 4), pos = Math.floor(h(i, 2, 3) * 15) - 7, len = 2 + Math.floor(h(i, 3, 4) * 5);
        const [a, b] = side === 0 ? [pos, -9] : side === 1 ? [pos, 9] : side === 2 ? [-9, pos] : [9, pos];
        for (let y = 0; y < len; y++) put(a, 4 - y, b, A2.vine);
      }
      box(-1, y0, -1, 1, y0 + 1, 1, A2.mossycobble);
      break;
    }
    case "shipwreck": {
      const L = 9 + Math.floor(st.r * 5);
      for (let a = -L; a <= L; a++) {
        const w = a > L - 4 ? Math.max(0, 2 - (a - (L - 4))) : 2;
        if (h(a, 0, 1) < 0.12) continue;
        for (let b = -w; b <= w; b++) {
          const [px, pz] = rot(a, b), wall = Math.abs(b) === w;
          put(px, 0, pz, A2.planks);
          if (wall || a === -L) {
            put(px, 1, pz, A2.planks);
            if (a < L - 6 && h(a, b, 2) > 0.35) put(px, 2, pz, A2.pine_planks);
          }
        }
      }
      for (let y = 1; y < 6; y++) {
        const [px, pz] = rot(-2, 0);
        put(px, y, pz, A2.tree);
      }
      {
        const [px, pz] = rot(-L + 2, 0);
        box(px - 1, 1, pz - 1, px + 1, 2, pz + 1, A2.pine_planks);
      }
      break;
    }
    case "ruins": {
      const R = 3 + Math.floor(st.r * 2);
      for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) {
        put(x, 0, z, h(x, z, 3) < 0.5 ? A2.prismarine : A2.stone_brick);
        if (Math.abs(x) === R || Math.abs(z) === R) {
          const top = 1 + Math.floor(h(x, z, 4) * 4);
          for (let y = 1; y <= top; y++) put(x, y, z, h(x, y, z) < 0.35 ? A2.mossycobble : A2.stone_brick);
        }
      }
      break;
    }
    case "monument": {
      const H = 9;
      for (let l = 0; l <= H; l++) {
        const sz = 15 - l;
        for (let x = -sz; x <= sz; x++) for (let z = -sz; z <= sz; z++) {
          if (l > 0 && Math.max(Math.abs(x), Math.abs(z)) < sz - 1) continue;
          put(x, l, z, l % 3 === 2 ? A2.dark_prismarine : A2.prismarine);
        }
      }
      for (const [a, b] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) box(a - 1, 0, b - 1, a + 1, 13, b + 1, (x, y) => y > 11 ? A2.glowstone : A2.dark_prismarine);
      box(-3, H, -3, 3, H + 4, 3, (x, y, z) => Math.abs(x) === 3 || Math.abs(z) === 3 ? A2.prismarine : A2.glowstone);
      break;
    }
    case "yacht": {
      const L = 9 + Math.floor(st.r * 9), Wd = 2 + (st.r > 0.5 ? 1 : 0);
      for (let a = -L; a <= L; a++) {
        const taper = a > L - 5 ? Math.max(0, Wd - (a - (L - 5))) : Wd;
        for (let b = -taper; b <= taper; b++) {
          const [px, pz] = rot(a, b);
          put(px, 0, pz, A2.wool_black);
          put(px, 1, pz, A2.wool_white);
          put(px, 2, pz, A2.wool_white);
          if (Math.abs(b) < taper || a > L - 6) put(px, 2, pz, A2.planks);
        }
      }
      const decks = [[-L + 3, L - 7, 3], [-L + 5, L - 10, 4], [-L + 8, L - 13, 5]];
      for (const [a0, a1, y] of decks) for (let a = a0; a <= a1; a++) for (let b = -Wd + 1; b <= Wd - 1; b++) {
        const [px, pz] = rot(a, b), side = Math.abs(b) === Wd - 1 || a === a0 || a === a1;
        put(px, y, pz, side && y < 5 && a & 1 ? A2.glass : A2.wool_white);
      }
      break;
    }
    case "cabin": {
      box(-5, -5, -4, 5, 0, 4, A2.cobble);
      for (let y = 1; y <= 4; y++) for (let x = -4; x <= 4; x++) for (let z = -3; z <= 3; z++) {
        const edge = Math.abs(x) === 4 || Math.abs(z) === 3;
        if (!edge) continue;
        const corner = Math.abs(x) === 4 && Math.abs(z) === 3;
        const win = (y === 2 || y === 3) && !corner && (Math.abs(x) === 2 || z === 0);
        put(...st.dir ? [z, y, x] : [x, y, z], corner ? A2.pine : win ? A2.glass : A2.pine_planks);
      }
      for (let y = 1; y <= 2; y++) {
        const [a, b] = rot(0, -3);
        del(a, y, b);
      }
      for (let l = 0; l <= 4; l++) for (let x = -5; x <= 5; x++) for (const z of [-4 + l, 4 - l]) put(...st.dir ? [z, 5 + l, x] : [x, 5 + l, z], A2.jungle_planks);
      for (let x = -4; x <= 4; x++) for (let z = -3 + 0; z <= 3; z++) if (Math.abs(z) <= 3) {
      }
      box(...st.dir ? [2, 5, 3, 2, 10, 3] : [3, 5, 2, 3, 10, 2], A2.cobble);
      break;
    }
    case "boulder": {
      const R = 2 + st.r * 2.5;
      for (let y = -2; y <= R; y++) for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) {
        if (x * x + z * z + (y * 1.3) ** 2 > R * R + h(x, z, y) * 3) continue;
        const k = world2.st, v = h(x, y, z);
        const t = k === "desert" ? v < 0.5 ? A2.sandstone : A2.desert_stone : k === "badlands" ? v < 0.5 ? A2.tc_orange : A2.tc_red : k === "arctic" || k === "peaks" ? y >= R - 1 ? A2.snow : v < 0.5 ? A2.stone : A2.cobble : k === "ocean" || k === "shore" ? v < 0.4 ? A2.mossycobble : A2.stone : v < 0.5 ? A2.mossycobble : A2.cobble;
        put(x, y, z, t);
      }
      break;
    }
    case "fossil": {
      const L = 4 + Math.floor(st.r * 4);
      for (let a = -L; a <= L; a++) {
        const [px, pz] = rot(a, 0);
        put(px, 0, pz, A2.silver_sand);
      }
      for (let a = -L + 1; a < L; a += 2) for (let b = -3; b <= 3; b++) {
        const y = 3 - Math.round(Math.abs(b) * 0.9);
        const [px, pz] = rot(a, b);
        put(px, y, pz, A2.silver_sand);
      }
      break;
    }
    case "reef": {
      const cs = [A2.coral_pink, A2.coral_yellow, A2.coral_blue, A2.coral_purple];
      for (let m = 0; m < 6; m++) {
        const mx = Math.round((h(m, 1, 9) - 0.5) * 16), mz = Math.round((h(m, 2, 9) - 0.5) * 16), R = 2 + h(m, 3, 9) * 2.5, ct = cs[Math.floor(h(m, 4, 9) * 4)];
        for (let y = -1; y <= R; y++) for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) {
          if (x * x + z * z + (y * 1.4) ** 2 > R * R + h(x + mx, z + mz, y) * 2.5) continue;
          put(mx + x, y, mz + z, h(x, y, z + m) < 0.2 ? cs[m + 1 & 3] : ct);
        }
        for (let k = 0; k < 3; k++) {
          const bx = mx + Math.round((h(m, k, 11) - 0.5) * 4), bz = mz + Math.round((h(k, m, 12) - 0.5) * 4), len = 2 + Math.floor(h(m, k, 13) * 4);
          for (let y = 0; y < len; y++) put(bx, Math.floor(R) + y, bz, ct);
        }
      }
      break;
    }
    case "igloo": {
      const R = 4.5;
      box(-5, -3, -5, 5, -1, 5, A2.snow);
      for (let y = 0; y <= 5; y++) for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) if (x * x + z * z + (y * 1.05) ** 2 <= R * R) put(x, y, z, A2.snow);
      for (let d = -7; d <= -4; d++) for (let k = -1; k <= 1; k++) for (let y = 0; y <= 2; y++) {
        const [a, b] = rot(k, d);
        put(a, y, b, A2.snow);
      }
      for (let d = -7; d <= -3; d++) for (let y = 0; y <= 1; y++) {
        const [a, b] = rot(0, d);
        del(a, y, b);
      }
      put(0, 6, 0, A2.packed_ice);
      break;
    }
    case "iceberg": {
      const R = 5 + st.r * 5, H = 7 + st.r * 12;
      for (let y = -4; y <= H; y++) {
        const rr = R * (1 - Math.max(0, y) / (H + 2)) ** 0.8;
        for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
          const n = h(x, z, 0) * 1.6;
          if (x * x + z * z > (rr + n) * (rr + n)) continue;
          put(x, y, z, y >= H - 1 ? A2.snow : h(x, y, z) < 0.18 ? A2.blue_ice : A2.packed_ice);
        }
      }
      break;
    }
    case "bridge": {
      const deck = world2.lava + 7 - st.y, L = 40;
      for (let d = -L; d <= L; d++) {
        for (let k = -2; k <= 2; k++) {
          const [a, b] = rot(k, d);
          put(a, deck, b, A2.nether_brick);
        }
        if (d % 2 === 0) for (const k of [-2, 2]) {
          const [a, b] = rot(k, d);
          put(a, deck + 1, b, A2.nether_brick);
        }
        if ((d % 12 + 12) % 12 === 0) {
          const [a, b] = rot(0, d);
          const gh = Math.floor(world2.column(st.x + a, st.z + b).h) - st.y;
          for (let y = Math.max(-40, gh - 2); y < deck; y++) for (let k = -1; k <= 1; k++) {
            const [c, e] = rot(k, d);
            put(c, y, e, A2.nether_brick);
          }
        }
      }
      break;
    }
    case "lavaspire": {
      const H = 24 + Math.floor(st.r * 22);
      for (let y = -2; y < H; y++) {
        const w = Math.max(0, Math.round((1 - y / H) * 4.2));
        for (let x = -w; x <= w; x++) for (let z = -w; z <= w; z++) if (x * x + z * z <= w * w + 0.5) put(x, y, z, h(x, z, y) < 0.08 ? A2.glowstone : A2.netherrack);
      }
      for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) put(x, H, z, A2.glowstone);
      const top = Math.floor(H * 0.75), side = Math.round((1 - top / H) * 4.2) + 1;
      const [fx, fz] = rot(0, side);
      for (let y = top; y >= -1; y--) put(fx, y, fz, A2.lava);
      const [px, pz] = rot(0, side + 1);
      for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) put(px + x, -1, pz + z, A2.lava);
      break;
    }
  }
  return vox;
}

// src/js/world.js
var DECOR_G = 6;
var TILE_N = 32;
var Track = class {
  constructor(pts) {
    const n = pts.length, dense = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (let k = 0; k < 16; k++) {
        const t = k / 16, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    dense.push(dense[0]);
    const cum = [0];
    for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
    const Ltot = cum[cum.length - 1];
    const N = Math.floor(Ltot);
    this.N = N;
    const X = this.X = new Float32Array(N), Z = this.Z = new Float32Array(N);
    let j = 0;
    for (let i = 0; i < N; i++) {
      const s = i / N * Ltot;
      while (cum[j + 1] < s) j++;
      const t = (s - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]);
      X[i] = lerp(dense[j][0], dense[j + 1][0], t);
      Z[i] = lerp(dense[j][1], dense[j + 1][1], t);
    }
    const TX = this.TX = new Float32Array(N), TZ = this.TZ = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = (i - 2 + N) % N, b = (i + 2) % N;
      const dx = X[b] - X[a], dz = Z[b] - Z[a], l = Math.hypot(dx, dz) || 1;
      TX[i] = dx / l;
      TZ[i] = dz / l;
    }
    this.H = new Float32Array(N);
    let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    for (let i = 0; i < N; i++) {
      minX = Math.min(minX, X[i]);
      maxX = Math.max(maxX, X[i]);
      minZ = Math.min(minZ, Z[i]);
      maxZ = Math.max(maxZ, Z[i]);
    }
    this.bounds = { minX, maxX, minZ, maxZ };
    this._buildGrid();
    this.q = { d: 1e9, s: 0, i: 0, lat: 0, h: 0 };
  }
  // heights from a sampler, smoothed + grade-limited
  setHeights(sample, minH, maxGrade = 0.085) {
    const N = this.N, raw = new Float32Array(N);
    for (let i = 0; i < N; i++) raw[i] = sample(this.X[i], this.Z[i]);
    const blur = (src, sig) => {
      const r = Math.ceil(sig * 2.5), ker = [];
      let sum = 0;
      for (let k = -r; k <= r; k++) {
        const w = Math.exp(-0.5 * (k / sig) ** 2);
        ker.push(w);
        sum += w;
      }
      const out = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        let a = 0;
        for (let k = -r; k <= r; k++) a += src[(i + k + N) % N] * ker[k + r];
        out[i] = a / sum;
      }
      return out;
    };
    const h0 = blur(raw, 28);
    const D = 8, M = Math.floor(N / D), KMAX = 11e-4 * D * D, G3 = maxGrade * D;
    const c = new Float32Array(M), tgt = new Float32Array(M);
    for (let j = 0; j < M; j++) {
      tgt[j] = Math.max(minH, h0[Math.floor(j * N / M)]);
      c[j] = tgt[j];
    }
    for (let it = 0; it < 900; it++) {
      if (it < 600) for (let j = 0; j < M; j++) c[j] += (tgt[j] - c[j]) * 0.02;
      for (let j = 0; j < M; j++) {
        const a = c[(j - 1 + M) % M], b = c[(j + 1) % M];
        const cv = a - 2 * c[j] + b;
        if (cv > KMAX) c[j] += (cv - KMAX) / 2;
        else if (cv < -KMAX) c[j] += (cv + KMAX) / 2;
      }
      for (let j = 1; j < M * 2; j++) {
        const a = c[(j - 1) % M], k = j % M;
        c[k] = clamp(c[k], a - G3, a + G3);
      }
      for (let j = M * 2; j > 0; j--) {
        const a = c[(j + 1) % M], k = j % M;
        c[k] = clamp(c[k], a - G3, a + G3);
      }
      for (let j = 0; j < M; j++) c[j] = Math.max(c[j], minH);
    }
    let h = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const f = i * M / N, j = Math.floor(f), t = f - j;
      const p0 = c[(j - 1 + M) % M], p1 = c[j % M], p2 = c[(j + 1) % M], p3 = c[(j + 2) % M];
      h[i] = 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
    }
    h = blur(h, 6);
    this.H.set(h);
  }
  _buildGrid() {
    const G3 = 4, M = 360, R = 340;
    const b = this.bounds;
    this.gx0 = Math.floor(b.minX - M);
    this.gz0 = Math.floor(b.minZ - M);
    this.gw = Math.ceil((b.maxX - b.minX + 2 * M) / G3);
    this.gh = Math.ceil((b.maxZ - b.minZ + 2 * M) / G3);
    const idx = this.gIdx = new Int32Array(this.gw * this.gh).fill(-1);
    const dist = this.gDist = new Float32Array(this.gw * this.gh).fill(1e18);
    const rc = Math.ceil(R / G3);
    for (let i = 0; i < this.N; i += 4) {
      const x = this.X[i], z = this.Z[i];
      const cx = Math.floor((x - this.gx0) / G3), cz = Math.floor((z - this.gz0) / G3);
      for (let dz = -rc; dz <= rc; dz++) {
        const zz = cz + dz;
        if (zz < 0 || zz >= this.gh) continue;
        const wz = this.gz0 + (zz + 0.5) * G3 - z, wz2 = wz * wz;
        if (wz2 > R * R) continue;
        for (let dx = -rc; dx <= rc; dx++) {
          const xx = cx + dx;
          if (xx < 0 || xx >= this.gw) continue;
          const wx = this.gx0 + (xx + 0.5) * G3 - x;
          const d2 = wx * wx + wz2;
          const k = zz * this.gw + xx;
          if (d2 < dist[k]) {
            dist[k] = d2;
            idx[k] = i;
          }
        }
      }
    }
    this.G = G3;
  }
  // figure-8 circuits: the two passes over the crossing; near() must pick the right one
  setCrossing(iLow, iUp, R) {
    this.cross = { iLow, iUp, R, x: (this.X[iLow] + this.X[iUp]) / 2, z: (this.Z[iLow] + this.Z[iUp]) / 2 };
    this.qa = { d: 1e9, s: 0, i: 0, lat: 0, h: 0 };
    this.qb = { d: 1e9, s: 0, i: 0, lat: 0, h: 0 };
    this.hint = null;
  }
  _nearWin(x, z, i0, out) {
    const N = this.N, X = this.X, Z = this.Z;
    let best = 1e18, bi = i0;
    for (let k = -170; k <= 170; k++) {
      const i = (i0 + k + N) % N, dx = x - X[i], dz = z - Z[i], d2 = dx * dx + dz * dz;
      if (d2 < best) {
        best = d2;
        bi = i;
      }
    }
    return this._proj(x, z, bi, out);
  }
  // useHint: the car's own queries follow the pass it is on; terrain prefers the lower road
  near(x, z, useHint = true) {
    const c = this.cross;
    if (c && Math.abs(x - c.x) < 110 && Math.abs(z - c.z) < 110) {
      const a = this._nearWin(x, z, c.iLow, this.qa), b = this._nearWin(x, z, c.iUp, this.qb);
      let pick;
      if (useHint && this.hint != null) {
        const N = this.N, da = Math.min(Math.abs(a.s - this.hint), N - Math.abs(a.s - this.hint)), db = Math.min(Math.abs(b.s - this.hint), N - Math.abs(b.s - this.hint));
        pick = da <= db ? a : b;
      } else pick = a.d < c.R ? a : b.d < a.d ? b : a;
      const q = this.q;
      q.d = pick.d;
      q.s = pick.s;
      q.i = pick.i;
      q.lat = pick.lat;
      q.h = pick.h;
      return q;
    }
    return this._near(x, z);
  }
  _near(x, z) {
    const q = this.q;
    const cx = Math.floor((x - this.gx0) / this.G), cz = Math.floor((z - this.gz0) / this.G);
    if (cx < 0 || cz < 0 || cx >= this.gw || cz >= this.gh) {
      q.d = 1e9;
      return q;
    }
    const k0 = cz * this.gw + cx;
    const i0 = this.gIdx[k0];
    if (i0 < 0) {
      q.d = 1e9;
      return q;
    }
    const N = this.N, X = this.X, Z = this.Z;
    if (this.gDist[k0] > 60 * 60) {
      q.d = Math.hypot(x - X[i0], z - Z[i0]);
      q.s = i0;
      q.i = i0;
      q.h = this.H[i0];
      q.lat = 0;
      return q;
    }
    let best = 1e18, bi = i0;
    for (let k = -10; k <= 10; k++) {
      const i = (i0 + k + N) % N;
      const dx = x - X[i], dz = z - Z[i], d2 = dx * dx + dz * dz;
      if (d2 < best) {
        best = d2;
        bi = i;
      }
    }
    return this._proj(x, z, bi, q);
  }
  _proj(x, z, bi, q) {
    const N = this.N, X = this.X, Z = this.Z;
    const i1 = (bi + 1) % N, im = (bi - 1 + N) % N;
    let s, px, pz;
    let ax = X[i1] - X[bi], az = Z[i1] - Z[bi];
    let t = ((x - X[bi]) * ax + (z - Z[bi]) * az) / (ax * ax + az * az || 1);
    if (t < 0) {
      ax = X[bi] - X[im];
      az = Z[bi] - Z[im];
      t = clamp(((x - X[im]) * ax + (z - Z[im]) * az) / (ax * ax + az * az || 1), 0, 1);
      px = X[im] + ax * t;
      pz = Z[im] + az * t;
      s = bi - 1 + t;
    } else {
      t = Math.min(t, 1);
      px = X[bi] + ax * t;
      pz = Z[bi] + az * t;
      s = bi + t;
    }
    if (s < 0) s += N;
    const dx = x - px, dz = z - pz;
    q.d = Math.hypot(dx, dz);
    q.lat = ax * dz - az * dx > 0 ? q.d : -q.d;
    q.s = s;
    q.i = bi;
    q.h = this.hAt(s);
    return q;
  }
  hAt(s) {
    const N = this.N;
    s = (s % N + N) % N;
    const i = Math.floor(s), f = s - i;
    return lerp(this.H[i], this.H[(i + 1) % N], f);
  }
};
function makeBlockTexture(img, count) {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 16 * count;
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const src = g.getImageData(0, 0, 16, 16 * count).data;
  const data = new Uint8Array(16 * 16 * 4 * count);
  for (let l = 0; l < count; l++) for (let y = 0; y < 16; y++) {
    const sy = l * 16 + (15 - y);
    for (let x = 0; x < 16; x++) {
      const si = (sy * 16 + x) * 4, di = ((l * 16 + y) * 16 + x) * 4;
      data[di] = src[si];
      data[di + 1] = src[si + 1];
      data[di + 2] = src[si + 2];
      data[di + 3] = src[si + 3];
    }
  }
  const tex = new THREE2.DataArrayTexture(data, 16, 16, count);
  tex.format = THREE2.RGBAFormat;
  tex.type = THREE2.UnsignedByteType;
  tex.magFilter = THREE2.NearestFilter;
  tex.minFilter = THREE2.LinearMipmapLinearFilter;
  tex.wrapS = tex.wrapT = THREE2.RepeatWrapping;
  tex.generateMipmaps = true;
  tex.colorSpace = THREE2.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
function makePbrTexture(img, A2) {
  const count = Object.keys(A2).length;
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 16 * count;
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const src = g.getImageData(0, 0, 16, 16 * count).data;
  const names = [];
  for (const k in A2) names[A2[k]] = k;
  const R = (n) => {
    if (/ice/.test(n)) return [0.06, 0.6];
    if (n === "glass") return [0.05, 0.3];
    if (n === "obsidian") return [0.12, 1.4];
    if (/_block|brick/.test(n)) return [0.38, 1.6];
    if (/stone|cobble|basalt|netherrack|permafrost/.test(n)) return [0.6, 1.7];
    if (/wool/.test(n)) return [0.95, 0.8];
    if (/snow/.test(n)) return [0.42, 0.9];
    if (/leaves|needles|wart|vine|cactus/.test(n)) return [0.5, 1.8];
    if (/grass|litter|nylium|lily/.test(n)) return [0.7, 1.3];
    if (/sand|gravel|dirt|clay|soil/.test(n)) return [0.92, 0.5];
    if (/tree|planks|stem|pine|aspen|acacia/.test(n)) return [0.62, 2.2];
    if (/^p_/.test(n)) return [0.6, 0.6];
    return [0.65, 1.5];
  };
  const data = new Uint8Array(16 * 16 * 4 * count);
  for (let l = 0; l < count; l++) {
    const [rough, bump] = R(names[l] || "");
    const lum = new Float32Array(256);
    let mean = 0;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const si = ((l * 16 + y) * 16 + x) * 4;
      lum[y * 16 + x] = (src[si] * 0.3 + src[si + 1] * 0.59 + src[si + 2] * 0.11) / 255;
      mean += lum[y * 16 + x];
    }
    mean /= 256;
    const L = (x, y) => lum[(y + 16) % 16 * 16 + (x + 16) % 16];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const gx = L(x + 1, y - 1) + 2 * L(x + 1, y) + L(x + 1, y + 1) - (L(x - 1, y - 1) + 2 * L(x - 1, y) + L(x - 1, y + 1));
      const gy = L(x - 1, y + 1) + 2 * L(x, y + 1) + L(x + 1, y + 1) - (L(x - 1, y - 1) + 2 * L(x, y - 1) + L(x + 1, y - 1));
      let nx = -gx * bump, ny = gy * bump;
      const nl = Math.hypot(nx, ny, 1);
      nx /= nl;
      ny /= nl;
      const r = clamp(rough - (L(x, y) - mean) * 0.6, 0.03, 1);
      const di = ((l * 16 + (15 - y)) * 16 + x) * 4;
      data[di] = Math.round((nx * 0.5 + 0.5) * 255);
      data[di + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[di + 2] = Math.round(r * 255);
      data[di + 3] = 255;
    }
  }
  const tex = new THREE2.DataArrayTexture(data, 16, 16, count);
  tex.format = THREE2.RGBAFormat;
  tex.type = THREE2.UnsignedByteType;
  tex.magFilter = THREE2.NearestFilter;
  tex.minFilter = THREE2.LinearMipmapLinearFilter;
  tex.wrapS = tex.wrapT = THREE2.RepeatWrapping;
  tex.generateMipmaps = true;
  tex.colorSpace = THREE2.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}
var sharedUniforms = { uTime: { value: 0 }, uBump: { value: 0.7 } };
function makePbrBlockMaterial(tex, pbr, A2, opts = {}) {
  const m = new THREE2.MeshStandardMaterial({ vertexColors: true, alphaTest: opts.alphaTest ?? 0.5, side: opts.side || THREE2.FrontSide, metalness: 0, roughness: 0.7 });
  const wave = [A2.leaves, A2.jungleleaves, A2.pine_needles, A2.aspen_leaves, A2.acacia_leaves, A2.vine, A2.cherry_leaves, A2.darkoak_leaves];
  const plants = Object.keys(A2).filter((k) => k.startsWith("p_")).map((k) => A2[k]);
  const leafy = [...wave, A2.leaves_o, A2.jungleleaves_o, A2.pine_needles_o, A2.aspen_leaves_o, A2.acacia_leaves_o, A2.cherry_leaves_o, A2.darkoak_leaves_o, ...plants];
  m.onBeforeCompile = (sh) => {
    sh.uniforms.tArr = { value: tex };
    sh.uniforms.tPbr = { value: pbr };
    sh.uniforms.uTime = sharedUniforms.uTime;
    sh.uniforms.uBump = sharedUniforms.uBump;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float tl;\nvarying vec2 vTUV;\nvarying float vTL;\nvarying vec3 vWN;\nuniform float uTime;").replace("#include <uv_vertex>", "#include <uv_vertex>\nvTUV = uv; vTL = tl; vWN = normal;").replace("#include <begin_vertex>", `#include <begin_vertex>
        {
          float L = floor(tl + 0.5);
          vec4 wp = modelMatrix * vec4(transformed, 1.0);
          float w = 0.0;
          ${wave.map((v) => `if (abs(L - ${v}.0) < 0.5) w = 0.06;`).join("\n")}
          ${plants.map((v) => `if (abs(L - ${v}.0) < 0.5) w = 0.13 * fract(transformed.y + 0.001);`).join("\n")}
          if (w > 0.0) {
            float ph = wp.x * 0.37 + wp.z * 0.23;
            transformed.x += w * sin(uTime * 1.7 + ph) + w * 0.4 * sin(uTime * 3.1 + ph * 2.0);
            transformed.z += w * cos(uTime * 1.3 + ph * 1.3);
          }
        }`);
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nprecision highp sampler2DArray;\nuniform sampler2DArray tArr, tPbr;\nuniform float uBump;\nvarying vec2 vTUV;\nvarying float vTL;\nvarying vec3 vWN;").replace("#include <map_fragment>", `
        float L = floor(vTL + 0.5);
        vec2 tdx = dFdx(vTUV), tdy = dFdy(vTUV);
        vec4 texel = textureGrad(tArr, vec3(fract(vTUV), L), tdx, tdy);
        vec4 pbrT = textureGrad(tPbr, vec3(fract(vTUV), L), tdx, tdy);
        bool leafy = false;
        ${leafy.map((v) => `if (abs(L - ${v}.0) < 0.5) leafy = true;`).join("\n")}
        diffuseColor *= texel;`).replace("#include <roughnessmap_fragment>", "float roughnessFactor = pbrT.b;").replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
        {
          vec3 wn = normalize(vWN);
          vec3 T, Bt;
          if (abs(wn.y) > 0.5) { T = vec3(1.0, 0.0, 0.0); Bt = vec3(0.0, 0.0, 1.0); }
          else if (abs(wn.x) > 0.5) { T = vec3(0.0, 0.0, 1.0); Bt = vec3(0.0, 1.0, 0.0); }
          else { T = vec3(1.0, 0.0, 0.0); Bt = vec3(0.0, 1.0, 0.0); }
          vec2 nt = (pbrT.rg * 2.0 - 1.0) * uBump;
          vec3 pn = normalize(wn + T * nt.x + Bt * nt.y);
          normal = normalize((viewMatrix * vec4(pn, 0.0)).xyz);
        }`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        if (abs(L - ${A2.glowstone}.0) < 0.5 || abs(L - ${A2.shroomlight}.0) < 0.5) totalEmissiveRadiance += texel.rgb * 2.6;
        if (abs(L - ${A2.lava}.0) < 0.5) totalEmissiveRadiance += texel.rgb * 3.0;`).replace("#include <lights_fragment_end>", `#include <lights_fragment_end>
        // rough blocks hardly mirror the sky (no horizon occlusion otherwise -> blue sheen on gravel)
        reflectedLight.indirectSpecular *= pow(1.0 - roughnessFactor, 1.6) * 1.5;
        // cheap bounce-light: sky fill picks up the warm colour of sunlit ground
        reflectedLight.indirectDiffuse *= vec3(1.1, 1.02, 0.86);
        #if NUM_DIR_LIGHTS > 0
        if (leafy) {
          // light scattering through leaves when looking toward the sun
          vec3 Ls = directionalLights[0].direction;
          float back = pow(max(dot(normalize(-vViewPosition), Ls), 0.0), 4.0);
          reflectedLight.indirectDiffuse += diffuseColor.rgb * directionalLights[0].color * (0.25 + back * 0.9) * 0.35;
        }
        #endif`);
  };
  m.customProgramCacheKey = () => "pblock" + (opts.side || 0) + (opts.alphaTest ?? 0.5);
  return m;
}
function makeBlockMaterial(tex, A2, opts = {}) {
  const m = new THREE2.MeshLambertMaterial({ vertexColors: true, alphaTest: opts.alphaTest ?? 0.5, side: opts.side || THREE2.FrontSide });
  const wave = [A2.leaves, A2.jungleleaves, A2.pine_needles, A2.aspen_leaves, A2.acacia_leaves, A2.vine, A2.cherry_leaves, A2.darkoak_leaves];
  const plants = Object.keys(A2).filter((k) => k.startsWith("p_")).map((k) => A2[k]);
  m.onBeforeCompile = (sh) => {
    sh.uniforms.tArr = { value: tex };
    sh.uniforms.uTime = sharedUniforms.uTime;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float tl;\nvarying vec2 vTUV;\nvarying float vTL;\nuniform float uTime;").replace("#include <uv_vertex>", "#include <uv_vertex>\nvTUV = uv; vTL = tl;").replace("#include <begin_vertex>", `#include <begin_vertex>
        {
          float L = floor(tl + 0.5);
          vec4 wp = modelMatrix * vec4(transformed, 1.0);
          float w = 0.0;
          ${wave.map((v) => `if (abs(L - ${v}.0) < 0.5) w = 0.06;`).join("\n")}
          ${plants.map((v) => `if (abs(L - ${v}.0) < 0.5) w = 0.13 * fract(transformed.y + 0.001);`).join("\n")}
          if (w > 0.0) {
            float ph = wp.x * 0.37 + wp.z * 0.23;
            transformed.x += w * sin(uTime * 1.7 + ph) + w * 0.4 * sin(uTime * 3.1 + ph * 2.0);
            transformed.z += w * cos(uTime * 1.3 + ph * 1.3);
          }
        }`);
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nprecision highp sampler2DArray;\nuniform sampler2DArray tArr;\nvarying vec2 vTUV;\nvarying float vTL;").replace("#include <map_fragment>", `
        float L = floor(vTL + 0.5);
        vec4 texel = textureGrad(tArr, vec3(fract(vTUV), L), dFdx(vTUV), dFdy(vTUV));
        diffuseColor *= texel;`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        if (abs(L - ${A2.glowstone}.0) < 0.5 || abs(L - ${A2.shroomlight}.0) < 0.5) totalEmissiveRadiance += texel.rgb * 2.2;
        if (abs(L - ${A2.lava}.0) < 0.5) totalEmissiveRadiance += texel.rgb * 2.6;`);
  };
  m.customProgramCacheKey = () => "block" + (opts.side || 0);
  return m;
}
function makeWaterMaterial(sky2) {
  const wm = new THREE2.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: true,
    uniforms: THREE2.UniformsUtils.merge([THREE2.UniformsLib.fog, {
      uTime: { value: 0 },
      zen: { value: new THREE2.Color() },
      hor: { value: new THREE2.Color() },
      sunDir: { value: new THREE2.Vector3(0, 1, 0) },
      sunCol: { value: new THREE2.Color() },
      deep: { value: new THREE2.Color(735834) },
      cover: { value: 0.4 }
    }]),
    vertexShader: `varying vec3 vW;
${THREE2.ShaderChunk.fog_pars_vertex}
      void main(){ vec3 transformed = position; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
${THREE2.ShaderChunk.fog_vertex}
 }`,
    fragmentShader: `uniform float uTime, cover; uniform vec3 zen, hor, sunDir, sunCol, deep; varying vec3 vW;
${THREE2.ShaderChunk.common}
${THREE2.ShaderChunk.fog_pars_fragment}

      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*vn(p); p=p*2.03+vec2(17.1,9.3); a*=0.5; } return s; }
      // the same sky as the dome, clouds included, so water mirrors the clouds overhead
      vec3 skyAt(vec3 R) {
        float y = max(R.y, 0.0);
        vec3 c = mix(hor, zen, pow(y, 0.42));
        if (cover > 0.0) {
          vec2 p = R.xz / (y + 0.06) * 0.9 + cameraPosition.xz * 0.00045 + vec2(uTime * 0.006, uTime * 0.002);
          float n = fbm(p * 1.6);
          float dens = smoothstep(1.0 - cover * 0.75, 1.0 - cover * 0.75 + 0.28, n) * smoothstep(0.0, 0.18, y);
          c = mix(c, vec3(1.0, 0.98, 0.95) * 1.1, dens * 0.9);
        }
        return c;
      }
      float hgt(vec2 p){ return vn(p*0.9 + uTime*vec2(0.35,0.2))*0.6 + vn(p*2.3 - uTime*vec2(0.5,0.3))*0.3 + vn(p*5.1 + uTime*0.9)*0.1; }
      void main(){
        vec2 p = vW.xz; float e = 0.08;
        float h0 = hgt(p); vec3 n = normalize(vec3(h0 - hgt(p+vec2(e,0.0)), e*2.2, h0 - hgt(p+vec2(0.0,e))));
        vec3 V = normalize(cameraPosition - vW);
        float fres = 0.04 + 0.96*pow(1.0 - max(dot(n, V), 0.0), 5.0);
        vec3 R = reflect(-V, n);
        vec3 skyc = skyAt(R);
        float spec = pow(max(dot(R, normalize(sunDir)), 0.0), 400.0) * 14.0 + pow(max(dot(R, normalize(sunDir)), 0.0), 40.0) * 0.4;
        vec3 col = mix(deep, skyc, fres) + sunCol * spec;
        gl_FragColor = vec4(col, mix(0.66, 0.97, fres));

${THREE2.ShaderChunk.fog_fragment}
      }`
  });
  Object.assign(wm.uniforms, fogU);
  return wm;
}
var World = class {
  constructor(biome, trackPts, A2, mats2) {
    this.B = biome;
    this.A = A2;
    this.mats = mats2;
    this.st = biome.style || biome.key;
    this.noise = new Simplex(biome.seed);
    this.noise2 = new Simplex(biome.seed + 1e3);
    this.noise3 = new Simplex(biome.seed + 2e3);
    this.water = biome.water;
    this.lava = biome.lava ?? -999;
    this.hw = (biome.width || TRACK_WIDTH) / 2;
    this.flat = this.hw + 5;
    if (biome.sea) this._coastSetup(biome);
    this.track = new Track(trackPts);
    this.under = !!biome.underwater;
    const minH = this.under ? -999 : Math.max(this.water, this.lava) + (biome.lava ? 7 : 2.5);
    this.track.setHeights((x, z) => this.terrainRaw(x, z, 0), minH, { taiga: 0.115, arctic: 0.06, plains: 0.03, shore: 0.1, darkforest: 0.03, cherry: 0.09, peaks: 0.05, ocean: 0.06, badlands: 0.1, meadow: 0.115 }[this.st] ?? 0.1);
    if (biome.bridge) this._bridgeSetup(minH);
    this.group = new THREE2.Group();
    this.tiles = /* @__PURE__ */ new Map();
    this.col = { h: 0, top: 0, smooth: 0, d: 0, s: 0, kind: 0, sideTop: 0, sub: 0, deep: 0, fluid: 0, raw: 0, band: 0 };
    this.pathTiles = biome.path.map((n) => A2[n]);
    this.treeGrid = { desert: 8, jungle: 4, taiga: 5, nether: 7, arctic: 6, shore: 7, plains: 7, darkforest: 5, cherry: 6, peaks: 6, ocean: 5, badlands: 9, meadow: 8 }[this.st];
    const t = this.track;
    this.start = { x: t.X[0], z: t.Z[0], tx: t.TX[0], tz: t.TZ[0] };
    this.cliff = { desert: A2.desert_stone, jungle: A2.stone, taiga: A2.stone, nether: A2.netherrack, arctic: A2.stone, shore: A2.stone, plains: A2.stone, darkforest: A2.stone, cherry: A2.stone, peaks: A2.stone, ocean: A2.stone, badlands: A2.tc_orange, meadow: A2.stone }[this.st];
    this.treeCache = /* @__PURE__ */ new Map();
    this.structGrid = { desert: 230, jungle: 210, taiga: 250, nether: 190, arctic: 200, shore: 90, plains: 240, darkforest: 200, cherry: 220, peaks: 240, ocean: 120, badlands: 220, meadow: 260 }[this.st];
    this.structCache = /* @__PURE__ */ new Map();
    this.inflight = /* @__PURE__ */ new Set();
    this.voxTreeMaxS = 2;
    this.want = null;
    this.pool = null;
  }
  // Riviera: a precomputed field of 'distance inland from the sea' (negative at sea), 8 m grid
  _coastSetup(B) {
    const poly = B.sea, G3 = 8, x0 = -1700, z0 = -1900, W = 450, H = 560;
    const inside = (x, z) => {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, zi] = poly[i], [xj, zj] = poly[j];
        if (zi > z !== zj > z && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
      }
      return c;
    };
    const f = new Float32Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = x0 + i * G3, z = z0 + j * G3;
      let d = 1e9;
      for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
        const [ax, az] = poly[b], [bx, bz] = poly[a], sx = bx - ax, sz = bz - az, l = sx * sx + sz * sz;
        const t = clamp(((x - ax) * sx + (z - az) * sz) / l, 0, 1);
        d = Math.min(d, Math.hypot(ax + sx * t - x, az + sz * t - z));
      }
      f[j * W + i] = inside(x, z) ? -d : d;
    }
    this.coastF = { f, G: G3, x0, z0, W, H };
  }
  inland(x, z) {
    const c = this.coastF, fx = clamp((x - c.x0) / c.G, 0, c.W - 1.001), fz = clamp((z - c.z0) / c.G, 0, c.H - 1.001);
    const i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j, f = c.f, W = c.W;
    return lerp(lerp(f[j * W + i], f[j * W + i + 1], tx), lerp(f[(j + 1) * W + i], f[(j + 1) * W + i + 1], tx), tz);
  }
  inTunnel(s) {
    const T = this.B.tunnel;
    return !!T && s >= T[0] && s <= T[1];
  }
  // figure-8: find where the lap crosses itself, lift the second pass onto a bridge
  _bridgeSetup(minH) {
    const t = this.track, N = t.N;
    let best = 1e18, ia = 0, ib = 0;
    for (let i = 0; i < N; i += 4) for (let j = i + 300; j < N; j += 4) {
      if (N - (j - i) < 300) continue;
      const d = (t.X[i] - t.X[j]) ** 2 + (t.Z[i] - t.Z[j]) ** 2;
      if (d < best) {
        best = d;
        ia = i;
        ib = j;
      }
    }
    for (let k = -4; k <= 4; k++) for (let m = -4; m <= 4; m++) {
      const i = (ia + k + N) % N, j = (ib + m + N) % N, d = (t.X[i] - t.X[j]) ** 2 + (t.Z[i] - t.Z[j]) ** 2;
      if (d < best) {
        best = d;
        ia = i;
        ib = j;
      }
    }
    t.setCrossing(ia, ib, this.hw + 7);
    const need = t.H[ia] + 10.5 - t.H[ib];
    if (need > 0) {
      let down = Math.min(need * 0.4, Math.max(0, t.H[ia] - minH - 0.5)), up = need - down;
      const bump = (i0, amp) => {
        const W = Math.max(140, 28 * amp);
        for (let k = -Math.ceil(W); k <= Math.ceil(W); k++) {
          const i = (i0 + k + N) % N;
          t.H[i] += amp * 0.5 * (1 + Math.cos(Math.PI * k / W));
        }
      };
      bump(ib, up);
      if (down > 0) bump(ia, -down);
    }
  }
  // deck of the bridge: stone slab over the lower road, with low parapets
  buildBridge(ox, oz, size, put) {
    const t = this.track, c = t.cross, A2 = this.A;
    if (ox > c.x + 60 || ox + size < c.x - 60 || oz > c.z + 60 || oz + size < c.z - 60) return;
    for (let z = oz - 1; z <= oz + size; z++) for (let x = ox - 1; x <= ox + size; x++) {
      if (Math.abs(x - c.x) > 60 || Math.abs(z - c.z) > 60) continue;
      const a = t._nearWin(x + 0.5, z + 0.5, c.iLow, t.qa), ad = a.d;
      if (ad > c.R + 1.5) continue;
      const b = t._nearWin(x + 0.5, z + 0.5, c.iUp, t.qb);
      if (b.d > this.hw + 1.4) continue;
      const y = Math.round(b.h) - 1, ends = smoothstep(c.R - 8, c.R + 1.5, ad), r = hash2(x, z, 74);
      put(x, y, z, b.d > this.hw + 0.4 ? A2.grass : A2.stone);
      const th = 2 + Math.round(ends * 5 + r);
      for (let k = 1; k <= th; k++) put(x, y - k, z, hash2(x, z + k, 75) < 0.25 ? A2.mossycobble : A2.stone);
    }
  }
  structAt(gx, gz) {
    const k = gx + "," + gz;
    if (this.structCache.has(k)) return this.structCache.get(k);
    const st = pickStructure(this, gx, gz);
    if (st) {
      st.vox = buildStructure(this, st);
      st.ground = /* @__PURE__ */ new Map();
    }
    this.structCache.set(k, st);
    return st;
  }
  structsNear(x0, z0, x1, z1) {
    const G3 = this.structGrid, out = [];
    for (let gx = Math.floor((x0 - 130) / G3); gx <= Math.floor((x1 + 130) / G3); gx++)
      for (let gz = Math.floor((z0 - 130) / G3); gz <= Math.floor((z1 + 130) / G3); gz++) {
        const st = this.structAt(gx, gz);
        if (st) out.push(st);
      }
    return out;
  }
  netherRegion(x, z) {
    const v = this.noise3.fbm(x / 420 + 9, z / 420 - 4, 3);
    if (v > 0.22) return "crimson";
    if (v < -0.25) return "warped";
    const s2 = this.noise2.n2(x / 34, z / 34);
    if (s2 > 0.45) return "soul";
    if (s2 < -0.5) return "basalt";
    return "rack";
  }
  // ---- raw terrain (absolute block height). d = distance to track centreline
  terrainRaw(x, z, d) {
    const n = this.noise, n2 = this.noise2, n3 = this.noise3, B = this.B, b = B.base;
    const away = smoothstep(28, 210, d);
    const wx = x + 55 * n3.n2(x / 340 + 7.1, z / 340 - 3.3), wz = z + 55 * n3.n2(x / 340 - 11.7, z / 340 + 5.9);
    let h;
    switch (this.st) {
      case "taiga": {
        const hills = 42 * n.fbm(wx / 520, wz / 520, 4) + 16 * n.fbm(wx / 170, wz / 170, 3) + 4 * n.fbm(wx / 40, wz / 40, 2);
        const mask = smoothstep(-0.55, 0.15, n2.fbm(x / 1500 + 3, z / 1500, 3));
        const mount = 190 * Math.pow(n.ridge(wx / 600, wz / 600, 5), 2.1) * mask * (0.15 + 0.85 * away);
        h = b + hills + mount;
        const rv = Math.abs(n2.n2(wx / 900, wz / 900));
        const river = (1 - smoothstep(0.02, 0.07, rv)) * (0.3 + 0.7 * away);
        h = lerp(h, this.water - 4, river * smoothstep(this.water - 6, this.water + 30, h));
        break;
      }
      case "jungle": {
        const hills = 34 * n.fbm(wx / 380, wz / 380, 4) + 14 * n.fbm(wx / 120, wz / 120, 3) + 4 * n.fbm(wx / 40, wz / 40, 2);
        const kmask = smoothstep(0, 0.45, n2.fbm(x / 800, z / 800, 2));
        const karst = 85 * Math.pow(n.ridge(wx / 170, wz / 170, 3), 4) * kmask * (0.2 + 0.8 * away);
        h = b + hills + karst;
        const rv = Math.abs(n2.n2(wx / 700, wz / 700));
        const river = 1 - smoothstep(0.03, 0.09, rv);
        h = lerp(h, this.water - 5, river * 0.95);
        break;
      }
      case "desert": {
        const dunes = 18 * Math.pow(n.ridge(wx / 80, wz / 200, 3), 1.5) + 22 * n.fbm(wx / 600, wz / 600, 3) + 6 * n.fbm(wx / 160, wz / 160, 2);
        const m = n2.fbm(x / 650, z / 650, 4);
        let mesa = smoothstep(0.12, 0.2, m) * (34 + 22 * n.fbm(x / 170, z / 170, 2));
        mesa = Math.floor(mesa / 6) * 6 + smoothstep(0, 1, mesa % 6 / 6) * 0;
        h = b + dunes + mesa * (0.1 + 0.9 * away);
        break;
      }
      case "arctic": {
        const land = b + 4 + 14 * n.fbm(wx / 300, wz / 300, 4) + 4 * n.fbm(wx / 60, wz / 60, 2);
        const lake = b - 9 + 3 * n.fbm(wx / 90, wz / 90, 3);
        const island = 1 - smoothstep(70, 210, d + 60 * n2.n2(x / 300, z / 300));
        const mask = smoothstep(-0.1, 0.4, n2.fbm(x / 1300, z / 1300, 3));
        const mount = 170 * Math.pow(n.ridge(wx / 520, wz / 520, 5), 2.5) * mask * smoothstep(260, 620, d);
        h = lerp(lake, land, island) + mount;
        break;
      }
      case "shore": {
        const di = this.inland(x, z) + 14 * n3.n2(x / 90, z / 90);
        if (di < 0) {
          h = this.water - 3 - Math.min(9, -di * 0.06) - 2.5 * n.fbm(x / 30, z / 30, 2);
          break;
        }
        const slope = 2.5 + 64 * smoothstep(0, 360, di) + 10 * n.fbm(wx / 160, wz / 160, 3);
        const hills = 120 * Math.pow(smoothstep(500, 1900, di), 1.3) * (0.4 + 0.6 * n.ridge(wx / 380, wz / 380, 4));
        h = this.water + slope + hills;
        const R = B.rock, ed = Math.min(x - R[0], R[2] - x, z - R[1], R[3] - z) + 18 * n2.n2(x / 60, z / 60);
        if (ed > 0) h = Math.max(h, this.water + 4 + 52 * smoothstep(0, 22, ed) + 3 * n.fbm(x / 40, z / 40, 2));
        break;
      }
      case "darkforest": {
        h = b + 4 * n.fbm(wx / 520, wz / 520, 3) + 2 * n.fbm(wx / 120, wz / 120, 2) + 30 * Math.pow(n.ridge(wx / 900, wz / 900, 3), 2.5) * smoothstep(300, 800, d);
        const pond = smoothstep(0.42, 0.55, n2.fbm(x / 160, z / 160, 2)) * smoothstep(40, 90, d);
        h = lerp(h, this.water - 3, pond);
        break;
      }
      case "cherry": {
        const hills = 24 * n.fbm(wx / 420, wz / 420, 4) + 9 * n.fbm(wx / 130, wz / 130, 3);
        const mask = smoothstep(-0.4, 0.2, n2.fbm(x / 1300, z / 1300, 3));
        const mount = 150 * Math.pow(n.ridge(wx / 560, wz / 560, 5), 2.2) * mask * (0.1 + 0.9 * away);
        h = b + hills + mount;
        const rv = Math.abs(n2.n2(wx / 800, wz / 800));
        h = lerp(h, this.water - 3, (1 - smoothstep(0.02, 0.06, rv)) * smoothstep(50, 120, d));
        break;
      }
      case "peaks": {
        const plat = b + 5 * n.fbm(wx / 400, wz / 400, 3) + 3 * n.fbm(wx / 110, wz / 110, 2);
        const big = 300 * Math.pow(n.ridge(wx / 420, wz / 420, 5), 1.9) * smoothstep(70, 420, d);
        const jag = 90 * Math.pow(n.ridge(wx / 150, wz / 150, 3), 3) * smoothstep(60, 240, d);
        h = plat + big + jag;
        break;
      }
      case "ocean": {
        const rip = 1.2 * Math.pow(n.ridge(x / 14, z / 34, 2), 2);
        const reef = 14 * Math.pow(Math.max(0, n2.fbm(wx / 110, wz / 110, 3)), 1.5) * (0.3 + 0.7 * away);
        const rv = Math.abs(n3.n2(wx / 520, wz / 520));
        const ravine = (1 - smoothstep(0.02, 0.07, rv)) * 26 * smoothstep(40, 120, d);
        h = b + 6 * n.fbm(wx / 300, wz / 300, 3) + 3 * n.fbm(wx / 70, wz / 70, 2) + rip + reef - ravine + 60 * Math.pow(n.ridge(wx / 700, wz / 700, 4), 3) * smoothstep(250, 700, d);
        break;
      }
      case "badlands": {
        const flats = b + 3 * n.fbm(wx / 300, wz / 300, 3);
        const m = n2.fbm(x / 520, z / 520, 4);
        let mesa = smoothstep(0.05, 0.13, m) * (34 + 26 * n.fbm(x / 190, z / 190, 2));
        mesa = Math.floor(mesa / 5) * 5;
        const ero = smoothstep(-0.05, -0.25, m) * smoothstep(30, 90, d);
        const sp = Math.max(0, n3.n2(x / 11, z / 11) - 0.5) / 0.5;
        const spire = ero * Math.floor(Math.pow(sp, 0.55) * 42 / 3) * 3;
        h = flats + mesa * (0.15 + 0.85 * away) + spire;
        break;
      }
      case "meadow": {
        const hills = 30 * n.fbm(wx / 460, wz / 460, 4) + 12 * n.fbm(wx / 150, wz / 150, 3);
        const mask = smoothstep(-0.55, 0.15, n2.fbm(x / 1500 + 3, z / 1500, 3));
        const mount = 200 * Math.pow(n.ridge(wx / 600, wz / 600, 5), 2.1) * mask * (0.12 + 0.88 * away);
        h = b + hills + mount;
        break;
      }
      case "plains": {
        const roll = 7 * n.fbm(wx / 650, wz / 650, 3) + 3 * n.fbm(wx / 180, wz / 180, 2);
        const ridge = 60 * Math.pow(n.ridge(wx / 900, wz / 900, 4), 2.4) * smoothstep(380, 900, d);
        h = b + roll + ridge;
        const rv = Math.abs(n2.n2(wx / 1100, wz / 1100));
        h = lerp(h, this.water - 3, (1 - smoothstep(0.015, 0.05, rv)) * smoothstep(60, 140, d));
        break;
      }
      case "nether": {
        const hills = 40 * n.fbm(wx / 420, wz / 420, 4) + 16 * n.fbm(wx / 130, wz / 130, 3) + 6 * n.fbm(wx / 45, wz / 45, 2);
        const peaks = 95 * Math.pow(n.ridge(wx / 260, wz / 260, 4), 3) * (0.2 + 0.8 * away);
        const sea = smoothstep(-0.1, 0.3, n2.fbm(x / 520, z / 520, 3)) * away;
        h = b + hills + peaks - sea * 48;
        break;
      }
    }
    return h + this.detail(x, z, d);
  }
  // small-scale relief (hummocks, knolls, drifts) that starts right past the verge
  detail(x, z, d) {
    if (d < 12) return 0;
    const n = this.noise, n3 = this.noise3, m = smoothstep(12, 24, d);
    const knoll = Math.max(0, this.noise2.fbm(x / 47 + 5, z / 47 - 2, 2) - 0.18);
    switch (this.st) {
      case "taiga":
        return m * (3.2 * n3.fbm(x / 24, z / 24, 3) + 1.2 * n.n2(x / 7.5, z / 7.5) + 16 * knoll);
      case "jungle":
        return m * (3.8 * n3.fbm(x / 20, z / 20, 3) + 1.4 * n.n2(x / 6.5, z / 6.5) + 20 * knoll);
      case "desert":
        return m * (3.5 * Math.pow(n.ridge(x / 16, z / 34, 2), 2) + 1.2 * n3.fbm(x / 22, z / 22, 2) + 9 * knoll);
      case "arctic":
        return m * (2.6 * n3.fbm(x / 18, z / 30, 3) + 0.8 * n.n2(x / 6, z / 6) + 12 * knoll);
      case "nether":
        return m * (4.2 * n3.fbm(x / 16, z / 16, 3) + 1.8 * n.n2(x / 5.5, z / 5.5) + 18 * knoll);
      case "shore":
        return this.inland(x, z) < 6 ? 0 : m * (1.6 * n3.fbm(x / 20, z / 20, 2) + 9 * knoll);
      case "darkforest":
        return m * (1.4 * n3.fbm(x / 22, z / 22, 2) + 0.6 * n.n2(x / 7, z / 7) + 6 * knoll);
      case "cherry":
        return m * (2.2 * n3.fbm(x / 22, z / 22, 3) + 0.8 * n.n2(x / 7, z / 7) + 11 * knoll);
      case "peaks":
        return m * (3 * n3.fbm(x / 18, z / 18, 3) + 1.2 * n.n2(x / 6, z / 6) + 14 * knoll);
      case "ocean":
        return m * (1 * n3.fbm(x / 16, z / 16, 2) + 5 * knoll);
      case "badlands":
        return m * (0.8 * n3.fbm(x / 24, z / 24, 2) + 3 * knoll);
      case "meadow":
        return m * (2.6 * n3.fbm(x / 24, z / 24, 3) + 0.9 * n.n2(x / 7.5, z / 7.5) + 13 * knoll);
      case "plains":
        return m * (1 * n3.fbm(x / 26, z / 26, 2) + 0.4 * n.n2(x / 8, z / 8) + 3 * knoll);
    }
    return 0;
  }
  // half width of the smooth verge: varies along the track so the edge never looks ruled
  runoff(x, z) {
    if (this.st === "shore") return this.hw + 1.2;
    return this.hw + 1.6 + 3.4 * (0.5 + 0.5 * this.noise3.n2(x / 41 + 3.7, z / 41 - 8.1));
  }
  column(x, z) {
    const c = this.col, A2 = this.A, B = this.B;
    const q = this.track.near(x + 0.5, z + 0.5, false);
    c.d = q.d;
    c.s = q.s;
    c.fluid = 0;
    c.band = 0;
    const R = q.d < 60 ? this.runoff(x + 0.5, z + 0.5) : this.hw + 4;
    if (q.d < R) {
      c.smooth = 1;
      c.h = q.h;
      c.raw = q.h;
      if (q.d < this.hw) {
        c.kind = 1;
        c.top = this.pathTile(x, z, q);
        c.sideTop = c.top;
        c.sub = this.st === "nether" ? A2.nether_brick : A2.stone_brick;
        c.deep = c.sub;
      } else {
        c.kind = 2;
        this.surfaceTiles(c, Math.floor(c.h), x, z, false);
      }
      return c;
    }
    c.smooth = 0;
    c.kind = 0;
    const qh = q.h, qd = q.d;
    const tr = this.terrainRaw(x, z, qd);
    let H;
    if (qd > 1e8) H = Math.round(tr);
    else {
      const delta = tr - qh;
      const t = smoothstep(R - 0.5, R + 3.5 + 0.5 * Math.abs(delta), qd);
      H = Math.round(lerp(qh, tr, t));
    }
    c.raw = H;
    if (B.ice && H < this.water) {
      c.h = this.water;
      c.top = A2.ice;
      c.sideTop = A2.packed_ice;
      c.sub = A2.packed_ice;
      c.deep = A2.stone;
      return c;
    }
    c.h = H;
    this.surfaceTiles(c, H, x, z, false);
    if (H < this.water && !this.under) c.fluid = 1;
    else if (H < this.lava) c.fluid = 2;
    return c;
  }
  pathTile(x, z, q) {
    const A2 = this.A;
    const t = this.track, sx = x + 0.5 - this.start.x, sz = z + 0.5 - this.start.z;
    const along = sx * this.start.tx + sz * this.start.tz;
    if (false) {
    }
    const p = this.pathTiles;
    const r = hash2(x, z, 5), r2 = this.noise2.n2(x / 9, z / 9);
    if (r2 > 0.4) return p[1 % p.length];
    if (r2 < -0.5) return p[2 % p.length];
    return p[Math.floor(r * r * p.length)];
  }
  surfaceTiles(c, H, x, z) {
    const A2 = this.A, B = this.B, b = B.base;
    if (c.kind === 0 && H >= this.water + 1) {
      const core = this.noise2.fbm(x / 47 + 5, z / 47 - 2, 2);
      const pv = this.noise3.n2(x / 13 + 40, z / 13 - 7), r = hash2(x, z, 61);
      if (core > 0.36 + 0.05 * pv) {
        const k = this.st;
        if (k === "taiga" || k === "jungle") {
          c.top = r < 0.45 ? A2.mossycobble : r < 0.8 ? A2.stone : A2.cobble;
          c.sideTop = A2.stone;
          c.sub = A2.stone;
          c.deep = A2.stone;
          return;
        }
        if (k === "desert" && H <= b + 20) {
          c.top = r < 0.7 ? A2.desert_stone : A2.desert_sandstone;
          c.sideTop = A2.desert_stone;
          c.sub = A2.desert_stone;
          c.deep = A2.desert_stone;
          return;
        }
        if (k === "arctic" && r < 0.55) {
          c.top = A2.stone;
          c.sideTop = A2.stone;
          c.sub = A2.stone;
          c.deep = A2.stone;
          return;
        }
      }
      if (this.st === "taiga" && H < b + 48) {
        if (pv > 0.42) {
          c.top = A2.coniferous_litter;
          c.sideTop = A2.coniferous_litter_side;
          c.sub = A2.dirt;
          c.deep = A2.stone;
          return;
        }
        if (pv < -0.62) {
          c.top = r < 0.6 ? A2.gravel : A2.dirt;
          c.sideTop = A2.dirt;
          c.sub = A2.dirt;
          c.deep = A2.stone;
          return;
        }
        if (Math.abs(pv) < 0.025) {
          c.top = A2.dirt;
          c.sideTop = A2.dirt;
          c.sub = A2.dirt;
          c.deep = A2.stone;
          return;
        }
      }
      if (this.st === "jungle" && H < b + 48) {
        if (pv < -0.6) {
          c.top = A2.dirt;
          c.sideTop = A2.dirt;
          c.sub = A2.dirt;
          c.deep = A2.stone;
          return;
        }
        if (pv > 0.6) {
          c.top = A2.mossycobble;
          c.sideTop = A2.mossycobble;
          c.sub = A2.dirt;
          c.deep = A2.stone;
          return;
        }
      }
      if (this.st === "desert" && H <= b + 20) {
        if (pv > 0.55) {
          c.top = A2.desert_sandstone;
          c.sideTop = A2.desert_sandstone;
          c.sub = A2.desert_sandstone;
          c.deep = A2.desert_stone;
          return;
        }
        if (pv < -0.6) {
          c.top = A2.sand;
          c.sideTop = A2.sand;
          c.sub = A2.sand;
          c.deep = A2.sandstone;
          return;
        }
      }
      if (this.st === "arctic" && pv < -0.62 && r < 0.6) {
        c.top = A2.gravel;
        c.sideTop = A2.gravel;
        c.sub = A2.permafrost;
        c.deep = A2.stone;
        return;
      }
    }
    switch (this.st) {
      case "desert":
        if (H > b + 20) {
          c.top = A2.red_sand;
          c.sideTop = A2.tc_orange;
          c.sub = A2.tc_orange;
          c.deep = A2.tc_red;
          c.band = 1;
        } else if (H < this.water + 2 && c.kind !== 2) {
          c.top = H < this.water + 1 ? A2.sand : A2.grass;
          c.sideTop = H < this.water + 1 ? A2.sand : A2.grass_side;
          c.sub = A2.sand;
          c.deep = A2.sandstone;
        } else {
          c.top = c.kind === 2 ? A2.sand : A2.desert_sand;
          c.sideTop = c.top;
          c.sub = c.top;
          c.deep = A2.desert_sandstone;
        }
        break;
      case "jungle":
        if (H < this.water + 1) {
          c.top = A2.clay;
          c.sideTop = A2.clay;
          c.sub = A2.dirt;
          c.deep = A2.stone;
          break;
        }
        if (H > b + 48) {
          c.top = A2.stone;
          c.sideTop = A2.mossycobble;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        if (c.kind === 2 || this.noise2.n2(x / 14, z / 14) > 0.2) {
          c.top = A2.grass;
          c.sideTop = A2.grass_side;
        } else {
          c.top = A2.litter;
          c.sideTop = A2.litter_side;
        }
        c.sub = A2.dirt;
        c.deep = A2.stone;
        break;
      case "taiga": {
        const j = 5 * this.noise2.n2(x / 22, z / 22);
        if (H < this.water + 1) {
          c.top = A2.sand;
          c.sideTop = A2.sand;
          c.sub = A2.sand;
          c.deep = A2.stone;
          break;
        }
        if (H > b + 95 + j) {
          c.top = A2.snow;
          c.sideTop = A2.snow_side;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        if (H > b + 70 + j) {
          c.top = A2.stone;
          c.sideTop = A2.stone;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        if (H > b + 48 + j) {
          c.top = A2.coniferous_litter;
          c.sideTop = A2.coniferous_litter_side;
          c.sub = A2.dirt;
          c.deep = A2.stone;
          break;
        }
        c.top = A2.grass;
        c.sideTop = A2.grass_side;
        c.sub = A2.dirt;
        c.deep = A2.stone;
        break;
      }
      case "nether": {
        const reg = this.netherRegion(x, z);
        c.sub = A2.netherrack;
        c.deep = A2.netherrack;
        c.sideTop = A2.netherrack;
        if (reg === "crimson") c.top = A2.crimson_nylium;
        else if (reg === "warped") c.top = A2.warped_nylium;
        else if (reg === "soul") {
          c.top = A2.nether_sand;
          c.sideTop = A2.soul_soil;
          c.sub = A2.soul_soil;
        } else if (reg === "basalt") {
          c.top = A2.basalt_top;
          c.sideTop = A2.basalt;
          c.sub = A2.basalt;
        } else c.top = A2.netherrack;
        break;
      }
      case "shore": {
        const di = this.inland(x, z), r = hash2(x, z, 63);
        if (H < this.water) {
          const reef = this.noise2.n2(x / 34, z / 34) + 0.3 * this.noise3.n2(x / 9, z / 9);
          if (reef > 0.25 && H > this.water - 9) {
            const cs = [A2.coral_pink, A2.coral_yellow, A2.coral_blue, A2.coral_purple];
            c.top = cs[Math.floor(hash2(Math.floor(x / 3), Math.floor(z / 3), 64) * 4)];
            c.sideTop = c.top;
            c.sub = A2.sand;
            c.deep = A2.stone;
            break;
          }
          c.top = H < this.water - 8 ? A2.gravel : A2.sand;
          c.sideTop = c.top;
          c.sub = A2.sand;
          c.deep = A2.stone;
          break;
        }
        if (di < 22 && H < this.water + 5) {
          c.top = r < 0.45 ? A2.stone : r < 0.7 ? A2.gravel : A2.sand;
          c.sideTop = A2.stone;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        if (H > this.water + 150) {
          c.top = H > this.water + 260 ? A2.snow : A2.stone;
          c.sideTop = c.top === A2.snow ? A2.snow_side : A2.stone;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        if (this.noise2.n2(x / 21, z / 21) > 0.42) {
          c.top = r < 0.7 ? A2.stone : A2.gravel;
          c.sideTop = A2.stone;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        c.top = A2.grass;
        c.sideTop = A2.grass_side;
        c.sub = A2.dirt;
        c.deep = A2.stone;
        break;
      }
      case "darkforest": {
        if (H < this.water + 1) {
          c.top = A2.dirt;
          c.sideTop = A2.dirt;
          c.sub = A2.dirt;
          c.deep = A2.stone;
          break;
        }
        const pv = this.noise3.n2(x / 17 + 3, z / 17 - 9);
        if (pv > 0.35) {
          c.top = A2.coniferous_litter;
          c.sideTop = A2.coniferous_litter_side;
        } else if (pv < -0.55) {
          c.top = A2.moss;
          c.sideTop = A2.moss;
        } else {
          c.top = A2.grass;
          c.sideTop = A2.grass_side;
        }
        c.sub = A2.dirt;
        c.deep = A2.stone;
        break;
      }
      case "cherry":
      case "meadow": {
        const j = 5 * this.noise2.n2(x / 22, z / 22);
        if (H < this.water + 1) {
          c.top = A2.sand;
          c.sideTop = A2.sand;
          c.sub = A2.sand;
          c.deep = A2.stone;
          break;
        }
        if (H > b + 110 + j) {
          c.top = A2.snow;
          c.sideTop = A2.snow_side;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        if (H > b + 80 + j) {
          c.top = A2.stone;
          c.sideTop = A2.stone;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        c.top = A2.grass;
        c.sideTop = A2.grass_side;
        c.sub = A2.dirt;
        c.deep = A2.stone;
        break;
      }
      case "peaks": {
        const j = 6 * this.noise2.n2(x / 18, z / 18), r = hash2(x, z, 65);
        if (H < this.water + 1) {
          c.top = A2.gravel;
          c.sideTop = A2.gravel;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        if (H > b + 170 + j) {
          c.top = r < 0.6 ? A2.packed_ice : A2.snow;
          c.sideTop = A2.packed_ice;
          c.sub = A2.packed_ice;
          c.deep = A2.stone;
          break;
        }
        if (H > b + 55 + j) {
          c.top = A2.snow;
          c.sideTop = A2.snow_side;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        if (H > b + 22 + j) {
          c.top = r < 0.2 ? A2.gravel : A2.stone;
          c.sideTop = A2.stone;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        c.top = A2.grass;
        c.sideTop = A2.grass_side;
        c.sub = A2.dirt;
        c.deep = A2.stone;
        break;
      }
      case "ocean": {
        const reef = this.noise2.fbm(x / 110, z / 110, 3), r = hash2(x, z, 66);
        if (reef > 0.12 && this.noise3.n2(x / 7, z / 7) > -0.3) {
          const cs = [A2.coral_pink, A2.coral_yellow, A2.coral_blue, A2.coral_purple];
          c.top = cs[Math.floor(hash2(Math.floor(x / 4), Math.floor(z / 4), 67) * 4)];
          c.sideTop = c.top;
          c.sub = A2.sand;
          c.deep = A2.stone;
          break;
        }
        const pv = this.noise3.n2(x / 23 + 5, z / 23);
        c.top = pv > 0.45 ? A2.gravel : pv < -0.6 ? A2.clay : r < 0.04 ? A2.silver_sand : A2.sand;
        c.sideTop = c.top === A2.clay ? A2.clay : A2.sand;
        c.sub = A2.sand;
        c.deep = A2.stone;
        break;
      }
      case "badlands": {
        if (H < this.water + 1) {
          c.top = A2.red_sand;
          c.sideTop = A2.red_sand;
          c.sub = A2.red_sand;
          c.deep = A2.tc_orange;
          break;
        }
        if (H > b + 6) {
          const wooded = H > b + 26 && this.noise3.n2(x / 60, z / 60) > 0.1;
          c.top = wooded ? hash2(x, z, 68) < 0.6 ? A2.dry_dirt : A2.grass : A2.red_sand;
          c.sideTop = A2.tc_orange;
          c.sub = A2.tc_orange;
          c.deep = A2.tc_red;
          c.band = 1;
          break;
        }
        c.top = A2.red_sand;
        c.sideTop = A2.red_sand;
        c.sub = A2.red_sand;
        c.deep = A2.tc_orange;
        break;
      }
      case "plains": {
        if (H < this.water + 1) {
          c.top = A2.sand;
          c.sideTop = A2.sand;
          c.sub = A2.dirt;
          c.deep = A2.stone;
          break;
        }
        const pv = this.noise3.n2(x / 30 + 11, z / 30 - 4);
        if (c.kind === 0 && pv > 0.62) {
          c.top = A2.dirt;
          c.sideTop = A2.dirt;
          c.sub = A2.dirt;
          c.deep = A2.stone;
          break;
        }
        c.top = A2.grass;
        c.sideTop = A2.grass_side;
        c.sub = A2.dirt;
        c.deep = A2.stone;
        break;
      }
      case "arctic":
        if (H > b + 45 + 4 * this.noise2.n2(x / 14, z / 14) && this.noise2.n2(x / 7, z / 7) > 0.1) {
          c.top = A2.stone;
          c.sideTop = A2.stone;
          c.sub = A2.stone;
          c.deep = A2.stone;
          break;
        }
        c.top = A2.snow;
        c.sideTop = A2.snow_side;
        c.sub = A2.permafrost;
        c.deep = A2.stone;
        break;
    }
  }
  // ---- trees (deterministic per grid cell)
  treeAtCell(cx, cz) {
    const key = cx * 100003 + cz;
    const cached = this.treeCache.get(key);
    if (cached !== void 0) return cached;
    const t = this._treeAtCell(cx, cz);
    if (this.treeCache.size > 6e4) this.treeCache.clear();
    this.treeCache.set(key, t);
    return t;
  }
  _treeAtCell(cx, cz) {
    const G3 = this.treeGrid, seed = this.B.seed, k = this.st, A2 = this.A;
    const x = cx * G3 + Math.floor(hash2(cx, cz, seed + 1) * G3);
    const z = cz * G3 + Math.floor(hash2(cx, cz, seed + 2) * G3);
    const fn = this.noise3.fbm(x / 260, z / 260, 2);
    let dens;
    switch (k) {
      case "taiga":
        dens = 0.3 + 0.6 * smoothstep(-0.3, 0.25, fn);
        break;
      case "jungle":
        dens = 0.55 + 0.4 * smoothstep(-0.3, 0.3, fn);
        break;
      case "desert":
        dens = 0.16;
        break;
      case "arctic":
        dens = 0.1 + 0.5 * smoothstep(-0.2, 0.35, fn);
        break;
      case "nether": {
        const reg = this.netherRegion(x, z);
        dens = reg === "crimson" || reg === "warped" ? 0.7 : 0.28;
        break;
      }
      case "shore":
        dens = this.inland(x, z) < 12 ? 0 : 0.12 + 0.3 * smoothstep(-0.2, 0.35, fn);
        break;
      case "plains":
        dens = 0.05 + 0.4 * smoothstep(0.15, 0.5, fn);
        break;
      case "darkforest":
        dens = 0.62 + 0.36 * smoothstep(-0.4, 0.2, fn);
        break;
      case "cherry":
        dens = 0.3 + 0.45 * smoothstep(-0.3, 0.3, fn);
        break;
      case "peaks":
        dens = 0.12 + 0.4 * smoothstep(-0.2, 0.3, fn);
        break;
      case "ocean":
        dens = 0.2 + 0.4 * smoothstep(0, 0.4, this.noise2.fbm(x / 110, z / 110, 3));
        break;
      case "badlands":
        dens = 0.14;
        break;
      case "meadow":
        dens = 0.04 + 0.22 * smoothstep(0.2, 0.55, fn);
        break;
    }
    if (hash2(cx, cz, seed) > dens) return null;
    if (k === "plains") return this._buildingCell(cx, cz, x, z);
    const c = this.column(x, z);
    if (c.d < this.hw + (k === "darkforest" ? 5 : 7) + 4 * hash2(cx, cz, seed + 6) || c.fluid || c.smooth) return null;
    const rr = hash2(cx, cz, seed + 3), b = this.B.base;
    let type = null;
    if (k === "taiga") {
      if (c.top === A2.snow || c.top === A2.stone || c.top === A2.sand) type = null;
      else if (c.h > b + 40 || c.top === A2.coniferous_litter) type = rr < 0.85 ? "spruce" : "bush";
      else type = rr < 0.35 ? "oak" : rr < 0.6 ? "birch" : rr < 0.82 ? "spruce" : rr < 0.92 ? "bigoak" : "bush";
    } else if (k === "jungle") {
      if (c.top === A2.stone || c.top === A2.clay) type = null;
      else type = rr < 0.22 ? "giant" : rr < 0.55 ? "jungle" : rr < 0.9 ? "bush" : "oak";
    } else if (k === "desert") type = c.band ? null : c.h < this.water + 4 ? rr < 0.75 ? "palm" : null : rr < 0.82 ? "cactus" : rr < 0.9 ? "acacia" : "deadbush";
    else if (k === "arctic") type = c.top === A2.ice ? rr < 0.04 ? "spike" : null : c.top === A2.stone ? null : rr < 0.9 ? "spruce" : "spike";
    else if (k === "nether") {
      const reg = this.netherRegion(x, z);
      if (reg === "crimson") type = rr < 0.8 ? "crimson" : "glow";
      else if (reg === "warped") type = rr < 0.8 ? "warped" : "glow";
      else if (reg === "basalt") type = rr < 0.7 ? "pillar" : null;
      else if (reg === "soul") type = rr < 0.3 ? "spire" : null;
      else type = rr < 0.35 ? "pillar" : rr < 0.7 ? "spire" : "glow";
    } else if (k === "shore") type = c.top !== A2.grass ? null : rr < 0.55 ? "oak" : rr < 0.75 ? "birch" : "bush";
    else if (k === "darkforest") type = c.top === A2.dirt ? null : rr < 0.72 ? "darkoak" : rr < 0.8 ? "redmush" : rr < 0.86 ? "brownmush" : rr < 0.94 ? "oak" : "bush";
    else if (k === "cherry") type = c.top !== A2.grass ? null : rr < 0.82 ? "cherry" : rr < 0.92 ? "cbush" : "oak";
    else if (k === "peaks") type = c.top === A2.snow || c.top === A2.packed_ice ? rr < 0.12 ? "spike" : null : c.top === A2.grass ? rr < 0.9 ? "spruce" : "bush" : rr < 0.25 ? "spruce" : null;
    else if (k === "ocean") type = rr < 0.75 ? "coral" : "pillar_p";
    else if (k === "badlands") type = c.top === A2.grass || c.top === A2.dry_dirt ? rr < 0.7 ? "oak" : "deadbush" : c.band ? null : rr < 0.55 ? "cactus" : "deadbush";
    else if (k === "meadow") type = c.top !== A2.grass ? null : rr < 0.45 ? "oak" : rr < 0.75 ? "birch" : "bush";
    if (!type) return null;
    return { type, x, z, y: c.h, r: hash2(cx, cz, seed + 4), h2: hash2(cx, cz, seed + 5) };
  }
  // Riviera: apartment blocks and villas on a 12 m grid (plus palms); plains: oaks, birches, farmhouses
  _buildingCell(cx, cz, x, z) {
    const G3 = this.treeGrid, seed = this.B.seed, A2 = this.A, coast = this.st === "shore";
    const rr = hash2(cx, cz, seed + 3), r = hash2(cx, cz, seed + 4), h2 = hash2(cx, cz, seed + 5);
    const q = this.track.near(x + 0.5, z + 0.5, false);
    if (coast) {
      const di = this.inland(x, z);
      const city = di < 700 && q.d < 520;
      const house = di > 30 && (city ? rr < 0.82 : rr < 0.2);
      if (house) {
        const hs = 2 + Math.floor(r * (G3 / 2 - 3)), mx = cx * G3 + Math.floor(G3 / 2), mz = cz * G3 + Math.floor(G3 / 2);
        const qc = this.track.near(mx + 0.5, mz + 0.5, false);
        if (qc.d < this.runoff(mx, mz) + hs * 1.45 + 2.5) return null;
        let y = 1e9, yMax = -1e9;
        for (const [ax, az] of [[-hs, -hs], [hs, -hs], [-hs, hs], [hs, hs], [0, 0]]) {
          const cc = this.column(mx + ax, mz + az);
          if (cc.fluid || cc.smooth) return null;
          y = Math.min(y, cc.h);
          yMax = Math.max(yMax, cc.h);
        }
        if (yMax - y > 9) return null;
        const tall = (city ? 6 + Math.floor(Math.pow(h2, 1.6) * 26) : 4 + Math.floor(h2 * 4)) + (qc.d < 60 ? 0 : 2);
        return { type: "house", x: mx, z: mz, y, hs, tall, r, h2, base: yMax - y };
      }
      if (rr < 0.92 && di > 10) {
        const c2 = this.column(x, z);
        if (c2.fluid || c2.smooth || c2.d < this.runoff(x, z) + 2) return null;
        return { type: q.d < 260 || r < 0.6 ? "palm" : "oak", x, z, y: c2.h, r, h2 };
      }
      return null;
    }
    const c = this.column(x, z);
    if (c.d < this.hw + 9 + 4 * hash2(cx, cz, seed + 6) || c.fluid || c.smooth) return null;
    const type = rr < 0.4 ? "oak" : rr < 0.55 ? "bigoak" : rr < 0.75 ? "birch" : "bush";
    return { type, x, z, y: c.h, r, h2 };
  }
  buildTree(t, put) {
    const A2 = this.A, { x, y, z } = t, r = t.r;
    const blob = (cx, cy, cz, rx, ry, tile, keep = 0.8) => {
      const R = Math.ceil(Math.max(rx, ry));
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) for (let dz = -R; dz <= R; dz++) {
        const d = (dx * dx + dz * dz) / (rx * rx) + dy * dy / (ry * ry);
        if (d > 1.05) continue;
        if (d > 0.62 && hash2(cx + dx * 7 + dy * 3, cz + dz * 13 + dy * 31, 9) > keep) continue;
        put(cx + dx, cy + dy, cz + dz, tile, true);
      }
    };
    switch (t.type) {
      case "oak": {
        const h = 5 + Math.floor(r * 3);
        for (let i = 0; i < h; i++) put(x, y + i, z, A2.tree);
        blob(x, y + h - 1, z, 2.7, 2.2, A2.leaves, 0.7);
        break;
      }
      case "bigoak": {
        const h = 8 + Math.floor(r * 4);
        for (let i = 0; i < h; i++) put(x, y + i, z, A2.tree);
        const br = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (let k = 0; k < 4; k++) {
          const [bx, bz] = br[k], by = y + h - 4 + (k & 1);
          for (let s = 1; s <= 3; s++) put(x + bx * s, by + (s >> 1), z + bz * s, A2.tree);
          blob(x + bx * 3, by + 2, z + bz * 3, 2.6, 1.8, A2.leaves, 0.7);
        }
        blob(x, y + h, z, 3.4, 2.6, A2.leaves, 0.7);
        break;
      }
      case "birch": {
        const h = 6 + Math.floor(r * 4);
        for (let i = 0; i < h; i++) put(x, y + i, z, A2.aspen);
        blob(x, y + h - 1, z, 2.2, 2.6, A2.aspen_leaves, 0.75);
        break;
      }
      case "spruce": {
        const h = 9 + Math.floor(r * 10), snow = this.st === "arctic" || y > this.B.base + 60;
        for (let i = 0; i < h; i++) put(x, y + i, z, A2.pine);
        for (let ly = 3; ly <= h + 1; ly++) {
          const f = (h + 1 - ly) / (h - 2);
          const lr = ly === h + 1 ? 0 : Math.max(0, Math.round(f * 3.4 + (ly & 1 ? -0.4 : 0.5)));
          for (let dx = -lr; dx <= lr; dx++) for (let dz = -lr; dz <= lr; dz++) {
            if (dx * dx + dz * dz > lr * lr + 0.6) continue;
            if (!(dx === 0 && dz === 0 && ly < h)) put(x + dx, y + ly, z + dz, A2.pine_needles, true);
            if (snow && ly & 1 && dx * dx + dz * dz > (lr - 1) * (lr - 1) && lr > 0) put(x + dx, y + ly + 1, z + dz, A2.snow, false, true);
          }
        }
        if (snow) put(x, y + h + 2, z, A2.snow, false, true);
        break;
      }
      case "giant": {
        const h = 20 + Math.floor(r * 10);
        for (let i = 0; i < h; i++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) put(x + a, y + i, z + b, A2.jungletree);
        blob(x, y + h, z, 5.5, 2.4, A2.jungleleaves, 0.7);
        for (let k = 0; k < 14; k++) {
          const a = k * 0.45 + t.h2 * 6, vx = x + Math.round(Math.cos(a) * 5), vz = z + Math.round(Math.sin(a) * 5);
          const len = 3 + Math.floor(hash2(vx, vz, 5) * 9);
          for (let i = 1; i <= len; i++) put(vx, y + h - 1 - i, vz, A2.vine, true);
        }
        for (let k = 0; k < 3; k++) {
          const ang = t.h2 * 6.28 + k * 2.1, by = y + Math.floor(h * (0.5 + 0.12 * k));
          const bx = Math.round(Math.cos(ang) * 4), bz = Math.round(Math.sin(ang) * 4);
          for (let s = 1; s <= 4; s++) put(x + Math.round(bx * s / 4), by + (s >> 1), z + Math.round(bz * s / 4), A2.jungletree);
          blob(x + bx, by + 3, z + bz, 3, 1.6, A2.jungleleaves, 0.7);
        }
        break;
      }
      case "jungle": {
        const h = 9 + Math.floor(r * 8);
        for (let i = 0; i < h; i++) put(x, y + i, z, A2.jungletree);
        blob(x, y + h, z, 3.3, 1.8, A2.jungleleaves, 0.7);
        for (let k = 0; k < 6; k++) {
          const a = k * 1.05 + t.h2 * 6, vx = x + Math.round(Math.cos(a) * 3), vz = z + Math.round(Math.sin(a) * 3);
          const len = 2 + Math.floor(hash2(vx, vz, 5) * 6);
          for (let i = 1; i <= len; i++) put(vx, y + h - 1 - i, vz, A2.vine, true);
        }
        break;
      }
      case "bush": {
        const tile = this.st === "jungle" ? A2.jungleleaves : A2.leaves;
        put(x, y, z, this.st === "jungle" ? A2.jungletree : A2.tree);
        blob(x, y + 1, z, 2.2, 1.4, tile, 0.6);
        break;
      }
      case "house": {
        const hs = t.hs, H = t.tall, y0 = t.y - 2;
        const walls = [A2.tc_white, A2.sandstone_block, A2.tc_yellow, A2.wool_white, A2.tc_orange, A2.tc_white, A2.tc_lgray];
        const wall = walls[Math.floor(t.h2 * 977) % walls.length];
        const flat = H > 10 || t.r < 0.35;
        for (let dy = 0; dy <= H + 2 + t.base; dy++) {
          const yy = y0 + dy, lvl = dy - 2 - t.base;
          for (let dx = -hs; dx <= hs; dx++) for (let dz = -hs; dz <= hs; dz++) {
            const edge = Math.abs(dx) === hs || Math.abs(dz) === hs;
            if (!edge && dy !== 0) continue;
            const corner = Math.abs(dx) === hs && Math.abs(dz) === hs;
            const win = lvl > 0 && lvl % 3 === 1 && !corner && (dx + dz & 1) === 0;
            put(x + dx, yy, z + dz, lvl < 1 ? A2.stone_block : win ? A2.glass : wall);
          }
        }
        const top = y0 + H + 3 + t.base;
        if (flat) {
          for (let dx = -hs; dx <= hs; dx++) for (let dz = -hs; dz <= hs; dz++) {
            put(x + dx, top, z + dz, A2.stone_block);
            if (Math.abs(dx) === hs || Math.abs(dz) === hs) put(x + dx, top + 1, z + dz, wall);
          }
        } else {
          for (let l = 0; l <= hs; l++) for (let dx = -hs - 1 + l; dx <= hs + 1 - l; dx++) for (let dz = -hs - 1 + l; dz <= hs + 1 - l; dz++) {
            if (Math.max(Math.abs(dx), Math.abs(dz)) === hs + 1 - l) put(x + dx, top + l, z + dz, l === hs ? A2.tc_red : A2.brick);
          }
        }
        break;
      }
      case "farmhouse": {
        const hs = t.hs, y0 = t.y;
        for (let dy = 0; dy <= 3; dy++) for (let dx = -hs; dx <= hs; dx++) for (let dz = -hs; dz <= hs; dz++) {
          const edge = Math.abs(dx) === hs || Math.abs(dz) === hs;
          if (!edge && dy) continue;
          const corner = Math.abs(dx) === hs && Math.abs(dz) === hs;
          put(x + dx, y0 + dy, z + dz, dy === 0 ? A2.cobble : corner ? A2.tree : dy === 2 && !corner && (dx + dz) % 2 === 0 ? A2.glass : A2.planks);
        }
        for (let l = 0; l <= hs + 1; l++) for (let dx = -hs - 1; dx <= hs + 1; dx++) {
          put(x + dx, y0 + 4 + l, z - hs - 1 + l, A2.pine_planks);
          put(x + dx, y0 + 4 + l, z + hs + 1 - l, A2.pine_planks);
          if (l <= hs) {
            for (let dz = -hs + l; dz <= hs - l; dz++) if (dx === -hs - 1 || dx === hs + 1) put(x + dx, y0 + 4 + l, z + dz, A2.planks);
          }
        }
        break;
      }
      case "darkoak": {
        const h = 6 + Math.floor(r * 4);
        for (let i = 0; i < h; i++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) put(x + a, y + i, z + b, A2.darkoak);
        blob(x, y + h, z, 4.6 + r, 1.8, A2.darkoak_leaves, 0.72);
        blob(x, y + h + 2, z, 3.2, 1.4, A2.darkoak_leaves, 0.7);
        break;
      }
      case "redmush": {
        const h = 5 + Math.floor(r * 4);
        for (let i = 0; i < h; i++) put(x, y + i, z, A2.mush_stem);
        for (let dy = -2; dy <= 1; dy++) for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) {
          const rad = dy === 1 ? 2 : 3, e = Math.max(Math.abs(dx), Math.abs(dz));
          if (e > rad || dy < 1 && e < rad || dy === 1 && e === rad && Math.abs(dx) === Math.abs(dz)) continue;
          if (Math.abs(dx) === 3 && Math.abs(dz) === 3) continue;
          put(x + dx, y + h + dy, z + dz, A2.mush_red);
        }
        break;
      }
      case "brownmush": {
        const h = 5 + Math.floor(r * 4);
        for (let i = 0; i < h; i++) put(x, y + i, z, A2.mush_stem);
        for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) if (!(Math.abs(dx) === 4 && Math.abs(dz) >= 3) && !(Math.abs(dz) === 4 && Math.abs(dx) >= 3)) put(x + dx, y + h, z + dz, A2.mush_brown);
        break;
      }
      case "cherry": {
        const h = 4 + Math.floor(r * 2);
        for (let i = 0; i < h; i++) put(x, y + i, z, A2.cherry_log);
        const ang = t.h2 * 6.28;
        for (const sgn of [1, -1]) {
          const ax = Math.round(Math.cos(ang) * sgn), az = Math.round(Math.sin(ang) * sgn);
          let bx = x, bz = z, by = y + h - 1;
          for (let k = 1; k <= 3; k++) {
            bx += ax;
            bz += az;
            by += 1;
            put(bx, by, bz, A2.cherry_log);
          }
          const ry = sgn > 0 ? 2.4 : 2;
          blob(bx, by + 2, bz, 3.6 + r * 0.8, ry, A2.cherry_leaves, 0.75);
          for (let k = 0; k < 7; k++) {
            const a2 = k * 0.9 + t.h2 * 5, hx = bx + Math.round(Math.cos(a2) * 3), hz = bz + Math.round(Math.sin(a2) * 3);
            const len = 1 + Math.floor(hash2(hx, hz, 12) * 3);
            for (let i = 0; i < len; i++) put(hx, by - i, hz, A2.cherry_leaves, true);
          }
        }
        break;
      }
      case "cbush": {
        put(x, y, z, A2.cherry_log);
        blob(x, y + 1, z, 2.2, 1.4, A2.cherry_leaves, 0.6);
        break;
      }
      case "coral": {
        const cs = [A2.coral_pink, A2.coral_yellow, A2.coral_blue, A2.coral_purple], c1 = cs[Math.floor(r * 4)], c2 = cs[Math.floor(t.h2 * 4)];
        blob(x, y, z, 1.6 + r * 1.4, 1.3, c1, 0.8);
        for (let k = 0; k < 4; k++) {
          const a2 = k * 1.57 + t.h2 * 3, len = 2 + Math.floor(hash2(x + k, z, 13) * 4);
          let px = x + Math.round(Math.cos(a2) * 1.5), pz = z + Math.round(Math.sin(a2) * 1.5);
          for (let i = 0; i < len; i++) {
            put(px, y + 1 + i, pz, k & 1 ? c2 : c1);
            if (i === len - 2) {
              px += Math.round(Math.cos(a2));
              pz += Math.round(Math.sin(a2));
            }
          }
        }
        break;
      }
      case "pillar_p": {
        const h = 3 + Math.floor(r * r * 14);
        for (let i = 0; i < h; i++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) put(x + a, y + i, z + b, hash2(x + a, y + i, z + b) < 0.35 ? A2.mossycobble : A2.stone);
        break;
      }
      case "cactus": {
        const h = 2 + Math.floor(r * 3);
        for (let i = 0; i < h; i++) put(x, y + i, z, A2.cactus);
        break;
      }
      case "deadbush":
        put(x, y, z, A2.acacia);
        break;
      case "palm": {
        const h = 6 + Math.floor(r * 4), lx = t.h2 < 0.5 ? 1 : -1;
        let px = x;
        for (let i = 0; i < h; i++) {
          if (i === Math.floor(h * 0.6)) px += lx;
          put(px, y + i, z, A2.jungletree);
        }
        const ty = y + h;
        put(px, ty, z, A2.leaves, true);
        for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
          const len = ax && az ? 2 : 3;
          for (let s2 = 1; s2 <= len; s2++) put(px + ax * s2, ty - (s2 === len ? 1 : 0), z + az * s2, A2.leaves, true);
        }
        break;
      }
      case "acacia": {
        const h = 5 + Math.floor(r * 2), dx = t.h2 < 0.5 ? 1 : -1;
        for (let i = 0; i < h; i++) put(x + (i > 2 ? dx : 0), y + i, z, A2.acacia);
        for (let ex = -3; ex <= 3; ex++) for (let ez = -3; ez <= 3; ez++) if (ex * ex + ez * ez <= 10) put(x + dx + ex, y + h, z + ez, A2.acacia_leaves, true);
        for (let ex = -1; ex <= 1; ex++) for (let ez = -1; ez <= 1; ez++) put(x + dx + ex, y + h + 1, z + ez, A2.acacia_leaves, true);
        break;
      }
      case "spike": {
        const h = 8 + Math.floor(r * r * 26);
        for (let i = 0; i < h; i++) {
          const w = i < h * 0.3 ? 1 : 0;
          for (let a = -w; a <= w; a++) for (let b = -w; b <= w; b++) if (Math.abs(a) + Math.abs(b) <= w) put(x + a, y + i, z + b, A2.packed_ice);
        }
        break;
      }
      case "pillar": {
        const h = 4 + Math.floor(r * r * 22), w = r > 0.55 ? 2 : 1;
        for (let i = 0; i < h; i++) for (let a = 0; a < w; a++) for (let b = 0; b < w; b++) put(x + a, y + i, z + b, i === h - 1 ? A2.basalt_top : A2.basalt);
        if (t.h2 < 0.4) blob(x, y + h, z, 1.6, 1.2, A2.glowstone, 0.8);
        break;
      }
      case "spire": {
        const h = 10 + Math.floor(r * r * 30);
        for (let i = 0; i < h; i++) {
          const w = Math.max(0, Math.round((1 - i / h) * 2.4));
          for (let a = -w; a <= w; a++) for (let b = -w; b <= w; b++) if (a * a + b * b <= w * w + 0.5) put(x + a, y + i, z + b, A2.netherrack);
        }
        break;
      }
      case "glow":
        blob(x, y + 1, z, 1.5, 1.2, A2.glowstone, 0.8);
        break;
      case "crimson":
      case "warped": {
        const cr = t.type === "crimson";
        const h = 5 + Math.floor(r * 9), stem = cr ? A2.crimson_stem : A2.warped_stem, wart = cr ? A2.wart : A2.warped_wart;
        for (let i = 0; i < h; i++) put(x, y + i, z, stem);
        const R = 2.4 + r * 1.6;
        for (let dy = -2; dy <= 1; dy++) for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) {
          const rr2 = dx * dx + dz * dz, rad = R * (dy === 1 ? 0.6 : 1);
          if (rr2 > rad * rad) continue;
          if (dy < 0 && rr2 < (rad - 1.2) * (rad - 1.2)) continue;
          put(x + dx, y + h + dy, z + dz, hash2(x + dx * 3, z + dz * 5 + dy, 3) < 0.12 ? A2.shroomlight : wart);
        }
        if (cr) for (let k = 0; k < 6; k++) {
          const a = k * 1.05 + t.h2 * 6, vx = x + Math.round(Math.cos(a) * (R - 0.8)), vz = z + Math.round(Math.sin(a) * (R - 0.8));
          const len = 2 + Math.floor(hash2(vx, vz, 8) * 5);
          for (let i = 1; i <= len; i++) put(vx, y + h - 2 - i, vz, A2.wart, true);
        }
        break;
      }
    }
  }
  // simplified far-LOD silhouette for a tree
  treeProxy(t) {
    const A2 = this.A, r = t.r;
    switch (t.type) {
      case "oak":
        return { y0: 3, y1: 7 + r * 2, rad: 2.5, tile: A2.leaves_o, trunk: A2.tree };
      case "bigoak":
        return { y0: 5, y1: 12 + r * 4, rad: 4.5, tile: A2.leaves_o, trunk: A2.tree };
      case "birch":
        return { y0: 4, y1: 9 + r * 4, rad: 2, tile: A2.aspen_leaves_o, trunk: A2.aspen };
      case "spruce":
        return { y0: 2, y1: 10 + r * 10, rad: 2.2, tile: A2.pine_needles_o, trunk: A2.pine, cone: true };
      case "giant":
        return { y0: 14, y1: 24 + r * 10, rad: 5.5, tile: A2.jungleleaves_o, trunk: A2.jungletree };
      case "jungle":
        return { y0: 7, y1: 11 + r * 8, rad: 3, tile: A2.jungleleaves_o, trunk: A2.jungletree };
      case "bush":
        return { y0: 0, y1: 2.5, rad: 2, tile: this.st === "jungle" ? A2.jungleleaves_o : A2.leaves_o };
      case "acacia":
        return { y0: 5, y1: 7, rad: 3.2, tile: A2.acacia_leaves_o, trunk: A2.acacia };
      case "cactus":
        return { y0: 0, y1: 2 + r * 3, rad: 0.5, tile: A2.cactus };
      case "darkoak":
        return { y0: 5, y1: 10 + r * 4, rad: 4.8, tile: A2.darkoak_leaves_o, trunk: A2.darkoak };
      case "redmush":
        return { y0: 5 + r * 4 - 2, y1: 5 + r * 4 + 2, rad: 3, tile: A2.mush_red, trunk: A2.mush_stem };
      case "brownmush":
        return { y0: 5 + r * 4, y1: 6 + r * 4, rad: 4, tile: A2.mush_brown, trunk: A2.mush_stem };
      case "cherry":
        return { y0: 4, y1: 10 + r * 2, rad: 4.4, tile: A2.cherry_leaves_o, trunk: A2.cherry_log };
      case "cbush":
        return { y0: 0, y1: 2.5, rad: 2, tile: A2.cherry_leaves_o };
      case "coral":
        return { y0: 0, y1: 3 + r * 3, rad: 2, tile: A2.coral_pink };
      case "pillar_p":
        return { y0: 0, y1: 3 + r * r * 14, rad: 1, tile: A2.stone };
      case "house":
        return { y0: -2, y1: t.tall + 3 + t.base, rad: t.hs + 0.5, tile: A2.tc_white, solid: true };
      case "farmhouse":
        return { y0: 0, y1: 5, rad: t.hs + 0.5, tile: A2.planks, solid: true };
      case "palm":
        return { y0: 5, y1: 7 + r * 4, rad: 2.5, tile: A2.leaves_o, trunk: A2.jungletree };
      case "spike":
        return { y0: 0, y1: 8 + r * r * 26, rad: 1, tile: A2.packed_ice };
      case "pillar":
        return { y0: 0, y1: 4 + r * r * 22, rad: r > 0.55 ? 1 : 0.5, tile: A2.basalt };
      case "spire":
        return { y0: 0, y1: 10 + r * r * 30, rad: 1.8, tile: A2.netherrack, cone: true };
      case "glow":
        return { y0: 0, y1: 2.5, rad: 1.4, tile: A2.glowstone };
      case "crimson":
        return { y0: 5 + r * 9 - 2, y1: 5 + r * 9 + 1.5, rad: 2.6 + r * 1.6, tile: A2.wart, trunk: A2.crimson_stem };
      case "warped":
        return { y0: 5 + r * 9 - 2, y1: 5 + r * 9 + 1.5, rad: 2.6 + r * 1.6, tile: A2.warped_wart, trunk: A2.warped_stem };
    }
    return null;
  }
  // ---- small decor: boulders, fallen logs, shrubs (own grid, can sit close to the verge)
  decorAtCell(cx, cz) {
    const key = "d" + (cx * 100003 + cz);
    const cached = this.treeCache.get(key);
    if (cached !== void 0) return cached;
    const t = this._decorAtCell(cx, cz);
    this.treeCache.set(key, t);
    return t;
  }
  _decorAtCell(cx, cz) {
    const G3 = DECOR_G, seed = this.B.seed + 500, k = this.st, A2 = this.A;
    const x = cx * G3 + 1 + Math.floor(hash2(cx, cz, seed + 1) * (G3 - 2));
    const z = cz * G3 + 1 + Math.floor(hash2(cx, cz, seed + 2) * (G3 - 2));
    const dens = { taiga: 0.2, jungle: 0.26, desert: 0.09, arctic: 0.12, nether: 0.14, shore: 0.14, plains: 0.1, darkforest: 0.22, cherry: 0.14, peaks: 0.16, ocean: 0.16, badlands: 0.1, meadow: 0.12 }[k];
    const q = this.track.near(x + 0.5, z + 0.5, false);
    const nearB = q.d < 70 ? 1.6 : 1;
    if (hash2(cx, cz, seed) > dens * nearB) return null;
    if (q.d < this.runoff(x + 0.5, z + 0.5) + 1.5 + 3 * hash2(cx, cz, seed + 7)) return null;
    const c = this.column(x, z);
    if (c.fluid || c.smooth || c.top === A2.ice) return null;
    const rr = hash2(cx, cz, seed + 3), r = hash2(cx, cz, seed + 4);
    let type;
    if (k === "taiga") type = rr < 0.42 ? "rock" : rr < 0.62 ? "log" : rr < 0.9 ? "shrub" : "berry";
    else if (k === "jungle") type = rr < 0.3 ? "rock" : rr < 0.48 ? "log" : "shrub";
    else if (k === "desert") type = rr < 0.75 ? "rock" : "bones";
    else if (k === "arctic") type = rr < 0.7 ? "rock" : "drift";
    else if (k === "shore") type = rr < 0.65 ? "rock" : "shrub";
    else if (k === "darkforest") type = rr < 0.3 ? "rock" : rr < 0.55 ? "log" : "shrub";
    else if (k === "cherry") type = rr < 0.35 ? "rock" : rr < 0.55 ? "log" : "shrub";
    else if (k === "peaks") type = c.top === A2.snow ? "drift" : "rock";
    else if (k === "ocean") type = "rock";
    else if (k === "badlands") type = rr < 0.8 ? "rock" : "bones";
    else if (k === "meadow") type = rr < 0.45 ? "rock" : rr < 0.6 ? "log" : "shrub";
    else if (k === "plains") type = rr < 0.3 ? "rock" : rr < 0.8 ? "shrub" : "log";
    else type = rr < 0.6 ? "rock" : "magma";
    const len = 4 + Math.floor(r * 4), dir = hash2(cx, cz, seed + 5) < 0.5 ? 0 : 1, h0 = c.h;
    if (type === "log") {
      for (let i = 1; i < len; i++) {
        const cc = this.column(x + (dir ? 0 : i), z + (dir ? i : 0));
        if (cc.h !== h0 || cc.smooth || cc.fluid) {
          type = "shrub";
          break;
        }
      }
    }
    const rad = type === "rock" ? 1 + Math.floor(r * 2.6) : 1;
    const top = type === "rock" ? rad + 1 : type === "log" ? 1 : type === "shrub" || type === "berry" ? 2 : 1;
    return { type, x, z, y: h0, r, rad, top, dir, len };
  }
  decorAt(ix, iz) {
    const G3 = DECOR_G;
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const t = this.decorAtCell(Math.floor(ix / G3) + dx, Math.floor(iz / G3) + dz);
      if (!t || t.type === "shrub" || t.type === "berry" || t.type === "drift") continue;
      if (t.type === "hay") {
        if (ix >= t.x && ix <= t.x + 1 && iz >= t.z && iz <= t.z + 1) return t;
        continue;
      }
      if (t.type === "log") {
        const ax = t.dir ? 0 : 1, az = t.dir;
        const along = ax ? ix - t.x : iz - t.z, side = ax ? iz - t.z : ix - t.x;
        if (side === 0 && along >= 0 && along < t.len) return t;
        continue;
      }
      const ddx = ix - t.x, ddz = iz - t.z;
      if (ddx * ddx + ddz * ddz <= t.rad * t.rad + 0.5) return t;
    }
    return null;
  }
  buildDecor(t, put) {
    const A2 = this.A, { x, y, z, r } = t, k = this.st;
    const rockTiles = k === "desert" ? [A2.desert_stone, A2.desert_stone, A2.desert_sandstone] : k === "nether" ? [A2.netherrack, A2.basalt, A2.netherrack] : k === "ocean" ? [A2.stone, A2.gravel, A2.mossycobble] : k === "badlands" ? [A2.tc_orange, A2.tc_red, A2.tc_yellow] : k === "shore" || k === "peaks" ? [A2.stone, A2.cobble, A2.gravel] : k === "arctic" ? [A2.stone, A2.cobble, A2.stone] : k === "jungle" ? [A2.mossycobble, A2.mossycobble, A2.stone] : [A2.stone, A2.mossycobble, A2.cobble];
    switch (t.type) {
      case "rock": {
        const R = t.rad;
        for (let dy = -1; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) for (let dz = -R; dz <= R; dz++) {
          const e = (dx * dx + dz * dz) / (R * R + 0.3) + dy * dy / (R * 0.8 + 0.4) ** 2;
          if (e > 1.05 || e > 0.6 && hash2(x + dx * 7, z + dz * 5 + dy * 13, 21) > 0.6) continue;
          const tile = rockTiles[Math.floor(hash2(x + dx, z + dz + dy * 9, 22) * 3)];
          put(x + dx, y + dy, z + dz, k === "arctic" && dy >= R - 1 && e < 0.7 ? A2.snow : tile);
        }
        break;
      }
      case "log": {
        const ax = t.dir ? 0 : 1, az = t.dir, wood = k === "jungle" ? A2.jungletree : k === "darkforest" ? A2.darkoak : k === "cherry" ? A2.cherry_log : r < 0.5 ? A2.tree : A2.aspen;
        for (let i = 0; i < t.len; i++) {
          put(x + ax * i, y, z + az * i, wood);
          if (k !== "jungle" && hash2(x + i, z, 23) < 0.25) put(x + ax * i, y + 1, z + az * i, A2.leaves, true);
        }
        break;
      }
      case "shrub":
      case "berry": {
        const tile = k === "jungle" ? A2.jungleleaves : k === "cherry" ? A2.cherry_leaves : k === "darkforest" ? A2.darkoak_leaves : r < 0.5 ? A2.leaves : A2.aspen_leaves;
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let dy = 0; dy <= 1; dy++) {
          if (dy === 1 && (dx || dz) && hash2(x + dx, z + dz, 24) < 0.6) continue;
          if (dy === 0 && dx && dz && hash2(x + dx, z + dz, 25) < 0.5) continue;
          put(x + dx, y + dy, z + dz, tile, true);
        }
        break;
      }
      case "hay":
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) put(x + i, y + (i && j ? 1 : 0), z + j, A2.dry_grass);
        break;
      case "bones":
        for (let i = 0; i < 3; i++) put(x + (t.dir ? i : 0), y, z + (t.dir ? 0 : i), A2.silver_sand);
        break;
      case "drift":
        for (let dx = -1; dx <= 1; dx++) for (let dz = -2; dz <= 2; dz++) if (Math.abs(dx) + Math.abs(dz) < 3) put(x + dx, y, z + dz, A2.snow);
        break;
      case "magma":
        put(x, y, z, A2.glowstone);
        put(x + 1, y, z, A2.basalt);
        put(x, y, z + 1, A2.basalt_top);
        break;
    }
  }
  // Stony Shore: the sea cave the road runs through (natural rock only)
  buildStreet(ox, oz, size, put) {
    const A2 = this.A, n = this.noise3;
    for (let z = oz - 1; z <= oz + size; z++) for (let x = ox - 1; x <= ox + size; x++) {
      const q = this.track.near(x + 0.5, z + 0.5, false);
      const R = this.runoff(x, z);
      if (q.d > R + 6) continue;
      const tun = this.inTunnel(q.s), s = q.s, h = q.h, rr = hash2(x, z, 71);
      if (tun) {
        const yb = Math.round(h) + 8 + Math.round(1.6 * n.n2(x / 7, z / 7) + (q.d / (R + 6)) ** 2 * -3);
        const rock = (y) => hash2(x * 3 + y, z * 5 - y, 72) < 0.18 ? A2.cobble : hash2(x, z * 7 + y, 73) < 0.12 ? A2.gravel : A2.stone;
        if (q.d >= R) for (let y = Math.floor(h) - 1; y <= yb + 2; y++) put(x, y, z, rock(y));
        put(x, yb, z, rock(yb));
        for (let y = yb + 1; y <= yb + 3 + Math.floor(rr * 2); y++) put(x, y, z, rock(y));
        if (rr > 0.6 && q.d > 2) put(x, yb + 4, z, A2.grass);
        continue;
      }
    }
  }
  trunkAt(ix, iz) {
    const G3 = this.treeGrid;
    const cx = Math.floor(ix / G3), cz = Math.floor(iz / G3);
    const t = this.treeAtCell(cx, cz);
    if (!t || t.type === "bush" || t.type === "glow") return null;
    if (t.hs) return Math.abs(ix - t.x) <= t.hs && Math.abs(iz - t.z) <= t.hs ? t : null;
    const w = t.type === "giant" || t.type === "darkoak" || t.type === "pillar_p" ? 2 : t.type === "pillar" && t.r > 0.55 ? 2 : t.type === "spire" || t.type === "spike" || t.type === "coral" ? 2 : 1;
    const o = t.type === "spire" || t.type === "spike" || t.type === "coral" ? -1 : 0;
    if (ix >= t.x + o && ix < t.x + o + w + (o ? 1 : 0) && iz >= t.z + o && iz < t.z + o + w + (o ? 1 : 0)) return t;
    return null;
  }
  // ---- physics queries
  surface(x, z, out) {
    const q = this.track.near(x, z);
    out.d = q.d;
    out.s = q.s;
    out.lat = q.lat;
    if (q.d < this.flat && q.d < this.runoff(x, z)) {
      out.y = q.h;
      out.path = q.d < this.hw;
      out.fluid = 0;
      out.smooth = true;
      out.grip = out.path ? 1 : Math.max(0.84, this.B.offGrip);
      out.drag = out.path ? 0 : this.B.offDrag * 0.3;
      return out;
    }
    const c = this.column(Math.floor(x), Math.floor(z));
    out.y = c.h;
    out.path = false;
    out.fluid = c.fluid;
    out.smooth = !!c.smooth;
    const A2 = this.A;
    let g = this.B.offGrip, dr = this.B.offDrag;
    if (c.top === A2.ice) {
      g = 0.22;
      dr = 0.05;
    } else if (c.top === A2.stone || c.top === A2.basalt_top) {
      g = 0.8;
      dr = 0.15;
    } else if (c.top === A2.nether_sand) {
      g = 0.5;
      dr = 1.4;
    }
    out.grip = g;
    out.drag = dr;
    return out;
  }
  obstacle(x, z, y) {
    const ix = Math.floor(x), iz = Math.floor(z);
    const q = this.track.near(x, z);
    if (q.d < this.flat && q.d < this.runoff(x, z)) return null;
    if (this.st === "shore" && this.inTunnel(q.s) && q.d < this.runoff(x, z) + 6) return q.h + 2;
    const c = this.column(ix, iz);
    if (c.h > y + 1.1) return c.h;
    const dc = this.decorAt(ix, iz);
    if (dc && y + 0.5 > dc.y && y < dc.y + dc.top) return dc.y + dc.top;
    const G3 = this.structGrid;
    const st = this.structAt(Math.floor(x / G3), Math.floor(z / G3));
    if (st) {
      const dx = ix - st.x, dz = iz - st.z, iy = Math.floor(y + 0.4) - st.y;
      if (st.vox.has(vkey(dx, iy, dz)) || st.vox.has(vkey(dx, iy + 1, dz))) return y + 1;
    }
    const t = this.trunkAt(ix, iz);
    if (t) {
      const top = t.type === "cactus" ? t.y + 2 + Math.floor(t.r * 3) : t.hs ? t.y + t.tall + 6 + (t.base || 0) : t.y + 40;
      if (y + 0.5 > t.y && y < top) return top;
    }
    return null;
  }
  // ---------------------------------------------------------------- quadtree tiles
  // size levels: S=1 (32 m), 2 (64 m), 4 (128 m), 8 (256 m), 16 (512 m)
  // (px,pz): where the car will be shortly; tiles there get fine detail and are built first
  // ahead: points along the track the car is about to drive ([[x,z], ...]); land near them gets
  // full detail early, so blocks and trees are built before the car gets there
  update(cx, cz, budgetMs, range, detail = 1, ahead = null) {
    const want = /* @__PURE__ */ new Map();
    const path = [[cx, cz], ...ahead || []];
    this.want = want;
    const ROOT = 512;
    const r0x = Math.floor((cx - range) / ROOT), r1x = Math.floor((cx + range) / ROOT);
    const r0z = Math.floor((cz - range) / ROOT), r1z = Math.floor((cz + range) / ROOT);
    const visit = (ox, oz, size) => {
      const mx = ox + size / 2, mz = oz + size / 2;
      const dx = Math.max(0, Math.abs(cx - mx) - size / 2), dz = Math.max(0, Math.abs(cz - mz) - size / 2);
      const dist = Math.hypot(dx, dz);
      if (dist > range) return;
      let dp = dist;
      for (let k = 0; k + 1 < path.length; k++) {
        const ax = path[k][0], az = path[k][1], sx = path[k + 1][0] - ax, sz = path[k + 1][1] - az, sl = sx * sx + sz * sz;
        const tt = sl > 1 ? clamp(((mx - ax) * sx + (mz - az) * sz) / sl, 0, 1) : 0;
        const ex = Math.max(0, Math.abs(ax + sx * tt - mx) - size / 2), ez = Math.max(0, Math.abs(az + sz * tt - mz) - size / 2);
        dp = Math.min(dp, Math.hypot(ex, ez));
      }
      const dl = Math.min(dist, dp * 1.5);
      const S = size / TILE_N;
      const tq = this.track.near(mx, mz, false), tdist = tq.d > 1e8 ? 1e9 : Math.max(0, tq.d - size * 0.71);
      const nearTrack = this.noCorridor || tdist < size * 2.2 + 40;
      if (S > 1 && dl < size * 0.9 * detail && nearTrack) {
        const h = size / 2;
        visit(ox, oz, h);
        visit(ox + h, oz, h);
        visit(ox, oz + h, h);
        visit(ox + h, oz + h, h);
        return;
      }
      want.set(ox + "," + oz + "," + S, { ox, oz, S, dist: Math.min(dist, dp) + S * 6 });
    };
    for (let i = r0x; i <= r1x; i++) for (let j = r0z; j <= r1z; j++) visit(i * ROOT, j * ROOT, ROOT);
    const todo = [];
    for (const [k, w] of want) if (!this.tiles.has(k)) todo.push([k, w]);
    todo.sort((a, b) => a[1].dist - b[1].dist);
    let pending;
    if (this.pool && this.pool.ok) {
      for (const [k, w] of todo) {
        if (this.inflight.has(k)) continue;
        if (!this.pool.request(this, k, w.ox, w.oz, w.S)) break;
        this.inflight.add(k);
      }
      pending = todo.length;
    } else {
      const t0 = performance.now();
      let built = 0;
      for (const [k, w] of todo) {
        if (built > 0 && performance.now() - t0 > budgetMs) break;
        this.tiles.set(k, this.buildTile(w.ox, w.oz, w.S));
        built++;
      }
      pending = todo.length - built;
    }
    for (const [k, tile] of this.tiles) {
      if (want.has(k)) continue;
      const [ox, oz, S] = k.split(",").map(Number);
      const size = S * TILE_N;
      let covered = true;
      for (const [k2, w] of want) {
        if (this.tiles.has(k2)) continue;
        if (w.ox < ox + size && w.ox + w.S * TILE_N > ox && w.oz < oz + size && w.oz + w.S * TILE_N > oz) {
          covered = false;
          break;
        }
      }
      if (covered) {
        this.disposeTile(tile);
        this.tiles.delete(k);
      }
    }
    return pending;
  }
  disposeTile(t) {
    for (const m of t.meshes) {
      this.group.remove(m);
      m.geometry.dispose();
    }
  }
  // a tile finished on a background builder
  receive(k, ox, oz, S, parts) {
    this.inflight.delete(k);
    if (this.tiles.has(k) || !this.want || !this.want.has(k)) return;
    this.tiles.set(k, this.meshesFrom(parts, ox, oz, S));
  }
  buildTile(ox, oz, S) {
    return this.meshesFrom(this.buildTileData(ox, oz, S), ox, oz, S);
  }
  meshesFrom(parts, ox, oz, S) {
    const meshes = [];
    for (const p of parts) {
      const m = new THREE2.Mesh(GeoBuilder.toGeometry(p.a), this.mats[p.kind]);
      m.position.set(ox, 0, oz);
      m.castShadow = p.cast;
      m.receiveShadow = true;
      m.matrixAutoUpdate = false;
      m.updateMatrix();
      this.group.add(m);
      meshes.push(m);
    }
    return { meshes, S };
  }
  buildTileData(ox, oz, S) {
    const A2 = this.A, n = TILE_N, W = n + 2;
    const hg = new Float32Array(W * W), top = new Uint8Array(W * W), sideTop = new Uint8Array(W * W), sub = new Uint8Array(W * W), deep = new Uint8Array(W * W), fl = new Uint8Array(W * W), sm = new Uint8Array(W * W), band = new Uint8Array(W * W), dd = new Float32Array(W * W);
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      const c = this.column(ox + (i - 1) * S, oz + (j - 1) * S);
      const k = j * W + i;
      hg[k] = c.smooth ? c.h : c.h;
      top[k] = c.top;
      sideTop[k] = c.sideTop;
      sub[k] = c.sub;
      deep[k] = c.deep;
      fl[k] = c.fluid;
      sm[k] = c.smooth;
      band[k] = c.band;
      dd[k] = c.d;
    }
    for (let j = 1; j <= n; j++) for (let i = 1; i <= n; i++) {
      const k = j * W + i;
      if (sm[k] || top[k] === A2.ice || fl[k]) continue;
      const h = hg[k];
      const st = Math.max(Math.abs(h - hg[k - 1]), Math.abs(h - hg[k + 1]), Math.abs(h - hg[k - W]), Math.abs(h - hg[k + W])) / S;
      if (st >= 2.5 && top[k] !== A2.snow) {
        top[k] = this.cliff;
        sideTop[k] = this.cliff;
        sub[k] = this.cliff;
      }
    }
    const CW = n + 1, ch = new Float32Array(CW * CW);
    for (let j = 0; j < CW; j++) for (let i = 0; i < CW; i++) {
      const q = this.track.near(ox + i * S, oz + j * S, false);
      ch[j * CW + i] = q.d < 1e8 ? q.h : 0;
    }
    const geo = new GeoBuilder(), plants = new GeoBuilder(), water = new GeoBuilder(), lava = new GeoBuilder();
    const AO = [1, 0.78, 0.62, 0.48];
    for (let j = 1; j <= n; j++) for (let i = 1; i <= n; i++) {
      const k = j * W + i, h = hg[k];
      const x0 = (i - 1) * S, z0 = (j - 1) * S, x1 = x0 + S, z1 = z0 + S;
      const wx = ox + x0, wz = oz + z0;
      const c00 = ch[(j - 1) * CW + i - 1], c10 = ch[(j - 1) * CW + i], c11 = ch[j * CW + i], c01 = ch[j * CW + i - 1];
      if (sm[k]) geo.topH(x0, z0, x1, z1, c00, c10, c11, c01, top[k], wx, wz);
      else {
        const o = (di, dj) => hg[(j + dj) * W + i + di] > h + 0.5 ? 1 : 0;
        const ao = (s1, s2, c) => AO[s1 && s2 ? 3 : s1 + s2 + c];
        const nW = o(-1, 0), nE = o(1, 0), nN = o(0, -1), nS = o(0, 1);
        geo.top(x0, z0, x1, z1, h, top[k], ao(nW, nN, o(-1, -1)), ao(nE, nN, o(1, -1)), ao(nE, nS, o(1, 1)), ao(nW, nS, o(-1, 1)), wx, wz);
      }
      for (let dIdx = 0; dIdx < 4; dIdx++) {
        const di = dIdx === 0 ? 1 : dIdx === 1 ? -1 : 0, dj = dIdx === 2 ? 1 : dIdx === 3 ? -1 : 0;
        const kn = (j + dj) * W + i + di;
        let hn = hg[kn], hTop = h;
        if (sm[k]) {
          if (sm[kn]) continue;
          const e0 = dIdx === 0 ? c10 : dIdx === 1 ? c00 : dIdx === 2 ? c01 : c00;
          const e1 = dIdx === 0 ? c11 : dIdx === 1 ? c01 : dIdx === 2 ? c11 : c10;
          hTop = Math.min(e0, e1);
        } else if (sm[kn]) hn -= 0.4;
        const border = i + di === 0 || i + di === W - 1 || j + dj === 0 || j + dj === W - 1;
        if (border) hn = Math.min(hn, hTop) - 4;
        if (hn >= hTop - 1e-3) continue;
        const hh = hTop;
        let segs;
        if (S >= 4) segs = [[hn, hh, hh - hn <= 1.5 ? sideTop[k] : band[k] ? A2.tc_orange : sub[k]]];
        else if (band[k]) {
          segs = [[Math.max(hn, hh - 1), hh, sideTop[k]]];
          for (let y = Math.floor(hh) - 1; y >= Math.floor(hn); y -= 1) {
            const y0 = Math.max(hn, y), y1 = Math.min(hh - 1, y + 1);
            if (y1 <= y0) continue;
            const bt = [A2.tc_orange, A2.tc_white, A2.tc_red, A2.tc_yellow, A2.tc_orange, A2.tc_brown, A2.tc_lgray, A2.tc_red][(Math.floor(y / 2) % 8 + 8) % 8];
            segs.push([y0, y1, bt]);
          }
        } else segs = [[Math.max(hn, hh - 1), hh, sideTop[k]], [Math.max(hn, hh - 4), hh - 1, sub[k]], [hn, hh - 4, deep[k]]];
        for (const [y0, y1, tile] of segs) {
          if (y1 - y0 <= 1e-3) continue;
          geo.side(dIdx, x0, z0, x1, z1, y0, y1, tile, y0 <= hn + 0.01 ? 0.6 : 1, wx, wz);
        }
      }
      if (fl[k] === 1 && this.water > h) water.flat(x0, z0, x1, z1, this.water - 0.12);
      if (fl[k] === 2 && this.lava > h) lava.top(x0, z0, x1, z1, this.lava - 0.12, A2.lava, 1, 1, 1, 1, wx, wz);
      if (S === 1 && (!fl[k] || fl[k] === 1 && this.st === "shore") && !sm[k]) {
        const p = this.plantFor(wx, wz, top[k], h);
        if (p >= 0) plants.cross(x0 + 0.5, h, z0 + 0.5, p, hash2(wx, wz, 77));
        else if (p === -2) {
          const bh = 3 + Math.floor(hash2(wx, wz, 78) * 5);
          for (let i2 = 0; i2 < bh; i2++) plants.cross(x0 + 0.5, h + i2, z0 + 0.5, A2.p_papyrus, hash2(wx, wz, 77));
        } else if (p === -3) {
          const bh = 4 + Math.floor(hash2(wx, wz, 78) * 12);
          for (let i2 = 0; i2 < bh; i2++) plants.cross(x0 + 0.5, h + i2, z0 + 0.5, A2.p_kelp, hash2(wx, wz, 77));
        }
      }
      if (S === 1 && fl[k] === 1 && (this.st === "jungle" || this.st === "taiga") && hash2(wx, wz, 91) < 0.045) plants.top(x0, z0, x1, z1, this.water - 0.09, A2.waterlily, 1, 1, 1, 1, wx, wz);
    }
    const G3 = this.treeGrid, pad = 7, size = n * S;
    const c0x = Math.floor((ox - pad) / G3), c1x = Math.floor((ox + size + pad) / G3);
    const c0z = Math.floor((oz - pad) / G3), c1z = Math.floor((oz + size + pad) / G3);
    if (S <= this.voxTreeMaxS) {
      const vox = /* @__PURE__ */ new Map();
      const put = (x, y, z, tile, leaf = false, snowCap = false) => {
        const lx = x - ox, lz = z - oz;
        if (lx < -1 || lz < -1 || lx > size || lz > size || y < 0 || y > 255) return;
        const key = y << 16 | lz + 1 << 8 | lx + 1;
        const prev = vox.get(key);
        if (prev !== void 0 && !(prev & 256) && leaf) return;
        vox.set(key, tile | (leaf ? 256 : 0) | (snowCap ? 512 : 0));
      };
      for (let cz = c0z; cz <= c1z; cz++) for (let cx = c0x; cx <= c1x; cx++) {
        const t = this.treeAtCell(cx, cz);
        if (t) this.buildTree(t, put);
      }
      for (let cz = Math.floor((oz - 4) / DECOR_G); cz <= Math.floor((oz + size + 4) / DECOR_G); cz++)
        for (let cx = Math.floor((ox - 4) / DECOR_G); cx <= Math.floor((ox + size + 4) / DECOR_G); cx++) {
          const t = this.decorAtCell(cx, cz);
          if (t) this.buildDecor(t, put);
        }
      const hAt = (lx, lz) => {
        const i = clamp(Math.floor(lx / S) + 1, 0, W - 1), j = clamp(Math.floor(lz / S) + 1, 0, W - 1);
        return hg[j * W + i];
      };
      if (this.st === "shore") this.buildStreet(ox, oz, size, put);
      if (this.track.cross) this.buildBridge(ox, oz, size, put);
      const opaqueOf = { [A2.leaves]: A2.leaves_o, [A2.jungleleaves]: A2.jungleleaves_o, [A2.pine_needles]: A2.pine_needles_o, [A2.aspen_leaves]: A2.aspen_leaves_o, [A2.acacia_leaves]: A2.acacia_leaves_o, [A2.cherry_leaves]: A2.cherry_leaves_o, [A2.darkoak_leaves]: A2.darkoak_leaves_o };
      for (const [key, v] of vox) {
        const lx = (key & 255) - 1, lz = (key >> 8 & 255) - 1, y = key >> 16;
        if (lx < 0 || lz < 0 || lx >= size || lz >= size) continue;
        if (y < hAt(lx, lz) - 0.01) continue;
        let tile = v & 255;
        const leaf = !!(v & 256);
        if (leaf && S > 1) tile = opaqueOf[tile] ?? tile;
        for (let f = 0; f < 6; f++) {
          const nx = lx + (f === 0 ? 1 : f === 1 ? -1 : 0), ny = y + (f === 4 ? 1 : f === 5 ? -1 : 0), nz = lz + (f === 2 ? 1 : f === 3 ? -1 : 0);
          const nv = vox.get(ny << 16 | nz + 1 << 8 | nx + 1);
          if (nv !== void 0 && (!(nv & 256) || leaf)) continue;
          if (ny < hAt(nx, nz) - 0.01) continue;
          let ft = tile;
          if (f >= 4 && !leaf) {
            if (tile === A2.tree) ft = A2.tree_top;
            else if (tile === A2.jungletree) ft = A2.jungletree_top;
            else if (tile === A2.pine) ft = A2.pine_top;
            else if (tile === A2.aspen) ft = A2.aspen_top;
            else if (tile === A2.cherry_log) ft = A2.cherry_log_top;
            else if (tile === A2.darkoak) ft = A2.darkoak_top;
            else if (tile === A2.mush_stem) ft = A2.mush_stem;
            else if (tile === A2.crimson_stem || tile === A2.warped_stem) ft = tile;
            else if (tile === A2.acacia) ft = A2.acacia_top;
            else if (tile === A2.cactus) ft = A2.cactus_top;
            else if (tile === A2.basalt) ft = A2.basalt_top;
          }
          const shade = leaf ? f === 5 ? 0.65 : f === 4 ? 1 : 0.9 : 1;
          geo.cube(f, lx, y, lz, ft, shade, ox, oz);
        }
      }
    } else {
      if (S === 2) {
        for (let cz = Math.floor(oz / DECOR_G); cz <= Math.floor((oz + size) / DECOR_G); cz++)
          for (let cx = Math.floor(ox / DECOR_G); cx <= Math.floor((ox + size) / DECOR_G); cx++) {
            const t = this.decorAtCell(cx, cz);
            if (!t || t.type !== "rock") continue;
            const lx = t.x - ox, lz = t.z - oz;
            if (lx < 0 || lz < 0 || lx >= size || lz >= size) continue;
            geo.box(lx + 0.5 - t.rad, t.y, lz + 0.5 - t.rad, lx + 0.5 + t.rad, t.y + t.rad + 0.6, lz + 0.5 + t.rad, this.st === "arctic" ? A2.snow : this.st === "desert" ? A2.desert_stone : this.st === "nether" ? A2.netherrack : this.st === "plains" ? A2.dry_grass : this.st === "badlands" ? A2.tc_orange : this.st === "ocean" ? A2.stone : this.st === "shore" || this.st === "peaks" ? A2.stone : A2.mossycobble, 0.85, ox, oz);
          }
      }
      for (let cz = c0z; cz <= c1z; cz++) for (let cx = c0x; cx <= c1x; cx++) {
        const t = this.treeAtCell(cx, cz);
        if (!t) continue;
        if (S >= 8 && (t.type === "bush" || t.type === "cactus" || t.type === "glow" || t.type === "deadbush")) continue;
        if (S >= 8 && hash2(cx, cz, 404) > (S >= 16 ? 0.1 : 0.3)) continue;
        const grow = S >= 16 ? 1.8 : S >= 8 ? 1.45 : 1;
        const lx = t.x - ox, lz = t.z - oz;
        if (lx < 0 || lz < 0 || lx >= size || lz >= size) continue;
        const p = this.treeProxy(t);
        if (!p) continue;
        if (p.trunk && p.y0 > 0) geo.box(lx + 0.5 - 0.5, t.y, lz, lx + 1, t.y + p.y0, lz + 1, p.trunk, 0.9, ox, oz);
        if (!p.solid) p.rad *= grow;
        if (p.cone) {
          const steps = 3, hgt = p.y1 - p.y0;
          for (let s = 0; s < steps; s++) {
            const rad = p.rad * (1 - s / steps) + 0.5;
            geo.box(lx + 0.5 - rad, t.y + p.y0 + hgt * s / steps, lz + 0.5 - rad, lx + 0.5 + rad, t.y + p.y0 + hgt * (s + 1) / steps, lz + 0.5 + rad, p.tile, 0.85, ox, oz);
          }
        } else geo.box(lx + 0.5 - p.rad, t.y + p.y0, lz + 0.5 - p.rad, lx + 0.5 + p.rad, t.y + p.y1, lz + 0.5 + p.rad, p.tile, 0.85, ox, oz);
      }
    }
    if (S <= 8) {
      for (const st of this.structsNear(ox, oz, ox + size, oz + size)) {
        if (st.x < ox || st.x >= ox + size || st.z < oz || st.z >= oz + size) continue;
        for (const [key, tile] of st.vox) {
          const [dx, dy, dz] = vdec(key);
          const wx = st.x + dx, wz = st.z + dz, y = st.y + dy;
          const gk = dx * 1e3 + dz;
          let gh = st.ground.get(gk);
          if (gh === void 0) {
            gh = this.column(wx, wz).h;
            st.ground.set(gk, gh);
          }
          if (y < gh - 1.01) continue;
          for (let f = 0; f < 6; f++) {
            const nx = dx + (f === 0 ? 1 : f === 1 ? -1 : 0), ny = dy + (f === 4 ? 1 : f === 5 ? -1 : 0), nz = dz + (f === 2 ? 1 : f === 3 ? -1 : 0);
            const nt = st.vox.get(vkey(nx, ny, nz));
            if (nt !== void 0 && nt !== A2.glass && nt !== A2.vine && nt !== A2.water && tile !== A2.vine) continue;
            if (nt !== void 0 && tile === A2.vine && nt === A2.vine) continue;
            geo.cube(f, wx - ox, y, wz - oz, tile, f === 5 ? 0.7 : 1, ox, oz);
          }
        }
      }
    }
    const parts = [];
    const mk = (b, kind, cast) => {
      if (b.count) parts.push({ kind, cast, a: b.arrays() });
    };
    mk(geo, "solid", S <= 2);
    mk(plants, "plant", false);
    mk(water, "water", false);
    mk(lava, "lava", false);
    return parts;
  }
  plantFor(x, z, top, h = 0) {
    const A2 = this.A, r = hash2(x, z, 31), k = this.st;
    const patch = this.noise3.n2(x / 18, z / 18);
    if (k === "taiga" && top === A2.grass) {
      if (r < 0.2 + 0.15 * patch) return r < 0.12 ? A2.p_grass : A2.p_grass2;
      if (patch > 0.3 && r < 0.45) return [A2.p_rose, A2.p_dandelion, A2.p_tulip, A2.p_viola][Math.floor(r * 1e3) & 3];
    } else if (k === "jungle" && (top === A2.litter || top === A2.grass)) {
      if (patch > 0.35 && r < 0.12) return -2;
      if (r < 0.3) return r < 0.16 ? A2.p_junglegrass : A2.p_fern;
      if (r < 0.34) return A2.p_grass2;
    } else if (k === "desert") {
      if (r < 0.012) return A2.p_dry_shrub;
      if (r < 0.02) return A2.p_dry_grass;
    } else if (k === "nether") {
      if ((top === A2.crimson_nylium || top === A2.warped_nylium) && r < 0.08) return A2.p_mushroom;
      if (r < 0.012) return A2.p_mushroom;
    } else if (k === "plains" && top === A2.grass) {
      if (patch > 0.25 && r < 0.3) return r < 0.22 ? A2.p_dandelion : A2.p_grass2;
      if (r < 0.22) return r < 0.14 ? A2.p_grass : A2.p_grass2;
      if (patch < -0.4 && r < 0.38) return [A2.p_rose, A2.p_tulip, A2.p_viola, A2.p_dandelion][Math.floor(r * 1e3) & 3];
    } else if (k === "shore") {
      if (h < this.water - 0.5) {
        if (top === A2.sand && r < 0.14) return A2.p_seagrass;
        if (top !== A2.sand && top !== A2.gravel && r < 0.12) return r < 0.06 ? A2.p_coral_a : A2.p_coral_b;
        if (top === A2.gravel && patch > 0.2 && r < 0.05 && h < this.water - 6) return -3;
        return -1;
      }
      if (top === A2.grass) {
        if (r < 0.16) return A2.p_grass;
        if (patch > 0.35 && r < 0.22) return [A2.p_rose, A2.p_dandelion][Math.floor(r * 1e3) & 1];
      }
    } else if (k === "ocean") {
      if (top === A2.sand || top === A2.silver_sand) {
        if (patch > 0.3 && r < 0.09) return -3;
        if (r < 0.18) return A2.p_seagrass;
      } else if (top === A2.gravel) {
        if (r < 0.06) return -3;
      } else if (top !== A2.clay && r < 0.18) return r < 0.09 ? A2.p_coral_a : A2.p_coral_b;
    } else if (k === "darkforest") {
      if (top === A2.grass && r < 0.24) return r < 0.14 ? A2.p_grass : A2.p_fern;
      if (top === A2.coniferous_litter && r < 0.06) return A2.p_mushroom;
      if (top === A2.moss && r < 0.1) return A2.p_fern;
    } else if (k === "cherry" && top === A2.grass) {
      if (r < 0.2 + 0.2 * Math.max(0, patch)) return r < 0.13 ? A2.p_petals : A2.p_grass;
      if (patch < -0.4 && r < 0.3) return A2.p_grass2;
    } else if (k === "meadow" && top === A2.grass) {
      if (r < 0.16) return r < 0.1 ? A2.p_grass2 : A2.p_grass;
      if (r < 0.16 + 0.2 * (0.5 + 0.5 * patch)) return [A2.p_rose, A2.p_dandelion, A2.p_tulip, A2.p_viola][Math.floor(r * 1e3) & 3];
    } else if (k === "peaks") {
      if (top === A2.grass && r < 0.2) return r < 0.03 ? A2.p_viola : A2.p_grass;
      if (top === A2.stone && r < 0.01) return A2.p_dry_shrub;
    } else if (k === "badlands") {
      if (top === A2.red_sand && r < 0.012) return A2.p_dry_shrub;
      if ((top === A2.grass || top === A2.dry_dirt) && r < 0.25) return A2.p_dry_grass;
    } else if (k === "arctic" && top === A2.snow) {
      if (r < 8e-3) return A2.p_dry_shrub;
    }
    return -1;
  }
  dispose() {
    for (const t of this.tiles.values()) this.disposeTile(t);
    this.tiles.clear();
  }
};
var GeoBuilder = class _GeoBuilder {
  constructor() {
    this.p = [];
    this.nm = [];
    this.uv = [];
    this.tl = [];
    this.c = [];
    this.ix = [];
    this.count = 0;
  }
  _v(x, y, z, nx, ny, nz, u, v, t, a) {
    this.p.push(x, y, z);
    this.nm.push(nx, ny, nz);
    this.uv.push(u, v);
    this.tl.push(t);
    this.c.push(a, a, a);
  }
  _q(flip) {
    const s = this.count * 4;
    if (flip) this.ix.push(s + 1, s + 2, s + 3, s + 1, s + 3, s);
    else this.ix.push(s, s + 1, s + 2, s, s + 2, s + 3);
    this.count++;
  }
  top(x0, z0, x1, z1, y, t, a00, a10, a11, a01, wx, wz) {
    const du = x1 - x0, dv = z1 - z0;
    this._v(x0, y, z0, 0, 1, 0, wx, wz, t, a00);
    this._v(x0, y, z1, 0, 1, 0, wx, wz + dv, t, a01);
    this._v(x1, y, z1, 0, 1, 0, wx + du, wz + dv, t, a11);
    this._v(x1, y, z0, 0, 1, 0, wx + du, wz, t, a10);
    this._q(a00 + a11 < a01 + a10);
  }
  flat(x0, z0, x1, z1, y) {
    this._v(x0, y, z0, 0, 1, 0, 0, 0, 0, 1);
    this._v(x0, y, z1, 0, 1, 0, 0, 0, 0, 1);
    this._v(x1, y, z1, 0, 1, 0, 0, 0, 0, 1);
    this._v(x1, y, z0, 0, 1, 0, 0, 0, 0, 1);
    this._q(false);
  }
  topH(x0, z0, x1, z1, y00, y10, y11, y01, t, wx, wz) {
    const du = x1 - x0, dv = z1 - z0;
    const nx = (y00 + y01 - (y10 + y11)) / (2 * du), nz = (y00 + y10 - (y01 + y11)) / (2 * dv);
    const l = Math.hypot(nx, 1, nz);
    const a = nx / l, b = 1 / l, c = nz / l;
    this._v(x0, y00, z0, a, b, c, wx, wz, t, 1);
    this._v(x0, y01, z1, a, b, c, wx, wz + dv, t, 1);
    this._v(x1, y11, z1, a, b, c, wx + du, wz + dv, t, 1);
    this._v(x1, y10, z0, a, b, c, wx + du, wz, t, 1);
    this._q(false);
  }
  // dir: 0 +x, 1 -x, 2 +z, 3 -z
  side(dir, x0, z0, x1, z1, y0, y1, t, lowAO, wx, wz) {
    const b = lowAO;
    if (dir === 0) {
      this._v(x1, y0, z0, 1, 0, 0, wz, y0, t, b);
      this._v(x1, y1, z0, 1, 0, 0, wz, y1, t, 1);
      this._v(x1, y1, z1, 1, 0, 0, wz + (z1 - z0), y1, t, 1);
      this._v(x1, y0, z1, 1, 0, 0, wz + (z1 - z0), y0, t, b);
    } else if (dir === 1) {
      this._v(x0, y0, z1, -1, 0, 0, wz + (z1 - z0), y0, t, b);
      this._v(x0, y1, z1, -1, 0, 0, wz + (z1 - z0), y1, t, 1);
      this._v(x0, y1, z0, -1, 0, 0, wz, y1, t, 1);
      this._v(x0, y0, z0, -1, 0, 0, wz, y0, t, b);
    } else if (dir === 2) {
      this._v(x1, y0, z1, 0, 0, 1, wx + (x1 - x0), y0, t, b);
      this._v(x1, y1, z1, 0, 0, 1, wx + (x1 - x0), y1, t, 1);
      this._v(x0, y1, z1, 0, 0, 1, wx, y1, t, 1);
      this._v(x0, y0, z1, 0, 0, 1, wx, y0, t, b);
    } else {
      this._v(x0, y0, z0, 0, 0, -1, wx, y0, t, b);
      this._v(x0, y1, z0, 0, 0, -1, wx, y1, t, 1);
      this._v(x1, y1, z0, 0, 0, -1, wx + (x1 - x0), y1, t, 1);
      this._v(x1, y0, z0, 0, 0, -1, wx + (x1 - x0), y0, t, b);
    }
    this._q(false);
  }
  cube(f, lx, y, lz, t, a, ox, oz) {
    const x0 = lx, x1 = lx + 1, z0 = lz, z1 = lz + 1, y0 = y, y1 = y + 1, wx = ox + lx, wz = oz + lz;
    if (f < 4) {
      this.side(f, x0, z0, x1, z1, y0, y1, t, a, wx, wz);
      this._fixA(a);
    } else if (f === 4) this.top(x0, z0, x1, z1, y1, t, a, a, a, a, wx, wz);
    else this.bottom(x0, z0, x1, z1, y0, t, a * 0.8, wx, wz);
  }
  bottom(x0, z0, x1, z1, y, t, a, wx, wz) {
    this._v(x0, y, z0, 0, -1, 0, wx, wz, t, a);
    this._v(x1, y, z0, 0, -1, 0, wx + (x1 - x0), wz, t, a);
    this._v(x1, y, z1, 0, -1, 0, wx + (x1 - x0), wz + (z1 - z0), t, a);
    this._v(x0, y, z1, 0, -1, 0, wx, wz + (z1 - z0), t, a);
    this._q(false);
  }
  box(x0, y0, z0, x1, y1, z1, t, a, ox, oz) {
    const wx = ox + x0, wz = oz + z0;
    this.top(x0, z0, x1, z1, y1, t, a, a, a, a, wx, wz);
    this.bottom(x0, z0, x1, z1, y0, t, a * 0.7, wx, wz);
    for (let d = 0; d < 4; d++) {
      this.side(d, x0, z0, x1, z1, y0, y1, t, a * 0.85, wx, wz);
      this._fixA(a * 0.9);
    }
  }
  _fixA(a) {
    const n = this.c.length;
    for (let i = n - 12; i < n; i++) this.c[i] = a;
  }
  cross(x, y, z, t, r) {
    const s = 0.45, h = 1, ang = r * Math.PI;
    const ca = Math.cos(ang) * s, sa = Math.sin(ang) * s;
    for (const [dx, dz] of [[ca, sa], [-sa, ca]]) {
      this._v(x - dx, y, z - dz, 0, 1, 0, 0, 0, t, 0.85);
      this._v(x - dx, y + h, z - dz, 0, 1, 0, 0, 0.999, t, 1);
      this._v(x + dx, y + h, z + dz, 0, 1, 0, 0.999, 0.999, t, 1);
      this._v(x + dx, y, z + dz, 0, 1, 0, 0.999, 0, t, 0.85);
      this._q(false);
    }
  }
  // plain typed arrays (transferable from a worker)
  arrays() {
    const nm = new Int8Array(this.nm.length);
    for (let i = 0; i < nm.length; i++) nm[i] = Math.round(this.nm[i] * 127);
    const c = new Uint8Array(this.c.length);
    for (let i = 0; i < c.length; i++) c[i] = Math.round(Math.min(1, this.c[i]) * 255);
    let mnx = 1e9, mny = 1e9, mnz = 1e9, mxx = -1e9, mxy = -1e9, mxz = -1e9;
    const p = this.p;
    for (let i = 0; i < p.length; i += 3) {
      if (p[i] < mnx) mnx = p[i];
      if (p[i] > mxx) mxx = p[i];
      if (p[i + 1] < mny) mny = p[i + 1];
      if (p[i + 1] > mxy) mxy = p[i + 1];
      if (p[i + 2] < mnz) mnz = p[i + 2];
      if (p[i + 2] > mxz) mxz = p[i + 2];
    }
    return {
      p: new Float32Array(this.p),
      nm,
      uv: new Float32Array(this.uv),
      tl: new Uint8Array(this.tl),
      c,
      ix: this.count * 4 > 65535 ? new Uint32Array(this.ix) : new Uint16Array(this.ix),
      bs: [(mnx + mxx) / 2, (mny + mxy) / 2, (mnz + mxz) / 2, 0.5 * Math.hypot(mxx - mnx, mxy - mny, mxz - mnz)]
    };
  }
  static toGeometry(a) {
    const g = new THREE2.BufferGeometry();
    g.setAttribute("position", new THREE2.BufferAttribute(a.p, 3));
    g.setAttribute("normal", new THREE2.BufferAttribute(a.nm, 3, true));
    g.setAttribute("uv", new THREE2.BufferAttribute(a.uv, 2));
    g.setAttribute("tl", new THREE2.BufferAttribute(a.tl, 1, false));
    g.setAttribute("color", new THREE2.BufferAttribute(a.c, 3, true));
    g.setIndex(new THREE2.BufferAttribute(a.ix, 1));
    g.boundingSphere = new THREE2.Sphere(new THREE2.Vector3(a.bs[0], a.bs[1], a.bs[2]), a.bs[3]);
    return g;
  }
  build() {
    return _GeoBuilder.toGeometry(this.arrays());
  }
};

// src/js/car2.js
import * as THREE3 from "three";
var carLightU = {
  uCarSun: { value: new THREE3.Color(5, 5, 5) },
  uCarSky: { value: new THREE3.Color(0.5, 0.5, 0.5) },
  uCarGround: { value: new THREE3.Color(0.15, 0.15, 0.15) }
};
var LIGHTS = THREE3.ShaderChunk.lights_fragment_begin.replace("getDirectionalLightInfo( directionalLight, directLight );", "getDirectionalLightInfo( directionalLight, directLight );\n		directLight.color = uCarSun;").replace("irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );", "irradiance += mix( uCarGround, uCarSky, 0.5 * dot( geometryNormal, hemisphereLights[ i ].direction ) + 0.5 );");
function studioLit(mat) {
  mat.fog = false;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, carLightU);
    sh.fragmentShader = "uniform vec3 uCarSun, uCarSky, uCarGround;\n" + sh.fragmentShader.replace("#include <lights_fragment_begin>", LIGHTS);
  };
  mat.customProgramCacheKey = () => "carStudio";
}
function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 64, 4, 32, 64, 64);
  gr.addColorStop(0, "rgba(0,0,0,0.85)");
  gr.addColorStop(0.55, "rgba(0,0,0,0.5)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 128);
  return new THREE3.CanvasTexture(c);
}
function buildCar(gltf) {
  const root = new THREE3.Group();
  const chassis = new THREE3.Group();
  root.add(chassis);
  const body = new THREE3.Group();
  chassis.add(body);
  const mats2 = /* @__PURE__ */ new Set();
  const prep = (o) => {
    o.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      const list = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of list) {
        if (mats2.has(mat)) continue;
        mats2.add(mat);
        if (mat.transparent) {
          mat.depthWrite = false;
        }
        if (mat.alphaTest > 0) {
          mat.polygonOffset = true;
          mat.polygonOffsetFactor = -1;
          mat.polygonOffsetUnits = -1;
        }
        for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap"]) if (mat[k]) mat[k].anisotropy = 16;
        mat.envMapIntensity = 1;
        studioLit(mat);
      }
    });
  };
  const scene2 = gltf.scene;
  scene2.updateMatrixWorld(true);
  const wheels = [];
  const box = new THREE3.Box3();
  for (const n of [...scene2.children]) {
    if (/^wheel_/.test(n.name)) {
      const tag = n.name.slice(6);
      const ax = n.userData?.axle ? new THREE3.Vector3().fromArray(n.userData.axle) : n.position.clone();
      const steer = new THREE3.Group();
      steer.position.copy(ax);
      const spin = new THREE3.Group();
      steer.add(spin);
      const off = new THREE3.Group();
      off.position.copy(ax).negate();
      off.add(n);
      spin.add(off);
      chassis.add(steer);
      prep(n);
      const r = n.userData?.radius || 0.33;
      wheels.push({ steer, spin, front: tag[0] === "F", side: tag[1] === "L" ? -1 : 1, r, base: steer.position.clone() });
    } else {
      body.add(n);
      prep(n);
      box.expandByObject(n);
    }
  }
  const front = wheels.filter((w) => w.front), rear = wheels.filter((w) => !w.front);
  const halfWB = (front[0].base.z - rear[0].base.z) / 2;
  const halfW = Math.max(...wheels.map((w) => Math.abs(w.base.x))) + 0.18;
  const shMesh = new THREE3.Mesh(new THREE3.PlaneGeometry(1, 1), new THREE3.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.75, color: 0, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
  shMesh.rotation.x = -Math.PI / 2;
  shMesh.scale.set(halfW * 2 + 0.5, box.max.z - box.min.z + 0.7, 1);
  shMesh.position.set(0, 0.015, (box.max.z + box.min.z) / 2);
  shMesh.renderOrder = 1;
  root.add(shMesh);
  const car2 = {
    root,
    chassis,
    body,
    wheels,
    shadow: shMesh,
    team: null,
    halfWB,
    halfW,
    height: box.max.y,
    length: box.max.z - box.min.z,
    nose: box.max.z,
    tail: box.min.z,
    frontAxleZ: front[0].base.z,
    rearAxleZ: rear[0].base.z,
    trackF: Math.abs(front[0].base.x) * 2,
    trackR: Math.abs(rear[0].base.x) * 2,
    rFront: front[0].r,
    rRear: rear[0].r,
    setEnv(tex) {
      for (const m of mats2) {
        m.envMap = tex;
        m.needsUpdate = true;
      }
    },
    setEnvIntensity(v) {
      for (const m of mats2) m.envMapIntensity = v;
    },
    setLivery(team) {
      car2.team = team;
    },
    dispose() {
      root.traverse((o) => {
        if (o.isMesh) o.geometry.dispose();
      });
      for (const m of mats2) {
        for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "aoMap"]) m[k]?.dispose?.();
        m.dispose();
      }
    }
  };
  return car2;
}

// src/js/main.js
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// src/js/physics.js
var G = 9.81;
var RHO = 1.2;
var C_SH = 1.38;
var B_SH = Math.tan(Math.PI / (2 * C_SH));
var mf = (s) => Math.sin(C_SH * Math.atan(B_SH * s));
var Vehicle = class {
  constructor(P, geo) {
    this.P = P;
    this.L = geo.halfWB * 2;
    this.a = this.L * (1 - P.frontW);
    this.b = this.L * P.frontW;
    this.tF = geo.trackF;
    this.tR = geo.trackR;
    this.Rf = geo.rFront;
    this.Rr = geo.rRear;
    this.alphaPk = P.mode === "turbo" ? 0.115 : 0.09;
    this.kappaPk = P.mode === "turbo" ? 0.11 : 0.09;
    this.ratios = P.gearsKmh.map((k) => P.rpmMax * 2 * Math.PI / 60 * this.Rr / (k / 3.6));
    this.nG = this.ratios.length;
    this.W = [
      { x: this.a, y: -this.tF / 2, front: true, R: this.Rf },
      { x: this.a, y: this.tF / 2, front: true, R: this.Rf },
      { x: -this.b, y: -this.tR / 2, front: false, R: this.Rr },
      { x: -this.b, y: this.tR / 2, front: false, R: this.Rr }
    ];
    this.assist = { tc: 1, abs: true, steer: true };
    this.tune = { rollF: 0.5, rearMu: P.rearMu || 1.12, lockK: 0.88, lockA: 0.55 };
    this.reset(0, 0, 0, 0);
  }
  reset(x, y, z, yaw) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.yaw = yaw;
    this.u = 0;
    this.v = 0;
    this.rho = 0;
    this.vx = 0;
    this.vz = 0;
    for (const w of this.W) {
      w.w = 0;
      w.alpha = 0;
      w.kappa = 0;
      w.Fz = 0;
      w.slip = 0;
    }
    this.wf = 0;
    this.wr = 0;
    this.rpm = this.P.rpmIdle;
    this.gear = 1;
    this.shiftT = 0;
    this.sinceShift = 1;
    this.boost = 0;
    this.ax = 0;
    this.ay = 0;
    this.delta = 0;
    this.aeroMode = 0;
    this.drs = false;
    this.drsReq = false;
    this.revHold = 0;
    this.clutchSlip = 0;
    this.slipF = 0;
    this.slipR = 0;
    this.kappaR = 0;
    this.kappaF = 0;
    this.events = [];
    this.limiter = false;
    this.tcCut = 0;
    this.absOn = false;
  }
  speed() {
    return Math.hypot(this.u, this.v);
  }
  powerAt(rpm) {
    const P = this.P, x = rpm / P.rpmMax;
    const shape = clamp(0.22 + 0.78 * Math.sin(Math.PI / 2 * Math.min(1, x / 0.94)), 0, 1) * (x > 1.02 ? Math.max(0, 1 - (x - 1.02) * 6) : 1);
    let ers = P.powerERS;
    if (P.powerERS > 0) ers *= clamp(1 - (Math.abs(this.u) - P.ersFadeFrom) / (P.ersFadeTo - P.ersFadeFrom), 0, 1);
    return P.powerICE * shape + ers * clamp(x * 1.6, 0, 1);
  }
  step(dt, ins, surfF, surfR, slope) {
    const P = this.P, m = P.mass, W = this.W;
    let thr = ins.thr, brk = ins.brk;
    const uAbs = Math.abs(this.u);
    if (this.gear > 0 && uAbs < 0.5 && brk > 0.5 && thr < 0.05) {
      this.revHold += dt;
      if (this.revHold > 0.6) {
        this.gear = -1;
        this.events.push("shift");
      }
    } else this.revHold = 0;
    if (this.gear === -1) {
      if (thr > 0.1) {
        if (this.u > -0.6) {
          this.gear = 1;
          this.revHold = 0;
          this.events.push("shift");
        } else {
          brk = thr;
          thr = 0;
        }
      } else {
        thr = brk * 0.3 * clamp((this.u + 7) / 2.5, 0, 1);
        brk = 0;
      }
    }
    const qd = 0.5 * RHO * this.u * this.u * P.claZ;
    const gripAcc = P.mu * (m * G + qd) / m;
    const geoLock = this.L * gripAcc / Math.max(this.u * this.u, 1);
    let want = geoLock * this.tune.lockK + this.alphaPk * (ins.pad ? this.tune.lockA + 0.1 : this.tune.lockA);
    if (uAbs > 25) want *= 1 - 0.35 * brk * Math.min(1, (uAbs - 25) / 30);
    let lock = Math.min(P.steerLock, this.assist.steer ? want : want * 1.5);
    let target = ins.steer * lock;
    if (this.assist.steer && uAbs > 8) {
      const rearSlide = Math.atan2(this.v - this.b * this.rho, uAbs);
      const lim = this.alphaPk * (brk > 0.3 ? 0.6 : 1);
      if (Math.abs(rearSlide) > lim) target += clamp(rearSlide - Math.sign(rearSlide) * lim, -0.25, 0.25) * (uAbs > 50 ? 0.9 : 0.6);
    }
    const rate = ins.pad ? 4 : 2.4 + 2 / (1 + uAbs / 25);
    this.delta += clamp(target - this.delta, -rate * dt, rate * dt);
    const d = this.delta;
    const q = 0.5 * RHO * this.u * this.u;
    if (P.mode === "active") {
      const wantX = thr > 0.95 && brk < 0.02 && Math.abs(ins.steer) < 0.12 && uAbs > 42;
      this.aeroMode += clamp((wantX ? 1 : 0) - this.aeroMode, -dt / (brk > 0.05 || Math.abs(ins.steer) > 0.2 ? 0.04 : 0.15), dt / 0.35);
    } else if (P.mode === "drs") {
      if (brk > 0.05 || thr < 0.5) this.drs = false;
      else if (this.drsReq && uAbs > 25) this.drs = true;
      this.aeroMode += clamp((this.drs ? 1 : 0) - this.aeroMode, -dt / 0.12, dt / 0.25);
    }
    const cla = lerp(P.claZ, P.claX, this.aeroMode), cda = lerp(P.cdaZ, P.cdaX, this.aeroMode);
    const down = q * cla, drag = q * cda;
    const h = P.cgH, L = this.L;
    const dLong = m * this.ax * h / L;
    const axleF = m * G * this.b / L + down * P.aeroFront - dLong;
    const axleR = m * G * this.a / L + down * (1 - P.aeroFront) + dLong;
    const rollF = this.tune.rollF;
    const dLatF = m * this.ay * h * rollF / this.tF, dLatR = m * this.ay * h * (1 - rollF) / this.tR;
    W[0].Fz = axleF / 2 + dLatF;
    W[1].Fz = axleF / 2 - dLatF;
    W[2].Fz = axleR / 2 + dLatR;
    W[3].Fz = axleR / 2 - dLatR;
    for (const w of W) w.Fz = Math.max(60, w.Fz);
    const gearR = this.gear === -1 ? -this.ratios[0] * 0.9 : this.ratios[this.gear - 1];
    const wRear = (W[2].w + W[3].w) / 2;
    const wheelRpm = Math.abs(wRear * gearR * 60 / (2 * Math.PI));
    const bt = thr > this.boost ? P.turboLag : 0.12;
    this.boost += (thr - this.boost) * Math.min(1, dt / Math.max(0.01, bt));
    let thrEff = thr * (P.mode === "turbo" ? 0.3 + 0.7 * this.boost : 0.9 + 0.1 * this.boost);
    if (this.assist.tc > 0 && this.gear !== -1) {
      const kLim = this.assist.tc === 2 ? 0.06 : 0.085;
      const kap = Math.max(W[2].kappa, W[3].kappa);
      const over = Math.max(kap - kLim, (this.slipR - (this.assist.tc === 2 ? 1 : 1.2)) * 0.1);
      this.tcCut = clamp(this.tcCut + (over > 0 ? over * 400 : -4) * dt, 0, 0.9);
      thrEff *= 1 - this.tcCut;
    } else this.tcCut = 0;
    this.sinceShift += dt;
    if (this.shiftT > 0) {
      this.shiftT -= dt;
      thrEff *= P.mode === "turbo" ? 0 : 0.4;
    }
    let Tdrive = 0;
    const omegaE = (rpm) => rpm * 2 * Math.PI / 60;
    const clutchLock = P.rpmLaunch * 0.92;
    let locked = true;
    if ((this.gear === 1 || this.gear === -1) && wheelRpm < clutchLock) {
      locked = false;
      const tgt = lerp(P.rpmIdle + 400, P.rpmLaunch, clamp(thr * 1.15, 0, 1));
      this.rpm += (Math.max(tgt, wheelRpm) - this.rpm) * Math.min(1, dt * 7);
      Tdrive = this.powerAt(this.rpm) / omegaE(this.rpm) * thrEff * gearR * 0.93 * clamp(thr * 3, 0, 1);
      this.clutchSlip = 1 - wheelRpm / Math.max(1, this.rpm);
    }
    if (locked) {
      this.clutchSlip = 0;
      this.rpm += (Math.max(wheelRpm, P.rpmIdle) - this.rpm) * Math.min(1, dt * (this.shiftT > 0 ? 25 : 60));
      this.limiter = this.rpm > P.rpmLimit;
      const Te = this.limiter ? 0 : this.powerAt(this.rpm) / omegaE(Math.max(this.rpm, P.rpmIdle)) * thrEff;
      let Teb = thr < 0.05 ? -P.engBrake * (P.powerICE / omegaE(P.rpmMax)) * (this.rpm / P.rpmMax) * (1 - 0.7 * brk) : 0;
      if (this.assist.tc > 0) Teb *= clamp(1.8 - this.slipR, 0, 1);
      Tdrive = (Te + Teb) * gearR * 0.93;
    }
    const d0 = this.delta;
    const bTot = brk * P.brakeTq * 2;
    const bWheel = [bTot * P.brakeFront / 2, bTot * P.brakeFront / 2, bTot * (1 - P.brakeFront) / 2, bTot * (1 - P.brakeFront) / 2];
    this.absOn = false;
    if (this.assist.abs && brk > 0) for (let i = 0; i < 4; i++) {
      const over = (-W[i].kappa - this.kappaPk * 1) / (this.kappaPk * 0.4);
      if (over > 0) {
        bWheel[i] *= clamp(1 - over, 0.12, 1);
        this.absOn = true;
      }
    }
    if (brk > 0) {
      const sh = Math.min(1, Math.abs(d0) / 0.1) * 0.25;
      bWheel[2] *= 1 - sh;
      bWheel[3] *= 1 - sh;
    }
    if (brk > 0 && this.assist.abs) for (const i of [2, 3]) {
      const k = clamp(1 - ((W[i].sy || 0) - 0.75) * 1.6, 0.25, 1);
      if (k < 1) {
        bWheel[i] *= k;
        this.absOn = true;
      }
    }
    const lsdLock = 250 + 0.35 * Math.abs(Tdrive);
    const lsd = clamp((W[2].w - W[3].w) * 400, -lsdLock, lsdLock);
    const Tin = [0, 0, Tdrive / 2 - lsd, Tdrive / 2 + lsd];
    const Iw = [1.1, 1.1, 1.1 + (locked ? 0.045 * gearR * gearR : 0), 1.1 + (locked ? 0.045 * gearR * gearR : 0)];
    const cd = Math.cos(d), sdn = Math.sin(d);
    let Fx = 0, Fy = 0, Mz = 0;
    const tanPk = Math.tan(this.alphaPk);
    let maxSF = 0, maxSR = 0, kapF = 0, kapR = 0;
    for (let i = 0; i < 4; i++) {
      const w = W[i];
      const vxb = this.u - this.rho * w.y, vyb = this.v + this.rho * w.x;
      const dd = w.front ? d * (1 + (w.y * Math.sign(d) > 0 ? 0.06 : -0.04)) : 0;
      const c = w.front ? Math.cos(dd) : 1, s = w.front ? Math.sin(dd) : 0;
      const vxw = vxb * c + vyb * s, vyw = -vxb * s + vyb * c;
      const ve = Math.max(Math.abs(vxw), 2);
      const aT = Math.atan2(vyw, ve);
      const relax = Math.min(1, (Math.abs(vxw) + 3) * dt / 0.16);
      w.alpha += (aT - w.alpha) * relax;
      const surf = w.front ? surfF : surfR;
      const mu = P.mu * clamp(1 - 0.08 * (w.Fz / 3500 - 1), 0.75, 1.1) * surf.grip * (w.front ? 1 : this.tune.rearMu);
      const D = mu * w.Fz;
      const sy = Math.tan(w.alpha) / tanPk;
      const force = (kap) => {
        const sx = kap / this.kappaPk, sn2 = Math.hypot(sx, sy) || 1e-6, F = D * mf(sn2);
        return [F * sx / sn2 * (sx < 0 ? 1.15 : 1), -F * sy / sn2, sn2];
      };
      const k0 = (w.w * w.R - vxw) / ve;
      const [fx0] = force(k0);
      const [fx1] = force(k0 + 2e-3);
      const K = Math.max(0, (fx1 - fx0) / 2e-3);
      let wn = w.w + (Tin[i] - fx0 * w.R) / (Iw[i] / dt + K * w.R * w.R / ve);
      const bd = bWheel[i] * dt / Iw[i];
      if (Math.abs(wn) <= bd) wn = 0;
      else wn -= Math.sign(wn) * bd;
      if (bWheel[i] > 0 && uAbs < 0.3 && Math.abs(Tin[i]) < bWheel[i]) wn = 0;
      w.w = wn;
      w.kappa = (wn * w.R - vxw) / ve;
      let [fxw, fyw, sn] = force(w.kappa);
      if (uAbs < 1.2) fyw = -vyw * m * 0.6;
      w.slip = sn;
      w.sy = Math.abs(sy);
      const fxb = fxw * c - fyw * s, fyb = fxw * s + fyw * c;
      Fx += fxb;
      Fy += fyb;
      Mz += w.x * fyb - w.y * fxb;
      if (w.front) {
        maxSF = Math.max(maxSF, sn);
        kapF = Math.min(kapF, w.kappa);
      } else {
        maxSR = Math.max(maxSR, sn);
        kapR = Math.max(kapR, w.kappa);
      }
    }
    this.slipF = maxSF;
    this.slipR = maxSR;
    this.kappaF = kapF;
    this.kappaR = kapR;
    this.wf = (W[0].w + W[1].w) / 2;
    this.wr = (W[2].w + W[3].w) / 2;
    const offDrag = (surfF.drag + surfR.drag) * 0.5 * m * (0.6 + 25e-4 * this.u * this.u);
    const resist = (drag + 0.011 * m * G + offDrag) * Math.sign(this.u) * Math.min(1, uAbs / 0.5);
    const ax = (Fx - resist - m * G * slope) / m;
    const ay = Fy / m;
    this.u += (ax + this.v * this.rho) * dt;
    this.v += (ay - this.u * this.rho) * dt;
    this.rho += Mz / P.izz * dt;
    if (uAbs < 0.5 && thr < 0.05 && Math.abs(Tdrive) < 1) {
      this.rho *= 0.9;
      this.v *= 0.9;
      if (brk > 0.1) this.u *= 0.9;
    }
    this.ax += (ax - this.ax) * Math.min(1, dt * 14);
    this.ay += (ay - this.ay) * Math.min(1, dt * 14);
    this.yaw -= this.rho * dt;
    const syw = Math.sin(this.yaw), cyw = Math.cos(this.yaw);
    const vx = this.u * syw - this.v * cyw, vz = this.u * cyw + this.v * syw;
    this.x += vx * dt;
    this.z += vz * dt;
    this.vx = vx;
    this.vz = vz;
    if (this.gear > 0 && this.shiftT <= 0 && this.sinceShift > 0.12) {
      const rpmNow = Math.abs(this.wr * this.ratios[this.gear - 1] * 60 / (2 * Math.PI));
      if (this.gear < this.nG && rpmNow > P.rpmMax * 0.985 && thr > 0.2 && locked) this.shift(1);
      else if (this.gear > 1) {
        const rpmLow = Math.abs(this.u / this.Rr * this.ratios[this.gear - 2] * 60 / (2 * Math.PI));
        const wantRpm = brk > 0.1 ? P.rpmMax * 0.9 : P.rpmMax * 0.72;
        if (rpmLow < wantRpm && rpmNow < P.rpmMax * 0.8) this.shift(-1);
      }
    }
  }
  shift(dir) {
    this.gear += dir;
    this.shiftT = this.P.shiftTime;
    this.sinceShift = 0;
    this.events.push(dir > 0 ? "up" : "down");
  }
};

// src/js/audio.js
var PROC = `
function DL(n){ this.d=new Float32Array(Math.max(1,n|0)); this.i=0; }
DL.prototype.get=function(){ return this.d[this.i]; };
DL.prototype.pushL=function(v){ this.d[this.i]=v; this.i++; if(this.i>=this.d.length)this.i=0; };
DL.prototype.pushR=function(v){ this.d[this.i]=v; this.i--; if(this.i<0)this.i=this.d.length-1; };
function WG(n, rl, rr){ this.u=new DL(n); this.l=new DL(n); this.rl=rl; this.rr=rr; this.oL=0; this.oR=0; }
WG.prototype.add=function(vl, vr){
  const lo=this.l.get(), up=this.u.get();
  const refL=lo*this.rl; this.oL=lo*(1-this.rl);
  const refR=up*this.rr; this.oR=up*(1-this.rr);
  this.u.pushR(vl+refL); this.l.pushL(vr+refR);
};
const ERA = [
  // 2026: raw, high-revving V6 with less turbo damping than 2021, strong electric whine
  { intake: 34, exhaust: 58, extractor: 26, pipe: 96, muffler: [6, 9, 13], action: 0.12, outlet: 30, ign: 0.018, jitter: 0.06,
    wOut: 1.0, wIn: 0.55, wBlock: 0.25, drive: 2.0, bright: 1.0, turbo: 0.016, mguk: 0.03 },
  // 2021: turbo + MGU-H muffled, deeper and smoother
  { intake: 40, exhaust: 70, extractor: 34, pipe: 150, muffler: [9, 14, 21, 27], action: 0.22, outlet: 46, ign: 0.02, jitter: 0.04,
    wOut: 1.0, wIn: 0.45, wBlock: 0.3, drive: 1.6, bright: 0.75, turbo: 0.022, mguk: 0.016 },
  // 1987: 1.5 L turbo V6 on high boost, open exhausts, harsh and loud
  { intake: 44, exhaust: 84, extractor: 30, pipe: 72, muffler: [5, 8], action: 0.06, outlet: 22, ign: 0.03, jitter: 0.12,
    wOut: 1.15, wIn: 0.6, wBlock: 0.2, drive: 2.8, bright: 1.1, turbo: 0.05, mguk: 0 },
  // 2010: 2.4 L V8 at 18,000 rpm, short open exhausts, the classic scream
  { intake: 28, exhaust: 46, extractor: 20, pipe: 60, muffler: [4, 7], action: 0.05, outlet: 18, ign: 0.016, jitter: 0.05,
    wOut: 1.15, wIn: 0.7, wBlock: 0.22, drive: 2.4, bright: 1.25, turbo: 0, mguk: 0 },
  // 2006: the same V8 formula a little higher and rawer (19,000 rpm)
  { intake: 26, exhaust: 42, extractor: 18, pipe: 54, muffler: [4, 6], action: 0.04, outlet: 16, ign: 0.016, jitter: 0.06,
    wOut: 1.2, wIn: 0.75, wBlock: 0.2, drive: 2.6, bright: 1.35, turbo: 0, mguk: 0 },
];
function Cyl(e, s){
  this.cyl=new WG(Math.round(10*s), 0.75, 0.75);
  this.intake=new WG(Math.round(e.intake*s), 0.01, 0.6);
  this.exh=new WG(Math.round(e.exhaust*s), 0.95, 0.01);
  this.ext=new WG(Math.round(e.extractor*s), 0.01, 0.01);
  this.ign=e.ign;
}
class Eng {
  constructor(sr){
    this.sr=sr; this.rev=0; this.seed=1234567; this.n=0;
    this.p={rpm:4000,load:0,cyl:6,era:0,boost:0,lim:0,gwF:0,gwA:0,vol:0,lp:1,rmax:12000};
    this.s={rpm:4000,load:0,boost:0,gwF:0,gwA:0,vol:0,lp:1};
    this.ni=0; this.crank=0; this.blk=0; this.lp1=0; this.lp2=0; this.hp=0; this.hpx=0;
    this.tph=0; this.kph=0; this.gph=0; this.pop=0; this.popT=0; this.wg=0; this.lastBoost=0; this.limCnt=0; this.lastRev=0;
    this.build(0);
  }
  rnd(){ this.seed=(this.seed*1664525+1013904223)>>>0; return this.seed/4294967296; }
  build(era){
    this.era=era; const e=ERA[era]; this.e=e; const s=this.sr/44100;
    this.cyls=[]; for(let i=0;i<this.p.cyl;i++) this.cyls.push(new Cyl(e,s));
    this.pipe=new WG(Math.round(e.pipe*s),0.02,0.02);
    this.muf=e.muffler.map(n=>new WG(Math.max(1,Math.round(n*s)),0.0,e.action)); this.mufL=0; this.mufR=0;
    this.out=new WG(Math.round(e.outlet*s),0.05,0.05);
  }
  setParams(d){ const era=d.era; Object.assign(this.p,d); if(era!==undefined && era!==this.era) this.build(era); }
  sample(){
    const p=this.p, s=this.s, e=this.e;
    s.rpm += (p.rpm - s.rpm) * 0.0035; s.load += (p.load - s.load) * 0.004; s.boost += (p.boost - s.boost) * 0.002;
    s.gwF += (p.gwF - s.gwF) * 0.01; s.gwA += (p.gwA - s.gwA) * 0.003; s.vol += (p.vol - s.vol) * 0.003; s.lp += (p.lp - s.lp) * 0.002;
    const load = s.load;
    // intake noise and crank jitter
    this.ni += 0.7 * ((this.rnd()*2-1) - this.ni);
    this.crank += 0.002 * ((this.rnd()*2-1)*e.jitter*0.08 - this.crank);
    const nC=this.cyls.length, inv=1/nC;
    let block=0, intakeOut=0, pipeIn=0;
    // limiter: cut most ignitions
    const cut = p.lim ? ((this.limCnt % 3) !== 0) : false;
    for(let i=0;i<nC;i++){
      const c=this.cyls[i];
      let x=(this.rev + i*(inv + this.crank)) % 1; if(x<0) x+=1;
      const exV = (x>0.75) ? -Math.sin(4*Math.PI*x) : 0;
      const inV = (x<0.25) ? Math.sin(4*Math.PI*x) : 0;
      const piston = Math.cos(4*Math.PI*x);
      let ign = (x < 0.5*c.ign) ? Math.sin(2*Math.PI*x/c.ign) : 0;
      ign *= cut ? 0.05 : (0.12 + 0.88*load) * (0.985 + 0.03*((i*7919)%13)/13);
      const inR = 0.01*inV + 0.95*(1-inV), exR = 0.01*exV + 0.95*(1-exV);
      c.intake.rr = inR; c.cyl.rl = inR; c.exh.rl = exR; c.cyl.rr = exR;
      const amp = piston*1.5 + ign*5.0;
      const exOR=c.exh.oR, extOL=c.ext.oL, cylOL=c.cyl.oL, cylOR=c.cyl.oR, inOR=c.intake.oR;
      c.ext.add(exOR, this.pipe.oL);
      c.exh.add(cylOR, extOL);
      c.cyl.add(amp + inOR*(1-c.intake.rr), extOL*(1-c.exh.rl));
      c.intake.add(this.ni*inV*(0.3+0.7*load), cylOL*(1-c.intake.rr));
      block += c.cyl.oL; intakeOut += c.intake.oL; pipeIn += c.ext.oR;
    }
    const prev = this.rev;
    this.rev += s.rpm/120/this.sr;
    if (this.rev >= 1) { this.rev -= 1; }
    if (Math.floor(prev*nC) !== Math.floor(this.rev*nC)) {
      this.limCnt++;
      // overrun crackle: unburnt fuel popping in the exhaust when lifting at high rpm
      if (load < 0.08 && s.rpm > p.rmax*0.5 && this.rnd() < (this.era===2 ? 0.07 : 0.025)) this.pop = 0.6 + this.rnd()*0.9;
    }
    // pipe -> muffler -> outlet
    this.pipe.add(pipeIn*inv, this.mufL);
    let mL=0, mR=0; const mi=1/this.muf.length;
    for (const m of this.muf) { mL+=m.oL; mR+=m.oR; m.add(this.pipe.oR*mi, this.out.oL*mi); }
    this.mufL=mL; this.mufR=mR;
    this.out.add(mR, 0);
    let y = this.out.oR*e.wOut*(1.0 - 0.35*s.lp) + intakeOut*e.wIn*(0.5 + 0.8*s.lp)*0.6;
    this.blk += 0.02*(block*0.08 - this.blk); y += this.blk*e.wBlock*4*(0.6+0.6*s.lp);
    if (this.pop > 0.001) { y += this.pop*(this.rnd()*2-1)*0.9; this.pop *= 0.9975; }
    // drive / saturation
    const dr = e.drive*(0.7 + 0.6*load);
    y = Math.tanh(y*0.55*dr)/Math.tanh(dr*0.9);
    // turbo whistle, MGU-K whine, wastegate chatter, straight-cut gears
    const tf = 2200 + 6800*s.boost*(s.rpm/p.rmax);
    this.tph += tf/this.sr; if(this.tph>1)this.tph-=1;
    y += Math.sin(this.tph*6.2831853)*s.boost*e.turbo;
    const kf = s.rpm/60*7.5; this.kph += kf/this.sr; if(this.kph>1)this.kph-=1;
    y += (Math.sin(this.kph*6.2831853) + 0.35*Math.sin(this.kph*12.566)) * e.mguk*(0.25+load);
    if (this.era===2) { const db=this.lastBoost-s.boost; this.lastBoost=s.boost; if(db>0.00015) this.wg=Math.min(1,this.wg+db*80); }
    if (this.wg>0.001) { y += this.wg*(this.rnd()*2-1)*0.3*(0.55+0.45*Math.sin(this.n*0.004)); this.wg*=0.99985; }
    this.gph += s.gwF/this.sr; if(this.gph>1)this.gph-=1;
    y += Math.sin(this.gph*6.2831853)*s.gwA;
    // tone: two-pole lowpass opening with load, DC block
    const fc = (1400 + 9000*Math.pow(load, 0.6))*e.bright*(0.65+0.35*s.lp) + 500;
    const a = 1 - Math.exp(-6.2831853*fc/this.sr);
    this.lp1 += a*(y - this.lp1); this.lp2 += a*(this.lp1 - this.lp2);
    const o = this.lp2, out = o - this.hpx + 0.995*this.hp; this.hpx=o; this.hp=out;
    this.n++;
    return out*s.vol*0.9;
  }
}
`;
var WORKLET = PROC + `
class EngProc extends AudioWorkletProcessor {
  constructor(){ super(); this.e=new Eng(sampleRate); this.port.onmessage=(m)=>this.e.setParams(m.data); }
  process(i,o){ const ch=o[0][0]; for(let k=0;k<ch.length;k++) ch[k]=this.e.sample(); if(o[0][1]) o[0][1].set(ch); return true; }
}
registerProcessor('eng-proc', EngProc);
`;
var Audio = class {
  constructor() {
    this.ctx = null;
    this.ready = false;
    this.muted = false;
    this.vol = 0.8;
    this.level = 1;
    this._init = null;
  }
  init() {
    if (this._init) return this._init;
    this._init = this._doInit();
    return this._init;
  }
  async _doInit() {
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.vol * this.level;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.ratio.value = 3.5;
    comp.attack.value = 4e-3;
    comp.release.value = 0.15;
    this.master.connect(comp);
    comp.connect(ctx.destination);
    this.ui = ctx.createGain();
    this.ui.gain.value = this.muted ? 0 : 0.9 * this.level;
    this.ui.connect(ctx.destination);
    this.engGain = ctx.createGain();
    this.engGain.gain.value = 0.7;
    this.engEQ = ctx.createBiquadFilter();
    this.engEQ.type = "peaking";
    this.engEQ.frequency.value = 220;
    this.engEQ.Q.value = 0.8;
    this.engEQ.gain.value = 4;
    this.engGain.connect(this.engEQ);
    this.engEQ.connect(this.master);
    try {
      const url = URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" }));
      await ctx.audioWorklet.addModule(url);
      this.node = new AudioWorkletNode(ctx, "eng-proc", { outputChannelCount: [2] });
      this.post = (d2) => this.node.port.postMessage(d2);
    } catch (e) {
      const Eng = new Function(PROC + "; return Eng;")();
      const eng = new Eng(ctx.sampleRate);
      this.node = ctx.createScriptProcessor(1024, 0, 1);
      this.node.onaudioprocess = (ev) => {
        const ch = ev.outputBuffer.getChannelData(0);
        for (let k = 0; k < ch.length; k++) ch[k] = eng.sample();
      };
      this.post = (d2) => eng.setParams(d2);
    }
    this.node.connect(this.engGain);
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = nb.getChannelData(0);
    let b = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      b = 0.97 * b + 0.03 * w;
      d[i] = w * 0.5 + b * 2;
    }
    const noise = (type, f, Q) => {
      const s = ctx.createBufferSource();
      s.buffer = nb;
      s.loop = true;
      const fl = ctx.createBiquadFilter();
      fl.type = type;
      fl.frequency.value = f;
      fl.Q.value = Q;
      const g = ctx.createGain();
      g.gain.value = 0;
      s.connect(fl);
      fl.connect(g);
      g.connect(this.master);
      s.start();
      return { g, fl };
    };
    this.wind = noise("bandpass", 500, 0.5);
    this.squeal = noise("bandpass", 1150, 9);
    this.squeal2 = noise("bandpass", 1650, 12);
    this.rumble = noise("lowpass", 260, 0.7);
    this.road = noise("lowpass", 140, 0.9);
    this.noiseBuf = nb;
    this.ready = true;
    if (this.pendingEra) this.post(this.pendingEra);
  }
  resume() {
    if (this.ctx && this.ctx.state !== "running") this.ctx.resume();
  }
  setMuted(m) {
    this.muted = m;
    this._apply();
  }
  // overall volume 0..1 (the slider); squared so the low end of the slider stays usable
  setVolume(v) {
    this.level = Math.max(0, Math.min(1, v)) ** 2;
    this._apply();
  }
  _apply() {
    const t = this.ctx ? this.ctx.currentTime : 0;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : this.vol * this.level, t, 0.02);
    if (this.ui) this.ui.gain.setTargetAtTime(this.muted ? 0 : 0.9 * this.level, t, 0.02);
  }
  setEra(era, P) {
    const d = { era: era === "2026" ? 0 : era === "2010" ? 3 : era === "2006" ? 4 : 1, cyl: P.cyl, rmax: P.rpmMax };
    if (!this.ready) {
      this.pendingEra = d;
      return;
    }
    this.post(d);
  }
  update(st) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.post({ rpm: st.rpm, load: st.load, boost: st.boost, lim: st.lim ? 1 : 0, gwF: st.gwF, gwA: st.gwA, vol: st.vol, lp: st.lp });
    this.engEQ.gain.setTargetAtTime(st.lp > 0.9 ? 6 : 3, t, 0.2);
    const sp = st.speed;
    this.wind.g.gain.setTargetAtTime(Math.min(0.45, sp * sp / 1e4) * st.windMul, t, 0.05);
    this.wind.fl.frequency.setTargetAtTime(300 + sp * 12, t, 0.1);
    this.road.g.gain.setTargetAtTime(Math.min(0.25, sp / 300) * (st.onPath ? 1 : 0), t, 0.08);
    const sq = Math.max(0, st.slip - 1.05) * (st.onPath ? 1 : 0.15) * Math.min(1, sp / 6);
    this.squeal.g.gain.setTargetAtTime(Math.min(0.2, sq * 0.2), t, 0.03);
    this.squeal2.g.gain.setTargetAtTime(Math.min(0.1, sq * 0.08), t, 0.03);
    this.squeal.fl.frequency.setTargetAtTime(1e3 + Math.min(500, sq * 300), t, 0.05);
    this.rumble.g.gain.setTargetAtTime(st.offroad ? Math.min(0.9, sp / 30) : 0, t, 0.05);
  }
  thump(strength) {
    if (!this.ready) return;
    const ctx = this.ctx, s = ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 500;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(Math.min(1.5, strength), t);
    g.gain.exponentialRampToValueAtTime(1e-3, t + 0.35);
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start(t, Math.random());
    s.stop(t + 0.4);
  }
  click(strength = 0.25, freq = 1800) {
    if (!this.ready) return;
    const ctx = this.ctx, s = ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = 2;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(strength, t);
    g.gain.exponentialRampToValueAtTime(1e-3, t + 0.06);
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start(t, Math.random());
    s.stop(t + 0.08);
  }
  // Minecraft-like menu click: a short hollow wooden "tock"
  uiClick() {
    if (!this.ready || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(1180, t);
    o.frequency.exponentialRampToValueAtTime(560, t + 0.035);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1400;
    bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(1e-4, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 2e-3);
    g.gain.exponentialRampToValueAtTime(1e-3, t + 0.07);
    o.connect(bp);
    bp.connect(g);
    g.connect(this.ui);
    o.start(t);
    o.stop(t + 0.08);
    const n = ctx.createBufferSource();
    n.buffer = this.noiseBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3e3;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.35, t);
    g2.gain.exponentialRampToValueAtTime(1e-3, t + 0.012);
    n.connect(hp);
    hp.connect(g2);
    g2.connect(this.ui);
    n.start(t, Math.random());
    n.stop(t + 0.02);
  }
  beep(freq, dur = 0.12, vol = 0.25) {
    if (!this.ready || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime, o = ctx.createOscillator();
    o.type = "square";
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.setValueAtTime(vol, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2500;
    o.connect(lp);
    lp.connect(g);
    g.connect(this.ui);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
};

// src/js/tilepool.js
var TilePool = class {
  constructor(url, n) {
    this.ok = false;
    this.workers = [];
    this.gen = 0;
    this.world = null;
    this.jobs = /* @__PURE__ */ new Map();
    try {
      for (let i = 0; i < n; i++) {
        const w = new Worker(url);
        w.busy = 0;
        w.onmessage = (e) => this._msg(w, e.data);
        w.onerror = () => this._fail();
        this.workers.push(w);
      }
      this.ok = this.workers.length > 0;
    } catch {
      this._fail();
    }
  }
  _fail() {
    if (!this.ok && !this.workers.length) return;
    this.ok = false;
    for (const w of this.workers) try {
      w.terminate();
    } catch {
    }
    this.workers = [];
    if (this.world) {
      this.world.inflight.clear();
    }
  }
  // a new world (biome) replaces the generator in every worker
  init(world2, biome, track, A2, opts = {}) {
    if (!this.ok) return;
    this.gen++;
    this.world = world2;
    this.jobs.clear();
    for (const w of this.workers) {
      w.busy = 0;
      w.postMessage({ type: "init", gen: this.gen, biome, track, A: A2, opts });
    }
  }
  request(world2, key, ox, oz, S) {
    if (!this.ok || world2 !== this.world) return false;
    let best = null;
    for (const w of this.workers) if (w.busy < 3 && (!best || w.busy < best.busy)) best = w;
    if (!best) return false;
    best.busy++;
    best.postMessage({ type: "job", gen: this.gen, key, ox, oz, S });
    return true;
  }
  get idle() {
    return this.workers.every((w) => w.busy === 0);
  }
  _msg(w, m) {
    if (m.type === "error") {
      this._fail();
      return;
    }
    if (m.type !== "tile") return;
    w.busy = Math.max(0, w.busy - 1);
    if (m.gen !== this.gen || !this.world) return;
    this.world.receive(m.key, m.ox, m.oz, m.S, m.parts);
  }
};

// src/js/racingline.js
import * as THREE4 from "three";
function solveOffsets(cx, cz, nx, nz, lim, o, sweeps) {
  const M = cx.length;
  const R = [0, 0];
  for (let it = 0; it < sweeps; it++) {
    for (let j = 0; j < M; j++) {
      let num = 0;
      for (const [c, al] of [[-1, 1], [0, -2], [1, 1]]) {
        const i = (j + c + M) % M, im = (i - 1 + M) % M, ip = (i + 1) % M;
        R[0] = cx[im] - 2 * cx[i] + cx[ip] + nx[im] * o[im] - 2 * nx[i] * o[i] + nx[ip] * o[ip];
        R[1] = cz[im] - 2 * cz[i] + cz[ip] + nz[im] * o[im] - 2 * nz[i] * o[i] + nz[ip] * o[ip];
        R[0] -= al * nx[j] * o[j];
        R[1] -= al * nz[j] * o[j];
        num += al * (R[0] * nx[j] + R[1] * nz[j]);
      }
      let v = -num / 6;
      o[j] = v > lim ? lim : v < -lim ? -lim : v;
    }
  }
}
function computeRacingLine(track, halfW, margin = 1.35) {
  const N = track.N, lim = halfW - margin;
  let prev = null, prevM = 0;
  for (const D of [32, 16, 8, 4]) {
    const M2 = Math.floor(N / D);
    const cx = new Float64Array(M2), cz = new Float64Array(M2), nx = new Float64Array(M2), nz = new Float64Array(M2), o2 = new Float64Array(M2);
    for (let j = 0; j < M2; j++) {
      const i = Math.floor(j * N / M2);
      cx[j] = track.X[i];
      cz[j] = track.Z[i];
      nx[j] = -track.TZ[i];
      nz[j] = track.TX[i];
      if (prev) {
        const f = j * prevM / M2, k = Math.floor(f), t = f - k;
        o2[j] = prev[k % prevM] * (1 - t) + prev[(k + 1) % prevM] * t;
      }
    }
    solveOffsets(cx, cz, nx, nz, lim, o2, D >= 16 ? 3e3 : D === 8 ? 1500 : 800);
    prev = o2;
    prevM = M2;
  }
  const o = prev, M = prevM;
  const X = new Float32Array(N), Z = new Float32Array(N), Y = new Float32Array(N), OFF = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const f = i * M / N, j = Math.floor(f), t = f - j;
    const o0 = o[(j - 1 + M) % M], o1 = o[j % M], o2 = o[(j + 1) % M], o3 = o[(j + 2) % M];
    const off = Math.max(-lim, Math.min(lim, 0.5 * (2 * o1 + (-o0 + o2) * t + (2 * o0 - 5 * o1 + 4 * o2 - o3) * t * t + (-o0 + 3 * o1 - 3 * o2 + o3) * t * t * t)));
    OFF[i] = off;
    X[i] = track.X[i] - track.TZ[i] * off;
    Z[i] = track.Z[i] + track.TX[i] * off;
    Y[i] = track.H[i];
  }
  const K = new Float32Array(N), ds = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const i1 = (i + 1) % N;
    ds[i] = Math.max(0.2, Math.hypot(X[i1] - X[i], Z[i1] - Z[i]));
    const a = (i - 6 + N) % N, b = (i + 6) % N;
    const ax = X[a] - X[i], az = Z[a] - Z[i], bx = X[b] - X[i], bz = Z[b] - Z[i];
    const cr = ax * bz - az * bx, la = Math.hypot(ax, az), lb = Math.hypot(bx, bz), lc = Math.hypot(X[b] - X[a], Z[b] - Z[a]);
    K[i] = Math.abs(2 * cr) / Math.max(1e-6, la * lb * lc);
  }
  const K2 = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let s = 0;
    for (let k = -4; k <= 4; k++) s += K[(i + k + N) % N];
    K2[i] = s / 9;
  }
  return { X, Z, Y, K: K2, ds, N, OFF };
}
var calCache = /* @__PURE__ */ new Map();
function calibrate(P, geo) {
  const key = P.mass + "|" + P.claZ + "|" + P.mu + "|" + geo.halfWB.toFixed(3);
  if (calCache.has(key)) return calCache.get(key);
  const surf = { grip: 1, drag: 0 }, dt = 4e-3, VS = [];
  for (let v = 15; v <= 95; v += 5) VS.push(v);
  const mk = () => {
    const c = new Vehicle(P, geo);
    c.assist = { tc: 1, abs: true, steer: true };
    return c;
  };
  const setSpeed = (c, v) => {
    c.u = v;
    for (const w of c.W) w.w = v / w.R;
    const gi = P.gearsKmh.findIndex((g) => g / 3.6 > v * 1.04);
    c.gear = gi < 0 ? P.gearsKmh.length : gi + 1;
    c.rpm = P.rpmMax * 0.8;
  };
  const lat = VS.map((v) => {
    const c = mk();
    setSpeed(c, v);
    let best = 0;
    for (let k = 0; k < 400; k++) {
      const thr = Math.max(0, Math.min(1, (v - c.u) * 0.6 + 0.3));
      c.step(dt, { thr, brk: 0, steer: 1, pad: false }, surf, surf, 0);
      if (k > 250) best = Math.max(best, Math.abs(c.ay));
    }
    return best;
  });
  const brk = new Float32Array(VS.length), acc = new Float32Array(VS.length);
  {
    const c = mk();
    setSpeed(c, 100);
    const sum = new Float32Array(VS.length), n = new Float32Array(VS.length);
    for (let k = 0; k < 4e3 && c.u > 12; k++) {
      c.step(dt, { thr: 0, brk: 1, steer: 0 }, surf, surf, 0);
      if (k > 40) {
        const b = Math.round((c.u - 15) / 5);
        if (b >= 0 && b < VS.length) {
          sum[b] += -c.ax;
          n[b]++;
        }
      }
    }
    for (let b = 0; b < VS.length; b++) brk[b] = n[b] ? sum[b] / n[b] : 0;
    for (let b = 1; b < VS.length; b++) if (!brk[b]) brk[b] = brk[b - 1];
    for (let b = VS.length - 2; b >= 0; b--) if (!brk[b]) brk[b] = brk[b + 1];
  }
  {
    const c = mk();
    setSpeed(c, 12);
    c.gear = 1;
    const sum = new Float32Array(VS.length), n = new Float32Array(VS.length);
    for (let k = 0; k < 6e3; k++) {
      c.step(dt, { thr: 1, brk: 0, steer: 0 }, surf, surf, 0);
      const b = Math.round((c.u - 15) / 5);
      if (b >= 0 && b < VS.length) {
        sum[b] += c.ax;
        n[b]++;
      }
    }
    for (let b = 0; b < VS.length; b++) acc[b] = n[b] ? Math.max(0.2, sum[b] / n[b]) : 0.2;
  }
  const look2 = (arr, v) => {
    const f = Math.max(0, Math.min(VS.length - 1.001, (v - 15) / 5)), i = Math.floor(f), t = f - i;
    return arr[i] * (1 - t) + arr[i + 1] * t;
  };
  const cal = { lat: (v) => look2(lat, v), brk: (v) => look2(brk, v), acc: (v) => look2(acc, v), table: { VS, lat, brk: Array.from(brk), acc: Array.from(acc) } };
  calCache.set(key, cal);
  return cal;
}
function racingPhases(rl, P, geo, k = 0.96) {
  const { K, ds, N } = rl, cal = calibrate(P, geo), VTOP = 95;
  const vmax2 = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const kap = K[i];
    if (kap < 1e-4) {
      vmax2[i] = VTOP;
      continue;
    }
    let lo = 5, hi = VTOP;
    for (let it = 0; it < 30; it++) {
      const m = (lo + hi) / 2;
      if (m * m * kap <= cal.lat(m) * k) lo = m;
      else hi = m;
    }
    vmax2[i] = lo;
  }
  const ell = (v2, kap) => {
    const r = v2 * v2 * kap / Math.max(1, cal.lat(v2) * k);
    return Math.sqrt(Math.max(0.05, 1 - r * r));
  };
  const v = Float32Array.from(vmax2);
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) {
    const i1 = (i + 1) % N;
    v[i1] = Math.min(v[i1], Math.sqrt(v[i] * v[i] + 2 * cal.acc(v[i]) * ell(v[i], K[i]) * ds[i]));
  }
  for (let pass = 0; pass < 2; pass++) for (let i = N - 1; i >= 0; i--) {
    const i1 = (i + 1) % N;
    v[i] = Math.min(v[i], Math.sqrt(v[i1] * v[i1] + 2 * cal.brk(v[i1]) * 0.9 * ell(v[i1], K[i1]) * ds[i]));
  }
  const ph = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const dv = v[(i + 1) % N] - v[i];
    ph[i] = dv < -0.03 ? 2 : v[i] >= vmax2[i] - 0.4 && vmax2[i] < VTOP - 2 || dv < 0.01 && v[i] < VTOP - 2 ? 1 : 0;
  }
  const ph2 = Uint8Array.from(ph);
  for (let i = 0; i < N; i++) if (ph[i] === 2 && ph[(i - 1 + N) % N] !== 2) {
    const lead = Math.round(v[i] * 0.2);
    for (let q = 1; q <= lead; q++) ph2[(i - q + N) % N] = 2;
  }
  for (let i = 0; i < N; i++) {
    const p0 = ph2[(i - 1 + N) % N];
    if (ph2[i] !== p0) {
      let run = 0;
      while (run < 5 && ph2[(i + run) % N] === ph2[i]) run++;
      if (run < 5) for (let q = 0; q < run; q++) ph2[(i + q) % N] = p0;
    }
  }
  return { ph: ph2, v, vmax: vmax2 };
}
function racingLineMesh(rl, ph, fogPatch2) {
  const { X, Z, Y, N } = rl, W = 0.38;
  const pos = new Float32Array(N * 2 * 3), col = new Float32Array(N * 2 * 3), idx = [];
  const cols = [new THREE4.Color("#2ad12a"), new THREE4.Color("#ffd21a"), new THREE4.Color("#ee2a1c")];
  for (let i = 0; i < N; i++) {
    const a = (i - 1 + N) % N, b = (i + 1) % N;
    let tx = X[b] - X[a], tz = Z[b] - Z[a];
    const l = Math.hypot(tx, tz) || 1;
    tx /= l;
    tz /= l;
    const y = Y[i] + 0.06;
    pos.set([X[i] - tz * W, y, Z[i] + tx * W, X[i] + tz * W, y, Z[i] - tx * W], i * 6);
    const c = cols[ph[i]];
    col.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
    if (i % 5 !== 4) {
      const i1 = (i + 1) % N;
      idx.push(i * 2, i1 * 2, i * 2 + 1, i * 2 + 1, i1 * 2, i1 * 2 + 1);
    }
  }
  const g = new THREE4.BufferGeometry();
  g.setAttribute("position", new THREE4.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE4.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeBoundingSphere();
  const m = fogPatch2(new THREE4.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.82, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1, side: THREE4.DoubleSide, toneMapped: false }));
  const mesh = new THREE4.Mesh(g, m);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  return mesh;
}

// src/js/tracks.json
var tracks_default = { desert: [[-401, 192], [-404.9, 185], [-408.7, 177.9], [-412.5, 170.9], [-416.4, 163.9], [-420.2, 156.9], [-424.1, 149.8], [-427.9, 142.8], [-431.7, 135.8], [-435.6, 128.7], [-439.4, 121.7], [-443.3, 114.7], [-447.1, 107.7], [-450.9, 100.6], [-454.8, 93.6], [-458.6, 86.6], [-462.4, 79.6], [-466.3, 72.5], [-470.1, 65.5], [-474, 58.5], [-477.8, 51.5], [-481.6, 44.4], [-485.5, 37.4], [-489.3, 30.4], [-493.2, 23.3], [-497, 16.3], [-500.8, 9.3], [-504.7, 2.3], [-508.5, -4.8], [-512.3, -11.8], [-516.2, -18.8], [-520, -25.8], [-523.9, -32.9], [-527.7, -39.9], [-531.5, -46.9], [-535.4, -53.9], [-539.2, -61], [-543.1, -68], [-546.9, -75], [-550.7, -82], [-554.6, -89.1], [-558.5, -96.1], [-562.3, -103.1], [-566.2, -110.1], [-570, -117.1], [-573.9, -124.1], [-577.8, -131.1], [-581.6, -138.1], [-585.5, -145.2], [-589.4, -152.2], [-593.2, -159.2], [-597, -166.2], [-600.7, -173.3], [-604.3, -180.5], [-607.6, -187.8], [-610.6, -195.2], [-613, -202.9], [-614.8, -210.7], [-615.8, -218.6], [-615.9, -226.6], [-615, -234.5], [-613.1, -242.3], [-610, -249.7], [-606, -256.6], [-601, -262.9], [-595.2, -268.3], [-588.7, -273], [-581.5, -276.6], [-574, -279.3], [-566.1, -280.8], [-558.2, -281.3], [-550.2, -280.8], [-542.3, -279.3], [-534.7, -277], [-527.2, -274], [-520, -270.6], [-512.9, -266.9], [-505.9, -263], [-499, -258.9], [-492.1, -254.8], [-485.3, -250.7], [-478.4, -246.5], [-471.6, -242.4], [-464.7, -238.2], [-457.9, -234.1], [-451, -229.9], [-444.2, -225.8], [-437.3, -221.6], [-430.5, -217.5], [-423.6, -213.3], [-416.7, -209.3], [-409.8, -205.3], [-402.8, -201.4], [-395.6, -197.8], [-388.3, -194.6], [-380.8, -191.9], [-373, -189.8], [-365.1, -188.5], [-357.1, -188.2], [-349.2, -188.9], [-341.4, -190.6], [-333.9, -193.4], [-326.8, -197.2], [-320.4, -202], [-314.7, -207.6], [-309.8, -213.9], [-305.8, -220.8], [-302.7, -228.2], [-300.3, -235.8], [-298.7, -243.7], [-297.7, -251.6], [-297.2, -259.6], [-296.9, -267.6], [-296.9, -275.6], [-297, -283.6], [-297.1, -291.6], [-297.3, -299.6], [-297.5, -307.6], [-297.7, -315.6], [-297.9, -323.6], [-298.1, -331.6], [-298.2, -339.7], [-298.4, -347.7], [-298.4, -355.7], [-298.2, -363.7], [-297.9, -371.7], [-297.2, -379.6], [-296.1, -387.6], [-294.5, -395.4], [-292.4, -403.1], [-289.7, -410.7], [-286.5, -418], [-282.7, -425.1], [-278.5, -431.9], [-273.9, -438.4], [-269.1, -444.8], [-264, -451], [-258.8, -457.1], [-253.5, -463.1], [-248.2, -469.1], [-242.9, -475.1], [-237.5, -481], [-232.1, -487], [-226.8, -492.9], [-221.4, -498.8], [-216, -504.8], [-210.7, -510.7], [-205.3, -516.7], [-200, -522.6], [-194.6, -528.6], [-189.2, -534.5], [-183.9, -540.5], [-178.5, -546.4], [-173.1, -552.3], [-167.8, -558.3], [-162.4, -564.2], [-157.1, -570.2], [-151.7, -576.1], [-146.3, -582.1], [-141, -588], [-135.6, -594], [-130.2, -599.9], [-124.9, -605.8], [-119.5, -611.8], [-114.1, -617.7], [-108.8, -623.7], [-103.4, -629.6], [-98.1, -635.6], [-92.7, -641.5], [-87.3, -647.4], [-81.9, -653.4], [-76.5, -659.2], [-71, -665], [-65.3, -670.7], [-59.5, -676.2], [-53.3, -681.3], [-46.8, -686], [-39.9, -690], [-32.6, -693.3], [-24.9, -695.6], [-17.1, -696.9], [-9.1, -697.3], [-1.1, -696.5], [6.7, -694.8], [14.3, -692.2], [21.5, -688.8], [28.4, -684.7], [34.9, -680.1], [41.2, -675.1], [47.3, -669.9], [53.3, -664.6], [59.1, -659.1], [64.9, -653.5], [70.5, -647.9], [76.1, -642.1], [81.4, -636.1], [86.3, -629.8], [90.7, -623.1], [94.5, -616], [97.4, -608.6], [99.3, -600.8], [100.2, -592.9], [100.1, -584.9], [98.9, -577], [96.8, -569.3], [93.7, -561.8], [90, -554.8], [85.7, -548], [81, -541.5], [76.1, -535.2], [70.9, -529.1], [65.6, -523.1], [60.3, -517.1], [54.9, -511.2], [49.5, -505.3], [44.1, -499.3], [38.8, -493.4], [33.4, -487.5], [28, -481.6], [22.6, -475.7], [17.2, -469.7], [11.8, -463.8], [6.4, -457.9], [1, -452], [-4.4, -446], [-9.7, -440.1], [-15.1, -434.2], [-20.5, -428.3], [-25.8, -422.3], [-31.1, -416.2], [-36.2, -410.1], [-41, -403.7], [-45.4, -397], [-49, -389.8], [-51.6, -382.3], [-52.5, -374.3], [-51.4, -366.4], [-47.9, -359.3], [-42.4, -353.5], [-35.4, -349.7], [-27.7, -347.8], [-19.7, -347.5], [-11.7, -348.4], [-3.9, -350.2], [3.7, -352.6], [11.3, -355.2], [18.8, -358.1], [26.2, -361], [33.7, -363.9], [41.1, -366.9], [48.5, -369.9], [56, -372.9], [63.4, -375.8], [70.8, -378.8], [78.3, -381.8], [85.7, -384.8], [93.1, -387.7], [100.6, -390.7], [108, -393.7], [115.4, -396.7], [122.9, -399.6], [130.3, -402.6], [137.7, -405.6], [145.2, -408.6], [152.6, -411.5], [160, -414.5], [167.5, -417.5], [174.9, -420.5], [182.3, -423.5], [189.8, -426.4], [197.2, -429.4], [204.7, -432.3], [212.1, -435.2], [219.6, -438], [227.2, -440.6], [234.8, -443], [242.6, -445], [250.5, -446.5], [258.4, -447.3], [266.4, -447.3], [274.4, -446.4], [282.2, -444.5], [289.6, -441.6], [296.6, -437.7], [303, -432.9], [308.5, -427.1], [313.2, -420.6], [316.9, -413.5], [319.5, -406], [321.1, -398.1], [321.7, -390.2], [321.1, -382.2], [319.4, -374.4], [316.8, -366.8], [313.3, -359.6], [309, -352.8], [304.2, -346.4], [299, -340.3], [293.6, -334.5], [288, -328.7], [282.5, -322.9], [277, -317.1], [271.6, -311.2], [266.4, -305.1], [261.4, -298.9], [256.5, -292.5], [251.8, -286.1], [247.2, -279.5], [242.9, -272.7], [238.8, -265.9], [234.9, -258.9], [231.2, -251.8], [227.7, -244.6], [224.4, -237.3], [221.4, -229.9], [218.5, -222.4], [215.9, -214.8], [213.4, -207.2], [211, -199.6], [208.8, -191.9], [206.7, -184.1], [204.5, -176.4], [202.2, -168.8], [199.5, -161.2], [196.4, -153.9], [192.6, -146.8], [188.2, -140.1], [183.1, -134], [177.3, -128.5], [170.9, -123.7], [164, -119.6], [156.8, -116.1], [149.4, -113.1], [141.8, -110.5], [134.1, -108.2], [126.4, -106.1], [118.7, -104], [110.9, -102.1], [103.1, -100.2], [95.3, -98.3], [87.6, -96.4], [79.8, -94.5], [72, -92.6], [64.2, -90.7], [56.5, -88.7], [48.7, -86.7], [41, -84.5], [33.4, -82], [25.9, -79.2], [18.7, -75.8], [11.8, -71.6], [5.6, -66.6], [0.2, -60.7], [-4, -54], [-7, -46.5], [-8.5, -38.7], [-8.7, -30.7], [-7.5, -22.8], [-5.2, -15.1], [-1.9, -7.8], [2.2, -1], [6.9, 5.5], [12, 11.7], [17.4, 17.6], [23.1, 23.3], [28.9, 28.8], [34.9, 34.1], [41, 39.2], [47.3, 44.2], [53.6, 49.1], [60.1, 53.8], [66.6, 58.4], [73.3, 62.9], [80, 67.2], [86.9, 71.3], [93.8, 75.3], [100.9, 79.1], [108, 82.7], [115.3, 86.1], [122.6, 89.3], [130, 92.3], [137.5, 95.1], [145.1, 97.7], [152.8, 100.1], [160.4, 102.3], [168.2, 104.4], [176, 106.2], [183.8, 107.9], [191.7, 109.3], [199.6, 110.6], [207.5, 111.7], [215.5, 112.6], [223.5, 113.3], [231.5, 113.7], [239.5, 113.9], [247.5, 113.9], [255.5, 113.7], [263.5, 113.2], [271.4, 112.7], [279.4, 112], [287.4, 111.3], [295.4, 110.5], [303.3, 109.6], [311.3, 108.8], [319.2, 107.9], [327.2, 107], [335.2, 106.2], [343.1, 105.3], [351.1, 104.4], [359, 103.5], [367, 102.6], [375, 101.7], [382.9, 100.9], [390.9, 100], [398.8, 99.1], [406.8, 98.2], [414.7, 97.3], [422.7, 96.4], [430.7, 95.6], [438.6, 94.7], [446.6, 93.8], [454.5, 93], [462.5, 92.2], [470.5, 91.5], [478.5, 91], [486.5, 90.7], [494.5, 90.9], [502.5, 91.5], [510.4, 92.7], [518.2, 94.6], [525.7, 97.1], [533.1, 100.3], [540.1, 104.1], [546.8, 108.5], [553.2, 113.4], [559.1, 118.8], [564.6, 124.6], [569.7, 130.7], [574.4, 137.2], [578.9, 143.8], [583.1, 150.6], [587.2, 157.5], [591.2, 164.5], [595, 171.5], [598.9, 178.5], [602.7, 185.6], [606.4, 192.6], [610.1, 199.8], [613.6, 206.9], [617, 214.2], [620, 221.6], [622.7, 229.2], [624.7, 236.9], [626.1, 244.8], [626.6, 252.8], [626.2, 260.8], [625, 268.7], [623.1, 276.4], [620.4, 284], [617.2, 291.3], [613.7, 298.5], [609.9, 305.5], [605.9, 312.5], [601.8, 319.4], [597.6, 326.2], [593.4, 333], [589.2, 339.8], [585, 346.6], [580.8, 353.4], [576.5, 360.2], [572.3, 367], [568.1, 373.8], [563.8, 380.6], [559.5, 387.3], [555, 394], [550.3, 400.5], [545.4, 406.8], [540, 412.7], [534.1, 418.2], [527.7, 422.9], [520.8, 426.9], [513.4, 430], [505.7, 432.2], [497.8, 433.5], [489.8, 434.1], [481.8, 434], [473.8, 433.3], [465.9, 432.4], [458, 431.1], [450.1, 429.7], [442.2, 428.3], [434.4, 426.7], [426.5, 425.1], [418.7, 423.6], [410.8, 422], [403, 420.4], [395.1, 418.8], [387.3, 417.2], [379.4, 415.7], [371.6, 414.1], [363.7, 412.5], [355.9, 410.9], [348, 409.3], [340.2, 407.7], [332.3, 406.2], [324.5, 404.6], [316.6, 403], [308.8, 401.4], [300.9, 399.8], [293.1, 398.2], [285.2, 396.7], [277.4, 395.2], [269.5, 393.7], [261.6, 392.4], [253.7, 391.3], [245.7, 390.5], [237.7, 390.3], [229.7, 390.6], [221.8, 391.7], [214, 393.7], [206.6, 396.6], [199.6, 400.4], [193.1, 405.2], [187.2, 410.6], [181.9, 416.6], [177.1, 423], [172.7, 429.7], [168.6, 436.5], [164.7, 443.5], [160.9, 450.6], [157.2, 457.7], [153.5, 464.8], [149.8, 471.9], [146.2, 479], [142.5, 486.1], [138.8, 493.3], [135.2, 500.4], [131.5, 507.5], [127.9, 514.6], [124.2, 521.7], [120.5, 528.9], [116.9, 536], [113.2, 543.1], [109.6, 550.2], [105.9, 557.3], [102.2, 564.5], [98.6, 571.6], [94.9, 578.7], [91.3, 585.8], [87.6, 592.9], [83.9, 600.1], [80.3, 607.2], [76.6, 614.3], [72.9, 621.4], [69.3, 628.6], [65.6, 635.7], [62, 642.8], [58.3, 649.9], [54.6, 657], [51, 664.2], [47.3, 671.3], [43.7, 678.4], [40, 685.5], [36.3, 692.6], [32.7, 699.7], [29, 706.8], [25.2, 713.9], [21.4, 720.9], [17.4, 727.9], [13.1, 734.7], [8.5, 741.2], [3.5, 747.5], [-2, 753.3], [-8.1, 758.4], [-14.8, 762.8], [-22.1, 766.2], [-29.7, 768.7], [-37.6, 770], [-45.6, 770.2], [-53.5, 769.4], [-61.3, 767.5], [-68.7, 764.5], [-75.7, 760.6], [-82.2, 755.9], [-88, 750.5], [-93.4, 744.5], [-98.3, 738.2], [-102.8, 731.5], [-107, 724.8], [-111.1, 717.9], [-115.1, 710.9], [-119, 703.9], [-122.9, 696.9], [-126.7, 689.9], [-130.6, 682.9], [-134.4, 675.9], [-138.3, 668.9], [-142.2, 661.9], [-146, 654.8], [-149.9, 647.8], [-153.8, 640.8], [-157.6, 633.8], [-161.5, 626.8], [-165.4, 619.8], [-169.2, 612.8], [-173.1, 605.7], [-176.9, 598.7], [-180.8, 591.7], [-184.7, 584.7], [-188.5, 577.7], [-192.4, 570.7], [-196.3, 563.7], [-200.1, 556.7], [-204, 549.6], [-207.9, 542.6], [-211.7, 535.6], [-215.6, 528.6], [-219.4, 521.6], [-223.3, 514.6], [-227.2, 507.6], [-231, 500.6], [-234.9, 493.5], [-238.8, 486.5], [-242.6, 479.5], [-246.5, 472.5], [-250.4, 465.5], [-254.2, 458.5], [-258.1, 451.5], [-261.9, 444.5], [-265.8, 437.4], [-269.7, 430.4], [-273.5, 423.4], [-277.4, 416.4], [-281.3, 409.4], [-285.1, 402.4], [-289, 395.4], [-292.9, 388.3], [-296.7, 381.3], [-300.6, 374.3], [-304.4, 367.3], [-308.3, 360.3], [-312.2, 353.3], [-316, 346.3], [-319.9, 339.3], [-323.8, 332.2], [-327.6, 325.2], [-331.5, 318.2], [-335.4, 311.2], [-339.2, 304.2], [-343.1, 297.2], [-346.9, 290.2], [-350.8, 283.2], [-354.7, 276.1], [-358.5, 269.1], [-362.4, 262.1], [-366.3, 255.1], [-370.1, 248.1], [-374, 241.1], [-377.8, 234.1], [-381.7, 227.1], [-385.6, 220], [-389.4, 213], [-393.3, 206], [-397.1, 199]], jungle: [[-243.1, 320.1], [-241.2, 327.8], [-239.2, 335.6], [-237.2, 343.3], [-235.2, 351.1], [-233.2, 358.8], [-231.2, 366.6], [-229.2, 374.3], [-227.2, 382.1], [-225.2, 389.8], [-223.2, 397.6], [-221.2, 405.3], [-219.2, 413.1], [-217.2, 420.8], [-215.2, 428.6], [-213.2, 436.3], [-211.2, 444.1], [-209.2, 451.8], [-207.2, 459.5], [-205.2, 467.3], [-203.2, 475], [-201.2, 482.8], [-199.2, 490.5], [-197.2, 498.3], [-195.2, 506], [-193.2, 513.8], [-191.2, 521.5], [-189.2, 529.3], [-187.2, 537], [-185.2, 544.8], [-183.1, 552.5], [-181.1, 560.3], [-179.1, 568], [-177, 575.7], [-174.8, 583.4], [-172.5, 591.1], [-170, 598.7], [-167.2, 606.2], [-164.1, 613.6], [-160.5, 620.7], [-156.5, 627.6], [-151.9, 634.2], [-146.6, 640.2], [-140.6, 645.5], [-133.9, 649.8], [-126.4, 652.7], [-118.6, 654.1], [-110.6, 653.9], [-102.8, 652.2], [-95.4, 649.2], [-88.4, 645.3], [-81.8, 640.8], [-75.5, 635.8], [-69.4, 630.6], [-63.3, 625.4], [-57.1, 620.4], [-50.5, 615.9], [-43.5, 612.1], [-36, 609.4], [-28.1, 607.9], [-20.1, 607.9], [-12.2, 609.1], [-4.5, 611.3], [3, 614.2], [10.3, 617.5], [17.5, 620.9], [24.7, 624.3], [32, 627.6], [39.4, 630.8], [46.9, 633.6], [54.5, 636.1], [62.2, 638.3], [70, 640], [77.9, 641.4], [85.8, 642.4], [93.8, 643], [101.8, 643.2], [109.8, 643], [117.7, 642.3], [125.7, 641.3], [133.6, 639.9], [141.3, 638.1], [149, 635.9], [156.6, 633.3], [164, 630.3], [171.3, 627], [178.4, 623.2], [185.3, 619.2], [192, 614.7], [198.4, 610], [204.6, 605], [210.6, 599.7], [216.3, 594.1], [221.8, 588.2], [227, 582.1], [231.8, 575.8], [236.4, 569.2], [240.8, 562.5], [244.8, 555.6], [248.5, 548.5], [251.9, 541.3], [255.1, 533.9], [258.1, 526.5], [260.8, 519], [263.5, 511.4], [265.9, 503.8], [268.4, 496.2], [270.7, 488.5], [273.1, 480.9], [275.4, 473.2], [277.7, 465.5], [280, 457.9], [282.3, 450.2], [284.6, 442.5], [286.8, 434.9], [289, 427.2], [291.2, 419.5], [293.3, 411.7], [295.3, 404], [297.4, 396.3], [299.4, 388.5], [301.4, 380.8], [303.4, 373], [305.4, 365.3], [307.4, 357.5], [309.4, 349.8], [311.3, 342], [313.3, 334.3], [315.3, 326.5], [317.3, 318.8], [319.3, 311], [321.3, 303.3], [323.3, 295.5], [325.2, 287.7], [327.2, 280], [329.1, 272.2], [331.1, 264.5], [333, 256.7], [334.9, 248.9], [336.8, 241.1], [338.7, 233.4], [340.6, 225.6], [342.6, 217.8], [344.5, 210.1], [346.4, 202.3], [348.3, 194.5], [350.2, 186.8], [352.2, 179], [354.1, 171.2], [356.1, 163.5], [358.1, 155.7], [360.1, 148], [362.1, 140.2], [364.1, 132.5], [366.1, 124.7], [368.1, 117], [370.2, 109.3], [372.2, 101.5], [374.3, 93.8], [376.3, 86], [378.3, 78.3], [380.4, 70.6], [382.4, 62.8], [384.4, 55.1], [386.5, 47.3], [388.5, 39.6], [390.6, 31.9], [392.6, 24.1], [394.6, 16.4], [396.7, 8.7], [398.7, 0.9], [400.7, -6.8], [402.8, -14.6], [404.8, -22.3], [406.9, -30], [408.9, -37.8], [410.9, -45.5], [413, -53.3], [415, -61], [417, -68.7], [419.1, -76.5], [421.1, -84.2], [423.1, -92], [425.2, -99.7], [427.2, -107.4], [429.3, -115.2], [431.3, -122.9], [433.2, -130.7], [435.1, -138.5], [436.9, -146.3], [438.3, -154.1], [439.4, -162.1], [439.9, -170], [439.7, -178], [438.5, -185.9], [436, -193.6], [432.4, -200.7], [427.6, -207], [421.8, -212.6], [415.3, -217.2], [408.2, -221], [400.9, -224.1], [393.3, -226.7], [385.6, -228.9], [377.8, -230.9], [370, -232.6], [362.2, -234.3], [354.4, -235.9], [346.5, -237.4], [338.6, -238.8], [330.7, -240.1], [322.8, -241.3], [314.9, -242.3], [306.9, -243.1], [298.9, -243.5], [290.9, -243.6], [282.9, -243.3], [275, -242.6], [267, -241.5], [259.2, -239.8], [251.5, -237.7], [243.9, -235.2], [236.5, -232.1], [229.3, -228.6], [222.3, -224.8], [215.5, -220.5], [209, -215.9], [202.6, -211.1], [196.5, -205.9], [190.7, -200.4], [185, -194.7], [179.6, -188.9], [174.3, -182.8], [169.2, -176.7], [164.2, -170.4], [159.3, -164.1], [154.4, -157.8], [149.5, -151.4], [144.7, -145], [139.9, -138.6], [135.2, -132.2], [130.4, -125.8], [125.6, -119.3], [120.9, -112.9], [116.1, -106.5], [111.4, -100], [106.6, -93.6], [101.9, -87.1], [97.2, -80.7], [92.5, -74.2], [87.8, -67.7], [83.2, -61.2], [78.5, -54.7], [73.9, -48.1], [69.3, -41.6], [64.6, -35.1], [60, -28.5], [55.4, -22], [50.8, -15.5], [46.2, -8.9], [41.6, -2.4], [36.9, 4.1], [32.3, 10.7], [27.6, 17.2], [22.9, 23.6], [18.2, 30.1], [13.4, 36.5], [8.6, 42.9], [3.8, 49.3], [-1, 55.7], [-5.8, 62.1], [-10.6, 68.6], [-15.3, 75], [-20.1, 81.4], [-24.9, 87.8], [-29.7, 94.2], [-34.6, 100.6], [-39.6, 106.8], [-44.8, 112.8], [-50.4, 118.6], [-56.3, 124], [-62.6, 128.9], [-69.3, 133.2], [-76.5, 136.8], [-84, 139.6], [-91.7, 141.7], [-99.6, 143.1], [-107.5, 143.9], [-115.5, 144.2], [-123.5, 144], [-131.5, 143.2], [-139.4, 142], [-147.2, 140.4], [-155, 138.3], [-162.5, 135.7], [-169.9, 132.7], [-177.1, 129.2], [-184.1, 125.2], [-190.8, 120.8], [-197, 115.8], [-202.8, 110.3], [-208.1, 104.3], [-212.7, 97.8], [-216.8, 90.9], [-220.2, 83.7], [-223.2, 76.2], [-225.8, 68.7], [-228.1, 61], [-230.2, 53.3], [-232.1, 45.5], [-233.9, 37.7], [-235.6, 29.9], [-237.2, 22], [-238.7, 14.2], [-240.1, 6.3], [-241.4, -1.6], [-242.6, -9.5], [-243.6, -17.4], [-244.5, -25.4], [-245.1, -33.4], [-245.3, -41.4], [-245.1, -49.4], [-244.2, -57.3], [-242.4, -65.1], [-239.3, -72.5], [-234.7, -79], [-228.6, -84.1], [-221.3, -87.3], [-213.3, -88.3], [-205.4, -87.5], [-197.7, -85.4], [-190.3, -82.4], [-183.1, -78.8], [-176, -75.1], [-168.9, -71.5], [-161.6, -68.2], [-154.1, -65.4], [-146.3, -63.6], [-138.4, -62.8], [-130.4, -63.2], [-122.6, -65.1], [-115.2, -68.2], [-108.6, -72.6], [-102.7, -78.1], [-97.9, -84.4], [-94.2, -91.5], [-91.8, -99.2], [-90.7, -107.1], [-90.8, -115.1], [-92.2, -122.9], [-94.7, -130.5], [-98, -137.8], [-102.1, -144.7], [-106.7, -151.3], [-111.6, -157.5], [-116.9, -163.5], [-122.3, -169.4], [-127.9, -175.2], [-133.5, -180.9], [-139, -186.7], [-144.5, -192.5], [-149.9, -198.4], [-155.2, -204.4], [-160.3, -210.6], [-165.2, -216.9], [-169.8, -223.5], [-174, -230.2], [-177.9, -237.2], [-181.4, -244.4], [-184.6, -251.8], [-187.4, -259.3], [-189.8, -266.9], [-192, -274.6], [-193.9, -282.4], [-195.5, -290.2], [-196.9, -298.1], [-197.9, -306], [-198.5, -314], [-198.5, -322], [-197.6, -330], [-195.5, -337.7], [-191.8, -344.7], [-186.2, -350.3], [-178.9, -353.5], [-170.9, -353.7], [-163.2, -351.5], [-156.2, -347.7], [-149.8, -342.9], [-143.8, -337.6], [-138.2, -331.9], [-132.7, -326.1], [-127.3, -320.2], [-122, -314.2], [-116.6, -308.2], [-111.3, -302.3], [-105.9, -296.4], [-100.5, -290.5], [-95, -284.6], [-89.4, -278.9], [-83.6, -273.4], [-77.6, -268.1], [-71.4, -263.1], [-64.8, -258.5], [-58, -254.3], [-50.9, -250.7], [-43.5, -247.6], [-35.9, -245], [-28.2, -243.1], [-20.3, -241.6], [-12.3, -240.7], [-4.4, -240.3], [3.6, -240.4], [11.6, -241.1], [19.5, -242.3], [27.4, -244], [35, -246.3], [42.5, -249.1], [49.8, -252.5], [56.8, -256.3], [63.5, -260.7], [69.8, -265.6], [75.9, -270.8], [81.6, -276.4], [87, -282.3], [92.1, -288.4], [97, -294.8], [101.7, -301.2], [106.3, -307.8], [110.7, -314.5], [115.1, -321.2], [119.4, -327.9], [123.7, -334.7], [128, -341.4], [132.2, -348.3], [136.4, -355.1], [140.5, -361.9], [144.6, -368.8], [148.8, -375.6], [152.9, -382.5], [157, -389.3], [161.2, -396.2], [165.3, -403], [169.5, -409.9], [173.6, -416.7], [177.8, -423.6], [181.8, -430.5], [185.7, -437.5], [189.2, -444.6], [192.3, -452], [194.5, -459.7], [195.5, -467.6], [195, -475.6], [192.6, -483.2], [188.6, -490.1], [183.2, -496.1], [177.1, -501.1], [170.3, -505.5], [163.3, -509.3], [156, -512.7], [148.7, -515.8], [141.3, -518.8], [133.8, -521.7], [126.3, -524.5], [118.8, -527.3], [111.3, -530], [103.7, -532.6], [96.1, -535], [88.4, -537.2], [80.6, -539.1], [72.7, -540.6], [64.8, -541.6], [56.8, -542.1], [48.8, -542.2], [40.8, -541.8], [32.9, -541.1], [24.9, -540.2], [17, -539], [9.1, -537.7], [1.2, -536.2], [-6.6, -534.7], [-14.5, -533], [-22.3, -531.3], [-30.1, -529.4], [-37.8, -527.5], [-45.5, -525.4], [-53.2, -523.1], [-60.8, -520.6], [-68.4, -517.9], [-75.9, -515.1], [-83.3, -512.2], [-90.7, -509.1], [-98, -506], [-105.4, -502.7], [-112.6, -499.4], [-119.8, -495.9], [-127, -492.3], [-134.1, -488.6], [-141.1, -484.8], [-148.1, -480.9], [-155, -476.8], [-161.7, -472.5], [-168.4, -468], [-174.8, -463.3], [-181.2, -458.4], [-187.3, -453.3], [-193.3, -447.9], [-199, -442.4], [-204.5, -436.6], [-209.8, -430.6], [-214.8, -424.3], [-219.5, -417.9], [-223.9, -411.2], [-228, -404.3], [-231.7, -397.2], [-235.2, -390], [-238.3, -382.6], [-241.2, -375.2], [-243.9, -367.6], [-246.4, -360], [-248.8, -352.4], [-251, -344.7], [-253.2, -337], [-255.2, -329.3], [-257.2, -321.5], [-259.2, -313.8], [-261.1, -306], [-262.9, -298.2], [-264.7, -290.4], [-266.5, -282.6], [-268.2, -274.8], [-269.8, -266.9], [-271.4, -259.1], [-272.9, -251.2], [-274.4, -243.4], [-275.8, -235.5], [-277.3, -227.6], [-278.8, -219.8], [-280.4, -211.9], [-282, -204.1], [-283.8, -196.3], [-285.6, -188.5], [-287.5, -180.7], [-289.4, -173], [-291.4, -165.2], [-293.3, -157.4], [-295.2, -149.7], [-297.1, -141.9], [-299, -134.1], [-300.9, -126.3], [-302.7, -118.5], [-304.6, -110.8], [-306.5, -103], [-308.3, -95.2], [-310, -87.4], [-311.6, -79.5], [-312.9, -71.6], [-314.1, -63.7], [-315, -55.8], [-315.6, -47.8], [-316, -39.8], [-316.2, -31.8], [-316.2, -23.8], [-316.1, -15.8], [-315.7, -7.8], [-315.2, 0.2], [-314.5, 8.2], [-313.7, 16.1], [-312.6, 24.1], [-311.4, 32], [-310.1, 39.9], [-308.6, 47.7], [-307, 55.6], [-305.3, 63.4], [-303.5, 71.2], [-301.6, 79], [-299.7, 86.7], [-297.8, 94.5], [-295.9, 102.3], [-294, 110.1], [-292.1, 117.8], [-290.2, 125.6], [-288.3, 133.4], [-286.4, 141.2], [-284.6, 148.9], [-282.7, 156.7], [-280.8, 164.5], [-279, 172.3], [-277.1, 180.1], [-275.3, 187.9], [-273.4, 195.7], [-271.6, 203.4], [-269.7, 211.2], [-267.9, 219], [-266, 226.8], [-264.2, 234.6], [-262.3, 242.4], [-260.4, 250.1], [-258.5, 257.9], [-256.6, 265.7], [-254.7, 273.5], [-252.8, 281.2], [-250.9, 289], [-249, 296.8], [-247, 304.5], [-245.1, 312.3]], forest: [[237.7, 351.1], [229.9, 353.2], [222.2, 355.2], [214.5, 357.3], [206.7, 359.4], [199, 361.4], [191.3, 363.5], [183.5, 365.5], [175.8, 367.6], [168, 369.7], [160.3, 371.8], [152.6, 373.8], [144.8, 375.9], [137.1, 378], [129.4, 380.1], [121.7, 382.2], [113.9, 384.3], [106.2, 386.4], [98.5, 388.5], [90.7, 390.6], [83, 392.7], [75.3, 394.8], [67.6, 396.9], [59.8, 399], [52.1, 401.1], [44.4, 403.2], [36.7, 405.3], [28.9, 407.4], [21.2, 409.5], [13.5, 411.6], [5.7, 413.7], [-2, 415.8], [-9.7, 417.8], [-17.5, 419.8], [-25.3, 421.6], [-33.1, 423.2], [-41, 424.5], [-49, 425.3], [-57, 425.3], [-64.9, 424.2], [-72.6, 421.9], [-79.7, 418.2], [-86.1, 413.5], [-91.9, 407.9], [-97.2, 401.9], [-102.1, 395.6], [-106.8, 389.1], [-111.4, 382.6], [-116, 376], [-120.7, 369.5], [-125.3, 363], [-130, 356.5], [-134.7, 350], [-139.4, 343.5], [-144.1, 337], [-148.8, 330.6], [-153.5, 324.1], [-158.2, 317.6], [-162.9, 311.1], [-167.5, 304.6], [-172.2, 298], [-176.8, 291.5], [-181.4, 284.9], [-186, 278.4], [-190.6, 271.8], [-195.1, 265.2], [-199.7, 258.6], [-204.2, 252], [-208.7, 245.4], [-213.1, 238.7], [-217.5, 232], [-221.9, 225.3], [-226.2, 218.6], [-230.5, 211.8], [-234.8, 205.1], [-239, 198.3], [-243.2, 191.5], [-247.4, 184.6], [-251.6, 177.8], [-255.8, 171], [-259.9, 164.1], [-264, 157.2], [-268.1, 150.3], [-272.1, 143.4], [-276.1, 136.5], [-280.1, 129.5], [-284, 122.5], [-287.9, 115.5], [-291.7, 108.5], [-295.4, 101.4], [-299.1, 94.3], [-302.7, 87.1], [-306.2, 80], [-309.7, 72.7], [-313.1, 65.5], [-316.5, 58.3], [-319.9, 51], [-323.2, 43.7], [-326.6, 36.4], [-329.9, 29.2], [-333.3, 21.9], [-336.6, 14.6], [-340, 7.3], [-343.3, 0.1], [-346.6, -7.2], [-350, -14.5], [-353.3, -21.8], [-356.7, -29], [-360.1, -36.3], [-363.5, -43.5], [-367, -50.7], [-370.5, -57.9], [-374.1, -65.1], [-377.7, -72.2], [-381.4, -79.3], [-385.3, -86.4], [-389.2, -93.3], [-393.3, -100.2], [-397.5, -107.1], [-401.8, -113.8], [-406.2, -120.5], [-410.7, -127.1], [-415.4, -133.6], [-420.1, -140.1], [-425, -146.4], [-429.9, -152.7], [-435, -158.9], [-440.1, -165.1], [-445.3, -171.2], [-450.5, -177.2], [-455.8, -183.2], [-461.2, -189.1], [-466.7, -195], [-472.2, -200.8], [-477.8, -206.6], [-483.4, -212.3], [-489, -218], [-494.6, -223.7], [-500.3, -229.4], [-505.9, -235.1], [-511.5, -240.7], [-517.2, -246.4], [-522.9, -252.1], [-528.5, -257.7], [-534.2, -263.4], [-539.8, -269.1], [-545.5, -274.8], [-551.1, -280.5], [-556.6, -286.2], [-562.1, -292.1], [-567.4, -298.1], [-572.4, -304.4], [-576.9, -311], [-580.5, -318.1], [-582.2, -325.9], [-580.6, -333.7], [-575.5, -339.8], [-568.7, -343.8], [-561.2, -346.6], [-553.4, -348.7], [-545.5, -350.2], [-537.6, -351.3], [-529.7, -352.3], [-521.7, -353.1], [-513.7, -353.8], [-505.7, -354.3], [-497.7, -354.8], [-489.7, -355.2], [-481.7, -355.5], [-473.7, -355.7], [-465.7, -355.9], [-457.7, -356], [-449.7, -356.1], [-441.7, -356.1], [-433.7, -356], [-425.7, -355.8], [-417.7, -355.5], [-409.7, -355.2], [-401.7, -354.7], [-393.7, -354.2], [-385.7, -353.6], [-377.8, -352.9], [-369.8, -352.1], [-361.8, -351.2], [-353.9, -350.2], [-345.9, -349.2], [-338, -348.1], [-330.1, -347], [-322.2, -345.8], [-314.3, -344.5], [-306.4, -343.2], [-298.5, -341.9], [-290.6, -340.5], [-282.7, -339.1], [-274.8, -337.7], [-266.9, -336.2], [-259.1, -334.8], [-251.2, -333.3], [-243.3, -331.8], [-235.5, -330.3], [-227.6, -328.7], [-219.7, -327.2], [-211.9, -325.7], [-204, -324.2], [-196.1, -322.7], [-188.3, -321.1], [-180.4, -319.6], [-172.6, -318.1], [-164.7, -316.6], [-156.8, -315.1], [-149, -313.6], [-141.1, -312.1], [-133.2, -310.6], [-125.4, -309.2], [-117.5, -307.8], [-109.6, -306.4], [-101.7, -305.1], [-93.8, -303.8], [-85.9, -302.6], [-77.9, -301.4], [-70, -300.3], [-62.1, -299.2], [-54.1, -298.2], [-46.2, -297.2], [-38.2, -296.2], [-30.3, -295.4], [-22.3, -294.6], [-14.3, -293.8], [-6.4, -293.1], [1.6, -292.6], [9.6, -292], [17.6, -291.6], [25.6, -291.1], [33.6, -290.7], [41.6, -290.4], [49.6, -290], [57.6, -289.7], [65.6, -289.3], [73.6, -289], [81.6, -288.7], [89.6, -288.3], [97.6, -288], [105.6, -287.6], [113.6, -287.2], [121.6, -286.8], [129.6, -286.3], [137.6, -285.6], [145.5, -284.7], [153.4, -283.5], [161.2, -281.7], [168.8, -279.2], [176, -275.7], [182.4, -270.9], [187.5, -264.7], [190.7, -257.4], [191.9, -249.5], [191.3, -241.6], [189.3, -233.8], [186.3, -226.4], [182.6, -219.3], [178.3, -212.5], [173.7, -206], [168.6, -199.8], [163.3, -193.8], [157.7, -188.1], [151.9, -182.6], [145.9, -177.3], [139.6, -172.4], [133.1, -167.7], [126.4, -163.3], [119.5, -159.2], [112.5, -155.4], [105.3, -151.9], [97.9, -148.8], [90.4, -145.9], [82.8, -143.3], [75.2, -141], [67.4, -139.1], [59.6, -137.4], [51.7, -136], [43.8, -134.8], [35.8, -134], [27.8, -133.5], [19.8, -133.3], [11.8, -133.3], [3.8, -133.6], [-4.2, -134.1], [-12.2, -134.8], [-20.1, -135.6], [-28.1, -136.6], [-36, -137.7], [-43.9, -138.8], [-51.9, -140], [-59.8, -141.2], [-67.7, -142.4], [-75.6, -143.7], [-83.5, -145], [-91.4, -146.2], [-99.3, -147.5], [-107.2, -148.7], [-115.1, -150], [-123.1, -151.1], [-131, -152.2], [-138.9, -153.2], [-146.9, -154], [-154.9, -154.5], [-162.9, -154.7], [-170.9, -154.4], [-178.9, -153.7], [-186.7, -152.3], [-194.5, -150.2], [-202, -147.3], [-209.1, -143.8], [-215.9, -139.5], [-222.1, -134.5], [-227.8, -128.8], [-232.8, -122.6], [-237.1, -115.9], [-240.7, -108.7], [-243.5, -101.2], [-245.5, -93.4], [-246.7, -85.5], [-247.2, -77.5], [-246.9, -69.5], [-245.9, -61.6], [-244.3, -53.8], [-242.1, -46.1], [-239.5, -38.5], [-236.4, -31.1], [-233.1, -23.8], [-229.5, -16.6], [-225.8, -9.5], [-222, -2.5], [-218.1, 4.5], [-214.2, 11.5], [-210.2, 18.4], [-206.2, 25.4], [-202.3, 32.3], [-198.3, 39.3], [-194.3, 46.2], [-190.2, 53.1], [-186.1, 60], [-181.8, 66.8], [-177.4, 73.5], [-172.8, 80], [-168, 86.4], [-162.8, 92.4], [-157.1, 98.2], [-151.1, 103.4], [-144.6, 108.1], [-137.7, 112.1], [-130.4, 115.4], [-122.8, 117.8], [-114.9, 119.4], [-107, 120.1], [-99, 119.9], [-91, 118.9], [-83.3, 117], [-75.7, 114.3], [-68.5, 110.9], [-61.6, 106.8], [-55, 102.2], [-48.8, 97.2], [-42.8, 91.9], [-37.1, 86.3], [-31.5, 80.6], [-25.9, 74.8], [-20.3, 69.1], [-14.6, 63.4], [-8.8, 57.9], [-2.8, 52.6], [3.4, 47.5], [9.8, 42.7], [16.4, 38.2], [23.2, 34], [30.2, 30.1], [37.3, 26.5], [44.6, 23.2], [52, 20.2], [59.6, 17.5], [67.2, 15.1], [75, 13], [82.8, 11.3], [90.6, 9.8], [98.6, 8.6], [106.5, 7.6], [114.5, 6.8], [122.5, 6.3], [130.5, 5.8], [138.5, 5.5], [146.5, 5.2], [154.5, 5], [162.5, 4.8], [170.5, 4.6], [178.5, 4.4], [186.5, 4.2], [194.5, 4.1], [202.5, 3.9], [210.5, 3.7], [218.5, 3.6], [226.5, 3.4], [234.5, 3.2], [242.5, 3], [250.5, 2.9], [258.5, 2.7], [266.6, 2.5], [274.6, 2.4], [282.6, 2.2], [290.6, 2], [298.6, 1.9], [306.6, 1.7], [314.6, 1.5], [322.6, 1.3], [330.6, 1.2], [338.6, 1], [346.6, 0.8], [354.6, 0.6], [362.6, 0.4], [370.6, 0.2], [378.6, 0.1], [386.6, -0.1], [394.6, -0.3], [402.6, -0.5], [410.7, -0.7], [418.7, -0.9], [426.7, -1.1], [434.7, -1.3], [442.7, -1.5], [450.7, -1.7], [458.7, -1.9], [466.7, -2.1], [474.7, -2.3], [482.7, -2.5], [490.7, -2.6], [498.7, -2.7], [506.7, -2.8], [514.7, -2.7], [522.7, -2.4], [530.7, -1.9], [538.7, -1.1], [546.6, 0.2], [554.4, 2], [562, 4.4], [569.4, 7.6], [576.4, 11.4], [582.9, 16], [589, 21.3], [594.5, 27.1], [599.5, 33.3], [603.9, 40], [607.9, 47], [611.4, 54.1], [614.6, 61.5], [617.5, 68.9], [620.3, 76.5], [622.8, 84.1], [625.3, 91.7], [627.6, 99.3], [630, 107], [632.3, 114.7], [634.5, 122.3], [636.8, 130], [639, 137.7], [641.1, 145.5], [643, 153.2], [644.7, 161], [646.1, 168.9], [646.9, 176.9], [646.9, 184.9], [646, 192.8], [643.8, 200.6], [640.4, 207.8], [635.9, 214.4], [630.6, 220.3], [624.6, 225.7], [618.2, 230.5], [611.5, 234.9], [604.6, 239], [597.6, 242.8], [590.4, 246.4], [583.2, 249.9], [575.9, 253.1], [568.5, 256.3], [561.1, 259.3], [553.6, 262.1], [546.1, 264.9], [538.6, 267.5], [531, 270], [523.3, 272.5], [515.7, 274.8], [508, 277.1], [500.3, 279.4], [492.6, 281.6], [484.9, 283.7], [477.2, 285.8], [469.5, 288], [461.7, 290.1], [454, 292.2], [446.3, 294.3], [438.6, 296.4], [430.8, 298.5], [423.1, 300.6], [415.4, 302.7], [407.7, 304.8], [399.9, 306.9], [392.2, 309], [384.5, 311.1], [376.8, 313.3], [369, 315.4], [361.3, 317.5], [353.6, 319.6], [345.9, 321.7], [338.1, 323.8], [330.4, 325.9], [322.7, 328], [314.9, 330.1], [307.2, 332.2], [299.5, 334.3], [291.8, 336.4], [284, 338.5], [276.3, 340.6], [268.6, 342.7], [260.9, 344.8], [253.1, 346.9], [245.4, 349]], arctic: [[377, 367], [379.6, 374.5], [382.2, 382.1], [384.8, 389.7], [387.4, 397.3], [390, 404.8], [392.6, 412.4], [395.3, 420], [397.9, 427.5], [400.5, 435.1], [403.2, 442.7], [405.8, 450.2], [408.4, 457.8], [411.1, 465.4], [413.7, 472.9], [416.4, 480.5], [419, 488], [421.6, 495.6], [424.3, 503.2], [426.9, 510.7], [429.6, 518.3], [432.2, 525.8], [434.8, 533.4], [437.4, 541], [439.9, 548.6], [442.3, 556.2], [444.7, 563.9], [447.1, 571.5], [449.3, 579.2], [451.4, 586.9], [453.5, 594.7], [455.4, 602.5], [457.1, 610.3], [458.7, 618.2], [460, 626], [461.2, 634], [462, 641.9], [462.7, 649.9], [463.1, 657.9], [463.2, 665.9], [463, 673.9], [462.6, 681.9], [462, 689.9], [461.1, 697.9], [460.1, 705.8], [459, 713.8], [457.7, 721.7], [456.3, 729.6], [454.9, 737.4], [453.5, 745.3], [452.1, 753.2], [450.7, 761.1], [449.4, 769], [448.2, 776.9], [447.2, 784.9], [446.5, 792.8], [446.3, 800.8], [446.8, 808.8], [448.2, 816.7], [451, 824.2], [455.1, 831.1], [460.4, 837], [466.7, 842], [473.5, 846.2], [480.7, 849.8], [488, 852.9], [495.5, 855.9], [502.9, 858.9], [510.2, 862.1], [517.4, 865.7], [524, 870.1], [529.8, 875.7], [533.6, 882.6], [534.2, 890.6], [531.5, 898], [526.4, 904.2], [520, 909], [512.9, 912.7], [505.4, 915.5], [497.7, 917.5], [489.8, 918.9], [481.8, 919.7], [473.8, 920], [465.8, 919.9], [457.8, 919.6], [449.8, 919], [441.9, 918.1], [433.9, 917.2], [426, 916.1], [418.1, 914.9], [410.1, 913.6], [402.2, 912.3], [394.3, 911], [386.5, 909.6], [378.6, 908.2], [370.7, 906.7], [362.8, 905.3], [355, 903.8], [347.1, 902.2], [339.3, 900.6], [331.4, 898.9], [323.6, 897.1], [315.8, 895.3], [308.1, 893.3], [300.3, 891.3], [292.6, 889.1], [284.9, 886.8], [277.3, 884.4], [269.7, 881.9], [262.1, 879.3], [254.6, 876.6], [247.1, 873.8], [239.6, 870.9], [232.1, 867.9], [224.7, 864.9], [217.4, 861.8], [210, 858.5], [202.8, 855.2], [195.5, 851.8], [188.3, 848.3], [181.1, 844.7], [174, 841.1], [166.9, 837.4], [159.8, 833.7], [152.7, 830], [145.6, 826.3], [138.5, 822.5], [131.4, 818.8], [124.4, 815], [117.3, 811.2], [110.3, 807.4], [103.2, 803.6], [96.2, 799.8], [89.2, 795.9], [82.2, 792], [75.2, 788], [68.3, 784], [61.4, 779.9], [54.6, 775.7], [48, 771.2], [41.5, 766.5], [35.3, 761.4], [29.7, 755.7], [24.7, 749.4], [20.8, 742.5], [18.1, 734.9], [16.6, 727.1], [15.9, 719.1], [15.7, 711.1], [15.5, 703.1], [14.8, 695.1], [13.1, 687.3], [10.4, 679.8], [6.6, 672.7], [1.9, 666.2], [-3.4, 660.2], [-9.1, 654.6], [-15.1, 649.3], [-21.3, 644.2], [-27.6, 639.3], [-33.9, 634.4], [-40.3, 629.5], [-46.6, 624.7], [-53, 619.8], [-59.4, 615], [-65.8, 610.2], [-72.3, 605.4], [-78.7, 600.7], [-85.2, 596], [-91.7, 591.3], [-98.3, 586.7], [-104.9, 582.2], [-111.6, 577.9], [-118.4, 573.7], [-125.4, 569.6], [-132.4, 565.7], [-139.4, 562], [-146.6, 558.3], [-153.7, 554.8], [-160.9, 551.2], [-168.1, 547.7], [-175.2, 544.1], [-182.3, 540.3], [-189.3, 536.4], [-196.2, 532.3], [-202.9, 527.9], [-209.4, 523.3], [-215.7, 518.3], [-221.7, 513], [-227.3, 507.3], [-232.6, 501.3], [-237.5, 495], [-242, 488.3], [-246.1, 481.5], [-249.7, 474.3], [-252.9, 467], [-255.7, 459.4], [-257.9, 451.8], [-259.8, 444], [-261.2, 436.1], [-262.3, 428.1], [-263, 420.2], [-263.5, 412.2], [-263.8, 404.2], [-264, 396.2], [-264.1, 388.2], [-264.1, 380.2], [-264.1, 372.1], [-264.1, 364.1], [-264.1, 356.1], [-264.1, 348.1], [-264.1, 340.1], [-264.1, 332.1], [-264.3, 324.1], [-264.6, 316.1], [-265.3, 308.1], [-266.3, 300.2], [-268, 292.3], [-270.6, 284.8], [-274.3, 277.7], [-279.2, 271.4], [-285.3, 266.2], [-292.3, 262.3], [-299.8, 259.4], [-307.5, 257.6], [-315.5, 256.5], [-323.5, 255.9], [-331.5, 255.7], [-339.5, 255.8], [-347.5, 255.9], [-355.5, 256], [-363.5, 255.8], [-371.5, 255.4], [-379.5, 254.6], [-387.4, 253.4], [-395.2, 251.7], [-402.9, 249.4], [-410.4, 246.7], [-417.7, 243.5], [-424.8, 239.7], [-431.6, 235.4], [-438, 230.7], [-444.1, 225.5], [-449.8, 219.8], [-455.1, 213.8], [-459.9, 207.4], [-464.3, 200.8], [-468.4, 193.9], [-472.1, 186.8], [-475.5, 179.5], [-478.7, 172.1], [-481.5, 164.7], [-484.2, 157.1], [-486.5, 149.4], [-488.6, 141.7], [-490.5, 133.9], [-492.1, 126.1], [-493.5, 118.2], [-494.8, 110.3], [-496, 102.4], [-497, 94.4], [-498.1, 86.5], [-499.1, 78.5], [-500.1, 70.6], [-501.1, 62.7], [-502.1, 54.7], [-503.1, 46.8], [-504, 38.8], [-505, 30.8], [-505.8, 22.9], [-506.6, 14.9], [-507.3, 6.9], [-507.9, -1.1], [-508.3, -9.1], [-508.6, -17.1], [-508.8, -25.1], [-508.8, -33.1], [-508.8, -41.1], [-508.6, -49.1], [-508.5, -57.1], [-508.2, -65.1], [-507.9, -73.1], [-507.5, -81.1], [-507.1, -89.1], [-506.7, -97.1], [-506.1, -105.1], [-505.5, -113.1], [-504.8, -121.1], [-504, -129], [-503.1, -137], [-502.2, -144.9], [-501.1, -152.9], [-500, -160.8], [-498.7, -168.7], [-497.3, -176.6], [-495.9, -184.5], [-494.3, -192.3], [-492.6, -200.2], [-490.8, -208], [-488.9, -215.8], [-486.9, -223.5], [-484.8, -231.2], [-482.5, -238.9], [-480.1, -246.6], [-477.6, -254.2], [-475, -261.7], [-472.3, -269.3], [-469.5, -276.8], [-466.7, -284.3], [-463.8, -291.7], [-460.8, -299.2], [-457.9, -306.6], [-454.9, -314.1], [-451.9, -321.5], [-448.9, -328.9], [-445.9, -336.4], [-442.9, -343.8], [-440, -351.2], [-436.9, -358.6], [-433.9, -366], [-430.8, -373.4], [-427.5, -380.7], [-424.1, -388], [-420.4, -395.1], [-416.4, -402], [-411.8, -408.6], [-406.7, -414.7], [-400.9, -420.3], [-394.5, -425.1], [-387.6, -429.1], [-380.3, -432.3], [-372.7, -434.9], [-365, -437.1], [-357.2, -439], [-349.4, -440.9], [-341.6, -442.8], [-333.9, -445], [-326.3, -447.5], [-318.9, -450.4], [-311.6, -453.9], [-304.6, -457.8], [-298, -462.2], [-291.6, -467.1], [-285.7, -472.5], [-280.2, -478.2], [-275, -484.4], [-270.3, -490.9], [-265.9, -497.6], [-261.9, -504.5], [-258.2, -511.6], [-254.7, -518.8], [-251.4, -526.1], [-248.2, -533.4], [-245.1, -540.8], [-242, -548.2], [-239, -555.6], [-236.1, -563.1], [-233.1, -570.5], [-230.1, -578], [-227.2, -585.4], [-224.2, -592.8], [-221.3, -600.3], [-218.3, -607.7], [-215.4, -615.2], [-212.5, -622.6], [-209.6, -630.1], [-206.7, -637.6], [-203.9, -645.1], [-201.2, -652.6], [-198.5, -660.2], [-196, -667.8], [-193.5, -675.4], [-191, -683], [-188.7, -690.7], [-186.4, -698.3], [-184.1, -706], [-182, -713.7], [-179.8, -721.5], [-177.8, -729.2], [-175.9, -737], [-174.1, -744.8], [-172.4, -752.6], [-170.8, -760.5], [-169.4, -768.4], [-168.1, -776.3], [-166.9, -784.2], [-165.8, -792.1], [-164.9, -800.1], [-164, -808], [-163.2, -816], [-162.4, -824], [-161.8, -832], [-161.3, -840], [-160.9, -848], [-160.6, -856], [-160.4, -864], [-160.5, -872], [-160.7, -880], [-161.2, -888], [-162, -895.9], [-163.1, -903.9], [-164.4, -911.8], [-166, -919.6], [-167.8, -927.4], [-169.8, -935.2], [-172, -942.9], [-174.3, -950.6], [-176.6, -958.2], [-179.1, -965.9], [-181.5, -973.5], [-184, -981.1], [-186.5, -988.7], [-189, -996.3], [-191.5, -1003.9], [-193.9, -1011.6], [-196.3, -1019.2], [-198.5, -1026.9], [-200.5, -1034.7], [-202.1, -1042.5], [-203.1, -1050.5], [-203.2, -1058.5], [-201.7, -1066.3], [-198.1, -1073.4], [-191.9, -1078.4], [-184.3, -1080.6], [-176.4, -1079.8], [-169.1, -1076.5], [-163, -1071.3], [-158.1, -1065], [-154.4, -1057.9], [-151.4, -1050.4], [-149.1, -1042.8], [-147.1, -1035], [-145.4, -1027.2], [-143.7, -1019.4], [-142, -1011.5], [-140.2, -1003.7], [-138.2, -996], [-135.9, -988.3], [-133.2, -980.8], [-130.1, -973.4], [-126.7, -966.1], [-122.9, -959.1], [-118.8, -952.2], [-114.4, -945.5], [-109.8, -938.9], [-105.1, -932.5], [-100.3, -926.1], [-95.4, -919.7], [-90.5, -913.4], [-85.6, -907], [-80.7, -900.7], [-75.9, -894.3], [-71.1, -887.9], [-66.4, -881.4], [-61.7, -874.9], [-57.2, -868.3], [-52.7, -861.7], [-48.2, -855], [-43.8, -848.3], [-39.5, -841.6], [-35.2, -834.8], [-30.9, -828.1], [-26.7, -821.3], [-22.4, -814.5], [-18.2, -807.7], [-13.9, -800.9], [-9.6, -794.1], [-5.4, -787.4], [-1.1, -780.6], [3.1, -773.8], [7.4, -767], [11.6, -760.2], [15.9, -753.4], [20.1, -746.6], [24.4, -739.8], [28.6, -733.1], [32.9, -726.3], [37.1, -719.5], [41.4, -712.7], [45.6, -705.9], [49.9, -699.1], [54.1, -692.3], [58.4, -685.5], [62.6, -678.7], [66.9, -672], [71.1, -665.2], [75.3, -658.3], [79.5, -651.5], [83.6, -644.7], [87.7, -637.8], [91.7, -630.8], [95.7, -623.9], [99.5, -616.8], [103.1, -609.7], [106.6, -602.5], [110, -595.2], [113.1, -587.8], [116.2, -580.4], [119.1, -573], [121.8, -565.4], [124.5, -557.9], [127.2, -550.4], [129.8, -542.8], [132.4, -535.2], [135, -527.6], [137.6, -520], [140.1, -512.4], [142.7, -504.9], [145.3, -497.3], [147.8, -489.7], [150.4, -482.1], [152.9, -474.5], [155.5, -466.9], [158.1, -459.3], [160.6, -451.7], [163.2, -444.2], [165.8, -436.6], [168.3, -429], [170.9, -421.4], [173.5, -413.8], [176, -406.2], [178.6, -398.6], [181.2, -391.1], [183.7, -383.5], [186.3, -375.9], [188.9, -368.3], [191.4, -360.7], [194, -353.1], [196.6, -345.5], [199.1, -337.9], [201.7, -330.4], [204.3, -322.8], [206.8, -315.2], [209.4, -307.6], [212, -300], [214.5, -292.4], [217.1, -284.8], [219.7, -277.2], [222.2, -269.7], [224.8, -262.1], [227.4, -254.5], [229.9, -246.9], [232.5, -239.3], [235.1, -231.7], [237.6, -224.1], [240.2, -216.5], [242.8, -209], [245.3, -201.4], [247.9, -193.8], [250.5, -186.2], [253, -178.6], [255.6, -171], [258.2, -163.4], [260.7, -155.8], [263.3, -148.3], [265.8, -140.7], [268.4, -133.1], [271, -125.5], [273.5, -117.9], [276.1, -110.3], [278.7, -102.7], [281.2, -95.1], [283.8, -87.6], [286.4, -80], [288.9, -72.4], [291.5, -64.8], [294.1, -57.2], [296.6, -49.6], [299.2, -42], [301.8, -34.4], [304.3, -26.9], [306.9, -19.3], [309.5, -11.7], [312, -4.1], [314.6, 3.5], [317.2, 11.1], [319.7, 18.7], [322.3, 26.3], [324.9, 33.8], [327.4, 41.4], [329.9, 49.1], [332.3, 56.7], [334.5, 64.4], [336.5, 72.1], [338.1, 80], [339.1, 87.9], [339.2, 95.9], [337.9, 103.8], [335.2, 111.4], [331.4, 118.4], [326.8, 124.9], [322.1, 131.4], [317.8, 138.2], [314.5, 145.5], [312.5, 153.2], [311.8, 161.2], [312.3, 169.2], [313.6, 177.1], [315.5, 184.9], [317.6, 192.6], [320.1, 200.2], [322.6, 207.8], [325.2, 215.4], [327.8, 222.9], [330.5, 230.5], [333.2, 238.1], [335.8, 245.6], [338.5, 253.2], [341.1, 260.7], [343.7, 268.3], [346.3, 275.9], [348.9, 283.5], [351.5, 291], [354, 298.6], [356.6, 306.2], [359.1, 313.8], [361.7, 321.4], [364.2, 329], [366.8, 336.6], [369.3, 344.2], [371.9, 351.8], [374.4, 359.4]], coast: [[176.1, -289.2], [174.6, -297], [175.1, -305], [177.4, -312.6], [180.6, -319.9], [184.4, -327], [188.6, -333.7], [193.4, -340.2], [198.3, -346.4], [203.3, -352.7], [208.2, -359], [213, -365.4], [217.7, -371.8], [222.5, -378.3], [227.2, -384.7], [231.9, -391.2], [236.7, -397.6], [241.4, -404], [246.2, -410.5], [250.9, -416.9], [255.6, -423.3], [260.4, -429.8], [265.1, -436.2], [269.8, -442.6], [274.6, -449.1], [279.3, -455.5], [284.1, -462], [288.8, -468.4], [293.5, -474.8], [298.3, -481.3], [303, -487.7], [307.7, -494.1], [312.5, -500.6], [318.7, -505.4], [326.5, -506.8], [334.3, -505.1], [341.3, -501.3], [347, -495.8], [351.1, -488.9], [353.4, -481.3], [354.2, -473.4], [354.6, -465.4], [355.4, -457.4], [357.9, -449.9], [361.8, -442.9], [366.5, -436.4], [371.2, -429.9], [375.7, -423.4], [380, -416.6], [383.8, -409.6], [387, -402.3], [391, -395.4], [398.1, -392.2], [405.6, -394.5], [410.4, -400.8], [410.3, -408.6], [405.5, -414.9], [399.5, -420.2], [394.3, -426.3], [389.4, -432.6], [384.4, -438.8], [379.5, -445.1], [374.7, -451.5], [371.3, -458.7], [370.5, -466.6], [372.7, -474.3], [377.7, -480.3], [384.8, -484.1], [392.3, -486.8], [400, -488.8], [407.7, -491.1], [415.2, -493.8], [422.6, -496.8], [430.1, -499.6], [437.7, -502.1], [445.5, -503.7], [453.5, -504.2], [461.2, -502.4], [466.3, -496.5], [468.2, -488.7], [468.5, -480.8], [468.2, -472.8], [467.9, -464.8], [467.6, -456.8], [467.3, -448.8], [466.9, -440.8], [466.6, -432.8], [466.3, -424.9], [466, -416.9], [465.4, -408.9], [464.3, -401], [463.1, -393.1], [461.9, -385.2], [460.7, -377.3], [459.5, -369.4], [458.4, -361.5], [457.2, -353.6], [456, -345.7], [454.8, -337.8], [453.3, -329.9], [451.5, -322.1], [449.6, -314.4], [447.7, -306.6], [445.8, -298.8], [443.9, -291.1], [441.8, -283.4], [439.1, -275.8], [436.3, -268.3], [433.4, -260.9], [430.6, -253.4], [427.4, -246.1], [423.5, -239.1], [419.6, -232.2], [415.6, -225.2], [411.6, -218.3], [407.6, -211.4], [403.3, -204.7], [398.4, -198.3], [393.5, -192], [388.6, -185.7], [383.7, -179.4], [378.7, -173.1], [373.4, -167.1], [368, -161.2], [362.6, -155.3], [357.2, -149.5], [351.8, -143.6], [346.4, -137.7], [340.9, -131.9], [334.6, -127.1], [327.8, -122.9], [320.9, -118.7], [314.1, -114.5], [307.3, -110.3], [300.5, -106.2], [293.7, -102], [286.9, -97.9], [279.8, -94], [272.7, -90.5], [265.5, -87], [258.3, -83.4], [251.1, -79.9], [243.9, -76.5], [236.7, -73.1], [229.4, -69.8], [222.2, -66.4], [215, -63], [207.7, -59.6], [200.5, -56.2], [193.2, -52.8], [185.9, -49.7], [178.4, -47], [170.8, -44.3], [163.3, -41.7], [155.7, -39.1], [148.2, -36.5], [140.5, -34.3], [132.7, -32.4], [124.9, -30.6], [117.2, -28.7], [109.4, -26.9], [101.6, -25.1], [93.8, -23.2], [86, -21.4], [78.2, -19.8], [70.3, -18.5], [62.4, -17.3], [54.5, -16], [46.6, -14.8], [38.8, -13.5], [30.9, -12], [23.1, -10.3], [16.8, -5.8], [14.4, 1.8], [12.4, 9.5], [7.3, 15.4], [-0.2, 18], [-8.1, 19.3], [-15.8, 17.6], [-22.9, 13.9], [-30.6, 11.8], [-38.5, 12.1], [-46.5, 13.1], [-54.4, 14.1], [-62.3, 15.2], [-70.2, 16.2], [-78.2, 17.3], [-86.1, 18.3], [-94, 19.3], [-101.9, 20.4], [-109.9, 21.4], [-117.8, 22.5], [-125.7, 23.5], [-133.6, 24.5], [-141.6, 25.6], [-149.5, 26.6], [-157.4, 27.8], [-165.3, 28.9], [-173.2, 30.1], [-181.1, 31.2], [-189, 32.4], [-196.9, 33.5], [-204.9, 34.7], [-212.7, 35.9], [-220.6, 37.1], [-228.5, 38.4], [-236.4, 39.6], [-244.3, 40.8], [-252.2, 42.1], [-260.1, 43.3], [-268, 44.5], [-275.9, 45.9], [-283, 49.5], [-288.1, 55.5], [-291.9, 62.6], [-295.6, 69.7], [-299, 76.9], [-302.3, 84.2], [-305.6, 91.5], [-308.6, 98.9], [-311.3, 106.4], [-313.9, 114], [-316, 121.7], [-317.7, 129.5], [-319, 137.4], [-320, 145.3], [-321, 153.2], [-321.6, 161.2], [-321.7, 169.2], [-321.8, 177.2], [-321.8, 185.1], [-321.9, 193.1], [-321.9, 201.1], [-321.5, 209.1], [-319.5, 216.8], [-315.3, 223.5], [-309.6, 229.1], [-303.2, 234], [-296.9, 238.9], [-291, 244.3], [-286.4, 250.7], [-283.7, 258.3], [-282.5, 266.1], [-281.3, 274.1], [-280, 281.9], [-278.6, 289.8], [-277.3, 297.7], [-275.9, 305.6], [-274.5, 313.4], [-273.2, 321.3], [-271.8, 329.2], [-270.5, 337.1], [-269.1, 344.9], [-267.7, 352.8], [-266.3, 360.7], [-264.7, 368.5], [-262.7, 376.3], [-261, 384.1], [-261.3, 392], [-265.6, 398.6], [-271.9, 403.5], [-278.8, 407.6], [-283.9, 413.5], [-284.5, 421.4], [-283.2, 429.3], [-280.9, 436.9], [-278.3, 444.5], [-275.7, 452], [-273.1, 459.6], [-270.1, 467], [-267.1, 474.4], [-263.9, 481.7], [-260.3, 488.9], [-256.6, 495.9], [-252.5, 502.8], [-248, 509.4], [-243.4, 516], [-238.8, 522.5], [-233.5, 528.5], [-227.9, 534.2], [-222.3, 539.9], [-216.5, 545.3], [-209.8, 549.7], [-202.8, 553.6], [-195.7, 557.2], [-188.5, 560.6], [-181.2, 564], [-174.5, 568.2], [-170, 574.8], [-167.4, 582.3], [-167.4, 590.2], [-172.2, 596.4], [-179.4, 599.8], [-187.1, 601.9], [-194.8, 604], [-202.6, 606], [-210.3, 607.9], [-218.2, 609.3], [-226.1, 610.5], [-234, 611.2], [-242, 611.2], [-249.9, 610.1], [-257.2, 606.9], [-263, 601.4], [-265.2, 593.8], [-266.1, 585.9], [-268, 578.1], [-270.9, 570.7], [-275.5, 564.2], [-280.5, 558], [-285.6, 551.8], [-290.4, 545.4], [-294.7, 538.7], [-298.9, 531.9], [-303.2, 525.1], [-307.5, 518.4], [-311.8, 511.6], [-315.6, 504.6], [-318.4, 497.1], [-321.2, 489.6], [-323.9, 482.1], [-326.5, 474.6], [-328.8, 466.9], [-331, 459.2], [-333.2, 451.6], [-335.4, 443.9], [-337.7, 436.2], [-339.9, 428.5], [-342.1, 420.8], [-344.3, 413.1], [-346.5, 405.5], [-348.7, 397.8], [-350.9, 390.1], [-353, 382.4], [-354.9, 374.6], [-356.8, 366.9], [-358.7, 359.1], [-360.3, 351.3], [-361.6, 343.4], [-362.9, 335.5], [-364.1, 327.6], [-365.3, 319.7], [-366.5, 311.8], [-367.6, 303.9], [-368.7, 296], [-369.8, 288.1], [-370.9, 280.1], [-371.8, 272.2], [-372.4, 264.2], [-373.1, 256.3], [-373.8, 248.3], [-374.5, 240.3], [-375.2, 232.4], [-375.9, 224.4], [-376.3, 216.4], [-376.4, 208.4], [-376.4, 200.4], [-376.4, 192.5], [-376.3, 184.5], [-376.1, 176.5], [-375.7, 168.5], [-375.2, 160.5], [-374.8, 152.5], [-374.1, 144.6], [-373.2, 136.6], [-372.4, 128.7], [-371.4, 120.8], [-369.6, 113], [-367.5, 105.2], [-365.3, 97.6], [-362.8, 90], [-360.3, 82.4], [-358, 74.7], [-356.2, 66.9], [-355, 59], [-354.9, 51.1], [-355.2, 43.1], [-355.2, 35.1], [-352.6, 27.7], [-346.1, 23.2], [-338.5, 20.8], [-330.7, 18.9], [-322.8, 17.5], [-314.8, 17], [-306.9, 16.5], [-298.9, 15.6], [-291, 14.7], [-283.1, 13.7], [-275.1, 12.7], [-267.2, 11.7], [-259.3, 10.7], [-251.3, 9.6], [-243.5, 8.3], [-235.6, 6.9], [-227.7, 5.5], [-219.9, 3.9], [-212.2, 1.8], [-204.5, -0.4], [-196.9, -2.7], [-189.2, -4.9], [-181.5, -7.2], [-173.9, -9.5], [-166.2, -11.7], [-158.5, -14], [-150.8, -16.2], [-143.2, -18.4], [-135.5, -20.5], [-127.8, -22.7], [-120, -24.8], [-112.3, -26.9], [-104.6, -28.9], [-96.8, -30.4], [-88.9, -31.7], [-81, -33], [-73.1, -34.3], [-65.2, -35.4], [-57.2, -36.2], [-49.3, -36.9], [-41.3, -37.7], [-33.6, -39.6], [-26, -42.2], [-18.5, -45], [-11.2, -48.3], [-4, -51.7], [3.2, -55.1], [10.4, -58.6], [17.6, -62], [24.9, -65.4], [32.1, -68.8], [39.3, -72.2], [46.6, -75.4], [54, -78.5], [61.4, -81.5], [68.9, -84.2], [76.7, -86.2], [84.5, -87.9], [92.3, -89.7], [100.1, -91.4], [107.9, -93], [115.8, -94.1], [123.7, -95.3], [131.7, -96.4], [139.6, -97.5], [147.5, -98.8], [155.3, -100.2], [163.2, -101.5], [171, -103.4], [178.6, -105.9], [185.9, -109], [192.9, -113], [199.6, -117.2], [206.2, -121.8], [212, -127.3], [217.5, -133.1], [222.9, -138.9], [227.6, -145.4], [231.9, -152.1], [235.3, -159.4], [237.5, -167], [238.7, -174.9], [238.6, -182.9], [238, -190.9], [236.8, -198.8], [235.1, -206.6], [232.6, -214.2], [229.9, -221.7], [226.6, -229], [223, -236.1], [218.5, -242.6], [212.4, -247.8], [206.2, -252.9], [200.3, -258.3], [194.4, -263.7], [188.5, -269.1], [183, -274.9], [179, -281.8]], plains: [[68.9, -780.3], [76.9, -781], [84.9, -781.7], [92.9, -782.4], [100.8, -783.1], [108.8, -783.8], [116.8, -784.5], [124.8, -785.2], [132.7, -785.9], [140.7, -786.6], [148.7, -787.3], [156.6, -788], [164.6, -788.7], [172.6, -789.4], [180.6, -790.1], [188.5, -790.8], [196.5, -791.5], [204.5, -792.1], [212.4, -792.8], [220.4, -793.5], [228.4, -794.2], [236.4, -794.9], [244.3, -795.6], [252.3, -796.2], [260.3, -796.2], [268.3, -795.8], [276.3, -795.3], [284.3, -794.7], [292.1, -793.2], [299.8, -790.9], [307.4, -788.3], [314.7, -785.2], [321.6, -781.1], [328.2, -776.5], [334, -771.1], [339.3, -765.1], [344.5, -759], [349.5, -752.7], [353.5, -745.8], [357, -738.6], [360.4, -731.4], [363.4, -724], [365.9, -716.4], [368.3, -708.7], [370.6, -701.1], [372.9, -693.4], [375, -685.7], [376.9, -677.9], [378.9, -670.2], [380.9, -662.4], [382.8, -654.7], [384.8, -646.9], [386.8, -639.1], [388.8, -631.4], [390.9, -623.7], [392.9, -615.9], [394.9, -608.2], [397, -600.5], [399, -592.7], [401, -585], [402.5, -577.1], [403.7, -569.2], [404.8, -561.3], [405.9, -553.3], [407, -545.4], [408.1, -537.5], [409.2, -529.6], [410.2, -521.6], [411.1, -513.7], [411.9, -505.7], [412.6, -497.7], [413.4, -489.8], [414, -481.8], [414.5, -473.8], [414.9, -465.8], [415.3, -457.8], [415.8, -449.8], [416.2, -441.8], [416.6, -433.8], [417, -425.8], [417.4, -417.9], [417.8, -409.9], [418.3, -401.9], [418.7, -393.9], [419, -385.9], [419.2, -377.9], [419.4, -369.9], [419.6, -361.9], [419.8, -353.9], [420, -345.9], [420.2, -337.9], [420.4, -329.9], [420.7, -321.9], [420.9, -313.9], [421.5, -305.9], [422.3, -297.9], [423.1, -290], [424.2, -282.1], [426.5, -274.4], [429.4, -266.9], [432.4, -259.5], [435.6, -252.2], [439.2, -245], [443, -238], [446.9, -231], [450.7, -224], [454.6, -217], [458.2, -209.8], [461.4, -202.5], [464.4, -195.1], [466.7, -187.4], [467.2, -179.4], [466.9, -171.5], [465.7, -163.5], [464.1, -155.7], [462.1, -148], [459.4, -140.4], [456.6, -132.9], [453.7, -125.4], [450.9, -118], [448.1, -110.5], [445.3, -103], [442.4, -95.5], [439.6, -88], [436.8, -80.5], [434, -73], [431.8, -65.3], [430.9, -57.4], [430.4, -49.4], [430, -41.4], [429.9, -33.4], [430.9, -25.5], [432.5, -17.6], [434.6, -9.9], [437.8, -2.6], [441.7, 4.4], [445.7, 11.3], [450.2, 17.9], [454.8, 24.5], [459.5, 31], [464.2, 37.5], [468.8, 44], [473.4, 50.5], [477.4, 57.5], [480.3, 64.9], [482.8, 72.5], [484.1, 80.4], [484.5, 88.4], [484.5, 96.4], [483.4, 104.3], [481.5, 112.1], [478.8, 119.6], [474.5, 126.3], [469.5, 132.6], [464.4, 138.8], [458.9, 144.5], [452.5, 149.4], [446, 154.1], [439.5, 158.7], [432.8, 163], [425.9, 167.1], [419, 171.1], [412.1, 175.2], [405.1, 179.2], [398.2, 183.2], [391.3, 187.3], [384.5, 191.4], [377.8, 195.8], [371.7, 201], [366, 206.6], [360.5, 212.4], [355.8, 218.9], [351.7, 225.7], [347.5, 232.6], [343.4, 239.5], [339.4, 246.4], [335.5, 253.4], [331.7, 260.4], [327.9, 267.5], [324.2, 274.5], [320.4, 281.6], [316.7, 288.7], [312.9, 295.7], [309.1, 302.8], [305.4, 309.9], [301.6, 316.9], [297.8, 324], [294, 331], [290.2, 338.1], [286.4, 345.1], [282.6, 352.1], [278.8, 359.1], [274.9, 366.2], [271.1, 373.2], [267.3, 380.2], [263.5, 387.3], [259.7, 394.3], [255.8, 401.3], [252, 408.4], [248.2, 415.4], [244.4, 422.4], [240.6, 429.5], [236.7, 436.5], [232.9, 443.5], [229.1, 450.6], [225.3, 457.6], [221.5, 464.6], [217.6, 471.7], [213.8, 478.7], [210, 485.7], [206.2, 492.8], [202.3, 499.8], [198.5, 506.8], [194.7, 513.8], [190.9, 520.9], [187.1, 527.9], [183.2, 534.9], [179.4, 542], [175.6, 549], [171.8, 556], [168, 563.1], [164.1, 570.1], [160.3, 577.1], [156.5, 584.2], [152.7, 591.2], [148.9, 598.2], [145, 605.3], [141.2, 612.3], [137.4, 619.3], [133.6, 626.4], [129.8, 633.4], [125.9, 640.4], [122.1, 647.5], [118.3, 654.5], [114.5, 661.5], [110.7, 668.5], [106.8, 675.6], [103, 682.6], [99.2, 689.6], [95.4, 696.7], [91.5, 703.7], [87.7, 710.7], [83.9, 717.8], [80.1, 724.8], [76.3, 731.8], [72.4, 738.9], [68.4, 745.8], [64.1, 752.5], [59.8, 759.3], [55.5, 766], [51.2, 772.7], [46.8, 779.5], [42.5, 786.2], [38.2, 792.9], [33.9, 799.7], [29.5, 806.4], [25.2, 813.1], [20.9, 819.9], [16.6, 826.6], [12.2, 833.3], [7.9, 840.1], [3.6, 846.8], [-0.7, 853.5], [-5.2, 860.2], [-9.9, 866.7], [-14.6, 873.1], [-19.4, 879.5], [-24.3, 885.8], [-29.9, 891.6], [-35.8, 897], [-42, 902], [-48.8, 906.2], [-56, 909.8], [-63.3, 913], [-71, 915.3], [-78.8, 917.1], [-86.7, 917.9], [-94.7, 917.4], [-102.7, 916.5], [-110.5, 914.9], [-118.3, 913.1], [-125.9, 910.7], [-133.3, 907.6], [-140.4, 904], [-147, 899.4], [-153.2, 894.3], [-158.6, 888.5], [-163.3, 881.9], [-167.7, 875.3], [-171.7, 868.4], [-175.3, 861.2], [-178.7, 854], [-182.1, 846.7], [-185.4, 839.4], [-188.7, 832.2], [-192.1, 824.9], [-195.7, 817.8], [-199.6, 810.8], [-203.6, 803.8], [-207.6, 796.9], [-211.6, 790], [-215.7, 783.1], [-220.1, 776.4], [-224.9, 770], [-229.7, 763.6], [-234.5, 757.2], [-239.3, 750.8], [-244.3, 744.5], [-249.4, 738.4], [-254.5, 732.2], [-259.7, 726.2], [-265.1, 720.2], [-270.5, 714.3], [-275.9, 708.4], [-281.4, 702.6], [-287, 696.9], [-292.6, 691.2], [-298.2, 685.4], [-303.8, 679.7], [-309.3, 673.9], [-314.5, 667.8], [-319.6, 661.7], [-324.8, 655.6], [-329.9, 649.4], [-335, 643.3], [-340.2, 637.2], [-345.3, 631], [-350.5, 624.9], [-355.6, 618.7], [-360.7, 612.6], [-365.9, 606.5], [-371, 600.3], [-376.1, 594.2], [-381.5, 588.3], [-388, 583.7], [-395.7, 581.7], [-403.6, 582.9], [-410.6, 586.7], [-416.8, 591.7], [-422.7, 597.1], [-428.7, 602.5], [-434.6, 607.8], [-441, 612.6], [-448.4, 615.6], [-456.3, 616.2], [-464.2, 614.6], [-471.3, 611], [-477.4, 605.8], [-483.1, 600.3], [-488.8, 594.6], [-494.3, 588.8], [-499.5, 582.7], [-504.3, 576.3], [-509.1, 569.9], [-513.6, 563.3], [-517.4, 556.3], [-521.1, 549.1], [-524.6, 541.9], [-527.5, 534.5], [-530.2, 527], [-532.8, 519.4], [-535.2, 511.7], [-537.2, 504], [-539.3, 496.3], [-540.9, 488.4], [-541.4, 480.5], [-540.6, 472.5], [-538, 465], [-534.2, 457.9], [-530, 451.1], [-525.8, 444.3], [-521.4, 437.6], [-516.9, 431], [-512.1, 424.6], [-507.2, 418.3], [-502.3, 411.9], [-497.5, 405.6], [-492.6, 399.2], [-487.7, 392.9], [-482.8, 386.5], [-478, 380.2], [-473.1, 373.8], [-468.2, 367.5], [-463.4, 361.1], [-458.5, 354.8], [-453.6, 348.4], [-448.8, 342.1], [-443.9, 335.7], [-439, 329.4], [-434.2, 323], [-429.3, 316.7], [-424.4, 310.3], [-419.5, 303.9], [-414.7, 297.6], [-409.8, 291.2], [-404.9, 284.9], [-400.1, 278.5], [-395.2, 272.2], [-390.3, 265.8], [-385.5, 259.5], [-380.6, 253.1], [-375.7, 246.8], [-370.9, 240.4], [-366, 234.1], [-361.1, 227.7], [-356.2, 221.4], [-351.4, 215], [-346.5, 208.7], [-341.6, 202.3], [-336.8, 196], [-331.9, 189.6], [-327, 183.3], [-322.2, 176.9], [-317.3, 170.6], [-312.4, 164.2], [-307.6, 157.9], [-302.7, 151.5], [-297.8, 145.2], [-292.9, 138.8], [-288, 132.5], [-283.1, 126.2], [-278.2, 119.9], [-273.3, 113.6], [-268.4, 107.3], [-263.4, 100.9], [-258.5, 94.6], [-253.6, 88.3], [-248.7, 82], [-243.6, 75.8], [-238.3, 69.8], [-232.4, 64.4], [-225.8, 59.9], [-219, 55.7], [-211.5, 52.9], [-203.8, 50.9], [-195.9, 49.3], [-188, 48.6], [-180, 48.5], [-172, 48.8], [-164, 49.4], [-156, 50.2], [-148.1, 51.1], [-140.2, 52.3], [-132.3, 53.5], [-124.3, 54.7], [-116.4, 55.9], [-108.5, 57.1], [-100.6, 58.3], [-92.7, 59.5], [-84.8, 60.7], [-76.8, 61.7], [-68.9, 62.6], [-60.9, 63.4], [-52.9, 63.9], [-44.9, 64.2], [-36.9, 64.1], [-29, 63.3], [-21, 62.2], [-13.1, 61], [-5.3, 59.3], [2.4, 57.4], [10.1, 55.2], [17.5, 52.1], [24.6, 48.3], [31.5, 44.3], [38.1, 39.9], [44.5, 34.9], [50.7, 30], [57, 25], [63.3, 20], [69.5, 15], [75.8, 10.1], [82.1, 5.1], [88.3, 0.1], [94.6, -4.9], [100.9, -9.9], [107.1, -14.8], [113.4, -19.8], [119.7, -24.8], [125.9, -29.8], [132.2, -34.8], [138.4, -39.7], [144.7, -44.7], [151, -49.7], [157.2, -54.7], [163.5, -59.7], [169.8, -64.6], [176.1, -69.5], [182.7, -74.1], [189.5, -78.2], [196.8, -81.5], [204.6, -83.1], [212.6, -82.3], [219.8, -78.9], [225.7, -73.6], [230.1, -66.9], [233.1, -59.5], [235.3, -51.8], [237.5, -44.2], [239.7, -36.5], [241.9, -28.8], [244.1, -21.1], [246.3, -13.4], [248.5, -5.7], [250.7, 2], [252.9, 9.7], [255.4, 17.3], [258.8, 24.6], [263.4, 31.1], [269.5, 36.3], [276.9, 39.1], [284.8, 39], [292.4, 36.5], [299, 32], [304.1, 25.9], [308.2, 19], [311.5, 11.7], [314.4, 4.2], [317.1, -3.3], [319.8, -10.8], [322.5, -18.4], [325.1, -25.9], [327.7, -33.5], [330.1, -41.1], [332.2, -48.9], [334.2, -56.6], [335.8, -64.4], [337.1, -72.3], [338.2, -80.3], [339.1, -88.2], [339.8, -96.2], [340.4, -104.2], [340.5, -112.2], [340, -120.2], [339.3, -128.1], [337.4, -135.9], [333.9, -143.1], [329.1, -149.4], [323.7, -155.4], [318.1, -161], [312.2, -166.5], [306.3, -171.9], [300.4, -177.3], [294.5, -182.6], [288.5, -188], [282.6, -193.4], [276.7, -198.8], [270.8, -204.2], [264.9, -209.6], [259, -215], [253.1, -220.4], [247.2, -225.8], [241.3, -231.2], [235.4, -236.6], [229.4, -242], [223.5, -247.4], [217.6, -252.8], [211.7, -258.2], [205.8, -263.6], [199.9, -269], [194, -274.4], [188.1, -279.8], [182.2, -285.2], [176.3, -290.6], [170.3, -296], [164.4, -301.4], [158.5, -306.7], [152.6, -312.1], [146.7, -317.5], [140.8, -322.9], [134.9, -328.3], [129, -333.7], [123.1, -339.1], [117.1, -344.5], [111.2, -349.9], [105.3, -355.3], [99.4, -360.7], [93.5, -366.1], [87.6, -371.5], [81.7, -376.9], [75.8, -382.3], [69.9, -387.7], [64, -393.1], [58, -398.5], [52.1, -403.9], [46.2, -409.3], [40.3, -414.7], [34.4, -420.1], [28.5, -425.5], [22.6, -430.8], [16.7, -436.2], [10.8, -441.6], [4.9, -447], [-1.1, -452.4], [-7, -457.8], [-12.9, -463.2], [-18.8, -468.6], [-24.7, -474], [-30.6, -479.4], [-36.5, -484.8], [-42.4, -490.2], [-48.3, -495.6], [-54.2, -501], [-60.2, -506.4], [-66.1, -511.8], [-72, -517.2], [-77.9, -522.6], [-83.8, -528], [-89.7, -533.4], [-95.6, -538.8], [-101.5, -544.2], [-107.4, -549.6], [-113.4, -554.9], [-119.3, -560.3], [-125.2, -565.7], [-131.1, -571.1], [-137.1, -576.4], [-143.4, -581.3], [-150.2, -585.6], [-157.2, -589.4], [-164.3, -593], [-171.8, -595.8], [-179.7, -597.3], [-187.6, -598.3], [-195.6, -598.3], [-203.6, -597.5], [-211.5, -596.2], [-219, -593.6], [-226.3, -590.2], [-233.3, -586.3], [-239.3, -581.1], [-243.9, -574.6], [-247.2, -567.3], [-249.6, -559.7], [-250.9, -551.8], [-251.9, -543.8], [-252.9, -535.9], [-253.8, -528], [-254.8, -520], [-255.7, -512.1], [-256.7, -504.1], [-257.7, -496.2], [-258.8, -488.2], [-260.5, -480.4], [-263.1, -472.9], [-267.1, -465.9], [-272.3, -459.9], [-278.5, -454.9], [-285.6, -451.1], [-293, -448.1], [-300.8, -446.4], [-308.7, -445.6], [-316.7, -446.4], [-324.5, -448.3], [-332, -451], [-338.9, -455], [-345.3, -459.9], [-350.7, -465.7], [-355.3, -472.3], [-359.1, -479.3], [-361.9, -486.8], [-362.9, -494.7], [-362.8, -502.7], [-361.5, -510.6], [-359.3, -518.3], [-356.2, -525.7], [-353, -533], [-349.7, -540.3], [-346.3, -547.5], [-342.7, -554.7], [-339.1, -561.8], [-335.4, -568.9], [-331.8, -576.1], [-328.2, -583.2], [-324.6, -590.4], [-321, -597.5], [-317.4, -604.7], [-313.8, -611.8], [-310.2, -619], [-306.6, -626.1], [-303, -633.3], [-299.4, -640.4], [-295.8, -647.5], [-292.1, -654.6], [-287.8, -661.4], [-282.8, -667.6], [-277.6, -673.7], [-272.4, -679.8], [-267, -685.7], [-261.4, -691.4], [-255.8, -697.1], [-250, -702.6], [-243.9, -707.9], [-237.9, -713.1], [-231.8, -718.3], [-225.6, -723.4], [-219.2, -728.1], [-212.6, -732.7], [-206, -737.2], [-198.9, -740.9], [-191.6, -744.1], [-184.2, -747.2], [-176.7, -750.2], [-169.2, -752.8], [-161.6, -755.3], [-153.9, -757.6], [-146.1, -759.1], [-138.1, -760.1], [-130.2, -761.1], [-122.2, -762.1], [-114.3, -763.1], [-106.4, -764.1], [-98.4, -765], [-90.4, -765.7], [-82.5, -766.4], [-74.5, -767.2], [-66.5, -767.9], [-58.6, -768.6], [-50.6, -769.4], [-42.6, -770.1], [-34.7, -770.8], [-26.7, -771.6], [-18.7, -772.3], [-10.7, -773], [-2.8, -773.8], [5.2, -774.5], [13.2, -775.2], [21.1, -776], [29.1, -776.7], [37.1, -777.4], [45, -778.2], [53, -778.9], [61, -779.6]], badlands: [[-475.5, 396.1], [-469.2, 401.1], [-462.9, 406.1], [-456.6, 411], [-450.3, 416], [-444.1, 421], [-437.8, 426], [-431.5, 431], [-425.3, 436], [-419, 441], [-412.7, 446], [-406.5, 451], [-400.2, 456], [-394, 460.9], [-387.7, 465.9], [-381.4, 470.9], [-375.2, 475.9], [-368.9, 480.9], [-362.6, 485.9], [-356.4, 490.9], [-350.1, 495.9], [-343.8, 500.8], [-337.5, 505.8], [-331.2, 510.7], [-324.8, 515.6], [-318.4, 520.4], [-312, 525.2], [-305.5, 529.9], [-299, 534.6], [-292.5, 539.2], [-285.9, 543.7], [-279.2, 548.2], [-272.5, 552.5], [-265.6, 556.7], [-258.7, 560.7], [-251.6, 564.3], [-244.2, 567.5], [-236.6, 569.9], [-228.6, 570.9], [-220.9, 569.1], [-215.4, 563.5], [-213.2, 555.8], [-213.2, 547.8], [-214.3, 539.9], [-216.1, 532.1], [-218.3, 524.4], [-220.7, 516.8], [-223.2, 509.1], [-225.8, 501.6], [-228.4, 494], [-231, 486.4], [-233.6, 478.8], [-236.2, 471.3], [-238.7, 463.7], [-241.2, 456.1], [-243.7, 448.4], [-246, 440.8], [-248.2, 433], [-250.1, 425.3], [-251.8, 417.5], [-253.2, 409.6], [-254.1, 401.6], [-254.5, 393.6], [-254.5, 385.6], [-253.8, 377.6], [-252.7, 369.7], [-250.9, 361.9], [-248.6, 354.2], [-245.8, 346.7], [-242.4, 339.4], [-238.5, 332.4], [-234.1, 325.7], [-229.3, 319.4], [-224, 313.3], [-218.4, 307.6], [-212.5, 302.2], [-206.3, 297.1], [-199.9, 292.3], [-193.4, 287.7], [-186.7, 283.2], [-180, 278.8], [-173.3, 274.5], [-166.5, 270.2], [-159.7, 266], [-152.9, 261.7], [-146.1, 257.5], [-139.3, 253.3], [-132.5, 249.1], [-125.7, 244.8], [-118.9, 240.6], [-112.1, 236.3], [-105.3, 232.1], [-98.6, 227.8], [-91.9, 223.4], [-85.2, 218.9], [-78.7, 214.2], [-72.4, 209.3], [-66.2, 204.2], [-60.3, 198.8], [-54.8, 193], [-49.7, 186.8], [-44.9, 180.4], [-40.5, 173.7], [-36.4, 166.8], [-32.6, 159.8], [-28.8, 152.7], [-25.1, 145.6], [-21.1, 138.7], [-16.9, 131.9], [-12.3, 125.3], [-7.1, 119.2], [-1.5, 113.5], [4.5, 108.2], [10.9, 103.4], [17.6, 98.9], [24.4, 94.7], [31.2, 90.5], [38, 86.3], [44.6, 81.7], [50.9, 76.8], [56.8, 71.3], [62, 65.3], [66.6, 58.7], [70.4, 51.7], [73.6, 44.4], [76.3, 36.8], [78.6, 29.1], [80.8, 21.4], [82.9, 13.7], [85.2, 6], [87.7, -1.6], [90.6, -9], [94, -16.3], [97.8, -23.4], [102.1, -30.1], [106.9, -36.6], [112.1, -42.6], [117.7, -48.3], [123.7, -53.7], [130, -58.6], [136.6, -63.1], [143.5, -67.2], [150.7, -70.7], [158.1, -73.7], [165.7, -76.1], [173.6, -77.9], [181.5, -78.9], [189.5, -79.1], [197.5, -78.6], [205.4, -77.5], [213.2, -75.7], [220.9, -73.4], [228.5, -70.8], [236, -67.9], [243.4, -64.9], [250.7, -61.7], [258.1, -58.5], [265.4, -55.2], [272.8, -52.1], [280.2, -49.1], [287.7, -46.4], [295.4, -44.1], [303.3, -42.5], [311.2, -41.6], [319.2, -41.8], [327.1, -43.1], [334.8, -45.4], [342.1, -48.6], [349.1, -52.5], [355.7, -57], [362.1, -61.9], [368.2, -67.1], [374.1, -72.5], [379.8, -78.1], [385.4, -83.9], [390.9, -89.7], [396.4, -95.5], [402.1, -101.1], [408.1, -106.5], [414.3, -111.5], [421, -115.9], [428.1, -119.5], [435.7, -122.2], [443.5, -123.7], [451.5, -124], [459.5, -123], [467.1, -120.7], [474.5, -117.5], [481.4, -113.4], [487.9, -108.8], [494.3, -104], [500.7, -99.2], [507.4, -94.7], [514.4, -90.9], [521.9, -88.1], [529.7, -86.4], [537.7, -85.7], [545.7, -85.9], [553.7, -86.7], [561.6, -87.9], [569.5, -89.3], [577.3, -90.9], [585.2, -92.5], [593, -94.2], [600.8, -96], [608.7, -97.7], [616.5, -99.4], [624.3, -101.2], [632.1, -102.9], [639.9, -104.7], [647.7, -106.5], [655.5, -108.3], [663.3, -110.3], [671, -112.5], [678.6, -115], [686.1, -117.8], [693.4, -121], [700.5, -124.8], [707.3, -129.1], [713.7, -133.9], [719.8, -139.1], [725.5, -144.7], [731.1, -150.5], [736.4, -156.4], [741.7, -162.5], [746.8, -168.6], [752, -174.7], [757.1, -180.9], [762.2, -187.1], [767.3, -193.3], [772.4, -199.5], [777.5, -205.6], [782.5, -211.8], [787.6, -218], [792.7, -224.2], [797.8, -230.4], [802.9, -236.5], [808, -242.7], [813.1, -248.9], [818.2, -255.1], [823.3, -261.3], [828.4, -267.4], [833.5, -273.6], [838.6, -279.8], [843.7, -286], [848.8, -292.1], [853.9, -298.3], [859, -304.5], [864.1, -310.7], [869.2, -316.8], [874.3, -323], [879.4, -329.2], [884.5, -335.4], [889.5, -341.7], [894.5, -347.9], [899.5, -354.2], [904.4, -360.5], [909.2, -367], [913.8, -373.5], [918.3, -380.1], [922.4, -387], [925.9, -394.2], [928.6, -401.7], [929.7, -409.6], [927.8, -417.4], [922.2, -422.9], [914.6, -425.3], [906.6, -425.6], [898.6, -424.8], [890.7, -423.4], [882.9, -421.5], [875.2, -419.3], [867.5, -417.1], [859.9, -414.7], [852.3, -412.3], [844.6, -409.8], [837, -407.4], [829.4, -405], [821.7, -402.5], [814.1, -400.1], [806.5, -397.6], [798.8, -395.2], [791.2, -392.8], [783.6, -390.3], [775.9, -387.9], [768.3, -385.5], [760.7, -383.1], [753, -380.7], [745.4, -378.3], [737.7, -376], [730, -373.7], [722.3, -371.4], [714.6, -369.2], [706.9, -367], [699.2, -364.8], [691.5, -362.6], [683.8, -360.4], [676.1, -358.3], [668.4, -356.1], [660.7, -354], [653, -351.8], [645.2, -349.7], [637.5, -347.5], [629.8, -345.4], [622.1, -343.3], [614.3, -341.3], [606.6, -339.3], [598.8, -337.3], [591, -335.3], [583.3, -333.4], [575.5, -331.5], [567.7, -329.5], [559.9, -327.6], [552.1, -325.7], [544.4, -323.8], [536.6, -322], [528.8, -320.1], [521, -318.2], [513.2, -316.3], [505.4, -314.5], [497.6, -312.6], [489.8, -310.8], [482, -309], [474.2, -307.3], [466.4, -305.6], [458.5, -303.9], [450.7, -302.3], [442.8, -300.6], [435, -299], [427.2, -297.4], [419.3, -295.9], [411.4, -294.3], [403.6, -292.7], [395.7, -291.1], [387.9, -289.5], [380, -288], [372.2, -286.4], [364.3, -284.8], [356.5, -283.3], [348.6, -281.7], [340.7, -280.2], [332.9, -278.6], [325, -277.1], [317.1, -275.7], [309.3, -274.2], [301.4, -272.8], [293.5, -271.4], [285.6, -270.1], [277.7, -268.7], [269.8, -267.4], [261.9, -266.1], [254, -264.8], [246.1, -263.5], [238.2, -262.2], [230.3, -260.9], [222.3, -259.7], [214.4, -258.4], [206.5, -257.2], [198.6, -256], [190.7, -254.8], [182.8, -253.6], [174.8, -252.4], [166.9, -251.3], [159, -250.1], [151, -249], [143.1, -247.9], [135.2, -246.8], [127.2, -245.7], [119.3, -244.7], [111.3, -243.6], [103.4, -242.7], [95.4, -241.7], [87.5, -240.8], [79.5, -239.9], [71.6, -239], [63.6, -238.1], [55.6, -237.2], [47.7, -236.3], [39.7, -235.5], [31.8, -234.6], [23.8, -233.7], [15.8, -232.8], [7.9, -231.9], [-0.1, -231.1], [-8.1, -230.2], [-16, -229.3], [-24, -228.4], [-31.9, -227.6], [-39.9, -226.7], [-47.9, -225.8], [-55.8, -224.9], [-63.8, -224], [-71.8, -223.2], [-79.7, -222.3], [-87.7, -221.4], [-95.6, -220.5], [-103.6, -219.6], [-111.6, -218.7], [-119.5, -217.8], [-127.5, -216.8], [-135.4, -215.8], [-143.3, -214.5], [-151.2, -213.1], [-159, -211.2], [-166.6, -208.6], [-173.6, -204.7], [-178.8, -198.8], [-180.4, -191], [-178.6, -183.2], [-175.2, -176], [-171.1, -169.1], [-166.6, -162.5], [-162, -156], [-157.3, -149.5], [-152.5, -143], [-147.8, -136.6], [-143, -130.1], [-138.3, -123.6], [-133.6, -117.2], [-128.9, -110.6], [-124.3, -104.1], [-119.7, -97.6], [-115.2, -90.9], [-110.7, -84.3], [-106.4, -77.5], [-102.3, -70.6], [-98.5, -63.6], [-95.2, -56.3], [-92.5, -48.8], [-91, -40.9], [-91.3, -32.9], [-94.2, -25.5], [-99.6, -19.6], [-106.5, -15.7], [-114.2, -13.4], [-122.1, -12.4], [-130.1, -12.3], [-138.1, -13.2], [-145.9, -14.9], [-153.5, -17.6], [-160.6, -21.2], [-167.1, -25.9], [-172.8, -31.5], [-177.9, -37.6], [-182.5, -44.2], [-186.7, -51.1], [-190.7, -58], [-194.8, -64.8], [-199.1, -71.6], [-203.7, -78.2], [-208.5, -84.6], [-213.8, -90.7], [-219.3, -96.4], [-225.2, -101.8], [-231.6, -106.7], [-238.3, -111.1], [-245.4, -114.7], [-252.9, -117.5], [-260.7, -119.4], [-268.7, -119.9], [-276.6, -118.9], [-283.7, -115.3], [-288.3, -108.9], [-289.3, -101], [-288.1, -93.1], [-285.5, -85.5], [-282.4, -78.1], [-278.8, -71], [-275, -63.9], [-271.1, -56.9], [-267.2, -50], [-263.2, -43], [-259.1, -36.1], [-255.1, -29.1], [-251.2, -22.2], [-247.2, -15.2], [-243.2, -8.3], [-239.3, -1.3], [-235.5, 5.7], [-231.7, 12.8], [-228, 19.9], [-224.5, 27.1], [-221.2, 34.4], [-218.3, 41.9], [-215.8, 49.5], [-213.9, 57.3], [-212.6, 65.2], [-212, 73.2], [-212.1, 81.2], [-212.9, 89.1], [-214.4, 97], [-216.3, 104.8], [-218.9, 112.4], [-221.9, 119.8], [-225.4, 127], [-229.4, 133.9], [-234, 140.5], [-239.2, 146.6], [-244.9, 152.2], [-251, 157.4], [-257.5, 162], [-264.3, 166.2], [-271.4, 170.1], [-278.5, 173.7], [-285.8, 177], [-293.3, 180], [-300.8, 182.7], [-308.4, 185.1], [-316.2, 187], [-324.1, 188.4], [-332.1, 189.3], [-340.1, 189.6], [-348.1, 189.5], [-356.1, 188.8], [-364, 187.6], [-371.8, 186], [-379.6, 184], [-387.2, 181.5], [-394.7, 178.7], [-402, 175.4], [-409.1, 171.7], [-416, 167.6], [-422.5, 163], [-428.7, 157.9], [-434.6, 152.5], [-440.2, 146.7], [-445.5, 140.7], [-450.5, 134.5], [-455.4, 128.1], [-460.2, 121.7], [-464.9, 115.2], [-469.6, 108.7], [-474.2, 102.2], [-478.9, 95.7], [-483.5, 89.2], [-488.2, 82.7], [-492.9, 76.2], [-497.7, 69.8], [-502.5, 63.3], [-507.3, 56.9], [-512.2, 50.6], [-517.1, 44.2], [-522.1, 38], [-527.1, 31.8], [-532.3, 25.7], [-537.7, 19.8], [-543.4, 14.1], [-549.5, 8.9], [-556.1, 4.3], [-563.2, 0.6], [-570.7, -2], [-578.6, -3.5], [-586.6, -3.8], [-594.6, -3.2], [-602.4, -1.7], [-610.2, 0.3], [-617.8, 2.7], [-625.4, 5.4], [-632.8, 8.3], [-640.3, 11.3], [-647.6, 14.4], [-655, 17.6], [-662.4, 20.7], [-669.7, 23.9], [-677, 27.2], [-684.4, 30.4], [-691.7, 33.6], [-699.1, 36.8], [-706.4, 40], [-713.7, 43.2], [-721.1, 46.4], [-728.4, 49.7], [-735.7, 52.9], [-743.1, 56.1], [-750.4, 59.3], [-757.7, 62.6], [-765.1, 65.8], [-772.3, 69.1], [-779.6, 72.6], [-786.8, 76.1], [-793.8, 80], [-800.5, 84.3], [-806.8, 89.2], [-812.3, 95.1], [-816.1, 102.1], [-817.3, 110], [-815.6, 117.8], [-811.9, 124.9], [-807.1, 131.3], [-801.6, 137.1], [-795.8, 142.6], [-789.8, 147.9], [-783.7, 153.1], [-777.5, 158.2], [-771.3, 163.3], [-765.1, 168.3], [-758.9, 173.3], [-752.6, 178.4], [-746.4, 183.4], [-740.1, 188.4], [-733.9, 193.4], [-727.6, 198.4], [-721.4, 203.4], [-715.1, 208.4], [-708.8, 213.4], [-702.5, 218.3], [-696.2, 223.3], [-689.9, 228.2], [-683.6, 233.2], [-677.3, 238.1], [-671, 243], [-664.7, 248], [-658.4, 252.9], [-652.1, 257.8], [-645.8, 262.8], [-639.4, 267.7], [-633.1, 272.7], [-626.8, 277.6], [-620.5, 282.5], [-614.2, 287.5], [-607.9, 292.4], [-601.6, 297.3], [-595.3, 302.3], [-589, 307.2], [-582.7, 312.1], [-576.3, 317.1], [-570, 322], [-563.7, 326.9], [-557.4, 331.9], [-551.1, 336.8], [-544.8, 341.7], [-538.5, 346.7], [-532.2, 351.6], [-525.9, 356.6], [-519.6, 361.5], [-513.3, 366.4], [-506.9, 371.4], [-500.6, 376.3], [-494.3, 381.3], [-488, 386.2], [-481.7, 391.2]], spa: [[-284.5, -1173.7], [-288.4, -1180.6], [-292.4, -1187.6], [-296.4, -1194.5], [-300.3, -1201.5], [-304.3, -1208.4], [-308.3, -1215.3], [-312.3, -1222.3], [-316.2, -1229.2], [-320.2, -1236.2], [-324.2, -1243.1], [-328.1, -1250], [-332.1, -1257], [-336.1, -1263.9], [-340.1, -1270.9], [-344, -1277.8], [-348, -1284.7], [-352, -1291.7], [-355.9, -1298.6], [-359.9, -1305.6], [-363.9, -1312.5], [-367.9, -1319.4], [-371.8, -1326.4], [-375.8, -1333.3], [-379.8, -1340.3], [-383.8, -1347.2], [-387.7, -1354.1], [-391.7, -1361.1], [-395.7, -1368], [-399.6, -1375], [-403.6, -1381.9], [-407.2, -1389], [-409.2, -1396.8], [-407.6, -1404.5], [-402.1, -1410.2], [-394.5, -1412.6], [-386.6, -1412], [-379, -1409.5], [-371.8, -1406.1], [-364.6, -1402.6], [-357.5, -1399], [-350.3, -1395.4], [-343.2, -1391.8], [-336, -1388.3], [-328.8, -1384.8], [-321.6, -1381.3], [-314.4, -1377.9], [-307.2, -1374.4], [-300, -1370.9], [-292.8, -1367.5], [-285.5, -1364], [-278.3, -1360.6], [-271.1, -1357.1], [-263.9, -1353.6], [-256.7, -1350.2], [-249.5, -1346.7], [-242.3, -1343.1], [-235.4, -1339.3], [-228.5, -1335.1], [-221.7, -1330.9], [-214.9, -1326.7], [-208.1, -1322.5], [-201.3, -1318.4], [-194.5, -1314.1], [-187.9, -1309.6], [-181.5, -1304.8], [-175, -1300.1], [-168.6, -1295.3], [-162.2, -1290.6], [-155.8, -1285.8], [-149.3, -1281], [-143, -1276.2], [-136.8, -1271.2], [-130.6, -1266.1], [-124.5, -1260.9], [-118.3, -1255.8], [-112.2, -1250.7], [-106.1, -1245.5], [-100, -1240.3], [-94.3, -1234.7], [-88.8, -1228.9], [-83.4, -1223], [-78, -1217.1], [-72.6, -1211.2], [-67.2, -1205.3], [-61.9, -1199.4], [-56.7, -1193.3], [-51.5, -1187.2], [-46.4, -1181.1], [-41.2, -1174.9], [-36.1, -1168.8], [-31, -1162.7], [-25.8, -1156.5], [-20.7, -1150.4], [-15.5, -1144.3], [-10.4, -1138.2], [-5.3, -1132], [-0.1, -1125.9], [5, -1119.8], [10.1, -1113.7], [15.3, -1107.5], [20.4, -1101.4], [25.6, -1095.3], [30.7, -1089.2], [35.8, -1083], [41, -1076.9], [46.1, -1070.8], [51.2, -1064.6], [56.4, -1058.5], [61.5, -1052.4], [66.7, -1046.3], [71.8, -1040.1], [76.9, -1034], [82.1, -1027.9], [87.2, -1021.8], [92.4, -1015.6], [97.5, -1009.5], [102.6, -1003.4], [107.8, -997.2], [112.9, -991.1], [118, -985], [123.2, -978.9], [128.5, -972.9], [134.1, -967.2], [140.1, -961.9], [146.5, -957.1], [153.2, -952.8], [160, -948.5], [166.7, -944.2], [173.5, -939.9], [180.2, -935.6], [186.9, -931.2], [193.6, -926.9], [200.3, -922.5], [206.7, -917.7], [212.6, -912.3], [218.3, -906.7], [223.6, -900.7], [228.2, -894.2], [232.5, -887.4], [236.7, -880.6], [240.5, -873.6], [243.8, -866.3], [246.9, -859], [249.6, -851.4], [251.8, -843.7], [253.8, -836], [255.4, -828.2], [256.6, -820.2], [257.5, -812.3], [258.5, -804.4], [259.5, -796.4], [260.5, -788.5], [261.7, -780.6], [263.4, -772.8], [265.5, -765.1], [268.2, -757.6], [271.5, -750.3], [275.2, -743.2], [279.1, -736.2], [283.1, -729.3], [287.3, -722.5], [291.6, -715.7], [295.8, -708.9], [300, -702.1], [304.3, -695.4], [308.5, -688.6], [312.8, -681.8], [317, -675], [321.2, -668.2], [325.5, -661.5], [329.7, -654.7], [334, -647.9], [338.2, -641.1], [342.4, -634.3], [346.7, -627.6], [350.9, -620.8], [355.1, -614], [359.4, -607.2], [363.6, -600.4], [367.9, -593.6], [372.1, -586.9], [376.3, -580.1], [380.6, -573.3], [384.8, -566.5], [389.1, -559.8], [393.3, -553], [397.6, -546.2], [401.8, -539.4], [406.1, -532.6], [410.3, -525.9], [414.5, -519.1], [418.8, -512.3], [423, -505.5], [427.3, -498.8], [431.5, -491.9], [435.3, -485], [438.8, -477.8], [442.2, -470.5], [445.6, -463.3], [448.9, -456], [452.1, -448.7], [455.1, -441.2], [458.1, -433.8], [460.9, -426.3], [463.3, -418.7], [465.6, -411.1], [467.9, -403.4], [470.1, -395.7], [472.3, -388], [474.6, -380.4], [476.8, -372.7], [479, -365], [481.2, -357.3], [483.4, -349.6], [485.6, -341.9], [487.8, -334.2], [490, -326.5], [492.2, -318.9], [494.4, -311.2], [496.6, -303.5], [498.8, -295.8], [501, -288.1], [503.2, -280.4], [505.4, -272.7], [507.6, -265.1], [509.8, -257.4], [512, -249.7], [514.2, -242], [516.4, -234.3], [518.6, -226.6], [520.8, -218.9], [523, -211.2], [525.2, -203.6], [527.4, -195.9], [529.6, -188.2], [531.8, -180.5], [534.1, -172.8], [536.3, -165.1], [538.5, -157.4], [540.7, -149.7], [542.9, -142.1], [545.1, -134.4], [547.3, -126.7], [549.5, -119], [551.7, -111.3], [553.9, -103.6], [556.1, -96], [558.4, -88.3], [560.6, -80.6], [562.8, -72.9], [565, -65.2], [567.3, -57.5], [569.5, -49.9], [571.7, -42.2], [573.9, -34.5], [576.2, -26.8], [578.4, -19.1], [580.6, -11.5], [582.8, -3.8], [585, 3.9], [587.3, 11.6], [589.5, 19.3], [591.7, 26.9], [593.9, 34.6], [596.2, 42.3], [598.4, 50], [600.6, 57.7], [602.8, 65.3], [605.1, 73], [607.3, 80.7], [609.5, 88.4], [611.7, 96.1], [613.9, 103.8], [616.2, 111.4], [618.4, 119.1], [620.6, 126.8], [622.8, 134.5], [625.1, 142.2], [627.3, 149.8], [629.5, 157.5], [631.7, 165.2], [634, 172.9], [636.2, 180.6], [638.4, 188.2], [640.6, 195.9], [642.8, 203.6], [645.1, 211.3], [647.3, 219], [649.5, 226.7], [651.7, 234.3], [654, 242], [656.2, 249.7], [658.4, 257.4], [660.6, 265.1], [662.9, 272.7], [665, 280.4], [667.2, 288.1], [669.4, 295.8], [671.5, 303.5], [673.7, 311.2], [675.8, 318.9], [678, 326.6], [680.1, 334.3], [682.3, 342], [684.4, 349.7], [686.5, 357.5], [688.7, 365.2], [690.5, 372.9], [691.6, 380.9], [691.9, 388.8], [691.2, 396.8], [689.4, 404.6], [686, 411.8], [681.4, 418.4], [676, 424.2], [669.9, 429.4], [663.3, 433.9], [656.4, 437.9], [649.7, 442.3], [643.7, 447.6], [638.6, 453.8], [634.5, 460.6], [631.4, 468], [629.1, 475.6], [628, 483.5], [628.2, 491.5], [629.2, 499.5], [630.7, 507.3], [632.4, 515.1], [634.2, 522.9], [635.9, 530.7], [637.7, 538.5], [639.4, 546.3], [641.1, 554.1], [642.9, 561.9], [644.6, 569.7], [646.4, 577.6], [648.1, 585.4], [649.8, 593.2], [650.9, 601.1], [651.2, 609.1], [650.7, 617.1], [649.3, 624.9], [647.1, 632.6], [643.4, 639.7], [638.9, 646.3], [633.8, 652.4], [627.9, 657.8], [621.7, 662.9], [615.2, 667.6], [608.7, 672.2], [602.1, 676.7], [595.5, 681.3], [589, 685.8], [582.4, 690.4], [575.8, 694.9], [569.2, 699.5], [562.6, 704], [556.1, 708.6], [549.5, 713.1], [542.9, 717.7], [536.3, 722.2], [529.8, 726.7], [523.2, 731.3], [516.6, 735.8], [510, 740.4], [503.4, 744.9], [496.9, 749.5], [490.3, 754], [483.7, 758.6], [477.1, 763.1], [470.6, 767.7], [464, 772.2], [457.4, 776.8], [450.8, 781.3], [444.2, 785.9], [437.7, 790.4], [431.1, 794.9], [424.5, 799.5], [417.9, 804], [411.4, 808.6], [404.8, 813.1], [398.2, 817.7], [391.6, 822.2], [385, 826.8], [378.5, 831.3], [371.9, 835.9], [365.3, 840.4], [358.5, 844.7], [351.4, 848.3], [344, 851.2], [336.1, 852.8], [328.2, 853], [320.2, 852], [312.5, 849.9], [305.2, 846.7], [298.5, 842.3], [292.5, 837], [287.5, 830.8], [283.4, 823.9], [280.5, 816.5], [278.6, 808.7], [277.7, 800.8], [277.8, 792.8], [279.5, 785], [282.3, 777.5], [285.9, 770.4], [290.3, 763.7], [295.7, 757.9], [301.9, 752.8], [308.4, 748.1], [315.2, 743.8], [322, 739.6], [328.8, 735.4], [335.6, 731.2], [342.4, 727], [349.2, 722.8], [356, 718.6], [362.8, 714.4], [369.6, 710.2], [376.4, 706], [383.2, 701.8], [390, 697.6], [396.8, 693.4], [403.6, 689.2], [410.4, 685], [417, 680.5], [423.2, 675.4], [428.7, 669.7], [433.5, 663.3], [437.2, 656.2], [439.6, 648.6], [440.9, 640.7], [441.1, 632.7], [440.4, 624.7], [438.8, 616.9], [436.4, 609.3], [433.8, 601.7], [431.3, 594.1], [428.7, 586.6], [426.1, 579], [423.5, 571.4], [420.9, 563.8], [418.4, 556.3], [415.8, 548.7], [413.2, 541.1], [410.6, 533.6], [408.1, 526], [405.5, 518.4], [402.9, 510.9], [400.3, 503.3], [397.7, 495.7], [395.2, 488.1], [392.8, 480.5], [390.6, 472.8], [388.6, 465.1], [386.6, 457.3], [384.6, 449.6], [382.6, 441.9], [380.6, 434.1], [378.7, 426.3], [377, 418.5], [375.5, 410.7], [374, 402.8], [372.5, 395], [371, 387.1], [369.4, 379.3], [367.9, 371.4], [366.4, 363.6], [364.9, 355.7], [363.4, 347.9], [361.9, 340], [360.4, 332.1], [358.9, 324.3], [357.4, 316.4], [355.9, 308.6], [354.4, 300.7], [352.9, 292.9], [351.4, 285], [349.9, 277.2], [348.4, 269.3], [346.9, 261.5], [345.4, 253.6], [344, 245.7], [342.7, 237.9], [341.4, 230], [340.1, 222.1], [338.8, 214.2], [337.5, 206.3], [336.2, 198.4], [334.9, 190.5], [333.6, 182.6], [332.3, 174.7], [331, 166.8], [329.7, 158.9], [328.3, 151.1], [326.9, 143.2], [325.1, 135.4], [322.8, 127.8], [319.7, 120.4], [316.2, 113.2], [311.9, 106.4], [307.2, 100], [301.9, 94], [296.3, 88.3], [290.5, 82.8], [284.2, 77.9], [277.6, 73.4], [270.7, 69.3], [263.5, 65.8], [256.1, 62.8], [248.5, 60.4], [240.7, 58.7], [232.8, 57.5], [224.8, 56.5], [216.9, 55.9], [208.9, 55.4], [200.9, 54.8], [192.9, 54.3], [184.9, 53.7], [177, 53.2], [169, 52.7], [161, 52.4], [153, 52.8], [145.1, 53.6], [137.1, 54.7], [129.3, 56.2], [121.6, 58.3], [113.9, 60.5], [106.3, 63.2], [98.9, 66.2], [91.6, 69.3], [84.4, 72.9], [77.6, 77.1], [71, 81.5], [64.5, 86.3], [58.5, 91.5], [52.6, 96.9], [46.8, 102.4], [41.3, 108.2], [36.5, 114.6], [31.9, 121.2], [27.6, 127.9], [23.6, 134.8], [19.8, 141.9], [16.1, 148.9], [12.5, 156.1], [9.2, 163.3], [6.1, 170.7], [3.2, 178.2], [0.2, 185.6], [-2.8, 193], [-5.7, 200.4], [-8.7, 207.9], [-11.7, 215.3], [-14.6, 222.7], [-17.6, 230.1], [-20.6, 237.6], [-23.5, 245], [-26.5, 252.4], [-29.5, 259.8], [-32.5, 267.3], [-35.4, 274.7], [-38.4, 282.1], [-41.4, 289.5], [-44.3, 297], [-47.3, 304.4], [-50.3, 311.8], [-53.2, 319.2], [-56.2, 326.7], [-59.2, 334.1], [-62.2, 341.5], [-65.2, 348.9], [-68.1, 356.3], [-71.1, 363.8], [-74.1, 371.2], [-77.1, 378.6], [-80.1, 386], [-83, 393.4], [-86, 400.9], [-89, 408.3], [-92, 415.7], [-95, 423.1], [-97.9, 430.5], [-100.9, 438], [-103.9, 445.4], [-106.9, 452.8], [-109.9, 460.2], [-113.2, 467.5], [-116.9, 474.6], [-120.9, 481.5], [-125.2, 488.3], [-130.3, 494.4], [-135.9, 500.1], [-142.1, 505.2], [-148.8, 509.4], [-155.9, 513.2], [-163.2, 516.4], [-170.9, 518.7], [-178.6, 520.5], [-186.6, 521.4], [-194.6, 521.6], [-202.5, 520.9], [-210.4, 519.4], [-218.1, 517.2], [-225.5, 514.3], [-232.7, 510.7], [-239.6, 506.7], [-246.3, 502.4], [-253, 498.1], [-259.9, 494], [-267.1, 490.4], [-274.5, 487.4], [-282.2, 485.2], [-290, 483.8], [-298, 482.9], [-306, 483], [-313.9, 483.9], [-321.8, 485.3], [-329.5, 487.4], [-337, 490.2], [-344.1, 493.8], [-350.7, 498.4], [-356.8, 503.5], [-362.2, 509.4], [-367.1, 515.7], [-371.9, 522.1], [-376.6, 528.6], [-381.1, 535.2], [-385.5, 541.9], [-389.8, 548.6], [-394.1, 555.4], [-398.4, 562.1], [-402.7, 568.8], [-407, 575.6], [-411.3, 582.3], [-415.6, 589.1], [-419.9, 595.8], [-424.2, 602.6], [-428.5, 609.3], [-432.7, 616.1], [-437, 622.8], [-441.3, 629.5], [-445.6, 636.3], [-449.9, 643], [-454.2, 649.8], [-458.5, 656.5], [-462.8, 663.3], [-467.1, 670], [-471.4, 676.8], [-475.7, 683.5], [-480, 690.2], [-484.5, 696.9], [-489.6, 703], [-495.5, 708.4], [-502.1, 712.9], [-509.3, 716.4], [-516.9, 718.7], [-524.8, 720.1], [-532.8, 720.3], [-540.7, 719.4], [-548.4, 717.2], [-555.7, 713.8], [-562.5, 709.7], [-569, 705.1], [-575.5, 700.4], [-582, 695.7], [-588.4, 691], [-594.9, 686.3], [-601.4, 681.6], [-607.8, 676.9], [-614.3, 672.1], [-620.7, 667.4], [-627.2, 662.7], [-633.7, 658], [-640.1, 653.3], [-646.6, 648.5], [-653, 643.8], [-659.5, 639.1], [-665.9, 634.3], [-672, 629.2], [-677.4, 623.3], [-682.2, 616.9], [-686.8, 610.4], [-691.1, 603.7], [-695, 596.7], [-698.2, 589.3], [-700.9, 581.8], [-703, 574.1], [-704.7, 566.3], [-705.8, 558.4], [-706.2, 550.4], [-706.1, 542.4], [-705.3, 534.4], [-704.1, 526.5], [-702.4, 518.7], [-700, 511.1], [-697.3, 503.6], [-694.5, 496.1], [-691.7, 488.6], [-688.9, 481.1], [-686.1, 473.6], [-683.4, 466.1], [-680.6, 458.6], [-677.9, 451.1], [-675.1, 443.5], [-672.1, 436.1], [-668.6, 429], [-664.8, 422], [-660.8, 415], [-656.9, 408], [-653, 401], [-649, 394.1], [-644.8, 387.3], [-640.3, 380.7], [-635.6, 374.2], [-631, 367.7], [-626.4, 361.1], [-621.7, 354.7], [-616.7, 348.4], [-611.5, 342.4], [-606.2, 336.4], [-600.8, 330.4], [-595.5, 324.5], [-590.2, 318.5], [-584.9, 312.5], [-579.5, 306.6], [-573.9, 300.9], [-568.2, 295.3], [-562.5, 289.7], [-556.8, 284.1], [-551.1, 278.5], [-545.3, 272.9], [-539.6, 267.4], [-533.9, 261.8], [-528.2, 256.2], [-522.4, 250.6], [-516.7, 245], [-510.9, 239.5], [-504.8, 234.3], [-498.6, 229.4], [-492.3, 224.4], [-486, 219.5], [-479.6, 214.6], [-473.3, 209.7], [-466.8, 205.2], [-459.9, 201], [-453, 196.9], [-446.1, 192.9], [-439.2, 188.9], [-432.2, 185], [-425.2, 181.2], [-418.1, 177.5], [-411, 173.8], [-403.9, 170.1], [-396.8, 166.4], [-389.7, 162.7], [-382.6, 159], [-375.6, 155.3], [-368.5, 151.6], [-361.4, 147.9], [-354.3, 144.2], [-347.2, 140.5], [-340.1, 136.8], [-333, 133.1], [-325.9, 129.4], [-318.8, 125.8], [-311.7, 122.1], [-304.7, 118.4], [-297.6, 114.7], [-290.5, 111], [-283.4, 107.3], [-276.3, 103.6], [-269.2, 99.9], [-262.1, 96.1], [-255.1, 92.3], [-248.3, 88.1], [-241.5, 83.9], [-234.8, 79.6], [-228.2, 75.1], [-221.8, 70.3], [-215.5, 65.3], [-209.2, 60.4], [-203.1, 55.2], [-197.3, 49.8], [-191.4, 44.3], [-185.7, 38.7], [-180.3, 32.9], [-175.1, 26.8], [-169.9, 20.6], [-164.9, 14.4], [-160, 8.1], [-155.2, 1.7], [-150.5, -4.7], [-146, -11.3], [-141.9, -18.2], [-138.1, -25.2], [-134.2, -32.3], [-130.4, -39.3], [-126.6, -46.3], [-122.9, -53.4], [-119.4, -60.6], [-116.1, -67.9], [-112.8, -75.1], [-109.5, -82.4], [-106.1, -89.7], [-102.8, -97], [-99.6, -104.3], [-96.3, -111.6], [-93, -118.9], [-89.7, -126.2], [-86.5, -133.5], [-83.2, -140.8], [-79.9, -148.1], [-76.6, -155.3], [-73.4, -162.6], [-70.1, -169.9], [-66.8, -177.2], [-63.5, -184.5], [-60.3, -191.8], [-57.3, -199.2], [-54.5, -206.7], [-51.9, -214.3], [-49.7, -222], [-48, -229.8], [-46.6, -237.7], [-45.7, -245.6], [-45.4, -253.6], [-45.2, -261.6], [-45.4, -269.6], [-46.3, -277.5], [-47.7, -285.4], [-49.3, -293.2], [-51.7, -300.9], [-54.5, -308.4], [-57.3, -315.8], [-60.2, -323.3], [-63.1, -330.7], [-66, -338.2], [-68.9, -345.6], [-71.8, -353.1], [-74.7, -360.5], [-77.6, -368], [-80.5, -375.5], [-83.4, -382.9], [-86.2, -390.4], [-89.1, -397.9], [-92, -405.3], [-94.8, -412.8], [-97.7, -420.2], [-100.6, -427.7], [-103.4, -435.2], [-106.3, -442.7], [-109.1, -450.1], [-111.8, -457.6], [-114.6, -465.1], [-117.4, -472.6], [-120.2, -480.1], [-123, -487.6], [-125.8, -495.1], [-128.6, -502.6], [-131.4, -510.1], [-134.2, -517.6], [-136.9, -525.1], [-139.4, -532.7], [-141.5, -540.4], [-143.5, -548.2], [-145.4, -555.9], [-147.3, -563.7], [-149.1, -571.5], [-150.7, -579.3], [-152.2, -587.2], [-153.8, -595], [-155.3, -602.9], [-156.6, -610.8], [-157.7, -618.7], [-158.8, -626.6], [-159.8, -634.5], [-160.8, -642.5], [-161.7, -650.4], [-162.5, -658.4], [-163.3, -666.3], [-164.1, -674.3], [-164.7, -682.2], [-165.3, -690.2], [-165.8, -698.2], [-166.4, -706.2], [-166.9, -714.2], [-167.4, -722.1], [-168, -730.1], [-168.5, -738.1], [-169.1, -746.1], [-169.6, -754.1], [-170.1, -762], [-170.7, -770], [-171.2, -778], [-171.8, -786], [-172.3, -793.9], [-172.9, -801.9], [-173.4, -809.9], [-173.9, -817.9], [-173.7, -825.9], [-171.9, -833.6], [-167.1, -839.9], [-159.9, -843.2], [-151.9, -843.5], [-144, -842.8], [-136, -842.3], [-128, -842.5], [-120.1, -843.8], [-113, -847.4], [-108.2, -853.6], [-106.6, -861.4], [-108.3, -869.2], [-111.7, -876.4], [-115.7, -883.4], [-119.8, -890.2], [-124, -897], [-128.2, -903.9], [-132.3, -910.7], [-136.5, -917.5], [-140.7, -924.3], [-144.8, -931.1], [-149, -938], [-153.2, -944.8], [-157.3, -951.6], [-161.5, -958.4], [-165.6, -965.3], [-169.7, -972.2], [-173.6, -979.1], [-177.6, -986.1], [-181.6, -993], [-185.5, -1e3], [-189.5, -1006.9], [-193.4, -1013.9], [-197.4, -1020.8], [-201.3, -1027.8], [-205.3, -1034.7], [-209.3, -1041.7], [-213.2, -1048.6], [-217.2, -1055.6], [-221.1, -1062.5], [-225.1, -1069.5], [-229.1, -1076.4], [-233, -1083.4], [-237, -1090.3], [-240.9, -1097.3], [-244.9, -1104.2], [-248.8, -1111.2], [-252.8, -1118.1], [-256.8, -1125.1], [-260.7, -1132], [-264.7, -1139], [-268.6, -1145.9], [-272.6, -1152.8], [-276.5, -1159.8], [-280.5, -1166.7]], monza: [[-459, 543.8], [-458.3, 535.8], [-457.6, 527.8], [-456.9, 519.9], [-456.2, 511.9], [-455.5, 503.9], [-454.9, 496], [-454.2, 488], [-453.5, 480], [-452.8, 472.1], [-452.1, 464.1], [-451.5, 456.1], [-450.8, 448.2], [-450.1, 440.2], [-449.4, 432.2], [-448.8, 424.3], [-448.1, 416.3], [-447.4, 408.3], [-446.7, 400.4], [-446.1, 392.4], [-445.4, 384.4], [-444.7, 376.5], [-444, 368.5], [-443.3, 360.5], [-442.7, 352.6], [-442, 344.6], [-441.3, 336.6], [-440.6, 328.7], [-440, 320.7], [-439.3, 312.7], [-438.6, 304.8], [-437.9, 296.8], [-437.2, 288.8], [-436.6, 280.9], [-435.9, 272.9], [-435.2, 265], [-434.5, 257], [-433.9, 249], [-433.2, 241.1], [-432.5, 233.1], [-431.8, 225.1], [-431.1, 217.2], [-430.5, 209.2], [-429.8, 201.2], [-429.1, 193.3], [-428.4, 185.3], [-427.8, 177.3], [-427.1, 169.4], [-426.4, 161.4], [-425.7, 153.4], [-425, 145.5], [-424.4, 137.5], [-423.7, 129.5], [-423, 121.6], [-422.3, 113.6], [-421.7, 105.6], [-421, 97.7], [-420.3, 89.7], [-419.6, 81.7], [-418.9, 73.8], [-418.2, 65.8], [-417.5, 57.8], [-416.8, 49.9], [-416, 41.9], [-415.3, 34], [-414.6, 26], [-413.8, 18], [-413.1, 10.1], [-412.4, 2.1], [-411.6, -5.9], [-410.9, -13.8], [-410.2, -21.8], [-409.4, -29.7], [-408.7, -37.7], [-408, -45.7], [-407.2, -53.6], [-406.5, -61.6], [-405.8, -69.5], [-405, -77.5], [-404.3, -85.5], [-403.6, -93.4], [-402.8, -101.4], [-402.1, -109.4], [-401.3, -117.3], [-400.2, -125.2], [-397.4, -132.7], [-391.3, -137.6], [-383.4, -138.9], [-375.5, -138.5], [-367.5, -138.6], [-360, -141.1], [-354.5, -146.9], [-352.2, -154.5], [-352.7, -162.4], [-354.4, -170.2], [-356.4, -178], [-358.5, -185.7], [-360.5, -193.4], [-362.5, -201.2], [-364.6, -208.9], [-366.6, -216.6], [-368.6, -224.4], [-370.7, -232.1], [-372.7, -239.8], [-374.7, -247.6], [-376.8, -255.3], [-378.7, -263], [-380.3, -270.9], [-381.5, -278.8], [-382.6, -286.7], [-383.5, -294.6], [-384.2, -302.6], [-384.7, -310.6], [-385.1, -318.6], [-385.1, -326.6], [-384.6, -334.5], [-384, -342.5], [-383.5, -350.5], [-382.9, -358.5], [-382.3, -366.4], [-381.7, -374.4], [-381.1, -382.4], [-380.5, -390.4], [-379.9, -398.3], [-379.3, -406.3], [-378.7, -414.3], [-378.1, -422.3], [-377.5, -430.2], [-376.9, -438.2], [-376.3, -446.2], [-375.7, -454.1], [-375.1, -462.1], [-374.5, -470.1], [-373.9, -478.1], [-373.2, -486], [-372.3, -494], [-371.1, -501.9], [-369.7, -509.7], [-368.1, -517.6], [-366.3, -525.4], [-364.4, -533.1], [-362.2, -540.8], [-359.8, -548.4], [-357.2, -556], [-354.5, -563.5], [-351.5, -570.9], [-348.5, -578.3], [-345.3, -585.7], [-342, -592.9], [-338.5, -600.1], [-334.9, -607.3], [-330.9, -614.2], [-326.7, -621], [-322.4, -627.7], [-318, -634.4], [-313.2, -640.9], [-308.3, -647.2], [-303.3, -653.4], [-298.2, -659.5], [-292.8, -665.4], [-287.4, -671.3], [-281.9, -677.1], [-276.3, -682.8], [-270.4, -688.3], [-264.4, -693.6], [-258.4, -698.8], [-252.3, -704], [-246, -708.9], [-239.6, -713.6], [-233.1, -718.3], [-226.6, -722.9], [-219.9, -727.4], [-213.1, -731.5], [-206.2, -735.6], [-199.3, -739.6], [-192.3, -743.5], [-185.2, -747.2], [-178.1, -750.8], [-170.9, -754.4], [-163.8, -758], [-156.5, -761.3], [-149.1, -764.3], [-141.6, -767], [-134, -769.6], [-126.5, -772.2], [-118.9, -774.7], [-111.2, -776.9], [-103.5, -779.1], [-95.8, -781.3], [-88.1, -783.4], [-80.3, -785.3], [-72.5, -786.9], [-64.6, -788.3], [-56.7, -789.6], [-48.9, -791], [-41, -792.3], [-33, -793.3], [-25.1, -794.1], [-17.1, -794.8], [-9.2, -795.5], [-1.2, -796.2], [6.8, -796.9], [14.7, -797.6], [22.7, -798.3], [30.7, -799], [38.6, -799.7], [46.6, -800.4], [54.6, -801], [62.5, -801.7], [70.5, -802.4], [78.4, -803.1], [86.4, -803.8], [94.4, -804.5], [102.3, -805.2], [110.3, -805.8], [118.3, -806.5], [126.2, -807.2], [134.2, -807.9], [142.2, -808.6], [150.1, -809.3], [158.1, -809.9], [166.1, -810.6], [174, -811.3], [182, -811.9], [190, -812.4], [198, -812.9], [205.9, -813.4], [213.9, -813.9], [221.9, -814.3], [229.9, -814.8], [237.9, -815.3], [245.9, -815.8], [253.8, -816.2], [261.8, -816.7], [269.8, -817.2], [277.8, -817.7], [285.8, -818.2], [293.7, -818.6], [301.7, -819.1], [309.7, -819.6], [317.7, -820.1], [325.7, -820.5], [333.6, -821], [341.6, -821.5], [349.6, -822], [357.6, -822.5], [365.6, -822.9], [373.5, -823.4], [381.5, -823.9], [389.5, -824.4], [397.5, -825.1], [405.3, -826.7], [412.2, -830.6], [417.2, -836.7], [420.2, -844.2], [422.4, -851.8], [425, -859.4], [428.9, -866.3], [435.1, -871.3], [442.6, -874], [450.4, -875.7], [458.3, -877.2], [466.1, -878.6], [474, -880.2], [481.8, -881.9], [489.6, -883.6], [497.4, -885.4], [505.1, -887.4], [512.8, -889.8], [520.4, -892.3], [528, -894.7], [535.6, -897.2], [543.2, -899.7], [550.8, -902.2], [558.4, -904.7], [565.9, -907.3], [573.5, -909.8], [581.1, -912.4], [588.7, -914.9], [596.2, -917.5], [603.8, -920], [611.4, -922.6], [619, -925.1], [626.6, -927.7], [634.1, -930.2], [641.7, -932.8], [649.3, -935.3], [656.9, -937.9], [664.5, -940.4], [672, -942.9], [679.6, -945.5], [687.2, -948], [694.8, -950.6], [702.3, -953.1], [709.9, -955.7], [717.5, -958.2], [725.1, -960.8], [732.7, -963.3], [740.2, -965.8], [747.9, -968.1], [755.7, -969.9], [763.6, -971.2], [771.6, -971.5], [779.6, -971], [787.5, -969.8], [795.2, -967.9], [802.7, -965], [809.8, -961.4], [816.6, -957.2], [823.1, -952.6], [829.1, -947.3], [834.6, -941.5], [839.6, -935.3], [844, -928.6], [847.5, -921.4], [850.2, -913.9], [852, -906.1], [853.3, -898.2], [854.2, -890.3], [855, -882.3], [855.7, -874.4], [856.4, -866.4], [857.1, -858.4], [857.9, -850.5], [858.6, -842.5], [859.3, -834.5], [860, -826.6], [860.7, -818.6], [861.5, -810.7], [862.2, -802.7], [863, -794.7], [863.8, -786.8], [864.6, -778.8], [865.4, -770.9], [866.2, -762.9], [867, -755], [867.8, -747], [868.6, -739.1], [869.4, -731.1], [870.2, -723.1], [871, -715.2], [871.8, -707.2], [872.6, -699.3], [873.4, -691.3], [874.2, -683.4], [875, -675.4], [875.8, -667.5], [876.6, -659.5], [877.4, -651.6], [878, -643.6], [878, -635.6], [877.3, -627.6], [875.4, -619.9], [871.9, -612.7], [866.8, -606.6], [860.5, -601.6], [853.8, -597.3], [846.9, -593.2], [839.9, -589.4], [832.9, -585.6], [825.9, -581.8], [818.8, -578], [811.8, -574.2], [804.8, -570.4], [797.7, -566.6], [790.7, -562.8], [783.7, -559], [776.6, -555.2], [769.6, -551.4], [762.6, -547.6], [755.5, -543.8], [748.5, -540], [741.5, -536.2], [734.4, -532.4], [727.4, -528.5], [720.4, -524.7], [713.4, -520.8], [706.4, -516.9], [699.5, -513], [692.5, -509.1], [685.5, -505.2], [678.5, -501.3], [671.6, -497.4], [664.6, -493.4], [657.6, -489.5], [650.6, -485.6], [643.7, -481.7], [636.7, -477.8], [629.7, -473.9], [622.7, -470], [615.8, -466.1], [608.8, -462.2], [601.8, -458.4], [594.8, -454.5], [587.8, -450.6], [580.8, -446.8], [573.8, -442.9], [566.8, -439.1], [559.8, -435.2], [552.8, -431.3], [545.8, -427.4], [538.9, -423.4], [532, -419.4], [525.1, -415.3], [518.3, -411.1], [511.6, -406.7], [505.1, -402.1], [498.6, -397.5], [492, -392.9], [485.5, -388.2], [479.1, -383.5], [472.7, -378.7], [466.4, -373.8], [460, -368.9], [453.9, -363.8], [447.8, -358.6], [441.8, -353.3], [435.8, -348], [429.8, -342.8], [423.7, -337.6], [417.6, -332.4], [411.6, -327.2], [405.5, -322], [399.4, -316.8], [393.4, -311.6], [387.3, -306.3], [381.2, -301.1], [375.2, -295.9], [369.1, -290.7], [363, -285.5], [357, -280.3], [350.9, -275.1], [344.8, -269.9], [338.8, -264.7], [332.7, -259.5], [326.7, -254.2], [320.6, -249], [314.6, -243.7], [308.7, -238.3], [302.8, -233], [296.9, -227.6], [291, -222.2], [285, -216.8], [279.1, -211.5], [273.2, -206.1], [267.3, -200.7], [261.4, -195.3], [255.4, -190], [249.5, -184.6], [243.6, -179.2], [237.6, -173.9], [231.7, -168.6], [225.7, -163.3], [219.7, -158], [213.6, -152.7], [207.6, -147.5], [201.6, -142.2], [195.6, -136.9], [189.6, -131.6], [183.6, -126.4], [177.6, -121.1], [171.6, -115.8], [165.6, -110.5], [159.6, -105.3], [153.6, -100], [147.6, -94.7], [141.6, -89.4], [135.6, -84.2], [129.6, -78.9], [123.5, -73.6], [117.5, -68.3], [111.5, -63], [105.5, -57.8], [99.5, -52.5], [93.5, -47.2], [87.5, -41.9], [81.5, -36.7], [75.5, -31.4], [69.5, -26.1], [63.5, -20.8], [57.5, -15.6], [51.5, -10.3], [45.5, -5], [39.5, 0.3], [33.5, 5.6], [27.5, 10.8], [21.5, 16.1], [15.5, 21.4], [9.5, 26.7], [3.5, 32], [-2.5, 37.3], [-8.6, 42.5], [-14.6, 47.8], [-20.6, 53.1], [-26.6, 58.4], [-32.6, 63.7], [-38.5, 69], [-44.3, 74.6], [-49.8, 80.3], [-54.9, 86.5], [-58.6, 93.5], [-60.4, 101.3], [-60.7, 109.3], [-60.3, 117.3], [-59.2, 125.2], [-58.1, 133.1], [-57.2, 141.1], [-56.6, 149], [-56.3, 157], [-56.4, 165], [-56.9, 173], [-58.2, 180.9], [-60.3, 188.6], [-62.8, 196.2], [-65.7, 203.6], [-69.1, 210.8], [-73.2, 217.7], [-77.7, 224.3], [-82.6, 230.6], [-87.8, 236.7], [-93.3, 242.5], [-99.3, 247.8], [-105.4, 253], [-111.6, 258], [-117.8, 263.1], [-123.4, 268.8], [-127.9, 275.3], [-131.2, 282.6], [-133.6, 290.3], [-135.4, 298], [-136.8, 305.9], [-137.8, 313.8], [-138.8, 321.8], [-139.8, 329.7], [-140.7, 337.6], [-141.7, 345.6], [-142.7, 353.5], [-143.6, 361.4], [-144.6, 369.4], [-145.6, 377.3], [-146.5, 385.3], [-147.5, 393.2], [-148.5, 401.1], [-149.4, 409.1], [-150.4, 417], [-151.3, 424.9], [-152.3, 432.9], [-153.2, 440.8], [-154.2, 448.8], [-155.1, 456.7], [-156.1, 464.6], [-157, 472.6], [-157.9, 480.5], [-158.8, 488.5], [-159.6, 496.4], [-160.4, 504.4], [-161.3, 512.3], [-162.1, 520.3], [-162.9, 528.2], [-163.7, 536.2], [-164.6, 544.1], [-165.4, 552.1], [-166.2, 560], [-167, 568], [-167.8, 575.9], [-168.7, 583.9], [-169.5, 591.8], [-170.3, 599.8], [-171.1, 607.8], [-172, 615.7], [-172.8, 623.7], [-173.6, 631.6], [-174.4, 639.6], [-175.2, 647.5], [-176.1, 655.5], [-176.9, 663.4], [-177.7, 671.4], [-178.5, 679.3], [-179.4, 687.3], [-180.2, 695.2], [-181, 703.2], [-181.8, 711.1], [-182.6, 719.1], [-183.5, 727], [-184.3, 735], [-185.1, 742.9], [-185.9, 750.9], [-186.8, 758.9], [-187.6, 766.8], [-188.4, 774.8], [-189.2, 782.7], [-190, 790.7], [-190.9, 798.6], [-191.7, 806.6], [-192.5, 814.5], [-193.3, 822.5], [-194.1, 830.4], [-195, 838.4], [-195.8, 846.3], [-196.6, 854.3], [-197.4, 862.2], [-198.3, 870.2], [-199.1, 878.1], [-199.9, 886.1], [-200.7, 894], [-201.5, 902], [-202.4, 910], [-203.2, 917.9], [-204, 925.9], [-204.8, 933.8], [-205.7, 941.8], [-206.5, 949.7], [-207.3, 957.7], [-208.1, 965.6], [-208.9, 973.6], [-209.8, 981.5], [-210.6, 989.5], [-211.4, 997.4], [-212.2, 1005.4], [-213.1, 1013.3], [-213.9, 1021.3], [-214.7, 1029.2], [-215.5, 1037.2], [-216.3, 1045.1], [-217.2, 1053.1], [-218, 1061.1], [-218.8, 1069], [-219.6, 1077], [-220.5, 1084.9], [-221.3, 1092.9], [-222.1, 1100.8], [-222.9, 1108.8], [-223.7, 1116.7], [-224.6, 1124.7], [-225.4, 1132.6], [-226.2, 1140.6], [-227, 1148.5], [-227.9, 1156.5], [-228.7, 1164.4], [-229.5, 1172.4], [-230.3, 1180.3], [-231.1, 1188.3], [-232, 1196.2], [-232.8, 1204.2], [-233.6, 1212.2], [-234.4, 1220.1], [-235.3, 1228.1], [-236.1, 1236], [-236.9, 1244], [-237.7, 1251.9], [-238.5, 1259.9], [-239.4, 1267.8], [-240.2, 1275.8], [-241, 1283.7], [-241.8, 1291.7], [-242.7, 1299.6], [-243.5, 1307.6], [-244.4, 1315.5], [-245.3, 1323.5], [-246.2, 1331.4], [-247.3, 1339.3], [-248.7, 1347.2], [-250.8, 1354.9], [-253.7, 1362.4], [-257.4, 1369.5], [-261.8, 1376.1], [-267, 1382.2], [-272.6, 1387.9], [-278.6, 1393.2], [-285, 1397.9], [-291.8, 1402.2], [-298.9, 1405.7], [-306.4, 1408.6], [-314.1, 1410.8], [-321.9, 1412.5], [-329.8, 1413.6], [-337.8, 1413.7], [-345.8, 1413.1], [-353.7, 1411.8], [-361.5, 1410], [-369.1, 1407.6], [-376.6, 1404.8], [-384, 1401.8], [-391.3, 1398.6], [-398.4, 1395], [-405.3, 1390.9], [-411.8, 1386.3], [-418.3, 1381.5], [-424.5, 1376.6], [-430.5, 1371.3], [-436.1, 1365.6], [-441.5, 1359.7], [-446.7, 1353.6], [-451.6, 1347.3], [-456.1, 1340.7], [-460.5, 1334], [-464.5, 1327.1], [-468.3, 1320.1], [-471.8, 1312.8], [-474.9, 1305.5], [-477.9, 1298.1], [-480.7, 1290.6], [-483.4, 1283.1], [-486, 1275.5], [-488.3, 1267.8], [-490.4, 1260.1], [-492.4, 1252.4], [-494, 1244.6], [-495.3, 1236.7], [-496.4, 1228.8], [-497.4, 1220.8], [-498.3, 1212.9], [-499.1, 1204.9], [-499.9, 1197], [-500.3, 1189], [-500.5, 1181], [-500.7, 1173], [-500.8, 1165], [-500.9, 1157], [-501.1, 1149], [-501.2, 1141], [-501.3, 1133], [-501.5, 1125], [-501.7, 1117], [-501.9, 1109], [-502.1, 1101.1], [-502.3, 1093.1], [-502.5, 1085.1], [-502.7, 1077.1], [-502.9, 1069.1], [-503.1, 1061.1], [-503.2, 1053.1], [-503.4, 1045.1], [-503.5, 1037.1], [-503.7, 1029.1], [-503.8, 1021.1], [-503.8, 1013.1], [-503.7, 1005.1], [-503.6, 997.1], [-503.4, 989.1], [-503.3, 981.2], [-503.1, 973.2], [-502.9, 965.2], [-502.6, 957.2], [-502, 949.2], [-501.3, 941.2], [-500.6, 933.3], [-499.9, 925.3], [-499.2, 917.4], [-498.5, 909.4], [-497.8, 901.4], [-497.1, 893.5], [-496.4, 885.5], [-495.6, 877.5], [-494.8, 869.6], [-493.9, 861.6], [-493.1, 853.7], [-492.3, 845.7], [-491.5, 837.8], [-490.6, 829.8], [-489.8, 821.9], [-489, 813.9], [-488.2, 806], [-487.3, 798], [-486.5, 790.1], [-485.7, 782.1], [-484.8, 774.2], [-484, 766.2], [-483.2, 758.3], [-482.4, 750.3], [-481.5, 742.4], [-480.7, 734.4], [-479.9, 726.4], [-479.1, 718.5], [-478.2, 710.5], [-477.4, 702.6], [-476.6, 694.6], [-475.8, 686.7], [-474.9, 678.7], [-474.1, 670.8], [-473.3, 662.8], [-472.5, 654.9], [-471.6, 646.9], [-470.7, 639], [-469.7, 631.1], [-468.7, 623.1], [-467.7, 615.2], [-466.8, 607.2], [-465.8, 599.3], [-464.8, 591.4], [-463.8, 583.4], [-462.8, 575.5], [-461.9, 567.6], [-460.9, 559.6], [-459.9, 551.7]], suzuka: [[753.5, 152.3], [758.6, 158.4], [763.7, 164.6], [768.8, 170.7], [774, 176.9], [779.1, 183], [784.2, 189.2], [789.3, 195.4], [794.4, 201.5], [799.5, 207.7], [804.6, 213.8], [809.8, 220], [814.9, 226.1], [820, 232.3], [825.1, 238.4], [830.2, 244.6], [835.3, 250.7], [840.4, 256.9], [845.5, 263.1], [850.7, 269.2], [855.8, 275.4], [860.9, 281.5], [866, 287.7], [871.1, 293.8], [876.2, 300], [881.3, 306.1], [886.4, 312.3], [891.5, 318.5], [896.6, 324.7], [901.6, 330.9], [906.7, 337.1], [911.8, 343.3], [916.8, 349.5], [921.9, 355.7], [926.9, 361.9], [932, 368.1], [937, 374.3], [942.1, 380.5], [947.2, 386.7], [952.2, 392.9], [957.3, 399.1], [962.3, 405.3], [967.4, 411.5], [972.5, 417.7], [977.5, 423.9], [982.6, 430.1], [987.6, 436.3], [992.7, 442.5], [997.8, 448.7], [1002.8, 454.9], [1007.9, 461.1], [1012.9, 467.3], [1018, 473.5], [1023, 479.7], [1028.1, 485.9], [1033.2, 492.1], [1038.2, 498.3], [1043.1, 504.6], [1047.8, 511.1], [1052.4, 517.7], [1056.4, 524.6], [1059.7, 531.9], [1062.5, 539.4], [1064.8, 547], [1066.7, 554.8], [1068, 562.7], [1068.4, 570.7], [1068.2, 578.7], [1067.4, 586.7], [1066.1, 594.5], [1064, 602.3], [1061.6, 609.9], [1059.2, 617.5], [1056.7, 625.1], [1054.2, 632.7], [1051.8, 640.4], [1049.2, 647.9], [1046, 655.2], [1042, 662.2], [1037.1, 668.5], [1031.3, 674], [1024.9, 678.9], [1018, 682.8], [1010.5, 685.6], [1002.7, 687.5], [994.8, 688.5], [986.8, 688.5], [978.8, 687.5], [971.1, 685.4], [963.7, 682.5], [956.8, 678.5], [950.4, 673.6], [944.5, 668.3], [939.4, 662.1], [934.9, 655.5], [930.5, 648.8], [926.1, 642.1], [921.7, 635.4], [917.3, 628.7], [913, 622], [908.6, 615.3], [904.2, 608.6], [899.9, 601.9], [895.5, 595.2], [891.1, 588.5], [886.8, 581.8], [882.4, 575.1], [878, 568.4], [873.7, 561.7], [869.3, 555], [864.9, 548.3], [860.5, 541.5], [856.2, 534.8], [851.8, 528.1], [847.4, 521.4], [843.1, 514.7], [838.7, 508], [834, 501.6], [828.4, 495.8], [822.4, 490.6], [815.8, 486], [808.5, 482.8], [800.8, 480.6], [793, 478.9], [785.1, 477.6], [777.1, 476.7], [769.1, 476.4], [761.1, 476.3], [753.1, 476.2], [745.1, 476.1], [737.1, 476], [729.2, 475.1], [721.4, 473.2], [713.7, 471], [706.4, 467.9], [699.5, 463.8], [693.1, 459], [687.3, 453.4], [682.2, 447.3], [677.7, 440.7], [674.3, 433.5], [671.6, 425.9], [669.3, 418.3], [667.3, 410.5], [665.2, 402.8], [663.2, 395], [661.1, 387.3], [659.1, 379.6], [657.1, 371.8], [655, 364.1], [653, 356.4], [650.8, 348.7], [648.2, 341.1], [645.1, 333.7], [641.6, 326.5], [637.2, 319.8], [632.3, 313.5], [626.9, 307.6], [620.8, 302.4], [614.3, 297.7], [607.5, 293.6], [600.4, 290], [593, 286.8], [585.4, 284.3], [577.6, 282.6], [569.7, 281.4], [561.7, 280.8], [553.7, 280.6], [545.7, 280.5], [537.7, 280.3], [529.7, 280.2], [521.7, 280.1], [513.7, 279.6], [505.8, 278.5], [497.9, 277.1], [490.1, 275.3], [482.6, 272.6], [475.4, 269.2], [468.4, 265.2], [461.9, 260.5], [455.7, 255.5], [450.2, 249.7], [445.4, 243.3], [441, 236.6], [437.2, 229.6], [434.1, 222.2], [431.3, 214.7], [429.3, 207], [427.8, 199.1], [427, 191.2], [427, 183.2], [427.7, 175.2], [429.2, 167.3], [431.4, 159.6], [433.9, 152.1], [436.7, 144.5], [439.4, 137], [442.2, 129.5], [444.9, 122], [447.7, 114.5], [450.4, 107], [453.2, 99.5], [455.9, 91.9], [458.3, 84.3], [460.3, 76.5], [461.5, 68.6], [461.9, 60.7], [461.7, 52.7], [460.4, 44.8], [458.2, 37.1], [455.5, 29.5], [452.4, 22.2], [448.5, 15.2], [443.9, 8.6], [438.4, 2.8], [432.1, -2.1], [425.5, -6.7], [418.8, -11], [411.8, -14.9], [404.8, -18.7], [397.7, -22.5], [390.6, -26.2], [383.5, -29.8], [376.3, -33.4], [369.1, -36.9], [361.8, -40.1], [354.4, -43.1], [347, -46.1], [339.4, -48.7], [331.8, -51], [324, -53.1], [316.2, -54.7], [308.3, -56.1], [300.4, -57.3], [292.5, -58.2], [284.5, -58.5], [276.5, -58.6], [268.5, -58.7], [260.5, -58.6], [252.5, -58.4], [244.5, -57.9], [236.6, -56.8], [228.8, -54.9], [221.1, -52.6], [213.6, -49.8], [206.2, -46.8], [198.9, -43.6], [191.5, -40.5], [184.1, -37.3], [176.9, -33.9], [169.8, -30.1], [162.9, -26.2], [155.9, -22.2], [149.2, -17.8], [142.9, -12.9], [136.7, -7.9], [130.5, -2.8], [124.4, 2.3], [118.5, 7.7], [112.9, 13.4], [107.4, 19.2], [101.9, 25.1], [96.5, 31], [91.3, 37], [86.2, 43.2], [81.1, 49.4], [76, 55.5], [70.9, 61.7], [65.8, 67.9], [60.7, 74.1], [55.6, 80.2], [50.5, 86.4], [45.4, 92.6], [40.3, 98.8], [35.3, 104.9], [30.2, 111.1], [25.1, 117.3], [20, 123.5], [14.9, 129.6], [9.8, 135.8], [4.7, 142], [-0.4, 148.2], [-5.5, 154.3], [-11.3, 159.7], [-18.7, 162.8], [-26.5, 164.5], [-34.4, 165.5], [-42.4, 166.3], [-50.4, 167], [-58.3, 167.7], [-66.3, 168.4], [-74.3, 169.2], [-82.2, 169.9], [-90.2, 170.6], [-98.2, 171.3], [-106.2, 172], [-114.1, 172.8], [-122.1, 173.5], [-130.1, 174.2], [-138, 174.9], [-146, 175.6], [-154, 176.3], [-161.9, 177.1], [-169.9, 177.6], [-177.9, 177.3], [-185.6, 175.1], [-192, 170.4], [-196.2, 163.6], [-198.6, 156], [-200.4, 148.2], [-202.2, 140.4], [-204.1, 132.6], [-205.9, 124.9], [-207.8, 117.1], [-209.7, 109.3], [-211.6, 101.5], [-213.5, 93.8], [-215.4, 86], [-217.3, 78.2], [-219.2, 70.4], [-221, 62.7], [-222.8, 54.8], [-224.2, 47], [-225.6, 39.1], [-227, 31.2], [-228.3, 23.3], [-229.7, 15.4], [-231, 7.5], [-232.4, -0.3], [-233.8, -8.2], [-235.1, -16.1], [-236.5, -24], [-237.9, -31.9], [-239.2, -39.8], [-240.6, -47.7], [-241.9, -55.5], [-243.3, -63.4], [-244.7, -71.3], [-246, -79.2], [-247.4, -87.1], [-248.8, -95], [-250.1, -102.8], [-251.5, -110.7], [-252.9, -118.6], [-254.3, -126.5], [-255.7, -134.4], [-257.1, -142.3], [-258.2, -150.2], [-259.1, -158.1], [-259.3, -166.1], [-258.9, -174.1], [-258, -182.1], [-256.7, -189.9], [-254.9, -197.8], [-252.6, -205.4], [-249.8, -212.9], [-246.7, -220.3], [-243.6, -227.7], [-240.4, -235], [-237.2, -242.3], [-234, -249.7], [-230.8, -257], [-227.6, -264.3], [-224.4, -271.7], [-221.2, -279], [-218.1, -286.4], [-215.8, -294], [-215.7, -302], [-218.7, -309.3], [-224.2, -315.1], [-231.3, -318.8], [-239.1, -320.2], [-246.9, -318.6], [-253.6, -314.3], [-259, -308.4], [-263.5, -301.8], [-267.7, -295], [-271.7, -288.1], [-275.7, -281.1], [-279.7, -274.2], [-283.8, -267.3], [-287.8, -260.4], [-291.8, -253.4], [-295.8, -246.5], [-299.9, -239.7], [-304.1, -232.8], [-308.3, -226], [-312.6, -219.3], [-316.8, -212.5], [-321, -205.7], [-325.3, -198.9], [-329.7, -192.2], [-334.2, -185.6], [-338.8, -179], [-343.4, -172.5], [-348.3, -166.2], [-353.5, -160.1], [-358.8, -154.1], [-364.6, -148.5], [-370.6, -143.3], [-376.8, -138.2], [-383, -133.2], [-389.3, -128.3], [-395.8, -123.6], [-402.6, -119.4], [-409.7, -115.6], [-416.8, -112], [-424.2, -109], [-431.8, -106.6], [-439.5, -104.3], [-447.3, -102.5], [-455.2, -101.1], [-463.1, -100], [-471, -98.8], [-479, -97.7], [-486.9, -96.7], [-494.9, -96], [-502.9, -95.7], [-510.9, -95.3], [-518.9, -95], [-526.9, -94.8], [-534.8, -95], [-542.8, -95.6], [-550.8, -96.2], [-558.8, -97], [-566.7, -98.4], [-574.5, -100], [-582.3, -101.7], [-590.1, -103.5], [-597.9, -105.3], [-605.6, -107.4], [-613.3, -109.5], [-621, -111.7], [-628.7, -113.9], [-636.4, -116.2], [-644, -118.8], [-651.5, -121.6], [-659, -124.4], [-666.5, -127.2], [-674, -130], [-681.4, -132.9], [-688.7, -136.1], [-696, -139.4], [-703.3, -142.8], [-710.4, -146.4], [-717.4, -150.3], [-724.3, -154.4], [-731.1, -158.5], [-737.8, -162.9], [-744.3, -167.6], [-750.7, -172.4], [-757.1, -177.3], [-763.2, -182.4], [-769.2, -187.7], [-775.1, -193.1], [-781, -198.5], [-786.7, -204.2], [-792.1, -210], [-797.5, -216], [-802.8, -221.9], [-808, -228], [-812.8, -234.4], [-817.3, -241], [-821.8, -247.6], [-826.1, -254.4], [-830.2, -261.3], [-834.1, -268.3], [-837.9, -275.3], [-841.3, -282.5], [-844.3, -290], [-847.1, -297.4], [-849.9, -304.9], [-852.8, -312.4], [-855.6, -319.9], [-858.4, -327.4], [-861.2, -334.9], [-864, -342.4], [-866.8, -349.9], [-869.6, -357.4], [-872.5, -364.9], [-875.3, -372.3], [-878.3, -379.8], [-881.6, -387.1], [-884.9, -394.3], [-888.2, -401.6], [-891.6, -408.9], [-895, -416.1], [-898.6, -423.3], [-902.6, -430.2], [-907, -436.9], [-912.3, -442.8], [-918.3, -448.1], [-925, -452.5], [-932.2, -455.9], [-939.8, -458.7], [-947.5, -460.6], [-955.4, -461.9], [-963.4, -462.7], [-971.4, -462.7], [-979.4, -462.5], [-987.4, -461.9], [-995.3, -461], [-1003.2, -459.8], [-1011.1, -458.4], [-1018.9, -456.8], [-1026.7, -455], [-1034.4, -452.8], [-1041.9, -449.9], [-1049.3, -446.8], [-1056.3, -443.1], [-1062.9, -438.5], [-1069.2, -433.5], [-1074.7, -427.8], [-1079.3, -421.2], [-1083.2, -414.2], [-1086, -406.7], [-1087.8, -399], [-1088.5, -391], [-1088.3, -383], [-1087.5, -375], [-1085.8, -367.2], [-1083.4, -359.6], [-1080.6, -352.1], [-1077.2, -344.8], [-1073, -338.1], [-1067.9, -331.9], [-1062.3, -326.1], [-1056.6, -320.5], [-1050.8, -315.1], [-1044.9, -309.6], [-1039, -304.2], [-1033, -298.9], [-1026.9, -293.8], [-1020.7, -288.7], [-1014.6, -283.6], [-1008.4, -278.4], [-1002.4, -273.2], [-996.3, -267.9], [-990.3, -262.7], [-984.3, -257.4], [-978.2, -252.2], [-972, -247.2], [-965.6, -242.4], [-959.2, -237.5], [-952.8, -232.7], [-946.5, -227.9], [-940, -223.1], [-933.5, -218.4], [-926.9, -213.9], [-920.3, -209.4], [-913.7, -204.9], [-907.1, -200.4], [-900.5, -195.9], [-893.8, -191.5], [-887.1, -187.2], [-880.3, -182.9], [-873.5, -178.7], [-866.7, -174.4], [-859.9, -170.2], [-853.1, -166], [-846.1, -162.1], [-838.9, -158.6], [-831.7, -155.1], [-824.5, -151.7], [-817.3, -148.3], [-810, -144.8], [-802.8, -141.4], [-795.6, -137.8], [-788.5, -134.2], [-781.4, -130.6], [-774.3, -126.9], [-767.1, -123.3], [-760, -119.7], [-752.7, -116.3], [-745.3, -113.3], [-737.9, -110.4], [-730.4, -107.5], [-722.9, -104.7], [-715.4, -101.9], [-707.9, -99.1], [-700.4, -96.4], [-692.8, -93.8], [-685.3, -91.1], [-677.7, -88.5], [-670.1, -85.9], [-662.6, -83.3], [-655, -80.7], [-647.4, -78.1], [-639.9, -75.4], [-632.4, -72.7], [-624.9, -69.9], [-617.4, -67], [-610, -64.1], [-602.5, -61.2], [-595, -58.3], [-587.6, -55.4], [-580.1, -52.5], [-572.7, -49.6], [-565.2, -46.7], [-557.8, -43.8], [-550.3, -40.9], [-542.8, -38.2], [-535.2, -35.6], [-527.7, -32.9], [-520.1, -30.3], [-512.5, -27.6], [-505, -25], [-497.4, -22.3], [-489.9, -19.7], [-482.3, -17], [-474.8, -14.4], [-467.2, -11.7], [-459.7, -9.1], [-452.1, -6.5], [-444.5, -4], [-436.9, -1.6], [-429.3, 0.8], [-421.6, 3.2], [-414, 5.7], [-406.4, 8.1], [-398.7, 10.5], [-391.1, 12.9], [-383.5, 15.3], [-375.8, 17.7], [-368.2, 20.1], [-360.6, 22.5], [-353, 25], [-345.4, 27.5], [-337.8, 30.1], [-330.3, 32.8], [-322.7, 35.4], [-315.1, 38], [-307.6, 40.6], [-300, 43.2], [-292.4, 45.8], [-284.9, 48.5], [-277.4, 51.3], [-269.9, 54.1], [-262.4, 57], [-255, 59.8], [-247.5, 62.7], [-240, 65.5], [-232.5, 68.4], [-225.1, 71.2], [-217.6, 74.1], [-210.1, 77], [-202.6, 79.8], [-195.1, 82.5], [-187.4, 84.7], [-179.6, 86.6], [-171.7, 87.9], [-163.8, 88.4], [-155.8, 88.4], [-147.8, 87.6], [-139.9, 86.1], [-132.1, 84.5], [-124.3, 82.5], [-116.6, 80.3], [-109, 77.9], [-101.5, 75.1], [-94.1, 72.2], [-86.6, 69.4], [-79.1, 66.4], [-71.8, 63.2], [-64.6, 59.8], [-57.4, 56.2], [-50.3, 52.6], [-43.2, 48.9], [-36.2, 45], [-29.3, 40.9], [-22.5, 36.7], [-15.7, 32.4], [-9.1, 28], [-2.7, 23.2], [3.6, 18.3], [9.9, 13.3], [16.2, 8.4], [22.3, 3.2], [28.2, -2.3], [34, -7.7], [39.8, -13.2], [45.7, -18.7], [51.5, -24.1], [57.4, -29.6], [63.2, -35.1], [69, -40.5], [74.9, -46], [80.7, -51.5], [86.6, -56.9], [92.4, -62.4], [98.3, -67.8], [104.1, -73.3], [110, -78.8], [115.9, -84.2], [121.7, -89.7], [127.6, -95.1], [133.4, -100.6], [139.3, -106], [145.1, -111.5], [151, -116.9], [157.1, -122.1], [163.3, -127.2], [169.5, -132.3], [175.8, -137.1], [182.3, -141.8], [188.9, -146.3], [195.6, -150.8], [202.3, -155.1], [209.4, -158.8], [217.2, -159.8], [224.7, -157], [231, -152.2], [237, -146.9], [243.1, -141.6], [249.3, -136.6], [256.2, -132.6], [264, -130.9], [271.9, -132], [279.1, -135.5], [285.6, -140.1], [291.7, -145.3], [297.6, -150.6], [303.7, -155.8], [310.1, -160.6], [316.6, -165.3], [323.3, -169.7], [330.4, -173.3], [337.8, -176.4], [345.3, -179.2], [353.1, -180.8], [361.1, -181.6], [369.1, -182.3], [377.1, -182.6], [385.1, -182.3], [393, -181.9], [401, -181.2], [408.9, -179.9], [416.8, -178.3], [424.6, -176.6], [432.3, -174.5], [439.8, -171.7], [447.3, -168.8], [454.7, -165.8], [462, -162.6], [469.2, -159.2], [476.4, -155.7], [483.4, -151.8], [490.1, -147.4], [496.8, -142.9], [503.4, -138.4], [509.8, -133.7], [516, -128.6], [521.9, -123.2], [527.7, -117.7], [533.6, -112.3], [539.2, -106.6], [544.6, -100.7], [550, -94.8], [555.3, -88.8], [560.7, -82.8], [565.9, -76.8], [571, -70.7], [576.1, -64.5], [581.2, -58.3], [586.2, -52.1], [591.3, -45.9], [596.4, -39.7], [601.5, -33.5], [606.5, -27.3], [611.6, -21.1], [616.7, -14.9], [621.7, -8.7], [626.8, -2.5], [631.9, 3.7], [636.9, 9.8], [642, 16], [647.1, 22.2], [652.1, 28.4], [657.2, 34.6], [662.3, 40.8], [667.3, 47], [672.4, 53.2], [677.5, 59.4], [682.5, 65.6], [687.6, 71.8], [692.7, 78], [697.8, 84.2], [702.8, 90.3], [707.9, 96.5], [713, 102.7], [718, 108.9], [723.1, 115.1], [728.2, 121.3], [733.2, 127.5], [738.3, 133.7], [743.4, 139.9], [748.4, 146.1]], mexico: [[-533, -429.2], [-525.1, -428.1], [-517.1, -427], [-509.2, -425.9], [-501.3, -424.8], [-493.4, -423.7], [-485.4, -422.6], [-477.5, -421.5], [-469.6, -420.4], [-461.7, -419.3], [-453.7, -418.2], [-445.8, -417.1], [-437.9, -416], [-429.9, -414.9], [-422, -413.8], [-414.1, -412.7], [-406.2, -411.6], [-398.2, -410.5], [-390.3, -409.4], [-382.4, -408.2], [-374.4, -407.1], [-366.5, -406], [-358.6, -404.9], [-350.7, -403.8], [-342.7, -402.7], [-334.8, -401.6], [-326.9, -400.5], [-318.9, -399.4], [-311, -398.3], [-303.1, -397.2], [-295.2, -396.1], [-287.2, -395], [-279.3, -393.9], [-271.4, -392.8], [-263.5, -391.7], [-255.5, -390.6], [-247.6, -389.5], [-239.7, -388.4], [-231.7, -387.3], [-223.8, -386.2], [-215.9, -385.1], [-208, -384], [-200, -382.9], [-192.1, -381.8], [-184.2, -380.7], [-176.2, -379.6], [-168.3, -378.5], [-160.4, -377.4], [-152.5, -376.3], [-144.5, -375.2], [-136.6, -374.2], [-128.7, -373.1], [-120.7, -372.1], [-112.8, -371], [-104.9, -370], [-96.9, -368.9], [-89, -367.9], [-81, -366.9], [-73.1, -365.8], [-65.2, -364.8], [-57.2, -363.7], [-49.3, -362.7], [-41.4, -361.6], [-33.4, -360.6], [-25.5, -359.6], [-17.6, -358.5], [-9.6, -357.6], [-1.6, -356.8], [6.3, -356.1], [14.3, -355.4], [22.3, -354.7], [30.2, -354], [38.2, -353.3], [46.2, -352.5], [54.2, -351.8], [62.1, -351.1], [70.1, -350.4], [78.1, -349.7], [86, -348.9], [94, -348.2], [102, -347.5], [110, -346.8], [117.9, -346.1], [125.9, -345.2], [133.8, -344.3], [141.8, -343.3], [149.7, -342.3], [157.7, -341.3], [165.6, -340.3], [173.6, -339.3], [181.5, -338.3], [189.4, -337.3], [197.4, -336.2], [205.3, -335.1], [213.2, -334], [221.1, -332.8], [229.1, -331.7], [237, -330.6], [244.9, -329.5], [252.8, -328.4], [260.8, -327.3], [268.7, -326.1], [276.6, -325], [284.5, -323.9], [292.5, -322.8], [300.4, -321.7], [308.3, -320.5], [316.2, -319.4], [324.2, -318.3], [332.1, -317.2], [340, -316.1], [347.9, -315], [355.9, -313.8], [363.8, -312.7], [371.7, -311.5], [379.6, -310.3], [387.5, -309.1], [395.5, -308], [403.4, -306.8], [411.3, -305.6], [419.2, -304.4], [427.1, -303.2], [435, -302.1], [443, -300.9], [450.9, -299.7], [458.8, -298.5], [466.7, -297.4], [474.6, -296.2], [482.5, -295], [490.5, -293.8], [498.4, -292.7], [506.3, -291.5], [514.2, -290.3], [522.1, -289.1], [530.1, -288], [538, -286.8], [545.9, -285.6], [553.8, -284.4], [561.7, -283.3], [569.6, -282.1], [577.6, -280.9], [585.5, -279.7], [593.4, -278.6], [601.3, -277.4], [609.2, -276.2], [617.1, -275], [625.1, -273.9], [633, -272.7], [640.9, -271.5], [648.8, -270.1], [656.6, -268.6], [664.5, -267], [672.3, -265.5], [680.2, -263.9], [688, -262.3], [695.9, -260.7], [703.7, -258.9], [711.3, -256.4], [718.2, -252.4], [723, -246.2], [725, -238.5], [724.9, -230.5], [723.9, -222.5], [722.7, -214.6], [721.5, -206.7], [720.3, -198.8], [719.1, -190.9], [717.9, -183], [716.7, -175], [715.9, -167.1], [716.7, -159.2], [720.7, -152.3], [727, -147.5], [734, -143.6], [741, -139.7], [748.1, -135.9], [755, -131.9], [760.7, -126.3], [763.4, -118.9], [763.3, -110.9], [762.4, -102.9], [761.3, -95], [760.2, -87.1], [759.1, -79.1], [757.9, -71.2], [756.2, -63.4], [754.4, -55.6], [752.6, -47.8], [750.7, -40], [748.7, -32.3], [746.2, -24.7], [743.4, -17.2], [740.5, -9.7], [737.7, -2.2], [734.7, 5.2], [731.6, 12.6], [728.1, 19.8], [724.6, 27], [721.2, 34.2], [717.6, 41.4], [713.8, 48.4], [709.8, 55.3], [705.7, 62.2], [701.6, 69.1], [697.6, 76], [693.5, 82.9], [689.4, 89.8], [685.4, 96.7], [681.3, 103.6], [677.3, 110.5], [673.2, 117.4], [669.1, 124.3], [665.1, 131.2], [661, 138.1], [656.9, 145], [652.9, 151.9], [648.8, 158.8], [644.7, 165.7], [640.7, 172.6], [636.6, 179.5], [632.6, 186.3], [628.5, 193.2], [624.4, 200.1], [620.4, 207], [616.3, 213.9], [612.2, 220.8], [608.2, 227.7], [604.1, 234.6], [600.1, 241.5], [596, 248.4], [591.9, 255.3], [587.9, 262.2], [583.8, 269.1], [579.6, 275.9], [575.3, 282.7], [571, 289.4], [566.7, 296.2], [562.4, 302.9], [558.1, 309.7], [553.8, 316.4], [549.5, 323.2], [545.2, 329.9], [540.9, 336.7], [536.6, 343.4], [532.3, 350.2], [528, 356.9], [523.7, 363.7], [519.4, 370.4], [515.1, 377.2], [510.8, 383.9], [506.5, 390.7], [502.2, 397.4], [497.9, 404.2], [493.6, 410.9], [489.3, 417.7], [485, 424.4], [480.7, 431.2], [476.4, 437.9], [472.1, 444.7], [467.8, 451.4], [463.5, 458.2], [459.2, 464.9], [454.9, 471.7], [450.6, 478.4], [446.3, 485.2], [442, 491.9], [437.7, 498.7], [433.4, 505.4], [429.1, 512.2], [424.8, 519], [420.6, 525.8], [416.5, 532.6], [413, 539.8], [411.3, 547.6], [412.1, 555.6], [415.6, 562.7], [421.4, 568.2], [428.1, 572.6], [434.9, 576.8], [441.7, 581], [448.5, 585.2], [455.4, 589.4], [462, 593.8], [467.5, 599.6], [468.8, 607.3], [465.4, 614.4], [459.8, 620.2], [453.6, 625.2], [447.3, 630.1], [440.9, 634.9], [434.5, 639.7], [428.1, 644.5], [421.7, 649.3], [415.3, 654.2], [408.9, 659], [402.5, 663.8], [396.1, 668.6], [389.7, 673.4], [383.4, 678.3], [376.9, 683.1], [370.3, 687.6], [363.2, 691.1], [355.4, 692.7], [347.5, 691.4], [340.4, 687.8], [333.9, 683.2], [329.1, 676.9], [327.3, 669.1], [327.3, 661.1], [328.1, 653.1], [329, 645.2], [330.1, 637.2], [331.1, 629.3], [332.1, 621.4], [333.1, 613.4], [334.1, 605.5], [335.1, 597.5], [336.2, 589.6], [337.2, 581.7], [338.2, 573.7], [339.2, 565.8], [340.2, 557.8], [341.2, 549.9], [342.3, 542], [343.3, 534], [344.3, 526.1], [345.3, 518.1], [346.3, 510.2], [347.4, 502.3], [348.4, 494.3], [349.4, 486.4], [350.4, 478.5], [351.4, 470.5], [352.4, 462.6], [353.5, 454.6], [354.5, 446.7], [355.5, 438.8], [356.5, 430.8], [357.5, 422.9], [358.5, 414.9], [359.6, 407], [360.6, 399.1], [361.6, 391.1], [362.6, 383.2], [363.6, 375.2], [364.7, 367.3], [365.7, 359.4], [366.7, 351.4], [367.4, 343.5], [367.3, 335.5], [365.4, 327.7], [361.6, 320.7], [356.3, 314.6], [350.1, 309.6], [343.5, 305.2], [336.7, 300.9], [329.9, 296.7], [323.1, 292.5], [316.3, 288.3], [309.4, 284.1], [302.7, 279.7], [296.4, 274.9], [290.4, 269.6], [284.5, 264.1], [278.8, 258.5], [273.6, 252.5], [269.2, 245.8], [265.4, 238.7], [262, 231.5], [259, 224.1], [256.1, 216.6], [253.2, 209.2], [249.8, 201.9], [245.7, 195], [241.2, 188.4], [236, 182.4], [230.2, 176.8], [223.8, 171.9], [217.1, 167.7], [210, 163.9], [202.7, 160.7], [195.1, 158.1], [187.3, 156.4], [179.4, 155.2], [171.5, 154], [163.6, 152.8], [155.7, 151.5], [147.7, 150.3], [139.8, 149.1], [131.9, 147.9], [124, 146.7], [116.1, 145.5], [108.2, 144.3], [100.3, 143.1], [92.4, 141.9], [84.4, 140.7], [76.5, 139.5], [68.6, 138.3], [60.7, 137.1], [52.8, 135.7], [45, 133.9], [37.4, 131.5], [30.3, 127.9], [24.1, 122.8], [18.7, 116.9], [14.6, 110], [11.6, 102.6], [9, 95.1], [6.5, 87.4], [4.1, 79.8], [1.6, 72.2], [-0.8, 64.6], [-3.3, 57], [-6.1, 49.5], [-9.5, 42.2], [-13.7, 35.5], [-18.9, 29.4], [-25, 24.2], [-31.7, 19.8], [-38.5, 15.6], [-45.4, 11.6], [-52.4, 7.7], [-59.5, 3.9], [-66.5, 0.1], [-73.6, -3.7], [-80.6, -7.5], [-87.7, -11.3], [-94.7, -15.1], [-101.7, -18.9], [-108.8, -22.7], [-115.8, -26.5], [-122.9, -30.3], [-129.9, -34.1], [-137, -37.9], [-144, -41.7], [-151.1, -45.4], [-158.3, -48.9], [-165.7, -52], [-173.1, -55.1], [-180.5, -58.2], [-188, -60.9], [-195.7, -63], [-203.5, -64.9], [-211.3, -66.7], [-219.1, -68.6], [-226.8, -70.4], [-234.7, -72], [-242.6, -73.3], [-250.5, -74.4], [-258.4, -75.6], [-266.4, -76.7], [-274.3, -77.9], [-282.2, -79], [-290.1, -80.2], [-298, -81.3], [-306, -82.5], [-313.9, -83.6], [-321.8, -84.8], [-329.7, -85.9], [-337.7, -87.1], [-345.6, -88.2], [-353.5, -89.4], [-361.4, -90.5], [-369.3, -91.7], [-377.3, -92.8], [-385.2, -94], [-393.1, -95.1], [-401, -96.3], [-408.9, -97.4], [-416.9, -98.6], [-424.8, -99.7], [-432.7, -100.9], [-440.6, -102], [-448.6, -103.1], [-456.5, -104.3], [-464.4, -105.4], [-472.3, -106.6], [-480.2, -107.7], [-488.2, -108.9], [-496.1, -110], [-504, -111.2], [-511.9, -112.3], [-519.8, -113.5], [-527.8, -114.6], [-535.7, -115.8], [-543.6, -116.9], [-551.5, -118.1], [-559.4, -119.2], [-567.4, -120.4], [-575.3, -121.5], [-583.2, -122.7], [-591.1, -123.9], [-598.9, -125.7], [-605.9, -129.5], [-610.7, -135.9], [-613.1, -143.5], [-614, -151.4], [-614.5, -159.4], [-615, -167.4], [-615.6, -175.4], [-616.1, -183.4], [-616.6, -191.4], [-617.1, -199.3], [-617.6, -207.3], [-618.2, -215.3], [-618.7, -223.3], [-619.2, -231.3], [-619.7, -239.3], [-620.5, -247.2], [-621.3, -255.2], [-622.2, -263.2], [-623.2, -271.1], [-624.1, -279.1], [-625, -287], [-625.9, -295], [-627, -302.9], [-628.8, -310.7], [-632.8, -317.5], [-639.3, -322.2], [-647.1, -323.6], [-654.6, -321.1], [-660.8, -316], [-665.9, -309.9], [-670.5, -303.3], [-675.3, -296.9], [-681.2, -291.5], [-688.2, -287.8], [-696.1, -286.4], [-704, -287.5], [-711.5, -290.3], [-718.8, -293.6], [-726.1, -296.8], [-733.6, -299.5], [-741.4, -301.5], [-749.3, -302.7], [-757.2, -303.6], [-765.2, -304.5], [-773.2, -305.4], [-781.1, -306.3], [-789.1, -307.2], [-797, -308.1], [-804.9, -309.7], [-812.2, -312.7], [-818.1, -318.1], [-821.4, -325.3], [-821.8, -333.3], [-820.5, -341.2], [-818.5, -348.9], [-815.9, -356.5], [-813.1, -364], [-810, -371.4], [-806.4, -378.5], [-802.3, -385.4], [-798.1, -392.2], [-793.6, -398.8], [-788.9, -405.3], [-784.1, -411.7], [-778.7, -417.6], [-772.7, -422.9], [-766.4, -427.9], [-759.8, -432.4], [-752.9, -436.3], [-745.7, -439.9], [-738.5, -443.3], [-730.9, -446.1], [-723.2, -448.2], [-715.4, -450.1], [-707.5, -451.1], [-699.5, -451.4], [-691.5, -451.4], [-683.5, -450.8], [-675.6, -449.8], [-667.6, -448.9], [-659.7, -447.9], [-651.8, -446.8], [-643.8, -445.6], [-635.9, -444.4], [-628, -443.2], [-620.1, -442.1], [-612.2, -440.9], [-604.3, -439.7], [-596.3, -438.6], [-588.4, -437.4], [-580.5, -436.2], [-572.6, -435], [-564.7, -433.9], [-556.8, -432.7], [-548.8, -431.5], [-540.9, -430.3]], miami: [[41.8, -179.8], [48.6, -175.6], [55.4, -171.3], [62.1, -167.1], [68.9, -162.9], [75.7, -158.6], [82.5, -154.4], [89.3, -150.2], [96.1, -145.9], [102.8, -141.7], [109.6, -137.5], [116.4, -133.2], [123.2, -129], [130, -124.8], [136.8, -120.5], [143.5, -116.3], [150.3, -112], [157.1, -107.8], [163.9, -103.6], [170.7, -99.3], [177.5, -95.1], [184.2, -90.9], [191, -86.6], [197.8, -82.4], [204.6, -78.2], [211.4, -73.9], [218.2, -69.7], [224.9, -65.5], [231.7, -61.2], [238.5, -57], [245.3, -52.7], [252.1, -48.5], [258.8, -44.2], [265.1, -39.3], [269.2, -32.5], [270, -24.6], [268.1, -16.8], [264.4, -9.7], [259.2, -3.7], [253, 1.4], [246.6, 6.1], [240.2, 10.9], [233.8, 15.7], [227.4, 20.4], [221, 25.3], [214.8, 30.4], [209.1, 36], [203.9, 42], [200.1, 49], [198.1, 56.8], [196.8, 64.6], [195.8, 72.6], [196.1, 80.6], [197.2, 88.5], [198.4, 96.4], [199.2, 104.3], [199, 112.3], [198.1, 120.3], [197.1, 128.2], [196.1, 136.1], [194.4, 144], [191.5, 151.4], [188.1, 158.7], [184.2, 165.6], [179, 171.6], [172.9, 176.8], [166.6, 181.8], [160.4, 186.8], [154.1, 191.8], [147.9, 196.8], [141.3, 201.4], [134.2, 204.9], [126.7, 207.7], [119.1, 210.3], [111.5, 212.9], [104, 215.5], [96.4, 218.1], [88.8, 220.4], [81, 222.3], [73.2, 224], [65.4, 225.7], [57.5, 227], [49.5, 227.5], [41.5, 227.8], [33.5, 227.9], [25.5, 228.1], [17.5, 228.2], [9.5, 227.9], [1.6, 226.8], [-6.3, 225.4], [-14.1, 224], [-22, 222.4], [-29.6, 220.1], [-37, 217], [-44.3, 213.8], [-51.6, 210.5], [-58.9, 207.2], [-66.2, 203.9], [-73.3, 200.2], [-80.2, 196.2], [-87, 192.1], [-93.9, 187.9], [-100.8, 183.8], [-107.6, 179.7], [-114.5, 175.6], [-121.3, 171.5], [-128.2, 167.4], [-135, 163.3], [-141.9, 159.1], [-148.8, 155], [-155.6, 150.9], [-162.5, 146.8], [-169.3, 142.7], [-176.2, 138.6], [-183.1, 134.5], [-189.9, 130.4], [-196.8, 126.2], [-203.6, 122.1], [-210.5, 118], [-217.4, 113.9], [-224.2, 109.8], [-231.1, 105.7], [-237.9, 101.6], [-244.8, 97.5], [-251.6, 93.3], [-258.5, 89.2], [-265.4, 85.1], [-272.2, 81], [-279.1, 76.9], [-285.9, 72.8], [-292.8, 68.6], [-299.6, 64.5], [-306.5, 60.4], [-313.3, 56.3], [-320.3, 52.4], [-327.8, 49.7], [-335.7, 48.1], [-343.6, 47.1], [-351.6, 46.5], [-359.6, 46.4], [-367.5, 47.1], [-375.4, 48.4], [-383.2, 50.3], [-390.8, 52.6], [-398.4, 55.3], [-405.7, 58.6], [-412.7, 62.4], [-419.5, 66.6], [-426, 71.2], [-432.3, 76.2], [-438.6, 81.2], [-445, 85.9], [-451.6, 90.4], [-458.4, 94.6], [-465.8, 97.7], [-473.6, 99.5], [-481.4, 100.8], [-489.4, 101.7], [-497.4, 101.6], [-505.4, 101], [-513.3, 99.8], [-520.9, 97.4], [-528.1, 94.1], [-535.3, 90.5], [-542.3, 86.5], [-548.6, 81.7], [-554.6, 76.4], [-560.6, 71.1], [-566.5, 65.7], [-572.3, 60.2], [-578, 54.6], [-583.7, 49], [-589.6, 43.6], [-596.2, 39.1], [-603.3, 35.4], [-610.5, 31.9], [-617.9, 28.9], [-625.6, 26.9], [-633.5, 25.3], [-641.4, 24.1], [-649.4, 24.3], [-657.3, 25.4], [-665.2, 26.8], [-673, 28.3], [-680.8, 30.3], [-688.4, 32.6], [-696, 35], [-703.6, 37.5], [-711, 40.6], [-718.3, 43.9], [-725.4, 47.5], [-732.2, 51.7], [-738.3, 56.9], [-744.1, 62.4], [-749.5, 68.3], [-754.1, 74.8], [-758.5, 81.5], [-762.7, 88.3], [-766.2, 95.5], [-768.6, 103.1], [-770.4, 110.9], [-772.1, 118.7], [-773, 126.7], [-773, 134.7], [-772.5, 142.7], [-771.3, 150.5], [-768.9, 158.2], [-765.4, 165.4], [-760.6, 171.7], [-754.5, 176.9], [-747.6, 180.9], [-740.2, 183.9], [-732.3, 185], [-724.3, 185.1], [-716.4, 184.4], [-708.5, 183], [-700.7, 181.3], [-692.8, 179.9], [-684.8, 179.3], [-676.8, 179.2], [-668.9, 179.3], [-660.9, 179.8], [-653, 181], [-645.1, 182.7], [-637.3, 184.3], [-629.5, 186], [-621.7, 187.6], [-613.8, 189.3], [-606, 190.9], [-598.2, 192.6], [-590.4, 194.2], [-582.5, 195.8], [-574.7, 197.4], [-566.8, 198.9], [-559, 200.5], [-551.2, 202.1], [-543.3, 203.7], [-535.5, 205.3], [-527.7, 206.9], [-519.8, 208.5], [-512, 210.1], [-504.1, 211.6], [-496.3, 213.2], [-488.4, 214.6], [-480.5, 215.3], [-472.5, 215.3], [-464.5, 215], [-456.5, 214.8], [-448.5, 214.6], [-440.5, 214.4], [-432.5, 214.1], [-424.5, 213.9], [-416.5, 213.7], [-408.5, 213.4], [-400.5, 213.2], [-392.5, 213], [-384.5, 212.7], [-376.5, 212.5], [-368.5, 212.2], [-360.6, 212], [-352.6, 211.6], [-344.6, 211.3], [-336.6, 211], [-328.6, 210.6], [-320.6, 210.3], [-312.6, 210], [-304.6, 209.6], [-296.6, 209.3], [-288.6, 209], [-280.6, 208.7], [-272.7, 208.3], [-264.7, 208], [-256.7, 207.7], [-248.7, 207.3], [-240.7, 207], [-232.7, 206.7], [-224.7, 206.3], [-216.7, 206], [-208.7, 205.7], [-200.7, 205.3], [-192.7, 205.2], [-184.8, 205.8], [-177, 207.7], [-169.4, 210.1], [-161.8, 212.5], [-154.1, 214.9], [-146.5, 217.3], [-138.9, 219.8], [-131.3, 222.4], [-123.8, 225.1], [-116.3, 227.7], [-108.7, 230.4], [-101.2, 233.1], [-93.7, 235.8], [-86.1, 238.5], [-78.6, 241.2], [-71.1, 243.9], [-63.5, 246.5], [-56, 249.2], [-48.5, 251.9], [-40.9, 254.5], [-33.4, 257.2], [-25.8, 259.8], [-18.2, 262.3], [-10.6, 264.7], [-3, 267.1], [4.7, 269.5], [12.3, 272], [19.9, 274.4], [27.5, 276.8], [35.2, 279.2], [42.9, 281.2], [50.7, 282.7], [58.6, 284.1], [66.5, 285.4], [74.4, 286.7], [82.3, 288.1], [90.2, 289.4], [98.1, 290.7], [106, 291.9], [113.9, 292.7], [121.9, 292.9], [129.9, 293], [137.9, 293.1], [145.9, 293.2], [153.9, 293.3], [161.9, 293.4], [169.9, 293.5], [177.9, 293.4], [185.9, 292.7], [193.8, 291.4], [201.7, 290.2], [209.5, 288.9], [217.4, 287.6], [225.3, 286.3], [233.2, 285], [241.1, 283.7], [249, 282.3], [256.7, 280.3], [264.3, 277.8], [271.9, 275.2], [279.4, 272.5], [287, 269.9], [294.5, 267.2], [302.1, 264.6], [309.6, 261.9], [317.1, 259.2], [324.7, 256.5], [332.2, 253.8], [339.7, 251.1], [347.2, 248.3], [354.7, 245.6], [362.2, 242.8], [369.7, 240.1], [377.3, 237.4], [384.8, 234.6], [392.3, 231.9], [399.8, 229.1], [407.3, 226.4], [414.8, 223.6], [422.3, 220.9], [429.8, 218.2], [437.4, 215.4], [444.9, 212.7], [452.4, 209.9], [459.9, 207.2], [467.4, 204.5], [474.9, 201.7], [482.4, 198.8], [489.9, 196], [497.3, 193.1], [504.8, 190.3], [512.3, 187.4], [519.8, 184.6], [527.2, 181.7], [534.7, 178.9], [542.2, 176], [549.6, 173.2], [557.1, 170.3], [564.5, 167.3], [571.8, 164.1], [579.1, 160.8], [586.4, 157.6], [593.7, 154.3], [601, 151], [608.2, 147.5], [615.3, 143.8], [622.3, 140], [629.4, 136.3], [636.5, 132.5], [643.5, 128.7], [650.6, 125], [657.7, 121.2], [664.7, 117.5], [671.8, 113.7], [678.8, 110], [685.9, 106.2], [693, 102.5], [700, 98.7], [707.1, 94.9], [714, 91], [720.8, 86.8], [727.6, 82.5], [734.3, 78.2], [741.1, 73.9], [747.8, 69.6], [754.5, 65.3], [761.3, 60.9], [767.8, 56.4], [773.7, 51], [778.6, 44.6], [781.5, 37.3], [780.3, 29.4], [776.3, 22.6], [770.6, 16.9], [764.2, 12.2], [757.4, 7.9], [750.6, 3.8], [743.8, -0.5], [737.2, -5], [730.8, -9.8], [724.9, -15.2], [720.3, -21.7], [716.6, -28.8], [713.8, -36.2], [712.2, -44.1], [711.5, -52], [711.8, -60], [713.2, -67.9], [715.1, -75.7], [718.1, -83.1], [722.9, -89.4], [728.8, -94.9], [735.4, -99.3], [742.8, -102.4], [750.6, -104.1], [758.6, -104.2], [766.6, -103.7], [774.6, -103.2], [782.5, -102.8], [790.5, -102.3], [798.5, -102.2], [806.5, -102.9], [814.4, -103.9], [822.2, -105.7], [829.5, -109], [835.9, -113.7], [841.9, -119], [847.5, -124.7], [852.6, -130.8], [856.9, -137.6], [860.8, -144.6], [864.7, -151.5], [868.6, -158.5], [872.5, -165.5], [875.9, -172.8], [876.6, -180.6], [872.3, -187.1], [865.4, -191.1], [858.7, -195.5], [853.7, -201.7], [852.2, -209.5], [852.7, -217.5], [854.4, -225.3], [856.7, -232.9], [859.1, -240.6], [861.4, -248.2], [863.8, -255.9], [866.2, -263.5], [868.5, -271.1], [870.7, -278.8], [871.7, -286.7], [870, -294.5], [864.9, -300.5], [857.7, -303.8], [849.8, -305], [841.8, -305.8], [833.8, -306.5], [825.9, -307.2], [817.9, -307.9], [809.9, -308.5], [802, -309], [794, -309.3], [786, -309.6], [778, -309.8], [770, -310.1], [762, -310.4], [754, -310.7], [746, -311], [738, -311.3], [730, -311.5], [722, -311.8], [714, -312.1], [706.1, -312.4], [698.1, -312.7], [690.1, -313], [682.1, -313.2], [674.1, -313.5], [666.1, -313.8], [658.1, -314.1], [650.1, -314.4], [642.1, -314.7], [634.1, -314.9], [626.1, -315.2], [618.1, -315.5], [610.1, -315.8], [602.2, -316.1], [594.2, -316.4], [586.2, -316.6], [578.2, -316.9], [570.2, -317.2], [562.2, -317.5], [554.2, -317.8], [546.2, -318.1], [538.2, -318.3], [530.2, -318.6], [522.2, -318.9], [514.2, -319.2], [506.2, -319.5], [498.3, -319.8], [490.3, -320], [482.3, -320.3], [474.3, -320.6], [466.3, -320.9], [458.3, -321.2], [450.3, -321.5], [442.3, -321.7], [434.3, -322], [426.3, -322.3], [418.3, -322.6], [410.3, -322.9], [402.3, -323.2], [394.4, -323.4], [386.4, -323.7], [378.4, -324], [370.4, -324.3], [362.4, -324.6], [354.4, -324.9], [346.4, -325.1], [338.4, -325.4], [330.4, -325.7], [322.4, -326], [314.4, -326.3], [306.4, -326.6], [298.4, -326.8], [290.5, -327.1], [282.5, -327.4], [274.5, -327.7], [266.5, -328], [258.5, -328.3], [250.5, -328.5], [242.5, -328.8], [234.5, -329.1], [226.5, -329.4], [218.5, -329.7], [210.5, -330], [202.5, -330.2], [194.5, -330.5], [186.6, -330.8], [178.6, -331.1], [170.6, -331.4], [162.6, -331.6], [154.6, -331.9], [146.6, -332.2], [138.6, -332.5], [130.6, -332.8], [122.6, -333.1], [114.6, -333.3], [106.6, -333.6], [98.6, -333.9], [90.6, -334.2], [82.7, -334.5], [74.7, -334.8], [66.7, -335], [58.7, -335.3], [50.7, -335.6], [42.7, -336], [34.7, -336.3], [26.7, -336.7], [18.7, -337.1], [10.7, -337.4], [2.7, -337.8], [-5.2, -338.1], [-13.2, -338.5], [-21.2, -338.9], [-29.2, -339.2], [-37.2, -339.6], [-45.2, -339.9], [-53.2, -340.3], [-61.2, -340.7], [-69.2, -341], [-77.1, -341.4], [-85.1, -341.8], [-93.1, -342.1], [-101.1, -342.5], [-109.1, -342.8], [-117.1, -343.2], [-125.1, -343.6], [-133.1, -343.9], [-141.1, -344.3], [-149, -344.6], [-157, -345], [-165, -345.4], [-173, -345.7], [-181, -346.1], [-189, -346.5], [-197, -346.8], [-205, -347.2], [-213, -347.5], [-221, -347.9], [-228.9, -348.3], [-236.9, -348.6], [-244.9, -349], [-252.9, -349.4], [-260.9, -349.7], [-268.9, -350.1], [-276.9, -350.4], [-284.9, -350.8], [-292.9, -351.2], [-300.8, -351.5], [-308.8, -351.9], [-316.8, -352.2], [-324.8, -352.6], [-332.8, -353], [-340.8, -353.3], [-348.8, -353.7], [-356.8, -354.1], [-364.8, -354.4], [-372.7, -354.8], [-380.7, -355.1], [-388.7, -355.5], [-396.7, -355.9], [-404.7, -356.2], [-412.7, -356.6], [-420.7, -356.9], [-428.7, -357.3], [-436.7, -357.7], [-444.6, -358], [-452.6, -358.4], [-460.6, -358.8], [-468.6, -359.1], [-476.6, -359.5], [-484.6, -359.8], [-492.6, -360.2], [-500.6, -360.6], [-508.6, -360.9], [-516.6, -361.3], [-524.5, -361.6], [-532.5, -362], [-540.5, -362.4], [-548.5, -362.6], [-556.5, -362.2], [-564.3, -360.5], [-571.3, -356.8], [-574.9, -349.8], [-575.2, -341.8], [-573, -334.1], [-569.3, -327.1], [-564, -321.2], [-558, -315.8], [-552, -310.6], [-545.8, -305.5], [-539.4, -300.6], [-533.1, -295.8], [-526.7, -291], [-520.3, -286.2], [-513.5, -281.9], [-506.6, -278], [-499.5, -274.2], [-492.5, -270.4], [-485.3, -266.9], [-477.9, -264], [-470.2, -261.8], [-462.4, -259.9], [-454.5, -258.5], [-446.5, -258.3], [-438.6, -258.9], [-430.6, -259.9], [-422.9, -261.8], [-415.3, -264.4], [-407.8, -267.1], [-400.3, -269.9], [-392.9, -273], [-385.7, -276.4], [-378.4, -279.8], [-371.2, -283.2], [-364, -286.6], [-356.7, -290], [-349.5, -293.4], [-342.2, -296.8], [-335, -300.2], [-327.7, -303.3], [-320.1, -306], [-312.4, -308.1], [-304.7, -310.2], [-297, -312.2], [-289.2, -314.2], [-281.3, -315.5], [-273.4, -316.4], [-265.4, -317.1], [-257.4, -317.8], [-249.5, -318.4], [-241.5, -319], [-233.5, -319], [-225.5, -318.1], [-217.6, -317.1], [-209.7, -315.9], [-201.8, -314.8], [-193.9, -313.6], [-186.1, -311.9], [-178.6, -309.2], [-171.2, -306.1], [-163.8, -303.1], [-156.4, -300], [-149, -296.9], [-141.8, -293.5], [-134.8, -289.6], [-128, -285.5], [-121.2, -281.2], [-114.4, -277], [-107.6, -272.8], [-100.8, -268.6], [-94, -264.3], [-87.2, -260.1], [-80.4, -255.9], [-73.6, -251.7], [-66.8, -247.4], [-60.1, -243.2], [-53.3, -239], [-46.5, -234.7], [-39.7, -230.5], [-32.9, -226.3], [-26.1, -222.1], [-19.3, -217.8], [-12.5, -213.6], [-5.7, -209.4], [1, -205.2], [7.8, -200.9], [14.6, -196.7], [21.4, -192.5], [28.2, -188.3], [35, -184]], vegas: [[450.1, 806.4], [455.4, 800.4], [460.8, 794.4], [466.1, 788.5], [471.4, 782.5], [476.7, 776.5], [482, 770.5], [487.3, 764.5], [492.7, 758.6], [498, 752.6], [503.3, 746.6], [508.6, 740.6], [514, 734.7], [519.2, 728.6], [524.1, 722.3], [528.4, 715.6], [531.8, 708.3], [533.9, 700.6], [534.6, 692.7], [533, 684.8], [529.6, 677.6], [524.8, 671.2], [518.8, 666], [512, 661.8], [504.6, 658.7], [497.1, 655.9], [489.4, 653.8], [481.5, 652.3], [473.6, 651.2], [465.6, 650.9], [457.6, 651.3], [449.7, 652.2], [441.9, 654], [434.3, 656.4], [426.9, 659.6], [419.9, 663.5], [413.1, 667.6], [406.2, 671.7], [399.4, 675.9], [392.5, 680.1], [386, 684.7], [380.1, 690.1], [374.4, 695.7], [368.7, 701.3], [363, 707], [357.3, 712.6], [351.6, 718.2], [345.6, 723.4], [339.1, 728.1], [332.1, 732], [324.5, 734.6], [316.7, 736.4], [308.9, 738.2], [301.1, 739.7], [293.1, 740.3], [285.1, 740.1], [277.2, 738.9], [269.5, 736.7], [261.9, 734.2], [254.4, 731.6], [246.9, 728.6], [239.8, 725], [232.8, 721], [226.3, 716.5], [220.1, 711.4], [214.2, 706], [208.9, 700], [204.1, 693.6], [199.3, 687.2], [194.5, 680.7], [189.8, 674.3], [185.5, 667.5], [182.2, 660.3], [179.4, 652.7], [176.8, 645.2], [174.5, 637.5], [173.4, 629.6], [173.2, 621.6], [173.1, 613.6], [173, 605.6], [173, 597.6], [172.9, 589.6], [172.8, 581.6], [172.8, 573.6], [172.7, 565.6], [172.6, 557.6], [172.6, 549.6], [172.5, 541.6], [172.4, 533.6], [172.4, 525.6], [172.3, 517.6], [172.2, 509.6], [172.2, 501.6], [172.1, 493.6], [172, 485.6], [172, 477.6], [171.9, 469.6], [171.9, 461.6], [171.8, 453.6], [171.7, 445.6], [171.7, 437.5], [171.6, 429.5], [171.5, 421.5], [171.5, 413.5], [171.4, 405.5], [171.3, 397.5], [171.3, 389.5], [171.2, 381.5], [171.1, 373.5], [171.1, 365.5], [171, 357.5], [170.9, 349.5], [170.9, 341.5], [170.8, 333.5], [170.7, 325.5], [170.7, 317.5], [170.6, 309.5], [170.5, 301.5], [170.5, 293.5], [170.4, 285.5], [170.4, 277.5], [170.3, 269.5], [170.2, 261.5], [170.2, 253.5], [170.1, 245.5], [170, 237.5], [170, 229.5], [169.9, 221.5], [169.8, 213.5], [169.8, 205.5], [169.7, 197.5], [169.6, 189.5], [169.6, 181.5], [169.5, 173.5], [169.4, 165.5], [169.4, 157.5], [169.3, 149.5], [169.2, 141.5], [169.2, 133.5], [169.1, 125.4], [169, 117.4], [169, 109.4], [168.9, 101.4], [168.9, 93.4], [168.8, 85.4], [168.7, 77.4], [168.7, 69.4], [168.6, 61.4], [168.5, 53.4], [168.5, 45.4], [168.4, 37.4], [168.3, 29.4], [168.3, 21.4], [168.2, 13.4], [168.1, 5.4], [168.1, -2.6], [168, -10.6], [167.9, -18.6], [167.9, -26.6], [167.8, -34.6], [167.7, -42.6], [167.7, -50.6], [167.6, -58.6], [167.5, -66.6], [167.5, -74.6], [167.4, -82.6], [167.4, -90.6], [167.3, -98.6], [167.2, -106.6], [167.2, -114.6], [167.1, -122.6], [167, -130.6], [167, -138.6], [166.9, -146.6], [166.8, -154.6], [166.8, -162.6], [166.7, -170.6], [166.6, -178.6], [166.6, -186.6], [166.5, -194.7], [166.4, -202.7], [166.4, -210.7], [166.3, -218.7], [166.2, -226.7], [166.2, -234.7], [166.1, -242.7], [166, -250.7], [166, -258.7], [165.9, -266.7], [165.9, -274.7], [165.8, -282.7], [165.7, -290.7], [165.7, -298.7], [166, -306.7], [167.6, -314.5], [171, -321.7], [176.5, -327.4], [183.7, -330.8], [191.6, -331.7], [199.6, -331.7], [207.6, -331.5], [215.6, -331.4], [223.6, -331.2], [231.6, -331.1], [239.6, -330.9], [247.6, -330.8], [255.6, -330.6], [263.6, -330.5], [271.7, -330.3], [279.7, -330.2], [287.7, -330], [295.7, -329.8], [303.7, -329.7], [311.7, -329.5], [319.7, -329.4], [327.7, -329.2], [335.7, -329.1], [343.7, -328.9], [351.7, -328.8], [359.7, -328.6], [367.7, -328.5], [375.7, -328.4], [383.7, -328.4], [391.7, -328.4], [399.7, -328.4], [407.7, -328.5], [415.7, -328.5], [423.7, -328.6], [431.7, -328.8], [439.6, -329.7], [447.5, -331.3], [455.3, -333.1], [463, -335.3], [470, -339], [476.3, -344], [482.2, -349.4], [487.9, -355], [493.7, -360.5], [499.4, -366.1], [505.1, -371.7], [510.7, -377.4], [515.9, -383.5], [520.7, -390], [525.3, -396.5], [529.5, -403.3], [533.4, -410.3], [537, -417.5], [540.4, -424.7], [543.7, -432], [546.7, -439.4], [549.3, -446.9], [551.2, -454.7], [552.7, -462.6], [554.2, -470.5], [555.3, -478.4], [556.2, -486.3], [557.1, -494.3], [557.8, -502.3], [557.9, -510.2], [557.2, -518.2], [553.6, -525.2], [546.9, -529.5], [539.2, -531.5], [531.2, -532.5], [523.3, -533.7], [515.8, -536.2], [509.3, -540.9], [504.3, -547.1], [500.7, -554.2], [498.7, -562], [497.5, -569.9], [497.4, -577.9], [498.5, -585.8], [501.2, -593.3], [505, -600.3], [509, -607.3], [513.1, -614.2], [517.1, -621.1], [521, -628.1], [524.8, -635.1], [528.1, -642.4], [531.3, -649.8], [534.8, -656.9], [538.3, -664.1], [540.4, -671.8], [540, -679.8], [538.3, -687.6], [534.3, -694.4], [528.1, -699.5], [521.3, -703.8], [514.1, -707.1], [506.3, -708.8], [498.3, -709.8], [490.4, -710.7], [482.4, -711.5], [474.4, -712.3], [466.4, -712.7], [458.4, -712.9], [450.4, -713.1], [442.4, -713.3], [434.4, -713.5], [426.4, -713.7], [418.4, -713.9], [410.4, -714.1], [402.4, -714.3], [394.4, -714.5], [386.4, -714.7], [378.4, -714.9], [370.4, -715.1], [362.4, -715.3], [354.4, -715.5], [346.4, -715.7], [338.4, -715.9], [330.4, -716.1], [322.4, -716.3], [314.4, -716.5], [306.4, -716.7], [298.4, -716.9], [290.4, -717.1], [282.4, -717.3], [274.4, -717.5], [266.4, -717.8], [258.4, -718], [250.4, -718.2], [242.4, -718.4], [234.4, -718.6], [226.4, -718.8], [218.4, -719], [210.4, -719.2], [202.4, -719.4], [194.4, -719.6], [186.4, -719.8], [178.4, -720], [170.4, -720.2], [162.5, -720.8], [154.5, -721.8], [146.6, -723], [138.7, -724.1], [130.8, -725.3], [122.8, -726.4], [114.9, -727.6], [107, -728.7], [99.1, -729.9], [91.2, -731.1], [83.2, -732.2], [75.3, -733.4], [67.4, -734.5], [59.5, -735.7], [51.7, -737.4], [44.2, -740.2], [36.9, -743.6], [29.7, -747.1], [22.5, -750.6], [15.5, -754.4], [9.2, -759.3], [3.5, -764.9], [-2.1, -770.6], [-7.7, -776.4], [-13.3, -782.1], [-18.8, -787.9], [-24.3, -793.7], [-29.2, -800], [-33.2, -807], [-36.8, -814.1], [-40.4, -821.3], [-43.9, -828.4], [-47.5, -835.6], [-51.1, -842.7], [-54.7, -849.9], [-58.3, -857], [-61.8, -864.2], [-65.2, -871.5], [-68.4, -878.8], [-71.6, -886.1], [-74.7, -893.5], [-77.8, -900.9], [-81, -908.2], [-84.1, -915.6], [-87.2, -923], [-90.4, -930.3], [-93.5, -937.7], [-96.6, -945.1], [-99.8, -952.4], [-102.9, -959.8], [-106, -967.1], [-109.2, -974.5], [-112.3, -981.9], [-115.5, -989.2], [-119.1, -996.4], [-123.8, -1002.8], [-129.2, -1008.7], [-134.7, -1014.5], [-140.2, -1020.3], [-145.7, -1026.1], [-151.3, -1031.8], [-157.3, -1037.1], [-163.8, -1041.8], [-170.4, -1046.4], [-177, -1050.9], [-183.6, -1055.4], [-190.4, -1059.6], [-197.7, -1062.9], [-205.2, -1065.7], [-212.7, -1068.5], [-220.2, -1071.3], [-227.7, -1074], [-235.3, -1076.5], [-242.9, -1079], [-250.6, -1081.5], [-258.2, -1083.9], [-265.8, -1086.4], [-273.4, -1088.8], [-281, -1091.2], [-288.8, -1093.3], [-296.6, -1095], [-304.4, -1096.6], [-312.3, -1098.2], [-320.1, -1099.7], [-328, -1101.3], [-335.8, -1102.9], [-343.7, -1104.4], [-351.6, -1105], [-359.4, -1103.3], [-366.1, -1098.9], [-370.5, -1092.3], [-373.1, -1084.8], [-375.6, -1077.2], [-378.4, -1069.7], [-381.7, -1062.4], [-385.1, -1055.1], [-388.7, -1048], [-392.4, -1040.9], [-396, -1033.8], [-399.7, -1026.6], [-403.3, -1019.5], [-407, -1012.4], [-410.6, -1005.3], [-414.3, -998.1], [-417.9, -991], [-421.5, -983.9], [-425.2, -976.8], [-428.8, -969.6], [-432.5, -962.5], [-436.1, -955.4], [-439.8, -948.3], [-443.4, -941.1], [-447.1, -934], [-450.7, -926.9], [-454.5, -919.8], [-458.2, -912.8], [-462, -905.7], [-465.8, -898.7], [-469.6, -891.6], [-473.4, -884.5], [-477.1, -877.5], [-480.9, -870.4], [-484.7, -863.4], [-488.5, -856.3], [-492.2, -849.3], [-496.1, -842.2], [-499.9, -835.2], [-503.8, -828.2], [-507.6, -821.2], [-511.5, -814.2], [-515.4, -807.2], [-519.4, -800.3], [-523.4, -793.4], [-527.5, -786.4], [-531.5, -779.5], [-535.6, -772.6], [-539.6, -765.7], [-543.6, -758.8], [-547.6, -751.9], [-551.6, -744.9], [-555.6, -738], [-559.6, -731.1], [-563.5, -724.1], [-567.5, -717.2], [-571.5, -710.2], [-575.5, -703.3], [-579.1, -696.1], [-582.4, -688.9], [-585.6, -681.5], [-588.9, -674.2], [-592.1, -666.9], [-595.3, -659.6], [-598.5, -652.2], [-601.8, -644.9], [-605, -637.6], [-608.2, -630.3], [-611.4, -622.9], [-614.6, -615.6], [-617.6, -608.2], [-620.3, -600.6], [-622.6, -593], [-625, -585.3], [-627.4, -577.7], [-629.7, -570], [-632.1, -562.4], [-634.4, -554.8], [-636.8, -547.1], [-639.1, -539.5], [-641.4, -531.8], [-643.7, -524.1], [-645.9, -516.4], [-648.2, -508.8], [-650.5, -501.1], [-652.7, -493.4], [-655, -485.7], [-657.2, -478], [-659.5, -470.4], [-661.7, -462.7], [-663.9, -455], [-666.1, -447.3], [-668.2, -439.6], [-670.3, -431.8], [-672.4, -424.1], [-674.6, -416.4], [-676.7, -408.7], [-678.6, -400.9], [-680.4, -393.1], [-682, -385.3], [-683.6, -377.5], [-685.3, -369.6], [-686.9, -361.8], [-688.5, -353.9], [-690, -346.1], [-691.4, -338.2], [-692.7, -330.3], [-694, -322.4], [-695.3, -314.5], [-696.6, -306.6], [-697.9, -298.7], [-699.1, -290.8], [-700.2, -282.9], [-701.2, -274.9], [-702.2, -267], [-703.1, -259], [-704, -251.1], [-705, -243.2], [-705.9, -235.2], [-706.9, -227.3], [-707.8, -219.3], [-708.7, -211.4], [-709.5, -203.4], [-710.1, -195.4], [-710.5, -187.4], [-710.9, -179.4], [-711.3, -171.4], [-711.7, -163.4], [-712.1, -155.5], [-712.4, -147.5], [-712.8, -139.5], [-713.2, -131.5], [-713.5, -123.5], [-713.9, -115.5], [-714.2, -107.5], [-714.5, -99.5], [-714.7, -91.5], [-714.6, -83.5], [-714.6, -75.5], [-714.5, -67.5], [-714.5, -59.5], [-714.4, -51.5], [-714.4, -43.5], [-714.3, -35.5], [-714.3, -27.5], [-714.2, -19.5], [-714.1, -11.5], [-714.1, -3.5], [-714, 4.5], [-714, 12.5], [-713.9, 20.6], [-713.9, 28.6], [-713.8, 36.6], [-713.8, 44.6], [-713.7, 52.6], [-713.7, 60.6], [-713.6, 68.6], [-713.5, 76.6], [-713.5, 84.6], [-713.4, 92.6], [-713.4, 100.6], [-713.3, 108.6], [-713.3, 116.6], [-713.2, 124.6], [-713.2, 132.6], [-713.1, 140.6], [-713.1, 148.6], [-713, 156.6], [-713, 164.6], [-713, 172.6], [-712.9, 180.6], [-712.9, 188.6], [-712.9, 196.6], [-712.8, 204.6], [-712.8, 212.6], [-712.8, 220.6], [-713, 228.6], [-713.3, 236.6], [-713.6, 244.6], [-713.9, 252.6], [-714.1, 260.6], [-714.4, 268.6], [-714.7, 276.6], [-715, 284.6], [-715.3, 292.6], [-715.6, 300.6], [-715.9, 308.6], [-716.2, 316.6], [-716.5, 324.6], [-716.8, 332.6], [-717.1, 340.6], [-717.4, 348.6], [-717.7, 356.6], [-717.9, 364.6], [-718.2, 372.6], [-718.5, 380.6], [-718.8, 388.6], [-719.1, 396.6], [-719.4, 404.6], [-719.7, 412.6], [-720, 420.6], [-720.3, 428.6], [-720.6, 436.6], [-720.9, 444.5], [-721.2, 452.5], [-721.5, 460.5], [-721.8, 468.5], [-722, 476.5], [-722.3, 484.5], [-722.6, 492.5], [-722.9, 500.5], [-723.2, 508.5], [-723.5, 516.5], [-723.8, 524.5], [-724.1, 532.5], [-724.4, 540.5], [-724.7, 548.5], [-725, 556.5], [-725.3, 564.5], [-725.6, 572.5], [-725.8, 580.5], [-726, 588.5], [-726.2, 596.5], [-726.4, 604.5], [-726.5, 612.5], [-726.7, 620.5], [-726.9, 628.5], [-727.1, 636.5], [-727.2, 644.5], [-727.4, 652.5], [-727.6, 660.5], [-727.8, 668.5], [-727.9, 676.5], [-728.1, 684.5], [-728.3, 692.5], [-728.4, 700.5], [-728.6, 708.5], [-728.8, 716.5], [-729, 724.5], [-729.1, 732.5], [-729.3, 740.5], [-729.5, 748.5], [-729.6, 756.5], [-729.8, 764.5], [-729.8, 772.5], [-729.9, 780.5], [-729.9, 788.5], [-729.9, 796.5], [-729.9, 804.5], [-729.9, 812.5], [-729.9, 820.5], [-729.9, 828.5], [-729.9, 836.6], [-729.9, 844.6], [-730, 852.6], [-730.1, 860.6], [-730.3, 868.6], [-730.5, 876.6], [-730.8, 884.6], [-731.1, 892.6], [-731.3, 900.6], [-731.6, 908.6], [-731.8, 916.6], [-732.1, 924.6], [-732.3, 932.5], [-732.6, 940.5], [-732.8, 948.5], [-733.1, 956.5], [-732.8, 964.5], [-730.3, 972.1], [-724.6, 977.5], [-717, 979.9], [-709, 980.4], [-701, 980.8], [-693.2, 982.5], [-685.9, 985.6], [-679.4, 990.3], [-673.6, 995.8], [-667.9, 1001.5], [-662.3, 1007.1], [-656.6, 1012.8], [-650.7, 1018.2], [-644.2, 1022.8], [-637.3, 1026.9], [-630.3, 1030.8], [-623.3, 1034.6], [-615.7, 1037.3], [-607.9, 1039.1], [-600.1, 1040.6], [-592.2, 1042.2], [-584.4, 1043.6], [-576.4, 1044.4], [-568.4, 1044.7], [-560.4, 1044.9], [-552.4, 1045], [-544.4, 1045.2], [-536.4, 1045.4], [-528.4, 1045.6], [-520.4, 1045.7], [-512.4, 1045.9], [-504.4, 1046.1], [-496.4, 1046.2], [-488.4, 1046.4], [-480.4, 1046.6], [-472.4, 1046.8], [-464.4, 1046.9], [-456.4, 1047.1], [-448.4, 1047.3], [-440.4, 1047.4], [-432.4, 1047.6], [-424.4, 1047.8], [-416.4, 1047.9], [-408.4, 1048], [-400.4, 1048], [-392.4, 1047.9], [-384.4, 1047.8], [-376.4, 1047.7], [-368.4, 1047.6], [-360.4, 1047.5], [-352.4, 1047.4], [-344.4, 1047.3], [-336.4, 1047.2], [-328.4, 1047.1], [-320.4, 1047], [-312.4, 1046.9], [-304.4, 1046.8], [-296.4, 1046.7], [-288.4, 1046.6], [-280.4, 1046.5], [-272.3, 1046.5], [-264.3, 1046.4], [-256.3, 1046.3], [-248.3, 1046.2], [-240.3, 1046.1], [-232.3, 1046], [-224.3, 1045.9], [-216.3, 1045.8], [-208.3, 1045.7], [-200.3, 1045.6], [-192.3, 1045.5], [-184.3, 1045.4], [-176.3, 1045.5], [-168.3, 1045.5], [-160.3, 1045.6], [-152.3, 1045.6], [-144.3, 1045.7], [-136.3, 1045.7], [-128.3, 1045.8], [-120.3, 1045.8], [-112.3, 1045.8], [-104.3, 1045.9], [-96.3, 1045.9], [-88.3, 1046], [-80.3, 1046], [-72.3, 1046.1], [-64.3, 1046.1], [-56.3, 1046.2], [-48.3, 1046.2], [-40.3, 1046.3], [-32.3, 1046.3], [-24.3, 1046.4], [-16.3, 1046.4], [-8.3, 1046.5], [-0.3, 1046.5], [7.7, 1046.4], [15.7, 1046.3], [23.7, 1046.2], [31.7, 1046.1], [39.7, 1046], [47.7, 1045.8], [55.8, 1045.7], [63.8, 1045.6], [71.8, 1045.5], [79.8, 1045.4], [87.8, 1045.1], [95.7, 1044.3], [103.6, 1043.2], [111.6, 1042.1], [119.5, 1041], [127.4, 1039.9], [135.4, 1038.8], [143.3, 1037.7], [151.2, 1036.6], [159.1, 1035.4], [167, 1034.1], [174.9, 1032.7], [182.7, 1031.2], [190.6, 1029.7], [198.5, 1028.2], [206.3, 1026.7], [214.2, 1025.2], [222.1, 1023.7], [229.9, 1022.1], [237.7, 1020.3], [245.2, 1017.6], [252.5, 1014.4], [259.7, 1010.8], [266.6, 1006.7], [273.3, 1002.3], [279.5, 997.3], [285.4, 991.9], [291, 986.2], [296.3, 980.2], [301.6, 974.2], [306.9, 968.2], [312.3, 962.2], [317.6, 956.2], [322.9, 950.3], [328.2, 944.3], [333.5, 938.3], [338.8, 932.3], [344.1, 926.3], [349.4, 920.3], [354.7, 914.3], [360, 908.3], [365.3, 902.3], [370.6, 896.3], [375.9, 890.3], [381.2, 884.3], [386.5, 878.3], [391.8, 872.3], [397.1, 866.3], [402.4, 860.3], [407.7, 854.4], [413, 848.4], [418.3, 842.4], [423.6, 836.4], [428.9, 830.4], [434.2, 824.4], [439.5, 818.4], [444.8, 812.4]] };

// src/atlas.json
var atlas_default = { grass: 0, grass_side: 1, dirt: 2, stone: 3, cobble: 4, gravel: 5, sand: 6, desert_sand: 7, desert_stone: 8, sandstone: 9, desert_sandstone: 10, snow: 11, snow_side: 12, ice: 13, tree: 14, tree_top: 15, leaves: 16, jungletree: 17, jungletree_top: 18, jungleleaves: 19, pine: 20, pine_top: 21, pine_needles: 22, water: 23, lava: 24, cactus: 25, cactus_top: 26, litter: 27, litter_side: 28, netherrack: 29, nether_brick: 30, glowstone: 31, nether_sand: 32, basalt: 33, basalt_top: 34, permafrost: 35, obsidian: 36, stone_brick: 37, desert_stone_brick: 38, dry_grass: 39, dry_grass_side: 40, dry_dirt: 41, mossycobble: 42, stone_block: 43, sandstone_block: 44, desert_sandstone_block: 45, aspen: 46, aspen_top: 47, aspen_leaves: 48, acacia: 49, acacia_top: 50, acacia_leaves: 51, wool_white: 52, wool_black: 53, wool_red: 54, silver_sand: 55, coniferous_litter: 56, coniferous_litter_side: 57, clay: 58, brick: 59, p_grass: 60, p_grass2: 61, p_junglegrass: 62, p_fern: 63, p_dry_shrub: 64, p_dry_grass: 65, p_rose: 66, p_dandelion: 67, p_tulip: 68, p_viola: 69, p_mushroom: 70, p_marram: 71, p_papyrus: 72, leaves_o: 73, jungleleaves_o: 74, pine_needles_o: 75, aspen_leaves_o: 76, acacia_leaves_o: 77, packed_ice: 78, tc_orange: 79, tc_red: 80, tc_brown: 81, tc_yellow: 82, tc_white: 83, tc_lgray: 84, red_sand: 85, waterlily: 86, planks: 87, pine_planks: 88, jungle_planks: 89, glass: 90, vine: 91, crimson_stem: 92, wart: 93, warped_stem: 94, warped_wart: 95, crimson_nylium: 96, warped_nylium: 97, shroomlight: 98, blue_ice: 99, soul_soil: 100, cherry_log: 101, cherry_log_top: 102, cherry_leaves: 103, cherry_leaves_o: 104, p_petals: 105, darkoak: 106, darkoak_top: 107, darkoak_leaves: 108, darkoak_leaves_o: 109, mush_red: 110, mush_brown: 111, mush_stem: 112, coral_pink: 113, coral_yellow: 114, coral_blue: 115, coral_purple: 116, p_coral_a: 117, p_coral_b: 118, p_kelp: 119, p_seagrass: 120, prismarine: 121, dark_prismarine: 122, moss: 123 };

// src/js/main.js
var $ = (id) => document.getElementById(id);
var store = {
  get(k, d) {
    try {
      const v = localStorage.getItem("pixelprix." + k);
      return v == null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem("pixelprix." + k, JSON.stringify(v));
    } catch {
    }
  }
};
for (const k of BIOME_ORDER) BIOMES[k].key = k;
var A = atlas_default;
var isTouch = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
var isPhone = isTouch && Math.min(window.screen.width, window.screen.height) < 820;
var DPR = window.devicePixelRatio || 1;
var QUALITY = [
  // tuned for frame rate: no supersampling on desktop screens, sharp but not oversized on phones
  { name: "Fast", pr: isTouch ? Math.min(DPR, 1.5) : 1, range: isPhone ? 340 : 440, detail: 0.75, shadow: 1024, budget: 4, probe: false, pbr: false, ao: false, vox: 1, msaa: 0, fx: null },
  { name: "Fancy", pr: isTouch ? Math.min(DPR, 1.75) : DPR >= 1.75 ? 1.5 : 1, range: 480, detail: 0.9, shadow: 2048, budget: 5, probe: false, pbr: true, ao: false, vox: 1, msaa: 2, fx: { bloom: 0.2, rays: 0.36, sharp: 0.3, aoAmt: 0.75, bump: 0.7, env: 0.5 } },
  { name: "RTX", pr: isTouch ? Math.min(DPR, 2) : DPR >= 1.75 ? 1.75 : 1.2, range: 540, detail: 1, shadow: 2048, budget: 6, probe: false, pbr: true, ao: true, vox: 2, msaa: 4, fx: { bloom: 0.25, rays: 0.42, sharp: 0.35, aoAmt: 0.85, bump: 0.85, env: 0.6 } }
];
var settings = {
  tc: store.get("tc", 1),
  abs: store.get("abs", true),
  steer: store.get("steer", true),
  cam: Math.min(store.get("cam", 0), 5),
  walls: store.get("walls", true),
  vol: store.get("vol", 0.8),
  line: store.get("line", true),
  q: store.get("q3", isTouch ? 0 : 1),
  sound: store.get("sound", true),
  units: store.get("units", "kmh")
};
var canvas = $("gl");
var renderer = new THREE5.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
renderer.toneMapping = THREE5.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE5.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE5.PCFSoftShadowMap;
var scene = new THREE5.Scene();
var camera = new THREE5.PerspectiveCamera(60, 1, 0.1, 3e3);
var post = new Post(renderer, scene, camera);
var probe = null;
var appEl = $("app");
var view = { w: window.innerWidth, h: window.innerHeight, rot: false };
function layout() {
  const iw = window.innerWidth, ih = window.innerHeight;
  view.rot = isTouch && ih > iw;
  view.w = view.rot ? ih : iw;
  view.h = view.rot ? iw : ih;
  const st = document.documentElement.style;
  st.setProperty("--vw", iw + "px");
  st.setProperty("--aw", view.w + "px");
  st.setProperty("--ah", view.h + "px");
  appEl.classList.toggle("rot", view.rot);
  appEl.style.width = view.w + "px";
  appEl.style.height = view.h + "px";
  document.documentElement.classList.toggle("short", view.h < 500);
}
var appX = (e) => view.rot ? e.clientY : e.clientX;
function resize() {
  layout();
  const Q = QUALITY[settings.q];
  renderer.setPixelRatio(Q.pr);
  renderer.setSize(view.w, view.h, false);
  camera.aspect = view.w / view.h;
  camera.updateProjectionMatrix();
  post.msaa = QUALITY[settings.q].msaa;
  post.setup(settings.q);
  post.resize(view.w, view.h);
}
window.addEventListener("resize", resize);
var hemi = new THREE5.HemisphereLight(16777215, 4473924, 1);
scene.add(hemi);
var sun = new THREE5.DirectionalLight(16777215, 3);
sun.castShadow = true;
var SCAM = sun.shadow.camera;
SCAM.left = -70;
SCAM.right = 70;
SCAM.top = 70;
SCAM.bottom = -70;
SCAM.near = 1;
SCAM.far = 900;
sun.shadow.bias = -3e-4;
sun.shadow.normalBias = 0.05;
scene.add(sun, sun.target);
var sky = makeSky();
scene.add(sky);
var seaTop = new THREE5.Mesh(new THREE5.PlaneGeometry(2400, 2400, 1, 1), new THREE5.ShaderMaterial({
  uniforms: { t: { value: 0 }, fogC: { value: new THREE5.Color() }, dens: { value: 5e-3 } },
  transparent: true,
  depthWrite: false,
  side: THREE5.DoubleSide,
  fog: false,
  vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
  fragmentShader: `uniform float t, dens; uniform vec3 fogC; varying vec3 vW;
    float n(vec2 p){ return sin(p.x) * sin(p.y); }
    void main(){
      vec2 p = vW.xz * 0.08;
      float r = n(p + vec2(t * 0.4, t * 0.25)) * 0.5 + n(p * 2.3 - vec2(t * 0.6, -t * 0.3)) * 0.3 + n(p * 5.1 + t) * 0.2;
      float d = length(vW - cameraPosition);
      float window = exp(-pow(length(vW.xz - cameraPosition.xz) / 90.0, 2.0));
      vec3 c = mix(vec3(0.35, 0.75, 0.85), vec3(0.85, 1.0, 1.0), 0.5 + 0.5 * r) * (0.75 + 0.9 * window);
      c = mix(c, fogC, 1.0 - exp(-d * dens * 0.8));
      gl_FragColor = vec4(c, 0.92);
    }`
}));
seaTop.rotation.x = -Math.PI / 2;
seaTop.visible = false;
seaTop.renderOrder = -1;
scene.add(seaTop);
scene.fog = new THREE5.FogExp2(16777215, 15e-4);
var sunDir = new THREE5.Vector3();
var sunCol = new THREE5.Color();
var curBiome = null;
function applyBiomeLook(B) {
  curBiome = B;
  const el = THREE5.MathUtils.degToRad(B.sunElev), az = THREE5.MathUtils.degToRad(B.sunAz);
  sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize();
  sunCol.setHex(B.sunColor);
  skyU.zen.value.setHex(B.zenith);
  skyU.hor.value.setHex(B.horizon);
  skyU.sunDir.value.copy(sunDir);
  skyU.sunCol.value.copy(sunCol);
  skyU.cover.value = B.clouds;
  skyU.night.value = B.night ? 1 : 0;
  scene.fog.color.setHex(B.fogColor ?? B.horizon);
  scene.fog.density = B.fogDensity;
  seaTop.visible = !!B.underwater;
  seaTop.position.y = B.water;
  seaTop.material.uniforms.fogC.value.copy(scene.fog.color);
  seaTop.material.uniforms.dens.value = B.fogDensity;
  fogU.uCaus.value = B.underwater ? 0.4 : 0;
  fogU.uCausTop.value = B.water;
  post.noFlare = !!B.underwater;
  fogU.uFogSun.value.copy(sunDir);
  fogU.uFogSunCol.value.copy(sunCol).multiplyScalar(B.night ? 0 : 0.6);
  fogU.uFogBase.value = B.base;
  hemi.color.setHex(B.hemi[0]);
  hemi.groundColor.setHex(B.hemi[1]);
  sun.color.copy(sunCol);
  renderer.toneMappingExposure = B.exposure;
  scene.fog.density = B.fogDensity * (QUALITY[settings.q].pbr ? 0.62 : 1);
  applyLightLevels();
  buildSkyEnv();
  if (mats) {
    const w = mats.water.uniforms;
    w.zen.value.setHex(B.zenith);
    w.hor.value.setHex(B.horizon);
    w.sunDir.value.copy(sunDir);
    w.sunCol.value.copy(sunCol);
    w.deep.value.setHex({ jungle: 998188, desert: 940634, shore: 555148, plains: 2771524, darkforest: 2046512, cherry: 2775658, peaks: 1331310, badlands: 3824218, meadow: 1985114 }[B.style || B.key] ?? 734544);
    w.cover.value = B.clouds;
  }
}
var studioEnv = null;
function carStudio() {
  const B = curBiome;
  if (!B) return;
  const k = 1 / (B.exposure * (QUALITY[settings.q].pbr ? 1 : 0.96));
  carLightU.uCarSun.value.setRGB(5.2 * k, 5.1 * k, 4.95 * k);
  carLightU.uCarSky.value.setRGB(0.65 * k, 0.67 * k, 0.7 * k);
  carLightU.uCarGround.value.setRGB(0.16 * k, 0.16 * k, 0.16 * k);
  if (car) car.setEnvIntensity(0.7 * k);
}
function getStudioEnv() {
  if (!studioEnv) studioEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  return studioEnv;
}
function applyLightLevels() {
  const B = curBiome;
  if (!B) return;
  const pbr = QUALITY[settings.q].pbr;
  hemi.intensity = B.hemi[2] * (pbr ? 0.5 : 0.82);
  sun.intensity = B.sun * (pbr ? 1.18 : 1.1);
  renderer.toneMappingExposure = B.exposure * (pbr ? 1 : 0.96);
  if (matsP) for (const k of ["solid", "plant", "lava"]) matsP[k].envMapIntensity = (B.night ? 0.8 : 1) * (QUALITY[settings.q].fx?.env ?? 0.5);
  carStudio();
}
var pmrem = new THREE5.PMREMGenerator(renderer);
var skyEnv = null;
var envScene = new THREE5.Scene();
envScene.add(makeSky());
function buildSkyEnv() {
  if (!matsP) return;
  const saved = skyU.camPos.value.clone();
  skyU.camPos.value.set(0, 0, 0);
  const rt = pmrem.fromScene(envScene, 0.035, 0.1, 2e3);
  skyU.camPos.value.copy(saved);
  if (skyEnv) skyEnv.dispose();
  skyEnv = rt;
  for (const k of ["solid", "plant", "lava"]) {
    matsP[k].envMap = rt.texture;
    matsP[k].needsUpdate = true;
  }
}
function swapBlockMats() {
  if (!mats) return;
  const src = QUALITY[settings.q].pbr ? matsP : matsL;
  const map = /* @__PURE__ */ new Map();
  for (const k of ["solid", "plant", "lava"]) {
    map.set(matsL[k], src[k]);
    map.set(matsP[k], src[k]);
    mats[k] = src[k];
  }
  if (world) for (const m of world.group.children) {
    const n = map.get(m.material);
    if (n) m.material = n;
  }
}
var startLine = null;
function buildStartLine() {
  if (startLine) {
    scene.remove(startLine);
    startLine.geometry.dispose();
    startLine.material.map.dispose();
  }
  const t = world.track, W = world.hw * 2, D = 1.2, sq = 0.4;
  const cols = Math.round(W / sq), rows = Math.round(D / sq);
  const cv = document.createElement("canvas");
  cv.width = cols * 4;
  cv.height = rows * 4;
  const g = cv.getContext("2d");
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    g.fillStyle = r + c & 1 ? "#111" : "#f4f4f4";
    g.fillRect(c * 4, r * 4, 4, 4);
  }
  const tex = new THREE5.CanvasTexture(cv);
  tex.magFilter = THREE5.NearestFilter;
  tex.colorSpace = THREE5.SRGBColorSpace;
  tex.anisotropy = 8;
  const geo = new THREE5.PlaneGeometry(W, D);
  const mat = fogPatch(new THREE5.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  startLine = new THREE5.Mesh(geo, mat);
  startLine.rotation.order = "YXZ";
  startLine.rotation.set(-Math.PI / 2, Math.atan2(t.TX[0], t.TZ[0]), 0);
  startLine.position.set(t.X[0], t.H[0] + 0.04, t.Z[0]);
  startLine.receiveShadow = true;
  scene.add(startLine);
}
var rLine = null;
var rlGeom = null;
var rlKey = null;
var rlProfile = null;
function ensureRacingLine() {
  const key = sel.biome + "|" + sel.era + "|" + carFile;
  if (rlKey === key) return;
  rlKey = key;
  if (rLine) {
    scene.remove(rLine);
    rLine.geometry.dispose();
  }
  rlProfile = racingPhases(rlGeom, PHYS[sel.era], { halfWB: car.halfWB, trackF: car.trackF, trackR: car.trackR, rFront: car.rFront, rRear: car.rRear });
  rLine = racingLineMesh(rlGeom, rlProfile.ph, fogPatch);
  scene.add(rLine);
}
var pool = new TilePool("tileworker.js", clamp((navigator.hardwareConcurrency || 4) - 1, 1, 4));
var blockTex = null;
var mats = null;
var matsL = null;
var matsP = null;
var pbrTex = null;
var atlasImg = new Image();
var atlasReady = new Promise((res, rej) => {
  atlasImg.onload = res;
  atlasImg.onerror = rej;
});
atlasImg.src = "atlas.png";
function tileCanvas(tile, scale = 1, dark = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = 16 * scale;
  const g = c.getContext("2d");
  g.imageSmoothingEnabled = false;
  g.drawImage(atlasImg, 0, tile * 16, 16, 16, 0, 0, 16 * scale, 16 * scale);
  if (dark !== 1) {
    g.fillStyle = `rgba(0,0,0,${1 - dark})`;
    g.fillRect(0, 0, c.width, c.height);
  }
  return c;
}
async function ensureMats() {
  if (mats) return mats;
  await atlasReady;
  blockTex = makeBlockTexture(atlasImg, Object.keys(A).length);
  blockTex.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  pbrTex = makePbrTexture(atlasImg, A);
  pbrTex.anisotropy = blockTex.anisotropy;
  matsL = {
    solid: fogPatch(makeBlockMaterial(blockTex, A)),
    plant: fogPatch(makeBlockMaterial(blockTex, A, { side: THREE5.DoubleSide })),
    lava: fogPatch(makeBlockMaterial(blockTex, A, { alphaTest: 0 }))
  };
  matsP = {
    solid: fogPatch(makePbrBlockMaterial(blockTex, pbrTex, A)),
    plant: fogPatch(makePbrBlockMaterial(blockTex, pbrTex, A, { side: THREE5.DoubleSide })),
    lava: fogPatch(makePbrBlockMaterial(blockTex, pbrTex, A, { alphaTest: 0 }))
  };
  const src = QUALITY[settings.q].pbr ? matsP : matsL;
  mats = { solid: src.solid, plant: src.plant, lava: src.lava, water: makeWaterMaterial() };
  buildSkyEnv();
  applyLightLevels();
  return mats;
}
var loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
var gltfCache = /* @__PURE__ */ new Map();
async function loadGLTF(file) {
  if (gltfCache.has(file)) return gltfCache.get(file);
  let ok = true;
  try {
    await MeshoptDecoder.ready;
  } catch {
    ok = false;
  }
  const tryLoad = async (url) => {
    const r = await fetch(url + ".txt");
    if (!r.ok) throw new Error("model " + url + " " + r.status);
    const bin = atob((await r.text()).trim());
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return new Promise((res, rej) => loader.parse(buf.buffer, "", res, rej));
  };
  let g;
  g = await tryLoad(file);
  gltfCache.set(file, g);
  return g;
}
var sel = { era: store.get("era", "2026"), team: store.get("team", 0), biome: store.get("biome", "forest") };
if (!ERAS[sel.era]) sel.era = "2026";
if (!BIOMES[sel.biome]) sel.biome = "forest";
sel.team = clamp(sel.team | 0, 0, ERAS[sel.era].teams.length - 1);
var screen = "title";
var paused = false;
var car = null;
var carFile = null;
var world = null;
var worldKey = null;
var veh = null;
var audio = new Audio();
var teamOf = () => ERAS[sel.era].teams[clamp(sel.team, 0, ERAS[sel.era].teams.length - 1)];
async function ensureCar() {
  const file = "m_" + teamOf().model + ".glb";
  if (carFile !== file) {
    const g = await loadGLTF(file);
    if ("m_" + teamOf().model + ".glb" !== file) return;
    if (car) {
      scene.remove(car.root);
      car.dispose();
      gltfCache.delete(carFile);
    }
    car = buildCar(g);
    carFile = file;
    scene.add(car.root);
    car.setEnv(getStudioEnv());
    carStudio();
    veh = null;
  }
  car.setLivery(teamOf());
}
async function ensureWorld() {
  await ensureMats();
  if (world && worldKey === sel.biome) return;
  if (world) {
    scene.remove(world.group);
    world.dispose();
  }
  const B = BIOMES[sel.biome];
  applyBiomeLook(B);
  world = new World(B, tracks_default[sel.biome], A, mats);
  world.voxTreeMaxS = QUALITY[settings.q].vox;
  if (pool.ok) {
    world.pool = pool;
    pool.init(world, B, tracks_default[sel.biome], A, { voxTreeMaxS: world.voxTreeMaxS });
  }
  rlGeom = computeRacingLine(world.track, world.hw);
  rlKey = null;
  buildStartLine();
  worldKey = sel.biome;
  scene.add(world.group);
  {
    const st = B.style || B.key;
    weather.set(st === "arctic" ? "snow" : st === "nether" ? "ash" : st === "ocean" ? "bubbles" : st === "cherry" ? "petals" : null);
  }
  skid.clear();
}
var carY = 0;
var carVy = 0;
var prevGy = null;
function placeCarAt(s) {
  const t = world.track, N = t.N;
  const i = (Math.floor(s) % N + N) % N;
  const yaw = Math.atan2(t.TX[i], t.TZ[i]);
  if (!veh || veh.P !== PHYS[sel.era]) veh = new Vehicle(PHYS[sel.era], car);
  veh.assist = { tc: settings.tc, abs: settings.abs, steer: settings.steer };
  veh.reset(t.X[i], t.H[i], t.Z[i], yaw);
  t.hint = i;
  carY = t.H[i];
  carVy = 0;
  prevGy = null;
  syncCarTransform(0);
}
function drawLogo() {
  const G3 = {
    F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    1: ["0110", "1110", "0110", "0110", "0110", "0110", "1111"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    I: ["111", "010", "010", "010", "010", "010", "111"],
    "'": ["1", "1", "0", "0", "0", "0", "0"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    " ": ["00", "00", "00", "00", "00", "00", "00"]
  };
  const layout2 = (text) => {
    const cells = [];
    let cx = 0;
    for (const ch of text) {
      const g2 = G3[ch];
      for (let y = 0; y < 7; y++) for (let x = 0; x < g2[0].length; x++) if (g2[y][x] === "1") cells.push([cx + x, y]);
      cx += g2[0].length + 1;
    }
    return { cells, w: cx - 1 };
  };
  const l1 = layout2("F1"), l2 = layout2("BUT IT'S"), l3 = layout2("MINECRAFT");
  const b2 = 14, b1 = Math.round(b2 * 15 / 7), pad = 6, gap = 26;
  const leftW = l1.w * b1, rightW = Math.max(l2.w, l3.w) * b2;
  const W = pad * 2 + leftW + gap + rightW + 30, H = pad * 2 + 15 * b2 + 34 + 22;
  const c = $("logo");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  g.imageSmoothingEnabled = false;
  const stone = tileCanvas(A.stone, 2), red = tileCanvas(A.wool_red, 2), dark = tileCanvas(A.cobble, 2, 0.5), darkR = tileCanvas(A.nether_brick, 2, 0.6);
  const blocks = [];
  for (const [x, y] of l1.cells) blocks.push([pad + x * b1, pad + y * b1, b1, true]);
  for (const [x, y] of l2.cells) blocks.push([pad + leftW + gap + x * b2, pad + y * b2, b2, false]);
  for (const [x, y] of l3.cells) blocks.push([pad + leftW + gap + x * b2, pad + (y + 8) * b2, b2, false]);
  const D = 7;
  for (let d = D; d >= 1; d--) for (const [x, y, s, r] of blocks) {
    const k = s / 30;
    g.drawImage(r ? darkR : dark, 0, 0, 32, 32, x + d * 3 * k, y + d * 4 * k, s, s);
  }
  for (const [x, y, s, r] of blocks) {
    g.drawImage(r ? red : stone, x * 7 % 16, y * 5 % 16, 16, 16, x, y, s, s);
    const e = Math.max(2, Math.round(s / 10));
    g.fillStyle = "rgba(255,255,255,0.28)";
    g.fillRect(x, y, s, e);
    g.fillRect(x, y, e, s);
    g.fillStyle = "rgba(0,0,0,0.3)";
    g.fillRect(x, y + s - e, s, e);
    g.fillRect(x + s - e, y, e, s);
  }
  const cy = pad + 15 * b2 + 30, cs = 9, n = Math.floor((W - pad * 2 - 20) / cs);
  for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) {
    g.fillStyle = (i + j) % 2 ? "#141414" : "#f2f2f2";
    g.fillRect(pad + i * cs, cy + j * cs, cs, cs);
  }
  g.fillStyle = "rgba(0,0,0,0.35)";
  g.fillRect(pad + 3, cy + cs * 2, n * cs, 3);
}
function cssTiles() {
  const dirt = tileCanvas(A.dirt, 4, 0.55).toDataURL();
  document.documentElement.style.setProperty("--dirt-bg", `url(${dirt})`);
  const c = document.createElement("canvas");
  c.width = c.height = 16;
  const g = c.getContext("2d");
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const v = 108 + Math.floor(Math.random() * 22);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x, y, 1, 1);
  }
  document.documentElement.style.setProperty("--btn-bg", `url(${c.toDataURL()})`);
}
function showScreen(name) {
  screen = name;
  for (const id of ["title", "tracks", "garage", "options", "controls", "loading"]) $(id).classList.toggle("hidden", id !== name);
  const racing = name === "race";
  $("hud").classList.toggle("hidden", !racing);
  $("touch").classList.toggle("hidden", !(racing && isTouch));
  document.documentElement.classList.toggle("racing", racing);
  $("tDrs").classList.add("hidden");
  window.__orient?.();
  if (name === "title") {
    $("splash").textContent = SPLASHES[Math.floor(Math.random() * SPLASHES.length)];
    updateTitleSel();
  }
  if (name === "tracks") renderTracks();
  if (name === "garage") renderGarage();
  if (name === "options") renderOptions();
  menuT = 0;
}
function updateTitleSel() {
  const t = teamOf();
  $("selSw").style.background = `linear-gradient(135deg, ${t.base} 60%, ${t.accent} 60%)`;
  $("selTxt").textContent = `${sel.era} ${t.name} \xB7 ${BIOMES[sel.biome].circuit} - ${BIOMES[sel.biome].name}`;
}
var fmt = (t) => {
  if (t == null) return "\u2013:\u2013\u2013.\u2013\u2013\u2013";
  const m = Math.floor(t / 60), s = t - m * 60;
  return m + ":" + (s < 10 ? "0" : "") + s.toFixed(3);
};
var bestTimes = store.get("best", {});
function renderTracks() {
  const L = $("trackList");
  L.innerHTML = "";
  for (const k of BIOME_ORDER) {
    const B = BIOMES[k];
    const r = document.createElement("button");
    r.className = "wrow" + (sel.biome === k ? " sel" : "");
    let ic;
    if (thumbsOk) {
      ic = document.createElement("canvas");
      ic.width = ic.height = THUMB;
      ic.getContext("2d").drawImage(thumbsImg, BIOME_ORDER.indexOf(k) * THUMB, 0, THUMB, THUMB, 0, 0, THUMB, THUMB);
    } else ic = tileCanvas(A[B.icon], 4);
    ic.className = "px";
    const best = Object.entries(bestTimes).filter(([key]) => key.startsWith(k + "|")).sort((a, b) => a[1] - b[1])[0];
    const tx = document.createElement("div");
    tx.innerHTML = `<div class="n mct">${B.circuit} - ${B.name}</div><div class="d">${(tracks_default[k].length * 8 / 1e3).toFixed(1)} km</div>
      <div class="b">${best ? "Best " + fmt(best[1]) + " (" + best[0].split("|")[1] + ")" : "No lap yet"}</div>`;
    r.append(ic, tx);
    r.className += " card";
    r.onclick = () => {
      if (sel.biome === k) return;
      sel.biome = k;
      store.set("biome", k);
      renderTracks();
      switchWorld();
    };
    r.ondblclick = () => startRace();
    L.appendChild(r);
  }
}
async function switchWorld() {
  await ensureWorld();
  placeCarAt(world.track.N - 30);
  updateTitleSel();
}
function carIcon(team) {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 16;
  c.className = "car";
  const g = c.getContext("2d");
  g.fillStyle = team.base;
  g.fillRect(0, 0, 16, 16);
  g.fillStyle = team.accent;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const d = x + y - 15;
    if (d >= -2 && d <= 2) g.fillRect(x, y, 1, 1);
  }
  return c;
}
function renderGarage() {
  const tabs = $("eraTabs");
  tabs.innerHTML = "";
  for (const k of ERA_ORDER) {
    const b = document.createElement("button");
    b.className = "tab" + (sel.era === k ? " sel" : "");
    b.textContent = k;
    b.onclick = async () => {
      sel.era = k;
      sel.team = 0;
      store.set("era", k);
      store.set("team", 0);
      renderGarage();
      await ensureCar();
      placeCarAt(world.track.N - 30);
    };
    tabs.appendChild(b);
  }
  $("chassisName").textContent = sel.era + " season \u2014 " + ERAS[sel.era].sub;
  const slots = $("teamSlots");
  slots.innerHTML = "";
  ERAS[sel.era].teams.forEach((t2, i) => {
    const b = document.createElement("button");
    b.className = "slot" + (sel.team === i ? " sel" : "");
    b.appendChild(carIcon(t2));
    const n = document.createElement("span");
    n.className = "num";
    n.textContent = t2.num;
    b.appendChild(n);
    b.title = t2.name;
    b.onclick = async () => {
      sel.team = i;
      store.set("team", i);
      renderGarage();
      await ensureCar();
      placeCarAt(world.track.N - 30);
    };
    slots.appendChild(b);
  });
  const t = teamOf(), P = PHYS[sel.era];
  const hp = Math.round((P.powerICE + P.powerERS) / 745.7);
  const bar = (label, v) => `<div class="stat"><span>${label}</span><div class="bar"><i style="width:${Math.round(clamp(v, 0.05, 1) * 100)}%"></i></div></div>`;
  $("tip").innerHTML = `<div class="tn">${t.name} <span class="tg">#${t.num}</span></div>
    <div class="tb">${sel.era} \xB7 ${ERAS[sel.era].engine}</div>
    ${bar("Power", hp / 1100)}${bar("Downforce", P.claZ / 5)}${bar("Grip", (P.mu - 1.2) / 0.7)}${bar("Lightness", (900 - P.mass) / 330)}
    <div class="tg">${hp} hp \xB7 ${P.mass} kg \xB7 ${P.gearsKmh.length}-speed auto \xB7 top ${P.gearsKmh[P.gearsKmh.length - 1]} km/h</div>`;
}
function optBtn(label, get, cycle) {
  const b = document.createElement("button");
  b.className = "mcb";
  const upd = () => b.textContent = label + ": " + get();
  b.onclick = () => {
    cycle();
    upd();
  };
  upd();
  return b;
}
var CAMS = ["Chase", "Far chase", "T-cam", "Cockpit", "Nose", "Rear wing"];
function renderOptions() {
  const g = $("optGrid");
  g.innerHTML = "";
  g.append(
    optBtn("Graphics", () => QUALITY[settings.q].name, () => {
      settings.q = (settings.q + 1) % 3;
      store.set("q3", settings.q);
      resize();
      applyQuality();
    }),
    optBtn("Camera", () => CAMS[settings.cam], () => cycleCam()),
    optBtn("Traction Control", () => ["Off", "Medium", "High"][settings.tc], () => {
      settings.tc = (settings.tc + 1) % 3;
      store.set("tc", settings.tc);
      syncAssists();
    }),
    optBtn("ABS", () => settings.abs ? "On" : "Off", () => {
      settings.abs = !settings.abs;
      store.set("abs", settings.abs);
      syncAssists();
    }),
    optBtn("Steering Assist", () => settings.steer ? "On" : "Off", () => {
      settings.steer = !settings.steer;
      store.set("steer", settings.steer);
      syncAssists();
    }),
    optBtn("Sound", () => settings.sound ? "On" : "Off", () => setSound(!settings.sound)),
    optBtn("Racing Line", () => settings.line ? "On" : "Off", () => {
      settings.line = !settings.line;
      store.set("line", settings.line);
    }),
    optBtn("Track Walls", () => settings.walls ? "On" : "Off", () => {
      settings.walls = !settings.walls;
      store.set("walls", settings.walls);
    }),
    optBtn("Speed Units", () => settings.units === "kmh" ? "km/h" : "mph", () => {
      settings.units = settings.units === "kmh" ? "mph" : "kmh";
      store.set("units", settings.units);
    })
  );
}
function syncAssists() {
  if (veh) veh.assist = { tc: settings.tc, abs: settings.abs, steer: settings.steer };
}
function cycleCam() {
  settings.cam = (settings.cam + 1) % CAMS.length;
  store.set("cam", settings.cam);
  $("camName").textContent = CAMS[settings.cam] + " \xB7 C";
  if (screen === "race") flash(CAMS[settings.cam] + " camera", 0.9, "#ffffff");
  look.yaw = look.pitch = 0;
}
var look = { yaw: 0, pitch: 0, idle: 9, drag: false };
window.addEventListener("mousedown", (e) => {
  if (e.button === 2 && screen === "race" && !paused && settings.cam <= 1) {
    look.drag = true;
    e.preventDefault();
  }
});
window.addEventListener("mouseup", (e) => {
  if (e.button === 2) look.drag = false;
});
window.addEventListener("blur", () => {
  look.drag = false;
});
window.addEventListener("contextmenu", (e) => {
  if (screen === "race") e.preventDefault();
});
window.addEventListener("mousemove", (e) => {
  if (screen !== "race" || paused || isTouch || settings.cam > 1) return;
  if (!look.drag || !(e.buttons & 2)) {
    look.drag = false;
    return;
  }
  if (!e.movementX && !e.movementY) return;
  look.yaw = clamp(look.yaw - e.movementX * 6e-3, -Math.PI, Math.PI);
  look.pitch = clamp(look.pitch + e.movementY * 4e-3, -0.25, 0.9);
  look.idle = 0;
});
function applyQuality() {
  const Q = QUALITY[settings.q];
  if (sun.shadow.mapSize.x !== Q.shadow) {
    sun.shadow.mapSize.set(Q.shadow, Q.shadow);
    sun.shadow.map?.dispose();
    sun.shadow.map = null;
  }
  const psz = 128;
  if (probe && probe.size !== psz) {
    probe.rt.dispose();
    probe = null;
  }
  if (Q.probe && !probe) {
    probe = new EnvProbe(renderer, psz);
    probe.size = psz;
  }
  if (!Q.probe && probe) {
    probe.rt.dispose();
    probe = null;
  }
  car?.setEnv(getStudioEnv());
  carStudio();
  post.ao = Q.ao;
  post.fx = Q.fx;
  if (Q.fx) sharedUniforms.uBump.value = Q.fx.bump;
  swapBlockMats();
  if (curBiome) {
    scene.fog.density = curBiome.fogDensity * (Q.pbr ? 0.62 : 1);
    applyLightLevels();
  }
}
function setSound(on) {
  settings.sound = on;
  store.set("sound", on);
  audio.setMuted(!on);
  drawVol();
}
function drawVol() {
  const v = settings.vol;
  $("volFill").style.width = v * 100 + "%";
  $("volKnob").style.left = v * 100 + "%";
  $("volTxt").textContent = settings.sound ? "Volume: " + Math.round(v * 100) + "%" : "Muted";
  $("vol").classList.toggle("muted", !settings.sound);
}
{
  const bar = $("volBar");
  let id = null;
  const setFrom = (e) => {
    const r = bar.getBoundingClientRect();
    const f = view.rot ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width;
    settings.vol = Math.round(clamp(f, 0, 1) * 100) / 100;
    store.set("vol", settings.vol);
    if (!settings.sound && settings.vol > 0) setSound(true);
    audio.init().then(() => {
      audio.setVolume(settings.vol);
      audio.resume();
    });
    drawVol();
  };
  bar.addEventListener("pointerdown", (e) => {
    id = e.pointerId;
    bar.setPointerCapture(id);
    setFrom(e);
    e.preventDefault();
    e.stopPropagation();
  });
  bar.addEventListener("pointermove", (e) => {
    if (e.pointerId === id) setFrom(e);
  });
  const end = (e) => {
    if (e.pointerId === id) id = null;
  };
  bar.addEventListener("pointerup", end);
  bar.addEventListener("pointercancel", end);
  $("volIco").onclick = (e) => {
    setSound(!settings.sound);
    e.currentTarget.blur();
  };
  drawVol();
}
var optionsReturn = "title";
$("bRace").onclick = () => startRace();
$("bTracks").onclick = () => showScreen("tracks");
$("bGarage").onclick = () => showScreen("garage");
$("bOptions").onclick = () => {
  optionsReturn = "title";
  $("options").classList.remove("ingame");
  showScreen("options");
};
$("bControls").onclick = () => showScreen("controls");
$("tRace").onclick = () => startRace();
$("tBack").onclick = () => showScreen("title");
$("gRace").onclick = () => startRace();
$("gBack").onclick = () => showScreen("title");
$("oDone").onclick = () => closeOptions();
function closeOptions() {
  if (optionsReturn === "pause") {
    $("options").classList.add("hidden");
    $("options").classList.remove("ingame");
    overlay = "pause";
    $("pause").classList.remove("hidden");
  } else showScreen("title");
}
$("cDone").onclick = () => showScreen("title");
document.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button, .slot, .tab, .wrow, #legal")) {
    audio.init().then(() => {
      audio.setVolume(settings.vol);
      audio.setMuted(!settings.sound);
      audio.resume();
      audio.uiClick();
    });
  }
});
var keys = /* @__PURE__ */ new Set();
window.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
  keys.add(e.code);
  if (e.key) keys.add("K:" + e.key.toLowerCase());
  audio.resume();
  if (screen !== "race") {
    if (e.code === "Escape" && screen !== "title" && screen !== "loading") showScreen("title");
    return;
  }
  if (e.code === "Escape" || e.code === "KeyP") {
    e.preventDefault();
    if (overlay === "options") closeOptions();
    else togglePause();
    return;
  }
  if (paused) return;
  if (e.code === "KeyC") cycleCam();
  if (e.code === "KeyR") respawn(true);
  if (e.code === "KeyM") setSound(!settings.sound);
  if (e.code === "KeyE" && veh) veh.drsReq = !veh.drsReq;
});
window.addEventListener("keyup", (e) => {
  keys.delete(e.code);
  if (e.key) {
    keys.delete("K:" + e.key.toLowerCase());
    keys.delete("K:" + e.key);
  }
});
window.addEventListener("blur", () => keys.clear());
var touch = { t: false, b: false, s: 0, sOn: false };
if (isTouch) document.documentElement.classList.add("touch");
{
  const zone = $("steerZone"), knob = $("steerKnob"), track = $("steerTrack");
  let sid = null, x0 = 0;
  const span = () => Math.max(60, Math.min(120, view.w * 0.11));
  const setKnob = (v) => {
    const w = track.clientWidth - 48;
    knob.style.left = 50 + v * (w / 2) / track.clientWidth * 100 + "%";
  };
  zone.addEventListener("pointerdown", (e) => {
    if (sid !== null) return;
    sid = e.pointerId;
    x0 = appX(e);
    touch.sOn = true;
    touch.s = 0;
    zone.setPointerCapture(e.pointerId);
    zone.classList.add("used");
    audio.resume();
    e.preventDefault();
  });
  zone.addEventListener("pointermove", (e) => {
    if (e.pointerId !== sid) return;
    const ex = appX(e);
    let d = (ex - x0) / span();
    if (d > 1) {
      x0 = ex - span();
      d = 1;
    } else if (d < -1) {
      x0 = ex + span();
      d = -1;
    }
    touch.s = Math.sign(d) * Math.pow(Math.abs(d), 1.25);
    setKnob(d);
  });
  const end = (e) => {
    if (e.pointerId !== sid) return;
    sid = null;
    touch.sOn = false;
    touch.s = 0;
    setKnob(0);
  };
  zone.addEventListener("pointerup", end);
  zone.addEventListener("pointercancel", end);
  const ped = $("pedals"), ptrs = /* @__PURE__ */ new Map();
  const which = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.closest("#tB")) return "b";
    if (el && el.closest("#tT")) return "t";
    const rb = $("tB").getBoundingClientRect(), rt = $("tT").getBoundingClientRect();
    const db = Math.hypot(e.clientX - (rb.left + rb.right) / 2, e.clientY - (rb.top + rb.bottom) / 2);
    const dtt = Math.hypot(e.clientX - (rt.left + rt.right) / 2, e.clientY - (rt.top + rt.bottom) / 2);
    return db < dtt ? "b" : "t";
  };
  const sync = () => {
    touch.t = touch.b = false;
    for (const k of ptrs.values()) touch[k] = true;
    $("tT").classList.toggle("on", touch.t);
    $("tB").classList.toggle("on", touch.b);
  };
  ped.addEventListener("pointerdown", (e) => {
    ped.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, which(e));
    sync();
    audio.resume();
    e.preventDefault();
  });
  ped.addEventListener("pointermove", (e) => {
    if (ptrs.has(e.pointerId)) {
      ptrs.set(e.pointerId, which(e));
      sync();
    }
  });
  const pend = (e) => {
    ptrs.delete(e.pointerId);
    sync();
  };
  ped.addEventListener("pointerup", pend);
  ped.addEventListener("pointercancel", pend);
  $("tPause").onclick = () => togglePause();
  $("tCam").onclick = () => cycleCam();
  $("tReset").onclick = () => respawn(true);
  $("tDrs").onclick = () => {
    if (veh) {
      veh.drsReq = !veh.drsReq;
      $("tDrs").classList.toggle("on", veh.drsReq);
    }
  };
  const fs = $("fsBtn");
  const fsOK = isTouch && (document.fullscreenEnabled || document.webkitFullscreenEnabled);
  fs.classList.toggle("hidden", !fsOK);
  fs.onclick = async () => {
    try {
      const el = document.documentElement;
      if (document.fullscreenElement || document.webkitFullscreenElement) await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else {
        await (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
        try {
          await window.screen.orientation?.lock?.("landscape");
        } catch {
        }
      }
    } catch {
      fs.classList.add("hidden");
    }
  };
  const orient = () => {
    $("rotate").classList.add("hidden");
  };
  window.addEventListener("resize", orient);
  window.__orient = orient;
}
var inp = { thr: 0, brk: 0, steer: 0, pad: false };
var padY = false;
function readInput(dt) {
  const k = (code, ch) => keys.has(code) || keys.has("K:" + ch);
  let thr = k("KeyW", "w") || k("ArrowUp", "arrowup") || touch.t ? 1 : 0;
  let brk = k("KeyS", "s") || k("ArrowDown", "arrowdown") || keys.has("Space") || touch.b ? 1 : 0;
  let st = (k("KeyD", "d") || k("ArrowRight", "arrowright") ? 1 : 0) - (k("KeyA", "a") || k("ArrowLeft", "arrowleft") ? 1 : 0);
  let pad = false;
  if (touch.sOn) {
    pad = true;
    st = touch.s;
  }
  if (window.__autoSteer) {
    pad = true;
    st = window.__autoSteer();
    const pd = window.__autoPedal();
    thr = pd[0];
    brk = pd[1];
  }
  const gps = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const gp of gps) {
    if (!gp) continue;
    const ax = gp.axes[0] || 0, rt = gp.buttons[7]?.value || 0, lt = gp.buttons[6]?.value || 0;
    if (Math.abs(ax) > 0.08 || rt > 0.05 || lt > 0.05) {
      pad = true;
      st = Math.sign(ax) * Math.pow(Math.max(0, Math.abs(ax) - 0.06) / 0.94, 1.6);
      thr = Math.max(thr, rt);
      brk = Math.max(brk, lt);
    }
    const yb = !!gp.buttons[3]?.pressed;
    if (yb && !padY) cycleCam();
    padY = yb;
    break;
  }
  const r = (cur, tgt, up, down) => cur + clamp(tgt - cur, -down * dt, up * dt);
  const analogPedals = pad && !touch.sOn;
  inp.thr = analogPedals ? thr : r(inp.thr, thr, 6, 10);
  inp.brk = analogPedals ? brk : r(inp.brk, brk, 14, 12);
  inp.steer = touch.sOn ? r(inp.steer, st, 14, 14) : pad ? st : r(inp.steer, st, Math.abs(st) > 0 && Math.sign(st) !== Math.sign(inp.steer) ? 9 : 5, 8);
  inp.pad = pad;
  return inp;
}
var skid = (() => {
  const MAX = 3e3;
  const pos = new Float32Array(MAX * 4 * 3), col = new Float32Array(MAX * 4);
  const g = new THREE5.BufferGeometry();
  g.setAttribute("position", new THREE5.BufferAttribute(pos, 3).setUsage(THREE5.DynamicDrawUsage));
  g.setAttribute("a", new THREE5.BufferAttribute(col, 1).setUsage(THREE5.DynamicDrawUsage));
  const idx = new Uint32Array(MAX * 6);
  for (let i = 0; i < MAX; i++) idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
  g.setIndex(new THREE5.BufferAttribute(idx, 1));
  const mat = new THREE5.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    vertexShader: "attribute float a; varying float vA; void main(){ vA=a; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: "varying float vA; void main(){ gl_FragColor=vec4(0.03,0.03,0.035,vA*0.45); }"
  });
  const mesh = new THREE5.Mesh(g, mat);
  mesh.frustumCulled = false;
  let n = 0;
  const last2 = [null, null, null, null];
  return {
    mesh,
    clear() {
      pos.fill(0);
      col.fill(0);
      g.attributes.position.needsUpdate = true;
      g.attributes.a.needsUpdate = true;
      last2.fill(null);
    },
    add(w, x, y, z, rx, rz, a) {
      const p = last2[w];
      if (!p || a <= 0) {
        last2[w] = a > 0 ? [x, y, z] : null;
        return;
      }
      const dx = x - p[0], dz = z - p[2];
      if (dx * dx + dz * dz < 0.25) return;
      const hw = 0.17, i = n % MAX;
      n++;
      pos.set([p[0] - rx * hw, p[1], p[2] - rz * hw, p[0] + rx * hw, p[1], p[2] + rz * hw, x + rx * hw, y, z + rz * hw, x - rx * hw, y, z - rz * hw], i * 12);
      col.set([a, a, a, a], i * 4);
      g.attributes.position.needsUpdate = true;
      g.attributes.a.needsUpdate = true;
      last2[w] = [x, y, z];
    }
  };
})();
scene.add(skid.mesh);
var debris = (() => {
  const N = 300;
  const mat = fogPatch(new THREE5.MeshLambertMaterial());
  const m = new THREE5.InstancedMesh(new THREE5.BoxGeometry(0.11, 0.11, 0.11), mat, N);
  m.instanceMatrix.setUsage(THREE5.DynamicDrawUsage);
  m.frustumCulled = false;
  const P = Array.from({ length: N }, () => ({ life: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, s: 1 }));
  const col = new THREE5.Color();
  let k = 0;
  const dm = new THREE5.Matrix4(), q = new THREE5.Quaternion(), sc = new THREE5.Vector3(), ps = new THREE5.Vector3();
  for (let i = 0; i < N; i++) m.setColorAt(i, col.setRGB(1, 1, 1));
  return {
    mesh: m,
    emit(x, y, z, vx, vz, c, n = 1) {
      for (let j = 0; j < n; j++) {
        const p = P[k = (k + 1) % N];
        p.life = 0.6 + Math.random() * 0.6;
        p.x = x;
        p.y = y + 0.1;
        p.z = z;
        p.vx = vx * 0.3 + (Math.random() - 0.5) * 4;
        p.vz = vz * 0.3 + (Math.random() - 0.5) * 4;
        p.vy = 2 + Math.random() * 4;
        p.s = 0.6 + Math.random() * 0.8;
        const v = 0.8 + Math.random() * 0.3;
        m.setColorAt(k, col.setRGB(c[0] * v, c[1] * v, c[2] * v, THREE5.SRGBColorSpace));
      }
      m.instanceColor.needsUpdate = true;
    },
    update(dt) {
      for (let i = 0; i < N; i++) {
        const p = P[i];
        if (p.life > 0) {
          p.life -= dt;
          p.vy -= 18 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
        }
        const s = p.life > 0 ? p.s * Math.min(1, p.life * 3) : 0;
        dm.compose(ps.set(p.x, p.y, p.z), q, sc.set(s, s, s));
        m.setMatrixAt(i, dm);
      }
      m.instanceMatrix.needsUpdate = true;
    }
  };
})();
scene.add(debris.mesh);
var smoke = (() => {
  const N = 240;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const c = cv.getContext("2d");
  const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,0.9)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = gr;
  c.fillRect(0, 0, 64, 64);
  const tex = new THREE5.CanvasTexture(cv);
  const pos = new Float32Array(N * 3), al = new Float32Array(N), sz = new Float32Array(N);
  const g = new THREE5.BufferGeometry();
  g.setAttribute("position", new THREE5.BufferAttribute(pos, 3));
  g.setAttribute("al", new THREE5.BufferAttribute(al, 1));
  g.setAttribute("sz", new THREE5.BufferAttribute(sz, 1));
  const mat = new THREE5.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { map: { value: tex }, scale: { value: 500 } },
    vertexShader: "attribute float al; attribute float sz; varying float vA; uniform float scale; void main(){ vA=al; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize = sz*scale/-mv.z; gl_Position=projectionMatrix*mv; }",
    fragmentShader: "uniform sampler2D map; varying float vA; void main(){ vec4 t=texture2D(map, gl_PointCoord); gl_FragColor=vec4(vec3(0.82), t.a*vA*0.32); }"
  });
  const pts = new THREE5.Points(g, mat);
  pts.frustumCulled = false;
  const P = Array.from({ length: N }, () => ({ life: 0, max: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, a: 1 }));
  let k = 0;
  return {
    pts,
    emit(x, y, z, vx, vz, a) {
      const p = P[k = (k + 1) % N];
      p.max = p.life = 1.2 + Math.random() * 0.8;
      p.x = x;
      p.y = y + 0.25;
      p.z = z;
      p.vx = vx * 0.4 + (Math.random() - 0.5);
      p.vz = vz * 0.4 + (Math.random() - 0.5);
      p.vy = 0.6 + Math.random();
      p.a = a;
    },
    update(dt) {
      for (let i = 0; i < N; i++) {
        const p = P[i];
        if (p.life > 0) {
          p.life -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          p.vx *= 0.97;
          p.vz *= 0.97;
        }
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
        const t = Math.max(0, p.life / p.max);
        al[i] = p.life > 0 ? t * p.a : 0;
        sz[i] = 1.2 + (1 - t) * 4;
      }
      g.attributes.position.needsUpdate = true;
      g.attributes.al.needsUpdate = true;
      g.attributes.sz.needsUpdate = true;
    }
  };
})();
scene.add(smoke.pts);
var weather = (() => {
  const N = 2200, R = 60;
  const pos = new Float32Array(N * 3), vel = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * R * 2;
    pos[i * 3 + 1] = Math.random() * 40;
    pos[i * 3 + 2] = (Math.random() - 0.5) * R * 2;
    vel[i] = 0.6 + Math.random();
  }
  const g = new THREE5.BufferGeometry();
  g.setAttribute("position", new THREE5.BufferAttribute(pos, 3));
  const mat = new THREE5.PointsMaterial({ size: 0.16, color: 16777215, transparent: true, opacity: 0.9, depthWrite: false });
  const p = new THREE5.Points(g, mat);
  p.frustumCulled = false;
  p.visible = false;
  let kind = null;
  return {
    p,
    set(k) {
      kind = k;
      p.visible = !!k;
      if (k === "snow") {
        mat.color.setHex(16777215);
        mat.size = 0.15;
        mat.opacity = 0.9;
      } else if (k === "ash") {
        mat.color.setHex(10107412);
        mat.size = 0.06;
        mat.opacity = 0.9;
      } else if (k === "bubbles") {
        mat.color.setHex(14220287);
        mat.size = 0.09;
        mat.opacity = 0.6;
      } else if (k === "petals") {
        mat.color.setHex(16165323);
        mat.size = 0.13;
        mat.opacity = 0.95;
      }
    },
    update(dt, cx, cy, cz) {
      if (!kind) return;
      const fall = kind === "snow" ? 2 : kind === "bubbles" ? -2.6 : kind === "petals" ? 1.1 : -0.5;
      for (let i = 0; i < N; i++) {
        let x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
        y -= fall * vel[i] * dt;
        x += Math.sin(y * 0.3 + i) * dt * 0.6;
        const rx = x - cx, rz = z - cz;
        if (rx > R) x -= 2 * R;
        if (rx < -R) x += 2 * R;
        if (rz > R) z -= 2 * R;
        if (rz < -R) z += 2 * R;
        if (y < cy - 8) y += 40;
        if (y > cy + 32) y -= 40;
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
      }
      g.attributes.position.needsUpdate = true;
    }
  };
})();
scene.add(weather.p);
var lap = { n: 0, start: 0, armed: false, prevS: null, last: null, valid: true, splits: [], bestSplits: null, off: 0, curS: 0 };
var raceTime = 0;
var lights = null;
var bestKey = () => sel.biome + "|" + sel.era;
async function startRace() {
  audio.init().then(() => {
    audio.setVolume(settings.vol);
    audio.setMuted(!settings.sound);
    audio.setEra(sel.era, PHYS[sel.era]);
  });
  showScreen("loading");
  $("ltitle").textContent = "Loading terrain";
  $("lstat").textContent = "Preparing the car\u2026";
  $("lfill").style.width = "5%";
  await ensureWorld();
  await ensureCar();
  if (!car) return;
  audio.setEra(sel.era, PHYS[sel.era]);
  placeCarAt(world.track.N - 30);
  lap.n = 0;
  lap.armed = false;
  lap.prevS = null;
  lap.last = null;
  lap.valid = true;
  lap.splits = [];
  lap.bestSplits = store.get("splits." + bestKey(), null);
  raceTime = 0;
  lap.start = 0;
  skid.clear();
  camState.init = false;
  const Q = QUALITY[settings.q];
  let total = null;
  await new Promise((resolve) => {
    const tick = () => {
      const left = world.update(veh.x, veh.z, 45, Q.range, Q.detail, aheadPts(95));
      if (total === null) total = Math.max(1, left);
      $("lfill").style.width = (8 + 92 * (1 - left / total)).toFixed(0) + "%";
      $("lstat").textContent = "Building terrain\u2026 " + Math.max(0, total - left) + " / " + total;
      if (left <= 0) resolve();
      else requestAnimationFrame(tick);
    };
    tick();
  });
  setupHud();
  showScreen("race");
  canvas.tabIndex = -1;
  try {
    canvas.focus({ preventScroll: true });
  } catch {
  }
  paused = false;
  ensureRacingLine();
  lights = null;
  $("lights").classList.add("hidden");
  flash("GO!", 1, "#80ff20");
  renderLights(0);
}
function renderLights(n) {
  const L = $("lights");
  L.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const c = document.createElement("div");
    c.className = "col";
    for (let j = 0; j < 2; j++) {
      const l = document.createElement("div");
      l.className = "lamp" + (i < n ? " on" : "");
      c.appendChild(l);
    }
    L.appendChild(c);
  }
}
function respawn(manual) {
  const q = world.track.near(veh.x, veh.z);
  placeCarAt(q.d > 1e8 ? 0 : q.s - 3);
  lap.valid = false;
  if (manual) flash("Respawned", 0.8);
}
function backToTitle() {
  paused = false;
  overlay = null;
  document.documentElement.classList.remove("menuopen");
  $("options").classList.remove("ingame");
  $("pause").classList.add("hidden");
  $("lights").classList.add("hidden");
  placeCarAt(world.track.N - 30);
  showScreen("title");
  if (audio.ready) audio.update({ rpm: 0, load: 0, boost: 0, lim: 0, gwF: 0, gwA: 0, vol: 0, lp: 1, speed: 0, windMul: 0, slip: 0, onPath: true, offroad: false });
}
var overlay = null;
function togglePause() {
  paused = !paused;
  overlay = paused ? "pause" : null;
  $("pause").classList.toggle("hidden", !paused);
  $("options").classList.add("hidden");
  $("options").classList.remove("ingame");
  document.documentElement.classList.toggle("menuopen", paused);
  if (paused && audio.ready) audio.update({ rpm: veh ? veh.rpm : 0, load: 0, boost: 0, lim: 0, gwF: 0, gwA: 0, vol: 0, lp: 1, speed: 0, windMul: 0, slip: 0, onPath: true, offroad: false });
  if (!paused) {
    canvas.focus?.({ preventScroll: true });
    keys.clear();
  }
}
$("menuBtn").onclick = () => {
  if (!paused) togglePause();
};
$("pResume").onclick = togglePause;
document.addEventListener("visibilitychange", () => {
  if (document.hidden && screen === "race" && !paused) togglePause();
});
$("pRestart").onclick = () => {
  togglePause();
  startRace();
};
$("pOptions").onclick = () => {
  optionsReturn = "pause";
  overlay = "options";
  $("pause").classList.add("hidden");
  renderOptions();
  $("options").classList.add("ingame");
  $("options").classList.remove("hidden");
};
$("pMenu").onclick = backToTitle;
var xpEls = [];
function setupHud() {
  const xp = $("xp");
  xp.innerHTML = "";
  xpEls = [];
  for (let i = 0; i < 18; i++) {
    const e = document.createElement("i");
    xp.appendChild(e);
    xpEls.push(e);
  }
  const t = teamOf();
  $("teamSw").style.background = `linear-gradient(${t.base} 60%, ${t.accent} 60%)`;
  $("teamLbl").textContent = `#${t.num} ${t.name} \xB7 ${sel.era}`;
  $("trkName").textContent = "\xB7 " + BIOMES[sel.biome].circuit + " - " + BIOMES[sel.biome].name;
  vmax = 0;
  $("camName").textContent = CAMS[settings.cam] + " \xB7 C";
  drawMapBase();
}
var msgTimer = 0;
function flash(text, dur = 1.6, color = "#fff") {
  const m = $("msg");
  m.textContent = text;
  m.style.color = color;
  m.classList.add("show");
  msgTimer = dur;
}
var toastT = 0;
function toast(a, b, tile) {
  $("toastA").textContent = a;
  $("toastB").textContent = b;
  const g = $("toastIcon").getContext("2d");
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, 16, 16);
  g.drawImage(atlasImg, 0, tile * 16, 16, 16, 0, 0, 16, 16);
  $("toast").classList.add("show");
  toastT = 4;
}
var mapCv = $("map");
var mapCtx = mapCv.getContext("2d");
var mapBase = null;
var mapXf = null;
var tileRGB = null;
function computeTileColors() {
  const n = Object.keys(A).length, c = document.createElement("canvas");
  c.width = 16;
  c.height = 16 * n;
  const g = c.getContext("2d");
  g.drawImage(atlasImg, 0, 0);
  const d = g.getImageData(0, 0, 16, 16 * n).data;
  tileRGB = [];
  for (let t = 0; t < n; t++) {
    let r = 0, gg = 0, b = 0, k = 0;
    for (let i = t * 256 * 4; i < (t + 1) * 256 * 4; i += 4) if (d[i + 3] > 128) {
      r += d[i];
      gg += d[i + 1];
      b += d[i + 2];
      k++;
    }
    tileRGB.push(k ? [r / k, gg / k, b / k] : [0, 0, 0]);
  }
}
function drawMapBase() {
  const m = paintMap(world, mapCv.width, true);
  mapBase = m.canvas;
  mapXf = m.xf;
}
function paintMap(world2, W, full) {
  if (!tileRGB) computeTileColors();
  const t = world2.track, b = t.bounds;
  const pad = full ? 10 : 6, span = Math.max(b.maxX - b.minX, b.maxZ - b.minZ) + 60;
  const sc = (W - 2 * pad) / span;
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const mapXf2 = (x, z) => [W / 2 + (x - cx) * sc, W / 2 + (z - cz) * sc];
  const c = document.createElement("canvas");
  c.width = c.height = W;
  const g = c.getContext("2d");
  const img = g.createImageData(W, W), D = img.data;
  const prev = new Float32Array(W);
  const G3 = world2.treeGrid;
  const leafOf = { oak: A.leaves, bigoak: A.leaves, birch: A.aspen_leaves, spruce: A.pine_needles, giant: A.jungleleaves, jungle: A.jungleleaves, bush: A.jungleleaves, acacia: A.acacia_leaves, palm: A.leaves, cactus: A.cactus, crimson: A.wart, warped: A.warped_wart, pillar: A.basalt, spire: A.netherrack, glow: A.glowstone, spike: A.packed_ice };
  for (let py = -1; py < W; py++) for (let px = 0; px < W; px++) {
    const wx = cx + (px - W / 2) / sc, wz = cz + (py - W / 2) / sc;
    const c0 = world2.column(Math.floor(wx), Math.floor(wz));
    const col = { fluid: c0.fluid, h: c0.h, top: c0.top, kind: c0.kind, smooth: c0.smooth };
    const h = col.fluid === 1 ? world2.water : col.fluid === 2 ? world2.lava : col.h;
    if (py < 0) {
      prev[px] = h;
      continue;
    }
    let tile = col.top;
    if (col.fluid === 1) tile = A.water;
    else if (col.fluid === 2) tile = A.lava;
    else if (!col.smooth) {
      const tr = world2.treeAtCell(Math.floor(wx / G3), Math.floor(wz / G3));
      if (tr && Math.abs(tr.x - wx) < 3 / Math.max(1, sc) + 2 && Math.abs(tr.z - wz) < 3 / Math.max(1, sc) + 2 && leafOf[tr.type] !== void 0) tile = leafOf[tr.type];
    }
    let rgb = tileRGB[tile] || [128, 128, 128];
    if (world2.under) rgb = [rgb[0] * 0.55 + 18, rgb[1] * 0.55 + 60, rgb[2] * 0.55 + 85];
    let shade;
    if (col.fluid) shade = 0.86 + 0.06 * (px + py & 1);
    else {
      const dh = h - prev[px];
      shade = dh > 0.3 ? 1 : dh < -0.3 ? 0.71 : 0.86;
      if (dh < -3) shade = 0.6;
    }
    if (col.kind === 1) shade = Math.max(shade, 0.95);
    prev[px] = h;
    const i = (py * W + px) * 4;
    D[i] = rgb[0] * shade;
    D[i + 1] = rgb[1] * shade;
    D[i + 2] = rgb[2] * shade;
    D[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  g.lineJoin = "round";
  g.lineCap = "round";
  const path = () => {
    g.beginPath();
    for (let i = 0; i <= t.N; i += 3) {
      const [x, y] = mapXf2(t.X[i % t.N], t.Z[i % t.N]);
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath();
  };
  path();
  g.strokeStyle = "rgba(40,28,16,0.9)";
  g.lineWidth = Math.max(4, 26 * sc);
  g.stroke();
  path();
  g.strokeStyle = "rgba(232,220,190,0.95)";
  g.lineWidth = Math.max(2, 18 * sc);
  g.stroke();
  if (!full) {
    const [sx2, sy2] = mapXf2(t.X[0], t.Z[0]);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      g.fillStyle = i + j & 1 ? "#000" : "#fff";
      g.fillRect(Math.round(sx2) - 4 + i * 2, Math.round(sy2) - 4 + j * 2, 2, 2);
    }
    return { canvas: c, xf: mapXf2 };
  }
  for (let k = 1; k < 4; k++) {
    const i = Math.floor(t.N * k / 4);
    const [x, y] = mapXf2(t.X[i], t.Z[i]);
    g.fillStyle = "#ffff55";
    g.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
    g.fillStyle = "#000";
    g.font = "10px Tiny5, monospace";
    g.fillText("S" + k, Math.round(x) + 4, Math.round(y) - 3);
  }
  const st = world2.structsNear(b.minX - 200, b.minZ - 200, b.maxX + 200, b.maxZ + 200);
  for (const s2 of st) {
    const [x, y] = mapXf2(s2.x, s2.z);
    if (x < 4 || y < 4 || x > W - 4 || y > W - 4) continue;
    g.fillStyle = "#000";
    g.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    g.fillStyle = { pyramid: "#e0b060", well: "#e0d0a0", temple: "#5a8a3a", boulder: "#999", cabin: "#a0703a", igloo: "#fff", iceberg: "#9cc8ff", bridge: "#6a1a1a", lavaspire: "#ff7020" }[s2.type] || "#fff";
    g.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
  }
  const [sx, sy] = mapXf2(t.X[0], t.Z[0]);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    g.fillStyle = i + j & 1 ? "#000" : "#fff";
    g.fillRect(Math.round(sx) - 4 + i * 2, Math.round(sy) - 4 + j * 2, 2, 2);
  }
  return { canvas: c, xf: mapXf2 };
}
async function makeThumbs(size = 160) {
  await atlasReady;
  const out = document.createElement("canvas");
  out.width = size * BIOME_ORDER.length;
  out.height = size;
  const g = out.getContext("2d");
  for (let i = 0; i < BIOME_ORDER.length; i++) {
    const k = BIOME_ORDER[i], w = new World(BIOMES[k], tracks_default[k], A, {});
    g.drawImage(paintMap(w, size, false).canvas, i * size, 0);
    await new Promise((r) => setTimeout(r, 0));
  }
  return out.toDataURL("image/png");
}
var THUMB = 160;
var thumbsImg = new Image();
var thumbsOk = false;
thumbsImg.onload = () => {
  thumbsOk = true;
  if (screen === "tracks") renderTracks();
};
thumbsImg.src = "thumbs.png";
function drawMap() {
  mapCtx.clearRect(0, 0, mapCv.width, mapCv.height);
  mapCtx.drawImage(mapBase, 0, 0);
  const [x, y] = mapXf(veh.x, veh.z);
  mapCtx.save();
  mapCtx.translate(Math.round(x), Math.round(y));
  mapCtx.rotate(-veh.yaw + Math.PI);
  mapCtx.beginPath();
  mapCtx.moveTo(0, -9);
  mapCtx.lineTo(6, 7);
  mapCtx.lineTo(0, 3);
  mapCtx.lineTo(-6, 7);
  mapCtx.closePath();
  const tm = teamOf();
  mapCtx.fillStyle = tm.base;
  mapCtx.fill();
  mapCtx.lineWidth = 2;
  mapCtx.strokeStyle = "#fff";
  mapCtx.stroke();
  mapCtx.restore();
}
var hudAcc = 0;
var vmax = 0;
function updateHud(dt) {
  hudAcc += dt;
  vmax = Math.max(vmax, Math.abs(veh.u));
  $("vmax").textContent = Math.round(vmax * (settings.units === "kmh" ? 3.6 : 2.237)) + (settings.units === "kmh" ? " km/h" : " mph");
  const P = veh.P;
  const v = Math.abs(veh.u) * (settings.units === "kmh" ? 3.6 : 2.237);
  $("spd").textContent = Math.round(v);
  document.querySelector("#bar .u").textContent = settings.units === "kmh" ? "KM/H" : "MPH";
  $("gearLvl").textContent = veh.gear === -1 ? "R" : Math.abs(veh.u) < 0.5 && inp.thr < 0.05 && inp.brk < 0.05 ? "N" : veh.gear;
  $("rpm").textContent = Math.round(veh.rpm / 10) * 10;
  $("thr").firstChild.style.height = (inp.thr * 100).toFixed(0) + "%";
  $("brk").firstChild.style.height = (inp.brk * 100).toFixed(0) + "%";
  const frac = clamp((veh.rpm - P.rpmIdle) / (P.rpmMax - P.rpmIdle), 0, 1);
  const lit = Math.round(frac * xpEls.length);
  $("xp").classList.toggle("flash", veh.rpm > P.rpmMax * 0.975 && performance.now() % 160 < 80);
  for (let i = 0; i < xpEls.length; i++) xpEls[i].className = i < lit ? i < 12 ? "on" : i < 15 ? "on r" : "on b" : "";
  let chips = "";
  if (P.mode === "active") chips += `<span class="chip ${veh.aeroMode > 0.5 ? "on" : ""}">${veh.aeroMode > 0.5 ? "X-MODE" : "Z-MODE"}</span>`;
  if (P.mode === "drs") chips += `<span class="chip ${veh.drs ? "on" : veh.drsReq ? "warn" : ""}">DRS</span>`;
  if (P.mode === "none") chips += `<span class="chip on">V8</span>`;
  if (P.mode === "turbo") chips += `<span class="chip ${veh.boost > 0.7 ? "on" : ""}">BOOST ${Math.round(veh.boost * 100)}</span>`;
  chips += `<span class="chip ${veh.tcCut > 0.05 ? "warn" : ""}">TC ${settings.tc ? ["", "MED", "HI"][settings.tc] : "OFF"}</span>`;
  $("modes").innerHTML = chips;
  $("lapN").textContent = lap.n ? lap.n : "\u2013";
  const cur = lap.n ? raceTime - lap.start : 0;
  const ce = $("cur");
  ce.textContent = fmt(lap.n ? cur : 0);
  ce.style.color = lap.valid ? "#fff" : "#ff6b6b";
  $("last").textContent = fmt(lap.last);
  $("best").textContent = fmt(bestTimes[bestKey()]);
  if (lap.n && lap.bestSplits && hudAcc > 0.1) {
    hudAcc = 0;
    const ref = lap.bestSplits[Math.floor(lap.curS / 10)];
    const de = $("delta");
    if (ref != null) {
      const d = cur - ref;
      de.textContent = (d >= 0 ? "+" : "\u2212") + Math.abs(d).toFixed(2);
      de.style.color = d >= 0 ? "#ff5555" : "#55ff55";
    }
  }
  drawMap();
  if (msgTimer > 0) {
    msgTimer -= dt;
    if (msgTimer <= 0) $("msg").classList.remove("show");
  }
  if (toastT > 0) {
    toastT -= dt;
    if (toastT <= 0) $("toast").classList.remove("show");
  }
}
var sF = {};
var sR = {};
var sC = {};
var sW = {};
var tmpV = new THREE5.Vector3();
var waterT = 0;
var lastHit = 0;
var AIR = { grip: 0.02, drag: 0 };
var dbg = { air: 0, maxVyErr: 0 };
function simulate(dt) {
  const I = readInput(dt);
  if (lights && !lights.done) {
    lights.t += dt;
    const n = Math.min(5, Math.floor(lights.t));
    if (n !== lights.lit) {
      lights.lit = n;
      renderLights(n);
      audio.beep(n ? 660 : 1320, 0.18);
    }
    veh.rpm = lerp(veh.rpm, lerp(veh.P.rpmIdle, veh.P.rpmLaunch, I.thr), Math.min(1, dt * 8));
    if (lights.t >= lights.out) {
      lights.done = true;
      renderLights(0);
      audio.beep(1320, 0.3, 0.3);
      flash("LIGHTS OUT AND AWAY WE GO!", 1.8, "#ffff55");
      setTimeout(() => $("lights").classList.add("hidden"), 900);
    }
    world.surface(veh.x, veh.z, sC);
    pushAudio(I);
    syncCarTransform(dt);
    return;
  }
  const steps = Math.ceil(dt / 2e-3), h = dt / steps;
  for (let k = 0; k < steps; k++) {
    const sy2 = Math.sin(veh.yaw), cy2 = Math.cos(veh.yaw);
    world.surface(veh.x + sy2 * veh.a, veh.z + cy2 * veh.a, sF);
    world.surface(veh.x - sy2 * veh.b, veh.z - cy2 * veh.b, sR);
    const slope = clamp((sF.y - sR.y) / veh.L, -0.4, 0.4);
    const airborne = !sC.smooth && prevGy != null && carY > prevGy + 0.3;
    if (airborne) dbg.air++;
    veh.step(h, I, airborne ? AIR : sF, airborne ? AIR : sR, airborne ? 0 : slope);
  }
  raceTime += dt;
  syncCarTransform(dt);
  const sy = Math.sin(veh.yaw), cy = Math.cos(veh.yaw), rx = -cy, rz = sy;
  const cg = car.halfWB - veh.a;
  if (settings.walls) barrier(dt);
  else collide(veh.x - sy * cg, veh.z - cy * cg, sy, cy, rx, rz);
  world.surface(veh.x, veh.z, sC);
  if (sC.fluid === 2 && carY < world.lava + 0.4) {
    flash("Tried to swim in lava", 1.6, "#ffb070");
    audio.thump(1);
    respawn(false);
  } else if (sC.fluid === 1 && carY < world.water) {
    veh.u *= 1 - Math.min(1, 2.2 * dt);
    veh.v *= 1 - Math.min(1, 3 * dt);
    waterT += dt;
    if (waterT > 1.8) {
      flash("Splashdown!", 1.4, "#9fd4ff");
      respawn(false);
      waterT = 0;
    }
  } else waterT = 0;
  const q = world.track.near(veh.x, veh.z), N = world.track.N;
  if (q.d < 1e8) {
    const s = q.s;
    lap.curS = s;
    world.track.hint = s;
    if (lap.prevS != null) {
      const ds = s - lap.prevS;
      if (ds < -N / 2) {
        if (lap.n > 0 && lap.armed) completeLap();
        lap.n++;
        lap.start = raceTime;
        lap.armed = false;
        lap.valid = true;
        lap.splits = [];
        lap.off = 0;
      } else if (ds > N / 2) lap.armed = false;
      if (s > N * 0.45 && s < N * 0.55) lap.armed = true;
      const k = Math.floor(s / 10);
      if (lap.n && lap.splits[k] == null) lap.splits[k] = raceTime - lap.start;
    }
    lap.prevS = s;
    if (q.d > world.hw + car.halfW + 1) {
      lap.off += dt;
      if (lap.off > 0.6 && lap.valid && lap.n) {
        lap.valid = false;
        flash("Track limits \xB7 lap invalidated", 1.6, "#ffb400");
      }
    }
  }
  const spd = Math.abs(veh.u), B = world.B;
  for (const w of car.wheels) {
    tmpV.copy(w.base).applyMatrix4(car.root.matrixWorld);
    const sl = w.front ? veh.slipF : veh.slipR;
    world.surface(tmpV.x, tmpV.z, sW);
    const wi = (w.front ? 0 : 2) + (w.side > 0 ? 1 : 0);
    if (sW.path && sl > 1.25 && spd > 3) {
      skid.add(wi, tmpV.x, sW.y + 0.03, tmpV.z, rx, rz, clamp((sl - 1.25) * 1.5, 0.15, 1));
      if (sl > 1.7 && Math.random() < (sl - 1.6) * 0.35) smoke.emit(tmpV.x, sW.y, tmpV.z, veh.vx, veh.vz, clamp((sl - 1.6) * 0.6, 0.1, 0.7));
    } else skid.add(wi, 0, 0, 0, 0, 0, 0);
    if (!sW.path && spd > 4 && !w.front && Math.random() < spd / 35) debris.emit(tmpV.x, sW.y, tmpV.z, veh.vx, veh.vz, B.particle, 1);
  }
  pushAudio(I);
  for (const e of veh.events) if (e === "up" || e === "down") audio.click(sel.era === "2026" ? 0.12 : 0.2, sel.era === "2026" ? 2200 : 1500);
  veh.events.length = 0;
}
function pushAudio(I) {
  if (!audio.ready) return;
  const spd = Math.abs(veh.u);
  const offroad = !sC.path && sC.d > world.hw + 1;
  const gR = veh.gear > 0 ? veh.ratios[veh.gear - 1] : veh.ratios[0];
  const onboard = settings.cam >= 2;
  audio.update({
    rpm: veh.rpm,
    load: clamp(I.thr * (1 - veh.tcCut) * (veh.shiftT > 0 ? 0.3 : 1), 0, 1),
    boost: veh.boost,
    lim: veh.limiter,
    gwF: Math.abs(veh.wr) / (2 * Math.PI) * gR * 28,
    gwA: (sel.era === "2026" ? 0.012 : 0.016) * Math.min(1, spd / 15),
    vol: 0.9,
    lp: onboard ? 1 : 0.7,
    speed: spd,
    windMul: onboard ? 1 : 0.6,
    slip: Math.max(veh.slipF, veh.slipR),
    onPath: sC.path !== false,
    offroad
  });
}
var aheadArr = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
function aheadPts(speed) {
  const t = world.track, q = t.near(veh.x, veh.z);
  if (q.d > 1e8) return null;
  const span = clamp(speed * 3.8, 160, 360), N = t.N;
  for (let k = 0; k < aheadArr.length; k++) {
    const i = Math.floor(q.s + span * (k + 1) / aheadArr.length) % N;
    aheadArr[k][0] = t.X[i];
    aheadArr[k][1] = t.Z[i];
  }
  return aheadArr;
}
function syncCarTransform(dt) {
  const sy = Math.sin(veh.yaw), cy = Math.cos(veh.yaw), rx = -cy, rz = sy;
  const cg = car.halfWB - veh.a;
  const ox = veh.x - sy * cg, oz = veh.z - cy * cg;
  const hw = (car.trackF + car.trackR) / 4;
  const hFL = world.surface(ox + sy * car.frontAxleZ - rx * hw, oz + cy * car.frontAxleZ - rz * hw, sW).y;
  const hFR = world.surface(ox + sy * car.frontAxleZ + rx * hw, oz + cy * car.frontAxleZ + rz * hw, sW).y;
  const hRL = world.surface(ox + sy * car.rearAxleZ - rx * hw, oz + cy * car.rearAxleZ - rz * hw, sW).y;
  const hRR = world.surface(ox + sy * car.rearAxleZ + rx * hw, oz + cy * car.rearAxleZ + rz * hw, sW).y;
  const gy = (hFL + hFR + hRL + hRR) / 4;
  const onTrack = world.surface(veh.x, veh.z, sW).smooth;
  const gVel = dt > 0 && prevGy != null ? clamp((gy - prevGy) / dt, -30, 30) : 0;
  prevGy = gy;
  if (dt > 0 && !onTrack && carY > gy + 0.05) {
    const P = veh.P, gEff = 9.81 + 0.6 * veh.u * veh.u * lerp(P.claZ, P.claX, veh.aeroMode) / P.mass;
    carVy -= gEff * dt;
    carY += carVy * dt;
    if (carY < gy) {
      if (carVy < -5) audio.thump(Math.min(1.2, -carVy / 12));
      carY = gy;
      carVy = Math.min(0, gVel);
    }
  } else {
    carY = gy;
    carVy = onTrack ? gVel : clamp(gVel, -30, 1.5);
  }
  const gPitch = Math.atan2((hFL + hFR) / 2 - (hRL + hRR) / 2, car.frontAxleZ - car.rearAxleZ);
  const gRoll = Math.atan2((hFL + hRL) / 2 - (hFR + hRR) / 2, hw * 2);
  car.root.position.set(ox, carY, oz);
  car.root.rotation.order = "YXZ";
  car.root.rotation.set(-gPitch, veh.yaw, gRoll);
  if (dt > 0) {
    const P = veh.P;
    const dn = 0.5 * 1.2 * veh.u * veh.u * lerp(P.claZ, P.claX, veh.aeroMode);
    car.chassis.position.y += (-dn / 9e5 - car.chassis.position.y) * Math.min(1, dt * 10);
    car.chassis.rotation.x += (clamp(-veh.ax * 16e-4, -0.03, 0.03) - car.chassis.rotation.x) * Math.min(1, dt * 8);
    car.chassis.rotation.z += (clamp(-veh.ay * 12e-4, -0.025, 0.025) - car.chassis.rotation.z) * Math.min(1, dt * 8);
    for (const w of car.wheels) {
      w.spin.rotation.x += (w.front ? veh.wf : veh.wr) * dt;
      if (w.front) w.steer.rotation.y = -veh.delta;
    }
  } else {
    car.chassis.position.y = 0;
    car.chassis.rotation.set(0, 0, 0);
    for (const w of car.wheels) {
      w.spin.rotation.x = 0;
      w.steer.rotation.y = 0;
    }
  }
  car.root.updateMatrixWorld(true);
}
function completeLap() {
  const t = raceTime - lap.start;
  lap.last = t;
  const key = bestKey(), prev = bestTimes[key];
  if (lap.valid && (prev == null || t < prev)) {
    bestTimes[key] = t;
    store.set("best", bestTimes);
    lap.bestSplits = lap.splits.slice();
    store.set("splits." + key, lap.bestSplits);
    toast("Advancement Made!", "Purple Lap  " + fmt(t), A.glowstone);
    flash("Lap " + fmt(t), 2, "#c37bff");
  } else flash((lap.valid ? "Lap " : "Invalid lap ") + fmt(t), 2, lap.valid ? "#fff" : "#ff6b6b");
}
function barrier(dt) {
  const t = world.track, q = t.near(veh.x, veh.z);
  if (q.d > 1e8) return;
  const lim = world.runoff(veh.x, veh.z) - car.halfW - 0.2;
  if (q.d <= lim) return;
  const i = q.i;
  let nx = veh.x - t.X[i], nz = veh.z - t.Z[i];
  const al = nx * t.TX[i] + nz * t.TZ[i];
  nx -= al * t.TX[i];
  nz -= al * t.TZ[i];
  const l = Math.hypot(nx, nz) || 1;
  nx /= l;
  nz /= l;
  const over = q.d - lim;
  veh.x -= nx * over;
  veh.z -= nz * over;
  const hs = Math.sin(veh.yaw), hc = Math.cos(veh.yaw), hn = hs * nx + hc * nz;
  if (hn > 0.05) {
    const fwd = hs * t.TX[i] + hc * t.TZ[i] >= 0 ? 1 : -1;
    const ty = Math.atan2(t.TX[i] * fwd, t.TZ[i] * fwd);
    let da = ty - veh.yaw;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    veh.yaw += da * Math.min(1, dt * (1.5 + 3 * hn));
  }
  const vn = veh.vx * nx + veh.vz * nz;
  if (vn > 0) {
    let vx = veh.vx - 1.25 * vn * nx, vz = veh.vz - 1.25 * vn * nz;
    const scrub = 1 - Math.min(0.35, vn * 0.025);
    vx *= scrub;
    vz *= scrub;
    const s = Math.sin(veh.yaw), c = Math.cos(veh.yaw);
    veh.u = vx * s + vz * c;
    veh.v = -vx * c + vz * s;
    veh.rho *= 0.6;
    veh.wf = veh.u / veh.Rf;
    veh.wr = veh.u / veh.Rr;
    if (vn > 2.5 && raceTime - lastHit > 0.3) {
      audio.thump(Math.min(1.2, vn / 14));
      lastHit = raceTime;
    }
  }
}
function collide(ox, oz, sy, cy, rx, rz) {
  const pts = [[0, car.nose - 0.15], [car.halfW - 0.05, car.frontAxleZ], [-car.halfW + 0.05, car.frontAxleZ], [car.halfW - 0.05, car.rearAxleZ], [-car.halfW + 0.05, car.rearAxleZ], [0, car.tail + 0.15], [0.55, 0], [-0.55, 0]];
  for (const [lx, lz] of pts) {
    const px = ox + sy * lz - rx * lx, pz = oz + cy * lz - rz * lx;
    const hit = world.obstacle(px, pz, carY);
    if (hit == null) continue;
    const bx = Math.floor(px) + 0.5, bz = Math.floor(pz) + 0.5;
    let nx = px - bx, nz = pz - bz;
    if (Math.abs(nx) > Math.abs(nz)) {
      nx = Math.sign(nx);
      nz = 0;
    } else {
      nz = Math.sign(nz);
      nx = 0;
    }
    const cxv = veh.x - px, czv = veh.z - pz;
    if (nx * cxv + nz * czv < 0) {
      const l = Math.hypot(cxv, czv) || 1;
      nx = cxv / l;
      nz = czv / l;
    }
    veh.x += nx * 0.12;
    veh.z += nz * 0.12;
    const vn = veh.vx * nx + veh.vz * nz;
    if (vn < 0) {
      let vx = veh.vx - 1.25 * vn * nx, vz = veh.vz - 1.25 * vn * nz;
      vx *= 0.82;
      vz *= 0.82;
      const s = Math.sin(veh.yaw), c = Math.cos(veh.yaw);
      veh.u = vx * s + vz * c;
      veh.v = -vx * c + vz * s;
      veh.rho += (lx * 0.4 + (Math.random() - 0.5)) * Math.min(1, -vn / 20);
      veh.wf = veh.u / veh.Rf;
      veh.wr = veh.u / veh.Rr;
      if (raceTime - lastHit > 0.25) {
        audio.thump(Math.min(1.4, -vn / 14));
        lastHit = raceTime;
        if (-vn > 6) debris.emit(px, carY + 0.3, pz, 0, 0, world.B.particle, 8);
      }
    }
  }
}
var camState = { init: false, pos: new THREE5.Vector3(), yaw: 0, look: new THREE5.Vector3(), fov: 60 };
function onboardPos(c) {
  const cz = c.frontAxleZ - (sel.era === "2026" ? 1.48 : 1.32);
  return [[0, c.height - 0.03, cz - 0.18], [0, 0.8, cz + 0.02], [0, 0.78, c.frontAxleZ + 0.1], [0, c.height + 0.1, c.tail + 0.02]];
}
var angDiff = (a, b) => {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
};
function raceCamera(dt) {
  const yaw = veh.yaw, spd = Math.abs(veh.u), cm = settings.cam, root = car.root;
  look.idle = look.drag ? 0 : look.idle + dt;
  if (look.idle > 0.25) {
    const k = Math.min(1, dt * 3);
    look.yaw -= look.yaw * k;
    look.pitch -= look.pitch * k;
  }
  if (cm <= 1) {
    if (!camState.init) {
      camState.yaw = yaw;
      camState.init = true;
      camState.pos.set(0, 0, 0);
    }
    const velYaw = spd > 5 ? Math.atan2(veh.vx, veh.vz) : yaw;
    const tgt = yaw + angDiff(yaw, velYaw) * 0.12;
    camState.yaw += angDiff(camState.yaw, tgt) * Math.min(1, dt * 11);
    camState.acc = lerp(camState.acc || 0, clamp(veh.ax, -55, 30), Math.min(1, dt * 4));
    const d0 = (cm === 0 ? 5 : 8.5) + spd * 8e-3 + camState.acc * 0.012, hgt = cm === 0 ? 1.45 : 2.6;
    const cyaw = camState.yaw + look.yaw, d = d0 * Math.cos(look.pitch);
    const cx = root.position.x - Math.sin(cyaw) * d, cz = root.position.z - Math.cos(cyaw) * d;
    let cyy = root.position.y + hgt + d0 * Math.sin(look.pitch);
    const ground = world.surface(cx, cz, sW).y;
    const blockTop = world.obstacle(cx, cz, cyy - 0.6);
    cyy = Math.max(cyy, ground + 0.8, blockTop != null ? blockTop + 0.6 : -1e9);
    if (camState.pos.lengthSq() === 0 || Math.abs(camState.pos.y - cyy) > 20) camState.pos.y = cyy;
    camState.pos.set(cx, lerp(camState.pos.y, cyy, Math.min(1, dt * 14)), cz);
    camera.position.copy(camState.pos);
    const la = 4 * Math.max(0, Math.cos(look.yaw));
    camState.look.set(root.position.x + Math.sin(camState.yaw) * la, root.position.y + 0.9, root.position.z + Math.cos(camState.yaw) * la);
    camera.up.set(0, 1, 0);
    camera.lookAt(camState.look);
    camState.fov = lerp(camState.fov, 58 + Math.min(16, spd * 0.13), Math.min(1, dt * 3));
  } else {
    const p = onboardPos(car)[cm - 2];
    camera.position.set(p[0], p[1], p[2]).applyMatrix4(car.chassis.matrixWorld);
    tmpV.set(p[0], p[1] - 0.06, p[2] + 10).applyMatrix4(car.chassis.matrixWorld);
    camera.up.set(0, 1, 0).applyQuaternion(car.root.quaternion);
    camera.lookAt(tmpV);
    const sh = Math.min(1, spd / 90) * 22e-4 + (sC.path === false ? Math.min(1, spd / 20) * 0.01 : 0);
    camera.rotation.x += (Math.random() - 0.5) * sh;
    camera.rotation.y += (Math.random() - 0.5) * sh;
    camState.fov = lerp(camState.fov, cm === 3 ? 74 : cm === 5 ? 62 : 66 + Math.min(10, spd * 0.08), Math.min(1, dt * 3));
    camState.init = false;
  }
  camera.fov = camState.fov;
  camera.updateProjectionMatrix();
}
var menuT = 0;
function menuCamera(dt) {
  menuT += dt;
  const p = car.root.position;
  if (screen === "garage") {
    const fx = Math.sin(veh.yaw), fz = Math.cos(veh.yaw);
    const base = Math.atan2(sunDir.x * 0.8 + fx, sunDir.z * 0.8 + fz);
    const a = base + Math.sin(menuT * 0.18) * 0.7, r = 6.4;
    camera.position.set(p.x + Math.sin(a) * r, p.y + 1.6, p.z + Math.cos(a) * r);
    camera.lookAt(p.x, p.y + 0.45, p.z);
    camera.translateX(view.w > 760 ? -1.6 : 0);
    camera.fov = 38;
  } else {
    const fx = Math.sin(veh.yaw), fz = Math.cos(veh.yaw);
    const a = Math.atan2(sunDir.x * 0.6 + fx, sunDir.z * 0.6 + fz) + Math.sin(menuT * 0.05) * 0.9, r = 9.5, h = 1.9 + Math.sin(menuT * 0.15) * 0.3;
    const gy = world.surface(p.x + Math.sin(a) * r, p.z + Math.cos(a) * r, sW).y;
    camera.position.set(p.x + Math.sin(a) * r, Math.max(p.y + h, gy + 1.2), p.z + Math.cos(a) * r);
    camera.lookAt(p.x, p.y + 3.4, p.z);
    camera.fov = 58;
  }
  camera.updateProjectionMatrix();
}
var last = performance.now();
var perf = { acc: 0, n: 0, lowered: 0 };
function watchPerf(dt) {
  if (window.__noPerf || screen !== "race" || paused) {
    perf.acc = 0;
    perf.n = 0;
    return;
  }
  perf.acc += dt;
  perf.n++;
  if (perf.acc < 5) return;
  const fps = perf.n / perf.acc;
  perf.acc = 0;
  perf.n = 0;
  if (fps < 33 && settings.q > 0 && perf.lowered < 2) {
    settings.q--;
    perf.lowered++;
    store.set("q3", settings.q);
    resize();
    applyQuality();
    toast("Graphics adjusted", "Now on " + QUALITY[settings.q].name + " for smoother FPS", A.stone);
  }
}
var shFwd = new THREE5.Vector3();
var shC = new THREE5.Vector3();
var shR = new THREE5.Vector3();
var shU = new THREE5.Vector3();
function fitShadow(focus) {
  const R = settings.q >= 2 ? 105 : settings.q === 1 ? 80 : 60;
  if (SCAM.right !== R) {
    SCAM.left = -R;
    SCAM.right = R;
    SCAM.top = R;
    SCAM.bottom = -R;
    SCAM.updateProjectionMatrix();
  }
  shC.copy(focus);
  if (screen === "race") {
    camera.getWorldDirection(shFwd);
    shFwd.y = 0;
    shFwd.normalize();
    shC.addScaledVector(shFwd, R * 0.5);
    shC.y = focus.y;
  }
  const texel = 2 * R / sun.shadow.mapSize.x;
  shR.crossVectors(sunDir, new THREE5.Vector3(0, 1, 0)).normalize();
  if (shR.lengthSq() < 0.5) shR.set(1, 0, 0);
  shU.crossVectors(shR, sunDir).normalize();
  const a = Math.round(shC.dot(shR) / texel) * texel, b = Math.round(shC.dot(shU) / texel) * texel, c = shC.dot(sunDir);
  shC.copy(shR).multiplyScalar(a).addScaledVector(shU, b).addScaledVector(sunDir, c);
  sun.position.copy(shC).addScaledVector(sunDir, 350);
  sun.target.position.copy(shC);
  sun.target.updateMatrixWorld();
}
var probeTick = 0;
var hideForProbe = (h) => {
  if (car) car.root.visible = !h;
  smoke.pts.visible = !h;
};
function frame(now) {
  requestAnimationFrame(frame);
  const rawDt = (now - last) / 1e3;
  const dt = Math.min(0.05, rawDt);
  last = now;
  watchPerf(Math.min(rawDt, 0.25));
  const t = now / 1e3;
  sharedUniforms.uTime.value = t;
  skyU.time.value = t;
  if (mats) mats.water.uniforms.uTime.value = t;
  const Q = QUALITY[settings.q];
  if (!world || !car) {
    renderer.render(scene, camera);
    return;
  }
  if (rLine) rLine.visible = settings.line && screen === "race";
  if (screen === "race") {
    if (!paused) simulate(dt);
    raceCamera(dt);
    if (!paused) updateHud(dt);
    world.update(camera.position.x, camera.position.z, Q.budget, Q.range, Q.detail, aheadPts(Math.abs(veh.u)));
    debris.update(paused ? 0 : dt);
    smoke.update(paused ? 0 : dt);
  } else if (screen !== "loading") {
    menuCamera(dt);
    world.update(car.root.position.x, car.root.position.z, Q.budget + 2, Math.min(Q.range, 700), Q.detail);
  }
  weather.update(dt, camera.position.x, camera.position.y, camera.position.z);
  skyU.camPos.value.copy(camera.position);
  const focus = car.root.position;
  fitShadow(focus);
  sky.position.copy(camera.position);
  if (seaTop.visible) {
    seaTop.position.x = camera.position.x;
    seaTop.position.z = camera.position.z;
    seaTop.material.uniforms.t.value = t;
    fogU.uCausT.value = t;
  }
  if (probe && screen !== "loading" && ++probeTick % 3 === 0) {
    tmpV.copy(focus);
    tmpV.y += 0.8;
    probe.update(renderer, scene, tmpV, hideForProbe);
  }
  if (window.__camHook) window.__camHook(camera, car);
  if (screen === "loading") return;
  post.render(sunDir, sunCol, curBiome?.night);
}
(async function boot() {
  resize();
  await atlasReady;
  cssTiles();
  drawLogo();
  showScreen("loading");
  $("ltitle").textContent = "F1 but it's Minecraft";
  $("lstat").textContent = "Generating " + BIOMES[sel.biome].circuit + " - " + BIOMES[sel.biome].name + "\u2026";
  applyQuality();
  await ensureWorld();
  await ensureCar();
  placeCarAt(world.track.N - 30);
  let total = null;
  await new Promise((resolve) => {
    const tick = () => {
      const left = world.update(car.root.position.x, car.root.position.z, 40, 300, QUALITY[settings.q].detail);
      if (total === null) total = Math.max(1, left);
      $("lfill").style.width = (10 + 90 * (1 - left / total)).toFixed(0) + "%";
      if (left <= 0) resolve();
      else requestAnimationFrame(tick);
    };
    tick();
  });
  showScreen("title");
  requestAnimationFrame(frame);
  window.__pp = { makeThumbs, get startLine() {
    return startLine;
  }, racingPhases, PHYS, ERAS, ensureCar, placeCarAt, get rl() {
    return { g: rlGeom, p: rlProfile };
  }, dbg, pool, skipLights() {
    if (lights) lights.t = lights.out;
  }, get carY() {
    return carY;
  }, simulate, get lap() {
    return lap;
  }, get veh() {
    return veh;
  }, get world() {
    return world;
  }, get car() {
    return car;
  }, keys, startRace, sel, settings, camera, renderer, scene, showScreen, switchWorld, get screen() {
    return screen;
  } };
})();

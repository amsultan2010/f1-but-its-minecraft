// Voxel world v2: dramatic terrain, track that follows the land, quadtree LOD tiles.
import * as THREE from 'three';
import { TRACK_WIDTH } from './data.js';
import { Simplex, hash2, smoothstep, lerp, clamp } from './noise.js';
import { fogU } from './fx.js';
import { pickStructure, buildStructure, vkey, vdec } from './structures.js';

const DECOR_G = 6;               // grid for rocks, logs and shrubs
const TILE_N = 32;                // columns per tile edge (any LOD)

// ---------------------------------------------------------------- Track
export class Track {
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
      const s = (i / N) * Ltot;
      while (cum[j + 1] < s) j++;
      const t = (s - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]);
      X[i] = lerp(dense[j][0], dense[j + 1][0], t);
      Z[i] = lerp(dense[j][1], dense[j + 1][1], t);
    }
    const TX = this.TX = new Float32Array(N), TZ = this.TZ = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = (i - 2 + N) % N, b = (i + 2) % N;
      const dx = X[b] - X[a], dz = Z[b] - Z[a], l = Math.hypot(dx, dz) || 1;
      TX[i] = dx / l; TZ[i] = dz / l;
    }
    this.H = new Float32Array(N);
    let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    for (let i = 0; i < N; i++) { minX = Math.min(minX, X[i]); maxX = Math.max(maxX, X[i]); minZ = Math.min(minZ, Z[i]); maxZ = Math.max(maxZ, Z[i]); }
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
      for (let k = -r; k <= r; k++) { const w = Math.exp(-0.5 * (k / sig) ** 2); ker.push(w); sum += w; }
      const out = new Float32Array(N);
      for (let i = 0; i < N; i++) { let a = 0; for (let k = -r; k <= r; k++) a += src[(i + k + N) % N] * ker[k + r]; out[i] = a / sum; }
      return out;
    };
    const h0 = blur(raw, 28);
    // Solve on a coarse 8 m grid: follow the land, but limit grade and vertical curvature so
    // crests never unload an F1 car (|k| <= KMAX means < 1 g of lift even near 320 km/h).
    const D = 8, M = Math.floor(N / D), KMAX = 0.0011 * D * D, G = maxGrade * D;
    const c = new Float32Array(M), tgt = new Float32Array(M);
    for (let j = 0; j < M; j++) { tgt[j] = Math.max(minH, h0[Math.floor(j * N / M)]); c[j] = tgt[j]; }
    for (let it = 0; it < 900; it++) {
      // pull gently toward the land so the solution keeps its relief
      if (it < 600) for (let j = 0; j < M; j++) c[j] += (tgt[j] - c[j]) * 0.02;
      for (let j = 0; j < M; j++) {
        const a = c[(j - 1 + M) % M], b = c[(j + 1) % M];
        const cv = a - 2 * c[j] + b;
        if (cv > KMAX) c[j] += (cv - KMAX) / 2;
        else if (cv < -KMAX) c[j] += (cv + KMAX) / 2;
      }
      for (let j = 1; j < M * 2; j++) { const a = c[(j - 1) % M], k = j % M; c[k] = clamp(c[k], a - G, a + G); }
      for (let j = M * 2; j > 0; j--) { const a = c[(j + 1) % M], k = j % M; c[k] = clamp(c[k], a - G, a + G); }
      for (let j = 0; j < M; j++) c[j] = Math.max(c[j], minH);
    }
    // back to 1 m with Catmull-Rom, then a light blur to remove any kink
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
    const G = 4, M = 360, R = 340;
    const b = this.bounds;
    this.gx0 = Math.floor(b.minX - M); this.gz0 = Math.floor(b.minZ - M);
    this.gw = Math.ceil((b.maxX - b.minX + 2 * M) / G); this.gh = Math.ceil((b.maxZ - b.minZ + 2 * M) / G);
    const idx = this.gIdx = new Int32Array(this.gw * this.gh).fill(-1);
    const dist = this.gDist = new Float32Array(this.gw * this.gh).fill(1e18);
    const rc = Math.ceil(R / G);
    for (let i = 0; i < this.N; i += 4) {
      const x = this.X[i], z = this.Z[i];
      const cx = Math.floor((x - this.gx0) / G), cz = Math.floor((z - this.gz0) / G);
      for (let dz = -rc; dz <= rc; dz++) {
        const zz = cz + dz; if (zz < 0 || zz >= this.gh) continue;
        const wz = this.gz0 + (zz + 0.5) * G - z, wz2 = wz * wz;
        if (wz2 > R * R) continue;
        for (let dx = -rc; dx <= rc; dx++) {
          const xx = cx + dx; if (xx < 0 || xx >= this.gw) continue;
          const wx = this.gx0 + (xx + 0.5) * G - x;
          const d2 = wx * wx + wz2;
          const k = zz * this.gw + xx;
          if (d2 < dist[k]) { dist[k] = d2; idx[k] = i; }
        }
      }
    }
    this.G = G;
  }
  // figure-8 circuits: the two passes over the crossing; near() must pick the right one
  setCrossing(iLow, iUp, R) {
    this.cross = { iLow, iUp, R, x: (this.X[iLow] + this.X[iUp]) / 2, z: (this.Z[iLow] + this.Z[iUp]) / 2 };
    this.qa = { d: 1e9, s: 0, i: 0, lat: 0, h: 0 }; this.qb = { d: 1e9, s: 0, i: 0, lat: 0, h: 0 };
    this.hint = null;
  }
  _nearWin(x, z, i0, out) {
    const N = this.N, X = this.X, Z = this.Z;
    let best = 1e18, bi = i0;
    for (let k = -170; k <= 170; k++) { const i = (i0 + k + N) % N, dx = x - X[i], dz = z - Z[i], d2 = dx * dx + dz * dz; if (d2 < best) { best = d2; bi = i; } }
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
      const q = this.q; q.d = pick.d; q.s = pick.s; q.i = pick.i; q.lat = pick.lat; q.h = pick.h;
      return q;
    }
    return this._near(x, z);
  }
  _near(x, z) {
    const q = this.q;
    const cx = Math.floor((x - this.gx0) / this.G), cz = Math.floor((z - this.gz0) / this.G);
    if (cx < 0 || cz < 0 || cx >= this.gw || cz >= this.gh) { q.d = 1e9; return q; }
    const k0 = cz * this.gw + cx;
    const i0 = this.gIdx[k0];
    if (i0 < 0) { q.d = 1e9; return q; }
    const N = this.N, X = this.X, Z = this.Z;
    if (this.gDist[k0] > 60 * 60) { // far: coarse answer is enough
      q.d = Math.hypot(x - X[i0], z - Z[i0]); q.s = i0; q.i = i0; q.h = this.H[i0]; q.lat = 0;
      return q;
    }
    let best = 1e18, bi = i0;
    for (let k = -10; k <= 10; k++) {
      const i = (i0 + k + N) % N;
      const dx = x - X[i], dz = z - Z[i], d2 = dx * dx + dz * dz;
      if (d2 < best) { best = d2; bi = i; }
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
      ax = X[bi] - X[im]; az = Z[bi] - Z[im];
      t = clamp(((x - X[im]) * ax + (z - Z[im]) * az) / (ax * ax + az * az || 1), 0, 1);
      px = X[im] + ax * t; pz = Z[im] + az * t; s = bi - 1 + t;
    } else { t = Math.min(t, 1); px = X[bi] + ax * t; pz = Z[bi] + az * t; s = bi + t; }
    if (s < 0) s += N;
    const dx = x - px, dz = z - pz;
    q.d = Math.hypot(dx, dz);
    q.lat = (ax * dz - az * dx) > 0 ? q.d : -q.d;
    q.s = s; q.i = bi;
    q.h = this.hAt(s);
    return q;
  }
  hAt(s) {
    const N = this.N; s = ((s % N) + N) % N;
    const i = Math.floor(s), f = s - i;
    return lerp(this.H[i], this.H[(i + 1) % N], f);
  }
}

// ---------------------------------------------------------------- Block textures / materials
export function makeBlockTexture(img, count) {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16 * count;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const src = g.getImageData(0, 0, 16, 16 * count).data;
  const data = new Uint8Array(16 * 16 * 4 * count);
  for (let l = 0; l < count; l++) for (let y = 0; y < 16; y++) {
    const sy = l * 16 + (15 - y);
    for (let x = 0; x < 16; x++) {
      const si = (sy * 16 + x) * 4, di = ((l * 16 + y) * 16 + x) * 4;
      data[di] = src[si]; data[di + 1] = src[si + 1]; data[di + 2] = src[si + 2]; data[di + 3] = src[si + 3];
    }
  }
  const tex = new THREE.DataArrayTexture(data, 16, 16, count);
  tex.format = THREE.RGBAFormat; tex.type = THREE.UnsignedByteType;
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true; tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// "RTX" material data per texel: tangent-space normal (from a height = luminance Sobel) and roughness.
export function makePbrTexture(img, A) {
  const count = Object.keys(A).length;
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16 * count;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const src = g.getImageData(0, 0, 16, 16 * count).data;
  const names = []; for (const k in A) names[A[k]] = k;
  const R = (n) => {
    if (/ice/.test(n)) return [0.06, 0.6];
    if (n === 'glass') return [0.05, 0.3];
    if (n === 'obsidian') return [0.12, 1.4];
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
    const [rough, bump] = R(names[l] || '');
    const lum = new Float32Array(256);
    let mean = 0;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const si = ((l * 16 + y) * 16 + x) * 4;
      lum[y * 16 + x] = (src[si] * 0.3 + src[si + 1] * 0.59 + src[si + 2] * 0.11) / 255; mean += lum[y * 16 + x];
    }
    mean /= 256;
    const L = (x, y) => lum[((y + 16) % 16) * 16 + ((x + 16) % 16)];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      // image row y is texture row 15-y (texture is flipped in makeBlockTexture)
      const gx = (L(x + 1, y - 1) + 2 * L(x + 1, y) + L(x + 1, y + 1)) - (L(x - 1, y - 1) + 2 * L(x - 1, y) + L(x - 1, y + 1));
      const gy = (L(x - 1, y + 1) + 2 * L(x, y + 1) + L(x + 1, y + 1)) - (L(x - 1, y - 1) + 2 * L(x, y - 1) + L(x + 1, y - 1));
      let nx = -gx * bump, ny = gy * bump;
      const nl = Math.hypot(nx, ny, 1); nx /= nl; ny /= nl;
      const r = clamp(rough - (L(x, y) - mean) * 0.6, 0.03, 1);
      const di = ((l * 16 + (15 - y)) * 16 + x) * 4;
      data[di] = Math.round((nx * 0.5 + 0.5) * 255); data[di + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[di + 2] = Math.round(r * 255); data[di + 3] = 255;
    }
  }
  const tex = new THREE.DataArrayTexture(data, 16, 16, count);
  tex.format = THREE.RGBAFormat; tex.type = THREE.UnsignedByteType;
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.generateMipmaps = true; tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export const sharedUniforms = { uTime: { value: 0 }, uBump: { value: 0.7 } };

// Physically based block material (the "RTX" look): per-texel normals and roughness, GGX sun
// highlights, sky reflections from the environment map, leaf translucency.
export function makePbrBlockMaterial(tex, pbr, A, opts = {}) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, alphaTest: opts.alphaTest ?? 0.5, side: opts.side || THREE.FrontSide, metalness: 0, roughness: 0.7 });
  const wave = [A.leaves, A.jungleleaves, A.pine_needles, A.aspen_leaves, A.acacia_leaves, A.vine, A.cherry_leaves, A.darkoak_leaves];
  const plants = Object.keys(A).filter((k) => k.startsWith('p_')).map((k) => A[k]);
  const leafy = [...wave, A.leaves_o, A.jungleleaves_o, A.pine_needles_o, A.aspen_leaves_o, A.acacia_leaves_o, A.cherry_leaves_o, A.darkoak_leaves_o, ...plants];
  m.onBeforeCompile = (sh) => {
    sh.uniforms.tArr = { value: tex };
    sh.uniforms.tPbr = { value: pbr };
    sh.uniforms.uTime = sharedUniforms.uTime;
    sh.uniforms.uBump = sharedUniforms.uBump;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float tl;\nvarying vec2 vTUV;\nvarying float vTL;\nvarying vec3 vWN;\nuniform float uTime;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvTUV = uv; vTL = tl; vWN = normal;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        {
          float L = floor(tl + 0.5);
          vec4 wp = modelMatrix * vec4(transformed, 1.0);
          float w = 0.0;
          ${wave.map((v) => `if (abs(L - ${v}.0) < 0.5) w = 0.06;`).join('\n')}
          ${plants.map((v) => `if (abs(L - ${v}.0) < 0.5) w = 0.13 * fract(transformed.y + 0.001);`).join('\n')}
          if (w > 0.0) {
            float ph = wp.x * 0.37 + wp.z * 0.23;
            transformed.x += w * sin(uTime * 1.7 + ph) + w * 0.4 * sin(uTime * 3.1 + ph * 2.0);
            transformed.z += w * cos(uTime * 1.3 + ph * 1.3);
          }
        }`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nprecision highp sampler2DArray;\nuniform sampler2DArray tArr, tPbr;\nuniform float uBump;\nvarying vec2 vTUV;\nvarying float vTL;\nvarying vec3 vWN;')
      .replace('#include <map_fragment>', `
        float L = floor(vTL + 0.5);
        vec2 tdx = dFdx(vTUV), tdy = dFdy(vTUV);
        vec4 texel = textureGrad(tArr, vec3(fract(vTUV), L), tdx, tdy);
        vec4 pbrT = textureGrad(tPbr, vec3(fract(vTUV), L), tdx, tdy);
        bool leafy = false;
        ${leafy.map((v) => `if (abs(L - ${v}.0) < 0.5) leafy = true;`).join('\n')}
        diffuseColor *= texel;`)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = pbrT.b;')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        {
          vec3 wn = normalize(vWN);
          vec3 T, Bt;
          if (abs(wn.y) > 0.5) { T = vec3(1.0, 0.0, 0.0); Bt = vec3(0.0, 0.0, 1.0); }
          else if (abs(wn.x) > 0.5) { T = vec3(0.0, 0.0, 1.0); Bt = vec3(0.0, 1.0, 0.0); }
          else { T = vec3(1.0, 0.0, 0.0); Bt = vec3(0.0, 1.0, 0.0); }
          vec2 nt = (pbrT.rg * 2.0 - 1.0) * uBump;
          vec3 pn = normalize(wn + T * nt.x + Bt * nt.y);
          normal = normalize((viewMatrix * vec4(pn, 0.0)).xyz);
        }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        if (abs(L - ${A.glowstone}.0) < 0.5 || abs(L - ${A.shroomlight}.0) < 0.5) totalEmissiveRadiance += texel.rgb * 2.6;
        if (abs(L - ${A.lava}.0) < 0.5) totalEmissiveRadiance += texel.rgb * 3.0;`)
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
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
  m.customProgramCacheKey = () => 'pblock' + (opts.side || 0) + (opts.alphaTest ?? 0.5);
  return m;
}

export function makeBlockMaterial(tex, A, opts = {}) {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, alphaTest: opts.alphaTest ?? 0.5, side: opts.side || THREE.FrontSide });
  const wave = [A.leaves, A.jungleleaves, A.pine_needles, A.aspen_leaves, A.acacia_leaves, A.vine, A.cherry_leaves, A.darkoak_leaves];
  const plants = Object.keys(A).filter((k) => k.startsWith('p_')).map((k) => A[k]);
  m.onBeforeCompile = (sh) => {
    sh.uniforms.tArr = { value: tex };
    sh.uniforms.uTime = sharedUniforms.uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float tl;\nvarying vec2 vTUV;\nvarying float vTL;\nuniform float uTime;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvTUV = uv; vTL = tl;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        {
          float L = floor(tl + 0.5);
          vec4 wp = modelMatrix * vec4(transformed, 1.0);
          float w = 0.0;
          ${wave.map((v) => `if (abs(L - ${v}.0) < 0.5) w = 0.06;`).join('\n')}
          ${plants.map((v) => `if (abs(L - ${v}.0) < 0.5) w = 0.13 * fract(transformed.y + 0.001);`).join('\n')}
          if (w > 0.0) {
            float ph = wp.x * 0.37 + wp.z * 0.23;
            transformed.x += w * sin(uTime * 1.7 + ph) + w * 0.4 * sin(uTime * 3.1 + ph * 2.0);
            transformed.z += w * cos(uTime * 1.3 + ph * 1.3);
          }
        }`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nprecision highp sampler2DArray;\nuniform sampler2DArray tArr;\nvarying vec2 vTUV;\nvarying float vTL;')
      .replace('#include <map_fragment>', `
        float L = floor(vTL + 0.5);
        vec4 texel = textureGrad(tArr, vec3(fract(vTUV), L), dFdx(vTUV), dFdy(vTUV));
        diffuseColor *= texel;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        if (abs(L - ${A.glowstone}.0) < 0.5 || abs(L - ${A.shroomlight}.0) < 0.5) totalEmissiveRadiance += texel.rgb * 2.2;
        if (abs(L - ${A.lava}.0) < 0.5) totalEmissiveRadiance += texel.rgb * 2.6;`);
  };
  m.customProgramCacheKey = () => 'block' + (opts.side || 0);
  return m;
}

// Shader-pack style water: fresnel sky reflection, sun glint, animated ripples.
export function makeWaterMaterial(sky) {
  const wm = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 }, zen: { value: new THREE.Color() }, hor: { value: new THREE.Color() },
      sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, deep: { value: new THREE.Color(0x0b3a5a) },
      cover: { value: 0.4 },
    }]),
    vertexShader: `varying vec3 vW;
${THREE.ShaderChunk.fog_pars_vertex}
      void main(){ vec3 transformed = position; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
${THREE.ShaderChunk.fog_vertex}
 }`,
    fragmentShader: `uniform float uTime, cover; uniform vec3 zen, hor, sunDir, sunCol, deep; varying vec3 vW;
${THREE.ShaderChunk.common}
${THREE.ShaderChunk.fog_pars_fragment}

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

${THREE.ShaderChunk.fog_fragment}
      }`,
  });
  Object.assign(wm.uniforms, fogU);
  return wm;
}

// ---------------------------------------------------------------- World
export class World {
  constructor(biome, trackPts, A, mats) {
    this.B = biome; this.A = A; this.mats = mats;
    this.st = biome.style || biome.key;   // terrain / decoration style (several tracks can share one)
    this.noise = new Simplex(biome.seed);
    this.noise2 = new Simplex(biome.seed + 1000);
    this.noise3 = new Simplex(biome.seed + 2000);
    this.water = biome.water; this.lava = biome.lava ?? -999;
    this.hw = (biome.width || TRACK_WIDTH) / 2;   // half width of the road
    this.flat = this.hw + 5;                       // max half width of the smooth (exact-height) zone
    if (biome.sea) this._coastSetup(biome);
    this.track = new Track(trackPts);
    this.under = !!biome.underwater;   // the whole circuit lies on the sea floor
    const minH = this.under ? -999 : Math.max(this.water, this.lava) + (biome.lava ? 7 : 2.5);
    this.track.setHeights((x, z) => this.terrainRaw(x, z, 0), minH, { taiga: 0.115, arctic: 0.06, plains: 0.03, shore: 0.1, darkforest: 0.03, cherry: 0.09, peaks: 0.05, ocean: 0.06, badlands: 0.1, meadow: 0.115 }[this.st] ?? 0.1);
    if (biome.bridge) this._bridgeSetup(minH);
    this.group = new THREE.Group();
    this.tiles = new Map();
    this.col = { h: 0, top: 0, smooth: 0, d: 0, s: 0, kind: 0, sideTop: 0, sub: 0, deep: 0, fluid: 0, raw: 0, band: 0 };
    this.pathTiles = biome.path.map((n) => A[n]);
    this.treeGrid = { desert: 8, jungle: 4, taiga: 5, nether: 7, arctic: 6, shore: 7, plains: 7, darkforest: 5, cherry: 6, peaks: 6, ocean: 5, badlands: 9, meadow: 8 }[this.st];
    const t = this.track;
    this.start = { x: t.X[0], z: t.Z[0], tx: t.TX[0], tz: t.TZ[0] };
    this.cliff = { desert: A.desert_stone, jungle: A.stone, taiga: A.stone, nether: A.netherrack, arctic: A.stone, shore: A.stone, plains: A.stone, darkforest: A.stone, cherry: A.stone, peaks: A.stone, ocean: A.stone, badlands: A.tc_orange, meadow: A.stone }[this.st];
    this.treeCache = new Map();
    this.structGrid = { desert: 230, jungle: 210, taiga: 250, nether: 190, arctic: 200, shore: 90, plains: 240, darkforest: 200, cherry: 220, peaks: 240, ocean: 120, badlands: 220, meadow: 260 }[this.st];
    this.structCache = new Map();
    this.inflight = new Set();
    this.voxTreeMaxS = 2;   // real voxel trees out to the 64 m tiles, so trees never visibly swap
    this.want = null;
    this.pool = null;
  }
  // Riviera: a precomputed field of 'distance inland from the sea' (negative at sea), 8 m grid
  _coastSetup(B) {
    const poly = B.sea, G = 8, x0 = -1700, z0 = -1900, W = 450, H = 560;
    const inside = (x, z) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
    const f = new Float32Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = x0 + i * G, z = z0 + j * G;
      let d = 1e9;
      for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
        const [ax, az] = poly[b], [bx, bz] = poly[a], sx = bx - ax, sz = bz - az, l = sx * sx + sz * sz;
        const t = clamp(((x - ax) * sx + (z - az) * sz) / l, 0, 1);
        d = Math.min(d, Math.hypot(ax + sx * t - x, az + sz * t - z));
      }
      f[j * W + i] = inside(x, z) ? -d : d;
    }
    this.coastF = { f, G, x0, z0, W, H };
  }
  inland(x, z) {
    const c = this.coastF, fx = clamp((x - c.x0) / c.G, 0, c.W - 1.001), fz = clamp((z - c.z0) / c.G, 0, c.H - 1.001);
    const i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j, f = c.f, W = c.W;
    return lerp(lerp(f[j * W + i], f[j * W + i + 1], tx), lerp(f[(j + 1) * W + i], f[(j + 1) * W + i + 1], tx), tz);
  }
  inTunnel(s) { const T = this.B.tunnel; return !!T && s >= T[0] && s <= T[1]; }

  // figure-8: find where the lap crosses itself, lift the second pass onto a bridge
  _bridgeSetup(minH) {
    const t = this.track, N = t.N;
    let best = 1e18, ia = 0, ib = 0;
    for (let i = 0; i < N; i += 4) for (let j = i + 300; j < N; j += 4) {
      if (N - (j - i) < 300) continue;
      const d = (t.X[i] - t.X[j]) ** 2 + (t.Z[i] - t.Z[j]) ** 2;
      if (d < best) { best = d; ia = i; ib = j; }
    }
    for (let k = -4; k <= 4; k++) for (let m = -4; m <= 4; m++) {
      const i = (ia + k + N) % N, j = (ib + m + N) % N, d = (t.X[i] - t.X[j]) ** 2 + (t.Z[i] - t.Z[j]) ** 2;
      if (d < best) { best = d; ia = i; ib = j; }
    }
    t.setCrossing(ia, ib, this.hw + 7);
    // clearance: the upper pass rises, the lower one dips a little, both with gentle ramps
    const need = t.H[ia] + 10.5 - t.H[ib];
    if (need > 0) {
      let down = Math.min(need * 0.4, Math.max(0, t.H[ia] - minH - 0.5)), up = need - down;
      const bump = (i0, amp) => {
        const W = Math.max(140, 28 * amp);
        for (let k = -Math.ceil(W); k <= Math.ceil(W); k++) { const i = (i0 + k + N) % N; t.H[i] += amp * 0.5 * (1 + Math.cos(Math.PI * k / W)); }
      };
      bump(ib, up); if (down > 0) bump(ia, -down);
    }
  }
  // deck of the bridge: stone slab over the lower road, with low parapets
  buildBridge(ox, oz, size, put) {
    const t = this.track, c = t.cross, A = this.A;
    if (ox > c.x + 60 || ox + size < c.x - 60 || oz > c.z + 60 || oz + size < c.z - 60) return;
    for (let z = oz - 1; z <= oz + size; z++) for (let x = ox - 1; x <= ox + size; x++) {
      if (Math.abs(x - c.x) > 60 || Math.abs(z - c.z) > 60) continue;
      const a = t._nearWin(x + 0.5, z + 0.5, c.iLow, t.qa), ad = a.d;
      if (ad > c.R + 1.5) continue;
      const b = t._nearWin(x + 0.5, z + 0.5, c.iUp, t.qb);
      if (b.d > this.hw + 1.4) continue;
      // a natural stone arch: grassy edges, thicker toward its ends, no parapets or piers
      const y = Math.round(b.h) - 1, ends = smoothstep(c.R - 8, c.R + 1.5, ad), r = hash2(x, z, 74);
      put(x, y, z, b.d > this.hw + 0.4 ? A.grass : A.stone);
      const th = 2 + Math.round(ends * 5 + r);
      for (let k = 1; k <= th; k++) put(x, y - k, z, hash2(x, z + k, 75) < 0.25 ? A.mossycobble : A.stone);
    }
  }

  structAt(gx, gz) {
    const k = gx + ',' + gz;
    if (this.structCache.has(k)) return this.structCache.get(k);
    const st = pickStructure(this, gx, gz);
    if (st) {
      st.vox = buildStructure(this, st);
      st.ground = new Map();
    }
    this.structCache.set(k, st);
    return st;
  }
  structsNear(x0, z0, x1, z1) {
    const G = this.structGrid, out = [];
    for (let gx = Math.floor((x0 - 130) / G); gx <= Math.floor((x1 + 130) / G); gx++)
      for (let gz = Math.floor((z0 - 130) / G); gz <= Math.floor((z1 + 130) / G); gz++) { const st = this.structAt(gx, gz); if (st) out.push(st); }
    return out;
  }
  netherRegion(x, z) {
    const v = this.noise3.fbm(x / 420 + 9, z / 420 - 4, 3);
    if (v > 0.22) return 'crimson';
    if (v < -0.25) return 'warped';
    const s2 = this.noise2.n2(x / 34, z / 34);
    if (s2 > 0.45) return 'soul';
    if (s2 < -0.5) return 'basalt';
    return 'rack';
  }

  // ---- raw terrain (absolute block height). d = distance to track centreline
  terrainRaw(x, z, d) {
    const n = this.noise, n2 = this.noise2, n3 = this.noise3, B = this.B, b = B.base;
    const away = smoothstep(28, 210, d);
    const wx = x + 55 * n3.n2(x / 340 + 7.1, z / 340 - 3.3), wz = z + 55 * n3.n2(x / 340 - 11.7, z / 340 + 5.9);
    let h;
    switch (this.st) {
      case 'taiga': {
        const hills = 42 * n.fbm(wx / 520, wz / 520, 4) + 16 * n.fbm(wx / 170, wz / 170, 3) + 4 * n.fbm(wx / 40, wz / 40, 2);
        const mask = smoothstep(-0.55, 0.15, n2.fbm(x / 1500 + 3, z / 1500, 3));
        const mount = 190 * Math.pow(n.ridge(wx / 600, wz / 600, 5), 2.1) * mask * (0.15 + 0.85 * away);
        h = b + hills + mount;
        const rv = Math.abs(n2.n2(wx / 900, wz / 900));
        const river = (1 - smoothstep(0.02, 0.07, rv)) * (0.3 + 0.7 * away);
        h = lerp(h, this.water - 4, river * smoothstep(this.water - 6, this.water + 30, h));
        break;
      }
      case 'jungle': {
        const hills = 34 * n.fbm(wx / 380, wz / 380, 4) + 14 * n.fbm(wx / 120, wz / 120, 3) + 4 * n.fbm(wx / 40, wz / 40, 2);
        const kmask = smoothstep(0.0, 0.45, n2.fbm(x / 800, z / 800, 2));
        const karst = 85 * Math.pow(n.ridge(wx / 170, wz / 170, 3), 4) * kmask * (0.2 + 0.8 * away);
        h = b + hills + karst;
        const rv = Math.abs(n2.n2(wx / 700, wz / 700));
        const river = (1 - smoothstep(0.03, 0.09, rv));
        h = lerp(h, this.water - 5, river * 0.95);
        break;
      }
      case 'desert': {
        const dunes = 18 * Math.pow(n.ridge(wx / 80, wz / 200, 3), 1.5) + 22 * n.fbm(wx / 600, wz / 600, 3) + 6 * n.fbm(wx / 160, wz / 160, 2);
        const m = n2.fbm(x / 650, z / 650, 4);
        let mesa = smoothstep(0.12, 0.2, m) * (34 + 22 * n.fbm(x / 170, z / 170, 2));
        mesa = Math.floor(mesa / 6) * 6 + smoothstep(0, 1, (mesa % 6) / 6) * 0.0;
        h = b + dunes + mesa * (0.1 + 0.9 * away);
        break;
      }
      case 'arctic': {
        const land = b + 4 + 14 * n.fbm(wx / 300, wz / 300, 4) + 4 * n.fbm(wx / 60, wz / 60, 2);
        const lake = b - 9 + 3 * n.fbm(wx / 90, wz / 90, 3);
        const island = 1 - smoothstep(70, 210, d + 60 * n2.n2(x / 300, z / 300));
        const mask = smoothstep(-0.1, 0.4, n2.fbm(x / 1300, z / 1300, 3));
        const mount = 170 * Math.pow(n.ridge(wx / 520, wz / 520, 5), 2.5) * mask * smoothstep(260, 620, d);
        h = lerp(lake, land, island) + mount;
        break;
      }
      case 'shore': {
        // stony shore: shallow warm water with reefs, cliffs straight out of the sea, windswept hills behind
        const di = this.inland(x, z) + 14 * n3.n2(x / 90, z / 90);
        if (di < 0) { h = this.water - 3 - Math.min(9, -di * 0.06) - 2.5 * n.fbm(x / 30, z / 30, 2); break; }
        const slope = 2.5 + 64 * smoothstep(0, 360, di) + 10 * n.fbm(wx / 160, wz / 160, 3);
        const hills = 120 * Math.pow(smoothstep(500, 1900, di), 1.3) * (0.4 + 0.6 * n.ridge(wx / 380, wz / 380, 4));
        h = this.water + slope + hills;
        const R = B.rock, ed = Math.min(x - R[0], R[2] - x, z - R[1], R[3] - z) + 18 * n2.n2(x / 60, z / 60);
        if (ed > 0) h = Math.max(h, this.water + 4 + 52 * smoothstep(0, 22, ed) + 3 * n.fbm(x / 40, z / 40, 2));
        break;
      }
      case 'darkforest': {
        // flat royal-park ground under a closed canopy, a few ponds
        h = b + 4 * n.fbm(wx / 520, wz / 520, 3) + 2 * n.fbm(wx / 120, wz / 120, 2) + 30 * Math.pow(n.ridge(wx / 900, wz / 900, 3), 2.5) * smoothstep(300, 800, d);
        const pond = smoothstep(0.42, 0.55, n2.fbm(x / 160, z / 160, 2)) * smoothstep(40, 90, d);
        h = lerp(h, this.water - 3, pond);
        break;
      }
      case 'cherry': {
        const hills = 24 * n.fbm(wx / 420, wz / 420, 4) + 9 * n.fbm(wx / 130, wz / 130, 3);
        const mask = smoothstep(-0.4, 0.2, n2.fbm(x / 1300, z / 1300, 3));
        const mount = 150 * Math.pow(n.ridge(wx / 560, wz / 560, 5), 2.2) * mask * (0.1 + 0.9 * away);
        h = b + hills + mount;
        const rv = Math.abs(n2.n2(wx / 800, wz / 800));
        h = lerp(h, this.water - 3, (1 - smoothstep(0.02, 0.06, rv)) * smoothstep(50, 120, d));
        break;
      }
      case 'peaks': {
        // a high plateau ringed by jagged, snow-capped peaks that rise right behind the verge
        const plat = b + 5 * n.fbm(wx / 400, wz / 400, 3) + 3 * n.fbm(wx / 110, wz / 110, 2);
        const big = 300 * Math.pow(n.ridge(wx / 420, wz / 420, 5), 1.9) * smoothstep(70, 420, d);
        const jag = 90 * Math.pow(n.ridge(wx / 150, wz / 150, 3), 3) * smoothstep(60, 240, d);
        h = plat + big + jag;
        break;
      }
      case 'ocean': {
        // sea floor: sand ripples, reef mounds and deep ravines away from the road
        const rip = 1.2 * Math.pow(n.ridge(x / 14, z / 34, 2), 2);
        const reef = 14 * Math.pow(Math.max(0, n2.fbm(wx / 110, wz / 110, 3)), 1.5) * (0.3 + 0.7 * away);
        const rv = Math.abs(n3.n2(wx / 520, wz / 520));
        const ravine = (1 - smoothstep(0.02, 0.07, rv)) * 26 * smoothstep(40, 120, d);
        h = b + 6 * n.fbm(wx / 300, wz / 300, 3) + 3 * n.fbm(wx / 70, wz / 70, 2) + rip + reef - ravine + 60 * Math.pow(n.ridge(wx / 700, wz / 700, 4), 3) * smoothstep(250, 700, d);
        break;
      }
      case 'badlands': {
        // red sand flats, stepped terracotta mesas and eroded hoodoo spires
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
      case 'meadow': {
        const hills = 30 * n.fbm(wx / 460, wz / 460, 4) + 12 * n.fbm(wx / 150, wz / 150, 3);
        const mask = smoothstep(-0.55, 0.15, n2.fbm(x / 1500 + 3, z / 1500, 3));
        const mount = 200 * Math.pow(n.ridge(wx / 600, wz / 600, 5), 2.1) * mask * (0.12 + 0.88 * away);
        h = b + hills + mount;
        break;
      }
      case 'plains': {
        // gently rolling English countryside with a few low ridges far off
        const roll = 7 * n.fbm(wx / 650, wz / 650, 3) + 3 * n.fbm(wx / 180, wz / 180, 2);
        const ridge = 60 * Math.pow(n.ridge(wx / 900, wz / 900, 4), 2.4) * smoothstep(380, 900, d);
        h = b + roll + ridge;
        const rv = Math.abs(n2.n2(wx / 1100, wz / 1100));
        h = lerp(h, this.water - 3, (1 - smoothstep(0.015, 0.05, rv)) * smoothstep(60, 140, d));
        break;
      }
      case 'nether': {
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
      case 'taiga': return m * (3.2 * n3.fbm(x / 24, z / 24, 3) + 1.2 * n.n2(x / 7.5, z / 7.5) + 16 * knoll);
      case 'jungle': return m * (3.8 * n3.fbm(x / 20, z / 20, 3) + 1.4 * n.n2(x / 6.5, z / 6.5) + 20 * knoll);
      case 'desert': return m * (3.5 * Math.pow(n.ridge(x / 16, z / 34, 2), 2) + 1.2 * n3.fbm(x / 22, z / 22, 2) + 9 * knoll);
      case 'arctic': return m * (2.6 * n3.fbm(x / 18, z / 30, 3) + 0.8 * n.n2(x / 6, z / 6) + 12 * knoll);
      case 'nether': return m * (4.2 * n3.fbm(x / 16, z / 16, 3) + 1.8 * n.n2(x / 5.5, z / 5.5) + 18 * knoll);
      case 'shore': return this.inland(x, z) < 6 ? 0 : m * (1.6 * n3.fbm(x / 20, z / 20, 2) + 9 * knoll);
      case 'darkforest': return m * (1.4 * n3.fbm(x / 22, z / 22, 2) + 0.6 * n.n2(x / 7, z / 7) + 6 * knoll);
      case 'cherry': return m * (2.2 * n3.fbm(x / 22, z / 22, 3) + 0.8 * n.n2(x / 7, z / 7) + 11 * knoll);
      case 'peaks': return m * (3.0 * n3.fbm(x / 18, z / 18, 3) + 1.2 * n.n2(x / 6, z / 6) + 14 * knoll);
      case 'ocean': return m * (1.0 * n3.fbm(x / 16, z / 16, 2) + 5 * knoll);
      case 'badlands': return m * (0.8 * n3.fbm(x / 24, z / 24, 2) + 3 * knoll);
      case 'meadow': return m * (2.6 * n3.fbm(x / 24, z / 24, 3) + 0.9 * n.n2(x / 7.5, z / 7.5) + 13 * knoll);
      case 'plains': return m * (1.0 * n3.fbm(x / 26, z / 26, 2) + 0.4 * n.n2(x / 8, z / 8) + 3 * knoll);
    }
    return 0;
  }

  // half width of the smooth verge: varies along the track so the edge never looks ruled
  runoff(x, z) {
    if (this.st === 'shore') return this.hw + 1.2;   // narrow verge, like a street circuit
    return this.hw + 1.6 + 3.4 * (0.5 + 0.5 * this.noise3.n2(x / 41 + 3.7, z / 41 - 8.1));
  }

  column(x, z) {
    const c = this.col, A = this.A, B = this.B;
    const q = this.track.near(x + 0.5, z + 0.5, false);
    c.d = q.d; c.s = q.s; c.fluid = 0; c.band = 0;
    const R = q.d < 60 ? this.runoff(x + 0.5, z + 0.5) : this.hw + 4;
    if (q.d < R) {
      c.smooth = 1;
      c.h = q.h; c.raw = q.h;
      if (q.d < this.hw) {
        c.kind = 1;
        c.top = this.pathTile(x, z, q);
        c.sideTop = c.top; c.sub = this.st === 'nether' ? A.nether_brick : A.stone_brick; c.deep = c.sub;
      } else {
        c.kind = 2;
        this.surfaceTiles(c, Math.floor(c.h), x, z, false);
      }
      return c;
    }
    c.smooth = 0; c.kind = 0;
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
    if (B.ice && H < this.water) { c.h = this.water; c.top = A.ice; c.sideTop = A.packed_ice; c.sub = A.packed_ice; c.deep = A.stone; return c; }
    c.h = H;
    this.surfaceTiles(c, H, x, z, false);
    if (H < this.water && !this.under) c.fluid = 1;
    else if (H < this.lava) c.fluid = 2;
    return c;
  }

  pathTile(x, z, q) {
    const A = this.A;
    const t = this.track, sx = x + 0.5 - this.start.x, sz = z + 0.5 - this.start.z;
    const along = sx * this.start.tx + sz * this.start.tz;
    if (false && Math.abs(along) < 2) { /* start line is a separate thin mesh now */ }
    const p = this.pathTiles;
    const r = hash2(x, z, 5), r2 = this.noise2.n2(x / 9, z / 9);
    if (r2 > 0.4) return p[1 % p.length];
    if (r2 < -0.5) return p[2 % p.length];
    return p[Math.floor(r * r * p.length)];
  }

  surfaceTiles(c, H, x, z) {
    const A = this.A, B = this.B, b = B.base;
    // natural patches: rock outcrops on knoll cores, litter / gravel / dirt patches
    if (c.kind === 0 && H >= this.water + 1) {
      const core = this.noise2.fbm(x / 47 + 5, z / 47 - 2, 2);
      const pv = this.noise3.n2(x / 13 + 40, z / 13 - 7), r = hash2(x, z, 61);
      if (core > 0.36 + 0.05 * pv) {
        const k = this.st;
        if (k === 'taiga' || k === 'jungle') { c.top = r < 0.45 ? A.mossycobble : r < 0.8 ? A.stone : A.cobble; c.sideTop = A.stone; c.sub = A.stone; c.deep = A.stone; return; }
        if (k === 'desert' && H <= b + 20) { c.top = r < 0.7 ? A.desert_stone : A.desert_sandstone; c.sideTop = A.desert_stone; c.sub = A.desert_stone; c.deep = A.desert_stone; return; }
        if (k === 'arctic' && r < 0.55) { c.top = A.stone; c.sideTop = A.stone; c.sub = A.stone; c.deep = A.stone; return; }
      }
      if (this.st === 'taiga' && H < b + 48) {
        if (pv > 0.42) { c.top = A.coniferous_litter; c.sideTop = A.coniferous_litter_side; c.sub = A.dirt; c.deep = A.stone; return; }
        if (pv < -0.62) { c.top = r < 0.6 ? A.gravel : A.dirt; c.sideTop = A.dirt; c.sub = A.dirt; c.deep = A.stone; return; }
        if (Math.abs(pv) < 0.025) { c.top = A.dirt; c.sideTop = A.dirt; c.sub = A.dirt; c.deep = A.stone; return; }
      }
      if (this.st === 'jungle' && H < b + 48) {
        if (pv < -0.6) { c.top = A.dirt; c.sideTop = A.dirt; c.sub = A.dirt; c.deep = A.stone; return; }
        if (pv > 0.6) { c.top = A.mossycobble; c.sideTop = A.mossycobble; c.sub = A.dirt; c.deep = A.stone; return; }
      }
      if (this.st === 'desert' && H <= b + 20) {
        if (pv > 0.55) { c.top = A.desert_sandstone; c.sideTop = A.desert_sandstone; c.sub = A.desert_sandstone; c.deep = A.desert_stone; return; }
        if (pv < -0.6) { c.top = A.sand; c.sideTop = A.sand; c.sub = A.sand; c.deep = A.sandstone; return; }
      }
      if (this.st === 'arctic' && pv < -0.62 && r < 0.6) { c.top = A.gravel; c.sideTop = A.gravel; c.sub = A.permafrost; c.deep = A.stone; return; }
    }
    switch (this.st) {
      case 'desert':
        if (H > b + 20) { c.top = A.red_sand; c.sideTop = A.tc_orange; c.sub = A.tc_orange; c.deep = A.tc_red; c.band = 1; }
        else if (H < this.water + 2 && c.kind !== 2) { c.top = H < this.water + 1 ? A.sand : A.grass; c.sideTop = H < this.water + 1 ? A.sand : A.grass_side; c.sub = A.sand; c.deep = A.sandstone; }
        else { c.top = c.kind === 2 ? A.sand : A.desert_sand; c.sideTop = c.top; c.sub = c.top; c.deep = A.desert_sandstone; }
        break;
      case 'jungle':
        if (H < this.water + 1) { c.top = A.clay; c.sideTop = A.clay; c.sub = A.dirt; c.deep = A.stone; break; }
        if (H > b + 48) { c.top = A.stone; c.sideTop = A.mossycobble; c.sub = A.stone; c.deep = A.stone; break; }
        if (c.kind === 2 || this.noise2.n2(x / 14, z / 14) > 0.2) { c.top = A.grass; c.sideTop = A.grass_side; }
        else { c.top = A.litter; c.sideTop = A.litter_side; }
        c.sub = A.dirt; c.deep = A.stone;
        break;
      case 'taiga': {
        const j = 5 * this.noise2.n2(x / 22, z / 22);
        if (H < this.water + 1) { c.top = A.sand; c.sideTop = A.sand; c.sub = A.sand; c.deep = A.stone; break; }
        if (H > b + 95 + j) { c.top = A.snow; c.sideTop = A.snow_side; c.sub = A.stone; c.deep = A.stone; break; }
        if (H > b + 70 + j) { c.top = A.stone; c.sideTop = A.stone; c.sub = A.stone; c.deep = A.stone; break; }
        if (H > b + 48 + j) { c.top = A.coniferous_litter; c.sideTop = A.coniferous_litter_side; c.sub = A.dirt; c.deep = A.stone; break; }
        c.top = A.grass; c.sideTop = A.grass_side; c.sub = A.dirt; c.deep = A.stone;
        break;
      }
      case 'nether': {
        const reg = this.netherRegion(x, z);
        c.sub = A.netherrack; c.deep = A.netherrack; c.sideTop = A.netherrack;
        if (reg === 'crimson') c.top = A.crimson_nylium;
        else if (reg === 'warped') c.top = A.warped_nylium;
        else if (reg === 'soul') { c.top = A.nether_sand; c.sideTop = A.soul_soil; c.sub = A.soul_soil; }
        else if (reg === 'basalt') { c.top = A.basalt_top; c.sideTop = A.basalt; c.sub = A.basalt; }
        else c.top = A.netherrack;
        break;
      }
      case 'shore': {
        const di = this.inland(x, z), r = hash2(x, z, 63);
        if (H < this.water) {
          // warm shallow water: coral reef patches on sand, gravel in the deeper parts
          const reef = this.noise2.n2(x / 34, z / 34) + 0.3 * this.noise3.n2(x / 9, z / 9);
          if (reef > 0.25 && H > this.water - 9) { const cs = [A.coral_pink, A.coral_yellow, A.coral_blue, A.coral_purple]; c.top = cs[Math.floor(hash2(Math.floor(x / 3), Math.floor(z / 3), 64) * 4)]; c.sideTop = c.top; c.sub = A.sand; c.deep = A.stone; break; }
          c.top = H < this.water - 8 ? A.gravel : A.sand; c.sideTop = c.top; c.sub = A.sand; c.deep = A.stone; break;
        }
        if (di < 22 && H < this.water + 5) { c.top = r < 0.45 ? A.stone : r < 0.7 ? A.gravel : A.sand; c.sideTop = A.stone; c.sub = A.stone; c.deep = A.stone; break; }
        if (H > this.water + 150) { c.top = H > this.water + 260 ? A.snow : A.stone; c.sideTop = c.top === A.snow ? A.snow_side : A.stone; c.sub = A.stone; c.deep = A.stone; break; }
        if (this.noise2.n2(x / 21, z / 21) > 0.42) { c.top = r < 0.7 ? A.stone : A.gravel; c.sideTop = A.stone; c.sub = A.stone; c.deep = A.stone; break; }
        c.top = A.grass; c.sideTop = A.grass_side; c.sub = A.dirt; c.deep = A.stone;
        break;
      }
      case 'darkforest': {
        if (H < this.water + 1) { c.top = A.dirt; c.sideTop = A.dirt; c.sub = A.dirt; c.deep = A.stone; break; }
        const pv = this.noise3.n2(x / 17 + 3, z / 17 - 9);
        if (pv > 0.35) { c.top = A.coniferous_litter; c.sideTop = A.coniferous_litter_side; }
        else if (pv < -0.55) { c.top = A.moss; c.sideTop = A.moss; }
        else { c.top = A.grass; c.sideTop = A.grass_side; }
        c.sub = A.dirt; c.deep = A.stone;
        break;
      }
      case 'cherry': case 'meadow': {
        const j = 5 * this.noise2.n2(x / 22, z / 22);
        if (H < this.water + 1) { c.top = A.sand; c.sideTop = A.sand; c.sub = A.sand; c.deep = A.stone; break; }
        if (H > b + 110 + j) { c.top = A.snow; c.sideTop = A.snow_side; c.sub = A.stone; c.deep = A.stone; break; }
        if (H > b + 80 + j) { c.top = A.stone; c.sideTop = A.stone; c.sub = A.stone; c.deep = A.stone; break; }
        c.top = A.grass; c.sideTop = A.grass_side; c.sub = A.dirt; c.deep = A.stone;
        break;
      }
      case 'peaks': {
        const j = 6 * this.noise2.n2(x / 18, z / 18), r = hash2(x, z, 65);
        if (H < this.water + 1) { c.top = A.gravel; c.sideTop = A.gravel; c.sub = A.stone; c.deep = A.stone; break; }
        if (H > b + 170 + j) { c.top = r < 0.6 ? A.packed_ice : A.snow; c.sideTop = A.packed_ice; c.sub = A.packed_ice; c.deep = A.stone; break; }
        if (H > b + 55 + j) { c.top = A.snow; c.sideTop = A.snow_side; c.sub = A.stone; c.deep = A.stone; break; }
        if (H > b + 22 + j) { c.top = r < 0.2 ? A.gravel : A.stone; c.sideTop = A.stone; c.sub = A.stone; c.deep = A.stone; break; }
        c.top = A.grass; c.sideTop = A.grass_side; c.sub = A.dirt; c.deep = A.stone;
        break;
      }
      case 'ocean': {
        const reef = this.noise2.fbm(x / 110, z / 110, 3), r = hash2(x, z, 66);
        if (reef > 0.12 && this.noise3.n2(x / 7, z / 7) > -0.3) { const cs = [A.coral_pink, A.coral_yellow, A.coral_blue, A.coral_purple]; c.top = cs[Math.floor(hash2(Math.floor(x / 4), Math.floor(z / 4), 67) * 4)]; c.sideTop = c.top; c.sub = A.sand; c.deep = A.stone; break; }
        const pv = this.noise3.n2(x / 23 + 5, z / 23);
        c.top = pv > 0.45 ? A.gravel : pv < -0.6 ? A.clay : r < 0.04 ? A.silver_sand : A.sand; c.sideTop = c.top === A.clay ? A.clay : A.sand; c.sub = A.sand; c.deep = A.stone;
        break;
      }
      case 'badlands': {
        if (H < this.water + 1) { c.top = A.red_sand; c.sideTop = A.red_sand; c.sub = A.red_sand; c.deep = A.tc_orange; break; }
        if (H > b + 6) {
          const wooded = H > b + 26 && this.noise3.n2(x / 60, z / 60) > 0.1;
          c.top = wooded ? (hash2(x, z, 68) < 0.6 ? A.dry_dirt : A.grass) : A.red_sand; c.sideTop = A.tc_orange; c.sub = A.tc_orange; c.deep = A.tc_red; c.band = 1; break;
        }
        c.top = A.red_sand; c.sideTop = A.red_sand; c.sub = A.red_sand; c.deep = A.tc_orange;
        break;
      }
      case 'plains': {
        if (H < this.water + 1) { c.top = A.sand; c.sideTop = A.sand; c.sub = A.dirt; c.deep = A.stone; break; }
        const pv = this.noise3.n2(x / 30 + 11, z / 30 - 4);
        if (c.kind === 0 && pv > 0.62) { c.top = A.dirt; c.sideTop = A.dirt; c.sub = A.dirt; c.deep = A.stone; break; }
        c.top = A.grass; c.sideTop = A.grass_side; c.sub = A.dirt; c.deep = A.stone;
        break;
      }
      case 'arctic':
        if (H > b + 45 + 4 * this.noise2.n2(x / 14, z / 14) && this.noise2.n2(x / 7, z / 7) > 0.1) { c.top = A.stone; c.sideTop = A.stone; c.sub = A.stone; c.deep = A.stone; break; }
        c.top = A.snow; c.sideTop = A.snow_side; c.sub = A.permafrost; c.deep = A.stone;
        break;
    }
  }

  // ---- trees (deterministic per grid cell)
  treeAtCell(cx, cz) {
    const key = cx * 100003 + cz;
    const cached = this.treeCache.get(key);
    if (cached !== undefined) return cached;
    const t = this._treeAtCell(cx, cz);
    if (this.treeCache.size > 60000) this.treeCache.clear();
    this.treeCache.set(key, t);
    return t;
  }
  _treeAtCell(cx, cz) {
    const G = this.treeGrid, seed = this.B.seed, k = this.st, A = this.A;
    const x = cx * G + Math.floor(hash2(cx, cz, seed + 1) * G);
    const z = cz * G + Math.floor(hash2(cx, cz, seed + 2) * G);
    const fn = this.noise3.fbm(x / 260, z / 260, 2);
    let dens;
    switch (k) {
      case 'taiga': dens = 0.3 + 0.6 * smoothstep(-0.3, 0.25, fn); break;
      case 'jungle': dens = 0.55 + 0.4 * smoothstep(-0.3, 0.3, fn); break;
      case 'desert': dens = 0.16; break;
      case 'arctic': dens = 0.1 + 0.5 * smoothstep(-0.2, 0.35, fn); break;
      case 'nether': { const reg = this.netherRegion(x, z); dens = reg === 'crimson' || reg === 'warped' ? 0.7 : 0.28; break; }
      case 'shore': dens = this.inland(x, z) < 12 ? 0 : 0.12 + 0.3 * smoothstep(-0.2, 0.35, fn); break;
      case 'plains': dens = 0.05 + 0.4 * smoothstep(0.15, 0.5, fn); break;
      case 'darkforest': dens = 0.62 + 0.36 * smoothstep(-0.4, 0.2, fn); break;
      case 'cherry': dens = 0.3 + 0.45 * smoothstep(-0.3, 0.3, fn); break;
      case 'peaks': dens = 0.12 + 0.4 * smoothstep(-0.2, 0.3, fn); break;
      case 'ocean': dens = 0.2 + 0.4 * smoothstep(0.0, 0.4, this.noise2.fbm(x / 110, z / 110, 3)); break;
      case 'badlands': dens = 0.14; break;
      case 'meadow': dens = 0.04 + 0.22 * smoothstep(0.2, 0.55, fn); break;
    }
    if (hash2(cx, cz, seed) > dens) return null;
    if (k === 'plains') return this._buildingCell(cx, cz, x, z);
    const c = this.column(x, z);
    if (c.d < this.hw + (k === 'darkforest' ? 5 : 7) + 4 * hash2(cx, cz, seed + 6) || c.fluid || c.smooth) return null;
    const rr = hash2(cx, cz, seed + 3), b = this.B.base;
    let type = null;
    if (k === 'taiga') {
      if (c.top === A.snow || c.top === A.stone || c.top === A.sand) type = null;
      else if (c.h > b + 40 || c.top === A.coniferous_litter) type = rr < 0.85 ? 'spruce' : 'bush';
      else type = rr < 0.35 ? 'oak' : rr < 0.6 ? 'birch' : rr < 0.82 ? 'spruce' : rr < 0.92 ? 'bigoak' : 'bush';
    } else if (k === 'jungle') {
      if (c.top === A.stone || c.top === A.clay) type = null;
      else type = rr < 0.22 ? 'giant' : rr < 0.55 ? 'jungle' : rr < 0.9 ? 'bush' : 'oak';
    } else if (k === 'desert') type = c.band ? null : c.h < this.water + 4 ? (rr < 0.75 ? 'palm' : null) : rr < 0.82 ? 'cactus' : rr < 0.9 ? 'acacia' : 'deadbush';
    else if (k === 'arctic') type = c.top === A.ice ? (rr < 0.04 ? 'spike' : null) : c.top === A.stone ? null : rr < 0.9 ? 'spruce' : 'spike';
    else if (k === 'nether') {
      const reg = this.netherRegion(x, z);
      if (reg === 'crimson') type = rr < 0.8 ? 'crimson' : 'glow';
      else if (reg === 'warped') type = rr < 0.8 ? 'warped' : 'glow';
      else if (reg === 'basalt') type = rr < 0.7 ? 'pillar' : null;
      else if (reg === 'soul') type = rr < 0.3 ? 'spire' : null;
      else type = rr < 0.35 ? 'pillar' : rr < 0.7 ? 'spire' : 'glow';
    }
    else if (k === 'shore') type = c.top !== A.grass ? null : rr < 0.55 ? 'oak' : rr < 0.75 ? 'birch' : 'bush';
    else if (k === 'darkforest') type = c.top === A.dirt ? null : rr < 0.72 ? 'darkoak' : rr < 0.8 ? 'redmush' : rr < 0.86 ? 'brownmush' : rr < 0.94 ? 'oak' : 'bush';
    else if (k === 'cherry') type = c.top !== A.grass ? null : rr < 0.82 ? 'cherry' : rr < 0.92 ? 'cbush' : 'oak';
    else if (k === 'peaks') type = c.top === A.snow || c.top === A.packed_ice ? (rr < 0.12 ? 'spike' : null) : c.top === A.grass ? (rr < 0.9 ? 'spruce' : 'bush') : rr < 0.25 ? 'spruce' : null;
    else if (k === 'ocean') type = rr < 0.75 ? 'coral' : 'pillar_p';
    else if (k === 'badlands') type = c.top === A.grass || c.top === A.dry_dirt ? (rr < 0.7 ? 'oak' : 'deadbush') : c.band ? null : rr < 0.55 ? 'cactus' : 'deadbush';
    else if (k === 'meadow') type = c.top !== A.grass ? null : rr < 0.45 ? 'oak' : rr < 0.75 ? 'birch' : 'bush';
    if (!type) return null;
    return { type, x, z, y: c.h, r: hash2(cx, cz, seed + 4), h2: hash2(cx, cz, seed + 5) };
  }

  // Riviera: apartment blocks and villas on a 12 m grid (plus palms); plains: oaks, birches, farmhouses
  _buildingCell(cx, cz, x, z) {
    const G = this.treeGrid, seed = this.B.seed, A = this.A, coast = this.st === 'shore';
    const rr = hash2(cx, cz, seed + 3), r = hash2(cx, cz, seed + 4), h2 = hash2(cx, cz, seed + 5);
    const q = this.track.near(x + 0.5, z + 0.5, false);
    if (coast) {
      const di = this.inland(x, z);
      const city = di < 700 && q.d < 520;
      const house = di > 30 && (city ? rr < 0.82 : rr < 0.2);
      if (house) {
        // centred in its cell so the footprint never crosses into the next one
        const hs = 2 + Math.floor(r * (G / 2 - 3)), mx = cx * G + Math.floor(G / 2), mz = cz * G + Math.floor(G / 2);
        const qc = this.track.near(mx + 0.5, mz + 0.5, false);
        if (qc.d < this.runoff(mx, mz) + hs * 1.45 + 2.5) return null;
        let y = 1e9, yMax = -1e9;
        for (const [ax, az] of [[-hs, -hs], [hs, -hs], [-hs, hs], [hs, hs], [0, 0]]) { const cc = this.column(mx + ax, mz + az); if (cc.fluid || cc.smooth) return null; y = Math.min(y, cc.h); yMax = Math.max(yMax, cc.h); }
        if (yMax - y > 9) return null;
        const tall = (city ? 6 + Math.floor(Math.pow(h2, 1.6) * 26) : 4 + Math.floor(h2 * 4)) + (qc.d < 60 ? 0 : 2);
        return { type: 'house', x: mx, z: mz, y, hs, tall, r, h2, base: yMax - y };
      }
      if (rr < 0.92 && di > 10) {
        const c = this.column(x, z);
        if (c.fluid || c.smooth || c.d < this.runoff(x, z) + 2) return null;
        return { type: q.d < 260 || r < 0.6 ? 'palm' : 'oak', x, z, y: c.h, r, h2 };
      }
      return null;
    }
    const c = this.column(x, z);
    if (c.d < this.hw + 9 + 4 * hash2(cx, cz, seed + 6) || c.fluid || c.smooth) return null;

    const type = rr < 0.4 ? 'oak' : rr < 0.55 ? 'bigoak' : rr < 0.75 ? 'birch' : 'bush';
    return { type, x, z, y: c.h, r, h2 };
  }

  buildTree(t, put) {
    const A = this.A, { x, y, z } = t, r = t.r;
    const blob = (cx, cy, cz, rx, ry, tile, keep = 0.8) => {
      const R = Math.ceil(Math.max(rx, ry));
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) for (let dz = -R; dz <= R; dz++) {
        const d = (dx * dx + dz * dz) / (rx * rx) + (dy * dy) / (ry * ry);
        if (d > 1.05) continue;
        if (d > 0.62 && hash2(cx + dx * 7 + dy * 3, cz + dz * 13 + dy * 31, 9) > keep) continue;
        put(cx + dx, cy + dy, cz + dz, tile, true);
      }
    };
    switch (t.type) {
      case 'oak': {
        const h = 5 + Math.floor(r * 3);
        for (let i = 0; i < h; i++) put(x, y + i, z, A.tree);
        blob(x, y + h - 1, z, 2.7, 2.2, A.leaves, 0.7);
        break;
      }
      case 'bigoak': {
        const h = 8 + Math.floor(r * 4);
        for (let i = 0; i < h; i++) put(x, y + i, z, A.tree);
        const br = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (let k = 0; k < 4; k++) {
          const [bx, bz] = br[k], by = y + h - 4 + (k & 1);
          for (let s = 1; s <= 3; s++) put(x + bx * s, by + (s >> 1), z + bz * s, A.tree);
          blob(x + bx * 3, by + 2, z + bz * 3, 2.6, 1.8, A.leaves, 0.7);
        }
        blob(x, y + h, z, 3.4, 2.6, A.leaves, 0.7);
        break;
      }
      case 'birch': {
        const h = 6 + Math.floor(r * 4);
        for (let i = 0; i < h; i++) put(x, y + i, z, A.aspen);
        blob(x, y + h - 1, z, 2.2, 2.6, A.aspen_leaves, 0.75);
        break;
      }
      case 'spruce': {
        const h = 9 + Math.floor(r * 10), snow = this.st === 'arctic' || y > this.B.base + 60;
        for (let i = 0; i < h; i++) put(x, y + i, z, A.pine);
        for (let ly = 3; ly <= h + 1; ly++) {
          const f = (h + 1 - ly) / (h - 2);
          const lr = ly === h + 1 ? 0 : Math.max(0, Math.round(f * 3.4 + ((ly & 1) ? -0.4 : 0.5)));
          for (let dx = -lr; dx <= lr; dx++) for (let dz = -lr; dz <= lr; dz++) {
            if (dx * dx + dz * dz > lr * lr + 0.6) continue;
            if (!(dx === 0 && dz === 0 && ly < h)) put(x + dx, y + ly, z + dz, A.pine_needles, true);
            if (snow && (ly & 1) && dx * dx + dz * dz > (lr - 1) * (lr - 1) && lr > 0) put(x + dx, y + ly + 1, z + dz, A.snow, false, true);
          }
        }
        if (snow) put(x, y + h + 2, z, A.snow, false, true);
        break;
      }
      case 'giant': {
        const h = 20 + Math.floor(r * 10);
        for (let i = 0; i < h; i++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) put(x + a, y + i, z + b, A.jungletree);
        blob(x, y + h, z, 5.5, 2.4, A.jungleleaves, 0.7);
        for (let k = 0; k < 14; k++) {
          const a = k * 0.45 + t.h2 * 6, vx = x + Math.round(Math.cos(a) * 5), vz = z + Math.round(Math.sin(a) * 5);
          const len = 3 + Math.floor(hash2(vx, vz, 5) * 9);
          for (let i = 1; i <= len; i++) put(vx, y + h - 1 - i, vz, A.vine, true);
        }
        for (let k = 0; k < 3; k++) {
          const ang = t.h2 * 6.28 + k * 2.1, by = y + Math.floor(h * (0.5 + 0.12 * k));
          const bx = Math.round(Math.cos(ang) * 4), bz = Math.round(Math.sin(ang) * 4);
          for (let s = 1; s <= 4; s++) put(x + Math.round(bx * s / 4), by + (s >> 1), z + Math.round(bz * s / 4), A.jungletree);
          blob(x + bx, by + 3, z + bz, 3, 1.6, A.jungleleaves, 0.7);
        }
        break;
      }
      case 'jungle': {
        const h = 9 + Math.floor(r * 8);
        for (let i = 0; i < h; i++) put(x, y + i, z, A.jungletree);
        blob(x, y + h, z, 3.3, 1.8, A.jungleleaves, 0.7);
        for (let k = 0; k < 6; k++) {
          const a = k * 1.05 + t.h2 * 6, vx = x + Math.round(Math.cos(a) * 3), vz = z + Math.round(Math.sin(a) * 3);
          const len = 2 + Math.floor(hash2(vx, vz, 5) * 6);
          for (let i = 1; i <= len; i++) put(vx, y + h - 1 - i, vz, A.vine, true);
        }
        break;
      }
      case 'bush': {
        const tile = this.st === 'jungle' ? A.jungleleaves : A.leaves;
        put(x, y, z, this.st === 'jungle' ? A.jungletree : A.tree);
        blob(x, y + 1, z, 2.2, 1.4, tile, 0.6);
        break;
      }
      case 'house': {
        // pastel walls, rows of windows, terracotta or flat roofs with a parapet
        const hs = t.hs, H = t.tall, y0 = t.y - 2;
        const walls = [A.tc_white, A.sandstone_block, A.tc_yellow, A.wool_white, A.tc_orange, A.tc_white, A.tc_lgray];
        const wall = walls[Math.floor(t.h2 * 977) % walls.length];
        const flat = H > 10 || t.r < 0.35;
        for (let dy = 0; dy <= H + 2 + t.base; dy++) {
          const yy = y0 + dy, lvl = dy - 2 - t.base;
          for (let dx = -hs; dx <= hs; dx++) for (let dz = -hs; dz <= hs; dz++) {
            const edge = Math.abs(dx) === hs || Math.abs(dz) === hs;
            if (!edge && dy !== 0) continue;
            const corner = Math.abs(dx) === hs && Math.abs(dz) === hs;
            const win = lvl > 0 && lvl % 3 === 1 && !corner && ((dx + dz) & 1) === 0;
            put(x + dx, yy, z + dz, lvl < 1 ? A.stone_block : win ? A.glass : wall);
          }
        }
        const top = y0 + H + 3 + t.base;
        if (flat) {
          for (let dx = -hs; dx <= hs; dx++) for (let dz = -hs; dz <= hs; dz++) {
            put(x + dx, top, z + dz, A.stone_block);
            if (Math.abs(dx) === hs || Math.abs(dz) === hs) put(x + dx, top + 1, z + dz, wall);
          }
        } else {
          for (let l = 0; l <= hs; l++) for (let dx = -hs - 1 + l; dx <= hs + 1 - l; dx++) for (let dz = -hs - 1 + l; dz <= hs + 1 - l; dz++) {
            if (Math.max(Math.abs(dx), Math.abs(dz)) === hs + 1 - l) put(x + dx, top + l, z + dz, l === hs ? A.tc_red : A.brick);
          }
        }
        break;
      }
      case 'farmhouse': {
        const hs = t.hs, y0 = t.y;
        for (let dy = 0; dy <= 3; dy++) for (let dx = -hs; dx <= hs; dx++) for (let dz = -hs; dz <= hs; dz++) {
          const edge = Math.abs(dx) === hs || Math.abs(dz) === hs;
          if (!edge && dy) continue;
          const corner = Math.abs(dx) === hs && Math.abs(dz) === hs;
          put(x + dx, y0 + dy, z + dz, dy === 0 ? A.cobble : corner ? A.tree : dy === 2 && !corner && (dx + dz) % 2 === 0 ? A.glass : A.planks);
        }
        for (let l = 0; l <= hs + 1; l++) for (let dx = -hs - 1; dx <= hs + 1; dx++) {
          put(x + dx, y0 + 4 + l, z - hs - 1 + l, A.pine_planks); put(x + dx, y0 + 4 + l, z + hs + 1 - l, A.pine_planks);
          if (l <= hs) for (let dz = -hs + l; dz <= hs - l; dz++) if (dx === -hs - 1 || dx === hs + 1) put(x + dx, y0 + 4 + l, z + dz, A.planks);
        }
        break;
      }
      case 'darkoak': {
        // 2x2 trunk, wide flat canopy that closes over the verge
        const h = 6 + Math.floor(r * 4);
        for (let i = 0; i < h; i++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) put(x + a, y + i, z + b, A.darkoak);
        blob(x, y + h, z, 4.6 + r, 1.8, A.darkoak_leaves, 0.72);
        blob(x, y + h + 2, z, 3.2, 1.4, A.darkoak_leaves, 0.7);
        break;
      }
      case 'redmush': {
        const h = 5 + Math.floor(r * 4);
        for (let i = 0; i < h; i++) put(x, y + i, z, A.mush_stem);
        for (let dy = -2; dy <= 1; dy++) for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) {
          const rad = dy === 1 ? 2 : 3, e = Math.max(Math.abs(dx), Math.abs(dz));
          if (e > rad || (dy < 1 && e < rad) || (dy === 1 && e === rad && Math.abs(dx) === Math.abs(dz))) continue;
          if (Math.abs(dx) === 3 && Math.abs(dz) === 3) continue;
          put(x + dx, y + h + dy, z + dz, A.mush_red);
        }
        break;
      }
      case 'brownmush': {
        const h = 5 + Math.floor(r * 4);
        for (let i = 0; i < h; i++) put(x, y + i, z, A.mush_stem);
        for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) if (!(Math.abs(dx) === 4 && Math.abs(dz) >= 3) && !(Math.abs(dz) === 4 && Math.abs(dx) >= 3)) put(x + dx, y + h, z + dz, A.mush_brown);
        break;
      }
      case 'cherry': {
        // short trunk splitting into two leaning branches, each under a big round pink canopy with hanging leaves
        const h = 4 + Math.floor(r * 2);
        for (let i = 0; i < h; i++) put(x, y + i, z, A.cherry_log);
        const ang = t.h2 * 6.28;
        for (const sgn of [1, -1]) {
          const ax = Math.round(Math.cos(ang) * sgn), az = Math.round(Math.sin(ang) * sgn);
          let bx = x, bz = z, by = y + h - 1;
          for (let k = 1; k <= 3; k++) { bx += ax; bz += az; by += 1; put(bx, by, bz, A.cherry_log); }
          const ry = sgn > 0 ? 2.4 : 2.0;
          blob(bx, by + 2, bz, 3.6 + r * 0.8, ry, A.cherry_leaves, 0.75);
          for (let k = 0; k < 7; k++) {
            const a2 = k * 0.9 + t.h2 * 5, hx = bx + Math.round(Math.cos(a2) * 3), hz = bz + Math.round(Math.sin(a2) * 3);
            const len = 1 + Math.floor(hash2(hx, hz, 12) * 3);
            for (let i = 0; i < len; i++) put(hx, by - i, hz, A.cherry_leaves, true);
          }
        }
        break;
      }
      case 'cbush': {
        put(x, y, z, A.cherry_log);
        blob(x, y + 1, z, 2.2, 1.4, A.cherry_leaves, 0.6);
        break;
      }
      case 'coral': {
        // reef formation: a mound of coral with a few branches reaching up
        const cs = [A.coral_pink, A.coral_yellow, A.coral_blue, A.coral_purple], c1 = cs[Math.floor(r * 4)], c2 = cs[Math.floor(t.h2 * 4)];
        blob(x, y, z, 1.6 + r * 1.4, 1.3, c1, 0.8);
        for (let k = 0; k < 4; k++) {
          const a2 = k * 1.57 + t.h2 * 3, len = 2 + Math.floor(hash2(x + k, z, 13) * 4);
          let px = x + Math.round(Math.cos(a2) * 1.5), pz = z + Math.round(Math.sin(a2) * 1.5);
          for (let i = 0; i < len; i++) { put(px, y + 1 + i, pz, k & 1 ? c2 : c1); if (i === len - 2) { px += Math.round(Math.cos(a2)); pz += Math.round(Math.sin(a2)); } }
        }
        break;
      }
      case 'pillar_p': {
        const h = 3 + Math.floor(r * r * 14);
        for (let i = 0; i < h; i++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) put(x + a, y + i, z + b, hash2(x + a, y + i, z + b) < 0.35 ? A.mossycobble : A.stone);
        break;
      }
      case 'cactus': {
        const h = 2 + Math.floor(r * 3);
        for (let i = 0; i < h; i++) put(x, y + i, z, A.cactus);
        break;
      }
      case 'deadbush': put(x, y, z, A.acacia); break;
      case 'palm': {
        const h = 6 + Math.floor(r * 4), lx = t.h2 < 0.5 ? 1 : -1;
        let px = x;
        for (let i = 0; i < h; i++) { if (i === Math.floor(h * 0.6)) px += lx; put(px, y + i, z, A.jungletree); }
        const ty = y + h;
        put(px, ty, z, A.leaves, true);
        for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
          const len = ax && az ? 2 : 3;
          for (let s2 = 1; s2 <= len; s2++) put(px + ax * s2, ty - (s2 === len ? 1 : 0), z + az * s2, A.leaves, true);
        }
        break;
      }
      case 'acacia': {
        const h = 5 + Math.floor(r * 2), dx = t.h2 < 0.5 ? 1 : -1;
        for (let i = 0; i < h; i++) put(x + (i > 2 ? dx : 0), y + i, z, A.acacia);
        for (let ex = -3; ex <= 3; ex++) for (let ez = -3; ez <= 3; ez++) if (ex * ex + ez * ez <= 10) put(x + dx + ex, y + h, z + ez, A.acacia_leaves, true);
        for (let ex = -1; ex <= 1; ex++) for (let ez = -1; ez <= 1; ez++) put(x + dx + ex, y + h + 1, z + ez, A.acacia_leaves, true);
        break;
      }
      case 'spike': {
        const h = 8 + Math.floor(r * r * 26);
        for (let i = 0; i < h; i++) {
          const w = i < h * 0.3 ? 1 : 0;
          for (let a = -w; a <= w; a++) for (let b = -w; b <= w; b++) if (Math.abs(a) + Math.abs(b) <= w) put(x + a, y + i, z + b, A.packed_ice);
        }
        break;
      }
      case 'pillar': {
        const h = 4 + Math.floor(r * r * 22), w = r > 0.55 ? 2 : 1;
        for (let i = 0; i < h; i++) for (let a = 0; a < w; a++) for (let b = 0; b < w; b++) put(x + a, y + i, z + b, i === h - 1 ? A.basalt_top : A.basalt);
        if (t.h2 < 0.4) blob(x, y + h, z, 1.6, 1.2, A.glowstone, 0.8);
        break;
      }
      case 'spire': {
        const h = 10 + Math.floor(r * r * 30);
        for (let i = 0; i < h; i++) {
          const w = Math.max(0, Math.round((1 - i / h) * 2.4));
          for (let a = -w; a <= w; a++) for (let b = -w; b <= w; b++) if (a * a + b * b <= w * w + 0.5) put(x + a, y + i, z + b, A.netherrack);
        }
        break;
      }
      case 'glow':
        blob(x, y + 1, z, 1.5, 1.2, A.glowstone, 0.8);
        break;
      case 'crimson': case 'warped': {
        const cr = t.type === 'crimson';
        const h = 5 + Math.floor(r * 9), stem = cr ? A.crimson_stem : A.warped_stem, wart = cr ? A.wart : A.warped_wart;
        for (let i = 0; i < h; i++) put(x, y + i, z, stem);
        const R = 2.4 + r * 1.6;
        for (let dy = -2; dy <= 1; dy++) for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) {
          const rr2 = dx * dx + dz * dz, rad = R * (dy === 1 ? 0.6 : 1);
          if (rr2 > rad * rad) continue;
          if (dy < 0 && rr2 < (rad - 1.2) * (rad - 1.2)) continue; // hollow underside
          put(x + dx, y + h + dy, z + dz, hash2(x + dx * 3, z + dz * 5 + dy, 3) < 0.12 ? A.shroomlight : wart);
        }
        if (cr) for (let k = 0; k < 6; k++) { // weeping vines
          const a = k * 1.05 + t.h2 * 6, vx = x + Math.round(Math.cos(a) * (R - 0.8)), vz = z + Math.round(Math.sin(a) * (R - 0.8));
          const len = 2 + Math.floor(hash2(vx, vz, 8) * 5);
          for (let i = 1; i <= len; i++) put(vx, y + h - 2 - i, vz, A.wart, true);
        }
        break;
      }
    }
  }
  // simplified far-LOD silhouette for a tree
  treeProxy(t) {
    const A = this.A, r = t.r;
    switch (t.type) {
      case 'oak': return { y0: 3, y1: 7 + r * 2, rad: 2.5, tile: A.leaves_o, trunk: A.tree };
      case 'bigoak': return { y0: 5, y1: 12 + r * 4, rad: 4.5, tile: A.leaves_o, trunk: A.tree };
      case 'birch': return { y0: 4, y1: 9 + r * 4, rad: 2, tile: A.aspen_leaves_o, trunk: A.aspen };
      case 'spruce': return { y0: 2, y1: 10 + r * 10, rad: 2.2, tile: A.pine_needles_o, trunk: A.pine, cone: true };
      case 'giant': return { y0: 14, y1: 24 + r * 10, rad: 5.5, tile: A.jungleleaves_o, trunk: A.jungletree };
      case 'jungle': return { y0: 7, y1: 11 + r * 8, rad: 3, tile: A.jungleleaves_o, trunk: A.jungletree };
      case 'bush': return { y0: 0, y1: 2.5, rad: 2, tile: this.st === 'jungle' ? A.jungleleaves_o : A.leaves_o };
      case 'acacia': return { y0: 5, y1: 7, rad: 3.2, tile: A.acacia_leaves_o, trunk: A.acacia };
      case 'cactus': return { y0: 0, y1: 2 + r * 3, rad: 0.5, tile: A.cactus };
      case 'darkoak': return { y0: 5, y1: 10 + r * 4, rad: 4.8, tile: A.darkoak_leaves_o, trunk: A.darkoak };
      case 'redmush': return { y0: 5 + r * 4 - 2, y1: 5 + r * 4 + 2, rad: 3, tile: A.mush_red, trunk: A.mush_stem };
      case 'brownmush': return { y0: 5 + r * 4, y1: 6 + r * 4, rad: 4, tile: A.mush_brown, trunk: A.mush_stem };
      case 'cherry': return { y0: 4, y1: 10 + r * 2, rad: 4.4, tile: A.cherry_leaves_o, trunk: A.cherry_log };
      case 'cbush': return { y0: 0, y1: 2.5, rad: 2, tile: A.cherry_leaves_o };
      case 'coral': return { y0: 0, y1: 3 + r * 3, rad: 2, tile: A.coral_pink };
      case 'pillar_p': return { y0: 0, y1: 3 + r * r * 14, rad: 1, tile: A.stone };
      case 'house': return { y0: -2, y1: t.tall + 3 + t.base, rad: t.hs + 0.5, tile: A.tc_white, solid: true };
      case 'farmhouse': return { y0: 0, y1: 5, rad: t.hs + 0.5, tile: A.planks, solid: true };
      case 'palm': return { y0: 5, y1: 7 + r * 4, rad: 2.5, tile: A.leaves_o, trunk: A.jungletree };
      case 'spike': return { y0: 0, y1: 8 + r * r * 26, rad: 1, tile: A.packed_ice };
      case 'pillar': return { y0: 0, y1: 4 + r * r * 22, rad: r > 0.55 ? 1 : 0.5, tile: A.basalt };
      case 'spire': return { y0: 0, y1: 10 + r * r * 30, rad: 1.8, tile: A.netherrack, cone: true };
      case 'glow': return { y0: 0, y1: 2.5, rad: 1.4, tile: A.glowstone };
      case 'crimson': return { y0: 5 + r * 9 - 2, y1: 5 + r * 9 + 1.5, rad: 2.6 + r * 1.6, tile: A.wart, trunk: A.crimson_stem };
      case 'warped': return { y0: 5 + r * 9 - 2, y1: 5 + r * 9 + 1.5, rad: 2.6 + r * 1.6, tile: A.warped_wart, trunk: A.warped_stem };
    }
    return null;
  }

  // ---- small decor: boulders, fallen logs, shrubs (own grid, can sit close to the verge)
  decorAtCell(cx, cz) {
    const key = 'd' + (cx * 100003 + cz);
    const cached = this.treeCache.get(key);
    if (cached !== undefined) return cached;
    const t = this._decorAtCell(cx, cz);
    this.treeCache.set(key, t);
    return t;
  }
  _decorAtCell(cx, cz) {
    const G = DECOR_G, seed = this.B.seed + 500, k = this.st, A = this.A;
    const x = cx * G + 1 + Math.floor(hash2(cx, cz, seed + 1) * (G - 2));
    const z = cz * G + 1 + Math.floor(hash2(cx, cz, seed + 2) * (G - 2));
    const dens = { taiga: 0.2, jungle: 0.26, desert: 0.09, arctic: 0.12, nether: 0.14, shore: 0.14, plains: 0.1, darkforest: 0.22, cherry: 0.14, peaks: 0.16, ocean: 0.16, badlands: 0.1, meadow: 0.12 }[k];
    const q = this.track.near(x + 0.5, z + 0.5, false);
    const nearB = q.d < 70 ? 1.6 : 1;   // a bit busier right along the circuit
    if (hash2(cx, cz, seed) > dens * nearB) return null;
    if (q.d < this.runoff(x + 0.5, z + 0.5) + 1.5 + 3 * hash2(cx, cz, seed + 7)) return null;
    const c = this.column(x, z);
    if (c.fluid || c.smooth || c.top === A.ice) return null;
    const rr = hash2(cx, cz, seed + 3), r = hash2(cx, cz, seed + 4);
    let type;
    if (k === 'taiga') type = rr < 0.42 ? 'rock' : rr < 0.62 ? 'log' : rr < 0.9 ? 'shrub' : 'berry';
    else if (k === 'jungle') type = rr < 0.3 ? 'rock' : rr < 0.48 ? 'log' : 'shrub';
    else if (k === 'desert') type = rr < 0.75 ? 'rock' : 'bones';
    else if (k === 'arctic') type = rr < 0.7 ? 'rock' : 'drift';
    else if (k === 'shore') type = rr < 0.65 ? 'rock' : 'shrub';
    else if (k === 'darkforest') type = rr < 0.3 ? 'rock' : rr < 0.55 ? 'log' : 'shrub';
    else if (k === 'cherry') type = rr < 0.35 ? 'rock' : rr < 0.55 ? 'log' : 'shrub';
    else if (k === 'peaks') type = c.top === A.snow ? 'drift' : 'rock';
    else if (k === 'ocean') type = 'rock';
    else if (k === 'badlands') type = rr < 0.8 ? 'rock' : 'bones';
    else if (k === 'meadow') type = rr < 0.45 ? 'rock' : rr < 0.6 ? 'log' : 'shrub';
    else if (k === 'plains') type = rr < 0.3 ? 'rock' : rr < 0.8 ? 'shrub' : 'log';
    else type = rr < 0.6 ? 'rock' : 'magma';
    const len = 4 + Math.floor(r * 4), dir = hash2(cx, cz, seed + 5) < 0.5 ? 0 : 1, h0 = c.h;
    if (type === 'log') {
      // logs only lie on level ground
      for (let i = 1; i < len; i++) { const cc = this.column(x + (dir ? 0 : i), z + (dir ? i : 0)); if (cc.h !== h0 || cc.smooth || cc.fluid) { type = 'shrub'; break; } }
    }
    const rad = type === 'rock' ? 1 + Math.floor(r * 2.6) : 1;
    const top = type === 'rock' ? rad + 1 : type === 'log' ? 1 : type === 'shrub' || type === 'berry' ? 2 : 1;
    return { type, x, z, y: h0, r, rad, top, dir, len };
  }
  decorAt(ix, iz) {
    const G = DECOR_G;
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const t = this.decorAtCell(Math.floor(ix / G) + dx, Math.floor(iz / G) + dz);
      if (!t || t.type === 'shrub' || t.type === 'berry' || t.type === 'drift') continue;
      if (t.type === 'hay') { if (ix >= t.x && ix <= t.x + 1 && iz >= t.z && iz <= t.z + 1) return t; continue; }
      if (t.type === 'log') {
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
    const A = this.A, { x, y, z, r } = t, k = this.st;
    const rockTiles = k === 'desert' ? [A.desert_stone, A.desert_stone, A.desert_sandstone] : k === 'nether' ? [A.netherrack, A.basalt, A.netherrack]
      : k === 'ocean' ? [A.stone, A.gravel, A.mossycobble] : k === 'badlands' ? [A.tc_orange, A.tc_red, A.tc_yellow] : k === 'shore' || k === 'peaks' ? [A.stone, A.cobble, A.gravel]
      : k === 'arctic' ? [A.stone, A.cobble, A.stone] : k === 'jungle' ? [A.mossycobble, A.mossycobble, A.stone] : [A.stone, A.mossycobble, A.cobble];
    switch (t.type) {
      case 'rock': {
        const R = t.rad;
        for (let dy = -1; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) for (let dz = -R; dz <= R; dz++) {
          const e = (dx * dx + dz * dz) / (R * R + 0.3) + (dy * dy) / ((R * 0.8 + 0.4) ** 2);
          if (e > 1.05 || (e > 0.6 && hash2(x + dx * 7, z + dz * 5 + dy * 13, 21) > 0.6)) continue;
          const tile = rockTiles[Math.floor(hash2(x + dx, z + dz + dy * 9, 22) * 3)];
          put(x + dx, y + dy, z + dz, k === 'arctic' && dy >= R - 1 && e < 0.7 ? A.snow : tile);
        }
        break;
      }
      case 'log': {
        const ax = t.dir ? 0 : 1, az = t.dir, wood = k === 'jungle' ? A.jungletree : k === 'darkforest' ? A.darkoak : k === 'cherry' ? A.cherry_log : r < 0.5 ? A.tree : A.aspen;
        for (let i = 0; i < t.len; i++) {
          put(x + ax * i, y, z + az * i, wood);
          if (k !== 'jungle' && hash2(x + i, z, 23) < 0.25) put(x + ax * i, y + 1, z + az * i, A.leaves, true);
        }
        break;
      }
      case 'shrub': case 'berry': {
        const tile = k === 'jungle' ? A.jungleleaves : k === 'cherry' ? A.cherry_leaves : k === 'darkforest' ? A.darkoak_leaves : r < 0.5 ? A.leaves : A.aspen_leaves;
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let dy = 0; dy <= 1; dy++) {
          if (dy === 1 && (dx || dz) && hash2(x + dx, z + dz, 24) < 0.6) continue;
          if (dy === 0 && dx && dz && hash2(x + dx, z + dz, 25) < 0.5) continue;
          put(x + dx, y + dy, z + dz, tile, true);
        }
        break;
      }
      case 'hay': for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) put(x + i, y + (i && j ? 1 : 0), z + j, A.dry_grass); break;
      case 'bones': for (let i = 0; i < 3; i++) put(x + (t.dir ? i : 0), y, z + (t.dir ? 0 : i), A.silver_sand); break;
      case 'drift': for (let dx = -1; dx <= 1; dx++) for (let dz = -2; dz <= 2; dz++) if (Math.abs(dx) + Math.abs(dz) < 3) put(x + dx, y, z + dz, A.snow); break;
      case 'magma': put(x, y, z, A.glowstone); put(x + 1, y, z, A.basalt); put(x, y, z + 1, A.basalt_top); break;
    }
  }

  // Stony Shore: the sea cave the road runs through (natural rock only)
  buildStreet(ox, oz, size, put) {
    const A = this.A, n = this.noise3;
    for (let z = oz - 1; z <= oz + size; z++) for (let x = ox - 1; x <= ox + size; x++) {
      const q = this.track.near(x + 0.5, z + 0.5, false);
      const R = this.runoff(x, z);
      if (q.d > R + 6) continue;
      const tun = this.inTunnel(q.s), s = q.s, h = q.h, rr = hash2(x, z, 71);
      if (tun) {
        // rough rock vault: jagged ceiling, thick walls, glowing lichen here and there
        const yb = Math.round(h) + 8 + Math.round(1.6 * n.n2(x / 7, z / 7) + (q.d / (R + 6)) ** 2 * -3);
        const rock = (y) => (hash2(x * 3 + y, z * 5 - y, 72) < 0.18 ? A.cobble : hash2(x, z * 7 + y, 73) < 0.12 ? A.gravel : A.stone);
        if (q.d >= R) for (let y = Math.floor(h) - 1; y <= yb + 2; y++) put(x, y, z, rock(y));
        put(x, yb, z, rock(yb));
        for (let y = yb + 1; y <= yb + 3 + Math.floor(rr * 2); y++) put(x, y, z, rock(y));
        if (rr > 0.6 && q.d > 2) put(x, yb + 4, z, A.grass);
        continue;
      }
    }
  }

  trunkAt(ix, iz) {
    const G = this.treeGrid;
    const cx = Math.floor(ix / G), cz = Math.floor(iz / G);
    const t = this.treeAtCell(cx, cz);
    if (!t || t.type === 'bush' || t.type === 'glow') return null;
    if (t.hs) return Math.abs(ix - t.x) <= t.hs && Math.abs(iz - t.z) <= t.hs ? t : null;
    const w = t.type === 'giant' || t.type === 'darkoak' || t.type === 'pillar_p' ? 2 : t.type === 'pillar' && t.r > 0.55 ? 2 : t.type === 'spire' || t.type === 'spike' || t.type === 'coral' ? 2 : 1;
    const o = t.type === 'spire' || t.type === 'spike' || t.type === 'coral' ? -1 : 0;
    if (ix >= t.x + o && ix < t.x + o + w + (o ? 1 : 0) && iz >= t.z + o && iz < t.z + o + w + (o ? 1 : 0)) return t;
    return null;
  }

  // ---- physics queries
  surface(x, z, out) {
    const q = this.track.near(x, z);
    out.d = q.d; out.s = q.s; out.lat = q.lat;
    if (q.d < this.flat && q.d < this.runoff(x, z)) {
      out.y = q.h; out.path = q.d < this.hw; out.fluid = 0; out.smooth = true;
      out.grip = out.path ? 1 : Math.max(0.84, this.B.offGrip); out.drag = out.path ? 0 : this.B.offDrag * 0.3;
      return out;
    }
    const c = this.column(Math.floor(x), Math.floor(z));
    out.y = c.h; out.path = false; out.fluid = c.fluid; out.smooth = !!c.smooth;
    const A = this.A;
    let g = this.B.offGrip, dr = this.B.offDrag;
    if (c.top === A.ice) { g = 0.22; dr = 0.05; }
    else if (c.top === A.stone || c.top === A.basalt_top) { g = 0.8; dr = 0.15; }
    else if (c.top === A.nether_sand) { g = 0.5; dr = 1.4; }
    out.grip = g; out.drag = dr;
    return out;
  }
  obstacle(x, z, y) {
    const ix = Math.floor(x), iz = Math.floor(z);
    const q = this.track.near(x, z);
    if (q.d < this.flat && q.d < this.runoff(x, z)) return null;
    if (this.st === 'shore' && this.inTunnel(q.s) && q.d < this.runoff(x, z) + 6) return q.h + 2;
    const c = this.column(ix, iz);
    if (c.h > y + 1.1) return c.h;   // single-block steps can be climbed
    const dc = this.decorAt(ix, iz);
    if (dc && y + 0.5 > dc.y && y < dc.y + dc.top) return dc.y + dc.top;
    const G = this.structGrid;
    const st = this.structAt(Math.floor(x / G), Math.floor(z / G));
    if (st) {
      const dx = ix - st.x, dz = iz - st.z, iy = Math.floor(y + 0.4) - st.y;
      if (st.vox.has(vkey(dx, iy, dz)) || st.vox.has(vkey(dx, iy + 1, dz))) return y + 1;
    }
    const t = this.trunkAt(ix, iz);
    if (t) {
      const top = t.type === 'cactus' ? t.y + 2 + Math.floor(t.r * 3) : t.hs ? t.y + t.tall + 6 + (t.base || 0) : t.y + 40;
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
    const want = new Map();
    const path = [[cx, cz], ...(ahead || [])];
    this.want = want;
    const ROOT = 512;
    const r0x = Math.floor((cx - range) / ROOT), r1x = Math.floor((cx + range) / ROOT);
    const r0z = Math.floor((cz - range) / ROOT), r1z = Math.floor((cz + range) / ROOT);
    const visit = (ox, oz, size) => {
      const mx = ox + size / 2, mz = oz + size / 2;
      const dx = Math.max(0, Math.abs(cx - mx) - size / 2), dz = Math.max(0, Math.abs(cz - mz) - size / 2);
      const dist = Math.hypot(dx, dz);
      if (dist > range) return;
      // distance to the stretch of track ahead (polyline through the lookahead points)
      let dp = dist;
      for (let k = 0; k + 1 < path.length; k++) {
        const ax = path[k][0], az = path[k][1], sx = path[k + 1][0] - ax, sz = path[k + 1][1] - az, sl = sx * sx + sz * sz;
        const tt = sl > 1 ? clamp(((mx - ax) * sx + (mz - az) * sz) / sl, 0, 1) : 0;
        const ex = Math.max(0, Math.abs(ax + sx * tt - mx) - size / 2), ez = Math.max(0, Math.abs(az + sz * tt - mz) - size / 2);
        dp = Math.min(dp, Math.hypot(ex, ez));
      }
      const dl = Math.min(dist, dp * 1.5);
      const S = size / TILE_N;
      // only the land around the circuit gets fine detail; far-off country stays a coarse
      // backdrop (it still shows the mountains, and the minimap draws everything anyway)
      const tq = this.track.near(mx, mz, false), tdist = tq.d > 1e8 ? 1e9 : Math.max(0, tq.d - size * 0.71);
      const nearTrack = this.noCorridor || tdist < size * 2.2 + 40;
      if (S > 1 && dl < size * 0.9 * detail && nearTrack) {
        const h = size / 2;
        visit(ox, oz, h); visit(ox + h, oz, h); visit(ox, oz + h, h); visit(ox + h, oz + h, h);
        return;
      }
      want.set(ox + ',' + oz + ',' + S, { ox, oz, S, dist: Math.min(dist, dp) + S * 6 });
    };
    for (let i = r0x; i <= r1x; i++) for (let j = r0z; j <= r1z; j++) visit(i * ROOT, j * ROOT, ROOT);
    const todo = [];
    for (const [k, w] of want) if (!this.tiles.has(k)) todo.push([k, w]);
    // Keep old tiles until the area is covered by new ones: only drop tiles not wanted
    // once nothing is pending near them (simple approach: drop when todo is empty or far).
    todo.sort((a, b) => a[1].dist - b[1].dist);
    let pending;
    if (this.pool && this.pool.ok) {
      // background builders: keep them busy with the most urgent tiles
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
      // drop stale tiles once their replacements exist
      const [ox, oz, S] = k.split(',').map(Number);
      const size = S * TILE_N;
      let covered = true;
      for (const [k2, w] of want) {
        if (this.tiles.has(k2)) continue;
        if (w.ox < ox + size && w.ox + w.S * TILE_N > ox && w.oz < oz + size && w.oz + w.S * TILE_N > oz) { covered = false; break; }
      }
      if (covered) { this.disposeTile(tile); this.tiles.delete(k); }
    }
    return pending;
  }
  disposeTile(t) { for (const m of t.meshes) { this.group.remove(m); m.geometry.dispose(); } }
  // a tile finished on a background builder
  receive(k, ox, oz, S, parts) {
    this.inflight.delete(k);
    if (this.tiles.has(k) || !this.want || !this.want.has(k)) return;
    this.tiles.set(k, this.meshesFrom(parts, ox, oz, S));
  }
  buildTile(ox, oz, S) { return this.meshesFrom(this.buildTileData(ox, oz, S), ox, oz, S); }
  meshesFrom(parts, ox, oz, S) {
    const meshes = [];
    for (const p of parts) {
      const m = new THREE.Mesh(GeoBuilder.toGeometry(p.a), this.mats[p.kind]);
      m.position.set(ox, 0, oz);
      m.castShadow = p.cast; m.receiveShadow = true;
      m.matrixAutoUpdate = false; m.updateMatrix();
      this.group.add(m); meshes.push(m);
    }
    return { meshes, S };
  }

  buildTileData(ox, oz, S) {
    const A = this.A, n = TILE_N, W = n + 2;
    const hg = new Float32Array(W * W), top = new Uint8Array(W * W), sideTop = new Uint8Array(W * W), sub = new Uint8Array(W * W),
      deep = new Uint8Array(W * W), fl = new Uint8Array(W * W), sm = new Uint8Array(W * W), band = new Uint8Array(W * W), dd = new Float32Array(W * W);
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      const c = this.column(ox + (i - 1) * S, oz + (j - 1) * S);
      const k = j * W + i;
      hg[k] = c.smooth ? c.h : c.h; top[k] = c.top; sideTop[k] = c.sideTop; sub[k] = c.sub; deep[k] = c.deep;
      fl[k] = c.fluid; sm[k] = c.smooth; band[k] = c.band; dd[k] = c.d;
    }
    // cliffs: steep columns get bare rock
    for (let j = 1; j <= n; j++) for (let i = 1; i <= n; i++) {
      const k = j * W + i;
      if (sm[k] || top[k] === A.ice || fl[k]) continue;
      const h = hg[k];
      const st = Math.max(Math.abs(h - hg[k - 1]), Math.abs(h - hg[k + 1]), Math.abs(h - hg[k - W]), Math.abs(h - hg[k + W])) / S;
      if (st >= 2.5 && top[k] !== A.snow) { top[k] = this.cliff; sideTop[k] = this.cliff; sub[k] = this.cliff; }
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
        const o = (di, dj) => (hg[(j + dj) * W + i + di] > h + 0.5 ? 1 : 0);
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
        const border = (i + di === 0 || i + di === W - 1 || j + dj === 0 || j + dj === W - 1);
        if (border) hn = Math.min(hn, hTop) - 4;   // skirts hide LOD cracks
        if (hn >= hTop - 0.001) continue;
        const hh = hTop;
        let segs;
        if (S >= 4) segs = [[hn, hh, hh - hn <= 1.5 ? sideTop[k] : band[k] ? A.tc_orange : sub[k]]];
        else if (band[k]) {
          segs = [[Math.max(hn, hh - 1), hh, sideTop[k]]];
          for (let y = Math.floor(hh) - 1; y >= Math.floor(hn); y -= 1) {
            const y0 = Math.max(hn, y), y1 = Math.min(hh - 1, y + 1);
            if (y1 <= y0) continue;
            const bt = [A.tc_orange, A.tc_white, A.tc_red, A.tc_yellow, A.tc_orange, A.tc_brown, A.tc_lgray, A.tc_red][((Math.floor(y / 2) % 8) + 8) % 8];
            segs.push([y0, y1, bt]);
          }
        } else segs = [[Math.max(hn, hh - 1), hh, sideTop[k]], [Math.max(hn, hh - 4), hh - 1, sub[k]], [hn, hh - 4, deep[k]]];
        for (const [y0, y1, tile] of segs) {
          if (y1 - y0 <= 0.001) continue;
          geo.side(dIdx, x0, z0, x1, z1, y0, y1, tile, y0 <= hn + 0.01 ? 0.6 : 1, wx, wz);
        }
      }
      if (fl[k] === 1 && this.water > h) water.flat(x0, z0, x1, z1, this.water - 0.12);
      if (fl[k] === 2 && this.lava > h) lava.top(x0, z0, x1, z1, this.lava - 0.12, A.lava, 1, 1, 1, 1, wx, wz);
      if (S === 1 && (!fl[k] || (fl[k] === 1 && this.st === 'shore')) && !sm[k]) {
        const p = this.plantFor(wx, wz, top[k], h);
        if (p >= 0) plants.cross(x0 + 0.5, h, z0 + 0.5, p, hash2(wx, wz, 77));
        else if (p === -2) { const bh = 3 + Math.floor(hash2(wx, wz, 78) * 5); for (let i = 0; i < bh; i++) plants.cross(x0 + 0.5, h + i, z0 + 0.5, A.p_papyrus, hash2(wx, wz, 77)); }
        else if (p === -3) { const bh = 4 + Math.floor(hash2(wx, wz, 78) * 12); for (let i = 0; i < bh; i++) plants.cross(x0 + 0.5, h + i, z0 + 0.5, A.p_kelp, hash2(wx, wz, 77)); }
      }
      if (S === 1 && fl[k] === 1 && (this.st === 'jungle' || this.st === 'taiga') && hash2(wx, wz, 91) < 0.045) plants.top(x0, z0, x1, z1, this.water - 0.09, A.waterlily, 1, 1, 1, 1, wx, wz);
    }
    // trees
    const G = this.treeGrid, pad = 7, size = n * S;
    const c0x = Math.floor((ox - pad) / G), c1x = Math.floor((ox + size + pad) / G);
    const c0z = Math.floor((oz - pad) / G), c1z = Math.floor((oz + size + pad) / G);
    if (S <= this.voxTreeMaxS) {
      const vox = new Map();
      const put = (x, y, z, tile, leaf = false, snowCap = false) => {
        const lx = x - ox, lz = z - oz;
        if (lx < -1 || lz < -1 || lx > size || lz > size || y < 0 || y > 255) return;
        const key = (y << 16) | ((lz + 1) << 8) | (lx + 1);
        const prev = vox.get(key);
        if (prev !== undefined && !(prev & 256) && leaf) return;
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
      if (this.st === 'shore') this.buildStreet(ox, oz, size, put);
      if (this.track.cross) this.buildBridge(ox, oz, size, put);
      const opaqueOf = { [A.leaves]: A.leaves_o, [A.jungleleaves]: A.jungleleaves_o, [A.pine_needles]: A.pine_needles_o, [A.aspen_leaves]: A.aspen_leaves_o, [A.acacia_leaves]: A.acacia_leaves_o, [A.cherry_leaves]: A.cherry_leaves_o, [A.darkoak_leaves]: A.darkoak_leaves_o };
      for (const [key, v] of vox) {
        const lx = (key & 255) - 1, lz = ((key >> 8) & 255) - 1, y = key >> 16;
        if (lx < 0 || lz < 0 || lx >= size || lz >= size) continue;
        if (y < hAt(lx, lz) - 0.01) continue;
        let tile = v & 255; const leaf = !!(v & 256);
        if (leaf && S > 1) tile = opaqueOf[tile] ?? tile;
        for (let f = 0; f < 6; f++) {
          const nx = lx + (f === 0 ? 1 : f === 1 ? -1 : 0), ny = y + (f === 4 ? 1 : f === 5 ? -1 : 0), nz = lz + (f === 2 ? 1 : f === 3 ? -1 : 0);
          const nv = vox.get((ny << 16) | ((nz + 1) << 8) | (nx + 1));
          if (nv !== undefined && (!(nv & 256) || leaf)) continue;
          if (ny < hAt(nx, nz) - 0.01) continue;
          let ft = tile;
          if (f >= 4 && !leaf) {
            if (tile === A.tree) ft = A.tree_top; else if (tile === A.jungletree) ft = A.jungletree_top; else if (tile === A.pine) ft = A.pine_top;
            else if (tile === A.aspen) ft = A.aspen_top; else if (tile === A.cherry_log) ft = A.cherry_log_top; else if (tile === A.darkoak) ft = A.darkoak_top; else if (tile === A.mush_stem) ft = A.mush_stem; else if (tile === A.crimson_stem || tile === A.warped_stem) ft = tile; else if (tile === A.acacia) ft = A.acacia_top; else if (tile === A.cactus) ft = A.cactus_top; else if (tile === A.basalt) ft = A.basalt_top;
          }
          const shade = leaf ? (f === 5 ? 0.65 : f === 4 ? 1.0 : 0.9) : 1;
          geo.cube(f, lx, y, lz, ft, shade, ox, oz);
        }
      }
    } else {
      if (S === 2) {
        for (let cz = Math.floor(oz / DECOR_G); cz <= Math.floor((oz + size) / DECOR_G); cz++)
          for (let cx = Math.floor(ox / DECOR_G); cx <= Math.floor((ox + size) / DECOR_G); cx++) {
            const t = this.decorAtCell(cx, cz);
            if (!t || t.type !== 'rock') continue;
            const lx = t.x - ox, lz = t.z - oz;
            if (lx < 0 || lz < 0 || lx >= size || lz >= size) continue;
            geo.box(lx + 0.5 - t.rad, t.y, lz + 0.5 - t.rad, lx + 0.5 + t.rad, t.y + t.rad + 0.6, lz + 0.5 + t.rad, this.st === 'arctic' ? A.snow : this.st === 'desert' ? A.desert_stone : this.st === 'nether' ? A.netherrack : this.st === 'plains' ? A.dry_grass : this.st === 'badlands' ? A.tc_orange : this.st === 'ocean' ? A.stone : this.st === 'shore' || this.st === 'peaks' ? A.stone : A.mossycobble, 0.85, ox, oz);
          }
      }
      for (let cz = c0z; cz <= c1z; cz++) for (let cx = c0x; cx <= c1x; cx++) {
        const t = this.treeAtCell(cx, cz);
        if (!t) continue;
        if (S >= 8 && (t.type === 'bush' || t.type === 'cactus' || t.type === 'glow' || t.type === 'deadbush')) continue;
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
          const gk = dx * 1000 + dz;
          let gh = st.ground.get(gk);
          if (gh === undefined) { gh = this.column(wx, wz).h; st.ground.set(gk, gh); }
          if (y < gh - 1.01) continue;
          for (let f = 0; f < 6; f++) {
            const nx = dx + (f === 0 ? 1 : f === 1 ? -1 : 0), ny = dy + (f === 4 ? 1 : f === 5 ? -1 : 0), nz = dz + (f === 2 ? 1 : f === 3 ? -1 : 0);
            const nt = st.vox.get(vkey(nx, ny, nz));
            if (nt !== undefined && nt !== A.glass && nt !== A.vine && nt !== A.water && tile !== A.vine) continue;
            if (nt !== undefined && tile === A.vine && nt === A.vine) continue;
            geo.cube(f, wx - ox, y, wz - oz, tile, f === 5 ? 0.7 : 1, ox, oz);
          }
        }
      }
    }
    const parts = [];
    const mk = (b, kind, cast) => { if (b.count) parts.push({ kind, cast, a: b.arrays() }); };
    mk(geo, 'solid', S <= 2);
    mk(plants, 'plant', false);
    mk(water, 'water', false);
    mk(lava, 'lava', false);
    return parts;
  }

  plantFor(x, z, top, h = 0) {
    const A = this.A, r = hash2(x, z, 31), k = this.st;
    const patch = this.noise3.n2(x / 18, z / 18);
    if (k === 'taiga' && top === A.grass) {
      if (r < 0.2 + 0.15 * patch) return r < 0.12 ? A.p_grass : A.p_grass2;
      if (patch > 0.3 && r < 0.45) return [A.p_rose, A.p_dandelion, A.p_tulip, A.p_viola][Math.floor(r * 1000) & 3];
    } else if (k === 'jungle' && (top === A.litter || top === A.grass)) {
      if (patch > 0.35 && r < 0.12) return -2;
      if (r < 0.3) return r < 0.16 ? A.p_junglegrass : A.p_fern;
      if (r < 0.34) return A.p_grass2;
    } else if (k === 'desert') {
      if (r < 0.012) return A.p_dry_shrub;
      if (r < 0.02) return A.p_dry_grass;
    } else if (k === 'nether') {
      if ((top === A.crimson_nylium || top === A.warped_nylium) && r < 0.08) return A.p_mushroom;
      if (r < 0.012) return A.p_mushroom;
    } else if (k === 'plains' && top === A.grass) {
      // sunflower plains: tall grass everywhere, big drifts of yellow flowers
      if (patch > 0.25 && r < 0.3) return r < 0.22 ? A.p_dandelion : A.p_grass2;
      if (r < 0.22) return r < 0.14 ? A.p_grass : A.p_grass2;
      if (patch < -0.4 && r < 0.38) return [A.p_rose, A.p_tulip, A.p_viola, A.p_dandelion][Math.floor(r * 1000) & 3];
    } else if (k === 'shore') {
      if (h < this.water - 0.5) {
        if (top === A.sand && r < 0.14) return A.p_seagrass;
        if (top !== A.sand && top !== A.gravel && r < 0.12) return r < 0.06 ? A.p_coral_a : A.p_coral_b;
        if (top === A.gravel && patch > 0.2 && r < 0.05 && h < this.water - 6) return -3;
        return -1;
      }
      if (top === A.grass) {
        if (r < 0.16) return A.p_grass;
        if (patch > 0.35 && r < 0.22) return [A.p_rose, A.p_dandelion][Math.floor(r * 1000) & 1];
      }
    } else if (k === 'ocean') {
      if (top === A.sand || top === A.silver_sand) {
        if (patch > 0.3 && r < 0.09) return -3;
        if (r < 0.18) return A.p_seagrass;
      } else if (top === A.gravel) { if (r < 0.06) return -3; }
      else if (top !== A.clay && r < 0.18) return r < 0.09 ? A.p_coral_a : A.p_coral_b;
    } else if (k === 'darkforest') {
      if (top === A.grass && r < 0.24) return r < 0.14 ? A.p_grass : A.p_fern;
      if (top === A.coniferous_litter && r < 0.06) return A.p_mushroom;
      if (top === A.moss && r < 0.1) return A.p_fern;
    } else if (k === 'cherry' && top === A.grass) {
      if (r < 0.2 + 0.2 * Math.max(0, patch)) return r < 0.13 ? A.p_petals : A.p_grass;
      if (patch < -0.4 && r < 0.3) return A.p_grass2;
    } else if (k === 'meadow' && top === A.grass) {
      if (r < 0.16) return r < 0.1 ? A.p_grass2 : A.p_grass;
      if (r < 0.16 + 0.2 * (0.5 + 0.5 * patch)) return [A.p_rose, A.p_dandelion, A.p_tulip, A.p_viola][Math.floor(r * 1000) & 3];
    } else if (k === 'peaks') {
      if (top === A.grass && r < 0.2) return r < 0.03 ? A.p_viola : A.p_grass;
      if (top === A.stone && r < 0.01) return A.p_dry_shrub;
    } else if (k === 'badlands') {
      if (top === A.red_sand && r < 0.012) return A.p_dry_shrub;
      if ((top === A.grass || top === A.dry_dirt) && r < 0.25) return A.p_dry_grass;
    } else if (k === 'arctic' && top === A.snow) {
      if (r < 0.008) return A.p_dry_shrub;
    }
    return -1;
  }

  dispose() {
    for (const t of this.tiles.values()) this.disposeTile(t);
    this.tiles.clear();
  }
}

// ---------------------------------------------------------------- geometry builder
export class GeoBuilder {
  constructor() { this.p = []; this.nm = []; this.uv = []; this.tl = []; this.c = []; this.ix = []; this.count = 0; }
  _v(x, y, z, nx, ny, nz, u, v, t, a) {
    this.p.push(x, y, z); this.nm.push(nx, ny, nz); this.uv.push(u, v); this.tl.push(t); this.c.push(a, a, a);
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
    this._v(x0, y, z0, 0, 1, 0, 0, 0, 0, 1); this._v(x0, y, z1, 0, 1, 0, 0, 0, 0, 1);
    this._v(x1, y, z1, 0, 1, 0, 0, 0, 0, 1); this._v(x1, y, z0, 0, 1, 0, 0, 0, 0, 1);
    this._q(false);
  }
  topH(x0, z0, x1, z1, y00, y10, y11, y01, t, wx, wz) {
    const du = x1 - x0, dv = z1 - z0;
    const nx = ((y00 + y01) - (y10 + y11)) / (2 * du), nz = ((y00 + y10) - (y01 + y11)) / (2 * dv);
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
      this._v(x1, y0, z0, 1, 0, 0, wz, y0, t, b); this._v(x1, y1, z0, 1, 0, 0, wz, y1, t, 1);
      this._v(x1, y1, z1, 1, 0, 0, wz + (z1 - z0), y1, t, 1); this._v(x1, y0, z1, 1, 0, 0, wz + (z1 - z0), y0, t, b);
    } else if (dir === 1) {
      this._v(x0, y0, z1, -1, 0, 0, wz + (z1 - z0), y0, t, b); this._v(x0, y1, z1, -1, 0, 0, wz + (z1 - z0), y1, t, 1);
      this._v(x0, y1, z0, -1, 0, 0, wz, y1, t, 1); this._v(x0, y0, z0, -1, 0, 0, wz, y0, t, b);
    } else if (dir === 2) {
      this._v(x1, y0, z1, 0, 0, 1, wx + (x1 - x0), y0, t, b); this._v(x1, y1, z1, 0, 0, 1, wx + (x1 - x0), y1, t, 1);
      this._v(x0, y1, z1, 0, 0, 1, wx, y1, t, 1); this._v(x0, y0, z1, 0, 0, 1, wx, y0, t, b);
    } else {
      this._v(x0, y0, z0, 0, 0, -1, wx, y0, t, b); this._v(x0, y1, z0, 0, 0, -1, wx, y1, t, 1);
      this._v(x1, y1, z0, 0, 0, -1, wx + (x1 - x0), y1, t, 1); this._v(x1, y0, z0, 0, 0, -1, wx + (x1 - x0), y0, t, b);
    }
    this._q(false);
  }
  cube(f, lx, y, lz, t, a, ox, oz) {
    const x0 = lx, x1 = lx + 1, z0 = lz, z1 = lz + 1, y0 = y, y1 = y + 1, wx = ox + lx, wz = oz + lz;
    if (f < 4) { this.side(f, x0, z0, x1, z1, y0, y1, t, a, wx, wz); this._fixA(a); }
    else if (f === 4) this.top(x0, z0, x1, z1, y1, t, a, a, a, a, wx, wz);
    else this.bottom(x0, z0, x1, z1, y0, t, a * 0.8, wx, wz);
  }
  bottom(x0, z0, x1, z1, y, t, a, wx, wz) {
    this._v(x0, y, z0, 0, -1, 0, wx, wz, t, a); this._v(x1, y, z0, 0, -1, 0, wx + (x1 - x0), wz, t, a);
    this._v(x1, y, z1, 0, -1, 0, wx + (x1 - x0), wz + (z1 - z0), t, a); this._v(x0, y, z1, 0, -1, 0, wx, wz + (z1 - z0), t, a);
    this._q(false);
  }
  box(x0, y0, z0, x1, y1, z1, t, a, ox, oz) {
    const wx = ox + x0, wz = oz + z0;
    this.top(x0, z0, x1, z1, y1, t, a, a, a, a, wx, wz);
    this.bottom(x0, z0, x1, z1, y0, t, a * 0.7, wx, wz);
    for (let d = 0; d < 4; d++) { this.side(d, x0, z0, x1, z1, y0, y1, t, a * 0.85, wx, wz); this._fixA(a * 0.9); }
  }
  _fixA(a) { const n = this.c.length; for (let i = n - 12; i < n; i++) this.c[i] = a; }
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
      if (p[i] < mnx) mnx = p[i]; if (p[i] > mxx) mxx = p[i];
      if (p[i + 1] < mny) mny = p[i + 1]; if (p[i + 1] > mxy) mxy = p[i + 1];
      if (p[i + 2] < mnz) mnz = p[i + 2]; if (p[i + 2] > mxz) mxz = p[i + 2];
    }
    return {
      p: new Float32Array(this.p), nm, uv: new Float32Array(this.uv), tl: new Uint8Array(this.tl), c,
      ix: this.count * 4 > 65535 ? new Uint32Array(this.ix) : new Uint16Array(this.ix),
      bs: [(mnx + mxx) / 2, (mny + mxy) / 2, (mnz + mxz) / 2, 0.5 * Math.hypot(mxx - mnx, mxy - mny, mxz - mnz)],
    };
  }
  static toGeometry(a) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(a.p, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(a.nm, 3, true));
    g.setAttribute('uv', new THREE.BufferAttribute(a.uv, 2));
    g.setAttribute('tl', new THREE.BufferAttribute(a.tl, 1, false));
    g.setAttribute('color', new THREE.BufferAttribute(a.c, 3, true));
    g.setIndex(new THREE.BufferAttribute(a.ix, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(a.bs[0], a.bs[1], a.bs[2]), a.bs[3]);
    return g;
  }
  build() { return GeoBuilder.toGeometry(this.arrays()); }
}

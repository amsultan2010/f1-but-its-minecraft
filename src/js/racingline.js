// Fixed racing line: a minimum-curvature path inside the track edges plus a speed profile.
// Colour: green = accelerate / full throttle, yellow = hold speed through the corner, red = brake.
import * as THREE from 'three';

import { Vehicle } from './physics.js';

// ---------------------------------------------------------------- path
// Minimum-curvature line: minimise the sum of squared second differences of the path
// p_j = c_j + n_j * o_j subject to |o_j| <= lim. Solved exactly per coordinate (projected
// Gauss-Seidel) on a coarse-to-fine grid so long corners converge (32 m -> 16 -> 8 -> 4 m).
function solveOffsets(cx, cz, nx, nz, lim, o, sweeps) {
  const M = cx.length;
  const R = [0, 0];
  for (let it = 0; it < sweeps; it++) {
    for (let j = 0; j < M; j++) {
      // second-difference residuals at j-1, j, j+1 without o_j's own contribution
      let num = 0;
      for (const [c, al] of [[-1, 1], [0, -2], [1, 1]]) {
        const i = (j + c + M) % M, im = (i - 1 + M) % M, ip = (i + 1) % M;
        R[0] = cx[im] - 2 * cx[i] + cx[ip] + nx[im] * o[im] - 2 * nx[i] * o[i] + nx[ip] * o[ip];
        R[1] = cz[im] - 2 * cz[i] + cz[ip] + nz[im] * o[im] - 2 * nz[i] * o[i] + nz[ip] * o[ip];
        R[0] -= al * nx[j] * o[j]; R[1] -= al * nz[j] * o[j];
        num += al * (R[0] * nx[j] + R[1] * nz[j]);
      }
      let v = -num / 6;
      o[j] = v > lim ? lim : v < -lim ? -lim : v;
    }
  }
}
export function computeRacingLine(track, halfW, margin = 1.35) {
  const N = track.N, lim = halfW - margin;
  let prev = null, prevM = 0;
  for (const D of [32, 16, 8, 4]) {
    const M = Math.floor(N / D);
    const cx = new Float64Array(M), cz = new Float64Array(M), nx = new Float64Array(M), nz = new Float64Array(M), o = new Float64Array(M);
    for (let j = 0; j < M; j++) {
      const i = Math.floor(j * N / M);
      cx[j] = track.X[i]; cz[j] = track.Z[i]; nx[j] = -track.TZ[i]; nz[j] = track.TX[i];
      if (prev) { const f = j * prevM / M, k = Math.floor(f), t = f - k; o[j] = prev[k % prevM] * (1 - t) + prev[(k + 1) % prevM] * t; }
    }
    solveOffsets(cx, cz, nx, nz, lim, o, D >= 16 ? 3000 : D === 8 ? 1500 : 800);
    prev = o; prevM = M;
  }
  const o = prev, M = prevM;
  // dense 1 m line (Catmull-Rom through the 4 m offsets)
  const X = new Float32Array(N), Z = new Float32Array(N), Y = new Float32Array(N), OFF = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const f = i * M / N, j = Math.floor(f), t = f - j;
    const o0 = o[(j - 1 + M) % M], o1 = o[j % M], o2 = o[(j + 1) % M], o3 = o[(j + 2) % M];
    const off = Math.max(-lim, Math.min(lim, 0.5 * (2 * o1 + (-o0 + o2) * t + (2 * o0 - 5 * o1 + 4 * o2 - o3) * t * t + (-o0 + 3 * o1 - 3 * o2 + o3) * t * t * t)));
    OFF[i] = off;
    X[i] = track.X[i] - track.TZ[i] * off; Z[i] = track.Z[i] + track.TX[i] * off; Y[i] = track.H[i];
  }
  // curvature (circle through points 6 m either side) and segment lengths
  const K = new Float32Array(N), ds = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const i1 = (i + 1) % N;
    ds[i] = Math.max(0.2, Math.hypot(X[i1] - X[i], Z[i1] - Z[i]));
    const a = (i - 6 + N) % N, b = (i + 6) % N;
    const ax = X[a] - X[i], az = Z[a] - Z[i], bx = X[b] - X[i], bz = Z[b] - Z[i];
    const cr = ax * bz - az * bx, la = Math.hypot(ax, az), lb = Math.hypot(bx, bz), lc = Math.hypot(X[b] - X[a], Z[b] - Z[a]);
    K[i] = Math.abs(2 * cr) / Math.max(1e-6, la * lb * lc);
  }
  // light smoothing of curvature (removes grid noise)
  const K2 = new Float32Array(N);
  for (let i = 0; i < N; i++) { let s = 0; for (let k = -4; k <= 4; k++) s += K[(i + k + N) % N]; K2[i] = s / 9; }
  return { X, Z, Y, K: K2, ds, N, OFF };
}

// ---------------------------------------------------------------- what the car can do
// Measure the actual car with the game's own physics: cornering grip (with the steering
// assist, at full lock), braking and acceleration, each as a function of speed.
const calCache = new Map();
export function calibrate(P, geo) {
  const key = P.mass + '|' + P.claZ + '|' + P.mu + '|' + geo.halfWB.toFixed(3);
  if (calCache.has(key)) return calCache.get(key);
  const surf = { grip: 1, drag: 0 }, dt = 0.004, VS = [];
  for (let v = 15; v <= 95; v += 5) VS.push(v);
  const mk = () => { const c = new Vehicle(P, geo); c.assist = { tc: 1, abs: true, steer: true }; return c; };
  const setSpeed = (c, v) => { c.u = v; for (const w of c.W) w.w = v / w.R; const gi = P.gearsKmh.findIndex((g) => g / 3.6 > v * 1.04); c.gear = gi < 0 ? P.gearsKmh.length : gi + 1; c.rpm = P.rpmMax * 0.8; };
  const lat = VS.map((v) => {
    const c = mk(); setSpeed(c, v); let best = 0;
    for (let k = 0; k < 400; k++) {
      const thr = Math.max(0, Math.min(1, (v - c.u) * 0.6 + 0.3));
      c.step(dt, { thr, brk: 0, steer: 1, pad: false }, surf, surf, 0);
      if (k > 250) best = Math.max(best, Math.abs(c.ay));
    }
    return best;
  });
  const brk = new Float32Array(VS.length), acc = new Float32Array(VS.length);
  {
    const c = mk(); setSpeed(c, 100); const sum = new Float32Array(VS.length), n = new Float32Array(VS.length);
    for (let k = 0; k < 4000 && c.u > 12; k++) { c.step(dt, { thr: 0, brk: 1, steer: 0 }, surf, surf, 0); if (k > 40) { const b = Math.round((c.u - 15) / 5); if (b >= 0 && b < VS.length) { sum[b] += -c.ax; n[b]++; } } }
    for (let b = 0; b < VS.length; b++) brk[b] = n[b] ? sum[b] / n[b] : 0;
    for (let b = 1; b < VS.length; b++) if (!brk[b]) brk[b] = brk[b - 1];
    for (let b = VS.length - 2; b >= 0; b--) if (!brk[b]) brk[b] = brk[b + 1];
  }
  {
    const c = mk(); setSpeed(c, 12); c.gear = 1; const sum = new Float32Array(VS.length), n = new Float32Array(VS.length);
    for (let k = 0; k < 6000; k++) { c.step(dt, { thr: 1, brk: 0, steer: 0 }, surf, surf, 0); const b = Math.round((c.u - 15) / 5); if (b >= 0 && b < VS.length) { sum[b] += c.ax; n[b]++; } }
    for (let b = 0; b < VS.length; b++) acc[b] = n[b] ? Math.max(0.2, sum[b] / n[b]) : 0.2;
  }
  const look = (arr, v) => { const f = Math.max(0, Math.min(VS.length - 1.001, (v - 15) / 5)), i = Math.floor(f), t = f - i; return arr[i] * (1 - t) + arr[i + 1] * t; };
  const cal = { lat: (v) => look(lat, v), brk: (v) => look(brk, v), acc: (v) => look(acc, v), table: { VS, lat, brk: Array.from(brk), acc: Array.from(acc) } };
  calCache.set(key, cal);
  return cal;
}

// ---------------------------------------------------------------- speed profile + colours
// Forward/backward passes with a friction ellipse (no full braking while cornering hard).
// Colours: red = brake, yellow = coast/hold through the apex, green = throttle.
export function racingPhases(rl, P, geo, k = 0.96) {
  const { K, ds, N } = rl, cal = calibrate(P, geo), VTOP = 95;
  const vmax = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const kap = K[i];
    if (kap < 1e-4) { vmax[i] = VTOP; continue; }
    // largest v with v^2 * kappa <= lateral grip at v
    let lo = 5, hi = VTOP;
    for (let it = 0; it < 30; it++) { const m = (lo + hi) / 2; if (m * m * kap <= cal.lat(m) * k) lo = m; else hi = m; }
    vmax[i] = lo;
  }
  const ell = (v, kap) => { const r = (v * v * kap) / Math.max(1, cal.lat(v) * k); return Math.sqrt(Math.max(0.05, 1 - r * r)); };
  const v = Float32Array.from(vmax);
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
    // braking where the profile slows the car hard; holding where it is grip-limited mid-corner
    ph[i] = dv < -0.03 ? 2 : (v[i] >= vmax[i] - 0.4 && vmax[i] < VTOP - 2) || (dv < 0.01 && v[i] < VTOP - 2) ? 1 : 0;
  }
  // brake markers start ~0.2 s early (reaction), then drop flickers shorter than 5 m
  const ph2 = Uint8Array.from(ph);
  for (let i = 0; i < N; i++) if (ph[i] === 2 && ph[(i - 1 + N) % N] !== 2) { const lead = Math.round(v[i] * 0.2); for (let q = 1; q <= lead; q++) ph2[(i - q + N) % N] = 2; }
  for (let i = 0; i < N; i++) {
    const p0 = ph2[(i - 1 + N) % N];
    if (ph2[i] !== p0) { let run = 0; while (run < 5 && ph2[(i + run) % N] === ph2[i]) run++; if (run < 5) for (let q = 0; q < run; q++) ph2[(i + q) % N] = p0; }
  }
  return { ph: ph2, v, vmax };
}

export function racingLineMesh(rl, ph, fogPatch) {
  const { X, Z, Y, N } = rl, W = 0.38;
  const pos = new Float32Array(N * 2 * 3), col = new Float32Array(N * 2 * 3), idx = [];
  const cols = [new THREE.Color('#2ad12a'), new THREE.Color('#ffd21a'), new THREE.Color('#ee2a1c')];
  for (let i = 0; i < N; i++) {
    const a = (i - 1 + N) % N, b = (i + 1) % N;
    let tx = X[b] - X[a], tz = Z[b] - Z[a]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    const y = Y[i] + 0.06;
    pos.set([X[i] - tz * W, y, Z[i] + tx * W, X[i] + tz * W, y, Z[i] - tx * W], i * 6);
    const c = cols[ph[i]];
    col.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
    // dashed like an F1 game line: 4 m on, 1 m gap
    if (i % 5 !== 4) { const i1 = (i + 1) % N; idx.push(i * 2, i1 * 2, i * 2 + 1, i * 2 + 1, i1 * 2, i1 * 2 + 1); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeBoundingSphere();
  const m = fogPatch(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.82, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1, side: THREE.DoubleSide, toneMapped: false }));
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false; mesh.renderOrder = 1;
  return mesh;
}

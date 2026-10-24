// Biome landmark structures (pyramids, temples, cabins, igloos, icebergs, nether bridges, lava spires).
import { hash2 } from './noise.js';

export const vkey = (dx, dy, dz) => ((dy + 64) << 16) | ((dz + 128) << 8) | (dx + 128);
export const vdec = (k) => [(k & 255) - 128, (k >> 16) - 64, ((k >> 8) & 255) - 128];

export function pickStructure(world, gx, gz) {
  const B = world.B, A = world.A, G = world.structGrid, seed = B.seed + 77;
  if (hash2(gx, gz, seed) > ({ desert: 0.4, jungle: 0.5, taiga: 0.5, nether: 0.65, arctic: 0.6, shore: 0.6, plains: 0.35, darkforest: 0.4, cherry: 0.35, peaks: 0.45, ocean: 0.6, badlands: 0.3, meadow: 0.3 }[world.st])) return null;
  const x = Math.floor(gx * G + G * 0.15 + hash2(gx, gz, seed + 1) * G * 0.7);
  const z = Math.floor(gz * G + G * 0.15 + hash2(gx, gz, seed + 2) * G * 0.7);
  const c = world.column(x, z);
  if (c.d < 46 || c.smooth) return null;
  const r = hash2(gx, gz, seed + 3), dir = hash2(gx, gz, seed + 4) < 0.5 ? 0 : 1;
  let type = null;
  switch (world.st) {
    // only natural features: boulders, fossils, reefs, icebergs, lava spires (no buildings)
    case 'desert': type = c.band ? null : r < 0.6 ? 'boulder' : 'fossil'; break;
    case 'jungle': type = c.fluid ? null : 'boulder'; break;
    case 'taiga': type = c.fluid || c.top === A.snow ? null : 'boulder'; break;
    case 'nether': type = c.fluid === 2 ? null : 'lavaspire'; break;
    case 'shore': type = c.fluid === 1 && c.h < world.water - 3 ? 'reef' : null; break;
    case 'ocean': type = r < 0.65 ? 'reef' : 'boulder'; break;
    case 'darkforest': case 'cherry': case 'meadow': case 'plains': type = c.fluid ? null : 'boulder'; break;
    case 'peaks': type = c.fluid ? null : 'boulder'; break;
    case 'badlands': type = c.fluid || c.band ? null : 'boulder'; break;
    case 'arctic': type = c.top === A.ice ? (r < 0.75 ? 'iceberg' : null) : r < 0.5 ? 'boulder' : 'iceberg'; break;
  }
  if (!type) return null;
  if (type === 'bridge') {
    for (const e of [-42, 42]) {
      const ex = dir ? x : x + e, ez = dir ? z + e : z;
      if (world.track.near(ex, ez, false).d < 40) return null;
    }
  }
  return { type, x, z, y: Math.floor(c.h), r, dir, key: gx + ',' + gz };
}

export function buildStructure(world, st) {
  const A = world.A, vox = new Map();
  const put = (dx, dy, dz, t) => { if (dx < -127 || dx > 127 || dz < -127 || dz > 127 || dy < -63 || dy > 190) return; vox.set(vkey(dx, dy, dz), t); };
  const del = (dx, dy, dz) => vox.delete(vkey(dx, dy, dz));
  const box = (x0, y0, z0, x1, y1, z1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) put(x, y, z, typeof t === 'function' ? t(x, y, z) : t); };
  const h = (a, b, c) => hash2(st.x + a * 7 + c * 3, st.z + b * 13 + c * 5, 31);
  const rot = (x, z) => (st.dir ? [z, x] : [x, z]);
  switch (st.type) {
    case 'pyramid': {
      const H = 12;
      box(-H, -6, -H, H, -1, H, A.sandstone);
      for (let l = 0; l <= H; l++) {
        const s = H - l;
        const t = l === 4 || l === 8 ? A.desert_stone_brick : l === H ? A.tc_orange : A.sandstone_block;
        box(-s, l, -s, s, l, s, t);
      }
      for (let y = 0; y < 4; y++) for (let k = -1; k <= 1; k++) for (let d = 0; d < 4; d++) { const [a, b] = rot(k, -H + d); del(a, y, b); }
      for (const [a, b] of [[-H, -H], [H, -H], [-H, H], [H, H]]) box(a - 1, 0, b - 1, a + 1, 5, b + 1, (x, y) => (y === 5 ? A.tc_orange : A.desert_sandstone));
      break;
    }
    case 'well':
      box(-3, -3, -3, 3, 0, 3, A.sandstone); box(-2, 1, -2, 2, 1, 2, A.sandstone_block);
      del(0, 1, 0); del(0, 0, 0); put(0, 0, 0, A.water);
      for (const [a, b] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) box(a, 2, b, a, 4, b, A.sandstone);
      box(-2, 5, -2, 2, 5, 2, A.sandstone_block);
      break;
    case 'temple': {
      const tiers = [[8, 5], [6, 4], [4, 4]];
      let y0 = 0;
      box(-9, -6, -9, 9, -1, 9, A.mossycobble);
      for (const [s, hh] of tiers) {
        box(-s, y0, -s, s, y0 + hh - 1, s, (x, y, z) => (h(x, z, y) < 0.45 ? A.mossycobble : A.cobble));
        y0 += hh;
      }
      for (let y = 0; y < 3; y++) for (let k = -1; k <= 1; k++) { const [a, b] = rot(k, -8); del(a, y, b); const [c, d] = rot(k, -7); del(c, y, d); }
      // hanging vines on the walls
      for (let i = 0; i < 26; i++) {
        const side = Math.floor(h(i, 1, 2) * 4), pos = Math.floor(h(i, 2, 3) * 15) - 7, len = 2 + Math.floor(h(i, 3, 4) * 5);
        const [a, b] = side === 0 ? [pos, -9] : side === 1 ? [pos, 9] : side === 2 ? [-9, pos] : [9, pos];
        for (let y = 0; y < len; y++) put(a, 4 - y, b, A.vine);
      }
      box(-1, y0, -1, 1, y0 + 1, 1, A.mossycobble);
      break;
    }
    case 'shipwreck': {
      // broken, tilted wooden hull half buried in the sand, mast snapped off
      const L = 9 + Math.floor(st.r * 5);
      for (let a = -L; a <= L; a++) {
        const w = a > L - 4 ? Math.max(0, 2 - (a - (L - 4))) : 2;
        if (h(a, 0, 1) < 0.12) continue;   // gaps in the hull
        for (let b = -w; b <= w; b++) {
          const [px, pz] = rot(a, b), wall = Math.abs(b) === w;
          put(px, 0, pz, A.planks);
          if (wall || a === -L) { put(px, 1, pz, A.planks); if (a < L - 6 && h(a, b, 2) > 0.35) put(px, 2, pz, A.pine_planks); }
        }
      }
      for (let y = 1; y < 6; y++) { const [px, pz] = rot(-2, 0); put(px, y, pz, A.tree); }
      { const [px, pz] = rot(-L + 2, 0); box(px - 1, 1, pz - 1, px + 1, 2, pz + 1, A.pine_planks); }
      break;
    }
    case 'ruins': {
      // ocean ruins: a broken stone-brick room with mossy walls and a prismarine floor
      const R = 3 + Math.floor(st.r * 2);
      for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) {
        put(x, 0, z, h(x, z, 3) < 0.5 ? A.prismarine : A.stone_brick);
        if (Math.abs(x) === R || Math.abs(z) === R) {
          const top = 1 + Math.floor(h(x, z, 4) * 4);
          for (let y = 1; y <= top; y++) put(x, y, z, h(x, y, z) < 0.35 ? A.mossycobble : A.stone_brick);
        }
      }
      break;
    }
    case 'monument': {
      // ocean monument: a stepped prismarine temple with dark corner towers
      const H = 9;
      for (let l = 0; l <= H; l++) {
        const sz = 15 - l;
        for (let x = -sz; x <= sz; x++) for (let z = -sz; z <= sz; z++) {
          if (l > 0 && Math.max(Math.abs(x), Math.abs(z)) < sz - 1) continue;
          put(x, l, z, l % 3 === 2 ? A.dark_prismarine : A.prismarine);
        }
      }
      for (const [a, b] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) box(a - 1, 0, b - 1, a + 1, 13, b + 1, (x, y) => (y > 11 ? A.glowstone : A.dark_prismarine));
      box(-3, H, -3, 3, H + 4, 3, (x, y, z) => (Math.abs(x) === 3 || Math.abs(z) === 3 ? A.prismarine : A.glowstone));
      break;
    }
    case 'yacht': {
      // white superyacht: pointed bow, dark hull band, stepped decks with tinted windows
      const L = 9 + Math.floor(st.r * 9), Wd = 2 + (st.r > 0.5 ? 1 : 0);
      for (let a = -L; a <= L; a++) {
        const taper = a > L - 5 ? Math.max(0, Wd - (a - (L - 5))) : Wd;
        for (let b = -taper; b <= taper; b++) {
          const [px, pz] = rot(a, b);
          put(px, 0, pz, A.wool_black); put(px, 1, pz, A.wool_white); put(px, 2, pz, A.wool_white);
          if (Math.abs(b) < taper || a > L - 6) put(px, 2, pz, A.planks);
        }
      }
      const decks = [[-L + 3, L - 7, 3], [-L + 5, L - 10, 4], [-L + 8, L - 13, 5]];
      for (const [a0, a1, y] of decks) for (let a = a0; a <= a1; a++) for (let b = -Wd + 1; b <= Wd - 1; b++) {
        const [px, pz] = rot(a, b), side = Math.abs(b) === Wd - 1 || a === a0 || a === a1;
        put(px, y, pz, side && y < 5 && (a & 1) ? A.glass : A.wool_white);
      }
      break;
    }
    case 'cabin': {
      box(-5, -5, -4, 5, 0, 4, A.cobble);
      for (let y = 1; y <= 4; y++) for (let x = -4; x <= 4; x++) for (let z = -3; z <= 3; z++) {
        const edge = Math.abs(x) === 4 || Math.abs(z) === 3;
        if (!edge) continue;
        const corner = Math.abs(x) === 4 && Math.abs(z) === 3;
        const win = (y === 2 || y === 3) && !corner && (Math.abs(x) === 2 || z === 0);
        put(...(st.dir ? [z, y, x] : [x, y, z]), corner ? A.pine : win ? A.glass : A.pine_planks);
      }
      for (let y = 1; y <= 2; y++) { const [a, b] = rot(0, -3); del(a, y, b); }
      for (let l = 0; l <= 4; l++) for (let x = -5; x <= 5; x++) for (const z of [-4 + l, 4 - l]) put(...(st.dir ? [z, 5 + l, x] : [x, 5 + l, z]), A.jungle_planks);
      for (let x = -4; x <= 4; x++) for (let z = -3 + 0; z <= 3; z++) if (Math.abs(z) <= 3) { /* interior stays empty */ }
      box(...(st.dir ? [2, 5, 3, 2, 10, 3] : [3, 5, 2, 3, 10, 2]), A.cobble);
      break;
    }
    case 'boulder': {
      const R = 2 + st.r * 2.5;
      for (let y = -2; y <= R; y++) for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) {
        if (x * x + z * z + (y * 1.3) ** 2 > R * R + h(x, z, y) * 3) continue;
        const k = world.st, v = h(x, y, z);
        const t = k === 'desert' ? (v < 0.5 ? A.sandstone : A.desert_stone) : k === 'badlands' ? (v < 0.5 ? A.tc_orange : A.tc_red)
          : k === 'arctic' || k === 'peaks' ? (y >= R - 1 ? A.snow : v < 0.5 ? A.stone : A.cobble) : k === 'ocean' || k === 'shore' ? (v < 0.4 ? A.mossycobble : A.stone)
          : v < 0.5 ? A.mossycobble : A.cobble;
        put(x, y, z, t);
      }
      break;
    }
    case 'fossil': {
      // half-buried bone ribs in the sand
      const L = 4 + Math.floor(st.r * 4);
      for (let a = -L; a <= L; a++) { const [px, pz] = rot(a, 0); put(px, 0, pz, A.silver_sand); }
      for (let a = -L + 1; a < L; a += 2) for (let b = -3; b <= 3; b++) {
        const y = 3 - Math.round(Math.abs(b) * 0.9);
        const [px, pz] = rot(a, b); put(px, y, pz, A.silver_sand);
      }
      break;
    }
    case 'reef': {
      // a large coral reef: several mounds of mixed coral blocks with branches
      const cs = [A.coral_pink, A.coral_yellow, A.coral_blue, A.coral_purple];
      for (let m = 0; m < 6; m++) {
        const mx = Math.round((h(m, 1, 9) - 0.5) * 16), mz = Math.round((h(m, 2, 9) - 0.5) * 16), R = 2 + h(m, 3, 9) * 2.5, ct = cs[Math.floor(h(m, 4, 9) * 4)];
        for (let y = -1; y <= R; y++) for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) {
          if (x * x + z * z + (y * 1.4) ** 2 > R * R + h(x + mx, z + mz, y) * 2.5) continue;
          put(mx + x, y, mz + z, h(x, y, z + m) < 0.2 ? cs[(m + 1) & 3] : ct);
        }
        for (let k = 0; k < 3; k++) { const bx = mx + Math.round((h(m, k, 11) - 0.5) * 4), bz = mz + Math.round((h(k, m, 12) - 0.5) * 4), len = 2 + Math.floor(h(m, k, 13) * 4); for (let y = 0; y < len; y++) put(bx, Math.floor(R) + y, bz, ct); }
      }
      break;
    }
    case 'igloo': {
      const R = 4.5;
      box(-5, -3, -5, 5, -1, 5, A.snow);
      for (let y = 0; y <= 5; y++) for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) if (x * x + z * z + (y * 1.05) ** 2 <= R * R) put(x, y, z, A.snow);
      for (let d = -7; d <= -4; d++) for (let k = -1; k <= 1; k++) for (let y = 0; y <= 2; y++) { const [a, b] = rot(k, d); put(a, y, b, A.snow); }
      for (let d = -7; d <= -3; d++) for (let y = 0; y <= 1; y++) { const [a, b] = rot(0, d); del(a, y, b); }
      put(0, 6, 0, A.packed_ice);
      break;
    }
    case 'iceberg': {
      const R = 5 + st.r * 5, H = 7 + st.r * 12;
      for (let y = -4; y <= H; y++) {
        const rr = R * (1 - Math.max(0, y) / (H + 2)) ** 0.8;
        for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
          const n = h(x, z, 0) * 1.6;
          if (x * x + z * z > (rr + n) * (rr + n)) continue;
          put(x, y, z, y >= H - 1 ? A.snow : h(x, y, z) < 0.18 ? A.blue_ice : A.packed_ice);
        }
      }
      break;
    }
    case 'bridge': {
      const deck = world.lava + 7 - st.y, L = 40;
      for (let d = -L; d <= L; d++) {
        for (let k = -2; k <= 2; k++) { const [a, b] = rot(k, d); put(a, deck, b, A.nether_brick); }
        if (d % 2 === 0) for (const k of [-2, 2]) { const [a, b] = rot(k, d); put(a, deck + 1, b, A.nether_brick); }
        if (((d % 12) + 12) % 12 === 0) {
          const [a, b] = rot(0, d);
          const gh = Math.floor(world.column(st.x + a, st.z + b).h) - st.y;
          for (let y = Math.max(-40, gh - 2); y < deck; y++) for (let k = -1; k <= 1; k++) { const [c, e] = rot(k, d); put(c, y, e, A.nether_brick); }
        }
      }
      break;
    }
    case 'lavaspire': {
      const H = 24 + Math.floor(st.r * 22);
      for (let y = -2; y < H; y++) {
        const w = Math.max(0, Math.round((1 - y / H) * 4.2));
        for (let x = -w; x <= w; x++) for (let z = -w; z <= w; z++) if (x * x + z * z <= w * w + 0.5) put(x, y, z, h(x, z, y) < 0.08 ? A.glowstone : A.netherrack);
      }
      for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) put(x, H, z, A.glowstone);
      // lava fall pouring down one face
      const top = Math.floor(H * 0.75), side = Math.round((1 - top / H) * 4.2) + 1;
      const [fx, fz] = rot(0, side);
      for (let y = top; y >= -1; y--) put(fx, y, fz, A.lava);
      const [px, pz] = rot(0, side + 1);
      for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) put(px + x, -1, pz + z, A.lava);
      break;
    }
  }
  return vox;
}

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
export async function analyse(f) {
  const doc = await io.read(f);
  const root = doc.getRoot();
  const node = root.listNodes().find(n => n.getMesh());
  const M = node.getWorldMatrix();
  const prims = node.getMesh().listPrimitives();
  // world positions per prim, weld across all prims
  const keyMap = new Map(); let nV = 0;
  const parent = [];
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  const unite = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
  const P = [];
  const primData = prims.map((p, pi) => {
    const pos = p.getAttribute('POSITION'), n = pos.getCount();
    const wid = new Int32Array(n), v = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      pos.getElement(i, v);
      const x = M[0] * v[0] + M[4] * v[1] + M[8] * v[2] + M[12], y = M[1] * v[0] + M[5] * v[1] + M[9] * v[2] + M[13], z = M[2] * v[0] + M[6] * v[1] + M[10] * v[2] + M[14];
      const k = Math.round(x * 2000) + ',' + Math.round(y * 2000) + ',' + Math.round(z * 2000);
      let id = keyMap.get(k);
      if (id === undefined) { id = nV++; keyMap.set(k, id); parent.push(id); P.push(x, y, z); }
      wid[i] = id;
    }
    const idx = p.getIndices();
    const ia = idx ? idx.getArray() : Uint32Array.from({ length: n }, (_, i) => i);
    for (let t = 0; t < ia.length; t += 3) { unite(wid[ia[t]], wid[ia[t + 1]]); unite(wid[ia[t]], wid[ia[t + 2]]); }
    return { p, wid, ia, mat: p.getMaterial()?.getName() };
  });
  // component bboxes
  const comp = new Map();
  for (let v = 0; v < nV; v++) {
    const r = find(v); let c = comp.get(r);
    if (!c) { c = { mn: [1e9, 1e9, 1e9], mx: [-1e9, -1e9, -1e9], n: 0, tris: 0, mats: new Set() }; comp.set(r, c); }
    for (let k = 0; k < 3; k++) { c.mn[k] = Math.min(c.mn[k], P[v * 3 + k]); c.mx[k] = Math.max(c.mx[k], P[v * 3 + k]); }
    c.n++;
  }
  for (const d of primData) for (let t = 0; t < d.ia.length; t += 3) { const c = comp.get(find(d.wid[d.ia[t]])); c.tris++; c.mats.add(d.mat); }
  return { doc, node, M, prims, primData, comp, find, P };
}
if (import.meta.url === 'file://' + process.argv[1]) {
  const { comp } = await analyse(process.argv[2]);
  const list = [...comp.values()];
  console.log('components', list.length);
  // tyre-like: two dims equal ~0.5-0.85, small third dim, off-centre
  for (const c of list) {
    const s = [0, 1, 2].map(k => c.mx[k] - c.mn[k]);
    const cx = (c.mx[0] + c.mn[0]) / 2;
    if (Math.max(...s) > 0.45 && Math.max(...s) < 0.9 && Math.abs(cx) > 0.4 && Math.abs(s[1] - s[2]) < 0.08 && s[0] < 0.5)
      console.log('tyre?', s.map(v => v.toFixed(3)).join(' '), 'c', [0, 1, 2].map(k => ((c.mx[k] + c.mn[k]) / 2).toFixed(3)).join(' '), 'tris', c.tris, [...c.mats].join('|'));
  }
}

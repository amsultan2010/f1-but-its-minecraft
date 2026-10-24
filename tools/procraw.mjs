// Prepares a supplied car GLB for the game WITHOUT changing how it looks:
//  * geometry, materials, textures and UVs are kept as they are (no simplification, no resizing)
//  * the node transform is baked so the car sits in game space (+Z forward, ground y=0)
//  * triangles of the parts that really rotate (tyre, rim, cover, disc, hub) are moved into four
//    wheel meshes that share the original vertex data; the wheel axle centres go in node extras
//  * decal sheets whose texture carries transparency get alpha-tested, so their empty areas
//    show the paint underneath instead of black rectangles
//  * placeholder 16x16 textures are replaced with the supplied full-size files (2006 cars)
//  * textures are re-encoded to high-quality WebP at their original resolution, meshes are
//    meshopt-compressed (both only to make the files small enough to load in a browser)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'fs';
import { analyse } from './comps.mjs';
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

const [src, out, texDir, quality = '90'] = process.argv.slice(2);
const A = await analyse(src);
const { doc, node, M, primData, comp, find } = A;
const root = doc.getRoot();
const list = [...comp.entries()].map(([r, c]) => ({ r, ...c, s: [0, 1, 2].map(k => c.mx[k] - c.mn[k]), c: [0, 1, 2].map(k => (c.mx[k] + c.mn[k]) / 2) }));

// ---- wheels (same detection as before)
const tyres = list.filter(c => c.s[1] > 0.55 && c.s[1] < 0.85 && Math.abs(c.s[1] - c.s[2]) < 0.05 && c.s[0] > 0.18 && c.s[0] < 0.5 && Math.abs(c.c[0]) > 0.45 && c.c[1] < 0.5);
const wheels = [];
for (const t of tyres) {
  let w = wheels.find(w => Math.abs(w.c[2] - t.c[2]) < 0.1 && Math.sign(w.c[0]) === Math.sign(t.c[0]));
  if (!w) wheels.push(w = { c: t.c.slice(), mn: t.mn.slice(), mx: t.mx.slice() });
  for (let k = 0; k < 3; k++) { w.mn[k] = Math.min(w.mn[k], t.mn[k]); w.mx[k] = Math.max(w.mx[k], t.mx[k]); }
}
for (const w of wheels) { w.c = [0, 1, 2].map(k => (w.mn[k] + w.mx[k]) / 2); w.R = Math.max(w.mx[1] - w.mn[1], w.mx[2] - w.mn[2]) / 2; w.W = (w.mx[0] - w.mn[0]) / 2; }
if (wheels.length !== 4) { console.error('wheels found', wheels.length); process.exit(1); }
const zs = [...new Set(wheels.map(w => Math.round(w.c[2] * 10)))];
const pairA = wheels.filter(w => Math.round(w.c[2] * 10) === zs[0]), pairB = wheels.filter(w => Math.round(w.c[2] * 10) !== zs[0]);
const front = pairA[0].W <= pairB[0].W ? pairA : pairB, rear = front === pairA ? pairB : pairA;
const flip = front[0].c[2] < rear[0].c[2];
const zMid = (front[0].c[2] + rear[0].c[2]) / 2;
const ground = Math.min(...wheels.map(w => w.mn[1]));
const xMid = (Math.max(...wheels.map(w => w.mx[0])) + Math.min(...wheels.map(w => w.mn[0]))) / 2;
const toCar = (x, y, z) => flip ? [-(x - xMid), y - ground, -(z - zMid)] : [x - xMid, y - ground, z - zMid];
const dirCar = (x, y, z) => flip ? [-x, y, -z] : [x, y, z];
const owner = new Map();
wheels.forEach((w, wi) => {
  for (const c of list) {
    const inX = c.mn[0] > Math.min(w.mn[0], w.mx[0]) - 0.16 && c.mx[0] < Math.max(w.mn[0], w.mx[0]) + 0.16;
    const sameSide = Math.sign(c.c[0]) === Math.sign(w.c[0]) && Math.abs(c.c[0]) > Math.abs(w.c[0]) - w.W - 0.16;
    const inR = c.mn[1] > w.c[1] - w.R * 1.02 && c.mx[1] < w.c[1] + w.R * 1.02 && c.mn[2] > w.c[2] - w.R * 1.02 && c.mx[2] < w.c[2] + w.R * 1.02;
    if (!inX || !sameSide || !inR) continue;
    const centred = Math.abs(c.c[1] - w.c[1]) < 0.025 && Math.abs(c.c[2] - w.c[2]) < 0.025;
    const round = Math.abs(c.s[1] - c.s[2]) < Math.max(0.02, 0.06 * Math.max(c.s[1], c.s[2]));
    if (centred && round) owner.set(c.r, wi);
  }
});
const names = wheels.map(w => (front.includes(w) ? 'F' : 'R') + ((flip ? -1 : 1) * (w.c[0] - xMid) < 0 ? 'L' : 'R'));

// ---- bake the node transform into the vertex data (each accessor once)
const N3 = [M[0], M[1], M[2], M[4], M[5], M[6], M[8], M[9], M[10]];
const done = new Set();
for (const d of primData) for (const sem of d.p.listSemantics()) {
  const a = d.p.getAttribute(sem);
  if (done.has(a) || !['POSITION', 'NORMAL', 'TANGENT'].includes(sem)) continue;
  done.add(a);
  const n = a.getCount(), el = [];
  for (let i = 0; i < n; i++) {
    a.getElement(i, el);
    if (sem === 'POSITION') {
      const c = toCar(M[0] * el[0] + M[4] * el[1] + M[8] * el[2] + M[12], M[1] * el[0] + M[5] * el[1] + M[9] * el[2] + M[13], M[2] * el[0] + M[6] * el[1] + M[10] * el[2] + M[14]);
      el[0] = c[0]; el[1] = c[1]; el[2] = c[2];
    } else {
      let x = N3[0] * el[0] + N3[3] * el[1] + N3[6] * el[2], y = N3[1] * el[0] + N3[4] * el[1] + N3[7] * el[2], z = N3[2] * el[0] + N3[5] * el[1] + N3[8] * el[2];
      const l = Math.hypot(x, y, z) || 1; const c = dirCar(x / l, y / l, z / l); el[0] = c[0]; el[1] = c[1]; el[2] = c[2];
    }
    a.setElement(i, el);
  }
}
const bodyMesh = node.getMesh();
const scene = root.listScenes()[0];
node.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1]).setName('body');
// the node may sit under parents with transforms: move it to the scene root
const parent = node.getParentNode(); if (parent) { parent.removeChild(node); scene.addChild(node); }
for (const c of scene.listChildren()) if (c !== node) scene.removeChild(c);

// ---- split indices: body keeps its triangles, wheel meshes get clones with the rest
const wheelMeshes = names.map(n => doc.createMesh('wheel_' + n));
for (const d of primData) {
  const groups = [[], [], [], [], []];
  for (let t = 0; t < d.ia.length; t += 3) {
    const o = owner.get(find(d.wid[d.ia[t]]));
    groups[o === undefined ? 0 : o + 1].push(d.ia[t], d.ia[t + 1], d.ia[t + 2]);
  }
  if (groups[0].length === d.ia.length) continue;
  const buf = root.listBuffers()[0];
  const mkIdx = (arr) => doc.createAccessor().setType('SCALAR').setArray(d.p.getAttribute('POSITION').getCount() > 65535 ? Uint32Array.from(arr) : Uint16Array.from(arr)).setBuffer(buf);
  for (let g = 1; g <= 4; g++) if (groups[g].length) {
    const wp = d.p.clone(); wp.setIndices(mkIdx(groups[g]));
    wheelMeshes[g - 1].addPrimitive(wp);
  }
  if (groups[0].length) d.p.setIndices(mkIdx(groups[0])); else bodyMesh.removePrimitive(d.p);
}
wheels.forEach((w, wi) => {
  const c = toCar(...w.c);
  scene.addChild(doc.createNode('wheel_' + names[wi]).setMesh(wheelMeshes[wi]).setExtras({ axle: c, radius: w.R, width: w.W * 2 }));
});

// ---- real textures for 16x16 placeholders
if (texDir) for (const t of root.listTextures()) {
  const sz = t.getSize();
  if (!sz || sz[0] > 16) continue;
  const f = texDir + '/' + t.getName().toLowerCase().replace(/\.dds$/, '') + '.png';
  // these exported files are stored bottom-up relative to the model's UVs
  if (fs.existsSync(f)) { const b = await sharp(f).flip().png().toBuffer(); t.setImage(new Uint8Array(b)).setMimeType('image/png'); console.log('real texture', f); }
}

// ---- decal sheets: transparent texels must not render black
for (const m of root.listMaterials()) {
  const t = m.getBaseColorTexture();
  if (!t || m.getAlphaMode() !== 'OPAQUE') continue;
  const nm = (t.getName() || '') + ' ' + m.getName();
  if (!/decal|_da\b|_da\.|_da$|glass|window|lcd|led|light/i.test(nm)) continue;
  const img = sharp(Buffer.from(t.getImage()));
  const meta = await img.metadata();
  if (!meta.hasAlpha) continue;
  const st = await img.stats();
  const a = st.channels[3];
  if (!a || a.min > 200) continue;
  if (/glass|window/i.test(nm)) m.setAlphaMode('BLEND');
  else { m.setAlphaMode('MASK'); m.setAlphaCutoff(0.4); }
  console.log('alpha', m.getName(), t.getName(), m.getAlphaMode());
}

await doc.transform(
  prune(),
  textureCompress({ encoder: sharp, targetFormat: 'webp', quality: +quality }),
  // one quantization volume for the whole car: body and wheels share vertex data
  meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizationVolume: 'scene', quantizePosition: 16, quantizeNormal: 12, quantizeTexcoord: 16 }),
);
await io.write(out, doc);
console.log(out, 'flip', flip, names.join(','), (fs.statSync(out).size / 1e6).toFixed(1) + ' MB');

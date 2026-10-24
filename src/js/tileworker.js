// Worker entry: builds terrain tiles off the main thread.
import { World } from './world.js';

let world = null, gen = 0;
self.onmessage = (e) => {
  const m = e.data;
  try {
    if (m.type === 'init') {
      gen = m.gen;
      world = new World(m.biome, m.track, m.A, {});
      if (m.opts && m.opts.voxTreeMaxS) world.voxTreeMaxS = m.opts.voxTreeMaxS;
      return;
    }
    if (m.type === 'job') {
      if (m.gen !== gen || !world) { self.postMessage({ type: 'tile', gen: m.gen, key: m.key, parts: [] }); return; }
      const parts = world.buildTileData(m.ox, m.oz, m.S);
      const tr = [];
      for (const p of parts) for (const k of ['p', 'nm', 'uv', 'tl', 'c', 'ix']) tr.push(p.a[k].buffer);
      self.postMessage({ type: 'tile', gen, key: m.key, ox: m.ox, oz: m.oz, S: m.S, parts }, tr);
    }
  } catch (err) {
    self.postMessage({ type: 'error', msg: String(err && err.stack || err) });
  }
};

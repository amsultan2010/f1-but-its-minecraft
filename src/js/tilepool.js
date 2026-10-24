// Background terrain builders: a few workers each own a copy of the (deterministic) world
// generator and return finished tile geometry as transferable typed arrays.
export class TilePool {
  constructor(url, n) {
    this.ok = false; this.workers = []; this.gen = 0; this.world = null; this.jobs = new Map();
    try {
      for (let i = 0; i < n; i++) {
        const w = new Worker(url);
        w.busy = 0;
        w.onmessage = (e) => this._msg(w, e.data);
        w.onerror = () => this._fail();
        this.workers.push(w);
      }
      this.ok = this.workers.length > 0;
    } catch { this._fail(); }
  }
  _fail() {
    if (!this.ok && !this.workers.length) return;
    this.ok = false;
    for (const w of this.workers) try { w.terminate(); } catch { /* ignore */ }
    this.workers = [];
    if (this.world) { this.world.inflight.clear(); }
  }
  // a new world (biome) replaces the generator in every worker
  init(world, biome, track, A, opts = {}) {
    if (!this.ok) return;
    this.gen++; this.world = world;
    this.jobs.clear();
    for (const w of this.workers) { w.busy = 0; w.postMessage({ type: 'init', gen: this.gen, biome, track, A, opts }); }
  }
  request(world, key, ox, oz, S) {
    if (!this.ok || world !== this.world) return false;
    let best = null;
    for (const w of this.workers) if (w.busy < 3 && (!best || w.busy < best.busy)) best = w;
    if (!best) return false;
    best.busy++;
    best.postMessage({ type: 'job', gen: this.gen, key, ox, oz, S });
    return true;
  }
  get idle() { return this.workers.every((w) => w.busy === 0); }
  _msg(w, m) {
    if (m.type === 'error') { this._fail(); return; }
    if (m.type !== 'tile') return;
    w.busy = Math.max(0, w.busy - 1);
    if (m.gen !== this.gen || !this.world) return;
    this.world.receive(m.key, m.ox, m.oz, m.S, m.parts);
  }
}

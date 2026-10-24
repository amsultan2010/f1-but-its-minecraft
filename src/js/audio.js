// Engine audio: source-filter synthesis per era (combustion pulse train -> exhaust resonances),
// with turbo/MGU-K/gear whine, overrun pops, tyre/wind/road noise and a Minecraft-style UI click.
const PROC = `
// Source-filter engine model: every combustion fires a pressure pulse (one per cylinder per two
// revolutions); the pulse train runs through the exhaust's fixed resonances (formants), a pipe
// comb and a little saturation. Pitch therefore follows the firing rate exactly, while the tone
// (what makes a V10/V8 scream or a turbo V6 growl) comes from the resonances, which do not move.
function Res(f, q, sr){ // constant-peak band-pass biquad
  const w=2*Math.PI*f/sr, al=Math.sin(w)/(2*q), a0=1+al;
  this.b0=al/a0; this.b2=-al/a0; this.a1=-2*Math.cos(w)/a0; this.a2=(1-al)/a0; this.x1=0; this.x2=0; this.y1=0; this.y2=0;
}
Res.prototype.run=function(x){ const y=this.b0*x+this.b2*this.x2-this.a1*this.y1-this.a2*this.y2; this.x2=this.x1; this.x1=x; this.y2=this.y1; this.y1=y; return y; };
const ERA = [
  // 2026: 1.6 L turbo V6 (3 firings per rev), single exhaust after the turbine: deeper, gruff,
  // high frequencies damped by the turbo, plus wastegate rasp, turbo whistle and MGU-K whine
  { formants: [[160, 2.2, 1.0], [430, 3.0, 0.9], [980, 3.5, 0.55], [2100, 4.0, 0.25], [3600, 5.0, 0.08]],
    comb: 3.3, combFb: -0.55, cylVar: [1, 0.86, 0.95, 1.06, 0.9, 1.0], jitter: 0.035, crack: 0.05, sat: 2.2,
    lpLo: 900, lpHi: 4200, rasp: 0.22, turbo: 0.018, mguk: 0.032, gain: 2.0 },
  // 2010: 2.4 L flat-plane V8 limited to 18,000 rpm (4 firings per rev), short open exhausts:
  // the high, hard-edged scream
  { formants: [[300, 2.0, 0.28], [900, 2.4, 0.8], [1900, 3.0, 1.0], [3300, 3.5, 0.6], [5200, 4.0, 0.25]],
    comb: 1.9, combFb: -0.4, cylVar: [1, 0.97, 1.02, 0.96, 0.99, 1.03, 0.97, 1.0], jitter: 0.015, crack: 0.1, sat: 2.5,
    lpLo: 1400, lpHi: 9000, rasp: 0.26, turbo: 0, mguk: 0, gain: 0.8 },
  // 2006: first year of the 2.4 L V8, no rev limit (20,000 rpm): rawer and a touch brighter
  { formants: [[290, 2.0, 0.3], [870, 2.4, 0.78], [2000, 3.0, 1.0], [3600, 3.5, 0.68], [5800, 4.0, 0.32]],
    comb: 1.7, combFb: -0.4, cylVar: [1, 0.95, 1.03, 0.95, 0.99, 1.05, 0.96, 1.0], jitter: 0.02, crack: 0.13, sat: 2.8,
    lpLo: 1600, lpHi: 10500, rasp: 0.3, turbo: 0, mguk: 0, gain: 0.72 },
];
class Eng {
  constructor(sr){
    this.sr=sr; this.seed=1234567; this.n=0;
    this.p={rpm:4000,load:0,cyl:6,era:0,boost:0,lim:0,gwF:0,gwA:0,vol:0,lp:1,rmax:12000};
    this.s={rpm:4000,load:0,boost:0,gwF:0,gwA:0,vol:0,lp:1};
    this.fph=0; this.k=0; this.carry=0; this.cnt=0; this.env=0; this.pop=0;
    this.lp1=0; this.lp2=0; this.hp=0; this.hpx=0; this.cr=0; this.crx=0; this.ni=0;
    this.tph=0; this.kph=0; this.gph=0; this.lastAmp=1;
    this.build(0);
  }
  rnd(){ this.seed=(this.seed*1664525+1013904223)>>>0; return this.seed/4294967296; }
  build(era){
    this.era=era; const e=ERA[era]; this.e=e;
    this.res=e.formants.map(([f,q,g])=>{ const r=new Res(Math.min(f, this.sr*0.45), q, this.sr); r.g=g; return r; });
    this.comb=new Float32Array(Math.max(2, Math.round(e.comb*this.sr/1000))); this.ci=0;
  }
  setParams(d){ const era=d.era; Object.assign(this.p,d); if(era!==undefined && era!==this.era) this.build(era); }
  sample(){
    const p=this.p, s=this.s, e=this.e, sr=this.sr;
    s.rpm += (p.rpm - s.rpm) * 0.004; s.load += (p.load - s.load) * 0.004; s.boost += (p.boost - s.boost) * 0.002;
    s.gwF += (p.gwF - s.gwF) * 0.01; s.gwA += (p.gwA - s.gwA) * 0.003; s.vol += (p.vol - s.vol) * 0.003; s.lp += (p.lp - s.lp) * 0.002;
    const load=s.load, nC=p.cyl, rn=s.rpm/p.rmax;
    // ---- combustion pulses (fractional timing, so the pitch is clean even at 1,300 Hz)
    const fireHz = s.rpm/60*nC/2;
    const inc = fireHz/sr;
    let x = this.carry; this.carry = 0;
    this.fph += inc;
    if (this.fph >= 1) {
      this.fph -= 1;
      const frac = this.fph/inc;               // how far past the firing point this sample is
      this.k = (this.k+1) % nC; this.cnt++;
      const cut = p.lim && (this.cnt % 3) !== 0;
      const strength = cut ? 0.06 : (0.22 + 0.78*load);
      let a = e.cylVar[this.k % e.cylVar.length] * strength * (1 + e.jitter*(this.rnd()*2-1));
      this.lastAmp = a;
      x += a*(1-frac); this.carry = a*frac;
      // overrun: unburnt fuel popping in the exhaust after lifting at high rpm
      if (load < 0.06 && rn > 0.45 && this.rnd() < 0.02) this.pop = 0.5 + this.rnd()*0.8;
    }
    // ---- exhaust: formant bank + pipe comb
    let y = 0;
    for (const r of this.res) y += r.run(x)*r.g;
    // sharp edge of each pulse (the metallic crack of an open exhaust)
    const cr = x - this.crx; this.crx = x; y += cr*e.crack*(0.4+0.6*load);
    const ci=this.ci, d=this.comb[ci]; this.comb[ci] = y + d*e.combFb; this.ci = (ci+1) % this.comb.length;
    y = y*0.75 + d*0.45;
    // intake roar: noise breathing with the firing pulses
    this.ni += 0.5*((this.rnd()*2-1) - this.ni);
    this.env += 0.02*(Math.abs(x)*40 - this.env);
    y += this.ni*Math.min(1,this.env)*e.rasp*(0.3+0.7*load)*(0.4+0.6*rn);
    if (this.pop > 0.001) { y += this.pop*(this.rnd()*2-1)*0.8; this.pop *= 0.996; }
    // ---- saturation and tone: brighter and harder with load and rpm
    const dr = e.sat*(0.6 + 0.6*load);
    y = Math.tanh(y*2.2*dr)/Math.tanh(dr);
    const fc = (e.lpLo + (e.lpHi - e.lpLo)*Math.pow(0.35*load + 0.65*rn, 1.2))*(0.75 + 0.25*s.lp);
    const a1 = 1 - Math.exp(-6.2831853*Math.min(fc, sr*0.45)/sr);
    this.lp1 += a1*(y - this.lp1); this.lp2 += a1*(this.lp1 - this.lp2);
    y = this.lp2;
    // ---- turbo whistle, MGU-K whine, straight-cut gear whine
    const tf = 2600 + 7000*s.boost*rn;
    this.tph += tf/sr; if(this.tph>1)this.tph-=1;
    y += Math.sin(this.tph*6.2831853)*s.boost*e.turbo;
    const kf = s.rpm/60*7.5; this.kph += kf/sr; if(this.kph>1)this.kph-=1;
    y += (Math.sin(this.kph*6.2831853) + 0.3*Math.sin(this.kph*12.566))*e.mguk*(0.2+0.8*load);
    this.gph += s.gwF/sr; if(this.gph>1)this.gph-=1;
    y += Math.sin(this.gph*6.2831853)*s.gwA;
    // DC block
    const out = y - this.hpx + 0.995*this.hp; this.hpx = y; this.hp = out;
    this.n++;
    return out*s.vol*e.gain*(0.55 + 0.45*load);
  }
}
`;

const WORKLET = PROC + `
class EngProc extends AudioWorkletProcessor {
  constructor(){ super(); this.e=new Eng(sampleRate); this.port.onmessage=(m)=>this.e.setParams(m.data); }
  process(i,o){ const ch=o[0][0]; for(let k=0;k<ch.length;k++) ch[k]=this.e.sample(); if(o[0][1]) o[0][1].set(ch); return true; }
}
registerProcessor('eng-proc', EngProc);
`;

export class Audio {
  constructor() { this.ctx = null; this.ready = false; this.muted = false; this.vol = 0.8; this.level = 1; this._init = null; }
  init() {
    if (this._init) return this._init;
    this._init = this._doInit();
    return this._init;
  }
  async _doInit() {
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = ctx.createGain(); this.master.gain.value = this.muted ? 0 : this.vol * this.level;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.15;
    this.master.connect(comp); comp.connect(ctx.destination);
    this.ui = ctx.createGain(); this.ui.gain.value = this.muted ? 0 : 0.9 * this.level; this.ui.connect(ctx.destination);
    this.engGain = ctx.createGain(); this.engGain.gain.value = 0.7;
    // body resonance / onboard EQ
    this.engEQ = ctx.createBiquadFilter(); this.engEQ.type = 'peaking'; this.engEQ.frequency.value = 220; this.engEQ.Q.value = 0.8; this.engEQ.gain.value = 4;
    this.engGain.connect(this.engEQ); this.engEQ.connect(this.master);
    try {
      const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
      await ctx.audioWorklet.addModule(url);
      this.node = new AudioWorkletNode(ctx, 'eng-proc', { outputChannelCount: [2] });
      this.post = (d) => this.node.port.postMessage(d);
    } catch (e) {
      const Eng = new Function(PROC + '; return Eng;')();
      const eng = new Eng(ctx.sampleRate);
      this.node = ctx.createScriptProcessor(1024, 0, 1);
      this.node.onaudioprocess = (ev) => { const ch = ev.outputBuffer.getChannelData(0); for (let k = 0; k < ch.length; k++) ch[k] = eng.sample(); };
      this.post = (d) => eng.setParams(d);
    }
    this.node.connect(this.engGain);
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = nb.getChannelData(0); let b = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b = 0.97 * b + 0.03 * w; d[i] = w * 0.5 + b * 2; }
    const noise = (type, f, Q) => {
      const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true;
      const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = Q;
      const g = ctx.createGain(); g.gain.value = 0;
      s.connect(fl); fl.connect(g); g.connect(this.master); s.start();
      return { g, fl };
    };
    this.wind = noise('bandpass', 500, 0.5);
    this.squeal = noise('bandpass', 1150, 9);
    this.squeal2 = noise('bandpass', 1650, 12);
    this.rumble = noise('lowpass', 260, 0.7);
    this.road = noise('lowpass', 140, 0.9);
    this.noiseBuf = nb;
    this.ready = true;
    if (this.pendingEra) this.post(this.pendingEra);
  }
  resume() { if (this.ctx && this.ctx.state !== 'running') this.ctx.resume(); }
  setMuted(m) { this.muted = m; this._apply(); }
  // overall volume 0..1 (the slider); squared so the low end of the slider stays usable
  setVolume(v) { this.level = Math.max(0, Math.min(1, v)) ** 2; this._apply(); }
  _apply() {
    const t = this.ctx ? this.ctx.currentTime : 0;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : this.vol * this.level, t, 0.02);
    if (this.ui) this.ui.gain.setTargetAtTime(this.muted ? 0 : 0.9 * this.level, t, 0.02);
  }
  setEra(era, P) {
    const d = { era: era === '2026' ? 0 : era === '2010' ? 1 : 2, cyl: P.cyl, rmax: P.rpmMax };
    if (!this.ready) { this.pendingEra = d; return; }
    this.post(d);
  }
  update(st) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.post({ rpm: st.rpm, load: st.load, boost: st.boost, lim: st.lim ? 1 : 0, gwF: st.gwF, gwA: st.gwA, vol: st.vol, lp: st.lp });
    this.engEQ.gain.setTargetAtTime(st.lp > 0.9 ? 6 : 3, t, 0.2);
    const sp = st.speed;
    this.wind.g.gain.setTargetAtTime(Math.min(0.45, sp * sp / 10000) * st.windMul, t, 0.05);
    this.wind.fl.frequency.setTargetAtTime(300 + sp * 12, t, 0.1);
    this.road.g.gain.setTargetAtTime(Math.min(0.25, sp / 300) * (st.onPath ? 1 : 0), t, 0.08);
    const sq = Math.max(0, st.slip - 1.05) * (st.onPath ? 1 : 0.15) * Math.min(1, sp / 6);
    this.squeal.g.gain.setTargetAtTime(Math.min(0.2, sq * 0.2), t, 0.03);
    this.squeal2.g.gain.setTargetAtTime(Math.min(0.1, sq * 0.08), t, 0.03);
    this.squeal.fl.frequency.setTargetAtTime(1000 + Math.min(500, sq * 300), t, 0.05);
    this.rumble.g.gain.setTargetAtTime(st.offroad ? Math.min(0.9, sp / 30) : 0, t, 0.05);
  }
  thump(strength) {
    if (!this.ready) return;
    const ctx = this.ctx, s = ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
    const g = ctx.createGain(); const t = ctx.currentTime;
    g.gain.setValueAtTime(Math.min(1.5, strength), t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + 0.4);
  }
  click(strength = 0.25, freq = 1800) {
    if (!this.ready) return;
    const ctx = this.ctx, s = ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 2;
    const g = ctx.createGain(); const t = ctx.currentTime;
    g.gain.setValueAtTime(strength, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + 0.08);
  }
  // Minecraft-style menu click: a dry, crisp wooden "tick" (tight resonant snap + a short
  // body knock), no tone tail
  uiClick() {
    if (!this.ready || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const burst = (f, q, peak, dec, delay = 0, type = 'bandpass') => {
      const n = ctx.createBufferSource(); n.buffer = this.noiseBuf;
      const bp = ctx.createBiquadFilter(); bp.type = type; bp.frequency.value = f; bp.Q.value = q;
      const g = ctx.createGain(), t0 = t + delay;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + 0.0008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dec);
      n.connect(bp); bp.connect(g); g.connect(this.ui); n.start(t0, Math.random() * 1.5); n.stop(t0 + dec + 0.01);
    };
    burst(2300, 5, 1.1, 0.022);          // the snap
    burst(3900, 3, 0.35, 0.01);          // bright edge
    burst(620, 2.5, 0.7, 0.03);          // hollow body knock
    burst(1500, 4, 0.25, 0.012, 0.016);  // tiny release tick
  }
  beep(freq, dur = 0.12, vol = 0.25) {
    if (!this.ready || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime, o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = freq;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2500;
    o.connect(lp); lp.connect(g); g.connect(this.ui); o.start(t); o.stop(t + dur + 0.02);
  }
}

export { PROC };

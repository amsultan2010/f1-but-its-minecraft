// Engine audio: a physically informed waveguide engine (cylinders -> exhaust runners -> collector
// -> pipe -> outlet, plus intake), after Baldan et al. and Antonio-R1/engine-sound-generator (MIT),
// with era voicing, turbo/MGU-K/gear whine, overrun crackle and a Minecraft-style UI click.
const PROC = `
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
    const d = { era: era === '2026' ? 0 : era === '2010' ? 3 : era === '2006' ? 4 : 1, cyl: P.cyl, rmax: P.rpmMax };
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
  // Minecraft-like menu click: a short hollow wooden "tock"
  uiClick() {
    if (!this.ready || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'square';
    o.frequency.setValueAtTime(1180, t); o.frequency.exponentialRampToValueAtTime(560, t + 0.035);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.002); g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(bp); bp.connect(g); g.connect(this.ui); o.start(t); o.stop(t + 0.08);
    const n = ctx.createBufferSource(); n.buffer = this.noiseBuf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.35, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
    n.connect(hp); hp.connect(g2); g2.connect(this.ui); n.start(t, Math.random()); n.stop(t + 0.02);
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

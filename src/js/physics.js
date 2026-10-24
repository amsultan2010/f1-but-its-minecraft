// Vehicle dynamics v3: four independently loaded tyres with combined slip and relaxation,
// load transfer split by roll stiffness, limited-slip diff, aero with active modes,
// auto clutch + sequential auto gearbox, ABS / TC / steering assist.
import { clamp, lerp } from './noise.js';

const G = 9.81, RHO = 1.2;

// Pacejka-style normalised curve: peak 1.0 at s = 1, falls to ~0.8 when sliding.
const C_SH = 1.38, B_SH = Math.tan(Math.PI / (2 * C_SH));
const mf = (s) => Math.sin(C_SH * Math.atan(B_SH * s));

export class Vehicle {
  constructor(P, geo) {
    this.P = P;
    this.L = geo.halfWB * 2;
    this.a = this.L * (1 - P.frontW);   // CG -> front axle
    this.b = this.L * P.frontW;         // CG -> rear axle
    this.tF = geo.trackF; this.tR = geo.trackR;
    this.Rf = geo.rFront; this.Rr = geo.rRear;
    this.alphaPk = P.mode === 'turbo' ? 0.115 : 0.09;   // slip angle at peak grip
    this.kappaPk = P.mode === 'turbo' ? 0.11 : 0.09;    // slip ratio at peak grip
    this.ratios = P.gearsKmh.map((k) => (P.rpmMax * 2 * Math.PI / 60 * this.Rr) / (k / 3.6));
    this.nG = this.ratios.length;
    // wheels: FL, FR, RL, RR. x forward of CG, y to the right
    this.W = [
      { x: this.a, y: -this.tF / 2, front: true, R: this.Rf },
      { x: this.a, y: this.tF / 2, front: true, R: this.Rf },
      { x: -this.b, y: -this.tR / 2, front: false, R: this.Rr },
      { x: -this.b, y: this.tR / 2, front: false, R: this.Rr },
    ];
    this.assist = { tc: 1, abs: true, steer: true };
    this.tune = { rollF: 0.5, rearMu: P.rearMu || 1.12, lockK: 0.88, lockA: 0.55 };
    this.reset(0, 0, 0, 0);
  }
  reset(x, y, z, yaw) {
    this.x = x; this.y = y; this.z = z; this.yaw = yaw;
    this.u = 0; this.v = 0; this.rho = 0; this.vx = 0; this.vz = 0;
    for (const w of this.W) { w.w = 0; w.alpha = 0; w.kappa = 0; w.Fz = 0; w.slip = 0; }
    this.wf = 0; this.wr = 0;
    this.rpm = this.P.rpmIdle; this.gear = 1; this.shiftT = 0; this.sinceShift = 1;
    this.boost = 0; this.ax = 0; this.ay = 0;
    this.delta = 0; this.aeroMode = 0; this.drs = false; this.drsReq = false;
    this.revHold = 0; this.clutchSlip = 0;
    this.slipF = 0; this.slipR = 0; this.kappaR = 0; this.kappaF = 0;
    this.events = [];
    this.limiter = false; this.tcCut = 0; this.absOn = false;
  }
  speed() { return Math.hypot(this.u, this.v); }

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

    // ---- reverse
    if (this.gear > 0 && uAbs < 0.5 && brk > 0.5 && thr < 0.05) { this.revHold += dt; if (this.revHold > 0.6) { this.gear = -1; this.events.push('shift'); } }
    else this.revHold = 0;
    if (this.gear === -1) {
      // in reverse the brake pedal drives backwards; the throttle first brakes the backwards
      // roll, then (once nearly stopped) drops straight into first gear
      if (thr > 0.1) {
        if (this.u > -0.6) { this.gear = 1; this.revHold = 0; this.events.push('shift'); }
        else { brk = thr; thr = 0; }
      } else { thr = brk * 0.3 * clamp((this.u + 7) / 2.5, 0, 1); brk = 0; }   // gentle reverse, tops out around 25 km/h
    }

    // ---- steering. Full input asks for roughly the lock the tyres can use at this speed
    // (like the F1 games' steering linearity); without assist you get more lock than grip.
    const qd = 0.5 * RHO * this.u * this.u * P.claZ;
    const gripAcc = P.mu * (m * G + qd) / m;
    const geoLock = this.L * gripAcc / Math.max(this.u * this.u, 1);
    let want = geoLock * this.tune.lockK + this.alphaPk * (ins.pad ? this.tune.lockA + 0.1 : this.tune.lockA);
    // braking uses up tyre grip: ask for less lock so a full turn-in under braking doesn't spin it
    if (uAbs > 25) want *= 1 - 0.35 * brk * Math.min(1, (uAbs - 25) / 30);
    let lock = Math.min(P.steerLock, this.assist.steer ? want : want * 1.5);
    let target = ins.steer * lock;
    if (this.assist.steer && uAbs > 8) { // gentle automatic catch of a sliding rear
      const rearSlide = Math.atan2(this.v - this.b * this.rho, uAbs);
      const lim = this.alphaPk * (brk > 0.3 ? 0.6 : 1);
      if (Math.abs(rearSlide) > lim) target += clamp(rearSlide - Math.sign(rearSlide) * lim, -0.25, 0.25) * (uAbs > 50 ? 0.9 : 0.6);
    }
    const rate = ins.pad ? 4.0 : 2.4 + 2.0 / (1 + uAbs / 25);
    this.delta += clamp(target - this.delta, -rate * dt, rate * dt);
    const d = this.delta;

    // ---- aero
    const q = 0.5 * RHO * this.u * this.u;
    if (P.mode === 'active') {
      const wantX = thr > 0.95 && brk < 0.02 && Math.abs(ins.steer) < 0.12 && uAbs > 42;
      // back to full-downforce mode instantly when braking or turning
      this.aeroMode += clamp((wantX ? 1 : 0) - this.aeroMode, -dt / (brk > 0.05 || Math.abs(ins.steer) > 0.2 ? 0.04 : 0.15), dt / 0.35);
    } else if (P.mode === 'drs') {
      if (brk > 0.05 || thr < 0.5) this.drs = false;
      else if (this.drsReq && uAbs > 25) this.drs = true;
      this.aeroMode += clamp((this.drs ? 1 : 0) - this.aeroMode, -dt / 0.12, dt / 0.25);
    }
    const cla = lerp(P.claZ, P.claX, this.aeroMode), cda = lerp(P.cdaZ, P.cdaX, this.aeroMode);
    const down = q * cla, drag = q * cda;

    // ---- wheel loads
    const h = P.cgH, L = this.L;
    const dLong = m * this.ax * h / L;
    const axleF = m * G * this.b / L + down * P.aeroFront - dLong;
    const axleR = m * G * this.a / L + down * (1 - P.aeroFront) + dLong;
    const rollF = this.tune.rollF; // front share of lateral load transfer
    const dLatF = m * this.ay * h * rollF / this.tF, dLatR = m * this.ay * h * (1 - rollF) / this.tR;
    W[0].Fz = axleF / 2 + dLatF; W[1].Fz = axleF / 2 - dLatF;
    W[2].Fz = axleR / 2 + dLatR; W[3].Fz = axleR / 2 - dLatR;
    for (const w of W) w.Fz = Math.max(60, w.Fz);

    // ---- drivetrain
    const gearR = this.gear === -1 ? -this.ratios[0] * 0.9 : this.ratios[this.gear - 1];
    const wRear = (W[2].w + W[3].w) / 2;
    const wheelRpm = Math.abs(wRear * gearR * 60 / (2 * Math.PI));
    const bt = thr > this.boost ? P.turboLag : 0.12;
    this.boost += (thr - this.boost) * Math.min(1, dt / Math.max(0.01, bt));
    let thrEff = thr * (P.mode === 'turbo' ? 0.3 + 0.7 * this.boost : 0.9 + 0.1 * this.boost);
    if (this.assist.tc > 0 && this.gear !== -1) {
      const kLim = this.assist.tc === 2 ? 0.06 : 0.085;
      const kap = Math.max(W[2].kappa, W[3].kappa);
      const over = Math.max(kap - kLim, (this.slipR - (this.assist.tc === 2 ? 1.0 : 1.2)) * 0.1);
      this.tcCut = clamp(this.tcCut + (over > 0 ? over * 400 : -4) * dt, 0, 0.9);
      thrEff *= 1 - this.tcCut;
    } else this.tcCut = 0;
    this.sinceShift += dt;
    if (this.shiftT > 0) { this.shiftT -= dt; thrEff *= P.mode === 'turbo' ? 0 : 0.4; }

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

    // ---- brakes (per wheel), ABS
    const d0 = this.delta;
    const bTot = brk * P.brakeTq * 2;
    const bWheel = [bTot * P.brakeFront / 2, bTot * P.brakeFront / 2, bTot * (1 - P.brakeFront) / 2, bTot * (1 - P.brakeFront) / 2];
    this.absOn = false;
    // ABS: keep each tyre right at its peak braking slip (smooth modulation, no pulsing)
    if (this.assist.abs && brk > 0) for (let i = 0; i < 4; i++) {
      const over = (-W[i].kappa - this.kappaPk * 1.0) / (this.kappaPk * 0.4);
      if (over > 0) { bWheel[i] *= clamp(1 - over, 0.12, 1); this.absOn = true; }
    }
    // stability under braking: move bias forward while steering hard so the rear stays planted
    if (brk > 0) { const sh = Math.min(1, Math.abs(d0) / 0.1) * 0.25; bWheel[2] *= 1 - sh; bWheel[3] *= 1 - sh; }
    // rear tyres already working hard sideways get less brake (friction circle), so they keep grip
    if (brk > 0 && this.assist.abs) for (const i of [2, 3]) { const k = clamp(1 - ((W[i].sy || 0) - 0.75) * 1.6, 0.25, 1); if (k < 1) { bWheel[i] *= k; this.absOn = true; } }

    // ---- differential: open split + clutch LSD locking torque
    const lsdLock = 250 + 0.35 * Math.abs(Tdrive);
    const lsd = clamp((W[2].w - W[3].w) * 400, -lsdLock, lsdLock);
    const Tin = [0, 0, Tdrive / 2 - lsd, Tdrive / 2 + lsd];
    const Iw = [1.1, 1.1, 1.1 + (locked ? 0.045 * gearR * gearR : 0), 1.1 + (locked ? 0.045 * gearR * gearR : 0)];

    // ---- tyres
    const cd = Math.cos(d), sdn = Math.sin(d);
    let Fx = 0, Fy = 0, Mz = 0;
    const tanPk = Math.tan(this.alphaPk);
    let maxSF = 0, maxSR = 0, kapF = 0, kapR = 0;
    for (let i = 0; i < 4; i++) {
      const w = W[i];
      const vxb = this.u - this.rho * w.y, vyb = this.v + this.rho * w.x;
      const dd = w.front ? d * (1 + (w.y * Math.sign(d) > 0 ? 0.06 : -0.04)) : 0; // a touch of Ackermann
      const c = w.front ? Math.cos(dd) : 1, s = w.front ? Math.sin(dd) : 0;
      const vxw = vxb * c + vyb * s, vyw = -vxb * s + vyb * c;
      const ve = Math.max(Math.abs(vxw), 2.0);
      // slip angle with relaxation length
      const aT = Math.atan2(vyw, ve);
      const relax = Math.min(1, (Math.abs(vxw) + 3) * dt / 0.16);
      w.alpha += (aT - w.alpha) * relax;
      const surf = w.front ? surfF : surfR;
      const mu = P.mu * clamp(1 - 0.08 * (w.Fz / 3500 - 1), 0.75, 1.1) * surf.grip * (w.front ? 1 : this.tune.rearMu);
      const D = mu * w.Fz;
      const sy = Math.tan(w.alpha) / tanPk;
      const force = (kap) => {
        const sx = kap / this.kappaPk, sn = Math.hypot(sx, sy) || 1e-6, F = D * mf(sn);
        // warm slicks bite harder longitudinally under braking than they do sideways
        return [F * sx / sn * (sx < 0 ? 1.15 : 1), -F * sy / sn, sn];
      };
      // implicit wheel-spin update
      const k0 = (w.w * w.R - vxw) / ve;
      const [fx0] = force(k0);
      const [fx1] = force(k0 + 0.002);
      const K = Math.max(0, (fx1 - fx0) / 0.002);
      let wn = w.w + (Tin[i] - fx0 * w.R) / (Iw[i] / dt + K * w.R * w.R / ve);
      const bd = bWheel[i] * dt / Iw[i];
      if (Math.abs(wn) <= bd) wn = 0; else wn -= Math.sign(wn) * bd;
      if (bWheel[i] > 0 && uAbs < 0.3 && Math.abs(Tin[i]) < bWheel[i]) wn = 0;
      w.w = wn;
      w.kappa = (wn * w.R - vxw) / ve;
      let [fxw, fyw, sn] = force(w.kappa);
      if (uAbs < 1.2) fyw = -vyw * m * 0.6;               // low-speed damping
      w.slip = sn; w.sy = Math.abs(sy);
      const fxb = fxw * c - fyw * s, fyb = fxw * s + fyw * c;
      Fx += fxb; Fy += fyb; Mz += w.x * fyb - w.y * fxb;
      if (w.front) { maxSF = Math.max(maxSF, sn); kapF = Math.min(kapF, w.kappa); }
      else { maxSR = Math.max(maxSR, sn); kapR = Math.max(kapR, w.kappa); }
    }
    this.slipF = maxSF; this.slipR = maxSR; this.kappaF = kapF; this.kappaR = kapR;
    this.wf = (W[0].w + W[1].w) / 2; this.wr = (W[2].w + W[3].w) / 2;

    const offDrag = (surfF.drag + surfR.drag) * 0.5 * m * (0.6 + 0.0025 * this.u * this.u);
    const resist = (drag + 0.011 * m * G + offDrag) * Math.sign(this.u) * Math.min(1, uAbs / 0.5);
    const ax = (Fx - resist - m * G * slope) / m;
    const ay = Fy / m;
    this.u += (ax + this.v * this.rho) * dt;
    this.v += (ay - this.u * this.rho) * dt;
    this.rho += Mz / P.izz * dt;
    if (uAbs < 0.5 && thr < 0.05 && Math.abs(Tdrive) < 1) { this.rho *= 0.9; this.v *= 0.9; if (brk > 0.1) this.u *= 0.9; }
    this.ax += (ax - this.ax) * Math.min(1, dt * 14);
    this.ay += (ay - this.ay) * Math.min(1, dt * 14);

    this.yaw -= this.rho * dt;
    const syw = Math.sin(this.yaw), cyw = Math.cos(this.yaw);
    const vx = this.u * syw - this.v * cyw, vz = this.u * cyw + this.v * syw;
    this.x += vx * dt; this.z += vz * dt;
    this.vx = vx; this.vz = vz;

    // ---- auto gearbox
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
    this.gear += dir; this.shiftT = this.P.shiftTime; this.sinceShift = 0;
    this.events.push(dir > 0 ? 'up' : 'down');
  }
}

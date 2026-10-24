import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { fogU, fogPatch, skyU, makeSky, Post, EnvProbe } from './fx.js';
import { ERAS, ERA_ORDER, PHYS, BIOMES, BIOME_ORDER, TRACK_WIDTH, SPLASHES } from './data.js';
import { World, makeBlockTexture, makeBlockMaterial, makePbrTexture, makePbrBlockMaterial, makeWaterMaterial, sharedUniforms } from './world.js';
import { buildCar, carLightU } from './car2.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Vehicle } from './physics.js';
import { Audio } from './audio.js';
import { TilePool } from './tilepool.js';
import { computeRacingLine, racingPhases, racingLineMesh } from './racingline.js';
import TRACKS from './tracks.json';
import ATLAS from '../atlas.json';
import { clamp, lerp } from './noise.js';

const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem('pixelprix.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('pixelprix.' + k, JSON.stringify(v)); } catch { /* ignore */ } },
};
for (const k of BIOME_ORDER) BIOMES[k].key = k;
const A = ATLAS;

// ---------------------------------------------------------------- settings
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const isPhone = isTouch && Math.min(window.screen.width, window.screen.height) < 820;
const DPR = window.devicePixelRatio || 1;
const QUALITY = [
  // tuned for frame rate: no supersampling on desktop screens, sharp but not oversized on phones
  { name: 'Fast', pr: isTouch ? Math.min(DPR, 1.5) : 1, range: isPhone ? 340 : 440, detail: 0.75, shadow: 1024, budget: 4, probe: false, pbr: false, ao: false, vox: 1, msaa: 0, fx: null },
  { name: 'Fancy', pr: isTouch ? Math.min(DPR, 1.75) : DPR >= 1.75 ? 1.5 : 1, range: 480, detail: 0.9, shadow: 2048, budget: 5, probe: false, pbr: true, ao: false, vox: 1, msaa: 2, fx: { bloom: 0.2, rays: 0.36, sharp: 0.3, aoAmt: 0.75, bump: 0.7, env: 0.5 } },
  { name: 'RTX', pr: isTouch ? Math.min(DPR, 2) : DPR >= 1.75 ? 1.75 : 1.2, range: 540, detail: 1.0, shadow: 2048, budget: 6, probe: false, pbr: true, ao: true, vox: 2, msaa: 4, fx: { bloom: 0.25, rays: 0.42, sharp: 0.35, aoAmt: 0.85, bump: 0.85, env: 0.6 } },
];
const settings = {
  tc: store.get('tc', 1), abs: store.get('abs', true), steer: store.get('steer', true),
  cam: Math.min(store.get('cam', 0), 5), walls: store.get('walls', true), vol: store.get('vol', 0.8), line: store.get('line', true), q: store.get('q3', isTouch ? 0 : 1), sound: store.get('sound', true), units: store.get('units', 'kmh'),
};

// ---------------------------------------------------------------- renderer
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 3000);
const post = new Post(renderer, scene, camera);
let probe = null;

// Phones always play in landscape: when the phone is held upright the whole app is turned 90°.
const appEl = $('app');
const view = { w: window.innerWidth, h: window.innerHeight, rot: false };
function layout() {
  const iw = window.innerWidth, ih = window.innerHeight;
  view.rot = isTouch && ih > iw;
  view.w = view.rot ? ih : iw; view.h = view.rot ? iw : ih;
  const st = document.documentElement.style;
  st.setProperty('--vw', iw + 'px'); st.setProperty('--aw', view.w + 'px'); st.setProperty('--ah', view.h + 'px');
  appEl.classList.toggle('rot', view.rot);
  appEl.style.width = view.w + 'px'; appEl.style.height = view.h + 'px';
  document.documentElement.classList.toggle('short', view.h < 500);
}
// pointer position in the app's own (possibly rotated) frame
const appX = (e) => (view.rot ? e.clientY : e.clientX);
function resize() {
  layout();
  const Q = QUALITY[settings.q];
  renderer.setPixelRatio(Q.pr);
  renderer.setSize(view.w, view.h, false);
  camera.aspect = view.w / view.h;
  camera.updateProjectionMatrix();
  post.msaa = QUALITY[settings.q].msaa; post.setup(settings.q);
  post.resize(view.w, view.h);
}
window.addEventListener('resize', resize);

// ---------------------------------------------------------------- lights & sky
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.castShadow = true;
const SCAM = sun.shadow.camera; SCAM.left = -70; SCAM.right = 70; SCAM.top = 70; SCAM.bottom = -70; SCAM.near = 1; SCAM.far = 900;
sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.05;
scene.add(sun, sun.target);
const sky = makeSky();
scene.add(sky);
// the underside of the sea surface (only on the sea-floor track): rippling light, brightest overhead
const seaTop = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400, 1, 1), new THREE.ShaderMaterial({
  uniforms: { t: { value: 0 }, fogC: { value: new THREE.Color() }, dens: { value: 0.005 } },
  transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
  vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: `uniform float t, dens; uniform vec3 fogC; varying vec3 vW;
    float n(vec2 p){ return sin(p.x) * sin(p.y); }
    void main(){
      vec2 p = vW.xz * 0.08;
      float r = n(p + vec2(t * 0.4, t * 0.25)) * 0.5 + n(p * 2.3 - vec2(t * 0.6, -t * 0.3)) * 0.3 + n(p * 5.1 + t) * 0.2;
      float d = length(vW - cameraPosition);
      float window = exp(-pow(length(vW.xz - cameraPosition.xz) / 90.0, 2.0));
      vec3 c = mix(vec3(0.35, 0.75, 0.85), vec3(0.85, 1.0, 1.0), 0.5 + 0.5 * r) * (0.75 + 0.9 * window);
      c = mix(c, fogC, 1.0 - exp(-d * dens * 0.8));
      gl_FragColor = vec4(c, 0.92);
    }`,
}));
seaTop.rotation.x = -Math.PI / 2; seaTop.visible = false; seaTop.renderOrder = -1;
scene.add(seaTop);
scene.fog = new THREE.FogExp2(0xffffff, 0.0015);
const sunDir = new THREE.Vector3();
const sunCol = new THREE.Color();
let curBiome = null;

function applyBiomeLook(B) {
  curBiome = B;
  const el = THREE.MathUtils.degToRad(B.sunElev), az = THREE.MathUtils.degToRad(B.sunAz);
  sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize();
  sunCol.setHex(B.sunColor);
  skyU.zen.value.setHex(B.zenith); skyU.hor.value.setHex(B.horizon); skyU.sunDir.value.copy(sunDir);
  skyU.sunCol.value.copy(sunCol); skyU.cover.value = B.clouds; skyU.night.value = B.night ? 1 : 0;
  scene.fog.color.setHex(B.fogColor ?? B.horizon); scene.fog.density = B.fogDensity;
  seaTop.visible = !!B.underwater; seaTop.position.y = B.water; seaTop.material.uniforms.fogC.value.copy(scene.fog.color); seaTop.material.uniforms.dens.value = B.fogDensity;
  fogU.uCaus.value = B.underwater ? 0.4 : 0; fogU.uCausTop.value = B.water; post.noFlare = !!B.underwater;
  fogU.uFogSun.value.copy(sunDir); fogU.uFogSunCol.value.copy(sunCol).multiplyScalar(B.night ? 0 : 0.6); fogU.uFogBase.value = B.base;
  hemi.color.setHex(B.hemi[0]); hemi.groundColor.setHex(B.hemi[1]);
  sun.color.copy(sunCol);
  renderer.toneMappingExposure = B.exposure;
  scene.fog.density = B.fogDensity * (QUALITY[settings.q].pbr ? 0.62 : 1);
  applyLightLevels();
  buildSkyEnv();
  if (mats) {
    const w = mats.water.uniforms;
    w.zen.value.setHex(B.zenith); w.hor.value.setHex(B.horizon); w.sunDir.value.copy(sunDir); w.sunCol.value.copy(sunCol);
    w.deep.value.setHex({ jungle: 0x0f3b2c, desert: 0x0e5a5a, shore: 0x08788c, plains: 0x2a4a44, darkforest: 0x1f3a30, cherry: 0x2a5a6a, peaks: 0x14506e, badlands: 0x3a5a5a, meadow: 0x1e4a5a }[B.style || B.key] ?? 0x0b3550); w.cover.value = B.clouds;
  }
}

// fixed neutral studio light for the car, scaled against the biome's exposure so it reads the same everywhere
let studioEnv = null;
function carStudio() {
  const B = curBiome; if (!B) return;
  const k = 1 / (B.exposure * (QUALITY[settings.q].pbr ? 1.0 : 0.96));
  carLightU.uCarSun.value.setRGB(5.2 * k, 5.1 * k, 4.95 * k);
  carLightU.uCarSky.value.setRGB(0.65 * k, 0.67 * k, 0.7 * k);
  carLightU.uCarGround.value.setRGB(0.16 * k, 0.16 * k, 0.16 * k);
  if (car) car.setEnvIntensity(0.7 * k);
}
function getStudioEnv() {
  if (!studioEnv) studioEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  return studioEnv;
}
function applyLightLevels() {
  const B = curBiome; if (!B) return;
  const pbr = QUALITY[settings.q].pbr;
  // PBR blocks get sky light from the environment map, so the flat ambient term drops
  hemi.intensity = B.hemi[2] * (pbr ? 0.5 : 0.82);
  sun.intensity = B.sun * (pbr ? 1.18 : 1.1);
  renderer.toneMappingExposure = B.exposure * (pbr ? 1.0 : 0.96);
  if (matsP) for (const k of ['solid', 'plant', 'lava']) matsP[k].envMapIntensity = (B.night ? 0.8 : 1) * (QUALITY[settings.q].fx?.env ?? 0.5);
  carStudio();
}
// sky -> prefiltered environment map, used for block reflections and sky light
const pmrem = new THREE.PMREMGenerator(renderer);
let skyEnv = null;
const envScene = new THREE.Scene(); envScene.add(makeSky());
function buildSkyEnv() {
  if (!matsP) return;
  const saved = skyU.camPos.value.clone(); skyU.camPos.value.set(0, 0, 0);
  const rt = pmrem.fromScene(envScene, 0.035, 0.1, 2000);
  skyU.camPos.value.copy(saved);
  if (skyEnv) skyEnv.dispose();
  skyEnv = rt;
  for (const k of ['solid', 'plant', 'lava']) { matsP[k].envMap = rt.texture; matsP[k].needsUpdate = true; }
}
function swapBlockMats() {
  if (!mats) return;
  const src = QUALITY[settings.q].pbr ? matsP : matsL;
  const map = new Map();
  for (const k of ['solid', 'plant', 'lava']) { map.set(matsL[k], src[k]); map.set(matsP[k], src[k]); mats[k] = src[k]; }
  if (world) for (const m of world.group.children) { const n = map.get(m.material); if (n) m.material = n; }
}

// terrain is generated on background threads when the browser allows it
// thin chequered start/finish line painted across the track at the lap line
let startLine = null;
function buildStartLine() {
  if (startLine) { scene.remove(startLine); startLine.geometry.dispose(); startLine.material.map.dispose(); }
  const t = world.track, W = world.hw * 2, D = 1.2, sq = 0.4;
  const cols = Math.round(W / sq), rows = Math.round(D / sq);
  const cv = document.createElement('canvas'); cv.width = cols * 4; cv.height = rows * 4;
  const g = cv.getContext('2d');
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { g.fillStyle = (r + c) & 1 ? '#111' : '#f4f4f4'; g.fillRect(c * 4, r * 4, 4, 4); }
  const tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const geo = new THREE.PlaneGeometry(W, D);
  const mat = fogPatch(new THREE.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  startLine = new THREE.Mesh(geo, mat);
  startLine.rotation.order = 'YXZ';
  startLine.rotation.set(-Math.PI / 2, Math.atan2(t.TX[0], t.TZ[0]), 0);
  startLine.position.set(t.X[0], t.H[0] + 0.04, t.Z[0]);
  startLine.receiveShadow = true;
  scene.add(startLine);
}
let rLine = null, rlGeom = null, rlKey = null, rlProfile = null;
// the racing line is the same path for every car, but braking points depend on the car's era
function ensureRacingLine() {
  const key = sel.biome + '|' + sel.era + '|' + carFile;
  if (rlKey === key) return;
  rlKey = key;
  if (rLine) { scene.remove(rLine); rLine.geometry.dispose(); }
  rlProfile = racingPhases(rlGeom, PHYS[sel.era], { halfWB: car.halfWB, trackF: car.trackF, trackR: car.trackR, rFront: car.rFront, rRear: car.rRear });
  rLine = racingLineMesh(rlGeom, rlProfile.ph, fogPatch);
  scene.add(rLine);
}
const pool = new TilePool('tileworker.js', clamp((navigator.hardwareConcurrency || 4) - 1, 1, 4));

// ---------------------------------------------------------------- block textures
let blockTex = null, mats = null, matsL = null, matsP = null, pbrTex = null;
const atlasImg = new Image();
const atlasReady = new Promise((res, rej) => { atlasImg.onload = res; atlasImg.onerror = rej; });
atlasImg.src = 'atlas.png';
function tileCanvas(tile, scale = 1, dark = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 16 * scale;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(atlasImg, 0, tile * 16, 16, 16, 0, 0, 16 * scale, 16 * scale);
  if (dark !== 1) { g.fillStyle = `rgba(0,0,0,${1 - dark})`; g.fillRect(0, 0, c.width, c.height); }
  return c;
}
async function ensureMats() {
  if (mats) return mats;
  await atlasReady;
  blockTex = makeBlockTexture(atlasImg, Object.keys(A).length);
  blockTex.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  pbrTex = makePbrTexture(atlasImg, A);
  pbrTex.anisotropy = blockTex.anisotropy;
  matsL = {
    solid: fogPatch(makeBlockMaterial(blockTex, A)),
    plant: fogPatch(makeBlockMaterial(blockTex, A, { side: THREE.DoubleSide })),
    lava: fogPatch(makeBlockMaterial(blockTex, A, { alphaTest: 0 })),
  };
  matsP = {
    solid: fogPatch(makePbrBlockMaterial(blockTex, pbrTex, A)),
    plant: fogPatch(makePbrBlockMaterial(blockTex, pbrTex, A, { side: THREE.DoubleSide })),
    lava: fogPatch(makePbrBlockMaterial(blockTex, pbrTex, A, { alphaTest: 0 })),
  };
  const src = QUALITY[settings.q].pbr ? matsP : matsL;
  mats = { solid: src.solid, plant: src.plant, lava: src.lava, water: makeWaterMaterial() };
  buildSkyEnv(); applyLightLevels();
  return mats;
}

// ---------------------------------------------------------------- car loading
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const gltfCache = new Map();
async function loadGLTF(file) {
  if (gltfCache.has(file)) return gltfCache.get(file);
  let ok = true;
  try { await MeshoptDecoder.ready; } catch { ok = false; }
  // models ship as base64 text (the host only serves standard web file types)
  const tryLoad = async (url) => {
    const r = await fetch(url + '.txt');
    if (!r.ok) throw new Error('model ' + url + ' ' + r.status);
    const bin = atob((await r.text()).trim());
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return new Promise((res, rej) => loader.parse(buf.buffer, '', res, rej));
  };
  let g;
  g = await tryLoad(file);
  gltfCache.set(file, g);
  return g;
}

// ---------------------------------------------------------------- state
const sel = { era: store.get('era', '2026'), team: store.get('team', 0), biome: store.get('biome', 'forest') };
if (!ERAS[sel.era]) sel.era = '2026';
if (!BIOMES[sel.biome]) sel.biome = 'forest';
sel.team = clamp(sel.team | 0, 0, ERAS[sel.era].teams.length - 1);
let screen = 'title', paused = false;
let car = null, carFile = null, world = null, worldKey = null, veh = null;
const audio = new Audio();

const teamOf = () => ERAS[sel.era].teams[clamp(sel.team, 0, ERAS[sel.era].teams.length - 1)];
async function ensureCar() {
  const file = 'm_' + teamOf().model + '.glb';
  if (carFile !== file) {
    const g = await loadGLTF(file);
    if ('m_' + teamOf().model + '.glb' !== file) return;
    if (car) { scene.remove(car.root); car.dispose(); gltfCache.delete(carFile); }
    car = buildCar(g); carFile = file;
    scene.add(car.root);
    car.setEnv(getStudioEnv()); carStudio();
    veh = null;
  }
  car.setLivery(teamOf());
}

async function ensureWorld() {
  await ensureMats();
  if (world && worldKey === sel.biome) return;
  if (world) { scene.remove(world.group); world.dispose(); }
  const B = BIOMES[sel.biome];
  applyBiomeLook(B);
  world = new World(B, TRACKS[sel.biome], A, mats);
  world.voxTreeMaxS = QUALITY[settings.q].vox;
  if (pool.ok) { world.pool = pool; pool.init(world, B, TRACKS[sel.biome], A, { voxTreeMaxS: world.voxTreeMaxS }); }
  rlGeom = computeRacingLine(world.track, world.hw); rlKey = null;
  buildStartLine();
  worldKey = sel.biome;
  scene.add(world.group);
  { const st = B.style || B.key; weather.set(st === 'arctic' ? 'snow' : st === 'nether' ? 'ash' : st === 'ocean' ? 'bubbles' : st === 'cherry' ? 'petals' : null); }
  skid.clear();
}

// park the car on the grid (menus) or spawn it for a race
let carY = 0, carVy = 0, prevGy = null;
function placeCarAt(s) {
  const t = world.track, N = t.N;
  const i = ((Math.floor(s) % N) + N) % N;
  const yaw = Math.atan2(t.TX[i], t.TZ[i]);
  if (!veh || veh.P !== PHYS[sel.era]) veh = new Vehicle(PHYS[sel.era], car);
  veh.assist = { tc: settings.tc, abs: settings.abs, steer: settings.steer };
  veh.reset(t.X[i], t.H[i], t.Z[i], yaw);
  t.hint = i;
  carY = t.H[i]; carVy = 0; prevGy = null;
  syncCarTransform(0);
}

// ---------------------------------------------------------------- UI: Minecraft-style logo
function drawLogo() {
  // original block-built wordmark: big red "F1", stacked "BUT IT'S / MINECRAFT" in stone, chequered strip
  const G = {
    F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    1: ['0110', '1110', '0110', '0110', '0110', '0110', '1111'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    I: ['111', '010', '010', '010', '010', '010', '111'],
    "'": ['1', '1', '0', '0', '0', '0', '0'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    ' ': ['00', '00', '00', '00', '00', '00', '00'],
  };
  const layout = (text) => { const cells = []; let cx = 0; for (const ch of text) { const g = G[ch]; for (let y = 0; y < 7; y++) for (let x = 0; x < g[0].length; x++) if (g[y][x] === '1') cells.push([cx + x, y]); cx += g[0].length + 1; } return { cells, w: cx - 1 }; };
  const l1 = layout('F1'), l2 = layout("BUT IT'S"), l3 = layout('MINECRAFT');
  const b2 = 14, b1 = Math.round(b2 * 15 / 7), pad = 6, gap = 26;
  const leftW = l1.w * b1, rightW = Math.max(l2.w, l3.w) * b2;
  const W = pad * 2 + leftW + gap + rightW + 30, H = pad * 2 + 15 * b2 + 34 + 22;
  const c = $('logo'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const stone = tileCanvas(A.stone, 2), red = tileCanvas(A.wool_red, 2), dark = tileCanvas(A.cobble, 2, 0.5), darkR = tileCanvas(A.nether_brick, 2, 0.6);
  // every block is drawn with a stepped 3D extrusion down-right, like the Minecraft title
  const blocks = [];
  for (const [x, y] of l1.cells) blocks.push([pad + x * b1, pad + y * b1, b1, true]);
  for (const [x, y] of l2.cells) blocks.push([pad + leftW + gap + x * b2, pad + y * b2, b2, false]);
  for (const [x, y] of l3.cells) blocks.push([pad + leftW + gap + x * b2, pad + (y + 8) * b2, b2, false]);
  const D = 7;
  for (let d = D; d >= 1; d--) for (const [x, y, s, r] of blocks) { const k = s / 30; g.drawImage(r ? darkR : dark, 0, 0, 32, 32, x + d * 3 * k, y + d * 4 * k, s, s); }
  for (const [x, y, s, r] of blocks) {
    g.drawImage(r ? red : stone, (x * 7) % 16, (y * 5) % 16, 16, 16, x, y, s, s);
    const e = Math.max(2, Math.round(s / 10));
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(x, y, s, e); g.fillRect(x, y, e, s);
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x, y + s - e, s, e); g.fillRect(x + s - e, y, e, s);
  }
  // chequered flag strip under the whole wordmark
  const cy = pad + 15 * b2 + 30, cs = 9, n = Math.floor((W - pad * 2 - 20) / cs);
  for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) {
    g.fillStyle = (i + j) % 2 ? '#141414' : '#f2f2f2'; g.fillRect(pad + i * cs, cy + j * cs, cs, cs);
  }
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(pad + 3, cy + cs * 2, n * cs, 3);
}

function cssTiles() {
  const dirt = tileCanvas(A.dirt, 4, 0.55).toDataURL();
  document.documentElement.style.setProperty('--dirt-bg', `url(${dirt})`);
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const g = c.getContext('2d');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const v = 108 + Math.floor(Math.random() * 22); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 1, 1); }
  document.documentElement.style.setProperty('--btn-bg', `url(${c.toDataURL()})`);
}

function showScreen(name) {
  screen = name;
  for (const id of ['title', 'tracks', 'garage', 'options', 'controls', 'loading']) $(id).classList.toggle('hidden', id !== name);
  const racing = name === 'race';
  $('hud').classList.toggle('hidden', !racing);
  $('touch').classList.toggle('hidden', !(racing && isTouch));
  document.documentElement.classList.toggle('racing', racing);
  $('tDrs').classList.add('hidden');
  window.__orient?.();
  if (name === 'title') { $('splash').textContent = SPLASHES[Math.floor(Math.random() * SPLASHES.length)]; updateTitleSel(); }
  if (name === 'tracks') renderTracks();
  if (name === 'garage') renderGarage();
  if (name === 'options') renderOptions();
  menuT = 0;
}
function updateTitleSel() {
  const t = teamOf();
  $('selSw').style.background = `linear-gradient(135deg, ${t.base} 60%, ${t.accent} 60%)`;
  $('selTxt').textContent = `${sel.era} ${t.name} · ${BIOMES[sel.biome].circuit} - ${BIOMES[sel.biome].name}`;
}
const fmt = (t) => { if (t == null) return '–:––.–––'; const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(3); };
const bestTimes = store.get('best', {});

function renderTracks() {
  const L = $('trackList'); L.innerHTML = '';
  for (const k of BIOME_ORDER) {
    const B = BIOMES[k];
    const r = document.createElement('button'); r.className = 'wrow' + (sel.biome === k ? ' sel' : '');
    let ic;
    if (thumbsOk) {
      ic = document.createElement('canvas'); ic.width = ic.height = THUMB;
      ic.getContext('2d').drawImage(thumbsImg, BIOME_ORDER.indexOf(k) * THUMB, 0, THUMB, THUMB, 0, 0, THUMB, THUMB);
    } else ic = tileCanvas(A[B.icon], 4);
    ic.className = 'px';
    const best = Object.entries(bestTimes).filter(([key]) => key.startsWith(k + '|')).sort((a, b) => a[1] - b[1])[0];
    const tx = document.createElement('div');
    tx.innerHTML = `<div class="n mct">${B.circuit} - ${B.name}</div><div class="d">${(TRACKS[k].length * 8 / 1000).toFixed(1)} km</div>
      <div class="b">${best ? 'Best ' + fmt(best[1]) + ' (' + best[0].split('|')[1] + ')' : 'No lap yet'}</div>`;
    r.append(ic, tx); r.className += ' card';
    r.onclick = () => { if (sel.biome === k) return; sel.biome = k; store.set('biome', k); renderTracks(); switchWorld(); };
    r.ondblclick = () => startRace();
    L.appendChild(r);
  }
}
async function switchWorld() {
  await ensureWorld();
  placeCarAt(world.track.N - 30);
  updateTitleSel();
}

// team swatch: the main colour with a diagonal stripe of the accent colour (pixel style)
function carIcon(team) {
  const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.className = 'car';
  const g = c.getContext('2d');
  g.fillStyle = team.base; g.fillRect(0, 0, 16, 16);
  g.fillStyle = team.accent;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = x + y - 15; if (d >= -2 && d <= 2) g.fillRect(x, y, 1, 1); }
  return c;
}
function renderGarage() {
  const tabs = $('eraTabs'); tabs.innerHTML = '';
  for (const k of ERA_ORDER) {
    const b = document.createElement('button'); b.className = 'tab' + (sel.era === k ? ' sel' : ''); b.textContent = k;
    b.onclick = async () => { sel.era = k; sel.team = 0; store.set('era', k); store.set('team', 0); renderGarage(); await ensureCar(); placeCarAt(world.track.N - 30); };
    tabs.appendChild(b);
  }
  $('chassisName').textContent = sel.era + ' season — ' + ERAS[sel.era].sub;
  const slots = $('teamSlots'); slots.innerHTML = '';
  ERAS[sel.era].teams.forEach((t, i) => {
    const b = document.createElement('button'); b.className = 'slot' + (sel.team === i ? ' sel' : '');
    b.appendChild(carIcon(t));
    const n = document.createElement('span'); n.className = 'num'; n.textContent = t.num; b.appendChild(n);
    b.title = t.name;
    b.onclick = async () => { sel.team = i; store.set('team', i); renderGarage(); await ensureCar(); placeCarAt(world.track.N - 30); };
    slots.appendChild(b);
  });
  const t = teamOf(), P = PHYS[sel.era];
  const hp = Math.round((P.powerICE + P.powerERS) / 745.7);
  const bar = (label, v) => `<div class="stat"><span>${label}</span><div class="bar"><i style="width:${Math.round(clamp(v, 0.05, 1) * 100)}%"></i></div></div>`;
  $('tip').innerHTML = `<div class="tn">${t.name} <span class="tg">#${t.num}</span></div>
    <div class="tb">${sel.era} · ${ERAS[sel.era].engine}</div>
    ${bar('Power', hp / 1100)}${bar('Downforce', P.claZ / 5)}${bar('Grip', (P.mu - 1.2) / 0.7)}${bar('Lightness', (900 - P.mass) / 330)}
    <div class="tg">${hp} hp · ${P.mass} kg · ${P.gearsKmh.length}-speed auto · top ${P.gearsKmh[P.gearsKmh.length - 1]} km/h</div>`;
}

function optBtn(label, get, cycle) {
  const b = document.createElement('button'); b.className = 'mcb';
  const upd = () => (b.textContent = label + ': ' + get());
  b.onclick = () => { cycle(); upd(); };
  upd();
  return b;
}
const CAMS = ['Chase', 'Far chase', 'T-cam', 'Cockpit', 'Nose', 'Rear wing'];
function renderOptions() {
  const g = $('optGrid'); g.innerHTML = '';
  g.append(
    optBtn('Graphics', () => QUALITY[settings.q].name, () => { settings.q = (settings.q + 1) % 3; store.set('q3', settings.q); resize(); applyQuality(); }),
    optBtn('Camera', () => CAMS[settings.cam], () => cycleCam()),
    optBtn('Traction Control', () => ['Off', 'Medium', 'High'][settings.tc], () => { settings.tc = (settings.tc + 1) % 3; store.set('tc', settings.tc); syncAssists(); }),
    optBtn('ABS', () => (settings.abs ? 'On' : 'Off'), () => { settings.abs = !settings.abs; store.set('abs', settings.abs); syncAssists(); }),
    optBtn('Steering Assist', () => (settings.steer ? 'On' : 'Off'), () => { settings.steer = !settings.steer; store.set('steer', settings.steer); syncAssists(); }),
    optBtn('Sound', () => (settings.sound ? 'On' : 'Off'), () => setSound(!settings.sound)),
    optBtn('Racing Line', () => (settings.line ? 'On' : 'Off'), () => { settings.line = !settings.line; store.set('line', settings.line); }),
    optBtn('Track Walls', () => (settings.walls ? 'On' : 'Off'), () => { settings.walls = !settings.walls; store.set('walls', settings.walls); }),
    optBtn('Speed Units', () => (settings.units === 'kmh' ? 'km/h' : 'mph'), () => { settings.units = settings.units === 'kmh' ? 'mph' : 'kmh'; store.set('units', settings.units); }),
  );
}
function syncAssists() { if (veh) veh.assist = { tc: settings.tc, abs: settings.abs, steer: settings.steer }; }
function cycleCam() {
  settings.cam = (settings.cam + 1) % CAMS.length; store.set('cam', settings.cam); $('camName').textContent = CAMS[settings.cam] + ' · C';
  if (screen === 'race') flash(CAMS[settings.cam] + ' camera', 0.9, '#ffffff');
  look.yaw = look.pitch = 0;
}
// mouse look (chase cams): hold the right mouse button and move the mouse to swing the camera
// around the car; let go and it drifts back behind the car
const look = { yaw: 0, pitch: 0, idle: 9, drag: false };
window.addEventListener('mousedown', (e) => { if (e.button === 2 && screen === 'race' && !paused && settings.cam <= 1) { look.drag = true; e.preventDefault(); } });
window.addEventListener('mouseup', (e) => { if (e.button === 2) look.drag = false; });
window.addEventListener('blur', () => { look.drag = false; });
window.addEventListener('contextmenu', (e) => { if (screen === 'race') e.preventDefault(); });
window.addEventListener('mousemove', (e) => {
  if (screen !== 'race' || paused || isTouch || settings.cam > 1) return;
  if (!look.drag || !(e.buttons & 2)) { look.drag = false; return; }
  if (!e.movementX && !e.movementY) return;
  look.yaw = clamp(look.yaw - e.movementX * 0.006, -Math.PI, Math.PI);
  look.pitch = clamp(look.pitch + e.movementY * 0.004, -0.25, 0.9);
  look.idle = 0;
});
function applyQuality() {
  const Q = QUALITY[settings.q];
  if (sun.shadow.mapSize.x !== Q.shadow) { sun.shadow.mapSize.set(Q.shadow, Q.shadow); sun.shadow.map?.dispose(); sun.shadow.map = null; }
  const psz = 128;
  if (probe && probe.size !== psz) { probe.rt.dispose(); probe = null; }
  if (Q.probe && !probe) { probe = new EnvProbe(renderer, psz); probe.size = psz; }
  if (!Q.probe && probe) { probe.rt.dispose(); probe = null; }
  car?.setEnv(getStudioEnv()); carStudio();
  post.ao = Q.ao; post.fx = Q.fx;
  if (Q.fx) sharedUniforms.uBump.value = Q.fx.bump;
  swapBlockMats();
  if (curBiome) { scene.fog.density = curBiome.fogDensity * (Q.pbr ? 0.62 : 1); applyLightLevels(); }
}

// ---- volume slider (always visible) and mute
function setSound(on) {
  settings.sound = on; store.set('sound', on); audio.setMuted(!on); drawVol();
}
function drawVol() {
  const v = settings.vol;
  $('volFill').style.width = (v * 100) + '%';
  $('volKnob').style.left = (v * 100) + '%';
  $('volTxt').textContent = settings.sound ? 'Volume: ' + Math.round(v * 100) + '%' : 'Muted';
  $('vol').classList.toggle('muted', !settings.sound);
}
{
  const bar = $('volBar');
  let id = null;
  const setFrom = (e) => {
    const r = bar.getBoundingClientRect();
    // the app may be turned sideways on phones: measure along the bar's own axis
    const f = view.rot ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width;
    settings.vol = Math.round(clamp(f, 0, 1) * 100) / 100;
    store.set('vol', settings.vol);
    if (!settings.sound && settings.vol > 0) setSound(true);
    audio.init().then(() => { audio.setVolume(settings.vol); audio.resume(); });
    drawVol();
  };
  bar.addEventListener('pointerdown', (e) => { id = e.pointerId; bar.setPointerCapture(id); setFrom(e); e.preventDefault(); e.stopPropagation(); });
  bar.addEventListener('pointermove', (e) => { if (e.pointerId === id) setFrom(e); });
  const end = (e) => { if (e.pointerId === id) id = null; };
  bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
  $('volIco').onclick = (e) => { setSound(!settings.sound); e.currentTarget.blur(); };
  drawVol();
}
let optionsReturn = 'title';
$('bRace').onclick = () => startRace();
$('bTracks').onclick = () => showScreen('tracks');
$('bGarage').onclick = () => showScreen('garage');
$('bOptions').onclick = () => { optionsReturn = 'title'; $('options').classList.remove('ingame'); showScreen('options'); };
$('bControls').onclick = () => showScreen('controls');
$('tRace').onclick = () => startRace();
$('tBack').onclick = () => showScreen('title');
$('gRace').onclick = () => startRace();
$('gBack').onclick = () => showScreen('title');
$('oDone').onclick = () => closeOptions();
function closeOptions() {
  if (optionsReturn === 'pause') { $('options').classList.add('hidden'); $('options').classList.remove('ingame'); overlay = 'pause'; $('pause').classList.remove('hidden'); }
  else showScreen('title');
}
$('cDone').onclick = () => showScreen('title');
document.addEventListener('pointerdown', (e) => { if (e.target.closest('button, .slot, .tab, .wrow, #legal')) { audio.init().then(() => { audio.setVolume(settings.vol); audio.setMuted(!settings.sound); audio.resume(); audio.uiClick(); }); } });

// ---------------------------------------------------------------- input
const keys = new Set();
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  keys.add(e.code); if (e.key) keys.add('K:' + e.key.toLowerCase());
  audio.resume();
  if (screen !== 'race') { if (e.code === 'Escape' && screen !== 'title' && screen !== 'loading') showScreen('title'); return; }
  // in race: Esc opens the menu; inside the menu it steps back (options -> menu -> race)
  if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); if (overlay === 'options') closeOptions(); else togglePause(); return; }
  if (paused) return;
  if (e.code === 'KeyC') cycleCam();
  if (e.code === 'KeyR') respawn(true);
  if (e.code === 'KeyM') setSound(!settings.sound);
  if (e.code === 'KeyE' && veh) veh.drsReq = !veh.drsReq;
});
window.addEventListener('keyup', (e) => { keys.delete(e.code); if (e.key) { keys.delete('K:' + e.key.toLowerCase()); keys.delete('K:' + e.key); } });
window.addEventListener('blur', () => keys.clear());
// ---- touch: slide-to-steer zone (analog, relative to where the thumb lands) + gas/brake pedals
const touch = { t: false, b: false, s: 0, sOn: false };
if (isTouch) document.documentElement.classList.add('touch');
{
  const zone = $('steerZone'), knob = $('steerKnob'), track = $('steerTrack');
  let sid = null, x0 = 0;
  const span = () => Math.max(60, Math.min(120, view.w * 0.11));
  const setKnob = (v) => { const w = track.clientWidth - 48; knob.style.left = (50 + v * (w / 2) / track.clientWidth * 100) + '%'; };
  zone.addEventListener('pointerdown', (e) => {
    if (sid !== null) return;
    sid = e.pointerId; x0 = appX(e); touch.sOn = true; touch.s = 0;
    zone.setPointerCapture(e.pointerId); zone.classList.add('used'); audio.resume(); e.preventDefault();
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== sid) return;
    const ex = appX(e);
    let d = (ex - x0) / span();
    // let the anchor follow when the thumb goes past full lock, so reversing is instant
    if (d > 1) { x0 = ex - span(); d = 1; } else if (d < -1) { x0 = ex + span(); d = -1; }
    touch.s = Math.sign(d) * Math.pow(Math.abs(d), 1.25);
    setKnob(d);
  });
  const end = (e) => { if (e.pointerId !== sid) return; sid = null; touch.sOn = false; touch.s = 0; setKnob(0); };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  const ped = $('pedals'), ptrs = new Map();
  const which = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.closest('#tB')) return 'b';
    if (el && el.closest('#tT')) return 't';
    const rb = $('tB').getBoundingClientRect(), rt = $('tT').getBoundingClientRect();
    const db = Math.hypot(e.clientX - (rb.left + rb.right) / 2, e.clientY - (rb.top + rb.bottom) / 2);
    const dtt = Math.hypot(e.clientX - (rt.left + rt.right) / 2, e.clientY - (rt.top + rt.bottom) / 2);
    return db < dtt ? 'b' : 't';
  };
  const sync = () => {
    touch.t = touch.b = false;
    for (const k of ptrs.values()) touch[k] = true;
    $('tT').classList.toggle('on', touch.t); $('tB').classList.toggle('on', touch.b);
  };
  ped.addEventListener('pointerdown', (e) => { ped.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, which(e)); sync(); audio.resume(); e.preventDefault(); });
  ped.addEventListener('pointermove', (e) => { if (ptrs.has(e.pointerId)) { ptrs.set(e.pointerId, which(e)); sync(); } });
  const pend = (e) => { ptrs.delete(e.pointerId); sync(); };
  ped.addEventListener('pointerup', pend); ped.addEventListener('pointercancel', pend);
  $('tPause').onclick = () => togglePause();
  $('tCam').onclick = () => cycleCam();
  $('tReset').onclick = () => respawn(true);
  $('tDrs').onclick = () => { if (veh) { veh.drsReq = !veh.drsReq; $('tDrs').classList.toggle('on', veh.drsReq); } };
  const fs = $('fsBtn');
  const fsOK = isTouch && (document.fullscreenEnabled || document.webkitFullscreenEnabled);
  fs.classList.toggle('hidden', !fsOK);
  fs.onclick = async () => {
    try {
      const el = document.documentElement;
      if (document.fullscreenElement || document.webkitFullscreenElement) await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else { await (el.requestFullscreen || el.webkitRequestFullscreen).call(el); try { await window.screen.orientation?.lock?.('landscape'); } catch { /* not allowed */ } }
    } catch { fs.classList.add('hidden'); }
  };
  const orient = () => { $('rotate').classList.add('hidden'); };
  window.addEventListener('resize', orient);
  window.__orient = orient;
}
const inp = { thr: 0, brk: 0, steer: 0, pad: false };
let padY = false;
function readInput(dt) {
  const k = (code, ch) => keys.has(code) || keys.has('K:' + ch);
  let thr = k('KeyW', 'w') || k('ArrowUp', 'arrowup') || touch.t ? 1 : 0;
  let brk = k('KeyS', 's') || k('ArrowDown', 'arrowdown') || keys.has('Space') || touch.b ? 1 : 0;
  let st = (k('KeyD', 'd') || k('ArrowRight', 'arrowright') ? 1 : 0) - (k('KeyA', 'a') || k('ArrowLeft', 'arrowleft') ? 1 : 0);
  let pad = false;
  if (touch.sOn) { pad = true; st = touch.s; }
  if (window.__autoSteer) { pad = true; st = window.__autoSteer(); const pd = window.__autoPedal(); thr = pd[0]; brk = pd[1]; }
  const gps = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const gp of gps) {
    if (!gp) continue;
    const ax = gp.axes[0] || 0, rt = gp.buttons[7]?.value || 0, lt = gp.buttons[6]?.value || 0;
    if (Math.abs(ax) > 0.08 || rt > 0.05 || lt > 0.05) {
      pad = true;
      st = Math.sign(ax) * Math.pow(Math.max(0, Math.abs(ax) - 0.06) / 0.94, 1.6);
      thr = Math.max(thr, rt); brk = Math.max(brk, lt);
    }
    const yb = !!gp.buttons[3]?.pressed; if (yb && !padY) cycleCam(); padY = yb;
    break;
  }
  const r = (cur, tgt, up, down) => cur + clamp(tgt - cur, -down * dt, up * dt);
  const analogPedals = pad && !touch.sOn;
  inp.thr = analogPedals ? thr : r(inp.thr, thr, 6, 10);
  inp.brk = analogPedals ? brk : r(inp.brk, brk, 14, 12);
  inp.steer = touch.sOn ? r(inp.steer, st, 14, 14) : pad ? st : r(inp.steer, st, Math.abs(st) > 0 && Math.sign(st) !== Math.sign(inp.steer) ? 9 : 5, 8);
  inp.pad = pad;
  return inp;
}

// ---------------------------------------------------------------- effects
const skid = (() => {
  const MAX = 3000;
  const pos = new Float32Array(MAX * 4 * 3), col = new Float32Array(MAX * 4);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('a', new THREE.BufferAttribute(col, 1).setUsage(THREE.DynamicDrawUsage));
  const idx = new Uint32Array(MAX * 6);
  for (let i = 0; i < MAX; i++) idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    vertexShader: 'attribute float a; varying float vA; void main(){ vA=a; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'varying float vA; void main(){ gl_FragColor=vec4(0.03,0.03,0.035,vA*0.45); }',
  });
  const mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false;
  let n = 0;
  const last = [null, null, null, null];
  return {
    mesh,
    clear() { pos.fill(0); col.fill(0); g.attributes.position.needsUpdate = true; g.attributes.a.needsUpdate = true; last.fill(null); },
    add(w, x, y, z, rx, rz, a) {
      const p = last[w];
      if (!p || a <= 0) { last[w] = a > 0 ? [x, y, z] : null; return; }
      const dx = x - p[0], dz = z - p[2];
      if (dx * dx + dz * dz < 0.25) return;
      const hw = 0.17, i = n % MAX; n++;
      pos.set([p[0] - rx * hw, p[1], p[2] - rz * hw, p[0] + rx * hw, p[1], p[2] + rz * hw, x + rx * hw, y, z + rz * hw, x - rx * hw, y, z - rz * hw], i * 12);
      col.set([a, a, a, a], i * 4);
      g.attributes.position.needsUpdate = true; g.attributes.a.needsUpdate = true;
      last[w] = [x, y, z];
    },
  };
})();
scene.add(skid.mesh);

const debris = (() => {
  const N = 300;
  const mat = fogPatch(new THREE.MeshLambertMaterial());
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, 0.11, 0.11), mat, N);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false;
  const P = Array.from({ length: N }, () => ({ life: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, s: 1 }));
  const col = new THREE.Color(); let k = 0;
  const dm = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  for (let i = 0; i < N; i++) m.setColorAt(i, col.setRGB(1, 1, 1));
  return {
    mesh: m,
    emit(x, y, z, vx, vz, c, n = 1) {
      for (let j = 0; j < n; j++) {
        const p = P[k = (k + 1) % N];
        p.life = 0.6 + Math.random() * 0.6; p.x = x; p.y = y + 0.1; p.z = z;
        p.vx = vx * 0.3 + (Math.random() - 0.5) * 4; p.vz = vz * 0.3 + (Math.random() - 0.5) * 4; p.vy = 2 + Math.random() * 4;
        p.s = 0.6 + Math.random() * 0.8;
        const v = 0.8 + Math.random() * 0.3;
        m.setColorAt(k, col.setRGB(c[0] * v, c[1] * v, c[2] * v, THREE.SRGBColorSpace));
      }
      m.instanceColor.needsUpdate = true;
    },
    update(dt) {
      for (let i = 0; i < N; i++) {
        const p = P[i];
        if (p.life > 0) { p.life -= dt; p.vy -= 18 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; }
        const s = p.life > 0 ? p.s * Math.min(1, p.life * 3) : 0;
        dm.compose(ps.set(p.x, p.y, p.z), q, sc.set(s, s, s));
        m.setMatrixAt(i, dm);
      }
      m.instanceMatrix.needsUpdate = true;
    },
  };
})();
scene.add(debris.mesh);

const smoke = (() => {
  const N = 240;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const c = cv.getContext('2d'); const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(cv);
  const pos = new Float32Array(N * 3), al = new Float32Array(N), sz = new Float32Array(N);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('al', new THREE.BufferAttribute(al, 1)); g.setAttribute('sz', new THREE.BufferAttribute(sz, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { map: { value: tex }, scale: { value: 500 } },
    vertexShader: 'attribute float al; attribute float sz; varying float vA; uniform float scale; void main(){ vA=al; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize = sz*scale/-mv.z; gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'uniform sampler2D map; varying float vA; void main(){ vec4 t=texture2D(map, gl_PointCoord); gl_FragColor=vec4(vec3(0.82), t.a*vA*0.32); }',
  });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false;
  const P = Array.from({ length: N }, () => ({ life: 0, max: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, a: 1 }));
  let k = 0;
  return {
    pts,
    emit(x, y, z, vx, vz, a) {
      const p = P[k = (k + 1) % N];
      p.max = p.life = 1.2 + Math.random() * 0.8; p.x = x; p.y = y + 0.25; p.z = z; p.vx = vx * 0.4 + (Math.random() - 0.5); p.vz = vz * 0.4 + (Math.random() - 0.5); p.vy = 0.6 + Math.random(); p.a = a;
    },
    update(dt) {
      for (let i = 0; i < N; i++) {
        const p = P[i];
        if (p.life > 0) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vx *= 0.97; p.vz *= 0.97; }
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
        const t = Math.max(0, p.life / p.max);
        al[i] = p.life > 0 ? t * p.a : 0; sz[i] = 1.2 + (1 - t) * 4;
      }
      g.attributes.position.needsUpdate = true; g.attributes.al.needsUpdate = true; g.attributes.sz.needsUpdate = true;
    },
  };
})();
scene.add(smoke.pts);

const weather = (() => {
  const N = 2200, R = 60;
  const pos = new Float32Array(N * 3), vel = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * R * 2; pos[i * 3 + 1] = Math.random() * 40; pos[i * 3 + 2] = (Math.random() - 0.5) * R * 2; vel[i] = 0.6 + Math.random(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.16, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false });
  const p = new THREE.Points(g, mat); p.frustumCulled = false; p.visible = false;
  let kind = null;
  return {
    p,
    set(k) {
      kind = k; p.visible = !!k;
      if (k === 'snow') { mat.color.setHex(0xffffff); mat.size = 0.15; mat.opacity = 0.9; }
      else if (k === 'ash') { mat.color.setHex(0x9a3a14); mat.size = 0.06; mat.opacity = 0.9; }
      else if (k === 'bubbles') { mat.color.setHex(0xd8fbff); mat.size = 0.09; mat.opacity = 0.6; }
      else if (k === 'petals') { mat.color.setHex(0xf6a9cb); mat.size = 0.13; mat.opacity = 0.95; }
    },
    update(dt, cx, cy, cz) {
      if (!kind) return;
      const fall = kind === 'snow' ? 2.0 : kind === 'bubbles' ? -2.6 : kind === 'petals' ? 1.1 : -0.5;
      for (let i = 0; i < N; i++) {
        let x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
        y -= fall * vel[i] * dt; x += Math.sin(y * 0.3 + i) * dt * 0.6;
        const rx = x - cx, rz = z - cz;
        if (rx > R) x -= 2 * R; if (rx < -R) x += 2 * R; if (rz > R) z -= 2 * R; if (rz < -R) z += 2 * R;
        if (y < cy - 8) y += 40; if (y > cy + 32) y -= 40;
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      }
      g.attributes.position.needsUpdate = true;
    },
  };
})();
scene.add(weather.p);

// ---------------------------------------------------------------- race flow
const lap = { n: 0, start: 0, armed: false, prevS: null, last: null, valid: true, splits: [], bestSplits: null, off: 0, curS: 0 };
let raceTime = 0, lights = null;
const bestKey = () => sel.biome + '|' + sel.era;

async function startRace() {
  audio.init().then(() => { audio.setVolume(settings.vol); audio.setMuted(!settings.sound); audio.setEra(sel.era, PHYS[sel.era]); });
  showScreen('loading');
  $('ltitle').textContent = 'Loading terrain';
  $('lstat').textContent = 'Preparing the car…';
  $('lfill').style.width = '5%';
  await ensureWorld();
  await ensureCar();
  if (!car) return;
  audio.setEra(sel.era, PHYS[sel.era]);
  placeCarAt(world.track.N - 30);
  lap.n = 0; lap.armed = false; lap.prevS = null; lap.last = null; lap.valid = true; lap.splits = []; lap.bestSplits = store.get('splits.' + bestKey(), null);
  raceTime = 0; lap.start = 0;
  skid.clear();
  camState.init = false;
  const Q = QUALITY[settings.q];
  let total = null;
  await new Promise((resolve) => {
    const tick = () => {
      const left = world.update(veh.x, veh.z, 45, Q.range, Q.detail, aheadPts(95));
      if (total === null) total = Math.max(1, left);
      $('lfill').style.width = (8 + 92 * (1 - left / total)).toFixed(0) + '%';
      $('lstat').textContent = 'Building terrain… ' + Math.max(0, total - left) + ' / ' + total;
      if (left <= 0) resolve(); else requestAnimationFrame(tick);
    };
    tick();
  });
  setupHud();
  showScreen('race');
  canvas.tabIndex = -1; try { canvas.focus({ preventScroll: true }); } catch { /* ignore */ }
  paused = false;
  ensureRacingLine();
  // no start-light countdown: the car is live straight away
  lights = null;
  $('lights').classList.add('hidden');
  flash('GO!', 1.0, '#80ff20');
  renderLights(0);
}
function renderLights(n) {
  const L = $('lights'); L.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const c = document.createElement('div'); c.className = 'col';
    for (let j = 0; j < 2; j++) { const l = document.createElement('div'); l.className = 'lamp' + (i < n ? ' on' : ''); c.appendChild(l); }
    L.appendChild(c);
  }
}
function respawn(manual) {
  const q = world.track.near(veh.x, veh.z);
  placeCarAt(q.d > 1e8 ? 0 : q.s - 3);
  lap.valid = false;
  if (manual) flash('Respawned', 0.8);
}
function backToTitle() {
  paused = false; overlay = null;
  document.documentElement.classList.remove('menuopen');
  $('options').classList.remove('ingame');
  $('pause').classList.add('hidden');
  $('lights').classList.add('hidden');
  placeCarAt(world.track.N - 30);
  showScreen('title');
  if (audio.ready) audio.update({ rpm: 0, load: 0, boost: 0, lim: 0, gwF: 0, gwA: 0, vol: 0, lp: 1, speed: 0, windMul: 0, slip: 0, onPath: true, offroad: false });
}
let overlay = null; // null | 'pause' | 'options' (in-race menus)
function togglePause() {
  paused = !paused;
  overlay = paused ? 'pause' : null;
  $('pause').classList.toggle('hidden', !paused);
  $('options').classList.add('hidden'); $('options').classList.remove('ingame');
  document.documentElement.classList.toggle('menuopen', paused);
  // the engine falls silent while the game is paused
  if (paused && audio.ready) audio.update({ rpm: veh ? veh.rpm : 0, load: 0, boost: 0, lim: 0, gwF: 0, gwA: 0, vol: 0, lp: 1, speed: 0, windMul: 0, slip: 0, onPath: true, offroad: false });
  if (!paused) { canvas.focus?.({ preventScroll: true }); keys.clear(); }
}
$('menuBtn').onclick = () => { if (!paused) togglePause(); };
$('pResume').onclick = togglePause;
document.addEventListener('visibilitychange', () => { if (document.hidden && screen === 'race' && !paused) togglePause(); });
$('pRestart').onclick = () => { togglePause(); startRace(); };
$('pOptions').onclick = () => { optionsReturn = 'pause'; overlay = 'options'; $('pause').classList.add('hidden'); renderOptions(); $('options').classList.add('ingame'); $('options').classList.remove('hidden'); };
$('pMenu').onclick = backToTitle;

// ---------------------------------------------------------------- HUD
let xpEls = [];
function setupHud() {
  const xp = $('xp'); xp.innerHTML = ''; xpEls = [];
  for (let i = 0; i < 18; i++) { const e = document.createElement('i'); xp.appendChild(e); xpEls.push(e); }
  const t = teamOf();
  $('teamSw').style.background = `linear-gradient(${t.base} 60%, ${t.accent} 60%)`;
  $('teamLbl').textContent = `#${t.num} ${t.name} · ${sel.era}`;
  $('trkName').textContent = '· ' + BIOMES[sel.biome].circuit + ' - ' + BIOMES[sel.biome].name;
  vmax = 0;
  $('camName').textContent = CAMS[settings.cam] + ' · C';
  drawMapBase();
}
let msgTimer = 0;
function flash(text, dur = 1.6, color = '#fff') { const m = $('msg'); m.textContent = text; m.style.color = color; m.classList.add('show'); msgTimer = dur; }
let toastT = 0;
function toast(a, b, tile) {
  $('toastA').textContent = a; $('toastB').textContent = b;
  const g = $('toastIcon').getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 16, 16);
  g.drawImage(atlasImg, 0, tile * 16, 16, 16, 0, 0, 16, 16);
  $('toast').classList.add('show'); toastT = 4;
}
const mapCv = $('map'), mapCtx = mapCv.getContext('2d');
let mapBase = null, mapXf = null;
let tileRGB = null;
function computeTileColors() {
  const n = Object.keys(A).length, c = document.createElement('canvas'); c.width = 16; c.height = 16 * n;
  const g = c.getContext('2d'); g.drawImage(atlasImg, 0, 0);
  const d = g.getImageData(0, 0, 16, 16 * n).data;
  tileRGB = [];
  for (let t = 0; t < n; t++) {
    let r = 0, gg = 0, b = 0, k = 0;
    for (let i = t * 256 * 4; i < (t + 1) * 256 * 4; i += 4) if (d[i + 3] > 128) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; k++; }
    tileRGB.push(k ? [r / k, gg / k, b / k] : [0, 0, 0]);
  }
}
// Minecraft "map item" rendering: one pixel per sample, block colours, north-slope shading,
// tree canopies, water/lava, the pathway, the start line and landmarks.
function drawMapBase() {
  const m = paintMap(world, mapCv.width, true);
  mapBase = m.canvas; mapXf = m.xf;
}
// also used for the track-menu thumbnails (full = false: no sector ticks or landmarks)
function paintMap(world, W, full) {
  if (!tileRGB) computeTileColors();
  const t = world.track, b = t.bounds;
  const pad = full ? 10 : 6, span = Math.max(b.maxX - b.minX, b.maxZ - b.minZ) + 60;
  const sc = (W - 2 * pad) / span;
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const mapXf = (x, z) => [W / 2 + (x - cx) * sc, W / 2 + (z - cz) * sc];
  const c = document.createElement('canvas'); c.width = c.height = W;
  const g = c.getContext('2d');
  const img = g.createImageData(W, W), D = img.data;
  const prev = new Float32Array(W);
  const G = world.treeGrid;
  const leafOf = { oak: A.leaves, bigoak: A.leaves, birch: A.aspen_leaves, spruce: A.pine_needles, giant: A.jungleleaves, jungle: A.jungleleaves, bush: A.jungleleaves, acacia: A.acacia_leaves, palm: A.leaves, cactus: A.cactus, crimson: A.wart, warped: A.warped_wart, pillar: A.basalt, spire: A.netherrack, glow: A.glowstone, spike: A.packed_ice };
  for (let py = -1; py < W; py++) for (let px = 0; px < W; px++) {
    const wx = cx + (px - W / 2) / sc, wz = cz + (py - W / 2) / sc;
    const c0 = world.column(Math.floor(wx), Math.floor(wz));
    const col = { fluid: c0.fluid, h: c0.h, top: c0.top, kind: c0.kind, smooth: c0.smooth };
    const h = col.fluid === 1 ? world.water : col.fluid === 2 ? world.lava : col.h;
    if (py < 0) { prev[px] = h; continue; }
    let tile = col.top;
    if (col.fluid === 1) tile = A.water; else if (col.fluid === 2) tile = A.lava;
    else if (!col.smooth) {
      const tr = world.treeAtCell(Math.floor(wx / G), Math.floor(wz / G));
      if (tr && Math.abs(tr.x - wx) < 3 / Math.max(1, sc) + 2 && Math.abs(tr.z - wz) < 3 / Math.max(1, sc) + 2 && leafOf[tr.type] !== undefined) tile = leafOf[tr.type];
    }
    let rgb = tileRGB[tile] || [128, 128, 128];
    if (world.under) rgb = [rgb[0] * 0.55 + 18, rgb[1] * 0.55 + 60, rgb[2] * 0.55 + 85];   // seen through the sea
    let shade;
    if (col.fluid) shade = 0.86 + 0.06 * ((px + py) & 1);
    else { const dh = h - prev[px]; shade = dh > 0.3 ? 1.0 : dh < -0.3 ? 0.71 : 0.86; if (dh < -3) shade = 0.6; }
    if (col.kind === 1) shade = Math.max(shade, 0.95);
    prev[px] = h;
    const i = (py * W + px) * 4;
    D[i] = rgb[0] * shade; D[i + 1] = rgb[1] * shade; D[i + 2] = rgb[2] * shade; D[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  // crisp outline of the pathway edges
  g.lineJoin = 'round'; g.lineCap = 'round';
  const path = () => { g.beginPath(); for (let i = 0; i <= t.N; i += 3) { const [x, y] = mapXf(t.X[i % t.N], t.Z[i % t.N]); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); };
  path(); g.strokeStyle = 'rgba(40,28,16,0.9)'; g.lineWidth = Math.max(4, 26 * sc); g.stroke();
  path(); g.strokeStyle = 'rgba(232,220,190,0.95)'; g.lineWidth = Math.max(2, 18 * sc); g.stroke();
  if (!full) {
    const [sx, sy] = mapXf(t.X[0], t.Z[0]);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) & 1 ? '#000' : '#fff'; g.fillRect(Math.round(sx) - 4 + i * 2, Math.round(sy) - 4 + j * 2, 2, 2); }
    return { canvas: c, xf: mapXf };
  }
  // sector ticks every quarter lap
  for (let k = 1; k < 4; k++) {
    const i = Math.floor(t.N * k / 4); const [x, y] = mapXf(t.X[i], t.Z[i]);
    g.fillStyle = '#ffff55'; g.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
    g.fillStyle = '#000'; g.font = '10px Tiny5, monospace'; g.fillText('S' + k, Math.round(x) + 4, Math.round(y) - 3);
  }
  // landmarks
  const st = world.structsNear(b.minX - 200, b.minZ - 200, b.maxX + 200, b.maxZ + 200);
  for (const s2 of st) {
    const [x, y] = mapXf(s2.x, s2.z);
    if (x < 4 || y < 4 || x > W - 4 || y > W - 4) continue;
    g.fillStyle = '#000'; g.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    g.fillStyle = { pyramid: '#e0b060', well: '#e0d0a0', temple: '#5a8a3a', boulder: '#999', cabin: '#a0703a', igloo: '#fff', iceberg: '#9cc8ff', bridge: '#6a1a1a', lavaspire: '#ff7020' }[s2.type] || '#fff';
    g.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
  }
  const [sx, sy] = mapXf(t.X[0], t.Z[0]);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) & 1 ? '#000' : '#fff'; g.fillRect(Math.round(sx) - 4 + i * 2, Math.round(sy) - 4 + j * 2, 2, 2); }
  return { canvas: c, xf: mapXf };
}
// build-time helper: one minimap thumbnail per track (saved as thumbs.png next to the game)
async function makeThumbs(size = 160) {
  await atlasReady;
  const out = document.createElement('canvas'); out.width = size * BIOME_ORDER.length; out.height = size;
  const g = out.getContext('2d');
  for (let i = 0; i < BIOME_ORDER.length; i++) {
    const k = BIOME_ORDER[i], w = new World(BIOMES[k], TRACKS[k], A, {});
    g.drawImage(paintMap(w, size, false).canvas, i * size, 0);
    await new Promise((r) => setTimeout(r, 0));
  }
  return out.toDataURL('image/png');
}
const THUMB = 160, thumbsImg = new Image();
let thumbsOk = false;
thumbsImg.onload = () => { thumbsOk = true; if (screen === 'tracks') renderTracks(); };
thumbsImg.src = 'thumbs.png';
function drawMap() {
  mapCtx.clearRect(0, 0, mapCv.width, mapCv.height);
  mapCtx.drawImage(mapBase, 0, 0);
  const [x, y] = mapXf(veh.x, veh.z);
  mapCtx.save(); mapCtx.translate(Math.round(x), Math.round(y)); mapCtx.rotate(-veh.yaw + Math.PI);
  mapCtx.beginPath(); mapCtx.moveTo(0, -9); mapCtx.lineTo(6, 7); mapCtx.lineTo(0, 3); mapCtx.lineTo(-6, 7); mapCtx.closePath();
  const tm = teamOf();
  mapCtx.fillStyle = tm.base; mapCtx.fill(); mapCtx.lineWidth = 2; mapCtx.strokeStyle = '#fff'; mapCtx.stroke();
  mapCtx.restore();
}
let hudAcc = 0, vmax = 0;
function updateHud(dt) {
  hudAcc += dt;
  vmax = Math.max(vmax, Math.abs(veh.u));
  $('vmax').textContent = Math.round(vmax * (settings.units === 'kmh' ? 3.6 : 2.237)) + (settings.units === 'kmh' ? ' km/h' : ' mph');
  const P = veh.P;
  const v = Math.abs(veh.u) * (settings.units === 'kmh' ? 3.6 : 2.237);
  $('spd').textContent = Math.round(v);
  document.querySelector('#bar .u').textContent = settings.units === 'kmh' ? 'KM/H' : 'MPH';
  $('gearLvl').textContent = veh.gear === -1 ? 'R' : (Math.abs(veh.u) < 0.5 && inp.thr < 0.05 && inp.brk < 0.05 ? 'N' : veh.gear);
  $('rpm').textContent = Math.round(veh.rpm / 10) * 10;
  $('thr').firstChild.style.height = (inp.thr * 100).toFixed(0) + '%';
  $('brk').firstChild.style.height = (inp.brk * 100).toFixed(0) + '%';
  const frac = clamp((veh.rpm - P.rpmIdle) / (P.rpmMax - P.rpmIdle), 0, 1);
  const lit = Math.round(frac * xpEls.length);
  $('xp').classList.toggle('flash', veh.rpm > P.rpmMax * 0.975 && (performance.now() % 160 < 80));
  for (let i = 0; i < xpEls.length; i++) xpEls[i].className = i < lit ? (i < 12 ? 'on' : i < 15 ? 'on r' : 'on b') : '';
  let chips = '';
  if (P.mode === 'active') chips += `<span class="chip ${veh.aeroMode > 0.5 ? 'on' : ''}">${veh.aeroMode > 0.5 ? 'X-MODE' : 'Z-MODE'}</span>`;
  if (P.mode === 'drs') chips += `<span class="chip ${veh.drs ? 'on' : veh.drsReq ? 'warn' : ''}">DRS</span>`;
  if (P.mode === 'none') chips += `<span class="chip on">V8</span>`;
  if (P.mode === 'turbo') chips += `<span class="chip ${veh.boost > 0.7 ? 'on' : ''}">BOOST ${Math.round(veh.boost * 100)}</span>`;
  chips += `<span class="chip ${veh.tcCut > 0.05 ? 'warn' : ''}">TC ${settings.tc ? ['', 'MED', 'HI'][settings.tc] : 'OFF'}</span>`;
  $('modes').innerHTML = chips;
  $('lapN').textContent = lap.n ? lap.n : '–';
  const cur = lap.n ? raceTime - lap.start : 0;
  const ce = $('cur'); ce.textContent = fmt(lap.n ? cur : 0); ce.style.color = lap.valid ? '#fff' : '#ff6b6b';
  $('last').textContent = fmt(lap.last);
  $('best').textContent = fmt(bestTimes[bestKey()]);
  if (lap.n && lap.bestSplits && hudAcc > 0.1) {
    hudAcc = 0;
    const ref = lap.bestSplits[Math.floor(lap.curS / 10)];
    const de = $('delta');
    if (ref != null) { const d = cur - ref; de.textContent = (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(2); de.style.color = d >= 0 ? '#ff5555' : '#55ff55'; }
  }
  drawMap();
  if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) $('msg').classList.remove('show'); }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('show'); }
}

// ---------------------------------------------------------------- simulation
const sF = {}, sR = {}, sC = {}, sW = {};
const tmpV = new THREE.Vector3();
let waterT = 0, lastHit = 0;
const AIR = { grip: 0.02, drag: 0 };
const dbg = { air: 0, maxVyErr: 0 };
function simulate(dt) {
  const I = readInput(dt);
  if (lights && !lights.done) {
    lights.t += dt;
    const n = Math.min(5, Math.floor(lights.t));
    if (n !== lights.lit) { lights.lit = n; renderLights(n); audio.beep(n ? 660 : 1320, 0.18); }
    veh.rpm = lerp(veh.rpm, lerp(veh.P.rpmIdle, veh.P.rpmLaunch, I.thr), Math.min(1, dt * 8));
    if (lights.t >= lights.out) {
      lights.done = true; renderLights(0); audio.beep(1320, 0.3, 0.3); flash('LIGHTS OUT AND AWAY WE GO!', 1.8, '#ffff55');
      setTimeout(() => $('lights').classList.add('hidden'), 900);
    }
    world.surface(veh.x, veh.z, sC);
    pushAudio(I);
    syncCarTransform(dt);
    return;
  }
  const steps = Math.ceil(dt / 0.002), h = dt / steps;
  for (let k = 0; k < steps; k++) {
    const sy = Math.sin(veh.yaw), cy = Math.cos(veh.yaw);
    world.surface(veh.x + sy * veh.a, veh.z + cy * veh.a, sF);
    world.surface(veh.x - sy * veh.b, veh.z - cy * veh.b, sR);
    const slope = clamp((sF.y - sR.y) / veh.L, -0.4, 0.4);
    const airborne = !sC.smooth && prevGy != null && carY > prevGy + 0.3;
    if (airborne) dbg.air++;
    veh.step(h, I, airborne ? AIR : sF, airborne ? AIR : sR, airborne ? 0 : slope);
  }
  raceTime += dt;
  syncCarTransform(dt);
  const sy = Math.sin(veh.yaw), cy = Math.cos(veh.yaw), rx = -cy, rz = sy;
  const cg = car.halfWB - veh.a;
  // with walls on the car never leaves the verge, so block collisions are not needed
  if (settings.walls) barrier(dt); else collide(veh.x - sy * cg, veh.z - cy * cg, sy, cy, rx, rz);
  world.surface(veh.x, veh.z, sC);
  if (sC.fluid === 2 && carY < world.lava + 0.4) { flash('Tried to swim in lava', 1.6, '#ffb070'); audio.thump(1); respawn(false); }
  else if (sC.fluid === 1 && carY < world.water) {
    veh.u *= 1 - Math.min(1, 2.2 * dt); veh.v *= 1 - Math.min(1, 3 * dt);
    waterT += dt; if (waterT > 1.8) { flash('Splashdown!', 1.4, '#9fd4ff'); respawn(false); waterT = 0; }
  } else waterT = 0;
  const q = world.track.near(veh.x, veh.z), N = world.track.N;
  if (q.d < 1e8) {
    const s = q.s;
    lap.curS = s; world.track.hint = s;   // figure-8 tracks: keep following the pass the car is on
    if (lap.prevS != null) {
      const ds = s - lap.prevS;
      if (ds < -N / 2) {
        if (lap.n > 0 && lap.armed) completeLap();
        lap.n++; lap.start = raceTime; lap.armed = false; lap.valid = true; lap.splits = []; lap.off = 0;
      } else if (ds > N / 2) lap.armed = false;
      if (s > N * 0.45 && s < N * 0.55) lap.armed = true;
      const k = Math.floor(s / 10);
      if (lap.n && lap.splits[k] == null) lap.splits[k] = raceTime - lap.start;
    }
    lap.prevS = s;
    if (q.d > world.hw + car.halfW + 1.0) { lap.off += dt; if (lap.off > 0.6 && lap.valid && lap.n) { lap.valid = false; flash('Track limits · lap invalidated', 1.6, '#ffb400'); } }
  }
  const spd = Math.abs(veh.u), B = world.B;
  for (const w of car.wheels) {
    tmpV.copy(w.base).applyMatrix4(car.root.matrixWorld);
    const sl = w.front ? veh.slipF : veh.slipR;
    world.surface(tmpV.x, tmpV.z, sW);
    const wi = (w.front ? 0 : 2) + (w.side > 0 ? 1 : 0);
    if (sW.path && sl > 1.25 && spd > 3) {
      skid.add(wi, tmpV.x, sW.y + 0.03, tmpV.z, rx, rz, clamp((sl - 1.25) * 1.5, 0.15, 1));
      if (sl > 1.7 && Math.random() < (sl - 1.6) * 0.35) smoke.emit(tmpV.x, sW.y, tmpV.z, veh.vx, veh.vz, clamp((sl - 1.6) * 0.6, 0.1, 0.7));
    } else skid.add(wi, 0, 0, 0, 0, 0, 0);
    if (!sW.path && spd > 4 && !w.front && Math.random() < spd / 35) debris.emit(tmpV.x, sW.y, tmpV.z, veh.vx, veh.vz, B.particle, 1);
  }
  pushAudio(I);
  for (const e of veh.events) if (e === 'up' || e === 'down') audio.click(sel.era === '2026' ? 0.12 : 0.2, sel.era === '2026' ? 2200 : 1500);
  veh.events.length = 0;
}
function pushAudio(I) {
  if (!audio.ready) return;
  const spd = Math.abs(veh.u);
  const offroad = !sC.path && sC.d > world.hw + 1;
  const gR = veh.gear > 0 ? veh.ratios[veh.gear - 1] : veh.ratios[0];
  const onboard = settings.cam >= 2;
  audio.update({
    rpm: veh.rpm, load: clamp(I.thr * (1 - veh.tcCut) * (veh.shiftT > 0 ? 0.3 : 1), 0, 1), boost: veh.boost, lim: veh.limiter,
    gwF: Math.abs(veh.wr) / (2 * Math.PI) * gR * 28, gwA: (sel.era === '2026' ? 0.012 : 0.016) * Math.min(1, spd / 15),
    vol: 0.9, lp: onboard ? 1.0 : 0.7, speed: spd, windMul: onboard ? 1 : 0.6, slip: Math.max(veh.slipF, veh.slipR), onPath: sC.path !== false, offroad,
  });
}
// points along the track ahead of the car: the next ~4 s of driving (160-360 m)
const aheadArr = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
function aheadPts(speed) {
  const t = world.track, q = t.near(veh.x, veh.z);
  if (q.d > 1e8) return null;
  const span = clamp(speed * 3.8, 160, 360), N = t.N;
  for (let k = 0; k < aheadArr.length; k++) {
    const i = Math.floor(q.s + span * (k + 1) / aheadArr.length) % N;
    aheadArr[k][0] = t.X[i]; aheadArr[k][1] = t.Z[i];
  }
  return aheadArr;
}
function syncCarTransform(dt) {
  const sy = Math.sin(veh.yaw), cy = Math.cos(veh.yaw), rx = -cy, rz = sy;
  const cg = car.halfWB - veh.a;
  const ox = veh.x - sy * cg, oz = veh.z - cy * cg;
  const hw = (car.trackF + car.trackR) / 4;
  const hFL = world.surface(ox + sy * car.frontAxleZ - rx * hw, oz + cy * car.frontAxleZ - rz * hw, sW).y;
  const hFR = world.surface(ox + sy * car.frontAxleZ + rx * hw, oz + cy * car.frontAxleZ + rz * hw, sW).y;
  const hRL = world.surface(ox + sy * car.rearAxleZ - rx * hw, oz + cy * car.rearAxleZ - rz * hw, sW).y;
  const hRR = world.surface(ox + sy * car.rearAxleZ + rx * hw, oz + cy * car.rearAxleZ + rz * hw, sW).y;
  const gy = (hFL + hFR + hRL + hRR) / 4;
  const onTrack = world.surface(veh.x, veh.z, sW).smooth;
  const gVel = dt > 0 && prevGy != null ? clamp((gy - prevGy) / dt, -30, 30) : 0;
  prevGy = gy;
  if (dt > 0 && !onTrack && carY > gy + 0.05) {
    // free flight off the smooth zone: gravity plus aero downforce pulls the car down
    const P = veh.P, gEff = 9.81 + 0.6 * veh.u * veh.u * lerp(P.claZ, P.claX, veh.aeroMode) / P.mass;
    carVy -= gEff * dt; carY += carVy * dt;
    if (carY < gy) { if (carVy < -5) audio.thump(Math.min(1.2, -carVy / 12)); carY = gy; carVy = Math.min(0, gVel); }
  } else { carY = gy; carVy = onTrack ? gVel : clamp(gVel, -30, 1.5); }
  const gPitch = Math.atan2((hFL + hFR) / 2 - (hRL + hRR) / 2, car.frontAxleZ - car.rearAxleZ);
  const gRoll = Math.atan2((hFL + hRL) / 2 - (hFR + hRR) / 2, hw * 2);
  car.root.position.set(ox, carY, oz);
  car.root.rotation.order = 'YXZ';
  car.root.rotation.set(-gPitch, veh.yaw, gRoll);
  if (dt > 0) {
    const P = veh.P;
    const dn = 0.5 * 1.2 * veh.u * veh.u * lerp(P.claZ, P.claX, veh.aeroMode);
    car.chassis.position.y += ((-dn / 900000) - car.chassis.position.y) * Math.min(1, dt * 10);
    car.chassis.rotation.x += (clamp(-veh.ax * 0.0016, -0.03, 0.03) - car.chassis.rotation.x) * Math.min(1, dt * 8);
    car.chassis.rotation.z += (clamp(-veh.ay * 0.0012, -0.025, 0.025) - car.chassis.rotation.z) * Math.min(1, dt * 8);
    for (const w of car.wheels) {
      w.spin.rotation.x += (w.front ? veh.wf : veh.wr) * dt;
      if (w.front) w.steer.rotation.y = -veh.delta;
    }
  } else {
    car.chassis.position.y = 0; car.chassis.rotation.set(0, 0, 0);
    for (const w of car.wheels) { w.spin.rotation.x = 0; w.steer.rotation.y = 0; }
  }
  car.root.updateMatrixWorld(true);
}
function completeLap() {
  const t = raceTime - lap.start;
  lap.last = t;
  const key = bestKey(), prev = bestTimes[key];
  if (lap.valid && (prev == null || t < prev)) {
    bestTimes[key] = t; store.set('best', bestTimes);
    lap.bestSplits = lap.splits.slice(); store.set('splits.' + key, lap.bestSplits);
    toast('Advancement Made!', 'Purple Lap  ' + fmt(t), A.glowstone);
    flash('Lap ' + fmt(t), 2, '#c37bff');
  } else flash((lap.valid ? 'Lap ' : 'Invalid lap ') + fmt(t), 2, lap.valid ? '#fff' : '#ff6b6b');
}
// invisible walls along the outer edge of the verge
function barrier(dt) {
  const t = world.track, q = t.near(veh.x, veh.z);
  if (q.d > 1e8) return;
  const lim = world.runoff(veh.x, veh.z) - car.halfW - 0.2;
  if (q.d <= lim) return;
  const i = q.i;
  let nx = veh.x - t.X[i], nz = veh.z - t.Z[i];
  const al = nx * t.TX[i] + nz * t.TZ[i];
  nx -= al * t.TX[i]; nz -= al * t.TZ[i];
  const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
  const over = q.d - lim;
  veh.x -= nx * over; veh.z -= nz * over;
  // nose pointing into the wall: steer the car back along the wall so it can't get pinned
  const hs = Math.sin(veh.yaw), hc = Math.cos(veh.yaw), hn = hs * nx + hc * nz;
  if (hn > 0.05) {
    const fwd = hs * t.TX[i] + hc * t.TZ[i] >= 0 ? 1 : -1;
    const ty = Math.atan2(t.TX[i] * fwd, t.TZ[i] * fwd);
    let da = ty - veh.yaw; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    veh.yaw += da * Math.min(1, dt * (1.5 + 3 * hn));
  }
  const vn = veh.vx * nx + veh.vz * nz;
  if (vn > 0) {
    // slide along the wall: kill the outward speed, small bounce, some scrub
    let vx = veh.vx - 1.25 * vn * nx, vz = veh.vz - 1.25 * vn * nz;
    const scrub = 1 - Math.min(0.35, vn * 0.025);
    vx *= scrub; vz *= scrub;
    const s = Math.sin(veh.yaw), c = Math.cos(veh.yaw);
    veh.u = vx * s + vz * c; veh.v = -vx * c + vz * s;
    veh.rho *= 0.6;
    veh.wf = veh.u / veh.Rf; veh.wr = veh.u / veh.Rr;
    if (vn > 2.5 && raceTime - lastHit > 0.3) { audio.thump(Math.min(1.2, vn / 14)); lastHit = raceTime; }
  }
}
function collide(ox, oz, sy, cy, rx, rz) {
  const pts = [[0, car.nose - 0.15], [car.halfW - 0.05, car.frontAxleZ], [-car.halfW + 0.05, car.frontAxleZ], [car.halfW - 0.05, car.rearAxleZ], [-car.halfW + 0.05, car.rearAxleZ], [0, car.tail + 0.15], [0.55, 0], [-0.55, 0]];
  for (const [lx, lz] of pts) {
    const px = ox + sy * lz - rx * lx, pz = oz + cy * lz - rz * lx;
    const hit = world.obstacle(px, pz, carY);
    if (hit == null) continue;
    const bx = Math.floor(px) + 0.5, bz = Math.floor(pz) + 0.5;
    let nx = px - bx, nz = pz - bz;
    if (Math.abs(nx) > Math.abs(nz)) { nx = Math.sign(nx); nz = 0; } else { nz = Math.sign(nz); nx = 0; }
    const cxv = veh.x - px, czv = veh.z - pz;
    if (nx * cxv + nz * czv < 0) { const l = Math.hypot(cxv, czv) || 1; nx = cxv / l; nz = czv / l; }
    veh.x += nx * 0.12; veh.z += nz * 0.12;
    const vn = veh.vx * nx + veh.vz * nz;
    if (vn < 0) {
      let vx = veh.vx - 1.25 * vn * nx, vz = veh.vz - 1.25 * vn * nz;
      vx *= 0.82; vz *= 0.82;
      const s = Math.sin(veh.yaw), c = Math.cos(veh.yaw);
      veh.u = vx * s + vz * c; veh.v = -vx * c + vz * s;
      veh.rho += (lx * 0.4 + (Math.random() - 0.5)) * Math.min(1, -vn / 20);
      veh.wf = veh.u / veh.Rf; veh.wr = veh.u / veh.Rr;
      if (raceTime - lastHit > 0.25) { audio.thump(Math.min(1.4, -vn / 14)); lastHit = raceTime; if (-vn > 6) debris.emit(px, carY + 0.3, pz, 0, 0, world.B.particle, 8); }
    }
  }
}

// ---------------------------------------------------------------- camera
const camState = { init: false, pos: new THREE.Vector3(), yaw: 0, look: new THREE.Vector3(), fov: 60 };
// onboard cameras per model: T-cam, cockpit, helmet, nose, rear wing
// onboard cameras from the car's own dimensions: T-cam, cockpit, helmet, nose, rear wing
function onboardPos(c) {
  const cz = c.frontAxleZ - (sel.era === '2026' ? 1.48 : 1.32);
  return [[0, c.height - 0.03, cz - 0.18], [0, 0.8, cz + 0.02], [0, 0.78, c.frontAxleZ + 0.1], [0, c.height + 0.1, c.tail + 0.02]];
}
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
function raceCamera(dt) {
  const yaw = veh.yaw, spd = Math.abs(veh.u), cm = settings.cam, root = car.root;
  look.idle = look.drag ? 0 : look.idle + dt;
  if (look.idle > 0.25) { const k = Math.min(1, dt * 3); look.yaw -= look.yaw * k; look.pitch -= look.pitch * k; }
  if (cm <= 1) {
    if (!camState.init) { camState.yaw = yaw; camState.init = true; camState.pos.set(0, 0, 0); }
    const velYaw = spd > 5 ? Math.atan2(veh.vx, veh.vz) : yaw;
    const tgt = yaw + angDiff(yaw, velYaw) * 0.12;
    camState.yaw += angDiff(camState.yaw, tgt) * Math.min(1, dt * 11);
    // rigid follow: the camera is locked to the car along its path (a positional lag reads as
    // rubber-banding whenever the frame time wobbles); only yaw, accel pull-back and height ease
    camState.acc = lerp(camState.acc || 0, clamp(veh.ax, -55, 30), Math.min(1, dt * 4));
    const d0 = (cm === 0 ? 5.0 : 8.5) + spd * 0.008 + camState.acc * 0.012, hgt = cm === 0 ? 1.45 : 2.6;
    const cyaw = camState.yaw + look.yaw, d = d0 * Math.cos(look.pitch);
    const cx = root.position.x - Math.sin(cyaw) * d, cz = root.position.z - Math.cos(cyaw) * d;
    let cyy = root.position.y + hgt + d0 * Math.sin(look.pitch);
    const ground = world.surface(cx, cz, sW).y;
    const blockTop = world.obstacle(cx, cz, cyy - 0.6);
    cyy = Math.max(cyy, ground + 0.8, blockTop != null ? blockTop + 0.6 : -1e9);
    if (camState.pos.lengthSq() === 0 || Math.abs(camState.pos.y - cyy) > 20) camState.pos.y = cyy;
    camState.pos.set(cx, lerp(camState.pos.y, cyy, Math.min(1, dt * 14)), cz);
    camera.position.copy(camState.pos);
    const la = 4 * Math.max(0, Math.cos(look.yaw));
    camState.look.set(root.position.x + Math.sin(camState.yaw) * la, root.position.y + 0.9, root.position.z + Math.cos(camState.yaw) * la);
    camera.up.set(0, 1, 0);
    camera.lookAt(camState.look);
    camState.fov = lerp(camState.fov, 58 + Math.min(16, spd * 0.13), Math.min(1, dt * 3));
  } else {
    // onboard cameras are fixed to the car (mouse look only moves the chase cameras)
    const p = onboardPos(car)[cm - 2];
    camera.position.set(p[0], p[1], p[2]).applyMatrix4(car.chassis.matrixWorld);
    tmpV.set(p[0], p[1] - 0.06, p[2] + 10).applyMatrix4(car.chassis.matrixWorld);
    camera.up.set(0, 1, 0).applyQuaternion(car.root.quaternion);
    camera.lookAt(tmpV);
    const sh = Math.min(1, spd / 90) * 0.0022 + (sC.path === false ? Math.min(1, spd / 20) * 0.01 : 0);
    camera.rotation.x += (Math.random() - 0.5) * sh; camera.rotation.y += (Math.random() - 0.5) * sh;
    camState.fov = lerp(camState.fov, cm === 3 ? 74 : cm === 5 ? 62 : 66 + Math.min(10, spd * 0.08), Math.min(1, dt * 3));
    camState.init = false;
  }
  camera.fov = camState.fov; camera.updateProjectionMatrix();
}
let menuT = 0;
function menuCamera(dt) {
  menuT += dt;
  const p = car.root.position;
  if (screen === 'garage') {
    const fx = Math.sin(veh.yaw), fz = Math.cos(veh.yaw);
    const base = Math.atan2(sunDir.x * 0.8 + fx, sunDir.z * 0.8 + fz);
    const a = base + Math.sin(menuT * 0.18) * 0.7, r = 6.4;
    camera.position.set(p.x + Math.sin(a) * r, p.y + 1.6, p.z + Math.cos(a) * r);
    camera.lookAt(p.x, p.y + 0.45, p.z);
    camera.translateX(view.w > 760 ? -1.6 : 0);
    camera.fov = 38;
  } else {
    const fx = Math.sin(veh.yaw), fz = Math.cos(veh.yaw);
    const a = Math.atan2(sunDir.x * 0.6 + fx, sunDir.z * 0.6 + fz) + Math.sin(menuT * 0.05) * 0.9, r = 9.5, h = 1.9 + Math.sin(menuT * 0.15) * 0.3;
    const gy = world.surface(p.x + Math.sin(a) * r, p.z + Math.cos(a) * r, sW).y;
    camera.position.set(p.x + Math.sin(a) * r, Math.max(p.y + h, gy + 1.2), p.z + Math.cos(a) * r);
    camera.lookAt(p.x, p.y + 3.4, p.z);
    camera.fov = 58;
  }
  camera.updateProjectionMatrix();
}

// ---------------------------------------------------------------- main loop
let last = performance.now();
const perf = { acc: 0, n: 0, lowered: 0 };
function watchPerf(dt) {
  if (window.__noPerf || screen !== 'race' || paused) { perf.acc = 0; perf.n = 0; return; }
  perf.acc += dt; perf.n++;
  if (perf.acc < 5) return;
  const fps = perf.n / perf.acc;
  perf.acc = 0; perf.n = 0;
  if (fps < 33 && settings.q > 0 && perf.lowered < 2) {
    settings.q--; perf.lowered++; store.set('q3', settings.q); resize(); applyQuality();
    toast('Graphics adjusted', 'Now on ' + QUALITY[settings.q].name + ' for smoother FPS', A.stone);
  }
}
const shFwd = new THREE.Vector3(), shC = new THREE.Vector3(), shR = new THREE.Vector3(), shU = new THREE.Vector3();
function fitShadow(focus) {
  const R = settings.q >= 2 ? 105 : settings.q === 1 ? 80 : 60;
  if (SCAM.right !== R) { SCAM.left = -R; SCAM.right = R; SCAM.top = R; SCAM.bottom = -R; SCAM.updateProjectionMatrix(); }
  shC.copy(focus);
  if (screen === 'race') { camera.getWorldDirection(shFwd); shFwd.y = 0; shFwd.normalize(); shC.addScaledVector(shFwd, R * 0.5); shC.y = focus.y; }
  // snap the light-space centre to whole shadow texels so edges don't shimmer
  const texel = (2 * R) / sun.shadow.mapSize.x;
  shR.crossVectors(sunDir, new THREE.Vector3(0, 1, 0)).normalize(); if (shR.lengthSq() < 0.5) shR.set(1, 0, 0);
  shU.crossVectors(shR, sunDir).normalize();
  const a = Math.round(shC.dot(shR) / texel) * texel, b = Math.round(shC.dot(shU) / texel) * texel, c = shC.dot(sunDir);
  shC.copy(shR).multiplyScalar(a).addScaledVector(shU, b).addScaledVector(sunDir, c);
  sun.position.copy(shC).addScaledVector(sunDir, 350);
  sun.target.position.copy(shC);
  sun.target.updateMatrixWorld();
}
let probeTick = 0;
const hideForProbe = (h) => { if (car) car.root.visible = !h; smoke.pts.visible = !h; };
function frame(now) {
  requestAnimationFrame(frame);
  const rawDt = (now - last) / 1000;
  const dt = Math.min(0.05, rawDt); last = now;
  watchPerf(Math.min(rawDt, 0.25));
  const t = now / 1000;
  sharedUniforms.uTime.value = t; skyU.time.value = t;
  if (mats) mats.water.uniforms.uTime.value = t;
  const Q = QUALITY[settings.q];
  if (!world || !car) { renderer.render(scene, camera); return; }
  if (rLine) rLine.visible = settings.line && screen === 'race';
  if (screen === 'race') {
    if (!paused) simulate(dt);
    raceCamera(dt);
    if (!paused) updateHud(dt);
    world.update(camera.position.x, camera.position.z, Q.budget, Q.range, Q.detail, aheadPts(Math.abs(veh.u)));
    debris.update(paused ? 0 : dt); smoke.update(paused ? 0 : dt);
  } else if (screen !== 'loading') {
    menuCamera(dt);
    world.update(car.root.position.x, car.root.position.z, Q.budget + 2, Math.min(Q.range, 700), Q.detail);
  }
  weather.update(dt, camera.position.x, camera.position.y, camera.position.z);
  skyU.camPos.value.copy(camera.position);
  const focus = car.root.position;
  fitShadow(focus);
  sky.position.copy(camera.position);
  if (seaTop.visible) { seaTop.position.x = camera.position.x; seaTop.position.z = camera.position.z; seaTop.material.uniforms.t.value = t; fogU.uCausT.value = t; }
  // the reflection probe renders one cube face every third frame (it re-draws the world)
  if (probe && screen !== 'loading' && (++probeTick % 3) === 0) { tmpV.copy(focus); tmpV.y += 0.8; probe.update(renderer, scene, tmpV, hideForProbe); }
  if (window.__camHook) window.__camHook(camera, car);
  // the loading screen covers the view: skip drawing so all the time goes into building terrain
  if (screen === 'loading') return;
  post.render(sunDir, sunCol, curBiome?.night);
}

// ---------------------------------------------------------------- boot
(async function boot() {
  resize();
  await atlasReady;
  cssTiles();
  drawLogo();
  showScreen('loading');
  $('ltitle').textContent = "F1 but it's Minecraft";
  $('lstat').textContent = 'Generating ' + BIOMES[sel.biome].circuit + ' - ' + BIOMES[sel.biome].name + '…';
  applyQuality();
  await ensureWorld();
  await ensureCar();
  placeCarAt(world.track.N - 30);
  let total = null;
  await new Promise((resolve) => {
    const tick = () => {
      const left = world.update(car.root.position.x, car.root.position.z, 40, 300, QUALITY[settings.q].detail);
      if (total === null) total = Math.max(1, left);
      $('lfill').style.width = (10 + 90 * (1 - left / total)).toFixed(0) + '%';
      if (left <= 0) resolve(); else requestAnimationFrame(tick);
    };
    tick();
  });
  showScreen('title');
  requestAnimationFrame(frame);
  window.__pp = { makeThumbs, get startLine() { return startLine; }, racingPhases, PHYS, ERAS, ensureCar, placeCarAt, get rl() { return { g: rlGeom, p: rlProfile }; }, dbg, pool, skipLights() { if (lights) lights.t = lights.out; }, get carY() { return carY; }, simulate, get lap() { return lap; }, get veh() { return veh; }, get world() { return world; }, get car() { return car; }, keys, startRace, sel, settings, camera, renderer, scene, showScreen, switchWorld, get screen() { return screen; } };
})();

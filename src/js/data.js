// Static game data: eras, teams (colour-only liveries), car configs, biomes.

// ---- Livery language (evaluated per pixel in normalised car space) ----
//   nz = z / (wheelbase/2)  : +1 front axle, -1 rear axle, nose tip ~ +1.6, rear wing ~ -1.3
//   ny = y / carHeight      : 0 ground, 1 top of airbox
//   ax = |x| / halfWidth    : 0 centreline, 1 outer tyre edge
// A layer paints colour `c` (fading to `c2` toward the rear across its z-range) where:
//   mode 'all'   -> everywhere inside z/x range
//   mode 'above' -> ny > curve(nz)        mode 'below' -> ny < curve(nz)
//   mode 'band'  -> |ny - curve(nz)| < w
//   curve(nz) = y[0] + y[1]*nz + y[2]*nz^2 + y[3]*sin(y[4]*nz + y[5])
// `s` adds a thin pinstripe of colour s.c and width s.w along the layer's boundary.
const L = (o) => ({ mode: 'all', y: [0, 0, 0, 0, 0, 0], w: 0.05, z: [-9, 9], x: [-1, 9], ...o });

// Each team uses its own real car model, exactly as supplied (livery included).
// base/accent are only used for the garage swatches and the HUD.
export const ERAS = {
  '2026': {
    label: '2026', sub: 'Active aero · 50/50 hybrid', engine: '1.6L V6 turbo hybrid',
    teams: [
      { name: 'Bull', short: 'BUL', num: 3, model: 'bull26', base: '#1e2a5e', accent: '#e0242c' },
      { name: 'Laren', short: 'LAR', num: 1, model: 'laren26', base: '#ff8000', accent: '#1c1d21' },
      { name: 'Martin', short: 'MAR', num: 14, model: 'martin26', base: '#00594f', accent: '#cedc00' },
      { name: 'Aud', short: 'AUD', num: 27, model: 'aud26', base: '#b9bcbf', accent: '#d5001c' },
      { name: 'Caddy', short: 'CAD', num: 11, model: 'caddy26', base: '#151515', accent: '#f2f2f2' },
    ],
  },
  '2010': {
    label: '2010', sub: '2.4L V8 · no refuelling', engine: '2.4L V8, 18,000 rpm',
    teams: [
      { name: 'Rrari', short: 'RRA', num: 8, model: 'rrari10', base: '#c4000c', accent: '#f2f2f2' },
      { name: 'Merc', short: 'MER', num: 3, model: 'merc10', base: '#c3c7cb', accent: '#00a19c' },
      { name: 'Will', short: 'WIL', num: 9, model: 'will10', base: '#f2f2f2', accent: '#16206b' },
      { name: 'Saub', short: 'SAU', num: 22, model: 'saub10', base: '#f2f2f2', accent: '#2b2b2b' },
      { name: 'Lot', short: 'LOT', num: 18, model: 'lot10', base: '#0b5c2f', accent: '#f2c400' },
    ],
  },
  '2006': {
    label: '2006', sub: '2.4L V8 · grooved tyres', engine: '2.4L V8, 19,000 rpm',
    teams: [
      { name: 'Nault', short: 'NAU', num: 1, model: 'nault06', base: '#1f8fd6', accent: '#ffd400' },
      { name: 'Rrari', short: 'RRA', num: 5, model: 'rrari06', base: '#c4000c', accent: '#f2f2f2' },
      { name: 'Hond', short: 'HON', num: 12, model: 'hond06', base: '#f2f2f2', accent: '#d0102a' },
    ],
  },
};
export const ERA_ORDER = ['2026', '2010', '2006'];

// Vehicle physics per era. Units SI.
export const PHYS = {
  '2026': {
    mass: 800, cgH: 0.28, frontW: 0.45, izz: 1150,
    powerICE: 400e3, powerERS: 350e3, ersFadeFrom: 290 / 3.6, ersFadeTo: 345 / 3.6,
    rpmIdle: 4200, rpmMax: 12000, rpmLimit: 12400, rpmLaunch: 8500, cyl: 6,
    gearsKmh: [98, 132, 166, 200, 236, 272, 310, 352], shiftTime: 0.035,
    claZ: 4.3, cdaZ: 1.26, claX: 2.7, cdaX: 0.82, aeroFront: 0.4,
    mu: 1.95, brakeTq: 9000, brakeFront: 0.56, engBrake: 0.14,
    turboLag: 0.06, mode: 'active', steerLock: 0.36, lineGrip: 0.78,
  },
  '2010': {
    mass: 620, cgH: 0.28, frontW: 0.46, izz: 1050,
    powerICE: 560e3, powerERS: 0, ersFadeFrom: 999, ersFadeTo: 1000,
    rpmIdle: 5000, rpmMax: 18000, rpmLimit: 18300, rpmLaunch: 11500, cyl: 8,
    gearsKmh: [118, 157, 194, 229, 261, 291, 321], shiftTime: 0.03,
    claZ: 4.1, cdaZ: 1.22, claX: 4.1, cdaX: 1.22, aeroFront: 0.41,
    mu: 1.95, brakeTq: 9000, brakeFront: 0.57, engBrake: 0.14,
    turboLag: 0.02, mode: 'none', steerLock: 0.36, lineGrip: 0.78,
  },
  '2006': {
    mass: 605, cgH: 0.29, frontW: 0.46, izz: 1020,
    powerICE: 565e3, powerERS: 0, ersFadeFrom: 999, ersFadeTo: 1000,
    rpmIdle: 5000, rpmMax: 19000, rpmLimit: 19300, rpmLaunch: 12000, cyl: 8,
    gearsKmh: [116, 155, 191, 226, 258, 288, 318], shiftTime: 0.035,
    claZ: 3.8, cdaZ: 1.2, claX: 3.8, cdaX: 1.2, aeroFront: 0.41,
    mu: 1.8, brakeTq: 8800, brakeFront: 0.58, engBrake: 0.14,
    turboLag: 0.02, mode: 'none', steerLock: 0.37, lineGrip: 0.75,
  },
};

// Look & world parameters per biome.
export const BIOMES = {
  coast: {
    name: 'Shore', track: 'Monaco-shaped', circuit: 'Monaco', seed: 89, icon: 'stone', style: 'shore',
    sunElev: 34, sunAz: 200, sunColor: 0xfff0d8, sun: 4.6,
    zenith: 0x2a6fd6, horizon: 0xcfe2f4, fogDensity: 0.0009, clouds: 0.25, exposure: 1.0,
    hemi: [0xa8ccf4, 0x8a8478, 0.8],
    base: 62, water: 60, grass: 'grass', width: 13,
    path: ['stone', 'gravel', 'stone', 'cobble'],
    offGrip: 0.7, offDrag: 0.3, particle: [0.6, 0.6, 0.62],
    // sea and bay (game coordinates), a sea stack plateau, and the sea cave (metres along the lap)
    sea: [[600, -900], [2200, -900], [2200, 2300], [-700, 2300], [-700, 1000], [440, 1000], [480, 680], [300, 570], [-110, 525], [-222, 470], [-222, 72], [300, 55], [480, -220], [540, -640]],
    rock: [-450, 690, 420, 960],
    tunnel: [740, 1090],
  },
  plains: {
    name: 'Plains', track: 'Silverstone-shaped', circuit: 'Silverstone', seed: 97, icon: 'grass_side',
    sunElev: 30, sunAz: 160, sunColor: 0xfff1e0, sun: 3.4,
    zenith: 0x5a7fae, horizon: 0xd2dbe4, fogDensity: 0.0012, clouds: 0.78, exposure: 1.1,
    hemi: [0xb8c8dc, 0x5a6a3a, 1.0],
    base: 64, water: 58, grass: 'grass',
    path: ['stone', 'stone', 'cobble', 'stone_block', 'stone', 'gravel'],
    offGrip: 0.6, offDrag: 0.55, particle: [0.42, 0.36, 0.26],
  },
  monza: {
    name: 'Forest', track: 'Monza-shaped', circuit: 'Monza', seed: 113, icon: 'darkoak_leaves_o', style: 'darkforest',
    sunElev: 40, sunAz: 140, sunColor: 0xffe6c0, sun: 3.6,
    zenith: 0x3d6eb0, horizon: 0xc4d4c0, fogDensity: 0.0019, fogColor: 0x8fa58a, clouds: 0.4, exposure: 1.15,
    hemi: [0x9cb8a0, 0x3a4a22, 0.85],
    base: 64, water: 57, grass: 'grass',
    path: ['stone', 'stone', 'cobble', 'gravel', 'stone'],
    offGrip: 0.6, offDrag: 0.55, particle: [0.32, 0.26, 0.18],
  },
  spa: {
    name: 'Taiga', track: 'Spa-shaped', circuit: 'Spa', seed: 37, style: 'taiga', icon: 'grass',
    sunElev: 22, sunAz: 230, sunColor: 0xffd29a, sun: 4.4,
    zenith: 0x356fc6, horizon: 0xbdd5ee, fogDensity: 0.0017, clouds: 0.62, exposure: 1.0,
    hemi: [0x9fc0ee, 0x4a5a30, 0.75],
    base: 74, water: 54, grass: 'grass',
    path: ['gravel', 'gravel', 'cobble', 'stone', 'gravel', 'gravel'],
    offGrip: 0.62, offDrag: 0.5, particle: [0.45, 0.36, 0.25],
  },
  suzuka: {
    name: 'Cherry', track: 'Suzuka-shaped', circuit: 'Suzuka', seed: 131, icon: 'cherry_leaves_o', style: 'cherry', bridge: true,
    sunElev: 30, sunAz: 120, sunColor: 0xfff0e6, sun: 4.2,
    zenith: 0x4a86d8, horizon: 0xf0dce6, fogDensity: 0.0012, clouds: 0.35, exposure: 1.05,
    hemi: [0xc0d0f0, 0x6a7a3a, 0.85],
    base: 66, water: 58, grass: 'grass',
    path: ['stone', 'stone', 'cobble', 'stone_block', 'gravel'],
    offGrip: 0.6, offDrag: 0.55, particle: [0.42, 0.34, 0.26],
  },
  mexico: {
    name: 'Peaks', track: 'Mexico City-shaped', circuit: 'Mexico City', seed: 149, icon: 'snow', style: 'peaks',
    sunElev: 46, sunAz: 170, sunColor: 0xfff4e8, sun: 4.8,
    zenith: 0x1f5cc4, horizon: 0xc8daf2, fogDensity: 0.0007, clouds: 0.3, exposure: 0.95,
    hemi: [0xb0c8f0, 0x6a6a60, 0.85],
    base: 120, water: 112, grass: 'grass',
    path: ['stone', 'gravel', 'stone', 'cobble', 'stone_block'],
    offGrip: 0.62, offDrag: 0.5, particle: [0.5, 0.48, 0.45],
  },
  miami: {
    name: 'Ocean', track: 'Miami-shaped', circuit: 'Miami', seed: 167, icon: 'coral_blue', style: 'ocean',
    sunElev: 60, sunAz: 150, sunColor: 0xc8f0ff, sun: 2.6,
    zenith: 0x0a4a66, horizon: 0x14708a, fogDensity: 0.0055, fogColor: 0x0e5f7c, clouds: 0, exposure: 1.0,
    hemi: [0x7fd6f0, 0x1a4a50, 1.6],
    base: 40, water: 72, grass: 'sand', underwater: true,
    path: ['gravel', 'stone', 'gravel', 'cobble', 'gravel'],
    offGrip: 0.55, offDrag: 0.7, particle: [0.8, 0.78, 0.62],
  },
  badlands: {
    name: 'Badlands', track: 'Austin-shaped', circuit: 'Austin', seed: 181, icon: 'tc_orange', style: 'badlands',
    sunElev: 42, sunAz: 210, sunColor: 0xffe2b8, sun: 4.8,
    zenith: 0x2f6ad0, horizon: 0xecd2b4, fogDensity: 0.0009, clouds: 0.15, exposure: 0.95,
    hemi: [0xb0c8f0, 0xa0603a, 0.75],
    base: 64, water: 55, grass: 'red_sand',
    path: ['desert_stone', 'red_sand', 'desert_stone', 'tc_lgray'],
    offGrip: 0.55, offDrag: 0.9, particle: [0.78, 0.45, 0.26],
  },
  vegas: {
    name: 'Nether', track: 'Las Vegas-shaped', circuit: 'Las Vegas', seed: 53, icon: 'netherrack', style: 'nether',
    sunElev: 65, sunAz: 30, sunColor: 0xff7a40, sun: 2.6, night: true,
    zenith: 0x1a0303, horizon: 0x7a1f0c, fogDensity: 0.0026, fogColor: 0x5a160a, clouds: 0, exposure: 1.45,
    hemi: [0xff9a65, 0x7a2a14, 1.7],
    base: 72, water: -999, lava: 44, grass: 'netherrack',
    path: ['nether_brick', 'nether_brick', 'basalt_top', 'nether_brick', 'obsidian'],
    offGrip: 0.66, offDrag: 0.5, particle: [0.45, 0.12, 0.1],
  },
  desert: {
    name: 'Desert', track: 'Lusail-shaped', circuit: 'Lusail', seed: 11, icon: 'desert_sand',
    sunElev: 38, sunAz: 150, sunColor: 0xffe7c4, sun: 4.6,
    zenith: 0x2f6fc4, horizon: 0xe6d6b8, fogDensity: 0.0008, clouds: 0.22, exposure: 0.95,
    hemi: [0xa8c8f0, 0x9a7a48, 0.75],
    base: 64, water: 57, grass: 'desert_sand',
    path: ['desert_sandstone_block', 'sandstone_block', 'desert_sandstone_block', 'sandstone'],
    offGrip: 0.55, offDrag: 0.9, particle: [0.86, 0.72, 0.48],
  },
  jungle: {
    name: 'Jungle', track: 'Interlagos-shaped', circuit: 'Interlagos', seed: 23, icon: 'jungleleaves',
    sunElev: 28, sunAz: 105, sunColor: 0xffe1b5, sun: 4.0,
    zenith: 0x3d7fcc, horizon: 0xcde0cf, fogDensity: 0.0015, clouds: 0.55, exposure: 1.2,
    hemi: [0xa8d0f0, 0x4a6a2a, 1.15],
    base: 66, water: 55, grass: 'litter',
    path: ['cobble', 'mossycobble', 'cobble', 'gravel'],
    offGrip: 0.6, offDrag: 0.55, particle: [0.38, 0.28, 0.18],
  },
  forest: {
    name: 'Meadow', track: 'Red Bull Ring-shaped', circuit: 'Red Bull Ring', seed: 37, icon: 'grass', style: 'meadow',
    sunElev: 32, sunAz: 230, sunColor: 0xfff0d6, sun: 4.6,
    zenith: 0x2f6cd0, horizon: 0xc6dcf2, fogDensity: 0.0011, clouds: 0.35, exposure: 1.0,
    hemi: [0xa8c8f0, 0x5a7a30, 0.8],
    base: 74, water: 54, grass: 'grass',
    path: ['gravel', 'stone', 'cobble', 'stone', 'gravel'],
    offGrip: 0.62, offDrag: 0.5, particle: [0.45, 0.36, 0.25],
  },
  arctic: {
    name: 'Tundra', track: 'Montreal-shaped', circuit: 'Montreal', seed: 71, icon: 'snow',
    sunElev: 13, sunAz: 245, sunColor: 0xffc8a8, sun: 3.6,
    zenith: 0x4677c0, horizon: 0xe8dbe6, fogDensity: 0.0014, clouds: 0.35, exposure: 0.95,
    hemi: [0xb6cdf0, 0xdfe6f2, 0.85],
    base: 66, water: 63, ice: true, grass: 'snow',
    path: ['stone_block', 'gravel', 'stone', 'stone_block', 'cobble'],
    offGrip: 0.45, offDrag: 0.6, particle: [0.92, 0.95, 1.0],
  },
};

// mixed so neighbouring cards in the track menu have different colours
export const BIOME_ORDER = ['coast', 'badlands', 'plains', 'arctic', 'suzuka', 'vegas', 'spa', 'desert', 'monza', 'miami', 'jungle', 'mexico', 'forest'];
export const TRACK_WIDTH = 22;

export const SPLASHES = [
  'Now with downforce!', 'Box, box!', 'Lights out!', 'Also try kerbs!', 'Creeper-free paddock!', 'F1 but it\'s Minecraft!',
  'Mind the gravel!', 'Undercut the Ender Dragon!', 'Push now!', 'Full send!', 'Blocks per hour!',
  'DRS enabled!', 'Purple sector!', 'Tyres are gone!', 'Hammer time!', '100% voxel!',
];

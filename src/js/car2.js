// Real team car models, used exactly as supplied (their own liveries and materials).
// Models are pre-processed (procmodel.mjs): car space (+Z forward, y up, ground at 0,
// origin mid-wheelbase), a 'body' node and four 'wheel_XX' nodes that hold only the parts
// that really rotate, each centred on its axle.
import * as THREE from 'three';

// The car is lit by its own neutral 'studio' light, not the biome's coloured sun, sky and fog,
// so it keeps its real colours everywhere (the nether no longer turns it orange).
// Shadows still come from the world's sun, so it stays grounded.
export const carLightU = {
  uCarSun: { value: new THREE.Color(5, 5, 5) },
  uCarSky: { value: new THREE.Color(0.5, 0.5, 0.5) },
  uCarGround: { value: new THREE.Color(0.15, 0.15, 0.15) },
};
const LIGHTS = THREE.ShaderChunk.lights_fragment_begin
  .replace('getDirectionalLightInfo( directionalLight, directLight );', 'getDirectionalLightInfo( directionalLight, directLight );\n\t\tdirectLight.color = uCarSun;')
  .replace('irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );', 'irradiance += mix( uCarGround, uCarSky, 0.5 * dot( geometryNormal, hemisphereLights[ i ].direction ) + 0.5 );');
function studioLit(mat) {
  mat.fog = false;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, carLightU);
    sh.fragmentShader = 'uniform vec3 uCarSun, uCarSky, uCarGround;\n' + sh.fragmentShader.replace('#include <lights_fragment_begin>', LIGHTS);
  };
  mat.customProgramCacheKey = () => 'carStudio';
}

function shadowTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 64, 4, 32, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 128);
  return new THREE.CanvasTexture(c);
}

export function buildCar(gltf) {
  const root = new THREE.Group();
  const chassis = new THREE.Group(); root.add(chassis);
  const body = new THREE.Group(); chassis.add(body);
  const mats = new Set();
  const prep = (o) => {
    o.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = true; m.receiveShadow = true;
      const list = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of list) {
        if (mats.has(mat)) continue;
        mats.add(mat);
        if (mat.transparent) { mat.depthWrite = false; }
        // alpha-tested decal sheets sit on top of the paint: nudge them forward in depth
        if (mat.alphaTest > 0) { mat.polygonOffset = true; mat.polygonOffsetFactor = -1; mat.polygonOffsetUnits = -1; }
        for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap']) if (mat[k]) mat[k].anisotropy = 16;
        // glossy paint: keep the model's own values but make sure reflections show
        mat.envMapIntensity = 1.0;
        studioLit(mat);
      }
    });
  };
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);
  const wheels = [];
  const box = new THREE.Box3();
  for (const n of [...scene.children]) {
    if (/^wheel_/.test(n.name)) {
      const tag = n.name.slice(6); // FL FR RL RR
      // wheel geometry is in car space; pivot it about its axle centre (node extras)
      const ax = n.userData?.axle ? new THREE.Vector3().fromArray(n.userData.axle) : n.position.clone();
      const steer = new THREE.Group(); steer.position.copy(ax);
      const spin = new THREE.Group(); steer.add(spin);
      // keep the node's own transform (mesh quantization); offset it so the axle is the pivot
      const off = new THREE.Group(); off.position.copy(ax).negate(); off.add(n); spin.add(off);
      chassis.add(steer); prep(n);
      const r = n.userData?.radius || 0.33;
      wheels.push({ steer, spin, front: tag[0] === 'F', side: tag[1] === 'L' ? -1 : 1, r, base: steer.position.clone() });
    } else {
      body.add(n); prep(n);
      box.expandByObject(n);
    }
  }
  const front = wheels.filter((w) => w.front), rear = wheels.filter((w) => !w.front);
  const halfWB = (front[0].base.z - rear[0].base.z) / 2;
  const halfW = Math.max(...wheels.map((w) => Math.abs(w.base.x))) + 0.18;

  const shMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.75, color: 0x000000, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
  shMesh.rotation.x = -Math.PI / 2;
  shMesh.scale.set(halfW * 2 + 0.5, box.max.z - box.min.z + 0.7, 1);
  shMesh.position.set(0, 0.015, (box.max.z + box.min.z) / 2);
  shMesh.renderOrder = 1;
  root.add(shMesh);

  const car = {
    root, chassis, body, wheels, shadow: shMesh, team: null,
    halfWB, halfW, height: box.max.y, length: box.max.z - box.min.z,
    nose: box.max.z, tail: box.min.z,
    frontAxleZ: front[0].base.z, rearAxleZ: rear[0].base.z,
    trackF: Math.abs(front[0].base.x) * 2, trackR: Math.abs(rear[0].base.x) * 2,
    rFront: front[0].r, rRear: rear[0].r,
    setEnv(tex) { for (const m of mats) { m.envMap = tex; m.needsUpdate = true; } },
    setEnvIntensity(v) { for (const m of mats) m.envMapIntensity = v; },
    setLivery(team) { car.team = team; },
    dispose() {
      root.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
      for (const m of mats) { for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap']) m[k]?.dispose?.(); m.dispose(); }
    },
  };
  return car;
}

// Piezas básicas del generador: geometrías cacheadas, mallas y azar con semilla.
import * as THREE from 'three';

export type V3 = [number, number, number];

const cache = new Map<string, THREE.BufferGeometry>();

/** Devuelve una geometría compartida. Las geometrías cacheadas nunca se liberan. */
export function geo(clave: string, crear: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = cache.get(clave);
  if (!g) {
    g = crear();
    g.userData.compartida = true;
    cache.set(clave, g);
  }
  return g;
}

export const esfera = (r: number, w = 20, h = 14) => geo(`esf${r}_${w}`, () => new THREE.SphereGeometry(r, w, h));
export const capsula = (r: number, l: number) => geo(`cap${r}_${l}`, () => new THREE.CapsuleGeometry(r, l, 6, 12));
export const cilindro = (rt: number, rb: number, h: number, seg = 16) =>
  geo(`cil${rt}_${rb}_${h}_${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));
export const caja = (x: number, y: number, z: number) => geo(`caja${x}_${y}_${z}`, () => new THREE.BoxGeometry(x, y, z));
export const cono = (r: number, h: number, seg = 16) => geo(`cono${r}_${h}_${seg}`, () => new THREE.ConeGeometry(r, h, seg));
export const toro = (r: number, t: number, arco = Math.PI * 2, seg = 32) =>
  geo(`toro${r}_${t}_${arco}_${seg}`, () => new THREE.TorusGeometry(r, t, 10, seg, arco));
export const octaedro = (r: number) => geo(`oct${r}`, () => new THREE.OctahedronGeometry(r));

/** Crea una malla con sombras y la coloca. */
export function malla(
  g: THREE.BufferGeometry,
  m: THREE.Material,
  pos: V3 = [0, 0, 0],
  rot: V3 = [0, 0, 0],
  esc: number | V3 = 1,
): THREE.Mesh {
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  if (typeof esc === 'number') mesh.scale.setScalar(esc);
  else mesh.scale.set(...esc);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Grupo con hijos, opcionalmente colocado. */
export function grupo(hijos: THREE.Object3D[] = [], pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], esc = 1) {
  const g = new THREE.Group();
  g.add(...hijos);
  g.position.set(...pos);
  g.rotation.set(...rot);
  g.scale.setScalar(esc);
  return g;
}

const ARRIBA = new THREE.Vector3(0, 1, 0);

/** Cápsula (o cilindro) que une dos puntos. */
export function entre(a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material, forma: 'capsula' | 'cilindro' = 'capsula') {
  const dir = b.clone().sub(a);
  const largo = Math.round(dir.length() * 100) / 100;
  const g = forma === 'capsula' ? capsula(r, Math.max(largo - 2 * r, 0.01)) : cilindro(r, r, largo, 10);
  const mesh = malla(g, m);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(ARRIBA, dir.normalize());
  return mesh;
}

/** Tubo que se estrecha de r0 a r1 a lo largo de una curva (colas, serpientes, cuellos). */
export function tuboAhusado(curvaBase: THREE.Curve<THREE.Vector3>, r0: number, r1: number, m: THREE.Material, segs = 48, radiales = 12) {
  const g = new THREE.TubeGeometry(curvaBase, segs, 1, radiales, false);
  const pos = g.attributes.position;
  const p = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const centro = curvaBase.getPointAt(i / segs);
    const r = r0 + (r1 - r0) * (i / segs);
    for (let j = 0; j <= radiales; j++) {
      const k = i * (radiales + 1) + j;
      p.fromBufferAttribute(pos, k).sub(centro).multiplyScalar(r).add(centro);
      pos.setXYZ(k, p.x, p.y, p.z);
    }
  }
  g.computeVertexNormals();
  const mesh = malla(g, m);
  const tapa = malla(esfera(r0, 12, 8), m);
  tapa.position.copy(curvaBase.getPointAt(0));
  mesh.add(tapa);
  return mesh;
}

export const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export const curva = (puntos: V3[]) => new THREE.CatmullRomCurve3(puntos.map((p) => v(...p)));

/** Generador pseudoaleatorio determinista (mulberry32) a partir de un texto. */
export function azar(semilla: string): () => number {
  let h = 1779033703 ^ semilla.length;
  for (let i = 0; i < semilla.length; i++) {
    h = Math.imul(h ^ semilla.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Libera lo que no es compartido (texturas de placas, geometrías únicas). */
export function liberar(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry && !mesh.geometry.userData.compartida) mesh.geometry.dispose();
    const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
    if (mat?.userData?.unico) {
      mat.map?.dispose();
      mat.dispose();
    }
  });
}

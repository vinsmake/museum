// Catálogo de atributos de las estatuas. Documentación: memories/estatuas.md
//
// Cada atributo dice DÓNDE va (lugar), con qué POSE se sostiene si va en la mano, y cómo se CONSTRUYE.
// Los objetos de mano se construyen verticales con el punto de agarre en el origen.
// Los de lugar 'cuerpo' no se construyen aquí: cambian el cuerpo y los interpreta index.ts.
import * as THREE from 'three';
import { alas, ave, cuadrupedo, type Pose } from './cuerpos';
import type { Materiales } from './materiales';
import {
  caja, capsula, cilindro, cono, curva, entre, esfera, grupo, malla, octaedro, toro, tuboAhusado, v,
} from './primitivas';

export type Lugar = 'mano' | 'manos' | 'cabeza' | 'cara' | 'espalda' | 'pecho' | 'hombro' | 'pies' | 'base' | 'encima' | 'cuerpo';

export interface DefAtributo {
  lugar: Lugar;
  pose?: Pose;
  crear?: (m: Materiales) => THREE.Object3D;
}

// ── Ayudas ──
const vara = (m: Materiales, largo: number, r = 0.018, mat = m.bronce, abajo = 0.5) =>
  malla(cilindro(r, r, largo, 8), mat, [0, largo * (0.5 - abajo), 0]);

const estrella = (m: Materiales, r = 0.06) => malla(octaedro(r), m.fuego);

const llama = (m: Materiales, r = 0.05) =>
  grupo([malla(cono(r, r * 3, 10), m.fuego, [0, r * 1.5, 0]), malla(esfera(r, 10, 8), m.fuego)]);

const corona = (m: Materiales, mat = m.oro, puntas = 0) => {
  const g = grupo([malla(toro(0.105, 0.018, Math.PI * 2, 24), mat, [0, 0, 0], [Math.PI / 2, 0, 0])]);
  for (let i = 0; i < puntas; i++) {
    const a = (i / puntas) * Math.PI * 2;
    g.add(malla(cono(0.018, 0.07, 6), mat, [Math.cos(a) * 0.105, 0.035, Math.sin(a) * 0.105]));
  }
  return g;
};

const mascara = (m: Materiales, boca: 'triste' | 'alegre' | 'neutra') =>
  grupo([
    malla(esfera(0.08, 16, 12), m.piedra, [0, 0, 0], [0, 0, 0], [0.9, 1.15, 0.45]),
    malla(esfera(0.016, 8, 6), m.piedraOscura, [-0.03, 0.025, 0.035]),
    malla(esfera(0.016, 8, 6), m.piedraOscura, [0.03, 0.025, 0.035]),
    malla(toro(0.025, 0.007, Math.PI, 12), m.piedraOscura, [0, boca === 'triste' ? -0.05 : -0.03, 0.035], [0, 0, boca === 'triste' ? 0 : Math.PI]),
  ]);

const vasija = (m: Materiales, mat = m.piedra, alto = 1) =>
  grupo([
    malla(esfera(0.09, 16, 12), mat, [0, 0, 0], [0, 0, 0], [1, 1.2 * alto, 1]),
    malla(cilindro(0.035, 0.05, 0.08, 12), mat, [0, 0.13 * alto, 0]),
    malla(toro(0.04, 0.01, Math.PI * 2, 16), mat, [0, 0.17 * alto, 0], [Math.PI / 2, 0, 0]),
    malla(toro(0.045, 0.01, Math.PI, 12), mat, [0.08, 0.06, 0], [0, 0, -Math.PI / 2]),
  ]);

const animal = (m: Materiales, tipo: 'caballo' | 'perro' | 'leon' | 'cabra' | 'ciervo', tam: number, extra: Partial<Parameters<typeof cuadrupedo>[1]> = {}) => {
  const f = cuadrupedo(m, { tipo, cabezas: [tipo === 'ciervo' ? 'cabra' : tipo === 'cabra' ? 'cabra' : tipo], alas: false, colaSerpiente: false, ...extra });
  f.objeto.scale.setScalar(tam);
  f.objeto.rotation.y = Math.PI / 2;
  return f.objeto;
};

const ola = (m: Materiales) => {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    g.add(malla(toro(0.1, 0.035, Math.PI, 16), m.agua, [Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3], [0, -a, 0]));
  }
  return g;
};

const ojo = (m: Materiales) => grupo([malla(esfera(0.035, 12, 8), m.piedra), malla(esfera(0.015, 8, 6), m.piedraOscura, [0, 0, 0.03])]);

// ── Catálogo ──
export const ATRIBUTOS: Record<string, DefAtributo> = {
  // Armas y herramientas
  lanza: { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([vara(m, 2.0, 0.016, m.bronce, 0.55), malla(cono(0.035, 0.16, 6), m.bronce, [0, 0.98, 0])]) },
  espada: { lugar: 'mano', pose: 'abajo', crear: (m) => grupo([malla(caja(0.05, 0.6, 0.012), m.bronce, [0, -0.33, 0]), malla(caja(0.14, 0.025, 0.03), m.bronce, [0, -0.02, 0])]) },
  'espada-oro': { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([malla(caja(0.05, 0.6, 0.012), m.oro, [0, 0.33, 0]), malla(caja(0.14, 0.025, 0.03), m.oro, [0, 0.02, 0])]) },
  tridente: {
    lugar: 'mano', pose: 'alzado',
    crear: (m) => grupo([
      vara(m, 1.9, 0.017, m.bronce, 0.5),
      malla(caja(0.2, 0.025, 0.025), m.bronce, [0, 0.95, 0]),
      ...[-0.09, 0, 0.09].map((x) => malla(cono(0.022, 0.2, 6), m.bronce, [x, 1.05, 0])),
    ]),
  },
  martillo: { lugar: 'mano', pose: 'abajo', crear: (m) => grupo([vara(m, 0.4, 0.016, m.bronce, 0.9), malla(caja(0.16, 0.08, 0.08), m.bronce, [0, -0.36, 0])]) },
  maza: { lugar: 'mano', pose: 'abajo', crear: (m) => grupo([malla(cilindro(0.06, 0.025, 0.8, 10), m.piedra, [0, -0.35, 0], [Math.PI, 0, 0])]) },
  arco: { lugar: 'mano', pose: 'abajo', crear: (m) => grupo([malla(toro(0.45, 0.012, Math.PI * 0.8, 24), m.bronce, [0.38, 0, 0], [0, 0, Math.PI * 0.6]), entre(v(-0.08, 0.37, 0), v(-0.08, -0.37, 0), 0.003, m.bronce, 'cilindro')]) },
  escudo: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(cilindro(0.3, 0.3, 0.03, 32), m.bronce, [0, 0, 0.04], [Math.PI / 2, 0, 0]), malla(esfera(0.06), m.bronce, [0, 0, 0.07], [0, 0, 0], [1, 1, 0.4])]) },
  hoz: { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([vara(m, 0.35, 0.018, m.piedra, 0.3), malla(toro(0.18, 0.018, Math.PI * 1.1, 24), m.bronce, [-0.17, 0.25, 0], [0, 0, 0])]) },
  remo: { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([vara(m, 1.6, 0.017, m.piedra, 0.65), malla(caja(0.1, 0.35, 0.015), m.piedra, [0, -0.85, 0])]) },
  yunque: { lugar: 'base', crear: (m) => grupo([malla(caja(0.12, 0.18, 0.12), m.bronce, [0, 0.09, 0]), malla(caja(0.3, 0.08, 0.12), m.bronce, [0, 0.22, 0])]) },
  cadenas: {
    lugar: 'manos',
    crear: (m) => {
      const g = new THREE.Group();
      for (let i = 0; i < 5; i++) g.add(malla(toro(0.035, 0.009, Math.PI * 2, 12), m.bronce, [0, -i * 0.06, 0], [0, (i % 2) * Math.PI / 2, 0]));
      return g;
    },
  },
  armadura: { lugar: 'pecho', crear: (m) => malla(capsula(0.16, 0.22), m.bronce, [0, -0.03, -0.11], [0, 0, 0], [1.25, 1, 0.82]) },
  casco: { lugar: 'cabeza', crear: (m) => grupo([malla(esfera(0.12, 16, 10), m.bronce, [0, -0.05, -0.01], [0, 0, 0], [1, 0.9, 1.05]), malla(caja(0.02, 0.1, 0.24), m.bronce, [0, 0.05, -0.02])]) },
  egida: { lugar: 'pecho', crear: (m) => grupo([malla(toro(0.16, 0.03, Math.PI, 20), m.bronce, [0, 0.06, -0.06], [0.2, 0, Math.PI]), malla(esfera(0.04), m.oro, [0, -0.02, 0.01])]) },

  // Cetros y bastones
  cetro: { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([vara(m, 1.5, 0.015, m.oro, 0.45), malla(esfera(0.045), m.oro, [0, 0.85, 0])]) },
  baston: { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([vara(m, 1.15, 0.018, m.piedra, 0.95)]) },
  cayado: { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([vara(m, 1.3, 0.016, m.piedra, 0.75), malla(toro(0.06, 0.016, Math.PI, 12), m.piedra, [0.06, 0.32, 0])]) },
  vara: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([vara(m, 0.5, 0.01, m.oro, 0.2)]) },
  'vara-medir': { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([vara(m, 0.6, 0.012, m.bronce, 0.5), ...[-0.2, 0, 0.2].map((y) => malla(caja(0.04, 0.008, 0.008), m.bronce, [0, y, 0]))]) },
  caduceo: {
    lugar: 'mano', pose: 'alzado',
    crear: (m) => {
      const g = grupo([vara(m, 0.9, 0.014, m.oro, 0.4), malla(esfera(0.03), m.oro, [0, 0.55, 0])]);
      g.add(alas(m, 0.18, 0.6).translateY(0.5));
      for (const s of [1, -1]) {
        const pts: [number, number, number][] = [];
        for (let i = 0; i <= 12; i++) pts.push([Math.sin(i * 0.9) * 0.04 * s, 0.05 + i * 0.035, Math.cos(i * 0.9) * 0.02]);
        g.add(tuboAhusado(curva(pts), 0.01, 0.012, m.oro, 24, 6));
      }
      return g;
    },
  },
  tirso: { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([vara(m, 1.4, 0.014, m.piedra, 0.5), malla(cono(0.06, 0.16, 10), m.piedra, [0, 0.76, 0])]) },
  antorcha: { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([malla(cilindro(0.03, 0.018, 0.55, 8), m.bronce, [0, 0.12, 0]), malla(cilindro(0.045, 0.03, 0.06, 10), m.bronce, [0, 0.4, 0]), llama(m, 0.045).translateY(0.46)]) },
  'antorcha-invertida': { lugar: 'mano', pose: 'abajo', crear: (m) => grupo([malla(cilindro(0.018, 0.03, 0.55, 8), m.bronce, [0, -0.15, 0]), llama(m, 0.04).rotateX(Math.PI).translateY(0.46)]) },

  // Objetos pequeños de mano
  cantaro: { lugar: 'mano', pose: 'cadera', crear: (m) => vasija(m).translateY(-0.04) },
  tinaja: { lugar: 'mano', pose: 'cadera', crear: (m) => grupo([vasija(m, m.piedra, 1.6)]).translateY(-0.06) },
  copa: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(cilindro(0.06, 0.02, 0.06, 16), m.oro, [0, 0.06, 0]), malla(cilindro(0.008, 0.008, 0.05, 6), m.oro, [0, 0.01, 0]), malla(cilindro(0.03, 0.03, 0.008, 12), m.oro, [0, -0.015, 0])]) },
  lira: {
    lugar: 'mano', pose: 'adelante',
    crear: (m) => grupo([
      malla(toro(0.09, 0.012, Math.PI, 16), m.oro, [0, 0.08, 0], [0, 0, 0]),
      malla(caja(0.12, 0.05, 0.03), m.oro, [0, -0.02, 0]),
      ...[-0.04, -0.013, 0.013, 0.04].map((x) => malla(cilindro(0.002, 0.002, 0.13, 4), m.oro, [x, 0.06, 0])),
    ]),
  },
  citara: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(caja(0.18, 0.22, 0.03), m.oro, [0, 0.06, 0]), malla(caja(0.22, 0.02, 0.03), m.oro, [0, 0.19, 0])]) },
  aulos: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(cilindro(0.008, 0.012, 0.35, 6), m.piedra, [0.03, 0.1, 0], [0, 0, -0.2]), malla(cilindro(0.008, 0.012, 0.35, 6), m.piedra, [-0.03, 0.1, 0], [0, 0, 0.2])]) },
  huso: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([vara(m, 0.3, 0.006, m.piedra, 0.3), malla(esfera(0.03), m.piedra, [0, -0.05, 0], [0, 0, 0], [1, 0.4, 1])]) },
  tijeras: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(caja(0.015, 0.16, 0.005), m.bronce, [0.015, 0.08, 0], [0, 0, -0.15]), malla(caja(0.015, 0.16, 0.005), m.bronce, [-0.015, 0.08, 0], [0, 0, 0.15])]) },
  tablilla: { lugar: 'mano', pose: 'adelante', crear: (m) => malla(caja(0.16, 0.22, 0.02), m.piedra, [0, 0.06, 0], [-0.3, 0, 0]) },
  pergamino: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(cilindro(0.025, 0.025, 0.22, 12), m.piedra, [0, 0, 0], [0, 0, Math.PI / 2])]) },
  'rama-fresno': { lugar: 'mano', pose: 'alzado', crear: (m) => grupo([vara(m, 0.7, 0.012, m.piedra, 0.2), ...[0.15, 0.3, 0.45].map((y, i) => malla(esfera(0.05, 10, 8), m.piedra, [i % 2 ? 0.05 : -0.05, y, 0], [0, 0, 0], [1.4, 0.6, 0.6]))]) },
  racimo: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([...[0, 1, 2, 3, 4, 5].map((i) => malla(esfera(0.025, 8, 6), m.piedra, [(i % 3 - 1) * 0.03, -Math.floor(i / 3) * 0.04 - (i === 5 ? 0.04 : 0), 0]))]) },
  granada: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(esfera(0.045), m.piedra), malla(cono(0.018, 0.03, 6), m.piedra, [0, 0.05, 0])]) },
  espigas: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([-0.2, 0, 0.2].map((a) => grupo([vara(m, 0.4, 0.004, m.oro, 0.3), malla(capsula(0.015, 0.08), m.oro, [0, 0.3, 0])], [0, 0, 0], [0, 0, a]))) },
  flores: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([-0.25, 0, 0.25].map((a) => grupo([vara(m, 0.18, 0.004, m.piedra, 0.2), malla(esfera(0.025, 8, 6), m.piedra, [0, 0.15, 0])], [0, 0, 0], [0, 0, a]))) },
  amapola: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([vara(m, 0.25, 0.004, m.piedra, 0.2), malla(esfera(0.03, 10, 8), m.piedra, [0, 0.2, 0], [0, 0, 0], [1, 0.8, 1])]) },
  'manzana-oro': { lugar: 'mano', pose: 'adelante', crear: (m) => malla(esfera(0.04), m.oro, [0, 0.03, 0]) },
  cornucopia: { lugar: 'mano', pose: 'cadera', crear: (m) => grupo([tuboAhusado(curva([[0, -0.15, 0], [0.02, 0.05, 0.03], [0.08, 0.2, 0.05], [0.04, 0.32, 0.12]]), 0.015, 0.08, m.piedra, 24, 12), ...[0, 1, 2].map((i) => malla(esfera(0.035, 10, 8), m.oro, [0.03 + i * 0.025, 0.36, 0.12 + (i - 1) * 0.03]))]) },
  balanza: {
    lugar: 'mano', pose: 'adelante',
    crear: (m) => grupo([
      malla(caja(0.26, 0.01, 0.01), m.bronce, [0, 0.12, 0]), vara(m, 0.12, 0.005, m.bronce, 0),
      ...[-0.12, 0.12].map((x) => grupo([entre(v(0, 0, 0), v(0, -0.1, 0), 0.002, m.bronce, 'cilindro'), malla(cilindro(0.04, 0.03, 0.012, 12), m.bronce, [0, -0.1, 0])], [x, 0.12, 0])),
    ]),
  },
  rayo: {
    lugar: 'mano', pose: 'arriba',
    crear: (m) => grupo([
      malla(caja(0.04, 0.22, 0.02), m.oro, [0.02, 0.1, 0], [0, 0, 0.35]),
      malla(caja(0.04, 0.22, 0.02), m.oro, [-0.01, -0.08, 0], [0, 0, -0.35]),
      malla(cono(0.03, 0.12, 4), m.oro, [0.05, 0.26, 0], [0, 0, 0.35]),
      malla(cono(0.03, 0.12, 4), m.oro, [-0.04, -0.24, 0], [Math.PI, 0, -0.35]),
    ]),
  },
  hilo: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(esfera(0.04, 12, 8), m.piedra), tuboAhusado(curva([[0, 0, 0.02], [0.05, -0.15, 0.08], [0, -0.35, 0.05]]), 0.004, 0.004, m.oro, 16, 4)]) },
  caja: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(caja(0.14, 0.1, 0.1), m.piedra, [0, 0.03, 0]), malla(caja(0.16, 0.02, 0.12), m.piedra, [0, 0.09, 0])]) },
  mascara: { lugar: 'mano', pose: 'adelante', crear: (m) => mascara(m, 'neutra') },
  'mascara-tragica': { lugar: 'mano', pose: 'adelante', crear: (m) => mascara(m, 'triste') },
  'mascara-comica': { lugar: 'mano', pose: 'adelante', crear: (m) => mascara(m, 'alegre') },
  collar: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(toro(0.07, 0.008, Math.PI * 2, 24), m.oro, [0, -0.06, 0]), malla(esfera(0.02), m.oro, [0, -0.13, 0])]) },
  caracola: { lugar: 'mano', pose: 'adelante', crear: (m) => tuboAhusado(curva([[0, -0.08, 0], [0.04, 0, 0.02], [0.02, 0.08, 0.03], [-0.02, 0.14, 0.02]]), 0.04, 0.008, m.piedra, 24, 10) },
  concha: { lugar: 'mano', pose: 'adelante', crear: (m) => malla(esfera(0.07, 16, 8), m.piedra, [0, 0.02, 0], [-0.4, 0, 0], [1, 0.25, 0.9]) },
  'esfera-celeste': { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(esfera(0.1), m.bronce, [0, 0.1, 0]), malla(toro(0.12, 0.006, Math.PI * 2, 32), m.oro, [0, 0.1, 0], [1.1, 0, 0])]) },
  'cabeza-medusa': { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(esfera(0.09), m.piedra, [0, -0.06, 0]), ...[0, 1, 2, 3, 4, 5].map((i) => malla(capsula(0.012, 0.08), m.piedra, [Math.cos(i) * 0.08, -0.08 + Math.sin(i * 2) * 0.03, Math.sin(i) * 0.08], [i, 0, i * 0.7]))]) },
  vellocino: { lugar: 'mano', pose: 'adelante', crear: (m) => malla(esfera(0.12, 12, 8), m.oro, [0, -0.08, 0.04], [0, 0, 0], [1.3, 1.2, 0.3]) },
  colmena: { lugar: 'mano', pose: 'cadera', crear: (m) => grupo([0, 1, 2, 3].map((i) => malla(toro(0.08 - i * 0.015, 0.03, Math.PI * 2, 16), m.piedra, [0, i * 0.045, 0], [Math.PI / 2, 0, 0]))) },
  estrella: { lugar: 'mano', pose: 'arriba', crear: (m) => estrella(m, 0.07).translateY(0.08) },
  llama: { lugar: 'mano', pose: 'adelante', crear: (m) => llama(m, 0.06).translateY(0.05) },
  rueda: { lugar: 'mano', pose: 'abajo', crear: (m) => grupo([malla(toro(0.2, 0.018, Math.PI * 2, 32), m.bronce, [0, -0.12, 0.08]), ...[0, 1, 2, 3].map((i) => malla(caja(0.39, 0.012, 0.012), m.bronce, [0, -0.12, 0.08], [0, 0, (i * Math.PI) / 4]))]) },
  pez: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(esfera(0.06, 12, 8), m.piedra, [0, 0, 0], [0, 0, 0], [0.5, 0.8, 2]), malla(cono(0.04, 0.06, 4), m.piedra, [0, 0, -0.14], [-Math.PI / 2, 0, 0], [1, 1, 0.3])]) },
  'ojo-compartido': { lugar: 'mano', pose: 'adelante', crear: (m) => ojo(m).translateY(0.04) },
  pinzas: {
    lugar: 'manos',
    crear: (m) => grupo([malla(toro(0.07, 0.025, Math.PI * 1.4, 16), m.piedra, [0, 0.05, 0], [0, 0, -0.5]), malla(cono(0.025, 0.08, 6), m.piedra, [0.04, 0.12, 0], [0, 0, -0.6])]),
  },

  // Cabeza y cara
  corona: { lugar: 'cabeza', crear: (m) => corona(m, m.oro, 8) },
  'corona-rayos': { lugar: 'cabeza', crear: (m) => grupo([...Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return malla(cono(0.02, 0.14, 4), m.oro, [Math.cos(a) * 0.11, 0.05, Math.sin(a) * 0.11], [Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6]); }), corona(m, m.oro)]) },
  'corona-laurel': { lugar: 'cabeza', crear: (m) => grupo(Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return malla(esfera(0.022, 8, 6), m.oro, [Math.cos(a) * 0.11, -0.02, Math.sin(a) * 0.11], [0, -a, 0.5], [1.6, 0.5, 0.7]); })) },
  'corona-torre': { lugar: 'cabeza', crear: (m) => grupo([malla(cilindro(0.11, 0.105, 0.09, 16), m.piedra, [0, 0.02, 0]), ...Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return malla(caja(0.04, 0.04, 0.03), m.piedra, [Math.cos(a) * 0.11, 0.08, Math.sin(a) * 0.11], [0, -a, 0]); })]) },
  petaso: { lugar: 'cabeza', crear: (m) => grupo([malla(cilindro(0.17, 0.17, 0.015, 24), m.piedra, [0, -0.03, 0]), malla(esfera(0.1, 16, 8), m.piedra, [0, -0.02, 0], [0, 0, 0], [1, 0.6, 1])]) },
  velo: { lugar: 'cabeza', crear: (m) => malla(esfera(0.13, 16, 12), m.piedra, [0, -0.08, -0.03], [0, 0, 0], [1, 1.3, 1.05]) },
  'velo-estrellado': { lugar: 'cabeza', crear: (m) => grupo([malla(esfera(0.13, 16, 12), m.piedraOscura, [0, -0.08, -0.03], [0, 0, 0], [1, 1.3, 1.05]), ...[0, 1, 2, 3, 4].map((i) => malla(octaedro(0.015), m.oro, [Math.cos(i * 1.3) * 0.12, -0.02 - i * 0.03, Math.sin(i * 1.3) * 0.12 - 0.04]))]) },
  'cuernos-carnero': { lugar: 'cabeza', crear: (m) => grupo([1, -1].map((s) => malla(toro(0.06, 0.02, Math.PI * 1.5, 16), m.piedra, [s * 0.1, -0.06, 0], [0, s * Math.PI / 2, 0]))) },
  'creciente-lunar': { lugar: 'cabeza', crear: (m) => malla(toro(0.09, 0.02, Math.PI, 20), m.oro, [0, 0.02, -0.02], [0, 0, 0]) },
  serpientes: {
    lugar: 'cabeza',
    crear: (m) => grupo(Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return tuboAhusado(curva([[Math.cos(a) * 0.08, -0.04, Math.sin(a) * 0.08], [Math.cos(a) * 0.16, -0.02, Math.sin(a) * 0.16], [Math.cos(a + 0.4) * 0.19, 0.04, Math.sin(a + 0.4) * 0.19]]), 0.016, 0.01, m.piedra, 10, 6);
    })),
  },

  // Espalda, pecho, hombros, pies
  alas: { lugar: 'espalda', crear: (m) => alas(m, 1, 0.5) },
  'manto-estrellado': { lugar: 'espalda', crear: (m) => grupo([malla(cilindro(0.22, 0.34, 1.25, 20), m.piedraOscura, [0, -0.55, -0.04], [0.06, 0, 0], [1, 1, 0.35]), ...[0, 1, 2, 3, 4, 5, 6].map((i) => malla(octaedro(0.018), m.oro, [Math.sin(i * 2.1) * 0.22, -0.2 - i * 0.14, -0.13]))]) },
  'piel-leon': { lugar: 'espalda', crear: (m) => grupo([malla(cilindro(0.2, 0.28, 0.75, 16), m.piedra, [0, -0.2, -0.03], [0.05, 0, 0], [1, 1, 0.35]), malla(esfera(0.1), m.piedra, [0, 0.35, 0.03], [0, 0, 0], [1, 0.8, 1])]) },
  lechuza: { lugar: 'hombro', crear: (m) => grupo([malla(esfera(0.05), m.piedra, [0, 0.05, 0], [0, 0, 0], [1, 1.3, 1]), malla(esfera(0.04), m.piedra, [0, 0.12, 0.005]), malla(esfera(0.012, 8, 6), m.piedraOscura, [-0.015, 0.13, 0.035]), malla(esfera(0.012, 8, 6), m.piedraOscura, [0.015, 0.13, 0.035])]) },
  paloma: { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(esfera(0.04), m.piedra, [0, 0.04, 0], [0, 0, 0], [0.8, 0.8, 1.4]), malla(esfera(0.025), m.piedra, [0, 0.08, 0.05]), malla(cono(0.03, 0.06, 4), m.piedra, [0, 0.05, -0.07], [-1.3, 0, 0], [1, 1, 0.3])]) },
  'sandalias-aladas': { lugar: 'pies', crear: (m) => grupo([1, -1].map((s) => alas(m, 0.14, 0.3).translateX(s * 0.12).translateY(0.08))) },
  garras: { lugar: 'pies', crear: (m) => grupo([-0.1, 0.14].flatMap((x) => [-0.03, 0, 0.03].map((dx) => malla(cono(0.012, 0.06, 6), m.piedraOscura, [x + dx, 0.015, 0.14], [Math.PI / 2, 0, 0])))) },

  // Base del pedestal: compañeros y entorno
  olas: { lugar: 'base', crear: (m) => ola(m) },
  'serpiente-marina': { lugar: 'base', crear: (m) => tuboAhusado(curva([[-0.25, 0.05, 0], [-0.1, 0.18, 0.05], [0.05, 0.05, 0.08], [0.2, 0.2, 0.05], [0.28, 0.3, 0.1]]), 0.04, 0.015, m.piedra, 32, 8) },
  caballo: { lugar: 'base', crear: (m) => animal(m, 'caballo', 0.5) },
  perro: { lugar: 'base', crear: (m) => animal(m, 'perro', 0.55, { cabezas: ['perro', 'perro', 'perro'] }) },
  leon: { lugar: 'base', crear: (m) => animal(m, 'leon', 0.5) },
  leones: { lugar: 'base', crear: (m) => grupo([animal(m, 'leon', 0.4).translateZ(0.25), animal(m, 'leon', 0.4).translateZ(-0.25)]) },
  ciervo: { lugar: 'base', crear: (m) => animal(m, 'ciervo', 0.55) },
  cabra: { lugar: 'base', crear: (m) => animal(m, 'cabra', 0.55) },
  aguila: { lugar: 'base', crear: (m) => ave(m, 0.45).objeto },
  'pavo-real': { lugar: 'base', crear: (m) => grupo([malla(esfera(0.07), m.piedra, [0, 0.2, 0], [0, 0, 0], [1, 1.3, 1]), malla(esfera(0.035), m.piedra, [0, 0.33, 0.04]), entre(v(0, 0.12, 0), v(0, 0, 0.02), 0.012, m.piedra), malla(cilindro(0.3, 0.3, 0.02, 24), m.piedra, [0, 0.3, -0.1], [Math.PI / 2 - 0.3, 0, 0], [1, 1, 1])]) },

  // Encima de la cabeza (Atlas)
  'boveda-celeste': { lugar: 'encima', crear: (m) => grupo([malla(esfera(0.42, 24, 16), m.bronce, [0, 0.38, 0]), malla(toro(0.43, 0.012, Math.PI * 2, 48), m.oro, [0, 0.38, 0], [1.2, 0.3, 0]), malla(toro(0.43, 0.012, Math.PI * 2, 48), m.oro, [0, 0.38, 0], [Math.PI / 2, 0, 0])]) },

  // Modificadores del cuerpo (los interpreta index.ts)
  'ojo-unico': { lugar: 'cuerpo' },
  'cien-brazos': { lugar: 'cuerpo' },
  'cincuenta-cabezas': { lugar: 'cuerpo' },
  'cien-cabezas-serpiente': { lugar: 'cuerpo' },
  'dos-cabezas': { lugar: 'cuerpo' },
  'tres-cabezas': { lugar: 'cuerpo' },
  'muchas-cabezas': { lugar: 'cuerpo' },
  'tres-cuerpos': { lugar: 'cuerpo' },
  'cola-pez': { lugar: 'cuerpo' },
  'cola-serpiente': { lugar: 'cuerpo' },
  'cuerpo-caballo': { lugar: 'cuerpo' },
};

/** Atributos de la lista que el catálogo no conoce (para avisar en el taller). */
export function atributosDesconocidos(lista: string[]): string[] {
  return lista.filter((a) => !(a in ATRIBUTOS));
}

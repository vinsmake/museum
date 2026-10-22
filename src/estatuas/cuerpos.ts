// Cuerpos de las estatuas. Cada constructor devuelve una Figura: el objeto 3D (de pie sobre y=0,
// mirando a +z, ~1.8 de alto a escala 1) y sus anclas, los puntos donde se colocan los atributos.
import * as THREE from 'three';
import type { Materiales } from './materiales';
import {
  caja, capsula, cilindro, cono, curva, entre, esfera, geo, grupo, malla, toro, tuboAhusado, v, type V3,
} from './primitivas';

export type Pose = 'abajo' | 'cadera' | 'alzado' | 'adelante' | 'arriba' | 'hombros';

export type NombreAncla =
  | 'manoD' | 'manoI' | 'cabeza' | 'cara' | 'espalda' | 'pecho' | 'hombro' | 'pies' | 'baseD' | 'baseI' | 'encima';

export interface Figura {
  objeto: THREE.Group;
  anclas: Partial<Record<NombreAncla, THREE.Vector3>>;
}

// ───────────────────────── Figura humana ─────────────────────────

export interface OpcionesHumana {
  genero: 'femenino' | 'masculino' | 'neutro';
  inferior: 'piernas' | 'tunica' | 'cola-pez' | 'cola-serpiente' | 'ninguno';
  himation: boolean; // manto cruzado sobre el torso
  poseD: Pose;
  poseI: Pose;
  barba: boolean;
  ojoUnico: boolean;
  cabezasExtra: number;
  brazosExtra: number; // por lado
  cuellosSerpiente: number;
  inclinacion: number; // giro leve de la cabeza (contrapposto)
}

const POSES: Record<Pose, [V3, V3]> = {
  // [codo, mano] para el lado derecho (x positivo); el izquierdo se refleja.
  abajo: [[0.25, 1.17, -0.02], [0.27, 0.93, 0.04]],
  cadera: [[0.36, 1.2, -0.05], [0.23, 1.0, 0.08]],
  alzado: [[0.27, 1.18, 0], [0.3, 1.12, 0.24]],
  adelante: [[0.26, 1.27, 0.13], [0.24, 1.32, 0.38]],
  arriba: [[0.32, 1.66, 0.02], [0.33, 1.92, 0.06]],
  hombros: [[0.36, 1.62, 0], [0.28, 1.86, 0]],
};

/** Falda o túnica con pliegues verticales que se abren hacia abajo. */
function falda(rArriba: number, rAbajo: number, alto: number, pliegues = 14) {
  return geo(`falda${rArriba}_${rAbajo}_${alto}_${pliegues}`, () => {
    const g = new THREE.CylinderGeometry(rArriba, rAbajo, alto, 64, 8, true);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const t = 0.5 - y / alto; // 0 arriba, 1 abajo
      const f = 1 + 0.07 * t * Math.sin(Math.atan2(z, x) * pliegues);
      pos.setXYZ(i, x * f, y, z * f);
    }
    g.computeVertexNormals();
    return g;
  });
}

function cabezaSerpiente(m: Materiales, pos: THREE.Vector3, dir: THREE.Vector3, r = 0.05) {
  const cabeza = grupo([
    malla(esfera(r, 14, 10), m.piedra, [0, 0, 0], [0, 0, 0], [1, 0.7, 1.5]),
    malla(cono(r * 0.6, r * 1.4, 10), m.piedra, [0, -0.005, r * 1.6], [Math.PI / 2, 0, 0]),
    malla(esfera(r * 0.2, 8, 6), m.piedraOscura, [r * 0.55, r * 0.35, r * 0.6]),
    malla(esfera(r * 0.2, 8, 6), m.piedraOscura, [-r * 0.55, r * 0.35, r * 0.6]),
  ]);
  cabeza.position.copy(pos);
  cabeza.lookAt(pos.clone().add(dir));
  return cabeza;
}

export function humana(m: Materiales, o: OpcionesHumana): Figura {
  const P = m.piedra;
  const fem = o.genero === 'femenino';
  const piezas: THREE.Object3D[] = [];
  const hombroX = fem ? 0.18 : 0.2;

  // Mitad inferior
  if (o.inferior === 'piernas') {
    const r = fem ? 0.068 : 0.075;
    piezas.push(
      entre(v(-0.09, 0.92, 0), v(-0.1, 0.5, 0.01), r, P),
      entre(v(-0.1, 0.5, 0.01), v(-0.1, 0.07, 0), r * 0.85, P),
      entre(v(0.09, 0.9, 0), v(0.12, 0.5, 0.07), r, P),
      entre(v(0.12, 0.5, 0.07), v(0.14, 0.07, -0.02), r * 0.85, P),
      malla(capsula(0.045, 0.12), P, [-0.1, 0.04, 0.05], [Math.PI / 2, 0, 0]),
      malla(capsula(0.045, 0.12), P, [0.14, 0.04, 0.03], [Math.PI / 2, 0, 0.1]),
    );
    if (o.himation) piezas.push(malla(falda(0.19, 0.27, 0.45, 11), P, [0, 0.8, 0], [0, 0.4, -0.06]));
  } else if (o.inferior === 'tunica') {
    piezas.push(
      malla(falda(fem ? 0.16 : 0.18, fem ? 0.3 : 0.32, 1.02, 16), P, [0, 0.51, 0]),
      malla(capsula(0.045, 0.1), P, [-0.08, 0.04, 0.24], [Math.PI / 2, 0, 0]),
      malla(capsula(0.045, 0.1), P, [0.09, 0.04, 0.22], [Math.PI / 2, 0, 0.15]),
    );
  } else if (o.inferior === 'cola-pez') {
    const c = curva([[0, 0.98, 0], [0, 0.6, 0.08], [0.05, 0.25, 0.1], [0.12, 0.08, -0.15], [0.05, 0.12, -0.45], [-0.05, 0.35, -0.6]]);
    piezas.push(tuboAhusado(c, 0.17, 0.04, P));
    const fin = c.getPointAt(1);
    piezas.push(
      malla(cono(0.05, 0.22, 4), P, [fin.x, fin.y + 0.1, fin.z - 0.05], [-0.5, 0, 0.6], [1.6, 1, 0.3]),
      malla(cono(0.05, 0.22, 4), P, [fin.x - 0.08, fin.y + 0.05, fin.z - 0.1], [-0.5, 0, -0.9], [1.6, 1, 0.3]),
    );
  } else if (o.inferior === 'cola-serpiente') {
    const pts: V3[] = [[0, 0.98, 0], [0, 0.6, 0.05], [0.1, 0.25, 0.12]];
    for (let i = 0; i <= 16; i++) {
      const a = 0.9 + i * 0.42;
      const r = 0.38 - i * 0.012;
      pts.push([Math.cos(a) * r, 0.1 + Math.max(0, 0.08 - i * 0.008), Math.sin(a) * r]);
    }
    piezas.push(tuboAhusado(curva(pts), 0.16, 0.03, P, 96));
  }

  // Torso
  piezas.push(
    malla(esfera(0.17), P, [0, 0.98, 0], [0, 0, 0], [fem ? 1.12 : 1.05, 0.8, 0.8]),
    malla(capsula(0.15, 0.28), P, [0, 1.25, 0], [0, 0, 0], [fem ? 1.02 : 1.2, 1, 0.74]),
    malla(cilindro(0.05, 0.055, 0.12, 12), P, [0, 1.5, 0]),
  );
  if (fem) {
    piezas.push(
      malla(esfera(0.062), P, [-0.075, 1.3, 0.085], [0, 0, 0], [1, 0.9, 0.8]),
      malla(esfera(0.062), P, [0.075, 1.3, 0.085], [0, 0, 0], [1, 0.9, 0.8]),
    );
  } else {
    piezas.push(
      malla(esfera(0.08), P, [-0.085, 1.31, 0.06], [0, 0, 0], [1.1, 0.75, 0.6]),
      malla(esfera(0.08), P, [0.085, 1.31, 0.06], [0, 0, 0], [1.1, 0.75, 0.6]),
    );
  }
  if (o.himation) piezas.push(malla(toro(0.2, 0.045, Math.PI * 2, 40), P, [0, 1.22, 0], [0.25, 0, 0.75], [1.05, 1, 0.78]));

  // Cabeza
  const cabeza = grupo([
    malla(esfera(0.105), P, [0, 0, 0], [0, 0, 0], [0.9, 1.12, 0.98]),
    malla(caja(0.03, 0.06, 0.04), P, [0, -0.01, 0.1], [-0.2, 0, 0]),
    fem
      ? malla(esfera(0.115), P, [0, 0.03, -0.03], [0, 0, 0], [1, 1, 1.02])
      : malla(esfera(0.11), P, [0, 0.035, -0.015], [0, 0, 0], [0.98, 0.9, 1]),
  ], [0, 1.64, 0], [0, o.inclinacion, 0]);
  if (fem) cabeza.add(malla(esfera(0.06), P, [0, 0.01, -0.13]));
  if (o.barba) cabeza.add(malla(esfera(0.075), P, [0, -0.09, 0.05], [0.3, 0, 0], [1, 1.25, 0.8]));
  if (o.ojoUnico) {
    cabeza.add(
      malla(esfera(0.034, 12, 8), m.piedraOscura, [0, 0.035, 0.088]),
      malla(toro(0.04, 0.01, Math.PI * 2, 20), P, [0, 0.035, 0.09]),
    );
  }
  piezas.push(cabeza);

  // Cabezas extra (Hecatónquiros)
  for (let i = 0; i < o.cabezasExtra; i++) {
    const a = (i / o.cabezasExtra) * Math.PI * 2;
    const p = v(Math.cos(a) * 0.17, 1.6 + (i % 2) * 0.07, Math.sin(a) * 0.15 - 0.03);
    piezas.push(entre(v(0, 1.48, 0), p, 0.03, P), malla(esfera(0.07), P, [p.x, p.y + 0.04, p.z], [0, 0, 0], [0.9, 1.1, 0.95]));
  }

  // Brazos
  const anclas: Figura['anclas'] = {};
  for (const lado of [1, -1] as const) {
    const pose = lado === 1 ? o.poseD : o.poseI;
    const [codo, mano] = POSES[pose];
    const h = v(lado * hombroX, 1.43, 0);
    const c = v(lado * codo[0], codo[1], codo[2]);
    const mn = v(lado * mano[0], mano[1], mano[2]);
    piezas.push(
      malla(esfera(0.07), P, [h.x, h.y, h.z]),
      entre(h, c, fem ? 0.045 : 0.052, P),
      entre(c, mn, fem ? 0.04 : 0.046, P),
      malla(esfera(0.045), P, [mn.x, mn.y, mn.z], [0, 0, 0], [0.8, 1.1, 0.9]),
    );
    anclas[lado === 1 ? 'manoD' : 'manoI'] = mn;

    // Brazos extra en abanico (Hecatónquiros)
    for (let i = 0; i < o.brazosExtra; i++) {
      const a = -0.6 + (i / Math.max(1, o.brazosExtra - 1)) * 2.2;
      const fin = h.clone().add(v(lado * Math.cos(a) * 0.48, Math.sin(a) * 0.45, -0.05 - (i % 3) * 0.06));
      piezas.push(entre(h, fin, 0.032, P), malla(esfera(0.035), P, [fin.x, fin.y, fin.z]));
    }
  }

  // Cuellos de serpiente que brotan de los hombros (Tifón)
  for (let i = 0; i < o.cuellosSerpiente; i++) {
    const lado = i % 2 ? 1 : -1;
    const k = Math.floor(i / 2);
    const a = 0.35 + k * 0.32;
    const inicio: V3 = [lado * 0.16, 1.48, -0.04];
    const fin: V3 = [lado * (0.25 + Math.cos(a) * 0.3), 1.75 + Math.sin(a) * 0.35, -0.05 + (k % 2) * 0.12];
    const medio: V3 = [(inicio[0] + fin[0]) / 2 + lado * 0.08, (inicio[1] + fin[1]) / 2 - 0.05, inicio[2]];
    piezas.push(tuboAhusado(curva([inicio, medio, fin]), 0.035, 0.025, P, 16, 8));
    piezas.push(cabezaSerpiente(m, v(...fin), v(lado * 0.3, 0.2, 1)));
  }

  anclas.cabeza = v(0, 1.79, 0);
  anclas.cara = v(0, 1.68, 0.1);
  anclas.espalda = v(0, 1.33, -0.12);
  anclas.pecho = v(0, 1.28, 0.12);
  anclas.hombro = v(-hombroX - 0.02, 1.52, 0);
  anclas.pies = v(0, 0, 0.05);
  anclas.encima = v(0, 1.95, 0);
  return { objeto: grupo(piezas), anclas };
}

// ───────────────────────── Alas ─────────────────────────

function geometriaAla() {
  return geo('ala', () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.15, 0.25, 0.45, 0.45, 0.75, 0.42);
    s.bezierCurveTo(0.62, 0.3, 0.6, 0.18, 0.62, 0.05);
    // Borde inferior festoneado (plumas)
    const plumas = 6;
    for (let i = 0; i < plumas; i++) {
      const x0 = 0.62 - (i / plumas) * 0.62;
      const x1 = 0.62 - ((i + 1) / plumas) * 0.62;
      s.quadraticCurveTo((x0 + x1) / 2, -0.22 + i * 0.03, x1, (i + 1) * 0.0);
    }
    return new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 10 });
  });
}

/** Par de alas abiertas; el origen es el punto de unión en la espalda. */
export function alas(m: Materiales, tam = 1, abiertas = 0.5) {
  const g = geometriaAla();
  return grupo([
    malla(g, m.piedra, [0.04, 0, 0], [0, -0.5 - abiertas * 0.5, 0.25], tam),
    malla(g, m.piedra, [-0.04, 0, 0], [0, Math.PI + 0.5 + abiertas * 0.5, 0.25], [tam, tam, tam]),
  ]);
}

// ───────────────────────── Cuadrúpedos ─────────────────────────

export type TipoCabeza = 'caballo' | 'perro' | 'leon' | 'cabra' | 'humana' | 'serpiente';

export interface OpcionesCuadrupedo {
  tipo: 'caballo' | 'perro' | 'leon' | 'cabra' | 'ciervo';
  cabezas: TipoCabeza[];
  alas: boolean;
  colaSerpiente: boolean;
  torsoHumano?: OpcionesHumana; // centauro
}

const MEDIDAS = {
  caballo: { largo: 0.75, alto: 0.95, r: 0.21, pata: 0.05 },
  ciervo: { largo: 0.6, alto: 0.8, r: 0.16, pata: 0.035 },
  perro: { largo: 0.55, alto: 0.55, r: 0.15, pata: 0.045 },
  leon: { largo: 0.65, alto: 0.62, r: 0.19, pata: 0.06 },
  cabra: { largo: 0.5, alto: 0.6, r: 0.15, pata: 0.035 },
};

function cabezaAnimal(m: Materiales, tipo: TipoCabeza): THREE.Group {
  const P = m.piedra;
  switch (tipo) {
    case 'caballo':
      return grupo([
        malla(capsula(0.07, 0.2), P, [0, -0.04, 0.1], [1.2, 0, 0]),
        malla(cono(0.025, 0.08, 8), P, [-0.04, 0.09, -0.02]),
        malla(cono(0.025, 0.08, 8), P, [0.04, 0.09, -0.02]),
      ]);
    case 'perro':
      return grupo([
        malla(esfera(0.09), P),
        malla(capsula(0.045, 0.08), P, [0, -0.02, 0.1], [Math.PI / 2, 0, 0]),
        malla(cono(0.03, 0.09, 8), P, [-0.05, 0.1, -0.01], [0, 0, 0.3]),
        malla(cono(0.03, 0.09, 8), P, [0.05, 0.1, -0.01], [0, 0, -0.3]),
      ]);
    case 'leon':
      return grupo([
        malla(esfera(0.17, 16, 12), P, [0, 0, -0.05], [0, 0, 0], [1, 1, 0.8]),
        malla(esfera(0.1), P, [0, 0, 0.07]),
        malla(capsula(0.05, 0.05), P, [0, -0.03, 0.16], [Math.PI / 2, 0, 0]),
      ]);
    case 'cabra':
      return grupo([
        malla(esfera(0.075), P, [0, 0, 0], [0, 0, 0], [0.9, 1, 1.2]),
        malla(toro(0.07, 0.015, Math.PI, 16), P, [0.04, 0.07, -0.05], [0, Math.PI / 2, 0.4]),
        malla(toro(0.07, 0.015, Math.PI, 16), P, [-0.04, 0.07, -0.05], [0, Math.PI / 2, 0.4]),
        malla(cono(0.025, 0.08, 8), P, [0, -0.09, 0.03], [Math.PI, 0, 0]),
      ]);
    case 'humana':
      return grupo([
        malla(esfera(0.1), P, [0, 0, 0], [0, 0, 0], [0.9, 1.12, 0.98]),
        malla(esfera(0.11), P, [0, 0.03, -0.03]),
        malla(esfera(0.055), P, [0, 0, -0.12]),
      ]);
    case 'serpiente':
      return grupo([cabezaSerpiente(m, v(0, 0, 0), v(0, 0, 1), 0.06)]);
  }
}

export function cuadrupedo(m: Materiales, o: OpcionesCuadrupedo): Figura {
  const P = m.piedra;
  const { largo, alto, r, pata } = MEDIDAS[o.tipo];
  const piezas: THREE.Object3D[] = [malla(capsula(r, largo), P, [0, alto, 0], [Math.PI / 2, 0, 0], [1, 1, 0.95])];

  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      const cadera = v(x * r * 0.55, alto - 0.05, z * largo * 0.45);
      const rodilla = v(x * r * 0.6, alto * 0.48, z * largo * 0.45 + (z > 0 ? 0.03 : -0.04));
      const pie = v(x * r * 0.6, 0.04, z * largo * 0.45 + (z > 0 ? 0.05 : -0.02));
      piezas.push(entre(cadera, rodilla, pata * 1.2, P), entre(rodilla, pie, pata, P));
    }
  }
  if (o.tipo === 'leon') piezas.push(malla(esfera(r * 1.05), P, [0, alto + 0.04, largo * 0.4], [0, 0, 0], [1.1, 1.1, 1.2]));

  // Cola
  const atras = -largo / 2 - r * 0.6;
  if (o.colaSerpiente) {
    const c = curva([[0, alto, atras + 0.05], [0, alto + 0.05, atras - 0.2], [0.05, alto + 0.3, atras - 0.3], [0, alto + 0.45, atras - 0.15]]);
    piezas.push(tuboAhusado(c, 0.05, 0.03, P, 24, 8), cabezaSerpiente(m, c.getPointAt(1), v(0, 0.3, 1), 0.055));
  } else if (o.tipo !== 'ciervo' && o.tipo !== 'cabra') {
    const c = curva([[0, alto + 0.02, atras + 0.08], [0, alto - 0.15, atras - 0.12], [0, alto * 0.45, atras - 0.12]]);
    piezas.push(tuboAhusado(c, o.tipo === 'caballo' ? 0.05 : 0.025, o.tipo === 'caballo' ? 0.035 : 0.02, P, 16, 8));
  }

  const anclas: Figura['anclas'] = {};
  const delante = largo / 2 + r * 0.3;

  if (o.torsoHumano) {
    const torso = humana(m, { ...o.torsoHumano, inferior: 'ninguno' });
    torso.objeto.position.set(0, alto - 0.98 + 0.1, delante - 0.08);
    piezas.push(torso.objeto);
    for (const [k, p] of Object.entries(torso.anclas)) anclas[k as NombreAncla] = p.clone().add(torso.objeto.position);
  } else {
    // Cuellos y cabezas
    const n = o.cabezas.length;
    o.cabezas.forEach((tipo, i) => {
      const x = (i - (n - 1) / 2) * 0.17;
      const largoCuello = o.tipo === 'caballo' ? 0.42 : 0.28;
      const base = v(x * 0.5, alto + 0.08, delante - 0.05);
      const fin = v(x * 1.2, alto + largoCuello, delante + 0.18);
      piezas.push(entre(base, fin, o.tipo === 'caballo' ? 0.085 : 0.075, P));
      const cabeza = cabezaAnimal(m, tipo);
      cabeza.position.copy(fin).add(v(0, 0.04, 0.04));
      cabeza.rotation.y = -x * 1.2;
      piezas.push(cabeza);
      if (i === 0) anclas.cabeza = fin.clone().add(v(0, 0.16, 0));
    });
    anclas.manoD = v(0.15, alto + 0.25, delante + 0.2);
    anclas.manoI = v(-0.15, alto + 0.25, delante + 0.2);
  }

  if (o.alas) {
    const a = alas(m, o.tipo === 'caballo' ? 1.1 : 0.85, 0.2);
    a.position.set(0, alto + r * 0.8, 0.05);
    a.rotation.x = -0.3;
    piezas.push(a);
  }

  anclas.espalda = anclas.espalda ?? v(0, alto + r, 0);
  anclas.pies = v(0, 0, 0);
  return { objeto: grupo(piezas), anclas };
}

// ───────────────────────── Ave (águila) ─────────────────────────

export function ave(m: Materiales, tam = 1): Figura {
  const P = m.piedra;
  const g = grupo([
    malla(esfera(0.25, 16, 10), m.pedestal, [0, 0.12, 0], [0, 0, 0], [1.2, 0.5, 1]),
    malla(esfera(0.16), P, [0, 0.55, 0], [0.3, 0, 0], [0.85, 1.3, 0.9]),
    malla(esfera(0.09), P, [0, 0.82, 0.07]),
    malla(cono(0.035, 0.1, 8), m.oro, [0, 0.79, 0.18], [Math.PI / 2 + 0.5, 0, 0]),
    malla(cono(0.12, 0.3, 6), P, [0, 0.35, -0.17], [-2.6, 0, 0], [1, 1, 0.3]),
    entre(v(-0.06, 0.4, 0), v(-0.06, 0.24, 0.03), 0.03, P),
    entre(v(0.06, 0.4, 0), v(0.06, 0.24, 0.03), 0.03, P),
  ], [0, 0, 0], [0, 0, 0], tam);
  const a = alas(m, 0.9 * tam, 0.9);
  a.position.set(0, 0.62 * tam, -0.04);
  g.add(a);
  return { objeto: g, anclas: { cabeza: v(0, 0.95 * tam, 0), espalda: v(0, 0.6 * tam, -0.1), pies: v(0, 0, 0) } };
}

// ───────────────────────── Serpiente ─────────────────────────

export function serpiente(m: Materiales, cabezas = 1, conArbol = false): Figura {
  const P = m.piedra;
  const piezas: THREE.Object3D[] = [];
  const pts: V3[] = [];
  const vueltas = 2.6;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const a = t * vueltas * Math.PI * 2;
    const r = conArbol ? 0.16 : 0.42 - t * 0.2;
    pts.push([Math.cos(a) * r, 0.08 + t * (conArbol ? 1.0 : 0.35), Math.sin(a) * r]);
  }
  const ultimo = pts[pts.length - 1];
  const cima: V3 = [ultimo[0] * 0.5, ultimo[1] + 0.35, 0.1];
  pts.push(cima);
  piezas.push(tuboAhusado(curva(pts.slice().reverse()), 0.03, 0.09, P, 120, 12));

  if (conArbol) {
    piezas.push(
      malla(cilindro(0.07, 0.11, 1.5, 10), m.pedestal, [0, 0.75, 0]),
      malla(esfera(0.42, 14, 10), m.piedra, [0, 1.65, 0], [0, 0, 0], [1, 0.75, 1]),
    );
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      piezas.push(malla(esfera(0.055), m.oro, [Math.cos(a) * 0.38, 1.5 + (i % 2) * 0.12, Math.sin(a) * 0.38]));
    }
  }

  const n = Math.max(1, cabezas);
  for (let i = 0; i < n; i++) {
    const a = n === 1 ? 0 : -1.1 + (i / (n - 1)) * 2.2;
    const fin = v(cima[0] + Math.sin(a) * 0.35 * (n > 1 ? 1 : 0), cima[1] + 0.25 + (n > 1 ? Math.cos(a) * 0.3 : 0.1), cima[2] + 0.15);
    piezas.push(tuboAhusado(curva([cima, [(cima[0] + fin.x) / 2, (cima[1] + fin.y) / 2 + 0.05, cima[2] + 0.02], [fin.x, fin.y, fin.z]]), 0.06, 0.045, P, 16, 10));
    piezas.push(cabezaSerpiente(m, fin, v(Math.sin(a) * 0.4, 0.1, 1), 0.065));
  }
  return { objeto: grupo(piezas), anclas: { cabeza: v(cima[0], cima[1] + 0.6, cima[2]), pies: v(0, 0, 0), baseD: v(0.5, 0, 0.2) } };
}

// ───────────────────────── Abstracta ─────────────────────────

/** Potencias primordiales sin forma humana: tres composiciones elegidas por la semilla. */
export function abstracta(m: Materiales, rnd: () => number, oscura = false): Figura {
  const M = oscura ? m.piedraOscura : m.piedra;
  const piezas: THREE.Object3D[] = [];
  const variante = Math.floor(rnd() * 3);
  if (variante === 0) {
    const p = 2 + Math.floor(rnd() * 3);
    const q = 3 + Math.floor(rnd() * 3);
    piezas.push(malla(geo(`nudo${p}_${q}`, () => new THREE.TorusKnotGeometry(0.42, 0.09, 160, 14, p, q)), M, [0, 1.05, 0], [rnd(), rnd(), 0]));
    piezas.push(malla(cilindro(0.05, 0.12, 0.6, 12), M, [0, 0.3, 0]));
  } else if (variante === 1) {
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      piezas.push(malla(toro(0.5 - t * 0.32, 0.035, Math.PI * (1.2 + rnd() * 0.7), 40), M, [0, 0.25 + t * 1.45, 0], [Math.PI / 2 + (rnd() - 0.5) * 0.6, 0, i * 0.9]));
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const h = 0.4 + rnd() * 1.1;
      piezas.push(malla(caja(0.18 + rnd() * 0.12, h, 0.18 + rnd() * 0.12), M, [(rnd() - 0.5) * 0.5, h / 2, (rnd() - 0.5) * 0.45], [0, rnd() * Math.PI, (rnd() - 0.5) * 0.25]));
    }
  }
  return { objeto: grupo(piezas), anclas: { cabeza: v(0, 1.8, 0), pies: v(0, 0, 0), espalda: v(0, 1.2, -0.2) } };
}

// ───────────────────────── Astral ─────────────────────────

export function astral(m: Materiales, rnd: () => number): Figura {
  const piezas: THREE.Object3D[] = [malla(cilindro(0.03, 0.08, 1.2, 10), m.piedra, [0, 0.6, 0])];
  for (let i = 0; i < 9; i++) {
    const p = v((rnd() - 0.5) * 0.9, 1.0 + rnd() * 0.9, (rnd() - 0.5) * 0.5);
    piezas.push(entre(v(0, 1.15, 0), p, 0.012, m.bronce, 'cilindro'), malla(geo('estrellaAstral', () => new THREE.OctahedronGeometry(0.07)), m.fuego, [p.x, p.y, p.z], [rnd(), rnd(), 0]));
  }
  return { objeto: grupo(piezas), anclas: { cabeza: v(0, 2, 0), pies: v(0, 0, 0) } };
}

// ───────────────────────── Dios río (recostado) ─────────────────────────

export function rio(m: Materiales, rnd: () => number): Figura {
  const P = m.piedra;
  const piezas: THREE.Object3D[] = [
    // Piernas extendidas bajo el manto
    malla(capsula(0.17, 0.75), P, [0.18, 0.2, 0.05], [0, 0, Math.PI / 2 - 0.05], [1, 1, 0.85]),
    malla(falda(0.17, 0.26, 0.7, 12), P, [0.25, 0.22, 0.06], [0, 0, Math.PI / 2]),
    // Torso reclinado apoyado en el codo
    malla(capsula(0.15, 0.3), P, [-0.38, 0.5, 0], [0, 0, -0.55], [1.15, 1, 0.78]),
    malla(esfera(0.17), P, [-0.2, 0.28, 0], [0, 0, 0], [1.2, 0.8, 0.85]),
    malla(cilindro(0.05, 0.055, 0.12, 12), P, [-0.5, 0.73, 0], [0, 0, -0.4]),
    // Brazo de apoyo sobre el cántaro
    entre(v(-0.5, 0.62, -0.1), v(-0.6, 0.32, -0.12), 0.05, P),
    entre(v(-0.4, 0.62, 0.12), v(-0.1, 0.45, 0.2), 0.05, P),
  ];
  const cabeza = grupo([
    malla(esfera(0.105), P, [0, 0, 0], [0, 0, 0], [0.9, 1.12, 0.98]),
    malla(esfera(0.11), P, [0, 0.035, -0.015], [0, 0, 0], [0.98, 0.9, 1]),
    malla(esfera(0.075), P, [0, -0.09, 0.05], [0.3, 0, 0], [1, 1.3, 0.8]),
    malla(caja(0.03, 0.06, 0.04), P, [0, -0.01, 0.1]),
  ], [-0.56, 0.86, 0.02], [0, 0.5 + rnd() * 0.3, -0.25]);
  // Cántaro volcado del que mana el agua
  const cantaro = grupo([
    malla(esfera(0.13, 16, 12), P, [0, 0, 0], [0, 0, 0], [1, 1.2, 1]),
    malla(cilindro(0.05, 0.07, 0.12, 12), P, [0, 0.17, 0]),
  ], [-0.66, 0.18, -0.12], [0, 0, 1.9]);
  const agua = tuboAhusado(curva([[-0.83, 0.13, -0.1], [-0.92, 0.07, 0.05], [-0.95, 0.02, 0.25]]), 0.04, 0.09, m.agua, 16, 10);
  piezas.push(cabeza, cantaro, agua, malla(cilindro(0.22, 0.22, 0.015, 24), m.agua, [-0.9, 0.008, 0.25]));
  return {
    objeto: grupo(piezas),
    anclas: { cabeza: v(-0.56, 1.0, 0), manoD: v(-0.1, 0.45, 0.22), pies: v(0, 0, 0), baseD: v(0.7, 0, 0.25) },
  };
}

// Generador procedural de estatuas. Documentación: memories/estatuas.md
//
//   crearEstatua(datos, { piedra }) -> THREE.Group de pie sobre y=0, mirando a +z, con pedestal y placa.
//
// Funciona igual para cualquier mitología: solo depende de `estatua` en los datos de cada ser.
import * as THREE from 'three';
import { ATRIBUTOS } from './atributos';
import {
  abstracta, astral, ave, cuadrupedo, humana, rio, serpiente,
  type Figura, type NombreAncla, type OpcionesHumana, type Pose, type TipoCabeza,
} from './cuerpos';
import { materiales, type Materiales } from './materiales';
import { ALTO_PEDESTAL, pedestal } from './pedestal';
import { azar, grupo, liberar } from './primitivas';

export { atributosDesconocidos, ATRIBUTOS } from './atributos';
export { liberar };

export const FIGURAS = ['humana', 'alada', 'monstruo', 'hibrida', 'animal', 'serpentina', 'abstracta', 'astral', 'rio', 'grupo'] as const;

export interface DatosEstatua {
  slug: string;
  nombre: string;
  nombreOriginal?: string;
  categoria?: string;
  figura: string;
  genero: 'femenino' | 'masculino' | 'neutro';
  escala: number;
  atributos: string[];
}

export interface OpcionesEstatua {
  piedra?: string; // color de la piedra (tema de la mitología)
  pedestal?: boolean; // por defecto true
}

const BARBUDOS = new Set(['titan', 'primordial', 'raza', 'monstruo']);

/** Reparte los objetos de mano entre las dos manos y decide la pose de cada brazo. */
function repartirManos(atributos: string[]) {
  const asignacion = new Map<string, 'manoD' | 'manoI'>();
  const sobrantes: string[] = [];
  let poseD: Pose = 'abajo';
  let poseI: Pose = 'abajo';
  const deMano = atributos.filter((a) => ATRIBUTOS[a]?.lugar === 'mano');
  // El escudo va siempre a la izquierda
  deMano.sort((a, b) => Number(a === 'escudo') - Number(b === 'escudo'));
  for (const a of deMano) {
    const pose = ATRIBUTOS[a].pose ?? 'adelante';
    if (!asignacion.size && a !== 'escudo') {
      asignacion.set(a, 'manoD');
      poseD = pose;
    } else if (![...asignacion.values()].includes('manoI')) {
      asignacion.set(a, 'manoI');
      poseI = pose;
    } else sobrantes.push(a);
  }
  if (atributos.includes('boveda-celeste')) poseD = poseI = 'hombros';
  if (atributos.includes('cadenas')) poseD = poseI = 'abajo';
  if (atributos.includes('pinzas')) poseD = poseI = 'adelante';
  return { asignacion, sobrantes, poseD, poseI };
}

function opcionesHumana(d: DatosEstatua, rnd: () => number, poses: { poseD: Pose; poseI: Pose }): OpcionesHumana {
  const at = new Set(d.atributos);
  const fem = d.genero === 'femenino';
  const masc = !fem;
  return {
    genero: fem ? 'femenino' : 'masculino',
    inferior: at.has('cola-pez') ? 'cola-pez' : at.has('cola-serpiente') ? 'cola-serpiente' : fem ? 'tunica' : 'piernas',
    himation: masc && (BARBUDOS.has(d.categoria ?? '') || rnd() < 0.6),
    poseD: poses.poseD,
    poseI: poses.poseI,
    barba: masc && (BARBUDOS.has(d.categoria ?? '') || rnd() < 0.45),
    ojoUnico: at.has('ojo-unico'),
    cabezasExtra: at.has('cincuenta-cabezas') ? 8 : 0,
    brazosExtra: at.has('cien-brazos') ? 6 : 0,
    cuellosSerpiente: at.has('cien-cabezas-serpiente') ? 10 : 0,
    inclinacion: (rnd() - 0.5) * 0.5,
  };
}

/** Coloca los atributos con `crear` en las anclas de la figura. */
function vestir(fig: Figura, m: Materiales, atributos: string[], consumidos: Set<string>, asignacion: Map<string, 'manoD' | 'manoI'>) {
  let ladoBase = 1;
  const enBase = (obj: THREE.Object3D) => {
    const ancla = fig.anclas[ladoBase > 0 ? 'baseD' : 'baseI'];
    obj.position.add(ancla ?? new THREE.Vector3(ladoBase * 0.55, 0, 0.12));
    ladoBase = -ladoBase;
  };
  for (const a of atributos) {
    const def = ATRIBUTOS[a];
    if (!def?.crear || consumidos.has(a)) continue;
    if (def.lugar === 'manos') {
      for (const lado of ['manoD', 'manoI'] as const) {
        const p = fig.anclas[lado];
        if (p) fig.objeto.add(def.crear(m).translateX(p.x).translateY(p.y).translateZ(p.z));
      }
      continue;
    }
    const obj = def.crear(m);
    if (def.lugar === 'base') enBase(obj);
    else {
      const nombreAncla: NombreAncla = def.lugar === 'mano' ? (asignacion.get(a) ?? 'baseD') : (def.lugar as NombreAncla);
      const p = fig.anclas[nombreAncla] ?? (def.lugar === 'mano' ? undefined : fig.anclas.cabeza);
      if (!p) enBase(obj);
      else obj.position.add(p);
    }
    fig.objeto.add(obj);
  }
}

function construirFigura(d: DatosEstatua, m: Materiales, rnd: () => number): Figura {
  const at = new Set(d.atributos);
  const consumidos = new Set<string>();
  const usar = (...lista: string[]) => lista.forEach((a) => consumidos.add(a));
  const manos = repartirManos(d.atributos);
  const nCabezas = at.has('tres-cabezas') ? 3 : at.has('dos-cabezas') ? 2 : 1;

  const humanoide = () => humana(m, opcionesHumana(d, rnd, manos));
  let fig: Figura;

  switch (d.figura) {
    case 'animal': {
      if (at.has('aguila')) {
        fig = ave(m, 1.4);
        usar('aguila', 'alas');
      } else {
        const tipo = at.has('caballo') ? 'caballo' : at.has('leon') ? 'leon' : 'perro';
        fig = cuadrupedo(m, { tipo, cabezas: Array(nCabezas).fill(tipo), alas: at.has('alas'), colaSerpiente: false });
        usar(tipo, 'alas');
      }
      break;
    }
    case 'serpentina':
      fig = serpiente(m, at.has('muchas-cabezas') ? 9 : 1, at.has('manzana-oro'));
      usar('manzana-oro');
      break;
    case 'abstracta':
      fig = abstracta(m, rnd, d.genero === 'masculino');
      break;
    case 'astral':
      fig = astral(m, rnd);
      usar('estrella');
      break;
    case 'rio':
      fig = rio(m, rnd);
      usar('cantaro');
      break;
    case 'grupo': {
      const miembros = [-0.32, 0, 0.32].map((x, i) => {
        const f = humanoide();
        vestir(f, m, d.atributos.filter((a) => ATRIBUTOS[a]?.lugar !== 'base'), consumidos, manos.asignacion);
        f.objeto.position.set(x, 0, i === 1 ? -0.12 : 0.08);
        f.objeto.rotation.y = -x * 0.8;
        f.objeto.scale.setScalar(0.78);
        return f.objeto;
      });
      fig = { objeto: grupo(miembros), anclas: { baseD: new THREE.Vector3(0.7, 0, 0.2), baseI: new THREE.Vector3(-0.7, 0, 0.2) } };
      d.atributos.filter((a) => ATRIBUTOS[a]?.lugar !== 'base').forEach((a) => consumidos.add(a));
      break;
    }
    case 'monstruo': {
      if (at.has('leon')) {
        // Quimera (león, cabra y serpiente) o Fix (león alado con cabeza humana)
        const cabezas: TipoCabeza[] = at.has('alas') ? ['humana'] : at.has('cabra') ? ['leon', 'cabra'] : ['leon'];
        fig = cuadrupedo(m, { tipo: 'leon', cabezas, alas: at.has('alas'), colaSerpiente: at.has('cola-serpiente') });
        usar('leon', 'cabra', 'alas');
      } else if (at.has('tres-cuerpos')) {
        const cuerpos = [-0.3, 0, 0.3].map((x) => {
          const f = humanoide();
          f.objeto.position.set(x, 0, Math.abs(x) * -0.4);
          f.objeto.rotation.y = -x * 1.2;
          return f.objeto;
        });
        fig = { objeto: grupo(cuerpos), anclas: { cabeza: new THREE.Vector3(0, 1.8, 0) } };
      } else fig = humanoide();
      break;
    }
    case 'hibrida':
      if (at.has('cuerpo-caballo')) {
        fig = cuadrupedo(m, { tipo: 'caballo', cabezas: [], alas: false, colaSerpiente: false, torsoHumano: opcionesHumana(d, rnd, manos) });
      } else fig = humanoide();
      break;
    default:
      fig = humanoide();
  }

  if (d.figura === 'alada' && !at.has('alas')) d = { ...d, atributos: [...d.atributos, 'alas'] };
  vestir(fig, m, d.atributos, consumidos, manos.asignacion);
  return fig;
}

export function crearEstatua(d: DatosEstatua, op: OpcionesEstatua = {}): THREE.Group {
  const m = materiales(op.piedra);
  const rnd = azar(d.slug);
  const fig = construirFigura(d, m, rnd);
  fig.objeto.scale.multiplyScalar(d.escala || 1);

  const estatua = new THREE.Group();
  estatua.name = d.slug;
  const caja = new THREE.Box3().setFromObject(fig.objeto);
  const tam = caja.getSize(new THREE.Vector3());
  const centro = caja.getCenter(new THREE.Vector3());
  fig.objeto.position.x -= centro.x;
  fig.objeto.position.z -= centro.z;

  let alto = tam.y;
  if (op.pedestal !== false) {
    const ancho = Math.max(tam.x + 0.25, 0.8);
    const fondo = Math.max(tam.z + 0.25, 0.8);
    estatua.add(pedestal(m, ancho, fondo, d.nombre, d.nombreOriginal));
    fig.objeto.position.y += ALTO_PEDESTAL;
    alto += ALTO_PEDESTAL;
    estatua.userData.ancho = ancho;
    estatua.userData.fondo = fondo;
  }
  estatua.add(fig.objeto);
  estatua.userData.slug = d.slug;
  estatua.userData.alto = alto;
  return estatua;
}

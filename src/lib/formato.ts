// Utilidades de presentación compartidas por las páginas.
import type { Ser } from './mitologias';

/** Prefijo de las URLs (vacío salvo que el sitio se publique en una subcarpeta; ver astro.config.mjs `base`). */
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const urlSer = (ser: Pick<Ser, 'mitologia' | 'slug'>) => `${base}/${ser.mitologia}/${ser.slug}/`;

export function romano(n: number): string {
  const tabla: [number, string][] = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let r = '';
  for (const [valor, letra] of tabla) {
    while (n >= valor) {
      r += letra;
      n -= valor;
    }
  }
  return r;
}

/** "Teogonía, v. 116" o "vv. 116-122" */
export const versos = (v: string) => (v.includes('-') || v.includes(',') ? `vv. ${v}` : `v. ${v}`);

/** Grupos con más miembros que esto se muestran juntos en una vitrina, no como cuadros sueltos. */
export const TAMANO_VITRINA = 6;

export type Pieza = { tipo: 'ser'; ser: Ser } | { tipo: 'vitrina'; grupo: string; seres: Ser[] };

/** Agrupa en vitrinas los seres consecutivos de un mismo grupo grande (Nereidas, Oceánides, ríos...). */
export function piezas(seres: Ser[], tamanoGrupo: Map<string, number>): Pieza[] {
  const resultado: Pieza[] = [];
  for (const ser of seres) {
    const g = ser.data.grupo;
    const ultima = resultado.at(-1);
    if (g && (tamanoGrupo.get(g) ?? 0) > TAMANO_VITRINA) {
      if (ultima?.tipo === 'vitrina' && ultima.grupo === g) ultima.seres.push(ser);
      else resultado.push({ tipo: 'vitrina', grupo: g, seres: [ser] });
    } else {
      resultado.push({ tipo: 'ser', ser });
    }
  }
  return resultado;
}

export const NOMBRE_GRUPO: Record<string, string> = {
  nereidas: 'Las Nereidas',
  oceanides: 'Las Oceánides',
  rios: 'Los ríos',
  musas: 'Las Musas',
};

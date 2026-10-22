// Acceso a los datos del museo. Toda página debe leer mitologías y seres desde aquí,
// no con getCollection directo, para que las relaciones queden validadas.
// Documentación: memories/arquitectura.md
import { getCollection, type CollectionEntry } from 'astro:content';

export type Mitologia = CollectionEntry<'mitologias'>;
export type SerEntrada = CollectionEntry<'seres'>;

export interface Ser {
  id: string; // id global: "griega/gea"
  slug: string; // id local dentro de la mitología: "gea"
  mitologia: string; // "griega"
  data: SerEntrada['data'];
  hijos: string[]; // slugs, calculados a partir de `padres` de los demás seres
  entrada: SerEntrada; // para render() del cuerpo markdown
}

export async function getMitologias(): Promise<Mitologia[]> {
  const todas = await getCollection('mitologias');
  return todas.sort((a, b) => a.data.orden - b.data.orden);
}

export async function getMitologia(id: string): Promise<Mitologia> {
  const mitologia = (await getMitologias()).find((m) => m.id === id);
  if (!mitologia) throw new Error(`No existe la mitología "${id}"`);
  return mitologia;
}

const cache = new Map<string, Ser[]>();

/** Seres de una mitología en orden cronológico, validados y con `hijos` calculados. */
export async function getSeres(mitologiaId: string): Promise<Ser[]> {
  const enCache = cache.get(mitologiaId);
  if (enCache) return enCache;

  const mitologia = await getMitologia(mitologiaId);
  const entradas = await getCollection('seres', (s) => s.id.startsWith(`${mitologiaId}/`));

  const seres: Ser[] = entradas
    .map((entrada) => ({
      id: entrada.id,
      slug: entrada.id.slice(mitologiaId.length + 1),
      mitologia: mitologiaId,
      data: entrada.data,
      hijos: [] as string[],
      entrada,
    }))
    .sort((a, b) => a.data.orden - b.data.orden);

  const porSlug = new Map(seres.map((s) => [s.slug, s]));
  for (const ser of seres) {
    for (const padre of ser.data.padres) porSlug.get(padre)?.hijos.push(ser.slug);
  }

  validar(mitologia, seres, porSlug);
  cache.set(mitologiaId, seres);
  return seres;
}

export async function getSer(mitologiaId: string, slug: string): Promise<Ser | undefined> {
  return (await getSeres(mitologiaId)).find((s) => s.slug === slug);
}

/** Agrupa los seres por sala, respetando el orden de las salas definido en mitologia.yaml. */
export async function getSalas(mitologiaId: string) {
  const mitologia = await getMitologia(mitologiaId);
  const seres = await getSeres(mitologiaId);
  return mitologia.data.salas.map((sala) => ({
    ...sala,
    seres: seres.filter((s) => s.data.sala === sala.id),
  }));
}

function validar(mitologia: Mitologia, seres: Ser[], porSlug: Map<string, Ser>) {
  const errores: string[] = [];
  const salas = new Set(mitologia.data.salas.map((s) => s.id));
  const categorias = new Set(mitologia.data.categorias.map((c) => c.id));
  const ordenes = new Map<number, string>();

  for (const ser of seres) {
    const d = ser.data;
    const donde = ser.entrada.filePath ?? ser.id;
    if (!salas.has(d.sala)) errores.push(`${donde}: sala "${d.sala}" no existe en mitologia.yaml`);
    if (!categorias.has(d.categoria))
      errores.push(`${donde}: categoría "${d.categoria}" no existe en mitologia.yaml`);
    for (const id of [...d.padres, ...d.parejas]) {
      if (!porSlug.has(id)) errores.push(`${donde}: relación con "${id}", que no existe`);
    }
    if (d.padres.length === 0 && !d.origen)
      errores.push(`${donde}: sin padres; indica "origen" (p. ej. "Surge por sí mismo")`);
    const repetido = ordenes.get(d.orden);
    if (repetido) errores.push(`${donde}: orden ${d.orden} repetido con ${repetido}`);
    ordenes.set(d.orden, ser.id);
  }

  if (errores.length) {
    throw new Error(`Datos inválidos en la mitología "${mitologia.id}":\n- ${errores.join('\n- ')}`);
  }
}

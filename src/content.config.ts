// Colecciones de contenido del museo. Documentación: memories/esquema-datos.md
//
// src/content/mitologias/<mitologia>/mitologia.yaml   -> colección `mitologias` (id: <mitologia>)
// src/content/mitologias/<mitologia>/seres/<ser>.md   -> colección `seres`      (id: <mitologia>/<ser>)
// src/content/mitologias/<mitologia>/imagenes/*.jpg   -> imágenes de obras, referenciadas desde `imagenes`
//
// Las relaciones entre seres (padres, parejas, sala, categoría) se validan en src/lib/mitologias.ts,
// porque dependen de la mitología a la que pertenece cada ser.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const BASE = './src/content/mitologias';

const fuente = z.object({
  obra: z.string(), // "Teogonía"
  versos: z.string(), // "116-122" o "924"
});

const mitologias = defineCollection({
  loader: glob({
    base: BASE,
    pattern: '*/mitologia.yaml',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    nombre: z.string(), // "Mitología griega"
    estado: z.enum(['activa', 'proximamente']),
    orden: z.number(), // posición en la portada
    descripcion: z.string(),
    canon: z.object({
      obra: z.string(),
      autor: z.string(),
      fecha: z.string(),
      traduccionReferencia: z.string().optional(),
      url: z.url().optional(),
    }),
    criterioOrden: z.string().optional(), // cómo se decide el orden cronológico
    tema: z.object({
      piedra: z.string(), // color del mármol de las salas
      acento: z.string(), // color de acento (marcos, cartelas)
    }),
    categorias: z
      .array(z.object({ id: z.string(), nombre: z.string(), descripcion: z.string().optional() }))
      .default([]),
    salas: z
      .array(
        z.object({
          id: z.string(),
          nombre: z.string(),
          versos: z.string().optional(),
          descripcion: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

const seres = defineCollection({
  loader: glob({
    base: BASE,
    pattern: '*/seres/**/*.md',
    // "griega/seres/gea.md" -> "griega/gea"
    generateId: ({ entry }) => {
      const [mitologia, , ...resto] = entry.replace(/\.md$/, '').split('/');
      return `${mitologia}/${resto.at(-1)}`;
    },
  }),
  schema: ({ image }) => z.object({
    nombre: z.string(), // nombre en español: "Gea"
    nombreOriginal: z.string().optional(), // "Γαῖα"
    transliteracion: z.string().optional(), // "Gaîa"
    otrosNombres: z.array(z.string()).default([]), // "Gaia", "Tierra"
    titulo: z.string().optional(), // epíteto corto para la placa: "La Tierra de ancho pecho"

    orden: z.number(), // posición cronológica global dentro de la mitología (único)
    sala: z.string(), // id de una sala de mitologia.yaml
    categoria: z.string(), // id de una categoría de mitologia.yaml
    grupo: z.string().optional(), // seres de un mismo conjunto: "nereidas", "ciclopes"
    colectivo: z.boolean().default(false), // el ser es un grupo sin individuos nombrados ("las Keres")

    padres: z.array(z.string()).default([]), // ids locales: ["gea", "urano"]
    origen: z.string().optional(), // cuando no hay padres: "Nace de la espuma del mar"
    parejas: z.array(z.string()).default([]),
    dominio: z.array(z.string()).default([]), // "la tierra", "la fertilidad"

    aparicion: fuente, // primera aparición en el canon
    otrasFuentes: z.array(fuente).default([]),
    citas: z
      .array(
        z.object({
          versos: z.string(),
          texto: z.string(), // traducción al español
        }),
      )
      .default([]),

    // Obras reales que representan al ser (la primera es la principal). Ver memories/imagenes.md
    imagenes: z
      .array(
        z.object({
          archivo: image(), // ruta relativa al .md: "../imagenes/zeus-1.jpg"
          obra: z.string(), // "Zeus de Otrícoli"
          autor: z.string().optional(), // escultor o pintor ("Anónimo" si no se conoce)
          fecha: z.string().optional(), // "siglo IV a. C."
          ubicacion: z.string().optional(), // museo o lugar: "Museos Vaticanos"
          fotografo: z.string().optional(), // autor de la foto en Commons, si la licencia lo exige
          licencia: z.string(), // "Dominio público", "CC BY-SA 4.0"...
          fuente: z.url(), // página del archivo en Wikimedia Commons
          alt: z.string().optional(), // texto alternativo; si falta se usa "<obra> (<nombre>)"
          enfoque: z.string().optional(), // object-position para recortes: "50% 20%"
        }),
      )
      .default([]),
  }),
});

export const collections = { mitologias, seres };

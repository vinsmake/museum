// Colecciones de contenido del museo. Documentación: memories/esquema-datos.md
//
// src/content/mitologias/<mitologia>/mitologia.yaml   -> colección `mitologias` (id: <mitologia>)
// src/content/mitologias/<mitologia>/seres/<ser>.md   -> colección `seres`      (id: <mitologia>/<ser>)
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
      piedra: z.string(), // color base de las estatuas
      acento: z.string(), // color de acento de la sala
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
  schema: z.object({
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

    // Parámetros de la estatua (generador del Punto 4)
    estatua: z
      .object({
        figura: z.string().default('humana'), // humana, serpentina, alada, monstruo, abstracta...
        genero: z.enum(['femenino', 'masculino', 'neutro']).default('neutro'),
        escala: z.number().default(1),
        atributos: z.array(z.string()).default([]), // "rayo", "tridente", "hoz"...
      })
      .prefault({}),
  }),
});

export const collections = { mitologias, seres };

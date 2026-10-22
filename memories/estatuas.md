# Generador procedural de estatuas

Código en `src/estatuas/` (Three.js 0.186.1). No hay modelos 3D descargados: cada estatua se construye en el
navegador a partir del bloque `estatua` de los datos de cada ser (`figura`, `genero`, `escala`, `atributos`).
Funciona igual para cualquier mitología.

## API
```ts
import { crearEstatua, liberar, atributosDesconocidos } from '../estatuas';
const estatua = crearEstatua(
  { slug, nombre, nombreOriginal, categoria, figura, genero, escala, atributos },
  { piedra: mitologia.data.tema.piedra, pedestal: true },
);
escena.add(estatua);                 // de pie sobre y=0, mirando a +z
estatua.userData // { slug, alto, ancho, fondo }
liberar(estatua);                    // al quitarla: libera la placa y las geometrías únicas
```
- Determinista: el azar (pose, barba, variante abstracta) sale de `slug`; la misma estatua siempre es igual.
- Las geometrías básicas y los materiales se **comparten** (caché): crear cientos de estatuas no multiplica la memoria.
- Funciona también en Node (sin `document`): sin textura de mármol ni placa. Se usa para la comprobación masiva.

## Módulos
| Archivo | Qué hace |
|---|---|
| `index.ts` | `crearEstatua`: elige el cuerpo según `figura`, reparte objetos entre las manos, coloca atributos, escala, centra y añade pedestal |
| `cuerpos.ts` | Constructores de cuerpos y sus **anclas** (manoD, manoI, cabeza, cara, espalda, pecho, hombro, pies, baseD, baseI, encima) |
| `atributos.ts` | Catálogo `ATRIBUTOS`: dónde va cada atributo, con qué pose del brazo y cómo se construye |
| `pedestal.ts` | Plinto + dado + cornisa (alto 0.55) y placa con nombre original y en español (canvas) |
| `materiales.ts` | piedra (mármol con vetas generadas), piedraOscura, bronce, oro, agua, fuego (emisivo), pedestal |
| `primitivas.ts` | Geometrías cacheadas, `malla`, `entre` (cápsula entre dos puntos), `tuboAhusado` (colas, serpientes), `azar` |

## Figuras (`estatua.figura`)
| Figura | Cuerpo | Ejemplos |
|---|---|---|
| `humana` | Figura de pie. Femenina con túnica plisada; masculina con piernas y a veces manto (himation) y barba | Zeus, Gea, Nereidas |
| `alada` | Humana + `alas` automáticas | Eros, Nike, Tánato |
| `monstruo` | Con `leon`: cuadrúpedo león (Quimera: + cabeza de cabra + `cola-serpiente`; Fix: con `alas` lleva cabeza humana). Con `tres-cuerpos`: tres figuras unidas (Gerión). Si no: humana con modificadores | Quimera, Fix, Gerión, Hecatónquiros, Tifón |
| `hibrida` | Con `cuerpo-caballo`: centauro. Con `cola-pez` / `cola-serpiente`: torso humano y cola | Quirón, Tritón, Equidna |
| `animal` | `aguila` → ave sobre roca; `caballo` / `leon` / `perro` → cuadrúpedo (`dos-cabezas`, `tres-cabezas`, `alas`) | Pegaso, Cerbero, Orto |
| `serpentina` | Serpiente enroscada; `muchas-cabezas` → 9 cabezas; `manzana-oro` → enroscada a un árbol con manzanas | Hidra, Serpiente de las Hespérides |
| `abstracta` | Una de tres composiciones (nudo, anillos en espiral, monolitos) según la semilla; oscura si `genero: masculino` | Caos, Tártaro, Érebo |
| `astral` | Estrellas emisivas sobre varillas | Astros |
| `rio` | Dios recostado apoyado en un cántaro volcado del que mana agua | los 25 ríos |
| `grupo` | Tres figuras pequeñas en un pedestal (para seres `colectivo`) | Erinias, Keres, Hespérides |

Una figura desconocida se dibuja como `humana`.

## Atributos (`estatua.atributos`)
Lugares (`lugar` en el catálogo):
- `mano`: objeto sostenido. El primero va a la mano derecha, el segundo a la izquierda (el `escudo` siempre a la
  izquierda) y el resto a la base del pedestal. La `pose` del objeto decide la del brazo: `abajo`, `cadera`,
  `alzado` (bastones, lanzas), `adelante` (objetos pequeños), `arriba` (rayo, estrella), `hombros` (Atlas).
- `manos`: se pone en ambas manos (`cadenas`, `pinzas`).
- `cabeza`, `cara`, `espalda`, `pecho`, `hombro`, `pies`, `encima`: en el ancla correspondiente.
- `base`: compañeros y entorno sobre el pedestal, alternando derecha e izquierda (`aguila`, `perro`, `leones`, `olas`...).
- `cuerpo`: modificadores que cambian el cuerpo y no se construyen como objeto: `ojo-unico`, `cien-brazos`,
  `cincuenta-cabezas`, `cien-cabezas-serpiente`, `dos-cabezas`, `tres-cabezas`, `muchas-cabezas`, `tres-cuerpos`,
  `cola-pez`, `cola-serpiente`, `cuerpo-caballo`.

Algunos atributos se "consumen" cuando definen el cuerpo (p. ej. `caballo` en Pegaso no añade otro caballo en la base).

Catálogo completo: claves de `ATRIBUTOS` en `src/estatuas/atributos.ts` (~110). Todos los atributos usados en los
datos griegos tienen soporte (comprobado el 2026-10-22).

## Cómo añadir un atributo nuevo
1. Añadir una entrada en `ATRIBUTOS` (`src/estatuas/atributos.ts`):
   ```ts
   'arpa': { lugar: 'mano', pose: 'adelante', crear: (m) => grupo([malla(caja(0.1, 0.2, 0.02), m.oro)]) },
   ```
   Los objetos de mano se construyen **verticales con el punto de agarre en el origen** (y=0 es la mano).
   Unidades: la figura mide ~1.8 de alto a escala 1.
2. Usarlo en el `.md` del ser: `atributos: ["arpa"]`.
3. Revisarlo en el taller. Si falta en el catálogo, el taller lo muestra en naranja ("Atributos sin soporte").

## Cómo añadir una figura nueva
1. Escribir el constructor en `cuerpos.ts` devolviendo `{ objeto, anclas }` (de pie sobre y=0, mirando a +z).
2. Añadir el `case` en `construirFigura` (`index.ts`) y el nombre en `FIGURAS`.
3. Documentarla en la tabla de arriba.

## Taller de estatuas
`http://localhost:4321/taller/griega` (página `src/pages/taller/[mitologia].astro`, una por mitología activa).
- Selector por salas, flechas ◀ ▶ (o teclas ← →), cámara orbital con el ratón.
- "Ver sala completa" pone en fila todas las estatuas de la sala.
- `#slug` en la URL abre ese ser (p. ej. `/taller/griega#tifon`).
- Es una herramienta de revisión; el museo navegable es el Punto 5.

## Comprobación masiva (sin navegador)
Construir las 313 estatuas en Node detecta excepciones, medidas absurdas y atributos sin soporte. Se hizo con un
script temporal: empaquetar `src/estatuas/index.ts` con `npx rolldown` dentro del contenedor
(`docker compose run --rm --entrypoint sh npm -c "npx rolldown src/estatuas/index.ts --format esm --file /tmp/estatuas.mjs"`)
y llamar a `crearEstatua` para cada `.md`. Resultado del 2026-10-22: 0 fallos, 0 medidas raras, 0 atributos sin soporte.

## Estado visual y pendientes
- Revisado en el navegador: Zeus (rayo, cetro, águila). Después se bajó la iluminación del taller (exposición 0.8)
  y se oscureció la placa para que el nombre se lea.
- **No revisados a ojo** (la extensión de Chrome se desconectó): los monstruos, los híbridos y los ríos.
  Revisarlos en el taller al empezar el Punto 5 y ajustar proporciones si hace falta.
- Estilo: estilizado, de piezas redondeadas, no realista. Mejoras posibles: modelos `.glb` para los seres
  principales (sustituirían a `crearEstatua` por slug), rostros más detallados, poses por ser.
- El aviso de build "chunk size" es por Three.js (~600 KB) y es esperado.

# Plan de trabajo: Museo Mitológico Interactivo

> Estado: **Punto 3 terminado. Esperando aprobación del usuario para iniciar el Punto 4.**
> Regla de trabajo: se ejecuta **un punto a la vez**. Al terminar cada punto se marca aquí `[x]`,
> se actualiza la memoria correspondiente y se **pide confirmación** antes de seguir con el siguiente.

## Objetivo

Un museo web totalmente interactivo con una estatua por cada ser de la mitología griega
(primordiales, titanes, dioses, monstruos, ninfas, etc.), ordenados cronológicamente según su
aparición en la **Teogonía de Hesíodo** (canon base), cada uno con su ficha de información.
La arquitectura debe admitir más mitologías en el futuro (nórdica, egipcia, etc.).

## Restricciones del usuario

- Todo corre con **Docker Compose**. Nada se instala en la computadora host.
- Node: **la versión más reciente** (imagen oficial `node`, verificar el tag más nuevo en Docker Hub al ejecutar el Punto 1).
- Frontend: **Astro** (salvo que otro stack lo haga claramente mejor).
- Todo el contexto del proyecto vive en `memories/` (las sesiones cambian y se pierde contexto).
- Idioma del contenido y la documentación: **español**.

## Stack decidido

| Pieza | Elección | Motivo |
|---|---|---|
| Framework | Astro (última versión), salida estática | Content Collections con validación de esquema: ideal para un catálogo grande de seres en archivos de datos |
| 3D / estatuas | Three.js dentro de una "isla" de Astro | Sala de museo navegable con estatuas de mármol, luz y cámara |
| Estatuas | Generadas proceduralmente (pedestal + figura + atributo/símbolo de cada ser) | No existen modelos 3D libres para cientos de seres; el generador permite que cada uno se vea distinto. Se podrá sustituir por modelos `.glb` individuales más adelante |
| Datos | Archivos JSON/MD por ser, validados con Zod (Content Collections) | Agregar un dios = agregar un archivo |
| Entorno | `docker compose` con servicios `dev` (servidor con recarga en caliente) y `build` (genera `dist/`) | Sin instalaciones en host |
| Publicación web | Build estático (`dist/`) | Se puede publicar como Artifact de claude.ai o en cualquier hosting estático (decidir en el Punto 9) |

## Puntos

### [x] Punto 1. Infraestructura Docker + proyecto Astro vacío
- Hecho: Node `26.12.1-alpine`, Astro `7.4.2`, servicios `dev`, `build`, `preview`, `npm`.
- `Dockerfile` basado en la imagen `node` más reciente (alpine si es compatible).
- `docker-compose.yml` con servicios `dev` (puerto 4321, volumen montado, `node_modules` en volumen aparte) y `build`.
- Crear el proyecto Astro dentro del contenedor (sin instalar nada en el host).
- Verificar que `docker compose up dev` sirve la página en `http://localhost:4321`.
- Memoria: `memories/infraestructura.md` (comandos, puertos, cómo arrancar, cómo resolver problemas).

### [x] Punto 2. Arquitectura multi-mitología y esquema de datos
- Hecho: `src/content.config.ts`, `src/lib/mitologias.ts` (acceso + validación), griega con 4 seres de ejemplo,
  nórdica como `proximamente`. Los seres son `.md` (frontmatter = datos, cuerpo = descripción); `hijos` se calcula.
- Estructura: `src/content/mitologias/<id>/` (p. ej. `griega/`), con un archivo de metadatos por mitología
  (nombre, fuente canónica, salas/eras, paleta) y un archivo por ser.
- Esquema Zod de un ser: `id`, `nombre`, `nombreOriginal` (griego), `transliteracion`, `orden` (cronológico),
  `sala` (generación/era), `tipo` (primordial, titán, olímpico, monstruo, ninfa...), `padres`, `pareja`,
  `descendencia`, `dominio`, `atributos` (símbolos para la estatua), `descripcion`, `citas` (verso y texto),
  `fuente` (obra + versos, p. ej. *Teogonía* 116-122), `apariencia` (parámetros de la estatua).
- Memoria: `memories/arquitectura.md` y `memories/esquema-datos.md`.

### [x] Punto 3. Datos de la mitología griega según la Teogonía de Hesíodo
- Hecho: 313 seres en 11 salas. Criterio de orden y decisiones en `memories/mitologias/griega.md`.
- Recorrer la Teogonía en orden y registrar a **todos** los seres nombrados, con su número de verso de primera aparición
  como criterio de orden cronológico.
- Salas (eras) propuestas en el plan original (SUPERADO: las salas definitivas siguen el orden del poema y están en `memories/mitologias/griega.md`):
  1. Los primordiales (Caos, Gea, Tártaro, Eros, Érebo, Nix...) — vv. 116-125
  2. Hijos de Nix y de Érebo — vv. 211-232
  3. Descendencia de Gea y Urano: Titanes, Cíclopes, Hecatónquiros — vv. 126-153
  4. Nacidos de la sangre y la castración de Urano (Erinias, Gigantes, Melias, Afrodita) — vv. 176-206
  5. Linaje del mar: Ponto, Nereo, Nereidas, Taumante, Forcis y Ceto, monstruos — vv. 233-336
  6. Hijos de los Titanes: Oceánides, ríos, Helios, Selene, Eos, astros, vientos, Hécate, Prometeo, Atlas... — vv. 337-452
  7. Los Olímpicos: hijos de Crono y Rea, nacimiento de Zeus — vv. 453-506
  8. Prometeo y Pandora — vv. 507-616
  9. Titanomaquia y Tifón — vv. 617-880
  10. Esposas e hijos de Zeus y la nueva generación divina (Atenea, Musas, Horas, Moiras, Cárites, Apolo, Ártemis, Hermes, Dioniso, Heracles...) — vv. 881-1022
- Fuente del texto: traducción de H. G. Evelyn-White (1914, dominio público) como referencia de versos;
  descripciones redactadas en español.
- Seres de otras fuentes (Homero, Apolodoro, etc.) **no** entran en esta fase; se dejan anotados como ampliación futura.
- Memoria: `memories/mitologias/griega.md` (fuentes, criterio de orden, lista de salas, decisiones dudosas).

### [ ] Punto 4. Generador procedural de estatuas (Three.js)
- Figura base de mármol (cuerpo, pose, drapeado) parametrizada por `tipo` y `apariencia`.
- Atributos según el ser: rayo (Zeus), tridente (Poseidón), égida/lechuza (Atenea), hoz (Crono), lira (Apolo), etc.
- Formas especiales para seres no humanos (Hidra, Equidna, Cíclopes de un ojo, Hecatónquiros con muchos brazos, Pegaso...).
- Pedestal con placa del nombre en griego y español.
- Memoria: `memories/estatuas.md` (cómo funciona el generador, cómo añadir un atributo o forma nueva).

### [ ] Punto 5. Sala del museo interactiva
- Recorrido 3D por las salas en orden cronológico (avanzar/retroceder, clic en una estatua para acercarse).
- Controles: ratón/arrastre, teclado (flechas), táctil en móvil.
- Ficha lateral con la información del ser, la cita de Hesíodo y enlaces a padres/hijos (navegan a su estatua).
- Rendimiento: carga por sala para no dibujar cientos de estatuas a la vez.

### [ ] Punto 6. Vistas complementarias
- Portada: selector de mitología (hoy solo griega; nórdica marcada como "próximamente").
- Índice / línea de tiempo con búsqueda y filtros por tipo y sala.
- Árbol genealógico interactivo.
- Página individual por ser (URL propia) para compartir y para accesibilidad sin 3D.

### [ ] Punto 7. Diseño visual, accesibilidad y responsive
- Identidad visual de museo clásico (mármol, bronce, tipografía epigráfica), tema claro/oscuro.
- Funciona en móvil, con teclado y con `prefers-reduced-motion`.

### [ ] Punto 8. Documentación final en `memories/`
- Guías: `memories/guias/agregar-ser.md`, `modificar-datos.md`, `agregar-mitologia.md` (ejemplo: nórdica con la *Edda*).
- Revisión de que cada memoria refleja el estado real del código.

### [ ] Punto 9. Publicación en la web
- `docker compose run --rm build` genera `dist/`.
- Publicar (opción por decidir con el usuario: Artifact de claude.ai, GitHub Pages, Netlify, etc.).
- Memoria: `memories/despliegue.md`.

## Preguntas abiertas (resolver antes del punto indicado)
- Punto 9: ¿dónde publicar?

## Decisiones tomadas
- Punto 3 (2026-10-22): se incluyen uno por uno todos los nombrados (Nereidas, Oceánides, ríos). Las Musas abren
  el recorrido en la sala del proemio; el resto se ordena por el verso de su nacimiento u origen (o primera mención).

## Registro de avance
- 2026-10-22: creado este plan y `memories/README.md`.
- 2026-10-22: Punto 1 terminado. Docker Compose + Astro 7.4.2 sobre Node 26.12.1. Verificados dev (4321),
  recarga en caliente y build. `AGENTS.md` en la raíz apunta a `memories/`. Detalle en `memories/infraestructura.md`.
- 2026-10-22: Punto 2 terminado. Colecciones `mitologias` y `seres`, validación de relaciones en
  `src/lib/mitologias.ts` (probada con un archivo inválido), `orden` = verso de primera aparición.
  `.gitattributes` fuerza LF. Detalle en `memories/arquitectura.md`, `esquema-datos.md` y `mitologias/griega.md`.
- 2026-10-22: Punto 3 terminado. 313 seres de la Teogonía (vv. 1-1022) generados una vez desde tablas; ahora los
  `.md` son la fuente de verdad. Build OK con validación. Se añadió la categoría `criatura`. Los valores de
  `estatua.figura` y `estatua.atributos` que debe cubrir el Punto 4 están en `memories/esquema-datos.md`.

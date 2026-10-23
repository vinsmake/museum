# Plan de trabajo: Museo Mitológico Interactivo

> Estado: **Puntos 1-10 terminados.** Falta solo activar GitHub Pages en la configuración del repositorio (ver `memories/despliegue.md`).
> Regla de trabajo: se ejecuta **un punto a la vez**. Al terminar cada punto se marca aquí `[x]`,
> se actualiza la memoria correspondiente y se **pide confirmación** antes de seguir con el siguiente.

## Objetivo

Un museo web interactivo de la mitología griega con un **recorrido cronológico** por todos los seres
(primordiales, titanes, dioses, monstruos, ninfas, etc.) según su aparición en la **Teogonía de Hesíodo**
(canon base), cada uno con su ficha de información y, cuando existe, **imágenes de obras reales conocidas**
(esculturas, vasijas, pinturas). No es 3D.
La arquitectura debe admitir más mitologías en el futuro (nórdica, egipcia, etc.).

## Restricciones del usuario

- Todo corre con **Docker Compose**. Nada se instala en la computadora host.
- Node: **la versión más reciente** (imagen oficial `node`, verificar el tag más nuevo en Docker Hub al ejecutar el Punto 1).
- Frontend: **Astro** (salvo que otro stack lo haga claramente mejor).
- Todo el contexto del proyecto vive en `memories/` (las sesiones cambian y se pierde contexto).
- Idioma del contenido y la documentación: **español**.
- Commits: uno por punto terminado.

## Stack decidido

| Pieza | Elección | Motivo |
|---|---|---|
| Framework | Astro (última versión), salida estática | Content Collections con validación de esquema: ideal para un catálogo grande de seres en archivos de datos |
| Imágenes | Obras reales de **Wikimedia Commons** (dominio público o licencia libre), **descargadas** al proyecto | No depender de otro sitio; Astro las optimiza (tamaños y formatos) en el build |
| Seres sin obra conocida | **Ficha sin imagen**: tarjeta tipográfica con el nombre griego grabado | Los 313 seres siguen en el recorrido |
| Datos | Archivos `.md` por ser, validados con Zod (Content Collections) | Agregar un dios = agregar un archivo |
| Entorno | `docker compose` con servicios `dev` (servidor con recarga en caliente) y `build` (genera `dist/`) | Sin instalaciones en host |
| Publicación web | Build estático (`dist/`) | Hosting a decidir en el Punto 10 |

## Puntos

### [x] Punto 1. Infraestructura Docker + proyecto Astro vacío
- Hecho: Node `26.12.1-alpine`, Astro `7.4.2`, servicios `dev`, `build`, `preview`, `npm`.
- Memoria: `memories/infraestructura.md`.

### [x] Punto 2. Arquitectura multi-mitología y esquema de datos
- Hecho: `src/content.config.ts`, `src/lib/mitologias.ts` (acceso + validación), griega y nórdica (`proximamente`).
  Los seres son `.md` (frontmatter = datos, cuerpo = descripción); `hijos` se calcula.
- Memoria: `memories/arquitectura.md` y `memories/esquema-datos.md`.

### [x] Punto 3. Datos de la mitología griega según la Teogonía de Hesíodo
- Hecho: 313 seres en 11 salas. Criterio de orden y decisiones en `memories/mitologias/griega.md`.

### [x] Punto 4. Generador procedural de estatuas (Three.js) — DESCARTADO
- Se construyó (commit `86be93b`), pero el usuario decidió que el museo sea 2D con imágenes reales:
  las estatuas generadas eran figuras estilizadas, no estatuas reales. Se elimina en el Punto 5.
  Si algún día se quiere recuperar, está en el historial de git (`src/estatuas/`, `memories/estatuas.md`).

### [x] Punto 5. Retirar el 3D y preparar el esquema de imágenes
- Hecho. Cambio respecto al plan: las imágenes van en `src/content/mitologias/<mitologia>/imagenes/` (junto a los
  datos), no en `src/assets/`. Campos extra: `fotografo`, `alt`, `enfoque`.
- Borrar `src/estatuas/`, `src/pages/taller/`, `memories/estatuas.md`; desinstalar `three` y `@types/three`
  con `docker compose run --rm npm uninstall ...`.
- Quitar el bloque `estatua` del esquema y de los 313 `.md`.
- Añadir al esquema de cada ser una lista opcional `imagenes`, cada una con: `archivo` (ruta local), `obra`
  (título, p. ej. "Zeus de Otrícoli"), `autor`, `fecha`, `ubicacion` (museo), `licencia`, `fuente` (URL de la
  página del archivo en Commons). La primera imagen es la principal.
- Imágenes en `src/assets/imagenes/<mitologia>/<slug>-<n>.jpg` para que Astro las optimice.
- Memoria: actualizar `esquema-datos.md`, `arquitectura.md`; nueva `memories/imagenes.md`.

### [x] Punto 6. Selección y descarga de imágenes de Wikimedia Commons
- Para cada ser con representación conocida, buscar obras reales en Commons (esculturas antiguas, cerámica,
  pinturas clásicas) y elegir una principal (y alguna extra si vale la pena).
- Solo archivos de dominio público o con licencia libre (CC BY / CC BY-SA / CC0); guardar autor y licencia
  (se mostrarán en la ficha como crédito).
- Descarga con un script que corre en Docker (API de Commons, versión reducida a ~1600 px de ancho).
- Estimación: 80-120 seres con imagen (olímpicos, titanes principales, primordiales, monstruos y héroes conocidos);
  el resto queda con ficha sin imagen.
- Memoria: `memories/imagenes.md` (cómo se eligieron, cómo añadir o cambiar una imagen, lista de créditos).
- Hecho: 103 archivos, 112 seres con imagen (miniaturas de 1280 px). Scripts en `scripts/imagenes/`, créditos en
  `scripts/imagenes/descargadas.json`.

### [x] Punto 7. Recorrido cronológico del museo
- Portada: entrada al museo y selector de mitologías (griega activa; nórdica "próximamente").
- Recorrido `/griega`: las 11 salas en orden, cada una como una galería con sus obras enmarcadas y una cartela
  (nombre, nombre griego, versos). Los seres sin imagen aparecen como ficha tipográfica en el mismo lugar del orden.
- Ficha de cada ser `/griega/<slug>`: imagen grande con crédito, información, citas de Hesíodo, padres, parejas e
  hijos (enlaces), y botones **anterior / siguiente** en orden cronológico para recorrer el museo de punta a punta.
- Navegación con teclado (← →) y en móvil.
- Índice con búsqueda por nombre (español, griego, otros nombres) y filtros por sala y categoría.

### [x] Punto 8. Diseño visual, accesibilidad y responsive
- Identidad de museo clásico (paredes, marcos, cartelas, tipografía epigráfica), tema claro/oscuro.
- Funciona en móvil, con teclado y con `prefers-reduced-motion`. Imágenes con texto alternativo.

### [x] Punto 9. Documentación final en `memories/`
- Guías: `memories/guias/agregar-ser.md`, `modificar-datos.md`, `agregar-imagen.md`, `agregar-mitologia.md`
  (ejemplo: nórdica con la *Edda*).
- Revisión de que cada memoria refleja el estado real del código.

### [x] Punto 10. Publicación en la web
- `docker compose run --rm build` genera `dist/`.
- Publicar (opción por decidir con el usuario: Artifact de claude.ai, GitHub Pages, Netlify, etc.).
- Memoria: `memories/despliegue.md`.

## Preguntas abiertas (resolver antes del punto indicado)
- (Resuelta) Punto 10: GitHub Pages, porque el repositorio ya estaba en GitHub.

## Decisiones tomadas
- Punto 3 (2026-10-22): se incluyen uno por uno todos los nombrados (Nereidas, Oceánides, ríos). Las Musas abren
  el recorrido en la sala del proemio; el resto se ordena por el verso de su nacimiento u origen (o primera mención).
- Replanteo (2026-10-22): museo 2D, no 3D. Imágenes de obras reales **descargadas** de Wikimedia Commons. Los seres
  sin obra conocida quedan con **ficha sin imagen**. El generador 3D se **elimina**.

## Registro de avance
- 2026-10-22: creado este plan y `memories/README.md`.
- 2026-10-22: Punto 1 terminado. Docker Compose + Astro 7.4.2 sobre Node 26.12.1. Verificados dev (4321),
  recarga en caliente y build. `AGENTS.md` en la raíz apunta a `memories/`. Detalle en `memories/infraestructura.md`.
- 2026-10-22: Punto 2 terminado. Colecciones `mitologias` y `seres`, validación de relaciones en
  `src/lib/mitologias.ts` (probada con un archivo inválido), `orden` = verso de primera aparición.
  `.gitattributes` fuerza LF. Detalle en `memories/arquitectura.md`, `esquema-datos.md` y `mitologias/griega.md`.
- 2026-10-22: Punto 3 terminado. 313 seres de la Teogonía (vv. 1-1022) generados una vez desde tablas; ahora los
  `.md` son la fuente de verdad. Build OK con validación. Se añadió la categoría `criatura`.
- 2026-10-22: Punto 4 terminado (Three.js, `src/estatuas/`, taller). Luego descartado por el usuario en el replanteo.
- 2026-10-22: Replanteo del plan: Puntos 5-10 nuevos (retirar 3D, imágenes de Commons, recorrido 2D, diseño,
  guías, publicación).
- 2026-10-22: Punto 5 terminado. Eliminados `src/estatuas/`, el taller, `memories/estatuas.md` y Three.js
  (desinstalado con el servicio npm). Quitado `estatua` de los 313 `.md` y del esquema. Nuevo campo `imagenes`
  con `image()` (probado: imagen válida compila; ruta inexistente falla con `ImageNotFound`). Nueva memoria
  `memories/imagenes.md`.
- 2026-10-23: Punto 6 terminado. 103 imágenes de Commons (54 PD, 14 CC0, 38 CC BY/BY-SA) para 112 seres, escritas
  en el bloque `imagenes` de cada `.md`. Scripts de búsqueda y descarga en `scripts/imagenes/`. Build OK.
  El usuario pidió seguir con los puntos siguientes sin pedir confirmación entre ellos.
- 2026-10-23: Punto 7 terminado. Portada, recorrido por salas (con vitrinas para grupos grandes), ficha con
  anterior/siguiente y flechas del teclado, índice con búsqueda y filtros. 316 páginas. Las salas tienen ahora
  `descripcion` en `mitologia.yaml`. Detalle en `memories/arquitectura.md` (sección Páginas).
- 2026-10-23: Punto 8 terminado. Tema claro/oscuro con botón, cabecera compacta en móvil (sin desbordamiento a
  360 px), imágenes solo WebP (sitio de 183 MB a ~80 MB), accesibilidad documentada en `memories/diseno.md`.
- 2026-10-23: Punto 9 terminado. Guías en `memories/guias/` (agregar-ser, modificar-datos, agregar-imagen,
  agregar-mitologia). Revisadas las memorias contra el código; README raíz actualizado; el pie ya no nombra
  solo a Hesíodo.
- 2026-10-23: Punto 10 terminado. Workflow `.github/workflows/pages.yml` (build en GitHub Actions con Node 26 y
  publicación en Pages), `base` configurable (`BASE_PATH`), probado en local bajo `/museum/`. Pendiente del
  dueño: Settings → Pages → Source: GitHub Actions. Detalle en `memories/despliegue.md`.

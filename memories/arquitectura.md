# Arquitectura

Sitio estático con Astro 7. Los datos viven en archivos (sin base de datos ni API): agregar o
corregir un ser es editar un archivo y volver a construir.

## Estructura de carpetas
```
src/
  content.config.ts                  # esquemas de las colecciones (ver esquema-datos.md)
  content/mitologias/
    griega/
      mitologia.yaml                 # metadatos: canon, salas, categorías, tema
      seres/                         # un .md por ser (se permiten subcarpetas)
        caos.md
        gea.md
      imagenes/                      # fotos de obras reales (ver imagenes.md)
        zeus-1.jpg
    nordica/
      mitologia.yaml                 # estado: proximamente (sin seres aún)
  lib/mitologias.ts                  # ÚNICA puerta de acceso a los datos + validación
  lib/formato.ts                     # utilidades de presentación (urls, números romanos, vitrinas)
  layouts/Museo.astro                # layout común: cabecera, pie, tema claro/oscuro, colores de la mitología
  components/Obra.astro              # obra enmarcada (imagen optimizada) o ficha tipográfica sin imagen
  styles/museo.css                   # estilos globales y variables de color
  pages/index.astro                  # portada: vestíbulo y selector de mitologías
  pages/[mitologia]/index.astro      # recorrido: plano y salas como galerías
  pages/[mitologia]/[ser].astro      # ficha del ser con anterior/siguiente
  pages/[mitologia]/indice.astro     # índice con búsqueda y filtros
scripts/imagenes/                    # búsqueda y descarga de obras en Commons (ver imagenes.md)
memories/                            # documentación y contexto (este directorio)
```

## Multi-mitología
- Cada mitología es una carpeta en `src/content/mitologias/<id>/`. El `<id>` (p. ej. `griega`, `nordica`)
  es el nombre de la carpeta y se usará en las URLs (`/griega/...`).
- Cada mitología define en su `mitologia.yaml` sus propias **salas** (eras o capítulos del canon) y
  **categorías** (titán, olímpico... o æsir, vanir, jötunn...). Nada de eso está fijado en el código.
- `estado: proximamente` muestra la mitología en la portada sin enlazarla.
- Ids de los seres: globalmente `<mitologia>/<archivo>` (`griega/gea`); dentro de la mitología se usa
  solo el nombre del archivo (`gea`), que es lo que va en `padres` y `parejas`.

## Flujo de datos
1. Astro carga los archivos con el loader `glob` y valida cada uno contra su esquema Zod
   (`src/content.config.ts`). Un campo con tipo incorrecto detiene el build con el archivo y el campo.
2. Las páginas piden los datos a `src/lib/mitologias.ts`:
   - `getMitologias()`: todas, ordenadas por `orden`.
   - `getMitologia(id)`.
   - `getSeres(mitologia)`: seres en orden cronológico, con `hijos` calculados y relaciones validadas.
   - `getSer(mitologia, slug)`.
   - `getSalas(mitologia)`: salas de `mitologia.yaml` con sus seres.
3. `getSeres` valida lo que Zod no puede ver (depende de otros archivos) y detiene el build con una
   lista de errores si: la sala o la categoría no existen en `mitologia.yaml`, un padre o pareja no existe,
   un ser sin padres no tiene `origen`, o dos seres comparten el mismo `orden`.

## Decisiones
- **Los hijos no se escriben**: se calculan a partir de `padres` para que la genealogía no pueda contradecirse.
- **El orden cronológico es explícito** (`orden`) y no se deduce del nombre del archivo. En la griega, `orden`
  = verso de primera aparición en la Teogonía (decimales para desempatar). Ver `mitologias/griega.md`.
- **Markdown por ser**: el frontmatter son los datos y el cuerpo es la descripción larga (se renderiza con `render()`).
- **Imágenes junto a los datos** (`<mitologia>/imagenes/`), validadas con `image()`: una ruta rota detiene el build.
- `z` se importa de `astro/zod` (el de `astro:content` está obsoleto y desaparece en Astro 8).

## Páginas (Punto 7)
Solo se generan rutas para mitologías con `estado: activa`.

| URL | Archivo | Qué muestra |
|---|---|---|
| `/` | `pages/index.astro` | Vestíbulo con obras destacadas (lista `destacados`) y una tarjeta por mitología |
| `/<mitologia>/` | `pages/[mitologia]/index.astro` | Introducción, plano de salas (anclas `#<sala>`) y cada sala como galería. Los grupos de más de `TAMANO_VITRINA` (6) miembros se agrupan en una **vitrina**: los que tienen obra, enmarcados; el resto, lista de nombres |
| `/<mitologia>/<slug>/` | `pages/[mitologia]/[ser].astro` | Obra grande con crédito, datos, citas, parentesco con enlaces, "del mismo grupo", otras obras, y **anterior/siguiente** en orden cronológico (flechas ← → del teclado) |
| `/<mitologia>/indice/` | `pages/[mitologia]/indice.astro` | Todos los seres; búsqueda sin tildes por nombre, nombre original, transliteración y otros nombres; filtros por sala, categoría y "solo con obra". El estado de los filtros queda en la URL (`?q=zeus&sala=olimpicos`) |

- Imágenes: `<Picture>` de `astro:assets` genera AVIF y WebP en varios anchos. La primera generación tarda
  ~5 min (313 páginas, 103 obras); después Astro las reutiliza de su caché (`node_modules/.astro`, en el volumen).
- Encuadre: las miniaturas recortan a 3:4 con `object-position: 50% 15%` (cabezas de estatuas visibles);
  un ser puede cambiarlo con `enfoque` en su imagen.
- Nombres de las vitrinas: `NOMBRE_GRUPO` en `lib/formato.ts`.

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
  pages/index.astro                  # portada provisional (lista de comprobación)
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

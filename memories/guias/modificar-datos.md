# Guía: modificar datos

Toda la información está en archivos; no hay base de datos. Se cambia el archivo y se vuelve a construir.

| Quiero cambiar... | Dónde |
|---|---|
| Nombre, epíteto, descripción, citas o dominio de un ser | `src/content/mitologias/<mitologia>/seres/<slug>.md` (frontmatter y cuerpo) |
| Padres o parejas | mismo `.md`, listas `padres` / `parejas` con ids de otros seres. Los `hijos` se recalculan solos |
| Posición en el recorrido | `orden` del `.md` (único). Si cae en otro rango de versos, cambiar también `sala` |
| Nombre, versos o texto de una sala | `salas` en `mitologia.yaml`. El orden de la lista es el del recorrido |
| Nombre o descripción de una categoría | `categorias` en `mitologia.yaml` |
| Colores de una mitología | `tema.piedra` y `tema.acento` en `mitologia.yaml` |
| Obras destacadas de la portada | lista `destacados` en `src/pages/index.astro` |
| Nombre visible de una vitrina (grupo) | `NOMBRE_GRUPO` en `src/lib/formato.ts`; tamaño mínimo: `TAMANO_VITRINA` |
| Crédito o encuadre de una imagen | bloque `imagenes` del `.md` (`enfoque: "50% 20%"` mueve el recorte) |
| Estilos | `src/styles/museo.css` (global) y `<style>` de cada página (ver `memories/diseno.md`) |

## Renombrar un ser (cambiar su slug)
1. Renombrar el archivo `.md`.
2. Buscar el id viejo en `padres` y `parejas` de los demás: `grep -rn '"viejo"' src/content/mitologias/griega/seres/`.
3. Su imagen `viejo-1.jpg` puede quedarse con ese nombre (o renombrarse actualizando `archivo`).
4. La URL antigua (`/griega/viejo/`) deja de existir.

## Cambiar el esquema (añadir un campo)
1. Añadirlo en `src/content.config.ts`, opcional o con `.default(...)` para no romper los 313 archivos.
2. Mostrarlo en `src/pages/[mitologia]/[ser].astro`.
3. Documentarlo en `memories/esquema-datos.md`.

## Validar siempre
`docker compose run --rm build`. Los errores de datos detienen el build con la lista de archivos y problemas.

# Esquema de datos

Fuente de verdad: `src/content.config.ts`. Si cambias el esquema, actualiza este archivo.

## `mitologia.yaml` (uno por mitología)
| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | texto | "Mitología griega" |
| `estado` | `activa` \| `proximamente` | `proximamente` aparece en la portada sin enlace |
| `orden` | número | posición en la portada |
| `descripcion` | texto | presentación corta |
| `canon` | objeto | `obra`, `autor`, `fecha`, `traduccionReferencia?`, `url?` |
| `criterioOrden` | texto? | cómo se decide el orden cronológico |
| `tema` | objeto | `piedra` (color del mármol de las salas), `acento` (marcos y cartelas) |
| `categorias` | lista | `{ id, nombre, descripcion? }` |
| `salas` | lista ordenada | `{ id, nombre, versos?, descripcion? }`; el orden de la lista es el del recorrido |

## Ser (`seres/<id>.md`)
Frontmatter YAML + cuerpo markdown (la descripción larga).

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `nombre` | texto | sí | nombre en español |
| `nombreOriginal` | texto | | en la lengua original: `Γαῖα` |
| `transliteracion` | texto | | `Gaîa` |
| `otrosNombres` | lista | | variantes para el buscador: `[Gaia, Tierra]` |
| `titulo` | texto | | epíteto corto para la cartela |
| `orden` | número | sí | posición cronológica, **única** en la mitología |
| `sala` | id | sí | debe existir en `salas` de `mitologia.yaml` |
| `categoria` | id | sí | debe existir en `categorias` |
| `grupo` | texto | | conjunto al que pertenece: `nereidas`, `ciclopes` |
| `colectivo` | sí/no | | `true` si el ser es un grupo sin miembros con nombre (p. ej. las Keres) |
| `padres` | lista de ids | | ids locales: `[gea, urano]` |
| `origen` | texto | si no hay `padres` | cómo surge: "Nace de la espuma del mar" |
| `parejas` | lista de ids | | |
| `dominio` | lista | | lo que gobierna o personifica |
| `aparicion` | `{ obra, versos }` | sí | primera aparición en el canon |
| `otrasFuentes` | lista de `{ obra, versos }` | | otros pasajes relevantes |
| `citas` | lista de `{ versos, texto }` | | texto en español |
| `imagenes` | lista | | obras reales que lo representan; la primera es la principal (ver abajo) |

`hijos` **no se escribe**: se calcula con los `padres` de los demás seres.

### `imagenes`
Cada imagen es un archivo en `src/content/mitologias/<mitologia>/imagenes/` y una entrada en la lista.
Reglas de selección y licencias: `memories/imagenes.md`.

| Campo | Obligatorio | Descripción |
|---|---|---|
| `archivo` | sí | ruta **relativa al .md**: `"../imagenes/zeus-1.jpg"`. Si no existe, el build falla con `ImageNotFound` |
| `obra` | sí | título de la obra: "Zeus de Otrícoli" |
| `autor` | | escultor o pintor; "Anónimo" si no se conoce |
| `fecha` | | "siglo IV a. C.", "c. 1630" |
| `ubicacion` | | museo o lugar: "Museos Vaticanos" |
| `fotografo` | | autor de la fotografía en Commons (obligatorio para dar crédito si la licencia es CC BY / CC BY-SA) |
| `licencia` | sí | "Dominio público", "CC0", "CC BY 4.0", "CC BY-SA 3.0"... |
| `fuente` | sí | URL de la página del archivo en Wikimedia Commons |
| `alt` | | texto alternativo; si falta se usa "<obra> (<nombre>)" |
| `enfoque` | | punto de recorte para miniaturas (CSS `object-position`): `"50% 20%"` |

Un ser sin `imagenes` se muestra con una ficha tipográfica (nombre griego grabado).

## Ejemplo completo
```markdown
---
nombre: "Zeus"
nombreOriginal: "Ζεύς"
transliteracion: "Zeus"
otrosNombres: ["Júpiter", "Crónida"]
titulo: "Padre de los dioses y de los hombres"
orden: 457
sala: olimpicos
categoria: olimpico
padres: ["crono", "rea"]
parejas: ["metis", "hera"]
dominio: ["el cielo", "el rayo"]
aparicion: { obra: Teogonía, versos: "457-506" }
citas:
  - versos: "457-458"
    texto: "Y al prudente Zeus, padre de dioses y hombres, ..."
imagenes:
  - archivo: "../imagenes/zeus-1.jpg"
    obra: "Zeus de Otrícoli"
    autor: "Anónimo (copia romana de un original griego)"
    fecha: "siglo IV a. C. (original)"
    ubicacion: "Museos Vaticanos"
    fotografo: "Nombre del fotógrafo"
    licencia: "CC BY-SA 3.0"
    fuente: "https://commons.wikimedia.org/wiki/File:..."
---
Descripción larga en markdown.
```

Notas de YAML: los valores van entre comillas dobles (`"117-118"`), si no `116` se lee como número.
Las listas cortas en una línea (`["a", "b"]`); las listas de objetos en bloque con `-`.

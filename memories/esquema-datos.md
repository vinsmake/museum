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
| `tema` | objeto | `piedra` (color de las estatuas), `acento` (color de la sala) |
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
| `titulo` | texto | | epíteto corto para la placa de la estatua |
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
| `estatua` | objeto | | ver abajo |

`hijos` **no se escribe**: se calcula con los `padres` de los demás seres.

### `estatua`
| Campo | Por defecto | Valores |
|---|---|---|
| `figura` | `humana` | `humana`, `alada`, `abstracta`, `serpentina`, `monstruo`... (la lista definitiva sale del Punto 4) |
| `genero` | `neutro` | `femenino`, `masculino`, `neutro` |
| `escala` | `1` | tamaño relativo |
| `atributos` | `[]` | objetos que porta: `rayo`, `tridente`, `hoz`, `cornucopia`, `alas`... (catálogo en `estatuas.md`, Punto 4) |

## Ejemplo completo
```markdown
---
nombre: Gea
nombreOriginal: Γαῖα
transliteracion: Gaîa
otrosNombres: [Gaia, Tierra]
titulo: La Tierra de ancho pecho
orden: 117
sala: primordiales
categoria: primordial
origen: Surge después del Caos, sin padres.
dominio: [la tierra]
aparicion: { obra: Teogonía, versos: '117-118' }
citas:
  - versos: '117-118'
    texto: Después, Gea, la de ancho pecho, ...
estatua:
  figura: humana
  genero: femenino
  escala: 1.15
  atributos: [cornucopia]
---
Descripción larga en markdown.
```

Notas de YAML: poner los versos entre comillas (`'117-118'`), si no `116` se lee como número.
Textos largos con `>-` en varias líneas.

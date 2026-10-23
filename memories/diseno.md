# Diseño visual y accesibilidad (Punto 8)

## Identidad
- Museo clásico: paredes color piedra, obras en **marcos** dorados con sombra, **cartelas** bajo cada obra,
  ficha sin imagen como **placa de mármol** con el nombre griego grabado.
- Tipografías (Google Fonts, cargadas en `layouts/Museo.astro`): **Cinzel** (epigráfica, títulos y rótulos) y
  **EB Garamond** (texto). Variables `--epigrafica` y `--serif` en `styles/museo.css`.
- Colores por mitología: `tema.piedra` y `tema.acento` de `mitologia.yaml` llegan como `--piedra` y `--acento`
  al `<body>`; el resto de colores (`--pared`, `--marco`, `--enlace`...) se derivan con `color-mix`.

## Tema claro / oscuro
- Por defecto sigue el sistema (`prefers-color-scheme`). El botón ◐ de la cabecera lo fija y lo guarda en
  `localStorage` (`tema`), aplicado antes de pintar con un script inline para evitar parpadeo.
- Las variables oscuras están duplicadas en `@media (prefers-color-scheme: dark) :root:not([data-theme='light'])`
  y en `:root[data-theme='dark']`: si se cambia una, cambiar la otra.

## Accesibilidad
- Enlace "Saltar al contenido", `:focus-visible` con contorno del color de acento, navegación por teclado
  (flechas ← → en las fichas, ignoradas mientras se escribe en un campo).
- Imágenes con `alt` = `alt` del `.md` o "<obra> (<nombre>)"; las placas sin imagen tienen `role="img"` y etiqueta.
- `prefers-reduced-motion`: se anulan transiciones y el desplazamiento suave.
- Nombres griegos marcados con `lang="grc"`. El contador del índice es `aria-live`.

## Responsive
- Rejillas con `auto-fill` y `minmax(min(...), 1fr)`; la ficha pasa a una columna bajo 860 px.
- Cabecera compacta bajo 520 px. Comprobado sin desbordamiento horizontal a 360 y 375 px
  (portada, recorrido, índice y fichas con y sin imagen).

## Imágenes y peso
- Solo **WebP** (todos los navegadores actuales lo soportan). Se probó AVIF + WebP + JPG de respaldo: 183 MB;
  solo WebP: ~80 MB. Anchos: galería 320/480, ficha 640/960/1280, índice 96 (miniatura cuadrada).
- Miniaturas recortadas a 3:4 con `object-position: 50% 15%`; `enfoque` en el `.md` lo cambia por obra.

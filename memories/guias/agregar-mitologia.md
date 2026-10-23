# Guía: añadir una mitología (ejemplo: nórdica)

La nórdica ya existe como esqueleto en `src/content/mitologias/nordica/mitologia.yaml` con
`estado: proximamente` (sale en la portada sin enlace). Para activarla:

1. **Canon y criterio de orden.** Decidirlos con el usuario. Para la nórdica: la *Edda poética* (la Völuspá
   como hilo cronológico: Ginnungagap → creación → Æsir y Vanir → Ragnarök) y la *Edda prosaica* de Snorri
   (Gylfaginning). Un criterio posible: `orden` = estrofa de la Völuspá donde aparece el ser; para los que no
   aparecen, 1000 + capítulo del Gylfaginning. Escribirlo en `criterioOrden` y en
   `memories/mitologias/nordica.md` (nueva, con el modelo de `griega.md`).
2. **`mitologia.yaml`**: completar `canon`, `criterioOrden`, `categorias` (p. ej. `primordial`, `aesir`,
   `vanir`, `jotunn`, `enano`, `elfo`, `norna`, `valquiria`, `criatura`, `mortal`) y `salas` en orden
   (p. ej. Ginnungagap, Ymir y la creación, Los nueve mundos, Guerra de Æsir y Vanir, Los dioses de Asgard,
   Los hijos de Loki, La muerte de Baldr, El Ragnarök), cada una con `versos` (estrofas) y `descripcion`.
   Ajustar `tema` (colores).
3. **Seres**: un `.md` por ser en `src/content/mitologias/nordica/seres/` (guía `agregar-ser.md`), con
   `nombreOriginal` en nórdico antiguo (`Óðinn`) y `aparicion: { obra: Völuspá, versos: "3" }`.
   Los ids de `padres` y `parejas` son locales a la mitología: no se enlaza con seres griegos.
4. **Imágenes**: carpeta `src/content/mitologias/nordica/imagenes/` (guía `agregar-imagen.md`). Los scripts
   de `scripts/imagenes/` reciben la carpeta de la mitología como argumento.
5. **Activar**: `estado: activa`. Las rutas `/nordica/`, `/nordica/<slug>/` y `/nordica/indice/` se generan solas.
6. **Portada**: añadir slugs nórdicos a la lista `destacados` de `src/pages/index.astro` si se quiere que
   aparezcan en el vestíbulo. El atributo `lang="grc"` de los nombres originales en las páginas está pensado
   para el griego: para otra lengua, pasar el código de idioma a `mitologia.yaml` (p. ej. un campo `lengua: non`)
   y usarlo en las páginas.
7. **Validar** (`docker compose run --rm build`) y documentar: nueva fila en el índice de `memories/README.md`.

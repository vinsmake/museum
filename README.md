# Museo Mitológico Interactivo

Museo web con obras reales (esculturas, vasijas, pinturas) de los seres mitológicos, en recorrido cronológico según su fuente canónica
(griega: *Teogonía* de Hesíodo: 313 seres en 11 salas, 112 con obra de Wikimedia Commons). Hecho con Astro y ejecutado solo con Docker Compose.

```sh
docker compose up dev                                # http://localhost:4321 (desarrollo)
docker compose run --rm build                        # genera ./dist
docker compose --profile tools up -d preview         # sirve ./dist en http://localhost:4322
```

Páginas: `/` (portada), `/griega/` (recorrido por salas), `/griega/<ser>/` (ficha, con ← → para avanzar),
`/griega/indice/` (búsqueda y filtros).

Toda la documentación y el contexto del proyecto están en [`memories/`](memories/README.md); las guías para
añadir seres, imágenes o mitologías, en [`memories/guias/`](memories/guias/).

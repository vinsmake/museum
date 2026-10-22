# Museo Mitológico Interactivo

Museo web con estatuas de los seres mitológicos, en orden cronológico según su fuente canónica
(griega: *Teogonía* de Hesíodo). Hecho con Astro y ejecutado solo con Docker Compose.

```sh
docker compose up dev                 # http://localhost:4321
docker compose run --rm build         # genera ./dist
```

Toda la documentación y el contexto del proyecto están en [`memories/`](memories/README.md).

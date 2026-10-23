# Publicación web (Punto 10)

## Dónde
**GitHub Pages**, desde el repositorio `https://github.com/vinsmake/museum` (remoto `origin`).
URL pública: **https://vinsmake.github.io/museum/**

Se eligió porque el repositorio ya estaba en GitHub, el sitio es estático (`dist/`, ~80 MB) y el build corre en
los servidores de GitHub (nada se instala en el host).

## Cómo funciona
- `.github/workflows/pages.yml`: en cada `push` a `main` (o a mano desde la pestaña Actions) instala con
  `npm ci`, construye con Node 26 y publica `dist/` con `actions/deploy-pages`.
- El sitio vive en una subcarpeta (`/museum/`). `astro.config.mjs` lee `SITE` y `BASE_PATH` del entorno; el
  workflow los define. En local no se definen y el sitio va en la raíz. Todas las URLs internas usan
  `import.meta.env.BASE_URL` (`base` en `src/lib/formato.ts`); nunca escribir enlaces con `/` fijo.
- Caché de las imágenes optimizadas (`node_modules/.astro`) entre ejecuciones para no tardar ~5 minutos.

## Configuración única en GitHub (la hace el dueño del repositorio)
Settings → Pages → Build and deployment → Source: **GitHub Actions**. Sin esto el job `deploy` falla.

## Probar el build de producción en local (con la subcarpeta)
```
MSYS_NO_PATHCONV=1 docker compose run --rm -e BASE_PATH=/museum -e SITE=https://vinsmake.github.io build
docker compose --profile tools up -d preview     # http://localhost:4322/museum/
```
`MSYS_NO_PATHCONV=1` es necesario en Git Bash: si no, convierte `/museum` en `C:/Program Files/Git/museum`.

## Otro hosting
`dist/` es estático y sirve en cualquier sitio (Netlify, Cloudflare Pages, un servidor propio). Si va en la raíz
de un dominio, construir sin `BASE_PATH`.

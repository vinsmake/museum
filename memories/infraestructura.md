# Infraestructura (Docker + Astro)

Regla del usuario: **nada se instala en la computadora host**. Todo (Node, npm, Astro, dependencias)
corre dentro de contenedores con Docker Compose.

## Versiones (fijadas el 2026-10-22)
| Pieza | Versión | Dónde se fija |
|---|---|---|
| Node | `26.12.1-alpine` (era la última y coincidía con el tag `current`) | `Dockerfile` (`FROM`) |
| Astro | `7.4.2` | `package.json` / `package-lock.json` |
| Docker | 29.9.2, Compose v5.6.0 (Docker Desktop en Windows) | host |

### Actualizar Node a la versión más reciente
1. Ver el último tag: `curl -s "https://hub.docker.com/v2/repositories/library/node/tags?page_size=100&name=alpine&ordering=last_updated"`
   (o comparar el digest de `current-alpine` con el del tag numérico).
2. Cambiar el `FROM` del `Dockerfile` y `engines.node` en `package.json`.
3. `docker compose build --no-cache` y `docker compose run --rm npm install`.

## Archivos
- `Dockerfile`: imagen única para dev y build. Instala dependencias y arranca `astro dev` en `0.0.0.0:4321`.
- `docker-compose.yml`: proyecto `museo-mitologico`. Monta el repo en `/app` y guarda `node_modules`
  en el volumen nombrado `node_modules`, que nunca toca el host.
- `.dockerignore`: excluye `node_modules`, `dist`, `.astro`, `memories`, `.git`.
- `astro.config.mjs`: salida estática, `host: true`, y **polling** de Vite para que los cambios
  hechos en Windows se detecten dentro del contenedor.

## Servicios
| Servicio | Perfil | Uso | URL |
|---|---|---|---|
| `dev` | (por defecto) | Servidor de desarrollo con recarga en caliente | http://localhost:4321 |
| `build` | `tools` | Genera `./dist` | — |
| `preview` | `tools` | Sirve `./dist` ya construido | http://localhost:4322 |
| `npm` | `tools` | Ejecuta cualquier comando npm | — |

Los servicios del perfil `tools` no arrancan con `docker compose up`; se ejecutan con `docker compose run --rm <servicio>`.

## Comandos
```sh
docker compose up -d dev                 # arrancar en segundo plano
docker compose logs -f dev               # ver logs
docker compose down                      # detener
docker compose run --rm build            # build estático -> ./dist
docker compose run --rm --service-ports preview   # probar el build
docker compose run --rm npm install <paquete>     # añadir una dependencia
docker compose run --rm npm install               # reinstalar según package.json
docker compose run --rm --entrypoint npx npm astro add <integración>
docker compose build                     # reconstruir la imagen (tras cambiar Dockerfile)
```

## Problemas conocidos y soluciones
- **"failed to connect to the docker API ... dockerDesktopLinuxEngine"**: Docker Desktop no está abierto.
  Abrirlo (`Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"`) y esperar a que `docker info` responda.
- **Rutas en Git Bash**: con `docker run -v` usar `MSYS_NO_PATHCONV=1` delante, si no Git Bash reescribe `/app`.
  Con `docker compose` no hace falta.
- **Dependencias nuevas no aparecen en `dev`**: tras `npm install <paquete>` reiniciar con `docker compose restart dev`.
  Si el volumen quedó desfasado: `docker compose down -v` (borra el volumen `node_modules`) y volver a levantar.
- **La recarga no detecta cambios**: depende del polling en `astro.config.mjs` y de `CHOKIDAR_USEPOLLING`; no quitarlos.

## Cómo se creó el proyecto (referencia)
Plantilla `minimal` de `create-astro`, generada en un contenedor temporal y copiada al repo:
`docker run --rm -v <repo>:/work -w /tmp node:26.12.1-alpine sh -c "npm create astro@latest -- app --template minimal --no-install --no-git --skip-houston --yes && cp -r /tmp/app/. /work/"`

## Verificado el 2026-10-22
- `docker compose up -d dev` → HTTP 200 en `http://localhost:4321` con el título "Museo Mitológico".
- Recarga en caliente: un cambio en `src/pages/index.astro` se vio sin reiniciar.
- `docker compose run --rm build` → `dist/index.html` generado.

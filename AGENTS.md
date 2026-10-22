# Instrucciones para agentes

Antes de trabajar, lee `memories/README.md` y `memories/todo.md`: ahí está todo el contexto del proyecto.

- No instales nada en el host. Todo corre con Docker Compose (ver `memories/infraestructura.md`):
  `docker compose up -d dev`, `docker compose run --rm build`, `docker compose run --rm npm <args>`.
- Trabaja un punto del `todo.md` a la vez y pide confirmación antes de empezar el siguiente.
- Al terminar, actualiza `memories/todo.md` y la memoria correspondiente.
- Documentación de Astro: https://docs.astro.build

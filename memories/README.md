# Memorias del proyecto: Museo Mitológico Interactivo

**Si eres una sesión nueva, empieza aquí.** Esta carpeta guarda todo el contexto del proyecto,
porque las sesiones cambian y el contexto se pierde.

## Orden de lectura
1. `todo.md`: plan completo, stack, restricciones del usuario y qué punto está en curso.
2. Las memorias del punto en el que se esté trabajando (ver índice abajo).

## Reglas de trabajo con el usuario
- Se trabaja **un punto del `todo.md` a la vez** y se pide confirmación antes de empezar el siguiente.
- Todo con **Docker Compose**; nunca instalar nada en la máquina host.
- Node en su versión más reciente; frontend en Astro.
- Al terminar algo, actualizar `todo.md` (marcar `[x]` y anotar en "Registro de avance") y la memoria correspondiente.

## Git
- Rama `main`. Un commit por punto terminado (mensaje "Punto N: ...").
- `.gitattributes` fuerza finales de línea LF.

## Índice de memorias
| Archivo | Contenido | Estado |
|---|---|---|
| `todo.md` | Plan y avance | listo |
| `infraestructura.md` | Docker, comandos, puertos | listo |
| `arquitectura.md` | Estructura multi-mitología | listo |
| `esquema-datos.md` | Campos de cada ser | listo |
| `mitologias/griega.md` | Fuentes, criterio de orden, salas, nombres repetidos y pasajes ambiguos | listo |
| `estatuas.md` | Generador procedural de estatuas | pendiente (Punto 4) |
| `guias/agregar-ser.md` | Cómo añadir un ser | pendiente (Punto 8) |
| `guias/modificar-datos.md` | Cómo editar datos | pendiente (Punto 8) |
| `guias/agregar-mitologia.md` | Cómo añadir una mitología nueva | pendiente (Punto 8) |
| `despliegue.md` | Publicación web | pendiente (Punto 9) |

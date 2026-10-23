# Imágenes de las obras

El museo muestra **obras reales** (esculturas antiguas, cerámica pintada, pinturas, relieves) que representan a
cada ser. Decisión del usuario (2026-10-22): imágenes de **Wikimedia Commons**, **descargadas** al proyecto.
Los seres sin obra conocida se muestran con una ficha tipográfica, sin imagen.

## Dónde van
- Archivos: `src/content/mitologias/<mitologia>/imagenes/<slug>-<n>.jpg` (n = 1 para la principal).
  Junto a los datos de su mitología, para que cada mitología sea autocontenida.
- Datos: lista `imagenes` en el `.md` del ser (campos en `memories/esquema-datos.md`).
- Astro las procesa en el build (`image()` en el esquema): genera tamaños y formatos optimizados. Si un `archivo`
  no existe, el build falla con `ImageNotFound` y la ruta.

## Reglas de selección
1. **Solo licencias libres**: dominio público, CC0, CC BY o CC BY-SA. Nada con "fair use" ni "todos los derechos reservados".
   Comprobar la licencia en la página del archivo en Commons (no suponerla).
2. **Crédito siempre**: guardar `licencia`, `fuente` (URL de Commons) y, si la licencia es CC BY / CC BY-SA,
   el `fotografo`. La ficha del ser muestra el crédito debajo de la imagen.
3. **Preferencia de obras**: (a) escultura o cerámica griega antigua, (b) copia romana, (c) pintura clásica
   (Renacimiento a siglo XIX). Que el ser sea reconocible y que la obra lo identifique (inscripción, atributos o
   catalogación del museo).
4. **No inventar identificaciones**: si Commons o el museo no identifican la figura como ese ser, no se usa.
5. Tamaño de descarga: miniatura de Commons de 1280 px de ancho (JPG, o PNG si el original es PNG).

## Proceso de descarga (Punto 6)
Scripts en `scripts/imagenes/` (Node puro, sin dependencias; corren dentro de Docker montando la carpeta):

| Archivo | Qué hace |
|---|---|
| `consultas-N.json` | Búsquedas en inglés por ser (`slug -> [consultas]`) |
| `buscar.mjs` | `node buscar.mjs consultas-N.json resultados-N.json`: busca en Commons (API `generator=search`), filtra licencias libres y guarda candidatos con autor, descripción y licencia |
| `resultados-N.json` | Candidatos encontrados (se revisaron a mano) |
| `seleccion.mjs` | **La elección hecha a mano**: `slug -> [{ t, f?, obra, autor, fecha, ubic }]`. `t` es el título en Commons o `R:<slug>:<i>` (candidato i de los resultados). `f` fuerza el nombre local cuando varios seres comparten archivo (p. ej. `moiras` para Cloto, Láquesis y Átropos) |
| `descargar.mjs` | `node descargar.mjs <carpeta-mitologia>`: pide a Commons la miniatura de 1280 px, licencia y autor; descarga lo que falte en `imagenes/`; escribe el bloque `imagenes` en cada `.md` que aún no lo tenga; deja `descargadas.json` (registro de créditos) |

Comando (Git Bash; `MSYS_NO_PATHCONV=1` evita que Windows reescriba las rutas):
```
MSYS_NO_PATHCONV=1 docker compose run --rm -v "$PWD/scripts/imagenes:/trabajo" --entrypoint node npm \
  /trabajo/descargar.mjs /app/src/content/mitologias/griega
```

Límites de Wikimedia (aprendido a la mala):
- La API responde HTML "too many requests" si se consulta rápido: los scripts esperan 1,5 s y reintentan con espera creciente.
- `upload.wikimedia.org` devuelve **429 con `Retry-After: 600`** tras ~45 descargas seguidas. El script respeta esa
  espera (y admite `-e ESPERA_INICIAL=<segundos>`). Usar anchos estándar de miniatura (1280): los anchos raros
  fuerzan a Commons a generar la miniatura y se bloquean antes.
- El script es reanudable: salta los archivos ya descargados y los `.md` que ya tienen `imagenes`.

### Resultado (2026-10-23)
- **103 archivos, 112 seres con imagen** (algunos archivos se comparten: Moiras, Grayas, Gerión y Euritión,
  Nereo y Doris, Cárites, Eneas y Anquises, Irene y Pluto), 75 MB en total. Los otros 201 seres usan la ficha sin imagen.
- Licencias: 54 dominio público, 14 CC0, 32 CC BY-SA (2.0 a 4.0), 6 CC BY (2.5 a 4.0).
- Registro completo de créditos (archivo local, título en Commons, licencia, autor de la foto, seres que lo usan):
  `scripts/imagenes/descargadas.json`. La fuente de verdad para la web es el bloque `imagenes` de cada `.md`.

Descartados a propósito (identificación dudosa en Commons): Iris, la tumba de las Harpías (Aelo), el
"Aristeo" de Antínoo y el mosaico de Ponto/Océano.

## Cómo añadir o cambiar una imagen a mano
1. Elegir el archivo en Commons y comprobar su licencia.
2. Descargar la versión de 1280 px (dentro de Docker, p. ej.
   `docker compose run --rm --entrypoint sh npm -c "wget -O src/content/mitologias/griega/imagenes/zeus-2.jpg '<url>'"`).
3. Añadir la entrada en `imagenes` del `.md` con `obra`, `licencia`, `fuente` y los demás datos que se conozcan.
4. `docker compose run --rm build` para validar.

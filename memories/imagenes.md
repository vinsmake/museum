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
5. Tamaño de descarga: versión reducida de Commons de ~1600 px de ancho, JPG.

## Proceso de descarga (Punto 6)
Se hace con un script que corre dentro de Docker (sin instalar nada en el host) y usa la API de Commons
(`commons.wikimedia.org/w/api.php`, `prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1600`) para obtener la URL
reducida, el autor y la licencia de cada archivo. Detalles del script y de la lista elegida: se completan en el Punto 6.

## Cómo añadir o cambiar una imagen a mano
1. Elegir el archivo en Commons y comprobar su licencia.
2. Descargar la versión de ~1600 px (dentro de Docker, p. ej.
   `docker compose run --rm --entrypoint sh npm -c "wget -O src/content/mitologias/griega/imagenes/zeus-2.jpg '<url>'"`).
3. Añadir la entrada en `imagenes` del `.md` con `obra`, `licencia`, `fuente` y los demás datos que se conozcan.
4. `docker compose run --rm build` para validar.

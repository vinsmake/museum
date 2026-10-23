# Guía: añadir o cambiar la imagen de un ser

Reglas (licencias, qué obras valen, no inventar identificaciones): `memories/imagenes.md`.

## A mano (una imagen)
1. Buscar en https://commons.wikimedia.org una obra que **identifique** al ser (inscripción, atributos o
   catalogación del museo). Comprobar en la página del archivo que la licencia es dominio público, CC0,
   CC BY o CC BY-SA.
2. Obtener la miniatura de 1280 px: en la página del archivo, "Otras resoluciones" → 1280 px
   (URL del tipo `https://upload.wikimedia.org/wikipedia/commons/thumb/.../1280px-<archivo>`).
3. Descargarla **dentro de Docker** (nada en el host):
   ```
   docker compose run --rm --entrypoint sh npm -c \
     "wget -U MuseoMitologico -O src/content/mitologias/griega/imagenes/heracles-1.jpg '<url 1280px>'"
   ```
   Nombre: `<slug>-<n>.jpg` (n = 1 para la principal).
4. Añadir al `.md`, antes del `---` de cierre del frontmatter:
   ```yaml
   imagenes:
     - archivo: "../imagenes/heracles-1.jpg"
       obra: "Heracles Farnesio"
       autor: "Glicón de Atenas (copia de Lisipo)"
       fecha: "siglo III d. C."
       ubicacion: "Museo Arqueológico Nacional de Nápoles"
       fotografo: "Autor de la foto"   # solo si la licencia es CC BY / CC BY-SA
       licencia: "CC BY-SA 4.0"
       fuente: "https://commons.wikimedia.org/wiki/File:..."
   ```
   La primera de la lista es la principal; las demás salen en "Otras obras" de la ficha.
5. Si la miniatura corta mal la figura, añadir `enfoque: "50% 10%"` (posición del recorte).
6. `docker compose run --rm build` (falla con `ImageNotFound` si la ruta está mal).

## En lote (muchas imágenes)
Con los scripts de `scripts/imagenes/` (ver `memories/imagenes.md`, "Proceso de descarga"):
1. Añadir consultas a un `consultas-N.json` y ejecutar `buscar.mjs` para obtener candidatos.
2. Añadir la elección a `seleccion.mjs`.
3. Ejecutar `descargar.mjs`: descarga lo que falte y escribe `imagenes` solo en los `.md` que aún no lo tienen
   (para reemplazar una imagen ya escrita, borrar antes el bloque `imagenes` de ese `.md`).
4. Wikimedia limita las descargas (429, esperar 10 minutos); el script lo respeta.

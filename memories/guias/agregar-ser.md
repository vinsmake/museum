# Guía: añadir un ser

Ejemplo: añadir a **Heracles**, si no existiera, en la mitología griega.

1. **Elegir el id (slug)**: minúsculas, sin tildes ni espacios (`heracles`). Es el nombre del archivo y la URL
   (`/griega/heracles/`). Si choca con otro ser del mismo nombre, añadir un sufijo (`tetis-nereida`); ver la
   tabla de nombres repetidos en `memories/mitologias/griega.md`.
2. **Calcular el `orden`**: verso de la *Teogonía* donde se narra su nacimiento (o su primera mención).
   Debe ser **único**: si ya hay un ser en ese verso, usar decimales (`950.1`, `950.2`) en el orden en que
   el poema los nombra. Comprobar: `grep -rn "^orden: 950" src/content/mitologias/griega/seres/`.
3. **Elegir `sala`** (la sala cuyo rango de versos contiene el `orden`) y **`categoria`** (ids en
   `src/content/mitologias/griega/mitologia.yaml`).
4. **Crear** `src/content/mitologias/griega/seres/heracles.md`:
   ```markdown
   ---
   nombre: "Heracles"
   nombreOriginal: "Ἡρακλῆς"
   transliteracion: "Hēraklês"
   otrosNombres: ["Hércules"]
   titulo: "El mayor de los héroes"
   orden: 943
   sala: reinado-de-zeus
   categoria: mortal
   padres: ["zeus", "alcmena"]
   parejas: ["hebe"]
   dominio: ["la fuerza", "los trabajos"]
   aparicion: { obra: Teogonía, versos: "943-944" }
   citas:
     - versos: "943-944"
       texto: "Alcmena dio a luz al fuerte Heracles, unida en amor a Zeus, que amontona las nubes."
   ---
   Descripción en uno o dos párrafos (markdown).
   ```
   - Sin `padres` es obligatorio `origen` ("Surge por sí mismo", "Nace de la sangre de Urano").
   - `hijos` **no se escribe**: aparece solo en la ficha de los padres.
   - Todos los campos: `memories/esquema-datos.md`.
5. **Imagen** (opcional): `memories/guias/agregar-imagen.md`. Sin imagen se muestra la placa con el nombre griego.
6. **Validar**: `docker compose run --rm build`. Si algo falla, el error indica el archivo y el problema
   (sala inexistente, padre que no existe, `orden` repetido...).
7. **Ver**: `docker compose up -d dev` y abrir `http://localhost:4321/griega/heracles/`. Aparece solo en el
   recorrido, en el índice y en la navegación anterior/siguiente, en su lugar cronológico.
8. Si pertenece a un grupo grande (`grupo: nereidas`), sale dentro de la vitrina del grupo.

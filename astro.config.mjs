// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Publicación (memories/despliegue.md): en GitHub Pages el sitio vive en /museum/.
  // SITE y BASE_PATH los define el workflow; en local el sitio va en la raíz.
  site: process.env.SITE,
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'always',
  server: { host: true, port: 4321 },
  vite: {
    // Polling: los cambios hechos en Windows se detectan dentro del contenedor.
    server: { watch: { usePolling: true, interval: 300 } },
  },
});

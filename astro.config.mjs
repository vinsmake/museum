// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  server: { host: true, port: 4321 },
  vite: {
    // Polling: los cambios hechos en Windows se detectan dentro del contenedor.
    server: { watch: { usePolling: true, interval: 300 } },
  },
});

import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: 'C:/tmp/threejs-project1-vite-cache',
  server: {
    proxy: {
      '/api/horizons': {
        target: 'https://ssd.jpl.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/horizons/, '/api/horizons.api'),
      },
    },
  },
});

import tailwindcss from '@tailwindcss/vite';
import vue2 from '@vitejs/plugin-vue2';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [vue2(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './frontend/src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // Backend routes have no /api prefix; same-origin proxy avoids CORS in local dev.
      proxy: {
        '/api': {
          target: 'http://localhost:8888',
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

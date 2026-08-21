import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:4174',
      '/reference': 'http://127.0.0.1:4174',
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, 'index.html'),
        pdfViewer: resolve(import.meta.dirname, 'pdf-viewer.html'),
      },
    },
    sourcemap: false,
  },
});

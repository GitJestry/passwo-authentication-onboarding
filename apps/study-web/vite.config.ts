import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url));
const packageSource = (packageName: string): string =>
  resolve(repositoryRoot, 'packages', packageName, 'src', 'index.ts');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@passwo/ui/styles.css',
        replacement: resolve(repositoryRoot, 'packages', 'ui', 'src', 'styles.css'),
      },
      { find: '@passwo/contracts', replacement: packageSource('contracts') },
      { find: '@passwo/study-engine', replacement: packageSource('study-engine') },
      { find: '@passwo/training-engine', replacement: packageSource('training-engine') },
      { find: '@passwo/training-content', replacement: packageSource('training-content') },
      { find: '@passwo/password-analysis', replacement: packageSource('password-analysis') },
      { find: '@passwo/visualization', replacement: packageSource('visualization') },
      { find: '@passwo/ui', replacement: packageSource('ui') },
    ],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:4174' },
  },
  preview: { host: '127.0.0.1', port: 5173, strictPort: true },
  build: { outDir: 'dist', sourcemap: true },
});

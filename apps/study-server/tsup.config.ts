import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: false,
  entry: ['src/index.ts'],
  format: ['esm'],
  noExternal: ['@passwo/contracts'],
  platform: 'node',
  sourcemap: true,
  target: 'node22',
});

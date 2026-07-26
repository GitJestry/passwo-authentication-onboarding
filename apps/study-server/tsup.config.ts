import { defineConfig } from 'tsup';

export default defineConfig({
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  clean: true,
  dts: false,
  entry: ['src/runtime.ts'],
  external: ['better-sqlite3'],
  format: ['esm'],
  noExternal: [/^(?!better-sqlite3(?:\/|$)).*/],
  platform: 'node',
  sourcemap: true,
  target: 'node22',
});

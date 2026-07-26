import { defineConfig } from 'tsup';

export default defineConfig([
  {
    clean: true,
    banner: {
      js: "import { createRequire as createDesktopRequire } from 'node:module'; const require = createDesktopRequire(import.meta.url);",
    },
    entry: { main: 'src/main.ts' },
    external: ['better-sqlite3', 'electron'],
    format: ['esm'],
    noExternal: [/^(?!(?:better-sqlite3|electron)(?:\/|$)).*/],
    platform: 'node',
    sourcemap: true,
    target: 'node24',
  },
  {
    clean: false,
    entry: { preload: 'src/preload.ts' },
    external: ['electron'],
    format: ['cjs'],
    outExtension: () => ({ js: '.cjs' }),
    platform: 'node',
    sourcemap: true,
    target: 'node24',
  },
]);

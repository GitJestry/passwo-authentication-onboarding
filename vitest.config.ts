import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'packages/**/*.test.ts',
      'apps/study-server/**/*.test.ts',
      'apps/study-web/src/features/training/segments/S02/**/*.test.ts',
      'apps/study-web/src/features/training/segments/S06/**/*.test.ts',
    ],
    passWithNoTests: false,
    restoreMocks: true,
  },
});

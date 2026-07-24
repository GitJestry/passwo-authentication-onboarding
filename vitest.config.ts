import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

function fromRoot(path: string): string {
  return fileURLToPath(new URL(path, import.meta.url));
}

export default defineConfig({
  resolve: {
    alias: {
      '@passwo/contracts': fromRoot('./packages/contracts/src/index.ts'),
      '@passwo/study-engine': fromRoot('./packages/study-engine/src/index.ts'),
      '@passwo/training-engine': fromRoot('./packages/training-engine/src/index.ts'),
      '@passwo/training-content': fromRoot('./packages/training-content/src/index.ts'),
      '@passwo/password-analysis': fromRoot('./packages/password-analysis/src/index.ts'),
      '@passwo/visualization': fromRoot('./packages/visualization/src/index.ts'),
      '@passwo/ui': fromRoot('./packages/ui/src/index.ts'),
    },
  },
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

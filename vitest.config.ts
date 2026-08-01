import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'packages/password-analysis/src/password-analysis.test.ts',
      'packages/contracts/src/contracts.test.ts',
      'packages/study-engine/src/study-machine.test.ts',
      'packages/study-engine/src/timing.test.ts',
      'packages/training-content/src/s00-s01.traceability.test.ts',
      'packages/training-content/src/s03.traceability.test.ts',
      'packages/training-engine/src/password-module-machine.test.ts',
      'packages/training-engine/src/password-module-controller.test.ts',
      'packages/training-engine/src/password-module-privacy.test.ts',
      'apps/study-server/src/app.test.ts',
      'apps/study-server/src/recontact.test.ts',
      'apps/study-server/src/research-export.test.ts',
      'apps/study-server/src/runtime-restart.test.ts',
    ],
    passWithNoTests: false,
    restoreMocks: true,
  },
});

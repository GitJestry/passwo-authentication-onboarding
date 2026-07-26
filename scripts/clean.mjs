import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const generatedDirectories = [
  'apps/study-web/dist',
  'apps/study-server/dist',
  'apps/study-desktop/dist',
  'apps/study-desktop/out',
  'apps/study-desktop/.forge-package',
  '.forge-package',
  'playwright-report',
  'test-results',
  'coverage',
];
const packages = [
  'contracts',
  'study-engine',
  'training-engine',
  'training-content',
  'password-analysis',
  'visualization',
  'ui',
];

for (const path of generatedDirectories) {
  await rm(resolve(repositoryRoot, path), { recursive: true, force: true });
}

for (const packageName of packages) {
  await rm(resolve(repositoryRoot, 'packages', packageName, 'dist'), {
    recursive: true,
    force: true,
  });
}

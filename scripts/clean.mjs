import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const roots = ['apps/study-web/dist', 'apps/study-server/dist'];
const packages = [
  'contracts',
  'study-engine',
  'training-engine',
  'training-content',
  'password-analysis',
  'visualization',
  'ui',
];

for (const path of roots) {
  await rm(resolve(path), { recursive: true, force: true });
}

for (const packageName of packages) {
  await rm(resolve('packages', packageName, 'dist'), { recursive: true, force: true });
}

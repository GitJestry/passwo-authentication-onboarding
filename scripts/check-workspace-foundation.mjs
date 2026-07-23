import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const expectedPackages = new Map([
  ['apps/study-server/package.json', '@passwo/study-server'],
  ['apps/study-web/package.json', '@passwo/study-web'],
  ['packages/contracts/package.json', '@passwo/contracts'],
  ['packages/password-analysis/package.json', '@passwo/password-analysis'],
  ['packages/study-engine/package.json', '@passwo/study-engine'],
  ['packages/training-content/package.json', '@passwo/training-content'],
  ['packages/training-engine/package.json', '@passwo/training-engine'],
  ['packages/ui/package.json', '@passwo/ui'],
  ['packages/visualization/package.json', '@passwo/visualization'],
]);

const requiredRootFiles = [
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  'tsconfig.json',
  'biome.json',
  'vitest.config.ts',
  'playwright.config.ts',
];

const failures = [];

async function readRequired(relativePath) {
  try {
    return await readFile(resolve(root, relativePath), 'utf8');
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : 'UNKNOWN';
    failures.push(`${relativePath}: missing or unreadable (${code})`);
    return null;
  }
}

for (const relativePath of requiredRootFiles) {
  await readRequired(relativePath);
}

for (const [relativePath, expectedName] of expectedPackages) {
  const source = await readRequired(relativePath);
  if (source === null) continue;

  try {
    const manifest = JSON.parse(source);
    if (manifest.name !== expectedName) {
      failures.push(
        `${relativePath}: expected package name ${expectedName}, found ${String(manifest.name)}`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid JSON';
    failures.push(`${relativePath}: ${message}`);
  }
}

const workspaceSource = await readRequired('pnpm-workspace.yaml');
if (workspaceSource !== null) {
  for (const pattern of ['- apps/*', '- packages/*']) {
    if (!workspaceSource.includes(pattern)) {
      failures.push(`pnpm-workspace.yaml: missing workspace pattern "${pattern}"`);
    }
  }
}

if (failures.length > 0) {
  process.stderr.write('PassWo workspace foundation is incomplete:\n');
  for (const failure of failures) process.stderr.write(`- ${failure}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `PassWo workspace foundation complete: ${expectedPackages.size} package manifests and ${requiredRootFiles.length} root files verified.\n`,
  );
}

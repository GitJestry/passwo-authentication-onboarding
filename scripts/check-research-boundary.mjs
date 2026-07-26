import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const violations = [];

async function read(relativePath) {
  return readFile(join(repositoryRoot, relativePath), 'utf8');
}

async function walk(relativeDirectory) {
  const absoluteDirectory = join(repositoryRoot, relativeDirectory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const childRelative = join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(childRelative)));
    } else {
      files.push(childRelative);
    }
  }

  return files;
}

function sourceFiles(paths) {
  return paths.filter((path) => ['.ts', '.tsx', '.js', '.mjs'].includes(extname(path)));
}

function moduleSpecifiers(content) {
  const specifiers = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/gu,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/gu,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/gu,
  ];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      if (match[1] !== undefined) specifiers.add(match[1]);
    }
  }
  return [...specifiers];
}

function report(path, message) {
  violations.push(`${path}: ${message}`);
}

const gitignore = await read('.gitignore');
if (!gitignore.includes('research/private/**')) {
  violations.push('.gitignore must exclude research/private/**.');
}
if (gitignore.includes('!research/private/README.md')) {
  violations.push('.gitignore must not make research/private/README.md trackable.');
}

const tracked = spawnSync('git', ['ls-files', 'research/private'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});
if (tracked.status === 0) {
  const trackedPrivateFiles = tracked.stdout.split('\n').filter(Boolean);
  if (trackedPrivateFiles.length > 0) {
    violations.push(`Private research files are tracked: ${trackedPrivateFiles.join(', ')}`);
  }
}

const scannedRoots = ['apps/study-server/src', 'packages/contracts/src'];
const forbiddenPatterns = [
  {
    pattern: /localStorage|sessionStorage|indexedDB|serviceWorker/iu,
    label: 'browser persistence API',
  },
  {
    pattern: /console\.(?:log|debug|info)\s*\(/u,
    label: 'unstructured console logging',
  },
  {
    pattern: /displayName|fictionalPassword|passwordFragment|similarityFinding/iu,
    label: 'forbidden persisted/tracked field',
  },
  {
    pattern: /user-agent|request\.ip|remoteAddress/iu,
    label: 'network-identifying metadata',
  },
];

for (const scannedRoot of scannedRoots) {
  for (const path of sourceFiles(await walk(scannedRoot))) {
    const content = await read(path);
    for (const { pattern, label } of forbiddenPatterns) {
      if (pattern.test(content)) {
        report(relative(repositoryRoot, join(repositoryRoot, path)), label);
      }
    }
  }
}

for (const path of sourceFiles(await walk('apps/study-web/src'))) {
  const content = await read(path);
  for (const specifier of moduleSpecifiers(content)) {
    if (
      specifier === 'electron' ||
      specifier.startsWith('electron/') ||
      specifier === '@passwo/study-server' ||
      specifier.startsWith('@passwo/study-server/') ||
      specifier.includes('study-server/src')
    ) {
      report(path, `renderer must not import desktop/server boundary "${specifier}"`);
    }
    if (specifier === 'better-sqlite3' || specifier.startsWith('better-sqlite3/')) {
      report(path, `renderer persistence must remain behind the local HTTP API ("${specifier}")`);
    }
  }
}

for (const path of sourceFiles(await walk('apps/study-desktop/src'))) {
  const content = await read(path);
  for (const specifier of moduleSpecifiers(content)) {
    if (specifier.startsWith('.') || specifier.startsWith('/')) continue;
    const allowed =
      specifier === 'electron' ||
      specifier.startsWith('node:') ||
      specifier === '@passwo/contracts' ||
      specifier === '@passwo/study-server/runtime';
    if (!allowed) {
      report(
        path,
        `desktop source may import only Electron, Node, @passwo/contracts, or @passwo/study-server/runtime; found "${specifier}"`,
      );
    }
  }
  const forbiddenDesktopContent = [
    { pattern: /\b(?:SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)\b/iu, label: 'SQL statement' },
    { pattern: /\/api\/study\//u, label: 'research endpoint implementation' },
    {
      pattern: /\b(?:createMachine|setup\s*\(|from ['"]xstate['"])/u,
      label: 'statechart implementation',
    },
    {
      pattern: /@passwo\/training-(?:content|engine)|trainingContent/iu,
      label: 'training content or orchestration',
    },
  ];
  for (const { pattern, label } of forbiddenDesktopContent) {
    if (pattern.test(content)) report(path, `desktop native boundary contains ${label}`);
  }
}

for (const path of sourceFiles(await walk('apps/study-server/src'))) {
  const content = await read(path);
  for (const specifier of moduleSpecifiers(content)) {
    if (specifier.startsWith('@passwo/') && specifier !== '@passwo/contracts') {
      report(path, `server shared-layer import must be @passwo/contracts; found "${specifier}"`);
    }
  }
}

for (const engineRoot of ['packages/study-engine/src', 'packages/training-engine/src']) {
  for (const path of sourceFiles(await walk(engineRoot))) {
    const content = await read(path);
    for (const specifier of moduleSpecifiers(content)) {
      if (
        specifier === 'react' ||
        specifier.startsWith('react/') ||
        specifier === '@xstate/react'
      ) {
        report(path, `framework-free engine must not import React ("${specifier}")`);
      }
    }
  }
}

for (const path of sourceFiles(await walk('packages/training-content/src'))) {
  const content = await read(path);
  for (const specifier of moduleSpecifiers(content)) {
    if (
      specifier === 'react' ||
      specifier.startsWith('react/') ||
      specifier === '@passwo/ui' ||
      specifier.startsWith('@passwo/ui/')
    ) {
      report(path, `training content must remain UI-free ("${specifier}")`);
    }
  }
}

for (const packageRoot of [
  'packages/contracts/src',
  'packages/password-analysis/src',
  'packages/study-engine/src',
  'packages/training-content/src',
  'packages/training-engine/src',
  'packages/ui/src',
  'packages/visualization/src',
]) {
  for (const path of sourceFiles(await walk(packageRoot))) {
    const content = await read(path);
    for (const specifier of moduleSpecifiers(content)) {
      if (specifier === 'better-sqlite3' || specifier.startsWith('better-sqlite3/')) {
        report(path, `persistence must remain server-side ("${specifier}")`);
      }
    }
    if (
      /\b(?:CREATE TABLE|INSERT INTO|SELECT[\s\S]{0,120}\bFROM|UPDATE[\s\S]{0,120}\bSET|DELETE FROM)\b/iu.test(
        content,
      )
    ) {
      report(path, 'SQL persistence must remain in apps/study-server');
    }
  }
}

for (const requiredPath of ['docs/research/DATA-CONTRACT.md', 'docs/research/STUDY-RUNTIME.md']) {
  try {
    await read(requiredPath);
  } catch {
    violations.push(`Missing required boundary document: ${requiredPath}`);
  }
}

if (violations.length > 0) {
  process.stderr.write(`Research-boundary check failed:\n- ${violations.join('\n- ')}\n`);
  process.exit(1);
}

process.stdout.write('Research-boundary check passed.\n');

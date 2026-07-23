import { spawnSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
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

const gitignore = await read('.gitignore');
if (!gitignore.includes('research/private/**')) {
  violations.push('.gitignore must exclude research/private/**.');
}
if (!gitignore.includes('!research/private/README.md')) {
  violations.push('.gitignore must keep research/private/README.md trackable.');
}

const tracked = spawnSync('git', ['ls-files', 'research/private'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});
if (tracked.status === 0) {
  const trackedPrivateFiles = tracked.stdout
    .split('\n')
    .filter(Boolean)
    .filter((path) => path !== 'research/private/README.md');
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
  for (const path of await walk(scannedRoot)) {
    if (!['.ts', '.tsx', '.js', '.mjs'].includes(extname(path))) {
      continue;
    }
    const content = await read(path);
    for (const { pattern, label } of forbiddenPatterns) {
      if (pattern.test(content)) {
        violations.push(`${relative(repositoryRoot, join(repositoryRoot, path))}: ${label}`);
      }
    }
  }
}

for (const requiredPath of [
  'docs/research/DATA-CONTRACT.md',
  'docs/research/STUDY-RUNTIME.md',
  'research/private/README.md',
]) {
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

import { spawn } from 'node:child_process';
import { lstat, mkdir, readFile, rmdir, symlink, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const desktopDirectory = resolve(repositoryRoot, 'apps/study-desktop');
const desktopModulesDirectory = resolve(desktopDirectory, 'node_modules');
const desktopPackagePath = resolve(desktopDirectory, 'package.json');
const createdDependencyLinks = [];
const preparedDependencyNames = new Set();

async function preparePackageManifest() {
  const originalManifest = await readFile(desktopPackagePath, 'utf8');
  const packageManifest = JSON.parse(originalManifest);
  await writeFile(
    desktopPackagePath,
    `${JSON.stringify(
      {
        ...packageManifest,
        devDependencies: { electron: packageManifest.devDependencies.electron },
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  return originalManifest;
}

async function dependencyLink(packageName, optional) {
  if (preparedDependencyNames.has(packageName)) return;
  preparedDependencyNames.add(packageName);

  const dependencyPath = resolve(repositoryRoot, 'node_modules', packageName);
  const linkPath = resolve(desktopModulesDirectory, packageName);
  try {
    await lstat(linkPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    try {
      await lstat(dependencyPath);
    } catch (dependencyError) {
      if (optional && dependencyError.code === 'ENOENT') return;
      throw dependencyError;
    }
    await mkdir(dirname(linkPath), { recursive: true });
    await symlink(relative(dirname(linkPath), dependencyPath), linkPath);
    createdDependencyLinks.push(linkPath);
  }

  const packageManifest = JSON.parse(await readFile(join(dependencyPath, 'package.json'), 'utf8'));
  for (const dependencyName of Object.keys(packageManifest.dependencies ?? {})) {
    await dependencyLink(dependencyName, false);
  }
  for (const dependencyName of Object.keys(packageManifest.optionalDependencies ?? {})) {
    await dependencyLink(dependencyName, true);
  }
}

function runForge() {
  return new Promise((resolveRun, rejectRun) => {
    const forgeProcess = spawn(
      'pnpm',
      ['exec', 'electron-forge', 'package', '.', '--platform=darwin', '--arch=arm64'],
      { cwd: desktopDirectory, stdio: 'inherit' },
    );
    forgeProcess.once('error', rejectRun);
    forgeProcess.once('exit', (code, signal) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      rejectRun(new Error(`Electron Forge exited with ${String(code ?? signal)}.`));
    });
  });
}

async function removeEmptyParentDirectories(linkPath) {
  let directoryPath = dirname(linkPath);
  while (directoryPath !== desktopModulesDirectory) {
    try {
      await rmdir(directoryPath);
    } catch {
      return;
    }
    directoryPath = dirname(directoryPath);
  }
}

const originalPackageManifest = await preparePackageManifest();
try {
  await dependencyLink('better-sqlite3', false);
  await dependencyLink('electron', false);
  await runForge();
} finally {
  await writeFile(desktopPackagePath, originalPackageManifest, 'utf8');
  for (const linkPath of createdDependencyLinks.reverse()) {
    await unlink(linkPath);
    await removeEmptyParentDirectories(linkPath);
  }
}

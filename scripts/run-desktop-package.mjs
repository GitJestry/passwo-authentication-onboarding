import { spawn } from 'node:child_process';
import { cp, lstat, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const desktopDirectory = resolve(repositoryRoot, 'apps/study-desktop');
const desktopDistributionDirectory = resolve(desktopDirectory, 'dist');
const desktopPackagePath = resolve(desktopDirectory, 'package.json');
const forgeConfigPath = resolve(desktopDirectory, 'forge.config.mjs');
const forgeExecutable = resolve(repositoryRoot, 'node_modules/.bin/electron-forge');
const stagingDirectory = resolve(desktopDirectory, '.forge-package');
const stagingModulesDirectory = resolve(stagingDirectory, 'node_modules');
const preparedDependencyNames = new Set();

async function prepareStagingDirectory() {
  const packageManifest = JSON.parse(await readFile(desktopPackagePath, 'utf8'));
  const electronVersion = packageManifest.devDependencies?.electron;
  if (typeof electronVersion !== 'string') {
    throw new Error('Desktop package manifest does not declare Electron.');
  }

  await rm(stagingDirectory, { recursive: true, force: true });
  await mkdir(stagingDirectory, { recursive: true });
  await cp(desktopDistributionDirectory, resolve(stagingDirectory, 'dist'), {
    recursive: true,
  });
  await writeFile(
    resolve(stagingDirectory, 'package.json'),
    `${JSON.stringify(
      {
        ...packageManifest,
        config: {
          ...packageManifest.config,
          forge: relative(stagingDirectory, forgeConfigPath),
        },
        devDependencies: { electron: electronVersion },
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

async function dependencyLink(packageName, optional) {
  if (preparedDependencyNames.has(packageName)) return;
  preparedDependencyNames.add(packageName);

  const dependencyPath = resolve(repositoryRoot, 'node_modules', packageName);
  try {
    await lstat(dependencyPath);
  } catch (error) {
    if (optional && error.code === 'ENOENT') return;
    throw error;
  }

  const linkPath = resolve(stagingModulesDirectory, packageName);
  await mkdir(dirname(linkPath), { recursive: true });
  await symlink(relative(dirname(linkPath), dependencyPath), linkPath);

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
      forgeExecutable,
      ['package', '.', '--platform=darwin', '--arch=arm64'],
      { cwd: stagingDirectory, stdio: 'inherit' },
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

try {
  await prepareStagingDirectory();
  await dependencyLink('better-sqlite3', false);
  await dependencyLink('electron', false);
  await runForge();
} finally {
  await rm(stagingDirectory, { recursive: true, force: true });
}

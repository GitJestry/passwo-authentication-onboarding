import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const expectedSourcePath =
  'research/private/reference/secaware/passwords-authentication/2026-07-26/source';
const expectedSnapshotId = 'secaware-passwords-authentication-2026-07-26';
const expectedReferenceVersion = 'secaware-passwords-authentication-2026-07-26';
const expectedEntryPoint = 'scormdriver/indexAPI.html';

function fail(message) {
  process.stderr.write(`Reference artifact verification failed: ${message}\n`);
  process.exitCode = 1;
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesBelow(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

function yamlScalar(yaml, key) {
  const match = yaml.match(new RegExp(`^\\s*${key}:\\s*["']?([^\\n"']+)["']?\\s*$`, 'mu'));
  return match?.[1]?.trim() ?? null;
}

async function manifestHash(sourceDirectory) {
  const files = (await filesBelow(sourceDirectory)).sort((left, right) =>
    relative(sourceDirectory, left).localeCompare(relative(sourceDirectory, right), 'en'),
  );
  const manifest = [];
  for (const file of files) {
    const relativePath = relative(sourceDirectory, file).split(sep).join('/');
    const fileHash = createHash('sha256')
      .update(await readFile(file))
      .digest('hex');
    manifest.push(`${fileHash}  ${relativePath}\n`);
  }
  return {
    fileCount: files.length,
    sha256: createHash('sha256').update(manifest.join('')).digest('hex'),
  };
}

if (
  process.argv.includes('--if-reference-study') &&
  process.env.STUDY_ASSIGNMENT_MODE === 'forced-supportive'
) {
  process.stdout.write('Reference artifact verification skipped for forced-supportive mode.\n');
  process.exit(0);
}

const sourceDirectory = process.env.REFERENCE_ARTIFACT_DIR
  ? resolve(process.env.REFERENCE_ARTIFACT_DIR)
  : resolve(repositoryRoot, expectedSourcePath);
const metadataPath = resolve(repositoryRoot, 'research/derived/reference-artifact.yaml');
const contractPath = resolve(repositoryRoot, 'packages/contracts/src/training.ts');

if (!existsSync(sourceDirectory)) {
  fail('the configured private source directory is missing.');
} else if (!existsSync(resolve(sourceDirectory, expectedEntryPoint))) {
  fail('the configured private source is missing its expected HTML entry point.');
} else {
  const [metadata, contracts] = await Promise.all([
    readFile(metadataPath, 'utf8'),
    readFile(contractPath, 'utf8'),
  ]);
  const documentedSourcePath = yamlScalar(metadata, 'sourcePath');
  const snapshotId = yamlScalar(metadata, 'snapshotId');
  const artifactVersion = yamlScalar(metadata, 'artifactVersion');
  const entryPoint = yamlScalar(metadata, 'entryPoint');
  const expectedHash = yamlScalar(metadata, 'manifestSha256');

  if (documentedSourcePath !== expectedSourcePath) {
    fail('the documented private source path does not match the expected source path.');
  } else if (snapshotId !== expectedSnapshotId) {
    fail('the frozen snapshot ID does not match the expected snapshot.');
  } else if (artifactVersion !== expectedReferenceVersion) {
    fail('the frozen artifact version does not match the expected reference version.');
  } else if (entryPoint !== expectedEntryPoint) {
    fail('the frozen HTML entry point does not match the expected entry point.');
  } else if (!contracts.includes(`REFERENCE_ARTIFACT_VERSION = '${expectedReferenceVersion}'`)) {
    fail('the canonical contract reference version does not match the frozen artifact.');
  } else if (!contracts.includes(`REFERENCE_ARTIFACT_SNAPSHOT_ID = '${expectedSnapshotId}'`)) {
    fail('the canonical contract snapshot ID does not match the frozen artifact.');
  } else if (expectedHash === null || !/^[a-f0-9]{64}$/u.test(expectedHash)) {
    fail('the frozen deterministic manifest SHA-256 is missing or invalid.');
  } else {
    const actualManifest = await manifestHash(sourceDirectory);
    if (actualManifest.sha256 !== expectedHash) {
      fail('the private snapshot differs from the frozen deterministic file manifest.');
    } else {
      const trackedPrivateFiles = spawnSync('git', ['ls-files', 'research/private'], {
        cwd: repositoryRoot,
        encoding: 'utf8',
      });
      if (trackedPrivateFiles.status !== 0) {
        fail('tracked-file protection could not be checked.');
      } else if (trackedPrivateFiles.stdout.trim() !== '') {
        fail('one or more private snapshot files are tracked by Git.');
      } else {
        process.stdout.write(
          `Reference artifact verified: ${expectedSnapshotId}, ${actualManifest.fileCount} files, manifest SHA-256 ${actualManifest.sha256}.\n`,
        );
      }
    }
  }
}

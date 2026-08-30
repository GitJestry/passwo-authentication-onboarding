import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assignmentModeSchema, REFERENCE_ARTIFACT_ENTRY_POINT } from '@passwo/contracts';
import { z } from 'zod';
import { startStudyRuntime, type StudyRuntime } from './runtime.js';

const defaultWebBuildDirectory = fileURLToPath(new URL('../../study-web/dist/', import.meta.url));
const defaultReferenceArtifactDirectory = fileURLToPath(
  new URL(
    '../../../research/private/reference/secaware/passwords-authentication/2026-07-26/study-build/',
    import.meta.url,
  ),
);

const productionEnvironmentSchema = z
  .object({
    PASSWO_PUBLIC_ORIGIN: z.string().trim().min(1),
    PASSWO_RESUME_CLOSE_AT: z.iso.datetime(),
    PASSWO_PORT: z.coerce.number().int().min(1).max(65_535).default(3_000),
    PASSWO_RELEASE_VERSION: z.string().trim().min(1).max(80).default('0.1.2'),
    PASSWO_WEB_BUILD_DIR: z.string().trim().min(1).optional(),
    PASSWO_REFERENCE_ARTIFACT_DIR: z.string().trim().min(1).optional(),
    PASSWO_ALLOW_DESIGN_LAB: z.enum(['true', 'false']).default('false'),
    STUDY_ASSIGNMENT_MODE: assignmentModeSchema.default('permuted-block'),
    STUDY_DATA_DIR: z.string().trim().min(1),
  })
  .passthrough();

function publicOrigin(value: string): string {
  const parsed = new URL(value);
  if (
    parsed.protocol !== 'https:' ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    parsed.pathname !== '/' ||
    parsed.search !== '' ||
    parsed.hash !== '' ||
    parsed.origin !== value
  ) {
    throw new Error('PASSWO_PUBLIC_ORIGIN must be one canonical HTTPS origin without a path.');
  }
  return parsed.origin;
}

function absolutePath(value: string): string {
  return resolve(value);
}

async function startProductionRuntime(): Promise<StudyRuntime> {
  const environment = productionEnvironmentSchema.parse(process.env);
  const origin = publicOrigin(environment.PASSWO_PUBLIC_ORIGIN);

  process.env.STUDY_DATA_DIR = absolutePath(environment.STUDY_DATA_DIR);
  const webBuildDirectory = absolutePath(
    environment.PASSWO_WEB_BUILD_DIR ?? defaultWebBuildDirectory,
  );
  const referenceArtifactDirectory = absolutePath(
    environment.PASSWO_REFERENCE_ARTIFACT_DIR ?? defaultReferenceArtifactDirectory,
  );

  if (!existsSync(resolve(webBuildDirectory, 'index.html'))) {
    throw new Error(`Study web build is missing at ${webBuildDirectory}.`);
  }
  if (
    environment.STUDY_ASSIGNMENT_MODE !== 'forced-supportive' &&
    !existsSync(resolve(referenceArtifactDirectory, REFERENCE_ARTIFACT_ENTRY_POINT))
  ) {
    throw new Error(`Reference artifact build is missing at ${referenceArtifactDirectory}.`);
  }

  return startStudyRuntime({
    version: environment.PASSWO_RELEASE_VERSION,
    assignmentMode: environment.STUDY_ASSIGNMENT_MODE,
    referenceArtifactDirectory,
    webBuildDirectory,
    webRuntime: {
      resumeCloseAtIso: environment.PASSWO_RESUME_CLOSE_AT,
      secureCookies: true,
      publicOrigin: origin,
      allowDesignLab: environment.PASSWO_ALLOW_DESIGN_LAB === 'true',
    },
    host: '127.0.0.1',
    port: environment.PASSWO_PORT,
  });
}

let runtime: StudyRuntime | null = null;
let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  process.stdout.write(`PassWo study service received ${signal}; closing.\n`);
  try {
    await runtime?.close();
    process.exitCode = 0;
  } catch (error) {
    process.stderr.write(
      `PassWo study service shutdown failed: ${error instanceof Error ? error.message : 'unknown-error'}\n`,
    );
    process.exitCode = 1;
  }
}

try {
  runtime = await startProductionRuntime();
  process.stdout.write(`PassWo study service listening on ${runtime.origin}.\n`);
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
} catch (error) {
  process.stderr.write(
    `PassWo study service failed to start: ${error instanceof Error ? error.message : 'unknown-error'}\n`,
  );
  process.exitCode = 1;
}

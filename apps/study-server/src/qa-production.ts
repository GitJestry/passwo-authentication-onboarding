import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REFERENCE_ARTIFACT_ENTRY_POINT } from '@passwo/contracts';
import { z } from 'zod';
import { startStudyRuntime, type StudyRuntime } from './runtime.js';

const defaultWebBuildDirectory = fileURLToPath(new URL('../../study-web/dist/', import.meta.url));
const defaultReferenceArtifactDirectory = fileURLToPath(
  new URL(
    '../../../research/private/reference/secaware/passwords-authentication/2026-07-26/study-build/',
    import.meta.url,
  ),
);

const qaEnvironmentSchema = z
  .object({
    PASSWO_PUBLIC_ORIGIN: z.string().trim().min(1),
    PASSWO_QA_RESUME_CLOSE_AT: z.iso.datetime().default('2099-01-01T00:00:00.000Z'),
    PASSWO_QA_SUPPORTIVE_PORT: z.coerce.number().int().min(1_024).max(65_535).default(3_101),
    PASSWO_QA_REFERENCE_PORT: z.coerce.number().int().min(1_024).max(65_535).default(3_102),
    PASSWO_RELEASE_VERSION: z.string().trim().min(1).max(80).default('0.1.2'),
    PASSWO_WEB_BUILD_DIR: z.string().trim().min(1).optional(),
    PASSWO_REFERENCE_ARTIFACT_DIR: z.string().trim().min(1).optional(),
  })
  .passthrough();

function canonicalPublicOrigin(value: string): string {
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

async function startQaRuntimes(): Promise<readonly [StudyRuntime, StudyRuntime]> {
  const environment = qaEnvironmentSchema.parse(process.env);
  if (environment.PASSWO_QA_SUPPORTIVE_PORT === environment.PASSWO_QA_REFERENCE_PORT) {
    throw new Error('The supportive and reference QA ports must differ.');
  }
  if (Date.parse(environment.PASSWO_QA_RESUME_CLOSE_AT) <= Date.now()) {
    throw new Error('PASSWO_QA_RESUME_CLOSE_AT must be in the future.');
  }

  const publicOrigin = canonicalPublicOrigin(environment.PASSWO_PUBLIC_ORIGIN);
  const webBuildDirectory = resolve(
    environment.PASSWO_WEB_BUILD_DIR ?? defaultWebBuildDirectory,
  );
  const referenceArtifactDirectory = resolve(
    environment.PASSWO_REFERENCE_ARTIFACT_DIR ?? defaultReferenceArtifactDirectory,
  );
  if (!existsSync(resolve(webBuildDirectory, 'index.html'))) {
    throw new Error(`Study web build is missing at ${webBuildDirectory}.`);
  }
  if (!existsSync(resolve(referenceArtifactDirectory, REFERENCE_ARTIFACT_ENTRY_POINT))) {
    throw new Error(`Reference artifact build is missing at ${referenceArtifactDirectory}.`);
  }

  const common = {
    databasePath: ':memory:',
    recontactDatabasePath: ':memory:',
    referenceArtifactDirectory,
    webBuildDirectory,
    webRuntime: {
      resumeCloseAtIso: environment.PASSWO_QA_RESUME_CLOSE_AT,
      secureCookies: true,
      publicOrigin,
      allowDesignLab: false,
      allowLiveQa: true,
      qaControlsEnabled: true,
    },
    host: '127.0.0.1' as const,
  };

  let supportive: StudyRuntime | null = null;
  try {
    supportive = await startStudyRuntime({
      ...common,
      version: `${environment.PASSWO_RELEASE_VERSION}-qa-supportive`,
      assignmentMode: 'forced-supportive',
      port: environment.PASSWO_QA_SUPPORTIVE_PORT,
      webRuntime: {
        ...common.webRuntime,
        resumeCookieName: '__Host-passwo-qa-supportive-resume',
      },
    });
    const reference = await startStudyRuntime({
      ...common,
      version: `${environment.PASSWO_RELEASE_VERSION}-qa-reference`,
      assignmentMode: 'forced-reference',
      port: environment.PASSWO_QA_REFERENCE_PORT,
      webRuntime: {
        ...common.webRuntime,
        resumeCookieName: '__Host-passwo-qa-reference-resume',
      },
    });
    return [supportive, reference];
  } catch (error) {
    await supportive?.close().catch(() => undefined);
    throw error;
  }
}

let runtimes: readonly [StudyRuntime, StudyRuntime] | null = null;
let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  process.stdout.write(`PassWo live QA received ${signal}; closing.\n`);
  try {
    await Promise.all(runtimes?.map((runtime) => runtime.close()) ?? []);
    process.exitCode = 0;
  } catch (error) {
    process.stderr.write(
      `PassWo live QA shutdown failed: ${error instanceof Error ? error.message : 'unknown-error'}\n`,
    );
    process.exitCode = 1;
  }
}

try {
  runtimes = await startQaRuntimes();
  process.stdout.write(
    `PassWo live QA listening on ${runtimes.map((runtime) => runtime.origin).join(' and ')}.\n`,
  );
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
} catch (error) {
  process.stderr.write(
    `PassWo live QA failed to start: ${error instanceof Error ? error.message : 'unknown-error'}\n`,
  );
  process.exitCode = 1;
}

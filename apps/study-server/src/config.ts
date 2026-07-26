import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type AssignmentMode, assignmentModeSchema } from '@passwo/contracts';
import { z } from 'zod';

const defaultReferenceArtifactDirectory = fileURLToPath(
  new URL(
    '../../../research/private/reference/secaware/passwords-authentication/2026-07-26/study-build/',
    import.meta.url,
  ),
);

export function resolveReferenceArtifactDirectory(
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const configuredDirectory = environment.REFERENCE_ARTIFACT_DIR?.trim();
  return configuredDirectory ? resolve(configuredDirectory) : defaultReferenceArtifactDirectory;
}

const environmentSchema = z.object({
  REFERENCE_ARTIFACT_DIR: z.string().trim().min(1).optional(),
  STUDY_ASSIGNMENT_MODE: assignmentModeSchema.default('permuted-block'),
  STUDY_DATA_DIR: z.string().trim().min(1).optional(),
  STUDY_PORT: z.coerce.number().int().min(1024).max(65_535).default(4174),
});

export interface StudyServerConfig {
  readonly assignmentMode: AssignmentMode;
  readonly dataDirectory: string;
  readonly host: '127.0.0.1';
  readonly port: number;
  readonly referenceArtifactDirectory: string;
}

export function loadStudyServerConfig(
  environment: NodeJS.ProcessEnv = process.env,
): StudyServerConfig {
  const parsed = environmentSchema.parse(environment);

  return {
    assignmentMode: parsed.STUDY_ASSIGNMENT_MODE,
    dataDirectory: parsed.STUDY_DATA_DIR
      ? resolve(parsed.STUDY_DATA_DIR)
      : resolve(homedir(), '.passwo-study'),
    host: '127.0.0.1',
    port: parsed.STUDY_PORT,
    referenceArtifactDirectory: resolveReferenceArtifactDirectory(environment),
  };
}

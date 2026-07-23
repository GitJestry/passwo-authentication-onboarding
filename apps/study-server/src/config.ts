import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { type AssignmentMode, assignmentModeSchema } from '@passwo/contracts';
import { z } from 'zod';

const environmentSchema = z.object({
  STUDY_ASSIGNMENT_MODE: assignmentModeSchema.default('permuted-block'),
  STUDY_DATA_DIR: z.string().trim().min(1).optional(),
  STUDY_PORT: z.coerce.number().int().min(1024).max(65_535).default(4174),
});

export interface StudyServerConfig {
  readonly assignmentMode: AssignmentMode;
  readonly dataDirectory: string;
  readonly host: '127.0.0.1';
  readonly port: number;
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
  };
}

import { homedir } from 'node:os';
import { resolve } from 'node:path';
import type { AssignmentMode } from '@passwo/contracts';
import type { FastifyInstance } from 'fastify';
import { buildStudyServer } from './app.js';
import { registerStudyWeb } from './static-web.js';

export interface StartStudyRuntimeOptions {
  readonly version: string;
  readonly assignmentMode?: AssignmentMode;
  readonly databasePath?: string;
  readonly referenceArtifactDirectory?: string;
  readonly webBuildDirectory?: string;
  readonly host?: '127.0.0.1';
  readonly port?: number;
}

export interface StudyRuntime {
  readonly origin: string;
  readonly server: FastifyInstance;
  close(): Promise<void>;
}

export function resolveStudyDatabasePath(
  environment: NodeJS.ProcessEnv = process.env,
  homeDirectory = homedir(),
): string {
  const configuredDataDirectory = environment.STUDY_DATA_DIR?.trim();
  return resolve(
    configuredDataDirectory || homeDirectory,
    configuredDataDirectory ? 'study.sqlite' : '.passwo-study/study.sqlite',
  );
}

export async function startStudyRuntime({
  version,
  assignmentMode,
  databasePath = resolveStudyDatabasePath(),
  referenceArtifactDirectory,
  webBuildDirectory,
  host = '127.0.0.1',
  port = 0,
}: StartStudyRuntimeOptions): Promise<StudyRuntime> {
  const server = buildStudyServer({
    version,
    ...(assignmentMode === undefined ? {} : { assignmentMode }),
    ...(databasePath === undefined ? {} : { databasePath }),
    ...(referenceArtifactDirectory === undefined ? {} : { referenceArtifactDirectory }),
  });

  try {
    await registerStudyWeb(server, webBuildDirectory === undefined ? {} : { webBuildDirectory });
    const origin = await server.listen({ host, port });
    return {
      origin,
      server,
      close: async () => server.close(),
    };
  } catch (error) {
    await server.close();
    throw error;
  }
}

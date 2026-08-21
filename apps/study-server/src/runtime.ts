import { homedir } from 'node:os';
import { resolve } from 'node:path';
import type { AssignmentMode } from '@passwo/contracts';
import type { FastifyInstance } from 'fastify';
import { buildStudyServer } from './app.js';
import { registerStudyWeb } from './static-web.js';

export interface StudyWebRuntimeOptions {
  readonly resumeCloseAtIso: string;
  readonly secureCookies: boolean;
  readonly publicOrigin?: string;
  readonly resumeCookieName?: string;
  readonly allowDesignLab?: boolean;
  readonly allowLiveQa?: boolean;
  readonly qaControlsEnabled?: boolean;
}

export interface StartStudyRuntimeOptions {
  readonly version: string;
  readonly assignmentMode?: AssignmentMode;
  readonly databasePath?: string;
  readonly recontactDatabasePath?: string;
  readonly referenceArtifactDirectory?: string;
  readonly webBuildDirectory?: string;
  readonly webRuntime?: StudyWebRuntimeOptions;
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

export function resolveRecontactDatabasePath(
  environment: NodeJS.ProcessEnv = process.env,
  homeDirectory = homedir(),
): string {
  const configuredDataDirectory = environment.STUDY_DATA_DIR?.trim();
  return resolve(
    configuredDataDirectory || homeDirectory,
    configuredDataDirectory ? 'recontact.sqlite' : '.passwo-study/recontact.sqlite',
  );
}

export async function startStudyRuntime({
  version,
  assignmentMode,
  databasePath = resolveStudyDatabasePath(),
  recontactDatabasePath,
  referenceArtifactDirectory,
  webBuildDirectory,
  webRuntime,
  host = '127.0.0.1',
  port = 0,
}: StartStudyRuntimeOptions): Promise<StudyRuntime> {
  const selectedRecontactDatabasePath =
    recontactDatabasePath ??
    (databasePath === ':memory:' ? ':memory:' : resolveRecontactDatabasePath());
  const server = buildStudyServer({
    version,
    ...(assignmentMode === undefined ? {} : { assignmentMode }),
    ...(databasePath === undefined ? {} : { databasePath }),
    recontactDatabasePath: selectedRecontactDatabasePath,
    ...(referenceArtifactDirectory === undefined ? {} : { referenceArtifactDirectory }),
    ...(webRuntime === undefined
      ? {}
      : {
          webRuntime: {
            resumeCloseAtIso: webRuntime.resumeCloseAtIso,
            secureCookies: webRuntime.secureCookies,
            ...(webRuntime.publicOrigin === undefined
              ? {}
              : { publicOrigin: webRuntime.publicOrigin }),
            ...(webRuntime.resumeCookieName === undefined
              ? {}
              : { resumeCookieName: webRuntime.resumeCookieName }),
            ...(webRuntime.qaControlsEnabled === undefined
              ? {}
              : { qaControlsEnabled: webRuntime.qaControlsEnabled }),
          },
        }),
  });

  try {
    await registerStudyWeb(server, {
      ...(webBuildDirectory === undefined ? {} : { webBuildDirectory }),
      allowDesignLab: webRuntime?.allowDesignLab ?? true,
      allowLiveQa: webRuntime?.allowLiveQa ?? false,
    });
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

import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  resolveRecontactDatabasePath,
  resolveStudyDatabasePath,
  type StudyRuntime,
  startStudyRuntime,
} from './runtime.js';
import { createTestResourceScope } from './test-support.js';

const resources = createTestResourceScope();

afterEach(() => resources.cleanup());

async function requestJson<T>(runtime: StudyRuntime, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${runtime.origin}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json' },
  });
  expect(response.ok).toBe(true);
  return response.json() as Promise<T>;
}

describe('Study Runtime restart compatibility', () => {
  it('resolves both databases from the same STUDY_DATA_DIR', () => {
    expect(
      resolveStudyDatabasePath({ STUDY_DATA_DIR: '/protected/study-data' }, '/unused-home'),
    ).toBe('/protected/study-data/study.sqlite');
    expect(
      resolveRecontactDatabasePath({ STUDY_DATA_DIR: '/protected/study-data' }, '/unused-home'),
    ).toBe('/protected/study-data/recontact.sqlite');
  });

  it('keeps one persisted session available after restart', async () => {
    const temporaryDirectory = resources.createTemporaryDirectory('passwo-runtime-restart-');
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const recontactDatabasePath = join(temporaryDirectory, 'recontact.sqlite');
    const firstRuntime = resources.track(
      await startStudyRuntime({
        version: '0.1.2',
        assignmentMode: 'forced-supportive',
        databasePath,
        recontactDatabasePath,
        host: '127.0.0.1',
        port: 0,
      }),
    );
    const session = await requestJson<{ sessionId: string }>(firstRuntime, '/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({
        requestId: randomUUID(),
        consentAccepted: true,
        followUpConsent: true,
        deletionCodeHash: 'a'.repeat(64),
      }),
    });
    await resources.close(firstRuntime);

    const restartedRuntime = resources.track(
      await startStudyRuntime({
        version: '0.1.2',
        assignmentMode: 'forced-supportive',
        databasePath,
        recontactDatabasePath,
        host: '127.0.0.1',
        port: 0,
      }),
    );

    expect(
      await requestJson(restartedRuntime, `/api/study/sessions/${session.sessionId}/status`),
    ).toEqual({ completionStatus: 'in-progress' });
  });
});

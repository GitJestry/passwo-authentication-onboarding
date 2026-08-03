import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  resolveRecontactDatabasePath,
  resolveStudyDatabasePath,
  type StudyRuntime,
  startStudyRuntime,
} from './runtime.js';

const temporaryDirectories: string[] = [];
const runtimes: StudyRuntime[] = [];

afterEach(async () => {
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.close()));
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

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
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-runtime-restart-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const recontactDatabasePath = join(temporaryDirectory, 'recontact.sqlite');
    const firstRuntime = await startStudyRuntime({
      version: '0.1.2',
      assignmentMode: 'forced-supportive',
      databasePath,
      recontactDatabasePath,
      host: '127.0.0.1',
      port: 0,
    });
    runtimes.push(firstRuntime);
    const session = await requestJson<{ sessionId: string }>(firstRuntime, '/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({
        requestId: randomUUID(),
        consentAccepted: true,
        recontactConsentAccepted: true,
        email: 'participant@example.org',
        deletionCodeHash: 'a'.repeat(64),
      }),
    });
    await firstRuntime.close();
    runtimes.splice(runtimes.indexOf(firstRuntime), 1);

    const restartedRuntime = await startStudyRuntime({
      version: '0.1.2',
      assignmentMode: 'forced-supportive',
      databasePath,
      recontactDatabasePath,
      host: '127.0.0.1',
      port: 0,
    });
    runtimes.push(restartedRuntime);

    expect(
      await requestJson(restartedRuntime, `/api/study/sessions/${session.sessionId}/status`),
    ).toEqual({ completionStatus: 'in-progress' });
  });
});

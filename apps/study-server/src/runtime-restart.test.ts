import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REFERENCE_ARTIFACT_VERSION, SUPPORTIVE_ARTIFACT_VERSION } from '@passwo/contracts';
import { afterEach, describe, expect, it } from 'vitest';
import { exportResearchData } from './research-export.js';
import { type StudyRuntime, startStudyRuntime } from './runtime.js';

const temporaryDirectories: string[] = [];
const runtimes: StudyRuntime[] = [];
const referenceArtifactFixtureDirectory = fileURLToPath(
  new URL('./test-fixtures/reference-artifact/', import.meta.url),
);

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
  it('preserves a session across restart and exports both conditions unchanged', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-runtime-restart-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');

    const supportiveRuntime = await startStudyRuntime({
      version: '0.1.2',
      assignmentMode: 'forced-supportive',
      databasePath,
      host: '127.0.0.1',
      port: 0,
    });
    runtimes.push(supportiveRuntime);
    const supportiveSession = await requestJson<{
      sessionId: string;
      condition: 'supportive';
    }>(supportiveRuntime, '/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({ requestId: randomUUID(), consentAccepted: true }),
    });
    await requestJson(
      supportiveRuntime,
      `/api/study/sessions/${supportiveSession.sessionId}/responses`,
      {
        method: 'POST',
        body: JSON.stringify({
          instrumentId: 'pre-placeholder',
          itemId: 'placeholder-complete',
          value: true,
        }),
      },
    );
    await requestJson(
      supportiveRuntime,
      `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      {
        method: 'POST',
        body: JSON.stringify({
          sequence: 0,
          phase: 'artifact',
          sectionId: null,
          segmentId: null,
          eventType: 'start',
          clientMonotonicMs: 100,
          clientWallClockIso: '2026-07-26T10:00:00.000Z',
          elapsedMs: null,
          reasonCode: null,
        }),
      },
    );
    await supportiveRuntime.close();
    runtimes.splice(runtimes.indexOf(supportiveRuntime), 1);

    const referenceRuntime = await startStudyRuntime({
      version: '0.1.2',
      assignmentMode: 'forced-reference',
      databasePath,
      referenceArtifactDirectory: referenceArtifactFixtureDirectory,
      host: '127.0.0.1',
      port: 0,
    });
    runtimes.push(referenceRuntime);
    const preservedStatus = await requestJson<{ completionStatus: string }>(
      referenceRuntime,
      `/api/study/sessions/${supportiveSession.sessionId}/status`,
    );
    expect(preservedStatus).toEqual({ completionStatus: 'in-progress' });

    const referenceSession = await requestJson<{
      sessionId: string;
      condition: 'reference';
    }>(referenceRuntime, '/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({ requestId: randomUUID(), consentAccepted: true }),
    });
    expect(referenceSession.condition).toBe('reference');
    await referenceRuntime.close();
    runtimes.splice(runtimes.indexOf(referenceRuntime), 1);

    const outputDirectory = join(temporaryDirectory, 'export');
    const result = exportResearchData({
      databasePath,
      outputDirectory,
      exportedAtIso: '2026-07-26T12:00:00.000Z',
    });
    expect(result.files).toEqual([
      'sessions.csv',
      'timing.csv',
      'responses.csv',
      'sessions.json',
      'timing.json',
      'responses.json',
      'manifest.json',
    ]);

    const sessions = JSON.parse(readFileSync(join(outputDirectory, 'sessions.json'), 'utf8')) as {
      sessionId: string;
      condition: string;
      contentVersion: string;
    }[];
    const timing = JSON.parse(readFileSync(join(outputDirectory, 'timing.json'), 'utf8')) as {
      sessionId: string;
    }[];
    const responses = JSON.parse(readFileSync(join(outputDirectory, 'responses.json'), 'utf8')) as {
      sessionId: string;
    }[];
    expect(sessions).toHaveLength(2);
    expect(sessions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sessionId: supportiveSession.sessionId,
          condition: 'supportive',
          contentVersion: SUPPORTIVE_ARTIFACT_VERSION,
        }),
        expect.objectContaining({
          sessionId: referenceSession.sessionId,
          condition: 'reference',
          contentVersion: REFERENCE_ARTIFACT_VERSION,
        }),
      ]),
    );
    expect(timing).toHaveLength(1);
    expect(timing[0]?.sessionId).toBe(supportiveSession.sessionId);
    expect(responses).toHaveLength(1);
    expect(responses[0]?.sessionId).toBe(supportiveSession.sessionId);
    expect(result.manifest.versions.content).toEqual(
      [REFERENCE_ARTIFACT_VERSION, SUPPORTIVE_ARTIFACT_VERSION].sort(),
    );
    expect(result.manifest.sessionCounts.reduce((sum, entry) => sum + entry.count, 0)).toBe(2);
    for (const file of result.manifest.files) {
      const content = readFileSync(join(outputDirectory, file.fileName));
      expect(createHash('sha256').update(content).digest('hex')).toBe(file.sha256);
    }
  });
});

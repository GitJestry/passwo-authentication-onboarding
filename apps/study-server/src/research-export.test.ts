import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildStudyServer } from './app.js';
import { exportResearchData } from './research-export.js';

const temporaryDirectories: string[] = [];
const servers: FastifyInstance[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { recursive: true, force: true });
  });
});

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

async function createSession(server: FastifyInstance, identity: number): Promise<string> {
  const response = await server.inject({
    method: 'POST',
    url: '/api/study/sessions',
    payload: {
      requestId: `10000000-0000-4000-8000-${identity.toString().padStart(12, '0')}`,
      consentAccepted: true,
    },
  });
  expect(response.statusCode).toBe(201);
  return response.json<{ sessionId: string }>().sessionId;
}

async function savePreAndStartArtifact(server: FastifyInstance, sessionId: string): Promise<void> {
  await server.inject({
    method: 'POST',
    url: `/api/study/sessions/${sessionId}/responses`,
    payload: {
      instrumentId: 'pre-placeholder',
      itemId: 'placeholder-complete',
      value: true,
    },
  });
  await server.inject({
    method: 'POST',
    url: `/api/study/sessions/${sessionId}/timing`,
    payload: {
      sequence: 0,
      phase: 'artifact',
      sectionId: null,
      segmentId: null,
      eventType: 'start',
      clientMonotonicMs: 100,
      clientWallClockIso: '2026-07-24T12:00:00.000Z',
      elapsedMs: null,
      reasonCode: null,
    },
  });
}

describe('research export', () => {
  it('writes deterministic CSV and JSON tables with manifest hashes inside the data contract', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-research-export-test-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const server = buildStudyServer({
      version: '0.1.2',
      assignmentMode: 'forced-supportive',
      databasePath,
      nowIso: () => '2026-07-24T12:00:00.000Z',
    });
    servers.push(server);

    const incompleteSessionId = await createSession(server, 1);
    await savePreAndStartArtifact(server, incompleteSessionId);
    const heartbeat = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${incompleteSessionId}/artifact-lease/heartbeat`,
      payload: {},
    });
    expect(heartbeat.json()).toEqual({ active: true });
    await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${incompleteSessionId}/incomplete-reload`,
    });

    const completedSessionId = await createSession(server, 2);
    await savePreAndStartArtifact(server, completedSessionId);
    await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${completedSessionId}/timing`,
      payload: {
        sequence: 1,
        phase: 'artifact',
        sectionId: null,
        segmentId: null,
        eventType: 'end',
        clientMonotonicMs: 900,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: 800,
        reasonCode: null,
      },
    });
    for (const instrumentId of ['post-placeholder', 'guardrail-placeholder'] as const) {
      await server.inject({
        method: 'POST',
        url: `/api/study/sessions/${completedSessionId}/responses`,
        payload: { instrumentId, itemId: 'placeholder-complete', value: true },
      });
    }
    await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${completedSessionId}/complete`,
      payload: { debriefAcknowledged: true },
    });

    await server.close();
    servers.splice(servers.indexOf(server), 1);

    const firstOutputDirectory = join(temporaryDirectory, 'first-export');
    const secondOutputDirectory = join(temporaryDirectory, 'second-export');
    const exportOptions = {
      databasePath,
      exportedAtIso: '2026-07-25T10:00:00.000Z',
    } as const;
    const first = exportResearchData({ ...exportOptions, outputDirectory: firstOutputDirectory });
    const second = exportResearchData({ ...exportOptions, outputDirectory: secondOutputDirectory });
    const manifest = JSON.parse(readFileSync(join(firstOutputDirectory, 'manifest.json'), 'utf8'));
    const sessions = JSON.parse(readFileSync(join(firstOutputDirectory, 'sessions.json'), 'utf8'));
    const timing = JSON.parse(readFileSync(join(firstOutputDirectory, 'timing.json'), 'utf8'));
    const responses = JSON.parse(
      readFileSync(join(firstOutputDirectory, 'responses.json'), 'utf8'),
    );

    expect(first.files).toEqual([
      'sessions.csv',
      'timing.csv',
      'responses.csv',
      'sessions.json',
      'timing.json',
      'responses.json',
      'manifest.json',
    ]);
    expect(first.manifest).toEqual(manifest);
    expect(second.manifest).toEqual(first.manifest);
    expect(sessions).toHaveLength(2);
    expect(responses).toHaveLength(4);
    expect(JSON.stringify({ sessions, timing, responses })).not.toMatch(
      /display.?name|password|training.?input|request.?body|user.?agent|ip.?address|heartbeat/iu,
    );
    expect(readFileSync(join(firstOutputDirectory, 'sessions.csv'), 'utf8')).toMatch(
      /^sessionId,participantCode,condition,assignmentMode,studyVersion,contentVersion/u,
    );

    for (const file of manifest.files as readonly { fileName: string; sha256: string }[]) {
      const content = readFileSync(join(firstOutputDirectory, file.fileName), 'utf8');
      expect(file.sha256).toBe(sha256(content));
      expect(readFileSync(join(secondOutputDirectory, file.fileName), 'utf8')).toBe(content);
    }
    expect(manifest.versions).toEqual({
      study: ['walking-skeleton-v1'],
      content: ['artifact-placeholder-v1'],
      questionnaire: ['questionnaire-placeholder-v1'],
      guardrail: ['guardrail-placeholder-v1'],
      consent: ['consent-placeholder-v1'],
      referenceArtifact: [],
    });
    expect(manifest.sessionCounts).toContainEqual({
      condition: 'supportive',
      completionStatus: 'completed',
      count: 1,
    });
    expect(manifest.sessionCounts).toContainEqual({
      condition: 'supportive',
      completionStatus: 'incomplete-reload',
      count: 1,
    });
  });
});

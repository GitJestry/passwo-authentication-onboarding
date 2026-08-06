import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { instrumentRuntimeManifest } from '@passwo/contracts';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildStudyServer } from './app.js';
import { exportResearchData } from './research-export.js';
import { createSession, savePreAndStartArtifact } from './test-support.js';

const servers: FastifyInstance[] = [];
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('research export', () => {
  it('exports the approved tables and excludes private training data', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-research-export-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const recontactDatabasePath = join(temporaryDirectory, 'recontact.sqlite');
    const rawToken = 'D'.repeat(43);
    const server = buildStudyServer({
      version: '0.1.2',
      assignmentMode: 'forced-supportive',
      databasePath,
      recontactDatabasePath,
      nowIso: () => '2026-07-24T12:00:00.000Z',
      createRecontactToken: () => rawToken,
    });
    servers.push(server);
    const session = await createSession(server, 1, false, true);
    expect(
      (
        await server.inject({
          method: 'POST',
          url: `/api/study/sessions/${session.sessionId}/recontact`,
          payload: {
            requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
            email: 'private@example.org',
          },
        })
      ).statusCode,
    ).toBe(200);
    await savePreAndStartArtifact(server, session.sessionId);

    const outputDirectory = join(temporaryDirectory, 'export');
    const result = exportResearchData({
      databasePath,
      outputDirectory,
      exportedAtIso: '2026-07-25T10:00:00.000Z',
    });
    const exportedData = [
      readFileSync(join(outputDirectory, 'sessions.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'timing.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'responses.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'response-presentations.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'data-dictionary.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'sessions.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'timing.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'responses.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'response-presentations.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'data-dictionary.json'), 'utf8'),
    ].join('\n');

    expect(result.files).toEqual([
      'sessions.csv',
      'timing.csv',
      'responses.csv',
      'response-presentations.csv',
      'data-dictionary.csv',
      'sessions.json',
      'timing.json',
      'responses.json',
      'response-presentations.json',
      'data-dictionary.json',
      'manifest.json',
    ]);
    expect(readFileSync(join(outputDirectory, 'sessions.csv'), 'utf8')).toMatch(
      /^researchId,condition,assignmentMode,studyVersion,contentVersion/u,
    );
    expect(exportedData).not.toMatch(
      /display.?name|password.?value|password.?input|password.?part|training.?input|request.?body|user.?agent|ip.?address|email.?address|score|classification|secaware.?quiz/iu,
    );
    expect(exportedData).not.toMatch(
      /[{"\n,](?:sessionId|participantCode|deletionCode|deletionCodeHash|email|rawToken|followUpTokenHash)[",:]/u,
    );
    expect(exportedData).not.toContain(session.sessionId);
    expect(exportedData).not.toContain('1'.padStart(64, '0'));
    expect(exportedData).not.toContain('private@example.org');
    expect(exportedData).not.toContain(rawToken);
    expect(exportedData).not.toContain(
      createHash('sha256').update(rawToken, 'utf8').digest('hex'),
    );
    expect(existsSync(databasePath)).toBe(true);
    expect(existsSync(recontactDatabasePath)).toBe(true);
    expect(readFileSync(join(outputDirectory, 'response-presentations.json'), 'utf8')).toContain(
      '"displayedOptionIds"',
    );
    expect(readFileSync(join(outputDirectory, 'data-dictionary.json'), 'utf8')).toContain(
      '"itemId": "MR_DISTINCT_PASSWORDS"',
    );
    expect(result.manifest.schemaVersion).toBe('research-export-v6');
    expect(result.manifest.profile).toBe('audit');
    expect(result.manifest.schemaProfileVersion).toBe('research-audit-v1');
    for (const file of result.manifest.files) {
      expect(
        createHash('sha256')
          .update(readFileSync(join(outputDirectory, file.fileName), 'utf8'))
          .digest('hex'),
      ).toBe(file.sha256);
    }
  });

  it('emits an analysis profile without active free-text responses or calendar timestamps', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-analysis-export-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const recontactDatabasePath = join(temporaryDirectory, 'recontact.sqlite');
    const rawToken = 'E'.repeat(43);
    const server = buildStudyServer({
      version: '0.1.2',
      assignmentMode: 'forced-supportive',
      databasePath,
      recontactDatabasePath,
      nowIso: () => '2026-07-24T12:00:00.000Z',
      createRecontactToken: () => rawToken,
    });
    servers.push(server);
    const session = await createSession(server, 2, false, true);
    expect(
      (
        await server.inject({
          method: 'POST',
          url: `/api/study/sessions/${session.sessionId}/recontact`,
          payload: {
            requestId: 'e428b02a-7949-4dd0-b906-32942134c661',
            email: 'analysis-private@example.org',
          },
        })
      ).statusCode,
    ).toBe(200);
    await savePreAndStartArtifact(server, session.sessionId);

    const outputDirectory = join(temporaryDirectory, 'analysis');
    const result = exportResearchData({
      databasePath,
      outputDirectory,
      profile: 'analysis',
      exportedAtIso: '2026-07-25T10:00:00.000Z',
    });
    const sessions = readFileSync(join(outputDirectory, 'sessions.json'), 'utf8');
    const timing = readFileSync(join(outputDirectory, 'timing.json'), 'utf8');
    const responses = readFileSync(join(outputDirectory, 'responses.json'), 'utf8');
    const presentations = readFileSync(
      join(outputDirectory, 'response-presentations.json'),
      'utf8',
    );
    const freeTextReview = readFileSync(join(outputDirectory, 'free-text-review.json'), 'utf8');

    expect(result.manifest).toMatchObject({
      schemaVersion: 'research-export-v6',
      profile: 'analysis',
      schemaProfileVersion: 'research-analysis-v1',
      freeTextReview: { recordCount: 0, status: 'pending-review' },
    });
    expect(result.files).toEqual(
      expect.arrayContaining(['free-text-review.csv', 'free-text-review.json']),
    );
    expect([sessions, timing, responses, presentations].join('\n')).not.toMatch(
      /createdAtIso|completedAtIso|clientMonotonicMs|clientWallClockIso|serverReceivedAtIso/u,
    );
    expect(freeTextReview).toBe('[]\n');
    const exportedData = [sessions, timing, responses, presentations, freeTextReview].join('\n');
    expect(exportedData).not.toContain(session.sessionId);
    expect(exportedData).not.toContain('2'.padStart(64, '0'));
    expect(exportedData).not.toContain('analysis-private@example.org');
    expect(exportedData).not.toContain(rawToken);
    expect(exportedData).not.toContain(createHash('sha256').update(rawToken, 'utf8').digest('hex'));
    for (const file of result.manifest.files) {
      expect(
        createHash('sha256')
          .update(readFileSync(join(outputDirectory, file.fileName), 'utf8'))
          .digest('hex'),
      ).toBe(file.sha256);
    }
  });

  it('keeps production consent text free of mandatory anonymization promises', () => {
    const studyFlowSource = readFileSync(
      new URL('../../study-web/src/features/study/StudyFlow.tsx', import.meta.url),
      'utf8',
    );
    const productionConsentText = [
      studyFlowSource,
      JSON.stringify(instrumentRuntimeManifest.procedures.participantInformation),
    ].join('\n');

    expect(productionConsentText).not.toMatch(
      /irreversibel anonymisiert|nach Studienende anonymisiert|einschließlich der Nachbefragung/u,
    );
  });
});

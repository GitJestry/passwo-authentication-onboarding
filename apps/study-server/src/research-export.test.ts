import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
    const server = buildStudyServer({
      version: '0.1.2',
      assignmentMode: 'forced-supportive',
      databasePath,
      nowIso: () => '2026-07-24T12:00:00.000Z',
    });
    servers.push(server);
    const session = await createSession(server);
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
      readFileSync(join(outputDirectory, 'sessions.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'timing.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'responses.json'), 'utf8'),
    ].join('\n');

    expect(result.files).toEqual([
      'sessions.csv',
      'timing.csv',
      'responses.csv',
      'sessions.json',
      'timing.json',
      'responses.json',
      'manifest.json',
    ]);
    expect(readFileSync(join(outputDirectory, 'sessions.csv'), 'utf8')).toMatch(
      /^sessionId,participantCode,condition,assignmentMode,studyVersion,contentVersion/u,
    );
    expect(exportedData).not.toMatch(
      /display.?name|password.?value|password.?input|password.?part|training.?input|request.?body|user.?agent|ip.?address/iu,
    );
  });
});

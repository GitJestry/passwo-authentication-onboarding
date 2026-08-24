import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deletionCodeSchema, hashDeletionCode, mainInstrumentBlocks } from '@passwo/contracts';
import Database from 'better-sqlite3';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildStudyServer } from './app.js';
import { runStudyDataDeletion } from './study-data-deletion.js';
import { savePreAndStartArtifact } from './test-support.js';

const servers: FastifyInstance[] = [];
const temporaryDirectories: string[] = [];
const referenceArtifactFixtureDirectory = fileURLToPath(
  new URL('./test-fixtures/reference-artifact/', import.meta.url),
);

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function countRows(database: Database.Database, table: string, sessionId: string): number {
  return z
    .object({ count: z.number().int().nonnegative() })
    .parse(
      database.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE session_id = ?`).get(sessionId),
    ).count;
}

describe('local study-data deletion repository', () => {
  it('reports and deletes every session-dependent record by deletion-code hash', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'passwo-study-data-deletion-'));
    temporaryDirectories.push(directory);
    const databasePath = join(directory, 'study.sqlite');
    const recontactDatabasePath = join(directory, 'recontact.sqlite');
    const deletionCode = deletionCodeSchema.parse('PW-AB12-CD34-EF56-7890');
    const deletionCodeHash = await hashDeletionCode(deletionCode);
    const server = buildStudyServer({
      version: '0.1.2',
      assignmentMode: 'permuted-block',
      databasePath,
      recontactDatabasePath,
      referenceArtifactDirectory: referenceArtifactFixtureDirectory,
      nowIso: () => '2026-08-02T12:00:00.000Z',
    });
    servers.push(server);
    expect(server.printRoutes()).not.toMatch(/delet/iu);
    const created = await server.inject({
      method: 'POST',
      url: '/api/study/sessions',
      payload: {
        requestId: '10000000-0000-4000-8000-000000000001',
        consentAccepted: true,
        followUpConsent: true,
        deletionCodeHash,
      },
    });
    expect(created.statusCode).toBe(201);
    const session = created.json<{ readonly sessionId: string }>();
    expect(
      (
        await server.inject({
          method: 'POST',
          url: `/api/study/sessions/${session.sessionId}/recontact`,
          payload: {
            requestId: '20000000-0000-4000-8000-000000000001',
            email: 'participant@example.org',
          },
        })
      ).statusCode,
    ).toBe(200);
    await savePreAndStartArtifact(server, session.sessionId);

    const dryRun = runStudyDataDeletion({
      databasePath,
      recontactDatabasePath,
      deletionCodeHash,
      mode: 'dry-run',
    });
    const dryRunCounts = Object.fromEntries(
      dryRun.tables.map(({ table, count }) => [table, count]),
    );
    expect(dryRunCounts).toMatchObject({
      study_sessions: 1,
      assignment_slots: 1,
      guardrail_form_slots: 1,
      artifact_leases: 1,
      timing_events: 1,
      instrument_submissions: mainInstrumentBlocks.filter(
        ({ instrumentId }) => instrumentId === 'pre-v1',
      ).length,
      response_presentations: mainInstrumentBlocks
        .filter(({ instrumentId }) => instrumentId === 'guardrail-v2')
        .reduce((count, block) => count + block.items.length, 0),
      'recontact.registrations': 1,
    });
    const responseCount = dryRunCounts.responses;
    if (responseCount === undefined) throw new Error('missing-response-deletion-count');
    expect(responseCount).toBeGreaterThan(0);

    const deletion = runStudyDataDeletion({
      databasePath,
      recontactDatabasePath,
      deletionCodeHash,
      mode: 'delete',
    });
    expect(deletion).toEqual(dryRun);

    const studyDatabase = new Database(databasePath, { readonly: true });
    for (const table of [
      'study_sessions',
      'assignment_slots',
      'guardrail_form_slots',
      'artifact_leases',
      'timing_events',
      'instrument_submissions',
      'responses',
      'response_presentations',
    ]) {
      expect(countRows(studyDatabase, table, session.sessionId)).toBe(0);
    }
    studyDatabase.close();
    const recontactDatabase = new Database(recontactDatabasePath, { readonly: true });
    expect(countRows(recontactDatabase, 'registrations', session.sessionId)).toBe(0);
    recontactDatabase.close();
  });
});

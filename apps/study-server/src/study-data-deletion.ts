import { existsSync } from 'node:fs';
import {
  type DeletionCodeHash,
  type StudyDataDeletionReport,
  studyDataDeletionReportSchema,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import { z } from 'zod';

const countRowSchema = z.object({ count: z.number().int().nonnegative() }).strict();
const sessionIdRowSchema = z.object({ sessionId: z.uuid() }).strict();

export type StudyDataDeletionMode = 'dry-run' | 'delete';

export interface StudyDataDeletionOptions {
  readonly databasePath: string;
  readonly recontactDatabasePath: string;
  readonly deletionCodeHash: DeletionCodeHash;
  readonly mode: StudyDataDeletionMode;
}

interface OpenedDeletionDatabase {
  readonly database: Database.Database;
  readonly hasRecontactDatabase: boolean;
}

function openDeletionDatabase({
  databasePath,
  recontactDatabasePath,
  mode,
}: Pick<StudyDataDeletionOptions, 'databasePath' | 'recontactDatabasePath' | 'mode'>): OpenedDeletionDatabase {
  const database = new Database(databasePath, {
    readonly: mode === 'dry-run',
    fileMustExist: true,
  });
  database.pragma('foreign_keys = ON');

  const hasRecontactDatabase = existsSync(recontactDatabasePath);
  if (hasRecontactDatabase) {
    database.prepare('ATTACH DATABASE ? AS recontact').run(recontactDatabasePath);
  }
  if (mode === 'dry-run') database.pragma('query_only = ON');

  return { database, hasRecontactDatabase };
}

function countRows(database: Database.Database, sql: string, sessionId: string | null): number {
  if (sessionId === null) return 0;
  return countRowSchema.parse(database.prepare(sql).get(sessionId)).count;
}

function findSessionId(
  database: Database.Database,
  deletionCodeHash: DeletionCodeHash,
): string | null {
  const row = database
    .prepare(
      `SELECT session_id AS sessionId
       FROM study_sessions
       WHERE deletion_code_hash = ?`,
    )
    .get(deletionCodeHash);
  return row === undefined ? null : sessionIdRowSchema.parse(row).sessionId;
}

function deletionReport(
  database: Database.Database,
  sessionId: string | null,
  hasRecontactDatabase: boolean,
): StudyDataDeletionReport {
  return studyDataDeletionReportSchema.parse({
    tables: [
      { table: 'study_sessions', count: sessionId === null ? 0 : 1 },
      {
        table: 'assignment_slots',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM assignment_slots WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'guardrail_form_slots',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM guardrail_form_slots WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'artifact_leases',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM artifact_leases WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'timing_events',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM timing_events WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'instrument_submissions',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM instrument_submissions WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'responses',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM responses WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'response_presentations',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM response_presentations WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'web_resume_tokens',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM web_resume_tokens WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'web_artifact_intervals',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM web_artifact_intervals WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'web_segment_timing_events',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM web_segment_timing_events WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'web_artifact_visibility_events',
        count: countRows(
          database,
          'SELECT COUNT(*) AS count FROM web_artifact_visibility_events WHERE session_id = ?',
          sessionId,
        ),
      },
      {
        table: 'recontact.registrations',
        count: hasRecontactDatabase
          ? countRows(
              database,
              'SELECT COUNT(*) AS count FROM recontact.registrations WHERE session_id = ?',
              sessionId,
            )
          : 0,
      },
    ],
  });
}

function deleteMatchedRows(
  database: Database.Database,
  sessionId: string,
  hasRecontactDatabase: boolean,
): void {
  if (hasRecontactDatabase) {
    database.prepare('DELETE FROM recontact.registrations WHERE session_id = ?').run(sessionId);
  }
  database
    .prepare('DELETE FROM web_artifact_visibility_events WHERE session_id = ?')
    .run(sessionId);
  database.prepare('DELETE FROM web_segment_timing_events WHERE session_id = ?').run(sessionId);
  database.prepare('DELETE FROM web_artifact_intervals WHERE session_id = ?').run(sessionId);
  database.prepare('DELETE FROM web_resume_tokens WHERE session_id = ?').run(sessionId);
  database.prepare('DELETE FROM artifact_leases WHERE session_id = ?').run(sessionId);
  database.prepare('DELETE FROM response_presentations WHERE session_id = ?').run(sessionId);
  database.prepare('DELETE FROM responses WHERE session_id = ?').run(sessionId);
  database.prepare('DELETE FROM instrument_submissions WHERE session_id = ?').run(sessionId);
  database.prepare('DELETE FROM timing_events WHERE session_id = ?').run(sessionId);
  database
    .prepare('UPDATE guardrail_form_slots SET session_id = NULL WHERE session_id = ?')
    .run(sessionId);
  database
    .prepare('UPDATE assignment_slots SET session_id = NULL WHERE session_id = ?')
    .run(sessionId);
  database.prepare('DELETE FROM study_sessions WHERE session_id = ?').run(sessionId);
}

export function runStudyDataDeletion({
  databasePath,
  recontactDatabasePath,
  deletionCodeHash,
  mode,
}: StudyDataDeletionOptions): StudyDataDeletionReport {
  const { database, hasRecontactDatabase } = openDeletionDatabase({
    databasePath,
    recontactDatabasePath,
    mode,
  });
  try {
    if (mode === 'dry-run') {
      return deletionReport(
        database,
        findSessionId(database, deletionCodeHash),
        hasRecontactDatabase,
      );
    }

    return database.transaction(() => {
      const sessionId = findSessionId(database, deletionCodeHash);
      const report = deletionReport(database, sessionId, hasRecontactDatabase);
      if (sessionId !== null) deleteMatchedRows(database, sessionId, hasRecontactDatabase);
      return report;
    })();
  } finally {
    database.close();
  }
}

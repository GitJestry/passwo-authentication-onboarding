import Database from 'better-sqlite3';
import { resolve } from 'node:path';

interface CliOptions {
  database: string;
}

function parseOptions(argv: readonly string[]): CliOptions {
  let database = '';
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--database') {
      database = argv[index + 1] ?? '';
      index += 1;
      continue;
    }
    throw new Error(`Unbekanntes Argument: ${argument}`);
  }
  if (database.length === 0) throw new Error('--database fehlt.');
  return { database: resolve(database) };
}

function tableExists(db: Database.Database, table: string): boolean {
  return db
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table) !== undefined;
}

function columnNames(db: Database.Database, table: string): Set<string> {
  if (!tableExists(db, table)) return new Set();
  return new Set(
    (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map(
      ({ name }) => name,
    ),
  );
}

const options = parseOptions(process.argv.slice(2));
const db = new Database(options.database, { readonly: true, fileMustExist: true });
const problems: string[] = [];

try {
  const quickCheck = db.pragma('quick_check', { simple: true });
  if (quickCheck !== 'ok') problems.push(`SQLite quick_check: ${String(quickCheck)}`);

  const foreignKeyProblems = db.pragma('foreign_key_check') as unknown[];
  if (foreignKeyProblems.length > 0) {
    problems.push(`${foreignKeyProblems.length} Foreign-Key-Verletzung(en)`);
  }

  const sessionColumns = columnNames(db, 'study_sessions');
  const required = [
    'session_id',
    'completion_status',
    'progress_checkpoint',
    'created_at_iso',
    'completed_at_iso',
  ];
  for (const column of required) {
    if (!sessionColumns.has(column)) problems.push(`study_sessions.${column} fehlt`);
  }

  if (problems.length === 0) {
    const sessions = db
      .prepare(
        `SELECT session_id, completion_status, progress_checkpoint,
                created_at_iso, completed_at_iso
         FROM study_sessions`,
      )
      .all() as Array<{
      session_id: string;
      completion_status: string;
      progress_checkpoint: string;
      created_at_iso: string;
      completed_at_iso: string | null;
    }>;

    for (const session of sessions) {
      const completed = session.completion_status === 'completed';
      if (completed && session.progress_checkpoint !== 'complete') {
        problems.push(`${session.session_id}: completed ohne Checkpoint complete`);
      }
      if (completed && session.completed_at_iso === null) {
        problems.push(`${session.session_id}: completed ohne completed_at_iso`);
      }
      if (!completed && session.completed_at_iso !== null) {
        problems.push(`${session.session_id}: in-progress mit completed_at_iso`);
      }
      if (Number.isNaN(Date.parse(session.created_at_iso))) {
        problems.push(`${session.session_id}: ungültiges created_at_iso`);
      }
      if (session.completed_at_iso !== null && Number.isNaN(Date.parse(session.completed_at_iso))) {
        problems.push(`${session.session_id}: ungültiges completed_at_iso`);
      }
    }

    const submissionTable = ['instrument_submissions', 'study_instrument_submissions'].find((name) =>
      tableExists(db, name),
    );
    if (submissionTable !== undefined) {
      const columns = columnNames(db, submissionTable);
      if (columns.has('session_id')) {
        const counts = new Map(
          (
            db
              .prepare(`SELECT session_id, COUNT(*) AS count FROM ${submissionTable} GROUP BY session_id`)
              .all() as Array<{ session_id: string; count: number }>
          ).map(({ session_id, count }) => [session_id, count]),
        );
        for (const session of sessions) {
          if (session.completion_status === 'completed' && (counts.get(session.session_id) ?? 0) < 2) {
            problems.push(`${session.session_id}: completed mit weniger als zwei Instrument-Submissions`);
          }
        }
      }
    }
  }

  const summary = {
    database: options.database,
    status: problems.length === 0 ? 'ok' : 'invalid',
    problems,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (problems.length > 0) process.exitCode = 1;
} finally {
  db.close();
}

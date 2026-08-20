import Database from 'better-sqlite3';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

interface Options {
  database: string;
  output: string;
}

type Row = Record<string, unknown>;

interface ArtifactTiming {
  activeMs: number | null;
  startedAtMs: number | null;
  endedAtMs: number | null;
}

function parseOptions(argv: readonly string[]): Options {
  let database = '';
  let output = '';
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--database') {
      database = argv[index + 1] ?? '';
      index += 1;
      continue;
    }
    if (argument === '--output') {
      output = argv[index + 1] ?? '';
      index += 1;
      continue;
    }
    throw new Error(`Unbekanntes Argument: ${argument}`);
  }
  if (database.length === 0) throw new Error('--database fehlt.');
  if (output.length === 0) throw new Error('--output fehlt.');
  return { database: resolve(database), output: resolve(output) };
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function pick(row: Row, candidates: readonly string[]): unknown {
  for (const candidate of candidates) {
    if (candidate in row) return row[candidate];
  }
  return null;
}

function pickColumn(columns: ReadonlySet<string>, candidates: readonly string[]): string | null {
  return candidates.find((candidate) => columns.has(candidate)) ?? null;
}

function epoch(value: unknown): number | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.max(0, Math.round(value));
}

function nonNegativeDifference(end: number | null, start: number | null): number | null {
  if (end === null || start === null) return null;
  return Math.max(0, Math.round(end - start));
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function tableColumns(db: Database.Database, table: string): Set<string> {
  return new Set(
    (
      db.prepare(`PRAGMA table_info(${quoteIdentifier(table)})`).all() as Array<{
        name: string;
      }>
    ).map(({ name }) => name),
  );
}

function readArtifactTiming(db: Database.Database): Map<string, ArtifactTiming> {
  const result = new Map<string, ArtifactTiming>();
  const tableNames = (
    db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
      .all() as Array<{ name: string }>
  ).map(({ name }) => name);

  for (const table of tableNames) {
    if (!table.toLowerCase().includes('artifact')) continue;
    const columns = tableColumns(db, table);
    if (!columns.has('session_id')) continue;

    const elapsedColumn = pickColumn(columns, [
      'artifact_session_elapsed_ms',
      'active_elapsed_ms',
      'elapsed_ms',
      'duration_ms',
    ]);
    const startColumn = pickColumn(columns, [
      'artifact_started_at_iso',
      'started_at_iso',
      'start_at_iso',
    ]);
    const endColumn = pickColumn(columns, [
      'artifact_ended_at_iso',
      'ended_at_iso',
      'end_at_iso',
    ]);

    const selected = ['session_id', elapsedColumn, startColumn, endColumn].filter(
      (column): column is string => column !== null,
    );
    if (selected.length === 1) continue;

    const rows = db
      .prepare(
        `SELECT ${selected.map(quoteIdentifier).join(', ')} FROM ${quoteIdentifier(table)}`,
      )
      .all() as Row[];

    for (const row of rows) {
      const sessionId = row.session_id;
      if (typeof sessionId !== 'string') continue;
      const current = result.get(sessionId) ?? {
        activeMs: null,
        startedAtMs: null,
        endedAtMs: null,
      };
      const startedAtMs = startColumn === null ? null : epoch(row[startColumn]);
      const endedAtMs = endColumn === null ? null : epoch(row[endColumn]);
      const explicitElapsed = elapsedColumn === null ? null : finiteNumber(row[elapsedColumn]);
      const intervalElapsed = nonNegativeDifference(endedAtMs, startedAtMs);
      const elapsed = explicitElapsed ?? intervalElapsed;

      if (elapsed !== null) current.activeMs = (current.activeMs ?? 0) + elapsed;
      if (
        startedAtMs !== null &&
        (current.startedAtMs === null || startedAtMs < current.startedAtMs)
      ) {
        current.startedAtMs = startedAtMs;
      }
      if (endedAtMs !== null && (current.endedAtMs === null || endedAtMs > current.endedAtMs)) {
        current.endedAtMs = endedAtMs;
      }
      result.set(sessionId, current);
    }
  }

  return result;
}

const options = parseOptions(process.argv.slice(2));
const db = new Database(options.database, { readonly: true, fileMustExist: true });

try {
  const rows = db.prepare('SELECT * FROM study_sessions ORDER BY created_at_iso').all() as Row[];
  const artifactTiming = readArtifactTiming(db);
  const outputRows = rows.map((row) => {
    const sessionId = typeof row.session_id === 'string' ? row.session_id : '';
    const discoveredTiming = artifactTiming.get(sessionId);
    const created = epoch(pick(row, ['created_at_iso']));
    const artifactStarted =
      epoch(
        pick(row, ['artifact_started_at_iso', 'artifact_start_at_iso', 'artifact_started_at']),
      ) ?? discoveredTiming?.startedAtMs ?? null;
    const artifactEnded =
      epoch(pick(row, ['artifact_ended_at_iso', 'artifact_end_at_iso', 'artifact_ended_at'])) ??
      discoveredTiming?.endedAtMs ??
      null;
    const completed = epoch(pick(row, ['completed_at_iso']));
    const preQuestionnaireWallClockMs = nonNegativeDifference(artifactStarted, created);
    const postQuestionnaireWallClockMs = nonNegativeDifference(completed, artifactEnded);
    const questionnaireWallClockMs =
      preQuestionnaireWallClockMs === null || postQuestionnaireWallClockMs === null
        ? null
        : preQuestionnaireWallClockMs + postQuestionnaireWallClockMs;
    const trainingActiveMs =
      finiteNumber(
        pick(row, [
          'artifact_session_elapsed_ms',
          'artifactSessionElapsedMs',
          'artifact_duration_ms',
        ]),
      ) ??
      discoveredTiming?.activeMs ??
      null;

    return {
      session_id: sessionId,
      condition: pick(row, ['condition']),
      completion_status: pick(row, ['completion_status']),
      training_active_ms: trainingActiveMs,
      pre_questionnaire_wall_clock_ms: preQuestionnaireWallClockMs,
      post_questionnaire_wall_clock_ms: postQuestionnaireWallClockMs,
      questionnaire_wall_clock_ms: questionnaireWallClockMs,
      study_wall_clock_ms: nonNegativeDifference(completed, created),
      web_interruption_count: pick(row, ['web_interruption_count']),
    };
  });

  const headers = [
    'session_id',
    'condition',
    'completion_status',
    'training_active_ms',
    'pre_questionnaire_wall_clock_ms',
    'post_questionnaire_wall_clock_ms',
    'questionnaire_wall_clock_ms',
    'study_wall_clock_ms',
    'web_interruption_count',
  ] as const;

  mkdirSync(dirname(options.output), { recursive: true });
  const csv = [
    headers.join(','),
    ...outputRows.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ].join('\n');
  writeFileSync(options.output, `${csv}\n`, 'utf8');
  console.log(`Timing-Bericht geschrieben: ${options.output} (${outputRows.length} Sessions)`);
} finally {
  db.close();
}

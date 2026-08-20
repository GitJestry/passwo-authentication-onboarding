import Database from 'better-sqlite3';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

interface Options {
  readonly database: string;
  readonly output: string;
}

interface SessionRow {
  readonly session_id: string;
  readonly condition: string;
  readonly completion_status: string;
  readonly created_at_iso: string;
  readonly artifact_completed_at_iso: string | null;
  readonly completed_at_iso: string | null;
  readonly web_interruption_count: number;
}

interface ArtifactTimingRow {
  readonly session_id: string;
  readonly active_ms: number;
  readonly started_at_iso: string;
  readonly ended_at_iso: string;
}

interface ArtifactTiming {
  readonly activeMs: number;
  readonly startedAtMs: number | null;
  readonly endedAtMs: number | null;
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

function epoch(value: string | null): number | null {
  if (value === null || value.length === 0) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
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

function readArtifactTiming(db: Database.Database): Map<string, ArtifactTiming> {
  const rows = db
    .prepare(
      `SELECT interval.session_id,
              SUM(interval.confirmed_elapsed_ms) AS active_ms,
              MIN(interval.started_at_iso) AS started_at_iso,
              MAX(COALESCE(interval.closed_at_iso, interval.last_confirmed_at_iso)) AS ended_at_iso
       FROM web_artifact_intervals AS interval
       GROUP BY interval.session_id`,
    )
    .all() as ArtifactTimingRow[];

  return new Map(
    rows.map((row) => [
      row.session_id,
      {
        activeMs: Math.max(0, Math.round(row.active_ms)),
        startedAtMs: epoch(row.started_at_iso),
        endedAtMs: epoch(row.ended_at_iso),
      },
    ]),
  );
}

const options = parseOptions(process.argv.slice(2));
const db = new Database(options.database, { readonly: true, fileMustExist: true });

try {
  const rows = db
    .prepare(
      `SELECT session_id, condition, completion_status, created_at_iso,
              artifact_completed_at_iso, completed_at_iso, web_interruption_count
       FROM study_sessions
       ORDER BY created_at_iso, session_id`,
    )
    .all() as SessionRow[];
  const artifactTiming = readArtifactTiming(db);
  const outputRows = rows.map((row) => {
    const intervalTiming = artifactTiming.get(row.session_id);
    const created = epoch(row.created_at_iso);
    const artifactStarted = intervalTiming?.startedAtMs ?? null;
    const artifactEnded = epoch(row.artifact_completed_at_iso) ?? intervalTiming?.endedAtMs ?? null;
    const completed = epoch(row.completed_at_iso);
    const preQuestionnaireWallClockMs = nonNegativeDifference(artifactStarted, created);
    const postQuestionnaireWallClockMs = nonNegativeDifference(completed, artifactEnded);
    const questionnaireWallClockMs =
      preQuestionnaireWallClockMs === null || postQuestionnaireWallClockMs === null
        ? null
        : preQuestionnaireWallClockMs + postQuestionnaireWallClockMs;

    return {
      session_id: row.session_id,
      condition: row.condition,
      completion_status: row.completion_status,
      training_active_ms: intervalTiming?.activeMs ?? null,
      pre_questionnaire_wall_clock_ms: preQuestionnaireWallClockMs,
      post_questionnaire_wall_clock_ms: postQuestionnaireWallClockMs,
      questionnaire_wall_clock_ms: questionnaireWallClockMs,
      study_wall_clock_ms: nonNegativeDifference(completed, created),
      web_interruption_count: row.web_interruption_count,
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

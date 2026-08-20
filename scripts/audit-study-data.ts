import {
  mainInstrumentBlocks,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import { resolve } from 'node:path';

interface CliOptions {
  readonly database: string;
}

interface SessionRow {
  readonly session_id: string;
  readonly condition: string;
  readonly completion_status: string;
  readonly progress_checkpoint: string;
  readonly created_at_iso: string;
  readonly artifact_completed_at_iso: string | null;
  readonly completed_at_iso: string | null;
}

interface InstrumentBlockRow {
  readonly instrument_id: string;
  readonly section_id: string;
}

interface ResponseItemRow {
  readonly item_id: string;
}

interface CountRow {
  readonly count: number;
}

interface ArtifactIntervalRow {
  readonly interval_id: string;
  readonly started_at_iso: string;
  readonly last_confirmed_at_iso: string;
  readonly confirmed_elapsed_ms: number;
  readonly closed_at_iso: string | null;
  readonly close_reason: string | null;
}

interface SegmentEndRow {
  readonly segment_id: string;
  readonly count: number;
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
    (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ readonly name: string }>).map(
      ({ name }) => name,
    ),
  );
}

function requireColumns(
  db: Database.Database,
  table: string,
  columns: readonly string[],
  problems: string[],
): void {
  if (!tableExists(db, table)) {
    problems.push(`Tabelle ${table} fehlt`);
    return;
  }
  const available = columnNames(db, table);
  for (const column of columns) {
    if (!available.has(column)) problems.push(`${table}.${column} fehlt`);
  }
}

function validIso(value: string | null): boolean {
  return value !== null && !Number.isNaN(Date.parse(value));
}

function blockKey(instrumentId: string, sectionId: string): string {
  return `${instrumentId}:${sectionId}`;
}

function sortedDifference(left: readonly string[], right: ReadonlySet<string>): string[] {
  return left.filter((value) => !right.has(value)).toSorted();
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

  requireColumns(
    db,
    'study_sessions',
    [
      'session_id',
      'condition',
      'completion_status',
      'progress_checkpoint',
      'created_at_iso',
      'artifact_completed_at_iso',
      'completed_at_iso',
    ],
    problems,
  );
  requireColumns(
    db,
    'instrument_submissions',
    ['session_id', 'instrument_id', 'section_id', 'submitted_at_iso'],
    problems,
  );
  requireColumns(
    db,
    'responses',
    ['session_id', 'instrument_id', 'section_id', 'item_id', 'created_at_iso'],
    problems,
  );
  requireColumns(
    db,
    'web_artifact_intervals',
    [
      'interval_id',
      'session_id',
      'started_at_iso',
      'last_confirmed_at_iso',
      'confirmed_elapsed_ms',
      'closed_at_iso',
      'close_reason',
    ],
    problems,
  );
  requireColumns(
    db,
    'web_segment_timing_events',
    ['session_id', 'segment_id', 'event_type'],
    problems,
  );

  if (problems.length === 0) {
    const sessions = db
      .prepare(
        `SELECT session_id, condition, completion_status, progress_checkpoint,
                created_at_iso, artifact_completed_at_iso, completed_at_iso
         FROM study_sessions
         ORDER BY created_at_iso, session_id`,
      )
      .all() as SessionRow[];

    const expectedBlocks = new Set(
      mainInstrumentBlocks.map((block) => blockKey(block.instrumentId, block.sectionId)),
    );
    const expectedResponseCount = mainInstrumentBlocks.reduce(
      (sum, block) => sum + block.items.length,
      0,
    );

    for (const session of sessions) {
      const completed = session.completion_status === 'completed';
      if (completed && session.progress_checkpoint !== 'complete') {
        problems.push(`${session.session_id}: completed ohne Checkpoint complete`);
      }
      if (completed && !validIso(session.completed_at_iso)) {
        problems.push(`${session.session_id}: completed ohne gültiges completed_at_iso`);
      }
      if (!completed && session.completed_at_iso !== null) {
        problems.push(`${session.session_id}: nicht completed mit completed_at_iso`);
      }
      if (!validIso(session.created_at_iso)) {
        problems.push(`${session.session_id}: ungültiges created_at_iso`);
      }
      if (session.completed_at_iso !== null && !validIso(session.completed_at_iso)) {
        problems.push(`${session.session_id}: ungültiges completed_at_iso`);
      }
      if (!completed) continue;

      if (!validIso(session.artifact_completed_at_iso)) {
        problems.push(`${session.session_id}: completed ohne gültiges artifact_completed_at_iso`);
      }

      const submittedBlocks = db
        .prepare(
          `SELECT instrument_id, section_id
           FROM instrument_submissions
           WHERE session_id = ?
           ORDER BY instrument_id, section_id`,
        )
        .all(session.session_id) as InstrumentBlockRow[];
      const submittedKeys = submittedBlocks.map((row) =>
        blockKey(row.instrument_id, row.section_id),
      );
      const submittedKeySet = new Set(submittedKeys);
      const missingBlocks = sortedDifference([...expectedBlocks], submittedKeySet);
      const unexpectedBlocks = submittedKeys.filter((key) => !expectedBlocks.has(key)).toSorted();
      if (missingBlocks.length > 0) {
        problems.push(
          `${session.session_id}: fehlende Instrumentblöcke ${missingBlocks.join(', ')}`,
        );
      }
      if (unexpectedBlocks.length > 0) {
        problems.push(
          `${session.session_id}: unerwartete Instrumentblöcke ${unexpectedBlocks.join(', ')}`,
        );
      }
      if (submittedBlocks.length !== mainInstrumentBlocks.length) {
        problems.push(
          `${session.session_id}: ${submittedBlocks.length}/${mainInstrumentBlocks.length} Instrumentblöcke gespeichert`,
        );
      }

      const responseCount = (db
        .prepare('SELECT COUNT(*) AS count FROM responses WHERE session_id = ?')
        .get(session.session_id) as CountRow).count;
      if (responseCount !== expectedResponseCount) {
        problems.push(
          `${session.session_id}: ${responseCount}/${expectedResponseCount} Antworten insgesamt gespeichert`,
        );
      }

      for (const block of mainInstrumentBlocks) {
        const responseRows = db
          .prepare(
            `SELECT item_id
             FROM responses
             WHERE session_id = ? AND instrument_id = ? AND section_id = ?
             ORDER BY item_id`,
          )
          .all(session.session_id, block.instrumentId, block.sectionId) as ResponseItemRow[];
        const actualItemIds = responseRows.map((row) => row.item_id);
        const actualItemSet = new Set(actualItemIds);
        const expectedItemIds = block.items.map((item) => item.id);
        const expectedItemSet = new Set(expectedItemIds);
        const missingItems = sortedDifference(expectedItemIds, actualItemSet);
        const unexpectedItems = actualItemIds
          .filter((itemId) => !expectedItemSet.has(itemId))
          .toSorted();
        if (
          responseRows.length !== expectedItemIds.length ||
          missingItems.length > 0 ||
          unexpectedItems.length > 0
        ) {
          const details = [
            `${responseRows.length}/${expectedItemIds.length} Antworten`,
            missingItems.length === 0 ? null : `fehlend: ${missingItems.join(', ')}`,
            unexpectedItems.length === 0 ? null : `unerwartet: ${unexpectedItems.join(', ')}`,
          ].filter((value): value is string => value !== null);
          problems.push(
            `${session.session_id}: ${blockKey(block.instrumentId, block.sectionId)} (${details.join('; ')})`,
          );
        }
      }

      const intervals = db
        .prepare(
          `SELECT interval_id, started_at_iso, last_confirmed_at_iso,
                  confirmed_elapsed_ms, closed_at_iso, close_reason
           FROM web_artifact_intervals
           WHERE session_id = ?
           ORDER BY started_at_iso, interval_id`,
        )
        .all(session.session_id) as ArtifactIntervalRow[];
      if (intervals.length === 0) {
        problems.push(`${session.session_id}: completed ohne Artefaktintervall`);
      }
      const completedIntervals = intervals.filter(
        (interval) => interval.close_reason === 'completed',
      );
      if (completedIntervals.length !== 1) {
        problems.push(
          `${session.session_id}: ${completedIntervals.length}/1 als completed geschlossene Artefaktintervalle`,
        );
      }
      if (
        session.artifact_completed_at_iso !== null &&
        completedIntervals[0]?.closed_at_iso !== session.artifact_completed_at_iso
      ) {
        problems.push(
          `${session.session_id}: artifact_completed_at_iso stimmt nicht mit dem Abschlussintervall überein`,
        );
      }
      for (const interval of intervals) {
        if (!validIso(interval.started_at_iso)) {
          problems.push(`${session.session_id}: ${interval.interval_id} mit ungültigem Startzeitpunkt`);
        }
        if (!validIso(interval.last_confirmed_at_iso)) {
          problems.push(
            `${session.session_id}: ${interval.interval_id} mit ungültigem Bestätigungszeitpunkt`,
          );
        }
        if (!validIso(interval.closed_at_iso) || interval.close_reason === null) {
          problems.push(`${session.session_id}: offenes oder unvollständig geschlossenes Intervall ${interval.interval_id}`);
        }
        if (
          typeof interval.confirmed_elapsed_ms !== 'number' ||
          !Number.isFinite(interval.confirmed_elapsed_ms) ||
          interval.confirmed_elapsed_ms < 0
        ) {
          problems.push(`${session.session_id}: ungültige confirmed_elapsed_ms in ${interval.interval_id}`);
        }
      }

      if (session.condition === 'supportive') {
        const segmentEnds = db
          .prepare(
            `SELECT segment_id, COUNT(*) AS count
             FROM web_segment_timing_events
             WHERE session_id = ? AND event_type = 'segment-end'
             GROUP BY segment_id`,
          )
          .all(session.session_id) as SegmentEndRow[];
        const completedSegments = new Set(
          segmentEnds.filter((row) => row.count > 0).map((row) => row.segment_id),
        );
        const missingSegments = SUPPORTIVE_ARTIFACT_SEGMENT_IDS.filter(
          (segmentId) => !completedSegments.has(segmentId),
        );
        if (missingSegments.length > 0) {
          problems.push(
            `${session.session_id}: fehlende PassWo-Segment-Enden ${missingSegments.join(', ')}`,
          );
        }
      }
    }
  }

  const summary = {
    database: options.database,
    status: problems.length === 0 ? 'ok' : 'invalid',
    expectedCompletedRun: {
      instrumentBlocks: mainInstrumentBlocks.length,
      responses: mainInstrumentBlocks.reduce((sum, block) => sum + block.items.length, 0),
      supportiveSegmentEnds: SUPPORTIVE_ARTIFACT_SEGMENT_IDS.length,
    },
    problems,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (problems.length > 0) process.exitCode = 1;
} finally {
  db.close();
}

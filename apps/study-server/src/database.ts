import { chmodSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';

const schema = `
  CREATE TABLE IF NOT EXISTS study_sessions (
    session_id TEXT PRIMARY KEY,
    create_request_id TEXT NOT NULL UNIQUE,
    participant_code TEXT NOT NULL UNIQUE,
    condition TEXT NOT NULL CHECK (condition IN ('supportive', 'reference')),
    assignment_mode TEXT NOT NULL CHECK (
      assignment_mode IN ('permuted-block', 'forced-supportive', 'forced-reference')
    ),
    study_version TEXT NOT NULL,
    content_version TEXT NOT NULL,
    questionnaire_version TEXT NOT NULL,
    guardrail_version TEXT NOT NULL,
    consent_version TEXT NOT NULL,
    reference_artifact_version TEXT,
    consent_accepted INTEGER NOT NULL CHECK (consent_accepted = 1),
    completion_status TEXT NOT NULL CHECK (
      completion_status IN (
        'in-progress',
        'completed',
        'technical-abort',
        'participant-withdrawal',
        'incomplete-reload'
      )
    ),
    technical_error_code TEXT,
    created_at_iso TEXT NOT NULL,
    completed_at_iso TEXT
  );

  CREATE TABLE IF NOT EXISTS assignment_slots (
    block_number INTEGER NOT NULL,
    slot_index INTEGER NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('supportive', 'reference')),
    session_id TEXT UNIQUE REFERENCES study_sessions(session_id),
    PRIMARY KEY (block_number, slot_index)
  );

  CREATE TABLE IF NOT EXISTS timing_events (
    session_id TEXT NOT NULL REFERENCES study_sessions(session_id),
    sequence INTEGER NOT NULL,
    phase TEXT NOT NULL,
    section_id TEXT,
    segment_id TEXT,
    event_type TEXT NOT NULL,
    client_monotonic_ms REAL NOT NULL,
    client_wall_clock_iso TEXT NOT NULL,
    elapsed_ms REAL,
    reason_code TEXT,
    server_received_at_iso TEXT NOT NULL,
    PRIMARY KEY (session_id, sequence)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS unique_artifact_boundary
  ON timing_events(session_id, phase, event_type)
  WHERE phase = 'artifact' AND event_type IN ('start', 'end');

  CREATE TABLE IF NOT EXISTS responses (
    session_id TEXT NOT NULL REFERENCES study_sessions(session_id),
    instrument_id TEXT NOT NULL,
    instrument_version TEXT NOT NULL,
    item_id TEXT NOT NULL,
    json_value TEXT NOT NULL,
    created_at_iso TEXT NOT NULL,
    PRIMARY KEY (session_id, instrument_id, item_id)
  );
`;

export function openStudyDatabase(databasePath: string): Database.Database {
  if (databasePath !== ':memory:') {
    const dataDirectory = dirname(databasePath);
    mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
    chmodSync(dataDirectory, 0o700);
  }

  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.exec(schema);

  if (databasePath !== ':memory:') {
    chmodSync(databasePath, 0o600);
  }

  return database;
}

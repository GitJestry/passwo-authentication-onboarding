import { chmodSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { z } from 'zod';

const baselineSchema = `
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

  CREATE TABLE IF NOT EXISTS artifact_leases (
    session_id TEXT PRIMARY KEY REFERENCES study_sessions(session_id),
    last_heartbeat_at_iso TEXT NOT NULL,
    closed_at_iso TEXT
  );

  CREATE INDEX IF NOT EXISTS active_artifact_leases
  ON artifact_leases(last_heartbeat_at_iso)
  WHERE closed_at_iso IS NULL;

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

const instrumentSubmissionSchema = `
  ALTER TABLE study_sessions ADD COLUMN guardrail_form_id TEXT
    CHECK (guardrail_form_id IN ('F1', 'F2', 'F3'));

  ALTER TABLE responses RENAME TO responses_before_instrument_v12;

  CREATE TABLE responses (
    session_id TEXT NOT NULL REFERENCES study_sessions(session_id),
    instrument_id TEXT NOT NULL,
    instrument_version TEXT NOT NULL,
    section_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    json_value TEXT NOT NULL,
    created_at_iso TEXT NOT NULL,
    PRIMARY KEY (session_id, instrument_id, section_id, item_id)
  );

  INSERT INTO responses (
    session_id,
    instrument_id,
    instrument_version,
    section_id,
    item_id,
    json_value,
    created_at_iso
  )
  SELECT
    session_id,
    instrument_id,
    instrument_version,
    'placeholder',
    item_id,
    json_value,
    created_at_iso
  FROM responses_before_instrument_v12;

  DROP TABLE responses_before_instrument_v12;

  CREATE TABLE instrument_submissions (
    session_id TEXT NOT NULL REFERENCES study_sessions(session_id),
    instrument_id TEXT NOT NULL,
    instrument_version TEXT NOT NULL,
    section_id TEXT NOT NULL,
    payload_fingerprint TEXT NOT NULL CHECK (length(payload_fingerprint) = 64),
    submitted_at_iso TEXT NOT NULL,
    PRIMARY KEY (session_id, instrument_id, section_id)
  );

  CREATE TABLE response_presentations (
    session_id TEXT NOT NULL REFERENCES study_sessions(session_id),
    instrument_id TEXT NOT NULL,
    instrument_version TEXT NOT NULL,
    section_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    form_id TEXT NOT NULL CHECK (form_id IN ('F1', 'F2', 'F3')),
    option_ids_json TEXT NOT NULL,
    created_at_iso TEXT NOT NULL,
    PRIMARY KEY (session_id, instrument_id, section_id, item_id)
  );

  CREATE TABLE guardrail_form_slots (
    condition TEXT NOT NULL CHECK (condition IN ('supportive', 'reference')),
    block_number INTEGER NOT NULL,
    slot_index INTEGER NOT NULL,
    form_id TEXT NOT NULL CHECK (form_id IN ('F1', 'F2', 'F3')),
    session_id TEXT UNIQUE REFERENCES study_sessions(session_id),
    PRIMARY KEY (condition, block_number, slot_index)
  );
`;

const followUpRecontactSchema = `
  ALTER TABLE study_sessions ADD COLUMN follow_up_consent INTEGER NOT NULL DEFAULT 0
    CHECK (follow_up_consent IN (0, 1));
  ALTER TABLE study_sessions ADD COLUMN follow_up_version TEXT NOT NULL
    DEFAULT 'follow-up-v1-draft';
  ALTER TABLE study_sessions ADD COLUMN follow_up_token_hash TEXT
    CHECK (follow_up_token_hash IS NULL OR length(follow_up_token_hash) = 64);
`;

const requiredFollowUpSchema = `
  ALTER TABLE study_sessions DROP COLUMN follow_up_consent;
`;

const optionalFollowUpSchema = `
  ALTER TABLE study_sessions ADD COLUMN follow_up_consent INTEGER NOT NULL DEFAULT 0
    CHECK (follow_up_consent IN (0, 1));

  UPDATE study_sessions
  SET follow_up_token_hash = (
    SELECT registration.token_hash
    FROM recontact.registrations AS registration
    WHERE registration.session_id = study_sessions.session_id
  )
  WHERE follow_up_token_hash IS NULL
    AND EXISTS (
      SELECT 1
      FROM recontact.registrations AS registration
      WHERE registration.session_id = study_sessions.session_id
    );

  UPDATE study_sessions
  SET follow_up_consent = 1
  WHERE follow_up_token_hash IS NOT NULL
     OR EXISTS (
       SELECT 1
       FROM recontact.registrations AS registration
       WHERE registration.session_id = study_sessions.session_id
     );
`;

const recontactSchema = `
  CREATE TABLE IF NOT EXISTS recontact.registrations (
    session_id TEXT PRIMARY KEY,
    registration_request_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    raw_token TEXT NOT NULL UNIQUE,
    token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64),
    consent_version TEXT NOT NULL,
    registered_at_iso TEXT NOT NULL,
    first_invitation_at_iso TEXT,
    reminder_at_iso TEXT,
    closes_at_iso TEXT,
    first_invitation_sent_at_iso TEXT,
    reminder_sent_at_iso TEXT
  );
`;

interface Migration {
  readonly version: number;
  readonly apply: (database: Database.Database) => void;
}

function migrateLegacyGuardrailAssignments(database: Database.Database): void {
  const forms = ['F1', 'F2', 'F3'] as const;
  const legacySessionSchema = z.object({
    sessionId: z.string(),
    condition: z.enum(['supportive', 'reference']),
  });
  const sessions = z.array(legacySessionSchema).parse(
    database
      .prepare(
        `SELECT session_id AS sessionId, condition
         FROM study_sessions
         ORDER BY condition, created_at_iso, session_id`,
      )
      .all(),
  );
  const perConditionIndex = new Map<string, number>();
  const insertSlot = database.prepare(
    `INSERT INTO guardrail_form_slots (
      condition, block_number, slot_index, form_id, session_id
    ) VALUES (?, ?, ?, ?, ?)`,
  );
  const updateSession = database.prepare(
    `UPDATE study_sessions SET guardrail_form_id = ? WHERE session_id = ?`,
  );

  for (const session of sessions) {
    const index = perConditionIndex.get(session.condition) ?? 0;
    const slotIndex = index % forms.length;
    const formId = forms[slotIndex];
    if (formId === undefined) throw new Error('guardrail-form-migration-failed');
    insertSlot.run(
      session.condition,
      Math.floor(index / forms.length),
      slotIndex,
      formId,
      session.sessionId,
    );
    updateSession.run(formId, session.sessionId);
    perConditionIndex.set(session.condition, index + 1);
  }
  for (const [condition, count] of perConditionIndex) {
    const blockNumber = Math.floor((count - 1) / forms.length);
    for (let index = count; index % forms.length !== 0; index += 1) {
      const slotIndex = index % forms.length;
      const formId = forms[slotIndex];
      if (formId === undefined) throw new Error('guardrail-form-migration-failed');
      insertSlot.run(condition, blockNumber, slotIndex, formId, null);
    }
  }
}

const migrations: readonly Migration[] = [
  {
    version: 1,
    apply: (database) => database.exec(baselineSchema),
  },
  {
    version: 2,
    apply: (database) => {
      database.exec(instrumentSubmissionSchema);
      migrateLegacyGuardrailAssignments(database);
    },
  },
  {
    version: 3,
    apply: (database) => database.exec(followUpRecontactSchema),
  },
  {
    version: 4,
    apply: (database) => database.exec(requiredFollowUpSchema),
  },
  {
    version: 5,
    apply: (database) => database.exec(optionalFollowUpSchema),
  },
];

function migrate(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at_iso TEXT NOT NULL
    );
  `);
  const appliedRows = z
    .array(z.object({ version: z.number().int().positive() }))
    .parse(database.prepare(`SELECT version FROM schema_migrations ORDER BY version`).all());
  const appliedVersions = new Set(appliedRows.map((row) => row.version));
  const applyMigration = database.transaction((migration: Migration) => {
    migration.apply(database);
    database
      .prepare(`INSERT INTO schema_migrations (version, applied_at_iso) VALUES (?, ?)`)
      .run(migration.version, new Date().toISOString());
  });

  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) applyMigration(migration);
  }
}

export function openStudyDatabase(
  databasePath: string,
  recontactDatabasePath = ':memory:',
): Database.Database {
  if (databasePath !== ':memory:') {
    const dataDirectory = dirname(databasePath);
    mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
    chmodSync(dataDirectory, 0o700);
  }

  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = DELETE');
  attachRecontactDatabase(database, recontactDatabasePath);
  migrate(database);

  if (databasePath !== ':memory:') {
    chmodSync(databasePath, 0o600);
  }

  return database;
}

export function attachRecontactDatabase(database: Database.Database, databasePath: string): void {
  if (databasePath !== ':memory:') {
    const dataDirectory = dirname(databasePath);
    mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
    chmodSync(dataDirectory, 0o700);
  }

  database.prepare('ATTACH DATABASE ? AS recontact').run(databasePath);
  database.pragma('recontact.journal_mode = DELETE');
  database.exec(recontactSchema);

  if (databasePath !== ':memory:') {
    chmodSync(databasePath, 0o600);
  }
}

import { createHash, randomBytes } from 'node:crypto';
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

const sixGuardrailFormsSchema = `
  ALTER TABLE study_sessions ADD COLUMN guardrail_form_id_v4 TEXT
    CHECK (guardrail_form_id_v4 IN ('F1', 'F2', 'F3', 'F4', 'F5', 'F6'));
  UPDATE study_sessions SET guardrail_form_id_v4 = guardrail_form_id;
  ALTER TABLE study_sessions DROP COLUMN guardrail_form_id;
  ALTER TABLE study_sessions RENAME COLUMN guardrail_form_id_v4 TO guardrail_form_id;

  ALTER TABLE response_presentations RENAME TO response_presentations_before_six_forms;
  CREATE TABLE response_presentations (
    session_id TEXT NOT NULL REFERENCES study_sessions(session_id),
    instrument_id TEXT NOT NULL,
    instrument_version TEXT NOT NULL,
    section_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    form_id TEXT NOT NULL CHECK (form_id IN ('F1', 'F2', 'F3', 'F4', 'F5', 'F6')),
    option_ids_json TEXT NOT NULL,
    created_at_iso TEXT NOT NULL,
    PRIMARY KEY (session_id, instrument_id, section_id, item_id)
  );
  INSERT INTO response_presentations
  SELECT * FROM response_presentations_before_six_forms;
  DROP TABLE response_presentations_before_six_forms;

  ALTER TABLE guardrail_form_slots RENAME TO guardrail_form_slots_before_six_forms;
  CREATE TABLE guardrail_form_slots (
    condition TEXT NOT NULL CHECK (condition IN ('supportive', 'reference')),
    block_number INTEGER NOT NULL,
    slot_index INTEGER NOT NULL,
    form_id TEXT NOT NULL CHECK (form_id IN ('F1', 'F2', 'F3', 'F4', 'F5', 'F6')),
    session_id TEXT UNIQUE REFERENCES study_sessions(session_id),
    PRIMARY KEY (condition, block_number, slot_index)
  );
  INSERT INTO guardrail_form_slots
  SELECT * FROM guardrail_form_slots_before_six_forms;
  DROP TABLE guardrail_form_slots_before_six_forms;
`;

const webRuntimeSchema = `
  ALTER TABLE study_sessions ADD COLUMN progress_checkpoint TEXT NOT NULL
    DEFAULT 'pre-questionnaire';
  ALTER TABLE study_sessions ADD COLUMN artifact_completed_at_iso TEXT;
  ALTER TABLE study_sessions ADD COLUMN web_interruption_count INTEGER NOT NULL DEFAULT 0
    CHECK (web_interruption_count >= 0);
  ALTER TABLE study_sessions ADD COLUMN last_resumed_at_iso TEXT;

  CREATE TABLE web_resume_tokens (
    session_id TEXT PRIMARY KEY REFERENCES study_sessions(session_id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64),
    expires_at_iso TEXT NOT NULL,
    last_confirmed_at_iso TEXT NOT NULL,
    invalidated_at_iso TEXT
  );

  CREATE INDEX active_web_resume_tokens
  ON web_resume_tokens(token_hash, expires_at_iso)
  WHERE invalidated_at_iso IS NULL;

  CREATE TABLE web_artifact_intervals (
    interval_id TEXT PRIMARY KEY,
    open_request_id TEXT NOT NULL UNIQUE,
    session_id TEXT NOT NULL REFERENCES study_sessions(session_id) ON DELETE CASCADE,
    started_at_iso TEXT NOT NULL,
    last_confirmed_at_iso TEXT NOT NULL,
    confirmed_elapsed_ms REAL NOT NULL DEFAULT 0
      CHECK (confirmed_elapsed_ms >= 0 AND confirmed_elapsed_ms <= 21600000),
    closed_at_iso TEXT,
    close_reason TEXT CHECK (close_reason IS NULL OR close_reason IN ('completed', 'interrupted'))
  );

  CREATE UNIQUE INDEX one_active_web_artifact_interval
  ON web_artifact_intervals(session_id) WHERE closed_at_iso IS NULL;
  CREATE INDEX web_artifact_intervals_by_session
  ON web_artifact_intervals(session_id, started_at_iso);

  CREATE TABLE web_segment_timing_events (
    event_id TEXT PRIMARY KEY,
    interval_id TEXT NOT NULL REFERENCES web_artifact_intervals(interval_id) ON DELETE CASCADE,
    session_id TEXT NOT NULL REFERENCES study_sessions(session_id) ON DELETE CASCADE,
    segment_id TEXT NOT NULL CHECK (
      segment_id IN ('S00', 'S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07')
    ),
    event_type TEXT NOT NULL CHECK (event_type IN ('segment-start', 'segment-end')),
    elapsed_ms REAL CHECK (elapsed_ms IS NULL OR (elapsed_ms >= 0 AND elapsed_ms <= 21600000)),
    server_received_at_iso TEXT NOT NULL,
    UNIQUE (interval_id, segment_id, event_type)
  );

  CREATE TABLE web_artifact_visibility_events (
    event_id TEXT PRIMARY KEY,
    interval_id TEXT NOT NULL REFERENCES web_artifact_intervals(interval_id) ON DELETE CASCADE,
    session_id TEXT NOT NULL REFERENCES study_sessions(session_id) ON DELETE CASCADE,
    visibility TEXT NOT NULL CHECK (visibility IN ('hidden', 'visible')),
    elapsed_ms REAL NOT NULL CHECK (elapsed_ms >= 0 AND elapsed_ms <= 21600000),
    server_received_at_iso TEXT NOT NULL
  );
`;

const supportiveS08ResumeSchema = `
  ALTER TABLE study_sessions ADD COLUMN supportive_s08_resume_state_json TEXT;

  UPDATE study_sessions
  SET progress_checkpoint = 'supportive:S07'
  WHERE condition = 'supportive'
    AND completion_status = 'in-progress'
    AND artifact_completed_at_iso IS NULL
    AND progress_checkpoint = 'supportive:complete';
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
  readonly apply: (
    database: Database.Database,
    migrationResearchToken: () => string,
  ) => void;
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

const legacyDeletionIdentityRowSchema = z.object({
  sessionId: z.string(),
  participantCode: z.string(),
});
const migrationResearchTokenSchema = z.string().regex(/^[A-F0-9]{16}$/u);

function legacyDeletionCodeHash(participantCode: string): string {
  return createHash('sha256').update(participantCode, 'utf8').digest('hex');
}

function newMigrationResearchCode(
  existingCodes: Set<string>,
  migrationResearchToken: () => string,
): string {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const token = migrationResearchTokenSchema.parse(migrationResearchToken());
    const researchCode = `RS-${token}`;
    if (!existingCodes.has(researchCode)) return researchCode;
  }
  throw new Error('research-code-migration-failed');
}

function migrateResearchIdentitySeparation(
  database: Database.Database,
  migrationResearchToken: () => string,
): void {
  const legacyRows = z.array(legacyDeletionIdentityRowSchema).parse(
    database
      .prepare(
        `SELECT
          session_id AS sessionId,
          participant_code AS participantCode
         FROM study_sessions
         ORDER BY session_id`,
      )
      .all(),
  );

  database.exec(`
    ALTER TABLE study_sessions RENAME COLUMN participant_code TO research_code;
    ALTER TABLE study_sessions ADD COLUMN deletion_code_hash TEXT
      CHECK (deletion_code_hash IS NULL OR length(deletion_code_hash) = 64);
  `);

  const usedResearchCodes = new Set<string>();
  const updateIdentity = database.prepare(
    `UPDATE study_sessions
     SET research_code = ?, deletion_code_hash = ?
     WHERE session_id = ?`,
  );
  for (const row of legacyRows) {
    const researchCode = newMigrationResearchCode(usedResearchCodes, migrationResearchToken);
    usedResearchCodes.add(researchCode);
    updateIdentity.run(researchCode, legacyDeletionCodeHash(row.participantCode), row.sessionId);
  }

  database.exec(`
    CREATE UNIQUE INDEX unique_deletion_code_hash
    ON study_sessions(deletion_code_hash);

    CREATE TRIGGER require_deletion_code_hash_on_insert
    BEFORE INSERT ON study_sessions
    WHEN NEW.deletion_code_hash IS NULL
    BEGIN
      SELECT RAISE(ABORT, 'deletion-code-hash-required');
    END;

    CREATE TRIGGER require_deletion_code_hash_on_update
    BEFORE UPDATE OF deletion_code_hash ON study_sessions
    WHEN NEW.deletion_code_hash IS NULL
    BEGIN
      SELECT RAISE(ABORT, 'deletion-code-hash-required');
    END;
  `);
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
  {
    version: 6,
    apply: migrateResearchIdentitySeparation,
  },
  {
    version: 7,
    apply: (database) => database.exec(sixGuardrailFormsSchema),
  },
  {
    version: 8,
    apply: (database) => database.exec(webRuntimeSchema),
  },
  {
    version: 9,
    apply: (database) => database.exec(supportiveS08ResumeSchema),
  },
];

function migrate(database: Database.Database, migrationResearchToken: () => string): void {
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
    migration.apply(database, migrationResearchToken);
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
  migrationResearchToken: () => string = () => randomBytes(8).toString('hex').toUpperCase(),
): Database.Database {
  if (databasePath !== ':memory:') {
    const dataDirectory = dirname(databasePath);
    mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
    chmodSync(dataDirectory, 0o700);
  }

  const database = new Database(databasePath, { timeout: 5_000 });
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = DELETE');
  database.pragma('synchronous = FULL');
  database.pragma('busy_timeout = 5000');
  database.pragma('secure_delete = ON');
  database.pragma('temp_store = MEMORY');
  attachRecontactDatabase(database, recontactDatabasePath);
  migrate(database, migrationResearchToken);

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

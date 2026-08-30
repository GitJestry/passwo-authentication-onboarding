import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import Database from 'better-sqlite3';
import { exportFollowUpSchedule } from '../apps/study-server/src/followup-schedule-export.js';
import { runFollowUpContactDeletion } from '../apps/study-server/src/followup-contact-deletion.js';

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-followup-operations-'));
const databasePath = join(temporaryDirectory, 'recontact.sqlite');
const schedulePath = join(temporaryDirectory, 'followup-schedule.json');
const token = 'D'.repeat(43);

try {
  const database = new Database(databasePath);
  database.pragma('secure_delete = ON');
  database.exec(`
    CREATE TABLE registrations (
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
  `);
  database
    .prepare(
      `INSERT INTO registrations (
         session_id, registration_request_id, email, raw_token, token_hash,
         consent_version, registered_at_iso, first_invitation_at_iso,
         reminder_at_iso, closes_at_iso
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
      'followup-dry-run@example.invalid',
      token,
      createHash('sha256').update(token, 'utf8').digest('hex'),
      'consent-v14-pilot',
      '2026-07-01T12:00:00.000Z',
      '2026-07-11T12:00:00.000Z',
      '2026-07-13T12:00:00.000Z',
      '2026-07-15T12:00:00.000Z',
    );
  database.close();

  const schedule = exportFollowUpSchedule({
    databasePath,
    outputPath: schedulePath,
    baseUrl: 'https://study.example.invalid/follow-up',
  });
  const scheduleContent = readFileSync(schedulePath, 'utf8');
  if (
    schedule.recordCount !== 1 ||
    !scheduleContent.includes('followup-dry-run@example.invalid') ||
    !scheduleContent.includes(`https://study.example.invalid/follow-up?token=${token}`) ||
    /\[(?:TOKEN_LINK|STICHTAG|CLOSES_AT)\]/u.test(scheduleContent)
  )
    throw new Error('manual-follow-up-schedule-dry-run-invalid');

  const deletion = runFollowUpContactDeletion({
    databasePath,
    mode: 'dry-run',
    nowIso: '2026-07-15T12:00:00.000Z',
  });
  const verificationDatabase = new Database(databasePath, { readonly: true });
  const remaining = verificationDatabase
    .prepare('SELECT COUNT(*) AS count FROM registrations')
    .get();
  verificationDatabase.close();
  const remainingCount =
    typeof remaining === 'object' &&
    remaining !== null &&
    'count' in remaining &&
    typeof remaining.count === 'number'
      ? remaining.count
      : null;
  if (
    !deletion.eligible ||
    deletion.contactCountBefore !== 1 ||
    deletion.contactCountAfter !== 1 ||
    remainingCount !== 1
  )
    throw new Error('follow-up-contact-deletion-dry-run-mutated-data');

  process.stdout.write(
    'Manueller Versand-Dry-Run: 1 geschützte Testnachricht vorbereitet; keine Nachricht gesendet.\n',
  );
  process.stdout.write(
    'Kontaktlösch-Dry-Run: 1 Kontakt erkannt; 1 Kontakt unverändert vorhanden.\n',
  );
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

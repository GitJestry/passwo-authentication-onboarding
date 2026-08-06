import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, extname } from 'node:path';
import { followUpRawTokenSchema } from '@passwo/contracts';
import Database from 'better-sqlite3';
import { z } from 'zod';

const scheduledRegistrationRowSchema = z.object({
  email: z.string(),
  rawToken: followUpRawTokenSchema,
  firstInvitationAtIso: z.iso.datetime(),
  reminderAtIso: z.iso.datetime(),
  closesAtIso: z.iso.datetime(),
});

export interface FollowUpScheduleExportOptions {
  readonly databasePath: string;
  readonly outputPath: string;
  readonly baseUrl: string;
}

export interface FollowUpScheduleExportResult {
  readonly recordCount: number;
}

interface FollowUpScheduleRecord {
  readonly email: string;
  readonly tokenLink: string;
  readonly firstInvitationAtIso: string;
  readonly reminderAtIso: string;
  readonly closesAtIso: string;
}

function protectedOutputDirectory(outputPath: string): void {
  const outputDirectory = dirname(outputPath);
  if (existsSync(outputDirectory)) return;
  mkdirSync(outputDirectory, { recursive: true, mode: 0o700 });
  chmodSync(outputDirectory, 0o700);
}

function followUpUrl(baseUrl: string, token: string): string {
  const url = new URL(baseUrl);
  if (
    url.protocol !== 'https:' ||
    url.hostname.length === 0 ||
    url.username.length > 0 ||
    url.password.length > 0
  ) {
    throw new Error('followup-base-url-must-be-https');
  }
  url.hash = '';
  url.searchParams.set('token', token);
  return url.href;
}

function csvCell(value: string): string {
  return /[",\n\r]/u.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function csvContent(records: readonly FollowUpScheduleRecord[]): string {
  const rows = records.map((record) =>
    [
      record.email,
      record.tokenLink,
      record.firstInvitationAtIso,
      record.reminderAtIso,
      record.closesAtIso,
    ]
      .map(csvCell)
      .join(','),
  );
  return [
    'email,tokenLink,firstInvitationAtIso,reminderAtIso,closesAtIso',
    ...rows,
    '',
  ].join('\n');
}

export function exportFollowUpSchedule({
  databasePath,
  outputPath,
  baseUrl,
}: FollowUpScheduleExportOptions): FollowUpScheduleExportResult {
  const extension = extname(outputPath).toLowerCase();
  if (extension !== '.csv' && extension !== '.json') {
    throw new Error('followup-output-must-be-csv-or-json');
  }
  if (existsSync(outputPath)) {
    throw new Error('followup-export-target-already-exists');
  }

  const database = new Database(databasePath, { readonly: true });
  try {
    const rows = database
      .prepare(
        `SELECT
          email,
          raw_token AS rawToken,
          first_invitation_at_iso AS firstInvitationAtIso,
          reminder_at_iso AS reminderAtIso,
          closes_at_iso AS closesAtIso
         FROM registrations
         WHERE first_invitation_at_iso IS NOT NULL
           AND reminder_at_iso IS NOT NULL
           AND closes_at_iso IS NOT NULL
         ORDER BY first_invitation_at_iso, email`,
      )
      .all()
      .map((row) => scheduledRegistrationRowSchema.parse(row));
    const records = rows.map((row) => ({
      email: row.email,
      tokenLink: followUpUrl(baseUrl, row.rawToken),
      firstInvitationAtIso: row.firstInvitationAtIso,
      reminderAtIso: row.reminderAtIso,
      closesAtIso: row.closesAtIso,
    }));
    const content =
      extension === '.json' ? `${JSON.stringify(records, null, 2)}\n` : csvContent(records);

    protectedOutputDirectory(outputPath);
    writeFileSync(outputPath, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    chmodSync(outputPath, 0o600);
    return { recordCount: records.length };
  } finally {
    database.close();
  }
}

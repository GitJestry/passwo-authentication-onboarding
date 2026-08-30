import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, extname } from 'node:path';
import {
  followUpInstrument,
  followUpRawTokenSchema,
  followUpTokenHashSchema,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import { z } from 'zod';
import { followUpOperationId, followUpUrl, renderFollowUpEmailBody } from './followup-message.js';

const scheduledRegistrationRowSchema = z.object({
  email: z.string(),
  rawToken: followUpRawTokenSchema,
  tokenHash: followUpTokenHashSchema,
  firstInvitationAtIso: z.iso.datetime(),
  reminderAtIso: z.iso.datetime(),
  closesAtIso: z.iso.datetime(),
  firstInvitationSentAtIso: z.iso.datetime().nullable(),
  reminderSentAtIso: z.iso.datetime().nullable(),
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
  readonly firstInvitationOperationId: string;
  readonly reminderOperationId: string;
  readonly firstInvitationAtIso: string;
  readonly reminderAtIso: string;
  readonly closesAtIso: string;
  readonly firstInvitationSentAtIso: string | null;
  readonly reminderSentAtIso: string | null;
  readonly firstInvitationSubject: string;
  readonly firstInvitationBody: string;
  readonly reminderSubject: string;
  readonly reminderBody: string;
}

function protectedOutputDirectory(outputPath: string): void {
  const outputDirectory = dirname(outputPath);
  if (existsSync(outputDirectory)) return;
  mkdirSync(outputDirectory, { recursive: true, mode: 0o700 });
  chmodSync(outputDirectory, 0o700);
}

function csvCell(value: string): string {
  return /[",\n\r]/u.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function csvContent(records: readonly FollowUpScheduleRecord[]): string {
  const rows = records.map((record) =>
    [
      record.email,
      record.tokenLink,
      record.firstInvitationOperationId,
      record.reminderOperationId,
      record.firstInvitationAtIso,
      record.reminderAtIso,
      record.closesAtIso,
      record.firstInvitationSentAtIso ?? '',
      record.reminderSentAtIso ?? '',
      record.firstInvitationSubject,
      record.firstInvitationBody,
      record.reminderSubject,
      record.reminderBody,
    ]
      .map(csvCell)
      .join(','),
  );
  return [
    'email,tokenLink,firstInvitationOperationId,reminderOperationId,firstInvitationAtIso,reminderAtIso,closesAtIso,firstInvitationSentAtIso,reminderSentAtIso,firstInvitationSubject,firstInvitationBody,reminderSubject,reminderBody',
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
          token_hash AS tokenHash,
          first_invitation_at_iso AS firstInvitationAtIso,
          reminder_at_iso AS reminderAtIso,
          closes_at_iso AS closesAtIso,
          first_invitation_sent_at_iso AS firstInvitationSentAtIso,
          reminder_sent_at_iso AS reminderSentAtIso
         FROM registrations
         WHERE first_invitation_at_iso IS NOT NULL
           AND reminder_at_iso IS NOT NULL
           AND closes_at_iso IS NOT NULL
         ORDER BY first_invitation_at_iso, email`,
      )
      .all()
      .map((row) => scheduledRegistrationRowSchema.parse(row));
    const records = rows.map((row) => {
      const tokenLink = followUpUrl(baseUrl, row.rawToken);
      return {
        email: row.email,
        tokenLink,
        firstInvitationOperationId: followUpOperationId(
          row.tokenHash,
          'first-invitation',
          row.firstInvitationAtIso,
        ),
        reminderOperationId: followUpOperationId(row.tokenHash, 'reminder', row.reminderAtIso),
        firstInvitationAtIso: row.firstInvitationAtIso,
        reminderAtIso: row.reminderAtIso,
        closesAtIso: row.closesAtIso,
        firstInvitationSentAtIso: row.firstInvitationSentAtIso,
        reminderSentAtIso: row.reminderSentAtIso,
        firstInvitationSubject: followUpInstrument.email.subject,
        firstInvitationBody: renderFollowUpEmailBody(
          followUpInstrument.email.body,
          tokenLink,
          row.firstInvitationAtIso,
          row.closesAtIso,
        ),
        reminderSubject: followUpInstrument.reminderEmail.subject,
        reminderBody: renderFollowUpEmailBody(
          followUpInstrument.reminderEmail.body,
          tokenLink,
          row.firstInvitationAtIso,
          row.closesAtIso,
        ),
      };
    });
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

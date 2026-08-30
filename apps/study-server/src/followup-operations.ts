import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  followUpInstrument,
  followUpRawTokenSchema,
  followUpTokenHashSchema,
} from '@passwo/contracts';
import type Database from 'better-sqlite3';
import { z } from 'zod';
import {
  type FollowUpDeliveryKind,
  type FollowUpDeliveryMessage,
  type FollowUpSenderIdentity,
  followUpOperationId,
  renderFollowUpDeliveryMessage,
} from './followup-message.js';

const registrationRowSchema = z.object({
  sessionId: z.string(),
  email: z.email(),
  rawToken: followUpRawTokenSchema,
  tokenHash: followUpTokenHashSchema,
  firstInvitationAtIso: z.iso.datetime(),
  reminderAtIso: z.iso.datetime(),
  closesAtIso: z.iso.datetime(),
  firstInvitationSentAtIso: z.iso.datetime().nullable(),
  reminderSentAtIso: z.iso.datetime().nullable(),
  submitted: z.union([z.literal(0), z.literal(1)]),
});

type RegistrationRow = z.infer<typeof registrationRowSchema>;

export type FollowUpDeliveryResult = 'delivered' | 'prepared' | 'dry-run';

export interface FollowUpMailTransport {
  /**
   * Implementations must deduplicate delivery by message.operationId before reporting delivered.
   * This is the boundary that makes scheduler retries safe across process failures.
   */
  deliver(message: FollowUpDeliveryMessage): Promise<FollowUpDeliveryResult>;
}

export interface RunFollowUpSchedulerOptions {
  readonly database: Database.Database;
  readonly nowIso: string;
  readonly baseUrl: string;
  readonly sender: FollowUpSenderIdentity;
  readonly transport: FollowUpMailTransport;
}

export interface FollowUpSchedulerReport {
  readonly dueCount: number;
  readonly deliveredCount: number;
  readonly preparedCount: number;
  readonly dryRunCount: number;
  readonly sentMarkerCount: number;
}

export class DryRunFollowUpMailTransport implements FollowUpMailTransport {
  async deliver(_message: FollowUpDeliveryMessage): Promise<'dry-run'> {
    return 'dry-run';
  }
}

export class FileFollowUpMailTransport implements FollowUpMailTransport {
  readonly #outputDirectory: string;

  constructor(outputDirectory: string) {
    this.#outputDirectory = outputDirectory;
  }

  async deliver(message: FollowUpDeliveryMessage): Promise<'prepared'> {
    mkdirSync(this.#outputDirectory, { recursive: true, mode: 0o700 });
    chmodSync(this.#outputDirectory, 0o700);
    const outputPath = join(this.#outputDirectory, `${message.operationId}.json`);
    const content = `${JSON.stringify(message, null, 2)}\n`;
    try {
      writeFileSync(outputPath, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
      chmodSync(outputPath, 0o600);
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
      if (
        code !== 'EEXIST' ||
        !existsSync(outputPath) ||
        readFileSync(outputPath, 'utf8') !== content
      ) {
        throw error;
      }
    }
    return 'prepared';
  }
}

function parseIso(value: string): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new Error('invalid-follow-up-operations-clock');
  return timestamp;
}

function registrations(database: Database.Database): RegistrationRow[] {
  return database
    .prepare(
      `SELECT
        registration.session_id AS sessionId,
        registration.email,
        registration.raw_token AS rawToken,
        registration.token_hash AS tokenHash,
        registration.first_invitation_at_iso AS firstInvitationAtIso,
        registration.reminder_at_iso AS reminderAtIso,
        registration.closes_at_iso AS closesAtIso,
        registration.first_invitation_sent_at_iso AS firstInvitationSentAtIso,
        registration.reminder_sent_at_iso AS reminderSentAtIso,
        EXISTS (
          SELECT 1
          FROM instrument_submissions AS submission
          WHERE submission.session_id = session.session_id
            AND submission.instrument_id = 'follow-up-v1'
            AND submission.section_id = 'actions'
        ) AS submitted
       FROM recontact.registrations AS registration
       INNER JOIN study_sessions AS session
         ON session.session_id = registration.session_id
        AND session.follow_up_token_hash = registration.token_hash
       WHERE session.follow_up_consent = 1
         AND session.completion_status = 'completed'
         AND session.follow_up_version = ?
         AND registration.first_invitation_at_iso IS NOT NULL
         AND registration.reminder_at_iso IS NOT NULL
         AND registration.closes_at_iso IS NOT NULL
       ORDER BY registration.first_invitation_at_iso, registration.session_id`,
    )
    .all(followUpInstrument.version)
    .map((row) => registrationRowSchema.parse(row));
}

function reminderDueAtIso(row: RegistrationRow): string | null {
  if (row.firstInvitationSentAtIso === null) return null;
  const afterActualInvitation =
    parseIso(row.firstInvitationSentAtIso) +
    followUpInstrument.schedule.reminderDelayAfterFirstInvitationHours * 60 * 60 * 1_000;
  return new Date(Math.max(parseIso(row.reminderAtIso), afterActualInvitation)).toISOString();
}

function messageInputFor(
  row: RegistrationRow,
  kind: FollowUpDeliveryKind,
): Parameters<typeof renderFollowUpDeliveryMessage>[0] | null {
  const dueAtIso = kind === 'first-invitation' ? row.firstInvitationAtIso : reminderDueAtIso(row);
  if (dueAtIso === null) return null;
  return {
    kind,
    email: row.email,
    rawToken: row.rawToken,
    tokenHash: row.tokenHash,
    firstInvitationAtIso: row.firstInvitationAtIso,
    operationAtIso: kind === 'first-invitation' ? row.firstInvitationAtIso : row.reminderAtIso,
    dueAtIso,
    closesAtIso: row.closesAtIso,
  };
}

function dueKind(row: RegistrationRow, now: number): FollowUpDeliveryKind | null {
  if (row.submitted === 1 || now >= parseIso(row.closesAtIso)) return null;
  if (row.firstInvitationSentAtIso === null) {
    return now >= parseIso(row.firstInvitationAtIso) ? 'first-invitation' : null;
  }
  if (row.reminderSentAtIso !== null) return null;
  const reminderDueAt = reminderDueAtIso(row);
  return reminderDueAt !== null && now >= parseIso(reminderDueAt) ? 'reminder' : null;
}

function dueMessages(
  database: Database.Database,
  nowIso: string,
  baseUrl: string,
  sender: FollowUpSenderIdentity,
): readonly { readonly sessionId: string; readonly message: FollowUpDeliveryMessage }[] {
  const now = parseIso(nowIso);
  return registrations(database).flatMap((row) => {
    const kind = dueKind(row, now);
    if (kind === null) return [];
    const input = messageInputFor(row, kind);
    if (input === null) return [];
    return [
      { sessionId: row.sessionId, message: renderFollowUpDeliveryMessage(input, baseUrl, sender) },
    ];
  });
}

function markSent(
  database: Database.Database,
  sessionId: string,
  kind: FollowUpDeliveryKind,
  sentAtIso: string,
): number {
  const column =
    kind === 'first-invitation' ? 'first_invitation_sent_at_iso' : 'reminder_sent_at_iso';
  return database
    .prepare(
      `UPDATE recontact.registrations
       SET ${column} = ?
       WHERE session_id = ? AND ${column} IS NULL`,
    )
    .run(sentAtIso, sessionId).changes;
}

export async function runFollowUpScheduler({
  database,
  nowIso,
  baseUrl,
  sender,
  transport,
}: RunFollowUpSchedulerOptions): Promise<FollowUpSchedulerReport> {
  const deliveries = dueMessages(database, nowIso, baseUrl, sender);
  let deliveredCount = 0;
  let preparedCount = 0;
  let dryRunCount = 0;
  let sentMarkerCount = 0;

  for (const delivery of deliveries) {
    const result = await transport.deliver(delivery.message);
    if (result === 'delivered') {
      deliveredCount += 1;
      sentMarkerCount += markSent(database, delivery.sessionId, delivery.message.kind, nowIso);
    } else if (result === 'prepared') {
      preparedCount += 1;
    } else {
      dryRunCount += 1;
    }
  }

  return {
    dueCount: deliveries.length,
    deliveredCount,
    preparedCount,
    dryRunCount,
    sentMarkerCount,
  };
}

export type FollowUpDeliveryConfirmationResult =
  | 'eligible'
  | 'confirmed'
  | 'already-confirmed'
  | 'not-eligible';

export function confirmFollowUpDelivery(options: {
  readonly database: Database.Database;
  readonly operationId: string;
  readonly nowIso: string;
  readonly mode: 'dry-run' | 'confirm';
}): FollowUpDeliveryConfirmationResult {
  const now = parseIso(options.nowIso);
  for (const row of registrations(options.database)) {
    for (const kind of ['first-invitation', 'reminder'] as const) {
      const input = messageInputFor(row, kind);
      if (input === null) continue;
      if (followUpOperationId(row.tokenHash, kind, input.operationAtIso) !== options.operationId)
        continue;
      const sentAtIso =
        kind === 'first-invitation' ? row.firstInvitationSentAtIso : row.reminderSentAtIso;
      if (sentAtIso !== null) return 'already-confirmed';
      if (dueKind(row, now) !== kind) return 'not-eligible';
      if (options.mode === 'dry-run') return 'eligible';
      return markSent(options.database, row.sessionId, kind, options.nowIso) === 1
        ? 'confirmed'
        : 'already-confirmed';
    }
  }
  return 'not-eligible';
}

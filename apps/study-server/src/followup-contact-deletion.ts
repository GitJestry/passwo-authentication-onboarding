import {
  type FollowUpContactDeletionReport,
  followUpContactDeletionReportSchema,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import { z } from 'zod';

const deletionStatusRowSchema = z
  .object({
    contactCount: z.number().int().nonnegative(),
    unscheduledContactCount: z.number().int().nonnegative(),
    lastWindowClosesAtIso: z.string().nullable(),
  })
  .strict();
const countRowSchema = z.object({ count: z.number().int().nonnegative() }).strict();

export type FollowUpContactDeletionMode = 'dry-run' | 'delete';

export interface FollowUpContactDeletionOptions {
  readonly databasePath: string;
  readonly mode: FollowUpContactDeletionMode;
  readonly nowIso?: string;
}

function status(database: Database.Database): z.infer<typeof deletionStatusRowSchema> {
  return deletionStatusRowSchema.parse(
    database
      .prepare(
        `SELECT
           COUNT(*) AS contactCount,
           COALESCE(SUM(CASE WHEN closes_at_iso IS NULL THEN 1 ELSE 0 END), 0)
             AS unscheduledContactCount,
           MAX(closes_at_iso) AS lastWindowClosesAtIso
         FROM registrations`,
      )
      .get(),
  );
}

function reportFor(
  row: z.infer<typeof deletionStatusRowSchema>,
  mode: FollowUpContactDeletionMode,
  performedAtIso: string,
  contactCountAfter: number,
): FollowUpContactDeletionReport {
  const performedAt = Date.parse(performedAtIso);
  const lastWindowClosesAt =
    row.lastWindowClosesAtIso === null ? null : Date.parse(row.lastWindowClosesAtIso);
  if (
    !Number.isFinite(performedAt) ||
    (lastWindowClosesAt !== null && !Number.isFinite(lastWindowClosesAt))
  )
    throw new Error('follow-up-contact-deletion-clock-invalid');
  const deletionDeadlineAtIso =
    lastWindowClosesAt === null
      ? null
      : new Date(lastWindowClosesAt + 7 * 24 * 60 * 60 * 1_000).toISOString();
  const eligible =
    row.contactCount === 0 ||
    (row.unscheduledContactCount === 0 &&
      lastWindowClosesAt !== null &&
      performedAt >= lastWindowClosesAt);
  return followUpContactDeletionReportSchema.parse({
    mode,
    performedAtIso,
    eligible,
    overdue: deletionDeadlineAtIso !== null && performedAt > Date.parse(deletionDeadlineAtIso),
    contactCountBefore: row.contactCount,
    contactCountAfter,
    unscheduledContactCount: row.unscheduledContactCount,
    lastWindowClosesAtIso: row.lastWindowClosesAtIso,
    deletionDeadlineAtIso,
  });
}

export function runFollowUpContactDeletion({
  databasePath,
  mode,
  nowIso = new Date().toISOString(),
}: FollowUpContactDeletionOptions): FollowUpContactDeletionReport {
  const database = new Database(databasePath, {
    readonly: mode === 'dry-run',
    fileMustExist: true,
  });
  try {
    if (mode === 'dry-run') database.pragma('query_only = ON');
    const before = status(database);
    const dryRunReport = reportFor(before, mode, nowIso, before.contactCount);
    if (mode === 'dry-run') return dryRunReport;
    if (!dryRunReport.eligible) throw new Error('follow-up-contact-deletion-not-eligible');

    database.pragma('secure_delete = ON');
    database.transaction(() => {
      database.prepare('DELETE FROM registrations').run();
    })();
    database.exec('VACUUM');
    const after = countRowSchema.parse(
      database.prepare('SELECT COUNT(*) AS count FROM registrations').get(),
    );
    return reportFor(before, mode, nowIso, after.count);
  } finally {
    database.close();
  }
}

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { FollowUpContactDeletionReport } from '@passwo/contracts/follow-up';
import { runFollowUpContactDeletion } from '../apps/study-server/src/followup-contact-deletion.js';
import { resolveRecontactDatabasePath } from '../apps/study-server/src/runtime.js';

interface Options {
  readonly databasePath: string;
  readonly confirmed: boolean;
}

function usage(): string {
  return [
    'Nutzung: pnpm followup:delete-contacts [--database <recontact.sqlite>] [--confirm]',
    'Ohne --confirm wird ausschließlich ein Trockenlauf ausgeführt.',
    '',
  ].join('\n');
}

function optionsFor(argumentsList: readonly string[]): Options | null {
  let databasePath = resolveRecontactDatabasePath();
  let confirmed = false;
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    const value = argumentsList[index + 1];
    if (argument === '--database' && value !== undefined) {
      databasePath = resolve(value);
      index += 1;
    } else if (argument === '--confirm') {
      confirmed = true;
    } else {
      return null;
    }
  }
  return { databasePath, confirmed };
}

function writeReport(report: FollowUpContactDeletionReport): void {
  process.stdout.write(
    report.mode === 'dry-run'
      ? 'Trockenlauf: Das Kontaktregister wurde nicht verändert.\n'
      : 'Kontaktregister gelöscht und bereinigt.\n',
  );
  process.stdout.write(`Zeitpunkt: ${report.performedAtIso}\n`);
  process.stdout.write(`Kontakte vorher: ${report.contactCountBefore}\n`);
  process.stdout.write(`Kontakte danach: ${report.contactCountAfter}\n`);
  process.stdout.write(`Löschung zulässig: ${report.eligible ? 'ja' : 'nein'}\n`);
  if (report.lastWindowClosesAtIso !== null) {
    process.stdout.write(`Letztes Fensterschließen: ${report.lastWindowClosesAtIso}\n`);
    process.stdout.write(`Späteste Löschfrist: ${report.deletionDeadlineAtIso ?? '-'}\n`);
  }
  if (report.unscheduledContactCount > 0) {
    process.stdout.write(`Noch nicht terminierte Kontakte: ${report.unscheduledContactCount}\n`);
  }
  if (report.overdue)
    process.stdout.write('Hinweis: Die dokumentierte Löschfrist ist überschritten.\n');
  process.stdout.write(
    'Schedule-Dateien und versandte Nachrichten im projektkontrollierten Postfach bleiben separat manuell zu löschen.\n',
  );
  process.stdout.write('Ausführende Person: ____________________\n');
}

const options = optionsFor(process.argv.slice(2));
if (options === null) {
  process.stderr.write(usage());
  process.exitCode = 1;
} else if (!existsSync(options.databasePath)) {
  process.stderr.write('Kontaktregister nicht gefunden.\n');
  process.exitCode = 1;
} else {
  try {
    writeReport(
      runFollowUpContactDeletion({
        databasePath: options.databasePath,
        mode: options.confirmed ? 'delete' : 'dry-run',
      }),
    );
  } catch {
    process.stderr.write('Kontaktlöschworkflow fehlgeschlagen oder noch nicht zulässig.\n');
    process.exitCode = 1;
  }
}

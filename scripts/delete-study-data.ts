import {
  deletionCodeSchema,
  hashDeletionCode,
  type StudyDataDeletionReport,
} from '@passwo/contracts';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveRecontactDatabasePath, resolveStudyDatabasePath } from '../apps/study-server/src/runtime.js';
import { runStudyDataDeletion } from '../apps/study-server/src/study-data-deletion.js';

interface DeleteCommandOptions {
  readonly databasePath: string;
  readonly recontactDatabasePath: string;
  readonly confirmed: boolean;
}

function usage(): string {
  return [
    'Nutzung: pnpm study:delete [--database <study.sqlite>] [--recontact-database <recontact.sqlite>] [--confirm]',
    'Der Löschcode wird über die Standardeingabe abgefragt und nie als Kommandozeilenargument akzeptiert.',
    '',
  ].join('\n');
}

function parseDeleteOptions(argumentsList: readonly string[]): DeleteCommandOptions | null {
  let databasePath = resolveStudyDatabasePath();
  let recontactDatabasePath = resolveRecontactDatabasePath();
  let confirmed = false;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    const value = argumentsList[index + 1];
    if (
      (argument === '--database' || argument === '--recontact-database') &&
      value === undefined
    ) {
      return null;
    }
    if (argument === '--database' && value !== undefined) {
      databasePath = resolve(value);
      index += 1;
    } else if (argument === '--recontact-database' && value !== undefined) {
      recontactDatabasePath = resolve(value);
      index += 1;
    } else if (argument === '--confirm') {
      confirmed = true;
    } else if (argument !== undefined) {
      return null;
    }
  }

  return { databasePath, recontactDatabasePath, confirmed };
}

function readHiddenDeletionCode(): Promise<string> {
  if (!process.stdin.isTTY || process.stdin.setRawMode === undefined) {
    return readDeletionCodeFromStandardInput();
  }

  process.stdout.write('Löschcode eingeben: ');
  return new Promise((resolve, reject) => {
    let deletionCode = '';
    const cleanup = (): void => {
      process.stdin.off('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
    };
    const resolveInput = (): void => {
      cleanup();
      resolve(deletionCode);
    };
    const rejectInput = (): void => {
      cleanup();
      reject(new Error('deletion-code-input-cancelled'));
    };
    const onData = (chunk: Buffer): void => {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003') {
          rejectInput();
          return;
        }
        if (character === '\r' || character === '\n') {
          resolveInput();
          return;
        }
        if (character === '\b' || character === '\u007f') {
          deletionCode = deletionCode.slice(0, -1);
        } else if (character >= ' ' && deletionCode.length < 80) {
          deletionCode += character;
        }
      }
    };
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', onData);
  });
}

async function readDeletionCodeFromStandardInput(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const supplied = Buffer.concat(chunks).toString('utf8');
  return supplied.endsWith('\r\n')
    ? supplied.slice(0, -2)
    : supplied.endsWith('\n')
      ? supplied.slice(0, -1)
      : supplied;
}

function writeReport(report: StudyDataDeletionReport, confirmed: boolean): void {
  process.stdout.write(confirmed ? 'Löschung abgeschlossen.\n' : 'Trockenlauf: keine Daten gelöscht.\n');
  for (const { table, count } of report.tables) {
    process.stdout.write(`${table}: ${count}\n`);
  }
  process.stdout.write('Bestehende Exporte und Backups werden nicht verändert.\n');
}

async function main(): Promise<void> {
  const options = parseDeleteOptions(process.argv.slice(2));
  if (options === null) {
    process.stderr.write(usage());
    process.exitCode = 1;
    return;
  }
  if (!existsSync(options.databasePath)) {
    process.stderr.write('Studiendatenbank nicht gefunden.\n');
    process.exitCode = 1;
    return;
  }

  try {
    const deletionCode = deletionCodeSchema.safeParse(await readHiddenDeletionCode());
    if (!deletionCode.success) {
      process.stderr.write('Ungültiges Löschcode-Format.\n');
      process.exitCode = 1;
      return;
    }
    const deletionCodeHash = await hashDeletionCode(deletionCode.data);
    const report = runStudyDataDeletion({
      databasePath: options.databasePath,
      recontactDatabasePath: options.recontactDatabasePath,
      deletionCodeHash,
      mode: options.confirmed ? 'delete' : 'dry-run',
    });
    writeReport(report, options.confirmed);
  } catch {
    process.stderr.write('Lokaler Studiendaten-Löschworkflow fehlgeschlagen.\n');
    process.exitCode = 1;
  }
}

void main();

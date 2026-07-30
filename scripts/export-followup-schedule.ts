import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { exportFollowUpSchedule } from '../apps/study-server/src/followup-schedule-export.js';
import { resolveRecontactDatabasePath } from '../apps/study-server/src/runtime.js';

interface ExportCommandOptions {
  readonly databasePath: string;
  readonly outputPath: string;
  readonly baseUrl: string;
}

function usage(): string {
  return 'Usage: pnpm followup:export-schedule -- --output <file.csv|file.json> --base-url <https-url> [--database <recontact.sqlite>]\n';
}

function parseExportOptions(argumentsList: readonly string[]): ExportCommandOptions | null {
  let databasePath = resolveRecontactDatabasePath();
  let outputPath: string | null = null;
  let baseUrl: string | null = null;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    const value = argumentsList[index + 1];
    if (
      (argument === '--database' || argument === '--output' || argument === '--base-url') &&
      value === undefined
    ) {
      return null;
    }
    if (argument === '--database' && value !== undefined) {
      databasePath = resolve(value);
      index += 1;
    } else if (argument === '--output' && value !== undefined) {
      outputPath = resolve(value);
      index += 1;
    } else if (argument === '--base-url' && value !== undefined) {
      baseUrl = value;
      index += 1;
    } else if (argument !== undefined) {
      return null;
    }
  }

  return outputPath === null || baseUrl === null ? null : { databasePath, outputPath, baseUrl };
}

const options = parseExportOptions(process.argv.slice(2));
if (options === null) {
  process.stderr.write(usage());
  process.exitCode = 1;
} else if (!existsSync(options.databasePath)) {
  process.stderr.write('Recontact database not found.\n');
  process.exitCode = 1;
} else {
  try {
    const result = exportFollowUpSchedule(options);
    process.stdout.write(
      `Follow-up schedule export created with ${result.recordCount} records. No messages were sent.\n`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'followup-schedule-export-failed';
    process.stderr.write(`Follow-up schedule export failed: ${message}\n`);
    process.exitCode = 1;
  }
}

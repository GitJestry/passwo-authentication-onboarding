import { existsSync } from 'node:fs';
import { openStudyDatabase } from '../apps/study-server/src/database.js';
import { confirmFollowUpDelivery } from '../apps/study-server/src/followup-operations.js';
import {
  resolveRecontactDatabasePath,
  resolveStudyDatabasePath,
} from '../apps/study-server/src/runtime.js';

function usage(): string {
  return 'Usage: pnpm followup:confirm-delivery -- --operation <64-hex-id> [--confirm]\n';
}

function parseArguments(argumentsList: readonly string[]): {
  readonly operationId: string;
  readonly mode: 'dry-run' | 'confirm';
} | null {
  let operationId: string | null = null;
  let mode: 'dry-run' | 'confirm' = 'dry-run';
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--operation') {
      const value = argumentsList[index + 1];
      if (value === undefined || !/^[a-f0-9]{64}$/u.test(value)) return null;
      operationId = value;
      index += 1;
    } else if (argument === '--confirm') {
      mode = 'confirm';
    } else {
      return null;
    }
  }
  return operationId === null ? null : { operationId, mode };
}

const options = parseArguments(process.argv.slice(2));
if (options === null) {
  process.stderr.write(usage());
  process.exitCode = 1;
} else {
  const studyDatabasePath = resolveStudyDatabasePath();
  const recontactDatabasePath = resolveRecontactDatabasePath();
  if (!existsSync(studyDatabasePath) || !existsSync(recontactDatabasePath)) {
    process.stderr.write('Follow-up databases not found.\n');
    process.exitCode = 1;
  } else {
    const database = openStudyDatabase(studyDatabasePath, recontactDatabasePath);
    try {
      const result = confirmFollowUpDelivery({
        database,
        operationId: options.operationId,
        nowIso: new Date().toISOString(),
        mode: options.mode,
      });
      process.stdout.write(`${JSON.stringify({ mode: options.mode, result })}\n`);
      if (result === 'not-eligible') process.exitCode = 1;
    } finally {
      database.close();
    }
  }
}

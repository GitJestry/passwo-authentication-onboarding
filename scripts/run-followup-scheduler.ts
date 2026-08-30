import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { openStudyDatabase } from '../apps/study-server/src/database.js';
import {
  DryRunFollowUpMailTransport,
  FileFollowUpMailTransport,
  runFollowUpScheduler,
} from '../apps/study-server/src/followup-operations.js';
import {
  resolveRecontactDatabasePath,
  resolveStudyDatabasePath,
} from '../apps/study-server/src/runtime.js';

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value.length === 0) throw new Error(`missing-${name}`);
  return value;
}

const studyDatabasePath = resolveStudyDatabasePath();
const recontactDatabasePath = resolveRecontactDatabasePath();

if (!existsSync(studyDatabasePath) || !existsSync(recontactDatabasePath)) {
  process.stderr.write('Follow-up databases not found.\n');
  process.exitCode = 1;
} else {
  const database = openStudyDatabase(studyDatabasePath, recontactDatabasePath);
  try {
    const mode = process.env.PASSWO_FOLLOWUP_TRANSPORT?.trim() || 'dry-run';
    const transport =
      mode === 'dry-run'
        ? new DryRunFollowUpMailTransport()
        : mode === 'file'
          ? new FileFollowUpMailTransport(
              resolve(requiredEnvironment('PASSWO_FOLLOWUP_OUTBOX_DIR')),
            )
          : null;
    if (transport === null) throw new Error('unsupported-PASSWO_FOLLOWUP_TRANSPORT');
    const report = await runFollowUpScheduler({
      database,
      nowIso: new Date().toISOString(),
      baseUrl: requiredEnvironment('PASSWO_FOLLOWUP_BASE_URL'),
      sender: {
        name: requiredEnvironment('PASSWO_FOLLOWUP_SENDER_NAME'),
        address: requiredEnvironment('PASSWO_FOLLOWUP_SENDER_ADDRESS'),
      },
      transport,
    });
    process.stdout.write(`${JSON.stringify({ mode, ...report })}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'follow-up-scheduler-failed';
    process.stderr.write(`Follow-up scheduler failed: ${message}\n`);
    process.exitCode = 1;
  } finally {
    database.close();
  }
}

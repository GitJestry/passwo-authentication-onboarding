import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { type ResearchExportProfile, researchExportProfileSchema } from '@passwo/contracts';
import { exportResearchData } from '../apps/study-server/src/research-export.js';

interface ExportCommandOptions {
  readonly databasePath: string;
  readonly outputDirectory: string;
  readonly profile: ResearchExportProfile;
}

function usage(): string {
  return (
    'Usage: pnpm study:export -- --output <directory> ' +
    '[--database <study.sqlite>] [--profile audit|analysis]\n'
  );
}

function parseExportOptions(argumentsList: readonly string[]): ExportCommandOptions | null {
  let databasePath = resolve(homedir(), '.passwo-study', 'study.sqlite');
  let outputDirectory: string | null = null;
  let profile: ResearchExportProfile = 'audit';

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    const value = argumentsList[index + 1];
    if (
      (argument === '--database' || argument === '--output' || argument === '--profile') &&
      value === undefined
    ) {
      return null;
    }
    if (argument === '--database' && value !== undefined) {
      databasePath = resolve(value);
      index += 1;
    } else if (argument === '--output' && value !== undefined) {
      outputDirectory = resolve(value);
      index += 1;
    } else if (argument === '--profile' && value !== undefined) {
      const parsedProfile = researchExportProfileSchema.safeParse(value);
      if (!parsedProfile.success) return null;
      profile = parsedProfile.data;
      index += 1;
    } else if (argument !== undefined) {
      return null;
    }
  }

  return outputDirectory === null ? null : { databasePath, outputDirectory, profile };
}

const options = parseExportOptions(process.argv.slice(2));
if (options === null) {
  process.stderr.write(usage());
  process.exitCode = 1;
} else if (!existsSync(options.databasePath)) {
  process.stderr.write('Study database not found.\n');
  process.exitCode = 1;
} else {
  try {
    const result = await exportResearchData(options);
    process.stdout.write(
      `${result.manifest.profile} research export created with ${result.files.length} files and ${result.manifest.files.length} data hashes.\n`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'research-export-failed';
    process.stderr.write(`Research export failed: ${message}\n`);
    process.exitCode = 1;
  }
}

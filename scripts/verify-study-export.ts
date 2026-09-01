import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  type ResearchExportProfile,
  researchExportManifestSchema,
  researchExportProfileSchema,
} from '@passwo/contracts';

interface VerificationOptions {
  readonly directory: string;
  readonly profile: ResearchExportProfile;
}

const sharedFileNames = [
  'sessions.csv',
  'timing.csv',
  'responses.csv',
  'response-presentations.csv',
  'data-dictionary.csv',
  'export-guide.csv',
  'sessions.json',
  'timing.json',
  'responses.json',
  'response-presentations.json',
  'data-dictionary.json',
  'export-guide.json',
  'study-export.xlsx',
] as const;

function usage(): string {
  return 'Verwendung: tsx scripts/verify-study-export.ts --directory <pfad> --profile audit|analysis\n';
}

function parseOptions(argumentsList: readonly string[]): VerificationOptions | null {
  let directory: string | null = null;
  let profile: ResearchExportProfile | null = null;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    const value = argumentsList[index + 1];
    if ((argument === '--directory' || argument === '--profile') && value === undefined) {
      return null;
    }
    if (argument === '--directory' && value !== undefined) {
      directory = resolve(value);
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

  return directory === null || profile === null ? null : { directory, profile };
}

function expectedFileNames(profile: ResearchExportProfile): ReadonlySet<string> {
  return new Set([
    ...sharedFileNames,
    ...(profile === 'analysis' ? ['free-text-review.csv', 'free-text-review.json'] : []),
  ]);
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function verifyExport({ directory, profile }: VerificationOptions): number {
  const manifestValue: unknown = JSON.parse(
    readFileSync(join(directory, 'manifest.json'), 'utf8'),
  );
  const manifest = researchExportManifestSchema.parse(manifestValue);
  if (manifest.profile !== profile) {
    throw new Error(`study-export-profile-mismatch-${manifest.profile}`);
  }

  const declaredFileNames = manifest.files.map(({ fileName }) => fileName);
  const uniqueDeclaredFileNames = new Set(declaredFileNames);
  if (uniqueDeclaredFileNames.size !== declaredFileNames.length) {
    throw new Error('study-export-manifest-contains-duplicate-files');
  }

  const expected = expectedFileNames(profile);
  if (
    uniqueDeclaredFileNames.size !== expected.size ||
    [...expected].some((fileName) => !uniqueDeclaredFileNames.has(fileName))
  ) {
    throw new Error('study-export-manifest-file-set-mismatch');
  }

  const directoryEntries = readdirSync(directory, { withFileTypes: true });
  const expectedDirectoryEntries = new Set([...expected, 'manifest.json']);
  if (
    directoryEntries.length !== expectedDirectoryEntries.size ||
    directoryEntries.some(
      (entry) => !entry.isFile() || !expectedDirectoryEntries.has(entry.name),
    )
  ) {
    throw new Error('study-export-directory-file-set-mismatch');
  }

  for (const file of manifest.files) {
    if (sha256(join(directory, file.fileName)) !== file.sha256) {
      throw new Error(`study-export-checksum-mismatch-${file.fileName}`);
    }
  }
  return manifest.files.length;
}

const options = parseOptions(process.argv.slice(2));
if (options === null) {
  process.stderr.write(usage());
  process.exitCode = 1;
} else {
  try {
    const verifiedFileCount = verifyExport(options);
    process.stdout.write(
      `Forschungsdatenexport ${options.profile} geprüft (${verifiedFileCount} Datendateien plus Manifest).\n`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'study-export-verification-failed';
    process.stderr.write(`Prüfung des Forschungsdatenexports fehlgeschlagen: ${message}\n`);
    process.exitCode = 1;
  }
}

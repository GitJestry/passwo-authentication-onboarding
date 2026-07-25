import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  completionStatusSchema,
  type ResearchExportManifest,
  type ResearchExportResponseRecord,
  type ResearchExportSessionRecord,
  researchExportManifestSchema,
  researchExportResponseRecordSchema,
  researchExportSessionRecordSchema,
  researchExportTimingRecordSchema,
  studyConditionSchema,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import { z } from 'zod';
import { mapSessionRow, sessionRowSelection } from './session-row.js';

const exportFileNames = [
  'sessions.csv',
  'timing.csv',
  'responses.csv',
  'sessions.json',
  'timing.json',
  'responses.json',
] as const;

const databaseResponseRowSchema = z.object({
  sessionId: z.string(),
  instrumentId: z.string(),
  instrumentVersion: z.string(),
  itemId: z.string(),
  jsonValue: z.string(),
  createdAtIso: z.string(),
});

interface ExportFile {
  readonly fileName: (typeof exportFileNames)[number];
  readonly content: string;
}

export interface ResearchExportResult {
  readonly files: readonly string[];
  readonly manifest: ResearchExportManifest;
}

export interface ResearchExportOptions {
  readonly databasePath: string;
  readonly outputDirectory: string;
  readonly exportedAtIso?: string;
}

function toResponseRecord(row: unknown): ResearchExportResponseRecord {
  const parsed = databaseResponseRowSchema.parse(row);
  const value: unknown = JSON.parse(parsed.jsonValue);
  return researchExportResponseRecordSchema.parse({
    sessionId: parsed.sessionId,
    instrumentId: parsed.instrumentId,
    instrumentVersion: parsed.instrumentVersion,
    itemId: parsed.itemId,
    value,
    createdAtIso: parsed.createdAtIso,
  });
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function csvCell(value: string | number | boolean | null): string {
  const raw = value === null ? '' : String(value);
  return /[",\n\r]/u.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
}

function csvFile(
  columns: readonly string[],
  rows: readonly (readonly (string | number | boolean | null)[])[],
): string {
  return `${[columns, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function sortedVersions(values: readonly (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => value !== null))].sort();
}

function sessionCounts(
  sessions: readonly ResearchExportSessionRecord[],
): ResearchExportManifest['sessionCounts'] {
  return studyConditionSchema.options.flatMap((condition) =>
    completionStatusSchema.options.map((completionStatus) => ({
      condition,
      completionStatus,
      count: sessions.filter(
        (session) =>
          session.condition === condition && session.completionStatus === completionStatus,
      ).length,
    })),
  );
}

function assertEmptyExportTarget(outputDirectory: string): void {
  mkdirSync(outputDirectory, { recursive: true, mode: 0o700 });
  for (const fileName of [...exportFileNames, 'manifest.json']) {
    if (existsSync(join(outputDirectory, fileName))) {
      throw new Error(`export-target-already-contains-${fileName}`);
    }
  }
}

export function exportResearchData({
  databasePath,
  outputDirectory,
  exportedAtIso = new Date().toISOString(),
}: ResearchExportOptions): ResearchExportResult {
  const database = new Database(databasePath, { readonly: true });
  try {
    const sessions = database
      .prepare(`${sessionRowSelection} ORDER BY session_id`)
      .all()
      .map((row) => researchExportSessionRecordSchema.parse(mapSessionRow(row)));
    const timing = database
      .prepare(
        `SELECT
          session_id AS sessionId,
          sequence,
          phase,
          section_id AS sectionId,
          segment_id AS segmentId,
          event_type AS eventType,
          client_monotonic_ms AS clientMonotonicMs,
          client_wall_clock_iso AS clientWallClockIso,
          elapsed_ms AS elapsedMs,
          reason_code AS reasonCode,
          server_received_at_iso AS serverReceivedAtIso
         FROM timing_events
         ORDER BY session_id, sequence`,
      )
      .all()
      .map((row) => researchExportTimingRecordSchema.parse(row));
    const responses = database
      .prepare(
        `SELECT
          session_id AS sessionId,
          instrument_id AS instrumentId,
          instrument_version AS instrumentVersion,
          item_id AS itemId,
          json_value AS jsonValue,
          created_at_iso AS createdAtIso
         FROM responses
         ORDER BY session_id, instrument_id, item_id`,
      )
      .all()
      .map(toResponseRecord);

    const files: readonly ExportFile[] = [
      {
        fileName: 'sessions.csv',
        content: csvFile(
          [
            'sessionId',
            'participantCode',
            'condition',
            'assignmentMode',
            'studyVersion',
            'contentVersion',
            'questionnaireVersion',
            'guardrailVersion',
            'consentVersion',
            'referenceArtifactVersion',
            'consentAccepted',
            'completionStatus',
            'technicalErrorCode',
            'createdAtIso',
            'completedAtIso',
          ],
          sessions.map((session) => [
            session.sessionId,
            session.participantCode,
            session.condition,
            session.assignmentMode,
            session.studyVersion,
            session.contentVersion,
            session.questionnaireVersion,
            session.guardrailVersion,
            session.consentVersion,
            session.referenceArtifactVersion,
            session.consentAccepted,
            session.completionStatus,
            session.technicalErrorCode,
            session.createdAtIso,
            session.completedAtIso,
          ]),
        ),
      },
      {
        fileName: 'timing.csv',
        content: csvFile(
          [
            'sessionId',
            'sequence',
            'phase',
            'sectionId',
            'segmentId',
            'eventType',
            'clientMonotonicMs',
            'clientWallClockIso',
            'elapsedMs',
            'reasonCode',
            'serverReceivedAtIso',
          ],
          timing.map((event) => [
            event.sessionId,
            event.sequence,
            event.phase,
            event.sectionId,
            event.segmentId,
            event.eventType,
            event.clientMonotonicMs,
            event.clientWallClockIso,
            event.elapsedMs,
            event.reasonCode,
            event.serverReceivedAtIso,
          ]),
        ),
      },
      {
        fileName: 'responses.csv',
        content: csvFile(
          ['sessionId', 'instrumentId', 'instrumentVersion', 'itemId', 'value', 'createdAtIso'],
          responses.map((response) => [
            response.sessionId,
            response.instrumentId,
            response.instrumentVersion,
            response.itemId,
            response.value,
            response.createdAtIso,
          ]),
        ),
      },
      { fileName: 'sessions.json', content: stableJson(sessions) },
      { fileName: 'timing.json', content: stableJson(timing) },
      { fileName: 'responses.json', content: stableJson(responses) },
    ];

    assertEmptyExportTarget(outputDirectory);
    for (const file of files) {
      writeFileSync(join(outputDirectory, file.fileName), file.content, { mode: 0o600 });
    }

    const manifest = researchExportManifestSchema.parse({
      schemaVersion: 'research-export-v1',
      exportedAtIso,
      versions: {
        study: sortedVersions(sessions.map((session) => session.studyVersion)),
        content: sortedVersions(sessions.map((session) => session.contentVersion)),
        questionnaire: sortedVersions(sessions.map((session) => session.questionnaireVersion)),
        guardrail: sortedVersions(sessions.map((session) => session.guardrailVersion)),
        consent: sortedVersions(sessions.map((session) => session.consentVersion)),
        referenceArtifact: sortedVersions(
          sessions.map((session) => session.referenceArtifactVersion),
        ),
      },
      sessionCounts: sessionCounts(sessions),
      files: files.map((file) => ({ fileName: file.fileName, sha256: sha256(file.content) })),
    });
    writeFileSync(join(outputDirectory, 'manifest.json'), stableJson(manifest), { mode: 0o600 });

    return { files: [...exportFileNames, 'manifest.json'], manifest };
  } finally {
    database.close();
  }
}

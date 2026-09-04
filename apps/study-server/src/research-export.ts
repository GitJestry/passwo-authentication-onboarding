import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  completionStatusSchema,
  instrumentRuntimeManifest,
  type ResearchAnalysisResponseRecord,
  type ResearchAnalysisSessionRecord,
  type ResearchExportManifest,
  type ResearchExportPresentationRecord,
  type ResearchExportProfile,
  type ResearchExportResponseRecord,
  type ResearchExportSessionRecord,
  researchAnalysisResponseRecordSchema,
  researchAnalysisSessionRecordSchema,
  researchExportFileNames,
  researchExportManifestSchema,
  researchExportPresentationRecordSchema,
  researchExportResponseRecordSchema,
  researchExportSessionRecordSchema,
  researchExportTimingRecordSchema,
  studyConditionSchema,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import { z } from 'zod';
import {
  createResearchDataDictionary,
  createResearchExportGuide,
} from './research-export-cookbook.js';
import {
  createResearchWorkbook,
  type ResearchWorkbookCell,
  type ResearchWorkbookSheet,
} from './research-export-workbook.js';
import { mapSessionRow, sessionRowSelection } from './session-row.js';

type ExportFileName = ReturnType<typeof researchExportFileNames>[number];

const databaseResponseRowSchema = z.object({
  researchId: z.string(),
  instrumentId: z.string(),
  instrumentVersion: z.string(),
  sectionId: z.string(),
  itemId: z.string(),
  jsonValue: z.string(),
  createdAtIso: z.string(),
});
const databasePresentationRowSchema = z.object({
  researchId: z.string(),
  instrumentId: z.string(),
  instrumentVersion: z.string(),
  sectionId: z.string(),
  itemId: z.string(),
  formId: z.string(),
  optionIdsJson: z.string(),
  createdAtIso: z.string(),
});

interface ExportFile {
  readonly fileName: ExportFileName;
  readonly content: string | Buffer;
}

interface ExportTable extends ResearchWorkbookSheet {
  readonly fileName: Extract<ExportFileName, `${string}.csv`>;
}

export interface ResearchExportResult {
  readonly files: readonly string[];
  readonly manifest: ResearchExportManifest;
}

export interface ResearchExportOptions {
  readonly databasePath: string;
  readonly outputDirectory: string;
  readonly exportedAtIso?: string;
  readonly profile?: ResearchExportProfile;
}

function toResponseRecord(row: unknown): ResearchExportResponseRecord {
  const parsed = databaseResponseRowSchema.parse(row);
  const value: unknown = JSON.parse(parsed.jsonValue);
  return researchExportResponseRecordSchema.parse({
    researchId: parsed.researchId,
    instrumentId: parsed.instrumentId,
    instrumentVersion: parsed.instrumentVersion,
    sectionId: parsed.sectionId,
    itemId: parsed.itemId,
    value,
    createdAtIso: parsed.createdAtIso,
  });
}

function toPresentationRecord(row: unknown): ResearchExportPresentationRecord {
  const parsed = databasePresentationRowSchema.parse(row);
  const displayedOptionIds: unknown = JSON.parse(parsed.optionIdsJson);
  return researchExportPresentationRecordSchema.parse({
    researchId: parsed.researchId,
    instrumentId: parsed.instrumentId,
    instrumentVersion: parsed.instrumentVersion,
    sectionId: parsed.sectionId,
    itemId: parsed.itemId,
    formId: parsed.formId,
    displayedOptionIds,
    createdAtIso: parsed.createdAtIso,
  });
}

function toSessionRecord(row: unknown): ResearchExportSessionRecord {
  const { sessionId, researchCode, deletionCodeHash, followUpTokenHash, ...session } =
    mapSessionRow(row);
  void sessionId;
  void deletionCodeHash;
  void followUpTokenHash;
  return researchExportSessionRecordSchema.parse({ researchId: researchCode, ...session });
}

function toAnalysisSession(session: ResearchExportSessionRecord): ResearchAnalysisSessionRecord {
  const { createdAtIso, completedAtIso, ...analysisSession } = session;
  void createdAtIso;
  void completedAtIso;
  return researchAnalysisSessionRecordSchema.parse(analysisSession);
}

function toAnalysisResponse(
  response: ResearchExportResponseRecord,
): ResearchAnalysisResponseRecord {
  const { createdAtIso, ...analysisResponse } = response;
  void createdAtIso;
  return researchAnalysisResponseRecordSchema.parse(analysisResponse);
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function compactJson(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error('research-export-json-serialization-failed');
  return serialized;
}

function responseCell(value: ResearchExportResponseRecord['value']): ResearchWorkbookCell {
  return Array.isArray(value) ? compactJson(value) : value;
}

function csvCell(value: ResearchWorkbookCell): string {
  const raw = value === null ? '' : String(value);
  return /[",\n\r]/u.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
}

function csvFile(
  columns: readonly string[],
  rows: readonly (readonly ResearchWorkbookCell[])[],
): string {
  return `${[columns, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
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

function assertEmptyExportTarget(
  outputDirectory: string,
  fileNames: readonly ExportFileName[],
): void {
  mkdirSync(outputDirectory, { recursive: true, mode: 0o700 });
  for (const fileName of [...fileNames, 'manifest.json']) {
    if (existsSync(join(outputDirectory, fileName))) {
      throw new Error(`export-target-already-contains-${fileName}`);
    }
  }
}

export async function exportResearchData({
  databasePath,
  outputDirectory,
  exportedAtIso = new Date().toISOString(),
  profile = 'audit',
}: ResearchExportOptions): Promise<ResearchExportResult> {
  const database = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    // All tables must describe the same snapshot, including during concurrent deletion.
    const { sessions, timing, responses, presentations } = database.transaction(() => {
      const sessions = database
        .prepare(`${sessionRowSelection}
        ${profile === 'analysis' ? "WHERE completion_status = 'completed'" : ''}
        ORDER BY research_code`)
        .all()
        .map(toSessionRecord);
      const timing =
        profile === 'analysis'
          ? []
          : database
              .prepare(
                `SELECT
          session.research_code AS researchId,
          timing.sequence,
          timing.phase,
          timing.section_id AS sectionId,
          timing.segment_id AS segmentId,
          timing.event_type AS eventType,
          timing.client_monotonic_ms AS clientMonotonicMs,
          timing.client_wall_clock_iso AS clientWallClockIso,
          timing.elapsed_ms AS elapsedMs,
          timing.reason_code AS reasonCode,
          timing.server_received_at_iso AS serverReceivedAtIso
         FROM timing_events AS timing
         INNER JOIN study_sessions AS session ON session.session_id = timing.session_id
         ORDER BY session.research_code, timing.sequence`,
              )
              .all()
              .map((row) => researchExportTimingRecordSchema.parse(row));
      const responses = database
        .prepare(
          `SELECT
          session.research_code AS researchId,
          response.instrument_id AS instrumentId,
          response.instrument_version AS instrumentVersion,
          response.section_id AS sectionId,
          response.item_id AS itemId,
          response.json_value AS jsonValue,
          response.created_at_iso AS createdAtIso
         FROM responses AS response
         INNER JOIN study_sessions AS session ON session.session_id = response.session_id
         WHERE EXISTS (
           SELECT 1
           FROM instrument_submissions AS submission
           WHERE submission.session_id = response.session_id
             AND submission.instrument_id = response.instrument_id
             AND submission.section_id = response.section_id
         )
         AND (? = 'audit' OR session.completion_status = 'completed')
         ORDER BY
           session.research_code,
           response.instrument_id,
           response.section_id,
           response.item_id`,
        )
        .all(profile)
        .map(toResponseRecord);
      const presentations =
        profile === 'analysis'
          ? []
          : database
              .prepare(
                `SELECT
          session.research_code AS researchId,
          presentation.instrument_id AS instrumentId,
          presentation.instrument_version AS instrumentVersion,
          presentation.section_id AS sectionId,
          presentation.item_id AS itemId,
          presentation.form_id AS formId,
          presentation.option_ids_json AS optionIdsJson,
          presentation.created_at_iso AS createdAtIso
         FROM response_presentations AS presentation
         INNER JOIN study_sessions AS session ON session.session_id = presentation.session_id
         ORDER BY
           session.research_code,
           presentation.instrument_id,
           presentation.section_id,
           presentation.item_id`,
              )
              .all()
              .map(toPresentationRecord);
      return { sessions, timing, responses, presentations };
    })();
    const dictionary = createResearchDataDictionary();
    const guide = createResearchExportGuide(profile);
    const analysisResponseKeys = new Set(
      dictionary
        .filter((entry) => entry.responseType !== 'text')
        .map((entry) => `${entry.instrumentId}\u0000${entry.sectionId}\u0000${entry.itemId}`),
    );
    if (
      profile === 'analysis' &&
      responses.some(
        (response) =>
          !analysisResponseKeys.has(
            `${response.instrumentId}\u0000${response.sectionId}\u0000${response.itemId}`,
          ),
      )
    ) {
      // Historical free text stays available in the protected audit export, never silently lost.
      throw new Error('analysis-export-unsupported-item-use-audit');
    }

    const analysisSessions = sessions.map(toAnalysisSession);
    const analysisResponses = responses.map(toAnalysisResponse);
    const dictionaryTable: ExportTable = {
      fileName: 'data-dictionary.csv',
      name: 'Variablen',
      columns: [
        'instrumentId',
        'sectionId',
        'variableGroupId',
        'variableGroupLabel',
        'itemId',
        'itemPrompt',
        'responseType',
        'measurementLevel',
        'analysisRole',
        'required',
        'minimum',
        'maximum',
        'maxLength',
        'scaleId',
        'scaleAnchors',
        'derivedTransform',
        'optionId',
        'optionLabel',
        'optionClassification',
        'displayWhenItemId',
        'displayWhenValue',
        'missingValueRule',
        'source',
        'itemInterpretation',
        'groupInterpretation',
        'aggregationRule',
      ],
      rows: dictionary.map((entry) => [
        entry.instrumentId,
        entry.sectionId,
        entry.variableGroupId,
        entry.variableGroupLabel,
        entry.itemId,
        entry.itemPrompt,
        entry.responseType,
        entry.measurementLevel,
        entry.analysisRole,
        entry.required,
        entry.minimum,
        entry.maximum,
        entry.maxLength,
        entry.scaleId,
        compactJson(entry.scaleAnchors),
        entry.derivedTransform,
        entry.optionId,
        entry.optionLabel,
        entry.optionClassification,
        entry.displayWhenItemId,
        entry.displayWhenValue,
        entry.missingValueRule,
        entry.source,
        entry.itemInterpretation,
        entry.groupInterpretation,
        entry.aggregationRule,
      ]),
    };
    const guideTable: ExportTable = {
      fileName: 'export-guide.csv',
      name: 'Hinweise',
      columns: [
        'entryType',
        'entryId',
        'title',
        'relatedFile',
        'recordDefinition',
        'joinRule',
        'analysisNote',
      ],
      rows: guide.map((entry) => [
        entry.entryType,
        entry.entryId,
        entry.title,
        entry.relatedFile,
        entry.recordDefinition,
        entry.joinRule,
        entry.analysisNote,
      ]),
    };

    const auditTables: readonly ExportTable[] = [
      {
        fileName: 'sessions.csv',
        name: 'Sitzungen',
        columns: [
          'researchId',
          'recruitmentSource',
          'condition',
          'assignmentMode',
          'studyVersion',
          'contentVersion',
          'questionnaireVersion',
          'guardrailVersion',
          'guardrailFormId',
          'consentVersion',
          'referenceArtifactVersion',
          'consentAccepted',
          'followUpConsent',
          'followUpVersion',
          'completionStatus',
          'technicalErrorCode',
          'artifactSessionElapsedMs',
          'webInterruptionCount',
          'createdAtIso',
          'completedAtIso',
        ],
        rows: sessions.map((session) => [
          session.researchId,
          session.recruitmentSource,
          session.condition,
          session.assignmentMode,
          session.studyVersion,
          session.contentVersion,
          session.questionnaireVersion,
          session.guardrailVersion,
          session.guardrailFormId,
          session.consentVersion,
          session.referenceArtifactVersion,
          session.consentAccepted,
          session.followUpConsent,
          session.followUpVersion,
          session.completionStatus,
          session.technicalErrorCode,
          session.artifactSessionElapsedMs,
          session.webInterruptionCount,
          session.createdAtIso,
          session.completedAtIso,
        ]),
      },
      {
        fileName: 'timing.csv',
        name: 'Timing',
        columns: [
          'researchId',
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
        rows: timing.map((event) => [
          event.researchId,
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
      },
      {
        fileName: 'responses.csv',
        name: 'Antworten',
        columns: [
          'researchId',
          'instrumentId',
          'instrumentVersion',
          'sectionId',
          'itemId',
          'value',
          'createdAtIso',
        ],
        rows: responses.map((response) => [
          response.researchId,
          response.instrumentId,
          response.instrumentVersion,
          response.sectionId,
          response.itemId,
          responseCell(response.value),
          response.createdAtIso,
        ]),
      },
      {
        fileName: 'response-presentations.csv',
        name: 'Präsentationen',
        columns: [
          'researchId',
          'instrumentId',
          'instrumentVersion',
          'sectionId',
          'itemId',
          'formId',
          'displayedOptionIds',
          'createdAtIso',
        ],
        rows: presentations.map((presentation) => [
          presentation.researchId,
          presentation.instrumentId,
          presentation.instrumentVersion,
          presentation.sectionId,
          presentation.itemId,
          presentation.formId,
          compactJson(presentation.displayedOptionIds),
          presentation.createdAtIso,
        ]),
      },
    ];
    const dataTables =
      profile === 'audit'
        ? auditTables
        : auditTables
            .filter(
              (table) => table.fileName === 'sessions.csv' || table.fileName === 'responses.csv',
            )
            .map((table) => {
              const indices = table.columns.flatMap((column, index) =>
                column === 'createdAtIso' || column === 'completedAtIso' ? [] : [index],
              );
              return {
                ...table,
                columns: table.columns.filter((_, index) => indices.includes(index)),
                rows: table.rows.map((row) => row.filter((_, index) => indices.includes(index))),
              };
            });
    const tables = [guideTable, ...dataTables, dictionaryTable];
    assertEmptyExportTarget(outputDirectory, researchExportFileNames(profile));
    const workbook = await createResearchWorkbook({ exportedAtIso, sheets: tables });
    const tabularFiles: ExportFile[] = dataTables.map((table) => ({
      fileName: table.fileName,
      content: csvFile(table.columns, table.rows),
    }));
    tabularFiles.push(
      {
        fileName: dictionaryTable.fileName,
        content: csvFile(dictionaryTable.columns, dictionaryTable.rows),
      },
      {
        fileName: guideTable.fileName,
        content: csvFile(guideTable.columns, guideTable.rows),
      },
    );
    const exportedSessions = profile === 'audit' ? sessions : analysisSessions;
    const exportedResponses = profile === 'audit' ? responses : analysisResponses;
    const files: ExportFile[] = [
      ...tabularFiles,
      { fileName: 'sessions.json', content: stableJson(exportedSessions) },
      { fileName: 'responses.json', content: stableJson(exportedResponses) },
      ...(profile === 'audit'
        ? ([
            { fileName: 'timing.json', content: stableJson(timing) },
            { fileName: 'response-presentations.json', content: stableJson(presentations) },
          ] satisfies ExportFile[])
        : []),
      { fileName: 'data-dictionary.json', content: stableJson(dictionary) },
      { fileName: 'export-guide.json', content: stableJson(guide) },
      { fileName: 'study-export.xlsx', content: workbook },
    ];

    for (const file of files) {
      writeFileSync(join(outputDirectory, file.fileName), file.content, {
        mode: 0o600,
        flag: 'wx',
      });
    }

    const manifest = researchExportManifestSchema.parse({
      schemaVersion: 'research-export-v10',
      profile,
      schemaProfileVersion: profile === 'audit' ? 'research-audit-v5' : 'research-analysis-v5',
      exportedAtIso,
      runtimeManifestVersion: instrumentRuntimeManifest.runtimeManifestVersion,
      versions: {
        study: sortedVersions(sessions.map((session) => session.studyVersion)),
        content: sortedVersions(sessions.map((session) => session.contentVersion)),
        questionnaire: sortedVersions(sessions.map((session) => session.questionnaireVersion)),
        guardrail: sortedVersions(sessions.map((session) => session.guardrailVersion)),
        consent: sortedVersions(sessions.map((session) => session.consentVersion)),
        followUp: sortedVersions(sessions.map((session) => session.followUpVersion)),
        referenceArtifact: sortedVersions(
          sessions.map((session) => session.referenceArtifactVersion),
        ),
      },
      sessionCounts: sessionCounts(sessions),
      files: files.map((file) => ({ fileName: file.fileName, sha256: sha256(file.content) })),
    });
    writeFileSync(join(outputDirectory, 'manifest.json'), stableJson(manifest), {
      mode: 0o600,
      flag: 'wx',
    });

    return { files: [...files.map((file) => file.fileName), 'manifest.json'], manifest };
  } finally {
    database.close();
  }
}

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  completionStatusSchema,
  instrumentRuntimeManifest,
  type ResearchAnalysisPresentationRecord,
  type ResearchAnalysisResponseRecord,
  type ResearchAnalysisSessionRecord,
  type ResearchAnalysisTimingRecord,
  type ResearchExportDataDictionaryRecord,
  type ResearchExportManifest,
  type ResearchExportProfile,
  type ResearchExportPresentationRecord,
  type ResearchExportResponseRecord,
  type ResearchExportSessionRecord,
  type ResearchFreeTextReviewRecord,
  researchAnalysisPresentationRecordSchema,
  researchAnalysisResponseRecordSchema,
  researchAnalysisSessionRecordSchema,
  researchAnalysisTimingRecordSchema,
  researchExportDataDictionaryRecordSchema,
  researchExportManifestSchema,
  researchExportPresentationRecordSchema,
  researchExportResponseRecordSchema,
  researchExportSessionRecordSchema,
  researchExportTimingRecordSchema,
  researchFreeTextReviewRecordSchema,
  studyConditionSchema,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import { z } from 'zod';
import { mapSessionRow, sessionRowSelection } from './session-row.js';

const sharedExportFileNames = [
  'sessions.csv',
  'timing.csv',
  'responses.csv',
  'response-presentations.csv',
  'data-dictionary.csv',
  'sessions.json',
  'timing.json',
  'responses.json',
  'response-presentations.json',
  'data-dictionary.json',
] as const;

const freeTextReviewFileNames = ['free-text-review.csv', 'free-text-review.json'] as const;
type ExportFileName =
  | (typeof sharedExportFileNames)[number]
  | (typeof freeTextReviewFileNames)[number];

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
  readonly content: string;
}

interface DictionaryItem {
  readonly id: string;
  readonly type: string;
  readonly scale?: string;
  readonly min?: number;
  readonly max?: number;
  readonly maxLength?: number;
  readonly participantOptional?: true | undefined;
  readonly displayWhen?: { readonly itemId: string; readonly contains: string } | undefined;
  readonly options?: readonly { readonly id: string }[];
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
  const {
    sessionId,
    researchCode,
    deletionCodeHash,
    followUpTokenHash,
    ...session
  } = mapSessionRow(row);
  void sessionId;
  void deletionCodeHash;
  void followUpTokenHash;
  return researchExportSessionRecordSchema.parse({ researchId: researchCode, ...session });
}

function toAnalysisSession(
  session: ResearchExportSessionRecord,
): ResearchAnalysisSessionRecord {
  const { createdAtIso, completedAtIso, ...analysisSession } = session;
  void createdAtIso;
  void completedAtIso;
  return researchAnalysisSessionRecordSchema.parse(analysisSession);
}

function toAnalysisTiming(
  event: z.infer<typeof researchExportTimingRecordSchema>,
): ResearchAnalysisTimingRecord {
  const {
    clientMonotonicMs,
    clientWallClockIso,
    serverReceivedAtIso,
    ...analysisEvent
  } = event;
  void clientMonotonicMs;
  void clientWallClockIso;
  void serverReceivedAtIso;
  return researchAnalysisTimingRecordSchema.parse(analysisEvent);
}

function toAnalysisResponse(
  response: ResearchExportResponseRecord,
): ResearchAnalysisResponseRecord {
  const { createdAtIso, ...analysisResponse } = response;
  void createdAtIso;
  return researchAnalysisResponseRecordSchema.parse(analysisResponse);
}

function toAnalysisPresentation(
  presentation: ResearchExportPresentationRecord,
): ResearchAnalysisPresentationRecord {
  const { createdAtIso, ...analysisPresentation } = presentation;
  void createdAtIso;
  return researchAnalysisPresentationRecordSchema.parse(analysisPresentation);
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function compactJson(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error('research-export-json-serialization-failed');
  return serialized;
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

function scaleBounds(scaleId: string | undefined): {
  readonly minimum: number | null;
  readonly maximum: number | null;
} {
  if (scaleId === undefined) return { minimum: null, maximum: null };
  const scales: Readonly<Record<string, { readonly min: number; readonly max: number }>> =
    instrumentRuntimeManifest.scales;
  const scale = scales[scaleId];
  return scale === undefined
    ? { minimum: null, maximum: null }
    : { minimum: scale.min, maximum: scale.max };
}

function dictionaryRowsForItems(
  instrumentId: string,
  sectionId: string,
  items: readonly DictionaryItem[],
): ResearchExportDataDictionaryRecord[] {
  const interpretationNotes: Readonly<Record<string, string>> = {
    PERCEIVED_DURATION:
      'Subjektiv erlebte Länge; einzeln und als vollständige Verteilung auswerten. Höhere Werte bedeuten länger, nicht bessere Qualität.',
    TIME_FIT:
      'Bewertung der zeitlichen Angemessenheit; einzeln und als vollständige Verteilung auswerten. Höhere Werte bedeuten nicht bessere Qualität.',
  };
  return items.flatMap((item) => {
    const scale = scaleBounds(item.scale);
    const optionIds = item.options?.map((option) => option.id) ?? [null];
    return optionIds.map((optionId) =>
      researchExportDataDictionaryRecordSchema.parse({
        instrumentId,
        sectionId,
        itemId: item.id,
        responseType: item.type,
        required: item.participantOptional !== true && item.displayWhen === undefined,
        minimum: item.min ?? scale.minimum,
        maximum: item.max ?? scale.maximum,
        maxLength: item.maxLength ?? null,
        optionId,
        interpretationNote: interpretationNotes[item.id] ?? null,
      }),
    );
  });
}

function dataDictionary(): ResearchExportDataDictionaryRecord[] {
  const pre = instrumentRuntimeManifest.instruments['pre-v1'].sections.flatMap((section) =>
    dictionaryRowsForItems('pre-v1', section.id, section.items),
  );
  const post = instrumentRuntimeManifest.instruments['post-v1'].sections.flatMap((section) =>
    dictionaryRowsForItems('post-v1', section.id, section.items),
  );
  const guardrail = instrumentRuntimeManifest.instruments['guardrail-v2'].blocks.flatMap((block) =>
    dictionaryRowsForItems(
      'guardrail-v2',
      block.id,
      block.items.map((item) => ({ ...item, type: 'singleChoice' })),
    ),
  );
  return [...pre, ...post, ...guardrail];
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

export function exportResearchData({
  databasePath,
  outputDirectory,
  exportedAtIso = new Date().toISOString(),
  profile = 'audit',
}: ResearchExportOptions): ResearchExportResult {
  const database = new Database(databasePath, { readonly: true });
  try {
    const sessions = database
      .prepare(`${sessionRowSelection} ORDER BY research_code`)
      .all()
      .map(toSessionRecord);
    const timing = database
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
         ORDER BY
           session.research_code,
           response.instrument_id,
           response.section_id,
           response.item_id`,
      )
      .all()
      .map(toResponseRecord);
    const presentations = database
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
    const dictionary = dataDictionary();

    const dictionaryCsv = csvFile(
      [
        'instrumentId',
        'sectionId',
        'itemId',
        'responseType',
        'required',
        'minimum',
        'maximum',
        'maxLength',
        'optionId',
        'interpretationNote',
      ],
      dictionary.map((entry) => [
        entry.instrumentId,
        entry.sectionId,
        entry.itemId,
        entry.responseType,
        entry.required,
        entry.minimum,
        entry.maximum,
        entry.maxLength,
        entry.optionId,
        entry.interpretationNote,
      ]),
    );
    const textResponseKeys = new Set(
      dictionary
        .filter((entry) => entry.responseType === 'text')
        .map((entry) => `${entry.instrumentId}\u0000${entry.sectionId}\u0000${entry.itemId}`),
    );
    const isTextResponse = (response: ResearchExportResponseRecord): boolean =>
      textResponseKeys.has(
        `${response.instrumentId}\u0000${response.sectionId}\u0000${response.itemId}`,
      );
    const freeTextReview = responses.flatMap<ResearchFreeTextReviewRecord>((response) => {
      if (!isTextResponse(response) || typeof response.value !== 'string') return [];
      return [
        researchFreeTextReviewRecordSchema.parse({
          researchId: response.researchId,
          instrumentId: response.instrumentId,
          instrumentVersion: response.instrumentVersion,
          sectionId: response.sectionId,
          itemId: response.itemId,
          value: response.value,
          reviewStatus: 'pending-review',
        }),
      ];
    });

    const auditFiles: readonly ExportFile[] = [
      {
        fileName: 'sessions.csv',
        content: csvFile(
          [
            'researchId', 'condition', 'assignmentMode', 'studyVersion', 'contentVersion',
            'questionnaireVersion', 'guardrailVersion', 'guardrailFormId', 'consentVersion',
            'referenceArtifactVersion', 'consentAccepted', 'followUpConsent', 'followUpVersion',
            'completionStatus', 'technicalErrorCode', 'createdAtIso', 'completedAtIso',
          ],
          sessions.map((session) => [
            session.researchId, session.condition, session.assignmentMode, session.studyVersion,
            session.contentVersion, session.questionnaireVersion, session.guardrailVersion,
            session.guardrailFormId, session.consentVersion, session.referenceArtifactVersion,
            session.consentAccepted, session.followUpConsent, session.followUpVersion,
            session.completionStatus, session.technicalErrorCode, session.createdAtIso,
            session.completedAtIso,
          ]),
        ),
      },
      {
        fileName: 'timing.csv',
        content: csvFile(
          [
            'researchId', 'sequence', 'phase', 'sectionId', 'segmentId', 'eventType',
            'clientMonotonicMs', 'clientWallClockIso', 'elapsedMs', 'reasonCode',
            'serverReceivedAtIso',
          ],
          timing.map((event) => [
            event.researchId, event.sequence, event.phase, event.sectionId, event.segmentId,
            event.eventType, event.clientMonotonicMs, event.clientWallClockIso, event.elapsedMs,
            event.reasonCode, event.serverReceivedAtIso,
          ]),
        ),
      },
      {
        fileName: 'responses.csv',
        content: csvFile(
          [
            'researchId', 'instrumentId', 'instrumentVersion', 'sectionId', 'itemId', 'value',
            'createdAtIso',
          ],
          responses.map((response) => [
            response.researchId, response.instrumentId, response.instrumentVersion,
            response.sectionId, response.itemId, compactJson(response.value), response.createdAtIso,
          ]),
        ),
      },
      {
        fileName: 'response-presentations.csv',
        content: csvFile(
          [
            'researchId', 'instrumentId', 'instrumentVersion', 'sectionId', 'itemId', 'formId',
            'displayedOptionIds', 'createdAtIso',
          ],
          presentations.map((presentation) => [
            presentation.researchId, presentation.instrumentId, presentation.instrumentVersion,
            presentation.sectionId, presentation.itemId, presentation.formId,
            compactJson(presentation.displayedOptionIds), presentation.createdAtIso,
          ]),
        ),
      },
      { fileName: 'data-dictionary.csv', content: dictionaryCsv },
      { fileName: 'sessions.json', content: stableJson(sessions) },
      { fileName: 'timing.json', content: stableJson(timing) },
      { fileName: 'responses.json', content: stableJson(responses) },
      { fileName: 'response-presentations.json', content: stableJson(presentations) },
      { fileName: 'data-dictionary.json', content: stableJson(dictionary) },
    ];

    const analysisSessions = sessions.map(toAnalysisSession);
    const analysisTiming = timing.map(toAnalysisTiming);
    const analysisResponses = responses
      .filter((response) => !isTextResponse(response) || response.value === null)
      .map(toAnalysisResponse);
    const analysisPresentations = presentations.map(toAnalysisPresentation);
    const analysisFiles: readonly ExportFile[] = [
      {
        fileName: 'sessions.csv',
        content: csvFile(
          [
            'researchId', 'condition', 'assignmentMode', 'studyVersion', 'contentVersion',
            'questionnaireVersion', 'guardrailVersion', 'guardrailFormId', 'consentVersion',
            'referenceArtifactVersion', 'consentAccepted', 'followUpConsent', 'followUpVersion',
            'completionStatus', 'technicalErrorCode',
          ],
          analysisSessions.map((session) => [
            session.researchId, session.condition, session.assignmentMode, session.studyVersion,
            session.contentVersion, session.questionnaireVersion, session.guardrailVersion,
            session.guardrailFormId, session.consentVersion, session.referenceArtifactVersion,
            session.consentAccepted, session.followUpConsent, session.followUpVersion,
            session.completionStatus, session.technicalErrorCode,
          ]),
        ),
      },
      {
        fileName: 'timing.csv',
        content: csvFile(
          [
            'researchId',
            'sequence',
            'phase',
            'sectionId',
            'segmentId',
            'eventType',
            'elapsedMs',
            'reasonCode',
          ],
          analysisTiming.map((event) => [
            event.researchId, event.sequence, event.phase, event.sectionId, event.segmentId,
            event.eventType, event.elapsedMs, event.reasonCode,
          ]),
        ),
      },
      {
        fileName: 'responses.csv',
        content: csvFile(
          ['researchId', 'instrumentId', 'instrumentVersion', 'sectionId', 'itemId', 'value'],
          analysisResponses.map((response) => [
            response.researchId, response.instrumentId, response.instrumentVersion,
            response.sectionId, response.itemId, compactJson(response.value),
          ]),
        ),
      },
      {
        fileName: 'response-presentations.csv',
        content: csvFile(
          [
            'researchId', 'instrumentId', 'instrumentVersion', 'sectionId', 'itemId', 'formId',
            'displayedOptionIds',
          ],
          analysisPresentations.map((presentation) => [
            presentation.researchId, presentation.instrumentId, presentation.instrumentVersion,
            presentation.sectionId, presentation.itemId, presentation.formId,
            compactJson(presentation.displayedOptionIds),
          ]),
        ),
      },
      { fileName: 'data-dictionary.csv', content: dictionaryCsv },
      {
        fileName: 'free-text-review.csv',
        content: csvFile(
          [
            'researchId', 'instrumentId', 'instrumentVersion', 'sectionId', 'itemId', 'value',
            'reviewStatus',
          ],
          freeTextReview.map((review) => [
            review.researchId, review.instrumentId, review.instrumentVersion, review.sectionId,
            review.itemId, review.value, review.reviewStatus,
          ]),
        ),
      },
      { fileName: 'sessions.json', content: stableJson(analysisSessions) },
      { fileName: 'timing.json', content: stableJson(analysisTiming) },
      { fileName: 'responses.json', content: stableJson(analysisResponses) },
      { fileName: 'response-presentations.json', content: stableJson(analysisPresentations) },
      { fileName: 'data-dictionary.json', content: stableJson(dictionary) },
      { fileName: 'free-text-review.json', content: stableJson(freeTextReview) },
    ];
    const files = profile === 'audit' ? auditFiles : analysisFiles;

    assertEmptyExportTarget(
      outputDirectory,
      files.map((file) => file.fileName),
    );
    for (const file of files) {
      writeFileSync(join(outputDirectory, file.fileName), file.content, { mode: 0o600 });
    }

    const manifest = researchExportManifestSchema.parse({
      schemaVersion: 'research-export-v6',
      profile,
      schemaProfileVersion:
        profile === 'audit' ? 'research-audit-v1' : 'research-analysis-v1',
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
      freeTextReview: {
        recordCount: freeTextReview.length,
        status: profile === 'audit' ? 'included-in-audit' : 'pending-review',
      },
      files: files.map((file) => ({ fileName: file.fileName, sha256: sha256(file.content) })),
    });
    writeFileSync(join(outputDirectory, 'manifest.json'), stableJson(manifest), { mode: 0o600 });

    return { files: [...files.map((file) => file.fileName), 'manifest.json'], manifest };
  } finally {
    database.close();
  }
}

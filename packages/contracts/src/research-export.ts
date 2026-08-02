import { z } from 'zod';
import {
  instrumentResponseValueSchema,
  instrumentSectionIdSchema,
  mainInstrumentIdSchema,
} from './instrument-runtime.js';
import { completionStatusSchema, researchCodeSchema, studyConditionSchema } from './study.js';
import { timingEventSchema } from './timing.js';

const versionIdSchema = z.string().trim().min(1).max(80);

export const researchIdSchema = researchCodeSchema;

export const researchExportSessionRecordSchema = z
  .object({
    researchId: researchIdSchema,
    condition: studyConditionSchema,
    assignmentMode: z.enum(['permuted-block', 'forced-supportive', 'forced-reference']),
    studyVersion: versionIdSchema,
    contentVersion: versionIdSchema,
    questionnaireVersion: versionIdSchema,
    guardrailVersion: versionIdSchema,
    guardrailFormId: z.enum(['F1', 'F2', 'F3']),
    consentVersion: versionIdSchema,
    referenceArtifactVersion: versionIdSchema.nullable(),
    consentAccepted: z.literal(true),
    followUpConsent: z.boolean(),
    followUpVersion: versionIdSchema,
    completionStatus: completionStatusSchema,
    technicalErrorCode: z.string().trim().min(1).max(80).nullable(),
    createdAtIso: z.iso.datetime(),
    completedAtIso: z.iso.datetime().nullable(),
  })
  .strict();
export type ResearchExportSessionRecord = z.infer<typeof researchExportSessionRecordSchema>;

export const researchExportTimingRecordSchema = timingEventSchema
  .extend({ researchId: researchIdSchema, serverReceivedAtIso: z.iso.datetime() })
  .strict();
export type ResearchExportTimingRecord = z.infer<typeof researchExportTimingRecordSchema>;

export const researchExportResponseRecordSchema = z
  .object({
    researchId: researchIdSchema,
    instrumentId: mainInstrumentIdSchema,
    instrumentVersion: versionIdSchema,
    sectionId: instrumentSectionIdSchema,
    itemId: z.string().trim().min(1).max(80),
    value: instrumentResponseValueSchema,
    createdAtIso: z.iso.datetime(),
  })
  .strict();
export type ResearchExportResponseRecord = z.infer<typeof researchExportResponseRecordSchema>;

export const researchExportPresentationRecordSchema = z
  .object({
    researchId: researchIdSchema,
    instrumentId: z.literal('guardrail-v2'),
    instrumentVersion: versionIdSchema,
    sectionId: instrumentSectionIdSchema,
    itemId: z.string().trim().min(1).max(80),
    formId: z.enum(['F1', 'F2', 'F3']),
    displayedOptionIds: z.array(z.string().trim().min(1).max(80)).length(4),
    createdAtIso: z.iso.datetime(),
  })
  .strict();
export type ResearchExportPresentationRecord = z.infer<
  typeof researchExportPresentationRecordSchema
>;

export const researchExportDataDictionaryRecordSchema = z
  .object({
    instrumentId: z.string().trim().min(1).max(80),
    sectionId: z.string().trim().min(1).max(80),
    itemId: z.string().trim().min(1).max(80),
    responseType: z.enum([
      'singleChoice',
      'multiChoice',
      'scale',
      'semanticDifferential',
      'integer',
      'text',
    ]),
    required: z.boolean(),
    minimum: z.number().int().nullable(),
    maximum: z.number().int().nullable(),
    maxLength: z.number().int().positive().nullable(),
    optionId: z.string().trim().min(1).max(80).nullable(),
  })
  .strict();
export type ResearchExportDataDictionaryRecord = z.infer<
  typeof researchExportDataDictionaryRecordSchema
>;

export const researchExportFileManifestSchema = z
  .object({
    fileName: z.string().regex(/^[a-z-]+\.(?:csv|json)$/u),
    sha256: z.string().regex(/^[a-f0-9]{64}$/u),
  })
  .strict();
export type ResearchExportFileManifest = z.infer<typeof researchExportFileManifestSchema>;

export const researchExportSessionCountSchema = z
  .object({
    condition: studyConditionSchema,
    completionStatus: completionStatusSchema,
    count: z.number().int().nonnegative(),
  })
  .strict();
export type ResearchExportSessionCount = z.infer<typeof researchExportSessionCountSchema>;

export const researchExportManifestSchema = z
  .object({
    schemaVersion: z.literal('research-export-v4'),
    exportedAtIso: z.iso.datetime(),
    runtimeManifestVersion: versionIdSchema,
    versions: z
      .object({
        study: z.array(versionIdSchema),
        content: z.array(versionIdSchema),
        questionnaire: z.array(versionIdSchema),
        guardrail: z.array(versionIdSchema),
        consent: z.array(versionIdSchema),
        followUp: z.array(versionIdSchema),
        referenceArtifact: z.array(versionIdSchema),
      })
      .strict(),
    sessionCounts: z.array(researchExportSessionCountSchema),
    files: z.array(researchExportFileManifestSchema),
  })
  .strict();
export type ResearchExportManifest = z.infer<typeof researchExportManifestSchema>;

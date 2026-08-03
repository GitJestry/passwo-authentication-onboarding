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
export const researchExportProfileSchema = z.enum(['audit', 'analysis']);
export type ResearchExportProfile = z.infer<typeof researchExportProfileSchema>;
export const researchExportSchemaProfileVersionSchema = z.enum([
  'research-audit-v1',
  'research-analysis-v1',
]);

export const researchExportSessionRecordSchema = z
  .object({
    researchId: researchIdSchema,
    condition: studyConditionSchema,
    assignmentMode: z.enum(['permuted-block', 'forced-supportive', 'forced-reference']),
    studyVersion: versionIdSchema,
    contentVersion: versionIdSchema,
    questionnaireVersion: versionIdSchema,
    guardrailVersion: versionIdSchema,
    guardrailFormId: z.enum(['F1', 'F2', 'F3', 'F4', 'F5', 'F6']),
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

export const researchAnalysisSessionRecordSchema = researchExportSessionRecordSchema.omit({
  createdAtIso: true,
  completedAtIso: true,
});
export type ResearchAnalysisSessionRecord = z.infer<
  typeof researchAnalysisSessionRecordSchema
>;

export const researchExportTimingRecordSchema = timingEventSchema
  .extend({ researchId: researchIdSchema, serverReceivedAtIso: z.iso.datetime() })
  .strict();
export type ResearchExportTimingRecord = z.infer<typeof researchExportTimingRecordSchema>;

export const researchAnalysisTimingRecordSchema = researchExportTimingRecordSchema.omit({
  clientMonotonicMs: true,
  clientWallClockIso: true,
  serverReceivedAtIso: true,
});
export type ResearchAnalysisTimingRecord = z.infer<typeof researchAnalysisTimingRecordSchema>;

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

export const researchAnalysisResponseRecordSchema = researchExportResponseRecordSchema.omit({
  createdAtIso: true,
});
export type ResearchAnalysisResponseRecord = z.infer<typeof researchAnalysisResponseRecordSchema>;

export const researchExportPresentationRecordSchema = z
  .object({
    researchId: researchIdSchema,
    instrumentId: z.literal('guardrail-v2'),
    instrumentVersion: versionIdSchema,
    sectionId: instrumentSectionIdSchema,
    itemId: z.string().trim().min(1).max(80),
    formId: z.enum(['F1', 'F2', 'F3', 'F4', 'F5', 'F6']),
    displayedOptionIds: z.array(z.string().trim().min(1).max(80)).length(4),
    createdAtIso: z.iso.datetime(),
  })
  .strict();
export type ResearchExportPresentationRecord = z.infer<
  typeof researchExportPresentationRecordSchema
>;

export const researchAnalysisPresentationRecordSchema =
  researchExportPresentationRecordSchema.omit({ createdAtIso: true });
export type ResearchAnalysisPresentationRecord = z.infer<
  typeof researchAnalysisPresentationRecordSchema
>;

export const researchFreeTextReviewRecordSchema = z
  .object({
    researchId: researchIdSchema,
    instrumentId: mainInstrumentIdSchema,
    instrumentVersion: versionIdSchema,
    sectionId: instrumentSectionIdSchema,
    itemId: z.string().trim().min(1).max(80),
    value: z.string().max(500),
    reviewStatus: z.literal('pending-review'),
  })
  .strict();
export type ResearchFreeTextReviewRecord = z.infer<
  typeof researchFreeTextReviewRecordSchema
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
    interpretationNote: z.string().trim().min(1).max(500).nullable(),
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
    schemaVersion: z.literal('research-export-v6'),
    profile: researchExportProfileSchema,
    schemaProfileVersion: researchExportSchemaProfileVersionSchema,
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
    freeTextReview: z
      .object({
        recordCount: z.number().int().nonnegative(),
        status: z.enum(['included-in-audit', 'pending-review']),
      })
      .strict(),
    files: z.array(researchExportFileManifestSchema),
  })
  .strict()
  .superRefine((manifest, context) => {
    const expectedVersion =
      manifest.profile === 'audit' ? 'research-audit-v1' : 'research-analysis-v1';
    if (manifest.schemaProfileVersion !== expectedVersion) {
      context.addIssue({
        code: 'custom',
        path: ['schemaProfileVersion'],
        message: `Expected ${expectedVersion} for ${manifest.profile} profile`,
      });
    }
  });
export type ResearchExportManifest = z.infer<typeof researchExportManifestSchema>;

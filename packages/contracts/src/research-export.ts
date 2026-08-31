import { z } from 'zod';
import {
  instrumentResponseValueSchema,
  instrumentSectionIdSchema,
  mainInstrumentIdSchema,
} from './instrument-runtime.js';
import { FOLLOW_UP_INSTRUMENT_ID } from './recontact.js';
import {
  completionStatusSchema,
  recruitmentSourceSchema,
  researchCodeSchema,
  studyConditionSchema,
} from './study.js';
import { timingEventSchema } from './timing.js';

const versionIdSchema = z.string().trim().min(1).max(80);
export const researchResponseInstrumentIdSchema = z.union([
  mainInstrumentIdSchema,
  z.literal(FOLLOW_UP_INSTRUMENT_ID),
]);

export const researchIdSchema = researchCodeSchema;
export const researchExportProfileSchema = z.enum(['audit', 'analysis']);
export type ResearchExportProfile = z.infer<typeof researchExportProfileSchema>;
export const researchExportSchemaProfileVersionSchema = z.enum([
  'research-audit-v4',
  'research-analysis-v4',
]);

export const researchExportSessionRecordSchema = z
  .object({
    researchId: researchIdSchema,
    recruitmentSource: recruitmentSourceSchema,
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
    artifactSessionElapsedMs: z.number().finite().nonnegative().nullable(),
    webInterruptionCount: z.number().int().nonnegative(),
    createdAtIso: z.iso.datetime(),
    completedAtIso: z.iso.datetime().nullable(),
  })
  .strict();
export type ResearchExportSessionRecord = z.infer<typeof researchExportSessionRecordSchema>;

export const researchAnalysisSessionRecordSchema = researchExportSessionRecordSchema.omit({
  createdAtIso: true,
  completedAtIso: true,
});
export type ResearchAnalysisSessionRecord = z.infer<typeof researchAnalysisSessionRecordSchema>;

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
    instrumentId: researchResponseInstrumentIdSchema,
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

export const researchAnalysisPresentationRecordSchema = researchExportPresentationRecordSchema.omit(
  { createdAtIso: true },
);
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
export type ResearchFreeTextReviewRecord = z.infer<typeof researchFreeTextReviewRecordSchema>;

export const researchExportDataDictionaryRecordSchema = z
  .object({
    instrumentId: z.string().trim().min(1).max(80),
    sectionId: z.string().trim().min(1).max(80),
    variableGroupId: z.string().trim().min(1).max(80),
    variableGroupLabel: z.string().trim().min(1).max(200),
    itemId: z.string().trim().min(1).max(80),
    itemPrompt: z.string().trim().min(1).max(2_000),
    responseType: z.enum([
      'singleChoice',
      'multiChoice',
      'scale',
      'semanticDifferential',
      'integer',
      'text',
    ]),
    measurementLevel: z.enum(['nominal', 'ordinal', 'free-text']),
    analysisRole: z.string().trim().min(1).max(80),
    required: z.boolean(),
    minimum: z.number().int().nullable(),
    maximum: z.number().int().nullable(),
    maxLength: z.number().int().positive().nullable(),
    scaleId: z.string().trim().min(1).max(80).nullable(),
    scaleAnchors: z
      .array(
        z
          .object({
            value: z.number().int(),
            label: z.string().trim().min(1).max(500),
          })
          .strict(),
      )
      .max(20),
    derivedTransform: z.string().trim().min(1).max(200).nullable(),
    optionId: z.string().trim().min(1).max(80).nullable(),
    optionLabel: z.string().trim().min(1).max(2_000).nullable(),
    optionClassification: z.enum(['appropriate', 'incomplete-or-unsafe', 'uncertain']).nullable(),
    displayWhenItemId: z.string().trim().min(1).max(80).nullable(),
    displayWhenValue: z.string().trim().min(1).max(80).nullable(),
    missingValueRule: z.string().trim().min(1).max(1_000),
    source: z.string().trim().min(1).max(500).nullable(),
    itemInterpretation: z.string().trim().min(1).max(1_000),
    groupInterpretation: z.string().trim().min(1).max(1_000),
    aggregationRule: z.string().trim().min(1).max(1_000),
  })
  .strict();
export type ResearchExportDataDictionaryRecord = z.infer<
  typeof researchExportDataDictionaryRecordSchema
>;

export const researchExportGuideRecordSchema = z
  .object({
    entryType: z.enum(['overview', 'dataset', 'analysis-boundary']),
    entryId: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(200),
    relatedFile: z.string().trim().min(1).max(200).nullable(),
    recordDefinition: z.string().trim().min(1).max(1_000),
    joinRule: z.string().trim().min(1).max(1_000),
    analysisNote: z.string().trim().min(1).max(2_000),
  })
  .strict();
export type ResearchExportGuideRecord = z.infer<typeof researchExportGuideRecordSchema>;

export const researchExportFileManifestSchema = z
  .object({
    fileName: z.string().regex(/^[a-z-]+\.(?:csv|json|xlsx)$/u),
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
    schemaVersion: z.literal('research-export-v9'),
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
      manifest.profile === 'audit' ? 'research-audit-v4' : 'research-analysis-v4';
    if (manifest.schemaProfileVersion !== expectedVersion) {
      context.addIssue({
        code: 'custom',
        path: ['schemaProfileVersion'],
        message: `Expected ${expectedVersion} for ${manifest.profile} profile`,
      });
    }
  });
export type ResearchExportManifest = z.infer<typeof researchExportManifestSchema>;

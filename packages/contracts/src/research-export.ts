import { z } from 'zod';
import {
  completionStatusSchema,
  persistedSessionRecordSchema,
  studyConditionSchema,
} from './study.js';
import { timingEventSchema } from './timing.js';

const versionIdSchema = z.string().trim().min(1).max(80);

export const researchExportSessionRecordSchema = persistedSessionRecordSchema;
export type ResearchExportSessionRecord = z.infer<typeof researchExportSessionRecordSchema>;

export const researchExportTimingRecordSchema = timingEventSchema
  .extend({ sessionId: z.uuid(), serverReceivedAtIso: z.iso.datetime() })
  .strict();
export type ResearchExportTimingRecord = z.infer<typeof researchExportTimingRecordSchema>;

export const researchExportResponseRecordSchema = z
  .object({
    sessionId: z.uuid(),
    instrumentId: z.enum(['pre-placeholder', 'post-placeholder', 'guardrail-placeholder']),
    instrumentVersion: versionIdSchema,
    itemId: z.literal('placeholder-complete'),
    value: z.literal(true),
    createdAtIso: z.iso.datetime(),
  })
  .strict();
export type ResearchExportResponseRecord = z.infer<typeof researchExportResponseRecordSchema>;

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
    schemaVersion: z.literal('research-export-v1'),
    exportedAtIso: z.iso.datetime(),
    versions: z
      .object({
        study: z.array(versionIdSchema),
        content: z.array(versionIdSchema),
        questionnaire: z.array(versionIdSchema),
        consent: z.array(versionIdSchema),
        referenceArtifact: z.array(versionIdSchema),
      })
      .strict(),
    sessionCounts: z.array(researchExportSessionCountSchema),
    files: z.array(researchExportFileManifestSchema),
  })
  .strict();
export type ResearchExportManifest = z.infer<typeof researchExportManifestSchema>;

import { z } from 'zod';

export const studyConditionSchema = z.enum(['supportive', 'reference']);
export type StudyCondition = z.infer<typeof studyConditionSchema>;

export const assignmentModeSchema = z.enum([
  'permuted-block',
  'forced-supportive',
  'forced-reference',
]);
export type AssignmentMode = z.infer<typeof assignmentModeSchema>;

export const completionStatusSchema = z.enum([
  'in-progress',
  'completed',
  'technical-abort',
  'participant-withdrawal',
  'incomplete-reload',
]);
export type CompletionStatus = z.infer<typeof completionStatusSchema>;

const versionIdSchema = z.string().trim().min(1).max(80);

export const createSessionRequestSchema = z
  .object({
    consentVersion: versionIdSchema,
    studyVersion: versionIdSchema,
  })
  .strict();
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;

export const createSessionResponseSchema = z
  .object({
    sessionId: z.uuid(),
    participantCode: z.string().regex(/^PW-[A-Z0-9]{8}$/u),
    condition: studyConditionSchema,
    assignmentMode: assignmentModeSchema,
  })
  .strict();
export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;

export const persistedSessionRecordSchema = z
  .object({
    sessionId: z.uuid(),
    participantCode: z.string().regex(/^PW-[A-Z0-9]{8}$/u),
    condition: studyConditionSchema,
    assignmentMode: assignmentModeSchema,
    studyVersion: versionIdSchema,
    contentVersion: versionIdSchema,
    questionnaireVersion: versionIdSchema,
    guardrailVersion: versionIdSchema,
    consentVersion: versionIdSchema,
    referenceArtifactVersion: versionIdSchema.nullable(),
    completionStatus: completionStatusSchema,
    createdAtIso: z.iso.datetime(),
    completedAtIso: z.iso.datetime().nullable(),
  })
  .strict();
export type PersistedSessionRecord = z.infer<typeof persistedSessionRecordSchema>;

import { z } from 'zod';
import { guardrailFormIdSchema } from './instrument-runtime.js';
import { followUpTokenHashSchema } from './recontact.js';

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
    requestId: z.uuid(),
    consentAccepted: z.literal(true),
    followUpConsent: z.boolean(),
  })
  .strict();
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;

export const createSessionResponseSchema = z
  .object({
    sessionId: z.uuid(),
    participantCode: z.string().regex(/^PW-[A-Z0-9]{8}$/u),
    condition: studyConditionSchema,
    assignmentMode: assignmentModeSchema,
    guardrailFormId: guardrailFormIdSchema,
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
    guardrailFormId: guardrailFormIdSchema,
    consentVersion: versionIdSchema,
    referenceArtifactVersion: versionIdSchema.nullable(),
    consentAccepted: z.literal(true),
    followUpConsent: z.boolean(),
    followUpVersion: versionIdSchema,
    followUpTokenHash: followUpTokenHashSchema.nullable(),
    completionStatus: completionStatusSchema,
    technicalErrorCode: z.string().trim().min(1).max(80).nullable(),
    createdAtIso: z.iso.datetime(),
    completedAtIso: z.iso.datetime().nullable(),
  })
  .strict();
export type PersistedSessionRecord = z.infer<typeof persistedSessionRecordSchema>;

export const saveResponseResponseSchema = z.object({ saved: z.literal(true) }).strict();
export type SaveResponseResponse = z.infer<typeof saveResponseResponseSchema>;

export const completeSessionRequestSchema = z
  .object({ debriefAcknowledged: z.literal(true) })
  .strict();
export type CompleteSessionRequest = z.infer<typeof completeSessionRequestSchema>;

export const sessionStatusResponseSchema = z
  .object({ completionStatus: completionStatusSchema })
  .strict();
export type SessionStatusResponse = z.infer<typeof sessionStatusResponseSchema>;

export const artifactLeaseResponseSchema = z.object({ active: z.literal(true) }).strict();
export type ArtifactLeaseResponse = z.infer<typeof artifactLeaseResponseSchema>;

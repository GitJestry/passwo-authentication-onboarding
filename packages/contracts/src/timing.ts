import { z } from 'zod';
import { segmentIdSchema, trainingSectionIdSchema } from './training.js';

export const studyPhaseSchema = z.enum([
  'consent', 'pre-questionnaire', 'artifact', 'post-questionnaire', 'guardrails', 'debrief',
]);
export type StudyPhase = z.infer<typeof studyPhaseSchema>;

export const timingEventTypeSchema = z.enum([
  'start', 'pause', 'resume', 'end', 'visibility-hidden', 'visibility-visible', 'technical-abort',
]);
export type TimingEventType = z.infer<typeof timingEventTypeSchema>;

export const timingEventSchema = z.object({
  sequence: z.number().int().nonnegative(),
  phase: studyPhaseSchema,
  sectionId: trainingSectionIdSchema.nullable(),
  segmentId: segmentIdSchema.nullable(),
  eventType: timingEventTypeSchema,
  clientMonotonicMs: z.number().finite().nonnegative(),
  clientWallClockIso: z.iso.datetime(),
  elapsedMs: z.number().finite().nonnegative().nullable(),
  reasonCode: z.string().trim().min(1).max(80).nullable(),
}).strict();
export type TimingEvent = z.infer<typeof timingEventSchema>;

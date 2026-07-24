import { z } from 'zod';
import { segmentIdSchema, trainingSectionIdSchema } from './training.js';

export const studyPhaseSchema = z.enum([
  'consent',
  'pre-questionnaire',
  'artifact',
  'post-questionnaire',
  'guardrails',
  'debrief',
]);
export type StudyPhase = z.infer<typeof studyPhaseSchema>;

export const timingEventTypeSchema = z.enum([
  'start',
  'pause',
  'resume',
  'end',
  'visibility-hidden',
  'visibility-visible',
  'technical-abort',
]);
export type TimingEventType = z.infer<typeof timingEventTypeSchema>;

export const timingEventSchema = z
  .object({
    sequence: z.number().int().nonnegative(),
    phase: studyPhaseSchema,
    sectionId: trainingSectionIdSchema.nullable(),
    segmentId: segmentIdSchema.nullable(),
    eventType: timingEventTypeSchema,
    clientMonotonicMs: z.number().finite().nonnegative(),
    clientWallClockIso: z.iso.datetime(),
    elapsedMs: z.number().finite().nonnegative().nullable(),
    reasonCode: z.string().trim().min(1).max(80).nullable(),
  })
  .strict();
export type TimingEvent = z.infer<typeof timingEventSchema>;

const artifactTimingBaseShape = {
  sequence: z.number().int().nonnegative(),
  phase: z.literal('artifact'),
  sectionId: z.null(),
  segmentId: z.null(),
  clientMonotonicMs: z.number().finite().nonnegative(),
  clientWallClockIso: z.iso.datetime(),
  reasonCode: z.null(),
};

export const artifactTimingEventSchema = z.discriminatedUnion('eventType', [
  z
    .object({
      ...artifactTimingBaseShape,
      eventType: z.literal('start'),
      elapsedMs: z.null(),
    })
    .strict(),
  z
    .object({
      ...artifactTimingBaseShape,
      eventType: z.literal('end'),
      elapsedMs: z.number().finite().nonnegative(),
    })
    .strict(),
]);
export type ArtifactTimingEvent = z.infer<typeof artifactTimingEventSchema>;

export const timingWriteResponseSchema = z
  .object({
    recorded: z.boolean(),
    artifactWallClockMs: z.number().finite().nullable(),
  })
  .strict();
export type TimingWriteResponse = z.infer<typeof timingWriteResponseSchema>;

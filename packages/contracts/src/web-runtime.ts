import { z } from 'zod';
import { guardrailFormIdSchema, mainInstrumentBlocks } from './instrument-runtime.js';
import { registerRecontactRequestSchema } from './recontact.js';
import {
  assignmentModeSchema,
  createSessionRequestSchema,
  createSessionResponseSchema,
  deletionCodeSchema,
  studyConditionSchema,
} from './study.js';
import {
  predefinedPassphraseIdSchema,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
} from './training.js';

export const FOLLOW_UP_PATH = '/follow-up';
export const WEB_RESUME_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
export const WEB_ARTIFACT_HEARTBEAT_INTERVAL_MS = 15_000;
export const WEB_ARTIFACT_MAX_INTERVAL_MS = 6 * 60 * 60 * 1000;
export const WEB_STUDY_REQUEST_HEADER = 'x-passwo-study-request' as const;
export const WEB_STUDY_REQUEST_HEADER_VALUE = '1' as const;

export const webResumeRawTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/u);
export type WebResumeRawToken = z.infer<typeof webResumeRawTokenSchema>;
export const webResumeTokenHashSchema = z.string().regex(/^[a-f0-9]{64}$/u);
export type WebResumeTokenHash = z.infer<typeof webResumeTokenHashSchema>;

export const REFERENCE_LESSON_CHECKPOINTS = [
  'reference:passwords',
  'reference:password-manager',
  'reference:mfa',
] as const;
export const referenceLessonCheckpointSchema = z.enum(REFERENCE_LESSON_CHECKPOINTS);
export type ReferenceLessonCheckpoint = z.infer<typeof referenceLessonCheckpointSchema>;

export const SUPPORTIVE_CHECKPOINTS = [
  'supportive:entry',
  'supportive:S00',
  'supportive:S01',
  'supportive:S02',
  'supportive:S03',
  'supportive:S04',
  'supportive:S05',
  'supportive:S06',
  'supportive:S07',
  'supportive:S08',
  'supportive:S09',
  'supportive:S10',
  'supportive:S11',
  'supportive:S12',
  'supportive:S13',
  'supportive:S14',
  'supportive:S15',
  'supportive:S16',
  'supportive:S17',
  'supportive:complete',
] as const;
export const supportiveCheckpointSchema = z.enum(SUPPORTIVE_CHECKPOINTS);
export type SupportiveCheckpoint = z.infer<typeof supportiveCheckpointSchema>;
export const supportivePostS08CheckpointSchema = z.enum([
  'supportive:S09',
  'supportive:S10',
  'supportive:S11',
  'supportive:S12',
  'supportive:S13',
  'supportive:S14',
  'supportive:S15',
  'supportive:S16',
  'supportive:S17',
]);
export const supportiveS08BackedCheckpointSchema = z.enum([
  'supportive:S08',
  'supportive:S09',
  'supportive:S10',
  'supportive:S11',
  'supportive:S12',
  'supportive:S13',
  'supportive:S14',
  'supportive:S15',
  'supportive:S16',
  'supportive:S17',
  'supportive:complete',
]);
export const artifactCheckpointSchema = z.union([
  supportiveCheckpointSchema,
  referenceLessonCheckpointSchema,
]);
export type ArtifactCheckpoint = z.infer<typeof artifactCheckpointSchema>;

export const STUDY_PROGRESS_CHECKPOINTS = [
  'pre-questionnaire',
  'artifact-preparation',
  ...SUPPORTIVE_CHECKPOINTS,
  ...REFERENCE_LESSON_CHECKPOINTS,
  'post-questionnaire',
  'guardrails',
  'session-closure',
  'complete',
] as const;
export const studyProgressCheckpointSchema = z.enum(STUDY_PROGRESS_CHECKPOINTS);
export type StudyProgressCheckpoint = z.infer<typeof studyProgressCheckpointSchema>;
export const studyResumeTargetSchema = z.enum([
  'pre-questionnaire',
  'artifact-preparation',
  'artifact',
  'post-questionnaire',
  'guardrails',
  'session-closure',
]);
export type StudyResumeTarget = z.infer<typeof studyResumeTargetSchema>;

const supportiveS08AccountIdSchema = z.enum(['master-campus', 'campus-email']);
const supportiveS08RelationshipIdSchema = z.enum([
  'campusgram--master-campus',
  'campusgram--campus-email',
  'master-campus--campus-email',
]);
const supportiveS08RelationshipSchema = z
  .object({
    id: supportiveS08RelationshipIdSchema,
    kind: z.enum(['identical', 'similar']),
  })
  .strict();

export const supportiveS08ResumeStateSchema = z
  .object({
    schemaVersion: z.literal('supportive-s08-resume-v1'),
    passphraseIds: z
      .object({
        campusgram: predefinedPassphraseIdSchema,
        masterCampus: predefinedPassphraseIdSchema,
        campusEmail: predefinedPassphraseIdSchema,
      })
      .strict(),
    weakAccountIds: z.array(supportiveS08AccountIdSchema).max(2),
    relationships: z.array(supportiveS08RelationshipSchema).max(3),
  })
  .strict()
  .superRefine((state, context) => {
    if (new Set(state.weakAccountIds).size !== state.weakAccountIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['weakAccountIds'],
        message: 'Weak account IDs must be unique',
      });
    }
    if (new Set(state.relationships.map(({ id }) => id)).size !== state.relationships.length) {
      context.addIssue({
        code: 'custom',
        path: ['relationships'],
        message: 'Relationship IDs must be unique',
      });
    }
    const wordSetIds = Object.values(state.passphraseIds).map((id) => id.slice(0, 13));
    if (new Set(wordSetIds).size !== wordSetIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['passphraseIds'],
        message: 'Each account must use a different predefined word set',
      });
    }
  });
export type SupportiveS08ResumeState = z.infer<typeof supportiveS08ResumeStateSchema>;

export const webCreateSessionRequestSchema = createSessionRequestSchema
  .omit({ deletionCodeHash: true })
  .extend({
    recruitmentId: z.string().max(80).nullable().catch(null).default(null),
    recontact: registerRecontactRequestSchema.nullable(),
  })
  .strict()
  .superRefine((request, context) => {
    if (request.followUpConsent !== (request.recontact !== null)) {
      context.addIssue({
        code: 'custom',
        path: ['recontact'],
        message: 'Follow-up consent and recontact registration must agree',
      });
    }
  });
export type WebCreateSessionRequest = z.infer<typeof webCreateSessionRequestSchema>;

export const webCreateSessionResponseSchema = createSessionResponseSchema
  .extend({ deletionCode: deletionCodeSchema })
  .strict();
export type WebCreateSessionResponse = z.infer<typeof webCreateSessionResponseSchema>;

export const webResumeSessionSchema = z
  .object({
    sessionId: z.uuid(),
    condition: studyConditionSchema,
    assignmentMode: assignmentModeSchema,
    guardrailFormId: guardrailFormIdSchema,
    followUpConsent: z.boolean(),
    consentVersion: z.string().trim().min(1).max(80),
    checkpoint: studyProgressCheckpointSchema,
    resumeTarget: studyResumeTargetSchema,
    nextInstrumentBlockIndex: z.number().int().min(0).max(mainInstrumentBlocks.length),
    artifactSessionElapsedMs: z.number().finite().nonnegative().nullable(),
    interrupted: z.boolean(),
    deletionCode: deletionCodeSchema.nullable(),
    supportiveS08ResumeState: supportiveS08ResumeStateSchema.nullable(),
  })
  .strict()
  .superRefine((session, context) => {
    const requiresS08State =
      session.condition === 'supportive' &&
      supportiveS08BackedCheckpointSchema.safeParse(session.checkpoint).success;
    if (requiresS08State !== (session.supportiveS08ResumeState !== null)) {
      context.addIssue({
        code: 'custom',
        path: ['supportiveS08ResumeState'],
        message: requiresS08State
          ? 'S08 and later supportive checkpoints require the minimal resume state'
          : 'The S08 resume state is not allowed before the S08 boundary',
      });
    }
  });
export type WebResumeSession = z.infer<typeof webResumeSessionSchema>;
export const webResumeResponseSchema = z.object({ session: webResumeSessionSchema.nullable() }).strict();

export const artifactIntervalStartRequestSchema = z.object({ requestId: z.uuid() }).strict();
export type ArtifactIntervalStartRequest = z.infer<typeof artifactIntervalStartRequestSchema>;
export const artifactIntervalStartResponseSchema = z
  .object({
    intervalId: z.uuid(),
    checkpoint: artifactCheckpointSchema,
    artifactSessionElapsedMs: z.number().finite().nonnegative(),
    interrupted: z.boolean(),
  })
  .strict();
export type ArtifactIntervalStartResponse = z.infer<typeof artifactIntervalStartResponseSchema>;

export const artifactIntervalHeartbeatRequestSchema = z
  .object({
    intervalId: z.uuid(),
    elapsedMs: z.number().finite().min(0).max(WEB_ARTIFACT_MAX_INTERVAL_MS),
  })
  .strict();
export type ArtifactIntervalHeartbeatRequest = z.infer<typeof artifactIntervalHeartbeatRequestSchema>;
export const artifactIntervalHeartbeatResponseSchema = z.object({ confirmed: z.literal(true) }).strict();
export const artifactIntervalEndRequestSchema = artifactIntervalHeartbeatRequestSchema;
export type ArtifactIntervalEndRequest = z.infer<typeof artifactIntervalEndRequestSchema>;
export const artifactIntervalEndResponseSchema = z
  .object({ artifactSessionElapsedMs: z.number().finite().nonnegative() })
  .strict();

export const webArtifactVisibilityRequestSchema = z
  .object({
    eventId: z.uuid(),
    intervalId: z.uuid(),
    visibility: z.enum(['hidden', 'visible']),
    elapsedMs: z.number().finite().min(0).max(WEB_ARTIFACT_MAX_INTERVAL_MS),
  })
  .strict();
export type WebArtifactVisibilityRequest = z.infer<typeof webArtifactVisibilityRequestSchema>;
export const webArtifactVisibilityResponseSchema = z.object({ recorded: z.boolean() }).strict();

export const webSegmentTimingRequestSchema = z
  .object({
    eventId: z.uuid(),
    intervalId: z.uuid(),
    segmentId: z.enum(SUPPORTIVE_ARTIFACT_SEGMENT_IDS),
    eventType: z.enum(['segment-start', 'segment-end']),
    elapsedMs: z.number().finite().min(0).max(WEB_ARTIFACT_MAX_INTERVAL_MS).nullable(),
  })
  .strict()
  .superRefine((event, context) => {
    if ((event.eventType === 'segment-start') !== (event.elapsedMs === null)) {
      context.addIssue({
        code: 'custom',
        path: ['elapsedMs'],
        message: 'Segment starts have no elapsed value; segment ends require one',
      });
    }
  });
export type WebSegmentTimingRequest = z.infer<typeof webSegmentTimingRequestSchema>;
export const webSegmentTimingResponseSchema = z
  .object({ recorded: z.boolean(), checkpoint: supportiveCheckpointSchema })
  .strict();

export const confirmArtifactCheckpointRequestSchema = z.union([
  z
    .object({
      intervalId: z.uuid(),
      checkpoint: z.union([
        z.literal('supportive:entry'),
        z.literal('supportive:S00'),
        supportivePostS08CheckpointSchema,
        z.literal('supportive:complete'),
        referenceLessonCheckpointSchema,
      ]),
    })
    .strict(),
  z
    .object({
      intervalId: z.uuid(),
      checkpoint: z.literal('supportive:S08'),
      resumeState: supportiveS08ResumeStateSchema,
    })
    .strict(),
]);
export type ConfirmArtifactCheckpointRequest = z.infer<typeof confirmArtifactCheckpointRequestSchema>;
export const confirmArtifactCheckpointResponseSchema = z
  .object({ checkpoint: artifactCheckpointSchema })
  .strict();

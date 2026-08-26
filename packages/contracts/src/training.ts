import { z } from 'zod';

export const SUPPORTIVE_ARTIFACT_VERSION = 'supportive-s00-s17-1.26.0';
export const REFERENCE_ARTIFACT_VERSION =
  'secaware-passwords-authentication-v9-study-adapted-2026-07-30-r16';
export const REFERENCE_ARTIFACT_SNAPSHOT_ID = 'secaware-passwords-authentication-2026-07-26';
export const REFERENCE_ARTIFACT_ROUTE_PREFIX =
  '/reference/secaware/passwords-authentication/' as const;
export const REFERENCE_ARTIFACT_ENTRY_POINT = 'scormdriver/indexAPI.html' as const;
export const REFERENCE_ARTIFACT_URL =
  `${REFERENCE_ARTIFACT_ROUTE_PREFIX}${REFERENCE_ARTIFACT_ENTRY_POINT}?StandAlone=true` as const;
export const REFERENCE_ARTIFACT_COMPLETION_MESSAGE_TYPE = 'passwo:reference-completed' as const;
export const REFERENCE_ARTIFACT_OPEN_SUPPLEMENT_MESSAGE_TYPE =
  'passwo:reference-open-supplement' as const;
export const REFERENCE_ARTIFACT_CHECKPOINT_MESSAGE_TYPE =
  'passwo:reference-checkpoint' as const;
export const REFERENCE_ARTIFACT_RESUME_MESSAGE_TYPE = 'passwo:reference-resume' as const;

export const REFERENCE_ARTIFACT_LESSON_CHECKPOINTS = [
  { id: 'passwords', sourceLessonId: 'cCLcBEovpLj72dCgZ6HsfeQV4xIR2_Lv' },
  { id: 'password-manager', sourceLessonId: '8s5ZF8ravaGthNGdmPcOMPOpdjLwXR-O' },
  { id: 'mfa', sourceLessonId: 'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt' },
] as const;
export const REFERENCE_ARTIFACT_LESSON_CHECKPOINT_IDS = [
  'passwords',
  'password-manager',
  'mfa',
] as const;
export const referenceArtifactLessonCheckpointIdSchema = z.enum(
  REFERENCE_ARTIFACT_LESSON_CHECKPOINT_IDS,
);
export type ReferenceArtifactLessonCheckpointId = z.infer<
  typeof referenceArtifactLessonCheckpointIdSchema
>;

export function referenceArtifactCheckpointForSourceLessonId(
  sourceLessonId: string,
): ReferenceArtifactLessonCheckpointId | null {
  return (
    REFERENCE_ARTIFACT_LESSON_CHECKPOINTS.find(
      (checkpoint) => checkpoint.sourceLessonId === sourceLessonId,
    )?.id ?? null
  );
}

export function referenceArtifactSourceLessonIdForCheckpoint(
  checkpointId: ReferenceArtifactLessonCheckpointId,
): string {
  const checkpoint = REFERENCE_ARTIFACT_LESSON_CHECKPOINTS.find(
    (candidate) => candidate.id === checkpointId,
  );
  if (checkpoint === undefined) throw new Error('reference-artifact-checkpoint-not-found');
  return checkpoint.sourceLessonId;
}

export const segmentIds = [
  'S00',
  'S01',
  'S02',
  'S03',
  'S04',
  'S05',
  'S06',
  'S07',
  'S08',
  'S09',
  'S10',
  'S11',
  'S12',
  'S13',
  'S14',
  'S15',
  'S16',
  'S17',
] as const;

export const segmentIdSchema = z.enum(segmentIds);
export type SegmentId = z.infer<typeof segmentIdSchema>;

export const SUPPORTIVE_ARTIFACT_SEGMENT_IDS = [
  'S00',
  'S01',
  'S02',
  'S03',
  'S04',
  'S05',
  'S06',
  'S07',
] as const;
export const supportiveArtifactSegmentIdSchema = z.enum(SUPPORTIVE_ARTIFACT_SEGMENT_IDS);
export type SupportiveArtifactSegmentId = (typeof SUPPORTIVE_ARTIFACT_SEGMENT_IDS)[number];
export const SUPPORTIVE_ARTIFACT_FINAL_SEGMENT_ID =
  'S07' as const satisfies SupportiveArtifactSegmentId;
export const SUPPORTIVE_POST_S08_SEGMENT_IDS = [
  'S09',
  'S10',
  'S11',
  'S12',
  'S13',
  'S14',
  'S15',
  'S16',
  'S17',
] as const;
export const supportivePostS08SegmentIdSchema = z.enum(
  SUPPORTIVE_POST_S08_SEGMENT_IDS,
);
export type SupportivePostS08SegmentId = z.infer<
  typeof supportivePostS08SegmentIdSchema
>;
export type SupportiveResumeSegmentId =
  | 'S00'
  | 'S01'
  | 'S08'
  | SupportivePostS08SegmentId;

export const trainingSectionIdSchema = z.enum(['passwords', 'password-manager', 'mfa']);
export type TrainingSectionId = z.infer<typeof trainingSectionIdSchema>;

export const PREDEFINED_PASSPHRASE_IDS = [
  'passphrase-01-hyphen',
  'passphrase-01-dot',
  'passphrase-01-underscore',
  'passphrase-01-space',
  'passphrase-02-hyphen',
  'passphrase-02-dot',
  'passphrase-02-underscore',
  'passphrase-02-space',
  'passphrase-03-hyphen',
  'passphrase-03-dot',
  'passphrase-03-underscore',
  'passphrase-03-space',
  'passphrase-04-hyphen',
  'passphrase-04-dot',
  'passphrase-04-underscore',
  'passphrase-04-space',
  'passphrase-05-hyphen',
  'passphrase-05-dot',
  'passphrase-05-underscore',
  'passphrase-05-space',
] as const;
export const predefinedPassphraseIdSchema = z.enum(PREDEFINED_PASSPHRASE_IDS);
export type PredefinedPassphraseId = z.infer<typeof predefinedPassphraseIdSchema>;

export interface SupportiveSectionResumeTarget {
  readonly sectionId: TrainingSectionId;
  readonly segmentId: SupportiveResumeSegmentId;
}

/**
 * Every persisted supportive checkpoint needs an explicit section restart. Extending the runtime
 * segment list therefore fails type checking until the new section boundary is deliberately added.
 */
const supportiveSectionResumeTargets = {
  S00: { sectionId: 'passwords', segmentId: 'S00' },
  S01: { sectionId: 'passwords', segmentId: 'S01' },
  S02: { sectionId: 'passwords', segmentId: 'S01' },
  S03: { sectionId: 'passwords', segmentId: 'S01' },
  S04: { sectionId: 'passwords', segmentId: 'S01' },
  S05: { sectionId: 'passwords', segmentId: 'S01' },
  S06: { sectionId: 'passwords', segmentId: 'S01' },
  S07: { sectionId: 'passwords', segmentId: 'S01' },
  S08: { sectionId: 'passwords', segmentId: 'S08' },
  S09: { sectionId: 'passwords', segmentId: 'S09' },
  S10: { sectionId: 'passwords', segmentId: 'S10' },
  S11: { sectionId: 'passwords', segmentId: 'S11' },
  S12: { sectionId: 'password-manager', segmentId: 'S12' },
  S13: { sectionId: 'password-manager', segmentId: 'S13' },
  S14: { sectionId: 'mfa', segmentId: 'S14' },
  S15: { sectionId: 'mfa', segmentId: 'S15' },
  S16: { sectionId: 'mfa', segmentId: 'S16' },
  S17: { sectionId: 'mfa', segmentId: 'S17' },
} as const satisfies Record<SegmentId, SupportiveSectionResumeTarget>;

export function supportiveSectionResumeTargetFor(
  checkpoint: SegmentId,
): SupportiveSectionResumeTarget {
  return supportiveSectionResumeTargets[checkpoint];
}

/**
 * S00–S07 checkpoints contain no training input. S01 creates the fictional identity and passwords
 * needed by the rest of that transient section, so an interrupted later segment safely rebuilds
 * it from S01. From S08 onward each content-free checkpoint resumes at its own segment entry while
 * the separately typed minimal S08 state reconstructs only predefined simulation values.
 */
export function supportiveResumeSegmentFor(checkpoint: SegmentId): SupportiveResumeSegmentId {
  return supportiveSectionResumeTargets[checkpoint].segmentId;
}

export const translationFocusIdSchema = z.enum(['TF1', 'TF2', 'TF3', 'TF4', 'TF5', 'TF6']);
export type TranslationFocusId = z.infer<typeof translationFocusIdSchema>;

export interface TrainingSegmentDefinition {
  readonly id: SegmentId;
  readonly title: string;
  readonly section: TrainingSectionId;
  readonly sourcePages: string;
  readonly foci: readonly TranslationFocusId[];
  readonly learningObjective: string;
}

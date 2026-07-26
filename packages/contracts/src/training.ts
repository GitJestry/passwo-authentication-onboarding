import { z } from 'zod';

export const SUPPORTIVE_ARTIFACT_VERSION = 'supportive-s00-s02-1.0.0';
export const REFERENCE_PLACEHOLDER_ARTIFACT_VERSION = 'reference-placeholder-v1';

export const SUPPORTIVE_ARTIFACT_SEGMENT_IDS = ['S00', 'S01', 'S02'] as const;
export type SupportiveArtifactSegmentId = (typeof SUPPORTIVE_ARTIFACT_SEGMENT_IDS)[number];

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

export const trainingSectionIdSchema = z.enum(['passwords', 'password-manager', 'mfa']);
export type TrainingSectionId = z.infer<typeof trainingSectionIdSchema>;

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

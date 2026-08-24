import { z } from 'zod';

export const studyDataDeletionTableSchema = z.enum([
  'study_sessions',
  'assignment_slots',
  'guardrail_form_slots',
  'artifact_leases',
  'timing_events',
  'instrument_submissions',
  'responses',
  'response_presentations',
  'web_resume_tokens',
  'web_artifact_intervals',
  'web_segment_timing_events',
  'web_artifact_visibility_events',
  'recontact.registrations',
]);
export type StudyDataDeletionTable = z.infer<typeof studyDataDeletionTableSchema>;

export const studyDataDeletionTableCountSchema = z
  .object({
    table: studyDataDeletionTableSchema,
    count: z.number().int().nonnegative(),
  })
  .strict();
export type StudyDataDeletionTableCount = z.infer<typeof studyDataDeletionTableCountSchema>;

export const studyDataDeletionReportSchema = z
  .object({
    tables: z.array(studyDataDeletionTableCountSchema).length(13),
  })
  .strict();
export type StudyDataDeletionReport = z.infer<typeof studyDataDeletionReportSchema>;

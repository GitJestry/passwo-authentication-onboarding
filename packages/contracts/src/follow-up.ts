import { z } from 'zod';
import rawFollowUpInstrument from './generated/follow-up-v6.runtime.json' with { type: 'json' };
import {
  FOLLOW_UP_INSTRUMENT_ID,
  FOLLOW_UP_SECTION_ID,
  followUpRawTokenSchema,
} from './recontact.js';

export { FOLLOW_UP_INSTRUMENT_ID, FOLLOW_UP_SECTION_ID } from './recontact.js';

const stableIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/u);
const participantTextSchema = z.string().min(1).max(2_000);
const optionSchema = z
  .object({
    id: stableIdSchema,
    label: participantTextSchema,
  })
  .strict();
const displayWhenSchema = z
  .object({
    itemId: stableIdSchema,
    contains: stableIdSchema,
  })
  .strict();
const multiChoiceItemSchema = z
  .object({
    id: stableIdSchema,
    type: z.literal('multiChoice'),
    heading: participantTextSchema,
    prompt: participantTextSchema,
    instruction: participantTextSchema,
    options: z.array(optionSchema).min(1).max(20),
    exclusiveOptions: z.array(stableIdSchema).min(1).max(5),
  })
  .strict();
const singleChoiceItemSchema = z
  .object({
    id: stableIdSchema,
    type: z.literal('singleChoice'),
    participantOptional: z.literal(true),
    displayWhen: displayWhenSchema,
    prompt: participantTextSchema,
    instruction: participantTextSchema,
    options: z.array(optionSchema).min(1).max(20),
  })
  .strict();
const followUpItemSchema = z.discriminatedUnion('type', [
  multiChoiceItemSchema,
  singleChoiceItemSchema,
]);
const emailTemplateSchema = z
  .object({
    subject: participantTextSchema,
    containsAuthenticationAdvice: z.literal(false),
    body: participantTextSchema,
  })
  .strict();

export const followUpInstrumentSchema = z
  .object({
    version: z.literal('follow-up-v6-pilot'),
    language: z.literal('de-DE'),
    status: z.literal('pre-pilot-candidate'),
    runtimeBoundary: z
      .object({
        bundledWithMainStudyClient: z.literal(false),
        hostedByStudyWebDeployment: z.literal(true),
        responseHandledByStudyApi: z.literal(true),
        manualResponseImport: z.literal(false),
        delivery: z.literal('separate tokenized route in the same study web deployment'),
      })
      .strict(),
    schedule: z
      .object({
        firstInvitationDelayHours: z.literal(240),
        reminderDelayAfterFirstInvitationHours: z.literal(48),
        closeAfterSessionHours: z.literal(336),
        estimatedMinutes: z.literal(2),
      })
      .strict(),
    email: emailTemplateSchema,
    reminderEmail: emailTemplateSchema,
    landingPage: z
      .object({
        title: participantTextSchema,
        disclosure: participantTextSchema,
        voluntaryConfirmation: participantTextSchema,
      })
      .strict(),
    interface: z
      .object({
        loading: participantTextSchema,
        startLabel: participantTextSchema,
        submitLabel: participantTextSchema,
        submittingLabel: participantTextSchema,
        validationError: participantTextSchema,
        submitError: participantTextSchema,
        submittedHeading: participantTextSchema,
        submittedBody: participantTextSchema,
        alreadySubmittedHeading: participantTextSchema,
        alreadySubmittedBody: participantTextSchema,
        notYetOpenHeading: participantTextSchema,
        notYetOpenBody: participantTextSchema,
        expiredHeading: participantTextSchema,
        expiredBody: participantTextSchema,
        invalidHeading: participantTextSchema,
        invalidBody: participantTextSchema,
        loadErrorHeading: participantTextSchema,
        loadErrorBody: participantTextSchema,
      })
      .strict(),
    questionnaire: z
      .object({
        title: participantTextSchema,
        reportingInstruction: participantTextSchema,
        safetyNote: participantTextSchema,
        items: z.array(followUpItemSchema).length(4),
      })
      .strict(),
    analysis: z
      .object({
        role: z.literal('ancillary-exploratory'),
        outcomeLabel: participantTextSchema,
        focalOutcomes: z.array(stableIdSchema).length(3),
        secondaryDescriptiveOutcomes: z.array(stableIdSchema).length(5),
        combinedScore: z.literal(false),
        nonResponseMeaning: z.literal('missing'),
        opportunityDependent: z.literal(true),
        noActionReasonsOptional: z.literal(true),
      })
      .strict(),
    privacy: z
      .object({
        emailStoredSeparatelyFromResearchData: z.literal(true),
        emailPurpose: z.string().min(1).max(300),
        deletionRule: z.string().min(1).max(300),
        sendingModel: z.literal('controlled manual send through the university account'),
        delayedDebriefEmail: z.literal(false),
        responseImportRequired: z.literal(false),
      })
      .strict(),
  })
  .strict();

export type FollowUpInstrument = z.infer<typeof followUpInstrumentSchema>;
export type FollowUpItem = FollowUpInstrument['questionnaire']['items'][number];
export const followUpInstrument = followUpInstrumentSchema.parse(rawFollowUpInstrument);

export const followUpAccessRequestSchema = z.object({ token: followUpRawTokenSchema }).strict();
export type FollowUpAccessRequest = z.infer<typeof followUpAccessRequestSchema>;

const invalidAccessSchema = z.object({ status: z.literal('invalid') }).strict();
const submittedAccessSchema = z.object({ status: z.literal('submitted') }).strict();
const expiredAccessSchema = z.object({ status: z.literal('expired') }).strict();
const notYetOpenAccessSchema = z
  .object({
    status: z.literal('not-yet-open'),
    opensAtIso: z.iso.datetime(),
  })
  .strict();
const availableAccessSchema = z
  .object({
    status: z.literal('available'),
    reportingCutoffAtIso: z.iso.datetime(),
    closesAtIso: z.iso.datetime(),
  })
  .strict();
export const followUpAccessResponseSchema = z.discriminatedUnion('status', [
  invalidAccessSchema,
  submittedAccessSchema,
  expiredAccessSchema,
  notYetOpenAccessSchema,
  availableAccessSchema,
]);
export type FollowUpAccessResponse = z.infer<typeof followUpAccessResponseSchema>;

const followUpResponseValueSchema = z.union([
  z.string().max(80),
  z.array(stableIdSchema).max(20),
  z.null(),
]);
const followUpItemResponseSchema = z
  .object({
    itemId: stableIdSchema,
    value: followUpResponseValueSchema,
  })
  .strict();

function addResponseIssue(context: z.RefinementCtx, itemId: string, message: string): void {
  context.addIssue({
    code: 'custom',
    path: ['responses', itemId, 'value'],
    message,
  });
}

function responseFor(
  responses: readonly z.infer<typeof followUpItemResponseSchema>[],
  itemId: string,
): z.infer<typeof followUpItemResponseSchema> | undefined {
  return responses.find((response) => response.itemId === itemId);
}

export const followUpSubmissionRequestSchema = z
  .object({
    token: followUpRawTokenSchema,
    voluntaryConfirmation: z.literal(true),
    responses: z.array(followUpItemResponseSchema).length(4),
  })
  .strict()
  .superRefine((request, context) => {
    const responseIds = request.responses.map(({ itemId }) => itemId);
    const items = followUpInstrument.questionnaire.items;
    if (
      new Set(responseIds).size !== items.length ||
      items.some((item) => !responseIds.includes(item.id))
    ) {
      context.addIssue({
        code: 'custom',
        path: ['responses'],
        message: 'incomplete-follow-up-submission',
      });
      return;
    }

    for (const item of items) {
      const response = responseFor(request.responses, item.id);
      if (response === undefined) continue;
      const optionIds = new Set(item.options.map(({ id }) => id));
      if (item.type === 'multiChoice') {
        const value = response.value;
        if (
          !Array.isArray(value) ||
          value.length === 0 ||
          value.length > optionIds.size ||
          new Set(value).size !== value.length ||
          value.some((optionId) => !optionIds.has(optionId))
        ) {
          addResponseIssue(context, item.id, 'invalid-follow-up-multi-choice');
          continue;
        }
        if (
          value.length > 1 &&
          value.some((optionId) => item.exclusiveOptions.includes(optionId))
        ) {
          addResponseIssue(context, item.id, 'exclusive-option-conflict');
        }
        continue;
      }

      const controllingResponse = responseFor(request.responses, item.displayWhen.itemId);
      const displayed =
        Array.isArray(controllingResponse?.value) &&
        controllingResponse.value.includes(item.displayWhen.contains);
      if (!displayed && response.value !== null) {
        addResponseIssue(context, item.id, 'hidden-follow-up-response');
      } else if (
        displayed &&
        response.value !== null &&
        (typeof response.value !== 'string' || !optionIds.has(response.value))
      ) {
        addResponseIssue(context, item.id, 'invalid-follow-up-single-choice');
      }
    }
  });
export type FollowUpSubmissionRequest = z.infer<typeof followUpSubmissionRequestSchema>;

export const followUpSubmissionResponseSchema = z.object({ submitted: z.literal(true) }).strict();
export type FollowUpSubmissionResponse = z.infer<typeof followUpSubmissionResponseSchema>;

export function normalizeFollowUpSubmission(
  request: FollowUpSubmissionRequest,
): FollowUpSubmissionRequest {
  return {
    token: request.token,
    voluntaryConfirmation: true,
    responses: followUpInstrument.questionnaire.items.map((item) => {
      const response = responseFor(request.responses, item.id);
      if (response === undefined) throw new Error('incomplete-follow-up-submission');
      return response;
    }),
  };
}

export const followUpContactDeletionReportSchema = z
  .object({
    mode: z.enum(['dry-run', 'delete']),
    performedAtIso: z.iso.datetime(),
    eligible: z.boolean(),
    overdue: z.boolean(),
    contactCountBefore: z.number().int().nonnegative(),
    contactCountAfter: z.number().int().nonnegative(),
    unscheduledContactCount: z.number().int().nonnegative(),
    lastWindowClosesAtIso: z.iso.datetime().nullable(),
    deletionDeadlineAtIso: z.iso.datetime().nullable(),
  })
  .strict();
export type FollowUpContactDeletionReport = z.infer<typeof followUpContactDeletionReportSchema>;

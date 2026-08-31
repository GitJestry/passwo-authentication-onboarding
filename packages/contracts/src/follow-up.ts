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
const focalResponseOptionIdSchema = z.enum(['yes', 'no', 'unsure']);
const displayWhenSchema = z
  .object({
    itemId: stableIdSchema,
    equals: z.literal('no'),
  })
  .strict();
const focalActionItemSchema = z
  .object({
    id: stableIdSchema,
    type: z.literal('singleChoice'),
    required: z.literal(true),
    prompt: participantTextSchema,
    instruction: participantTextSchema,
    options: z.array(optionSchema.extend({ id: focalResponseOptionIdSchema })).length(3),
  })
  .strict();
const conditionalReasonItemSchema = z
  .object({
    id: stableIdSchema,
    type: z.literal('conditionalSingleChoice'),
    participantOptional: z.literal(true),
    displayWhen: displayWhenSchema,
    prompt: participantTextSchema,
    instruction: participantTextSchema,
    options: z.array(optionSchema).min(1).max(20),
  })
  .strict();
const followUpItemSchema = z.discriminatedUnion('type', [
  focalActionItemSchema,
  conditionalReasonItemSchema,
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
        accountScopeInstruction: participantTextSchema,
        safetyNote: participantTextSchema,
        items: z.array(followUpItemSchema).length(6),
      })
      .strict(),
    analysis: z
      .object({
        role: z.literal('ancillary-exploratory'),
        outcomeLabel: participantTextSchema,
        focalOutcomes: z.array(stableIdSchema).length(3),
        reasonItems: z.array(stableIdSchema).length(3),
        responseCategories: z.tuple([z.literal('yes'), z.literal('no'), z.literal('unsure')]),
        reasonTrigger: z.literal('no'),
        reasonRole: z.literal('action-specific descriptive context'),
        combinedScore: z.literal(false),
        durableBehaviorChangeClaimed: z.literal(false),
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
  .strict()
  .superRefine((instrument, context) => {
    const focalIds = instrument.questionnaire.items
      .filter((item) => item.type === 'singleChoice')
      .map((item) => item.id);
    const reasonIds = instrument.questionnaire.items
      .filter((item) => item.type === 'conditionalSingleChoice')
      .map((item) => item.id);
    if (JSON.stringify(focalIds) !== JSON.stringify(instrument.analysis.focalOutcomes)) {
      context.addIssue({
        code: 'custom',
        path: ['analysis', 'focalOutcomes'],
        message: 'follow-up-focal-outcomes-must-match-items',
      });
    }
    if (JSON.stringify(reasonIds) !== JSON.stringify(instrument.analysis.reasonItems)) {
      context.addIssue({
        code: 'custom',
        path: ['analysis', 'reasonItems'],
        message: 'follow-up-reason-items-must-match-items',
      });
    }
    for (const item of instrument.questionnaire.items) {
      if (item.type !== 'singleChoice') continue;
      if (
        JSON.stringify(item.options.map((option) => option.id)) !==
        JSON.stringify(instrument.analysis.responseCategories)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['questionnaire', 'items', item.id, 'options'],
          message: 'follow-up-focal-options-must-be-yes-no-unsure',
        });
      }
    }
  });

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

const followUpResponseValueSchema = z.union([z.string().max(80), z.null()]);
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
    responses: z.array(followUpItemResponseSchema).length(6),
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
      if (item.type === 'singleChoice') {
        const value = response.value;
        if (typeof value !== 'string' || !optionIds.has(value)) {
          addResponseIssue(context, item.id, 'invalid-follow-up-focal-response');
        }
        continue;
      }

      const controllingResponse = responseFor(request.responses, item.displayWhen.itemId);
      const displayed = controllingResponse?.value === item.displayWhen.equals;
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

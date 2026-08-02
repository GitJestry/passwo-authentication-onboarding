import { z } from 'zod';
import rawInstrumentRuntimeManifest from './generated/instruments-v1.runtime.json' with {
  type: 'json',
};

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
const scaleIdSchema = z.enum([
  'agreement7',
  'confidence11',
  'familiarity5',
  'intensity5',
  'durationAppropriateness7',
]);

const singleChoiceItemSchema = z
  .object({
    id: stableIdSchema,
    type: z.literal('singleChoice'),
    prompt: participantTextSchema,
    options: z.array(optionSchema).min(1).max(20),
    participantOptional: z.literal(true).optional(),
    displayWhen: displayWhenSchema.optional(),
  })
  .strict();
const multiChoiceItemSchema = z
  .object({
    id: stableIdSchema,
    type: z.literal('multiChoice'),
    prompt: participantTextSchema,
    instruction: participantTextSchema.optional(),
    note: participantTextSchema.optional(),
    options: z.array(optionSchema).min(1).max(20),
    exclusiveOptions: z.array(stableIdSchema).min(1).max(5).optional(),
  })
  .strict();
const scaleItemSchema = z
  .object({
    id: stableIdSchema,
    type: z.literal('scale'),
    scale: scaleIdSchema,
    instruction: participantTextSchema.optional(),
    prompt: participantTextSchema.optional(),
    label: participantTextSchema.optional(),
  })
  .strict();
const semanticDifferentialItemSchema = z
  .object({
    id: stableIdSchema,
    type: z.literal('semanticDifferential'),
    scale: z.literal('ueqSemanticDifferential7'),
    left: participantTextSchema,
    right: participantTextSchema,
  })
  .strict();
const integerItemSchema = z
  .object({
    id: stableIdSchema,
    type: z.literal('integer'),
    min: z.number().int(),
    max: z.number().int(),
    prompt: participantTextSchema,
  })
  .strict();
const textItemSchema = z
  .object({
    id: stableIdSchema,
    type: z.literal('text'),
    prompt: participantTextSchema,
    participantOptional: z.literal(true),
    maxLength: z.number().int().positive().max(10_000),
  })
  .strict();
const typedItemSchema = z.discriminatedUnion('type', [
  singleChoiceItemSchema,
  multiChoiceItemSchema,
  scaleItemSchema,
  semanticDifferentialItemSchema,
  integerItemSchema,
  textItemSchema,
]);

const sectionSchema = z
  .object({
    id: stableIdSchema,
    source: participantTextSchema.optional(),
    preserveItemOrder: z.boolean().optional(),
    instruction: participantTextSchema.optional(),
    objectiveDurationHiddenUntilSectionCommitted: z.boolean().optional(),
    aggregate: z.boolean().optional(),
    items: z.array(typedItemSchema).min(1).max(50),
  })
  .strict();
const sectionedInstrumentSchema = z
  .object({
    order: z.array(stableIdSchema).optional(),
    sections: z.array(sectionSchema).min(1).max(20),
  })
  .strict();

const guardrailItemSchema = z
  .object({
    id: stableIdSchema,
    prompt: participantTextSchema,
    options: z.array(optionSchema).length(4),
  })
  .strict();
const guardrailBlockSchema = z
  .object({
    id: stableIdSchema,
    submitLocksBlock: z.literal(true),
    items: z.array(guardrailItemSchema).min(1).max(20),
  })
  .strict();
const guardrailFormSchema = z.record(stableIdSchema, z.array(stableIdSchema).length(4));
const guardrailInstrumentSchema = z
  .object({
    participantTitle: participantTextSchema,
    purpose: stableIdSchema,
    comparisonScope: z.array(stableIdSchema),
    excludedFromPrimaryComparison: z.array(stableIdSchema),
    feedbackBeforeComplete: z.literal(false),
    mustNotDuplicateEmbeddedArtifactQuestions: z.literal(true),
    contentAuditRequired: z.string().min(1).max(200),
    responseFormat: z
      .object({
        type: z.literal('singleBestAnswer'),
        substantiveOptionsPerItem: z.literal(3),
        fixedUnsureOption: z.literal(true),
        multipleResponseUsed: z.literal(false),
      })
      .strict(),
    questionOrder: z.array(stableIdSchema),
    optionPresentation: z
      .object({
        strategy: z.literal('balanced_predefined_forms'),
        formIds: z.tuple([z.literal('F1'), z.literal('F2'), z.literal('F3')]),
        fixedLastOptionId: z.literal('unsure'),
        assignedBy: z.literal('server'),
        independentOfArtifactCondition: z.literal(true),
        balanceWithinCondition: z.literal('small_permuted_blocks'),
        stableAcrossNavigationAndReload: z.literal(true),
        persist: z.tuple([z.literal('optionOrderFormId'), z.literal('displayedOptionIdsByItem')]),
        forms: z
          .object({
            F1: guardrailFormSchema,
            F2: guardrailFormSchema,
            F3: guardrailFormSchema,
          })
          .strict(),
      })
      .strict(),
    nativeArtifactCheckPolicy: z
      .object({
        passwoNativeLearningChecksRetained: z.literal(true),
        secAwareNativeQuizIncludedInMeasuredPath: z.literal(false),
        secAwareQuizRemovalReason: z.literal(
          'avoid_immediate_feedback_contamination_of_external_guardrail',
        ),
        externalItemsMustBeNovelAndTransferOriented: z.literal(true),
      })
      .strict(),
    blocks: z.array(guardrailBlockSchema).length(2),
  })
  .strict();

const postOpenInstrumentSchema = z
  .object({
    alwaysSubmit: z.literal(true),
    blankOptionalTextValue: z.null(),
    warning: participantTextSchema,
    items: z.array(textItemSchema).min(1).max(10),
  })
  .strict();
const followUpInstrumentSchema = z
  .object({
    participantTitle: participantTextSchema,
    estimatedMinutes: z.number().int().positive(),
    reportingWindow: z
      .object({
        startsAfterMainSession: z.literal(true),
        cutoff: stableIdSchema,
        instruction: participantTextSchema,
      })
      .strict(),
    safetyNote: participantTextSchema,
    items: z
      .array(z.union([singleChoiceItemSchema, multiChoiceItemSchema]))
      .min(1)
      .max(20),
  })
  .strict();
const agreement7ScaleSchema = z
  .object({
    type: z.literal('integer'),
    min: z.literal(1),
    max: z.literal(7),
    anchors: z
      .object({
        1: participantTextSchema,
        2: participantTextSchema,
        3: participantTextSchema,
        4: participantTextSchema,
        5: participantTextSchema,
        6: participantTextSchema,
        7: participantTextSchema,
      })
      .strict(),
  })
  .strict();
const confidence11ScaleSchema = z
  .object({
    type: z.literal('integer'),
    min: z.literal(0),
    max: z.literal(10),
    anchors: z
      .object({
        0: participantTextSchema,
        5: participantTextSchema,
        10: participantTextSchema,
      })
      .strict(),
  })
  .strict();
const familiarity5ScaleSchema = z
  .object({
    type: z.literal('integer'),
    min: z.literal(1),
    max: z.literal(5),
    anchors: z
      .object({
        1: participantTextSchema,
        2: participantTextSchema,
        3: participantTextSchema,
        4: participantTextSchema,
        5: participantTextSchema,
      })
      .strict(),
  })
  .strict();
const intensity5ScaleSchema = familiarity5ScaleSchema;
const durationAppropriateness7ScaleSchema = z
  .object({
    type: z.literal('integer'),
    min: z.literal(1),
    max: z.literal(7),
    anchors: z
      .object({
        1: participantTextSchema,
        4: participantTextSchema,
        7: participantTextSchema,
      })
      .strict(),
  })
  .strict();
const ueqSemanticDifferential7ScaleSchema = z
  .object({
    type: z.literal('integer'),
    min: z.literal(1),
    max: z.literal(7),
    derivedTransform: z.literal('value - 4'),
  })
  .strict();
const participantInformationSchema = z
  .object({
    source: z.literal('docs/research/PARTICIPANT-INFORMATION.md'),
    eyebrow: participantTextSchema,
    welcomeHeading: participantTextSchema,
    welcomeParagraphs: z.array(participantTextSchema).min(1).max(5),
    facts: z
      .array(
        z
          .object({
            id: stableIdSchema,
            label: participantTextSchema,
            value: participantTextSchema,
          })
          .strict(),
      )
      .min(1)
      .max(6),
    readMoreLabel: participantTextSchema,
    informationHeading: participantTextSchema,
    sections: z
      .array(
        z
          .object({
            id: stableIdSchema,
            heading: participantTextSchema,
            paragraphs: z.array(participantTextSchema).min(1).max(6),
          })
          .strict(),
      )
      .min(1)
      .max(10),
    requiredConsent: z
      .object({
        legend: participantTextSchema,
        statement: participantTextSchema,
      })
      .strict(),
    actions: z
      .object({
        acceptLabel: participantTextSchema,
        declineLabel: participantTextSchema,
        declineHeading: participantTextSchema,
        declineBody: participantTextSchema,
      })
      .strict(),
  })
  .strict();
const sessionClosureContentSchema = z
  .object({
    heading: participantTextSchema,
    paragraphs: z.array(participantTextSchema).min(1).max(5),
    actionLabel: participantTextSchema,
  })
  .strict();

export const instrumentRuntimeManifestSchema = z
  .object({
    schemaVersion: z.literal(2),
    instrumentVersion: z.literal('1.6.0-draft'),
    questionnaireVersion: z.literal('questionnaire-v1.4-draft'),
    guardrailVersion: z.literal('guardrail-v3-draft'),
    consentVersion: z.literal('consent-v3-draft'),
    followUpVersion: z.literal('follow-up-v2-draft'),
    language: z.literal('de-DE'),
    participantTerm: participantTextSchema,
    scales: z
      .object({
        agreement7: agreement7ScaleSchema,
        confidence11: confidence11ScaleSchema,
        familiarity5: familiarity5ScaleSchema,
        intensity5: intensity5ScaleSchema,
        durationAppropriateness7: durationAppropriateness7ScaleSchema,
        ueqSemanticDifferential7: ueqSemanticDifferential7ScaleSchema,
      })
      .strict(),
    procedures: z
      .object({
        eligibility: z
          .object({
            persisted: z.literal(false),
            items: z
              .array(
                z
                  .object({
                    id: stableIdSchema,
                    prompt: participantTextSchema,
                    requiredValue: z.literal(true),
                  })
                  .strict(),
              )
              .min(1),
          })
          .strict(),
        participantInformation: participantInformationSchema,
        followUpRecontact: z
          .object({
            optional: z.literal(true),
            consentLegend: participantTextSchema,
            consentStatement: participantTextSchema,
            emailLabel: participantTextSchema,
            emailRequired: z.literal(true),
            emailNeverStoredInResearchDatabase: z.literal(true),
            firstInvitationDelayHours: z.number().int().positive(),
            reminderDelayAfterFirstInvitationHours: z.number().int().positive(),
            closeAfterSessionHours: z.number().int().positive(),
            emailSubject: participantTextSchema,
            emailContainsTrainingAdvice: z.literal(false),
          })
          .strict(),
        sessionClosure: z
          .object({
            immediateDebriefWithoutFollowUp: sessionClosureContentSchema,
            deferredDebriefWithFollowUp: sessionClosureContentSchema,
          })
          .strict(),
      })
      .strict(),
    instruments: z
      .object({
        'pre-v1': sectionedInstrumentSchema,
        'post-v1': sectionedInstrumentSchema,
        'guardrail-v2': guardrailInstrumentSchema,
        'post-open-v1': postOpenInstrumentSchema,
        'follow-up-v1': followUpInstrumentSchema,
      })
      .strict(),
    runtimeManifestVersion: z.literal('instrument-runtime-v1.6-draft'),
  })
  .strict();

export type InstrumentRuntimeManifest = z.infer<typeof instrumentRuntimeManifestSchema>;
export const instrumentRuntimeManifest = instrumentRuntimeManifestSchema.parse(
  rawInstrumentRuntimeManifest,
);

export const guardrailFormIdSchema = z.enum(['F1', 'F2', 'F3']);
export type GuardrailFormId = z.infer<typeof guardrailFormIdSchema>;

export const mainInstrumentIdSchema = z.enum(['pre-v1', 'post-v1', 'guardrail-v2', 'post-open-v1']);
export type MainInstrumentId = z.infer<typeof mainInstrumentIdSchema>;

export const instrumentSectionIdSchema = stableIdSchema;
export type InstrumentSectionId = z.infer<typeof instrumentSectionIdSchema>;

export const instrumentResponseValueSchema = z.union([
  z.string().max(1_000),
  z.number().finite(),
  z.boolean(),
  z.null(),
  z.array(stableIdSchema).max(20),
]);
export type InstrumentResponseValue = z.infer<typeof instrumentResponseValueSchema>;

const instrumentItemResponseSchema = z
  .object({
    itemId: stableIdSchema,
    value: instrumentResponseValueSchema,
  })
  .strict();

export interface InstrumentRuntimeItem {
  readonly id: string;
  readonly type?: string | undefined;
  readonly scale?: string | undefined;
  readonly min?: number | undefined;
  readonly max?: number | undefined;
  readonly maxLength?: number | undefined;
  readonly participantOptional?: true | undefined;
  readonly options?: readonly { readonly id: string }[] | undefined;
  readonly exclusiveOptions?: readonly string[] | undefined;
}

export interface InstrumentSubmissionBlock {
  readonly instrumentId: MainInstrumentId;
  readonly sectionId: string;
  readonly items: readonly InstrumentRuntimeItem[];
}

const preInstrument = instrumentRuntimeManifest.instruments['pre-v1'];
const postInstrument = instrumentRuntimeManifest.instruments['post-v1'];
const guardrailInstrument = instrumentRuntimeManifest.instruments['guardrail-v2'];
const postOpenInstrument = instrumentRuntimeManifest.instruments['post-open-v1'];

export const mainInstrumentBlocks: readonly InstrumentSubmissionBlock[] = [
  ...preInstrument.sections.map((section) => ({
    instrumentId: 'pre-v1' as const,
    sectionId: section.id,
    items: section.items,
  })),
  ...postInstrument.sections.map((section) => ({
    instrumentId: 'post-v1' as const,
    sectionId: section.id,
    items: section.items,
  })),
  ...guardrailInstrument.blocks.map((block) => ({
    instrumentId: 'guardrail-v2' as const,
    sectionId: block.id,
    items: block.items,
  })),
  {
    instrumentId: 'post-open-v1',
    sectionId: 'post-open',
    items: postOpenInstrument.items,
  },
];

function submissionBlock(
  instrumentId: string,
  sectionId: string,
): InstrumentSubmissionBlock | undefined {
  return mainInstrumentBlocks.find(
    (block) => block.instrumentId === instrumentId && block.sectionId === sectionId,
  );
}

function addValueIssue(context: z.RefinementCtx, itemId: string, message: string): void {
  context.addIssue({
    code: 'custom',
    path: ['responses', itemId, 'value'],
    message,
  });
}

function validateItemValue(
  item: InstrumentRuntimeItem,
  value: InstrumentResponseValue,
  context: z.RefinementCtx,
): void {
  if (item.type === 'scale') {
    const scales: Readonly<Record<string, { readonly min: number; readonly max: number }>> =
      instrumentRuntimeManifest.scales;
    const scale = item.scale === undefined ? undefined : scales[item.scale];
    if (
      scale === undefined ||
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      value < scale.min ||
      value > scale.max
    ) {
      addValueIssue(context, item.id, 'invalid-scale-value');
    }
    return;
  }
  if (item.type === 'integer') {
    if (
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      item.min === undefined ||
      item.max === undefined ||
      value < item.min ||
      value > item.max
    ) {
      addValueIssue(context, item.id, 'invalid-integer-value');
    }
    return;
  }
  if (item.type === 'semanticDifferential') {
    const scale = instrumentRuntimeManifest.scales.ueqSemanticDifferential7;
    if (
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      value < scale.min ||
      value > scale.max
    ) {
      addValueIssue(context, item.id, 'invalid-semantic-differential-value');
    }
    return;
  }
  if (item.type === 'text') {
    if (value === null) return;
    if (
      typeof value !== 'string' ||
      value.trim().length === 0 ||
      item.maxLength === undefined ||
      value.length > item.maxLength
    ) {
      addValueIssue(context, item.id, 'invalid-text-value');
    }
    return;
  }

  const optionIds = new Set(item.options?.map((option) => option.id) ?? []);
  if (item.type === 'multiChoice') {
    if (
      !Array.isArray(value) ||
      value.length === 0 ||
      value.length > optionIds.size ||
      new Set(value).size !== value.length ||
      value.some((optionId) => !optionIds.has(optionId))
    ) {
      addValueIssue(context, item.id, 'invalid-multi-choice-value');
      return;
    }
    const exclusiveOptions = new Set(item.exclusiveOptions ?? []);
    if (value.length > 1 && value.some((optionId) => exclusiveOptions.has(optionId))) {
      addValueIssue(context, item.id, 'exclusive-option-conflict');
    }
    return;
  }

  if (value === null && item.participantOptional === true) return;
  if (typeof value !== 'string' || !optionIds.has(value)) {
    addValueIssue(context, item.id, 'invalid-option-id');
  }
}

export const instrumentSubmissionRequestSchema = z
  .object({
    instrumentId: mainInstrumentIdSchema,
    sectionId: instrumentSectionIdSchema,
    responses: z.array(instrumentItemResponseSchema).min(1).max(50),
  })
  .strict()
  .superRefine((request, context) => {
    const block = submissionBlock(request.instrumentId, request.sectionId);
    if (block === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['sectionId'],
        message: 'unknown-instrument-block',
      });
      return;
    }
    const responseIds = request.responses.map((response) => response.itemId);
    if (
      responseIds.length !== block.items.length ||
      new Set(responseIds).size !== responseIds.length ||
      block.items.some((item) => !responseIds.includes(item.id))
    ) {
      context.addIssue({
        code: 'custom',
        path: ['responses'],
        message: 'incomplete-instrument-block',
      });
      return;
    }
    for (const item of block.items) {
      const response = request.responses.find((candidate) => candidate.itemId === item.id);
      if (response !== undefined) validateItemValue(item, response.value, context);
    }
  });
export type InstrumentSubmissionRequest = z.infer<typeof instrumentSubmissionRequestSchema>;
export type InstrumentSubmissionFor<InstrumentId extends MainInstrumentId> = Omit<
  InstrumentSubmissionRequest,
  'instrumentId'
> & {
  readonly instrumentId: InstrumentId;
};

export function normalizeInstrumentSubmission(
  request: InstrumentSubmissionRequest,
): InstrumentSubmissionRequest {
  const block = submissionBlock(request.instrumentId, request.sectionId);
  if (block === undefined) {
    throw new Error('unknown-instrument-block');
  }
  return {
    instrumentId: request.instrumentId,
    sectionId: request.sectionId,
    responses: block.items.map((item) => {
      const response = request.responses.find((candidate) => candidate.itemId === item.id);
      if (response === undefined) throw new Error('incomplete-instrument-block');
      return response;
    }),
  };
}

export function guardrailPresentationForForm(formId: GuardrailFormId): readonly {
  readonly sectionId: string;
  readonly itemId: string;
  readonly displayedOptionIds: readonly string[];
}[] {
  const form = guardrailInstrument.optionPresentation.forms[formId];
  return guardrailInstrument.blocks.flatMap((block) =>
    block.items.map((item) => ({
      sectionId: block.id,
      itemId: item.id,
      displayedOptionIds: form[item.id] ?? [],
    })),
  );
}

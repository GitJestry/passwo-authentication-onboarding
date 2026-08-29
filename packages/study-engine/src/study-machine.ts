import {
  type ArtifactCheckpoint,
  type ArtifactIntervalStartResponse,
  artifactCheckpointSchema,
  artifactIntervalStartResponseSchema,
  mainInstrumentBlocks,
  type AssignmentMode,
  type CreateSessionResponse,
  createSessionResponseSchema,
  type DeletionCode,
  deletionCodeSchema,
  type GuardrailFormId,
  type InstrumentSubmissionFor,
  type InstrumentSubmissionRequest,
  type MainInstrumentId,
  type RegisterRecontactRequest,
  registerRecontactRequestSchema,
  type StudyCondition,
  type StudyResumeTarget,
  type WebResumeSession,
} from '@passwo/contracts';
import { assign, fromCallback, fromPromise, setup } from 'xstate';

export type StudySessionInitialization = CreateSessionResponse & {
  readonly deletionCode: DeletionCode;
};

const studySessionInitializationSchema = createSessionResponseSchema
  .extend({ deletionCode: deletionCodeSchema })
  .strict();

export interface StudyRuntimePorts {
  createSession(
    followUpConsent: boolean,
    recontact: RegisterRecontactRequest | null,
  ): Promise<StudySessionInitialization>;
  registerRecontact(sessionId: string, request: RegisterRecontactRequest): Promise<void>;
  abandonRecontact(sessionId: string): Promise<void>;
  saveInstrumentSubmission(
    sessionId: string,
    submission: InstrumentSubmissionRequest,
  ): Promise<void>;
  startArtifact(sessionId: string): Promise<ArtifactRuntimeStart>;
  endArtifact(sessionId: string): Promise<number>;
  recordArtifactVisibility(sessionId: string, visible: boolean): Promise<void>;
  retryArtifactTiming(sessionId: string): Promise<number | null>;
  observeArtifactLifecycle(input: ArtifactLifecycleInput): () => void;
}

export interface ArtifactLifecycleInput {
  readonly sessionId: string;
  readonly condition: StudyCondition;
  onVisibilityChange(visible: boolean): void;
}


export type ArtifactRuntimeStart = ArtifactIntervalStartResponse;

export interface StudyContext {
  readonly sessionId: string | null;
  readonly deletionCode: DeletionCode | null;
  readonly condition: StudyCondition | null;
  readonly assignmentMode: AssignmentMode | null;
  readonly guardrailFormId: GuardrailFormId | null;
  readonly followUpConsent: boolean;
  readonly recontactEmail: string | null;
  readonly recontactRequestId: string | null;
  readonly instrumentBlockCursor: number;
  readonly questionnaireBlockCursor: number;
  readonly questionnaireDrafts: readonly (InstrumentSubmissionRequest | null)[];
  readonly questionnaireBackFloor: number;
  readonly pendingSubmission: InstrumentSubmissionRequest | null;
  readonly artifactWallClockMs: number | null;
  readonly artifactCheckpoint: ArtifactCheckpoint | null;
  readonly resumeTarget: StudyResumeTarget | null;
  readonly interrupted: boolean;
  readonly artifactTimingStarted: boolean;
  readonly pendingArtifactTimingWrites: number;
  readonly artifactCompletionRequested: boolean;
  readonly artifactTimingErrorKind: 'visibility' | 'end' | null;
  readonly researchErrorCode: string | null;
  readonly fatalErrorCode: string | null;
}

export type StudyEvent =
  | {
      readonly type: 'ACCEPT_CONSENT';
      readonly followUpConsent: boolean;
      readonly recontact: RegisterRecontactRequest | null;
    }
  | { readonly type: 'RETRY_RECONTACT' }
  | { readonly type: 'CONTINUE_WITHOUT_FOLLOW_UP' }
  | {
      readonly type: 'SUBMIT_PRE';
      readonly payload: InstrumentSubmissionFor<'pre-v1'>;
    }
  | {
      readonly type: 'BACK_PRE';
      readonly payload: InstrumentSubmissionFor<'pre-v1'>;
    }
  | { readonly type: 'START_ARTIFACT' }
  | { readonly type: 'ARTIFACT_COMPLETED' }
  | {
      readonly type: 'SUBMIT_POST';
      readonly payload: InstrumentSubmissionFor<'post-v1'>;
    }
  | {
      readonly type: 'BACK_POST';
      readonly payload: InstrumentSubmissionFor<'post-v1'>;
    }
  | {
      readonly type: 'SUBMIT_GUARDRAILS';
      readonly payload: InstrumentSubmissionFor<'guardrail-v2'>;
    }
  | { readonly type: 'RETRY_SESSION' }
  | { readonly type: 'RETRY_PRE' }
  | { readonly type: 'RETRY_ARTIFACT_START' }
  | { readonly type: 'RETRY_ARTIFACT_VISIBILITY' }
  | { readonly type: 'RETRY_ARTIFACT_END' }
  | { readonly type: 'RETRY_POST' }
  | { readonly type: 'RETRY_GUARDRAILS' }
  | { readonly type: 'ARTIFACT_VISIBILITY_CHANGED'; readonly visible: boolean }
  | { readonly type: 'ARTIFACT_TIMING_WRITE_SUCCEEDED' }
  | {
      readonly type: 'ARTIFACT_TIMING_WRITE_FAILED';
      readonly errorCode: string;
    }
  | { readonly type: 'TECHNICAL_ABORT'; readonly errorCode: string }
  | { readonly type: 'RESET' };

const initialContext: StudyContext = {
  sessionId: null,
  deletionCode: null,
  condition: null,
  assignmentMode: null,
  guardrailFormId: null,
  followUpConsent: false,
  recontactEmail: null,
  recontactRequestId: null,
  instrumentBlockCursor: 0,
  questionnaireBlockCursor: 0,
  questionnaireDrafts: [],
  questionnaireBackFloor: 0,
  pendingSubmission: null,
  artifactWallClockMs: null,
  artifactCheckpoint: null,
  resumeTarget: null,
  interrupted: false,
  artifactTimingStarted: false,
  pendingArtifactTimingWrites: 0,
  artifactCompletionRequested: false,
  artifactTimingErrorKind: null,
  researchErrorCode: null,
  fatalErrorCode: null,
};

function requiredSessionId(context: StudyContext): string {
  if (context.sessionId === null) {
    throw new Error('missing-session');
  }
  return context.sessionId;
}

function requiredCondition(context: StudyContext): StudyCondition {
  if (context.condition === null) {
    throw new Error('missing-condition');
  }
  return context.condition;
}

function requiredPendingSubmission(context: StudyContext): InstrumentSubmissionRequest {
  if (context.pendingSubmission === null) {
    throw new Error('missing-pending-instrument-submission');
  }
  return context.pendingSubmission;
}

function requiredRecontactRequest(context: StudyContext): RegisterRecontactRequest {
  if (context.recontactEmail === null || context.recontactRequestId === null) {
    throw new Error('missing-recontact-registration');
  }
  return {
    requestId: context.recontactRequestId,
    email: context.recontactEmail,
  };
}

function currentInstrumentId(context: StudyContext): MainInstrumentId | null {
  return mainInstrumentBlocks[context.instrumentBlockCursor]?.instrumentId ?? null;
}

function questionnaireDraftAt(
  context: StudyContext,
  blockCursor = context.instrumentBlockCursor,
): InstrumentSubmissionRequest {
  const submission = context.questionnaireDrafts[blockCursor];
  if (submission === undefined || submission === null) {
    throw new Error('missing-questionnaire-draft');
  }
  return submission;
}

function matchesExpectedSubmission(
  context: StudyContext,
  submission: InstrumentSubmissionRequest,
  instrumentId: MainInstrumentId,
): boolean {
  const expectedBlock = mainInstrumentBlocks[context.instrumentBlockCursor];
  return (
    expectedBlock !== undefined &&
    expectedBlock.instrumentId === instrumentId &&
    submission.instrumentId === expectedBlock.instrumentId &&
    submission.sectionId === expectedBlock.sectionId
  );
}

function matchesQuestionnairePage(
  context: StudyContext,
  submission: InstrumentSubmissionRequest,
  instrumentId: 'pre-v1' | 'post-v1',
): boolean {
  const expectedBlock = mainInstrumentBlocks[context.questionnaireBlockCursor];
  return (
    expectedBlock !== undefined &&
    expectedBlock.instrumentId === instrumentId &&
    submission.instrumentId === expectedBlock.instrumentId &&
    submission.sectionId === expectedBlock.sectionId
  );
}

function adjacentQuestionnaireBlockIs(
  context: StudyContext,
  offset: -1 | 1,
  instrumentId: 'pre-v1' | 'post-v1',
): boolean {
  return (
    mainInstrumentBlocks[context.questionnaireBlockCursor + offset]?.instrumentId === instrumentId
  );
}

function errorCode(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.slice(0, 80);
  }
  return 'research-data-write-failed';
}

function initialContextFor(resumeSession: WebResumeSession | null): StudyContext {
  if (resumeSession === null) return initialContext;
  const checkpoint = artifactCheckpointSchema.safeParse(resumeSession.checkpoint);
  return {
    ...initialContext,
    sessionId: resumeSession.sessionId,
    deletionCode: resumeSession.deletionCode,
    condition: resumeSession.condition,
    assignmentMode: resumeSession.assignmentMode,
    guardrailFormId: resumeSession.guardrailFormId,
    followUpConsent: resumeSession.followUpConsent,
    instrumentBlockCursor: resumeSession.nextInstrumentBlockIndex,
    questionnaireBlockCursor: resumeSession.nextInstrumentBlockIndex,
    questionnaireBackFloor: resumeSession.nextInstrumentBlockIndex,
    artifactWallClockMs: resumeSession.artifactSessionElapsedMs,
    artifactCheckpoint: checkpoint.success ? checkpoint.data : null,
    resumeTarget: resumeSession.resumeTarget,
    interrupted: resumeSession.interrupted,
  };
}

export function createStudyMachine(
  ports: StudyRuntimePorts,
  resumeSession: WebResumeSession | null = null,
) {
  const hydratedInitialContext = initialContextFor(resumeSession);
  const machineSetup = setup({
    types: {
      context: {} as StudyContext,
      events: {} as StudyEvent,
    },
    actors: {
      createSession: fromPromise(
        async ({ input }: { input: { followUpConsent: boolean; recontact: RegisterRecontactRequest | null } }) =>
          ports.createSession(input.followUpConsent, input.recontact),
      ),
      registerRecontact: fromPromise(
        async ({ input }: { input: { sessionId: string; request: RegisterRecontactRequest } }) =>
          ports.registerRecontact(input.sessionId, input.request),
      ),
      abandonRecontact: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.abandonRecontact(input.sessionId),
      ),
      saveInstrumentSubmission: fromPromise(
        async ({
          input,
        }: {
          input: { sessionId: string; submission: InstrumentSubmissionRequest };
        }) => ports.saveInstrumentSubmission(input.sessionId, input.submission),
      ),
      startArtifact: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.startArtifact(input.sessionId),
      ),
      endArtifact: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.endArtifact(input.sessionId),
      ),
      retryArtifactTiming: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.retryArtifactTiming(input.sessionId),
      ),
      observeArtifactLifecycle: fromCallback(
        ({
          input,
          sendBack,
        }: {
          input: { sessionId: string; condition: StudyCondition };
          sendBack: (event: StudyEvent) => void;
        }) =>
          ports.observeArtifactLifecycle({
            ...input,
            onVisibilityChange: (visible) =>
              sendBack({ type: 'ARTIFACT_VISIBILITY_CHANGED', visible }),
          }),
      ),
    },
    guards: {
      acceptsConsentDecision: ({ event }) => {
        if (event.type !== 'ACCEPT_CONSENT') return false;
        return event.followUpConsent
          ? registerRecontactRequestSchema.safeParse(event.recontact).success
          : event.recontact === null;
      },
      hasRecontactRegistration: ({ context }) =>
        context.recontactEmail !== null && context.recontactRequestId !== null,
      acceptsPreSubmission: ({ context, event }) =>
        event.type === 'SUBMIT_PRE' && matchesQuestionnairePage(context, event.payload, 'pre-v1'),
      acceptsPreAdvance: ({ context, event }) =>
        event.type === 'SUBMIT_PRE' &&
        matchesQuestionnairePage(context, event.payload, 'pre-v1') &&
        adjacentQuestionnaireBlockIs(context, 1, 'pre-v1'),
      acceptsPreBack: ({ context, event }) =>
        event.type === 'BACK_PRE' &&
        matchesQuestionnairePage(context, event.payload, 'pre-v1') &&
        context.questionnaireBlockCursor > context.questionnaireBackFloor &&
        adjacentQuestionnaireBlockIs(context, -1, 'pre-v1'),
      acceptsPostSubmission: ({ context, event }) =>
        event.type === 'SUBMIT_POST' &&
        matchesQuestionnairePage(context, event.payload, 'post-v1'),
      acceptsPostAdvance: ({ context, event }) =>
        event.type === 'SUBMIT_POST' &&
        matchesQuestionnairePage(context, event.payload, 'post-v1') &&
        adjacentQuestionnaireBlockIs(context, 1, 'post-v1'),
      acceptsPostBack: ({ context, event }) =>
        event.type === 'BACK_POST' &&
        matchesQuestionnairePage(context, event.payload, 'post-v1') &&
        context.questionnaireBlockCursor > context.questionnaireBackFloor &&
        adjacentQuestionnaireBlockIs(context, -1, 'post-v1'),
      acceptsGuardrailSubmission: ({ context, event }) =>
        event.type === 'SUBMIT_GUARDRAILS' &&
        matchesExpectedSubmission(context, event.payload, 'guardrail-v2'),
      nextBlockIsPre: ({ context }) => currentInstrumentId(context) === 'pre-v1',
      nextBlockIsPost: ({ context }) => currentInstrumentId(context) === 'post-v1',
      nextBlockIsGuardrail: ({ context }) => currentInstrumentId(context) === 'guardrail-v2',
      isSupportive: ({ context }) => context.condition === 'supportive',
      acceptsArtifactVisibility: ({ context }) =>
        context.condition === 'supportive' &&
        context.artifactTimingStarted &&
        !context.artifactCompletionRequested,
      artifactCompletionReady: ({ context }) =>
        context.artifactCompletionRequested && context.pendingArtifactTimingWrites === 0,
      visibilityTimingFailed: ({ context }) => context.artifactTimingErrorKind === 'visibility',
      endTimingFailed: ({ context }) => context.artifactTimingErrorKind === 'end',
      resumesPreQuestionnaire: ({ context }) => context.resumeTarget === 'pre-questionnaire',
      resumesArtifactPreparation: ({ context }) => context.resumeTarget === 'artifact-preparation',
      resumesArtifact: ({ context }) => context.resumeTarget === 'artifact',
      resumesPostQuestionnaire: ({ context }) => context.resumeTarget === 'post-questionnaire',
      resumesGuardrails: ({ context }) => context.resumeTarget === 'guardrails',
    },
    actions: {
      clearResearchError: assign({ researchErrorCode: () => null }),
      storeConsentDecision: assign({
        followUpConsent: ({ event }) =>
          event.type === 'ACCEPT_CONSENT' ? event.followUpConsent : false,
        recontactEmail: ({ event }) =>
          event.type === 'ACCEPT_CONSENT' && event.recontact !== null
            ? event.recontact.email
            : null,
        recontactRequestId: ({ event }) =>
          event.type === 'ACCEPT_CONSENT' && event.recontact !== null
            ? event.recontact.requestId
            : null,
      }),
      storeSession: assign(({ event }) => {
        const output = studySessionInitializationSchema.parse(
          'output' in event ? event.output : null,
        );
        return {
          sessionId: output.sessionId,
          deletionCode: output.deletionCode,
          condition: output.condition,
          assignmentMode: output.assignmentMode,
          guardrailFormId: output.guardrailFormId,
          researchErrorCode: null,
        };
      }),
      clearRecontactSecrets: assign({
        recontactEmail: () => null,
        recontactRequestId: () => null,
        researchErrorCode: () => null,
      }),
      abandonFollowUpConsent: assign({
        followUpConsent: () => false,
        recontactEmail: () => null,
        recontactRequestId: () => null,
        researchErrorCode: () => null,
      }),
      storePendingSubmission: assign({
        pendingSubmission: ({ context, event }) => {
          switch (event.type) {
            case 'SUBMIT_GUARDRAILS':
              return event.payload;
            default:
              return context.pendingSubmission;
          }
        },
      }),
      storeQuestionnaireDraft: assign({
        questionnaireDrafts: ({ context, event }) => {
          if (
            event.type !== 'SUBMIT_PRE' &&
            event.type !== 'BACK_PRE' &&
            event.type !== 'SUBMIT_POST' &&
            event.type !== 'BACK_POST'
          ) {
            return context.questionnaireDrafts;
          }
          const drafts = [...context.questionnaireDrafts];
          drafts[context.questionnaireBlockCursor] = event.payload;
          return drafts;
        },
      }),
      advanceQuestionnaire: assign({
        questionnaireBlockCursor: ({ context }) => context.questionnaireBlockCursor + 1,
      }),
      returnToPreviousQuestionnaireSection: assign({
        questionnaireBlockCursor: ({ context }) =>
          Math.max(context.instrumentBlockCursor, context.questionnaireBlockCursor - 1),
      }),
      prepareQuestionnaireSubmission: assign({
        questionnaireDrafts: ({ context, event }) => {
          if (event.type !== 'SUBMIT_PRE' && event.type !== 'SUBMIT_POST') {
            return context.questionnaireDrafts;
          }
          const drafts = [...context.questionnaireDrafts];
          drafts[context.questionnaireBlockCursor] = event.payload;
          return drafts;
        },
        pendingSubmission: ({ context, event }) => {
          if (event.type !== 'SUBMIT_PRE' && event.type !== 'SUBMIT_POST') {
            return context.pendingSubmission;
          }
          return context.instrumentBlockCursor === context.questionnaireBlockCursor
            ? event.payload
            : questionnaireDraftAt(context);
        },
      }),
      loadNextQuestionnaireSubmission: assign({
        pendingSubmission: ({ context }) => questionnaireDraftAt(context),
      }),
      clearQuestionnaireDrafts: assign({
        questionnaireDrafts: () => [],
      }),
      confirmPendingSubmission: assign({
        instrumentBlockCursor: ({ context }) => context.instrumentBlockCursor + 1,
        questionnaireBlockCursor: ({ context }) => context.instrumentBlockCursor + 1,
        pendingSubmission: () => null,
        researchErrorCode: () => null,
      }),
      requestArtifactCompletion: assign({
        artifactCompletionRequested: () => true,
      }),
      storeArtifactRuntimeStart: assign(({ event }) => {
        const output = artifactIntervalStartResponseSchema.parse(
          'output' in event ? event.output : null,
        );
        return {
          artifactTimingStarted: true,
          artifactCheckpoint: output.checkpoint,
          artifactWallClockMs: output.artifactSessionElapsedMs,
          interrupted: output.interrupted,
          researchErrorCode: null,
        };
      }),
      incrementPendingArtifactTimingWrites: assign({
        pendingArtifactTimingWrites: ({ context }) => context.pendingArtifactTimingWrites + 1,
      }),
      decrementPendingArtifactTimingWrites: assign({
        pendingArtifactTimingWrites: ({ context }) =>
          Math.max(0, context.pendingArtifactTimingWrites - 1),
      }),
      recordArtifactVisibility: ({ context, event, self }) => {
        if (event.type !== 'ARTIFACT_VISIBILITY_CHANGED') return;
        void ports.recordArtifactVisibility(requiredSessionId(context), event.visible).then(
          () => self.send({ type: 'ARTIFACT_TIMING_WRITE_SUCCEEDED' }),
          (error: unknown) =>
            self.send({
              type: 'ARTIFACT_TIMING_WRITE_FAILED',
              errorCode: errorCode(error),
            }),
        );
      },
      retryArtifactVisibility: ({ context, self }) => {
        void ports.retryArtifactTiming(requiredSessionId(context)).then(
          () => self.send({ type: 'ARTIFACT_TIMING_WRITE_SUCCEEDED' }),
          (error: unknown) =>
            self.send({
              type: 'ARTIFACT_TIMING_WRITE_FAILED',
              errorCode: errorCode(error),
            }),
        );
      },
      storeVisibilityTimingError: assign({
        artifactTimingErrorKind: () => 'visibility' as const,
        researchErrorCode: ({ event }) =>
          event.type === 'ARTIFACT_TIMING_WRITE_FAILED'
            ? event.errorCode
            : 'research-data-write-failed',
      }),
      storeEndTimingError: assign({
        artifactTimingErrorKind: () => 'end' as const,
        researchErrorCode: ({ event }) =>
          'error' in event ? errorCode(event.error) : 'research-data-write-failed',
      }),
      clearArtifactTimingError: assign({
        artifactTimingErrorKind: () => null,
        researchErrorCode: () => null,
      }),
      clearVisibilityTimingError: assign({
        artifactTimingErrorKind: ({ context }) =>
          context.artifactTimingErrorKind === 'visibility' ? null : context.artifactTimingErrorKind,
        researchErrorCode: ({ context }) =>
          context.artifactTimingErrorKind === 'visibility' ? null : context.researchErrorCode,
      }),
      storeFatalError: assign({
        fatalErrorCode: ({ event }) =>
          event.type === 'TECHNICAL_ABORT' ? event.errorCode : 'unknown',
      }),
      resetContext: assign(() => initialContext),
    },
  });

  return machineSetup.createMachine({
    id: 'study',
    initial: resumeSession === null ? 'consent' : 'resumeRouting',
    context: hydratedInitialContext,
    on: {
      TECHNICAL_ABORT: { target: '.fatalError', actions: 'storeFatalError' },
    },
    states: {
      resumeRouting: {
        always: [
          { guard: 'resumesPreQuestionnaire', target: 'preQuestionnaire' },
          { guard: 'resumesArtifactPreparation', target: 'artifactLifecycle' },
          { guard: 'resumesArtifact', target: '#study.artifactLifecycle.starting' },
          { guard: 'resumesPostQuestionnaire', target: 'postQuestionnaire' },
          { guard: 'resumesGuardrails', target: 'guardrails' },
          { target: 'sessionClosure' },
        ],
      },
      consent: {
        on: {
          ACCEPT_CONSENT: {
            guard: 'acceptsConsentDecision',
            target: 'creatingSession',
            actions: 'storeConsentDecision',
          },
        },
      },
      creatingSession: {
        invoke: {
          id: 'createSession',
          src: 'createSession',
          input: ({ context }) => ({
            followUpConsent: context.followUpConsent,
            recontact:
              context.recontactEmail === null || context.recontactRequestId === null
                ? null
                : { email: context.recontactEmail, requestId: context.recontactRequestId },
          }),
          onDone: {
            target: 'preQuestionnaire',
            actions: ['storeSession', 'clearRecontactSecrets'],
          },
          onError: {
            target: 'sessionError',
            actions: assign({
              researchErrorCode: ({ event }) => errorCode(event.error),
            }),
          },
        },
      },
      sessionError: {
        on: {
          RETRY_SESSION: { target: 'creatingSession', actions: 'clearResearchError' },
        },
      },
      recontactRegistration: {
        initial: 'routing',
        states: {
          routing: {
            always: [
              { guard: 'hasRecontactRegistration', target: 'registering' },
              { target: '#study.preQuestionnaire' },
            ],
          },
          registering: {
            invoke: {
              id: 'registerRecontact',
              src: 'registerRecontact',
              input: ({ context }) => ({
                sessionId: requiredSessionId(context),
                request: requiredRecontactRequest(context),
              }),
              onDone: {
                target: '#study.preQuestionnaire',
                actions: 'clearRecontactSecrets',
              },
              onError: {
                target: 'error',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          error: {
            on: {
              RETRY_RECONTACT: {
                target: 'registering',
                actions: 'clearResearchError',
              },
              CONTINUE_WITHOUT_FOLLOW_UP: {
                target: 'abandoning',
                actions: 'clearResearchError',
              },
            },
          },
          abandoning: {
            invoke: {
              id: 'abandonRecontact',
              src: 'abandonRecontact',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: {
                target: '#study.preQuestionnaire',
                actions: 'abandonFollowUpConsent',
              },
              onError: {
                target: 'error',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
        },
      },
      preQuestionnaire: {
        initial: 'editing',
        states: {
          editing: {
            on: {
              SUBMIT_PRE: [
                {
                  guard: 'acceptsPreAdvance',
                  actions: ['storeQuestionnaireDraft', 'advanceQuestionnaire'],
                },
                {
                  guard: 'acceptsPreSubmission',
                  target: 'saving',
                  actions: 'prepareQuestionnaireSubmission',
                },
              ],
              BACK_PRE: {
                guard: 'acceptsPreBack',
                actions: ['storeQuestionnaireDraft', 'returnToPreviousQuestionnaireSection'],
              },
            },
          },
          saving: {
            invoke: {
              id: 'savePreSubmission',
              src: 'saveInstrumentSubmission',
              input: ({ context }) => ({
                sessionId: requiredSessionId(context),
                submission: requiredPendingSubmission(context),
              }),
              onDone: {
                target: 'routing',
                actions: 'confirmPendingSubmission',
              },
              onError: {
                target: 'error',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          error: {
            on: { RETRY_PRE: { target: 'saving', actions: 'clearResearchError' } },
          },
          routing: {
            always: [
              {
                guard: 'nextBlockIsPre',
                target: 'saving',
                actions: 'loadNextQuestionnaireSubmission',
              },
              { target: '#study.artifactLifecycle', actions: 'clearQuestionnaireDrafts' },
            ],
          },
        },
      },
      artifactLifecycle: {
        tags: ['artifactActive'],
        initial: 'preparing',
        invoke: {
          id: 'observeArtifactLifecycle',
          src: 'observeArtifactLifecycle',
          input: ({ context }) => ({
            sessionId: requiredSessionId(context),
            condition: requiredCondition(context),
          }),
        },
        on: {
          ARTIFACT_VISIBILITY_CHANGED: {
            guard: 'acceptsArtifactVisibility',
            actions: ['incrementPendingArtifactTimingWrites', 'recordArtifactVisibility'],
          },
          ARTIFACT_TIMING_WRITE_SUCCEEDED: {
            actions: ['decrementPendingArtifactTimingWrites', 'clearVisibilityTimingError'],
          },
          ARTIFACT_TIMING_WRITE_FAILED: {
            actions: 'storeVisibilityTimingError',
          },
          RETRY_ARTIFACT_VISIBILITY: {
            guard: 'visibilityTimingFailed',
            actions: 'retryArtifactVisibility',
          },
        },
        states: {
          preparing: {
            on: {
              START_ARTIFACT: 'starting',
            },
          },
          starting: {
            invoke: {
              id: 'startArtifact',
              src: 'startArtifact',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: {
                target: 'artifact',
                actions: 'storeArtifactRuntimeStart',
              },
              onError: {
                target: 'startError',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          startError: {
            on: {
              RETRY_ARTIFACT_START: {
                target: 'retryingStartTiming',
                actions: 'clearResearchError',
              },
            },
          },
          retryingStartTiming: {
            invoke: {
              id: 'retryArtifactStartTiming',
              src: 'startArtifact',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: {
                target: 'artifact',
                actions: ['storeArtifactRuntimeStart', 'clearArtifactTimingError'],
              },
              onError: {
                target: 'startError',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          artifact: {
            initial: 'routing',
            always: {
              guard: 'artifactCompletionReady',
              target: '#artifact-ending',
            },
            on: {
              ARTIFACT_COMPLETED: {
                actions: 'requestArtifactCompletion',
              },
            },
            states: {
              routing: {
                always: [{ guard: 'isSupportive', target: 'supportive' }, { target: 'reference' }],
              },
              supportive: {
                type: 'atomic',
              },
              reference: {
                type: 'atomic',
              },
            },
          },
          ending: {
            id: 'artifact-ending',
            invoke: {
              id: 'endArtifact',
              src: 'endArtifact',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: {
                target: '#study.postQuestionnaire',
                actions: assign({
                  artifactWallClockMs: ({ event }) => event.output,
                  researchErrorCode: () => null,
                }),
              },
              onError: {
                target: 'endError',
                actions: 'storeEndTimingError',
              },
            },
          },
          endError: {
            on: {
              RETRY_ARTIFACT_END: {
                guard: 'endTimingFailed',
                target: 'retryingEndTiming',
                actions: 'clearResearchError',
              },
            },
          },
          retryingEndTiming: {
            invoke: {
              id: 'retryArtifactEndTiming',
              src: 'retryArtifactTiming',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: {
                target: '#study.postQuestionnaire',
                actions: assign({
                  artifactWallClockMs: ({ event }) => event.output,
                  artifactTimingErrorKind: () => null,
                  researchErrorCode: () => null,
                }),
              },
              onError: {
                target: 'endError',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
        },
      },
      postQuestionnaire: {
        initial: 'editing',
        states: {
          editing: {
            on: {
              SUBMIT_POST: [
                {
                  guard: 'acceptsPostAdvance',
                  actions: ['storeQuestionnaireDraft', 'advanceQuestionnaire'],
                },
                {
                  guard: 'acceptsPostSubmission',
                  target: 'saving',
                  actions: 'prepareQuestionnaireSubmission',
                },
              ],
              BACK_POST: {
                guard: 'acceptsPostBack',
                actions: ['storeQuestionnaireDraft', 'returnToPreviousQuestionnaireSection'],
              },
            },
          },
          saving: {
            invoke: {
              id: 'savePostSubmission',
              src: 'saveInstrumentSubmission',
              input: ({ context }) => ({
                sessionId: requiredSessionId(context),
                submission: requiredPendingSubmission(context),
              }),
              onDone: {
                target: 'routing',
                actions: 'confirmPendingSubmission',
              },
              onError: {
                target: 'error',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          error: {
            on: { RETRY_POST: { target: 'saving', actions: 'clearResearchError' } },
          },
          routing: {
            always: [
              {
                guard: 'nextBlockIsPost',
                target: 'saving',
                actions: 'loadNextQuestionnaireSubmission',
              },
              {
                guard: 'nextBlockIsGuardrail',
                target: '#study.guardrails',
                actions: 'clearQuestionnaireDrafts',
              },
              { target: '#study.sessionClosure', actions: 'clearQuestionnaireDrafts' },
            ],
          },
        },
      },
      guardrails: {
        initial: 'editing',
        states: {
          editing: {
            on: {
              SUBMIT_GUARDRAILS: {
                guard: 'acceptsGuardrailSubmission',
                target: 'saving',
                actions: 'storePendingSubmission',
              },
            },
          },
          saving: {
            invoke: {
              id: 'saveGuardrailSubmission',
              src: 'saveInstrumentSubmission',
              input: ({ context }) => ({
                sessionId: requiredSessionId(context),
                submission: requiredPendingSubmission(context),
              }),
              onDone: {
                target: 'routing',
                actions: 'confirmPendingSubmission',
              },
              onError: {
                target: 'error',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          error: {
            on: {
              RETRY_GUARDRAILS: { target: 'saving', actions: 'clearResearchError' },
            },
          },
          routing: {
            always: [
              { guard: 'nextBlockIsGuardrail', target: 'editing' },
              { guard: 'nextBlockIsPost', target: '#study.postQuestionnaire' },
              { target: '#study.sessionClosure' },
            ],
          },
        },
      },
      sessionClosure: { type: 'final' },
      fatalError: {
        on: { RESET: { target: 'consent', actions: 'resetContext' } },
      },
    },
  });
}

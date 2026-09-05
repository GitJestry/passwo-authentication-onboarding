import {
  artifactIntervalEndRequestSchema,
  artifactIntervalEndResponseSchema,
  artifactIntervalStartRequestSchema,
  artifactIntervalStartResponseSchema,
  confirmArtifactCheckpointRequestSchema,
  confirmArtifactCheckpointResponseSchema,
  followUpInstrument,
  followUpRawTokenSchema,
  followUpSubmissionRequestSchema,
  instrumentRuntimeManifest,
  instrumentSubmissionRequestSchema,
  mainInstrumentBlocks,
  liveQaFollowUpCaseResponseSchema,
  liveQaFollowUpMessagesResponseSchema,
  liveQaFollowUpVerificationResponseSchema,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  SUPPORTIVE_CHECKPOINTS,
  supportiveCheckpointSchema,
  supportiveS08BackedCheckpointSchema,
  supportiveS08ResumeStateSchema,
  WEB_STUDY_REQUEST_HEADER,
  WEB_STUDY_REQUEST_HEADER_VALUE,
  webCreateSessionRequestSchema,
  webCreateSessionResponseSchema,
  webResumeResponseSchema,
  webSegmentTimingRequestSchema,
  webSegmentTimingResponseSchema,
  type InstrumentResponseValue,
  type InstrumentRuntimeItem,
  type InstrumentSubmissionBlock,
  type FollowUpSubmissionRequest,
  type LiveQaFollowUpCaseScenario,
  type LiveQaFollowUpCaseResponse,
  type LiveQaFollowUpMessagesResponse,
  type LiveQaFollowUpPreviewStatus,
  type LiveQaFollowUpVerificationResponse,
  type WebResumeSession,
} from '@passwo/contracts';
import { submitFollowUp } from '../features/follow-up/follow-up-api.js';

const writeHeaders = {
  'content-type': 'application/json',
  [WEB_STUDY_REQUEST_HEADER]: WEB_STUDY_REQUEST_HEADER_VALUE,
} as const;

function validValue(item: InstrumentRuntimeItem): InstrumentResponseValue {
  if (item.type === 'scale') {
    const scales: Readonly<Record<string, { readonly min: number; readonly max: number }>> =
      instrumentRuntimeManifest.scales;
    const scale = item.scale === undefined ? undefined : scales[item.scale];
    if (scale === undefined) throw new Error(`qa-scale-missing-${item.id}`);
    return Math.floor((scale.min + scale.max) / 2);
  }
  if (item.type === 'semanticDifferential') {
    const scale = instrumentRuntimeManifest.scales.ueqSemanticDifferential7;
    return Math.floor((scale.min + scale.max) / 2);
  }
  const optionId = item.options?.[0]?.id;
  if (optionId === undefined) throw new Error(`qa-option-missing-${item.id}`);
  return item.type === 'multiChoice' ? [optionId] : optionId;
}

function validSubmission(block: InstrumentSubmissionBlock) {
  return instrumentSubmissionRequestSchema.parse({
    instrumentId: block.instrumentId,
    sectionId: block.sectionId,
    responses: block.items.map((item) => ({ itemId: item.id, value: validValue(item) })),
  });
}

function responseError(value: unknown): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    'errorCode' in value &&
    typeof value.errorCode === 'string'
  ) {
    return value.errorCode;
  }
  return 'live-qa-request-failed';
}

async function postJson(apiBasePath: string, path: string, body: unknown): Promise<unknown> {
  const response = await fetch(`${apiBasePath}${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: writeHeaders,
    body: JSON.stringify(body),
  });
  const responseBody: unknown =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(responseError(responseBody));
  return responseBody;
}

async function restore(apiBasePath: string): Promise<WebResumeSession | null> {
  return webResumeResponseSchema.parse(await postJson(apiBasePath, '/api/study/session/resume', {}))
    .session;
}

async function startArtifact(apiBasePath: string, sessionId: string) {
  return artifactIntervalStartResponseSchema.parse(
    await postJson(
      apiBasePath,
      `/api/study/sessions/${sessionId}/artifact-intervals`,
      artifactIntervalStartRequestSchema.parse({ requestId: globalThis.crypto.randomUUID() }),
    ),
  );
}

async function skipSupportiveArtifact(
  apiBasePath: string,
  sessionId: string,
  intervalId: string,
  checkpoint: (typeof SUPPORTIVE_CHECKPOINTS)[number],
): Promise<void> {
  const resumesAtOrAfterS08 = supportiveS08BackedCheckpointSchema.safeParse(checkpoint).success;
  const segmentIds = resumesAtOrAfterS08
    ? []
    : checkpoint === 'supportive:S00' || checkpoint === 'supportive:entry'
      ? SUPPORTIVE_ARTIFACT_SEGMENT_IDS
      : SUPPORTIVE_ARTIFACT_SEGMENT_IDS.slice(1);
  let elapsedMs = 1;
  for (const segmentId of segmentIds) {
    webSegmentTimingResponseSchema.parse(
      await postJson(
        apiBasePath,
        `/api/study/sessions/${sessionId}/segment-timing`,
        webSegmentTimingRequestSchema.parse({
          eventId: globalThis.crypto.randomUUID(),
          intervalId,
          segmentId,
          eventType: 'segment-start',
          elapsedMs: null,
        }),
      ),
    );
    elapsedMs += 1;
    webSegmentTimingResponseSchema.parse(
      await postJson(
        apiBasePath,
        `/api/study/sessions/${sessionId}/segment-timing`,
        webSegmentTimingRequestSchema.parse({
          eventId: globalThis.crypto.randomUUID(),
          intervalId,
          segmentId,
          eventType: 'segment-end',
          elapsedMs,
        }),
      ),
    );
  }
  if (!resumesAtOrAfterS08) {
    confirmArtifactCheckpointResponseSchema.parse(
      await postJson(
        apiBasePath,
        `/api/study/sessions/${sessionId}/artifact-checkpoint`,
        confirmArtifactCheckpointRequestSchema.parse({
          intervalId,
          checkpoint: 'supportive:S08',
          resumeState: supportiveS08ResumeStateSchema.parse({
            schemaVersion: 'supportive-s08-resume-v1',
            passphraseIds: {
              campusgram: 'passphrase-01-hyphen',
              masterCampus: 'passphrase-02-hyphen',
              campusEmail: 'passphrase-03-hyphen',
            },
            weakAccountIds: [],
            relationships: [],
          }),
        }),
      ),
    );
  }
  if (checkpoint !== 'supportive:complete') {
    confirmArtifactCheckpointResponseSchema.parse(
      await postJson(
        apiBasePath,
        `/api/study/sessions/${sessionId}/artifact-checkpoint`,
        confirmArtifactCheckpointRequestSchema.parse({
          intervalId,
          checkpoint: 'supportive:complete',
        }),
      ),
    );
  }
  artifactIntervalEndResponseSchema.parse(
    await postJson(
      apiBasePath,
      `/api/study/sessions/${sessionId}/artifact-intervals/end`,
      artifactIntervalEndRequestSchema.parse({ intervalId, elapsedMs: elapsedMs + 1 }),
    ),
  );
}

async function skipReferenceArtifact(
  apiBasePath: string,
  sessionId: string,
  intervalId: string,
): Promise<void> {
  confirmArtifactCheckpointResponseSchema.parse(
    await postJson(
      apiBasePath,
      `/api/study/sessions/${sessionId}/artifact-checkpoint`,
      confirmArtifactCheckpointRequestSchema.parse({
        intervalId,
        checkpoint: 'reference:mfa',
      }),
    ),
  );
  artifactIntervalEndResponseSchema.parse(
    await postJson(
      apiBasePath,
      `/api/study/sessions/${sessionId}/artifact-intervals/end`,
      artifactIntervalEndRequestSchema.parse({ intervalId, elapsedMs: 1 }),
    ),
  );
}

export async function resetLiveQaSession(apiBasePath: string): Promise<void> {
  await postJson(apiBasePath, '/api/qa/reset', {});
}

async function createLiveQaSession(apiBasePath: string, followUpConsent: boolean) {
  await resetLiveQaSession(apiBasePath);
  await restore(apiBasePath);
  return webCreateSessionResponseSchema.parse(
    await postJson(
      apiBasePath,
      '/api/study/sessions',
      webCreateSessionRequestSchema.parse({
        requestId: globalThis.crypto.randomUUID(),
        consentAccepted: true,
        followUpConsent,
        recruitmentId: 'qa',
        recontact: followUpConsent
          ? {
              requestId: globalThis.crypto.randomUUID(),
              email: 'follow-up-browser-qa@example.invalid',
            }
          : null,
      }),
    ),
  );
}

export async function prepareLiveQaArtifact(apiBasePath: string): Promise<void> {
  const session = await createLiveQaSession(apiBasePath, false);
  for (const block of mainInstrumentBlocks) {
    if (block.instrumentId !== 'pre-v1') continue;
    await postJson(
      apiBasePath,
      `/api/study/sessions/${session.sessionId}/instrument-submissions`,
      validSubmission(block),
    );
  }
}

export async function skipLiveQaArtifact(apiBasePath: string): Promise<void> {
  const session = await restore(apiBasePath);
  if (session === null) throw new Error('live-qa-session-missing');
  if (session.resumeTarget !== 'artifact' && session.resumeTarget !== 'artifact-preparation')
    return;
  const artifact = await startArtifact(apiBasePath, session.sessionId);
  if (session.condition === 'supportive') {
    await skipSupportiveArtifact(
      apiBasePath,
      session.sessionId,
      artifact.intervalId,
      supportiveCheckpointSchema.parse(artifact.checkpoint),
    );
    return;
  }
  await skipReferenceArtifact(apiBasePath, session.sessionId, artifact.intervalId);
}

export async function completeLiveQaQuestionnaires(apiBasePath: string): Promise<void> {
  const session = await restore(apiBasePath);
  if (session === null) throw new Error('live-qa-session-missing');
  for (const block of mainInstrumentBlocks.slice(session.nextInstrumentBlockIndex)) {
    if (block.instrumentId === 'pre-v1') continue;
    await postJson(
      apiBasePath,
      `/api/study/sessions/${session.sessionId}/instrument-submissions`,
      validSubmission(block),
    );
  }
}

export async function loadLiveQaFollowUpMessages(
  apiBasePath: string,
): Promise<LiveQaFollowUpMessagesResponse> {
  return liveQaFollowUpMessagesResponseSchema.parse(
    await postJson(apiBasePath, '/api/qa/follow-up/messages', {}),
  );
}

export async function prepareLiveQaFollowUpCase(
  apiBasePath: string,
  scenario: LiveQaFollowUpCaseScenario = 'available',
): Promise<LiveQaFollowUpCaseResponse> {
  const session = await createLiveQaSession(apiBasePath, true);
  for (const block of mainInstrumentBlocks) {
    if (block.instrumentId !== 'pre-v1') continue;
    await postJson(
      apiBasePath,
      `/api/study/sessions/${session.sessionId}/instrument-submissions`,
      validSubmission(block),
    );
  }
  await skipLiveQaArtifact(apiBasePath);
  await completeLiveQaQuestionnaires(apiBasePath);
  return liveQaFollowUpCaseResponseSchema.parse(
    await postJson(apiBasePath, '/api/qa/follow-up/case', {
      sessionId: session.sessionId,
      scenario,
    }),
  );
}

function qaOptionId(
  item: { readonly id: string; readonly options: readonly { readonly id: string }[] },
  optionIndex: number,
): string {
  const option = item.options[optionIndex % item.options.length];
  if (option === undefined) throw new Error(`qa-option-missing-${item.id}`);
  return option.id;
}

function qaSubmission(token: string, optionIndex: number): FollowUpSubmissionRequest {
  const actionResponses = followUpInstrument.questionnaire.items
    .filter((item) => item.type === 'singleChoice')
    .map((item) => ({
      itemId: item.id,
      value: qaOptionId(item, optionIndex),
    }));
  const actionValues = new Map(actionResponses.map(({ itemId, value }) => [itemId, value]));
  return followUpSubmissionRequestSchema.parse({
    token,
    voluntaryConfirmation: true,
    responses: followUpInstrument.questionnaire.items.map((item) => {
      if (item.type === 'singleChoice') {
        return { itemId: item.id, value: actionValues.get(item.id) ?? null };
      }
      const controlling = actionValues.get(item.displayWhen.itemId) ?? null;
      return {
        itemId: item.id,
        value: controlling === item.displayWhen.equals ? qaOptionId(item, optionIndex) : null,
      };
    }),
  });
}

export async function prepareLiveQaFollowUpPreview(
  apiBasePath: string,
  status: LiveQaFollowUpPreviewStatus,
): Promise<string> {
  if (status === 'invalid') return followUpRawTokenSchema.parse('I'.repeat(43));

  const prepared = await prepareLiveQaFollowUpCase(
    apiBasePath,
    status === 'submitted' ? 'available' : status,
  );
  if (status === 'submitted') {
    await submitFollowUp(qaSubmission(prepared.token, 0), apiBasePath);
  }
  return prepared.token;
}

export type LiveQaFollowUpProof = LiveQaFollowUpVerificationResponse & {
  readonly differentSubmissionBlocked: true;
};

export async function verifyLiveQaFollowUpSubmission(
  apiBasePath: string,
  submitted: FollowUpSubmissionRequest,
): Promise<LiveQaFollowUpProof> {
  const firstAlternative = qaSubmission(submitted.token, 0);
  const alternative =
    JSON.stringify(firstAlternative.responses) === JSON.stringify(submitted.responses)
      ? qaSubmission(submitted.token, 1)
      : firstAlternative;
  let differentSubmissionBlocked = false;
  try {
    await submitFollowUp(alternative, apiBasePath);
  } catch (error) {
    if (error instanceof Error && error.message === 'follow-up-already-submitted') {
      differentSubmissionBlocked = true;
    } else {
      throw error;
    }
  }
  if (!differentSubmissionBlocked) throw new Error('live-qa-different-submission-not-blocked');

  const verification = liveQaFollowUpVerificationResponseSchema.parse(
    await postJson(apiBasePath, '/api/qa/follow-up/verification', { token: submitted.token }),
  );
  return { ...verification, differentSubmissionBlocked: true };
}

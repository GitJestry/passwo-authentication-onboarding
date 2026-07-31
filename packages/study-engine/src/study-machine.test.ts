import {
  mainInstrumentBlocks,
  type InstrumentSubmissionRequest,
  type StudyCondition,
} from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { createStudyMachine, type StudyEvent, type StudyRuntimePorts } from './study-machine.js';

function runtimePorts(
  condition: StudyCondition,
  saveInstrumentSubmission: StudyRuntimePorts['saveInstrumentSubmission'] = async () => {},
): StudyRuntimePorts {
  return {
    createSession: async () => ({
      sessionId: 'a185bbd8-2088-47d2-b45a-924c8d8778ea',
      participantCode: 'PW-AB12CD34',
      condition,
      assignmentMode: condition === 'supportive' ? 'forced-supportive' : 'forced-reference',
      guardrailFormId: 'F1',
    }),
    registerRecontact: async () => {},
    abandonRecontact: async () => {},
    saveInstrumentSubmission,
    startArtifact: async () => {},
    endArtifact: async () => 325,
    recordArtifactVisibility: async () => {},
    retryArtifactTiming: async () => null,
    markIncompleteReload: () => {},
    observeArtifactLifecycle: () => () => {},
    completeSession: async () => {},
  };
}

type StudyActor = ReturnType<typeof createActor<ReturnType<typeof createStudyMachine>>>;

async function waitForState(actor: StudyActor, predicate: () => boolean): Promise<void> {
  if (predicate()) return;

  await new Promise<void>((resolve) => {
    const subscription = actor.subscribe(() => {
      if (predicate()) {
        subscription.unsubscribe();
        resolve();
      }
    });
  });
}

async function startAtPreQuestionnaire(ports: StudyRuntimePorts): Promise<StudyActor> {
  const actor = createActor(createStudyMachine(ports));
  actor.start();
  actor.send({
    type: 'ACCEPT_CONSENT',
    followUpConsent: true,
    recontact: {
      email: 'person@example.org',
      requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
    },
  });
  await waitForState(actor, () => actor.getSnapshot().matches({ preQuestionnaire: 'editing' }));
  return actor;
}

function submissionAt(index: number): InstrumentSubmissionRequest {
  const block = mainInstrumentBlocks[index];
  if (block === undefined) {
    throw new Error(`Missing instrument block at index ${index}`);
  }
  return {
    instrumentId: block.instrumentId,
    sectionId: block.sectionId,
    responses: block.items.map((item) => ({ itemId: item.id, value: null })),
  };
}

function submitEvent(submission: InstrumentSubmissionRequest): StudyEvent {
  const payload = {
    sectionId: submission.sectionId,
    responses: submission.responses,
  };
  switch (submission.instrumentId) {
    case 'pre-v1':
      return { type: 'SUBMIT_PRE', payload: { ...payload, instrumentId: 'pre-v1' } };
    case 'post-v1':
      return { type: 'SUBMIT_POST', payload: { ...payload, instrumentId: 'post-v1' } };
    case 'guardrail-v2':
      return {
        type: 'SUBMIT_GUARDRAILS',
        payload: { ...payload, instrumentId: 'guardrail-v2' },
      };
    case 'post-open-v1':
      return {
        type: 'SUBMIT_POST_OPEN',
        payload: { ...payload, instrumentId: 'post-open-v1' },
      };
  }
}

async function submitCurrentBlock(actor: StudyActor): Promise<void> {
  const cursor = actor.getSnapshot().context.instrumentBlockCursor;
  actor.send(submitEvent(submissionAt(cursor)));
  await waitForState(actor, () => actor.getSnapshot().context.instrumentBlockCursor === cursor + 1);
}

async function submitBlocksFor(actor: StudyActor, instrumentId: string): Promise<void> {
  while (
    mainInstrumentBlocks[actor.getSnapshot().context.instrumentBlockCursor]?.instrumentId ===
    instrumentId
  ) {
    await submitCurrentBlock(actor);
  }
}

describe('studyMachine', () => {
  it('keeps recontact data only for retry and clears it after success', async () => {
    let registrationAttempts = 0;
    const registrationRequests: unknown[] = [];
    const retryPorts = runtimePorts('supportive');
    retryPorts.registerRecontact = async (_sessionId, request) => {
      registrationRequests.push(request);
      registrationAttempts += 1;
      if (registrationAttempts === 1) throw new Error('recontact-write-failed');
    };
    const retryActor = createActor(createStudyMachine(retryPorts));
    retryActor.start();
    retryActor.send({
      type: 'ACCEPT_CONSENT',
      followUpConsent: true,
      recontact: {
        email: 'person@example.org',
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      },
    });
    await waitForState(retryActor, () =>
      retryActor.getSnapshot().matches({ recontactRegistration: 'error' }),
    );

    expect(retryActor.getSnapshot().context.condition).toBe('supportive');
    expect(retryActor.getSnapshot().context.recontactEmail).toBe('person@example.org');
    retryActor.send({ type: 'RETRY_RECONTACT' });
    await waitForState(retryActor, () =>
      retryActor.getSnapshot().matches({ preQuestionnaire: 'editing' }),
    );
    expect(registrationRequests).toEqual([
      {
        email: 'person@example.org',
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      },
      {
        email: 'person@example.org',
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      },
    ]);
    expect(retryActor.getSnapshot().context.recontactEmail).toBeNull();
    expect(retryActor.getSnapshot().context.recontactRequestId).toBeNull();
    retryActor.stop();
  });

  it('continues without a recontact registration when it was not requested', async () => {
    let registrationAttempts = 0;
    let createdWithFollowUpConsent: boolean | null = null;
    const ports = runtimePorts('reference');
    const createSession = ports.createSession;
    ports.createSession = async (followUpConsent) => {
      createdWithFollowUpConsent = followUpConsent;
      return createSession(followUpConsent);
    };
    ports.registerRecontact = async () => {
      registrationAttempts += 1;
    };
    const actor = createActor(createStudyMachine(ports));
    actor.start();
    actor.send({ type: 'ACCEPT_CONSENT', followUpConsent: false, recontact: null });

    await waitForState(actor, () => actor.getSnapshot().matches({ preQuestionnaire: 'editing' }));

    expect(registrationAttempts).toBe(0);
    expect(createdWithFollowUpConsent).toBe(false);
    expect(actor.getSnapshot().context.recontactEmail).toBeNull();
    expect(actor.getSnapshot().context.recontactRequestId).toBeNull();
    actor.stop();
  });

  it('continues without follow-up after a registration error and clears recontact data', async () => {
    const ports = runtimePorts('supportive');
    let abandonedSessionId: string | null = null;
    ports.registerRecontact = async () => {
      throw new Error('recontact-write-failed');
    };
    ports.abandonRecontact = async (sessionId) => {
      abandonedSessionId = sessionId;
    };
    const actor = createActor(createStudyMachine(ports));
    actor.start();
    actor.send({
      type: 'ACCEPT_CONSENT',
      followUpConsent: true,
      recontact: {
        email: 'person@example.org',
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      },
    });
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ recontactRegistration: 'error' }),
    );

    actor.send({ type: 'CONTINUE_WITHOUT_FOLLOW_UP' });
    await waitForState(actor, () => actor.getSnapshot().matches({ preQuestionnaire: 'editing' }));

    expect(abandonedSessionId).toBe('a185bbd8-2088-47d2-b45a-924c8d8778ea');
    expect(actor.getSnapshot().context.followUpConsent).toBe(false);
    expect(actor.getSnapshot().context.recontactEmail).toBeNull();
    expect(actor.getSnapshot().context.recontactRequestId).toBeNull();
    actor.stop();
  });

  it('keeps the submitted payload pending and retries that identical payload', async () => {
    let attempts = 0;
    const savedSubmissions: InstrumentSubmissionRequest[] = [];
    const actor = await startAtPreQuestionnaire(
      runtimePorts('supportive', async (_sessionId, submission) => {
        savedSubmissions.push(submission);
        attempts += 1;
        if (attempts === 1) throw new Error('research-data-write-failed');
      }),
    );
    const submission = {
      instrumentId: 'pre-v1',
      sectionId: 'sample',
      responses: [
        { itemId: 'PRE_ROLE', value: 'undergraduate' },
        { itemId: 'PRE_FIELD', value: 'stem' },
        { itemId: 'PRE_AGE', value: 'age_18_25' },
        { itemId: 'PRE_GENDER', value: null },
      ],
    } satisfies Extract<StudyEvent, { type: 'SUBMIT_PRE' }>['payload'];

    expect(actor.getSnapshot().context.guardrailFormId).toBe('F1');
    actor.send({ type: 'SUBMIT_PRE', payload: submission });
    await waitForState(actor, () => actor.getSnapshot().matches({ preQuestionnaire: 'error' }));

    expect(actor.getSnapshot().context.pendingSubmission).toBe(submission);
    expect(actor.getSnapshot().context.instrumentBlockCursor).toBe(0);
    expect(savedSubmissions[0]).toBe(submission);

    actor.send({ type: 'RETRY_PRE' });
    await waitForState(
      actor,
      () =>
        actor.getSnapshot().matches({ preQuestionnaire: 'editing' }) &&
        actor.getSnapshot().context.instrumentBlockCursor === 1,
    );

    expect(savedSubmissions).toHaveLength(2);
    expect(savedSubmissions[1]).toBe(submission);
    expect(actor.getSnapshot().context.pendingSubmission).toBeNull();
    actor.stop();
  });

  it('rejects submissions that skip the currently expected manifest block', async () => {
    const savedSubmissions: InstrumentSubmissionRequest[] = [];
    const actor = await startAtPreQuestionnaire(
      runtimePorts('supportive', async (_sessionId, submission) => {
        savedSubmissions.push(submission);
      }),
    );

    actor.send(submitEvent(submissionAt(1)));

    expect(actor.getSnapshot().matches({ preQuestionnaire: 'editing' })).toBe(true);
    expect(actor.getSnapshot().context.instrumentBlockCursor).toBe(0);
    expect(actor.getSnapshot().context.pendingSubmission).toBeNull();
    expect(savedSubmissions).toHaveLength(0);

    await submitCurrentBlock(actor);
    actor.send(submitEvent(submissionAt(2)));

    expect(actor.getSnapshot().matches({ preQuestionnaire: 'editing' })).toBe(true);
    expect(actor.getSnapshot().context.instrumentBlockCursor).toBe(1);
    expect(actor.getSnapshot().context.pendingSubmission).toBeNull();
    expect(savedSubmissions.map(({ sectionId }) => sectionId)).toEqual(['sample']);
    actor.stop();
  });

  it('requires recognition, scenarios, and post-open before entering session closure', async () => {
    const savedSubmissions: InstrumentSubmissionRequest[] = [];
    const actor = await startAtPreQuestionnaire(
      runtimePorts('reference', async (_sessionId, submission) => {
        savedSubmissions.push(submission);
      }),
    );

    await submitBlocksFor(actor, 'pre-v1');
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ artifactLifecycle: 'preparing' }),
    );
    actor.send({ type: 'START_ARTIFACT' });
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ artifactLifecycle: { artifact: 'reference' } }),
    );
    actor.send({ type: 'ARTIFACT_COMPLETED' });
    await waitForState(actor, () => actor.getSnapshot().matches({ postQuestionnaire: 'editing' }));

    await submitBlocksFor(actor, 'post-v1');
    await waitForState(actor, () => actor.getSnapshot().matches({ guardrails: 'editing' }));
    expect(mainInstrumentBlocks[actor.getSnapshot().context.instrumentBlockCursor]?.sectionId).toBe(
      'recognition',
    );

    await submitCurrentBlock(actor);
    expect(mainInstrumentBlocks[actor.getSnapshot().context.instrumentBlockCursor]?.sectionId).toBe(
      'scenarios',
    );

    const postOpen = mainInstrumentBlocks.find(
      ({ instrumentId }) => instrumentId === 'post-open-v1',
    );
    if (postOpen === undefined) throw new Error('Missing post-open block');
    actor.send(
      submitEvent({
        instrumentId: postOpen.instrumentId,
        sectionId: postOpen.sectionId,
        responses: postOpen.items.map((item) => ({ itemId: item.id, value: null })),
      }),
    );

    expect(actor.getSnapshot().matches({ guardrails: 'editing' })).toBe(true);
    expect(mainInstrumentBlocks[actor.getSnapshot().context.instrumentBlockCursor]?.sectionId).toBe(
      'scenarios',
    );

    await submitCurrentBlock(actor);
    await waitForState(actor, () => actor.getSnapshot().matches({ postOpen: 'editing' }));
    actor.send({ type: 'SESSION_CLOSURE_ACKNOWLEDGED' });
    expect(actor.getSnapshot().matches({ postOpen: 'editing' })).toBe(true);

    await submitCurrentBlock(actor);
    await waitForState(actor, () => actor.getSnapshot().matches('sessionClosure'));

    expect(actor.getSnapshot().context.pendingSubmission).toBeNull();
    expect(savedSubmissions.at(-1)?.instrumentId).toBe('post-open-v1');
    actor.stop();
  });
});

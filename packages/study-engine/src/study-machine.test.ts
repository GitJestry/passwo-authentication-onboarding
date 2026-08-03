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
      deletionCode: 'PW-AB12-CD34-EF56-7890',
      condition,
      assignmentMode: condition === 'supportive' ? 'forced-supportive' : 'forced-reference',
      guardrailFormId: 'F1',
    }),
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
    recontactConsentAccepted: true,
    email: 'person@example.org',
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

async function completeQuestionnaire(
  actor: StudyActor,
  instrumentId: 'pre-v1' | 'post-v1',
): Promise<void> {
  while (
    mainInstrumentBlocks[actor.getSnapshot().context.questionnaireBlockCursor]?.instrumentId ===
    instrumentId
  ) {
    const pageCursor = actor.getSnapshot().context.questionnaireBlockCursor;
    actor.send(submitEvent(submissionAt(pageCursor)));
    if (mainInstrumentBlocks[pageCursor + 1]?.instrumentId === instrumentId) continue;
    await waitForState(
      actor,
      () =>
        mainInstrumentBlocks[actor.getSnapshot().context.instrumentBlockCursor]?.instrumentId !==
        instrumentId,
    );
  }
}

describe('studyMachine', () => {
  it('keeps the email only for an atomic session retry and clears it after success', async () => {
    let creationAttempts = 0;
    const creationEmails: string[] = [];
    const retryPorts = runtimePorts('supportive');
    const createSession = retryPorts.createSession;
    retryPorts.createSession = async (email) => {
      creationEmails.push(email);
      creationAttempts += 1;
      if (creationAttempts === 1) throw new Error('atomic-session-write-failed');
      return createSession(email);
    };
    const retryActor = createActor(createStudyMachine(retryPorts));
    retryActor.start();
    retryActor.send({
      type: 'ACCEPT_CONSENT',
      recontactConsentAccepted: true,
      email: 'person@example.org',
    });
    await waitForState(retryActor, () => retryActor.getSnapshot().matches('sessionError'));

    expect(retryActor.getSnapshot().context.sessionId).toBeNull();
    expect(retryActor.getSnapshot().context.recontactEmail).toBe('person@example.org');
    retryActor.send({ type: 'RETRY_SESSION' });
    await waitForState(retryActor, () =>
      retryActor.getSnapshot().matches({ preQuestionnaire: 'editing' }),
    );
    expect(creationEmails).toEqual(['person@example.org', 'person@example.org']);
    expect(retryActor.getSnapshot().context.recontactEmail).toBeNull();
    retryActor.stop();
  });

  it('does not create a session without valid required contact data', () => {
    let creationAttempts = 0;
    const ports = runtimePorts('reference');
    ports.createSession = async () => {
      creationAttempts += 1;
      throw new Error('must-not-run');
    };
    const actor = createActor(createStudyMachine(ports));
    actor.start();
    actor.send({
      type: 'ACCEPT_CONSENT',
      recontactConsentAccepted: true,
      email: 'not-an-email',
    });

    expect(actor.getSnapshot().matches('consent')).toBe(true);
    expect(creationAttempts).toBe(0);
    expect(actor.getSnapshot().context.recontactEmail).toBeNull();
    actor.stop();
  });

  it('cannot bypass an atomic session error', async () => {
    const ports = runtimePorts('supportive');
    ports.createSession = async () => {
      throw new Error('atomic-session-write-failed');
    };
    const actor = createActor(createStudyMachine(ports));
    actor.start();
    actor.send({
      type: 'ACCEPT_CONSENT',
      recontactConsentAccepted: true,
      email: 'person@example.org',
    });
    await waitForState(actor, () => actor.getSnapshot().matches('sessionError'));

    actor.send({ type: 'START_ARTIFACT' });
    expect(actor.getSnapshot().matches('sessionError')).toBe(true);
    expect(actor.getSnapshot().context.sessionId).toBeNull();
    expect(actor.getSnapshot().context.recontactEmail).toBe('person@example.org');
    actor.stop();
  });

  it('keeps the first questionnaire payload pending and retries it unchanged', async () => {
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
      ],
    } satisfies Extract<StudyEvent, { type: 'SUBMIT_PRE' }>['payload'];

    expect(actor.getSnapshot().context.guardrailFormId).toBe('F1');
    actor.send({ type: 'SUBMIT_PRE', payload: submission });
    actor.send(submitEvent(submissionAt(1)));
    actor.send(submitEvent(submissionAt(2)));
    await waitForState(actor, () => actor.getSnapshot().matches({ preQuestionnaire: 'error' }));

    expect(actor.getSnapshot().context.pendingSubmission).toBe(submission);
    expect(actor.getSnapshot().context.instrumentBlockCursor).toBe(0);
    expect(savedSubmissions[0]).toBe(submission);

    actor.send({ type: 'RETRY_PRE' });
    await waitForState(
      actor,
      () => actor.getSnapshot().matches({ artifactLifecycle: 'preparing' }),
    );

    expect(savedSubmissions).toHaveLength(4);
    expect(savedSubmissions[1]).toBe(submission);
    expect(actor.getSnapshot().context.pendingSubmission).toBeNull();
    expect(actor.getSnapshot().context.questionnaireDrafts).toEqual([]);
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

    actor.send(submitEvent(submissionAt(0)));
    actor.send(submitEvent(submissionAt(2)));

    expect(actor.getSnapshot().matches({ preQuestionnaire: 'editing' })).toBe(true);
    expect(actor.getSnapshot().context.instrumentBlockCursor).toBe(0);
    expect(actor.getSnapshot().context.questionnaireBlockCursor).toBe(1);
    expect(actor.getSnapshot().context.pendingSubmission).toBeNull();
    expect(savedSubmissions).toHaveLength(0);
    actor.stop();
  });

  it('keeps questionnaire drafts across back and forward navigation and saves the latest values', async () => {
    const savedSubmissions: InstrumentSubmissionRequest[] = [];
    const actor = await startAtPreQuestionnaire(
      runtimePorts('supportive', async (_sessionId, submission) => {
        savedSubmissions.push(submission);
      }),
    );
    const initialSample = submissionAt(0);
    const revisedSample = {
      ...initialSample,
      responses: initialSample.responses.map((response) =>
        response.itemId === 'PRE_ROLE' ? { ...response, value: 'undergraduate' } : response,
      ),
    };

    actor.send(submitEvent(initialSample));
    actor.send({ type: 'BACK_PRE', payload: { ...submissionAt(1), instrumentId: 'pre-v1' } });

    expect(actor.getSnapshot().context.questionnaireBlockCursor).toBe(0);
    expect(actor.getSnapshot().context.questionnaireDrafts[1]?.sectionId).toBe('experience');

    actor.send(submitEvent(revisedSample));
    actor.send(submitEvent(submissionAt(1)));
    actor.send(submitEvent(submissionAt(2)));
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ artifactLifecycle: 'preparing' }),
    );

    expect(savedSubmissions.map(({ sectionId }) => sectionId)).toEqual([
      'sample',
      'experience',
      'self_efficacy',
    ]);
    expect(savedSubmissions[0]).toEqual(revisedSample);
    expect(actor.getSnapshot().context.questionnaireDrafts).toEqual([]);
    actor.stop();
  });

  it('requires scenarios, recognition, post-guardrail items, and post-open before closure', async () => {
    const savedSubmissions: InstrumentSubmissionRequest[] = [];
    const actor = await startAtPreQuestionnaire(
      runtimePorts('reference', async (_sessionId, submission) => {
        savedSubmissions.push(submission);
      }),
    );

    await completeQuestionnaire(actor, 'pre-v1');
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ artifactLifecycle: 'preparing' }),
    );
    actor.send({ type: 'START_ARTIFACT' });
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ artifactLifecycle: { artifact: 'reference' } }),
    );
    actor.send({ type: 'ARTIFACT_COMPLETED' });
    await waitForState(actor, () => actor.getSnapshot().matches({ postQuestionnaire: 'editing' }));

    await completeQuestionnaire(actor, 'post-v1');
    await waitForState(actor, () => actor.getSnapshot().matches({ guardrails: 'editing' }));
    expect(mainInstrumentBlocks[actor.getSnapshot().context.instrumentBlockCursor]?.sectionId).toBe(
      'scenarios',
    );

    await submitCurrentBlock(actor);
    expect(mainInstrumentBlocks[actor.getSnapshot().context.instrumentBlockCursor]?.sectionId).toBe(
      'recognition',
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
      'recognition',
    );

    await submitCurrentBlock(actor);
    await waitForState(actor, () => actor.getSnapshot().matches({ postQuestionnaire: 'editing' }));
    expect(mainInstrumentBlocks[actor.getSnapshot().context.instrumentBlockCursor]?.sectionId).toBe(
      'self_efficacy',
    );

    await completeQuestionnaire(actor, 'post-v1');
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

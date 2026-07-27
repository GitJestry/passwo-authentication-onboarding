import type { PlaceholderInstrumentId, StudyCondition } from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { createStudyMachine, type StudyRuntimePorts } from './study-machine.js';

function runtimePorts(condition: StudyCondition): StudyRuntimePorts {
  return {
    createSession: async () => ({
      sessionId: 'a185bbd8-2088-47d2-b45a-924c8d8778ea',
      participantCode: 'PW-AB12CD34',
      condition,
      assignmentMode: condition === 'supportive' ? 'forced-supportive' : 'forced-reference',
    }),
    savePlaceholder: async (_sessionId: string, _instrumentId: PlaceholderInstrumentId) => {},
    startArtifact: async () => {},
    endArtifact: async () => 325,
    recordArtifactVisibility: async () => {},
    retryArtifactTiming: async () => null,
    markIncompleteReload: () => {},
    observeArtifactLifecycle: () => () => {},
    completeSession: async () => {},
  };
}

async function waitForState(
  actor: ReturnType<typeof createActor<ReturnType<typeof createStudyMachine>>>,
  predicate: () => boolean,
): Promise<void> {
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

describe('studyMachine', () => {
  it('keeps a failed research write in retry state and continues after the retry', async () => {
    let attempts = 0;
    const actor = createActor(
      createStudyMachine({
        ...runtimePorts('supportive'),
        savePlaceholder: async () => {
          attempts += 1;
          if (attempts === 1) throw new Error('research-data-write-failed');
        },
      }),
    );
    actor.start();
    actor.send({ type: 'ACCEPT_CONSENT' });
    await waitForState(actor, () => actor.getSnapshot().matches('preQuestionnaire'));
    actor.send({ type: 'SUBMIT_PRE' });
    await waitForState(actor, () => actor.getSnapshot().matches({ preQuestionnaire: 'error' }));

    expect(actor.getSnapshot().context.researchErrorCode).toBe('research-data-write-failed');

    actor.send({ type: 'RETRY_PRE' });
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ artifactLifecycle: { artifact: 'supportive' } }),
    );
    expect(attempts).toBe(2);
  });
});

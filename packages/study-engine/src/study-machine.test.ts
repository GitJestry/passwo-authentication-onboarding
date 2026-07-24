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
    recordArtifactVisibility: async (_sessionId: string, _visible: boolean) => {},
    markIncompleteReload: (_sessionId: string) => {},
    observeArtifactLifecycle: (_input) => () => {},
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
  it.each(['supportive', 'reference'] as const)(
    'runs the complete %s path from server assignment',
    async (condition) => {
      const actor = createActor(createStudyMachine(runtimePorts(condition)));
      actor.start();

      actor.send({ type: 'ACCEPT_CONSENT' });
      await waitForState(actor, () => actor.getSnapshot().matches('preQuestionnaire'));
      actor.send({ type: 'SUBMIT_PRE' });
      await waitForState(actor, () => actor.getSnapshot().matches('nameEntry'));
      actor.send({ type: 'DISPLAY_NAME_ENTERED', displayName: '  Alex  ' });
      await waitForState(actor, () =>
        actor.getSnapshot().matches({ artifactLifecycle: { artifact: condition } }),
      );

      expect(actor.getSnapshot().context.displayName).toBe('Alex');
      expect(actor.getSnapshot().hasTag('artifactActive')).toBe(true);

      actor.send({ type: 'ARTIFACT_COMPLETED' });
      expect(actor.getSnapshot().context.displayName).toBeNull();
      await waitForState(actor, () => actor.getSnapshot().matches('postQuestionnaire'));
      expect(actor.getSnapshot().hasTag('artifactActive')).toBe(false);
      actor.send({ type: 'SUBMIT_POST' });
      await waitForState(actor, () => actor.getSnapshot().matches('guardrails'));
      actor.send({ type: 'SUBMIT_GUARDRAILS' });
      await waitForState(actor, () => actor.getSnapshot().matches('debrief'));
      actor.send({ type: 'DEBRIEF_ACKNOWLEDGED' });
      await waitForState(actor, () => actor.getSnapshot().matches('complete'));

      expect(actor.getSnapshot().context.artifactWallClockMs).toBe(325);
    },
  );

  it('keeps a failed research write on a visible retry state', async () => {
    let attempts = 0;
    const ports = runtimePorts('supportive');
    const actor = createActor(
      createStudyMachine({
        ...ports,
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
    await waitForState(actor, () => actor.getSnapshot().matches('nameEntry'));
  });
});

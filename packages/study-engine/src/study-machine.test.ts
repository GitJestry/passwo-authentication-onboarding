import type { PlaceholderInstrumentId, StudyCondition } from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import {
  type ArtifactLifecycleInput,
  createStudyMachine,
  type StudyRuntimePorts,
} from './study-machine.js';

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
    retryArtifactTiming: async (_sessionId: string) => null,
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

function requiredLifecycleInput(input: ArtifactLifecycleInput | null): ArtifactLifecycleInput {
  if (input === null) throw new Error('Artifact lifecycle observer was not started');
  return input;
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
      await waitForState(actor, () =>
        actor.getSnapshot().matches({ artifactLifecycle: { artifact: condition } }),
      );

      expect(actor.getSnapshot().context).not.toHaveProperty('displayName');
      expect(actor.getSnapshot().hasTag('artifactActive')).toBe(true);

      actor.send({ type: 'ARTIFACT_COMPLETED' });
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
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ artifactLifecycle: { artifact: 'supportive' } }),
    );
  });

  it('retries a failed artifact start through the timing queue', async () => {
    let startAttempts = 0;
    let retryCalls = 0;
    const ports = runtimePorts('supportive');
    const actor = createActor(
      createStudyMachine({
        ...ports,
        startArtifact: async () => {
          startAttempts += 1;
          throw new Error('artifact-start-write-failed');
        },
        retryArtifactTiming: async () => {
          retryCalls += 1;
          return null;
        },
      }),
    );
    actor.start();
    actor.send({ type: 'ACCEPT_CONSENT' });
    await waitForState(actor, () => actor.getSnapshot().matches('preQuestionnaire'));
    actor.send({ type: 'SUBMIT_PRE' });
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ artifactLifecycle: 'startError' }),
    );

    actor.send({ type: 'RETRY_ARTIFACT_START' });
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ artifactLifecycle: { artifact: 'supportive' } }),
    );

    expect(startAttempts).toBe(1);
    expect(retryCalls).toBe(1);
  });

  it('keeps the supportive segment mounted while a failed visibility write is retried', async () => {
    let lifecycleInput: ArtifactLifecycleInput | null = null;
    let visibilityAttempts = 0;
    let endCalls = 0;
    let retryCalls = 0;
    const ports = runtimePorts('supportive');
    const actor = createActor(
      createStudyMachine({
        ...ports,
        recordArtifactVisibility: async () => {
          visibilityAttempts += 1;
          throw new Error('visibility-write-failed');
        },
        retryArtifactTiming: async () => {
          retryCalls += 1;
          return null;
        },
        endArtifact: async () => {
          endCalls += 1;
          return 325;
        },
        observeArtifactLifecycle: (input) => {
          lifecycleInput = input;
          return () => {};
        },
      }),
    );
    actor.start();
    actor.send({ type: 'ACCEPT_CONSENT' });
    await waitForState(actor, () => actor.getSnapshot().matches('preQuestionnaire'));
    actor.send({ type: 'SUBMIT_PRE' });
    await waitForState(actor, () =>
      actor.getSnapshot().matches({ artifactLifecycle: { artifact: 'supportive' } }),
    );

    const lifecycle = requiredLifecycleInput(lifecycleInput);
    lifecycle.onVisibilityChange(false);
    actor.send({ type: 'ARTIFACT_COMPLETED' });
    await waitForState(
      actor,
      () => actor.getSnapshot().context.artifactTimingErrorKind === 'visibility',
    );

    expect(actor.getSnapshot().matches({ artifactLifecycle: { artifact: 'supportive' } })).toBe(
      true,
    );
    expect(actor.getSnapshot().context.artifactTimingErrorKind).toBe('visibility');
    expect(actor.getSnapshot().context.pendingArtifactTimingWrites).toBe(1);
    expect(actor.getSnapshot().context.artifactCompletionRequested).toBe(true);
    expect(actor.getSnapshot().context.researchErrorCode).toBe('visibility-write-failed');
    expect(visibilityAttempts).toBe(1);
    expect(endCalls).toBe(0);

    actor.send({ type: 'RETRY_ARTIFACT_VISIBILITY' });
    await waitForState(actor, () => actor.getSnapshot().matches('postQuestionnaire'));

    expect(retryCalls).toBe(1);
    expect(endCalls).toBe(1);
    expect(actor.getSnapshot().context.pendingArtifactTimingWrites).toBe(0);
    expect(actor.getSnapshot().context.artifactTimingErrorKind).toBeNull();
  });
});

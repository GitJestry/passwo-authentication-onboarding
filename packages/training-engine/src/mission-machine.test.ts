import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { canContinueMission, getCurrentMissionStep, missionMachine } from './mission-machine.js';

const s00Mission = {
  id: 'S00-intro',
  segmentId: 'S00',
  sectionId: 'passwords',
  requiresSafetyAcknowledgement: true,
  steps: [
    {
      id: 'arrival',
      narrationId: 's00.arrival',
      animation: {
        id: 'passwo-arrival',
        steps: [],
        reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
        maxDurationMs: 0,
      },
    },
  ],
} as const;

describe('missionMachine', () => {
  it('requires an animation result before replay or continue', () => {
    const actor = createActor(missionMachine);
    actor.start();
    actor.send({ type: 'START', mission: s00Mission });

    expect(actor.getSnapshot().matches({ active: 'animating' })).toBe(true);
    expect(getCurrentMissionStep(actor.getSnapshot().context)?.id).toBe('arrival');

    actor.send({ type: 'ANIMATION_FINISHED' });
    expect(actor.getSnapshot().matches({ active: 'awaitingDecision' })).toBe(true);
    expect(canContinueMission(actor.getSnapshot().context)).toBe(false);

    actor.send({ type: 'CONTINUE' });
    expect(actor.getSnapshot().matches({ active: 'awaitingDecision' })).toBe(true);

    actor.send({ type: 'SET_SAFETY_ACKNOWLEDGED', acknowledged: true });
    expect(canContinueMission(actor.getSnapshot().context)).toBe(true);
    actor.send({ type: 'CONTINUE' });
    expect(actor.getSnapshot().status).toBe('done');
  });
});

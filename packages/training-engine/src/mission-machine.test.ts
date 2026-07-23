import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { getCurrentMissionStep, missionMachine } from './mission-machine.js';

describe('missionMachine', () => {
  it('requires an animation result before replay or continue', () => {
    const actor = createActor(missionMachine);
    actor.start();
    actor.send({
      type: 'START',
      missionId: 'S00-intro',
      steps: [{ id: 'arrival', animationSequenceId: 'passwo-arrival', narrationId: 's00.arrival' }],
    });

    expect(actor.getSnapshot().matches({ active: 'animating' })).toBe(true);
    expect(getCurrentMissionStep(actor.getSnapshot().context)?.id).toBe('arrival');

    actor.send({ type: 'ANIMATION_FINISHED' });
    expect(actor.getSnapshot().matches({ active: 'awaitingDecision' })).toBe(true);

    actor.send({ type: 'CONTINUE' });
    expect(actor.getSnapshot().status).toBe('done');
  });
});

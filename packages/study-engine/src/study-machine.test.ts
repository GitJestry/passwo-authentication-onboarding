import { createActor } from 'xstate';
import { describe, expect, it } from 'vitest';
import { studyMachine } from './study-machine.js';

describe('studyMachine', () => {
  it('routes by server-assigned condition and removes the display name after the artifact', () => {
    const actor = createActor(studyMachine);
    actor.start();

    actor.send({ type: 'ACCEPT_CONSENT' });
    actor.send({
      type: 'SESSION_CREATED',
      sessionId: 'a185bbd8-2088-47d2-b45a-924c8d8778ea',
      participantCode: 'PW-AB12CD34',
      condition: 'supportive',
      assignmentMode: 'forced-supportive',
    });
    actor.send({ type: 'PRE_COMPLETED' });
    actor.send({ type: 'DISPLAY_NAME_ENTERED', displayName: '  Alex  ' });

    expect(actor.getSnapshot().matches({ artifact: 'supportive' })).toBe(true);
    expect(actor.getSnapshot().context.displayName).toBe('Alex');

    actor.send({ type: 'ARTIFACT_COMPLETED' });

    expect(actor.getSnapshot().matches('postQuestionnaire')).toBe(true);
    expect(actor.getSnapshot().context.displayName).toBeNull();
  });
});

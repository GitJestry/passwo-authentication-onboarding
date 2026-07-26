import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { getConfiguredAccountCount, passwordModuleMachine } from './password-module-machine.js';

function createModuleActor() {
  const actor = createActor(passwordModuleMachine, {
    input: { accountIds: ['campus-id', 'campus-mail', 'campus-board-archive'] },
  });
  actor.start();
  actor.send({ type: 'S00_COMPLETED' });
  actor.send({ type: 'S01_START_RECORDED' });
  return actor;
}

describe('passwordModuleMachine', () => {
  it('requires S00 to complete before S01 can be entered', () => {
    const actor = createActor(passwordModuleMachine, {
      input: { accountIds: ['campus-id', 'campus-mail', 'campus-board-archive'] },
    });
    actor.start();

    actor.send({ type: 'S01_START_RECORDED' });

    expect(actor.getSnapshot().matches('s00')).toBe(true);
  });

  it('moves from S00 through S01 and S02 to module complete', () => {
    const actor = createModuleActor();

    expect(actor.getSnapshot().matches({ s01: 'editing' })).toBe(true);
    for (const accountId of ['campus-id', 'campus-mail', 'campus-board-archive'] as const) {
      actor.send({ type: 'SET_PASSWORD_VALUE', accountId, value: accountId });
    }
    actor.send({ type: 'CONFIGURE_ACCOUNTS' });
    actor.send({ type: 'CONTINUE' });
    actor.send({ type: 'S01_END_RECORDED' });

    expect(actor.getSnapshot().matches({ s02: 'starting' })).toBe(true);
    actor.send({ type: 'S02_START_RECORDED' });
    actor.send({ type: 'CONTINUE' });
    expect(actor.getSnapshot().matches({ s02: 'active' })).toBe(true);
    actor.send({ type: 'S02_CONTENT_COMPLETED' });
    actor.send({ type: 'CONTINUE' });
    actor.send({ type: 'S02_END_RECORDED' });

    expect(actor.getSnapshot().matches('complete')).toBe(true);
    expect(actor.getSnapshot().context.passwordValues).toEqual({
      'campus-id': '',
      'campus-mail': '',
      'campus-board-archive': '',
    });
  });

  it('keeps all password values exact throughout S02 and discards them only after S02 end', () => {
    const actor = createModuleActor();
    const values = {
      'campus-id': '  id !?  ',
      'campus-mail': '  mail #  ',
      'campus-board-archive': '  board $  ',
    } as const;
    for (const [accountId, value] of Object.entries(values)) {
      actor.send({ type: 'SET_PASSWORD_VALUE', accountId, value });
    }
    actor.send({ type: 'CONFIGURE_ACCOUNTS' });
    actor.send({ type: 'CONTINUE' });
    actor.send({ type: 'S01_END_RECORDED' });

    expect(actor.getSnapshot().context.passwordValues).toEqual(values);
    actor.send({ type: 'S02_START_RECORDED' });
    actor.send({ type: 'S02_CONTENT_COMPLETED' });
    actor.send({ type: 'CONTINUE' });
    actor.send({ type: 'S02_END_FAILED', errorCode: 'write-failed' });
    expect(actor.getSnapshot().matches({ s02: 'endFailed' })).toBe(true);
    expect(actor.getSnapshot().context.passwordValues).toEqual(values);

    actor.send({ type: 'RETRY_S02_END' });
    actor.send({ type: 'S02_END_RECORDED' });
    expect(actor.getSnapshot().context.passwordValues).toEqual({
      'campus-id': '',
      'campus-mail': '',
      'campus-board-archive': '',
    });
  });

  it('preserves values across freely selected tabs without changing whitespace or symbols', () => {
    const actor = createModuleActor();
    const value = '  campus !?  ';

    actor.send({ type: 'SELECT_ACCOUNT', accountId: 'campus-board-archive' });
    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campus-board-archive', value });
    actor.send({ type: 'SELECT_ACCOUNT', accountId: 'campus-id' });
    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campus-id', value: 'A' });
    actor.send({ type: 'SELECT_ACCOUNT', accountId: 'campus-mail' });
    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campus-mail', value: 'B' });

    expect(actor.getSnapshot().context.activeAccountId).toBe('campus-mail');
    expect(actor.getSnapshot().context.passwordValues['campus-board-archive']).toBe(value);
    expect(getConfiguredAccountCount(actor.getSnapshot().context)).toBe(3);
  });

  it('does not configure before all three fields are non-empty and locks editing afterward', () => {
    const actor = createModuleActor();
    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campus-id', value: 'one' });
    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campus-mail', value: 'two' });
    actor.send({ type: 'CONFIGURE_ACCOUNTS' });

    expect(actor.getSnapshot().matches({ s01: 'editing' })).toBe(true);

    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campus-board-archive', value: 'three' });
    actor.send({ type: 'CONFIGURE_ACCOUNTS' });
    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campus-id', value: 'changed' });

    expect(actor.getSnapshot().matches({ s01: 'configured' })).toBe(true);
    expect(actor.getSnapshot().context.passwordValues['campus-id']).toBe('one');
  });
});

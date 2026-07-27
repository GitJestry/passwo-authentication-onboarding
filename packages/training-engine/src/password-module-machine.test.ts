import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import {
  getConfiguredAccountCount,
  passwordModuleMachine,
  sanitizePasswordValue,
} from './password-module-machine.js';

const accountIds = ['campus-id', 'campus-mail', 'campus-board-archive'] as const;

function createModuleActor() {
  const actor = createActor(passwordModuleMachine, { input: { accountIds } });
  actor.start();
  actor.send({ type: 'DISPLAY_NAME_ENTERED', displayName: 'Alex' });
  actor.send({ type: 'S00_COMPLETED' });
  actor.send({ type: 'S01_START_RECORDED' });
  return actor;
}

function configureAllAccounts(actor: ReturnType<typeof createModuleActor>): void {
  for (const accountId of accountIds) {
    actor.send({ type: 'SET_PASSWORD_VALUE', accountId, value: `${accountId}!?` });
    actor.send({ type: 'CONFIGURE_ACCOUNT', accountId });
  }
}

describe('passwordModuleMachine', () => {
  it('requires a non-empty local display name before S00 can begin', () => {
    const actor = createActor(passwordModuleMachine, { input: { accountIds } });
    actor.start();

    actor.send({ type: 'DISPLAY_NAME_ENTERED', displayName: '   ' });
    expect(actor.getSnapshot().matches('entry')).toBe(true);

    actor.send({ type: 'DISPLAY_NAME_ENTERED', displayName: '  Alex  ' });
    expect(actor.getSnapshot().matches('s00')).toBe(true);
    expect(actor.getSnapshot().context.displayName).toBe('Alex');

    actor.send({ type: 'S01_START_RECORDED' });
    expect(actor.getSnapshot().matches('s00')).toBe(true);
  });

  it('moves from S00 through S01 and S02 to module complete', () => {
    const actor = createModuleActor();

    expect(actor.getSnapshot().matches({ s01: 'editing' })).toBe(true);
    configureAllAccounts(actor);
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
    expect(actor.getSnapshot().context.displayName).toBeNull();
    expect(actor.getSnapshot().context.activeAccountId).toBeNull();
    expect(actor.getSnapshot().context.configuredAccountIds).toEqual([]);
    expect(actor.getSnapshot().context.s02ContentCompleted).toBe(false);
    expect(actor.getSnapshot().context.passwordValues).toEqual({
      'campus-id': '',
      'campus-mail': '',
      'campus-board-archive': '',
    });
  });

  it('keeps values local throughout S02 and discards them only after S02 end', () => {
    const actor = createModuleActor();
    const values = {
      'campus-id': 'id!?',
      'campus-mail': 'mail#$',
      'campus-board-archive': 'board_Ä',
    } as const;
    for (const [accountId, value] of Object.entries(values)) {
      actor.send({ type: 'SET_PASSWORD_VALUE', accountId, value });
      actor.send({ type: 'CONFIGURE_ACCOUNT', accountId });
    }
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
    expect(actor.getSnapshot().context.displayName).toBeNull();
    expect(actor.getSnapshot().context.passwordValues).toEqual({
      'campus-id': '',
      'campus-mail': '',
      'campus-board-archive': '',
    });
  });

  it('configures each account immediately after its own value and locks only that account', () => {
    const actor = createModuleActor();
    const value = 'Sicher?Ä_#漢字e\u0301';

    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campus-board-archive', value });
    actor.send({ type: 'CONFIGURE_ACCOUNT', accountId: 'campus-board-archive' });

    expect(actor.getSnapshot().matches({ s01: 'editing' })).toBe(true);
    expect(actor.getSnapshot().context.passwordValues['campus-board-archive']).toBe(value);
    expect(actor.getSnapshot().context.configuredAccountIds).toEqual(['campus-board-archive']);
    expect(getConfiguredAccountCount(actor.getSnapshot().context)).toBe(1);

    actor.send({
      type: 'SET_PASSWORD_VALUE',
      accountId: 'campus-board-archive',
      value: 'must-not-overwrite',
    });
    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campus-id', value: 'id!?_exact' });

    expect(actor.getSnapshot().context.passwordValues['campus-board-archive']).toBe(value);
    expect(actor.getSnapshot().context.passwordValues['campus-id']).toBe('id!?_exact');
  });

  it('counts configured account IDs rather than filled password fields and waits for 3/3', () => {
    const actor = createModuleActor();
    for (const accountId of accountIds) {
      actor.send({ type: 'SET_PASSWORD_VALUE', accountId, value: `${accountId}!` });
    }

    expect(getConfiguredAccountCount(actor.getSnapshot().context)).toBe(0);
    actor.send({ type: 'CONFIGURE_ACCOUNT', accountId: 'campus-id' });
    expect(getConfiguredAccountCount(actor.getSnapshot().context)).toBe(1);
    expect(actor.getSnapshot().matches({ s01: 'editing' })).toBe(true);

    actor.send({ type: 'CONFIGURE_ACCOUNT', accountId: 'campus-mail' });
    expect(getConfiguredAccountCount(actor.getSnapshot().context)).toBe(2);
    expect(actor.getSnapshot().matches({ s01: 'editing' })).toBe(true);

    actor.send({ type: 'CONFIGURE_ACCOUNT', accountId: 'campus-board-archive' });
    expect(getConfiguredAccountCount(actor.getSnapshot().context)).toBe(3);
    expect(actor.getSnapshot().matches({ s01: 'configured' })).toBe(true);
  });

  it('removes whitespace, controls, and emoji before values reach the statechart context', () => {
    const actor = createModuleActor();
    const rawValue = ' \tAb😀\n#1️⃣\u0000Z👨‍👩‍👧‍👦 ';

    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campus-id', value: rawValue });

    expect(actor.getSnapshot().context.passwordValues['campus-id']).toBe('Ab#Z');
  });

  it('preserves every allowed character without normalization', () => {
    const value = 'Ä_#~漢字e\u0301!?';

    expect(sanitizePasswordValue(value)).toBe(value);
  });
});

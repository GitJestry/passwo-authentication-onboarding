import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import {
  getConfiguredAccountCount,
  getRetrievedAccountCount,
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

function startS03(actor: ReturnType<typeof createModuleActor>): void {
  actor.send({ type: 'CONTINUE' });
  actor.send({ type: 'S01_END_RECORDED' });
  actor.send({ type: 'S02_START_RECORDED' });
  actor.send({ type: 'S02_CONTENT_COMPLETED' });
  actor.send({ type: 'CONTINUE' });
  actor.send({ type: 'S02_END_RECORDED' });
  actor.send({ type: 'S03_START_RECORDED' });
}

function finishS03(actor: ReturnType<typeof createModuleActor>): void {
  actor.send({
    type: 'SET_RETRIEVAL_PASSWORD_VALUE',
    accountId: 'campus-id',
    value: 'campus-id!?',
  });
  actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'campus-id' });
  actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-mail' });
  actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-board-archive' });
  actor.send({ type: 'S03_WARNING_SEQUENCE_COMPLETED' });
  actor.send({ type: 'S03_END_RECORDED' });
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

  it('moves from S00 through S02 into S03 and completes only after the warning sequence', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);

    expect(actor.getSnapshot().matches({ s03: 'active' })).toBe(true);
    actor.send({
      type: 'SET_RETRIEVAL_PASSWORD_VALUE',
      accountId: 'campus-id',
      value: 'campus-id!?',
    });
    actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'campus-id' });
    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-mail' });
    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-board-archive' });
    expect(actor.getSnapshot().matches({ s03: 'completionSequence' })).toBe(true);

    actor.send({ type: 'S03_WARNING_SEQUENCE_COMPLETED' });
    expect(actor.getSnapshot().matches({ s03: 'ending' })).toBe(true);
    actor.send({ type: 'S03_END_RECORDED' });

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
    expect(actor.getSnapshot().context.retrievalResults).toEqual({
      'campus-id': 'pending',
      'campus-mail': 'pending',
      'campus-board-archive': 'pending',
    });
  });

  it('keeps passwords and retrieval results local through S03 and discards them only after S03 end', () => {
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
    startS03(actor);

    actor.send({ type: 'SET_RETRIEVAL_PASSWORD_VALUE', accountId: 'campus-id', value: 'id!?' });
    actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'campus-id' });
    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-mail' });
    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-board-archive' });
    actor.send({ type: 'S03_WARNING_SEQUENCE_COMPLETED' });
    actor.send({ type: 'S03_END_FAILED', errorCode: 'write-failed' });

    expect(actor.getSnapshot().matches({ s03: 'endFailed' })).toBe(true);
    expect(actor.getSnapshot().context.passwordValues).toEqual(values);
    expect(actor.getSnapshot().context.retrievalResults).toEqual({
      'campus-id': 'retrievable',
      'campus-mail': 'not-remembered',
      'campus-board-archive': 'not-remembered',
    });

    actor.send({ type: 'RETRY_S03_END' });
    actor.send({ type: 'S03_END_RECORDED' });
    expect(actor.getSnapshot().context.displayName).toBeNull();
    expect(actor.getSnapshot().context.passwordValues).toEqual({
      'campus-id': '',
      'campus-mail': '',
      'campus-board-archive': '',
    });
  });

  it('requires an exact transient S01 value, permits retry, and records skips neutrally', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);

    actor.send({ type: 'SET_RETRIEVAL_PASSWORD_VALUE', accountId: 'campus-mail', value: 'wrong' });
    actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'campus-mail' });
    expect(actor.getSnapshot().context.retrievalResults['campus-mail']).toBe('pending');
    expect(actor.getSnapshot().matches({ s03: 'active' })).toBe(true);

    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-mail' });
    expect(actor.getSnapshot().context.retrievalResults['campus-mail']).toBe('not-remembered');
    expect(getRetrievedAccountCount(actor.getSnapshot().context)).toBe(1);
    actor.send({
      type: 'SET_RETRIEVAL_PASSWORD_VALUE',
      accountId: 'campus-board-archive',
      value: 'campus-board-archive!?',
    });
    actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'campus-board-archive' });
    expect(actor.getSnapshot().context.retrievalResults['campus-board-archive']).toBe(
      'retrievable',
    );
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

  it('can still finish the complete S03 path from the helper workflow', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);
    finishS03(actor);
    expect(actor.getSnapshot().matches('complete')).toBe(true);
  });
});

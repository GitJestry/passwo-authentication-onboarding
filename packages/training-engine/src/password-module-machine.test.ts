import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import {
  getRetrievedAccountCount,
  passwordModuleMachine,
} from './password-module-machine.js';

const accountIds = ['campus-id', 'campus-mail', 'campus-board-archive'] as const;

function createModuleActor() {
  const actor = createActor(passwordModuleMachine, { input: { accountIds } });
  actor.start();
  actor.send({ type: 'DISPLAY_NAME_ENTERED', displayName: 'Alex' });
  actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
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

describe('passwordModuleMachine', () => {
  it('ends S03 after the warning sequence and awaits S04', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);

    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-id' });
    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-mail' });
    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-board-archive' });
    actor.send({ type: 'S03_WARNING_SEQUENCE_COMPLETED' });
    actor.send({ type: 'S03_END_RECORDED' });

    expect(actor.getSnapshot().matches('awaitingS04')).toBe(true);
    expect(actor.getSnapshot().status).toBe('active');
  });

  it('preserves transient S03 data until discard', () => {
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
    actor.send({ type: 'S03_END_RECORDED' });

    expect(actor.getSnapshot().matches('awaitingS04')).toBe(true);
    expect(actor.getSnapshot().context.passwordValues).toEqual(values);
    expect(actor.getSnapshot().context.retrievalResults).toEqual({
      'campus-id': 'retrievable',
      'campus-mail': 'not-remembered',
      'campus-board-archive': 'not-remembered',
    });

    actor.send({ type: 'DISCARD' });

    expect(actor.getSnapshot().matches('discarded')).toBe(true);
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

  it('allows neutral skips and retryable retrieval values in S03', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);

    actor.send({ type: 'SET_RETRIEVAL_PASSWORD_VALUE', accountId: 'campus-mail', value: 'wrong' });
    actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'campus-mail' });
    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-mail' });
    actor.send({
      type: 'SET_RETRIEVAL_PASSWORD_VALUE',
      accountId: 'campus-board-archive',
      value: 'campus-board-archive!?',
    });
    actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'campus-board-archive' });

    expect(actor.getSnapshot().context.retrievalResults['campus-mail']).toBe('not-remembered');
    expect(actor.getSnapshot().context.retrievalResults['campus-board-archive']).toBe('retrievable');
    expect(getRetrievedAccountCount(actor.getSnapshot().context)).toBe(2);
  });
});

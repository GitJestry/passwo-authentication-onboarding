import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import {
  getRetrievedAccountCount,
  passwordModuleMachine,
} from './password-module-machine.js';

const accountIds = ['master-campus', 'campus-email', 'campusgram'] as const;

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

function completeAssistedLogin(
  actor: ReturnType<typeof createModuleActor>,
  accountId: (typeof accountIds)[number],
): void {
  actor.send({ type: 'SKIP_RETRIEVAL', accountId });
  actor.send({ type: 'START_ASSISTED_LOGIN', accountId });
  actor.send({ type: 'S03_ASSISTED_AUTOFILL_COMPLETED', accountId });
  actor.send({ type: 'SUBMIT_ASSISTED_LOGIN', accountId });
}

function finishS03(actor: ReturnType<typeof createModuleActor>): void {
  actor.send({ type: 'S03_COMPLETION_FEEDBACK_CONTINUED' });
  actor.send({ type: 'S03_CAMPUS_START_CONTINUED' });
  actor.send({ type: 'S03_WARNING_SEQUENCE_COMPLETED' });
  actor.send({ type: 'S03_END_RECORDED' });
}

describe('passwordModuleMachine', () => {
  it('ends S03 after the warning sequence and awaits S04', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);

    completeAssistedLogin(actor, 'master-campus');
    completeAssistedLogin(actor, 'campus-email');
    completeAssistedLogin(actor, 'campusgram');
    finishS03(actor);

    expect(actor.getSnapshot().matches('awaitingS04')).toBe(true);
    expect(actor.getSnapshot().status).toBe('active');
  });

  it('preserves transient S03 data until discard', () => {
    const actor = createModuleActor();
    const values = {
      'master-campus': '  id 🙂!?  ',
      'campus-email': 'mail 🧭 #$',
      'campusgram': 'gram_Ä 🐾',
    } as const;
    for (const [accountId, value] of Object.entries(values)) {
      actor.send({ type: 'SET_PASSWORD_VALUE', accountId, value });
      actor.send({ type: 'CONFIGURE_ACCOUNT', accountId });
    }
    startS03(actor);
    actor.send({
      type: 'SET_RETRIEVAL_PASSWORD_VALUE',
      accountId: 'master-campus',
      value: '  id 🙂!?  ',
    });
    actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'master-campus' });
    completeAssistedLogin(actor, 'campus-email');
    completeAssistedLogin(actor, 'campusgram');
    finishS03(actor);

    expect(actor.getSnapshot().matches('awaitingS04')).toBe(true);
    expect(actor.getSnapshot().context.passwordValues).toEqual(values);
    expect(actor.getSnapshot().context.retrievalResults).toEqual({
      'master-campus': 'retrievable',
      'campus-email': 'assisted',
      'campusgram': 'assisted',
    });

    actor.send({ type: 'DISCARD' });

    expect(actor.getSnapshot().matches('discarded')).toBe(true);
    expect(actor.getSnapshot().context.passwordValues).toEqual({
      'master-campus': '',
      'campus-email': '',
      'campusgram': '',
    });
    expect(actor.getSnapshot().context.retrievalResults).toEqual({
      'master-campus': 'pending',
      'campus-email': 'pending',
      'campusgram': 'pending',
    });
  });

  it('keeps failed entries retryable and completes forgotten passwords through assistance', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);

    actor.send({ type: 'SET_RETRIEVAL_PASSWORD_VALUE', accountId: 'campus-email', value: 'wrong' });
    actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'campus-email' });
    completeAssistedLogin(actor, 'campus-email');
    actor.send({
      type: 'SET_RETRIEVAL_PASSWORD_VALUE',
      accountId: 'campusgram',
      value: 'campusgram!?',
    });
    actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'campusgram' });

    expect(actor.getSnapshot().context.retrievalResults['campus-email']).toBe('assisted');
    expect(actor.getSnapshot().context.retrievalResults['campusgram']).toBe('retrievable');
    expect(getRetrievedAccountCount(actor.getSnapshot().context)).toBe(2);
  });
});

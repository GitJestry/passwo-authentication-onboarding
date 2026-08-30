import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { getRetrievedAccountCount, passwordModuleMachine } from './password-module-machine.js';

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
  actor.send({ type: 'S01_BROWSER_CLOSED' });
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
  actor.send({ type: 'SELECT_ACCOUNT', accountId });
  actor.send({ type: 'SKIP_RETRIEVAL', accountId });
  actor.send({ type: 'START_ASSISTED_LOGIN', accountId });
  actor.send({ type: 'S03_ASSISTED_AUTOFILL_COMPLETED', accountId });
  actor.send({ type: 'SUBMIT_ASSISTED_LOGIN', accountId });
}

function reachS03TimeLapse(actor: ReturnType<typeof createModuleActor>): void {
  actor.send({ type: 'S03_COMPLETION_FEEDBACK_CONTINUED' });
}

function reachAwaitingIncidentOpen(actor: ReturnType<typeof createModuleActor>): void {
  reachS03TimeLapse(actor);
  actor.send({ type: 'S03_TIMELAPSE_COMPLETED' });
}

function startS04(actor: ReturnType<typeof createModuleActor>): void {
  actor.send({ type: 'OPEN_INCIDENT_ACCOUNT', accountId: 'campusgram' });
  actor.send({ type: 'S03_END_RECORDED' });
  actor.send({ type: 'S04_START_RECORDED' });
}

describe('passwordModuleMachine', () => {
  it('hydrates a transient S05 reload checkpoint without replaying S01-S04', () => {
    const transientResumeState = {
      displayName: 'Alex',
      activeAccountId: 'campusgram',
      passwordValues: {
        'master-campus': 'MasterCampus!23',
        'campus-email': 'CampusMail!45',
        campusgram: 'Campusgram!67',
      },
      configuredAccountIds: [...accountIds],
      s02ContentCompleted: true,
      retrievalResults: {
        'master-campus': 'assisted' as const,
        'campus-email': 'retrievable' as const,
        campusgram: 'retrievable' as const,
      },
    };
    const actor = createActor(passwordModuleMachine, {
      input: { accountIds, resumeSegmentId: 'S05', transientResumeState },
    });
    actor.start();

    expect(actor.getSnapshot().matches({ s05: 'writingStart' })).toBe(true);
    expect(actor.getSnapshot().context.displayName).toBe('Alex');
    expect(actor.getSnapshot().context.passwordValues).toEqual(transientResumeState.passwordValues);
    expect(actor.getSnapshot().context.retrievalResults).toEqual(
      transientResumeState.retrievalResults,
    );

    actor.send({ type: 'S05_START_RECORDED' });
    expect(actor.getSnapshot().matches({ s05: 'active' })).toBe(true);
  });

  it('starts the training without a fictional username', () => {
    const actor = createActor(passwordModuleMachine, { input: { accountIds } });
    actor.start();
    actor.send({ type: 'DISPLAY_NAME_ENTERED', displayName: '' });

    expect(actor.getSnapshot().matches('sectionTransition')).toBe(true);
    expect(actor.getSnapshot().context.displayName).toBe('');
  });

  it('starts the S01 end boundary only after the browser-close event', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);

    actor.send({ type: 'CONTINUE' });
    expect(actor.getSnapshot().matches({ s01: 'configured' })).toBe(true);

    actor.send({ type: 'S01_BROWSER_CLOSED' });
    expect(actor.getSnapshot().matches({ s01: 'ending' })).toBe(true);
  });

  it('keeps passwords within the local Unicode, emoji-free and 128-character input boundary', () => {
    const actor = createModuleActor();

    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campusgram', value: 'a'.repeat(128) });
    expect(actor.getSnapshot().context.passwordValues.campusgram).toBe('a'.repeat(128));

    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campusgram', value: 'a'.repeat(129) });
    expect(actor.getSnapshot().context.passwordValues.campusgram).toBe('a'.repeat(128));

    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campusgram', value: 'zulässig🙂' });
    expect(actor.getSnapshot().context.passwordValues.campusgram).toBe('a'.repeat(128));

    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campusgram', value: 'zulässig' });
    expect(actor.getSnapshot().context.passwordValues.campusgram).toBe('zulässig');

    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campusgram', value: '🇩🇪' });
    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campusgram', value: '🏳️‍🌈' });
    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campusgram', value: '1️⃣' });
    expect(actor.getSnapshot().context.passwordValues.campusgram).toBe('zulässig');

    actor.send({ type: 'SET_PASSWORD_VALUE', accountId: 'campusgram', value: 'a'.repeat(129) });
    expect(actor.getSnapshot().context.passwordValues.campusgram).toBe('zulässig');
  });

  it('shows the Campusgram warning in an explicit state after the time lapse', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);
    for (const accountId of accountIds) completeAssistedLogin(actor, accountId);
    reachS03TimeLapse(actor);

    expect(actor.getSnapshot().matches({ s03: { completionSequence: 'timeLapseRunning' } })).toBe(
      true,
    );
    actor.send({ type: 'S03_TIMELAPSE_COMPLETED' });

    expect(actor.getSnapshot().matches({ s03: 'awaitingIncidentOpen' })).toBe(true);
  });

  it('does not auto-transition from the Campusgram warning', async () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);
    for (const accountId of accountIds) completeAssistedLogin(actor, accountId);
    reachS03TimeLapse(actor);
    actor.send({ type: 'S03_TIMELAPSE_COMPLETED' });
    await new Promise<void>((resolve) => queueMicrotask(resolve));

    expect(actor.getSnapshot().matches({ s03: 'awaitingIncidentOpen' })).toBe(true);
  });

  it('ignores an incident activation for every account except Campusgram', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);
    for (const accountId of accountIds) completeAssistedLogin(actor, accountId);
    reachAwaitingIncidentOpen(actor);

    actor.send({ type: 'OPEN_INCIDENT_ACCOUNT', accountId: 'campus-email' });

    expect(actor.getSnapshot().matches({ s03: 'awaitingIncidentOpen' })).toBe(true);
  });

  it('starts S04 only through the Campusgram tab activation', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);
    for (const accountId of accountIds) completeAssistedLogin(actor, accountId);
    reachAwaitingIncidentOpen(actor);

    actor.send({ type: 'OPEN_INCIDENT_ACCOUNT', accountId: 'campusgram' });
    actor.send({ type: 'OPEN_INCIDENT_ACCOUNT', accountId: 'campusgram' });

    expect(actor.getSnapshot().matches({ s03: 'writingEnd' })).toBe(true);
    actor.send({ type: 'S03_END_RECORDED' });
    expect(actor.getSnapshot().matches({ s04: 'writingStart' })).toBe(true);
    actor.send({ type: 'S04_START_RECORDED' });

    expect(actor.getSnapshot().matches({ s04: 'active' })).toBe(true);
    expect(actor.getSnapshot().status).toBe('active');
  });

  it('records S06 completion before S07 and reaches awaiting S08 only after S07 ends', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);
    for (const accountId of accountIds) completeAssistedLogin(actor, accountId);
    reachAwaitingIncidentOpen(actor);
    startS04(actor);
    actor.send({ type: 'S04_COMPLETED' });
    actor.send({ type: 'S04_END_RECORDED' });
    expect(actor.getSnapshot().matches('strengthTransition')).toBe(true);
    actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
    actor.send({ type: 'S05_START_RECORDED' });
    actor.send({ type: 'S05_COMPLETED' });

    expect(actor.getSnapshot().matches({ s05: 'writingEnd' })).toBe(true);
    actor.send({ type: 'S05_END_RECORDED' });
    expect(actor.getSnapshot().matches('uniquenessTransition')).toBe(true);
    actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
    expect(actor.getSnapshot().matches({ s06: 'writingStart' })).toBe(true);
    actor.send({ type: 'S06_START_RECORDED' });
    expect(actor.getSnapshot().matches({ s06: 'active' })).toBe(true);
    actor.send({ type: 'S06_COMPLETED' });
    expect(actor.getSnapshot().matches({ s06: 'writingEnd' })).toBe(true);
    actor.send({ type: 'S06_END_RECORDED' });
    expect(actor.getSnapshot().matches('changeTransition')).toBe(true);
    actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
    expect(actor.getSnapshot().matches({ s07: 'writingStart' })).toBe(true);
    actor.send({ type: 'S07_START_RECORDED' });
    expect(actor.getSnapshot().matches({ s07: 'active' })).toBe(true);
    actor.send({ type: 'S07_COMPLETED' });
    expect(actor.getSnapshot().matches({ s07: 'writingEnd' })).toBe(true);
    actor.send({ type: 'S07_END_RECORDED' });
    expect(actor.getSnapshot().matches('awaiting-s08')).toBe(true);
  });

  it('keeps each failed transition retryable through S07', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);
    for (const accountId of accountIds) completeAssistedLogin(actor, accountId);
    reachAwaitingIncidentOpen(actor);

    actor.send({ type: 'OPEN_INCIDENT_ACCOUNT', accountId: 'campusgram' });
    actor.send({ type: 'S03_END_FAILED', errorCode: 's03-end-failed' });
    expect(actor.getSnapshot().matches({ s03: 'endWriteFailed' })).toBe(true);
    actor.send({ type: 'RETRY_S03_END' });
    actor.send({ type: 'S03_END_RECORDED' });
    actor.send({ type: 'S04_START_FAILED', errorCode: 's04-start-failed' });
    expect(actor.getSnapshot().matches({ s04: 'startWriteFailed' })).toBe(true);
    actor.send({ type: 'RETRY_S04_START' });
    actor.send({ type: 'S04_START_RECORDED' });
    actor.send({ type: 'S04_COMPLETED' });
    actor.send({ type: 'S04_END_FAILED', errorCode: 's04-end-failed' });
    expect(actor.getSnapshot().matches({ s04: 'endWriteFailed' })).toBe(true);
    actor.send({ type: 'RETRY_S04_END' });
    actor.send({ type: 'S04_END_RECORDED' });
    actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
    actor.send({ type: 'S05_START_FAILED', errorCode: 's05-start-failed' });
    expect(actor.getSnapshot().matches({ s05: 'startWriteFailed' })).toBe(true);
    actor.send({ type: 'RETRY_S05_START' });
    actor.send({ type: 'S05_START_RECORDED' });
    actor.send({ type: 'S05_COMPLETED' });
    actor.send({ type: 'S05_END_FAILED', errorCode: 's05-end-failed' });
    expect(actor.getSnapshot().matches({ s05: 'endWriteFailed' })).toBe(true);
    actor.send({ type: 'RETRY_S05_END' });
    actor.send({ type: 'S05_END_RECORDED' });
    actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
    actor.send({ type: 'S06_START_FAILED', errorCode: 's06-start-failed' });
    expect(actor.getSnapshot().matches({ s06: 'startWriteFailed' })).toBe(true);
    actor.send({ type: 'RETRY_S06_START' });
    actor.send({ type: 'S06_START_RECORDED' });
    actor.send({ type: 'S06_COMPLETED' });
    actor.send({ type: 'S06_END_FAILED', errorCode: 's06-end-failed' });
    expect(actor.getSnapshot().matches({ s06: 'endWriteFailed' })).toBe(true);
    actor.send({ type: 'RETRY_S06_END' });
    actor.send({ type: 'S06_END_RECORDED' });
    expect(actor.getSnapshot().matches('changeTransition')).toBe(true);
    actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
    actor.send({ type: 'S07_START_FAILED', errorCode: 's07-start-failed' });
    expect(actor.getSnapshot().matches({ s07: 'startWriteFailed' })).toBe(true);
    actor.send({ type: 'RETRY_S07_START' });
    actor.send({ type: 'S07_START_RECORDED' });
    actor.send({ type: 'S07_COMPLETED' });
    actor.send({ type: 'S07_END_FAILED', errorCode: 's07-end-failed' });
    expect(actor.getSnapshot().matches({ s07: 'endWriteFailed' })).toBe(true);
    actor.send({ type: 'RETRY_S07_END' });
    actor.send({ type: 'S07_END_RECORDED' });

    expect(actor.getSnapshot().matches('awaiting-s08')).toBe(true);
    expect(actor.getSnapshot().context).not.toHaveProperty('s05Result');
    expect(actor.getSnapshot().context).not.toHaveProperty('s06Result');
  });

  it('preserves transient S03 data through S07 and discards it at the S08 boundary', () => {
    const actor = createModuleActor();
    const values = {
      'master-campus': '  id Ä!?  ',
      'campus-email': 'mail Ö #$',
      campusgram: 'gram_Ü_ß',
    } as const;
    for (const [accountId, value] of Object.entries(values)) {
      actor.send({ type: 'SET_PASSWORD_VALUE', accountId, value });
      actor.send({ type: 'CONFIGURE_ACCOUNT', accountId });
    }
    startS03(actor);
    actor.send({
      type: 'SET_RETRIEVAL_PASSWORD_VALUE',
      accountId: 'master-campus',
      value: '  id Ä!?  ',
    });
    actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId: 'master-campus' });
    completeAssistedLogin(actor, 'campus-email');
    completeAssistedLogin(actor, 'campusgram');
    reachAwaitingIncidentOpen(actor);
    startS04(actor);
    actor.send({ type: 'S04_COMPLETED' });
    actor.send({ type: 'S04_END_RECORDED' });
    actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
    actor.send({ type: 'S05_START_RECORDED' });
    actor.send({ type: 'S05_COMPLETED' });
    actor.send({ type: 'S05_END_RECORDED' });
    actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
    actor.send({ type: 'S06_START_RECORDED' });
    actor.send({ type: 'S06_COMPLETED' });
    actor.send({ type: 'S06_END_RECORDED' });

    expect(actor.getSnapshot().matches('changeTransition')).toBe(true);
    actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
    expect(actor.getSnapshot().matches({ s07: 'writingStart' })).toBe(true);
    expect(actor.getSnapshot().context.passwordValues).toEqual(values);
    expect(actor.getSnapshot().context).not.toHaveProperty('s05Result');
    expect(actor.getSnapshot().context).not.toHaveProperty('s06Result');
    expect(actor.getSnapshot().context.retrievalResults).toEqual({
      'master-campus': 'retrievable',
      'campus-email': 'assisted',
      campusgram: 'assisted',
    });

    actor.send({ type: 'S07_START_RECORDED' });
    actor.send({ type: 'S07_COMPLETED' });
    actor.send({ type: 'S07_END_RECORDED' });
    expect(actor.getSnapshot().matches('awaiting-s08')).toBe(true);
    actor.send({ type: 'ENTER_S08' });

    expect(actor.getSnapshot().matches('s08')).toBe(true);
    expect(actor.getSnapshot().context.displayName).toBeNull();
    expect(actor.getSnapshot().context.activeAccountId).toBeNull();
    expect(actor.getSnapshot().context.configuredAccountIds).toEqual([]);
    expect(actor.getSnapshot().context.passwordValues).toEqual({
      'master-campus': '',
      'campus-email': '',
      campusgram: '',
    });
    expect(actor.getSnapshot().context.retrievalResults).toEqual({
      'master-campus': 'pending',
      'campus-email': 'pending',
      campusgram: 'pending',
    });
    expect(actor.getSnapshot().context.retrievalPasswordValues).toEqual({
      'master-campus': '',
      'campus-email': '',
      campusgram: '',
    });
    expect(actor.getSnapshot().context).not.toHaveProperty('s05Result');
    expect(actor.getSnapshot().context).not.toHaveProperty('s06Result');
  });

  it('routes a later content-free resume checkpoint through the cleared S08 boundary', () => {
    const actor = createActor(passwordModuleMachine, {
      input: { accountIds, resumeSegmentId: 'S15' },
    });
    actor.start();

    expect(actor.getSnapshot().matches('s08')).toBe(true);
    expect(actor.getSnapshot().context.passwordValues).toEqual({
      'master-campus': '',
      'campus-email': '',
      campusgram: '',
    });
    expect(actor.getSnapshot().context.resumeSegmentId).toBe('S15');
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

  it('skips repeated retrieval help and starts autofilling immediately', () => {
    const actor = createModuleActor();
    configureAllAccounts(actor);
    startS03(actor);

    actor.send({ type: 'SELECT_ACCOUNT', accountId: 'campus-email' });
    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'campus-email' });
    expect(actor.getSnapshot().matches({ s03: 'assistance' })).toBe(true);

    actor.send({ type: 'START_ASSISTED_LOGIN', accountId: 'campus-email' });
    actor.send({ type: 'S03_ASSISTED_AUTOFILL_COMPLETED', accountId: 'campus-email' });
    actor.send({ type: 'SUBMIT_ASSISTED_LOGIN', accountId: 'campus-email' });

    actor.send({ type: 'SELECT_ACCOUNT', accountId: 'master-campus' });
    actor.send({ type: 'SKIP_RETRIEVAL', accountId: 'master-campus' });

    expect(actor.getSnapshot().matches({ s03: 'autofilling' })).toBe(true);
    expect(actor.getSnapshot().context.retrievalResults['master-campus']).toBe('not-remembered');
  });
});

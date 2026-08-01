import { createStudyMachine, type StudyRuntimePorts } from '@passwo/study-engine';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { PasswordModuleController } from './password-module-controller.js';
import type { PasswordModuleEvent } from './password-module-machine.js';

function studyRuntimePorts(requestArguments: unknown[][]): StudyRuntimePorts {
  return {
    createSession: async () => ({
      sessionId: 'a185bbd8-2088-47d2-b45a-924c8d8778ea',
      participantCode: 'PW-AB12CD34',
      condition: 'supportive',
      assignmentMode: 'forced-supportive',
      guardrailFormId: 'F1',
    }),
    registerRecontact: async () => {},
    abandonRecontact: async () => {},
    saveInstrumentSubmission: async (...arguments_) => {
      requestArguments.push(arguments_);
    },
    startArtifact: async (...arguments_) => {
      requestArguments.push(arguments_);
    },
    endArtifact: async () => 0,
    recordArtifactVisibility: async () => {},
    retryArtifactTiming: async () => null,
    markIncompleteReload: () => {},
    observeArtifactLifecycle: () => () => {},
    completeSession: async () => {},
  };
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe('password module privacy boundary', () => {
  it('keeps S05 completion payloadless and all S05 analysis data out of machine context', () => {
    const completionEvent: PasswordModuleEvent = { type: 'S05_COMPLETED' };
    expect(Object.keys(completionEvent)).toEqual(['type']);

    const controller = new PasswordModuleController({
      accountIds: ['master-campus', 'campus-email', 'campusgram'],
    });
    const contextKeys = Object.keys(controller.getSnapshot().context);
    expect(contextKeys).not.toEqual(
      expect.arrayContaining([
        's05Findings',
        'findings',
        'evidence',
        'evidenceSpans',
        'evidenceTokens',
        'analyzedPasswordSections',
        'theoreticalDemonstrationValues',
        'estimate',
        'estimateAnswer',
        's05Result',
      ]),
    );
    controller.dispose();
  });

  it('keeps display names and fictitious passwords out of StudyMachine and runtime requests', async () => {
    const requestArguments: unknown[][] = [];
    const studyActor = createActor(createStudyMachine(studyRuntimePorts(requestArguments)));
    studyActor.start();
    const controller = new PasswordModuleController({
      accountIds: ['master-campus', 'campus-email', 'campusgram'],
    });
    const displayName = 'Browsername Nur Lokal';
    const trainingValue = 'only-in-password-module!?';
    controller.enterDisplayName(displayName);
    controller.completeSectionTransition();
    controller.completeS00();
    await flushMicrotasks();
    for (const [accountId, password] of [
      ['master-campus', trainingValue],
      ['campus-email', 'second-local-password'],
      ['campusgram', 'third-local-password'],
    ] as const) {
      controller.setPasswordValue(accountId, password);
      controller.configureAccount(accountId);
    }
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeS02Content();
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    for (const [accountId, password] of [
      ['master-campus', trainingValue],
      ['campus-email', 'second-local-password'],
      ['campusgram', 'third-local-password'],
    ] as const) {
      controller.setRetrievalPasswordValue(accountId, password);
      controller.submitRetrievalLogin(accountId);
    }
    controller.continueS03CompletionFeedback();
    controller.continueS03CampusStart();
    controller.completeS03TimeLapse();
    controller.completeS03WarningAnnouncement();
    controller.openIncidentAccount('campusgram');
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeS04();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeS05();
    await flushMicrotasks();
    studyActor.send({
      type: 'ACCEPT_CONSENT',
      followUpConsent: true,
      recontact: {
        email: 'person@example.org',
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      },
    });
    await flushMicrotasks();
    studyActor.send({
      type: 'SUBMIT_PRE',
      payload: {
        instrumentId: 'pre-v1',
        sectionId: 'sample',
        responses: [
          { itemId: 'PRE_ROLE', value: 'undergraduate' },
          { itemId: 'PRE_FIELD', value: 'stem' },
          { itemId: 'PRE_AGE', value: 'age_18_25' },
          { itemId: 'PRE_GENDER', value: null },
        ],
      },
    });
    await flushMicrotasks();
    await flushMicrotasks();

    const studyContext = JSON.stringify(studyActor.getSnapshot().context);
    const runtimeRequests = JSON.stringify(requestArguments);
    expect(studyContext).not.toContain(displayName);
    expect(studyContext).not.toContain(trainingValue);
    expect(runtimeRequests).not.toContain(displayName);
    expect(runtimeRequests).not.toContain(trainingValue);
    expect(controller.getSnapshot().context).not.toHaveProperty('s05Result');
  });
});

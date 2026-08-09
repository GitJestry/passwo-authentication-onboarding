import { createStudyMachine, type StudyRuntimePorts } from '@passwo/study-engine';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { PasswordModuleController } from './password-module-controller.js';
import type { PasswordModuleEvent } from './password-module-machine.js';

function studyRuntimePorts(requestArguments: unknown[][]): StudyRuntimePorts {
  return {
    createSession: async () => ({
      sessionId: 'a185bbd8-2088-47d2-b45a-924c8d8778ea',
      deletionCode: 'PW-AB12-CD34-EF56-7890',
      condition: 'supportive',
      assignmentMode: 'forced-supportive',
      guardrailFormId: 'F1',
    }),
    registerRecontact: async (...arguments_) => {
      requestArguments.push(arguments_);
    },
    abandonRecontact: async (...arguments_) => {
      requestArguments.push(arguments_);
    },
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
  it('keeps S05–S07 completion payloadless and analysis data out of machine context', () => {
    const completionEvent: PasswordModuleEvent = { type: 'S05_COMPLETED' };
    const s06CompletionEvent: PasswordModuleEvent = { type: 'S06_COMPLETED' };
    const s07CompletionEvent: PasswordModuleEvent = { type: 'S07_COMPLETED' };
    expect(Object.keys(completionEvent)).toEqual(['type']);
    expect(Object.keys(s06CompletionEvent)).toEqual(['type']);
    expect(Object.keys(s07CompletionEvent)).toEqual(['type']);

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
        's06Result',
        'passwordComparisons',
        'generatedCandidates',
        'retrievalAnalysis',
        's07Recommendations',
      ]),
    );
    controller.dispose();
  });

  it('keeps display names and fictitious passwords out of StudyMachine and runtime requests', async () => {
    const requestArguments: unknown[][] = [];
    const timingRequests: unknown[] = [];
    const studyActor = createActor(createStudyMachine(studyRuntimePorts(requestArguments)));
    studyActor.start();
    const controller = new PasswordModuleController({
      accountIds: ['master-campus', 'campus-email', 'campusgram'],
      timingPort: {
        record: async (event) => {
          timingRequests.push(event);
        },
      },
    });
    const displayName = 'Browsername Nur Lokal';
    const fictionalPasswords = [
      ['master-campus', 'only-in-password-module!?'],
      ['campus-email', 'second-local-password'],
      ['campusgram', 'third-local-password'],
    ] as const;
    controller.enterDisplayName(displayName);
    controller.completeSectionTransition();
    controller.completeS00();
    await flushMicrotasks();
    for (const [accountId, password] of fictionalPasswords) {
      controller.setPasswordValue(accountId, password);
      controller.configureAccount(accountId);
    }
    controller.closeS01Browser();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeS02Content();
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    for (const [accountId, password] of fictionalPasswords) {
      controller.setRetrievalPasswordValue(accountId, password);
      controller.submitRetrievalLogin(accountId);
    }
    controller.continueS03CompletionFeedback();
    controller.continueS03CampusStart();
    controller.completeS03TimeLapse();
    controller.openIncidentAccount('campusgram');
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeS04();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeSectionTransition();
    await flushMicrotasks();
    controller.completeS05();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeSectionTransition();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s06: 'active' })).toBe(true);
    controller.completeS06();
    await flushMicrotasks();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s07: 'active' })).toBe(true);
    studyActor.send({
      type: 'ACCEPT_CONSENT',
      followUpConsent: false,
      recontact: null,
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
        ],
      },
    });
    await flushMicrotasks();
    await flushMicrotasks();

    const studyContext = JSON.stringify(studyActor.getSnapshot().context);
    const runtimeRequests = JSON.stringify([...requestArguments, ...timingRequests]);
    expect(studyContext).not.toContain(displayName);
    expect(runtimeRequests).not.toContain(displayName);
    for (const [, password] of fictionalPasswords) {
      expect(studyContext).not.toContain(password);
      expect(runtimeRequests).not.toContain(password);
    }
    expect(timingRequests).toContainEqual({
      eventType: 'segment-start',
      segmentId: 'S06',
      sectionId: 'passwords',
    });
    expect(timingRequests).toContainEqual({
      eventType: 'segment-end',
      segmentId: 'S06',
      sectionId: 'passwords',
    });
    expect(timingRequests).toContainEqual({
      eventType: 'segment-start',
      segmentId: 'S07',
      sectionId: 'passwords',
    });
    expect(controller.getSnapshot().context).not.toHaveProperty('s05Result');
    expect(controller.getSnapshot().context).not.toHaveProperty('s06Result');
    expect(controller.getSnapshot().context).not.toHaveProperty('s07Recommendations');
  });
});

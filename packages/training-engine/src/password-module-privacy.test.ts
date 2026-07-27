import { createStudyMachine, type StudyRuntimePorts } from '@passwo/study-engine';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { PasswordModuleController } from './password-module-controller.js';

function studyRuntimePorts(requestArguments: unknown[][]): StudyRuntimePorts {
  return {
    createSession: async () => ({
      sessionId: 'a185bbd8-2088-47d2-b45a-924c8d8778ea',
      participantCode: 'PW-AB12CD34',
      condition: 'supportive',
      assignmentMode: 'forced-supportive',
    }),
    savePlaceholder: async (...arguments_) => {
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
  it('keeps display names and fictitious passwords out of StudyMachine and runtime requests', async () => {
    const requestArguments: unknown[][] = [];
    const studyActor = createActor(createStudyMachine(studyRuntimePorts(requestArguments)));
    studyActor.start();
    const controller = new PasswordModuleController({
      accountIds: ['campus-id', 'campus-mail', 'campus-board-archive'],
      onComplete: () => undefined,
    });
    const displayName = 'Browsername Nur Lokal';
    const trainingValue = 'only-in-password-module!?';

    controller.enterDisplayName(displayName);
    controller.completeS00();
    await flushMicrotasks();
    controller.setPasswordValue('campus-id', trainingValue);
    studyActor.send({ type: 'ACCEPT_CONSENT' });
    await flushMicrotasks();
    studyActor.send({ type: 'SUBMIT_PRE' });
    await flushMicrotasks();
    await flushMicrotasks();

    const studyContext = JSON.stringify(studyActor.getSnapshot().context);
    const runtimeRequests = JSON.stringify(requestArguments);
    expect(studyContext).not.toContain(displayName);
    expect(studyContext).not.toContain(trainingValue);
    expect(runtimeRequests).not.toContain(displayName);
    expect(runtimeRequests).not.toContain(trainingValue);
  });
});

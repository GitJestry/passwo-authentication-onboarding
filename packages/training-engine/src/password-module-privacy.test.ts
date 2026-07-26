import { createStudyMachine, type StudyRuntimePorts } from '@passwo/study-engine';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { PasswordModuleController } from './password-module-controller.js';

function studyRuntimePorts(): StudyRuntimePorts {
  return {
    createSession: async () => ({
      sessionId: 'a185bbd8-2088-47d2-b45a-924c8d8778ea',
      participantCode: 'PW-AB12CD34',
      condition: 'supportive',
      assignmentMode: 'forced-supportive',
    }),
    savePlaceholder: async () => {},
    startArtifact: async () => {},
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
  it('keeps display name and fictitious values out of the StudyMachine context', async () => {
    const studyActor = createActor(createStudyMachine(studyRuntimePorts()));
    studyActor.start();
    const controller = new PasswordModuleController({
      accountIds: ['campus-id', 'campus-mail', 'campus-board-archive'],
      onComplete: () => undefined,
    });
    const displayName = '  Browsername Nur Lokal  ';
    const trainingValue = '  only-in-password-module !?  ';

    controller.enterDisplayName(displayName);
    controller.completeS00();
    await flushMicrotasks();
    controller.setPasswordValue('campus-id', trainingValue);

    expect(controller.getSnapshot().context.displayName).toBe('Browsername Nur Lokal');
    expect(controller.getSnapshot().context.passwordValues['campus-id']).toBe(trainingValue);
    expect(JSON.stringify(studyActor.getSnapshot().context)).not.toContain(displayName.trim());
    expect(JSON.stringify(studyActor.getSnapshot().context)).not.toContain(trainingValue);
    expect(studyActor.getSnapshot().context).not.toHaveProperty('displayName');
    expect(studyActor.getSnapshot().context).not.toHaveProperty('passwordValues');

    controller.dispose();
    expect(controller.getSnapshot().context.displayName).toBeNull();
    expect(controller.getSnapshot().context.passwordValues['campus-id']).toBe('');
  });
});

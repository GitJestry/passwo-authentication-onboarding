import type { SegmentId, TrainingSectionId } from '@passwo/contracts';
import { assign, setup } from 'xstate';
import type { AnimationSequence } from './animation-types.js';

export interface MissionStepDefinition {
  readonly id: string;
  readonly animation: AnimationSequence;
  readonly narrationId: string;
}

export interface MissionDefinition {
  readonly id: string;
  readonly segmentId: SegmentId;
  readonly sectionId: TrainingSectionId;
  readonly requiresSafetyAcknowledgement: boolean;
  readonly steps: readonly MissionStepDefinition[];
}

export interface MissionContext {
  readonly missionId: string | null;
  readonly segmentId: SegmentId | null;
  readonly sectionId: TrainingSectionId | null;
  readonly steps: readonly MissionStepDefinition[];
  readonly requiresSafetyAcknowledgement: boolean;
  readonly safetyAcknowledged: boolean;
  readonly stepIndex: number;
  readonly replayCount: number;
  readonly lastAnimationError: string | null;
}

export type MissionEvent =
  | {
      readonly type: 'START';
      readonly mission: MissionDefinition;
    }
  | { readonly type: 'ANIMATION_FINISHED' }
  | { readonly type: 'ANIMATION_FAILED'; readonly reasonCode: string }
  | { readonly type: 'SET_SAFETY_ACKNOWLEDGED'; readonly acknowledged: boolean }
  | { readonly type: 'REPLAY' }
  | { readonly type: 'CONTINUE' }
  | { readonly type: 'CANCEL' };

const initialContext: MissionContext = {
  missionId: null,
  segmentId: null,
  sectionId: null,
  steps: [],
  requiresSafetyAcknowledgement: false,
  safetyAcknowledged: false,
  stepIndex: 0,
  replayCount: 0,
  lastAnimationError: null,
};

export const missionMachine = setup({
  types: {
    context: {} as MissionContext,
    events: {} as MissionEvent,
  },
  guards: {
    hasCurrentStep: ({ context }) => context.stepIndex < context.steps.length,
    canContinue: ({ context }) =>
      !context.requiresSafetyAcknowledgement || context.safetyAcknowledged,
  },
  actions: {
    loadMission: assign({
      missionId: ({ event }) => (event.type === 'START' ? event.mission.id : null),
      segmentId: ({ event }) => (event.type === 'START' ? event.mission.segmentId : null),
      sectionId: ({ event }) => (event.type === 'START' ? event.mission.sectionId : null),
      steps: ({ event }) => (event.type === 'START' ? event.mission.steps : []),
      requiresSafetyAcknowledgement: ({ event }) =>
        event.type === 'START' && event.mission.requiresSafetyAcknowledgement,
      safetyAcknowledged: () => false,
      stepIndex: () => 0,
      replayCount: () => 0,
      lastAnimationError: () => null,
    }),
    advanceStep: assign({
      stepIndex: ({ context }) => context.stepIndex + 1,
      replayCount: () => 0,
      lastAnimationError: () => null,
    }),
    incrementReplay: assign({
      replayCount: ({ context }) => context.replayCount + 1,
      lastAnimationError: () => null,
    }),
    storeAnimationError: assign({
      lastAnimationError: ({ event }) =>
        event.type === 'ANIMATION_FAILED' ? event.reasonCode : null,
    }),
    setSafetyAcknowledgement: assign({
      safetyAcknowledged: ({ event }) =>
        event.type === 'SET_SAFETY_ACKNOWLEDGED' ? event.acknowledged : false,
    }),
  },
}).createMachine({
  id: 'trainingMission',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {
      on: { START: { target: 'active', actions: 'loadMission' } },
    },
    active: {
      initial: 'dispatching',
      states: {
        dispatching: {
          always: [
            { guard: 'hasCurrentStep', target: 'animating' },
            { target: '#trainingMission.completed' },
          ],
        },
        animating: {
          on: {
            ANIMATION_FINISHED: 'awaitingDecision',
            ANIMATION_FAILED: { target: 'awaitingDecision', actions: 'storeAnimationError' },
          },
        },
        awaitingDecision: {
          on: {
            REPLAY: { target: 'animating', actions: 'incrementReplay' },
            SET_SAFETY_ACKNOWLEDGED: { actions: 'setSafetyAcknowledgement' },
            CONTINUE: {
              guard: 'canContinue',
              target: 'dispatching',
              actions: 'advanceStep',
            },
          },
        },
      },
      on: { CANCEL: '#trainingMission.completed' },
    },
    completed: { type: 'final' },
  },
});

export function getCurrentMissionStep(context: MissionContext): MissionStepDefinition | null {
  return context.steps[context.stepIndex] ?? null;
}

export function canContinueMission(context: MissionContext): boolean {
  return !context.requiresSafetyAcknowledgement || context.safetyAcknowledged;
}

import { assign, setup } from 'xstate';

export interface MissionStepDefinition {
  readonly id: string;
  readonly animationSequenceId: string;
  readonly narrationId: string;
}

export interface MissionContext {
  readonly missionId: string | null;
  readonly steps: readonly MissionStepDefinition[];
  readonly stepIndex: number;
  readonly replayCount: number;
  readonly lastAnimationError: string | null;
}

export type MissionEvent =
  | {
      readonly type: 'START';
      readonly missionId: string;
      readonly steps: readonly MissionStepDefinition[];
    }
  | { readonly type: 'ANIMATION_FINISHED' }
  | { readonly type: 'ANIMATION_FAILED'; readonly reasonCode: string }
  | { readonly type: 'REPLAY' }
  | { readonly type: 'CONTINUE' }
  | { readonly type: 'CANCEL' };

const initialContext: MissionContext = {
  missionId: null,
  steps: [],
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
  },
  actions: {
    loadMission: assign({
      missionId: ({ event }) => (event.type === 'START' ? event.missionId : null),
      steps: ({ event }) => (event.type === 'START' ? event.steps : []),
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
            CONTINUE: { target: 'dispatching', actions: 'advanceStep' },
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

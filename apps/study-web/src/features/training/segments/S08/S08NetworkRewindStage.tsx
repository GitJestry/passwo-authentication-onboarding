import type { S06AccountId } from '@passwo/contracts';
import {
  s08NetworkReplayContent,
  s09PasswordSummaryContent,
} from '@passwo/training-content';
import type { DesktopPlatform } from '@passwo/ui';
import { DesktopSurface } from '@passwo/ui';
import type {
  NetworkSceneSnapshot,
  PasswordConsequencePlanStep,
  PasswordConsequenceScenePlan,
  PasswordConsequenceStepId,
} from '@passwo/visualization';
import { useMachine } from '@xstate/react';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { assign, setup } from 'xstate';
import { ReactFlowNetworkAdapter } from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import blueShieldAsset from '../../../../assets/s05/password-factor-shield.png';
import greenShieldAsset from '../../../../assets/s06/comparison-path-shield.png';
import { CelebrationConfetti } from '../../CelebrationConfetti.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { SectionTransition } from '../../SectionTransition.js';
import { AccountAssessmentNetwork } from '../AccountAssessmentNetwork.js';
import { createS06BlockedReplayTriangle } from '../S06/S06ConsequenceController.js';
import {
  createCompletedS02Network,
  createExpandedS09AccountNetwork,
  createProtectedS08Network,
  createS09ScalingComparisonResults,
  createS09ScalingRiskNetwork,
  createS08ProtectionNetwork,
  staticNetworkPresentation,
} from '../account-network.js';
import styles from './S08NetworkRewindStage.module.css';

export type S08AffectedAccountId = Exclude<S06AccountId, 'campusgram'>;

interface S08Context {
  readonly affectedAccountIds: readonly S08AffectedAccountId[];
  readonly initialStage: 's08' | 's09';
  readonly phaseDurationMs: number;
  readonly reductionDurationMs: number;
  readonly protectedAccountIds: readonly S08AffectedAccountId[];
}

type S08Event =
  | {
      readonly type: 'PROTECT_WITH_UNIQUE_PASSPHRASE';
      readonly accountId: S08AffectedAccountId;
    }
  | { readonly type: 'TRIANGLE_ANIMATION_COMPLETE' }
  | { readonly type: 'ANSWER_SELECTED' }
  | { readonly type: 'TRANSITION_COMPLETE' }
  | { readonly type: 'NEXT' };

const s08Machine = setup({
  types: {
    context: {} as S08Context,
    events: {} as S08Event,
    input: {} as {
      readonly affectedAccountIds: readonly S08AffectedAccountId[];
      readonly initialStage: 's08' | 's09';
      readonly phaseDurationMs: number;
      readonly reductionDurationMs: number;
    },
  },
  delays: {
    phaseDuration: ({ context }) => context.phaseDurationMs,
    reductionDuration: ({ context }) => context.reductionDurationMs,
  },
  guards: {
    hasNoAffectedAccounts: ({ context }) => context.affectedAccountIds.length === 0,
    allProtected: ({ context }) =>
      context.affectedAccountIds.every((accountId) =>
        context.protectedAccountIds.includes(accountId),
      ),
    canProtectAccount: ({ context, event }) =>
      event.type === 'PROTECT_WITH_UNIQUE_PASSPHRASE' &&
      context.affectedAccountIds.includes(event.accountId) &&
      !context.protectedAccountIds.includes(event.accountId),
    startsAtS09: ({ context }) => context.initialStage === 's09',
  },
  actions: {
    protectAccount: assign({
      protectedAccountIds: ({ context, event }) =>
        event.type === 'PROTECT_WITH_UNIQUE_PASSPHRASE'
          ? [...context.protectedAccountIds, event.accountId]
          : context.protectedAccountIds,
    }),
  },
}).createMachine({
  id: 's08ProtectionAndReplay',
  initial: 'entry',
  context: ({ input }) => ({
    affectedAccountIds: [...input.affectedAccountIds],
    initialStage: input.initialStage,
    phaseDurationMs: input.phaseDurationMs,
    reductionDurationMs: input.reductionDurationMs,
    protectedAccountIds:
      input.initialStage === 's09' ? [...input.affectedAccountIds] : [],
  }),
  states: {
    entry: {
      always: [
        { guard: 'startsAtS09', target: 's09Summary' },
        { target: 'protection' },
      ],
    },
    protection: {
      always: [
        { guard: 'hasNoAffectedAccounts', target: 'attackReady' },
        { guard: 'allProtected', target: 'attackReady' },
      ],
      on: {
        PROTECT_WITH_UNIQUE_PASSPHRASE: {
          guard: 'canProtectAccount',
          actions: 'protectAccount',
        },
      },
    },
    attackReady: { on: { NEXT: { target: 'incidentAttack' } } },
    incidentAttack: { after: { phaseDuration: { target: 'triangleAnimating' } } },
    triangleAnimating: {
      on: { TRIANGLE_ANIMATION_COMPLETE: { target: 'replayComplete' } },
    },
    replayComplete: { on: { NEXT: { target: 's09Summary' } } },
    s09Summary: { tags: ['s09'], on: { NEXT: { target: 's09Intro' } } },
    s09Intro: { tags: ['s09'], on: { NEXT: { target: 's09Expansion' } } },
    s09Expansion: {
      tags: ['s09', 'expanded'],
      on: { NEXT: { target: 's09Reduction' } },
    },
    s09Reduction: {
      tags: ['s09', 'expanded', 'reducing'],
      after: { reductionDuration: { target: 's09Question' } },
    },
    s09Question: {
      tags: ['s09', 'expanded'],
      on: { ANSWER_SELECTED: { target: 'passWoDifficulty' } },
    },
    passWoDifficulty: {
      tags: ['s09', 'expanded'],
      on: { NEXT: { target: 'passWoRisks' } },
    },
    passWoRisks: {
      tags: ['s09', 'expanded'],
      on: { NEXT: { target: 'passWoSolution' } },
    },
    passWoSolution: {
      tags: ['s09', 'expanded'],
      on: { NEXT: { target: 'managerTransition' } },
    },
    managerTransition: {
      on: { TRANSITION_COMPLETE: { target: 'managerLanding' } },
    },
    managerLanding: {},
  },
});

export interface S08NetworkRewindStageProps {
  readonly affectedAccountIds?: readonly S08AffectedAccountId[];
  readonly network?: NetworkSceneSnapshot | null;
  readonly plan?: PasswordConsequenceScenePlan | null;
  readonly platform: DesktopPlatform;
  readonly initialStage?: 's08' | 's09';
}

function replayDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 1450;
}

function accountReductionDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 760;
}

function affectedAccountId(nodeId: string): S08AffectedAccountId | null {
  if (nodeId === 'master-campus' || nodeId === 'campus-email') return nodeId;
  return null;
}

function planStep(
  plan: PasswordConsequenceScenePlan | null | undefined,
  stepId: PasswordConsequenceStepId,
): PasswordConsequencePlanStep | null {
  return plan?.steps.find(({ id }) => id === stepId) ?? null;
}

export function S08NetworkRewindStage({
  affectedAccountIds = [],
  network,
  plan,
  platform,
  initialStage = 's08',
}: S08NetworkRewindStageProps) {
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const [celebratingNodeId, setCelebratingNodeId] = useState<S08AffectedAccountId | null>(null);
  const [state, send] = useMachine(s08Machine, {
    input: {
      affectedAccountIds,
      initialStage,
      phaseDurationMs: replayDuration(),
      reductionDurationMs: accountReductionDuration(),
    },
  });
  const sourceNetwork = useMemo(
    () => network ?? createCompletedS02Network(),
    [network],
  );
  const preparationVisible = state.matches('protection');
  const firstPathStep = useMemo(
    () => planStep(plan, 's06-step-campusgram-master-campus'),
    [plan],
  );
  const secondPathStep = useMemo(
    () => planStep(plan, 's06-step-campusgram-campus-email'),
    [plan],
  );
  const thirdPathStep = useMemo(
    () => planStep(plan, 's06-step-master-campus-campus-email'),
    [plan],
  );
  const replayPhase = state.matches('incidentAttack')
    ? 'attack'
    : state.matches('attackReady')
      ? 'ready'
      : 'complete';
  const replayBaseNetwork = useMemo(
    () => createProtectedS08Network(sourceNetwork, replayPhase),
    [replayPhase, sourceNetwork],
  );
  const triangleNetwork = useMemo(
    () =>
      createS06BlockedReplayTriangle(
        replayBaseNetwork,
        [firstPathStep, secondPathStep, thirdPathStep].filter(
          (step): step is PasswordConsequencePlanStep => step !== null,
        ),
      ),
    [firstPathStep, replayBaseNetwork, secondPathStep, thirdPathStep],
  );
  const studyScaleNetwork = useMemo(
    () =>
      createExpandedS09AccountNetwork(
        triangleNetwork,
        s09PasswordSummaryContent.scaling.studyAccountCount,
      ),
    [triangleNetwork],
  );
  const reducingNetwork = useMemo(
    () =>
      createExpandedS09AccountNetwork(
        triangleNetwork,
        s09PasswordSummaryContent.scaling.studyAccountCount,
        s09PasswordSummaryContent.scaling.accountCount,
      ),
    [triangleNetwork],
  );
  const conservativeScaleNetwork = useMemo(
    () =>
      createExpandedS09AccountNetwork(
        triangleNetwork,
        s09PasswordSummaryContent.scaling.accountCount,
      ),
    [triangleNetwork],
  );
  const scalingComparisonResults = useMemo(
    () =>
      createS09ScalingComparisonResults(
        conservativeScaleNetwork,
        s09PasswordSummaryContent.scaling.riskFindingShare,
      ),
    [conservativeScaleNetwork],
  );
  const scalingRiskNetwork = useMemo(
    () =>
      createS09ScalingRiskNetwork(
        conservativeScaleNetwork,
        scalingComparisonResults,
      ),
    [conservativeScaleNetwork, scalingComparisonResults],
  );
  const projectedNetwork = useMemo(
    () => {
      if (preparationVisible) {
        return createS08ProtectionNetwork(
            sourceNetwork,
            state.context.affectedAccountIds,
            state.context.protectedAccountIds,
          );
      }
      if (state.matches('s09Expansion')) {
        return studyScaleNetwork;
      }
      if (state.matches('s09Reduction')) {
        return reducingNetwork;
      }
      if (
        state.matches('passWoDifficulty') ||
        state.matches('passWoRisks') ||
        state.matches('passWoSolution')
      ) {
        return scalingRiskNetwork.network;
      }
      if (state.hasTag('expanded')) {
        return conservativeScaleNetwork;
      }
      if (
        state.matches('triangleAnimating') ||
        state.matches('replayComplete') ||
        state.hasTag('s09')
      ) {
        return triangleNetwork;
      }
      return replayBaseNetwork;
    },
    [
      preparationVisible,
      conservativeScaleNetwork,
      replayBaseNetwork,
      reducingNetwork,
      scalingRiskNetwork,
      sourceNetwork,
      state,
      studyScaleNetwork,
      state.context.affectedAccountIds,
      state.context.protectedAccountIds,
      triangleNetwork,
    ],
  );
  const [adapter] = useState(() => new ReactFlowNetworkAdapter(projectedNetwork));
  useLayoutEffect(() => {
    adapter.render(projectedNetwork);
  }, [adapter, projectedNetwork]);
  const presentation = useMemo(
    () => {
      const base = staticNetworkPresentation(projectedNetwork);
      if (state.matches('triangleAnimating')) {
        return {
          ...base,
          drawingTargetNodeIds: [
            's06-step-campusgram-master-campus-shield',
            's06-step-campusgram-campus-email-shield',
            's06-step-master-campus-campus-email-shield',
          ],
        };
      }
      return base;
    },
    [projectedNetwork, state],
  );
  const actionLabels = {
    ...(state.context.affectedAccountIds.includes('master-campus') &&
    !state.context.protectedAccountIds.includes('master-campus')
      ? { 'master-campus': s08NetworkReplayContent.protectionAction }
      : {}),
    ...(state.context.affectedAccountIds.includes('campus-email') &&
    !state.context.protectedAccountIds.includes('campus-email')
      ? { 'campus-email': s08NetworkReplayContent.protectionAction }
      : {}),
  };
  const incidentAttackRunning = state.matches('incidentAttack');
  const pathReplayRunning = state.matches('triangleAnimating');
  const replayRunning = incidentAttackRunning || pathReplayRunning;
  const replayReady = state.matches('attackReady');
  const replayComplete = state.matches('replayComplete');
  const summaryVisible = state.matches('s09Summary');
  const scalingFindingsRevealing = state.matches('passWoDifficulty');
  const scalingFindingsVisible =
    scalingFindingsRevealing ||
    state.matches('passWoRisks') ||
    state.matches('passWoSolution');
  const passWoStep = state.matches('s09Intro')
    ? 0
    : state.matches('s09Expansion')
      ? 1
      : state.matches('s09Reduction') || state.matches('s09Question')
        ? 2
        : state.matches('passWoDifficulty')
          ? 3
          : state.matches('passWoRisks')
            ? 4
            : state.matches('passWoSolution')
              ? 5
              : null;

  useEffect(() => {
    if (
      pathReplayRunning &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      send({ type: 'TRIANGLE_ANIMATION_COMPLETE' });
    }
  }, [pathReplayRunning, send]);

  if (state.matches('managerTransition')) {
    const transition = s09PasswordSummaryContent.passwordManagerTransition;
    return (
      <SectionTransition
        sectionLabel={transition.sectionLabel}
        title={transition.title}
        currentSection={2}
        totalSections={3}
        parts={transition.parts}
        currentPart={1}
        holdDurationMs={transition.holdDurationMs}
        onComplete={() => send({ type: 'TRANSITION_COMPLETE' })}
      />
    );
  }

  if (state.matches('managerLanding')) {
    const transition = s09PasswordSummaryContent.passwordManagerTransition;
    return (
      <section className={styles.managerLanding} aria-labelledby="password-manager-title">
        <p>{transition.sectionLabel}</p>
        <h1 id="password-manager-title">{transition.title}</h1>
        <strong>{transition.parts[0]?.label}</strong>
      </section>
    );
  }

  return (
    <section
      className={styles.training}
      aria-label={
        state.hasTag('s09')
          ? s09PasswordSummaryContent.trainingAriaLabel
          : s08NetworkReplayContent.trainingAriaLabel
      }
      data-replay-phase={
        preparationVisible
          ? 'protection'
          : state.matches('triangleAnimating')
            ? 'triangle'
            : replayPhase
      }
      data-s09-expanded={state.hasTag('expanded') || undefined}
      data-s09-expanding={state.matches('s09Expansion') || undefined}
      data-s09-reducing={state.hasTag('reducing') || undefined}
    >
      <DesktopSurface
        platform={platform}
        browserDock={{ active: false, enabled: false, label: 'Browser geschlossen' }}
      >
        <div
          ref={networkHostRef}
          className={styles.network}
          onAnimationEndCapture={(event) => {
            if (
              pathReplayRunning &&
              event.target instanceof SVGPathElement &&
              event.target.matches('[data-network-edge-draw-mask]')
            ) {
              send({ type: 'TRIANGLE_ANIMATION_COMPLETE' });
            }
          }}
        >
          <AccountAssessmentNetwork
            adapter={adapter}
            presentation={presentation}
            ariaLabel={projectedNetwork.accessibleSummary}
            attackPhase={pathReplayRunning ? 'attacking' : 'incident-check'}
            attackerAccountId={replayRunning || replayComplete ? 'campusgram' : null}
            attackerAttemptStatus={replayRunning || replayComplete ? 'protected' : null}
            attackTargetId={replayRunning || replayComplete ? 'campusgram' : null}
            attackBlocked={replayRunning || replayComplete}
            attackEdgeId={null}
            showAccountShields
            overview={state.hasTag('expanded')}
            {...(scalingFindingsVisible
              ? {
                  comparisonResults: scalingComparisonResults,
                  comparisonResultsAriaHidden: true,
                  comparisonResultsCompact: true,
                  edgeRevealDelaysMs: scalingRiskNetwork.edgeRevealDelaysMs,
                  animateEdgeReveals: scalingFindingsRevealing,
                  ...(scalingFindingsRevealing
                    ? {
                        comparisonResultsSequential: true,
                      }
                    : {}),
                }
              : {})}
            celebratingNodeId={celebratingNodeId}
            interactionDisabled={!preparationVisible}
            nodeActionLabels={actionLabels}
            onNodeSelect={(nodeId) => {
              if (!preparationVisible) return;
              const accountId = affectedAccountId(nodeId);
              if (accountId === null || actionLabels[accountId] === undefined) return;
              setCelebratingNodeId(accountId);
              send({ type: 'PROTECT_WITH_UNIQUE_PASSPHRASE', accountId });
            }}
          />
          {replayComplete ? (
            <div className={styles.completionMoment} role="status" aria-live="polite">
              <CelebrationConfetti />
              <strong>{s08NetworkReplayContent.replayCompletion}</strong>
            </div>
          ) : null}
        </div>
        {replayReady ? (
          <button
            type="button"
            className={styles.replayAction}
            autoFocus
            onClick={() => {
              setCelebratingNodeId(null);
              send({ type: 'NEXT' });
            }}
          >
            {s08NetworkReplayContent.replayActions.attack}
          </button>
        ) : replayRunning ? null : replayComplete ? (
          <button
            type="button"
            className={styles.replayAction}
            autoFocus
            onClick={() => send({ type: 'NEXT' })}
          >
            {s08NetworkReplayContent.replayActions.finish}
          </button>
        ) : summaryVisible ? (
          <>
            <div className={styles.summaryDim} aria-hidden="true" />
            <section
              className={styles.summary}
              aria-label={s09PasswordSummaryContent.trainingAriaLabel}
            >
              <h1>{s09PasswordSummaryContent.title}</h1>
              <div className={styles.summaryOverview}>
                <img
                  className={styles.summaryShield}
                  src={greenShieldAsset}
                  alt=""
                  aria-hidden="true"
                />
                <ul className={styles.principles}>
                  {s09PasswordSummaryContent.principles.map((principle) => (
                    <li key={principle.id}>
                      <span>
                        {principle.parts.map((part, index) => {
                          if (part.emphasis === 'strong') {
                            return <strong key={index}>{part.text}</strong>;
                          }
                          if (part.emphasis === 'positive-strong') {
                            return (
                              <strong key={index} className={styles.principlePositive}>
                                {part.text}
                              </strong>
                            );
                          }
                          if (part.emphasis === 'info') {
                            return (
                              <span key={index} className={styles.principleInfo}>
                                {part.text}
                              </span>
                            );
                          }
                          return <span key={index}>{part.text}</span>;
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
                <img
                  className={styles.summaryShield}
                  src={blueShieldAsset}
                  alt=""
                  aria-hidden="true"
                />
              </div>
              <button
                type="button"
                className={styles.summaryAction}
                autoFocus
                onClick={() => send({ type: 'NEXT' })}
              >
                {s09PasswordSummaryContent.finishAction}
              </button>
            </section>
          </>
        ) : passWoStep !== null ? (
          <>
            <div className={styles.s09Dim} aria-hidden="true" />
            <section
              className={styles.passWoScene}
              aria-label="PassWo erklärt den Übergang zum Passwortmanager"
            >
              <PassWoGuide
                guideName={s09PasswordSummaryContent.passWo.guideName}
                taskLabel="Passwortmanager"
                helpOpen
                helpId="s09-passwo-speech"
                openHelpLabel="PassWo-Hinweis öffnen"
                speech={[s09PasswordSummaryContent.passWo.steps[passWoStep]]}
                speechEmphasis={
                  passWoSpeechEmphasisFor(
                    [
                      's09-scaling-intro',
                      's09-scaling-expansion',
                      's09-scaling-question',
                      's09-scaling-difficulty',
                      's09-scaling-risks',
                      's09-scaling-solution',
                    ][passWoStep] ?? '',
                  )
                }
                speechKey={`s09-${passWoStep}`}
                {...(state.matches('s09Reduction')
                  ? {}
                  : {
                      speechAction:
                        passWoStep === 2
                          ? {
                              kind: 'perform',
                              label: s09PasswordSummaryContent.scaling.answer,
                              onAction: () => send({ type: 'ANSWER_SELECTED' }),
                            }
                          : {
                              kind: 'advance',
                              label:
                                passWoStep === 5 ? 'Passwortmanager' : 'Weiter',
                              onAction: () => send({ type: 'NEXT' }),
                            },
                    })}
                placement="bottom-left"
                showHelpButton={false}
              />
            </section>
          </>
        ) : null}
      </DesktopSurface>
    </section>
  );
}

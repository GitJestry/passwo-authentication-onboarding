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
import { animate } from 'motion';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { assign, setup } from 'xstate';
import { ReactFlowNetworkAdapter } from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import { AccountAssessmentNetwork } from '../AccountAssessmentNetwork.js';
import { createS06BlockedReplayTriangle } from '../S06/S06ConsequenceController.js';
import {
  createCompletedS02Network,
  createProtectedS08Network,
  createS08ProtectionNetwork,
  staticNetworkPresentation,
} from '../account-network.js';
import styles from './S08NetworkRewindStage.module.css';

export type S08AffectedAccountId = Exclude<S06AccountId, 'campusgram'>;

interface S08Context {
  readonly affectedAccountIds: readonly S08AffectedAccountId[];
  readonly phaseDurationMs: number;
  readonly protectedAccountIds: readonly S08AffectedAccountId[];
}

type S08Event =
  | {
      readonly type: 'PROTECT_WITH_UNIQUE_PASSPHRASE';
      readonly accountId: S08AffectedAccountId;
    }
  | { readonly type: 'NEXT' };

const s08Machine = setup({
  types: {
    context: {} as S08Context,
    events: {} as S08Event,
    input: {} as {
      readonly affectedAccountIds: readonly S08AffectedAccountId[];
      readonly phaseDurationMs: number;
    },
  },
  delays: {
    phaseDuration: ({ context }) => context.phaseDurationMs,
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
  initial: 'protection',
  context: ({ input }) => ({
    affectedAccountIds: [...input.affectedAccountIds],
    phaseDurationMs: input.phaseDurationMs,
    protectedAccountIds: [],
  }),
  states: {
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
      after: { phaseDuration: { target: 'replayComplete' } },
    },
    replayComplete: { on: { NEXT: { target: 's09' } } },
    s09: {},
  },
});

export interface S08NetworkRewindStageProps {
  readonly affectedAccountIds?: readonly S08AffectedAccountId[];
  readonly network?: NetworkSceneSnapshot | null;
  readonly plan?: PasswordConsequenceScenePlan | null;
  readonly platform: DesktopPlatform;
}

function replayDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 1450;
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
}: S08NetworkRewindStageProps) {
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const [celebratingNodeId, setCelebratingNodeId] = useState<S08AffectedAccountId | null>(null);
  const [state, send] = useMachine(s08Machine, {
    input: { affectedAccountIds, phaseDurationMs: replayDuration() },
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
  const projectedNetwork = useMemo(
    () => {
      if (preparationVisible) {
        return createS08ProtectionNetwork(
            sourceNetwork,
            state.context.affectedAccountIds,
            state.context.protectedAccountIds,
          );
      }
      if (
        state.matches('triangleAnimating') ||
        state.matches('replayComplete') ||
        state.matches('s09')
      ) {
        return triangleNetwork;
      }
      return replayBaseNetwork;
    },
    [
      preparationVisible,
      replayBaseNetwork,
      sourceNetwork,
      state,
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
  const summaryVisible = state.matches('s09');

  useEffect(() => {
    if (!pathReplayRunning) return;
    const animations: ReturnType<typeof animate>[] = [];
    let frame: number | null = null;
    const startDrawing = () => {
      const edgeMasks = [
        ...(networkHostRef.current?.querySelectorAll<SVGPathElement>(
          '[data-network-edge-draw-mask]',
        ) ?? []),
      ];
      if (edgeMasks.length === 0) {
        frame = requestAnimationFrame(startDrawing);
        return;
      }
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      for (const edgeMask of edgeMasks) {
        const length = edgeMask.getTotalLength();
        if (!Number.isFinite(length) || length <= 0) continue;
        edgeMask.style.strokeDasharray = `${length}`;
        edgeMask.style.strokeDashoffset = reducedMotion ? '0' : `${length}`;
        edgeMask.style.opacity = '1';
        if (reducedMotion) continue;
        animations.push(
          animate(
            edgeMask,
            { strokeDashoffset: [length, 0] },
            { duration: state.context.phaseDurationMs / 1000, ease: 'easeInOut' },
          ),
        );
      }
    };
    frame = requestAnimationFrame(startDrawing);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      for (const animation of animations) animation.stop();
    };
  }, [pathReplayRunning, state.context.phaseDurationMs]);

  return (
    <section
      className={styles.training}
      aria-label={s08NetworkReplayContent.trainingAriaLabel}
      data-replay-phase={
        preparationVisible
          ? 'protection'
          : state.matches('triangleAnimating')
            ? 'triangle'
            : replayPhase
      }
    >
      <DesktopSurface
        platform={platform}
        browserDock={{ active: false, enabled: false, label: 'Browser geschlossen' }}
      >
        <div ref={networkHostRef} className={styles.network}>
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
              <p className={styles.summaryEyebrow}>{s09PasswordSummaryContent.eyebrow}</p>
              <h1>{s09PasswordSummaryContent.title}</h1>
              <ul className={styles.principles}>
                {s09PasswordSummaryContent.principles.map((principle, index) => (
                  <li key={principle.id}>
                    <span className={styles.principleNumber} aria-hidden="true">
                      {index + 1}
                    </span>
                    <div>
                      <strong>{principle.label}</strong>
                      <p>{principle.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </DesktopSurface>
    </section>
  );
}

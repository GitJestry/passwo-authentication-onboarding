import type { S06AccountId } from '@passwo/contracts';
import { s00Content, s08NetworkReplayContent } from '@passwo/training-content';
import type { DesktopPlatform } from '@passwo/ui';
import { DesktopSurface } from '@passwo/ui';
import type { NetworkSceneSnapshot } from '@passwo/visualization';
import { useMachine } from '@xstate/react';
import { useMemo, useState } from 'react';
import { assign, setup } from 'xstate';
import participantShieldAsset from '../../../../assets/study/participant-shield.png';
import { ReactFlowNetworkAdapter } from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { AccountAssessmentNetwork } from '../AccountAssessmentNetwork.js';
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
      always: { guard: 'allProtected', target: 'ready' },
      on: {
        PROTECT_WITH_UNIQUE_PASSPHRASE: {
          guard: 'canProtectAccount',
          actions: 'protectAccount',
        },
      },
    },
    ready: { on: { NEXT: { target: 'attack' } } },
    attack: { after: { phaseDuration: { target: 'whatIf' } } },
    whatIf: { after: { phaseDuration: { target: 'result' } } },
    result: {},
  },
});

export interface S08NetworkRewindStageProps {
  readonly affectedAccountIds?: readonly S08AffectedAccountId[];
  readonly network?: NetworkSceneSnapshot | null;
  readonly platform: DesktopPlatform;
}

function replayDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 1450;
}

function affectedAccountId(nodeId: string): S08AffectedAccountId | null {
  if (nodeId === 'master-campus' || nodeId === 'campus-email') return nodeId;
  return null;
}

export function S08NetworkRewindStage({
  affectedAccountIds = [],
  network,
  platform,
}: S08NetworkRewindStageProps) {
  const [celebratingNodeId, setCelebratingNodeId] = useState<S08AffectedAccountId | null>(null);
  const [state, send] = useMachine(s08Machine, {
    input: { affectedAccountIds, phaseDurationMs: replayDuration() },
  });
  const sourceNetwork = useMemo(
    () => network ?? createCompletedS02Network(),
    [network],
  );
  const preparationVisible = state.matches('protection') || state.matches('ready');
  const replayPhase = state.matches('attack')
    ? 'attack'
    : state.matches('whatIf')
      ? 'what-if'
      : 'complete';
  const projectedNetwork = useMemo(
    () =>
      preparationVisible
        ? createS08ProtectionNetwork(
            sourceNetwork,
            state.context.affectedAccountIds,
            state.context.protectedAccountIds,
          )
        : createProtectedS08Network(sourceNetwork, replayPhase),
    [
      preparationVisible,
      replayPhase,
      sourceNetwork,
      state.context.affectedAccountIds,
      state.context.protectedAccountIds,
    ],
  );
  const adapter = useMemo(
    () => new ReactFlowNetworkAdapter(projectedNetwork),
    [projectedNetwork],
  );
  const presentation = useMemo(
    () => staticNetworkPresentation(projectedNetwork),
    [projectedNetwork],
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
  const resultVisible = state.matches('result');

  return (
    <section
      className={styles.training}
      aria-label={s08NetworkReplayContent.trainingAriaLabel}
      data-replay-phase={preparationVisible ? 'protection' : replayPhase}
    >
      <DesktopSurface
        platform={platform}
        browserDock={{ active: false, enabled: false, label: 'Browser geschlossen' }}
      >
        <div className={styles.network}>
          <AccountAssessmentNetwork
            adapter={adapter}
            accountShieldAsset={participantShieldAsset}
            presentation={presentation}
            ariaLabel={projectedNetwork.accessibleSummary}
            attackPhase="incident-check"
            attackerAccountId={preparationVisible ? null : 'campusgram'}
            attackerAttemptStatus={preparationVisible ? null : 'protected'}
            attackTargetId={preparationVisible ? null : 'campusgram'}
            attackBlocked={!preparationVisible}
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
        {state.matches('ready') ? (
          <div className={styles.passWoLayer}>
            <PassWoGuide
              guideName={s00Content.narration.guideName}
              taskLabel={s08NetworkReplayContent.taskLabels.protection}
              helpOpen
              helpId="s08-passwo-protection"
              openHelpLabel={s00Content.narration.openGuideLabel}
              speech={[s08NetworkReplayContent.allProtected]}
              speechKey="s08-all-protected"
              speechAction={{
                kind: 'advance',
                onAction: () => {
                  setCelebratingNodeId(null);
                  send({ type: 'NEXT' });
                },
              }}
              placement="bottom-right"
              speechPlacement="left"
              showHelpButton={false}
            />
          </div>
        ) : !preparationVisible && !resultVisible ? (
          <p className={styles.phaseLabel} role="status">
            {state.matches('attack')
              ? s08NetworkReplayContent.replayLabels.attack
              : s08NetworkReplayContent.replayLabels.whatIf}
          </p>
        ) : resultVisible ? (
          <div className={styles.passWoLayer}>
            <PassWoGuide
              guideName={s00Content.narration.guideName}
              taskLabel={s08NetworkReplayContent.taskLabels.replay}
              helpOpen
              helpId="s08-passwo-speech"
              openHelpLabel={s00Content.narration.openGuideLabel}
              speech={[s08NetworkReplayContent.result]}
              speechKey="s08-protected-result"
              placement="bottom-right"
              speechPlacement="left"
              showHelpButton={false}
            />
          </div>
        ) : null}
      </DesktopSurface>
    </section>
  );
}

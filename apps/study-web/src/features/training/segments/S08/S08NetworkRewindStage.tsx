import { s00Content, s08NetworkReplayContent } from '@passwo/training-content';
import type { DesktopPlatform } from '@passwo/ui';
import { DesktopSurface } from '@passwo/ui';
import type { NetworkSceneSnapshot } from '@passwo/visualization';
import { useMachine } from '@xstate/react';
import { useMemo } from 'react';
import { setup } from 'xstate';
import { ReactFlowNetworkAdapter } from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { AccountAssessmentNetwork } from '../AccountAssessmentNetwork.js';
import {
  createCompletedS02Network,
  createProtectedS08Network,
  staticNetworkPresentation,
} from '../account-network.js';
import styles from './S08NetworkRewindStage.module.css';

const s08ReplayMachine = setup({
  types: {
    context: {} as { readonly phaseDurationMs: number },
    input: {} as { readonly phaseDurationMs: number },
  },
  delays: {
    phaseDuration: ({ context }) => context.phaseDurationMs,
  },
}).createMachine({
  id: 's08ProtectedReplay',
  initial: 'attack',
  context: ({ input }) => ({ phaseDurationMs: input.phaseDurationMs }),
  states: {
    attack: { after: { phaseDuration: { target: 'whatIf' } } },
    whatIf: { after: { phaseDuration: { target: 'result' } } },
    result: {},
  },
});

export interface S08NetworkRewindStageProps {
  readonly network?: NetworkSceneSnapshot | null;
  readonly platform: DesktopPlatform;
}

function replayDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 1450;
}

export function S08NetworkRewindStage({ network, platform }: S08NetworkRewindStageProps) {
  const [state] = useMachine(s08ReplayMachine, {
    input: { phaseDurationMs: replayDuration() },
  });
  const phase = state.matches('attack') ? 'attack' : state.matches('whatIf') ? 'what-if' : 'complete';
  const replayNetwork = useMemo(
    () =>
      createProtectedS08Network(network ?? createCompletedS02Network(), phase),
    [network, phase],
  );
  const adapter = useMemo(() => new ReactFlowNetworkAdapter(replayNetwork), [replayNetwork]);
  const presentation = useMemo(
    () => staticNetworkPresentation(replayNetwork),
    [replayNetwork],
  );
  const resultVisible = state.matches('result');

  return (
    <section
      className={styles.training}
      aria-label={s08NetworkReplayContent.trainingAriaLabel}
      data-replay-phase={phase}
    >
      <DesktopSurface
        platform={platform}
        browserDock={{ active: false, enabled: false, label: 'Browser geschlossen' }}
      >
        <div className={styles.network}>
          <AccountAssessmentNetwork
            adapter={adapter}
            presentation={presentation}
            ariaLabel={replayNetwork.accessibleSummary}
            attackPhase="incident-check"
            attackerAccountId="campusgram"
            attackerAttemptStatus="protected"
            attackTargetId="campusgram"
            attackBlocked
          />
        </div>
        {!resultVisible ? (
          <p className={styles.phaseLabel} role="status">
            {state.matches('attack')
              ? s08NetworkReplayContent.replayLabels.attack
              : s08NetworkReplayContent.replayLabels.whatIf}
          </p>
        ) : (
          <div className={styles.passWoLayer}>
            <PassWoGuide
              guideName={s00Content.narration.guideName}
              taskLabel="Angriff erneut ansehen"
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
        )}
      </DesktopSurface>
    </section>
  );
}

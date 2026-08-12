import type { S06AccountId, S07RecommendationProjectionInput } from '@passwo/contracts';
import { s00Content, type S06ConsequenceFixtureId } from '@passwo/training-content';
import type { DesktopPlatform } from '@passwo/ui';
import type { NetworkSceneSnapshot, PasswordConsequenceScenePlan } from '@passwo/visualization';
import { useEffect, useRef, useState } from 'react';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import { ReactFlowNetworkAdapter } from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { AccountAssessmentNetwork } from '../AccountAssessmentNetwork.js';
import {
  type S06ConsequenceControllerSnapshot,
  type S06ConsequenceAccountInputs,
  createS06ConsequenceScenePlan,
  createS06FixtureScenePlan,
  S06ConsequenceController,
} from './S06ConsequenceController.js';
import styles from './S06ConsequenceTraining.module.css';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface Runtime {
  readonly controller: S06ConsequenceController;
  readonly renderer: ReactFlowNetworkAdapter;
  readonly plan: PasswordConsequenceScenePlan;
}

export type S06TimingState = 'active' | 'writingEnd' | 'endWriteFailed';

export type S06ConsequenceSource =
  | { readonly kind: 'fixture'; readonly fixtureId: S06ConsequenceFixtureId }
  | { readonly kind: 'runtime'; readonly accounts: S06ConsequenceAccountInputs };

export interface S06ConsequenceTrainingProps {
  readonly source: S06ConsequenceSource;
  readonly platform?: DesktopPlatform;
  readonly timingState?: S06TimingState;
  readonly timingErrorCode?: string | null;
  readonly externalTimingError?: string | null;
  readonly onRetryTiming?: () => void;
  readonly onComplete?: () => void;
  readonly onEvaluationInputReady?: (input: S07RecommendationProjectionInput) => void;
  readonly onSummaryNetworkReady?: (network: NetworkSceneSnapshot) => void;
}

interface PlanCache {
  readonly sourceIdentity: S06ConsequenceFixtureId | S06ConsequenceAccountInputs;
  readonly plan: PasswordConsequenceScenePlan;
}

function createScenePlan(
  fixtureId: S06ConsequenceFixtureId | null,
  runtimeAccounts: S06ConsequenceAccountInputs | null,
): PasswordConsequenceScenePlan {
  if (fixtureId !== null) return createS06FixtureScenePlan(fixtureId);
  if (runtimeAccounts !== null) {
    return createS06ConsequenceScenePlan('supportive-runtime-s06', runtimeAccounts);
  }
  throw new Error('S06 consequence source is missing.');
}

export function S06ConsequenceTraining({
  source,
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onRetryTiming,
  onComplete,
  onEvaluationInputReady,
  onSummaryNetworkReady,
}: S06ConsequenceTrainingProps) {
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const planCacheRef = useRef<PlanCache | null>(null);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S06ConsequenceControllerSnapshot | null>(null);
  const fixtureId = source.kind === 'fixture' ? source.fixtureId : null;
  const runtimeAccounts = source.kind === 'runtime' ? source.accounts : null;

  useEffect(() => {
    const sourceIdentity = fixtureId ?? runtimeAccounts;
    if (sourceIdentity === null) return;
    const cachedPlan = planCacheRef.current;
    const plan =
      cachedPlan?.sourceIdentity === sourceIdentity
        ? cachedPlan.plan
        : createScenePlan(fixtureId, runtimeAccounts);
    planCacheRef.current = { sourceIdentity, plan };
    onEvaluationInputReady?.(plan.resolvedResult);
    const summaryNetwork = plan.steps.at(-1)?.network;
    if (summaryNetwork !== undefined) onSummaryNetworkReady?.(summaryNetwork);
    const allNodeIds = [
      ...new Set(plan.steps.flatMap(({ network }) => network.nodes.map(({ id }) => id))),
    ];
    let controller: S06ConsequenceController | null = null;
    const animationPlayer = new NetworkMotionAdapter({
      initialNodeId: 'campusgram',
      initialRevealedNodeIds: allNodeIds,
      applySnapshot: (presentation) => controller?.updatePresentation(presentation),
      getCharacterElement: () => null,
      getActiveNodeElement: () =>
        networkHostRef.current?.querySelector<HTMLElement>(
          '[data-active="true"] [data-scene-node-button]',
        ) ?? null,
      getNodeElement: (nodeId) =>
        networkHostRef.current?.querySelector<HTMLElement>(
          `[data-scene-node-button="${nodeId}"]`,
        ) ?? null,
      prefersReducedMotion,
    });
    controller = new S06ConsequenceController({
      plan,
      animationPlayer,
      ...(onComplete === undefined ? {} : { onComplete }),
    });
    const renderer = new ReactFlowNetworkAdapter(controller.getSnapshot().step.network);
    controller.attachRenderer(renderer);
    const unsubscribe = controller.subscribe(setSnapshot);
    setRuntime({ controller, renderer, plan });
    setSnapshot(controller.getSnapshot());

    return () => {
      unsubscribe();
      void controller?.dispose();
    };
  }, [fixtureId, onComplete, onEvaluationInputReady, onSummaryNetworkReady, runtimeAccounts]);

  if (runtime === null || snapshot === null) return null;

  const timingFailure = timingState === 'endWriteFailed';
  const speechAction = timingFailure
    ? onRetryTiming === undefined
      ? undefined
      : {
          kind: 'perform' as const,
          label: 'Erneut versuchen',
          onAction: onRetryTiming,
        }
    : snapshot.controls.canStart
      ? {
          kind: 'perform' as const,
          label: 'Simulation starten',
          onAction: () => runtime.controller.start(),
        }
      : snapshot.controls.canContinue
        ? {
            kind: 'advance' as const,
            onAction: () => void runtime.controller.continue(),
          }
        : undefined;
  const speech = timingFailure
    ? [
        'Die Segmentgrenze konnte nicht bestätigt werden.',
        `Fehlercode: ${externalTimingError ?? timingErrorCode ?? 'unbekannt'}`,
      ]
    : timingState === 'writingEnd'
      ? ['Segmentabschluss wird bestätigt …']
      : [snapshot.participant.narration.body];

  return (
    <section className={styles.training} aria-label="PassWo, Segment S06, Passwortfolgen">
      <article className={styles.page} data-scene-mode={snapshot.step.mode}>
        <div ref={networkHostRef} className={styles.networkPanel}>
          <AccountAssessmentNetwork
            adapter={runtime.renderer}
            presentation={snapshot.presentation}
          />
        </div>
        <div className={styles.passWoLayer} role={timingFailure ? 'alert' : undefined}>
          <PassWoGuide
            guideName={s00Content.narration.guideName}
            taskLabel={snapshot.participant.narration.heading}
            helpOpen
            helpId="s06-passwo-speech"
            openHelpLabel={s00Content.narration.openGuideLabel}
            speech={speech}
            speechKey={`s06-${snapshot.step.id}-${timingState}`}
            speechEmphasis={passWoSpeechEmphasisFor(snapshot.step.narrationId)}
            {...(speechAction === undefined ? {} : { speechAction })}
            speechObstacleSelector="[data-scene-node]"
            speechPlacement="above"
            placement="bottom-left"
            pose={snapshot.step.mode === 'actual' ? 'warning' : 'default'}
            showHelpButton={false}
          />
        </div>
      </article>
    </section>
  );
}

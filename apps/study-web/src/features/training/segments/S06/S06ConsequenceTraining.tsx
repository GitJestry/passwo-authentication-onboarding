import type { S06AccountId } from '@passwo/contracts';
import {
  getS06ConsequenceFixture,
  s00Content,
  s06ConsequenceContent,
  type S06ConsequenceFixtureId,
} from '@passwo/training-content';
import type { DesktopPlatform } from '@passwo/ui';
import type { NetworkSceneSnapshot, PasswordConsequenceScenePlan } from '@passwo/visualization';
import { useEffect, useRef, useState } from 'react';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import { ReactFlowNetworkAdapter } from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import whatIfLogo from '../../../../assets/s06/what-if-logo.webp';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { AccountAssessmentNetwork } from '../AccountAssessmentNetwork.js';
import { S06LocalPasswordReflection } from './S06LocalPasswordReflection.js';
import { S06PasswordComparisonProjection } from './S06PasswordComparisonProjection.js';
import {
  type S06ConsequenceControllerSnapshot,
  type S06ConsequenceControllerOptions,
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
  readonly onSemanticEvidenceChange?: S06ConsequenceControllerOptions['onSemanticEvidenceChange'];
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

function accountInputsForSource(source: S06ConsequenceSource): S06ConsequenceAccountInputs {
  return source.kind === 'runtime'
    ? source.accounts
    : getS06ConsequenceFixture(source.fixtureId).accounts;
}

function localFindingIsVisible(
  plan: PasswordConsequenceScenePlan,
  snapshot: S06ConsequenceControllerSnapshot,
  accountId: S06AccountId,
): boolean {
  if (accountId === 'campusgram') return true;
  const localStepId =
    accountId === 'master-campus'
      ? 's06-step-master-campus-perspective'
      : 's06-step-campus-email-local-check';
  const localStepIndex = plan.steps.findIndex(({ id }) => id === localStepId);
  return (
    localStepIndex >= 0 &&
    (snapshot.stepIndex > localStepIndex ||
      (snapshot.stepIndex === localStepIndex && snapshot.stage === 'local-check-result'))
  );
}

export function S06ConsequenceTraining({
  source,
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onRetryTiming,
  onComplete,
  onSemanticEvidenceChange,
  onSummaryNetworkReady,
}: S06ConsequenceTrainingProps) {
  const sceneRef = useRef<HTMLElement | null>(null);
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const planCacheRef = useRef<PlanCache | null>(null);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S06ConsequenceControllerSnapshot | null>(null);
  const [initialSource] = useState(source);
  const fixtureId = initialSource.kind === 'fixture' ? initialSource.fixtureId : null;
  const runtimeAccounts = initialSource.kind === 'runtime' ? initialSource.accounts : null;

  useEffect(() => {
    const sourceIdentity = fixtureId ?? runtimeAccounts;
    if (sourceIdentity === null) return;
    const cachedPlan = planCacheRef.current;
    const plan =
      cachedPlan?.sourceIdentity === sourceIdentity
        ? cachedPlan.plan
        : createScenePlan(fixtureId, runtimeAccounts);
    planCacheRef.current = { sourceIdentity, plan };
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
      getEdgeElement: () =>
        networkHostRef.current?.querySelector<SVGPathElement>(
          '[data-network-edge-current-attack="true"] [data-network-edge-draw-mask]',
        ) ?? null,
      prefersReducedMotion,
    });
    controller = new S06ConsequenceController({
      plan,
      accountInputs: accountInputsForSource(initialSource),
      animationPlayer,
      prefersReducedMotion,
      ...(onSemanticEvidenceChange === undefined ? {} : { onSemanticEvidenceChange }),
      ...(onComplete === undefined ? {} : { onComplete }),
    });
    const renderer = new ReactFlowNetworkAdapter(controller.getSnapshot().step.network);
    for (const node of controller.getSnapshot().step.network.nodes) {
      if (
        node.status === 'affected' ||
        node.status === 'exposed' ||
        node.status === 'protected'
      ) {
        renderer.completeStatusCascade(node.id);
      }
    }
    controller.attachRenderer(renderer);
    const unsubscribe = controller.subscribe(setSnapshot);
    const unsubscribeStatusCascade = renderer.subscribeStatusCascade((settledNodeIds) => {
      controller?.resolutionVisualSettled(settledNodeIds);
    });
    setRuntime({ controller, renderer, plan });
    setSnapshot(controller.getSnapshot());

    return () => {
      unsubscribeStatusCascade();
      unsubscribe();
      void controller?.dispose();
    };
  }, [fixtureId, initialSource, onComplete, onSemanticEvidenceChange, onSummaryNetworkReady, runtimeAccounts]);

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
    : snapshot.showGuide && snapshot.controls.canContinue
      ? snapshot.controls.canStart
        ? {
            kind: 'perform' as const,
            label: s06ConsequenceContent.page.attackStart,
            onAction: () => void runtime.controller.continue(),
          }
        : snapshot.stage === 's07-transition'
          ? {
              kind: 'perform' as const,
              label: s06ConsequenceContent.page.replacePassword,
              onAction: () => void runtime.controller.continue(),
            }
          : {
              kind: 'advance' as const,
              label: s06ConsequenceContent.page.continue,
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
  const attackSourceAccountId = snapshot.attackSourceAccountId;
  const localFindingPending =
    snapshot.stage === 'data-leak-transition' || snapshot.stage === 'local-reflection';
  const attackerAttemptStatus =
    attackSourceAccountId !== null
      ? localFindingPending
        ? 'neutral'
        : snapshot.localFindingAccountIds.includes(attackSourceAccountId)
          ? 'exposed'
          : 'protected'
      : null;
  const showsIncidentCascade =
    snapshot.stage === 'local-check-result' && attackerAttemptStatus === 'exposed';
  const comparison =
    !snapshot.comparisonPreviewVisible ||
    snapshot.step.sourceAccountId === null ||
    snapshot.step.targetAccountId === null ||
    snapshot.step.relation === null
      ? null
      : {
          sourceAccountId: snapshot.step.sourceAccountId,
          targetAccountId: snapshot.step.targetAccountId,
          relation: snapshot.step.relation,
          sourcePassword:
            runtime.plan.accounts.find(
              ({ accountId }) => accountId === snapshot.step.sourceAccountId,
            )?.fictionalPassword ?? '',
          targetPassword:
            runtime.plan.accounts.find(
              ({ accountId }) => accountId === snapshot.step.targetAccountId,
            )?.fictionalPassword ?? '',
        };
  const easyToGuessAccountIds = snapshot.localFindingAccountIds.filter((accountId) =>
    localFindingIsVisible(runtime.plan, snapshot, accountId),
  );

  return (
    <section className={styles.training} aria-label="PassWo, Segment S06, Passwortfolgen">
      <article
        ref={sceneRef}
        className={styles.page}
        data-scene-mode={snapshot.isHypothetical ? 'hypothetical' : snapshot.step.mode}
      >
        <div ref={networkHostRef} className={styles.networkPanel}>
          <AccountAssessmentNetwork
            adapter={runtime.renderer}
            presentation={snapshot.presentation}
            attackPhase={snapshot.attackPhase}
            attackerAccountId={snapshot.attackSourceAccountId}
            attackerDepartureAccountId={snapshot.attackDepartureAccountId}
            attackerAttemptStatus={attackerAttemptStatus}
            attackTargetId={snapshot.step.targetAccountId}
            attackEdgeId={snapshot.comparisonVisible ? `${snapshot.step.id}-path` : null}
            attackBlocked={
              snapshot.step.relation?.kind === 'no-derived-path-recognized'
            }
            statusCascadeStartDelayMs={showsIncidentCascade ? 1100 : 120}
            easyToGuessAccountIds={easyToGuessAccountIds}
            hideDetailSymbols
            showEdgeLabels
          />
        </div>
        {snapshot.isHypothetical ? (
          <img
            className={styles.hypotheticalLogo}
            src={whatIfLogo}
            width={512}
            height={512}
            alt={s06ConsequenceContent.modes.hypothetical.overlay}
          />
        ) : null}
        {comparison === null ? null : (
          <S06PasswordComparisonProjection
            key={snapshot.step.id}
            sceneRef={sceneRef}
            networkHostRef={networkHostRef}
            sourceAccountId={comparison.sourceAccountId}
            targetAccountId={comparison.targetAccountId}
            sourcePassword={comparison.sourcePassword}
            targetPassword={comparison.targetPassword}
            relation={comparison.relation}
            phase={
              snapshot.attackPhase === 'preview-ready' || snapshot.attackPhase === 'resolving'
                ? snapshot.attackPhase
                : 'attacking'
            }
            onPreviewComplete={() => runtime.controller.previewCompleted(snapshot.step.id)}
            onAdvance={() => runtime.controller.resolvePreview(snapshot.step.id)}
            finishLabel={
              snapshot.step.targetAccountId === 'campus-email'
                ? s06ConsequenceContent.page.finish
                : s06ConsequenceContent.page.continue
            }
            onResolutionComplete={() => runtime.controller.resolutionCompleted(snapshot.step.id)}
          />
        )}
        {snapshot.localReflection === null ? null : (
          <S06LocalPasswordReflection
            reflection={snapshot.localReflection}
            interactive={snapshot.stage === 'local-reflection'}
            onModeChange={(mode) => runtime.controller.selectLocalReflectionMode(mode)}
            onGroupSelect={(groupId) => runtime.controller.selectLocalReflectionGroup(groupId)}
            onGroupAdd={() => runtime.controller.addLocalReflectionGroup()}
            onGroupRemove={(groupId) => runtime.controller.removeLocalReflectionGroup(groupId)}
            onBlockToggle={(blockId) => runtime.controller.toggleLocalReflectionBlock(blockId)}
            onPersonalCreate={(start, end) =>
              runtime.controller.addLocalPersonalCandidate(start, end)
            }
            onPersonalRemove={(candidateId) =>
              runtime.controller.removeLocalPersonalCandidate(candidateId)
            }
            onFinish={() => runtime.controller.completeLocalReflection()}
          />
        )}
        {timingFailure || snapshot.showGuide ? (
          <div className={styles.passWoLayer} role={timingFailure ? 'alert' : undefined}>
            <PassWoGuide
              guideName={s00Content.narration.guideName}
              taskLabel={snapshot.participant.narration.heading}
              helpOpen
              helpId="s06-passwo-speech"
              openHelpLabel={s00Content.narration.openGuideLabel}
              speech={speech}
              speechKey={`s06-${snapshot.stage}-${snapshot.step.id}-${timingState}`}
              speechEmphasis={passWoSpeechEmphasisFor(snapshot.participant.narrationId)}
              speechTone="dark"
              {...(speechAction === undefined ? {} : { speechAction })}
              speechObstacleSelector="[data-scene-node]"
              speechPlacement="right"
              placement="bottom-left"
              pose={snapshot.stage === 'initial-found' ? 'warning' : 'default'}
              showHelpButton={false}
            />
          </div>
        ) : null}
      </article>
    </section>
  );
}

import type {
  PasswordEvidenceSpan,
  S06AccountId,
  S07RecommendationProjectionInput,
} from '@passwo/contracts';
import type { S06ConsequenceFixtureId } from '@passwo/training-content';
import { s06ConsequenceContent } from '@passwo/training-content';
import type { PasswordConsequenceScenePlan } from '@passwo/visualization';
import { type BrowserShellSnapshot, BrowserShell } from '@passwo/ui';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import {
  ReactFlowNetwork,
  ReactFlowNetworkAdapter,
} from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import {
  type S06ConsequenceControllerSnapshot,
  type S06ConsequenceAccountInputs,
  createS06ConsequenceScenePlan,
  createS06FixtureScenePlan,
  S06ConsequenceController,
} from './S06ConsequenceController.js';
import styles from './S06ConsequenceTraining.module.css';

const browserSnapshot: BrowserShellSnapshot = {
  tabs: [s06ConsequenceContent.browser.tab],
  activeTabId: s06ConsequenceContent.browser.tab.id,
  address: s06ConsequenceContent.browser.address,
};

const accountOrder = ['campusgram', 'master-campus', 'campus-email'] as const;

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
  readonly timingState?: S06TimingState;
  readonly timingErrorCode?: string | null;
  readonly externalTimingError?: string | null;
  readonly onRetryTiming?: () => void;
  readonly onComplete?: () => void;
  readonly onEvaluationInputReady?: (input: S07RecommendationProjectionInput) => void;
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

function FictionalPassword({
  value,
  evidence,
  revealed,
}: {
  readonly value: string;
  readonly evidence: readonly PasswordEvidenceSpan[];
  readonly revealed: boolean;
}) {
  if (!revealed) return <code>{'•'.repeat(Math.max(8, value.length))}</code>;
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const span of [...evidence].sort((left, right) => left.start - right.start)) {
    if (cursor < span.start) {
      parts.push(<span key={`plain-${cursor}`}>{value.slice(cursor, span.start)}</span>);
    }
    parts.push(
      <mark key={`evidence-${span.start}-${span.end}`}>{value.slice(span.start, span.end)}</mark>,
    );
    cursor = Math.max(cursor, span.end);
  }
  if (cursor < value.length) parts.push(<span key={`plain-${cursor}`}>{value.slice(cursor)}</span>);
  return <code>{parts}</code>;
}

export function S06ConsequenceTraining({
  source,
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onRetryTiming,
  onComplete,
  onEvaluationInputReady,
}: S06ConsequenceTrainingProps) {
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const planCacheRef = useRef<PlanCache | null>(null);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S06ConsequenceControllerSnapshot | null>(null);
  const [passwordsRevealed, setPasswordsRevealed] = useState(false);
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
    onEvaluationInputReady?.({
      incidentSource: plan.incidentSource,
      accounts: plan.accounts,
      comparisons: plan.comparisons,
    });
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
    setPasswordsRevealed(false);

    return () => {
      unsubscribe();
      void controller?.dispose();
    };
  }, [fixtureId, onComplete, onEvaluationInputReady, runtimeAccounts]);

  if (runtime === null || snapshot === null) return null;

  const relation = snapshot.step.relation;
  const sourceAnalysis = runtime.plan.accounts.find(
    ({ accountId }) => accountId === snapshot.step.sourceAccountId,
  );
  const targetAnalysis = runtime.plan.accounts.find(
    ({ accountId }) => accountId === snapshot.step.targetAccountId,
  );

  return (
    <section className={styles.training} aria-label={s06ConsequenceContent.trainingAriaLabel}>
      <BrowserShell
        snapshot={browserSnapshot}
        ariaLabel={s06ConsequenceContent.browser.ariaLabel}
        onTabSelect={() => undefined}
      >
        <article
          className={styles.page}
          data-scene-mode={snapshot.step.mode}
          aria-labelledby="s06-consequence-title"
        >
          <header className={styles.pageHeader}>
            <div>
              <p className={styles.eyebrow}>{s06ConsequenceContent.page.eyebrow}</p>
              <h1 id="s06-consequence-title">{s06ConsequenceContent.page.title}</h1>
              <p>{s06ConsequenceContent.page.instruction}</p>
            </div>
            <div className={styles.headerControls}>
              <span className={styles.fixtureNotice}>
                {source.kind === 'fixture'
                  ? s06ConsequenceContent.page.fixtureNotice
                  : s06ConsequenceContent.page.runtimeNotice}
              </span>
              <button type="button" onClick={() => setPasswordsRevealed((revealed) => !revealed)}>
                {passwordsRevealed
                  ? s06ConsequenceContent.page.hidePassword
                  : s06ConsequenceContent.page.showPassword}
              </button>
            </div>
          </header>

          <div className={styles.modeOverlay} role="status">
            <strong>{snapshot.participant.mode.heading}</strong>
            <span>{snapshot.participant.mode.overlay}</span>
          </div>

          <div className={styles.passwordRow} aria-label="Fiktive Übungspasswörter">
            {accountOrder.map((accountId) => {
              const account = snapshot.step.network.nodes.find(({ id }) => id === accountId);
              const accountAnalysis = runtime.plan.accounts.find(
                (candidate) => candidate.accountId === accountId,
              );
              if (account === undefined || accountAnalysis === undefined) return null;
              return (
                <section key={accountId} className={styles.passwordCard}>
                  <span>Ausdrücklich fiktiver Übungswert</span>
                  <strong>{account.label}</strong>
                  <FictionalPassword
                    value={accountAnalysis.fictionalPassword}
                    evidence={[]}
                    revealed={passwordsRevealed}
                  />
                </section>
              );
            })}
          </div>

          <div className={styles.workspace}>
            <div ref={networkHostRef} className={styles.networkPanel}>
              <ReactFlowNetwork
                adapter={runtime.renderer}
                presentation={snapshot.presentation}
                onNodeSelect={() => undefined}
              />
            </div>
            <aside className={styles.sidebar} aria-labelledby="s06-step-title">
              <p className={styles.modeStatus}>{snapshot.participant.mode.status}</p>
              <p className={styles.stepCount}>
                Schritt {snapshot.stepIndex + 1} von 7 · {snapshot.step.id}
              </p>
              <h2 id="s06-step-title">{snapshot.participant.narration.heading}</h2>
              <p>{snapshot.participant.narration.body}</p>
              {snapshot.participant.relationLabel === null ? null : (
                <p className={styles.relationStatus}>{snapshot.participant.relationLabel}</p>
              )}
              {snapshot.participant.transformationLabel === null ? null : (
                <p>{snapshot.participant.transformationLabel}</p>
              )}
              {relation === null ||
              sourceAnalysis === undefined ||
              targetAnalysis === undefined ? null : (
                <section className={styles.comparison} aria-label="Vergleich fiktiver Passwörter">
                  <p>Ausgangswert · ausdrücklich fiktiv</p>
                  <FictionalPassword
                    value={sourceAnalysis.fictionalPassword}
                    evidence={relation.sourceEvidence}
                    revealed={passwordsRevealed}
                  />
                  <p>Zielwert · ausdrücklich fiktiv</p>
                  <FictionalPassword
                    value={targetAnalysis.fictionalPassword}
                    evidence={relation.targetEvidence}
                    revealed={passwordsRevealed}
                  />
                </section>
              )}
              {snapshot.participant.generatedCandidate === null ? null : (
                <p className={styles.candidate}>
                  Erzeugter fiktiver Kandidat:{' '}
                  <FictionalPassword
                    value={snapshot.participant.generatedCandidate}
                    evidence={[]}
                    revealed={passwordsRevealed}
                  />
                </p>
              )}
              <p className={styles.roleSummary}>
                {accountOrder
                  .map(
                    (accountId) =>
                      `${s06ConsequenceContent.accounts[accountId].label}: ${s06ConsequenceContent.accounts[accountId].roleSummary}`,
                  )
                  .join(' · ')}
              </p>
              <div className={styles.buttonRow}>
                <button
                  type="button"
                  disabled={!snapshot.controls.canStart}
                  onClick={() => runtime.controller.start()}
                >
                  {s06ConsequenceContent.page.start}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={!snapshot.controls.canReplay}
                  onClick={() => runtime.controller.replay()}
                >
                  {s06ConsequenceContent.page.replay}
                </button>
                <button
                  type="button"
                  disabled={!snapshot.controls.canContinue}
                  onClick={() => void runtime.controller.continue()}
                >
                  {s06ConsequenceContent.page.continue}
                </button>
                {snapshot.phase === 'complete' && timingState === 'active' ? (
                  <p className={styles.completeStatus} role="status">
                    {s06ConsequenceContent.page.complete}
                  </p>
                ) : null}
                {timingState === 'writingEnd' ? (
                  <p className={styles.completeStatus} role="status">
                    Segmentabschluss wird bestätigt …
                  </p>
                ) : null}
                {timingState === 'endWriteFailed' ? (
                  <div className={styles.timingError} role="alert">
                    <p>Die Segmentgrenze konnte nicht bestätigt werden.</p>
                    <p>Fehlercode: {externalTimingError ?? timingErrorCode}</p>
                    <button type="button" onClick={onRetryTiming}>
                      Erneut versuchen
                    </button>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </article>
      </BrowserShell>
    </section>
  );
}

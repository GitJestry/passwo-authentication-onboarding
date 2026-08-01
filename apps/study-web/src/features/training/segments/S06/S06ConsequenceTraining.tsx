import type { S06AccountId } from '@passwo/contracts';
import {
  type PasswordConsequenceScenePlan,
} from '@passwo/visualization';
import {
  type S06ConsequenceFixtureId,
  s06ConsequenceContent,
} from '@passwo/training-content';
import { type BrowserShellSnapshot, BrowserShell } from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import {
  ReactFlowNetwork,
  ReactFlowNetworkAdapter,
} from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import {
  type S06ConsequenceControllerSnapshot,
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

export function S06ConsequenceTraining({
  fixtureId,
}: {
  readonly fixtureId: S06ConsequenceFixtureId;
}) {
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S06ConsequenceControllerSnapshot | null>(null);
  const [revealedAccounts, setRevealedAccounts] = useState<ReadonlySet<S06AccountId>>(new Set());

  useEffect(() => {
    const plan = createS06FixtureScenePlan(fixtureId);
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
    controller = new S06ConsequenceController({ plan, animationPlayer });
    const renderer = new ReactFlowNetworkAdapter(controller.getSnapshot().step.network);
    controller.attachRenderer(renderer);
    const unsubscribe = controller.subscribe(setSnapshot);
    setRuntime({ controller, renderer, plan });
    setSnapshot(controller.getSnapshot());
    setRevealedAccounts(new Set());

    return () => {
      unsubscribe();
      void controller?.dispose();
    };
  }, [fixtureId]);

  if (runtime === null || snapshot === null) return null;

  function togglePassword(accountId: S06AccountId): void {
    setRevealedAccounts((current) => {
      const next = new Set(current);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      return next;
    });
  }

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
            <span className={styles.fixtureNotice}>{s06ConsequenceContent.page.fixtureNotice}</span>
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
              const revealed = revealedAccounts.has(accountId);
              if (account === undefined || accountAnalysis === undefined) return null;
              return (
                <section key={accountId} className={styles.passwordCard}>
                  <span>Ausdrücklich fiktiver Übungswert</span>
                  <strong>{account.label}</strong>
                  <code>{revealed ? accountAnalysis.fictionalPassword : '••••••••••••'}</code>
                  <button type="button" onClick={() => togglePassword(accountId)}>
                    {revealed
                      ? s06ConsequenceContent.page.hidePassword
                      : s06ConsequenceContent.page.showPassword}
                  </button>
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
              {snapshot.participant.generatedCandidate === null ? null : (
                <p className={styles.candidate}>
                  Tatsächlich erzeugter fiktiver Kandidat:{' '}
                  <code>{snapshot.participant.generatedCandidate}</code>
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
                {snapshot.phase === 'complete' ? (
                  <p className={styles.completeStatus} role="status">
                    {s06ConsequenceContent.page.complete}
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        </article>
      </BrowserShell>
    </section>
  );
}

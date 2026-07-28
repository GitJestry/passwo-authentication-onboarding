import { s01Content, s03Content } from '@passwo/training-content';
import {
  deriveCampusIdentity,
  getRetrievedAccountCount,
  type PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import { BrowserShell, type BrowserShellSnapshot } from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import { PassWoQuestDock } from '../../../../adapters/character/PassWoCharacterAdapter.js';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import {
  NetworkStatusMarker,
  NetworkSymbol,
} from '../../../../adapters/network/NetworkSymbolRegistry.js';
import {
  ReactFlowNetwork,
  ReactFlowNetworkAdapter,
} from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import {
  S03RetrievalController,
  type S03RetrievalControllerSnapshot,
} from './S03RetrievalController.js';
import styles from './S03RetrievalTraining.module.css';

export interface S03RetrievalTrainingProps {
  readonly controller: PasswordModuleController;
  readonly snapshot: PasswordModuleSnapshot;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
}

interface Runtime {
  readonly controller: S03RetrievalController;
  readonly renderer: ReactFlowNetworkAdapter;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLocalTimingFailure(snapshot: PasswordModuleSnapshot): boolean {
  return snapshot.matches({ s03: 'startFailed' }) || snapshot.matches({ s03: 'endFailed' });
}

function CampusPage({
  account,
  accountData,
}: {
  readonly account: (typeof s01Content.browser.accounts)[number];
  readonly accountData: string;
}) {
  const page = s03Content.accountPages[account.id];

  return (
    <section className={styles.campusPage} aria-label={`${account.label}, ${page.signedInLabel}`}>
      <header className={styles.campusPageHeader}>
        <div className={styles.siteIdentity}>
          <NetworkSymbol symbolId={account.symbolId} className={styles.siteSymbol} />
          <span>{account.label}</span>
        </div>
        <span className={styles.signedInLabel}>{page.signedInLabel}</span>
      </header>
      <nav className={styles.siteNavigation} aria-label={`${account.label}-Navigation`}>
        {account.navigation.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </nav>
      <div className={styles.campusPageBody}>
        <div>
          <p className={styles.areaLabel}>{page.areaLabel}</p>
          <h2 id="s03-login-title">{account.label}</h2>
        </div>
        <dl className={styles.campusDetails}>
          <div>
            <dt>{account.accountDataLabel}</dt>
            <dd>{accountData}</dd>
          </div>
          {page.modules.map((module) => (
            <div key={module.label}>
              <dt>{module.label}</dt>
              <dd>{module.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function S03RetrievalTraining({
  controller,
  snapshot,
  externalTimingError = null,
  onRetryExternalTiming,
}: S03RetrievalTrainingProps) {
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const characterAnimationAnchorRef = useRef<HTMLSpanElement | null>(null);
  const warningConfirmationRef = useRef(() => controller.completeS03WarningSequence());
  warningConfirmationRef.current = () => controller.completeS03WarningSequence();
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [presentationSnapshot, setPresentationSnapshot] =
    useState<S03RetrievalControllerSnapshot | null>(null);
  const [revealedAccountIds, setRevealedAccountIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [questHelpOpen, setQuestHelpOpen] = useState(false);

  useEffect(() => {
    let retrievalController: S03RetrievalController | null = null;
    const animationPlayer = new NetworkMotionAdapter({
      initialNodeId: s01Content.browser.accounts[0]?.id ?? '',
      initialRevealedNodeIds: s01Content.browser.accounts.map(({ id }) => id),
      applySnapshot: (presentation) => retrievalController?.updatePresentation(presentation),
      getCharacterElement: () => characterAnimationAnchorRef.current,
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
    retrievalController = new S03RetrievalController({
      animationPlayer,
      onWarningConfirmed: () => warningConfirmationRef.current(),
    });
    const renderer = new ReactFlowNetworkAdapter(retrievalController.getSnapshot().network);
    retrievalController.attachRenderer(renderer);
    const unsubscribe = retrievalController.subscribe(setPresentationSnapshot);
    setRuntime({ controller: retrievalController, renderer });
    setPresentationSnapshot(retrievalController.getSnapshot());

    return () => {
      unsubscribe();
      void retrievalController?.dispose();
    };
  }, []);

  useEffect(() => {
    runtime?.controller.synchronize(
      {
        activeAccountId: snapshot.context.activeAccountId,
        retrievalResults: snapshot.context.retrievalResults,
      },
      snapshot.matches({ s03: 'completionSequence' }),
    );
  }, [runtime, snapshot]);

  if (runtime === null || presentationSnapshot === null) return null;

  const account =
    s01Content.browser.accounts.find(({ id }) => id === snapshot.context.activeAccountId) ??
    s01Content.browser.accounts[0];
  if (account === undefined) return null;

  const completedCount = getRetrievedAccountCount(snapshot.context);
  const result = snapshot.context.retrievalResults[account.id] ?? 'pending';
  const activeValue = snapshot.context.retrievalPasswordValues[account.id] ?? '';
  const campusIdentity = deriveCampusIdentity(snapshot.context.displayName ?? '');
  const accountData =
    account.id === 'campus-id'
      ? campusIdentity.campusId
      : account.id === 'campus-mail'
        ? campusIdentity.campusMail
        : account.accountData;
  const isStarting = snapshot.matches({ s03: 'starting' });
  const isEnding = snapshot.matches({ s03: 'ending' });
  const localTimingFailure = isLocalTimingFailure(snapshot);
  const completionSequenceActive =
    snapshot.matches({ s03: 'completionSequence' }) ||
    isEnding ||
    snapshot.matches({ s03: 'endFailed' });
  const interactionBlocked =
    externalTimingError !== null || localTimingFailure || isStarting || completionSequenceActive;
  const timingFailure = externalTimingError !== null || localTimingFailure;
  const announcement = presentationSnapshot.presentation.announcedMessageId;
  const timeLapseActive = announcement === 's03.completion.result';
  const boardWarningActive = announcement === 's03.campus-board.warning';
  const warningConfirmationAvailable =
    presentationSnapshot.warningState === 'ready' && boardWarningActive;
  const guideMessage = boardWarningActive
    ? s03Content.narration.warning
    : timeLapseActive
      ? s03Content.page.resultLine
      : result === 'retrievable'
        ? s03Content.narration.accountSuccess[account.id]
        : result === 'not-remembered'
          ? s03Content.narration.accountSkipped[account.id]
          : s03Content.narration.intro;
  const browserSnapshot: BrowserShellSnapshot = {
    tabs: s01Content.browser.accounts.map((tabAccount) => ({
      id: tabAccount.id,
      label: tabAccount.label,
      enabled: !interactionBlocked,
      ...(snapshot.context.retrievalResults[tabAccount.id] === 'retrievable'
        ? { status: 'complete' as const }
        : {}),
    })),
    activeTabId: account.id,
    address: account.address,
  };

  function toggleReveal(accountId: string): void {
    setRevealedAccountIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(accountId)) {
        nextIds.delete(accountId);
      } else {
        nextIds.add(accountId);
      }
      return nextIds;
    });
  }

  function retryTiming(): void {
    if (externalTimingError !== null) {
      onRetryExternalTiming?.();
      return;
    }
    controller.retryTiming();
  }

  return (
    <section className={styles.training} aria-label={s03Content.trainingAriaLabel}>
      <BrowserShell
        variant="artifact"
        snapshot={browserSnapshot}
        ariaLabel={s03Content.browser.ariaLabel}
        onTabSelect={(accountId) => controller.selectAccount(accountId)}
        layers={{
          passWo: (
            <>
              <span
                ref={characterAnimationAnchorRef}
                className={styles.characterAnimationAnchor}
                aria-hidden="true"
              />
              <PassWoQuestDock
                guideName={s03Content.narration.guideName}
                progressLabel={s03Content.page.progress(completedCount)}
                placement="bottom-left"
                helpOpen={questHelpOpen}
                helpId="s03-quest-help"
                openHelpLabel="Hinweis öffnen"
                closeHelpLabel="Hinweis schließen"
                helpContent={<p>{guideMessage}</p>}
                onToggleHelp={() => setQuestHelpOpen((open) => !open)}
              />
            </>
          ),
        }}
      >
        <article className={styles.page} aria-labelledby="s03-page-title">
          <header className={styles.pageHeader}>
            <h1 id="s03-page-title">{s03Content.page.title}</h1>
            <p className={styles.progress} role="status">
              {s03Content.page.progress(completedCount)}
            </p>
          </header>

          <div className={styles.workspace}>
            <aside className={styles.accountRail} aria-label={s03Content.page.accountListLabel}>
              <p>{s03Content.page.accountListLabel}</p>
              <div className={styles.accountList}>
                {s01Content.browser.accounts.map((railAccount) => {
                  const railResult = snapshot.context.retrievalResults[railAccount.id] ?? 'pending';
                  const statusLabel =
                    railResult === 'pending'
                      ? s03Content.statuses.pending
                      : railResult === 'retrievable'
                        ? s03Content.statuses.retrievable
                        : s03Content.statuses.notRemembered;

                  return (
                    <button
                      key={railAccount.id}
                      type="button"
                      className={styles.accountCard}
                      data-active={railAccount.id === account.id}
                      data-result={railResult}
                      aria-current={railAccount.id === account.id ? 'page' : undefined}
                      disabled={interactionBlocked}
                      onClick={() => controller.selectAccount(railAccount.id)}
                    >
                      <NetworkSymbol
                        symbolId={railAccount.symbolId}
                        className={styles.accountSymbol}
                      />
                      <span>
                        <strong>{railAccount.label}</strong>
                        <small>{statusLabel}</small>
                      </span>
                      <NetworkStatusMarker
                        status={railResult === 'pending' ? 'neutral' : railResult}
                        className={styles.accountStatusMarker}
                      />
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className={styles.loginStage} aria-labelledby="s03-login-title">
              <div className={styles.loginPanel}>
                {result === 'retrievable' ? (
                  <CampusPage account={account} accountData={accountData} />
                ) : result === 'not-remembered' ? (
                  <section className={styles.resultNode} data-result={result} aria-live="polite">
                    <NetworkSymbol symbolId={account.symbolId} className={styles.resultSymbol} />
                    <div>
                      <h2 id="s03-login-title">{account.label}</h2>
                      <strong>{s03Content.statuses.notRemembered}</strong>
                    </div>
                  </section>
                ) : (
                  <>
                    <div className={styles.loginIdentity}>
                      <NetworkSymbol symbolId={account.symbolId} className={styles.loginSymbol} />
                      <div>
                        <p className={styles.accountDataLabel}>{account.accountDataLabel}</p>
                        <h2 id="s03-login-title">{account.label}</h2>
                        <p className={styles.accountData}>{accountData}</p>
                      </div>
                    </div>
                    <form
                      className={styles.loginForm}
                      onSubmit={(event) => {
                        event.preventDefault();
                        const previousResult =
                          snapshot.context.retrievalResults[account.id] ?? 'pending';
                        controller.submitRetrievalLogin(account.id);
                        if (
                          previousResult === 'pending' &&
                          controller.getSnapshot().context.retrievalResults[account.id] ===
                            'retrievable'
                        ) {
                          runtime.controller.playSuccessfulRetrieval(account.id);
                        }
                      }}
                    >
                      <label htmlFor={`s03-password-${account.id}`}>
                        {s03Content.controls.passwordLabel}
                      </label>
                      <span className={styles.passwordInputGroup}>
                        <input
                          id={`s03-password-${account.id}`}
                          name={`s03-password-${account.id}`}
                          type={revealedAccountIds.has(account.id) ? 'text' : 'password'}
                          autoComplete="off"
                          spellCheck={false}
                          value={activeValue}
                          disabled={interactionBlocked}
                          onChange={(event) =>
                            controller.setRetrievalPasswordValue(
                              account.id,
                              event.currentTarget.value,
                            )
                          }
                        />
                        <button
                          type="button"
                          className={styles.revealButton}
                          aria-pressed={revealedAccountIds.has(account.id)}
                          aria-label={
                            revealedAccountIds.has(account.id)
                              ? s03Content.controls.hidePassword(account.label)
                              : s03Content.controls.showPassword(account.label)
                          }
                          disabled={interactionBlocked}
                          onClick={() => toggleReveal(account.id)}
                        >
                          {revealedAccountIds.has(account.id)
                            ? s03Content.controls.hide
                            : s03Content.controls.show}
                        </button>
                      </span>
                      <div className={styles.buttonRow}>
                        <button
                          type="submit"
                          className={styles.primaryButton}
                          disabled={interactionBlocked}
                        >
                          {s03Content.controls.login}
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          disabled={interactionBlocked}
                          onClick={() => controller.skipRetrieval(account.id)}
                        >
                          {s03Content.controls.skip}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </section>

            <section
              ref={networkHostRef}
              className={styles.networkPanel}
              data-timeskip={timeLapseActive}
              data-board-warning={boardWarningActive}
              aria-label="Knotennetz der bereits bekannten Konten"
            >
              <ReactFlowNetwork
                adapter={runtime.renderer}
                presentation={presentationSnapshot.presentation}
                onNodeSelect={() => undefined}
                interactionDisabled
                ariaLabel="Knotennetz der Konten und zugehörigen Dienste"
                canvasAriaLabel="Knotennetz für die aktuelle Wiederanmeldung"
                showEdgeLabels={false}
              />
              {timeLapseActive || boardWarningActive ? (
                <section className={styles.completionMessage} data-warning={boardWarningActive}>
                  <p>PassWo</p>
                  <strong>
                    {boardWarningActive ? s03Content.narration.warning : s03Content.page.resultLine}
                  </strong>
                  {warningConfirmationAvailable ? (
                    <button
                      type="button"
                      className={`${styles.primaryButton} ${styles.warningContinue}`}
                      onClick={() => runtime.controller.confirmWarning()}
                    >
                      Weiter
                    </button>
                  ) : null}
                </section>
              ) : null}
            </section>
          </div>

          {(isStarting || isEnding) && externalTimingError === null ? (
            <p className={styles.timingStatus} role="status">
              {s03Content.controls.timingSaving}
            </p>
          ) : null}
          {timingFailure ? (
            <section className={styles.timingError} role="alert">
              <p>{s03Content.controls.timingFailure}</p>
              <p>Fehlercode: {externalTimingError ?? snapshot.context.timingErrorCode}</p>
              <button type="button" className={styles.primaryButton} onClick={retryTiming}>
                {s03Content.controls.retry}
              </button>
            </section>
          ) : null}
        </article>
      </BrowserShell>
    </section>
  );
}

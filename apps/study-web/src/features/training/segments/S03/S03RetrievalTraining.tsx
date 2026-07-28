import {
  s01Content,
  s02Content,
  s03Content,
  type S01AccountId,
} from '@passwo/training-content';
import {
  deriveCampusIdentity,
  getRetrievedAccountCount,
  type PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import { BrowserShell, type BrowserShellSnapshot } from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { CampusWebsiteBackdrop } from '../../CampusWebsiteBackdrop.js';
import { PassWoGuide } from '../../PassWoGuide.js';
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
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLocalTimingFailure(snapshot: PasswordModuleSnapshot): boolean {
  return snapshot.matches({ s03: 'startFailed' }) || snapshot.matches({ s03: 'endFailed' });
}

function PasswordVisibilityIcon({ revealed }: { readonly revealed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={styles.revealIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {revealed ? <path d="M4 4 20 20" /> : null}
    </svg>
  );
}

function InitialLoginWelcome({
  accountId,
  disabled,
  onOpenLogin,
}: {
  readonly accountId: S01AccountId;
  readonly disabled: boolean;
  readonly onOpenLogin?: () => void;
}) {
  const account = s01Content.browser.accounts.find(({ id }) => id === accountId);
  if (account === undefined) return null;

  return (
    <section className={styles.siteWelcome}>
      <NetworkSymbol symbolId={account.symbolId} className={styles.welcomeSymbol} />
      <p>{s03Content.accountPages[account.id].areaLabel}</p>
      <h2>{account.label}</h2>
      <button
        type="button"
        className={styles.primaryButton}
        disabled={disabled}
        onClick={onOpenLogin}
      >
        {s03Content.controls.openLogin(account.label)}
      </button>
    </section>
  );
}

export function S03InitialBrowserSurface({
  activeAccountId,
  inert = false,
}: {
  readonly activeAccountId: S01AccountId;
  readonly inert?: boolean;
}) {
  const account = s01Content.browser.accounts.find(({ id }) => id === activeAccountId);
  if (account === undefined) return null;
  const browserSnapshot: BrowserShellSnapshot = {
    tabs: s01Content.browser.accounts.map((tabAccount) => ({
      id: tabAccount.id,
      label: tabAccount.label,
      enabled: false,
    })),
    activeTabId: account.id,
    address: account.address,
  };

  return (
    <div className={styles.handoff} aria-hidden={inert || undefined} inert={inert || undefined}>
      <BrowserShell
        variant="artifact"
        snapshot={browserSnapshot}
        ariaLabel={s03Content.browser.ariaLabel}
      >
        <div className={styles.page}>
          <CampusWebsiteBackdrop
            accountId={account.id}
            interactionLabel={`${account.label} wieder anmelden`}
            layout="authentication"
          >
            <section className={styles.siteTask} aria-labelledby="s03-handoff-page-title">
              <h1 id="s03-handoff-page-title" className={styles.screenReaderOnly}>
                {s03Content.page.title}
              </h1>
              <InitialLoginWelcome accountId={account.id} disabled />
            </section>
          </CampusWebsiteBackdrop>
        </div>
      </BrowserShell>
    </div>
  );
}

export function S03RetrievalTraining({
  controller,
  snapshot,
  externalTimingError = null,
  onRetryExternalTiming,
}: S03RetrievalTrainingProps) {
  const animationTargetRef = useRef<HTMLDivElement | null>(null);
  const characterAnimationAnchorRef = useRef<HTMLSpanElement | null>(null);
  const loginTitleRef = useRef<HTMLHeadingElement | null>(null);
  const warningConfirmationRef = useRef(() => controller.completeS03WarningSequence());
  warningConfirmationRef.current = () => controller.completeS03WarningSequence();
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [presentationSnapshot, setPresentationSnapshot] =
    useState<S03RetrievalControllerSnapshot | null>(null);
  const [revealedAccountIds, setRevealedAccountIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [loginAccountId, setLoginAccountId] = useState<S01AccountId | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const initialAccountId =
    s01Content.browser.accounts.find(({ id }) => id === snapshot.context.activeAccountId)?.id ??
    'campus-id';

  useEffect(() => {
    let retrievalController: S03RetrievalController | null = null;
    const revealedNodeIds = [
      ...s01Content.browser.accounts.map(({ id }) => id),
      ...s02Content.scene.accounts.flatMap(({ details }) => details.map(({ id }) => id)),
    ];
    const animationPlayer = new NetworkMotionAdapter({
      initialNodeId: s01Content.browser.accounts[0]?.id ?? '',
      initialRevealedNodeIds: revealedNodeIds,
      applySnapshot: (presentation) => retrievalController?.updatePresentation(presentation),
      getCharacterElement: () => characterAnimationAnchorRef.current,
      getActiveNodeElement: () => animationTargetRef.current,
      getNodeElement: () => animationTargetRef.current,
      prefersReducedMotion,
    });
    retrievalController = new S03RetrievalController({
      animationPlayer,
      onWarningConfirmed: () => warningConfirmationRef.current(),
    });
    const unsubscribe = retrievalController.subscribe(setPresentationSnapshot);
    setRuntime({ controller: retrievalController });
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

  useEffect(() => {
    if (loginAccountId !== null) loginTitleRef.current?.focus();
  }, [loginAccountId]);

  if (runtime === null || presentationSnapshot === null) {
    return <S03InitialBrowserSurface activeAccountId={initialAccountId} />;
  }

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
  const accountPage = s03Content.accountPages[account.id];
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
        : snapshot.context.retrievalResults[tabAccount.id] === 'not-remembered'
          ? { status: 'attention' as const }
          : {}),
    })),
    activeTabId: account.id,
    address: account.address,
    dimmed: guideOpen,
    dimStrength: 'soft',
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

  function selectAccount(accountId: string): void {
    setLoginAccountId(null);
    controller.selectAccount(accountId);
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
        onTabSelect={selectAccount}
        layers={{
          passWo: (
            <>
              <span
                ref={characterAnimationAnchorRef}
                className={styles.characterAnimationAnchor}
                aria-hidden="true"
              />
              <PassWoGuide
                guideName={s03Content.narration.guideName}
                taskLabel="Anmelden"
                progress={{
                  current: completedCount,
                  total: s01Content.browser.accounts.length,
                  label: s03Content.page.progress(completedCount),
                }}
                helpOpen={guideOpen}
                helpId="s03-guide"
                openHelpLabel="PassWo-Hinweis öffnen"
                speech={[guideMessage]}
                speechKey={`${account.id}-${result}-${announcement ?? 'login'}`}
                speechPlacement="right"
                speechFooter={
                  warningConfirmationAvailable ? (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => {
                        setGuideOpen(false);
                        runtime.controller.confirmWarning();
                      }}
                    >
                      Weiter
                    </button>
                  ) : undefined
                }
                onToggleHelp={() => setGuideOpen((open) => !open)}
                {...(warningConfirmationAvailable
                  ? {}
                  : { onSpeechAdvance: () => setGuideOpen(false) })}
              />
            </>
          ),
        }}
      >
        <div className={styles.page} aria-labelledby="s03-page-title">
          {completionSequenceActive ? (
            <section
              className={styles.completionStage}
              data-timeskip={timeLapseActive}
              data-board-warning={boardWarningActive}
            >
              <h1 id="s03-page-title" className={styles.screenReaderOnly}>
                {s03Content.page.title}
              </h1>
              <div ref={animationTargetRef} className={styles.completionStatus} aria-live="polite">
                <span aria-hidden="true">
                  {boardWarningActive ? '!' : timeLapseActive ? '…' : '✓'}
                </span>
                <p>{boardWarningActive ? account.label : s03Content.page.resultLine}</p>
              </div>
            </section>
          ) : (
            <CampusWebsiteBackdrop
              accountId={account.id}
              interactionLabel={`${account.label} wieder anmelden`}
              layout="authentication"
            >
              <section className={styles.siteTask} aria-labelledby="s03-page-title">
                <h1 id="s03-page-title" className={styles.screenReaderOnly}>
                  {s03Content.page.title}
                </h1>

                {result === 'pending' && loginAccountId !== account.id ? (
                  <InitialLoginWelcome
                    accountId={account.id}
                    disabled={interactionBlocked}
                    onOpenLogin={() => setLoginAccountId(account.id)}
                  />
                ) : (
                  <div
                    ref={animationTargetRef}
                    className={styles.relationshipStage}
                    data-result={result}
                  >
                    {result === 'pending' ? (
                      <form
                        className={styles.authCard}
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
                        <header className={styles.authHeader}>
                          <NetworkSymbol
                            symbolId={account.symbolId}
                            className={styles.authSymbol}
                          />
                          <div>
                            <p>{account.label}</p>
                            <h2 ref={loginTitleRef} tabIndex={-1}>
                              {s03Content.accountLoginTitles[account.id]}
                            </h2>
                          </div>
                        </header>
                        <dl className={styles.accountDetails}>
                          <div>
                            <dt>{s03Content.controls.accountDataLabel}</dt>
                            <dd>{accountData}</dd>
                          </div>
                        </dl>
                        <label
                          className={styles.passwordLabel}
                          htmlFor={`s03-password-${account.id}`}
                        >
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
                            <PasswordVisibilityIcon
                              revealed={revealedAccountIds.has(account.id)}
                            />
                          </button>
                        </span>
                        <div className={styles.buttonRow}>
                          <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={interactionBlocked || activeValue.length === 0}
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
                    ) : (
                      <section className={styles.resultCard} data-result={result} aria-live="polite">
                        <span className={styles.resultIndicator} aria-hidden="true">
                          {result === 'retrievable' ? '✓' : '×'}
                        </span>
                        <p>{accountPage.areaLabel}</p>
                        <h2>{account.label}</h2>
                        <strong>
                          {result === 'retrievable'
                            ? accountPage.signedInLabel
                            : s03Content.statuses.cancelledLogin}
                        </strong>
                        {result === 'retrievable' ? (
                          <dl className={styles.accountDetails}>
                            {accountPage.modules.map((module) => (
                              <div key={module.label}>
                                <dt>{module.label}</dt>
                                <dd>{module.value}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : null}
                      </section>
                    )}
                  </div>
                )}
              </section>
            </CampusWebsiteBackdrop>
          )}

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
        </div>
      </BrowserShell>
    </section>
  );
}

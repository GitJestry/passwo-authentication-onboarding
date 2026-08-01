import {
  s01Content,
  s02Content,
  s03Content,
  type S01AccountId,
} from '@passwo/training-content';
import {
  deriveCampusIdentity,
  getRememberedAccountCount,
  getRetrievedAccountCount,
  type PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import {
  BrowserShell,
  type BrowserShellSnapshot,
  type DesktopPlatform,
} from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { AccountSuccessOverlay } from '../../AccountSuccessOverlay.js';
import { CampusWebsiteBackdrop } from '../../CampusWebsiteBackdrop.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import {
  S03RetrievalController,
  type S03RetrievalControllerSnapshot,
} from './S03RetrievalController.js';
import styles from './S03RetrievalTraining.module.css';

export interface S03RetrievalTrainingProps {
  readonly controller: PasswordModuleController;
  readonly platform?: DesktopPlatform;
  readonly snapshot: PasswordModuleSnapshot;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
  readonly initialLoginAccountId?: S01AccountId;
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

function completionNarration(rememberedCount: number): string {
  if (rememberedCount <= 0) return s03Content.narration.completionByRememberedCount[0];
  if (rememberedCount === 1) return s03Content.narration.completionByRememberedCount[1];
  if (rememberedCount === 2) return s03Content.narration.completionByRememberedCount[2];
  return s03Content.narration.completionByRememberedCount[3];
}

function CampusStartTimeLapse({
  running,
  warning,
}: {
  readonly running: boolean;
  readonly warning: boolean;
}) {
  return (
    <div
      className={styles.campusTimeLapse}
      data-running={running || undefined}
      data-warning={warning || undefined}
      aria-label={
        warning
          ? 'Der Campusalltag wurde wegen einer Warnung bei Campusgram angehalten.'
          : 'Der fiktive Campusalltag läuft im Zeitraffer.'
      }
    >
      <CampusWebsiteBackdrop
        accountId="campus-id"
        interactionLabel="Fiktiver Campusalltag im Zeitraffer"
      >
        <section className={styles.campusActivity} aria-hidden="true">
          <header>
            <span>Campusstart</span>
            <strong>{warning ? 'Aktivität angehalten' : 'Heute'}</strong>
          </header>
          <div className={styles.activityTimeline}>
            <article>
              <span className={styles.activityTime}>08:15</span>
              <div>
                <strong>Stundenplan öffnen</strong>
                <span>Master Campus</span>
              </div>
            </article>
            <article>
              <span className={styles.activityTime}>09:40</span>
              <div>
                <strong>Nachricht lesen</strong>
                <span>Campus E-Mail</span>
              </div>
            </article>
            <article>
              <span className={styles.activityTime}>11:05</span>
              <div>
                <strong>Beitrag ansehen</strong>
                <span>Campusgram</span>
              </div>
            </article>
          </div>
          <span className={styles.timeLapseCursor}>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="m5 3 14 10-7 1.4L8.5 21 5 3Z"
                fill="currentColor"
                stroke="white"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </section>
      </CampusWebsiteBackdrop>
    </div>
  );
}

export function S03InitialBrowserSurface({
  activeAccountId,
  inert = false,
  platform = 'mac',
  displayName = '',
}: {
  readonly activeAccountId: S01AccountId;
  readonly inert?: boolean;
  readonly platform?: DesktopPlatform;
  readonly displayName?: string;
}) {
  const account = s01Content.browser.accounts.find(({ id }) => id === activeAccountId);
  if (account === undefined) return null;
  const campusIdentity = deriveCampusIdentity(displayName);
  const accountIdentifier =
    account.id === 'campus-id'
      ? campusIdentity.campusId
      : account.id === 'campus-mail'
        ? campusIdentity.campusMail
        : campusIdentity.campusgram;
  const browserSnapshot: BrowserShellSnapshot = {
    tabs: s01Content.browser.accounts.map((tabAccount) => ({
      id: tabAccount.id,
      label: tabAccount.label,
      icon: <NetworkSymbol symbolId={tabAccount.symbolId} />,
      enabled: false,
    })),
    activeTabId: account.id,
    address: account.address,
    accountIdentifier,
    scrollKey: `s03:${account.id}:landing`,
  };

  return (
    <div className={styles.handoff} aria-hidden={inert || undefined} inert={inert || undefined}>
      <BrowserShell
        platform={platform}
        variant="artifact"
        snapshot={browserSnapshot}
        ariaLabel={s03Content.browser.ariaLabel}
      >
        <div className={styles.page}>
          <CampusWebsiteBackdrop
            accountId={account.id}
            interactionLabel={`${account.label} wieder anmelden`}
            view="landing"
            primaryAction={{
              label: account.landing.loginLabel,
              disabled: true,
              disabledReason: s01Content.siteUi.previewUnavailable,
            }}
            secondaryAction={{
              label: account.landing.registerLabel,
              disabled: true,
              disabledReason: s01Content.siteUi.registrationUnavailable,
            }}
          />
        </div>
      </BrowserShell>
    </div>
  );
}

export function S03RetrievalTraining({
  controller,
  platform = 'mac',
  snapshot,
  externalTimingError = null,
  onRetryExternalTiming,
  initialLoginAccountId,
}: S03RetrievalTrainingProps) {
  const animationTargetRef = useRef<HTMLElement | null>(null);
  const characterAnimationAnchorRef = useRef<HTMLSpanElement | null>(null);
  const loginTitleRef = useRef<HTMLHeadingElement | null>(null);
  const assistedLoginButtonRef = useRef<HTMLButtonElement | null>(null);
  const failedLoginAttemptsRef = useRef<Partial<Record<S01AccountId, number>>>({});
  const warningConfirmationRef = useRef(() => controller.completeS03WarningSequence());
  warningConfirmationRef.current = () => controller.completeS03WarningSequence();
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [presentationSnapshot, setPresentationSnapshot] =
    useState<S03RetrievalControllerSnapshot | null>(null);
  const [revealedAccountIds, setRevealedAccountIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [loginAccountId, setLoginAccountId] = useState<S01AccountId | null>(
    initialLoginAccountId ?? null,
  );
  const [guideOpen, setGuideOpen] = useState(false);
  const [completedGuideSpeechKey, setCompletedGuideSpeechKey] = useState<string | null>(null);
  const [invalidLoginFeedback, setInvalidLoginFeedback] = useState<{
    readonly accountId: S01AccountId;
    readonly attempt: number;
  } | null>(null);
  const [thirdAttemptGuideAccountId, setThirdAttemptGuideAccountId] =
    useState<S01AccountId | null>(null);
  const [successOverlayAccountId, setSuccessOverlayAccountId] =
    useState<S01AccountId | null>(null);
  const knownSuccessfulAccountIdsRef = useRef<ReadonlySet<string>>(
    new Set(
      s01Content.browser.accounts
        .filter(({ id }) => {
          const result = snapshot.context.retrievalResults[id];
          return result === 'retrievable' || result === 'assisted';
        })
        .map(({ id }) => id),
    ),
  );
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
      snapshot.matches({ s03: { completionSequence: 'timeLapse' } }),
    );
  }, [runtime, snapshot]);

  const assistanceActive = snapshot.matches({ s03: 'assistance' });
  const autofillingActive = snapshot.matches({ s03: 'autofilling' });
  const assistedLoginActive = snapshot.matches({ s03: 'assistedLogin' });
  const completionFeedbackActive = snapshot.matches({
    s03: { completionSequence: 'feedback' },
  });
  const campusStartActive = snapshot.matches({
    s03: { completionSequence: 'campusStart' },
  });
  const timeLapsePhaseActive = snapshot.matches({
    s03: { completionSequence: 'timeLapse' },
  });
  const announcement = presentationSnapshot?.presentation.announcedMessageId ?? null;
  const timeLapseActive =
    timeLapsePhaseActive && announcement === 's03.completion.timeskip';
  const boardWarningActive =
    timeLapsePhaseActive && announcement === 's03.campus-board.warning';

  useEffect(() => {
    if (assistanceActive || completionFeedbackActive || campusStartActive || boardWarningActive) {
      setGuideOpen(true);
      return;
    }
    if (timeLapsePhaseActive) setGuideOpen(false);
  }, [
    assistanceActive,
    boardWarningActive,
    campusStartActive,
    completionFeedbackActive,
    timeLapsePhaseActive,
  ]);

  useEffect(() => {
    if (loginAccountId !== null) loginTitleRef.current?.focus();
  }, [loginAccountId]);

  useEffect(() => {
    if (assistedLoginActive) assistedLoginButtonRef.current?.focus();
  }, [assistedLoginActive]);

  useEffect(() => {
    const knownAccountIds = knownSuccessfulAccountIdsRef.current;
    const completedAccount = s01Content.browser.accounts.find(({ id }) => {
      const retrievalResult = snapshot.context.retrievalResults[id];
      return (
        (retrievalResult === 'retrievable' || retrievalResult === 'assisted') &&
        !knownAccountIds.has(id)
      );
    });
    knownSuccessfulAccountIdsRef.current = new Set(
      s01Content.browser.accounts
        .filter(({ id }) => {
          const retrievalResult = snapshot.context.retrievalResults[id];
          return retrievalResult === 'retrievable' || retrievalResult === 'assisted';
        })
        .map(({ id }) => id),
    );
    if (completedAccount !== undefined) setSuccessOverlayAccountId(completedAccount.id);
  }, [snapshot.context.retrievalResults]);

  if (runtime === null || presentationSnapshot === null) {
    return (
      <S03InitialBrowserSurface
        activeAccountId={initialAccountId}
        platform={platform}
        displayName={snapshot.context.displayName ?? ''}
      />
    );
  }

  const account =
    s01Content.browser.accounts.find(({ id }) => id === snapshot.context.activeAccountId) ??
    s01Content.browser.accounts[0];
  if (account === undefined) return null;

  const completedCount = getRetrievedAccountCount(snapshot.context);
  const rememberedCount = getRememberedAccountCount(snapshot.context);
  const result = snapshot.context.retrievalResults[account.id] ?? 'pending';
  const activeValue = snapshot.context.retrievalPasswordValues[account.id] ?? '';
  const autofillTargetValue = snapshot.context.passwordValues[account.id] ?? '';
  const invalidLoginActive = invalidLoginFeedback?.accountId === account.id;
  const thirdAttemptGuideActive =
    thirdAttemptGuideAccountId === account.id && result === 'pending';
  const campusIdentity = deriveCampusIdentity(snapshot.context.displayName ?? '');
  const accountData =
    account.id === 'campus-id'
      ? campusIdentity.campusId
      : account.id === 'campus-mail'
        ? campusIdentity.campusMail
        : campusIdentity.campusgram;
  const accountPage = s03Content.accountPages[account.id];
  const isStarting = snapshot.matches({ s03: 'starting' });
  const isEnding = snapshot.matches({ s03: 'ending' });
  const localTimingFailure = isLocalTimingFailure(snapshot);
  const completionSequenceActive =
    snapshot.matches({ s03: 'completionSequence' }) ||
    isEnding ||
    snapshot.matches({ s03: 'endFailed' });
  const interactionBlocked =
    externalTimingError !== null ||
    localTimingFailure ||
    isStarting ||
    assistanceActive ||
    autofillingActive ||
    assistedLoginActive ||
    completionSequenceActive;
  const timingFailure = externalTimingError !== null || localTimingFailure;
  const websiteView =
    result === 'retrievable' || result === 'assisted'
      ? 'dashboard'
      : loginAccountId === account.id || result === 'not-remembered'
        ? 'authentication'
        : 'landing';
  const pageAddress =
    websiteView === 'authentication'
      ? `${account.address}/login`
      : websiteView === 'dashboard'
        ? `${account.address}/dashboard`
        : account.address;
  const warningConfirmationAvailable =
    presentationSnapshot.warningState === 'ready' && boardWarningActive;
  const guideMessage = boardWarningActive
    ? s03Content.narration.warning
    : assistanceActive
      ? s03Content.narration.retrievalHelp
      : thirdAttemptGuideActive
        ? s03Content.narration.thirdFailedLogin
        : completionFeedbackActive
          ? completionNarration(rememberedCount)
          : campusStartActive
            ? s03Content.narration.campusStart
            : result === 'retrievable'
              ? s03Content.narration.accountSuccess[account.id]
              : result === 'assisted'
                ? s03Content.narration.accountAssisted[account.id]
                : result === 'not-remembered'
                  ? s03Content.narration.retrievalHelp
                  : s03Content.narration.intro;
  const guidePhase = boardWarningActive
    ? 'warning'
    : assistanceActive
      ? 'assistance'
      : thirdAttemptGuideActive
        ? 'third-failed-login'
        : completionFeedbackActive
          ? 'completion-feedback'
          : campusStartActive
            ? 'campus-start'
            : autofillingActive
              ? 'autofilling'
              : assistedLoginActive
                ? 'assisted-login'
                : 'login';
  const guideSpeechKey = `${account.id}-${result}-${guidePhase}-${announcement ?? 'idle'}`;
  const guideSpeechCompleted = completedGuideSpeechKey === guideSpeechKey;
  const assistanceActionAvailable = assistanceActive && guideSpeechCompleted;
  const successOverlayResult =
    successOverlayAccountId === null
      ? undefined
      : snapshot.context.retrievalResults[successOverlayAccountId];
  const successOverlayLabel =
    successOverlayAccountId === null
      ? null
      : successOverlayResult === 'assisted'
        ? s03Content.narration.accountAssisted[successOverlayAccountId]
        : s03Content.narration.accountSuccess[successOverlayAccountId];
  const browserSnapshot: BrowserShellSnapshot = {
    tabs: s01Content.browser.accounts.map((tabAccount) => ({
      id: tabAccount.id,
      label: tabAccount.label,
      icon: <NetworkSymbol symbolId={tabAccount.symbolId} />,
      enabled: !interactionBlocked,
      ...(boardWarningActive && tabAccount.id === 'campus-board-archive'
        ? { status: 'danger' as const }
        : snapshot.context.retrievalResults[tabAccount.id] === 'retrievable' ||
            snapshot.context.retrievalResults[tabAccount.id] === 'assisted'
          ? { status: 'complete' as const }
          : {}),
    })),
    activeTabId: completionSequenceActive ? 'campus-id' : account.id,
    address:
      completionSequenceActive
        ? (s01Content.browser.accounts.find(({ id }) => id === 'campus-id')?.address ??
          account.address)
        : pageAddress,
    accountIdentifier: completionSequenceActive ? campusIdentity.campusId : accountData,
    scrollKey: completionSequenceActive
      ? `s03:completion:${announcement ?? 'starting'}`
      : `s03:${account.id}:${websiteView}`,
    dimmed: guideOpen,
    dimStrength: 'soft',
    locked: timeLapsePhaseActive,
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
    setSuccessOverlayAccountId(null);
    setLoginAccountId(null);
    setInvalidLoginFeedback(null);
    setThirdAttemptGuideAccountId(null);
    setGuideOpen(false);
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
        platform={platform}
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
              {successOverlayLabel === null ? null : (
                <AccountSuccessOverlay
                  label={successOverlayLabel}
                  onComplete={() => setSuccessOverlayAccountId(null)}
                />
              )}
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
                speechKey={guideSpeechKey}
                {...(thirdAttemptGuideActive
                  ? {
                      speechEmphasis: [
                        { phrase: '„Passwort vergessen?“', tone: 'action' as const },
                      ],
                    }
                  : {})}
                speechPlacement="right"
                hasNextSpeech={completionFeedbackActive || campusStartActive}
                awaitsAction={assistanceActive || warningConfirmationAvailable}
                speechFooter={
                  assistanceActionAvailable ? (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => {
                        setLoginAccountId(account.id);
                        setGuideOpen(false);
                        controller.startAssistedLogin(account.id);
                      }}
                    >
                      {s03Content.controls.assistedLogin}
                    </button>
                  ) : warningConfirmationAvailable && guideSpeechCompleted ? (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => {
                        setGuideOpen(false);
                        runtime.controller.confirmWarning();
                      }}
                    >
                      {s03Content.controls.viewWarning}
                    </button>
                  ) : undefined
                }
                onToggleHelp={() => {
                  if (guideOpen) setThirdAttemptGuideAccountId(null);
                  setGuideOpen((open) => !open);
                }}
                onSpeechComplete={() => setCompletedGuideSpeechKey(guideSpeechKey)}
                onSpeechAdvance={() => {
                  if (completionFeedbackActive) {
                    setSuccessOverlayAccountId(null);
                    controller.continueS03CompletionFeedback();
                    return;
                  }
                  if (campusStartActive) {
                    setGuideOpen(false);
                    controller.continueS03CampusStart();
                    return;
                  }
                  if (!assistanceActive && !warningConfirmationAvailable) {
                    setThirdAttemptGuideAccountId(null);
                    setGuideOpen(false);
                  }
                }}
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
              <div
                ref={(element) => {
                  animationTargetRef.current = element;
                }}
                className={styles.timeLapseStage}
                aria-live="polite"
              >
                <CampusStartTimeLapse
                  running={timeLapsePhaseActive}
                  warning={boardWarningActive}
                />
              </div>
            </section>
          ) : (
            <CampusWebsiteBackdrop
              accountId={account.id}
              interactionLabel={`${account.label} wieder anmelden`}
              view={websiteView}
              displayName={snapshot.context.displayName ?? ''}
              {...(websiteView === 'landing'
                ? {
                    primaryAction: {
                      label: account.landing.loginLabel,
                      disabled: interactionBlocked,
                      onClick: () => setLoginAccountId(account.id),
                    },
                    secondaryAction: {
                      label: account.landing.registerLabel,
                      disabled: true,
                      disabledReason: s01Content.siteUi.registrationUnavailable,
                    },
                  }
                : {})}
              authenticationTitle={s03Content.controls.login}
              {...(websiteView === 'authentication' && result === 'pending'
                ? {
                    onBack: () => {
                      setLoginAccountId(null);
                      setInvalidLoginFeedback(null);
                      setThirdAttemptGuideAccountId(null);
                      setGuideOpen(false);
                    },
                  }
                : {})}
              rootRef={animationTargetRef}
            >
              {websiteView === 'authentication' ? (
                <section className={styles.siteTask} aria-labelledby="s03-page-title">
                <h1
                  ref={loginTitleRef}
                  id="s03-page-title"
                  className={styles.screenReaderOnly}
                  tabIndex={-1}
                >
                  {s03Content.controls.login}
                </h1>

                {result === 'pending' || autofillingActive || assistedLoginActive ? (
                  <div
                    className={styles.relationshipStage}
                    data-result={result}
                  >
                    <form
                      className={styles.authCard}
                      data-assisted={autofillingActive || assistedLoginActive || undefined}
                      data-invalid={invalidLoginActive || undefined}
                      data-invalid-animation={
                        invalidLoginActive ? (invalidLoginFeedback?.attempt ?? 0) % 2 : undefined
                      }
                      onSubmit={(event) => {
                        event.preventDefault();
                        const previousResult =
                          snapshot.context.retrievalResults[account.id] ?? 'pending';
                        if (assistedLoginActive) {
                          controller.submitAssistedLogin(account.id);
                          return;
                        }
                        if (result === 'pending') {
                          controller.submitRetrievalLogin(account.id);
                          const nextResult =
                            controller.getSnapshot().context.retrievalResults[account.id] ??
                            'pending';
                          if (previousResult === 'pending' && nextResult === 'retrievable') {
                            setThirdAttemptGuideAccountId(null);
                            setGuideOpen(false);
                          } else if (previousResult === 'pending' && nextResult === 'pending') {
                            const attempt =
                              (failedLoginAttemptsRef.current[account.id] ?? 0) + 1;
                            failedLoginAttemptsRef.current = {
                              ...failedLoginAttemptsRef.current,
                              [account.id]: attempt,
                            };
                            setInvalidLoginFeedback({
                              accountId: account.id,
                              attempt,
                            });
                            if (attempt === 3) {
                              setThirdAttemptGuideAccountId(account.id);
                              setGuideOpen(true);
                            }
                          }
                        }
                      }}
                    >
                      <label
                        className={styles.usernameLabel}
                        htmlFor={`s03-username-${account.id}`}
                      >
                        {s03Content.controls.accountDataLabel}
                      </label>
                      <input
                        id={`s03-username-${account.id}`}
                        className={styles.usernameInput}
                        name={`s03-username-${account.id}`}
                        type="text"
                        value={accountData}
                        readOnly
                        aria-readonly="true"
                      />
                      <label
                        className={styles.passwordLabel}
                        htmlFor={`s03-password-${account.id}`}
                      >
                        {s03Content.controls.passwordLabel}
                      </label>
                      <span
                        className={styles.passwordInputGroup}
                        data-autofill={
                          autofillingActive ? 'running' : assistedLoginActive ? 'ready' : undefined
                        }
                      >
                        <input
                          id={`s03-password-${account.id}`}
                          name={`s03-password-${account.id}`}
                          type={revealedAccountIds.has(account.id) ? 'text' : 'password'}
                          autoComplete="off"
                          spellCheck={false}
                          value={autofillingActive ? autofillTargetValue : activeValue}
                          readOnly={autofillingActive || assistedLoginActive}
                          aria-readonly={autofillingActive || assistedLoginActive || undefined}
                          aria-invalid={invalidLoginActive || undefined}
                          aria-describedby={
                            invalidLoginActive ? `s03-password-error-${account.id}` : undefined
                          }
                          onChange={
                            assistedLoginActive
                              ? undefined
                              : (event) => {
                                  setInvalidLoginFeedback(null);
                                  controller.setRetrievalPasswordValue(
                                    account.id,
                                    event.currentTarget.value,
                                  );
                                }
                          }
                          onAnimationEnd={
                            autofillingActive
                              ? (event) => {
                                  if (event.currentTarget !== event.target) return;
                                  controller.completeAssistedAutofill(account.id);
                                }
                              : undefined
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
                          disabled={
                            interactionBlocked && !autofillingActive && !assistedLoginActive
                          }
                          onClick={() => toggleReveal(account.id)}
                        >
                          <PasswordVisibilityIcon
                            revealed={revealedAccountIds.has(account.id)}
                          />
                        </button>
                      </span>
                      {invalidLoginActive ? (
                        <p
                          id={`s03-password-error-${account.id}`}
                          className={styles.loginError}
                          role="alert"
                        >
                          <span aria-hidden="true">!</span>
                          {s03Content.controls.incorrectPassword}
                        </p>
                      ) : null}
                      <div className={styles.buttonRow}>
                        <button
                          ref={assistedLoginActive ? assistedLoginButtonRef : undefined}
                          type="submit"
                          className={styles.primaryButton}
                          disabled={
                            assistedLoginActive
                              ? activeValue.length === 0
                              : interactionBlocked || activeValue.length === 0
                          }
                        >
                          {s03Content.controls.login}
                        </button>
                        {result === 'pending' ? (
                          <a
                            href="#passwort-vergessen"
                            className={styles.forgotPassword}
                            aria-disabled={interactionBlocked || undefined}
                            tabIndex={interactionBlocked ? -1 : undefined}
                            onClick={(event) => {
                              event.preventDefault();
                              if (!interactionBlocked) {
                                setInvalidLoginFeedback(null);
                                setThirdAttemptGuideAccountId(null);
                                controller.skipRetrieval(account.id);
                              }
                            }}
                          >
                            {s03Content.controls.forgotPassword}
                          </a>
                        ) : null}
                      </div>
                    </form>
                  </div>
                ) : (
                  <div
                    className={styles.relationshipStage}
                    data-result={result}
                  >
                    <section className={styles.resultCard} data-result={result} aria-live="polite">
                      {result === 'not-remembered' ? null : (
                        <span className={styles.resultIndicator} aria-hidden="true">
                          ✓
                        </span>
                      )}
                      <p>{accountPage.areaLabel}</p>
                      <h2>{account.label}</h2>
                      <strong>
                        {result === 'retrievable' || result === 'assisted'
                          ? accountPage.signedInLabel
                          : s03Content.statuses.cancelledLogin}
                      </strong>
                    </section>
                  </div>
                )}
                </section>
              ) : null}
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

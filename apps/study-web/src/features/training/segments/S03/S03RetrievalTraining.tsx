import {
  s01Content,
  s03Content,
  type S01AccountId,
} from '@passwo/training-content';
import {
  deriveCampusIdentity,
  getRetrievedAccountCount,
  MAX_FICTIONAL_PASSWORD_LENGTH,
  type PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import {
  BrowserShell,
  type BrowserShellSnapshot,
  type DesktopPlatform,
} from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { AccountSuccessOverlay } from '../../AccountSuccessOverlay.js';
import { CampusWebsiteBackdrop } from '../../CampusWebsiteBackdrop.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import type { PassWoSpeechAction } from '../../PassWoSpeechBubble.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { useFictionalPasswordInput } from '../../useFictionalPasswordInput.js';
import styles from './S03RetrievalTraining.module.css';

export interface S03RetrievalTrainingProps {
  readonly controller: PasswordModuleController;
  readonly platform?: DesktopPlatform;
  readonly snapshot: PasswordModuleSnapshot;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
  readonly initialLoginAccountId?: S01AccountId;
}

function isLocalTimingFailure(snapshot: PasswordModuleSnapshot): boolean {
  return (
    snapshot.matches({ s03: 'startFailed' }) ||
    snapshot.matches({ s03: 'endWriteFailed' })
  );
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

const timeLapseDays = Array.from({ length: 100 }, (_, index) => index + 1);

function TimeLapseOverlay({
  onTimeLapseComplete,
}: {
  readonly onTimeLapseComplete: () => void;
}) {
  return (
    <section
      className={styles.timeLapseOverlay}
      aria-label="Der fiktive Campusalltag läuft im Zeitraffer."
    >
      <span
        className={styles.timeLapseCompletionSignal}
        aria-hidden="true"
        onAnimationEnd={(event) => {
          if (event.currentTarget === event.target) onTimeLapseComplete();
        }}
      />
      <div className={styles.timeLapseCenter} aria-hidden="true">
        <span className={styles.timeLapseClock}>
          <svg viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="52" />
            <path d="M60 20v8M100 60h-8M60 100v-8M20 60h8" />
            <path className={styles.clockMinuteHand} d="M60 60V30" />
            <path className={styles.clockHourHand} d="m60 60 22 13" />
            <circle cx="60" cy="60" r="4" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <span className={styles.timeLapseDayViewport}>
          <span className={styles.timeLapseDayTrack}>
            {timeLapseDays.map((day) => (
              <strong key={day}>Tag {day}</strong>
            ))}
          </span>
        </span>
      </div>
      <span className={styles.screenReaderOnly} role="status">
        Zeitraffer läuft. Die Tage vergehen.
      </span>
    </section>
  );
}

function WarningScreenFlash() {
  return <div className={styles.warningScreenFlash} aria-hidden="true" />;
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
    account.id === 'master-campus'
      ? campusIdentity.masterCampus
      : account.id === 'campus-email'
        ? campusIdentity.campusEmail
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
  const trainingRootRef = useRef<HTMLElement | null>(null);
  const loginTitleRef = useRef<HTMLHeadingElement | null>(null);
  const assistedLoginButtonRef = useRef<HTMLButtonElement | null>(null);
  const failedLoginAttemptsRef = useRef<Partial<Record<S01AccountId, number>>>({});
  const [revealedAccountIds, setRevealedAccountIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [loginAccountId, setLoginAccountId] = useState<S01AccountId | null>(
    initialLoginAccountId ?? null,
  );
  const [guideOpen, setGuideOpen] = useState(false);
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
  const assistanceActive = snapshot.matches({ s03: 'assistance' });
  const autofillingActive = snapshot.matches({ s03: 'autofilling' });
  const assistedLoginActive = snapshot.matches({ s03: 'assistedLogin' });
  const completionFeedbackActive = snapshot.matches({
    s03: { completionSequence: 'feedback' },
  });
  const timeLapsePhaseActive = snapshot.matches({
    s03: { completionSequence: 'timeLapseRunning' },
  });
  const awaitingIncidentOpen = snapshot.matches({ s03: 'awaitingIncidentOpen' });
  const campusgramWarningActive =
    awaitingIncidentOpen ||
    snapshot.matches({ s03: 'writingEnd' }) ||
    snapshot.matches({ s03: 'endWriteFailed' });

  useEffect(() => {
    if (loginAccountId !== null) loginTitleRef.current?.focus();
  }, [loginAccountId]);

  useEffect(() => {
    if (assistedLoginActive) assistedLoginButtonRef.current?.focus();
  }, [assistedLoginActive]);

  const incidentTabAvailable = awaitingIncidentOpen && externalTimingError === null;
  const incidentTabHighlighted = awaitingIncidentOpen;

  useEffect(() => {
    if (!incidentTabAvailable) return;
    const campusgramTab = Array.from(
      trainingRootRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    ).find((tab) => tab.getAttribute('aria-label')?.startsWith('Campusgram'));
    campusgramTab?.focus();
  }, [incidentTabAvailable]);

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

  const presentedAccountId =
    timeLapsePhaseActive || campusgramWarningActive
      ? 'master-campus'
      : snapshot.context.activeAccountId;
  const presentedAccount =
    s01Content.browser.accounts.find(({ id }) => id === presentedAccountId) ??
    s01Content.browser.accounts[0];
  const activeAccountId = presentedAccount?.id ?? '';
  const activePasswordValue = snapshot.context.retrievalPasswordValues[activeAccountId] ?? '';
  const passwordInput = useFictionalPasswordInput({
    value: activePasswordValue,
    feedbackKey: activeAccountId,
    onAccepted: (value) => {
      if (activeAccountId === '') return;
      setInvalidLoginFeedback(null);
      controller.setRetrievalPasswordValue(activeAccountId, value);
    },
  });
  const account = presentedAccount;
  if (account === undefined) return null;

  const completedCount = getRetrievedAccountCount(snapshot.context);
  const result = snapshot.context.retrievalResults[account.id] ?? 'pending';
  const activeValue = activePasswordValue;
  const autofillTargetValue = snapshot.context.passwordValues[account.id] ?? '';
  const invalidLoginActive = invalidLoginFeedback?.accountId === account.id;
  const thirdAttemptGuideActive =
    thirdAttemptGuideAccountId === account.id && result === 'pending';
  const campusIdentity = deriveCampusIdentity(snapshot.context.displayName ?? '');
  const accountIdentifier =
    account.id === 'master-campus'
      ? campusIdentity.masterCampus
      : account.id === 'campus-email'
        ? campusIdentity.campusEmail
        : campusIdentity.campusgram;
  const accountPage = s03Content.accountPages[account.id];
  const isStarting = snapshot.matches({ s03: 'starting' });
  const s03EndWritePending = snapshot.matches({ s03: 'writingEnd' });
  const handoffActive = s03EndWritePending || snapshot.matches({ s03: 'endWriteFailed' });
  const localTimingFailure = isLocalTimingFailure(snapshot);
  const completionSequenceActive =
    snapshot.matches({ s03: 'completionSequence' }) ||
    awaitingIncidentOpen ||
    handoffActive;
  const interactionBlocked =
    externalTimingError !== null ||
    localTimingFailure ||
    isStarting ||
    assistanceActive ||
    autofillingActive ||
    assistedLoginActive ||
    completionSequenceActive;
  const timingFailure = externalTimingError !== null || localTimingFailure;
  const guidedPhaseOpen =
    assistanceActive ||
    completionFeedbackActive;
  const guideVisible = guidedPhaseOpen || guideOpen;
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
  const guideContent = campusgramWarningActive
    ? { message: s03Content.narration.warning, emphasisId: 's03.warning' }
    : assistanceActive
      ? { message: s03Content.narration.retrievalHelp, emphasisId: 's03.retrieval-help' }
      : thirdAttemptGuideActive
        ? {
            message: s03Content.narration.thirdFailedLogin,
            emphasisId: 's03.third-failed-login',
          }
        : completionFeedbackActive
          ? {
              message: s03Content.narration.completion,
              emphasisId: 's03.completion',
            }
          : result === 'retrievable'
              ? {
                  message: s03Content.narration.accountSuccess[account.id],
                  emphasisId: 's03.success',
                }
              : result === 'assisted'
                ? {
                    message: s03Content.narration.accountSuccess[account.id],
                    emphasisId: 's03.success',
                  }
                : result === 'not-remembered'
                  ? {
                      message: s03Content.narration.retrievalHelp,
                      emphasisId: 's03.retrieval-help',
                    }
                  : { message: s03Content.narration.intro, emphasisId: 's03.intro' };
  const guideMessage = guideContent.message;
  const guidePhase = campusgramWarningActive
    ? 'warning'
    : assistanceActive
      ? 'assistance'
      : thirdAttemptGuideActive
        ? 'third-failed-login'
        : completionFeedbackActive
          ? 'completion-feedback'
          : autofillingActive
              ? 'autofilling'
              : assistedLoginActive
                ? 'assisted-login'
                : 'login';
  const guideSpeechKey = `${account.id}-${result}-${guidePhase}`;
  const guideSpeechAction: PassWoSpeechAction | undefined = assistanceActive
    ? {
        kind: 'perform',
        label: s03Content.controls.assistedLogin,
        onAction: () => {
          setLoginAccountId(account.id);
          setGuideOpen(false);
          controller.startAssistedLogin(account.id);
        },
      }
    : completionFeedbackActive
      ? {
          kind: 'advance',
          label: s03Content.controls.campusStartContinue,
          onAction: () => {
            setSuccessOverlayAccountId(null);
            controller.continueS03CompletionFeedback();
          },
        }
    : campusgramWarningActive
          ? undefined
          : {
              kind: 'dismiss',
              onAction: () => {
                setThirdAttemptGuideAccountId(null);
                setGuideOpen(false);
              },
            };
  const successOverlayLabel =
    successOverlayAccountId === null
      ? null
      : s03Content.narration.accountSuccess[successOverlayAccountId];
  const browserSnapshot: BrowserShellSnapshot = {
    tabs: s01Content.browser.accounts.map((tabAccount) => ({
      id: tabAccount.id,
      label:
        campusgramWarningActive && tabAccount.id === 'campusgram'
          ? `${tabAccount.label} · Warnung`
          : tabAccount.label,
      icon: <NetworkSymbol symbolId={tabAccount.symbolId} />,
      enabled: campusgramWarningActive
        ? incidentTabAvailable && tabAccount.id === 'campusgram'
        : !interactionBlocked,
      disabledReason:
        campusgramWarningActive && tabAccount.id !== 'campusgram'
          ? 'Während der Warnung ist nur Campusgram freigegeben.'
          : campusgramWarningActive
            ? 'PassWo beendet zuerst die kurze Ansage oder das Zeitereignis wird noch gespeichert.'
            : 'Dieser Tab ist in der aktuellen Szene nicht freigegeben.',
      ...(campusgramWarningActive && tabAccount.id === 'campusgram'
        ? { status: 'danger' as const }
        : !timeLapsePhaseActive &&
            (snapshot.context.retrievalResults[tabAccount.id] === 'retrievable' ||
              snapshot.context.retrievalResults[tabAccount.id] === 'assisted')
          ? { status: 'complete' as const }
          : {}),
    })),
    activeTabId: account.id,
    address: pageAddress,
    accountIdentifier,
    scrollKey: `s03:${account.id}:${websiteView}`,
    dimmed: guideVisible || campusgramWarningActive,
    dimStrength: 'soft',
    ...(incidentTabAvailable
      ? { allowTabInteractionWhenDimmed: true, tabActivation: 'manual' as const }
      : {}),
    ...(incidentTabHighlighted ? { highlightedTabId: 'campusgram' } : {}),
    locked: isStarting || timeLapsePhaseActive || s03EndWritePending,
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
    if (incidentTabAvailable && accountId === 'campusgram') {
      controller.openIncidentAccount(accountId);
      return;
    }
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
    <section
      ref={trainingRootRef}
      className={styles.training}
      aria-label={s03Content.trainingAriaLabel}
    >
      <BrowserShell
        platform={platform}
        variant="artifact"
        snapshot={browserSnapshot}
        ariaLabel={s03Content.browser.ariaLabel}
        onTabSelect={selectAccount}
        layers={{
          ...(timeLapsePhaseActive
            ? {
                screen: (
                  <TimeLapseOverlay
                    onTimeLapseComplete={() => controller.completeS03TimeLapse()}
                  />
                ),
              }
            : awaitingIncidentOpen
              ? { screen: <WarningScreenFlash /> }
              : {}),
          passWo: (
            <>
              {successOverlayLabel === null ? null : (
                <AccountSuccessOverlay
                  label={successOverlayLabel}
                  onComplete={() => setSuccessOverlayAccountId(null)}
                />
              )}
              {timeLapsePhaseActive || campusgramWarningActive ? null : (
                <PassWoGuide
                  guideName={s03Content.narration.guideName}
                  taskLabel="Anmelden"
                  progress={{
                    current: completedCount,
                    total: s01Content.browser.accounts.length,
                    label: s03Content.page.progress(completedCount),
                  }}
                  helpOpen={guideVisible}
                  helpId="s03-guide"
                  openHelpLabel="PassWo-Hinweis öffnen"
                  speech={[guideMessage]}
                  speechKey={guideSpeechKey}
                  speechEmphasis={passWoSpeechEmphasisFor(guideContent.emphasisId)}
                  speechPlacement="right"
                  placement={campusgramWarningActive ? 'center' : 'bottom-left'}
                  pose={campusgramWarningActive ? 'warning' : 'default'}
                  {...(guideSpeechAction === undefined ? {} : { speechAction: guideSpeechAction })}
                  showHelpButton={!guidedPhaseOpen}
                  onToggleHelp={() => {
                    if (guideVisible) setThirdAttemptGuideAccountId(null);
                    setGuideOpen((open) => !open);
                  }}
                />
              )}
            </>
          ),
          controls: (
            <>
              {(isStarting || s03EndWritePending) && externalTimingError === null ? (
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
            </>
          ),
        }}
      >
        <div className={styles.page} aria-labelledby="s03-page-title">
          <CampusWebsiteBackdrop
            accountId={account.id}
            interactionLabel={`${account.label} wieder anmelden`}
            view={websiteView}
            displayName={snapshot.context.displayName ?? ''}
            timeLapseActive={timeLapsePhaseActive}
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
                        autoComplete="username"
                        value={accountIdentifier}
                        readOnly
                        aria-readonly="true"
                      />
                      <div className={styles.passwordFieldHeader}>
                        <label
                          className={styles.passwordLabel}
                          htmlFor={`s03-password-${account.id}`}
                        >
                          {s03Content.controls.passwordLabel}
                        </label>
                        {passwordInput.tooLong ? (
                          <p
                            className={styles.passwordLimitWarning}
                            id={`s03-password-limit-${account.id}`}
                            role="alert"
                          >
                            {s03Content.controls.passwordTooLong}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={styles.passwordInputGroup}
                        data-autofill={
                          autofillingActive ? 'running' : assistedLoginActive ? 'ready' : undefined
                        }
                        data-limit-feedback={
                          passwordInput.limitFeedbackAttempt === undefined
                            ? undefined
                            : String(passwordInput.limitFeedbackAttempt % 2)
                        }
                      >
                        <input
                          id={`s03-password-${account.id}`}
                          name={`s03-password-${account.id}`}
                          type={revealedAccountIds.has(account.id) ? 'text' : 'password'}
                          autoComplete="current-password"
                          maxLength={MAX_FICTIONAL_PASSWORD_LENGTH}
                          spellCheck={false}
                          value={autofillingActive ? autofillTargetValue : activeValue}
                          readOnly={autofillingActive || assistedLoginActive}
                          aria-readonly={autofillingActive || assistedLoginActive || undefined}
                          aria-invalid={invalidLoginActive || passwordInput.tooLong || undefined}
                          aria-describedby={[
                            invalidLoginActive ? `s03-password-error-${account.id}` : undefined,
                            passwordInput.tooLong
                              ? `s03-password-limit-${account.id}`
                              : undefined,
                          ]
                            .filter((descriptionId): descriptionId is string => descriptionId !== undefined)
                            .join(' ') || undefined}
                          onBeforeInput={
                            autofillingActive || assistedLoginActive
                              ? undefined
                              : passwordInput.onBeforeInput
                          }
                          onPaste={
                            autofillingActive || assistedLoginActive
                              ? undefined
                              : passwordInput.onPaste
                          }
                          onChange={
                            assistedLoginActive
                              ? undefined
                              : passwordInput.onChange
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
                      </div>
                    </form>
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
        </div>
      </BrowserShell>
    </section>
  );
}

import { s01Content, type S01AccountId } from '@passwo/training-content';
import {
  deriveCampusIdentity,
  getConfiguredAccountCount,
  type PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import {
  BrowserShell,
  type BrowserShellSnapshot,
  type DesktopPlatform,
} from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import { NetworkSymbol } from '../../adapters/network/NetworkSymbolRegistry.js';
import { AccountSuccessOverlay } from './AccountSuccessOverlay.js';
import { CampusWebsiteBackdrop } from './CampusWebsiteBackdrop.js';
import { PassWoGuide } from './PassWoGuide.js';
import { passWoSpeechEmphasisFor } from './PassWoSpeechEmphasis.js';
import styles from './S01Training.module.css';

function isReadyToContinue(snapshot: PasswordModuleSnapshot): boolean {
  return (
    snapshot.matches({ s01: 'configured' }) ||
    snapshot.matches({ s01: 'ending' }) ||
    snapshot.matches({ s01: 'endFailed' })
  );
}

function isLocalTimingFailure(snapshot: PasswordModuleSnapshot): boolean {
  return snapshot.matches({ s01: 'startFailed' }) || snapshot.matches({ s01: 'endFailed' });
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

export interface S01TrainingProps {
  readonly controller: PasswordModuleController;
  readonly platform?: DesktopPlatform;
  readonly snapshot: PasswordModuleSnapshot;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
  readonly initialAuthenticationAccountId?: S01AccountId;
}

export function S01Training({
  controller,
  platform = 'mac',
  snapshot,
  externalTimingError = null,
  onRetryExternalTiming,
  initialAuthenticationAccountId,
}: S01TrainingProps) {
  const [revealedAccountIds, setRevealedAccountIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [registrationOpenedAccountIds, setRegistrationOpenedAccountIds] = useState<
    ReadonlySet<string>
  >(() =>
    initialAuthenticationAccountId === undefined
      ? new Set()
      : new Set([initialAuthenticationAccountId]),
  );
  const [questHelpOpen, setQuestHelpOpen] = useState(false);
  const [completionOverlayAccountId, setCompletionOverlayAccountId] =
    useState<S01AccountId | null>(null);
  const knownConfiguredAccountIdsRef = useRef<ReadonlySet<string>>(
    new Set(snapshot.context.configuredAccountIds),
  );
  const [browserOpen, setBrowserOpen] = useState(true);
  const [desktopTransitioning, setDesktopTransitioning] = useState(false);
  const account = s01Content.browser.accounts.find(
    ({ id }) => id === snapshot.context.activeAccountId,
  );
  const accountConfigured =
    account !== undefined && snapshot.context.configuredAccountIds.includes(account.id);
  const readyToContinue = isReadyToContinue(snapshot);

  useEffect(() => {
    const knownAccountIds = knownConfiguredAccountIdsRef.current;
    const completedAccount = s01Content.browser.accounts.find(
      ({ id }) => snapshot.context.configuredAccountIds.includes(id) && !knownAccountIds.has(id),
    );
    knownConfiguredAccountIdsRef.current = new Set(snapshot.context.configuredAccountIds);
    if (completedAccount !== undefined) {
      setCompletionOverlayAccountId(completedAccount.id);
    }
  }, [snapshot.context.configuredAccountIds]);

  useEffect(() => {
    if (
      desktopTransitioning &&
      (externalTimingError !== null || isLocalTimingFailure(snapshot))
    ) {
      setDesktopTransitioning(false);
      setBrowserOpen(true);
    }
  }, [desktopTransitioning, externalTimingError, snapshot]);

  useEffect(() => {
    if (readyToContinue) setQuestHelpOpen(true);
  }, [readyToContinue]);

  if (account === undefined) return null;

  const configuredCount = getConfiguredAccountCount(snapshot.context);
  const allAccountsConfigured = configuredCount === s01Content.browser.accounts.length;
  const editing = snapshot.matches({ s01: 'editing' });
  const localTimingFailure = isLocalTimingFailure(snapshot);
  const initialTimingPending = snapshot.matches({ s01: 'starting' });
  const interactionBlocked =
    externalTimingError !== null || localTimingFailure || initialTimingPending;
  const timingFailure = externalTimingError !== null || localTimingFailure;
  const activeValue = snapshot.context.passwordValues[account.id] ?? '';
  const campusIdentity = deriveCampusIdentity(snapshot.context.displayName ?? '');
  const accountIdentifier =
    account.id === 'master-campus'
      ? campusIdentity.masterCampus
      : account.id === 'campus-email'
        ? campusIdentity.campusEmail
        : campusIdentity.campusgram;
  const canConfigure =
    editing && !accountConfigured && activeValue.length > 0 && !interactionBlocked;
  const websiteView = accountConfigured
    ? 'dashboard'
    : registrationOpenedAccountIds.has(account.id)
      ? 'authentication'
      : 'landing';
  const pageAddress =
    websiteView === 'authentication'
      ? `${account.address}/register`
      : websiteView === 'dashboard'
        ? `${account.address}/dashboard`
        : account.address;
  const snapshotForBrowser: BrowserShellSnapshot = {
    tabs: s01Content.browser.accounts.map((tabAccount) => ({
      id: tabAccount.id,
      label: tabAccount.label,
      icon: <NetworkSymbol symbolId={tabAccount.symbolId} />,
      enabled: !interactionBlocked,
      ...(snapshot.context.configuredAccountIds.includes(tabAccount.id)
        ? { status: 'complete' as const }
        : {}),
    })),
    activeTabId: account.id,
    address: pageAddress,
    accountIdentifier,
    scrollKey: `s01:${account.id}:${websiteView}`,
    dimmed: questHelpOpen && !readyToContinue,
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

  function retryTiming(): void {
    if (externalTimingError !== null) {
      onRetryExternalTiming?.();
      return;
    }
    controller.retryTiming();
  }

  function selectAccount(accountId: string): void {
    setCompletionOverlayAccountId(null);
    controller.selectAccount(accountId);
  }

  function beginDesktopTransition(): void {
    if (readyToContinue && !interactionBlocked && !desktopTransitioning) {
      setDesktopTransitioning(true);
    }
  }

  return (
    <section className={styles.training} aria-label={s01Content.trainingAriaLabel}>
      <BrowserShell
        platform={platform}
        variant="artifact"
        snapshot={snapshotForBrowser}
        ariaLabel={s01Content.browser.ariaLabel}
        windowOpen={browserOpen}
        onWindowOpenChange={(open) => {
          setBrowserOpen(open);
          if (!open) setCompletionOverlayAccountId(null);
          if (open) {
            setDesktopTransitioning(false);
          } else {
            beginDesktopTransition();
          }
        }}
        onWindowClose={() => {
          setCompletionOverlayAccountId(null);
          beginDesktopTransition();
        }}
        onWindowTransitionEnd={(state) => {
          if (state === 'closed' && desktopTransitioning) controller.continue();
        }}
        onTabSelect={selectAccount}
        layers={{
          passWo: (
            <>
              {completionOverlayAccountId === null ? null : (
                <AccountSuccessOverlay
                  label={s01Content.completion.overlayLabel(
                    s01Content.browser.accounts.find(
                      ({ id }) => id === completionOverlayAccountId,
                    )?.label ?? '',
                  )}
                  onComplete={() => setCompletionOverlayAccountId(null)}
                />
              )}
              <PassWoGuide
                guideName={s01Content.completion.guideName}
                taskLabel={
                  allAccountsConfigured ? s01Content.progress.completeStatus : 'Einrichten'
                }
                taskComplete={allAccountsConfigured}
                showTaskStatusWhenSpeaking={allAccountsConfigured}
                progress={{
                  current: configuredCount,
                  total: s01Content.browser.accounts.length,
                  label: s01Content.progress.status(configuredCount),
                }}
                helpOpen={questHelpOpen}
                helpId="s01-quest-help"
                openHelpLabel={s01Content.quest.helpLabel}
                speech={[
                  readyToContinue
                    ? s01Content.completion.guideMessage
                    : s01Content.quest.guideMessage,
                ]}
                speechKey={readyToContinue ? 's01-ready' : `s01-${account.id}-${configuredCount}`}
                speechEmphasis={passWoSpeechEmphasisFor(
                  readyToContinue ? 's01.ready' : 's01.quest',
                )}
                speechPlacement="right"
                onToggleHelp={() => setQuestHelpOpen(true)}
                speechAction="dismiss"
                onSpeechAction={() => setQuestHelpOpen(false)}
              />
            </>
          ),
        }}
      >
        <CampusWebsiteBackdrop
          accountId={account.id}
          interactionLabel={`${account.label} einrichten`}
          view={websiteView}
          displayName={snapshot.context.displayName ?? ''}
          {...(websiteView === 'landing'
            ? {
                primaryAction: {
                  label: account.landing.loginLabel,
                  disabled: true,
                  disabledReason: s01Content.siteUi.loginUnavailable,
                },
                secondaryAction: {
                  label: account.landing.registerLabel,
                  disabled: interactionBlocked,
                  onClick: () => {
                    setRegistrationOpenedAccountIds((currentIds) => {
                      const nextIds = new Set(currentIds);
                      nextIds.add(account.id);
                      return nextIds;
                    });
                  },
                },
              }
            : {})}
          authenticationTitle={s01Content.controls.registrationTitle}
          onBack={() => {
            setRegistrationOpenedAccountIds((currentIds) => {
              const nextIds = new Set(currentIds);
              nextIds.delete(account.id);
              return nextIds;
            });
          }}
        >
          {websiteView === 'authentication' ? (
            <section className={styles.setupPanel} aria-label={s01Content.controls.registrationTitle}>
              <dl className={styles.accountDetails}>
                <div>
                  <dt>{account.accountDataLabel}</dt>
                  <dd>{accountIdentifier}</dd>
                </div>
              </dl>
              <form
                className={styles.passwordForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (canConfigure) controller.configureAccount(account.id);
                }}
              >
                <label
                  className={styles.passwordLabel}
                  htmlFor={`fictional-password-${account.id}`}
                >
                  {s01Content.controls.passwordLabel}
                </label>
                <span className={styles.passwordInputGroup}>
                  <input
                    id={`fictional-password-${account.id}`}
                    name={`fictional-password-${account.id}`}
                    type={revealedAccountIds.has(account.id) ? 'text' : 'password'}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={!editing || interactionBlocked}
                    value={activeValue}
                    onChange={(event) =>
                      controller.setPasswordValue(account.id, event.currentTarget.value)
                    }
                  />
                  <button
                    type="button"
                    className={styles.revealButton}
                    aria-pressed={revealedAccountIds.has(account.id)}
                    aria-label={
                      revealedAccountIds.has(account.id)
                        ? s01Content.controls.hidePassword(account.label)
                        : s01Content.controls.showPassword(account.label)
                    }
                    disabled={interactionBlocked}
                    onClick={() => toggleReveal(account.id)}
                  >
                    <PasswordVisibilityIcon revealed={revealedAccountIds.has(account.id)} />
                  </button>
                </span>
                <div className={styles.buttonRow}>
                  <button type="submit" className={styles.primaryButton} disabled={!canConfigure}>
                    {s01Content.controls.configure}
                  </button>
                </div>
              </form>
            </section>
          ) : null}
        </CampusWebsiteBackdrop>
        {(snapshot.matches({ s01: 'ending' }) || initialTimingPending) &&
        externalTimingError === null ? (
          <p className={styles.timingStatus} role="status">
            {s01Content.controls.timingSaving}
          </p>
        ) : null}
        {timingFailure ? (
          <section className={styles.timingError} role="alert">
            <p>{s01Content.controls.timingFailure}</p>
            <p>Fehlercode: {externalTimingError ?? snapshot.context.timingErrorCode}</p>
            <button type="button" className={styles.primaryButton} onClick={retryTiming}>
              {s01Content.controls.retry}
            </button>
          </section>
        ) : null}
      </BrowserShell>
    </section>
  );
}

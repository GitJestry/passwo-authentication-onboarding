import { s01Content } from '@passwo/training-content';
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
import { CampusWebsiteBackdrop } from './CampusWebsiteBackdrop.js';
import { PassWoGuide } from './PassWoGuide.js';
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
}

export function S01Training({
  controller,
  platform = 'mac',
  snapshot,
  externalTimingError = null,
  onRetryExternalTiming,
}: S01TrainingProps) {
  const [revealedAccountIds, setRevealedAccountIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [questHelpOpen, setQuestHelpOpen] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(true);
  const [desktopTransitioning, setDesktopTransitioning] = useState(false);
  const completionStatusRef = useRef<HTMLHeadingElement>(null);
  const account =
    s01Content.browser.accounts.find(({ id }) => id === snapshot.context.activeAccountId) ??
    s01Content.browser.accounts[0];
  const accountConfigured =
    account !== undefined && snapshot.context.configuredAccountIds.includes(account.id);
  const completionFocusTarget = accountConfigured ? account?.id : null;
  const readyToContinue = isReadyToContinue(snapshot);

  useEffect(() => {
    if (completionFocusTarget !== null) completionStatusRef.current?.focus();
  }, [completionFocusTarget]);

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
  const editing = snapshot.matches({ s01: 'editing' });
  const localTimingFailure = isLocalTimingFailure(snapshot);
  const initialTimingPending = snapshot.matches({ s01: 'starting' });
  const interactionBlocked =
    externalTimingError !== null || localTimingFailure || initialTimingPending;
  const timingFailure = externalTimingError !== null || localTimingFailure;
  const activeValue = snapshot.context.passwordValues[account.id] ?? '';
  const campusIdentity = deriveCampusIdentity(snapshot.context.displayName ?? '');
  const accountData =
    account.id === 'campus-id'
      ? campusIdentity.campusId
      : account.id === 'campus-mail'
        ? campusIdentity.campusMail
        : campusIdentity.campusgram;
  const canConfigure =
    editing && !accountConfigured && activeValue.length > 0 && !interactionBlocked;
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
    address: account.address,
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
          if (open) {
            setDesktopTransitioning(false);
          } else {
            beginDesktopTransition();
          }
        }}
        onWindowClose={() => {
          beginDesktopTransition();
        }}
        onWindowTransitionEnd={(state) => {
          if (state === 'closed' && desktopTransitioning) controller.continue();
        }}
        onTabSelect={selectAccount}
        layers={{
          passWo: (
            <PassWoGuide
              guideName={s01Content.completion.guideName}
              taskLabel="Einrichten"
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
              speechPlacement="right"
              awaitsAction={readyToContinue}
              onToggleHelp={() => setQuestHelpOpen(true)}
              onSpeechAdvance={() => setQuestHelpOpen(false)}
            />
          ),
        }}
      >
        <CampusWebsiteBackdrop
          accountId={account.id}
          interactionLabel={`${account.label} einrichten`}
        >
          <section className={styles.setupPanel} aria-labelledby="s01-page-title">
            <h1 id="s01-page-title">{account.label}</h1>
            <dl className={styles.accountDetails}>
              <div>
                <dt>{account.accountDataLabel}</dt>
                <dd>{accountData}</dd>
              </div>
            </dl>
            {accountConfigured ? (
              <section
                className={styles.accountComplete}
                aria-label={s01Content.completion.accountStatus}
              >
                <span aria-hidden="true">✓</span>
                <h2 ref={completionStatusRef} tabIndex={-1} aria-live="polite">
                  {s01Content.completion.accountStatus}
                </h2>
              </section>
            ) : (
              <form
                className={styles.passwordForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (canConfigure) {
                    controller.configureAccount(account.id);
                  }
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
            )}
          </section>
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

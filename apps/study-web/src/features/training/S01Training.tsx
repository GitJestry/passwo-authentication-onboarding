import { s01Content } from '@passwo/training-content';
import {
  deriveCampusIdentity,
  getConfiguredAccountCount,
  type PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import { BrowserShell, type BrowserShellSnapshot } from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import { NetworkSymbol } from '../../adapters/network/NetworkSymbolRegistry.js';
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
  readonly snapshot: PasswordModuleSnapshot;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
}

export function S01Training({
  controller,
  snapshot,
  externalTimingError = null,
  onRetryExternalTiming,
}: S01TrainingProps) {
  const [revealedAccountIds, setRevealedAccountIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [questHelpOpen, setQuestHelpOpen] = useState(true);
  const completionStatusRef = useRef<HTMLHeadingElement>(null);
  const account =
    s01Content.browser.accounts.find(({ id }) => id === snapshot.context.activeAccountId) ??
    s01Content.browser.accounts[0];
  const accountConfigured =
    account !== undefined && snapshot.context.configuredAccountIds.includes(account.id);
  const completionFocusTarget = accountConfigured ? account?.id : null;

  useEffect(() => {
    if (completionFocusTarget !== null) completionStatusRef.current?.focus();
  }, [completionFocusTarget]);

  if (account === undefined) return null;

  const configuredCount = getConfiguredAccountCount(snapshot.context);
  const readyToContinue = isReadyToContinue(snapshot);
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
        : account.accountData;
  const canConfigure =
    editing && !accountConfigured && activeValue.length > 0 && !interactionBlocked;
  const snapshotForBrowser: BrowserShellSnapshot = {
    tabs: s01Content.browser.accounts.map((tabAccount) => ({
      id: tabAccount.id,
      label: tabAccount.label,
      enabled: !interactionBlocked,
      ...(snapshot.context.configuredAccountIds.includes(tabAccount.id)
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
    <section className={styles.training} aria-label={s01Content.trainingAriaLabel}>
      <BrowserShell
        variant="artifact"
        snapshot={snapshotForBrowser}
        ariaLabel={s01Content.browser.ariaLabel}
        onTabSelect={(accountId) => controller.selectAccount(accountId)}
        layers={{
          passWo: (
            <PassWoGuide
              guideName={s01Content.completion.guideName}
              progressLabel={s01Content.progress.status(configuredCount)}
              helpOpen={questHelpOpen}
              helpId="s01-quest-help"
              openHelpLabel={s01Content.quest.helpLabel}
              closeHelpLabel={s01Content.quest.closeHelpLabel}
              onToggleHelp={() => setQuestHelpOpen((open) => !open)}
            >
              <p>
                {readyToContinue
                  ? s01Content.quest.readyToContinue
                  : s01Content.quest.nextAccount(account.label)}
              </p>
            </PassWoGuide>
          ),
        }}
      >
        <article className={styles.page} aria-labelledby="s01-page-title">
          <header className={styles.pageHeader}>
            <div className={styles.siteIdentity}>
              <NetworkSymbol symbolId={account.symbolId} className={styles.siteSymbol} />
              <span className={styles.identityName}>{account.label}</span>
            </div>
            <nav className={styles.siteNavigation} aria-label={`${account.label}-Navigation`}>
              {account.navigation.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </nav>
          </header>
          <div className={styles.pageBody}>
            <section className={styles.setupPanel} aria-labelledby="s01-page-title">
              <h1 id="s01-page-title">{account.label}</h1>
              <dl className={styles.accountDetails}>
                <div>
                  <dt>{account.accountDataLabel}</dt>
                  <dd>{accountData}</dd>
                </div>
                <div>
                  <dt>{s01Content.progress.accountRoleLabel}</dt>
                  <dd>{account.role}</dd>
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
              )}
              {readyToContinue ? (
                <section
                  className={styles.continueAction}
                  aria-label={s01Content.completion.guideName}
                >
                  <p>{s01Content.completion.guideMessage}</p>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={snapshot.matches({ s01: 'ending' }) || interactionBlocked}
                    onClick={() => controller.continue()}
                  >
                    {s01Content.controls.continue}
                  </button>
                </section>
              ) : null}
            </section>
            <aside className={styles.websiteSidebar} aria-label={`${account.label}-Übersicht`}>
              <section className={styles.websiteModule}>
                <NetworkSymbol symbolId={account.symbolId} className={styles.moduleSymbol} />
                <h2>{account.overview.title}</h2>
                <p>{account.overview.description}</p>
              </section>
              <section className={styles.activityModule}>
                <h2>{account.overview.activityTitle}</h2>
                <ul>
                  {account.overview.activityItems.map((item) => (
                    <li key={item}>
                      <span className={styles.skeletonDot} aria-hidden="true" />
                      <span>{item}</span>
                      <span className={styles.skeletonLine} aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
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
        </article>
      </BrowserShell>
    </section>
  );
}

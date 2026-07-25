import { s01Content } from '@passwo/training-content';
import {
  getConfiguredAccountCount,
  type PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import { BrowserShell, type BrowserShellSnapshot } from '@passwo/ui';
import { useState } from 'react';
import styles from './S01Training.module.css';

function isConfigured(snapshot: PasswordModuleSnapshot): boolean {
  return (
    snapshot.matches({ s01: 'configured' }) ||
    snapshot.matches({ s01: 'ending' }) ||
    snapshot.matches({ s01: 'endFailed' })
  );
}

function isLocalTimingFailure(snapshot: PasswordModuleSnapshot): boolean {
  return snapshot.matches({ s01: 'startFailed' }) || snapshot.matches({ s01: 'endFailed' });
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
  const account =
    s01Content.browser.accounts.find(({ id }) => id === snapshot.context.activeAccountId) ??
    s01Content.browser.accounts[0];

  if (account === undefined) return null;

  const configuredCount = getConfiguredAccountCount(snapshot.context);
  const editing = snapshot.matches({ s01: 'editing' });
  const configured = isConfigured(snapshot);
  const localTimingFailure = isLocalTimingFailure(snapshot);
  const initialTimingPending = snapshot.matches({ s01: 'starting' });
  const interactionBlocked =
    externalTimingError !== null || localTimingFailure || initialTimingPending;
  const timingFailure = externalTimingError !== null || localTimingFailure;
  const canConfigure = editing && configuredCount === s01Content.browser.accounts.length;
  const activeValue = snapshot.context.passwordValues[account.id] ?? '';
  const snapshotForBrowser: BrowserShellSnapshot = {
    tabs: s01Content.browser.accounts.map((tabAccount) => ({
      id: tabAccount.id,
      label: tabAccount.label,
      enabled: !interactionBlocked,
      ...(configured ? { status: 'complete' as const } : {}),
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
        snapshot={snapshotForBrowser}
        ariaLabel={s01Content.browser.ariaLabel}
        onTabSelect={(accountId) => controller.selectAccount(accountId)}
      >
        <article className={styles.page} aria-labelledby="s01-page-title">
          <header className={styles.pageHeader}>
            <span className={styles.identityMark} aria-hidden="true">
              cr
            </span>
            <span className={styles.identityName}>{s01Content.browser.identityName}</span>
            <span className={styles.fictionalBadge}>{s01Content.browser.fictionalBadge}</span>
          </header>
          <div className={styles.pageBody}>
            <section className={styles.setupPanel} aria-labelledby="s01-page-title">
              <p className={styles.eyebrow}>Konten einrichten</p>
              <h1 id="s01-page-title">{account.label}</h1>
              <dl className={styles.accountDetails}>
                <div>
                  <dt>{account.accountDataLabel}</dt>
                  <dd>{account.accountData}</dd>
                </div>
                <div>
                  <dt>{s01Content.progress.accountRoleLabel}</dt>
                  <dd>{account.role}</dd>
                </div>
              </dl>
              <form
                className={styles.passwordForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (canConfigure) controller.configureAccounts();
                }}
              >
                <label className={styles.passwordLabel}>
                  <span>{s01Content.controls.passwordLabel}</span>
                  <input
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
                </label>
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
                  {revealedAccountIds.has(account.id)
                    ? s01Content.controls.hide
                    : s01Content.controls.show}
                </button>
                {!configured ? (
                  <div className={styles.buttonRow}>
                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={!canConfigure || interactionBlocked}
                      aria-describedby={canConfigure ? undefined : 's01-configure-reason'}
                    >
                      {s01Content.controls.configure}
                    </button>
                    {!canConfigure ? (
                      <p id="s01-configure-reason" className={styles.helpText}>
                        {s01Content.controls.configureReason}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </form>
              {configured ? (
                <p className={styles.accountComplete} role="status">
                  <span aria-hidden="true">✓</span>
                  {s01Content.completion.accountStatus}
                </p>
              ) : null}
            </section>
            <aside className={styles.progressCard} aria-label={s01Content.progress.label}>
              <p className={styles.progressLabel}>{s01Content.progress.label}</p>
              <strong className={styles.progressValue} aria-live="polite">
                {s01Content.progress.status(configuredCount)}
              </strong>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label={s01Content.progress.label}
                aria-valuemin={0}
                aria-valuemax={s01Content.browser.accounts.length}
                aria-valuenow={configuredCount}
                aria-valuetext={s01Content.progress.status(configuredCount)}
              >
                {s01Content.browser.accounts.map((tabAccount) => (
                  <span
                    key={tabAccount.id}
                    data-filled={(snapshot.context.passwordValues[tabAccount.id] ?? '').length > 0}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className={styles.helpText}>{s01Content.progress.helpText}</p>
            </aside>
          </div>
          {configured ? (
            <aside className={styles.guideCard} aria-label={s01Content.completion.guideName}>
              <p className={styles.guideName}>{s01Content.completion.guideName}</p>
              <p>{s01Content.completion.guideMessage}</p>
              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={snapshot.matches({ s01: 'ending' }) || interactionBlocked}
                  onClick={() => controller.continue()}
                >
                  {s01Content.controls.continue}
                </button>
              </div>
            </aside>
          ) : null}
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

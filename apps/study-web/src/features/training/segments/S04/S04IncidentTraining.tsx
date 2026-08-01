import { s01Content, s04Content } from '@passwo/training-content';
import {
  deriveCampusIdentity,
  type PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import { BrowserShell, type BrowserShellSnapshot, type DesktopPlatform } from '@passwo/ui';
import { useEffect, useRef } from 'react';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { CampusWebsiteBackdrop } from '../../CampusWebsiteBackdrop.js';
import styles from './S04IncidentTraining.module.css';

export interface S04IncidentTrainingProps {
  readonly controller: PasswordModuleController;
  readonly snapshot: PasswordModuleSnapshot;
  readonly platform?: DesktopPlatform;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
}

function IncidentIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.5 21 20H3L12 3.5Z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function S04IncidentTraining({
  controller,
  snapshot,
  platform = 'mac',
  externalTimingError = null,
  onRetryExternalTiming,
}: S04IncidentTrainingProps) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const writingStart = snapshot.matches({ s04: 'writingStart' });
  const startWriteFailed = snapshot.matches({ s04: 'startWriteFailed' });
  const active = snapshot.matches({ s04: 'active' });
  const writingEnd = snapshot.matches({ s04: 'writingEnd' });
  const endWriteFailed = snapshot.matches({ s04: 'endWriteFailed' });
  const startHandoff = writingStart || startWriteFailed;
  const timingFailure = externalTimingError !== null || startWriteFailed || endWriteFailed;
  const campusIdentity = deriveCampusIdentity(snapshot.context.displayName ?? '');
  const browserSnapshot: BrowserShellSnapshot = {
    tabs: s01Content.browser.accounts.map((account) => ({
      id: account.id,
      label: account.id === 'campusgram' ? `${account.label} · Warnung` : account.label,
      icon: <NetworkSymbol symbolId={account.symbolId} />,
      enabled: false,
      disabledReason: 'Die Sicherheitswarnung wird innerhalb von Campusgram erklärt.',
      ...(account.id === 'campusgram' ? { status: 'danger' as const } : {}),
    })),
    activeTabId: 'campusgram',
    address: s04Content.browser.address,
    accountIdentifier: campusIdentity.campusgram,
    scrollKey: 's04:campusgram:incident',
    highlightedTabId: 'campusgram',
    locked: writingStart || writingEnd,
  };

  useEffect(() => {
    if (active) titleRef.current?.focus();
  }, [active]);

  function retryTiming(): void {
    if (externalTimingError !== null) {
      onRetryExternalTiming?.();
      return;
    }
    controller.retryTiming();
  }

  return (
    <section className={styles.training} aria-label={s04Content.trainingAriaLabel}>
      <BrowserShell
        platform={platform}
        variant="artifact"
        snapshot={browserSnapshot}
        ariaLabel={s04Content.browser.ariaLabel}
        layers={{
          controls: (
            <>
              {(writingStart || writingEnd) && externalTimingError === null ? (
                <p className={styles.timingStatus} role="status">
                  {s04Content.controls.timingSaving}
                </p>
              ) : null}
              {timingFailure ? (
                <section className={styles.timingError} role="alert">
                  <p>{s04Content.controls.timingFailure}</p>
                  <p>Fehlercode: {externalTimingError ?? snapshot.context.timingErrorCode}</p>
                  <button type="button" onClick={retryTiming}>
                    {s04Content.controls.retry}
                  </button>
                </section>
              ) : null}
            </>
          ),
        }}
      >
        {startHandoff ? (
          <CampusWebsiteBackdrop
            accountId="campusgram"
            interactionLabel={s04Content.browser.tabWarningLabel}
            view="context"
            displayName={snapshot.context.displayName ?? ''}
          >
            <div className={styles.handoffSurface} aria-hidden="true" />
          </CampusWebsiteBackdrop>
        ) : (
          <CampusWebsiteBackdrop
            accountId="campusgram"
            interactionLabel={s04Content.browser.tabWarningLabel}
            view="context"
            displayName={snapshot.context.displayName ?? ''}
          >
            <article className={styles.notice} aria-labelledby="s04-incident-title">
              <span className={styles.incidentIcon} role="img" aria-label="Datenleck-Warnung">
                <IncidentIcon />
              </span>
              <p className={styles.eyebrow}>{s04Content.notice.eyebrow}</p>
              <h1 ref={titleRef} id="s04-incident-title" tabIndex={-1}>
                {s04Content.notice.title}
              </h1>
              <div className={styles.explanation}>
                {s04Content.notice.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className={styles.nextStep}>{s04Content.notice.nextStep}</p>
              <button
                type="button"
                className={styles.continueButton}
                disabled={!active || externalTimingError !== null}
                onClick={() => controller.completeS04()}
              >
                {s04Content.notice.continueLabel}
              </button>
            </article>
          </CampusWebsiteBackdrop>
        )}
      </BrowserShell>
    </section>
  );
}

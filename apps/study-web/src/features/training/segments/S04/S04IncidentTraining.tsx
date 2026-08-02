import { s00Content, s01Content, s04Content } from '@passwo/training-content';
import {
  deriveCampusIdentity,
  type PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import { BrowserShell, type BrowserShellSnapshot, type DesktopPlatform } from '@passwo/ui';
import { useState } from 'react';
import attackerAsset from '../../../../assets/passwo/attacker.png';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { CampusWebsiteBackdrop } from '../../CampusWebsiteBackdrop.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
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
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4.5c5.7 4.2 11.6 6.3 17.5 6.8v11.2c0 10.3-6.4 17.6-17.5 21-11.1-3.4-17.5-10.7-17.5-21V11.3C12.4 10.8 18.3 8.7 24 4.5Z"
        fill="currentColor"
        opacity=".14"
      />
      <path
        d="M24 4.5c5.7 4.2 11.6 6.3 17.5 6.8v11.2c0 10.3-6.4 17.6-17.5 21-11.1-3.4-17.5-10.7-17.5-21V11.3C12.4 10.8 18.3 8.7 24 4.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M24 14v13" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="24" cy="34" r="2.2" fill="currentColor" />
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
  const [leavingForAnalysis, setLeavingForAnalysis] = useState(false);
  const writingStart = snapshot.matches({ s04: 'writingStart' });
  const startWriteFailed = snapshot.matches({ s04: 'startWriteFailed' });
  const active = snapshot.matches({ s04: 'active' });
  const writingEnd = snapshot.matches({ s04: 'writingEnd' });
  const endWriteFailed = snapshot.matches({ s04: 'endWriteFailed' });
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
    dimmed: true,
    dimStrength: 'soft',
    locked: writingStart || writingEnd,
  };

  function retryTiming(): void {
    if (externalTimingError !== null) {
      onRetryExternalTiming?.();
      return;
    }
    controller.retryTiming();
  }

  function beginAnalysis(): void {
    if (!active || externalTimingError !== null || leavingForAnalysis) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      controller.completeS04();
      return;
    }
    setLeavingForAnalysis(true);
  }

  return (
    <section className={styles.training} aria-label={s04Content.trainingAriaLabel}>
      <BrowserShell
        platform={platform}
        variant="artifact"
        snapshot={browserSnapshot}
        ariaLabel={s04Content.browser.ariaLabel}
        layers={{
          screen: leavingForAnalysis ? (
            <span
              className={styles.analysisTransition}
              aria-hidden="true"
              onAnimationEnd={() => controller.completeS04()}
            />
          ) : undefined,
          passWo: (
            <section
              className={styles.incidentOverlay}
              role="alert"
              aria-label={`${s04Content.notice.title}. ${s04Content.notice.paragraphs[0]}`}
            >
              <div className={styles.incidentStage}>
                <img
                  className={styles.attacker}
                  src={attackerAsset}
                  alt="Symbolische Darstellung eines Angreifers am Computer"
                />
                <PassWoGuide
                  guideName={s00Content.narration.guideName}
                  taskLabel="Sicherheitswarnung"
                  helpOpen
                  helpId="s04-passwo-speech"
                  openHelpLabel={s00Content.narration.openGuideLabel}
                  speech={s04Content.notice.paragraphs}
                  speechKey="s04-incident-explanation"
                  speechEmphasis={passWoSpeechEmphasisFor('s04.incident')}
                  speechPlacement="above"
                  speechAction={{
                    kind: 'perform',
                    label: s04Content.notice.continueLabel,
                    disabled: !active || externalTimingError !== null || leavingForAnalysis,
                    onAction: beginAnalysis,
                  }}
                  placement="incident"
                  pose="warning"
                  showHelpButton={false}
                />
              </div>
            </section>
          ),
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
        <CampusWebsiteBackdrop
          accountId="campusgram"
          interactionLabel={s04Content.browser.tabWarningLabel}
          view="dashboard"
          displayName={snapshot.context.displayName ?? ''}
          dashboardNotice={
            <section className={styles.serviceNotice} role="alert">
              <span className={styles.incidentIcon} aria-hidden="true">
                <IncidentIcon />
              </span>
              <div>
                <h2>{s04Content.notice.title}</h2>
                <p>{s04Content.notice.paragraphs[0]}</p>
              </div>
            </section>
          }
        />
      </BrowserShell>
    </section>
  );
}

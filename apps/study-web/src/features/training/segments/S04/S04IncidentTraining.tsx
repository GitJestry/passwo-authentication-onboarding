import { s00Content, s01Content, s04Content } from '@passwo/training-content';
import {
  deriveCampusIdentity,
  type PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import { BrowserShell, type BrowserShellSnapshot, type DesktopPlatform } from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import attackerAsset from '../../../../assets/passwo/attacker.png';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { CampusWebsiteBackdrop } from '../../CampusWebsiteBackdrop.js';
import { CampusgramIncidentNotice } from '../../CampusgramIncidentNotice.js';
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

export function S04IncidentTraining({
  controller,
  snapshot,
  platform = 'mac',
  externalTimingError = null,
  onRetryExternalTiming,
}: S04IncidentTrainingProps) {
  const [leavingForAnalysis, setLeavingForAnalysis] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const analysisTransitionRef = useRef<HTMLSpanElement>(null);
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
      label:
        account.id === 'campusgram'
          ? `${account.label} · ${
              passwordChangeOpen ? s04Content.notice.passwordChange.tabLabel : 'Warnung'
            }`
          : account.label,
      icon: <NetworkSymbol symbolId={account.symbolId} />,
      enabled: false,
      disabledReason: 'Die Sicherheitswarnung wird innerhalb von Campusgram erklärt.',
      ...(account.id === 'campusgram' ? { status: 'danger' as const } : {}),
    })),
    activeTabId: 'campusgram',
    address: passwordChangeOpen
      ? s04Content.notice.passwordChange.address
      : s04Content.browser.address,
    accountIdentifier: campusIdentity.campusgram,
    scrollKey: passwordChangeOpen
      ? 's04:campusgram:password-change'
      : 's04:campusgram:incident',
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

  useEffect(() => {
    const transition = analysisTransitionRef.current;
    if (!leavingForAnalysis || transition === null) return;

    const completeAnalysisTransition = () => controller.completeS04();
    transition.addEventListener('animationend', completeAnalysisTransition, { once: true });
    transition.addEventListener('animationcancel', completeAnalysisTransition, { once: true });

    return () => {
      transition.removeEventListener('animationend', completeAnalysisTransition);
      transition.removeEventListener('animationcancel', completeAnalysisTransition);
    };
  }, [controller, leavingForAnalysis]);

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
              ref={analysisTransitionRef}
            />
          ) : undefined,
          passWo: passwordChangeOpen ? undefined : (
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
                  placement="bottom-left"
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
            <CampusgramIncidentNotice
              currentPassword={snapshot.context.passwordValues.campusgram ?? ''}
              passwordChangeOpen={passwordChangeOpen}
              onPasswordChangeOpenChange={setPasswordChangeOpen}
            />
          }
        />
      </BrowserShell>
    </section>
  );
}

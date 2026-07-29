import { formatS00Greeting, s00Content } from '@passwo/training-content';
import {
  deriveCampusIdentity,
  MissionController,
  type MissionDefinition,
  type MissionSnapshot,
  type SegmentTimingPort,
} from '@passwo/training-engine';
import { BrowserShell, type BrowserShellSnapshot } from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import { MotionAnimationAdapter } from '../../adapters/animation/MotionAnimationAdapter.js';
import {
  createInitialS00SceneSnapshot,
  type S00SceneSnapshot,
} from '../../adapters/animation/s00-scene.js';
import { NetworkSymbol } from '../../adapters/network/NetworkSymbolRegistry.js';
import { CampusWebsiteBackdrop } from './CampusWebsiteBackdrop.js';
import { PassWoGuide } from './PassWoGuide.js';
import styles from './S00Training.module.css';

const mission: MissionDefinition = {
  id: s00Content.mission.id,
  segmentId: s00Content.segment.id,
  sectionId: s00Content.segment.sectionId,
  requiresSafetyAcknowledgement: s00Content.mission.requiresSafetyAcknowledgement,
  steps: s00Content.mission.steps.map((step) => ({
    id: step.id,
    narrationId: step.narrationId,
    animation: step.animation,
  })),
};

const browserSnapshot: BrowserShellSnapshot = {
  tabs: s00Content.browser.tabs.map((tab) => ({
    ...tab,
    icon: <NetworkSymbol symbolId={tab.id} />,
  })),
  activeTabId: s00Content.browser.tabs[0]?.id ?? 'campus-id',
  address: s00Content.browser.address,
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function S00Page({
  displayName,
}: {
  readonly displayName: string;
}) {
  const campusIdentity = deriveCampusIdentity(displayName);
  return (
    <CampusWebsiteBackdrop accountId="campus-id" interactionLabel="Master Campus einrichten">
      <section className={styles.setupPreview} aria-labelledby="s00-page-title">
        <h1 id="s00-page-title">Master Campus</h1>
        <dl className={styles.previewAccountData}>
          <div>
            <dt>Benutzername</dt>
            <dd>{campusIdentity.campusId}</dd>
          </div>
        </dl>
        <label className={styles.previewPasswordLabel} htmlFor="s00-preview-password">
          Passwort
        </label>
        <span className={styles.previewPasswordGroup}>
          <input id="s00-preview-password" type="password" disabled value="" readOnly />
          <span className={styles.previewEye} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </span>
        </span>
        <button type="button" disabled>
          Konto einrichten
        </button>
      </section>
    </CampusWebsiteBackdrop>
  );
}

export interface S00TrainingProps {
  readonly displayName: string;
  readonly onComplete: () => void;
  readonly timingPort?: SegmentTimingPort;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
  readonly forceAnimationFailure?: boolean;
}

export function S00Training({
  displayName,
  onComplete,
  timingPort,
  externalTimingError = null,
  onRetryExternalTiming,
  forceAnimationFailure = false,
}: S00TrainingProps) {
  const [scene, setScene] = useState<S00SceneSnapshot>(createInitialS00SceneSnapshot);
  const [missionSnapshot, setMissionSnapshot] = useState<MissionSnapshot | null>(null);
  const [timingError, setTimingError] = useState<string | null>(null);
  const [speechRound, setSpeechRound] = useState(0);
  const [finalSpeechCompleted, setFinalSpeechCompleted] = useState(false);
  const controllerRef = useRef<MissionController | null>(null);
  const characterAnimationAnchorRef = useRef<HTMLSpanElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const animationPlayer = new MotionAnimationAdapter({
      applySnapshot: setScene,
      getCharacterElement: () => characterAnimationAnchorRef.current,
      getRevealTargetElement: () => null,
      prefersReducedMotion,
      forceFailure: forceAnimationFailure,
    });
    const controller = new MissionController({
      animationPlayer,
      ...(timingPort === undefined ? {} : { timingPort }),
      onComplete: () => onCompleteRef.current(),
    });
    const unsubscribe = controller.subscribe(setMissionSnapshot);
    controllerRef.current = controller;
    setMissionSnapshot(controller.getSnapshot());
    let disposed = false;
    void controller.start(mission).catch((error: unknown) => {
      if (!disposed)
        setTimingError(error instanceof Error ? error.message : 'research-data-write-failed');
    });

    return () => {
      disposed = true;
      unsubscribe();
      controllerRef.current = null;
      void controller.dispose();
    };
  }, [forceAnimationFailure, timingPort]);

  const awaitingDecision = missionSnapshot?.matches({ active: 'awaitingDecision' }) ?? false;
  const canContinue = awaitingDecision;
  const guideOpen = scene.announcedMessageId === 's00.greeting';
  const animationError = missionSnapshot?.context.lastAnimationError ?? null;
  const activeTimingError = timingError ?? externalTimingError;
  const speechSteps = [
    { accountId: 'campus-id', text: formatS00Greeting(displayName) },
    ...s00Content.narration.accountExplanations.map(({ accountId, text }) => ({ accountId, text })),
    { accountId: null, text: s00Content.narration.safetyWarning },
  ] as const;
  const currentSpeechStep = speechSteps[speechRound] ?? speechSteps[0];
  const isFinalSpeechStep = speechRound === speechSteps.length - 1;
  const activeBrowserSnapshot: BrowserShellSnapshot = {
    ...browserSnapshot,
    dimmed: guideOpen,
    dimStrength: 'soft',
    ...(currentSpeechStep?.accountId === null || currentSpeechStep === undefined
      ? {}
      : { highlightedTabId: currentSpeechStep.accountId }),
  };

  function retryTiming(): void {
    if (timingError === null) {
      onRetryExternalTiming?.();
      return;
    }
    const controller = controllerRef.current;
    if (controller === null) return;
    void controller.retryTiming().then(
      () => setTimingError(null),
      (error: unknown) =>
        setTimingError(error instanceof Error ? error.message : 'research-data-write-failed'),
    );
  }

  function continueMission(): void {
    const controller = controllerRef.current;
    if (controller === null) return;
    void controller
      .continue()
      .catch((error: unknown) =>
        setTimingError(error instanceof Error ? error.message : 'research-data-write-failed'),
      );
  }

  return (
    <section className={styles.training} aria-label={s00Content.trainingAriaLabel}>
      <BrowserShell
        snapshot={activeBrowserSnapshot}
        ariaLabel={s00Content.browser.ariaLabel}
        layers={{
          passWo: (
            <>
              <span
                ref={characterAnimationAnchorRef}
                className={styles.characterAnimationAnchor}
                aria-hidden="true"
              />
              <PassWoGuide
                guideName={s00Content.narration.guideName}
                taskLabel="Einrichten"
                helpOpen={guideOpen}
                helpId="s00-passwo-speech"
                openHelpLabel={s00Content.narration.openGuideLabel}
                speech={currentSpeechStep === undefined ? [] : [currentSpeechStep.text]}
                speechKey={`s00-greeting-${displayName}-${speechRound}`}
                speechPlacement="right"
                hasNextSpeech={!isFinalSpeechStep}
                awaitsAction={isFinalSpeechStep}
                guidedAccountId={currentSpeechStep?.accountId}
                showHelpButton={false}
                speechFooter={
                  finalSpeechCompleted && activeTimingError === null ? (
                    <>
                      {animationError !== null ? (
                        <p className={styles.animationError} role="status">
                          {s00Content.controls.animationError}
                        </p>
                      ) : null}
                      <div className={styles.buttonRow}>
                        <button
                          type="button"
                          className={styles.primaryButton}
                          disabled={!canContinue}
                          onClick={continueMission}
                        >
                          {s00Content.controls.continue}
                        </button>
                      </div>
                    </>
                  ) : finalSpeechCompleted ? (
                    <>
                      <p className={styles.animationError} role="alert">
                        Das Speichern des Zeitereignisses ist fehlgeschlagen. Der nächste Schritt
                        bleibt gesperrt.
                      </p>
                      <p className={styles.continueReason}>Fehlercode: {activeTimingError}</p>
                      <div className={styles.buttonRow}>
                        <button type="button" className={styles.primaryButton} onClick={retryTiming}>
                          Erneut versuchen
                        </button>
                      </div>
                    </>
                  ) : undefined
                }
                onSpeechAdvance={() => {
                  if (!isFinalSpeechStep) setSpeechRound((current) => current + 1);
                }}
                onSpeechComplete={() => {
                  if (isFinalSpeechStep) setFinalSpeechCompleted(true);
                }}
              />
            </>
          ),
        }}
      >
        <div className={styles.pageTarget}>
          <S00Page displayName={displayName} />
        </div>
      </BrowserShell>
    </section>
  );
}

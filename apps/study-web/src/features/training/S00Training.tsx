import { formatS00Greeting, s00Content } from '@passwo/training-content';
import {
  canContinueMission,
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
  tabs: s00Content.browser.tabs,
  activeTabId: s00Content.browser.tabs[0]?.id ?? 'campus-id',
  address: s00Content.browser.address,
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function S00Page() {
  return (
    <article className={styles.pageScene} aria-labelledby="s00-page-title">
      <header className={styles.pageHeader}>
        <div className={styles.siteIdentity}>
          <NetworkSymbol symbolId="campus-id" className={styles.siteSymbol} />
          <span className={styles.identityName}>{s00Content.browser.page.identityName}</span>
        </div>
        <nav className={styles.siteNavigation} aria-label="CampusID-Navigation">
          {s00Content.browser.page.navigation.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </nav>
      </header>
      <div className={styles.pageBody}>
        <section className={styles.pageCopy}>
          <h1 id="s00-page-title">{s00Content.browser.page.title}</h1>
          <p>{s00Content.browser.page.description}</p>
        </section>
        <section className={styles.moduleGrid} aria-label="CampusID-Übersicht">
          {s00Content.browser.page.modules.map((module) => (
            <article key={module.title} className={styles.siteModule}>
              <div className={styles.moduleHeading}>
                <NetworkSymbol symbolId="service" className={styles.moduleSymbol} />
                <h2>{module.title}</h2>
              </div>
              <p>{module.description}</p>
              <div className={styles.skeletonLines} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </article>
          ))}
        </section>
      </div>
    </article>
  );
}

function PassWoSpeech({ displayName }: { readonly displayName: string }) {
  return (
    <>
      <p>{formatS00Greeting(displayName)}</p>
      <p>{s00Content.narration.instruction}</p>
    </>
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
  const safetyAcknowledged = missionSnapshot?.context.safetyAcknowledged ?? false;
  const canContinue =
    missionSnapshot === null
      ? false
      : canContinueMission(missionSnapshot.context) && awaitingDecision;
  const guideOpen = scene.announcedMessageId === 's00.greeting';
  const animationError = missionSnapshot?.context.lastAnimationError ?? null;
  const activeTimingError = timingError ?? externalTimingError;

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
        snapshot={browserSnapshot}
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
                helpOpen={guideOpen}
                helpId="s00-passwo-speech"
                openHelpLabel={s00Content.narration.openGuideLabel}
                closeHelpLabel={s00Content.narration.closeGuideLabel}
                onToggleHelp={() =>
                  setScene((currentScene) => ({
                    ...currentScene,
                    announcedMessageId:
                      currentScene.announcedMessageId === 's00.greeting' ? null : 's00.greeting',
                  }))
                }
              >
                <PassWoSpeech displayName={displayName} />
                {activeTimingError === null ? (
                  <>
                    {animationError !== null ? (
                      <p className={styles.animationError} role="status">
                        {s00Content.controls.animationError}
                      </p>
                    ) : null}
                    <label className={styles.acknowledgement}>
                      <input
                        type="checkbox"
                        checked={safetyAcknowledged}
                        disabled={!awaitingDecision}
                        onChange={(event) =>
                          controllerRef.current?.setSafetyAcknowledged(event.currentTarget.checked)
                        }
                      />
                      <span>{s00Content.acknowledgement.label}</span>
                    </label>
                    <div className={styles.buttonRow}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={!awaitingDecision}
                        onClick={() => controllerRef.current?.replay()}
                      >
                        {s00Content.controls.replay}
                      </button>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        disabled={!canContinue}
                        aria-describedby={canContinue ? undefined : 's00-continue-reason'}
                        onClick={continueMission}
                      >
                        {s00Content.controls.continue}
                      </button>
                    </div>
                    {!canContinue ? (
                      <p id="s00-continue-reason" className={styles.screenReaderOnly}>
                        {s00Content.controls.continueReason}
                      </p>
                    ) : null}
                  </>
                ) : (
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
                )}
              </PassWoGuide>
            </>
          ),
        }}
      >
        <div className={styles.pageTarget}>
          <S00Page />
        </div>
      </BrowserShell>
    </section>
  );
}

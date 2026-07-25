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
  hasRevealedTarget,
  type S00SceneSnapshot,
} from '../../adapters/animation/s00-scene.js';
import {
  characterObscuresStage,
  PassWoCharacterRenderer,
  PassWoGuideCharacter,
  toCharacterRendererState,
} from '../../adapters/character/PassWoCharacterAdapter.js';
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

function S00Page({ safetyVisible }: { readonly safetyVisible: boolean }) {
  return (
    <article className={styles.pageScene} aria-labelledby="s00-page-title">
      <header className={styles.pageHeader}>
        <span className={styles.identityMark} aria-hidden="true">
          cr
        </span>
        <span className={styles.identityName}>{s00Content.browser.page.identityName}</span>
        <span className={styles.fictionalBadge}>{s00Content.browser.page.fictionalBadge}</span>
      </header>
      <div className={styles.pageBody}>
        <section className={styles.pageCopy}>
          <p className={styles.eyebrow}>{s00Content.browser.page.eyebrow}</p>
          <h1 id="s00-page-title">{s00Content.browser.page.title}</h1>
          <p>{s00Content.browser.page.description}</p>
        </section>
        <section
          className={styles.safetyCard}
          data-animation-target={s00Content.safety.targetId}
          data-visible={safetyVisible}
          aria-hidden={!safetyVisible}
          aria-labelledby="s00-safety-title"
        >
          <p className={styles.safetyEyebrow}>{s00Content.safety.label}</p>
          <h2 id="s00-safety-title">{s00Content.safety.title}</h2>
          <p>{s00Content.safety.body}</p>
        </section>
      </div>
    </article>
  );
}

function PassWoSpeech({ displayName }: { readonly displayName: string }) {
  return (
    <section
      id="s00-passwo-speech"
      className={styles.speechCard}
      aria-labelledby="s00-passwo-speech-title"
    >
      <p className={styles.speechLabel}>{s00Content.narration.guideName}</p>
      <h2 id="s00-passwo-speech-title">{s00Content.narration.title}</h2>
      <p>{formatS00Greeting(displayName)}</p>
      <p>{s00Content.narration.followUp}</p>
      <p>{s00Content.narration.dockedHelp}</p>
    </section>
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
  const [characterRenderer] = useState(
    () =>
      new PassWoCharacterRenderer(
        toCharacterRendererState(createInitialS00SceneSnapshot().character),
      ),
  );
  const controllerRef = useRef<MissionController | null>(null);
  const characterRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const animationPlayer = new MotionAnimationAdapter({
      applySnapshot: setScene,
      getCharacterElement: () => characterRef.current,
      getRevealTargetElement: (targetId) =>
        pageRef.current?.querySelector<HTMLElement>(`[data-animation-target="${targetId}"]`) ??
        null,
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

  const characterState = toCharacterRendererState(scene.character);
  useEffect(() => {
    characterRenderer.render(characterState);
  }, [characterRenderer, characterState]);

  const awaitingDecision = missionSnapshot?.matches({ active: 'awaitingDecision' }) ?? false;
  const safetyAcknowledged = missionSnapshot?.context.safetyAcknowledged ?? false;
  const canContinue =
    missionSnapshot === null
      ? false
      : canContinueMission(missionSnapshot.context) && awaitingDecision;
  const safetyVisible = hasRevealedTarget(scene, s00Content.safety.targetId);
  const guideOpen = scene.announcedMessageId === 's00.greeting';
  const animationError = missionSnapshot?.context.lastAnimationError ?? null;
  const snapshot: BrowserShellSnapshot = {
    ...browserSnapshot,
    dimmed: characterObscuresStage(characterState),
  };
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
        snapshot={snapshot}
        ariaLabel={s00Content.browser.ariaLabel}
        layers={{
          passWo: (
            <PassWoGuideCharacter
              renderer={characterRenderer}
              guideOpen={guideOpen}
              characterRef={characterRef}
              controlsId="s00-passwo-speech"
              guideName={s00Content.narration.guideName}
              openLabel={s00Content.narration.openGuideLabel}
              closeLabel={s00Content.narration.closeGuideLabel}
              onToggle={() =>
                setScene((currentScene) => ({
                  ...currentScene,
                  announcedMessageId:
                    currentScene.announcedMessageId === 's00.greeting' ? null : 's00.greeting',
                }))
              }
            />
          ),
          ...(guideOpen ? { speech: <PassWoSpeech displayName={displayName} /> } : {}),
          controls: (
            <div className={styles.controls}>
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
                      disabled={!awaitingDecision || !safetyVisible}
                      onChange={(event) =>
                        controllerRef.current?.setSafetyAcknowledged(event.currentTarget.checked)
                      }
                    />
                    <span>{s00Content.safety.acknowledgement}</span>
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
                    <p id="s00-continue-reason" className={styles.continueReason}>
                      {s00Content.controls.continueReason}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className={styles.animationError} role="alert">
                    Das Speichern des Zeitereignisses ist fehlgeschlagen. Der nächste Schritt bleibt
                    gesperrt.
                  </p>
                  <p className={styles.continueReason}>Fehlercode: {activeTimingError}</p>
                  <div className={styles.buttonRow}>
                    <button type="button" className={styles.primaryButton} onClick={retryTiming}>
                      Erneut versuchen
                    </button>
                  </div>
                </>
              )}
            </div>
          ),
        }}
      >
        <div ref={pageRef} className={styles.pageTarget}>
          <S00Page safetyVisible={safetyVisible} />
        </div>
      </BrowserShell>
    </section>
  );
}

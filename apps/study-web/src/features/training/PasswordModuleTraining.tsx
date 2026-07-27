import { s01Content } from '@passwo/training-content';
import {
  PasswordModuleController,
  type PasswordModuleSnapshot,
  type SegmentTimingPort,
} from '@passwo/training-engine';
import { useEffect, useRef, useState } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.png';
import styles from './PasswordModuleTraining.module.css';
import { S00Training } from './S00Training.js';
import { S01Training } from './S01Training.js';
import {
  S02AccountExplorationTraining,
  type S02TimingState,
} from './segments/S02/S02AccountExplorationTraining.js';
import { S03RetrievalTraining } from './segments/S03/S03RetrievalTraining.js';

export interface PasswordModuleTrainingProps {
  readonly onComplete: () => void;
  readonly timingPort?: SegmentTimingPort;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
}

export function PasswordModuleTraining({
  timingPort,
  externalTimingError = null,
  onRetryExternalTiming,
}: PasswordModuleTrainingProps) {
  const [snapshot, setSnapshot] = useState<PasswordModuleSnapshot | null>(null);
  const controllerRef = useRef<PasswordModuleController | null>(null);

  useEffect(() => {
    const controller = new PasswordModuleController({
      accountIds: s01Content.browser.accounts.map(({ id }) => id),
      ...(timingPort === undefined ? {} : { timingPort }),
    });
    const unsubscribe = controller.subscribe(setSnapshot);
    controllerRef.current = controller;
    setSnapshot(controller.getSnapshot());

    return () => {
      unsubscribe();
      controller.dispose();
      controllerRef.current = null;
    };
  }, [timingPort]);

  if (snapshot === null) {
    return <div className={styles.loading}>Training wird vorbereitet …</div>;
  }

  const controller = controllerRef.current;
  if (controller === null) return null;

  if (snapshot.matches('entry')) {
    return (
      <section className={styles.entry} aria-labelledby="training-entry-title">
        <header className={styles.entryHeader}>
          <h1 id="training-entry-title">Passwörter &amp; Authentifizierung</h1>
        </header>
        <div className={styles.entryScene}>
          <div className={styles.entryCharacter}>
            <img src={passWoDockAsset} alt="PassWo, Begleiter im Training" />
          </div>
          <div className={styles.entrySpeech}>
            <p className={styles.entryGuide}>PassWo</p>
            <p>Hallo! Ich bin PassWo und begleite dich durch dieses Training.</p>
            <p>Du richtest drei fiktive Campus-Konten ein und wählst dafür Passwörter.</p>
            <p>
              Wähle Passwörter, die stark und merkbar sind: Später meldest du dich damit noch einmal
              an.
            </p>
            <p className={styles.entryQuestion}>Wie darf ich dich nennen?</p>
          </div>
        </div>
        <form
          className={styles.entryForm}
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get('training-display-name');
            if (typeof value === 'string') controller.enterDisplayName(value);
          }}
        >
          <label className={styles.entryLabel}>
            Dein Name
            <input
              name="training-display-name"
              type="text"
              autoComplete="off"
              maxLength={40}
              required
            />
          </label>
          <button type="submit">Training starten</button>
        </form>
      </section>
    );
  }

  if (snapshot.matches('s00')) {
    return (
      <S00Training
        displayName={snapshot.context.displayName ?? ''}
        onComplete={() => controllerRef.current?.completeS00()}
        {...(timingPort === undefined ? {} : { timingPort })}
        externalTimingError={externalTimingError}
        {...(onRetryExternalTiming === undefined ? {} : { onRetryExternalTiming })}
      />
    );
  }

  if (snapshot.matches('discarded')) return null;

  if (snapshot.matches('s01')) {
    return (
      <S01Training
        controller={controller}
        snapshot={snapshot}
        externalTimingError={externalTimingError}
        {...(onRetryExternalTiming === undefined ? {} : { onRetryExternalTiming })}
      />
    );
  }

  if (snapshot.matches('s02')) {
    const timingState: S02TimingState = snapshot.matches({ s02: 'starting' })
      ? 'starting'
      : snapshot.matches({ s02: 'startFailed' })
        ? 'startFailed'
        : snapshot.matches({ s02: 'ending' })
          ? 'ending'
          : snapshot.matches({ s02: 'endFailed' })
            ? 'endFailed'
            : 'active';
    return (
      <S02AccountExplorationTraining
        timingState={timingState}
        timingErrorCode={snapshot.context.timingErrorCode}
        externalTimingError={externalTimingError}
        onAllAccountsUnderstood={() => controller.completeS02Content()}
        onContinue={() => controller.continue()}
        onRetryTiming={() => {
          if (externalTimingError !== null) {
            onRetryExternalTiming?.();
          } else {
            controller.retryTiming();
          }
        }}
      />
    );
  }

  if (snapshot.matches('s03') || snapshot.matches('awaitingS04')) {
    return (
      <S03RetrievalTraining
        controller={controller}
        snapshot={snapshot}
        externalTimingError={externalTimingError}
        {...(onRetryExternalTiming === undefined ? {} : { onRetryExternalTiming })}
      />
    );
  }

  return null;
}

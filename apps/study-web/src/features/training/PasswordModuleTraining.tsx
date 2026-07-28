import { s00Content, s01Content } from '@passwo/training-content';
import {
  PasswordModuleController,
  type PasswordModuleSnapshot,
  type SegmentTimingPort,
} from '@passwo/training-engine';
import { useEffect, useRef, useState } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.png';
import { PassWoSpeechBubble } from './PassWoSpeechBubble.js';
import styles from './PasswordModuleTraining.module.css';
import { SectionTransition } from './SectionTransition.js';
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
  const [entrySpeechComplete, setEntrySpeechComplete] = useState(false);
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

  if (snapshot.matches('sectionTransition')) {
    return (
      <SectionTransition
        sectionLabel={s00Content.sectionTransition.label}
        title={s00Content.sectionTransition.title}
        holdDurationMs={s00Content.sectionTransition.holdDurationMs}
        onComplete={() => controller.completeSectionTransition()}
      />
    );
  }

  if (snapshot.matches('entry')) {
    return (
      <section className={styles.entry} aria-labelledby="training-entry-title">
        <header className={styles.entryHeader}>
          <h1 id="training-entry-title">{s00Content.entry.title}</h1>
        </header>
        <div className={styles.entryScene}>
          <div className={styles.entryCharacter}>
            <img src={passWoDockAsset} alt="PassWo, Begleiter im Training" />
          </div>
          <PassWoSpeechBubble
            className={styles.entrySpeech}
            speaker={s00Content.narration.guideName}
            paragraphs={s00Content.entry.paragraphs}
            speechKey="module-entry"
            placement="right"
            onComplete={() => setEntrySpeechComplete(true)}
          />
        </div>
        {entrySpeechComplete ? (
          <form
            className={styles.entryForm}
            onSubmit={(event) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get('training-display-name');
              if (typeof value === 'string') controller.enterDisplayName(value);
            }}
          >
            <label className={styles.entryLabel}>
              {s00Content.entry.nameLabel}
              <input
                name="training-display-name"
                type="text"
                autoComplete="off"
                maxLength={40}
                required
                autoFocus
              />
            </label>
            <button type="submit">{s00Content.entry.startLabel}</button>
          </form>
        ) : null}
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

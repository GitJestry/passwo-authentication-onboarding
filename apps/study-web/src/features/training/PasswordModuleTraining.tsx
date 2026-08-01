import { s00Content, s01Content } from '@passwo/training-content';
import {
  PasswordModuleController,
  type PasswordModuleSnapshot,
  type SegmentTimingPort,
} from '@passwo/training-engine';
import type { DesktopPlatform } from '@passwo/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.png';
import { PassWoSpeechBubble } from './PassWoSpeechBubble.js';
import { passWoSpeechEmphasisFor } from './PassWoSpeechEmphasis.js';
import styles from './PasswordModuleTraining.module.css';
import { SectionTransition } from './SectionTransition.js';
import { S00Training } from './S00Training.js';
import { S01Training } from './S01Training.js';
import {
  S02AccountExplorationTraining,
  type S02TimingState,
} from './segments/S02/S02AccountExplorationTraining.js';
import { S03RetrievalTraining } from './segments/S03/S03RetrievalTraining.js';
import { S04IncidentTraining } from './segments/S04/S04IncidentTraining.js';
import {
  S05AnalysisTraining,
  type S05CompletionPort,
  type S05TimingState,
} from './segments/S05/S05AnalysisTraining.js';

export interface PasswordModuleTrainingProps {
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
  const [platform, setPlatform] = useState<DesktopPlatform>('mac');
  const controllerRef = useRef<PasswordModuleController | null>(null);
  const campusgramPassword = snapshot?.context.passwordValues['campusgram'] ?? '';
  const s05Subject = useMemo(
    () => ({
      id: 'supportive-campusgram',
      label: 'Fiktives Campusgram-Passwort',
      fictionalPassword: campusgramPassword,
      analysisContext: { accountTerms: ['Campusgram'] },
    }),
    [campusgramPassword],
  );
  const s05CompletionPort = useMemo<S05CompletionPort>(
    () => ({
      complete: () => controllerRef.current?.completeS05(),
    }),
    [],
  );

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
        currentSection={1}
        totalSections={3}
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
            emphasis={passWoSpeechEmphasisFor('module-entry')}
            placement="right"
            awaitsAction
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
            <fieldset className={styles.platformFieldset}>
              <legend>Betriebssystem auswählen</legend>
              <div className={styles.platformOptions}>
                {(
                  [
                    { value: 'mac', label: 'Mac' },
                    { value: 'windows', label: 'Windows' },
                    { value: 'linux', label: 'Linux' },
                  ] as const
                ).map((option) => (
                  <label className={styles.platformOption} key={option.value}>
                    <input
                      type="radio"
                      name="training-platform"
                      value={option.value}
                      checked={platform === option.value}
                      onChange={() => setPlatform(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
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
        platform={platform}
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
        platform={platform}
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
        platform={platform}
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

  if (snapshot.matches('s03')) {
    return (
      <S03RetrievalTraining
        controller={controller}
        platform={platform}
        snapshot={snapshot}
        externalTimingError={externalTimingError}
        {...(onRetryExternalTiming === undefined ? {} : { onRetryExternalTiming })}
      />
    );
  }

  if (snapshot.matches('s04')) {
    return (
      <S04IncidentTraining
        controller={controller}
        platform={platform}
        snapshot={snapshot}
        externalTimingError={externalTimingError}
        {...(onRetryExternalTiming === undefined ? {} : { onRetryExternalTiming })}
      />
    );
  }

  if (snapshot.matches('s05')) {
    const startWritePending = snapshot.matches({ s05: 'writingStart' });
    const startWriteFailed = snapshot.matches({ s05: 'startWriteFailed' });
    if (startWritePending || startWriteFailed) {
      return (
        <section className={styles.loading} aria-live="polite">
          <p role={startWriteFailed ? 'alert' : 'status'}>
            {startWriteFailed
              ? 'Die Segmentgrenze konnte nicht bestätigt werden.'
              : 'Segmentgrenze wird bestätigt …'}
          </p>
          {startWriteFailed ? (
            <>
              <p>Fehlercode: {externalTimingError ?? snapshot.context.timingErrorCode}</p>
              <button
                type="button"
                onClick={() => {
                  if (externalTimingError !== null) {
                    onRetryExternalTiming?.();
                  } else {
                    controller.retryTiming();
                  }
                }}
              >
                Erneut versuchen
              </button>
            </>
          ) : null}
        </section>
      );
    }

    const timingState: S05TimingState = snapshot.matches({ s05: 'writingEnd' })
      ? 'writingEnd'
      : snapshot.matches({ s05: 'endWriteFailed' })
        ? 'endWriteFailed'
        : 'active';
    return (
      <S05AnalysisTraining
        subject={s05Subject}
        timingState={timingState}
        timingErrorCode={snapshot.context.timingErrorCode}
        externalTimingError={externalTimingError}
        completionPort={s05CompletionPort}
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

  if (snapshot.matches('awaiting-s06')) {
    // S06 must derive its required local analysis from the ephemeral training passwords and must
    // not depend on retained S05 findings.
    return (
      <section className={styles.loading} aria-labelledby="awaiting-s06-title">
        <h1 id="awaiting-s06-title">
          Als Nächstes vergleichen wir die drei Passwortentscheidungen miteinander.
        </h1>
      </section>
    );
  }

  return null;
}

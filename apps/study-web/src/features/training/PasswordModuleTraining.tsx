import { s00Content, s01Content, s05Content } from '@passwo/training-content';
import {
  deriveCampusIdentity,
  PasswordModuleController,
  type PasswordModuleSnapshot,
  type RetrievalResult,
  type SegmentTimingPort,
} from '@passwo/training-engine';
import type { DesktopPlatform } from '@passwo/ui';
import type { NetworkSceneSnapshot } from '@passwo/visualization';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import passWoWelcomeAsset from '../../assets/passwo/passwo-welcome.png';
import { PassWoSpeechBubble } from './PassWoSpeechBubble.js';
import { passWoSpeechEmphasisFor } from './PassWoSpeechEmphasis.js';
import {
  passWoSpeechPositionStyle,
  usePassWoSpeechPosition,
} from './PassWoSpeechPosition.js';
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
import {
  S06ConsequenceTraining,
  type S06ConsequenceSource,
  type S06TimingState,
} from './segments/S06/S06ConsequenceTraining.js';
import { S07PassphraseSearchTraining } from './segments/S07/S07PassphraseSearchTraining.js';
import { S08NetworkRewindStage } from './segments/S08/S08NetworkRewindStage.js';

export interface PasswordModuleTrainingProps {
  readonly timingPort?: SegmentTimingPort;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
}

function s06RetrievalStatus(
  status: RetrievalResult | undefined,
): 'retrievable' | 'not-remembered' | 'assisted' | null {
  return status === undefined || status === 'pending' ? null : status;
}

export function PasswordModuleTraining({
  timingPort,
  externalTimingError = null,
  onRetryExternalTiming,
}: PasswordModuleTrainingProps) {
  const [snapshot, setSnapshot] = useState<PasswordModuleSnapshot | null>(null);
  const [platform, setPlatform] = useState<DesktopPlatform>('mac');
  const [s06SummaryNetwork, setS06SummaryNetwork] = useState<NetworkSceneSnapshot | null>(null);
  const controllerRef = useRef<PasswordModuleController | null>(null);
  const entrySceneRef = useRef<HTMLDivElement | null>(null);
  const entryCharacterRef = useRef<HTMLImageElement | null>(null);
  const entrySpeechRef = useRef<HTMLDivElement | null>(null);
  const entrySpeechPosition = usePassWoSpeechPosition({
    ownerRef: entrySceneRef,
    characterRef: entryCharacterRef,
    speechRef: entrySpeechRef,
    enabled: snapshot?.matches('entry') ?? false,
    positionKey: 'module-entry',
  });
  const passwordValues = snapshot?.context.passwordValues;
  const retrievalResults = snapshot?.context.retrievalResults;
  const campusgramPassword = snapshot?.context.passwordValues['campusgram'] ?? '';
  const campusIdentity = useMemo(
    () => deriveCampusIdentity(snapshot?.context.displayName ?? ''),
    [snapshot?.context.displayName],
  );
  const s05Subject = useMemo(
    () => ({
      id: 'supportive-campusgram',
      label: 'Fiktives Campusgram-Passwort',
      fictionalPassword: campusgramPassword,
      analysisContext: {
        accountTerms: s05Content.analysis.authoredAccountTerms,
        transientAccountIdentifiers: campusIdentity.assessmentTerms.campusgram,
      },
    }),
    [campusIdentity.assessmentTerms.campusgram, campusgramPassword],
  );
  const s05CompletionPort = useMemo<S05CompletionPort>(
    () => ({
      complete: () => controllerRef.current?.completeS05(),
    }),
    [],
  );
  const s06Source = useMemo<S06ConsequenceSource | null>(() => {
    if (passwordValues === undefined || retrievalResults === undefined) return null;
    const masterCampusPassword = passwordValues['master-campus'];
    const campusEmailPassword = passwordValues['campus-email'];
    const campusgramPasswordValue = passwordValues.campusgram;
    const masterCampusRetrieval = s06RetrievalStatus(retrievalResults['master-campus']);
    const campusEmailRetrieval = s06RetrievalStatus(retrievalResults['campus-email']);
    const campusgramRetrieval = s06RetrievalStatus(retrievalResults.campusgram);
    if (
      masterCampusPassword === undefined ||
      masterCampusPassword.length === 0 ||
      campusEmailPassword === undefined ||
      campusEmailPassword.length === 0 ||
      campusgramPasswordValue === undefined ||
      campusgramPasswordValue.length === 0 ||
      masterCampusRetrieval === null ||
      campusEmailRetrieval === null ||
      campusgramRetrieval === null
    ) {
      return null;
    }
    return {
      kind: 'runtime',
      accounts: {
        'master-campus': {
          fictionalPassword: masterCampusPassword,
          retrievalStatus: masterCampusRetrieval,
          transientAccountIdentifiers: campusIdentity.assessmentTerms['master-campus'],
        },
        'campus-email': {
          fictionalPassword: campusEmailPassword,
          retrievalStatus: campusEmailRetrieval,
          transientAccountIdentifiers: campusIdentity.assessmentTerms['campus-email'],
        },
        campusgram: {
          fictionalPassword: campusgramPasswordValue,
          retrievalStatus: campusgramRetrieval,
          transientAccountIdentifiers: campusIdentity.assessmentTerms.campusgram,
        },
      },
    };
  }, [campusIdentity.assessmentTerms, passwordValues, retrievalResults]);
  const completeS06 = useCallback(() => controllerRef.current?.completeS06(), []);

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

  const transitionPart = snapshot.matches('sectionTransition')
    ? 1
    : snapshot.matches('strengthTransition')
      ? 2
      : snapshot.matches('uniquenessTransition')
        ? 3
        : snapshot.matches('changeTransition')
          ? 4
          : null;

  if (transitionPart !== null) {
    return (
      <SectionTransition
        sectionLabel={s00Content.sectionTransition.label}
        title={
          transitionPart === 4
            ? (s00Content.sectionTransition.parts[3]?.label ?? s00Content.sectionTransition.title)
            : s00Content.sectionTransition.title
        }
        currentSection={1}
        totalSections={3}
        parts={s00Content.sectionTransition.parts}
        currentPart={transitionPart}
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
        <div ref={entrySceneRef} className={styles.entryScene}>
          <div className={styles.entryCharacter}>
            <img
              ref={entryCharacterRef}
              src={passWoWelcomeAsset}
              alt="PassWo, Begleiter im Training"
            />
          </div>
          <div
            ref={entrySpeechRef}
            className={styles.entrySpeechSlot}
            data-positioned={entrySpeechPosition !== null}
            style={passWoSpeechPositionStyle(entrySpeechPosition)}
          >
            <PassWoSpeechBubble
              className={styles.entrySpeech}
              speaker={s00Content.narration.guideName}
              paragraphs={s00Content.entry.paragraphs}
              emphasis={passWoSpeechEmphasisFor('module-entry')}
              placement={entrySpeechPosition?.side ?? 'right'}
              {...(entrySpeechPosition === null
                ? {}
                : { arrowOffset: entrySpeechPosition.arrowOffset })}
            />
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
              placeholder="benutzername"
              autoFocus
            />
          </label>
          <button type="submit">{s00Content.entry.startLabel}</button>
        </form>
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
        fictionalUsername={campusIdentity.campusgram}
        fictionalCampusEmail={campusIdentity.campusEmail}
        timingState={timingState}
        timingErrorCode={snapshot.context.timingErrorCode}
        externalTimingError={externalTimingError}
        onAllAccountsViewed={() => controller.completeS02Content()}
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
        platform={platform}
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

  if (snapshot.matches('s06')) {
    const startWritePending = snapshot.matches({ s06: 'writingStart' });
    const startWriteFailed = snapshot.matches({ s06: 'startWriteFailed' });
    if (startWritePending || startWriteFailed) {
      return (
        <S05AnalysisTraining
          subject={s05Subject}
          platform={platform}
          timingState={startWriteFailed ? 'endWriteFailed' : 'writingEnd'}
          timingErrorCode={snapshot.context.timingErrorCode}
          externalTimingError={externalTimingError}
          completionPort={s05CompletionPort}
          onRetryTiming={() => {
            if (externalTimingError !== null) onRetryExternalTiming?.();
            else controller.retryTiming();
          }}
        />
      );
    }
    if (s06Source === null) {
      return (
        <section className={styles.loading} role="alert">
          <p>S06 kann wegen unvollständiger lokaler Trainingsdaten nicht gestartet werden.</p>
          <p>Fehlercode: s06-runtime-data-incomplete</p>
        </section>
      );
    }
    const timingState: S06TimingState = snapshot.matches({ s06: 'writingEnd' })
      ? 'writingEnd'
      : snapshot.matches({ s06: 'endWriteFailed' })
        ? 'endWriteFailed'
        : 'active';
    return (
      <S06ConsequenceTraining
        source={s06Source}
        platform={platform}
        timingState={timingState}
        timingErrorCode={snapshot.context.timingErrorCode}
        externalTimingError={externalTimingError}
        onComplete={completeS06}
        onSummaryNetworkReady={setS06SummaryNetwork}
        onRetryTiming={() => {
          if (externalTimingError !== null) onRetryExternalTiming?.();
          else controller.retryTiming();
        }}
      />
    );
  }

  if (snapshot.matches('s07')) {
    const startWritePending = snapshot.matches({ s07: 'writingStart' });
    const startWriteFailed = snapshot.matches({ s07: 'startWriteFailed' });
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
                  if (externalTimingError !== null) onRetryExternalTiming?.();
                  else controller.retryTiming();
                }}
              >
                Erneut versuchen
              </button>
            </>
          ) : null}
        </section>
      );
    }
    return (
      <S07PassphraseSearchTraining
        campusgramPassword={campusgramPassword}
        displayName={snapshot.context.displayName ?? ''}
        platform={platform}
        onPrimaryResultSelect={() => controller.completeS07()}
      />
    );
  }

  if (snapshot.matches('awaiting-s08')) {
    return <S08NetworkRewindStage platform={platform} network={s06SummaryNetwork} />;
  }

  return null;
}

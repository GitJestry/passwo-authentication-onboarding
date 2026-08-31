import { s00Content, s01Content, s05Content } from '@passwo/training-content';
import type {
  PredefinedPassphraseId,
  S06AccountId,
  SupportivePostS08SegmentId,
  SupportiveS08ResumeState,
  TransientPasswordSemanticEvidence,
} from '@passwo/contracts';
import {
  deriveCampusIdentity,
  PasswordModuleController,
  type PasswordModuleResumeSegmentId,
  type PasswordModuleSnapshot,
  type PasswordModuleTransientResumeState,
  type RetrievalResult,
  type SegmentTimingPort,
} from '@passwo/training-engine';
import type { DesktopPlatform } from '@passwo/ui';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import passWoWelcomeAsset from '../../assets/passwo/passwo-welcome.webp';
import { useInitialFocus } from '../../app/useInitialFocus.js';
import { PassWoSpeechBubble } from './PassWoSpeechBubble.js';
import { passWoSpeechEmphasisFor } from './PassWoSpeechEmphasis.js';
import {
  passWoSpeechPositionStyle,
  usePassWoSpeechPosition,
} from './PassWoSpeechPosition.js';
import styles from './PasswordModuleTraining.module.css';
import { SectionTransition } from './SectionTransition.js';
import { S00Training } from './S00Training.js';
import type { S02TimingState } from './segments/S02/S02AccountExplorationTraining.js';
import type {
  S05CompletionPort,
  S05TimingState,
} from './segments/S05/S05AnalysisTraining.js';
import type {
  S06ConsequenceSource,
  S06TimingState,
} from './segments/S06/S06ConsequenceTraining.js';
import type { S08NetworkRewindInitialStage } from './segments/S08/S08NetworkRewindStage.js';
import { createSupportiveS08ResumeState } from './segments/account-network.js';
import {
  preloadTrainingSegmentImages,
  type TrainingSegmentId,
} from './training-runtime-assets.js';
import {
  clearSupportiveReloadCheckpoint,
  type SupportiveReloadCheckpoint,
  type SupportiveReloadSegmentId,
  writeSupportiveReloadCheckpoint,
} from './supportive-reload-checkpoint.js';

const loadS01Training = () => import('./S01Training.js');
const loadS02Training = () => import('./segments/S02/S02AccountExplorationTraining.js');
const loadS03Training = () => import('./segments/S03/S03RetrievalTraining.js');
const loadS04Training = () => import('./segments/S04/S04IncidentTraining.js');
const loadS05Training = () => import('./segments/S05/S05AnalysisTraining.js');
const loadS06Training = () => import('./segments/S06/S06ConsequenceTraining.js');
const loadS07Training = () => import('./segments/S07/S07PassphraseSearchTraining.js');
const loadS08Training = () => import('./segments/S08/S08NetworkRewindStage.js');

const S01Training = lazy(async () => {
  const module = await loadS01Training();
  return { default: module.S01Training };
});
const S02AccountExplorationTraining = lazy(async () => {
  const module = await loadS02Training();
  return { default: module.S02AccountExplorationTraining };
});
const S03RetrievalTraining = lazy(async () => {
  const module = await loadS03Training();
  return { default: module.S03RetrievalTraining };
});
const S04IncidentTraining = lazy(async () => {
  const module = await loadS04Training();
  return { default: module.S04IncidentTraining };
});
const S05AnalysisTraining = lazy(async () => {
  const module = await loadS05Training();
  return { default: module.S05AnalysisTraining };
});
const S06ConsequenceTraining = lazy(async () => {
  const module = await loadS06Training();
  return { default: module.S06ConsequenceTraining };
});
const S07PassphraseSearchTraining = lazy(async () => {
  const module = await loadS07Training();
  return { default: module.S07PassphraseSearchTraining };
});
const S08NetworkRewindStage = lazy(async () => {
  const module = await loadS08Training();
  return { default: module.S08NetworkRewindStage };
});

interface LateTrainingTools {
  readonly createS06ConsequenceScenePlan: (typeof import(
    './segments/S06/S06ConsequenceController.js'
  ))['createS06ConsequenceScenePlan'];
  readonly deriveS07AccountFeedback: (typeof import(
    './segments/S07/S07PassphraseSearchMachine.js'
  ))['deriveS07AccountFeedback'];
}

let lateTrainingToolsPromise: Promise<LateTrainingTools> | null = null;

function loadLateTrainingTools(): Promise<LateTrainingTools> {
  lateTrainingToolsPromise ??= Promise.all([
    import('./segments/S06/S06ConsequenceController.js'),
    import('./segments/S07/S07PassphraseSearchMachine.js'),
  ]).then(([s06Module, s07Module]) => ({
    createS06ConsequenceScenePlan: s06Module.createS06ConsequenceScenePlan,
    deriveS07AccountFeedback: s07Module.deriveS07AccountFeedback,
  }));
  return lateTrainingToolsPromise;
}

let passwordModuleRuntimeWarmup: Promise<void> | null = null;

function preloadTrainingCohort(
  segments: readonly {
    readonly id: TrainingSegmentId;
    readonly loadModule: () => Promise<unknown>;
  }[],
): Promise<void> {
  return Promise.all(
    segments.map(({ id, loadModule }) =>
      Promise.all([loadModule(), preloadTrainingSegmentImages(id)]),
    ),
  ).then(() => undefined);
}

export function preloadPasswordModuleRuntime(): Promise<void> {
  passwordModuleRuntimeWarmup ??= Promise.all([
    preloadTrainingSegmentImages('entry', 'high'),
    preloadTrainingSegmentImages('s00', 'high'),
    preloadTrainingCohort([
      { id: 's01', loadModule: loadS01Training },
      { id: 's02', loadModule: loadS02Training },
      { id: 's03', loadModule: loadS03Training },
      { id: 's04', loadModule: loadS04Training },
    ]),
  ])
    .then(() =>
      preloadTrainingCohort([
        { id: 's05', loadModule: loadS05Training },
        {
          id: 's06',
          loadModule: () => Promise.all([loadS06Training(), loadLateTrainingTools()]),
        },
        { id: 's07', loadModule: loadS07Training },
        { id: 's08', loadModule: loadS08Training },
      ]),
    )
    .then(() => undefined);
  return passwordModuleRuntimeWarmup;
}

function TrainingSegmentLoadingBoundary() {
  return (
    <div className={styles.loading} role="status" aria-busy="true">
      Training wird vorbereitet …
    </div>
  );
}

export interface PasswordModuleTrainingProps {
  readonly sessionId?: string;
  readonly reloadCheckpointEnabled?: boolean;
  readonly timingPort?: SegmentTimingPort;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
  readonly resumeSegmentId?: PasswordModuleResumeSegmentId;
  readonly reloadCheckpoint?: SupportiveReloadCheckpoint;
  readonly resumeState?: SupportiveS08ResumeState;
  readonly onS08Checkpoint?: (resumeState: SupportiveS08ResumeState) => Promise<void>;
  readonly onPostS08Checkpoint?: (
    segmentId: SupportivePostS08SegmentId,
  ) => Promise<void>;
  readonly onComplete?: () => void;
}

function reloadSegmentForSnapshot(
  snapshot: PasswordModuleSnapshot,
): SupportiveReloadSegmentId | null {
  if (snapshot.matches('s01')) return 'S01';
  if (snapshot.matches('s02')) return 'S02';
  if (snapshot.matches('s03')) return 'S03';
  if (snapshot.matches('s04')) return 'S04';
  if (snapshot.matches('strengthTransition') || snapshot.matches('s05')) return 'S05';
  if (snapshot.matches('uniquenessTransition') || snapshot.matches('s06')) return 'S06';
  if (
    snapshot.matches('changeTransition') ||
    snapshot.matches('s07') ||
    snapshot.matches('awaiting-s08')
  ) {
    return 'S07';
  }
  return null;
}

function transientResumeStateForSnapshot(
  snapshot: PasswordModuleSnapshot,
): PasswordModuleTransientResumeState | null {
  if (snapshot.context.displayName === null) return null;
  return {
    displayName: snapshot.context.displayName,
    activeAccountId: snapshot.context.activeAccountId,
    passwordValues: { ...snapshot.context.passwordValues },
    configuredAccountIds: [...snapshot.context.configuredAccountIds],
    s02ContentCompleted: snapshot.context.s02ContentCompleted,
    retrievalResults: { ...snapshot.context.retrievalResults },
  };
}

function lateTrainingInitialStage(
  resumeSegmentId: PasswordModuleResumeSegmentId | undefined,
): S08NetworkRewindInitialStage {
  switch (resumeSegmentId) {
    case 'S09':
      return 's09';
    case 'S10':
      return 's10';
    case 'S11':
      return 's11';
    case 'S12':
      return 's12';
    case 'S13':
      return 's13';
    case 'S14':
      return 's14';
    case 'S15':
      return 's15';
    case 'S16':
      return 's16';
    case 'S17':
      return 's17';
    default:
      return 's08';
  }
}

function s06RetrievalStatus(
  status: RetrievalResult | undefined,
): 'retrievable' | 'not-remembered' | 'assisted' | null {
  return status === undefined || status === 'pending' ? null : status;
}

export function PasswordModuleTraining(props: PasswordModuleTrainingProps) {
  return (
    <Suspense fallback={<TrainingSegmentLoadingBoundary />}>
      <PasswordModuleTrainingContent {...props} />
    </Suspense>
  );
}

function PasswordModuleTrainingContent({
  sessionId,
  reloadCheckpointEnabled = false,
  timingPort,
  externalTimingError = null,
  onRetryExternalTiming,
  resumeSegmentId,
  reloadCheckpoint,
  resumeState,
  onS08Checkpoint,
  onPostS08Checkpoint,
  onComplete,
}: PasswordModuleTrainingProps) {
  const initialInputRef = useInitialFocus<HTMLInputElement>();
  const [snapshot, setSnapshot] = useState<PasswordModuleSnapshot | null>(null);
  const [platform, setPlatform] = useState<DesktopPlatform>(reloadCheckpoint?.platform ?? 'mac');
  const [lateTrainingTools, setLateTrainingTools] = useState<LateTrainingTools | null>(null);
  const [campusgramPassphraseId, setCampusgramPassphraseId] =
    useState<PredefinedPassphraseId | null>(null);
  // Keeps uninterrupted account labels coherent without adding the display name to S08 resume.
  const [postS08DisplayName, setPostS08DisplayName] = useState('');
  const [s08ResumeState, setS08ResumeState] = useState<SupportiveS08ResumeState | null>(
    resumeState ?? null,
  );
  const [s08CheckpointStatus, setS08CheckpointStatus] = useState<
    'idle' | 'pending' | 'ready' | 'error'
  >(resumeState === undefined ? 'idle' : 'ready');
  // Local intervention evidence only; never copied into machine context or research exports.
  const [semanticEvidenceByAccount, setSemanticEvidenceByAccount] = useState<
    Partial<Record<S06AccountId, TransientPasswordSemanticEvidence>>
  >(reloadCheckpoint?.semanticEvidenceByAccount ?? {});
  const controllerRef = useRef<PasswordModuleController | null>(null);
  const storedReloadSegmentRef = useRef<SupportiveReloadSegmentId | null>(null);
  const s08BoundaryStartedRef = useRef(resumeState !== undefined);
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
          ...(semanticEvidenceByAccount['master-campus'] === undefined
            ? {}
            : { semanticEvidence: semanticEvidenceByAccount['master-campus'] }),
        },
        'campus-email': {
          fictionalPassword: campusEmailPassword,
          retrievalStatus: campusEmailRetrieval,
          transientAccountIdentifiers: campusIdentity.assessmentTerms['campus-email'],
          ...(semanticEvidenceByAccount['campus-email'] === undefined
            ? {}
            : { semanticEvidence: semanticEvidenceByAccount['campus-email'] }),
        },
        campusgram: {
          fictionalPassword: campusgramPasswordValue,
          retrievalStatus: campusgramRetrieval,
          transientAccountIdentifiers: campusIdentity.assessmentTerms.campusgram,
          ...(semanticEvidenceByAccount.campusgram === undefined
            ? {}
            : { semanticEvidence: semanticEvidenceByAccount.campusgram }),
        },
      },
    };
  }, [campusIdentity.assessmentTerms, passwordValues, retrievalResults, semanticEvidenceByAccount]);
  const s06Plan = useMemo(() => {
    if (s06Source?.kind !== 'runtime' || lateTrainingTools === null) return null;
    return lateTrainingTools.createS06ConsequenceScenePlan(
      'supportive-runtime-s07-relations',
      s06Source.accounts,
    );
  }, [lateTrainingTools, s06Source]);
  const s07AccountFeedback =
    s06Plan === null || lateTrainingTools === null
      ? []
      : lateTrainingTools.deriveS07AccountFeedback(s06Plan);
  const completeS06 = useCallback(() => controllerRef.current?.completeS06(), []);
  const captureSemanticEvidenceForAccount = useCallback(
    (accountId: S06AccountId, evidence: TransientPasswordSemanticEvidence) => {
      if (!evidence.confirmed) return;
      setSemanticEvidenceByAccount((current) => ({ ...current, [accountId]: evidence }));
    },
    [],
  );
  const captureS05SemanticEvidence = useCallback(
    (evidence: TransientPasswordSemanticEvidence) => {
      captureSemanticEvidenceForAccount('campusgram', evidence);
    },
    [captureSemanticEvidenceForAccount],
  );

  useEffect(() => {
    const controller = new PasswordModuleController({
      accountIds: s01Content.browser.accounts.map(({ id }) => id),
      ...(timingPort === undefined ? {} : { timingPort }),
      ...(resumeSegmentId === undefined ? {} : { resumeSegmentId }),
      ...(reloadCheckpoint === undefined
        ? {}
        : { transientResumeState: reloadCheckpoint.transientState }),
    });
    const unsubscribe = controller.subscribe(setSnapshot);
    controllerRef.current = controller;
    storedReloadSegmentRef.current = null;
    s08BoundaryStartedRef.current = resumeState !== undefined;
    setPlatform(reloadCheckpoint?.platform ?? 'mac');
    setSemanticEvidenceByAccount(reloadCheckpoint?.semanticEvidenceByAccount ?? {});
    setPostS08DisplayName('');
    setS08ResumeState(resumeState ?? null);
    setS08CheckpointStatus(resumeState === undefined ? 'idle' : 'ready');
    setSnapshot(controller.getSnapshot());

    return () => {
      unsubscribe();
      controller.dispose();
      controllerRef.current = null;
    };
  }, [reloadCheckpoint, resumeSegmentId, resumeState, timingPort]);

  const reloadSegmentId = snapshot === null ? null : reloadSegmentForSnapshot(snapshot);

  useEffect(() => {
    if (
      !reloadCheckpointEnabled ||
      sessionId === undefined ||
      snapshot === null ||
      reloadSegmentId === null ||
      storedReloadSegmentRef.current === reloadSegmentId
    ) {
      return;
    }
    const transientState = transientResumeStateForSnapshot(snapshot);
    if (transientState === null) return;
    const stored = writeSupportiveReloadCheckpoint({
      sessionId,
      segmentId: reloadSegmentId,
      platform,
      transientState,
      semanticEvidenceByAccount,
    });
    if (stored) storedReloadSegmentRef.current = reloadSegmentId;
  }, [
    platform,
    reloadCheckpointEnabled,
    reloadSegmentId,
    semanticEvidenceByAccount,
    sessionId,
    snapshot,
  ]);

  useEffect(() => {
    if (resumeState !== undefined) clearSupportiveReloadCheckpoint();
  }, [resumeState]);

  useEffect(() => {
    if (
      !snapshot?.matches('awaiting-s08') ||
      s08BoundaryStartedRef.current ||
      campusgramPassphraseId === null ||
      s06Plan === null
    ) {
      return;
    }
    s08BoundaryStartedRef.current = true;
    const minimalResumeState = createSupportiveS08ResumeState(
      s06Plan,
      campusgramPassphraseId,
    );
    setPostS08DisplayName(snapshot.context.displayName ?? '');
    setS08ResumeState(minimalResumeState);
    setSemanticEvidenceByAccount({});
    controllerRef.current?.enterS08();
    if (onS08Checkpoint === undefined) {
      clearSupportiveReloadCheckpoint();
      setS08CheckpointStatus('ready');
      return;
    }
    setS08CheckpointStatus('pending');
    void onS08Checkpoint(minimalResumeState).then(
      () => {
        clearSupportiveReloadCheckpoint();
        setS08CheckpointStatus('ready');
      },
      () => setS08CheckpointStatus('error'),
    );
  }, [campusgramPassphraseId, onS08Checkpoint, s06Plan, snapshot]);

  useEffect(() => {
    let cancelled = false;
    void preloadPasswordModuleRuntime()
      .catch(() => undefined)
      .then(() => loadLateTrainingTools())
      .then(
        (tools) => {
          if (!cancelled) setLateTrainingTools(tools);
        },
        () => undefined,
      );
    return () => {
      cancelled = true;
    };
  }, []);

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
              width={440}
              height={660}
              loading="eager"
              fetchPriority="high"
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
              ref={initialInputRef}
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
        onSemanticEvidenceChange={captureS05SemanticEvidence}
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
          onSemanticEvidenceChange={captureS05SemanticEvidence}
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
        onSemanticEvidenceChange={captureSemanticEvidenceForAccount}
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
    if (lateTrainingTools === null || s06Plan === null) {
      return <TrainingSegmentLoadingBoundary />;
    }
    return (
      <S07PassphraseSearchTraining
        accountFeedback={s07AccountFeedback}
        campusgramPassword={campusgramPassword}
        displayName={snapshot.context.displayName ?? ''}
        platform={platform}
        onComplete={(_recommendedAccountIds, selectedPassphraseId) => {
          setCampusgramPassphraseId(selectedPassphraseId);
          controller.completeS07();
        }}
      />
    );
  }

  if (snapshot.matches('awaiting-s08')) {
    return <TrainingSegmentLoadingBoundary />;
  }

  if (snapshot.matches('s08')) {
    if (s08ResumeState === null || s08CheckpointStatus === 'pending') {
      return <TrainingSegmentLoadingBoundary />;
    }
    if (s08CheckpointStatus === 'error') {
      return (
        <section className={styles.loading} role="alert">
          <p>Die Segmentgrenze konnte nicht bestätigt werden.</p>
          <p>Fehlercode: s08-resume-checkpoint-failed</p>
          <button
            type="button"
            onClick={() => {
              if (onS08Checkpoint === undefined) return;
              setS08CheckpointStatus('pending');
              void onS08Checkpoint(s08ResumeState).then(
                () => {
                  clearSupportiveReloadCheckpoint();
                  setS08CheckpointStatus('ready');
                },
                () => setS08CheckpointStatus('error'),
              );
            }}
          >
            Erneut versuchen
          </button>
        </section>
      );
    }
    return (
      <S08NetworkRewindStage
        displayName={postS08DisplayName}
        recommendedAccountIds={[]}
        platform={platform}
        initialStage={lateTrainingInitialStage(resumeSegmentId)}
        resumeState={s08ResumeState}
        {...(onPostS08Checkpoint === undefined
          ? {}
          : { onSegmentCheckpoint: onPostS08Checkpoint })}
        {...(onComplete === undefined ? {} : { onComplete })}
      />
    );
  }

  return null;
}

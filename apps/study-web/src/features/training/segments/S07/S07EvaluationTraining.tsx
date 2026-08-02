import type {
  LocalPasswordDisposition,
  S06AccountId,
  S07RecommendationProjection,
  S07RecommendationProjectionInput,
} from '@passwo/contracts';
import { s07EvaluationContent } from '@passwo/training-content';
import { DesktopSurface, type DesktopPlatform } from '@passwo/ui';
import type { NetworkSceneSnapshot, S07AccountCardModel } from '@passwo/visualization';
import { useEffect, useMemo, useState } from 'react';
import {
  ReactFlowNetwork,
  ReactFlowNetworkAdapter,
} from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import {
  createCompletedS02Network,
  staticNetworkPresentation,
} from '../account-network.js';
import {
  S07EvaluationController,
  type S07EvaluationControllerSnapshot,
} from './S07EvaluationController.js';
import styles from './S07EvaluationTraining.module.css';

const accountDefinitions = (
  ['master-campus', 'campus-email', 'campusgram'] as const
).map((accountId) => ({
  accountId,
  label: s07EvaluationContent.accounts[accountId].label,
  roleDescription: s07EvaluationContent.accounts[accountId].role,
}));

function dispositionLabel(disposition: LocalPasswordDisposition): string {
  return disposition.kind === 'quick-path-recognized'
    ? s07EvaluationContent.dispositionLabels[disposition.ruleId]
    : s07EvaluationContent.dispositionLabels.none;
}

function accountLabel(accountId: S06AccountId): string {
  return s07EvaluationContent.accounts[accountId].label;
}

function AccountCard({
  card,
  active,
}: {
  readonly card: S07AccountCardModel;
  readonly active: boolean;
}) {
  return (
    <article
      className={styles.accountCard}
      data-active={active}
      aria-labelledby={`${card.id}-title`}
    >
      <header>
        <p>Kontokarte</p>
        <h2 id={`${card.id}-title`}>{card.label}</h2>
        <p>{card.roleDescription}</p>
      </header>
      <dl className={styles.findings}>
        <div>
          <dt>Lokale Simulationsbefunde</dt>
          <dd>{dispositionLabel(card.disposition)}</dd>
        </div>
        <div>
          <dt>Verbindung zu anderen Passwörtern</dt>
          <dd>
            <ul>
              {card.connections.map((connection) => (
                <li key={connection.accountId}>
                  {accountLabel(connection.accountId)}:{' '}
                  {s07EvaluationContent.relationLabels[connection.relationKind]}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Rolle im Campusgram-Vorfall</dt>
          <dd>{s07EvaluationContent.incidentLabels[card.incidentStatus]}</dd>
        </div>
        <div>
          <dt>Abrufbarkeit</dt>
          <dd>{s07EvaluationContent.retrievalLabels[card.retrievability]}</dd>
        </div>
      </dl>
      {card.retrievability !== 'remembered' ? (
        <p className={styles.supportiveFeedback}>{s07EvaluationContent.notRememberedFeedback}</p>
      ) : null}
      <section className={styles.recommendation} aria-labelledby={`${card.id}-recommendation`}>
        <p>Priorisierter nächster Schritt</p>
        <h3 id={`${card.id}-recommendation`}>
          {s07EvaluationContent.recommendationLabels[card.recommendationId]}
        </h3>
      </section>
    </article>
  );
}

export type S07TimingState = 'active' | 'writingEnd' | 'endWriteFailed';

export interface S07EvaluationTrainingProps {
  readonly input: S07RecommendationProjectionInput;
  readonly network?: NetworkSceneSnapshot | null;
  readonly platform?: DesktopPlatform;
  readonly timingState?: S07TimingState;
  readonly timingErrorCode?: string | null;
  readonly externalTimingError?: string | null;
  readonly onProjectionReady?: (projection: S07RecommendationProjection) => void;
  readonly onRetryTiming?: () => void;
  readonly onComplete?: () => void;
}

export function S07EvaluationTraining({
  input,
  network,
  platform = 'mac',
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onProjectionReady,
  onRetryTiming,
  onComplete,
}: S07EvaluationTrainingProps) {
  const [controller, setController] = useState<S07EvaluationController | null>(null);
  const [snapshot, setSnapshot] = useState<S07EvaluationControllerSnapshot | null>(null);
  const backgroundNetwork = useMemo(() => network ?? createCompletedS02Network(), [network]);
  const networkAdapter = useMemo(
    () => new ReactFlowNetworkAdapter(backgroundNetwork),
    [backgroundNetwork],
  );
  const networkPresentation = useMemo(
    () => staticNetworkPresentation(backgroundNetwork),
    [backgroundNetwork],
  );

  useEffect(() => {
    const nextController = new S07EvaluationController({
      input,
      accountDefinitions,
      ...(onProjectionReady === undefined ? {} : { onProjectionReady }),
      ...(onComplete === undefined ? {} : { onComplete }),
    });
    const unsubscribe = nextController.subscribe(setSnapshot);
    setController(nextController);
    setSnapshot(nextController.getSnapshot());
    return () => {
      unsubscribe();
      nextController.dispose();
    };
  }, [input, onComplete, onProjectionReady]);

  if (controller === null || snapshot === null) return null;
  const { overview } = snapshot.deck;
  return (
    <section className={styles.training} aria-label={s07EvaluationContent.trainingAriaLabel}>
      <DesktopSurface
        platform={platform}
        browserDock={{ active: false, enabled: false, label: 'Browser geschlossen' }}
      >
        <article className={styles.page} aria-labelledby="s07-title">
          <div className={styles.networkBackdrop} aria-hidden="true">
            <ReactFlowNetwork
              adapter={networkAdapter}
              presentation={networkPresentation}
              onNodeSelect={() => undefined}
              interactionDisabled
              visualVariant="account-map"
              showEdgeLabels={false}
            />
          </div>
          <div className={styles.foreground}>
          <header className={styles.pageHeader}>
            <div>
              <p>{s07EvaluationContent.page.eyebrow}</p>
              <h1 id="s07-title">{s07EvaluationContent.page.title}</h1>
              <p>{s07EvaluationContent.page.instruction}</p>
            </div>
            <dl className={styles.overview} aria-label="Kompakte Übersicht">
              <div>
                <dt>Kein schnellerer Weg erkannt</dt>
                <dd>{overview.noQuickPathCount}/3</dd>
              </div>
              <div>
                <dt>Ohne exakte oder abgeleitete Passwortverbindung</dt>
                <dd>{overview.noPasswordConnectionCount}/3</dd>
              </div>
              <div>
                <dt>Im Login erinnert</dt>
                <dd>{overview.rememberedCount}/3</dd>
              </div>
            </dl>
          </header>

          {snapshot.phase === 'account-card' && snapshot.currentCard !== null ? (
            <div className={styles.cardStage}>
              <p className={styles.progress} aria-live="polite">
                Kontokarte {snapshot.viewedCardCount} von 3
              </p>
              <div className={styles.accountCards}>
                {snapshot.deck.cards.map((card) => (
                  <AccountCard
                    key={card.id}
                    card={card}
                    active={card.id === snapshot.currentCard?.id}
                  />
                ))}
              </div>
              <button type="button" onClick={() => controller.continue()}>
                {snapshot.viewedCardCount < 3
                  ? s07EvaluationContent.page.nextAccount
                  : s07EvaluationContent.page.showSummary}
              </button>
            </div>
          ) : null}

          {snapshot.phase === 'summary' || snapshot.phase === 'complete' ? (
            <section className={styles.summary} aria-labelledby="s07-summary-title">
              <h2 id="s07-summary-title">Adaptive Gesamtauswertung</h2>
              <div className={styles.miniCards} aria-label="Angesehene Kontokarten">
                {snapshot.deck.cards.map((card) => (
                  <span key={card.id}>{card.label}</span>
                ))}
              </div>
              {snapshot.deck.problemClasses.length > 0 ? (
                <ul>
                  {snapshot.deck.problemClasses.map((problemClass) => (
                    <li key={problemClass}>
                      {s07EvaluationContent.problemStatements[problemClass]}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{s07EvaluationContent.noProblemStatement}</p>
              )}
              {timingState === 'active' && snapshot.phase === 'summary' ? (
                <button type="button" onClick={() => controller.complete()}>
                  {s07EvaluationContent.page.continue}
                </button>
              ) : null}
              {timingState === 'active' && snapshot.phase === 'complete' ? (
                <p role="status">Auswertung abgeschlossen.</p>
              ) : null}
              {timingState === 'writingEnd' ? (
                <p role="status">Segmentabschluss wird bestätigt …</p>
              ) : null}
              {timingState === 'endWriteFailed' ? (
                <div className={styles.timingError} role="alert">
                  <p>Die Segmentgrenze konnte nicht bestätigt werden.</p>
                  <p>Fehlercode: {externalTimingError ?? timingErrorCode}</p>
                  <button type="button" onClick={onRetryTiming}>Erneut versuchen</button>
                </div>
              ) : null}
            </section>
          ) : null}
          </div>
        </article>
      </DesktopSurface>
    </section>
  );
}

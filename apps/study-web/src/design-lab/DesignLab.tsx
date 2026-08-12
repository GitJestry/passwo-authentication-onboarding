import {
  defaultTrainingQaPasswords,
  type DesignLabScenarioId,
  designLabPathForScenario,
  designLabScenarioIds,
  type TrainingQaPasswordOverrides,
} from '@passwo/contracts';
import {
  getS05DesignLabFixtureByRouteId,
  getS06ConsequenceFixtureByRouteId,
  getS06PreparedS07EvaluationFixtureByRouteId,
  type S01AccountId,
  s00Content,
  s01AccountIds,
  s01Content,
} from '@passwo/training-content';
import { PasswordModuleController, type PasswordModuleSnapshot } from '@passwo/training-engine';
import {
  ArtifactViewport,
  BrowserShell,
  type BrowserShellLayers,
  type BrowserShellSnapshot,
  type BrowserTabModel,
  type DesktopPlatform,
} from '@passwo/ui';
import { useEffect, useState, type ReactNode } from 'react';
import { S00Training } from '../features/training/S00Training.js';
import { S01Training } from '../features/training/S01Training.js';
import { SectionTransition } from '../features/training/SectionTransition.js';
import { S02AccountExplorationTraining } from '../features/training/segments/S02/S02AccountExplorationTraining.js';
import { S03RetrievalTraining } from '../features/training/segments/S03/S03RetrievalTraining.js';
import { S04IncidentTraining } from '../features/training/segments/S04/S04IncidentTraining.js';
import { S06ConsequenceTraining } from '../features/training/segments/S06/S06ConsequenceTraining.js';
import styles from './DesignLab.module.css';
import { S05DesignLabTraining } from './S05DesignLabTraining.js';
import { S07DesignLabTraining } from './S07DesignLabTraining.js';

interface DesignLabScenario {
  readonly label: string;
  readonly description: string;
  readonly dimmed: boolean;
  readonly showPassWoOverlay: boolean;
}

function ArtifactPreview({ children }: { readonly children: ReactNode }) {
  return (
    <div className={styles.artifactPreview}>
      <ArtifactViewport>{children}</ArtifactViewport>
    </div>
  );
}

interface FictionalPageSnapshot {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly taskLabel: string;
  readonly taskTitle: string;
  readonly taskItems: readonly string[];
  readonly progressCurrent: number;
  readonly progressTotal: number;
  readonly progressStatus: string;
}

interface DesignLabTabScene {
  readonly snapshot: BrowserShellSnapshot;
  readonly page: FictionalPageSnapshot;
}

type CampusWebsitePreviewView = 'landing' | 'auth' | 'dashboard';

function readCampusWebsitePreview(): {
  readonly accountId: S01AccountId;
  readonly view: CampusWebsitePreviewView;
} {
  const parameters = new URLSearchParams(window.location.search);
  const requestedAccountId = parameters.get('account');
  const requestedView = parameters.get('view');
  const accountId =
    s01AccountIds.find((candidate) => candidate === requestedAccountId) ?? 'master-campus';
  const view =
    requestedView === 'auth' || requestedView === 'dashboard' ? requestedView : 'landing';
  return { accountId, view };
}

function readDesktopPlatform(): DesktopPlatform {
  const requestedPlatform = new URLSearchParams(window.location.search).get('platform');
  return requestedPlatform === 'windows' || requestedPlatform === 'linux'
    ? requestedPlatform
    : 'mac';
}

function passwordForAccount(
  accountId: S01AccountId,
  overrides: TrainingQaPasswordOverrides,
): string {
  return overrides[accountId] ?? defaultTrainingQaPasswords[accountId];
}

function useQaPasswordOverrides(): TrainingQaPasswordOverrides {
  const [overrides, setOverrides] = useState<TrainingQaPasswordOverrides>({});

  useEffect(() => {
    const loadOverrides = window.passwoDesktop?.getQaPasswordOverrides;
    if (loadOverrides === undefined) return undefined;

    let cancelled = false;
    void loadOverrides().then((loadedOverrides) => {
      if (!cancelled && loadedOverrides !== null) setOverrides(loadedOverrides);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return overrides;
}

const overviewTab: BrowserTabModel = {
  id: 'overview',
  label: 'Übersicht',
  enabled: true,
};
const preparationTab: BrowserTabModel = {
  id: 'preparation',
  label: 'Vorbereitung',
  enabled: true,
};
const reflectionTab: BrowserTabModel = {
  id: 'reflection',
  label: 'Reflexion',
  status: 'attention',
  disabledReason: 'In diesem Design-Lab-Snapshot nicht freigegeben.',
};

const overviewTabScene: DesignLabTabScene = {
  snapshot: {
    tabs: [overviewTab, preparationTab, reflectionTab],
    activeTabId: 'overview',
    address: 'campus.example/uebersicht',
  },
  page: {
    eyebrow: 'Übersicht',
    title: 'Übungsrahmen im Überblick',
    description:
      'Diese fiktive Übersicht zeigt die Bestandteile der späteren Übung. Sie fragt weder nach einem Konto noch nach einem realen Passwort.',
    taskLabel: 'Vorschau',
    taskTitle: 'Darstellung und Bedienung',
    taskItems: [
      'Die Seitentabs wechseln vollständige Vorschauen.',
      'Die Adresse ist reine Darstellung.',
      'Es werden keine Eingabewerte gespeichert.',
    ],
    progressCurrent: 1,
    progressTotal: 3,
    progressStatus: 'Erster von drei Schritten',
  },
};

const preparationTabScene: DesignLabTabScene = {
  snapshot: {
    tabs: [{ ...overviewTab, status: 'complete' }, preparationTab, reflectionTab],
    activeTabId: 'preparation',
    address: 'campus.example/vorbereitung',
  },
  page: {
    eyebrow: 'Vorbereitung',
    title: 'Eine Anmeldung in Ruhe vorbereiten',
    description:
      'Diese fiktive Seite zeigt nur den visuellen Rahmen des späteren Trainings. Sie fragt weder nach einem Konto noch nach einem realen Passwort.',
    taskLabel: 'Aktueller Schritt',
    taskTitle: 'Übungsrahmen kennenlernen',
    taskItems: [
      'Die Adresse ist reine Darstellung.',
      'Nur freigegebene Tabs reagieren.',
      'Es werden keine Eingabewerte gespeichert.',
    ],
    progressCurrent: 1,
    progressTotal: 3,
    progressStatus: 'Erster von drei Schritten',
  },
};

const tabScenes: readonly DesignLabTabScene[] = [overviewTabScene, preparationTabScene];

const scenarios: Record<DesignLabScenarioId, DesignLabScenario> = {
  normal: {
    label: 'Normal',
    description: 'Browserbühne ohne Dimming oder zusätzliche Layer.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  dimmed: {
    label: 'Abgedunkelt',
    description: 'Seiteninhalt ist inaktiv und die Dimming-Schicht vollständig sichtbar.',
    dimmed: true,
    showPassWoOverlay: false,
  },
  'passwo-overlay': {
    label: 'PassWo-Overlay',
    description: 'Dimming, PassWo-Platzhalter, Sprechschritt und Steuerung als feste Layer.',
    dimmed: true,
    showPassWoOverlay: true,
  },
  s00: {
    label: 'S00',
    description: 'Deterministische Vorschau des ersten Trainingssegments.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  s01: {
    label: 'S01',
    description: 'Direkter QA-Einstieg in die fiktive Kontoeinrichtung.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's02-master-campus': {
    label: 'S02 Konten',
    description: 'Freie Kontowahl mit vollständigen geführten Vorschausequenzen pro Konto.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  s03: {
    label: 'S03',
    description: 'Direkter QA-Einstieg in den fiktiven Anmeldeabruf.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's03-warning': {
    label: 'S03 Warnung',
    description: 'Zeitraffer und klickgetriebene Campusgram-Warnung vor dem Segmentwechsel.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  s04: {
    label: 'S04',
    description: 'Datenleck-Erklärung innerhalb der fiktiven Campusgram-Website.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  s05: {
    label: 'S04 → S05 Übergang',
    description:
      'Vollständiger QA-Einstieg ab der Campusgram-Warnung bis in die naheliegenden Bestandteile.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-common-suffix': {
    label: 'S05 Bestandteile · Kern + Anhang',
    description: 'Direkter QA-Einstieg bei den Bestandteilen mit häufigem Kern und Anhang.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-all-categories': {
    label: 'S05 Bestandteile · alle drei Prüfungen',
    description:
      'Direkter QA-Einstieg mit häufigem Bestandteil, Bezug zum Konto, Dienst oder Umfeld sowie Variante; die persönliche Einordnung erfolgt lokal im Ablauf.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-account-year': {
    label: 'S05 Bestandteile · Konto + Jahr',
    description: 'Direkter QA-Einstieg bei den Bestandteilen mit Campusgram-Begriff und Jahr.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-no-simple-component': {
    label: 'S05 Bestandteile · kein Treffer',
    description: 'Direkter QA-Einstieg bei den Bestandteilen ohne erkannten einfachen Treffer.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-structure-repetition': {
    label: 'S05 Vorhersehbarer Aufbau · Wiederholung',
    description: 'Direkter QA-Einstieg beim Aufbau mit einem exakt wiederholten Bestandteil.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-structure-context': {
    label: 'S05 Vorhersehbarer Aufbau · Kontext',
    description: 'Direkter QA-Einstieg beim Aufbau mit Campusgram-Kontext, Jahr und Anhang.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-structure-none': {
    label: 'S05 Vorhersehbarer Aufbau · kein Weg',
    description: 'Direkter QA-Einstieg beim Aufbau ohne erkannten einfachen Zusammenhang.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-free-search': {
    label: 'S05 Alle Möglichkeiten durchprobieren',
    description: 'Direkter QA-Einstieg beim systematischen Durchprobieren aller Möglichkeiten.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-application-found': {
    label: 'S05 Abschluss · Passwort gefunden',
    description: 'Direkter QA-Einstieg in die rote geführte Campusgram-Abschlussszene.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-application-protected': {
    label: 'S05 Abschluss · Prüfweg blockiert',
    description: 'Direkter QA-Einstieg in die blaue Schild-Variante der Abschlussszene.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-reuse-and-derived': {
    label: 'S06 Wiederverwendung + Ableitung',
    description:
      'Campusgram wird gefunden, Master Campus exakt und Campus E-Mail konkret abgeleitet.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-incident-not-found': {
    label: 'S06 Vorfall stoppt',
    description:
      'Campusgram wird nicht schnell gefunden; alle drei Beziehungen bleiben ohne erkannten Weg.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-incident-found-blocked': {
    label: 'S06 gefunden, Wege blockiert',
    description:
      'Campusgram wird gefunden; beide weiteren Konten bleiben ohne erkannten Ableitungsweg.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-mixed-actual-hypothetical': {
    label: 'S06 gemischt',
    description:
      'Tatsächliche und hypothetische Schritte sind in einem deterministischen Ablauf klar getrennt.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's07-directly-reached': {
    label: 'S07 direkt erreicht',
    description: 'Auswertung mit einem in der tatsächlichen Simulation erreichten Konto.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's07-exact-reuse': {
    label: 'S07 exakte Wiederverwendung',
    description: 'Auswertung mit exakt wiederverwendeten fiktiven Passwörtern.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's07-derived-variant': {
    label: 'S07 abgeleitete Variante',
    description: 'Auswertung mit einem konkreten abgeleiteten Kandidatenweg.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's07-retrievability-only': {
    label: 'S07 nur Abrufbarkeit',
    description: 'Auswertung mit ausschließlich einem Abrufbarkeitsproblem.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's07-no-change': {
    label: 'S07 kein Änderungsbedarf',
    description: 'Auswertung ohne erkannte Problemklasse in der begrenzten Übung.',
    dimmed: false,
    showPassWoOverlay: false,
  },
};

function DesignLabIntroduction({
  scenarioId,
  scenario,
}: {
  readonly scenarioId: DesignLabScenarioId;
  readonly scenario: DesignLabScenario;
}) {
  const scenarioMenuIds = [
    scenarioId,
    ...designLabScenarioIds.filter((id) => id !== scenarioId),
  ];

  return (
    <header className={styles.labHeader}>
      <nav aria-label="Design-Lab-Abschnitte">
        <details className={styles.scenarioMenu}>
          <summary>
            <span>QA-Abschnitt</span>
            <strong>{scenario.label}</strong>
            <span className={styles.scenarioMenuIndicator} aria-hidden="true" />
          </summary>
          <ul>
            {scenarioMenuIds.map((id) => (
              <li key={id}>
                <a
                  href={designLabPathForScenario(id)}
                  aria-current={id === scenarioId ? 'page' : undefined}
                >
                  {scenarios[id].label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </nav>
    </header>
  );
}

function FictionalPageScene({ page }: { readonly page: FictionalPageSnapshot }) {
  return (
    <article className={styles.scene} aria-labelledby="fictional-page-title">
      <header className={styles.sceneHeader}>
        <div className={styles.fictionalIdentity}>
          <span className={styles.identityMark} aria-hidden="true">
            cr
          </span>
          <span>Campusraum</span>
        </div>
      </header>
      <div className={styles.sceneBody}>
        <section className={styles.sceneCopy}>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h2 id="fictional-page-title">{page.title}</h2>
          <p>{page.description}</p>
          <div
            className={styles.progress}
            role="progressbar"
            aria-label={`Schritt ${page.progressCurrent} von ${page.progressTotal}`}
            aria-valuemin={1}
            aria-valuemax={page.progressTotal}
            aria-valuenow={page.progressCurrent}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </div>
        </section>
        <aside className={styles.taskCard} aria-labelledby="task-card-title">
          <p className={styles.cardLabel}>{page.taskLabel}</p>
          <h3 id="task-card-title">{page.taskTitle}</h3>
          <ul>
            {page.taskItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className={styles.cardStatus}>
            <span aria-hidden="true">
              {page.progressCurrent} / {page.progressTotal}
            </span>
            <span>{page.progressStatus}</span>
          </span>
        </aside>
      </div>
    </article>
  );
}

function PassWoPlaceholder({ replayCount }: { readonly replayCount: number }) {
  return (
    <div
      key={replayCount}
      className={replayCount === 0 ? styles.passWo : `${styles.passWo} ${styles.passWoReplaying}`}
      role="img"
      aria-label="PassWo-Platzhalter in der Pose Erklären"
    >
      <span className={styles.passWoHalo} aria-hidden="true" />
      <span className={styles.passWoFace} aria-hidden="true">
        PW
      </span>
      <span className={styles.passWoBody} aria-hidden="true">
        <strong>PassWo</strong>
        <small>Pose: erklären</small>
      </span>
    </div>
  );
}

function createOverlayLayers(
  replayCount: number,
  onReplay: () => void,
  replayMessage: string,
): BrowserShellLayers {
  return {
    passWo: <PassWoPlaceholder replayCount={replayCount} />,
    speech: (
      <section
        className={styles.speechCard}
        aria-labelledby="passwo-speech-title"
        aria-describedby="passwo-speech-description"
      >
        <p className={styles.speechLabel}>Design-Lab-Platzhaltertext</p>
        <h2 id="passwo-speech-title">Ein Schritt nach dem anderen.</h2>
        <p id="passwo-speech-description">
          Dieser reproduzierbare Sprechschritt zeigt Position, Lesbarkeit und Layer-Reihenfolge.
        </p>
      </section>
    ),
    controls: (
      <fieldset className={styles.overlayControls}>
        <legend className={styles.screenReaderOnly}>PassWo-Steuerung</legend>
        <button type="button" onClick={onReplay}>
          Animation wiederholen
        </button>
        <button type="button" disabled aria-describedby="design-lab-next-reason">
          Weiter
        </button>
        <p id="design-lab-next-reason">Im Design Lab ist kein Trainingsablauf aktiv.</p>
        <span className={styles.screenReaderOnly} aria-live="polite">
          {replayMessage}
        </span>
      </fieldset>
    ),
  };
}

function waitForPreviewState(
  controller: PasswordModuleController,
  matches: (snapshot: PasswordModuleSnapshot) => boolean,
  signal: AbortSignal,
): Promise<void> {
  if (matches(controller.getSnapshot())) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let unsubscribe: () => void = () => undefined;
    const abort = () => {
      unsubscribe();
      reject(new Error('design-lab-preview-cancelled'));
    };
    unsubscribe = controller.subscribe((snapshot) => {
      if (!matches(snapshot)) return;
      signal.removeEventListener('abort', abort);
      unsubscribe();
      resolve();
    });
    signal.addEventListener('abort', abort, { once: true });
  });
}

function PasswordModuleSegmentPreview({
  segment,
  accountId,
  view,
  passwordOverrides,
}: {
  readonly segment: 's01' | 's03' | 's03-warning' | 's04' | 's05';
  readonly accountId: S01AccountId;
  readonly view: CampusWebsitePreviewView;
  readonly passwordOverrides: TrainingQaPasswordOverrides;
}) {
  const [controller, setController] = useState<PasswordModuleController | null>(null);
  const [snapshot, setSnapshot] = useState<PasswordModuleSnapshot | null>(null);
  const [preparationError, setPreparationError] = useState<string | null>(null);

  useEffect(() => {
    const previewController = new PasswordModuleController({
      accountIds: s01Content.browser.accounts.map(({ id }) => id),
    });
    const abortController = new AbortController();
    const unsubscribe = previewController.subscribe(setSnapshot);
    setController(previewController);
    setSnapshot(previewController.getSnapshot());
    setPreparationError(null);

    async function preparePreview(): Promise<void> {
      previewController.enterDisplayName('Vorschau');
      previewController.completeSectionTransition();
      previewController.completeS00();
      await waitForPreviewState(
        previewController,
        (currentSnapshot) => currentSnapshot.matches({ s01: 'editing' }),
        abortController.signal,
      );
      if (abortController.signal.aborted) return;
      previewController.selectAccount(accountId);
      if (segment === 's01') {
        if (view === 'dashboard') {
          previewController.setPasswordValue(
            accountId,
            passwordForAccount(accountId, passwordOverrides),
          );
          previewController.configureAccount(accountId);
        }
        return;
      }

      for (const accountId of previewController.getSnapshot().context.accountIds) {
        previewController.setPasswordValue(
          accountId,
          passwordForAccount(accountId as S01AccountId, passwordOverrides),
        );
        previewController.configureAccount(accountId);
      }
      previewController.closeS01Browser();
      previewController.continue();
      await waitForPreviewState(
        previewController,
        (currentSnapshot) => currentSnapshot.matches({ s02: 'active' }),
        abortController.signal,
      );
      if (abortController.signal.aborted) return;
      previewController.completeS02Content();
      previewController.continue();
      await waitForPreviewState(
        previewController,
        (currentSnapshot) => currentSnapshot.matches({ s03: 'active' }),
        abortController.signal,
      );
      if (abortController.signal.aborted) return;
      previewController.selectAccount(accountId);
      if (segment === 's03' && view === 'dashboard') {
        const password = previewController.getSnapshot().context.passwordValues[accountId] ?? '';
        previewController.setRetrievalPasswordValue(accountId, password);
        previewController.submitRetrievalLogin(accountId);
      }
      if (segment === 's03') return;

      for (const retrievalAccountId of previewController.getSnapshot().context.accountIds) {
        const password =
          previewController.getSnapshot().context.passwordValues[retrievalAccountId] ?? '';
        previewController.setRetrievalPasswordValue(retrievalAccountId, password);
        previewController.submitRetrievalLogin(retrievalAccountId);
      }
      previewController.continueS03CompletionFeedback();
      previewController.completeS03TimeLapse();
      if (segment === 's03-warning') return;

      previewController.openIncidentAccount('campusgram');
      await waitForPreviewState(
        previewController,
        (currentSnapshot) => currentSnapshot.matches({ s04: 'active' }),
        abortController.signal,
      );
    }

    void preparePreview().catch((error: unknown) => {
      if (abortController.signal.aborted) return;
      setPreparationError(error instanceof Error ? error.message : 'design-lab-preview-failed');
    });

    return () => {
      abortController.abort();
      unsubscribe();
      previewController.dispose();
    };
  }, [accountId, passwordOverrides, segment, view]);

  if (preparationError !== null) {
    return <p role="alert">QA-Abschnitt konnte nicht vorbereitet werden: {preparationError}</p>;
  }

  if (controller === null || snapshot === null) {
    return <p>QA-Abschnitt wird vorbereitet …</p>;
  }

  if (segment === 's01') {
    if (!snapshot.matches('s01')) return <p>QA-Abschnitt wird vorbereitet …</p>;
    return (
      <S01Training
        controller={controller}
        snapshot={snapshot}
        {...(view === 'auth' ? { initialAuthenticationAccountId: accountId } : {})}
      />
    );
  }
  if (segment === 's03' || segment === 's03-warning') {
    if (!snapshot.matches('s03')) return <p>QA-Abschnitt wird vorbereitet …</p>;
    return (
      <S03RetrievalTraining
        controller={controller}
        snapshot={snapshot}
        {...(view === 'auth' ? { initialLoginAccountId: accountId } : {})}
      />
    );
  }
  if (snapshot.matches('strengthTransition')) {
    return (
      <SectionTransition
        sectionLabel={s00Content.sectionTransition.label}
        title={s00Content.sectionTransition.title}
        currentSection={1}
        totalSections={3}
        parts={s00Content.sectionTransition.parts}
        currentPart={2}
        holdDurationMs={s00Content.sectionTransition.holdDurationMs}
        onComplete={() => controller.completeSectionTransition()}
      />
    );
  }
  if (snapshot.matches('s04')) {
    return <S04IncidentTraining controller={controller} snapshot={snapshot} />;
  }
  if ((segment === 's04' || segment === 's05') && snapshot.matches({ s05: 'active' })) {
    return (
      <S05DesignLabTraining
        fixtureId="common-suffix"
        initialSection="intro"
        {...(passwordOverrides.campusgram === undefined
          ? {}
          : { passwordOverride: passwordOverrides.campusgram })}
      />
    );
  }
  return <p>QA-Abschnitt wird vorbereitet …</p>;
}

export function DesignLab({ scenarioId }: { readonly scenarioId: DesignLabScenarioId }) {
  const passwordOverrides = useQaPasswordOverrides();
  const scenario = scenarios[scenarioId];
  const [activeTabScene, setActiveTabScene] = useState(preparationTabScene);
  const [replayCount, setReplayCount] = useState(0);
  const [replayMessage, setReplayMessage] = useState('');
  const snapshot: BrowserShellSnapshot = {
    ...activeTabScene.snapshot,
    dimmed: scenario.dimmed,
  };
  const layers = scenario.showPassWoOverlay
    ? createOverlayLayers(
        replayCount,
        () => {
          const nextReplayCount = replayCount + 1;
          setReplayCount(nextReplayCount);
          setReplayMessage(`Animation ${nextReplayCount} wird wiederholt.`);
        },
        replayMessage,
      )
    : undefined;

  if (scenarioId === 's00') {
    const campusWebsitePreview = readCampusWebsitePreview();
    const forceAnimationFailure =
      new URLSearchParams(window.location.search).get('animation') === 'fail';
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S00Training
            displayName="Vorschau"
            onComplete={() => undefined}
            forceAnimationFailure={forceAnimationFailure}
            previewAccountId={campusWebsitePreview.accountId}
          />
        </ArtifactPreview>
      </main>
    );
  }

  if (
    scenarioId === 's01' ||
    scenarioId === 's03' ||
    scenarioId === 's03-warning' ||
    scenarioId === 's04' ||
    scenarioId === 's05'
  ) {
    const campusWebsitePreview = readCampusWebsitePreview();
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <PasswordModuleSegmentPreview
            key={`${scenarioId}:${campusWebsitePreview.accountId}:${campusWebsitePreview.view}`}
            segment={scenarioId}
            accountId={campusWebsitePreview.accountId}
            view={campusWebsitePreview.view}
            passwordOverrides={passwordOverrides}
          />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's02-master-campus') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S02AccountExplorationTraining platform={readDesktopPlatform()} />
        </ArtifactPreview>
      </main>
    );
  }

  const s05Fixture = getS05DesignLabFixtureByRouteId(scenarioId);
  if (s05Fixture !== undefined) {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S05DesignLabTraining fixtureId={s05Fixture.id} />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's05-free-search') {
    return (
      <>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <main className={styles.trainingStage}>
          <S05DesignLabTraining fixtureId="common-suffix" initialSection="free-search" />
        </main>
      </>
    );
  }

  if (scenarioId === 's05-application-found' || scenarioId === 's05-application-protected') {
    return (
      <>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <main className={styles.trainingStage}>
          <S05DesignLabTraining
            fixtureId={scenarioId === 's05-application-found' ? 'common-suffix' : 'no-simple-component'}
            initialSection="application"
            platform={readDesktopPlatform()}
          />
        </main>
      </>
    );
  }

  const s06Fixture = getS06ConsequenceFixtureByRouteId(scenarioId);
  if (s06Fixture !== undefined) {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S06ConsequenceTraining source={{ kind: 'fixture', fixtureId: s06Fixture.id }} />
        </ArtifactPreview>
      </main>
    );
  }

  const s07Fixture = getS06PreparedS07EvaluationFixtureByRouteId(scenarioId);
  if (s07Fixture !== undefined) {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S07DesignLabTraining routeId={s07Fixture.routeId} />
        </ArtifactPreview>
      </main>
    );
  }

  function selectTab(tabId: string): void {
    const nextTabScene = tabScenes.find(({ snapshot }) => snapshot.activeTabId === tabId);
    if (nextTabScene !== undefined) setActiveTabScene(nextTabScene);
  }

  return (
    <main className={styles.labPage}>
      <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
      <ArtifactPreview>
        <BrowserShell
          snapshot={snapshot}
          ariaLabel={`Fiktive Browseranwendung, Szene ${scenario.label}`}
          onTabSelect={selectTab}
          {...(layers === undefined ? {} : { layers })}
        >
          <FictionalPageScene page={activeTabScene.page} />
        </BrowserShell>
      </ArtifactPreview>
    </main>
  );
}

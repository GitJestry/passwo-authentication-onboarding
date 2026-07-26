import {
  type DesignLabScenarioId,
  designLabPathForScenario,
  designLabScenarioIds,
} from '@passwo/contracts';
import {
  BrowserShell,
  type BrowserShellLayers,
  type BrowserShellSnapshot,
  type BrowserTabModel,
} from '@passwo/ui';
import { useState } from 'react';
import { S00Training } from '../features/training/S00Training.js';
import { S02AccountExplorationTraining } from '../features/training/segments/S02/S02AccountExplorationTraining.js';
import { S06ConsequenceTraining } from '../features/training/segments/S06/S06ConsequenceTraining.js';
import styles from './DesignLab.module.css';

interface DesignLabScenario {
  readonly label: string;
  readonly description: string;
  readonly dimmed: boolean;
  readonly showPassWoOverlay: boolean;
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
  's02-campus-id': {
    label: 'S02 Konten',
    description: 'Vollständige Kontenerkundung mit drei Konten und ihrem freien Fortschritt.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-identical': {
    label: 'S06 Gleich',
    description: 'Vorgegebenes Ergebnis: gleiches Passwort und direkter Angriffsweg.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-similar': {
    label: 'S06 Ähnlich',
    description: 'Vorgegebenes Ergebnis: ähnliche Struktur und betroffener Zugang.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-unique': {
    label: 'S06 Einzigartig',
    description: 'Vorgegebenes Ergebnis: Der dargestellte Angriffsweg ist blockiert.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-hypothetical': {
    label: 'S06 Hypothetisch',
    description: 'Dauerhaft als nicht reale Auswahl markiertes Gegenbeispiel.',
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
  return (
    <>
      <header className={styles.labHeader}>
        <div>
          <p className={styles.labEyebrow}>Deterministische Vorschau</p>
          <h1>BrowserShell Design Lab</h1>
        </div>
        <nav aria-label="Design-Lab-Szenen">
          {designLabScenarioIds.map((id) => (
            <a
              key={id}
              href={designLabPathForScenario(id)}
              aria-current={id === scenarioId ? 'page' : undefined}
            >
              {scenarios[id].label}
            </a>
          ))}
        </nav>
      </header>
      <p className={styles.scenarioDescription}>
        <strong>{scenario.label}:</strong> {scenario.description}
      </p>
    </>
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
        <span className={styles.fictionalBadge}>Fiktive Übungsseite</span>
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

export function DesignLab({ scenarioId }: { readonly scenarioId: DesignLabScenarioId }) {
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
    const forceAnimationFailure =
      new URLSearchParams(window.location.search).get('animation') === 'fail';
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <S00Training
          displayName="Vorschau"
          onComplete={() => undefined}
          forceAnimationFailure={forceAnimationFailure}
        />
      </main>
    );
  }

  if (scenarioId === 's02-campus-id') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <S02AccountExplorationTraining />
      </main>
    );
  }

  const s06Fixture = {
    's06-identical': 'identical',
    's06-similar': 'similar',
    's06-unique': 'unique',
    's06-hypothetical': 'hypothetical',
  } as const;
  if (scenarioId in s06Fixture) {
    const fixtureId = s06Fixture[scenarioId as keyof typeof s06Fixture];
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <S06ConsequenceTraining fixtureId={fixtureId} />
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
      <BrowserShell
        snapshot={snapshot}
        ariaLabel={`Fiktive Browseranwendung, Szene ${scenario.label}`}
        onTabSelect={selectTab}
        {...(layers === undefined ? {} : { layers })}
      >
        <FictionalPageScene page={activeTabScene.page} />
      </BrowserShell>
    </main>
  );
}

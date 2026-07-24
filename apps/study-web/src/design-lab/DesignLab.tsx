import {
  BrowserShell,
  type BrowserShellLayers,
  type BrowserShellSnapshot,
  type BrowserTabModel,
} from '@passwo/ui';
import { useState } from 'react';
import styles from './DesignLab.module.css';

const scenarioIds = ['normal', 'dimmed', 'passwo-overlay'] as const;
type DesignLabScenarioId = (typeof scenarioIds)[number];

interface DesignLabScenario {
  readonly label: string;
  readonly description: string;
  readonly snapshot: BrowserShellSnapshot;
}

const tabs: readonly BrowserTabModel[] = [
  {
    id: 'overview',
    label: 'Übersicht',
    status: 'complete',
    enabled: true,
  },
  {
    id: 'preparation',
    label: 'Vorbereitung',
    enabled: true,
  },
  {
    id: 'reflection',
    label: 'Reflexion',
    status: 'attention',
    disabledReason: 'In diesem Design-Lab-Snapshot nicht freigegeben.',
  },
];

const scenarios: Record<DesignLabScenarioId, DesignLabScenario> = {
  normal: {
    label: 'Normal',
    description: 'Browserbühne ohne Dimming oder zusätzliche Layer.',
    snapshot: {
      tabs,
      activeTabId: 'preparation',
      address: 'campus.example/vorbereitung',
      dimmed: false,
    },
  },
  dimmed: {
    label: 'Abgedunkelt',
    description: 'Seiteninhalt ist inaktiv und die Dimming-Schicht vollständig sichtbar.',
    snapshot: {
      tabs,
      activeTabId: 'preparation',
      address: 'campus.example/vorbereitung',
      dimmed: true,
    },
  },
  'passwo-overlay': {
    label: 'PassWo-Overlay',
    description: 'Dimming, PassWo-Platzhalter, Sprechschritt und Steuerung als feste Layer.',
    snapshot: {
      tabs,
      activeTabId: 'preparation',
      address: 'campus.example/vorbereitung',
      dimmed: true,
    },
  },
};

function resolveScenario(pathname: string): DesignLabScenarioId {
  const pathSegment = pathname.replace(/\/+$/, '').split('/').at(-1);
  return scenarioIds.find((scenarioId) => scenarioId === pathSegment) ?? 'normal';
}

function FictionalPageScene() {
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
          <p className={styles.eyebrow}>Vorbereitung</p>
          <h2 id="fictional-page-title">Eine Anmeldung in Ruhe vorbereiten</h2>
          <p>
            Diese fiktive Seite zeigt nur den visuellen Rahmen des späteren Trainings. Sie fragt
            weder nach einem Konto noch nach einem realen Passwort.
          </p>
          <div
            className={styles.progress}
            role="progressbar"
            aria-label="Schritt 1 von 3"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={1}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </div>
        </section>
        <aside className={styles.taskCard} aria-labelledby="task-card-title">
          <p className={styles.cardLabel}>Aktueller Schritt</p>
          <h3 id="task-card-title">Übungsrahmen kennenlernen</h3>
          <ul>
            <li>Die Adresse ist reine Darstellung.</li>
            <li>Nur freigegebene Tabs reagieren.</li>
            <li>Es werden keine Eingabewerte gespeichert.</li>
          </ul>
          <span className={styles.cardStatus}>
            <span aria-hidden="true">1 / 3</span>
            <span>Erster von drei Schritten</span>
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

export function DesignLab({ pathname = window.location.pathname }: { readonly pathname?: string }) {
  const scenarioId = resolveScenario(pathname);
  const scenario = scenarios[scenarioId];
  const [activeTabId, setActiveTabId] = useState(scenario.snapshot.activeTabId);
  const [replayCount, setReplayCount] = useState(0);
  const [replayMessage, setReplayMessage] = useState('');
  const snapshot: BrowserShellSnapshot = {
    ...scenario.snapshot,
    activeTabId,
  };
  const layers =
    scenarioId === 'passwo-overlay'
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

  return (
    <main className={styles.labPage}>
      <header className={styles.labHeader}>
        <div>
          <p className={styles.labEyebrow}>Deterministische Vorschau</p>
          <h1>BrowserShell Design Lab</h1>
        </div>
        <nav aria-label="Design-Lab-Szenen">
          {scenarioIds.map((id) => (
            <a
              key={id}
              href={`/design-lab/${id}`}
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
      <BrowserShell
        snapshot={snapshot}
        ariaLabel={`Fiktive Browseranwendung, Szene ${scenario.label}`}
        onTabSelect={setActiveTabId}
        {...(layers === undefined ? {} : { layers })}
      >
        <FictionalPageScene />
      </BrowserShell>
    </main>
  );
}

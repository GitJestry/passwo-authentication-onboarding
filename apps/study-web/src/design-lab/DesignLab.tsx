import {
  defaultTrainingQaPasswords,
  type DesignLabScenarioId,
  designLabPathForScenario,
  type TransientPasswordSemanticEvidence,
  type TrainingQaPasswordOverrides,
} from '@passwo/contracts';
import {
  getS05DesignLabFixture,
  getS05DesignLabFixtureByRouteId,
  getS06ConsequenceFixture,
  getS06ConsequenceFixtureByRouteId,
  type S06ConsequenceFixture,
  type S01AccountId,
  s00Content,
  s01AccountIds,
  s01Content,
} from '@passwo/training-content';
import {
  deriveCampusIdentity,
  PasswordModuleController,
  type PasswordModuleSnapshot,
} from '@passwo/training-engine';
import {
  ArtifactViewport,
  BrowserShell,
  type BrowserShellLayers,
  type BrowserShellSnapshot,
  type BrowserTabModel,
  type DesktopPlatform,
} from '@passwo/ui';
import type { NetworkSceneSnapshot } from '@passwo/visualization';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PasswordModuleTraining } from '../features/training/PasswordModuleTraining.js';
import { S00Training } from '../features/training/S00Training.js';
import { S01Training } from '../features/training/S01Training.js';
import { SectionTransition } from '../features/training/SectionTransition.js';
import { TrainingClipboardBoundary } from '../features/training/TrainingClipboardBoundary.js';
import { S02AccountExplorationTraining } from '../features/training/segments/S02/S02AccountExplorationTraining.js';
import { S03RetrievalTraining } from '../features/training/segments/S03/S03RetrievalTraining.js';
import { S04IncidentTraining } from '../features/training/segments/S04/S04IncidentTraining.js';
import {
  S06ConsequenceTraining,
  type S06ConsequenceSource,
} from '../features/training/segments/S06/S06ConsequenceTraining.js';
import {
  createS06ConsequenceScenePlan,
  createS06FixtureScenePlan,
  type S06ConsequenceAccountInputs,
} from '../features/training/segments/S06/S06ConsequenceController.js';
import { S07PassphraseSearchTraining } from '../features/training/segments/S07/S07PassphraseSearchTraining.js';
import {
  deriveS07AccountFeedback,
  s07RecommendedResolutionAccountIds,
  type S07AccountFeedback,
  type S07RemainingAccountId,
} from '../features/training/segments/S07/S07PassphraseSearchMachine.js';
import { S08NetworkRewindStage } from '../features/training/segments/S08/S08NetworkRewindStage.js';
import styles from './DesignLab.module.css';
import { S05DesignLabTraining } from './S05DesignLabTraining.js';

interface DesignLabScenario {
  readonly label: string;
  readonly description: string;
  readonly dimmed: boolean;
  readonly showPassWoOverlay: boolean;
}

interface DesignLabScenarioGroup {
  readonly label: string;
  readonly scenarioIds: readonly DesignLabScenarioId[];
}

const s05S06TransitionQaPassword = 'MeinStarkes!UniPasswortIchBinCool????';
const s05S06TransitionPersonalValue = 'UniPasswort';
const s05S06TransitionPersonalStart = s05S06TransitionQaPassword.indexOf(
  s05S06TransitionPersonalValue,
);
const s05S06TransitionInitialPersonalFindings = [
  {
    start: s05S06TransitionPersonalStart,
    end: s05S06TransitionPersonalStart + s05S06TransitionPersonalValue.length,
  },
] as const;
const s05S06TransitionInitialStructurePreset = {
  contentGroups: [[{ start: 4, end: 11 }, { start: 12, end: 23 }]],
  sentenceRuns: [
    { start: 0, end: 23 },
    { start: 23, end: 33 },
  ],
} as const;

function ArtifactPreview({ children }: { readonly children: ReactNode }) {
  return (
    <div className={styles.artifactPreview}>
      <TrainingClipboardBoundary allowCopy>
        <ArtifactViewport>{children}</ArtifactViewport>
      </TrainingClipboardBoundary>
    </div>
  );
}

function S07ToS09QaPreview({
  accountFeedback,
  campusgramPassword,
  initialStage = 's07',
  network,
  plan,
}: {
  readonly accountFeedback: readonly S07AccountFeedback[];
  readonly campusgramPassword: string;
  readonly initialStage?:
    | 's07'
    | 's08'
    | 's09'
    | 'manager'
    | 's13'
    | 's13-network'
    | 's13-bank';
  readonly network: NetworkSceneSnapshot | null;
  readonly plan: ReturnType<typeof createS06ConsequenceScenePlan>;
}) {
  const [stage, setStage] = useState<
    's07' | 's08' | 's09' | 'manager' | 's13' | 's13-network' | 's13-bank'
  >(initialStage);
  const [completedRecommendedAccountIds, setCompletedRecommendedAccountIds] = useState<
    readonly S07RemainingAccountId[] | null
  >(null);
  const platform = readDesktopPlatform();

  if (stage !== 's07') {
    return (
      <S08NetworkRewindStage
        displayName="Vorschau"
        recommendedAccountIds={
          completedRecommendedAccountIds ??
          s07RecommendedResolutionAccountIds(accountFeedback)
        }
        network={network}
        plan={plan}
        platform={platform}
        initialStage={stage}
      />
    );
  }

  return (
    <S07PassphraseSearchTraining
      accountFeedback={accountFeedback}
      campusgramPassword={campusgramPassword}
      displayName="Vorschau"
      onComplete={(recommendedAccountIds) => {
        setCompletedRecommendedAccountIds(recommendedAccountIds);
        setStage('s08');
      }}
      platform={platform}
    />
  );
}

function S06ToS07FixturePreview({ fixture }: { readonly fixture: S06ConsequenceFixture }) {
  const [stage, setStage] = useState<'s06' | 'transition' | 's07'>('s06');
  const [summaryNetwork, setSummaryNetwork] = useState<NetworkSceneSnapshot | null>(null);
  const plan = useMemo(() => createS06FixtureScenePlan(fixture.id), [fixture.id]);
  const accountFeedback = deriveS07AccountFeedback(plan);

  if (stage === 's06') {
    return (
      <S06ConsequenceTraining
        source={{ kind: 'fixture', fixtureId: fixture.id }}
        onComplete={() => setStage('transition')}
        onSummaryNetworkReady={setSummaryNetwork}
      />
    );
  }
  if (stage === 'transition') {
    return (
      <SectionTransition
        sectionLabel={s00Content.sectionTransition.label}
        title={
          s00Content.sectionTransition.parts[3]?.label ?? s00Content.sectionTransition.title
        }
        currentSection={1}
        totalSections={3}
        parts={s00Content.sectionTransition.parts}
        currentPart={4}
        holdDurationMs={s00Content.sectionTransition.holdDurationMs}
        onComplete={() => setStage('s07')}
      />
    );
  }
  return (
    <S07ToS09QaPreview
      accountFeedback={accountFeedback}
      campusgramPassword={fixture.accounts.campusgram.fictionalPassword}
      network={summaryNetwork ?? plan.steps.at(-1)?.network ?? null}
      plan={plan}
    />
  );
}

function S07DirectQaPreview({
  initialStage = 's07',
  passwordOverrides,
}: {
  readonly initialStage?:
    | 's07'
    | 's08'
    | 's09'
    | 'manager'
    | 's13'
    | 's13-network'
    | 's13-bank';
  readonly passwordOverrides: TrainingQaPasswordOverrides;
}) {
  const accounts = useMemo<S06ConsequenceAccountInputs>(() => {
    const identity = deriveCampusIdentity('Vorschau');
    return {
      'master-campus': {
        fictionalPassword: passwordForAccount('master-campus', passwordOverrides),
        retrievalStatus: 'retrievable',
        transientAccountIdentifiers: identity.assessmentTerms['master-campus'],
      },
      'campus-email': {
        fictionalPassword: passwordForAccount('campus-email', passwordOverrides),
        retrievalStatus: 'retrievable',
        transientAccountIdentifiers: identity.assessmentTerms['campus-email'],
      },
      campusgram: {
        fictionalPassword: passwordForAccount('campusgram', passwordOverrides),
        retrievalStatus: 'retrievable',
        transientAccountIdentifiers: identity.assessmentTerms.campusgram,
      },
    };
  }, [passwordOverrides]);
  const plan = useMemo(
    () => createS06ConsequenceScenePlan('design-lab-s07-to-s08', accounts),
    [accounts],
  );
  const accountFeedback = deriveS07AccountFeedback(plan);

  return (
    <S07ToS09QaPreview
      accountFeedback={accountFeedback}
      campusgramPassword={accounts.campusgram.fictionalPassword}
      initialStage={initialStage}
      network={plan.steps.at(-1)?.network ?? null}
      plan={plan}
    />
  );
}

function S08FixtureQaPreview({
  fixtureId,
}: {
  readonly fixtureId: S06ConsequenceFixture['id'];
}) {
  const fixture = getS06ConsequenceFixture(fixtureId);
  const plan = useMemo(() => createS06FixtureScenePlan(fixtureId), [fixtureId]);
  const accountFeedback = deriveS07AccountFeedback(plan);

  return (
    <S07ToS09QaPreview
      accountFeedback={accountFeedback}
      campusgramPassword={fixture.accounts.campusgram.fictionalPassword}
      initialStage="s08"
      network={plan.steps.at(-1)?.network ?? null}
      plan={plan}
    />
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
  'training-entry': {
    label: 's1.0 · Trainingseröffnung',
    description: 'PassWo-Vorstellung mit Betriebssystemwahl und fiktivem Benutzernamen.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  s00: {
    label: 's1.1 · Einstieg',
    description: 'Deterministische Vorschau des ersten Trainingssegments.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  s01: {
    label: 's1.2 · Kontoeinrichtung',
    description: 'Direkter QA-Einstieg in die fiktive Kontoeinrichtung.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's02-master-campus': {
    label: 's1.3 · Konten',
    description: 'Freie Kontowahl mit vollständigen geführten Vorschausequenzen pro Konto.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  s03: {
    label: 's1.4 · Anmeldeabruf',
    description: 'Direkter QA-Einstieg in den fiktiven Anmeldeabruf.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's03-warning': {
    label: 's1.5 · Warnung',
    description: 'Zeitraffer und klickgetriebene Campusgram-Warnung vor dem Segmentwechsel.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  s04: {
    label: 's1.6 · Datenleck',
    description: 'Datenleck-Erklärung innerhalb der fiktiven Campusgram-Website.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  s05: {
    label: 's1.7 · Übergang zur Analyse',
    description:
      'Vollständiger QA-Einstieg ab der Campusgram-Warnung bis in die naheliegenden Bestandteile.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-common-suffix': {
    label: 's1.8 · Kern + Anhang',
    description: 'Direkter QA-Einstieg bei den Bestandteilen mit häufigem Kern und Anhang.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-all-categories': {
    label: 's1.9 · Alle drei Prüfungen',
    description:
      'Direkter QA-Einstieg mit häufigem Bestandteil, Bezug zum Konto, Dienst oder Umfeld sowie Variante; die persönliche Einordnung erfolgt lokal im Ablauf.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-account-year': {
    label: 's1.10 · Konto + Jahr',
    description: 'Direkter QA-Einstieg bei den Bestandteilen mit Campusgram-Begriff und Jahr.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-no-simple-component': {
    label: 's1.11 · Kein Bestandteil-Treffer',
    description: 'Direkter QA-Einstieg bei den Bestandteilen ohne erkannten einfachen Treffer.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-structure-repetition': {
    label: 's1.12 · Aufbau: Wiederholung',
    description: 'Direkter QA-Einstieg beim Aufbau mit einem exakt wiederholten Bestandteil.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-structure-context': {
    label: 's1.13 · Aufbau: Kontext',
    description: 'Direkter QA-Einstieg beim Aufbau mit Campusgram-Kontext, Jahr und Anhang.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-structure-none': {
    label: 's1.14 · Aufbau: kein Weg',
    description: 'Direkter QA-Einstieg beim Aufbau ohne erkannten einfachen Zusammenhang.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-free-search': {
    label: 's1.15 · Alle Möglichkeiten',
    description: 'Direkter QA-Einstieg beim systematischen Durchprobieren aller Möglichkeiten.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-application-found': {
    label: 's1.16 · Abschluss: gefunden',
    description: 'Direkter QA-Einstieg in die rote geführte Campusgram-Abschlussszene.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-application-protected': {
    label: 's1.17 · Abschluss: blockiert',
    description: 'Direkter QA-Einstieg in die blaue Schild-Variante der Abschlussszene.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's05-s06-transition': {
    label: 's1.18 · Übergang zu Folgen',
    description:
      'QA-Einstieg beim S05-Abschluss mit PassWo, anschließender Übergangskarte und S06.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-reuse-and-derived': {
    label: 's1.19 · Wiederverwendung + Ableitung',
    description:
      'Campusgram wird gefunden, Master Campus konkret abgeleitet und Campus E-Mail exakt wiederverwendet.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-incident-not-found': {
    label: 's1.20 · Vorfall stoppt',
    description:
      'Campusgram wird nicht schnell gefunden; Master Campus wird anschließend hypothetisch nur gegen Campus E-Mail geprüft und auch dort bleibt der Weg blockiert.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-incident-found-blocked': {
    label: 's1.21 · Gefunden, Wege blockiert',
    description:
      'Campusgram wird gefunden; nach den blockierten Campusgram-Wegen wird Master Campus hypothetisch nur gegen Campus E-Mail geprüft und ebenfalls blockiert.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's06-mixed-actual-hypothetical': {
    label: 's1.22 · Gemischte Darstellung',
    description:
      'Campusgram läuft real; Master Campus wird lokal nicht erkannt und anschließend mit einer konkreten Suffixvariante zu Campus E-Mail hypothetisch geprüft.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's07-passphrase-search': {
    label: 's1.23 · Passphrase und Rücklauf',
    description:
      'Passphrase-Werkstatt mit anschließendem Übergang in die kontobezogenen S08-Aktionen und den Angriffsrücklauf.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's08-network-replay': {
    label: 's1.24 · Angriffsrücklauf',
    description:
      'Direkter QA-Einstieg bei den betroffenen Kontoknoten vor dem vollständig blockierten Angriffsrücklauf.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's08-strong-relations': {
    label: 's1.25 · Starke Beziehungsknoten',
    description:
      'Direkter S08-QA-Einstieg mit zwei starken blauen Konten und einer erkannten Ähnlichkeitsbeziehung; Campusgram bleibt geschützt.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's08-weak-mixed-relations': {
    label: 's1.26 · Schwach + gemischte Beziehungen',
    description:
      'Direkter S08-QA-Einstieg mit roten schwachen Konten sowie exakter Wiederverwendung und abgeleiteter Ähnlichkeit; Campusgram bleibt geschützt.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's09-password-manager-transition': {
    label: 's1.27 · Übergang zum Passwortmanager',
    description:
      'Direkter QA-Einstieg im geschützten S08-Netzwerk, das in S09 auf 80 Konten herauszoomt und über die Sektionskarte in die Passwortmanager-Bühne führt.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's2-1-password-manager-transition': {
    label: 's2.1 · Funktionen und Varianten',
    description:
      'Direkter QA-Einstieg in den Passwortmanager-Auftakt mit Sektionskarte, Tresor und Systemvergleich.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's2-2-my-shop-registration': {
    label: 's2.2 · My Shop registrieren',
    description:
      'Direkter lokaler QA- und Resume-Einstieg in S13 beim leeren My-Shop-Registrierungsformular.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's2-3-password-manager-network': {
    label: 's2.3 · Konto im Netzwerk',
    description:
      'Direkter QA-Einstieg in den Netzwerktransfer mit My-Shop-Reveal, Schutzverbindungen und Muster Bank.',
    dimmed: false,
    showPassWoOverlay: false,
  },
  's2-4-muster-bank-login': {
    label: 's2.4 · Muster Bank anmelden',
    description:
      'Direkter lokaler QA- und Resume-Einstieg in S13 bei der Anmeldung am Muster-Bank-Konto.',
    dimmed: false,
    showPassWoOverlay: false,
  },
};

const scenarioGroups = [
  {
    label: 'Browserzustände',
    scenarioIds: ['normal', 'dimmed', 'passwo-overlay'],
  },
  {
    label: 'Passwörter · s1.x Einstieg',
    scenarioIds: [
      'training-entry',
      's00',
      's01',
      's02-master-campus',
      's03',
      's03-warning',
      's04',
    ],
  },
  { label: 'Passwörter · s1.x Analyseübergang', scenarioIds: ['s05'] },
  {
    label: 'Passwörter · s1.x Bestandteile',
    scenarioIds: [
      's05-common-suffix',
      's05-all-categories',
      's05-account-year',
      's05-no-simple-component',
    ],
  },
  {
    label: 'Passwörter · s1.x Aufbau',
    scenarioIds: ['s05-structure-repetition', 's05-structure-context', 's05-structure-none'],
  },
  { label: 'Passwörter · s1.x Prüfung', scenarioIds: ['s05-free-search'] },
  {
    label: 'Passwörter · s1.x Abschluss',
    scenarioIds: ['s05-application-found', 's05-application-protected'],
  },
  { label: 'Passwörter · s1.x Folgenübergang', scenarioIds: ['s05-s06-transition'] },
  {
    label: 'Passwörter · s1.x Folgen und Rücklauf',
    scenarioIds: [
      's06-reuse-and-derived',
      's06-incident-not-found',
      's06-incident-found-blocked',
      's06-mixed-actual-hypothetical',
      's07-passphrase-search',
      's08-network-replay',
      's08-strong-relations',
      's08-weak-mixed-relations',
      's09-password-manager-transition',
    ],
  },
  {
    label: 'Passwortmanager · s2.x',
    scenarioIds: [
      's2-1-password-manager-transition',
      's2-2-my-shop-registration',
      's2-3-password-manager-network',
      's2-4-muster-bank-login',
    ],
  },
] as const satisfies readonly DesignLabScenarioGroup[];

function DesignLabIntroduction({
  scenarioId,
  scenario,
}: {
  readonly scenarioId: DesignLabScenarioId;
  readonly scenario: DesignLabScenario;
}) {
  return (
    <header className={styles.labHeader}>
      <nav aria-label="Design-Lab-Abschnitte">
        <details className={styles.scenarioMenu}>
          <summary>
            <span>QA-Abschnitt</span>
            <strong>{scenario.label}</strong>
            <span className={styles.scenarioMenuIndicator} aria-hidden="true" />
          </summary>
          <ul className={styles.scenarioMenuList}>
            {scenarioGroups.map((group) => (
              <li className={styles.scenarioMenuGroup} key={group.label}>
                <span className={styles.scenarioMenuGroupLabel}>{group.label}</span>
                <ul className={styles.scenarioMenuItems}>
                  {group.scenarioIds.map((id) => (
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

function s06SourceForPreview(
  snapshot: PasswordModuleSnapshot,
  semanticEvidenceByAccount: Readonly<
    Partial<Record<S01AccountId, TransientPasswordSemanticEvidence>>
  >,
): S06ConsequenceSource | null {
  const assessmentTerms = deriveCampusIdentity('Vorschau').assessmentTerms;
  const accountInput = (accountId: S01AccountId) => {
    const fictionalPassword = snapshot.context.passwordValues[accountId];
    const retrievalStatus = snapshot.context.retrievalResults[accountId];
    if (
      fictionalPassword === undefined ||
      fictionalPassword.length === 0 ||
      retrievalStatus === undefined ||
      retrievalStatus === 'pending'
    ) {
      return null;
    }
    return {
      fictionalPassword,
      retrievalStatus,
      transientAccountIdentifiers: assessmentTerms[accountId],
      ...(semanticEvidenceByAccount[accountId] === undefined
        ? {}
        : { semanticEvidence: semanticEvidenceByAccount[accountId] }),
    };
  };
  const masterCampus = accountInput('master-campus');
  const campusEmail = accountInput('campus-email');
  const campusgram = accountInput('campusgram');
  if (masterCampus === null || campusEmail === null || campusgram === null) return null;
  return {
    kind: 'runtime',
    accounts: {
      'master-campus': masterCampus,
      'campus-email': campusEmail,
      campusgram,
    },
  };
}

function PasswordModuleSegmentPreview({
  segment,
  accountId,
  view,
  passwordOverrides,
}: {
  readonly segment:
    | 's01'
    | 's03'
    | 's03-warning'
    | 's04'
    | 's05'
    | 's05-s06-transition'
    | 's05-application-found'
    | 's05-application-protected';
  readonly accountId: S01AccountId;
  readonly view: CampusWebsitePreviewView;
  readonly passwordOverrides: TrainingQaPasswordOverrides;
}) {
  const [controller, setController] = useState<PasswordModuleController | null>(null);
  const [snapshot, setSnapshot] = useState<PasswordModuleSnapshot | null>(null);
  const [preparationError, setPreparationError] = useState<string | null>(null);
  const [semanticEvidenceByAccount, setSemanticEvidenceByAccount] = useState<
    Partial<Record<S01AccountId, TransientPasswordSemanticEvidence>>
  >({});
  const continuesThroughS06 =
    segment === 's05-s06-transition' ||
    segment === 's05-application-found' ||
    segment === 's05-application-protected';
  const completeS05 = useCallback(() => controller?.completeS05(), [controller]);
  const completeS06 = useCallback(() => controller?.completeS06(), [controller]);
  const captureCampusgramSemanticEvidence = useCallback(
    (evidence: TransientPasswordSemanticEvidence) => {
      if (!evidence.confirmed) return;
      setSemanticEvidenceByAccount((current) => ({ ...current, campusgram: evidence }));
    },
    [],
  );
  const s06Source = useMemo(
    () =>
      snapshot === null
        ? null
        : s06SourceForPreview(snapshot, semanticEvidenceByAccount),
    [semanticEvidenceByAccount, snapshot],
  );

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
        const fixturePassword =
          segment === 's05-s06-transition' && accountId === 'campusgram'
            ? s05S06TransitionQaPassword
            : (segment === 's05' || continuesThroughS06) && accountId === 'campusgram'
            ? getS05DesignLabFixture(
                segment === 's05-application-protected'
                  ? 'no-simple-component'
                  : 'common-suffix',
              ).fictionalPassword
            : undefined;
        previewController.setPasswordValue(
          accountId,
          segment === 's05-s06-transition' && accountId === 'campusgram'
            ? (fixturePassword ?? defaultTrainingQaPasswords.campusgram)
            : passwordOverrides[accountId as S01AccountId] ??
                fixturePassword ??
                defaultTrainingQaPasswords[accountId as S01AccountId],
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
      if (!continuesThroughS06) return;

      previewController.completeS04();
      await waitForPreviewState(
        previewController,
        (currentSnapshot) => currentSnapshot.matches('strengthTransition'),
        abortController.signal,
      );
      if (abortController.signal.aborted) return;
      previewController.completeSectionTransition();
      await waitForPreviewState(
        previewController,
        (currentSnapshot) => currentSnapshot.matches({ s05: 'active' }),
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
  }, [accountId, continuesThroughS06, passwordOverrides, segment, view]);

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
  if (snapshot.matches('uniquenessTransition')) {
    return (
      <SectionTransition
        sectionLabel={s00Content.sectionTransition.label}
        title={s00Content.sectionTransition.title}
        currentSection={1}
        totalSections={3}
        parts={s00Content.sectionTransition.parts}
        currentPart={3}
        holdDurationMs={s00Content.sectionTransition.holdDurationMs}
        onComplete={() => controller.completeSectionTransition()}
      />
    );
  }
  if (snapshot.matches('s04')) {
    return <S04IncidentTraining controller={controller} snapshot={snapshot} />;
  }
  if (
    (segment === 's04' || segment === 's05' || continuesThroughS06) &&
    snapshot.matches({ s05: 'active' })
  ) {
    const usesS118Default = segment === 's05-s06-transition';
    const applicationPasswordOverride =
      usesS118Default
        ? s05S06TransitionQaPassword
        : passwordOverrides.campusgram ??
          (segment === 's05-application-protected'
        ? getS05DesignLabFixture('no-simple-component').fictionalPassword
        : continuesThroughS06
          ? getS05DesignLabFixture('common-suffix').fictionalPassword
          : undefined);
    return (
      <S05DesignLabTraining
        fixtureId="common-suffix"
        initialSection={continuesThroughS06 ? 'application' : 'intro'}
        {...(applicationPasswordOverride === undefined
          ? {}
          : { passwordOverride: applicationPasswordOverride })}
        {...(!usesS118Default
          ? {}
          : {
              initialPersonalFindings: s05S06TransitionInitialPersonalFindings,
              initialStructurePreset: s05S06TransitionInitialStructurePreset,
            })}
        {...(segment === 's05' || continuesThroughS06
          ? { onComplete: completeS05 }
          : {})}
        {...(segment === 's05-s06-transition'
          ? { onSemanticEvidenceChange: captureCampusgramSemanticEvidence }
          : {})}
      />
    );
  }
  if (
    (segment === 's05' || continuesThroughS06) &&
    snapshot.matches({ s06: 'active' })
  ) {
    if (s06Source === null) {
      return <p role="alert">S06-QA-Daten sind unvollständig.</p>;
    }
    return (
      <S06ConsequenceTraining
        source={s06Source}
        onComplete={completeS06}
      />
    );
  }
  if (snapshot.matches('changeTransition')) {
    return (
      <SectionTransition
        sectionLabel={s00Content.sectionTransition.label}
        title={s00Content.sectionTransition.parts[3]?.label ?? s00Content.sectionTransition.title}
        currentSection={1}
        totalSections={3}
        parts={s00Content.sectionTransition.parts}
        currentPart={4}
        holdDurationMs={s00Content.sectionTransition.holdDurationMs}
        onComplete={() => controller.completeSectionTransition()}
      />
    );
  }
  if (segment === 's05-s06-transition' && snapshot.matches({ s07: 'active' })) {
    return (
      <S07PassphraseSearchTraining
        campusgramPassword={snapshot.context.passwordValues.campusgram ?? ''}
        displayName={snapshot.context.displayName ?? ''}
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

  if (scenarioId === 'training-entry') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <PasswordModuleTraining />
        </ArtifactPreview>
      </main>
    );
  }

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
    scenarioId === 's05' ||
    scenarioId === 's05-s06-transition' ||
    scenarioId === 's05-application-found' ||
    scenarioId === 's05-application-protected'
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
  const s05DirectEntry =
    s05Fixture !== undefined
      ? ({ fixtureId: s05Fixture.id } as const)
      : scenarioId === 's05-free-search'
        ? ({ fixtureId: 'common-suffix', initialSection: 'free-search' } as const)
        : undefined;

  if (s05DirectEntry !== undefined) {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S05DesignLabTraining {...s05DirectEntry} platform={readDesktopPlatform()} />
        </ArtifactPreview>
      </main>
    );
  }

  const s06Fixture = getS06ConsequenceFixtureByRouteId(scenarioId);
  if (s06Fixture !== undefined) {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S06ToS07FixturePreview fixture={s06Fixture} />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's07-passphrase-search') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S07DirectQaPreview passwordOverrides={passwordOverrides} />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's08-network-replay') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S07DirectQaPreview initialStage="s08" passwordOverrides={passwordOverrides} />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's08-strong-relations') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S08FixtureQaPreview fixtureId="mixed-actual-hypothetical" />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's08-weak-mixed-relations') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S08FixtureQaPreview fixtureId="reuse-and-derived" />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's09-password-manager-transition') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S07DirectQaPreview initialStage="s09" passwordOverrides={passwordOverrides} />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's2-1-password-manager-transition') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S07DirectQaPreview
            initialStage="manager"
            passwordOverrides={passwordOverrides}
          />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's2-2-my-shop-registration') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S07DirectQaPreview initialStage="s13" passwordOverrides={passwordOverrides} />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's2-3-password-manager-network') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S07DirectQaPreview
            initialStage="s13-network"
            passwordOverrides={passwordOverrides}
          />
        </ArtifactPreview>
      </main>
    );
  }

  if (scenarioId === 's2-4-muster-bank-login') {
    return (
      <main className={styles.labPage}>
        <DesignLabIntroduction scenarioId={scenarioId} scenario={scenario} />
        <ArtifactPreview>
          <S07DirectQaPreview
            initialStage="s13-bank"
            passwordOverrides={passwordOverrides}
          />
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

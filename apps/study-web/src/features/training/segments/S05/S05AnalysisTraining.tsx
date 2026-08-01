import type { PasswordSingleFindingKind, RuntimeStructureFindingKind } from '@passwo/contracts';
import {
  type S05DesignLabFixture,
  type S05DesignLabFixtureId,
  getS05DesignLabFixture,
  s05Content,
} from '@passwo/training-content';
import { type BrowserShellSnapshot, BrowserShell } from '@passwo/ui';
import type {
  PasswordCandidateSceneSnapshot,
  PasswordFindingSceneSnapshot,
  PasswordStructureSceneSnapshot,
} from '@passwo/visualization';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  type S05AnalysisControllerSnapshot,
  S05AnalysisController,
} from './S05AnalysisController.js';
import { S05AnimationAdapter } from './S05AnimationAdapter.js';
import styles from './S05AnalysisTraining.module.css';

const browserSnapshot: BrowserShellSnapshot = {
  tabs: [s05Content.browser.tab],
  activeTabId: s05Content.browser.tab.id,
  address: s05Content.browser.address,
};

function findingLabel(kind: PasswordSingleFindingKind): string {
  return s05Content.findingLabels[kind];
}

function CandidateScene({ scene }: { readonly scene: PasswordCandidateSceneSnapshot }) {
  return (
    <div className={styles.sceneGrid} aria-label={scene.accessibleSummary}>
      <section className={styles.candidatePanel}>
        <h2>{s05Content.intro.title}</h2>
        <p>{s05Content.intro.explanation}</p>
        <div className={styles.candidateStream} aria-label="Authored Kandidaten">
          {scene.candidates.map((candidate) => (
            <code key={candidate.id}>{candidate.candidate}</code>
          ))}
        </div>
        <div className={styles.marker} data-s05-target="candidate-marker">
          <span aria-hidden="true">→</span>
          <strong>{s05Content.intro.markerLabel}</strong>
        </div>
      </section>
      <section className={styles.searchComparison}>
        <article>
          <h3>{s05Content.intro.freeSearchLabel}</h3>
          <p>{s05Content.intro.freeSearchBody}</p>
        </article>
        <article>
          <h3>{s05Content.intro.likelyLabel}</h3>
          <p>{s05Content.intro.likelyBody}</p>
        </article>
        <p className={styles.theoryNotice}>{s05Content.theoreticalSearchSpace.notice}</p>
      </section>
    </div>
  );
}

function FindingScene({
  fixture,
  scene,
}: {
  readonly fixture: S05DesignLabFixture;
  readonly scene: PasswordFindingSceneSnapshot;
}) {
  return (
    <div className={styles.findingWorkspace}>
      <section className={styles.demonstrations} aria-label="Authored Demonstrationen">
        {s05Content.componentDemonstrations.map((demonstration) => (
          <article key={demonstration.id}>
            <h3>{demonstration.title}</h3>
            <p className={styles.exampleLine}>{demonstration.examples.join(' · ')}</p>
            <p>{demonstration.note}</p>
          </article>
        ))}
      </section>
      <aside className={styles.resultCard} data-s05-target="analysis-result">
        <p className={styles.cardLabel}>{fixture.label}</p>
        <h2>{s05Content.result.title}</h2>
        <code className={styles.fixturePassword}>{fixture.fictionalPassword}</code>
        <ol>
          {scene.prioritizedFindings.map((finding) => (
            <li key={finding.id}>
              <strong>{findingLabel(finding.kind)}</strong>
              {finding.evidence.length === 0 ? null : (
                <span>{finding.evidence.map(({ token }) => token).join(', ')}</span>
              )}
            </li>
          ))}
        </ol>
        <p>{s05Content.result.boundedNotice}</p>
      </aside>
    </div>
  );
}

function structureFindingLabel(kind: RuntimeStructureFindingKind): string {
  return s05Content.structure.findingLabels[kind];
}

function FictionalPasswordWithEvidence({
  password,
  scene,
}: {
  readonly password: string;
  readonly scene: PasswordStructureSceneSnapshot;
}) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const span of scene.highlightedSpans) {
    if (cursor < span.start) {
      parts.push(<span key={`plain-${cursor}`}>{password.slice(cursor, span.start)}</span>);
    }
    parts.push(
      <mark key={`evidence-${span.start}-${span.end}`}>
        {password.slice(span.start, span.end)}
      </mark>,
    );
    cursor = span.end;
  }
  if (cursor < password.length) {
    parts.push(<span key={`plain-${cursor}`}>{password.slice(cursor)}</span>);
  }
  return <code className={styles.structuredPassword}>{parts}</code>;
}

function StructureDemonstrationScene({
  snapshot,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
}) {
  const scene = snapshot.structureScene;
  const demonstration = scene?.authoredDemonstrations.find(
    ({ id }) => id === `s05-${snapshot.step}`,
  );
  if (scene === null || scene === undefined || demonstration === undefined) return null;
  return (
    <div
      className={styles.structureWorkspace}
      aria-label={`${demonstration.title}. ${demonstration.passWoExplanation}`}
    >
      <section className={styles.passWoExplanation}>
        <p className={styles.cardLabel}>PassWo erklärt</p>
        <p>{demonstration.passWoExplanation}</p>
      </section>
      <article
        className={styles.structureDemonstration}
        data-s05-target={snapshot.step}
        aria-label={`${demonstration.title}, feste Demonstration`}
      >
        <p className={styles.authoredBadge}>Feste Demonstration</p>
        <h2>{demonstration.title}</h2>
        <div className={styles.structureTokens} aria-label={demonstration.tokens.join(', ')}>
          {demonstration.tokens.map((token, index) => (
            <span key={`${token}-${index}`}>{token}</span>
          ))}
        </div>
        <strong className={styles.connectionLabel}>{demonstration.connectionLabel}</strong>
        <p className={styles.boundaryNote}>{demonstration.boundaryNote}</p>
      </article>
    </div>
  );
}

function StructureApplicationScene({
  fixture,
  scene,
}: {
  readonly fixture: S05DesignLabFixture;
  readonly scene: PasswordStructureSceneSnapshot;
}) {
  const noSimpleStructure =
    scene.prioritizedRuntimeFindings.length === 1 &&
    scene.prioritizedRuntimeFindings[0]?.findingKind === 'no-simple-structure-recognized';
  return (
    <div className={styles.structureWorkspace} aria-label={scene.accessibleSummary}>
      <section className={styles.passWoExplanation}>
        <p className={styles.cardLabel}>PassWo erklärt</p>
        <p>
          {noSimpleStructure
            ? s05Content.structure.application.noneExplanation
            : s05Content.structure.application.recognizedExplanation}
        </p>
      </section>
      <article className={styles.structureResult} data-s05-target="structure-application">
        <p className={styles.cardLabel}>Laufzeitbefund · fiktives Passwort</p>
        <h2>{s05Content.structure.application.title}</h2>
        <FictionalPasswordWithEvidence password={fixture.fictionalPassword} scene={scene} />
        <ol>
          {scene.prioritizedRuntimeFindings.map((finding) => (
            <li key={finding.id}>
              <strong>{structureFindingLabel(finding.findingKind)}</strong>
              {finding.evidence.length === 0 ? null : (
                <span>{finding.evidence.map(({ token }) => token).join(' · ')}</span>
              )}
            </li>
          ))}
        </ol>
        <p>{s05Content.structure.application.boundedNotice}</p>
      </article>
    </div>
  );
}

export function S05AnalysisTraining({ fixture }: { readonly fixture: S05DesignLabFixture }) {
  const hostRef = useRef<HTMLElement | null>(null);
  const [controller, setController] = useState<S05AnalysisController | null>(null);
  const [snapshot, setSnapshot] = useState<S05AnalysisControllerSnapshot | null>(null);

  useEffect(() => {
    const animationPlayer = new S05AnimationAdapter({
      getElement: (targetId) =>
        hostRef.current?.querySelector<HTMLElement>(`[data-s05-target="${targetId}"]`) ?? null,
      prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    const nextController = new S05AnalysisController({
      fixture,
      animationPlayer,
    });
    const unsubscribe = nextController.subscribe(setSnapshot);
    setController(nextController);
    setSnapshot(nextController.getSnapshot());
    return () => {
      unsubscribe();
      void nextController.dispose();
    };
  }, [fixture]);

  if (controller === null || snapshot === null) return null;

  return (
    <section ref={hostRef} className={styles.training} aria-label={s05Content.trainingAriaLabel}>
      <BrowserShell
        snapshot={browserSnapshot}
        ariaLabel={s05Content.browser.ariaLabel}
        onTabSelect={() => undefined}
      >
        <article className={styles.page} aria-labelledby="s05-title">
          <header className={styles.pageHeader}>
            <div>
              <p className={styles.eyebrow}>{s05Content.page.eyebrow}</p>
              <h1 id="s05-title">{s05Content.page.title}</h1>
            </div>
            <span className={styles.fixtureNotice}>{s05Content.page.fixtureNotice}</span>
          </header>
          <div className={styles.content} aria-live="polite">
            {snapshot.step === 'candidate-check' && snapshot.candidateScene !== null ? (
              <CandidateScene scene={snapshot.candidateScene} />
            ) : snapshot.step === 'component-analysis' && snapshot.findingScene !== null ? (
              <FindingScene fixture={fixture} scene={snapshot.findingScene} />
            ) : snapshot.step === 'structure-application' && snapshot.structureScene !== null ? (
              <StructureApplicationScene fixture={fixture} scene={snapshot.structureScene} />
            ) : (
              <StructureDemonstrationScene snapshot={snapshot} />
            )}
          </div>
          <footer className={styles.controls}>
            <button
              type="button"
              disabled={!snapshot.controls.canStart}
              onClick={() => controller.start()}
            >
              {s05Content.page.start}
            </button>
            <button
              type="button"
              disabled={!snapshot.controls.canReplay}
              onClick={() => controller.replay()}
            >
              {s05Content.page.replay}
            </button>
            <button
              type="button"
              disabled={!snapshot.controls.canContinue}
              onClick={() => controller.continue()}
            >
              {s05Content.page.continue}
            </button>
          </footer>
        </article>
      </BrowserShell>
    </section>
  );
}

export function S05DesignLabTraining({ fixtureId }: { readonly fixtureId: S05DesignLabFixtureId }) {
  const fixture = getS05DesignLabFixture(fixtureId);
  return <S05AnalysisTraining fixture={fixture} />;
}

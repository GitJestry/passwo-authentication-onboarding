import { describe, expect, it } from 'vitest';
import {
  getS06ConsequenceAnimation,
  getS06ConsequenceResultContent,
  S06_CONSEQUENCE_CONTENT_VERSION,
  s06ConsequenceContent,
} from './s06.js';

describe('S06 consequence content', () => {
  it('traces the authored fixture slice to the requested script pages', () => {
    expect(s06ConsequenceContent.version).toBe(S06_CONSEQUENCE_CONTENT_VERSION);
    expect(s06ConsequenceContent.source.internalPages).toEqual([36, 37, 38, 39, 40]);
    expect(s06ConsequenceContent.segment).toEqual({
      id: 'S06',
      sectionId: 'passwords',
      slice: 'consequence-comparison',
    });
  });

  it('provides exactly four deterministic authored results without analysis logic', () => {
    expect(
      s06ConsequenceContent.fixtures.map(({ id, resultKey, analysis }) => ({
        id,
        resultKey,
        source: analysis.source,
        outcome: analysis.outcome,
        context: analysis.context,
      })),
    ).toEqual([
      {
        id: 'identical',
        resultKey: 'equal',
        source: 'authored-fixture',
        outcome: 'identical',
        context: 'actual-selection',
      },
      {
        id: 'similar',
        resultKey: 'similar',
        source: 'authored-fixture',
        outcome: 'similar',
        context: 'actual-selection',
      },
      {
        id: 'unique',
        resultKey: 'unique',
        source: 'authored-fixture',
        outcome: 'unique',
        context: 'actual-selection',
      },
      {
        id: 'hypothetical',
        resultKey: 'hypothetical',
        source: 'authored-fixture',
        outcome: 'identical',
        context: 'hypothetical-example',
      },
    ]);
  });

  it('provides the expected German participant content for every typed result key', () => {
    expect(getS06ConsequenceResultContent('equal')).toMatchObject({
      comparisonTitle: 'Vergleich mit CampusID',
      semantic: { emphasis: 'danger', symbol: '⚠' },
      explanations: {
        complete: {
          body: '⚠ Gleiches Passwort: Der Zugang zum Zielkonto ist in dieser Szene betroffen.',
        },
      },
    });
    expect(getS06ConsequenceResultContent('similar')).toMatchObject({
      comparisonTitle: 'Vergleich mit CampusMail',
      semantic: { emphasis: 'warning', symbol: '≈' },
      explanations: {
        complete: {
          body: '≈ Ähnliche Struktur: Der Zugang zum Zielkonto ist in dieser Szene betroffen.',
          listItems: ['Gemeinsamer Kern', 'Ähnlicher Aufbau'],
        },
      },
    });
    expect(getS06ConsequenceResultContent('unique')).toMatchObject({
      semantic: { emphasis: 'positive', symbol: '🛡' },
      explanations: {
        complete: {
          body: 'Dieser Angriffsweg ist blockiert. Die Aussage gilt nur für diesen dargestellten Weg.',
        },
      },
    });
    expect(getS06ConsequenceResultContent('hypothetical')).toMatchObject({
      hypotheticalNotice: 'Hypothetisches Beispiel — nicht deine Auswahl',
      semantic: { emphasis: 'info', symbol: '◇' },
      explanations: {
        complete: {
          body: 'Dieses direkte Ergebnis gehört nur zum hypothetischen Gegenbeispiel und nicht zu einer realen Auswahl.',
        },
      },
    });
  });

  it('keeps all comparison sequences deterministic and reduced-motion complete', () => {
    for (const fixture of s06ConsequenceContent.fixtures) {
      const animation = getS06ConsequenceAnimation(fixture.animationId);
      expect(animation?.steps).toHaveLength(1);
      expect(animation?.reducedMotion).toEqual({
        strategy: 'instant-end-state',
        maxDurationMs: 0,
      });
    }
  });

  it('uses the required bounded shield language without an account-wide guarantee', () => {
    expect(s06ConsequenceContent.scene.labels.blocked).toBe('Dieser Angriffsweg ist blockiert');
    expect(JSON.stringify(s06ConsequenceContent)).not.toMatch(
      /vollständig sicher|absolut sicher/iu,
    );
  });

  it('gives every emphasis a textual symbol and label in addition to any color treatment', () => {
    expect(Object.values(s06ConsequenceContent.results).map(({ semantic }) => semantic)).toEqual([
      { emphasis: 'danger', symbol: '⚠', label: 'Direkter Weg · gleiches Passwort' },
      { emphasis: 'warning', symbol: '≈', label: 'Ähnliche Struktur · gestrichelter Weg' },
      { emphasis: 'positive', symbol: '🛡', label: 'Blockierter Weg · Schutzschild' },
      { emphasis: 'info', symbol: '◇', label: 'Hypothetischer Weg · nicht reale Auswahl' },
    ]);
  });
});

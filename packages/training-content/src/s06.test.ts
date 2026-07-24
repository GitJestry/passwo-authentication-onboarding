import { describe, expect, it } from 'vitest';
import {
  getS06ConsequenceAnimation,
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
      s06ConsequenceContent.fixtures.map(({ id, analysis }) => ({
        id,
        source: analysis.source,
        outcome: analysis.outcome,
        context: analysis.context,
      })),
    ).toEqual([
      {
        id: 'identical',
        source: 'authored-fixture',
        outcome: 'identical',
        context: 'actual-selection',
      },
      {
        id: 'similar',
        source: 'authored-fixture',
        outcome: 'similar',
        context: 'actual-selection',
      },
      {
        id: 'unique',
        source: 'authored-fixture',
        outcome: 'unique',
        context: 'actual-selection',
      },
      {
        id: 'hypothetical',
        source: 'authored-fixture',
        outcome: 'identical',
        context: 'hypothetical-example',
      },
    ]);
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
});

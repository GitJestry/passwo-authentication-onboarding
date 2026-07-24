import type { AuthoredPasswordComparisonResult } from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import {
  createPasswordConsequenceScene,
  type PasswordConsequenceSceneDefinition,
  transitionPasswordConsequenceScene,
} from './password-consequence-scene.js';

function createDefinition(
  analysis: AuthoredPasswordComparisonResult,
): PasswordConsequenceSceneDefinition {
  return {
    id: analysis.fixtureId,
    analysis,
    animationId: `${analysis.fixtureId}-animation`,
    sourceAccount: { label: 'CampusBoard', position: { x: 0.06, y: 0.32 } },
    targetAccount: { label: 'CampusMail', position: { x: 0.72, y: 0.32 } },
    shieldPosition: { x: 0.5, y: 0.32 },
    structurePosition: { x: 0.36, y: 0.7 },
    hypotheticalPosition: { x: 0.31, y: 0.02 },
    labels: {
      sourceKnown: 'Passwort bekannt',
      targetReady: 'Vergleich bereit',
      comparing: 'Vergleich läuft',
      identical: '⚠ Gleiches Passwort · Zugang betroffen',
      similar: '≈ Ähnliche Struktur · Zugang betroffen',
      unique: 'Keine ableitbare Verbindung',
      blocked: 'Dieser Angriffsweg ist blockiert',
      structure: 'Gemeinsame Struktur',
      structureDescription: 'Gemeinsamer Kern · ähnlicher Aufbau',
      hypothetical: 'Hypothetisches Beispiel — nicht deine Auswahl',
      hypotheticalDescription: 'Diese Auswahl ist nicht real.',
    },
    summaries: {
      ready: 'Bereit',
      comparing: 'Vergleich läuft',
      identical: 'Gleiches Passwort.',
      similar: 'Ähnliches Passwort.',
      unique: 'Dieser Angriffsweg ist blockiert.',
      hypothetical: 'Hypothetisches Beispiel, nicht die reale Auswahl.',
    },
  };
}

function complete(definition: PasswordConsequenceSceneDefinition) {
  const initial = createPasswordConsequenceScene(definition);
  const comparing = transitionPasswordConsequenceScene(definition, initial, {
    type: 'comparison-started',
  });
  return transitionPasswordConsequenceScene(definition, comparing.snapshot, {
    type: 'animation-settled',
    animationId: definition.animationId,
  }).snapshot;
}

const base = {
  source: 'authored-fixture',
  sourceAccountId: 'campus-board',
  targetAccountId: 'campus-mail',
  context: 'actual-selection',
  cues: [],
} as const;

describe('S06 password consequence scene', () => {
  it.each([
    ['identical', 'direct', 'identical-reuse'],
    ['similar', 'similar', 'similar-pattern'],
  ] as const)('maps %s fixtures to a deterministic result edge', (outcome, status, kind) => {
    const definition = createDefinition({
      ...base,
      fixtureId: `s06-${outcome}`,
      outcome,
    });
    const snapshot = complete(definition);

    expect(snapshot.phase).toBe('complete');
    expect(snapshot.network.edges).toEqual([expect.objectContaining({ status, kind })]);
  });

  it('stops a unique path at the shield instead of connecting the target account', () => {
    const definition = createDefinition({
      ...base,
      fixtureId: 's06-unique',
      outcome: 'unique',
    });
    const snapshot = complete(definition);

    expect(snapshot.network.edges[0]).toEqual(
      expect.objectContaining({
        targetId: 's06-unique-shield',
        status: 'blocked',
        label: 'Dieser Angriffsweg ist blockiert',
      }),
    );
    expect(snapshot.network.edges.some(({ targetId }) => targetId === 'campus-mail')).toBe(false);
  });

  it('keeps the hypothetical marker in every phase and changes state only after scene events', () => {
    const definition = createDefinition({
      ...base,
      fixtureId: 's06-hypothetical',
      outcome: 'identical',
      context: 'hypothetical-example',
    });
    const initial = createPasswordConsequenceScene(definition);
    const comparing = transitionPasswordConsequenceScene(definition, initial, {
      type: 'comparison-started',
    });
    const stale = transitionPasswordConsequenceScene(definition, comparing.snapshot, {
      type: 'animation-settled',
      animationId: 'stale',
    });

    expect(initial.network.nodes).toEqual([
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ status: 'hypothetical' }),
    ]);
    expect(comparing.effects).toEqual([
      { type: 'play-animation', animationId: definition.animationId },
    ]);
    expect(stale.snapshot).toBe(comparing.snapshot);
    expect(complete(definition).network.nodes).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'hypothetical' })]),
    );
  });
});

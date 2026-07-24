import { describe, expect, it } from 'vitest';
import { S02_CAMPUS_ID_CONTENT_VERSION, type S02AnimationStep, s02CampusIdContent } from './s02.js';

describe('S02 CampusID content', () => {
  it('traces the versioned slice to the named script pages', () => {
    expect(s02CampusIdContent.version).toBe(S02_CAMPUS_ID_CONTENT_VERSION);
    expect(s02CampusIdContent.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [4, 5],
    });
    expect(s02CampusIdContent.segment).toEqual({
      id: 'S02',
      sectionId: 'passwords',
      slice: 'campus-id',
    });
  });

  it('authores the three services in deterministic reveal order and positions', () => {
    expect(s02CampusIdContent.scene.services.map(({ id, position }) => ({ id, position }))).toEqual(
      [
        { id: 'learnspace', position: { x: 0.59, y: 0.04 } },
        { id: 'exam-portal', position: { x: 0.59, y: 0.38 } },
        { id: 'cloud-notes', position: { x: 0.59, y: 0.72 } },
      ],
    );

    const unlock = s02CampusIdContent.animations.find(
      ({ id }) => id === s02CampusIdContent.scene.unlockAnimationId,
    );
    const reveals =
      unlock?.steps.filter(
        (step): step is Extract<S02AnimationStep, { readonly type: 'reveal' }> =>
          step.type === 'reveal',
      ) ?? [];
    expect(reveals.map(({ targetId }) => targetId)).toEqual([
      'learnspace',
      'exam-portal',
      'cloud-notes',
    ]);
    expect(unlock?.reducedMotion).toEqual({
      strategy: 'instant-end-state',
      maxDurationMs: 0,
    });
  });

  it('uses the previews and completion marker from internal page 5', () => {
    expect(s02CampusIdContent.scene.services.map(({ preview }) => preview)).toEqual([
      'Kurszugänge, Vorlesungsunterlagen, Abgaben',
      'Anmeldungen, Termine, Ergebnisübersichten',
      'Notizen, Entwürfe, Arbeitsdateien, Projektmaterial',
    ]);
    expect(s02CampusIdContent.page.completion).toBe('CampusID verstanden');
  });
});

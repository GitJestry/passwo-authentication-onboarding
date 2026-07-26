import { describe, expect, it } from 'vitest';
import { S02_CONTENT_VERSION, type S02AnimationStep, s02Content } from './s02.js';

describe('complete S02 content', () => {
  it('traces the new version to all named script pages', () => {
    expect(s02Content.version).toBe(S02_CONTENT_VERSION);
    expect(s02Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [4, 5, 6, 7],
    });
    expect(s02Content.segment).toEqual({ id: 'S02', sectionId: 'passwords' });
  });

  it('authors all three accounts and their required detail semantics', () => {
    expect(
      s02Content.scene.accounts.map(({ id, detailKind, edgeKind, details }) => ({
        id,
        detailKind,
        edgeKind,
        details: details.map(({ label }) => label),
      })),
    ).toEqual([
      {
        id: 'campus-id',
        detailKind: 'service',
        edgeKind: 'dependency',
        details: ['LearnSpace', 'Prüfungsportal', 'Cloud Notes'],
      },
      {
        id: 'campus-mail',
        detailKind: 'function',
        edgeKind: 'association',
        details: [
          'Benachrichtigungen',
          'Bestätigungen',
          'Zurücksetzungslinks',
          'Kommunikation in deinem Namen',
        ],
      },
      {
        id: 'campus-board-archive',
        detailKind: 'content',
        edgeKind: null,
        details: ['Alte Ankündigungen', 'Projektfragen', 'Archivierte Diskussionen'],
      },
    ]);
  });

  it('uses the account- and item-specific CampusMail and CampusBoard explanations', () => {
    expect(s02Content.narration.messages['s02.campus-mail.notifications']).toContain(
      'Nachrichten, die im Studienalltag relevant sein können',
    );
    expect(s02Content.narration.messages['s02.campus-mail.reset-links']).toContain(
      'Passwörter zurücksetzen',
    );
    expect(s02Content.narration.messages['s02.campus-board.old-announcements']).toBe(
      'CampusBoard enthält hier ältere Ankündigungen und Informationen.',
    );
    expect(s02Content.narration.messages['s02.campus-board.archived-discussions']).toContain(
      'keine weiteren Campusdienste',
    );
  });

  it('gives every account an authored unlock sequence with the same reduced-motion end plan', () => {
    for (const account of s02Content.scene.accounts) {
      const unlock = s02Content.animations.find(({ id }) => id === account.unlockAnimationId);
      const reveals =
        unlock?.steps.filter(
          (step): step is Extract<S02AnimationStep, { readonly type: 'reveal' }> =>
            step.type === 'reveal',
        ) ?? [];
      expect(reveals.map(({ targetId }) => targetId)).toEqual(account.details.map(({ id }) => id));
      expect(unlock?.reducedMotion).toEqual({
        strategy: 'instant-end-state',
        maxDurationMs: 0,
      });
    }
  });
});

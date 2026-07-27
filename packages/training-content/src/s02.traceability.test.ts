import { describe, expect, it } from 'vitest';
import { S02_CONTENT_VERSION, s02Content } from './s02.js';

describe('S02 training-content traceability', () => {
  it('keeps the scripted account map, account order freedom, and PassWo start sentence', () => {
    expect(S02_CONTENT_VERSION).toBe('3.0.0');
    expect(s02Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [4, 5, 6, 7],
    });
    expect(s02Content.narration.messages[s02Content.narration.introId]).toContain(
      'drei Passwörter',
    );
    expect(s02Content.narration.messages[s02Content.narration.introId]).toContain(
      'Dienste oder Inhalte',
    );
    expect(s02Content.page.globalProgress(0)).toBe('Konten verstehen: 0/3 angesehen');
    expect(s02Content.scene.accounts.map(({ label }) => label)).toEqual([
      'CampusID',
      'CampusMail',
      'CampusBoard Archiv',
    ]);
    expect(new Set(s02Content.scene.accounts.map(({ position }) => `${position.x}:${position.y}`))).toHaveSize(3);
  });

  it('keeps all preview bubbles and separates unlock from their staged reveal', () => {
    expect(s02Content.scene.accounts.map(({ details }) => details.map(({ label }) => label))).toEqual([
      ['LearnSpace', 'Prüfungsportal', 'Cloud Notes'],
      [
        'Benachrichtigungen',
        'Bestätigungen',
        'Zurücksetzungslinks',
        'Kommunikation in deinem Namen',
      ],
      ['Alte Ankündigungen', 'Projektfragen', 'Archivierte Diskussionen'],
    ]);

    for (const account of s02Content.scene.accounts) {
      const unlock = s02Content.animations.find(({ id }) => id === account.unlockAnimationId);
      const reveal = s02Content.animations.find(({ id }) => id === account.detailRevealAnimationId);
      expect(unlock?.steps.map(({ type }) => type)).toEqual([
        'move-character',
        'highlight',
        'announce',
      ]);
      expect(reveal?.steps.filter(({ type }) => type === 'reveal')).toHaveLength(
        account.details.length,
      );
    }
  });
});

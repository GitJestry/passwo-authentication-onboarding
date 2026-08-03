import { describe, expect, it } from 'vitest';
import { S05_CONTENT_VERSION, s05Content } from './s05.js';

describe('S05 content traceability', () => {
  it('keeps the participant copy bounded and separate from internal terminology', () => {
    expect(S05_CONTENT_VERSION).toBe('2.10.0');
    expect(s05Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPages: [
        12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
        35,
      ],
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s05-wiederhergestellte-einleitung-3-august-2026',
    });
    expect(s05Content.segment.id).toBe('S05');
    expect(s05Content.page.fixtureNotice).toBe(
      'Diese Simulation betrachtet nur das fiktive Passwort und ist keine allgemeine Sicherheitsbewertung.',
    );
    expect(s05Content.page.title).toBe('Naheliegende Bestandteile');
    expect(s05Content.page.introTitle).toBe('Wie der Angreifer dein Passwort rät');
    expect(s05Content.analysis.authoredAccountTerms).toEqual([
      'Campusgram',
      'Campus',
      'Nachrichten',
      'Gruppen',
      'Kontakte',
      'Beiträge',
    ]);
    expect(s05Content.intro.componentFrames.map(({ count }) => count)).toEqual([
      3, 7, 1, 5, 8, 2, 6, 4,
    ]);
    expect(s05Content.intro.narration.componentStartQuestion).toEqual([
      'Die Strategie beginnt mit der Frage: Bei welchen Bestandteilen soll der Angreifer anfangen?',
    ]);
    expect(s05Content.intro.narration.candidateCheck).toEqual([
      'Für den Angreifer ist das Passwort verdeckt. Sein Programm muss mögliche Passwörter erzeugen und prüfen, ob eines davon passt.',
    ]);

    const participantContent = JSON.stringify({
      trainingAriaLabel: s05Content.trainingAriaLabel,
      browser: s05Content.browser,
      page: Object.values(s05Content.page),
      intro: s05Content.intro,
      componentDemonstrations: s05Content.componentDemonstrations,
      findingLabels: s05Content.findingLabels,
      result: s05Content.result,
      structure: s05Content.structure,
      freeSearch: s05Content.freeSearch,
      summary: s05Content.summary,
    });

    expect(participantContent).not.toMatch(
      /fixture|laufzeitbefund|produktionsbewertung|gesamtscore|lokale analyse|design-lab|controller|theoretische entropie/iu,
    );
    expect(participantContent.match(/keine allgemeine Sicherheitsbewertung/giu)).toHaveLength(1);
    expect(s05Content.structure.application.reflection.privacyNote).toMatch(/laufenden Übung/u);
    expect(s05Content.structure.application.reflection.privacyNote).toMatch(/verändert nicht/u);
    expect(
      s05Content.freeSearch.theoreticalModel.lowercaseMeasurements.map(({ length }) => length),
    ).toEqual([8, 12, 14, 15, 16]);
  });
});

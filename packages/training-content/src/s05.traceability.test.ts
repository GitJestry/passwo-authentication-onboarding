import { describe, expect, it } from 'vitest';
import { S05_CONTENT_VERSION, s05Content } from './s05.js';

describe('S05 content traceability', () => {
  it('keeps the participant copy bounded and separate from internal terminology', () => {
    expect(S05_CONTENT_VERSION).toBe('2.25.0');
    expect(s05Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPages: [
        12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
        35,
      ],
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s05-varianten-ohne-redundante-kategorie-4-august-2026',
    });
    expect(s05Content.segment.id).toBe('S05');
    expect(s05Content.page.fixtureNotice).toBe(
      'Diese Simulation betrachtet nur das fiktive Passwort und ist keine allgemeine Sicherheitsbewertung.',
    );
    expect(s05Content.page.title).toBe('Häufig verwendete Passwörter und Zeichenfolgen');
    expect(s05Content.analysis.authoredAccountTerms).toEqual([
      'Campusgram',
      'Campus',
      'Nachrichten',
      'Gruppen',
      'Kontakte',
      'Beiträge',
    ]);
    expect(s05Content.intro.strategyAnnotations.probability).toBe('sehr häufig');
    expect(s05Content.intro.strategyAnnotations.personalDetail).toBe(
      'Naheliegende Jahreszahl',
    );
    expect(s05Content.componentStrategy.categories.map(({ title }) => title)).toEqual([
      'Häufig verwendete Passwörter und Zeichenfolgen',
      'Persönliche Angaben',
      'Bezug zum Konto und Umfeld',
    ]);
    expect(s05Content.componentStrategy.title).toBe(
      'Häufig verwendete Passwörter und Zeichenfolgen',
    );
    expect(s05Content.intro.narration.componentCategoryOverview).toEqual([
      'Als ersten Ausgangspunkt nutzt er, dass manche Passwörter und Zeichenfolgen besonders häufig verwendet werden.',
    ]);
    expect(s05Content.componentStrategy.commonComponents.explanation[0]).toBe(
      'Dazu gehören häufig verwendete Passwörter und Wörter, einfache Tastatur- und Zahlenfolgen wie „123456“ oder „qwertz“ oder naheliegende Jahreszahlen.',
    );
    expect(s05Content.componentStrategy.commonComponents.explanation[2]).toBe(
      'Dabei testet der Angreifer nicht nur die ursprüngliche Schreibweise. Er rechnet auch mit typischen Veränderungen, etwa Großschreibung, Zeichenersetzungen sowie ergänzte Zahlen oder Symbole.\n\nUnd das sowohl bei einzelnen Bestandteilen als auch bei bereits zusammengesetzten Passwortkandidaten.',
    );
    expect(s05Content.componentStrategy.presentation.findingChips).toMatchObject({
      commonPassword: 'häufig verwendetes Passwort',
      commonWord: 'häufig verwendetes Wort',
      keyboardSequence: 'Tastaturfolge',
      numberSequence: 'Zahlenfolge',
      nearbyYear: 'naheliegende Jahreszahl',
      typicalVariant: 'typische Variante: [Details]',
      typicalEnding: 'typische Endung: +[Wert]',
    });
    expect(s05Content.findingLabels).toMatchObject({
      'common-password-core': 'häufig verwendetes Passwort',
      'common-word': 'häufig verwendetes Wort',
      'keyboard-pattern': 'Tastaturfolge',
      year: 'naheliegende Jahreszahl',
      'simple-character-sequence': 'Zahlenfolge',
    });
    expect(s05Content.componentStrategy.commonComponents.check).toBe('Passwort prüfen');
    expect(s05Content.componentStrategy.commonComponents.machine.conveyorBlocks).toContain(
      'passwort',
    );
    expect(s05Content.componentStrategy.commonComponents.machine.generatorLabel).toBe(
      'Typische Veränderungen generieren',
    );
    expect(s05Content.componentStrategy.personalDetails.opening).toEqual([
      'Persönliche Angaben können leicht zu merken sein und wirken oft geheim, weil sie für dich eine besondere Bedeutung haben.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.derivation).toEqual([
      'Bei gezielten Angriffen können Namen, Geburtstage, Vereine oder andere persönliche Angaben aber manchmal aus öffentlichen Profilen, früheren Datenlecks oder dem Umfeld ableitbar sein.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.explanation).toEqual([
      'Ein Angreifer könnte es wissen, aber dieses Trainingsmodul kann das nicht zuverlässig bestimmen. Bitte wähle deine persönlichen Angaben manuell aus.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.begin).toBe(
      'Persönliche Angaben markieren',
    );
    expect(s05Content.componentStrategy.presentation.findingChips.personalComponent).toBe(
      'persönliche Angabe',
    );
    expect(s05Content.componentStrategy.personalDetails.applyNone).toBe(
      'Keine Persönliche Angabe',
    );
    expect(s05Content.componentStrategy.personalDetails.results).toMatchObject({
      selected: 'Du hast [Angaben] als persönliche Angabe eingeordnet.',
      boundary: 'Für den Angreifer ist das auch hier erst nur ein Ausgangspunkt.',
    });
    expect(s05Content.componentStrategy.personalDetails.machine.conveyorBlocks).toContain('Name');
    expect(s05Content.componentStrategy.personalDetails.machine.conveyorBlocks).toContain(
      'Hochzeitstag',
    );
    expect(s05Content.componentStrategy.personalDetails.machine.conveyorBlocks).toContain(
      'Abschlussjahr',
    );
    expect(s05Content.componentStrategy.personalDetails.machine.conveyorBlocks).not.toContain(
      '2005',
    );
    expect(s05Content.componentStrategy.accountContext.machine.conveyorBlocks).toContain(
      'campusgram',
    );
    expect(s05Content.componentStrategy.accountContext.opening).toEqual([
      'Der Bezug zum Konto und Umfeld kann dem Angreifer Ideen für dein Passwort liefern.',
      'Bei Campusgram wären zum Beispiel Begriffe wie Campus, Nachricht, Gruppe oder der Dienstname naheliegend.',
    ]);
    expect(s05Content.componentStrategy.accountContext.explanation).toEqual([
      'Bei einem WLAN könnten es „WLAN“, „Router“ oder „Fritzbox“ sein.',
      'Prüfen wir deswegen nun dein Passwort auf einen möglichen Bezug zum Konto und Umfeld.',
    ]);
    expect(s05Content.componentStrategy.accountContext.transition).toBe(
      'Damit sind die drei Arten von Passwortbestandteilen geprüft.',
    );
    expect(s05Content.componentStrategy.accountContext.results).toMatchObject({
      foundOne:
        'In deinem Passwort wurde [Begriffe] als Begriff erkannt, der zu Campusgram passt.',
      foundMany:
        'In deinem Passwort wurden [Begriffe] als Begriffe erkannt, die zu Campusgram passen.',
    });
    expect(s05Content.animations.map(([id]) => id)).toEqual(
      expect.arrayContaining([
        's05-personal-details-opening',
        's05-personal-details-derivation',
        's05-account-context-opening',
      ]),
    );
    expect(s05Content.animations.map(([id]) => id)).not.toContain('s05-strategy-overview');
    expect(s05Content.componentStrategy.accountContext.check).toBe('Im Passwort prüfen');
    expect(s05Content.animations.map(([id]) => id).some((id) => id.includes('typical-changes'))).toBe(
      false,
    );
    expect(s05Content.componentStrategy.summary.continue).toBe('Weiter zum Aufbau');
    expect(s05Content.fixtures.find(({ id }) => id === 'all-categories')).toMatchObject({
      fictionalPassword: 'CampusgramPassw0rt123!',
      startSection: 'components',
    });
    expect(
      s05Content.fixtures
        .filter(({ id }) => id.startsWith('structure-'))
        .every(({ startSection }) => startSection === 'structure'),
    ).toBe(true);
    expect(s05Content.intro.narration.candidateCheck).toEqual([
      'Für den Angreifer ist dein Passwort verdeckt. Sein Programm erzeugt mögliche Passwörter und prüft, ob eines davon passt.',
      'Grundsätzlich könnte das Programm jede denkbare Zeichenfolge ausprobieren.',
    ]);

    const participantContent = JSON.stringify({
      trainingAriaLabel: s05Content.trainingAriaLabel,
      browser: s05Content.browser,
      page: Object.values(s05Content.page),
      intro: s05Content.intro,
      componentStrategy: s05Content.componentStrategy,
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
    expect(JSON.stringify(s05Content.componentStrategy)).not.toMatch(
      /thematisch|satzstruktur|wiederholung|wortkombination/iu,
    );
    expect(s05Content.structure.application.reflection.privacyNote).toMatch(/laufenden Übung/u);
    expect(s05Content.structure.application.reflection.privacyNote).toMatch(/verändert nicht/u);
    expect(
      s05Content.freeSearch.theoreticalModel.lowercaseMeasurements.map(({ length }) => length),
    ).toEqual([8, 12, 14, 15, 16]);
  });
});

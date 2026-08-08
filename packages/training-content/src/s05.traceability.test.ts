import { describe, expect, it } from 'vitest';
import { accountContextTerms } from './account-context-terms.js';
import { S05_CONTENT_VERSION, s05Content } from './s05.js';

describe('S05 content traceability', () => {
  it('keeps the participant copy bounded and separate from internal terminology', () => {
    expect(S05_CONTENT_VERSION).toBe('2.48.2');
    expect(s05Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPages: [
        12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
        35,
      ],
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s05-einordnung-der-trainingsauswertung-8-august-2026',
    });
    expect(s05Content.segment.id).toBe('S05');
    expect(s05Content.page.fixtureNotice).toBe(
      'Diese Simulation betrachtet nur das fiktive Passwort und ist keine allgemeine Sicherheitsbewertung.',
    );
    expect(s05Content.page.title).toBe('Häufig verwendete Passwörter und Zeichenfolgen');
    expect(s05Content.analysis.authoredAccountTerms).toEqual(accountContextTerms.campusgram);
    expect(s05Content.componentStrategy.accountContext.machine.conveyorBlocks).toEqual([
      ...new Map(
        accountContextTerms.campusgram.map((term) => {
          const normalized = term.trim().normalize('NFKC').toLocaleLowerCase('de-DE');
          return [normalized, normalized] as const;
        }),
      ).values(),
    ]);
    expect(s05Content.intro.strategyAnnotations.probability).toBe('sehr häufig');
    expect(s05Content.intro.strategyAnnotations.personalDetail).toBe(
      'Naheliegende Jahreszahl',
    );
    expect(s05Content.componentStrategy.categories.map(({ title }) => title)).toEqual([
      'Häufig verwendete Passwörter und Zeichenfolgen',
      'Persönliche Angaben',
      'Bezug zum Konto, Dienst oder Umfeld',
    ]);
    expect(s05Content.componentStrategy.title).toBe(
      'Häufig verwendete Passwörter und Zeichenfolgen',
    );
    expect(s05Content.intro.narration.componentCategoryOverview).toEqual([
      'Dabei probiert das Programm zunächst Passwörter und Zeichenfolgen aus, die besonders häufig verwendet werden.',
      'Bitte beachte: Dieses Trainingsmodul kann dein Passwort möglicherweise nicht immer korrekt einordnen. Die Auswertung soll dir dennoch dabei helfen, typische Angriffsmuster besser nachzuvollziehen.',
    ]);
    expect(s05Content.intro.narration.randomSequence).toEqual([
      'Zufällige Zeichenfolgen sind für Menschen jedoch schwer zu merken. Selbst gewählte Passwörter enthalten deshalb oft merkbare Elemente, wie Wörter, Zahlen oder einfache Zeichenfolgen.',
    ]);
    expect(s05Content.componentStrategy.commonComponents.explanation[0]).toBe(
      'Dazu gehören häufig verwendete Passwörter und Wörter, einfache Tastatur- und Zahlenfolgen wie „123456“ oder „qwertz“ oder naheliegende Jahreszahlen.',
    );
    expect(s05Content.componentStrategy.commonComponents.explanation[2]).toBe(
      'Viele Menschen verändern Bestandteile, damit Passwörter stärker wirken. Angreiferprogramme erzeugen deshalb typische Varianten mit Großschreibung, Zeichenersetzungen, Zahlen oder Symbolen, auch für bereits zusammengesetzte Kandidaten.',
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
      'typical-transformation': 'typische Variante',
    });
    expect(s05Content.componentStrategy.commonComponents.check).toBe('Passwort prüfen');
    expect(s05Content.componentStrategy.commonComponents.explanation[3]).toBe(
      'Prüfen wir nun dein gewähltes Passwort auf häufig verwendete Passwörter und Zeichenfolgen.',
    );
    expect(s05Content.componentStrategy.commonComponents.machine.conveyorBlocks).toContain(
      'passwort',
    );
    expect(s05Content.componentStrategy.commonComponents.machine.generatorLabel).toBe(
      'Typische Varianten generieren',
    );
    expect(s05Content.componentStrategy.presentation.reviewCardTitle).toBe('Zusammenfassung');
    expect(s05Content.componentStrategy.personalDetails.opening).toEqual([
      'Persönliche Angaben sind leicht zu merken und wirken oft geheim. Es ist deshalb nachvollziehbar, sie für etwas zu halten, das andere nur schwer erraten können.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.derivation).toEqual([
      'Bei einem Datenleck liegen deine Passwortdaten oft zusammen mit deinem Benutzernamen, deiner E-Mail-Adresse oder Kontohinweisen vor.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.examples).toEqual([
      'Angreifer können dadurch persönliche Angaben wie Namen, Geburtsdaten oder dem Lieblingsverein aus öffentlichen Profilen oder deinem Umfeld gezielt als Passwortkandidaten testen.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.explanation).toEqual([
      'Für den Selbstcheck: Wähle die persönlichen Angaben aus, die für dein Beispiel in Frage kommen.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.begin).toBe(
      'Persönliche Angaben markieren',
    );
    expect(s05Content.componentStrategy.personalDetails.selectionHint).toBe(
      'Ziehe über zusammenhängende Zeichen, um eine persönliche Angabe zu markieren. Wiederhole dies für weitere Angaben. Tippe eine Markierung an, um sie zu entfernen.',
    );
    expect(s05Content.componentStrategy.personalDetails.selectionStatus).toMatchObject({
      started: 'Auswahl gestartet. Wähle das letzte Zeichen des Bereichs.',
      added: 'Persönliche Angabe markiert.',
      removed: 'Markierung entfernt.',
    });
    expect(s05Content.componentStrategy.presentation.findingChips.personalComponent).toBe(
      'persönliche Angabe',
    );
    expect(s05Content.componentStrategy.personalDetails.applyNone).toBe(
      'Keine Persönliche Angabe',
    );
    expect(s05Content.componentStrategy.personalDetails.results).toMatchObject({
      selected: 'Du hast [Angaben] als persönliche Angabe eingeordnet.',
      completeSingleCandidate:
        'Die gefundene Übereinstimmung deckt bereits die gesamte Zeichenfolge ab.',
      completeCombinedMatches:
        'Mehrere gefundene Übereinstimmungen decken gemeinsam die gesamte Zeichenfolge ab.',
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
      'Der Bezug zum Konto, Dienst oder Umfeld kann dem Angreifer Ideen für dein Passwort liefern.',
      'Bei Campusgram wären zum Beispiel Begriffe wie Campus, Nachricht, dein Benutzername oder der Dienstname naheliegend.',
    ]);
    expect(s05Content.componentStrategy.accountContext.explanation).toEqual([
      'Bei einem WLAN-Passwort könnten es „WLAN“, „Router“ oder „Fritzbox“ sein.',
    ]);
    expect(s05Content.componentStrategy.accountContext.results).toMatchObject({
      none: ['Hier wurde kein direkter Bezug zu Campusgram erkannt.'],
      foundOne:
        '[Begriffe] wurde in deinem Passwort als Begriff mit Bezug zu Campusgram erkannt.',
      foundMany:
        '[Begriffe] wurden in deinem Passwort als Begriffe mit Bezug zu Campusgram erkannt.',
      completeSingleCandidate:
        'Die gefundene Übereinstimmung deckt bereits die gesamte Zeichenfolge ab.',
      completeCombinedMatches:
        'Mehrere gefundene Übereinstimmungen decken gemeinsam die gesamte Zeichenfolge ab.',
    });
    expect(s05Content.animations.map(([id]) => id)).toEqual(
      expect.arrayContaining([
        's05-personal-details-opening',
        's05-personal-details-derivation',
        's05-account-context-opening',
        's05-account-context-examples',
      ]),
    );
    expect(s05Content.animations.map(([id]) => id)).not.toContain('s05-strategy-overview');
    expect(s05Content.componentStrategy.accountContext.check).toBe('Im Passwort prüfen');
    expect(s05Content.componentStrategy.accountContext.explanation[1]).toBe(
      'Prüfen wir nun dein gewähltes Passwort auf einen möglichen Bezug zu Campusgram.',
    );
    expect(s05Content.animations.map(([id]) => id).some((id) => id.includes('typical-changes'))).toBe(
      false,
    );
    expect(s05Content.componentStrategy.summary.continue).toBe('Weiter');
    expect(s05Content.componentStrategy.summary).toMatchObject({
      singleCandidateMatch:
        'Dein Passwort wurde bereits unter einen einzigen frühen Kandidaten gefunden. Wir verfolgen den Angriff trotzdem weiter.',
      combinedMatches:
        'Dein Passwort besteht komplett aus frühen Anhaltspunkten. Erraten ist es dadurch noch nicht. Wir verfolgen den Angriff deshalb weiter.',
      partialMatches:
        'Dein Passwort besteht zum Teil aus frühen Anhaltspunkten. Erraten ist es dadurch noch nicht. Wir verfolgen den Angriff weiter.',
      none: 'Bei den bisherigen Prüfungen wurde keine Übereinstimmung gefunden. Der Angreifer hat damit aber noch nicht alle Möglichkeiten ausgeschöpft.',
      nothingFound: 'Nichts gefunden',
    });
    expect(s05Content.intro.strategyAnnotations.sentenceStructure).toBe('Satzaufbau');
    expect(s05Content.structure.intro).toEqual([
      'Angreifer prüfen nämlich nicht nur häufige Zeichenfolgen, persönliche Angaben oder Kontobezüge. Sie berücksichtigen auch typische Muster, mit denen Menschen solche Elemente zu leichter merkbaren Passwörtern kombinieren.',
    ]);
    expect(s05Content.structure.demonstrations.slice(0, 3).map(({ title }) => title)).toEqual([
      'Naheliegende Zusammenhänge',
      'Vorhersehbare Satz- und Phrasenstrukturen',
      'Wiederholungsmuster',
    ]);
    expect(s05Content.animations.map(([id]) => id)).toContain('s05-structure-intro');
    expect(s05Content.animations.map(([id]) => id)).not.toContain('s05-structure-context');
    expect(s05Content.structure.presentationExamples.theme.rows).toHaveLength(3);
    expect(s05Content.structure.presentationExamples.sentence.rows).toHaveLength(3);
    expect(s05Content.structure.presentationExamples.repetition.rows).toHaveLength(3);
    expect(s05Content.freeSearch.passphraseGenerator.password).toBe(
      'Kaktus-Fenster-Regen-Komet-Wodurch-Knochen',
    );
    expect(s05Content.freeSearch.passphraseGenerator.narration).toBe(
      'Wichtig: Passphrasen, also Passwörter aus mehreren Wörtern, können sehr stark sein. Werden genug Wörter zufällig erzeugt, fehlen dem Angreifer genau die Zusammenhänge, die ihm eben noch geholfen haben. Wie das praktisch geht, schauen wir uns später an.',
    );
    expect(s05Content.freeSearch.estimate.alphabetLabel).toBe('zufällig gewählt');
    expect(s05Content.freeSearch.transition.explanation).toBe(
      'Ohne die gelernten Anhaltspunkte kann der Angreifer immer noch alle möglichen Zeichenkombinationen durchprobieren. Viele bekannte Passwortregeln sollen genau das erschweren.',
    );
    expect(s05Content.freeSearch.characterMix.checks[0]).toBe('mindestens 12 Zeichen');
    expect(s05Content.freeSearch.characterMix.narration[3]).toBe(
      'Verschiedene Zeichentypen können ein Passwort stärker machen, wenn die Zeichen wirklich zufällig gewählt werden. Bei selbst gewählten Passwörtern entstehen daraus jedoch typischerweise vorhersehbare Variationen.',
    );
    expect(s05Content.freeSearch.estimate.question).toBe(
      'Schauen wir uns deshalb zum Abschluss an, was allein die Länge bewirken kann. Dafür wird jede Stelle im Passwort zufällig aus Kleinbuchstaben gewählt. Was glaubst du: Ab welcher Länge wird es selbst mit nur Kleinbuchstaben für einen Angreifer zu aufwendig, alle möglichen Zeichenfolgen durchzuprobieren?',
    );
    expect(s05Content.freeSearch.estimate.options).toEqual([12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(s05Content.fixtures.find(({ id }) => id === 'all-categories')).toMatchObject({
      fictionalPassword: 'CampusPassw0rt123!',
      analysisContext: { accountTerms: ['Campus'] },
      startSection: 'components',
    });
    expect(
      s05Content.fixtures
        .filter(({ id }) => id.startsWith('structure-'))
        .every(({ startSection }) => startSection === 'structure'),
    ).toBe(true);
    expect(s05Content.intro.narration.candidateCheck).toEqual([
      'Für den Angreifer ist dein Passwort verdeckt. Sein Programm erzeugt mögliche Passwörter und prüft, ob eines davon passt.',
      'Grundsätzlich könnte es dabei jede denkbare Zeichenfolge ausprobieren.',
    ]);
    expect(s05Content.intro.narration.strategyTargeting).toEqual([
      'Der Angreifer sieht diese Bestandteile nicht. Sein Programm kann aber mögliche Bestandteile auswählen, kombinieren und daraus vollständige Passwortkandidaten bilden.',
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
    expect(
      s05Content.freeSearch.theoreticalModel.lowercaseMeasurements.map(({ length }) => length),
    ).toEqual([8, 12, 14, 15, 16]);
  });
});

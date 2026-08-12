import { describe, expect, it } from 'vitest';
import { accountContextTerms } from './account-context-terms.js';
import { S05_CONTENT_VERSION, s05Content } from './s05.js';

describe('S05 content traceability', () => {
  it('keeps the participant copy bounded and separate from internal terminology', () => {
    expect(S05_CONTENT_VERSION).toBe('2.81.0');
    expect(s05Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPages: [
        12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
        35,
      ],
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy--und-ablaufdelta-s05-campusgram-abschluss-und-s06-übergang-12-august-2026',
    });
    expect(s05Content.segment.id).toBe('S05');
    expect(s05Content.page.fixtureNotice).toBe(
      'Diese Simulation betrachtet nur das fiktive Passwort und ist keine allgemeine Sicherheitsbewertung.',
    );
    expect(s05Content.page.title).toBe('Häufig verwendete Passwörter und Zeichenfolgen');
    expect(s05Content.intro.campusgramPassword.visibleSuffix).toBe('Campusgram-Passwort');
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
      'Dabei beginnt der Angreifer mit Passwörtern und Zeichenfolgen, die besonders häufig verwendet werden.',
      'Bitte beachte: Das Modul kann Bestandteile übersehen oder falsch einordnen. Es dient nur zum Verständnis, nicht zur Sicherheitsbewertung.',
    ]);
    expect(s05Content.intro.narration.randomSequence).toEqual([
      'Zufällige Zeichenfolgen sind jedoch schwer zu merken. Selbst gewählte Passwörter enthalten deshalb oft merkbare Elemente wie Wörter, Zahlen oder einfache Zeichenfolgen.',
    ]);
    expect(s05Content.componentStrategy.commonComponents.explanation[0]).toBe(
      'Dazu gehören häufig verwendete Passwörter und Wörter, einfache Tastatur- und Zahlenfolgen wie „123456“ oder „qwertz“ oder naheliegende Jahreszahlen.',
    );
    expect(s05Content.componentStrategy.commonComponents.explanation[1]).toBe(
      'Wörter sind nicht grundsätzlich unsicher. Geläufige Wörter, etwa aus Wörterbüchern, können Angreifer jedoch früh ausprobieren.',
    );
    expect(s05Content.componentStrategy.commonComponents.explanation[2]).toBe(
      'Bei selbst gewählten Passwörtern kommen außerdem oft Veränderungen wie Großschreibung, Zeichenersetzungen, Zahlen oder Symbole vor. Auch solche typischen Varianten werden ausprobiert.',
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
    expect(s05Content.componentStrategy.presentation.findingCategories).toEqual({
      password: 'häufiges Passwort',
      word: 'häufiges Wort',
      keyboard: 'häufige Tastaturfolge',
      numberSequence: 'häufige Zahlenfolge',
      date: 'häufiges Datum',
      sequence: 'häufige Zeichenfolge',
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
    expect(s05Content.componentStrategy.commonComponents.results).toMatchObject({
      foundOne: '[Teile] wird häufig verwendet.',
      foundMany: '[Teile] werden häufig verwendet.',
    });
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
      'Persönliche Angaben sind vertraut und meist leicht zu merken. Gerade weil sie persönlich sind, können sie schwer erratbar wirken.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.derivation).toEqual([
      'Mit den Passwortdaten eines Kontos sind jedoch oft auch ein Benutzername oder eine E-Mail-Adresse verknüpft. Bei einem Datenleck können solche Kontohinweise offengelegt werden.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.examples).toEqual([
      'Mit diesen Hinweisen können Angreifer nach öffentlichen Profilen suchen und dort Angaben wie Namen, Geburtsdaten oder den Lieblingsverein finden und als Passwortbestandteile ausprobieren.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.explanation).toEqual([
      'Deine Auswahl wird weder gespeichert noch exportiert. Markiere für den Selbstcheck mögliche persönliche Angaben im fiktiven Passwort.',
    ]);
    expect(s05Content.componentStrategy.personalDetails.begin).toBe(
      'Persönliche Angaben markieren',
    );
    expect(s05Content.componentStrategy.personalDetails.selectionHint).toBe(
      'Wenn du eine persönliche Angabe erkennst, ziehe über die zugehörigen Zeichen, um sie zu markieren. Tippe auf eine Markierung, um sie wieder zu entfernen.',
    );
    expect(s05Content.componentStrategy.personalDetails.selectionStatus).toMatchObject({
      started: 'Auswahl gestartet. Wähle das letzte Zeichen des Bereichs.',
      added: 'Persönliche Angabe markiert.',
      removed: 'Markierung entfernt.',
    });
    expect(s05Content.componentStrategy.presentation.findingChips.personalComponent).toBe(
      'Persönliche Angabe',
    );
    expect(s05Content.componentStrategy.presentation.findingChips.containedFinding).toBe(
      '[Befund] enthalten',
    );
    expect(s05Content.componentStrategy.personalDetails.applyNone).toBe(
      'Keine persönliche Angabe',
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
      'Um sich leichter zu merken, welches Passwort zu welchem Konto gehört, werden oft Begriffe aus dem Dienst oder seinem Umfeld eingebaut. Solche Bezüge kann ein Angreifer gezielt mitprüfen.',
    ]);
    expect(s05Content.componentStrategy.accountContext.explanation).toEqual([
      'Bei Campusgram wären das zum Beispiel „Campus“, „Nachricht“, der Benutzername oder der Dienstname, bei einem WLAN-Passwort etwa „WLAN“, „Router“ oder „Fritzbox“.',
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
        'Das Campusgram-Passwort wurde bei dieser Prüfung bereits gefunden. Die Simulation zeigt dennoch weitere typische Vorgehensweisen.',
      combinedMatches:
        'Mehrere frühe Übereinstimmungen decken zusammen das ganze Passwort ab. Erraten ist es dadurch noch nicht. Die Simulation zeigt noch weitere typische Vorgehensweisen.',
      partialMatches:
        'Bei den bisherigen Prüfungen wurden Teile des Passworts erkannt. Erraten ist es dadurch noch nicht. Die Simulation zeigt noch weitere typische Vorgehensweisen.',
      none: 'Bei den bisherigen Prüfungen wurde keine Übereinstimmung gefunden. Das bedeutet jedoch nicht, dass bereits alle Angriffsmöglichkeiten geprüft wurden.',
      nothingFound: 'Nichts gefunden',
    });
    expect(s05Content.intro.strategyAnnotations.sentenceStructure).toBe(
      'Kurze vorhersehbare Formulierung',
    );
    expect(s05Content.structure.intro).toEqual([
      'Angreifer prüfen nämlich nicht nur häufige Zeichenfolgen, persönliche Angaben oder Kontobezüge. Sie berücksichtigen auch typische Muster, mit denen solche Elemente zu leichter merkbaren Passwörtern kombiniert werden.',
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
    expect(s05Content.structure.narration).toEqual({
      theme: [
        'Auch verschiedene Wörter können zusammen vorhersehbar sein. „WLAN“, „Wohnzimmer“ und „Familie“ passen beispielsweise inhaltlich zusammen.',
        'Je naheliegender der Zusammenhang, desto besser kann der Angreifer einschätzen, welche Kombinationen sich zuerst zu testen lohnen.',
      ],
      sentence: [
        'Auch bekannte oder sprachlich naheliegende Formulierungen machen Bestandteile vorhersagbarer.',
        'Nach „Ohne Kaffee geht“ liegt etwa „nichts“ als Fortsetzung nahe. Solche Muster kommen zum Beispiel bei Redewendungen, Liedzeilen oder anderen geläufigen Formulierungen vor.',
      ],
      repetition: [
        'Auch Wiederholungen können ein Passwort länger wirken lassen, obwohl sich Teile nur wiederholen.',
        'Erkennt oder vermutet ein Angreifer den wiederholten Grundbaustein, kann er gezielt solche Wiederholungsmuster prüfen.',
      ],
    });
    expect(s05Content.animations.map(([id]) => id)).toEqual(
      expect.arrayContaining([
        's05-structure-theme',
        's05-structure-sentence',
        's05-structure-repetition',
      ]),
    );
    expect(s05Content.freeSearch.passphraseGenerator.password).toBe(
      'Kaktus-Fenster-Regen-Komet-Wodurch-Knochen',
    );
    expect(s05Content.freeSearch.passphraseGenerator.narration).toBe(
      'Wichtig: Passphrasen, also Passwörter aus mehreren Wörtern, können sehr stark sein. Werden genug Wörter zufällig erzeugt, fehlen dem Angreifer genau die Zusammenhänge, die ihm eben noch geholfen haben. Wie das praktisch geht, schauen wir uns später an.',
    );
    expect(s05Content.freeSearch.estimate.alphabetLabel).toBe('zufällig gewählt');
    expect(s05Content.freeSearch.transition.explanation).toBe(
      'Hier erfüllt Passw0rt123! alle angezeigten Regeln und wird als stark bewertet.',
    );
    expect(s05Content.animations.map(([id]) => id)).not.toContain('s05-passphrase-generator');
    expect(s05Content.freeSearch.characterMix.checks[0]).toBe('mindestens 12 Zeichen');
    expect(s05Content.freeSearch.characterMix.variations).toHaveLength(100);
    expect(s05Content.freeSearch.characterMix.narration[0]).toBe(
      'Das rechte Passwort ist genauso lang und enthält ebenfalls alle vier Zeichentypen, besteht aber aus zwölf zufällig erzeugten Zeichen.',
    );
    expect(s05Content.freeSearch.characterMix.narration[1]).toBe(
      'Deshalb kann ein Passwort als stark markiert werden, obwohl es typischen Mustern folgt und vom Angreifer früh ausprobiert wird.',
    );
    expect(s05Content.freeSearch.characterMix.narration[2]).toBe(
      'Verschiedene Zeichentypen können ein Passwort stärker machen, werden bei selbst gewählten Passwörtern aber oft vorhersehbar eingesetzt.',
    );
    expect(s05Content.freeSearch.characterMix.finalVariationStatus).toBe('(Variation getestet)');
    expect(s05Content.freeSearch.characterMix.narration[3]).toBe(
      'Darauf zu setzen, mit einer komplizierten Mischung wie „mEin!Pa55w0rt?“ eine Variante zu finden, die der Angreifer nicht prüft, ist deshalb riskant.',
    );
    expect(s05Content.freeSearch.characterMix.narration[4]).toBe(
      'Das musst du auch nicht. Deshalb setzt die aktuelle Empfehlung bei selbst gewählten Passwörtern vor allem auf Länge.',
    );
    expect(s05Content.freeSearch.characterMix.narration[5]).toBe(
      'Wie lang sollte ein solches Passwort mindestens sein? Dafür lassen wir andere Zeichentypen zunächst bewusst weg und verwenden nur zufällig erzeugte Kleinbuchstaben.',
    );
    expect(s05Content.freeSearch.characterMix.narration).toHaveLength(6);
    expect(s05Content.freeSearch.estimate.question).toBe(
      'Was glaubst du: Ab welcher Länge wird es für einen Angreifer zu aufwendig, alle Möglichkeiten durchzuprobieren?',
    );
    expect(s05Content.freeSearch.lengthExamples).toMatchObject({
      mixedCharacterComparison:
        'Die gelbe Kugel zeigt, warum zwölf Zeichen aus mehreren Zeichentypen bei wirklich zufälliger Auswahl so vielversprechend sind.',
      orientation:
        'Bei selbstgewählten Passwörtern lässt sich diese Zufälligkeit jedoch nicht voraussetzen. Deshalb liegt die aktuelle Orientierung bei mindestens 15 Zeichen.',
      wordCore: { password: 'Datensicherheit!', parts: ['Datensicherheit', '!'], length: 16 },
      extraCharacters: {
        password: 'Datensicherheit-?KmL',
        parts: ['Datensicherheit', '-?KmL'],
        length: 20,
      },
      wordExamplesIntroduction:
        'Kommen wir kurz noch einmal auf Wörter zurück. Diese beiden Passwörter erfüllen die Mindestlänge, bestehen aber jeweils nur aus einem häufigen Wort und ein paar zusätzlichen Zeichen. Dadurch werden sie zu früh geprüften Variationen.',
      additionalWordQuestion:
        'Mit mehreren Wörtern erreicht man die Mindestlänge schnell. Aber reicht es, einfach ein weiteres Wort hinzuzunehmen?',
      practicalOutlook:
        'Dafür gibt es eine einfache Methode, mit der sich lange und trotzdem gut merkbare Passwörter aus Wörtern bilden lassen. Die probieren wir später selbst aus.',
    });
    expect(s05Content.freeSearch.application).toMatchObject({
      assessmentIntroduction:
        'Die Zusammenfassung zeigt die Ansatzpunkte. Für das Ergebnis zählen zwei getrennte Fragen: Deckt ein früh geprüfter Passwortkandidat die gesamte Zeichenfolge ab? Und erreicht das Passwort die Längenorientierung?',
      result: {
        recognizedValue:
          'Zur ersten Frage: Ein früh geprüfter Passwortkandidat deckt die gesamte Zeichenfolge ab. Deshalb gilt das Campusgram-Passwort in dieser begrenzten Simulation als gefunden.',
        recognizedBoundedVariant:
          'Zur ersten Frage: Eine begrenzte typische Variante deckt die gesamte Zeichenfolge ab. Deshalb gilt das Campusgram-Passwort in dieser begrenzten Simulation als gefunden.',
        notRecognized:
          'Zur ersten Frage: Keiner der dargestellten frühen Kandidaten oder begrenzten Variantenwege deckt die gesamte Zeichenfolge ab. Deshalb wurde das Campusgram-Passwort in diesen Prüfungen nicht gefunden. Das ist kein Sicherheitsnachweis.',
      },
      length: {
        belowOrientation:
          'Die zweite Frage bleibt davon getrennt: Mit [Anzahl] Zeichen liegt das Campusgram-Passwort unter der Orientierung von mindestens 15 Zeichen für selbst gewählte Passwörter.',
        reachesOrientation:
          'Die zweite Frage bleibt davon getrennt: Mit [Anzahl] Zeichen erreicht das Campusgram-Passwort die Orientierung von mindestens 15 Zeichen für selbst gewählte Passwörter.',
      },
      reuseTakeaway:
        'Selbst gewählte Passwörter werden oft für mehrere Konten wiederverwendet oder nur leicht verändert, weil das leichter zu merken ist und sie für sich betrachtet stark wirken können.',
      attackerTakeaway:
        'Wird eines davon herausgefunden, können Angreifer dasselbe oder ähnliche Passwörter auch anderen Konten ausprobieren.',
    });
    expect(s05Content.freeSearch.estimate.options).toEqual([12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(s05Content.freeSearch.theoreticalModel.interactiveScale.minimumOrientation).toBe(
      'Mindeststandard',
    );
    expect(
      s05Content.freeSearch.theoreticalModel.interactiveScale.comparisonAccessibleLabel,
    ).toBe(
      'Vergleich von 15 zufälligen Kleinbuchstaben mit 12 zufälligen Zeichen aus allen Zeichentypen',
    );
    expect(s05Content.freeSearch.theoreticalModel.lowercaseMeasurements).toContainEqual({
      length: 12,
      durationLabel: 'ca. 1 Tag',
    });
    expect(s05Content.freeSearch.theoreticalModel.mixedCharacterMeasurement).toEqual({
      length: 12,
      alphabetLabel: 'alle Ze1chentypen!',
      durationLabel: 'ca. 615 Jahre',
    });
    const comparisonStepIndex = s05Content.animations.findIndex(
      ([id]) => id === 's05-length-model-comparison',
    );
    const orientationStepIndex = s05Content.animations.findIndex(
      ([id]) => id === 's05-length-orientation',
    );
    const campusgramTransitionStepIndex = s05Content.animations.findIndex(
      ([id]) => id === 's05-length-campusgram-transition',
    );
    expect(comparisonStepIndex).toBeGreaterThan(-1);
    expect(orientationStepIndex).toBe(comparisonStepIndex + 1);
    expect(campusgramTransitionStepIndex).toBe(orientationStepIndex + 1);
    expect(
      s05Content.animations
        .map(([id]) => id)
        .filter((id) => id.startsWith('s05-final-')),
    ).toEqual([
      's05-final-components',
      's05-final-result',
      's05-final-length',
      's05-final-spread',
      's05-final-takeaway',
    ]);
    expect(s05Content.animations.map(([id]) => id)).not.toEqual(
      expect.arrayContaining([
        's05-length-word-core',
        's05-length-additional-word-question',
        's05-length-practical-outlook',
      ]),
    );
    expect(s05Content.freeSearch.theoreticalModel.lowercaseMeasurements).toContainEqual({
      length: 16,
      durationLabel: 'ca. 1.380 Jahre',
    });
    expect(s05Content.freeSearch.theoreticalModel.lowercaseMeasurements.at(-1)).toEqual({
      length: 20,
      durationLabel: 'über 635 Millionen Jahre',
    });
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
      'Für den Angreifer ist dein Passwort verdeckt. Er probiert mögliche Passwörter aus und prüft, ob eines davon passt. Grundsätzlich kann er jede denkbare Zeichenfolge testen.',
    ]);
    expect(s05Content.intro.narration.strategyTargeting).toEqual([
      'Der Angreifer sieht diese Bestandteile nicht. Er kann aber mögliche Bestandteile auswählen, kombinieren und daraus vollständige Passwörter ausprobieren.',
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
    ).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
});

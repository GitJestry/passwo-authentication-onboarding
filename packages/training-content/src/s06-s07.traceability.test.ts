import { describe, expect, it } from 'vitest';
import { accountContextTerms } from './account-context-terms.js';
import { S06_CONSEQUENCE_CONTENT_VERSION, s06ConsequenceContent } from './s06.js';
import {
  S07_PASSPHRASE_SEARCH_CONTENT_VERSION,
  s07PassphraseSearchContent,
} from './s07.js';
import { S08_NETWORK_REPLAY_CONTENT_VERSION, s08NetworkReplayContent } from './s08.js';
import { S09_PASSWORD_SUMMARY_CONTENT_VERSION, s09PasswordSummaryContent } from './s09.js';

const s06AttackFlowCopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s06-vergleichslabels-fuer-passwort-abwandlungen-vereinheitlicht-22-august-2026';
const s07EntryCopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s05-s09-terminologie-fuer-passwort-abwandlungen-vereinheitlicht-22-august-2026';
const s08CopyReference =
  'docs/design/S08-S09-COPY-AUDIT.md#copy-delta-s08-zusammenfassungsnavigation-22-august-2026';
const s09CopyReference =
  'docs/design/S08-S09-COPY-AUDIT.md#copy-delta-s05-s09-terminologie-fuer-passwort-abwandlungen-vereinheitlicht-22-august-2026';

describe('S06 transition and S07 passphrase-search copy traceability', () => {
  it('keeps S06 consequence wording aligned with bounded whole-password recognition', () => {
    expect(S06_CONSEQUENCE_CONTENT_VERSION).toBe('2.28.0');
    expect(s06ConsequenceContent.source.copyReference).toBe(s06AttackFlowCopyReference);
    expect(s06ConsequenceContent.page.attackStart).toBe('Angriff starten');
    expect(s06ConsequenceContent.page.finish).toBe('Fertig');
    expect(s06ConsequenceContent.page.localReflection).toEqual({
      passwordLabel: 'Fiktives Passwort',
      modeLabel: 'Modus:',
      groupLabel: 'Gruppe',
      newGroup: 'Neue Gruppe',
      structureMode: 'Struktur',
      personalMode: 'Persönliches',
      personalSelectionLabel: 'Persönliche Angaben im fiktiven Passwort markieren',
      personalApply: 'Übernehmen',
      passwordTitles: {
        'master-campus': 'Master Campus-Passwort',
        'campus-email': 'Campus E-Mail-Passwort',
      },
    });
    expect(s06ConsequenceContent.page.replacePassword).toBe('Passwort ersetzen');
    expect(s06ConsequenceContent.modes.hypothetical.overlay).toBe('Was wäre, wenn?');
    expect(s06ConsequenceContent.narrations['s06.incident.campusgram-found'].body).toBe(
      'Das Campusgram-Passwort ist nun bekannt. Der Angreifer kann dasselbe Passwort und leichte Abwandlungen jetzt auch bei den anderen Konten ausprobieren.',
    );
    expect(s06ConsequenceContent.narrations['s06.incident.campusgram-blocked'].body).toBe(
      'Das Campusgram-Passwort wurde hier nicht gefunden. Schauen wir trotzdem kurz, was passiert wäre, wenn es bekannt geworden wäre.',
    );
    expect(s06ConsequenceContent.narrations['s06.compare.exact-match'].body).toBe(
      'Dasselbe Passwort kann beim Zielkonto ausprobiert werden.',
    );
    expect(s06ConsequenceContent.narrations['s06.transition'].body).toBe(
      'Ein Datenleck kann bei jedem Konto beginnen. Schauen wir deshalb noch von Master Campus aus.',
    );
    expect(s06ConsequenceContent.narrations).toMatchObject({
      's06.perspective.master-campus-found': {
        body: 'Das Master-Campus-Passwort gilt hier ebenfalls als gefunden. Prüfen wir, ob es bei Campus E-Mail weiterführt.',
      },
      's06.perspective.master-campus-blocked': {
        body: 'Das Master-Campus-Passwort wurde hier nicht gefunden. Für den Vergleich nehmen wir kurz an, es wäre bekannt geworden.',
      },
      's06.transition.master-campus-email-match': {
        body: 'Zwischen Master Campus und Campus E-Mail wurde dasselbe Passwort oder eine leichte Abwandlung erkannt. Dieser Weg könnte den Angriff auf Campus E-Mail ausweiten. Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.',
      },
      's06.transition.master-campus-email-no-match': {
        body: 'Zwischen Master Campus und Campus E-Mail wurde hier keine solche Übereinstimmung erkannt. Dieser Weg führt in dieser Übung nicht weiter. Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.',
      },
      's06.local-check.campus-email-found': {
        heading: 'Lokaler Einzelcheck von Campus E-Mail',
        body: 'Auch dieses Passwort gilt hier als gefunden. Einzigartigkeit verhindert die Ausbreitung zwischen Konten, trotzdem sollte jedes Passwort auch für sich stark sein.',
      },
      's06.local-check.campus-email-blocked': {
        heading: 'Lokaler Einzelcheck von Campus E-Mail',
        body: 'Dieses Passwort wurde hier nicht gefunden. Das ist ein gutes Ergebnis für diese Übung.',
      },
    });
    expect(s06ConsequenceContent.narrations['s06.transition.s07']).toEqual({
      heading: 'Passwort sicher ersetzen',
      body: 'Ein Datenleck lässt sich nicht immer verhindern. Danach zählt, die Folgen zu begrenzen: das betroffene Passwort zügig ersetzen und für jedes Konto ein eigenes Passwort verwenden. Genau das machen wir jetzt bei Campusgram.',
    });
    expect(s06ConsequenceContent.narrations).toMatchObject({
      's06.summary.actual-none': {
        body: 'Hier bleibt der Angriff auf Campusgram begrenzt. Bei den anderen Konten führen diese Versuche nicht weiter.',
      },
      's06.summary.actual-one': {
        body: 'Bei einem weiteren Konto kann dasselbe Passwort oder eine leichte Abwandlung den Angriff weiterführen. So kann aus einem betroffenen Konto ein zweites werden.',
      },
      's06.summary.actual-both': {
        body: 'Bei beiden anderen Konten können dasselbe Passwort oder leichte Abwandlungen den Angriff weiterführen. So kann sich ein Datenleck auf mehrere Konten ausweiten.',
      },
      's06.summary.hypothetical-none': {
        body: 'Wäre das Campusgram-Passwort bekannt geworden, wäre der Angriff hier auf Campusgram begrenzt geblieben.',
      },
      's06.summary.hypothetical-one': {
        body: 'Wäre das Campusgram-Passwort bekannt geworden, hätte sich der Angriff auf ein weiteres Konto ausweiten können.',
      },
      's06.summary.hypothetical-both': {
        body: 'Wäre das Campusgram-Passwort bekannt geworden, hätte sich der Angriff auf beide anderen Konten ausweiten können.',
      },
    });
    expect(s06ConsequenceContent.comparisonResultLabels).toEqual({
      'exact-match': 'Dasselbe Passwort',
      'derived-variant-match': 'Leicht abgewandelt',
      'no-derived-path-recognized': 'Keine leichte Abwandlung erkannt',
    });
    expect(s06ConsequenceContent.transformationLabels).toMatchObject({
      'typical-suffix-changed-added-or-removed':
        'Ein kurzer typischer Anhang wurde verändert, ergänzt oder entfernt.',
      'separator-changed':
        'Ein übliches Trennzeichen wurde verändert, ergänzt oder entfernt.',
      'repeated-character-pattern-changed':
        'Das gleiche Wiederholungsmuster wurde mit einem anderen Zeichen verwendet.',
      'leading-or-trailing-component-removed':
        'Ein vollständiger vorangestellter oder angehängter Bestandteil wurde entfernt.',
      'bounded-component-replaced':
        'Ein einzelner klar abgegrenzter Bestandteil wurde innerhalb desselben Musters ausgetauscht.',
      'component-replacement-with-small-surface-changes':
        'Ein einzelner klar abgegrenzter Bestandteil und bis zu drei kleine typische Merkmale wurden verändert.',
      'bounded-surface-changes': 'Bis zu drei kleine typische Veränderungen wurden kombiniert.',
      'account-term-with-small-surface-changes':
        'Der Konto- oder Dienstbegriff und bis zu drei kleine typische Merkmale wurden verändert.',
      'repeated-pattern-with-small-surface-changes':
        'Das Wiederholungsmuster und bis zu drei kleine typische Merkmale wurden verändert.',
      'component-removal-with-small-surface-changes':
        'Ein vollständiger Randbestandteil und bis zu drei kleine typische Merkmale wurden verändert.',
    });
    const previewFixture = s06ConsequenceContent.fixtures.find(
      ({ id }) => id === 'reuse-and-derived',
    );
    expect(previewFixture?.accounts).toMatchObject({
      campusgram: { fictionalPassword: 'LunaCampusgram2026!' },
      'master-campus': { fictionalPassword: 'LunaMasterCampus2027?' },
      'campus-email': { fictionalPassword: 'LunaCampusgram2026!' },
    });
    const mixedFixture = s06ConsequenceContent.fixtures.find(
      ({ id }) => id === 'mixed-actual-hypothetical',
    );
    expect(mixedFixture?.accounts).toMatchObject({
      'master-campus': { fictionalPassword: 'rQ7mL2vX9pK4!' },
      'campus-email': { fictionalPassword: 'rQ7mL2vX9pK4?' },
    });
    expect(s06ConsequenceContent.dispositionLabels['whole-password-recognized']).toMatch(
      /vollständige(?:s|r) Passwort|vollständiger früher Kandidat/u,
    );
    expect(s06ConsequenceContent.dispositionLabels['no-whole-password-recognized']).toMatch(
      /vollständige(?:s|r) Passwort|vollständiger früher Kandidat/u,
    );
    expect(JSON.stringify(s06ConsequenceContent.narrations)).not.toMatch(
      /garantiert stark|Passwort ist sicher|Crack-Zeit/iu,
    );
    expect(s06ConsequenceContent.accounts['master-campus'].accountTerms).toEqual(
      accountContextTerms['master-campus'],
    );
    expect(s06ConsequenceContent.accounts['campus-email'].accountTerms).toEqual(
      accountContextTerms['campus-email'],
    );
    expect(s06ConsequenceContent.accounts.campusgram.accountTerms).toEqual(
      accountContextTerms.campusgram,
    );
  });

  it('keeps S07 linked to the passphrase-search browser state', () => {
    expect(S07_PASSPHRASE_SEARCH_CONTENT_VERSION).toBe('4.18.0');
    expect(s07PassphraseSearchContent.source.copyReference).toBe(
      s07EntryCopyReference,
    );
    expect(s07PassphraseSearchContent.browser.passwordChangeTitle).toBe('Passwort ändern');
    expect(s07PassphraseSearchContent.guide).toMatchObject({
      methodIntro:
        'Für das neue Campusgram-Passwort nutzen wir jetzt sechs zufällige, voneinander unabhängige Wörter. Ein solches Passwort nennt man Passphrase.',
      searchIntro:
        'Lass dir hier im eingeblendeten Browser eine solche Passphrase generieren und ersetze damit das betroffene Passwort.',
      generating: 'Passphrase wird erstellt …',
      mnemonicIntro:
        'Für jetzt musst du sie dir nicht merken. Im Alltag kann eine kleine Geschichte das Erinnern erleichtern.',
      campusgramSuccess:
        'Das Campusgram-Passwort ist jetzt ersetzt. Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.',
      remainingPlan:
        'Du kannst die betroffenen Konten im Netzwerk jetzt direkt mit einer eigenen Passphrase absichern.',
      finishAttack: 'Angriff abschließen',
      continueAttack: 'Angriff fortsetzen',
    });
    expect(s07PassphraseSearchContent.guide.mnemonic('Merksatz')).toBe('Beispiel: Merksatz');
    expect(
      s07PassphraseSearchContent.guide.accountSummary({
        masterCampusCampusgram: 'similar',
        campusEmailCampusgram: 'similar',
        masterCampusCampusEmail: 'similar',
        masterCampusEasyToGuess: false,
        campusEmailEasyToGuess: false,
      }),
    ).toBe(
      'Bei den anderen Konten wird noch dasselbe Passwort oder eine leichte Abwandlung verwendet.',
    );
    expect(
      s07PassphraseSearchContent.guide.accountSummary({
        masterCampusCampusgram: 'none',
        campusEmailCampusgram: 'none',
        masterCampusCampusEmail: 'none',
        masterCampusEasyToGuess: false,
        campusEmailEasyToGuess: true,
      }),
    ).toBe(
      'Die anderen Kontopasswörter sind bereits einzigartig. Mindestens eines lässt sich aber noch leicht erraten.',
    );
    expect(
      s07PassphraseSearchContent.guide.accountSummary({
        masterCampusCampusgram: 'similar',
        campusEmailCampusgram: 'identical',
        masterCampusCampusEmail: 'similar',
        masterCampusEasyToGuess: true,
        campusEmailEasyToGuess: true,
      }),
    ).toBe(
      'Bei den anderen Konten wird noch dasselbe Passwort oder eine leichte Abwandlung verwendet. Mindestens eines lässt sich außerdem leicht erraten.',
    );
    expect(
      s07PassphraseSearchContent.guide.accountSummary({
        masterCampusCampusgram: 'none',
        campusEmailCampusgram: 'none',
        masterCampusCampusEmail: 'none',
        masterCampusEasyToGuess: false,
        campusEmailEasyToGuess: false,
      }),
    ).toBe('Die anderen Kontopasswörter sind bereits einzigartig und schwer zu erraten.');
    expect(s07PassphraseSearchContent.browser.campusgramPasswordChangeCompleted).toEqual({
      title: 'Campusgram-Passwort wurde erfolgreich ersetzt',
      shieldLabels: {
        green: 'Einzigartig',
        blue: 'Stark',
      },
    });
    expect(s07PassphraseSearchContent.browser.searchTab.landingLabel).toBe('Neuer Tab');
    expect(s07PassphraseSearchContent.browser.searchTab.label).toBe('Passphrase generieren');
    expect(s07PassphraseSearchContent.browser.searchPage.brand).toBe('Search');
    expect(s07PassphraseSearchContent.browser.searchPage.landingAriaLabel).toBe(
      'Fiktive Suchseite für Passphrase generieren',
    );
    expect(s07PassphraseSearchContent.browser.searchPage.results).toHaveLength(9);
    expect(s07PassphraseSearchContent.browser.searchPage.resultsDelayMs).toBe(900);
    expect(s07PassphraseSearchContent.browser.generatorPage.separators).toEqual([
      { label: 'Bindestrich', value: '-' },
      { label: 'Punkt', value: '.' },
      { label: 'Unterstrich', value: '_' },
      { label: 'Leerzeichen', value: ' ' },
    ]);
    expect(s07PassphraseSearchContent.browser.generatorPage.generationDelayMs).toBe(500);
    expect(s07PassphraseSearchContent.browser.generatorPage).not.toHaveProperty('eyebrow');
    expect(s07PassphraseSearchContent.browser.generatorPage).not.toHaveProperty('securityMessage');
    expect(s07PassphraseSearchContent.browser.generatorPage.paste).toBe('Einsetzen');
    expect(s07PassphraseSearchContent.browser.generatorPage.passphrases).toEqual([
      {
        words: ['Plexiglas', 'Dorffest', 'Knirps', 'Monieren', 'Eistee', 'Bergbahn'],
        passWoMnemonic:
          'Am Plexiglas beim Dorffest steht ein Knirps und beginnt zu monieren, weil sein Eistee in der Bergbahn verschüttet wurde.',
      },
      {
        words: ['Infekt', 'Festbesuch', 'Textstellen', 'Gehirn', 'Korrumpiert', 'Physik'],
        passWoMnemonic:
          'Es gab ein Infekt am Festbesuch. Ganz viele Textstellen im Gehirn wurden korrumpiert. Das ist alles Physik.',
      },
      {
        words: ['Haartracht', 'Sommer', 'Seiltanz', 'Kennwort', 'Mythisch', 'Verfiel'],
        passWoMnemonic:
          'Eine riesige Haartracht schwankt im Sommer beim Seiltanz. Darin steht ein Kennwort, das mythisch leuchtet und plötzlich verfiel.',
      },
      {
        words: [
          'Popkultur',
          'Wohnsiedlung',
          'Holzarbeiten',
          'Drohung',
          'Streng',
          'Knieprobleme',
        ],
        passWoMnemonic:
          'Für die Popkultur-Ausstellung in der Wohnsiedlung mache ich Holzarbeiten. Nach einer Drohung werde ich streng ermahnt, wegen meiner Knieprobleme aufzuhören.',
      },
      {
        words: ['Nirgendwo', 'Querkommen', 'Finster', 'Appell', 'Ersuchen', 'Bleistift'],
        passWoMnemonic:
          'Im Nirgendwo versuche ich querzukommen, doch plötzlich wird es finster. Ich höre einen Appell, daraus wird ein Ersuchen, das ich mit einem Bleistift notiere.',
      },
    ]);
  });

  it('keeps S08 linked to the protected replay wording', () => {
    expect(S08_NETWORK_REPLAY_CONTENT_VERSION).toBe('3.7.0');
    expect(s08NetworkReplayContent.source.copyReference).toBe(s08CopyReference);
    expect(s08NetworkReplayContent.protectionAction).toBe(
      'Einzigartige Passphrase verwenden',
    );
    expect(s08NetworkReplayContent.relationLabels).toEqual({
      campusgramReuse: 'Dasselbe wie das alte',
      campusgramSimilar: 'Leicht abgewandelt zum alten',
      reuse: 'Dasselbe',
      similar: 'Leicht abgewandelt',
    });
    expect(s08NetworkReplayContent.replayActions).toEqual({
      attack: 'Angriff starten',
      finish: 'Zur Zusammenfassung',
    });
    expect(s08NetworkReplayContent.replayCompletion).toBe(
      'Konten wieder geschützt',
    );
    expect('replayLabels' in s08NetworkReplayContent).toBe(false);
  });

  it('keeps the S09 password summary linked to its password checklist', () => {
    expect(S09_PASSWORD_SUMMARY_CONTENT_VERSION).toBe('4.2.0');
    expect(s09PasswordSummaryContent.source.copyReference).toBe(s09CopyReference);
    expect(s09PasswordSummaryContent.principles).toHaveLength(6);
    expect(
      s09PasswordSummaryContent.principles.map(({ parts }) =>
        parts.map(({ text }) => text).join(''),
      ),
    ).toEqual([
      'Mindestens 15 Zeichen verwenden.',
      'Kein bestimmter Zeichenmix nötig: Länge ist wichtiger.',
      'Persönliche Angaben sowie Konto- oder Dienstbezüge vermeiden.',
      'Bestandteile ohne Zusammenhang wählen.',
      'Für jedes Konto ein eigenes Passwort verwenden.',
      'Merkbare Methode: mindestens sechs zufällig gewählte Wörter als Passphrase.',
    ]);
    expect(s09PasswordSummaryContent.principles[4].parts[1]).toEqual({
      text: 'eigenes',
      emphasis: 'positive-strong',
    });
    expect(s09PasswordSummaryContent.principles[5].parts[2]).toEqual({
      text: 'Passphrase',
      emphasis: 'info',
    });
    expect(s09PasswordSummaryContent.principles[0].parts[0]).toEqual({
      text: 'Mindestens 15 Zeichen',
      emphasis: 'info',
    });
    expect(s09PasswordSummaryContent.principles[2].parts[0].emphasis).toBe('strong');
    expect(s09PasswordSummaryContent.principles[2].parts[2].emphasis).toBe('strong');
    expect(s09PasswordSummaryContent.principles[2].parts[3]).toEqual({
      text: ' vermeiden',
      emphasis: 'info',
    });
    expect(s09PasswordSummaryContent.finishAction).toBe('Abschließen');
    expect(s09PasswordSummaryContent.scaling.studyAccountCount).toBe(134);
    expect(s09PasswordSummaryContent.scaling.accountCount).toBe(80);
    expect(s09PasswordSummaryContent.scaling.answer).toBe('Super easy!');
    expect(s09PasswordSummaryContent.passWo.steps).toHaveLength(6);
    expect(s09PasswordSummaryContent.passwordManagerAction).toEqual({
      title: 'Passwortmanager',
      detail: 'kennenlernen',
      ariaLabel: 'Passwortmanager kennenlernen',
    });
    expect(s09PasswordSummaryContent.passwordManagerTransition).toMatchObject({
      sectionLabel: 'Sektion 2 von 3',
      title: 'Passwortmanager',
      parts: [{ id: 'password-vault', label: 'Ein Tresor für alle deine Passwörter' }],
    });
  });
});

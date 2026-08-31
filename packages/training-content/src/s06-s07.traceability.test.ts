import { describe, expect, it } from 'vitest';
import { accountContextTerms } from './account-context-terms.js';
import { S06_CONSEQUENCE_CONTENT_VERSION, s06ConsequenceContent } from './s06.js';
import {
  deriveAdditionalPassphraseIds,
  predefinedPassphraseIdFor,
  resolvePredefinedPassphrase,
  S07_PASSPHRASE_SEARCH_CONTENT_VERSION,
  s07PassphraseSearchContent,
} from './s07.js';
import { S08_NETWORK_REPLAY_CONTENT_VERSION, s08NetworkReplayContent } from './s08.js';
import { S09_PASSWORD_SUMMARY_CONTENT_VERSION, s09PasswordSummaryContent } from './s09.js';

const s06AttackFlowCopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s06-erlebnisnahe-konsequenzcopy-26-august-2026';
const s07EntryCopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s07-direkter-abschluss-nach-campusgram-wechsel-26-august-2026';
const s08CopyReference =
  'docs/design/S08-S09-COPY-AUDIT.md#copy-delta-s08-s09-eigene-passwoerter-23-august-2026';
const s09CopyReference =
  'docs/design/S08-S09-COPY-AUDIT.md#copy-und-ablaufdelta-s09-dreiteilige-passwortmanager-roadmap-26-august-2026';

describe('S06 transition and S07 passphrase-search copy traceability', () => {
  it('keeps S06 consequence wording aligned with bounded whole-password recognition', () => {
    expect(S06_CONSEQUENCE_CONTENT_VERSION).toBe('2.51.0');
    expect(s06ConsequenceContent.source.copyReference).toBe(s06AttackFlowCopyReference);
    expect(s06ConsequenceContent.page.attackStart).toBe('Angriff starten');
    expect(s06ConsequenceContent.page.connectionCheck).toBe('Verbindung prüfen');
    expect(s06ConsequenceContent.page.finish).toBe('Fertig');
    expect(s06ConsequenceContent.page.localReflection).toEqual({
      passwordLabel: 'Fiktives Passwort',
      modeLabel: 'Modus:',
      groupLabel: 'Zusammenhang',
      newGroup: 'Neuer Zusammenhang',
      maxGroupCount: 3,
      maxGroups: 'Max. 3 Zusammenhänge',
      structureMode: 'Struktur',
      requiresMultipleComponents: 'Nur ein Teil erkannt.',
      personalMode: 'Persönliches',
      personalSelectionLabel: 'Persönliche Angaben im fiktiven Passwort markieren',
      passwordTitles: {
        'master-campus': 'Master Campus-Passwort',
        'campus-email': 'Campus E-Mail-Passwort',
      },
    });
    expect(s06ConsequenceContent.page.replacePassword).toBe('Passwort ersetzen');
    expect(s06ConsequenceContent.modes.hypothetical.overlay).toBe('Was wäre, wenn?');
    expect(s06ConsequenceContent.narrations['s06.incident.campusgram-found'].body).toBe(
      'Beim Campusgram-Datenleck stand das Passwort nicht im Klartext. Unsere Übung konnte es trotzdem ermitteln. Jetzt prüfen wir, ob dasselbe Passwort oder leichte Abwandlungen auch zu den anderen Konten führen.',
    );
    expect(s06ConsequenceContent.narrations['s06.incident.campusgram-blocked'].body).toBe(
      'Beim Campusgram-Datenleck stand das Passwort nicht im Klartext, und unsere Übung hat es nicht ermittelt. Mit den gestohlenen Passwortdaten kann aber weiter versucht werden, es zu ermitteln. Deshalb schauen wir kurz, was passiert, falls es später bekannt wird.',
    );
    expect(s06ConsequenceContent.narrations['s06.compare.exact-match'].body).toBe(
      'Wird dieses Passwort bekannt, kann es auch beim anderen Konto ausprobiert werden.',
    );
    expect(s06ConsequenceContent.narrations).toMatchObject({
      's06.compare.derived-variant-match': {
        body: 'Wird dieses Passwort bekannt, liegt die leichte Abwandlung beim anderen Konto nahe.',
      },
      's06.compare.no-derived-path-recognized': {
        body: 'Die hier geprüften Varianten führen nicht zum anderen Passwort.',
      },
    });
    expect(s06ConsequenceContent.narrations['s06.local-reflection.marking-guide']).toEqual({
      heading: 'Master Campus für sich',
      body: 'Markiere kurz Muster oder persönliche Angaben, die dir im Master-Campus-Passwort auffallen.',
    });
    expect(s06ConsequenceContent.narrations['s06.transition'].body).toBe(
      'Ein Datenleck kann bei jedem Konto passieren. Deshalb prüfen wir jetzt Master Campus für sich und seine Verbindung zur Campus E-Mail.',
    );
    expect(s06ConsequenceContent.narrations).toMatchObject({
      's06.perspective.master-campus-found': {
        body: 'Auch das Master-Campus-Passwort wird in unserer Übung gefunden. Unabhängig davon prüfen wir jetzt seine Verbindung zur Campus E-Mail.',
      },
      's06.perspective.master-campus-exhaustive-found': {
        body: 'Das vollständige Durchprobieren findet auch das Master-Campus-Passwort. Jetzt prüfen wir noch seine Verbindung zur Campus E-Mail.',
      },
      's06.perspective.master-campus-blocked': {
        body: 'Das Master-Campus-Passwort wurde hier nicht gefunden. Ob es mit der Campus E-Mail verbunden ist, prüfen wir trotzdem.',
      },
      's06.transition.master-campus-email-exact-match': {
        body: 'Master Campus und Campus E-Mail verwenden dasselbe Passwort. Wird eines bekannt, kann es auch beim anderen ausprobiert werden.',
      },
      's06.transition.master-campus-email-derived-variant-match': {
        body: 'Die beiden Passwörter sind leicht abgewandelt. Wird eines bekannt, liegt auch die andere Variante nahe.',
      },
      's06.transition.master-campus-email-no-match': {
        body: 'Zwischen den beiden wurde keine leichte Abwandlung erkannt.',
      },
      's06.transition.campus-email-local-check': {
        body: 'Zum Schluss prüfen wir das Campus-E-Mail-Passwort noch für sich.',
      },
      's06.local-check.campus-email-found': {
        heading: 'Campus E-Mail für sich',
        body: 'Auch das Campus-E-Mail-Passwort wird in unserer Übung gefunden. Es sollte deshalb später ersetzt werden.',
      },
      's06.local-check.campus-email-exhaustive-found': {
        heading: 'Campus E-Mail für sich',
        body: 'Das vollständige Durchprobieren findet auch das Campus-E-Mail-Passwort. Es sollte deshalb später ersetzt werden.',
      },
      's06.local-check.campus-email-blocked': {
        heading: 'Campus E-Mail für sich',
        body: 'Für sich wurde das Campus-E-Mail-Passwort in unserer Prüfung nicht gefunden.',
      },
    });
    expect(s06ConsequenceContent.narrations['s06.transition.s07']).toEqual({
      heading: 'Campusgram-Passwort ersetzen',
      body: 'Das Campusgram-Passwort ersetzen wir jetzt wegen des Datenlecks, unabhängig davon, wie schwer es hier zu erraten war. Die übrigen offenen Punkte beheben wir danach.',
    });
    expect(s06ConsequenceContent.narrations).toMatchObject({
      's06.summary.actual-none': {
        body: 'Von Campusgram führt hier weder dasselbe Passwort noch eine leichte Abwandlung zu den anderen Konten.',
      },
      's06.summary.actual-one': {
        body: 'Von Campusgram führt dasselbe Passwort oder eine leichte Abwandlung zu einem weiteren Konto.',
      },
      's06.summary.actual-both': {
        body: 'Von Campusgram führen dasselbe Passwort oder leichte Abwandlungen zu beiden anderen Konten.',
      },
      's06.summary.hypothetical-none': {
        body: 'Falls das Campusgram-Passwort später bekannt wird, bleibt dieser Weg auf Campusgram begrenzt.',
      },
      's06.summary.hypothetical-one': {
        body: 'Falls das Campusgram-Passwort später bekannt wird, ist über dasselbe Passwort oder eine leichte Abwandlung auch ein weiteres Konto gefährdet.',
      },
      's06.summary.hypothetical-both': {
        body: 'Falls das Campusgram-Passwort später bekannt wird, sind über dasselbe Passwort oder leichte Abwandlungen auch beide anderen Konten gefährdet.',
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
      'bounded-surface-changes':
        'Der gezeigte Änderungsweg liegt innerhalb der festgelegten Distanzgrenze.',
      'account-term-with-small-surface-changes':
        'Ein vollständiger Kontobegriff und höchstens zwei weitere Zeichenänderungen bilden den gezeigten Weg.',
      'repeated-pattern-with-small-surface-changes':
        'Das Wiederholungsmuster und bis zu drei kleine typische Merkmale wurden verändert.',
      'component-removal-with-small-surface-changes':
        'Ein vollständiger Randbestandteil und bis zu drei kleine typische Merkmale wurden verändert.',
    });
    expect(s06ConsequenceContent.transformationStepLabels).toEqual({
      'account-term-replacement': 'Kontobegriff ersetzt',
      'year-change': 'Jahreszahl verändert',
      'number-change': 'Zahlenbestandteil verändert',
      'suffix-change': 'Endzeichen oder kurzer Anhang verändert',
      'separator-change': 'Trennzeichen verändert',
      'capitalization-change': 'Groß- und Kleinschreibung verändert',
      'leet-substitution': 'Typische Zeichenersetzung',
      'character-substitution': 'Zeichen ersetzt',
      'character-insertion': 'Zeichen ergänzt',
      'character-deletion': 'Zeichen entfernt',
      'adjacent-transposition': 'Benachbarte Zeichen vertauscht',
    });
    expect(s06ConsequenceContent.comparisonPathLabels).toEqual({
      heading: 'Angreiferweg',
      emptyValue: 'nichts',
      exactValue: 'unverändert',
    });
    expect(s06ConsequenceContent.accounts.campusgram.comparisonIdentifiers).toEqual([
      'Campusgram',
      'Campus Gram',
      'Instagram',
      'Insta',
    ]);
    expect(s06ConsequenceContent.accounts['campus-email'].comparisonIdentifiers).not.toContain(
      'Mail',
    );
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
      /vollständige(?:s|r) Passwort|vollständiger früher Kandidat/iu,
    );
    expect(s06ConsequenceContent.dispositionLabels['no-whole-password-recognized']).toMatch(
      /vollständige(?:s|r) Passwort|vollständiger früher Kandidat/iu,
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
    expect(S07_PASSPHRASE_SEARCH_CONTENT_VERSION).toBe('4.23.0');
    expect(s07PassphraseSearchContent.source.copyReference).toBe(
      s07EntryCopyReference,
    );
    expect(s07PassphraseSearchContent.browser.passwordChangeTitle).toBe('Passwort ändern');
    expect(s07PassphraseSearchContent.browser.campusgramIncidentNotice).toEqual({
      title: 'Datenleck bei Campusgram',
      body: 'Bei Campusgram ist eine alte Datei mit gespeicherten Passwortdaten abgeflossen. Das Passwort stand darin nicht im Klartext.',
      advisory:
        'Mit diesen Daten können Angreifer trotzdem weiter mögliche Passwörter prüfen. Ändere deshalb dein Campusgram-Passwort.',
    });
    expect(s07PassphraseSearchContent.guide).toMatchObject({
      methodIntro:
        'Jetzt nutzen wir die Idee von vorhin: sechs zufällige, voneinander unabhängige Wörter. Ein solches Passwort nennt man Passphrase.',
      searchIntro:
        'Öffne den neuen Tab und lass dir dort eine Passphrase generieren. Danach setzt du sie bei Campusgram ein.',
      generating: 'Passphrase wird erstellt …',
      mnemonicIntro:
        'Für jetzt musst du sie dir nicht merken. Im Alltag kann eine kleine Geschichte das Erinnern erleichtern.',
      campusgramSuccess:
        'Das Campusgram-Passwort ist ersetzt. Selbst wenn das alte später aus den gestohlenen Passwortdaten ermittelt wird, funktioniert es dort nicht mehr.',
      remainingPlan:
        'Die übrigen offenen Punkte siehst du gleich wieder im Netzwerk. Verwende dort bei jedem markierten Konto eine eigene Passphrase, bis alle offenen Punkte behoben sind.',
      nothingOpen: 'Bei den anderen Konten ist hier nichts mehr offen.',
      finishAttack: 'Angriff abschließen',
      continueAttack: 'Offene Punkte beheben',
    });
    expect(s07PassphraseSearchContent.guide.mnemonic('Merksatz')).toBe('Beispiel: Merksatz');
    expect(s07PassphraseSearchContent.browser.campusgramPasswordChangeCompleted).toEqual({
      title: 'Campusgram-Passwort wurde erfolgreich ersetzt',
      shieldLabels: {
        green: 'Nur für dieses Konto',
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
    expect(s07PassphraseSearchContent.browser.searchPage.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'netzblick',
          description:
            'Praktische Orientierung zu Länge, eigenen Passwörtern und Merkbarkeit – ohne echte Konten oder persönliche Angaben zu verwenden.',
        }),
        expect.objectContaining({
          id: 'privacy-labor',
          title: 'Passphrase kompakt: zufällig, lang und für jedes Konto anders',
        }),
      ]),
    );
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
    expect(
      s07PassphraseSearchContent.browser.generatorPage.passphrases.map(
        ({ words, passWoMnemonic }) => ({ words, passWoMnemonic }),
      ),
    ).toEqual([
      {
        words: ['Plexiglas', 'Dorffest', 'Knirps', 'Monieren', 'Eistee', 'Bergbahn'],
        passWoMnemonic:
          'Beim Dorffest moniert ein Knirps am Plexiglas, weil sein Eistee in der Bergbahn verschüttet wurde.',
      },
      {
        words: ['Infekt', 'Festbesuch', 'Textstellen', 'Gehirn', 'Korrumpiert', 'Physik'],
        passWoMnemonic:
          'Nach dem Festbesuch korrumpiert ein Infekt Textstellen im Gehirn. Das ist offenbar Physik.',
      },
      {
        words: ['Haartracht', 'Sommer', 'Seiltanz', 'Kennwort', 'Mythisch', 'Verfiel'],
        passWoMnemonic:
          'Im Sommer schwankt beim Seiltanz eine Haartracht. Ein Kennwort leuchtete darin mythisch und verfiel.',
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
          'Für Popkultur entstehen Holzarbeiten in der Wohnsiedlung. Nach einer Drohung heißt es streng: Knieprobleme, Schluss.',
      },
      {
        words: ['Nirgendwo', 'Querkommen', 'Finster', 'Appell', 'Ersuchen', 'Bleistift'],
        passWoMnemonic:
          'Im Nirgendwo wird es beim Querkommen finster. Einen Appell und ein Ersuchen notiere ich mit Bleistift.',
      },
    ]);
    const selectedCampusgramId = predefinedPassphraseIdFor(0, '.');
    expect(selectedCampusgramId).toBe('passphrase-01-dot');
    expect(resolvePredefinedPassphrase(selectedCampusgramId)).toBe(
      'Plexiglas.Dorffest.Knirps.Monieren.Eistee.Bergbahn',
    );
    expect(deriveAdditionalPassphraseIds(selectedCampusgramId)).toEqual([
      'passphrase-02-hyphen',
      'passphrase-03-hyphen',
    ]);
  });

  it('keeps S08 linked to the protected replay wording', () => {
    expect(S08_NETWORK_REPLAY_CONTENT_VERSION).toBe('3.8.0');
    expect(s08NetworkReplayContent.source.copyReference).toBe(s08CopyReference);
    expect(s08NetworkReplayContent.protectionAction).toBe(
      'Eigene Passphrase verwenden',
    );
    expect(s08NetworkReplayContent.protectionActionDescription).toBe(
      'Das fiktive Passwort dieses betroffenen Kontos automatisch durch eine eigene Passphrase ersetzen.',
    );
    expect(s08NetworkReplayContent.protectionSummaries).toEqual({
      pending:
        'Auch für die noch betroffenen Konten können wir jeweils eine eigene Passphrase verwenden.',
      complete: 'Alle betroffenen Konten verwenden jetzt eigene Passphrasen.',
    });
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
      'Eigene Passphrasen eingerichtet',
    );
    expect('replayLabels' in s08NetworkReplayContent).toBe(false);
  });

  it('keeps the S09 password summary linked to its password checklist', () => {
    expect(S09_PASSWORD_SUMMARY_CONTENT_VERSION).toBe('4.9.0');
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
    expect(s09PasswordSummaryContent.scaling.answer).toBe('Weiter');
    expect(s09PasswordSummaryContent.passWo.steps).toEqual([
      'Für die drei Konten sind die offenen Probleme aufgelöst: Die Passwörter sind stark und keines ist mehr mit einem anderen verbunden.',
      'Im Alltag sind es aber deutlich mehr. Eine CHI-Studie von 2026 schätzt, dass eine typische Person im Laufe der Zeit Accounts bei rund 134 Online-Diensten hatte.',
      'Bleiben wir darunter: Wie realistisch wäre es für dich, für 80 Konten jeweils ein starkes, eigenes Passwort dauerhaft im Kopf zu behalten?',
      'Bei so vielen Konten wird die eigene Passwortverwaltung schnell unüberschaubar.',
      'Deshalb ist es nachvollziehbar, dass Passwörter wiederverwendet, leicht abgewandelt oder selbst notiert werden.',
      'Die Risiken davon hast du gerade gesehen. Auch ungeschützte Passwortlisten können selbst zum Risiko werden.',
      'Die gute Nachricht: Du musst dir all diese Passwörter auch gar nicht selbst merken.',
    ]);
    expect(s09PasswordSummaryContent.passwordManagerAction).toEqual({
      title: 'Passwortmanager',
      detail: 'kennenlernen',
      ariaLabel: 'Passwortmanager kennenlernen',
    });
    expect(s09PasswordSummaryContent.passwordManagerTransition).toEqual({
      sectionLabel: 'Sektion 2 von 3',
      title: 'Passwortmanager',
      parts: [
        { id: 'understand-password-managers', label: 'Passwortmanager verstehen' },
        { id: 'set-up-new-account', label: 'Neues Konto einrichten' },
        { id: 'update-existing-account', label: 'Bestehendes Konto umstellen' },
      ],
      holdDurationMs: 3500,
    });
  });
});

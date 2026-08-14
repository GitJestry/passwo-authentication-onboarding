import { describe, expect, it } from 'vitest';
import { accountContextTerms } from './account-context-terms.js';
import { S06_CONSEQUENCE_CONTENT_VERSION, s06ConsequenceContent } from './s06.js';
import {
  S07_PASSPHRASE_SEARCH_CONTENT_VERSION,
  s07PassphraseSearchContent,
} from './s07.js';
import { S08_NETWORK_REPLAY_CONTENT_VERSION, s08NetworkReplayContent } from './s08.js';

const s06AttackFlowCopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#darstellungs--und-ablaufdelta-s06-stabiler-campus-e-mail-befall-und-schlusszustand-14-august-2026';

describe('S06 transition and S07 passphrase-search copy traceability', () => {
  it('keeps S06 consequence wording aligned with bounded whole-password recognition', () => {
    expect(S06_CONSEQUENCE_CONTENT_VERSION).toBe('2.14.0');
    expect(s06ConsequenceContent.source.copyReference).toBe(s06AttackFlowCopyReference);
    expect(s06ConsequenceContent.page.attackStart).toBe('Angriff starten');
    expect(s06ConsequenceContent.page.finish).toBe('Fertig');
    expect(s06ConsequenceContent.modes.hypothetical.overlay).toBe('Was wäre, wenn?');
    expect(s06ConsequenceContent.narrations['s06.incident.campusgram-found'].body).toBe(
      'Da der Angreifer nun das Campusgram-Passwort kennt, probiert er dieses oder ähnliche Varianten davon bei den anderen Konten aus.',
    );
    expect(s06ConsequenceContent.narrations['s06.transition'].body).toBe(
      'Bislang begann der Angriff bei Campusgram. Welches Konto zuerst bekannt wird, lässt sich aber nicht vorhersagen. Deshalb schauen wir uns die Konten jetzt noch einmal aus einer anderen Ausgangslage an.',
    );
    expect(s06ConsequenceContent.narrations).toMatchObject({
      's06.perspective.master-campus-found': {
        body: 'Bei Master Campus wurde das vollständige Passwort in dieser begrenzten Prüfung als früher Kandidat erkannt. Von diesem Konto aus kann es nun bei Campusgram und Campus E-Mail ausprobiert werden.',
      },
      's06.perspective.master-campus-blocked': {
        body: 'Bei Master Campus wurde in dieser begrenzten Prüfung kein vollständiger früher Kandidat erkannt. Die möglichen weiteren Wege betrachten wir deshalb als „Was wäre, wenn?“.',
      },
      's06.incident.master-campus-hypothetical': {
        body: 'Angenommen, das Master-Campus-Passwort wäre bekannt geworden. Dann würde es oder eine ähnliche Variante bei Campusgram und Campus E-Mail ausprobiert.',
      },
      's06.transition.campus-email': {
        body: 'Zum Schluss verschieben wir das Datenleck zu Campus E-Mail und prüfen von dort beide anderen Konten.',
      },
      's06.local-check.campus-email-found': {
        body: 'Beim Campus-E-Mail-Passwort wurde ein vollständiger früher Kandidat erkannt. Von diesem Konto aus werden nun die beiden anderen Passwörter direkt im Netzwerk geprüft.',
      },
      's06.local-check.campus-email-blocked': {
        body: 'Beim Campus-E-Mail-Passwort wurde in dieser begrenzten Prüfung kein vollständiger früher Kandidat erkannt. Die möglichen weiteren Wege betrachten wir deshalb als „Was wäre, wenn?“.',
      },
      's06.transition.return-to-campusgram': {
        heading: 'Zurück zur Ausgangslage',
        body: 'Damit sind alle drei Ausgangslagen betrachtet. Als Nächstes kehren wir zur tatsächlichen Ausgangslage mit dem Datenleck bei Campusgram zurück.',
      },
      's06.summary.separated': {
        body: 'Die gezeigten Vergleiche erkannten weder Wiederverwendung noch eine abgeleitete Variante. In dieser Übung hatte das einen konkreten Schutzeffekt: Ein bekanntes Passwort führte nicht direkt zu einem weiteren Konto.',
      },
      's06.summary.connected': {
        body: 'Zwischen einigen Übungspasswörtern wurde Wiederverwendung oder eine abgeleitete Variante erkannt. Neue, voneinander unabhängige Passwörter würden die Ausbreitung eines bekannten Passworts stärker begrenzen.',
      },
    });
    expect(s06ConsequenceContent.narrations['s06.transition.s07']).toEqual({
      heading: 'Passphrase erstellen',
      body: 'Als Nächstes erstellen wir eine neue Passphrase.',
    });
    expect(s06ConsequenceContent.narrations).toMatchObject({
      's06.summary.actual-none': {
        body: 'Der Angriff blieb auf Campusgram begrenzt. Die beiden anderen Konten blieben in dieser Prüfung geschützt.',
      },
      's06.summary.actual-one': {
        body: 'Der Angriff konnte sich von Campusgram auf ein weiteres Konto ausbreiten. Das andere Konto blieb in dieser Prüfung geschützt.',
      },
      's06.summary.actual-both': {
        body: 'Der Angriff konnte sich von Campusgram auf beide anderen Konten ausbreiten.',
      },
      's06.summary.actual-source-blocked': {
        heading: 'Tatsächliche Ausgangslage',
        body: 'In der tatsächlichen Ausgangslage wurde das Campusgram-Passwort in dieser begrenzten Prüfung nicht gefunden. Der Angreifer bleibt deshalb außerhalb des Kontos.',
      },
      's06.summary.hypothetical-none': {
        body: 'Selbst wenn das Campusgram-Passwort bekannt gewesen wäre, wäre der Angriff in dieser Simulation auf Campusgram begrenzt geblieben. Die anderen Konten wären geschützt geblieben.',
      },
      's06.summary.hypothetical-one': {
        body: 'Wäre das Campusgram-Passwort bekannt gewesen, hätte sich der Angriff auf ein weiteres Konto ausbreiten können. Das andere wäre in dieser Prüfung geschützt geblieben.',
      },
      's06.summary.hypothetical-both': {
        body: 'Wäre das Campusgram-Passwort bekannt gewesen, hätte sich der Angriff auf beide anderen Konten ausbreiten können.',
      },
    });
    expect(s06ConsequenceContent.comparisonResultLabels).toEqual({
      'exact-match': 'Wiederverwendet',
      'derived-variant-match': 'Ähnlich',
      'no-derived-path-recognized': 'Keine Übereinstimmung',
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
    expect(S07_PASSPHRASE_SEARCH_CONTENT_VERSION).toBe('4.6.0');
    expect(s07PassphraseSearchContent.source.copyReference).toBe(
      'docs/design/S06-S07-COPY-AUDIT.md#copy--ablauf--und-darstellungsdelta-s07-generierungsbegleitung-15-august-2026',
    );
    expect(s07PassphraseSearchContent.browser.passwordChangeTitle).toBe('Passwort ändern');
    expect(s07PassphraseSearchContent.guide).toMatchObject({
      methodIntro:
        'Für ein starkes Passwort können wir mehrere zufällige Wörter zu einer langen Passphrase verbinden. So erreichen wir schnell mindestens 15 Zeichen, ohne ein selbst gewähltes Muster zu verwenden.',
      randomnessIntro:
        'Wichtig ist, dass die Wörter zufällig gewählt werden. Dafür verwenden wir hier eine Passphrase aus mindestens sechs zufälligen Wörtern.',
      searchIntro:
        'Du musst sie dir für diese Übung nicht merken. Suche nach einem Passphrase-Generator, erzeuge eine Passphrase und verwende sie für Campusgram.',
      generating: 'Passphrase wird erstellt …',
      campusgramSuccess:
        'Sehr gut geschützt. Dein altes Campusgram-Passwort ist ersetzt. Der Angreifer kann den Treffer aus dem Datenleck für dieses Konto jetzt nicht mehr verwenden.',
    });
    expect(s07PassphraseSearchContent.browser.campusgramPasswordChangeCompleted).toEqual({
      title: 'Passwort geändert',
      body: 'Die neue Passphrase wird jetzt für Campusgram verwendet.',
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
        words: ['Kaktus', 'Fenster', 'Regen', 'Komet', 'Lampe', 'Knochen'],
        passWoMnemonic:
          'Ein Kaktus sitzt am Fenster und es regnet Kometen. Meine Lampe sieht aus wie ein Knochen.',
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
        words: ['Pinguin', 'Leiter', 'Mango', 'Wolke', 'Fahrrad', 'Koffer'],
        passWoMnemonic:
          'Ein Pinguin steigt auf der Leiter mit einer Mango in der Hand bis zur Wolke. Dort oben ist ein Fahrrad im Koffer.',
      },
      {
        words: ['Nirgendwo', 'Querkommen', 'Finster', 'Appell', 'Ersuchen', 'Bleistift'],
        passWoMnemonic:
          'Im Nirgendwo versuche ich querzukommen, doch plötzlich wird es finster. Ich höre einen Appell, daraus wird ein Ersuchen, das ich mit einem Bleistift notiere.',
      },
    ]);
  });

  it('keeps S08 linked to the protected replay wording', () => {
    expect(S08_NETWORK_REPLAY_CONTENT_VERSION).toBe('1.1.0');
    expect(s08NetworkReplayContent.source.copyReference).toBe(
      'docs/design/S06-S07-COPY-AUDIT.md#copy--und-ablaufdelta-s07-passphrasenwechsel-und-s08-ubergang-14-august-2026',
    );
    expect(s08NetworkReplayContent.protectionAction).toBe(
      'Einzigartige Passphrase erstellen',
    );
    expect(s08NetworkReplayContent.allProtected).toBe(
      'Damit sind die betroffenen Konten mit eigenen Passphrasen geschützt. Jetzt spielen wir den Angriff ein letztes Mal durch und schauen, was sich verändert hat.',
    );
    expect(s08NetworkReplayContent.result).toBe(
      'Diesmal endet der Angriff bei dem alten geleakten Passwort. Es funktioniert nicht mehr bei Campusgram und kann auch nicht über Wiederverwendung auf deine anderen Konten übertragen werden.',
    );
  });
});

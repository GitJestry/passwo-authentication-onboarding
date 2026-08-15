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
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s06-rückkehr-zur-ausgangslage-15-august-2026';
const s07EntryCopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s07-passphrasen-eins-und-vier-15-august-2026';
const s08CopyReference =
  'docs/design/S08-S09-COPY-AUDIT.md#copy--und-darstellungsdelta-s09-passwortliste-und-rücksprung-15-august-2026';
const s09CopyReference =
  'docs/design/S08-S09-COPY-AUDIT.md#darstellungsdelta-s09-ohne-kategoriesymbole-15-august-2026';

describe('S06 transition and S07 passphrase-search copy traceability', () => {
  it('keeps S06 consequence wording aligned with bounded whole-password recognition', () => {
    expect(S06_CONSEQUENCE_CONTENT_VERSION).toBe('2.17.0');
    expect(s06ConsequenceContent.source.copyReference).toBe(s06AttackFlowCopyReference);
    expect(s06ConsequenceContent.page.attackStart).toBe('Angriff starten');
    expect(s06ConsequenceContent.page.finish).toBe('Fertig');
    expect(s06ConsequenceContent.page.replacePassword).toBe('Passwort ersetzen');
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
        body: 'Zum Schluss verschieben wir das Datenleck zu Campus E-Mail und prüfen dieses Passwort für sich.',
      },
      's06.local-check.campus-email-found': {
        heading: 'Lokaler Einzelcheck von Campus E-Mail',
        body: 'Beim Campus-E-Mail-Passwort wurde ein vollständiger früher Kandidat erkannt. Unabhängig von den Verbindungen zu anderen Konten lohnt es sich deshalb, auch dieses Passwort für sich stark zu wählen.',
      },
      's06.local-check.campus-email-blocked': {
        heading: 'Lokaler Einzelcheck von Campus E-Mail',
        body: 'Beim Campus-E-Mail-Passwort wurde in dieser begrenzten Prüfung kein vollständiger früher Kandidat erkannt. Das ist ein günstiges Ergebnis dieser Prüfung, aber keine allgemeine Sicherheitsgarantie.',
      },
      's06.transition.return-to-campusgram': {
        heading: 'Zurück zur Ausgangslage',
        body: 'Damit haben wir gesehen, warum Wiederverwendung und ähnliche Passwörter ein Datenleck auf weitere Konten ausweiten können.',
      },
      's06.summary.separated': {
        body: 'Die gezeigten Vergleiche erkannten weder Wiederverwendung noch eine abgeleitete Variante. In dieser Übung hatte das einen konkreten Schutzeffekt: Ein bekanntes Passwort führte nicht direkt zu einem weiteren Konto.',
      },
      's06.summary.connected': {
        body: 'Zwischen einigen Übungspasswörtern wurde Wiederverwendung oder eine abgeleitete Variante erkannt. Neue, voneinander unabhängige Passwörter würden die Ausbreitung eines bekannten Passworts stärker begrenzen.',
      },
    });
    expect(s06ConsequenceContent.narrations['s06.transition.s07']).toEqual({
      heading: 'Passwort sicher ersetzen',
      body: 'Was macht man nach so einem Datenleck? Das betroffene Passwort sollte zügig durch ein neues, starkes Passwort ersetzt werden.',
    });
    expect(s06ConsequenceContent.narrations).toMatchObject({
      's06.summary.actual-none': {
        body: 'Zurück zu unserer Ausgangslage: Der Angriff blieb auf Campusgram begrenzt. Die beiden anderen Konten blieben in dieser Prüfung geschützt.',
      },
      's06.summary.actual-one': {
        body: 'Zurück zu unserer Ausgangslage: Der Angriff konnte sich von Campusgram auf ein weiteres Konto ausbreiten. Das andere Konto blieb in dieser Prüfung geschützt.',
      },
      's06.summary.actual-both': {
        body: 'Zurück zu unserer Ausgangslage: Der Angriff konnte sich von Campusgram auf beide anderen Konten ausbreiten.',
      },
      's06.summary.actual-source-blocked': {
        heading: 'Tatsächliche Ausgangslage',
        body: 'Zurück zu unserer Ausgangslage: Das Campusgram-Passwort wurde in dieser begrenzten Prüfung nicht gefunden. Der Angreifer bleibt deshalb außerhalb des Kontos.',
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
    expect(S07_PASSPHRASE_SEARCH_CONTENT_VERSION).toBe('4.11.0');
    expect(s07PassphraseSearchContent.source.copyReference).toBe(
      s07EntryCopyReference,
    );
    expect(s07PassphraseSearchContent.browser.passwordChangeTitle).toBe('Passwort ändern');
    expect(s07PassphraseSearchContent.guide).toMatchObject({
      methodIntro:
        'Dafür nutzen wir eine Passphrase: eine einfache Methode, starke Passwörter nur aus Wörtern zu bilden.',
      randomnessIntro:
        'Ein geläufiges Wort kann zwar lang sein, wird von Angreifern aber früh ausprobiert. Eine Passphrase aus mindestens sechs zufälligen, unzusammenhängenden Wörtern macht das Erraten dagegen deutlich aufwendiger.',
      searchIntro:
        'Lass dir online eine Passphrase generieren und ersetze damit das betroffene Passwort.',
      generating: 'Passphrase wird erstellt …',
      mnemonicIntro:
        'Für jetzt musst du sie dir nicht merken. Im Alltag kann eine kleine Geschichte das Erinnern erleichtern.',
      campusgramSuccess:
        'Campusgram ist jetzt geschützt. Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.',
      allAccountsProtected:
        'Auch deine anderen Konten sind bereits stark und einzigartig. Schau dir jetzt an, wie der Angriff mit deinen geschützten Konten endet.',
      remainingPlan:
        'Schau dir jetzt an, was der Angriff noch erreichen kann. Offene Konten kannst du dort direkt mit einer eigenen Passphrase absichern.',
      finishAttack: 'Angriff abschließen',
      continueAttack: 'Angriff fortsetzen',
    });
    expect(s07PassphraseSearchContent.guide.mnemonic('Merksatz')).toBe('Beispiel: Merksatz');
    expect(
      s07PassphraseSearchContent.guide.accountFeedback.strongSimilar(
        'Master Campus',
        'deinem alten Campusgram-Passwort',
      ),
    ).toBe(
      'Das Passwort von Master Campus ist für sich betrachtet stark, ähnelt aber noch deinem alten Campusgram-Passwort.',
    );
    expect(
      s07PassphraseSearchContent.guide.accountFeedback.uniqueGuessable('Campus E-Mail'),
    ).toBe(
      'Das Passwort von Campus E-Mail ist einzigartig, lässt sich aber noch leicht erraten.',
    );
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
    expect(S08_NETWORK_REPLAY_CONTENT_VERSION).toBe('3.3.0');
    expect(s08NetworkReplayContent.source.copyReference).toBe(s08CopyReference);
    expect(s08NetworkReplayContent.protectionAction).toBe(
      'Einzigartige Passphrase verwenden',
    );
    expect(s08NetworkReplayContent.replayActions).toEqual({
      attack: 'Angriff starten',
      finish: 'Zum Überblick',
    });
    expect(s08NetworkReplayContent.replayCompletion).toBe(
      'Konten wieder geschützt',
    );
    expect('replayLabels' in s08NetworkReplayContent).toBe(false);
  });

  it('keeps the S09 password summary linked to its password checklist', () => {
    expect(S09_PASSWORD_SUMMARY_CONTENT_VERSION).toBe('2.3.0');
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
      'Einfache Methode: mindestens sechs zufällig gewählte Wörter als Passphrase.',
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
  });
});

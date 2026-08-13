import { describe, expect, it } from 'vitest';
import { accountContextTerms } from './account-context-terms.js';
import { S06_CONSEQUENCE_CONTENT_VERSION, s06ConsequenceContent } from './s06.js';
import { S07_EVALUATION_CONTENT_VERSION, s07EvaluationContent } from './s07.js';

const recognitionCopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s06-s07-vollpasswort-treffer-statt-guess-schwelle-11-august-2026';
const s06AttackFlowCopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-und-ablaufdelta-s06-real-und-hypothetisch-ab-campusgram-12-august-2026';

describe('S06 and S07 whole-password recognition copy traceability', () => {
  it('keeps S06 consequence wording aligned with bounded whole-password recognition', () => {
    expect(S06_CONSEQUENCE_CONTENT_VERSION).toBe('2.8.0');
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
      's06.summary.actual-none': {
        body: 'Der Angriff blieb auf Campusgram begrenzt. Die beiden anderen Konten blieben in dieser Prüfung geschützt.',
      },
      's06.summary.actual-one': {
        body: 'Der Angriff konnte sich von Campusgram auf ein weiteres Konto ausbreiten. Das andere Konto blieb in dieser Prüfung geschützt.',
      },
      's06.summary.actual-both': {
        body: 'Der Angriff konnte sich von Campusgram auf beide anderen Konten ausbreiten.',
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

  it('keeps S07 whole-password recognition and length-orientation findings separate', () => {
    expect(S07_EVALUATION_CONTENT_VERSION).toBe('1.2.0');
    expect(s07EvaluationContent.source.copyReference).toBe(recognitionCopyReference);
    expect(s07EvaluationContent.page.overviewLabels.noWholePasswordRecognition).toBe(
      'Kein vollständiger früher Kandidat erkannt',
    );
    expect(s07EvaluationContent.problemStatements['local-whole-password-recognized']).toMatch(
      /vollständiges Passwort/u,
    );
    expect(s07EvaluationContent.problemStatements['below-length-orientation']).toMatch(
      /15-Zeichen-Orientierung/u,
    );
    expect(s07EvaluationContent.recommendationLabels['rebuild-below-length-orientation']).toMatch(
      /mindestens 15 Zeichen/u,
    );
  });
});

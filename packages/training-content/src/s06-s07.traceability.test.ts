import { describe, expect, it } from 'vitest';
import { accountContextTerms } from './account-context-terms.js';
import { S06_CONSEQUENCE_CONTENT_VERSION, s06ConsequenceContent } from './s06.js';
import { S07_EVALUATION_CONTENT_VERSION, s07EvaluationContent } from './s07.js';

const recognitionCopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s06-s07-vollpasswort-treffer-statt-guess-schwelle-11-august-2026';

describe('S06 and S07 whole-password recognition copy traceability', () => {
  it('keeps S06 consequence wording aligned with bounded whole-password recognition', () => {
    expect(S06_CONSEQUENCE_CONTENT_VERSION).toBe('2.4.0');
    expect(s06ConsequenceContent.source.copyReference).toBe(recognitionCopyReference);
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

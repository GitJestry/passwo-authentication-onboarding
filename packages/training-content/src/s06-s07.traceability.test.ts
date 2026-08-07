import { describe, expect, it } from 'vitest';
import { accountContextTerms } from './account-context-terms.js';
import { S06_CONSEQUENCE_CONTENT_VERSION, s06ConsequenceContent } from './s06.js';
import { S07_EVALUATION_CONTENT_VERSION, s07EvaluationContent } from './s07.js';

const s06CopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s06-authored-kontextbegriffe-und-begrenzte-fuzzy-erkennung-6-august-2026';
const s07CopyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-vollstaendiger-pruefweg-und-laengenorientierung-3-august-2026';

describe('S06 and S07 bounded guess-path copy traceability', () => {
  it('keeps S06 consequence wording aligned with the complete bounded path', () => {
    expect(S06_CONSEQUENCE_CONTENT_VERSION).toBe('2.3.3');
    expect(s06ConsequenceContent.source.copyReference).toBe(s06CopyReference);
    expect(s06ConsequenceContent.dispositionLabels['quick-path-recognized']).toMatch(
      /vollständiger Prüfweg/u,
    );
    expect(s06ConsequenceContent.dispositionLabels['no-quick-path-recognized']).toMatch(
      /vollständiger Prüfweg/u,
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

  it('keeps S07 guess-path and length-orientation findings separate', () => {
    expect(S07_EVALUATION_CONTENT_VERSION).toBe('1.1.0');
    expect(s07EvaluationContent.source.copyReference).toBe(s07CopyReference);
    expect(s07EvaluationContent.problemStatements['local-quick-path']).toMatch(
      /vollständigen Prüfweg/u,
    );
    expect(s07EvaluationContent.problemStatements['below-length-orientation']).toMatch(
      /15-Zeichen-Orientierung/u,
    );
    expect(s07EvaluationContent.recommendationLabels['rebuild-below-length-orientation']).toMatch(
      /mindestens 15 Zeichen/u,
    );
  });
});

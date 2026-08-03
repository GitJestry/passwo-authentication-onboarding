import { describe, expect, it } from 'vitest';
import { S06_CONSEQUENCE_CONTENT_VERSION, s06ConsequenceContent } from './s06.js';
import { S07_EVALUATION_CONTENT_VERSION, s07EvaluationContent } from './s07.js';

const copyReference =
  'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-vollstaendiger-pruefweg-und-laengenorientierung-3-august-2026';

describe('S06 and S07 bounded guess-path copy traceability', () => {
  it('keeps S06 consequence wording aligned with the complete bounded path', () => {
    expect(S06_CONSEQUENCE_CONTENT_VERSION).toBe('2.3.1');
    expect(s06ConsequenceContent.source.copyReference).toBe(copyReference);
    expect(s06ConsequenceContent.dispositionLabels['quick-path-recognized']).toMatch(
      /vollständiger Prüfweg/u,
    );
    expect(s06ConsequenceContent.dispositionLabels['no-quick-path-recognized']).toMatch(
      /vollständiger Prüfweg/u,
    );
    expect(JSON.stringify(s06ConsequenceContent.narrations)).not.toMatch(
      /garantiert stark|Passwort ist sicher|Crack-Zeit/iu,
    );
  });

  it('keeps S07 guess-path and length-orientation findings separate', () => {
    expect(S07_EVALUATION_CONTENT_VERSION).toBe('1.1.0');
    expect(s07EvaluationContent.source.copyReference).toBe(copyReference);
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

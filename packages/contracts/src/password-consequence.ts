export type PasswordFindingConfidence = 'authored-exact-match' | 'bounded-heuristic';

export interface PasswordEvidenceSpan {
  readonly type: 'span';
  readonly start: number;
  readonly end: number;
  readonly token: string;
}

export interface PasswordEvidenceToken {
  readonly type: 'token';
  readonly token: string;
}

export type PasswordEvidence = PasswordEvidenceSpan | PasswordEvidenceToken;

export type PasswordSingleFindingKind =
  | 'common-password-core'
  | 'year'
  | 'simple-number-sequence'
  | 'repeated-component'
  | 'account-or-service-term'
  | 'typical-suffix'
  | 'no-simple-component-recognized';

export interface PasswordSingleFinding {
  readonly id: string;
  readonly kind: PasswordSingleFindingKind;
  readonly evidence: readonly PasswordEvidence[];
  readonly explanationId: string;
  readonly confidence: PasswordFindingConfidence;
}

export interface PasswordAnalysisResult {
  readonly kind: 'fictional-password-analysis';
  readonly findings: readonly PasswordSingleFinding[];
  readonly disclaimerId: 'simulation-not-production-strength';
}

export type PasswordComparisonOutcome = 'identical' | 'similar' | 'no-derived-path-recognized';

export type PasswordComparisonFindingKind =
  | 'exact-match'
  | 'shared-core-with-bounded-transformation'
  | 'no-derived-path-recognized';

export type PasswordComparisonTransformation =
  | 'case-change'
  | 'common-character-substitution'
  | 'typical-suffix-change';

export interface PasswordComparisonFinding {
  readonly id: string;
  readonly kind: PasswordComparisonFindingKind;
  readonly evidence: readonly PasswordEvidence[];
  readonly explanationId: string;
  readonly confidence: PasswordFindingConfidence;
  readonly transformations: readonly PasswordComparisonTransformation[];
}

export interface PasswordComparisonResult {
  readonly kind: 'fictional-password-comparison';
  readonly outcome: PasswordComparisonOutcome;
  readonly findings: readonly PasswordComparisonFinding[];
  readonly disclaimerId: 'simulation-not-production-strength';
}

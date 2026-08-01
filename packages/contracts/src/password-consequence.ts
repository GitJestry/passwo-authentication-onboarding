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

export type AuthoredStructureRelation =
  | 'thematic-relation'
  | 'sentence-structure'
  | 'exact-repetition'
  | 'password-context';

export interface AuthoredStructureDemonstration {
  readonly kind: 'authoredStructureDemonstration';
  readonly id: string;
  readonly relation: AuthoredStructureRelation;
  readonly title: string;
  readonly tokens: readonly string[];
  readonly connectionLabel: string;
  readonly passWoExplanation: string;
  readonly boundaryNote: string;
}

export type RuntimeStructureFindingKind =
  | 'exact-component-repetition'
  | 'account-context-with-qualifier'
  | 'number-marker-with-typical-suffix'
  | 'no-simple-structure-recognized';

export interface RuntimeStructureFinding {
  readonly kind: 'runtimeStructureFinding';
  readonly id: string;
  readonly findingKind: RuntimeStructureFindingKind;
  readonly evidence: readonly PasswordEvidence[];
  readonly explanationId: string;
  readonly confidence: PasswordFindingConfidence;
}

export interface PasswordStructureAnalysisResult {
  readonly kind: 'fictional-password-structure-analysis';
  readonly findings: readonly RuntimeStructureFinding[];
  readonly disclaimerId: 'bounded-rules-not-strength-assessment';
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

export interface AuthoredPasswordComparisonFixture {
  readonly fixtureId: string;
  readonly kind: 'authored-fixture';
  readonly sourcePassword: string;
  readonly targetPassword: string;
  readonly sceneContext: {
    readonly sourceAccountId: string;
    readonly targetAccountId: string;
    readonly context: 'actual-selection' | 'hypothetical-example';
  };
  readonly comparisonResult: PasswordComparisonResult;
}

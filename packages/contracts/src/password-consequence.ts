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

export interface ExhaustiveSearchDuration {
  readonly wholeSeconds: bigint;
  readonly remainingCandidates: bigint;
  readonly attemptsPerSecond: bigint;
}

export interface TheoreticalSearchSpaceModel {
  readonly kind: 'theoretical-search-space-model';
  readonly alphabetSize: number;
  readonly length: number;
  readonly attemptsPerSecond: bigint;
  readonly totalCandidateCount: bigint;
  readonly exhaustiveSearchDuration: ExhaustiveSearchDuration;
  readonly assumptions: {
    readonly independentlyRandomCharacters: true;
    readonly fixedAlphabet: true;
    readonly exhaustiveSearch: true;
  };
}

export type SimulationQuickPathRuleId =
  | 'very-short-string'
  | 'common-password-core-with-typical-change'
  | 'account-context-with-predictable-qualifier'
  | 'clearly-repeated-explainable-structure';

export type LocalPasswordDisposition =
  | {
      readonly kind: 'quick-path-recognized';
      readonly ruleId: SimulationQuickPathRuleId;
      readonly explanationId: `s05.disposition.${SimulationQuickPathRuleId}`;
    }
  | {
      readonly kind: 'no-quick-path-recognized';
      readonly explanationId: 's05.disposition.no-quick-path-recognized';
    };

/** @deprecated Use LocalPasswordDisposition for new local simulation code. */
export type PasswordSimulationDisposition = LocalPasswordDisposition;

export type PasswordRelationKind =
  | 'exact-match'
  | 'derived-variant-match'
  | 'no-derived-path-recognized';

export type PasswordTransformationId =
  | 'account-or-service-term-replaced'
  | 'bounded-year-changed'
  | 'typical-suffix-changed-or-added'
  | 'account-term-and-year-changed'
  | 'account-term-and-suffix-changed'
  | 'year-and-suffix-changed'
  | 'account-term-year-and-suffix-changed';

export interface ExactPasswordRelation {
  readonly kind: 'exact-match';
  readonly relationId: string;
  readonly sourceEvidence: readonly PasswordEvidenceSpan[];
  readonly targetEvidence: readonly PasswordEvidenceSpan[];
  readonly explanationId: 's06.relation.exact-match';
}

export interface DerivedVariantPasswordRelation {
  readonly kind: 'derived-variant-match';
  readonly relationId: string;
  readonly transformationId: PasswordTransformationId;
  readonly sourceEvidence: readonly PasswordEvidenceSpan[];
  readonly targetEvidence: readonly PasswordEvidenceSpan[];
  readonly candidate: string;
  readonly explanationId: `s06.relation.${PasswordTransformationId}`;
}

export interface NoDerivedPathPasswordRelation {
  readonly kind: 'no-derived-path-recognized';
  readonly relationId: string;
  readonly sourceEvidence: readonly [];
  readonly targetEvidence: readonly [];
  readonly explanationId: 's06.relation.no-derived-path-recognized';
}

export type PasswordRelation =
  | ExactPasswordRelation
  | DerivedVariantPasswordRelation
  | NoDerivedPathPasswordRelation;

export interface PasswordComparisonResult {
  readonly kind: 'fictional-password-comparison';
  readonly relation: PasswordRelation;
  readonly disclaimerId: 'simulation-not-production-strength';
}

export interface FictionalPasswordComparisonInput {
  readonly sourcePassword: string;
  readonly targetPassword: string;
  readonly authoredAccountAndServiceTerms: readonly string[];
}

export type S06AccountId = 'master-campus' | 'campus-email' | 'campusgram';
export type IncidentSource = S06AccountId;
export type PasswordConsequenceSceneMode = 'actual' | 'hypothetical';

export interface S06LocalAccountAnalysis {
  readonly accountId: S06AccountId;
  readonly fictionalPassword: string;
  readonly disposition: LocalPasswordDisposition;
  readonly retrievalStatus: 'retrievable' | 'not-remembered' | 'assisted';
}

export interface S06PairComparison {
  readonly sourceAccountId: S06AccountId;
  readonly targetAccountId: S06AccountId;
  readonly result: PasswordComparisonResult;
}

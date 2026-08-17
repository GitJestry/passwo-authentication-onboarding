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
  | 'common-word'
  | 'common-name'
  | 'keyboard-pattern'
  | 'year'
  | 'date'
  | 'simple-character-sequence'
  | 'predictable-word-sequence'
  | 'repeated-component'
  | 'account-or-service-term'
  | 'typical-transformation'
  | 'typical-suffix'
  | 'no-simple-component-recognized';

export interface PasswordSingleFinding {
  readonly id: string;
  readonly kind: PasswordSingleFindingKind;
  readonly evidence: readonly PasswordEvidence[];
  readonly explanationId: string;
  readonly confidence: PasswordFindingConfidence;
}

export type PasswordGuessPathPattern =
  | 'dictionary'
  | 'keyboard'
  | 'repeat'
  | 'sequence'
  | 'date'
  | 'brute-force'
  | 'separator'
  | 'other';

export interface PasswordGuessPathMatch {
  readonly pattern: PasswordGuessPathPattern;
  readonly start: number;
  readonly end: number;
  readonly sourceId: string | null;
}

export interface PasswordGuessPathAnalysis {
  readonly engineId: 'zxcvbn-ts';
  readonly configurationVersion: string;
  /** Pattern path retained only for bounded explanatory projection; no numerical score is exposed. */
  readonly matches: readonly PasswordGuessPathMatch[];
}

export type PasswordSemanticReflectionSelection =
  | 'personal-meaning'
  | 'shared-theme'
  | 'sentence-or-familiar-phrase'
  | 'none-or-unsure';

export interface PasswordSemanticReflection {
  readonly kind: 'local-password-semantic-reflection';
  readonly selected: readonly PasswordSemanticReflectionSelection[];
  readonly confirmed: boolean;
}

/**
 * Transient, participant-confirmed relations between spans of one fictional password. These
 * relations are local training evidence only. They must never be persisted, exported or treated
 * as an objective password-strength measurement.
 */
export type TransientPasswordSemanticRelationKind =
  | 'personal-context'
  | 'shared-content'
  | 'sentence-or-phrase';

export interface TransientPasswordSemanticRelation {
  readonly id: string;
  readonly kind: TransientPasswordSemanticRelationKind;
  readonly evidence: readonly PasswordEvidenceSpan[];
}

export interface TransientPasswordSemanticEvidence {
  readonly kind: 'transient-password-semantic-evidence';
  readonly confirmed: boolean;
  readonly relations: readonly TransientPasswordSemanticRelation[];
}

export interface PasswordAnalysisResult {
  readonly kind: 'fictional-password-analysis';
  readonly findings: readonly PasswordSingleFinding[];
  readonly guessPath: PasswordGuessPathAnalysis;
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
  | 'recognized-repetition-pattern'
  | 'predictable-component-sequence'
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

export type SimulationWholePasswordRecognitionRuleId =
  | 'whole-password-recognized-value'
  | 'whole-password-recognized-bounded-variant'
  | 'whole-password-recognized-semantic-path';
export type PasswordLengthOrientation = 'below-15' | 'at-least-15';

interface LocalPasswordDispositionBase {
  readonly lengthOrientation: PasswordLengthOrientation;
  readonly analysisVersion: string;
}

export type LocalPasswordDisposition =
  | (LocalPasswordDispositionBase & {
      readonly kind: 'whole-password-recognized';
      readonly ruleId:
        | 'whole-password-recognized-value'
        | 'whole-password-recognized-bounded-variant';
      readonly findingIds: readonly string[];
      readonly explanationId:
        | 's05.disposition.whole-password-recognized-value'
        | 's05.disposition.whole-password-recognized-bounded-variant';
    })
  | (LocalPasswordDispositionBase & {
      readonly kind: 'whole-password-recognized';
      readonly ruleId: 'whole-password-recognized-semantic-path';
      readonly findingIds: readonly string[];
      readonly semanticRelationIds: readonly string[];
      readonly explanationId: 's05.disposition.whole-password-recognized-semantic-path';
    })
  | (LocalPasswordDispositionBase & {
      readonly kind: 'no-whole-password-recognized';
      readonly explanationId: 's05.disposition.no-whole-password-recognized';
    });

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

export type S06AccountId = 'master-campus' | 'campus-email' | 'campusgram';
export type IncidentSource = S06AccountId;
export type PasswordConsequenceSceneMode = 'actual' | 'hypothetical';
export type S06RetrievalStatus = 'retrievable' | 'not-remembered' | 'assisted';

export interface S06PairComparison {
  readonly sourceAccountId: S06AccountId;
  readonly targetAccountId: S06AccountId;
  readonly result: PasswordComparisonResult;
}

export interface S06ResolvedAccountFinding {
  readonly accountId: S06AccountId;
  readonly disposition: LocalPasswordDisposition;
  readonly retrievalStatus: S06RetrievalStatus;
}

export interface S06ResolvedConsequencePath {
  readonly sourceAccountId: S06AccountId;
  readonly targetAccountId: S06AccountId;
  readonly mode: PasswordConsequenceSceneMode;
  readonly relationKind: PasswordRelationKind;
  readonly targetReached: boolean;
}

export interface S06ResolvedConsequenceResult {
  readonly incidentSource: IncidentSource;
  readonly accounts: readonly S06ResolvedAccountFinding[];
  readonly paths: readonly S06ResolvedConsequencePath[];
  readonly affectedAccountIds: readonly S06AccountId[];
}

export const s07RecommendationIds = [
  'replace-exposed-password',
  'separate-exact-reuse',
  'rebuild-predictable-password',
  'rebuild-below-length-orientation',
  'replace-derived-pattern',
  'improve-retrievability',
  'no-change-practice-method',
] as const;

export type S07RecommendationId = (typeof s07RecommendationIds)[number];

export type S07IncidentStatus =
  | 'source-of-incident'
  | 'reached-via-exact-reuse'
  | 'reached-via-derived-variant'
  | 'not-reached'
  | 'hypothetical-only';

export type S07Retrievability = 'remembered' | 'not-remembered' | 'skipped';

export type S07ProblemClass =
  | 'local-whole-password-recognized'
  | 'below-length-orientation'
  | 'exact-reuse'
  | 'derived-variant'
  | 'retrievability';

export interface S07AccountConnection {
  readonly accountId: S06AccountId;
  readonly relationKind: PasswordRelationKind;
}

export interface S07AccountRecommendation {
  readonly accountId: S06AccountId;
  readonly disposition: LocalPasswordDisposition;
  readonly connections: readonly S07AccountConnection[];
  readonly incidentStatus: S07IncidentStatus;
  readonly retrievability: S07Retrievability;
  readonly recommendationId: S07RecommendationId;
}

export interface S07RecommendationSummary {
  readonly noWholePasswordRecognitionCount: number;
  readonly noPasswordConnectionCount: number;
  readonly rememberedCount: number;
  readonly problemClasses: readonly S07ProblemClass[];
}

export interface S07RecommendationProjection {
  readonly kind: 's07-recommendation-projection';
  readonly accounts: readonly S07AccountRecommendation[];
  readonly summary: S07RecommendationSummary;
}

export type S07RecommendationProjectionInput = S06ResolvedConsequenceResult;

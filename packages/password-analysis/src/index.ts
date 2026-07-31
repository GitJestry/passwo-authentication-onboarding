import type { SegmentId } from '@passwo/contracts';

export type FictionalPasswordFindingKind =
  | 'obvious-component'
  | 'predictable-structure'
  | 'free-search'
  | 'identical-reuse'
  | 'similar-pattern'
  | 'no-simple-path-recognized';

export interface FictionalPasswordFinding {
  readonly kind: FictionalPasswordFindingKind;
  readonly explanationId: string;
  readonly confidence: 'bounded-example' | 'heuristic';
}

export interface FictionalPasswordAnalysisContext {
  readonly segmentId: Extract<SegmentId, 'S05' | 'S06'>;
  readonly fictionalAccountId: string;
}

export interface FictionalPasswordAnalysisResult {
  readonly findings: readonly FictionalPasswordFinding[];
  readonly disclaimerId: 'simulation-not-production-meter';
}

export interface FictionalPasswordAnalysisPort {
  analyze(
    fictionalInput: string,
    context: FictionalPasswordAnalysisContext,
  ): FictionalPasswordAnalysisResult;
}

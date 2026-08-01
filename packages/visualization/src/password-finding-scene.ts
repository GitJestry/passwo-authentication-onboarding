import type { PasswordAnalysisResult, PasswordSingleFinding } from '@passwo/contracts';

export interface PasswordFindingSceneSnapshot {
  readonly id: string;
  readonly runtimeAnalysis: PasswordAnalysisResult;
  readonly prioritizedFindings: readonly PasswordSingleFinding[];
  readonly omittedFindingCount: number;
  readonly accessibleSummary: string;
}

export const MAX_VISIBLE_PASSWORD_FINDINGS = 2;

export function createPasswordFindingScene(
  id: string,
  runtimeAnalysis: PasswordAnalysisResult,
): PasswordFindingSceneSnapshot {
  const prioritizedFindings = runtimeAnalysis.findings.slice(0, MAX_VISIBLE_PASSWORD_FINDINGS);
  return {
    id,
    runtimeAnalysis,
    prioritizedFindings,
    omittedFindingCount: Math.max(
      0,
      runtimeAnalysis.findings.length - prioritizedFindings.length,
    ),
    accessibleSummary:
      prioritizedFindings.length === 1 &&
      prioritizedFindings[0]?.kind === 'no-simple-component-recognized'
        ? 'In der begrenzten lokalen Analyse wurde kein einfacher Bestandteil erkannt.'
        : `${prioritizedFindings.length} priorisierte, begrenzte Befunde wurden lokal erkannt.`,
  };
}

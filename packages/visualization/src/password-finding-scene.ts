import type { PasswordAnalysisResult, PasswordSingleFinding } from '@passwo/contracts';

export interface PasswordFindingSceneSnapshot {
  readonly id: string;
  readonly analysis: PasswordAnalysisResult;
  readonly prioritizedFindings: readonly PasswordSingleFinding[];
  readonly omittedFindingCount: number;
  readonly accessibleSummary: string;
}

export function createPasswordFindingScene(
  id: string,
  analysis: PasswordAnalysisResult,
  maximumVisibleFindings = 3,
): PasswordFindingSceneSnapshot {
  const boundedMaximum = Math.max(2, Math.min(3, Math.trunc(maximumVisibleFindings)));
  const prioritizedFindings = analysis.findings.slice(0, boundedMaximum);
  return {
    id,
    analysis,
    prioritizedFindings,
    omittedFindingCount: Math.max(0, analysis.findings.length - prioritizedFindings.length),
    accessibleSummary:
      prioritizedFindings.length === 1 &&
      prioritizedFindings[0]?.kind === 'no-simple-component-recognized'
        ? 'In der begrenzten lokalen Analyse wurde kein einfacher Bestandteil erkannt.'
        : `${prioritizedFindings.length} priorisierte, begrenzte Befunde wurden lokal erkannt.`,
  };
}

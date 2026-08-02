import type {
  AuthoredStructureDemonstration,
  PasswordEvidenceSpan,
  PasswordSemanticReflection,
  PasswordStructureAnalysisResult,
  RuntimeStructureFinding,
} from '@passwo/contracts';

export interface PasswordStructureSceneSnapshot {
  readonly id: string;
  readonly authoredDemonstrations: readonly AuthoredStructureDemonstration[];
  readonly runtimeAnalysis: PasswordStructureAnalysisResult;
  readonly semanticReflection: PasswordSemanticReflection;
  readonly prioritizedRuntimeFindings: readonly RuntimeStructureFinding[];
  readonly highlightedSpans: readonly PasswordEvidenceSpan[];
  readonly omittedFindingCount: number;
  readonly accessibleSummary: string;
}

function highlightedEvidenceSpans(
  findings: readonly RuntimeStructureFinding[],
): readonly PasswordEvidenceSpan[] {
  const spans = findings
    .flatMap(({ evidence }) => evidence)
    .filter((evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span')
    .sort((left, right) => left.start - right.start || left.end - right.end);
  const normalized: PasswordEvidenceSpan[] = [];
  for (const span of spans) {
    const previous = normalized.at(-1);
    if (previous === undefined || span.start >= previous.end) {
      normalized.push(span);
      continue;
    }
    if (span.end <= previous.end) continue;
    normalized[normalized.length - 1] = {
      type: 'span',
      start: previous.start,
      end: span.end,
      token: `${previous.token}${span.token.slice(previous.end - span.start)}`,
    };
  }
  return normalized;
}

const emptySemanticReflection: PasswordSemanticReflection = {
  kind: 'local-password-semantic-reflection',
  selected: [],
  confirmed: false,
};

export function createPasswordStructureScene(
  id: string,
  authoredDemonstrations: readonly AuthoredStructureDemonstration[],
  runtimeAnalysis: PasswordStructureAnalysisResult,
  semanticReflection: PasswordSemanticReflection = emptySemanticReflection,
): PasswordStructureSceneSnapshot {
  const prioritizedRuntimeFindings = runtimeAnalysis.findings.slice(0, 2);
  const noneRecognized =
    prioritizedRuntimeFindings.length === 1 &&
    prioritizedRuntimeFindings[0]?.findingKind === 'no-simple-structure-recognized';
  const substantiveReflectionCount = semanticReflection.selected.filter(
    (selection) => selection !== 'none-or-unsure',
  ).length;
  const automaticSummary = noneRecognized
    ? 'Die Übung hat keinen einfachen Zusammenhang erkannt.'
    : `${prioritizedRuntimeFindings.length} markierte Zusammenhänge mit konkreten Stellen.`;
  const reflectionSummary =
    semanticReflection.confirmed && substantiveReflectionCount > 0
      ? ` ${substantiveReflectionCount} lokale Einordnung(en) bestätigt.`
      : semanticReflection.confirmed
        ? ' Keine zusätzliche lokale Einordnung bestätigt.'
        : '';
  return {
    id,
    authoredDemonstrations,
    runtimeAnalysis,
    semanticReflection,
    prioritizedRuntimeFindings,
    highlightedSpans: highlightedEvidenceSpans(prioritizedRuntimeFindings),
    omittedFindingCount: Math.max(0, runtimeAnalysis.findings.length - 2),
    accessibleSummary: `${automaticSummary}${reflectionSummary}`,
  };
}

import type {
  PasswordAnalysisResult,
  PasswordEvidenceSpan,
  PasswordSimulationDisposition,
  PasswordStructureAnalysisResult,
  TheoreticalSearchSpaceModel,
} from '@passwo/contracts';

export interface TheoreticalSearchSpaceMeasurement {
  readonly model: TheoreticalSearchSpaceModel;
  readonly durationLabel: string;
}

export interface PasswordFreeSearchDemonstrationSceneSnapshot {
  readonly id: string;
  readonly lowercaseMeasurements: readonly TheoreticalSearchSpaceMeasurement[];
  readonly generatedCharacterModel: TheoreticalSearchSpaceModel;
  readonly lowercaseReferenceModel: TheoreticalSearchSpaceModel;
  readonly generatedModelHasLargerSearchSpace: boolean;
  readonly accessibleSummary: string;
}

export interface PasswordFreeSearchApplicationSceneSnapshot {
  readonly id: string;
  readonly visibleLength: number;
  readonly componentAnalysis: PasswordAnalysisResult;
  readonly structureAnalysis: PasswordStructureAnalysisResult;
  readonly disposition: PasswordSimulationDisposition;
  readonly areasWithoutRecognizedSimplerExplanation: readonly PasswordEvidenceSpan[];
  readonly accessibleSummary: string;
}

export interface PasswordFreeSearchDemonstrationSceneDefinition {
  readonly id: string;
  readonly lowercaseMeasurements: readonly TheoreticalSearchSpaceMeasurement[];
  readonly generatedCharacterModel: TheoreticalSearchSpaceModel;
  readonly lowercaseReferenceModel: TheoreticalSearchSpaceModel;
}

function concreteEvidenceSpans(
  componentAnalysis: PasswordAnalysisResult,
  structureAnalysis: PasswordStructureAnalysisResult,
): readonly PasswordEvidenceSpan[] {
  const spans = [...componentAnalysis.findings, ...structureAnalysis.findings]
    .flatMap(({ evidence }) => evidence)
    .filter((evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span')
    .sort((left, right) => left.start - right.start || left.end - right.end);
  const merged: PasswordEvidenceSpan[] = [];
  for (const span of spans) {
    const previous = merged.at(-1);
    if (previous === undefined || span.start > previous.end) {
      merged.push(span);
      continue;
    }
    if (span.end <= previous.end) continue;
    merged[merged.length - 1] = {
      type: 'span',
      start: previous.start,
      end: span.end,
      token: `${previous.token}${span.token.slice(previous.end - span.start)}`,
    };
  }
  return merged;
}

function unexplainedSpans(
  fictionalPassword: string,
  recognizedSpans: readonly PasswordEvidenceSpan[],
): readonly PasswordEvidenceSpan[] {
  const spans: PasswordEvidenceSpan[] = [];
  let cursor = 0;
  for (const recognized of recognizedSpans) {
    if (cursor < recognized.start) {
      spans.push({
        type: 'span',
        start: cursor,
        end: recognized.start,
        token: fictionalPassword.slice(cursor, recognized.start),
      });
    }
    cursor = Math.max(cursor, recognized.end);
  }
  if (cursor < fictionalPassword.length) {
    spans.push({
      type: 'span',
      start: cursor,
      end: fictionalPassword.length,
      token: fictionalPassword.slice(cursor),
    });
  }
  return spans;
}

export function createPasswordFreeSearchDemonstrationScene({
  id,
  lowercaseMeasurements,
  generatedCharacterModel,
  lowercaseReferenceModel,
}: PasswordFreeSearchDemonstrationSceneDefinition): PasswordFreeSearchDemonstrationSceneSnapshot {
  return {
    id,
    lowercaseMeasurements,
    generatedCharacterModel,
    lowercaseReferenceModel,
    generatedModelHasLargerSearchSpace:
      generatedCharacterModel.totalCandidateCount > lowercaseReferenceModel.totalCandidateCount,
    accessibleSummary:
      'Beispiel mit festgelegten Annahmen: unabhängige Zufallsauswahl aus festem Zeichenvorrat, vollständiges Durchprobieren und eine Billion Versuche pro Sekunde. Die Uhr vergleicht nur die gezeigten Zeichenfolgen.',
  };
}

export function createPasswordFreeSearchApplicationScene(
  id: string,
  fictionalPassword: string,
  componentAnalysis: PasswordAnalysisResult,
  structureAnalysis: PasswordStructureAnalysisResult,
  disposition: PasswordSimulationDisposition,
): PasswordFreeSearchApplicationSceneSnapshot {
  const recognizedSpans = concreteEvidenceSpans(componentAnalysis, structureAnalysis);
  const dispositionSummary =
    disposition.kind === 'quick-path-recognized'
      ? 'Die erkannten Hinweise ergeben zusammen einen entsprechend kurzen vollständigen Prüfweg.'
      : 'Die erkannten Hinweise ergaben keinen entsprechend kurzen vollständigen Prüfweg. Das bedeutet nicht stark, sicher, zufällig oder unangreifbar.';
  return {
    id,
    visibleLength: [...fictionalPassword].length,
    componentAnalysis,
    structureAnalysis,
    disposition,
    areasWithoutRecognizedSimplerExplanation: unexplainedSpans(fictionalPassword, recognizedSpans),
    accessibleSummary: `Was die Übung beim fiktiven Passwort zeigt: sichtbare Länge, erkannte Bestandteile, erkannte Zusammenhänge und Bereiche ohne erkannte einfachere Erklärung. ${dispositionSummary} Keine Zeitprognose und kein einzelnes Gesamturteil.`,
  };
}

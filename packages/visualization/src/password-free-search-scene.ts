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

export type PasswordApplicationRecognitionState =
  | 'whole-password-recognized'
  | 'components-recognized'
  | 'no-component-recognized';

export interface PasswordApplicationCoverageArea extends PasswordEvidenceSpan {
  readonly status: 'recognized' | 'unexplained';
}

export interface PasswordFreeSearchApplicationSceneSnapshot {
  readonly id: string;
  readonly visibleLength: number;
  readonly componentAnalysis: PasswordAnalysisResult;
  readonly structureAnalysis: PasswordStructureAnalysisResult;
  readonly disposition: PasswordSimulationDisposition;
  readonly recognitionState: PasswordApplicationRecognitionState;
  readonly recognizedAreas: readonly PasswordEvidenceSpan[];
  readonly areasWithoutRecognizedSimplerExplanation: readonly PasswordEvidenceSpan[];
  readonly coverageAreas: readonly PasswordApplicationCoverageArea[];
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

function coverageAreas(
  recognizedAreas: readonly PasswordEvidenceSpan[],
  unexplainedAreas: readonly PasswordEvidenceSpan[],
): readonly PasswordApplicationCoverageArea[] {
  return [
    ...recognizedAreas.map((span) => ({ ...span, status: 'recognized' as const })),
    ...unexplainedAreas.map((span) => ({ ...span, status: 'unexplained' as const })),
  ].sort((left, right) => left.start - right.start || left.end - right.end);
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
  const recognizedAreas = concreteEvidenceSpans(componentAnalysis, structureAnalysis);
  const unexplainedAreas = unexplainedSpans(fictionalPassword, recognizedAreas);
  const recognitionState: PasswordApplicationRecognitionState =
    disposition.kind === 'whole-password-recognized'
      ? 'whole-password-recognized'
      : recognizedAreas.length > 0
        ? 'components-recognized'
        : 'no-component-recognized';
  const recognitionSummary =
    recognitionState === 'whole-password-recognized'
      ? 'Ein einzelner früher Kandidat oder eine begrenzte typische Variante deckt das vollständige fiktive Passwort ab.'
      : recognitionState === 'components-recognized'
        ? 'Die Übung erkennt Bestandteile, aber keinen einzelnen frühen Kandidaten oder begrenzten Variantenweg für das vollständige Passwort.'
        : 'Die Übung erkennt in den dargestellten Prüfungen keinen frühen Kandidaten für das vollständige Passwort.';
  const lengthSummary =
    disposition.lengthOrientation === 'below-15'
      ? 'Die Zeichenfolge liegt zusätzlich unter der Orientierung von mindestens 15 Zeichen für selbst erstellte Passwörter.'
      : 'Die Zeichenfolge erreicht zusätzlich die Orientierung von mindestens 15 Zeichen für selbst erstellte Passwörter.';
  return {
    id,
    visibleLength: [...fictionalPassword].length,
    componentAnalysis,
    structureAnalysis,
    disposition,
    recognitionState,
    recognizedAreas,
    areasWithoutRecognizedSimplerExplanation: unexplainedAreas,
    coverageAreas: coverageAreas(recognizedAreas, unexplainedAreas),
    accessibleSummary: `${recognitionSummary} ${lengthSummary} Die beiden Aussagen bleiben getrennt. Keine Crack-Zeit und keine Sicherheitsgarantie.`,
  };
}

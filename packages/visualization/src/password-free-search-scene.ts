import type {
  PasswordAnalysisResult,
  PasswordSimulationDisposition,
  PasswordSingleFinding,
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
  readonly disposition: PasswordSimulationDisposition;
  readonly explanatoryFindings: readonly PasswordSingleFinding[];
  readonly accessibleSummary: string;
}

export interface PasswordFreeSearchDemonstrationSceneDefinition {
  readonly id: string;
  readonly lowercaseMeasurements: readonly TheoreticalSearchSpaceMeasurement[];
  readonly generatedCharacterModel: TheoreticalSearchSpaceModel;
  readonly lowercaseReferenceModel: TheoreticalSearchSpaceModel;
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
  disposition: PasswordSimulationDisposition,
): PasswordFreeSearchApplicationSceneSnapshot {
  const explanatoryFindings =
    disposition.kind === 'whole-password-recognized'
      ? componentAnalysis.findings.filter(({ id: findingId }) =>
          disposition.findingIds.includes(findingId),
        )
      : componentAnalysis.findings;
  const recognitionSummary =
    disposition.kind === 'whole-password-recognized'
      ? 'Ein einzelner früher Kandidat oder eine begrenzte typische Variante deckt das vollständige fiktive Passwort ab.'
      : explanatoryFindings.length > 0
        ? 'Die Übung erkennt Bestandteile, aber keinen einzelnen frühen Kandidaten oder begrenzten Variantenweg für das vollständige Passwort.'
        : 'Die Übung erkennt in den dargestellten Prüfungen keinen frühen Kandidaten für das vollständige Passwort.';
  const lengthSummary =
    disposition.lengthOrientation === 'below-15'
      ? 'Die Zeichenfolge liegt zusätzlich unter der Orientierung von mindestens 15 Zeichen für selbst erstellte Passwörter.'
      : 'Die Zeichenfolge erreicht zusätzlich die Orientierung von mindestens 15 Zeichen für selbst erstellte Passwörter.';
  return {
    id,
    visibleLength: [...fictionalPassword].length,
    disposition,
    explanatoryFindings,
    accessibleSummary: `${recognitionSummary} ${lengthSummary} Die beiden Aussagen bleiben getrennt. Keine Crack-Zeit und keine Sicherheitsgarantie.`,
  };
}

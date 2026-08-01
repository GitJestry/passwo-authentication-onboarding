export interface TheoreticalSearchSpaceDemonstration {
  readonly kind: 'theoretical-search-space-demonstration';
  readonly id: string;
  readonly characterGroups: readonly string[];
  readonly participantPasswordCrackTime: 'not-modeled';
}

export interface PasswordCandidateCheck {
  readonly id: string;
  readonly candidate: string;
  readonly source: 'free-search-example' | 'likely-component-example';
  readonly comparison: 'not-match';
}

export interface PasswordCandidateSceneSnapshot {
  readonly id: string;
  readonly candidates: readonly PasswordCandidateCheck[];
  readonly comparisonMarkerId: string;
  readonly theoreticalSearchSpace: TheoreticalSearchSpaceDemonstration;
  readonly accessibleSummary: string;
}

export interface PasswordCandidateSceneDefinition {
  readonly id: string;
  readonly candidates: readonly string[];
  readonly theoreticalSearchSpaceId: string;
  readonly characterGroups: readonly string[];
}

export function createPasswordCandidateScene(
  definition: PasswordCandidateSceneDefinition,
): PasswordCandidateSceneSnapshot {
  return {
    id: definition.id,
    candidates: definition.candidates.map((candidate, index) => ({
      id: `${definition.id}:candidate:${index}`,
      candidate,
      source: index === 2 ? 'free-search-example' : 'likely-component-example',
      comparison: 'not-match',
    })),
    comparisonMarkerId: 'candidate-marker',
    theoreticalSearchSpace: {
      kind: 'theoretical-search-space-demonstration',
      id: definition.theoreticalSearchSpaceId,
      characterGroups: definition.characterGroups,
      participantPasswordCrackTime: 'not-modeled',
    },
    accessibleSummary:
      'Authored Kandidaten werden erzeugt und als nicht passend am abstrakten Vergleichsmarker geprüft.',
  };
}

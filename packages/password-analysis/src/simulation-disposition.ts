import type {
  PasswordAnalysisResult,
  PasswordSimulationDisposition,
  PasswordStructureAnalysisResult,
  SimulationQuickPathRuleId,
} from '@passwo/contracts';

export interface PasswordSimulationDispositionInput {
  readonly fictionalPassword: string;
  readonly componentAnalysis: PasswordAnalysisResult;
  readonly structureAnalysis: PasswordStructureAnalysisResult;
}

function quickPath(ruleId: SimulationQuickPathRuleId): PasswordSimulationDisposition {
  return {
    kind: 'quick-path-recognized',
    ruleId,
    explanationId: `s05.disposition.${ruleId}`,
  };
}

export function determinePasswordSimulationDisposition({
  fictionalPassword,
  componentAnalysis,
  structureAnalysis,
}: PasswordSimulationDispositionInput): PasswordSimulationDisposition {
  if ([...fictionalPassword].length < 8) return quickPath('very-short-string');

  const componentKinds = new Set(componentAnalysis.findings.map(({ kind }) => kind));
  if (
    componentKinds.has('common-password-core') &&
    (componentKinds.has('year') ||
      componentKinds.has('simple-number-sequence') ||
      componentKinds.has('typical-suffix'))
  ) {
    return quickPath('common-password-core-with-typical-change');
  }

  const structureKinds = new Set(structureAnalysis.findings.map(({ findingKind }) => findingKind));
  if (structureKinds.has('account-context-with-qualifier')) {
    return quickPath('account-context-with-predictable-qualifier');
  }
  if (structureKinds.has('exact-component-repetition')) {
    return quickPath('clearly-repeated-explainable-structure');
  }

  return {
    kind: 'no-quick-path-recognized',
    explanationId: 's05.disposition.no-quick-path-recognized',
  };
}

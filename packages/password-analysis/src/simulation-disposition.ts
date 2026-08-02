import type {
  PasswordAnalysisResult,
  PasswordLengthOrientation,
  PasswordSimulationDisposition,
} from '@passwo/contracts';
import { PASSWORD_ANALYSIS_CONFIGURATION_VERSION } from './password-guessing-analysis.js';

// Study-specific low-budget simulation boundary, not a security or NIST threshold.
export const QUICK_PATH_GUESS_THRESHOLD = 100_000;
export const SELF_CREATED_PASSWORD_LENGTH_ORIENTATION = 15;

export interface PasswordSimulationDispositionInput {
  readonly fictionalPassword: string;
  readonly componentAnalysis: PasswordAnalysisResult;
}

function lengthOrientationFor(fictionalPassword: string): PasswordLengthOrientation {
  return [...fictionalPassword].length < SELF_CREATED_PASSWORD_LENGTH_ORIENTATION
    ? 'below-15'
    : 'at-least-15';
}

export function determinePasswordSimulationDisposition({
  fictionalPassword,
  componentAnalysis,
}: PasswordSimulationDispositionInput): PasswordSimulationDisposition {
  const base = {
    estimatedGuesses: componentAnalysis.guessPath.estimatedGuesses,
    quickPathThreshold: QUICK_PATH_GUESS_THRESHOLD,
    lengthOrientation: lengthOrientationFor(fictionalPassword),
    analysisVersion: PASSWORD_ANALYSIS_CONFIGURATION_VERSION,
  } as const;

  if (componentAnalysis.guessPath.estimatedGuesses <= QUICK_PATH_GUESS_THRESHOLD) {
    return {
      ...base,
      kind: 'quick-path-recognized',
      ruleId: 'bounded-complete-guess-path',
      explanationId: 's05.disposition.bounded-complete-guess-path',
    };
  }

  return {
    ...base,
    kind: 'no-quick-path-recognized',
    explanationId: 's05.disposition.no-quick-path-recognized',
  };
}

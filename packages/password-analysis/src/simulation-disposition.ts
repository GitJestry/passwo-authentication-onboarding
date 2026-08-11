import type {
  PasswordAnalysisResult,
  PasswordEvidenceSpan,
  PasswordLengthOrientation,
  PasswordSimulationDisposition,
  PasswordSingleFinding,
  PasswordSingleFindingKind,
  SimulationWholePasswordRecognitionRuleId,
} from '@passwo/contracts';
import { PASSWORD_ANALYSIS_CONFIGURATION_VERSION } from './password-guessing-analysis.js';

export const SELF_CREATED_PASSWORD_LENGTH_ORIENTATION = 15;

export interface PasswordSimulationDispositionInput {
  readonly fictionalPassword: string;
  readonly componentAnalysis: PasswordAnalysisResult;
}

const wholeCandidateKinds = new Set<PasswordSingleFindingKind>([
  'common-password-core',
  'common-word',
  'common-name',
  'keyboard-pattern',
  'year',
  'date',
  'simple-character-sequence',
  'predictable-word-sequence',
  'repeated-component',
  'account-or-service-term',
]);

const boundedVariantAnchorKinds = new Set<PasswordSingleFindingKind>([
  'common-password-core',
  'common-word',
  'common-name',
  'account-or-service-term',
]);

function lengthOrientationFor(fictionalPassword: string): PasswordLengthOrientation {
  return [...fictionalPassword].length < SELF_CREATED_PASSWORD_LENGTH_ORIENTATION
    ? 'below-15'
    : 'at-least-15';
}

function findingSpans(finding: PasswordSingleFinding): readonly PasswordEvidenceSpan[] {
  return finding.evidence.filter(
    (evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span',
  );
}

function spansWholePassword(span: PasswordEvidenceSpan, fictionalPassword: string): boolean {
  return (
    fictionalPassword.length > 0 &&
    span.start === 0 &&
    span.end === fictionalPassword.length &&
    span.token === fictionalPassword
  );
}

function directWholePasswordRecognition(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
): SimulationWholePasswordRecognitionRuleId | null {
  const wholeCandidate = findings.find(
    (finding) =>
      wholeCandidateKinds.has(finding.kind) &&
      findingSpans(finding).some((span) => spansWholePassword(span, fictionalPassword)),
  );
  if (wholeCandidate === undefined) return null;

  const hasWholeTransformation = findings.some(
    (finding) =>
      finding.kind === 'typical-transformation' &&
      findingSpans(finding).some((span) => spansWholePassword(span, fictionalPassword)),
  );
  return hasWholeTransformation
    ? 'whole-password-recognized-bounded-variant'
    : 'whole-password-recognized-value';
}

function exactConnectorEnd(fictionalPassword: string, start: number): number {
  const connector = fictionalPassword.slice(start, start + 1);
  return connector === '-' || connector === '_' || connector === '.' ? start + 1 : start;
}

function hasOnlyTypicalTerminalPunctuation(fictionalPassword: string, start: number): boolean {
  const suffix = fictionalPassword.slice(start);
  return suffix.length > 0 && /^[!?#$._-]+$/u.test(suffix);
}

function boundedVariantRecognition(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
): SimulationWholePasswordRecognitionRuleId | null {
  if (fictionalPassword.length === 0) return null;

  const anchors = findings
    .filter((finding) => boundedVariantAnchorKinds.has(finding.kind))
    .flatMap((finding) => findingSpans(finding))
    .filter((span) => span.start === 0 && span.end < fictionalPassword.length);
  const suffixes = findings
    .filter((finding) => finding.kind === 'typical-suffix')
    .flatMap((finding) => findingSpans(finding));
  const calendarParts = findings
    .filter((finding) => finding.kind === 'year' || finding.kind === 'date')
    .flatMap((finding) => findingSpans(finding));

  for (const anchor of anchors) {
    if (
      suffixes.some(
        (suffix) => suffix.start === anchor.end && suffix.end === fictionalPassword.length,
      )
    ) {
      return 'whole-password-recognized-bounded-variant';
    }

    const calendarStart = exactConnectorEnd(fictionalPassword, anchor.end);
    for (const calendar of calendarParts) {
      if (calendar.start !== calendarStart) continue;
      if (
        calendar.end === fictionalPassword.length ||
        hasOnlyTypicalTerminalPunctuation(fictionalPassword, calendar.end)
      ) {
        return 'whole-password-recognized-bounded-variant';
      }
      if (
        suffixes.some(
          (suffix) => suffix.start === calendar.end && suffix.end === fictionalPassword.length,
        )
      ) {
        return 'whole-password-recognized-bounded-variant';
      }
    }
  }
  return null;
}

export function determinePasswordSimulationDisposition({
  fictionalPassword,
  componentAnalysis,
}: PasswordSimulationDispositionInput): PasswordSimulationDisposition {
  const base = {
    lengthOrientation: lengthOrientationFor(fictionalPassword),
    analysisVersion: PASSWORD_ANALYSIS_CONFIGURATION_VERSION,
  } as const;
  const recognitionRule =
    directWholePasswordRecognition(fictionalPassword, componentAnalysis.findings) ??
    boundedVariantRecognition(fictionalPassword, componentAnalysis.findings);

  if (recognitionRule !== null) {
    return {
      ...base,
      kind: 'whole-password-recognized',
      ruleId: recognitionRule,
      explanationId: `s05.disposition.${recognitionRule}`,
    };
  }

  return {
    ...base,
    kind: 'no-whole-password-recognized',
    explanationId: 's05.disposition.no-whole-password-recognized',
  };
}

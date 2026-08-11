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
): {
  readonly ruleId: SimulationWholePasswordRecognitionRuleId;
  readonly findingIds: readonly string[];
} | null {
  const wholeCandidate = findings.find(
    (finding) =>
      wholeCandidateKinds.has(finding.kind) &&
      findingSpans(finding).some((span) => spansWholePassword(span, fictionalPassword)),
  );
  if (wholeCandidate === undefined) return null;

  const transformation = findings.find(
    (finding) =>
      finding.kind === 'typical-transformation' &&
      findingSpans(finding).some((span) => spansWholePassword(span, fictionalPassword)),
  );
  return {
    ruleId: transformation !== undefined
      ? 'whole-password-recognized-bounded-variant'
      : 'whole-password-recognized-value',
    findingIds:
      transformation === undefined
        ? [wholeCandidate.id]
        : [wholeCandidate.id, transformation.id],
  };
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
): {
  readonly ruleId: SimulationWholePasswordRecognitionRuleId;
  readonly findingIds: readonly string[];
} | null {
  if (fictionalPassword.length === 0) return null;

  const anchors = findings.flatMap((finding) =>
    boundedVariantAnchorKinds.has(finding.kind)
      ? findingSpans(finding)
          .filter((span) => span.start === 0 && span.end < fictionalPassword.length)
          .map((span) => ({ finding, span }))
      : [],
  );
  const suffixes = findings.flatMap((finding) =>
    finding.kind === 'typical-suffix'
      ? findingSpans(finding).map((span) => ({ finding, span }))
      : [],
  );
  const calendarParts = findings.flatMap((finding) =>
    finding.kind === 'year' || finding.kind === 'date'
      ? findingSpans(finding).map((span) => ({ finding, span }))
      : [],
  );

  for (const anchor of anchors) {
    const terminalSuffix = suffixes.find(
      ({ span }) =>
        span.start === anchor.span.end && span.end === fictionalPassword.length,
    );
    if (terminalSuffix !== undefined) {
      return {
        ruleId: 'whole-password-recognized-bounded-variant',
        findingIds: [anchor.finding.id, terminalSuffix.finding.id],
      };
    }

    const calendarStart = exactConnectorEnd(fictionalPassword, anchor.span.end);
    for (const calendar of calendarParts) {
      if (calendar.span.start !== calendarStart) continue;
      if (
        calendar.span.end === fictionalPassword.length ||
        hasOnlyTypicalTerminalPunctuation(fictionalPassword, calendar.span.end)
      ) {
        return {
          ruleId: 'whole-password-recognized-bounded-variant',
          findingIds: [anchor.finding.id, calendar.finding.id],
        };
      }
      const calendarSuffix = suffixes.find(
        ({ span }) =>
          span.start === calendar.span.end && span.end === fictionalPassword.length,
      );
      if (calendarSuffix !== undefined) {
        return {
          ruleId: 'whole-password-recognized-bounded-variant',
          findingIds: [anchor.finding.id, calendar.finding.id, calendarSuffix.finding.id],
        };
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
  const recognition =
    directWholePasswordRecognition(fictionalPassword, componentAnalysis.findings) ??
    boundedVariantRecognition(fictionalPassword, componentAnalysis.findings);

  if (recognition !== null) {
    return {
      ...base,
      kind: 'whole-password-recognized',
      ruleId: recognition.ruleId,
      findingIds: recognition.findingIds,
      explanationId: `s05.disposition.${recognition.ruleId}`,
    };
  }

  return {
    ...base,
    kind: 'no-whole-password-recognized',
    explanationId: 's05.disposition.no-whole-password-recognized',
  };
}

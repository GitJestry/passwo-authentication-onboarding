import type {
  PasswordAnalysisResult,
  PasswordComparisonFinding,
  PasswordComparisonResult,
  PasswordComparisonTransformation,
  PasswordEvidenceSpan,
  PasswordSingleFinding,
  PasswordSingleFindingKind,
} from '@passwo/contracts';

export type {
  PasswordAnalysisResult,
  PasswordComparisonResult,
  PasswordSingleFinding,
} from '@passwo/contracts';

export interface FictionalPasswordAnalysisInput {
  readonly fictionalPassword: string;
  /** Authored account terms only. Personal or participant data is not accepted. */
  readonly authoredAccountTerms?: readonly string[];
}

const commonPasswordCores = ['passwort', 'qwertz', 'admin', 'sommer'] as const;
const findingPriority: Readonly<Record<PasswordSingleFindingKind, number>> = {
  'common-password-core': 0,
  'account-or-service-term': 1,
  year: 2,
  'simple-number-sequence': 3,
  'repeated-component': 4,
  'typical-suffix': 5,
  'no-simple-component-recognized': 6,
};

function evidenceSpan(input: string, start: number, end: number): PasswordEvidenceSpan {
  return { type: 'span', start, end, token: input.slice(start, end) };
}

function finding(
  input: string,
  kind: Exclude<PasswordSingleFindingKind, 'no-simple-component-recognized'>,
  start: number,
  end: number,
  ordinal = 0,
): PasswordSingleFinding {
  return {
    id: `single:${kind}:${start}-${end}:${ordinal}`,
    kind,
    evidence: [evidenceSpan(input, start, end)],
    explanationId: `s05.${kind}`,
    confidence: kind === 'common-password-core' ? 'authored-exact-match' : 'bounded-heuristic',
  };
}

function findCaseInsensitiveSpans(input: string, token: string): readonly [number, number][] {
  const spans: [number, number][] = [];
  const normalizedInput = input.toLocaleLowerCase('de-DE');
  const normalizedToken = token.toLocaleLowerCase('de-DE');
  let from = 0;
  while (normalizedToken.length > 0) {
    const start = normalizedInput.indexOf(normalizedToken, from);
    if (start < 0) break;
    spans.push([start, start + token.length]);
    from = start + token.length;
  }
  return spans;
}

function collectTokenFindings(
  input: string,
  tokens: readonly string[],
  kind: 'common-password-core' | 'account-or-service-term',
): readonly PasswordSingleFinding[] {
  const seen = new Set<string>();
  const findings: PasswordSingleFinding[] = [];
  for (const token of tokens) {
    const normalizedToken = token.trim().toLocaleLowerCase('de-DE');
    if (normalizedToken.length < 3 || seen.has(normalizedToken)) continue;
    seen.add(normalizedToken);
    for (const [ordinal, [start, end]] of findCaseInsensitiveSpans(
      input,
      normalizedToken,
    ).entries()) {
      findings.push(finding(input, kind, start, end, ordinal));
    }
  }
  return findings;
}

function collectYears(input: string): readonly PasswordSingleFinding[] {
  return [...input.matchAll(/(?:19|20)\d{2}/gu)].map((match, ordinal) => {
    const start = match.index;
    return finding(input, 'year', start, start + match[0].length, ordinal);
  });
}

function isSimpleNumberSequence(value: string): boolean {
  if (value.length < 4) return false;
  const digits = [...value].map(Number);
  const first = digits[0];
  const second = digits[1];
  if (first === undefined || second === undefined) return false;
  const direction = second === first + 1 ? 1 : second === first - 1 ? -1 : 0;
  return (
    direction !== 0 &&
    digits.every((digit, index) => {
      const previous = digits[index - 1];
      return index === 0 || (previous !== undefined && digit === previous + direction);
    })
  );
}

function collectNumberSequences(input: string): readonly PasswordSingleFinding[] {
  return [...input.matchAll(/\d{4,}/gu)]
    .filter((match) => isSimpleNumberSequence(match[0]))
    .map((match, ordinal) => {
      const start = match.index;
      return finding(input, 'simple-number-sequence', start, start + match[0].length, ordinal);
    });
}

function collectRepeatedComponents(input: string): readonly PasswordSingleFinding[] {
  const normalized = input.toLocaleLowerCase('de-DE');
  const findings: PasswordSingleFinding[] = [];
  for (
    let componentLength = Math.floor(normalized.length / 2);
    componentLength >= 3;
    componentLength -= 1
  ) {
    for (let start = 0; start + componentLength * 2 <= normalized.length; start += 1) {
      const component = normalized.slice(start, start + componentLength);
      let end = start + componentLength;
      while (normalized.slice(end, end + componentLength) === component) end += componentLength;
      if (end >= start + componentLength * 2) {
        findings.push(finding(input, 'repeated-component', start, end));
        return findings;
      }
    }
  }
  return findings;
}

function collectTypicalSuffix(input: string): readonly PasswordSingleFinding[] {
  const match = /[\p{L}]{3,}((?:\d{1,3})?[!?._-]+|\d{1,3})$/u.exec(input);
  if (match === null || match[1] === undefined) return [];
  const start = input.length - match[1].length;
  return [finding(input, 'typical-suffix', start, input.length)];
}

export function analyzeFictionalPassword({
  fictionalPassword,
  authoredAccountTerms = [],
}: FictionalPasswordAnalysisInput): PasswordAnalysisResult {
  const findings = [
    ...collectTokenFindings(fictionalPassword, commonPasswordCores, 'common-password-core'),
    ...collectTokenFindings(fictionalPassword, authoredAccountTerms, 'account-or-service-term'),
    ...collectYears(fictionalPassword),
    ...collectNumberSequences(fictionalPassword),
    ...collectRepeatedComponents(fictionalPassword),
    ...collectTypicalSuffix(fictionalPassword),
  ].sort((left, right) => findingPriority[left.kind] - findingPriority[right.kind]);

  return {
    kind: 'fictional-password-analysis',
    findings:
      findings.length > 0
        ? findings
        : [
            {
              id: 'single:no-simple-component-recognized',
              kind: 'no-simple-component-recognized',
              evidence: [],
              explanationId: 's05.no-simple-component-recognized',
              confidence: 'bounded-heuristic',
            },
          ],
    disclaimerId: 'simulation-not-production-strength',
  };
}

const substitutionByCharacter: Readonly<Record<string, string>> = {
  '0': 'o',
  '3': 'e',
  '4': 'a',
  '@': 'a',
  $: 's',
};

interface ComparableCore {
  readonly raw: string;
  readonly normalized: string;
  readonly start: number;
  readonly end: number;
  readonly suffix: string;
  readonly hadSubstitution: boolean;
}

function comparableCore(input: string): ComparableCore | null {
  const suffixMatch = /(?:\d{1,4})?[!?._-]+$|\d{1,4}$/u.exec(input);
  const suffix = suffixMatch?.[0] ?? '';
  const raw = input.slice(0, input.length - suffix.length);
  if (raw.length < 4 || !/[\p{L}]/u.test(raw)) return null;
  let hadSubstitution = false;
  const normalized = [...raw]
    .map((character) => {
      const replacement = substitutionByCharacter[character];
      if (replacement !== undefined) hadSubstitution = true;
      return replacement ?? character.toLocaleLowerCase('de-DE');
    })
    .join('');
  return { raw, normalized, start: 0, end: raw.length, suffix, hadSubstitution };
}

function noDerivedPathFinding(): PasswordComparisonFinding {
  return {
    id: 'comparison:no-derived-path-recognized',
    kind: 'no-derived-path-recognized',
    evidence: [],
    explanationId: 's06.no-derived-path-recognized',
    confidence: 'bounded-heuristic',
    transformations: [],
  };
}

export function compareFictionalPasswords(
  sourcePassword: string,
  targetPassword: string,
): PasswordComparisonResult {
  if (sourcePassword === targetPassword) {
    return {
      kind: 'fictional-password-comparison',
      outcome: 'identical',
      findings: [
        {
          id: 'comparison:exact-match',
          kind: 'exact-match',
          evidence: [{ type: 'token', token: 'exact-code-point-match' }],
          explanationId: 's06.exact-match',
          confidence: 'authored-exact-match',
          transformations: [],
        },
      ],
      disclaimerId: 'simulation-not-production-strength',
    };
  }

  const source = comparableCore(sourcePassword);
  const target = comparableCore(targetPassword);
  if (source !== null && target !== null && source.normalized === target.normalized) {
    const transformations: PasswordComparisonTransformation[] = [];
    if (source.raw.toLocaleLowerCase('de-DE') === target.raw.toLocaleLowerCase('de-DE')) {
      if (source.raw !== target.raw) transformations.push('case-change');
    } else if (source.hadSubstitution || target.hadSubstitution) {
      transformations.push('common-character-substitution');
    }
    if (source.suffix !== target.suffix) transformations.push('typical-suffix-change');
    if (transformations.length > 0 && transformations.length <= 2) {
      return {
        kind: 'fictional-password-comparison',
        outcome: 'similar',
        findings: [
          {
            id: `comparison:shared-core:${source.normalized}`,
            kind: 'shared-core-with-bounded-transformation',
            evidence: [
              { type: 'token', token: source.normalized },
              evidenceSpan(sourcePassword, source.start, source.end),
              evidenceSpan(targetPassword, target.start, target.end),
            ],
            explanationId: 's06.shared-core-with-bounded-transformation',
            confidence: 'bounded-heuristic',
            transformations,
          },
        ],
        disclaimerId: 'simulation-not-production-strength',
      };
    }
  }

  return {
    kind: 'fictional-password-comparison',
    outcome: 'no-derived-path-recognized',
    findings: [noDerivedPathFinding()],
    disclaimerId: 'simulation-not-production-strength',
  };
}

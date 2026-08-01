import type {
  LocalPasswordDisposition,
  PasswordRelationKind,
  S06AccountId,
  S06PairComparison,
  S07AccountConnection,
  S07AccountRecommendation,
  S07IncidentStatus,
  S07ProblemClass,
  S07RecommendationId,
  S07RecommendationProjection,
  S07RecommendationProjectionInput,
  S07Retrievability,
} from '@passwo/contracts';

const accountOrder = ['master-campus', 'campus-email', 'campusgram'] as const;
const problemClassOrder = [
  'local-quick-path',
  'exact-reuse',
  'derived-variant',
  'retrievability',
] as const satisfies readonly S07ProblemClass[];

function accountDisposition(
  input: S07RecommendationProjectionInput,
  accountId: S06AccountId,
): LocalPasswordDisposition {
  const account = input.accounts.find((candidate) => candidate.accountId === accountId);
  if (account === undefined) throw new Error(`Missing S07 account analysis: ${accountId}`);
  return account.disposition;
}

function connectionsFor(
  comparisons: readonly S06PairComparison[],
  accountId: S06AccountId,
): readonly S07AccountConnection[] {
  return comparisons
    .filter(
      ({ sourceAccountId, targetAccountId }) =>
        sourceAccountId === accountId || targetAccountId === accountId,
    )
    .map(({ sourceAccountId, targetAccountId, result }) => ({
      accountId: sourceAccountId === accountId ? targetAccountId : sourceAccountId,
      relationKind: result.relation.kind,
    }))
    .sort(
      (left, right) => accountOrder.indexOf(left.accountId) - accountOrder.indexOf(right.accountId),
    );
}

function actualReachByAccount(
  input: S07RecommendationProjectionInput,
): ReadonlyMap<S06AccountId, ReadonlySet<PasswordRelationKind>> {
  const knownPasswords = new Set<S06AccountId>();
  if (accountDisposition(input, input.incidentSource).kind === 'quick-path-recognized') {
    knownPasswords.add(input.incidentSource);
  }
  const reached = new Map<S06AccountId, Set<PasswordRelationKind>>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const { sourceAccountId, targetAccountId, result } of input.comparisons) {
      if (
        !knownPasswords.has(sourceAccountId) ||
        result.relation.kind === 'no-derived-path-recognized'
      ) {
        continue;
      }
      const relations = reached.get(targetAccountId) ?? new Set<PasswordRelationKind>();
      relations.add(result.relation.kind);
      reached.set(targetAccountId, relations);
      if (!knownPasswords.has(targetAccountId)) {
        knownPasswords.add(targetAccountId);
        changed = true;
      }
    }
  }
  return reached;
}

function incidentStatusFor(
  input: S07RecommendationProjectionInput,
  accountId: S06AccountId,
  actualReach: ReadonlyMap<S06AccountId, ReadonlySet<PasswordRelationKind>>,
): S07IncidentStatus {
  if (accountId === input.incidentSource) return 'source-of-incident';
  const actualRelations = actualReach.get(accountId);
  if (actualRelations?.has('exact-match')) return 'reached-via-exact-reuse';
  if (actualRelations?.has('derived-variant-match')) return 'reached-via-derived-variant';
  const hasHypotheticalPath = input.comparisons.some(
    ({ targetAccountId, result }) =>
      targetAccountId === accountId &&
      result.relation.kind !== 'no-derived-path-recognized' &&
      !actualReach.has(targetAccountId),
  );
  return hasHypotheticalPath ? 'hypothetical-only' : 'not-reached';
}

function retrievabilityFor(status: 'retrievable' | 'not-remembered' | 'assisted'): S07Retrievability {
  if (status === 'retrievable') return 'remembered';
  return status === 'assisted' ? 'skipped' : 'not-remembered';
}

function recommendationFor(
  disposition: LocalPasswordDisposition,
  connections: readonly S07AccountConnection[],
  incidentStatus: S07IncidentStatus,
  retrievability: S07Retrievability,
  isIncidentSourcePasswordExposed: boolean,
): S07RecommendationId {
  if (
    isIncidentSourcePasswordExposed ||
    incidentStatus === 'reached-via-exact-reuse' ||
    incidentStatus === 'reached-via-derived-variant'
  ) {
    return 'replace-exposed-password';
  }
  if (connections.some(({ relationKind }) => relationKind === 'exact-match')) {
    return 'separate-exact-reuse';
  }
  if (disposition.kind === 'quick-path-recognized') return 'rebuild-predictable-password';
  if (connections.some(({ relationKind }) => relationKind === 'derived-variant-match')) {
    return 'replace-derived-pattern';
  }
  if (retrievability !== 'remembered') return 'improve-retrievability';
  return 'no-change-practice-method';
}

function validateInput(input: S07RecommendationProjectionInput): void {
  if (input.accounts.length !== 3) throw new Error('S07 requires exactly three account analyses.');
  if (input.comparisons.length !== 3) throw new Error('S07 requires exactly three comparisons.');
  const accountIds = new Set(input.accounts.map(({ accountId }) => accountId));
  const pairKeys = new Set(
    input.comparisons.map(({ sourceAccountId, targetAccountId }) =>
      [sourceAccountId, targetAccountId].sort().join(':'),
    ),
  );
  if (
    accountIds.size !== 3 ||
    !accountOrder.every((accountId) => accountIds.has(accountId)) ||
    pairKeys.size !== 3 ||
    !pairKeys.has('campus-email:campusgram') ||
    !pairKeys.has('campus-email:master-campus') ||
    !pairKeys.has('campusgram:master-campus')
  ) {
    throw new Error('S07 input must cover all accounts and pairs exactly once.');
  }
}

export function projectS07Recommendations(
  input: S07RecommendationProjectionInput,
): S07RecommendationProjection {
  validateInput(input);
  const actualReach = actualReachByAccount(input);
  const accounts: S07AccountRecommendation[] = accountOrder.map((accountId) => {
    const source = input.accounts.find((candidate) => candidate.accountId === accountId);
    if (source === undefined) throw new Error(`Missing S07 account analysis: ${accountId}`);
    const connections = connectionsFor(input.comparisons, accountId);
    const incidentStatus = incidentStatusFor(input, accountId, actualReach);
    const retrievability = retrievabilityFor(source.retrievalStatus);
    return {
      accountId,
      disposition: source.disposition,
      connections,
      incidentStatus,
      retrievability,
      recommendationId: recommendationFor(
        source.disposition,
        connections,
        incidentStatus,
        retrievability,
        accountId === input.incidentSource && source.disposition.kind === 'quick-path-recognized',
      ),
    };
  });
  const detectedProblemClasses = new Set<S07ProblemClass>();
  if (accounts.some(({ disposition }) => disposition.kind === 'quick-path-recognized')) {
    detectedProblemClasses.add('local-quick-path');
  }
  if (
    accounts.some(({ connections }) =>
      connections.some(({ relationKind }) => relationKind === 'exact-match'),
    )
  ) {
    detectedProblemClasses.add('exact-reuse');
  }
  if (
    accounts.some(({ connections }) =>
      connections.some(({ relationKind }) => relationKind === 'derived-variant-match'),
    )
  ) {
    detectedProblemClasses.add('derived-variant');
  }
  if (accounts.some(({ retrievability }) => retrievability !== 'remembered')) {
    detectedProblemClasses.add('retrievability');
  }
  return {
    kind: 's07-recommendation-projection',
    accounts,
    summary: {
      noQuickPathCount: accounts.filter(
        ({ disposition }) => disposition.kind === 'no-quick-path-recognized',
      ).length,
      noPasswordConnectionCount: accounts.filter(({ connections }) =>
        connections.every(({ relationKind }) => relationKind === 'no-derived-path-recognized'),
      ).length,
      rememberedCount: accounts.filter(({ retrievability }) => retrievability === 'remembered')
        .length,
      problemClasses: problemClassOrder.filter((problemClass) =>
        detectedProblemClasses.has(problemClass),
      ),
    },
  };
}

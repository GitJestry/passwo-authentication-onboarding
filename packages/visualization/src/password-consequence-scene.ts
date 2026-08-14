import type {
  IncidentSource,
  LocalPasswordDisposition,
  PasswordConsequenceSceneMode,
  PasswordRelation,
  S06AccountId,
  S06PairComparison,
  S06ResolvedConsequencePath,
  S06ResolvedConsequenceResult,
  S06RetrievalStatus,
} from '@passwo/contracts';
import type { NetworkSceneSnapshot, SceneEdge, SceneNode } from './scene.js';

export interface S06LocalAccountAnalysis {
  readonly accountId: S06AccountId;
  readonly fictionalPassword: string;
  readonly disposition: LocalPasswordDisposition;
  readonly retrievalStatus: S06RetrievalStatus;
}

export type PasswordConsequenceStepId =
  | 's06-step-campusgram-incident'
  | 's06-step-campusgram-master-campus'
  | 's06-step-campusgram-campus-email'
  | 's06-step-master-campus-perspective'
  | 's06-step-master-campus-campusgram'
  | 's06-step-master-campus-campus-email'
  | 's06-step-campus-email-local-check'
  | 's06-step-campus-email-master-campus'
  | 's06-step-campus-email-campusgram'
  | 's06-step-summary';

export interface PasswordConsequenceAccountDefinition {
  readonly accountId: S06AccountId;
  readonly label: string;
  readonly detailKind: 'service' | 'function' | 'content';
  readonly details: readonly string[];
}

export interface PasswordConsequenceProjectionInput {
  readonly id: string;
  readonly incidentSource: IncidentSource;
  readonly accounts: readonly S06LocalAccountAnalysis[];
  readonly comparisons: readonly S06PairComparison[];
  readonly accountDefinitions: readonly PasswordConsequenceAccountDefinition[];
}

export interface PasswordConsequenceVisibleChange {
  readonly targetId: string;
  readonly emphasis: 'info' | 'positive' | 'warning' | 'danger';
}

export interface PasswordConsequencePlanStep {
  readonly id: PasswordConsequenceStepId;
  readonly mode: PasswordConsequenceSceneMode;
  readonly narrationId: string;
  readonly sourceAccountId: S06AccountId | null;
  readonly targetAccountId: S06AccountId | null;
  readonly relation: PasswordRelation | null;
  readonly network: NetworkSceneSnapshot;
  readonly visibleChange: PasswordConsequenceVisibleChange;
}

export interface PasswordConsequenceScenePlan {
  readonly id: string;
  readonly incidentSource: IncidentSource;
  readonly accounts: readonly S06LocalAccountAnalysis[];
  readonly comparisons: readonly S06PairComparison[];
  readonly steps: readonly PasswordConsequencePlanStep[];
  readonly resolvedResult: S06ResolvedConsequenceResult;
}

const accountPositions = {
  campusgram: { x: 0.8, y: 0.5 },
  'master-campus': { x: 0.32, y: 0.2 },
  'campus-email': { x: 0.32, y: 0.72 },
} as const;

const detailOffsets = {
  'master-campus': [
    { x: -0.27, y: -0.15 },
    { x: -0.1, y: 0 },
    { x: -0.24, y: 0.11 },
  ],
  'campus-email': [
    { x: -0.24, y: -0.19 },
    { x: -0.1, y: -0.19 },
    { x: -0.24, y: 0.04 },
    { x: -0.1, y: 0.04 },
  ],
  campusgram: [
    { x: -0.14, y: 0.32 },
    { x: 0, y: 0.32 },
    { x: 0.14, y: 0.32 },
  ],
} as const satisfies Readonly<Record<S06AccountId, readonly { x: number; y: number }[]>>;

function accountById(
  accounts: readonly S06LocalAccountAnalysis[],
  accountId: S06AccountId,
): S06LocalAccountAnalysis {
  const account = accounts.find((candidate) => candidate.accountId === accountId);
  if (account === undefined) throw new Error(`Missing S06 account analysis: ${accountId}`);
  return account;
}

function definitionById(
  definitions: readonly PasswordConsequenceAccountDefinition[],
  accountId: S06AccountId,
): PasswordConsequenceAccountDefinition {
  const definition = definitions.find((candidate) => candidate.accountId === accountId);
  if (definition === undefined) throw new Error(`Missing S06 account definition: ${accountId}`);
  return definition;
}

function comparisonByPair(
  comparisons: readonly S06PairComparison[],
  sourceAccountId: S06AccountId,
  targetAccountId: S06AccountId,
): S06PairComparison {
  const comparison = comparisons.find(
    (candidate) =>
      candidate.sourceAccountId === sourceAccountId &&
      candidate.targetAccountId === targetAccountId,
  );
  if (comparison === undefined) {
    throw new Error(`Missing S06 comparison: ${sourceAccountId}:${targetAccountId}`);
  }
  return comparison;
}

function wholePasswordRecognized(disposition: LocalPasswordDisposition): boolean {
  return disposition.kind === 'whole-password-recognized';
}

function targetReachedFor(mode: PasswordConsequenceSceneMode, relation: PasswordRelation): boolean {
  return mode === 'actual' && relation.kind !== 'no-derived-path-recognized';
}

function createBaseNetwork(
  accounts: readonly S06LocalAccountAnalysis[],
  definitions: readonly PasswordConsequenceAccountDefinition[],
): { readonly nodes: SceneNode[]; readonly edges: SceneEdge[] } {
  const nodes: SceneNode[] = [];
  const edges: SceneEdge[] = [];
  for (const account of accounts) {
    const definition = definitionById(definitions, account.accountId);
    const position = accountPositions[account.accountId];
    nodes.push({
      id: account.accountId,
      kind: 'account',
      symbolId: account.accountId,
      label: definition.label,
      description: `Fiktives Konto · Abrufbarkeit: ${account.retrievalStatus}`,
      status: 'neutral',
      position,
      selectable: false,
    });
    definition.details.forEach((detail, index) => {
      const offset = detailOffsets[account.accountId][index];
      if (offset === undefined) return;
      const detailId = `${account.accountId}-detail-${index + 1}`;
      nodes.push({
        id: detailId,
        kind: definition.detailKind,
        symbolId: definition.detailKind,
        label: detail,
        description: `${detail} gehört zum fiktiven Konto ${definition.label}.`,
        status: 'neutral',
        position: { x: position.x + offset.x, y: position.y + offset.y },
        selectable: false,
      });
      edges.push({
        id: `${account.accountId}--${detailId}`,
        sourceId: account.accountId,
        targetId: detailId,
        kind: definition.detailKind === 'service' ? 'dependency' : 'association',
        status: 'neutral',
        label: null,
      });
    });
  }
  return { nodes, edges };
}

function withNodeStatus(
  nodes: readonly SceneNode[],
  accountId: S06AccountId,
  status: SceneNode['status'],
): SceneNode[] {
  return nodes.map((node) =>
    node.id === accountId || node.id.startsWith(`${accountId}-detail-`)
      ? { ...node, status }
      : node,
  );
}

function addShield(
  nodes: readonly SceneNode[],
  targetAccountId: S06AccountId,
  stepId: PasswordConsequenceStepId,
): SceneNode[] {
  const target = accountPositions[targetAccountId];
  return [
    ...nodes,
    {
      id: `${stepId}-shield`,
      kind: 'shield',
      symbolId: 'shield',
      label: 'Dieser Angriffsweg ist blockiert.',
      description:
        'Mit den begrenzten Transformationswegen dieser Simulation wurde kein direkter Weg erkannt.',
      status: 'protected',
      position: { x: target.x - 0.12, y: target.y - 0.04 },
      selectable: false,
    },
  ];
}

function localCheckStep(
  input: PasswordConsequenceProjectionInput,
  stepId: PasswordConsequenceStepId,
  accountId: S06AccountId,
  narrationPrefix:
    | 's06.incident.campusgram'
    | 's06.perspective.master-campus'
    | 's06.local-check.campus-email',
  mode: PasswordConsequenceSceneMode,
): PasswordConsequencePlanStep {
  const account = accountById(input.accounts, accountId);
  const found = wholePasswordRecognized(account.disposition);
  const base = createBaseNetwork(input.accounts, input.accountDefinitions);
  let nodes = withNodeStatus(base.nodes, accountId, found ? 'exposed' : 'protected');
  if (!found) nodes = addShield(nodes, accountId, stepId);
  return {
    id: stepId,
    mode,
    narrationId: `${narrationPrefix}-${found ? 'found' : 'blocked'}`,
    sourceAccountId: accountId,
    targetAccountId: null,
    relation: null,
    network: {
      id: `${input.id}-${stepId}`,
      nodes,
      edges: base.edges,
      accessibleSummary: found
        ? `${definitionById(input.accountDefinitions, accountId).label}: vollständiges Passwort als früher Kandidat erkannt.`
        : `${definitionById(input.accountDefinitions, accountId).label}: kein vollständiger früher Kandidat in dieser begrenzten Prüfung erkannt.`,
    },
    visibleChange: { targetId: accountId, emphasis: found ? 'danger' : 'positive' },
  };
}

function comparisonStep(
  input: PasswordConsequenceProjectionInput,
  stepId: PasswordConsequenceStepId,
  sourceAccountId: S06AccountId,
  targetAccountId: S06AccountId,
  mode: PasswordConsequenceSceneMode,
): PasswordConsequencePlanStep {
  const comparison = comparisonByPair(input.comparisons, sourceAccountId, targetAccountId);
  const relation = comparison.result.relation;
  const base = createBaseNetwork(input.accounts, input.accountDefinitions);
  let nodes = withNodeStatus(
    base.nodes,
    sourceAccountId,
    mode === 'actual' ? 'exposed' : 'hypothetical',
  );
  const targetReached = targetReachedFor(mode, relation);
  const hasHypotheticalRelation =
    mode === 'hypothetical' && relation.kind !== 'no-derived-path-recognized';
  nodes = withNodeStatus(
    nodes,
    targetAccountId,
    targetReached ? 'affected' : hasHypotheticalRelation ? 'hypothetical' : 'protected',
  );
  if (!targetReached && !hasHypotheticalRelation) {
    nodes = addShield(nodes, targetAccountId, stepId);
  }
  const resultEdge: SceneEdge = {
    id: `${stepId}-path`,
    sourceId: sourceAccountId,
    targetId: targetAccountId,
    kind:
      relation.kind === 'exact-match'
        ? 'identical-reuse'
        : relation.kind === 'derived-variant-match'
          ? 'similar-pattern'
          : 'blocked-path',
    status: hasHypotheticalRelation
      ? 'hypothetical'
      : relation.kind === 'exact-match'
        ? 'direct'
        : relation.kind === 'derived-variant-match'
          ? 'similar'
          : 'blocked',
    label:
      relation.kind === 'exact-match'
        ? 'Exakte Wiederverwendung'
        : relation.kind === 'derived-variant-match'
          ? 'Konkreter abgeleiteter Kandidat'
          : 'Dieser Angriffsweg ist blockiert.',
  };
  return {
    id: stepId,
    mode,
    narrationId: `s06.compare.${relation.kind}`,
    sourceAccountId,
    targetAccountId,
    relation,
    network: {
      id: `${input.id}-${stepId}`,
      nodes,
      edges: [...base.edges, resultEdge],
      accessibleSummary: targetReached
        ? `${definitionById(input.accountDefinitions, targetAccountId).label} wird in dieser Simulation durch ${relation.kind} erreicht.`
        : hasHypotheticalRelation
          ? `${definitionById(input.accountDefinitions, targetAccountId).label} würde nur in diesem hypothetischen Beispiel durch ${relation.kind} erreicht.`
          : `Die Angriffslinie stoppt vor ${definitionById(input.accountDefinitions, targetAccountId).label}.`,
    },
    visibleChange: {
      targetId: targetAccountId,
      emphasis:
        relation.kind === 'exact-match'
          ? 'danger'
          : relation.kind === 'derived-variant-match'
            ? 'warning'
            : 'positive',
    },
  };
}

function summaryStep(
  input: PasswordConsequenceProjectionInput,
  paths: readonly S06ResolvedConsequencePath[],
): PasswordConsequencePlanStep {
  const base = createBaseNetwork(input.accounts, input.accountDefinitions);
  const summaryComparisons = new Map<string, S06PairComparison>();
  for (const comparison of input.comparisons) {
    const pairId = [comparison.sourceAccountId, comparison.targetAccountId].sort().join(':');
    const current = summaryComparisons.get(pairId);
    if (
      current === undefined ||
      (current.result.relation.kind === 'no-derived-path-recognized' &&
        comparison.result.relation.kind !== 'no-derived-path-recognized')
    ) {
      summaryComparisons.set(pairId, comparison);
    }
  }
  const relationshipEdges = [...summaryComparisons.values()].flatMap(
    ({ sourceAccountId, targetAccountId, result }): readonly SceneEdge[] => {
      const relation = result.relation;
      if (relation.kind === 'no-derived-path-recognized') return [];
      const exactReuse = relation.kind === 'exact-match';
      return [
        {
          id: `s06-step-summary-${sourceAccountId}-${targetAccountId}`,
          sourceId: sourceAccountId,
          targetId: targetAccountId,
          kind: exactReuse ? 'identical-reuse' : 'similar-pattern',
          status: exactReuse ? 'direct' : 'similar',
          label: null,
        },
      ];
    },
  );
  const nodes = input.accounts.reduce<SceneNode[]>((current, account) => {
    const targetReached = paths.some(
      ({ targetAccountId, targetReached: reached }) =>
        targetAccountId === account.accountId && reached,
    );
    return withNodeStatus(
      current,
      account.accountId,
      targetReached
        ? 'affected'
        : wholePasswordRecognized(account.disposition)
          ? 'exposed'
          : 'protected',
    );
  }, base.nodes);
  return {
    id: 's06-step-summary',
    mode: 'actual',
    narrationId: 's06.summary',
    sourceAccountId: null,
    targetAccountId: null,
    relation: null,
    network: {
      id: `${input.id}-s06-step-summary`,
      nodes,
      edges: [...base.edges, ...relationshipEdges],
      accessibleSummary:
        relationshipEdges.length === 0
          ? 'Gemeinsame Endübersicht der lokalen Prüfungen; zwischen den drei fiktiven Konten wurde keine Passwortverbindung erkannt.'
          : `Gemeinsame Endübersicht der lokalen Prüfungen mit ${relationshipEdges.length} erkannten Passwort${relationshipEdges.length === 1 ? 'verbindung' : 'verbindungen'}.`,
    },
    visibleChange: { targetId: 'campus-email', emphasis: 'info' },
  };
}

function validateInput(input: PasswordConsequenceProjectionInput): void {
  if (input.accounts.length !== 3) throw new Error('S06 requires exactly three account analyses.');
  if (input.comparisons.length !== 6)
    throw new Error('S06 requires exactly six directed account comparisons.');
  const comparisonKeys = new Set(
    input.comparisons.map(
      ({ sourceAccountId, targetAccountId }) => `${sourceAccountId}:${targetAccountId}`,
    ),
  );
  const requiredComparisonKeys = [
    'campusgram:master-campus',
    'campusgram:campus-email',
    'master-campus:campusgram',
    'master-campus:campus-email',
    'campus-email:master-campus',
    'campus-email:campusgram',
  ];
  if (
    comparisonKeys.size !== requiredComparisonKeys.length ||
    requiredComparisonKeys.some((key) => !comparisonKeys.has(key))
  ) {
    throw new Error('S06 comparisons must cover both attack sources and their two targets.');
  }
}

export function projectPasswordConsequenceScenePlan(
  input: PasswordConsequenceProjectionInput,
): PasswordConsequenceScenePlan {
  validateInput(input);
  const campusgramFound = wholePasswordRecognized(
    accountById(input.accounts, 'campusgram').disposition,
  );
  const masterCampusFound = wholePasswordRecognized(
    accountById(input.accounts, 'master-campus').disposition,
  );
  const campusEmailFound = wholePasswordRecognized(
    accountById(input.accounts, 'campus-email').disposition,
  );
  const campusgramComparisonMode: PasswordConsequenceSceneMode = campusgramFound
    ? 'actual'
    : 'hypothetical';
  const masterComparisonMode: PasswordConsequenceSceneMode = masterCampusFound
    ? 'actual'
    : 'hypothetical';
  const campusEmailComparisonMode: PasswordConsequenceSceneMode = campusEmailFound
    ? 'actual'
    : 'hypothetical';
  const consequenceSteps: readonly PasswordConsequencePlanStep[] = [
    localCheckStep(
      input,
      's06-step-campusgram-incident',
      'campusgram',
      's06.incident.campusgram',
      'actual',
    ),
    comparisonStep(
      input,
      's06-step-campusgram-master-campus',
      'campusgram',
      'master-campus',
      campusgramComparisonMode,
    ),
    comparisonStep(
      input,
      's06-step-campusgram-campus-email',
      'campusgram',
      'campus-email',
      campusgramComparisonMode,
    ),
    localCheckStep(
      input,
      's06-step-master-campus-perspective',
      'master-campus',
      's06.perspective.master-campus',
      'actual',
    ),
    comparisonStep(
      input,
      's06-step-master-campus-campusgram',
      'master-campus',
      'campusgram',
      masterComparisonMode,
    ),
    comparisonStep(
      input,
      's06-step-master-campus-campus-email',
      'master-campus',
      'campus-email',
      masterComparisonMode,
    ),
    localCheckStep(
      input,
      's06-step-campus-email-local-check',
      'campus-email',
      's06.local-check.campus-email',
      'actual',
    ),
    comparisonStep(
      input,
      's06-step-campus-email-master-campus',
      'campus-email',
      'master-campus',
      campusEmailComparisonMode,
    ),
    comparisonStep(
      input,
      's06-step-campus-email-campusgram',
      'campus-email',
      'campusgram',
      campusEmailComparisonMode,
    ),
  ];
  const paths = consequenceSteps.flatMap((step): readonly S06ResolvedConsequencePath[] => {
    if (step.sourceAccountId === null || step.targetAccountId === null || step.relation === null) {
      return [];
    }
    return [
      {
        sourceAccountId: step.sourceAccountId,
        targetAccountId: step.targetAccountId,
        mode: step.mode,
        relationKind: step.relation.kind,
        targetReached: targetReachedFor(step.mode, step.relation),
      },
    ];
  });
  const steps: readonly PasswordConsequencePlanStep[] = [
    ...consequenceSteps,
    summaryStep(input, paths),
  ];
  const affectedAccountIds = [
    ...(campusgramFound ? [input.incidentSource] : []),
    ...paths
      .filter(({ targetReached }) => targetReached)
      .map(({ targetAccountId }) => targetAccountId),
  ].filter((accountId, index, all): accountId is S06AccountId => all.indexOf(accountId) === index);
  return {
    id: input.id,
    incidentSource: input.incidentSource,
    accounts: input.accounts,
    comparisons: input.comparisons,
    steps,
    resolvedResult: {
      incidentSource: input.incidentSource,
      accounts: input.accounts.map(({ accountId, disposition, retrievalStatus }) => ({
        accountId,
        disposition,
        retrievalStatus,
      })),
      paths,
      affectedAccountIds,
    },
  };
}

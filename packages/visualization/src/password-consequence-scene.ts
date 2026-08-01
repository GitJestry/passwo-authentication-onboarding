import type {
  IncidentSource,
  LocalPasswordDisposition,
  PasswordConsequenceSceneMode,
  PasswordRelation,
  S06AccountId,
  S06LocalAccountAnalysis,
  S06PairComparison,
  S06ResolvedConsequencePath,
  S06ResolvedConsequenceResult,
} from '@passwo/contracts';
import type { NetworkSceneSnapshot, SceneEdge, SceneNode } from './scene.js';

export type PasswordConsequenceStepId =
  | 's06-step-campusgram-incident'
  | 's06-step-campusgram-master-campus'
  | 's06-step-campusgram-campus-email'
  | 's06-step-master-campus-perspective'
  | 's06-step-master-campus-campus-email'
  | 's06-step-campus-email-local-check'
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
  campusgram: { x: 0.08, y: 0.34 },
  'master-campus': { x: 0.42, y: 0.16 },
  'campus-email': { x: 0.72, y: 0.4 },
} as const;

const detailOffsets = [
  { x: -0.05, y: 0.34 },
  { x: 0.04, y: 0.43 },
  { x: 0.13, y: 0.34 },
  { x: 0.22, y: 0.43 },
] as const;

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

function quickPathRecognized(disposition: LocalPasswordDisposition): boolean {
  return disposition.kind === 'quick-path-recognized';
}

function targetReachedFor(
  mode: PasswordConsequenceSceneMode,
  relation: PasswordRelation,
): boolean {
  return mode === 'actual' && relation.kind !== 'no-derived-path-recognized';
}

function createBaseNetwork(
  id: string,
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
      const offset = detailOffsets[index];
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
        id: `${id}-${account.accountId}-role-${index + 1}`,
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
  const found = quickPathRecognized(account.disposition);
  const base = createBaseNetwork(stepId, input.accounts, input.accountDefinitions);
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
        ? `${definitionById(input.accountDefinitions, accountId).label}: schneller Weg erkannt.`
        : `${definitionById(input.accountDefinitions, accountId).label}: tatsächlicher Weg blockiert.`,
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
  const base = createBaseNetwork(stepId, input.accounts, input.accountDefinitions);
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
    status:
      hasHypotheticalRelation
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
  const base = createBaseNetwork('s06-step-summary', input.accounts, input.accountDefinitions);
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
        : quickPathRecognized(account.disposition)
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
      edges: base.edges,
      accessibleSummary:
        'Gemeinsame Endübersicht mit Einzelcheck, Passwortbeziehungen und Abrufbarkeit der drei fiktiven Konten.',
    },
    visibleChange: { targetId: 'campus-email', emphasis: 'info' },
  };
}

function validateInput(input: PasswordConsequenceProjectionInput): void {
  if (input.accounts.length !== 3) throw new Error('S06 requires exactly three account analyses.');
  if (input.comparisons.length !== 3)
    throw new Error('S06 requires exactly three pair comparisons.');
  const pairKeys = new Set(
    input.comparisons.map(({ sourceAccountId, targetAccountId }) =>
      [sourceAccountId, targetAccountId].sort().join(':'),
    ),
  );
  if (
    pairKeys.size !== 3 ||
    !pairKeys.has('campusgram:master-campus') ||
    !pairKeys.has('campus-email:campusgram') ||
    !pairKeys.has('campus-email:master-campus')
  ) {
    throw new Error('S06 comparisons must cover every account pair exactly once.');
  }
}

export function projectPasswordConsequenceScenePlan(
  input: PasswordConsequenceProjectionInput,
): PasswordConsequenceScenePlan {
  validateInput(input);
  const campusgramFound = quickPathRecognized(
    accountById(input.accounts, 'campusgram').disposition,
  );
  const masterCampusFound = quickPathRecognized(
    accountById(input.accounts, 'master-campus').disposition,
  );
  const campusgramComparisonMode: PasswordConsequenceSceneMode = campusgramFound
    ? 'actual'
    : 'hypothetical';
  const masterComparisonMode: PasswordConsequenceSceneMode = masterCampusFound
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

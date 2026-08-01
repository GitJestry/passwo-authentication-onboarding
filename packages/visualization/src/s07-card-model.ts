import type {
  LocalPasswordDisposition,
  S06AccountId,
  S07AccountConnection,
  S07IncidentStatus,
  S07ProblemClass,
  S07RecommendationId,
  S07RecommendationProjection,
  S07Retrievability,
} from '@passwo/contracts';

export interface S07AccountCardDefinition {
  readonly accountId: S06AccountId;
  readonly label: string;
  readonly roleDescription: string;
}

export interface S07AccountCardModel {
  readonly id: `s07-card-${S06AccountId}`;
  readonly accountId: S06AccountId;
  readonly label: string;
  readonly roleDescription: string;
  readonly disposition: LocalPasswordDisposition;
  readonly connections: readonly S07AccountConnection[];
  readonly incidentStatus: S07IncidentStatus;
  readonly retrievability: S07Retrievability;
  readonly recommendationId: S07RecommendationId;
}

export interface S07CardDeckModel {
  readonly id: 's07-account-card-deck';
  readonly cards: readonly S07AccountCardModel[];
  readonly overview: {
    readonly noQuickPathCount: number;
    readonly noPasswordConnectionCount: number;
    readonly rememberedCount: number;
    readonly totalAccountCount: 3;
  };
  readonly problemClasses: readonly S07ProblemClass[];
}

export function projectS07CardDeck(
  projection: S07RecommendationProjection,
  definitions: readonly S07AccountCardDefinition[],
): S07CardDeckModel {
  if (projection.accounts.length !== 3 || definitions.length !== 3) {
    throw new Error('S07 card deck requires exactly three accounts.');
  }
  const cards = projection.accounts.map((account): S07AccountCardModel => {
    const definition = definitions.find(({ accountId }) => accountId === account.accountId);
    if (definition === undefined) throw new Error(`Missing S07 card definition: ${account.accountId}`);
    return {
      id: `s07-card-${account.accountId}`,
      accountId: account.accountId,
      label: definition.label,
      roleDescription: definition.roleDescription,
      disposition: account.disposition,
      connections: account.connections,
      incidentStatus: account.incidentStatus,
      retrievability: account.retrievability,
      recommendationId: account.recommendationId,
    };
  });
  return {
    id: 's07-account-card-deck',
    cards,
    overview: {
      noQuickPathCount: projection.summary.noQuickPathCount,
      noPasswordConnectionCount: projection.summary.noPasswordConnectionCount,
      rememberedCount: projection.summary.rememberedCount,
      totalAccountCount: 3,
    },
    problemClasses: projection.summary.problemClasses,
  };
}

import type {
  AuthoredPosition,
  NetworkSceneSnapshot,
  SceneEdge,
  SceneEdgeKind,
  SceneNode,
  SceneNodeKind,
  SceneNodeSymbolId,
} from './scene.js';

export interface AccountExplorationSceneDefinition {
  readonly id: string;
  readonly introAnimationId: string;
  readonly initialNarrationId: string;
  readonly summaries: {
    readonly initial: string;
    readonly complete: string;
  };
  readonly accounts: readonly {
    readonly id: string;
    readonly label: string;
    readonly symbolId: SceneNodeSymbolId;
    readonly position: AuthoredPosition;
    readonly detailKind: Extract<SceneNodeKind, 'service' | 'function' | 'content'>;
    readonly edgeKind: Extract<SceneEdgeKind, 'dependency' | 'association'> | null;
    readonly edgeLabel: string | null;
    readonly unlockAnimationId: string;
    readonly detailRevealAnimationId: string;
    readonly coreAction: {
      readonly id: string;
      readonly animationId: string;
      readonly targetDetailIds: readonly string[];
    };
    readonly narrationId: string;
    readonly descriptions: {
      readonly locked: string;
      readonly opening: string;
      readonly ready: string;
      readonly viewed: string;
    };
    readonly summaries: {
      readonly locked: string;
      readonly opening: string;
      readonly ready: string;
      readonly checking: string;
      readonly viewed: string;
    };
    readonly details: readonly {
      readonly id: string;
      readonly label: string;
      readonly symbolId: SceneNodeSymbolId;
      readonly position: AuthoredPosition;
      readonly descriptions: {
        readonly available: string;
        readonly opened: string;
      };
    }[];
  }[];
}

export interface AccountExplorationProgress {
  readonly accountId: string;
  readonly unlocked: boolean;
  readonly viewed: boolean;
  readonly completedCoreActionDetailId: string | null;
  readonly previewedDetailIds: readonly string[];
}

export type AccountExplorationScenePhase =
  | 'idle'
  | 'unlocking-account'
  | 'revealing-details'
  | 'exploring'
  | 'performing-core-action';

export interface AccountExplorationSceneSnapshot {
  readonly phase: AccountExplorationScenePhase;
  readonly network: NetworkSceneSnapshot;
  readonly accountProgress: readonly AccountExplorationProgress[];
  readonly activeAccountId: string | null;
  readonly activePreviewDetailId: string | null;
  readonly pendingCoreActionTargetDetailId: string | null;
  readonly viewedAccountIds: readonly string[];
  readonly isComplete: boolean;
  readonly pendingAnimationId: string | null;
  readonly narrationId: string;
}

export type AccountExplorationSceneEvent =
  | { readonly type: 'node-selected'; readonly nodeId: string }
  | {
      readonly type: 'core-action-started';
      readonly accountId: string;
      readonly targetDetailId: string;
    }
  | { readonly type: 'animation-settled'; readonly animationId: string };

export type AccountExplorationSceneEffect =
  | { readonly type: 'play-animation'; readonly animationId: string }
  | { readonly type: 'focus-node'; readonly nodeId: string };

export interface AccountExplorationSceneTransition {
  readonly snapshot: AccountExplorationSceneSnapshot;
  readonly effects: readonly AccountExplorationSceneEffect[];
}

function progressFor(
  snapshot: Pick<AccountExplorationSceneSnapshot, 'accountProgress'>,
  accountId: string,
): AccountExplorationProgress | undefined {
  return snapshot.accountProgress.find((progress) => progress.accountId === accountId);
}

function replaceProgress(
  progress: readonly AccountExplorationProgress[],
  next: AccountExplorationProgress,
): readonly AccountExplorationProgress[] {
  return progress.map((current) => (current.accountId === next.accountId ? next : current));
}

function viewedAccountIds(
  definition: AccountExplorationSceneDefinition,
  progress: readonly AccountExplorationProgress[],
): readonly string[] {
  return definition.accounts
    .filter((account) => progress.find(({ accountId }) => accountId === account.id)?.viewed)
    .map(({ id }) => id);
}

function formatSummary(template: string, detail: string): string {
  return template.replaceAll('{detail}', detail);
}

function buildNetwork(
  definition: AccountExplorationSceneDefinition,
  values: Omit<AccountExplorationSceneSnapshot, 'network' | 'viewedAccountIds' | 'isComplete'>,
  viewedIds: readonly string[],
): NetworkSceneSnapshot {
  const viewed = new Set(viewedIds);
  const isComplete = viewedIds.length === definition.accounts.length;
  const interactionLocked = values.pendingAnimationId !== null;
  const activeAccount = definition.accounts.find(({ id }) => id === values.activeAccountId);
  const activeProgress =
    activeAccount === undefined ? undefined : progressFor(values, activeAccount.id);
  const pendingDetailId = values.pendingCoreActionTargetDetailId;
  const accountNodes: readonly SceneNode[] = definition.accounts.map((account) => {
    const accountProgress = progressFor(values, account.id);
    const isActive = activeAccount?.id === account.id;
    const description =
      isActive && values.phase === 'unlocking-account'
        ? account.descriptions.opening
        : viewed.has(account.id)
          ? account.descriptions.viewed
          : accountProgress?.unlocked === true
            ? account.descriptions.ready
            : account.descriptions.locked;
    return {
      id: account.id,
      kind: 'account',
      symbolId: account.symbolId,
      label: account.label,
      description,
      status: viewed.has(account.id) ? 'viewed' : 'neutral',
      locked: accountProgress?.unlocked !== true,
      position: account.position,
      selectable: !interactionLocked,
    };
  });
  const detailNodes: readonly SceneNode[] = definition.accounts.flatMap((account) => {
    const accountProgress = progressFor(values, account.id);
    if (accountProgress?.unlocked !== true) return [];
    const previewedDetails = new Set(accountProgress.previewedDetailIds);
    return account.details.map((detail) => ({
      id: detail.id,
      kind: account.detailKind,
      symbolId: detail.symbolId,
      label: detail.label,
      description: previewedDetails.has(detail.id)
        ? detail.descriptions.opened
        : detail.descriptions.available,
      status: previewedDetails.has(detail.id) ? 'viewed' : 'neutral',
      position: detail.position,
      selectable: !interactionLocked,
    }));
  });
  const edges: readonly SceneEdge[] = definition.accounts.flatMap((account) => {
    const accountProgress = progressFor(values, account.id);
    const edgeKind = account.edgeKind;
    if (accountProgress?.unlocked !== true || edgeKind === null) return [];
    const isPendingCoreAction =
      values.phase === 'performing-core-action' && activeAccount?.id === account.id;
    return account.details.map((detail) => ({
      id: `${account.id}--${detail.id}`,
      sourceId: account.id,
      targetId: detail.id,
      kind: edgeKind,
      status:
        isPendingCoreAction && pendingDetailId === detail.id
          ? 'checking'
          : accountProgress.completedCoreActionDetailId === detail.id
            ? 'opened'
            : 'neutral',
      label: account.edgeLabel,
    }));
  });

  let accessibleSummary = isComplete ? definition.summaries.complete : definition.summaries.initial;
  if (!isComplete && activeAccount !== undefined && activeProgress !== undefined) {
    accessibleSummary =
      values.phase === 'unlocking-account' || values.phase === 'revealing-details'
        ? activeAccount.summaries.opening
        : values.phase === 'performing-core-action'
          ? formatSummary(
              activeAccount.summaries.checking,
              activeAccount.details.find(({ id }) => id === pendingDetailId)?.label ?? '',
            )
          : activeProgress.viewed
            ? activeAccount.summaries.viewed
            : activeProgress.unlocked
              ? activeAccount.summaries.ready
              : activeAccount.summaries.locked;
  }

  return {
    id: definition.id,
    nodes: [...accountNodes, ...detailNodes],
    edges,
    accessibleSummary,
  };
}

function createSnapshot(
  definition: AccountExplorationSceneDefinition,
  values: Omit<
    AccountExplorationSceneSnapshot,
    'network' | 'viewedAccountIds' | 'isComplete'
  >,
): AccountExplorationSceneSnapshot {
  const viewedIds = viewedAccountIds(definition, values.accountProgress);
  const isComplete = viewedIds.length === definition.accounts.length;
  return {
    ...values,
    viewedAccountIds: viewedIds,
    isComplete,
    network: buildNetwork(definition, values, viewedIds),
  };
}

export function createAccountExplorationScene(
  definition: AccountExplorationSceneDefinition,
): AccountExplorationSceneSnapshot {
  return createSnapshot(definition, {
    phase: 'idle',
    accountProgress: definition.accounts.map(({ id }) => ({
      accountId: id,
      unlocked: false,
      viewed: false,
      completedCoreActionDetailId: null,
      previewedDetailIds: [],
    })),
    activeAccountId: null,
    activePreviewDetailId: null,
    pendingCoreActionTargetDetailId: null,
    pendingAnimationId: null,
    narrationId: definition.initialNarrationId,
  });
}

function selectDetail(
  definition: AccountExplorationSceneDefinition,
  snapshot: AccountExplorationSceneSnapshot,
  nodeId: string,
): AccountExplorationSceneTransition | null {
  const account = definition.accounts.find((candidate) =>
    candidate.details.some((detail) => detail.id === nodeId),
  );
  if (account === undefined) return null;
  const progress = progressFor(snapshot, account.id);
  const detail = account.details.find(({ id }) => id === nodeId);
  if (progress?.unlocked !== true || detail === undefined) return null;
  const previewedDetailIds = progress.previewedDetailIds.includes(detail.id)
    ? progress.previewedDetailIds
    : [...progress.previewedDetailIds, detail.id];
  return {
    snapshot: createSnapshot(definition, {
      ...snapshot,
      phase: 'exploring',
      accountProgress: replaceProgress(snapshot.accountProgress, {
        ...progress,
        previewedDetailIds,
      }),
      activeAccountId: account.id,
      activePreviewDetailId: detail.id,
      pendingCoreActionTargetDetailId: null,
      pendingAnimationId: null,
      narrationId: account.narrationId,
    }),
    effects: [{ type: 'focus-node', nodeId: detail.id }],
  };
}

export function transitionAccountExplorationScene(
  definition: AccountExplorationSceneDefinition,
  snapshot: AccountExplorationSceneSnapshot,
  event: AccountExplorationSceneEvent,
): AccountExplorationSceneTransition {
  if (event.type === 'node-selected') {
    if (snapshot.pendingAnimationId !== null) return { snapshot, effects: [] };

    const account = definition.accounts.find(({ id }) => id === event.nodeId);
    if (account !== undefined) {
      const progress = progressFor(snapshot, account.id);
      if (progress === undefined) return { snapshot, effects: [] };
      if (!progress.unlocked) {
        return {
          snapshot: createSnapshot(definition, {
            ...snapshot,
            phase: 'unlocking-account',
            activeAccountId: account.id,
            activePreviewDetailId: null,
            pendingCoreActionTargetDetailId: null,
            pendingAnimationId: account.unlockAnimationId,
            narrationId: account.narrationId,
          }),
          effects: [{ type: 'play-animation', animationId: account.unlockAnimationId }],
        };
      }
      return {
        snapshot: createSnapshot(definition, {
          ...snapshot,
          phase: 'exploring',
          activeAccountId: account.id,
          activePreviewDetailId: null,
          pendingCoreActionTargetDetailId: null,
          pendingAnimationId: null,
          narrationId: account.narrationId,
        }),
        effects: [{ type: 'focus-node', nodeId: account.id }],
      };
    }

    return selectDetail(definition, snapshot, event.nodeId) ?? { snapshot, effects: [] };
  }

  if (event.type === 'core-action-started') {
    if (snapshot.pendingAnimationId !== null) return { snapshot, effects: [] };
    const account = definition.accounts.find(({ id }) => id === event.accountId);
    const progress = account === undefined ? undefined : progressFor(snapshot, account.id);
    if (
      account === undefined ||
      progress?.unlocked !== true ||
      progress.viewed ||
      !account.coreAction.targetDetailIds.includes(event.targetDetailId)
    ) {
      return { snapshot, effects: [] };
    }
    return {
      snapshot: createSnapshot(definition, {
        ...snapshot,
        phase: 'performing-core-action',
        activeAccountId: account.id,
        activePreviewDetailId: null,
        pendingCoreActionTargetDetailId: event.targetDetailId,
        pendingAnimationId: account.coreAction.animationId,
        narrationId: account.narrationId,
      }),
      effects: [{ type: 'play-animation', animationId: account.coreAction.animationId }],
    };
  }

  if (snapshot.pendingAnimationId === null || snapshot.pendingAnimationId !== event.animationId) {
    return { snapshot, effects: [] };
  }
  const activeAccount = definition.accounts.find(({ id }) => id === snapshot.activeAccountId);
  const activeProgress =
    activeAccount === undefined ? undefined : progressFor(snapshot, activeAccount.id);
  if (activeAccount === undefined || activeProgress === undefined) {
    return { snapshot, effects: [] };
  }

  if (event.animationId === activeAccount.unlockAnimationId) {
    const nextProgress = replaceProgress(snapshot.accountProgress, {
      ...activeProgress,
      unlocked: true,
    });
    return {
      snapshot: createSnapshot(definition, {
        ...snapshot,
        phase: 'revealing-details',
        accountProgress: nextProgress,
        pendingAnimationId: activeAccount.detailRevealAnimationId,
        narrationId: activeAccount.narrationId,
      }),
      effects: [{ type: 'play-animation', animationId: activeAccount.detailRevealAnimationId }],
    };
  }

  if (event.animationId === activeAccount.detailRevealAnimationId) {
    return {
      snapshot: createSnapshot(definition, {
        ...snapshot,
        phase: 'exploring',
        pendingAnimationId: null,
        narrationId: activeAccount.narrationId,
      }),
      effects: [],
    };
  }

  if (event.animationId !== activeAccount.coreAction.animationId) {
    return { snapshot, effects: [] };
  }
  const targetDetailId = snapshot.pendingCoreActionTargetDetailId;
  if (targetDetailId === null) return { snapshot, effects: [] };
  const previewedDetailIds = activeProgress.previewedDetailIds.includes(targetDetailId)
    ? activeProgress.previewedDetailIds
    : [...activeProgress.previewedDetailIds, targetDetailId];
  const nextProgress = replaceProgress(snapshot.accountProgress, {
    ...activeProgress,
    viewed: true,
    completedCoreActionDetailId: targetDetailId,
    previewedDetailIds,
  });
  return {
    snapshot: createSnapshot(definition, {
      ...snapshot,
      phase: 'exploring',
      accountProgress: nextProgress,
      activePreviewDetailId: targetDetailId,
      pendingCoreActionTargetDetailId: null,
      pendingAnimationId: null,
      narrationId: activeAccount.narrationId,
    }),
    effects: [{ type: 'focus-node', nodeId: targetDetailId }],
  };
}

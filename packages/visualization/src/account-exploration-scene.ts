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
    readonly narrationIds: {
      readonly open: string;
      readonly understood: string;
    };
    readonly descriptions: {
      readonly locked: string;
      readonly opening: string;
      readonly open: string;
      readonly understood: string;
    };
    readonly summaries: {
      readonly locked: string;
      readonly opening: string;
      readonly progress: string;
      readonly checking: string;
      readonly understood: string;
    };
    readonly details: readonly {
      readonly id: string;
      readonly label: string;
      readonly symbolId: SceneNodeSymbolId;
      readonly position: AuthoredPosition;
      readonly animationId: string;
      readonly narrationId: string;
      readonly descriptions: {
        readonly available: string;
        readonly checking: string;
        readonly opened: string;
      };
    }[];
  }[];
}

export interface AccountExplorationProgress {
  readonly accountId: string;
  readonly unlocked: boolean;
  readonly openedDetailIds: readonly string[];
  readonly activePreviewDetailId: string | null;
}

export type AccountExplorationScenePhase =
  | 'idle'
  | 'unlocking-account'
  | 'exploring'
  | 'checking-detail'
  | 'complete';

export interface AccountExplorationSceneSnapshot {
  readonly phase: AccountExplorationScenePhase;
  readonly network: NetworkSceneSnapshot;
  readonly accountProgress: readonly AccountExplorationProgress[];
  readonly activeAccountId: string | null;
  readonly activePreviewDetailId: string | null;
  readonly understoodAccountIds: readonly string[];
  readonly pendingAnimationId: string | null;
  readonly narrationId: string;
}

export type AccountExplorationSceneEvent =
  | { readonly type: 'node-selected'; readonly nodeId: string }
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

function understoodAccountIds(
  definition: AccountExplorationSceneDefinition,
  progress: readonly AccountExplorationProgress[],
): readonly string[] {
  return definition.accounts
    .filter((account) => {
      const accountProgress = progress.find(({ accountId }) => accountId === account.id);
      return accountProgress?.openedDetailIds.length === account.details.length;
    })
    .map(({ id }) => id);
}

function formatSummary(
  template: string,
  values: Readonly<Record<'opened' | 'total' | 'detail', string | number>>,
): string {
  return Object.entries(values).reduce(
    (summary, [key, value]) => summary.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function buildNetwork(
  definition: AccountExplorationSceneDefinition,
  values: Omit<AccountExplorationSceneSnapshot, 'network' | 'understoodAccountIds'>,
  understoodIds: readonly string[],
): NetworkSceneSnapshot {
  const understood = new Set(understoodIds);
  const interactionLocked = values.pendingAnimationId !== null;
  const activeAccount = definition.accounts.find(({ id }) => id === values.activeAccountId);
  const activeProgress =
    activeAccount === undefined ? undefined : progressFor(values, activeAccount.id);
  const accountNodes: readonly SceneNode[] = definition.accounts.map((account) => {
    const accountProgress = progressFor(values, account.id);
    const isActive = activeAccount?.id === account.id;
    const description =
      isActive && values.phase === 'unlocking-account'
        ? account.descriptions.opening
        : understood.has(account.id)
          ? account.descriptions.understood
          : accountProgress?.unlocked === true
            ? account.descriptions.open
            : account.descriptions.locked;
    return {
      id: account.id,
      kind: 'account',
      symbolId: account.symbolId,
      label: account.label,
      description,
      status: understood.has(account.id) ? 'understood' : 'neutral',
      position: account.position,
      selectable: !interactionLocked,
    };
  });
  const activeDetailsVisible =
    activeAccount !== undefined &&
    activeProgress !== undefined &&
    (activeProgress.unlocked || values.phase === 'unlocking-account');
  const openedDetails = new Set(activeProgress?.openedDetailIds ?? []);
  const pendingDetail = activeAccount?.details.find(
    ({ animationId }) => animationId === values.pendingAnimationId,
  );
  const detailNodes: readonly SceneNode[] =
    activeAccount === undefined || !activeDetailsVisible
      ? []
      : activeAccount.details.map((detail) => ({
          id: detail.id,
          kind: activeAccount.detailKind,
          symbolId: detail.symbolId,
          label: detail.label,
          description:
            pendingDetail?.id === detail.id
              ? detail.descriptions.checking
              : openedDetails.has(detail.id)
                ? detail.descriptions.opened
                : detail.descriptions.available,
          status: openedDetails.has(detail.id) ? 'understood' : 'neutral',
          position: detail.position,
          selectable: !interactionLocked,
        }));
  const activeEdgeKind = activeAccount?.edgeKind ?? null;
  const edges: readonly SceneEdge[] =
    activeAccount === undefined || activeEdgeKind === null
      ? []
      : activeAccount.details.flatMap((detail) =>
          openedDetails.has(detail.id)
            ? [
                {
                  id: `${activeAccount.id}--${detail.id}`,
                  sourceId: activeAccount.id,
                  targetId: detail.id,
                  kind: activeEdgeKind,
                  status: 'neutral',
                  label: activeAccount.edgeLabel,
                },
              ]
            : [],
        );

  let accessibleSummary = definition.summaries.initial;
  if (understoodIds.length === definition.accounts.length) {
    accessibleSummary = definition.summaries.complete;
  } else if (activeAccount !== undefined && activeProgress !== undefined) {
    accessibleSummary =
      values.phase === 'unlocking-account'
        ? activeAccount.summaries.opening
        : values.phase === 'checking-detail' && pendingDetail !== undefined
          ? formatSummary(activeAccount.summaries.checking, {
              opened: openedDetails.size,
              total: activeAccount.details.length,
              detail: pendingDetail.label,
            })
          : understood.has(activeAccount.id)
            ? activeAccount.summaries.understood
            : activeProgress.unlocked
              ? formatSummary(activeAccount.summaries.progress, {
                  opened: openedDetails.size,
                  total: activeAccount.details.length,
                  detail: '',
                })
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
  values: Omit<AccountExplorationSceneSnapshot, 'network' | 'understoodAccountIds'>,
): AccountExplorationSceneSnapshot {
  const understoodIds = understoodAccountIds(definition, values.accountProgress);
  return {
    ...values,
    understoodAccountIds: understoodIds,
    network: buildNetwork(definition, values, understoodIds),
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
      openedDetailIds: [],
      activePreviewDetailId: null,
    })),
    activeAccountId: null,
    activePreviewDetailId: null,
    pendingAnimationId: null,
    narrationId: definition.initialNarrationId,
  });
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
      const accountProgress = progressFor(snapshot, account.id);
      if (accountProgress === undefined) return { snapshot, effects: [] };
      if (!accountProgress.unlocked) {
        return {
          snapshot: createSnapshot(definition, {
            ...snapshot,
            phase: 'unlocking-account',
            activeAccountId: account.id,
            activePreviewDetailId: null,
            pendingAnimationId: account.unlockAnimationId,
            narrationId: account.narrationIds.open,
          }),
          effects: [{ type: 'play-animation', animationId: account.unlockAnimationId }],
        };
      }

      const activeDetail = account.details.find(
        ({ id }) => id === accountProgress.activePreviewDetailId,
      );
      return {
        snapshot: createSnapshot(definition, {
          ...snapshot,
          phase:
            snapshot.understoodAccountIds.length === definition.accounts.length
              ? 'complete'
              : 'exploring',
          activeAccountId: account.id,
          activePreviewDetailId: accountProgress.activePreviewDetailId,
          narrationId:
            activeDetail?.narrationId ??
            (snapshot.understoodAccountIds.includes(account.id)
              ? account.narrationIds.understood
              : account.narrationIds.open),
        }),
        effects: [],
      };
    }

    const activeAccount = definition.accounts.find(({ id }) => id === snapshot.activeAccountId);
    const activeProgress =
      activeAccount === undefined ? undefined : progressFor(snapshot, activeAccount.id);
    const detail = activeAccount?.details.find(({ id }) => id === event.nodeId);
    if (activeAccount === undefined || activeProgress?.unlocked !== true || detail === undefined) {
      return { snapshot, effects: [] };
    }

    if (activeProgress.openedDetailIds.includes(detail.id)) {
      const nextProgress = replaceProgress(snapshot.accountProgress, {
        ...activeProgress,
        activePreviewDetailId: detail.id,
      });
      return {
        snapshot: createSnapshot(definition, {
          ...snapshot,
          accountProgress: nextProgress,
          activePreviewDetailId: detail.id,
          narrationId: detail.narrationId,
        }),
        effects: [{ type: 'focus-node', nodeId: detail.id }],
      };
    }

    return {
      snapshot: createSnapshot(definition, {
        ...snapshot,
        phase: 'checking-detail',
        activePreviewDetailId: null,
        pendingAnimationId: detail.animationId,
      }),
      effects: [{ type: 'play-animation', animationId: detail.animationId }],
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
    const firstDetail = activeAccount.details[0];
    return {
      snapshot: createSnapshot(definition, {
        ...snapshot,
        phase: 'exploring',
        accountProgress: nextProgress,
        pendingAnimationId: null,
        narrationId: activeAccount.narrationIds.open,
      }),
      effects: firstDetail === undefined ? [] : [{ type: 'focus-node', nodeId: firstDetail.id }],
    };
  }

  const detail = activeAccount.details.find(({ animationId }) => animationId === event.animationId);
  if (detail === undefined) return { snapshot, effects: [] };
  const nextProgress = replaceProgress(snapshot.accountProgress, {
    ...activeProgress,
    openedDetailIds: [...activeProgress.openedDetailIds, detail.id],
    activePreviewDetailId: detail.id,
  });
  const nextUnderstoodIds = understoodAccountIds(definition, nextProgress);
  return {
    snapshot: createSnapshot(definition, {
      ...snapshot,
      phase: nextUnderstoodIds.length === definition.accounts.length ? 'complete' : 'exploring',
      accountProgress: nextProgress,
      activePreviewDetailId: detail.id,
      pendingAnimationId: null,
      narrationId: detail.narrationId,
    }),
    effects: [{ type: 'focus-node', nodeId: detail.id }],
  };
}

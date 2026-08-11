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
    readonly previewSequence: readonly string[];
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
      readonly preview: {
        readonly animationId: string;
      };
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
  readonly viewedDetailIds: readonly string[];
}

export type AccountExplorationScenePhase =
  | 'idle'
  | 'unlocking-account'
  | 'revealing-details'
  | 'playing-preview'
  | 'preview-ready';

export type AccountExplorationPreviewPlayback = 'idle' | 'playing' | 'ready';

export interface AccountExplorationSceneSnapshot {
  readonly phase: AccountExplorationScenePhase;
  readonly network: NetworkSceneSnapshot;
  readonly accountProgress: readonly AccountExplorationProgress[];
  readonly activeAccountId: string | null;
  readonly activePreviewDetailId: string | null;
  readonly previewPlayback: AccountExplorationPreviewPlayback;
  readonly viewedAccountIds: readonly string[];
  readonly isComplete: boolean;
  readonly pendingAnimationId: string | null;
  readonly narrationId: string;
}

export type AccountExplorationSceneEvent =
  | { readonly type: 'node-selected'; readonly nodeId: string }
  | { readonly type: 'preview-replay-requested' }
  | { readonly type: 'preview-advance-requested' }
  | { readonly type: 'animation-settled'; readonly animationId: string };

export type AccountExplorationSceneEffect =
  | { readonly type: 'play-animation'; readonly animationId: string }
  | { readonly type: 'play-preview-animation'; readonly animationId: string }
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
  const activePreviewDetailId = values.activePreviewDetailId;
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
      selectable: !interactionLocked && values.activeAccountId === null,
    };
  });
  const detailNodes: readonly SceneNode[] = definition.accounts.flatMap((account) => {
    const accountProgress = progressFor(values, account.id);
    if (accountProgress?.unlocked !== true) return [];
    const viewedDetails = new Set(accountProgress.viewedDetailIds);
    return account.details.map((detail) => ({
      id: detail.id,
      kind: account.detailKind,
      symbolId: detail.symbolId,
      label: detail.label,
      description: viewedDetails.has(detail.id)
        ? detail.descriptions.opened
        : detail.descriptions.available,
      status: viewedDetails.has(detail.id) ? 'viewed' : 'neutral',
      position: detail.position,
      selectable: false,
    }));
  });
  const edges: readonly SceneEdge[] = definition.accounts.flatMap((account) => {
    const accountProgress = progressFor(values, account.id);
    const edgeKind = account.edgeKind;
    if (accountProgress?.unlocked !== true || edgeKind === null) return [];
    const isPlayingPreview =
      values.phase === 'playing-preview' && activeAccount?.id === account.id;
    return account.details.map((detail) => ({
      id: `${account.id}--${detail.id}`,
      sourceId: account.id,
      targetId: detail.id,
      kind: edgeKind,
      status:
        isPlayingPreview && activePreviewDetailId === detail.id
          ? 'checking'
          : accountProgress.viewedDetailIds.includes(detail.id)
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
        : values.phase === 'playing-preview'
          ? formatSummary(
              activeAccount.summaries.checking,
              activeAccount.details.find(({ id }) => id === activePreviewDetailId)?.label ?? '',
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
      viewedDetailIds: [],
    })),
    activeAccountId: null,
    activePreviewDetailId: null,
    previewPlayback: 'idle',
    pendingAnimationId: null,
    narrationId: definition.initialNarrationId,
  });
}

function startPreview(
  definition: AccountExplorationSceneDefinition,
  snapshot: AccountExplorationSceneSnapshot,
  accountId: string,
  detailId: string,
): AccountExplorationSceneTransition {
  const account = definition.accounts.find(({ id }) => id === accountId);
  const detail = account?.details.find(({ id }) => id === detailId);
  if (account === undefined || detail === undefined) return { snapshot, effects: [] };
  return {
    snapshot: createSnapshot(definition, {
      ...snapshot,
      phase: 'playing-preview',
      activeAccountId: account.id,
      activePreviewDetailId: detail.id,
      previewPlayback: 'playing',
      pendingAnimationId: detail.preview.animationId,
      narrationId: account.narrationId,
    }),
    effects: [
      { type: 'focus-node', nodeId: detail.id },
      { type: 'play-preview-animation', animationId: detail.preview.animationId },
    ],
  };
}

export function transitionAccountExplorationScene(
  definition: AccountExplorationSceneDefinition,
  snapshot: AccountExplorationSceneSnapshot,
  event: AccountExplorationSceneEvent,
): AccountExplorationSceneTransition {
  if (event.type === 'node-selected') {
    if (snapshot.pendingAnimationId !== null || snapshot.activeAccountId !== null) {
      return { snapshot, effects: [] };
    }

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
            previewPlayback: 'idle',
            pendingAnimationId: account.unlockAnimationId,
            narrationId: account.narrationId,
          }),
          effects: [{ type: 'play-animation', animationId: account.unlockAnimationId }],
        };
      }
      const firstDetailId = account.previewSequence[0];
      return firstDetailId === undefined
        ? { snapshot, effects: [] }
        : startPreview(definition, snapshot, account.id, firstDetailId);
    }

    return { snapshot, effects: [] };
  }

  if (event.type === 'preview-replay-requested') {
    if (
      snapshot.previewPlayback !== 'ready' ||
      snapshot.pendingAnimationId !== null ||
      snapshot.activeAccountId === null ||
      snapshot.activePreviewDetailId === null
    ) {
      return { snapshot, effects: [] };
    }
    return startPreview(
      definition,
      snapshot,
      snapshot.activeAccountId,
      snapshot.activePreviewDetailId,
    );
  }

  if (event.type === 'preview-advance-requested') {
    if (
      snapshot.previewPlayback !== 'ready' ||
      snapshot.pendingAnimationId !== null ||
      snapshot.activeAccountId === null ||
      snapshot.activePreviewDetailId === null
    ) {
      return { snapshot, effects: [] };
    }
    const account = definition.accounts.find(({ id }) => id === snapshot.activeAccountId);
    const progress = account === undefined ? undefined : progressFor(snapshot, account.id);
    if (account === undefined || progress === undefined) return { snapshot, effects: [] };
    const currentIndex = account.previewSequence.indexOf(snapshot.activePreviewDetailId);
    const nextDetailId = account.previewSequence[currentIndex + 1];
    if (nextDetailId !== undefined) {
      return startPreview(definition, snapshot, account.id, nextDetailId);
    }
    const nextProgress = replaceProgress(snapshot.accountProgress, {
      ...progress,
      viewed: true,
    });
    return {
      snapshot: createSnapshot(definition, {
        ...snapshot,
        phase: 'idle',
        accountProgress: nextProgress,
        activeAccountId: null,
        activePreviewDetailId: null,
        previewPlayback: 'idle',
        pendingAnimationId: null,
        narrationId: account.narrationId,
      }),
      effects: [{ type: 'focus-node', nodeId: account.id }],
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
        previewPlayback: 'idle',
        pendingAnimationId: activeAccount.detailRevealAnimationId,
        narrationId: activeAccount.narrationId,
      }),
      effects: [{ type: 'play-animation', animationId: activeAccount.detailRevealAnimationId }],
    };
  }

  if (event.animationId === activeAccount.detailRevealAnimationId) {
    const firstDetailId = activeAccount.previewSequence[0];
    const settledSnapshot = createSnapshot(definition, {
      ...snapshot,
      pendingAnimationId: null,
      previewPlayback: 'idle',
      narrationId: activeAccount.narrationId,
    });
    return firstDetailId === undefined
      ? { snapshot: settledSnapshot, effects: [] }
      : startPreview(definition, settledSnapshot, activeAccount.id, firstDetailId);
  }

  const activeDetail = activeAccount.details.find(
    ({ id }) => id === snapshot.activePreviewDetailId,
  );
  if (activeDetail === undefined || event.animationId !== activeDetail.preview.animationId) {
    return { snapshot, effects: [] };
  }
  const viewedDetailIds = activeProgress.viewedDetailIds.includes(activeDetail.id)
    ? activeProgress.viewedDetailIds
    : [...activeProgress.viewedDetailIds, activeDetail.id];
  return {
    snapshot: createSnapshot(definition, {
      ...snapshot,
      phase: 'preview-ready',
      accountProgress: replaceProgress(snapshot.accountProgress, {
        ...activeProgress,
        viewedDetailIds,
      }),
      previewPlayback: 'ready',
      pendingAnimationId: null,
      narrationId: activeAccount.narrationId,
    }),
    effects: [{ type: 'focus-node', nodeId: activeDetail.id }],
  };
}

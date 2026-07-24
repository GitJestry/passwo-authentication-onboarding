import type { AuthoredPosition, NetworkSceneSnapshot, SceneEdge, SceneNode } from './scene.js';

export interface AccountServiceSceneDefinition {
  readonly id: string;
  readonly account: {
    readonly id: string;
    readonly label: string;
    readonly position: AuthoredPosition;
    readonly descriptions: {
      readonly locked: string;
      readonly opening: string;
      readonly open: string;
      readonly understood: string;
    };
  };
  readonly services: readonly {
    readonly id: string;
    readonly label: string;
    readonly position: AuthoredPosition;
    readonly animationId: string;
    readonly descriptions: {
      readonly available: string;
      readonly checking: string;
      readonly opened: string;
    };
  }[];
  readonly unlockAnimationId: string;
  readonly edgeLabel: string;
  readonly narrationIds: {
    readonly locked: string;
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
}

export type AccountServiceScenePhase =
  | 'locked'
  | 'opening-account'
  | 'exploring'
  | 'checking-service'
  | 'understood';

export interface AccountServiceSceneSnapshot {
  readonly phase: AccountServiceScenePhase;
  readonly network: NetworkSceneSnapshot;
  readonly openedServiceIds: readonly string[];
  readonly activePreviewServiceId: string | null;
  readonly pendingAnimationId: string | null;
  readonly narrationId: string;
}

export type AccountServiceSceneEvent =
  | { readonly type: 'node-selected'; readonly nodeId: string }
  | { readonly type: 'animation-settled'; readonly animationId: string };

export type AccountServiceSceneEffect =
  | { readonly type: 'play-animation'; readonly animationId: string }
  | { readonly type: 'focus-node'; readonly nodeId: string };

export interface AccountServiceSceneTransition {
  readonly snapshot: AccountServiceSceneSnapshot;
  readonly effects: readonly AccountServiceSceneEffect[];
}

function formatSummary(
  template: string,
  values: Readonly<Record<'opened' | 'total' | 'service', string | number>>,
): string {
  return Object.entries(values).reduce(
    (summary, [key, value]) => summary.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function buildNetwork(
  definition: AccountServiceSceneDefinition,
  phase: AccountServiceScenePhase,
  openedServiceIds: readonly string[],
  pendingAnimationId: string | null,
): NetworkSceneSnapshot {
  const opened = new Set(openedServiceIds);
  const activeService = definition.services.find(
    (service) => service.animationId === pendingAnimationId,
  );
  const allOpened = opened.size === definition.services.length;
  const accountDescription =
    phase === 'locked'
      ? definition.account.descriptions.locked
      : phase === 'opening-account'
        ? definition.account.descriptions.opening
        : allOpened
          ? definition.account.descriptions.understood
          : definition.account.descriptions.open;
  const accountNode: SceneNode = {
    id: definition.account.id,
    kind: 'account',
    label: definition.account.label,
    description: accountDescription,
    status: allOpened ? 'understood' : 'neutral',
    position: definition.account.position,
    selectable: phase === 'locked',
  };
  const serviceNodes: readonly SceneNode[] =
    phase === 'locked'
      ? []
      : definition.services.map((service) => {
          const isOpened = opened.has(service.id);
          const isChecking = activeService?.id === service.id;
          return {
            id: service.id,
            kind: 'service',
            label: service.label,
            description: isChecking
              ? service.descriptions.checking
              : isOpened
                ? service.descriptions.opened
                : service.descriptions.available,
            status: isOpened ? 'understood' : 'neutral',
            position: service.position,
            selectable: (phase === 'exploring' || phase === 'understood') && !isChecking,
          };
        });
  const edges: readonly SceneEdge[] = definition.services.flatMap((service) =>
    opened.has(service.id)
      ? [
          {
            id: `${definition.account.id}--${service.id}`,
            sourceId: definition.account.id,
            targetId: service.id,
            kind: 'dependency',
            status: 'direct',
            label: definition.edgeLabel,
          },
        ]
      : [],
  );
  const summary =
    phase === 'locked'
      ? definition.summaries.locked
      : phase === 'opening-account'
        ? definition.summaries.opening
        : phase === 'checking-service' && activeService !== undefined
          ? formatSummary(definition.summaries.checking, {
              opened: opened.size,
              total: definition.services.length,
              service: activeService.label,
            })
          : allOpened
            ? definition.summaries.understood
            : formatSummary(definition.summaries.progress, {
                opened: opened.size,
                total: definition.services.length,
                service: '',
              });

  return {
    id: definition.id,
    nodes: [accountNode, ...serviceNodes],
    edges,
    accessibleSummary: summary,
  };
}

function createSnapshot(
  definition: AccountServiceSceneDefinition,
  values: Omit<AccountServiceSceneSnapshot, 'network'>,
): AccountServiceSceneSnapshot {
  return {
    ...values,
    network: buildNetwork(
      definition,
      values.phase,
      values.openedServiceIds,
      values.pendingAnimationId,
    ),
  };
}

export function createAccountServiceScene(
  definition: AccountServiceSceneDefinition,
): AccountServiceSceneSnapshot {
  return createSnapshot(definition, {
    phase: 'locked',
    openedServiceIds: [],
    activePreviewServiceId: null,
    pendingAnimationId: null,
    narrationId: definition.narrationIds.locked,
  });
}

export function transitionAccountServiceScene(
  definition: AccountServiceSceneDefinition,
  snapshot: AccountServiceSceneSnapshot,
  event: AccountServiceSceneEvent,
): AccountServiceSceneTransition {
  if (event.type === 'node-selected') {
    if (event.nodeId === definition.account.id) {
      if (snapshot.phase !== 'locked') return { snapshot, effects: [] };

      const next = createSnapshot(definition, {
        ...snapshot,
        phase: 'opening-account',
        pendingAnimationId: definition.unlockAnimationId,
        narrationId: definition.narrationIds.open,
      });
      return {
        snapshot: next,
        effects: [{ type: 'play-animation', animationId: definition.unlockAnimationId }],
      };
    }

    if (snapshot.phase !== 'exploring' && snapshot.phase !== 'understood') {
      return { snapshot, effects: [] };
    }
    const service = definition.services.find(({ id }) => id === event.nodeId);
    if (service === undefined) return { snapshot, effects: [] };

    if (snapshot.openedServiceIds.includes(service.id)) {
      const next = createSnapshot(definition, {
        ...snapshot,
        activePreviewServiceId: service.id,
      });
      return {
        snapshot: next,
        effects: [{ type: 'focus-node', nodeId: service.id }],
      };
    }

    const next = createSnapshot(definition, {
      ...snapshot,
      phase: 'checking-service',
      activePreviewServiceId: null,
      pendingAnimationId: service.animationId,
    });
    return {
      snapshot: next,
      effects: [{ type: 'play-animation', animationId: service.animationId }],
    };
  }

  if (snapshot.pendingAnimationId === null || event.animationId !== snapshot.pendingAnimationId) {
    return { snapshot, effects: [] };
  }

  if (event.animationId === definition.unlockAnimationId) {
    const firstService = definition.services[0];
    const next = createSnapshot(definition, {
      ...snapshot,
      phase: 'exploring',
      pendingAnimationId: null,
    });
    return {
      snapshot: next,
      effects: firstService === undefined ? [] : [{ type: 'focus-node', nodeId: firstService.id }],
    };
  }

  const service = definition.services.find(({ animationId }) => animationId === event.animationId);
  if (service === undefined) return { snapshot, effects: [] };

  const openedServiceIds = [...snapshot.openedServiceIds, service.id];
  const understood = openedServiceIds.length === definition.services.length;
  const next = createSnapshot(definition, {
    ...snapshot,
    phase: understood ? 'understood' : 'exploring',
    openedServiceIds,
    activePreviewServiceId: service.id,
    pendingAnimationId: null,
    narrationId: understood ? definition.narrationIds.understood : definition.narrationIds.open,
  });
  return {
    snapshot: next,
    effects: [{ type: 'focus-node', nodeId: service.id }],
  };
}

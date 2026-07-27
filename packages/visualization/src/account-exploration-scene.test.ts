import { describe, expect, it } from 'vitest';
import {
  type AccountExplorationSceneDefinition,
  createAccountExplorationScene,
  transitionAccountExplorationScene,
} from './account-exploration-scene.js';

const definition: AccountExplorationSceneDefinition = {
  id: 'accounts',
  initialNarrationId: 'intro',
  summaries: { initial: 'Drei Konten', complete: 'Alle verstanden' },
  accounts: [
    {
      id: 'campus-id',
      label: 'CampusID',
      symbolId: 'campus-id',
      position: { x: 0.05, y: 0.05 },
      detailKind: 'service',
      edgeKind: 'dependency',
      edgeLabel: 'Geöffnet',
      unlockAnimationId: 'unlock-id',
      narrationIds: { open: 'id-open', understood: 'id-done' },
      descriptions: {
        locked: 'Öffnen',
        opening: 'Öffnet',
        open: 'Dienste',
        understood: 'Verstanden',
      },
      summaries: {
        locked: 'Zu',
        opening: 'Öffnet',
        progress: '{opened}/{total}',
        checking: '{detail}',
        understood: 'Fertig',
      },
      details: [
        {
          id: 'service-one',
          label: 'Dienst Eins',
          symbolId: 'service',
          position: { x: 0.1, y: 0.5 },
          animationId: 'check-service-one',
          narrationId: 'service-one',
          descriptions: { available: 'Öffnen', checking: 'Prüft', opened: 'Geöffnet' },
        },
        {
          id: 'service-two',
          label: 'Dienst Zwei',
          symbolId: 'service',
          position: { x: 0.5, y: 0.5 },
          animationId: 'check-service-two',
          narrationId: 'service-two',
          descriptions: { available: 'Öffnen', checking: 'Prüft', opened: 'Geöffnet' },
        },
      ],
    },
    {
      id: 'board',
      label: 'Board',
      symbolId: 'content',
      position: { x: 0.7, y: 0.05 },
      detailKind: 'content',
      edgeKind: null,
      edgeLabel: null,
      unlockAnimationId: 'unlock-board',
      narrationIds: { open: 'board-open', understood: 'board-done' },
      descriptions: {
        locked: 'Öffnen',
        opening: 'Öffnet',
        open: 'Inhalte',
        understood: 'Verstanden',
      },
      summaries: {
        locked: 'Zu',
        opening: 'Öffnet',
        progress: '{opened}/{total}',
        checking: '{detail}',
        understood: 'Fertig',
      },
      details: [
        {
          id: 'content-one',
          label: 'Inhalt',
          symbolId: 'content',
          position: { x: 0.2, y: 0.5 },
          animationId: 'check-content-one',
          narrationId: 'content-one',
          descriptions: { available: 'Öffnen', checking: 'Prüft', opened: 'Geöffnet' },
        },
      ],
    },
  ],
};

function select(snapshot: ReturnType<typeof createAccountExplorationScene>, nodeId: string) {
  return transitionAccountExplorationScene(definition, snapshot, {
    type: 'node-selected',
    nodeId,
  });
}

function settle(snapshot: ReturnType<typeof createAccountExplorationScene>, animationId: string) {
  return transitionAccountExplorationScene(definition, snapshot, {
    type: 'animation-settled',
    animationId,
  }).snapshot;
}

describe('account exploration scene', () => {
  it('shows every main account initially and only details for the active account', () => {
    const initial = createAccountExplorationScene(definition);
    expect(initial.network.nodes.map(({ id }) => id)).toEqual(['campus-id', 'board']);
    expect(initial.network.nodes.map(({ symbolId }) => symbolId)).toEqual(['campus-id', 'content']);

    const opening = select(initial, 'campus-id');
    expect(opening.snapshot.network.nodes.map(({ id }) => id)).toEqual([
      'campus-id',
      'board',
      'service-one',
      'service-two',
    ]);
    expect(opening.effects).toEqual([{ type: 'play-animation', animationId: 'unlock-id' }]);
  });

  it('preserves partial progress across freely ordered account changes without unlocking twice', () => {
    let snapshot = createAccountExplorationScene(definition);
    snapshot = settle(select(snapshot, 'campus-id').snapshot, 'unlock-id');
    snapshot = settle(select(snapshot, 'service-one').snapshot, 'check-service-one');
    snapshot = settle(select(snapshot, 'board').snapshot, 'unlock-board');
    snapshot = settle(select(snapshot, 'content-one').snapshot, 'check-content-one');

    const returned = select(snapshot, 'campus-id');
    expect(returned.effects).toEqual([]);
    expect(returned.snapshot.accountProgress).toEqual([
      expect.objectContaining({ accountId: 'campus-id', openedDetailIds: ['service-one'] }),
      expect.objectContaining({ accountId: 'board', openedDetailIds: ['content-one'] }),
    ]);
    expect(returned.snapshot.network.nodes.map(({ id }) => id)).toEqual([
      'campus-id',
      'board',
      'service-one',
      'service-two',
    ]);
  });

  it('ignores concurrent interactions and reaches the same state when the animation settles', () => {
    const initial = createAccountExplorationScene(definition);
    const opening = select(initial, 'campus-id');
    expect(select(opening.snapshot, 'board')).toEqual({ snapshot: opening.snapshot, effects: [] });

    const exploring = settle(opening.snapshot, 'unlock-id');
    const checking = select(exploring, 'service-one');
    expect(select(checking.snapshot, 'service-two')).toEqual({
      snapshot: checking.snapshot,
      effects: [],
    });
    expect(settle(checking.snapshot, 'check-service-one').activePreviewDetailId).toBe(
      'service-one',
    );
  });

  it('marks accounts only after all details and never creates Board edges', () => {
    let snapshot = createAccountExplorationScene(definition);
    snapshot = settle(select(snapshot, 'campus-id').snapshot, 'unlock-id');
    snapshot = settle(select(snapshot, 'service-one').snapshot, 'check-service-one');
    expect(snapshot.understoodAccountIds).toEqual([]);
    snapshot = settle(select(snapshot, 'service-two').snapshot, 'check-service-two');
    expect(snapshot.understoodAccountIds).toEqual(['campus-id']);
    expect(snapshot.network.edges).toHaveLength(2);

    snapshot = settle(select(snapshot, 'board').snapshot, 'unlock-board');
    snapshot = settle(select(snapshot, 'content-one').snapshot, 'check-content-one');
    expect(snapshot.phase).toBe('complete');
    expect(snapshot.understoodAccountIds).toEqual(['campus-id', 'board']);
    expect(snapshot.network.edges).toEqual([]);
  });
});

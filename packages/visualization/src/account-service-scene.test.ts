import { describe, expect, it } from 'vitest';
import {
  type AccountServiceSceneDefinition,
  createAccountServiceScene,
  transitionAccountServiceScene,
} from './account-service-scene.js';

const definition: AccountServiceSceneDefinition = {
  id: 'campus-id',
  account: {
    id: 'account',
    label: 'CampusID',
    position: { x: 0.1, y: 0.4 },
    descriptions: {
      locked: 'Öffnen',
      opening: 'Wird geöffnet',
      open: 'Dienste sichtbar',
      understood: 'Verstanden',
    },
  },
  services: [
    {
      id: 'one',
      label: 'Eins',
      position: { x: 0.6, y: 0.1 },
      animationId: 'check-one',
      descriptions: {
        available: 'Öffnen',
        checking: 'Wird geprüft',
        opened: 'Erneut öffnen',
      },
    },
    {
      id: 'two',
      label: 'Zwei',
      position: { x: 0.6, y: 0.7 },
      animationId: 'check-two',
      descriptions: {
        available: 'Öffnen',
        checking: 'Wird geprüft',
        opened: 'Erneut öffnen',
      },
    },
  ],
  unlockAnimationId: 'unlock',
  edgeLabel: 'Geöffnet',
  narrationIds: {
    locked: 'locked',
    open: 'open',
    understood: 'understood',
  },
  summaries: {
    locked: 'Gesperrt',
    opening: 'Wird geöffnet',
    progress: '{opened} von {total}',
    checking: '{service} wird geprüft',
    understood: 'Verstanden',
  },
};

function settle(snapshot: ReturnType<typeof createAccountServiceScene>, animationId: string) {
  return transitionAccountServiceScene(definition, snapshot, {
    type: 'animation-settled',
    animationId,
  }).snapshot;
}

describe('account service scene', () => {
  it('keeps authored positions deterministic and reveals services through the unlock effect', () => {
    const initial = createAccountServiceScene(definition);
    expect(initial.network.nodes).toEqual([
      expect.objectContaining({ id: 'account', position: { x: 0.1, y: 0.4 } }),
    ]);

    const opening = transitionAccountServiceScene(definition, initial, {
      type: 'node-selected',
      nodeId: 'account',
    });
    expect(opening.effects).toEqual([{ type: 'play-animation', animationId: 'unlock' }]);
    expect(opening.snapshot.network.nodes.map(({ id, position }) => ({ id, position }))).toEqual([
      { id: 'account', position: { x: 0.1, y: 0.4 } },
      { id: 'one', position: { x: 0.6, y: 0.1 } },
      { id: 'two', position: { x: 0.6, y: 0.7 } },
    ]);
  });

  it('marks the account understood only after every service has been opened', () => {
    const initial = createAccountServiceScene(definition);
    const opening = transitionAccountServiceScene(definition, initial, {
      type: 'node-selected',
      nodeId: 'account',
    }).snapshot;
    const exploring = settle(opening, 'unlock');
    const checkingOne = transitionAccountServiceScene(definition, exploring, {
      type: 'node-selected',
      nodeId: 'one',
    });
    expect(checkingOne.effects).toEqual([{ type: 'play-animation', animationId: 'check-one' }]);

    const oneOpened = settle(checkingOne.snapshot, 'check-one');
    expect(oneOpened.phase).toBe('exploring');
    expect(oneOpened.network.edges).toHaveLength(1);
    expect(oneOpened.network.nodes.find(({ id }) => id === 'account')?.status).toBe('neutral');

    const checkingTwo = transitionAccountServiceScene(definition, oneOpened, {
      type: 'node-selected',
      nodeId: 'two',
    }).snapshot;
    const complete = settle(checkingTwo, 'check-two');
    expect(complete.phase).toBe('understood');
    expect(complete.openedServiceIds).toEqual(['one', 'two']);
    expect(complete.network.edges).toHaveLength(2);
    expect(complete.network.nodes.find(({ id }) => id === 'account')?.status).toBe('understood');
  });

  it('ignores unavailable service and stale animation events', () => {
    const initial = createAccountServiceScene(definition);
    expect(
      transitionAccountServiceScene(definition, initial, {
        type: 'node-selected',
        nodeId: 'one',
      }),
    ).toEqual({ snapshot: initial, effects: [] });
    expect(settle(initial, 'stale')).toBe(initial);
  });
});

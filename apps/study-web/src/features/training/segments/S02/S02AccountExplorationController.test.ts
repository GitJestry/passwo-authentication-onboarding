import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { s02Content } from '@passwo/training-content';
import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
} from '@passwo/training-engine';
import { describe, expect, it } from 'vitest';
import { S02AccountExplorationController } from './S02AccountExplorationController.js';

function deferredPlayer() {
  const pending: {
    sequence: AnimationSequence;
    resolve: (result: AnimationResult) => void;
  }[] = [];
  const player: AnimationPlayerPort = {
    play: (sequence) =>
      new Promise((resolve) => {
        pending.push({ sequence, resolve });
      }),
    cancel: async () => undefined,
  };
  return { player, pending };
}

async function settleNext(
  pending: ReturnType<typeof deferredPlayer>['pending'],
  result: AnimationResult = { status: 'finished' },
): Promise<void> {
  const next = pending.shift();
  if (next === undefined) throw new Error('missing-animation');
  next.resolve(result);
  await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
}

async function openAccount(
  controller: S02AccountExplorationController,
  pending: ReturnType<typeof deferredPlayer>['pending'],
  accountId: string,
): Promise<void> {
  controller.selectNode(accountId);
  await settleNext(pending);
}

describe('S02AccountExplorationController', () => {
  it('keeps all main accounts visible, ignores concurrent input, and preserves free-order progress', async () => {
    const { player, pending } = deferredPlayer();
    const controller = new S02AccountExplorationController({ animationPlayer: player });
    expect(controller.getSnapshot().scene.network.nodes.map(({ id }) => id)).toEqual([
      'campus-id',
      'campus-mail',
      'campus-board-archive',
    ]);

    controller.selectNode('campus-mail');
    controller.selectNode('campus-id');
    expect(controller.getSnapshot().scene.activeAccountId).toBe('campus-mail');
    await settleNext(pending);
    controller.selectNode('campus-mail-notifications');
    await settleNext(pending);

    await openAccount(controller, pending, 'campus-id');
    controller.selectNode('campus-id-learnspace');
    await settleNext(pending);
    controller.selectNode('campus-mail');

    expect(controller.getSnapshot().scene.activeAccountId).toBe('campus-mail');
    expect(
      controller
        .getSnapshot()
        .scene.accountProgress.find(({ accountId }) => accountId === 'campus-mail')
        ?.openedDetailIds,
    ).toEqual(['campus-mail-notifications']);
  });

  it('notifies exactly once after 3/3, including animation recovery, and Board creates no edges', async () => {
    const { player, pending } = deferredPlayer();
    let completions = 0;
    const controller = new S02AccountExplorationController({
      animationPlayer: player,
      onAllAccountsUnderstood: () => {
        completions += 1;
      },
    });

    for (const account of s02Content.scene.accounts) {
      controller.selectNode(account.id);
      await settleNext(pending, { status: 'failed', reasonCode: 'adapter-failed' });
      for (const detail of account.details) {
        controller.selectNode(detail.id);
        await settleNext(pending, { status: 'failed', reasonCode: 'adapter-failed' });
      }
      expect(controller.getSnapshot().scene.understoodAccountIds.includes(account.id)).toBe(true);
    }

    expect(controller.getSnapshot().scene.phase).toBe('complete');
    expect(completions).toBe(1);
    controller.selectNode('campus-board-archive');
    controller.selectNode('campus-board-old-announcements');
    expect(completions).toBe(1);
    expect(controller.getSnapshot().scene.network.edges).toEqual([]);
  });

  it('reaches the same scene state after animation finish and recovery', async () => {
    async function run(result: AnimationResult) {
      const { player, pending } = deferredPlayer();
      const controller = new S02AccountExplorationController({ animationPlayer: player });
      controller.selectNode('campus-mail');
      await settleNext(pending, result);
      controller.selectNode('campus-mail-notifications');
      await settleNext(pending, result);
      return controller.getSnapshot().scene;
    }

    expect(await run({ status: 'failed', reasonCode: 'adapter-failed' })).toEqual(
      await run({ status: 'finished' }),
    );
  });

  it('keeps scene transitions and animation lookup out of React', () => {
    const componentPath = fileURLToPath(
      new URL('./S02AccountExplorationTraining.tsx', import.meta.url),
    );
    const source = readFileSync(componentPath, 'utf8');
    expect(source).not.toContain('transitionAccountExplorationScene');
    expect(source).not.toContain('getS02Animation');
    expect(source).not.toContain('passwordValues');
  });
});

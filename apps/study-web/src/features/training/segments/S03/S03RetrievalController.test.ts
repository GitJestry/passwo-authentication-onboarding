import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
} from '@passwo/training-engine';
import { describe, expect, it } from 'vitest';
import { createS03RetrievalNetwork, S03RetrievalController } from './S03RetrievalController.js';

class ImmediateAnimationPlayer implements AnimationPlayerPort {
  readonly playedIds: string[] = [];

  async play(sequence: AnimationSequence): Promise<AnimationResult> {
    this.playedIds.push(sequence.id);
    return { status: 'finished' };
  }

  async cancel(): Promise<void> {}
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe('S03RetrievalController', () => {
  it('reuses S01 account positions and S02 detail nodes for the active account', () => {
    const network = createS03RetrievalNetwork({
      activeAccountId: 'campus-mail',
      retrievalResults: {
        'campus-id': 'retrievable',
        'campus-mail': 'pending',
        'campus-board-archive': 'not-remembered',
      },
    });

    expect(network.nodes.map(({ id }) => id)).toContain('campus-mail-reset-links');
    expect(network.nodes.find(({ id }) => id === 'campus-id')?.status).toBe('retrievable');
    expect(network.nodes.find(({ id }) => id === 'campus-board-archive')?.status).toBe(
      'not-remembered',
    );
  });

  it('reaches the warning only after the controller has played the ten-second sequence', async () => {
    const player = new ImmediateAnimationPlayer();
    let warningCompletions = 0;
    const controller = new S03RetrievalController({
      animationPlayer: player,
      onWarningSequenceCompleted: () => {
        warningCompletions += 1;
      },
    });

    controller.playSuccessfulRetrieval('campus-id');
    controller.playSuccessfulRetrieval('campus-board-archive');
    controller.synchronize(
      {
        activeAccountId: 'campus-board-archive',
        retrievalResults: {
          'campus-id': 'retrievable',
          'campus-mail': 'not-remembered',
          'campus-board-archive': 'retrievable',
        },
      },
      true,
    );
    await flushMicrotasks();
    await flushMicrotasks();
    await flushMicrotasks();
    await flushMicrotasks();

    expect(player.playedIds).toEqual([
      's03-result-campus-id',
      's03-result-campus-board-archive',
      's03-completion-timeskip',
    ]);
    expect(warningCompletions).toBe(1);
    await controller.dispose();
  });
});

import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
} from '@passwo/training-engine';
import { describe, expect, it } from 'vitest';
import { createS03RetrievalNetwork, S03RetrievalController } from './S03RetrievalController.js';

class ImmediateAnimationPlayer implements AnimationPlayerPort {
  readonly playedIds: string[] = [];
  onPlay: ((sequence: AnimationSequence) => void) | null = null;

  async play(sequence: AnimationSequence): Promise<AnimationResult> {
    this.playedIds.push(sequence.id);
    this.onPlay?.(sequence);
    return { status: 'finished' };
  }

  async cancel(): Promise<void> {}
}

class FailedAnimationPlayer implements AnimationPlayerPort {
  async play(): Promise<AnimationResult> {
    return { status: 'failed', reasonCode: 'network-motion-adapter-failed' };
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

  it('allows confirmation only after the warning end scene has been reached', async () => {
    const player = new ImmediateAnimationPlayer();
    let warningConfirmations = 0;
    const controller = new S03RetrievalController({
      animationPlayer: player,
      onWarningConfirmed: () => {
        warningConfirmations += 1;
      },
    });
    player.onPlay = (sequence) => {
      if (sequence.id !== 's03-completion-timeskip') return;
      controller.updatePresentation({
        ...controller.getSnapshot().presentation,
        announcedMessageId: 's03.campus-board.warning',
      });
    };

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
    await flushMicrotasks();
    await flushMicrotasks();

    expect(player.playedIds).toEqual([
      's03-result-campus-id',
      's03-result-campus-board-archive',
      's03-completion-timeskip',
    ]);
    expect(controller.getSnapshot().warningState).toBe('ready');
    expect(warningConfirmations).toBe(0);

    controller.confirmWarning();
    controller.confirmWarning();

    expect(controller.getSnapshot().warningState).toBe('confirmed');
    expect(warningConfirmations).toBe(1);
    await controller.dispose();
  });

  it('does not treat a failed warning sequence as completed', async () => {
    let warningConfirmations = 0;
    const controller = new S03RetrievalController({
      animationPlayer: new FailedAnimationPlayer(),
      onWarningConfirmed: () => {
        warningConfirmations += 1;
      },
    });

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

    expect(controller.getSnapshot().warningState).toBe('failed');
    controller.confirmWarning();
    expect(warningConfirmations).toBe(0);
    await controller.dispose();
  });

  it('does not allow confirmation when playback finishes without the warning end scene', async () => {
    let warningConfirmations = 0;
    const controller = new S03RetrievalController({
      animationPlayer: new ImmediateAnimationPlayer(),
      onWarningConfirmed: () => {
        warningConfirmations += 1;
      },
    });

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

    expect(controller.getSnapshot().warningState).toBe('failed');
    controller.confirmWarning();
    expect(warningConfirmations).toBe(0);
    await controller.dispose();
  });
});

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
} from '@passwo/training-engine';
import type { NetworkRendererPort } from '@passwo/visualization';
import { describe, expect, it, vi } from 'vitest';
import { S02CampusIdController } from './S02CampusIdController.js';

const flushMicrotasks = (): Promise<void> => new Promise((resolve) => queueMicrotask(resolve));

function createDeferredResult(): {
  readonly promise: Promise<AnimationResult>;
  readonly resolve: (result: AnimationResult) => void;
} {
  let resolveResult: (result: AnimationResult) => void = () => undefined;
  const promise = new Promise<AnimationResult>((resolve) => {
    resolveResult = resolve;
  });
  return { promise, resolve: (result) => resolveResult(result) };
}

function createRenderer(): NetworkRendererPort {
  return {
    render: () => undefined,
    focusNode: () => undefined,
    announce: () => undefined,
  };
}

function createController(results: readonly AnimationResult[]) {
  const play = vi.fn<(sequence: AnimationSequence) => Promise<AnimationResult>>();
  for (const result of results) {
    play.mockResolvedValueOnce(result);
  }
  const animationPlayer: AnimationPlayerPort = {
    play,
    cancel: async () => undefined,
  };
  const controller = new S02CampusIdController({ animationPlayer });
  controller.attachRenderer(createRenderer());
  return { controller, play };
}

async function unlockCampusId(controller: S02CampusIdController): Promise<void> {
  controller.selectNode('campus-id');
  await flushMicrotasks();
}

describe('S02CampusIdController', () => {
  it('opens exactly the selected service after a finished animation', async () => {
    const { controller, play } = createController([{ status: 'finished' }, { status: 'finished' }]);

    await unlockCampusId(controller);
    controller.selectNode('learnspace');
    await flushMicrotasks();

    expect(play).toHaveBeenCalledTimes(2);
    expect(controller.getSnapshot().scene.openedServiceIds).toEqual(['learnspace']);
    expect(controller.getSnapshot().scene.activePreviewServiceId).toBe('learnspace');
    expect(controller.getSnapshot().scene.phase).toBe('exploring');
  });

  it('does not open a service or mark the account understood when an animation is cancelled', async () => {
    const { controller } = createController([{ status: 'finished' }, { status: 'cancelled' }]);

    await unlockCampusId(controller);
    controller.selectNode('exam-portal');
    await flushMicrotasks();

    expect(controller.getSnapshot().scene.openedServiceIds).toEqual([]);
    expect(controller.getSnapshot().scene.phase).toBe('checking-service');
    expect(controller.getSnapshot().scene.phase).not.toBe('understood');
  });

  it('uses the explicit recovery event to reach the authored end state after a failure', async () => {
    const { controller } = createController([
      { status: 'finished' },
      { status: 'failed', reasonCode: 'network-motion-adapter-failed' },
    ]);

    await unlockCampusId(controller);
    controller.selectNode('cloud-notes');
    await flushMicrotasks();

    expect(controller.getSnapshot().scene.openedServiceIds).toEqual(['cloud-notes']);
    expect(controller.getSnapshot().scene.phase).toBe('exploring');
  });

  it('ignores repeated selections while an animation is pending and does not double progress', async () => {
    const serviceResult = createDeferredResult();
    const animationPlayer: AnimationPlayerPort = {
      play: (sequence) => {
        if (sequence.id === 's02-unlock-campus-id') return Promise.resolve({ status: 'finished' });
        return serviceResult.promise;
      },
      cancel: async () => undefined,
    };
    const controller = new S02CampusIdController({ animationPlayer });
    controller.attachRenderer(createRenderer());

    await unlockCampusId(controller);
    controller.selectNode('learnspace');
    controller.selectNode('learnspace');
    serviceResult.resolve({ status: 'finished' });
    await flushMicrotasks();

    expect(controller.getSnapshot().scene.openedServiceIds).toEqual(['learnspace']);
    expect(controller.getSnapshot().scene.phase).toBe('exploring');
  });

  it('marks CampusID understood only after all three services finish or recover', async () => {
    const { controller } = createController([
      { status: 'finished' },
      { status: 'finished' },
      { status: 'failed', reasonCode: 'adapter-failed' },
      { status: 'finished' },
    ]);

    await unlockCampusId(controller);
    controller.selectNode('learnspace');
    await flushMicrotasks();
    controller.selectNode('exam-portal');
    await flushMicrotasks();

    expect(controller.getSnapshot().scene.phase).toBe('exploring');
    expect(controller.getSnapshot().scene.openedServiceIds).toEqual(['learnspace', 'exam-portal']);

    controller.selectNode('cloud-notes');
    await flushMicrotasks();

    expect(controller.getSnapshot().scene.phase).toBe('understood');
    expect(controller.getSnapshot().scene.openedServiceIds).toEqual([
      'learnspace',
      'exam-portal',
      'cloud-notes',
    ]);
  });

  it('keeps orchestration and animation port calls out of the React component', async () => {
    const componentPath = fileURLToPath(new URL('./S02CampusIdTraining.tsx', import.meta.url));
    const source = await readFile(componentPath, 'utf8');

    expect(source).not.toContain('transitionAccountServiceScene');
    expect(source).not.toContain('getS02CampusIdAnimation');
    expect(source).not.toContain('.play(');
    expect(source).toContain('controller.selectNode(nodeId)');
  });
});

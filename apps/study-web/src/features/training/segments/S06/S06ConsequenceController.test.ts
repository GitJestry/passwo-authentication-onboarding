import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
  SegmentTimingEvent,
} from '@passwo/training-engine';
import { describe, expect, it, vi } from 'vitest';
import {
  NetworkMotionAdapter,
  type NetworkPresentationSnapshot,
} from '../../../../adapters/network/NetworkMotionAdapter.js';
import { S06ConsequenceController } from './S06ConsequenceController.js';

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

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

describe('S06ConsequenceController', () => {
  it('enables replay and continue after completion, replays deterministically, and records one completion', async () => {
    const firstRun = createDeferredResult();
    const replayRun = createDeferredResult();
    const play = vi
      .fn<(sequence: AnimationSequence) => Promise<AnimationResult>>()
      .mockReturnValueOnce(firstRun.promise)
      .mockReturnValueOnce(replayRun.promise);
    const timingEvents: SegmentTimingEvent[] = [];
    let completions = 0;
    const animationPlayer: AnimationPlayerPort = {
      play,
      cancel: async () => undefined,
    };
    const controller = new S06ConsequenceController({
      fixtureId: 'similar',
      animationPlayer,
      timingPort: {
        record: async (event) => {
          timingEvents.push(event);
        },
      },
      onComplete: () => {
        completions += 1;
      },
    });

    controller.startComparison();
    expect(controller.getSnapshot().scene.phase).toBe('comparing');
    expect(controller.getSnapshot().controls).toEqual({
      canStart: false,
      canReplay: false,
      canContinue: false,
    });
    expect(play).toHaveBeenCalledTimes(1);

    firstRun.resolve({ status: 'finished' });
    await flushMicrotasks();

    const completedNetwork = controller.getSnapshot().scene.network;
    expect(controller.getSnapshot().scene.phase).toBe('complete');
    expect(controller.getSnapshot().controls).toEqual({
      canStart: false,
      canReplay: true,
      canContinue: true,
    });
    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S06', sectionId: 'passwords' },
    ]);

    controller.replayComparison();
    expect(controller.getSnapshot().controls).toEqual({
      canStart: false,
      canReplay: false,
      canContinue: false,
    });
    expect(play).toHaveBeenCalledTimes(2);

    replayRun.resolve({ status: 'finished' });
    await flushMicrotasks();

    expect(controller.getSnapshot().scene.network).toEqual(completedNetwork);
    expect(controller.getSnapshot().controls).toEqual({
      canStart: false,
      canReplay: true,
      canContinue: true,
    });
    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S06', sectionId: 'passwords' },
    ]);

    await controller.continue();
    await controller.continue();

    expect(completions).toBe(1);
    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S06', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S06', sectionId: 'passwords' },
    ]);
  });

  it('keeps every highlight emphasis in the presentation snapshot after reduced-motion playback', async () => {
    for (const emphasis of ['danger', 'warning', 'positive', 'info'] as const) {
      const presentations: NetworkPresentationSnapshot[] = [];
      const adapter = new NetworkMotionAdapter({
        initialNodeId: 'source',
        applySnapshot: (snapshot) => presentations.push(snapshot),
        getCharacterElement: () => null,
        getNodeElement: () => null,
        prefersReducedMotion: () => true,
      });
      const sequence: AnimationSequence = {
        id: `s06-${emphasis}`,
        steps: [{ type: 'highlight', targetId: 'target', emphasis, durationMs: 360 }],
        reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
        maxDurationMs: 360,
      };

      await expect(adapter.play(sequence)).resolves.toEqual({ status: 'finished' });
      expect(presentations.at(-1)).toMatchObject({
        highlightedNodeId: null,
        emphasis,
      });
    }
  });

  it('keeps analysis-dependent participant text and visual semantics out of the React component', async () => {
    const componentPath = fileURLToPath(new URL('./S06ConsequenceTraining.tsx', import.meta.url));
    const stylesPath = fileURLToPath(
      new URL('./S06ConsequenceTraining.module.css', import.meta.url),
    );
    const [source, styles] = await Promise.all([
      readFile(componentPath, 'utf8'),
      readFile(stylesPath, 'utf8'),
    ]);

    expect(source).not.toContain('snapshot.scene.phase');
    expect(source).not.toContain('analysis.');
    expect(source).not.toContain('Scene-Event');
    expect(source).not.toContain('Das Ergebnis ist als Fixture vorgegeben');
    expect(source).toContain('snapshot.participant.explanation');
    expect(source).toContain('snapshot.participant.semantic');
    for (const emphasis of ['danger', 'warning', 'positive', 'info']) {
      expect(styles).toContain(`[data-emphasis="${emphasis}"]`);
    }
    expect(styles).toContain('border-style: double');
    expect(styles).toContain('border-style: dashed');
    expect(styles).toContain('border-style: dotted');
  });
});

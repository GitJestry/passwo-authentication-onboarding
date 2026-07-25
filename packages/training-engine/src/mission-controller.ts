import { createActor, type SnapshotFrom } from 'xstate';
import type { AnimationPlayerPort } from './animation-types.js';
import {
  canContinueMission,
  getCurrentMissionStep,
  type MissionDefinition,
  missionMachine,
} from './mission-machine.js';

export interface SegmentTimingEvent {
  readonly eventType: 'segment-start' | 'segment-end';
  readonly segmentId: MissionDefinition['segmentId'];
  readonly sectionId: MissionDefinition['sectionId'];
}

export interface SegmentTimingPort {
  record(event: SegmentTimingEvent): Promise<void>;
  retry?(): Promise<void>;
  readonly blocksMissionTiming?: boolean;
}

export interface MissionControllerOptions {
  readonly animationPlayer: AnimationPlayerPort;
  readonly timingPort?: SegmentTimingPort;
  readonly onComplete: () => void;
}

export type MissionSnapshot = SnapshotFrom<typeof missionMachine>;

export class MissionController {
  readonly #actor = createActor(missionMachine);
  readonly #animationPlayer: AnimationPlayerPort;
  readonly #timingPort: SegmentTimingPort | undefined;
  readonly #onComplete: () => void;
  #mission: MissionDefinition | null = null;
  #disposed = false;
  #completionNotified = false;
  #timingStatus: 'not-started' | 'start-failed' | 'active' | 'end-failed' | 'ended' = 'not-started';

  constructor({ animationPlayer, timingPort, onComplete }: MissionControllerOptions) {
    this.#animationPlayer = animationPlayer;
    this.#timingPort = timingPort;
    this.#onComplete = onComplete;
    this.#actor.start();
  }

  getSnapshot(): MissionSnapshot {
    return this.#actor.getSnapshot();
  }

  subscribe(listener: (snapshot: MissionSnapshot) => void): () => void {
    const subscription = this.#actor.subscribe(listener);
    return () => subscription.unsubscribe();
  }

  async start(mission: MissionDefinition): Promise<void> {
    if (this.#mission !== null) {
      throw new Error('Mission controller has already started a mission.');
    }

    this.#mission = mission;
    if (!this.#blocksMissionTiming()) {
      this.#timingStatus = 'active';
      this.#startMission();
      void this.#recordTiming('segment-start').catch(() => undefined);
      return;
    }
    try {
      await this.#recordTiming('segment-start');
    } catch (error) {
      this.#timingStatus = 'start-failed';
      throw error;
    }
    this.#timingStatus = 'active';
    this.#startMission();
  }

  async retryTiming(): Promise<void> {
    if (this.#timingStatus === 'start-failed') {
      await this.#retryTimingWrite('segment-start');
      this.#timingStatus = 'active';
      this.#startMission();
      return;
    }
    if (this.#timingStatus === 'end-failed') {
      await this.#retryTimingWrite('segment-end');
      this.#timingStatus = 'ended';
      this.#notifyComplete();
      return;
    }
    throw new Error('No failed segment timing write to retry.');
  }

  #startMission(): void {
    const mission = this.#mission;
    if (mission === null || this.#disposed) return;
    this.#actor.send({ type: 'START', mission });
    void this.#playCurrentStep();
  }

  setSafetyAcknowledged(acknowledged: boolean): void {
    this.#actor.send({ type: 'SET_SAFETY_ACKNOWLEDGED', acknowledged });
  }

  replay(): void {
    if (!this.#actor.getSnapshot().matches({ active: 'awaitingDecision' })) return;
    this.#actor.send({ type: 'REPLAY' });
    void this.#playCurrentStep();
  }

  async continue(): Promise<void> {
    const snapshot = this.#actor.getSnapshot();
    if (!snapshot.matches({ active: 'awaitingDecision' })) return;
    if (!canContinueMission(snapshot.context)) return;

    this.#actor.send({ type: 'CONTINUE' });
    if (this.#actor.getSnapshot().status === 'done') {
      if (this.#completionNotified) return;
      if (!this.#blocksMissionTiming()) {
        this.#timingStatus = 'ended';
        void this.#recordTiming('segment-end').catch(() => undefined);
        this.#notifyComplete();
        return;
      }
      try {
        await this.#recordTiming('segment-end');
      } catch (error) {
        this.#timingStatus = 'end-failed';
        throw error;
      }
      this.#timingStatus = 'ended';
      this.#notifyComplete();
      return;
    }

    void this.#playCurrentStep();
  }

  async dispose(): Promise<void> {
    this.#disposed = true;
    await this.#animationPlayer.cancel();
    if (this.#actor.getSnapshot().status !== 'done') this.#actor.send({ type: 'CANCEL' });
    this.#actor.stop();
  }

  async #playCurrentStep(): Promise<void> {
    const snapshot = this.#actor.getSnapshot();
    if (!snapshot.matches({ active: 'animating' }) || this.#disposed) return;

    const step = getCurrentMissionStep(snapshot.context);
    if (step === null) return;

    try {
      const result = await this.#animationPlayer.play(step.animation);
      if (this.#disposed || result.status === 'cancelled') return;
      this.#actor.send(
        result.status === 'finished'
          ? { type: 'ANIMATION_FINISHED' }
          : { type: 'ANIMATION_FAILED', reasonCode: result.reasonCode ?? 'animation-failed' },
      );
    } catch {
      if (!this.#disposed) {
        this.#actor.send({ type: 'ANIMATION_FAILED', reasonCode: 'animation-player-threw' });
      }
    }
  }

  async #recordTiming(eventType: SegmentTimingEvent['eventType']): Promise<void> {
    const mission = this.#mission;
    if (mission === null || this.#timingPort === undefined) return;
    await this.#timingPort.record({
      eventType,
      segmentId: mission.segmentId,
      sectionId: mission.sectionId,
    });
  }

  async #retryTimingWrite(eventType: SegmentTimingEvent['eventType']): Promise<void> {
    if (this.#timingPort?.retry !== undefined) {
      await this.#timingPort.retry();
      return;
    }
    await this.#recordTiming(eventType);
  }

  #notifyComplete(): void {
    if (this.#completionNotified || this.#disposed) return;
    this.#completionNotified = true;
    this.#onComplete();
  }

  #blocksMissionTiming(): boolean {
    return this.#timingPort?.blocksMissionTiming === true;
  }
}

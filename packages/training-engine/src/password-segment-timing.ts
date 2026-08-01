import type { SegmentTimingEvent } from './mission-controller.js';
import type { PasswordModuleEvent } from './password-module-machine.js';

export type PasswordTimedSegmentId = 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06' | 'S07';

interface PasswordSegmentBoundaryDefinition {
  readonly recordedEvent: PasswordModuleEvent;
  readonly retryEvent: PasswordModuleEvent;
  readonly failedEvent: (errorCode: string) => PasswordModuleEvent;
}

interface PasswordSegmentTimingDefinition {
  readonly scope: Pick<SegmentTimingEvent, 'segmentId' | 'sectionId'>;
  readonly nextSegmentId: PasswordTimedSegmentId | null;
  readonly boundaries: Readonly<
    Record<SegmentTimingEvent['eventType'], PasswordSegmentBoundaryDefinition>
  >;
}

export const passwordSegmentTimingPlan = {
  S01: {
    scope: { segmentId: 'S01', sectionId: 'passwords' },
    nextSegmentId: 'S02',
    boundaries: {
      'segment-start': {
        recordedEvent: { type: 'S01_START_RECORDED' },
        retryEvent: { type: 'RETRY_S01_START' },
        failedEvent: (errorCode) => ({ type: 'S01_START_FAILED', errorCode }),
      },
      'segment-end': {
        recordedEvent: { type: 'S01_END_RECORDED' },
        retryEvent: { type: 'RETRY_S01_END' },
        failedEvent: (errorCode) => ({ type: 'S01_END_FAILED', errorCode }),
      },
    },
  },
  S02: {
    scope: { segmentId: 'S02', sectionId: 'passwords' },
    nextSegmentId: 'S03',
    boundaries: {
      'segment-start': {
        recordedEvent: { type: 'S02_START_RECORDED' },
        retryEvent: { type: 'RETRY_S02_START' },
        failedEvent: (errorCode) => ({ type: 'S02_START_FAILED', errorCode }),
      },
      'segment-end': {
        recordedEvent: { type: 'S02_END_RECORDED' },
        retryEvent: { type: 'RETRY_S02_END' },
        failedEvent: (errorCode) => ({ type: 'S02_END_FAILED', errorCode }),
      },
    },
  },
  S03: {
    scope: { segmentId: 'S03', sectionId: 'passwords' },
    nextSegmentId: 'S04',
    boundaries: {
      'segment-start': {
        recordedEvent: { type: 'S03_START_RECORDED' },
        retryEvent: { type: 'RETRY_S03_START' },
        failedEvent: (errorCode) => ({ type: 'S03_START_FAILED', errorCode }),
      },
      'segment-end': {
        recordedEvent: { type: 'S03_END_RECORDED' },
        retryEvent: { type: 'RETRY_S03_END' },
        failedEvent: (errorCode) => ({ type: 'S03_END_FAILED', errorCode }),
      },
    },
  },
  S04: {
    scope: { segmentId: 'S04', sectionId: 'passwords' },
    nextSegmentId: 'S05',
    boundaries: {
      'segment-start': {
        recordedEvent: { type: 'S04_START_RECORDED' },
        retryEvent: { type: 'RETRY_S04_START' },
        failedEvent: (errorCode) => ({ type: 'S04_START_FAILED', errorCode }),
      },
      'segment-end': {
        recordedEvent: { type: 'S04_END_RECORDED' },
        retryEvent: { type: 'RETRY_S04_END' },
        failedEvent: (errorCode) => ({ type: 'S04_END_FAILED', errorCode }),
      },
    },
  },
  S05: {
    scope: { segmentId: 'S05', sectionId: 'passwords' },
    nextSegmentId: 'S06',
    boundaries: {
      'segment-start': {
        recordedEvent: { type: 'S05_START_RECORDED' },
        retryEvent: { type: 'RETRY_S05_START' },
        failedEvent: (errorCode) => ({ type: 'S05_START_FAILED', errorCode }),
      },
      'segment-end': {
        recordedEvent: { type: 'S05_END_RECORDED' },
        retryEvent: { type: 'RETRY_S05_END' },
        failedEvent: (errorCode) => ({ type: 'S05_END_FAILED', errorCode }),
      },
    },
  },
  S06: {
    scope: { segmentId: 'S06', sectionId: 'passwords' },
    nextSegmentId: 'S07',
    boundaries: {
      'segment-start': {
        recordedEvent: { type: 'S06_START_RECORDED' },
        retryEvent: { type: 'RETRY_S06_START' },
        failedEvent: (errorCode) => ({ type: 'S06_START_FAILED', errorCode }),
      },
      'segment-end': {
        recordedEvent: { type: 'S06_END_RECORDED' },
        retryEvent: { type: 'RETRY_S06_END' },
        failedEvent: (errorCode) => ({ type: 'S06_END_FAILED', errorCode }),
      },
    },
  },
  S07: {
    scope: { segmentId: 'S07', sectionId: 'passwords' },
    nextSegmentId: null,
    boundaries: {
      'segment-start': {
        recordedEvent: { type: 'S07_START_RECORDED' },
        retryEvent: { type: 'RETRY_S07_START' },
        failedEvent: (errorCode) => ({ type: 'S07_START_FAILED', errorCode }),
      },
      'segment-end': {
        recordedEvent: { type: 'S07_END_RECORDED' },
        retryEvent: { type: 'RETRY_S07_END' },
        failedEvent: (errorCode) => ({ type: 'S07_END_FAILED', errorCode }),
      },
    },
  },
} as const satisfies Readonly<Record<PasswordTimedSegmentId, PasswordSegmentTimingDefinition>>;

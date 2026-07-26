import { s01Content } from '@passwo/training-content';
import {
  PasswordModuleController,
  type PasswordModuleSnapshot,
  type SegmentTimingPort,
} from '@passwo/training-engine';
import { useEffect, useRef, useState } from 'react';
import { S00Training } from './S00Training.js';
import { S01Training } from './S01Training.js';
import {
  S02AccountExplorationTraining,
  type S02TimingState,
} from './segments/S02/S02AccountExplorationTraining.js';

export interface PasswordModuleTrainingProps {
  readonly displayName: string;
  readonly onComplete: () => void;
  readonly timingPort?: SegmentTimingPort;
  readonly externalTimingError?: string | null;
  readonly onRetryExternalTiming?: () => void;
}

export function PasswordModuleTraining({
  displayName,
  onComplete,
  timingPort,
  externalTimingError = null,
  onRetryExternalTiming,
}: PasswordModuleTrainingProps) {
  const [snapshot, setSnapshot] = useState<PasswordModuleSnapshot | null>(null);
  const controllerRef = useRef<PasswordModuleController | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const controller = new PasswordModuleController({
      accountIds: s01Content.browser.accounts.map(({ id }) => id),
      ...(timingPort === undefined ? {} : { timingPort }),
      onComplete: () => onCompleteRef.current(),
    });
    const unsubscribe = controller.subscribe(setSnapshot);
    controllerRef.current = controller;
    setSnapshot(controller.getSnapshot());

    return () => {
      unsubscribe();
      controller.dispose();
      controllerRef.current = null;
    };
  }, [timingPort]);

  if (snapshot === null || snapshot.matches('s00')) {
    return (
      <S00Training
        displayName={displayName}
        onComplete={() => controllerRef.current?.completeS00()}
        {...(timingPort === undefined ? {} : { timingPort })}
        externalTimingError={externalTimingError}
        {...(onRetryExternalTiming === undefined ? {} : { onRetryExternalTiming })}
      />
    );
  }

  if (snapshot.matches('complete') || snapshot.matches('discarded')) return null;

  const controller = controllerRef.current;
  if (controller === null) return null;

  if (snapshot.matches('s01')) {
    return (
      <S01Training
        controller={controller}
        snapshot={snapshot}
        externalTimingError={externalTimingError}
        {...(onRetryExternalTiming === undefined ? {} : { onRetryExternalTiming })}
      />
    );
  }

  const timingState: S02TimingState = snapshot.matches({ s02: 'starting' })
    ? 'starting'
    : snapshot.matches({ s02: 'startFailed' })
      ? 'startFailed'
      : snapshot.matches({ s02: 'ending' })
        ? 'ending'
        : snapshot.matches({ s02: 'endFailed' })
          ? 'endFailed'
          : 'active';
  return (
    <S02AccountExplorationTraining
      timingState={timingState}
      timingErrorCode={snapshot.context.timingErrorCode}
      externalTimingError={externalTimingError}
      onAllAccountsUnderstood={() => controller.completeS02Content()}
      onContinue={() => controller.continue()}
      onRetryTiming={() => {
        if (externalTimingError !== null) {
          onRetryExternalTiming?.();
        } else {
          controller.retryTiming();
        }
      }}
    />
  );
}

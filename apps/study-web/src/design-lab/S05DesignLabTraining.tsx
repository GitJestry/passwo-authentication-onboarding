import { getS05DesignLabFixture, type S05DesignLabFixtureId } from '@passwo/training-content';
import { useMemo } from 'react';
import type { DesktopPlatform } from '@passwo/ui';
import {
  S05AnalysisTraining,
  type S05AnalysisTrainingProps,
} from '../features/training/segments/S05/S05AnalysisTraining.js';

export function S05DesignLabTraining({
  fixtureId,
  initialSection,
  passwordOverride,
  platform = 'mac',
  onComplete,
}: {
  readonly fixtureId: S05DesignLabFixtureId;
  readonly initialSection?: S05AnalysisTrainingProps['initialSection'];
  readonly passwordOverride?: string;
  readonly platform?: DesktopPlatform;
  readonly onComplete?: () => void;
}) {
  const fixture = getS05DesignLabFixture(fixtureId);
  const subject = useMemo(
    () =>
      passwordOverride === undefined ? fixture : { ...fixture, fictionalPassword: passwordOverride },
    [fixture, passwordOverride],
  );
  const completionPort = useMemo(
    () => (onComplete === undefined ? undefined : { complete: onComplete }),
    [onComplete],
  );
  return (
    <S05AnalysisTraining
      subject={subject}
      initialSection={initialSection ?? fixture.startSection}
      platform={platform}
      {...(completionPort === undefined ? {} : { completionPort })}
    />
  );
}

import { getS05DesignLabFixture, type S05DesignLabFixtureId } from '@passwo/training-content';
import { useMemo } from 'react';
import {
  S05AnalysisTraining,
  type S05AnalysisTrainingProps,
} from '../features/training/segments/S05/S05AnalysisTraining.js';

export function S05DesignLabTraining({
  fixtureId,
  initialSection,
  passwordOverride,
}: {
  readonly fixtureId: S05DesignLabFixtureId;
  readonly initialSection?: S05AnalysisTrainingProps['initialSection'];
  readonly passwordOverride?: string;
}) {
  const fixture = getS05DesignLabFixture(fixtureId);
  const subject = useMemo(
    () =>
      passwordOverride === undefined ? fixture : { ...fixture, fictionalPassword: passwordOverride },
    [fixture, passwordOverride],
  );
  return (
    <S05AnalysisTraining
      subject={subject}
      initialSection={initialSection ?? fixture.startSection}
    />
  );
}

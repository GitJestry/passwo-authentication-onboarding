import { getS05DesignLabFixture, type S05DesignLabFixtureId } from '@passwo/training-content';
import {
  S05AnalysisTraining,
  type S05AnalysisTrainingProps,
} from '../features/training/segments/S05/S05AnalysisTraining.js';

export function S05DesignLabTraining({
  fixtureId,
  initialSection,
}: {
  readonly fixtureId: S05DesignLabFixtureId;
  readonly initialSection?: S05AnalysisTrainingProps['initialSection'];
}) {
  const fixture = getS05DesignLabFixture(fixtureId);
  return (
    <S05AnalysisTraining
      subject={fixture}
      initialSection={initialSection ?? fixture.startSection}
    />
  );
}

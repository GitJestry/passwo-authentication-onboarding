import { getS05DesignLabFixture, type S05DesignLabFixtureId } from '@passwo/training-content';
import { S05AnalysisTraining } from '../features/training/segments/S05/S05AnalysisTraining.js';

export function S05DesignLabTraining({ fixtureId }: { readonly fixtureId: S05DesignLabFixtureId }) {
  return <S05AnalysisTraining subject={getS05DesignLabFixture(fixtureId)} />;
}

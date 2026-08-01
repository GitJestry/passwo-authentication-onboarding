import { getS06PreparedS07EvaluationFixtureByRouteId } from '@passwo/training-content';
import { S07EvaluationTraining } from '../features/training/segments/S07/S07EvaluationTraining.js';

export function S07DesignLabTraining({ routeId }: { readonly routeId: string }) {
  const fixture = getS06PreparedS07EvaluationFixtureByRouteId(routeId);
  return fixture === undefined ? null : <S07EvaluationTraining input={fixture.resolvedResult} />;
}

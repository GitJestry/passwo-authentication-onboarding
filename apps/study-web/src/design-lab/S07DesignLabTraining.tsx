import { getS07EvaluationFixtureByRouteId } from '@passwo/training-content';
import { useMemo } from 'react';
import { createS06ConsequenceScenePlan } from '../features/training/segments/S06/S06ConsequenceController.js';
import { S07EvaluationTraining } from '../features/training/segments/S07/S07EvaluationTraining.js';

export function S07DesignLabTraining({ routeId }: { readonly routeId: string }) {
  const fixture = getS07EvaluationFixtureByRouteId(routeId);
  const input = useMemo(() => {
    if (fixture === undefined) return null;
    const plan = createS06ConsequenceScenePlan(`design-lab-${fixture.routeId}`, fixture.accounts);
    return {
      incidentSource: plan.incidentSource,
      accounts: plan.accounts,
      comparisons: plan.comparisons,
    };
  }, [fixture]);
  return input === null ? null : <S07EvaluationTraining input={input} />;
}

import {
  FOLLOW_UP_PATH,
  designLabScenarioForPath,
  isDesignLabPath,
  isLiveQaPath,
  liveQaRouteForPath,
} from '@passwo/contracts';
import { lazy, Suspense } from 'react';

const DesignLab = lazy(async () => {
  const module = await import('../design-lab/DesignLab.js');
  return { default: module.DesignLab };
});
const StudyFlow = lazy(async () => {
  const module = await import('../features/study/StudyFlow.js');
  return { default: module.StudyFlow };
});
const LiveQa = lazy(async () => {
  const module = await import('../live-qa/LiveQa.js');
  return { default: module.LiveQa };
});
const FollowUpFlow = lazy(async () => {
  const module = await import('../features/follow-up/FollowUpFlow.js');
  return { default: module.FollowUpFlow };
});

function RouteLoadingBoundary() {
  return (
    <main aria-busy="true">
      <p role="status">Studienstand wird geladen …</p>
    </main>
  );
}

export function App({
  initialFollowUpToken = null,
  initialLiveQaFollowUpToken = null,
}: {
  readonly initialFollowUpToken?: string | null;
  readonly initialLiveQaFollowUpToken?: string | null;
}) {
  const { pathname } = window.location;
  if (pathname === FOLLOW_UP_PATH) {
    return (
      <Suspense fallback={<RouteLoadingBoundary />}>
        <FollowUpFlow initialToken={initialFollowUpToken} />
      </Suspense>
    );
  }
  const liveQaRoute = liveQaRouteForPath(pathname);
  if (liveQaRoute !== null) {
    return (
      <Suspense fallback={<RouteLoadingBoundary />}>
        <LiveQa route={liveQaRoute} initialFollowUpToken={initialLiveQaFollowUpToken} />
      </Suspense>
    );
  }
  if (isLiveQaPath(pathname)) {
    return (
      <main>
        <h1>Live-QA-Pfad nicht gefunden</h1>
      </main>
    );
  }

  const designLabScenarioId = designLabScenarioForPath(pathname);
  if (designLabScenarioId !== null) {
    return (
      <Suspense fallback={<RouteLoadingBoundary />}>
        <DesignLab scenarioId={designLabScenarioId} />
      </Suspense>
    );
  }
  if (isDesignLabPath(pathname)) {
    return (
      <main>
        <h1>Design-Lab-Pfad nicht gefunden</h1>
      </main>
    );
  }

  return (
    <Suspense fallback={<RouteLoadingBoundary />}>
      <StudyFlow />
    </Suspense>
  );
}

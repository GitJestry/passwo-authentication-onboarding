import {
  designLabScenarioForPath,
  isDesignLabPath,
  isLiveQaPath,
  liveQaRouteForPath,
} from '@passwo/contracts';
import { DesignLab } from '../design-lab/DesignLab.js';
import { StudyFlow } from '../features/study/StudyFlow.js';
import { LiveQa } from '../live-qa/LiveQa.js';

export function App() {
  const { pathname } = window.location;
  const liveQaRoute = liveQaRouteForPath(pathname);
  if (liveQaRoute !== null) return <LiveQa route={liveQaRoute} />;
  if (isLiveQaPath(pathname)) {
    return (
      <main>
        <h1>Live-QA-Pfad nicht gefunden</h1>
      </main>
    );
  }

  const designLabScenarioId = designLabScenarioForPath(pathname);
  if (designLabScenarioId !== null) {
    return <DesignLab scenarioId={designLabScenarioId} />;
  }
  if (isDesignLabPath(pathname)) {
    return (
      <main>
        <h1>Design-Lab-Pfad nicht gefunden</h1>
      </main>
    );
  }

  return <StudyFlow />;
}

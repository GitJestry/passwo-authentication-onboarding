import { designLabScenarioForPath, isDesignLabPath } from '@passwo/contracts';
import { DesignLab } from '../design-lab/DesignLab.js';
import { StudyFlow } from '../features/study/StudyFlow.js';

export function App() {
  const { pathname } = window.location;
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

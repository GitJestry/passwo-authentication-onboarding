import { DesignLab } from '../design-lab/DesignLab.js';
import { StudyFlow } from '../features/study/StudyFlow.js';

export function App() {
  const { pathname } = window.location;
  if (pathname === '/design-lab' || pathname.startsWith('/design-lab/')) {
    return <DesignLab pathname={pathname} />;
  }

  return <StudyFlow />;
}

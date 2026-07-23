import { describe, expect, it } from 'vitest';
import type { NetworkSceneSnapshot } from './scene.js';

describe('framework-free network scene', () => {
  it('expresses blocked paths with status and an accessible label', () => {
    const snapshot: NetworkSceneSnapshot = {
      id: 'blocked-example',
      accessibleSummary: 'Der dargestellte Angriffsweg zu CampusMail ist blockiert.',
      nodes: [],
      edges: [
        {
          id: 'campus-board-to-mail',
          sourceId: 'campus-board',
          targetId: 'campus-mail',
          kind: 'blocked-path',
          status: 'blocked',
          label: 'Dieser Angriffsweg ist blockiert',
        },
      ],
    };

    expect(snapshot.edges[0]?.status).toBe('blocked');
    expect(snapshot.edges[0]?.label).toContain('Angriffsweg');
  });
});

import type { TransientPasswordSemanticEvidence } from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import { createS06ConsequenceScenePlan } from './S06ConsequenceController.js';

const masterCampusSemanticEvidence: TransientPasswordSemanticEvidence = {
  kind: 'transient-password-semantic-evidence',
  confirmed: true,
  relations: [
    {
      id: 'semantic:content:master-campus',
      kind: 'shared-content',
      evidence: [
        { type: 'span', start: 0, end: 6, token: 'Kaffee' },
        { type: 'span', start: 6, end: 12, token: 'Morgen' },
      ],
    },
  ],
};

describe('S06 consequence semantic annotations', () => {
  it('keeps transient semantic evidence explanatory on a non-Campusgram account', () => {
    const plan = createS06ConsequenceScenePlan('semantic-evidence-fixture', {
      campusgram: {
        fictionalPassword: 'qzmpvxtrldbnhcf',
        retrievalStatus: 'retrievable',
      },
      'master-campus': {
        fictionalPassword: 'KaffeeMorgen',
        retrievalStatus: 'assisted',
        semanticEvidence: masterCampusSemanticEvidence,
      },
      'campus-email': {
        fictionalPassword: 'vkmqztrplxndhbf',
        retrievalStatus: 'not-remembered',
      },
    });

    const masterCampusDisposition = plan.accounts.find(
      ({ accountId }) => accountId === 'master-campus',
    )?.disposition;
    expect(masterCampusDisposition).toMatchObject({
      kind: 'whole-password-recognized',
      ruleId: 'whole-password-recognized-generated-candidate',
    });
    expect(masterCampusDisposition).not.toHaveProperty('semanticRelationIds');
    expect(plan.accounts.find(({ accountId }) => accountId === 'campusgram')?.disposition.kind).toBe(
      'no-whole-password-recognized',
    );
    expect(plan.accounts.find(({ accountId }) => accountId === 'campus-email')?.disposition.kind).toBe(
      'no-whole-password-recognized',
    );
  });
});

import { describe, expect, it } from 'vitest';
import { S00_CONTENT_VERSION, s00Content } from './s00.js';
import { S01_CONTENT_VERSION, s01Content } from './s01.js';
import { S02_CONTENT_VERSION, s02Content } from './s02.js';

const canonicalAccountIds = ['master-campus', 'campus-email', 'campusgram'] as const;

describe('S00 to S02 training-content traceability', () => {
  it('keeps S00 linked to its named source page and canonical accounts', () => {
    expect(S00_CONTENT_VERSION).toBe('1.15.0');
    expect(s00Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPage: 2,
    });
    expect(s00Content.segment.id).toBe('S00');
    expect(s00Content.browser.tabs.map(({ id }) => id)).toEqual(canonicalAccountIds);
  });

  it('keeps S01 linked to its named source page and canonical account order', () => {
    expect(S01_CONTENT_VERSION).toBe('2.14.0');
    expect(s01Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPage: 3,
    });
    expect(s01Content.segment.id).toBe('S01');
    expect(s01Content.browser.accounts.map(({ id }) => id)).toEqual(canonicalAccountIds);
  });

  it('keeps S02 linked to its named pages and essential account-node structure', () => {
    expect(S02_CONTENT_VERSION).toBe('3.11.0');
    expect(s02Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [4, 5, 6, 7],
    });
    expect(s02Content.segment.id).toBe('S02');
    expect(s02Content.scene.accounts.map(({ id }) => id)).toEqual(canonicalAccountIds);
    expect(s02Content.scene.accounts.map(({ details }) => details.map(({ id }) => id))).toEqual([
      [
        'master-campus-workspace',
        'master-campus-services',
        'master-campus-campus-cloud',
      ],
      [
        'campus-email-notifications',
        'campus-email-confirmations',
        'campus-email-reset-links',
        'campus-email-impersonation',
      ],
      [
        'campusgram-direct-messages',
        'campusgram-groups-contacts',
        'campusgram-posts-reactions',
      ],
    ]);
  });
});

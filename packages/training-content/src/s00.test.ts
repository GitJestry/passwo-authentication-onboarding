import { describe, expect, it } from 'vitest';
import { formatS00Greeting, S00_CONTENT_VERSION, s00Content } from './s00.js';

describe('S00 content', () => {
  it('traces the versioned participant content to the named script page', () => {
    expect(s00Content.version).toBe(S00_CONTENT_VERSION);
    expect(s00Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPage: 2,
    });
    expect(s00Content.segment).toEqual({ id: 'S00', sectionId: 'passwords' });
  });

  it('contains the required safety boundary and a single authored visual reveal', () => {
    expect(s00Content.safety.acknowledgement).toBe('Ich verwende nur ausgedachte Passwörter.');
    expect(s00Content.mission.steps).toHaveLength(1);
    expect(
      s00Content.mission.steps[0]?.animation.steps.filter((step) => step.type === 'reveal'),
    ).toEqual([{ type: 'reveal', targetId: 's00-safety-boundary', durationMs: 240 }]);
  });

  it('uses the display name only to format the transient greeting', () => {
    expect(formatS00Greeting('Mara')).toContain('Hallo Mara');
  });
});

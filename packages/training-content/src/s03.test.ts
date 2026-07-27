import { describe, expect, it } from 'vitest';
import { getS03Animation, S03_CONTENT_VERSION, s03Content } from './s03.js';

describe('complete S03 content', () => {
  it('traces its version to precisely the four named script pages', () => {
    expect(s03Content.version).toBe(S03_CONTENT_VERSION);
    expect(s03Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [8, 9, 10, 11],
    });
    expect(s03Content.segment).toEqual({ id: 'S03', sectionId: 'passwords' });
  });

  it('authors the three login outcomes and the CampusBoard warning without S04 content', () => {
    expect(s03Content.controls.skip).toBe('Ich weiß es nicht mehr — weiter');
    expect(s03Content.statuses).toEqual({
      retrievable: 'abrufbar',
      notRemembered: 'nicht erinnert',
    });
    expect(s03Content.narration.accountSuccess['campus-id']).toBe('CampusID ist wieder geöffnet.');
    expect(s03Content.narration.accountSkipped['campus-board-archive']).toContain(
      'spätere Passwortauswertung',
    );
    expect(s03Content.narration.warning).toBe(
      'STOP - bei campusboard bgibt es eine sicherheitsmeldung. Kannst du es dir bitte ansehen?',
    );
  });

  it('keeps the ten-second CampusBoard warning sequence behind the animation port', () => {
    const completion = getS03Animation('s03-completion-timeskip');
    expect(completion?.steps).toContainEqual({ type: 'pause', durationMs: 10_000 });
    expect(completion?.reducedMotion).toEqual({
      strategy: 'instant-end-state',
      maxDurationMs: 0,
    });
    expect(completion?.steps.at(-1)).toEqual({
      type: 'announce',
      messageId: 's03.campus-board.warning',
    });
  });
});

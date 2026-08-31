import { describe, expect, it } from 'vitest';
import { S03_CONTENT_VERSION, s03Content } from './s03.js';

describe('S03 content traceability', () => {
  it('keeps S03 linked to its current copy audit and canonical account structure', () => {
    expect(S03_CONTENT_VERSION).toBe('1.19.4');
    expect(s03Content.source).toMatchObject({
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s03-optionale-anmeldehilfe-13-august-2026',
    });
    expect(s03Content.segment.id).toBe('S03');
    expect(Object.keys(s03Content.accountPages)).toEqual([
      'master-campus',
      'campus-email',
      'campusgram',
    ]);
    expect(s03Content.animations.slice(0, 3).map(({ id }) => id)).toEqual([
      's03-result-master-campus',
      's03-result-campus-email',
      's03-result-campusgram',
    ]);
    expect(s03Content.narration.warning).toBe(
      'Bei Campusgram ist eine Sicherheitsmeldung erschienen. Schau bitte nach.',
    );
    expect(s03Content.narration.thirdFailedLogin).toBe(
      'Wenn du das Passwort nicht mehr sicher weißt, kannst du unten „Passwort vergessen?“ nutzen.',
    );
    expect(s03Content.narration.retrievalHelp).toBe(
      'Kein Problem. Ein starkes Passwort sollte sich für dieses Konto auch später wieder abrufen lassen. Ich unterstütze dich jetzt bei der Anmeldung.',
    );
    expect(s03Content.controls.incorrectPassword).toBe('Dieses Passwort passt nicht zum Konto.');
    expect(s03Content.narration.completion).toBe(
      'Alle drei Konten sind wieder geöffnet. Wir können unseren Campusalltag jetzt fortsetzen.',
    );
    expect(s03Content.controls.passwordTooLong).toBe('max. 128 Zeichen');
    expect(s03Content.animations.at(-1)?.id).toBe('s03-completion-timeskip');
    expect(s03Content.animations.at(-1)?.maxDurationMs).toBe(4_000);
  });
});

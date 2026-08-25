import { describe, expect, it } from 'vitest';
import { s12PasswordManagerContent } from './s12.js';

describe('S12 password-manager content traceability', () => {
  it('keeps the authored function sequence and bounded theoretical model together', () => {
    expect(s12PasswordManagerContent.segment).toMatchObject({
      id: 'S12',
      sectionId: 'password-manager',
    });
    expect(s12PasswordManagerContent.flow.map(({ label }) => label)).toEqual([
      'Erzeugen',
      'Speichern',
      'Ausfüllen',
    ]);
    expect(s12PasswordManagerContent.generator).toMatchObject({
      passwordLength: 16,
      alphabetSize: '72 mögliche Zeichen',
      attemptsPerSecond: '1 Billion Versuche pro Sekunde',
      duration: '1,2-mal das Alter des Universums',
    });
  });

  it('keeps the two variants concise and the browser exercise transition explicit', () => {
    expect(s12PasswordManagerContent.variants.integrated.bullets).toEqual([
      'bereits im Browser oder Gerät vorhanden',
      'teilweise zusätzlich mit Masterpasswort',
    ]);
    expect(s12PasswordManagerContent.variants.separate.bullets).toContain(
      'Tresor meist mit einem Masterpasswort geschützt',
    );
    expect(s12PasswordManagerContent.guide.steps.practice).toEqual([
      'Für die Übung nutzen wir den Passwortmanager direkt im Browser.',
      'Probier den Ablauf jetzt selbst aus indem du mit dem Password Manager bei My Shop ein neues Konto anlegst.',
    ]);
  });
});

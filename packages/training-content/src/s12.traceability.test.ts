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
      passwordLengthLabel: '16 Stellen',
      alphabetLabel: 'alle Zeichentypen',
      alphabetSize: 72,
      attemptsPerSecond: '1 Billion',
      duration: '16,5 Milliarden Jahre',
    });
  });

  it('keeps the two variants concise and the browser exercise transition explicit', () => {
    expect(s12PasswordManagerContent.variants.integrated.title).toBe(
      'Integrierter Passwortmanager',
    );
    expect(s12PasswordManagerContent.variants.integrated.bullets).toEqual([
      'bereits vorhanden',
      'an Browser, Gerät oder Plattform gekoppelt',
      'Zugang meist über Gerät/Plattform',
    ]);
    expect(s12PasswordManagerContent.variants.separate.title).toBe(
      'Eigenständiger Passwortmanager',
    );
    expect(s12PasswordManagerContent.variants.separate.bullets).toEqual([
      'separat eingerichtet',
      'derselbe Tresor über verschiedene Browser und Systeme nutzbar',
      'meist mit Masterpasswort geschützt',
    ]);
    expect(s12PasswordManagerContent.guide.steps.practice).toEqual([
      'Für die Übung nutzen wir den Passwortmanager direkt im Browser.',
      'Probier den Ablauf jetzt selbst aus, indem du mit dem Passwortmanager im Browser ein neues Konto anlegst.',
    ]);
  });
});

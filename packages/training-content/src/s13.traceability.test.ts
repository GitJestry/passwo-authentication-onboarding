import { describe, expect, it } from 'vitest';
import { s13PasswordManagerPracticeContent } from './s13.js';

describe('S13 integrated password-manager practice traceability', () => {
  it('keeps the authored browser exercise and function sequence together', () => {
    expect(s13PasswordManagerPracticeContent.segment).toMatchObject({
      id: 'S13',
      sectionId: 'password-manager',
    });
    expect(s13PasswordManagerPracticeContent.browser.tabLabel).toBe('My Shop');
    expect(s13PasswordManagerPracticeContent.flow.map(({ label }) => label)).toEqual([
      'Erzeugen',
      'Speichern',
      'Ausfüllen',
    ]);
  });

  it('keeps the generated-password, save and autofill actions explicit', () => {
    expect(s13PasswordManagerPracticeContent.passwordManager).toMatchObject({
      suggestAction: 'Starkes Passwort vorschlagen',
      saveTitle: 'Passwort für My Shop speichern?',
      saveAction: 'Speichern',
      dismissSaveAction: 'Nicht jetzt',
      savedStatus: 'Passwort gespeichert',
    });
    expect(s13PasswordManagerPracticeContent.guide).toMatchObject({
      saved: 'Der Eintrag ist im Tresor gespeichert. Melde dich noch einmal an.',
      complete:
        'Geschafft! Schließe den Browser und schau, was sich im Netzwerk verändert hat.',
      saveDeclined: {
        first: 'Das Passwort ist damit noch nicht im Passwortmanager gespeichert.',
        second:
          'Dann kann er es beim nächsten Anmelden auch nicht wieder für dich einsetzen. Öffne den Speicherhinweis noch einmal und speichere den Eintrag.',
      },
    });
    expect(s13PasswordManagerPracticeContent.website).toMatchObject({
      emailPlaceholder: 'E-Mail-Adresse',
      passwordPlaceholder: 'Ihr Passwort',
      autofilledStatusLabel: 'automatisch ausgefüllt',
    });
    expect(
      s13PasswordManagerPracticeContent.passwordManager.autofillAccounts.map(({ label }) => label),
    ).toEqual(['My Shop', 'Campusgram', 'Master Campus', 'Campus E-Mail']);
    expect(s13PasswordManagerPracticeContent.passwordManager.generatedPassword).toHaveLength(16);
    expect(s13PasswordManagerPracticeContent.passwordManager.generatedPassword).toMatch(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{16}$/,
    );
  });

  it('keeps the rebuilt My Shop landing-page copy in versioned content', () => {
    expect(s13PasswordManagerPracticeContent.version).toBe('1.4.0');
    expect(s13PasswordManagerPracticeContent.website.shop.hero).toMatchObject({
      eyebrow: 'Sommer-Sale',
      title: 'Bis zu 40% sparen!',
    });
    expect(s13PasswordManagerPracticeContent.website.shop.popularCategories).toHaveLength(6);
    expect(s13PasswordManagerPracticeContent.website.shop.recommendedProducts).toHaveLength(6);
  });
});

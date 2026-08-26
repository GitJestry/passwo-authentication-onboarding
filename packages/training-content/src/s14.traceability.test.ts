import { describe, expect, it } from 'vitest';
import { s14MfaContent } from './s14.js';

describe('S14 MFA introduction traceability', () => {
  it('keeps MFA, 2FA and the three factor categories together', () => {
    expect(s14MfaContent.version).toBe('1.7.0');
    expect(s14MfaContent.segment).toMatchObject({
      id: 'S14',
      sectionId: 'mfa',
      slice: 'mfa-and-second-factor',
    });
    expect(s14MfaContent.concepts).toEqual({
      mfa: {
        title: 'Multi-Faktor-Authentifizierung',
        abbreviation: 'MFA',
      },
      twoFactor: {
        title: 'Zwei-Faktor-Authentifizierung',
        abbreviation: '2FA',
      },
    });
    expect(s14MfaContent.factors.map(({ title }) => title)).toEqual([
      'Wissen',
      'Besitz',
      'Biometrie',
    ]);
    expect(
      s14MfaContent.factors.reduce(
        (itemCount, factor) => itemCount + factor.items.length,
        0,
      ),
    ).toBe(6);
  });

  it('keeps the authored MFA explanation sequence explicit', () => {
    expect(s14MfaContent.guide.mfa).toBe(
      'Bei der Multi-Faktor-Authentifizierung (MFA) werden für die Anmeldung mehrere unterschiedliche Faktoren kombiniert.',
    );
    expect(s14MfaContent.guide.twoFactor).toBe(
      'Eine besonders häufige Form ist die Zwei-Faktor-Authentifizierung (2FA). Dabei werden genau zwei unterschiedliche Faktoren kombiniert.',
    );
    expect(s14MfaContent.guide.factors).toEqual({
      knowledge:
        'Der erste Faktor ist Wissen, zum Beispiel dein Passwort, eine PIN oder die Antwort auf eine Sicherheitsfrage.',
      possession:
        'Der zweite Faktor ist Besitz, zum Beispiel eine Authenticator-App auf deinem Handy oder ein Sicherheitsschlüssel.',
      biometrics:
        'Der dritte Faktor ist Biometrie, zum Beispiel Gesichtserkennung oder ein Fingerabdruck.',
    });
    expect(s14MfaContent.combinations).toEqual([
      {
        id: 'password-authenticator-app',
        label: 'Passwort + Authenticator-App',
        valid: true,
      },
      {
        id: 'password-security-key',
        label: 'Passwort + Sicherheitsschlüssel',
        valid: true,
      },
      {
        id: 'password-password',
        label: 'Passwort + Passwort',
        valid: false,
      },
    ]);
    expect(s14MfaContent.guide.distinct).toBe(
      'Entscheidend ist, dass die beiden Faktoren unterschiedlich sind.',
    );
  });

  it('continues from the locked search tab through local help', () => {
    expect(s14MfaContent.browser).toMatchObject({
      masterCampusTab: {
        id: 'master-campus',
        label: 'Master Campus',
      },
      searchTab: {
        id: 'mfa-search',
        label: 'Neuer Tab',
        queryLabel: 'Master Campus 2FA aktivieren',
        helpLabel: 'Master Campus Hilfe',
        homeAddress: 'search.example',
      },
      searchPage: {
        brand: 'Search',
        query: 'Master Campus 2FA aktivieren',
        primaryResultId: 'master-campus-help',
      },
      helpPage: {
        locationPath: [
          'Einstellungen',
          'Sicherheit',
          'Zwei-Faktor-Authentifizierung',
        ],
        requirementsAnswer: 'Eine Authenticator-App auf deinem Smartphone.',
      },
    });
    expect(s14MfaContent.browser.helpPage.requirementsAnswer).not.toContain(
      'Google Authenticator',
    );
    expect(s14MfaContent.browser.helpPage.requirementsAnswer).not.toContain(
      'Microsoft Authenticator',
    );
    expect(s14MfaContent.guide.findAvailability).toContain(
      'Master Campus Zwei-Faktor-Authentifizierung',
    );
    expect(s14MfaContent.browser.helpPage).not.toHaveProperty('introduction');
  });

  it('keeps the Master Campus setup and second-factor login explicit', () => {
    expect(
      s14MfaContent.browser.masterCampus.navigation.map(({ label, interactive }) => ({
        label,
        interactive,
      })),
    ).toEqual([
      { label: 'Übersicht', interactive: true },
      { label: 'Campus Workspace', interactive: false },
      { label: 'Campus Services', interactive: false },
      { label: 'Campus Cloud', interactive: false },
      { label: 'Profil', interactive: false },
      { label: 'Einstellungen', interactive: true },
    ]);
    expect(s14MfaContent.browser.masterCampus.security.cards[0]).toMatchObject({
      id: 'two-factor',
      title: 'Zwei-Faktor-Authentifizierung',
      interactive: true,
    });
    expect(s14MfaContent.browser.masterCampus.authenticator.codes).toHaveLength(3);
    expect(s14MfaContent.timings).toMatchObject({
      authenticatorCodeTickMs: 1_000,
      authenticatorCodeDurationSeconds: 30,
      scanRecognitionDurationMs: 750,
      scanConfirmationDurationMs: 1_100,
    });
    expect(s14MfaContent.browser.masterCampus.twoFactor.codeDescription).toBe(
      'Tippe den sechsstelligen Code aus der Authenticator-App in die sechs Felder ein.',
    );
    expect(s14MfaContent.browser.masterCampus.authenticator).toMatchObject({
      recognizingStatus: 'QR-Code wird erkannt …',
      scanConfirmedStatus: 'QR-Code erkannt',
    });
    expect(s14MfaContent.guide.configured).toEqual([
      'Damit ist die Zwei-Faktor-Authentifizierung für Master Campus eingerichtet.',
      'Probier jetzt aus, was sich beim Anmelden verändert.',
    ]);
    expect(s14MfaContent.guide.closeAfterLogin).toBe(
      'Schließe den Browser noch einmal und schau, was sich im Kontonetzwerk verändert hat.',
    );
  });
});

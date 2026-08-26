import { describe, expect, it } from 'vitest';
import { s13PasswordManagerPracticeContent } from './s13.js';

describe('S13 integrated password-manager practice traceability', () => {
  it('keeps the authored browser exercise and function sequence together', () => {
    expect(s13PasswordManagerPracticeContent.segment).toMatchObject({
      id: 'S13',
      sectionId: 'password-manager',
    });
    expect(s13PasswordManagerPracticeContent.browser.tabLabel).toBe('MyShop');
    expect(s13PasswordManagerPracticeContent.flow.map(({ label }) => label)).toEqual([
      'Erzeugen',
      'Speichern',
      'Ausfüllen',
    ]);
  });

  it('keeps the generated-password, save and autofill actions explicit', () => {
    expect(s13PasswordManagerPracticeContent.passwordManager).toMatchObject({
      suggestAction: 'Sicher erzeugtes Passwort verwenden',
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
      incorrectPassword: 'Dieses Passwort passt nicht zum Konto.',
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
    expect(s13PasswordManagerPracticeContent.version).toBe('4.6.0');
    expect(s13PasswordManagerPracticeContent.website.shop.hero).toMatchObject({
      eyebrow: 'Sommer-Sale',
      title: 'Bis zu 40% sparen!',
    });
    expect(s13PasswordManagerPracticeContent.website.shop.popularCategories).toHaveLength(6);
    expect(s13PasswordManagerPracticeContent.website.shop.recommendedProducts).toHaveLength(6);
  });

  it('keeps the Muster Bank password-change and update sequence explicit', () => {
    expect(
      s13PasswordManagerPracticeContent.bank.website.navigation.map(({ label }) => label),
    ).toEqual(['Übersicht', 'Konten', 'Überweisungen', 'Karten', 'Einstellungen']);
    expect(s13PasswordManagerPracticeContent.bank.website).toMatchObject({
      loginAction: 'Anmelden',
      hiddenValue: 'Ausgeblendet',
      maskedBalance: '••••,•• €',
      maskedAccountNumber: 'DE•• •••• •••• •••• ••',
      cards: { cardNumber: '•••• •••• •••• ••••' },
    });
    expect(s13PasswordManagerPracticeContent.bank.website.settings).toMatchObject({
      currentPasswordLabel: 'Altes Passwort',
      newPasswordLabel: 'Neues Passwort',
      confirmNewPasswordLabel: 'Neues Passwort bestätigen',
      changePasswordAction: 'Passwort ändern',
      passwordChangedStatus: 'Passwort geändert',
    });
    expect(s13PasswordManagerPracticeContent.bank.passwordManager).toMatchObject({
      currentPassword: 'Passw0rtGeheim!?',
      suggestAction: 'Sicher erzeugtes Passwort verwenden',
      updateTitle: 'Gespeichertes Passwort für Muster Bank aktualisieren?',
      usernameLabel: 'Benutzername',
      passwordLabel: 'Passwort',
      updateAction: 'Aktualisieren',
      dismissUpdateAction: 'Nicht jetzt',
      updatedStatus: 'Passwort aktualisiert',
    });
    expect(s13PasswordManagerPracticeContent.bank.guide).toMatchObject({
      taskLabel: 'Passwort ändern',
      updateDeclined: {
        first: 'Im Passwortmanager ist damit noch das alte Passwort gespeichert.',
        second:
          'Damit er beim nächsten Anmelden das neue verwendet, öffne den Hinweis noch einmal und aktualisiere den Eintrag.',
        reminder:
          'Aktualisiere den Eintrag, damit der Passwortmanager das neue Passwort verwendet.',
      },
      updated:
        'Jetzt ist auch im Passwortmanager das neue Passwort gespeichert. Melde dich ab und anschließend mit dem neuen Passwort wieder an.',
      autofill:
        'Vorhin hast du den gespeicherten Eintrag noch selbst ausgewählt. Diesmal hat ihn der Passwortmanager direkt ausgefüllt. Bei vielen Anmeldungen kann er das automatisch übernehmen.',
      complete:
        'Schließe den Browser wieder und schau, was die Änderung bei Muster Bank im Netzwerk bewirkt.',
    });
    expect(s13PasswordManagerPracticeContent.bank.passwordManager.generatedPassword).toMatch(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{16}$/,
    );
    expect(
      s13PasswordManagerPracticeContent.bank.passwordManager.autofillAccounts.map(
        ({ label }) => label,
      ),
    ).toEqual(['Muster Bank', 'My Shop', 'Campusgram', 'Master Campus', 'Campus E-Mail']);
    expect('username' in s13PasswordManagerPracticeContent.bank.website).toBe(false);
    expect('forgotPasswordLabel' in s13PasswordManagerPracticeContent.bank.website).toBe(
      false,
    );
  });

  it('keeps the new-account and existing-account network explanation together', () => {
    expect(s13PasswordManagerPracticeContent.network).toMatchObject({
      accountLabel: 'My Shop',
      existingAccount: { label: 'Muster Bank' },
      guide: {
        newAccount:
          'Das neue Konto startet direkt mit einem eigenen starken Passwort.',
        unchangedAtService:
          'Dadurch ändert sich das Passwort beim jeweiligen Dienst aber noch nicht.',
        reusedPassword:
          'Muster Bank verwendet zum Beispiel noch dasselbe Passwort wie ein anderes Konto.',
        passwordChanged:
          'Muster Bank hat jetzt ein eigenes Passwort. Der bisherige Verbindungsweg ist weg.',
      },
    });
    expect(
      s13PasswordManagerPracticeContent.network.importedVault.entries
        .slice(0, 5)
        .map(({ label }) => label),
    ).toEqual(['My Shop', 'Campusgram', 'Master Campus', 'Campus E-Mail', 'Muster Bank']);
  });

  it('keeps the Campusgram manual password-manager fallback together', () => {
    expect(s13PasswordManagerPracticeContent.network.guide.campusgramTransition).toEqual([
      'Muster Bank hat jetzt ein eigenes Passwort. Der bisherige Verbindungsweg ist weg.',
      'Versuch dich zum Abschluss noch einmal bei Campusgram anzumelden. Deine Passphrase ist bereits im Passwortmanager gespeichert.',
    ]);
    expect(s13PasswordManagerPracticeContent.campusgram.guide).toMatchObject({
      fillUnavailable: 'Bei Campusgram klappt das Ausfüllen hier nicht.',
      copyInstruction:
        'Öffne über die Browser-Einstellungen den Passwortmanager und kopiere dort das Campusgram-Passwort zum Anmelden.',
      complete:
        'Wenn Autofill einmal nicht klappt, kannst du das gespeicherte Passwort also auch selbst kopieren und einsetzen. Merken musst du es dir trotzdem nicht.',
    });
    expect(s13PasswordManagerPracticeContent.campusgram.browser.menu).toMatchObject({
      newTabAction: 'Neuer Tab',
      historyAction: 'Verlauf',
      downloadsAction: 'Downloads',
      passwordManagerAction: 'Passwortmanager',
      settingsAction: 'Einstellungen',
      helpAction: 'Hilfe',
    });
    expect(
      s13PasswordManagerPracticeContent.campusgram.settings.navigation
        .filter(({ id }) => id === 'general' || id === 'passwords')
        .map(({ label }) => label),
    ).toEqual(['Allgemein', 'Passwörter']);
    expect(
      s13PasswordManagerPracticeContent.campusgram.passwordManager.additionalAccounts,
    ).toHaveLength(75);
    expect(
      s13PasswordManagerPracticeContent.campusgram.passwordManager.knownAccounts.map(
        ({ label }) => label,
      ),
    ).toEqual(['Campusgram', 'Master Campus', 'Campus E-Mail', 'Muster Bank', 'My Shop']);
    expect(
      s13PasswordManagerPracticeContent.campusgram.passwordManager.knownAccounts.length +
        s13PasswordManagerPracticeContent.campusgram.passwordManager.additionalAccounts.length,
    ).toBe(80);
  });

  it('keeps the password-manager conclusion and MFA handoff together', () => {
    expect(s13PasswordManagerPracticeContent.conclusion.remainingAccounts.guide).toEqual({
      intro: 'Die übrigen Konten musst du nicht alle auf einmal umstellen.',
      pace:
        'Neue Konten kannst du ab jetzt direkt so anlegen. Bestehende kannst du nach und nach ändern, wenn du sie ohnehin wieder benutzt.',
    });
    expect(s13PasswordManagerPracticeContent.conclusion.variants).toMatchObject({
      fitGuide:
        'Beide Wege können starke und einzigartige Passwörter für dich verwalten.',
      question: 'Was würde eher zu deinem Alltag passen?',
      options: { integrated: 'Integriert', separate: 'Separat' },
      integrated: { title: 'Integriert passt eher, wenn …' },
      separate: { title: 'Eigenständig passt eher, wenn …' },
    });
    expect(s13PasswordManagerPracticeContent.conclusion.recovery).toMatchObject({
      title: 'Was passiert, wenn dein Gerät verloren geht?',
      path: { label: 'Wiederherstellungsweg' },
      newDevice: { status: 'Tresor wieder verfügbar' },
    });
    expect(s13PasswordManagerPracticeContent.conclusion.network).toMatchObject({
      repairAction: 'Alle Passwörter beheben',
    });
    expect(s13PasswordManagerPracticeContent.conclusion.mfa).toMatchObject({
      previewTitle: 'Angreifer kennt das korrekte Master Campus-Passwort',
      previewLead: 'Bekannt',
      previewAccountSymbolId: 'master-campus',
      protectionPath: {
        shieldLabel: 'Zweite Hürde',
        shieldDescription:
          'Eine zusätzliche Hürde schützt den Zugang zu diesem anderen Konto.',
      },
      guide: {
        passwordKnown:
          'Passwörter können nicht nur erraten werden, sondern auch auf anderen Wegen bekannt werden.',
        passwordInsufficient:
          'Ist ein Passwort einem Angreifer bekannt, reicht selbst ein sehr starkes Passwort allein nicht mehr aus.',
        secondHurdle:
          'Um den Zugang auch dann zu schützen, brauchen wir eine zweite Hürde.',
      },
      transition: {
        title: 'Multi-Faktor-Authentifizierung',
        detail: 'kennenlernen',
        ariaLabel: 'Multi-Faktor-Authentifizierung kennenlernen',
        sectionTransition: {
          sectionLabel: 'Sektion 3 von 3',
          title: 'Multi-Faktor-Authentifizierung',
          parts: [
            {
              id: 'multi-factor-authentication',
              label: 'Multi-Faktor-Authentifizierung',
            },
          ],
          holdDurationMs: 3500,
        },
      },
    });
  });
});

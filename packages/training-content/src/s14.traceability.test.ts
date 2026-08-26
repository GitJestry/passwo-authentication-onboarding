import { describe, expect, it } from 'vitest';
import { s14MfaContent } from './s14.js';

describe('S14 MFA introduction traceability', () => {
  it('keeps MFA, 2FA and the three factor categories together', () => {
    expect(s14MfaContent.version).toBe('1.1.0');
    expect(s14MfaContent.segment).toMatchObject({
      id: 'S14',
      sectionId: 'mfa',
      slice: 'mfa-and-second-factor',
    });
    expect(s14MfaContent.concepts).toEqual({
      mfa: {
        title: 'Multi-Faktor-Authentisierung',
        abbreviation: 'MFA',
      },
      twoFactor: {
        title: 'Zwei-Faktor-Authentisierung',
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

  it('keeps valid and invalid factor combinations explicit', () => {
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

  it('ends in the locked search tab beside Master Campus', () => {
    expect(s14MfaContent.browser).toMatchObject({
      masterCampusTab: {
        id: 'master-campus',
        label: 'Master Campus',
      },
      searchTab: {
        id: 'mfa-search',
        label: 'Neuer Tab',
        address: 'search.example',
      },
      searchPage: {
        brand: 'Search',
      },
    });
  });
});

import { describe, expect, it } from 'vitest';
import { s15ToS17MfaConclusionContent } from './s15-s17.js';

describe('S15-S17 MFA conclusion traceability', () => {
  it('keeps the three authored conclusion segments in the MFA section', () => {
    expect(s15ToS17MfaConclusionContent.version).toBe('1.2.0');
    expect(s15ToS17MfaConclusionContent.segments).toEqual([
      { id: 'S15', sectionId: 'mfa', slice: 'second-factor-effect' },
      { id: 'S16', sectionId: 'mfa', slice: 'prioritize-and-expand' },
      { id: 'S17', sectionId: 'mfa', slice: 'integrated-conclusion' },
    ]);
  });

  it('keeps the authored outcome, prioritization and completion actions explicit', () => {
    expect(s15ToS17MfaConclusionContent.status.activated).toBe('2FA aktiviert');
    expect(s15ToS17MfaConclusionContent.guide.outcome).toEqual({
      passwordAlone: 'Jetzt reicht das Passwort allein nicht mehr für die Anmeldung.',
      secondFactor:
        'Selbst wenn es bekannt wird, müsste der Angreifer zusätzlich an deinen zweiten Faktor gelangen.',
    });
    expect(s15ToS17MfaConclusionContent.guide.prioritize).toEqual({
      effort:
        'Es kann sich zuerst nach viel anfühlen, 2FA für viele Konten einzurichten. Das ist völlig normal.',
      importantAccounts: 'Fang deshalb auch hier zuerst bei deinen wichtigen Konten an.',
    });
    expect(s15ToS17MfaConclusionContent.guide.expanded).toEqual({
      howTo:
        'Bei anderen Konten kannst du genauso vorgehen: Prüfe, ob 2FA angeboten wird, und suche in den Sicherheits- oder Kontoeinstellungen nach der Aktivierung.',
      summary:
        'Unsere Konten haben jetzt eigene starke Passwörter. Und bei wichtigen Konten reicht das Passwort für den Angreifer allein nicht mehr aus.',
    });
    expect(s15ToS17MfaConclusionContent.guide.expandAction).toBe(
      'Schutz auf weitere Konten ausweiten',
    );
    expect(s15ToS17MfaConclusionContent.guide.completeAction).toBe(
      'Training abschließen',
    );
  });

  it('keeps chain expansion deterministic and content-free', () => {
    expect(s15ToS17MfaConclusionContent.network.knownAccountIds).toEqual([
      'master-campus',
      'campus-email',
      'campusgram',
      'my-shop',
      'muster-bank',
    ]);
    expect(s15ToS17MfaConclusionContent.network.additionalAccountStride).toBe(4);
  });
});

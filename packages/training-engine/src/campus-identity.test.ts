import { describe, expect, it } from 'vitest';
import { deriveCampusIdentity } from './campus-identity.js';

describe('deriveCampusIdentity', () => {
  it('creates readable fictional campus identifiers from a local display name', () => {
    expect(deriveCampusIdentity('Mara Müller')).toEqual({
      campusId: 'mara.muller@campus.example',
      campusMail: 'mara.muller@mail.campus.example',
    });
  });

  it('normalizes separators without using the display name outside the local identifier', () => {
    expect(deriveCampusIdentity('  Anne-Marie  O’Neil  ')).toEqual({
      campusId: 'anne.marie.o.neil@campus.example',
      campusMail: 'anne.marie.o.neil@mail.campus.example',
    });
  });
});

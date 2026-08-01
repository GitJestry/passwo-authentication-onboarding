export interface CampusIdentity {
  readonly masterCampus: string;
  readonly campusEmail: string;
  readonly campusgram: string;
}

function toCampusStringId(displayName: string): string {
  const normalized = displayName
    .trim()
    .toLocaleLowerCase('de-DE')
    .replace(/ß/gu, 'ss')
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .replace(/[^a-z0-9]+/gu, '.')
    .replace(/^\.+|\.+$/gu, '');

  return normalized.slice(0, 32) || 'campus-user';
}

/** Creates fictional, local-only identifiers from the transient training name. */
export function deriveCampusIdentity(displayName: string): CampusIdentity {
  const stringId = toCampusStringId(displayName);
  return {
    masterCampus: `${stringId}@campus.example`,
    campusEmail: `${stringId}@mail.campus.example`,
    campusgram: `${stringId}.campusgram`,
  };
}

export interface CampusIdentity {
  readonly masterCampus: string;
  readonly campusEmail: string;
  readonly campusgram: string;
  readonly assessmentTerms: {
    readonly 'master-campus': readonly [username: string, email: string];
    readonly 'campus-email': readonly [username: string, email: string];
    readonly campusgram: readonly [username: string, email: string];
  };
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
  const masterCampusEmail = `${stringId}@campus.example`;
  const campusEmail = `${stringId}@mail.campus.example`;
  const campusgramUsername = `${stringId}.campusgram`;
  return {
    masterCampus: masterCampusEmail,
    campusEmail,
    campusgram: campusgramUsername,
    assessmentTerms: {
      'master-campus': [stringId, masterCampusEmail],
      'campus-email': [stringId, campusEmail],
      campusgram: [campusgramUsername, campusEmail],
    },
  };
}

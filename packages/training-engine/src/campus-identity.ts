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

function selectedUsername(displayName: string): string {
  return displayName.trim() || 'benutzername';
}

/** Creates fictional, local-only identifiers from the transient training name. */
export function deriveCampusIdentity(displayName: string): CampusIdentity {
  const username = selectedUsername(displayName);
  const masterCampusEmail = `${username}@campus.example`;
  const campusEmail = `${username}@mail.campus.example`;
  return {
    masterCampus: masterCampusEmail,
    campusEmail,
    campusgram: username,
    assessmentTerms: {
      'master-campus': [username, masterCampusEmail],
      'campus-email': [username, campusEmail],
      campusgram: [username, campusEmail],
    },
  };
}

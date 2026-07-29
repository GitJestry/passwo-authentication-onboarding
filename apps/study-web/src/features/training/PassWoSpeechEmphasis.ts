export type PassWoSpeechEmphasisTone =
  | 'accent'
  | 'positive'
  | 'warning'
  | 'action'
  | 'campus-id'
  | 'campus-mail'
  | 'campusgram';

export interface PassWoSpeechEmphasis {
  readonly phrase: string;
  readonly tone: PassWoSpeechEmphasisTone;
  readonly symbolId?: string;
}

/**
 * Presentation-only defaults for recurring terms in PassWo speech.
 * Callers can pass their own list for one-off requirements or authored condition lists.
 */
export const defaultPassWoSpeechEmphasis = [
  { phrase: 'Master Campus', tone: 'campus-id', symbolId: 'campus-id' },
  { phrase: 'Campus E-Mail', tone: 'campus-mail', symbolId: 'campus-mail' },
  {
    phrase: 'Campusgram',
    tone: 'campusgram',
    symbolId: 'campus-board-archive',
  },
  { phrase: 'drei Campus-Konten', tone: 'accent' },
  { phrase: 'starke und merkbare Passwörter', tone: 'positive' },
  { phrase: 'stark sein', tone: 'positive' },
  { phrase: 'abrufbar bleiben', tone: 'positive' },
  { phrase: 'keine eigenen Passwörter oder Varianten davon', tone: 'warning' },
  { phrase: 'letzte Hürde', tone: 'accent' },
  { phrase: 'persönlichen Daten', tone: 'accent' },
  { phrase: 'Sicherheitsmeldung', tone: 'warning' },
  { phrase: 'Schließe', tone: 'action' },
  { phrase: 'Melde dich', tone: 'action' },
  { phrase: 'Klicke unten im Dock auf den Browser', tone: 'action' },
  { phrase: 'auf die Knoten klickst', tone: 'action' },
] as const satisfies readonly PassWoSpeechEmphasis[];

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
  { phrase: 'PassWo', tone: 'accent' },
  { phrase: 'drei Campuskonten', tone: 'accent' },
  { phrase: 'starke Passwörter', tone: 'positive' },
  { phrase: 'gut merken kannst', tone: 'positive' },
  { phrase: 'allen drei Konten', tone: 'accent' },
  { phrase: 'später wieder abrufen kannst', tone: 'positive' },
  { phrase: 'virtuellen PC', tone: 'accent' },
  { phrase: 'Betriebssystem', tone: 'action' },
  { phrase: 'Master Campus', tone: 'campus-id', symbolId: 'campus-id' },
  { phrase: 'Campus E-Mail', tone: 'campus-mail', symbolId: 'campus-mail' },
  { phrase: 'Campus Workspace', tone: 'accent', symbolId: 'campus-workspace' },
  { phrase: 'Campus Services', tone: 'accent', symbolId: 'campus-services' },
  { phrase: 'Campus Cloud', tone: 'accent', symbolId: 'campus-cloud' },
  {
    phrase: 'Campusgram',
    tone: 'campusgram',
    symbolId: 'campus-board-archive',
  },
  { phrase: 'Campus-Nachrichten', tone: 'accent', symbolId: 'notifications' },
  { phrase: 'Benachrichtigungen', tone: 'accent', symbolId: 'notifications' },
  { phrase: 'Bestätigungen', tone: 'accent', symbolId: 'confirmations' },
  { phrase: 'Zurücksetzungslinks', tone: 'accent', symbolId: 'reset-links' },
  { phrase: 'Zurücksetzungen', tone: 'accent', symbolId: 'reset-links' },
  {
    phrase: 'Kommunikation in deinem Namen',
    tone: 'accent',
    symbolId: 'compose-message',
  },
  { phrase: 'persönliche Direktnachrichten', tone: 'accent', symbolId: 'direct-messages' },
  { phrase: 'Direktnachrichten', tone: 'accent', symbolId: 'direct-messages' },
  { phrase: 'Gruppen und Kontakte', tone: 'accent', symbolId: 'groups-contacts' },
  { phrase: 'Beiträge und Reaktionen', tone: 'accent', symbolId: 'posts-reactions' },
  { phrase: 'jedes der drei Konten', tone: 'accent' },
  { phrase: 'starkes Passwort', tone: 'positive' },
  { phrase: 'spätere erneute Anmeldung', tone: 'positive' },
  { phrase: 'Die drei Konten sind eingerichtet', tone: 'positive' },
  { phrase: 'Knoten-Netzwerk', tone: 'accent' },
  { phrase: 'Dienste und Funktionen', tone: 'accent' },
  { phrase: 'Schließe dafür bitte zunächst den Browser', tone: 'action' },
  { phrase: 'Dein Passwort', tone: 'accent' },
  { phrase: 'letzte Hürde', tone: 'warning' },
  { phrase: 'Angreifer', tone: 'warning' },
  { phrase: 'persönlichen Daten', tone: 'accent' },
  { phrase: 'drei Hauptkonten', tone: 'accent' },
  { phrase: '„Nächste“', tone: 'action' },
  { phrase: 'Schritt für Schritt', tone: 'positive' },
  { phrase: 'keine eigenen Passwörter oder Varianten davon', tone: 'warning' },
  { phrase: 'nur lokal', tone: 'positive' },
  { phrase: 'nicht dauerhaft gespeichert', tone: 'positive' },
] as const satisfies readonly PassWoSpeechEmphasis[];

export type PassWoSpeechEmphasisTone =
  | 'accent'
  | 'positive'
  | 'warning'
  | 'action'
  | 'master-campus'
  | 'campus-email'
  | 'campusgram';

export interface PassWoSpeechEmphasis {
  readonly phrase: string;
  readonly tone: PassWoSpeechEmphasisTone;
  readonly symbolId?: string;
}

const accountAndServiceEmphasis = {
  'Master Campus': { phrase: 'Master Campus', tone: 'master-campus', symbolId: 'master-campus' },
  'Campus E-Mail': { phrase: 'Campus E-Mail', tone: 'campus-email', symbolId: 'campus-email' },
  'Campus Workspace': {
    phrase: 'Campus Workspace',
    tone: 'accent',
    symbolId: 'campus-workspace',
  },
  'Campus Services': {
    phrase: 'Campus Services',
    tone: 'accent',
    symbolId: 'campus-services',
  },
  'Campus Cloud': { phrase: 'Campus Cloud', tone: 'accent', symbolId: 'campus-cloud' },
  Campusgram: {
    phrase: 'Campusgram',
    tone: 'campusgram',
    symbolId: 'campusgram',
  },
  Benachrichtigungen: {
    phrase: 'Benachrichtigungen',
    tone: 'accent',
    symbolId: 'notifications',
  },
  Bestätigungen: { phrase: 'Bestätigungen', tone: 'accent', symbolId: 'confirmations' },
  Zurücksetzungslinks: {
    phrase: 'Zurücksetzungslinks',
    tone: 'accent',
    symbolId: 'reset-links',
  },
  Direktnachrichten: {
    phrase: 'Direktnachrichten',
    tone: 'accent',
    symbolId: 'direct-messages',
  },
  'Gruppen und Kontakte': {
    phrase: 'Gruppen und Kontakte',
    tone: 'accent',
    symbolId: 'groups-contacts',
  },
  'Beiträge und Reaktionen': {
    phrase: 'Beiträge und Reaktionen',
    tone: 'accent',
    symbolId: 'posts-reactions',
  },
} as const satisfies Readonly<Record<string, PassWoSpeechEmphasis>>;

const noEmphasis = [] as const satisfies readonly PassWoSpeechEmphasis[];

/**
 * Presentation-only emphasis authored for a specific PassWo speech step.
 * Unlisted speech remains deliberately unmarked instead of inheriting phrase matches globally.
 */
const emphasisBySpeechId: Readonly<Record<string, readonly PassWoSpeechEmphasis[]>> = {
  'module-entry': [
    { phrase: 'drei Campuskonten', tone: 'accent' },
    { phrase: 'starke Passwörter', tone: 'positive' },
    { phrase: 'später wieder abrufen kannst', tone: 'positive' },
    { phrase: 'Betriebssystem', tone: 'action' },
  ],
  's00.master-campus': [
    accountAndServiceEmphasis['Master Campus'],
    accountAndServiceEmphasis['Campus Workspace'],
    accountAndServiceEmphasis['Campus Services'],
    accountAndServiceEmphasis['Campus Cloud'],
  ],
  's00.campus-email': [
    accountAndServiceEmphasis['Campus E-Mail'],
    { phrase: 'Campus-Nachrichten', tone: 'accent', symbolId: 'notifications' },
    accountAndServiceEmphasis.Bestätigungen,
    accountAndServiceEmphasis.Zurücksetzungslinks,
  ],
  's00.campusgram': [
    accountAndServiceEmphasis.Campusgram,
    { phrase: 'persönliche Direktnachrichten', tone: 'accent', symbolId: 'direct-messages' },
    accountAndServiceEmphasis['Gruppen und Kontakte'],
    accountAndServiceEmphasis['Beiträge und Reaktionen'],
  ],
  's00.safety': [
    { phrase: 'keine eigenen Passwörter oder Varianten davon', tone: 'warning' },
    { phrase: 'nur lokal', tone: 'positive' },
    { phrase: 'nicht dauerhaft gespeichert', tone: 'positive' },
  ],
  's01.quest': [
    { phrase: 'starkes Passwort', tone: 'positive' },
    { phrase: 'spätere erneute Anmeldung', tone: 'positive' },
  ],
  's01.ready': [
    { phrase: 'Die drei Konten sind eingerichtet', tone: 'positive' },
    { phrase: 'Knoten-Netzwerk', tone: 'accent' },
    { phrase: 'Schließe dafür bitte zunächst den Browser', tone: 'action' },
  ],
  's02.accounts.intro': [
    { phrase: 'letzte Hürde', tone: 'warning' },
    { phrase: 'eines der drei Hauptkonten', tone: 'action' },
    { phrase: '„Nächste“', tone: 'action' },
  ],
  's02.accounts.complete': [
    { phrase: 'Klicke unten im Dock auf den Browser', tone: 'action' },
  ],
  's02.master-campus.open': [
    accountAndServiceEmphasis['Master Campus'],
    accountAndServiceEmphasis['Campus Workspace'],
    accountAndServiceEmphasis['Campus Services'],
    accountAndServiceEmphasis['Campus Cloud'],
  ],
  's02.master-campus.understood': [{ phrase: 'diesem einen Zugang', tone: 'accent' }],
  's02.master-campus.workspace': [accountAndServiceEmphasis['Campus Workspace']],
  's02.master-campus.services': [accountAndServiceEmphasis['Campus Services']],
  's02.master-campus.campus-cloud': [accountAndServiceEmphasis['Campus Cloud']],
  's02.campus-email.open': [
    accountAndServiceEmphasis['Campus E-Mail'],
    { phrase: 'Nachrichten', tone: 'accent', symbolId: 'notifications' },
    accountAndServiceEmphasis.Bestätigungen,
    { phrase: 'Zurücksetzungen', tone: 'accent', symbolId: 'reset-links' },
    { phrase: 'Kommunikation', tone: 'accent', symbolId: 'compose-message' },
  ],
  's02.campus-email.understood': [
    { phrase: 'Kommunikation in deinem Namen', tone: 'warning', symbolId: 'compose-message' },
  ],
  's02.campus-email.notifications': [accountAndServiceEmphasis.Benachrichtigungen],
  's02.campus-email.confirmations': [accountAndServiceEmphasis.Bestätigungen],
  's02.campus-email.reset-links': [accountAndServiceEmphasis.Zurücksetzungslinks],
  's02.campus-email.impersonation': [
    { phrase: 'Kommunikation in deinem Namen', tone: 'warning', symbolId: 'compose-message' },
  ],
  's02.campusgram.open': [
    accountAndServiceEmphasis.Campusgram,
    { phrase: 'persönliche Direktnachrichten', tone: 'accent', symbolId: 'direct-messages' },
    accountAndServiceEmphasis['Gruppen und Kontakte'],
    accountAndServiceEmphasis['Beiträge und Reaktionen'],
  ],
  's02.campusgram.understood': [{ phrase: 'persönliche Kommunikation', tone: 'warning' }],
  's02.campusgram.direct-messages': [accountAndServiceEmphasis.Direktnachrichten],
  's02.campusgram.groups-contacts': [accountAndServiceEmphasis['Gruppen und Kontakte']],
  's02.campusgram.posts-reactions': [accountAndServiceEmphasis['Beiträge und Reaktionen']],
  's03.intro': [{ phrase: 'Melde dich jetzt', tone: 'action' }],
  's03.success': [{ phrase: 'wieder geöffnet', tone: 'positive' }],
  's03.assisted': [{ phrase: 'mit Unterstützung wieder geöffnet', tone: 'positive' }],
  's03.third-failed-login': [{ phrase: '„Passwort vergessen?“', tone: 'action' }],
  's03.retrieval-help': [
    { phrase: 'stark sein', tone: 'positive' },
    { phrase: 'wieder abrufbar bleiben', tone: 'accent' },
    { phrase: 'hilfreiche Beobachtung', tone: 'positive' },
  ],
  's03.completion.0': [
    { phrase: 'keines der drei Passwörter selbst abrufen', tone: 'warning' },
    { phrase: 'stark und im Alltag abrufbar', tone: 'accent' },
  ],
  's03.completion.1': [
    { phrase: 'einem von drei Konten selbst wieder anmelden', tone: 'accent' },
    { phrase: 'Stärke allein reicht nicht', tone: 'warning' },
  ],
  's03.completion.2': [
    { phrase: 'zwei von drei Konten selbst wieder anmelden', tone: 'positive' },
    { phrase: 'ein einzelnes schwer abrufbares Passwort', tone: 'warning' },
  ],
  's03.completion.3': [
    { phrase: 'allen drei Konten selbst wieder anmelden', tone: 'positive' },
    { phrase: 'Abrufbarkeit ist nur eine von mehreren Anforderungen', tone: 'accent' },
  ],
  's03.warning': [
    { phrase: 'Warnung', tone: 'warning' },
    { phrase: 'ansehen', tone: 'action' },
  ],
};

export function passWoSpeechEmphasisFor(
  speechId: string,
): readonly PassWoSpeechEmphasis[] {
  return emphasisBySpeechId[speechId] ?? noEmphasis;
}

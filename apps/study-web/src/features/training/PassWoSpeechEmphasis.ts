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
  /** A second phrase is rendered only when both rules share this explicit contrast. */
  readonly contrastId?: string;
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
  'module-entry': [{ phrase: 'drei Campuskonten', tone: 'accent' }],
  's00.browser': [{ phrase: 'alle drei ein', tone: 'action' }],
  's00.safety': [{ phrase: 'keine echten Passwörter oder Varianten davon', tone: 'warning' }],
  's01.quest': [{ phrase: 'starkes Passwort', tone: 'positive' }],
  's01.ready': [{ phrase: 'Schließen-Schaltfläche', tone: 'action' }],
  's02.accounts.intro': [{ phrase: 'eines der drei Hauptkonten', tone: 'action' }],
  's02.accounts.complete': [
    { phrase: 'Klicke unten im Dock auf den Browser', tone: 'action' },
  ],
  's02.master-campus.open': [accountAndServiceEmphasis['Master Campus']],
  's02.master-campus.understood': [{ phrase: 'diesem einen Zugang', tone: 'accent' }],
  's02.master-campus.workspace': [accountAndServiceEmphasis['Campus Workspace']],
  's02.master-campus.services': [accountAndServiceEmphasis['Campus Services']],
  's02.master-campus.campus-cloud': [accountAndServiceEmphasis['Campus Cloud']],
  's02.campus-email.open': [accountAndServiceEmphasis['Campus E-Mail']],
  's02.campus-email.understood': [
    { phrase: 'Kommunikation in deinem Namen', tone: 'warning', symbolId: 'compose-message' },
  ],
  's02.campus-email.notifications': [accountAndServiceEmphasis.Benachrichtigungen],
  's02.campus-email.confirmations': [accountAndServiceEmphasis.Bestätigungen],
  's02.campus-email.reset-links': [accountAndServiceEmphasis.Zurücksetzungslinks],
  's02.campus-email.impersonation': [
    { phrase: 'Kommunikation in deinem Namen', tone: 'warning', symbolId: 'compose-message' },
  ],
  's02.campusgram.open': [accountAndServiceEmphasis.Campusgram],
  's02.campusgram.understood': [{ phrase: 'persönliche Kommunikation', tone: 'warning' }],
  's02.campusgram.direct-messages': [accountAndServiceEmphasis.Direktnachrichten],
  's02.campusgram.groups-contacts': [accountAndServiceEmphasis['Gruppen und Kontakte']],
  's02.campusgram.posts-reactions': [accountAndServiceEmphasis['Beiträge und Reaktionen']],
  's03.intro': [{ phrase: 'Melde dich jetzt', tone: 'action' }],
  's03.success': [{ phrase: 'wieder geöffnet', tone: 'positive' }],
  's03.assisted': [{ phrase: 'mit Unterstützung wieder geöffnet', tone: 'positive' }],
  's03.third-failed-login': [{ phrase: '„Passwort vergessen?“', tone: 'action' }],
  's03.retrieval-help': [{ phrase: 'wieder abrufbar bleiben', tone: 'accent' }],
  's03.completion.0': [{ phrase: 'stark und im Alltag abrufbar', tone: 'accent' }],
  's03.completion.1': [{ phrase: 'Stärke allein reicht nicht', tone: 'warning' }],
  's03.completion.2': [{ phrase: 'ein einzelnes schwer abrufbares Passwort', tone: 'warning' }],
  's03.completion.3': [
    { phrase: 'Abrufbarkeit ist nur eine von mehreren Anforderungen', tone: 'accent' },
  ],
  's03.warning': [{ phrase: 'Warnung', tone: 'warning' }],
};

export function passWoSpeechEmphasisFor(
  speechId: string,
): readonly PassWoSpeechEmphasis[] {
  return emphasisBySpeechId[speechId] ?? noEmphasis;
}

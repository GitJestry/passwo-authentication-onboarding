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
  's02.master-campus': [{ phrase: 'Master-Campus-Anmeldung', tone: 'action' }],
  's02.campus-email': [{ phrase: 'Zurücksetzungslink', tone: 'action' }],
  's02.campusgram': [{ phrase: 'Direktnachricht', tone: 'action' }],
  's03.intro': [{ phrase: 'Melde dich jetzt', tone: 'action' }],
  's03.success': [{ phrase: 'wieder geöffnet', tone: 'positive' }],
  's03.assisted': [{ phrase: 'mit Unterstützung wieder geöffnet', tone: 'positive' }],
  's03.third-failed-login': [{ phrase: '„Passwort vergessen?“', tone: 'action' }],
  's03.retrieval-help': [{ phrase: 'gerade nicht abrufbar', tone: 'accent' }],
  's03.completion.0': [{ phrase: 'ohne Unterstützung abrufbar', tone: 'accent' }],
  's03.completion.1': [{ phrase: 'ohne Unterstützung abrufbar', tone: 'accent' }],
  's03.completion.2': [{ phrase: 'ohne Unterstützung abrufbar', tone: 'accent' }],
  's03.completion.3': [{ phrase: 'ohne Unterstützung abrufbar', tone: 'accent' }],
  's03.warning': [{ phrase: 'markierten Tab', tone: 'action' }],
};

export function passWoSpeechEmphasisFor(
  speechId: string,
): readonly PassWoSpeechEmphasis[] {
  return emphasisBySpeechId[speechId] ?? noEmphasis;
}

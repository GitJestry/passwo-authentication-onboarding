import accountContextAsset from '../../assets/s05/category-logos/account-context.png';
import commonCoresAsset from '../../assets/s05/category-logos/common-cores.png';
import personalDetailsAsset from '../../assets/s05/category-logos/personal-details.png';
import typicalChangesAsset from '../../assets/s05/category-logos/typical-changes.png';

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
  readonly symbolSrc?: string;
  /** Additional phrases are rendered only when they share this explicit grouped emphasis. */
  readonly contrastId?: string;
}

const noEmphasis = [] as const satisfies readonly PassWoSpeechEmphasis[];

/**
 * Presentation-only emphasis authored for a specific PassWo speech step.
 * Unlisted speech remains deliberately unmarked instead of inheriting phrase matches globally.
 */
const emphasisBySpeechId: Readonly<Record<string, readonly PassWoSpeechEmphasis[]>> = {
  'module-entry': [
    { phrase: 'starke Passwörter', tone: 'positive', contrastId: 'password-memory' },
    { phrase: 'gut merken', tone: 'accent', contrastId: 'password-memory' },
    { phrase: 'wieder abrufen', tone: 'accent', contrastId: 'password-memory' },
  ],
  's00.browser': [{ phrase: 'alle drei ein', tone: 'action' }],
  's00.safety': [{ phrase: 'keine echten Passwörter oder Varianten davon', tone: 'warning' }],
  's01.quest': [
    { phrase: 'starkes Passwort', tone: 'positive', contrastId: 'password-memory' },
    { phrase: 'merken', tone: 'accent', contrastId: 'password-memory' },
  ],
  's01.ready': [{ phrase: 'Schließen-Schaltfläche', tone: 'action' }],
  's02.master-campus': [{ phrase: 'Master-Campus-Anmeldung', tone: 'action' }],
  's02.campus-email': [{ phrase: 'Zurücksetzungslink', tone: 'action' }],
  's02.campusgram': [{ phrase: 'Direktnachricht', tone: 'action' }],
  's03.intro': [{ phrase: 'Melde dich jetzt', tone: 'action' }],
  's03.success': [{ phrase: 'wieder geöffnet', tone: 'positive' }],
  's03.assisted': [{ phrase: 'mit Unterstützung wieder geöffnet', tone: 'positive' }],
  's03.third-failed-login': [{ phrase: '„Passwort vergessen?“', tone: 'action' }],
  's03.retrieval-help': [
    { phrase: 'stark', tone: 'positive', contrastId: 'password-memory' },
    { phrase: 'wieder abrufbar', tone: 'accent', contrastId: 'password-memory' },
  ],
  's03.completion.0': [{ phrase: 'ohne Unterstützung abrufbar', tone: 'accent' }],
  's03.completion.1': [{ phrase: 'ohne Unterstützung abrufbar', tone: 'accent' }],
  's03.completion.2': [{ phrase: 'ohne Unterstützung abrufbar', tone: 'accent' }],
  's03.completion.3': [{ phrase: 'ohne Unterstützung abrufbar', tone: 'accent' }],
  's03.warning': [{ phrase: 'Sicherheitsmeldung', tone: 'warning' }],
  's04.incident': [
    { phrase: 'Datenleck', tone: 'warning', contrastId: 'incident-risk' },
    { phrase: 'schwer', tone: 'warning', contrastId: 'incident-risk' },
  ],
  's05-component-category-overview': [{ phrase: 'Bitte beachte:', tone: 'accent' }],
  's05-common-components-changes': [
    {
      phrase: 'typische Varianten',
      tone: 'accent',
      symbolSrc: typicalChangesAsset,
    },
  ],
  's05-common-components-intro': [
    {
      phrase: 'häufig verwendete Passwörter und Zeichenfolgen',
      tone: 'accent',
      symbolSrc: commonCoresAsset,
    },
  ],
  's05-personal-details-opening': [
    {
      phrase: 'Persönliche Angaben',
      tone: 'accent',
      symbolSrc: personalDetailsAsset,
    },
  ],
  's05-personal-details-examples': [
    {
      phrase: 'persönliche Angaben',
      tone: 'accent',
      symbolSrc: personalDetailsAsset,
    },
  ],
  's05-personal-details-intro': [
    {
      phrase: 'persönlichen Angaben',
      tone: 'accent',
      symbolSrc: personalDetailsAsset,
    },
  ],
  's05-account-context-opening': [
    {
      phrase: 'Bezug zum Konto, Dienst oder Umfeld',
      tone: 'accent',
      symbolSrc: accountContextAsset,
    },
  ],
  's05-account-context-intro': [
    {
      phrase: 'möglichen Bezug zu Campusgram.',
      tone: 'accent',
      symbolSrc: accountContextAsset,
    },
  ],
  's05-components-summary': [],
  's05-structure-theme-guessing': [
    { phrase: 'naheliegender der Zusammenhang', tone: 'accent' },
  ],
  's05-structure-sentence-guessing': [
    { phrase: 'Redewendungen', tone: 'accent', contrastId: 'familiar-phrases' },
    { phrase: 'Liedzeilen', tone: 'accent', contrastId: 'familiar-phrases' },
    {
      phrase: 'naheliegende Formulierungen',
      tone: 'accent',
      contrastId: 'familiar-phrases',
    },
  ],
  's05-structure-repetition-guessing': [
    { phrase: 'Wiederholungsmuster', tone: 'accent' },
  ],
  's05-structure-intro': [{ phrase: 'typische Muster', tone: 'accent' }],
  's05-passphrase-generator': [{ phrase: 'Wichtig', tone: 'accent' }],
  's05-free-search-transition': [
    { phrase: 'alle möglichen Zeichenkombinationen durchprobieren', tone: 'accent' },
  ],
  's05-character-mix-comparison': [{ phrase: 'zufällig erzeugten', tone: 'accent' }],
  's05-character-mix-strategy': [{ phrase: 'keine gute Strategie.', tone: 'warning' }],
  's05-character-mix-takeaway': [
    { phrase: 'die Länge', tone: 'accent' },
  ],
  's05-character-mix-types': [
    { phrase: 'wirklich zufällig', tone: 'accent' },
  ],
  's05-estimate': [
    { phrase: 'zufällig', tone: 'accent', contrastId: 'estimate-threshold' },
    { phrase: 'welcher Länge', tone: 'accent', contrastId: 'estimate-threshold' },
    { phrase: 'zu aufwendig', tone: 'accent', contrastId: 'estimate-threshold' },
  ],
};

export function passWoSpeechEmphasisFor(
  speechId: string,
): readonly PassWoSpeechEmphasis[] {
  return emphasisBySpeechId[speechId] ?? noEmphasis;
}

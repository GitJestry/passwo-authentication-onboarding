import accountContextAsset from '../../assets/s05/category-logos/account-context.webp';
import commonCoresAsset from '../../assets/s05/category-logos/common-cores.webp';
import personalDetailsAsset from '../../assets/s05/category-logos/personal-details.webp';
import typicalChangesAsset from '../../assets/s05/category-logos/typical-changes.webp';

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
    { phrase: 'starkes Passwort', tone: 'positive', contrastId: 'password-memory' },
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
  's03.intro-help': [
    { phrase: 'Melde dich jetzt', tone: 'action', contrastId: 's03-intro-help-actions' },
    {
      phrase: '„Passwort vergessen?“',
      tone: 'action',
      contrastId: 's03-intro-help-actions',
    },
  ],
  's03.success': [{ phrase: 'wieder geöffnet', tone: 'positive' }],
  's03.third-failed-login': [{ phrase: '„Passwort vergessen?“', tone: 'action' }],
  's03.retrieval-help': [
    { phrase: 'starkes', tone: 'positive', contrastId: 'password-memory' },
    { phrase: 'wieder abrufen', tone: 'accent', contrastId: 'password-memory' },
  ],
  's03.warning': [{ phrase: 'Sicherheitsmeldung', tone: 'warning' }],
  's04.incident': [{ phrase: 'Datenleck', tone: 'warning' }],
  's05-component-category-overview': [{ phrase: 'Bitte beachte:', tone: 'accent' }],
  's05-common-components-changes': [
    {
      phrase: 'typische Varianten',
      tone: 'accent',
      symbolSrc: typicalChangesAsset,
    },
  ],
  's05-common-components-examples': [{ phrase: 'Geläufige Wörter', tone: 'accent' }],
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
    { phrase: 'Name', tone: 'accent', contrastId: 'personal-detail-examples' },
    { phrase: 'Geburtsdatum', tone: 'accent', contrastId: 'personal-detail-examples' },
    { phrase: 'Interessen', tone: 'accent', contrastId: 'personal-detail-examples' },
  ],
  's05-personal-details-intro': [
    {
      phrase: 'persönliche Angaben',
      tone: 'accent',
      symbolSrc: personalDetailsAsset,
    },
  ],
  's05-account-context-opening': [
    {
      phrase: 'Bezug zum Konto, zum Dienst oder zu dessen Umfeld',
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
  ],
  's05-structure-repetition-guessing': [
    { phrase: 'Wiederholungsmuster', tone: 'accent' },
  ],
  's05-structure-intro': [{ phrase: 'typische Muster', tone: 'accent' }],
  's05-character-mix-first': [{ phrase: 'zufällig erzeugten', tone: 'accent' }],
  's05-character-mix-types': [{ phrase: 'riskant', tone: 'warning' }],
  's05-character-mix-strategy': [{ phrase: 'vor allem auf Länge', tone: 'accent' }],
  's05-character-mix-takeaway': [
    { phrase: 'zufälligen Kleinbuchstaben', tone: 'accent' },
  ],
  's05-estimate': [
    { phrase: 'welcher Länge', tone: 'accent', contrastId: 'estimate-threshold' },
    { phrase: 'zu aufwendig', tone: 'accent', contrastId: 'estimate-threshold' },
  ],
  's05-length-orientation': [{ phrase: 'mindestens 15 Zeichen', tone: 'accent' }],
  's05-length-full-word-attack': [
    { phrase: 'ein einzelnes deutsches Wort', tone: 'accent' },
  ],
  's05-length-takeaway': [{ phrase: 'schnell länger als 15 Zeichen', tone: 'accent' }],
  's05-length-second-reason-transition': [],
  's05-length-four-german-words': [
    { phrase: 'noch weiter erschweren', tone: 'accent' },
  ],
  's05-length-language-pool-stack': [
    { phrase: 'Auswahl pro Wort', tone: 'accent' },
  ],
  's05-length-multilingual-words': [
    { phrase: 'vervierfacht sich die Auswahl', tone: 'accent' },
  ],
  's05-length-fifth-word-comparison': [
    { phrase: 'zwei weitere zufällige Wörter', tone: 'accent' },
  ],
  's05-final-components': [{ phrase: 'gesamte Zeichenfolge', tone: 'accent' }],
  's05-final-result': [{ phrase: 'gesamte Zeichenfolge', tone: 'warning' }],
  's05-final-length': [{ phrase: 'mindestens 15 Zeichen', tone: 'accent' }],
  's05-final-spread': [
    { phrase: 'wiederverwendet oder nur leicht verändert', tone: 'warning' },
  ],
  's06.transition.s07': [
    { phrase: 'zügig ersetzen und Wiederverwendung stoppen', tone: 'accent' },
  ],
  's07-campusgram-success': [
    {
      phrase: 'Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.',
      tone: 'positive',
    },
  ],
  's07-method-intro': [{ phrase: 'Die Passphrase', tone: 'accent' }],
  's07-mnemonic': [{ phrase: 'Beispiel:', tone: 'accent' }],
  's09-scaling-expansion': [{ phrase: 'deutlich mehr', tone: 'accent' }],
  's09-scaling-question': [
    {
      phrase: '80 starke und einzigartige Passwörter dauerhaft zu merken',
      tone: 'accent',
    },
  ],
  's09-scaling-risks': [{ phrase: 'Risiken', tone: 'warning' }],
  's09-scaling-solution': [
    {
      phrase: 'Du musst dir all diese Passwörter auch gar nicht selbst merken.',
      tone: 'positive',
    },
  ],
};

export function passWoSpeechEmphasisFor(
  speechId: string,
): readonly PassWoSpeechEmphasis[] {
  return emphasisBySpeechId[speechId] ?? noEmphasis;
}

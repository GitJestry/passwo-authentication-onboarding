import accountContextAsset from '../../assets/s05/category-logos/account-context.webp';
import commonCoresAsset from '../../assets/s05/category-logos/common-cores.webp';
import personalDetailsAsset from '../../assets/s05/category-logos/personal-details.webp';
import typicalChangesAsset from '../../assets/s05/category-logos/typical-changes.webp';
import samePasswordAsset from '../../assets/password-relations/same.png';
import similarPasswordAsset from '../../assets/password-relations/similar.png';

export type PassWoSpeechEmphasisTone =
  | 'accent'
  | 'positive'
  | 'warning'
  | 'action'
  | 'mfa'
  | 'master-campus'
  | 'campus-email'
  | 'campusgram';

export interface PassWoSpeechEmphasis {
  readonly phrase: string;
  readonly tone: PassWoSpeechEmphasisTone;
  readonly symbolId?: string;
  readonly symbolSrc?: string;
  readonly symbolSize?: 'standard' | 'wide' | 'large';
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
      phrase: 'typischen Abwandlungen',
      tone: 'accent',
      symbolSrc: typicalChangesAsset,
      symbolSize: 'wide',
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
  's05-free-search-transition': [
    { phrase: 'alle möglichen Zeichenfolgen durchprobieren', tone: 'accent' },
  ],
  's05-character-mix-first': [{ phrase: 'zufällig erzeugten', tone: 'accent' }],
  's05-character-mix-types': [{ phrase: 'riskant', tone: 'warning' }],
  's05-character-mix-strategy': [{ phrase: 'vor allem auf die Länge', tone: 'accent' }],
  's05-character-mix-takeaway': [
    { phrase: 'zufälligen Kleinbuchstaben', tone: 'accent' },
  ],
  's05-estimate': [
    { phrase: 'welcher Länge', tone: 'accent', contrastId: 'estimate-threshold' },
    { phrase: 'zu aufwendig', tone: 'accent', contrastId: 'estimate-threshold' },
  ],
  's05-length-orientation': [{ phrase: 'mindestens 15 Zeichen lang', tone: 'accent' }],
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
  's05-length-character-comparison': [
    { phrase: '16 zufällige Kleinbuchstaben', tone: 'accent' },
  ],
  's05-length-character-takeaway': [
    { phrase: 'nicht vorhersehbar', tone: 'warning' },
  ],
  's05-length-passphrase-outlook': [
    { phrase: 'sechs zufälligen Wörtern', tone: 'accent' },
  ],
  's05-final-components': [{ phrase: 'gesamte Zeichenfolge', tone: 'accent' }],
  's05-final-result': [{ phrase: 'gesamte Zeichenfolge', tone: 'warning' }],
  's05-final-length': [{ phrase: 'mindestens 15 Zeichen', tone: 'accent' }],
  's05-final-spread': [
    {
      phrase: 'dasselbe',
      tone: 'warning',
      symbolSrc: samePasswordAsset,
      contrastId: 'password-reuse-pattern',
    },
    {
      phrase: 'leicht abgewandelt',
      tone: 'warning',
      symbolSrc: similarPasswordAsset,
      contrastId: 'password-reuse-pattern',
    },
  ],
  's06.transition.s07': [
    { phrase: 'zügig ersetzen und für jedes Konto ein eigenes Passwort verwenden', tone: 'accent' },
  ],
  's07-campusgram-success': [
    {
      phrase: 'Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.',
      tone: 'positive',
    },
  ],
  's07-method-intro': [{ phrase: 'Passphrase', tone: 'accent' }],
  's07-mnemonic': [{ phrase: 'Beispiel:', tone: 'accent' }],
  's09-scaling-expansion': [{ phrase: '134 Online-Diensten', tone: 'accent' }],
  's09-scaling-question': [
    {
      phrase:
        '80 Konten jeweils ein starkes, eigenes Passwort dauerhaft im Kopf zu behalten?',
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
  's12-manager-intro': [
    { phrase: 'erzeugen, speichern und beim Anmelden wieder ausfüllen', tone: 'accent' },
  ],
  's12-manager-generate': [
    { phrase: 'langes, zufälliges Passwort', tone: 'accent' },
  ],
  's12-manager-store': [
    { phrase: 'welches Passwort zu welchem Konto gehört', tone: 'accent' },
  ],
  's12-manager-fill': [
    { phrase: 'passenden gespeicherten Eintrag', tone: 'positive' },
  ],
  's12-manager-access': [
    { phrase: 'Zugang zu deinem Passwortmanager', tone: 'accent' },
  ],
  's12-manager-variants': [{ phrase: 'bereits einen Passwortmanager', tone: 'accent' }],
  's12-manager-separate': [{ phrase: 'Masterpasswort', tone: 'warning' }],
  's12-manager-integrated': [
    { phrase: 'Geräte- oder Plattformzugang', tone: 'accent' },
  ],
  's12-manager-practice': [
    {
      phrase: 'MyShop',
      tone: 'action',
      symbolId: 'my-shop',
      symbolSize: 'large',
    },
  ],
  's13-network-new-account': [
    { phrase: 'eigenen starken Passwort', tone: 'positive' },
  ],
  's13-network-existing-account': [
    { phrase: 'vorhandene Zugangsdaten auch importieren', tone: 'accent' },
  ],
  's13-network-unchanged': [{ phrase: 'noch nicht', tone: 'warning' }],
  's13-network-reused-password': [
    {
      phrase: 'Muster Bank',
      tone: 'positive',
      symbolId: 'muster-bank',
      symbolSize: 'large',
    },
  ],
  's13-network-replace-at-service': [
    {
      phrase: 'Muster Bank',
      tone: 'positive',
      symbolId: 'muster-bank',
      contrastId: 's13-bank-settings',
    },
    {
      phrase: 'Einstellungen',
      tone: 'action',
      symbolId: 'settings',
      symbolSize: 'large',
      contrastId: 's13-bank-settings',
    },
  ],
  's13-network-bank-password-changed': [
    {
      phrase: 'Passphrase ist bereits im Passwortmanager gespeichert',
      tone: 'accent',
    },
  ],
  's13-campusgram-autofill-unavailable': [
    {
      phrase: 'Bei Campusgram klappt das Ausfüllen hier nicht.',
      tone: 'accent',
    },
  ],
  's13-campusgram-copy-instruction': [
    {
      phrase: 'Browser-Einstellungen',
      tone: 'action',
      symbolId: 'browser-menu',
      symbolSize: 'large',
      contrastId: 's13-campusgram-manual-copy',
    },
    {
      phrase: 'kopiere',
      tone: 'action',
      contrastId: 's13-campusgram-manual-copy',
    },
  ],
  's13-campusgram-complete': [
    { phrase: 'selbst kopieren und einsetzen', tone: 'action' },
  ],
  's13-conclusion-remaining-accounts-pace': [
    { phrase: 'nach und nach ändern', tone: 'accent' },
  ],
  's13-conclusion-variant-return': [{ phrase: 'zu deinem Alltag passt', tone: 'accent' }],
  's13-conclusion-variant-fit': [
    { phrase: 'zu deinen Geräten und deinem Alltag passt', tone: 'accent' },
  ],
  's13-conclusion-recovery-lost': [
    { phrase: 'nicht automatisch', tone: 'accent' },
  ],
  's13-conclusion-recovery-path': [
    { phrase: 'auf einem neuen Gerät wieder zu nutzen', tone: 'accent' },
  ],
  's13-conclusion-recovery-restored': [
    { phrase: 'Schau bei deinem eigenen nach', tone: 'action' },
  ],
  's13-conclusion-network-repaired': [
    { phrase: 'eigenes starkes Passwort', tone: 'positive' },
  ],
  's13-conclusion-mfa-password-insufficient': [
    { phrase: 'sehr starkes Passwort allein nicht mehr aus.', tone: 'warning' },
  ],
  's13-conclusion-mfa-second-hurdle': [{ phrase: 'zweite Hürde', tone: 'accent' }],
  's13-bank-autofill-explanation': [
    { phrase: 'direkt ausgefüllt', tone: 'positive' },
  ],
  's14-mfa': [{ phrase: 'mehrere unterschiedliche Faktoren', tone: 'accent' }],
  's14-two-factor': [
    { phrase: 'genau zwei unterschiedliche Faktoren', tone: 'accent' },
  ],
  's14-factor-knowledge': [{ phrase: 'Wissen', tone: 'accent' }],
  's14-factor-possession': [{ phrase: 'Besitz', tone: 'accent' }],
  's14-factor-biometrics': [{ phrase: 'Biometrie', tone: 'accent' }],
  's14-distinct-factors': [{ phrase: 'unterschiedlich', tone: 'accent' }],
  's14-service-variation': [
    { phrase: 'bei jedem Dienst etwas anders', tone: 'accent' },
  ],
  's14-find-availability': [
    { phrase: 'Finde zuerst heraus', tone: 'action' },
  ],
  's14-help-found': [{ phrase: 'Master Campus', tone: 'action' }],
  's14-mfa-configured': [
    {
      phrase: 'Zwei-Faktor-Authentifizierung für Master Campus eingerichtet',
      tone: 'positive',
    },
  ],
  's14-close-after-login': [
    { phrase: 'Schließe den Browser noch einmal', tone: 'action' },
  ],
  's15-mfa-second-factor': [{ phrase: 'zweiten Faktor', tone: 'mfa' }],
  's17-mfa-how-to': [
    { phrase: 'Bei anderen Konten kannst du genauso vorgehen:', tone: 'accent' },
  ],
  's17-integrated-summary': [
    { phrase: 'eigene', tone: 'positive', contrastId: 'integrated-protection-summary' },
    { phrase: 'starke', tone: 'accent', contrastId: 'integrated-protection-summary' },
    {
      phrase: 'reicht das Passwort für den Angreifer allein nicht mehr aus.',
      tone: 'mfa',
      contrastId: 'integrated-protection-summary',
    },
  ],
};

export function passWoSpeechEmphasisFor(
  speechId: string,
): readonly PassWoSpeechEmphasis[] {
  return emphasisBySpeechId[speechId] ?? noEmphasis;
}

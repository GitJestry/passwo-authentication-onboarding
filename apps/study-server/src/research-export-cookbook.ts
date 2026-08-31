import {
  FOLLOW_UP_INSTRUMENT_ID,
  FOLLOW_UP_SECTION_ID,
  followUpInstrument,
  instrumentRuntimeManifest,
  type ResearchExportDataDictionaryRecord,
  type ResearchExportGuideRecord,
  type ResearchExportProfile,
  researchExportDataDictionaryRecordSchema,
  researchExportGuideRecordSchema,
} from '@passwo/contracts';

interface DictionaryItem {
  readonly id: string;
  readonly type: string;
  readonly prompt?: string | undefined;
  readonly label?: string | undefined;
  readonly left?: string | undefined;
  readonly right?: string | undefined;
  readonly scale?: string | undefined;
  readonly min?: number | undefined;
  readonly max?: number | undefined;
  readonly maxLength?: number | undefined;
  readonly participantOptional?: true | undefined;
  readonly displayWhen?:
    | {
        readonly itemId: string;
        readonly contains?: string | undefined;
        readonly equals?: string | undefined;
      }
    | undefined;
  readonly options?: readonly { readonly id: string; readonly label: string }[] | undefined;
}

interface VariableGroupDefinition {
  readonly id: string;
  readonly label: string;
  readonly analysisRole: string;
  readonly interpretation: string;
  readonly aggregationRule: string;
  readonly source: string;
}

const variableGroups = {
  background: {
    id: 'participant-background',
    label: 'Hintergrundmerkmale',
    analysisRole: 'descriptive-background',
    interpretation:
      'Deskriptive Hintergrundvariable und potenzieller Quasi-Identifikator; kein Outcome der Intervention.',
    aggregationRule:
      'Kategorien itemweise berichten. Keine gemeinsame Skala bilden; Kombinationen vor einer Archivfreigabe gemäß Data Contract prüfen.',
    source: 'docs/research/MEASUREMENT-INSTRUMENT.md; docs/research/DATA-CONTRACT.md',
  },
  experience: {
    id: 'prior-authentication-experience',
    label: 'Vorerfahrung mit Authentifizierungsschutz',
    analysisRole: 'descriptive-background',
    interpretation:
      'Selbstberichtete Vorerfahrung vor dem Lernangebot; keine objektive Kompetenz- oder Nutzungsbeobachtung.',
    aggregationRule:
      'Items getrennt als Kategorien berichten. PRE_PM_USE ist eine Mehrfachauswahl und wird nicht zu einem Nutzungswert verdichtet.',
    source: 'docs/research/MEASUREMENT-INSTRUMENT.md',
  },
  panasPositive: {
    id: 'panas-positive-affect',
    label: 'PANAS Positive Affect',
    analysisRole: 'standardized-scale-item',
    interpretation:
      'Unmittelbarer positiver Affekt mit Bezug auf die Bearbeitung des Lernangebots; getrennt von Negative Affect.',
    aggregationRule:
      'Die zehn zugeordneten Items nach der publizierten deutschen PANAS-Anleitung zu einem Positive-Affect-Skalenwert zusammenführen. Keinen Gesamt- oder Differenzscore mit Negative Affect bilden.',
    source: 'German PANAS; docs/research/MEASUREMENT-INSTRUMENT.md',
  },
  panasNegative: {
    id: 'panas-negative-affect',
    label: 'PANAS Negative Affect',
    analysisRole: 'standardized-scale-item',
    interpretation:
      'Unmittelbarer negativer Affekt mit Bezug auf die Bearbeitung des Lernangebots; getrennt von Positive Affect.',
    aggregationRule:
      'Die zehn zugeordneten Items nach der publizierten deutschen PANAS-Anleitung zu einem Negative-Affect-Skalenwert zusammenführen. Keinen Gesamt- oder Differenzscore mit Positive Affect bilden.',
    source: 'German PANAS; docs/research/MEASUREMENT-INSTRUMENT.md',
  },
  duration: {
    id: 'subjective-time-judgements',
    label: 'Subjektive Zeiturteile',
    analysisRole: 'single-outcome',
    interpretation:
      'Subjektive Dauer und Angemessenheit der Dauer sind zwei getrennte Outcomes und von der objektiven Artefaktdauer zu trennen.',
    aggregationRule:
      'Beide Items einzeln als vollständige Verteilung auswerten. Keinen Diskrepanz-, Quotienten- oder gemeinsamen Zeitscore bilden.',
    source: 'docs/research/MEASUREMENT-INSTRUMENT.md',
  },
  ueqsPragmatic: {
    id: 'ueqs-pragmatic-quality',
    label: 'UEQ-S Pragmatic Quality',
    analysisRole: 'standardized-scale-item',
    interpretation:
      'Standardisierte pragmatische UX-Qualität; nicht als thesis-spezifische Supportiveness interpretieren.',
    aggregationRule:
      'Die vier PQ-Items nach der offiziellen UEQ-S-Anleitung transformieren und als eigene Skala berechnen. Nicht mit Hedonic Quality zusammenführen.',
    source: 'UEQ-S official German items; docs/research/MEASUREMENT-INSTRUMENT.md',
  },
  ueqsHedonic: {
    id: 'ueqs-hedonic-quality',
    label: 'UEQ-S Hedonic Quality',
    analysisRole: 'standardized-scale-item',
    interpretation: 'Standardisierte hedonische UX-Qualität, getrennt von Pragmatic Quality.',
    aggregationRule:
      'Die vier HQ-Items nach der offiziellen UEQ-S-Anleitung transformieren und als eigene Skala berechnen. Nicht mit Pragmatic Quality zusammenführen.',
    source: 'UEQ-S official German items; docs/research/MEASUREMENT-INSTRUMENT.md',
  },
  contentTrustworthiness: {
    id: 'ueqplus-content-trustworthiness',
    label: 'UEQ+ Trustworthiness of Content',
    analysisRole: 'standardized-scale-item',
    interpretation: 'Standardisierte Bewertung der Inhaltsseriosität des Lernangebots.',
    aggregationRule:
      'Die vier Items nach der offiziellen UEQ+-Anleitung transformieren und als separate Skala berechnen. Keine Importance-Gewichtung anwenden.',
    source:
      'UEQ+ Trustworthiness of Content official German items; docs/research/MEASUREMENT-INSTRUMENT.md',
  },
  designDiagnostics: {
    id: 'design-diagnostic-single-items',
    label: 'Design-diagnostische Einzelindikatoren',
    analysisRole: 'single-outcome',
    interpretation:
      'Wörtlich begrenzte Wahrnehmungsindikatoren; keine validierten latenten Konstrukte und keine kausale Zuordnung zu einzelnen Interfaceelementen.',
    aggregationRule:
      'Alle zwölf Items einzeln auswerten. Keinen Translation-Focus-, Supportiveness-, Consequence-, Manageability- oder sonstigen Gruppenscore bilden.',
    source: 'docs/research/MEASUREMENT-INSTRUMENT.md; docs/research/RESEARCH-GUARDRAILS.md',
  },
  riskPresentation: {
    id: 'risk-presentation-judgement',
    label: 'Wahrgenommene Risikodarstellung',
    analysisRole: 'single-outcome',
    interpretation:
      'Subjektives Mittelpunkturteil zur Risikodarstellung; keine objektive Kalibrierung der Risiken.',
    aggregationRule: 'Als einzelnes ordinales Item auswerten; keinen Gruppenscore bilden.',
    source: 'docs/research/MEASUREMENT-INSTRUMENT.md; docs/research/RESEARCH-GUARDRAILS.md',
  },
  understanding: {
    id: 'perceived-understanding',
    label: 'Wahrgenommenes globales Verstehen',
    analysisRole: 'single-outcome',
    interpretation:
      'Subjektives globales Verstehen; getrennt vom kriteriumsbezogenen Understanding Guardrail.',
    aggregationRule:
      'Als einzelnes ordinales Item auswerten; nicht mit Guardrail-Antworten kombinieren.',
    source: 'docs/research/MEASUREMENT-INSTRUMENT.md; docs/research/RESEARCH-GUARDRAILS.md',
  },
  selfEfficacy: {
    id: 'post-guardrail-self-efficacy',
    label: 'Aufgabenspezifische Selbstwirksamkeit nach dem Guardrail',
    analysisRole: 'exploratory-self-efficacy',
    interpretation:
      'Explorative Konfidenzurteile nach Artefakt und gemeinsamem Guardrail; keine Baseline und kein Veränderungsmaß.',
    aggregationRule:
      'Alle vier Aufgaben einzeln auswerten. Keinen Mittel-, Summen- oder Veränderungsscore bilden.',
    source: 'docs/research/MEASUREMENT-INSTRUMENT.md; docs/research/RESEARCH-GUARDRAILS.md',
  },
  secawareExposure: {
    id: 'prior-secaware-exposure',
    label: 'Retrospektive SecAware.NRW-Vorerfahrung',
    analysisRole: 'descriptive-sensitivity-variable',
    interpretation:
      'Retrospektiver Selbstbericht über den Zustand vor der heutigen Teilnahme; keine objektiv verifizierte Nutzung.',
    aggregationRule:
      'Kategorien nur für Berichterstattung und die vorab festgelegte vorsichtig interpretierte Sensitivitätsanalyse verwenden.',
    source: 'docs/research/MEASUREMENT-INSTRUMENT.md',
  },
  guardrailScenarios: {
    id: 'understanding-guardrail-scenarios',
    label: 'Understanding Guardrail – Anwendungsszenarien',
    analysisRole: 'guardrail-scenario',
    interpretation:
      'Zentraler kriteriumsbezogener Security Safeguard für unmittelbar dokumentierte gemeinsame Claims; kein individueller Wissenszuwachs ohne Pretest.',
    aggregationRule:
      'Jedes Item mit allen Kategorien separat berichten. Kein Pass/Fail, kein Guardrail-Gesamt- oder Unsafe-Summenwert und keine Reliabilitätsanalyse.',
    source: 'docs/research/GUARDRAIL-CONTENT-AUDIT.md; docs/research/MEASUREMENT-INSTRUMENT.md',
  },
  guardrailRecognition: {
    id: 'understanding-guardrail-recognition',
    label: 'Understanding Guardrail – Recognition',
    analysisRole: 'guardrail-recognition',
    interpretation:
      'Explorative Recognition-Fragen zu dokumentierten gemeinsamen Claims; kein allgemeines Maß für Authentifizierungsexpertise.',
    aggregationRule:
      'Jedes Item mit allen Kategorien separat berichten. Kein Pass/Fail, kein Guardrail-Gesamt- oder Unsafe-Summenwert und keine Reliabilitätsanalyse.',
    source: 'docs/research/GUARDRAIL-CONTENT-AUDIT.md; docs/research/MEASUREMENT-INSTRUMENT.md',
  },
  followUpActions: {
    id: 'follow-up-self-reported-actions',
    label: 'Nachbefragung – selbstberichtete Schutzhandlungen',
    analysisRole: 'exploratory-follow-up-action',
    interpretation:
      'Ancillary-exploratory, kurzfristige selbstberichtete Handlungen unter Follow-up-Respondern; kein objektiver Nachweis und keine langfristige Verhaltensänderung.',
    aggregationRule:
      'Die drei Handlungen separat als Ja, Nein oder Unsicher berichten. Unsicher nicht als Nein codieren; Nonresponse bleibt fehlend. Keinen kombinierten Behavior Score bilden.',
    source: 'docs/research/MEASUREMENT-INSTRUMENT.md; docs/research/RESEARCH-GUARDRAILS.md',
  },
  followUpReasons: {
    id: 'follow-up-no-action-reasons',
    label: 'Nachbefragung – Gründe bei Nein',
    analysisRole: 'descriptive-follow-up-reason',
    interpretation:
      'Optionaler handlungsspezifischer deskriptiver Kontext, nur wenn die zugehörige Handlung mit Nein beantwortet wurde.',
    aggregationRule:
      'Gründe je Handlung separat deskriptiv berichten. Keine Barrierenskala bilden; fehlende optionale Gründe nicht als eigene Kategorie umcodieren.',
    source: 'docs/research/MEASUREMENT-INSTRUMENT.md; docs/research/RESEARCH-GUARDRAILS.md',
  },
} satisfies Readonly<Record<string, VariableGroupDefinition>>;

const positiveAffectItemIds = new Set([
  'PANAS_01',
  'PANAS_03',
  'PANAS_04',
  'PANAS_06',
  'PANAS_10',
  'PANAS_11',
  'PANAS_13',
  'PANAS_15',
  'PANAS_17',
  'PANAS_18',
]);

const appropriateGuardrailOptionIds: Readonly<Record<string, string>> = {
  SC_DISTINCT_PASSWORDS: 'own_strong_each',
  SC_PM_MANY_ACCOUNTS: 'pm_generate_store_organize',
  SC_LAYERED_PROTECTION: 'unique_and_mfa',
  MR_DISTINCT_PASSWORDS: 'own_strong_each',
  MR_PASSWORD_MANAGER: 'generate_store_organize',
  MR_MFA: 'password_plus_other_category',
};

function variableGroup(
  instrumentId: string,
  sectionId: string,
  itemId: string,
): VariableGroupDefinition {
  if (instrumentId === 'pre-v1') {
    if (sectionId === 'sample') return variableGroups.background;
    if (sectionId === 'experience') return variableGroups.experience;
  }
  if (instrumentId === 'post-v1') {
    if (sectionId === 'panas') {
      return positiveAffectItemIds.has(itemId)
        ? variableGroups.panasPositive
        : variableGroups.panasNegative;
    }
    if (sectionId === 'duration') return variableGroups.duration;
    if (sectionId === 'ueqs') {
      return itemId.startsWith('UEQS_PQ')
        ? variableGroups.ueqsPragmatic
        : variableGroups.ueqsHedonic;
    }
    if (sectionId === 'content_trustworthiness') return variableGroups.contentTrustworthiness;
    if (sectionId === 'design_diagnostics') return variableGroups.designDiagnostics;
    if (sectionId === 'risk_understanding') {
      return itemId === 'RISK_PRESENTATION'
        ? variableGroups.riskPresentation
        : variableGroups.understanding;
    }
    if (sectionId === 'self_efficacy') return variableGroups.selfEfficacy;
    if (sectionId === 'secaware_prior_exposure') return variableGroups.secawareExposure;
  }
  if (instrumentId === 'guardrail-v2') {
    if (sectionId === 'scenarios') return variableGroups.guardrailScenarios;
    if (sectionId === 'recognition') return variableGroups.guardrailRecognition;
  }
  if (instrumentId === FOLLOW_UP_INSTRUMENT_ID && sectionId === FOLLOW_UP_SECTION_ID) {
    return itemId.endsWith('_REASON')
      ? variableGroups.followUpReasons
      : variableGroups.followUpActions;
  }
  throw new Error(`research-export-variable-group-missing-${instrumentId}-${sectionId}-${itemId}`);
}

function scaleMetadata(scaleId: string | undefined): {
  readonly minimum: number | null;
  readonly maximum: number | null;
  readonly anchors: readonly { readonly value: number; readonly label: string }[];
  readonly derivedTransform: string | null;
} {
  if (scaleId === undefined) {
    return { minimum: null, maximum: null, anchors: [], derivedTransform: null };
  }
  const scales: Readonly<
    Record<
      string,
      {
        readonly min: number;
        readonly max: number;
        readonly anchors?: Readonly<Record<string, string>> | undefined;
        readonly derivedTransform?: string | undefined;
      }
    >
  > = instrumentRuntimeManifest.scales;
  const scale = scales[scaleId];
  if (scale === undefined) {
    return { minimum: null, maximum: null, anchors: [], derivedTransform: null };
  }
  const anchors = Object.entries(scale.anchors ?? {})
    .map(([value, label]) => ({ value: Number(value), label }))
    .sort((left, right) => left.value - right.value);
  return {
    minimum: scale.min,
    maximum: scale.max,
    anchors,
    derivedTransform: scale.derivedTransform ?? null,
  };
}

function itemPrompt(item: DictionaryItem): string {
  if (item.prompt !== undefined) return item.prompt;
  if (item.label !== undefined) return item.label;
  if (item.left !== undefined && item.right !== undefined) return `${item.left} — ${item.right}`;
  throw new Error(`research-export-item-prompt-missing-${item.id}`);
}

function itemInterpretation(item: DictionaryItem): string {
  const specificNotes: Readonly<Record<string, string>> = {
    PERCEIVED_DURATION:
      'Höhere Werte bedeuten eine länger wahrgenommene Dauer, nicht höhere Qualität.',
    TIME_FIT:
      'Der Mittelpunkt 4 bedeutet „genau richtig“; höhere Werte bedeuten zunehmend zu lang und sind nicht linear als besser zu interpretieren.',
    RISK_PRESENTATION:
      'Der Mittelpunkt 4 bedeutet „angemessen“; Abweichungen nach unten und oben haben unterschiedliche Richtungen und sind nicht linear als besser zu interpretieren.',
    UNDERSTANDING_GLOBAL:
      'Höhere Werte bedeuten stärkere Zustimmung zum subjektiv wahrgenommenen Verstehen, nicht automatisch kriteriumsbezogen korrektes Verstehen.',
    PRE_SECAWARE_RETROSPECTIVE:
      'Retrospektive Vorerfahrung; nur für Berichterstattung und vorsichtige Sensitivitätsanalyse.',
    PRE_AGE:
      'Geordnete Altersgruppe, nicht exaktes Alter. „Keine Angabe“ bleibt eine explizite nicht geordnete Antwortkategorie.',
  };
  const specific = specificNotes[item.id];
  if (specific !== undefined) return specific;
  if (item.id.startsWith('PANAS_')) {
    return 'Höhere Werte bedeuten eine stärkere berichtete Intensität des einzelnen Affektadjektivs.';
  }
  if (item.type === 'semanticDifferential') {
    return 'Rohwert 1 liegt am linken, Rohwert 7 am rechten Adjektiv; für die standardisierte Auswertung gilt die Manifest-Transformation value - 4.';
  }
  if (item.scale === 'confidence11') {
    return 'Höhere Werte bedeuten höhere aufgabenspezifische Zuversicht; das Item bleibt ein separates exploratives Outcome.';
  }
  if (item.scale === 'agreement7') {
    return 'Höhere Werte bedeuten stärkere Zustimmung zum exakten Itemwortlaut; daraus folgt keine weitergehende Konstrukt- oder Kausalinterpretation.';
  }
  if (item.type === 'multiChoice') {
    return 'Ungeordnete Mehrfachauswahl als JSON-Array von optionId-Werten; exklusive Optionen bleiben eigenständige Kategorien.';
  }
  if (item.type === 'text') {
    return 'Optionaler Freitext; im Analyseprofil nicht aktiv enthalten, sondern ausschließlich in der getrennten Freitextprüfung.';
  }
  return 'Nominal codierte Kategorie anhand optionId und optionLabel; „Unsicher“ oder „Keine Angabe“ sind explizite Kategorien und keine fehlenden Werte.';
}

function measurementLevel(
  item: DictionaryItem,
): 'nominal' | 'ordinal' | 'free-text' {
  if (item.type === 'text') return 'free-text';
  if (
    item.id === 'PRE_AGE' ||
    item.type === 'scale' ||
    item.type === 'semanticDifferential' ||
    item.type === 'integer'
  ) {
    return 'ordinal';
  }
  return 'nominal';
}

function optionClassification(
  instrumentId: string,
  itemId: string,
  optionId: string | null,
): 'appropriate' | 'incomplete-or-unsafe' | 'uncertain' | null {
  if (instrumentId !== 'guardrail-v2' || optionId === null) return null;
  if (optionId === 'unsure') return 'uncertain';
  const appropriateOptionId = appropriateGuardrailOptionIds[itemId];
  if (appropriateOptionId === undefined) {
    throw new Error(`research-export-guardrail-classification-missing-${itemId}`);
  }
  return appropriateOptionId === optionId ? 'appropriate' : 'incomplete-or-unsafe';
}

function missingValueRule(item: DictionaryItem): string {
  if (item.displayWhen !== undefined) {
    const trigger = item.displayWhen.contains ?? item.displayWhen.equals;
    return `Nur bei ${item.displayWhen.itemId} = ${trigger ?? 'definiertem Trigger'} angezeigt; null oder fehlend ist keine Antwortkategorie und kann „nicht angezeigt“ oder „optional unbeantwortet“ bedeuten.`;
  }
  if (item.participantOptional === true) {
    return 'Optionales Item; null oder fehlend bleibt fehlend und wird nicht als inhaltliche Kategorie umcodiert.';
  }
  return 'Pflichtitem innerhalb des eingereichten Instrumentblocks. Eine fehlende Zeile bedeutet einen nicht eingereichten Block beziehungsweise beim Follow-up Nonresponse und darf nicht als Antwortkategorie codiert werden.';
}

function dictionaryRowsForItems(
  instrumentId: string,
  sectionId: string,
  sectionSource: string | undefined,
  items: readonly DictionaryItem[],
): ResearchExportDataDictionaryRecord[] {
  return items.flatMap((item) => {
    const scale = scaleMetadata(item.scale);
    const group = variableGroup(instrumentId, sectionId, item.id);
    const options = item.options ?? [null];
    return options.map((option) => {
      const optionId = option?.id ?? null;
      return researchExportDataDictionaryRecordSchema.parse({
        instrumentId,
        sectionId,
        variableGroupId: group.id,
        variableGroupLabel: group.label,
        itemId: item.id,
        itemPrompt: itemPrompt(item),
        responseType: item.type === 'conditionalSingleChoice' ? 'singleChoice' : item.type,
        measurementLevel: measurementLevel(item),
        analysisRole: group.analysisRole,
        required: item.participantOptional !== true && item.displayWhen === undefined,
        minimum: item.min ?? scale.minimum,
        maximum: item.max ?? scale.maximum,
        maxLength: item.maxLength ?? null,
        scaleId: item.scale ?? null,
        scaleAnchors: scale.anchors,
        derivedTransform: scale.derivedTransform,
        optionId,
        optionLabel: option?.label ?? null,
        optionClassification: optionClassification(instrumentId, item.id, optionId),
        displayWhenItemId: item.displayWhen?.itemId ?? null,
        displayWhenValue: item.displayWhen?.contains ?? item.displayWhen?.equals ?? null,
        missingValueRule: missingValueRule(item),
        source: sectionSource ?? group.source,
        itemInterpretation: itemInterpretation(item),
        groupInterpretation: group.interpretation,
        aggregationRule: group.aggregationRule,
      });
    });
  });
}

export function createResearchDataDictionary(): ResearchExportDataDictionaryRecord[] {
  const pre = instrumentRuntimeManifest.instruments['pre-v1'].sections.flatMap((section) =>
    dictionaryRowsForItems('pre-v1', section.id, section.source, section.items),
  );
  const post = instrumentRuntimeManifest.instruments['post-v1'].sections.flatMap((section) =>
    dictionaryRowsForItems('post-v1', section.id, section.source, section.items),
  );
  const guardrail = instrumentRuntimeManifest.instruments['guardrail-v2'].blocks.flatMap((block) =>
    dictionaryRowsForItems(
      'guardrail-v2',
      block.id,
      'docs/research/GUARDRAIL-CONTENT-AUDIT.md',
      block.items.map((item) => ({ ...item, type: 'singleChoice' })),
    ),
  );
  const followUp = dictionaryRowsForItems(
    FOLLOW_UP_INSTRUMENT_ID,
    FOLLOW_UP_SECTION_ID,
    'docs/research/MEASUREMENT-INSTRUMENT.md; docs/research/RESEARCH-GUARDRAILS.md',
    followUpInstrument.questionnaire.items,
  );
  return [...pre, ...post, ...guardrail, ...followUp];
}

export function createResearchExportGuide(
  profile: ResearchExportProfile,
): ResearchExportGuideRecord[] {
  const profileNote =
    profile === 'audit'
      ? 'Auditprofil: enthält alle exportierbaren Sitzungen, technische Kalenderzeitpunkte und zulässige Freitexte zur geschützten Datenprüfung.'
      : 'Analyseprofil: enthält ausschließlich completed Runs, entfernt exakte Kalenderzeitpunkte aus den Analysedateien und lagert vorhandene Freitexte in die Freitextprüfung aus.';
  const records = [
    {
      entryType: 'overview',
      entryId: 'export-profile',
      title: 'Exportprofil und Schutzstatus',
      relatedFile: 'manifest.json',
      recordDefinition: profileNote,
      joinRule: 'Das Profil gilt einheitlich für alle Dateien und Tabellen dieser Exportmappe.',
      analysisNote:
        'Audit- und Analyseprofil sind pseudonymisierte Arbeitsdaten, keine anonymen Archivdatensätze und nicht für öffentliche Weitergabe bestimmt.',
    },
    {
      entryType: 'dataset',
      entryId: 'sessions',
      title: 'Sitzungen',
      relatedFile: 'sessions.csv; sessions.json; Excel-Blatt „Sitzungen“',
      recordDefinition:
        'Eine Zeile pro exportierter Hauptstudien-Sitzung beziehungsweise Forschungsfall.',
      joinRule: 'researchId ist der pseudonyme Schlüssel zu Timing, Antworten und Präsentationen.',
      analysisNote:
        'condition bezeichnet den vollständig administrierten Lernpfad. Im Analyseprofil sind nur completed Runs enthalten; unvollständige Runs sind kein negatives Outcome.',
    },
    {
      entryType: 'dataset',
      entryId: 'timing',
      title: 'Timingereignisse',
      relatedFile: 'timing.csv; timing.json; Excel-Blatt „Timing“',
      recordDefinition:
        'Eine Zeile pro bestätigtem Timingereignis; sequence ist innerhalb eines Falls streng steigend.',
      joinRule:
        'Über researchId an Sitzungen anbinden; Ereignisse innerhalb eines Falls nach sequence ordnen.',
      analysisNote:
        'Primäre Artefaktdauer ist artifactSessionElapsedMs aus Sitzungen. Einzelereignisse dienen Rekonstruktion und Qualitätsdiagnostik; Offline-Zeit wird nicht geschätzt.',
    },
    {
      entryType: 'dataset',
      entryId: 'responses',
      title: 'Instrumentantworten',
      relatedFile: 'responses.csv; responses.json; Excel-Blatt „Antworten“',
      recordDefinition: 'Long-Format: eine Zeile pro Fall, Instrument, Abschnitt und Item.',
      joinRule:
        'Über researchId an Sitzungen anbinden; instrumentId + sectionId + itemId verknüpfen jede Antwort eindeutig mit dem Variablen-Cookbook.',
      analysisNote:
        'value enthält den Rohwert beziehungsweise Optionscode; Mehrfachauswahlen sind JSON-Arrays. Missing-Regeln, Skalenanker und zulässige Aggregation stehen im Cookbook.',
    },
    {
      entryType: 'dataset',
      entryId: 'response-presentations',
      title: 'Guardrail-Präsentationen',
      relatedFile:
        'response-presentations.csv; response-presentations.json; Excel-Blatt „Präsentationen“',
      recordDefinition: 'Eine Zeile pro tatsächlich präsentierter Guardrail-Frage und Fall.',
      joinRule:
        'Über researchId + instrumentId + sectionId + itemId mit der zugehörigen Antwort verbinden.',
      analysisNote:
        'displayedOptionIds bewahrt die tatsächlich gezeigte Reihenfolge. Die inhaltliche Klassifikation erfolgt über optionId im Cookbook, nicht über die Bildschirmposition.',
    },
    {
      entryType: 'dataset',
      entryId: 'data-dictionary',
      title: 'Variablen-Cookbook',
      relatedFile: 'data-dictionary.csv; data-dictionary.json; Excel-Blatt „Variablen“',
      recordDefinition:
        'Eine Zeile pro Item und Optionscode; Items ohne diskrete Optionen besitzen genau eine Zeile.',
      joinRule:
        'instrumentId + sectionId + itemId mit Antworten verbinden; optionId ordnet kategoriale Werte ein.',
      analysisNote:
        'Enthält Wortlaut, Gruppe, Messniveau, Skalenanker, Missing-Regel, Optionsklassifikation sowie Item- und Gruppeninterpretation. Wiederholte Gruppenhinweise sind bewusst zeilenlokal.',
    },
    {
      entryType: 'analysis-boundary',
      entryId: 'score-boundaries',
      title: 'Score- und Interpretationsgrenzen',
      relatedFile: 'data-dictionary.csv; Excel-Blatt „Variablen“',
      recordDefinition: 'Gruppenzuordnungen beschreiben die fachliche Einordnung der Rohvariablen.',
      joinRule:
        'variableGroupId gruppiert zusammengehörige Items, ersetzt aber keine dokumentierte Skalenregel.',
      analysisNote:
        'Nur PANAS Positive/Negative Affect, UEQ-S Pragmatic/Hedonic Quality und UEQ+ Inhaltsseriosität werden nach ihrer jeweiligen offiziellen Anleitung als getrennte Skalen berechnet. Custom Items, Zeiturteile, Guardrail, Self-Efficacy und Follow-up bleiben getrennt.',
    },
    {
      entryType: 'analysis-boundary',
      entryId: 'missing-values',
      title: 'Fehlende Werte',
      relatedFile: 'responses.csv; data-dictionary.csv',
      recordDefinition:
        'Fehlende Zeile und explizites null sind keine inhaltlichen Antwortkategorien.',
      joinRule: 'Die itembezogene missingValueRule im Cookbook ist maßgeblich.',
      analysisNote:
        'Explizite Optionen wie unsure oder no_answer bleiben beobachtete Kategorien. Follow-up-Nonresponse wird nicht als Nein oder Inaktivität codiert.',
    },
  ];
  if (profile === 'analysis') {
    records.push({
      entryType: 'dataset',
      entryId: 'free-text-review',
      title: 'Freitextprüfung',
      relatedFile: 'free-text-review.csv; free-text-review.json; Excel-Blatt „Freitextprüfung“',
      recordDefinition:
        'Eine Zeile pro vorhandenem optionalem Freitext, getrennt von den aktiven Analyseantworten.',
      joinRule:
        'Nur kontrolliert über researchId und Itemschlüssel prüfen; nicht ungeprüft in Analysen übernehmen.',
      analysisNote:
        'Alle Einträge tragen pending-review. Freitext wird nicht in den anonymen Archivdatensatz übernommen.',
    });
  }
  return records.map((record) => researchExportGuideRecordSchema.parse(record));
}

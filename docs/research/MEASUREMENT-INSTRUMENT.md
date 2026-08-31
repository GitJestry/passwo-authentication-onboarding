# Messinstrumente — Pilotkandidat 3.0

Status: **verbindliche fachliche Übersicht für Cognitive Pretest und End-to-End-Pilot.**
Teilnehmerwortlaut, Reihenfolge, Skalen und Guardrail-Formen werden aus
`research/derived/instruments-v1.yaml` in die geprüfte Runtime-Projektion
`research/derived/instruments-v1.runtime.json` übernommen. Die generierte Contract-Kopie muss
bytegleich sein.

## Versionen

- Instrument: `3.0.0-pilot`
- Fragebogen: `questionnaire-v4-pilot`
- Guardrail: `guardrail-v6-pilot`
- Einwilligung: `consent-v14-pilot`
- Follow-up: `follow-up-v6-pilot`
- Runtime-Manifest: `instrument-runtime-v10-pilot`

`consent-v14-pilot` und `instrument-runtime-v10-pilot` sind das Zielmanifest für den Web-Pilot.
Sie werden erst nach Umsetzung und Prüfung der Wiederaufnahme teilnehmerseitig freigegeben.

## Evidenzarchitektur

Die Evaluation trennt:

1. ein vor Ergebnisinspektion eingefrorenes Source-to-Pattern-Artefaktaudit;
2. standardisierte Affekt- und UX-Maße;
3. einzelne, wörtlich begrenzte design-diagnostische Wahrnehmungsindikatoren;
4. einen kriteriumsbezogenen gemeinsamen Understanding Guardrail;
5. post-guardrail erhobene, explorative aufgabenspezifische Selbstwirksamkeit;
6. eine optionale, getrennte Nachbefragung.

Die Translation Foci sind keine validierten latenten Konstrukte und keine eins-zu-eins zu
messenden Dimensionen. Custom Items werden nicht zu Skalen, einem Translation-Focus-Score oder
einem Supportiveness-Score kombiniert. Die zwei Bedingungen werden als vollständige, in der
Studie administrierte Onboarding-Pfade verglichen.

## In-Session-Reihenfolge

1. Pre-Task-Hintergrundfragen;
2. zugewiesenes Lernangebot;
3. deutsche PANAS mit Bezug auf die Bearbeitung des Lernangebots;
4. wahrgenommene Dauer und Passung der Dauer;
5. deutsche UEQ-S;
6. UEQ+ `Trustworthiness of Content`;
7. zwölf design-diagnostische Einzelitems, Risikoproportionalität und wahrgenommenes Verstehen;
8. drei Anwendungsszenarien in einer von sechs ausbalancierten Reihenfolgen;
9. drei Recognition-Fragen;
10. vier post-guardrail Self-Efficacy-Items;
11. retrospektive SecAware.NRW-Vorerfahrung;
12. gemeinsames Debriefing.

Vor Abschluss aller In-Session-Outcomes gibt es kein Feedback auf den gemeinsamen Guardrail. In
den Lernpfad eingebettetes instruktives Feedback bleibt Bestandteil des jeweiligen Artefakts.

## Pre-Task-Instrument

- `PRE_ROLE`: Hochschulrolle;
- `PRE_FIELD`: breiter Bereich;
- `PRE_AGE`: Altersgruppe;
- `PRE_TRAINING`: frühere Trainings-/Lernmodulerfahrung;
- `PRE_PM_USE`: aktuell genutzte integrierte und/oder separate Speicher-/Autofill-Funktionen;
- `PRE_MFA_USE`: MFA/2FA bei persönlich wichtigen Konten.

`PRE_PM_USE` ist Mehrfachauswahl. `Keine dieser Möglichkeiten` und `Unsicher` sind jeweils
exklusiv. Es gibt keinen Knowledge-Pretest und keine Baseline-Self-Efficacy. Die absolute
Guardrail-Leistung kann deshalb nicht als individueller Wissenszuwachs interpretiert werden.

## Standardisierte Post-Maße

### PANAS

Die 20 deutschen Adjektive, Reihenfolge, Instruktion und fünf Antwortanker bleiben unverändert.
Positive Affect und Negative Affect werden nach publizierter Zuordnung separat ausgewertet. Es
gibt keinen Gesamt- oder Differenzscore und keine Revalidierung der Skalenstruktur im kleinen
explorativen Sample.

### Zeiturteile

- `PERCEIVED_DURATION`: sehr kurz bis sehr lang;
- `TIME_FIT`: deutlich zu kurz bis deutlich zu lang, mit `genau richtig` in der Mitte.

Objektive Dauer, subjektive Dauer und Dauerpassung bleiben getrennte Outcomes. Es wird kein
Diskrepanz- oder Quotientenscore gebildet.

### UEQ-S

Die acht offiziellen deutschen Gegensatzpaare bleiben in Wortlaut, Reihenfolge und Polarität
unverändert. Pragmatic Quality und Hedonic Quality werden getrennt berechnet. Der Anker
`unterstützend` ist kein Maß der thesis-spezifischen Supportiveness.

### UEQ+ Trustworthiness of Content

Die vier offiziellen Paare `nutzlos–nützlich`, `unglaubwürdig–glaubwürdig`,
`unseriös–seriös` und `ungenau–genau` bilden eine separate Skala. Die optionale
Importance-Bewertung wird nicht erhoben.

## Design-diagnostische Einzelitems

Alle Items verwenden die vollständig beschriftete siebenstufige Zustimmungsskala. Sie werden
itemweise ausgewertet und unterstützen nur ihre wörtlich vorab festgelegte Interpretation:

- `USEFULNESS_PRACTICAL`
- `APPROACH_FRAMING`
- `NONBLAMING_COMMUNICATION`
- `PERSONAL_RELEVANCE`
- `APPLICATION_OPPORTUNITY`
- `REFLECTIVE_ENGAGEMENT`
- `MECHANISM_EXPLANATION`
- `CONSEQUENCE_RISK`
- `CONSEQUENCE_PROTECTION`
- `INFORMATION_MANAGEABILITY`
- `INFORMATION_PACING`
- `ACTION_CLARITY`

Die beiden Consequence-Items sind bewusst mechanismusneutral und werden nicht zu einer
Tangibility-Skala kombiniert. Manageability und Pacing sind keine psychometrischen
Cognitive-Load-Maße. Action Clarity ist weder Verhaltensintention noch reale Ausführungskompetenz.

## Weitere Einzelurteile

- `RISK_PRESENTATION`: midpoint-orientiertes Urteil von verharmlost bis übertrieben;
- `UNDERSTANDING_GLOBAL`: globales subjektives Verstehen, getrennt vom Guardrail.

## Gemeinsamer Understanding Guardrail

Der Guardrail ist auf fünf explizit in beiden administrierten Pfaden dokumentierte Claims begrenzt:

1. jedes Konto beziehungsweise jeder Dienst erhält ein eigenes starkes Passwort;
2. Passwortmanager können starke Passwörter erzeugen;
3. Passwortmanager können Passwörter speichern und organisieren;
4. MFA kombiniert bei passwortbasierter Anmeldung das Passwort mit mindestens einem Faktor einer
   anderen Kategorie;
5. account-spezifische starke Passwörter und MFA sind komplementäre Maßnahmen.

Anwendungsszenarien:

- `SC_DISTINCT_PASSWORDS`
- `SC_PM_MANY_ACCOUNTS`
- `SC_LAYERED_PROTECTION`

Recognition-Fragen:

- `MR_DISTINCT_PASSWORDS`
- `MR_PASSWORD_MANAGER`
- `MR_MFA`

Jede Frage enthält drei inhaltliche Optionen und `Weiß ich nicht` fest an letzter Position. Für
jedes Item kommen über `F1` bis `F6` alle sechs Permutationen der drei inhaltlichen Optionen genau
einmal vor. Die Zuordnung ist für jedes Item separat eingefroren; innerhalb einer einzelnen Form
wird keine zusätzliche Verteilung der richtigen Antwortpositionen erzwungen. Die sechs Formen
balancieren weiterhin alle sechs Reihenfolgen der Anwendungsszenarien. Die Form wird serverseitig,
innerhalb jeder Bedingung in kleinen permutierten Sechserblöcken, zugewiesen und persistiert.

Es gibt keinen Guardrail-Gesamtscore, keine Pass-Fail-Schwelle und keine Reliabilitätsanalyse.
Anwendungsszenarien bilden den zentralen empirischen Security Safeguard; Recognition-Fragen sind
explorativ.

## Post-Guardrail-Selbstwirksamkeit

Vier getrennte 0–10-Konfidenzurteile werden erst nach dem no-feedback Guardrail erhoben:

- `SE_DISTINCT_ACCESS`
- `SE_PM_NEW_ACCOUNT`
- `SE_PM_LOGIN`
- `SE_MFA_ENABLE`

Es gibt weder Baseline noch Veränderungsscore oder kombinierten Self-Efficacy-Score. Die Ergebnisse
beziehen sich auf den bis dahin absolvierten Gesamtprozess aus Artefakt und gemeinsamem Guardrail.

## Retrospektive SecAware.NRW-Vorerfahrung

`PRE_SECAWARE_RETROSPECTIVE` fragt nach dem Zustand vor der heutigen Teilnahme. Die Variable wird
nur für Berichterstattung und eine vorab festgelegte, vorsichtig interpretierte Sensitivitätsanalyse
verwendet.

## Optionale Nachbefragung nach ungefähr zehn Tagen

Das getrennte Follow-up ist eine ancillary exploratory extension mit genau drei eng definierten
near-term self-reported actions: Ersetzen eines wiederverwendeten oder leicht veränderten
Passworts, Erzeugen und Speichern eines kontospezifischen Passworts mit einem Passwortmanager und
Aktivieren von MFA/2FA. Jede Handlung wird verpflichtend mit `Ja`, `Nein` oder `Unsicher`
beantwortet und separat berichtet. `Unsicher` bleibt eine eigene Kategorie. Nur bei `Nein` kann
optional ein handlungsspezifischer wichtigster Grund ausgewählt werden; Reasons sind deskriptiver
Kontext und keine Barrierenskala. Es gibt weder weitere verzögerte Handlungen noch einen
kombinierten delayed-behavior score.

Das Reporting-Fenster reicht technisch vom Abschluss der damaligen Online-Studie bis zum
bestätigten Versandzeitpunkt der ersten Einladung. Teilnehmende sehen keinen Kalenderstichtag und
werden ausdrücklich auf eigene Konten außerhalb der Studie sowie darauf begrenzt, jetzt keine
Änderung vorzunehmen. Die Selbstberichte sind kein Nachweis durable behavior change, sustained
adoption oder objektiv korrekt abgeschlossener Konfigurationen.

Condition und verfügbare Baseline-Passwortmanager-/MFA-Angaben werden über denselben `researchId`
zugeordnet. Responder und Non-Responder werden nach Condition und verfügbaren Baseline-Merkmalen
beschrieben. Follow-up-Unterschiede zwischen Conditions sind wegen freiwilligem Recontact und
Nonresponse ausschließlich responder-selected exploratory estimates; es werden keine
konfirmatorischen kausalen Effekte behauptet.

## Pflichtfelder, Verzweigungen und Barrierefreiheit

Alle In-Session-Items sind verpflichtend, sofern im Manifest nicht ausdrücklich
`participantOptional` gesetzt ist. Mehrfachauswahl-Exklusivität wird in UI und Contracts
erzwungen. Skalen werden als native Radio-Gruppen mit sichtbaren beziehungsweise programmatisch
zugänglichen Ankern gerendert; Farbe ist nie der einzige Bedeutungsträger. PANAS wird in
überschaubaren Gruppen dargestellt, ohne Reihenfolge oder Wortlaut zu verändern.

## Analysegrenzen

- ordinale Einzelitems: vollständige Verteilung, Median, IQR, Cliff's Delta mit 95-%-KI;
- PANAS, UEQ-S und UEQ+: getrennte Skalenwerte nach jeweiliger Anleitung, Mittelwertdifferenz und
  Hedges' g mit 95-%-KI;
- Guardrail: alle Kategorien pro Item, Wilson-Intervalle und ausgewählte Newcombe-Risikodifferenzen;
- keine Equivalence-, Non-Inferiority-, Mastery- oder Langzeitwirkungsbehauptung;
- kein Wissenszuwachs ohne Pretest;
- keine kausale Zuschreibung an einzelne Foci oder Interfaceelemente.

## Vor dem Hauptstudien-Versions-Freeze

Erforderlich sind Cognitive Pretest, End-to-End-Pilot in beiden Bedingungen, zweite qualifizierte
Prüfung von Artefaktaudit, Shared-Content-Matrix und Guardrail-Klassifikationen sowie dokumentierte
Auflösung konkreter Befunde. Diese Prüfung ist eine manuelle fachliche Research-QA-Aufgabe. Sie
erfordert keine Runtime-Funktion und keine psychometrische Interrater-Studie. Pilotpersonen werden
nicht in die Hauptstudie aufgenommen; Pilotdaten werden nicht mit Hauptstudiendaten
zusammengeführt.

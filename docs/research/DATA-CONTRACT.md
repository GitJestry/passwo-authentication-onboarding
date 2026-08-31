# Data Contract

Status: **kanonische implementierte Datengrenze und Datenlebenszyklus-Definition.**
Der Webbetrieb und die Wiederaufnahme sind in `ADR 0016-Web-Resume-Lifecycle` entschieden.

## Begriffe

- **Pseudonymisierte Arbeitsphase:** Ein Datensatz kann über getrennt gehaltene Zusatzinformationen
  noch einer Sitzung oder Kontaktadresse zugeordnet werden. Das gilt auch dann, wenn Name und
  E-Mail-Adresse nicht im Forschungsdatensatz stehen.
- **Arbeits- oder Analyseexport:** Ein kontrollierter pseudonymisierter Export für Prüfung und
  Auswertung. Er ist kein anonymer Datensatz und nicht zur öffentlichen Weitergabe bestimmt.
- **Anonymer Archivdatensatz:** Der nach der unten festgelegten Prozedur erzeugte Datensatz, für den
  keine Zuordnungsinformationen oder realistisch nutzbaren Identifikationsmittel mehr unter
  Projektkontrolle bestehen. Nur dieser Datensatz wird zehn Jahre aufbewahrt.

Das Entfernen offensichtlicher Identifikatoren allein reicht nicht für die Bezeichnung „anonym“.
Die Entscheidung berücksichtigt deshalb auch Merkmalskombinationen, Zeitbezüge, Arbeitskopien und
Backups. Grundlage dieser Begriffsverwendung sind Art. 4 Nr. 5 und Erwägungsgrund 26 DSGVO sowie die
Abgrenzung von Pseudonymisierung und Anonymisierung durch den Europäischen Datenschutzausschuss.

## Datenklassen

| Klasse | Beispiele | Persistenz und Zweck |
|---|---|---|
| Operative Session | interne Session-UUID, Status, Versionen | `study.sqlite`; Ablauf und Tabellenbeziehungen |
| Rekrutierungsquelle | generische ID aus 1 bis 80 alphanumerischen Zeichen, `-` oder `_`, zum Beispiel `ub`, `tu`, `rwth` oder `other-university`; `ub` als Default für fehlende, syntaktisch ungültige und ältere Werte | `study.sqlite`; einmalig beim Session-Create bestimmt und für die Auswertung exportiert |
| Forschungsfall | zufällige, nicht angezeigte Forschungs-ID | `study.sqlite`; pseudonyme Verknüpfung während der Arbeitsphase |
| Löschzuordnung | ausschließlich SHA-256-Hash des flüchtigen Löschcodes | `study.sqlite`; Löschanfragen bis zur Anonymisierung |
| Zuweisung | Bedingung, Zuweisungsmodus, Guardrail-Form `F1` bis `F6` | `study.sqlite` |
| Instrumentdaten | Pre, Post, Guardrail, Self-Efficacy, retrospektive SecAware-Frage | `study.sqlite` |
| Präsentation | Form-ID und tatsächlich angezeigte Guardrail-Option-IDs | `study.sqlite` |
| Timing | Artefakt-Sitzungsintervalle, Abschnitt/Segment, Dauer, Sichtbarkeit, technische Reason Codes | `study.sqlite`; keine passive Aktivitätsüberwachung |
| Fortschritt | stabiler inhaltsfreier Checkpoint | `study.sqlite`; S01–S07 zuletzt bestätigte Segment-ID mit S01 als serverseitigem Fallback, ab S08 zuletzt bestätigte Segment-ID ohne freie Trainingswerte |
| S08-Simulationsresume | Schema-Version, drei IDs vorgegebener Passphrasen, notwendige kanonische Schwäche- und Relationsflags | temporär in `study.sqlite`; nur für S08 bis Artefaktabschluss, nie im Forschungs- oder Analyseexport |
| Rückkehrschlüssel | Hash und Ablaufzeit eines zufälligen Resume-Tokens | `study.sqlite`; nur operative Wiederaufnahme |
| Follow-up-Verknüpfung | Einwilligung, Follow-up-Version, Token-Hash, Follow-up-Antworten | `study.sqlite`; pseudonyme Verbindung bis zur Anonymisierung |
| Kontaktregister | E-Mail, Raw Token, Consent-Version, Versandzeitpunkte | ausschließlich getrennte `recontact.sqlite` |
| Flüchtige Teilnehmerdaten | Anzeigename, roher Löschcode, Raw-Resume-Token | Löschcode nur im flüchtigen Study-State beziehungsweise in der aktuellen Antwort; Resume-Token nur im `HttpOnly`-Cookie |
| Trainingsinput und lokale Detailanalyse | fiktive Passwörter, Passwortteile, Spans, Gruppen, Strukturmarkierungen, Wiederholungen und semantische Evidenz | nie an den Server senden oder als Forschungsdaten persistieren; für Reload-Recovery S01–S07 minimal mit zweistündiger TTL im tab-lokalen `sessionStorage`, sonst Browser-RAM; nach bestätigtem S08-Checkpoint löschen |
| Reale Sicherheitsdaten | reale Konten, Passwörter, Tokens, Wiederherstellungscodes, Vorfälle | nie erheben |
| Passive Metadaten | IP, User-Agent, vollständige Request-Bodies | nicht persistieren oder in Anwendungslogs schreiben |

## Forschungsdatenbank und Kontaktregister

`study.sqlite` enthält ausschließlich die für Studienablauf, pseudonyme Verknüpfung, Auswertung und
spätere Löschung erforderlichen Daten. E-Mail-Adresse und Raw-Follow-up-Token sind dort verboten.

`recontact.sqlite` wird nur bei freiwilliger Follow-up-Einwilligung befüllt. Sie enthält keine
Bedingung, Antworten, Timings, Trainingsinputs oder PassWo-Befunde. Eine Person kann die Hauptstudie
ohne E-Mail-Adresse vollständig abschließen.

Haupt- und Follow-up-Antworten werden während der pseudonymisierten Arbeitsphase über die interne
Session beziehungsweise Forschungs-ID verbunden. Die E-Mail-Adresse gelangt nie in einen
Forschungs- oder Analyseexport.

## Run-Lifecycle und Auswertungseinschluss

Neue Sitzungen beginnen als `in-progress`. Browser-Schließen oder Reload ist eine Unterbrechung und
kein regulärer Abschluss. Bei Rückkehr vor `resumeCloseAt` wird der letzte bestätigte Checkpoint
geöffnet. SecAware setzt am bestätigten Seiteneinstieg fort. PassWo beginnt bis einschließlich S07
am sicheren S00-/S01-Sektionseinstieg neu, ohne flüchtige Trainingswerte zu persistieren. Beim
Übergang zu S08 werden frei eingegebene Passwortwerte, Teilstrings und semantische Detailbefunde
lokal verworfen. Danach darf die Runtime unmittelbar ab S08 ausschließlich über den minimalen
`supportive-s08-resume-v1`-Zustand fortsetzen.

Nach dem bestätigten S08-Write darf der stabile inhaltsfreie Fortschritts-Checkpoint monoton die
Segment-IDs S09 bis S17 annehmen. Die Wiederaufnahme beginnt damit am Einstieg des zuletzt
bestätigten Segments. Diese IDs enthalten keine Passwortwerte, Trainingsentscheidungen oder
semantischen Detailbefunde und erweitern den S08-Simulationsresume-Zustand nicht.

Dieser Zustand erlaubt genau drei IDs aus dem versionierten vordefinierten Passphrasen-Pool,
höchstens die Konten-IDs `master-campus` und `campus-email` als verbleibende Schwächeflags sowie
höchstens die drei kanonischen Paar-IDs zwischen Campusgram, Master Campus und Campus E-Mail mit
`identical` oder `similar`. Die drei Passphrasen müssen unterschiedlichen vorgegebenen Wortsets
entstammen. Strings, Teilstrings, Positionen, Spans, Kategorien, freie Bezeichner und sonstige
semantische Evidenz sind verboten. Nach Resume werden Passphrase-Strings nur aus lokalem,
versioniertem Training-Content anhand der IDs rekonstruiert. Der Zustand wird beim
Artefaktabschluss gelöscht.

Eine Web-Sitzung wird automatisch `completed`, sobald der Artefaktabschluss und sämtliche
erforderlichen Pre-, Post- und Guardrail-Submissions persistiert sind. Statuswechsel,
`completed_at_iso`, Invalidierung des Rückkehrschlüssels und gegebenenfalls die
Follow-up-Terminierung erfolgen atomar mit der letzten erforderlichen Submission;
`completed_at_iso` entspricht deren persistiertem Submission-Zeitpunkt. Das nachfolgend sichtbare
Debriefing benötigt keinen zusätzlichen statusbestimmenden Klick. Beim Start der Runtime werden
ältere datenkomplette `in-progress`-Sitzungen nach denselben Regeln idempotent abgeschlossen.

Nur regulär `completed` Sitzungen gehen in die Hauptauswertung ein. Nicht abgeschlossene Sitzungen
werden nicht als Nullantwort, Dropout-Outcome oder negatives Verhalten interpretiert. Sie bleiben
bis zum Datensatz-Freeze pseudonymisiert, damit Wiederaufnahme und Löschanfragen möglich sind, und
werden beim Datensatz-Freeze vollständig entfernt.

Historische Statuswerte wie `incomplete-reload`, `participant-withdrawal` oder `technical-abort`
bleiben für alte lokale Sitzungen lesbar. Sie erzeugen keinen automatischen Einschluss in die
Hauptanalyse.

## Kontrollierte Zeitpunkte

### Hauptstudien-Versions-Freeze

Vor Rekrutierungsbeginn werden Code, Inhalte, Instrumente, Referenzartefakt und Analyseplan auf einen
Commit und die zugehörigen Versionen festgelegt. Dies ist ein Software- und Methodik-Freeze, keine
Anonymisierung.

### Datenerhebungsschluss

Die Studienleitung legt vor Rekrutierungsbeginn `resumeCloseAt` fest und dokumentiert diesen
Zeitpunkt als Datenerhebungsschluss. Danach werden weder neue noch wiederaufgenommene
Hauptsitzungen angenommen. Bereits eröffnete Follow-up-Fenster bleiben bis zu ihrem jeweiligen
Schließzeitpunkt erreichbar.

### Kontaktlöschung

Spätestens sieben Kalendertage nach Schließung des letzten Follow-up-Fensters werden
`recontact.sqlite`, lokale Schedule-Exporte, versandte Follow-up-Nachrichten im
projektkontrollierten Postfach und sonstige projektkontrollierte Kontaktkopien gelöscht.
Die Bestätigung enthält nur Datum, ausführende Person sowie Datensatzanzahl vor und nach der
Löschung. E-Mail-Adressen und Tokens werden nicht in das Löschprotokoll übernommen.

### Datensatz-Freeze und Anonymisierung

Nach Schließung aller Follow-up-Fenster und Abschluss der Datensatzprüfung wird der Datensatz-Freeze
manuell ausgelöst, spätestens 30 Kalendertage nach dem letzten Follow-up-Fenster. Gibt es keine
Follow-up-Einwilligungen, gilt die Frist ab Datenerhebungsschluss.

Der dokumentierte Zeitpunkt heißt `anonymisedAt`. Ab diesem Zeitpunkt ist keine individuelle
Löschung mehr möglich und die zehnjährige Aufbewahrungsfrist des anonymen Archivdatensatzes beginnt.

## Verbindliche Anonymisierungsprozedur

Der Datensatz darf erst nach Abschluss aller folgenden Schritte als anonym bezeichnet werden:

1. **Eingang sperren:** Keine neuen Sitzungen, Follow-up-Antworten oder Änderungen werden mehr in die
   Arbeitsdaten übernommen. Versionen und Fallzahlen werden protokolliert.
2. **Fallauswahl:** Vor der Löschung dürfen ausschließlich nicht personenbezogene aggregierte
   Ablaufzahlen zu gestarteten, abgeschlossenen und unvollständigen Sitzungen festgehalten werden.
   Danach werden alle nicht `completed` Sitzungen und ihre abhängigen Daten vollständig entfernt.
   Follow-up-Nichtantwort bleibt bei completed Hauptsitzungen fehlend und wird nicht als Inaktivität
   codiert.
3. **Verknüpfung abschließen:** Zulässige Haupt- und Follow-up-Antworten werden vor Entfernung der
   Zuordnungsmittel zusammengeführt.
4. **Dauerwerte ableiten:** Erforderliche Dauern und Unterbrechungsflags werden berechnet. Absolute
   Kalender-, Empfangs-, Registrierungs- und Versandzeitpunkte werden nicht in den Archivdatensatz
   übernommen.
5. **Neue Fall-IDs erzeugen:** Jeder verbleibende Fall erhält eine neu zufällig erzeugte
   `analysis_case_id`. Es wird keine Zuordnungstabelle zwischen dieser ID und Session-, Forschungs-
   oder Löschkennungen aufbewahrt.
6. **Zuordnungsdaten entfernen:** Session-UUID, Forschungs-ID, Löschcode-Hash, Resume-Token-Hash,
   Follow-up-Token-Hash, Request-IDs, Artefakt-Leases, Kontaktregister und sonstige operative
   Verknüpfungsdaten werden gelöscht.
7. **Inhaltsdaten minimieren:** Freitext wird nicht archiviert. Technische Fehlertexte werden auf
   vorab definierte grobe Qualitätsflags reduziert. Nur für Reproduktion und Auswertung notwendige
   Instrumentantworten, Versionen, Condition, Präsentationsreihenfolgen und abgeleitete Dauern
   bleiben erhalten.
8. **Merkmalskombinationen prüfen:** Hochschulrolle, Fachbereich, Altersgruppe, Vorerfahrung,
   seltene technische Flags und auffällig präzise Dauerwerte gelten gemeinsam als potenzielle
   Quasi-Identifikatoren. Kombinationen mit weniger als drei Fällen werden durch Zusammenfassung,
   Rundung oder Weglassen der analytisch am wenigsten benötigten Variable vergröbert. Zusätzlich
   wird geprüft, ob besonderes Rekrutierungswissen eine Person trotzdem realistisch erkennbar
   machen könnte.
9. **Arbeitskopien beseitigen:** Pseudonymisierte Datenbanken, Audit-/Analyseexporte, temporäre
   Dateien und projektkontrollierte Backups werden gelöscht oder durch dokumentierte Ablaufregeln
   vollständig aus der Wiederherstellung entfernt. Solange eine solche Kopie existiert, gilt der
   Datenbestand nicht als anonym.
10. **Ergebnis dokumentieren:** Ein nicht personenbezogenes Anonymisierungsprotokoll hält
    `anonymisedAt`, Commit und Instrumentversionen, Fallzahlen vor und nach der Bereinigung,
    vorgenommene Vergröberungen und die Prüfsumme des finalen Archivdatensatzes fest.

Die Drei-Fälle-Regel ist eine projektspezifische Mindestschwelle für die Archivfassung, keine
allgemeine rechtliche Garantie. Die abschließende Bewertung bleibt kontextbezogen und bezieht die
verfügbaren Zusatzinformationen und vorgesehenen Empfänger ein.

Die Prozedur darf als kleiner kontrollierter CLI-/Exportablauf oder als dokumentierter manueller
Vorgang umgesetzt werden. Sie benötigt keine Teilnehmeroberfläche, keinen automatischen Scheduler
und kein allgemeines Datenverwaltungsportal. Entscheidend sind reproduzierbare Eingaben, die
vollständige Entfernung der Zuordnungs- und Arbeitskopien sowie das abschließende Protokoll.

## Aufbewahrung und Weitergabe

Der anonyme Archivdatensatz wird ab `anonymisedAt` zehn Jahre geschützt auf universitären Systemen
aufbewahrt und anschließend gelöscht. Die ursprünglichen pseudonymisierten Datenbanken und
Arbeitskopien gehören nicht zu dieser Zehnjahresaufbewahrung.

Der Archivdatensatz ist standardmäßig nicht öffentlich. Eine spätere Herausgabe an Dritte oder
Veröffentlichung erfordert eine neue Offenlegungsprüfung, weil sich Identifikationsmöglichkeiten mit
Empfängern und Zusatzwissen ändern können. Veröffentlichte Thesis-Tabellen und Abbildungen enthalten
nur aggregierte Ergebnisse.

## Löschanfragen vor der Anonymisierung

Der rohe Löschcode wird deterministisch aus dem zufälligen `HttpOnly`-Rückkehrschlüssel
abgeleitet und weder in der Forschungsdatenbank noch in Exporten gespeichert. Bei einer gültigen
Wiederaufnahme kann der Server ihn erneut ableiten und nur nach Abgleich mit dem gespeicherten
SHA-256-Hash an denselben Browser zurückgeben. Bis `anonymisedAt` kann die zugehörige
pseudonymisierte Sitzung über diesen Hash gefunden und vollständig aus Forschungsdatenbank und
Kontaktregister gelöscht werden.

Die lokale Lösch-CLI bleibt standardmäßig ein Dry-Run; Schreiben erfordert `--confirm`. Bereits
erzeugte Arbeits-Exporte und Backups werden im selben kontrollierten Vorgang separat berücksichtigt.
Nach `anonymisedAt` existiert keine Zuordnung mehr, mit der ein einzelner Fall identifiziert oder
individuell gelöscht werden könnte.

## Exporte

- **Auditprofil:** geschützte pseudonymisierte Nachweisfassung einschließlich technischer
  Zeitpunkte und Rekrutierungsquelle; nur für Datenprüfung.
- **Analyseprofil:** pseudonymisierte Arbeitsfassung ohne exakte Kalenderzeitpunkte; nur für
  kontrollierte interne Auswertung einschließlich Rekrutierungsquelle. Der Analyseprozess
  selektiert ausschließlich `completed` Runs.
- **Archivfassung:** Ergebnis der Anonymisierungsprozedur; neue `analysis_case_id`, keine
  Zuordnungsmittel, vergröberte Hintergrunddaten und keine Arbeitskopien.

Der kontrollierte Arbeits-Export schreibt jede Datentabelle als CSV und JSON sowie dieselben
Tabellen in eine formatierte Excel-Arbeitsmappe. `export-guide` beschreibt das Zeilenkorn, die
Verknüpfungsschlüssel und die profilabhängigen Analysegrenzen. `data-dictionary` ist das
Variablen-Cookbook: Für jedes Item und jeden Optionscode enthält es Wortlaut, Variablengruppe,
Messniveau, Skala und Anker, Missing- und Verzweigungsregel, inhaltliche Einordnung sowie die
zulässige oder ausdrücklich ausgeschlossene Aggregation. Guardrail-Optionscodes werden dort gemäß
dem akzeptierten Content-Audit als `appropriate`, `incomplete-or-unsafe` oder `uncertain`
klassifiziert; diese Klassifikation wird nicht an Teilnehmende ausgeliefert und begründet weder
Pass/Fail noch einen Gesamtscore.

Alle Dateien einschließlich der Excel-Arbeitsmappe stehen mit SHA-256-Prüfsumme im Manifest. Der
Exporter überschreibt keine vorhandene gleichnamige Datei. CSV, JSON und Excel enthalten dieselbe
profilabhängige Fallauswahl; das Dateiformat verändert weder Einschluss noch Datengrenze.

Keines der beiden regulären Exportprofile ist allein durch seinen Dateinamen anonym.
Der temporäre S08-Simulationsresume-Zustand gehört zu keinem Exportprofil.

## Verbotene Datenflüsse

Unzulässig sind insbesondere:

- Persistenz oder Übertragung realer oder fiktiver Passwortwerte, Passwortteile oder semantischer
  Detailbefunde; die einzige Ausnahme sind die oben abschließend benannten, nicht rekonstruierenden
  IDs und Flags des temporären S08-Simulationsresume-Zustands;
- Logging von Request-Bodies, Eingabewerten, IP-Adressen, User-Agents oder Raw Tokens in
  projektkontrollierten Anwendungs- und Access-Logs;
- E-Mail, Raw Follow-up-Token oder Raw-Resume-Token in Forschungsantworten oder Exporten;
- clientseitige Condition- oder Guardrail-Form-Wahl;
- Auslieferung von Scoring- oder Klassifikationsrubriken an Teilnehmende;
- Bündelung der Follow-up-Fragen mit Training oder Hauptfragebogen;
- Bezeichnung pseudonym verknüpfbarer Arbeitsdaten als anonym;
- öffentliche Weitergabe des internen Analyseexports ohne neue Offenlegungsprüfung.

# Data Contract

Status: **kanonische Datengrenze und Datenlebenszyklus-Definition für die Hauptstudie.**
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
| Forschungsfall | zufällige, nicht angezeigte Forschungs-ID | `study.sqlite`; pseudonyme Verknüpfung während der Arbeitsphase |
| Löschzuordnung | ausschließlich SHA-256-Hash des flüchtigen Löschcodes | `study.sqlite`; Löschanfragen bis zur Anonymisierung |
| Zuweisung | Bedingung, Zuweisungsmodus, Guardrail-Form `F1` bis `F6` | `study.sqlite` |
| Instrumentdaten | Pre, Post, Guardrail, Self-Efficacy, retrospektive SecAware-Frage | `study.sqlite` |
| Präsentation | Form-ID und tatsächlich angezeigte Guardrail-Option-IDs | `study.sqlite` |
| Timing | Artefakt-Sitzungsintervalle, Abschnitt/Segment, Dauer, Sichtbarkeit, technische Reason Codes | `study.sqlite`; keine passive Aktivitätsüberwachung |
| Fortschritt | stabiler inhaltsfreier Checkpoint | `study.sqlite`; Wiederaufnahme ohne Trainingswerte |
| Rückkehrschlüssel | Hash und Ablaufzeit eines zufälligen Resume-Tokens | `study.sqlite`; nur operative Wiederaufnahme |
| Follow-up-Verknüpfung | Einwilligung, Follow-up-Version, Token-Hash, Follow-up-Antworten | `study.sqlite`; pseudonyme Verbindung bis zur Anonymisierung |
| Kontaktregister | E-Mail, Raw Token, Consent-Version, Versandzeitpunkte | ausschließlich getrennte `recontact.sqlite` |
| Flüchtige Teilnehmerdaten | Anzeigename, roher Löschcode, Raw-Resume-Token | nur flüchtiger Zustand beziehungsweise `HttpOnly`-Cookie |
| Trainingsinput und lokale Analyse | fiktive Passwörter, Passwortteile, Findings, Ähnlichkeit | nie persistieren oder senden |
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
geöffnet; ein unterbrochener Schritt mit flüchtigen Trainingswerten beginnt erneut.

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

Der rohe Löschcode wird clientseitig erzeugt und weder serverseitig noch in Exporten gespeichert.
Bis `anonymisedAt` kann die zugehörige pseudonymisierte Sitzung über seinen SHA-256-Hash gefunden und
vollständig aus Forschungsdatenbank und Kontaktregister gelöscht werden.

Die lokale Lösch-CLI bleibt standardmäßig ein Dry-Run; Schreiben erfordert `--confirm`. Bereits
erzeugte Arbeits-Exporte und Backups werden im selben kontrollierten Vorgang separat berücksichtigt.
Nach `anonymisedAt` existiert keine Zuordnung mehr, mit der ein einzelner Fall identifiziert oder
individuell gelöscht werden könnte.

## Exporte

- **Auditprofil:** geschützte pseudonymisierte Nachweisfassung einschließlich technischer
  Zeitpunkte; nur für Datenprüfung.
- **Analyseprofil:** pseudonymisierte Arbeitsfassung ohne exakte Kalenderzeitpunkte; nur für
  kontrollierte interne Auswertung. Der Analyseprozess selektiert ausschließlich `completed` Runs.
- **Archivfassung:** Ergebnis der Anonymisierungsprozedur; neue `analysis_case_id`, keine
  Zuordnungsmittel, vergröberte Hintergrunddaten und keine Arbeitskopien.

Keines der beiden regulären Exportprofile ist allein durch seinen Dateinamen anonym.

## Verbotene Datenflüsse

Unzulässig sind insbesondere:

- Persistenz oder Übertragung realer oder fiktiver Passwortwerte, Passwortteile oder Findings;
- Logging von Request-Bodies, Eingabewerten, IP-Adressen, User-Agents oder Raw Tokens in
  projektkontrollierten Anwendungs- und Access-Logs;
- E-Mail, Raw Follow-up-Token oder Raw-Resume-Token in Forschungsantworten oder Exporten;
- clientseitige Condition- oder Guardrail-Form-Wahl;
- Auslieferung von Scoring- oder Klassifikationsrubriken an Teilnehmende;
- Bündelung der Follow-up-Fragen mit Training oder Hauptfragebogen;
- Bezeichnung pseudonym verknüpfbarer Arbeitsdaten als anonym;
- öffentliche Weitergabe des internen Analyseexports ohne neue Offenlegungsprüfung.

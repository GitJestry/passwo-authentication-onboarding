# Data Contract

## Datenklassen

| Klasse | Beispiele | Persistenz |
|---|---|---|
| Study identity | Session UUID, pseudonymer Teilnehmercode | `study.sqlite` |
| Assignment | Bedingung, Zuweisungsmodus, Config-ID, Guardrail-Form | `study.sqlite` |
| Versioning | Study-, Content-, Fragebogen-, Guardrail-, Consent-, Follow-up- und Referenzversion | `study.sqlite` |
| Timing | Phase, Segment-ID, Start/Ende, monotone Dauer | `study.sqlite` |
| Instruments | Pre, Post, Guardrail, optionale offene Rückmeldung, später importiertes Follow-up | `study.sqlite` |
| Presentation | Form-ID und tatsächlich angezeigte Guardrail-Option-IDs | `study.sqlite` |
| Completion | complete, incomplete, technical failure | `study.sqlite` |
| Follow-up-Verknüpfung | optionale Einwilligung, Follow-up-Version, optionaler Token-Hash | `study.sqlite` |
| Recontact | E-Mail, Roh-Token, Token-Hash, Consent-Version, Versand-/Schließzeitpunkte | ausschließlich `recontact.sqlite` |
| Ephemeral personalization | Anzeigename/Kürzel | nur flüchtiger Electron-Renderer |
| Training input/diagnosis | fiktive Passwörter, Loginversuche, Findings, Ähnlichkeit | nie persistieren |
| Reference quiz state | im gemessenen Pfad nicht vorhanden; etwaige SCORM-Interaktionen der Unterrichtslektionen | nicht erheben |
| Sensitive real-world data | reale Konten, Passwörter, Tokens, Vorfälle | nie erheben |
| Passive metadata | IP, User-Agent, Request-Bodies | nicht persistieren |

## Forschungsdatenbank

`study.sqlite` enthält:

- `study_sessions` für Identität, Zuweisung, Versionen, Follow-up-Einwilligung und Status;
- `assignment_slots` und `guardrail_form_slots` für getrennte serverseitige Blockzuweisungen;
- `timing_events` für idempotente Zeitereignisse;
- `artifact_leases` ausschließlich für operative Reload-Erkennung;
- `instrument_submissions` für atomare Blockabgaben und Payload-Fingerprints;
- `responses` für validierte Itemantworten;
- `response_presentations` für die tatsächlich dargestellten Guardrail-Optionen.

`artifact_leases` sind weder Forschungstiming noch Bestandteil des Exports. E-Mail,
Roh-Token und Recontact-Request-ID sind in `study.sqlite` verboten.

## Antwort-Submission

Der Client sendet einen vollständigen Instrumentblock mit `instrumentId`, `sectionId` und der
exakt erwarteten Itemmenge. Der Server validiert IDs, Reihenfolge, Wertebereiche,
Mehrfachauswahl-Exklusivität und Textlängen anhand der versionierten Runtime-Definition.

Die erste gültige Submission wird transaktional gespeichert. Eine identische Wiederholung ist
idempotent; ein abweichender zweiter Payload für denselben Block erzeugt einen Konflikt und
überschreibt keine Daten. Rohantworten und Präsentationsreihenfolge werden exportiert, Scoring
findet ausschließlich im Analyseprozess statt.

`PRE_GENDER` ist technisch verpflichtend und verwendet für die inhaltlich freiwillige Antwort die
stabile Option `no_answer`; `null` ist für dieses Item unzulässig. Im Follow-up unterscheiden die
exklusiven Optionen `cannot_recall` und `no_answer` fehlende Erinnerung von verweigerter Angabe.
Die primären verzögerten Outcomes bleiben die einzelnen Optionen
`generated_stored_account_specific` und `enabled_mfa`; ein kombinierter Behavior Score wird nicht
gebildet.

## Pseudonymisierung und Recontact

Der Teilnehmercode wird zufällig erzeugt und enthält keine Initialen, Matrikelnummer oder
Zeitstempel. Pseudonymisierte Forschungsdaten bleiben geschützt und zugriffsbeschränkt.

Die optionale Nachbefragung beeinflusst weder Teilnahme noch Condition-Zuweisung. Bei Einwilligung
enthält `~/.passwo-study/recontact.sqlite` ausschließlich Token-Hash und Roh-Token, E-Mail-Adresse,
Consent-Version sowie Registrierungs-, Einladungs-, Erinnerungs-, Schließ- und Versandstatus. Die
Registry enthält keine Condition, Antworten, Timings oder Trainingsdaten.

Ein Verzicht oder ein abgebrochener Registrierungsversuch setzt Einwilligungsstatus und Token-Hash
in der Forschungsdatenbank zurück und entfernt einen gegebenenfalls angelegten Registry-Datensatz,
ohne Session, Teilnehmercode oder Condition zu verändern.

## Speicherort und Rechte

- Standard: `~/.passwo-study/study.sqlite` und getrennt `recontact.sqlite`.
- Verzeichnisrecht `0700`, Dateien möglichst `0600`.
- Kein automatischer Cloud-Sync-Pfad.
- Browser Storage, IndexedDB und Service Worker sind unzulässig.
- Exporte werden nur in explizit gewählte lokale Zielverzeichnisse geschrieben.

## Export

Der Forschungsdatenexport enthält Sessions, Timing, Responses und Response Presentations als CSV
und JSON, ein Data Dictionary sowie ein Manifest mit Versionen, Zählungen und SHA-256-Prüfsummen.
Er enthält keine E-Mail, Roh-Tokens, Token-Hashes, Trainingsinputs oder SecAware-Quizdaten.
Das native SecAware-Abschlussquiz ist aus dem gemessenen Referenzpfad entfernt; PassWo-interne
Lernfragen dürfen bestehen, werden aber ebenso wenig als gemeinsamer Outcome exportiert. Beide
Bedingungen bearbeiten den gemeinsamen externen Guardrail.

Der getrennte Schedule-Export enthält ausschließlich E-Mail, individuellen Token-Link sowie
Einladungs-, Erinnerungs- und Schließzeitpunkte. Er enthält weder Condition noch
Forschungsantworten.

Aufbewahrungs-, Lösch- und Backup-Fristen sind vor dem Study Freeze festzulegen. Die Runtime führt
bis dahin keine automatische oder destruktive Löschung der Research- oder Recontact-Datenbank
durch.

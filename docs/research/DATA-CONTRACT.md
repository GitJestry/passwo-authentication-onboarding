# Data Contract

## Datenklassen

| Klasse                    | Beispiele                                                                                | Persistenz                        |
| ------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------- |
| Study identity            | interne Session-UUID, nicht angezeigte Forschungs-ID                                    | `study.sqlite`                    |
| Deletion lookup           | ausschließlich SHA-256-Hash des flüchtigen Löschcodes                                   | `study.sqlite`                    |
| Assignment                | Bedingung, Zuweisungsmodus, Config-ID, Guardrail-Form                                    | `study.sqlite`                    |
| Versioning                | Study-, Content-, Fragebogen-, Guardrail-, Consent-, Follow-up- und Referenzversion      | `study.sqlite`                    |
| Timing                    | Phase, Segment-ID, Start/Ende, monotone Dauer                                            | `study.sqlite`                    |
| Instruments               | Pre, Post, Guardrail, optionale offene Rückmeldung, später importiertes Follow-up        | `study.sqlite`                    |
| Presentation              | Form-ID und tatsächlich angezeigte Guardrail-Option-IDs                                  | `study.sqlite`                    |
| Completion                | complete, incomplete, technical failure                                                  | `study.sqlite`                    |
| Follow-up-Verknüpfung     | optionale Einwilligung, Follow-up-Version, optionaler Token-Hash                         | `study.sqlite`                    |
| Recontact                 | E-Mail, Roh-Token, Token-Hash, Consent-Version, Versand-/Schließzeitpunkte               | ausschließlich `recontact.sqlite` |
| Lokaler Löschworkflow     | tabellarische Anzahl betroffener Datensätze                                                | nur Prozessausgabe, nie persistiert |
| Ephemeral participant data | Anzeigename/Kürzel, roher Löschcode                                                      | nur flüchtiger Study-Renderer     |
| Training input/diagnosis  | fiktive Passwörter, Loginversuche, Findings, Ähnlichkeit                                 | nie persistieren                  |
| Reference quiz state      | im gemessenen Pfad nicht vorhanden; etwaige SCORM-Interaktionen der Unterrichtslektionen | nicht erheben                     |
| Sensitive real-world data | reale Konten, Passwörter, Tokens, Vorfälle                                               | nie erheben                       |
| Passive metadata          | IP, User-Agent, Request-Bodies                                                           | nicht persistieren                |

## Forschungsdatenbank

`study.sqlite` enthält:

- `study_sessions` für interne Session-UUID, Forschungs-ID, Löschcode-Hash, Zuweisung, Versionen, Follow-up-Einwilligung und Status;
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

Geschlecht und allgemeine Familiarity-Items werden nicht erhoben. Die vier Self-Efficacy-Paare
verwenden getrennte stabile IDs für Passwortverwaltung, Passwortmanager-Erzeugen/Speichern,
Passwortmanager-Abruf/Anmeldung und MFA-Aktivierung. Im Follow-up unterscheiden die
exklusiven Optionen `cannot_recall` und `no_answer` fehlende Erinnerung von verweigerter Angabe.
Die primären verzögerten Outcomes bleiben die einzelnen Optionen
`generated_stored_account_specific` und `enabled_mfa`; ein kombinierter Behavior Score wird nicht
gebildet.

## Pseudonymisierung und Recontact

Die Forschungs-ID wird serverseitig zufällig erzeugt und enthält keine Initialen, Matrikelnummer
oder Zeitstempel. Sie wird den Teilnehmenden nicht angezeigt. Der Löschcode wird unabhängig davon
kryptographisch im Browser erzeugt; nur sein SHA-256-Hash wird gespeichert. Rohcode und Hash
werden nicht in Forschungsdatenexporte aufgenommen. Pseudonymisierte Forschungsdaten bleiben
geschützt und zugriffsbeschränkt.

Die optionale Nachbefragung beeinflusst weder Teilnahme noch Condition-Zuweisung. Bei Einwilligung
enthält `~/.passwo-study/recontact.sqlite` ausschließlich Token-Hash und Roh-Token, E-Mail-Adresse,
Consent-Version sowie Registrierungs-, Einladungs-, Erinnerungs-, Schließ- und Versandstatus. Die
Registry enthält keine Condition, Antworten, Timings oder Trainingsdaten.

Ein Verzicht oder ein abgebrochener Registrierungsversuch setzt Einwilligungsstatus und Token-Hash
in der Forschungsdatenbank zurück und entfernt einen gegebenenfalls angelegten Registry-Datensatz,
ohne Session, Forschungs-ID, Löschcode-Hash oder Condition zu verändern.

## Lokaler Löschworkflow

`pnpm study:delete` ist ausschließlich ein lokaler CLI-Prozess, keine HTTP-Funktion und keine
Teilnehmeroberfläche. Er akzeptiert keinen Identifikator außer einem Löschcode im `PW-`-Format,
liest diesen nicht als Kommandozeilenargument und hält ihn nur bis zur SHA-256-Berechnung im
Prozessspeicher. Die Auflösung verwendet ausschließlich `deletion_code_hash`.

Ohne `--confirm` ist der Workflow ein schreibgeschützter Dry-Run. Seine Ausgabe beschränkt sich
auf die Namen der betroffenen Tabellen und ihre Datensatzanzahlen; sie enthält keine Antworten,
E-Mail-Adressen, Forschungs-IDs, Session-IDs, Token oder Löschcode-Hashes. Mit `--confirm` löscht
er die Session, abhängige Timing-, Submission-, Response-, Präsentations-, Lease- und
Zuweisungsdatensätze sowie eine vorhandene `recontact.registrations`-Zeile transaktional. Ein
Löschprotokoll wird nicht persistiert.

Bereits erzeugte Exporte, Schedule-Dateien und Backups sind nicht Teil der SQLite-Transaktion. Der
Workflow verändert sie nicht und darf ihre Löschung nicht behaupten.

## Speicherort und Rechte

- Standard: `~/.passwo-study/study.sqlite` und getrennt `recontact.sqlite`.
- Verzeichnisrecht `0700`, Dateien möglichst `0600`.
- Kein automatischer Cloud-Sync-Pfad.
- Browser Storage, IndexedDB und Service Worker sind unzulässig.
- Exporte werden nur in explizit gewählte lokale Zielverzeichnisse geschrieben.

## Export

Der Forschungsdatenexport enthält Sessions, Timing, Responses und Response Presentations unter
einer gemeinsamen `researchId` als CSV und JSON, ein Data Dictionary sowie ein Manifest mit
Versionen, Zählungen und SHA-256-Prüfsummen. Er enthält keine interne Session-UUID, keinen
Löschcode oder Löschcode-Hash, keine E-Mail, Roh-Tokens, Token-Hashes, Trainingsinputs oder
SecAware-Quizdaten.
Das native SecAware-Abschlussquiz ist aus dem gemessenen Referenzpfad entfernt; PassWo-interne
Lernfragen dürfen bestehen, werden aber ebenso wenig als gemeinsamer Outcome exportiert. Beide
Bedingungen bearbeiten den gemeinsamen externen Guardrail.

Der getrennte Schedule-Export enthält ausschließlich E-Mail, individuellen Token-Link sowie
Einladungs-, Erinnerungs- und Schließzeitpunkte. Er enthält weder Condition noch
Forschungsantworten.

Aufbewahrungs-, Lösch- und Backup-Fristen sind vor dem Study Freeze festzulegen. Die Runtime führt
keine automatische Löschung aus; ausschließlich der oben definierte, ausdrücklich bestätigte
lokale CLI-Workflow kann einzelne Research- und Recontact-Datensätze löschen.

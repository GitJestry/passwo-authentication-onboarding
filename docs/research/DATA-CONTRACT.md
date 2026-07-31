# Data Contract

## Datenklassen

| Klasse | Beispiele | Persistenz |
|---|---|---|
| Study identity | Session UUID, pseudonymer Teilnehmercode | erlaubt |
| Assignment | Bedingung, Zuweisungsmodus, Config-ID | erlaubt |
| Versioning | Commit, Content-, Fragebogen-, Consent-, Referenzversion | erlaubt |
| Timing | Phase, Segment-ID, Start/Ende, monotone Dauer | erlaubt |
| Instruments | Pre, Post, Mechanism Recognition, Szenarioantworten | erlaubt |
| Completion | complete, incomplete, technical failure | erlaubt |
| Follow-up-Verknüpfung | optionale Einwilligung, Instrumentversion, optionaler Token-Hash | erlaubt in `study.sqlite` |
| Recontact | E-Mail, Roh-Token, Token-Hash, Consent-Version, Versand-/Schließzeitpunkte | nur in `recontact.sqlite` |
| Ephemeral personalization | Anzeigename/Kürzel | nur flüchtiger Electron-Renderer; Persistenz verboten |
| Training input | fiktive Passwörter und Loginversuche | nur flüchtiger Electron-Renderer; Persistenz verboten |
| Training diagnosis | Findings, Ähnlichkeit, Abrufbarkeit, Auswahlpfade | nur flüchtiger Electron-Renderer; Persistenz verboten |
| Reference quiz state | SecAware-Quizantworten, Quizpunkte, SCORM-Interaktionen | nur flüchtige eingebettete Laufzeit; Persistenz und Outcome-Nutzung verboten |
| Sensitive real-world data | reale Konten, Passwörter, Tokens, Vorfälle | nie erheben |
| Passive metadata | IP, User-Agent, Request-Bodies | nicht persistieren |

## Datenbankschema

Drei exportierbare fachliche Tabellen reichen für den Start:

- `study_sessions` — Identität, Zuweisung, Versionen und Status;
- `timing_events` — idempotente Zeitereignisse;
- `responses` — versionierte Instrument-/Itemantworten.

`assignment_slots` verwaltet nur die verdeckte Blockzuweisung.
`artifact_leases` enthält ausschließlich operative Heartbeat- und Schließzeitpunkte zur
Reload-Erkennung. Diese Betriebsmetadaten sind weder Forschungstiming noch Bestandteil der
Sessions-, Timing- oder Responses-Exporte.

`study.sqlite` enthält den Follow-up-Einwilligungsstatus, die Follow-up-Version und optional den
Token-Hash, aber niemals E-Mail, Roh-Token oder Recontact-Request-ID. `recontact.sqlite` enthält
E-Mail, Roh-Token, Token-Hash, Consent-Version sowie Einladungs-, Erinnerungs-, Schließ- und
Versandzeitpunkte. Sie enthält keine Condition, Antworten, Timings, Demografie oder
Trainingsdiagnosen.

## Antwortformat

Antworten werden durch `instrumentId` und `itemId` adressiert. `value` ist ein begrenzter,
validierter JSON-Wert. Freitext wird nur aufgenommen, wenn er methodisch beschlossen und mit
Datenschutzhinweis versehen ist.

## Pseudonymisierung

Der Teilnehmercode wird zufällig erzeugt und enthält keine Initialen, Matrikelnummer oder
Zeitstempel. Operative und analytische Forschungsdaten bleiben unter diesem stabilen Schlüssel
pseudonymisiert, damit Instrumentteile und Follow-up-Antworten verknüpft, unvollständige Sitzungen
geprüft und Löschanfragen bearbeitet werden können. Pseudonymisierte Forschungsdaten sind weiterhin
geschützte Forschungsdaten und entsprechend zugriffsbeschränkt zu behandeln.

Direkte Kontaktdaten für die optionale Nachbefragung liegen ausschließlich in der getrennten
Recontact-Registry. Der normale Forschungsdatenexport liest diese Registry nicht und enthält weder
E-Mail-Adressen noch Roh-Tokens, Follow-up-Links oder Token-Hashes.

## Speicherort und Rechte

- Standard: `~/.passwo-study/study.sqlite`.
- Verzeichnisrecht `0700`, Datei möglichst `0600`.
- Kein automatischer Cloud-Sync-Pfad.
- Exporte werden in ein explizites lokales Zielverzeichnis geschrieben.
- Browser Storage, IndexedDB und Service Worker sind auch innerhalb des Electron-Renderers keine
  zulässige Persistenz.

## Export

Jeder Export enthält:

- CSV-Dateien für Sessions, Timing und Responses;
- JSON-Kopie derselben Tabellen;
- Manifest mit Exportzeit, Schema-Version, Studienversionen und SHA-256-Hashes;
- kein privates Source-Dokument und keinen flüchtigen Trainingszustand.

Operative Datenbank und regulärer Export bleiben pseudonymisiert. Ergebnisse werden in der
Bachelorarbeit ausschließlich aggregiert dargestellt.

Der explizite, separate Schedule-Export enthält ausschließlich E-Mail-Adresse, individuellen
Token-Link sowie Einladungs-, Erinnerungs- und Schließzeitpunkte. Er enthält weder Condition noch
Forschungsantworten.

Aufbewahrung, Löschung und Backup-Zeitpunkte folgen einem separat freizugebenden Plan. Der konkrete
Fristwert für Löschanfragen ist vor dem Study Freeze festzulegen und bleibt bis dahin ein
Study-Freeze-Blocker. Die Runtime führt keine automatische oder destruktive Löschung der Research-
oder Recontact-Datenbank durch. Die spätere Löschung der Recontact-Registry ist als Funktion des
Follow-up-Import-/Debrief-Workflows umzusetzen, sobald dieser den Antwortimport und den Versand des
abschließenden Debriefings zuverlässig feststellen kann.

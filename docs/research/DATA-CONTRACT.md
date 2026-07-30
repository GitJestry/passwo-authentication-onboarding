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

## Antwortformat

Antworten werden durch `instrumentId` und `itemId` adressiert. `value` ist ein begrenzter,
validierter JSON-Wert. Freitext wird nur aufgenommen, wenn er methodisch beschlossen und mit
Datenschutzhinweis versehen ist.

## Pseudonymisierung

Der Teilnehmercode wird zufällig erzeugt und enthält keine Initialen, Matrikelnummer oder
Zeitstempel. Eine mögliche externe Zuordnung für Vergütung oder Terminplanung liegt außerhalb der
Anwendung und getrennt von den Studiendaten.

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

Aufbewahrung, Löschung und Backup-Zeitpunkte werden mit Betreuung/Datenschutz festgelegt und
nicht durch Code stillschweigend angenommen.

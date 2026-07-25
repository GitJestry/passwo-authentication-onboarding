# Roadmap mit Abnahmetoren

Die Reihenfolge reduziert das größte Projektrisiko: erst Studien- und Interaktionsgrundlagen
validieren, dann Inhalt skalieren. Nicht alle 18 Segmente gleichzeitig bauen.

M0 bis M3 sind abgeschlossen. M4 ist der nächste Meilenstein.

## M0 — Foundation und Scope Freeze (abgeschlossen)

**Ergebnis:** Repository, ADRs, private Quellen, Segmentindex, Datengrenze, Studienfluss.

**Gate:** Supervisor bestätigt Inhaltsumfang, gespeicherte Variablen, Randomisierung und
Referenzbedingung.

## M1 — Technischer Walking Skeleton (abgeschlossen)

Minimaler vollständiger Pfad:

`Einwilligung → Pre-Platzhalter → Anzeigename → Bedingung → Artefakt-Platzhalter →
Post-Platzhalter → Guardrail-Platzhalter → Debrief → Export`

Dabei funktionieren bereits Sitzungsanlage, permutierte Blockzuweisung, Gesamtzeit, lokale
SQLite-Persistenz, Fehlerzustand und Export.

**Gate:** In der Datenbank stehen ausschließlich erlaubte Felder. Ein Reload während des
Trainings markiert den Durchlauf als unvollständig; Trainingszustand wird nicht rekonstruiert.

## M2 — Visual Platform Vertical Slice (abgeschlossen)

- BrowserShell mit fiktiven Tabs und neutraler macOS-Anmutung.
- PassWo-Renderer mit Platzhalterpose, Flugbewegung, Dock und Sprechblase.
- AnimationSequence-Handshake mit `replay` und `continue`.
- `/design-lab` für deterministische Zustände und Screenshots.
- Segment S00 als erster echter Inhaltsdurchlauf.

**Gate:** Reduced Motion, Tastatur und feste Screenshot-Viewports funktionieren.

## M3 — Knotennetzwerk Vertical Slice (abgeschlossen)

- Authored Layout und React-Flow-Adapter.
- Ein vollständiger Durchlauf aus S02 „Konten verstehen“.
- Eine Konsequenzkette aus S06 mit neutral, betroffen, hypothetisch und blockiert.
- Farbcodierung immer zusätzlich durch Form, Label oder Icon.

**Gate:** Netzwerkzustände werden nur durch Domänenereignisse verändert; keine React-Flow-Typen
lecken in Content oder Engine.

## M4 — Passwortmodul S00–S11 (nächster Meilenstein)

- Passwortanalyse als reine, simulationsspezifische Heuristik.
- Abrufbarkeit, Leak, drei Angriffswege, Ähnlichkeit, Diagnose, Wortmethode und Skalierungsbrücke.
- Adaptive Texte und Kontrastbeispiele.

**Gate:** Fachliche Testfälle und Teilnehmertexte sind einzeln geprüft. Keine Produktions-
„Passwortstärke“-Behauptung.

## M5 — Passwortmanager und MFA S12–S17

- Produktneutrale Passwortmanager-Simulation.
- Autofill-Ausnahme, Tresorzugang, Recovery-Hinweis, Systemwahl.
- MFA-Faktoren, Aktivierungssimulation und integrierte Abschlusskarte.

**Gate:** Passwortmanager und MFA werden weder überversprochen noch als Ersatz für einzigartige
Passwörter dargestellt.

## M6 — Forschungsinstrumente und Referenzartefakt

- Finale Pre-/Post-Fragebögen und Guardrail-Rubrik versionieren.
- SecAware-Version, Zugriffspfad, Datum und Abschlusskriterium einfrieren.
- Referenzlauncher und Rückkehrbestätigung testen.
- Vollständiger Datenexport mit Codebook.

**Gate:** Beide Bedingungen haben dieselbe neutrale Einführung, Timingregel und Nachbefragung.

## M7 — Pretest und Hardening

- Technischer Smoke-Test auf dem tatsächlichen MacBook.
- 3–5 Pilotdurchläufe pro Bedingung.
- Dead Ends, missverständliche Erklärungen, Dauer, Pop-up-Blocker und Datenexport prüfen.
- Änderungen protokollieren.

**Gate:** Keine kritischen Findings; Studienkonfiguration wird eingefroren.

## M8 — Study Freeze

- Commit-Hash, Content-Version, Fragebogen-Version, Consent-Version und Referenzversion fixieren.
- Automatische Updates und externe Abhängigkeiten während der Studie vermeiden.
- Backup- und Exportprozedur trocken testen.

Nach dem Freeze nur noch dokumentierte kritische Bugfixes mit Versionssprung.

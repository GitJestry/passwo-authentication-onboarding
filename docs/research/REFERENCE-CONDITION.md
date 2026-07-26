# Reference Condition: SecAware.NRW

## Eingefrorener lokaler Stand

Für diese Bedingung ist der am 2026-07-26 lokal bereitgestellte Originalsnapshot eingefroren.
Seine intern aus dem Base64-Datensatz von `__fetchCourse` ermittelte Kennzeichnung lautet
`V9 (27.03.2026)`. Die frühere YAML-Angabe `V10` gehörte nicht zum tatsächlich bereitgestellten
Snapshot und wurde verworfen. Daraus folgt keine Aussage, dass V9 die neueste Veröffentlichung
ist.

Der Originalsnapshot bleibt bytegenau unverändert und ungetrackt unter
`research/private/reference/secaware/passwords-authentication/2026-07-26/source/`. Das ebenfalls
ungetrackte Verzeichnis `study-build/` wird ausschließlich durch
`scripts/build-reference-artifact.mjs` vollständig gelöscht und deterministisch rekonstruiert.
Quell- und Buildhash sowie die kanonische Studienversion stehen in
`research/derived/reference-artifact.yaml`. Jede erlaubte Transformation ist mit Ziel-ID und
Begründung in `research/derived/reference-artifact-transform.yaml` dokumentiert.

## Studienadaption

Der dekodierte Kurs muss die Course-ID `CwynTB5JDjzJgtE8M2SKmgtgC6sM4C4h` besitzen. Der
Teilnehmerpfad enthält danach ausschließlich die ursprüngliche Section und die drei
Unterrichtslektionen:

- Starke Passwörter;
- Passwort-Manager;
- Multi-Faktor-Authentifizierung.

Der SecAware-Quiz, die Veröffentlichungshinweise und die Nutzungshinweise werden aus dem
Kursdatensatz entfernt. Unterrichtsaussagen, Videos, Übungen und Zusammenfassungen der drei
Lektionen bleiben unverändert. Lediglich der navigationsbezogene Titel im letzten Continue-Block
`cld8nihms01nn1tdj5q8tcthv` lautet `Training abschließen`. Die Kursbeschreibung wird geleert,
Telemetrie wird deaktiviert und die Abschlussanforderung wird auf 100 Prozent der drei Lektionen
gesetzt.

## Integration und Abschluss

Der lokale Study Server liefert ausschließlich den generierten Build unter
`/reference/secaware/passwords-authentication/` aus. Der Studienwrapper zeigt den SCORM-Einstieg
same-origin und viewportfüllend in einem iframe im bestehenden Browserfenster. Es gibt keinen
separaten Tab, keine manuelle Rückkehrbestätigung und keinen zusätzlichen Trainingsheader.

Der generierte SCORM-Treiber umschließt den tatsächlichen erfolgreichen Aufruf von
`SetReachedEnd`. Höchstens einmal sendet er an `window.top` die Nachricht
`{ type: "passwo:reference-completed" }` mit der eigenen Origin als Ziel. Der Wrapper akzeptiert
sie nur von seiner konfigurierten iframe-Window-Referenz, von derselben Origin und mit exakt diesem
Nachrichtentyp. Erst dann erscheint die study-eigene Abschlussleiste. Die dortige Aktion beendet
das globale Artifact-Timing und wechselt in den gemeinsamen Post-Fragebogen.

Weder Quizantworten noch SCORM-Interaktionen, Lernfortschritt oder persönliche Daten werden
gelesen, gespeichert oder exportiert. Für diese Bedingung entstehen weiterhin keine
Segment-Timingevents.

## Vergleichsgrenzen

- Primär vergleichbar ist die Gesamtartefaktzeit.
- Medienformat, Länge, Pacing, Feedback und visuelle Gestaltung bleiben Teil des jeweiligen
  Gesamtartefakts.
- Kürzere Zeit ist nicht automatisch besser; sie wird zusammen mit Abdeckung und Guardrails
  interpretiert.
- Kein Ergebnis wird einem einzelnen PassWo-Prinzip kausal zugeschrieben.

## Offline-/Ausfallplan

Vor einer Reference Study baut `pnpm study:start` das private Studienartefakt neu und prüft danach
Originalhash, Transformationskonfiguration, Course- und Lesson-IDs, entfernte Lektionen,
Buildhash, kanonische Version und Completion-Bridge. Fehlt der private Snapshot oder stimmt eine
Integritätsangabe nicht, startet der Studienbetrieb nicht. Allgemeine öffentliche Checks und ein
explizit `forced-supportive` gestarteter Lauf benötigen die privaten Dateien nicht.

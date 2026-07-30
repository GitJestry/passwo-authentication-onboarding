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
Teilnehmerpfad enthält danach ausschließlich die ursprüngliche Section, die drei
Unterrichtslektionen und das native Quiz:

- Starke Passwörter;
- Passwort-Manager;
- Multi-Faktor-Authentifizierung;
- Quiz: Passwörter & Authentifizierung // BE SecAware!

Die Veröffentlichungshinweise und die Nutzungshinweise werden aus dem Kursdatensatz entfernt.
Unterrichtsaussagen, Videos, Übungen, Zusammenfassungen und das native Quiz bleiben unverändert.
Der letzte Continue-Block der MFA-Lektion führt wie im Originalsnapshot in das Quiz. Die
Kursbeschreibung wird geleert, Telemetrie wird deaktiviert und ihr externer Fetch-Endpunkt
entfernt. Der abschließende Continue-Block des Quiz lautet `Training abschließen`, weil die
nachfolgende Nutzungshinweis-Lektion nicht zum Teilnehmerpfad gehört. Die Abschlussanforderung
deckt die drei Unterrichtslektionen ab. Ein abgeschlossener Quizversuch löst den Studienabschluss
auch bei einem nicht bestandenen Quiz aus; Quizpunkte und -ergebnis bleiben dafür ohne Bedeutung.
Die provider-eigene Aktion zum Verlassen des
Kurses wird im lokalen Kursdatensatz deaktiviert und dadurch nicht gerendert. Wird
`Training abschließen` vor dem vollständigen Unterrichtspfad ausgewählt, bleibt die Aktion
verfügbar und nennt die noch nicht bearbeiteten Unterrichtslektionen.

Die explizit eingefrorenen Quiz-labelSet-Schlüssel bleiben für das native Quiz erhalten. Die
Texte und Ziele der zwölf sichtbaren supplementären Links der drei Lektionen bleiben wortgleich
erhalten.
Jeder Link erhält eine kanonische ID; vier leere Duplikat-Anker werden entfernt. Eine
Capture-Bridge unterbindet die Navigation im iframe und sendet nur Typ, Snapshot-ID und Link-ID
an den Studienwrapper. Externe Thumbnail- und Darstellungsmetadaten werden auf bereits im Snapshot
enthaltene lokale Assets umgeschrieben. Die drei nicht-instruktionalen 2-Pixel-Provider-iframes
werden auf das im Snapshot enthaltene lokale `scormdriver/blank.html` begrenzt. Alle Ziele und
Content-IDs sind im Transformationsmanifest dokumentiert; eine unbekannte externe Referenz bricht
den Build ab.

## Integration und Abschluss

Der lokale Study Server liefert ausschließlich den generierten Build unter
`/reference/secaware/passwords-authentication/` aus. Der Studienwrapper zeigt den SCORM-Einstieg
same-origin und viewportfüllend in einem iframe im App-Fenster. Das iframe erlaubt nur Scripts und
Same-Origin-Zugriff; Popups, Top-Level-Navigation, Downloads und Formübertragungen bleiben
gesperrt. Es gibt keinen separaten Tab, keine manuelle Rückkehrbestätigung und keinen zusätzlichen
Trainingsheader.

Der Wrapper akzeptiert Zusatznavigation ausschließlich von seiner konfigurierten
iframe-Window-Referenz, von derselben Origin, mit exakter Schlüsselmenge sowie eingefrorenem Typ,
Snapshot-ID und Link-ID. In der Desktop-App öffnen Webseiten ihre kanonische HTTP(S)-URL in einem
nicht persistenten, sandboxed Viewer. Das eingefrorene PDF wird gemäß ADR 0011 begrenzt geladen,
validiert und durch den lokal gebündelten PDF-Viewer im selben isolierten View dargestellt. Dessen
56-Pixel-Leiste bietet jederzeit „Zurück zum Training“. Der Viewer wird beim Zurückkehren zerstört;
Kurszustand, Operational Lease und globale Artefaktzeit bleiben erhalten. Im
Browser-Entwicklungsmodus erscheint nur ein technischer Hinweis.

Der generierte SCORM-Treiber umschließt den tatsächlichen erfolgreichen Aufruf von
`SetReachedEnd`. Höchstens einmal sendet er an `window.top` die Nachricht
`{ type: "passwo:reference-completed", snapshotId:
"secaware-passwords-authentication-2026-07-26" }` mit der eigenen Origin als Ziel. Der Wrapper
akzeptiert sie nur von seiner konfigurierten iframe-Window-Referenz, von derselben Origin und mit
exakt diesem Nachrichtentyp, dieser Snapshot-ID und dieser Schlüsselmenge. Das erste gültige
Signal nach Abschluss der drei Unterrichtslektionen und des aufgerufenen nativen Quiz beendet unmittelbar
das globale Artifact-Timing und wechselt in den gemeinsamen Post-Fragebogen; weitere Signale
bleiben ohne Wirkung. Danach folgt derselbe externe Understanding Guardrail wie in der
PassWo-Bedingung.

Weder Quizantworten noch Quizpunkte, SCORM-Interaktionen, Lernfortschritt oder persönliche Daten
werden gelesen, gespeichert oder exportiert. Quizantworten und Quizpunkte sind keine
Studienoutcomes. Für diese Bedingung entstehen weiterhin keine Segment-Timingevents.

## Vergleichsgrenzen

- Primär vergleichbar ist die Gesamtartefaktzeit.
- Medienformat, Länge, Pacing, Feedback und visuelle Gestaltung bleiben Teil des jeweiligen
  Gesamtartefakts.
- Kürzere Zeit ist nicht automatisch besser; sie wird zusammen mit Abdeckung und Guardrails
  interpretiert.
- Kein Ergebnis wird einem einzelnen PassWo-Prinzip kausal zugeschrieben.

## Offline-/Ausfallplan

Vor einer Reference Study bauen `pnpm dev` beziehungsweise `pnpm desktop:package` das private
Studienartefakt neu und prüfen danach Originalhash, Transformationskonfiguration, Course- und
Lesson-IDs, entfernte Lektionen, Buildhash, kanonische Version, zwölf Zusatz-IDs sowie
Completion-Bridge. `pnpm test:reference-artifact` startet die gebaute Runtime direkt als
Integrationstest. Fehlt der private Snapshot oder stimmt eine Integritätsangabe nicht, startet
der produktive Studienbetrieb nicht. Allgemeine öffentliche Checks und ein explizit
`forced-supportive` gestarteter Lauf benötigen die privaten Dateien nicht.

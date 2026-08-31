# Reference Condition: SecAware.NRW

Status: **implementierter eingefrorener Referenzpfad.**

## Snapshot und Build

Verwendet wird der lokale Snapshot vom 26. Juli 2026 mit interner Kennzeichnung
`V9 (27.03.2026)`. Daraus folgt keine Aussage über die neueste öffentliche SecAware-Version.

Der bytegenaue Originalsnapshot bleibt ungecheckt unter
`research/private/reference/secaware/passwords-authentication/2026-07-26/source/`. Der
deterministische Build wird aus ihm neu erzeugt. Quell-/Buildhash und Studienversion stehen in
`research/derived/reference-artifact.yaml`; jede Transformation mit Ziel-ID und Begründung in
`research/derived/reference-artifact-transform.yaml`.

## Studienadaption

Der Kurs besitzt die geprüfte Course-ID `CwynTB5JDjzJgtE8M2SKmgtgC6sM4C4h` und enthält im
administrierten Pfad genau die drei Lektionen:

- Starke Passwörter;
- Passwort-Manager;
- Multi-Faktor-Authentifizierung.

Unterrichtsaussagen, Videos, Übungen und Zusammenfassungen bleiben unverändert. Entfernt werden
Veröffentlichungs-/Nutzungshinweise, das native terminale Quiz, provider-eigene Verlassen-Aktionen
und nichtinstruktionale Metadaten. Der letzte Continue-Block heißt `Training abschließen` und löst
nach allen drei Lektionen genau ein lokales Completion-Ereignis aus.

Die zwölf sichtbaren Zusatzlinks behalten Wortlaut und eingefrorenes Ziel. Eine Capture-Bridge
sendet ausschließlich Typ, Snapshot-ID und Link-ID; vier leere Duplikatanker entfallen. Externe
Assetreferenzen werden nur auf im Snapshot vorhandene Dateien umgeschrieben. Unbekannte Referenzen
oder Integritätsabweichungen brechen den Build ab.

## Integration

Der Study Server liefert nur den generierten Build unter
`/reference/secaware/passwords-authentication/`. Der Wrapper rendert ihn same-origin,
viewportfüllend und sandboxed. Popups, Top-Level-Navigation, Downloads und Formübertragungen sind
gesperrt.

Bridge-Nachrichten werden nur von der konfigurierten iframe-Window-Referenz, derselben Origin und
mit exakter Schlüsselmenge akzeptiert. Im Web öffnen gültige Zusatzlinks ihre kanonische HTTP(S)-
URL mit `noopener` und `noreferrer` in einem separaten Tab. Electron verwendet den isolierten
Zusatzviewer aus ADR 0009/0011.

Ein erfolgreiches `SetReachedEnd` sendet höchstens einmal
`passwo:reference-completed` mit der eingefrorenen Snapshot-ID. Das erste gültige Signal beendet
das Artefaktintervall und öffnet den gemeinsamen Post-Flow. SCORM-Interaktionen, Lernfortschritt
und persönliche Daten werden weder gelesen noch gespeichert oder exportiert; es entstehen keine
Referenz-Segmenttimings.

## Vergleichsgrenze

- Verglichen werden zwei vollständige Lernartefakte über Gesamtartefaktzeit und gemeinsame Maße.
- Medienformat, Länge, Pacing und Feedback bleiben Teil der jeweiligen Bedingung.
- Kürzere Zeit ist nicht automatisch besser.
- Ergebnisse werden keinem einzelnen PassWo-Prinzip kausal zugeschrieben.

`pnpm dev`, `pnpm desktop:package` und das Release-Gate bauen und prüfen den privaten Snapshot.
Fehlt er oder weicht eine Integritätsangabe ab, startet der Referenzpfad nicht.

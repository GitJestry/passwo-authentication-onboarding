# ADR 0009 — Desktop Runtime und SecAware-Zusatznavigation

- **Status:** Accepted für die Desktop Runtime; die Browser-Zusatznavigation ist durch die
  Revision von `ADR 0016-Web-Resume-Lifecycle` ersetzt
- **Datum:** 2026-07-26
- **Ergänzt:** `ADR 0008-Reference` (eingebettetes, studienadaptiertes Referenzartefakt)

## Kontext

Der Studienbetrieb soll auf dem vorhandenen Apple-Silicon-MacBook als eigenständige Anwendung
gestartet werden. Die lokale React-/Fastify-/SQLite-Architektur, ihre HTTP-Verträge und der
Datenbankpfad dürfen sich dadurch nicht ändern. Zugleich gehören zwölf sichtbare
Zusatzinformationslinks zum eingefrorenen SecAware-Unterrichtstext. Im bisherigen Study Build
blieben ihre Texte sichtbar, die Navigation war jedoch entfernt. Ein normaler Systembrowser würde
die Anwendung verlassen und keinen verlässlichen Rückweg in den unveränderten Kurszustand bieten.

## Entscheidung

`apps/study-desktop` bildet eine schmale Electron-Hülle um dieselbe lokale Study Runtime.
Electron ist exakt auf `43.2.0`, Electron Forge exakt auf `7.11.2` festgesetzt. Die Hülle startet
den vorhandenen Fastify-Server auf `127.0.0.1` und einem dynamisch vergebenen Port, lädt dessen
Origin in ein Fenster ohne Adresszeile und beendet Server und SQLite-Verbindung beim App-Ende.
CLI und Desktop verwenden dafür dieselbe Start-/Stop-Schnittstelle. Die Datenbank bleibt
`~/.passwo-study/study.sqlite`.

Die Desktop-App ist der einzige produktive Studienpfad. `apps/study-web` bleibt der einzige
kanonische Renderer und `apps/study-server` die einzige Implementierung von HTTP-Endpunkten,
Randomisierung, Timing, Persistenz und Export. Browser und Design Lab sind interne Test- und
QA-Harnesses auf denselben Quellen. Reine Renderer-, Package- oder Servererweiterungen gelangen
durch den normalen Build in die Desktop-App und benötigen weder eine Kopie noch eine
Electron-spezifische Bundlerliste.

Das Hauptfenster und der Zusatzviewer folgen den
[Electron-Sicherheitsvorgaben](https://www.electronjs.org/docs/latest/tutorial/security):
Sandbox und Context Isolation sind aktiv, Node-Integration ist deaktiviert, Berechtigungen und
neue Fenster sind grundsätzlich gesperrt. Das Preload exponiert weder rohe URLs noch allgemeines
IPC, sondern nur das Öffnen einer kanonischen Link-ID und das Schließen des Zusatzviewers.

Die zwölf sichtbaren SecAware-Zusatzlinks werden in `@passwo/contracts` als eingefrorene
ID-/URL-Registry geführt. Der deterministische Study Build stellt ausschließlich diese `href`
wieder her, entfernt vier leere Duplikat-Anker und sendet beim Aktivieren nur
`{ type, snapshotId, linkId }` an den Wrapper. Der Wrapper akzeptiert die Nachricht erst nach
Prüfung von Window-Source, Origin, exakter Schlüsselmenge, Typ, Snapshot-ID und Link-ID.

Eine gültige ID öffnet ihre festgeschriebene HTTP(S)-URL in einem nicht persistenten,
sandboxed `WebContentsView`. Eine app-eigene, immer sichtbare 56-Pixel-Leiste zeigt
„Zusatzinformationen“ und „Zurück zum Training“. HTTP(S)-Navigation und Weiterleitungen bleiben
im selben View. Popups werden als Navigation dorthin umgeleitet. Downloads, Datei-Uploads,
Berechtigungen, Nicht-HTTP(S)-Protokolle und zusätzliche Fenster bleiben gesperrt. Ladefehler
zeigen eine lokale neutrale Fläche; URLs werden weder angezeigt noch geloggt.

Beim Zurückkehren wird der externe View zerstört und der Fokus an den aktivierten Link im
unveränderten SecAware-iframe zurückgegeben. Study-Artefaktzeit und Operational Lease laufen
durchgehend weiter. Ohne Desktop-Bridge dient der Browserpfad nur Entwicklung und Tests; der
Linkklick zeigt einen technischen Hinweis und navigiert nicht extern.

Das validierte SecAware-Completion-Signal beendet das Referenzartefakt unmittelbar und genau
einmal. Eine zusätzliche Bestätigungsleiste entfällt. Der bestehende Study-Statechart und die
Reihenfolge Timing-Ende → Post-Fragebogen → Guardrails → Debrief bleiben unverändert.

## Packaging

Electron Forge erzeugt lokal eine nicht signierte, nicht notarisierte arm64-App namens
`Authentication Onboarding.app`. Sie enthält den Web-Build und ausschließlich den verifizierten
SecAware-Study-Build, niemals den privaten Originalsnapshot. `better-sqlite3` wird durch Forges
Native-Module-Hook für die verwendete Electron-Version neu gebaut.

## Konsequenzen

- Es entstehen keine neuen HTTP-Endpunkte, Datenbankfelder oder persistierten Teilnehmerdaten.
- Neue native Fähigkeiten benötigen einen schmalen typisierten Port und Preload-Adapter;
  allgemeines IPC, rohe URL-Bridges und Domainlogik im Main-Prozess bleiben ausgeschlossen.
- Die externe Ausnahme gilt ausschließlich für die zwölf eingefrorenen Zusatz-IDs und nur im
  isolierten Desktop-Viewer; der SecAware-iframe selbst bleibt same-origin und netzwerkgesperrt.
- Änderungen an Link-ID, URL, Bridge-Payload oder Navigation erfordern eine neue
  Referenzartefaktrevision und aktualisierte Integritätswerte.
- Signierung, Notarisierung, Auto-Updates, Universal Builds und Mac App Store bleiben außerhalb
  dieser Entscheidung.

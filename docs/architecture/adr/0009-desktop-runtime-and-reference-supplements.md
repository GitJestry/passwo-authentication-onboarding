# ADR 0009 — Desktop Runtime und SecAware-Zusatzviewer

- **Status:** Accepted für Electron; Webnavigation wird durch ADR 0016 geregelt
- **Datum:** 2026-07-26

## Entscheidung

`apps/study-desktop` ist eine schmale Electron-Hülle für lokale Entwicklung, Packaging und QA.
Sie startet dieselbe Fastify-/SQLite-Runtime auf `127.0.0.1`, lädt den kanonischen Web-Renderer und
beendet Server und Datenbankverbindung mit der App. Forschungs-, Trainings- oder Exportlogik wird
nicht dupliziert.

Sandbox und Context Isolation sind aktiv; Node-Integration, allgemeines IPC, neue Fenster,
Downloads, Uploads und Berechtigungen bleiben gesperrt. Das Preload akzeptiert ausschließlich eine
kanonische SecAware-Link-ID und das Schließen des Zusatzviewers.

Die zwölf eingefrorenen SecAware-Zusatzlinks werden über die geprüfte ID-/URL-Registry geöffnet.
Electron zeigt HTTP(S)-Ziele in einem nicht persistenten isolierten View mit eigener
Zurück-Navigation; das lokale PDF verwendet den Viewer aus ADR 0011. Beim Schließen wird der View
zerstört und der Fokus in den unveränderten Kurs zurückgegeben.

Im produktiven Web öffnet ADR 0016 dieselben geprüften HTTP(S)-Ziele mit `noopener` und
`noreferrer` in einem separaten Tab.

## Konsequenzen

Die arm64-App enthält Web-Build und verifiziertes SecAware-Study-Build, nie den privaten
Originalsnapshot. Neue native Fähigkeiten benötigen einen schmalen typisierten Port. Änderungen
an Link-IDs, URLs oder Bridge-Payload erfordern eine Referenzartefaktrevision.

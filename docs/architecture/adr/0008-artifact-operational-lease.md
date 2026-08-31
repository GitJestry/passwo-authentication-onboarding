# ADR 0008 — Operative Artefakt-Lease

- **Status:** Legacy; für neue Websitzungen durch ADR 0016 ersetzt
- **Datum:** 2026-07-25
- **Citation label:** `ADR 0008-Lease`

## Geltungsbereich

Die Lease interpretiert ausschließlich lokale Electron- und historische Sitzungen. Neue
Hauptstudien-Websitzungen verwenden Resume-Cookie, Checkpoint und bestätigte Webintervalle.

## Legacy-Entscheidung

Eine aktive lokale Artefaktsitzung besitzt eine operative Lease mit Session-ID, letztem Heartbeat
und Ablaufzeit. Heartbeats laufen alle 60 Sekunden; fünf Minuten ohne Heartbeat schließen eine
offene Lease einmalig als `incomplete-reload`. Artefaktende und regulärer Abschluss schließen sie
sofort. Geschlossene Leases werden nicht reaktiviert.

Lease-Daten sind keine Forschungstimingevents, erscheinen nicht in Exporten und ein
Heartbeatfehler blockiert keinen Studienübergang. Diese Tabelle bleibt erhalten, damit lokale und
historische Datensätze interpretierbar bleiben.

# ADR 0004 — Ereignisbasierte Zeitmessung

- **Status:** Accepted
- **Datum:** 2026-07-23
- **Revision:** 2026-08-17 gemäß ADR 0016

## Entscheidung

Der Browser misst Dauer mit einer monotonen Uhr und sendet streng sequenzierte, idempotente
Timingereignisse. Der Server speichert bestätigte Artefaktintervalle und berechnet daraus die
auswertbare Dauer.

Das supportive Training sendet zusätzlich diagnostische Segmentgrenzen S00–S17. Die
Referenzbedingung besitzt keine Segmenttimings. Pro Sitzung ist höchstens ein Segment aktiv; ein
Übergang folgt erst auf den bestätigten Abschluss der vorherigen Grenze.

Browser-Schließen, Reload oder Verbindungsverlust beendet das aktuelle Webintervall, nicht den
Run. Nach Resume beginnt am sicheren Checkpoint ein neues Intervall. Offline-Zeit wird nicht
rekonstruiert; vollständig abgeschlossene Runs mit Unterbrechung erhalten ein Qualitätsflag.

## Konsequenzen

- Primär vergleichbar ist `SUM(web_artifact_intervals.confirmed_elapsed_ms)`.
- Visibility-Ereignisse sind diagnostisch und werden nicht zusätzlich addiert.
- Fehlgeschlagene methodische Writes blockieren den Übergang bis zum idempotenten Retry.
- Wall-clock-Zeit dient nur Audit und Fristen.
- Die lokale Lease bleibt Legacy und verändert Webtiming nicht.

Die vollständige Ereignis- und Exportsemantik steht in
`docs/research/TIMING-PROTOCOL.md`.

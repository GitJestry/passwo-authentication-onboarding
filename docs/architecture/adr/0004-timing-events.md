# ADR 0004 — Ereignisbasierte Zeitmessung

- **Status:** Accepted
- **Datum:** 2026-07-23

## Entscheidung

Der Browser misst mit einer monotone Uhr und sendet sequenzierte Start-, Pause-, Resume-, End-,
Visibility- und Abort-Ereignisse. Der Server speichert sie idempotent und berechnet exportierbare
Dauern aus den Ereignissen.

## Konsequenzen

- Gesamtartefaktzeit ist zwischen Bedingungen vergleichbar.
- Segmentzeiten sind nur für das supportive Training diagnostisch.
- Wall-clock Zeit dient der Auditierbarkeit, nicht der Dauermessung.

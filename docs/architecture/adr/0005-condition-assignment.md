# ADR 0005 — Verdeckte Condition-Zuweisung

- **Status:** Accepted
- **Datum:** 2026-07-23

## Entscheidung

Die Hauptstudie verwendet serverseitige permutierte Blöcke mit gleicher Anzahl supportive und
reference Plätze. Erzwungene Bedingungen sind ausschließlich Pretest-Konfiguration.

## Konsequenzen

- Der Client fordert keine Condition an und kann sie nicht überschreiben.
- Zuweisungsmodus und Ergebnis werden mit der Session versioniert.
- Zufallsquelle und Blockzustand müssen injizierbar und testbar sein.

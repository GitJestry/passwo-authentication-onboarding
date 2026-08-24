# ADR 0005 — Verdeckte Condition-Zuweisung

- **Status:** Accepted
- **Datum:** 2026-07-23
- **Revision:** 2026-08-24 für individuelle Löschung während der Rekrutierung

## Entscheidung

Die Hauptstudie verwendet serverseitige permutierte Blöcke mit gleicher Anzahl supportive und
reference Plätze. Erzwungene Bedingungen sind ausschließlich Pretest-Konfiguration.

## Konsequenzen

- Der Client fordert keine Condition an und kann sie nicht überschreiben.
- Zuweisungsmodus und Ergebnis werden mit der Session versioniert.
- Zufallsquelle und Blockzustand müssen injizierbar und testbar sein.
- Bei einer individuellen Löschung wird nur die Session-Verknüpfung ihres bereits gezogenen
  Condition- und Guardrail-Form-Slots entfernt. Der inhaltsfreie Slot bleibt bestehen und wird als
  nächster offener Slot erneut vergeben; es wird weder neu ausgelost noch ein unvollständiger Block
  zurückgelassen.

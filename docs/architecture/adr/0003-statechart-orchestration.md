# ADR 0003 — Statechart-Orchestrierung

- **Status:** Accepted
- **Datum:** 2026-07-23

## Entscheidung

Studienablauf und Training werden als getrennte XState-Maschinen modelliert. React projiziert
Snapshots und löst Ereignisse aus, besitzt aber keinen parallelen Workflow in Effects oder
Bool-Flags.

## Konsequenzen

- Kein zweiter globaler State Store.
- Pädagogische Übergänge und Fehlerpfade sind explizit testbar.
- Animationen melden Abschluss oder Fehler an den Mission Controller zurück.

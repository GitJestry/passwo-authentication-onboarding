# ADR 0007 — Austauschbare Renderer-Adapter

- **Status:** Accepted
- **Datum:** 2026-07-23

## Entscheidung

Animation, PassWo und Knotennetz werden über frameworkfreie Ports und Snapshotmodelle angebunden.
Motion und React Flow sind erste Adapter, aber keine Domänentypen.

## Konsequenzen

- Content und Engines importieren keine Rendererbibliotheken.
- Layoutpositionen und fachliche Endzustände sind deterministisch authored.
- Reduced Motion erzeugt denselben fachlichen Endzustand.

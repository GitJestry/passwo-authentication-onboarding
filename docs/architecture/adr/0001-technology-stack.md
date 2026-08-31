# ADR 0001 — Technologie-Stack

- **Status:** Accepted; Webauslieferung durch ADR 0016 präzisiert
- **Datum:** 2026-07-23

## Entscheidung

- Node.js 24, pnpm 11 und TypeScript 6.
- React 19 + Vite 8 als Client-SPA; kein SSR- oder RSC-Framework.
- Getrennte XState-5-Maschinen für Studie und Training.
- Motion und React Flow ausschließlich als Renderer-Adapter.
- Fastify + better-sqlite3 für API und lokale Persistenz.
- CSS Modules und CSS Custom Properties statt zusätzlichem Styling-Framework.
- Biome, Vitest, Playwright und axe für die vorhandenen Qualitätsgrenzen.

## Konsequenzen

Fastify liefert den Vite-Build same-origin im Web aus. Electron verpackt dieselbe Runtime für
lokale Entwicklung und QA. Es gibt keine Cloud-Datenbank, externe Analytics oder zweite fachliche
Implementierung. Kernabhängigkeiten werden vor dem Hauptstudien-Freeze eingefroren.

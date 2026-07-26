# ADR 0001 — Technologie-Stack

- **Status:** Accepted; Deploymententscheidung teilweise durch ADR 0009 abgelöst
- **Datum:** 2026-07-23

## Entscheidung

- Node.js 24 LTS und pnpm 11.
- React 19 + Vite 8 als reine Client-SPA; kein SSR/RSC-Framework.
- TypeScript 6 für den stabilen Compiler-API-Übergang; TypeScript 7 wird nach erneuter
  Tooling-Prüfung bewertet.
- XState 5 für Studien- und Trainingsorchestrierung.
- Motion für Animationen; React Flow als erster Netzwerkadapter.
- Fastify + better-sqlite3 für lokale Studiendaten.
- Biome, Vitest, Playwright und axe für Qualitätssicherung.
- CSS Modules und CSS Custom Properties statt Utility-Framework.

## Begründung

Die Anwendung ist eine lokale, interaktive Studien-SPA. SSR, Server Components und ein
Full-Stack-Metaframework würden zusätzliche Laufzeit- und Deploymentkomplexität erzeugen, ohne
für die Studie einen Nutzen zu liefern. XState macht lange adaptive Abläufe explizit. Fastify und
SQLite halten den Studienbetrieb lokal und auditierbar.

## Konsequenzen

- Ein Vite-Build wird im Studienmodus statisch durch Fastify ausgeliefert.
- ADR 0009 ersetzt den früher möglichen eigenständigen Browser-Produktionspfad durch die
  Desktop-App als einzigen produktiven Studienstart.
- Keine Cloud-Datenbank und keine externen Analytics.
- React Flow und Motion dürfen nur über Adaptergrenzen in die Domäne gelangen.
- Abhängigkeitsupdates erfolgen bewusst und werden vor dem Study Freeze gestoppt.

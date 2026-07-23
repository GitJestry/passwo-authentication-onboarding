# Erste Codex-Prompts

Die Prompts sind in der empfohlenen Reihenfolge auszuführen. Jeder Prompt ist bewusst klein.

## Prompt 1 — Foundation installieren und verifizieren

```text
Aufgabe:
Installiere die bestehende Workspace-Foundation, erzeuge pnpm-lock.yaml und behebe ausschließlich
reale Kompatibilitäts- oder Konfigurationsfehler, damit die vorhandenen Checks laufen.

Lies zuerst:
- AGENTS.md
- README.md
- docs/architecture/adr/0001-technology-stack.md
- SNAPSHOT-NOTES.md

Ändere nur:
- package.json
- pnpm-workspace.yaml
- pnpm-lock.yaml
- tsconfig*.json
- biome.json
- vorhandene Package-Konfigurationen, falls ein Check sonst nicht startet

Vorbedingung:
- Führe zuerst `node scripts/check-workspace-foundation.mjs` aus.
- Falls dieser Check fehlschlägt, stoppe ohne Rekonstruktion und berichte die fehlenden Pfade.

Akzeptanzkriterien:
- Node 24.18.0 und pnpm 11.15.1 werden verwendet.
- Keine Abhängigkeit wird hinzugefügt oder entfernt, außer sie ist für die vorhandene Foundation
  objektiv erforderlich; dann dokumentiere den Grund.
- pnpm install, pnpm typecheck, pnpm test und pnpm check:research-boundary laufen erfolgreich.
- Der Lockfile wird committed.

Nicht-Ziele:
- keine neue UI oder Trainingsfunktion
- keine Umstrukturierung der Architektur
- keine Teilnehmertexte ändern

Checks:
- pnpm check
- pnpm build

Abschlussbericht:
- geänderte Dateien
- ausgeführte Checks
- offene Risiken/Entscheidungen, maximal 3
```

## Prompt 2 — End-to-End Study Walking Skeleton

```text
Aufgabe:
Implementiere einen minimalen vollständigen Studienpfad von Consent bis Completion mit
Platzhalterinstrumenten, serverseitiger Condition-Zuweisung und persistierter Gesamtzeit.

Lies zuerst:
- AGENTS.md
- apps/study-web/AGENTS.md
- apps/study-server/AGENTS.md
- docs/research/STUDY-RUNTIME.md
- docs/research/DATA-CONTRACT.md
- docs/research/TIMING-PROTOCOL.md

Ändere nur:
- apps/study-web/src/features/study/**
- apps/study-web/src/api/**
- apps/study-web/src/app/**
- apps/study-server/src/**
- packages/study-engine/**
- packages/contracts/**
- passende Tests

Akzeptanzkriterien:
- Pfad: Consent → Pre-Platzhalter → DisplayName → zugewiesenes Artefakt-Platzhalter →
  Post-Platzhalter → Guardrail-Platzhalter → Debrief → Complete.
- DisplayName bleibt nur im Study-Machine-Kontext, wird nie gesendet und nach Artefaktende
  gelöscht.
- Der Client kann keine Condition wählen.
- artifact.start und artifact.end werden idempotent gespeichert.
- Ein API-Fehler blockiert den nächsten methodischen Übergang mit neutraler Meldung.
- E2E-Tests decken beide erzwungenen Pretest-Bedingungen ab.

Nicht-Ziele:
- keine finalen Fragebogenitems
- kein echtes Training
- kein SecAware-Inhalt oder Iframe

Checks:
- pnpm check
- pnpm test:e2e
```

## Prompt 3 — BrowserShell und Design Lab

```text
Aufgabe:
Baue die fiktive BrowserShell als wiederverwendbare Bühne und ergänze deterministische Design-Lab-
Szenen für normalen, abgedunkelten und PassWo-Overlay-Zustand.

Lies zuerst:
- AGENTS.md
- apps/study-web/AGENTS.md
- docs/design/DESIGN-SYSTEM.md
- docs/design/BROWSER-SHELL.md
- docs/design/PASSWO.md

Ändere nur:
- packages/ui/**
- apps/study-web/src/design-lab/**
- apps/study-web/src/app/** für Route-Verknüpfung
- passende Tests

Akzeptanzkriterien:
- Kein reales Browserlogo, keine echte URL-Funktion und keine externe Schrift.
- Tabs, Address und Overlay sind vollständig props-/snapshotgesteuert.
- 1440×900 und 1280×720 funktionieren ohne horizontalen Scroll.
- Fokus und Tastatur sind sichtbar; axe meldet keine serious/critical Findings.
- Reduced Motion beeinflusst die Informationsdarstellung nicht.

Nicht-Ziele:
- keine Trainingsnavigation
- keine React-Flow-Integration
- keine finalen PassWo-Assets extrahieren

Checks:
- pnpm check
- pnpm test:e2e
```

## Prompt 4 — Mission-/Animations-Handshake und S00

```text
Aufgabe:
Implementiere Segment S00 als ersten echten vertikalen Trainingsschnitt über Content-Daten,
Mission Controller, Motion-Adapter und Replay/Weiter-Handshake.

Lies zuerst:
- AGENTS.md
- packages/training-content/AGENTS.md
- docs/design/ANIMATION-SYSTEM.md
- docs/design/PASSWO.md
- research/derived/segment-index.md Abschnitt S00
- research/private/training-script.pdf nur die intern paginierte Seite 2

Ändere nur:
- packages/training-content/**
- packages/training-engine/**
- apps/study-web/src/features/training/**
- apps/study-web/src/adapters/animation/**
- passende Tests und Design-Lab-Szene

Akzeptanzkriterien:
- Ablauf: kurzer PassWo-Text → eine sichtbare Änderung → Replay/Weiter.
- Anzeigename wird nur aus flüchtigem Study-Kontext übergeben.
- Safety Note und Pflichtbestätigung sind sichtbar.
- Kein Passwortfeld und keine Speicherung in S00.
- Reduced Motion landet im identischen fachlichen Endzustand.
- Segmentstart/-ende werden vom Statechart an den Timer gemeldet.

Nicht-Ziele:
- keine S01-Logik
- keine finalen PassWo-Grafikassets
- kein generisches CMS

Checks:
- pnpm check
- pnpm test:e2e
```

## Prompt 5 — Knotennetz-Vertical-Slice S02

```text
Aufgabe:
Implementiere einen vollständigen S02-Kontenknoten als React-Flow-Adapter auf dem frameworkfreien
Scene-Modell. Nutze zuerst CampusID mit drei abhängigen Diensten.

Lies zuerst:
- AGENTS.md
- apps/study-web/AGENTS.md
- docs/design/NETWORK-SYSTEM.md
- docs/architecture/adr/0007-renderer-adapters.md
- research/derived/segment-index.md Abschnitt S02
- research/private/training-script.pdf nur intern paginierte Seiten 4–5

Ändere nur:
- packages/visualization/**
- packages/training-content/** für S02-Teilscene
- apps/study-web/src/adapters/network/**
- apps/study-web/src/features/training/segments/S02/**
- passende Tests und Design-Lab-Szene

Akzeptanzkriterien:
- Domain enthält keine React-Flow-Typen.
- Positionen sind authored und deterministisch.
- Dienste erscheinen einzeln; Status `verstanden` entsteht erst nach allen drei Vorschauen.
- Farbe ist nicht der einzige Statuskanal.
- PassWo-/Animationsereignisse laufen über vorhandene Ports.

Nicht-Ziele:
- keine vollständige S02-Implementierung für alle Konten
- kein automatisches Graphlayout
- keine Angriffsfarben aus S06

Checks:
- pnpm check
- pnpm test:e2e
```

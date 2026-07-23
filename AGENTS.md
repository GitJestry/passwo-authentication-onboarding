# AGENTS.md — globale Arbeitsregeln

Diese Datei gilt für das gesamte Repository. Untergeordnete `AGENTS.md` können strengere,
aber keine lockereren Regeln ergänzen.

## 1. Reihenfolge der Quellen

1. Dieser Auftrag und seine Akzeptanzkriterien.
2. Diese `AGENTS.md` und die nächstgelegene untergeordnete `AGENTS.md`.
3. Akzeptierte ADRs unter `docs/architecture/adr/`.
4. Relevante Fach- und Forschungsdokumente aus `docs/` und `research/derived/`.
5. Rohquellen aus `research/private/` nur bei expliziten Inhaltsaufgaben.

Lies nicht pauschal alle Rohquellen. Nutze `docs/ai/TASK-ROUTING.md`.

## 2. Nicht verhandelbare Forschungs- und Datenschutzgrenzen

- Sende oder speichere niemals Anzeigenamen, fiktive Passwörter, Passwortteile,
  Ähnlichkeitsbefunde oder sonstige Trainingsentscheidungen.
- Verwende weder `localStorage`, `sessionStorage`, IndexedDB noch Service Worker für
  Teilnehmer- oder Trainingszustand.
- Persistierbar sind nur: pseudonymer Sitzungscode, Bedingung, Versionen, Einwilligungsstatus,
  Fragebogenantworten, Guardrail-Antworten, Zeitereignisse, Abschlussstatus und notwendige
  technische Fehlercodes.
- Logge keine Request-Bodies, IP-Adressen, User-Agents oder Eingabewerte.
- Frage nie nach realen Passwörtern, Konten, Tokens, Wiederherstellungscodes oder realen
  Sicherheitsvorfällen.
- Formuliere keine Therapie-, Diagnose-, Behandlungs- oder Langzeitwirkungsbehauptungen.
- Behaupte nie, ein Konto oder Passwort sei absolut „sicher“.

Bei Unsicherheit stoppe die Implementierung und dokumentiere die offene Forschungsentscheidung.

## 3. Architekturregeln

- Domänenlogik ist frameworkfrei und deterministisch; React rendert Zustände, entscheidet sie
  aber nicht.
- Studienablauf und Trainingsablauf sind getrennte XState-Maschinen.
- Kein zweiter globaler State Store. Lokaler UI-Zustand bleibt lokal; Workflow-Zustand liegt in
  Statecharts.
- Trainingsinhalte werden als versionierte Daten modelliert, nicht in Komponenten verteilt.
- Animationen, PassWo und Netzwerkvisualisierung laufen hinter Ports/Adaptern.
- `packages/training-content` darf keine UI-Komponenten importieren.
- `packages/*-engine` darf React nicht importieren.
- Der Server darf ausschließlich `@passwo/contracts` aus dem gemeinsamen Domain-Layer
  importieren; niemals Trainingsinhalte oder Passwortanalyse.
- Neue Kernabhängigkeiten oder Änderungen an Persistenz, Randomisierung oder Timing benötigen
  ein ADR.

## 4. Code- und Qualitätsregeln

- TypeScript strict; kein `any`, keine unkontrollierten Type Assertions und keine
  Non-null-Assertions ohne begründete Adaptergrenze.
- Benannte Exporte bevorzugen. Funktionen und Dateien nach einer Verantwortung schneiden.
- Keine verstreuten `setTimeout`-Ketten. Pädagogische Abläufe werden als Statechart und
  AnimationSequence modelliert.
- Keine zufälligen Werte ohne injizierbaren Seed/Generator in testrelevanter Logik.
- Nutzertexte sind deutsch; Code, Typen und technische Kommentare sind englisch.
- Kommentare erklären Gründe und Grenzen, nicht offensichtlichen Code.
- Jede Änderung erhält passende Unit-, Contract-, E2E- oder visuelle Tests.
- Farbe ist nie der einzige Bedeutungsträger; Tastatur, Fokus und `prefers-reduced-motion`
  müssen berücksichtigt werden.

## 5. Arbeitsweise für Codex

Vor Änderungen:

1. Fasse Ziel, erlaubte Pfade und Akzeptanzkriterien intern zusammen.
2. Lies nur die in der Aufgabe genannten Dokumente plus die zutreffenden Agentenregeln.
3. Prüfe, ob ein ADR oder eine Forschungsentscheidung fehlt.

Während der Änderung:

- Halte den Diff klein und auf genau eine vertikale Aufgabe begrenzt.
- Ändere keine Teilnehmertexte außerhalb des beauftragten Segments.
- Füge keine Bibliothek hinzu, wenn eine vorhandene Abstraktion genügt.
- Schreibe keine Platzhalterlogik, die wie eine validierte Passwortbewertung wirkt.

Vor Abschluss:

```bash
pnpm check
```

Bei UI-Änderungen zusätzlich:

```bash
pnpm test:e2e
```

Berichte abschließend nur: geänderte Dateien, ausgeführte Checks, offene Risiken/Entscheidungen.

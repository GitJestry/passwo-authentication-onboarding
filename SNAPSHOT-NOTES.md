# Snapshot v0.1.2 — Clean Git and pnpm 11 correction

Dieser Stand korrigiert zwei Fehler des v0.1.1-Archivs.

## Korrigiert

- kein eingebettetes `.git/`-Verzeichnis und keine fremde `origin/main`-Historie;
- alle 9 Workspace-Pakete und Anwendungen liegen als normale Snapshot-Dateien vor;
- keine `.pnpm-store`, `.DS_Store`-Dateien oder `__MACOSX`-Metadaten;
- pnpm-11-Konfiguration aus `package.json#pnpm` und `.npmrc` nach
  `pnpm-workspace.yaml` verschoben;
- `onlyBuiltDependencies` durch pnpm-11-`allowBuilds` für `better-sqlite3` und `esbuild` ersetzt;
- `scripts/check-workspace-foundation.mjs` prüft die vollständige Workspace-Struktur vor der
  Installation;
- Versionskennzeichnung auf `0.1.2` aktualisiert.

## Absichtlich nicht enthalten

- `pnpm-lock.yaml` und `node_modules`;
- finale Fragebögen, Guardrail-Items oder Consent-Texte;
- SQLite-Schema, Randomisierungsimplementierung oder Studienexport;
- echte Trainingssegmente, Passwortheuristiken, Motion- oder React-Flow-Adapter;
- extrahierte Runtime-Assets aus den PassWo-Designreferenzen.

## Erwarteter nächster Schritt

1. Snapshot in einen neuen Ordner entpacken.
2. `node scripts/check-workspace-foundation.mjs` ausführen.
3. einen frischen Initialcommit mit allen nicht ignorierten Dateien erzeugen;
4. erst danach Prompt 1 aus `docs/ai/FIRST-PROMPTS.md` ausführen.

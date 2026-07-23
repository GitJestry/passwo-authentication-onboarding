# PassWo Authentication Onboarding — Foundation v0.1.2

Dieses Repository ist die installierbare technische und methodische Ausgangsbasis für das
webbasierte **Supportive Authentication Onboarding** und die gekoppelte Between-Subjects-Studie.
Es ist bewusst noch **kein implementiertes Training und keine produktionsbereite Studie**. Der
Snapshot stellt Workspace, Toolchain, Modulgrenzen, Datenschutzregeln, App-Shells und testbare
Domänengrundlagen bereit, damit Codex mit kleinen vertikalen Aufträgen weiterarbeiten kann.

## Was dieser Snapshot enthält

- pnpm-Monorepo mit vollständigen Root- und Package-Manifesten;
- React/Vite-App-Shell und lokaler Fastify-Server mit neutralem Health-Endpunkt;
- Shared Contracts, Study Engine, Mission Controller, Timer, Content-Manifest,
  Visualisierungsmodell und UI-Grundlage;
- Biome, TypeScript, Vitest und Playwright-Konfiguration;
- automatischen Research-Boundary-Check;
- ADRs für Stack, Datengrenze, Statecharts, Timing, Randomisierung, Referenzbedingung und
  Renderer-Adapter;
- private Forschungsquellen unter `research/private/`, standardmäßig von Git ausgeschlossen.

Der Snapshot enthält absichtlich **kein `pnpm-lock.yaml`**. Prompt 1 installiert die bereits
festgelegten Abhängigkeiten, erzeugt den Lockfile und behebt nur reale Tooling-Kompatibilitäten.

## Sauberer Import in Git

Dieser Snapshot enthält absichtlich **kein `.git/`-Verzeichnis**. Er muss als neue Arbeitskopie
initialisiert oder vollständig in ein vorhandenes Repository kopiert werden. Die ZIP-Datei niemals
über einen älteren Snapshot mit fremder Git-Historie entpacken.

```bash
unzip passwo-authentication-onboarding-foundation-v0.1.2-clean.zip
cd passwo-authentication-onboarding

node scripts/check-workspace-foundation.mjs
git init
git add .
git status --short
git commit -m "Initialize PassWo foundation v0.1.2"
```

Vor dem Commit müssen alle App- und Package-Manifeste als hinzugefügt erscheinen. Dateien unter
`research/private/` dürfen mit Ausnahme der README nicht erscheinen. Erst nach diesem vollständigen
Initialcommit sollte ein Remote verbunden oder Codex auf den Branch angesetzt werden.

## Voraussetzungen auf macOS

- Node.js `24.18.0`;
- Corepack;
- pnpm `11.15.1`;
- VS Code optional, aber vorgesehen.

```bash
nvm install
nvm use
corepack enable
corepack prepare pnpm@11.15.1 --activate
node scripts/check-workspace-foundation.mjs
pnpm install
pnpm check
pnpm build
```

Der Preinstall-Check bricht bewusst ab, wenn eine andere Node- oder pnpm-Version verwendet wird.
Damit bleibt der erste Lockfile reproduzierbar.

## Lokale Foundation starten

```bash
pnpm dev
```

- Web-App: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:4174/api/health`

Der aktuell sichtbare Screen ist nur ein Foundation-Smoke-Test. Er legt keine Session an und
speichert keine Daten.

Ein lokaler gebündelter Stand wird so gestartet:

```bash
pnpm study:start
```

Fastify liefert dann den Vite-Build aus. Die eigentliche Studienpersistenz und der Export werden
erst im Walking Skeleton aus Prompt 2 umgesetzt.

Für Playwright einmalig:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

## Arbeitsreihenfolge

1. `AGENTS.md` und `docs/ai/TASK-ROUTING.md` lesen.
2. Prompt 1 aus `docs/ai/FIRST-PROMPTS.md` ausführen und den Lockfile committen.
3. Erst danach den vollständigen Study Walking Skeleton aus Prompt 2 bauen.
4. BrowserShell, PassWo und Animations-Handshake als vertikalen Schnitt umsetzen.
5. Knotennetzwerk und Passwortanalyse erst nach diesen Abnahmetoren erweitern.

## Wichtige Befehle

```bash
pnpm check                      # Biome, TypeScript, Unit-Tests, Research Boundary
pnpm build                      # Packages typprüfen, Server und Vite-Client bauen
pnpm test                       # Unit-/Contract-Tests
pnpm test:e2e                   # Foundation-Smoke-Test mit axe
pnpm check:research-boundary    # Datengrenzen und private Quellen prüfen
pnpm clean                      # erzeugte dist-Verzeichnisse entfernen
```

## Bedingungen für spätere Pretests und Hauptstudie

```bash
# Hauptstudie
STUDY_ASSIGNMENT_MODE=permuted-block pnpm study:start

# Ausschließlich für Pretests
STUDY_ASSIGNMENT_MODE=forced-supportive pnpm study:start
STUDY_ASSIGNMENT_MODE=forced-reference pnpm study:start
```

Die Environment-Variable wird bereits validiert, aber die eigentliche Zuweisungslogik entsteht
erst in Prompt 2. Der Client darf die Condition zu keinem Zeitpunkt wählen.

## Snapshot-Integrität

Das Archiv enthält `SNAPSHOT-MANIFEST.sha256`. Nach dem Entpacken kann der lokale Stand
mit folgendem Befehl geprüft werden:

```bash
shasum -a 256 -c SNAPSHOT-MANIFEST.sha256
```

Die Manifestdatei ist Distributionsmetadatum und wird deshalb nicht in Git aufgenommen.

## Vertrauliche Quellen

`research/private/` enthält Exposé, Trainingsskript, Translation Foci und Designreferenzen. Bis
auf die dortige README ist der Ordner durch `.gitignore` ausgeschlossen. Prüfe nach `git init`:

```bash
git add .
git status --short
git check-ignore -v research/private/training-script.pdf
```

Die PDF-, TeX- und PNG-Dateien dürfen nicht als zu committen erscheinen. Für normale
Agentenarbeit werden die kompakten Ableitungen unter `research/derived/` und `docs/` genutzt.

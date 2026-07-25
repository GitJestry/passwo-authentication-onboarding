# PassWo Authentication Onboarding

Dieses pnpm-Monorepo enthält das webbasierte **Supportive Authentication Onboarding** und die
lokale Runtime für die gekoppelte Between-Subjects-Studie. Nach M3 sind der technische
Studienpfad, die visuelle Trainingsplattform und die ersten Knotennetzwerk-Slices implementiert.
Die finalen Forschungsinstrumente und die vollständigen Trainingssegmente folgen in späteren
Meilensteinen.

## Stand nach M3

- **M1 – Study Runtime:** serverseitige Sitzungsanlage und verdeckte Blockzuweisung, getrennte
  Study- und Training-Statecharts, SQLite-Persistenz erlaubter Forschungsdaten, Timing,
  Reload-/Lease-Behandlung sowie CSV-/JSON-Export mit Manifest und Prüfsummen.
- **M2 – Visual Platform:** BrowserShell, PassWo-Adapter, Mission-/Animations-Handshake,
  Reduced Motion und der vollständige S00-Slice.
- **M3 – Knotennetzwerk:** frameworkfreie Szenenmodelle mit React-Flow-Adapter, ein
  S02-CampusID-Durchlauf und die geprüften S06-Konsequenzszenen.
- **Als Nächstes – M4:** das bereits angebundene Package `@passwo/password-analysis` wird für
  die rein lokale, simulationsspezifische Passwortanalyse umgesetzt.

`apps/study-web` enthält die React-/Vite-Oberfläche und Browseradapter. `apps/study-server`
stellt die lokale Fastify-API, SQLite-Persistenz, Zuweisung und den gebündelten Web-Build bereit.
Frameworkfreie Contracts, Engines, Inhalte, Visualisierungsmodelle und UI-Bausteine liegen unter
`packages/`.

## Lokal installieren und starten

Benötigt werden Node.js `24.18.0`, Corepack und pnpm `11.15.1`.

```bash
nvm install
nvm use
corepack enable
corepack prepare pnpm@11.15.1 --activate
pnpm install
```

Für die getrennten Entwicklungsserver:

```bash
pnpm dev
```

- Web-App: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:4174/api/health`

Den gebündelten lokalen Studienbetrieb startet `pnpm study:start`. Der Befehl baut Client und
Server; Fastify liefert anschließend Web-App und API unter `http://127.0.0.1:4174` aus.

Die Hauptstudie verwendet standardmäßig `permuted-block`. Nur für Pretests dürfen die Bedingungen
erzwungen werden:

```bash
STUDY_ASSIGNMENT_MODE=forced-supportive pnpm study:start
STUDY_ASSIGNMENT_MODE=forced-reference pnpm study:start
```

## Study Runtime und Export

Der Runtime-Pfad führt von Einwilligung und serverseitiger Session über Pre-Platzhalter,
flüchtigen Anzeigenamen und zugewiesenes Artefakt zu Post-/Guardrail-Platzhaltern, Debrief und
Abschluss. Anzeigenamen und Trainingsinputs bleiben im Browser-Arbeitsspeicher. Standardmäßig
liegt die Datenbank unter `~/.passwo-study/study.sqlite`; ein anderer lokaler Datenordner kann über
`STUDY_DATA_DIR` gesetzt werden.

Ein Export benötigt ein leeres oder neues Zielverzeichnis:

```bash
pnpm study:export -- --output ./study-export
pnpm study:export -- --database /pfad/study.sqlite --output ./study-export
```

Er erzeugt Sessions, Timing und Antworten als CSV und JSON sowie ein Manifest mit Versionen,
Zählungen und SHA-256-Prüfsummen.

## Design Lab

`/design-lab` stellt deterministische, vom Studienablauf isolierte Szenen für Entwicklung,
Barrierefreiheitsprüfungen und visuelle Regression bereit. Dazu gehören BrowserShell- und
PassWo-Zustände sowie die S00-, S02-CampusID- und S06-Fixtures. Das Design Lab speichert keine
Forschungsdaten und ersetzt keine vollständige Segmentnavigation.

## Qualitätschecks

```bash
pnpm check                    # Biome, TypeScript, Unit-/Contract-Tests, Research Boundary
pnpm build                    # Server und Vite-Client bauen
pnpm test:e2e                 # Study Runtime, Design Lab und Barrierefreiheit
pnpm check:research-boundary  # Datengrenzen und private Quellen prüfen
```

Vor dem ersten E2E-Lauf wird Chromium einmalig mit
`pnpm exec playwright install chromium` installiert.

## Vertrauliche Forschungsquellen

`research/private/` ist vollständig von Git ausgeschlossen und darf weder verändert noch
übertragen werden. Normale Entwicklungsaufgaben verwenden die abgeleiteten Unterlagen unter
`research/derived/` und `docs/`; private Rohquellen werden nur für ausdrücklich benannte
Inhaltsaufgaben geöffnet.

```bash
git ls-files research/private
```

Der Befehl muss ohne Ausgabe bleiben. Keine pauschalen Bereinigungsbefehle wie `git clean -X`
verwenden, weil sie ignorierte private Quellen löschen könnten.

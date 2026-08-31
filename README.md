# PassWo Authentication Onboarding

Monorepo für das supportive Authentifizierungs-Onboarding **PassWo** und die gekoppelte
Between-Subjects-Webstudie mit einer lokalen SecAware.NRW-Referenzbedingung.

Der vollständige Studienpfad ist implementiert: beide Bedingungen, PassWo S00–S17,
versionierte Instrumente, sichere Wiederaufnahme, Timing, Follow-up, Export und Webbetrieb. Die
produktive Runtime läuft same-origin im Browser; Electron startet denselben Renderer und Server
ausschließlich für lokale Entwicklung und QA.

## Workspace

```text
apps/
  study-web        React-/Vite-Renderer
  study-server     Fastify API, SQLite, Zuweisung, Timing und Export
  study-desktop    schmale Electron-Hülle für lokale Entwicklung und QA
packages/
  contracts        gemeinsame Verträge und Instrumentschemas
  study-engine     frameworkfreie Studienmaschine
  training-engine  frameworkfreie Trainingsmaschine
  training-content versionierte Segmente und Teilnehmertexte
  password-analysis lokale Analyse fiktiver Übungswerte
  visualization    frameworkfreie Netzwerkmodelle
  ui               Design Tokens und gemeinsame UI
```

Die Dependency- und Zustandsgrenzen stehen in
[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md).

## Lokaler Start

Voraussetzungen: Node.js `24.18.0`, Corepack und pnpm `11.15.1`.

```bash
nvm install
nvm use
corepack enable
corepack prepare pnpm@11.15.1 --activate
pnpm install
pnpm dev
```

`pnpm dev` baut und verifiziert das lokale Referenzartefakt, erstellt Server-, Web- und
Electron-Bundles und öffnet die Desktop-Hülle. Für Pretests kann die Bedingung ausschließlich
serverseitig erzwungen werden:

```bash
STUDY_ASSIGNMENT_MODE=forced-supportive pnpm dev
pnpm dev:secaware
```

Eine lokale arm64-App entsteht mit `pnpm desktop:package`. Produktionsdeployment und geschützte
Live-QA beschreibt [docs/operations/WEB-DEPLOYMENT.md](docs/operations/WEB-DEPLOYMENT.md).

## Betrieb und Daten

Die Hauptstudie verwendet serverseitige permutierte Blöcke. Der Client kann weder Condition noch
Guardrail-Form wählen. Anzeigenamen, fiktive Passwörter, Passwortteile und lokale Befunde werden
nicht als Forschungsdaten übertragen oder persistiert. Die begrenzte Reload-Ausnahme ist in
[ADR 0016](docs/architecture/adr/0016-web-runtime-resume-and-data-lifecycle.md) festgelegt.

```bash
pnpm deploy:web
pnpm study:stats
pnpm study:export -- --profile audit --output ./study-audit-export
pnpm study:export -- --profile analysis --output ./study-analysis-export
pnpm study:delete
pnpm followup:run-scheduler
pnpm followup:export-schedule -- --output ./followup-schedule.json \
  --base-url https://study.statisticslab.de/follow-up
pnpm followup:confirm-delivery -- --operation OPERATION_ID
pnpm followup:delete-contacts
```

Schreibende Lösch- und Versandbestätigungen verlangen jeweils den dokumentierten `--confirm`-
Aufruf. `study:export` erzeugt die Einzeltabellen als CSV und JSON sowie eine formatierte
`study-export.xlsx`. `export-guide.*` erklärt Tabellen, Verknüpfungen und Analysegrenzen;
`data-dictionary.*` ist das Variablen-Cookbook mit Itemwortlaut, Gruppen, Skalenankern,
Optionscodes, Missing-Regeln und zulässiger Aggregation. Das Zielverzeichnis muss für diese
Dateinamen leer sein und wird nicht überschrieben. Audit- und Analyseexport sind
pseudonymisierte Arbeitsdaten, nicht der anonyme Archivdatensatz. Verbindlich sind
[DATA-CONTRACT.md](docs/research/DATA-CONTRACT.md) und
[STUDY-RUNTIME.md](docs/research/STUDY-RUNTIME.md).

## QA und Checks

`/design-lab` enthält deterministische visuelle Szenen ohne Forschungsdaten. Segmentdirektstarts
verwenden lokal `PASSWO_QA_SEGMENT`, beispielsweise:

```bash
PASSWO_QA_SEGMENT=s05 pnpm dev
PASSWO_QA_SEGMENT=s13-conclusion pnpm dev
```

Kanonische Qualitätsbefehle:

```bash
pnpm test:web:release
pnpm check
pnpm test:core
pnpm build
pnpm test:e2e
pnpm test:reference-artifact
pnpm test:desktop
pnpm check:research-boundary
```

`pnpm test:web:release` ist das vollständige lokale Release-Gate. `pnpm deploy:web` führt dieses
Gate aus, baut einen atomaren Web-Release und prüft die öffentliche Auslieferung. Chromium wird
vor dem ersten E2E-Lauf einmalig mit `pnpm exec playwright install chromium` installiert.

## Kanonische Dokumente

| Thema | Quelle |
|---|---|
| Architektur und ADR-Auswahl | [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md), [ADR-Index](docs/architecture/adr/README.md) |
| Webbetrieb und Wiederaufnahme | [STUDY-RUNTIME.md](docs/research/STUDY-RUNTIME.md) |
| Datenklassen, Export und Anonymisierung | [DATA-CONTRACT.md](docs/research/DATA-CONTRACT.md) |
| Timing | [TIMING-PROTOCOL.md](docs/research/TIMING-PROTOCOL.md) |
| Instrumente und Claims | [MEASUREMENT-INSTRUMENT.md](docs/research/MEASUREMENT-INSTRUMENT.md), [RESEARCH-GUARDRAILS.md](docs/research/RESEARCH-GUARDRAILS.md) |
| Trainingstexte | [TRAINING-COPY.md](docs/design/TRAINING-COPY.md), [Segmentindex](research/derived/segment-index.md) |
| Referenzbedingung | [REFERENCE-CONDITION.md](docs/research/REFERENCE-CONDITION.md) |
| Deployment | [WEB-DEPLOYMENT.md](docs/operations/WEB-DEPLOYMENT.md) |

`research/private/` ist ungecheckt und bleibt lokal. Normale Arbeit verwendet `docs/` und
`research/derived/`; private Referenzartefakte werden nur für ausdrücklich benannte Inhalts- oder
Buildaufgaben geöffnet.

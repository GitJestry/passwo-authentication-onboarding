# PassWo Authentication Onboarding

Dieses pnpm-Monorepo enthält das **Supportive Authentication Onboarding** und die lokale Runtime
für die gekoppelte Between-Subjects-Studie. Der technische Studienpfad, die visuelle
Trainingsplattform, die Segmente S00 bis S07 und die draft-versionierten Forschungsinstrumente
sind integriert. S08 bis S17, das externe Follow-up-Formular mit Import und der Study Freeze sind
noch offen.

## Aktueller Stand

- **M1 – Study Runtime:** serverseitige Sitzungsanlage und verdeckte Blockzuweisung, getrennte
  Study- und Training-Statecharts, SQLite-Persistenz erlaubter Forschungsdaten, Timing,
  Reload-/Lease-Behandlung sowie CSV-/JSON-Export mit Manifest und Prüfsummen.
- **M2 – Visual Platform:** BrowserShell, PassWo-Adapter, Mission-/Animations-Handshake,
  Reduced Motion und der vollständige S00-Slice.
- **Training:** S00 bis S07 bilden den integrierten Lauf. S07 verdichtet die bereits vorhandenen
  lokalen S03-/S05-/S06-Befunde im Studienpfad und Design Lab zu genau einem nächsten Schritt je
  Konto.
- **Instrumente:** Pre, Post, Guardrail und offene Rückmeldung laufen als versionierte,
  atomare Submissions; das optionale Follow-up besitzt eine getrennte Recontact-Registry und
  Schedule-Export.
- **Als Nächstes:** S08 bis S11 mit Passwortüberarbeitung und Modulabschluss.

`apps/study-desktop` verpackt die Anwendung für Apple Silicon ohne Adresszeile und startet die
vorhandene Runtime intern. `apps/study-web` ist der einzige React-/Vite-Renderer.
`apps/study-server` ist die einzige Fastify-/SQLite-Implementierung für API, Persistenz,
Zuweisung, Timing und Export. Electron kopiert keine dieser fachlichen Systeme.
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

Der kanonische Desktop-Entwicklungsstart ist:

```bash
pnpm dev
```

Er baut und prüft das Referenzartefakt, erstellt Server-, Renderer- und Electron-Bundles und
startet die Desktop-App. Ein eigenständiger Browser-Produktionsstart wird nicht unterstützt.
Vite/Chromium bleiben ausschließlich interne E2E- und visuelle Testwerkzeuge und verwenden
denselben Renderer-Quellcode.

Die lokale arm64-App wird gebaut mit:

```bash
pnpm desktop:package
```

Das Ergebnis liegt unter `apps/study-desktop/out/Authentication Onboarding-darwin-arm64/`.
Teilnehmende starten ausschließlich `Authentication Onboarding.app`. Die App benötigt weder einen
separaten Browser noch einen zuvor gestarteten Server und verwendet weiterhin
`~/.passwo-study/study.sqlite`. Signierung und Notarisierung sind nicht Bestandteil dieses lokalen
Builds.

Die Hauptstudie verwendet standardmäßig `permuted-block`. Nur für Pretests dürfen die Bedingungen
erzwungen werden:

```bash
STUDY_ASSIGNMENT_MODE=forced-supportive pnpm dev
STUDY_ASSIGNMENT_MODE=forced-reference pnpm dev
pnpm dev:secaware
```

`pnpm dev:secaware` ist die Kurzform für die serverseitig erzwungene SecAware-Referenzbedingung.

## Study Runtime und Export

Der Runtime-Pfad führt von Eligibility, Einwilligung und optionaler Follow-up-Entscheidung über
serverseitige Session, echte Pre-/Post-/Guardrail-Instrumentblöcke und das zugewiesene Artefakt
zur bedingten Session Closure und zum Abschluss. Anzeigenamen und Trainingsinputs bleiben
ausschließlich im flüchtigen Arbeitsspeicher des Electron-Renderers. Standardmäßig liegt die
Datenbank unter
`~/.passwo-study/study.sqlite`; ein anderer lokaler Datenordner kann über `STUDY_DATA_DIR`
gesetzt werden.

Ein Export benötigt ein leeres oder neues Zielverzeichnis. `audit` ist die geschützte interne
Nachweisfassung; nur `analysis` ist für Analyse oder Weitergabe vorgesehen:

```bash
pnpm study:export -- --profile audit --output ./study-audit-export
pnpm study:export -- --profile analysis --output ./study-analysis-export
pnpm study:export -- --profile analysis --database /pfad/study.sqlite --output ./study-analysis-export
```

Ohne `--profile` bleibt `audit` der Standard. Beide Profile erzeugen Sessions, Timing und
Antworten als CSV und JSON sowie ein Manifest mit Profil, gekoppelter Schemaprofilversion,
Versionen, Zählungen und SHA-256-Prüfsummen. Der Analyseexport entfernt exakte
Kalenderzeitpunkte und separiert ausgefüllte Freitexte zur manuellen Prüfung in
`free-text-review`.

Der optionale Follow-up-Versand erfolgt nicht automatisch. Die Studienleitung erzeugt den
geschützten Schedule nur bei Bedarf und versendet die neutralen Einladungen einzeln über das
freigegebene Universitätskonto:

```bash
pnpm followup:export-schedule -- --output ./followup-schedule.csv --base-url https://example.invalid/follow-up
```

Eine einzelne Session kann ausschließlich lokal über ihren Löschcode geprüft oder gelöscht werden.
Der Code wird verdeckt über die Standardeingabe gelesen und nie als Kommandozeilenargument
übergeben. Ohne `--confirm` bleibt der Vorgang ein Dry-Run; vorhandene Exporte und Backups werden
nicht verändert.

```bash
pnpm study:delete
pnpm study:delete -- --confirm
pnpm study:delete -- --database /pfad/study.sqlite --recontact-database /pfad/recontact.sqlite
```

## Design Lab

`/design-lab` ist ein interner QA-Pfad für deterministische, vom Studienablauf isolierte Szenen,
Barrierefreiheitsprüfungen und visuelle Regression. Dazu gehören BrowserShell- und
PassWo-Zustände sowie die S00-, S02-Master-Campus-, S03-Warnungs-, S04-, S05-, S06- und
S07-Fixtures.
Das Design Lab ist kein Auslieferungspfad, speichert keine Forschungsdaten und ersetzt keine
vollständige Segmentnavigation.

Die Campus-Websites lassen sich in S01 und S03 mit `account=master-campus|campus-email|campusgram`
und `view=landing|auth|dashboard` direkt aufrufen. S00 verwendet denselben `account`-Parameter für
die jeweilige Landingpage, zum Beispiel `/design-lab/s01?account=campus-email&view=dashboard`.
Die Warnszene und die anschließende Campusgram-Erklärung sind unter `/design-lab/s03-warning`
beziehungsweise `/design-lab/s04` direkt erreichbar.

Für einen direkten, ausschließlich lokalen QA-Einstieg in ein Trainingssegment kann der
Desktop-Entwicklungsstart mit `PASSWO_QA_SEGMENT` aufgerufen werden. Dabei werden weder eine
Studien-Session noch Timing-Ereignisse angelegt:

```bash
PASSWO_QA_SEGMENT=s00 pnpm dev
PASSWO_QA_SEGMENT=s01 pnpm dev
PASSWO_QA_SEGMENT=s02 pnpm dev
PASSWO_QA_SEGMENT=s03 pnpm dev
PASSWO_QA_SEGMENT=s05 pnpm dev
```

S05 startet bei der Campusgram-Warnung aus S04 und zeigt den vollständigen Übergang bis in die
deterministische S05-Variante „Häufiger Kern plus typischer Anhang“.

Der Schalter ist nur im ungepackten Entwicklungsstart verfügbar. Ohne ihn bleibt `pnpm dev` im
normalen Studienpfad.

## Qualitätschecks

```bash
pnpm check                    # Biome, TypeScript und Research Boundary
pnpm test:core                # Research-Core-, Contract- und lokale Trainingsdaten-Tests
pnpm build                    # Server, kanonischen Renderer und Electron-Hülle bauen
pnpm test:e2e                 # Study Runtime, Design Lab und Barrierefreiheit
pnpm test:reference-artifact  # echter SecAware-Kursweg und automatischer Post-Übergang
pnpm test:desktop             # Electron-/SQLite-Smoke-Test
pnpm desktop:package          # lokale arm64-.app
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

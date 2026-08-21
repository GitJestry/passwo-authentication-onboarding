# PassWo Authentication Onboarding

Dieses pnpm-Monorepo enthält das **Supportive Authentication Onboarding** und die Runtime für die
gekoppelte Between-Subjects-Studie. Der lokale technische Studienpfad, die visuelle
Trainingsplattform, die Segmente S00 bis S07 und die pilot-versionierten Forschungsinstrumente
sind integriert. Für die Hauptstudie ist ein same-origin Webbetrieb mit sicherer Wiederaufnahme
entschieden. S08 bis S17 sowie die technische Anpassung an dieses Web-Zielmodell sind noch offen.

## Aktueller Stand

- **M1 – lokale Study Runtime:** serverseitige Sitzungsanlage und verdeckte Blockzuweisung,
  getrennte Study- und Training-Statecharts, SQLite-Persistenz erlaubter Forschungsdaten, Timing,
  Legacy-Reload-/Lease-Behandlung sowie CSV-/JSON-Export mit Manifest und Prüfsummen.
- **M2 – Visual Platform:** BrowserShell, PassWo-Adapter, Mission-/Animations-Handshake,
  Reduced Motion und der vollständige S00-Slice.
- **Training:** S00 bis S07 bilden den integrierten Lauf. S07 verdichtet die bereits vorhandenen
  lokalen S03-/S05-/S06-Befunde im Studienpfad und Design Lab zu genau einem nächsten Schritt je
  Konto.
- **Instrumente:** Pre, unmittelbarer Post-Fragebogen, gemeinsamer Guardrail, post-guardrail
  Self-Efficacy und retrospektive SecAware-Vorerfahrung laufen als versionierte atomare Submissions.
  Die freiwillige Nachbefragung besitzt eine getrennte Recontact-Registry und einen Schedule-Export.
  `consent-v13-pilot` ist der Zieltext für den Webbetrieb und wird erst mit implementierter
  Wiederaufnahme für Teilnehmerläufe freigegeben.
- **Entschiedenes Web-Zielmodell:** Browser schließen oder neu laden unterbricht eine neue
  Web-Sitzung, beendet sie aber nicht. Der letzte sichere inhaltsfreie Checkpoint wird im selben
  Browser wiederaufgenommen; ausgewertet werden nur regulär abgeschlossene Runs.
- **Als Nächstes:** S08 bis S17 fertigstellen, danach Webdeployment, Resume und same-origin
  Follow-up-Route gemäß ADR 0016 umsetzen.

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
startet die lokale Desktop-App. Dieser Pfad bleibt Entwicklungs- und QA-Harness. Der produktive
HTTPS-Webbetrieb ist in ADR 0016 entschieden, im aktuellen Repositorystand aber noch nicht
vollständig implementiert. Vite, Chromium und Electron verwenden denselben Renderer-Quellcode.

Die lokale arm64-App wird gebaut mit:

```bash
pnpm desktop:package
```

Das Ergebnis liegt unter `apps/study-desktop/out/Authentication Onboarding-darwin-arm64/`. Die App
ist für lokale Entwicklung, Pilotierung und QA nutzbar, benötigt keinen separat gestarteten Server
und verwendet weiterhin `~/.passwo-study/study.sqlite`. Sie ist nicht mehr als alleiniger
Hauptstudien-Auslieferungspfad festgelegt. Signierung und Notarisierung sind nicht Bestandteil
dieses lokalen Builds.

Die Hauptstudie verwendet standardmäßig `permuted-block`. Nur für Pretests dürfen die Bedingungen
erzwungen werden:

```bash
STUDY_ASSIGNMENT_MODE=forced-supportive pnpm dev
STUDY_ASSIGNMENT_MODE=forced-reference pnpm dev
pnpm dev:secaware
```

`pnpm dev:secaware` ist die Kurzform für die serverseitig erzwungene SecAware-Referenzbedingung.

## Study Runtime und Export

Der Runtime-Pfad führt von Eligibility und Einwilligung über eine serverseitige Session, die
optionale getrennte Recontact-Registrierung, die versionierten Pre-/Post-/Guardrail-Blöcke und das
zugewiesene Artefakt zum gemeinsamen Debriefing und regulären Abschluss. Eine E-Mail-Adresse ist
keine Voraussetzung für die Hauptstudie. Anzeigenamen, fiktive Passwörter und lokale
Trainingsbefunde bleiben ausschließlich im flüchtigen Rendererzustand.

Im Zielmodell für die Hauptstudie bleibt ein Run nach Schließen oder Reload `in-progress` und wird
im selben Browser am letzten sicheren Checkpoint fortgesetzt. Nur `completed` Runs gehen in die
Auswertung ein. Die dafür nötige Cookie-, Checkpoint- und Timinganpassung ist noch zu
implementieren. Im aktuellen lokalen Betrieb liegt die Datenbank standardmäßig unter
`~/.passwo-study/study.sqlite`; `STUDY_DATA_DIR` setzt einen anderen lokalen Datenordner.

Ein Export benötigt ein leeres oder neues Zielverzeichnis. `audit` ist die geschützte interne
Nachweisfassung; `analysis` ist ein kontrollierter pseudonymisierter Arbeits- und Analyseexport.
Keines der beiden Profile ist der langfristige anonyme Archivdatensatz oder ohne weitere Prüfung
für öffentliche Weitergabe bestimmt:

```bash
pnpm study:export -- --profile audit --output ./study-audit-export
pnpm study:export -- --profile analysis --output ./study-analysis-export
pnpm study:export -- --profile analysis --database /pfad/study.sqlite --output ./study-analysis-export
```

Ohne `--profile` bleibt `audit` der Standard. Beide Profile erzeugen Sessions, Timing und
Antworten als CSV und JSON sowie ein Manifest mit Profil, gekoppelter Schemaprofilversion,
Versionen, Zählungen und SHA-256-Prüfsummen. Der Analyseexport entfernt exakte Kalenderzeitpunkte.
Der Analyseprozess selektiert ausschließlich regulär abgeschlossene Runs. Der spätere anonyme
Archivdatensatz wird getrennt nach der Prozedur in `docs/research/DATA-CONTRACT.md` erzeugt. Die
defensive Ausgabe `free-text-review` bleibt für mögliche Altbestände erhalten; das aktuelle
Pilotinstrument erhebt keinen Freitext.

Der Versand der optionalen Nachbefragung erfolgt nicht automatisch. Die Studienleitung erzeugt den
geschützten Schedule nur bei Bedarf und versendet Einladung und höchstens eine Erinnerung einzeln
über das freigegebene Universitätskonto. Der Link führt im Zielmodell zu einer tokenisierten Route
desselben Study-Webdeployments; eine externe Plattform, ein Antwortimport und eine verzögerte
Debrief-Mail entfallen:

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

## Geschützte Live-QA

Die beiden vollständigen Lernangebote und der reale Studienpfad lassen sich auf derselben
Produktionsinfrastruktur prüfen, ohne produktive Sitzungen oder Zuweisungsplätze anzulegen. Die
Live-QA läuft hinter Nginx Basic Auth auf zwei getrennten, serverseitig erzwungenen Runtimes mit
In-Memory-Datenbanken und eigenen `HttpOnly`-Rückkehr-Cookies.

Einmalig werden Zugangsdaten und der zusätzliche systemd-Dienst eingerichtet:

```bash
pnpm qa:live:setup
```

Anschließend wird die Live-QA bei normalen Releases zusammen mit der Studie ausgeliefert:

```bash
pnpm deploy:web
```

Unter `https://study.statisticslab.de/qa` sind **PassWo** und **SecAware** jeweils in zwei Modi
verfügbar:

- **Direkt öffnen** rendert nur das Lernangebot. Das eignet sich für reale Ladezeiten, Videos,
  Animationen und Inhalte.
- **Studienpfad öffnen** verwendet den vollständigen `StudyFlow` mit isoliertem Resume und Timing.
  Eine geschützte QA-Leiste kann bis zum Lernangebot springen, das Lernangebot überspringen, die
  restlichen Fragebögen schema-konform ausfüllen oder die QA-Sitzung zurücksetzen.

Die Bedingung wird ausschließlich durch den ausgewählten serverseitigen QA-Port festgelegt. Die
produktive Datenbank, das produktive Rückkehr-Cookie und die Permuted-Block-Randomisierung werden
nicht verwendet. Alle QA-Sitzungen verschwinden spätestens beim Neustart des QA-Dienstes. Details
stehen in `docs/operations/WEB-DEPLOYMENT.md`.

## Design Lab

`/design-lab` ist ein interner lokaler QA-Pfad für deterministische, vom Studienablauf isolierte
Szenen, Barrierefreiheitsprüfungen und visuelle Regression. Dazu gehören BrowserShell- und
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
PASSWO_QA_SEGMENT=s06 pnpm dev
PASSWO_QA_SEGMENT=s07 pnpm dev
PASSWO_QA_SEGMENT=s08 pnpm dev
PASSWO_QA_SEGMENT=s09 pnpm dev
```

Die fiktiven QA-Passwörter können für denselben Start optional überschrieben werden. Nicht
angegebene Werte behalten die jeweiligen Vorschau-Defaults (`preview-master-campus`,
`preview-campus-email` und `preview-campusgram`); bei S05 bleibt ohne Überschreibung das
bestehende Fixture-Passwort aktiv:

```bash
PASSWO_QA_SEGMENT=s03 \
PASSWO_QA_PASSWORD_MASTER='Master-Testpasswort' \
PASSWO_QA_PASSWORD_EMAIL='E-Mail-Testpasswort' \
PASSWO_QA_PASSWORD_CAMPUSGRAM='Campusgram-Testpasswort' \
pnpm dev
```

S05 startet bei der Campusgram-Warnung aus S04 und zeigt den vollständigen Übergang bis in die
deterministische S05-Variante „Häufiger Kern plus typischer Anhang“.
S06 startet bei der S05-Abschlussszene und führt von dort in die Konsequenzsimulation.
S07 startet in der Passphrasen-Werkstatt, S08 beim Angriffsrücklauf und S09 direkt im
geschützten S08-Netzwerk mit anschließendem Herauszoomen auf 80 Konten und
Passwortmanager-Übergang.

Der Schalter ist nur im ungepackten Entwicklungsstart verfügbar. Ohne ihn bleibt `pnpm dev` im
normalen Studienpfad.

## Qualitätschecks

```bash
pnpm check                    # Biome, TypeScript und Research Boundary
pnpm test:core                # Research-Core-, Contract- und lokale Trainingsdaten-Tests
pnpm build                    # Server, kanonischen Renderer und Electron-Hülle bauen
pnpm test:e2e                 # beide vollständigen Studienbedingungen, Artefakte schnell übersprungen
pnpm test:e2e:persistence     # älterer manueller Persistenz-Smoke-Test
pnpm test:reference-artifact  # echter SecAware-Kursweg und automatischer Post-Übergang
pnpm test:desktop             # Electron-/SQLite-Smoke-Test
pnpm desktop:package          # lokale arm64-.app
pnpm check:research-boundary  # Datengrenzen und private Quellen prüfen
```

Vor dem ersten E2E-Lauf wird Chromium einmalig mit
`pnpm exec playwright install chromium` installiert. Der neue Vollablauf erzeugt für jede Bedingung
eine In-Memory-Sitzung, legt alle Instrumentblöcke mit schema-validen Antworten ab, startet das
zugewiesene Artefakt, bestätigt dessen kanonische Abschlussgrenzen ohne manuelle Navigation und
prüft den regulären Sitzungsabschluss.

Für normale Produktionsupdates reicht anschließend:

```bash
pnpm deploy:web
```

Der Befehl führt lokale Checks und den E2E-Vollablauf aus, baut den Web-Release, überträgt ihn per
`rsync`, bereitet native Linux-Abhängigkeiten vor und schaltet Produktionsstudie sowie Live-QA mit
automatischem Rollback und Health-/SecAware-Range-/Auth-Smoke-Tests live. Details stehen in
`docs/operations/WEB-DEPLOYMENT.md`.

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

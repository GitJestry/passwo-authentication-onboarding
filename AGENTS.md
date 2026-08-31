# AGENTS.md — globale Arbeitsregeln

Diese Datei gilt für das gesamte Repository. Untergeordnete `AGENTS.md` können strengere,
aber keine lockereren Regeln ergänzen.

## 1. Reihenfolge der Quellen

1. Dieser Auftrag und seine Akzeptanzkriterien.
2. Diese `AGENTS.md` und die nächstgelegene untergeordnete `AGENTS.md`.
3. Die jüngste einschlägige akzeptierte oder ausdrücklich ersetzende ADR unter
   `docs/architecture/adr/`. Historische Revisionen bleiben als Entscheidungsprotokoll lesbar,
   sind aber keine parallelen aktuellen Anforderungen.
4. Die kanonischen Fach- und Forschungsdokumente aus `docs/` und `research/derived/`.
5. Rohquellen aus `research/private/` nur bei expliziten Inhaltsaufgaben.

Wähle danach nur die zum Auftrag passenden Quellen:

- Toolchain, Workspace und Build: `README.md` und ADR 0001.
- Study Runtime, Wiederaufnahme, Persistenz und Export: `docs/research/STUDY-RUNTIME.md`,
  `docs/research/DATA-CONTRACT.md`, `ADR 0016-Web-Resume-Lifecycle`, die weiterhin
  einschlägigen ADRs 0002–0005 sowie `ADR 0008-Reference` aus dem ADR-Index.
  `ADR 0008-Lease` beschreibt nur das historische beziehungsweise lokale Legacy-Verhalten.
- Timing, Zuweisung oder Referenzbedingung: das gleichnamige Dokument unter `docs/research/`
  sowie ADR 0004, 0005 beziehungsweise `ADR 0008-Reference` aus dem ADR-Index.
- BrowserShell, PassWo, Animation oder Knotennetzwerk: das einschlägige Dokument unter
  `docs/design/` sowie ADR 0003 und 0007.
- Teilnehmertexte und Segmente: die versionierten Daten unter `packages/training-content`,
  `docs/design/TRAINING-COPY.md`, der passende segmentbezogene Copy-Audit,
  `research/derived/segment-index.md` und `packages/training-content/AGENTS.md`.
- Passwortanalyse: `packages/password-analysis/AGENTS.md` und
  `docs/research/RESEARCH-GUARDRAILS.md`; private S05-/S06-Seiten nur bei explizitem Auftrag.
- Fragebogen und Guardrails: `docs/research/DATA-CONTRACT.md`,
  `docs/research/RESEARCH-GUARDRAILS.md`, `docs/research/MEASUREMENT-INSTRUMENT.md`,
  `docs/research/GUARDRAIL-CONTENT-AUDIT.md` und
  `research/derived/instruments-v1.{yaml,runtime.json}`.

Lies private Rohquellen nie pauschal.

## 2. Nicht verhandelbare Forschungs- und Datenschutzgrenzen

- Sende Anzeigenamen, fiktive Passwörter, Passwortteile, Ähnlichkeitsbefunde oder sonstige
  Trainingsentscheidungen niemals an den Server und persistiere sie nicht als Forschungsdaten.
  Die einzige enge lokale Ausnahme ist der in ADR 0016 festgelegte, versionierte S01–S07-
  Reload-Checkpoint in tab-lokalem `sessionStorage`: nur minimal nötiger Trainingszustand,
  zweistündige TTL, keine Netzwerkübertragung und Löschung nach bestätigtem S08-Checkpoint.
- `localStorage`, IndexedDB und Service Worker bleiben für Teilnehmer- oder Trainingszustand
  unzulässig. `sessionStorage` ist ausschließlich für den vorgenannten Reload-Checkpoint erlaubt;
  der langfristige Rückkehrschlüssel bleibt opak, `Secure` und `HttpOnly` geschützt.
- Persistierbar sind nur die im Data Contract benannten Datenklassen: pseudonyme Session- und
  Forschungskennungen, Bedingung und Form, Versionen, Einwilligungsstatus, Instrumentantworten,
  Timingereignisse, Abschlussstatus, notwendige technische Fehlercodes sowie der Hash des
  Rückkehrschlüssels und ein stabiler inhaltsfreier Fortschritts-Checkpoint.
- Logge keine Request-Bodies, IP-Adressen, User-Agents, Eingabewerte, Raw Tokens oder
  tokenisierten URLs.
- Frage nie nach realen Passwörtern, Konten, Tokens, Wiederherstellungscodes oder realen
  Sicherheitsvorfällen.
- Formuliere keine Therapie-, Diagnose-, Behandlungs- oder Langzeitwirkungsbehauptungen.
- Behaupte nie, ein Konto oder Passwort sei absolut „sicher“.

Löse dokumentierte Unschärfen anhand der jüngsten akzeptierten Entscheidung und wähle die kleinste
kohärente Umsetzung. Erfinde keine Ethik-, Datenschutz- oder Freigabegates, keine automatische
Löschung und keine externe Plattform, wenn ein akzeptierter manueller oder same-origin Prozess
dokumentiert ist. Ein kontrollierter manueller Betriebsprozess ist eine gültige Lösung.

Stoppe nur, wenn ein Auftrag:

- eine neue Datenklasse oder persistierte Inhalte verlangt, die weder im Data Contract noch durch
  eine akzeptierte ADR autorisiert sind;
- die Condition clientseitig steuerbar machen würde;
- echte Passwörter, Konten oder Sicherheitsvorfälle voraussetzt;
- aus der Simulation eine Produktions-Passwortbewertung ableitet;
- ohne ADR einen Kern-Renderer oder eine State-Library einführt;
- geschützten Wortlaut aus `docs/design/TRAINING-COPY.md` ohne ausdrückliche Freigabe ändert.

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
- Ausschließlich der eingefrorene lokale SecAware-Snapshot darf gemäß `ADR 0008-Reference` als
  deterministisch adaptierter Build in die Study Runtime eingebettet werden. Andere externe
  Inhalte bleiben von dieser Ausnahme unberührt.
- Neue Kernabhängigkeiten oder Änderungen an Persistenz, Randomisierung oder Timing benötigen
  ein ADR.

## 4. Code Economy and Architecture Discipline

- Suche vor neuen Dateien, Typen, Helpern, Services oder Abstraktionen nach vorhandener
  äquivalenter Funktionalität.
- Erweitere kohärente bestehende Module statt paralleler Implementierungen oder zweiter
  Wahrheitsquellen.
- Keine spekulativen Abstraktionen für mögliche spätere Anforderungen.
- Keine reinen Durchreicheschichten, Einmal-Wrapper oder Interfaces ohne aktuelle
  architektonische Funktion.
- Workflow-, Validierungs-, Mapping- und Persistenzlogik darf nicht mehrfach implementiert
  werden.
- React-Komponenten und Adapter enthalten keine duplizierte Domain- oder Orchestrierungslogik.
- Ein neuer Abstraktionslayer schützt eine konkrete Boundary, sichert eine zulässige
  Dependency-Richtung oder entfernt nachweisbare aktuelle Duplikation.
- Bevorzuge die kleinste kohärente Änderung, die alle Akzeptanzkriterien erfüllt.
- Entferne keine sinnvolle Trennung allein zur Reduktion der Dateizahl.
- Reviews prüfen insbesondere parallele Modelle, doppelte Zustände, überlappende Services,
  unnötige Indirektion und übergroße Module.

## 5. Code- und Qualitätsregeln

- TypeScript strict; kein `any`, keine unkontrollierten Type Assertions und keine
  Non-null-Assertions ohne begründete Adaptergrenze.
- Benannte Exporte bevorzugen. Funktionen und Dateien nach einer Verantwortung schneiden.
- Keine verstreuten `setTimeout`-Ketten. Pädagogische Abläufe werden als Statechart und
  AnimationSequence modelliert.
- Keine zufälligen Werte ohne injizierbaren Seed/Generator in testrelevanter Logik.
- Nutzertexte sind deutsch; Code, Typen und technische Kommentare sind englisch.
- Kommentare erklären Gründe und Grenzen, nicht offensichtlichen Code.
- Automatische Tests schützen ausschließlich Research-Core-Grenzen: Verträge,
  Persistenz, Timing, Studienablauf, Export und lokale Trainingsdaten.
- UI-, Layout-, Text-, Icon-, Animations- und Styling-Änderungen erhalten keine
  automatischen Tests.
- E2E-Tests sind nur für ausdrücklich benannte Milestones oder den
  Hauptstudien-Versions-Freeze zulässig.
- Bei jeder UI-Neuerstellung und -Anpassung müssen Inhalte auf allen in den Anforderungen
  relevanten Bildschirmgrößen korrekt skalieren und vollständig nutzbar bleiben.
- Farbe ist nie der einzige Bedeutungsträger; Tastatur, Fokus und `prefers-reduced-motion`
  müssen berücksichtigt werden.

## 6. Arbeitsweise für Codex

Vor Änderungen:

1. Fasse Ziel, erlaubte Pfade und Akzeptanzkriterien intern zusammen.
2. Lies nur die in der Aufgabe genannten Dokumente plus die zutreffenden Agentenregeln.
3. Prüfe, ob eine aktuelle akzeptierte Entscheidung bereits vorliegt. Frühere ADR-Revisionen sind
   keine parallelen offenen Gates, wenn sie später ersetzt wurden.

Während der Änderung:

- Halte den Diff klein und auf genau eine vertikale Aufgabe begrenzt. Unterscheide dabei klar
  zwischen akzeptiertem Zielverhalten und bereits implementiertem Stand; dokumentiere offene
  Implementierungsarbeit, ohne die fachliche Entscheidung erneut zu öffnen.
- Ändere keine Teilnehmertexte außerhalb des beauftragten Segments. Bestehender Wortlaut bleibt
  standardmäßig erhalten; fachliche Änderungen werden über die versionierten Segmentdaten und
  den passenden Copy-Audit nachvollziehbar gehalten.
- Füge keine Bibliothek hinzu, wenn eine vorhandene Abstraktion genügt.
- Schreibe keine Platzhalterlogik, die wie eine validierte Passwortbewertung wirkt.

Tests und Checks:

- Führe keinen Test- oder Check-Befehl ohne ausdrückliche Prompt-Anweisung aus.
- Führe jeden ausdrücklich verlangten Check höchstens einmal aus.
- Berichte Registry-, Toolchain- oder Runtime-Fehler sofort; wiederhole den Befehl nicht und
  weiche nicht auf eine andere Runtime aus.
- Reviews führen keine Tests aus, außer der Review-Prompt verlangt exakt einen bestimmten
  Befehl.

Vor Abschluss:

- Führe nur die im Prompt ausdrücklich verlangten Checks aus.

Berichte abschließend nur: geänderte Dateien, ausgeführte Checks, offene Risiken/Entscheidungen.

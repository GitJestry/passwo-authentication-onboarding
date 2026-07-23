# Module Map

## `apps/study-web`

Verantwortet Routing, Teilnehmer- und Forschendenoberflächen sowie konkrete Browseradapter.
Darf keine SQL- oder Randomisierungslogik enthalten.

Geplante Feature-Slices:

```text
src/
  app/                 Router, Composition Root
  features/study/      Consent, Pre, Post, Guardrail, Debrief
  features/training/   Segment-Host und Mission-Integration
  features/reference/  Launcher und Rückkehrbestätigung
  adapters/            API, Motion, React Flow, PassWo
  design-lab/          deterministische Szenen
```

## `apps/study-server`

Verantwortet sichere lokale Persistenz, verdeckte Zuweisung und Export. Der Server sieht nie
Trainingspasswörter oder Anzeigenamen.

## `packages/study-engine`

Reine Ablauf- und Timerlogik. Keine React-Imports, keine Fetch-Aufrufe, keine Speicherung.

## `packages/training-engine`

Missions- und Animationsprotokoll. Eine Mission besteht aus kleinen Schritten:

`kurze Erklärung → eine sichtbare Änderung → Replay oder Weiter`.

## `packages/training-content`

Versionierte Segmentdaten, Teilnehmertexte, Szenenreferenzen und Traceability. Änderungen hier
sind Inhaltsänderungen und benötigen fachliche Prüfung.

## `packages/password-analysis`

Enthält später ausschließlich reine, deterministische Heuristiken für die fiktive Simulation:
Bestandteile, Aufbau, freies Ausprobieren und Passwortbeziehungen. Das Modul ist kein
Produktions-Passwortmeter und erzeugt keine absolute Sicherheitsbewertung.

## `packages/visualization`

Frameworkfreie Knoten-, Kanten-, Status- und Layoutmodelle. Der erste Renderer ist React Flow,
aber Content und Engine kennen dessen Typen nicht.

## `packages/ui`

Design Tokens, BrowserShell, Bedienelemente, Sprechblase und PassWo-Platzhalter. Keine
Trainingslogik und keine Forschungsdatenspeicherung.

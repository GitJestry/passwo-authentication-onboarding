# Softwarearchitektur

## Architekturziele

1. Trainingsmechaniken austauschbar halten, ohne Content oder Studienlogik umzuschreiben.
2. Forschungsdaten strikt von temporärem Trainingszustand trennen.
3. Komplexe Abläufe explizit, testbar und reproduzierbar modellieren.
4. Einen lokalen Studienbetrieb ohne Cloud, externe Analytics oder reale Kontozugriffe erlauben.

## Systemkontext

```mermaid
flowchart LR
  P[Teilnehmende] --> W[Study Web App]
  R[Forschende] --> W
  W --> O[Study Orchestrator]
  O --> T[Supportive Training]
  O --> X[Reference Artifact Launcher]
  T --> M[Mission Controller]
  M --> A[Animation Adapter]
  M --> N[Network Adapter]
  M --> C[PassWo Adapter]
  W --> API[Local Study API]
  API --> DB[(SQLite)]
  API --> E[CSV/JSON Export]
  X --> S[SecAware.NRW im separaten Tab]
```

## Monorepo-Schnitt

```text
apps/
  study-web/       React-Anwendung, Routes, Adapter und Studienoberfläche
  study-server/    lokales API, Randomisierung, SQLite und Export
packages/
  contracts/       erlaubte API- und Domänenschemas
  study-engine/    Studienzustandsautomat und Zeitmessung
  training-engine/ Missionszustandsautomat und Animation-Ports
  training-content/versionierte Segmentmanifeste und Texte
  password-analysis/ simulationsspezifische Analyse-Ports
  visualization/   frameworkfreie Szenenmodelle und Layoutdaten
  ui/              Design Tokens und wiederverwendbare Komponenten
```

## Dependency Rules

```mermaid
flowchart TD
  Web --> StudyEngine
  Web --> TrainingEngine
  Web --> Content
  Web --> UI
  Web --> Visualization
  Web --> Contracts
  Server --> Contracts
  StudyEngine --> Contracts
  TrainingEngine --> Contracts
  Content --> Contracts
  PasswordAnalysis --> Contracts

  Server -. darf nicht .-> Content
  Server -. darf nicht .-> PasswordAnalysis
  Content -. darf nicht .-> UI
  TrainingEngine -. darf nicht .-> React[React]
  StudyEngine -. darf nicht .-> React
```

## Zustandsverantwortung

- **Study Orchestrator:** Einwilligung, Sitzung, Pre, Anzeigename, Bedingung, Artefakt, Post,
  Guardrail, Debrief und Abschluss.
- **Training Mission Controller:** Segment- und Schrittfolge innerhalb des eigenen Artefakts.
- **Scene state:** Browser-Tabs, PassWo-Pose, Netzwerkzustand und Animationssequenz.
- **React:** Projektion des aktuellen Snapshots; kein versteckter Workflow in Effects.
- **Server:** Session, Zuweisung, Timing, Antworten und Export; kein Trainingswissen.

## Ports und Adapter

| Port | Domänenzweck | Erster Adapter | Austauschmöglichkeit |
|---|---|---|---|
| `AnimationPlayerPort` | deklarative Sequenzen ausführen | Motion | Web Animations/Rive |
| `CharacterRendererPort` | PassWo-Pose und Platzierung | PNG/CSS + Motion | Rive/SVG-Layer |
| `NetworkRendererPort` | Kontennetz visualisieren | React Flow | eigenes SVG/Canvas |
| `StudyRepositoryPort` | erlaubte Studiendaten schreiben | Fastify HTTP | In-Memory-Testadapter |
| `ReferenceLauncherPort` | externe Bedingung öffnen | neuer Browser-Tab | betreuter Kioskmodus |
| `TimingSink` | Zeitereignisse persistieren | Study API | In-Memory-Testadapter |

Adaptertypen dürfen nicht in Content- oder Engine-Schemas erscheinen.

## Fehlerstrategie

- Forschungsdatenfehler werden sichtbar und blockierend behandelt; kein stilles „best effort“.
- Animationsfehler dürfen den Lernpfad nicht blockieren: sofort auf Endzustand springen und
  `continue` erlauben.
- Externe Referenzseite nicht erreichbar: Sitzung als technischer Abbruch markieren, nicht als
  regulären Abschluss.
- Reload während des Trainings: temporärer Zustand wird verworfen; Sitzung erhält einen
  unvollständigen technischen Status.

## Deployment für die Studie

- Ein lokaler Node-Prozess bindet standardmäßig nur an `127.0.0.1`.
- Fastify liefert den Vite-Build und die API aus derselben Origin aus.
- SQLite liegt außerhalb des Repositories in einem lokalen Verzeichnis mit restriktiven Rechten.
- Keine CDN-Schriften, externen Skripte, Telemetrie oder Service Worker.

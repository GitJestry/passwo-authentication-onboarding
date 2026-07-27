# AGENTS.md — study-web

Zusätzlich zur globalen `AGENTS.md` gilt:

- Der Client darf Condition, Randomisierung oder persistierbare Forschungsfelder nicht bestimmen.
- Anzeigename und Trainingsinputs bleiben flüchtig; keine Browser-Persistenz.
- React-Komponenten rendern Statechart-/Scene-Snapshots und enthalten keinen versteckten Ablauf.
- Im Web-Client werden externe Inhalte nicht eingebettet. Ausschließlich der deterministisch
  generierte lokale SecAware-Study-Build darf gemäß `ADR 0008-Reference` same-origin und sandboxed
  eingebettet werden. Die zwölf eingefrorenen Zusatz-IDs dürfen gemäß ADR 0009 ausschließlich in
  einem isolierten Desktop-`WebContentsView` außerhalb des Web-Clients geöffnet werden.
- Das SecAware-iframe darf keine Popups, Top-Level-Navigation, Downloads oder Formübertragungen
  erlauben und akzeptiert Completion nur mit Origin-, Source-, Typ-, Snapshot-ID- und
  Payload-Prüfung. Zusatznavigation prüft zusätzlich die kanonische Link-ID.
- Jede Teilnehmeroberfläche ist tastaturbedienbar, kontrastreich und Reduced-Motion-kompatibel.
- `apps/study-web` ist der einzige kanonische Renderer. BrowserShell und Design Lab sind interne
  Trainings- beziehungsweise QA-Oberflächen, keine eigenständigen Auslieferungspfade.
- Neue Renderer- oder fachliche Systeme werden einmal hier oder im passenden bestehenden
  Domain-Package implementiert; es entstehen keine Desktop-Kopien.
- UI-, Layout-, Text-, Icon-, Animations- und Styling-Änderungen erhalten keine automatischen
  Tests. Automatisierte Tests in diesem Bereich schützen nur die Research-Core-Grenzen.
- E2E-Tests sind nur für ausdrücklich benannte Milestones oder einen Study Freeze zulässig;
  sie prüfen dann Forschungswrites und den Abschluss, nie die visuelle Darstellung.

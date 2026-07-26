# AGENTS.md — study-web

Zusätzlich zur globalen `AGENTS.md` gilt:

- Der Client darf Condition, Randomisierung oder persistierbare Forschungsfelder nicht bestimmen.
- Anzeigename und Trainingsinputs bleiben flüchtig; keine Browser-Persistenz.
- React-Komponenten rendern Statechart-/Scene-Snapshots und enthalten keinen versteckten Ablauf.
- Externe Inhalte werden nicht eingebettet. Ausschließlich der deterministisch generierte lokale
  SecAware-Study-Build darf gemäß ADR 0008 same-origin und sandboxed eingebettet werden.
- Das SecAware-iframe darf keine Popups, Top-Level-Navigation, Downloads oder Formübertragungen
  erlauben und akzeptiert Completion nur mit Origin-, Source-, Typ- und Snapshot-ID-Prüfung.
- Jede Teilnehmeroberfläche ist tastaturbedienbar, kontrastreich und Reduced-Motion-kompatibel.

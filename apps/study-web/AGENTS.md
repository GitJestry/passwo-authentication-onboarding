# AGENTS.md — study-web

Zusätzlich zur globalen `AGENTS.md` gilt:

- Der Client darf Condition, Randomisierung oder persistierbare Forschungsfelder nicht bestimmen.
- Anzeigename und Trainingsinputs bleiben flüchtig; keine Browser-Persistenz.
- React-Komponenten rendern Statechart-/Scene-Snapshots und enthalten keinen versteckten Ablauf.
- Externe Inhalte werden nicht eingebettet; die Referenzbedingung öffnet einen separaten Tab.
- Jede Teilnehmeroberfläche ist tastaturbedienbar, kontrastreich und Reduced-Motion-kompatibel.

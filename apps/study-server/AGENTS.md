# AGENTS.md — study-server

Zusätzlich zur globalen `AGENTS.md` gilt:

- Der Server importiert aus dem Shared Layer ausschließlich `@passwo/contracts`.
- Kein Request-Body-, IP-, User-Agent- oder Trainingsinput-Logging.
- Sessionerstellung, Condition-Zuweisung und Timingwrites werden idempotent umgesetzt.
- SQLite, Export oder neue Felder benötigen Contract-Tests und die Datengrenze als Reviewbasis.
- Der Server bindet standardmäßig ausschließlich an `127.0.0.1`.

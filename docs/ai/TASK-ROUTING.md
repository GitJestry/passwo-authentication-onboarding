# Task Routing für Codex

Dieses Dokument verhindert, dass jeder Auftrag sämtliche Rohquellen lädt. Lies zuerst die globale
und nächstgelegene `AGENTS.md`; öffne danach nur die hier zugeordnete Dokumentation.

| Aufgabe | Pflichtlektüre | Private Quelle nur wenn explizit genannt |
|---|---|---|
| Toolchain, Workspace, Build | `README.md`, ADR 0001 | keine |
| Study Walking Skeleton | `STUDY-RUNTIME.md`, `DATA-CONTRACT.md`, ADR 0002–0005 | Exposé nur benannte Seiten |
| Timing | `TIMING-PROTOCOL.md`, ADR 0004 | keine |
| Condition-Zuweisung | ADR 0005, `RESEARCH-GUARDRAILS.md` | Exposé Methodik nur bei Forschungsentscheidung |
| Referenzbedingung | `REFERENCE-CONDITION.md`, ADR 0006 | eingefrorene Referenzdokumentation |
| BrowserShell | `BROWSER-SHELL.md`, `DESIGN-SYSTEM.md` | Designgrafik nur als visuelle Referenz |
| PassWo | `PASSWO.md`, `ANIMATION-SYSTEM.md` | benannte PassWo-Grafik |
| Mission/Animation | `ANIMATION-SYSTEM.md`, ADR 0003 und 0007 | benannte Skriptseite |
| Knotennetzwerk | `NETWORK-SYSTEM.md`, ADR 0007 | benannte Skriptseiten |
| Teilnehmertext/Segment | `segment-index.md`, `training-content/AGENTS.md` | ausschließlich benanntes Segment im Skript |
| Passwortanalyse | `password-analysis/README.md`, `RESEARCH-GUARDRAILS.md` | S05/S06-Seiten nach Auftrag |
| Fragebogen/Guardrails | `DATA-CONTRACT.md`, Exposé-Maße | instrumentenspezifische Quelle |

## Stop-Regeln

Stoppe und dokumentiere eine offene Entscheidung, wenn ein Auftrag:

- neue persistierte Felder verlangt;
- die Condition clientseitig steuerbar machen würde;
- echte Passwörter, Konten oder Sicherheitsvorfälle benötigt;
- eine Produktions-Passwortbewertung aus der Simulation ableitet;
- einen neuen Kern-Renderer oder eine neue State-Library ohne ADR einführt;
- Teilnehmertext ohne benannte Inhaltsquelle verändert.

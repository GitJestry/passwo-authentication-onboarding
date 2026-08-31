# ADR Index

Maßgeblich ist die jüngste akzeptierte oder ausdrücklich ersetzende Entscheidung. Git bewahrt die
Entstehungsgeschichte; die Dateien beschreiben nur den aktuellen Geltungsbereich.

| ADR | Entscheidung | Status |
|---|---|---|
| [0001](0001-technology-stack.md) | Technologie-Stack | accepted |
| [0002](0002-research-data-boundary.md) | Forschungsdatengrenze | accepted |
| [0003](0003-statechart-orchestration.md) | getrennte Statecharts | accepted |
| [0004](0004-timing-events.md) | ereignisbasierte Zeitmessung | accepted |
| [0005](0005-condition-assignment.md) | verdeckte Condition-Zuweisung | accepted |
| [0007](0007-renderer-adapters.md) | Renderer-Adapter | accepted |
| [0008-Reference](0008-embedded-adapted-reference-artifact.md) | eingebettetes SecAware-Artefakt | accepted |
| [0008-Lease](0008-artifact-operational-lease.md) | lokale Artefakt-Lease | legacy; Web durch 0016 ersetzt |
| [0009](0009-desktop-runtime-and-reference-supplements.md) | Electron-Hülle und Zusatzviewer | Desktop accepted; Web durch 0016 geregelt |
| [0010](0010-reference-native-quiz.md) | SecAware-Quizgrenze | accepted |
| [0011-Follow-up](0011-delayed-follow-up-recontact.md) | getrennte Recontact-Registry | accepted |
| [0011-PDF](0011-local-reference-pdf-viewer.md) | lokaler PDF-Viewer | accepted |
| [0012](0012-versioned-instrument-submissions.md) | Instrumentblöcke und Guardrail-Formen | accepted |
| [0013](0013-research-id-and-deletion-code-separation.md) | Forschungs-ID und Löschcode | accepted |
| [0014](0014-bounded-local-password-guessing-analysis.md) | lokale Passwort-Kandidatenanalyse | accepted |
| [0015](0015-bounded-artifact-viewport.md) | Full-Bleed-Artefakt-Viewport | accepted |
| [0016](0016-web-runtime-resume-and-data-lifecycle.md) | Webbetrieb, Resume und Datenabschluss | accepted; übergeordnet für Webbetrieb |
| [0017](0017-recruitment-source.md) | Rekrutierungsquelle | accepted |

Der historische, durch `ADR 0008-Reference` ersetzte Separate-Tab-Entwurf ADR 0006 wurde aus der
Arbeitsdokumentation entfernt. Seine Entwicklung bleibt in Git nachvollziehbar.

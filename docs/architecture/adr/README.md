# ADR Index

Dieses Verzeichnis enthält angenommene und versioniert fortgeschriebene
Architekturentscheidungen. Der Index erleichtert die Auswahl einschlägiger Entscheidungen, ersetzt
aber keine ADR.

## Zitierhinweis zu den beiden ADR 0008

Historisch tragen zwei angenommene Entscheidungen den numerischen Präfix `0008`. Ihre Dateinamen
bleiben unverändert; neue Verweise verwenden deshalb die folgenden eindeutigen Zitierlabels:

| Zitierlabel | Entscheidung | Pfad |
|---|---|---|
| `ADR 0008-Lease` | Operative Artefakt-Lease | [0008-artifact-operational-lease.md](./0008-artifact-operational-lease.md) |
| `ADR 0008-Reference` | Eingebettetes, studienadaptiertes Referenzartefakt | [0008-embedded-adapted-reference-artifact.md](./0008-embedded-adapted-reference-artifact.md) |

ADR 0006 bleibt als durch `ADR 0008-Reference` abgelöste historische Entscheidung erhalten.

## Leseregel

Maßgeblich ist jeweils die jüngste akzeptierte oder ausdrücklich ersetzende Entscheidung.
Historische Revisionen erklären die Entwicklung, gelten aber nicht gleichzeitig als aktuelle
Anforderung. Für Webbetrieb, Wiederaufnahme, Follow-up-Betrieb und Datenabschluss ist
`ADR 0016-Web-Resume-Lifecycle` die übergeordnete aktuelle Entscheidung.

## Neuere Ergänzungen

| Zitierlabel | Entscheidung | Pfad |
|---|---|---|
| `ADR 0010-Reference-Quiz` | Natives SecAware-Quiz innerhalb der Artefaktzeit | [0010-reference-native-quiz.md](./0010-reference-native-quiz.md) |
| `ADR 0011-Reference-PDF` | Lokaler PDF-Viewer für SecAware-Zusatzinformationen | [0011-local-reference-pdf-viewer.md](./0011-local-reference-pdf-viewer.md) |
| `ADR 0011-Follow-up-Recontact` | Getrennte Recontact-Registry für das verzögerte Follow-up | [0011-delayed-follow-up-recontact.md](./0011-delayed-follow-up-recontact.md) |
| `ADR 0012-Instrument-Submissions` | Versionierte Instrumentblöcke und balancierte Guardrail-Präsentation | [0012-versioned-instrument-submissions.md](./0012-versioned-instrument-submissions.md) |
| `ADR 0013-Deletion-Code-Separation` | Trennung von Forschungs-ID und Löschcode | [0013-research-id-and-deletion-code-separation.md](./0013-research-id-and-deletion-code-separation.md) |
| `ADR 0014-Bounded-Password-Guessing` | Begrenzte lokale Passwort-Rateweganalyse | [0014-bounded-local-password-guessing-analysis.md](./0014-bounded-local-password-guessing-analysis.md) |
| `ADR 0015-Artifact-Viewport` | Gemeinsamer Full-Bleed Artefakt-Viewport | [0015-bounded-artifact-viewport.md](./0015-bounded-artifact-viewport.md) |
| `ADR 0016-Web-Resume-Lifecycle` | Webbetrieb, Wiederaufnahme und Datenabschluss | [0016-web-runtime-resume-and-data-lifecycle.md](./0016-web-runtime-resume-and-data-lifecycle.md) |
| `ADR 0017-Recruitment-Source` | Minimale Rekrutierungsquellen-Erfassung | [0017-recruitment-source.md](./0017-recruitment-source.md) |

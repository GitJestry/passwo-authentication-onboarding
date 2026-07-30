# Placement

Overlay the contained paths onto the repository root:

- `docs/research/MEASUREMENT-INSTRUMENT.md`
- `docs/research/GUARDRAIL-CONTENT-AUDIT.md`
- `docs/research/DATA-CONTRACT.md`
- `docs/research/RESEARCH-GUARDRAILS.md`
- `docs/research/STUDY-RUNTIME.md`
- `docs/architecture/adr/0011-delayed-follow-up-recontact.md`
- `docs/architecture/adr/0012-versioned-instrument-submissions.md`
- `research/derived/instruments-v1.yaml`
- `research/derived/instruments-v1.runtime.json`

Add this row under “Neuere Ergänzungen” in `docs/architecture/adr/README.md`:

```md
| `ADR 0011-Follow-up-Recontact` | Getrennte Recontact-Registry für das verzögerte Follow-up | [0011-delayed-follow-up-recontact.md](./0011-delayed-follow-up-recontact.md) |
| `ADR 0012-Instrument-Submissions` | Versionierte Instrumentblöcke und balancierte Guardrail-Präsentation | [0012-versioned-instrument-submissions.md](./0012-versioned-instrument-submissions.md) |
```

`instruments-v1.yaml` replaces the previous draft. Version 1.4 makes the announced ten-day
follow-up a required part of participation while retaining the version 1.3 questionnaire response
formats and the unchanged follow-up questions.

`instruments-v1.runtime.json` is a checked-in participant-facing runtime projection without
scoring classifications or analysis flags. It includes the balanced option-order forms needed by
the server and may be copied into `packages/contracts/src/generated/` during implementation; do not import files
from `research/` directly into the browser bundle.

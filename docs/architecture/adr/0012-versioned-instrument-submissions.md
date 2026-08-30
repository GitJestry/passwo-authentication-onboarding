# ADR 0012 — Versionierte Instrumentblöcke und balancierte Guardrail-Präsentation

- **Status:** Accepted
- **Datum:** 2026-07-30
- **Aktuelle Revision:** 2026-08-30
- **Citation label:** `ADR 0012-Instrument-Submissions`
- **Ergänzt:** ADR 0002, ADR 0003 und ADR 0005
- **Zusammen lesen mit:** `MEASUREMENT-INSTRUMENT.md`, `PARTICIPANT-INFORMATION.md` und ADR 0016

## Aktuelle wirksame Fassung

Für die nächste Web-Pilot- und Hauptstudienfreigabe gelten die eingecheckten aktuellen Manifeste
und die folgende Versionskombination:

| Bestandteil | Version |
|---|---|
| Instrument | `3.0.0-pilot` |
| Fragebogen | `questionnaire-v4-pilot` |
| Guardrail | `guardrail-v6-pilot` |
| Einwilligung | `consent-v14-pilot` |
| Follow-up | `follow-up-v6-pilot` |
| Runtime-Manifest | `instrument-runtime-v10-pilot` |

Frühere Revisionen dieser ADR dokumentierten Zwischenstände. Sie sind über die Git-Historie
nachvollziehbar, aber keine parallelen Anforderungen und keine offenen Versions-Freeze-Eingaben.

## Entscheidung

### Kanonische Instrumentquellen

Die vollständige Forschungs- und Auswertungsspezifikation liegt in
`research/derived/instruments-v1.yaml`. Die teilnehmerseitige, von Klassifikationen bereinigte
Runtime-Projektion liegt in `research/derived/instruments-v1.runtime.json` und wird bytegleich nach
`packages/contracts/src/generated/instruments-v1.runtime.json` übernommen.

Die Runtime-Projektion enthält Texte, IDs, Antworttypen, Optionen, Blockstruktur und die sechs
balancierten Guardrail-Formen. Sie enthält keine Richtig-/Falsch-, `appropriate`-, `incomplete`-
oder `unsafe`-Klassifikation. Scoring und Kategorisierung erfolgen ausschließlich im reproduzierbaren
Analyseprozess.

Die fachliche Beschreibung von Reihenfolge, Skalen und Interpretationsgrenzen steht kanonisch in
`docs/research/MEASUREMENT-INSTRUMENT.md`; Teilnehmerinformation und Einwilligung stehen kanonisch in
`docs/research/PARTICIPANT-INFORMATION.md`.

### Atomare Submissions

Ein Client sendet immer einen vollständigen Instrumentblock. Der Server validiert die exakt
erwartete Itemmenge und alle Werte anhand der versionierten Runtime-Definition.

- Der erste gültige Block wird transaktional gespeichert.
- Eine identische Wiederholung ist idempotent.
- Eine abweichende zweite Abgabe desselben Blocks wird als Konflikt abgelehnt.
- Bereits atomar gespeicherte Blöcke werden bei Wiederaufnahme nicht erneut erhoben.
- Antwortbuchstaben oder sichtbare Positionen werden nicht als Forschungswert gespeichert; nur
  stabile Item- und Option-IDs.

### Guardrail-Präsentation

Condition und Guardrail-Form werden serverseitig und getrennt in kleinen permutierten Blöcken
zugewiesen. Der Client kann weder Condition noch Form wählen.

Für jedes Guardrail-Item bilden `F1` bis `F6` alle sechs Permutationen der drei inhaltlichen
Antwortoptionen ab. `Weiß ich nicht` bleibt an letzter Position. Form-ID und tatsächlich angezeigte
Option-IDs werden persistiert und exportiert. Es gibt keinen Guardrail-Gesamtscore, keine
Pass-Fail-Schwelle und kein Correctness Feedback vor Abschluss aller In-Session-Outcomes.

### Aktuelle Teilnehmer- und Lifecycle-Revision

`consent-v14-pilot` und `instrument-runtime-v10-pilot` präzisieren ausschließlich
Teilnahmeinformation und Runtime-Texte für den S01–S07-Reload-Checkpoint:

- fiktive Passwörter können für die unmittelbare Wiederherstellung vorübergehend im Browser liegen;
- sie werden weiterhin nicht an den Server übertragen und nicht als Forschungsdaten gespeichert;
- ein passender tab-lokaler Snapshot erlaubt Resume am bestätigten Segment-Einstieg S01 bis S07;
- fehlt dieser Snapshot, bleibt der bisherige S01-Fallback bestehen;
- Messitems, Skalen, Guardrail-Formen, Antwortoptionen und Erhebungsreihenfolge bleiben unverändert.

Diese Revision verändert keine Messitems, Skalen, Guardrail-Formen, Antwortoptionen oder
Erhebungsreihenfolgen. Die Consent-Fassung und der zugehörige Reload-Checkpoint gehören zur selben
Release-Einheit und dürfen nicht getrennt voneinander ausgeliefert werden.

## Persistierte Forschungsfelder

Die Instrumentarchitektur verwendet:

- `guardrail_form_id` an der Session;
- `instrument_submissions` mit Block-ID, Payload-Fingerprint und Abgabezeit;
- `response_presentations` mit der tatsächlich dargestellten Optionreihenfolge;
- `section_id` für einzelne Response-Zeilen;
- die in ADR 0016 autorisierten operativen Resume-Felder, die nicht Teil des Instruments und nicht
  Teil des Forschungsdatenexports sind.

Schemaänderungen laufen über nummerierte Migrationen. `CREATE TABLE IF NOT EXISTS` allein ist keine
Migration bestehender Datenbanken.

## Konsequenzen

- Renderer und Teilnehmerbundle enthalten keine Guardrail-Auswertung.
- Instrument-, Consent- oder Runtime-Copy-Änderungen benötigen einen passenden Versionssprung und
  synchronisierte Runtime-Kopien.
- Änderungen an Item-IDs, Formen, Persistenz- oder Konfliktsemantik benötigen eine Revision dieser
  ADR.
- Die optionale Nachbefragung bleibt ein getrennt versioniertes Instrument und läuft gemäß ADR 0011
  und ADR 0016 auf einer tokenisierten same-origin Route.
- Die zweite qualifizierte Inhaltsprüfung bleibt fachliche Research QA, keine psychometrische
  Validierung und keine zusätzliche Softwarefunktion.

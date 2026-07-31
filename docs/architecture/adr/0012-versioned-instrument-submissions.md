# ADR 0012 — Versionierte Instrumentblöcke und balancierte Guardrail-Präsentation

- **Status:** Accepted
- **Datum:** 2026-07-30
- **Citation label:** `ADR 0012-Instrument-Submissions`
- **Ergänzt:** ADR 0002, ADR 0003 und ADR 0005

## Kontext

Die bisherige Study Runtime speichert für Pre, Post und Guardrail nur boolesche Platzhalter. Die
finale Instrumentfassung benötigt versionierte Itemantworten, atomare Blockabgaben, stabile
Retries, eine reproduzierbare Guardrail-Optionenreihenfolge und einen Export ohne
clientseitige Scoringlogik. Diese Daten sind zulässige Forschungsdaten, erweitern aber das
persistierte Schema und benötigen daher eine explizite Entscheidung.

## Entscheidung

Die teilnehmerseitige Runtime-Definition wird als geprüftes, eingechecktes JSON in
`@passwo/contracts` geführt und gegen `research/derived/instruments-v1.runtime.json` getestet. Sie
enthält Texte, IDs, Antworttypen, Optionen, Blockstruktur und die drei balancierten
Guardrail-Formen, aber keine Richtig-/Falsch-, `appropriate`-, `incomplete`- oder
`unsafe`-Klassifikationen. Die vollständige Forschungs- und Scoring-Spezifikation bleibt in
`research/derived/instruments-v1.yaml`.

Ein Client sendet immer einen vollständigen Instrumentblock. Der Server validiert die exakt
erwartete Itemmenge und alle Werte anhand der versionierten Runtime-Definition. Der erste gültige
Block wird in einer Transaktion gespeichert. Eine identische Wiederholung ist idempotent; eine
abweichende zweite Abgabe desselben Blocks wird als Konflikt abgelehnt und überschreibt keine
Daten.

Die Forschungsdatenbank ergänzt:

- `guardrail_form_id` an der Session;
- eine innerhalb jeder Artefaktbedingung getrennt balancierte Formzuweisung über permutierte
  Dreierblöcke `F1`, `F2`, `F3`;
- `instrument_submissions` mit Block-ID, Payload-Fingerprint und Abgabezeit;
- `response_presentations` mit der tatsächlich dargestellten Optionreihenfolge;
- `section_id` für einzelne Response-Zeilen.

Formzuweisung und Condition-Zuweisung erfolgen transaktional, aber über getrennte Blockfolgen. Der
Client kann weder Condition noch Form wählen. `Weiß ich nicht` bleibt in allen Formen an letzter
Stelle. Rohantworten und Präsentationsreihenfolge werden exportiert; Scoring erfolgt ausschließlich
im reproduzierbaren Analyseprozess.

Schemaänderungen laufen über nummerierte SQLite-Migrationen. `CREATE TABLE IF NOT EXISTS` allein
ist keine Migration bestehender Datenbanken.

## Konsequenzen

- Der Renderer enthält keine Guardrail-Auswertung und zeigt vor Abschluss beider Blöcke kein
  Richtig/Falsch-Feedback.
- Antwortbuchstaben oder sichtbare Positionen werden nie als Forschungswert gespeichert; nur
  stabile Option-IDs.
- Der Export erhält eine neue Schemaprofilversion, Response Presentations und ein Data Dictionary.
- Die Platzhalterverträge dürfen während eines einzelnen Implementierungsschritts kompatibel
  weiterbestehen, müssen aber mit der echten UI-Integration vollständig entfernt werden.
- Änderungen an Instrument-IDs, Formularformen, Persistenz- oder Konfliktsemantik benötigen eine
  Revision dieser ADR und neue Instrumentversionen.

## Revision 2026-07-30 — Fragebogen-Antwortformate

Die Instrument- und Fragebogenversionen werden auf `1.3.0-draft` beziehungsweise
`questionnaire-v1.3-draft` angehoben; das Runtime-Manifest wird
`instrument-runtime-v1.3-draft`. Anlass sind die geänderte Self-Efficacy-Semantik und die
explizite Trennung der Antwortformate. Instrument-, Section-, Item- und Response-IDs bleiben
stabil. Guardrail und Follow-up sind inhaltlich unverändert und behalten ihre Versionen.

## Revision 2026-07-30 — verpflichtende Nachbefragung

Die Instrumentversion wird auf `1.4.0-draft`, das Runtime-Manifest auf
`instrument-runtime-v1.4-draft` und die Consent-Version auf `consent-v2-draft` angehoben. Die
Nachbefragung ist nun angekündigter Bestandteil der allgemeinen Einwilligung; eine separate
Follow-up-Entscheidung entfällt. Fragebogen-, Guardrail- und Follow-up-Instrumentversion sowie die
Follow-up-Fragen bleiben unverändert.

## Revision 2026-07-31 — optionale Nachbefragung und strukturierte Teilnehmerinformation

Die vorangehende Pflicht-Follow-up-Revision wird durch `ADR 0011-Follow-up-Recontact` und die
kanonische `PARTICIPANT-INFORMATION.md` abgelöst. Die Follow-up-Einwilligung ist getrennt und
optional; eine Ablehnung blockiert die Hauptstudie nicht.

Die Instrumentversion wird auf `1.5.0-draft`, das Runtime-Manifest auf
`instrument-runtime-v1.5-draft` und die Consent-Version auf `consent-v3-draft` angehoben. Die
gemeinsame Teilnahmeinformation, Consent-Texte, optionale Recontact-Texte und beide Varianten der
Session Closure werden als strukturierte Runtime-Daten geführt. Fragebogen-, Guardrail- und
Follow-up-Inhaltsversionen bleiben unverändert.

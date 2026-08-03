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
enthält Texte, IDs, Antworttypen, Optionen, Blockstruktur und die sechs balancierten
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
  Sechserblöcke `F1` bis `F6`;
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

## Revision 2026-08-02 — Instrument Revision v1.6

Die Instrumentversion wird auf `1.6.0-draft`, die Fragebogenversion auf
`questionnaire-v1.4-draft`, die Guardrail-Version auf `guardrail-v3-draft`, die Follow-up-Version
auf `follow-up-v2-draft` und das Runtime-Manifest auf `instrument-runtime-v1.6-draft` angehoben.
Die Consent-Version bleibt `consent-v3-draft`.

Die Instrument-IDs `pre-v1`, `post-v1`, `guardrail-v2`, `post-open-v1` und `follow-up-v1`
bleiben stabil. Im Guardrail ersetzen die Item-IDs `SCENARIO_DISTINCT_PASSWORDS` und
`SCENARIO_PM_MANY_ACCOUNTS` die bisherigen Szenario-IDs. Die revidierten Follow-up-Optionen
trennen `cannot_recall` und `no_answer`, entfernen die beiden Recovery-Prüfhandlungen und teilen
die bisherigen kombinierten Vertrauens-/Zugangsgründe in die fachlich festgelegten Einzelgründe.

`PRE_GENDER` ist technisch verpflichtend. Inhaltliche Freiwilligkeit wird ausschließlich durch
die stabile Antwortoption `no_answer` abgebildet; ein zusätzlicher Nullwert ist unzulässig.

PassWo-interne Lernfragen bleiben im PassWo-Artefakt erhalten. Das native SecAware-Abschlussquiz
bleibt als fest beschlossene und betreuerseitig gebilligte Studienadaption aus dem gemessenen
Referenzpfad entfernt, um unmittelbare Feedback-Kontamination des gemeinsamen externen
Guardrails zu vermeiden. Native Scores sind keine Studienoutcomes. Diese Revision ändert weder
den eingefrorenen SecAware-Build noch Persistenzschema, Migrationen, Randomisierung oder Timing.

## Revision 2026-08-02 — Instrument Revision v1.7

Die Instrumentversion wird auf `1.7.0-draft`, die Fragebogenversion auf
`questionnaire-v1.5-draft`, die Consent-Version auf `consent-v4-draft`, die Follow-up-Version auf
`follow-up-v3-draft` und das Runtime-Manifest auf `instrument-runtime-v1.7-draft` angehoben.
Guardrail-Version und Guardrail-Formen bleiben unverändert.

`PRE_GENDER`, die drei allgemeinen Familiarity-Items, das redundante TF5-Interesse-Item und der
explorative Emotionsblock werden entfernt. Das bisher doppelte Passwortmanager-Self-Efficacy-Item
wird in Erzeugen/Speichern und Abruf/Anmeldung getrennt. Zeitfragen stehen im Post unmittelbar
nach dem Artefakt vor dem UEQ-S. Die Zustimmungsskala bleibt siebenstufig und vollständig
beschriftet, wird aber ohne horizontale Scrollpflicht pro Item dargestellt.

Die Teilnehmerinformation erhält eine sofort sichtbare Kerninformation, einen während der Sitzung
erreichbaren Detailzugang und den zugänglichen Teilnehmercode. Offizielle Datenschutzkontakte,
Rechtsgrundlage und konkrete Löschfristen bleiben externe Study-Freeze-Eingaben und werden nicht
durch die Software erfunden.

## Revision 2026-08-02 — Teilnehmertext und Löschcode-Trennung v1.8

Die Instrumentversion wird auf `1.8.0-draft`, die Consent-Version auf `consent-v5-draft` und das
Runtime-Manifest auf `instrument-runtime-v1.8-draft` angehoben. Fragebogen-, Guardrail- und
Follow-up-Inhaltsversionen bleiben unverändert.

Die sichtbaren Kurzfakten auf der Willkommensseite entfallen, weil dieselben Informationen bereits
in der unmittelbar sichtbaren Kerninformation und in den ausführlichen Teilnahmeinformationen
enthalten sind. Titel, Willkommenstext und Zweckbeschreibung werden auf Passwörter und den Schutz
von Online-Konten präzisiert. Die ausführlichen Informationen bleiben über einen kompakten,
zugänglichen Dialog erreichbar.

Gemäß `ADR 0013-Deletion-Code-Separation` wird der bisherige Teilnehmercode als Löschcode
bezeichnet und von der Forschungs-ID getrennt. Der Löschcode wird nach Sessionerstellung und am
Sitzungsende angezeigt, aber weder als Forschungs-ID verwendet noch exportiert.

## Revision 2026-08-03 — Getrennte Audit- und Analyseexporte

Der gemeinsame Forschungsdatenexport erhält die Profile `audit` und `analysis`. Das gemeinsame
Manifestformat wird `research-export-v5`; die gekoppelten Schemaprofilversionen heißen
`research-audit-v1` und `research-analysis-v1`. Das Auditprofil bleibt die geschützte interne
Nachweisfassung mit technischen Zeitpunkten. Das Analyseprofil entfernt exakte Kalender-,
Empfangs-, Erstellungs- und monotone Startzeitpunkte; methodisch notwendige Dauern, Sequenzen,
Versionen, Condition, Guardrail-Form, Completion-Status und Forschungs-ID bleiben erhalten.

Ausgefüllte Freitextantworten werden im Analyseprofil aus den regulären Responses separiert und in
einer geschützten `free-text-review`-Datei mit `pending-review` ausgewiesen. Erst eine manuell auf
identifizierende Angaben geprüfte und bereinigte Fassung darf in die Analyse übernommen werden.
Leere optionale Freitexte bleiben als `null` analysierbar. Beide Profile schließen Session-ID,
Kontaktdaten, Löschcodes, Token und Trainingsinputs aus. Das Manifest enthält Profil,
Schemaprofilversion, Freitextanzahl, Prüfstatus und Prüfsummen. Diese Revision ändert keine
Persistenzfelder, Instrumentantworten, Randomisierung oder Timing-Erhebung.

## Revision 2026-08-03 — Datenschutzkontakt und Betroffenenrechte v1.9

Die Instrumentversion wird auf `1.9.0-draft`, die Consent-Version auf `consent-v6-draft` und das
Runtime-Manifest auf `instrument-runtime-v1.9-draft` angehoben. Fragebogen-, Guardrail- und
Follow-up-Inhaltsversionen bleiben unverändert.

Der bisherige Kontaktplatzhalter wird anhand der offiziellen Datenschutzerklärung und
Datenschutz-Stabsstelle der Universität Bonn durch verantwortliche Stelle und
Datenschutzbeauftragte ersetzt. Die ausführliche Teilnehmerinformation nennt zusätzlich
Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO, Widerruf für die Zukunft, die wesentlichen
Betroffenenrechte und die zuständige Landesaufsicht. Der geschützte Einwilligungssatz bleibt
unverändert. Konkrete Aufbewahrungs- und Löschfristen bleiben die einzige noch einzutragende
Datenschutzangabe vor dem Study Freeze.

## Revision 2026-08-03 — Finaler Questionnaire Freeze 2.0

Diese Revision ersetzt für die Hauptsitzung alle früheren Draft-Instrumententscheidungen. Die
Instrumentversion wird `2.0.0`, die Fragebogenversion `questionnaire-v2`, die Guardrail-Version
`guardrail-v4`, die Follow-up-Version `follow-up-v4` und das Runtime-Manifest
`instrument-runtime-v2`. Die Consent-Version bleibt durch diese Revision unverändert.

Die Haupt-Study-Runtime enthält ausschließlich `pre-v1`, `post-v1`, `guardrail-v2` und
`post-open-v1`. Der Follow-up-Fragebogen wird aus der Runtime entfernt und als getrenntes
Instrument in `research/derived/follow-up-v4.yaml` sowie
`docs/research/FOLLOW-UP-INSTRUMENT.md` versioniert. Die Hauptanwendung verwaltet weiterhin nur
optionale Recontact-Einwilligung, getrennte Kontaktregistrierung und Versandplanung.

Die Hauptsitzungsreihenfolge wird verbindlich auf unmittelbare Post-Wahrnehmung, drei
Anwendungsszenarien, drei Recognition-Items, Post-Guardrail-Self-Efficacy, retrospektive
SecAware-Vorerfahrung und einen optionalen Kommentar festgelegt. Recognition darf die
Anwendungsszenarien nicht vorwegnehmen; vor Abschluss aller In-Session-Outcomes wird kein
Correctness Feedback gezeigt.

Die Guardrail-Zuweisung wird von drei auf sechs Formen `F1` bis `F6` erweitert. Innerhalb jeder
Artefaktbedingung werden kleine permutierte Sechserblöcke verwendet. Die Formen bilden alle sechs
Reihenfolgen der drei Anwendungsszenarien ab und platzieren jede substantive Antwortoption für
jedes Item genau zweimal auf jeder der drei Positionen. `Weiß ich nicht` bleibt fest an letzter
Stelle. Die Form-ID und angezeigten Option-IDs bleiben persistierte Forschungsdaten; die
Question-Order wird aus der versionierten Formdefinition deterministisch rekonstruiert.

Die Runtime-Projektion enthält weiterhin keine Guardrail-Klassifikationen. Es werden kein
Guardrail-Gesamtscore, kein Pass/Fail und kein Unsafe-Summenwert gespeichert oder berechnet. Die
Erweiterung der zulässigen Form-IDs erfolgt über SQLite-Migration 7. Bestehende Sessions behalten
ihre frühere Form; neue Formblöcke verwenden alle sechs Formen.

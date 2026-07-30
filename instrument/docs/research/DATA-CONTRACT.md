# Data Contract

## Datenklassen

| Klasse | Beispiele | Persistenz |
|---|---|---|
| Study identity | Session UUID, pseudonymer Teilnehmercode | Forschungsdatenbank |
| Assignment | Bedingung, Zuweisungsmodus, Guardrail-Form | Forschungsdatenbank |
| Versioning | Study-, Content-, Questionnaire-, Guardrail-, Consent-, Follow-up-Version | Forschungsdatenbank |
| Timing | Phase, Segment-ID, Start/Ende, monotone Dauer | Forschungsdatenbank |
| Instruments | Pre, Post, Guardrail, optionale offene Rückmeldung, importiertes Follow-up | Forschungsdatenbank |
| Guardrail presentation | Form-ID und angezeigte Option-IDs | Forschungsdatenbank |
| Follow-up linkage | Follow-up-Version und Hash des Follow-up-Tokens | Forschungsdatenbank |
| Recontact identity | E-Mail, Roh-Token, Versand- und Ablaufzeitpunkte | getrennte Recontact-Registry |
| Ephemeral personalization | Anzeigename/Kürzel | nie persistieren |
| Training input/diagnosis | fiktive Passwörter, Loginversuche, Findings, Ähnlichkeit | nie persistieren |
| Native reference quiz | Antworten, Punkte, SCORM-Interaktionen | nicht erheben |
| Sensitive real-world data | reale Konten, Passwörter, Tokens, Vorfälle | nie erheben |
| Passive metadata | IP, User-Agent, Request-Bodies | nicht persistieren |

## Forschungsdatenbank

Die vorhandene `study.sqlite` enthält:

- `study_sessions`;
- `assignment_slots`;
- eine getrennte balancierte Guardrail-Formzuweisung oder äquivalente transaktionale Relation;
- `timing_events`;
- `artifact_leases`;
- `responses`;
- `response_presentations`.

`study_sessions` erhält mindestens:

- `guardrail_form_id` (`F1`--`F3`);
- `follow_up_token_hash` nach verpflichtender Recontact-Registrierung;
- die eingefrorenen Instrumentversionen.

E-Mail und Roh-Token sind in `study.sqlite` verboten.

## Antwort-Submission

Der Client sendet einen Instrument- beziehungsweise Guardrail-Block atomar:

```json
{
  "instrumentId": "guardrail-v2",
  "sectionId": "recognition",
  "responses": [
    { "itemId": "MR_REUSE", "value": "try_other_service" }
  ]
}
```

Der Server validiert Instrument-, Section- und Item-ID, vollständige erwartete Itemmenge,
erlaubte Werte, exklusive Multi-Choice-Optionen, Textlängen und Studienreihenfolge. Zulässige
Werte sind begrenzte primitive Werte, `null` und begrenzte Arrays stabiler Option-IDs. Beliebige
JSON-Objekte sind nicht zulässig.

Die Wertebereiche sind Teil der versionierten Runtime-Definition: UEQ-S und Zustimmung `1`--`7`,
Self-Efficacy-Konfidenz `0`--`10`, Vertrautheit und Emotionsintensität `1`--`5`,
Dauerangemessenheit `1`--`7` sowie gefühlte Dauer als ganzzahlige Minuten. Die
Self-Efficacy-Antworten bleiben drei getrennte Pre-/Post-Itempaare; Persistenz und Export erzeugen
keinen gemeinsamen Score.

Wiederholung derselben vollständigen Submission ist idempotent. Eine abweichende zweite
Submission für denselben Block erzeugt einen Konflikt und überschreibt keine vorhandenen Daten.

## Guardrail-Präsentation

Bei Sessionerstellung wird die Form serverseitig und unabhängig von der Bedingung zugewiesen. Die
tatsächliche Option-Order wird in `response_presentations` festgehalten. Der Client erhält nur
Teilnehmertext und die zugewiesene Reihenfolge. Scoring-Klassifikationen verbleiben in der
Forschungs-/Analysespezifikation.

## Getrennte Recontact-Registry

`~/.passwo-study/recontact.sqlite` enthält ausschließlich Token-Hash und Roh-Token,
E-Mail-Adresse, Consent-Version, Registrierung, Einladung, Erinnerung, Schließung und
Versandstatus. Sie enthält keine Bedingung, Antworten, Timings oder Trainingsdaten. Der normale
Forschungsdatenexport liest sie niemals.

Die E-Mail-Adresse ist Teilnahmevoraussetzung und wird vor dem Pre-Fragebogen registriert. Es gibt
kein separat persistiertes Follow-up-Opt-in. Eine spätere Nichtbeantwortung ist fehlende
Follow-up-Information und wird nie als `keine Handlung` codiert.

Ein expliziter Schedule-Export darf E-Mail, Einladungslink und Zeitpunkte nur in ein getrennt
gewähltes, lokal geschütztes Ziel schreiben. Ein späterer Follow-up-Import hasht den Roh-Token,
ordnet die Antworten der pseudonymen Session zu und kopiert weder E-Mail noch Roh-Token in die
Forschungsdatenbank.

## Export

Der Forschungsdatenexport enthält Sessions, Timing, Responses und Response Presentations als CSV
und JSON, Manifest mit Versionen und Hashes sowie ein Data Dictionary mit Item- und Option-IDs.
Er enthält keine E-Mail, keinen Roh-Token, keine Trainingsinputs und keine nativen
SecAware-Quizdaten.

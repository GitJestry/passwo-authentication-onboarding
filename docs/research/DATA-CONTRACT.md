# Data Contract

## Datenklassen

| Klasse | Beispiele | Persistenz |
|---|---|---|
| Study identity | interne Session-UUID, nicht angezeigte Forschungs-ID | `study.sqlite` |
| Deletion lookup | ausschließlich SHA-256-Hash des flüchtigen Löschcodes | `study.sqlite` |
| Assignment | Bedingung, Zuweisungsmodus, Guardrail-Form `F1` bis `F6` | `study.sqlite` |
| Versioning | Study-, Content-, Fragebogen-, Guardrail-, Consent-, Follow-up- und Referenzversion | `study.sqlite` |
| Timing | Phase, Segment-ID, Start/Ende, monotone Dauer | `study.sqlite` |
| Main-session instruments | Pre, unmittelbarer Post, Guardrail, Post-Guardrail-Self-Efficacy, retrospektive SecAware-Frage, optionaler Kommentar | `study.sqlite` |
| Presentation | Form-ID und tatsächlich angezeigte Guardrail-Option-IDs | `study.sqlite` |
| Completion | complete, incomplete, technical failure | `study.sqlite` |
| Follow-up linkage | optionale Einwilligung, Follow-up-Version, optionaler Token-Hash | `study.sqlite` |
| Recontact | E-Mail, Roh-Token, Token-Hash, Consent-Version, Versand-/Schließzeitpunkte | ausschließlich `recontact.sqlite` |
| Externes Follow-up | separat ausgelieferte Antworten, später versioniert importierbar | nicht Bestandteil der Training Runtime |
| Ephemeral participant data | Anzeigename/Kürzel, roher Löschcode | nur flüchtiger Study-Renderer |
| Training input/diagnosis | fiktive Passwörter, Loginversuche, Findings, Ähnlichkeit | nie persistieren |
| Sensitive real-world data | reale Konten, Passwörter, Tokens, Vorfälle | nie erheben |
| Passive metadata | IP, User-Agent, Request-Bodies | nicht persistieren |

## Forschungsdatenbank

`study.sqlite` enthält:

- `study_sessions` für interne Session-UUID, Forschungs-ID, Löschcode-Hash, Zuweisung,
  Instrumentversionen, Follow-up-Einwilligung und Status;
- `assignment_slots` und `guardrail_form_slots` für getrennte serverseitige Blockzuweisungen;
- `timing_events` für idempotente Zeitereignisse;
- `artifact_leases` ausschließlich für operative Reload-Erkennung;
- `instrument_submissions` für atomare Blockabgaben und Payload-Fingerprints;
- `responses` für validierte Antworten der Hauptsitzung;
- `response_presentations` für die tatsächlich dargestellten Guardrail-Optionen.

`artifact_leases` sind weder Forschungstiming noch Bestandteil des Exports. E-Mail,
Roh-Token und Recontact-Request-ID sind in `study.sqlite` verboten.

## Kanonische Instrumentquellen

Die Hauptsitzung verwendet:

- `research/derived/instruments-v1.yaml` als Forschungs- und Analysespezifikation;
- `research/derived/instruments-v1.runtime.json` als teilnehmerseitige Runtime-Projektion;
- `packages/contracts/src/generated/instruments-v1.runtime.json` als identische eingebundene
  Projektion.

Die Runtime enthält ausschließlich `pre-v1`, `post-v1`, `guardrail-v2` und `post-open-v1`.
Follow-up-Fragen sind ausdrücklich ausgeschlossen. Ihr separater Wortlaut liegt in
`research/derived/follow-up-v4.yaml` und `docs/research/FOLLOW-UP-INSTRUMENT.md`.

## Antwort-Submission

Der Client sendet einen vollständigen Instrumentblock mit `instrumentId`, `sectionId` und der
exakt erwarteten Itemmenge. Der Server validiert IDs, Itemmenge, Wertebereiche,
Mehrfachauswahl-Exklusivität und Textlängen anhand der versionierten Runtime-Definition.

Die erste gültige Submission wird transaktional gespeichert. Eine identische Wiederholung ist
idempotent. Ein abweichender zweiter Payload für denselben Block erzeugt einen Konflikt und
überschreibt keine Daten. Rohantworten und Präsentationsreihenfolge werden exportiert; Scoring und
Klassifikation finden ausschließlich im reproduzierbaren Analyseprozess statt.

Die Hauptsitzung verwendet folgende Blockreihenfolge:

```text
Pre-Abschnitte
→ unmittelbare Post-Abschnitte
→ Guardrail scenarios
→ Guardrail recognition
→ Post-Guardrail Self-Efficacy
→ retrospektive SecAware-Vorerfahrung
→ post-open
```

Die sechs Guardrail-Formen werden serverseitig innerhalb jeder Bedingung in kleinen permutierten
Sechserblöcken zugewiesen. Form und dargestellte Option-IDs werden vor der ersten Antwort
persistiert und bleiben über Navigation oder Reload stabil. Der Client kann weder Condition noch
Form wählen.

## Item- und Analysegrenzen

- `PRE_SECAWARE_RETROSPECTIVE` wird erst nach Guardrail und Post-Self-Efficacy gespeichert. Die
  primäre Vergleichsanalyse schließt aufgrund dieser retrospektiven Angabe niemanden aus.
- Die vier Pre-/Post-Self-Efficacy-Paare verwenden getrennte stabile IDs für kontospezifischen
  Zugang, Passwortmanager-Einrichtung, Passwortmanager-Anmeldung und MFA-Aktivierung. Es gibt
  keinen gemeinsamen Score.
- UEQ-S, UEQ+ Inhaltsseriosität und Custom Items bleiben getrennte Ergebnisfamilien.
- `TIME_FIT` und `RISK_PRESENTATION` sind Mittelpunkturteile; höhere Werte sind nicht besser.
- Guardrail-Klassifikationen wie `appropriate`, `incomplete`, `unsafe` oder `correct` werden nicht
  an den Client ausgeliefert und nicht mit den Antworten gespeichert.
- `OPEN_COMMENT` ist optional. Leerer Text wird als `null` gespeichert; ausgefüllter Freitext wird
  im Analyseexport bis zur manuellen Prüfung separiert.

## Pseudonymisierung und Recontact

Die Forschungs-ID wird serverseitig zufällig erzeugt und enthält keine Initialen, Matrikelnummer
oder Zeitstempel. Sie wird Teilnehmenden nicht angezeigt. Der Löschcode wird unabhängig im Browser
erzeugt; nur sein SHA-256-Hash wird gespeichert. Rohcode und Hash werden nicht exportiert.

Bei optionaler Follow-up-Einwilligung enthält `recontact.sqlite` ausschließlich die für den
Versand notwendige Kontaktzuordnung. Der Schedule-Export kann E-Mail, Token-Link und
Versandzeitpunkte für den getrennten Versand bereitstellen. Die Training Runtime zeigt und
speichert keine Follow-up-Frage. Eine spätere Zusammenführung externer Follow-up-Antworten mit der
Forschungs-ID benötigt einen eigenen dokumentierten Importprozess; E-Mail und Roh-Token dürfen
nicht in den Forschungsdatensatz gelangen.

## Timing

- Artefaktbeginn und -ende werden über serverseitig idempotente Boundary Events erfasst.
- Die zentrale Dauer ist Wall-Clock-Zeit; sie wird nicht als ununterbrochene aktive Beschäftigung
  interpretiert.
- Reloads, technische Fehler und längere Unsichtbarkeit werden über vorab festgelegte technische
  Regeln markiert.
- Segmentzeiten des Prototyps sind nur interne Diagnostik, weil sie für das Referenzartefakt nicht
  äquivalent vorliegen.

## Export

Audit- und Analyseexport schließen Session-ID, E-Mail, Löschcode, Token, Trainingsinputs und
Passwortdiagnosen aus. Das Data Dictionary enthält nur die Instrumente der Hauptsitzung. Die
Sessiondatei darf weiterhin `followUpConsent` und `followUpVersion` enthalten, weil diese die
separate Recontact-Prozedur versionieren; sie bedeuten nicht, dass Follow-up-Fragen Teil des
Training-Bundles sind.

## Verbotene Datenflüsse

Unzulässig sind insbesondere:

- Persistenz realer oder fiktiver Passwortwerte, Passwortteile oder lokaler Findings;
- Logging von Request-Bodies, Eingabewerten, IP-Adressen oder User-Agents;
- Aufnahme von E-Mail oder Roh-Token in Forschungsantworten oder Exporte;
- clientseitige Wahl von Bedingung oder Guardrail-Form;
- Auslieferung von Scoring-Rubriken an den Teilnehmerclient;
- Bündelung der Follow-up-Fragen mit Training oder Hauptfragebogen.

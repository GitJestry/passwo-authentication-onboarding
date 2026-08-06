# Data Contract

## Datenklassen

| Klasse | Beispiele | Persistenz |
|---|---|---|
| Study identity | interne Session-UUID, zufällige nicht angezeigte Forschungs-/Studien-ID | `study.sqlite` |
| Deletion lookup | ausschließlich SHA-256-Hash des flüchtigen Löschcodes | `study.sqlite` |
| Assignment | Bedingung, Zuweisungsmodus, Guardrail-Form `F1` bis `F6` | `study.sqlite` |
| Versioning | Study-, Content-, Fragebogen-, Guardrail-, Consent-, Follow-up- und Referenzversion | `study.sqlite` |
| Timing | Phase, Abschnitt/Segment, Start/Ende, Dauer, technische Reason Codes | `study.sqlite` |
| Main-session instruments | Pre, Post, Guardrail, Post-Guardrail-Self-Efficacy, retrospektive SecAware-Frage | `study.sqlite` |
| Presentation | Form-ID und tatsächlich angezeigte Guardrail-Option-IDs | `study.sqlite` |
| Completion | completed, incomplete-reload, technische Fehlerzustände | `study.sqlite` |
| Follow-up linkage | optionale Einwilligung, Follow-up-Version, Token-Hash | `study.sqlite` |
| Recontact | E-Mail, Raw Token, Token-Hash, Consent-Version, geplante Einladungs-/Erinnerungs-/Schließzeitpunkte | ausschließlich `recontact.sqlite` |
| Externes Follow-up | getrennt ausgelieferte Antworten, später nur über zufällige Studien-ID pseudonym verknüpfbar | außerhalb der Haupt-Runtime |
| Ephemeral participant data | Anzeigename, roher Löschcode | ausschließlich flüchtiger Rendererzustand |
| Training input/diagnosis | fiktive Passwörter, Loginversuche, Findings, Ähnlichkeit | nie persistieren oder senden |
| Sensitive real-world data | reale Konten, Passwörter, Tokens, Wiederherstellungscodes, Vorfälle | nie erheben |
| Passive metadata | IP, User-Agent, Request-Bodies | nicht persistieren oder loggen |

## Forschungsdatenbank

`study.sqlite` enthält:

- `study_sessions` für Session-UUID, Forschungs-ID, Löschcode-Hash, Zuweisung, Versionen,
  optionale Follow-up-Einwilligung und Abschlussstatus;
- `assignment_slots` und `guardrail_form_slots` für getrennte serverseitige Blockzuweisungen;
- `timing_events` für idempotente Timingwrites;
- `artifact_leases` nur für operative Reload-Erkennung;
- `instrument_submissions` für atomare Blockabgaben und Payload-Fingerprints;
- `responses` für validierte Antworten der Hauptsitzung;
- `response_presentations` für tatsächlich dargestellte Guardrail-Optionen.

E-Mail, Raw Token und Recontact-Request-ID sind in `study.sqlite` verboten. `artifact_leases` sind
keine Forschungsdaten und werden nicht exportiert.

## Getrenntes Kontaktregister

`recontact.sqlite` wird nur angelegt beziehungsweise befüllt, wenn die Person die optionale
Nachbefragung auswählt und eine gültige E-Mail-Adresse angibt. Es enthält ausschließlich die für
den Kontaktprozess erforderliche Zuordnung. Eine Person kann ohne E-Mail-Adresse vollständig an
der Hauptstudie teilnehmen.

Die Hauptdatenbank speichert nur den Token-Hash. Antworten aus Haupt- und Nachbefragung dürfen nur
über die zufällige Studien-ID pseudonym zusammengeführt werden; die E-Mail-Adresse darf nie in den
Forschungsdatensatz oder Analyseexport gelangen.

Die E-Mail-Adresse ist nach Abschluss der Follow-up-Phase und dem letzten vorgesehenen Versand zu
löschen. Der aktuelle manuelle Schedule-Export bestätigt keinen letzten erfolgreichen Versand.
Automatische Löschung ist deshalb noch nicht implementiert; vor der Hauptstudie ist ein
kontrollierter manueller Löschprozess oder eine zuverlässig quittierte Versand-/Löschlogik
verbindlich festzulegen.

## Kanonische Instrumentquellen

- `research/derived/instruments-v1.yaml`: Forschungs- und Analysespezifikation;
- `research/derived/instruments-v1.runtime.json`: geprüfte Teilnehmer-Runtime;
- `packages/contracts/src/generated/instruments-v1.runtime.json`: identische eingebundene Kopie;
- `research/derived/follow-up-v6.yaml`: getrenntes Follow-up-Instrument und Nachrichten.

Die Haupt-Runtime enthält nur `pre-v1`, `post-v1` und `guardrail-v2`. Es gibt keinen
`post-open-v1`-Block und keinen offenen Kommentar. Follow-up-Fragen werden nicht in das
Hauptstudien-Bundle importiert.

## Hauptstudienblöcke

```text
Pre sample
→ Pre experience
→ Artefakt
→ PANAS
→ perceived duration / duration fit
→ UEQ-S
→ UEQ+ Trustworthiness of Content
→ design diagnostics
→ risk proportionality / perceived understanding
→ Guardrail scenarios
→ Guardrail recognition
→ post-guardrail self-efficacy
→ retrospective SecAware exposure
→ common debriefing
→ completion
```

Der Client sendet jeweils einen vollständigen Block mit `instrumentId`, `sectionId` und der exakt
erwarteten Itemmenge. Der Server validiert IDs, Typen, Wertebereiche, Pflichtfelder,
Mehrfachauswahl-Exklusivität und Guardrail-Präsentation anhand der versionierten Runtime.

Die erste gültige Submission wird transaktional gespeichert. Identische Wiederholung ist
idempotent; ein abweichender zweiter Payload erzeugt einen Konflikt und überschreibt keine Daten.
Klassifikationen und Scoring-Rubriken werden nicht an den Client ausgeliefert oder mit Antworten
gespeichert.

## Guardrail-Formen

Die Formen `F1` bis `F6` werden innerhalb jeder Bedingung in kleinen zufällig permutierten
Sechserblöcken serverseitig zugewiesen. Form und tatsächliche Optionreihenfolge werden vor der
Antwort persistiert und bleiben stabil. Der Client kann weder Condition noch Form bestimmen.

## Pseudonymisierung, Anonymisierung und Löschung

Solange Haupt- und Follow-up-Antworten über die zufällige Studien-ID zugeordnet werden können,
sind die Forschungsdaten pseudonymisiert, nicht anonym. Der Zeitpunkt der tatsächlichen,
unumkehrbaren Anonymisierung ist vor Beginn der Hauptstudie festzulegen und derzeit offen. Bis
dahin kann eine Person unter Angabe des Löschcodes die zuordenbaren Daten löschen lassen. Nach
der Anonymisierung ist eine individuelle Zuordnung und Löschung nicht mehr möglich.

Der rohe Löschcode wird clientseitig erzeugt und nicht gespeichert; in `study.sqlite` liegt nur
sein SHA-256-Hash. Die zufällige Forschungs-ID wird der Person nicht angezeigt.

Die aufzubewahrenden Forschungsdaten werden geschützt in Sciebo gespeichert und nach zehn Jahren
endgültig gelöscht. Vor Anonymisierung sind sie als pseudonymisierte Forschungsdaten zu
bezeichnen; nach nachweislich irreversibler Anonymisierung nur noch als anonymisierte Daten.

## Timing

- zentrale Artefaktdauer: Wall-Clock zwischen vorab definiertem Start- und Endereignis;
- nicht als ununterbrochene aktive Beschäftigung interpretieren;
- Reloads, technische Fehler und längere Unsichtbarkeit nach vorab festgelegten Regeln markieren;
- Prototype-Segmentzeiten nur intern diagnostisch verwenden.

Für die Referenzbedingung endet der gemessene administrierte Instruktionspfad unmittelbar vor dem
ausgelassenen terminalen Knowledge Quiz.

## Export

Audit- und Analyseexporte schließen Session-ID, E-Mail, Löschcode, Raw Token, Trainingsinputs und
Passwortdiagnosen aus. Der Analyseexport enthält nur erlaubte pseudonymisierte Forschungsfelder
und die tatsächlich präsentierten Guardrail-Reihenfolgen. Follow-up-Einwilligung und
Follow-up-Version dürfen als Verfahrensvariablen enthalten sein; sie machen die E-Mail-Adresse
nicht zu einem Forschungsfeld.

## Verbotene Datenflüsse

Unzulässig sind insbesondere:

- Persistenz oder Übertragung realer oder fiktiver Passwortwerte, Passwortteile oder Findings;
- Logging von Request-Bodies, Eingabewerten, IP-Adressen oder User-Agents;
- E-Mail oder Raw Token in Forschungsantworten oder Exporten;
- clientseitige Condition- oder Guardrail-Form-Wahl;
- Auslieferung von Scoring-/Klassifikationsrubriken an Teilnehmende;
- Bündelung der Follow-up-Fragen mit Training oder Hauptfragebogen;
- Bezeichnung pseudonym verknüpfbarer Daten als anonym.

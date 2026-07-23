# Study Runtime

## Zweck

Die Study Runtime umschließt beide Artefaktbedingungen mit demselben neutralen Studienablauf.
Sie ist methodisch getrennt von der Training Runtime und kennt keine fiktiven Passwortwerte.

## Verbindlicher Ablauf

```text
Consent
→ Session serverseitig anlegen und Condition verdeckt zuweisen
→ Pre-Fragebogen
→ flüchtigen Anzeigenamen erfassen
→ supportive oder reference Artefakt
→ Anzeigenamen löschen
→ Post-Fragebogen
→ Understanding Guardrails
→ Debrief
→ Completion
```

Ein Forschungsdatenfehler blockiert den nächsten Übergang. Ein UI- oder Animationsfehler im
supportive Artefakt darf dagegen auf den fachlichen Endzustand springen, ohne die Sitzung still
als erfolgreich zu markieren.

## Zustandsgrenzen

- `displayName` existiert ausschließlich im Browserkontext und wird nie an die API gesendet.
- Fiktive Passwörter und deren Analysen existieren nur in der Training Runtime im Arbeitsspeicher.
- Condition, pseudonymer Code, Versionen, Antworten, Timing und Abschlussstatus liegen serverseitig.
- Reload während eines Artefakts verwirft temporären Zustand und führt zu einem dokumentierten
  unvollständigen technischen Status.

## Researcher-Konfiguration

Die Hauptstudie nutzt `permuted-block`. `forced-supportive` und `forced-reference` sind nur für
Pretests zulässig. Der Client enthält keinen Condition-Auswahlschalter.

## Abschlusskriterium

Eine Sitzung gilt erst nach bestätigtem Debrief als abgeschlossen. Zertifikate oder Scores des
externen Referenzartefakts sind keine Studienoutcomes.

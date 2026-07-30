# Study Runtime

## Verbindlicher Hauptablauf

```text
Eligibility + Consent einschließlich Nachbefragung
→ Session serverseitig anlegen und Condition verdeckt zuweisen
→ Recontact-E-Mail verpflichtend getrennt registrieren
→ Pre-Fragebogen
→ supportive oder reference Artefakt
→ Post-Fragebogen
→ Guardrail Recognition
→ Guardrail Szenarien
→ optionale offene Rückmeldung
→ korrektives Debrief
→ Completion
```

Eligibility wird lokal geprüft und nicht persistiert. Die allgemeine Einwilligung umfasst die
Nachbefragung; eine separate Recontact-Entscheidung gibt es nicht. E-Mail darf nie in Browser
Storage oder in die Forschungsdatenbank gelangen und bleibt nur bis zum Abschluss des getrennten
Registrierungsschritts im flüchtigen Rendererzustand.

Wenn die Recontact-Registrierung fehlschlägt, bleibt die Hauptstudie bis zu einem erfolgreichen
Retry gesperrt. Es gibt keinen Pfad in den Pre-Fragebogen oder zur Bedingung ohne Registrierung.
Widerruf oder Abbruch beenden die Teilnahme entsprechend der Teilnahmeinformation. Die Condition
wird bei einem Retry nicht neu zugewiesen.

## Instrumentreihenfolge

- Pre muss vollständig gespeichert sein, bevor das Artefakt startet.
- Post muss vollständig gespeichert sein, bevor der Guardrail beginnt.
- Recognition wird vor Szenarien abgegeben und gesperrt.
- Szenarien müssen gespeichert sein, bevor offene Rückmeldung und Debrief folgen.
- `post-open-v1` wird immer submitted; leere optionale Felder sind `null`.
- Completion erfordert Debrief und alle verpflichtenden Instrumentblöcke.

Ein Forschungsdatenfehler blockiert den Übergang und erlaubt idempotenten Retry mit demselben
Payload. Antworten bleiben bis zur bestätigten Speicherung nur flüchtig.

## Antwortformat-Rendering

Die Runtime wählt das Antwortformat ausschließlich aus der versionierten Instrumentdefinition:
UEQ-S-Semantikdifferential, Zustimmung 1--7, Konfidenz 0--10, Vertrautheit 1--5,
Emotionsintensität 1--5 und bipolare Dauerangemessenheit 1--7 sind explizite Varianten.
Numerische Minuten, Single Choice und Multi Choice bleiben davon getrennte Typen. Skalen verwenden
native Radios in `fieldset`/`legend`, Mehrfachauswahl native Checkboxen. Kein Wert wird
vorselektiert.

## Follow-up-Boundary

Die lokale Runtime versendet keine E-Mails und hostet keinen öffentlichen Follow-up-Fragebogen.
Nach Completion werden in der getrennten Registry Einladung, Erinnerung und Schließung geplant.
Ein expliziter Schedule-Export unterstützt manuellen oder institutionellen Mail-Merge. Öffentliches
Formular und späterer Import sind eine getrennte Entscheidung vor dem Study Freeze.

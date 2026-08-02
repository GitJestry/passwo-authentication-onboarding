# Study Runtime

## Zweck

Die Study Runtime umschließt beide Artefaktbedingungen mit demselben neutralen Studienablauf. Sie
ist methodisch von der Training Runtime getrennt und kennt keine fiktiven Passwortwerte.

## Verbindlicher Hauptablauf

```text
Eligibility lokal prüfen
→ gemeinsame Teilnahmeinformation und Einwilligung
→ optionale Follow-up-Entscheidung
→ Löschcode lokal erzeugen, Session serverseitig anlegen, Condition verdeckt zuweisen und Löschcode anzeigen
→ bei Einwilligung Recontact-E-Mail getrennt registrieren
→ Pre-Fragebogen blockweise speichern
→ nur supportive: flüchtigen Anzeigenamen erfassen
→ supportive oder reference Artefakt
→ Post-Fragebogen
→ Guardrail Recognition
→ Guardrail Szenarien
→ optionale offene Rückmeldung als verpflichtende Submission
→ Session Closure
→ Completion
```

Eligibility wird nicht persistiert. Die optionale Nachbefragung darf die Hauptstudie nicht
blockieren. Schlägt ihre Registrierung fehl, kann sie mit demselben Request erneut versucht oder
aufgegeben werden; die Condition wird dabei nicht neu zugewiesen.

## Instrument- und Abschlussreihenfolge

- Pre muss vollständig gespeichert sein, bevor das Artefakt startet.
- Post läuft in der eingefrorenen Reihenfolge Zeit → UEQ-S → Design-Diagnostik → Glaubwürdigkeit/Verständnis → Self-Efficacy und muss vollständig gespeichert sein, bevor der Guardrail beginnt.
- Recognition wird vor den Szenarien abgegeben und gesperrt.
- Szenarien müssen gespeichert sein, bevor offene Rückmeldung und Session Closure folgen.
- `post-open-v1` wird immer submitted; leere optionale Felder sind `null`.
- Ein Forschungsdatenfehler blockiert den Übergang und erlaubt idempotenten Retry.

Teilnehmende ohne Follow-up-Einwilligung erhalten bei der Session Closure die vollständige
Aufklärung. Teilnehmende mit Einwilligung erhalten zunächst die neutrale Bestätigung der
Hauptsitzung; ihre vollständige Aufklärung erfolgt nach der Follow-up-Antwort oder spätestens nach
Schließung des Zeitfensters. Versand und externer Follow-up-Import sind noch vor dem Study Freeze
festzulegen.

## Teilnahmeinformation und Löschcode

Die Kerninformation ist vor der Einwilligung direkt sichtbar; ausführliche Abschnitte bleiben aufklappbar. Nach Sessionerstellung wird der Löschcode vor dem ersten Pre-Abschnitt angezeigt. Er steht dort neben einem kompakten Zugang zu den Teilnahmeinformationen und wird am Sitzungsende erneut gezeigt. Die Teilnahmeinformationen bleiben über eine unaufdringliche Kontrolle auch während des Artefakts erreichbar und können gedruckt werden. Die Kontrolle zeigt weder Forschungs-ID noch Condition, Antworten oder Timingdaten.

Eligibility-Fehler werden erst nach einem Abgabeversuch angezeigt. Das bloße Bearbeiten der drei Bestätigungen löst keine vorzeitige Ausschlussmeldung aus.

## Zustandsgrenzen

- `displayName` existiert ausschließlich flüchtig in der supportive Bedingung.
- Fiktive Passwörter und Analysen bleiben im Arbeitsspeicher der Training Runtime.
- Condition, Forschungs-ID, Löschcode-Hash, Versionen, Antworten, Timing und Abschlussstatus liegen serverseitig; der rohe Löschcode bleibt flüchtig im Renderer.
- Reload während eines Artefakts verwirft temporären Zustand und markiert den Durchlauf
  unvollständig.
- Browser Storage, IndexedDB und Service Worker sind unzulässig.

## Researcher-Konfiguration

Die Hauptstudie nutzt `permuted-block`. `forced-supportive` und `forced-reference` sind nur für
Pretests zulässig. Der Client enthält keinen Condition-Auswahlschalter.

## Follow-up-Boundary

Die lokale Runtime versendet keine E-Mails und hostet keinen öffentlichen Fragebogen. Nach
Completion werden nur für eingewilligte Sessions Einladung nach 240 Stunden, höchstens eine
Erinnerung nach weiteren 48 Stunden und Schließung nach 336 Stunden geplant. Schedule-Export,
öffentliches Formular, Import und abschließender Debrief-Versand bleiben getrennte Funktionen.

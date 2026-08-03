# Study Runtime

## Zweck

Die Study Runtime umschließt beide Artefaktbedingungen mit demselben neutralen Studienablauf. Sie
ist methodisch von der Training Runtime getrennt und kennt keine fiktiven Passwortwerte.

## Verbindlicher Hauptablauf

```text
Eligibility lokal prüfen
→ gemeinsame Teilnahmeinformation und Einwilligung
→ verpflichtende Kontaktbestätigung und validierte E-Mail-Adresse
→ Löschcode lokal erzeugen; Session, verdeckte Condition-Zuweisung und getrennte
  Recontact-Registrierung atomar anlegen; Löschcode anzeigen
→ Pre-Fragebogen blockweise speichern
→ nur supportive: flüchtigen Anzeigenamen erfassen
→ supportive oder reference Artefakt
→ Post-Fragebogen
→ Guardrail Szenarien
→ Guardrail Recognition
→ optionale offene Rückmeldung als verpflichtende Submission
→ Session Closure
→ Completion
```

Eligibility wird nicht persistiert. Ohne gültige E-Mail-Adresse und beide Bestätigungen wird keine
Sitzung angelegt. Session, Condition-Slot und Recontact-Registrierung bilden einen atomaren
Vorgang. Ein identischer Retry ist idempotent; ein Fehler hinterlässt weder Sitzung, zugewiesenen
Slot noch Kontaktdatensatz. Einen Abandon- oder „ohne zweiten Teil fortfahren“-Pfad gibt es nicht.

## Instrument- und Abschlussreihenfolge

- Pre muss vollständig gespeichert sein, bevor das Artefakt startet.
- Post läuft in der eingefrorenen Reihenfolge Zeit → UEQ-S → Design-Diagnostik → Glaubwürdigkeit/Verständnis → Self-Efficacy und muss vollständig gespeichert sein, bevor der Guardrail beginnt.
- Recognition wird vor den Szenarien abgegeben und gesperrt.
- Szenarien müssen gespeichert sein, bevor offene Rückmeldung und Session Closure folgen.
- `post-open-v1` wird immer submitted; leere optionale Felder sind `null`.
- Ein Forschungsdatenfehler blockiert den Übergang und erlaubt idempotenten Retry.

Alle regulär Eingeschlossenen erhalten nach der Hauptsitzung nur die neutrale Bestätigung des
ersten Studienteils. Die vollständige Aufklärung folgt direkt nach Abgabe des zweiten Teils und
zusätzlich per E-Mail an alle Eingeschlossenen bei Schließung des Antwortfensters. Öffentliches
Follow-up-Formular, Antwortimport und der operative abschließende Debrief-Versand sind noch vor dem
Study Freeze umzusetzen und zu erproben.

## Teilnahmeinformation und Löschcode

Die vollständige Teilnahmeinformation wird vor der Einwilligung physisch ausgehändigt. Die
Kerninformation ist zusätzlich direkt in der Runtime sichtbar; ausführliche Abschnitte bleiben
aufklappbar. Nach Sessionerstellung wird der Löschcode vor dem ersten Pre-Abschnitt angezeigt. Er
steht dort neben einem kompakten Zugang zu den Teilnahmeinformationen und wird am Sitzungsende
erneut gezeigt. Die Teilnahmeinformationen bleiben über eine unaufdringliche Kontrolle auch
während des Artefakts erreichbar. Eine app-eigene Druckfunktion ist nicht vorgesehen; die Person
kann den Löschcode notieren. Die Kontrolle zeigt weder Forschungs-ID noch Condition, Antworten
oder Timingdaten.

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
Completion werden für alle neuen 2.1-Sessions Einladung nach 240 Stunden, höchstens eine
Erinnerung nach weiteren 48 Stunden und Schließung nach 336 Stunden geplant. Der Schedule-Export
wird ausschließlich auf ausdrücklichen Aufruf erzeugt. Einladung, gegebenenfalls Erinnerung und
Debriefing werden einzeln und manuell über das freigegebene Universitätskonto versandt; Empfänger
dürfen einander nicht sehen. Die Nachricht enthält nur den neutralen Einladungstext und den
individuellen Tokenlink, niemals Condition, Forschungs-ID, Antworten oder Löschcode. Recontact-Daten
dienen keiner Analyse oder Stichprobenbeschreibung. Der Forschungsstichtag bleibt exakt
`completedAt + 240h`, unabhängig von späterer Abgabe oder Erinnerung. Öffentliches Formular,
Antwortimport und manueller Debrief-Versand bleiben vom lokalen Runtime-Prozess getrennt.

## Lokale Datenlöschung

Die Runtime stellt keine Teilnehmeroberfläche und keine HTTP-Route für Löschungen bereit. Ein
lokaler, explizit bestätigter CLI-Workflow kann ausschließlich über den Löschcode eine Session und
ihre abhängigen Daten auflösen; sein Standardmodus bleibt ein schreibgeschützter Dry-Run.

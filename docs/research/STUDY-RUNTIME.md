# Study Runtime

## Zweck und Architektur

Die Study Runtime umschließt beide Artefaktbedingungen mit demselben Studienablauf. Sie ist als
eigene XState-Maschine von der Training Runtime getrennt und kennt keine fiktiven Passwortwerte.
React rendert den Statechartzustand; Zuweisung, Persistenz und Timing liegen im lokalen
Fastify-/SQLite-Server.

## Verbindlicher Ablauf

```text
Eligibility lokal prüfen
→ gemeinsame Teilnahmeinformation
→ erforderliche Hauptstudien-Einwilligung
→ optional: Nachbefragung auswählen und E-Mail-Adresse angeben
→ Löschcode lokal erzeugen
→ Session serverseitig anlegen; Condition und Guardrail-Form verdeckt zuweisen
→ nur bei Opt-in: E-Mail getrennt registrieren
→ Pre sample
→ Pre experience
→ zugewiesenes Artefakt
→ PANAS
→ Zeiturteile
→ UEQ-S
→ UEQ+ Inhaltsseriosität
→ Design-Diagnostik
→ Risikoproportionalität und wahrgenommenes Verständnis
→ Guardrail-Szenarien
→ Guardrail-Recognition
→ Post-Guardrail-Self-Efficacy
→ retrospektive SecAware-Vorerfahrung
→ gemeinsames Debriefing
→ Completion
```

Eligibility wird nicht persistiert. Die E-Mail-Adresse ist keine Voraussetzung. Bei fehlender oder
fehlgeschlagener Recontact-Registrierung kann die Hauptstudie ohne Nachbefragung fortgesetzt
werden; der Server entfernt dann jede angefangene Kontaktregistrierung und setzt die
Follow-up-Einwilligung zurück.

## Instrumentreihenfolge und Writes

Jeder Fragebogenabschnitt wird als atomare, idempotente Submission gespeichert. Ein
Forschungsdatenfehler blockiert den Übergang und erlaubt denselben Retry. Pre muss vollständig
vor dem Artefakt vorliegen. Die ersten sechs Post-Abschnitte müssen vor den Guardrail-Szenarien
gespeichert sein. Recognition folgt erst nach allen Szenarien. Self-Efficacy und die retrospektive
SecAware-Frage folgen nach dem no-feedback Guardrail. Erst danach wird das gemeinsame Debriefing
angezeigt.

Es gibt keinen offenen Post-Kommentar und kein condition-spezifisches terminales Knowledge Quiz
vor dem gemeinsamen Guardrail. Instruktive Fragen innerhalb der Lernpfade bleiben Bestandteil des
jeweiligen Artefakts.

## Referenzpfad

Der lokale deterministische SecAware-V9-Build wird bis unmittelbar vor das terminale Knowledge
Quiz administriert. Das Quiz und dessen Lösungshinweise werden ausgelassen; der Referenz-
Completion-Event liegt an dieser Grenze. Diese Adaptation ist im Artefaktmanifest und
Shared-Content-Audit dokumentiert.

## Teilnahmeinformationen und Löschcode

Die wesentlichen Informationen und die ausführliche Fassung sind vor Einwilligung sichtbar. Nach
Sessionerstellung wird der Löschcode angezeigt und bleibt über eine kompakte
`Teilnahmeinformationen`-Kontrolle während Fragebogen und Artefakt erreichbar. Die Kontrolle zeigt
keine Forschungs-ID, Condition, Antworten oder Timingdaten.

## Zustands- und Datenschutzgrenzen

- Anzeigename und Trainingsinputs bleiben flüchtig;
- Browser Storage, IndexedDB und Service Worker sind unzulässig;
- Session, Zuweisung, Versionen, Antworten, Timing und Abschluss liegen serverseitig;
- E-Mail und Raw Token liegen ausschließlich in `recontact.sqlite`;
- Reload während des Artefakts verwirft temporären Trainingszustand und markiert die Session
  unvollständig;
- Server bindet standardmäßig nur an `127.0.0.1` und loggt keine Request-Bodies oder passive
  Metadaten.

## Follow-up-Boundary

Nach Opt-in und Completion werden erste Einladung nach 240 Stunden, höchstens eine Erinnerung nach
weiteren 48 Stunden und Schließung nach 336 Stunden geplant. Die lokale Runtime versendet keine
E-Mails und hostet keinen öffentlichen Follow-up-Fragebogen. Der Schedule-Export enthält nur
Kontaktadresse, Tokenlink und die drei Zeitpunkte, niemals Condition, Forschungs-ID, Antworten
oder Löschcode.

Ein automatischer Löschlauf für E-Mail-Adressen ist noch nicht zulässig, weil der aktuelle manuelle
Versand keinen letzten erfolgreichen Versand zuverlässig quittiert. Vor der Hauptstudie ist ein
kontrollierter Löschprozess festzulegen.

## Researcher-Konfiguration

Die Hauptstudie nutzt `permuted-block`. `forced-supportive` und `forced-reference` sind nur für
Cognitive Pretest und End-to-End-Pilot zulässig. Der Client besitzt keinen Condition-Schalter.

## Pilot- und Freeze-Grenze

Cognitive-Pretest- und End-to-End-Pilotpersonen werden nicht in die Hauptstudie aufgenommen;
Pilotdaten werden nicht mit Hauptstudiendaten kombiniert. Nach dokumentierter Pilotierung,
zweiter Inhaltsprüfung und Festlegung der offenen Datenschutzpunkte werden Manifest,
Formularmatrix, Audit, Implementierung und Analysecode als Hauptstudienversion eingefroren.

## Lokale Datenlöschung

Eine explizite CLI kann über den Löschcode eine pseudonymisierte Session und alle abhängigen
Datensätze in Forschungs- und Kontaktregister auflösen. Standard ist Dry-Run; Schreiben erfordert
`--confirm`. Exporte und Backups werden nicht automatisch verändert und müssen im Betriebsprozess
separat berücksichtigt werden.

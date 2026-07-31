# ADR 0011 — Getrennte Recontact-Registry für das verzögerte Follow-up

- **Status:** Accepted
- **Datum:** 2026-07-30
- **Citation label:** `ADR 0011-Follow-up-Recontact`
- **Ergänzt:** ADR 0002, ADR 0005 und ADR 0009

## Kontext

Die Studie ergänzt die unmittelbaren Instrumente um eine optionale angekündigte Nachbefragung zehn
Tage nach der Hauptsitzung. Die Hauptstudie erfordert keine E-Mail-Adresse. Die lokale
Electron/Fastify/SQLite-Runtime und ihr Forschungsdatenexport dürfen keine direkt identifizierenden
Kontaktdaten enthalten.
Zugleich soll die Runtime weder SMTP-/Cloud-Credentials aufnehmen noch als öffentlicher
Survey-Server betrieben werden.

## Entscheidung

Die Einwilligung in die Hauptstudie ist verpflichtend. Die Einwilligung in die Nachbefragung ist
davon getrennt und optional. Eine Ablehnung verhindert weder die Sessionerstellung noch den
Pre-Fragebogen oder den Abschluss der Hauptstudie. Die Session wird zuerst mit verdeckter,
serverseitiger Condition-Zuweisung erstellt. Nur bei erteilter Nachbefragungseinwilligung wird
anschließend die E-Mail-Adresse in der getrennten Recontact-Registry registriert. Die
Follow-up-Entscheidung beeinflusst die Condition-Zuweisung nicht.

`study.sqlite` speichert nur:

- Follow-up-Einwilligungsstatus;
- Follow-up-Instrumentversion;
- optional den Hash eines kryptographisch zufälligen Follow-up-Tokens.

`~/.passwo-study/recontact.sqlite` speichert nur:

- Token-Hash und zu versendenden Roh-Token;
- E-Mail-Adresse;
- Recontact-Consent-Version;
- Registrierung, Einladung, Erinnerung, Schließung und Versandstatus.

Die Registry enthält keine Bedingung, Antworten, Timings, Trainingsinputs oder PassWo-Diagnosen.
Der normale Forschungsdatenexport liest sie nie. Er enthält außerdem weder E-Mail-Adresse noch
Roh-Token noch Token-Hash.

Nach erfolgreicher Session-Completion werden erste Einladung auf `completedAt + 240h`, optionale
Erinnerung auf `firstInvitation + 48h` und Schließung auf `completedAt + 336h` gesetzt. Ein eigener
expliziter Schedule-Export erzeugt eine lokal geschützte Datei für manuellen oder institutionellen
Mail-Merge. Die lokale Runtime versendet keine E-Mails, enthält keine Gmail-/SMTP-Credentials und
hostet keinen öffentlichen Follow-up-Endpunkt.

Ein späteres externes Follow-up-Formular erhält den Roh-Token im individuellen Link. Beim Import
wird er gehasht und der pseudonymen Session zugeordnet. Roh-Token und E-Mail werden nie nach
`study.sqlite` oder in den Forschungsdatenexport kopiert.

## Konsequenzen

- Registrierung, Schedule-Export und späterer Antwortimport bleiben getrennte Funktionen.
- Ein Registrierungsfehler erlaubt Retry oder den Verzicht auf die Nachbefragung. Beim Verzicht
  werden Einwilligungsstatus und Token-Hash in `study.sqlite` zurückgesetzt und ein eventuell
  teilweise angelegter Registry-Datensatz gelöscht. Session, Teilnehmercode, Condition und
  Forschungsantworten bleiben unverändert.
- Die Recontact-Registry wird noch nicht automatisch gelöscht. Erst der spätere
  Follow-up-Import-/Debrief-Workflow kann sicher feststellen, dass eine Follow-up-Antwort importiert
  und das abschließende Debriefing versandt wurde; dort ist die anschließende Löschung zu
  implementieren.
- Öffentliche Survey-Infrastruktur und tatsächlicher Mailversand bleiben separat vor dem Study
  Freeze festzulegen.
- Änderungen an Tokenformat, Zeitfenstern oder Registry-Feldern benötigen eine ADR-Revision.

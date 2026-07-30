# ADR 0011 — Getrennte Recontact-Registry für das verzögerte Follow-up

- **Status:** Accepted
- **Datum:** 2026-07-30
- **Citation label:** `ADR 0011-Follow-up-Recontact`
- **Ergänzt:** ADR 0002, ADR 0005 und ADR 0009

## Kontext

Die Studie ergänzt die unmittelbaren Instrumente um eine angekündigte Nachbefragung zehn Tage nach
der Hauptsitzung. Sie ist Bestandteil der Studienteilnahme und erfordert eine E-Mail-Adresse. Die
lokale Electron/Fastify/SQLite-
Runtime und ihr Forschungsdatenexport dürfen keine direkt identifizierenden Kontaktdaten enthalten.
Zugleich soll die Runtime weder SMTP-/Cloud-Credentials aufnehmen noch als öffentlicher
Survey-Server betrieben werden.

## Entscheidung

Die allgemeine Einwilligung umfasst die Nachbefragung. Im Consent-Schritt wird deshalb keine
separate Recontact-Entscheidung getroffen. Vor dem Pre-Fragebogen wird nach Sessionerstellung die
E-Mail-Adresse zwingend in der getrennten Recontact-Registry registriert.

`study.sqlite` speichert nur:

- Hash eines kryptographisch zufälligen Follow-up-Tokens;
- Follow-up-Instrumentversion.

`~/.passwo-study/recontact.sqlite` speichert nur:

- Token-Hash und zu versendenden Roh-Token;
- E-Mail-Adresse;
- Recontact-Consent-Version;
- Registrierung, Einladung, Erinnerung, Schließung und Versandstatus.

Die Registry enthält keine Bedingung, Antworten, Timings, Trainingsinputs oder PassWo-Diagnosen.
Der normale Forschungsdatenexport liest sie nie.

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
- Ein Registrierungsfehler erlaubt Retry, aber keinen Studienpfad ohne Nachbefragung und erzeugt
  keine neue Condition-Zuweisung. Widerruf oder Abbruch beenden die Teilnahme entsprechend der
  Teilnahmeinformation.
- Öffentliche Survey-Infrastruktur und tatsächlicher Mailversand bleiben separat vor dem Study
  Freeze festzulegen.
- Änderungen an Tokenformat, Zeitfenstern oder Registry-Feldern benötigen eine ADR-Revision.

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
- Öffentliches Follow-up-Formular, Antwortimport und der manuelle abschließende Debrief-Versand
  bleiben vor dem Study Freeze umzusetzen und zu erproben.
- Änderungen an Tokenformat, Zeitfenstern oder Registry-Feldern benötigen eine ADR-Revision.

## Revision 2026-08-03 — Manueller Recontact-Betrieb

Der Versandweg ist festgelegt: Die lokale Runtime automatisiert keine E-Mail. Die Studienleitung
erzeugt den geschützten Schedule-Export ausdrücklich, versendet Einladung, höchstens eine
Erinnerung und Debriefing einzeln über das freigegebene Universitätskonto und stellt sicher, dass
Empfänger einander nicht sehen. Nachrichten enthalten ausschließlich neutralen Text und den
individuellen Tokenlink, niemals Condition, Forschungs-ID, Antworten oder Löschcode.

`recontact.sqlite`, Schedule-Dateien und Mailkopien dienen ausschließlich Kontaktaufnahme,
Terminsteuerung, Tokenzuordnung und Debriefing. Sie sind keine Analysequelle und dürfen von
Analysewerkzeugen nicht geöffnet werden. Schedule-Datei, Postfachkopien und gegebenenfalls
Mailserver-Backups werden in die vor dem Study Freeze noch einzutragende Frist einbezogen. Nach
Follow-up-Antwort beziehungsweise Fensterschluss und Debriefing wird die Registry gemäß dieser
Frist entfernt. Die Software behauptet nicht, Postfach- oder Mailserverkopien automatisch gelöscht
zu haben. Diese Revision ändert weder Registry-Schema noch Tokenformat, Randomisierung oder Timing.

## Revision 2026-08-03 — Verbindliche Zwei-Teil-Studie 2.1

Für neue Instrument-2.1-Sitzungen ersetzt diese Revision die frühere optionale
Recontact-Entscheidung. Die heutige Hauptsitzung und der ein- bis zweiminütige zweite Studienteil
nach 240 Stunden werden vorab transparent als verbindliche Studienbestandteile beschrieben. Eine
gültige E-Mail-Adresse, allgemeine Einwilligung in beide Teile und gesonderte
Recontact-Bestätigung sind Voraussetzung der Sitzungserstellung.

Sessionerstellung, serverseitige Condition-/Form-Zuweisung und Recontact-Registrierung erfolgen in
einer gemeinsamen SQLite-Transaktion über die angehängte getrennte Datenbank. E-Mail und Roh-Token
bleiben ausschließlich in `recontact.sqlite`; `study.sqlite` erhält weiterhin nur Consent-Status,
Follow-up-Version und Token-Hash. Ein identischer Request ist idempotent. Bei einem Schreibfehler
werden Session, Condition-Slot, Form-Slot und Recontact-Datensatz gemeinsam zurückgerollt. Die
Register-/Abandon-Routen und der Pfad „ohne Nachbefragung fortfahren“ entfallen. Historische
Sessions bleiben unverändert lesbar; es werden keine neuen Persistenzfelder eingeführt.

Die Kommunikation heißt neutral „zweiter und letzter Studienteil“ und nennt vor Ablauf des
Messfensters weder Schutzhandlungen noch Vergleich oder Randomisierung. Der Forschungsstichtag
bleibt exakt `completedAt + 240h`; Einladung, Erinnerung und spätere Abgabe verändern ihn nicht.
Die vollständige Aufklärung erfolgt nach Abgabe und zusätzlich bei `closesAt` per E-Mail an alle
Eingeschlossenen. Der Schedule-Export leitet diesen Debrief-Zeitpunkt aus `closesAt` ab, ohne einen
neuen Status zu persistieren.

Die drei fokalen Follow-up-Handlungen bilden eine zentral-sekundäre Ergebnisfamilie
„selbstberichtete Schutzhandlungen innerhalb von zehn Tagen“. Sie bleiben getrennt; Nichtantwort
bleibt fehlend. Es werden weder objektive Kontobeobachtung, Vorher-Nachher-Verhaltensmessung,
dauerhafte Adoption noch ein kombinierter Behavior Score behauptet. Die freiwillige
Geheimhaltungsbitte mindert mögliche Kontamination, beseitigt sie aber nicht.

## Revision 2026-08-05 — Optionale Nachbefragung und Löschgrenze

Diese Revision ersetzt die Revision „Verbindliche Zwei-Teil-Studie 2.1“ für neue
`3.0.0-pilot`-Sitzungen. Die Hauptstudie kann ohne E-Mail-Adresse vollständig durchgeführt werden.
Die Nachbefragung wird durch eine gesonderte freiwillige Auswahl aktiviert. Die Session wird mit
`followUpConsent = false` oder `true` angelegt; nur bei `true` registriert der Client anschließend
die E-Mail-Adresse über die getrennte Recontact-Route. Ein Registrierungsfehler erlaubt Retry oder
das Fortsetzen ohne Nachbefragung. Condition- und Guardrail-Zuweisung bleiben unabhängig von der
Follow-up-Entscheidung.

Das gemeinsame Debriefing erfolgt nach allen unmittelbaren Messungen in der Hauptsitzung. Eine
verzögerte Debrief-Mail entfällt. Der Schedule-Export enthält nur E-Mail, individuellen Tokenlink,
Einladungs-, Erinnerungs- und Schließzeitpunkt.

Die E-Mail-Adresse ist unmittelbar nach Abschluss der Follow-up-Phase und dem letzten vorgesehenen
Versand zu löschen. Die bestehende lokale Runtime versendet Nachrichten nicht selbst und
protokolliert den letzten erfolgreichen Versand nicht zuverlässig. Deshalb wird in dieser Revision
keine scheinbar automatische Löschung implementiert. Vor der Hauptstudie ist entweder ein
kontrollierter manueller Löschprozess mit dokumentierter Bestätigung oder eine zuverlässig
quittierte Versand-/Löschlogik festzulegen. Diese Revision ändert keine Registry-Felder, Tokenformate,
Randomisierung oder Timingfenster.

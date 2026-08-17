# ADR 0011 — Getrennte Recontact-Registry für das verzögerte Follow-up

- **Status:** Accepted; Betriebsmodell durch ADR 0016 präzisiert
- **Datum:** 2026-07-30
- **Aktuelle Revision:** 2026-08-17
- **Citation label:** `ADR 0011-Follow-up-Recontact`
- **Ergänzt:** ADR 0002, ADR 0005 und ADR 0009
- **Zusammen lesen mit:** `ADR 0016-Web-Resume-Lifecycle`

## Kontext

Die freiwillige Nachbefragung findet ungefähr zehn Tage nach der Hauptsitzung statt. Dafür wird eine
E-Mail-Adresse benötigt, die nicht in Forschungsdatenbank oder Forschungsdatenexport gelangen darf.
Die Hauptstudie bleibt ohne E-Mail-Adresse vollständig durchführbar.

Frühere Revisionen dieser ADR sahen zeitweise eine verpflichtende Nachbefragung, eine externe
Umfrageplattform, einen manuellen Antwortimport und eine verzögerte Debrief-Mail vor. Diese Varianten
sind nicht mehr aktuell und werden nicht als offene Anforderungen weitergeführt.

## Entscheidung

### Freiwilligkeit und Zuordnung

Die Einwilligung in die Nachbefragung ist getrennt und optional. Sie beeinflusst weder
Condition-Zuweisung noch Guardrail-Form oder Abschluss der Hauptstudie.

`study.sqlite` speichert nur:

- Follow-up-Einwilligungsstatus;
- Follow-up-Instrumentversion;
- Hash des kryptographisch zufälligen Follow-up-Tokens;
- Follow-up-Antworten nach gültiger Tokenprüfung.

Die getrennte Recontact-Registry speichert nur:

- E-Mail-Adresse;
- zu versendenden Raw Token und dessen Hash;
- Recontact-Consent-Version;
- geplante beziehungsweise bestätigte Einladungs-, Erinnerungs- und Schließzeitpunkte.

Sie enthält keine Bedingung, Forschungsantworten, Timings, Trainingsinputs oder PassWo-Befunde. Der
Forschungsdatenexport liest sie nicht.

### Betrieb

Nach regulärer Hauptstudien-Completion werden geplant:

- Einladung bei `completedAt + 240h`;
- höchstens eine Erinnerung 48 Stunden nach der ersten Einladung;
- Fensterschluss bei `completedAt + 336h`.

Der Versand erfolgt kontrolliert und manuell über das Universitätskonto. Die Study Runtime enthält
keine SMTP-, Gmail- oder sonstigen Mail-Credentials. Die Empfänger sehen einander nicht; Nachrichten
enthalten nur neutralen Text und den individuellen Tokenlink.

Das Follow-up wird als getrennte tokenisierte Route derselben Study-Webanwendung betrieben. Der Raw
Token steht nur im individuellen Link und in der Recontact-Registry. Die API prüft seinen Hash und
ordnet die Antwort pseudonym der Hauptsitzung zu. Es gibt keine externe Umfrageplattform und keinen
manuellen Antwortimport. Tokenisierte URLs und Raw Tokens werden nicht in projektkontrollierten
Anwendungs- oder Access-Logs gespeichert; der Follow-up-Pfad lädt keine externen Ressourcen.

Das gemeinsame Debriefing erfolgt am Ende der Hauptsitzung. Eine verzögerte Debrief-Mail wird nicht
versendet.

### Kontaktlöschung

Spätestens sieben Kalendertage nach Schließung des letzten Follow-up-Fensters werden
Recontact-Registry, lokale Schedule-Dateien, versandte Einladungs- und Erinnerungsnachrichten im
projektkontrollierten Postfach sowie sonstige projektkontrollierte Kontaktkopien gelöscht.
Der kontrollierte manuelle Löschprozess ist das akzeptierte Betriebsmodell; eine automatische
Löschinfrastruktur ist nicht erforderlich.

Die Bestätigung enthält nur:

- Löschdatum;
- ausführende Person;
- Anzahl der Kontakte vor der Löschung;
- Anzahl der Kontakte nach der Löschung, regulär `0`.

Sie enthält keine E-Mail-Adresse und keinen Token. Gelöscht werden die regulär erreichbaren
Nachrichten und Ordner; eine Löschung providerseitiger Mailserver-Backups wird weder vorausgesetzt
noch behauptet.

## Konsequenzen

- Recontact-Registry und Forschungsdatenbank bleiben getrennt.
- Ein Registrierungsfehler erlaubt Retry oder das Fortsetzen ohne Nachbefragung.
- Follow-up-Token, E-Mail-Adresse und Löschcode werden nie miteinander in einem Export verbunden.
- Der Versand- und Löschablauf wird vor dem Hauptstudien-Versions-Freeze einmal vollständig
  durchgespielt und dokumentiert.
- Tokenformat, Timingfenster oder neue persistierte Kontaktfelder benötigen eine ADR-Revision.

Die historische Detailchronologie bleibt über die Git-Historie nachvollziehbar. Sie ist keine
zweite aktuelle Spezifikation neben dieser Fassung und ADR 0016.

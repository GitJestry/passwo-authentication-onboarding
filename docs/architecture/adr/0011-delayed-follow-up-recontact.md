# ADR 0011 — Getrennte Recontact-Registry

- **Status:** Accepted; Betrieb durch ADR 0016 präzisiert
- **Datum:** 2026-07-30
- **Citation label:** `ADR 0011-Follow-up-Recontact`

## Entscheidung

Die Nachbefragung ist optional und beeinflusst weder Condition, Guardrail-Form noch den Abschluss
der Hauptstudie. `study.sqlite` speichert Einwilligung, Instrumentversion, Token-Hash und nach
gültiger Prüfung die Antworten. `recontact.sqlite` speichert ausschließlich E-Mail, Raw Token,
Consent-Version und Versand-/Fensterzeitpunkte.

Nach `completedAt` gelten:

- Einladung nach 240 Stunden;
- höchstens eine Erinnerung 48 Stunden nach bestätigtem Erstversand;
- Fensterschluss nach 336 Stunden.

Das Follow-up läuft auf einer tokenisierten same-origin Route. Es gibt keine externe Plattform,
keinen Antwortimport und keine verzögerte Debrief-Mail. Der kontrollierte Versand über das
Universitätskonto benötigt keine Mail-Credentials in der Anwendung.

Spätestens sieben Kalendertage nach dem letzten Fenster werden Kontaktregister,
Schedule-Dateien, versandte Nachrichten und projektkontrollierte Kontaktkopien manuell gelöscht.
Das Protokoll enthält nur Datum, ausführende Person und Anzahlen vor/nach der Löschung.

## Konsequenzen

Kontakt- und Forschungsdaten bleiben getrennt. E-Mail und Raw Token erscheinen nie in
Forschungs- oder Analyseexporten und werden nicht geloggt. Neue Kontaktfelder oder Zeitfenster
benötigen eine ADR-Revision.

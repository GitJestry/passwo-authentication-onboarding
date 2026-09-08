# ADR 0011 — Getrennte Recontact-Registry

- **Status:** Accepted; Betrieb durch ADR 0016 präzisiert
- **Datum:** 2026-07-30
- **Revision:** 2026-09-07 — Antwortfenster auf 17 Tage nach Abschluss verlängert
- **Citation label:** `ADR 0011-Follow-up-Recontact`

## Entscheidung

Die Nachbefragung ist optional und beeinflusst weder Condition, Guardrail-Form noch den Abschluss
der Hauptstudie. `study.sqlite` speichert Einwilligung, Instrumentversion, Token-Hash und nach
gültiger Prüfung die Antworten. `recontact.sqlite` speichert ausschließlich E-Mail, Raw Token,
Consent-Version und Versand-/Fensterzeitpunkte.

Nach `completedAt` gelten:

- Einladung nach 240 Stunden;
- höchstens eine Erinnerung 48 Stunden nach bestätigtem Erstversand;
- Fensterschluss nach 408 Stunden (17 Tagen).

Die Revision gilt auch für bereits terminierte Sitzungen mit Follow-up-Einwilligung und
Instrumentversion `follow-up-v6-pilot`. Datenbankmigration 11 verlängert kürzere gespeicherte
Schließzeitpunkte auf `completedAt + 408h`, ohne längere Fristen zu verkürzen. Auch ein bereits
geschlossenes, unbeantwortetes Fenster wird dadurch bis zu dieser Grenze wieder erreichbar,
sofern Kontakt und Token noch vorhanden sind. Bereits abgegebene Antworten bleiben gesperrt.
Einladungs- und Erinnerungstermine, Versandbestätigungen sowie der berichtete Handlungszeitraum
ändern sich nicht. Noch nicht abgeschlossene Sitzungen erhalten den Zeitplan erst beim Abschluss.
Die Instrumentversion bleibt erhalten, weil Wortlaut und Antwortschema unverändert sind und ein
Versionswechsel bestehende Follow-up-Links ausschließen würde. Kontaktlöschung und Datensatz-Freeze
richten sich gemäß ADR 0016 nach dem verlängerten letzten Fenster.

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

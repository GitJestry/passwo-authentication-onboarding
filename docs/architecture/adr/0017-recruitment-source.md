# ADR 0017 — Minimale Rekrutierungsquellen-Erfassung

- **Status:** Accepted
- **Datum:** 2026-08-28
- **Citation label:** `ADR 0017-Recruitment-Source`

## Kontext

Für die Auswertung müssen Rekrutierungswege über eine kurze kategorische Source-ID unterschieden
werden. Die Quelle kommt ausschließlich aus dem Query-Parameter `id` der Landing-URL. Sie darf
weder die Zuweisung noch einen anderen Studienablauf beeinflussen.

## Entscheidung

Der Web-Client übermittelt beim erstmaligen Session-Create nur den Wert von `id`; er erfasst weder
die vollständige URL noch Referrer, IP-Adresse oder weitere Navigationsmetadaten. Der Server
akzeptiert generische IDs mit 1 bis 80 alphanumerischen Zeichen, Bindestrichen oder Unterstrichen.
Gültige Werte wie `ub`, `tu`, `rwth` oder `other-university` werden unverändert gespeichert. Es gibt
keine feste Hochschul-Whitelist. Nur ein fehlender oder syntaktisch ungültiger Wert wird als `ub`
gespeichert.

Die kanonische Quelle wird zusammen mit der Session angelegt und danach nicht aus späteren Requests
oder URLs aktualisiert. Resume verwendet den vorhandenen Session-Record. Die SQLite-Migration
ergänzt `recruitment_source` mit dem Schema-Default `ub` und führt kein separates physisches
Backfill-Update aus. Dadurch werden ältere Sessions beim Lesen und Export als `ub` behandelt.

`recruitmentSource` gehört zu Audit- und Analyseexporten. Das Feld darf Randomisierung, Condition
Assignment, Forschungs-ID, Fragebogen, Training, Timing oder Resume-Routing nicht beeinflussen.

## Konsequenzen

- Die Web-Create-Boundary normalisiert den untrusted Parameterwert serverseitig.
- Der Client erhält die Rekrutierungsquelle nicht als Ablauf- oder Darstellungssteuerung zurück.
- Die Erweiterung der Session-Exports erhält eine neue Export-Schemaversion.

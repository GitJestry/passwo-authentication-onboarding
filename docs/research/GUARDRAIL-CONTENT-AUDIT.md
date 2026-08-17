# Shared-Content-Audit des Understanding Guardrails

Status: **Pilotkandidat `guardrail-v6-pilot`.** Referenzartefakt:
`SecAware.NRW, Passwörter & Authentifizierung, V9, 27.03.2026`.

## Administrierter Referenzpfad

Der standardisierte Pfad enthält die zwingend gezeigten instruktiven Text-, Video- und
Interaktionsinhalte von V9 bis unmittelbar vor dem terminalen Knowledge Quiz. Das terminale Quiz
und dessen Lösungshinweise werden vor dem gemeinsamen Guardrail ausgelassen, weil es nur die
Referenzbedingung unmittelbar vor der gemeinsamen Messung zusätzlich testen und instruieren würde.
Die Ergebnisse beziehen sich deshalb auf den **SecAware.NRW-V9-Instruktionspfad wie in der Studie
administriert**, nicht auf das vollständige unveränderte Modul.

Optionale Zusatzlinks sind nicht erforderlich und begründen keinen gemeinsamen Claim.

## Gemeinsame Claims

| Claim | Gemeinsame Claim-Ebene | Guardrail-Evidenz |
|---|---|---|
| Eigenes starkes Passwort pro Konto/Dienst | explizite Empfehlung | `SC_DISTINCT_PASSWORDS`, `MR_DISTINCT_PASSWORDS` |
| Passwortmanager erzeugt starke Passwörter | explizite Funktion | `SC_PM_MANY_ACCOUNTS`, `MR_PASSWORD_MANAGER` |
| Passwortmanager speichert und organisiert Passwörter | explizite Funktion | `SC_PM_MANY_ACCOUNTS`, `MR_PASSWORD_MANAGER` |
| MFA ergänzt das Passwort um mindestens einen Faktor anderer Kategorie | explizites Konzept | `MR_MFA` |
| Account-spezifische starke Passwörter und MFA werden kombiniert | Zusammenführung zweier explizit präsentierter Empfehlungen | `SC_LAYERED_PROTECTION` |

Nicht als separater gemeinsamer Outcome-Claim verwendet werden Credential-Stuffing-Mechanik,
die Reaktion auf ein bereits bekanntes Passwort, eine nachträgliche Wiederherstellung der
Passwortgeheimhaltung oder die explizite Aussage, MFA könne Wiederverwendung nicht kompensieren.
Diese Inhalte sind technisch relevant und im Prototyp teilweise ausführlicher, wurden aber nicht
als identischer obligatorischer Wortlaut im administrierten V9-Pfad dokumentiert.

## A-priori-Klassifikationen

### `SC_DISTINCT_PASSWORDS`

- angemessen: für jedes Konto ein eigenes starkes Passwort;
- unsicher: dasselbe besonders starke Passwort bei beiden Konten;
- unsicher: eigenes Passwort nur für E-Mail, Wiederverwendung beim Shopping-Konto;
- unsicher/keine Aussage: `Weiß ich nicht` wird separat als Unsicherheit berichtet.

### `SC_PM_MANY_ACCOUNTS`

- angemessen: Passwortmanager erzeugt starke Passwörter und speichert/organisiert sie;
- unsicher: eigene Passwörter nur für wichtige Konten;
- unsicher: ein besonders starkes Passwort für alle Konten;
- Unsicherheit separat.

### `SC_LAYERED_PROTECTION`

- angemessen: eigenes starkes Passwort pro Konto plus MFA bei beiden Konten;
- unvollständig: eigene starke Passwörter, aber verfügbare MFA nicht aktiviert;
- unsicher: gemeinsames starkes Passwort trotz MFA;
- Unsicherheit separat.

Die unsafe-Klassifikation der gemeinsamen Passwortoption beruht auf der expliziten Empfehlung für
ein eigenes Passwort pro Konto. Das Item wird nicht als Nachweis eines separat vermittelten
MFA-Limit-Mechanismus interpretiert.

### Recognition

- `MR_DISTINCT_PASSWORDS`: Empfehlung für eigenes starkes Passwort pro Konto;
- `MR_PASSWORD_MANAGER`: Erzeugen, Speichern und Organisieren;
- `MR_MFA`: Passwort plus mindestens ein zusätzlicher Faktor anderer Kategorie.

## Formbalancierung

Formen `F1` bis `F6` verwenden alle sechs Reihenfolgen der drei Anwendungsszenarien. Für jedes
Item erscheinen die drei inhaltlichen Optionen über die sechs Formen genau zweimal an jeder der
drei Positionen. `Weiß ich nicht` bleibt immer zuletzt. Die Form wird serverseitig innerhalb jeder
Bedingung in zufällig permutierten Sechserblöcken vergeben und zusammen mit der tatsächlich
angezeigten Optionfolge persistiert.

## Verbindliche Shared-Content-Matrix

Vor der Hauptstudie muss für jeden Claim festgehalten werden:

- exakter Prototyp-Segment-/Screen-Beleg;
- exakter V9-Ort und Teilnehmerwortlaut beziehungsweise eindeutige Paraphrase;
- Bestätigung, dass der Inhalt im standardisierten Pfad zwingend gezeigt wird;
- Bestätigung, dass er nicht nur im ausgelassenen Quiz oder einem optionalen Link vorkommt.

Die Matrix, das Artefaktaudit und alle Klassifikationen werden von einer zweiten fachlich
qualifizierten Person geprüft, etwa Betreuung oder Usable-Security-Review. Nur konkrete Befunde und
ihre Auflösung werden dokumentiert. Diese manuelle Prüfung ist Content Review, keine
psychometrische Validierung, keine Interrater-Reliabilitätsstudie und keine zusätzliche
Softwarefunktion.

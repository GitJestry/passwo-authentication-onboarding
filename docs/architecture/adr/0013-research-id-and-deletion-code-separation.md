# ADR 0013 — Trennung von Forschungs-ID und Löschcode

- **Status:** Accepted
- **Datum:** 2026-08-02
- **Citation label:** `ADR 0013-Deletion-Code-Separation`
- **Ergänzt:** ADR 0002, ADR 0011 und ADR 0012

## Kontext

Der bisherige `participant_code` erfüllte zwei Rollen gleichzeitig: Er wurde der teilnehmenden
Person als Code für spätere Löschanfragen angezeigt und zugleich in den Forschungsdatenexport
aufgenommen. Dadurch konnte eine Person, die ihren Code gegenüber der Studienleitung offenlegt,
unmittelbar einer Zeile im Analyseexport zugeordnet werden. Für die Auswertung ist diese
Verknüpfung nicht erforderlich.

Eine Löschanfrage muss weiterhin zuverlässig einem lokalen Studiendatensatz zugeordnet werden
können. Gleichzeitig darf der dafür ausgegebene Code weder als Analyse-ID verwendet noch im
Forschungsdatenexport erscheinen.

## Entscheidung

Die Runtime trennt künftig drei Identitäten:

1. `session_id` ist die interne operative UUID für API, Persistenz und Tabellenbeziehungen. Sie
   wird der teilnehmenden Person nicht angezeigt und nicht als Analyse-ID exportiert.
2. `research_code` ist eine zufällige, nicht angezeigte Forschungs-ID. Sie wird im Export als
   `researchId` verwendet und verbindet ausschließlich die exportierten Forschungstabellen.
3. Der Löschcode wird kryptographisch im Browser erzeugt und nur flüchtig im Study-State gehalten.
   Der Client sendet bei der Sessionerstellung ausschließlich den SHA-256-Hash. Die
   Forschungsdatenbank speichert nur `deletion_code_hash`; Rohcode und Hash werden nicht
   exportiert.

Ein idempotenter Session-Retry verwendet dieselbe Request-ID und denselben Löschcode-Hash. Eine
abweichende Kombination wird als Konflikt abgelehnt. Der Löschcode bleibt ohne Browser Storage nur
für die laufende Sitzung verfügbar und wird deshalb nach der Sessionerstellung sowie am Ende der
Sitzung deutlich angezeigt.

Die Migration ersetzt bestehende sichtbare Teilnehmercodes durch neue interne Forschungs-IDs und
überführt den bisherigen Code ausschließlich als Hash in `deletion_code_hash`. Der bisherige
Rohcode bleibt dadurch nicht in der Forschungsdatenbank erhalten.

## Konsequenzen

- Forschungsdatenexporte enthalten `researchId`, aber weder interne Session-UUID noch Löschcode
  noch Löschcode-Hash.
- Teilnehmertexte verwenden konsequent `Löschcode`; `Teilnehmercode` und `Sitzungscode` werden
  nicht mehr als Synonyme verwendet.
- Eine spätere Löschfunktion muss den eingegebenen Löschcode lokal hashen und anhand von
  `deletion_code_hash` auflösen. Sie darf den Rohcode nicht protokollieren.
- Der Löschcode ist kein Authentifizierungsmerkmal für andere Funktionen und darf nicht in URLs,
  Exportdateien oder Recontact-Nachrichten aufgenommen werden.
- Die getrennte Recontact-Registry bleibt unverändert. Ihre Zugriffs- und Löschregeln müssen vor
  dem Study Freeze weiterhin organisatorisch und technisch festgelegt werden.

## Revision 2026-08-02 — Lokaler Löschworkflow

Die Runtime erhält einen ausschließlich lokalen CLI-Workflow. Er ist nicht über HTTP erreichbar
und besitzt weder eine Webroute noch eine Teilnehmeroberfläche. Der Löschcode wird verdeckt über
die Standardeingabe gelesen, gegen das `PW-`-Format validiert und mittels desselben UTF-8-
SHA-256-Verfahrens wie der Study Client gehasht. Der Rohcode bleibt im Prozessspeicher und wird
weder persistiert noch geloggt oder als Kommandozeilenargument akzeptiert.

Die Suche erfolgt ausschließlich über `study_sessions.deletion_code_hash`. Standardmäßig läuft die
CLI im Dry-Run und zeigt lediglich die betroffenen Tabellen und ihre Datensatzanzahlen. Eine
destruktive Ausführung verlangt zusätzlich `--confirm`. Die bestätigte Löschung entfernt die
Session, alle sessionabhängigen Forschungs- und Betriebsdatensätze sowie eine vorhandene
Recontact-Registrierung in einer lokalen SQLite-Transaktion. Sie erzeugt kein Löschprotokoll, weil
ein solcher zusätzlicher Datensatz die Löschung unterlaufen würde.

Bestehende Forschungs- oder Schedule-Exporte und Backups liegen außerhalb dieses Workflows. Die
CLI löscht und behauptet weder ihre Löschung noch ihre nachträgliche Bereinigung.

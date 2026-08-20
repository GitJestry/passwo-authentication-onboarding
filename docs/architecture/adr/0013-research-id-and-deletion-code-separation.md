# ADR 0013 — Trennung von Forschungs-ID und Löschcode

- **Status:** Accepted
- **Datum:** 2026-08-02
- **Revision:** 2026-08-20 gemäß ADR 0016
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

Die Runtime trennt vier Kennungen mit unterschiedlichen Zwecken:

1. `session_id` ist die interne operative UUID für API, Persistenz und Tabellenbeziehungen. Sie
   wird der teilnehmenden Person nicht angezeigt und nicht als Analyse-ID exportiert.
2. `research_code` ist eine zufällige, nicht angezeigte Forschungs-ID. Sie wird im Export als
   `researchId` verwendet und verbindet ausschließlich die exportierten Forschungstabellen.
3. Der Löschcode wird serverseitig deterministisch aus dem kryptographisch zufälligen,
   opaken Rückkehrschlüssel abgeleitet. Die Ableitung verwendet eine domänengetrennte SHA-256-
   Eingabe und formatiert daraus den bestehenden `PW-XXXX-XXXX-XXXX-XXXX`-Code. Der Browser erhält
   den Rohcode ausschließlich in der Antwort auf Sessionerstellung oder gültige Wiederaufnahme und
   hält ihn im flüchtigen Study-State. Die Forschungsdatenbank speichert nur
   `deletion_code_hash`; Rohcode und Hash werden nicht exportiert.
4. Der Rückkehrschlüssel ist eine rein operative Resume-Kennung. Der Browser erhält nur den opaken
   Raw Token als `HttpOnly`-Cookie, die Forschungsdatenbank speichert nur dessen Hash. Er wird nicht
   angezeigt, nicht exportiert und nicht unmittelbar als Lösch- oder Forschungs-ID verwendet.

Die initiale Resume-Prüfung setzt vor der Sessionerstellung einen noch ungebundenen, zufälligen
Rückkehrschlüssel. Ein idempotenter Session-Retry verwendet dadurch dieselbe Request-ID und denselben
abgeleiteten Löschcode-Hash. Eine aktive Tokenbindung mit abweichender Request-ID oder abweichendem
Hash wird als Konflikt abgelehnt.

Falls eine erfolgreich angelegte Sessionantwort vollständig verloren geht und der Browser den
Cookie deshalb nicht übernimmt, darf ein Retry derselben Request-ID die weiterhin laufende Session
atomar an einen neuen Rückkehrschlüssel und dessen Löschcode-Hash binden. Dadurch bleibt die
Sessionerstellung idempotent und erzeugt keinen zweiten Forschungsfall. Abgeschlossene Sessions und
abweichende Follow-up-Entscheidungen bleiben von dieser Recovery ausgeschlossen.

Solange dasselbe gültige `HttpOnly`-Cookie vorhanden ist, kann die Runtime den Löschcode bei einer
Wiederaufnahme erneut ableiten. Sie gibt ihn nur zurück, wenn sein Hash mit dem gespeicherten
`deletion_code_hash` übereinstimmt. Der Rohcode wird weiterhin weder in SQLite noch in Exporten
gespeichert. Geht das Cookie verloren oder ist es ungültig, kann die Runtime den Löschcode nicht
über Forschungsdaten, Kontaktdaten oder andere Kennungen rekonstruieren. Für eine spätere
Löschanfrage muss die Person den angezeigten Code deshalb weiterhin selbst sichern.

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
- Der Server darf den Rohcode nur für die aktuelle Create- oder Resume-Antwort im Prozessspeicher
  ableiten. Er darf ihn weder persistieren noch loggen.
- Zugriffs- und Löschregeln für Recontact-Registry, Rückkehrschlüssel und spätere Anonymisierung sind
  in ADR 0016 und `DATA-CONTRACT.md` festgelegt und keine offene Versions-Freeze-Entscheidung.

## Revision 2026-08-02 — Lokaler Löschworkflow

Die Runtime erhält einen ausschließlich lokalen CLI-Workflow. Er ist nicht über HTTP erreichbar
und besitzt weder eine Webroute noch eine Teilnehmeroberfläche. Der Löschcode wird verdeckt über
die Standardeingabe gelesen, gegen das `PW-`-Format validiert und mittels desselben UTF-8-
SHA-256-Verfahrens wie die Study Runtime gehasht. Der Rohcode bleibt im Prozessspeicher und wird
weder persistiert noch geloggt oder als Kommandozeilenargument akzeptiert.

Die Suche erfolgt ausschließlich über `study_sessions.deletion_code_hash`. Standardmäßig läuft die
CLI im Dry-Run und zeigt lediglich die betroffenen Tabellen und ihre Datensatzanzahlen. Eine
destruktive Ausführung verlangt zusätzlich `--confirm`. Die bestätigte Löschung entfernt die
Session, alle sessionabhängigen Forschungs- und Betriebsdatensätze sowie eine vorhandene
Recontact-Registrierung in einer lokalen SQLite-Transaktion. Sie erzeugt kein Löschprotokoll, weil
ein solcher zusätzlicher Datensatz die Löschung unterlaufen würde.

Bestehende Forschungs- oder Schedule-Exporte und Backups liegen außerhalb dieses Workflows. Die
CLI löscht und behauptet weder ihre Löschung noch ihre nachträgliche Bereinigung.

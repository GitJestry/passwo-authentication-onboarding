# Study Runtime

Status: **kanonisches Zielverhalten für den Webbetrieb der Hauptstudie.**
Die Architekturentscheidung steht in `ADR 0016-Web-Resume-Lifecycle`; die Datengrenze und spätere
Anonymisierung stehen in `DATA-CONTRACT.md`.

## Zweck und Systemgrenze

Die Study Runtime umschließt beide Artefaktbedingungen mit demselben Ablauf. Study State und
Training State bleiben getrennt. React rendert Zustände; Zuweisung, erlaubte Persistenz, Timing,
Wiederaufnahme und Abschluss liegen in der same-origin Study API.

Die Hauptstudie wird über HTTPS im Browser bereitgestellt. Die vorhandene Electron-Hülle bleibt ein
lokaler Entwicklungs- und QA-Pfad. Sie ist keine zweite fachliche Runtime.

## Verbindlicher Ablauf

```text
Eligibility lokal prüfen
→ gemeinsame Teilnahmeinformation
→ erforderliche Hauptstudien-Einwilligung
→ optional: Nachbefragung auswählen und E-Mail-Adresse angeben
→ zufälligen `HttpOnly`-Rückkehrschlüssel setzen und Löschcode serverseitig ableiten
→ Session serverseitig anlegen; Condition und Guardrail-Form verdeckt zuweisen
→ nur bei Opt-in: E-Mail getrennt registrieren
→ Pre sample
→ Pre experience
→ zugewiesenes Artefakt
→ PANAS
→ Zeiturteile
→ UEQ-S
→ UEQ+ Inhaltsseriosität
→ Design-Diagnostik
→ Risikoproportionalität und wahrgenommenes Verständnis
→ Guardrail-Szenarien
→ Guardrail-Recognition
→ Post-Guardrail-Self-Efficacy
→ retrospektive SecAware-Vorerfahrung
→ automatischer Datenabschluss mit der letzten erforderlichen Submission
→ gemeinsames Debriefing und Abschlussbildschirm
```

Eligibility wird nicht persistiert. Die E-Mail-Adresse ist keine Voraussetzung. Scheitert die
optionale Kontaktregistrierung, kann sie erneut versucht oder verworfen werden; die Hauptstudie
bleibt davon unberührt.

## Unterbrechen, Wiederaufnehmen und Beenden

Es gibt während der Studie keinen gesonderten Button zum vorzeitigen „Abbrechen“, „Beenden“ oder
„Schließen“. Eine Person kann jederzeit den Tab oder Browser schließen. Dadurch endet nur die aktuelle
Browser-Sitzung; der Run bleibt `in-progress` und kann im selben Browser fortgesetzt werden.

Die Wiederaufnahme verwendet einen zufälligen Rückkehrschlüssel in einem technisch notwendigen,
`Secure`- und `HttpOnly`-geschützten first-party Cookie. Es ist höchstens 30 Tage gültig, wird nach
einem bestätigten Checkpoint erneuert und endet spätestens am vor Rekrutierungsbeginn
konfigurierten `resumeCloseAt`. Dieser Zeitpunkt ist zugleich der Datenerhebungsschluss für
Hauptsitzungen. Serverseitig liegen nur Hash und Ablaufzeit. Der Rückkehrschlüssel enthält weder
Antworten noch Condition, E-Mail-Adresse oder Forschungs-ID.

Die Runtime stellt den letzten bestätigten sicheren Checkpoint wieder her:

- atomar gespeicherte Fragebogenblöcke bleiben abgeschlossen;
- der nächste noch nicht abgeschlossene Fragebogenabschnitt wird geöffnet;
- SecAware öffnet den letzten bestätigten Seiteneinstieg;
- PassWo setzt S01–S07 nach einem Reload am zuletzt bestätigten Segment-Einstieg fort, wenn im
  selben Tab ein passender, mit zweistündiger TTL versehener `sessionStorage`-Reload-Checkpoint für
  dieselbe Session vorliegt; fehlt er oder ist er ungültig, bleibt S01 der sichere Fallback;
- Sessions, die noch mit einer Teilnahmeinformation vor `consent-v14-pilot` begonnen wurden,
  verwenden diese lokale Ausnahme nicht und behalten auch nach einem Resume den bisherigen
  S01-Fallback;
- beim Eintritt in S08 verwirft der Client alle frei eingegebenen Passwortstrings, Teilstrings und
  semantischen Detailbefunde und bestätigt atomar den minimalen S08-Resume-Zustand;
- Resume ab S08 rekonstruiert ausschließlich vorgegebene Passphrasen über Content-IDs sowie die
  noch erforderlichen kanonischen Schwäche-/Relationsflags;
- ab S08 öffnet Resume den Einstieg des zuletzt bestätigten Segments S08 bis S17; dafür wird neben
  dem minimalen S08-Zustand nur die inhaltsfreie Segment-ID fortgeschrieben;
- Trainingsinputs werden für die Wiederaufnahme nie an den Server gesendet oder als Forschungsdaten
  gespeichert. Der enge S01–S07-Reload-Checkpoint bleibt ausschließlich tab-lokal und wird nach
  bestätigtem S08-Checkpoint gelöscht.

Im aktuell integrierten PassWo-Lauf gehören S00 bis S07 zur flüchtigen Sektion 1 `passwords`. Eine
Unterbrechung im einmaligen S00-Einstieg beginnt wieder bei S00. Für S01 bis S07 kann ein Reload im
selben Tab den zuletzt bestätigten Segment-Einstieg exakt rekonstruieren, sofern der dazugehörige
kurzlebige lokale Snapshot vorhanden und zur serverseitigen Segment-ID konsistent ist. Ohne diesen
Snapshot beginnt die Sektion weiterhin bei S01 neu. Der bestätigte Checkpoint `supportive:S08` ist
die harte Grenze für frei eingegebene Trainingswerte. Danach wird bei jedem neuen Segment
ausschließlich dessen inhaltsfreie ID S09 bis S17 bestätigt, sodass die Wiederaufnahme am Einstieg
des zuletzt erreichten Segments beginnt.

Wenn die Person nicht vor `resumeCloseAt` zurückkehrt, bleibt die Sitzung unvollständig. Sie wird
nicht ausgewertet und beim Datensatz-Freeze gelöscht. Eine vorzeitige individuelle Löschung bleibt
bis zur Anonymisierung über den Löschcode möglich.

Sobald Artefaktabschluss und alle erforderlichen Instrumentabschnitte atomar gespeichert sind,
setzt die letzte Submission die Sitzung in derselben Servertransaktion auf `completed`. Ihr
persistierter Submission-Zeitpunkt ist der Abschlusszeitpunkt und plant bei Opt-in die
Nachbefragung. Das danach angezeigte gemeinsame Debriefing mit Abschlussbildschirm verlangt keine
weitere statusbestimmende Aktion. Ältere datenkomplette `in-progress`-Sitzungen werden beim
Runtime-Start idempotent anhand ihrer letzten Submission abgeschlossen.

## Instrumentreihenfolge und Writes

Jeder Fragebogenabschnitt wird als atomare, idempotente Submission gespeichert. Ein
Forschungsdatenfehler blockiert nur den betroffenen Übergang und erlaubt denselben Retry.

Pre muss vollständig vor dem Artefakt vorliegen. Die unmittelbaren Post-Abschnitte müssen vor den
Guardrail-Szenarien gespeichert sein. Recognition folgt erst nach allen Szenarien. Self-Efficacy und
die retrospektive SecAware-Frage folgen nach dem no-feedback Guardrail. Erst danach wird das
gemeinsame Debriefing angezeigt. Der erfolgreiche Write des letzten dieser Pflichtabschnitte ist
zugleich der serverseitige Datenabschluss.

Es gibt keinen offenen Post-Kommentar und kein condition-spezifisches terminales Knowledge Quiz vor
dem gemeinsamen Guardrail. Instruktive Fragen innerhalb der Lernpfade bleiben Bestandteil des
jeweiligen Artefakts.

## Timing bei Unterbrechungen

Die objektive Bearbeitungszeit besteht aus bestätigten Artefakt-Sitzungsintervallen. Zeit zwischen
dem Schließen des Browsers und einer späteren Wiederaufnahme wird nicht mitgezählt.

Ein unterbrochener flüchtiger Trainingsschritt erhält bei Wiederaufnahme ein neues
Sitzungsintervall und ein technisches Unterbrechungsflag. Completed Sitzungen mit Unterbrechung
bleiben für nicht zeitbezogene Outcomes auswertbar. Für die Daueranalyse werden
Unterbrechungsflags berichtet und in einer Sensitivitätsprüfung berücksichtigt.

Der bisherige lokale Lease-Mechanismus und `incomplete-reload` bleiben als Legacy-Verhalten lesbar,
werden aber für neue Web-Sitzungen nicht mehr erzeugt.

## Referenzpfad

Der deterministische SecAware-V9-Study-Build wird same-origin bis unmittelbar vor das terminale
Knowledge Quiz administriert. Quiz und Lösungshinweise werden ausgelassen; der
Referenz-Completion-Event liegt an dieser Grenze. Adaptation und Shared-Content-Nachweis sind im
Artefaktmanifest und Content Audit dokumentiert.

## Teilnahmeinformationen und Löschcode

Kerninformationen und ausführliche Fassung sind vor Einwilligung sichtbar. Nach Sessionerstellung
wird der Löschcode angezeigt. Im Fragebogen bleibt die ausführliche Fassung über
`© Universität Bonn · Teilnahmeinformationen` erreichbar.

Die Runtime zeigt keine Forschungs-ID, Condition, Antworten oder Timingdaten. Der rohe Löschcode
wird nicht serverseitig gespeichert. Bei einer gültigen Wiederaufnahme im selben Browser wird er
aus dem `HttpOnly`-Rückkehrschlüssel erneut abgeleitet und nur nach Hash-Abgleich angezeigt.
Teilnehmende müssen ihn weiterhin selbst sichern, wenn sie später unabhängig von diesem Browser
eine Löschung anfragen möchten.

## Zustands- und Datenschutzgrenzen

- Anzeigename, fiktive Passwörter, Passwortteile, lokale Detailfindings und semantische Evidenz
  werden nie an den Server übertragen oder als Forschungsdaten gespeichert. Für S01–S07 darf nur
  der minimal erforderliche Reload-Zustand höchstens zwei Stunden im tab-lokalen `sessionStorage`
  liegen; nach bestätigtem S08-Checkpoint wird er gelöscht;
- `localStorage`, IndexedDB und Service Worker sind für Teilnehmer- und Trainingszustand
  unzulässig; `sessionStorage` ist ausschließlich für diesen versionierten Reload-Checkpoint
  erlaubt;
- langfristige Browserpersistenz ist weiterhin ausschließlich der opake, JavaScript-unlesbare
  Rückkehrschlüssel im `HttpOnly`-Cookie;
- Session, Zuweisung, Versionen, atomare Antworten, Timing, inhaltsfreier Checkpoint und
  Abschlussstatus liegen serverseitig. Zwischen S08 und Artefaktabschluss kommt ausschließlich der
  in ADR 0016 abschließend typisierte, nicht rekonstruierende Simulationsresume-Zustand hinzu; der
  inhaltsfreie Checkpoint enthält dabei nur die zuletzt bestätigte Segment-ID S08 bis S17;
- E-Mail und Raw-Follow-up-Token liegen ausschließlich im getrennten Kontaktregister;
- Request-Bodies, IP-Adressen, User-Agents, Trainingswerte und Raw Tokens werden nicht in
  projektkontrollierten Anwendungs- oder Access-Logs persistiert.

## Follow-up-Betrieb

Nach Opt-in und Completion werden Einladung nach 240 Stunden, höchstens eine Erinnerung 48 Stunden
später und Fensterschluss nach 336 Stunden geplant.

Das Follow-up wird als getrennte tokenisierte Route derselben Webanwendung bereitgestellt. Es gibt
keine externe Umfrageplattform und keinen Antwortimport. Die Follow-up-Fragen sind nicht Teil des
Hauptstudien-Bundles und erscheinen nur nach gültigem Token und erneuter freiwilliger Bestätigung.

Einladung und Erinnerung werden kontrolliert über das Universitätskonto versendet. Die Study Runtime
enthält keine Mail-Credentials und sendet keine Nachrichten selbst. Es gibt keine verzögerte
Debrief-Mail.

Spätestens sieben Kalendertage nach Schließung des letzten Follow-up-Fensters löscht die
Studienleitung Kontaktregister, lokale Schedule-Dateien, versandte Follow-up-Nachrichten im
projektkontrollierten Postfach und sonstige projektkontrollierte Kontaktkopien. Die dokumentierte
Bestätigung enthält keine Kontaktdaten.

## Researcher-Konfiguration

Die Hauptstudie nutzt `permuted-block`. `forced-supportive` und `forced-reference` sind nur für
Cognitive Pretest, End-to-End-Pilot und technische QA zulässig. Der Client besitzt keinen
Condition-Schalter.

## Manuelle Qualitätssicherung

Vor dem Hauptstudien-Versions-Freeze bleiben folgende fachliche Aufgaben bestehen:

- Cognitive Pretest und End-to-End-Pilot in beiden Bedingungen;
- zweite qualifizierte Prüfung von Artefaktaudit, Shared-Content-Matrix und
  Guardrail-Klassifikationen;
- dokumentierte Auflösung konkreter Befunde;
- Smoke-Test des Webbetriebs, der Wiederaufnahme und des Follow-up-Links;
- kontrollierte Probe von Kontaktlöschung und späterer Anonymisierungsprozedur.

Die zweite Inhaltsprüfung ist wissenschaftliche QA, keine psychometrische Validierung und keine
neue Softwarefunktion.

## Kontrollierte Abschlussbegriffe

- **Hauptstudien-Versions-Freeze:** vor Rekrutierungsbeginn; fixiert Commit, Inhalte, Instrumente,
  Referenzartefakt und Analyseplan.
- **Datenerhebungsschluss:** das vorab festgelegte `resumeCloseAt`; danach werden keine neuen oder
  wiederaufgenommenen Hauptsitzungen mehr angenommen.
- **Datensatz-Freeze:** nach Datenerhebung und Follow-up; entfernt unvollständige Sitzungen,
  anonymisiert den Archivdatensatz und startet dessen zehnjährige Aufbewahrung.

Die vollständige Prozedur und Frist stehen ausschließlich in `DATA-CONTRACT.md` und werden hier
nicht dupliziert.

## Lokale Löschung vor der Anonymisierung

Die bestehende CLI kann über den Löschcode eine pseudonymisierte Session und alle abhängigen
Datensätze in Forschungs- und Kontaktregister auflösen. Standard ist Dry-Run; Schreiben erfordert
`--confirm`.

Arbeits-Exporte und Backups werden nicht still als gelöscht behandelt. Sie sind im kontrollierten
Lösch- beziehungsweise Anonymisierungsvorgang ausdrücklich mit einzubeziehen.

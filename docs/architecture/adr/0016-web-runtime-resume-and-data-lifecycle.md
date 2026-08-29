# ADR 0016 — Webbetrieb, Wiederaufnahme und Datenabschluss

- **Status:** Accepted
- **Datum:** 2026-08-17
- **Revision:** 2026-08-29 für den automatischen Datenabschluss nach der letzten erforderlichen
  Submission; 2026-08-26 für die segmentgenaue PassWo-Wiederaufnahme ab S08 und die
  SecAware-Zusatznavigation im Web
- **Citation label:** `ADR 0016-Web-Resume-Lifecycle`
- **Ersetzt für den Hauptstudienbetrieb:** Reload-Abbruch aus `ADR 0008-Lease`, externen
  Follow-up-Import und verzögerten Debrief-Versand aus `ADR 0011-Follow-up-Recontact`
- **Ergänzt:** ADR 0002, ADR 0004, ADR 0012 und ADR 0013

## Kontext

Die Hauptstudie soll als Webanwendung betrieben werden. Ein geschlossenes Browserfenster ist dabei
keine verlässliche Erklärung eines Teilnahmeabbruchs. Gleichzeitig dürfen fiktive Passwörter,
Passwortteile und semantische Detailbefunde weiterhin weder an den Server gesendet noch persistent
gespeichert werden. Für die späteren Passwortmanager-Segmente müssen nach Abschluss von S07 jedoch
wenige nicht rekonstruierende Simulationsmerkmale konsistent wiederherstellbar sein.

Bisherige Dokumente vermischten außerdem drei unterschiedliche Zeitpunkte: den technischen
Versions-Freeze vor der Hauptstudie, den Schluss der Hauptdatenerhebung und die spätere
Anonymisierung des Datensatzes. Diese Begriffe werden getrennt.

## Entscheidung

### 1. Hauptstudienbetrieb im Web

Die produktive Hauptstudie läuft als same-origin Webanwendung über HTTPS. Web-Renderer und Study API
verwenden weiterhin dieselben fachlichen Module. Die Electron-Hülle bleibt ein lokaler Entwicklungs-
und QA-Pfad, ist aber nicht mehr der vorgesehene Auslieferungspfad der Hauptstudie.

Eine separate Ethikkommissionsfreigabe ist für dieses Bachelorprojekt nicht als Projektgate
vorgesehen. Das Repository darf weder eine nicht vorhandene Freigabe behaupten noch sie als
technischen Launch-Blocker erfinden. Teilnahmeinformation, Einwilligung, Datenminimierung,
Zugriffsschutz und die hier beschriebene Löschung bleiben verbindliche Anforderungen.

Die zwölf eingefrorenen SecAware-Zusatzlinks bleiben auch im Webbetrieb verfügbar. Der Wrapper
akzeptiert weiterhin ausschließlich die vollständig geprüfte Nachricht aus dem konfigurierten
same-origin Kursframe und löst die Link-ID gegen die kanonische Registry auf. Im Browser öffnet er
die festgeschriebene HTTP(S)-Adresse mit `noopener` und `noreferrer` in einem separaten Tab. Der
SecAware-Kurs bleibt unverändert im Studien-Tab; externe Inhalte werden weder in den Web-Client
eingebettet noch durch den Study Server weitergeleitet. Die isolierte Desktop-Darstellung aus
ADR 0009 und ADR 0011 bleibt für die lokale Electron-Hülle unverändert.

### 2. Unterbrechen und Wiederaufnehmen

Neue Web-Sitzungen bleiben bis zum vollständigen Forschungsdatenabschluss `in-progress`. Das
Schließen oder Neuladen des Browsers ändert diesen Status nicht. Es gibt deshalb keinen
zusätzlichen Button zum vorzeitigen „Beenden“, „Abbrechen“ oder „Schließen“.

Die letzte erforderliche Instrument-Submission setzt die Sitzung in derselben Servertransaktion
auf `completed`, sobald Artefaktabschluss, Pre, Post und Guardrails vollständig vorliegen. Als
`completed_at_iso` gilt der persistierte Zeitpunkt dieser letzten Submission. Das gemeinsame
Debriefing und der Abschlussbildschirm werden anschließend angezeigt, enthalten aber keine weitere
statusbestimmende Aktion. Ein verlorener Browser-Response nach dem letzten Write kann den bereits
bestätigten Datenabschluss daher nicht zurücknehmen. Beim Runtime-Start werden ältere
`in-progress`-Sitzungen mit bereits vollständig vorliegenden Pflichtdaten idempotent anhand des
Zeitpunkts ihrer letzten Submission abgeschlossen.

Die Wiederaufnahme verwendet einen kryptographisch zufälligen, opaken Rückkehrschlüssel:

- der Browser erhält ihn ausschließlich als `Secure`, `HttpOnly`, first-party Cookie mit
  `SameSite=Lax`;
- das Cookie ist höchstens 30 Tage gültig und wird nach einem bestätigten Checkpoint erneuert,
  jedoch nie über das vor Rekrutierungsbeginn festgelegte `resumeCloseAt` hinaus; dieser Zeitpunkt
  ist zugleich der verbindliche Datenerhebungsschluss für Hauptsitzungen;
- die Forschungsdatenbank speichert nur den Hash des Rückkehrschlüssels und dessen Ablaufzeit;
- der Rückkehrschlüssel ist kein Forschungsfeld und wird nicht exportiert;
- der Löschcode kann während einer gültigen Wiederaufnahme deterministisch aus dem Raw Token
  abgeleitet werden; zurückgegeben wird er nur bei Übereinstimmung mit dem gespeicherten
  Löschcode-Hash, während weder Raw Token noch Rohcode persistiert werden;
- bis einschließlich S07 speichert der Server nur einen stabilen, inhaltsfreien
  Fortschritts-Checkpoint, etwa den nächsten Fragebogenabschnitt oder einen freigegebenen
  Trainingssegment-Einstieg;
- beim atomaren Eintritt in S08 darf zusätzlich genau ein versionierter
  `supportive-s08-resume-v1`-Zustand gespeichert werden. Er enthält ausschließlich IDs von drei
  vorgegebenen Passphrasen, die IDs der weiterhin als schwach dargestellten Konten und höchstens
  die drei kanonischen Kontopaar-Relationen mit der groben Art `identical` oder `similar`;
- frei eingegebene Passwortstrings, Teilstrings, Positionen, Analyse-Spans, Kategorien,
  semantische Evidenz und Anzeigenamen sind auch in diesem Zustand verboten. Die
  Passphrase-Strings werden ausschließlich aus lokalem, versioniertem Training-Content über ihre
  IDs rekonstruiert;
- der lokale Trainingszustand verwirft alle frei eingegebenen Passwortwerte und Detailbefunde vor
  dem S08-Checkpoint-Write. Der minimale S08-Zustand wird nach Artefaktabschluss gelöscht und ist
  kein Forschungs- oder Analyseexportfeld;
- nach dem bestätigten S08-Write darf der inhaltsfreie Fortschritts-Checkpoint monoton auf die
  Segment-IDs S09 bis S17 fortgeschrieben werden. Diese Checkpoints enthalten ausschließlich die
  Segment-ID und keine Eingaben, Entscheidungen oder rekonstruierten Trainingsinhalte.

Bei der Rückkehr im selben Browser wird der letzte serverseitig bestätigte Checkpoint ausgewertet.
SecAware öffnet den letzten bestätigten Seiteneinstieg. PassWo setzt bis S07 nicht an einem
einzelnen Segment fort, sondern rekonstruiert Sektion 1 `passwords` ab ihrem festgelegten Einstieg:
Während des einmaligen S00-Einstiegs wird S00 wiederholt, danach beginnt diese Sektion bei S01 neu.
Ab dem bestätigten S08-Checkpoint beginnt PassWo dagegen am Einstieg des zuletzt bestätigten
Segments S08 bis S17. Dafür rekonstruiert die Runtime nur den oben festgelegten minimalen
Simulationszustand und wertet die inhaltsfreie Segment-ID aus. Sektion 2 `password-manager` und
Sektion 3 `mfa` verwenden diesen Zustand, ohne frühere Trainingsinputs wiederherzustellen. Bereits
atomar gespeicherte Fragebogenblöcke werden nicht erneut erhoben.

Nach vollständigem Datenabschluss, individueller Löschung, Ablauf oder Datensatz-Freeze werden
Rückkehrschlüssel und Cookie ungültig. Geht der Rückkehrschlüssel vorher verloren oder wird das
Cookie gelöscht, kann die Sitzung nicht über Kontaktdaten oder Forschungsantworten gesucht werden.
Die Person kann neu beginnen oder mit ihrem Löschcode die Löschung der alten Sitzung verlangen.

### 3. Auswertung und Timing bei Unterbrechungen

Die Hauptanalyse umfasst ausschließlich regulär `completed` Sitzungen. Nicht abgeschlossene
Sitzungen werden weder als Nullantwort noch als Studienoutcome interpretiert und beim Datensatz-
Freeze vollständig gelöscht.

Offline-Zeit zwischen Browser-Sitzungen zählt nicht zur Bearbeitungszeit. Eine wiederaufgenommene
Sitzung erhält ein technisches Unterbrechungsflag; die auswertbare Dauer wird aus den bestätigten
Artefakt-Sitzungsintervallen gebildet. Der unterbrochene flüchtige Trainingsschritt beginnt mit
einem neuen Sitzungsintervall. Technische Unterbrechungen werden für die Daueranalyse transparent
berichtet, blockieren aber nicht pauschal alle übrigen Outcomes eines vollständig abgeschlossenen
Laufs.

Die kanonische Trainingsdauer ist ausschließlich
`SUM(web_artifact_intervals.confirmed_elapsed_ms)` je Sitzung. Visibility-Events beschreiben nur
den technischen Sichtbarkeitsverlauf und werden nicht zusätzlich auf die Dauer addiert. Vor- und
Nachfragebogenzeiten bleiben getrennte Wall-Clock-Diagnostik und sind kein Bestandteil von
`training_active_ms`.

Der bisherige Status `incomplete-reload` und die Artefakt-Lease bleiben nur für historische lokale
Sitzungen beziehungsweise den aktuellen Entwicklungsstand lesbar. Sie sind nicht das Zielmodell für
neue Web-Sitzungen.

### 4. Freiwillige Nachbefragung

Die Nachbefragung läuft als getrennte tokenisierte Route derselben Webanwendung. Es gibt keine
zusätzliche Umfrageplattform und keinen manuellen Antwortimport. Der individuelle Link enthält nur
den zufälligen Roh-Token; der Server vergleicht dessen Hash und speichert den Roh-Token nicht in der
Forschungsdatenbank.

Einladung und höchstens eine Erinnerung werden kontrolliert über das Universitätskonto versendet.
Die Anwendung muss dafür keine SMTP- oder Gmail-Zugangsdaten enthalten. Es gibt keine verzögerte
Debrief-Mail, weil das gemeinsame Debriefing bereits am Ende der Hauptsitzung erfolgt.

Das Kontaktregister, lokale Schedule-Dateien, versandte Follow-up-Nachrichten im
projektkontrollierten Postfach und sonstige projektkontrollierte Kontaktkopien werden
spätestens sieben Kalendertage nach Schließung des letzten Follow-up-Fensters gelöscht. Der
Löschvorgang wird nur mit Datum, Anzahl vor der Löschung, Anzahl danach und ausführender Person
dokumentiert; die Bestätigung enthält keine E-Mail-Adresse und keinen Token.

### 5. Drei getrennte Abschlusszeitpunkte

1. **Hauptstudien-Versions-Freeze:** vor Rekrutierungsbeginn; friert Code, Inhalte, Instrumente,
   Referenzartefakt und Analyseplan ein.
2. **Datenerhebungsschluss:** entspricht `resumeCloseAt`. Ab diesem Zeitpunkt werden weder neue
   noch wiederaufgenommene Hauptsitzungen angenommen. Bereits eröffnete Follow-up-Fenster dürfen
   noch abgeschlossen werden; unvollständige Hauptsitzungen können nicht mehr fortgesetzt werden.
3. **Datensatz-Freeze mit Anonymisierung:** nach Schließung aller Follow-up-Fenster und Abschluss der
   Datensatzprüfung; spätestens 30 Kalendertage nach dem letzten Follow-up-Fenster. Gibt es keine
   Follow-up-Einwilligungen, läuft die Frist ab Datenerhebungsschluss.

Die konkrete Anonymisierungsprozedur und die Bedeutung des anonymen Archivdatensatzes stehen
kanonisch in `docs/research/DATA-CONTRACT.md`. Die zehnjährige Aufbewahrung beginnt mit dem dort
dokumentierten `anonymisedAt`.

## Konsequenzen

- Web-Resume benötigt zusätzlich eine eng typisierte, nullable Spalte für den temporären
  S08-Resume-Zustand. Sie darf ab `supportive:S08` bis einschließlich `supportive:complete`
  befüllt sein und wird beim Artefaktabschluss geleert. Der bestehende inhaltsfreie
  Fortschritts-Checkpoint trägt dabei die zuletzt bestätigte Segment-ID S08 bis S17.
- JavaScript-lesbarer Browser Storage bleibt für Teilnehmer- und Trainingszustand verboten.
- Forschungsabschluss und Follow-up-Terminierung hängen nicht von einem zusätzlichen Klick nach
  der letzten erforderlichen Submission ab. Der bisherige Completion-Endpunkt bleibt nur als
  idempotente Kompatibilitätsgrenze für bereits geöffnete ältere Clients bestehen.
- Die bestehende lokale Runtime darf als Entwicklungsstand weiterlaufen, ist aber vor dem
  Hauptstudien-Versions-Freeze an diese Entscheidung anzupassen.
- `analysis`-Exporte vor dem Datensatz-Freeze bleiben pseudonymisierte Arbeitsdaten. Erst der
  kontrolliert erzeugte und geprüfte Archivdatensatz darf als anonym bezeichnet werden.
- Eine spätere öffentliche Weitergabe des Archivdatensatzes benötigt eine eigene kontextbezogene
  Offenlegungsprüfung; die interne Anonymisierung ist keine pauschale Veröffentlichungsfreigabe.

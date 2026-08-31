# ADR 0016 — Webbetrieb, Wiederaufnahme und Datenabschluss

- **Status:** Accepted und implementiert
- **Datum:** 2026-08-17
- **Letzte Revision:** 2026-08-30
- **Citation label:** `ADR 0016-Web-Resume-Lifecycle`
- **Ersetzt im Web:** Reload-Abbruch aus ADR 0008-Lease sowie externen Follow-up-Import und
  verzögerten Debrief-Versand aus ADR 0011

## Entscheidung

### Webbetrieb

Die Hauptstudie läuft same-origin über HTTPS. Electron bleibt lokaler Entwicklungs- und QA-Pfad.
Die eingefrorenen SecAware-Zusatzlinks öffnen geprüfte HTTP(S)-Ziele mit `noopener` und
`noreferrer`; der Kurs bleibt im Studien-Tab. Externe Inhalte werden nicht eingebettet oder durch
den Study Server weitergeleitet.

### Resume

Browser-Schließen oder Reload unterbricht einen Run, beendet ihn aber nicht. Der Browser hält einen
kryptographisch zufälligen Rückkehrschlüssel ausschließlich in einem `Secure`, `HttpOnly`,
`SameSite=Lax`-Cookie. Der Server speichert nur Hash und Ablaufzeit. Das Cookie gilt höchstens 30
Tage, wird an Checkpoints erneuert und endet spätestens bei `resumeCloseAt`.

Bis S07 speichert der Server nur die bestätigte Segment-ID. Für S01–S07 darf derselbe Tab zusätzlich
einen versionierten Reload-Snapshot in `sessionStorage` halten: minimale Zustandsdaten, gleiche
Session und Segment-ID, höchstens zwei Stunden TTL, keine Netzwerkübertragung. Fehlt oder
widerspricht er, beginnt PassWo sicher bei S01. Nach dem bestätigten S08-Checkpoint wird er gelöscht.

Beim Eintritt in S08 werden freie Passwortwerte, Teilstrings und semantische Detailbefunde
verworfen. Serverseitig darf danach nur `supportive-s08-resume-v1` liegen: drei IDs vorgegebener
Passphrasen, kanonische Konten-/Relationsflags und der inhaltsfreie Checkpoint S08–S17. Strings,
Spans, freie Bezeichner und Analysedetails bleiben verboten. Der Zustand wird am Artefaktabschluss
gelöscht und nie exportiert.

Atomar gespeicherte Instrumentblöcke werden nicht erneut erhoben. SecAware öffnet den letzten
bestätigten Seiteneinstieg. Geht der Rückkehrschlüssel verloren, wird keine Sitzung über E-Mail,
Antworten oder Forschungs-ID gesucht.

### Abschluss und Timing

Sobald Artefakt, Pre, Post und Guardrails vollständig persistiert sind, setzt die letzte
erforderliche Submission den Run atomar auf `completed`, invalidiert Resume und terminiert bei
Opt-in das Follow-up. Debriefing und Abschlussbildschirm benötigen keinen statusbestimmenden Klick.
Nur `completed` Runs gehen in die Analyse.

Offline-Zeit zwischen Browser-Sitzungen zählt nicht mit. Auswertbar ist ausschließlich die Summe
bestätigter Web-Artefaktintervalle; Unterbrechungen werden als technisches Qualitätsflag berichtet.

### Follow-up und Datenabschluss

Die freiwillige Nachbefragung läuft als tokenisierte Route derselben Webanwendung. Der Versand
erfolgt kontrolliert über das Universitätskonto; es gibt keine externe Plattform, keinen
Antwortimport und keine verzögerte Debrief-Mail. Kontaktkopien werden spätestens sieben Tage nach
dem letzten Follow-up-Fenster gemäß Data Contract gelöscht.

Drei Zeitpunkte bleiben getrennt:

1. Hauptstudien-Versions-Freeze vor Rekrutierungsbeginn;
2. Datenerhebungsschluss bei `resumeCloseAt`;
3. Datensatz-Freeze und Anonymisierung nach Abschluss aller Follow-ups.

`docs/research/DATA-CONTRACT.md` definiert Anonymisierung, Fristen und Archivdatensatz.

## Konsequenzen

`localStorage`, IndexedDB und Service Worker bleiben für Teilnehmer- und Trainingszustand
unzulässig. Analyseexporte vor dem Datensatz-Freeze sind pseudonymisierte Arbeitsdaten. Die lokale
Lease und historische Statuswerte bleiben nur für Legacy-Datensätze lesbar.

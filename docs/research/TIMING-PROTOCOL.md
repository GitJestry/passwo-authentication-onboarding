# Timing Protocol

Status: **kanonische implementierte Zeitdefinition der Webstudie.**
Das Wiederaufnahmemodell steht in `ADR 0016-Web-Resume-Lifecycle`; das frühere
Lease-/`incomplete-reload`-Verhalten gilt nur für lokale oder historische Sitzungen.

## Metriken

### Primär konditionsübergreifend

`artifactSessionElapsedMs = Summe aller bestätigten Artefakt-Sitzungsintervalle`

Ein Sitzungsintervall misst die verstrichene Zeit innerhalb einer geöffneten Browser-Sitzung vom
bestätigten Start bis zum bestätigten Ende oder zur technischen Unterbrechung. Ein bloßer
Sichtbarkeitswechsel pausiert die primäre Dauer nicht; verborgene Zeit bleibt wie bisher enthalten
und wird zusätzlich diagnostisch markiert. Nur die Offline-Zeit zwischen getrennten
Browser-Sitzungen wird nicht mitgezählt. Die Definition gilt für beide Bedingungen gleich.

Für ununterbrochene Sitzungen entspricht `artifactSessionElapsedMs` der bisherigen
`artifactWallClockMs`. Das Web-Schemaprofil erhält dafür ein neues eindeutig benanntes Feld; das
historische Feld wird nicht still mit einer neuen Semantik weiterverwendet.

### Diagnostisch im PassWo-Artefakt

- `segmentSessionElapsedMs` je S00–S17;
- optional entsprechende Abschnittsdauer für Passwort, Passwortmanager und MFA;
- Sichtbarkeitsereignisse;
- Anzahl und Dauer technischer Unterbrechungen.

Segmentzeiten werden nicht gegen SecAware-Segmentzeiten getestet, weil dessen interne Struktur
nicht gleich instrumentierbar ist.

## Uhren und Intervalle

- Innerhalb einer geöffneten Browser-Sitzung misst `performance.now()` die monotone verstrichene
  Dauer.
- Der Server bestätigt Start und Ende jedes Sitzungsintervalls idempotent.
- Auditzeitpunkte dienen der technischen Nachvollziehbarkeit und nicht der primären Dauermessung.
- Systemuhränderungen verändern die innerhalb eines Sitzungsintervalls gemessene Dauer nicht.
- Die Zeit zwischen zwei Browser-Sitzungen wird nicht als Bearbeitungszeit rekonstruiert.

## Ereignisse

```text
start | pause | resume | end | visibility-hidden | visibility-visible | technical-interruption
```

Jedes Ereignis besitzt pro Session eine streng steigende Sequenznummer. Die Datenbank verhindert
Doppelübermittlung durch `UNIQUE(session_id, sequence)`.

Ein neues Sitzungsintervall beginnt nur an einem bestätigten sicheren Checkpoint. Ein unterbrochener
flüchtiger Trainingsschritt wird nicht zeitlich an seinen alten Clientzustand angehängt, sondern
beginnt mit neuem Intervall erneut.

## Unterbrechungen

Browser-Schließen, Reload und Verbindungsverlust sind technische Unterbrechungen:

- der Run bleibt `in-progress`;
- das aktuelle Sitzungsintervall endet am letzten bestätigten Ereignis;
- nach Wiederaufnahme beginnt ein neues Sitzungsintervall;
- Offline-Zeit wird nicht mitgezählt;
- die completed Sitzung erhält ein Unterbrechungsflag.

Die Unterbrechungszahl bleibt als technische Metainformation verfügbar. Sie belegt weder
Aufmerksamkeit noch gewissenhafte Teilnahme und löst keinen automatischen Ausschluss aus.
Der Analyseexport enthält die Gesamtzeit, keine zusätzlichen Intervall- oder Ereignistabellen.

## Grenzen

- Timer werden ausschließlich durch Statechart-Transitions gesteuert.
- Eine sichtbare Stoppuhr ist nicht vorgesehen.
- Animationen und Dialoge steuern den Timer nicht selbst.
- Im Referenzpfad gehört das native SecAware-Quiz nicht zum administrierten Messpfad; der definierte
  Referenz-Completion-Event beendet das Artefaktintervall.
- Im PassWo-Pfad werden Sichtbarkeitswechsel und Unterbrechungen diagnostisch markiert.
- Nur regulär `completed` Runs werden ausgewertet.

## Fehlerfälle

- Ein fehlgeschlagener methodisch relevanter Timing-Write blockiert den betreffenden Übergang und
  erlaubt denselben idempotenten Retry.
- Der Export übernimmt die bestätigte Gesamtdauer ohne Plausibilitätsflags, Korrektur oder
  automatische Aussonderung kurzer oder langer Bearbeitungen. Die technische Validierung
  endlicher, nicht negativer Dauern bleibt bestehen.
- Geht der Rückkehrschlüssel verloren, wird keine Offline-Zeit geschätzt und keine alte Sitzung über
  E-Mail oder Antworten gesucht.
- Lokale historische Sitzungen mit `incomplete-reload` bleiben lesbar, werden aber nicht nachträglich
  in das neue Resume-Modell umgedeutet.

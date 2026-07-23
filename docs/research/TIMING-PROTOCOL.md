# Timing Protocol

## Metriken

### Primär konditionsübergreifend

`artifactWallClockMs = artifactEnd - artifactStart`

Diese Dauer umfasst die gesamte Zeit vom Start des zugewiesenen Artefakts bis zum definierten
Abschluss. Sie wird für beide Bedingungen gleich interpretiert.

### Diagnostisch im PassWo-Artefakt

- `segmentWallClockMs` je S00–S17;
- optional `sectionWallClockMs` für Passwort, Passwortmanager und MFA;
- Sichtbarkeitsereignisse und technische Unterbrechungen.

Segmentzeiten werden nicht gegen SecAware-Segmentzeiten getestet, weil dessen interne Struktur
nicht gleich instrumentierbar ist.

## Uhren

- Clientdauer: `performance.now()` als monotone Uhr.
- Audit: ISO-Wall-Clock des Clients plus Empfangszeit des Servers.
- Systemuhränderungen beeinflussen die primäre Dauer nicht.

## Ereignisse

```text
start | pause | resume | end | visibility-hidden | visibility-visible | technical-abort
```

Jedes Ereignis besitzt pro Session eine streng steigende Sequenznummer. Die Datenbank verhindert
Doppelübermittlung durch `UNIQUE(session_id, sequence)`.

## Grenzen

- Timer werden durch Statechart-Transitions gestartet und beendet.
- Eine sichtbare Stoppuhr ist nicht vorgesehen.
- Animationen und Dialoge dürfen den Timer nicht selbst steuern.
- Im Referenzpfad ist der Studien-Tab während der externen Bearbeitung erwartungsgemäß verborgen;
  diese Zeit wird nicht als Inaktivität abgezogen.
- Im PassWo-Pfad werden verborgene Intervalle diagnostisch markiert, aber die primäre Wall-Clock
  läuft weiter.

## Fehlerfälle

- Fehlgeschlagenes Timing-Write blockiert den nächsten methodisch relevanten Übergang und zeigt
  eine neutrale technische Meldung.
- Bei Reload wird kein neuer `performance.now()`-Abschnitt an den alten Trainingszustand
  angehängt; Sitzung wird unvollständig.
- Negative oder unplausibel große Deltas werden beim Export als Qualitätsflag markiert, nicht
  still korrigiert.

# Reference Condition: SecAware.NRW

## Eingefrorener lokaler Stand

Für die Referenzbedingung ist der am 2026-07-26 lokal bereitgestellte Snapshot eingefroren. Seine
sichtbare Kennzeichnung lautet `V10 (03.07.2026)`. Daraus folgt keine Aussage, dass dieser Stand
die neueste Veröffentlichung ist. Die vollständige Reproduzierbarkeitsakte steht in
`research/derived/reference-artifact.yaml` und enthält:

- exakte URL und Zugriffspfad;
- Zugriffsdatum;
- sichtbare Modul-/Plattformversion, falls vorhanden;
- Sprache und Delivery-Format;
- geforderter Abschlussweg;
- eingebettete Checks und unmittelbares Feedback;
- beobachtete Medien-, Navigations- und Interaktionsstruktur;
- Änderungen zwischen Pretest und Study Freeze.

## Integrationsregel

Der private Snapshot bleibt unverändert unter `research/private` und wird ausschließlich vom
lokalen Study Server unter `/reference/secaware/passwords-authentication/` ausgeliefert. Der
SCORM-Einstieg läuft über den im Snapshot enthaltenen Treiber mit `StandAlone=true`. Der
Studienwrapper bettet den Inhalt nicht ein und verändert nur Zugangsanweisung, Timingstart,
Rückkehrbestätigung und die gemeinsame Nachbefragung. Ein im Snapshot beobachteter, für die
Ausführung nicht notwendiger Articulate-Metrikaufruf wird durch die Content-Security-Policy der
lokalen Route blockiert.

## Abschlusskriterium

Das Training muss mindestens einmal über den lokalen Link geöffnet worden sein. Danach bestätigt
die Person nach der Rückkehr den Abschluss im Studienwrapper. Der Wrapper übernimmt kein
Completion-Signal, keinen Quizstatus und keine sonstigen Daten aus dem fremden DOM. Das Schließen
des Training-Tabs beendet das Artefakt nicht automatisch. Die Studienleitung dokumentiert
Abbrüche oder technische Abweichungen.

## Vergleichsgrenzen

- Primär vergleichbar ist die Gesamtartefaktzeit.
- Medienformat, Länge, Pacing, Feedback und visuelle Gestaltung bleiben Teil des jeweiligen
  Gesamtartefakts.
- Kürzere Zeit ist nicht automatisch besser; sie wird zusammen mit Abdeckung und Guardrails
  interpretiert.
- Kein Ergebnis wird einem einzelnen PassWo-Prinzip kausal zugeschrieben.

## Offline-/Ausfallplan

Vor einer Reference Study prüft `pnpm study:start` Quellpfad, Einstiegspunkt, Snapshot-ID,
Referenzversion und deterministischen Dateimanifesthash. Fehlt der private Snapshot oder stimmt er
nicht mit dem Freeze überein, startet der Studienbetrieb nicht. Die Runtime blockiert zusätzlich
die Erstellung einer Reference Session mit einem technischen Fehler. Es gibt keinen inhaltlich
veränderten Ersatzpfad.

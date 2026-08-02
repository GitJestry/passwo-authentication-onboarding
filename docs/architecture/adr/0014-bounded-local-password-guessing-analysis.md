# ADR 0014 — Begrenzte lokale Passwort-Rateweganalyse

- **Status:** Accepted
- **Datum:** 2026-08-03
- **Citation label:** `ADR 0014-Bounded-Password-Guessing`
- **Ergänzt:** ADR 0002, ADR 0003 und ADR 0007

## Kontext

Segment S05 muss die drei im Trainingsskript erklärten Angriffsstrategien auf die fiktive
Passwortwahl anwenden: naheliegende Bestandteile, vorhersehbare Strukturen und freies
Ausprobieren. S06 benötigt anschließend einen reproduzierbaren Verzweigungswert dafür, ob die
begrenzte Simulation einen entsprechend kurzen vollständigen Rateweg erkannt hat. Die Arbeit
entwickelt und validiert jedoch keinen neuen Password Strength Meter. Eine eigene umfangreiche
Cracking-Engine, ein Sprachmodell oder eine externe Leak-Abfrage würden den Forschungsgegenstand
verschieben, zusätzliche Datenschutzgrenzen erzeugen und eine nicht leistbare Validierung
verlangen.

Passwort-Guessability hängt vom Angreifermodell, den verwendeten Wörterbüchern, der Sprache und
der Guessing-Strategie ab. Ein einzelner erkannter Bestandteil oder die sichtbare Länge allein
liefert deshalb kein belastbares allgemeines Sicherheitsurteil. Gleichzeitig muss die
Teilnehmeroberfläche deterministisch, lokal und erklärbar bleiben.

## Entscheidung

`@passwo/password-analysis` verwendet `zxcvbn-ts` in einer eingefrorenen lokalen Konfiguration
als etablierte Pattern- und Guessing-Basis. Eingebunden werden die Pakete `core`,
`language-common`, `language-de` und `language-en` sowie die allgemeinen Tastaturgraphen. Die
jeweilige Kontobezeichnung und wenige authored Kontextbegriffe werden ausschließlich als lokale
`userInputs` übergeben. Es werden weder Netzwerkmatcher noch externe Kompromittierungsdienste,
KI-Modelle oder dynamisch geladene Wörterbücher verwendet.

Die Entscheidung für S06 beruht ausschließlich auf der von zxcvbn-ts geschätzten Kandidatenzahl
des günstigsten **vollständigen** Ratewegs für die gesamte Zeichenfolge:

```text
quick-path-recognized
    iff completeEstimatedGuesses <= 100000
```

`100000` ist eine studienspezifische, bewusst niedrige Simulationsgrenze. Sie ist weder ein
NIST-Grenzwert noch eine allgemeine Definition eines starken oder schwachen Passworts. Der
zxcvbn-Score `0` bis `4` und die von der Bibliothek angebotenen Crack-Time-Ausgaben werden nicht
verwendet. Die Runtime speichert nur die begrenzte Disposition, die geschätzte Kandidatenzahl, die
Schwelle, die Längenorientierung und eine Konfigurationsversion im flüchtigen Trainingszustand.
Diese Daten werden nicht als Forschungsoutcomes persistiert oder exportiert.

Die sichtbare Länge bleibt eine getrennte Orientierung. Für selbst erstellte Passwörter wird
`unter 15` beziehungsweise `mindestens 15` ausgewiesen. Länge überschreibt den vollständigen
Rateweg nicht: Eine lange vorhersehbare Zeichenfolge kann weiterhin einen kurzen Rateweg besitzen;
eine kürzere nicht erkannte Zeichenfolge wird umgekehrt nicht als sicher zertifiziert.

Die automatische Darstellung darf ausschließlich belegte Pattern benennen, etwa häufige
Passwortkerne, Wörter, Namen, Tastaturmuster, Folgen, Daten, Wiederholungen, typische
Transformationen und authored Konto- oder Dienstbegriffe. Persönliche Bedeutung, gemeinsames
Thema und Satz- oder Phrasenstruktur werden nicht aus der Zeichenfolge behauptet. Dafür enthält
S05 eine lokale Selbsteinordnung mit der ausdrücklichen Ausweichoption
`Nichts davon oder unsicher`. Sie bleibt flüchtig, verlangt keine inhaltlichen Details und
verändert die binäre Simulationsentscheidung nicht.

Systemgenerierte Sechs-Wort-Folgen aus S08 werden nicht durch die S05-Heuristik zertifiziert.
Ihre Begründung beruht auf dem bekannten, versionierten Erzeugungsprozess.

## Angreifermodell

Die Darstellung nimmt einen fiktiven Offline-Prüfkontext nach einem Datenleck an. Der Angreifer
kann Kandidaten aus allgemeinen Wörterbüchern, typischen Transformationen, Folgen,
Tastaturmustern, Wiederholungen und dem bekannten fiktiven Kontokontext kombinieren. Nicht
modelliert werden insbesondere der konkrete Hashalgorithmus, Hardwareleistung, Phishing,
Malware, reale persönliche Daten, zielgerichtete Informationen aus fremden Datenlecks oder eine
exakte Crack-Zeit.

Die Aussage `quick-path-recognized` bedeutet daher nur, dass die eingefrorene begrenzte
Konfiguration einen vollständigen Kandidatenweg innerhalb des festgelegten Budgets erkannt hat.
`no-quick-path-recognized` bedeutet nur, dass innerhalb dieses Modells kein solcher Weg erkannt
wurde.

## Datenschutz- und Architekturgrenze

- Fiktive Passwörter werden ausschließlich im Browser verarbeitet.
- Passwörter, Matches, semantische Selbsteinordnungen und Diagnosen werden nicht an den Server
  gesendet, persistiert, geloggt oder in Telemetrie aufgenommen.
- Das Serverpaket importiert `@passwo/password-analysis` nicht.
- Die Analyse bleibt frei von React, Rendering, Storage, Netzwerk und Studienexportlogik.
- Teilnehmertexte verwenden keine Aussagen wie `sicher`, `bestanden`, `garantiert stark` oder
  eine exakte Crack-Zeit.

## Konsequenzen

- `@zxcvbn-ts/*` ist eine neue Core-Abhängigkeit und wird mit exakter Version im Manifest und im
  Lockfile eingefroren.
- Änderungen an Schwelle, Wörterbüchern, Konto-Kontexten, Match-Projektion oder Teilnehmertexten
  benötigen eine neue Analyse- beziehungsweise Content-Version.
- Ein synthetischer, versionierter Testkorpus prüft repräsentative häufige Passwörter,
  Transformationen, Konto-Kontexte, Wiederholungen, freie Zeichenfolgen, Unicode-Grenzen und
  die Trennung von Rateweg und Länge. Dieser Korpus belegt Reproduzierbarkeit der begrenzten
  Trainingslogik, nicht allgemeine Sensitivität oder Spezifität eines Password Strength Meters.
- S07 priorisiert einen erkannten kurzen vollständigen Rateweg vor der getrennten
  15-Zeichen-Orientierung. Beide bleiben von Wiederverwendung, abgeleiteten Varianten und
  Abrufbarkeit getrennt.

## Verworfene Alternativen

### Generative KI oder Sprachmodell

Verworfen wegen fehlender deterministischer Reproduzierbarkeit, nicht kalibrierter semantischer
Behauptungen, zusätzlicher Datenschutz- und Verfügbarkeitsgrenzen sowie einer Verschiebung des
Thesisziels.

### Eigener vollständiger Passwortmeter

Verworfen, weil Entwicklung und externe Validierung eines neuen Guessing-Modells außerhalb des
Thesisumfangs liegen.

### Reine Länge oder Zeichenklassen-Checkliste

Verworfen, weil sie menschliche Muster nicht angemessen abbildet und lange vorhersehbare
Zeichenfolgen beziehungsweise kurze systemgenerierte Zeichenfolgen falsch einordnen kann.

### Externe Pwned-Password-Abfrage

Verworfen, weil die Übung keine realen Passwörter verarbeitet, keine Netzübertragung benötigt und
die externe Abfrage eine unnötige Datenschutz- und Verfügbarkeitsabhängigkeit erzeugen würde.

# ADR 0014 — Begrenzte lokale Passwort-Kandidatenanalyse

- **Status:** Accepted
- **Datum:** 2026-08-03
- **Ergänzt am:** 2026-08-08 um flüchtige fiktive Kontoidentifikatoren, begrenzte authored Fuzzy-Erkennung und eine presentation-only Kompositzerlegung
- **Geändert am:** 2026-08-11: numerische Guess-Schwelle entfernt; Vollpasswort-Trefferregel und getrennte Längenorientierung eingeführt
- **Citation label:** `ADR 0014-Bounded-Password-Guessing`
- **Ergänzt:** ADR 0002, ADR 0003 und ADR 0007

## Kontext

Segment S05 muss die drei im Trainingsskript erklärten Angriffsstrategien auf die fiktive
Passwortwahl anwenden: naheliegende Bestandteile, vorhersehbare Strukturen und freies
Ausprobieren. S06 benötigt anschließend einen reproduzierbaren Verzweigungswert dafür, ob die
begrenzte Simulation das **vollständige** fiktive Passwort über einen der dargestellten frühen
Kandidatenwege erreicht. Die Arbeit entwickelt und validiert jedoch keinen neuen Password
Strength Meter.

Die zuvor verwendete Regel `estimatedGuesses <= 100000` vermischte zwei Ebenen: zxcvbns
numerisches Guessability-Modell und die didaktische Frage, ob ein im Training erklärter Kandidat
das vollständige Passwort abdeckt. Das wurde besonders bei zufällig wirkenden Kleinbuchstaben
problematisch: Eine zxcvbn-Schätzung kann dort stark von einem bekannten Zufallsgenerator mit
26 Möglichkeiten pro Position abweichen. Für das Training ist deshalb weder eine eigene
Nachkalibrierung der zxcvbn-Guess-Zahlen noch eine neue Schwelle zu rechtfertigen.

Gleichzeitig soll die Treffersemantik an die für Blocklisten relevante Vollwert-Idee angelehnt
sein: NIST SP 800-63B verlangt beim Blocklistenvergleich den Vergleich des **gesamten**
prospektiven Passworts und nennt unter anderem häufig verwendete, erwartbare sowie
kontextspezifische Werte und Ableitungen davon. PassWo übernimmt daraus ausschließlich die
Vollpasswort-Semantik als didaktische Leitlinie. Die Trainingssimulation ist keine produktive
NIST-Blocklist und keine Konformitätsimplementierung.

## Entscheidung

`@passwo/password-analysis` verwendet `zxcvbn-ts` in einer eingefrorenen lokalen Konfiguration
weiterhin als Pattern-Basis. Eingebunden werden `core`, `language-common`, `language-de` und
`language-en` sowie die allgemeinen Tastaturgraphen. Die jeweilige Kontobezeichnung, wenige
authored Kontextbegriffe sowie der lokal aus der flüchtigen Trainingsidentität abgeleitete
fiktive Benutzername und die fiktive Konto-Mail werden ausschließlich als lokale `userInputs`
übergeben. Diese Identifikatoren werden für jedes der drei fiktiven Konten separat abgeleitet und
weder persistiert noch exportiert.

zxcvbn-Score, Crack-Time-Ausgaben, `result.guesses` und `result.guessesLog10` werden weder in der
PassWo-Disposition noch in Teilnehmertexten verwendet oder aus `@passwo/password-analysis`
exportiert. zxcvbn darf intern sein eigenes Scoring nutzen, um eine Pattern-Sequenz zu bestimmen;
PassWo übernimmt daraus nur erklärbare Match-Spans und Pattern-Typen.

### Vollpasswort-Trefferregel

Die lokale Disposition kennt genau zwei Ergebnisfamilien:

```text
whole-password-recognized
no-whole-password-recognized
```

`whole-password-recognized` gilt nur, wenn einer der folgenden begrenzten Wege die **gesamte
fiktive Zeichenfolge** abdeckt:

1. **Ein einzelner früher Kandidat:** Ein konkreter Befund für häufiges Passwort/Wort/Name,
   Tastaturmuster, Folge, Datum/Jahr, Wiederholung, vorhersehbare Wortfolge oder authored
   Konto-/Dienstbegriff spannt von Anfang bis Ende über das vollständige Passwort.
2. **Eine begrenzte typische Variante eines einzelnen Kerns:** Ein erkannter früher Kern am
   Anfang wird ausschließlich durch bereits authored begrenzte Varianten ergänzt, konkret einen
   typischen Zahlen-/Symbolanhang oder ein direkt anschließendes Jahr/Datum; zwischen Kern und
   Jahr/Datum ist höchstens ein einzelnes `-`, `_` oder `.` als Verbindung zulässig. Eine direkt
   anschließende typische Endinterpunktion bleibt ebenfalls innerhalb dieses Variantenwegs.
3. **Begrenzte Transformation desselben vollständigen Kandidaten:** Ein durch die vorhandene
   Leetspeak-/Großschreibungs-/authored Fuzzy-Regel erkannter vollständiger Kandidat wird als
   `whole-password-recognized-bounded-variant` ausgewiesen.

Mehrere voneinander unabhängige Teiltreffer werden **nicht** zu einem künstlichen Volltreffer
zusammenaddiert. Zwei erkannte Wörter, die gemeinsam die sichtbare Zeichenfolge abdecken, zeigen
relevante Bestandteile; daraus folgt noch nicht, dass ihre konkrete Reihenfolge und Verbindung
bereits als ein einzelner früher Kandidat modelliert ist.

Die Regel ist damit blocklistenartig in ihrer Semantik, aber bewusst breiter in den erklärten
lokalen Pattern-Typen. Sie sagt nicht, dass ein realer Verifier genau diese Regeln verwenden soll.

### Länge bleibt unabhängig

Für selbst erstellte Passwörter wird weiterhin separat `below-15` beziehungsweise `at-least-15`
ausgewiesen. Die Längenorientierung kann die Vollpasswort-Trefferregel weder erzeugen noch
überschreiben:

- `< 15` bedeutet **nicht** automatisch `whole-password-recognized`;
- nur Kleinbuchstaben bedeuten **nicht** automatisch `whole-password-recognized`;
- `>= 15` bedeutet **nicht** automatisch `no-whole-password-recognized`;
- Zeichenklassen erzeugen keine zusätzliche Bewertungsregel.

Damit kann ein kurzer, in den dargestellten Wegen nicht erkannter Zufallsstring gleichzeitig
`no-whole-password-recognized` und `below-15` sein. Ein langes, vollständig erkanntes Muster kann
umgekehrt `whole-password-recognized` und `at-least-15` sein.

### Komponenten und persönliche Angaben

Die automatische Darstellung darf ausschließlich belegte Pattern benennen, etwa häufige
Passwortkerne, Wörter, Namen, Tastaturmuster, Folgen, Daten, Wiederholungen, typische
Transformationen, authored Konto- oder Dienstbegriffe und Treffer der lokalen fiktiven
Kontoidentifikatoren. Authored Kontextbegriffe dürfen case-insensitive, über die festgelegten
Leetspeak-Ersetzungen und mit höchstens einer einzelnen Damerau-Levenshtein-Abweichung für Tokens
ab fünf Zeichen erkannt werden.

Ein vollständiger authored Konto-/Dienstwert oder ein vollständiger lokaler fiktiver
Kontoidentifikator kann deshalb unmittelbar als früher Vollpasswort-Kandidat gelten. Er erhält
keine künstliche numerische Gewichtung.

Die von Teilnehmenden in S05 manuell markierte Kategorie `Persönliche Angaben` bleibt dagegen
eine lokale semantische Selbsteinordnung. Sie verlangt keine Details, wird nicht persistiert und
wird wegen der absichtlich payloadlosen S05→S06-Grenze nicht zur S06-Disposition transportiert.
Ein in S05 vollständig markierter persönlicher Bereich darf in der unmittelbaren
Kategorie-Rückmeldung als vollständig abdeckender Kandidat erklärt werden; die segmentübergreifende
Disposition beruht ausschließlich auf reproduzierbaren, automatisch belegten lokalen Befunden.
Diese Grenze verhindert, dass aus einer transienten Selbstangabe eine scheinbar objektive
Passwortdiagnose wird.

### Erklärende Zusatzprojektionen

Wenn zxcvbn eine Wiederholung modelliert, darf die strikt kürzere Basiskomponente zusätzlich mit
derselben lokalen Konfiguration analysiert werden. Eine zweite lokale Projektion ohne
Wörterbücher darf belegte Tastatur-, Datums- und Folgenmuster sichtbar halten, die sonst innerhalb
der Basis verdrängt würden.

Vollständige alphabetische Läufe dürfen für die Darstellung zusätzlich exakt und
case-insensitive aus den eingefrorenen Wörterbüchern zerlegt werden. Diese Kompositzerlegung und
reine Verbindungszeichen erzeugen keine Vollpasswort-Disposition. Sie dienen ausschließlich dazu,
die im Training besprochenen Bestandteile sichtbar zu machen.

Systemgenerierte Sechs-Wort-Folgen aus S08 werden nicht durch die S05-Heuristik zertifiziert.
Ihre Begründung beruht auf dem bekannten, versionierten Erzeugungsprozess.

## Angreifermodell

Die Darstellung nimmt einen fiktiven Offline-Prüfkontext nach einem Datenleck an. Der Angreifer
kann Kandidaten aus allgemeinen Wörterbüchern, typischen Transformationen, Folgen,
Tastaturmustern, Wiederholungen, dem bekannten fiktiven Kontokontext und den lokal erzeugten
fiktiven Kontoidentifikatoren bilden. Nicht modelliert werden insbesondere der konkrete
Hashalgorithmus, Hardwareleistung, Phishing, Malware, Daten realer Konten, zielgerichtete
Informationen aus fremden Datenlecks oder eine exakte Crack-Zeit.

`whole-password-recognized` bedeutet daher ausschließlich, dass ein explizit begrenzter früher
Kandidat oder Variantenweg die vollständige fiktive Zeichenfolge abdeckt.
`no-whole-password-recognized` bedeutet ausschließlich, dass in diesen dargestellten Wegen kein
solcher Volltreffer belegt wurde. Die Gegenkategorie ist kein `strong`, `secure` oder
`uncrackable`.

## Datenschutz- und Architekturgrenze

- Fiktive Passwörter werden ausschließlich im Browser verarbeitet.
- Passwörter, Matches, semantische Selbsteinordnungen und Diagnosen werden nicht an den Server
  gesendet, persistiert, geloggt oder in Telemetrie aufgenommen.
- Das Serverpaket importiert `@passwo/password-analysis` nicht.
- Die Analyse bleibt frei von React, Rendering, Storage, Netzwerk und Studienexportlogik.
- Teilnehmertexte verwenden keine Aussagen wie `sicher`, `bestanden`, `garantiert stark` oder
  eine exakte Crack-Zeit.

## Konsequenzen

- `@zxcvbn-ts/*` bleibt eine eingefrorene Core-Abhängigkeit für lokale Pattern-Erkennung.
- Änderungen an Wörterbüchern, Konto-Kontexten, lokalen Kontoidentifikatoren,
  Match-Projektion, Vollpasswort-Regeln oder Teilnehmertexten benötigen eine neue Analyse-
  beziehungsweise Content-Version.
- `PasswordGuessPathAnalysis` exportiert keine geschätzte Kandidatenzahl mehr; die numerischen
  zxcvbn-Werte können daher nicht versehentlich zur Teilnehmerentscheidung oder zu einem
  Forschungsoutcome werden.
- Ein Volltreffer führt die IDs seiner kausalen automatischen Befunde ausschließlich im
  flüchtigen lokalen Dispositionszustand. Die UI darf damit die Begründung filtern, aber keine
  eigene Trefferlogik ableiten; die IDs werden weder persistiert noch exportiert.
- Ein synthetischer, versionierter Testkorpus schützt Volltreffer, begrenzte Varianten,
  Teiltreffer, zufällig wirkende Zeichenfolgen, Unicode-Grenzen und die Unabhängigkeit der
  15-Zeichen-Orientierung. Dieser Korpus belegt Reproduzierbarkeit der Trainingslogik, keine
  allgemeine Sensitivität oder Spezifität eines Password Strength Meters.
- S06 öffnet den tatsächlichen Vorfallspfad nur bei `whole-password-recognized`; S07 führt diese
  Semantik als lokale Problemklasse fort.

## Verworfene Alternativen

### Numerische zxcvbn-Guess-Schwelle

Verworfen, weil eine bibliotheksinterne Guess-Schätzung keine boolesche Aussage darüber ist, ob
einer der im Training dargestellten frühen Kandidaten das vollständige Passwort abdeckt. Eine
neue projektspezifische Kalibrierung würde faktisch einen eigenen Password Strength Meter
erfordern.

### Automatisch `< 12` oder `< 15` als „gefunden“ behandeln

Verworfen, weil Länge und konkreter Kandidatentreffer unterschiedliche Aussagen sind. Ein
fehlender Volltreffer darf bei einem kurzen Passwort nicht als positive Sicherheitsbewertung
erscheinen; er darf aber ebenso wenig in einen erfundenen Treffer umgedeutet werden.

### Kleinbuchstaben unter 15 automatisch als „gefunden“ behandeln

Verworfen, weil Zeichenklassen keine eigenständige Treffersemantik liefern und weil ein bekannt
zufälliger Generator anders zu beurteilen ist als eine menschlich gewählte Zeichenfolge mit
gleichem sichtbaren Alphabet.

### Generative KI oder Sprachmodell

Verworfen wegen fehlender deterministischer Reproduzierbarkeit, nicht kalibrierter semantischer
Behauptungen, zusätzlicher Datenschutz- und Verfügbarkeitsgrenzen sowie einer Verschiebung des
Thesisziels.

### Eigener vollständiger Passwortmeter

Verworfen, weil Entwicklung und externe Validierung eines neuen Guessing-Modells außerhalb des
Thesisumfangs liegen.

### Externe Pwned-Password-Abfrage

Verworfen, weil die Übung keine realen Passwörter verarbeitet, keine Netzübertragung benötigt und
die externe Abfrage eine unnötige Datenschutz- und Verfügbarkeitsabhängigkeit erzeugen würde.

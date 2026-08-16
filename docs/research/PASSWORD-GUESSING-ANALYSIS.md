# Begrenzte Passwort-Kandidatenanalyse in S05 und S06

## Zweck und Claim-Grenze

Diese Spezifikation dokumentiert die lokale adaptive Trainingslogik für S05 und S06. Sie
beschreibt keinen produktiven Password Strength Meter, keine Verifier-Blocklist und keine
empirische Messvariable. Die Logik soll:

- konkrete, im Training erklärte Ansatzpunkte reproduzierbar erkennen;
- das vollständige fiktive Passwort nur bei einem dokumentierten begrenzten Kandidatenweg als
  gefunden behandeln;
- dieselbe Entscheidung in S05 und S06 verwenden;
- Länge getrennt als Handlungsempfehlung behandeln;
- keine allgemeine Aussage `stark`, `sicher`, `bestanden` oder `unknackbar` erzeugen.

Kanonische Architekturentscheidung: `ADR 0014-Bounded-Password-Guessing`.

## Wissenschaftliche Einordnung

NIST SP 800-63B-4 verlangt für produktive Verifier den Vergleich des vollständigen prospektiven
Passworts mit häufig verwendeten, erwartbaren, kompromittierten und kontextspezifischen Werten
sowie naheliegenden Ableitungen. NIST verlangt nicht, jedes beliebige enthaltene Wörterbuchwort
als Blocklist-Treffer zu behandeln. Außerdem gilt für ein Passwort als alleinigen Faktor eine
Mindestlänge von 15 Zeichen; zusätzliche Zeichentyp-Kompositionsregeln sollen nicht erzwungen
werden.

zxcvbn sucht Wörterbuchtreffer und weitere Muster und wählt anschließend eine nicht überlappende
Sequenz für sein eigenes Guessability-Modell. Diese Sequenz ist keine erschöpfende Liste aller
belegten Teilstrings. PassWo nutzt zxcvbn deshalb ausschließlich als lokale Musterquelle und
übernimmt weder Score noch Guess-Zahl oder Crack-Zeit.

Für Passphrasen ist die Erzeugungsmethode entscheidend. Die S07/S08-Passphrase beruht auf einer
bekannten versionierten zufälligen Wortauswahl. S05 kann aus der bloßen Sichtbarkeit mehrerer
gewöhnlicher Wörter nicht dieselbe Zufallsannahme ableiten. Die S05-Regel enthält deshalb nur eine
bewusste Enthaltung: Ab fünf verschiedenen gewöhnlichen Wörtern erzeugt Wörterbuchabdeckung allein
keinen positiven Treffer. Das ist keine positive Sicherheitsbewertung.

Technische Referenzen:

- NIST SP 800-63B-4, Abschnitt *Password Authenticators*.
- Daniel Lowe Wheeler: *zxcvbn: Low-Budget Password Strength Estimation*, USENIX Security 2016.
- Offizielle hashcat-Dokumentation zu Rule-, Hybrid-, Mask- und Combinator-Angriffen als
  Beispiele dafür, dass bekannte Wörter mit endlichen Masken, Regeln und Kombinationen erweitert
  werden können.
- EFF Dice-Generated Passphrases als Beispiel einer Sicherheitserklärung aus einer bekannten
  zufälligen Erzeugungsmethode.

## Datenschutz und zulässige Eingaben

Zulässig sind ausschließlich:

- das im Training erzeugte fiktive Passwort;
- wenige versionierte Konto- und Dienstbegriffe des fiktiven Szenarios;
- lokal aus der fiktiven Trainingsidentität abgeleitete Benutzer- und Kontoidentifikatoren.

Nicht zulässig sind reale Passwörter, reale Konten, externe Leak-Abfragen, Netzwerkzugriffe,
Persistenz, Telemetrie oder Export der Analyse. Manuell in S05 markierte persönliche Bereiche
bleiben flüchtiger UI-Zustand und werden nicht zur scheinbar objektiven S06-Diagnose.

## Eingefrorene Konfiguration

| Bestandteil | Wert |
|---|---|
| Analyse-ID | `passwo-bounded-whole-recognition-v11` |
| Engine | `zxcvbn-ts` als Musterquelle |
| Core | `@zxcvbn-ts/core@4.1.2` |
| Allgemeines Wörterbuch/Graphen | `@zxcvbn-ts/language-common@4.1.2` |
| Deutsch | `@zxcvbn-ts/language-de@4.1.1` |
| Englisch | `@zxcvbn-ts/language-en@4.1.1` |
| zxcvbn-Levenshtein | deaktiviert |
| authored Kontextmatch | case-insensitive, eingefrorene Leetspeak-Ersetzungen, höchstens eine begrenzte Damerau-Levenshtein-Abweichung für ausreichend lange Begriffe |
| Maximale Eingabe | 128 UTF-16-Codeeinheiten; Längenorientierung nach Unicode-Codepoints |
| Längenorientierung | mindestens 15 Zeichen für selbst erstellte Passwörter |
| Restzeichenbudget | höchstens `100_000_000` Kandidaten innerhalb einer eingefrorenen Familie |
| Passphrase-Enthaltung | mindestens fünf verschiedene gewöhnliche Wörter/Namen ohne stärkeren konkreten Anker |
| Externe Matcher | keine |

## Verarbeitungsmodell

### 1. Musterquellen

`analyzeFictionalPassword` ruft zxcvbn-ts lokal mit der vollständigen Zeichenfolge und den
zulässigen Kontextwerten als `userInputs` auf. Übernommen werden ausschließlich Match-Spans und
Pattern-Typen für:

- häufige Passwortwerte;
- gewöhnliche Wörter und Namen;
- Konto- und Dienstbezüge;
- Tastaturmuster;
- Jahre und Daten;
- einfache Zeichen- oder Wortfolgen;
- Wiederholungen;
- typische Transformationen und Endungen.

`result.guesses`, `guessesLog10`, Score und Crack-Zeiten werden weder exportiert noch zur
Disposition verwendet.

### 2. Ergänzende Wörterbuchprojektion

Da zxcvbns optimale Sequenz alternative Treffer verdecken kann, werden alphabetische Läufe
zusätzlich exakt gegen die eingefrorenen Passwort-, Wort- und Namenslisten geprüft.

Unterstützte Grenzen sind:

- Anfang und Ende des alphabetischen Laufs;
- Klein-zu-Großschreibung, etwa `Passwort|Suppe`;
- Akronym-zu-Titelwort, etwa `BVB|Test`;
- eine lückenlose vollständige Zerlegung eines kleingeschriebenen Laufs.

Unbekannte Bereiche bleiben möglich und löschen angrenzende Befunde nicht. Die Projektion darf
keine beliebigen inneren Teilstrings erzeugen. Bei `Klarissa` werden deshalb nicht frei `Klar` und
`larissa` herausgeschnitten. Bei `KlarissaBVBTestPasswort` können dagegen die sichtbaren Grenzen
`Klarissa | BVB | Test | Passwort` genutzt werden.

### 3. Konto-/Dienstvorrang

Exakte oder authored begrenzt veränderte Konto-/Dienstspans haben Vorrang. Wörterbuchspans, die
vollständig darin liegen, werden unterdrückt:

```text
Campusgram   -> Kontobezug
nicht zusätzlich: Campus + gram

C4mpu5Gram! -> veränderter Kontobezug + vorhandene weitere Befunde
nicht zusätzlich: Gram als konkurrierender Wörterbuchkern
```

Diese Regel ändert keine UI-Komponente. Sie bereinigt ausschließlich die interne Befundmenge, aus
der bestehende Projektionen gespeist werden.

### 4. Kanonische nicht überlappende Evidenz

Für die Vollpasswort-Disposition wird eine kanonische Teilmenge gewählt. Die Auswahl:

1. maximiert die belegte Zeichenabdeckung;
2. verwendet bei gleicher Abdeckung weniger Spans;
3. bevorzugt bei weiterem Gleichstand Konto-/Dienstbezug, Wiederholung, Tastatur/Folge,
   Datum/Jahr, Passwortlistenwert, gewöhnliches Wort/Name und zuletzt typische Endung;
4. ist bei vollständigem Gleichstand lexikografisch deterministisch.

Die Oberfläche berechnet keine zweite Auswahl oder Bewertung.

## Vollpasswort-Disposition

### Direkter Treffer

`whole-password-recognized-value` gilt, wenn ein einzelner zulässiger Befund die gesamte
Zeichenfolge abdeckt. Beispiele sind ein vollständiger gelisteter Passwortwert, ein einzelnes
gewöhnliches Wort, ein Konto-/Dienstbegriff, eine Wiederholung, eine Folge oder ein Tastaturmuster.

`whole-password-recognized-bounded-variant` gilt bei einer deckungsgleichen belegten
Transformation oder beim nachfolgend beschriebenen begrenzten Variantenweg.

### Begrenzter Variantenweg

Aus den kanonischen Spans werden semantische Anker und nicht abgedeckte Codepoints bestimmt.
Typische Endungen sind belegte Modifikatoren, aber kein eigenständiger semantischer Anker.

Für `k` semantische Anker und `r` Restzeichen umfasst die Kandidatenfamilie:

```text
alphabetSize(rest)^r
× multisetPermutations(anchors)
× binomial(r + k, k)
```

`binomial(r + k, k)` verteilt die Restzeichen auf alle `k + 1` Positionen vor, zwischen und nach
den Ankern. Deshalb hängt die Entscheidung nicht davon ab, ob derselbe Rest vor, zwischen oder
nach erkannten Bestandteilen steht.

#### Restalphabete

| Enthaltene Restzeichen | Verwendete Größe |
|---|---:|
| `a-z` | 26 |
| `a-zäöüß` | 30 |
| `A-Z` | 26 |
| `A-ZÄÖÜ` | 29 |
| `0-9` | 10 |
| druckbare ASCII-Interpunktion/Leerzeichen | 33 |

Bei Mischungen werden die beteiligten Größen addiert. Nicht unterstützte Unicode-Zeichen liefern
keinen positiven Restweg.

Die Familie muss höchstens `100_000_000` Kandidaten enthalten. Die Grenze ist so gesetzt, dass
fünf beliebige ASCII-Kleinbuchstaben um einen einzelnen klaren Anker positionsunabhängig
vollständig abgedeckt sind:

```text
26^5 × 6 = 71_288_256
```

Sechs Kleinbuchstaben liegen bereits darüber:

```text
26^6 × 7 = 2_162_410_432 > 100_000_000
```

Die genaue große Zahl ist für den Teilnehmertext ohne Bedeutung. Relevant ist nur die eingefrorene
binäre Regel. Sie ist weder eine Zeitprognose noch eine allgemeine Stärkeformel.

Für zwei verschiedene Anker und vier Kleinbuchstaben gilt einschließlich beider Ankerreihenfolgen
und aller Verteilungen:

```text
26^4 × 2 × binomial(6, 2) = 13_709_280
```

Daher erhalten alle folgenden Formen denselben positiven internen Weg:

```text
PasswortmklhSuppe
PasswortSuppemlkh
mklhPasswortSuppe
```

Bei fünf Kleinbuchstaben zwischen denselben zwei Ankern liegt die Familie oberhalb der Grenze und
die Restzeichenregel enthält sich, sofern kein anderer konkreter Befund greift.

### Bereits erklärte Veränderungen

Restzeichen werden erst nach der Befunderfassung berechnet. Erkannte Jahre, Zahlen-/Symbolenden,
Folgen, Wiederholungen, Tastaturmuster oder Transformationen sind daher keine unerklärten Reste.
`Passwort123?!` kann aufgrund seiner konkreten Befunde gefunden werden, auch wenn eine gleich
lange beliebige Mischfolge außerhalb der Restfamilie läge.

## Wörterketten und Passphrase-shaped Eingaben

Die Trainingsregel unterscheidet nicht allgemein zwischen „sicherer Passphrase“ und „unsicherer
Wörterkette“. Dafür wäre die bekannte Wortauswahl- und Zufallsmethode erforderlich.

Sie verwendet nur diese begrenzte Entscheidung:

- ein einzelnes gewöhnliches Wort kann ein direkter Treffer sein;
- zwei bis vier vollständig erkannte gewöhnliche Wörter/Namen können als einfache
  Wörteraneinanderreihung in der begrenzten Kandidatenfamilie liegen;
- ab fünf verschiedenen gewöhnlichen Wörtern/Namen reicht Wörterbuchabdeckung **allein** nicht
  für einen Treffer;
- ein konkreter stärkerer Anker oder ein Muster kann die Eingabe weiterhin finden;
- wiederholte Wörter erhalten keine Passphrase-Enthaltung.

Beispiele:

| Eingabe | Wörterbuch-only-Disposition | Begründung |
|---|---|---|
| `Kaffee` | gefunden | einzelner vollständiger Kandidat |
| `KaffeeMorgen` | gefunden | kurze einfache Wörteraneinanderreihung |
| `KaffeeMorgenSonneLampe` | gefunden | viergliedrige Wörteraneinanderreihung innerhalb der authored Grenze |
| `KaffeeMorgenSonneLampeFenster` | nicht allein dadurch gefunden | fünf verschiedene gewöhnliche Wörter; passphrase-shaped Enthaltung |
| `KaffeeMorgenPasswortSonneLampe` | kann gefunden werden | expliziter Passwortlistenanker `Passwort` |
| `KaffeeKaffeeKaffeeKaffeeKaffee` | kann gefunden werden | Wiederholung statt unabhängiger Wortauswahl |

`no-whole-password-recognized` bleibt auch hier eine Enthaltung und kein grünes Licht.

## Länge

Länge wird separat als Unicode-Codepoint-Anzahl bestimmt:

```text
below-15
at-least-15
```

Die Längenorientierung ist keine Eingabe in die Kandidatenentscheidung. Daraus folgen vier
zulässige Kombinationen:

| Kandidatenprüfung | Länge | Bedeutung innerhalb des Trainings |
|---|---|---|
| gefunden | unter 15 | konkreter früher Weg plus nicht erfüllte Längenorientierung |
| gefunden | mindestens 15 | Länge erreicht, aber konkreter früher Weg vorhanden |
| nicht gefunden | unter 15 | kein positiver Weg in der begrenzten Prüfung; Länge dennoch zu kurz |
| nicht gefunden | mindestens 15 | beide begrenzten Trainingsbefunde günstig, aber keine allgemeine Sicherheitsgarantie |

Es gibt keine Pflicht für Großbuchstaben, Ziffern oder Sonderzeichen und keinen zusammengefassten
Stärke-Score.

## S05-/S06-Integration

S05 und S06 rufen dieselben Funktionen auf:

```text
analyzeFictionalPassword(...)
determinePasswordSimulationDisposition(...)
```

S05 verwendet die Disposition für die Abschlussauswertung. S06 analysiert jedes der drei
fiktiven Konten erneut mit demselben Paket, denselben lokalen Kontexten und derselben
Konfigurationsversion. Die bestehende S06-Animation erhält nur das kategoriale Ergebnis; sie
enthält keine eigene Passwortbewertung.

## Teststrategie

`password-candidate-corpus.test.ts` enthält 120 verschiedene, vorab erwartete Beispielpasswörter:

- 15 direkte Volltreffer;
- 30 zwei- bis viergliedrige Wörterketten;
- 20 passphrase-shaped Eingaben mit fünf oder sechs verschiedenen Wörtern;
- 25 Restzeichenfälle innerhalb der Grenze;
- 20 Restzeichenfälle außerhalb der Grenze;
- 10 Struktur- und Abgrenzungsfälle.

Der Korpus prüft außerdem:

- gleiche Entscheidung unabhängig von Restposition und Ankerreihenfolge;
- `KlarissaBVBTestPasswort!` ohne freie innere Fragmente `Klar`/`larissa`;
- Vorrang von `Campusgram` beziehungsweise `C4mpu5Gram` gegenüber `Campus`/`gram`;
- gemeinsame Disposition für S05 und S06;
- Unabhängigkeit von der 15-Zeichen-Orientierung;
- Unicode- und nicht unterstützte Restzeichen;
- Wiederholungen, Folgen und Tastaturmuster.

Die Tests validieren die deterministische Implementierung gegen die authored Spezifikation. Sie
messen nicht die Genauigkeit gegenüber realen Passwortkorpora oder realen Angreifern.

## Bekannte Grenzen

- Die Kandidatenfamilie ist bewusst klein und kann reale Treffer auslassen.
- Ein echter Offline-Angriff hängt stark vom Hashverfahren, Salt, Kostenparametern, Hardware,
  Wortlisten, Regeln und Priorisierung ab.
- Die Restalphabetwahl ist eine eingefrorene Trainingsabstraktion. Sie sagt nicht voraus, wann ein
  bestimmter realer Angreifer die Zeichenfolge prüfen würde.
- Die Fünf-Wort-Enthaltung ist keine Passphrase-Zertifizierung. Nur die bekannte zufällige
  S07/S08-Erzeugungsmethode erlaubt eine gesonderte methodische Begründung.
- Die manuelle persönliche Einordnung bleibt flüchtig. Ein nicht automatisch belegtes Kürzel wie
  `BVB` kann intern als kleiner Rest behandelt werden, ohne als persönlicher Bezug behauptet zu
  werden.
- Änderungen an Wörterbüchern oder Analyseparametern erfordern eine neue Version und einen erneut
  geprüften Korpus.

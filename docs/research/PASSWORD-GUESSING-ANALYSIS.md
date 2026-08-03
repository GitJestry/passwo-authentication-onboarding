# Begrenzte Passwort-Rateweganalyse in S05

## Zweck

Diese Spezifikation dokumentiert die adaptive Trainingslogik für S05 bis S07. Sie beschreibt
keinen Produktions-Password-Strength-Meter und keine empirische Messvariable. Die Analyse soll
die drei im Training erklärten Angriffsstrategien auf fiktive Eingaben abbilden, konkrete
Hinweise sichtbar machen und eine reproduzierbare Simulationsverzweigung bereitstellen.

Kanonische Architekturentscheidung: `ADR 0014-Bounded-Password-Guessing`.

## Wissenschaftliche Einordnung

Die Implementierung verwendet zxcvbn-ts als lokale Pattern- und Guessing-Basis. zxcvbn wurde als
Low-Budget-Schätzer entwickelt und kombiniert Wörterbuchtreffer, Transformationen,
Tastaturmuster, Folgen, Wiederholungen, Daten und nicht anderweitig erklärte Bereiche zu einem
günstigen vollständigen Kandidatenweg. Die aktuelle Forschung warnt zugleich davor, einen
Password Strength Meter unabhängig vom Angreifermodell als universelle Wahrheit zu behandeln.
Die PassWo-Implementierung verwendet deshalb weder einen allgemeinen `stark/schwach`-Score noch
eine Crack-Zeit.

Technische Referenzen:

- Daniel Lowe Wheeler: *zxcvbn: Low-Budget Password Strength Estimation*, USENIX Security 2016.
- Wang et al.: *No Single Silver Bullet: Measuring the Accuracy of Password Strength Meters*,
  USENIX Security 2023.
- NIST SP 800-63B-4, Abschnitt Password Authenticators.
- Offizielle zxcvbn-ts-Dokumentation zu Sprachen, Wörterbüchern, Tastaturgraphen und `userInputs`.

## Bedrohungsrahmen

Die fiktive Darstellung nimmt an, dass nach einem Datenleck ein lokal prüfbarer Passwortwert
vorliegt. Der Angreifer kombiniert:

1. naheliegende Bestandteile;
2. vorhersehbare Strukturen und Transformationen;
3. freies Ausprobieren für die verbleibenden Bereiche.

Der bekannte Name des fiktiven Kontos darf als Kontext verwendet werden. Reale persönliche Daten,
reale Kontonamen, zusätzliche Leak-Daten, Phishing, Malware, Hardwareleistung und der konkrete
Hashalgorithmus sind nicht Teil des Modells.

## Eingaben und Datenschutz

Zulässige Eingaben sind ausschließlich:

- das im Training erzeugte fiktive Passwort;
- wenige authored Begriffe des aktuell dargestellten fiktiven Kontos.

Nicht zulässig sind:

- reale Passwörter oder Varianten;
- persönliche Profilinformationen;
- externe Leak-Abfragen;
- Netzwerk-, Storage-, Logging- oder Telemetrieausgaben;
- Übernahme der Analyse in den Forschungsdatenexport.

Die semantische Selbsteinordnung mit Ausweichoption bleibt ausschließlich im S05-Controllerzustand und
wird beim Verlassen des Segments verworfen.

## Eingefrorene Konfiguration

| Bestandteil | Wert |
|---|---|
| Engine | `zxcvbn-ts` |
| Core | `@zxcvbn-ts/core@4.1.2` |
| Allgemeines Wörterbuch und Graphen | `@zxcvbn-ts/language-common@4.1.2` |
| Deutsch | `@zxcvbn-ts/language-de@4.1.1` |
| Englisch | `@zxcvbn-ts/language-en@4.1.1` |
| Konfigurations-ID | `passwo-bounded-guess-path-v2` |
| Maximale analysierte Länge | HTML-Eingabelimit 128 UTF-16-Codeeinheiten; zxcvbn `maxLength=128`; Längenorientierung nach Unicode-Codepoints |
| Levenshtein-Option | deaktiviert |
| Authored S05-Kontext | `Campusgram`, `Campus`, `Nachrichten`, `Gruppen`, `Kontakte`, `Beiträge` |
| Externe Matcher | keine |
| Quick-Path-Budget | 100000 Kandidaten |
| Längenorientierung | 15 Zeichen für selbst erstellte Passwörter |

Das Lockfile muss vor dem Study Freeze exakt dieselben Paketversionen enthalten.

## Abgrenzung von einer produktiven Blocklist

Die zxcvbn-Wörterbücher und authored Kontextbegriffe sind Erkennungshilfen für die didaktische
Zerlegung und den begrenzten vollständigen Rateweg. Sie sind keine produktive NIST-Blocklist und
lehnen keine Teilnehmerwahl ab. Bei einem realen Verifier betrifft der NIST-Vergleich bekannte,
erwartbare oder kompromittierte Werte das vollständige Passwort. S05 verarbeitet dagegen
ausschließlich fiktive Eingaben, darf Teilmuster sichtbar machen und verwendet diese Befunde nur
für die lokale Trainingssimulation. Ein einzelner Wörterbuch- oder Kontexttreffer bestimmt die
Disposition nicht.

## Verarbeitung

### 1. Vollständiger Rateweg

`analyzeFictionalPassword` ruft zxcvbn-ts einmal mit der vollständigen Zeichenfolge und den
authored Konto-Begriffen als `userInputs` auf. Verwendet werden:

- `result.guesses` als geschätzte Kandidatenzahl des vollständigen günstigsten Wegs;
- `result.guessesLog10` ausschließlich als interne Diagnose;
- `result.sequence` zur Projektion erklärbarer Pattern.

Der Bibliotheksscore `0` bis `4` und `crackTimes` werden nicht verwendet.

### 2. Komponenten

Die optimale Sequenz wird in stabile PassWo-Kategorien projiziert:

- häufiger Passwortkern;
- häufiges Wort oder häufiger Name;
- Tastaturmuster;
- Jahr oder Datum;
- einfache Zeichen- oder Wortfolge;
- Wiederholung;
- typische Transformation;
- authored Konto- oder Dienstbegriff;
- typischer Zahlen- oder Symbolanhang.

Zusätzliche deterministische Regeln ergänzen ausschließlich konkret belegte authored Konto-Treffer,
Jahreszahlen und typische Endungen. Kategorien dürfen überlappen. Für die Darstellung werden
Dubletten entfernt und Befunde priorisiert; die Guessing-Entscheidung bleibt unverändert der
vollständigen zxcvbn-Sequenz überlassen.

Ein authored Konto- oder Dienstbegriff darf in der Darstellung auch als veränderter Kontobezug
erscheinen, wenn zxcvbn denselben Bereich sowohl dem lokalen `userInputs`-Wörterbuch als auch
einer konkreten typischen Transformation zuordnet. Beliebige Ähnlichkeit und Levenshtein-Abstände
werden nicht als Kontobezug ausgegeben.

### 3. Strukturen

Die presentation-only Strukturanalyse erkennt nur:

- ausreichend lange exakte Wiederholungen;
- weitere von zxcvbn konkret belegte Wiederholungsmuster und vorhersehbare Komponentenfolgen;
- authored Konto- oder Kontextbegriffe zusammen mit Jahr, Datum, Folge oder Anhang;
- einen Zahlenmarker zusammen mit einem typischen Anhang.

Sie erfindet keine thematische oder sprachliche Beziehung und beeinflusst nicht die
Quick-Path-Entscheidung.

### 4. Lokale semantische Einordnung

Teilnehmende ordnen ohne Freitext ein, ob ein Bestandteil als persönliche Angabe gedacht war,
mehrere Bestandteile für sie zu demselben Thema gehören oder eine Satz-/Phrasenstruktur bilden. `Nichts davon oder unsicher` ist exklusiv. Die Auswahl:

- bleibt lokal und flüchtig;
- verlangt keine Details;
- wird nicht exportiert;
- beeinflusst weder Kandidatenzahl noch Disposition.

## Simulationsentscheidung

Die Entscheidung ist exakt:

```text
quick-path-recognized
    iff estimatedGuesses <= QUICK_PATH_GUESS_THRESHOLD

QUICK_PATH_GUESS_THRESHOLD = 100000
```

Die Schwelle ist absichtlich niedrig und an den Bereich gebunden, für den die ursprüngliche
zxcvbn-Evaluation besonders belastbare Low-Budget-Aussagen berichtet. In einem fiktiven
Offline-Szenario bedeutet sie nur, dass ein sehr kurzer vollständiger Kandidatenweg erkannt wurde.
Sie wird nicht in Sekunden umgerechnet und nicht als Sicherheitsgrenze dargestellt.

Die Gegenkategorie lautet `no-quick-path-recognized`, nicht `strong` oder `secure`. Ein nicht
erkannter Weg kann an den Grenzen von Wörterbuch, Sprache, Kontext oder Guessing-Modell liegen.

## Rolle der Länge

Die sichtbare Länge wird unabhängig von der Kandidatenentscheidung als Unicode-Codepoint-Anzahl
bestimmt:

- `below-15`;
- `at-least-15`.

Die 15-Zeichen-Orientierung folgt der aktuellen NIST-Anforderung für Passwörter als alleinigen
Faktor. Sie ist eine Handlungsempfehlung für selbst erstellte Passwörter, keine mathematische
Zertifizierung. Deshalb gilt:

- ein langes, vorhersehbares Passwort kann `quick-path-recognized` sein;
- ein kurzes, nicht erkanntes Passwort bleibt `no-quick-path-recognized` plus `below-15`;
- Zeichenklassen werden nicht als Pflicht oder Sicherheitsbeweis verwendet.

Die authored Angreifer-Uhr in S05.3 ist ein separates theoretisches Modell mit ausdrücklich
unabhängig zufällig gezogenen Zeichen. Ihre Suchräume werden nicht mit zxcvbn-Werten vermischt.

## Einbindung in S05 bis S07

### S05

- Karte 1 zeigt konkrete Komponentenbefunde.
- Karte 2 zeigt begrenzte Strukturbefunde und die lokale semantische Einordnung.
- Karte 3 zeigt sichtbare Länge, erkannte Bereiche, Restbereiche und die vollständige
  Simulationsdisposition.

### S06

Nur `quick-path-recognized` öffnet den tatsächlichen roten Vorfallspfad. Die Gegenkategorie führt
zum blockierten tatsächlichen Pfad und anschließend gegebenenfalls zur klar gekennzeichneten
hypothetischen Darstellung. Beide Texte bleiben auf die begrenzte Simulation beschränkt.

### S07

Die Diagnose trennt:

- kurzen vollständigen Rateweg;
- Längenorientierung;
- exakte Wiederverwendung;
- abgeleitete Variante;
- Abrufbarkeit.

Die Teilnehmeroberfläche zeigt keine allgemeinen Aussagen wie `für sich sicher` oder `bestanden`.

### S08

Systemgenerierte Sechs-Wort-Folgen erhalten eine eigene Herkunftsbegründung. Sie werden nicht
mithilfe des S05-Guessing-Modells akzeptiert oder abgelehnt.

## Validierung vor dem Freeze

Der synthetische Testkorpus enthält mindestens:

- häufige vollständige Passwörter;
- typische Großschreibung und Leetspeak-Varianten;
- Konto-Begriff plus Jahr/Anhang;
- Tastatur- und Zeichenfolgen;
- exakte Wiederholungen;
- lange vorhersehbare Zeichenfolgen;
- nicht erklärte zufällig wirkende Zeichenfolgen;
- Umlaute und Unicode-Offsetfälle;
- Fälle unmittelbar unter und über dem Quick-Path-Budget;
- Trennung von Quick Path und 15-Zeichen-Orientierung.

Metamorphe Invarianten:

- Großschreibung oder `o -> 0` darf einen bekannten Kern nicht automatisch verbergen.
- Ein einzelnes `!` oder eine Zeichenklasse erzeugt kein Sicherheitsurteil.
- Ein einzelner erkannter Teil macht die vollständige Zeichenfolge nicht automatisch zum Treffer.
- Länge allein bestimmt die Quick-Path-Disposition nicht.
- Semantische Selbsteinordnung verändert die Disposition nicht.
- Kein Ergebnis darf `sicher`, `garantiert`, `bestanden` oder eine exakte Crack-Zeit behaupten.

Der Testkorpus validiert die vorab begrenzte Implementierung und ihre Reproduzierbarkeit. Er ist
keine externe Validierungsstudie eines neuen Password Strength Meters.

## Bekannte Grenzen

- zxcvbn-ts approximiert ausgewählte Guessing-Strategien; andere Angreifer können andere Wege
  finden.
- Wörterbücher sind sprach- und versionsabhängig.
- `userInputs` enthalten nur authored Kontokontext und keine realen zielgerichteten Informationen.
- Die optimierte Sequenz zeigt nicht zwingend jeden semantisch denkbaren Teilstring.
- `no-quick-path-recognized` ist eine Enthaltung von einer positiven Trefferbehauptung, kein
  Sicherheitsnachweis.

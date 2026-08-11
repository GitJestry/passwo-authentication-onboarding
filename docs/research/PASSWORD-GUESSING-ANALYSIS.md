# Begrenzte Passwort-Kandidatenanalyse in S05

## Zweck

Diese Spezifikation dokumentiert die adaptive Trainingslogik für S05 bis S07. Sie beschreibt
keinen Produktions-Password-Strength-Meter und keine empirische Messvariable. Die Analyse soll
die drei im Training erklärten Angriffsstrategien auf fiktive Eingaben abbilden, konkrete
Hinweise sichtbar machen und eine reproduzierbare Simulationsverzweigung bereitstellen.

Kanonische Architekturentscheidung: `ADR 0014-Bounded-Password-Guessing`.

## Wissenschaftliche Einordnung

Die Implementierung verwendet zxcvbn-ts als lokale Pattern-Basis. zxcvbn kombiniert
Wörterbuchtreffer, Transformationen, Tastaturmuster, Folgen, Wiederholungen, Daten und nicht
anderweitig erklärte Bereiche zu einer intern bewerteten Sequenz. PassWo übernimmt aus dieser
Sequenz erklärbare Pattern-Spans, aber keine numerische Guessability-Aussage. Die aktuelle
Forschung warnt davor, einen Password Strength Meter unabhängig vom Angreifermodell als
universelle Wahrheit zu behandeln. Die PassWo-Implementierung verwendet deshalb weder einen
allgemeinen `stark/schwach`-Score noch eine Crack-Zeit oder eine Guess-Schwelle.

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

Der bekannte Name des fiktiven Kontos sowie die lokal erzeugten fiktiven Kontoidentifikatoren
dürfen als Kontext verwendet werden. Reale Konten, zusätzliche Leak-Daten, Phishing, Malware,
Hardwareleistung und der konkrete Hashalgorithmus sind nicht Teil des Modells.

## Eingaben und Datenschutz

Zulässige Eingaben sind ausschließlich:

- das im Training erzeugte fiktive Passwort;
- wenige authored Begriffe des aktuell dargestellten fiktiven Kontos;
- der aus dem flüchtigen Trainingsnamen lokal abgeleitete fiktive Benutzername und die fiktive
  Konto-Mail des jeweils analysierten Kontos.

Nicht zulässig sind:

- reale Passwörter oder Varianten;
- weitere persönliche Profilinformationen;
- externe Leak-Abfragen;
- Netzwerk-, Storage-, Logging- oder Telemetrieausgaben;
- Übernahme der Analyse in den Forschungsdatenexport.

Die semantische Selbsteinordnung mit Ausweichoption bleibt ausschließlich im
S05-Controllerzustand und wird beim Verlassen des Segments verworfen. Sie kann die unmittelbare
Kategorie-Rückmeldung erklären, wird aber nicht als objektiver S06-Befund transportiert.

## Eingefrorene Konfiguration

| Bestandteil | Wert |
|---|---|
| Engine | `zxcvbn-ts` |
| Core | `@zxcvbn-ts/core@4.1.2` |
| Allgemeines Wörterbuch und Graphen | `@zxcvbn-ts/language-common@4.1.2` |
| Deutsch | `@zxcvbn-ts/language-de@4.1.1` |
| Englisch | `@zxcvbn-ts/language-en@4.1.1` |
| Konfigurations-ID | `passwo-bounded-whole-recognition-v9` |
| Maximale analysierte Länge | HTML-Eingabelimit 128 UTF-16-Codeeinheiten; zxcvbn `maxLength=128`; Längenorientierung nach Unicode-Codepoints |
| Levenshtein-Option | zxcvbn-Option deaktiviert; authored Kontextmatch auf höchstens eine begrenzte Abweichung beschränkt |
| Authored Konto-Kontext | kanonische kontospezifische Kataloge für Master Campus, Campus E-Mail und Campusgram; S05 verwendet den Campusgram-Katalog |
| Lokale Kontoidentifikatoren | fiktiver Benutzername und fiktive Konto-Mail des aktuellen Kontos |
| Externe Matcher | keine |
| Vollpasswort-Treffer | einzelner früher Kandidat oder begrenzte typische Variante deckt die vollständige Zeichenfolge ab |
| Längenorientierung | 15 Zeichen für selbst erstellte Passwörter |

Das Lockfile muss vor dem Study Freeze exakt dieselben Paketversionen enthalten.

## Blocklistenartige Vollpasswort-Semantik

Die zxcvbn-Wörterbücher und authored Kontextbegriffe sind Erkennungshilfen für die didaktische
Zerlegung. Sie sind keine produktive NIST-Blocklist und lehnen keine Teilnehmerwahl ab. Die
Treffersemantik übernimmt jedoch bewusst eine zentrale Vollwert-Idee: Beim NIST-Blocklistenabgleich
wird das vollständige prospektive Passwort mit bekannten, häufig verwendeten, erwartbaren oder
kontextspezifischen Werten und Ableitungen verglichen, nicht jeder beliebige Teilstring als
Blocklist-Treffer behandelt.

PassWo verwendet diese Idee nur als didaktische Grenze: Ein einzelner früher Kandidat oder eine
begrenzt authored Variante muss das **gesamte fiktive Passwort** abdecken, bevor die
segmentübergreifende Disposition `whole-password-recognized` lautet. Teilbefunde dürfen weiterhin
sichtbar sein, bestimmen die Disposition aber nicht allein. Das ist keine NIST-Konformitäts- oder
Verifier-Implementierung.

## Verarbeitung

### 1. zxcvbn-Patternpfad

`analyzeFictionalPassword` ruft zxcvbn-ts mit der vollständigen Zeichenfolge, den authored
Konto-Begriffen und den flüchtigen fiktiven Kontoidentifikatoren als `userInputs` auf. Für eine
von zxcvbn belegte Wiederholung wird zusätzlich deren strikt kürzere Basiskomponente mit derselben
lokalen Konfiguration ausgewertet. Eine zweite lokale Projektion ohne Wörterbücher verhindert,
dass ein Wörterbuchtreffer innerhalb dieser Basis belegte Tastatur-, Datums- oder Folgenmuster
verdeckt.

PassWo übernimmt ausschließlich `result.sequence` zur Projektion erklärbarer Pattern.
`result.guesses`, `result.guessesLog10`, der Bibliotheksscore `0` bis `4` und `crackTimes` werden
nicht in den Domain-Contract übernommen, nicht angezeigt und nicht für die Disposition verwendet.
zxcvbn darf diese Werte intern zur Auswahl seiner Sequenz berechnen; PassWo macht daraus keine
eigene numerische Sicherheitsbewertung.

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

Zusätzliche deterministische Regeln ergänzen authored Konto-Treffer, exakte Treffer der lokalen
fiktiven Kontoidentifikatoren, Jahreszahlen, typische Endungen und nummerierte Wiederholungen
desselben Wortes mit mindestens drei aufeinanderfolgenden Markern. Authored Konto- und
Dienstbegriffe werden zusätzlich begrenzt fuzzy geprüft: case-insensitive, mit der eingefrorenen
zxcvbn-Leetspeak-Tabelle einschließlich ein- und mehrzeichiger Ersetzungen sowie höchstens einer
einzelnen Damerau-Levenshtein-Abweichung für Tokens ab fünf Zeichen. Die Prüfung liefert
weiterhin den tatsächlich erkannten Originalspan;
angehängte Satzzeichen bleiben außerhalb des Begriffs, sofern der kürzere Treffer eindeutig ist.
Eine typische Endung setzt Buchstaben im vorangehenden fiktiven Passwort voraus, aber keinen
weiteren Komponentenbefund. Kategorien dürfen überlappen. Insbesondere verdrängt ein
zxcvbn-Wiederholungsmatch die von zxcvbn erkannten Wörterbuch-, Passwort- und Folgenbefunde seiner
Basis nicht. Für die Darstellung werden Dubletten entfernt und Befunde priorisiert. Die
Vollpasswort-Disposition wird anschließend ausschließlich aus den konkret belegten PassWo-Befunden
nach der unten definierten Trefferregel abgeleitet.

Damit die optimale Gesamtsequenz alternative belegte Wörter nicht verdeckt, werden vollständige
alphabetische Läufe zusätzlich deterministisch gegen die eingefrorenen Passwort-, Wort- und
Namenswörterbücher zerlegt. Eine Ergänzung ist nur zulässig, wenn der gesamte Lauf lückenlos aus
belegten Wörtern besteht oder ein einzelnes vollständiges Wörterbuchwort unmittelbar an ein
nicht-alphanumerisches Verbindungszeichen grenzt. Ergänzte Wörter haben mindestens vier
Buchstaben; kürzere Teile sind nur zulässig, wenn zxcvbn selbst genau diesen Span belegt. Bei
mehreren vollständigen Zerlegungen werden zuerst weniger Teile, danach die bestehende
Wörterbuchpriorität und schließlich längere frühere Teile bevorzugt. Die Ergänzung ist exakt und
case-insensitive; Leetspeak, Tippfehler und beliebige innere Teilstrings werden nicht zusätzlich
segmentiert. So bleiben etwa `ich` und `liebe` in `ichliebe-Campusgram4` belegbar, ohne eine freie
sprachliche Tokenisierung einzuführen.

Nicht-alphanumerische Zeichen zwischen zwei belegten Bereichen dürfen in der Oberfläche als
reine Verbindung markiert werden. Sie werden dadurch weder zum Wörterbuchtreffer noch zu einem
neuen Rateweg-Match. Diese Darstellungsbefunde und Verbindungen verändern weder zxcvbns Pattern-Sequenz noch die
Vollpasswort-Disposition.

Ein authored Konto- oder Dienstbegriff oder ein lokaler fiktiver Kontoidentifikator darf in der
Darstellung auch als veränderter Kontobezug erscheinen, sobald der begrenzte authored Matcher den
Originalspan belegt. Ein zusätzlicher deckungsgleicher zxcvbn-Transformationsbefund ist dafür nicht
erforderlich. Die Fuzzy-Regel ist auf die oben genannte Zeichen- und Distanzgrenze beschränkt;
beliebige semantische Ähnlichkeit oder unbeschränkte Levenshtein-Suche werden nicht als Kontobezug
ausgegeben.

### 3. Strukturen

Die presentation-only Strukturanalyse erkennt nur:

- ausreichend lange exakte Wiederholungen;
- weitere von zxcvbn konkret belegte Wiederholungsmuster und vorhersehbare Komponentenfolgen;
- authored Konto- oder Kontextbegriffe zusammen mit Jahr, Datum, Folge oder Anhang;
- einen Zahlenmarker zusammen mit einem typischen Anhang.

Sie erfindet keine thematische oder sprachliche Beziehung und erzeugt nicht durch das
Zusammenaddieren unabhängiger Teilbefunde einen Vollpasswort-Treffer.

### 4. Lokale semantische Einordnung

Teilnehmende ordnen ohne Freitext ein, ob ein Bestandteil als persönliche Angabe gedacht war,
mehrere Bestandteile für sie zu demselben Thema gehören oder eine Satz-/Phrasenstruktur bilden. `Nichts davon oder unsicher` ist exklusiv. Die Auswahl:

- bleibt lokal und flüchtig;
- verlangt keine Details;
- wird nicht exportiert;
- beeinflusst die segmentübergreifende Disposition nicht.

## Simulationsentscheidung

Die Entscheidung ist absichtlich kategorial statt numerisch:

```text
whole-password-recognized-value
    iff ein einzelner zulässiger früher Kandidat die gesamte Zeichenfolge abdeckt

whole-password-recognized-bounded-variant
    iff ein einzelner erkannter Kern plus eine explizit begrenzte typische Variante
        die gesamte Zeichenfolge abdeckt

no-whole-password-recognized
    andernfalls
```

Als direkte Vollwert-Kandidaten gelten die bereits modellierten Kategorien häufiger
Passwortkern/Wort/Name, Tastaturmuster, Jahr/Datum, einfache Zeichen- oder Wortfolge,
Wiederholung und authored Konto-/Dienstbegriff. Eine deckungsgleiche typische Transformation
kennzeichnet den Treffer als begrenzte Variante.

Für einen Variantenweg darf ein einzelner am Anfang erkannter Passwort-/Wort-/Name- oder
Konto-Kern durch einen typischen Zahlen-/Symbolanhang oder ein direkt anschließendes Jahr/Datum
ergänzt werden. Zwischen Kern und Kalenderteil ist höchstens ein einzelnes `-`, `_` oder `.`
zulässig; direkt anschließende typische Endinterpunktion darf den Kalenderteil abschließen.

**Mehrere unabhängige Teilbefunde werden nicht zu einem Volltreffer addiert.** Wenn etwa zwei
Wörter gemeinsam die sichtbare Zeichenfolge abdecken, zeigt die Oberfläche beide Bestandteile;
die konkrete Reihenfolge und Verbindung gelten dadurch noch nicht automatisch als ein einzelner
früh geprüfter Kandidat.

Ein vollständiger authored Konto-/Dienstbegriff oder lokaler fiktiver Kontoidentifikator kann
unmittelbar einen Volltreffer bilden. Dafür wird keine künstliche numerische Gewichtung
eingeführt.

Die Gegenkategorie `no-whole-password-recognized` ist eine Enthaltung von einer positiven
Trefferbehauptung, kein `strong`, `secure` oder `uncrackable`.

## Rolle der Länge

Die sichtbare Länge wird unabhängig von der Kandidatenentscheidung als Unicode-Codepoint-Anzahl
bestimmt:

- `below-15`;
- `at-least-15`.

Die 15-Zeichen-Orientierung folgt der aktuellen NIST-Anforderung für Passwörter als alleinigen
Faktor. Sie ist eine Handlungsempfehlung für selbst erstellte Passwörter, keine mathematische
Zertifizierung. Deshalb gilt:

- ein langes Passwort kann trotz erfüllter Längenorientierung `whole-password-recognized` sein,
  wenn ein früher Kandidat das vollständige Passwort abdeckt;
- ein kurzes, in diesen Prüfungen nicht vollständig erkanntes Passwort bleibt
  `no-whole-password-recognized` plus `below-15`;
- `< 12`, `< 15` oder ausschließlich Kleinbuchstaben erzeugen **keinen** Volltreffer;
- Zeichenklassen werden nicht als Pflicht oder Sicherheitsbeweis verwendet.

Die authored Angreifer-Uhr in S05.3 ist ein separates theoretisches Modell mit ausdrücklich
unabhängig zufällig gezogenen Zeichen. Ihre Suchräume werden nicht mit zxcvbn-Werten oder der
Vollpasswort-Disposition vermischt.

## Einbindung in S05 bis S07

### S05

- Karte 1 zeigt konkrete Komponentenbefunde.
- Karte 2 zeigt begrenzte Strukturbefunde und die lokale semantische Einordnung.
- Karte 3 zeigt sichtbare Länge, erkannte Bereiche, Restbereiche und die vollständige
  Simulationsdisposition.

### S06

Nur `whole-password-recognized` öffnet den tatsächlichen roten Vorfallspfad. Die Gegenkategorie führt
zum blockierten tatsächlichen Pfad und anschließend gegebenenfalls zur klar gekennzeichneten
hypothetischen Darstellung. Beide Texte bleiben auf die begrenzte Simulation beschränkt.

### S07

Die Diagnose trennt:

- vollständigen frühen Kandidatentreffer;
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
- typische Großschreibung, Leetspeak-Varianten wie `ch4t!` für `Chat` und eine einzelne
  begrenzte Zeichenabweichung;
- lückenlos belegte aneinandergereihte Wörter sowie vollständige Wörter an `-`, `_`, `;` und
  anderen nicht-alphanumerischen Verbindungen;
- Konto-Begriff plus Jahr/Anhang;
- Tastatur- und Zeichenfolgen;
- exakte Wiederholungen;
- lange vorhersehbare Zeichenfolgen;
- nicht erklärte zufällig wirkende Zeichenfolgen;
- Umlaute und Unicode-Offsetfälle;
- ein einzelner Vollwert-Kandidat;
- ein begrenzter Kern-plus-Anhang/Jahr-Variantenweg;
- mehrere Teilbefunde, die gemeinsam den String abdecken, aber keinen einzelnen Kandidaten bilden;
- Trennung von Vollpasswort-Treffer und 15-Zeichen-Orientierung.

Metamorphe Invarianten:

- Großschreibung oder `o -> 0` darf einen bekannten Kern nicht automatisch verbergen.
- Ein einzelnes `!` oder eine Zeichenklasse erzeugt kein Sicherheitsurteil.
- Ein einzelner erkannter Teil macht die vollständige Zeichenfolge nicht automatisch zum Treffer.
- Ein Wörterbuchwort innerhalb eines nicht vollständig zerlegbaren alphabetischen Laufs erzeugt
  durch die Zusatzprojektion keinen freien inneren Teiltreffer.
- Länge allein bestimmt die Vollpasswort-Disposition nicht.
- Semantische Selbsteinordnung verändert die Disposition nicht.
- Kein Ergebnis darf `sicher`, `garantiert`, `bestanden` oder eine exakte Crack-Zeit behaupten.

Der Testkorpus validiert die vorab begrenzte Implementierung und ihre Reproduzierbarkeit. Er ist
keine externe Validierungsstudie eines neuen Password Strength Meters.

## Bekannte Grenzen

- zxcvbn-ts approximiert ausgewählte Guessing-Strategien; andere Angreifer können andere Wege
  finden.
- Wörterbücher sind sprach- und versionsabhängig.
- `userInputs` enthalten authored Kontokontext sowie ausschließlich lokal abgeleitete fiktive
  Kontoidentifikatoren und keine Daten realer Konten oder fremder Datenlecks.
- Die optimierte Sequenz zeigt nicht zwingend jeden semantisch denkbaren Teilstring.
- Die begrenzte Kompositzerlegung findet nur lückenlos durch die eingefrorenen Wörterbücher oder
  bereits vorhandene zxcvbn-Spans belegte alphabetische Läufe.
- `no-whole-password-recognized` ist eine Enthaltung von einer positiven Trefferbehauptung, kein
  Sicherheitsnachweis.
- Die manuelle S05-Markierung persönlicher Angaben bleibt absichtlich flüchtig und wird nicht als
  scheinbar objektiver Befund nach S06 transportiert; automatisch abgeleitete fiktive
  Kontoidentifikatoren bleiben dagegen reproduzierbare Kontextkandidaten.

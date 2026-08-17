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

Für zxcvbn-`repeat`-Matches bleiben die von der Engine bereits bestimmten flüchtigen Metadaten
`baseToken` und `repeatCount` am lokalen Guess-Path erhalten. Sie verändern weder Evidenzspan noch
Bewertung: Ein Core-Befund für `????` bleibt ein Span über `????`; erst die S05-Darstellung kann
daraus vier Vorkommen von `?` projizieren. Die Metadaten werden nicht persistiert oder exportiert.

Für Passphrasen ist die Erzeugungsmethode entscheidend. Die S07/S08-Passphrase beruht auf einer
bekannten versionierten zufälligen Wortauswahl. S05 kann aus der bloßen Sichtbarkeit mehrerer
gewöhnlicher Wörter nicht dieselbe Zufallsannahme ableiten. Die S05-Regel verwendet deshalb keine
Wortanzahl als automatische Treffer- oder Sicherheitsgrenze. Eine Mehrwortfolge benötigt einen
konkreten automatischen Kandidatenweg oder eine bereits im Training erhobene, bestätigte
semantische Relation. Das ist keine positive Sicherheitsbewertung.

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
Persistenz, Telemetrie oder Export der Analyse. Manuell in S05 bestätigte persönliche,
inhaltliche und Satz-/Phrasenrelationen bleiben flüchtiger Laufzeitzustand. Sie dürfen dieselbe
begrenzte Kandidatenentscheidung in S05 und S06 ergänzen, werden aber weder als objektive Semantik
noch als Forschungsvariable gespeichert.

## Eingefrorene Konfiguration

| Bestandteil | Wert |
|---|---|
| Analyse-ID | `passwo-bounded-whole-recognition-v14` |
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
| Mehrwortregel | Wörterbuchabdeckung allein erzeugt unabhängig von der Wortanzahl keinen Volltreffer |
| Kurze Wörter | nur exakt als vollständiges sichtbares Segment oder innerhalb einer vollständigen sprachgebundenen Partition |
| Abkürzungen | kleine kuratierte Liste, nur exakte case-insensitive Erkennung |
| Tastaturgrenzen | maximaler eigener QWERTZ-/QWERTY-Span ab fünf Zeichen |
| Semantische Evidenz | bestätigte persönliche, inhaltliche oder Satz-/Phrasenrelationen; nur flüchtig und additiv |
| Strukturelle Trennzeichen | ein bis drei druckbare ASCII-Zeichen zwischen zwei semantischen Ankern |
| Wiederholungsvariation | exakte getrennte Wiederholung oder genau eine begrenzte Änderung bei ausreichend langen Teilen |
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
zusätzlich exakt gegen die eingefrorenen Passwort- und Wortlisten geprüft. Deutsche und englische
Partitionen werden getrennt berechnet; Wörter beider Sprachen werden nicht frei zu einer einzigen
Mischpartition kombiniert. Namenslisten bleiben für vollständige sichtbare Segmente verfügbar,
werden aber nicht zur freien inneren Zerlegung verwendet.

Unterstützte Grenzen sind:

- Anfang und Ende des alphabetischen Laufs;
- Klein-zu-Großschreibung, etwa `Passwort|Suppe`;
- Akronym-zu-Titelwort, etwa `BVB|Test`;
- eine lückenlose vollständige Zerlegung eines kleingeschriebenen Laufs.

Zwei- und Drei-Zeichen-Wörter wie `ich`, `bis`, `zum` oder `uni` werden nur aufgenommen, wenn sie
ein vollständiges sichtbares Segment oder einen Teil einer lückenlosen Partition bilden. Dadurch
werden kurze deutsche Funktionswörter berücksichtigt, ohne zufällige innere Fragmente allgemein
zu erlauben.

Eine kleine eingefrorene Liste gebräuchlicher Abkürzungen wie `LKW`, `DVD`, `DHL`, `LOL`, `USB`
und `WLAN` wird nach denselben Grenzen ausschließlich exakt und case-insensitive berücksichtigt.
Für kurze Wörter und Abkürzungen gibt es weder Leetspeak-Varianten noch Edit-Distance.

Unbekannte Bereiche bleiben möglich und löschen angrenzende Befunde nicht. Die Projektion darf
keine beliebigen inneren Teilstrings erzeugen. Bei `Klarissa` werden deshalb nicht frei `Klar` und
`larissa` herausgeschnitten. Bei `KlarissaBVBTestPasswort` können dagegen die sichtbaren Grenzen
`Klarissa | BVB | Test | Passwort` genutzt werden.

Ein Passwortlistenanker, der nur an einer Seite auf einer unterstützten Grenze liegt, darf keine
weitere sichtbare Grenze innerhalb seines Spans überqueren. Damit bleibt eine kurze freie
Erweiterung an einem Rand möglich, ein inneres Kollisionsfragment wie `tRot` über der sichtbaren
Grenze `Ist|Rot` wird aber nicht als eigener Passwortlistenbestandteil übernommen.

Ein Namensfund muss den vollständigen sichtbaren Abschnitt abdecken. Ein partieller Namensfund wie
`ZumMo` in `ZumMond` oder `larissa` in `Klarissa` wird verworfen, sofern er nicht als flüchtiger
authored Kontext vorliegt.

Tastaturfolgen werden zusätzlich unabhängig von zxcvbns Endsequenz über eine kleine eingefrorene
Menge horizontaler QWERTZ-/QWERTY-Reihen vorwärts und rückwärts gesucht. Nur maximale Spans ab
fünf Zeichen werden übernommen. Ihre Grenzen teilen den umgebenden Buchstabenlauf für die
Wortpartition. Deshalb liefert `MeinqwertzStarkesPasswort` die Befunde `Mein`, `qwertz`,
`Starkes` und `Passwort`, statt `Meinqwertz` als unbekannten Gesamtbereich zu behandeln.

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

Die gleiche Spezifitätsregel gilt für Strukturspans: Ein erkanntes Jahr, Datum, eine Folge oder ein
Tastaturmuster bleibt gegenüber einer generischen Endung maßgeblich. `Passwort2026!` wird deshalb
intern als `Passwort | 2026 | !` geführt und nicht als `Passwort | 2026!`.

Eine kleine authored Liste vollständiger trainingsrelevanter Komposita erhält ebenfalls Vorrang
vor vollständig enthaltenen kleineren Wörterbuchtreffern. `Datensicherheit` wird daher als
vollständiger Begriff behandelt und nicht gleichzeitig als `Daten | Sicherheit`. Diese Liste ist
keine allgemeine deutsche Kompositaanalyse.

### 4. Getrennte und begrenzt veränderte Wiederholungen

Die authored Wiederholungsprojektion ergänzt zxcvbns zusammenhängende Wiederholungen um drei eng
begrenzte Fälle:

1. Ein normalisierter alphanumerischer Teil mit mindestens vier Zeichen erscheint mindestens
   zweimal nicht überlappend. Bei vier oder fünf Zeichen sind sichtbare Grenzen an beiden
   Vorkommen erforderlich.
2. Zwei sichtbare Komponenten mit mindestens acht Zeichen unterscheiden sich nach
   Groß-/Kleinschreibungs- und Leetspeak-Normalisierung um genau eine
   Damerau-Levenshtein-Operation.
3. Ein zusammenhängender alphanumerischer Lauf besteht aus zwei nahezu gleich langen Hälften mit
   jeweils mindestens acht Zeichen und genau einer solchen Abweichung.

Die Normalisierung umfasst ausschließlich `$→s`, `0→o`, `1→i`, `3→e`, `4→a`, `5→s`, `7→t` und
`@→a`. Die bestehenden Spans und die Kategorie `repeated-component` werden wiederverwendet. Eine
allgemeine unscharfe Suche oder ein numerischer Ähnlichkeitsscore wird nicht eingeführt.

Beispiele:

```text
IchWiederholeZwischenIchWiederhole
haha242424haha
DatensicherheitDatens1cherheit
datensicherheitdatensxicherheit
```

Bei der einmal veränderten Wiederholung wird der zweite belegte Span zusätzlich mit der bereits
vorhandenen Kategorie `typical-transformation` verbunden.

### 5. Kanonische nicht überlappende Evidenz

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

`whole-password-recognized-semantic-path` gilt, wenn die automatisch belegten Anker und die
bestätigten flüchtigen Relationen gemeinsam die vollständige Zeichenfolge erklären. Die
Disposition enthält dann nur die verwendeten Befund- und Relations-IDs; die Relationen selbst
bleiben im Laufzeitzustand.

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

### Bereits erklärte Veränderungen und Verbindungen

Restzeichen werden erst nach der Befunderfassung berechnet. Erkannte Jahre, Zahlen-/Symbolenden,
Folgen, Wiederholungen, Tastaturmuster oder Transformationen sind daher keine unerklärten Reste.
`Passwort123?!` kann aufgrund seiner konkreten Befunde gefunden werden, auch wenn eine gleich
lange beliebige Mischfolge außerhalb der Restfamilie läge.

Ein bis drei druckbare ASCII-Trennzeichen zwischen zwei ausgewählten semantischen Ankern gelten als
vorhersehbare Verbindung. Sie werden weder als zusätzlicher Anker noch als Schutzgewinn behandelt.
Bei einem bestätigten semantischen Weg dürfen außerdem nur die explizit eingefrorenen
grammatischen Verbindungswörter wie `am`, `im`, `in`, `mit`, `von`, `zum` oder `und` unmarkiert
zwischen markierten Teilen stehen. Andere gewöhnliche Wörter müssen selbst durch mindestens eine
Relation belegt sein.

## Wörter und flüchtige semantische Kandidatenwege

Die Trainingsregel unterscheidet nicht allgemein zwischen „sicherer Passphrase“ und „unsicherer
Wörterkette“. Dafür wäre die bekannte Wortauswahl- und Zufallsmethode erforderlich. Die bloße
Anzahl erkannter Wörter wird daher nicht als allgemeine Trefferregel verwendet.

Es gelten nur diese begrenzten Wege:

- ein einzelnes vollständiges gewöhnliches Wort kann ein direkter Kandidat sein;
- mehrere gewöhnliche Wörter erklären sichtbare Bestandteile, erzeugen allein aber keinen
  Volltreffer;
- ein konkreter automatischer Anker oder ein vollständiges Muster kann die Mehrwortfolge finden;
- eine kleine eingefrorene Liste vollständiger vorhersehbarer Phrasen kann einen direkten Weg
  liefern;
- die bereits vorhandene Teilnehmerreflexion kann einen flüchtigen semantischen Weg bestätigen.

Die flüchtige Evidenz enthält ausschließlich exakte Spans und eine der drei Relationen:

```text
personal-context
shared-content
sentence-or-phrase
```

Persönlicher Kontext benötigt mindestens einen markierten Span; Inhalts- und Satzrelationen
mindestens zwei. Alle Spans werden gegen die aktuelle fiktive Zeichenfolge validiert. Eine
Relation kann einen automatischen Treffer nicht zurücknehmen. Eine Angabe `unabhängig` oder eine
nicht bestätigte Reflexion erzeugt keinen zusätzlichen Weg.

Beispiele:

| Eingabe | Disposition ohne/mit bestätigter Relation | Begründung |
|---|---|---|
| `Kaffee` | gefunden | einzelner vollständiger Kandidat |
| `KaffeeMorgen` | ohne Relation nicht gefunden; mit bestätigtem Zusammenhang gefunden | Wortzahl allein reicht nicht; die Relation eröffnet einen vollständigen semantischen Weg |
| `KaffeeMorgenSonneLampe` | ohne Relation nicht gefunden | vier Wörter sind keine eigene Stärke- oder Trefferformel |
| `KaffeeMorgenSonneLampeFenster` | ohne Relation nicht gefunden | ebenso keine Passphrase-Zertifizierung durch Wortzahl |
| `ichliebedichbiszummond` | gefunden | vollständiger eingefrorener Phrasenkandidat trotz sechs erkannten Wörtern |
| `Passwort123456789qwertzCampusgram!` | gefunden | Passwortanker, Zahlenfolge, Tastaturfolge und Kontobezug bilden gemeinsam einen konkreten automatischen Weg |
| `KaffeeMorgenPasswortSonneLampe` | kann gefunden werden | expliziter Passwortlistenanker `Passwort` |
| `KaffeeKaffeeKaffeeKaffeeKaffee` | kann gefunden werden | Wiederholung statt unabhängiger Wortauswahl |
| `HochzeitAmSchloss1995!` | mit bestätigter Inhaltsrelation gefunden | markierter gemeinsamer Kontext plus Jahr und Endung decken die Zeichenfolge ab |
| `eisichbintotpo` | nur bei vollständiger bestätigter Struktur gefunden | eine Teilrelation darf die übrigen kurzen Wörter nicht miterklären |

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

Die bestehenden S05-Auswahlen werden nach ihrer Bestätigung in
`TransientPasswordSemanticEvidence` projiziert und ausschließlich im Speicher des laufenden
Trainings dem Campusgram-Konto zugeordnet. Das S06-Eingabemodell akzeptiert denselben optionalen
Typ für alle drei Konten. Damit können Master Campus und Campus E-Mail später denselben kurzen
Reflexionsschritt erhalten, ohne die Disposition oder die Visualisierung neu zu implementieren.
Aktuell wird die Evidenz nur in S05 erhoben.

### Gerichtete S06-Variantenwege

Die sechs S06-Paarvergleiche sind gerichtet. Nach einer exakten Wiederverwendung erzeugt der
lokale Vergleich vollständige Kandidaten aus dem bekannten Quellpasswort. `derived-variant-match`
gilt nur, wenn ein Kandidat den vollständigen Zielwert trifft und der Weg höchstens aus einer
Hauptveränderung sowie zwei kleinen typischen Veränderungen besteht.

Als Hauptveränderung gelten ausschließlich:

- der Austausch eines authored Konto- oder Dienstbegriffs;
- der Wechsel des Zeichens bei einem vollständigen Wiederholungsmuster gleicher Länge;
- das Entfernen eines durch Zeichenklasse, Trennzeichen oder Camel-Case-Grenze abgegrenzten
  vorangestellten oder angehängten Bestandteils.

Kleine typische Veränderungen sind eine auf zwei Jahre begrenzte Jahresänderung, ein kurzer
Zahlenbestandteil, ein kurzer Zahlen- oder Symbolanhang, Groß-/Kleinschreibung, ein übliches
Trennzeichen, eine eingefrorene typische Leetspeak-Ersetzung oder eine einzelne Einfügung,
Entfernung, Ersetzung beziehungsweise benachbarte Vertauschung. Der Vergleich verwendet diese
Operationen als endliche Kandidatenfamilien, nicht als allgemeinen Edit-Distance-Score.

Der Weg ist absichtlich nicht symmetrisch. `Passwort49u52u` kann durch Entfernen des bekannten
Randbestandteils zu `Passwort` führen. Aus `Passwort` wird der unbekannte längere Rest dagegen
nicht erfunden. Ebenso reichen gemeinsame Teilstrings oder der gleiche allgemeine Satzrahmen
nicht aus; zwei beliebige Wörterbuchwörter werden nicht aus dem Zielwert übernommen. Ein negatives
Ergebnis lautet deshalb `Keine direkte Variante erkannt` und ist weder eine Aussage über fehlende
Gemeinsamkeiten noch eine Sicherheitsgarantie. Alle Eingaben und Vergleichsbefunde bleiben lokal
und flüchtig.

## Teststrategie

`password-candidate-corpus.test.ts` enthält zunächst einen synthetischen Policy-Korpus mit
mindestens 120 verschiedenen, vorab erwarteten Beispielpasswörtern:

- 15 direkte Volltreffer;
- gewöhnliche Wörterketten ohne automatischen Treffer;
- bestätigte semantische Wörterketten;
- längere Wortfolgen ohne konkrete zusätzliche Evidenz;
- 25 Restzeichenfälle innerhalb der Grenze;
- 20 Restzeichenfälle außerhalb der Grenze;
- 10 Struktur- und Abgrenzungsfälle.

Ein zweiter Korpus enthält mindestens 100 verschiedene End-to-End-Eingaben. Jede Eingabe durchläuft
zuerst `analyzeFictionalPassword(...)` und danach
`determinePasswordSimulationDisposition(...)`. Dadurch prüft er die reale Segmentierung und nicht
nur synthetisch vorgegebene Befunde. Enthalten sind gewöhnliche und bestätigte Wörterketten,
Kurzwortpartitionen, Abkürzungen, Tastaturgrenzen, Anker-/Kontext-/Phrasenfälle,
Wiederholungsfälle und negative Grenzfälle.

Die Korpora prüfen außerdem:

- gleiche Entscheidung unabhängig von Restposition und Ankerreihenfolge;
- `KlarissaBVBTestPasswort!` ohne freie innere Fragmente `Klar`/`larissa`;
- `ichliebedichbiszummond` und `IchLiebeDichBisZumMond` mit stabiler kurzer Wortzerlegung;
- `meinstarkesunipasswort2026!` mit getrenntem Uni-Kontext, Jahr und Suffix;
- `MeinqwertzStarkesPasswort` mit Tastaturspan als Grenze für die angrenzende Wortanalyse;
- `Datensicherheit` mit Vorrang des vollständigen Kompositums;
- `eisichbintotpo`, `ichbineineispo`, `ichhabeineispo` und `eisölindapo` mit vollständigen
  Kurzwortpartitionen;
- `LKW`, `DVD`, `LOL` und `DHL` als exakte kuratierte Abkürzungen;
- wiederholte Trennzeichen zwischen erkannten Wörtern;
- Vorrang von `Campusgram` beziehungsweise `C4mpu5Gram` gegenüber `Campus`/`gram`;
- getrennte und einmal veränderte Wiederholungen einschließlich der vier dokumentierten Beispiele;
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
- Keine Wortanzahl ist eine Passphrase-Zertifizierung. Nur die bekannte zufällige
  S07/S08-Erzeugungsmethode erlaubt eine gesonderte methodische Begründung.
- Die semantischen Relationen sind Selbstauskunft innerhalb der Intervention. Sie sind weder
  objektive Passwortmerkmale noch Nachweis, dass ein realer Angreifer dieselbe Information kennt.
- Die aktuellen Master-Campus- und Campus-E-Mail-Pfade akzeptieren bereits flüchtige semantische
  Evidenz, erheben sie aber noch nicht in einer eigenen UI.
- Änderungen an Wörterbüchern oder Analyseparametern erfordern eine neue Version und einen erneut
  geprüften Korpus.

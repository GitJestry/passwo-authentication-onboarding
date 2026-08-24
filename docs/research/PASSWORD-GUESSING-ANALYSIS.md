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
bekannten versionierten zufälligen Wortauswahl. S05 darf aus sichtbaren Wörtern keine gleiche
Zufallsannahme ableiten, kann aber eine transparente Kandidatenfamilie aus eingefrorenen
Wortquellen zählen. Das ist eine begrenzte Übungsentscheidung und keine positive oder negative
Passphrase-Zertifizierung.

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
inhaltliche und Satz-/Phrasenrelationen bleiben flüchtiger Laufzeitzustand. Sie dienen nur der
Reflexion und Visualisierung, verändern die Kandidatenentscheidung nicht und werden weder als
objektive Semantik noch als Forschungsvariable gespeichert.

## Eingefrorene Konfiguration

| Bestandteil | Wert |
|---|---|
| Analyse-ID | `passwo-bounded-whole-recognition-v20` |
| Engine | `zxcvbn-ts` als Musterquelle |
| Core | `@zxcvbn-ts/core@4.1.2` |
| Allgemeines Wörterbuch/Graphen | `@zxcvbn-ts/language-common@4.1.2` |
| Deutsch | `@zxcvbn-ts/language-de@4.1.1` |
| Englisch | `@zxcvbn-ts/language-en@4.1.1` |
| zxcvbn-Levenshtein | deaktiviert |
| authored Kontextmatch | case-insensitive, eingefrorene Leetspeak-Ersetzungen, höchstens eine begrenzte Damerau-Levenshtein-Abweichung für ausreichend lange Begriffe |
| Maximale Eingabe | 128 UTF-16-Codeeinheiten; Längenorientierung nach Unicode-Codepoints |
| Längenorientierung | mindestens 15 Zeichen für selbst erstellte Passwörter |
| Gemeinsame Kandidatengrenze | `26^12 = 95_428_956_661_682_176` für strukturierte Kandidaten, Ein-Anker-Restweg und vollständiges Durchprobieren |
| Vollständiges Durchprobieren | letzter Weg bis einschließlich `26^12 = 95_428_956_661_682_176` Zeichenfolgen |
| Mehrwortregel | jede Wortstelle zählt ihre eingefrorene Quelle; positive Entscheidung nur, wenn die gesamte Familie innerhalb der gemeinsamen Grenze liegt |
| Gewöhnliche Wörter | längenabhängig rangbegrenzte und orthografisch gefilterte deutsche/englische Korpora; kurze Wörter nur als vollständiges sichtbares Segment oder innerhalb einer vollständigen sprachgebundenen Partition |
| Vorhersagbare Wortfolgen | direkte Schreibweise benachbarter Einträge aus genau einer eingefrorenen Sequenzliste; keine gemischten, rückwärts gelesenen oder über Wortgrenzen verschobenen Treffer |
| Abkürzungen | kleine kuratierte Liste, nur exakte case-insensitive Erkennung |
| Tastaturgrenzen | maximaler eigener QWERTZ-/QWERTY-Span ab fünf Zeichen |
| Semantische Evidenz | nur flüchtige Reflexion/Visualisierung; kein Einfluss auf die Disposition |
| Strukturelle Trennzeichen | ein bis drei Wiederholungen desselben eingefrorenen ASCII-Trennzeichens zwischen Kandidatenkomponenten |
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

Auch zxcvbns `wordSequence`-Match wird nicht ungeprüft übernommen. Die Engine kann intern
Treffer aus verschiedenen Sequenzwörterbüchern verbinden und verwirft bei der Projektion, ob ein
einzelner Treffer rückwärts oder mit Zeichenersetzungen entstand. PassWo akzeptiert deshalb nur
eine Folge, wenn der sichtbare Span die gemeldeten Wörter direkt schreibt, alle Wörter in genau
einer eingefrorenen Sequenzliste unmittelbar aufeinanderfolgen und Anfang sowie Ende auf
begründbaren Komponentengrenzen liegen. Dadurch bleibt beispielsweise `einszweidrei` erhalten;
eine Konstruktion wie `einStar` aus `einS → eins` und rückwärts `tar → rat` wird verworfen.

### 2. Ergänzende Wörterbuchprojektion

Da zxcvbns optimale Sequenz alternative Treffer verdecken kann, werden alphabetische Läufe
zusätzlich exakt gegen die eingefrorenen Passwort- und Wortlisten geprüft. Deutsche und englische
Partitionen werden getrennt berechnet; Wörter beider Sprachen werden nicht frei zu einer einzigen
Mischpartition kombiniert. Namenslisten bleiben für vollständige sichtbare Segmente verfügbar,
werden aber nicht zur freien inneren Zerlegung verwendet.

Die ergänzende Projektion verwendet weiterhin die breiten, nach Häufigkeit geordneten
`commonWords-de`- und `commonWords-en`-Korpora. Sie übernimmt weder kurze noch längere Einträge
ungeprüft. Pro Sprache und Wortlänge gilt eine eingefrorene Ranggrenze; zusätzlich werden nur
sprachtypische Buchstabenfolgen mit mindestens einem Vokal zugelassen. Explizite Namens- und
Wikipedia-Listen werden nicht zur freien Wortpartition verwendet. Im Audit bestätigte
Korpusfragmente und Kodierungsartefakte werden gezielt ausgeschlossen. Strukturierte Listen wie
Wochentage, Monate oder Zahlenwörter bleiben als begrenzte Wortquelle verfügbar. Damit bleibt die
Abdeckung gewöhnlicher kurzer Wörter breit, während zufällige Korpuswerte nicht allein aufgrund
einer Teilstring-Übereinstimmung sichtbar werden. Dieselbe Filterung gilt auch ab vier Zeichen.

Unterstützte Grenzen sind:

- Anfang und Ende des alphabetischen Laufs;
- Klein-zu-Großschreibung, etwa `Passwort|Suppe`;
- Akronym-zu-Titelwort, etwa `BVB|Test`;
- eine lückenlose vollständige Zerlegung eines kleingeschriebenen Laufs.

Zwei- und Drei-Zeichen-Wörter wie `es`, `in`, `ich`, `bis`, `zum`, `po`, `öl` oder `the`
werden aus denselben bereinigten Sprachkorpora abgeleitet und nicht auf eine kleine manuelle
Positivliste reduziert. Sie müssen ein vollständiges sichtbares Segment oder einen Teil einer
lückenlosen Partition bilden. Diese Grenze gilt auch für einen von zxcvbn direkt gemeldeten
Kurzworttreffer. Ein isolierter Treffer benötigt zusätzlich zwei sichtbare Grenzen; die lückenlose
kleingeschriebene Partition darf geprüfte kurze Wörter weiterhin intern verwenden. So bleiben
gebräuchliche Funktions- und Alltagswörter berücksichtigt, ohne zufällige innere Fragmente wie
`ml`, `vx`, `pk` oder `tte` als Wörter zu markieren.

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
Die gleiche Einschränkung wird vor der dynamischen vollständigen Wörterbuchpartition angewandt.
Kandidaten dürfen eine sichtbare Grenze nur dann überspannen, wenn beide Kandidatenenden selbst
unterstützte Grenzen sind. Vollständige Passwortlisteneinträge erhalten danach eine zusätzliche
Segmentierungsprüfung: Überspannt ein Eintrag sichtbare Wortgrenzen, ist der vollständige Wert in
keiner unterstützten Sprache selbst ein gewöhnliches Wort und bilden alle sichtbaren Teile in
derselben Sprache gewöhnliche Wörter, bleibt der Vollwert nur als Angriffskandidat erhalten. Er
definiert dann keine sichtbaren Bausteingrenzen. `IchBin` bleibt dadurch für die spätere
Vollwerterkennung verfügbar, wird in der Bausteinansicht aber als `Ich | Bin` projiziert. Ein
sprachlich eigenständiger Vollwert hat Vorrang: `Maiden` und selbst die Schreibvariante `MaiDen`
werden nicht zu den zufällig passenden deutschen Teilwörtern `Mai | den` zerlegt. Die Regel ist
damit keine pauschale CamelCase-Trennung.

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

Ein authored Kontextbegriff darf zugleich keine bereits belegte Wortgrenze kreuzen. Zulässige
Grenzen stammen aus der sichtbaren Schreibweise, aus Buchstaben-Ziffer-Wechseln und aus der
sprachgebundenen Wörterbuchpartition. Damit bleibt `uni` in
`meinstarkesunipasswort2026!` erkennbar, während `Insta` nicht als `inSta` quer über
`Mein|Starkes` projiziert wird. Dieselbe Grenze gilt für exakte, fuzzy und von zxcvbn als
`userInputs` gemeldete Kontexttreffer.

Nach allen Vorrang- und Unterdrückungsregeln werden Transformationsspans noch einmal an ihren
verbliebenen Grundbefund gebunden. Wird etwa ein kleiner Wörterbuchtreffer durch einen
spezifischeren Passwortlisten- oder Kontextbefund ersetzt, darf seine frühere
Großschreibungs-/Leetspeak-Markierung nicht als verwaiste Grenze in der Darstellung verbleiben.

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

Die Disposition beantwortet ausschließlich, ob das vollständige fiktive Passwort in einer der
gezeigten, eingefrorenen Kandidatenfamilien innerhalb der gemeinsamen Übungsgrenze liegt. Sie
liefert keinen Score, keine individuelle Crack-Zeit und keine allgemeine Sicherheitsbewertung.

Die positiven Regel-IDs sind:

```text
whole-password-recognized-value
whole-password-recognized-generated-candidate
whole-password-recognized-single-anchor-residual
whole-password-recognized-exhaustive-search
```

### Direkter vollständiger Kandidat

`whole-password-recognized-value` gilt, wenn ein einzelner zulässiger Befund die vollständige
Zeichenfolge abdeckt. Beispiele sind ein vollständiger gelisteter Passwortwert, ein einzelnes
gewöhnliches Wort, ein authored Konto-/Dienstbegriff, eine vollständige Folge, ein Tastaturmuster
oder eine Wiederholung.

Eine vollständige, typisch veränderte Fassung eines expliziten Passwortankers wird als erzeugter
Kandidat geführt. Dafür werden ausschließlich die eingefrorenen Groß-/Kleinschreibungs- und
zxcvbn-Leet-Ersetzungen sowie höchstens eine zusätzliche Wiederholung eines benachbarten Zeichens
zugelassen. Eine separat erkannte Endung wird vorher abgetrennt. So wird etwa
`M3inPa555w0rt!?` auf den vollständigen Ausgangskandidaten `MeinPasswort` zurückgeführt, ohne eine
freie Edit-Distance zu verwenden.

### Strukturierte Kandidatenfamilie

`whole-password-recognized-generated-candidate` gilt, wenn alle Zeichen durch belegte
Kandidatenquellen, unterstützte Trennzeichen und gegebenenfalls eine typische Endung erzeugt werden
und die vollständige Familie höchstens `26^12` Kandidaten enthält.

Jeder erkannte Bestandteil bringt seine Quellenfamilie mit:

| Quellenklasse | Eingefrorene Größe |
|---|---:|
| gewöhnliches Wort/Name bis drei Zeichen | 350 |
| sonstiges gewöhnliches Wort/Name | 80.000 |
| allgemeiner häufiger Passwortwert | 100.000 |
| expliziter Passwortanker | 32 |
| Konto-/Dienstkontext | 64 |
| Jahr | 200 |
| Datum | 36.600 |
| Tastaturmuster | 10.000 |
| einfache Zeichenfolge | 10.000 |
| vorhersagbare Wortfolge | 10.000 |
| Wiederholungsmuster | 100.000 |

Typische Endungen verwenden entweder eine eingefrorene frühe Liste oder eine begrenzte Familie aus
höchstens vier Ziffern und drei druckbaren ASCII-Symbolen. Ein bis drei Wiederholungen desselben
unterstützten ASCII-Trennzeichens bilden eine von 48 Strukturvorlagen.

Die Größe der erzeugten Familie ist:

```text
Produkt aller Quellenfamilien
× unterschiedliche Anordnungen der Quellenklassen
× Trennzeichen- und Endungsvarianten
```

Gleiche Quellenklassen werden bei den Anordnungen nicht mehrfach permutiert; ihre Reihenfolge ist
bereits im kartesischen Produkt enthalten. Die Zählung wird bei `26^12 + 1` saturiert.

Damit werden erkannte Zielbestandteile nicht mehr kostenlos behandelt. Beispiele:

| Eingabe | Ergebnis innerhalb der Übung | Begründung |
|---|---|---|
| `MeinPasswort` | gefunden | vollständige Kombination früher Quellen |
| `M3inPa555w0rt!?` | gefunden | vollständige begrenzte Variante von `MeinPasswort` |
| `LuftKroneGut` | gefunden | `80.000^3` liegt innerhalb der Grenze |
| `LuftKroneGut123!` | gefunden | Drei-Wort-Familie plus begrenzte Endung |
| `LuftKroneGutAdmin` | gefunden | Drei Wortstellen plus kleine Ankerquelle |
| `KaffeeMorgenPasswortSonneLampe` | nicht über diesen Weg gefunden | vier allgemeine Wortstellen plus Anker überschreiten die Grenze |
| fünf oder sechs zufällige Wörter mit `Admin` | nicht über diesen Weg gefunden | der einzelne Anker macht die übrigen Wortauswahlen nicht kostenlos |

Diese Beispiele sind keine pauschale Regel „drei Wörter schwach, vier Wörter stark“. Sie folgen nur
aus den dokumentierten Quellenfamilien und der authored Übungsgrenze. Die später gelehrte
Passphrase wird separat über ihre bekannte zufällige Erzeugungsmethode begründet.

### Genau ein Anker plus unbekannter Rest

`whole-password-recognized-single-anchor-residual` gilt ausschließlich bei genau einem kanonischen
Kandidatenanker und mindestens einem nicht erklärten Restzeichen. Für `r` Restzeichen wird gezählt:

```text
Quellenfamilie des Ankers
× Restalphabet^r
× (r + 1) mögliche Ankerpositionen
× gegebenenfalls eine separat belegte Endung
```

Das Restalphabet ist die Summe der beobachteten eingefrorenen Klassen:

| Restklasse | Größe |
|---|---:|
| ASCII-Kleinbuchstaben | 26 |
| deutsche Kleinbuchstaben einschließlich `äöüß` | 30 |
| ASCII-Großbuchstaben | 26 |
| deutsche Großbuchstaben einschließlich `ÄÖÜ` | 29 |
| Ziffern | 10 |
| druckbare ASCII-Interpunktion und Leerzeichen | 33 |

Andere Unicode-Zeichen eröffnen keinen positiven Restweg.

`PasswortlOtr` gilt damit als gefunden: Der explizite Anker stammt aus einer kleinen frühen
Quelle, und der vierstellige Mischrest kann innerhalb der gemeinsamen Grenze an jeder möglichen
Position frei durchprobiert werden. Der Sonderweg gilt nicht bei mehreren Ankern. Bei
`PasswortmklhSuppe` darf deshalb weder `Passwort` noch `Suppe` kostenlos gesetzt und nur `mklh`
durchprobiert werden. Die gesamte Kombination muss über ihre Quellenfamilien begründet sein;
andernfalls bleibt nur das vollständige Durchprobieren.

### Teilnehmermarkierungen

`TransientPasswordSemanticEvidence` bleibt als flüchtiger UI- und Controller-Typ erhalten.
Persönliche, inhaltliche und Satz-/Phrasenmarkierungen erklären mögliche Ansatzpunkte, verändern
aber die Disposition nicht. Das ist absichtlich: Eine nachträgliche Markierung des bereits
sichtbaren Passworts ist kein Nachweis vorab bekannten Angreiferwissens und kein vollständiger
Kandidatengenerator.

Für dieselbe Zeichenfolge muss daher gelten:

```text
disposition(withoutSemanticEvidence)
=== disposition(withConfirmedSemanticEvidence)
```

### Vollständiges Durchprobieren als letzter Fundweg

Greift keiner der vorherigen Wege, wird `createFictionalPasswordExhaustiveSearchModel` aufgerufen.
Die Alphabetgröße ergibt sich aus der Vereinigung der beobachteten Zeichenklassen, die Länge aus
den Unicode-Codepoints. Der Weg
`whole-password-recognized-exhaustive-search` gilt bis einschließlich:

```text
26^12 = 95_428_956_661_682_176
```

Bei der Trainingsannahme von einer Billion Versuchen pro Sekunde entspricht das ungefähr
26,5 Stunden. Die Grenze ist dieselbe wie für strukturierte Kandidaten und den Ein-Anker-Restweg.
Sie ist keine reale Crack-Zeit. Andere Unicode-Zeichen verwenden in diesem letzten vollständigen
Suchweg einen endlichen authored Ersatzpool von 128 Zeichen.

Der Weg wird erst nach allen konkreten Kandidatenfamilien geprüft. Er enthält keine `findingIds`;
Suchraum, Eingabe und Zeitwert werden weder persistiert noch exportiert.

## Wörter und Passphrasengrenze

S05 verwendet erkannte Wörter als Kandidatenquellen, nicht als allgemeine Stärkeformel. Die
Wortanzahl allein entscheidet nichts; ausschlaggebend ist die dokumentierte Größe der konkreten
Familie. Zwei oder drei allgemeine Wortstellen können unter der Grenze liegen, vier oder mehr
können darüber liegen. Kurze Wörter verwenden den kleineren, im Training gezeigten Pool von 350
Werten.

Eine positive oder negative S05-Disposition zertifiziert keine Passphrase. Für die spätere
Passphrase sind die zufällige Auswahl aus der versionierten Wortliste, die Wortanzahl und die
einzigartige Verwendung maßgeblich. Ein einzelner vorhersehbarer Bestandteil in einer langen
Passphrase führt nicht automatisch zu einem positiven S05-Treffer, weil alle übrigen Wortstellen
weiter vollständig gezählt werden.

`no-whole-password-recognized` bedeutet nach den strukturierten Wegen zusätzlich, dass auch der
vollständige Suchraum über der authored Grenze liegt. Es bleibt eine Enthaltung und kein grünes
Licht.

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
| gefunden | unter 15 | konkreter Weg oder vollständiges Durchprobieren innerhalb der Grenze; Längenorientierung dennoch nicht erfüllt |
| gefunden | mindestens 15 | Länge erreicht, aber ein positiver begrenzter Fundweg vorhanden |
| nicht gefunden | unter 15 | vollständiges Durchprobieren oberhalb der Grenze; Länge dennoch zu kurz |
| nicht gefunden | mindestens 15 | beide begrenzten Trainingsbefunde günstig, aber keine allgemeine Sicherheitsgarantie |

Es gibt keine Pflicht für Großbuchstaben, Ziffern oder Sonderzeichen und keinen zusammengefassten
Stärke-Score.

## S05-/S06-Integration

S05 und die lokalen Einzelprüfungen in S06 rufen dieselben Funktionen auf:

```text
analyzeFictionalPassword(...)
determinePasswordSimulationDisposition(...)
```

S05 verwendet die Disposition für die Abschlussauswertung. S06 analysiert jedes der drei
fiktiven Konten erneut mit demselben Paket, denselben lokalen Kontexten und derselben
Konfigurationsversion. React, Szenenprojektionen und Teilnehmertexte enthalten keine zweite
Vollpasswort-Trefferlogik.

Die bestehenden S05-Auswahlen können weiterhin als `TransientPasswordSemanticEvidence` im
Controller geführt und an die gemeinsame Funktion übergeben werden. Die Funktion ignoriert diesen
Wert absichtlich. Dadurch bleibt die UI kompatibel, während Markierungen kein Angreiferwissen und
keinen objektiven Treffer mehr erzeugen können. Markierungen, Kandidatenzählungen und Passwörter
werden nicht persistiert oder exportiert.

### Gerichtete S06-Abwandlungsrelation

Die sechs S06-Paarvergleiche beantworten eine andere, gerichtete Frage: Kann aus einem bekannten
fiktiven Quellpasswort innerhalb einer vorab festgelegten kleinen Änderungsgrenze genau der
fiktive Zielwert entstehen? Diese Relation wird ausschließlich durch
`compareFictionalPasswords(...)` bestimmt und kennt drei Ergebnisse:

```text
exact-match
derived-variant-match
no-derived-path-recognized
```

Nach NFC-Normalisierung gilt zunächst eine vollständige Übereinstimmung als `exact-match`.
Allgemeine leichte Zeichenabwandlungen verwenden danach die case-sensitive **restricted
Damerau-Levenshtein-Distanz**, auch Optimal String Alignment genannt. Einfügen, Löschen und
Ersetzen eines Graphemclusters kosten jeweils eine Operation; die Vertauschung zweier benachbarter
Graphemcluster kostet ebenfalls eine Operation. Der allgemeine Pfad ist positiv, wenn

```text
1 <= absolute Distanz <= 3
und
absolute Distanz / Länge des längeren Werts <= 0,25
```

beträgt. Die Längen beziehen sich auf Graphemcluster. Die Kombination aus absoluter und
normalisierter Grenze verhindert, dass drei Änderungen bei einem kurzen Passwort automatisch als
leicht gelten. Sie ist eine konservative, versionierte Trainingsoperationalisierung und kein
universell validierter Grenzwert für reale Passwortangriffe.

Für den verständlichen scenario-spezifischen Wechsel eines Kontobegriffs existiert genau ein
zusätzlicher Makropfad. Er darf einen vollständigen Identifier des Quellkontos durch einen
vollständigen Identifier des Zielkontos ersetzen. Dafür gelten gleichzeitig:

- Quell- und Zielidentifier stammen aus kleinen, getrennten kontospezifischen Listen;
- beide Identifier liegen an Anfang, Ende, einem sichtbaren Nicht-Buchstaben/Ziffer-Verbinder,
  einer Buchstaben/Ziffer-, Camel-Case- oder Akronym-zu-Wort-Grenze;
- höchstens ein Kontobegriff wird ersetzt;
- außerhalb der Identifier beträgt die absolute Restdistanz höchstens zwei und die normalisierte
  Restdistanz höchstens `0,25`;
- außerhalb der Identifier bleibt ein zusammenhängender unveränderter Lauf von mindestens vier
  Graphemclustern erhalten.

Breite Kontextwörter wie `Profil`, `Hilfe`, `Link`, `Service`, `Campus` oder ein freies inneres
Teilwort dürfen diesen Makropfad nicht begründen. Die umfangreicheren `accountTerms` bleiben für
die S05-/Einzelanalyse verfügbar, werden aber nicht als S06-Ersetzungsinventar verwendet.

Die frühere Kombination aus einer frei gewählten Hauptveränderung und bis zu drei
Oberflächenheuristiken entfällt. Insbesondere erzeugen beliebige Zielbestandteile, das Entfernen
eines unbekannten längeren Randteils oder eine bloß strukturell passende Wortersetzung keinen
positiven Weg mehr. Regeln für Jahreszahlen, Zahlen, Endzeichen, Trennzeichen, Großschreibung und
Leetspeak klassifizieren nur noch einen bereits durch die Distanzregel akzeptierten Edit-Pfad.
Mehrdeutige und mehrzeichige zxcvbn-Leetspeak-Ersetzungen werden dabei ohne willkürliche
Ein-Zeichen-Normalisierung geprüft.

Jede positive Abwandlungsrelation enthält geordnete `PasswordTransformationStep`-Objekte. Jeder
Schritt bindet Quell- und Zielspan direkt aneinander, benennt die Operation, trägt ihre Kosten,
besitzt eine Teilnehmererklärung und enthält den nach diesem Schritt entstandenen vollständigen
Zwischenkandidaten. Zusätzlich werden absolute beziehungsweise residuale Distanz, normalisierte
Distanz, Pfadkosten und der vollständige erzeugte Kandidat ausgegeben. Vor der Rückgabe wird
technisch verlangt:

```text
NFC(apply(sourcePassword, steps)) === NFC(targetPassword)
```

Die S06-Projektion berechnet deshalb keine zweite Differenz. Sie zeigt dieselben Domänenschritte
nacheinander als `vorher -> nachher` und schreibt dabei den vom Domain-Layer gelieferten
Zwischenkandidaten nach jedem Schritt sichtbar fort. Erst nach dem vollständigen Zielkandidaten
blendet sie das Ergebnis sowie den Angriffspfad ein. Ergänzungen und Entfernungen behalten einen
sichtbaren leeren Gegenwert. Bei reduzierter Bewegung erscheint dieselbe Information unmittelbar
als statischer Endzustand.

`no-derived-path-recognized` bedeutet ausschließlich, dass weder die allgemeine Distanzgrenze noch
der begrenzte Kontobegriffspfad den Zielwert erzeugt. Es ist keine Aussage über fehlende
Gemeinsamkeiten, Passwortstärke oder reale Angriffssicherheit. Eingaben, Distanzen, Schritte und
Vergleichsbefunde bleiben lokal und flüchtig.

## Teststrategie

`password-candidate-corpus.test.ts` enthält zunächst einen synthetischen Policy-Korpus mit
mindestens 120 verschiedenen, vorab erwarteten Beispielpasswörtern. Er deckt insbesondere ab:

- direkte vollständige Kandidaten;
- Zwei-/Drei-/Mehrwortfamilien beiderseits der gemeinsamen Grenze;
- vollständige typische Transformationen wie `M3inPa555w0rt!?`;
- genau einen Anker mit Rest innerhalb und außerhalb der Grenze;
- mehrere Anker mit unerklärtem Rest, die den Sonderweg nicht verwenden dürfen;
- semantische Markierungen, die das Ergebnis nicht verändern;
- vollständige Suchräume, Struktur-, Unicode- und Abgrenzungsfälle.

Ein zweiter Korpus enthält mindestens 100 verschiedene End-to-End-Eingaben. Jede Eingabe durchläuft
zuerst `analyzeFictionalPassword(...)` und danach
`determinePasswordSimulationDisposition(...)`. Dadurch prüft er die reale Segmentierung und nicht
nur synthetisch vorgegebene Befunde. Enthalten sind gewöhnliche Wörterketten,
Kurzwortpartitionen, Abkürzungen, Tastaturgrenzen, Anker-/Kontext-/Phrasenfälle,
Wiederholungsfälle und negative Grenzfälle.

Die Korpora prüfen außerdem:

- gleiche Entscheidung beim Ein-Anker-Restweg unabhängig von der Restposition;
- `KlarissaBVBTestPasswort!` ohne freie innere Fragmente `Klar`/`larissa`;
- `ichliebedichbiszummond` und `IchLiebeDichBisZumMond` mit stabiler kurzer Wortzerlegung;
- `meinstarkesunipasswort2026!` mit getrenntem Uni-Kontext, Jahr und Suffix;
- `MeinqwertzStarkesPasswort` mit Tastaturspan als Grenze für die angrenzende Wortanalyse;
- `Datensicherheit` mit Vorrang des vollständigen Kompositums;
- `eisichbintotpo`, `ichbineineispo`, `ichhabeineispo` und `eisölindapo` mit vollständigen
  Kurzwortpartitionen;
- die authored Zufallsbeispiele ohne Wörterbuchbefunde für `ml`, `vx` oder `pk` sowie weitere
  negative Kurz- und Langartefakte aus dem Korpusaudit;
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

- Die Kandidatenfamilien und ihre gemeinsame Grenze sind authored Vereinfachungen und können reale Treffer auslassen oder anders priorisieren.
- Ein echter Offline-Angriff hängt stark vom Hashverfahren, Salt, Kostenparametern, Hardware,
  Wortlisten, Regeln und Priorisierung ab.
- Die Restalphabetwahl ist eine eingefrorene Trainingsabstraktion. Sie sagt nicht voraus, wann ein
  bestimmter realer Angreifer die Zeichenfolge prüfen würde.
- Die Grenzen zwischen Zwei-, Drei- und Mehrwortfamilien sind Eigenschaften der eingefrorenen
  Quellengrößen, keine allgemeine Passphrase-Zertifizierung. Nur die bekannte zufällige
  S07/S08-Erzeugungsmethode erlaubt eine gesonderte methodische Begründung.
- Semantische Relationen sind Selbstauskunft innerhalb der Intervention. Sie bleiben erklärend und
  dürfen die objektiv dargestellte Disposition nicht verändern.
- Änderungen an Wörterbüchern oder Analyseparametern erfordern eine neue Version und einen erneut
  geprüften Korpus.

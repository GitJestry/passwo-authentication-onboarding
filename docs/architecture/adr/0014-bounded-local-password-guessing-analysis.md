# ADR 0014 — Begrenzte lokale Passwort-Kandidatenanalyse

- **Status:** Accepted
- **Datum:** 2026-08-03
- **Geändert am:** 2026-08-15: kanonische Evidenzauswahl, positionsunabhängige Restzeichenfamilien und Passphrase-Grenze
- **Citation label:** `ADR 0014-Bounded-Password-Guessing`
- **Ergänzt:** ADR 0002, ADR 0003 und ADR 0007

## Kontext

S05 soll an einer fiktiven Eingabe nachvollziehbar zeigen, welche naheliegenden Bestandteile und
Muster ein Angreifer früh prüfen kann. S06 benötigt anschließend einen reproduzierbaren lokalen
Wert dafür, ob die begrenzte Simulation das vollständige Passwort gefunden hat. Die Arbeit
entwickelt und validiert jedoch keinen Password Strength Meter.

Die bisherige Auswertung hatte drei Probleme:

1. zxcvbn liefert eine optimierte nicht überlappende Gesamtsequenz. Diese Sequenz ist keine
   erschöpfende Liste aller belegten Teiltreffer. Ein unbekannter Abschnitt konnte deshalb
   angrenzende Wörter wie `Test` oder `Passwort` aus der sichtbaren Analyse verdrängen.
2. Überlappende Befunde wie `Campus`, `gram` und der authored Kontobegriff `Campusgram` konnten
   nebeneinander bestehen, obwohl der vollständige Kontextbegriff die verständlichere primäre
   Erklärung ist.
3. Ein bekannter Kern mit einer kurzen unbekannten Ergänzung wurde nur an bestimmten Positionen
   erkannt. Dadurch konnten semantisch gleichartige Beispiele wie `PasswortmklhSuppe` und
   `PasswortSuppemlkh` unterschiedlich behandelt werden.

NIST SP 800-63B-4 fordert für Verifier einen Vergleich des vollständigen prospektiven Passworts
mit häufig verwendeten, erwartbaren, kompromittierten und kontextspezifischen Werten sowie
naheliegenden Ableitungen. NIST fordert zugleich keine Prüfung oder Sperrung jedes beliebigen
enthaltenen Wörterbuchworts. PassWo übernimmt daraus ausschließlich die Vollwert- und
Kontextidee als didaktische Leitlinie. Die Simulation ist keine produktive Blocklist und keine
NIST-Konformitätsimplementierung.

## Entscheidung

`@passwo/password-analysis` bleibt vollständig lokal, deterministisch und frameworkfrei. Die
Analysekonfiguration erhält die Version `passwo-bounded-whole-recognition-v11`.

Die interne Verarbeitung trennt drei Ebenen:

1. **Befunderfassung:** zxcvbn-ts und authored lokale Matcher liefern belegte Spans für Wörter,
   Passwortlistenwerte, Namen, Konto- und Dienstbezüge, Folgen, Tastaturmuster, Daten,
   Wiederholungen und typische Veränderungen.
2. **Kanonische Evidenzauswahl:** Eine deterministische, nicht überlappende Teilmenge dieser Spans
   maximiert zuerst die belegte Abdeckung, verwendet bei Gleichstand weniger Befunde und bevorzugt
   anschließend die authored Kategorienpriorität. Konto- und Dienstbezüge haben Vorrang vor darin
   enthaltenen Wörterbuchtreffern.
3. **Vollpasswort-Disposition:** Eine getrennte begrenzte Kandidatenregel entscheidet nur, ob das
   vollständige Passwort innerhalb der authored Kandidatenfamilie liegt. Sie erzeugt keinen
   numerischen Stärke-Score und keine Crack-Zeit.

### zxcvbn bleibt Hinweisquelle, nicht Entscheidungsinstanz

Die eingefrorene lokale Konfiguration verwendet:

- `@zxcvbn-ts/core@4.1.2`;
- `@zxcvbn-ts/language-common@4.1.2`;
- `@zxcvbn-ts/language-de@4.1.1`;
- `@zxcvbn-ts/language-en@4.1.1`;
- die allgemeinen Tastaturgraphen;
- authored Konto- und Dienstbegriffe sowie flüchtige fiktive Kontoidentifikatoren als lokale
  `userInputs`.

PassWo übernimmt weder zxcvbn-Score noch `guesses`, `guessesLog10`, Crack-Zeiten oder eine daraus
abgeleitete Schwelle. zxcvbn darf intern seine optimierte Sequenz bestimmen; PassWo ergänzt
unabhängig belegte Wörterbuchspans, wenn sie an einer sichtbaren Schreibgrenze liegen.

### Stabile Wortgrenzen

Alphabetische Läufe werden zusätzlich an folgenden sichtbaren Grenzen betrachtet:

- Anfang und Ende des Laufs;
- Wechsel von Klein- zu Großschreibung;
- Wechsel von einem Großbuchstaben-Akronym zu einem nachfolgenden Titelwort.

Dadurch kann `KlarissaBVBTestPasswort` als `Klarissa | BVB | Test | Passwort` betrachtet werden,
ohne freie innere Treffer wie `K|larissa` oder `Klar|issa` zu erfinden. Ein unbekannter Abschnitt
löscht angrenzende belegte Wörter nicht. Vollständige kleingeschriebene Läufe dürfen weiterhin
lückenlos aus den eingefrorenen Wörterbüchern zerlegt werden.

### Vorrang des Kontokontexts

Wenn ein exakter oder authored begrenzt veränderter Konto-/Dienstbegriff einen Bereich abdeckt,
werden Wörterbuchbefunde, die vollständig innerhalb dieses Bereichs liegen, aus der kanonischen
Befundmenge entfernt. So wird `Campusgram` nicht zusätzlich als `Campus` und `gram` bewertet;
`C4mpu5Gram` bleibt ein vollständiger veränderter Kontobezug. Nicht deckungsgleiche Befunde
außerhalb des Kontextspans bleiben erhalten.

### Vollpasswort-Treffer

Die Disposition kennt weiterhin nur:

```text
whole-password-recognized
no-whole-password-recognized
```

Ein direkter Volltreffer liegt vor, wenn ein einzelner zulässiger Befund die gesamte Zeichenfolge
abdeckt, etwa ein häufiger vollständiger Passwortwert, ein vollständiges Wort oder ein Name,
ein authored Konto-/Dienstbegriff, eine Folge, ein Tastaturmuster, ein Datum oder eine
Wiederholung. Eine deckungsgleiche typische Transformation wird als begrenzte Variante geführt.

Andernfalls darf eine begrenzte Variantenfamilie mehrere kanonische Anker und nicht erklärte
Restzeichen kombinieren. Der positive Befund ist dabei nicht von der konkreten Position der
Restzeichen oder der Reihenfolge der erkannten Anker abhängig.

### Positionsunabhängige Restzeichenfamilie

Für eine kanonische Auswahl mit `k` semantischen Ankern und `r` nicht abgedeckten Unicode-
Codepoints wird eine endliche Kandidatenfamilie definiert:

```text
Restalphabet^r
× unterschiedliche Ankeranordnungen
× Verteilungen der r Restzeichen auf die k + 1 Lücken
```

Die Anzahl der Lückenverteilungen ist `binomial(r + k, k)`. Gleiche Anker reduzieren die Zahl der
Ankeranordnungen entsprechend ihrer Multiplizität. Dadurch erhalten beispielsweise
`PasswortmklhSuppe`, `PasswortSuppemlkh` und `mklhPasswortSuppe` dieselbe interne Behandlung.

Die Restalphabetgröße wird ausschließlich aus einer kleinen eingefrorenen Menge unterstützter
Zeichenklassen gebildet:

| Beobachtete Restzeichenklasse | Eingefrorenes Alphabet |
|---|---:|
| ASCII-Kleinbuchstaben | 26 |
| deutsche Kleinbuchstaben einschließlich `äöüß` | 30 |
| ASCII-Großbuchstaben | 26 |
| deutsche Großbuchstaben einschließlich `ÄÖÜ` | 29 |
| Ziffern | 10 |
| druckbare ASCII-Interpunktion und Leerzeichen | 33 |

Bei mehreren beteiligten Klassen werden die Größen addiert. Andere Unicode-Zeichen führen nicht
zu einem positiven Restzeichenweg. Die Kandidatenfamilie darf höchstens
`100_000_000` Einträge umfassen. Diese Grenze wurde so gewählt, dass ein fünfstelliger
ASCII-Kleinbuchstabenrest um einen einzelnen klaren Anker einschließlich aller sechs Positionen
vollständig enthalten ist (`26^5 × 6 = 71_288_256`), während sechs solche Restzeichen bereits
außerhalb liegen. Sie ist eine authored Simulationsgrenze und ausdrücklich keine Crack-Zeit oder
universelle Angreiferschwelle.

Typische, bereits separat belegte Endungen, Jahre, Folgen oder Wiederholungen zählen als Befund und
nicht nochmals als unbekannter Rest. Dadurch kann `Passwort123?!` über den konkreten belegten
Aufbau erkannt werden, während ein nicht anderweitig erklärter größerer Mischrest bewusst nicht
positiv bewertet wird.

### Wörterketten und Passphrase-Grenze

Ein einzelnes vollständiges geläufiges Wort kann ein direkter Kandidat sein. Eine vollständig
belegte Kette aus bis zu vier gewöhnlichen Wörtern oder Namen liegt innerhalb der bewusst engen
Trainingsfamilie einfacher Wörteraneinanderreihungen.

Ab fünf **verschiedenen** gewöhnlichen Wörtern oder Namen reicht die Wörterbuchabdeckung allein
nicht mehr für `whole-password-recognized`. Diese Eingabe ist für die Simulation
`passphrase-shaped`. Das ist kein Sicherheitsnachweis. Ein anderer konkreter Befund kann weiterhin
einen Treffer begründen, insbesondere:

- ein authored Konto-/Dienstbezug;
- ein expliziter Passwortlistenanker wie `Passwort` oder `TestPasswort`;
- eine Wiederholung;
- eine Folge, ein Datum oder ein Tastaturmuster;
- ein vollständiger bereits gelisteter Ausdruck.

Die Grenze vermeidet, dass die S05-Komponentenerkennung eine aus fünf oder mehr unterschiedlichen
Wörtern bestehende Passphrase allein wegen ihrer Wörterbuchwörter als gefunden bezeichnet. Sie
behauptet weder, dass jede Fünf-Wort-Eingabe sicher sei, noch ersetzt sie die in S07/S08 bekannte
und versionierte zufällige Erzeugungsmethode. Wiederholte Wörter gelten nicht als unabhängig
gezogene Passphrase und erhalten daher keine automatische Ausnahme.

### Länge bleibt unabhängig

Die Unicode-Codepoint-Länge wird weiterhin getrennt als `below-15` oder `at-least-15` ausgegeben.
Sie erzeugt oder verhindert keinen Volltreffer:

- `< 15` ist eine nicht erfüllte Trainingsorientierung, aber kein automatischer Treffer;
- `>= 15` ist kein Sicherheitsnachweis;
- ein langes, vollständiges Muster kann gefunden werden;
- ein kurzer nicht positiv erkannter Wert bleibt `no-whole-password-recognized` plus `below-15`;
- Zeichenklassen sind keine Kompositionsanforderung.

### S05 und S06 verwenden dieselbe Entscheidung

S05 erzeugt `PasswordSimulationDisposition` ausschließlich durch
`determinePasswordSimulationDisposition`. S06 analysiert jedes fiktive Konto mit derselben
Funktion und derselben Konfigurationsversion. React, Szenenprojektionen und Teilnehmertexte
enthalten keine zweite Trefferlogik.

Die manuelle S05-Markierung persönlicher Angaben bleibt lokal und flüchtig. Sie wird nicht als
scheinbar objektiver Befund nach S06 transportiert. Bereits authored oder aus der fiktiven
Trainingsidentität lokal abgeleitete Begriffe dürfen dagegen reproduzierbar als Kontextanker
verwendet werden. Nicht automatisch belegte kurze persönliche Kürzel können innerhalb der
begrenzten Restzeichenfamilie liegen, ohne dass PassWo ihnen eine erfundene semantische Kategorie
zuweist.

## Datenschutz- und Architekturgrenze

- Es werden ausschließlich fiktive Passwörter im Browser verarbeitet.
- Eingaben, Befunde und Dispositionen werden nicht persistiert, übertragen, geloggt oder
  exportiert.
- Es gibt keine externe Breach-, Blocklist- oder Wörterbuchabfrage.
- Das Package importiert weder React noch Storage-, Netzwerk- oder Telemetriecode.
- `no-whole-password-recognized` bedeutet keine Freigabe als stark, sicher oder unknackbar.
- `whole-password-recognized` bedeutet nur, dass die vollständige Zeichenfolge in der
  dokumentierten begrenzten Trainingsfamilie liegt.

## Validierung

Ein versionierter Testkorpus prüft 120 verschiedene Beispielpasswörter. Er enthält direkte
Volltreffer, zwei- bis viergliedrige Wörterketten, passphrase-shaped Eingaben ab fünf
verschiedenen Wörtern, positionsunabhängige Restzeichen innerhalb und außerhalb der Grenze,
Kontokontext, Wiederholungen, Folgen, Tastaturmuster, Unicode und Überlappungen. Zusätzliche
Integrationstests führen reale `analyzeFictionalPassword`-Ergebnisse in dieselbe S05/S06-
Disposition.

Der Korpus belegt ausschließlich Reproduzierbarkeit und beabsichtigtes Verhalten der authored
Trainingsregel. Er ist keine empirische Validierung von Sensitivität, Spezifität oder
Passwortstärke.

## Konsequenzen

- Die Auswertung ist konservativ in der positiven Behauptung: Nicht unterstützte Zeichen,
  größere Restfamilien und passphrase-shaped Wörterketten bleiben ohne positiven Volltreffer,
  sofern kein anderer konkreter Befund greift.
- Kurze Füllzeichen können einen klaren bekannten Anker nicht allein dadurch verbergen, dass sie
  an einer anderen Stelle stehen.
- Konto-/Dienstbezüge erhalten eine eindeutige primäre Einordnung statt konkurrierender innerer
  Wörterbuchtreffer.
- zxcvbn-Updates, Wörterbuchänderungen, Kandidatenbudget, Alphabetklassen, Passphrase-Grenze oder
  Prioritäten benötigen eine neue Analyseversion und angepasste Tests/Dokumentation.

## Verworfene Alternativen

### zxcvbn-Score oder Guess-Schwelle

Verworfen, weil dadurch eine bibliotheksabhängige numerische Passwortstärkeschätzung zur
segmentübergreifenden Entscheidung würde.

### Beliebige erkannte Bausteine ohne Begrenzung addieren

Verworfen, weil daraus eine nicht kalibrierte mathematische Stärkeformel entstünde und unbekannte
Reste nachträglich beliebig erklärt werden könnten.

### Nur Präfix oder Suffix zulassen

Verworfen, weil semantisch gleichartige kurze Ergänzungen abhängig von ihrer Position
unterschiedlich behandelt würden.

### Jedes Passwort unter 15 Zeichen automatisch als gefunden behandeln

Verworfen, weil Mindestlänge und konkreter Kandidatenweg unterschiedliche Aussagen sind.

### Jedes Wörterbuchwort in einer Passphrase blockieren

Verworfen, weil NIST den vollständigen Wert statt beliebiger Teilwörter adressiert und weil die
S07/S08-Passphrase auf einer bekannten zufälligen Wortauswahl beruht. Die authored Fünf-Wort-
Grenze ist daher eine Enthaltung von einem Wörterbuch-only-Treffer, keine positive Freigabe.

### Externe Pwned-Password-Abfrage oder generative KI

Verworfen wegen Datenschutz, Verfügbarkeit, fehlender deterministischer Reproduzierbarkeit und
der Verschiebung des Thesisumfangs.

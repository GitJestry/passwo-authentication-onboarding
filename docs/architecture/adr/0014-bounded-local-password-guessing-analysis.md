# ADR 0014 — Begrenzte lokale Passwort-Kandidatenanalyse

- **Status:** Accepted
- **Datum:** 2026-08-03
- **Geändert am:** 2026-08-23: Wortkorpora über alle Wortlängen konservativ bereinigt; zuvor 2026-08-22 vollständiges Durchprobieren als letzter begrenzter Fundweg
- **Citation label:** `ADR 0014-Bounded-Password-Guessing`
- **Ergänzt:** ADR 0002, ADR 0003 und ADR 0007

## Kontext

S05 soll an einer fiktiven Eingabe nachvollziehbar zeigen, welche naheliegenden Bestandteile und
Muster ein Angreifer früh prüfen kann. S06 benötigt anschließend einen reproduzierbaren lokalen
Wert dafür, ob die begrenzte Simulation das vollständige Passwort gefunden hat. Die Arbeit
entwickelt und validiert jedoch keinen Password Strength Meter.

Die bisherige Auswertung hatte zusätzlich zu den bereits behobenen Überlappungs- und
Wiederholungsproblemen drei offene Grenzen:

1. zxcvbn liefert eine optimierte nicht überlappende Gesamtsequenz. Diese Sequenz ist keine
   erschöpfende Liste aller belegten Teiltreffer. Ein unbekannter Abschnitt konnte deshalb
   angrenzende Wörter wie `Test` oder `Passwort` aus der sichtbaren Analyse verdrängen.
2. Überlappende Befunde wie `Campus`, `gram` und der authored Kontobegriff `Campusgram` konnten
   nebeneinander bestehen, obwohl der vollständige Kontextbegriff die verständlichere primäre
   Erklärung ist.
3. Die vorhandenen, von der teilnehmenden Person bestätigten persönlichen, inhaltlichen und
   Satz-/Phrasenbeziehungen wurden zwar reflektiv angezeigt, aber noch nicht als flüchtige
   Evidenz für die abschließende Übungsentscheidung verwendet.

NIST SP 800-63B-4 fordert für Verifier einen Vergleich des vollständigen prospektiven Passworts
mit häufig verwendeten, erwartbaren, kompromittierten und kontextspezifischen Werten sowie
naheliegenden Ableitungen. NIST fordert zugleich keine Prüfung oder Sperrung jedes beliebigen
enthaltenen Wörterbuchworts. PassWo übernimmt daraus ausschließlich die Vollwert- und
Kontextidee als didaktische Leitlinie. Die Simulation ist keine produktive Blocklist und keine
NIST-Konformitätsimplementierung.

## Entscheidung

`@passwo/password-analysis` bleibt vollständig lokal, deterministisch und frameworkfrei. Die
Analysekonfiguration erhält die Version `passwo-bounded-whole-recognition-v18`.

Die interne Verarbeitung trennt drei Ebenen:

1. **Befunderfassung:** zxcvbn-ts und authored lokale Matcher liefern belegte Spans für Wörter,
   Passwortlistenwerte, Namen, Konto- und Dienstbezüge, Folgen, Tastaturmuster, Daten,
   Wiederholungen und typische Veränderungen.
2. **Kanonische Evidenzauswahl:** Eine deterministische, nicht überlappende Teilmenge dieser Spans
   maximiert zuerst die belegte Abdeckung, verwendet bei Gleichstand weniger Befunde und bevorzugt
   anschließend die authored Kategorienpriorität. Konto- und Dienstbezüge haben Vorrang vor darin
   enthaltenen Wörterbuchtreffern.
3. **Vollpasswort-Disposition:** Eine getrennte begrenzte Kandidatenregel entscheidet nur, ob das
   vollständige Passwort durch einen konkreten Kandidatenweg oder als letzter Weg durch den
   eingefrorenen vollständigen Suchraum gefunden wird. Sie erzeugt keinen numerischen
   Stärke-Score und keine individuelle Crack-Zeit.

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

Matcher-Ergebnisse bleiben Kandidaten an einer Adaptergrenze. Insbesondere wird ein
`wordSequence`-Match nur übernommen, wenn der sichtbare Span die gemeldeten Wörter direkt bildet,
die Wörter benachbarte Einträge derselben eingefrorenen Sequenzliste sind und der Gesamtspan auf
unterstützten Komponentengrenzen liegt. Das verhindert gemischte oder rückwärts hergeleitete
Folgen wie `einStar` (`einS → eins`, `tar → rat`), ohne echte Folgen wie `einszweidrei` zu
verlieren.

Bei zxcvbn-`repeat`-Matches bleiben die bereits von der Engine ermittelte Basiseinheit und
Wiederholungsanzahl ausschließlich als flüchtige Guess-Path-Metadaten erhalten. Der fachliche
`repeated-component`-Befund behält seinen vollständigen Evidenzspan; erst die S05-Projektion darf
daraus einzelne visuelle Vorkommen bilden. Es entsteht keine zweite Wiederholungserkennung.

### Stabile Wortgrenzen

Alphabetische Läufe werden zusätzlich an folgenden sichtbaren Grenzen betrachtet:

- Anfang und Ende des Laufs;
- Wechsel von Klein- zu Großschreibung;
- Wechsel von einem Großbuchstaben-Akronym zu einem nachfolgenden Titelwort.

Dadurch kann `KlarissaBVBTestPasswort` als `Klarissa | BVB | Test | Passwort` betrachtet werden,
ohne freie innere Treffer wie `K|larissa` oder `Klar|issa` zu erfinden. Ein unbekannter Abschnitt
löscht angrenzende belegte Wörter nicht. Vollständige kleingeschriebene Läufe dürfen weiterhin
lückenlos aus den eingefrorenen Wörterbüchern zerlegt werden.

Authored Konto- und Dienstbegriffe verwenden dieselbe Grenzsemantik. Ein Treffer ist nur zulässig,
wenn beide Enden entweder in der Schreibweise sichtbar oder durch eine akzeptierte lexikalische
Partition belegt sind. Dadurch wird `uni` in `meinstarkesunipasswort2026!` erhalten, ein
quer über `Mein|Starkes` liegendes `inSta` jedoch bereits an der Analysegrenze verworfen.

Ein Passwortlistenanker, der nur an einer Seite auf einer unterstützten Grenze liegt, darf keine
weitere sichtbare Grenze innerhalb seines Spans überqueren. Dadurch bleibt eine kurze freie
Erweiterung an einem Rand möglich, während ein Kollisionsfragment wie `tRot` über `Ist|Rot` nicht
als eigener Passwortlistenbestandteil übernommen wird.
Dieselbe Grenze gilt bereits bei der Bildung vollständiger Wörterbuchpartitionen: Ein Kandidat darf
eine sichtbare Grenze nur überqueren, wenn sowohl sein Anfang als auch sein Ende selbst auf
unterstützten Grenzen liegen. Dadurch bleibt ein vollständiger Anker wie `IchBin` möglich, während
die Partition `Ist|Rot` nicht zu `Is|tRot` verschoben werden kann.

Die vollständige Zerlegung wird je Lauf getrennt für Deutsch und Englisch berechnet. Wörter aus
beiden Sprachen werden nicht frei zu einer künstlichen Mischpartition kombiniert. Die
Wortkandidaten stammen weiterhin breit aus den eingefrorenen, nach Häufigkeit geordneten deutschen
und englischen zxcvbn-Korpora. PassWo übernimmt diese Korpora jedoch bei keiner Wortlänge
ungeprüft: Zulässig sind nur sprachtypische Buchstabenfolgen mit mindestens einem Vokal innerhalb
fester längenabhängiger Ranggrenzen. Explizite Namenslisten und die wesentlich unruhigeren
Wikipedia-Korpora werden nicht zur freien Wortpartition herangezogen. Zusätzlich werden im
Korpusaudit bestätigte Fragmente und Kodierungsartefakte ausgeschlossen. Dieselbe Prüfung gilt für
einen von zxcvbn direkt gemeldeten gewöhnlichen Worttreffer. Dadurch werden weder die kurzen
Kandidaten künstlich auf eine minimale Positivliste reduziert noch längere Korpusartefakte allein
wegen ihres Vorkommens als Wort angezeigt.

Transformationsbefunde besitzen keine eigenständige Segmentautorität. Nach der kanonischen
Spezifitätsauswahl bleiben sie nur erhalten, wenn am identischen Span weiterhin ein zugehöriger
Wort-, Passwortlisten-, Konto- oder Wiederholungsbefund existiert. Unterdrückte Basistreffer können
damit keine verwaisten Grenzen in nachgelagerten Projektionen hinterlassen.

Kurze Funktionswörter und Kontextkürzel wie `es`, `in`, `ich`, `bis`, `zum`, `the`, `po`, `öl`
oder `uni` bleiben damit verfügbar. Zwei- und dreibuchstabige Wörter dürfen jedoch nur ein
vollständiges sichtbares Segment oder einen Teil einer lückenlosen sprachgebundenen Partition
bilden; freie innere Kurzworttreffer bleiben ausgeschlossen. Namenslisten werden nicht zur freien
inneren Zerlegung verwendet. Ein Name bleibt nur als vollständiges sichtbares Segment oder als
authored flüchtiger Kontext verfügbar. Dadurch kann `ZumMo` nicht als Name aus `ZumMond`
ausgeschnitten werden und zufällige Korpusfragmente wie `ml`, `vx`, `pk` oder `tte` werden nicht
als Wortbestandteil projiziert.

Eine kleine eingefrorene Menge gebräuchlicher Abkürzungen wie `LKW`, `DVD`, `DHL`, `LOL`, `USB`
oder `WLAN` wird ausschließlich exakt und ohne Edit-Distance beziehungsweise Leetspeak erkannt.
Ein isolierter kurzer zxcvbn-Worttreffer wird nur direkt übernommen, wenn beide Enden auf sichtbaren
Grenzen liegen; eine vollständige kleingeschriebene Partition kann geprüfte kurze Wörter weiterhin
intern belegen.

Tastaturfolgen werden zusätzlich unabhängig von zxcvbns optimierter Endsequenz über maximale
Spans der eingefrorenen QWERTZ-/QWERTY-Reihen erkannt. Ein solcher Span erzeugt eine feste Grenze
für die lexikalische Analyse davor und danach. Dadurch bleibt bei
`MeinqwertzStarkesPasswort` sowohl `qwertz` als auch `Mein`, `Starkes` und `Passwort` sichtbar.
Die Tastaturfolge konkurriert nicht mehr mit dem gesamten alphabetischen Lauf.

### Vorrang des Kontokontexts

Wenn ein exakter oder authored begrenzt veränderter Konto-/Dienstbegriff einen Bereich abdeckt,
werden Wörterbuchbefunde, die vollständig innerhalb dieses Bereichs liegen, aus der kanonischen
Befundmenge entfernt. So wird `Campusgram` nicht zusätzlich als `Campus` und `gram` bewertet;
`C4mpu5Gram` bleibt ein vollständiger veränderter Kontobezug. Nicht deckungsgleiche Befunde
außerhalb des Kontextspans bleiben erhalten.

Spezifische Strukturspans haben außerdem Vorrang vor generischen Endungen. Ein erkanntes Jahr wie
`2026` bleibt deshalb ein eigener Befund; bei `Passwort2026!` umfasst die generische Endung nur
`!`. Ein bis drei druckbare ASCII-Trennzeichen zwischen zwei kanonischen semantischen Ankern gelten
als vorhersehbare Verbindung und nicht als zusätzlicher unbekannter Suchraum. Die Zeichen selbst
erzeugen keinen neuen semantischen Anker und keine Zeichentypregel.

Eine kleine authored Kompositumliste stellt vollständige trainingsrelevante Begriffe wie
`Datensicherheit`, `Passwortsicherheit` oder `Benutzerkonto` vor ihre inneren Wörter. Existiert
kein solcher vollständiger Begriff, darf die normale sprachgebundene Partition weiterhin mehrere
Wörter liefern. Das ist eine Prioritätsregel und keine allgemeine deutsche Kompositaanalyse.

### Getrennte und begrenzt veränderte Wiederholungen

Die Wiederholungserkennung ist nicht auf direkt aneinanderliegende zxcvbn-Wiederholungen begrenzt.
PassWo ergänzt folgende konservative lokale Befunde:

- derselbe alphanumerische Teil mit mindestens vier normalisierten Zeichen erscheint mindestens
  zweimal nicht überlappend; bei vier oder fünf Zeichen müssen beide Vorkommen an sichtbaren
  Wort-, Zahl- oder Schreibgrenzen liegen;
- ausreichend lange sichtbare Komponenten mit mindestens acht Zeichen unterscheiden sich nach
  normalisierter Groß-/Kleinschreibung um genau eine Damerau-Levenshtein-Operation;
- ein durchgehender alphanumerischer Lauf kann in zwei nahezu gleich lange Hälften mit jeweils
  mindestens acht Zeichen geteilt werden, die sich um genau eine Operation unterscheiden;
- die eingefrorenen Ersetzungen `$→s`, `0→o`, `1→i`, `3→e`, `4→a`, `5→s`, `7→t` und `@→a`
  werden ausschließlich für diese Wiederholungsbeziehung normalisiert.

Damit werden beispielsweise `IchWiederholeZwischenIchWiederhole`, `haha242424haha`,
`DatensicherheitDatens1cherheit` und `datensicherheitdatensxicherheit` als Wiederholungsaufbau
erkannt. Die vorhandene Kategorie `repeated-component` wird mit mehreren belegten Spans verwendet;
es entsteht keine neue Anzeige- oder Bewertungskategorie. Allgemeine unscharfe Teilstring-Suche
oder beliebige Ähnlichkeitsschwellen bleiben ausgeschlossen.

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

### Wörter und bestätigte semantische Kandidatenwege

Ein einzelnes vollständiges geläufiges Wort kann ein direkter Kandidat sein. Mehrere gewöhnliche
Wörter oder Namen werden dagegen unabhängig von ihrer Anzahl zunächst nur als erklärende Befunde
geführt. Eine vollständige Wörterbuchpartition erzeugt allein keinen positiven Volltreffer. Damit
entsteht weder eine Regel `bis vier Wörter = gefunden` noch eine vermeintliche
Passphrase-Zertifizierung ab einer bestimmten Wortzahl.

Ein Mehrwortaufbau kann weiterhin automatisch gefunden werden, wenn ein konkreter stärkerer Weg
vorliegt, insbesondere:

- ein authored Konto-/Dienstbezug;
- ein expliziter Passwortlistenanker wie `Passwort` oder `TestPasswort`;
- eine Wiederholung;
- eine Folge, ein Datum, Jahr oder Tastaturmuster;
- ein vollständiger bereits gelisteter Ausdruck;
- eine kleine eingefrorene vollständige Phrase wie `ichliebedichbiszummond`.

Zusätzlich darf die bereits vorhandene S05-Reflexion einen **flüchtigen semantischen
Kandidatenweg** vervollständigen. Dafür werden ausschließlich die von der teilnehmenden Person
bestätigten Spans übernommen:

- persönliche Bereiche;
- Bausteine einer inhaltlich zusammengehörigen Gruppe;
- direkt verbundene Bausteine einer Satz- oder Phrasenstruktur.

Die Relationen müssen gemeinsam mit den automatisch belegten Ankern die vollständige
Zeichenfolge abdecken. Ein bis drei unterstützte Trennzeichen sowie eine kleine eingefrorene Menge
grammatischer Verbindungswörter dürfen zwischen den markierten semantischen Teilen liegen. Andere
gewöhnliche Wörter müssen selbst zu mindestens einer bestätigten Relation gehören. Dadurch reicht
beispielsweise eine Relation zwischen `eis` und `tot` nicht aus, um die übrigen Wörter in
`eisichbintotpo` nachträglich mitzuerklären.

Teilnehmerbestätigte Relationen sind additiv: Sie können einen zusätzlichen Kandidatenweg eröffnen,
aber keinen automatischen Treffer zurücknehmen und keine Sicherheit bestätigen. Sie sind weder
objektive Semantikmessung noch Aussage über tatsächliches Angreiferwissen. Eine nicht bestätigte
oder ungültige Relation wird ignoriert.

### Vollständiges Durchprobieren als letzter Weg

Greift kein direkter, begrenzter Varianten- oder bestätigter semantischer Weg, wird als letzter
Schritt der vollständige Suchraum der beobachteten Zeichenklassen berechnet. Die Regel
`whole-password-recognized-exhaustive-search` gilt höchstens bis

```text
26^12 = 95_428_956_661_682_176 Zeichenfolgen
```

Diese authored Grenze entspricht bei der bereits verwendeten Demonstrationsannahme von einer
Billion Versuchen pro Sekunde ungefähr einem Tag. Sie ist keine allgemeine Crack-Zeit und keine
produktive Mindestlängenregel. Die Alphabetgröße wird aus den tatsächlich vorkommenden
Kleinbuchstaben-, Großbuchstaben-, Ziffern- und Symbolklassen gebildet. Nicht unterstützte
Unicode-Zeichen verwenden einen endlichen authored Ersatzpool, damit eine sehr kurze Zeichenfolge
die letzte Prüfung nicht allein durch ihre Zeichenart umgehen kann.

Konkrete Kandidatenwege haben immer Vorrang und behalten ihre spezifische Erklärung. Das
vollständige Durchprobieren erzeugt keine Befund-IDs und wird nicht als Passwortstärke-Score oder
Suchraummodell persistiert.

### Länge bleibt unabhängig

Die Unicode-Codepoint-Länge wird weiterhin getrennt als `below-15` oder `at-least-15` ausgegeben.
Sie erzeugt oder verhindert keinen Volltreffer:

- `< 15` ist eine nicht erfüllte Trainingsorientierung, aber kein automatischer Treffer;
- `>= 15` ist kein Sicherheitsnachweis;
- ein langes, vollständiges Muster kann gefunden werden;
- ein kurzer Wert kann über den letzten vollständigen Suchraum gefunden werden; liegt dieser über der Grenze, bleibt er `no-whole-password-recognized` plus `below-15`;
- Zeichenklassen sind keine Kompositionsanforderung.

### S05 und S06 verwenden dieselbe Entscheidung

S05 erzeugt `PasswordSimulationDisposition` ausschließlich durch
`determinePasswordSimulationDisposition`. S06 analysiert jedes fiktive Konto mit derselben
Funktion und derselben Konfigurationsversion. React, Szenenprojektionen und Teilnehmertexte
enthalten keine zweite Trefferlogik.

Die S05-Markierungen werden als `TransientPasswordSemanticEvidence` ausschließlich im Speicher des
laufenden Trainings gehalten und zusammen mit dem Campusgram-Konto an dieselbe S06-Disposition
übergeben. Das S06-Kontomodell akzeptiert denselben optionalen Evidenztyp bereits für Master Campus
und Campus E-Mail. Dadurch können die beiden späteren lokalen Prüfungen dieselbe flüchtige
Reflexionslogik verwenden, ohne eine zweite Bewertungsfunktion einzuführen. Die aktuelle UI erhebt
diese Relationen dort noch nicht.

S06 übernimmt nur das kategoriale Resultat und die IDs der verwendeten Relationen. Die
Passwortspans und Relationen werden nicht in Forschungsdaten, Persistenz oder Telemetrie
überführt.

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

Ein versionierter synthetischer Policy-Korpus prüft mindestens 120 verschiedene
Beispielpasswörter. Er enthält direkte Volltreffer, gewöhnliche Wörterketten ohne automatischen
Treffer, bestätigte semantische Wörterketten, positionsunabhängige Restzeichen sowie vollständige
Suchräume innerhalb und außerhalb ihrer jeweiligen Grenze, Kontokontext, Wiederholungen, Folgen,
Tastaturmuster, Unicode und Überlappungen.

Zusätzlich durchlaufen mindestens 100 verschiedene End-to-End-Beispiele zuerst
`analyzeFictionalPassword(...)` und anschließend
`determinePasswordSimulationDisposition(...)`. Dieser Korpus prüft insbesondere kleingeschriebene
und CamelCase-Wortfolgen, vollständige Zwei-/Dreibuchstabenpartitionen, kuratierte Abkürzungen,
Tastaturspans als Segmentgrenzen, wiederholte Trennzeichen, Kompositum- und Jahrespriorität,
Kontokontextvorrang, getrennte und einmal veränderte Wiederholungen, positive und negative
semantische Pfade sowie die gemeinsame S05-/S06-Disposition. Segmentierungsfehler können dadurch
nicht durch bereits synthetisch vorgegebene Befunde verdeckt werden.

Der Korpus belegt ausschließlich Reproduzierbarkeit und beabsichtigtes Verhalten der authored
Trainingsregel. Er ist keine empirische Validierung von Sensitivität, Spezifität oder
Passwortstärke.

## Konsequenzen

- Die Auswertung ist konservativ in der positiven Behauptung: Nicht unterstützte Zeichen,
  größere Restfamilien und gewöhnliche Mehrwortfolgen bleiben ohne zusätzlichen konkreten Weg ohne positiven Volltreffer,
  sofern kein anderer konkreter Befund greift.
- Kurze Füllzeichen können einen klaren bekannten Anker nicht allein dadurch verbergen, dass sie
  an einer anderen Stelle stehen.
- Konto-/Dienstbezüge erhalten eine eindeutige primäre Einordnung statt konkurrierender innerer
  Wörterbuchtreffer.
- zxcvbn-Updates, Wörterbuchänderungen, Kandidatenbudget, Alphabetklassen, semantische
  Relationsregeln oder Prioritäten benötigen eine neue Analyseversion und angepasste
  Tests/Dokumentation.

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

### Wortanzahl als automatische Stärke- oder Trefferregel

Verworfen, weil die bloße Anzahl erkannter Wörter weder eine bekannte zufällige Erzeugungsmethode
noch einen konkreten frühen Kandidatenweg belegt. NIST adressiert den vollständigen Wert statt
beliebiger Teilwörter; die S07/S08-Passphrase beruht dagegen auf einer bekannten zufälligen
Wortauswahl. Mehrwortfolgen benötigen daher einen automatischen oder bestätigten konkreten Weg.

### Externe Pwned-Password-Abfrage oder generative KI

Verworfen wegen Datenschutz, Verfügbarkeit, fehlender deterministischer Reproduzierbarkeit und
der Verschiebung des Thesisumfangs.

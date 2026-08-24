# ADR 0014 — Begrenzte lokale Passwort-Kandidatenanalyse

- **Status:** Accepted
- **Datum:** 2026-08-03
- **Geändert am:** 2026-08-24: gemeinsame Kandidatengrenze, quellengestützte Kombinationen und Restweg nur bei genau einem Anker; außerdem S06-Abwandlungsrelation auf normalisierte restricted Damerau-Levenshtein-Distanz, einen begrenzten Kontobegriffspfad und die v21-Korrektur der dokumentierten Wörterbuchprojektion umgestellt
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
3. Die bisherige Volltrefferregel konnte einen einzelnen Anker oder nachträgliche semantische
   Markierungen verwenden, um weitere bereits im Zielwert erkannte Teile praktisch kostenlos zu
   erklären. Vollständige Zeichenabdeckung wurde dadurch mit tatsächlicher Kandidatengenerierung
   verwechselt.

NIST SP 800-63B-4 fordert für Verifier einen Vergleich des vollständigen prospektiven Passworts
mit häufig verwendeten, erwartbaren, kompromittierten und kontextspezifischen Werten sowie
naheliegenden Ableitungen. NIST fordert zugleich keine Prüfung oder Sperrung jedes beliebigen
enthaltenen Wörterbuchworts. PassWo übernimmt daraus ausschließlich die Vollwert- und
Kontextidee als didaktische Leitlinie. Die Simulation ist keine produktive Blocklist und keine
NIST-Konformitätsimplementierung.

## Entscheidung

`@passwo/password-analysis` bleibt vollständig lokal, deterministisch und frameworkfrei. Die
Analysekonfiguration erhält die Version `passwo-bounded-whole-recognition-v21`.

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
unterstützten Grenzen liegen. Passwortlisten-Vollwerte werden zusätzlich von ihrer sichtbaren
Segmentierungsautorität getrennt. Überspannt ein Vollwert sichtbare Wortgrenzen, ist selbst kein
gewöhnliches deutsches oder englisches Wort und lassen sich sämtliche sichtbaren Teile in einer
einzigen unterstützten Sprache als gewöhnliche Wörter belegen, bleibt er als Angriffskandidat
erhalten, wird aber nicht als ein Baustein projiziert. Deshalb wird `IchBin` nach außen zu
`Ich | Bin`. Ein vollständiges gewöhnliches Wort hat dagegen Vorrang; `Maiden` beziehungsweise
`MaiDen` wird nicht aufgrund der deutschen Teiltreffer `Mai | den` zerlegt. Sichtbare
Großschreibungsgrenzen allein lösen keine Zerlegung aus. Die bestehende Sperre verhindert weiterhin,
dass `Ist|Rot` zu `Is|tRot` verschoben wird.

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

### Vollpasswort-Disposition

Die äußere Disposition kennt weiterhin nur:

```text
whole-password-recognized
no-whole-password-recognized
```

Ein positiver Zustand besitzt jedoch genau einen dokumentierten internen Weg:

```text
whole-password-recognized-value
whole-password-recognized-generated-candidate
whole-password-recognized-single-anchor-residual
whole-password-recognized-exhaustive-search
```

`whole-password-recognized-value` gilt, wenn ein einzelner zulässiger Befund das vollständige
Passwort abdeckt. Dazu gehören etwa ein vollständiger Passwortlistenwert, ein vollständiges Wort,
ein Konto-/Dienstbegriff, ein Tastaturmuster, eine Folge oder eine Wiederholung.

`whole-password-recognized-generated-candidate` gilt, wenn eine eingefrorene Kandidatenfamilie aus
erkannten Quellen, ihrer begrenzten Kombination und den gelehrten typischen Oberflächenänderungen
das vollständige Passwort enthält. Die Entscheidung beruht nicht mehr auf bloßer Zeichenabdeckung:
Jeder verwendete Bestandteil bringt die Größe seiner Kandidatenquelle mit.

### Gemeinsame Übungsgrenze und Kandidatenquellen

Strukturierte Kandidaten und das abschließende vollständige Durchprobieren verwenden dieselbe
authored Grenze:

```text
MAX_SIMULATION_CANDIDATES = 26^12
                          = 95_428_956_661_682_176
```

Die Grenze entspricht der bereits in S05 dargestellten Familie aus zwölf zufälligen
ASCII-Kleinbuchstaben. Bei der dort verwendeten Demonstrationsannahme von einer Billion Versuchen
pro Sekunde sind das ungefähr 26,5 Stunden. Die Zahl ist eine Übungsgrenze, keine allgemeine
Crack-Zeit, kein produktiver Akzeptanzwert und keine Behauptung über konkrete Angreiferhardware.

Für die strukturierte Kandidatenfamilie gelten eingefrorene, bewusst grobe Quellenobergrenzen:

| Quelle | Kandidatenfamilie |
|---|---:|
| kurze gewöhnliche Wörter bis drei Zeichen | 350 |
| sonstige gewöhnliche Wörter und Namen | 80.000 |
| allgemeine häufige Passwortwerte | 100.000 |
| explizite Passwortanker wie `Passwort`, `Admin` oder `MeinPasswort` | 32 |
| authored Konto- und Dienstkontext | 64 |
| Jahr | 200 |
| Datum | 36.600 |
| Tastaturmuster oder einfache Folge | je 10.000 |
| vorhersagbare Wortfolge | 10.000 |
| Wiederholungsmuster | 100.000 |
| typische Endung | eingefrorene frühe Liste oder begrenzte Ziffer-/ASCII-Symbolform |
| wiederholtes unterstütztes Trennzeichen | 48 Vorlagen |

Diese Werte sind konservative didaktische Familiengrößen und keine empirisch kalibrierten
Rangpositionen. Sie verhindern jedoch die frühere Zielwert-Leckage: Ein im Passwort erkanntes Wort
kostet nicht mehr `1`, sondern seine vollständige authored Quellenfamilie.

Für eine vollständig erklärte Kombination wird gezählt:

```text
Produkt der Quellenfamilien
× unterschiedliche Anordnungen der Quellenkategorien
× unterstützte Trennzeichen- und Endungsvarianten
```

Die Reihenfolge innerhalb gleicher Quellenkategorien ist bereits im kartesischen Produkt enthalten.
Ein bis drei Wiederholungen desselben eingefrorenen ASCII-Trennzeichens können zwischen belegten
Komponenten als Strukturvorlage auftreten. Beliebige unbekannte Zeichen zwischen mehreren Ankern
werden nicht nachträglich als kostenlose Verbindung behandelt.

Dadurch gelten beispielsweise:

- `MeinPasswort` als früher kombinierter Kandidat;
- `M3inPa555w0rt!?` als vollständige begrenzte Variante von `MeinPasswort`;
- `LuftKroneGut` als Drei-Wort-Familie innerhalb der Übungsgrenze;
- `LuftKroneGut123!` und `LuftKroneGutAdmin` als begrenzte Kombinationen ihrer Quellen;
- `KaffeeMorgenPasswortSonneLampe` nicht allein wegen des Ankers `Passwort` als gefunden, weil die
  vier übrigen Wortauswahlen vollständig mitgezählt werden und die gemeinsame Grenze überschreiten.

Die Anzahl erkannter Wörter bleibt damit keine allgemeine Sicherheitsregel. Sie beeinflusst nur
die Größe einer konkret dokumentierten, eingefrorenen Kandidatenfamilie. Eine zufällig erzeugte
Passphrase wird weiterhin über ihre bekannte Erzeugungsmethode begründet, nicht über das Ergebnis
dieser S05-Simulation.

### Genau ein Anker mit frei durchprobiertem Rest

`whole-password-recognized-single-anchor-residual` ist ein eigener, enger Hybridweg. Er gilt nur,
wenn die kanonische Evidenz **genau einen** inhaltlichen Kandidatenanker enthält und daneben ein
nicht leerer, unterstützter Rest verbleibt. Für `r` Restzeichen wird gezählt:

```text
Quellenfamilie des einen Ankers
× Restalphabet^r
× (r + 1) mögliche Ankerpositionen
× gegebenenfalls eine separat belegte typische Endung
```

Das Restalphabet wird aus denselben eingefrorenen Klassen wie beim vollständigen Durchprobieren
gebildet: ASCII- beziehungsweise deutsche Klein- und Großbuchstaben, Ziffern sowie druckbare
ASCII-Interpunktion und Leerzeichen. Nicht unterstützte Unicode-Zeichen eröffnen keinen positiven
Restweg.

Damit kann `PasswortlOtr` trotz des nicht eingeordneten Teils `lOtr` gefunden werden: `Passwort`
ist ein früher Anker, und der vierstellige Rest liegt einschließlich seiner möglichen Positionen
innerhalb der gemeinsamen Grenze. Bei zwei oder mehr erkannten Ankern wird dieser Weg dagegen
vollständig gesperrt. `PasswortmklhSuppe` darf daher nicht so behandelt werden, als seien
`Passwort` und `Suppe` kostenlos bekannt und nur `mklh` übrig. Entweder die gesamte Kombination
besitzt einen begrenzten Quellenweg, oder die Disposition geht zum vollständigen Durchprobieren
über.

### Teilnehmermarkierungen bleiben erklärend

Persönliche, inhaltliche und Satz-/Phrasenmarkierungen werden weiterhin lokal für Reflexion und
Visualisierung verwendet. Sie verändern die Vollpasswort-Disposition nicht. Eine nachträgliche
Markierung erklärt, wie die teilnehmende Person das bereits sichtbare Passwort versteht; sie ist
kein Nachweis, dass ein Angreifer diese konkreten Inhalte vorab kannte oder daraus einen
vollständigen Kandidaten erzeugte.

`TransientPasswordSemanticEvidence` bleibt aus Controller-Kompatibilitätsgründen als optionaler
Laufzeittyp erhalten, wird von `determinePasswordSimulationDisposition` aber absichtlich ignoriert.
Bestätigen, verändern oder entfernen die Nutzenden Markierungen, muss das Ergebnis deshalb
identisch bleiben.

### Vollständiges Durchprobieren als letzter Weg

Erzeugt keine strukturierte Kandidatenfamilie das vollständige Passwort innerhalb der Grenze, wird
als letzter Schritt der vollständige Suchraum der beobachteten Zeichenklassen berechnet.
`whole-password-recognized-exhaustive-search` gilt nur, wenn dieser Suchraum höchstens `26^12`
Zeichenfolgen enthält.

Die Alphabetgröße wird aus den tatsächlich vorkommenden Kleinbuchstaben-, Großbuchstaben-,
Ziffern- und Symbolklassen gebildet. Nicht unterstützte Unicode-Zeichen verwenden im letzten
vollständigen Suchweg weiterhin einen endlichen authored Ersatzpool, damit eine sehr kurze
Zeichenfolge die Prüfung nicht allein durch ihre Zeichenart umgeht.

Strukturierte Kandidatenwege haben Vorrang und behalten ihre spezifische Erklärung. Das
vollständige Durchprobieren erzeugt keine Befund-IDs und weder Suchraum noch Eingabe oder Zeitwert
werden persistiert.

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

Die S05-Markierungen bleiben als `TransientPasswordSemanticEvidence` ausschließlich im Speicher des
laufenden Trainings. Controller dürfen diesen optionalen Typ aus Kompatibilitätsgründen weiterhin
übergeben; die gemeinsame Dispositionsfunktion ignoriert ihn jedoch. S06 übernimmt daher nur das
kategoriale Resultat und die verwendeten automatischen Befund-IDs. Markierungen, Passwortspans und
Kandidatenzählungen werden nicht in Forschungsdaten, Persistenz oder Telemetrie überführt.

Die gerichteten Paarvergleiche in S06 sind von dieser Vollpasswort-Disposition getrennt. Sie
verwenden eine eigene lokale Relation mit exakt drei Ergebnissen: exakte Übereinstimmung,
begrenzte Abwandlung oder kein erkannter begrenzter Weg.

### Gerichtete S06-Abwandlungsrelation

Eine allgemeine Abwandlung wird durch die case-sensitive restricted Damerau-Levenshtein-Distanz
auf NFC-normalisierten Graphemclustern operationalisiert. Einfügen, Löschen, Ersetzen und die
benachbarte Vertauschung kosten jeweils eine Operation. Ein allgemeiner Pfad ist nur zulässig,
wenn die absolute Distanz zwischen eins und drei liegt und durch die Länge des längeren Werts
normalisiert höchstens `0,25` beträgt.

Zusätzlich ist genau ein scenario-spezifischer Makroschritt zulässig: Ein vollständiger Identifier
des Quellkontos darf an unterstützten sichtbaren Verbinder-, Buchstaben/Ziffer-, Camel-Case-
oder Akronym-zu-Wort-Grenzen durch einen vollständigen Identifier des Zielkontos aus einer
getrennten kleinen Liste ersetzt werden. Außerhalb der Identifier sind höchstens zwei
Distanzoperationen, eine normalisierte Restdistanz von höchstens `0,25` und ein zusammenhängender
unveränderter Lauf von mindestens vier Graphemclustern erforderlich. Allgemeine Kontextwörter aus
der S05-Analyse sind keine S06-Ersetzungsidentifier.

Die früheren Haupt- und Oberflächenheuristiken erzeugen keine positiven Relationen mehr. Jahr,
Zahl, Endzeichen, Trennzeichen, Großschreibung und Leetspeak dienen ausschließlich dazu, die
Operationen eines bereits akzeptierten Pfads verständlich zu benennen. Beliebige aus dem
Zielpasswort übernommene Wortbestandteile sind kein Kandidateninventar.

Der Domain-Layer gibt einen geordneten Pfad aus paarweisen `PasswordTransformationStep`-Objekten
mit Quellspan, Zielspan, Operation, Kosten, Erklärungstyp und dem nach diesem Schritt entstandenen
vollständigen Zwischenkandidaten aus. Der Pfad wird nur akzeptiert, wenn seine Anwendung auf den
Quellwert nach NFC-Normalisierung exakt den Zielwert erzeugt. React rendert diese Schritte und
Zwischenkandidaten sowie danach das kategoriale Resultat; es sortiert keine getrennten
Evidenzlisten zusammen und berechnet keine zweite Ähnlichkeitslogik. Der Angriffsweg bewegt sich
erst nach der sichtbaren vollständigen Kandidatenbildung zum Zielkonto.

Die Distanzgrenzen sind eine vorab festgelegte konservative Trainingsoperationalisierung. Sie sind
weder ein universeller wissenschaftlicher Klassifikationsstandard noch eine Schätzung realer
Angriffswahrscheinlichkeit. Passwortwerte, Spans, Distanzen und Relationen werden nicht in
Forschungsdaten, Persistenz oder Telemetrie überführt.

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
Beispielpasswörter. Er enthält direkte Volltreffer, Zwei-/Drei-/Mehrwortfamilien innerhalb und
außerhalb der gemeinsamen Grenze, vollständige Transformationen, genau einen Anker mit Rest,
mehrere Anker mit unerklärtem Rest, vollständige Suchräume, Kontokontext, Wiederholungen, Folgen,
Tastaturmuster, Unicode und Überlappungen.

Zusätzlich durchlaufen mindestens 100 verschiedene End-to-End-Beispiele zuerst
`analyzeFictionalPassword(...)` und anschließend
`determinePasswordSimulationDisposition(...)`. Dieser Korpus prüft insbesondere kleingeschriebene
und CamelCase-Wortfolgen, vollständige Zwei-/Dreibuchstabenpartitionen, kuratierte Abkürzungen,
Tastaturspans als Segmentgrenzen, wiederholte Trennzeichen, Kompositum- und Jahrespriorität,
Kontokontextvorrang, getrennte und einmal veränderte Wiederholungen, die Unabhängigkeit von
Teilnehmermarkierungen sowie die gemeinsame S05-/S06-Disposition. Segmentierungsfehler können dadurch
nicht durch bereits synthetisch vorgegebene Befunde verdeckt werden.

Der Korpus belegt ausschließlich Reproduzierbarkeit und beabsichtigtes Verhalten der authored
Trainingsregel. Er ist keine empirische Validierung von Sensitivität, Spezifität oder
Passwortstärke.

Version v21 korrigiert ausschließlich die bereits spezifizierte sichtbare Projektion: Das authored
Wort `Komet` bleibt an unterstützten Trennzeichen atomar, und ein vollständiger
Passwortlistenkandidat wie `ichbin` bleibt als Ratekandidat erhalten, ohne eine belegte
lückenlose Kurzwortpartition zu verdecken. Eine ohne sichtbare Grenzen mehrdeutige Folge wie
`ichbineineispo` erhält dagegen keine künstlich erzwungene Einzelzerlegung. Kandidatenbudget und
Disposition bleiben unverändert.

## Konsequenzen

- Erkannte Zielbestandteile sind nicht mehr kostenlos: Jede Komponente bringt ihre eingefrorene
  Quellenfamilie in die Kandidatenzählung ein.
- Ein kurzer unbekannter Rest kann genau einen klaren Anker nicht allein dadurch verbergen, dass er
  davor oder dahinter steht. Mehrere Anker mit unbekanntem Rest erhalten diesen Sonderweg nicht.
- Drei gewöhnliche 80.000er-Wortstellen können innerhalb der Übungsgrenze liegen; vier liegen
  darüber. Diese Grenze beschreibt nur die authored Kandidatenfamilie und keine allgemeine
  Passphrasenstärke.
- Teilnehmermarkierungen bleiben lehrreiche Reflexion, können aber keinen positiven Treffer mehr
  erzeugen.
- Konto-/Dienstbezüge erhalten eine eindeutige primäre Einordnung statt konkurrierender innerer
  Wörterbuchtreffer.
- zxcvbn-Updates, Wörterbuchänderungen, Quellenfamilien, Kandidatenbudget, Alphabetklassen oder
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

### Wortanzahl als pauschale Stärke- oder Trefferregel

Verworfen. Die aktuelle Regel zählt stattdessen die vollständige eingefrorene Quellenfamilie jeder
Wortstelle. Dass drei 80.000er-Wortstellen innerhalb und vier außerhalb der Übungsgrenze liegen,
ist eine Eigenschaft dieses transparenten Kandidatenmodells, keine allgemeine Aussage „drei Wörter
schwach, vier Wörter stark“. Die S07/S08-Passphrase beruht weiterhin auf einer bekannten zufälligen
Wortauswahl und wird davon getrennt begründet.

### Externe Pwned-Password-Abfrage oder generative KI

Verworfen wegen Datenschutz, Verfügbarkeit, fehlender deterministischer Reproduzierbarkeit und
der Verschiebung des Thesisumfangs.

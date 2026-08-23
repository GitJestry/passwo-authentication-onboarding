# Training Segment Index

Seitenangaben beziehen sich auf die im Trainingsdokument ausgewiesene interne Paginierung.

| ID | Titel / Funktion | Quelle | Primäre Foci | Kernmechaniken |
|---|---|---:|---|---|
| S00 | Entry and safety boundary | 2 | TF1, TF2, TF6 | Display name, Safety Note, Pflichtbestätigung, PassWo-Flug |
| S01 | Ordinary account setup | 3 | TF2, TF3 | drei fiktive Passwörter, freie Tabreihenfolge |
| S02 | Konten kennenlernen | 4–7 | TF2, TF3, TF4 | freie Kontowahl, Unlock, geführte Vorschausequenzen, 0/3–3/3 |
| S03 | Wieder anmelden | 8–11 | TF1, TF3, TF6 | Abrufbarkeit, Skip ohne Beschämung, Status |
| S04 | Datenleck bei Campusgram | 12 | TF4 | Warnung im Browser-Tab, kurzer Übergang in die Angreiferperspektive |
| S05 | Einzelstärke des Passworts | 12–35 | TF3, TF4, TF6 | Bestandteile, Aufbau, freies Ausprobieren, Zusammenführung |
| S06 | Passwortvergleich und Ausbreitungswege | 36–44 | TF3, TF4 | identisches Passwort / konkret ableitbare Variante / kein ableitbarer Weg erkannt, tatsächliche und hypothetische Pfade |
| S07 | Passphrase erstellen | Nutzerauftrag 2026-08-13 | TF3, TF5 | eingeloggte Campus-Websites, zusätzlicher Passphrasen-Such-Tab |
| S08 | Passwörter überarbeiten | 50–53 | TF3, TF5, TF6 | sechs zufällige Wörter, adaptive Bearbeitung |
| S09 | Passwortprinzipien zusammenfassen | 53–55 | TF4, TF5 | verdunkelte Abschlusszusammenfassung nach blockiertem Rücklauf |
| S10 | Zusammenfassung Passwort | 55–57 | TF6 | stark, einzigartig, abrufbar |
| S11 | Von drei zu vielen Konten | 57–60 | TF1, TF2, TF4, TF6 | Skalierungsproblem, Übergang Passwortmanager |
| S12 | Passwortmanager | 60–65 | TF2, TF3, TF4, TF6 | Generator, Save, Autofill, Vault, Recovery, Systemwahl |
| S13 | Passwort kann bekannt werden | 65–66 | TF4 | Brücke zu MFA |
| S14 | Mehrere Faktoren | 66–67 | TF2, TF3, TF6 | Wissen/Besitz/Inhärenz, Aktivierungssimulation |
| S15 | Recovery-Hinweis | 67–68 | TF6 | geschützter Wiederherstellungscode, Grenzen |
| S16 | Priorisierung/Ausweitung | 68 | TF1, TF6 | wichtige Konten zuerst, MFA wo verfügbar |
| S17 | Integrierte Zusammenfassung | 69–71 | TF4, TF6 | vier Schutzebenen, letzter Guardrail |

## Implementierte S02-Version

- Die drei Hauptkonten bleiben frei wählbar. Nach einer Auswahl werden Entsperren,
  Einzelaufbau der verbundenen Knoten und die erste Vorschau automatisch gestartet; bis zum
  Kontoabschluss sind andere Konten und Detailknoten gesperrt.
- Master Campus zeigt Workspace, Services und Cloud, Campus E-Mail vier konkrete Nachrichten-
  und Kontovorgänge und Campusgram Direktnachrichten, Kontakte sowie Beiträge. Jede Vorschau
  erscheint direkt und bietet `Nächstes`; der letzte Knoten verwendet `Fertig`.
- Die kompakte responsive Vorschau liegt abhängig vom Konto rechts beziehungsweise links über
  dem Netzwerk und wird durch zwei Projektionslinien mit dem aktiven Detailknoten verbunden.
  Während der Vorschausequenz bleibt nur der aktive Kontozweig sichtbar; mit `Fertig` erscheint
  das vollständige Netzwerk wieder.
- Ein Konto gilt erst nach allen seinen Vorschauen als angesehen. Der globale Abschluss zeigt
  einmalig ein Häkchen mit `Konten erkundet`; Vorschauinhalte und der fiktive Benutzername bleiben
  vollständig flüchtig.

## Implementierte S05-Version

- Die S05-Einleitung führt von der verdeckten Kandidatenprüfung über die rot dargestellte
  Systempasswort-Zufallsfolge, eine merkbare Kombination und das Bausteinmodell direkt zum ersten
  Ausgangspunkt des Angreifers. Die frühere Vorschau aus drei Strategiekarten und der zusätzliche
  dreistufige Kategorienvorlauf entfallen.
- `Häufig verwendete Passwörter und Zeichenfolgen` beginnt mit einer ausblendenden
  Kategorieübergabe und einer synchronisierten Laufbandmaschine. Eine umfangreiche linke Liste
  gibt im Zwei-Sekunden-Takt einen lesbaren Baustein auf das von links laufende Band. Erst wenn er
  die kleine mittlere Logo-Box erreicht, wechselt die schmale rechte Liste zu den deterministisch
  erzeugten und fortlaufend scrollenden Varianten dieses Bausteins. Beide Listen blenden unten aus
  und deuten ihre Fortsetzung an.
- Während einer Erklärung und der manuellen persönlichen Auswahl zeigt die Statusleiste nur den
  aktuellen Kategorienamen mittig über seinem großen Symbol. Die automatischen Prüfungen werden
  durch die jeweilige Prüfankündigung und eine handlungsspezifische Prüfaktion ausgelöst; nach
  `Einordnung übernehmen` erscheint ebenfalls die kompakte Ansicht mit den drei
  Bestandteilkarten und `Typische Veränderungen` als mittig verbundener Kreuzbedingung. Dort
  leuchtet die gerade geprüfte Kategorie; in der gemeinsamen Abschlussansicht leuchten alle Karten.
  Ein zusätzlicher Befundfilter entfällt.
- Das fiktive Campusgram-Passwort liegt bereits vor dem ersten Prüfklick unverdeckt in der
  kanonischen Bausteinansicht ohne Verbergen-Schalter vor. Die vier Prüfungen legen ausschließlich
  ihre flüchtigen lokalen Befunde frei: nicht betroffene Bausteine bleiben neutral, betroffene
  Bausteine leuchten ohne Lageänderung. Bereits geprüfte Befunde bleiben in den folgenden
  Kategorieprüfungen sichtbar. Ab dem ersten Befund stehen an den Bausteinen statt Textlabels
  deutlich größere, gegebenenfalls vertikal gestapelte Logo-Infokarten. Hover oder Tastaturfokus
  nennt ausschließlich die konkrete Einstufung, beispielsweise `Persönliche Angabe` oder
  `häufiges Datum`; die Kacheln bleiben auch während der betroffenen Sprechblasen erreichbar. Die kompakte
  Übersicht `Früh geprüft` listet jede geprüfte Kategorie einmal mit großem, responsiv skaliertem
  Logo und vollständigem Kategorienamen; einzelne erkannte Begriffe erscheinen dort nicht. Diese
  Übersicht bleibt ausschließlich direkt nach den drei Kategorien sichtbar und entfällt in der
  späteren Fundansicht. Befunde der ersten Prüfung unterscheiden häufig verwendetes Passwort oder
  Wort, Tastaturfolge, Zahlenfolge und naheliegende Jahreszahl. Die Rückmeldung benennt die erkannten
  Bausteine; bei einem vollständig erkannten Einzelbaustein weist sie auf den bereits gefundenen
  Passwortkandidaten hin. Die gemeinsame
  Abschlussansicht übergibt anschließend unverändert an `Vorhersehbarer Aufbau`.
- Nach der Zusammenfassung `Früh geprüft` werden die gelben Bausteinflächen für häufige
  Bestandteile und die blauen Bausteinflächen für Konto-/Dienstbezug nicht weitergeführt. In der
  Campusgram-Abschlusszusammenfassung und den folgenden Strukturphasen bleiben die drei früh
  geprüften Kategorien ausschließlich über größere, vertikal gestapelte Info-Logos an den jeweils
  erkannten Bausteinen sichtbar. Hover oder Tastaturfokus
  öffnet eine gläserne Karte nur mit der konkreten Einstufung. Persönlich markierte Bereiche
  leuchten zeichenpräzise und zurückhaltend pink; das persönliche Kategorienlogo steht unter jedem
  überlappten Baustein, ohne dessen Grenzen zu verändern. Eng anliegende, dunklere und zwei Pixel
  starke vertikale rosa Endstriche begrenzen jeden zusammengehörenden persönlichen Bereich. Der QA-Einstieg
  `s05-s06-transition` enthält zusätzlich einen ausschließlich flüchtigen persönlichen Befund mit
  überlappendem Bereich, um die Blockprojektion visuell prüfen zu können.
- Die Laufbandmaschine wird für alle vier Kategorien wiederverwendet. Ihre linke Beispieltabelle
  trägt statt einer Textüberschrift das große Symbol der aktuellen Kategorie, verwendet nur fest
  authored Beispiele und führt über die mittlere Beschriftung `Typische Veränderungen generieren`
  zur schneller scrollenden Variantenliste. Bei `Persönliche Angaben` bleibt dieselbe kanonische
  Bausteinzeile einschließlich der zuvor erkannten Kategorie sichtbar. Die Zeichen sind darin per
  Ziehen oder Tastatur auswählbar und durch erneutes Betätigen entfernbar. Persönliche Bereiche
  färben ausschließlich ihre Schrift pink und überlagern vorhandene gelbe oder blaue Bausteine,
  ohne deren Fläche oder Grenzen zu verändern. Die Übernahme bleibt auch ohne Auswahl möglich und
  erzeugt dann keinen persönlichen Befund. Ein häufig verwendeter Bereich wird nicht zusätzlich
  als Konto-/Dienstbezug dupliziert; eine Farbhierarchie zwischen automatischen Kategorien
  entfällt.
- S05.0 bis S05.4 verwenden die internen Seiten 12 bis 35 als Inhaltsquelle und sind im Design Lab
  sowie im realen Supportive-Training zwischen S04 und S06 vollständig durchspielbar. Beide Pfade
  verwenden dieselbe Komponente und denselben lokalen Controller.
- S05.2 beginnt mit der erneut sichtbaren annotierten Beispielkombination und erklärt
  vorhersehbare Kombinationsmuster. Danach erscheinen die drei festen Demonstrationsgruppen
  `Naheliegende Zusammenhänge`, `Vorhersehbare Satz- und Phrasenstrukturen` und
  `Wiederholungsmuster` schrittweise als linke, mittlere und rechte Bausteinlisten. Die jeweils
  erklärte Liste einschließlich Titel wird weiß pulsierend umrahmt. Bei der anschließenden lokalen
  Wiederholungsprüfung bleiben alle drei Listen sichtbar; das fiktive Campusgram-Passwort steht
  mittig darunter und markiert erkannte Wiederholungen mit denselben Bausteinen.
- Die lokale Zusammenhangsreflexion beginnt mit Zusammenhang A. Ein angeklickter Baustein erhält
  wieder unmittelbar die Farbe des aktiven Zusammenhangs; weitere Bausteine erweitern dieselbe
  farbige Gruppe. Erst zwei gewählte Bausteine bilden einen vollständigen Zusammenhang, und ein
  weiterer Zusammenhang kann erst angelegt werden, wenn alle vorhandenen Gruppen mindestens zwei
  Bausteine enthalten. Eine zusätzliche Linienebene und eine Hover-Vorschau entfallen. Die
  authored Einstiegsvorschau und statischen Zusammenhangsbeispiele verwenden wieder ihre
  ursprünglichen grünen Bausteinflächen und CSS-Verbindungslinien. Die beschrifteten Steuerungen A
  bis C bleiben neben der Gruppenfarbe als Bedeutungsträger erhalten.
- Der aus der flüchtigen Campusidentität abgeleitete Benutzername und die fiktive Konto-Mail
  werden der lokalen zxcvbn-Auswertung als zusätzliche Kontoanhaltspunkte übergeben. Sie bleiben
  im Arbeitsspeicher und werden weder persistiert noch exportiert.
- Die lokale Laufzeitanalyse benennt nur exakte Wiederholung, eine feste Konto-/Kontextbeziehung
  mit erkanntem Zahlenmarker oder Anhang sowie eine begrenzte Beziehung bereits erkannter
  Bestandteile. Andernfalls lautet der Befund ausschließlich „kein einfacher Zusammenhang
  erkannt“.
- S05.3 ordnet zunächst eine authored Passphrasen-Generator-Anschauung und zwei gleich lange
  Zeichenmix-Beispiele in zwei gleich aufgebauten Passwort-erstellen-Anzeigen ein. Der
  vorhersehbare linke Kandidat wird mit Angreifersymbol, Textstatus `Früher Treffer`, grauer
  Überlagerung und roter Kontur von der reinen Regelanzeige getrennt. Danach berechnet das Segment theoretische Suchräume ausschließlich für
  deklarierte Demonstrationen mit unabhängiger Zufallsauswahl, festem Zeichenvorrat,
  vollständigem Durchprobieren und einer Billion Versuchen pro Sekunde. Die Längenschätzung
  umfasst 12 bis 20 Kleinbuchstaben; ihre Messlatte bleibt in der folgenden Auswertung sichtbar.
  Kandidatenzahlen bleiben exakte Ganzzahlen; für das fiktive Passwort werden keine Zeit,
  effektive Länge, Entropie oder Gesamtstärke berechnet.
- Nach Abschluss der Kleinbuchstaben-Skala vergleicht eine gelbe Kugel das vorhandene Modell für
  12 zufällige Zeichen aus allen vier Zeichentypen mit der 15-Kleinbuchstaben-Kugel. Der
  unveränderte Vergleichszoom zeichnet zusätzlich die Kleinbuchstaben-Kugeln bis 20 und zeigt
  davon den in den Viewport passenden Ausschnitt; nur die gelbe und die 15-Kleinbuchstaben-Kugel
  bleiben deckend, alle anderen Kugeln sind abgedunkelt. PassWo begrenzt den Vergleich gegen die
  Auswahl selbstgewählter Passwörter. Bei der 15-Zeichen-Orientierung und der anschließenden
  Ankündigung der zwei weiteren Längengründe zoomt die Ansicht wieder auf die grüne Kugel. Danach
  wird die Skala ohne Kugeln fortgeführt. `Datensicherheit` erscheint zunächst als merkbares
  15-Zeichen-Wort. Der Vergleich mit `Hat`, `Bin`, `Kuh`, `Ich` und `Tee` zeigt erst nur die fünf
  Bausteine und die Mindestlänge; im nächsten Sprechschritt kommen der Pool aus etwa 350 sehr
  kurzen Wörtern und die authored Zeitkugel `5,25 Sekunden` hinzu. Danach ersetzt die Folge
  `Datensicherheit`, `Lobotomie`, `Zugspitze`, `Unbefugt` die bisherige Einzelwortanzeige in-place.
  Ihre Kugel wächst auf `1,3 Jahre`, während das Fünfwortbeispiel links mit einer 2-Pixel-Kugel
  sichtbar bleibt. Der zweite Längengrund beginnt mit derselben Vierwort-/Deutsche-Wortliste-
  Komposition wie bisher. Deutsche, spanische, französische und japanische Wortlisten werden
  anschließend als ungefähr vierfacher Pool mit `332 Jahre` gezeigt. Der letzte Vergleich kehrt
  zur deutschen Wortliste zurück: Links bleiben vier deutsche Wörter und `1,3 Jahre` mit einer
  2-Pixel-Referenzkugel; rechts stehen `6 Wörter` aus `Datensicherheit`, `Lobotomie`, `Zugspitze`,
  `Unbefugt`, `Posen`, `Trampolin` sowie `8,3 Milliarden Jahre`. Auf beiden Seiten ist nur der
  deutsche Wortlistenstapel sichtbar. Länderkarte, Wortlisten-Schätzfrage und Zeichenraum-Analogie
  entfallen; danach folgt direkt die bestehende lokale Campusgram-Auswertung. Die Demonstration
  analysiert oder persistiert keine Eingabe.
- Die S05-Simulationsdisposition (`S05_CONTENT_VERSION 2.126.0`, Analysekonfiguration
  `passwo-bounded-whole-recognition-v17`) bleibt auf den vollständigen fiktiven Wert begrenzt:
  `whole-password-recognized` entsteht durch einen direkten Vollwert oder eine dokumentierte
  begrenzte Kandidatenfamilie aus kanonischen Ankern und positionsunabhängigen Restzeichen oder
  durch einen flüchtigen, von der teilnehmenden Person bestätigten semantischen Kandidatenweg.
  Deutsche und englische Wortzerlegungen bleiben sprachgebunden. Die häufigkeitsgeordneten
  Sprachkorpora werden über alle Wortlängen durch eingefrorene Rang-, Schrift- und
  Korpusartefaktgrenzen bereinigt; kurze Wörter bleiben nur exakt in vollständigen Segmenten
  beziehungsweise Partitionen zulässig. Kuratierte Abkürzungen werden davon getrennt behandelt.
  Eigene maximale Tastaturspans erzeugen Grenzen für angrenzende Wörter; vollständige
  Kontobegriffe, Jahre und authored Komposita haben Vorrang vor inneren Wörterbuch- beziehungsweise
  Endungstreffern. Getrennte und einmal veränderte Wiederholungen werden über mehrere belegte Spans
  der bestehenden Wiederholungskategorie erfasst. Mehrere gewöhnliche Wörter führen unabhängig von
  ihrer Anzahl nicht allein zu einem Volltreffer. Persönliche Markierungen, Inhaltsgruppen und
  Satz-/Phrasenverbindungen können nach Bestätigung additiv einen vollständigen semantischen Weg
  bilden; sie können keinen automatischen Treffer aufheben und keine Sicherheit bestätigen. Die
  kompakte Abschlussauswertung nennt zuerst den Vollpasswort-Status,
  zeigt nur dessen kausale Befunde beziehungsweise klar bezeichnete Teilbefunde und ergänzt die
  15-Zeichen-Orientierung kurz und getrennt. Danach endet S05 direkt; Wiederverwendung und
  Ähnlichkeit folgen in S06. Eine fehlende Vollerkennung bedeutet nicht stark, sicher, zufällig
  oder unangreifbar. Numerische zxcvbn-Guess-Werte werden weder angezeigt noch für diese
  Disposition verwendet. Die bestätigte S05-Evidenz bleibt flüchtig und wird für Campusgram an
  dieselbe S06-Disposition übergeben; das S06-Eingabemodell ist für dieselbe spätere Erhebung bei
  Master Campus und Campus E-Mail vorbereitet.
- Die sechs Beispielwörter sind ein festes Demonstrationsbeispiel. Wortliste und produktiver
  Generator bleiben ausschließlich S08 vorbehalten.

## Implementierte S06-Version

- S06 verwendet die internen Seiten 36 bis 44 als Inhaltsquelle und ist im realen
  Supportive-Training zwischen S05 und S07 integriert. Design Lab
  und Teilnehmerpfad verwenden dieselbe Komponente, denselben lokalen Controller und dieselbe
  Projektion; nur die Eingabequelle unterscheidet sich zwischen Fixtures und flüchtigen
  Übungswerten.
- Die Laufzeitwerte werden beim bestätigten Eintritt einmal lokal ausgewertet. Drei
  Einzelanalysen und sechs gerichtete Kontovergleiche bleiben flüchtig und werden weder in den
  globalen Machine Context kopiert noch an eine Study API gesendet. Sichtbar projiziert werden
  die beiden Wege von Campusgram sowie anschließend ausschließlich Master Campus zu Campus
  E-Mail.
- Der Timing-Handshake lautet S05 segment-end, S06 segment-start, S06 segment-end. Ein
  fehlgeschlagener späterer Write wiederholt keine bereits bestätigte Grenze.
- Die Projektion verwendet die drei fiktiven Konten Master Campus, Campus E-Mail und Campusgram.
  Campusgram prüft die Beziehungen zu beiden anderen Konten; Master Campus anschließend nur noch
  die im neuen Sprechablauf angekündigte Beziehung zu Campus E-Mail. Nach diesem Vergleich ordnet
  eine bedingte PassWo-Blase die erkannte Verbindung oder die begrenzte Nicht-Erkennung ein und
  führt erst danach zum lokalen Campus-E-Mail-Check. Campus E-Mail bildet am Ende ausschließlich
  einen lokalen Einzelcheck; bei einem Fund
  werden seine verbundenen Funktionen betroffen dargestellt, bei Schutz folgt kein
  hypothetischer Pfad. Danach kehrt die Ansicht zur tatsächlichen Campusgram-Ausgangslage zurück.
  Campusgram-Inhalte bleiben lokale
  Inhaltszuordnungen und werden nicht als SSO-Dienste modelliert.
- Nach der Campus-E-Mail-Perspektive stellt der Controller ohne zusätzliche Rückkehr- oder
  Endübersichtsblase die tatsächliche Campusgram-Ausgangslage wieder her. PassWo führt direkt mit
  dem neuen Folgenschutz-Satz zu S07.
- Beim Perspektivwechsel zu Master Campus und Campus E-Mail werden die übrigen Knoten zunächst
  ausgeblendet. Das jeweilige fiktive Passwort zeigt automatisch erkannte Kategorien und
  Wiederholungen und nimmt über `Gruppen` beziehungsweise `Struktur` ausschließlich flüchtige
  Zusatzangaben entgegen. Eine separate Karte `Früh geprüft` entfällt. An den Bausteinen stehen
  deutlich größere, gegebenenfalls gestapelte und an ihre Anzahl angepasste Info-Logos. Hover oder
  Tastaturfokus öffnet eine gläserne Karte mit Kategoriename und konkreter Einstufung.
  Persönliche Bereiche leuchten zeichenpräzise lila-pink und können über mehrere Bausteine reichen,
  deren persönliches Kategorienlogo die Zuordnung zusätzlich sichtbar macht. Der aktive
  Kontozweig einschließlich seiner Unterkonten bleibt dabei sichtbar; die Gruppensteuerung beginnt
  mit `Gruppe 1` und kann wie in S05 über den Plus-Button erweitert werden. Die Bausteine beginnen
  ohne Kategoriefläche transparent; erst eine
  Gruppenzuordnung färbt die gesamte Bausteinfläche in der Gruppenfarbe. Der Strukturmodus setzt
  wie in S05 gerichtete Pfeile zwischen benachbarten Bausteinen. Wiederholungen erhalten nur am
  ersten Wiederholungsbaustein den Multiplikator und kein zusätzliches Textlabel. Nach `Fertig`
  verschwindet die Reflexionsfläche. Gleichzeitig mit PassWos Ergebnistext zeigt das Kontennetz
  den betroffenen roten Kontozweig oder den geschützten Kontozweig samt Schutzschild. Bei Master
  Campus startet `Angriff starten` anschließend nur noch den Vergleich mit Campus E-Mail; beim
  Campus-E-Mail-Einzelcheck führt `Weiter` direkt zum S07-Übergang.
- Ein hypothetischer Master-Campus-Befall setzt vor dem Vergleich mit Campus E-Mail den Angreifer und
  den gesamten Kontozweig sichtbar auf betroffen. Der anschließende Passphrasen-Übergang bewahrt
  die wiederhergestellte Campusgram-Schlussansicht unverändert.
- Eine Beziehung ist ausschließlich `exact-match`, `derived-variant-match` oder
  `no-derived-path-recognized`. Eine abgeleitete Variante benötigt einen konkreten begrenzten
  Transformationsweg, dessen erzeugter Kandidat den vollständigen Zielwert trifft; höchstens eine Hauptveränderung und drei kleine Oberflächenveränderungen werden kombiniert.
- Gemeinsame Teilstrings und allgemeine Ähnlichkeitswerte begründen keinen Treffer. Zusätzlich zu
  den authored Wegen kann genau ein an Trennzeichen, Ziffer-/Buchstabenwechsel oder Camel Case abgegrenzter Buchstabenbaustein
  im ansonsten stabilen Muster ausgetauscht werden; zwei freie Bausteinersetzungen bleiben
  ausgeschlossen. Eine einzelne Zeichenoperation zählt nur als explizit begrenzter erzeugter
  Kandidatenweg. Ein nicht erkannter Weg bedeutet nur, dass diese Simulation keinen direkten Weg
  erkannt hat.
- `S06_CONSEQUENCE_CONTENT_VERSION 2.37.0` übernimmt die S05-Vollpasswort-Disposition ohne eigene
  Guess-Schwelle. Nur `whole-password-recognized` öffnet den tatsächlichen lokalen Vorfallspfad;
  `no-whole-password-recognized` bleibt eine begrenzte Nicht-Erkennung und kein Stärkeurteil.
- Jeder der drei flüchtigen S06-Kontoeingänge akzeptiert optional dieselbe bestätigte semantische
  Evidenz aus persönlichen Bereichen, Inhaltsgruppen und Satz-/Phrasenverbindungen. Aktuell wird
  sie aus dem bestehenden S05-Schritt für Campusgram übergeben; Master Campus und Campus E-Mail
  sind für einen späteren identischen lokalen Reflexionsschritt vorbereitet, ohne eine zweite
  Bewertungslogik oder Persistenz einzuführen.
- Vier deterministische Design-Lab-Fixtures decken exakte Wiederverwendung plus Ableitung, einen
  gestoppten ersten Vorfall, zwei blockierte Folgewege und eine gemischte
  tatsächliche/hypothetische Darstellung ab.

## Implementierte S07-Version

- Der Nutzerauftrag vom 14. August 2026 ersetzt die bisherige Auswertung vollständig. Nach S06
  erscheint zuerst die Fortschrittskarte `Passphrase erstellen`; danach beginnt S07.
- S07 zeigt Master Campus, Campus E-Mail und Campusgram erneut als bereits angemeldete
  Dashboard-Websites. Der Browser startet auf Campusgram.
- Nach dem Öffnen der Campusgram-Passwortänderung führen Plus-Symbol, Suchsymbol und erster
  Ergebnistreffer nacheinander zur kompakten, nicht scrollenden Passphrase-Werkstatt.
- Die Werkstatt erzeugt deterministisch ausschließlich lokale fiktive Wortfolgen. Bedienbar sind
  nur die neue Wortfolge, vier Trennzeichen und `Kopieren`; Groß-/Kleinschreibung,
  Kapitalisierung, Zahlen und weitere Generatoroptionen werden nicht angeboten. Die Auswahl wird
  weder persistiert noch exportiert. Jede Ausgabe erhält unmittelbar die zugeordnete
  PassWo-Erinnerungshilfe.
- Der direkte QA-Einstieg lautet `s07-passphrase-search`. Die bisherigen fünf
  Auswertungs-Fixtures und ihre Renderer sind entfernt.
- Der Campusgram-Datenleckhinweis bietet auch in S07 den bereits in S04 verwendeten lokalen
  `Passwort jetzt ändern`-Ablauf. Die Umgebung wird bis zum Öffnen dieses Ablaufs abgedunkelt,
  während der Hinweis leuchtet; bei Reduced Motion bleibt der Leuchtrahmen statisch. Alle
  Formulareingaben bleiben flüchtig und werden verworfen.
- Nach dem Campusgram-Wechsel trennt S08 lokale Kontobefunde von offenen Passwortbeziehungen.
  Ein lokaler Volltreffer bleibt an das betreffende Konto gebunden. Bei Wiederverwendung oder
  Ähnlichkeit sind beide Endpunkte der roten gestrichelten Beziehung als mögliche Änderung
  auswählbar. Die kompakten Beziehungslabels stehen ohne schwarzen Hintergrund direkt an den
  Kanten und bleiben durch helle Buchstaben, dunkle Kontur und Schattierung lesbar.
  `Einzigartige Passphrase verwenden` löst den lokalen Befund des gewählten Kontos
  und alle inzidenten Beziehungen; deren Kanten zerfallen sichtbar mit einer kleinen Rauchwolke
  am jeweiligen Kantenmittelpunkt. Bei Reduced Motion entfällt dieser Zusatzeffekt. Danach wird
  der verbleibende Handlungsbedarf erneut aus lokalen Befunden und noch offenen Beziehungen
  abgeleitet. Die in S07 berechnete minimale Kontomenge ist nur eine Empfehlung beziehungsweise
  ein Default und keine Einschränkung der S08-Auswahl. Schutzschild und kurzes Konfetti
  bestätigen jede ausgeführte Aktion, bevor der abschließende Angriffsrücklauf beginnt.
- Nach dem Campusgram-Wechsel projiziert S07 die lokalen S06-Befunde für die beiden anderen
  Konten in genau einer gemeinsamen PassWo-Rückmeldung. Sie unterscheidet nur noch, ob mindestens
  eine erkannte Wiederverwendung oder Ähnlichkeit und ob mindestens ein lokal leicht erratbares
  Passwort vorliegt. Konkrete Konten und Verbindungen bleiben im Netzwerk sichtbar. Ohne beide
  Befunde folgt keine zweite Sprechblase; andernfalls verweist sie auf die direkte Absicherung
  der betroffenen Konten im Netzwerk. Stark und einzigartig eingeordnete Konten bleiben ohne
  kontoweise Einzelmeldung; nur offene Konten erhalten in S08 eine Schutzaktion. Sind beide
  bereits stark und einzigartig, beginnt S08 danach unmittelbar mit dem Angriffsrücklauf.
- `S07_PASSPHRASE_SEARCH_CONTENT_VERSION 4.16.0` beschreibt den zweistufigen
  Passphraseneinstieg, Datenleckhinweis, lokalen Passwortwechsel, Suchseite, Werkstatt und
  die kompakte adaptive Kontenzusammenfassung;
  `S08_NETWORK_REPLAY_CONTENT_VERSION 3.6.0` beschreibt die Netzabkürzung und den anschließenden
  bedienbaren Angriffsrücklauf. Es werden
  keine neuen Teilnehmer- oder Trainingswerte persistiert oder exportiert.

## Implementierte S08--S09-Version

- S08 beginnt ohne PassWo direkt auf dem Desktopnetzwerk. Nur Master Campus und Campus E-Mail
  erhalten bei einem verbliebenen lokalen Stärke- oder Einzigartigkeitsbefund die Knotenaktion
  `Einzigartige Passphrase verwenden`; die fiktive Ersetzung bleibt automatisch und vollständig
  flüchtig. Schild und kurzes Konfetti bestätigen die Handlung.
- Der große Button unten in der Mitte startet den erneuten Angriff. Der Angreifer bleibt oberhalb
  von Campusgram, während alle sechs grünen Liniensegmente der drei Kontopaare gleichzeitig
  starten. Je zwei Segmente lassen in der Seitenmitte Abstand für ein grünes Vergleichsschild;
  die Kontoknoten behalten ihre blauen S06-Passwortschilde. Blaue Verbindungslinien oder blaue
  Kreise an den Vergleichsschilden, die Passwortvergleich-Vorschau und ein
  `Was wäre, wenn?`-Modus entfallen.
- Nach dem vollständigen Dreieck führt `Zur Zusammenfassung` ohne PassWo direkt nach S09. Dort bleibt das
  Desktopnetzwerk abgedunkelt hinter der transparenten Liste `Starke Passwörter auf einen Blick`
  sichtbar. Die sechs unnummerierten Hinweise stehen zwischen dem großen grünen Vergleichsschild
  und dem großen blauen Passwortschild. `Abschließen` entfernt die Überlagerung und zeigt das
  zuletzt verlassene Schutzdreieck ohne Angreifer und mittiges Ergebnisfeedback.
- `S09_PASSWORD_SUMMARY_CONTENT_VERSION 2.3.0` beschreibt ausschließlich diese lokale
  Abschlussüberlagerung ohne äußere Box, ihre rein textbasierten authored Hervorhebungen sowie
  den Rücksprung. Es entstehen keine neuen persistierten Felder oder Trainingswrites.
- Der direkte QA-Einstieg `s08-network-replay` startet unmittelbar bei den betroffenen
  Kontoknoten; der bestehende S07-QA-Einstieg führt nach seinem Abschluss ebenfalls dorthin.

## Sections

- `passwords`: S00–S11
- `password-manager`: S12–S13
- `mfa`: S14–S17

## Globale Interaktionsregel

Bei erklärenden Simulationen gilt grundsätzlich:

1. PassWo erklärt einen kurzen Gedanken.
2. Eine zentrale visuelle Veränderung geschieht.
3. Der Nutzer kann die Animation wiederholen oder weitergehen.

## Globale Datenschutzregel

- Nur fiktive Passwörter.
- Standardmäßig maskiert; lokaler Reveal ist möglich.
- Eingaben und Analysen bleiben im Browser-Arbeitsspeicher.
- Keine Trainingsentscheidung wird in Study Responses codiert.

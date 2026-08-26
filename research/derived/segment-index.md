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
| S13 | Ein neues und ein bestehendes Konto | Nutzerauftrag 2026-08-25 | TF2, TF3 | My-Shop-Registrierung; Muster Bank: Passwort erzeugen, beim Dienst ändern, Tresoreintrag aktualisieren und erneut ausfüllen |
| S14 | Mehrere Faktoren | 66–67 | TF2, TF3, TF6 | Wissen/Besitz/Inhärenz, Aktivierungssimulation |
| S15 | Wirkung des zweiten Faktors | 67–68 | TF6 | Passwort allein reicht nach 2FA nicht mehr, sichtbare Schutzwirkung |
| S16 | Priorisierung/Ausweitung | 68 | TF1, TF6 | wichtige Konten zuerst, MFA wo verfügbar |
| S17 | Integrierte Zusammenfassung | 69–71 | TF4, TF6 | eigene starke Passwörter, 2FA bei wichtigen Konten, Abschluss |

## Implementierte S15–S17-Version

- Nach dem letzten verpflichtenden Browser-Schließen wechselt Master Campus aus der roten
  Passwort-bekannt-Vorschau in den blauen Schildzustand. Die grünen Vorschauverbindungen
  verschwinden; `✓ 2FA aktiviert`, Mini-Konfetti und die bereitgestellten lilafarbenen Ketten
  erscheinen unmittelbar gemeinsam am Master-Campus-Knoten.
- PassWo erklärt jeden vorgegebenen Gedanken in einer eigenen Sprechblase und führt anschließend
  in die priorisierte Ausweitung: wichtige Konten zuerst. Die handlungsspezifische Aktion ergänzt
  Ketten auf allen bekannten Trainingskonten sowie deterministisch auf einem Teil der anonymen
  weiteren Konten; jeder neu ergänzte Knoten erhält ein kleines `2FA aktiviert`-Feedback mit
  Mini-Konfetti. `zweiten Faktor` und die Übertragbarkeit auf andere Konten tragen jeweils eine
  eigene Kerngedankenmarkierung; bei der zweiten S15-Erklärung pulsiert Master Campus einmal kurz.
- Die letzte Sprechblase verbindet eigene starke Passwörter mit 2FA bei wichtigen Konten. Ihre
  ausdrücklich vorgegebenen grünen, blauen und lilafarbenen Hervorhebungen sind gruppiert.
  `Training abschließen` steht separat als große gläserne Primäraktion in der Bildschirmmitte und
  übergibt an den gemeinsamen Post-Fragebogen.
- Die produktive Wiederaufnahme öffnet ab S08 den Einstieg des zuletzt bestätigten Segments S08 bis
  S17. Persistiert werden dafür nur der minimale S08-Resume-Zustand und die inhaltsfreie Segment-ID;
  Passwortwerte bleiben flüchtig. Für die isolierte visuelle Prüfung existieren direkte lokale
  QA-Einstiege für Ergebnis, Ausweitung und Zusammenfassung.

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
  deutlich größere Logo-Infokarten; mehrere Logos werden verkleinert nebeneinander angeordnet,
  wobei die Mittelpunkte aller Logogrößen auf derselben Y-Ebene bleiben.
  Hover oder Tastaturfokus nennt ausschließlich die konkrete Einstufung, beispielsweise
  `Persönliche Angabe`, `geläufiges Wort` oder `häufiges Datum`; die Kacheln bleiben auch während
  der betroffenen Sprechblasen erreichbar. Die kompakte
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
  geprüften Kategorien ausschließlich über größere Info-Logos an den jeweils erkannten Bausteinen
  sichtbar; mehrere Logos werden verkleinert nebeneinander angeordnet. Hover oder Tastaturfokus
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
  entfällt. Während des gesamten erwarteten Eingabeschritts bleibt der lila-pinke
  Filzstiftcursor überall in der Study-Oberfläche am Zeiger sichtbar, nicht nur in der Nähe der
  Passwort-Markierungsfläche oder direkt über einzelnen Zeichen. Solange die linke Maustaste für
  eine neue Markierung gedrückt ist, zeigt ein etwas dunkleres Pink den noch nicht bestätigten
  Zeichenbereich; beim Loslassen erhält die feststehende Markierung den bisherigen helleren Ton.
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
- Zusammenhang und Struktur werden weiterhin in zwei aufeinanderfolgenden lokalen
  Reflexionsschritten markiert. Im ersten Schritt ist ausschließlich der aktuelle
  Zusammenhangsbutton sichtbar, im zweiten ausschließlich der aktuelle Strukturbutton; beide
  stehen nie nebeneinander. Der erste angeklickte Baustein in Zusammenhang A
  bleibt transparent und erhält nur einen entlang aller vier Randseiten laufenden gestrichelten
  Suchrahmen. Erst der zweite Baustein bestätigt den Zusammenhang und färbt beide vollständig. Ein
  weiterer Zusammenhang kann erst angelegt werden, wenn alle vorhandenen Gruppen mindestens zwei
  Bausteine enthalten. A, B und C belegen als größere Farbkugeln feste linke, mittlere und rechte
  Positionen unter dem Zusammenhangsbutton; der jeweils nächste freie Platz
  zeigt dort bereits die Plus-Steuerung. Sie wird erst nach zwei markierten Bausteinen in jedem
  vorhandenen Zusammenhang nutzbar, und vorhandene weitere Zusammenhänge lassen sich dort
  unmittelbar löschen. Jede Kugel ist durch eine Linie mit dem Zusammenhangsbutton verbunden; die
  aktive Linie übernimmt die Gruppenfarbe und läuft animiert. Der Zusammenhangsmodus übernimmt
  ebenfalls die Farbe der fokussierten Gruppe. In beiden Schritten schließt der weiße
  `Fertig`-Button mit Häkchen direkt rechts neben der mittigen Modussteuerung als kompakte Gruppe
  unmittelbar ab; der
  zusätzliche Bestätigungsdialog und die Außenbox um den einzelnen Modus entfallen. Bei nur einem
  projizierten Baustein ist der jeweilige Modus ausgegraut, mit einem durchgestrichenen
  Kugelsymbol und dem Hover-/Fokushinweis `Nur ein Teil erkannt.` versehen und auch im Controller
  gesperrt. PassWo weist im Zusammenhangsschritt darauf hin, dass nur ein Teil erkannt wurde;
  in beiden Schritten bleibt die offene Frage bestehen, ob die teilnehmende Person selbst noch
  Zusammenhänge beziehungsweise eine Struktur sehen kann. Eine
  zusätzliche Linienebene zwischen den Passwortbausteinen und eine Hover-Vorschau entfallen. Die
  authored Einstiegsvorschau und statischen Zusammenhangsbeispiele verwenden wieder ihre
  ursprünglichen grünen Bausteinflächen und CSS-Verbindungslinien. Die beschrifteten Steuerungen A
  bis C bleiben neben der Gruppenfarbe als Bedeutungsträger erhalten.
- Bei der lokalen Bestimmung bleibt das Angreifermodell während Markierung und Übergang in
  Warteposition. Erst der sichtbare Ergebniszustand projiziert den neu bestimmten Knotenstatus und
  löst bei einem Fund die Bewegung zum Knoten aus. Logo-Informationen unter Passwörtern mit einem
  bis drei Bausteinen erhalten zusätzlichen Abstand; die Campus-E-Mail-Markieransicht wird als
  Ganzes höher positioniert.
- Vor den lokalen Markieransichten setzt ein eigener Datenleckwechsel nur den neu geprüften
  Kontozweig auf den neutralen Prüfzustand. Bestimmte rote und grüne Beziehungen bleiben über alle
  folgenden Ansichten erhalten. Die rote Knotenprojektion folgt jedoch der aktiven Quelle: Nach
  einem lokalen Fund sind nur sie und über bestimmte rote Beziehungen mit ihr verbundene Konten
  rot; die frühere Prüfrichtung spielt dafür keine Rolle. Lokale blaue Schutzzustände bleiben
  erhalten; ein grüner blockierter Paarweg färbt seinen Zielknoten nicht selbst blau. Rote
  Befallsbeziehungen tragen einmalig direkt an der Kante das bestehende S06-Ergebnislabel
  `Dasselbe Passwort` oder `Leicht abgewandelt` im S08-Stil ohne weißen Hintergrund; zusätzliche
  Knotenergebnislabels entfallen. Der Text zur fehlenden leichten Abwandlung bleibt ausschließlich
  in der Vergleichsvorschau. Ein blockierter Weg besteht wie
  in S08 aus zwei statischen grünen Liniensegmenten, die ein grünes Schild exakt in ihrer Mitte
  treffen. Während eines neuen Angriffs darf der aktuelle blaue Schutzzustand
  vorübergehend der roten Prüfbewegung weichen, danach gilt wieder das bestimmte Befalls- oder
  Schutzergebnis. Der Angreifer blendet an der bisherigen Position aus und erscheint ohne
  Größenwechsel an der neuen Kontoposition. Der langsamere Crossfade zeigt den laufenden Angriff
  anschließend ungefähr eine zusätzliche Sekunde, bevor die Markieransicht weich erscheint.
  Master Campus wird von rechts, Campus E-Mail aus einer Position unterhalb des Knotens mit nach
  oben laufender vertikaler Angriffslinie angegriffen. Während der Markierung bleiben nur das
  aktive Konto, seine Unterknoten und internen Kanten sichtbar. Beim lokalen Ergebnis kehrt das
  gesamte Netzwerk zurück; ein Fund breitet sich über bereits bestimmte rote Beziehungen in beide
  Richtungen zu verbundenen Konten und deren Unterknoten aus. Grüne blockierte Wege übertragen
  keinen Befall. Eine grüne generische Knotenhervorhebung entfällt. Alle
  Angreiferbilder bleiben mit 144 % der Kontoknotengröße kontofüllend. `Fertig` projiziert das
  lokale Ergebnis ohne eigene Wartepause. Der abschließende Rückwechsel zu Campusgram behält alle
  bestimmten Beziehungen und projiziert die Knotenstatus erneut aus dieser Quellperspektive. Bei
  begrenzter Stage-Breite oder -Höhe wird das vollständige Markiermodul kompakter; auf noch
  schmaleren Stages erhält die Modussteuerung wieder ausreichend nutzbare Breite. Die hellgrauen
  Strukturpfeile bleiben durch größere Strichstärke und höhere Vorschau-Deckkraft erkennbar.
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
- Die S05-Simulationsdisposition (`S05_CONTENT_VERSION 2.136.0`, Analysekonfiguration
  `passwo-bounded-whole-recognition-v21`) bleibt auf den vollständigen fiktiven Wert begrenzt:
  `whole-password-recognized` entsteht durch einen direkten Vollwert, eine quellengestützte
  generierte Kandidatenfamilie, genau einen belegten Anker mit frei durchprobiertem Rest oder das
  vollständige Durchprobieren innerhalb der gemeinsamen Grenze `26^12`.
  Deutsche und englische Wortzerlegungen bleiben sprachgebunden. Die häufigkeitsgeordneten
  Sprachkorpora werden über alle Wortlängen durch eingefrorene Rang-, Schrift- und
  Korpusartefaktgrenzen bereinigt; kurze Wörter bleiben nur exakt in vollständigen Segmenten
  beziehungsweise Partitionen zulässig. Kuratierte Abkürzungen werden davon getrennt behandelt.
  Von zxcvbn vorgeschlagene Wortfolgen werden nur bei direkter Schreibweise benachbarter Einträge
  derselben Sequenzliste übernommen; authored Konto-/Diensttreffer müssen auf sichtbaren oder
  lexikalisch belegten Komponentengrenzen liegen. Ein Passwortlisten-Vollwert, der selbst kein
  gewöhnliches deutsches oder englisches Wort ist, darf keine sichtbaren Wortgrenzen überdecken,
  wenn seine Teile gemeinsam eine vollständige einsprachige Wortzerlegung bilden: `IchBin` bleibt
  Angriffskandidat, erscheint aber als `Ich | Bin`. Vollständige Wörter haben Vorrang, sodass
  `Maiden` beziehungsweise `MaiDen` nicht künstlich als `Mai | den` projiziert wird. Unterdrückte
  Basistreffer hinterlassen keine verwaisten Transformationsgrenzen in der S05-Projektion.
  Eigene maximale Tastaturspans erzeugen Grenzen für angrenzende Wörter; vollständige
  Kontobegriffe, Jahre und authored Komposita haben Vorrang vor inneren Wörterbuch- beziehungsweise
  Endungstreffern. Getrennte und einmal veränderte Wiederholungen werden über mehrere belegte Spans
  der bestehenden Wiederholungskategorie erfasst. Mehrere gewöhnliche Wörter werden mit ihren
  vollständigen authored Quellenfamilien gezählt und führen nur innerhalb der gemeinsamen
  Übungsgrenze zu einem Volltreffer. Persönliche Markierungen, Inhaltsgruppen und
  Satz-/Phrasenverbindungen bleiben flüchtige Erklärdaten und beeinflussen die Disposition nicht. Die
  kompakte Abschlussauswertung nennt zuerst den Vollpasswort-Status,
  zeigt nur dessen kausale Befunde beziehungsweise klar bezeichnete Teilbefunde und ergänzt die
  15-Zeichen-Orientierung kurz und getrennt. Danach endet S05 direkt; Wiederverwendung und
  Ähnlichkeit folgen in S06. Eine fehlende Vollerkennung bedeutet nicht stark, sicher, zufällig
  oder unangreifbar. Numerische zxcvbn-Guess-Werte werden weder angezeigt noch für diese
  Disposition verwendet. Die bestätigte S05-Evidenz bleibt flüchtig und kann aus
  Kompatibilitätsgründen an S06 übergeben werden, wird von der Dispositionsfunktion aber ignoriert.
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
  eine bedingte PassWo-Blase die erkannte Verbindung oder die begrenzte Nicht-Erkennung ein. Eine
  zweite, nicht mehr hypothetisch markierte Blase führt danach mit `Zum Schluss prüfen wir das
  Campus-E-Mail-Passwort noch für sich.` zum lokalen Campus-E-Mail-Check. Campus E-Mail
  bildet am Ende ausschließlich
  einen lokalen Einzelcheck; bei einem Fund
  werden seine verbundenen Funktionen betroffen dargestellt, bei Schutz folgt kein
  hypothetischer Pfad. Danach kehrt die Ansicht zur tatsächlichen Campusgram-Ausgangslage zurück.
  Campusgram-Inhalte bleiben lokale
  Inhaltszuordnungen und werden nicht als SSO-Dienste modelliert.
- Nach der Campus-E-Mail-Perspektive stellt der Controller ohne zusätzliche Rückkehr- oder
  Endübersichtsblase die tatsächliche Campusgram-Ausgangslage wieder her. PassWo führt direkt mit
  dem wegen des Datenlecks begründeten Campusgram-Passwortwechsel zu S07 und fasst die später zu
  behebenden lokalen Funde und Passwortverbindungen nur noch als übrige offene Punkte zusammen.
- Beim Perspektivwechsel zu Master Campus und Campus E-Mail werden die übrigen Knoten zunächst
  ausgeblendet. Das jeweilige fiktive Passwort zeigt automatisch erkannte Kategorien und
  Wiederholungen und nimmt über `Gruppen` beziehungsweise `Struktur` ausschließlich flüchtige
  Zusatzangaben entgegen. Eine separate Karte `Früh geprüft` entfällt. An den Bausteinen stehen
  deutlich größere Info-Logos. Mehrere Logos werden verkleinert und nebeneinander statt gestapelt
  angeordnet. Hover oder
  Tastaturfokus öffnet eine gläserne Karte mit Kategoriename und konkreter Einstufung.
  `Zusammenhang`, `Struktur` und `Persönliches` verwenden dieselbe Bausteinansicht; die Reflexion
  startet direkt in `Persönliches`. Im persönlichen
  Modus bleiben bestehende Zusammenhangsflächen, Strukturpfeile sowie dieselben Kategorienlogos
  und Hover-/Fokuskarten sichtbar. Einzelne Zeichen oder frei gezogene zusammenhängende
  Zeichenbereiche können auch über Bausteingrenzen hinweg markiert und wieder entfernt werden.
  Ein lila-pinker Filzstiftcursor bleibt während des gesamten Modus `Persönliches` überall in der
  Study-Oberfläche am Zeiger sichtbar. Während einer gedrückten oder gezogenen neuen Markierung
  erscheint der noch nicht bestätigte Zeichenbereich etwas dunkler pink und wechselt erst beim
  Loslassen in den bisherigen finalen Ton; die
  betroffenen Zeichen leuchten lila-pink und das
  persönliche Kategorienlogo macht die Zuordnung zusätzlich sichtbar. Der aktive
  Kontozweig einschließlich seiner Unterkonten bleibt dabei sichtbar; die Gruppensteuerung beginnt
  mit `Gruppe 1` und kann wie in S05 über den Plus-Button erweitert werden. Die Bausteine beginnen
  ohne Kategoriefläche transparent; erst eine
  Gruppenzuordnung färbt die gesamte Bausteinfläche in der Gruppenfarbe. Der Strukturmodus setzt
  wie in S05 gerichtete Pfeile zwischen benachbarten Bausteinen. Bei nur einem projizierten
  Baustein sind Zusammenhang und Struktur mit durchgestrichenem Kugelsymbol sowie kurzem
  Hover-/Fokushinweis `Nur ein Teil erkannt.` ausgegraut und auch controllerseitig gesperrt;
  persönliche Markierungen und
  der Abschluss bleiben verfügbar. Der gestrichelte Vorschaurahmen eines ersten
  Zusammenhangsbausteins erhält seine Gruppenfarbe am äußeren Animationsrahmen. Wiederholungen
  erhalten nur am ersten Wiederholungsbaustein den Multiplikator und kein zusätzliches Textlabel.
  Nach `Fertig`
  verschwindet die Reflexionsfläche. Gleichzeitig mit PassWos Ergebnistext zeigt das Kontennetz
  den betroffenen roten Kontozweig oder den geschützten Kontozweig samt Schutzschild. Bei Master
  Campus startet `Angriff starten` anschließend nur noch den Vergleich mit Campus E-Mail; beim
  Campus-E-Mail-Einzelcheck führt `Weiter` direkt zum S07-Übergang.
- Ein hypothetischer Master-Campus-Befall setzt vor dem Vergleich mit Campus E-Mail den Angreifer und
  den gesamten Kontozweig sichtbar auf betroffen. Hypothetische Campusgram- und
  Master-Campus-Quellen bleiben während aller Vergleichsauflösungen und ihrer Zusammenfassung
  betroffen; erst die jeweils folgende, nicht mehr hypothetische Perspektiv- beziehungsweise
  Einzelcheck-Navigation stellt den zuvor gemerkten tatsächlichen Schutzzustand wieder her. Der
  anschließende Passphrasen-Übergang bewahrt die wiederhergestellte Campusgram-Schlussansicht
  unverändert.
- Eine Beziehung ist ausschließlich `exact-match`, `derived-variant-match` oder
  `no-derived-path-recognized`. Allgemeine leichte Abwandlungen verwenden die case-sensitive
  restricted Damerau-Levenshtein-Distanz auf NFC-normalisierten Graphemclustern. Positiv sind nur
  Pfade mit absoluter Distanz eins bis drei und normalisierter Distanz höchstens `0,25`.
- Genau ein zusätzlicher scenario-spezifischer Makropfad darf einen vollständigen Identifier des
  Quellkontos durch einen vollständigen Identifier des Zielkontos ersetzen. Beide stammen aus
  getrennten kleinen Listen und müssen an unterstützten Grenzen liegen. Außerhalb der Identifier
  sind höchstens zwei Distanzoperationen, eine normalisierte Restdistanz von höchstens `0,25` und
  ein zusammenhängender gemeinsamer Lauf von mindestens vier Zeichen erforderlich. Breite
  S05-Kontextbegriffe und beliebige aus dem Zielwert übernommene Wortbestandteile begründen keinen
  Weg.
- Der Domain-Layer liefert für jeden positiven Pfad geordnete paarweise Schritte mit Quellspan,
  Zielspan, Operation, Kosten, Erklärungstyp und dem nach dem Schritt entstandenen vollständigen
  Zwischenkandidaten. Die Projektion zeigt nacheinander die tatsächlichen `vorher -> nachher`-Paare
  und schreibt den Kandidaten nach jedem Schritt fort. Erst nach dem vollständigen Zielkandidaten
  erscheinen Ergebnis und Angriffslinie. Ergänzungen und Entfernungen behalten einen sichtbaren
  leeren Gegenwert; Reduced Motion zeigt denselben Endzustand ohne zeitliche Staffelung.
- `S06_CONSEQUENCE_CONTENT_VERSION 2.51.0` übernimmt die S05-Vollpasswort-Disposition ohne eigene
  Guess-Schwelle und versioniert zusätzlich die neue Paarvergleichs- und Erklärungsdarstellung.
  Nur `whole-password-recognized` öffnet den tatsächlichen lokalen Vorfallspfad;
  `no-whole-password-recognized` bleibt eine begrenzte Nicht-Erkennung und kein Stärkeurteil.
- Jeder der drei flüchtigen S06-Kontoeingänge akzeptiert aus Kompatibilitätsgründen optional die
  bestätigte semantische Evidenz aus S05. Die gemeinsame Dispositionsfunktion ignoriert diese
  Markierungen absichtlich; sie erzeugen weder Angreiferwissen noch einen objektiven Treffer und
  werden nicht persistiert.
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
- Nach dem Campusgram-Wechsel wiederholt S07 die lokalen S06-Befunde und Passwortverbindungen
  nicht mehr in einer adaptiven Zusammenfassung. Bei weiterem Handlungsbedarf verweist PassWo
  direkt auf die in S08 markierten Konten und die dort zu verwendenden eigenen Passphrasen. Ohne
  Handlungsbedarf bestätigt eine kurze Abschlussblase, dass bei den anderen Konten nichts mehr
  offen ist. Die konkreten Konten und Gründe bleiben im S08-Netzwerk sichtbar; Ermittlung,
  Empfehlung und Auflösung der offenen Punkte bleiben unverändert.
- `S07_PASSPHRASE_SEARCH_CONTENT_VERSION 4.23.0` beschreibt den zweistufigen
  Passphraseneinstieg, Datenleckhinweis, lokalen Passwortwechsel, Suchseite, Werkstatt und
  den direkten adaptiven Abschluss;
  `S08_NETWORK_REPLAY_CONTENT_VERSION 3.8.0` beschreibt die Netzabkürzung und den anschließenden
  bedienbaren Angriffsrücklauf. S01 bis S07 bleiben vollständig flüchtig. Am Eintritt in S08
  werden Passwortwerte und semantische Detailbefunde verworfen; persistierbar ist danach nur der
  in ADR 0016 eng typisierte Simulationsresume-Zustand aus vorgegebenen Passphrasen-IDs und
  notwendigen kanonischen Schwäche-/Relationsflags. Er wird nicht exportiert.

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
- In der anschließenden S09-Skalierungsansicht werden die roten Risikoverbindungen während des
  PassWo-Schritts zur unrealistischen Erinnerungsanforderung vollständig aufgemalt. Erst nach der
  letzten Kante wechseln deterministisch 60 % der weißen anonymen Zusatzkonten gemeinsam auf Rot.
  Die drei bekannten geschützten Übungskonten bleiben ausgenommen; die Illustration verwendet
  keine Teilnehmerdaten oder Passwortanalyse.

## Sections

- `passwords`: S00–S11
- `password-manager`: S12–S13
- `mfa`: S14–S17

Für den S13-Abschluss sind das Muster-Bank-Ergebnis und der anschließende Campusgram-Auftrag zwei
getrennte PassWo-Sprechschritte. Erst der Campusgram-Auftrag markiert den Browser als nächstes
Handlungsziel. `S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION 4.8.0` beschreibt diese Trennung
ohne Änderung der Campusgram- oder Passwortmanagerlogik.

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

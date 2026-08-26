# Node Network Visualization System

## Ziel

Das Netzwerk zeigt Konten, abhängige Dienste, Funktionen, Passwortbeziehungen und Angriffspfade
über viele Segmente hinweg konsistent.

## Domänentypen

- `SceneNode`: Konto, Dienst, Funktion, Inhalt, Schutzschild oder Erklärungskarte.
- `SceneEdge`: Abhängigkeit, Zuordnung, Prüfung, identische Wiederverwendung, Ähnlichkeit oder
  blockierter Weg.
- `NodeStatus`: neutral, verstanden, abrufbar, nicht-erinnert, exponiert, betroffen, geschützt,
  hypothetisch.
- `EdgeStatus`: neutral, prüfend, geöffnet, direkt, ähnlich, blockiert, hypothetisch.
- `AuthoredPosition`: feste normierte Position im Szenenkoordinatensystem.

## Zentrale Regeln

- Konten behalten über Segmente hinweg möglichst dieselbe räumliche Position. Das unterstützt
  die mentale Karte.
- Layoutdaten werden redaktionell festgelegt; kein automatisches Layout im Studienpfad.
- React-Flow-Typen bleiben ausschließlich im Adapter.
- Statusänderungen werden als Domänenereignisse angewendet, nicht durch direkte
  Komponentenmanipulation.
- Rot und Orange werden zusätzlich durch Linienart, Textstatus und Symbol unterschieden.
- Hypothetische Beispiele besitzen immer sichtbare Kennzeichnung.
- Ein Schutzschild bedeutet „dieser Angriffsweg ist blockiert“, nicht absolute Kontosicherheit.

## Visuelle Sprache

- Hauptkonten und Dienstknoten werden als Kreise gerendert. Hauptkonten haben einen
  Kreisdurchmesser von ungefähr 112 px, Detailknoten ungefähr 76 px. Funktions- und
  Inhaltsknoten dürfen als kompakte abgerundete Rechtecke erscheinen, damit verbundene
  Möglichkeiten klar von Konten unterscheidbar bleiben.
- Jeder Node führt eine semantische `symbolId`. Der Renderer löst diese ID ausschließlich über
  eine lokale Inline-SVG-Registry auf; Emojis und externe Icon-Abhängigkeiten werden nicht
  verwendet. Die anonymen, nicht interaktiven Zusatzkonten der S09-Skalierungsansicht sind die
  einzige darstellerische Ausnahme: Sie verwenden statt eines Personensymbols eine vollflächige,
  weich entsättigte Farbvariation, damit die bekannten Hauptkonten visuell führend bleiben.
- Hauptknoten besitzen eine sehr helle graue Innenfläche, zugehörige Teilknoten eine leicht
  dunklere helle Innenfläche. Ihre etwas kräftigeren weißen Grundränder bleiben gleich, damit
  beide Knotentypen klar erkennbar sind; Form und Größe tragen die zusätzliche Unterscheidung.
  Alle Knoten zeigen ihr Symbol in der Mitte.
  S02 zeigt das kompakte Label unterhalb des Knotens; in S05-Netzwerkszenen und S06 entfällt es.
  Label, Beschreibung und Textstatus bleiben unabhängig davon für die zugängliche Benennung sowie
  für separate Kontextkarten erhalten.
- Ein kleiner Statusmarker überlagert den Kreis: offen, verstanden, betroffen oder geschützt.
  Farbe ergänzt dabei Symbol und zugänglichen Status, ersetzt sie aber nicht.
- Die gemeinsame S05-/S06-Auswertungsdarstellung ersetzt den generischen SVG-Statusmarker: Bei
  blockierten Knoten liegt das Schutzlogo groß und mittig im Knoten; beim gefundenen
  Campusgram-Knoten erscheint kein Warnmarker, weil der Angreifer den Zustand bereits sichtbar
  markiert.
- Das Schloss eines geschlossenen Hauptkontos liegt als eigener Marker oberhalb des Knotenkreises,
  damit Kontosymbol, Schlüsselweg und geöffneter Bügel gleichzeitig sichtbar bleiben. Der
  Cursor-Schlüssel bleibt nach einem abgeschlossenen Konto am Mauszeiger sichtbar; die Vorschau
  des zuletzt betrachteten Details wird für die Zusammenfassung geschlossen.
- Kanten sind eigene ruhige quadratische Kurven. Sie beginnen und enden am sichtbaren Rand des
  jeweiligen Kreises oder Rechtecks, liegen hinter den Nodes und ihren Label-Flächen und verwenden
  keine rechteckigen Smoothstep-Segmente.
- Die Statusfarben und Linienarten für S06 bleiben erhalten: direkte, ähnliche, blockierte und
  hypothetische Verbindungen unterscheiden sich zusätzlich durch Strichmuster.
- Rote Passwortbeziehungen in S06 und S08 tragen mittig ein eigenes Gleichheits- oder
  Abwandlungssymbol. Ihr vorhandenes kleines Textlabel steht direkt darüber, sodass Beziehungsart
  und gegebenenfalls der Bezug zum alten Campusgram-Passwort auch ohne Farbe verständlich bleiben.

## S08-Risikoverbindungen

S08 übernimmt die lokal erkannten Wiederverwendungs- und Ähnlichkeitsbeziehungen aus dem
S06-Plan und zeigt sie einheitlich als rote gestrichelte Kontokanten. Beziehungen zu Campusgram
kennzeichnen durch ihr Label, dass sie sich auf dessen bereits ersetztes altes Passwort beziehen.
Eine verwendete einzigartige Passphrase entfernt nur die Kanten des gewählten Kontos. Der
zugehörige Aktionshinweis und die gestrichelten Risikokanten lösen sich im selben
Statechart-Schritt auf. Kontopaare ohne aktive Risikobeziehung zeigen bereits eine grüne, mittig
durch ein Schutzschild unterbrochene Verbindung. Wird eine Risikobeziehung durch die
Passphrasenaktion aufgelöst, nimmt die entsprechende grüne Schutzverbindung ihren Platz ein.
Beim Start des erneuten Angriffs werden diese grünen Verbindungen kurz ausgeblendet, damit der
bestehende Angriffsablauf sie anschließend erneut aufbauen kann. Nur lokal schwache Konten sind
rot betroffen. Ein starkes Konto bleibt trotz einer Wiederverwendungs- oder Ähnlichkeitskante blau
geschützt, zeigt aber weiterhin die Aktion `Einzigartige Passphrase verwenden`, bis seine Beziehung
aufgelöst ist. Reduced Motion projiziert unmittelbar denselben fachlichen Endzustand. Campusgram
bleibt in S08 immer im blauen Schutzzustand, weil die sichtbaren Risikokanten ausdrücklich sein
bereits ersetztes altes Passwort referenzieren. Aktionsknoten behalten unabhängig vom roten oder
blauen Status dieselbe Hover- und Fokusrückmeldung.

Die direkten QA-Einstiege `s08-strong-relations` und `s08-weak-mixed-relations` decken gemeinsam
starke blaue Beziehungsknoten, rote schwache Knoten, exakte Wiederverwendung, abgeleitete
Ähnlichkeit und den dauerhaft geschützten Campusgram-Knoten ab.

## S09-Skalierungsansicht

Das vollständige S08-Schutzdreieck wird beim Maßstabswechsel einschließlich seiner Abstände,
Detailknoten, Schilde und Kanten proportional um einen gemeinsamen Mittelpunkt verkleinert. Die
anonymen Zusatzkonten füllen den Raum außerhalb dieses Mittelbereichs mit einem festen,
unregelmäßigen Punktmuster und geprüften Mindestabständen; ihre sichtbaren Kreisflächen
überdecken sich weder in der normalen noch in der kompakten Übersichtsdichte. Ein Raster oder
laufzeitabhängiges Zufallslayout wird nicht verwendet. Die Zusatzkonten bleiben einzelne,
vollständig deckende weiß-graue Knoten ohne rein dekorative Unterknoten. Die ruhige einheitliche
Grundfläche hält die bekannten Hauptkonten visuell führend und lässt den späteren roten
Befallszustand eindeutig lesbar werden.

Das authored Layout hält eine eigene untere Dialogzone für PassWo, Sprechblase und Tresormoment
frei. Dadurch liegen keine Knoten oder Verbindungen hinter diesen UI-Flächen, während die
Netzfläche selbst ihre Größe und damit die proportionale Skalierung behält. Das zeitlich versetzte
Erscheinen, das kurze Ausblenden springender Ursprungskanten und eine Tiefenwelle machen das
Herauszoomen auf 134 Konten sichtbar. Mit der anschließenden konservativen 80-Konten-Frage
ploppen die 54 nicht mehr benötigten Zusatzkonten in kurzer authored Reihenfolge auf und
verschwinden. Bei Reduced Motion erscheint derselbe vollständige 80-Konten-Endzustand unmittelbar.
Während PassWo die unrealistische dauerhafte Erinnerungsanforderung einordnet, tragen exakt 60 %
der weißen anonymen Zusatzkonten einen kleinen roten S06-Befundtitel `Wiederverwendet` oder
`Ähnlich`. Die 46 betroffenen Zusatzkonten sind in einer festen, zufällig wirkenden Reihenfolge
über das authored Punktmuster verteilt; ihre Titel erscheinen nacheinander. Die Verteilung ist eine reproduzierbare
Illustration des genannten Skalierungsproblems und wird nicht aus Passwörtern, Eingaben oder einer
Analyse abgeleitet. Bei Reduced Motion erscheinen alle 46 Titel unmittelbar im Endzustand.
Mit jedem Titel erscheint außerdem eine dünne rote Beziehungskante zwischen zwei betroffenen
anonymen Konten. Die 46 Kanten verbinden alle markierten Konten in der festen Reveal-Reihenfolge.
Während die Kanten gezeichnet werden, gehen dieselben 46 Knoten bereits langsam von Weiß über
helle und gedeckte Rosatöne. Nachdem die letzte Kante vollständig gezeichnet ist, erreichen sie
gemeinsam den roten Befallszustand. Die fertig gezeichneten Kanten bleiben dabei durchgezogen und
wechseln in den folgenden Dialogschritten nicht auf einen gestrichelten Stil. Auf sechs roten und
fünf weiterhin weißen, fest verteilten Zusatzkonten liegt zusätzlich das vorhandene Schild
`Leicht zu erraten`. Kanten, Titel, Schilde und Knotenstatus bleiben in den beiden folgenden
PassWo-Schritten sichtbar. Sie
illustrieren mögliche Wiederverwendungs- oder Ähnlichkeitsbeziehungen und behaupten keine
tatsächliche Analyse der dargestellten Konten. Die Reveal-Animation ist ausschließlich beim
erstmaligen Eintritt aktiv; `Weiter` übernimmt den bereits sichtbaren statischen Endzustand, ohne
die Kanten erneut zu zeichnen.

Beim anschließenden direkten Übergang in S12 bleibt genau dieser Netzwerk-Endzustand auf dem
Desktop zunächst unverändert sichtbar und blendet dann langsam vollständig aus. Erst danach
erscheint und öffnet sich der Passwortmanager-Tresor; eine zusätzliche Abdunklung, Sektionskarte
oder separate Landingpage wird nicht eingeschoben. Netzwerk und neue Bühne teilen weiterhin die
tatsächliche Full-Bleed-Fläche; die S12-Arbeitszone reserviert zusätzlich die
betriebssystemspezifischen Dock- und PassWo-Safe-Areas.

Beim späteren Rückwechsel aus der MyShop-Browserübung in S13 wird derselbe S09-Endzustand nicht
neu aufgebaut. Der Graph bleibt hinter Übergang und Browser gemountet; reine PassWo-Schrittwechsel
ändern nur die umgebende Präsentation. Alle unveränderten S09-Risikokanten behalten ihre authored
Endpunkte und den nach dem Reveal durchgezogenen Endstil. Der für Muster Bank verwendete
Risikoknoten übernimmt Position und genau eine vorhandene Beziehung des ersetzten anonymen
Knotens; die übrigen Beziehungen werden nicht neu verbunden. Vom ersten
Netzwerkframe bis zur erneuten Browseröffnung bleiben alle Knoten und Kanten transparent
abgedunkelt. Während Importhinweis und Hinweis auf das beim Dienst unveränderte Passwort wird kein
einzelner Netzwerkknoten herausgehoben; stattdessen trägt beim Import ausschließlich der Tresor
einen subtilen wiederholten Fokus. Muster Bank behält durchgehend seinen roten Befallszustand,
wird aber erst beim Satz über das wiederverwendete Passwort mit dem vorhandenen Puls und voller
Deckkraft fokussiert. Ihre eine rote Beziehung trägt dabei mittig die sichtbare Kennzeichnung
`dasselbe`. Dieser Fokus und die Kennzeichnung bleiben in den folgenden Erklärungsschritten bis
zur Browseröffnung bestehen.
Der für MyShop reservierte anonyme S09-Knoten und seine Kanten bleiben in diesem ersten
Netzwerkframe ausgeblendet. Beim authored MyShop-Reveal erscheint direkt der Logo-Knoten an der
vorgesehenen Position, ohne vorherigen weißen Platzhalter.

Nach der praktischen Passwortänderung bei Muster Bank bleibt derselbe Graph weiterhin gemountet.
Muster Bank ist der einzige voll deckende Kontofokus. Zuerst pulsiert der Knoten wie beim
MyShop-Reveal, während sich genau seine eine vorhandene rote Passwortbeziehung von beiden Enden
löst. Danach wechselt der Muster-Bank-Knoten in den blauen Schutzstatus und zeigt seinen
Kontoschild. Erst im dritten Zustand erscheinen an demselben Kontopaar zwei grüne Liniensegmente
mit mittigem Schild. Alle übrigen Knoten und Kanten bleiben transparent abgedunkelt. Reduced
Motion durchläuft dieselben fachlichen Zustände ohne Puls-, Auflösungs- oder
Einblendanimation.

Im abschließenden S13-Überblick erzeugt MyShop keine grünen Schutzverbindungen. Beim authored
Beheben aller übrigen Beispielpasswörter verschwinden sowohl rote Risikobeziehungen als auch
bereits sichtbare grüne Schutzpfade und ihre mittigen Schildknoten; der Endzustand trägt die
Schutzinformation ausschließlich über blaue Kontoknoten und deren Kontoschilde. Vor dem
Reparaturbutton pulsiert Muster Bank zweimal kurz, Master Campus dagegen nicht. Die anschließende
Varianten- und Recovery-Überlagerung hält diesen letzten Netzwerk-Snapshot unverändert gemountet,
aber vollständig unsichtbar und ohne erneut startende Netzwerkanimation. Die anschließende
MFA-Vorschau liegt rechts-mittig über dem Graphen und projiziert mit zwei Linien und einer schwachen
Fläche zum betroffenen Master-Campus-Knoten. Sie sitzt am äußersten rechten Bildschirmbereich,
verwendet für Master Campus das Kontologo mit dem mittig danebenstehenden Status `Bekannt` und
lässt sämtliche Netzwerkknoten in normaler Deckkraft sichtbar. Die Vorschau bleibt statisch;
ausschließlich der Knoten pulsiert nach
dem Projektionsaufbau zweimal. Während dieses MFA-Befalls führen ausschließlich von Master Campus
zu jedem anderen Hauptkonto direkte grüne Schutzlinien ohne zusätzliche Schildknoten. Die
Unterknoten behalten ihre neutralen Verbindungen. Diese Pfade gehören nicht zum MyShop- oder
allgemeinen Passwortreparaturzustand. Reduced Motion zeigt dieselben fachlichen Zustände ohne Puls
und mit vollständig gesetzten Schutzpfaden. Die schildfreien Direktkanten halten alle Kontopfade
sichtbar und vermeiden zusätzliche Zwischenknoten und doppelte Kantensegmente. Die bestehenden
blauen Unterknotenverbindungen von Master Campus und Campusgram werden nach den grünen Pfaden
gezeichnet und liegen deshalb auch an Kreuzungen strikt darüber. Während Käfer und
Master-Campus-Status erscheinen, bleibt die rechts positionierte Angreiferkarte unbewegt; nur das
Käfersymbol pulsiert. Die Projektionsfläche bleibt schwach, aber deutlicher deckend als zuvor.

Nach der flüchtigen S14-Einrichtung und der Anmeldung mit zweitem Faktor löst ausschließlich das
Schließen des simulierten Browsers die Rückkehr ins Kontonetzwerk aus. Der rote Master-Campus-
Vorschauzustand wechselt dabei in den blauen Schutzstatus mit Kontoschild. Die direkten grünen
Schutzlinien der vorherigen MFA-Vorschau bleiben als sichtbare zusätzliche Hürde erhalten; es
entstehen keine neuen Konto- oder Detailknoten. Reduced Motion zeigt denselben Endzustand ohne
zusätzliche Bewegung.

## S02-Kontenerkundung

S02 „Konten kennenlernen“ bildet die erste vollständige Kontenerkundung:

1. Master Campus, Campus E-Mail und Campusgram sind gleichzeitig als unterschiedliche
   Symbolkreise in festen Positionen sichtbar;
2. ausschließlich die drei Hauptkonten sind auswählbar; das gewählte Konto sperrt die beiden
   anderen, bis seine vollständige geführte Vorschausequenz mit `Fertig` abgeschlossen ist;
3. PassWo fliegt beim erstmaligen Öffnen zum Ziel, steht dort seitlich vom Knoten und kehrt nach
   Abschluss dieses Kontos an seinen Platz unten links zurück;
4. das aktive Konto vergrößert sich leicht; seine Detailknoten und Kanten erscheinen einzeln in
   der authored Reihenfolge und bleiben bei späteren Wechseln sichtbar;
5. Master-Campus-Dienste verwenden `service`/`dependency`, Campus-E-Mail-Funktionen
   `function`/`association`;
6. Campusgram-Inhalte verwenden `content`/`association`; diese Kanten bilden ausschließlich
   lokale Inhaltszuordnungen in einem eigenständigen Community-Konto ab, keine SSO- oder
   Dienstverbindungen. Die drei Bereiche sind Direktnachrichten, Gruppen und Kontakte sowie
   Beiträge und Reaktionen;
7. nach dem Unlock startet die erste große Vorschau automatisch; während ihrer Wiedergabe ist
   ausschließlich ihre Kante `checking`, nach dem vollständigen Ablauf ist sie `opened`;
8. `opened` bezeichnet ausschließlich die abgeschlossene Detailöffnung und ist weder
   `protected` noch `blocked`;
9. Detailknoten werden nicht direkt angeklickt. Nach jeder vollständig abgespielten Vorschau
   stehen `Animation wiederholen` und `Nächstes`, beim letzten Detail `Fertig`, in einem stabilen
   Kartenfooter bereit. Erst `Fertig` markiert das Konto als angesehen;
10. jedes angesehene Konto erhält einen grünen Statusmarker mit Häkchen und bleibt für eine
    vollständige Wiederholung auswählbar; die Wiederholung löscht keinen Fortschritt;
11. der Segmentabschluss ist erst verfügbar, wenn alle zehn Detailvorschauen und anschließend
    alle drei Kontoabschlüsse bestätigt wurden.

Die Detailvorschau bleibt eine separate responsive UI-Karte über dem Graphen. Master Campus und
Campus E-Mail projizieren rechts, Campusgram links. Zwei Linien und eine schwache Projektionsfläche
verbinden den aktiven Detailknoten mit der Karte. Die Karte darf inaktive Knoten überdecken, enthält
keinen duplizierenden PassWo-Text und bleibt bei Reduced Motion im vollständigen Endzustand.

Danach wird in S06 derselbe Graph um Angriffs- und Schutzstatus erweitert. Der erste S06-Frame ist
der unveränderte letzte S05-Netzwerkstand; beide Segmente verwenden dieselbe
Auswertungskomponente. Master-Campus- und Campus-E-Mail-Detailkanten erhalten in dieser
Auswertungsdarstellung denselben neutralen Linienstil.

Bei der lokalen Passwortbestimmung für Master Campus und Campus E-Mail bleibt das Angreifermodell
während der Markierung und des Statechart-Übergangs ausdrücklich in seiner Warteposition. Der
spätere Knotenstatus wird erst projiziert, sobald der lokale Ergebniszustand samt sichtbarer
Ergebnisrückmeldung erreicht ist. Ein bereits im neu berechneten Netzwerk vorhandener
`exposed`-Status darf die Angreiferbewegung nicht vorwegnehmen. Reduced Motion übernimmt dieselbe
fachliche Reihenfolge ohne Bewegungsanimation.

Vor jeder lokalen Markieransicht läuft außerdem ein eigener Datenleckwechsel. Das Netzwerk zeigt
dabei alle Hauptknoten und setzt ausschließlich den neu lokal geprüften Kontozweig auf den
neutralen Prüfzustand. Bereits bestimmte Paarbeziehungen bleiben dauerhaft sichtbar: erkannte
Befallswege als rote Beziehung, blockierte Wege wie in S08 als zwei statische grüne Segmente mit
einem exakt mittigen grünen Schutzschild. Knotenstatus werden für die aktive Datenleckquelle
projiziert: Nach einem lokalen Fund sind nur die Quelle sowie über bereits bestimmte rote
Beziehungen mit ihr verbundene Konten rot. Die frühere Prüfrichtung der Beziehung ist dafür
unerheblich. Ein unabhängig bestimmter lokaler blauer Schutzzustand bleibt erhalten; ein blockierter
Paarweg allein erzeugt keinen blauen Zielknoten. Rote Beziehungen tragen dauerhaft die vorhandenen
S06-Labels `Dasselbe Passwort` beziehungsweise `Leicht abgewandelt` in der S08-Darstellung ohne
weiße Hintergrundfläche. Zusätzliche Ergebnislabels an Knoten entfallen; der Text zur fehlenden
leichten Abwandlung bleibt auf die Vergleichsvorschau begrenzt. Grüne Beziehungen benötigen neben
ihren beiden Segmenten und dem mittigen Schild kein zusätzliches Textlabel. Für die kurze
Übergangsphase dürfen alter und neuer Angreiferanker gleichzeitig im Snapshot stehen: Der alte
Anker blendet an
seiner bisherigen Position aus, der neue blendet an der Zielposition ein. Beide verwenden dieselbe
Bildgröße von 144 % des
Kontoknotens; Zustandswechsel dürfen die PNG-Größe nicht mehr verändern. Der langsamere Crossfade
geht in ungefähr eine zusätzliche Sekunde sichtbaren laufenden Angriffs über und anschließend in
die weich eingeblendete Markieransicht; dort bleibt ausschließlich der neue Anker erhalten. Der
Master-Campus-Anker liegt rechts, der Campus-E-Mail-Anker unterhalb und mit zusätzlichem Abstand zum
Knoten. Die Angriffslinie und die spätere Bewegung in den Knoten verwenden entsprechend eine
horizontale beziehungsweise von unten nach oben laufende Richtung. Eine grüne generische Knoten-Hervorhebung wird
während Wechsel, Markierung und lokaler Ergebnisprojektion nicht gesetzt.

Während der lokalen Markierung rendert S06 ausschließlich das aktive Konto, seine Unterknoten und
deren interne Kanten. Andere Konten sowie alle kontoübergreifenden Beziehungen werden erst mit der
Ergebnisprojektion wieder eingeblendet. Wird Master Campus oder Campus E-Mail lokal erreicht,
breitet sich dieser Vorfall über jede bereits bestimmte rote Passwortbeziehung aus, unabhängig
davon, in welcher Richtung die Beziehung zuvor geprüft wurde. Die bereits gezeichnete Ausrichtung
der Beziehung bleibt auch beim Wechsel der Datenleckquelle unverändert; die Ergebnisanimation
spiegelt oder richtet sie nicht neu aus. Blockierte grüne Wege übertragen keinen Befall.

Der jeweils aktuelle Paarangriff darf den betroffenen Prüf- und Schutzzustand nur für seine rote
Angriffsbewegung überlagern. Danach setzt sich das bestimmte Ergebnis wieder durch. Ein lokal
blockiertes Master-Campus-Passwort behält deshalb beim Wechsel zu Campus E-Mail seinen blauen
Schildzustand, sofern kein bereits bestimmter roter Befallsweg diesen Kontozweig erreicht hat.
Dasselbe gilt für Campus E-Mail beim abschließenden Rückwechsel zu Campusgram. Der S06-Abschluss
behält den vollständigen Satz bestimmter Beziehungen und projiziert die Knotenstatus erneut für
Campusgram, statt einen früheren Campusgram-Zwischenstand zu verwenden. S06-Beziehungslabels
referenzieren das aktuell dargestellte
fiktive Passwort und verwenden nicht die S08-Formulierungen mit `das alte`.

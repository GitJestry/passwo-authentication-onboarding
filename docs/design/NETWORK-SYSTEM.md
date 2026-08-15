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

## S09-Skalierungsansicht

Das vollständige S08-Schutzdreieck wird beim Maßstabswechsel einschließlich seiner Abstände,
Detailknoten, Schilde und Kanten proportional um einen gemeinsamen Mittelpunkt verkleinert. Die
anonymen Zusatzkonten füllen den Raum außerhalb dieses Mittelbereichs mit einem festen,
unregelmäßigen Punktmuster und geprüften Mindestabständen; ihre sichtbaren Kreisflächen
überdecken sich weder in der normalen noch in der kompakten Übersichtsdichte. Ein Raster oder
laufzeitabhängiges Zufallslayout wird nicht verwendet. Die Zusatzkonten bleiben einzelne, vollständig deckende
Farbknoten ohne rein dekorative Unterknoten. Ihre Kontoflächen durchlaufen mit individuellen,
weich entsättigten Farbtönen die gesamte Farbskala, ohne die bekannten Hauptkonten zu überstimmen.

Das authored Layout hält eine eigene untere Dialogzone für PassWo, Sprechblase und Tresormoment
frei. Dadurch liegen keine Knoten oder Verbindungen hinter diesen UI-Flächen, während die
Netzfläche selbst ihre Größe und damit die proportionale Skalierung behält. Das zeitlich versetzte
Erscheinen, das kurze Ausblenden springender Ursprungskanten und eine Tiefenwelle machen das
Herauszoomen auf 134 Konten sichtbar. Mit der anschließenden konservativen 80-Konten-Frage
ploppen die 54 nicht mehr benötigten Zusatzkonten in kurzer authored Reihenfolge auf und
verschwinden. Bei Reduced Motion erscheint derselbe vollständige 80-Konten-Endzustand unmittelbar.

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

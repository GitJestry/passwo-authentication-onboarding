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
  verwendet.
- Im Kreis steht nur das Symbol. Das kompakte Label sitzt unterhalb des Kreises; Beschreibung und
  Textstatus bleiben für die zugängliche Benennung sowie für separate Kontextkarten reserviert.
- Ein kleiner Statusmarker überlagert den Kreis: offen, verstanden, betroffen oder geschützt.
  Farbe ergänzt dabei Symbol und zugänglichen Status, ersetzt sie aber nicht.
- Kanten sind eigene ruhige quadratische Kurven. Sie beginnen und enden am sichtbaren Rand des
  jeweiligen Kreises oder Rechtecks, liegen hinter den Nodes und ihren Label-Flächen und verwenden
  keine rechteckigen Smoothstep-Segmente.
- Die Statusfarben und Linienarten für S06 bleiben erhalten: direkte, ähnliche, blockierte und
  hypothetische Verbindungen unterscheiden sich zusätzlich durch Strichmuster.

## S02-Kontenerkundung

S02 „Konten verstehen“ bildet die erste vollständige Kontenerkundung:

1. Master Campus, Campus E-Mail und Campusgram sind gleichzeitig als unterschiedliche
   Symbolkreise in festen Positionen sichtbar;
2. das zuerst gewählte unvollständige Konto sperrt die Auswahl der beiden anderen Konten, bis
   alle seine Details geöffnet sind; danach kann das nächste Konto frei gewählt werden;
3. PassWo fliegt beim erstmaligen Öffnen zum Ziel, steht dort seitlich vom Knoten und kehrt nach
   Abschluss dieses Kontos an seinen Platz unten links zurück;
4. das aktive Konto vergrößert sich leicht; seine Detailknoten erscheinen schrittweise als
   Bubbles und bleiben zusammen mit bereits geöffneten Konten und Kanten bei späteren Wechseln
   sichtbar;
5. Master-Campus-Dienste verwenden `service`/`dependency`, Campus-E-Mail-Funktionen
   `function`/`association`;
6. Campusgram-Inhalte verwenden `content`/`association`; diese Kanten bilden ausschließlich
   lokale Inhaltszuordnungen im Archiv ab, keine SSO- oder Dienstverbindungen;
7. nach dem Unlock existieren alle Details und Kanten des Kontos; die Kanten sind zunächst
   `neutral`, während der Prüfung `checking` und danach `opened`;
8. `opened` bezeichnet ausschließlich die abgeschlossene Detailöffnung und ist weder
   `protected` noch `blocked`;
9. jedes Konto erhält erst nach allen eigenen Details einen klar sichtbaren grünen
   Statusmarker `verstanden`; gleichzeitig bleiben alle Knoten voll sichtbar und die
   abgeschlossene Karte ist nicht mehr auswählbar;
10. der Segmentabschluss ist erst nach allen drei verstandenen Konten verfügbar.

Die Detailvorschau bleibt eine separate Karte neben dem Graphen. Sie ist eine kleine visuelle
Seitenminiatur ohne wiederholenden Erklärungstext, ist kein Bestandteil eines Nodes und beeinflusst
weder Positionen noch den Trainingsablauf.

Danach wird in S06 derselbe Graph um Angriffs- und Schutzstatus erweitert. So wird der Adapter
früh mit den wichtigsten Zuständen validiert, bevor alle Segmente umgesetzt werden.

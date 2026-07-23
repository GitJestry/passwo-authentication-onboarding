# Node Network Visualization System

## Ziel

Das Netzwerk zeigt Konten, abhängige Dienste, Funktionen, Passwortbeziehungen und Angriffspfade
über viele Segmente hinweg konsistent.

## Domänentypen

- `SceneNode`: Konto, Dienst, Funktion, Schutzschild oder Erklärungskarte.
- `SceneEdge`: Abhängigkeit, Prüfung, identische Wiederverwendung, Ähnlichkeit oder blockierter
  Weg.
- `NodeStatus`: neutral, verstanden, abrufbar, nicht-erinnert, exponiert, betroffen, geschützt,
  hypothetisch.
- `EdgeStatus`: neutral, prüfend, direkt, ähnlich, blockiert, hypothetisch.
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

## Erste vertikale Szene

S02 „Konten verstehen“ eignet sich zum Aufbau des Systems:

1. drei Hauptkonten in festen Positionen;
2. Klick auf ein Konto;
3. PassWo bewegt sich zum Ziel;
4. abhängige Knoten erscheinen einzeln;
5. Vorschaukarten werden geöffnet;
6. Konto erhält `verstanden`.

Danach wird in S06 derselbe Graph um Angriffs- und Schutzstatus erweitert. So wird der Adapter
früh mit den wichtigsten Zuständen validiert, bevor alle Segmente umgesetzt werden.

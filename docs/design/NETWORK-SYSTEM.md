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

## S02-Kontenerkundung

S02 „Konten verstehen“ bildet die erste vollständige Kontenerkundung:

1. CampusID, CampusMail und CampusBoard Archiv sind gleichzeitig in festen Positionen sichtbar;
2. die Konten können in beliebiger Reihenfolge geöffnet werden und behalten ihren Fortschritt;
3. PassWo bewegt sich beim erstmaligen Öffnen zum Ziel;
4. nur die Detailknoten des aktiven Kontos erscheinen;
5. CampusID-Dienste verwenden `service`/`dependency`, CampusMail-Funktionen
   `function`/`association`;
6. CampusBoard-Inhalte verwenden `content` und erzeugen keine ausgehenden Kanten;
7. jedes Konto erhält erst nach allen eigenen Details den Textstatus `verstanden`;
8. der Segmentabschluss ist erst nach allen drei verstandenen Konten verfügbar.

Danach wird in S06 derselbe Graph um Angriffs- und Schutzstatus erweitert. So wird der Adapter
früh mit den wichtigsten Zuständen validiert, bevor alle Segmente umgesetzt werden.

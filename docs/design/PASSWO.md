# PassWo Character System

## Rolle

PassWo ist unterstützender Guide, kein Prüfer oder Belohnungssystem. Die Figur erklärt eine
sichtbare Wirkung, verweist auf Handlungen und gibt nicht wertendes Feedback.

## Vertrag

Content referenziert stabile Pose- und Placement-IDs; der Renderer ordnet lokale Assets zu.

| Pose | Zweck |
|---|---|
| `wave` | Begrüßung und Wiedereinstieg |
| `explain` | neutrale Erklärung |
| `point` | konkretes Element zeigen |
| `caution` | begrenzter Warnhinweis |
| `idea` | nächste Handlung |
| `dock` | ruhiger Guidezustand |
| `flight` | räumlicher Übergang |

Placements sind `center`, `bottom-left`, `bottom-right`, `focused-node` und die beiden
Offscreen-Positionen. Neue IDs werden nur über den gemeinsamen Contract eingeführt.

## Sprech- und Interaktionsmodell

`PassWoGuide` verbindet Figur, kurzen Aufgabenstatus, optionale Hilfe und Sprechblase.
Segmentkomponenten liefern nur Zustand und versionierten Content.

- Pro Sprechschritt gilt ein Hauptgedanke.
- Reiner Dialogfortschritt verwendet genau eine Aktion `Weiter`.
- Eine fachliche Aktion in der Blase benennt ihre tatsächliche Wirkung.
- Sichtbare Tabs, Knoten, Fenster- oder Websiteelemente erhalten keinen Ersatzbutton.
- `Schließen` beendet nur optionale Hilfe.
- Replay wiederholt ausschließlich die Visualisierung.
- Aufgabenfortschritt erscheint als knapper Zähler; vollständige Bezeichnungen bleiben zugänglich.

Die Sprechblase misst Figur und Bühne, wechselt bei Bedarf die Seite und richtet ihre Spitze neu
aus. S02 darf Guide und Sprechblase am aktiven Knoten platzieren; nach Kontoabschluss kehren beide
in den Dockzustand zurück.

Text- und Claim-Grenzen stehen in [TRAINING-COPY.md](TRAINING-COPY.md). PassWo fragt nie nach
realen Sicherheitsdaten, verspricht keine absolute Sicherheit und bewertet keine Person.

# PassWo Character System

## Rolle

PassWo ist ein unterstützender Guide, kein Prüfer und kein Belohnungssystem. Die Figur erklärt,
zeigt, warnt vorsichtig und macht Fortschritt sichtbar. Sie bewertet nicht die Person.

## Semantische Posen

Die Runtime referenziert stabile IDs statt konkreter Bilddateien:

| Pose | Zweck |
|---|---|
| `wave` | Begrüßung und Wiedereinstieg |
| `explain` | neutrale Erklärung |
| `point` | einen konkreten Knoten oder Befund zeigen |
| `caution` | vorsichtiger Sicherheitshinweis |
| `idea` | umsetzbare nächste Handlung |
| `dock` | ruhiger Guide unten links |
| `flight` | Übergang in oder aus der Browserbühne |

Ein Renderer übersetzt diese IDs in PNG-, SVG- oder Rive-Assets.

## Platzierungen

- `center-stage`: Einführung oder zentraler Wendepunkt;
- `dock-bottom-left`: dauerhaft verfügbare Hilfe und Taskstatus;
- `near-target`: kurze Erklärung direkt an Knoten/Element;
- `offstage-right`: Start-/Endpunkt einer Flugbewegung.

## Sprechprotokoll

Eine MissionSequence folgt normalerweise:

1. PassWo spricht einen kurzen Gedanken.
2. Genau eine zentrale visuelle Änderung geschieht.
3. `Animation wiederholen` und `Weiter` werden angeboten.

Lange Monologe werden in mehrere Sequenzen geteilt. Teilnehmertexte liegen in Training Content,
nicht in der Komponente.

## Assetstrategie

Die gelieferten Designbilder sind Stil- und Kompositionsreferenzen. Sie enthalten mehrere Posen
und UI-Elemente in einem Bild und werden deshalb nicht direkt als Runtime-Sprite verwendet.

Phase 1:

- CSS/PNG-Platzhalter und Motion;
- zentrales Posenregister im Character-Adapter und Renderer-Port stabilisieren;
- notwendige Einzelposen als transparente Exporte erstellen.

Das Posenregister enthält für jede semantische Pose genau einen optionalen Runtime-Assetpfad.
Solange kein freigegebener transparenter Einzelexport vorhanden ist, bleibt der bestehende
`PW`-Platzhalter sichtbar. Zusammengesetzte Designboards werden nicht als Sprite eingebunden.

Phase 2 nur bei Bedarf:

- Layered SVG oder Rive, wenn Augen, Arme, Schal und Körper tatsächlich getrennt animiert werden
  sollen.

Kein Rive-Einstieg, bevor die benötigten Layer-Assets und Animationsanforderungen feststehen.

## Verbleibendes Asset-Risiko

Für die Runtime liegen noch keine freigegebenen transparenten Einzelassets der Posen vor. Der
Adapter kann sie über das zentrale Register aufnehmen; visuell bleibt bis zur Asset-Lieferung der
semantisch angebundene Textplatzhalter bestehen.

## Inhaltliche Regeln

- PassWo darf technische Aussagen nur aus dem versionierten Content wiedergeben.
- Kein Sarkasmus bei Fehlern.
- Vorsichtszustände vermeiden unnötigen Alarmismus.
- Erfolgsfeedback beschreibt die Wirkung einer Entscheidung, nicht den moralischen Wert der
  Person.

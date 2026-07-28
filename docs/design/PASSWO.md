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
| `dock` | ruhiger Guide am unteren linken Rand |
| `flight` | Übergang in oder aus der Browserbühne |

Ein Renderer übersetzt diese IDs in PNG-, SVG- oder Rive-Assets.

## Platzierungen

Die Runtime verwendet ausschließlich die IDs von `PassWoPlacement`:

- `center`: Einführung oder zentraler Wendepunkt;
- `bottom-left`: dauerhaft verfügbare Hilfe und Taskstatus;
- `focused-node`: kurze Erklärung direkt an Knoten oder Element;
- `offscreen-right`: Start- oder Endpunkt einer Flugbewegung.

`offscreen-left` und `bottom-right` bleiben für passende künftige Szenen reservierte
Placement-IDs; neue Bezeichnungen außerhalb des Contracts werden nicht eingeführt.

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

Die Runtime-Integration beginnt schrittweise mit freigegebenen transparenten Einzelassets. Der
stille `bottom-left`-Zustand verwendet bereits das zugeschnittene Waiting-Asset; während PassWo
spricht, bleibt vorläufig das bestehende Dock-Asset aktiv. Der Guide sitzt fest am unteren Rand
der Browserfläche und bewegt sich nicht mehr zwischen Seitenknoten.

Für `wave`, `explain`, `point`, `caution`, `idea` und `flight` fehlen weiterhin freigegebene
Einzelassets. Die vorhandenen Designboards bleiben Stil- und Kompositionsreferenzen und werden
nicht als Sprite ausgeschnitten oder eingebunden.

Die Namenszeile zeigt den einwortigen Aufgabenstatus statt des Figurennamens. Direkt daneben
öffnet ein Fragezeichen-Button die jeweilige Erklärung. Während PassWo spricht, verschwindet
dieser Button vollständig; die Sprechblase steuert den Sprechschritt dann mit
einem Symbol oben rechts: Überspringen, Nächste oder Schließen. Die Bezeichnung erscheint nur
als Tooltip. Bei einem Sprechschritt, der auf eine direkte Handlung wartet, wird kein
Schließen-Symbol gezeigt: Die Handlung selbst beendet den Schritt. Falls eine Aufgabe Fortschritt
besitzt, zeigt die schmale Zeile darunter ausschließlich den Zähler und eine Fortschrittsleiste;
der ausführliche Text bleibt als zugängliche Bezeichnung erhalten.

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

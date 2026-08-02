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

Die Runtime verwendet zentral das zugeschnittene Waiting-Asset für den stillen Zustand und das
Dock-Asset während eines Sprechschritts. `PassWoGuide` verbindet Figur, Aufgabenstatus, Hilfe und
`PassWoSpeechBubble`; segmentbezogene Komponenten liefern nur Zustand und versionierte Texte. Der
frühere separate `PassWoQuestDock`-Adapter ist entfernt.

S02 bildet die ausdrücklich begrenzte Ausnahme: Während ein Konto erkundet wird, steht PassWo
neben dem aktiven Kontoknoten und die Sprechblase folgt als gemeinsame Guide-Einheit. Beim Intro,
nach Abschluss eines Kontos und beim Segmentabschluss kehrt die Einheit an den unteren linken
Ausgangspunkt zurück.

Die Namenszeile zeigt den einwortigen Aufgabenstatus statt des Figurennamens. Direkt daneben
öffnet ein Fragezeichen-Button die jeweilige Erklärung. Während PassWo spricht, verschwindet
dieser Button vollständig. Der vollständige Sprechblasentext ist sofort verfügbar und darf nur
kurz einblenden. Reine Dialogfortschritte verwenden genau einen sichtbaren Button `Weiter`;
`Schließen` ist ausschließlich für optionale Hinweise zulässig, die keinen Trainingsübergang
auslösen. Wenn eine konkrete Handlung nötig ist, etwa ein Konto öffnen oder ein Passwort prüfen,
ist diese Handlung die einzige primäre Aktion. Falls eine Aufgabe Fortschritt besitzt, zeigt die
schmale Zeile darunter ausschließlich den Zähler und eine Fortschrittsleiste; der ausführliche
Text bleibt als zugängliche Bezeichnung erhalten.

Die Sprechblase wird anhand der gerenderten Position von PassWo und der sichtbaren
Browserbühne gemessen. Bei Größen-, Layout-, Pose- oder Positionswechsel wählt sie bei Bedarf
eine andere Seite und richtet ihre Spitze erneut auf PassWo aus.

Phase 2 nur bei Bedarf:

- Layered SVG oder Rive, wenn Augen, Arme, Schal und Körper tatsächlich getrennt animiert werden
  sollen.

Kein Rive-Einstieg, bevor die benötigten Layer-Assets und Animationsanforderungen feststehen.

## Verbleibendes Asset-Risiko

Für `wave`, `explain`, `point`, `caution`, `idea` und `flight` liegen noch keine freigegebenen
transparenten Einzelassets vor. Bis zu einer fachlich begründeten Erweiterung verwendet der Guide
die beiden vorhandenen lokalen Rasterassets; es gibt keinen zusätzlichen Textplatzhalter-Adapter.

## Inhaltliche Regeln

- PassWo darf technische Aussagen nur aus dem versionierten Content wiedergeben.
- Kein Sarkasmus bei Fehlern.
- Vorsichtszustände vermeiden unnötigen Alarmismus.
- Erfolgsfeedback beschreibt die Wirkung einer Entscheidung, nicht den moralischen Wert der
  Person.

# Fictional BrowserShell

## Zweck

Die BrowserShell erzeugt einen realitätsnahen Kontext und visuelle Kontinuität. Sie simuliert nur
die für das Training benötigten Tabs und Seitenzustände.

Sie ist eine simulierte Trainingsoberfläche im kanonischen Electron-Renderer und keine
Auslieferungsplattform oder eigenständige Browseranwendung.

Sie ist die primäre Oberfläche des supportive Artefakts und füllt dessen verfügbare Artifact
Surface horizontal und vertikal. Eine zusätzliche Studienkarte oder ein Studienheader umschließt
sie nicht.

## Nicht-Ziele

- kein Nachbau von Safari, Chrome oder campusID;
- keine echte URL-Navigation;
- keine Browsererweiterungen, History, Downloads oder Passwortspeicherung;
- keine Verwendung realer Hochschullogos oder Domains;
- keine echte Kontoanmeldung.

## Struktur

```text
BrowserShell
  DesktopSurface
    MenuBar (decorative)
    BrowserWindow
      ChromeBar
        WindowControls
        Tabs
        AddressBar (neutral, read-only)
      PageViewport
        Scene
        OptionalDimLayer
        PassWoLayer
        SpeechLayer
        ControlsLayer
    Dock
```

Die Layer-Reihenfolge ist fest, damit PassWo, Sprechblase und Fokuszustände nicht durch
Seiteninhalte abgeschnitten werden.

Der Chrome bleibt kompakt: Fensterkontrollen, Tabs und eine neutrale Adresszeile geben
Orientierung, ohne erklärende Meta-Labels einzublenden. Gründe für nicht verfügbare Tabs werden
über `aria-describedby` bereitgestellt, sind aber kein dauerhaft sichtbarer Chromeblock.

Die Fensterkontrollen sind klein und kopieren keine Browsermarke. Schließen und Minimieren legen
das fiktive Browserfenster in seinem Dock-Icon ab; das Browser-Icon öffnet es wieder. Die grüne
Kontrolle bleibt orientierend, weil das Fenster bereits die verfügbare Desktopfläche nutzt. Tabs
zeigen eine zurückhaltende neutrale Kennzeichnung und eine klar zusammenhängende aktive Fläche.
Die Adresszeile hat kein sichtbares Label. Eine kleine Schlossform markiert den dargestellten
Seitenstatus, ohne eine Sicherheitszusage abzuleiten.

Sichtbare Disabled-Gründe werden nicht als dauerhafte Absätze im Chrome oder neben Aktionen
wiederholt. Die zugehörige Erklärung bleibt über `aria-describedby` verfügbar und kann über eine
fokussierbare Hinweis-Markierung erreicht werden.

## Fiktive Identität

- Produktneutraler Name wie `campusID` oder eine endgültig freigegebene fiktive Variante.
- Reservierte Beispieldomain wie `campus.example`.
- Tabs und Konten stammen ausschließlich aus dem Trainingsskript.

## Verhalten

- Tabs werden aus einem SceneSnapshot gerendert.
- Nur explizit freigegebene Tabs sind anklickbar.
- Adressleiste ist standardmäßig read-only.
- Browserrahmen beeinflusst keine Studienzeit oder Navigation außerhalb des Artefakts.
- Der Browser kann abgedunkelt werden, ohne Fokus oder Lesbarkeit der aktiven PassWo-Schicht zu
  verlieren.
- Dimming verringert den Kontrast der Bühne nur so weit, dass der Seitenkontext weiter lesbar
  bleibt; es blendet keine Information aus.
- Die Inhaltsfläche erhält den überwiegenden Teil der Höhe; bei `1440 × 900` und `1280 × 720`
  bleiben Hauptaktionen innerhalb des Viewports erreichbar.

## Übergang zur Desktop-Bühne

Browser- und Desktop-Bühne teilen dieselbe `DesktopSurface`. Das Browserfenster liegt maximiert
direkt oberhalb des Docks. Schließen und Minimieren verwenden denselben reduzierbaren Paper-Zoom
in das Browser-Icon; eine gesonderte Wischbühne und eine PassWo-Flugbewegung entfallen.

Der Browser im Dock wird nach dem Abschluss der S02-Kontenerkundung aktiv. Sein Klick öffnet
zunächst die Browserfläche mit der spiegelbildlichen Paper-Zoom-Animation und schließt danach den
bestehenden Segment- und Timingwechsel ab. Die Desktop-Bühne bleibt eine fiktive räumliche
Orientierung und keine Betriebssystemsimulation. Finder, Messenger, Browser, Einstellungen und
Papierkorb sind bis auf den Browser rein dekorativ.

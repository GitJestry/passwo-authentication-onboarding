# Fictional BrowserShell

## Zweck

Die BrowserShell erzeugt einen realitätsnahen Kontext und visuelle Kontinuität. Sie simuliert nur
die für das Training benötigten Tabs und Seitenzustände.

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
  ChromeBar
    WindowControls (neutral)
    Tabs
    AddressBar (neutral, read-only)
  PageViewport
    Scene
    OptionalDimLayer
    PassWoLayer
    SpeechLayer
    ControlsLayer
```

Die Layer-Reihenfolge ist fest, damit PassWo, Sprechblase und Fokuszustände nicht durch
Seiteninhalte abgeschnitten werden.

Der Chrome bleibt kompakt: Fensterkontrollen, Tabs und eine neutrale Adresszeile geben
Orientierung, ohne erklärende Meta-Labels einzublenden. Gründe für nicht verfügbare Tabs werden
über `aria-describedby` bereitgestellt, sind aber kein dauerhaft sichtbarer Chromeblock.

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
- Die Inhaltsfläche erhält den überwiegenden Teil der Höhe; bei `1440 × 900` und `1280 × 720`
  bleiben Hauptaktionen innerhalb des Viewports erreichbar.

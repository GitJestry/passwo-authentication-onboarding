# Fictional BrowserShell

## Zweck

Die BrowserShell erzeugt einen realitätsnahen Kontext und visuelle Kontinuität. Sie simuliert nur
die für das Training benötigten Tabs und Seitenzustände.

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
    FictionalAddressBar
    UtilityArea
  PageViewport
    Scene
    OptionalDimLayer
    PassWoLayer
    SpeechLayer
    ControlsLayer
```

Die Layer-Reihenfolge ist fest, damit PassWo, Sprechblase und Fokuszustände nicht durch
Seiteninhalte abgeschnitten werden.

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

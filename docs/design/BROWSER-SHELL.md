# Fictional BrowserShell

## Zweck

Die BrowserShell trägt die fiktiven Dienste `Master Campus`, `Campus E-Mail` und `Campusgram` und
stellt nur die für S00–S17 benötigten Tabs, Seiten und Fensterzustände dar. Sie füllt die
Artifact Surface und speichert keine Forschungsdaten.

Sie ist kein Browsernachbau: Es gibt keine echte URL-Navigation, History, Downloads,
Browsererweiterungen, realen Konten oder Hochschulmarken.

## Struktur

```text
DesktopSurface
  MenuBar
  BrowserWindow
    ChromeBar: controls, tabs, read-only address
    PageViewport: scene, dim, PassWo, speech, controls
  Dock
```

Die Layer-Reihenfolge verhindert, dass Szene, PassWo, Sprechblase oder Fokus abgeschnitten werden.
Chrome und Fensterkontrollen bleiben kompakt. Disabled-Gründe sind zugänglich, aber kein
dauerhaft sichtbarer Metatext.

## Verhalten

- Tabs und Seiten entstehen aus `SceneSnapshot`; nur explizit freigegebene Ziele sind bedienbar.
- Schließen, Minimieren und Dock-Öffnen verändern ausschließlich die fiktive Desktopbühne.
- Die Adresszeile ist neutral und read-only; das Schlosssymbol ist keine Sicherheitsgarantie.
- Landingpages, Formulare und Dashboards zeigen nur den für das Training benötigten Inhalt.
- Der fiktive Konto-Identifier und tabbezogene Scrollpositionen bleiben im Arbeitsspeicher.
- Registrierungs- und Anmeldeerfolg sind kurze Statechart-Zwischenzustände.
- Simulierte Passwortfelder sind normale lokal maskierte Textfelder und werden für externe
  Passwortmanager ausdrücklich nicht als Zugangsdaten des Study-Origins angeboten.
- S13-Autofillfelder bleiben editierbar; Speicherhinweise können nach Ablehnung erneut geöffnet
  werden.
- Während erklärender Sequenzen darf die Shell gesperrt, aber nicht unlesbar gemacht werden.
- Native Interaktionsflächen bewegen sich bei Hover oder Active nicht unter dem Zeiger weg.

Die Shell folgt dem Full-Bleed- und Safe-Space-Modell aus [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).
Kompakte Viewports ordnen Inhalte um oder scrollen, ohne Texte und Pflichtaktionen global zu
verkleinern.

## Desktopübergang

Browserfenster und Desktop teilen dieselbe `DesktopSurface`. Das Dock öffnet oder minimiert das
Fenster mit einem reduzierbaren Paper-Zoom. Andere Dockelemente bleiben dekorativ. Diese Bühne ist
räumliche Orientierung und keine Betriebssystemsimulation.

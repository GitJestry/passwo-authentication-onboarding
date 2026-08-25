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
das fiktive Browserfenster in seinem Dock-Icon ab; das Browser-Icon schließt das geöffnete Fenster
beziehungsweise öffnet es wieder. Die grüne Kontrolle bleibt orientierend, weil das Fenster bereits
die verfügbare Desktopfläche nutzt. Tabs zeigen neben dem Seitennamen das zugehörige kleine lokale
Markensymbol sowie eine klar zusammenhängende aktive Fläche.
Die Adresszeile hat kein sichtbares Label. Eine kleine Schlossform markiert den dargestellten
Seitenstatus, ohne eine Sicherheitszusage abzuleiten.

Die drei fiktiven Landingpages enden nach ihrem viewportfüllenden Hero. Zusätzliche Produkt-,
Aktivitäts- oder Marketingsektionen unterhalb dieses Einstiegs werden nicht gerendert. Die
Registrierungs- und Anmeldeansichten behalten Zurück-Link und Seitentitel links und zentrieren das
größere Formular darunter in der verfügbaren Inhaltsfläche. Sie wiederholen dort weder Dienstrolle
noch Dienstwerbung. Dashboards beginnen direkt unter dem Browser-Chrome und besitzen keinen
zusätzlichen Website-Header.

Der flüchtige Konto-Identifier kann im Chrome als Kreis mit den ersten zwei alphanumerischen
Zeichen des fiktiven Benutzernamens erscheinen. Die Ableitung und die Anzeige bleiben im
Arbeitsspeicher; die BrowserShell persistiert weder Identifier noch Kürzel.

Sichtbare Disabled-Gründe werden nicht als dauerhafte Absätze im Chrome oder neben Aktionen
wiederholt. Die zugehörige Erklärung bleibt über `aria-describedby` verfügbar und kann über eine
fokussierbare Hinweis-Markierung erreicht werden.

## Fiktive Identität

- Fiktive Dienste heißen `Master Campus`, `Campus E-Mail` und `Campusgram`; ihre Logos stammen
  aus derselben lokalen Symbolregistry wie die Netzwerkknoten.
- Reservierte Beispieldomain wie `campus.example`.
- Tabs und Konten stammen ausschließlich aus dem Trainingsskript.

## Verhalten

- Tabs werden aus einem SceneSnapshot gerendert.
- Nur explizit freigegebene Tabs sind anklickbar.
- Adressleiste ist standardmäßig read-only.
- Erklärende Zeitraffer können die sichtbare Shell vorübergehend sperren, ohne sie abzudunkeln;
  Fensterkontrollen, Dock, Tabs und Seiteninhalt bleiben dann bis zum nächsten Lernschritt inaktiv.
- Browserrahmen beeinflusst keine Studienzeit oder Navigation außerhalb des Artefakts.
- Die Inhaltsfläche scrollt nativ. Ein optionaler `scrollKey` merkt die vertikale Position pro
  fiktivem Tab und Seitenzustand nur für die Lebensdauer der BrowserShell; ein neuer Schlüssel
  startet oben.
- Ein erfolgreicher Registrierungs- oder Anmelde-Check wird zwei Sekunden lang angezeigt und
  danach automatisch beendet. Tabwechsel und Trainingsübergänge dürfen ihn früher beenden; nach
  der Rückkehr zu einem bereits bestätigten Konto erscheint er nicht erneut.
- Nach dem ersten Ablehnen eines S13-Speicher- oder Update-Hinweises darf der
  Passwortmanager-Indikator eine wiederholte Fokusfolge aus Vergrößern, Wackeln, Verkleinern und
  Pause zeigen. Der zugehörige Statechart-Zustand beendet sie beim erneuten Öffnen des Hinweises
  beziehungsweise beim Speichern oder Aktualisieren. Bei Reduced Motion bleibt nur der
  unbewegte Fokusrahmen sichtbar.
- Die simulierten S13-Loginfelder bleiben nach einem Autofill editierbar. Ein Fokus auf
  Benutzername oder Passwort darf die lokale Tresorliste unabhängig von der bereits vorhandenen
  Zeichenzahl erneut öffnen; das bloße Verlassen eines vollständig gefüllten Feldes sperrt die
  Anmeldung nicht.
- Der Muster-Bank-Status `Passwort aktualisiert` ist ein zweisekündiger
  Statechart-Zwischenstatus. Der aktualisierte lokale Tresoreintrag bleibt danach für den
  weiteren Übungsablauf wirksam, ohne Eingabewerte zu persistieren.
- Native Interaktionsflächen behalten bei Hover und Drücken ihre tatsächliche Position. Eine
  visuelle Rückmeldung darf die klickbare Fläche nicht unter einem Zeiger am Rand wegbewegen.
- Der Browser kann abgedunkelt werden, ohne Fokus oder Lesbarkeit der aktiven PassWo-Schicht zu
  verlieren.
- Dimming verringert den Kontrast der Bühne nur so weit, dass der Seitenkontext weiter lesbar
  bleibt; es blendet keine Information aus.
- Die Inhaltsfläche erhält den überwiegenden Teil der Höhe. Im Standardmodus bleibt die authored
  Dichte von `1440 × 900` die Referenz, während BrowserShell, DesktopSurface und alle Layer gemäß
  `ADR 0015-Artifact-Viewport` die tatsächliche Containerfläche ohne Gesamttransformation füllen.
  Im kompakten Desktopmodus bleiben Hauptaktionen durch Umordnung oder Scrollen erreichbar;
  PassWo-Sprechflächen dürfen sichtbare Handlungsziele nicht überdecken.
- Landingpage-Aktionszeilen berücksichtigen die lokale PassWo-Safe-Space-Zone. Die Inhaltsgruppe
  hält ausreichend Blockraum frei, damit Aktionen oberhalb des unteren PassWo-Docks und der
  seitlich anschließenden Sprechblase bleiben; schmale Flächen dürfen dafür nativ scrollen.

## Übergang zur Desktop-Bühne

Browser- und Desktop-Bühne teilen dieselbe `DesktopSurface`. Das Browserfenster liegt maximiert
direkt oberhalb des Docks. Schließen und Minimieren verwenden denselben reduzierbaren Paper-Zoom
in das Browser-Icon; eine gesonderte Wischbühne und eine PassWo-Flugbewegung entfallen.

Der Browser im Dock wird nach dem Abschluss der S02-Kontenerkundung aktiv. Sein Klick öffnet
zunächst die Browserfläche mit der spiegelbildlichen Paper-Zoom-Animation und schließt danach den
bestehenden Segment- und Timingwechsel ab. Die Desktop-Bühne bleibt eine fiktive räumliche
Orientierung und keine Betriebssystemsimulation. Finder, Messenger, Browser, Einstellungen und
Papierkorb sind bis auf den Browser rein dekorativ.

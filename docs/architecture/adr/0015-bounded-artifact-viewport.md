# ADR 0015 — Full-Bleed Artefakt-Viewport

- **Status:** Accepted
- **Datum:** 2026-08-10

## Kontext

Der kanonische Renderer wird sowohl in Electron als auch künftig in einem normalen
Desktop-Browser verwendet. Eine frei mit dem äußeren Fenster wachsende Trainingsbühne kann auf
großen Viewports die authored Abstände zwischen BrowserShell, PassWo, Sprechblasen und
Szenenelementen verändern. Eine feste Bühne, die als Ganzes transformiert und zentriert wird,
erzeugt jedoch zwei schwerwiegendere Probleme: Text und UI werden bei nicht ganzzahligen Faktoren
unscharf, und freie Fläche um die Bühne erscheint als sichtbarer Rahmen, der die Immersion bricht.

Die bisherige Komposition und das Designziel verwenden `1440 × 900` CSS-Pixel. Diese Größe bleibt
eine Authoring-Referenz, darf aber keine sichtbare Leinwandgrenze sein. Hardwareauflösung und
physische Bildschirmgröße sind keine Layoutparameter.

## Entscheidung

Supportive und Reference Artifact werden innerhalb desselben presentation-only
`ArtifactViewport` als echte Full-Bleed-Fläche gerendert.

- Die Artefaktbühne entspricht jederzeit der tatsächlichen Breite und Höhe ihres Containers.
- Die Bühne wird nicht mit `transform`, `zoom`, Canvas oder einer gerasterten Gesamtansicht
  skaliert. Text, Icons, Fokusrahmen und Controls werden in nativen CSS-Pixeln gerendert.
- `1440 × 900` bleibt die Referenz für Komposition und visuelle Dichte, nicht die feste Größe
  eines inneren Kastens.
- Browser- und Desktop-Chrome reichen bis an die tatsächlichen Bühnenränder. Große Viewports
  werden durch begrenzte Inhaltsbreiten, `clamp()` und lokale Layoutzonen strukturiert, nicht
  durch Außenränder um die gesamte App.
- Eine gemeinsame native Dichteeinheit folgt der kürzeren, gegen `1440 × 900` normalisierten
  Containerachse: `clamp(1rem, min(1.1111cqw, 1.7778cqh), 1.35rem)`. Sie beträgt an der
  Authoring-Referenz `16px`, bei `1920 × 1080` ungefähr `19.2px` und erreicht spätestens bei
  `2560 × 1440` ihr Maximum von `21.6px`. Typografie-, Abstands-, Control- und zentrale
  Illustrationstokens werden daraus nativ neu gelayoutet.
- Unter `1152 × 720` verwendet der Renderer einen kompakten Desktopmodus. Dieser Modus darf
  Inhalte umordnen oder scrollen, verkleinert Text und Bedienelemente aber nicht global.
- Zwischen dem kompakten Modus und der Authoring-Referenz verwendet der Renderer einen
  constrained Modus für früh einspaltig angeordnete Arbeitsgruppen. Ab `1680px` Breite und
  mindestens Referenzhöhe kennzeichnet ein expansive Modus die zusätzliche Kompositionsfläche;
  die Dichte bleibt weiterhin durch die kürzere Achse bestimmt.
- PassWo und Sprechblase belegen eine lokale Safe-Space-Zone. Szenen dürfen diese Zone durch
  Grid, Gutters oder Scrollraum freihalten; ein pauschaler Prozentversatz der gesamten Szene ist
  nicht zulässig.
- Study Shell, Einwilligung, Instrumente, Guardrails, Debriefing und technische Fehler bleiben
  normal responsive und werden nicht als Bühne skaliert.
- Größenentscheidungen beruhen ausschließlich auf dem tatsächlichen Container in CSS-Pixeln.
  Sie sind lokaler Darstellungszustand und werden weder in Statecharts noch in Forschungsdaten
  aufgenommen.
- Breakpoints innerhalb des Artefakts verwenden die benannte Containerfläche
  `artifact-stage`. Fachliche Endzustände ändern sich dadurch nicht.

## Konsequenzen

- Text und UI bleiben auch bei beliebigen Fenstergrößen nativ scharf.
- Die Anwendung bleibt auf großen und ultrabreiten Displays immersiv und füllt die gesamte
  verfügbare Fläche.
- Supportive und Reference Artifact erhalten denselben Full-Bleed-Viewport.
- Große Inhaltsabstände müssen lokal durch begrenzte Content-Zonen kontrolliert werden.
- Begrenzte Textmaße und lokale Arbeitsgruppen bleiben zulässig. Eine begrenzte Gesamtbühne,
  Letterboxing oder sichtbare Außenbox bleibt ausgeschlossen.
- Browser-Zoom oder kleine Fenster werden nicht durch Gegenskalieren neutralisiert.
- Innerhalb der Artefaktbühne dürfen keine Positionen von `window.innerWidth`,
  `window.innerHeight` oder dem äußeren Viewport abhängen. Stage- oder Containergrößen sind zu
  verwenden.
- Der `ArtifactViewport` ist eine gemeinsame Boundary des kanonischen Renderers; es entsteht kein
  zweiter Renderer, Store oder Workflow.
- Der kompakte Desktopmodus ist kein Mobile-Produktpfad. Er schützt Lesbarkeit und Bedienbarkeit
  bei Browser-Chrome, Split View und vergrößertem Inhalt.

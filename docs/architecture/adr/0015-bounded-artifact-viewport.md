# ADR 0015 — Full-Bleed-Artefakt-Viewport

- **Status:** Accepted
- **Datum:** 2026-08-10

## Entscheidung

Supportive und Reference Artifact verwenden denselben `ArtifactViewport` als echte Full-Bleed-
Fläche.

- Die Bühne entspricht jederzeit ihrem Container.
- Es gibt keine globale `transform`-, `zoom`-, Canvas- oder Raster-Skalierung.
- `1440 × 900` CSS-Pixel bleibt Authoring-Referenz, nicht sichtbare Leinwandgrenze.
- Native Tokens leiten Dichte aus
  `clamp(1rem, min(1.1111cqw, 1.7778cqh), 1.35rem)` ab.
- Unter `1152 × 720` gilt der kompakte, ab `1680 × 900` der expansive Desktopmodus.
- Lokale Layoutzonen ordnen um oder scrollen; Text und Controls werden nicht global verkleinert.
- PassWo und Sprechblase erhalten lokalen Safe Space.
- Breakpoints verwenden den Container `artifact-stage`, nie Hardwaremaße oder den äußeren
  Browserviewport.
- Study Shell, Instrumente und Debriefing bleiben normal responsive.

## Konsequenzen

Text, Fokus und Controls bleiben nativ scharf. Beide Bedingungen nutzen dieselbe Präsentations-
Boundary und denselben fachlichen Endzustand. Letterboxing, sichtbare Außenbox, zweiter Renderer
oder layoutabhängiger Workflow bleiben ausgeschlossen.

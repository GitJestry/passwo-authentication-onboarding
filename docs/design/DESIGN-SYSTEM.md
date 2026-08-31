# Design System

## Gestaltungsziel

PassWo wirkt wie eine ruhige, hochwertige Browseranwendung, ohne einen realen Browser oder ein
Hochschulsystem nachzubauen. Die BrowserShell ist Lernbühne, kein Browser-Emulator. Instrumente
und Debriefing verwenden die neutrale Study Shell; beide Lernartefakte nutzen eine gemeinsame
Full-Bleed-Fläche.

## Tokens und Semantik

Farben, Typografie, Abstände, Radien, Schatten und Motion-Dauern liegen in
`packages/ui/src/styles/tokens.css`. Feature-Komponenten verwenden keine parallelen Tokenquellen.

| Rolle | Bedeutung |
|---|---|
| `ink` | Text und Struktur |
| `accent` | PassWo und aktive Schritte |
| `positive` | bestätigter Fortschritt oder Schutzwirkung |
| `warning` | Vorsicht oder hypothetischer Risikoweg |
| `danger` | tatsächlich betroffener Simulationszustand |
| `surface` | Bühne, Arbeitsfläche und Overlay |

Farbe wird immer durch Text, Symbol, Form oder Strichart ergänzt. Karten bündeln eine eigenständige
Interaktion oder einen Status; sie ersetzen keine visuelle Hierarchie.

## Layout

ADR 0015 definiert den gemeinsamen Artefakt-Viewport:

- `1440 × 900` CSS-Pixel ist die Authoring-Referenz, keine feste Leinwand.
- Die Bühne füllt den Container ohne globale `transform`- oder `zoom`-Skalierung.
- Text und Controls bleiben nativ gerendert; lokale Zonen ordnen um oder scrollen.
- Unter `1152 × 720` gilt der kompakte, ab `1680 × 900` der expansive Desktopmodus.
- Textzeilen bleiben ungefähr 65–75 Zeichen breit.
- PassWo und Sprechblase erhalten lokalen Safe Space und verdecken keine Pflichtaktion.
- Breakpoints richten sich nach `artifact-stage`, nicht nach Hardware oder `window.innerWidth`.

Alle relevanten Desktopgrößen bleiben vollständig nutzbar. Die Study Shell ist unabhängig davon
normal responsive.

## Interaktion und Motion

Bedienbare Elemente besitzen Default-, Hover-, `focus-visible`-, Active-, Disabled- und bei Bedarf
Fehlerzustände. Tastaturreihenfolge und Fokus bleiben eindeutig; horizontales Dialogscrollen ist
ausgeschlossen.

Motion erklärt räumliche Ursache und Wirkung. `prefers-reduced-motion` zeigt denselben fachlichen
Endzustand unmittelbar oder mit kurzer Überblendung. Erklärsequenzen sind wiederholbar; dekorative
Bewegung darf nie Fortschritt oder Information tragen.

Teilnehmertexte folgen [TRAINING-COPY.md](TRAINING-COPY.md).

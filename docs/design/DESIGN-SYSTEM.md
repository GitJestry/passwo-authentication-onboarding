# Design System

## Gestaltungsabsicht

Die Oberfläche soll sich wie eine hochwertige, ruhige Browseranwendung anfühlen, ohne Safari,
Chrome oder ein reales Hochschulsystem nachzubauen. Der Browserrahmen ist eine Lernbühne, kein
Browser-Emulator.

## Design Tokens

Alle Farben, Abstände, Typografie, Radien, Schatten und Motion-Dauern werden als CSS Custom
Properties in `packages/ui/src/styles/tokens.css` gepflegt. Keine ad-hoc Hexwerte in
Feature-Komponenten.

Kernrollen:

- `--color-ink`: Lesetext und Struktur;
- `--color-accent`: PassWo und aktive Lernschritte;
- `--color-positive`: bestätigte oder geschützte Zustände;
- `--color-warning`: Vorsicht, Ähnlichkeit oder hypothetischer Risikoweg;
- `--color-danger`: tatsächlich betroffener Zustand in der Simulation;
- `--color-surface-*`: Browser, Karten und Overlays.

Farben werden immer durch Text, Symbol, Strichart oder Form ergänzt.

## Layoutziel

Primärer Studienviewport: `1440 × 900` CSS-Pixel.  
Mindestziel: `1280 × 720` CSS-Pixel.

- Browserbühne bleibt innerhalb des Viewports sichtbar.
- Textzeilen maximal ungefähr 65–75 Zeichen.
- PassWo darf zentrale Interaktionen nicht verdecken.
- Dialoge besitzen eine feste Fokusreihenfolge und keinen horizontalen Scroll.

Die neutrale Study Shell wird ausschließlich für Einwilligung, Instrumente, Guardrails, Debrief
und technische Fehler verwendet. Supportive und Reference Artefakte liegen auf einer eigenen,
viewportfüllenden Artifact Surface ohne Studienheader, äußere Karte oder Studienbranding. Nach
Artefaktende wechselt die Oberfläche zurück zur Study Shell.

Die BrowserShell nutzt die Artifact Surface vollständig. Ihr kompakter Chrome dient nur der
Orientierung; Inhalts- und Interaktionsfläche haben Vorrang.

## Typografie

Nur lokale Systemschriften. Keine Webfont-CDNs. Eine robuste System-Sans-Stack sorgt für kurze
Ladezeit und reproduzierbaren Offlinebetrieb.

## Interaktionszustände

Jedes interaktive Element hat mindestens:

- default;
- hover, sofern Zeiger vorhanden;
- sichtbaren `:focus-visible`-Ring;
- pressed/active;
- disabled mit erklärbarem Grund;
- error oder validation message, falls relevant.

## Motion

- Transform und Opacity bevorzugen; keine unnötigen Layoutanimationen.
- `prefers-reduced-motion: reduce` zeigt denselben Endzustand unmittelbar oder mit kurzer
  Überblendung.
- Pädagogisch notwendige Schritte bleiben inhaltlich sichtbar, auch wenn Bewegung deaktiviert ist.
- Nicht wesentliche Bewegung ist überspringbar; Erklärsequenzen sind wiederholbar.

## Teilnehmertexte

- kurze, direkte Sätze;
- kein „Du hast versagt“ oder moralischer Ton;
- keine absolute Sicherheitszusage;
- ein Hauptgedanke pro PassWo-Sprechschritt;
- Buttons benennen die Handlung, nicht „OK“.

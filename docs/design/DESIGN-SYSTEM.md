# Design System

## Gestaltungsabsicht

Die Oberfläche soll sich wie eine hochwertige, ruhige Browseranwendung anfühlen, ohne Safari,
Chrome oder ein reales Hochschulsystem nachzubauen. Der Browserrahmen ist eine Lernbühne, kein
Browser-Emulator.

## Design Tokens

Alle Farben, Abstände, Typografie, Radien, Schatten und Motion-Dauern werden als CSS Custom
Properties in `packages/ui/src/styles/tokens.css` gepflegt. Keine ad-hoc Hexwerte in
Feature-Komponenten.

Die Oberfläche verwendet drei Elevation-Stufen: die flache Seitenfläche, sparsam abgehobene
Arbeitsgruppen und den Browserrahmen als höchste Ebene. Karten werden nur eingesetzt, wenn sie
eine eigenständige Interaktion oder einen Status bündeln; eine Umrahmung ist kein Ersatz für
Hierarchie.

Kernrollen:

- `--color-ink`: Lesetext und Struktur;
- `--color-accent`: PassWo und aktive Lernschritte;
- `--color-positive`: bestätigte oder geschützte Zustände;
- `--color-warning`: Vorsicht, Ähnlichkeit oder hypothetischer Risikoweg;
- `--color-danger`: tatsächlich betroffener Zustand in der Simulation;
- `--color-surface-*`: Browser, Karten und Overlays.

Farben werden immer durch Text, Symbol, Strichart oder Form ergänzt.

## Layoutziel

Die immersive Artifact Surface folgt `ADR 0015-Artifact-Viewport` und füllt immer den gesamten
verfügbaren Container. `1440 × 900` CSS-Pixel bleibt die Referenz für Komposition und Dichte, ist
aber keine feste oder sichtbar begrenzte Leinwand. Die gesamte App wird weder transformiert noch
gezoomt; Text, Icons und Bedienelemente bleiben nativ gerendert.

Unter `1152 × 720` verwendet die Artifact Surface einen kompakten Desktopmodus. Zwischen dieser
Grenze und `1440 × 900` ordnet ein constrained Modus breite Arbeitsgruppen frühzeitig einspaltig
an. Ab `1680 × 900` steht ein expansive Modus für zusätzliche Kompositionsfläche zur Verfügung.
Alle Modi ordnen bei Bedarf um oder scrollen, statt Text, Klickziele und Sprechblasen global zu
verkleinern. Die Study Shell bleibt unabhängig davon normal responsive.

Die gemeinsame Dichteeinheit
`clamp(1rem, min(1.1111cqw, 1.7778cqh), 1.35rem)` hält bis `1440 × 900` die native
16-px-Basis, beträgt bei `1920 × 1080` ungefähr `19.2px` und endet bei `21.6px`. Typografie,
Abstände, Controls und zentrale Illustrationsgrößen leiten sich davon ab. Breite, aber flache
Fenster werden durch die kürzere Achse nicht zu groß. Es findet weiterhin keine Skalierung der
Gesamtoberfläche statt.

- Browserbühne und alle ihre Layer verwenden dieselbe Full-Bleed-Koordinatenfläche.
- Browser- und Desktop-Chrome reichen bis an den Rand des verfügbaren Containers.
- Inhaltsbreiten, Textzeilen und lokale Arbeitszonen werden begrenzt; die App selbst nicht.
- Die Browser-Chrome bleibt kompakt, damit die Inhaltsfläche mindestens ungefähr 82 % der
  verfügbaren Fensterhöhe erhält.
- Textzeilen maximal ungefähr 65–75 Zeichen.
- PassWo darf zentrale Interaktionen nicht verdecken.
- Ein aktiver PassWo-Schritt reserviert lokal eine Safe-Space-Zone für Figur und Sprechblase;
  Szenen reagieren darauf mit Grid-Zonen, Gutters oder Scrollraum statt Prozentverschiebungen.
- Dialoge besitzen eine feste Fokusreihenfolge und keinen horizontalen Scroll.
- Layoutentscheidungen verwenden den tatsächlichen Container in CSS-Pixeln, nicht Zoll,
  Hardwarepixel oder `window.innerWidth`.

Die neutrale Study Shell wird ausschließlich für Einwilligung, Instrumente, Guardrails, Debrief
und technische Fehler verwendet. Supportive und Reference Artefakte liegen auf einer eigenen,
viewportfüllenden Artifact Surface ohne Studienheader, äußere Karte oder Studienbranding. Nach
Artefaktende wechselt die Oberfläche zurück zur Study Shell.

Die BrowserShell nutzt die Artifact Surface vollständig und ohne äußeren Rahmen. Ihr kompakter
Chrome dient nur der Orientierung; Inhalts- und Interaktionsfläche haben Vorrang.

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
- Nicht reduzierte Übergänge liegen zwischen 180 und 450 ms und machen eine räumliche Ursache
  sichtbar, etwa das Auftauchen einer Erklärung am referenzierten Element.
- `prefers-reduced-motion: reduce` zeigt denselben Endzustand unmittelbar oder mit kurzer
  Überblendung.
- Pädagogisch notwendige Schritte bleiben inhaltlich sichtbar, auch wenn Bewegung deaktiviert ist.
- Nicht wesentliche Bewegung ist überspringbar; Erklärsequenzen sind wiederholbar.

## Teilnehmertexte

Die verbindliche Authoring- und Review-Grundlage ist
`docs/design/TRAINING-COPY.md`. Ergänzend gilt:

- kurze, direkte Sätze;
- kein „Du hast versagt“ oder moralischer Ton;
- keine absolute Sicherheitszusage;
- ein Hauptgedanke pro PassWo-Sprechschritt;
- Buttons benennen die tatsächlich durch sie ausgelöste Handlung, nicht „OK“;
- externe Handlungsziele wie Tabs oder Fenstersteuerungen erhalten keinen ersetzenden
  Sprechblasenbutton;
- Hervorhebung markiert einen Carry-forward-Kerngedanken und ist kein Absatz-Abstract;
- interne Research-, Runtime- und Design-Lab-Begriffe werden nicht als Lerntext gerendert.

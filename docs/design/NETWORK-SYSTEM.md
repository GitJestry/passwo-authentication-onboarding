# Knotennetzwerk

## Zweck und Grenze

Das Netzwerk macht Beziehungen zwischen fiktiven Konten, Funktionen, Inhalten und
Schutzmaßnahmen sichtbar. Fachzustand und Layoutmodell sind frameworkfrei; React Flow rendert nur
den Snapshot. Knoten und Kanten enthalten keine realen oder persistierten Teilnehmerdaten.

## Modell

```ts
interface NetworkScene {
  id: string;
  nodes: readonly NetworkNode[];
  edges: readonly NetworkEdge[];
  camera: CameraPreset;
}
```

Stabile Node-Arten sind Konto, Dienst, Funktion, Inhalt, Angreifer und Schutzmaßnahme. Kanten
unterscheiden Abhängigkeit, Zuordnung, Passwortbeziehung, Angriffsweg und Schutzwirkung.

## Zustandssemantik

| Zustand | Bedeutung |
|---|---|
| `neutral` | noch nicht fachlich eingeordnet |
| `checking` | aktuell sichtbare Prüfung |
| `opened` | Vorschau vollständig angesehen |
| `exposed` | tatsächlich betroffener Simulationspfad |
| `at-risk` | hypothetischer oder offener Risikoweg |
| `blocked` | konkreter Weg wurde gestoppt |
| `protected` | sichtbare zusätzliche Schutzwirkung |

Farbe wird durch Form, Symbol, Label oder Strichart ergänzt. `protected` ist keine absolute
Sicherheitszusage; `no-derived-path-recognized` ist kein Stärkeurteil.

## Layout und Interaktion

- Positionen sind deterministisch authored oder aus einem injizierten Seed abgeleitet.
- Hauptkonten behalten über Segmente stabile Anker, damit Zustandsänderungen vergleichbar bleiben.
- Kamera-Presets steuern Komposition, nicht Domainlogik.
- Aktive Ziele sind per Tastatur erreichbar und besitzen sichtbaren Fokus.
- Labels bleiben bei Zoom, kompakter Bühne und Reduced Motion lesbar.
- Detailvorschauen sind responsive Karten über dem Graphen und duplizieren keinen PassWo-Text.
- Animationen verändern fachliche Zustände erst über den Mission Controller.

S02 baut das mentale Kontomodell auf. S06 ergänzt lokale Einzel- und Paarvergleiche; S08 löst
offene Beziehungen; S09 skaliert die authored Illustration; S14–S17 ergänzen MFA-Schutzwirkung.
Die konkrete Reihenfolge liegt in `packages/training-content` und den Statecharts.

## Datenschutz

Passwortwerte, Markierungen und Analysebefunde bleiben außerhalb des Netzwerkvertrags. Der
serverseitige Fortschrittscheckpoint enthält nur die in ADR 0016 erlaubte Segment-ID und den
minimalen S08-Resume-Zustand. Das Netzwerk selbst wird nicht als Forschungsantwort exportiert.

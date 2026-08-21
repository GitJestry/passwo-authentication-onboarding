# Animation System

## Ziel

Animationen sind reproduzierbare Lernschritte, nicht dekorative Nebenwirkungen einzelner
Komponenten.

## Domänenmodell

```ts
interface AnimationSequence {
  id: string;
  steps: readonly AnimationStep[];
  reducedMotion: ReducedMotionPlan;
  maxDurationMs: number;
}
```

Typische Steps:

- `move-character`;
- `reveal` / `hide`;
- `highlight`;
- `set-node-status`;
- `draw-edge`;
- `pulse`;
- `wait-for-user`;
- `announce`.

## Handshake

```mermaid
sequenceDiagram
  participant M as Mission Controller
  participant A as Animation Adapter
  participant U as UI
  M->>A: PLAY_SEQUENCE(sequence)
  A->>U: rendere Schritte
  A-->>M: ANIMATION_FINISHED
  M->>U: Replay / Weiter aktivieren
```

Die Mission wartet niemals auf einen willkürlichen Timeout in einer Komponente. Der Adapter muss
bei Abbruch oder Fehler einen definierten Endzustand herstellen.

## Regeln

- Jede Sequenz hat stabile ID und erwarteten Endzustand.
- Ein Replay erzeugt denselben fachlichen Zustand.
- Zufallsdarstellungen verwenden einen Seed, wenn sie für Tests oder Studienvergleich relevant
  sind.
- Lange Wartephasen sind Contentkonfiguration und nicht im Renderer versteckt.
- Reduced Motion darf keine Information entfernen.
- Animationen können pausiert werden, wenn der Tab verborgen ist; die primäre Artefaktzeit läuft
  dennoch als Wall-Clock weiter.

## Button-Interaktion

Jeder bedienbare Button erhält unabhängig von Größe und visueller Variante ein zurückhaltendes
physisches Feedback: Beim Hover hebt er sich minimal, beim Drücken bewegt er sich leicht zurück
und wird geringfügig skaliert. Das gilt auch für sekundäre, transparente und reine Icon- oder
Info-Buttons. Die globale Button-Basis im Web-Client stellt dieses Verhalten für bestehende und
künftige native Buttons bereit; komponentenspezifische Varianten dürfen es nur bewusst
verfeinern.

Das Feedback verändert weder Farbe noch Form des Buttons, wird nicht auf deaktivierte Buttons
angewendet und verzichtet bei `prefers-reduced-motion` auf Bewegung. Fokusdarstellung und
Tastaturbedienbarkeit bleiben davon unabhängig verpflichtend.

## Design Lab

Jede komplexe Sequenz erhält eine deterministische Route oder Query im `/design-lab`, sodass
Screenshots und visuelle Regression ohne kompletten Trainingsdurchlauf möglich sind.

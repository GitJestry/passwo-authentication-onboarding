# Design Lab

Die BrowserShell-Szenen sind ohne zusätzliche Routing-Bibliothek direkt reproduzierbar:

- `/design-lab/normal`
- `/design-lab/dimmed`
- `/design-lab/passwo-overlay`
- `/design-lab/s00`
- `/design-lab/s02-campus-id`

Die PassWo-Darstellung ist ein CSS-Platzhalter. Sie prüft nur Platzierung, Layer-Reihenfolge,
Fokus und Reduced Motion. Die S00- und S02-CampusID-Routen binden die jeweiligen isolierten
Trainings-Slices ein; eine durchgehende Segmentnavigation ist nicht enthalten.

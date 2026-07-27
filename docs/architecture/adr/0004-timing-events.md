# ADR 0004 — Ereignisbasierte Zeitmessung

- **Status:** Accepted
- **Datum:** 2026-07-23

## Entscheidung

Der Browser misst mit einer monotone Uhr und sendet sequenzierte Start-, Pause-, Resume-, End-,
Visibility- und Abort-Ereignisse. Der Server speichert sie idempotent und berechnet exportierbare
Dauern aus den Ereignissen.

Für das supportive Artefakt werden diagnostische Segmentgrenzen in derselben Sequenzquelle wie
Artefakt- und Visibility-Ereignisse geführt. Die kanonische implementierte Reihenfolge ist
S00 → S01 → S02 → S03. Alle vier verwenden `phase=artifact`, `sectionId=passwords` und ihre jeweilige
`segmentId`: der Start hat keine Dauer, das Ende enthält die aus der monotonen Uhr berechnete
Segmentdauer. Segmentgrenzen sind für Referenzsitzungen nicht zulässig; pro Sitzung darf nur ein
Segment aktiv sein. Ein Segmentstart ist erst nach dem erfolgreichen Ende des vorherigen Segments
zulässig.

## Konsequenzen

- Gesamtartefaktzeit ist zwischen Bedingungen vergleichbar.
- Segmentzeiten sind nur für das supportive Training diagnostisch.
- Wall-clock Zeit dient der Auditierbarkeit, nicht der Dauermessung.
- Ein fehlgeschriebenes Segment-start verhindert den Segmentbeginn. Ein fehlgeschriebenes
  Segment-end verhindert den Übergang aus dem Segment, bis dieselbe sequenzierte Übertragung
  wiederholt wurde. Segment-end beendet die Artifact-Lease nicht. Animationsfehler bleiben davon
  unabhängig und nicht blockierend.
- Die bestehende `timing_events`-Tabelle exportiert Segmentereignisse ohne zusätzliche Felder.

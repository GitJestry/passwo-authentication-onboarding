# ADR 0010 — Natives SecAware-Quiz innerhalb der Artefaktzeit

- **Status:** Accepted
- **Datum:** 2026-07-30
- **Citation label:** `ADR 0010-Reference-Quiz`
- **Ändert:** `ADR 0008-Reference` hinsichtlich Quizentfernung und Abschlussgrenze
- **Ergänzt:** ADR 0004 und ADR 0009

## Kontext

Der eingefrorene SecAware-Snapshot enthält nach den drei Unterrichtslektionen ein natives Quiz.
Die bisherige Studienadaption entfernte dieses Quiz und ließ den letzten Unterrichtsblock den
Referenzpfad unmittelbar abschließen. Damit war ein ursprünglicher Bestandteil des
SecAware-Artefakts nicht Teil der Exposition oder ihrer gemessenen Gesamtzeit.

## Entscheidung

Der deterministisch generierte SecAware-Study-Build behält das native Quiz einschließlich seiner
eingefrorenen Quiz-Labels unverändert im Teilnehmerpfad. Der letzte Unterrichtsblock führt wie im
Originalsnapshot in dieses Quiz. Die Abschlussanforderung beträgt 100 Prozent des retained Pfads
aus den drei Unterrichtslektionen und dem nativen Quiz.

Das validierte `SetReachedEnd`-Signal wird erst nach Abschluss dieses vollständigen Pfads an den
Study-Wrapper weitergegeben. Erst dieses Signal beendet die globale SecAware-Artefaktzeit. Für das
Quiz entstehen keine Segmentzeiten.

Quizantworten, Quizpunkte, SCORM-Interaktionen und interner Lernfortschritt bleiben ausschließlich
flüchtiger Zustand der isolierten SecAware-Laufzeit. Der Study-Wrapper liest oder übermittelt sie
nicht; Server, Forschungsdatenbank und Export erhalten weder Antworten noch Punkte. Sie sind kein
Studienoutcome.

Nach dem Referenzartefakt bleibt der gemeinsame Study-Statechart unverändert:
Post-Fragebogen → externer Understanding Guardrail → Debrief. Damit folgt für SecAware derselbe
methodisch getrennte Guardrail wie für PassWo.

## Konsequenzen

- Die primäre SecAware-Artefaktzeit umfasst Unterricht und natives Quiz.
- Die Referenzartefaktversion und ihre Transformations- und Buildhashes werden als neue Revision
  eingefroren.
- Die Completion-Integration muss den retained Quizpfad berücksichtigen und genau ein
  `artifact.end` vor dem gemeinsamen Post-/Guardrail-Flow absichern.
- Es entstehen keine neuen Forschungsfelder, API-Verträge oder persistierten Teilnehmerdaten.

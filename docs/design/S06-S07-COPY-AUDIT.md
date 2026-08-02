# S06--S07 Copy Audit

## Copy-Delta vollständiger Prüfweg und Längenorientierung 3. August 2026

Quelle sind das Trainingsskript, `ADR 0014-Bounded-Password-Guessing` und die technische
S05-Spezifikation. Die Änderung synchronisiert die sichtbare Konsequenz- und Diagnosesprache mit
der tatsächlich implementierten begrenzten Entscheidung. Sie führt keine neue Sicherheitsregel
ein.

`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.2.0` auf `2.3.0` und
`S07_EVALUATION_CONTENT_VERSION` von `1.0.0` auf `1.1.0` erhöht.

| Segment / Textbereich | Bisherige Aussage | Freigegebene Aussage | Grund |
|---|---|---|---|
| `S06.dispositionLabels` | schneller beziehungsweise schnellerer Weg | entsprechend kurzer vollständiger Prüfweg in dieser begrenzten Simulation | Die Entscheidung beruht auf dem vollständigen zxcvbn-Kandidatenweg und nicht auf einem einzelnen Befund. |
| `S06` Found-Narrationen | Passwort über einen schnellen Weg gefunden | begrenzte Analyse erkennt einen entsprechend kurzen vollständigen Prüfweg | Vermeidet ein allgemeines Crack- oder Sicherheitsurteil. |
| `S06.local-check.*-blocked` | kein schneller Weg erkannt | kein entsprechend kurzer vollständiger Prüfweg erkannt | Die Gegenkategorie ist eine begrenzte Nicht-Erkennung, kein Stärkeurteil. |
| `S07.dispositionLabels` | konkrete lokale Regel / kein schnellerer Weg | kurzer vollständiger Prüfweg / kein kurzer vollständiger Prüfweg | Synchronisiert die Diagnose mit der eingefrorenen Simulationsentscheidung. |
| `S07.recommendationLabels.rebuild-below-length-orientation` | nicht vorhanden | selbst erstelltes Passwort mit mindestens 15 Zeichen neu aufbauen | Länge bleibt eine separate NIST-orientierte Handlungsempfehlung und kein Quick-Path-Ersatz. |
| `S07.problemStatements` | lokaler schneller Weg | kurzer vollständiger Rateweg und getrennte 15-Zeichen-Orientierung | Verhindert die Vermischung von Guessability-Befund und Längenorientierung. |

Unzulässig bleiben Teilnehmeraussagen wie `sicher`, `bestanden`, `garantiert stark`, eine exakte
Crack-Zeit oder die Behauptung, dass kein anderer Angreifer einen weiteren Weg finden könne.

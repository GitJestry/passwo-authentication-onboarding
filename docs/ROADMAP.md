# Roadmap und aktueller Umsetzungsstand

Die Meilensteine bleiben als Planungsrahmen erhalten, laufen aber nicht mehr strikt linear:
Instrument- und Referenzarbeit aus M6 wurde bereits parallel zum noch unvollständigen
Trainingsmodul umgesetzt.

| Meilenstein | Status | Stand / nächster Abschluss |
|---|---|---|
| M0 — Foundation und Scope Freeze | abgeschlossen | Repository, ADRs, Datengrenze, Studienfluss und Segmentindex stehen. |
| M1 — Technischer Walking Skeleton | abgeschlossen | Session, verdeckte Zuweisung, SQLite, Timing, Reload-/Lease-Verhalten und Export sind implementiert. |
| M2 — Visual Platform | abgeschlossen | BrowserShell, DesktopSurface, PassWoGuide, Animation-Handshake, Reduced Motion und Design Lab stehen. |
| M3 — Knotennetzwerk | abgeschlossen | Frameworkfreie Szenenmodelle, React-Flow-Adapter, S02 und S06-Konsequenz-Fixtures stehen. |
| M4 — Passwortmodul S03–S11 | teilweise | S03 bis S06 einschließlich lokaler Einzelanalyse und dynamischer Konsequenzsimulation sind integriert; S07–S11 fehlen. |
| M5 — Passwortmanager und MFA S12–S17 | offen | Simulationen, Recovery-Grenzen, MFA und integrierte Abschlusskarte fehlen. |
| M6 — Instrumente und Referenzartefakt | teilweise | Draft-Instrumente, Guardrail-Formen, eingebettetes Referenzartefakt, PDF-Viewer, Recontact-Registry und Schedule-Export stehen. Cognitive Pretest, Content Audit, öffentliches Follow-up, Import und finaler Debrief-Versand fehlen. |
| M7 — Pretest und Hardening | offen | Technischer Smoke-Test am Studiengerät und 3–5 Pilotdurchläufe pro Bedingung stehen aus. |
| M8 — Study Freeze | offen | Versionen, Commit, Aufbewahrungsfrist, Datenschutzkontakt, Backup und Exportprozedur müssen eingefroren werden. |

## Nächste Abnahmetore

1. S07 bis S11 mit Diagnose, Passwortüberarbeitung und Modulabschluss implementieren und fachlich
   prüfen.
2. S12 bis S17 integrieren und den vollständigen supportive Artefaktabschluss herstellen.
3. Instrumente und Guardrail Content Audit im Cognitive Pretest prüfen.
4. Follow-up-Formular, Token-Import und abschließenden Debrief-Versand entscheiden und umsetzen.
5. Pilotdurchläufe durchführen und anschließend den Study Freeze dokumentieren.

## Unveränderte Gates

- Keine Produktions-„Passwortstärke“- oder Sicherheitsgarantie.
- Keine Trainingsinputs oder Diagnosen in Forschungsdaten.
- Beide Bedingungen verwenden dieselbe neutrale Einführung, Timingregel und Nachbefragung.
- Nach dem Study Freeze nur dokumentierte kritische Bugfixes mit Versionssprung.

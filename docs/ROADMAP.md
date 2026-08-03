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
| M4 — Passwortmodul S03–S11 | teilweise | S03 bis S07 einschließlich lokaler Einzelanalyse, dynamischer Konsequenzsimulation und Auswertung sind integriert; S08–S11 fehlen. |
| M5 — Passwortmanager und MFA S12–S17 | offen | Simulationen, Recovery-Grenzen, MFA und integrierte Abschlusskarte fehlen. |
| M6 — Instrumente und Referenzartefakt | teilweise | Instrument 2.1, Guardrail-Formen, eingebettetes Referenzartefakt, PDF-Viewer, atomare Recontact-Registry, Schedule-Export und manueller Einzelversandprozess stehen. Cognitive Pretest, Ethik-/Datenschutzfreigabe, öffentliches Follow-up, Import und operativer finaler Debrief-Versand fehlen. |
| M7 — Pretest und Hardening | offen | Technischer Smoke-Test am Studiengerät und 3–5 Pilotdurchläufe pro Bedingung stehen aus. |
| M8 — Study Freeze | offen | Datenschutzkontakt, technische Schutzmaßnahmen und duale Exportprozedur sind dokumentiert. Versionen und Commit müssen nach Festlegung der konkreten Aufbewahrungs-/Löschfristen eingefroren werden. |

## Nächste Abnahmetore

1. S08 bis S11 mit Passwortüberarbeitung und Modulabschluss implementieren und fachlich
   prüfen.
2. S12 bis S17 integrieren und den vollständigen supportive Artefaktabschluss herstellen.
3. Instrumente, neutrale Zwei-Teil-Kommunikation und Guardrail Content Audit gemäß den Kriterien in `MEASUREMENT-INSTRUMENT.md` im Cognitive Pretest prüfen.
4. Follow-up-Formular und Token-Import umsetzen sowie den manuellen abschließenden
   Debrief-Versand erproben.
5. Pilotdurchläufe durchführen und anschließend den Study Freeze dokumentieren.

## Unveränderte Gates

- Keine Produktions-„Passwortstärke“- oder Sicherheitsgarantie.
- Keine Trainingsinputs oder lokalen Auswertungen in Forschungsdaten.
- Beide Bedingungen verwenden dieselbe neutrale Einführung, Timingregel und denselben zweiten Studienteil.
- Nach dem Study Freeze nur dokumentierte kritische Bugfixes mit Versionssprung.

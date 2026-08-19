# Roadmap und aktueller Umsetzungsstand

Die Roadmap unterscheidet zwischen bereits getroffenen Fachentscheidungen und noch ausstehender
Implementierung. Frühere Platzhalter für Ethikfreigabe, externe Follow-up-Plattform, Antwortimport
oder verzögerten Debrief-Versand sind keine aktuellen Projektgates. Das verbindliche Zielmodell für
Webbetrieb, Wiederaufnahme und Datenabschluss steht in `ADR 0016-Web-Resume-Lifecycle`.

| Meilenstein | Status | Stand / nächster Abschluss |
|---|---|---|
| M0 — Foundation und Scope Freeze | abgeschlossen | Repository, ADRs, Datengrenze, Studienfluss und Segmentindex stehen. |
| M1 — Lokaler technischer Walking Skeleton | abgeschlossen | Session, verdeckte Zuweisung, SQLite, Timing, Legacy-Lease und Export sind für die lokale Runtime implementiert. |
| M2 — Visual Platform | abgeschlossen | BrowserShell, DesktopSurface, PassWoGuide, Animation-Handshake, Reduced Motion und Design Lab stehen. |
| M3 — Knotennetzwerk | abgeschlossen | Frameworkfreie Szenenmodelle, React-Flow-Adapter, S02 und S06-Konsequenz-Fixtures stehen. |
| M4 — Passwortmodul S03–S11 | teilweise | S03 bis S07 sind integriert; S08 bis S11 sind noch fertigzustellen und fachlich zu prüfen. |
| M5 — Passwortmanager und MFA S12–S17 | offen | Simulationen, Recovery-Grenzen, MFA und integrierter Abschluss fehlen. |
| M6 — Instrumente und Referenzartefakt | teilweise | Pilotinstrument, Guardrail-Formen, SecAware-r16-Freeze, Zieltext der Teilnahmeinformation und Follow-up-Instrument stehen. Cognitive Pretest, zweite Inhaltsprüfung und Befundauflösung stehen aus. |
| M7 — Webbetrieb und Follow-up | teilweise | Production-Start, sichere Wiederaufnahme, persistente Checkpoints, unterbrechungsfähiges Timing, Completed-only-Export und minimales HTTPS-Deployment stehen. Ziel-VM-Dry-Run, same-origin Follow-up-Route und der kontrollierte manuelle Versand-/Löschablauf stehen noch aus. |
| M8 — Hauptstudien-Versions-Freeze | offen | Nach vollständigem Training, Pilot und technischem Dry Run werden Commit, Inhalte, Instrumente, Referenzartefakt und Analyseplan eingefroren. |
| M9 — Datensatz-Freeze und Anonymisierung | später operativ | Nach Datenerhebung und Follow-up werden nur abgeschlossene Runs übernommen, Zuordnungsinformationen entfernt, Arbeitskopien gelöscht und der anonyme Archivdatensatz gemäß `DATA-CONTRACT.md` erzeugt. |

## Nächste Abnahmetore

1. S08 bis S17 fertigstellen und den vollständigen supportive Artefaktpfad fachlich prüfen.
2. Das dokumentierte Webdeployment und die Wiederaufnahme auf der Ziel-VM vollständig erproben;
   flüchtige Trainingswerte dürfen dabei nicht persistiert werden.
3. Die tokenisierte Follow-up-Route innerhalb derselben Webanwendung implementieren und den
   manuellen Versand sowie die dokumentierte Kontaktlöschung einmal vollständig erproben.
4. Cognitive Pretest, Pilotdurchläufe in beiden Bedingungen und die zweite qualifizierte
   Inhaltsprüfung durchführen; konkrete Befunde dokumentiert auflösen.
5. Completed-only-Auswahl, Timing mit Unterbrechungen, Analyseexport und die in
   `DATA-CONTRACT.md` festgelegte Anonymisierungsprozedur in einem Dry Run prüfen.
6. Danach den Hauptstudien-Versions-Freeze mit Commit, Versionsmanifest und Analyseplan
   dokumentieren.

## Noch umzusetzen, nicht erneut zu entscheiden

- Die Desktop-Runtime behält Lease/`incomplete-reload` als Legacy-Verhalten. Der produktive Webpfad
  verwendet stattdessen Resume-Cookie, inhaltsfreien Checkpoint und aktive Timingintervalle.
- Der Analyseexport selektiert technisch ausschließlich `completed` Runs. Vor dem Versions-Freeze
  muss diese Grenze noch einmal mit einem bewusst unvollständigen Dry-Run-Fall geprüft werden.
- Same-origin Follow-up-Abgabe, Tokenverbrauch und Kontaktlöschung sind noch zu implementieren
  beziehungsweise als kontrollierter manueller Ablauf zu erproben.
- Die Anonymisierungsprozedur ist fachlich festgelegt. Sie kann als kleiner kontrollierter
  Export-/Löschbefehl oder als dokumentierter manueller Ablauf umgesetzt werden; eine große
  Verwaltungsoberfläche ist nicht erforderlich.

## Keine Projektgates

Folgende Punkte sind entschieden und dürfen nicht erneut als offene Grundsatzentscheidung oder
pauschaler Launch-Blocker geführt werden:

- Für dieses Bachelorprojekt ist keine separate Ethikkommissionsfreigabe als Projektgate
  vorgesehen. Das Repository behauptet keine solche Freigabe.
- Es wird keine externe Follow-up-Plattform und kein manueller Antwortimport benötigt.
- Es wird keine verzögerte Debrief-Mail versendet; das Debriefing erfolgt am Ende der Hauptsitzung.
- Der kontrollierte manuelle E-Mail-Versand und die dokumentierte manuelle Kontaktlöschung sind das
  akzeptierte Betriebsmodell; eine automatische Mail- oder Löschinfrastruktur ist nicht erforderlich.
- Ein geschlossenes Browserfenster ist eine Unterbrechung, kein regulärer Abschluss. Es ist kein
  zusätzlicher Teilnehmerbutton zum vorzeitigen Beenden erforderlich.

## Unveränderte Forschungsgrenzen

- Keine Produktions-„Passwortstärke“- oder Sicherheitsgarantie.
- Keine Trainingsinputs oder lokalen Passwortbefunde in Forschungsdaten.
- Beide Bedingungen verwenden dieselbe neutrale Einführung, Timingregel und denselben zweiten
  Studienteil.
- Ausgewertet werden nur regulär abgeschlossene Runs.
- Nach dem Hauptstudien-Versions-Freeze erfolgen nur dokumentierte kritische Bugfixes mit
  Versionssprung.

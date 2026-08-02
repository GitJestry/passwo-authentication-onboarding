# Research Guardrails

## Methodische Position

Verglichen werden zwei vollständige Onboarding-Artefakte. Gemessen werden unmittelbare
Wahrnehmung, Bearbeitungszeit, kriteriumsbezogenes Sofortverständnis und bei freiwilliger
Teilnahme zehn Tage später selbstberichtete, eng begrenzte Kontoschutzhandlungen. Unterschiede
dürfen nicht einzelnen Translation Foci, Animationen, Quizfragen oder UI-Elementen kausal
zugeschrieben werden.

## Nicht zulässige Claims

Die Studie belegt nicht:

- objektiv beobachtetes reales Authentifizierungsverhalten;
- nachhaltige Passwortmanager-Adoption oder fortgesetzte MFA-Nutzung;
- reduzierte reale Passwortwiederverwendung;
- langfristige Verhaltensänderung, Gewohnheitsbildung oder weniger Sicherheitsvorfälle;
- organisatorische Kultur-, Führungs- oder Workflowveränderung;
- Therapie-, Diagnose- oder Behandlungswirkung;
- kausale Effekte einzelner Translation Foci;
- allgemeine Authentifizierungsexpertise durch den Guardrail.

Das Follow-up darf nur als `ten-day delayed self-reported account-protection actions` bezeichnet
werden.

## Translation Foci

- **TF1:** positiv, nicht beschämend, nicht coerciv;
- **TF2:** persönliche Relevanz ohne sensible Offenlegung;
- **TF3:** kontextualisierte Reflexion und sichere simulierte Wahl;
- **TF4:** Sicherheitsfolgen sichtbar und greifbar machen;
- **TF5:** positive Affekte und zurückhaltende spielerische Herausforderung;
- **TF6:** umsetzbare Anleitung und kognitive Manageability.

Die Foci sind Designrationale, keine unabhängig getesteten Faktoren.

## Guardrail-Fairness

- Primäre Items prüfen nur Claims, die in beiden finalen Artefakten auf gleicher
  Abstraktionsebene vorkommen.
- Detaillierte Passwortstärke, Mindestlänge, Sechs-Wort-Methode und PassWo-Begriffe bleiben
  außerhalb des primären Guardrails.
- Jedes Item benötigt PassWo-, SecAware- und technische Claim-Evidence im Content Audit.
- PassWo-interne Lernfragen dürfen im PassWo-Pfad bestehen. Das native SecAware-Abschlussquiz ist
  bewusst aus dem gemessenen Referenzpfad entfernt; beide Bedingungen bearbeiten denselben
  externen Guardrail. Native Lernfragen und -scores sind keine Studienoutcomes.
- Single-Best-Answer verwendet drei inhaltliche Optionen und `unsure`; kein Multiple Response.
- `F1` bis `F3` werden serverseitig und unabhängig von der Bedingung balanciert.
- Der Client erhält keine Scoring-Klassifikationen; es gibt kein Pass/Fail.

## Follow-up

- Die Follow-up-Einwilligung ist von der Hauptstudie getrennt und optional.
- Eine Ablehnung blockiert weder Session, Pre-Fragebogen noch Hauptstudienabschluss.
- E-Mail und Roh-Token liegen ausschließlich in der getrennten Registry.
- Nichtantwort ist fehlend und wird nicht als `no action` codiert.
- Passwortmanager- und MFA-Handlungen bleiben getrennt; es gibt keinen kombinierten Behavior Score.
- Das Follow-up ist Messung und kein erneutes Training.

## Begrenzte lokale Passwort-Rateweganalyse

- S05 verwendet die in `ADR 0014-Bounded-Password-Guessing` definierte lokale, deterministische
  und versionierte zxcvbn-ts-Konfiguration.
- Die Analyse ist adaptive Trainingssteuerung und kein Studienmessinstrument, kein
  Produktions-Password-Strength-Meter und keine allgemeine Sicherheitsbewertung.
- `quick-path-recognized` bedeutet nur, dass der günstigste vollständige Rateweg der begrenzten
  Konfiguration höchstens 100000 geschätzte Kandidaten umfasst. Die Schwelle ist kein
  NIST-Grenzwert und wird nicht in eine Crack-Zeit übersetzt.
- `no-quick-path-recognized` bedeutet weder stark noch sicher. Die 15-Zeichen-Orientierung für
  selbst erstellte Passwörter wird getrennt ausgewiesen.
- Persönliche Bedeutung, Thema und Satzstruktur werden nicht algorithmisch behauptet. Eine
  lokale Selbsteinordnung mit einer Ausweichoption für „Nichts davon oder unsicher“ verändert
  die Disposition nicht und wird nicht persistiert.
- zxcvbn-Score, Crack-Time-Ausgaben, externe Leak-Abfragen, KI-Modelle und Forschungsdatenexporte
  der Trainingsanalyse sind unzulässig.

## Technische Datenschutzgrenzen

- Nur neue, fiktive Passwörter; keine realen Varianten.
- Keine dauerhafte oder serverseitige Speicherung von Trainingsinputs oder Diagnosen.
- Keine Echtkonten, Tokens, Recovery-Codes oder institutionellen Einstellungen.
- Passwortanalyse ist eine Lehrsimulation, keine Produktionsbewertung.
- MFA bleibt eine zusätzliche Barriere und macht Wiederverwendung nicht sicher.
- Passwortmanager unterstützen einzigartige Passwörter, ersetzen deren Einzigartigkeit aber nicht.

## Freeze-Regel

Vor der Hauptstudie werden Content, Referenzpfad, Instrumenttexte, Guardrail-Formen und Rubrik,
Follow-up-Stichtagslogik, Consent, Debrief, Timing, Persistenz und Export gemeinsam eingefroren.
Nach Studienbeginn erfolgen keine Itemänderungen anhand sichtbarer Bedingungsunterschiede.

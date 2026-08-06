# Research Guardrails

## Methodische Position

Verglichen werden zwei vollständige Onboarding-Artefakte. Gemessen werden unmittelbare
Wahrnehmung, Bearbeitungszeit und kriteriumsbezogenes Sofortverständnis. Explorativ folgen vier
post-guardrail task-specific Self-Efficacy-Einzelratings. Eine optionale Nachbefragung enthält als
ancillary exploratory extension drei getrennte selbstberichtete Schutzhandlungen innerhalb von zehn Tagen. Unterschiede dürfen
nicht einzelnen Translation Foci, Animationen, Quizfragen oder UI-Elementen kausal zugeschrieben
werden.

## Nicht zulässige Claims

Die Studie belegt nicht:

- objektiv beobachtetes reales Authentifizierungsverhalten;
- nachhaltige Passwortmanager-Adoption oder fortgesetzte MFA-Nutzung;
- reduzierte reale Passwortwiederverwendung;
- langfristige Verhaltensänderung, Gewohnheitsbildung oder weniger Sicherheitsvorfälle;
- organisatorische Kultur-, Führungs- oder Workflowveränderung;
- Therapie-, Diagnose- oder Behandlungswirkung;
- kausale Effekte einzelner Designfoci;
- allgemeine Authentifizierungsexpertise, Äquivalenz oder Mastery durch den Guardrail.

Das Follow-up darf nur als `ten-day delayed self-reported account-protection actions` bezeichnet
werden.

## Measurement Boundary

- Custom Design Items sind Einzelindikatoren, keine Supportiveness- oder Designfokus-Skala.
- UEQ-S Pragmatic und Hedonic Quality sowie UEQ+ Inhaltsseriosität bleiben getrennte Skalen.
- Self-Efficacy wird über vier getrennte Aufgaben ausgewertet; kein Mittel- oder Summenwert.
- Wahrgenommenes Verständnis bleibt vom kriteriumsbezogenen Guardrail getrennt.
- Risikodarstellung ist ein subjektives Mittelpunkturteil, keine objektive Kalibrierung.
- Es gibt keinen Wissens-Pretest; daher werden kein individueller Wissenszuwachs und kein neu
  erworbener Wissensanteil behauptet.

## Guardrail-Fairness

- Geprüft werden ausschließlich Claims, die in beiden finalen Artefakten auf derselben
  Abstraktionsebene explizit vorkommen.
- Detaillierte Passwortstärke, Mindestlänge, Sechs-Wort-Methode und PassWo-Begriffe bleiben
  außerhalb des Guardrails.
- Die drei Anwendungsszenarien stehen vor den drei Recognition-Items.
- Single-Best-Answer verwendet drei substantive Optionen und `Weiß ich nicht`; kein Multiple
  Response.
- `F1` bis `F6` werden serverseitig, unabhängig von der Bedingung und innerhalb jeder Bedingung in
  kleinen permutierten Sechserblöcken zugewiesen.
- Die sechs Formen balancieren alle sechs Szenarioreihenfolgen. Für jedes Item kommen alle sechs
  Permutationen der drei substantiven Optionen genau einmal vor. Dadurch erscheint jede Option
  genau zweimal auf jeder Position; `Weiß ich nicht` bleibt zuletzt.
- Die Permutationen sind für jedes Item separat festgelegt. Innerhalb einer einzelnen Form wird
  keine zusätzliche Verteilung der richtigen Antwortpositionen erzwungen.
- Der Client erhält keine Scoring-Klassifikationen und zeigt vor Abschluss aller Outcomes kein
  Correctness Feedback.
- Es gibt kein Pass/Fail, keinen Guardrail-Gesamtscore und keinen Unsafe-Summenwert.

## Optionale Nachbefragung

- Die E-Mail-Adresse ist freiwillig und keine Voraussetzung für die Hauptstudie.
- E-Mail und Raw Token liegen ausschließlich in der getrennten Recontact Registry.
- Die Follow-up-Fragen sind nicht Bestandteil der Training Runtime. Kanonische Quellen sind
  `FOLLOW-UP-INSTRUMENT.md` und `research/derived/follow-up-v6.yaml`.
- Einladung und Erinnerung enthalten keine Authentifizierungsempfehlung; das Follow-up ist kein
  erneutes Training.
- Nichtantwort ist fehlend und wird nicht als keine Handlung codiert.
- Passwort-, Passwortmanager- und MFA-Handlungen bleiben getrennt; es gibt keinen kombinierten
  Behavior Score.
- Das Follow-up folgt Artefakt, gemeinsamem Guardrail, weiteren Messungen und korrektivem
  Debriefing; absolute Handlungsraten werden nicht dem Artefakt allein zugeschrieben.
- Es handelt sich weder um objektive Kontobeobachtung noch um eine Vorher-Nachher-Messung
  desselben Verhaltens; dauerhafte Adoption und Verhaltensänderung werden nicht behauptet.

## Technische Datenschutzgrenzen

- Nur neue, fiktive Passwörter; keine realen Varianten.
- Keine dauerhafte oder serverseitige Speicherung von Trainingsinputs oder Diagnosen.
- Keine Echtkonten, Tokens, Recovery-Codes oder institutionellen Einstellungen.
- Passwortanalyse ist eine Lehrsimulation, keine Produktionsbewertung.
- MFA bleibt eine zusätzliche Barriere und macht Wiederverwendung nicht sicher.
- Passwortmanager unterstützen einzigartige Passwörter, ersetzen deren Einzigartigkeit aber
  nicht.

## Freeze-Regel

Vor der Hauptstudie werden Content, Referenzpfad, Instrumenttexte, Guardrail-Formen und Rubrik,
separates Follow-up, Consent, Debrief, Timing, Persistenz und Export gemeinsam versioniert. Nach
Studienbeginn erfolgen keine Itemänderungen anhand sichtbarer Bedingungsunterschiede.

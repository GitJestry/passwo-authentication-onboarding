# Measurement Instrument v1.5

Status: methodischer Entwurf für Cognitive Pretest und anschließenden Study Freeze.  
Geltungsbereich: randomisierter Between-Subjects-Vergleich des Supportive Authentication
Onboarding mit dem eingefrorenen SecAware.NRW-Referenzartefakt.

Die vollständigen Teilnehmertexte, stabilen IDs, Antwortoptionen, Guardrail-Formen und
Follow-up-Bedingungen stehen in `research/derived/instruments-v1.yaml`. Die gemeinsame
Teilnahmeinformation wird fachlich in `docs/research/PARTICIPANT-INFORMATION.md` geführt und in
dieselbe Quelle projiziert. `research/derived/instruments-v1.runtime.json` ist die bereinigte
Runtime-Projektion ohne Scoring- und Analysekategorien.

## 1. Evaluationsziel

Verglichen werden zwei vollständige Onboarding-Artefakte. Die Studie untersucht:

1. unmittelbare Wahrnehmung und praktische Nützlichkeit;
2. design-diagnostische Wahrnehmungen entlang der Translation Foci, ohne diese als validierte
   Skalen oder isolierte Wirkfaktoren zu behandeln;
3. objektive und subjektive Bearbeitungszeit;
4. unmittelbare Mechanismenerkennung und szenariobasierte Entscheidungsqualität;
5. zehn Tage später selbstberichtete, eng begrenzte Kontoschutzhandlungen.

Es wird kein Supportiveness-Gesamtscore, kein allgemeiner UX-KPI, kein Guardrail-Gesamtscore und
kein kombinierter Behavior Score gebildet. Favorable Wahrnehmung wird nur zusammen mit Dauer und
Understanding Guardrail interpretiert.

## 2. Verbindlicher Ablauf

```text
Eligibility + gemeinsame Teilnahmeinformation und Einwilligung
→ optionale Follow-up-Entscheidung
→ Sessionerstellung und verdeckte Condition-Zuweisung
→ bei Einwilligung getrennte Recontact-Registrierung
→ Pre-Fragebogen
→ zugewiesenes Artefakt
→ Post-Fragebogen
→ Guardrail Recognition
→ Guardrail Szenarien
→ optionale offene Rückmeldung
→ unmittelbares Debrief ohne Follow-up oder neutrale Session Closure mit Follow-up
→ Completion
→ Nachbefragung zehn Tage später
```

Eligibility wird lokal geprüft und nicht als Forschungsantwort gespeichert. Eine konkrete
Handlungsabsicht wird unmittelbar nach dem Artefakt nicht abgefragt, damit die spätere Handlung
nicht bereits durch eine Commitment-Frage angestoßen und anschließend fälschlich als
Trainingsergebnis interpretiert wird.

## 3. Pre-Questionnaire

Der Pre-Fragebogen beschreibt die Stichprobe und erfasst Vorerfahrung, die Ceiling-Effekte oder
Zuweisungsungleichgewichte erklären kann:

- Hochschulrolle, breiter Fachbereich, Altersgruppe und optionales Geschlecht;
- SecAware-Vorerfahrung und frühere Authentifizierungstrainings;
- konkrete Nutzung integrierter und/oder separat installierter Passwortmanagerfunktionen;
- Breite bisheriger MFA-Nutzung;
- selbst eingeschätzte Vertrautheit mit unterschiedlichen Passwörtern, Passwortmanagern und MFA;
- drei task-specific Self-Efficacy-Items als konkrete Fähigkeiten auf einer unipolaren
  Konfidenzskala von 0 bis 10.

Eine frühere vollständige Bearbeitung genau des verwendeten SecAware-Moduls ist ein vorab
festgelegter Ausschlussgrund für die primäre Vergleichsstichprobe. Es gibt keinen Wissens-Pretest,
weil dieser die gemeinsamen Mechanismen und die selbst erzeugten Trainingsentscheidungen vorprägen
würde. Reale Konten, Passwörter, Vorfälle, Tokens und Recovery-Daten werden nicht erhoben.

## 4. Immediate Post-Questionnaire

### 4.1 Reihenfolge

1. offizielle deutsche UEQ-S-Items;
2. subjektive Zeitwahrnehmung;
3. design-diagnostische Wahrnehmungsitems;
4. Glaubwürdigkeit und wahrgenommenes Verständnis;
5. dieselben drei Self-Efficacy-Items wie im Pre;
6. fünf explorative Security-Emotionen.

Die objektive Dauer bleibt verborgen, bis die gesamte Zeitsektion verbindlich abgegeben wurde.
Die empfundene Dauer wird daher nicht durch eine vorher angezeigte Messzeit verankert.

### 4.2 Standardisierte und eigene Items

UEQ-S Pragmatic Quality und Hedonic Quality werden getrennt nach dem offiziellen Scoring
berichtet. Die eigenen siebenstufigen Items prüfen praktische Nützlichkeit, unterstützende und
nicht-vorwurfsvolle Vermittlung, Alltagsrelevanz, aktive Anwendung, erklärendes Feedback,
Anschaulichkeit von Konsequenzen, anhaltendes Interesse, kognitive Bewältigbarkeit und konkrete
Handlungsorientierung. Sie werden einzeln ausgewertet und nicht nachträglich zu einer neuen Skala
zusammengezogen.

Die Antwortformate sind fachlich getrennt:

- UEQ-S verwendet die acht offiziellen deutschen Begriffspaare in der festgelegten Reihenfolge,
  je Item sieben unbeschriftete Positionen zwischen negativem und positivem Begriff sowie intern
  die Transformation von `1`--`7` auf `-3`--`+3`.
- Task-specific Self-Efficacy verwendet in Pre und Post dieselbe Instruktion, dieselben drei
  Fähigkeitsformulierungen und elf diskrete Werte von `0` bis `10` mit den Ankern
  „überhaupt nicht sicher“, „mäßig sicher“ und „vollständig sicher“.
- Eigene Zustimmungsitems verwenden sieben Punkte mit vollständig benannten Antwortkategorien;
  Vertrautheit und Emotionsintensität verwenden jeweils eigene vollständig benannte
  Fünf-Punkt-Kategorien.
- Gefühlte Dauer ist eine numerische Minuteneingabe. Angemessenheit der Dauer ist bipolar von
  „viel zu kurz“ über „genau richtig“ bis „viel zu lang“; nur das Zeit-Nutzen-Verhältnis ist ein
  Zustimmungsitem.

Die drei Self-Efficacy-Themen werden als getrennte Pre-/Post-Paare ausgewertet. Ein gemeinsamer
Self-Efficacy-Score wird nicht gebildet.

Glaubwürdigkeit und wahrgenommenes Verständnis bleiben subjektive Einschätzungen. Sie werden vom
kriteriumsbezogenen Guardrail getrennt interpretiert. Neugier, Ermutigung, Überforderung,
Frustration und Verunsicherung bilden ein exploratives Itemprofil; sie sind weder PANAS noch eine
neu behauptete Affektskala.

## 5. Immediate Understanding Guardrail

Der Guardrail ist ein kriteriumsbezogener Safety Check und kein allgemeiner Wissenstest. Er prüft
nur den gemeinsamen primären Mechanismenkern beider Artefakte:

- Wiederverwendung ermöglicht kontoübergreifendes Ausprobieren eines bekannt gewordenen
  Passworts;
- Passwortmanager unterstützen unterschiedliche kontospezifische Passwörter;
- MFA bildet eine zusätzliche Barriere und macht Wiederverwendung nicht sicher.

Detaillierte Passwortstärke, konkrete Mindestlängen, die Sechs-Wort-Methode, PassWo-Metaphern,
produktspezifische Einrichtung und Recovery-Details gehören nicht in den primären Vergleich,
solange keine gleichwertige Abdeckung in beiden finalen Artefakten nachgewiesen ist.

Der Guardrail enthält drei Recognition-Items und drei Transfer-Szenarien. Jedes Item hat eine
beste Antwort, zwei plausible inhaltliche Distraktoren und `Weiß ich nicht`. Recognition wird
zuerst atomar abgegeben und gesperrt; danach folgen die Szenarien. Vor Abschluss beider Blöcke gibt
es keine Richtig/Falsch-Rückmeldung.

Die inhaltlichen Optionen werden nicht frei bei jedem Rendern randomisiert. Der Server vergibt
stattdessen unabhängig von der Artefaktbedingung eine der drei balancierten Formen `F1`--`F3`.
`Weiß ich nicht` bleibt immer an letzter Stelle. Form-ID und tatsächlich dargestellte Option-IDs
werden gespeichert. Scoring- und Klassifikationsmetadaten gelangen nicht in den Client.

Ausgewertet werden getrennt: korrekte Mechanismenerkennung, angemessene Szenarioantworten,
unvollständige Antworten, unsichere Fehlvorstellungen und `Weiß ich nicht`. Es gibt kein Pass/Fail
und keinen gemeinsamen Guardrail-Score.

## 6. Open Feedback and Corrective Debrief

Nach dem Guardrail folgen zwei optionale Freitextfelder. Leere Felder werden explizit als `null`
gespeichert; die Submission selbst ist verpflichtend. Teilnehmende ohne Follow-up-Einwilligung
erhalten anschließend die vollständige Aufklärung. Bei Follow-up-Einwilligung wird sie bis nach
der Antwort beziehungsweise bis zur Schließung des Follow-up-Zeitfensters zurückgestellt. Es wird
kein persönlicher Score gezeigt. Die native PassWo-Abschlussfrage und das native SecAware-Quiz
bleiben Bestandteile ihrer jeweiligen Artefakte, dürfen aber nicht wortgleich oder strukturell
nahezu identisch zum externen Guardrail sein.

## 7. Ten-Day Delayed Follow-Up

### 7.1 Recontact-Protokoll

Die Nachbefragung besitzt eine von der Hauptstudie getrennte optionale Kontaktzustimmung. Eine
Ablehnung oder der Verzicht nach einem Registrierungsfehler blockiert weder Pre-Fragebogen noch
Hauptstudienabschluss. Nur bei Einwilligung wird die E-Mail-Adresse vor dem Pre-Fragebogen in der
getrennten Recontact-Registry registriert. Die erste neutrale Einladung wird 240 Stunden nach
Session-Completion geplant, maximal eine Erinnerung 48 Stunden später; der Link schließt 336
Stunden nach der Hauptsitzung.

E-Mail und Roh-Token liegen ausschließlich in einer getrennten Recontact-Registry. Die
Forschungsdatenbank enthält nur den Follow-up-Einwilligungsstatus, die Follow-up-Version und
optional den Token-Hash. Die lokale Runtime versendet keine E-Mails und enthält keine SMTP-,
Gmail- oder Cloud-Credentials.

### 7.2 Minimaler Fragebogen

Der Follow-up zeigt den Zeitpunkt der ersten Einladung als Stichtag. Berichtet werden nur
Handlungen, die nach der Hauptsitzung und bereits vor diesem Stichtag abgeschlossen waren. Die
Befragung fordert nicht dazu auf, Kontoeinstellungen zu öffnen oder für die Befragung zu ändern.

Zwei Mehrfachauswahlfragen erfassen getrennt:

- Passwortmanager: vorhandene Funktion prüfen, ein neues kontospezifisches Passwort erzeugen und
  speichern, bewusstes Abrufen/Autofill oder Zugangs-/Recovery-Weg prüfen;
- MFA: Verfügbarkeit/Status prüfen, MFA aktivieren oder vorhandenen Faktor/Recovery-Weg prüfen.

Integrierte und separat installierte Passwortmanager zählen gleichwertig. `Keine dieser
Handlungen` und `weiß ich nicht/keine Angabe` sind exklusiv. Nur bei `keine` erscheint je
Themenbereich eine kurze Frage nach dem Hauptgrund.

Die beiden primären verzögerten Einzeloutcomes sind:

- Nutzung eines Passwortmanagers zur Einrichtung mindestens eines neuen kontospezifischen
  Passworts;
- Aktivierung von MFA bei mindestens einem tatsächlich verwendeten Konto.

Prüf- und Wartungshandlungen sind sekundär-deskriptiv. Nichtantwort ist fehlende Information und
wird nie als `keine Handlung` codiert.

## 8. Claim- und Analysegrenzen

Das Follow-up darf als `ten-day delayed self-reported account-protection actions` bezeichnet
werden. Wegen der freiwilligen Teilnahme wird es zusätzlich getrennt von der Hauptstichprobe
beschrieben. Es belegt weder objektiv beobachtetes Verhalten noch dauerhafte Adoption, fortgesetzte
Nutzung, reduzierte Passwortwiederverwendung, Habit Formation oder langfristige
Verhaltensänderung. Die Studie bleibt explorativ und berichtet Itemverteilungen, Zeitverteilungen,
UEQ-S-Dimensionen, Self-Efficacy-Veränderungen je Aufgabe, getrennte Guardrail-Kategorien und
die verzögerten Handlungen. Nach Studienbeginn werden Instrumenttexte, Formen oder Rubriken nicht
anhand sichtbarer Bedingungsunterschiede verändert.

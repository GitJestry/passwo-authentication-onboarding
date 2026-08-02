# Measurement Instrument v1.7

Status: methodischer Entwurf für Cognitive Pretest und anschließenden Study Freeze.  
Geltungsbereich: randomisierter Between-Subjects-Vergleich des Supportive Authentication
Onboarding mit dem eingefrorenen SecAware.NRW-Referenzartefakt.

Die kanonischen Teilnehmertexte, stabilen IDs, Antwortoptionen, Guardrail-Formen und
Follow-up-Bedingungen stehen in `research/derived/instruments-v1.yaml`.
`research/derived/instruments-v1.runtime.json` ist die bereinigte Runtime-Projektion ohne
Scoring- und Analysekategorien.

## 1. Evaluationsziel und Ergebnisfamilien

Verglichen werden zwei vollständige Onboarding-Artefakte. Die Translation Foci dienen als
Designrationale und als Grundlage einzelner design-diagnostischer Items. Sie sind weder validierte
latente Konstrukte noch isoliert manipulierte Wirkfaktoren. Es wird kein Supportiveness-Score
gebildet.

Vor Datenerhebung werden folgende Ergebnisfamilien festgelegt:

### Zentrale Artefakt-Evidenz

- tatsächliche Gesamtzeit des Lernangebots;
- praktische Nützlichkeit;
- Möglichkeit zur Anwendung auf konkrete Kontosituationen;
- kognitive Bewältigbarkeit und handlungsorientierte Klarheit;
- Antwortverteilungen der drei Guardrail-Szenarien;
- Auftreten sicherheitsrelevanter Fehlvorstellungen.

### Sekundäre Evidenz

- UEQ-S Pragmatic Quality und Hedonic Quality, getrennt berichtet;
- persönliche Relevanz, nicht-vorwurfsvolle Vermittlung, sichtbare Konsequenzen und erklärendes
  Feedback;
- technische Glaubwürdigkeit und wahrgenommenes Verständnis;
- vier getrennte task-specific Self-Efficacy-Veränderungen.

### Explorative Evidenz

- die drei Guardrail-Recognition-Antworten;
- optionale offene Rückmeldungen;
- zehn Tage später selbstberichtete Passwortmanager- und MFA-Handlungen;
- Follow-up-Teilnahme und -Ausfall.

Es gibt keinen allgemeinen UX-Gesamtscore, keinen Guardrail-Gesamtscore und keinen kombinierten
Behavior Score. Positive Wahrnehmung wird nur zusammen mit Dauer und Understanding Guardrail
interpretiert.

## 2. Verbindlicher Ablauf

```text
Eligibility + gemeinsame Teilnahmeinformation und Einwilligung
→ optionale Follow-up-Entscheidung
→ Sessionerstellung und Löschcode
→ bei Einwilligung getrennte Recontact-Registrierung
→ Pre-Fragebogen
→ zugewiesenes Artefakt
→ Post: Zeit → UEQ-S → Design-Diagnostik → Glaubwürdigkeit/Verständnis → Self-Efficacy
→ Guardrail Recognition
→ Guardrail Szenarien
→ optionale offene Rückmeldung
→ Debrief oder neutrale Session Closure
→ Completion
→ optionale Nachbefragung zehn Tage später
```

Eligibility wird lokal geprüft und nicht als Forschungsantwort gespeichert. Eine konkrete
Handlungsabsicht wird unmittelbar nach dem Artefakt nicht abgefragt, damit die spätere Handlung
nicht bereits durch eine Commitment-Frage angestoßen wird.

## 3. Pre-Questionnaire

Der Pre-Fragebogen enthält elf Antworten in drei Abschnitten.

### Stichprobenbeschreibung

- überwiegende Hochschultätigkeit: Bachelor/Staatsexamen/anderes grundständiges Studium,
  Master/anderes weiterführendes Studium, Promotion auch bei gleichzeitiger Beschäftigung,
  Wissenschaft oder Lehre ohne Promotion, Technik/Verwaltung/Service, anderer Hochschulbereich
  oder keine Angabe;
- breiter organisatorischer beziehungsweise fachlicher Bereich;
- Altersgruppe.

Geschlecht wird nicht erhoben, da keine geschlechtsspezifische Forschungsfrage oder belastbare
Subgruppenanalyse vorgesehen ist.

### Vorerfahrung und Ausgangsnutzung

- differenzierte SecAware-Vorerfahrung;
- frühere Authentifizierungstrainings;
- konkrete Nutzung integrierter und/oder separat installierter Passwortmanager;
- Breite bisheriger MFA-Nutzung.

Eine vollständige frühere Bearbeitung genau des verwendeten SecAware-Moduls ist ein vorab
festgelegter Ausschlussgrund für die primäre Vergleichsstichprobe. Ein angesehenes oder begonnenes,
aber nicht abgeschlossenes Modul wird als Sensitivitätsflag dokumentiert. Allgemeine
Familiarity-Items werden nicht erhoben: Sie überlappen mit Trainingserfahrung, Ausgangsnutzung und
Self-Efficacy, ohne objektives Wissen oder eine eigenständige Zielvariable abzubilden.

### Task-specific Self-Efficacy

Vier getrennte Aufgaben werden auf einer unipolaren Skala von `0` bis `10` mit den Ankern
„überhaupt nicht zuversichtlich“, „mäßig zuversichtlich“ und „vollständig zuversichtlich“ erhoben:

1. Passwörter für mehrere Konten praktikabel verwalten;
2. einen Passwortmanager zum Erzeugen und Speichern eines Kontopassworts verwenden;
3. ein gespeichertes Passwort bei einer Anmeldung verwenden;
4. MFA/2FA bei einem wichtigen Konto aktivieren.

Die vier Items werden im Post wortgleich wiederholt und einzeln ausgewertet. Es wird kein
Self-Efficacy-Gesamtscore gebildet. Es gibt keinen Wissens-Pretest, weil dieser die gemeinsamen
Mechanismen und die selbst erzeugten Trainingsentscheidungen vorprägen würde.

## 4. Immediate Post-Questionnaire

### 4.1 Reihenfolge

1. subjektive Zeitwahrnehmung und Zeitbewertung;
2. offizielle deutsche UEQ-S-Items;
3. acht design-diagnostische Einzelitems;
4. technische Glaubwürdigkeit, Angemessenheit der Risikodarstellung und wahrgenommenes
   Verständnis;
5. die vier Self-Efficacy-Items aus dem Pre.

Die objektive Dauer bleibt verborgen, bis die gesamte Zeitsektion verbindlich abgegeben wurde.
Die Zeitschätzung erfolgt unmittelbar nach dem Lernangebot und wird nicht durch eine vorher
angezeigte Messzeit verankert.

### 4.2 Antwortformate

- UEQ-S verwendet die acht offiziellen deutschen Begriffspaare in ihrer festgelegten Reihenfolge
  mit sieben unbeschrifteten Positionen. Pragmatic Quality und Hedonic Quality werden getrennt
  ausgewertet; ein Gesamtwert wird nicht als allgemeiner UX-KPI verwendet.
- Eigene Zustimmungsitems verwenden sieben vollständig sichtbar beschriftete Kategorien von
  „stimme überhaupt nicht zu“ bis „stimme vollständig zu“.
- Self-Efficacy verwendet elf diskrete Werte von `0` bis `10` mit drei verbalen Ankern.
- Gefühlte Dauer ist eine numerische Minuteneingabe. `TIME_FIT` ist bipolar von „viel zu kurz“
  über `4 = genau richtig` bis „viel zu lang“; höhere Werte sind nicht besser.

### 4.3 Design-diagnostische Items

Einzeln erhoben werden praktische Nützlichkeit, nicht-vorwurfsvolle Vermittlung,
Alltagsrelevanz, Anwendung auf Kontosituationen, erklärendes Feedback, Anschaulichkeit von
Konsequenzen, kognitive Bewältigbarkeit und konkrete nächste Schritte. Das frühere TF5-Interesse-
Item entfällt wegen starker Überlappung mit den offiziellen UEQ-S-Paaren
`langweilig–spannend` und `uninteressant–interessant`.

Der frühere selbst entwickelte Emotionsblock entfällt aus der Hauptstudie. Er erzeugte fünf
zusätzliche explorative Outcomes ohne zentrale Analysefunktion; insbesondere `verunsichert` war
semantisch mehrdeutig. Emotionale Reaktionen können weiterhin im Pilot qualitativ beobachtet
werden.

Glaubwürdigkeit und wahrgenommenes Verständnis bleiben subjektive Einschätzungen und werden vom
kriteriumsbezogenen Guardrail getrennt interpretiert.

## 5. Immediate Understanding Guardrail

Der Guardrail ist ein kriteriumsbezogener Safety Check und kein allgemeiner Wissenstest. Er prüft
nur den gemeinsamen primären Mechanismenkern beider Artefakte:

- Wiederverwendung ermöglicht kontoübergreifendes Ausprobieren eines bekannt gewordenen
  Passworts;
- Passwortmanager unterstützen unterschiedliche kontospezifische Passwörter;
- MFA bildet eine zusätzliche Barriere und macht Wiederverwendung nicht sicher.

Er enthält drei Recognition-Items und drei Transfer-Szenarien. Jedes Item hat eine beste Antwort,
zwei plausible Distraktoren und `Weiß ich nicht`. Recognition wird zuerst atomar abgegeben und
gesperrt; danach folgen die Szenarien. Vor Abschluss beider Blöcke gibt es keine
Richtig/Falsch-Rückmeldung.

Der Server vergibt unabhängig von der Artefaktbedingung eine der drei balancierten Formen
`F1`--`F3`. `Weiß ich nicht` bleibt immer an letzter Stelle. Das native SecAware-Abschlussquiz ist
mit Zustimmung der Betreuung aus dem gemessenen Referenzpfad entfernt, um eine unmittelbare
Feedback-Kontamination des gemeinsamen Guardrails zu vermeiden. PassWo-interne Lernfragen dürfen
den externen Guardrail nicht wortgleich oder strukturell nahezu identisch vorwegnehmen.

Vorrang haben die Antwortverteilungen je Item und die drei Szenarioantworten. Summen wie
`unsafeMisconceptionCount` oder `unsureCount` sind ausschließlich sekundär-deskriptive
Zusammenfassungen heterogener Antworten. Es gibt kein Pass/Fail und keinen psychometrischen
Gesamtscore. Der Guardrail wird erst nach finalem S11--S17-Content und Cognitive Pretest
eingefroren.

## 6. Open Feedback

Nach dem Guardrail folgen zwei optionale Freitextfelder mit maximal 500 Zeichen:

- Was hat am meisten beim Verständnis geholfen?
- Was sollte am Lernangebot verbessert werden?

Leere Felder werden als `null` gespeichert; die Block-Submission selbst ist verpflichtend. Die
zweite Frage vermeidet die frühere Dreifachformulierung `unklar, unnötig oder zu lang`.

## 7. Ten-Day Delayed Follow-Up

Die Nachbefragung besitzt eine getrennte optionale Kontaktzustimmung. Die erste neutrale Einladung
wird 240 Stunden nach Session-Completion geplant, maximal eine Erinnerung 48 Stunden später; der
Link schließt 336 Stunden nach der Hauptsitzung. Die erwartete Bearbeitungszeit wird bis zum Pilot
als etwa ein bis zwei Minuten angegeben.

Der Follow-up fragt ausschließlich nach Handlungen, die nach der Hauptsitzung und vor dem
angezeigten Stichtag abgeschlossen waren. Integrierte und separat installierte Passwortmanager
zählen gleichwertig. Die primären verzögerten Einzeloutcomes sind:

- Nutzung eines Passwortmanagers zur Einrichtung mindestens eines neuen kontospezifischen
  Passworts;
- Aktivierung von MFA bei mindestens einem tatsächlich verwendeten Konto.

Prüf- und Nutzungshandlungen bleiben sekundär-deskriptiv. `Ich weiß es nicht mehr` und
`Keine Angabe` sind getrennte exklusive Optionen. Nichtantwort ist fehlende Information und wird
nie als `keine Handlung` codiert. Ergebnisse werden zusätzlich deskriptiv nach grober
Ausgangsnutzung betrachtet, weil bereits etablierte Nutzerinnen und Nutzer kaum eine neue
Aktivierung berichten können.

## 8. Claim- und Freeze-Grenzen

Das Follow-up darf als `ten-day delayed self-reported account-protection actions` bezeichnet
werden. Es belegt weder objektiv beobachtetes Verhalten noch dauerhafte Adoption, fortgesetzte
Nutzung, reduzierte Passwortwiederverwendung oder langfristige Verhaltensänderung.

Vor dem Study Freeze sind verpflichtend:

- offizielle verantwortliche Stelle, Datenschutzkontakt, Rechtsgrundlage und konkrete
  Aufbewahrungs-/Löschfristen;
- vollständiger Cognitive Pretest aller eigenen Items und Guardrail-Distraktoren;
- vollständiger Pilot auf dem tatsächlichen Studienlaptop einschließlich Layout und Dauer;
- erneuter Guardrail-Audit gegen den finalen PassWo-Stand S11--S17;
- dokumentierter Freeze der Instrument-, Content- und Referenzversionen.

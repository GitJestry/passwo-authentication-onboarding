# Measurement Instrument 2.1

Status: **inhaltlich für Implementierung und Cognitive Pretest eingefroren.**  
Geltungsbereich: randomisierter Between-Subjects-Vergleich des Supportive Authentication
Onboarding mit dem eingefrorenen SecAware.NRW-Referenzartefakt.

Die kanonischen Teilnehmertexte, stabilen IDs, Antwortoptionen und sechs Guardrail-Formen stehen
in `research/derived/instruments-v1.yaml`. Die teilnehmerseitige Projektion liegt in
`research/derived/instruments-v1.runtime.json` und wird nach
`packages/contracts/src/generated/instruments-v1.runtime.json` gespiegelt. Das getrennte
Follow-up ist ausschließlich in `docs/research/FOLLOW-UP-INSTRUMENT.md` und
`research/derived/follow-up-v5.yaml` dokumentiert; seine Fragen sind nicht Bestandteil der
Training Runtime.

## 1. Messlogik und Claim-Grenzen

Verglichen werden zwei vollständige Onboarding-Artefakte. Die manuscript-derived Designfoci
begründen die Gestaltung, sind aber weder validierte latente Konstrukte noch isoliert manipulierte
Wirkfaktoren. Custom Items werden einzeln interpretiert. Es werden kein Supportiveness-Score,
kein Designfokus-Score, kein Guardrail-Gesamtscore, kein Pass/Fail und kein kombinierter
Follow-up-Score berechnet.

Die Studie misst unmittelbare Artefaktwahrnehmung, objektive Bearbeitungszeit,
kriteriumsbezogenes Sofortverständnis und explorative task-specific Self-Efficacy. Der
verpflichtende zweite Studienteil ergänzt eng begrenzte selbstberichtete Schutzhandlungen
innerhalb von zehn Tagen. Ohne
Wissens-Pretest können weder individueller Wissenszuwachs noch neu erworbener Wissensanteil
bestimmt werden. Die Studie belegt keine Äquivalenz, allgemeine Authentifizierungskompetenz,
langfristige Adoption oder dauerhafte Verhaltensänderung.

## 2. Verbindliche Reihenfolge der Hauptsitzung

```text
Eligibility + Teilnahmeinformation + Einwilligung
→ verpflichtende Kontaktbestätigung für den zweiten Studienteil
→ Pre: Stichprobe → Vorerfahrung/Ausgangsnutzung → Self-Efficacy
→ zugewiesenes Lernangebot
→ Post: UEQ-S → UEQ+ Inhaltsseriosität → wahrgenommene Dauer → Duration Fit
       → Design-Diagnostik → Risikodarstellung + wahrgenommenes Verständnis
→ Guardrail: drei Anwendungsszenarien → drei Recognition-Items
→ Post-Guardrail: wiederholte Self-Efficacy → retrospektive SecAware-Vorerfahrung
→ ein optionaler offener Kommentar
→ neutrale Session Closure; vollständige Aufklärung nach Teil 2 oder Fensterschluss
```

Die Szenarien stehen vor Recognition, weil Recognition-Optionen Teile der Regeln benennen und die
wichtigeren Anwendungsszenarien sonst cueen könnten. Die wiederholte Self-Efficacy folgt erst nach
dem vollständigen Guardrail. Sie wird deshalb als Urteil nach Artefakt und gemeinsamer
No-Feedback-Reflexion interpretiert, nicht als unkontaminierter reiner Post-Artefakt-Effekt. Vor
Abschluss aller In-Session-Outcomes wird kein Richtig/Falsch-Feedback gezeigt.

## 3. Pre-Fragebogen

Erhoben werden Hochschulrolle, breiter Fach-/Organisationsbereich, Altersgruppe, frühere
Authentifizierungstrainings, aktuelle Passwortspeicher-/Passwortmanager-Funktionen, grobe
MFA-Nutzung und vier task-specific Self-Efficacy-Einzelratings. Diese Variablen dienen
Stichprobenbeschreibung, Balanceinspektion, Ceiling-Effekt-Einordnung und den vorab definierten
Self-Efficacy-Modellen. Sie dienen nicht unterpowerten demografischen Subgruppenvergleichen.
Geschlecht und allgemeine Familiarity-Items werden nicht erhoben.

`PRE_PM_USE` fragt beobachtbare integrierte beziehungsweise separat installierte Funktionen ab.
`PRE_MFA_USE` bezieht sich auf persönlich wichtige Konten und verlangt keinen unbekannten Nenner
aller Dienste, die MFA anbieten.

Die Self-Efficacy-Instruktion lautet:

> Wie zuversichtlich bist du derzeit, die folgenden Aufgaben selbstständig durchführen zu können?

Die vier Aufgaben sind:

1. unterschiedliche Passwörter für mehrere Konten verwalten und später wieder Zugang erhalten;
2. für ein neues Konto mit einem Passwortmanager ein kontospezifisches Passwort erzeugen und
   speichern;
3. ein gespeichertes Passwort bei einer späteren Anmeldung abrufen oder ausfüllen lassen;
4. MFA/2FA in den Einstellungen eines wichtigen Kontos aktivieren.

Antworten verwenden `0` bis `10` mit `0 = überhaupt nicht zuversichtlich`,
`5 = mäßig zuversichtlich` und `10 = völlig zuversichtlich`. Die vier Items sind
studienspezifische Einzelratings und keine validierte gemeinsame Authentication-Self-Efficacy-
Skala. Sie werden nicht summiert oder gemittelt.

SecAware.NRW wird im Pre nicht genannt. Frühere SecAware-Exposition wird nach Guardrail und
Post-Self-Efficacy retrospektiv für den Zustand vor der heutigen Teilnahme abgefragt und nur in
einer vorab festgelegten Sensitivitätsanalyse verwendet. Die primäre Analyse folgt der
randomisierten Zuweisung.

## 4. Post-Fragebogen

### Standardisierte Skalen

- **UEQ-S:** acht offizielle deutsche Items, unveränderte Reihenfolge und Polarität. Pragmatic
  Quality und Hedonic Quality werden getrennt berichtet; es gibt keinen Gesamt-UX-KPI.
- **UEQ+ Trustworthiness of Content / Inhaltsseriosität:** vollständige vierteilige deutsche
  Skala `nutzlos–nützlich`, `unglaubwürdig–glaubwürdig`, `unseriös–seriös`,
  `ungenau–genau`. Der Score bleibt getrennt vom UEQ-S und vom spezifischen
  Nützlichkeits-Einzelitem. Er misst wahrgenommene Inhaltsseriosität, nicht objektiv verifizierte
  technische Korrektheit.

### Dauer

Objektive Artefaktdauer wird als Wall-Clock-Zeit zwischen vorab definiertem Start und Abschluss
gespeichert. Segmentzeiten des Prototyps sind nur interne Diagnostik. Die objektive Dauer wird vor
den Dauerurteilen nicht angezeigt. `PERCEIVED_DURATION` fragt unmittelbar vor `TIME_FIT`, wie lang
sich die Bearbeitung angefühlt hat, auf einer vollständig beschrifteten Skala von `1 = sehr kurz`
bis `7 = sehr lang`.

`TIME_FIT` verwendet sieben vollständig beschriftete Kategorien von `deutlich zu kurz` bis
`deutlich zu lang` und beurteilt die Angemessenheit der Dauer. Beide Items werden einzeln und über
ihre vollständige Verteilung ausgewertet. Höhere Werte bedeuten bei keinem Item automatisch
bessere Qualität. Der Cognitive Pretest muss prüfen, ob subjektive Länge und Angemessenheit als
unterschiedliche Fragen verstanden werden.

### Design-diagnostische Einzelitems

Auf einer vollständig beschrifteten siebenstufigen Zustimmungsskala werden einzeln erfasst:

- praktische Nützlichkeit für Kontoschutzentscheidungen;
- nicht-vorwurfsvolle Vermittlung;
- persönliche Alltagsrelevanz;
- Gelegenheit zur Anwendung auf konkrete Kontosituationen;
- nachvollziehbare Mechanismuserklärung;
- konkrete Vorstellbarkeit der Auswirkungen unterschiedlicher Entscheidungen
  (`CONSEQUENCE_TANGIBILITY`);
- wahrgenommene Bewältigbarkeit der Informationsmenge;
- Klarheit konkreter nächster Schritte.

Die Items sind keine validierte gemeinsame Skala. Die Bewältigbarkeitsfrage wird nicht als
psychometrische Cognitive-Load-Messung bezeichnet. Ein zusätzliches allgemeines Interesse- oder
Emotionsinstrument wird nicht erhoben, weil es keine eigenständige zentrale Analysefunktion
besitzt und teilweise mit UEQ-S überlappt.

### Verständnis und Risikodarstellung

`UNDERSTANDING_GLOBAL` ist ein globales Selbsturteil und bleibt vom kriteriumsbezogenen Guardrail
getrennt. `RISK_PRESENTATION` fragt, ob die Darstellung als verharmlost, angemessen oder
übertrieben wahrgenommen wurde. Es ist eine subjektive Beurteilung der Darstellung, keine
objektive Risikokalibrierung und kein höher-ist-besser-Outcome.

## 5. Immediate Understanding Guardrail

Der Guardrail prüft nur den in beiden Artefakten explizit belegten gemeinsamen Kern:

1. ein bekannt gewordenes wiederverwendetes Passwort ermöglicht kontoübergreifende Angriffe;
2. kontospezifische Passwörter begrenzen diesen Weg;
3. Passwortmanager unterstützen Erzeugen, Speichern, Zuordnen und spätere Verfügbarkeit
   kontospezifischer Passwörter;
4. MFA bildet bei bekanntem Passwort eine zusätzliche Anmeldebarriere;
5. MFA verhindert nicht nachträglich, dass ein Passwort bekannt wurde;
6. MFA macht Passwortwiederverwendung nicht sicher.

Zuerst werden drei Anwendungsszenarien abgeschlossen, danach drei Recognition-Items. Jedes Item
hat drei substantive Optionen und `Weiß ich nicht` fest an letzter Stelle. Der Server weist
innerhalb jeder Bedingung eine der sechs Formen `F1` bis `F6` in kleinen permutierten Blöcken zu.
Die sechs Formen balancieren alle sechs Szenarioreihenfolgen und jede substantive Option genau
zweimal auf jeder Antwortposition. Recognition bleibt in fester Reihenfolge.

Berichtet werden vollständige Antwortverteilungen sowie je Szenario der Anteil angemessener und
der Anteil unsicherer Antworten. Einzelne Distraktoren bleiben deskriptiv sichtbar, erhalten aber
nicht alle einen eigenen Bedingungskontrast. Recognition wird itembezogen ausgewertet. Eine
unsichere Antwort belegt keine stabile oder allgemeine Fehlvorstellung.

Der Claim--Evidence--Task-Audit steht in `GUARDRAIL-CONTENT-AUDIT.md`. Details wie konkrete
Passwortlängen, die Sechs-Wort-Methode oder PassWo-spezifische Visualisierungskategorien bleiben
ausgeschlossen.

## 6. Offene Rückmeldung

Nach allen geschlossenen Outcomes folgt ein einziges optionales Freitextfeld:

> Möchtest du uns noch etwas zum Lernangebot mitteilen?

Es ist auf 500 Zeichen begrenzt und enthält eine explizite Datenminimierungswarnung. Leere
Antworten werden als `null` gespeichert. Freitext wird im Analyseexport bis zur manuellen Prüfung
separiert.

## 7. Evidenzhierarchie

### Zentral

- objektive Artefaktdauer;
- praktische Nützlichkeit;
- Anwendungsmöglichkeit;
- Information Manageability;
- Klarheit nächster Schritte;
- vollständige Verteilung jedes Szenarios;
- je Szenario angemessene und unsichere Antwortanteile.

### Sekundär

- UEQ-S Pragmatic und Hedonic Quality;
- nicht-vorwurfsvolle Vermittlung und persönliche Relevanz;
- Mechanismuserklärung und konkrete Vorstellbarkeit von Auswirkungen;
- UEQ+ Inhaltsseriosität;
- wahrgenommene Angemessenheit der Risikodarstellung;
- wahrgenommenes globales Verständnis;
- wahrgenommene Dauer und Duration Fit.

### Explorativ

- drei Recognition-Items;
- vier baseline-adjustierte Self-Efficacy-Einzeloutcomes;
- offener Kommentar.

### Zentral-sekundär

- die drei getrennten selbstberichteten Schutzhandlungen innerhalb von zehn Tagen aus
  `follow-up-v5`.

## 8. Cognitive-Pretest- und Freigabegate

Der Cognitive Pretest verwendet Think-aloud und anschließende Paraphrasen. Er prüft mindestens:

1. ob `PERCEIVED_DURATION` als erlebte Länge und `TIME_FIT` als Angemessenheit wiedergegeben
   werden, ohne beide Fragen gleichzusetzen;
2. ob „zweiter und letzter Studienteil“ in Rekrutierung, Einwilligung, Session Closure und E-Mail
   keinen konkreten Fokus auf Passwort-, Passwortmanager- oder MFA-Handlungen vorwegnimmt;
3. ob Stichtag, Freiwilligkeit, Linkgültigkeit und verzögerte Aufklärung verstanden werden;
4. ob die Geheimhaltungsbitte als freiwillige Bitte und nicht als Verbot wahrgenommen wird.

Vor Rekrutierung müssen die versionierten Endfassungen von `consent-v7-draft`, verpflichtender
Kontaktbestätigung, verzögertem Debriefing und Geheimhaltungsbitte durch den zuständigen Ethik- und
Datenschutzprozess bestätigt sein. Bis dahin bleibt `consent-v7-draft` ausdrücklich ein Draft.

## 9. Freeze-Regel

Die in `instruments-v1.yaml` und der Runtime-Projektion festgelegten IDs, Texte, Optionen,
Blockreihenfolgen und Klassifikationen werden nach dem Cognitive Pretest nur geändert, wenn ein
konkretes Verständnis-, Inhaltsaudit- oder Implementierungsparitätsproblem dokumentiert wird.
Nach Beginn der Hauptstudie erfolgen keine Änderungen anhand sichtbarer Bedingungsergebnisse.

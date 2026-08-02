# S00--S05 Copy and Interaction Audit

## Status und Zweck

Dieser Audit beschreibt den Stand des Repositorys vom 2. August 2026 bis einschließlich S05.
Er ist eine verbindliche Änderungsgrundlage, aber noch keine Freigabe, alle genannten Texte in
einem einzigen Codex-Lauf umzuschreiben. Zuerst werden die sprachlichen und semantischen Regeln
stabilisiert. Danach folgen kleine, segmentbezogene Implementierungsschritte.

Die Prüfung betrachtet Teilnehmertext, Handlungszuordnung, Hervorhebung, Segmentfunktion und die
Grenze zwischen Lernoberfläche und interner Forschungsdarstellung. S06 und spätere Segmente sind
nicht Teil dieses Audits.

## Übergreifende Befunde

### 1. PassWo übernimmt zu viele Rollen gleichzeitig

Mehrere Sprechblasen orientieren, erklären Kontofunktionen, beschreiben spätere Risiken und geben
eine Navigation vor. Dadurch wird PassWo zum Vorleser und die eigentliche Interaktion zum
Begleitbild. Künftig erhält jeder Sprechschritt eine primäre Rolle gemäß
`docs/design/TRAINING-COPY.md`.

### 2. Buttontext und tatsächliche Handlung sind teilweise getrennt

Zwei besonders kritische Fälle sind bereits identifiziert:

- Nach S01 fordert PassWo zum Schließen des Browserfensters auf, die Sprechblase zeigt jedoch
  `Schließen`. Dieser Button schließt nur die Blase und kann fälschlich als Browserhandlung
  verstanden werden.
- Nach der Campusgram-Warnung in S03 zeigt die Sprechblase `Konto öffnen` und öffnet das Konto
  direkt. Die beabsichtigte Lernhandlung ist dagegen der selbst ausgeführte Klick auf den
  markierten Campusgram-Tab.

Diese Fälle werden nicht durch andere Beschriftungen repariert. Die Sprechblasenaktion muss
entfallen; der tatsächliche Browser- beziehungsweise Tab-Klick bleibt das einzige Domain-Event.

### 3. Hervorhebung fasst Absätze zusammen, statt einen Kerngedanken zu markieren

Der aktuelle Emphasis-Katalog hebt in einzelnen Sprechschritten drei bis vier Konto-, Dienst- oder
Funktionsnamen gleichzeitig hervor. Dadurch entsteht eine zweite Leseschicht: unmarkierter Text
wirkt nebensächlich, markierte Begriffe wirken wie Prüfungsstoff. Künftig gilt standardmäßig eine
semantische Hervorhebung pro Sprechschritt. Identitätsfarben für Kontonamen dienen nur der
Referenzauflösung.

### 4. Kontext und Sicherheitsfolge werden zu früh vermischt

S00 und S02 erklären teilweise bereits, welche Daten, Zurücksetzungen oder Handlungen bei einem
Zugriff möglich wären. Die spätere Konsequenzsimulation verliert dadurch ihren erklärenden
Zeitpunkt. Frühe Kontoszenen sollen zunächst nur zeigen, was hinter den Konten liegt. Die Schwere
der Folgen wird erneut und ausführlich dargestellt, wenn ein Angriffspfad sie tatsächlich sichtbar
macht.

### 5. Interne Forschungsbegriffe gelangen in S05 an die Teilnehmeroberfläche

S05 verwendet unter anderem `Fixture`, `Laufzeitbefund`, `Feste Demonstration`,
`Produktionsbewertung`, `Gesamtscore` und `theoretische Entropie`. Diese Begriffe schützen zwar
interne Claim-Grenzen, erzeugen aber als Teilnehmertext unnötige Metakommunikation. Die Grenze
bleibt bestehen, wird jedoch an wenigen stabilen Stellen in Alltagssprache formuliert.

## Segmentprüfung

## S00 -- Einstieg und Browserorientierung

### Beibehalten

Der Einstieg

> Aloha! Ich bin PassWo und begleite dich heute durch das Training.

ist bewusst charakterbildend, verständlich und mit dem unterstützenden Ton vereinbar. Er bleibt
wortgleich geschützt. Auch die Szenarioeinordnung, die fiktive Passwortaufgabe, der spätere
Wiedereinstieg und die Wahl des virtuellen Betriebssystems erfüllen eine klare Orientierungsrolle.

### Problem

Die erste Sprechblase im Browser erklärt Master Campus sowie alle verbundenen Dienste. Weitere
Sprechblasen erklären Campus E-Mail und Campusgram. Dadurch nimmt S00 wesentliche Teile der
späteren Kontenerkundung vorweg und verlängert die Navigationseinführung.

### Ziel

S00 erklärt ausschließlich:

- dass die Person sich in einem fiktiven Browser mit drei Tabs befindet;
- dass sie die Konten in frei wählbarer Reihenfolge einrichten kann;
- wie PassWo-Hilfe und Browsernavigation funktionieren;
- dass nur neue fiktive Passwörter verwendet und nicht dauerhaft gespeichert werden.

Die Bedeutung der Konten wird in S02 erlebt, nicht in S00 vorgelesen. Der Safety-Hinweis bleibt
vollständig und sichtbar; er darf nicht aus Kürzungsgründen abgeschwächt werden.

### Hervorhebung

Der Einstieg benötigt keine vier Lernhervorhebungen. Zulässig ist höchstens eine Hervorhebung für
die fiktive Aufgabe oder die spätere Abrufbarkeit. Im Safety-Hinweis ist die zentrale
Handlungsgrenze `keine echten Passwörter oder Varianten davon`; Speichergrenzen bleiben als
normaler, gut lesbarer Text sichtbar.

## S01 -- Konten einrichten und Browser verlassen

### Beibehalten

Die Websites dürfen ihre jeweilige Identität und die Account-Erstellung zeigen. Der kompakte
Quest-Hinweis, für alle drei Konten ein starkes und später abrufbares Passwort zu erstellen, passt
zur Aufgabe.

### Problem

Die Abschluss-Sprechblase erklärt bereits das Knotennetz und fordert zum Schließen des Browsers
auf. Gleichzeitig besitzt sie die generische Aktion `Schließen`, die nur die Sprechblase schließt.
Der sichtbare Fensterknopf und die Sprechblasenaktion konkurrieren um dieselbe Bedeutung.

### Ziel

- PassWo nennt nur den nächsten realen Schritt.
- Die Formulierung verweist eindeutig auf die Fenstersteuerung des virtuellen Browsers.
- Die Sprechblase besitzt keinen eigenen `Schließen`-Button.
- Erst das tatsächliche Browser-Close-Event startet den Desktop-/Netzwerkübergang.
- Der Close-Control erhält eine vorübergehende visuelle Markierung und einen eindeutigen
  Fokuszustand, ohne eine automatische Ausführung.

Die Erklärung, warum anschließend ein Knotennetz erscheint, gehört in den Einstieg von S02 und
muss nicht vor dem Schließen vorweggenommen werden.

## S02 -- Konten kennenlernen

### Problem

Der aktuelle Wortlaut bezeichnet die Aufgabe als `Konten verstehen`, fordert alle Unterdetails
als Pflichtfortschritt und bestätigt anschließend, ein Konto sei `verstanden`. PassWo erklärt jeden
Unterknoten und teilweise bereits die Schwere eines späteren Zugriffs. Das erzeugt den Eindruck
eines eigenen Wissensblocks, obwohl das Segment vor allem zeitlichen Abstand, persönliche Nähe
und ein wiederverwendbares mentales Kontomodell schaffen soll.

Der Introtext enthält zudem die frühe Sicherheitsbehauptung, das Passwort sei oft die `letzte
Hürde`, und kündigt einen linearen `Nächste`-Ablauf an, obwohl die Benutzeroberfläche freie
Erkundung unterstützen soll.

### Verbindliches Zieldesign

Titel und Fortschritt verwenden `kennenlernen`, `ansehen` oder `erkunden`, nicht `verstehen`.
Vor der Exploration führen zwei getrennte Sprechschritte in die Darstellung und die freie Wahl ein:

> Im Alltag ist nicht immer sichtbar, welche Funktionen mit einem Konto verbunden sind. Deshalb habe ich die drei Konten als Netzwerk dargestellt.

> Du musst dir keine Einzelheiten merken – vieles kommt dir wahrscheinlich bekannt vor. Wähle einen Kontoknoten aus, den du zuerst erkunden möchtest.

Pro Hauptkonto gilt:

1. genau eine kurze Pflichtinteraktion, die das notwendige Kontomodell sichtbar macht;
2. höchstens ein PassWo-Satz;
3. ein statischer, kurzer Kerngedanke;
4. optionale zusätzliche Vorschauen;
5. freie Rückkehr zu bereits angesehenen Konten.

#### Master Campus

Eine verbundene Website wird über `Mit Master Campus öffnen` betreten. Die kurze
Anmeldesequenz macht den zentralen Zugang sichtbar. Weitere verbundene Websites dürfen optional
erkundet werden.

Kerngedanke:

> Ein Master-Campus-Zugang kann mehrere verbundene Campusdienste öffnen.

#### Campus E-Mail

Eine kurze, vom Nutzer ausgelöste Mini-Szene zeigt exemplarisch einen Kontovorgang, etwa das
Eintreffen einer Bestätigung oder eines Zurücksetzungslinks. Die vier vorhandenen Funktionsknoten
können sichtbar bleiben, müssen aber nicht alle verpflichtend erklärt werden.

Kerngedanke:

> Über Campus E-Mail laufen Nachrichten, Bestätigungen und wichtige Kontovorgänge.

Die spätere Sicherheitsfolge eines fremden Zugriffs wird hier nicht vollständig ausformuliert.

#### Campusgram

Eine persönliche, rein fiktive Kommunikationsansicht wird geöffnet, beispielsweise eine
Direktnachricht oder ein eigener Beitrag. Zusätzliche Bereiche bleiben optional.

Kerngedanke:

> Campusgram enthält persönliche Beiträge und Kommunikation mit anderen Personen.

### Abschluss

Nach einer Pflichtinteraktion in jedem Konto lautet der Status `3/3 angesehen` oder `3/3
erkundet`. Es gibt keine Wissensfrage und keine Aussage, die Person habe alle Inhalte
`verstanden`.

## S03 -- Erneute Anmeldung und Campusgram-Warnung

### Beibehalten

Der Einstieg `Melde dich jetzt mit den eben gewählten Passwörtern erneut an.` ist kurz und
handlungsnah. Die Wiederanmeldung bleibt in frei wählbarer Kontoreihenfolge. Ein nicht erinnertes
Passwort bleibt eine zulässige Beobachtung und blockiert das Training nicht.

### Probleme

- Die Retrieval-Hilfe ist länger als für den akuten Zustand nötig und kombiniert Beruhigung,
  Interpretation und weitere Systemhandlung.
- Die vier Abschlussvarianten wiederholen jeweils, dass alle Konten geöffnet wurden, und fügen
  mehrere Lernaussagen hinzu.
- Die Campusgram-Warnung besitzt einen Sprechblasenbutton `Konto öffnen`, obwohl der Nutzer den
  markierten Tab selbst öffnen soll.

### Ziel

- Retrieval-Hilfe: Ergebnis plus eine unterstützende Einordnung; die technische Unterstützung
  wird durch die sichtbare Aktion erklärt.
- Abschluss: ein invarianter Satz über den geöffneten Zustand plus höchstens ein kurzer adaptiver
  Satz zur Abrufbarkeit.
- Die Zeitraffersequenz bleibt kurz und dient nur als Übergang.
- Nach der Warnansage wechselt der Statechart in einen Zustand `awaitingIncidentOpen`.
- Die Sprechblase weist auf den markierten Campusgram-Tab hin, besitzt aber keinen
  `Konto öffnen`-Button.
- Nur der selbst ausgeführte Tab-Klick öffnet S04.

Die vorhandene Warnformulierung ist grundsätzlich passend und kann gezielt zu
`Öffne den markierten Campusgram-Tab.` präzisiert werden, ohne die Szene weiter zu erklären.

## S04 -- Datenleck als Brücke zur Passwortanalyse

### Beibehalten

`Passwort prüfen` ist eine zulässige handlungsspezifische Aktion, weil der Button tatsächlich die
lokale Analyse startet. Die Erklärung, dass geleakte Passwortdaten nicht automatisch sofort
lesbar sind, ist eine wichtige technische Begrenzung.

### Problem

Die Formulierung `ob dein Passwort für sich stark genug ist` kann als binäre
Sicherheitsbewertung verstanden werden. Die lokale Simulation untersucht dagegen begrenzte
Angriffswege und darf keinen allgemeinen Bestehensstatus erzeugen.

### Ziel

Die dritte Passage beschreibt den Vorgang statt eines Urteils, beispielsweise:

> Wir schauen uns jetzt an, welche schnellen Prüfwege die Simulation bei diesem fiktiven Passwort erkennt.

Der konkrete Wortlaut wird erst im segmentbezogenen Implementierungsschritt freigegeben. Die
Begrenzung muss mit S05 konsistent sein.

## S05 -- Mechanismen der lokalen Passwortsimulation

### Stärke des aktuellen Ansatzes

S05 trennt naheliegende Bestandteile, vorhersehbaren Aufbau und freies Ausprobieren. Die
Simulation vermeidet eine erfundene effektive Länge und einen universellen Gesamtscore. Diese
fachliche Begrenzung ist zentral und bleibt erhalten.

### Problem

Die Teilnehmeroberfläche trägt derzeit zu viele interne Forschungs- und Implementierungsgrenzen
wortwörtlich nach außen. Wiederholte Begriffe wie `Fixture`, `Laufzeitbefund`,
`Produktionsbewertung`, `kein Gesamtscore` und `theoretische Entropie` erhöhen die
Informationslast, ohne den Mechanismus verständlicher zu machen.

### Ziel

S05 verwendet drei klar getrennte Textebenen:

1. **Lerntext:** erklärt genau einen Angriffsmechanismus in Alltagssprache;
2. **sichtbare Simulationsgrenze:** einmalig und kurz, etwa
   `Diese Übung bewertet keine echten Passwörter.`;
3. **interne Metadaten:** Fixture-IDs, Controller-, Scoring-, Runtime- und Research-Begriffe,
   ausschließlich im Design Lab oder in der Dokumentation.

Jeder Schritt folgt künftig:

> eine Behauptung → eine sichtbare Evidenz → ein kurzer Kerngedanke

Die fachliche Tiefe wird nicht durch pauschales Kürzen entfernt. Gekürzt werden Wiederholungen,
Metakommentare und interne Begriffe. Der spätere Implementierungsschritt prüft außerdem, ob
zwanzig nacheinander verpflichtende Schritte wirklich notwendig sind oder ob Demonstrationen
ohne Verlust des Lernziels zusammengeführt werden können.

### Implementierungs-Copy-Delta 2. August 2026

Die folgende begrenzte Umsetzung verwendet `research/private/training-script.pdf` (S04: Seite
12; S05: Seiten 12--35) und diesen Audit als Quelle. S06 und spätere Segmente bleiben unverändert.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Rolle | Grund und Bedeutung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S04.notice.paragraphs[2]` | `Deswegen prüfen wir jetzt, ob dein Passwort für sich stark genug ist …` | `Deshalb schauen wir uns jetzt an, welche schnellen Prüfwege die Simulation bei diesem fiktiven Passwort erkennt.` | Mechanismuserklärung | Begrenzung einer binären Sicherheitsbehauptung; begrenzte Bedeutungsänderung | `Passwort prüfen` startet weiterhin S05; keine Hervorhebung |
| `S05.browser.*`, `S05.page.eyebrow` | `lokale Analyse`, `Design-Lab-Demonstration`, `Einzelanalyse` | `Passwortwege` | Orientierung | Interne Implementierungsbegriffe aus sichtbaren und ARIA-Texten entfernen; keine Bedeutungsänderung | kein / keine Hervorhebung |
| `S05.page.fixtureNotice` | `Fiktives Passwort · bleibt nur im lokalen Arbeitsspeicher` | `Diese Simulation betrachtet nur das fiktive Passwort und ist keine allgemeine Sicherheitsbewertung.` | Safety Boundary | Einmalige, verständliche Geltungsgrenze; begrenzte Bedeutungsänderung | kein / keine Hervorhebung |
| `S05.componentDemonstrations[*].note`, `S05AnalysisTraining`-Beispiellabels | `Feste Beispiele`, `Feste Demonstration`, `Feste Kandidaten` | `Beispiele`, `Beispielkandidaten` und konkrete Alltagsbeschreibungen | Mechanismuserklärung | Forschungs- und Implementierungsmetasprache entfernen; keine Bedeutungsänderung | `Animation wiederholen` / keine Hervorhebung |
| `S05.result.*`, `S05.structure.application.*` und zugehörige sichtbare Labels | `Fixture`, `Laufzeitbefund`, `Produktionsbewertung`, `lokale Simulationsergebnisse` | `Was die Übung erkennt`, konkrete markierte Stellen und Zusammenhänge | Ergebnisfeedback | Begrenzte Befunde in Alltagssprache zeigen; keine Bedeutungsänderung | `Weiter` / keine Hervorhebung |
| `S05.structure.demonstrations[*].boundaryNote` | Laufzeit-, Fixture- und lokale-Analyse-Hinweise | Konkrete Aussage zum gezeigten Beispiel und zur jeweiligen Erkennungsgrenze | Kerngedanke | Ein Gedanke nach der sichtbaren Demonstration; keine Bedeutungsänderung | `Weiter` / keine Hervorhebung |
| `S05.freeSearch.estimate.confirmed`, `S05AnalysisTraining`-Schätzlabel | `lokaler Controller`, `Forschungsantwort` | `Deine Schätzung` und `Sie bleibt in dieser Übung.` | Safety Boundary | Interne Implementierungs- und Forschungsmetasprache entfernen; keine Bedeutungsänderung | `Schätzung bestätigen` / keine Hervorhebung |
| `S05.freeSearch.theoreticalModel.boundary` und theoretische Szenenlabels | `Reines theoretisches Modell`, `keine Schätzung für das fiktive Passwort` | `Beispiel mit festgelegten Annahmen` und `Die Uhr vergleicht nur die gezeigten Zeichenfolgen.` | Mechanismuserklärung | Die Annahmen und der eingeschränkte Vergleich bleiben sichtbar; keine Bedeutungsänderung | `Weiter` / keine Hervorhebung |
| `S05.freeSearch.application.*` | `Befunde aus S05.1/S05.2`, `theoretische Entropie`, `Gesamtstärkewert` | `Erkannte Bestandteile`, `Erkannte Zusammenhänge` und keine Zeitprognose oder einzelnes Gesamturteil | Ergebnisfeedback | Segment-IDs und interne Bewertungsbegriffe entfernen, technische Grenze erhalten; keine Bedeutungsänderung | `Weiter` / keine Hervorhebung |
| `S05.summary.noScore` und Zusammenfassungslabel | `kein Gesamtscore` | `Die drei Blickwinkel ergänzen einander. Sie werden nicht zu einem einzelnen Urteil verrechnet.` | Kerngedanke | Fachliche Trennung ohne Scoring-Metasprache; keine Bedeutungsänderung | `Weiter` / keine Hervorhebung |
| `password-*-scene.accessibleSummary` | interne Analyse-, Befund-, Modell-, Segment- und Gesamtwertbegriffe | dieselben teilnehmergerechten Aussagen wie die sichtbaren S05-Karten | Orientierung | Interne Labels dürfen nicht über ARIA in die Teilnehmeroberfläche gelangen; keine Bedeutungsänderung | kein / keine Hervorhebung |

### Ergänzendes Copy-Delta 2. August 2026

Der folgende ausdrücklich freigegebene Nutzerauftrag ergänzt die oben dokumentierte Umsetzung.
Er betrifft nur die genannten Sprechschritte und ihre unmittelbar zugehörigen Aktionen.

| Segment und Text-ID | Neuer Text | Rolle | Interaktionsziel / Hervorhebung | Änderungsgrund |
|---|---|---|---|---|
| `S00.entry.paragraphs[2..3]` | bestehender Wortlaut | Orientierung | `starke Passwörter`, `gut merken` und `wieder abrufen` sind markiert | Die drei handlungsleitenden Formulierungen sollen in der Einstiegsorientierung sichtbar hervortreten. |
| `S01.completion.guideMessage` | `Die drei Konten sind eingerichtet. Schließe jetzt das Browserfenster. Bevor du dich wieder anmeldest, schauen wir uns kurz an, was hinter den Konten steckt.` | Navigation | Browserfenster schließen; keine Hervorhebung | Der sichtbaren Bedienhandlung und dem nächsten Abschnitt zugeordnet. |
| `S02.narration.messages[s02.accounts.intro]` | `Im Alltag ist nicht immer sichtbar, welche Funktionen mit einem Konto verbunden sind. Deshalb habe ich die drei Konten als Netzwerk dargestellt.` | Orientierung | erster Schritt der Einführungsanimation | Die Darstellung wird aus einer alltagsnahen, nicht wertenden Perspektive begründet. |
| `S02.narration.messages[s02.accounts.intro-ready]` | `Du musst dir keine Einzelheiten merken – vieles kommt dir wahrscheinlich bekannt vor. Wähle einen Kontoknoten aus, den du zuerst erkunden möchtest.` | Navigation | freie Kontowahl nach dem Einblenden | Die freie Reihenfolge, geringe Gedächtnislast und der sichtbare Kontoknoten werden direkt vor der Interaktion benannt. |
| `S03.narration.retrievalHelp` | `Kein Problem. Das zeigt: Ein Passwort muss nicht nur stark, sondern später auch wieder abrufbar sein. Ich unterstütze dich jetzt bei der Anmeldung.` | Ergebnisfeedback | `stark` und `wieder abrufbar` sind markiert; `Für mich anmelden` | Die zulässige Nicht-Erinnerung wird eingeordnet und die Hilfe bleibt handlungsnah. |
| `S03.narration.campusStart`, `S03.controls.campusStartContinue` | `Alle drei Konten sind wieder geöffnet. Wir können unseren Campusalltag jetzt fortsetzen.` / `Campusalltag fortsetzen` | Ergebnisfeedback / Navigation | Button führt ausschließlich zum nächsten S03-Schritt | Abschlusszustand und tatsächliche Buttonwirkung verwenden denselben Begriff. |
| `S03.narration.warning` | `Bei Campusgram ist eine Sicherheitsmeldung erschienen. Schau bitte nach.` | Navigation | Sicherheitsmeldung ist markiert; der Campusgram-Tab bleibt das externe Ziel | Die Warnung weist auf den sichtbaren Zustand, ohne eine Ersatzaktion in der Sprechblase einzuführen. |
| `S04.notice.paragraphs[2]`, `S04.notice.continueLabel` | `Wie schwer wäre es für einen Angreifer, dieses Passwort zu finden? Dafür nehmen wir jetzt seine Perspektive ein und schauen uns drei Wege an, mit denen er mögliche Passwörter prüft.` / `Prüfung starten` | Mechanismuserklärung / Navigation | Button startet die begrenzte Prüfung | Der Übergang benennt die Angreiferperspektive und bleibt auf die drei gezeigten Prüfwege begrenzt. |

### Copy-Delta Abschlusswiederholung 2. August 2026

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S03.narration.campusStart` | Nutzerauftrag vom 2026-08-02; S03-Skriptseiten 8--11; dieser Audit | `Alle drei Konten sind wieder geöffnet. Wir können unseren Campusalltag jetzt fortsetzen.` | `Wir können unseren Campusalltag jetzt fortsetzen.` | Navigation | Die zuvor sichtbare Abschlussansage nennt bereits, dass alle drei Konten wieder geöffnet sind; die Wiederholung nach dem Zeitraffer wird entfernt. | nein | `Campusalltag fortsetzen` | keine |

### Copy-Delta Sprecherkennung 2. August 2026

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `PassWoSpeechBubble.speaker` (S00--S05) | Nutzerauftrag vom 2026-08-02; vorhandener kanonischer `guideName` | Sprechername nur als Screenreader-Text `PassWo sagt:` | sichtbares, kleines und unterstrichenes `PassWo` oben mittig in jeder Sprechblase | Orientierung | Die Sprecherzuordnung wird direkt an die Textfläche gebunden; das separate Nametag an der Figur entfällt. | nein | kein | keine |

Da der bestehende kanonische Sprechername nur presentation-only sichtbar gemacht wird, ändert sich
kein Segmentinhalt und es ist kein Content-Versionssprung erforderlich.

### Copy-Delta Abschlussstatus 2. August 2026

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S00.narration.safetyWarning` | Nutzerauftrag vom 2026-08-02; bestehender S00-Content | Safety-Hinweis endet vor `Viel Erfolg!` mit einem erzwungenen Zeilenumbruch. | Derselbe Wortlaut endet mit einem Leerzeichen vor `Viel Erfolg!`. | Safety Boundary | Der Gruß soll nicht künstlich in eine eigene Zeile gezwungen werden. | nein | kein | keine |
| `S02.page.completion` | Nutzerauftrag vom 2026-08-02; S02-Skriptseiten 4--7; dieser Audit | `Alle drei Konten angesehen` | `Konten erkundet` | Ergebnisfeedback | Der Abschlussstatus soll die abgeschlossene Erkundung mit Text und Häkchen eindeutig anzeigen. | nein | Browser-Dock bleibt das sichtbare Ziel für den nächsten Schritt. | keine |
| `S02.narration.messages[s02.accounts.complete]` | Nutzerauftrag vom 2026-08-02; bestehender S02-Content | `Du hast alle drei Konten angesehen. Klicke unten im Dock auf den Browser, wenn du weitergehen möchtest.` (bereits vorhanden, aber nur auf Nachfrage sichtbar) | Wortlaut unverändert; nach Abschluss automatisch sichtbar. | Navigation | Die vorhandene Abschlussnachricht muss nach der dritten Pflichtinteraktion erscheinen. | nein | Browser im Dock | keine |

### Copy-Delta S05 Einstieg 2. August 2026

Quelle: ausdrücklicher Nutzerauftrag vom 2. August 2026. Der Einstieg ersetzt ausschließlich die
erste Kandidaten-Demonstration in S05. Die spätere begrenzte Passwortsimulation und ihre
fachlichen Aussagen bleiben unverändert. `S05_CONTENT_VERSION` wird von `2.1.0` auf `2.2.0`
erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S05.page.title` | `Wie entstehen wahrscheinliche Kandidaten?` | `Wie der Angreifer dein Passwort rät` | Orientierung | Der dauerhafte Titel benennt die Perspektive der neuen sichtbaren Einstiegsszene. | begrenzt | kein | keine |
| `S05.intro.narration.candidateCheck` | keine Sprechblase | `Für den Angreifer ist das Passwort verdeckt. Sein Programm muss mögliche Passwörter erzeugen und prüfen, ob eines davon passt.` | Mechanismuserklärung | Die laufende Kandidatenanimation wird auf einen klaren Mechanismus begrenzt. | nein | `Weiter` | keine |
| `S05.intro.narration.randomSequence` | keine Sprechblase | `Völlig zufällige Folgen von Zeichen sind aber enorm schwierig für Menschen zu merken. Deswegen nutzen die meisten eine merkbare Kombination.` | Mechanismuserklärung | Das Gegenüber aus Zufallsfolge und merkbarer Kombination wird vor dem Beispiel eingeordnet. | begrenzt | `Weiter` | keine |
| `S05.intro.narration.recognizableCombination` | keine Sprechblase | `Bei diesem Passwort erkennt deine eigene Intuition wahrscheinlich schon einen Aufbau.` | Kerngedanke | Das sichtbare Beispiel erhält eine kurze, nicht wertende Einordnung. | nein | `Weiter` | keine |
| `S05.intro.narration.buildingBlocks` | keine Sprechblase | `Vereinfacht kannst du dir Passwörter wie mehrere aneinandergesetzte Bausteine vorstellen.` | Mechanismuserklärung | Die leuchtenden Teile werden als vereinfachtes Modell eingeordnet. | nein | `Weiter` | keine |
| `S05.intro.narration.strategyTargeting`, `S05.intro.narration.strategyOverview` | keine Sprechblase | `Angreifer kennen diese Bausteine noch nicht. Sie erzeugen aber gezielt Kandidaten aus wahrscheinlichen Bestandteilen und prüfen, ob einer davon passt.` / `Wir schauen uns drei Strategien an, die Angreifer miteinander kombinieren. Angreifer beginnen mit Dingen, die bei vielen Menschen schon funktioniert haben.` | Mechanismuserklärung | Die Karten führen zu drei getrennten, kombinierbaren Prüfwegen. | nein | jeweils `Weiter` | keine |

Die verbleibenden visuellen Referenzen – verdecktes Campusgram-Passwort, zufällige
Zeichenfolge, Beispielkombination und drei Strategiekarten – führen keine neue Bewertungs- oder
Sicherheitsbehauptung ein. Die Baustein-Darstellung ist eine presentation-only Komponente; ihre
Teile stammen aus dem ausdrücklich gezeigten Beispiel und nicht aus einer Analyse des fiktiven
Campusgram-Passworts.

### Copy-Delta S05 Visuelle Sequenz 2. August 2026

Quelle: ausdrücklicher Nutzerauftrag vom 2. August 2026. Die Änderung ordnet ausschließlich die
Einstiegsszene und ihre sichtbaren Referenztexte neu; die S05-Mechanismuserklärungen, die
begrenzte Simulation und die späteren Demonstrationen bleiben unverändert.
`S05_CONTENT_VERSION` wird von `2.2.0` auf `2.3.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S05.page.eyebrow` | `Campusgram · Passwortwege` | entfällt | Orientierung | Der Seitenname wiederholt den sichtbaren Kontext und soll oberhalb der Szene nicht erscheinen. | nein | kein | keine |
| `S05.intro.campusgramPasswordLabel` | `Campusgram-Passwort` | Campusgram-Symbol mit `– Passwort` | Orientierung | Das Symbol löst das Konto direkt auf; die Beschriftung folgt der ausdrücklich vorgegebenen Form. | nein | kein | keine |
| `S05.intro.generatedPasswordLabel` | `Systemseitig erzeugte Zufallsfolge` | entfällt | Orientierung | Die sichtbare Zeichenfolge ersetzt die verdeckte Passwortkarte unmittelbar; das technische Label ist redundant. | nein | kein | keine |
| `S05.intro.memorablePasswordLabel` | `Beispiel für eine merkbare Kombination` | entfällt | Orientierung | Die Übergangsanimation zeigt die Funktion der Kombination; das Label wiederholt sie. | nein | kein | keine |
| `S05.intro.hiddenPasswordLabel` in der Strategiekarten-Szene | `für den Angreifer verdeckt` | entfällt | Orientierung | Die erneut eingeblendete Passwortkarte soll nur das Konto und das verdeckte Passwort zeigen. Die Erklärung bleibt im früheren Mechanismusschritt erhalten. | nein | kein | keine |
| `S05.intro.strategies[*]` | zweizeilig `01` und Strategiename | einzeilig `1. Strategiename` | Orientierung | Die Nummer gehört direkt zum jeweiligen Kartentitel; die drei Karten bleiben klar getrennte Vorschauen. | nein | kein | keine |

### Copy-Delta S05 Bausteinanimation und Layout 2. August 2026

Quelle: ausdrücklicher Nutzerauftrag vom 2. August 2026. Die Änderung entfernt zwei redundante
sichtbare Orientierungslabels aus der ersten Angreifer-Szene und ordnet ausschließlich die
Baustein- und PassWo-Darstellung responsiv neu. Die vorhandenen S05-Mechanismuserklärungen bleiben
wortgleich. `S05_CONTENT_VERSION` wird von `2.3.0` auf `2.4.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S05.intro.hiddenPasswordLabel` in der ersten Angreifer-Szene | `für den Angreifer verdeckt` | entfällt | Orientierung | Die unmittelbar sichtbare Campusgram-Passwortkarte und PassWos bestehende Erklärung machen das zusätzliche Label redundant. | nein | kein | keine |
| `S05.intro.candidateLabel` | `möglicher Versuch` | entfällt | Orientierung | Die laufende Kandidatenfolge und das sichtbare Ergebnis `passt nicht` zeigen die Funktion bereits; das Label verursacht zusätzliche Breite und Höhe. | nein | kein | keine |

Die Bausteine bleiben ausdrücklich authored presentation-only: Zuerst werden die Teile des
gezeigten Beispielpassworts farblich und durch Segmentgrenzen markiert, danach räumlich getrennt.
Der folgende Sprechschritt behält diesen Endzustand bei. Daraus wird keine Analyse eines echten
oder fiktiven Teilnehmerpassworts abgeleitet.

### Copy-Delta S04/S05-Übergang und S05-Strategiestart 2. August 2026

Quelle: ausdrücklicher Nutzerauftrag vom 2. August 2026. Die Änderung kürzt die Brücke aus
S04, präzisiert die beiden S05-Strategie-Sprechschritte und bindet die erste
Strategieanimation an deren sichtbaren `Weiter`-Button. `S04_CONTENT_VERSION` wird von `1.4.0`
auf `1.5.0`, `S05_CONTENT_VERSION` von `2.4.0` auf `2.5.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S04.notice.paragraphs[2]` | `Wie schwer wäre es für einen Angreifer, dieses Passwort zu finden? Dafür nehmen wir jetzt seine Perspektive ein und schauen uns drei Wege an, mit denen er mögliche Passwörter prüft.` | `Wie schwer wäre es für einen Angreifer, dieses Passwort zu finden? Dafür nehmen wir jetzt seine Perspektive ein.` | Mechanismuserklärung | Die konkrete Drei-Wege-Vorschau folgt erst in S05; ausdrücklich freigegebene Entfernung der Vorwegnahme. | begrenzt | `Prüfung starten` | `schwer` in Warnfarbe |
| `S04.notice.paragraphs[0]` | bestehender Wortlaut | bestehender Wortlaut | Mechanismuserklärung | Der benannte Vorfall soll als Carry-forward-Begriff markiert sein. | nein | kein | `Datenleck` in Warnfarbe |
| `S05.intro.narration.strategyTargeting` | `Angreifer kennen diese Bausteine noch nicht. Sie erzeugen aber gezielt Kandidaten aus wahrscheinlichen Bestandteilen und prüfen, ob einer davon passt.` | `Angreifer kennen diese Bausteine noch nicht.` / `Einige Passwortteile sind aber wahrscheinlicher als andere, da Menschen oft naheliegende Bestandteile verwenden oder ihr Passwort vorhersehbar aufbauen, um es sich leichter zu merken.` | Mechanismuserklärung | Wahrscheinliche Bestandteile und vorhersehbarer Aufbau werden vor den Strategiekarten eingeordnet. | begrenzt | `Weiter` | keine |
| `S05.intro.narration.strategyOverview` | `Wir schauen uns drei Strategien an, die Angreifer miteinander kombinieren. Angreifer beginnen mit Dingen, die bei vielen Menschen schon funktioniert haben.` | `Wir schauen uns nun drei Strategien an, die Angreifer miteinander kombinieren, um dein Campusgram-Passwort herauszufinden. Als ersten Ausgangspunkt beginnen Angreifer mit Dingen, die bei vielen Menschen schon funktioniert haben.` | Mechanismuserklärung | Der sichtbare Kontobezug und der Ausgangspunkt der ersten Strategie werden ausdrücklich benannt. | begrenzt | `Weiter` startet den Kartenübergang | keine |
| `PassWoSpeechBubble.speaker` | sichtbares `PassWo` oben in jeder Sprechblase | nur noch barrierefreie Sprecherzuordnung | Orientierung | Das sichtbare Namenslabel soll durchgehend entfallen; die semantische Zuordnung bleibt erhalten. | nein | kein | keine |

### Copy-Delta S05 Bausteinannotation und Strategiebrücke 2. August 2026

Quelle: ausdrücklicher Nutzerauftrag vom 2. August 2026. Die Änderung annotiert das bereits
gezeigte, authored Beispielpasswort im Schritt `strategyTargeting`. Der animierte Endzustand
bleibt im anschließenden Kartenüberblick sichtbar; erst dessen `Weiter`-Aktion startet wie zuvor
den Übergang zur ersten Strategiekarte. `S04_CONTENT_VERSION` wird von `1.5.0` auf `1.6.0`,
`S05_CONTENT_VERSION` von `2.5.0` auf `2.6.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S04.notice.continueLabel` | Nutzerauftrag vom 2026-08-02 | `Prüfung starten` | `Angreifer Perspektive` | Navigation | Der Button benennt die im nächsten Schritt sichtbare Perspektive. | nein | startet S05 | keine |
| `S05.intro.narration.strategyOverview` | Nutzerauftrag vom 2026-08-02; vorhandener S05-Content | `Wir schauen uns nun drei Strategien an, die Angreifer miteinander kombinieren, um dein Campusgram-Passwort herauszufinden. Als ersten Ausgangspunkt beginnen Angreifer mit Dingen, die bei vielen Menschen schon funktioniert haben.` | `Und dieses Wissen nutzen Angreifer aus. Wir schauen uns nun drei Strategien an, die Angreifer miteinander kombinieren, um dein Campusgram-Passwort herauszufinden. Als ersten Ausgangspunkt beginnen Angreifer mit Dingen, die bei vielen Menschen schon funktioniert haben.` | Mechanismuserklärung | Die Brücke bezieht die unmittelbar zuvor sichtbaren Annotationen in die Strategien ein. | begrenzt | `Weiter` startet den Kartenübergang | keine |
| `S05.intro.strategyAnnotations.sentenceStructure` | Nutzerauftrag vom 2026-08-02 | kein Label | `Satzbau` | Mechanismuserklärung | Die gemeinsame Verbindung der ersten vier Bausteine benennt den gezeigten Aufbau. | begrenzt | kein | Linien führen von jedem Baustein zu einem gemeinsamen Mittelpunkt. |
| `S05.intro.strategyAnnotations.probability` | Nutzerauftrag vom 2026-08-02; Research-Guardrail | kein Label | `Wahrscheinlichkeit ↑` | Mechanismuserklärung | Der gewünschte Wahrscheinlichkeitsanstieg wird qualitativ gezeigt; ohne hinterlegte empirische Grundlage wird keine erfundene Prozentzahl ausgegeben. | begrenzt | kein | Der Baustein `Passwort` wächst weich in Breite und Höhe. |
| `S05.intro.strategyAnnotations.personalDetail` | Nutzerauftrag vom 2026-08-02 | kein Label | `Persönliche Angaben` | Mechanismuserklärung | Die Jahreszahl wird als authored Beispielbestandteil eingeordnet. | begrenzt | kein | dezente diagonale Linie zu `2005` |
| `S05.intro.strategyAnnotations.typicalEnding` | Nutzerauftrag vom 2026-08-02 | kein Label | `Typische Endung` | Mechanismuserklärung | Das Satzzeichen wird als authored Beispielendung eingeordnet. | begrenzt | kein | dezente diagonale Linie zu `!` |

Die Annotation ist presentation-only und wertet weder ein reales noch das fiktive
Teilnehmerpasswort aus. Bei `prefers-reduced-motion` erscheint derselbe Endzustand ohne
Zwischenanimation.

### Copy-Delta S05 Naheliegende Bestandteile und häufige Kerne 2. August 2026

Quelle: ausdrücklicher Nutzerauftrag vom 2. August 2026. Die Änderung ersetzt die bisherige
S05-Einstiegsfolge durch eine reproduzierbare Bausteinfolge, führt die erste Kategorie
`Häufige Kerne` als authored Maschinendarstellung aus und endet mit der Übergabe an
`Persönliche Angaben`. `S05_CONTENT_VERSION` wird von `2.6.0` auf `2.7.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Grund und Bedeutung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.page.title` | `Wie der Angreifer dein Passwort rät` | `Naheliegende Bestandteile` | Orientierung | Der dauerhafte Titel benennt den ersten Strategiebereich. | kein / keine Hervorhebung |
| `S05.intro.narration.componentStartQuestion` | bisherige Kandidatenprüfung | `Die Strategie beginnt mit der Frage: Bei welchen Bestandteilen soll der Angreifer anfangen?` | Mechanismuserklärung | Die Ausgangsfrage wird an die sichtbare Bausteinfolge gebunden. | `Weiter` / keine Hervorhebung |
| `S05.intro.narration.componentFrequency` | bisherige Zufallsfolgen-Erklärung | `Er könnte alle Zeichenfolgen, Wörter und Begriffe der Welt ausprobieren. Aber nicht alle Bestandteile werden in Passwörtern gleich häufig verwendet.` | Mechanismuserklärung | Die unterschiedliche Häufigkeit wird ohne Zahlenbehauptung erklärt. | `Weiter` / keine Hervorhebung |
| `S05.intro.narration.componentCategoryOverview` | bisherige Drei-Strategien-Vorschau | `Bestimmte Bestandteile – und sehr häufige vollständige Passwörter wie „123456789“ – kann er früh abgleichen. Diese Idee lässt sich in vier Kategorien aufteilen.` | Mechanismuserklärung | Der frühe Abgleich und die vier sichtbaren Kategorien werden verbunden. | `Weiter` / keine Hervorhebung |
| `S05.intro.narration.commonCoresIntro` | keine eigene Kategorieansage | `Die erste Kategorie sind häufige Kerne.` | Orientierung | Leitet die aktive Mini-Karte ein. | `Weiter` / keine Hervorhebung |
| `S05.intro.narration.commonCoresDefinition` | allgemeine Beispielkarte | `Zu häufigen Kernen gehören bekannte Passwörter, Tastaturfolgen, Zahlenfolgen und häufig verwendete Jahreszahlen.` | Mechanismuserklärung | Ordnet die authored Kernliste fachlich ein. | `Weiter` / keine Hervorhebung |
| `S05.intro.narration.commonCoresVariants` | bisherige Karte `Typische Veränderungen` | `Dabei testen Angreifer nicht nur die ursprüngliche Schreibweise. Sie rechnen auch mit typischen Veränderungen.` | Mechanismuserklärung | Erklärt den sichtbaren, deterministischen Variantenstrom ohne Vollständigkeitsbehauptung. | `Weiter` / keine Hervorhebung |
| `S05.intro.commonCores.application` | allgemeine Ergebnisansicht | `Die markierten Stellen zeigen, welche häufigen Kerne die Simulation im fiktiven Campusgram-Passwort erkannt hat.` | Ergebnisfeedback | Begrenzt die lokale Hervorhebung auf vorhandene S05-Befunde. | lokaler Sichtbarkeitsschalter / erkannte Spannen werden zusätzlich durch Unterstreichung markiert |
| `S05.intro.commonCores.noFinding` | `kein einfacher Bestandteil erkannt` | `Kein häufiger Kern erkannt` | Ergebnisfeedback | Der Leerbefund bleibt eng und behauptet weder Stärke noch Sicherheit. | `Weiter` / keine Hervorhebung |

Die Variantenmaschine verwendet ausschließlich die sechs authored Beispiele sowie festgelegte
Schreibweisen, Ersetzungen und Anhänge. Sie analysiert keine Teilnehmerdaten, erzeugt keinen
Produktionsbefund und verändert weder Persistenz noch Studienrandomisierung. Die vier freigestellten
Kategorienlogos sind presentation-only; ihre Bezeichnungen bleiben zugänglicher HTML-Text.

### Copy-Delta S02 Netzwerk-Orientierung 3. August 2026

Quelle: ausdrücklicher Nutzerauftrag vom 3. August 2026; S02-Skriptseiten 4--7; dieser Audit.
Die Änderung teilt die alltagsnahe Orientierung und die freie Knotenauswahl weiterhin auf zwei
aufeinanderfolgende Sprechschritte auf. `S02_CONTENT_VERSION` wird von `4.3.1` auf `4.3.2`
erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S02.narration.messages[s02.accounts.intro]` | Nutzerauftrag vom 2026-08-03; S02-Skriptseiten 4--7 | `Ich habe die drei Konten als Netzwerk dargestellt. So kannst du sehen, welche Funktionen mit ihnen verbunden sind.` | `Im Alltag ist nicht immer sichtbar, welche Funktionen mit einem Konto verbunden sind. Deshalb habe ich die drei Konten als Netzwerk dargestellt.` | Orientierung | Die Darstellung wird als alltagsnahe, nicht wertende Unterstützung begründet. | begrenzt | kein | keine |
| `S02.narration.messages[s02.accounts.intro-ready]` | Nutzerauftrag vom 2026-08-03; bestehender S02-Content | `Wähle selbst, welches Konto du zuerst erkundest. Du musst dir keine Einzelheiten merken – viele dieser Funktionen kennst du wahrscheinlich aus deinem Alltag.` | `Du musst dir keine Einzelheiten merken – vieles kommt dir wahrscheinlich bekannt vor. Wähle einen Kontoknoten aus, den du zuerst erkunden möchtest.` | Navigation | Die geringe Gedächtnislast bleibt erhalten; der sichtbare Kontoknoten wird als inklusives Interaktionsziel benannt. | nein | Kontoknoten im Netzwerk | keine |

## Reihenfolge der nächsten Implementierung

1. S00-Navigation und S01-Handlungszuordnung chirurgisch korrigieren.
2. Den Emphasis-Katalog auf Carry-forward-Hervorhebungen reduzieren.
3. S03-Warnübergang auf den tatsächlichen Campusgram-Tab verlagern und Retrieval-Copy kürzen.
4. S02 als geführte Exploration nach der verbindlichen Zielregel neu schneiden.
5. S04 und S05 sprachlich begrenzen, ohne die technische Genauigkeit der Simulation zu schwächen.

Jeder Schritt erhält einen eigenen kleinen Codex-Auftrag und einen eigenen Content-Versionssprung.
Eine flächige Umschreibung von S00--S05 in einem Lauf ist ausdrücklich ausgeschlossen.

### Copy-Delta S05 begrenzter Rateweg und lokale semantische Einordnung 3. August 2026

Quelle sind der ausdrückliche Nutzerauftrag vom 3. August 2026, das Trainingsskript und
`ADR 0014-Bounded-Password-Guessing`. `S05_CONTENT_VERSION` wird von `2.7.0` auf `2.9.0`
erhöht. Die Zwischenversion `2.8.0` war ein nicht eingefrorener Implementierungsstand.

| Segment und Text-ID | Neuer Text / Verhalten | Rolle | Grund und Bedeutungsgrenze |
|---|---|---|---|
| `S05.analysis.authoredAccountTerms`, `S05.componentDemonstrations.account-context.examples` | `Campusgram`, `Campus`, `Nachrichten`, `Gruppen`, `Kontakte`, `Beiträge` | fachlicher Kontext / authored Demonstration | Die festgelegten Begriffe stammen aus der tatsächlich dargestellten Campusgram-Oberfläche. Frühere CampusBoard-Begriffe und der unspezifische Teilstring `Gram` werden nicht als Campusgram-Kontext behandelt. |
| `S05.structure.application.reflection.*` | lokale Auswahl zu persönlicher Bedeutung, gemeinsamem Thema, Satz/Phrase oder `Nichts davon oder unsicher` | aktive Reflexion | Diese Semantik ist aus der Zeichenfolge nicht zuverlässig ableitbar. Die Auswahl verlangt keine Details, bleibt flüchtig und verändert die Simulationsentscheidung nicht. |
| `S05.freeSearch.application.dispositionLabels` | `Die erkannten Hinweise ergeben zusammen einen entsprechend kurzen vollständigen Prüfweg.` | Ergebnisfeedback | Die Entscheidung bezieht sich auf den vollständigen, durch zxcvbn-ts geschätzten Kandidatenweg und nicht auf einen einzelnen Bestandteil. |
| `S05.freeSearch.application.noQuickPath` | kein entsprechend kurzer vollständiger Prüfweg erkannt | Ergebnisfeedback | Die Gegenkategorie ist ausdrücklich kein Stärke- oder Sicherheitsnachweis. |
| `S05.freeSearch.application.lengthOrientationLabels` | unter beziehungsweise mindestens 15 Zeichen für selbst erstellte Passwörter | Handlungsorientierung | Länge wird getrennt von der begrenzten Ratewegentscheidung dargestellt. |
| `S05.summary.noScore` | drei Blickwinkel werden zu vollständigen Kandidatenwegen kombiniert; 15-Zeichen-Orientierung bleibt getrennt | Kerngedanke | Naheliegende Bestandteile, Strukturen und freie Bereiche wirken gemeinsam, ohne einen universellen Passwortscore zu behaupten. |

Die Teilnehmeroberfläche zeigt weder den zxcvbn-Score noch geschätzte Kandidatenzahlen oder
Crack-Zeiten. Persönliche Bedeutung, Thema und Satzstruktur werden nur nach lokaler Bestätigung
angezeigt. Das System verarbeitet ausschließlich fiktive Passwörter im Browser.

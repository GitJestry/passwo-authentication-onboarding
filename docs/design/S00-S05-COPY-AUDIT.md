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

### Copy-Delta S05 wiederhergestellte Einleitung 3. August 2026

Quelle sind der ausdrückliche Nutzerauftrag vom 3. August 2026 und die bereits freigegebenen
S05-Copy-Deltas vom 2. August 2026. Der Commit `05d5380` hatte die Einleitung beim Umbau der
Bestandteile-Darstellung vollständig ersetzt. Die sechs vorhandenen Sprechschritte und ihre
presentation-only Visuals werden nun vor dem weiterhin bestehenden Abschnitt
`Naheliegende Bestandteile` wieder eingesetzt. `S05_CONTENT_VERSION` wird von `2.9.0` auf
`2.10.0` erhöht.

| Segment und Text-ID | Aktueller Text | Wiederhergestellter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S05.page.introTitle` | kein eigener Einleitungstitel | `Wie der Angreifer dein Passwort rät` | Orientierung | Trennt die wiederhergestellte Perspektiv-Einleitung vom anschließenden Strategiebereich. | nein | kein | keine |
| `S05.intro.narration.candidateCheck` | entfällt | `Für den Angreifer ist das Passwort verdeckt. Sein Programm muss mögliche Passwörter erzeugen und prüfen, ob eines davon passt.` | Mechanismuserklärung | Stellt den Ausgangspunkt der Angreiferperspektive wieder her. | nein | `Weiter` | keine |
| `S05.intro.narration.randomSequence` | entfällt | `Völlig zufällige Folgen von Zeichen sind aber enorm schwierig für Menschen zu merken. Deswegen nutzen die meisten eine merkbare Kombination.` | Mechanismuserklärung | Stellt den Kontrast zwischen Zufallsfolge und merkbarer Kombination wieder her. | nein | `Weiter` | keine |
| `S05.intro.narration.recognizableCombination` | entfällt | `Bei diesem Passwort erkennt deine eigene Intuition wahrscheinlich schon einen Aufbau.` | Kerngedanke | Stellt die authored Beispielkombination wieder her. | nein | `Weiter` | keine |
| `S05.intro.narration.buildingBlocks` | entfällt | `Vereinfacht kannst du dir Passwörter wie mehrere aneinandergesetzte Bausteine vorstellen.` | Mechanismuserklärung | Stellt das vereinfachte Bausteinmodell wieder her. | nein | `Weiter` | keine |
| `S05.intro.narration.strategyTargeting` | entfällt | `Angreifer kennen diese Bausteine noch nicht.` / `Einige Passwortteile sind aber wahrscheinlicher als andere, da Menschen oft naheliegende Bestandteile verwenden oder ihr Passwort vorhersehbar aufbauen, um es sich leichter zu merken.` | Mechanismuserklärung | Stellt die Brücke von Bausteinen zu wahrscheinlichen Kandidaten wieder her. | nein | `Weiter` | keine |
| `S05.intro.narration.strategyOverview` | entfällt | `Und dieses Wissen nutzen Angreifer aus. Wir schauen uns nun drei Strategien an, die Angreifer miteinander kombinieren, um dein Campusgram-Passwort herauszufinden. Als ersten Ausgangspunkt beginnen Angreifer mit Dingen, die bei vielen Menschen schon funktioniert haben.` | Mechanismuserklärung | Stellt die Vorschau der drei Strategien vor dem ersten Strategiebereich wieder her. | nein | `Weiter` startet den Kartenübergang | keine |

Die Zeichenfolgen und Bausteine sind weiterhin festgelegte Demonstrationen. Sie analysieren keine
Teilnehmereingaben und verändern weder Persistenz, Timing noch die begrenzte S05-Auswertung.

### Copy-Delta S05 Bausteinmodell und Kategoriefluss 3. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 3. August 2026. Die Änderung vereinheitlicht die
Darstellung naheliegender Bestandteile mit dem zu Beginn von S05 eingeführten Bausteinmodell,
entfernt den redundanten Kategorie-Zwischenschritt und führt direkt zur vorhandenen
Variantenmaschine. `S05_CONTENT_VERSION` wird von `2.10.0` auf `2.11.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S05.intro.strategyAnnotations.probability` | Nutzerauftrag vom 2026-08-03 | `Wahrscheinlichkeit ↑` | `sehr häufig` | Mechanismuserklärung | Das Label benennt die qualitative Häufigkeit direkt und ohne abstrakten Wahrscheinlichkeitsbegriff. | nein | kein | am authored Baustein `Passwort` |
| `S05.intro.narration.componentCategoryOverview` | Nutzerauftrag vom 2026-08-03 | `Bestimmte Bestandteile – und sehr häufige vollständige Passwörter wie „123456789“ – kann er früh abgleichen. Diese Idee lässt sich in vier Kategorien aufteilen.` | `Bestimmte Bestandteile – und sehr häufige vollständige Passwörter wie „123456789“ – kann er früh abgleichen.` / `Somit kommen wir zur 1. von 4 Kategorien: Die häufigen Kerne.` | Mechanismuserklärung / Orientierung | Der vollständige Beispielwert wird mit dem statischen goldenen Kern verbunden; die vierteilige Kategorieanzeige wird im selben Schritt eingeführt. | ausdrücklich freigegeben | `Weiter` führt direkt zur Variantenmaschine | `123456789` als goldener Baustein |
| `S05.intro.narration.commonCoresIntro` | Nutzerauftrag vom 2026-08-03 | `Die erste Kategorie sind häufige Kerne.` | entfällt | Orientierung | Der separate Sprechschritt wiederholt die unmittelbar zuvor sichtbare Kategorieansage. | nein | entfällt | keine |

Die wechselnden Kandidaten bestehen aus unterschiedlich vielen und unterschiedlich langen,
maskierten hellblauen Bausteinen des vorhandenen S05-Bausteinsystems. Erst beim Beispiel
`123456789` stoppt der Wechsel und der sichtbare Kern leuchtet hellgelb; vorher bleibt jeder
Baustein blau. Der Kern bleibt
zwischen zwei maskierten hellblauen Bausteinen stehen. Die Kategorieanzeige zeigt `1. Häufige Kerne` mit dem
vorhandenen Logo und drei noch verdeckte Kategorien. Beim zugehörigen Sprechschritt pulsiert die
aktive Karte warmgelb. Ihre wiederverwendbare Übergangsebene beginnt exakt an der tatsächlichen
Kartenposition und vergrößert eine isolierte Karte proportional und unverzerrt vor einem separat
einblendenden neutral-dunklen Vollbildhintergrund. Sie hält Logo und Namen zwei Sekunden mittig,
blendet beides aus und führt erst danach zur
Variantenmaschine. Es werden keine neuen Bildassets eingeführt. Die zuvor sichtbare, durchgehend
wechselnde Zufallsfolge bleibt ohne Opacity-Wechsel bis zum Beispiel
`MeinStarkesUniPasswort2005!` an der festen
Kandidatenposition in der Angreiferszene. Dessen Bausteinübergang hält Schriftgröße und Position,
markiert zuerst die Grenzen in derselben Zeichenfolge, trennt danach die Teile und entfernt den
gemeinsamen Hintergrund. Die Verbindungslinie bei `Satzbau` endet an den Mittelpunkten des ersten
und vierten Bausteins. Diese Visuals bleiben presentation-only und ändern keine Analyse.

Das ergänzende visuelle Delta vom 3. August 2026 erhöht `S05_CONTENT_VERSION` von `2.11.0` auf
`2.12.0`. Es verändert keinen Teilnehmertext und keine Analyseentscheidung.

### Copy-Delta S05 vierstufige Offenlegung naheliegender Bestandteile 3. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 3. August 2026. Die Änderung ersetzt ausschließlich
die bisherige participant-facing Folge innerhalb der ersten Strategie. Analyse, vollständiger
Rateweg, Längenorientierung, `simulationDisposition`, Persistenz und die nachfolgende Strategie
`Vorhersehbarer Aufbau` bleiben unverändert. `S05_CONTENT_VERSION` wird von `2.12.0` auf `2.13.0`
erhöht.

| Segment und Text-ID | Aktueller Text / Verhalten | Neuer Text / Verhalten | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.componentStrategy.categories` | `Häufige Kerne`, `Persönliche Angaben`, `Konto-Kontext`, `Typische Veränderungen`; spätere Kategorien zunächst verdeckt | `Häufig gewählte Bestandteile`, `Persönliche Angaben`, `Kontobezug`, `Typische Veränderungen`; vier dauerhaft sichtbare Statuskarten | Orientierung | ausdrücklich freigegebene Hierarchie und feste Reihenfolge | Karten sind nur in der Zusammenfassung als Befundfilter bedienbar; Symbol, Text und Rahmen tragen den Zustand gemeinsam |
| `S05.componentStrategy.commonComponents.*` | Variantenmaschine erklärt typische Veränderungen bereits vor der ersten lokalen Anwendung | Die vier ausdrücklich vorgegebenen Erklärungs-, Ergebnis- und Übergangstexte; Veränderungen bleiben bis Kategorie 4 verdeckt | Mechanismuserklärung / Ergebnisfeedback / Navigation | fachliche Trennung einzelner häufiger Bestandteile von später offengelegten Veränderungen; ausdrücklich freigegeben | `Passwort prüfen` führt lokale Analyseabrufung, Reveal und einmalige kanonische Segmentierung gemeinsam aus |
| `S05.intro.campusgramPassword.localNotice` | allgemeine Simulationsgrenze an der Seite | `Fiktives Passwort · wird nur lokal ausgewertet` direkt am Passwort | Safety Boundary | Datenschutzgrenze an der konkreten Offenlegung; begrenzte Bedeutungsänderung | Augen-Umschalter ändert ausschließlich die Zeichenmaskierung |
| `S05.componentStrategy.personalDetails.*` | persönliche Bedeutung zusammen mit Thema und Satz/Phrase erst in der Strukturanwendung | Die ausdrücklich vorgegebenen Erklärungs-, Auswahl-, Ergebnis- und Übergangstexte; ausschließlich vorhandene Bausteine, `Kein Bestandteil …` oder `Unsicher` | Mechanismuserklärung / Ergebnisfeedback | persönliche Bedeutung darf nur aus lokaler Nutzerzuordnung stammen; Thema und Satzstruktur verbleiben in Strategie 2 | Mehrfachauswahl vorhandener Bausteine; keine Freitexteingabe, kein Export, keine Forschungsvariable |
| `S05.componentStrategy.accountContext.*` | allgemeine Karte `Konto-Kontext` und spätere Strukturbeziehung | Die ausdrücklich vorgegebenen Campusgram-Erklärungs-, Ergebnis- und Übergangstexte | Mechanismuserklärung / Ergebnisfeedback | exakte Offenlegung ausschließlich aus dem eingefrorenen Kontextlexikon; ausdrücklich freigegeben | `Im Passwort prüfen`; Kontobefunde erhalten Symbol und Textlabel |
| `S05.componentStrategy.typicalChanges.*` | Veränderungen werden in der ersten Unterkategorie erklärt und zusätzlich später als Bestandteil ausgegeben | Die ausdrücklich vorgegebenen Erklärungs-, Ergebnis- und Übergangstexte; gebundene Overlays für Großschreibung, Ersetzung, Zahlen-/Jahres-/Symbolanhang | Mechanismuserklärung / Ergebnisfeedback | Veränderungen sind keine gleichwertigen Inhaltsbausteine und werden bewusst zuletzt offengelegt; ausdrücklich freigegeben | `Veränderungen prüfen`; Klammer-/Linienmarker bindet die Änderung an Grundbestandteil oder gesamte Zeichenfolge |
| `S05.componentStrategy.summary.*` | direkte Übergabe von einer kompakten Kernkarte an `Persönliche Angaben` | eigene Abschlussansicht mit vier gespeicherten Karten, gemeinsamer Bausteinansicht und den ausdrücklich vorgegebenen dynamischen Abschlusstexten | Kerngedanke / Navigation | gemeinsame, scorefreie Zusammenführung vor Strategie 2; ausdrücklich freigegeben | Kategorienkarte filtert nur die Hervorhebung; `Weiter zum Aufbau` führt zu `Vorhersehbarer Aufbau` |

Die vier Unterprüfungen erzeugen ausschließlich flüchtigen lokalen Präsentationszustand. Zeichen,
erkannte Wörter, persönliche Einordnungen, Kontobezüge, Transformationen und Kategorienergebnisse
werden nicht gespeichert oder exportiert. Mehrere Befunde werden nur als einzelne Ausgangspunkte
benannt; Thema, Satzstruktur, Wiederholung, sprachliche Fortsetzung und Beziehungen mehrerer Wörter
werden in dieser Strategie weder erklärt noch bewertet.

### Copy-Delta S05 wiederhergestellter Übergang zu häufig gewählten Bestandteilen 3. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 3. August 2026. Vor der tatsächlichen Unterprüfung
`Häufig gewählte Bestandteile` wird der zuvor entfernte dreistufige Übergang aus wechselnden
verdeckten Bausteinen, festem häufigem Beispielbestandteil und vergrößernder Kategorienkarte
wiederhergestellt. Die Benennung `Häufige Kerne` kehrt nicht zurück. `S05_CONTENT_VERSION` wird von
`2.13.0` auf `2.14.0` erhöht.

| Segment und Text-ID | Aktueller Text / Verhalten | Wiederhergestellter Text / Verhalten | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.intro.narration.componentStartQuestion` | direkter Einstieg in die erste Unterprüfung | `Die Strategie beginnt mit der Frage: Bei welchen Bestandteilen soll der Angreifer anfangen?` | Mechanismuserklärung | dramaturgische Wiederherstellung; keine fachliche Änderung | `Weiter`; wechselnde verdeckte Bausteine |
| `S05.intro.narration.componentFrequency` | entfällt | `Er könnte alle Zeichenfolgen, Wörter und Begriffe der Welt ausprobieren. Aber nicht alle Bestandteile werden in Passwörtern gleich häufig verwendet.` | Mechanismuserklärung | erklärt die Auswahl wahrscheinlicher Bestandteile vor der Kategorie | `Weiter`; derselbe stabile Animationsraum |
| `S05.intro.narration.componentCategoryOverview` | entfällt | `Bestimmte Bestandteile – und sehr häufige vollständige Passwörter wie „123456789“ – kann er früh abgleichen.` / `Somit kommen wir zur 1. von 4 Kategorien: Häufig gewählte Bestandteile.` | Mechanismuserklärung / Orientierung | alte Übergangsfunktion mit neuer freigegebener Benennung | `Weiter` startet den vergrößernden Kartenübergang; `123456789` bleibt der feste hervorgehobene Beispielbestandteil |
| `S05.componentStrategy.commonComponents.explanation[0]` | erster Satz der Unterprüfung | unverändert `Angreifer beginnen häufig mit Passwörtern und Bestandteilen, die viele Menschen bereits verwendet haben.` | Mechanismuserklärung | markiert weiterhin eindeutig den Beginn der tatsächlichen Unterprüfung nach dem Übergang | `Passwort prüfen` bleibt erst am Ende dieser Erklärung verfügbar |

Der Übergang analysiert keine Teilnehmerdaten und erzeugt keine Kategorienbefunde. Kanonische
Segmentierung, Reveal und erste Befundspeicherung beginnen weiterhin ausschließlich mit
`Passwort prüfen` innerhalb von `Häufig gewählte Bestandteile`.

### Copy-Delta S05 querschnittliche Veränderungen und Laufbandmaschine 3. August 2026

Quelle sind der ausdrückliche Nutzerauftrag vom 3. August 2026, das bestehende S05-Bausteinmodell
und `ADR 0014-Bounded-Password-Guessing`. Typische Veränderungen bleiben als vierter sichtbarer
Prüfschritt erhalten, werden aber als querschnittliche Veränderung der drei Bestandteilarten
dargestellt. `S05_CONTENT_VERSION` wird von `2.14.0` auf `2.15.0` erhöht.

| Segment und Text-ID | Aktueller Text / Verhalten | Neuer Text / Verhalten | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S05.intro.campusgramPassword.localNotice` | `Fiktives Passwort · wird nur lokal ausgewertet` erscheint wiederholt am Passwort | entfällt; die bestehende einmalige Simulationsgrenze auf der Seite bleibt erhalten | Safety Boundary | ausdrücklich freigegebene Entfernung redundanter Copy | ausdrücklich freigegeben | kein | keine |
| `S05.intro.narration.componentCategoryOverview[1]` | `Somit kommen wir zur 1. von 4 Kategorien: Häufig gewählte Bestandteile.` | `Somit kommen wir zur ersten von drei Arten naheliegender Bestandteile: Häufig gewählte Bestandteile.` | Orientierung | trennt drei Quellen von der querschnittlichen Veränderungsprüfung | ausdrücklich freigegeben | `Weiter` | keine |
| `S05.componentStrategy.commonComponents.explanation` | vier Absätze in einem Sprechschritt | fünf einzelne Sprechschritte; bestehende Absätze bleiben erhalten und der freigegebene Satz zu Großschreibung, ersetzten Zeichen sowie Zahlen- oder Symbolanhängen wird ergänzt | Mechanismuserklärung / Navigation | ein Hauptgedanke und ein sichtbarer Maschinenzustand pro Schritt | ausdrücklich freigegeben | viermal `Weiter`, danach `Passwort prüfen` | jeweils der aktive Laufbandbaustein |
| `S05.componentStrategy.commonComponents.machine` | keine sichtbare Maschine | `passwort`, `123456789` und `admin` laufen einzeln durch eine Variantenmaschine in eine wachsende Liste typischer Veränderungen | Mechanismuserklärung | bindet die Erklärung an einen deterministischen sichtbaren Ablauf | ausdrücklich freigegeben | kein | aktiver Baustein |
| `S05.componentStrategy.presentation.categoriesAriaLabel` | `Vier Kategorien naheliegender Bestandteile` | drei Arten naheliegender Bestandteile plus querschnittliche Prüfung typischer Veränderungen | Orientierung | barrierefreie Benennung der neuen Hierarchie | ausdrücklich freigegeben | kein | keine |
| `S05.componentStrategy.summary.*` | alle vier Prüfschritte werden als gleichartige Kategorien zusammengefasst | drei Bestandteilarten werden zuerst genannt; typische Veränderungen erscheinen gegebenenfalls als gebundener Zusatzbefund | Kerngedanke | verhindert die Gleichsetzung einer Veränderung mit einem Grundbestandteil | ausdrücklich freigegeben | `Weiter zum Aufbau` | keine |

Die vier Karten bleiben ab ihrer gemeinsamen Offenlegung dauerhaft als obere Statusleiste sichtbar.
Das Campusgram-Passwort bleibt in jeder der vier Prüfungen zentriert. Persönliche Bedeutung wird
weiterhin ausschließlich lokal eingeordnet und nicht automatisch aus der Zeichenfolge behauptet.
Das neue QA-Beispiel `s05-all-categories` liefert automatische Befunde für häufige Bestandteile,
Kontobezug und typische Veränderungen; die vierte Karte wird ausschließlich durch die lokale
persönliche Einordnung bestätigt.

### Copy-Delta S05 gemeinsame Bausteinprüfung und verbindende Veränderungsebene 3. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 3. August 2026. Die Änderung vereinheitlicht die
Passwortprüfung mit dem bereits für `MeinStarkesUniPasswort2005!` eingeführten Bausteinsystem und
ordnet die querschnittlichen Veränderungen oberhalb der drei Bestandteilarten ein.
`S05_CONTENT_VERSION` wird von `2.15.0` auf `2.16.0` erhöht.

| Segment und Text-ID | Aktueller Text / Verhalten | Neuer Text / Verhalten | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S05.componentStrategy.presentation.canonicalAriaLabel` und Passwortdarstellung | separate umrahmte Overall-Ansicht mit eigenem Baustein- und Markierungssystem | zentriertes Campusgram-Passwort wird beim Prüfen im vorhandenen `PasswordBuildingBlocks`-System offengelegt und segmentiert; betroffene Bausteine leuchten je Prüfart | Ergebnisfeedback | eine gemeinsame visuelle Grammatik für Beispiel und Prüfung; ausdrücklich freigegeben | nein | Augen-Umschalter bleibt am zentralen Passwort | aktive Befunde leuchten zusätzlich zu Farbe über Kontur und Helligkeit |
| `S05.componentStrategy.categories[0..2]` und `S05.page.title` | Titel oberhalb einer vierteiligen Kartenleiste | `Naheliegende Bestandteile` steht mittig links; die drei Bestandteilkarten stehen rechts daneben | Orientierung | Titel und Statushierarchie werden in einer gemeinsamen oberen Leiste lesbar | nein | Zusammenfassungsfilter bleiben auf den drei Bestandteilkarten | Text, Symbol, Rahmen und Status tragen den Zustand gemeinsam |
| `S05.componentStrategy.categories[3]`, `presentation.crossCuttingLabel` und Statusdarstellung | vierte umrahmte Karte `Typische Veränderungen` mit Zusatztext `betrifft alle drei Arten`, Status, Befundchips und Zusammenfassungsaktion | keine vierte Karte; nur `Typische Veränderungen` und das große bestehende Symbol liegen mittig über den drei Karten, Verbindungslinien zeigen die Wirkung auf alle drei Arten | Orientierung / Mechanismuserklärung | Veränderungen sind eine querschnittliche Prüfung und keine vierte Bestandteilart; ausdrücklich freigegeben | nein | kein eigenes Kartenziel | Symbol und verbindende Linien visualisieren den Querschnitt |

Die Prüfentscheidung, die vierte zeitliche Prüfphase und ihre flüchtigen lokalen Befunde bleiben
unverändert. Entfernt werden ausschließlich die parallele Overall-Darstellung und die visuelle
Gleichordnung der Veränderungsprüfung mit den drei Bestandteilarten. Es werden keine neuen
persistierten Felder oder Analysebehauptungen eingeführt.

### Copy-Delta S04/S05 neuer Angreiferübergang und häufig verwendete Passwörter 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Er ersetzt die S04-Brücke und den
Einstieg des ersten S05-Prüfbereichs. Die späteren Prüfbereiche, die fachliche Analyse,
Persistenz, Timing, `simulationDisposition`, `Vorhersehbarer Aufbau` und `Freies Ausprobieren`
bleiben unverändert. `S04_CONTENT_VERSION` wird von `1.6.0` auf `1.7.0` und
`S05_CONTENT_VERSION` von `2.16.0` auf `2.17.0` erhöht.

| Segment und Text-ID | Aktueller Text / Verhalten | Neuer Text / Verhalten | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S04.notice.paragraphs`, `continueLabel` | dreiteilige Erklärung mit Offline-Prüfung und `Angreifer Perspektive` | ausdrücklich vorgegebener kurzer Datenleck- und Perspektivübergang; Button `Angreiferperspektive` | Orientierung / Navigation | dramaturgische Straffung; ausdrücklich freigegeben | Button startet S05; `Datenleck` bleibt Warnhervorhebung |
| `S05.intro.narration.candidateCheck` bis `strategyTargeting` | bisherige Kandidaten-, Merk- und Bausteinerklärung | ausdrücklich vorgegebene Sätze zu verdecktem Passwort, allen denkbaren Zeichenfolgen, merkbaren Elementen, vereinfachten Bausteinen und kombinierenden Angreiferversuchen | Mechanismuserklärung | neuer Skriptablauf; ausdrücklich freigegeben | je `Weiter`; sichtbare Animation trägt den jeweiligen Zustand |
| `S05.intro.strategyOverview`, `componentStartQuestion`, `componentFrequency` | drei Strategiekarten und zusätzlicher dreistufiger Kategorienvorlauf | entfällt; direkter Sprung von der annotierten Bausteinansicht zur festen Angreiferansicht und zum ersten Ausgangspunkt | Orientierung | nach Nutzerauftrag redundante Zwischenzustände entfernen; ausdrücklich freigegeben | `Weiter` führt direkt zum neuen Ausgangspunkt |
| `S05.page.title`, `componentStrategy.categories[0]` und zugehörige sichtbare Benennungen | `Naheliegende Bestandteile` / `Häufig gewählte Bestandteile` | `Häufig verwendete Passwörter und Zeichenfolgen` | Orientierung | ausdrücklich verlangte einheitliche Bezeichnung | erste Statuskarte ist sichtbar; spätere Karten zeigen zunächst nur Symbol und `?` |
| `S05.componentStrategy.commonComponents.explanation` | fünf Erklärungen zur bisherigen Laufbandmaschine | vier ausdrücklich vorgegebene Schritte zu verbreiteten Passwörtern und Folgen, Wörtern, typischen Veränderungen und anschließender Prüfung | Mechanismuserklärung / Navigation | Text und sichtbare Maschinenzustände werden synchronisiert; ausdrücklich freigegeben | dreimal `Weiter`, dann `Passwort prüfen` |
| `S05.componentStrategy.commonComponents.machine` | drei nacheinander aktive Basen mit durchgehendem Laufband hinter der Box | kontinuierlicher Bausteinstrom, `passwort` in der mittigen Logo-Box, Trichter und umfangreiche feste Variantenliste | Mechanismuserklärung | ausdrücklich verlangte visuelle Neuordnung; keine neue Analyse | aktiver Baustein zusätzlich zu Farbe durch Kontur und Helligkeit markiert |
| `S05.componentStrategy` Passwortdarstellung | vor dem ersten Prüfklick verdeckt; Befundlabels beeinflussen die Bausteinhöhe | kanonische Bausteine bereits unverdeckt; gleich hohe neutrale Bausteinflächen, Befundtexte darunter, nur betroffene Bausteine leuchten | Ergebnisfeedback | ausdrücklich verlangte gemeinsame Prüfdarstellung; keine neue Analyseentscheidung | `Passwort prüfen`; Kontur und Helligkeit ergänzen Farbe |

Die Systempasswort-Zufallsfolge verwendet für diese Angreiferansicht einen roten statt grünen
Hintergrund. Die ausblendende Kategorieübergabe ist bei `prefers-reduced-motion` nicht animiert und
gibt den stabilen Endzustand unmittelbar frei. Zeichenfolgen, Varianten und Befundtexte bleiben
fest authored beziehungsweise aus der bereits begrenzten lokalen Analyse abgeleitet; es werden
keine Teilnehmerwerte gespeichert oder exportiert.

### Visuelles Delta S05 synchronisierte Laufbandmaschine und Kreuzbedingung 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Teilnehmertext, fachliche Analyse,
Persistenz, Timing und die Reihenfolge der vier lokalen Prüfphasen bleiben unverändert.
`S05_CONTENT_VERSION` wird von `2.17.0` auf `2.18.0` erhöht.

| Betroffener Zustand | Vorher | Nachher | Rolle / Grund |
|---|---|---|---|
| erste Kandidatenansicht | eigene kurze Fehlversuchslogik mit wechselnder Länge und `passt nicht` | dieselbe rote, zeichenweise wechselnde Systempasswort-Demonstration wie im folgenden Schritt | einheitliche Mechanismuserklärung; ausdrücklich freigegeben |
| Kategorieübergabe | 2,4 Sekunden mit kurzer Ausblendung | 5,6 Sekunden mit weichem Einblenden, Haltezustand und langsamer Ausblendung | Orientierung; geringere visuelle Härte |
| Laufband und Listen | mehrere unverbundene Bausteine laufen nach links; feste `passwort`-Varianten | ein lesbarer Baustein läuft von links zur Mitte; die rechte Liste wechselt bei seiner Ankunft zu deterministisch erzeugten Großschreibungs-, Ersetzungs-, Zahlen- und Symbolvarianten | authored Mechanismuserklärung; keine Passwortbewertung |
| Maschinenlayout | große gemeinsame Umrandung, breite Ein-/Ausgabelisten und beschriftete mittlere Box | keine gemeinsame Umrandung; höhere schmale Listen mit ausblendender Fortsetzung; kleinere mittlere Box mit größerem, leicht nach rechts versetztem Logo ohne Text | ausdrücklich freigegebene visuelle Hierarchie |
| Kategorienstatus | vier gleichartige Karten | drei Bestandteilkarten plus `Typische Veränderungen` als verbindende Kreuzbedingung mit Linien | stellt die querschnittliche Funktion wieder her; die bestehende vierte Prüfentscheidung bleibt erhalten |

Die Variantengenerierung ist eine deterministische presentation-only Demonstration für die
festen Maschinenbausteine. Sie wird nicht für das fiktive Campusgram-Passwort verwendet, erzeugt
keinen Analysebefund und wird weder gespeichert noch exportiert. Bei `prefers-reduced-motion`
bleiben jeweils ein stabiler Baustein und seine zugehörige Variantenliste sichtbar.

### Copy-Delta S05 reduzierte Kopfleiste und adaptive Komponentenrückmeldung 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Die Änderung strafft die
Einleitungs- und Statusdarstellung, präzisiert zwei Mechanismussätze und bindet die Rückmeldung der
ersten lokalen Prüfung an die tatsächlich erkannten Bausteinwerte. Persistenz, Timing und die
Analysekategorien bleiben unverändert. `S05_CONTENT_VERSION` wird von `2.18.0` auf `2.19.0`
erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.page.introTitle` und Kopfbereich | `Wie der Angreifer dein Passwort rät` mit durchgängiger Kopfleiste | Einleitung ohne Seitentitel und Kopfleiste; die Statusleiste erscheint erst mit den Kategorien | Orientierung | ausdrücklich freigegebene visuelle Straffung | kein |
| `S05.intro.narration.candidateCheck[1]` | `Grundsätzlich könnte es jede denkbare Zeichenfolge ausprobieren.` | `Grundsätzlich könnte das Programm jede denkbare Zeichenfolge ausprobieren.` | Mechanismuserklärung | eindeutiger grammatischer Bezug; keine fachliche Änderung | `Weiter` |
| `S05.componentStrategy.commonComponents.explanation[2..3]` | Aufzählung einzelner Varianten und Prüfung auf `häufige Teile und typische Veränderungen` | kompakte Erklärung von Großschreibung, Zeichenersetzung, ergänzten Zahlen oder Symbolen und anschließende Prüfung auf häufig verwendete Passwörter und Zeichenfolgen | Mechanismuserklärung / Navigation | ausdrücklich vorgegebene Formulierung und Trennung der späteren querschnittlichen Prüfung | `Weiter`, danach `Passwort prüfen` |
| `S05.componentStrategy.commonComponents.results` | generische Anzahl früh geprüfter Bestandteile | Rückmeldung nennt die tatsächlich erkannten Bausteine. Bei genau einem Passwortbaustein, der erkannt wurde, wird ausdrücklich erklärt, dass der Angreifer den Passwortkandidaten bereits gefunden hätte; ansonsten bleibt die Einordnung als Ausgangspunkt erhalten. | Ergebnisfeedback / Safety Boundary | unterscheidet Teilbefund und vollständigen lokalen Treffer; ausdrücklich freigegeben | erkannte Bausteine leuchten und tragen ihren Befundtext unterhalb |
| Kategorienstatus und kanonisches Passwort | `aktuell`, zusätzlicher Querschnittsstatus und Verbergen-Schalter | kein aktueller Statustext, kein Zusatzsatz über dem Kreuz und kein Verbergen-Schalter; `Campusgram-Passwort` steht mittig über den sichtbaren Bausteinen | Orientierung / Ergebnisfeedback | reduziert redundante UI-Texte und verhindert Lagewechsel markierter Bausteine | Kontur, Helligkeit und Befundtext ergänzen Farbe |
| Laufbandvarianten | längerer Abstand und statische Variantenliste | neuer Baustein alle zwei Sekunden; Varianten beginnen mit Großschreibung und Zeichenersetzung, wechseln anschließend Zahlen und Symbole ab und scrollen fortlaufend | Mechanismuserklärung | macht die Bandbreite der authored Beispielvarianten besser sichtbar | kein |

Die Rückmeldung verwendet ausschließlich die bereits flüchtig im S05-Controller vorliegenden
Baustein- und Befunddaten. Sie erzeugt keine zusätzliche Passwortbewertung und wird nicht
gespeichert oder exportiert.

### Visuelles Delta S05 kompakte Maschinen- und Kategorienansicht 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Wortlaut, Analyse, Persistenz,
Timing und Prüfentscheidungen bleiben unverändert; die Änderungen sind presentation-only und
erfordern deshalb keine neue Content-Version.

| Betroffener Zustand | Vorher | Nachher | Rolle / Grund |
|---|---|---|---|
| Laufband und aktive Bausteine | beschleunigender und abbremsender Lauf; sehr helle Aktivflächen | konstante lineare Geschwindigkeit und dunklere, durch Kontur und Leuchten ergänzte Aktivflächen | Mechanismuserklärung und Lesbarkeit |
| Maschinenlayout | langer rechter Trichter, nach rechts versetzte Maschinenmitte und überlagernde Sprechblase | kürzerer Trichter, mittige und höher stehende Maschine sowie kollisionsbewusste schmalere Sprechblase | visuelle Zuordnung ohne Überdeckung |
| Kategorienkopf | große Karten mit seitlichem Symbol, Statustexten und sichtbarem Abstand in den Verbindungslinien | kompakte Karten mit großem zentriertem Symbol, Bezeichnung darunter, geschlossenem Verbindungskreuz und horizontaler Veränderungsmarke | Orientierung und ruhigere Hierarchie |
| Kategorienbefunde | generische Status- und Befundbezeichnungen | bereits flüchtig erkannte Bausteinwerte erscheinen als kleine leuchtende Chips in der zugehörigen Karte | Ergebnisfeedback ohne neue Analyse |
| S05-Sprechhervorhebung | keine bildliche Referenzauflösung für die beiden Maschinenbegriffe | `typische Veränderungen` sowie `häufig verwendete Passwörter und Zeichenfolgen` werden bei ihrer Erwähnung blau hervorgehoben und erhalten ihr verkleinertes Kategoriesymbol vor der Phrase | presentation-only Kerngedanke; genau eine Hervorhebung pro betroffenem Sprechschritt |

### Copy-Delta S05 kompakte Kategorienleiste und präzisierte Befundbegriffe 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Die fachlichen Prüfkategorien,
Analysegrenzen, Persistenz, Timingfolge und Interaktionsziele bleiben unverändert.
`S05_CONTENT_VERSION` wird von `2.19.0` auf `2.20.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.componentStrategy.commonComponents.explanation[0]` | allgemeine Aufzählung weit verbreiteter Passwörter, Wörter, Folgen und Jahreszahlen | ausdrücklich vorgegebene Erklärung mit den Beispielen `123456` und `qwertz` | Mechanismuserklärung | konkretisiert die sichtbaren authored Laufbandbeispiele; ausdrücklich freigegeben | `Weiter`; keine zusätzliche Hervorhebung |
| `S05.componentStrategy.commonComponents.explanation[2]` | kurzer Satz zu Veränderungen und allgemeiner zweiter Absatz | ausdrücklich vorgegebene zweigeteilte Erklärung zu ursprünglicher Schreibweise, Großschreibung, Zeichenersetzung, Zahlen oder Symbolen sowie der Anwendung auf Bestandteile, Verbindungen und zusammengesetzte Kandidaten | Mechanismuserklärung | präzisiert die querschnittliche Wirkung der sichtbaren Variantenmaschine; ausdrücklich freigegeben | `Weiter`; `typischen Veränderungen` mit verkleinertem Kategoriesymbol |
| `S05.componentStrategy.presentation.findingChips` für häufige Bestandteile | generischer Befund `verbreiteter Passwortbestandteil` sowie allgemeine Folgenbezeichnungen | je nach vorhandenem lokalen Befund `häufig verwendetes Passwort`, `häufig verwendetes Wort`, `Tastaturfolge`, `Zahlenfolge` oder `naheliegende Jahreszahl` | Ergebnisfeedback | benennt die bereits erkannte Befundart statt eines Sammelbegriffs; ausdrücklich freigegeben | Text unter dem betroffenen Baustein; keine neue Analyseentscheidung |
| obere Kategorienleiste während Einzelprüfungen | drei Karten und verbindende Veränderungsebene bleiben gleichzeitig sichtbar | ausschließlich großes aktuelles Kategoriesymbol und Titel ohne Box; die vollständige kompakte Kartenansicht erscheint in der gemeinsamen Übersicht | Orientierung | reduziert visuelle Konkurrenz und schafft mehr Platz für die aktive Prüfung | kein neues Interaktionsziel |
| Karten- und Maschinenlayout | höhere Karten, kleinere Symbole und mittige Maschine | rund 20 Prozent niedrigere Karten, rund 50 Prozent größere Symbole, nach oben versetzte Kategorien sowie Maschine; Eingabe, Maschinenkörper und anschließender Trichter rücken nach rechts bis zur Variantenliste | Orientierung / Mechanismuserklärung | ausdrücklich verlangte räumliche Neuordnung | bestehende Kontur-, Text- und Symbolzustände bleiben erhalten |

Die neuen Befundtexte werden weiterhin ausschließlich aus den bereits vorhandenen flüchtigen
S05-Findings abgeleitet. Es werden keine Teilnehmerwerte ergänzt, gespeichert oder exportiert.

### Copy-Delta S05 einheitliche Kategorienleiste und direkte persönliche Einordnung 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Analysegrenzen, Persistenz,
Timingfolge und die vier bestehenden Prüfentscheidungen bleiben unverändert.
`S05_CONTENT_VERSION` wird von `2.20.0` auf `2.21.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.componentStrategy.categories[2].title` und zugehörige Prüfung | `Kontobezug` | `Bezug zum Konto und Umfeld` | Orientierung | ausdrücklich verlangte präzisere Kategoriebezeichnung | bestehende automatische lokale Prüfung; keine neue Analyse |
| `S05.componentStrategy.personalDetails.explanation` | zwei Erklärungen und allgemeine Aufforderung zur Einordnung | drei ausdrücklich vorgegebene Schritte zu Merkbarkeit, möglicher Ableitbarkeit und der Grenze des Trainingsmoduls mit anschließender manueller Auswahl | Mechanismuserklärung / Safety Boundary / Navigation | trennt Angreiferwissen von der begrenzten lokalen Einordnung; ausdrücklich freigegeben | `Bausteine einordnen`; `Persönliche Angaben` erhält das verkleinerte Kategoriesymbol |
| `S05.componentStrategy.personalDetails.applyNone`, `apply` | Übernahme erst nach Auswahl von `Kein Bestandteil` oder `Unsicher` möglich | immer aktive Aktion; ohne markierten Baustein `Keine Persönliche Angabe`, sonst `Einordnung übernehmen` | Navigation / Ergebnisfeedback | direkte, reversible Auswahl ohne zusätzliche große Fragefläche | Button schließt die lokale Einordnung ab |
| persönliche Bausteinauswahl | separate umrahmte Fragenfläche mit duplizierten Bausteinen, Gruppierung und Alternativoptionen | kanonische Bausteine selbst sowie ihre darunterliegenden Checkboxen markieren und entmarkieren denselben Zustand | Navigation | reduziert parallele Darstellungen und bindet die Entscheidung direkt an das Passwort | Klick auf Baustein oder Checkbox; Auswahl bleibt flüchtig |
| Kategorienleiste und Gesamtansicht | Einzelprüfung zeigt nur ein großes Kategoriesymbol; Gesamtansicht besitzt Befundfilter | identische kompakte Kartenansicht in allen Prüfungen; aktuelle Kategorie leuchtet einzeln, am Ende leuchten alle Karten; Befundfilter entfällt | Orientierung / Ergebnisfeedback | stabilisiert die räumliche Zuordnung | keine Kartenaktion |
| Kategorienmaschine | Laufbandmaschine ausschließlich für häufig verwendete Passwörter und Zeichenfolgen | dieselbe Maschine für alle Kategorien; linke authored Beispieltabelle und großes Kategoriesymbol wechseln mit der aktiven Prüfung | Mechanismuserklärung | ausdrücklich verlangte Wiederverwendung der bestehenden Darstellung | keine neue Analyse oder Teilnehmerableitung |
| PassWo- und Passwortposition | Sprechblase oberhalb von PassWo; kanonisches Campusgram-Passwort weit oben | Sprechblase nur innerhalb der Kategorien rechts neben PassWo; Passwortgruppe vertikal in der verbleibenden Fläche zentriert | Orientierung / Navigation | verhindert unnötige Leerräume und hält die aktive Darstellung frei | Sprechblasenaktionen bleiben unverändert |

Die neuen Maschinentabellen bestehen ausschließlich aus festen redaktionellen Beispielen. Die
persönliche Auswahl verbleibt im vorhandenen lokalen Controller und wird weder gespeichert noch
exportiert.

### Copy-Delta S05 phasenabhängige Kategorienleiste und Generatorbeschriftung 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Analyse, Persistenz, Timing und
Prüfentscheidungen bleiben unverändert. `S05_CONTENT_VERSION` wird von `2.21.0` auf `2.22.0`
erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.componentStrategy.commonComponents.machine.generatorLabel` | mittleres Symbol ohne Beschriftung | `Typische Veränderungen generieren` im Maschinenkörper | Mechanismuserklärung | benennt die sichtbare Funktion des mittleren Maschinenteils; ausdrücklich freigegeben | kein |
| `S05.componentStrategy.personalDetails.machine.conveyorBlocks` | authored Beispiel `2005` | `Hochzeitstag` und zusätzlich `Abschlussjahr` | Mechanismuserklärung | passt die persönliche Beispieltabelle an den ausdrücklich gewünschten Kontext an | keine Teilnehmerableitung |
| Kategorienleiste während Erklärung und Auswahl | vollständige Drei-Karten-Ansicht in allen Kategoriephasen | aktueller Kategoriename mittig über dem großen Symbol; vollständige Kartenansicht erst im jeweiligen Ergebniszustand und in der Zusammenfassung | Orientierung | trennt Erklärung beziehungsweise Auswahl vom sichtbaren Prüfergebnis | keine Kartenaktion |
| Karten- und Kreuzlayout | sehr niedrige Karten; Kreuzbegriff durch vertikale Logoanordnung schwer lesbar | etwas höhere Karten; `Typische Veränderungen` und Symbol stehen gemeinsam mittig nebeneinander | Orientierung | verbessert Lesbarkeit und Gruppierung | aktuelle Kategorie beziehungsweise Gesamtzustand leuchtet |
| Variantenliste und persönliche Übernahme | langsamer Variantenstrom; Übernahme unmittelbar unter den Bausteinen | schnellerer linearer Variantenstrom; Übernahmeaktion erhält größeren vertikalen Abstand | Mechanismuserklärung / Navigation | erhöht sichtbare Dynamik und reduziert versehentliches Auslösen | Button bleibt jederzeit aktiv |
| persönliche Auswahlmarkierung | ausgewähltes interaktives Label konnte seine Bausteinfarbe verlieren | alle manuell ausgewählten Bausteine verwenden dieselbe Akzentfarbe mit stabiler Kontur | Ergebnisfeedback | Farbe, Kontur, Checkbox und Helligkeit tragen gemeinsam den Zustand | Baustein oder Checkbox schaltet die Auswahl |

`Hochzeitstag` und `Abschlussjahr` sind feste Demonstrationseinträge. Es werden weiterhin keine
realen persönlichen Angaben abgefragt oder gespeichert.

### Copy-Delta S05 Kategorieübergänge und präzisierte persönliche Einordnung 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Die fachlichen Analysegrenzen,
Persistenz, bestehenden Auswahlentscheidungen und die Reihenfolge der Prüfkategorien bleiben
unverändert. `S05_CONTENT_VERSION` wird von `2.22.0` auf `2.23.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.componentStrategy.commonComponents.explanation[2]` | ausführliche Wiederholung der Anwendungsorte typischer Veränderungen | `Und das sowohl bei einzelnen Bestandteilen als auch bei bereits zusammengesetzten Passwortkandidaten.` | Mechanismuserklärung | ausdrücklich verlangte Reduktion kognitiver Last; begrenzte Straffung | `Weiter`; bestehende Hervorhebung `typischen Veränderungen` |
| `S05.componentStrategy.personalDetails.opening`, `explanation` | drei Absätze in einer Sprechblase | Merk- und Geheimwirkung als eigener erster Sprechschritt; Ableitbarkeit und lokale Einordnungsgrenze im zweiten Schritt | Mechanismuserklärung / Safety Boundary | ausdrücklich verlangte dramaturgische Trennung | `Weiter`, danach `Bausteine einordnen`; `Persönliche Angaben` mit Kategoriesymbol |
| `S05.componentStrategy.presentation.findingChips.personalComponent`, `personalDetails.results` | Sammelbegriff `persönlich eingeordneter Bestandteil` und rein mengenbezogene Rückmeldung | `persönliche Angabe`; Rückmeldung nennt die flüchtig ausgewählten Werte und ordnet sie als bloßen Ausgangspunkt ein | Ergebnisfeedback | präzisiert die tatsächliche lokale Auswahl; ausdrücklich freigegeben | kein neues Interaktionsziel; Werte bleiben ausschließlich im bestehenden lokalen Zustand |
| `S05.componentStrategy.accountContext.opening`, `explanation` | allgemeiner Kontoausgangspunkt mit zusätzlicher Bestandteilseinordnung | zwei ausdrücklich vorgegebene Sprechschritte zu Campusgram sowie WLAN/Router/Fritzbox und anschließender Prüfung | Mechanismuserklärung / Navigation | konkretere Kontextbeispiele und echte `Weiter`-Trennung; ausdrücklich freigegeben | `Weiter`, danach `Im Passwort prüfen` |
| `S05.componentStrategy.accountContext.transition` | `Bestandteile oder die gesamte Zeichenfolge` | `Zum Schluss schauen wir, ob die gesamte Zeichenfolge typisch verändert wurde.` | Navigation | ausdrücklich verlangte Fokussierung der nächsten Prüfung | `Weiter` führt zu typischen Veränderungen |

Das bisherige 5,6-Sekunden-Vollbild-Fade wird durch ein gemeinsames Kategoriepanel ersetzt. Es
blendet kurz ein, bleibt zwei Sekunden stabil sichtbar und blendet kurz aus. Das Panel erscheint
vor `Häufig verwendete Passwörter und Zeichenfolgen`, `Persönliche Angaben` und `Bezug zum Konto
und Umfeld`. Während der Erklärung zeigt eine hohe obere Leiste den aktuellen Titel; das
Kategoriesymbol steht horizontal über PassWo. In der Drei-Karten-Ansicht rücken alle drei Logos
tiefer in ihre Karten. Bei `prefers-reduced-motion` wird der stabile Zielzustand weiterhin sofort
freigegeben.

### Copy-Delta S05 einheitliche Kategorienleiste und gestufte Erklärungen 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Analysegrenzen, Persistenz,
Auswahlzustand und Reihenfolge der drei Prüfkategorien bleiben unverändert.
`S05_CONTENT_VERSION` wird von `2.23.0` auf `2.24.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.intro.strategyAnnotations.personalDetail` | Annotation `Persönliche Angaben` | `Naheliegende Jahreszahl` | Orientierung | korrigiert die ausdrücklich benannte Annotation der sichtbaren Passwortdarstellung; ausdrücklich freigegeben | keine Interaktion |
| `S05.componentStrategy.personalDetails.derivation`, `explanation` | Ableitbarkeit und lokale Einordnungsgrenze gemeinsam in der zweiten Sprechblase | Ableitbarkeit als eigener zweiter Sprechschritt; lokale Einordnungsgrenze als dritter Schritt | Mechanismuserklärung / Safety Boundary | ein Hauptgedanke pro Sprechblase; ausdrücklich verlangt | zweimal `Weiter`, danach `Persönliche Angaben markieren`; im letzten Schritt werden `persönlichen Angaben` mit Kategoriesymbol hervorgehoben |
| `S05.componentStrategy.accountContext.opening`, `explanation` | Kategoriebegriff nur im zweiten Prüfsatz | beide Sprechschritte lösen den `Bezug zum Konto und Umfeld` ausdrücklich auf und heben ihn mit dem Kategoriesymbol hervor | Mechanismuserklärung / Navigation | stabile Referenz zwischen Titel, Symbol und Erklärung; begrenzte Umformulierung | `Weiter`, danach `Im Passwort prüfen` |
| `S05.componentStrategy.accountContext.results` | allgemeine Rückmeldung über einen oder mehrere erkannte Begriffe | nennt die tatsächlich flüchtig erkannten Passwortwerte und passt Singular beziehungsweise Plural an | Ergebnisfeedback | entspricht der sichtbaren lokalen Prüfung; ausdrücklich verlangt | keine neue Interaktion und keine Persistenz |
| `S05.componentStrategy.personalDetails.begin` | `Bausteine einordnen` | `Persönliche Angaben markieren` | Navigation | benennt die unmittelbar folgende Auswahl präzise | Button öffnet die vorhandene lokale Auswahl |

Die obere Einzelkategorienleiste besitzt nun unabhängig von Logo und Titellänge eine feste Höhe.
Der zentrierte Titel wird vergrößert dargestellt; das Logo bleibt auf PassWos horizontaler
Achse. Während `S05.commonComponents.explanation[2]` sichtbar ist, pulsiert ausschließlich die
rechte Box für typische Veränderungen mit einer klaren weißen Kontur und einem deutlich
sichtbaren weißen Leuchten. Bei `prefers-reduced-motion` bleibt die Box statisch hervorgehoben.

### Copy-Delta S05 Varianten ohne redundante Kategorie 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Typische Veränderungen bleiben
innerhalb der vorhandenen Variantenmaschine erklärt, werden im Ergebnis aber nicht länger als
vierte Kategorie wiederholt. `S05_CONTENT_VERSION` wird von `2.24.0` auf `2.25.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.componentStrategy.categories`, `S05.typicalChanges.*` | drei Bestandteilskategorien plus separate Kategorie, Erklärung und Prüfung `Typische Veränderungen` | ausschließlich die drei Bestandteilskategorien; erkannte Varianten werden direkt an ihren Grundbestandteil gebunden | Orientierung / Ergebnisfeedback | entfernt die ausdrücklich benannte Wiederholung und stellt Variante und Ursprung als einen Befund dar; ausdrücklich freigegeben | die drei bestehenden Prüfaktionen bleiben; die separate Aktion `Veränderungen prüfen` entfällt |
| `S05.componentStrategy.presentation.findingChips.typicalVariant` | einzelne Labels für Ersetzung, Zahlenfolge und Symbolanhang | `typische Variante: [Details]` | Ergebnisfeedback | fasst alle Veränderungen eines sichtbaren Bausteins genau einmal kompakt zusammen | Label unter dem zusammengefassten Variantenbaustein; keine zusätzliche Hervorhebung |
| `S05.componentStrategy.presentation.findingChips.typicalEnding` | ungebundene Endung wurde nicht sichtbar eingeordnet | `typische Endung: +[Wert]` | Ergebnisfeedback | kennzeichnet eine begrenzt erkannte Endung ohne einen nicht erkannten Grundbestandteil einer Kategorie zuzuordnen | erscheint erst in der gemeinsamen Zusammenfassung am betroffenen Passwortbereich |
| `S05.componentStrategy.accountContext.transition` | `Zum Schluss schauen wir, ob die gesamte Zeichenfolge typisch verändert wurde.` | `Damit sind die drei Arten von Passwortbestandteilen geprüft.` | Orientierung | führt nach Wegfall der redundanten vierten Prüfung direkt in die Zusammenfassung | `Weiter`; keine Hervorhebung |

Die zusammengefassten Werte, persönlichen Markierungen und Resthinweise bleiben ausschließlich
flüchtiger Trainingszustand. Es werden keine neuen Felder gespeichert oder exportiert. Die
erweiterte Endungserkennung ist eine begrenzte lokale Heuristik und keine Produktionsbewertung.

### Copy-Delta S05 stabile Karten und eindeutige Kandidatentreffer 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Die lokale Analyse, Persistenz,
Reihenfolge der späteren Struktur- und Durchprobierabschnitte sowie die Forschungsgrenzen bleiben
unverändert. `S05_CONTENT_VERSION` wird von `2.25.0` auf `2.26.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.componentStrategy.*.results` | häufige und persönliche Ergebnisse wurden jeweils als `Ausgangspunkt` eingeordnet; ein häufiger Volltreffer wurde sofort als gefunden bezeichnet | Einzelergebnisse nennen nur erkannte Werte und gegebenenfalls die vollständige Abdeckung als einen oder mehrere Kandidaten | Ergebnisfeedback | verschiebt das adaptive Urteil ausdrücklich in die gemeinsame Drei-Karten-Auswertung; dramaturgische Änderung ausdrücklich freigegeben | kein neues Interaktionsziel; betroffene Bausteine bleiben sichtbar |
| `S05.componentStrategy.summary.startingPoints` | Ausgangspunkt-Grenze wurde bereits in den Einzelresultaten wiederholt | `Das waren alles nur Ausgangspunkte. Sie zeigen, welche Bestandteile der Angreifer früh ausprobieren könnte.` | Ergebnisfeedback / Safety Boundary | bündelt die begrenzte Einordnung an einer stabilen Stelle | `Weiter zum Aufbau`; keine Hervorhebung |
| `S05.componentStrategy.summary.singleCandidateMatch` | kein gemeinsames Urteil für einen vollständig abdeckenden Einzelkandidaten | `Da dein Passwort nur einem einzigen Kandidaten entspricht, konnte der Angreifer es hier bereits herausfinden. Wir schauen uns dennoch weiter an, wie der Angreifer vorgeht. Es kann nämlich sein, dass dieses Passwort auch auf einem anderen Weg erraten werden kann.` | Ergebnisfeedback / Navigation | unterscheidet einen vollständigen Einzelkandidaten von mehreren nur gemeinsam abdeckenden Kandidaten; ausdrücklich freigegeben | `Weiter zum Aufbau`; keine Hervorhebung |
| `S05.componentStrategy.summary.accountCandidateMatch` | Kontobezug nannte nur ableitbare Begriffe | `Der Angreifer hätte hier schon dein Passwort gefunden. Wir schauen uns dennoch weiter an, wie der Angreifer vorgeht.` | Ergebnisfeedback / Navigation | verwendet für den zuletzt geprüften Kontobezug die ausdrücklich verlangte kürzere Trefferfolge | `Weiter zum Aufbau`; keine Hervorhebung |
| `S05.componentStrategy.summary.nothingFound` | leere Karten besaßen keinen sichtbaren Befundtext | `Nichts gefunden` | Ergebnisfeedback | macht ein leeres Ergebnis ohne Farbcodierung verständlich | kein |

Die längere Einzelkandidaten-Rückmeldung überschreitet das normale PassWo-Zielbudget bewusst,
weil der Nutzer den Treffer, die Fortsetzung und den möglichen weiteren Angriffsweg gemeinsam
freigegeben hat. Ein Grundkandidat mit direkt gebundener Großschreibung, Zeichenersetzung, Zahl
oder Endung bleibt genau ein Kandidat. Zwei verschiedene Grundkandidaten werden auch bei
lückenloser gemeinsamer Abdeckung nicht als bereits gefunden bezeichnet.

Visuell zeigt jede Erklärung und Einzelprüfung nur die aktuelle Karte. Die Einzelkategorienleiste
wird um 25 Prozent reduziert; das Kontobezugslogo sitzt in dieser Leiste leicht tiefer. Erst die
Zusammenfassung zeigt alle drei tiefer gesetzten Karten. Befunde erscheinen darin als rechteckige
Passwortbausteine statt als Pills. Die Kategorieübergänge füllen den gesamten S05-Bildschirm und
geben die Zielszene ohne Ausblenden frei. Die kanonischen Passwortbausteine bleiben zwischen
Auswahl und Ergebnis stabil montiert; zusammengehörige Teile schließen ihre Zwischenräume, ohne
ihre Position sprunghaft neu aufzubauen. `prefers-reduced-motion` zeigt unmittelbar den jeweiligen
Endzustand.

### Copy-Delta S05 Vollbildübergänge und fortlaufende Prüfungskarte 4. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 4. August 2026. Die drei vorhandenen lokalen
Prüfungen, ihre Reihenfolge, Analysegrenzen und flüchtigen Auswahlzustände bleiben unverändert.
`S05_CONTENT_VERSION` wird von `2.26.0` auf `2.27.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.intro.narration.strategyTargeting` | `Der Angreifer kennt sie nicht. Bevor er alle Zeichen systematisch durchprobiert, kann er aber Passwortteile kombinieren, um dein Campusgram-Passwort zu erraten.` | `Der Angreifer sieht diese Bestandteile nicht. Sein Programm kann aber mögliche Bestandteile auswählen, kombinieren und daraus vollständige Passwortkandidaten bilden.` | Mechanismuserklärung | beschreibt die programmgesteuerte Kandidatenbildung präziser; ausdrücklich freigegebene Bedeutungspräzisierung | `Weiter`; keine Hervorhebung |
| `S05.intro.narration.componentCategoryOverview` | `Als ersten Ausgangspunkt nutzt er, dass manche Passwörter und Zeichenfolgen besonders häufig verwendet werden.` | `Dabei beginnt er mit Passwörtern und Zeichenfolgen, die besonders häufig verwendet werden.` | Orientierung | vom Nutzer vorgegebener, direkter Übergang zur ersten Prüfung; begrenzte Bedeutungsänderung | `Weiter`; keine Hervorhebung |
| `S05.componentStrategy.commonComponents.explanation[2]` | Angreifer als handelndes Subjekt; Begriff `typische Veränderungen`; zweiter Absatz | Programm als handelndes Subjekt; `typische Varianten`; Anwendung auf einzelne und zusammengesetzte Kandidaten in einem Absatz | Mechanismuserklärung | vom Nutzer vorgegebene technische Präzisierung und einheitliche Benennung; ausdrücklich freigegeben | `Weiter`; `typische Varianten` bleibt mit dem bestehenden Variantensymbol hervorgehoben |
| `S05.componentStrategy.commonComponents.machine.generatorLabel`, `findingLabels.typical-transformation` | `Typische Veränderungen generieren`, `typische Veränderung` | `Typische Varianten generieren`, `typische Variante` | Orientierung / Ergebnisfeedback | einheitliche, ausdrücklich verlangte Terminologie | kein neues Interaktionsziel; bestehendes Variantensymbol bleibt |
| `S05.componentStrategy.presentation.reviewCardTitle` | keine fortlaufende Prüfungskarte | `Prüfungskarte 1` | Orientierung | benennt die neue, rechts platzierte und nach jeder Prüfung ergänzte Zusammenfassung | kein Interaktionsziel; Kategorie wird durch Symbol, Titel und Bausteinbefund getragen |

Die Kategorieübergänge werden außerhalb des transformierten Maschinencontainers auf der
obersten S05-Seitenebene gerendert und bedecken dadurch Header, Inhalt und PassWo-Layer vollständig.
Die obere Leiste zeigt keine Ergebniskarte mehr, sondern den großen Kategorietitel mit einem
größeren, zentrierten Symbol darunter. Rechts bleibt `Prüfungskarte 1` zunächst leer und erhält
nach jeder abgeschlossenen Prüfung Symbol, Kategorienamen und die erkannten Werte im vorhandenen
Bausteinlook. Direkt gebundene Varianten wie Wort, Zahlenfolge und Symbol werden als ein
einheitlich gefärbter Baustein gerendert. Es werden keine neuen Forschungsfelder gespeichert oder
exportiert.

### Copy-Delta S05 getrennte Erklärung und animierte Bausteinprüfung 5. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 5. August 2026. Der Wortlaut der bestehenden
Kontobezugserklärung bleibt unverändert; geändert werden ihre Schrittgrenze, das sichtbare Ziel und
die Handlung. Die drei lokalen Prüfungen, Analysegrenzen und flüchtigen Auswahlzustände bleiben
unverändert. `S05_CONTENT_VERSION` wird von `2.27.0` auf `2.28.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.componentStrategy.accountContext.explanation[0]` | WLAN-Beispiele und anschließende Prüfaufforderung erscheinen in einem gemeinsamen Maschinenschritt | `Bei einem WLAN könnten es „WLAN“, „Router“ oder „Fritzbox“ sein.` erhält den eigenen Schritt `account-context-examples` | Mechanismuserklärung | trennt Beispiel und Handlung sichtbar; keine Bedeutungsänderung | `Weiter` wechselt von der Maschine zur mittigen Passwortansicht; keine Hervorhebung |
| `S05.componentStrategy.accountContext.explanation[1]` | Prüfaufforderung bleibt vor der Maschine sichtbar | Wortlaut unverändert vor der mittigen Passwortansicht | Navigation | die Aufforderung benennt nun das tatsächlich sichtbare Prüfziel | `Im Passwort prüfen`; `Bezug zum Konto und Umfeld` bleibt hervorgehoben |
| `S05.fixtures.all-categories` | `CampusgramPassw0rt123!` | `CampusPassw0rt123!` | interne Design-Lab-Metadaten | stellt die verlangte Zusammenführung von `Passw0rt`, `123` und `!` in einem kompakten Beispiel dar | kein Teilnehmertext; keine Persistenz |

Das mittige Kategoriesymbol entfällt aus der Kopfleiste. Die Maschine rückt nach oben und die
kürzere `Prüfungskarte 1` wird nur in den eigentlichen Passwortprüfungs- und Ergebnisansichten
gerendert. Sie beeinflusst nicht mehr die horizontale Zentrierung des Passworts, sondern liegt
rechts außerhalb seines Layoutflusses. Mehrere Eigenschaften eines Bausteins stehen vertikal
untereinander. Beim Prüfergebnis beginnen direkt gebundene Teilsegmente sichtbar getrennt und
rücken mit abklingenden Einzelrahmen in den finalen, einheitlich gefärbten Baustein ein.
`prefers-reduced-motion` zeigt unmittelbar den verbundenen Endzustand.

### Copy-Delta S05 Kontextidentifikatoren und zweite Prüfungskarte 5. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 5. August 2026. Die Änderung bleibt auf S05 und
die bereits vorhandene lokale zxcvbn-Adaptergrenze beschränkt. Benutzername und fiktive
Konto-Mail werden ausschließlich aus der flüchtigen Campusidentität abgeleitet, im Arbeitsspeicher
an die jeweilige lokale Analyse übergeben und weder persistiert noch exportiert.
`S05_CONTENT_VERSION` wird von `2.28.0` auf `2.29.0` und die lokale Analysekonfiguration von
`passwo-bounded-guess-path-v3` auf `passwo-bounded-guess-path-v4` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.componentStrategy.categories.account-context`, `accountContext.opening`, `accountContext.explanation[1]` | `Bezug zum Konto und Umfeld` | `Bezug zum Konto, Dienst oder Umfeld` | Orientierung / Mechanismuserklärung / Navigation | erweitert den freigegebenen Kontext ausdrücklich um den Dienst; begrenzte Bedeutungsänderung | bestehende Prüfung; Kategoriephrase mit bestehendem Symbol |
| `S05.componentStrategy.accountContext.opening[1]` | Campus, Nachricht, Gruppe oder Dienstname | `Bei Campusgram wären zum Beispiel Begriffe wie Campus, Nachricht, dein Benutzername oder der Dienstname naheliegend.` | Mechanismuserklärung | Benutzername wird als verlangter lokaler Kontoanhaltspunkt benannt; ausdrücklich freigegeben | `Weiter`; keine zusätzliche Hervorhebung |
| `S05.componentStrategy.summary.*` | lange Treffererklärung, technische Fundformulierung und vorweggenommener Aufbauübergang | kurzer situativer Trefferhinweis und `Erkannt wurden Bestandteile aus [Kategorienamen].` | Ergebnisfeedback | reduziert die ausdrücklich benannte kognitive Last und hält die adaptive Kategorienliste bei | `Weiter`; häufige Bestandteile und persönliche Angaben bilden die freigegebene gemeinsame Hervorhebung |
| `S05.structure.intro` | direkter Eintritt in vier Demonstrationskarten | neue Erklärung zu vorhersehbaren Kombinationsmustern vor der erneut sichtbaren annotierten Beispielkombination | Mechanismuserklärung | setzt den gewünschten eigenen Übergang vor die Aufbaukarten | `Weiter`; keine Hervorhebung |
| `S05.structure.demonstrations[0..2]` | `Thematischer Zusammenhang`, `Satzstruktur`, `Wiederholung` | `Inhaltliche Zusammenhänge`, `Vorhersehbare Satz- und Phrasenstrukturen`, `Wiederholungsmuster` | Orientierung | übernimmt die ausdrücklich benannten Kategorien der zweiten Prüfungskarte | bestehender Kartenfortschritt; keine Hervorhebung |

`Prüfungskarte 1` wird geringfügig höher und breiter. Ihre Bausteine erhalten ausschließlich in
dieser kompakten Zusammenfassung kleinere Innenabstände und eine Höhe nahe der Textzeile. Die
drei Aufbaukarten sammeln sich fortlaufend in `Prüfungskarte 2`; in ihrer Mitte wird keine
Passwortmaschine gerendert. Die bisherige sichtbare vierte Demonstration `Passwortkontext`
entfällt aus dieser Sequenz, die begrenzte lokale Kontextanalyse bleibt jedoch erhalten.

### Copy-Delta S05 Kartenposition, Titel und Kontextcopy 5. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 5. August 2026. Die drei lokalen Prüfungen,
Analysegrenzen, flüchtigen Auswahlzustände und Hervorhebungsgrenzen bleiben unverändert.
`S05_CONTENT_VERSION` wird von `2.29.0` auf `2.30.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel / Hervorhebung |
|---|---|---|---|---|---|
| `S05.componentStrategy.commonComponents.explanation[2]` | Erklärung zu unveränderten Bestandteilen und typischen Varianten | vorgegebene Erklärung zur Wirkung typischer Varianten, einschließlich Großschreibung, Zeichenersetzungen sowie zusätzlicher Zahlen und Symbole | Mechanismuserklärung | formuliert den Angreifer als handelndes Programm und bindet die Varianten ausdrücklich an zusammengesetzte Passwortkandidaten | `typische Varianten` bleibt mit der bestehenden Varianten-Markierung hervorgehoben |
| `S05.componentStrategy.personalDetails.derivation` | allgemeine Ableitbarkeit persönlicher Angaben | vorgegebene Erklärung zur Zuordnung einer Person und zur anschließenden Ableitung aus öffentlichen Profilen, Datenlecks oder dem Umfeld | Mechanismuserklärung | macht den möglichen Zuordnungsschritt explizit, ohne eine konkrete Ableitung für die teilnehmende Person zu behaupten | keine zusätzliche Hervorhebung |
| `S05.componentStrategy.personalDetails.explanation` | unbestimmtes mögliches Angreiferwissen und manuelle Auswahl | vorgegebene Erklärung zur Unsicherheit des Trainingsmoduls mit eigener Auswahl durch die teilnehmende Person | Safety Boundary / Navigation | trennt mögliche Kenntnis oder Ableitung von der begrenzten lokalen Einordnung | keine zusätzliche Hervorhebung |
| S05-Kategorieüberschrift und Maschinenposition | Titel zentriert in einer eigenen dunklen Kopfleiste; Maschine in ihrer bisherigen Position | Titel geringfügig tiefer ohne eigene Kopfleiste; Maschine um weitere 5 % höher | Orientierung | entfernt die überlagernde Leiste über der Prüfungskarte und gleicht die visuelle Gewichtung zwischen Titel und Maschinenansicht aus | keine neue Analyseentscheidung |
| `S05.componentStrategy.presentation.reviewCardTitle`-Ansicht | Prüfungskarte am rechten Rand auf halber Höhe | Prüfungskarte am linken Rand bei 75 % Abstand zur unteren Kante | Orientierung | spiegelt die bestehende Randdistanz horizontal und verschiebt die Karte an die ausdrücklich gewünschte obere Position | bestehende Karteninhalte und Befunde bleiben unverändert |
| `S05.intro.narration.strategyTargeting`-Ansicht | annotierte Darstellung des Beispielpassworts mit Satzaufbau | die bekannten Bausteine werden nacheinander mit Punkten verdeckt, verkleinert und als farbstabile Kandidatenversuche unterschiedlicher Länge und Reihenfolge zwischen Campusgram-Passwort und Angreifer gezeigt | Mechanismuserklärung | verbindet die Bausteinansicht mit der folgenden Kandidatenbildung, ohne Bestandteile des fiktiven Passworts offenzulegen | keine neue Analyseentscheidung; `prefers-reduced-motion` zeigt unmittelbar die Kandidatenansicht |
| `s05-components-summary` | Kategoriebegriffe im Satz `Erkannt wurden Bestandteile aus ...` hervorgehoben | Kategoriebegriffe bleiben unmarkiert | Ergebnisfeedback | reduziert die konkurrierende zweite Leseschicht in der abschließenden Auswertung | keine Hervorhebung im Auswertungssatz |

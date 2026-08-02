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
Vor der Exploration wird ausdrücklich gesagt:

> Du musst dir keine Einzelheiten merken. Wähle selbst, welches Konto du zuerst ansehen möchtest.

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
| `S02.narration.messages[s02.accounts.intro]` | `Ich habe die drei Konten als Netzwerk dargestellt. So kannst du sehen, welche Funktionen mit ihnen verbunden sind.` | Orientierung | erster Schritt der Einführungsanimation | Das Netz wird zuerst erklärt, bevor es erkundet wird. |
| `S02.narration.messages[s02.accounts.intro-ready]` | `Wähle selbst, welches Konto du zuerst erkundest. Du musst dir keine Einzelheiten merken – viele dieser Funktionen kennst du wahrscheinlich aus deinem Alltag.` | Navigation | freie Kontowahl nach dem Einblenden | Die freie Reihenfolge und die geringe Gedächtnislast werden direkt vor der Interaktion benannt. |
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

## Reihenfolge der nächsten Implementierung

1. S00-Navigation und S01-Handlungszuordnung chirurgisch korrigieren.
2. Den Emphasis-Katalog auf Carry-forward-Hervorhebungen reduzieren.
3. S03-Warnübergang auf den tatsächlichen Campusgram-Tab verlagern und Retrieval-Copy kürzen.
4. S02 als geführte Exploration nach der verbindlichen Zielregel neu schneiden.
5. S04 und S05 sprachlich begrenzen, ohne die technische Genauigkeit der Simulation zu schwächen.

Jeder Schritt erhält einen eigenen kleinen Codex-Auftrag und einen eigenen Content-Versionssprung.
Eine flächige Umschreibung von S00--S05 in einem Lauf ist ausdrücklich ausgeschlossen.

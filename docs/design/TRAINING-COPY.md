# Training Copy and Interaction Language

## Zweck

Diese Datei ist die verbindliche Autorisierungs- und Review-Grundlage für alle sichtbaren
Teilnehmertexte des Supportive Authentication Onboarding. Sie verhindert, dass technische
Implementierung, UI-Komponenten oder allgemeine Stiloptimierung die beabsichtigte Dramaturgie,
den Lernzweck oder den unterstützenden Ton des Trainings schleichend verändern.

Die Regeln gelten für PassWo-Sprechblasen, Seitentitel, Aufgabenhinweise, Statusmeldungen,
Buttons, Vorschauen, Warnungen und sichtbare Simulationshinweise. Sie definieren keine neue
psychologische Skala und keine allgemeingültigen Regeln für Security-Training. Es sind
projektspezifische Authoring-Regeln für dieses Forschungsartefakt.

## 1. Quellenautorität und Änderungsdisziplin

Für Teilnehmertext gilt innerhalb eines ausdrücklich benannten Segments folgende Reihenfolge:

1. der aktuelle Nutzerauftrag und ausdrücklich freigegebene Copy-Entscheidungen;
2. das aktuelle, vom Nutzer gepflegte Trainingsskript für narrative Absicht, Reihenfolge,
   Lernfunktion und Ton;
3. die versionierten Segmentdaten in `packages/training-content` als implementierter Stand;
4. der segmentbezogene Copy-Audit unter `docs/design/`;
5. allgemeine Design- und Architekturregeln.

Eine Umbenennung von Konten, ein UI-Umbau oder eine technische Migration ist keine Erlaubnis,
angrenzende Formulierungen stilistisch neu zu schreiben. Bestehender Text bleibt erhalten, wenn
er fachlich korrekt ist, zur aktuellen Interaktion passt und keine der Regeln dieser Datei
verletzt.

Codex darf Teilnehmertext nicht ändern, nur weil eine andere Formulierung kürzer, glatter oder
"professioneller" erscheint. Jede Änderung braucht einen konkreten Grund aus mindestens einer
dieser Kategorien:

- fachliche Korrektheit oder Begrenzung einer Sicherheitsbehauptung;
- Anpassung an die tatsächlich sichtbare Interaktion;
- Entfernung nachweisbarer Redundanz oder unnötiger kognitiver Last;
- Konsistenz mit freigegebenen Konto- und Funktionsnamen;
- Barrierefreiheit oder eindeutige Handlungszuordnung;
- ausdrücklich freigegebene dramaturgische Änderung.

### Geschützte Formulierungen

Die folgende Formulierung ist als bewusster Charakter- und Toneinstieg geschützt und darf ohne
expliziten Auftrag nicht umgeschrieben werden:

> Aloha! Ich bin PassWo und begleite dich heute durch das Training.

Weitere geschützte Formulierungen können im jeweiligen Copy-Audit ergänzt werden. Ein
"Copy-Lock" schützt nur den Wortlaut; notwendige technische Einbettung, Zeichensetzung oder
barrierefreie Auszeichnung bleibt möglich, sofern die sichtbare Formulierung gleich bleibt.

## 2. Eine Textfläche hat eine primäre Funktion

Jeder sichtbare Text wird vor dem Schreiben genau einer primären Rolle zugeordnet:

| Rolle | Zweck | Typische Form |
|---|---|---|
| Orientierung | Wo befinden wir uns und warum? | kurzer Einstieg, kein Detailkatalog |
| Navigation | Welches sichtbare Element soll als Nächstes benutzt werden? | ein eindeutiger Handlungssatz |
| Mechanismuserklärung | Was geschieht und warum ist es relevant? | ein Mechanismus pro Schritt |
| Ergebnisfeedback | Was hat die gerade ausgeführte Handlung verändert? | Ergebnis zuerst, Einordnung danach |
| Kerngedanke | Was soll nach der Szene erinnerbar bleiben? | ein kurzer, stabiler Satz |
| Safety Boundary | Welche Daten- oder Geltungsgrenze gilt? | direkt, vollständig, nicht beschönigend |
| Optionaler Hinweis | Hilfe auf Nachfrage, ohne Fortschritt auszulösen | schließbar, nicht obligatorisch |
| Interne Metadaten | Fixture, Controller, Scoring, Laufzeit- oder Forschungsstatus | niemals Teilnehmertext |

Eine Sprechblase kombiniert grundsätzlich nicht Navigation, mehrere Mechanismuserklärungen,
Risikofolgen und eine Zusammenfassung zugleich. Wenn zwei Rollen zwingend zusammengehören,
steht die Handlungsanweisung zuletzt und bleibt als eigener kurzer Satz erkennbar.

## 3. PassWo-Sprechschritte

PassWo ist Guide und sichtbare Bezugsperson, kein Vorleser einer vollständigen Seite.

- Ein Sprechschritt enthält genau einen Hauptgedanken.
- Navigation besteht normalerweise aus einem Satz.
- Erklärung oder Feedback besteht normalerweise aus höchstens zwei kurzen Sätzen.
- Ein längerer Safety-Hinweis darf ausnahmsweise mehr Text enthalten, wenn die Grenze nicht
  sinnvoll aufgeteilt werden kann.
- Lange Texte werden nicht durch kleinere Schrift, Typewriter-Effekt oder mehr Hervorhebungen
  repariert. Sie werden gekürzt oder entlang einer sichtbaren Zustandsänderung geteilt.
- PassWo wiederholt keine Information, die bereits eindeutig in einer Vorschau, einem Status oder
  einer Animation sichtbar ist. Er erklärt nur die Bedeutung, die aus der Darstellung allein
  nicht zuverlässig hervorgeht.
- Adaptive Rückmeldung nennt zuerst das beobachtete Ergebnis und danach höchstens eine
  handlungsrelevante Einordnung. Sie bewertet nicht die Person.

Als Authoring-Hilfe gelten folgende Zielbudgets. Sie sind keine wissenschaftlichen Grenzwerte,
sondern Review-Schwellen:

- Navigationshinweis: ein Satz, möglichst unter 18 Wörtern;
- normaler PassWo-Schritt: höchstens zwei Sätze, möglichst unter 35 Wörtern;
- Kerngedanke: ein Satz, möglichst unter 20 Wörtern;
- Safety Boundary: so kurz wie möglich, aber vollständig; normalerweise höchstens 50 Wörter.

Eine Überschreitung ist erlaubt, muss im Copy-Delta ausdrücklich begründet werden.

## 4. Handlungszuordnung und Button-Semantik

Die Sprache muss die tatsächliche Bedienhandlung benennen. Eine Sprechblase darf keine zweite,
bequemere Ersatzhandlung erzeugen, wenn die Lernhandlung an einem sichtbaren Element der
Browser- oder Netzwerkszene stattfinden soll.

| Interaktionsart | Sprechblasenaktion | Regel |
|---|---|---|
| Reiner Dialogfortschritt | `Weiter` | Button führt ausschließlich zum nächsten Sprechschritt |
| Konkrete fachliche Aktion in der Blase | handlungsspezifisch, z. B. `Passwort prüfen` | Button selbst führt genau diese Aktion aus |
| Handlung an externem UI-Ziel | kein Button in der Blase | Text verweist auf Tab, Fenstersteuerung, Knoten oder Website-Element; nur dieses Ziel löst den Übergang aus |
| Optionale Hilfe | `Schließen` | schließt nur den Hinweis und verändert keinen Trainingszustand |
| Wiederholbare Erklärung | `Animation wiederholen` | wiederholt ausschließlich die fachliche Visualisierung |

Verbindliche Negativregeln:

- Kein `Konto öffnen` in der Sprechblase, wenn der markierte Browser-Tab geöffnet werden soll.
- Kein `Schließen` in der Sprechblase, wenn ein Browserfenster oder anderes sichtbares Objekt
  geschlossen werden soll.
- Kein zusätzlicher `Weiter`-Button neben einer handlungsspezifischen Primäraktion.
- Kein Buttontext beschreibt einen Effekt, den der Button nicht selbst auslöst.
- Ein verpflichtendes externes Ziel wird visuell markiert, fokussierbar gemacht und bleibt die
  einzige Quelle des entsprechenden Domain-Events.

## 5. Hervorhebungen

Hervorhebung markiert nicht "alles Wichtige im Absatz". Sie markiert den einen Kerngedanken, der
nach dem aktuellen Schritt mitgenommen werden soll.

### Zulässige Verwendung

- Standard: höchstens eine semantische Hervorhebung pro Sprechschritt.
- Ausnahme: höchstens zwei Hervorhebungen, wenn ein ausdrücklicher Kontrast vermittelt wird,
  beispielsweise `gleiches Passwort` gegenüber `eigenes Passwort`.
- Eine Hervorhebung umfasst eine kurze zusammenhängende Phrase, nicht mehrere verstreute
  Schlüsselwörter.
- Kontonamen dürfen zur Referenzauflösung ihre stabile Identitätsfarbe oder ihr Symbol tragen.
  Das ist Orientierung, keine zusätzliche Lernhervorhebung.
- `warning` wird nur für einen aktuell relevanten Vorsichts- oder Warnzustand verwendet, nicht
  für jedes Wort mit Sicherheitsbezug.
- `positive` beschreibt eine sichtbare Schutzwirkung oder einen bestätigten Fortschritt, niemals
  den moralischen Wert einer Person.
- `action` verweist nur auf eine tatsächlich vorhandene, sichtbare Handlung.

### Nicht zulässig

- vier oder mehr farbige Begriffe, weil ein Absatz viele Nomen enthält;
- das Hervorheben sämtlicher Konto-, Dienst- oder Funktionsnamen in einer Erklärung;
- Hervorhebung als Ersatz für Kürzung oder Segmentierung;
- wechselnde Farben ohne stabile semantische Rolle;
- Warnfarbe für hypothetische Folgen, die in der aktuellen Szene noch nicht eintreten;
- Icons in laufendem Text, wenn sie keine Referenzauflösung oder Zustandsbedeutung leisten.

Wenn kein einzelner Kerngedanke identifizierbar ist, bleibt der Sprechschritt ohne Hervorhebung
oder wird redaktionell neu geschnitten.

## 6. Kontext zeigen, Folgen zum passenden Zeitpunkt erklären

Frühe Kontextsegmente sollen Nähe, Wiedererkennung und ein mentales Kontomodell herstellen. Sie
müssen nicht alle späteren Sicherheitsfolgen vorwegnehmen.

- Vorschauen und Mini-Szenarien tragen konkrete Inhalte möglichst selbst.
- PassWo erklärt in einer Erkundung nur das minimale Kontomodell, das für spätere Szenen gebraucht
  wird.
- Schwere Folgen wie kontoübergreifender Zugriff, Zurücksetzung oder Kommunikation im Namen einer
  Person werden ausführlich erst dann erklärt, wenn die entsprechende Konsequenz in der
  Simulation sichtbar wird.
- Ein Kontextsegment verwendet `angesehen` oder `erkundet`, nicht `verstanden`, sofern kein
  Wissen geprüft wird.
- Optionales Erkunden bleibt optional. Pflichtfortschritt verlangt nur die kleinste Interaktion,
  die den später benötigten Zusammenhang sichtbar macht.

Für S02 gilt als Zielregel:

- eine geführte Pflichtsequenz pro Hauptkonto;
- höchstens ein PassWo-Satz pro Hauptkonto;
- ein dauerhaft sichtbarer Kerngedanke;
- alle verbundenen Vorschauen werden innerhalb des gewählten Kontos nacheinander angesehen;
- keine Wissensfrage und kein `verstanden`-Status;
- freie Reihenfolge der Hauptkonten und Rückkehrmöglichkeit nach einem Kontoabschluss.

## 7. Teilnehmertext und interne Forschungsgrenzen trennen

Technische und forschungsbezogene Begriffe dürfen nicht ungefiltert in die Lernoberfläche
gelangen. Insbesondere folgende Begriffe sind standardmäßig intern:

- Fixture;
- Runtime oder Laufzeitbefund;
- Controller;
- Design-Lab;
- Produktionsbewertung;
- Scoring- oder Gesamtscore-Hinweise;
- theoretische Entropie;
- interne Segment- oder Regel-IDs.

Notwendige Grenzen werden in Alltagssprache formuliert, beispielsweise:

- `Fiktives Beispiel` statt `Fixture`;
- `Was diese Übung zeigt` statt `Laufzeitbefund`;
- `Diese Übung bewertet keine echten Passwörter` statt einer internen
  Produktionsbewertungsformulierung.

Eine Grenze wird an einer stabilen Stelle erklärt und nicht in jeder Karte wiederholt. Interne
Metadaten bleiben in Design Lab, Entwickleransicht, Logging-freier Debug-Oberfläche oder
Dokumentation.

## 8. Verbindlicher Codex-Ablauf bei Copy-Änderungen

Vor einer Änderung erstellt Codex für jede betroffene Textfläche ein kompaktes Copy-Delta:

| Feld | Inhalt |
|---|---|
| Segment und Text-ID | stabiler Content-Identifier |
| Quelle | Skriptseite, Nutzerentscheidung oder vorhandener Content |
| Aktueller Text | Wortlaut vor der Änderung |
| Geplanter Text | Wortlaut nach der Änderung |
| Primäre Rolle | Orientierung, Navigation, Mechanismus, Feedback, Kerngedanke oder Safety |
| Grund | konkrete zulässige Änderungskategorie |
| Bedeutungsänderung | `nein`, `begrenzt` oder ausdrücklich freigegeben |
| Interaktionsziel | tatsächliches UI-Ziel oder `kein` |
| Hervorhebung | Phrase und semantischer Ton oder `keine` |

Danach prüft Codex:

1. Stimmt der Text noch mit der narrativen Absicht des Skripts überein?
2. Benennt er exakt die Handlung, die technisch ausgelöst wird?
3. Wiederholt PassWo nur bereits Sichtbares?
4. Wird eine spätere Konsequenz unnötig vorweggenommen?
5. Gibt es genau einen Kerngedanken und höchstens die zulässige Hervorhebung?
6. Bleibt geschützter Wortlaut unverändert?
7. Wurde die Content-Version des betroffenen Segments erhöht und die Quelle dokumentiert?

Der Abschlussbericht nennt Copy-Änderungen separat. Eine pauschale Angabe wie
`Texte verbessert` ist unzulässig.

## 9. Review-Gate

Ein Teilnehmertext ist erst freigabefähig, wenn alle Antworten `ja` lauten:

- Ist seine primäre Rolle eindeutig?
- Passt der Wortlaut zur aktuell sichtbaren Szene?
- Kann die Person erkennen, welches Element sie bedienen soll?
- Löst ein sichtbarer Button genau die benannte Handlung aus?
- Enthält der Schritt nur einen Hauptgedanken?
- Ist die Hervorhebung auf den Carry-forward-Kerngedanken begrenzt?
- Bleiben Security-Claim und Simulationsgrenze korrekt?
- Vermeidet der Text Schuldzuweisung, Alarmismus und absolute Sicherheit?
- Bleibt die ursprüngliche Skriptabsicht erhalten?

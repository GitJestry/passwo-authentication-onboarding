# S08--S09 Copy Audit

## Copy- und Ablaufdelta S08 Rücklauf und S09 Abschluss, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Nach S07 bleibt PassWo im gesamten
Rücklauf unsichtbar. Offene Master-Campus- oder Campus-E-Mail-Konten erhalten eine direkte
Knotenaktion; danach startet ein großer Button unten in der Mitte den Angriff. Der Angreifer
bleibt oberhalb von Campusgram, während die drei Kontopaare gleichzeitig als blockierte grüne
Verbindungen mit mittigem Vergleichsschild erscheinen. Jedes Konto behält dabei den blauen
S06-Passwortschild; jede Dreiecksseite besteht aus zwei grünen Segmenten mit Abstand zum Schild.
Die Passwortvergleich-Vorschau aus S06
wird nicht wiederholt. Nach dem vollständigen Dreieck führt `Abschließen` direkt zur stark
abgedunkelten S09-Abschlusszusammenfassung.

Alle Passwortänderungen, Befunde und Ablaufentscheidungen bleiben flüchtig. Die Formulierungen
begrenzen die Wirkung auf die dargestellten fiktiven Konten und enthalten keine absolute
Sicherheitszusage. `S08_NETWORK_REPLAY_CONTENT_VERSION` steigt von `2.0.0` auf `3.0.0`;
`S09_PASSWORD_SUMMARY_CONTENT_VERSION 1.0.0` wird neu eingeführt.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S08.protectionAction` | `Einzigartige Passphrase erstellen` | `Einzigartige Passphrase verwenden` | Navigation | betroffener Kontoknoten | stimmt den Text auf die automatische, eingabefreie Ersetzung ab; begrenzt | sichtbare Knotenaktion, keine Texthervorhebung |
| `S08.protectionActionDescription` | Passphrase für das Konto erstellen | fiktives Passwort automatisch durch eine einzigartige Passphrase ersetzen | Navigation / Safety Boundary | betroffener Kontoknoten | macht Automatik und fiktive Übungsgrenze zugänglich eindeutig; begrenzt | keine |
| `S08.replayActions.attack` | nicht vorhanden; automatischer Start nach PassWo | `Angriff starten` | Navigation | großer Button unten mittig | ausdrücklich freigegebene, direkte Startaktion; Bedeutungsänderung freigegeben | große Primäraktion |
| `S08.replayActions.finish` | `Was wäre, wenn? starten` und anschließender PassWo-Schritt | `Abschließen` | Navigation | großer Button unten mittig | entfernt den nicht mehr gewünschten Zwischenmodus und führt nach dem vollständigen Dreieck direkt nach S09; Bedeutungsänderung freigegeben | große Primäraktion |
| `S08.replayLabels.attack` | getrennte tatsächliche und hypothetische Beschriftung | `Das alte Campusgram-Passwort wird erneut ausprobiert. Alle Verbindungen bleiben blockiert.` | Orientierung | kein | beschreibt den einen durchgehenden Rücklauf ohne „Was wäre, wenn?“-Modus; begrenzt | keine |
| `S09.eyebrow` | nicht vorhanden | `Dein Passwort-Fundament` | Orientierung | kein | ausdrücklich freigegebene Abschlussüberlagerung; Bedeutungsänderung freigegeben | keine |
| `S09.title` | nicht vorhanden | `Das Wichtigste für deine Passwörter` | Kerngedanke | kein | bündelt die verlangte kurze Zusammenfassung; Bedeutungsänderung freigegeben | keine |
| `S09.principles.strong` | nicht vorhanden | `Stark` plus Passphrasenhinweis | Kerngedanke | kein | fasst die in S07 eingeführte Methode zusammen; Bedeutungsänderung freigegeben | Kartenüberschrift |
| `S09.principles.unique` | nicht vorhanden | `Einzigartig` plus kontoweise Verwendung | Kerngedanke | kein | fasst die sichtbare Schutzwirkung aus S08 zusammen; Bedeutungsänderung freigegeben | Kartenüberschrift |
| `S09.principles.retrievable` | nicht vorhanden | `Abrufbar` plus optionale kleine Geschichte | Kerngedanke | kein | bewahrt Abrufbarkeit als eigenes Prinzip ohne Wiederverwendung; Bedeutungsänderung freigegeben | Kartenüberschrift |

Das Darstellungsdelta vom selben Auftrag startet alle sechs grünen Liniensegmente gleichzeitig.
Die drei blauen S06-Passwortschilde bleiben ausschließlich an den Kontoknoten; die mittigen
Vergleichsschilde besitzen weder blaue Kreise noch blaue Verbindungslinien. Teilnehmertext,
Persistenz und Content-Version ändern sich dadurch nicht.

## Copy- und Darstellungsdelta S08 Statuszeile und Knotenaktion, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Die zusätzliche Statuszeile
während des animierten Angriffsrücklaufs entfällt vollständig. Die sichtbare Animation und ihre
zugängliche Netzwerkzusammenfassung bleiben bestehen. Die Knotenaktion `Einzigartige Passphrase
verwenden` erhält keine farbige Innenfläche; Blau und Grün erscheinen ausschließlich in ihrer
Kontur. `S08_NETWORK_REPLAY_CONTENT_VERSION` steigt von `3.0.0` auf `3.1.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S08.replayLabels.attack` | `Das alte Campusgram-Passwort wird erneut ausprobiert. Alle Verbindungen bleiben blockiert.` | entfällt | Orientierung | kein | ausdrücklich freigegebene Entfernung zusätzlicher kognitiver Last; keine Bedeutungsänderung am sichtbaren Rücklauf | keine |

## Copy- und Darstellungsdelta S08 Abschlussfeedback, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Sobald alle sechs grünen
Liniensegmente vollständig gezeichnet sind, erscheinen mittig Konfetti und anschließend das groß
hervorgehobene Ergebnisfeedback. Gleichzeitig wird die vorhandene Aktion `Abschließen` verfügbar.
Der Wortlaut bezieht sich ausschließlich auf die dargestellten Konten und erweitert die
Schutzwirkung nicht zu einer absoluten Sicherheitszusage. `S08_NETWORK_REPLAY_CONTENT_VERSION`
steigt von `3.1.0` auf `3.2.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S08.replayCompletion` | nicht vorhanden | `Konten wieder geschützt` | Ergebnisfeedback | kein | ausdrücklich freigegebene sichtbare Bestätigung des vollständig gezeichneten Schutzdreiecks; Bedeutungsänderung freigegeben | gesamte kurze Ergebnisphrase im positiven Ton |

## Copy- und Darstellungsdelta S09 Passwortliste und Rücksprung, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Das bisherige
`Passwort-Fundament` aus drei nummerierten Prinzipkarten wird vollständig durch eine kompakte,
unnummerierte Passwortliste ersetzt. Die transparente Glass-Fläche wird links von dem großen
grünen Vergleichsschild und rechts von dem großen blauen Passwortschild eingerahmt. Der
S08-Button benennt mit `Zum Überblick` nun exakt den Wechsel zur Liste. Der dortige Glass-Button
`Abschließen` entfernt die Überlagerung und zeigt wieder den zuletzt verlassenen Desktopzustand:
das vollständige grüne Schutzdreieck mit seinen Schilden, aber ohne Angreifer und ohne das
mittige Ergebnisfeedback.

Die neuen Aussagen sind die im Auftrag ausdrücklich freigegebene S09-Zusammenfassung. Sie fragen
keine Eingaben ab, bewerten keine realen Passwörter und erzeugen keine persistierten Felder oder
Trainingswrites. `S08_NETWORK_REPLAY_CONTENT_VERSION` steigt von `3.2.0` auf `3.3.0` und
`S09_PASSWORD_SUMMARY_CONTENT_VERSION` von `1.0.0` auf `2.0.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S08.replayActions.finish` | `Abschließen` | `Zum Überblick` | Navigation | S09-Passwortliste | passt die Bezeichnung an das tatsächliche sichtbare Ziel an; begrenzt | keine |
| `S09.eyebrow` | `Dein Passwort-Fundament` | entfällt | Orientierung | kein | ausdrücklich freigegebene Entfernung des bisherigen Fundaments und zusätzlicher kognitiver Last; freigegeben | keine |
| `S09.title` | `Das Wichtigste für deine Passwörter` | `Starke Passwörter auf einen Blick` | Orientierung | kein | ausdrücklich vorgegebener Titel für die neue Liste; freigegeben | keine |
| `S09.principles.minimum-length` | nicht vorhanden | `Mindestens 15 Zeichen verwenden.` | Kerngedanke | kein | ausdrücklich vorgegebene Passwortorientierung; freigegeben | unnummerierter Listenpunkt |
| `S09.principles.length-over-mix` | nicht vorhanden | `Kein bestimmter Zeichenmix nötig: Länge ist wichtiger.` | Kerngedanke | kein | ausdrücklich vorgegebene Priorisierung von Länge; freigegeben | unnummerierter Listenpunkt |
| `S09.principles.avoid-personal-context` | nicht vorhanden | `Persönliche Angaben sowie Konto- oder Dienstbezüge vermeiden.` | Kerngedanke | kein | ausdrücklich vorgegebene Begrenzung vorhersehbarer Bezüge; freigegeben | unnummerierter Listenpunkt |
| `S09.principles.unrelated-components` | nicht vorhanden | `Bestandteile ohne erkennbaren Zusammenhang wählen.` | Kerngedanke | kein | ausdrücklich vorgegebene Auswahlregel; freigegeben | unnummerierter Listenpunkt |
| `S09.principles.unique-per-account` | nicht vorhanden | `Für jedes Konto ein eigenes Passwort verwenden.` | Kerngedanke | kein | ausdrücklich vorgegebene Einzigartigkeitsregel; freigegeben | unnummerierter Listenpunkt |
| `S09.principles.six-word-passphrase` | nicht vorhanden | `Einfache Methode: mindestens sechs zufällig gewählte Wörter als Passphrase.` | Kerngedanke | kein | ausdrücklich vorgegebene einfache Methode; freigegeben | unnummerierter Listenpunkt |
| `S09.finishAction` | nicht vorhanden | `Abschließen` | Navigation | zuletzt verlassener Desktopzustand | benennt den Abschluss der Listenansicht und den freigegebenen Rücksprung; freigegeben | Glass-Primäraktion |

Die drei bisherigen Karten `Stark`, `Einzigartig` und `Abrufbar` samt ihren Erläuterungen
entfallen mit dem ausdrücklich freigegebenen Austausch des gesamten S09-Fundaments.

## Darstellungsdelta S09 Hervorhebungen ohne äußere Box, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Die äußere Glass-Box der
S09-Zusammenfassung entfällt vollständig; Titel, Schilde, innere Glass-Liste und Abschlussbutton
stehen ohne zusätzliche umschließende Fläche vor dem abgedunkelten Desktop. Der sichtbare Wortlaut
bleibt unverändert. Innerhalb der sechs eigenständigen Listenpunkte werden die ausdrücklich
benannten Kernaussagen typografisch fett hervorgehoben. `eigenes` erhält den positiven grünen Ton,
`Passphrase` den blauen Informationston. Farbe ist bei `eigenes` nicht der einzige
Bedeutungsträger, weil das Wort zugleich fett ausgezeichnet ist; `Passphrase` bleibt durch den
Text selbst verständlich.

`S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `2.0.0` auf `2.1.0`. Es entstehen keine neuen
persistierten Felder, Eingaben oder Trainingswrites.

| Segment und Text-ID | Aktueller und weiterhin sichtbarer Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|
| `S09.principles.minimum-length` | `Mindestens 15 Zeichen verwenden.` | Kerngedanke | kein | ausdrücklich freigegebene visuelle Gewichtung; keine Bedeutungsänderung | `Mindestens 15 Zeichen` fett |
| `S09.principles.length-over-mix` | `Kein bestimmter Zeichenmix nötig: Länge ist wichtiger.` | Kerngedanke | kein | ausdrücklich freigegebene visuelle Gewichtung; keine Bedeutungsänderung | `Kein bestimmter Zeichenmix nötig:` fett |
| `S09.principles.avoid-personal-context` | `Persönliche Angaben sowie Konto- oder Dienstbezüge vermeiden.` | Kerngedanke | kein | ausdrücklich freigegebene visuelle Gewichtung; keine Bedeutungsänderung | gesamter Listenpunkt fett |
| `S09.principles.unrelated-components` | `Bestandteile ohne erkennbaren Zusammenhang wählen.` | Kerngedanke | kein | ausdrücklich freigegebene visuelle Gewichtung; keine Bedeutungsänderung | gesamter Listenpunkt fett |
| `S09.principles.unique-per-account` | `Für jedes Konto ein eigenes Passwort verwenden.` | Kerngedanke | kein | ausdrücklich freigegebene visuelle Gewichtung; keine Bedeutungsänderung | gesamter Listenpunkt fett; `eigenes` zusätzlich positiv grün |
| `S09.principles.six-word-passphrase` | `Einfache Methode: mindestens sechs zufällig gewählte Wörter als Passphrase.` | Kerngedanke | kein | ausdrücklich freigegebene visuelle Gewichtung; keine Bedeutungsänderung | `Einfache Methode:` fett; `Passphrase` blau |

## Copy- und Darstellungsdelta S09 Kurzform und Kategoriesymbole, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Der Zusammenhang-Hinweis wird
ohne Bedeutungswechsel gekürzt. `Mindestens 15 Zeichen` und `ohne Zusammenhang` erhalten den
blauen Informationston. Im Hinweis zu vorhersehbaren Bezügen werden die bereits in S05
verwendeten Kategoriesymbole für `Persönliche Angaben` und `Konto- oder Dienstbezüge` unmittelbar
vor den jeweiligen fett gesetzten Phrasen wiederverwendet. Die Symbole sind dekorative
Wiedererkennungshilfen; die Bedeutung bleibt vollständig im sichtbaren Text enthalten.

`S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `2.1.0` auf `2.2.0`. Es entstehen keine neuen
persistierten Felder, Eingaben oder Trainingswrites.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.principles.minimum-length` | `Mindestens 15 Zeichen verwenden.` | unverändert | Kerngedanke | kein | ausdrücklich freigegebene visuelle Gewichtung; keine Bedeutungsänderung | `Mindestens 15 Zeichen` blau und fett |
| `S09.principles.avoid-personal-context` | `Persönliche Angaben sowie Konto- oder Dienstbezüge vermeiden.` | unverändert | Kerngedanke | kein | vorhandene S05-Kategoriesymbole verbessern die Wiedererkennung; keine Bedeutungsänderung | `Persönliche Angaben` und `Konto- oder Dienstbezüge` fett mit ihrem jeweiligen Symbol |
| `S09.principles.unrelated-components` | `Bestandteile ohne erkennbaren Zusammenhang wählen.` | `Bestandteile ohne Zusammenhang wählen.` | Kerngedanke | kein | ausdrücklich freigegebene Kürzung; begrenzt | `ohne Zusammenhang` blau und fett; Rest weiterhin fett |

## Darstellungsdelta S09 ohne Kategoriesymbole, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Die zuvor wiederverwendeten
kleinen S05-Kategoriesymbole vor `Persönliche Angaben` und `Konto- oder Dienstbezüge` entfallen
wieder vollständig. Beide Phrasen bleiben fett; `vermeiden` erhält stattdessen den blauen
Informationston. Der sichtbare Wortlaut bleibt unverändert.

`S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `2.2.0` auf `2.3.0`. Es entstehen keine neuen
persistierten Felder, Eingaben oder Trainingswrites.

| Segment und Text-ID | Aktueller und weiterhin sichtbarer Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|
| `S09.principles.avoid-personal-context` | `Persönliche Angaben sowie Konto- oder Dienstbezüge vermeiden.` | Kerngedanke | kein | ausdrücklich freigegebene Reduktion visueller Elemente; keine Bedeutungsänderung | keine Logos; `Persönliche Angaben` und `Konto- oder Dienstbezüge` fett; `vermeiden` blau und fett |

## Copy-, Ablauf- und Darstellungsdelta S09 Übergang zum Passwortmanager, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Nach der bestehenden
Passwortübersicht führt S09 den Maßstabswechsel von drei auf 80 Konten vor, fragt mit der
vorgegebenen Antwortmöglichkeit nach der subjektiven Realisierbarkeit und ordnet die Antwort ohne
Bewertung der Person ein. PassWo verbindet das sichtbare Skalierungsproblem anschließend mit den
bereits gezeigten Risiken von Wiederverwendung, ähnlichen Passwörtern und ungeschützten Listen.
Danach führt die animierte Karte `Sektion 2 von 3` / `Passwortmanager` in den nächsten Abschnitt
`Ein Tresor für alle deine Passwörter`.

Die Auswahl bleibt flüchtiger lokaler Trainingszustand und erzeugt weder ein neues persistiertes
Feld noch einen Forschungswrite. Die im Auftrag als aktuelle CHI-Studie (2026) vorgegebene
134-Dienste-Einordnung wird als Teilnehmertext übernommen; ihre Quellenvalidierung ist nicht Teil
dieses Implementierungsauftrags. `S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `2.3.0` auf
`3.0.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.finishAction` | `Abschließen` | `Weiter` | Navigation | Skalierungsszene mit drei Konten | benennt den tatsächlichen Dialogfortschritt; begrenzt | keine |
| `S09.scaling.intro` | nicht vorhanden | `Für drei Konten hast du bereits gesehen, was zusammenkommen muss: Jedes Passwort soll stark, einzigartig und später wieder abrufbar sein.` | Kerngedanke | `Weiter` zur sichtbaren Kontoerweiterung | ausdrücklich freigegebener Rückbezug auf die drei Übungskonten; freigegeben | keine |
| `S09.scaling.expansion` | nicht vorhanden | 80-Konten-Alltagseinordnung samt CHI-2026-/134-Dienste-Angabe | Orientierung | kein | ausdrücklich freigegebener Maßstabswechsel; freigegeben | keine |
| `S09.scaling.question` | nicht vorhanden | Frage nach der Realisierbarkeit starker, einzigartiger Passwörter für 80 Konten | Orientierung | eine der drei sichtbaren Antwortoptionen | ausdrücklich freigegebene Reflexionsfrage; freigegeben | keine |
| `S09.scaling.answer` | nicht vorhanden | `Super easy!` | Navigation | Antwortschaltfläche | wählt aus den drei vorgegebenen Schreibvarianten die reguläre englische Kleinschreibung mit dem spielerischen Ausrufezeichen; freigegeben | keine |
| `S09.passWo.steps.0` | nicht vorhanden | Einordnung der unrealistischen Erinnerungsanforderung und nachvollziehbarer Ausweichstrategien | Ergebnisfeedback | `Weiter` | ausdrücklich freigegebene, nicht beschämende Einordnung; freigegeben | keine |
| `S09.passWo.steps.1` | nicht vorhanden | Risiko von Wiederverwendung, ähnlichen Passwörtern und ungeschützten Listen | Mechanismuserklärung | `Weiter` | verbindet den Rückblick mit dem Skalierungsproblem; freigegeben | keine |
| `S09.passWo.steps.2` | nicht vorhanden | `Die Lösung ist, dass wir uns diese vielen Passwörter gar nicht selbst merken müssen.` | Kerngedanke | `Weiter` | bereitet die sichtbare Tresoridee vor; freigegeben | keine |
| `S09.passWo.steps.3` | nicht vorhanden | sicherer Tresor zum Erzeugen, geschützten Speichern und Ausfüllen sowie ein starkes Tresorpasswort | Mechanismuserklärung | `Weiter` zur Übergangskarte | ausdrücklich freigegebene Passwortmanager-Hinführung ohne absolute Sicherheitszusage; freigegeben | keine |
| `S09.passwordManagerTransition` | nicht vorhanden | `Sektion 2 von 3` / `Passwortmanager` / `Ein Tresor für alle deine Passwörter` | Orientierung | kein | ausdrücklich freigegebener Abschnittsübergang; freigegeben | aktive Wegmarke |

## Ablauf- und Darstellungsdelta S09 im herauszoomenden S08-Netzwerk, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. S09 beginnt unmittelbar im
vollständig gezeichneten Schutzdreieck aus S08. Beim Eintritt verschwinden ausschließlich der
Angreifer, das mittige Abschlussfeedback und die untere S08-Aktion. Die drei Konten, ihre
zugehörigen Knoten, Schilde und grünen Verbindungen bleiben als sichtbare Ausgangslage erhalten.
Die bisher zuerst eingeblendete Passwortliste gehört nicht mehr zum sichtbaren S09-Ablauf. Die
S08-Aktion heißt deshalb nicht mehr `Zum Überblick`, sondern führt als reiner Dialogfortschritt
mit `Weiter` in die erste S09-Sprechblase. `S08_NETWORK_REPLAY_CONTENT_VERSION` steigt von `3.3.0`
auf `3.4.0`.

Jeder der sieben ausdrücklich in Anführungszeichen vorgegebenen Absätze erscheint als eigener
PassWo-Sprechschritt. Mit dem zweiten Sprechschritt zoomt das bestehende Netzwerk heraus und wird
deterministisch auf insgesamt 80 Kontoknoten ergänzt. Die Ergänzung ist reine Darstellung und
leitet weder Konten noch Passwörter aus Teilnehmerdaten ab. Die einzige Antwort `Super easy!`
bleibt die konkrete Aktion der dritten Sprechblase. `S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt
von `3.0.0` auf `3.1.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.passWo.steps.0` | Text in separater Skalierungsfläche | wortgleich in eigener PassWo-Sprechblase über dem S08-Netzwerk | Kerngedanke | `Weiter` | ausdrücklich verlangte Sprecherzuordnung und sichtbare Kontinuität; keine Bedeutungsänderung | keine |
| `S09.passWo.steps.1` | Text neben separater 80-Punkte-Fläche | wortgleich in eigener PassWo-Sprechblase während das vorhandene Netzwerk herauszoomt und Knoten ergänzt | Orientierung | `Weiter` | bindet die Erklärung an die sichtbare Netzwerkveränderung; keine Bedeutungsänderung | keine |
| `S09.passWo.steps.2` | Frage in separater Skalierungsfläche | wortgleich in eigener PassWo-Sprechblase | Orientierung | Sprechblasenaktion `Super easy!` | ausdrücklich verlangte Sprecherzuordnung; keine Bedeutungsänderung | keine |
| `S09.passWo.steps.3–6` | je ein PassWo-Schritt | weiterhin je eine eigene PassWo-Sprechblase | Feedback, Mechanismuserklärung und Kerngedanke gemäß vorherigem Delta | jeweils `Weiter`, zuletzt `Zum Passwortmanager` | bestätigt die eindeutige Ein-Absatz-pro-Sprechblase-Zuordnung; keine Bedeutungsänderung | keine |
| `S08.replayActions.finish` | `Zum Überblick` | `Weiter` | Navigation | erste S09-Sprechblase im unveränderten Schutzdreieck | benennt nach Entfernung der Übersicht wieder das tatsächliche sichtbare Ziel; begrenzt | keine |

## Ablauf- und Darstellungsdelta S09 Zusammenfassung vor Netzwerkrückkehr, 15. August 2026

Quelle ist die ausdrückliche Korrektur des Nutzers vom 15. August 2026. Die vorhandene
Passwortzusammenfassung bleibt Teil von S09 und erscheint unmittelbar nach der S08-Aktion
`Weiter`. Erst ihre Aktion `Abschließen` entfernt die Zusammenfassung und kehrt in das weiterhin
vollständige Schutzdreieck zurück. Dort beginnt PassWos erster Skalierungs-Sprechschritt; der
zweite Sprechschritt löst unverändert das Herauszoomen und die Ergänzung auf 80 Konten aus.

Sowohl hinter der Zusammenfassung als auch hinter den Sprechblasen bleibt das Netzwerk sichtbar.
Die Zusammenfassung verwendet eine mittlere transparente Dimmung, die späteren Sprechschritte
eine leichtere transparente Dimmung. Eine deckende schwarze Überlagerung entfällt. Der Wortlaut
der sechs Zusammenfassungspunkte und der sieben Sprechschritte bleibt unverändert.
`S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `3.1.0` auf `3.2.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.summary` | im vorherigen Delta aus dem sichtbaren Ablauf entfernt | vorhandene Passwortzusammenfassung vor der Netzwerkrückkehr wieder sichtbar | Orientierung und Kerngedanken | `Abschließen` | ausdrückliche Nutzerkorrektur; Ablaufänderung freigegeben | vorhandene, unveränderte Hervorhebungen |
| `S09.finishAction` | `Weiter` | `Abschließen` | Navigation | Rückkehr ins Schutzdreieck und erster PassWo-Sprechschritt | benennt das tatsächliche Schließen der Zusammenfassung; begrenzt | keine |
| `S08.replayActions.finish` | `Weiter` zur ersten S09-Sprechblase | wortgleich, nun zur S09-Zusammenfassung | Navigation | S09-Zusammenfassung | berücksichtigt die wiederhergestellte Zwischenansicht; begrenzte Ablaufänderung | keine |

# S08--S09 Copy Audit

## Darstellungsdelta S08 lokale Warnung getrennt von Campusgram-Ausbreitung, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Ein Konto wird nur dann mit
seinen Unterknoten vollständig rot dargestellt, wenn eine aktive Passwortbeziehung von oder zu
Campusgram besteht. Ein ausschließlich lokal leicht zu erratendes fiktives Passwort bleibt
ansonsten mit allen Unterknoten neutral und trägt das gelieferte Warnlogo nur auf dem Hauptkonto.
Starke Konten behalten den blauen Schutzstatus. Nach der Verwendung einer eigenen Passphrase
verschwindet auch das Warnlogo zusammen mit dem lokalen Fund.

Die Gleichheits- und Abwandlungssymbole auf Risikokanten erhalten ausschließlich eine weiche
Schattenhervorhebung ohne zusätzliche Kreisfläche. Teilnehmerwortlaut, Interaktion, Persistenz,
Export, Timing und
`S08_NETWORK_REPLAY_CONTENT_VERSION 3.8.0` bleiben unverändert.

## Darstellungsdelta S08 Symbole auf Passwortbeziehungen, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Die roten gestrichelten
Risikokanten zeigen auf ihrem geometrischen Linienmittelpunkt nun dasselbe Gleichheits- oder
Abwandlungssymbol wie die S05-Beispiele und die bestimmten S06-Beziehungen. Das vorhandene kleine
Label bleibt direkt oberhalb des Symbols erhalten, einschließlich des bisherigen Hinweises auf
das alte Campusgram-Passwort. Beim Auflösen einer Beziehung verschwindet die gesamte Markierung
zusammen mit Kante und Rauchmoment.

Kantenlogik, Zustände, Interaktionen, Teilnehmerwortlaut, Persistenz, Export und Timing bleiben
unverändert. Da kein Trainingscontent geändert wird, bleibt
`S08_NETWORK_REPLAY_CONTENT_VERSION 3.8.0` unverändert.

## Darstellungsdelta S09 rote Skalierungsknoten nach Kantenaufbau, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Im bestehenden PassWo-Schritt
`S09.passWo.steps[3]` werden die roten Risikoverbindungen weiterhin in ihrer deterministischen
Reihenfolge gezeichnet. Erst nachdem die letzte dieser Kanten vollständig erschienen ist,
wechseln 60 % der weißen anonymen Kontoknoten gemeinsam in den roten Befallszustand. Die drei
bekannten geschützten Übungskonten gehören nicht zur Grundgesamtheit. Die Auswahl bleibt
reproduzierbar und vollständig authored; sie wird weder aus Teilnehmerdaten noch aus einer
Passwortanalyse abgeleitet. Bei Reduced Motion erscheinen Kanten und rote Knoten unmittelbar im
gemeinsamen Endzustand.

Der bestehende Sprechtext, seine Rolle als Ergebnisfeedback, Interaktion, Persistenz, Export und
`S09_PASSWORD_SUMMARY_CONTENT_VERSION` bleiben unverändert.

## Copy-Delta S08-S09 eigene Passwoerter, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. Ausschließlich die unten
benannten sichtbaren Texte werden ersetzt. Ablauf, Bedingungen, IDs, Interaktion, Analyse,
Persistenz, Export und Timing bleiben unverändert. Die bestehende Akzentmarkierung der S09-
Sprechblase umfasst weiterhin den vollständigen neuen Kerngedanken.
`S08_NETWORK_REPLAY_CONTENT_VERSION` steigt von `3.7.0` auf `3.8.0`;
`S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `4.2.0` auf `4.3.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S08.protectionAction` | `Einzigartige Passphrase verwenden` | `Eigene Passphrase verwenden` | Navigation | betroffener Kontoknoten | ausdrücklich vorgegebener Wortlaut; begrenzt | bestehende Knotenaktion bleibt erhalten |
| `S08.protectionActionDescription` | `… automatisch durch eine einzigartige Passphrase ersetzen.` | `… automatisch durch eine eigene Passphrase ersetzen.` | Navigation / Safety Boundary | betroffener Kontoknoten | ausdrücklich vorgegebener Wortlaut; begrenzt | keine |
| `S08.protectionSummaries.pending` | `Noch betroffene Konten können mit jeweils einer eigenen Passphrase geschützt werden.` | `Auch für die noch betroffenen Konten können wir jeweils eine eigene Passphrase verwenden.` | Ergebnisfeedback | kein | ausdrücklich vorgegebener Wortlaut; begrenzt | keine |
| `S08.protectionSummaries.complete` | `Alle betroffenen Konten sind mit eigenen Passphrasen geschützt.` | `Alle betroffenen Konten verwenden jetzt eigene Passphrasen.` | Ergebnisfeedback | kein | ausdrücklich vorgegebener Wortlaut; begrenzt | keine |
| `S08.replayCompletion` | `Konten wieder geschützt` | `Eigene Passphrasen eingerichtet` | Ergebnisfeedback | kein | ausdrücklich vorgegebener Wortlaut; begrenzt | bestehender positiver Ergebnisstil bleibt erhalten |
| `S09.passWo.steps[2]` | `… 80 starke und einzigartige Passwörter dauerhaft zu merken?` | `… 80 starke Passwörter, für jedes Konto ein eigenes, dauerhaft zu merken?` | Orientierung | `Super easy!` | ausdrücklich vorgegebener Wortlaut; begrenzt | bestehender Akzent bleibt erhalten |

## Copy-Delta S09 Passphrasenmethode umbenannt, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. Ausschließlich die sichtbare
Bezeichnung der bestehenden Passphrasenmethode wird umbenannt; der Hinweis auf mindestens sechs
zufällig gewählte Wörter bleibt wortgleich. Ablauf, Interaktionen, Persistenz und Export bleiben
unverändert. `S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `4.1.0` auf `4.2.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.principles.six-word-passphrase` | `Einfache Methode: mindestens sechs zufällig gewählte Wörter als Passphrase.` | `Merkbare Methode: mindestens sechs zufällig gewählte Wörter als Passphrase.` | Kerngedanke | kein | ausdrücklich vorgegebene Umbenennung; begrenzt | `Merkbare Methode:` fett; `Passphrase` blau |

## Copy-Delta S08 Verbindungslabels vereinheitlicht, 22. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 22. August 2026. Ausschließlich die sichtbaren
Beschriftungen der bestehenden S08-Risikokanten verwenden nun dieselbe Terminologie wie die
S06-Vergleichslabels. Kantenlogik, Zustände, internen IDs, Interaktionen, Persistenz und Export
bleiben unverändert. `S08_NETWORK_REPLAY_CONTENT_VERSION` steigt von `3.6.0` auf `3.7.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S08.relationLabels.similar` | `ähnlich` | `Leicht abgewandelt` | Ergebnisfeedback | kein | ausdrücklich vorgegebene, konsistente Terminologie; begrenzt | bestehende rote gestrichelte Kante und Text |
| `S08.relationLabels.reuse` | `wiederverwendet` | `Dasselbe` | Ergebnisfeedback | kein | ausdrücklich vorgegebene, konsistente Terminologie; begrenzt | bestehende rote gestrichelte Kante und Text |
| `S08.relationLabels.campusgramSimilar` | `ähnlich zum alten` | `Leicht abgewandelt zum alten` | Ergebnisfeedback | kein | ausdrücklich vorgegebene, konsistente Terminologie; begrenzt | bestehende rote gestrichelte Kante und Text |
| `S08.relationLabels.campusgramReuse` | `altes wiederverwendet` | `Dasselbe wie das alte` | Ergebnisfeedback | kein | ausdrücklich vorgegebene, konsistente Terminologie; begrenzt | bestehende rote gestrichelte Kante und Text |

## Copy-Delta S08 Zusammenfassungsnavigation, 22. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 22. August 2026. Der glasige S08-Button nach dem
vollständigen Angriffsrücklauf verweist weiterhin auf die anschließende S09-Übersicht, benennt
dieses Ziel nun aber präziser. Ablauf, Netzwerkdarstellung, Animation, Persistenz und Export
bleiben unverändert. `S08_NETWORK_REPLAY_CONTENT_VERSION` wird von `3.5.0` auf `3.6.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S08.replayActions.finish` | `Weiter` | `Zur Zusammenfassung` | Navigation | S09-Zusammenfassung | ausdrücklich vorgegebene Benennung des unveränderten Ziels | keine |

## Copy- und Darstellungsdelta S08 Risikoverbindungen auflösen, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026. S08 zeigt erkannte
Wiederverwendungen und Ähnlichkeiten zwischen den drei fiktiven Konten als rote gestrichelte
Beziehungskanten. Verbindungen mit Campusgram beziehen sich durch ihren Wortlaut ausdrücklich auf
das bereits ersetzte alte Campusgram-Passwort. Zwischen Master Campus und Campus E-Mail benennt
die Kante nur die erkannte Beziehungsart.

Wird `Einzigartige Passphrase verwenden` an Master Campus oder Campus E-Mail ausgelöst, zerfallen
ausschließlich die mit diesem Konto verbundenen Risikokanten und dessen Aktionshinweis. Nur ein
lokal als schwach eingeordnetes fiktives Passwort färbt den Knoten rot. Ein ansonsten starkes
Konto bleibt auch bei einer dargestellten Wiederverwendungs- oder Ähnlichkeitsbeziehung im blauen
Schutzzustand, behält aber bis zur Auflösung genau dieselbe Knotenaktion. Reduced Motion zeigt
unmittelbar denselben fachlichen Endzustand.
Alle Befunde und Änderungen bleiben flüchtig; Persistenz und Forschungswrites bleiben unverändert.
`S08_NETWORK_REPLAY_CONTENT_VERSION` steigt von `3.4.0` auf `3.5.0`.

Die Darstellungskorrektur aus dem Nutzerauftrag vom 17. August 2026 ersetzt außerdem die
aufwendige gefilterte SVG-Zerfallsanimation durch ein kurzes Opacity-Ausblenden der bereits
gestrichelten Segmente. Der Wortlaut und die Content-Version bleiben dabei unverändert.

Die nachfolgende QA-Darstellungskorrektur desselben Nutzerauftrags hält Campusgram in S08 immer im
blauen Schutzzustand und stellt die Hover-Rückmeldung für jeden Knoten mit sichtbarer
Passphrasenaktion wieder her. Zwei interne, deterministische QA-Einstiege decken die starke sowie
die schwache und gemischte Beziehungskonstellation ab. Teilnehmerwortlaut und Content-Version
bleiben unverändert.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S08.relationLabels.campusgramReuse` | keine Kantenbeschriftung | `altes wiederverwendet` | Ergebnisfeedback | kein | kennzeichnet die Beziehung zum bereits ersetzten alten Campusgram-Passwort; begrenzt | rote gestrichelte Kante und Text |
| `S08.relationLabels.campusgramSimilar` | keine Kantenbeschriftung | `ähnlich zum alten` | Ergebnisfeedback | kein | kennzeichnet die Ähnlichkeit zum bereits ersetzten alten Campusgram-Passwort; begrenzt | rote gestrichelte Kante und Text |
| `S08.relationLabels.reuse` | keine Kantenbeschriftung | `wiederverwendet` | Ergebnisfeedback | kein | benennt die erkannte Beziehung zwischen Master Campus und Campus E-Mail; begrenzt | rote gestrichelte Kante und Text |
| `S08.relationLabels.similar` | keine Kantenbeschriftung | `ähnlich` | Ergebnisfeedback | kein | benennt die erkannte Beziehung zwischen Master Campus und Campus E-Mail; begrenzt | rote gestrichelte Kante und Text |

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

## Darstellungsdelta S09 Skalierungs-Kerngedanke, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Im ersten Skalierungs-Schritt
werden `drei Konten` sowie die zusammenhängende Anforderungsphrase
`stark, einzigartig und später wieder abrufbar` hervorgehoben. Der sichtbare Wortlaut und das
Interaktionsziel `Weiter` bleiben unverändert. Die erste Phrase erhält den Akzentton, die zweite
den positiven Ton; beide bleiben zusätzlich fett ausgezeichnet, sodass Farbe nicht der einzige
Bedeutungsträger ist. `S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `3.2.0` auf `3.3.0`.
Es entstehen keine neuen persistierten Felder, Eingaben oder Trainingswrites.

| Segment und Text-ID | Aktueller und weiterhin sichtbarer Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|
| `S09.passWo.steps.0` | `Für drei Konten hast du bereits gesehen, was zusammenkommen muss: Jedes Passwort soll stark, einzigartig und später wieder abrufbar sein.` | Kerngedanke | `Weiter` | ausdrücklich freigegebene visuelle Gewichtung; keine Bedeutungsänderung | `drei Konten` fett im Akzentton; `stark, einzigartig und später wieder abrufbar` fett im positiven Ton |

## Ablauf- und Darstellungsdelta S09 Kontenskalierung von 134 auf 80, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Während des zweiten
Skalierungs-Schritts zeigt das authored Netzwerk passend zur sichtbaren CHI-2026-Einordnung
insgesamt 134 Kontoknoten. Beim Wechsel zur anschließenden konservativen 80-Konten-Frage ploppen
die 54 darüber hinausgehenden Zusatzkonten in schneller Reihenfolge auf und verschwinden. Danach
bleiben genau 80 Kontoknoten sichtbar. Der Übergang ist ein eigener Statechart-Zustand; bei
Reduced Motion wird unmittelbar derselbe 80-Konten-Endzustand gerendert.

Der sichtbare Wortlaut, die Antwortaktion und alle Forschungswrites bleiben unverändert. Die
beiden Zahlen werden als getrennte versionierte Darstellungswerte geführt.
`S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `3.3.0` auf `3.4.0`.

| Segment und Text-ID | Aktueller und weiterhin sichtbarer Text | Primäre Rolle | Interaktionsziel | Darstellungsdelta und Grund | Hervorhebung |
|---|---|---|---|---|---|
| `S09.passWo.steps.1` | Alltagseinordnung mit der CHI-2026-Angabe zu rund 134 Online-Diensten | Orientierung | `Weiter` | Netzwerk wird passend zur genannten Größenordnung auf 134 Kontoknoten erweitert | keine |
| `S09.passWo.steps.2` | Frage nach der Realisierbarkeit starker, einzigartiger Passwörter für 80 Konten | Orientierung | Sprechblasenaktion `Super easy!` nach Abschluss der kurzen Reduktion | 54 Zusatzkonten verschwinden gestaffelt; genau 80 bleiben sichtbar | keine |

## Copy- und Ablaufdelta S09 PassWo-Chat vor Passwortmanager, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Die sechs vorgegebenen Absätze
ersetzen die bisherigen sieben Skalierungs- und Passwortmanager-Schritte. Die bestehende
Ereignisfolge bleibt bis zur letzten Sprechblase unverändert: Der zweite Schritt erweitert das
Netzwerk auf 134 Konten, vor dem dritten Schritt wird es auf 80 Konten reduziert, und `Super easy!`
führt zur nicht wertenden Einordnung. Der Button `Passwortmanager` in der sechsten Sprechblase
startet die vorhandene Transition zu `Sektion 2 von 3` direkt. Der zusätzliche Tresor-Schritt und
seine vorgelagerte Pause entfallen. `S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `3.4.0` auf
`3.5.0`. Persistenz und Forschungswrites bleiben unverändert.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.passWo.steps.0` | Rückblick auf drei Konten sowie stark, einzigartig und abrufbar | `Hier im kleinen Szenario waren es nur drei Konten.` | Orientierung | `Weiter` zur Erweiterung auf 134 Konten | ausdrücklich freigegebene Straffung; begrenzt | keine |
| `S09.passWo.steps.1` | ausführliche Alltagseinordnung mit Dienstkategorien und 134-Dienste-Angabe | `Im Alltag sind es aber deutlich mehr: Eine aktuelle CHI-Studie (2026) kommt auf rund 134 Online-Dienste pro Person.` | Orientierung | `Weiter` zur Reduktion auf 80 Konten | ausdrücklich freigegebene Straffung bei gleicher Skalierungsfunktion; begrenzt | `deutlich mehr` im Akzentton |
| `S09.passWo.steps.2` | konservative Frage nach 80 Konten, Erstellung und Erinnern | `Bleiben wir unter dem Wert: Wie realistisch wäre es für dich, dir selbst „nur“ 80 starke und einzigartige Passwörter dauerhaft zu merken?` | Orientierung | Sprechblasenaktion `Super easy!` | ausdrücklich freigegebene Frageformulierung; begrenzt | `80 starke und einzigartige Passwörter dauerhaft zu merken` im Akzentton |
| `S09.passWo.steps.3` | Schwierigkeit plus Ausweichstrategien in direkter Anrede | vorgegebene nicht wertende Einordnung von Erinnerungsgrenze und nachvollziehbaren Ausweichstrategien | Ergebnisfeedback | `Weiter` | reduziert die Bewertungssprache und erhält den Erklärzweck; begrenzt | keine |
| `S09.passWo.steps.4` | kontoübergreifende Folgen und leicht zugängliche Listen | Rückbezug auf die gerade gesehenen Risiken sowie ungeschützte Passwortlisten | Mechanismuserklärung | `Weiter` | ausdrücklich freigegebene Straffung; begrenzt | `Risiken` im Warnungston |
| `S09.passWo.steps.5` | Lösungssatz zum Nicht-selbst-Merken | `Die gute Nachricht: Du musst dir all diese Passwörter auch gar nicht selbst merken.` | Kerngedanke | Button `Passwortmanager` zur Sektions-Transition | ausdrücklich freigegebene positive Hinleitung und frühere Transition; Bedeutungsänderung freigegeben | zweiter Satz vollständig im positiven Ton |
| `S09.passWo.steps.6` und Tresor-Pause | ausführliche Tresorerklärung nach animierter Zwischenpause | entfällt | Mechanismuserklärung | entfällt | ausdrücklich freigegebene frühere Transition; Bedeutungsänderung freigegeben | keine |

## Darstellungsdelta S09 Befundtitel auf 75 Prozent der Konten, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Während PassWo erklärt, dass
das dauerhafte Erinnern vieler einzelner Passwörter nicht realistisch ist, tragen 60 der 80
sichtbaren Konten einen roten Befundtitel. Die vorhandenen S06-Ergebnisbezeichnungen
`Wiederverwendet` und `Ähnlich` werden gleichmäßig auf die anonymen Zusatzkonten verteilt. Die
drei zuvor geschützten Übungskonten bleiben unmarkiert. Die Verteilung ist deterministisch und
rein illustrativ; sie wertet keine Passwörter oder Teilnehmereingaben aus und wird nicht
persistiert. Für assistive Technologien fasst ein gemeinsames Netzwerklabel die 60 Befunde
zusammen, statt die beiden Titel jeweils 30-mal vorzulesen.

Der sichtbare PassWo-Wortlaut, die Ereignisfolge und die Transition zum Passwortmanager bleiben
unverändert. `S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `3.5.0` auf `3.6.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.network.riskFindingShare` | keine Befundtitel an den 80 Skalierungskonten | 60 rote S06-Befundtitel: je 30-mal `Wiederverwendet` und `Ähnlich` | Ergebnisfeedback | kein | ausdrücklich freigegebene Illustration des Skalierungsproblems; begrenzt | roter Titeltext ergänzt Farbe als Bedeutungsträger |

## Darstellungsdelta S09 sequenzielle Befundtitel auf 60 Prozent, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Statt 75 % tragen nun exakt 60 %
der 80 sichtbaren Konten einen roten Befundtitel. Die 48 betroffenen anonymen Konten werden über
eine feste Permutation der authored Knotenreihenfolge räumlich zufällig wirkend ausgewählt. Die
Titel erscheinen mit kurzem Abstand nacheinander und sind gegenüber der S06-Standarddarstellung
deutlich kleiner. Bei Reduced Motion entfällt die Staffelung und alle Titel erscheinen sofort.

Die 48 Titel teilen sich gleichmäßig auf 24-mal `Wiederverwendet` und 24-mal `Ähnlich` auf. Die
Auswahl bleibt reproduzierbar, rein illustrativ und unabhängig von Passwörtern oder
Teilnehmereingaben. PassWo-Wortlaut, Ereignisfolge, Persistenz und Forschungswrites bleiben
unverändert. `S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `3.6.0` auf `3.7.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.network.riskFindingShare` | 75 %, 60 gleichzeitig sichtbare Titel | 60 %, 48 nacheinander erscheinende Titel an fest permutierten anonymen Knoten | Ergebnisfeedback | kein | ausdrücklich freigegebene Reduktion und sequenzielle Darstellung; begrenzt | kleiner roter Titeltext; Wortlaut bleibt zusätzlicher Bedeutungsträger |

## Darstellungsdelta S09 persistente Befundtitel und Risikoverbindungen, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Die 48 roten Befundtitel
verschwinden nicht mehr beim ersten `Weiter`, sondern bleiben auch in den anschließenden
PassWo-Schritten zu Risiken und zur guten Nachricht sichtbar. Erst die Transition zur Sektion
`Passwortmanager` beendet die Netzwerkansicht.

Zusammen mit jedem gestaffelt erscheinenden Titel wird eine dünne rote Kante zwischen zwei der
betroffenen anonymen Konten sichtbar. Insgesamt verbinden 48 Kanten alle markierten Konten in
einem geschlossenen, durch die feste Permutation räumlich verteilten Beziehungsnetz. Die Kanten
verwenden die vorhandenen S06-Arten `identical-reuse` beziehungsweise `similar-pattern`; sie
bleiben nach `Weiter` bestehen und werden bei Reduced Motion ohne Staffelung im Endzustand
gezeigt. Die Darstellung bleibt illustrativ und leitet keine Beziehung aus Teilnehmerdaten oder
Passwörtern ab.

PassWo-Wortlaut, Ereignisfolge, Persistenz und Forschungswrites bleiben unverändert.
`S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `3.7.0` auf `3.8.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.network.riskFindings` | 48 Titel nur im ersten Einordnungsschritt | 48 Titel bleiben bis zur Passwortmanager-Transition sichtbar | Ergebnisfeedback | `Weiter` verändert nur den PassWo-Schritt | ausdrücklich freigegebene Persistenz innerhalb der flüchtigen Szene; keine Bedeutungsänderung | kleine rote Titeltexte |
| `S09.network.riskRelations` | keine zusätzlichen Verbindungen | 48 dünne rote S06-Beziehungskanten erscheinen gestaffelt mit den Titeln und bleiben sichtbar | Mechanismusillustration | kein | ausdrücklich freigegebene Andeutung vieler Beziehungen; begrenzt | rote Linie plus vorhandene unterschiedliche Beziehungstypen |

## Darstellungsdelta S09 Risikoverbindungen ohne erneutes Zeichnen, 15. August 2026

Quelle ist die ausdrückliche Nutzerkorrektur vom 15. August 2026. Die Staffelungsattribute für
die 48 Titel und roten Beziehungskanten gelten nur noch beim erstmaligen Eintritt in den
Einordnungsschritt. Die beiden anschließenden `Weiter`-Ereignisse behalten dasselbe Risikonetz als
statischen Endzustand, ohne die Reveal-Animation erneut anzuwenden. Wortlaut, Knoten- und
Kantenauswahl, Persistenz sowie Forschungswrites bleiben unverändert.

`S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von `3.8.0` auf `3.9.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.network.riskRelations` | Staffelungsattribute bleiben nach `Weiter` aktiv und können die Linien erneut zeichnen | Staffelung nur beim ersten Erscheinen; danach statischer Endzustand | Mechanismusillustration | `Weiter` wechselt nur den PassWo-Text | ausdrückliche Korrektur des sichtbaren Zustandsübergangs; keine Bedeutungsänderung | unverändert |

Die nachträgliche Darstellungskorrektur desselben Auftrags trennt das dauerhafte kompakte
Linienstyling von der einmaligen Reveal-Animation. Beim Wechsel mit `Weiter` bleibt deshalb für
alle 48 Kanten die Strichstärke von `1.25px` und die reduzierte Deckkraft erhalten; lediglich die
Animationsmarkierung entfällt. Dadurch werden die persistenten Linien weder erneut gezeichnet
noch auf die deutlich dickere S06-Standarddarstellung zurückgesetzt.

## Copy- und Interaktionsdelta S09 externer Passwortmanager-Einstieg, 16. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 16. August 2026. Der letzte PassWo-Schritt behält
seinen Wortlaut und seine Rolle als positiver Kerngedanke, besitzt aber keinen eigenen Button
mehr. Stattdessen erscheint über dem weiterhin sichtbaren Netzwerk ein großes, mittig
angeordnetes, glasartiges Handlungsziel. Nur dieses Ziel startet die vorhandene Transition zur
Sektion Passwortmanager. Damit stimmen sichtbares Ziel und ausgelöste Handlung wieder eindeutig
überein. Persistenz, Forschungswrites und der Inhalt der Transitionkarte bleiben unverändert.

Der bisherige vollständige S09-QA-Einstieg bleibt als letzter `s1.x`-Eintrag erhalten. Der neue
QA-Einstieg `s2.1` beginnt unmittelbar mit der Transitionkarte und führt anschließend auf die
vorhandene Passwortmanager-Landingpage. `S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt von
`3.9.0` auf `4.0.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.passWo.steps.5` | unveränderter Kerngedanke mit Sprechblasenbutton `Passwortmanager` | Wortlaut unverändert, kein Sprechblasenbutton | Kerngedanke | mittiger Netzwerk-CTA | externe Handlung eindeutig dem sichtbaren Netzwerkziel zugeordnet; keine Bedeutungsänderung | unverändert positiv |
| `S09.passwordManagerAction` | nicht vorhanden | `Passwortmanager` / `kennenlernen` | Navigation | großer glasartiger Button über dem Netzwerk | ausdrücklich freigegebene neue Handlungszuordnung; begrenzte Darstellungsänderung | keine |

## Copy-Delta S05-S09 Terminologie für Passwort-Abwandlungen vereinheitlicht, 22. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 22. August 2026. Der benannte S09-PassWo-Schritt
unterscheidet nun ausdrücklich dasselbe Passwort, eine leichte Abwandlung und Passwortlisten.
Die Netzwerklabels in S08 sind nicht Teil dieses Deltas. Ereignisfolge, Persistenz,
Forschungswrites und Interaktionen bleiben unverändert. `S09_PASSWORD_SUMMARY_CONTENT_VERSION`
steigt von `4.0.0` auf `4.1.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S09.passWo.steps.3` | `So viele einzelne Passwörter dauerhaft im Kopf zu behalten, ist nicht realistisch. Deshalb ist es auch nachvollziehbar, dass Passwörter wiederverwendet, leicht abgewandelt oder in eigenen Listen festgehalten werden.` | `So viele einzelne Passwörter dauerhaft im Kopf zu behalten, ist nicht realistisch. Deshalb ist es auch nachvollziehbar, dass Menschen dasselbe Passwort für mehrere Konten verwenden, es leicht abwandeln oder Passwörter in eigenen Listen festhalten.` | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebene, konsistente Terminologie; begrenzt | keine |

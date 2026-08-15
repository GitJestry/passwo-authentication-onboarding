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

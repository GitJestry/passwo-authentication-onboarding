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

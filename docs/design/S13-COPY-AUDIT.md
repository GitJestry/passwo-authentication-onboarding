# S13 Copy-Audit — Ein neues Konto

## Quelle und Geltung

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026 für `12.3 – Ein neues Konto`.
Er ersetzt für S13 den bisherigen Roadmap-Titel `Passwort kann bekannt werden` durch eine
praktische My-Shop-Übung zum integrierten Passwortmanager. Die Übung verwendet ausschließlich
das authored Beispielpasswort aus S12 sowie die bereits flüchtig abgeleitete Campus-Identität.
Beides bleibt lokal und wird weder persistiert noch exportiert.

Für den neuen Content wurde `S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION 1.0.0` eingeführt.
Die ausdrücklich nachgereichte Gestaltungspräzisierung vom 25. August 2026 hebt die Version auf
`1.1.0`: Die My-Shop-Seiten werden als responsive Oberfläche nachgebaut; nur das unveränderte
Sommer-Sale-Motiv wird aus der bereitgestellten Vorlage übernommen. Produkt- und
Kategorieabbildungen dürfen neutrale Platzhalter sein.

## Copy-Delta

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S13.browser.tabLabel` | Nutzerauftrag 12.3 | nicht vorhanden | `My Shop` | Orientierung | passender einzelner Browser-Tab ausdrücklich verlangt | ausdrücklich freigegeben | kein | Einkaufswagen-Logo und Text |
| `S13.website.registration.*` | Nutzerauftrag 12.3 | nicht vorhanden | `Registrieren`; `E-Mail`; `Passwort`; `Registrieren` | Orientierung | vorgegebene Registrierungsansicht | ausdrücklich freigegeben | Passwortfeld und Registrieren-Button | Feldfokus und Buttonform statt Farbe allein |
| `S13.passwordManager.suggestAction` | Nutzerauftrag 12.3 | nicht vorhanden | `Starkes Passwort vorschlagen` | Navigation | vorgegebene browsertypische Generatorhandlung | ausdrücklich freigegeben | Vorschlag unter dem Passwortfeld | Schlüssel-Icon und fokussierbarer Eintrag |
| `S13.passwordManager.savePrompt` | Nutzerauftrag 12.3 | nicht vorhanden | `Passwort für My Shop speichern?`; flüchtige Campus-E-Mail; maskiertes Passwort; `Speichern` | Navigation | Speicherung muss eindeutig dem Browser-Passwortmanager zugeordnet sein | ausdrücklich freigegeben | Speichern-Button im Browser-Pop-up | Schlüssel-Icon, Pop-up-Position und Text |
| `S13.flow.*` | Nutzerauftrag 12.3 | nicht vorhanden | `Erzeugen`; `Speichern`; `Ausfüllen` mit offenem Kreis beziehungsweise Häkchen | Ergebnisfeedback | vorgegebener stabiler Übungsfortschritt | ausdrücklich freigegeben | kein | Symbol und Text tragen den Zustand gemeinsam |
| `S13.guide.saved` | Nutzerauftrag 12.3 | nicht vorhanden | `Der Eintrag ist gespeichert. Melde dich noch einmal an.` | Ergebnisfeedback | bestätigt die gerade ausgeführte Speicherung und benennt die nächste Aufgabe | ausdrücklich freigegeben | `Weiter` zum Loginangebot | keine |
| `S13.passwordManager.storedEntry` | Nutzerauftrag 12.3 | nicht vorhanden | gespeicherter My-Shop-Eintrag mit flüchtiger Campus-E-Mail und Passwortmaske | Navigation | vorgegebenes Autofill-Ziel | ausdrücklich freigegeben | Eintragsbutton | Schlüssel-Icon, Kontoname und Feldausfüllung |
| `S13.website.signedInStatus` | Nutzerauftrag 12.3 | nicht vorhanden | `Angemeldet` | Ergebnisfeedback | vorgegebener Abschlussstatus | ausdrücklich freigegeben | kein | Häkchen und Text |
| `S13.guide.complete` | Nutzerauftrag 12.3 | nicht vorhanden | `Gut gemacht! Schließe den Browser und schau, was sich im Netzwerk verändert hat.` | Navigation | exakt benanntes externes Abschlussziel | ausdrücklich freigegeben | Browser-Schließen-Schaltfläche | keine |
| `S13.website.shop.navigation` | Nachgereichte Gestaltungspräzisierung | nicht vorhanden | Suche, Konto, Wunschliste, Warenkorb und die in der Vorlage sichtbaren Kategorien | Orientierung | Shop muss als echte Oberfläche statt als Vollseitenbild aufgebaut sein | ergänzende, ausdrücklich freigegebene Shop-Copy | kein Übungsziel; visuelle Shop-Orientierung | Text, Icons und räumliche Gruppierung |
| `S13.website.shop.sale` | Nachgereichte Gestaltungspräzisierung und Bildvorlage | nicht vorhanden | `Sommer-Sale`; `Bis zu 40% sparen!`; `Entdecke unsere besten Angebote`; `Jetzt shoppen` | Orientierung | sichtbaren Hauptbereich der Vorlage nachbilden | ergänzende, ausdrücklich freigegebene Shop-Copy | kein | Typografie, Schaltflächenform und übernommenes Sale-Motiv |
| `S13.website.shop.catalog` | Nachgereichte Gestaltungspräzisierung | nicht vorhanden | Servicevorteile, beliebte Kategorien und fiktive Produkttitel samt Preisen | Orientierung | vollständig aufgebaute Shop-Startseite mit erlaubten Platzhalterartikeln | ergänzende, ausdrücklich freigegebene fiktive Shop-Copy | kein | Kartenstruktur, Platzhaltergrafiken und Überschriften |

## Darstellungs- und Interaktionsgrenzen

- Der in S12 markierte Browser im Desktop-Dock bleibt das einzige Ziel, das die Übung öffnet.
- Die lokalen Nutzerbilder `my shop anmelde fenster.png` und
  `my shop angemeldet geöffnet.png` dienen ausschließlich als Gestaltungsreferenzen. Anmeldung,
  Navigation, Kategorien, Servicevorteile und Artikelflächen werden als responsive HTML-/CSS-UI
  umgesetzt. Nur der zugeschnittene Sommer-Sale-Bildbereich mit Hut, Brille und Koffer wird als
  unverändertes Rastermotiv eingebettet; er enthält keine Browser- oder Shop-Bedienelemente.
- Nach dem Speichern wechselt die Website bereits zur Loginseite. Nach Auswahl des gespeicherten
  Eintrags füllt der Statechart beide Felder und öffnet anschließend die aufgebaute
  My-Shop-Startseite; der Ablauf kann nicht im Registrierungsformular enden.
- Das Passwort ist authored Content und wird nie unmaskiert angezeigt, gespeichert oder
  exportiert. Das Speichern-Pop-up verändert ausschließlich den lokalen Statechart-Zustand.
- PassWo sitzt während der Website-Handlungen in der Wartepose und steht bei verpflichtenden oder
  vom Nutzer über den Hilfe-Button geöffneten Sprechschritten auf. Reduced Motion zeigt dieselben
  fachlichen Endzustände ohne Autofill-Wartezeit.
- Erst nach vollständigem Erzeugen, Speichern und Ausfüllen wird die Browser-Schließen-Steuerung
  freigegeben. Nur sie führt zurück zum Netzwerk, in dem My Shop als neues fiktives Konto sichtbar
  wird.

## Folgeauftrag: Speichern, Autofill und Fortschritt, 25. August 2026

Der ausdrückliche Folgeauftrag präzisiert Generatorfeld, Browser-Speicherablauf, erneute Anmeldung
und PassWo-Fortschritt. Die Content-Version steigt auf
`S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION 1.2.0`. Das deterministische authored
S12-Beispielpasswort bleibt die einzige Generator-Fixture: Es umfasst 16 Zeichen und enthält
Großbuchstaben, Kleinbuchstaben, Ziffern und Sonderzeichen. Es wird nicht persistiert oder
exportiert.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.guide.saved` | `Der Eintrag ist gespeichert. Melde dich noch einmal an.` | `Der Eintrag ist im Tresor gespeichert. Melde dich noch einmal an.` | Ergebnisfeedback | ausdrücklich verlangte Zuordnung zum Passwortmanager-Tresor | begrenzt und ausdrücklich freigegeben | `Weiter` zur Loginseite | `Tresor` durch sichtbaren Ablaufkontext |
| `S13.guide.complete` | `Gut gemacht! Schließe den Browser und schau, was sich im Netzwerk verändert hat.` | `Geschafft! Schließe den Browser und schau, was sich im Netzwerk verändert hat.` | Navigation | ausdrücklich verlangter Abschlusswortlaut | Tonänderung ausdrücklich freigegeben | Browser-Schließen-Schaltfläche | keine |
| `S13.guide.hints.generate` | nicht vorhanden | `Klicke in das Passwortfeld und wähle den Vorschlag des integrierten Passwortmanagers.` | Optionaler Hinweis | Abschnitt-1-typischer Hilfe-Button wird wieder genutzt | ergänzend und ausdrücklich freigegeben | Passwortfeld und Vorschlag | `?`-Button und Sprechblase |
| `S13.guide.hints.store` | nicht vorhanden | `Registriere das Konto und bestätige danach den Speichern-Hinweis des Browsers.` | Optionaler Hinweis | aktuelle Phase über PassWo erklären | ergänzend und ausdrücklich freigegeben | Registrieren und Speichern | `?`-Button und Sprechblase |
| `S13.guide.hints.fill` | nicht vorhanden | `Wähle den gespeicherten Eintrag aus und klicke nach dem Ausfüllen selbst auf Anmelden.` | Optionaler Hinweis | Nutzer muss die Anmeldung ausdrücklich selbst abschließen | ergänzend und ausdrücklich freigegeben | gespeicherter Eintrag und Anmelden | `?`-Button und Sprechblase |
| `S13.website.registeringLabel` | nicht vorhanden | `Registrierung läuft …` | Ergebnisfeedback | barrierefreie Benennung des verlangten Ladeindikators | ergänzend | kein | zentrierter Kreislader im Registrieren-Button |

Darstellungs- und Ablaufdelta:

- Der separate Kreis-/Häkchen-Streifen entfällt. PassWo zeigt wie in S01 den aktuellen Schritt
  `Erzeugen`, `Speichern` oder `Ausfüllen`, einen Fortschrittsbalken und einen optionalen
  Hilfe-Button.
- Der Passwortvorschlag ist ein dunkles, direkt am Feld befestigtes Browser-Overlay. Er belegt
  keinen Layoutplatz und verschiebt den Registrieren-Button nicht.
- Im Passwortfeld bleibt ausschließlich der abgegrenzte Auge-Button. Das erzeugte Passwort ist
  zunächst sichtbar und lässt sich jederzeit ein- oder ausblenden.
- Nach `Registrieren` zeigt der Button kurz einen Ladeindikator. Anschließend liegt der
  browsertypische Speichern-Hinweis über der abgedunkelten, bereits geöffneten Shopseite.
- Der gespeicherte Eintrag verwendet links das My-Shop-Logo und wiederholt den Kontonamen nicht.
  Die vorhandene Autofillanimation füllt E-Mail und verdecktes Passwort. Erst der anschließende
  Nutzerklick auf `Anmelden` öffnet die Shopseite endgültig.
- Der persistente Angemeldet-Hinweis entfällt zugunsten des kurzen S01-Erfolgs-Overlays mit Haken.

## Folgeauftrag: Nicht speichern und kontenübergreifendes Autofill, 25. August 2026

Der ausdrückliche Folgeauftrag erweitert den bereits freigegebenen S13-Ablauf, ohne das übrige
Shopdesign zu ändern. `S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION` steigt von `1.2.0` auf
`1.3.0`.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.website.emailPlaceholder` | nicht vorhanden | `E-Mail-Adresse` | Orientierung | leere Loginfelder eindeutig benennen | ergänzend freigegeben | E-Mail-Feld | grauer Placeholder |
| `S13.website.passwordPlaceholder` | nicht vorhanden | `Ihr Passwort` | Orientierung | leere Passwortfelder eindeutig benennen | ergänzend freigegeben | Passwortfeld | grauer Placeholder |
| `S13.website.autofilledStatusLabel` | nicht vorhanden | `automatisch ausgefüllt` | Barrierefreiheitsstatus | die gelbe Autofill-Markierung darf nicht der einzige Bedeutungsträger sein | technisch aus dem ausdrücklich verlangten Autofill-Zustand abgeleitet | ausgefülltes E-Mail- oder Passwortfeld | Bestandteil des zugänglichen Feldnamens |
| `S13.passwordManager.dismissSaveAction` | nicht vorhanden | `Nicht jetzt` | Navigation | Speichern muss ablehnbar und erneut aufrufbar sein | ausdrücklich freigegeben | sekundärer Button | Form, Hover und Fokus |
| `S13.guide.saveDeclined.first` | nicht vorhanden | `Das Passwort ist damit noch nicht im Passwortmanager gespeichert.` | Ergebnisfeedback | Folge des Nicht-Speicherns einmalig erklären | ausdrücklich vorgegebener Wortlaut | kein | PassWo-Sprechblase |
| `S13.guide.saveDeclined.second` | nicht vorhanden | `Dann kann er es beim nächsten Anmelden auch nicht wieder für dich einsetzen. Öffne den Speicherhinweis noch einmal und speichere den Eintrag.` | Navigation | nächsten erforderlichen Schritt einmalig erklären | ausdrücklich vorgegebener Wortlaut | Passwortmanager-Symbol | kurze Pause und dezente Hervorhebung |
| `S13.passwordManager.savedStatus` | nicht vorhanden | `Passwort gespeichert` | Ergebnisfeedback | bestätigte Speicherung vor dem Fortschrittshaken sichtbar machen | ausdrücklich freigegeben | kein | Status am Passwortmanager und Schild mit Haken |
| `S13.passwordManager.autofillList` | nur My Shop | `My Shop`; `Campusgram`; `Master Campus`; `Campus E-Mail` | Navigation | alle ausdrücklich verlangten gespeicherten Übungskonten anbieten | ausdrücklich freigegeben | vier Eintragsbuttons | Reihenfolge, Kontoname und Kennung |

Darstellungs- und Ablaufdelta:

- Der Speicherhinweis zeigt Benutzername vor Passwort, enthält kein Schlüssel-Icon und stellt
  `Nicht jetzt` neben `Speichern` bereit.
- Nach `Nicht jetzt` bleiben Abdunklung und Fortschritt bei
  `Erzeugen ✓ → Speichern ○ → Ausfüllen ○`. PassWo-Hinweis und Hervorhebung erscheinen nur beim
  ersten Ablehnen; der Hinweis kann danach beliebig oft erneut geöffnet und abgelehnt werden.
- Erst die bestätigte Speicherung zeigt kurz Status und Schild-Haken. Danach wird `Speichern ✓`
  gesetzt und der Login freigegeben.
- Die Autofill-Liste öffnet sich erst nach Fokus oder Klick auf eines der beiden vollständig
  leeren Loginfelder. Manuelle Änderungen entfernen die gelbe Markierung nur am bearbeiteten Feld.
- My Shop wird ausschließlich nach tatsächlichem Speichern angeboten. Die drei bestehenden Konten
  verwenden Passphrasen aus dem versionierten lokalen S07-Pool: Campusgram über die dort gewählte
  Content-ID, die beiden anderen Konten über unterschiedliche deterministisch abgeleitete IDs.

## Folgeauftrag: Fokus, Speicherfelder und Browserhinweis, 25. August 2026

Der ausdrückliche Folgeauftrag ändert keinen geschützten Wortlaut. Die Content-Version steigt von
`1.3.0` auf `1.4.0`, weil sich Präsentation und Interaktionsvertrag des sichtbaren S13-Contents
ändern.

- Generator- und Autofill-Angebote bleiben nur sichtbar, solange der Fokus innerhalb des
  zugehörigen Felds beziehungsweise Angebots liegt. Ein Klick außerhalb schließt sie; ein Wechsel
  zwischen E-Mail- und Passwortfeld verankert das Angebot am neu gewählten Feld.
- Im Speicherhinweis stehen die Labels außerhalb der Feldkonturen. Nur die read-only Eingaben für
  Benutzername und Passwort erhalten einen Rahmen; das Passwort besitzt wieder die funktionale
  Auge-Schaltfläche.
- Nach dem ersten `Nicht jetzt` bleibt der erste vorgegebene PassWo-Satz bis zur expliziten Aktion
  `Weiter` stehen. Der zweite Satz bleibt anschließend sichtbar, bis der Speicherhinweis über das
  Passwortmanager-Symbol geöffnet wird.
- Nach jedem `Nicht jetzt` kennzeichnet eine kurze Aufwärts-/Wackelbewegung mit verbleibender
  Kontur das klickbare Passwortmanager-Symbol. Die Speicherbestätigung erscheint länger, größer
  und unterhalb des Symbols.
- Der zusätzliche Fortschrittsstreifen oben in der Website entfällt. Der bestehende
  PassWo-Aufgabenstatus bleibt die einzige Fortschrittsanzeige.
- Nach Auswahl eines gespeicherten Eintrags ist `Anmelden` bereits während der sichtbaren
  Autofill-Bewegung bedienbar; der Klick schließt den vorgesehenen Wiederanmeldepfad zuverlässig
  ab.

## Implementierungskorrektur: Fiktive Kennungen und Anmeldung, 25. August 2026

Der ausdrückliche Nutzerauftrag verlangt die Behebung des blockierten Logins. Es ändert sich kein
Teilnehmerwortlaut und keine Datenklasse. Die My-Shop-Simulation überlässt die Freigabe des
Anmeldebuttons weiterhin dem lokalen S13-Ablauf, verwendet aber keine native E-Mail-Validierung:
Die authored Campusgram-Kennung ist keine E-Mail-Adresse, und flüchtig abgeleitete fiktive
Campus-Adressen können Leerzeichen enthalten. Diese Kennungen bleiben unverändert lokal und
werden weder als reale Zugangsdaten validiert noch persistiert oder exportiert.

## Folgeauftrag: Speicherbestätigung, Autofill und Loginfehler, 25. August 2026

Der ausdrückliche Nutzerauftrag schärft den bestehenden My-Shop-Ablauf. Die Content-Version steigt
von `1.4.0` auf `1.5.0`.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.website.incorrectPassword` | nicht vorhanden | `Dieses Passwort passt nicht zum Konto.` | Ergebnisfeedback | falsche My-Shop-Anmeldungen wie in S03 sichtbar zurückmelden | ausdrücklich freigegeben; vorhandener S03-Wortlaut | Passwortfeld und Anmelden-Button | roter Rahmen, Ausrufezeichen und Text |

Darstellungs- und Ablaufdelta:

- Die Speicherbestätigung am Passwortmanager ist größer, kontrastreicher und zusätzlich durch ein
  Häkchen gekennzeichnet. PassWo beginnt den bestehenden gespeicherten Hinweis unmittelbar nach
  dem Klick auf `Speichern`; derselbe einzelne Sprechschritt enthält unmittelbar `Weiter` und kann
  die noch laufende Bestätigungsanimation zuverlässig in den Login überführen.
- Die Autofill-Liste erscheint, sobald E-Mail- oder Passwortfeld leer ist. Die Auswahl ersetzt
  weiterhin beide Felder vollständig. Während der Autofill-Bewegung werden ausschließlich die
  eingesetzten Zeichen eingeblendet; Feldkonturen, Hintergründe und Bedienelemente bleiben stabil.
- Alle Autofill-Einträge verwenden ihre kanonischen Kontologos: My Shop das Shoplogo sowie
  Campusgram, Master Campus und Campus E-Mail die bestehende lokale Symbolregistry.
- Nur das für My Shop erzeugte authored Passwort führt zur Anmeldung. Jede andere Zeichenfolge
  bleibt im Login und zeigt den roten, textlich und per Ausrufezeichen ausgezeichneten Fehler.

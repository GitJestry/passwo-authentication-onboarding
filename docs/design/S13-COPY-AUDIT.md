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

## Folgeauftrag: Netzwerktransfer und bestehendes Konto, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Er erweitert den Ablauf nach dem
Schließen des Browsers um den sichtbaren Transfer auf das Kontonetzwerk sowie Abschnitt 12.4 zum
Umgang mit bereits vorhandenen Zugangsdaten. `S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION`
steigt von `1.5.0` auf `1.6.0`.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.network.guide.newAccount` | nicht vorhanden | `Das neue Konto startet direkt mit einem eigenen starken Passwort.` | Ergebnisfeedback | erklärt den sichtbaren blauen Schild- und grünen Verbindungszustand | ausdrücklich freigegeben | `Weiter` | `eigenen starken Passwort` · positiv |
| `S13.network.guide.existingAccount` | nicht vorhanden | `Viele Passwortmanager können vorhandene Zugangsdaten auch importieren. In unserer Übung sind sie bereits gespeichert.` | Orientierung | leitet vom neuen zum bestehenden Konto über | ausdrücklich freigegeben | `Weiter` | `vorhandene Zugangsdaten auch importieren` · Akzent |
| `S13.network.guide.unchangedAtService` | nicht vorhanden | `Dadurch ändert sich das Passwort beim jeweiligen Dienst aber noch nicht.` | Mechanismuserklärung | begrenzt die Wirkung eines Imports fachlich | ausdrücklich freigegeben | `Weiter` | `noch nicht` · Warnung |
| `S13.network.guide.reusedPassword` | nicht vorhanden | `Muster Bank verwendet zum Beispiel noch dasselbe Passwort wie ein anderes Konto.` | Mechanismuserklärung | ordnet die hervorgehobene rote Beziehung ein | ausdrücklich freigegeben | `Weiter` | `dasselbe Passwort` · Warnung |
| `S13.network.guide.replaceAtService` | nicht vorhanden | `Um das zu ändern, musst du das Passwort direkt bei Muster Bank in den Einstellungen ersetzen. Lass dir dafür vom Passwortmanager ein neues erzeugen.` | Navigation | benennt Dienst-Einstellung und Generator als getrennte notwendige Schritte | ausdrücklich freigegeben | `Weiter` zum Segmentabschluss | `direkt bei Muster Bank in den Einstellungen ersetzen` · Aktion |
| `S13.trainingAriaLabel` | nur neues Konto benannt | `Training, Segment S13, ein neues und ein bestehendes Konto mit dem Passwortmanager` | Orientierung | zugängliche Segmentbenennung an Abschnitt 12.4 angepasst | begrenzt | kein | keine |

Darstellungs- und Ablaufdelta:

- Nach der freigegebenen Browser-Schließen-Handlung erscheint wieder der letzte Netzwerkstand
  aus Sektion 1. Der neue My-Shop-Knoten pulsiert einmal auf seine reguläre Größe ein.
- Nach ungefähr zwei Sekunden erhält My Shop den bestehenden blauen Kontoschild. Anschließend
  erscheinen grüne, durch sichtbare Schilde unterbrochene Verbindungen zu anderen Konten.
- Muster Bank ist ein authored bestehender Kontoknoten mit eigenem lokalen Symbol. Seine rote
  Markierung und seine roten Beziehungen bleiben sichtbar; im Beziehungsschritt wird genau eine
  Verbindung zusätzlich hervorgehoben.
- Reduced Motion überspringt Puls, Wartezeit und Kantenzeichnung, zeigt aber jeweils denselben
  fachlichen Endzustand. Farbe ist durch Konto- und Schildsymbole sowie zugängliche
  Netzwerkzusammenfassungen ergänzt.
- `/design-lab/s2-3-password-manager-network` startet deterministisch beim My-Shop-Reveal und
  macht die vollständige Statechart-Sequenz ohne erneuten Browserdurchlauf prüfbar.

## Folgeauftrag: Netzwerkfokus und Browser-Rückkehr, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Die bestehenden Erklärungen
bleiben wortgleich. `S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION` steigt von `1.6.0` auf
`1.7.0`, weil ein neuer sichtbarer Navigationsschritt zum Browser hinzukommt.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.network.guide.reopenBrowser` | nicht vorhanden | `Öffne jetzt wieder den Browser.` | Navigation | ausdrücklich verlangte Rückkehr zum erneut markierten Browser | ausdrücklich freigegeben | Browser im Desktop-Dock; kein Sprechblasenbutton | Browser-Markierung · Aktion |

Darstellungs- und Ablaufdelta:

- Die Befundtitel `Leicht abgewandelt` und `Dasselbe Passwort` werden im großen
  S13-Netzwerk nicht mehr gerendert. Beziehungssymbole und rote Linien bleiben erhalten.
- My Shop steht authored mittig oberhalb von Campusgram; Muster Bank steht auf derselben Achse
  weiter oben. My Shop wechselt mit seinem Schild in einen eindeutig blauen Zustand und erzeugt
  grüne Schildverbindungen zu allen Kontoknoten innerhalb des festgelegten Nahbereichs.
- Beim Eintritt pulsiert My Shop deutlich über seine Endgröße. Beim Wechsel zu Abschnitt 12.4
  erhält Muster Bank denselben starken Puls; sein Label liegt oberhalb des Knotens.
- Während der My-Shop- beziehungsweise Muster-Bank-Erklärungen werden die übrigen Knoten und
  Kanten abgedunkelt. Der Fokus endet mit der Aufforderung zur Browser-Rückkehr. Ab diesem
  Schritt ist ausschließlich das markierte Browser-Dock-Icon das Fortschrittsziel.

## Korrektur: Linien, Tresorfokus und Logos, 25. August 2026

Der ausdrückliche Folgeauftrag ersetzt die im unmittelbar vorherigen Auftrag festgelegte
Muster-Bank-Position und die beiden sichtbaren Knotentitel. Die Content-Version steigt von
`1.7.0` auf `1.8.0`, weil der sichtbare Tresor versionierte Orientierungstexte erhält und sich
der Browserhinweis ändert.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.network.importedVault.title` | nicht vorhanden | `Gespeicherte Zugangsdaten` | Orientierung | den geöffneten Passwortmanager-Tresor während des Importhinweises benennen | ergänzend und ausdrücklich freigegeben | kein | Tresor leuchtet kurz auf |
| `S13.network.importedVault.entries` | nicht vorhanden | `My Shop`; `Campusgram`; `Master Campus`; `Campus E-Mail`; `Muster Bank`; weitere fiktive Einträge | Orientierung | bereits gespeicherte Übungszugänge als große Liste sichtbar machen | ergänzend und ausdrücklich freigegeben | kein | feste Reihenfolge und Kontologos |
| `S13.network.importedVault.moreLabel` | nicht vorhanden | `Weitere gespeicherte Zugangsdaten …` | Orientierung | die verlangten weiteren Namen ohne reale Zugangsdaten andeuten | ergänzend | kein | abgeschwächte Folgeeinträge |
| `S13.network.guide.reopenBrowser` | `Öffne jetzt wieder den Browser.` | `Öffne dazu wieder den Browser.` | Navigation | ausdrücklich verlangter Wortlaut | begrenzt und ausdrücklich freigegeben | markierter Browser im Desktop-Dock | `Browser` · Aktion |

Darstellungs- und Ablaufdelta:

- Zuerst kehrt das bestehende Netzwerk zurück. Erst anschließend ersetzt My Shop einen anonymen
  Kontoknoten oberhalb von Campusgram und pulsiert langsam und deutlich über seine Endgröße.
- Muster Bank bleibt an der zuvor verwendeten authored Position des bestehenden anonymen
  Risikoknotens. Sie besitzt genau eine rote Beziehung. Die vorhandenen Linienarten,
  Strichmuster und Strichstärken werden nicht durch S13-spezifische Animationen überschrieben.
- Die sichtbaren Zusatzlabels `My Shop` und `Muster Bank` entfallen. Die Konten bleiben durch ihre
  Logos, zugänglichen Knotennamen und die PassWo-Erklärung identifizierbar.
- Während der Importerklärung erscheint rechts unten ein geöffneter Tresor. Die feste Liste zeigt
  ausschließlich fiktive authored Kontonamen und Maskenzeichen, keine Eingaben oder gespeicherten
  Passwörter. Tresor und Liste erhalten kurz den Fokus; das Netzwerk bleibt dabei noch gut
  erkennbar.
- Muster Bank wird erst beim Satz über das wiederverwendete Passwort fokussiert und pulsiert dort
  langsam. In der Sprechblase kennzeichnet das grüne Bankmonument-Logo den Kontonamen; im
  anschließenden Satz kennzeichnet ein großes Zahnrad das Wort `Einstellungen`.
- Der allgemeine Fokus reduziert Deckkraft und Helligkeit der übrigen Knoten und Kanten weniger
  stark als zuvor. Reduced Motion zeigt dieselben Endzustände ohne Puls- oder Leuchtbewegung.

## Folgeauftrag: Persistenter Tresor-, Netzwerk- und Speicherfokus, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Teilnehmertexte in S13 bleiben
wortgleich; deshalb ändert sich die Content-Version nicht.

Darstellungs- und Ablaufdelta:

- Der geöffnete Tresor rechts unten verwendet dieselbe Tresorform wie die S12-Beispiele. Die
  authored Liste liegt vollständig im Tresor, wird größer dargestellt und bleibt ab der
  Importerklärung über alle folgenden Muster-Bank-Schritte bis zur Browseröffnung sichtbar.
- Das vollständige S09-Netz bleibt während der Browserübung gemountet. Reine Sprechschrittwechsel
  berechnen weder seine 80 Kontoknoten noch seine Kanten neu; beim Schließen des Browsers wird nur
  der fachlich geänderte Snapshot projiziert.
- Ab der Rückkehr aus dem Browser bleibt das Netzwerk durchgehend transparent abgedunkelt. Der
  Zustand beginnt vor der ersten Netzwerkbotschaft und endet nicht zwischen den folgenden
  Sprechschritten. My Shop beziehungsweise Muster Bank bleiben als Form-, Logo- und
  Helligkeitsfokus erkennbar; der Muster-Bank-Fokus bleibt bis zur Browseraufforderung bestehen.
- Die unverändert aus S09 übernommenen Risikokanten behalten ihre Endpunkte, Strichstärke und den
  durchgezogenen S09-Endstil. Nur der authored Risikoknoten für Muster Bank wird unter
  Beibehaltung genau einer vorhandenen Beziehung umbenannt; die übrigen Beziehungen werden nicht
  neu verbunden.
- Nach dem ersten `Nicht jetzt` wiederholt das Passwortmanager-Symbol eine Sequenz aus Vergrößern,
  Wackeln, Verkleinern und Pause. Sie endet beim erneuten Öffnen des Hinweises, beim Speichern oder
  beim zweiten `Nicht jetzt`. Reduced Motion zeigt den Fokusrahmen ohne Bewegung.
- Der Zeichen-Autofill dauert 0,5 Sekunden weniger; E-Mail und Passwort beginnen weiterhin
  gleichzeitig und enden im selben fachlichen Zustand.

## Korrektur: Getrennter Tresor- und Bankfokus, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Teilnehmertexte in S13 bleiben
wortgleich; deshalb ändert sich die Content-Version nicht.

Darstellungs- und Ablaufdelta:

- Während `Viele Passwortmanager können vorhandene Zugangsdaten auch importieren …` wird kein
  Netzwerkknoten hervorgehoben. Stattdessen pulsiert ausschließlich der geöffnete Tresor subtil
  und wiederholt bis zum nächsten Sprechschritt. Beim anschließenden Hinweis zur unveränderten
  Dienstseite bleibt das Netzwerk ebenfalls ohne Einzelknotenfokus.
- Muster Bank beginnt erst beim Satz `Muster Bank verwendet zum Beispiel noch dasselbe Passwort
  wie ein anderes Konto.` mit dem vorhandenen Fokus-Puls. Danach bleibt der Bankfokus bis zur
  Browseraufforderung bestehen.
- Der Muster-Bank-Knoten behält in jedem S13-Netzwerkframe seine dunkelrote Befallsfläche; ein
  weißer Zwischenzustand mit nur roter Umrandung entfällt.
- Der persistente S13-Tresor ist kleiner, skaliert anhand von Breite und Höhe der Artifact Stage
  und verwendet dieselbe proportional schmalere offene Tür wie die S12-Tresore.
- Die Fortschrittsanzeige wechselt unmittelbar mit `Speichern` zum Ausfüllschritt, während die
  sichtbare Speicherbestätigung weiterlaufen darf. Der Zeichen-Autofill wird auf 250 ms verkürzt.
- Reduced Motion ersetzt die wiederholte Tresorbewegung durch einen statischen Leuchtrahmen und
  zeigt weiterhin dieselben fachlichen Zustände.
- Der für MyShop vorgesehene anonyme S09-Platzhalter und seine Kanten werden bereits im ersten
  zurückgekehrten Netzwerkframe ausgeblendet. Erst der fachliche MyShop-Reveal setzt an dieser
  Position den Logo-Knoten ein; ein kurz sichtbarer weißer Ersatzknoten entfällt.

## Folgeauftrag: Passwort bei Muster Bank ändern, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Er schließt die bisherige
Browseraufforderung mit einer praktischen Passwortänderung bei Muster Bank ab. Die Content-Version
steigt von `1.8.0` auf `2.0.0`, weil der S13-Ablauf um die vollständige Bankübung und ihren
Netzwerkabschluss erweitert wird. Die lokalen Dateien `muster login.png`,
`muster navigationen.png` und `muster einstellung navigationen.png` dienen ausschließlich als
Gestaltungsreferenz. Der darin enthaltene My-Shop-Screenshot wird nicht übernommen.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.bank.website.navigation.*` | nicht vorhanden | `Übersicht`; `Konten`; `Überweisungen`; `Karten`; `Einstellungen` | Navigation | alle fünf ausdrücklich verlangten Bankbereiche müssen erreichbar sein | ausdrücklich freigegeben | jeweiliger Seitenleistenbutton | aktiver Zustand zusätzlich zu Text und Icon |
| `S13.bank.website.settings.password.*` | nicht vorhanden | `Passwort ändern`; `Aktuelles Passwort`; `Neues Passwort`; `Passwort ändern`; `Passwort geändert` | Navigation und Ergebnisfeedback | ausdrücklich vorgegebener Dienstablauf und sichtbare Bestätigung | ausdrücklich freigegeben | neues Passwortfeld und Formularbutton | Feldfokus sowie Häkchen mit Textstatus |
| `S13.bank.passwordManager.suggestAction` | My-Shop-Wortlaut | `Starkes Passwort vorschlagen` | Navigation | Passwortmanager-Vorschlag soll wortgleich wiederverwendet werden | keine | Vorschlag am neuen Passwortfeld | Schlüssel-Icon und fokussierbarer Eintrag |
| `S13.bank.passwordManager.updatePrompt` | nicht vorhanden | `Gespeichertes Passwort für Muster Bank aktualisieren?`; `Nicht jetzt`; `Aktualisieren` | Navigation | Browser-Tresor muss nach der Dienständerung separat aktualisiert werden | ausdrücklich freigegeben | Update-Pop-up und Passwortmanager-Symbol | Schlüssel-Icon, Pop-up-Position und Buttonform |
| `S13.bank.guide.updateDeclined.first` | nicht vorhanden | `Im Passwortmanager ist damit noch das alte Passwort gespeichert.` | Ergebnisfeedback | ausdrücklich vorgegebene Folge von `Nicht jetzt` | ausdrücklich freigegeben | `Weiter` | keine |
| `S13.bank.guide.updateDeclined.second` | nicht vorhanden | `Damit er beim nächsten Anmelden das neue verwendet, öffne den Hinweis noch einmal und aktualisiere den Eintrag.` | Mechanismuserklärung | trennt Dienstpasswort und Tresoreintrag fachlich | ausdrücklich freigegeben | `Weiter` zum freien, aber noch unvollständigen Zustand | keine |
| `S13.bank.guide.updateDeclined.reminder` | nicht vorhanden | `Aktualisiere den Eintrag, damit der Passwortmanager das neue Passwort verwendet.` | Navigation | erneut aufrufbares Update-Ziel eindeutig benennen | ausdrücklich freigegeben | wackelndes Passwortmanager-Symbol | Passwortmanager-Fokus statt Texthervorhebung |
| `S13.bank.guide.updated` | nicht vorhanden | `Jetzt ist auch im Passwortmanager das neue Passwort gespeichert. Melde dich noch einmal an.` | Ergebnisfeedback | Wirkung der bestätigten Aktualisierung und nächste Handlung benennen | ausdrücklich freigegeben | `Weiter` zur Loginseite | Browserstatus `Passwort aktualisiert ✓` |
| `S13.bank.guide.autofill` | nicht vorhanden | `Der Passwortmanager erkennt, bei welchem Dienst du dich anmeldest, und kann den passenden gespeicherten Eintrag automatisch ausfüllen.` | Mechanismuserklärung | ausdrücklich vorgegebene Einordnung des automatischen Ausfüllens | ausdrücklich freigegeben | Anmelden-Button nach Autofill | sichtbares Autofill-Angebot und Feldstatus |
| `S13.bank.guide.complete` | nicht vorhanden | `Schließe den Browser und schau, was die Änderung bei Muster Bank im Netzwerk bewirkt.` | Navigation | tatsächlich zu bedienende Fenstersteuerung benennen | ausdrücklich freigegeben | Browser-Schließen-Schaltfläche | keine |
| `S13.network.guide.passwordChanged` | nicht vorhanden | `Muster Bank hat jetzt ein eigenes Passwort. Der bisherige Verbindungsweg ist weg.` | Ergebnisfeedback | sichtbaren Schutzstatus und entfernte Risikobeziehung einordnen | ausdrücklich freigegeben | `Weiter` zum Segmentabschluss | `eigenes Passwort` · positiv |

Darstellungs- und Ablaufdelta:

- Der Muster-Bank-Login übernimmt Aufbau und Passwortmanager-Verhalten der My-Shop-Anmeldung,
  erhält aber die grün-gelbe Bankgestaltung aus den Referenzen. Beim ersten und beim erneuten
  Login wird der passende lokale Übungseintrag automatisch angeboten und in 250 ms ausgefüllt.
- Die fünf Navigationen wechseln echte responsive HTML-/CSS-Seiten. Salden, IBANs,
  Kartennummern, Limits und Aktivitäten erscheinen ausschließlich maskiert oder als
  `Ausgeblendet`. Neutrale `MB`-Kartenmarken ersetzen reale Kreditkartenlogos; es werden keine
  Kontoauszüge oder scheinbar echten Finanzdaten erzeugt.
- Der verpflichtende Weg führt über `Einstellungen` → `Sicherheit` → `Passwort`. Das aktuelle
  fiktive Passwort ist initial maskiert und nur über den lokalen Auge-Button sichtbar. Der
  Generator verwendet eine zweite deterministische lokale 16-Zeichen-Fixture, die weder
  persistiert noch exportiert wird.
- Nach der Dienständerung bleibt `Passwort geändert ✓` sichtbar, bevor der browsertypische
  Update-Hinweis erscheint. Nach dem ersten `Nicht jetzt` folgen drei getrennte PassWo-Schritte.
  Im anschließenden Zustand sind alle fünf Bankbereiche frei navigierbar; nur das erneut
  hervorgehobene Passwortmanager-Symbol kann den erforderlichen Update-Hinweis öffnen.
- `Aktualisieren` zeigt `Passwort aktualisiert ✓`, danach folgt der automatische Autofill mit dem
  neuen Eintrag. Erst die erneute Anmeldung gibt die Browser-Schließen-Steuerung frei.
- Nach dem Schließen bleibt Muster Bank voll hervorgehoben, während das übrige Netzwerk
  transparent abgedunkelt bleibt. Genau die eine bisherige rote Beziehung löst sich von beiden
  Enden; anschließend wird sie durch zwei grüne Liniensegmente mit mittigem Schild ersetzt und der
  Muster-Bank-Knoten erhält den blauen Schutzstatus. Reduced Motion projiziert denselben
  fachlichen Endzustand ohne Auflösungs- oder Einblendbewegung.

## Folgeauftrag: Verfeinerte Bankoberfläche und Abmeldeablauf, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Diese Entscheidung ersetzt für
die Muster-Bank-Übung die im vorherigen Delta beschriebene automatische Erstanmeldung und den
direkten Wechsel vom Update-Hinweis zur Anmeldung. Die Content-Version steigt von `2.0.0` auf
`2.1.0`.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.bank.website.username` | `AnneM` | flüchtig abgeleitete Benutzernamenvariable | Orientierung | ausdrücklich verlangte Übernahme der lokalen Übungsidentität | begrenzt | Loginfelder und Begrüßung | keine |
| `S13.bank.website.forgotPasswordLabel` | `Passwort vergessen?` | entfällt | Orientierung | ausdrücklich verlangte Entfernung | nein | kein | keine |
| `S13.bank.website.overview/accounts/transfers/cards.*` | wenige Überschriften und Platzhalter | zusätzliche Schnellzugriffe, Kontozwecke, verdeckte Aktivitätsgruppen, Überweisungsfelder, Auftragsbereiche, Kartenstatus und Funktionschips | Orientierung | ausdrücklich verlangte sinnvollere Seitendichte ohne scheinbar echte Finanzwerte | begrenzt | jeweilige Navigationsseite; Zusatzflächen lösen keinen Trainingsfortschritt aus | Icons, Gliederung und weiterhin maskierte Werte |
| `S13.bank.website.settings.detail/securityDetail` | `Verwalten Sie Ihre Daten und Sicherheitseinstellungen.`; `Verwalten Sie Ihre Sicherheitseinstellungen.` | entfällt | Orientierung | ausdrücklich verlangte Entfernung redundanter Unterzeilen | nein | kein | keine |
| `S13.bank.website.settings.currentPasswordLabel` | `Aktuelles Passwort` | `Altes Passwort` | Navigation | ausdrücklich verlangte Feldbezeichnung | nein | altes Passwortfeld | Feldlabel |
| `S13.bank.website.settings.confirmNewPasswordLabel` | nicht vorhanden | `Neues Passwort bestätigen` | Navigation | beide neuen Passwortfelder sollen denselben Generatorvorschlag übernehmen | ausdrücklich freigegeben | Bestätigungsfeld | Feldfokus |
| `S13.bank.website.settings.passwordAdvice` | `Verwenden Sie für Muster Bank ein eigenes Passwort.` | `Wählen Sie ein starkes Passwort aus, das Sie nicht für andere Konten verwenden.` mit `Weitere Informationen` | Orientierung | ausdrücklich verlangte, zur sichtbaren Aufgabe passende Einordnung | begrenzt | aufklappbarer Informationshinweis | blauer unterstrichener Text und Fragezeichen im Kreis |
| `S13.bank.passwordManager.suggestAction` | `Starkes Passwort vorschlagen` | `Sicher erzeugtes Passwort verwenden` | Navigation | ausdrücklich verlangte Generatorbezeichnung | begrenzt | Vorschlag unter einem der beiden neuen Passwortfelder | Schlüssel-Icon |
| `S13.bank.guide.hints.login` | automatische Erstanmeldung | `Öffne das Passwortfeld und wähle den gespeicherten Eintrag für Muster Bank.` | Navigation | tatsächliche Auswahlhandlung beim ersten Login benennen | ausdrücklich freigegeben | Passwortfeld und Muster-Bank-Eintrag | Passwortmanager-Angebot |
| `S13.bank.website.incorrectPassword` | nicht vorhanden | `Dieser gespeicherte Eintrag passt nicht zu Muster Bank.` | Ergebnisfeedback | falschen gespeicherten Eintrag sachlich auflösen | ergänzend | erneute Auswahl aus der Passwortmanager-Liste | Fehlericon und Text |
| `S13.bank.website.settings.changingPasswordLabel/passwordChangedStatus` | statischer Formularstatus | `Passwort wird geändert …`; anschließend Toast `Passwort geändert` | Ergebnisfeedback | ausdrücklich verlangte Ladephase mit kurzem Ergebnis-Toast | ausdrücklich freigegeben | Formularbutton, danach automatischer Rücksprung zu `Sicherheit` | Spinner sowie Häkchen mit Text |
| `S13.bank.guide.updated` | `Jetzt ist auch im Passwortmanager das neue Passwort gespeichert. Melde dich noch einmal an.` | `Jetzt ist auch im Passwortmanager das neue Passwort gespeichert. Melde dich ab und anschließend mit dem neuen Passwort wieder an.` | Ergebnisfeedback | ausdrücklich verlangter Abmeldeweg | ausdrücklich freigegeben | `Weiter`, anschließend `Abmelden` | keine |
| `S13.bank.guide.autofill` | `Der Passwortmanager erkennt, bei welchem Dienst du dich anmeldest, und kann den passenden gespeicherten Eintrag automatisch ausfüllen.` | `Der Passwortmanager erkennt den Dienst und füllt den passenden Eintrag automatisch aus.` | Mechanismuserklärung | ausdrücklich verlangte Kürzung | begrenzt | automatisch ausgefüllte erneute Anmeldung | keine |
| `S13.bank.website.logoutConfirmation.*` | nicht vorhanden | `Von Muster Bank abmelden?`; `Sie gelangen zurück zur Anmeldung.`; `Abbrechen`; `Abmelden` | Navigation | Abmeldung vor dem Login nachvollziehbar bestätigen | ergänzend und ausdrücklich freigegeben | Bestätigungsdialog | Primärbutton und Text |

Darstellungs- und Ablaufdelta:

- Beim ersten Login bleiben beide Felder leer, bis die Person aus derselben Mehrfachliste wie bei
  My Shop den richtigen Muster-Bank-Eintrag auswählt. Ein anderer Eintrag führt ausschließlich zu
  lokalem Fehlerfeedback. Beim Login nach der bestätigten Abmeldung wird dagegen der aktualisierte
  Muster-Bank-Eintrag automatisch angeboten und ausgefüllt.
- Die feste obere Kontoleiste entfällt. In der Seitenleiste steht das große Muster-Bank-Logo ohne
  Wortmarke mittig. Die fünf Seiten erhalten zusätzliche, weiterhin vollständig maskierte
  Inhaltsgruppen; weder Salden noch Kontonummern oder Buchungsdaten werden ergänzt.
- `Sicherheit` und anschließend `Passwort` erhalten neben Text und Icon einen hellblauen Hinweis-
  zustand. Das Feld `Altes Passwort` bleibt neutral; nur die beiden generatorgestützten neuen
  Passwortfelder verwenden die Assisted-Darstellung.
- Nach `Passwort ändern` zeigt der Button einen Ladezustand. Danach springt die Bank automatisch
  zu `Sicherheit`, zeigt unten kurz den Toast `Passwort geändert` und hält gleichzeitig den
  browserseitigen Update-Hinweis oben rechts bereit.
- Nach dem bestätigten Passwortmanager-Update verschwindet PassWo mit `Weiter`. Die Person meldet
  sich über den Seitenleistenbutton und einen kurzen Bestätigungsdialog ab. Erst dann folgt die
  automatische Anmeldung mit dem neuen Eintrag.
- Der zusätzliche Design-Lab-Punkt `s2-4-muster-bank-login` ist ein lokaler QA- und
  Resume-Einstieg in die Bankanmeldung. Er führt keine neue persistierte Datenklasse und keinen
  serverseitigen Studiencheckpoint ein.

## Folgeauftrag: Robuste Autofill-Auswahl und gestufter Bankschutz, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Die Content-Version steigt von
`2.1.0` auf `2.2.0`. Alle Zugangsdaten bleiben feste lokale Übungswerte; weder Feldinhalte noch
die simulierten Tresoreinträge werden persistiert oder exportiert.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.passwordManager.suggestAction` | `Starkes Passwort vorschlagen` | `Sicher erzeugtes Passwort verwenden` | Navigation | ausdrücklich verlangte einheitliche Generatorbezeichnung in My Shop und Muster Bank | begrenzt | Vorschlag am Passwortfeld | Schlüssel-Icon |
| `S13.network.guide.reopenBrowser` | `Öffne dazu wieder den Browser.` | entfällt | Navigation | der unmittelbar vorherige Einstellungs-Hinweis markiert bereits den Browser als einziges externes Fortschrittsziel | ausdrücklich freigegeben | markierter Browser im Desktop-Dock | Browsermarkierung statt eigener Sprechblase |
| `S13.bank.website.cards.detail` | `Verwalten Sie Ihre Bankkarten und Einstellungen.` mit Status-, Funktions- und Aktionszusätzen | `Ihre Karten auf einen Blick.` mit Kartentitel, maskierter Nummer, verdecktem Limit und Datenschutzhinweis | Orientierung | ausdrücklich verlangte Reduktion der überladenen Kartenseite | begrenzt | Kartenseite | Kartenform und neutrale `MB`-Marke |
| `S13.bank.guide.autofill` | `Der Passwortmanager erkennt den Dienst und füllt den passenden Eintrag automatisch aus.` | `Vorhin hast du den gespeicherten Eintrag noch selbst ausgewählt. Diesmal hat ihn der Passwortmanager direkt ausgefüllt. Bei vielen Anmeldungen kann er das automatisch übernehmen.` | Mechanismuserklärung | ausdrücklich verlangter Vergleich zwischen manueller Auswahl und automatischem Ausfüllen | ausdrücklich freigegeben | automatisch ausgefüllte erneute Anmeldung | keine |
| `S13.bank.guide.complete` | `Schließe den Browser und schau, was die Änderung bei Muster Bank im Netzwerk bewirkt.` | `Schließe den Browser wieder und schau, was die Änderung bei Muster Bank im Netzwerk bewirkt.` | Navigation | ausdrücklich verlangter Rückbezug auf die vorherige Browserhandlung | begrenzt | Browser-Schließen-Schaltfläche | keine |

Darstellungs- und Ablaufdelta:

- My Shop und Muster Bank öffnen ihre Autofill-Liste nach Fokus in Benutzername oder Passwort
  unabhängig von der aktuellen Zeichenzahl. Beide Loginfelder bleiben editierbar; das Verlassen
  eines Feldes sperrt den gefüllten Anmeldebutton nicht mehr.
- Die Muster-Bank-Liste enthält zusätzlich den festen lokalen MyShop-Übungseintrag mit dem
  bereits versionierten MyShop-Übungspasswort und dem lokalen MyShop-Logo. Beim ersten Banklogin
  akzeptiert die Statechart ausschließlich den ausgewählten Muster-Bank-Eintrag. Das alte
  Muster-Bank-Passwort ist die authored Fixture `Passw0rtGeheim!?`.
- Der browserseitige Status `Passwort aktualisiert` endet statechart-gesteuert nach zwei Sekunden.
  Im anschließenden Abmeldeschritt bleibt der beschriftete Abmelden-Button sichtbar hervorgehoben
  und besitzt Fokus-, Hover- und Presszustände; dieselben Zustände gelten für alle fünf
  Navigationsbuttons.
- Die rote Muster-Bank-Beziehung trägt bis zum Browserwechsel mittig die sichtbare Kennzeichnung
  `dasselbe`. Nach dem Schließen des Browsers pulsiert zuerst der Muster-Bank-Knoten, dann erscheint
  sein blauer Kontoschild und zuletzt die grüne, durch einen mittigen Schild unterbrochene
  Schutzverbindung. Reduced Motion zeigt dieselben drei fachlichen Endzustände ohne Bewegung.

## Folgeauftrag: Browserhinweise und Bankinteraktion, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Die Content-Version steigt von
`2.2.0` auf `2.3.0`, weil Buttonwortlaut, Reminder-Rolle und die authored Hervorhebung im sichtbaren
S13-Content geändert werden.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.bank.website.loginAction` | `Weiter` | `Anmelden` | Navigation | Button benennt die tatsächlich ausgelöste Anmeldung | begrenzt und ausdrücklich freigegeben | Anmeldebutton | Buttonform, Hover und Fokus |
| `S13.bank.guide.updateDeclined.reminder` | Wortgleich als dauerhafter Pflichtsprechschritt | Wortgleich als optionaler Hinweis nach Klick auf `?` | Optionaler Hinweis | PassWo soll außerhalb geöffneter Hilfe in die Sitzpose zurückkehren | keine | PassWo-Hinweisbutton; anschließend Passwortmanager-Symbol | Passwortmanager-Fokus statt Texthervorhebung |
| `S13.bank.guide.autofill` | keine Hervorhebung | `direkt ausgefüllt` · positiv | Mechanismuserklärung | ausdrücklich verlangte Markierung des Unterschieds zur vorherigen manuellen Auswahl | keine | automatisch ausgefüllte erneute Anmeldung | `direkt ausgefüllt` · positiv |

Darstellungs- und Interaktionsdelta:

- My Shop und Muster Bank verwenden jeweils ein eigenes weißes, gerundetes Browser-Pop-up oben
  rechts mit klarer Primär- und Sekundäraktion. Die Hinweise bleiben bewusst stilisiert und bilden
  keinen realen Browser pixelgenau nach.
- `Einstellungen`, `Sicherheit` und `Passwort ändern` werden als bedienbare Breadcrumb-Ziele für
  die Rücknavigation gerendert. Die hervorgehobenen Einträge `Sicherheit` und `Passwort` besitzen
  sichtbare Hover-, Druck- und Fokuszustände.
- Nach Ablauf des Status `Passwort aktualisiert` zeigt der Browser wieder das normale
  Passwortmanager-Symbol. Die Schilddarstellung bleibt kein dauerhafter Zustand.
- Die Kennzeichnung `dasselbe` und ihr Gleichheitssymbol werden in einer eigenen Ebene über allen
  Netzwerkkanten gerendert. Beim Schutz von My Shop und Muster Bank wird das bereits vorhandene
  S08-Konfetti am jeweiligen Kontoknoten wiederverwendet; Reduced Motion behält den fachlichen
  Schutzendzustand ohne Konfettibewegung.

## Folgeauftrag: Robuster Bank-Login und vollständiger Update-Hinweis, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Die Content-Version steigt von
`2.3.0` auf `2.4.0`, weil die Feldbezeichnungen des erweiterten Passwortmanager-Hinweises als
versionierter Teilnehmertext ergänzt werden. Die lokalen Übungswerte bleiben flüchtig und werden
weder persistiert noch exportiert.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.bank.passwordManager.usernameLabel` | nicht vorhanden | `Benutzername` | Orientierung | der Aktualisierungshinweis zeigt den betroffenen lokalen Login vollständig | ergänzend | schreibgeschütztes Benutzernamefeld | Feldlabel |
| `S13.bank.passwordManager.passwordLabel` | nicht vorhanden | `Passwort` | Orientierung | das neue Passwort wird zunächst verdeckt und kann über das Auge eingeblendet werden | ergänzend | schreibgeschütztes Passwortfeld und Sichtbarkeitsschalter | Feldlabel und Auge-Icon |

Darstellungs- und Interaktionsdelta:

- Der erste und der erneute Banklogin prüfen Benutzername und Passwort gemeinsam. Nach dem
  automatischen Ausfüllen bleiben Änderungen möglich; ein veränderter Eintrag erzeugt sichtbares
  Fehlerfeedback. Ein erneuter Feldfokus öffnet die Passwortmanager-Liste, deren Muster-Bank-
  Eintrag nach dem Update bereits das neue lokale Übungspasswort enthält.
- Nach beiden erfolgreichen Bankanmeldungen erscheint derselbe kurze Status `Angemeldet` wie bei
  My Shop.
- Nach `Nicht jetzt` steht der erste Hinweis unten rechts. Der zweite Pflichtsatz besitzt keinen
  `Weiter`-Button und hält die Seite abgedunkelt, bis das hervorgehobene Passwortmanager-Symbol
  erneut gewählt wird. Beim erneuten Popup sitzt PassWo in der Wartepose; ein weiteres
  `Nicht jetzt` führt nur noch zum optionalen Hilfezustand.
- Das Gleichheitssymbol mit `dasselbe` erscheint erst zusammen mit dem Satz über das bei Muster
  Bank wiederverwendete Passwort. Das Bildsymbol ist gegenüber der vorherigen Fassung halbiert;
  der Text bleibt lesbar und die gemeinsame Ebene bleibt über den Kanten.

## Fehlerkorrektur: Vollständiger Autofill-Endwert, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Teilnehmertexte und
Content-Version bleiben unverändert. Die Autofill-Animation meldet ihren Abschluss erst, nachdem
Benutzername beziehungsweise E-Mail-Adresse und Passwort ausdrücklich mit ihren vollständigen
lokalen Übungswerten gesetzt wurden. Die My-Shop- und Muster-Bank-Statecharts wechseln nicht mehr
über einen parallelen Zeitgeber in den anmeldebereiten Zustand. Dadurch können verzögerte oder
ausgelassene Browser-Animationsframes keine abgeschnittenen Feldwerte mehr hinterlassen. Reduced
Motion setzt dieselben vollständigen Werte unmittelbar vor dem Zustandswechsel. Der My-Shop-
Anmeldebutton bleibt wie der Muster-Bank-Button bis zu diesem gemeldeten Abschluss gesperrt; ein
vorzeitiges Absenden teilweise animierter Werte wird auch von der Statechart nicht akzeptiert.

## Darstellungskorrektur: Tab-Reihenfolge bei Muster Bank, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Teilnehmertexte und
Content-Version bleiben unverändert. In der Muster-Bank-Browseransicht steht der bereits
versionierte Tab `My Shop` an erster Stelle, gefolgt vom aktiven Tab `Muster Bank`. Muster Bank
bleibt fokussiert und bestimmt Adresse sowie Seiteninhalt; My Shop ist in dieser Szene nur als
vorheriger Kontext sichtbar und nicht auswählbar.

## Folgeauftrag: Zusammengeschriebener MyShop-Tab, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Die Content-Version steigt von
`2.4.0` auf `2.5.0`, weil die gemeinsame sichtbare Tab-Beschriftung geändert wird.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.browser.tabLabel` | `My Shop` | `MyShop` | Orientierung | ausdrücklich verlangte einheitliche Zusammenschreibung in beiden Browseransichten | nein | aktiver Tab der MyShop-Übung und inaktiver erster Tab bei Muster Bank | Tabmarke |

Der Website-Name und die übrigen authored Vorkommen von `My Shop` bleiben unverändert; das Delta
ist auf die beiden Darstellungen der gemeinsamen Tab-Beschriftung begrenzt.

## Folgeauftrag: Campusgram-Anmeldung ohne Autofill, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026 für `12.5 – Wenn Autofill nicht
funktioniert` sowie die vier lokalen Gestaltungsreferenzen `Dropdown.png`, `allgemein.png`,
`passwörter.png` und `PasswortManager.png`. Die Content-Version steigt von `2.5.0` auf `3.0.0`,
weil S13 um einen vollständigen neuen Übungsabschnitt mit Einstellungen, Passwortmanagerliste und
Campusgram-Rückkehr erweitert wird. Alle Zugangsdaten, Sichtbarkeitszustände und der simulierte
Kopierwert bleiben flüchtig und werden weder in die Systemzwischenablage geschrieben noch
persistiert oder exportiert.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.network.guide.campusgramTransition` | Muster-Bank-Ergebnis mit `Weiter` zum Segmentabschluss | `Muster Bank hat jetzt ein eigenes Passwort. Der bisherige Verbindungsweg ist weg.`; `Versuch dich zum Abschluss noch einmal bei Campusgram anzumelden. Deine Passphrase ist bereits im Passwortmanager gespeichert.` | Ergebnisfeedback und Navigation | ausdrücklich vorgegebener Übergang zur abschließenden Campusgram-Handlung | ausdrücklich freigegeben | hervorgehobenes Browser-Dock; kein Sprechblasenbutton | `Passphrase ist bereits im Passwortmanager gespeichert` · Akzent |
| `S13.campusgram.guide.autofillUnavailable` | nicht vorhanden | `Autofill funktioniert nicht auf jeder Website zuverlässig.`; `Bei Campusgram klappt Autofill hier nicht. Öffne über die Browser-Einstellungen den Passwortmanager und kopiere dort das Campusgram-Passwort zum Anmelden.` | Mechanismuserklärung und Navigation | erklärt den erst nach Passwortfeldfokus sichtbaren Übungsfall und benennt das Browsermenü als Ziel | ausdrücklich freigegeben | hervorgehobenes Browsermenü; kein Sprechblasenbutton | `Autofill funktioniert nicht auf jeder Website zuverlässig` · Akzent |
| `S13.campusgram.browser.menu.*` | nicht vorhanden | `Einstellungen`; `Passwortmanager` | Navigation | genau die beiden ausdrücklich freigegebenen Dropdown-Ziele | ergänzend | eigener Einstellungen- beziehungsweise Passwortmanager-Tab | nur Fokus-, Hover- und Druckzustand der beiden Ziele |
| `S13.campusgram.settings.*` | nicht vorhanden | `Allgemein`; `Passwörter`; `Passwortmanager öffnen` und zugehörige neutrale Einstellungsbeschriftungen | Orientierung und Navigation | bildet die vorgegebene Informationshierarchie als responsive lokale UI nach | ergänzend | nur `Allgemein`, `Passwörter` und `Passwortmanager öffnen` sind bedienbar | aktiver Bereich sowie Fokuszustand |
| `S13.campusgram.passwordManager.*` | nicht vorhanden | `Gespeicherte Passwörter`; Suche; Konto-, Benutzername-, Passwort- und Aktionsspalten; `Kopieren`; `Kopiert` | Orientierung und Navigation | vorgegebene scrollbare Liste mit ungefähr 80 lokalen Beispielkonten | ergänzend | Eintragsauswahl, Sichtbarkeit und simuliertes Kopieren pro Zeile; nur Campusgram setzt den Übungswert | Auswahlzustand, Auge-/Kopieraktion und gemeinsamer grüner Kopier-Toast |
| `S13.campusgram.website.insertAction` | nicht vorhanden | `Einsetzen` | Navigation | benennt die simulierte Rückgabe des zuvor kopierten Campusgram-Werts | ausdrücklich freigegeben | glassy Aktion am weiterhin leeren Campusgram-Passwortfeld | Form, Fokus, Hover und Druck |
| `S13.campusgram.guide.complete` | nicht vorhanden | `Wenn Autofill einmal nicht klappt, kannst du das gespeicherte Passwort also auch selbst kopieren und einsetzen. Merken musst du es dir trotzdem nicht.` | Mechanismuserklärung und Kerngedanke | ausdrücklich vorgegebener Abschluss | ausdrücklich freigegeben | `Weiter` beendet den reinen Abschlusssprechschritt | `Merken musst du es dir trotzdem nicht.` · positiv |

Darstellungs- und Interaktionsdelta:

- MyShop und Muster Bank bleiben als inaktive, nicht schließbare Kontexttabs erhalten.
  Campusgram, ein gegebenenfalls geöffneter Einstellungen-Tab und der Passwortmanager-Tab sind
  untereinander auswählbar; ein Einstellungen-Aufruf beginnt immer bei `Allgemein`, ein direkter
  Passwortmanager-Aufruf öffnet unmittelbar die Liste.
- Im Dropdown besitzt kein Eintrag einen vorgewählten oder vorab hervorgehobenen Zustand. Nur
  `Einstellungen` und `Passwortmanager` sind darin bedienbar. In den Einstellungen sind nur
  `Allgemein`, `Passwörter` und `Passwortmanager öffnen` bedienbar; alle übrigen Zeilen dienen der
  realitätsnahen Orientierung und erhalten keine Hover- oder Druckzustände.
- Die Passwortmanagerliste bleibt innerhalb der Browserfläche scrollbar. Passwortwerte werden
  verdeckt und sichtbar einzeilig begrenzt, damit auch lange Passphrasen keine Spalten oder
  Aktionen verschieben. Auswahl, Auge und Kopieren sind für alle Einträge bedienbar; ausschließlich
  der Campusgram-Kopierpfad stellt den flüchtigen Wert für `Einsetzen` bereit.
- Der Datenleck-Hinweis wird in dieser Campusgram-Anmeldeansicht nicht gerendert. Das Passwortfeld
  bleibt nach Tabwechseln leer, bis `Einsetzen` betätigt wurde. Systemzwischenablage, Browser-
  Persistenz und echte Anmeldung bleiben ausgeschlossen.
- Der Design-Lab-Punkt `s2-5-campusgram-manual-login` und der Entwicklungsstart
  `PASSWO_QA_SEGMENT=s13-campusgram` beginnen deterministisch bei dieser Anmeldung. Sie bilden
  ausschließlich einen lokalen QA- und Resume-Einstieg ab, rekonstruieren nur die im bestehenden
  minimalen S08-Resume-Modell zulässigen lokalen Übungswerte und führen weder eine neue persistierte
  Datenklasse noch einen zusätzlichen serverseitigen Studiencheckpoint ein.

## Korrekturauftrag: Gestufte Campusgram-Anleitung und manuelles Einsetzen, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Die Content-Version steigt von
`3.0.0` auf `3.1.0`. Die Änderung entfernt die allgemeine Autofill-Aussage und teilt die
Campusgram-Anleitung in zwei nacheinander bestätigte Sprechblasen. Simulierte Kopier- und
Eingabewerte bleiben ausschließlich im flüchtigen lokalen Statechart-Kontext.

| Text-ID | Bisher | Neu | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S13.campusgram.guide.fillUnavailable` | `Autofill funktioniert nicht auf jeder Website zuverlässig.` und anschließender kombinierter Hinweis | `Bei Campusgram klappt das Ausfüllen hier nicht.` | Mechanismuserklärung | ausdrücklich verlangte kurze erste Sprechblase | begrenzt | `Weiter` öffnet erst die zweite Sprechblase | vollständiger Satz · Akzent |
| `S13.campusgram.guide.copyInstruction` | Teil des kombinierten Hinweises | `Öffne über die Browser-Einstellungen den Passwortmanager und kopiere dort das Campusgram-Passwort zum Anmelden.` | Navigation | Anleitung soll erst nach `Weiter` erscheinen | nein | Drei-Punkte-Browsermenü | `Browser-Einstellungen` mit neuem Drei-Punkte-Symbol; `kopiere` · Aktion |
| `S13.campusgram.browser.menu.*` | nur `Einstellungen` und `Passwortmanager` sichtbar | `Neuer Tab`, `Verlauf`, `Downloads`, `Passwortmanager`, `Einstellungen`, `Hilfe` mit Referenzreihenfolge und Trennlinien | Orientierung | Dropdown soll die Inhalte der lokalen Bildreferenz übernehmen | ergänzend | weiterhin ausschließlich `Passwortmanager` und `Einstellungen` bedienbar | keine Vorauswahl |

Darstellungs- und Ablaufdelta:

- Erst die zweite Sprechblase markiert das Drei-Punkte-Menü und schaltet dessen zwei erlaubte
  Ziele frei.
- Jede Passwortmanagerzeile ist über ihre gesamte Breite auswählbar. Die Kopieraktion erhält eine
  größere eigene Fläche; bekannte Konten verwenden ihre Kontozeichen, Einstellungs- und
  Passwortmanagernavigation passende Funktionszeichen und neutrale Beispielkonten eigene
  Monogramm-Appzeichen statt des generischen Profilbilds.
- Jeder kopierte Übungseintrag ersetzt den flüchtigen simulierten Zwischenstand. Der aus S07
  gemeinsam verwendete glassy `Einsetzen`-Button bleibt danach auch über einem bereits gefüllten
  Passwortfeld verfügbar. Manuelles Kürzen des eingesetzten Werts ist möglich.
- `Anmelden` vergleicht den aktuellen flüchtigen Feldwert mit dem gespeicherten Campusgram-Wert.
  Ein abweichender Wert bleibt mit lokalem Fehlerfeedback im Formular; nur der passende Wert führt
  in die bekannte angemeldete Campusgram-Website.

## Darstellungskorrektur: Kopierfeedback und verbrauchtes Einsetzen, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Teilnehmertexte und
Content-Version bleiben unverändert. Die bereits versionierten Zustände `Kopieren`, `Kopiert` und
der vorhandene Loginfehler werden ausschließlich anders dargestellt beziehungsweise
statechart-gesteuert zugeordnet.

Darstellungs- und Ablaufdelta:

- Die Kopieraktion zeigt ihr kurzes Feedback direkt im betätigten Zeilenbutton als
  `✓ Kopiert`. Ein separates schwebendes Toast wird in der Passwortmanagerliste nicht mehr
  gerendert. Der Button behält Hover-, Druck- und Fokuszustände.
- `Einsetzen` verbraucht den flüchtigen simulierten Kopierwert. Der glassy Button verschwindet
  unmittelbar danach und erscheint erst nach einer weiteren Kopieraktion erneut.
- Ein abweichender eingesetzter Feldwert verwendet dieselbe sichtbare S13-Loginfehlerdarstellung
  wie MyShop und Muster Bank: roter Feldzustand, Ausrufezeichen und bei jedem erneuten Versuch
  eine alternierende Kartenbewegung. Reduced Motion verkürzt die Bewegung auf den unmittelbaren
  Zustandswechsel.

## Ablaufkorrektur: Verzögerter erster Campusgram-Hinweis, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Teilnehmertext und Content-Version
bleiben unverändert. Nach dem ersten Fokus beziehungsweise Klick auf das Campusgram-Passwortfeld
wartet die Statechart einmalig drei Sekunden, bevor `Bei Campusgram klappt das Ausfüllen hier
nicht.` erscheint. Weitere Klicks während dieser Wartephase starten die Frist nicht neu.

## Darstellungskorrektur: Zeilen nur als Hover-Kontext, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Teilnehmertexte und
Content-Version bleiben unverändert. Passwortmanagerzeilen besitzen keinen Auswahlzustand und
keine Klick- oder Tastaturaktion mehr. Beim Überfahren bleibt ausschließlich die bestehende
Zeilenhervorhebung als Orientierung sichtbar; Auge und `Kopieren` bleiben die fokussierbaren und
bedienbaren Ziele innerhalb einer Zeile.

## Hervorhebungskorrektur: Campusgram-Abschluss, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Teilnehmertext und Content-Version
bleiben unverändert. Im Abschlusssatz wird ausschließlich `selbst kopieren und einsetzen` als
ausgeführte Handlung hervorgehoben. Die bisherige positive Hervorhebung von `Merken musst du es
dir trotzdem nicht.` entfällt.

# Training Segment Index

Seitenangaben beziehen sich auf die im Trainingsdokument ausgewiesene interne Paginierung.

| ID | Titel / Funktion | Quelle | Primäre Foci | Kernmechaniken |
|---|---|---:|---|---|
| S00 | Entry and safety boundary | 2 | TF1, TF2, TF6 | Display name, Safety Note, Pflichtbestätigung, PassWo-Flug |
| S01 | Ordinary account setup | 3 | TF2, TF3 | drei fiktive Passwörter, freie Tabreihenfolge |
| S02 | Konten kennenlernen | 4–7 | TF2, TF3, TF4 | freie Kontowahl, Unlock, geführte Vorschausequenzen, 0/3–3/3 |
| S03 | Wieder anmelden | 8–11 | TF1, TF3, TF6 | Abrufbarkeit, Skip ohne Beschämung, Status |
| S04 | Datenleck bei Campusgram | 12 | TF4 | Warnung im Browser-Tab, kurzer Übergang in die Angreiferperspektive |
| S05 | Einzelstärke des Passworts | 12–35 | TF3, TF4, TF6 | Bestandteile, Aufbau, freies Ausprobieren, Zusammenführung |
| S06 | Passwortvergleich und Ausbreitungswege | 36–44 | TF3, TF4 | identisches Passwort / konkret ableitbare Variante / kein ableitbarer Weg erkannt, tatsächliche und hypothetische Pfade |
| S07 | Passphrase erstellen | Nutzerauftrag 2026-08-13 | TF3, TF5 | eingeloggte Campus-Websites, zusätzlicher Passphrasen-Such-Tab |
| S08 | Passwörter überarbeiten | 50–53 | TF3, TF5, TF6 | sechs zufällige Wörter, adaptive Bearbeitung |
| S09 | Passwortprinzipien zusammenfassen | 53–55 | TF4, TF5 | verdunkelte Abschlusszusammenfassung nach blockiertem Rücklauf |
| S10 | Zusammenfassung Passwort | 55–57 | TF6 | stark, einzigartig, abrufbar |
| S11 | Von drei zu vielen Konten | 57–60 | TF1, TF2, TF4, TF6 | Skalierungsproblem, Übergang Passwortmanager |
| S12 | Passwortmanager | 60–65 | TF2, TF3, TF4, TF6 | Generator, Save, Autofill, Vault, Recovery, Systemwahl |
| S13 | Passwort kann bekannt werden | 65–66 | TF4 | Brücke zu MFA |
| S14 | Mehrere Faktoren | 66–67 | TF2, TF3, TF6 | Wissen/Besitz/Inhärenz, Aktivierungssimulation |
| S15 | Recovery-Hinweis | 67–68 | TF6 | geschützter Wiederherstellungscode, Grenzen |
| S16 | Priorisierung/Ausweitung | 68 | TF1, TF6 | wichtige Konten zuerst, MFA wo verfügbar |
| S17 | Integrierte Zusammenfassung | 69–71 | TF4, TF6 | vier Schutzebenen, letzter Guardrail |

## Implementierte S02-Version

- Die drei Hauptkonten bleiben frei wählbar. Nach einer Auswahl werden Entsperren,
  Einzelaufbau der verbundenen Knoten und die erste Vorschau automatisch gestartet; bis zum
  Kontoabschluss sind andere Konten und Detailknoten gesperrt.
- Master Campus zeigt Workspace, Services und Cloud, Campus E-Mail vier konkrete Nachrichten-
  und Kontovorgänge und Campusgram Direktnachrichten, Kontakte sowie Beiträge. Jede Vorschau
  erscheint direkt und bietet `Nächstes`; der letzte Knoten verwendet `Fertig`.
- Die kompakte responsive Vorschau liegt abhängig vom Konto rechts beziehungsweise links über
  dem Netzwerk und wird durch zwei Projektionslinien mit dem aktiven Detailknoten verbunden.
  Während der Vorschausequenz bleibt nur der aktive Kontozweig sichtbar; mit `Fertig` erscheint
  das vollständige Netzwerk wieder.
- Ein Konto gilt erst nach allen seinen Vorschauen als angesehen. Der globale Abschluss zeigt
  einmalig ein Häkchen mit `Konten erkundet`; Vorschauinhalte und der fiktive Benutzername bleiben
  vollständig flüchtig.

## Implementierte S05-Version

- Die S05-Einleitung führt von der verdeckten Kandidatenprüfung über die rot dargestellte
  Systempasswort-Zufallsfolge, eine merkbare Kombination und das Bausteinmodell direkt zum ersten
  Ausgangspunkt des Angreifers. Die frühere Vorschau aus drei Strategiekarten und der zusätzliche
  dreistufige Kategorienvorlauf entfallen.
- `Häufig verwendete Passwörter und Zeichenfolgen` beginnt mit einer ausblendenden
  Kategorieübergabe und einer synchronisierten Laufbandmaschine. Eine umfangreiche linke Liste
  gibt im Zwei-Sekunden-Takt einen lesbaren Baustein auf das von links laufende Band. Erst wenn er
  die kleine mittlere Logo-Box erreicht, wechselt die schmale rechte Liste zu den deterministisch
  erzeugten und fortlaufend scrollenden Varianten dieses Bausteins. Beide Listen blenden unten aus
  und deuten ihre Fortsetzung an.
- Während einer Erklärung und der manuellen persönlichen Auswahl zeigt die Statusleiste nur den
  aktuellen Kategorienamen mittig über seinem großen Symbol. Die automatischen Prüfungen werden
  durch die jeweilige Prüfankündigung und eine handlungsspezifische Prüfaktion ausgelöst; nach
  `Einordnung übernehmen` erscheint ebenfalls die kompakte Ansicht mit den drei
  Bestandteilkarten und `Typische Veränderungen` als mittig verbundener Kreuzbedingung. Dort
  leuchtet die gerade geprüfte Kategorie; in der gemeinsamen Abschlussansicht leuchten alle Karten.
  Ein zusätzlicher Befundfilter entfällt.
- Das fiktive Campusgram-Passwort liegt bereits vor dem ersten Prüfklick unverdeckt in der
  kanonischen Bausteinansicht ohne Verbergen-Schalter vor. Die vier Prüfungen legen ausschließlich
  ihre flüchtigen lokalen Befunde frei: nicht betroffene Bausteine bleiben neutral, betroffene
  Bausteine leuchten ohne Lageänderung und ihre Befundtexte stehen unter gleich hohen
  Bausteinflächen. Befunde der ersten Prüfung unterscheiden häufig verwendetes Passwort oder Wort,
  Tastaturfolge, Zahlenfolge und naheliegende Jahreszahl. Die Rückmeldung benennt die erkannten
  Bausteine; bei einem vollständig erkannten Einzelbaustein weist sie auf den bereits gefundenen
  Passwortkandidaten hin. Die gemeinsame
  Abschlussansicht übergibt anschließend unverändert an `Vorhersehbarer Aufbau`.
- Die Laufbandmaschine wird für alle vier Kategorien wiederverwendet. Ihre linke Beispieltabelle
  trägt statt einer Textüberschrift das große Symbol der aktuellen Kategorie, verwendet nur fest
  authored Beispiele und führt über die mittlere Beschriftung `Typische Veränderungen generieren`
  zur schneller scrollenden Variantenliste. Bei `Persönliche Angaben` werden die kanonischen Bausteine anschließend
  selbst anklickbar; Checkbox und Baustein schalten denselben lokalen Markierungszustand. Die
  Übernahme bleibt auch ohne Auswahl möglich und erzeugt dann keinen persönlichen Befund.
- S05.0 bis S05.4 verwenden die internen Seiten 12 bis 35 als Inhaltsquelle und sind im Design Lab
  sowie im realen Supportive-Training zwischen S04 und S06 vollständig durchspielbar. Beide Pfade
  verwenden dieselbe Komponente und denselben lokalen Controller.
- S05.2 beginnt mit der erneut sichtbaren annotierten Beispielkombination und erklärt
  vorhersehbare Kombinationsmuster. Danach erscheinen die drei festen Demonstrationsgruppen
  `Naheliegende Zusammenhänge`, `Vorhersehbare Satz- und Phrasenstrukturen` und
  `Wiederholungsmuster` schrittweise als linke, mittlere und rechte Bausteinlisten. Die jeweils
  erklärte Liste einschließlich Titel wird weiß pulsierend umrahmt. Bei der anschließenden lokalen
  Wiederholungsprüfung bleiben alle drei Listen sichtbar; das fiktive Campusgram-Passwort steht
  mittig darunter und markiert erkannte Wiederholungen mit denselben Bausteinen.
- Der aus der flüchtigen Campusidentität abgeleitete Benutzername und die fiktive Konto-Mail
  werden der lokalen zxcvbn-Auswertung als zusätzliche Kontoanhaltspunkte übergeben. Sie bleiben
  im Arbeitsspeicher und werden weder persistiert noch exportiert.
- Die lokale Laufzeitanalyse benennt nur exakte Wiederholung, eine feste Konto-/Kontextbeziehung
  mit erkanntem Zahlenmarker oder Anhang sowie eine begrenzte Beziehung bereits erkannter
  Bestandteile. Andernfalls lautet der Befund ausschließlich „kein einfacher Zusammenhang
  erkannt“.
- S05.3 ordnet zunächst eine authored Passphrasen-Generator-Anschauung und zwei gleich lange
  Zeichenmix-Beispiele in zwei gleich aufgebauten Passwort-erstellen-Anzeigen ein. Der
  vorhersehbare linke Kandidat wird mit Angreifersymbol, Textstatus `Früher Treffer`, grauer
  Überlagerung und roter Kontur von der reinen Regelanzeige getrennt. Danach berechnet das Segment theoretische Suchräume ausschließlich für
  deklarierte Demonstrationen mit unabhängiger Zufallsauswahl, festem Zeichenvorrat,
  vollständigem Durchprobieren und einer Billion Versuchen pro Sekunde. Die Längenschätzung
  umfasst 12 bis 20 Kleinbuchstaben; ihre Messlatte bleibt in der folgenden Auswertung sichtbar.
  Kandidatenzahlen bleiben exakte Ganzzahlen; für das fiktive Passwort werden keine Zeit,
  effektive Länge, Entropie oder Gesamtstärke berechnet.
- Nach Abschluss der Kleinbuchstaben-Skala vergleicht eine gelbe Kugel das vorhandene Modell für
  12 zufällige Zeichen aus allen vier Zeichentypen mit der 15-Kleinbuchstaben-Kugel. Der
  unveränderte Vergleichszoom zeichnet zusätzlich die Kleinbuchstaben-Kugeln bis 20 und zeigt
  davon den in den Viewport passenden Ausschnitt; nur die gelbe und die 15-Kleinbuchstaben-Kugel
  bleiben deckend, alle anderen Kugeln sind abgedunkelt. PassWo begrenzt den Vergleich gegen die
  Auswahl selbstgewählter Passwörter. Beim anschließenden 15-Zeichen-Sprechschritt kehrt die
  Kamera zur fokussierten 15-Zeichen-Ansicht zurück. Drei authored Beispiele mit 16, 20 und
  24 Zeichen trennen einen vorhersehbaren Wortbestandteil, einen zusätzlichen Zeichenanhang und
  zwei Wortbausteine sichtbar voneinander. Sie führen in getrennten Sprechschritten zur bereits
  bestehenden lokalen Campusgram-Auswertung und werden weder analysiert noch persistiert.
- Die S05-Simulationsdisposition (`S05_CONTENT_VERSION 2.74.0`, Analysekonfiguration
  `passwo-bounded-whole-recognition-v10`) ist blocklistenartig auf den vollständigen fiktiven Wert
  begrenzt: `whole-password-recognized` entsteht nur, wenn ein einzelner früher Kandidat oder eine
  begrenzte typische Variante das gesamte Passwort abdeckt. Mehrere Teilbefunde werden nicht zu
  einem Volltreffer addiert. Die kompakte Abschlussauswertung nennt zuerst den Vollpasswort-Status,
  zeigt nur dessen kausale Befunde beziehungsweise klar bezeichnete Teilbefunde und ergänzt die
  15-Zeichen-Orientierung kurz und getrennt. Danach endet S05 direkt; Wiederverwendung und
  Ähnlichkeit folgen in S06. Eine fehlende Vollerkennung bedeutet nicht stark, sicher, zufällig
  oder unangreifbar. Numerische zxcvbn-Guess-Werte werden weder angezeigt noch für diese
  Disposition verwendet.
- Die sechs Beispielwörter sind ein festes Demonstrationsbeispiel. Wortliste und produktiver
  Generator bleiben ausschließlich S08 vorbehalten.

## Implementierte S06-Version

- S06 verwendet die internen Seiten 36 bis 44 als Inhaltsquelle und ist im realen
  Supportive-Training zwischen S05 und S07 integriert. Design Lab
  und Teilnehmerpfad verwenden dieselbe Komponente, denselben lokalen Controller und dieselbe
  Projektion; nur die Eingabequelle unterscheidet sich zwischen Fixtures und flüchtigen
  Übungswerten.
- Die Laufzeitwerte werden beim bestätigten Eintritt einmal lokal ausgewertet. Drei
  Einzelanalysen, sechs gerichtete Kontovergleiche und die daraus projizierten Szenen bleiben
  flüchtig und werden weder in den globalen Machine Context kopiert noch an eine Study API
  gesendet.
- Der Timing-Handshake lautet S05 segment-end, S06 segment-start, S06 segment-end. Ein
  fehlgeschlagener späterer Write wiederholt keine bereits bestätigte Grenze.
- Die Projektion verwendet die drei fiktiven Konten Master Campus, Campus E-Mail und Campusgram.
  Campusgram und Master Campus prüfen die relevanten gerichteten Beziehungen zu den anderen
  Konten. Campus E-Mail bildet am Ende ausschließlich einen lokalen Einzelcheck; bei einem Fund
  werden seine verbundenen Funktionen betroffen dargestellt, bei Schutz folgt kein
  hypothetischer Pfad. Danach kehrt die Ansicht zur tatsächlichen Campusgram-Ausgangslage zurück.
  Campusgram-Inhalte bleiben lokale
  Inhaltszuordnungen und werden nicht als SSO-Dienste modelliert.
- Nach der Campus-E-Mail-Perspektive kündigt PassWo die Rückkehr an. Erst `Weiter` stellt die
  tatsächliche Campusgram-Ausgangslage einschließlich ihres ursprünglichen lokalen Prüfergebnisses
  wieder her.
- Ein hypothetischer Campus-E-Mail-Befall setzt vor den ausgehenden Prüfpfaden den Angreifer und
  den gesamten Kontozweig sichtbar auf betroffen. Der anschließende Passphrasen-Übergang bewahrt
  die wiederhergestellte Campusgram-Schlussansicht unverändert.
- Eine Beziehung ist ausschließlich `exact-match`, `derived-variant-match` oder
  `no-derived-path-recognized`. Eine abgeleitete Variante benötigt einen konkreten begrenzten
  Transformationsweg, dessen erzeugter Kandidat den vollständigen Zielwert trifft.
- Gemeinsame Teilstrings, allgemeine Ähnlichkeit und Edit-Distance begründen keinen Treffer. Ein
  nicht erkannter Weg bedeutet nur, dass diese Simulation keinen direkten Weg erkannt hat.
- `S06_CONSEQUENCE_CONTENT_VERSION 2.17.0` übernimmt die S05-Vollpasswort-Disposition ohne eigene
  Guess-Schwelle. Nur `whole-password-recognized` öffnet den tatsächlichen lokalen Vorfallspfad;
  `no-whole-password-recognized` bleibt eine begrenzte Nicht-Erkennung und kein Stärkeurteil.
- Vier deterministische Design-Lab-Fixtures decken exakte Wiederverwendung plus Ableitung, einen
  gestoppten ersten Vorfall, zwei blockierte Folgewege und eine gemischte
  tatsächliche/hypothetische Darstellung ab.

## Implementierte S07-Version

- Der Nutzerauftrag vom 14. August 2026 ersetzt die bisherige Auswertung vollständig. Nach S06
  erscheint zuerst die Fortschrittskarte `Passphrase erstellen`; danach beginnt S07.
- S07 zeigt Master Campus, Campus E-Mail und Campusgram erneut als bereits angemeldete
  Dashboard-Websites. Der Browser startet auf Campusgram.
- Nach dem Öffnen der Campusgram-Passwortänderung führen Plus-Symbol, Suchsymbol und erster
  Ergebnistreffer nacheinander zur kompakten, nicht scrollenden Passphrase-Werkstatt.
- Die Werkstatt erzeugt deterministisch ausschließlich lokale fiktive Wortfolgen. Bedienbar sind
  nur die neue Wortfolge, vier Trennzeichen und `Kopieren`; Groß-/Kleinschreibung,
  Kapitalisierung, Zahlen und weitere Generatoroptionen werden nicht angeboten. Die Auswahl wird
  weder persistiert noch exportiert. Jede Ausgabe erhält unmittelbar die zugeordnete
  PassWo-Erinnerungshilfe.
- Der direkte QA-Einstieg lautet `s07-passphrase-search`. Die bisherigen fünf
  Auswertungs-Fixtures und ihre Renderer sind entfernt.
- Der Campusgram-Datenleckhinweis bietet auch in S07 den bereits in S04 verwendeten lokalen
  `Passwort jetzt ändern`-Ablauf. Die Umgebung wird bis zum Öffnen dieses Ablaufs abgedunkelt,
  während der Hinweis leuchtet; bei Reduced Motion bleibt der Leuchtrahmen statisch. Alle
  Formulareingaben bleiben flüchtig und werden verworfen.
- Nach dem Campusgram-Wechsel werden nur Master Campus oder Campus E-Mail weiterbehandelt, wenn
  ihre lokale Analyse einen Volltreffer oder der gerichtete Vergleich zum alten
  Campusgram-Passwort einen Treffer beziehungsweise eine relevante Variation ergibt. Diese Konten
  erhalten in S08 jeweils die Knotenaktion `Einzigartige Passphrase verwenden`; nicht betroffene
  Konten bleiben unverändert. Schutzschild und kurzes Konfetti bestätigen jede ausgeführte Aktion,
  bevor der abschließende Angriffsrücklauf beginnt.
- Nach dem Campusgram-Wechsel projiziert S07 die lokalen S06-Befunde für die beiden anderen
  Konten als stark/leicht erratbar und einzigartig/ähnlich. Stark und einzigartig eingeordnete
  Konten bleiben ohne Einzelmeldung; nur offene Konten erhalten in S08 eine Schutzaktion. Sind
  beide bereits stark und einzigartig, beginnt S08 unmittelbar mit dem Angriffsrücklauf.
- `S07_PASSPHRASE_SEARCH_CONTENT_VERSION 4.9.0` beschreibt Datenleckhinweis, lokalen
  Passwortwechsel, Suchseite, Werkstatt und adaptive Kontorückmeldung;
  `S08_NETWORK_REPLAY_CONTENT_VERSION 3.1.0` beschreibt die Netzabkürzung und den anschließenden
  bedienbaren Angriffsrücklauf. Es werden
  keine neuen Teilnehmer- oder Trainingswerte persistiert oder exportiert.

## Implementierte S08--S09-Version

- S08 beginnt ohne PassWo direkt auf dem Desktopnetzwerk. Nur Master Campus und Campus E-Mail
  erhalten bei einem verbliebenen lokalen Stärke- oder Einzigartigkeitsbefund die Knotenaktion
  `Einzigartige Passphrase verwenden`; die fiktive Ersetzung bleibt automatisch und vollständig
  flüchtig. Schild und kurzes Konfetti bestätigen die Handlung.
- Der große Button unten in der Mitte startet den erneuten Angriff. Der Angreifer bleibt oberhalb
  von Campusgram, während alle sechs grünen Liniensegmente der drei Kontopaare gleichzeitig
  starten. Je zwei Segmente lassen in der Seitenmitte Abstand für ein grünes Vergleichsschild;
  die Kontoknoten behalten ihre blauen S06-Passwortschilde. Blaue Verbindungslinien oder blaue
  Kreise an den Vergleichsschilden, die Passwortvergleich-Vorschau und ein
  `Was wäre, wenn?`-Modus entfallen.
- Nach dem vollständigen Dreieck führt `Zum Überblick` ohne PassWo direkt nach S09. Dort bleibt das
  Desktopnetzwerk abgedunkelt hinter der transparenten Liste `Starke Passwörter auf einen Blick`
  sichtbar. Die sechs unnummerierten Hinweise stehen zwischen dem großen grünen Vergleichsschild
  und dem großen blauen Passwortschild. `Abschließen` entfernt die Überlagerung und zeigt das
  zuletzt verlassene Schutzdreieck ohne Angreifer und mittiges Ergebnisfeedback.
- `S09_PASSWORD_SUMMARY_CONTENT_VERSION 2.3.0` beschreibt ausschließlich diese lokale
  Abschlussüberlagerung ohne äußere Box, ihre rein textbasierten authored Hervorhebungen sowie
  den Rücksprung. Es entstehen keine neuen persistierten Felder oder Trainingswrites.
- Der direkte QA-Einstieg `s08-network-replay` startet unmittelbar bei den betroffenen
  Kontoknoten; der bestehende S07-QA-Einstieg führt nach seinem Abschluss ebenfalls dorthin.

## Sections

- `passwords`: S00–S11
- `password-manager`: S12–S13
- `mfa`: S14–S17

## Globale Interaktionsregel

Bei erklärenden Simulationen gilt grundsätzlich:

1. PassWo erklärt einen kurzen Gedanken.
2. Eine zentrale visuelle Veränderung geschieht.
3. Der Nutzer kann die Animation wiederholen oder weitergehen.

## Globale Datenschutzregel

- Nur fiktive Passwörter.
- Standardmäßig maskiert; lokaler Reveal ist möglich.
- Eingaben und Analysen bleiben im Browser-Arbeitsspeicher.
- Keine Trainingsentscheidung wird in Study Responses codiert.

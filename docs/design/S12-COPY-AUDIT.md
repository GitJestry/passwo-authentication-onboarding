# S12 Copy Audit

## Copy- und Ablaufdelta S12 Passwortmanager, 25. August 2026

### Quelle und Umfang

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026 für `12.1 – Was ein
Passwortmanager übernimmt` und `12.2 – Integriert oder separat`. Der Auftrag ersetzt die bisherige
statische Passwortmanager-Transition und Landingpage. Der bestehende S09-Netzwerkabschluss bleibt
als räumlicher Ausgangspunkt sichtbar, rückt in den Hintergrund und führt ohne dazwischenliegende
Sektionskarte in S12.

`S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt wegen des entfernten sichtbaren
Transition-Contents von `4.6.0` auf `4.7.0`. Für den neuen S12-Content wird
`S12_PASSWORD_MANAGER_CONTENT_VERSION 1.0.0` eingeführt. Der ausdrückliche Folgeauftrag vom
25. August 2026 entfernt die beiden Abschnittstitel und redundante Zugangslabels, bindet den
flüchtigen gewählten Benutzernamen in die My-Shop-Demonstration ein und präzisiert die
Übungsüberleitung. Dafür steigt `S12_PASSWORD_MANAGER_CONTENT_VERSION` auf `1.1.0`.

Die neue Darstellung verwendet ausschließlich feste lokale Beispieldaten. Das zufällig wirkende
16-Zeichen-Passwort ist authored Content und wird weder aus Teilnehmerdaten erzeugt noch
persistiert. Für den gezeigten Suchraum gilt das im Skript benannte Modell: `72^16` mögliche
Zeichenfolgen bei einer Billion Versuchen pro Sekunde entsprechen gerundet `5,2 × 10²⁹`
Kombinationen und ungefähr dem 1,2-Fachen des Alters des Universums. Die Darstellung ist eine
theoretische Modellvisualisierung, keine Bewertung eines echten Passworts.

### Copy-Delta

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S09.passwordManagerTransition` | bisheriger Content | `Sektion 2 von 3` / `Passwortmanager` / `Ein Tresor für alle deine Passwörter` | entfällt | Orientierung | ausdrücklich verlangter direkter Netzwerkübergang | ausdrücklich freigegeben | kein | keine |
| `S12.sections.functions` | Folgeauftrag vom 2026-08-25 | `Was ein Passwortmanager übernimmt` | entfällt | Orientierung | ausdrücklich verlangte Entlastung der Visualisierung | ausdrücklich freigegeben | kein | keine |
| `S12.flow.generate/store/fill` | Nutzerauftrag 12.1 | nicht vorhanden | `Erzeugen` / `Speichern` / `Ausfüllen` | Orientierung | sichtbare stabile Funktionsfolge | ausdrücklich freigegeben | kein | aktive Stufe plus Häkchen und Form |
| `S12.guide.steps.intro` | Nutzerauftrag 12.1 | nicht vorhanden | Passwortmanager erzeugt, speichert und füllt kontospezifische Passwörter aus | Mechanismuserklärung | freigegebener Einstieg | ausdrücklich freigegeben | `Weiter` | `erzeugen, speichern und beim Anmelden wieder ausfüllen` · Akzent |
| `S12.guide.steps.generate` | Nutzerauftrag 12.1 | nicht vorhanden | langes zufällig erzeugtes Passwort muss nicht auswendig gelernt werden | Mechanismuserklärung | freigegebene Generatorerklärung | ausdrücklich freigegeben | `Weiter` | `langes, zufällig erzeugtes Passwort` · Akzent |
| `S12.generator.*` | Nutzerauftrag 12.1 | nicht vorhanden | authored Passwort, 72 Zeichen, eine Billion Versuche, `5,2 × 10²⁹`, 1,2-mal Universumsalter | Ergebnisfeedback | mathematisch kohärente verkürzte Modellangaben zur Kugel | ausdrücklich freigegeben | kein | platin-lila Kugel, Text und Form tragen Bedeutung gemeinsam |
| `S12.guide.steps.store` | Nutzerauftrag 12.1 | nicht vorhanden | Zuordnung von Passwort und Konto im Tresor | Mechanismuserklärung | freigegebene Speichererklärung | ausdrücklich freigegeben | `Weiter` | `welches Passwort zu welchem Konto gehört` · Akzent |
| `S12.vault.entry` | Folgeauftrag vom 2026-08-25 | `Beispielkonto`, `[benutzername]@konto.example`, maskiertes Passwort | `My Shop`, flüchtig gewählter Benutzername oder `benutzername` mit `@my-shop.example`, maskiertes Passwort | Ergebnisfeedback | sichtbare Demonstration an die benannte Folgeübung und die bekannte lokale Identität angepasst | begrenzt | kein | Maske und Tresorform ergänzen die Farbe |
| `S12.guide.steps.fill` | Nutzerauftrag 12.1 | nicht vorhanden | passender Eintrag wird beim nächsten Anmelden eingesetzt | Mechanismuserklärung | freigegebene Autofill-Erklärung | ausdrücklich freigegeben | `Weiter` | `passenden Eintrag` · positiv |
| `S12.login.*` | Folgeauftrag vom 2026-08-25 | `Bei Beispielkonto anmelden`, `Benutzername`, `Passwort`, `Anmelden`, `Angemeldet` | `Bei My Shop anmelden`, `Benutzername`, `Passwort`, `Anmelden`; `Angemeldet` entfällt | Ergebnisfeedback | vertraute Anmeldeansicht endet wie verlangt beim sichtbaren Anmeldebutton statt eine Anmeldung vorwegzunehmen | ausdrücklich freigegeben | kein | Feldfüllung und Formularzustand statt Erfolgsmeldung |
| `S12.guide.steps.access` | Nutzerauftrag 12.1 | nicht vorhanden | einzelne Passwörter nicht merken; Zugang zum Manager schützen | Kerngedanke | freigegebene Zugangsgrenze ohne Sicherheitsgarantie | ausdrücklich freigegeben | `Weiter` | `Zugang zu deinem Passwortmanager` · Akzent |
| `S12.sections.variants` | Folgeauftrag vom 2026-08-25 | `Integriert oder separat` | entfällt | Orientierung | ausdrücklich verlangte Entlastung der Visualisierung | ausdrücklich freigegeben | kein | keine |
| `S12.variants.integrated.access` | Folgeauftrag vom 2026-08-25 | Zugangsbadge `Geräte- oder Plattformzugang`; Listenpunkt `Zugang meist über Gerät oder Plattformkonto` | beide entfallen | Orientierung | redundanter kleiner Hinweis und Listenpunkt ausdrücklich entfernt | ausdrücklich freigegeben | kein | Varianten bleiben durch Titel, Illustration und Kartenrahmen unterscheidbar |
| `S12.variants.separate.access` | Folgeauftrag vom 2026-08-25 | Zugangsbadge `Masterpasswort` | Badge entfällt; Listenpunkt und PassWo-Erklärung bleiben | Orientierung | einheitliche, weniger überladene Karten ohne kleine Zusatzlabels | begrenzt | kein | Schlossbetonung und Listenpunkt tragen die Bedeutung |
| `S12.variants.integrated.practiceBrowserLabel` | Folgeauftrag vom 2026-08-25 | `Browser für die Übung` | entfällt | Orientierung | ausdrücklich verlangte Entfernung des zusätzlichen Labels | ausdrücklich freigegeben | kein | aktive integrierte Karte und Illustration bleiben sichtbar |
| `S12.variants.passphrasePreview` | Folgeauftrag vom 2026-08-25 | einzelne Wort-Pills ohne sichtbare Trenner | bekannte Wortbausteine, vollständig mit Bindestrichen verbunden | Orientierung | ausdrücklicher Rückbezug auf die bekannte Bausteindarstellung | nein | kein | Bausteinform und Bindestriche tragen die Struktur gemeinsam |
| `S12.guide.steps.variants` | Nutzerauftrag 12.2 | nicht vorhanden | Browser/Geräte enthalten häufig Manager; separate Manager existieren daneben | Mechanismuserklärung | freigegebene Einordnung | ausdrücklich freigegeben | `Weiter` | `bereits einen Passwortmanager` · Akzent |
| `S12.guide.steps.separate` | Nutzerauftrag 12.2 | nicht vorhanden | separater Tresor meist per Masterpasswort; Passphrase aus Abschnitt 1 als Beispiel | Mechanismuserklärung | freigegebene Zugangsvariante und Rückbezug | ausdrücklich freigegeben | `Weiter` | `Masterpasswort` · Hinweis |
| `S12.guide.steps.integrated` | Nutzerauftrag 12.2 | nicht vorhanden | Geräte- oder Plattformzugang übernimmt häufig den Schutz | Mechanismuserklärung | freigegebene integrierte Zugangsvariante | ausdrücklich freigegeben | `Weiter` | `Geräte- oder Plattformzugang` · Akzent |
| `S12.guide.steps.practice.1` | Folgeauftrag vom 2026-08-25 | `Für unsere Übung nutzen wir den Passwortmanager direkt im Browser.` | `Für die Übung nutzen wir den Passwortmanager direkt im Browser.` | Orientierung | ausdrücklich freigegebener Wortlaut | nein | kein | `direkt im Browser` · Aktion |
| `S12.guide.steps.practice.2` | Folgeauftrag vom 2026-08-25 | `Probier den Ablauf jetzt selbst aus.` | `Probier den Ablauf jetzt selbst aus indem du mit dem Password Manager bei My Shop ein neues Konto anlegst.` | Navigation | ausdrücklich benanntes nachfolgendes Übungsziel | ausdrücklich freigegeben | nachfolgende My-Shop-Browserübung | keine |

### Darstellungs- und Interaktionsgrenzen

- S12 lässt den letzten S09-Netzwerk-Snapshot zunächst langsam und ohne Abdunklung vollständig
  ausblenden. Erst danach erscheint und öffnet sich der Tresor. Es gibt keine separate
  Transitionkarte oder statische Landingpage.
- PassWo steht unten links in einer eigenen Dialogzone. Bei Linux beginnt diese Zone rechts der
  seitlichen Dock-Leiste; bei macOS endet sie oberhalb des unteren Docks. Die Lernvisualisierung
  endet oberhalb derselben Zone und wird daher nicht von Figur oder Sprechblase verdeckt.
- Generator, Speichern und Autofill laufen als Statechart-Schritte. Der gewählte Anzeigename wird
  ausschließlich flüchtig als fiktiver My-Shop-Benutzername dargestellt und weder persistiert noch
  exportiert. Reduced Motion zeigt dieselben
  fachlichen Endzustände ohne Wartezeiten oder räumliche Flugbewegung.
- Die My-Shop-Aufforderung bleibt eine Überleitung. Dieses Delta erfindet keine
  nicht beauftragte Passwortmanager-Übung und keinen funktionslosen Ersatzbutton.

## Folgeauftrag: Visual- und Copy-Präzisierung, 25. August 2026

### Quelle und Geltung

Quelle ist der ausdrückliche Folgeauftrag vom 25. August 2026. Dieses Delta ersetzt die oben
dokumentierten Entscheidungen zur fehlenden Sektionskarte, zum My-Shop-Beispiel, zum entfernten
Zugangs-Stichpunkt und zur Benennung eigenständiger Passwortmanager. Die übrige narrative
Reihenfolge und die fachlichen Grenzen bleiben bestehen.

`S09_PASSWORD_SUMMARY_CONTENT_VERSION` steigt für die wiederhergestellte Übergangskarte auf
`4.8.0`. `S12_PASSWORD_MANAGER_CONTENT_VERSION` steigt für die neue Beispieldarstellung und die
präzisierten Varianten auf `1.2.0`. Benutzername und Kontobezeichnung sind nun feste authored
Beispieldaten; der flüchtige Anzeigename wird in S12 nicht mehr dargestellt.

### Copy-Delta

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S09.passwordManagerTransition` | Folgeauftrag 2026-08-25 | keine Karte | `Sektion 2 von 3` / `Passwortmanager` / `Ein Tresor für alle deine Passwörter` | Orientierung | Übergangskarte ausdrücklich wieder verlangt | ausdrücklich freigegeben | kein | aktive Sektion und Teilmarke |
| `S12.generator.fieldLabel` | Folgeauftrag 2026-08-25 | `Zufällig erzeugtes Passwort` | `Passwort` | Orientierung | bekanntes Passwortfeld ohne redundanten Innenhinweis | begrenzt | kein | keine |
| `S12.generator.model` | Folgeauftrag 2026-08-25 | `16 Zeichen`; Rechenannahmen als sichtbare Pills in der Kugel | `alle Zeichentypen` über der Kugel; `16 Stellen` unter der Skala; Rechenannahmen am Zahnrad | Ergebnisfeedback | an die bekannte S05-Skalenform angeglichen | ausdrücklich freigegeben | Zahnrad für optionalen Hinweis | Kugel, Skala und Text tragen Bedeutung gemeinsam |
| `S12.vault.entry` | Folgeauftrag 2026-08-25 | `My Shop`; flüchtiger Benutzername mit Beispieldomain | Konto und Benutzername jeweils `Anmeldebeispiel` | Ergebnisfeedback | ausdrücklich verlangtes neutrales authored Beispiel | ausdrücklich freigegeben | kein | gelber Autofill-Zustand ergänzt die sichtbare Füllung |
| `S12.login.title` | Folgeauftrag 2026-08-25 | `Bei My Shop anmelden` | `Anmeldebeispiel` | Orientierung | ausdrücklich verlangte neutrale Bezeichnung | ausdrücklich freigegeben | kein | keine |
| `S12.variants.integrated.access` | Folgeauftrag 2026-08-25 | Stichpunkt entfallen | `Zugang meist über Gerät oder Plattformkonto` | Orientierung | Stichpunkt ausdrücklich wieder verlangt | ausdrücklich freigegeben | kein | Listenpunkt und Illustration statt Farbe allein |
| `S12.variants.separate.title` | Folgeauftrag 2026-08-25 | `Separater Passwortmanager` | `Eigenständiger Passwortmanager` | Orientierung | ausdrücklich verlangte Benennung | ausdrücklich freigegeben | kein | eigene Illustration und Kartenrahmen |
| `S12.guide.steps.variants` | Folgeauftrag 2026-08-25 | `Daneben gibt es separate Passwortmanager.` | `Daneben gibt es eigenständige Passwortmanager.` | Mechanismuserklärung | ausdrücklich verlangte Benennung | ausdrücklich freigegeben | `Weiter` | `bereits einen Passwortmanager` · Akzent |
| `S12.guide.steps.separate` | Folgeauftrag 2026-08-25 | `Separate Passwortmanager …` | `Eigenständige Passwortmanager …` | Mechanismuserklärung | konsistent mit der ausdrücklich benannten Systemvariante | begrenzt | `Weiter` | `Masterpasswort` · Hinweis |
| `S12.guide.steps.practice.2` | Folgeauftrag 2026-08-25 | My-Shop-/Password-Manager-Bezeichnung | `… mit dem Passwortmanager beim Anmeldebeispiel …` | Navigation | sichtbares Übungsziel an die neue authored Bezeichnung angepasst | begrenzt | nachfolgendes Anmeldebeispiel | keine |

### Darstellungs- und Interaktionsgrenzen

- Die Übergangskarte blendet über dem auslaufenden S09-Netzwerk ein. Erst nach ihrem Abschluss
  beginnt die S12-Tresoröffnung; bei Reduced Motion entfallen die räumlichen Bewegungen.
- Die Lernvisualisierung nutzt die Desktopfläche bis zu den systembedingten Dock-Grenzen. PassWo
  liegt als transparente Überlagerung darüber und reserviert keinen undurchsichtigen unteren
  Inhaltsbalken.
- Benutzername und Passwort beginnen die Autofill-Animation gleichzeitig. Der gelbe Feldzustand
  bleibt nach dem Füllen sichtbar und ist nicht der einzige Bedeutungsträger.
- Der Generator zeigt links ein helles bekanntes Passwortfeld und rechts die S05-nahe Skala. Das
  Zahnrad ist tastaturfokussierbar; Modelllabel, Kugeltext, Erklärung und `16 Stellen` bleiben
  zusätzlich sichtbar.
- Die Varianten verwenden die lokalen Nutzer-PNGs `integriert.png` und `eigenständig.png`. Die
  äußere Passphrasen-Pill entfällt, während Wortbausteine und Bindestriche erhalten bleiben.

## Folgeauftrag: Generator, Autofill und Browserüberleitung, 25. August 2026

### Quelle und Geltung

Quelle ist der ausdrückliche Folgeauftrag vom 25. August 2026. Er präzisiert die Darstellung
des theoretischen Suchaufwands, stellt den flüchtigen gewählten Benutzernamen mit dem authored
Fallback `benutzername` wieder her und richtet die abschließende Navigation auf den sichtbaren
Browser im Dock. `S12_PASSWORD_MANAGER_CONTENT_VERSION` steigt dafür auf `1.3.0`.

### Copy-Delta

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S12.generator.duration` | Folgeauftrag 2026-08-25 | `1,2-mal das Alter des Universums` | `16,5 Milliarden Jahre` | Ergebnisfeedback | ausdrücklich verlangte, zum gezeigten Modell passende Zeitangabe | begrenzt | Zahnrad für Berechnungsannahmen | große Zeitangabe in der Kugel |
| `S12.vault.entry.username` | Folgeauftrag 2026-08-25 | `Anmeldebeispiel` | flüchtiger gewählter Benutzername, ersatzweise `benutzername` | Ergebnisfeedback | Autofill soll den lokalen Übungsnamen statt der Kontobezeichnung einsetzen | ausdrücklich freigegeben | kein | gelber gefüllter Feldzustand und sichtbarer Text |
| `S12.guide.steps.practice.2` | Folgeauftrag 2026-08-25 | `Probier den Ablauf jetzt selbst aus, indem du mit dem Passwortmanager beim Anmeldebeispiel ein neues Konto anlegst.` | `Probier den Ablauf jetzt selbst aus, indem du mit dem Passwortmanager im Browser ein neues Konto anlegst.` | Navigation | Wortlaut auf das tatsächlich hervorgehobene sichtbare Ziel ausgerichtet | begrenzt | Browser im Desktop-Dock | `direkt im Browser` aus dem zugehörigen Sprechschritt · Aktion |

### Darstellungs- und Interaktionsgrenzen

- Die Zeitangabe bleibt theoretische Modellvisualisierung. Passwortlänge, Zeichenraum,
  Kombinationen und Versuche pro Sekunde bleiben am tastaturfokussierbaren Zahnrad zugänglich.
- Der Benutzername wird nur flüchtig aus dem bereits gewählten Trainingsnamen abgeleitet und
  weder persistiert noch exportiert. Benutzername und Passwort beginnen gleichzeitig mit dem
  Autofill und bleiben als gefüllte, gelb hinterlegte Felder sichtbar.
- Die Passwortmanager-Übergangskarte ersetzt während ihrer Laufzeit den simulierten Desktop
  vollständig, entsprechend den Sektionskarten aus Sektion 1.

## Folgeauftrag: Variantenkarten und Logo-Reveal, 25. August 2026

### Quelle und Geltung

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Er verkürzt Titel und
Orientierungspunkte der beiden Passwortmanager-Varianten und verlangt ein weicheres Erscheinen
ohne Abschneiden der lokalen Logos. Die fachliche Gegenüberstellung und die Reihenfolge der
Varianten bleiben bestehen. `S12_PASSWORD_MANAGER_CONTENT_VERSION` steigt dafür auf `1.4.0`.

### Copy-Delta

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S12.variants.integrated.title` | Nutzerauftrag 2026-08-25 | `In Browser oder Gerät integriert` | `Integriert` | Orientierung | ausdrücklich verlangte kompakte Variantenbenennung | begrenzt | kein | Illustration und Kartenposition |
| `S12.variants.integrated.bullets` | Nutzerauftrag 2026-08-25 | `bereits im Browser oder Gerät vorhanden`; `Zugang meist über Gerät oder Plattformkonto`; `teilweise zusätzlich mit Masterpasswort` | `bereits vorhanden`; `an Browser/Gerät gekoppelt`; `Zugang meist über Gerät oder Plattform` | Orientierung | ausdrücklich vorgegebene, entlastete Merkmalsliste | begrenzt | kein | Listenpunkte und Illustration statt Farbe allein |
| `S12.variants.separate.title` | Nutzerauftrag 2026-08-25 | `Eigenständiger Passwortmanager` | `Eigenständig` | Orientierung | ausdrücklich verlangte kompakte Variantenbenennung | begrenzt | kein | Illustration und Kartenposition |
| `S12.variants.separate.bullets` | Nutzerauftrag 2026-08-25 | `separat eingerichtet`; `häufig über verschiedene Browser und Betriebssysteme nutzbar`; `Tresor meist mit einem Masterpasswort geschützt` | `separat eingerichtet`; `browser- und systemübergreifend nutzbar`; `meist mit Masterpasswort geschützt` | Orientierung | ausdrücklich vorgegebene, entlastete Merkmalsliste | begrenzt | kein | Listenpunkte und Illustration statt Farbe allein |

### Darstellungsgrenze

- Beide Varianten erscheinen zeitlich leicht versetzt über Opazität und eine kleine räumliche
  Bewegung. Die Animation setzt keine dauerhafte Schnittmaske; skalierte oder nach oben
  verschobene Logos bleiben vollständig sichtbar.
- Reduced Motion zeigt beide Varianten ohne räumliche Bewegung oder Verzögerung im fachlichen
  Endzustand.

## Folgeauftrag: Präzisierung der Variantenmerkmale, 25. August 2026

### Quelle und Geltung

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Er ersetzt die unmittelbar zuvor
festgelegten Kurztitel und Merkmalslisten durch vollständige Variantenbezeichnungen und eine
präzisere Beschreibung ihrer Kopplung beziehungsweise browser- und systemübergreifenden Nutzung.
Die Darstellungs- und Animationsentscheidungen bleiben unverändert.
`S12_PASSWORD_MANAGER_CONTENT_VERSION` steigt dafür auf `1.5.0`.

### Copy-Delta

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S12.variants.integrated.title` | Nutzerauftrag 2026-08-25 | `Integriert` | `Integrierter Passwortmanager` | Orientierung | ausdrücklich verlangte vollständige Variantenbenennung | begrenzt | kein | Illustration und Kartenposition |
| `S12.variants.integrated.bullets` | Nutzerauftrag 2026-08-25 | `bereits vorhanden`; `an Browser/Gerät gekoppelt`; `Zugang meist über Gerät oder Plattform` | `bereits vorhanden`; `an Browser, Gerät oder Plattform gekoppelt`; `Zugang meist über Gerät/Plattform` | Orientierung | ausdrücklich vorgegebene Präzisierung der Kopplung und des Zugangs | begrenzt | kein | Listenpunkte und Illustration statt Farbe allein |
| `S12.variants.separate.title` | Nutzerauftrag 2026-08-25 | `Eigenständig` | `Eigenständiger Passwortmanager` | Orientierung | ausdrücklich verlangte vollständige Variantenbenennung | begrenzt | kein | Illustration und Kartenposition |
| `S12.variants.separate.bullets` | Nutzerauftrag 2026-08-25 | `separat eingerichtet`; `browser- und systemübergreifend nutzbar`; `meist mit Masterpasswort geschützt` | `separat eingerichtet`; `derselbe Tresor über verschiedene Browser und Systeme nutzbar`; `meist mit Masterpasswort geschützt` | Orientierung | ausdrücklich vorgegebene Präzisierung der gemeinsamen Tresornutzung | begrenzt | kein | Listenpunkte und Illustration statt Farbe allein |

## Folgeauftrag: Sofortige S12-Netzwerkgrenze, 25. August 2026

Der ausdrückliche Folgeauftrag präzisiert ausschließlich den Eintritt in S12: Das Kontonetzwerk
ist beim Zustandswechsel sofort nicht mehr sichtbar oder bedienbar. Der bisherige sichtbare
Ausblendvorgang entfällt; S12-Copy, weitere Animationen und fachlicher Ablauf bleiben unverändert.

## Folgeauftrag: Lesbarkeit und gefüllter Tresor, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Er verlangt besser lesbare
Funktionszustände, einen bereits zu Beginn glaubwürdig gefüllten Tresor und den gelben
Generator-Endzustand. `S12_PASSWORD_MANAGER_CONTENT_VERSION` steigt dafür auf `1.6.0`.

### Copy-Delta

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S12.vault.initialEntries` | Nutzerauftrag 2026-08-25 | keine sichtbaren Einträge vor dem Speicherschritt | zwölf eindeutig fiktive Dienstnamen und `.example`-Kennungen mit maskierten Passwörtern | Orientierung | der Tresor soll bereits beim Öffnen als genutzter Passwortmanager erkennbar sein | ausdrücklich freigegeben | kein | Eintragskarten, Maskierung und Tresorform |
| `S12.vault.storedCount` | Nutzerauftrag 2026-08-25 | `1 Eintrag` | zunächst `12 Einträge`, nach dem Speichern `13 Einträge` | Ergebnisfeedback | Zähler an die sichtbaren authored Beispiele und den neuen Eintrag angleichen | ausdrücklich freigegeben | kein | Zahl und sichtbarer neuer Eintrag |

### Darstellungs- und Interaktionsgrenzen

- Die bestehenden Bezeichnungen `Erzeugen`, `Speichern` und `Ausfüllen` bleiben unverändert.
  Höherer Kontrast, größere Schrift und dauerhaft sichtbare Häkchen machen aktive und
  abgeschlossene Zustände unterscheidbar, ohne Farbe als einzigen Bedeutungsträger zu verwenden.
- Die zwölf Startwerte sind ausschließlich versionierter fiktiver Content. Alle Passwörter
  bleiben maskiert; es werden keine Teilnehmerdaten abgeleitet, gespeichert oder exportiert.
- Das erzeugte Passwortfeld wird erst nach vollständig abgeschlossener Zeichenanimation gelb.
  Bei Reduced Motion erscheint unmittelbar derselbe fachliche Endzustand.

## Folgeauftrag: Weniger Tresoreinträge, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Die Anzahl der sichtbaren
fiktiven Startwerte sinkt zugunsten ihrer Lesbarkeit von zwölf auf acht; nach dem Speichern zeigt
der Tresor neun Einträge. `S12_PASSWORD_MANAGER_CONTENT_VERSION` steigt dafür auf `1.7.0`.

### Copy-Delta

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S12.vault.initialEntries` | Nutzerauftrag 2026-08-25 | zwölf fiktive Einträge | acht fiktive Einträge | Orientierung | mehr Raum und bessere Lesbarkeit je Eintragskarte | begrenzt | kein | größere Schrift, Eintragskarten und Maskierung |
| `S12.vault.storedCount` | Nutzerauftrag 2026-08-25 | `12 Einträge` / `13 Einträge` | `8 Einträge` / `9 Einträge` | Ergebnisfeedback | Zähler an die sichtbaren Einträge angleichen | begrenzt | kein | Zahl und sichtbarer neuer Eintrag |

Die verbleibenden Werte sind weiterhin ausschließlich versionierter fiktiver Content mit
`.example`-Kennungen und maskierten Passwörtern. Es werden keine Teilnehmerdaten gespeichert
oder exportiert.

## Folgeauftrag: Überleitung zu den Passwortmanager-Varianten, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Teilnehmertexte und ihre
Reihenfolge bleiben unverändert. Geändert wird ausschließlich die visuelle Überleitung nach der
Anmelde-Demonstration.

### Darstellungs- und Interaktionsgrenzen

- Nach `Ausfüllen` verschwinden das Anmeldefenster und die dreistufige Funktionsanzeige.
- Der noch geöffnete Tresor schließt sich zuerst. Anschließend schrumpft er und bewegt sich an
  seine Position oberhalb der Variantenaufstellung.
- Erst danach werden die Verbindungspfeile gezeichnet. Darauf folgen zeitlich gestaffelt die
  beiden lokalen Logos, die Variantentitel und ihre Stichpunkte.
- PassWo erscheint mit der bestehenden Variantenerklärung erst nach Abschluss dieser visuellen
  Sequenz. Die beiden Folgeerklärungen zu eigenständigem und integriertem Passwortmanager bleiben
  unverändert.
- Die Überleitung wird durch eigene Statechart-Zustände gesteuert. Bei Reduced Motion werden
  diese Wartezeiten übersprungen und derselbe fachliche Endzustand unmittelbar gezeigt.

## Folgeauftrag: Lesbare Tresoreinträge und visuelle Präzisierung, 25. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 25. August 2026. Die acht fiktiven Konten und die
fachliche Abfolge bleiben erhalten. Für kürzere, vollständig lesbare Kennungen steigt
`S12_PASSWORD_MANAGER_CONTENT_VERSION` auf `1.8.0`.

### Copy-Delta

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S12.vault.initialEntries.*.identifier` | Nutzerauftrag 2026-08-25 | längere dienstbezogene `.example`-Kennungen | kürzere `.example`-Kennungen derselben fiktiven Konten | Orientierung | vollständige Lesbarkeit in den Tresorkarten | nein | kein | sichtbare Kennung und Eintragskarte |

### Darstellungs- und Interaktionsgrenzen

- Konto und Kennung dürfen in der großen Tresoransicht umbrechen. Nur die kleine symbolische
  Tresoransicht der Varianten darf weiterhin mit Auslassung kürzen.
- Beim Ausfüllen fliegt eine grün gerahmte visuelle Kopie des gespeicherten
  `Anmeldebeispiel`-Eintrags zum Formular. Der ursprüngliche Eintrag bleibt sichtbar im Tresor.
- Die bestehenden Titel `Integrierter Passwortmanager` und `Eigenständiger Passwortmanager`
  werden größer dargestellt; ihr Wortlaut bleibt unverändert.

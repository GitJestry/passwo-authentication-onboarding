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

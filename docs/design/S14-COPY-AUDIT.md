# S14 Copy-Audit

## S14.0 — MFA und ein zweiter Faktor, 26. August 2026

### Umfang und Quelle

Der Nutzerauftrag vom 26. August 2026 ist die ausdrückliche Inhalts- und
Darstellungsentscheidung für S14.0. Die internen Skriptseiten 66–67 liefern den narrativen
Anschluss an die MFA-Sektion; die dort beschriebene Smartphone-Videosimulation wird für diesen
Auftrag durch den vorgegebenen ruhigen Desktopaufbau ersetzt.

Die neue Contentquelle liegt unter `packages/training-content/src/s14.ts` und beginnt mit der
Version `1.0.0`. Die Supportive-Artifact-Version steigt von `supportive-s00-s13-1.10.0` auf
`supportive-s00-s14-1.11.0`. Es wird kein geschützter Wortlaut aus
`docs/design/TRAINING-COPY.md` verändert.

### Copy-Delta

| Text-ID | Quelle / bisher | Implementierter Wortlaut | Primäre Rolle | Interaktionsziel | Hervorhebung | Grund und Bedeutungsänderung |
|---|---|---|---|---|---|---|
| `S14.guide.mfa` | Nutzerauftrag; noch nicht implementiert | `Bei der Multi-Faktor-Authentifizierung (MFA) werden für die Anmeldung mehrere unterschiedliche Faktoren miteinander kombiniert.` | Mechanismuserklärung | `Weiter` | `mehrere unterschiedliche Faktoren` · Akzent | neue ausdrücklich vorgegebene Erklärung; keine Bedeutungsänderung |
| `S14.concept.mfa` | Nutzerauftrag; noch nicht implementiert | `Multi-Faktor-Authentifizierung` / `MFA` | Orientierung | kein | mittige Begriffskarte | neue ausdrücklich vorgegebene Visualisierung |
| `S14.guide.twoFactor` | Nutzerauftrag; noch nicht implementiert | `Eine besonders häufige Form ist die Zwei-Faktor-Authentifizierung (2FA). Dabei kommen genau zwei unterschiedliche Faktoren zusammen.` | Mechanismuserklärung | `Weiter` | `genau zwei unterschiedliche Faktoren` · Akzent | neue ausdrücklich vorgegebene Erklärung; keine Bedeutungsänderung |
| `S14.concept.twoFactor` | Nutzerauftrag; noch nicht implementiert | `Zwei-Faktor-Authentifizierung` / `2FA` | Orientierung | kein | abgesetzte Begriffskarte unter MFA | neue ausdrücklich vorgegebene Visualisierung |
| `S14.factor.knowledge` | Nutzerauftrag; noch nicht implementiert | `Wissen` · `Passwort` · `Sicherheitsfragen` | Orientierung | kein | vollständige Karte während des zugehörigen Sprechschritts | vorgegebene Faktorgruppe und Beispiele |
| `S14.guide.knowledge` | Nutzerauftrag: `Es gibt 3 Faktoren: Erstens Wissen, wie dein Passwort, Pin oder Sicherheitsfragen.` | `Es gibt drei Faktoren: Erstens Wissen, wie dein Passwort, deine PIN oder Sicherheitsfragen.` | Mechanismuserklärung | `Weiter` | `Wissen` · Akzent | reine Grammatik-, Schreibweisen- und Typografiekorrektur; nein |
| `S14.factor.possession` | Nutzerauftrag; noch nicht implementiert | `Besitz` · `Authenticator-App` · `Sicherheitsschlüssel` | Orientierung | kein | vollständige Karte während des zugehörigen Sprechschritts | vorgegebene Faktorgruppe und Beispiele |
| `S14.guide.possession` | Nutzerauftrag: `Zweitens etwas was du besitzt wie deine Authenticator App auf dem Handy oder ein zusätzlichen USB-Stick zum verifizeren.` | `Zweitens etwas, das du besitzt, wie deine Authenticator-App auf dem Handy oder einen zusätzlichen USB-Sicherheitsschlüssel zum Verifizieren.` | Mechanismuserklärung | `Weiter` | `etwas, das du besitzt` · Akzent | Grammatik und Schreibweise korrigiert; `USB-Stick` auf den fachlich gemeinten Sicherheitsschlüssel präzisiert; begrenzt |
| `S14.factor.biometrics` | Nutzerauftrag; noch nicht implementiert | `Biometrie` · `Fingerabdruck` · `Gesichtserkennung` | Orientierung | kein | vollständige Karte während des zugehörigen Sprechschritts | vorgegebene Faktorgruppe und Beispiele |
| `S14.guide.biometrics` | Nutzerauftrag: `Und drittens einfach deinen Körpermerkmal welches du schon tagtäglich kennst wie Gesichtserkennung oder Fingerabdrücke.` | `Und drittens ein Körpermerkmal, das du schon tagtäglich nutzt, wie Gesichtserkennung oder Fingerabdrücke.` | Mechanismuserklärung | `Weiter` | `ein Körpermerkmal` · Akzent | Grammatik und Lesbarkeit korrigiert; nein |
| `S14.combination.passwordApp` | Nutzerauftrag; noch nicht implementiert | `Passwort + Authenticator-App` / `✓` | Orientierung | kein | grüner Rahmen plus Häkchen | gültige Kombination aus zwei beschrifteten Faktorarten |
| `S14.combination.passwordKey` | Nutzerauftrag; noch nicht implementiert | `Passwort + Sicherheitsschlüssel` / `✓` | Orientierung | kein | grüner Rahmen plus Häkchen | gültige Kombination aus zwei beschrifteten Faktorarten |
| `S14.combination.passwordPassword` | Nutzerauftrag; noch nicht implementiert | `Passwort + Passwort` / `✗` | Orientierung | kein | roter Rahmen plus Kreuz | ungültige Wiederholung derselben Faktorart; Farbe ist nicht alleiniger Bedeutungsträger |
| `S14.guide.distinct` | Nutzerauftrag; noch nicht implementiert | `Entscheidend ist, dass die beiden Faktoren unterschiedlich sind.` | Kerngedanke | `Weiter` | `unterschiedlich` · Akzent | neue ausdrücklich vorgegebene Zusammenfassung; keine Bedeutungsänderung |
| `S14.browser.masterCampusTab` | Nutzerauftrag; noch nicht implementiert | `Master Campus` | Navigation | noch gesperrter Browser-Tab | keine | sichtbarer, aber absichtlich noch nicht bedienbarer Folgeschritt |
| `S14.browser.searchTab` | Nutzerauftrag; noch nicht implementiert | `Neuer Tab` / `Search` / `Mit Search suchen` | Orientierung | kein | keine | vorgegebener terminaler Suchtab ohne vorweggenommene Folgehandlung |

### Interaktions- und Darstellungsdelta

- S14.0 startet auf der bestehenden DesktopSurface ohne zusätzliche Lernoberfläche. Nach einer
  kurzen, in der Contentquelle konfigurierten Pause erscheint der erste PassWo-Sprechschritt.
- MFA und 2FA werden nacheinander kurz als mittige Begriffskarten sichtbar. Danach ersetzen die
  drei Faktorlisten diese Begriffsansicht gemeinsam; jede aktive Faktorgruppe erhält zusätzlich
  zu Farbe einen stärkeren Rahmen und eine räumliche Anhebung.
- Alle sechs Beispiele besitzen ein eigenes semantisch passendes Symbol. Die Kombinationen werden
  deterministisch nacheinander eingeblendet; Reduced Motion zeigt denselben Endzustand ohne
  Übergangsbewegung.
- `Weiter` dient ausschließlich dem Dialog- beziehungsweise Szenenfortschritt. Nach dem
  Kerngedanken öffnet dieser Schritt die ausdrücklich verlangte nächste Browseransicht.
- Der Browser endet mit aktivem Suchtab und sichtbarem Master-Campus-Tab. Die BrowserShell ist in
  diesem Zustand gesperrt; insbesondere kann Master Campus noch nicht ausgewählt werden.

### Review-Gate

- Jeder Sprechschritt enthält genau einen Hauptgedanken.
- Die drei längeren Faktorsätze bleiben erhalten, weil sie die vom Nutzer ausdrücklich
  vorgegebene Dreiteilung tragen; die sichtbaren Listen stellen die Beispiele parallel dar.
- Die Hervorhebung bleibt pro Sprechschritt auf eine semantische Phrase begrenzt.
- Gültig und ungültig werden durch Text, Häkchen beziehungsweise Kreuz und Rahmen vermittelt,
  nicht allein durch Farbe.
- Es gibt keine Sicherheitsgarantie, keine Bewertung realer Passwörter und keine neue
  persistierbare Datenklasse.

## Folgekorrektur — S07-Suchansicht ohne Eintrag, 26. August 2026

Der Nutzerauftrag ersetzt die zunächst eigenständig stilisierte S14-Suchstartseite durch den
kanonischen Search-Look aus S07. Die S14-Content-Version steigt von `1.0.0` auf `1.1.0`, die
Supportive-Artifact-Version von `supportive-s00-s14-1.11.0` auf
`supportive-s00-s14-1.12.0`.

| Text-ID | Bisher | Implementiert | Primäre Rolle | Interaktionsziel | Hervorhebung | Grund und Bedeutungsänderung |
|---|---|---|---|---|---|---|
| `S14.browser.searchTab` | `Neuer Tab` / `Search` / `Mit Search suchen` | `Neuer Tab` / `Search` / leeres Suchfeld | Orientierung | kein | keine | ausdrücklich verlangte Angleichung an S07 bei zugleich noch leerem Suchfeld; nein |

Darstellungsdelta: S14 verwendet für Hintergrundgrafik, Wortmarke, Suchfeld, Farben, Abstände und
Suchsymbol unmittelbar dieselben CSS-Modulklassen wie die S07-Search-Landingpage. Ein Suchbegriff
und das zugehörige Löschsymbol werden nicht gerendert. Das Suchsymbol bleibt in dieser terminalen
Szene rein visuell und nicht bedienbar; der Master-Campus-Tab bleibt weiterhin gesperrt.

## S14.1 — Recherche und Aktivierungspfad, 26. August 2026

### Umfang und Quelle

Der Nutzerauftrag vom 26. August 2026 ersetzt den bisherigen terminalen, gesperrten Suchtab durch
eine geführte lokale Recherche. Die Bilder `suchergebnnise.png` und `hilfeseite.png` aus dem
Download-Ordner sind die ausdrücklich benannten Designreferenzen. Die S14-Content-Version steigt
von `1.1.0` auf `1.2.0`, die Supportive-Artifact-Version von
`supportive-s00-s14-1.12.0` auf `supportive-s00-s14-1.13.0`.

### Copy-Delta

| Text-ID | Quelle / bisher | Implementierter Wortlaut | Primäre Rolle | Interaktionsziel | Hervorhebung | Grund und Bedeutungsänderung |
|---|---|---|---|---|---|---|
| `S14.guide.serviceVariation` | Nutzerauftrag; nicht vorhanden | `Wo du 2FA einschaltest, sieht bei jedem Dienst etwas anders aus.` | Mechanismuserklärung | `Weiter` | `bei jedem Dienst etwas anders` · Akzent | ausdrücklich vorgegebener Dienstgrenzen-Hinweis; freigegeben |
| `S14.guide.findAvailability` | Nutzerauftrag; nicht vorhanden | `Finde zuerst heraus, ob Master Campus Zwei-Faktor-Authentifizierung anbietet und wo du sie aktivieren kannst.` | Navigation | Suchschaltfläche im sichtbaren Suchfeld | `Finde zuerst heraus` · Aktion | ausdrücklich vorgegebene Recherchehandlung; freigegeben |
| `S14.browser.searchPage.query` | Nutzerauftrag; leeres Suchfeld | `Master Campus 2FA aktivieren` | Orientierung | nicht editierbares Suchfeld | keine | ausdrücklich vorgegebene, automatisch erscheinende Suchanfrage; freigegeben |
| `S14.browser.searchPage.results` | Bilder `suchergebnnise.png`; nicht vorhanden | vier lokale fiktive Suchtreffer mit Master Campus Hilfe an erster Stelle | Orientierung | erster Suchtreffer | S07-Aktionsrahmen am ersten Treffer | visuelle und inhaltliche Übernahme der benannten Vorlage in den bestehenden fiktiven Search-Look; freigegeben |
| `S14.browser.helpPage.location` | Bild `hilfeseite.png`; nicht vorhanden | `Einstellungen → Sicherheit → Zwei-Faktor-Authentifizierung` | Navigation | Master-Campus-Tab | keine | geforderte, nahezu wortgleiche Übernahme des Pfades; freigegeben |
| `S14.browser.helpPage.requirements` | Bild `hilfeseite.png`: `Eine Authenticator-App (z. B. Google Authenticator oder Microsoft Authenticator) auf deinem Smartphone.` | `Eine Authenticator-App auf deinem Smartphone.` | Orientierung | kein | keine | ausdrücklich verlangte Entfernung der beiden Markenbeispiele; begrenzt |
| `S14.guide.helpFound` | Nutzerauftrag; nicht vorhanden | `Gefunden. Aktiviere 2FA jetzt bei Master Campus.` | Ergebnisfeedback und Navigation | sichtbarer Master-Campus-Tab | `Master Campus` · Aktion | ausdrücklich vorgegebene Folgehandlung; freigegeben |

### Interaktions- und Darstellungsdelta

- Der erste neue Sprechschritt bleibt reiner Dialogfortschritt. Mit dem zweiten Sprechschritt
  erscheint die feste Suchanfrage autofill-ähnlich; sie kann nicht verändert werden und nur die
  markierte Suchschaltfläche löst den nächsten Statechart-Übergang aus.
- Der Ergebniszustand lädt deterministisch. Vier fiktive Treffer halten die Seite auch bei kleinen
  Browserhöhen scrollbar; ausschließlich der hervorgehobene obere Hilfetreffer ist bedienbar.
- Die lokale Master-Campus-Hilfeseite übernimmt Informationsarchitektur, geöffnete FAQ,
  Aktivierungspfad und Feedbackzeile aus der Vorlage. Die FAQ nennt keine Anbieterbeispiele.
- Erst nach dem Öffnen der Hilfeseite werden Such- und Master-Campus-Tab freigeschaltet. Der
  Master-Campus-Tab erhält den S07-Hinweisrahmen und ist die einzige Quelle des Übergangs in die
  freie Tabnavigation; danach bleiben beide Tabs tastaturbedienbar.
- Die Suche, Hilfeseite und Tabwahl bleiben vollständig flüchtig. Es entstehen keine
  Forschungswrites oder neuen persistierbaren Datenklassen.

## S14.2 — MFA-Faktorstruktur und Copy-Korrektur, 26. August 2026

### Umfang und Quelle

Der Nutzerauftrag vom 26. August 2026 ersetzt die anfängliche MFA-/2FA-Darstellung und gibt die
zugehörigen PassWo-Sätze ausdrücklich vor. Die drei Faktorlisten bleiben dabei durchgehend
sichtbar. Die frühere Folge aus getrennten Begriffskarten und drei Kombinationstexten entfällt.
Zusätzlich korrigiert der Auftrag den Begriff in der Master-Campus-Recherche und entfernt den
Einleitungsabsatz der Hilfeseite. Die S14-Content-Version steigt von `1.2.0` auf `1.3.0`, die
Supportive-Artifact-Version von `supportive-s00-s14-1.13.0` auf
`supportive-s00-s14-1.14.0`.

### Copy-Delta

| Text-ID | Bisher | Implementiert | Primäre Rolle | Interaktionsziel | Hervorhebung | Grund und Bedeutungsänderung |
|---|---|---|---|---|---|---|
| `S14.guide.mfa` | `Bei der Multi-Faktor-Authentifizierung (MFA) werden für die Anmeldung mehrere unterschiedliche Faktoren miteinander kombiniert.` | `Bei der Multi-Faktor-Authentifizierung (MFA) werden für die Anmeldung mehrere unterschiedliche Faktoren kombiniert.` | Mechanismuserklärung | `Weiter` | `mehrere unterschiedliche Faktoren` · Akzent | ausdrücklich vorgegebene Straffung; nein |
| `S14.guide.twoFactor` | `Eine besonders häufige Form ist die Zwei-Faktor-Authentifizierung (2FA). Dabei kommen genau zwei unterschiedliche Faktoren zusammen.` | `Eine besonders häufige Form ist die Zwei-Faktor-Authentifizierung (2FA). Dabei werden genau zwei unterschiedliche Faktoren kombiniert.` | Mechanismuserklärung | `Weiter` | `genau zwei unterschiedliche Faktoren` · Akzent | ausdrücklich vorgegebene Angleichung an den sichtbaren Kombinationsmechanismus; nein |
| `S14.guide.knowledge` | `Es gibt drei Faktoren: Erstens Wissen, wie dein Passwort, deine PIN oder Sicherheitsfragen.` | `Der erste Faktor ist Wissen, zum Beispiel dein Passwort, eine PIN oder die Antwort auf eine Sicherheitsfrage.` | Mechanismuserklärung | `Weiter` | `Wissen` · Akzent | ausdrücklich vorgegebene Präzisierung der Beispiele; begrenzt |
| `S14.guide.possession` | `Zweitens etwas, das du besitzt, wie deine Authenticator-App auf dem Handy oder einen zusätzlichen USB-Sicherheitsschlüssel zum Verifizieren.` | `Der zweite Faktor ist Besitz, zum Beispiel eine Authenticator-App auf deinem Handy oder ein Sicherheitsschlüssel.` | Mechanismuserklärung | `Weiter` | `Besitz` · Akzent | ausdrücklich vorgegebene Kürzung und Angleichung an die sichtbare Liste; begrenzt |
| `S14.guide.biometrics` | `Und drittens ein Körpermerkmal, das du schon tagtäglich nutzt, wie Gesichtserkennung oder Fingerabdrücke.` | `Der dritte Faktor ist Biometrie, zum Beispiel Gesichtserkennung oder ein Fingerabdruck.` | Mechanismuserklärung | `Weiter` | `Biometrie` · Akzent | ausdrücklich vorgegebene Kürzung und Angleichung an die sichtbare Liste; begrenzt |
| `S14.guide.findAvailability` | `Finde zuerst heraus, ob Master Campus Zwei-Faktor-Authentifizierung anbietet und wo du sie aktivieren kannst.` | `Finde zuerst heraus, ob Master Campus Zwei-Faktor-Authentifizierung anbietet und wo du sie aktivieren kannst.` | Navigation | Suchschaltfläche im sichtbaren Suchfeld | `Finde zuerst heraus` · Aktion | ausdrücklich verlangte Begriffskorrektur; nein |
| `S14.browser.helpPage.introduction` | `Hier erfährst du, wo du die Zwei-Faktor-Authentifizierung für dein Master-Campus-Konto aktivierst.` | entfällt | Orientierung | kein | keine | ausdrücklich verlangte Entfernung einer redundanten Einleitung; begrenzt |

### Interaktions- und Darstellungsdelta

- Die drei Listen `Wissen`, `Besitz` und `Biometrie` stehen von Beginn der MFA-Erklärung an links,
  mittig und rechts. Ihre großen unterstrichenen Titel, jeweils zwei Beispiele und sechs
  semantischen Symbole bleiben bestehen.
- Ein mittiger MFA-Knoten verbindet sich zunächst sichtbar mit allen drei Faktorlisten. Im
  folgenden Sprechschritt wird ausschließlich dieser Knoten durch `Zwei-Faktor-Authentifizierung` /
  `2FA` ersetzt.
- Während der 2FA-Erklärung wechseln die sichtbaren Linienpaare im Sekundentakt deterministisch
  zwischen Wissen/Besitz, Wissen/Biometrie und Besitz/Biometrie. Bei Reduced Motion bleibt das
  gültige Paar Wissen/Besitz statisch sichtbar.
- Nach `Weiter` verschwindet der 2FA-Knoten. Die drei Faktorlisten bleiben für die einzelnen
  Faktor-Erklärungen und den abschließenden Kerngedanken sichtbar; nur die jeweils erklärte Liste
  wird zusätzlich über Rahmen und Leuchte hervorgehoben.
- Nach den drei Faktor-Erklärungen erscheinen wieder deterministisch zwei Kombinationen aus
  unterschiedlichen Faktoren und anschließend die ungültige Wiederholung desselben Faktors.
  Ablaufentscheidungen bleiben vollständig in der S14-Statechart; die zyklische Linienprojektion
  ist eine zustandsgebundene, rein visuelle CSS-Animation.

## S14.3 — Einheitliche Authentifizierungsbegriffe, 26. August 2026

Der ausdrückliche Nutzerauftrag vereinheitlicht innerhalb von S14 alle sichtbaren Begriffe auf
`Authentifizierung`. Dies umfasst die MFA-/2FA-Begriffsknoten, die
Suchtreffer sowie Titel, zugängliche Bezeichnung, Brotkrümel, Frage und Aktivierungspfad der
Hilfeseite. Rollen, Interaktionsziele und Hervorhebungen bleiben unverändert. Die
S14-Content-Version steigt von `1.3.0` auf `1.4.0`, die Supportive-Artifact-Version von
`supportive-s00-s14-1.14.0` auf `supportive-s00-s14-1.15.0`.

Darstellungskorrektur: Die drei Faktorkarten stehen in allen MFA-, 2FA-, Erklärungs- und
Kombinationszuständen an derselben oberen Position. Der jeweilige MFA-/2FA-Begriff erscheint
darunter. Kräftigere Verbindungslinien, eine helle Konturkante und sichtbare Endpunkte machen die
Verbindung zu jeder Faktorkarte eindeutig; die aktive Faktor-Erklärung verändert nur Rahmen und
Leuchte, nicht mehr die Kartenposition.

## S14.4 — 2FA bei Master Campus einrichten und anwenden, 26. August 2026

### Umfang und Quelle

Der ausdrückliche Nutzerauftrag für die dort bezeichneten Schritte 14.1 und 14.2 sowie die fünf
benannten Referenzbilder `einstellungen.png`, `sicherheit.png`,
`zwei fakto authentifizierung.png`, `2fa einrichten mit phone.png` und
`mit authenticator phone anmelden.png` sind die Inhalts-, Reihenfolge- und
Darstellungsentscheidung. Der bestehende Rechercheablauf bleibt unverändert und führt nun in die
vollständige flüchtige Einrichtung und erneute Anmeldung. Die S14-Content-Version steigt von
`1.4.0` auf `1.5.0`, die Supportive-Artifact-Version von `supportive-s00-s14-1.15.0` auf
`supportive-s00-s14-1.16.0`. Geschützter Wortlaut wird nicht verändert.

### Copy-Delta

| Text-ID | Quelle / bisher | Implementierter Wortlaut | Primäre Rolle | Interaktionsziel | Hervorhebung | Grund und Bedeutungsänderung |
|---|---|---|---|---|---|---|
| `S14.browser.masterCampus.navigation` | Nutzerauftrag; bisher `Sicherheit` vor `Profil` | `Übersicht`, `Campus Workspace`, `Campus Services`, `Campus Cloud`, `Profil`, `Einstellungen` | Navigation | ausschließlich `Übersicht` und `Einstellungen` | aktive Zeile, Icon und Tastaturfokus | ausdrücklich verlangte Reihenfolge und Bediengrenze; freigegeben |
| `S14.browser.masterCampus.settings` | drei Referenzbilder; nicht vorhanden | `Einstellungen` → `Sicherheit` → `Zwei-Faktor-Authentifizierung` | Navigation | jeweils die einzige bedienbare Hauptkarte | geführter Aktionsrahmen | ausdrücklich vorgegebener Aktivierungspfad; freigegeben |
| `S14.browser.masterCampus.twoFactor.inactiveStatusDescription` | Referenzzustand; nicht vorhanden | `Für dieses Konto ist noch kein zweiter Faktor eingerichtet.` | Orientierung | QR-Code und Handy | Statuszeile `Noch nicht aktiviert` | trennt den Ausgangszustand eindeutig vom späteren Einrichtungsergebnis; freigegeben |
| `S14.browser.masterCampus.twoFactor.setupDescription` | Nutzerauftrag und Referenz; nicht vorhanden | `Öffne die Authenticator-App auf dem Handy und ziehe das Handy auf den QR-Code.` | Navigation | sichtbares Handy und QR-Ziel | geführter QR-Rahmen | Interaktion benennt exakt Drag-and-drop; Tastaturaktivierung löst dieselbe Handlung aus |
| `S14.browser.masterCampus.twoFactor.codeDescription` | Nutzerauftrag; nicht vorhanden | `Übernimm den sechsstelligen Code aus der Authenticator-App.` | Navigation | sichtbarer Code in der Handy-App | geführte Codekarte | ausdrücklich geforderte Codeübernahme; freigegeben |
| `S14.guide.configured` | Nutzerauftrag; nicht vorhanden | `Damit ist die Zwei-Faktor-Authentifizierung für Master Campus eingerichtet.` / `Probier jetzt aus, was sich beim Anmelden verändert.` | Ergebnisfeedback und Navigation | `Weiter` | `Zwei-Faktor-Authentifizierung für Master Campus eingerichtet` · positiv | beide ausdrücklich vorgegebenen Sätze bleiben als zwei Absätze in einem kurzen Übergang zusammen; freigegeben |
| `S14.browser.masterCampus.login.secondFactorTitle` | Nutzerauftrag; nicht vorhanden | `Bestätigungscode eingeben` | Orientierung | Codekarte in der Authenticator-App | keine | neuer sichtbarer Anmeldeschritt; freigegeben |
| `S14.browser.masterCampus.login.confirmAction` | Nutzerauftrag; nicht vorhanden | `Code bestätigen` | Navigation | primäre Seitenaktion nach Codeübernahme | keine | Button löst exakt die bezeichnete Handlung aus; freigegeben |
| `S14.browser.masterCampus.login.successStatus` | Nutzerauftrag; nicht vorhanden | `Angemeldet` | Ergebnisfeedback | kein | Häkchen plus Text | geforderte, nicht allein farbcodierte Erfolgsmeldung |
| `S14.guide.closeAfterLogin` | Nutzerauftrag; nicht vorhanden | `Schließe den Browser noch einmal und schau, was sich im Kontonetzwerk verändert hat.` | Navigation | sichtbare Browser-Schließen-Steuerung | `Schließe den Browser noch einmal` · Aktion | ausdrücklich vorgegebene Folgehandlung ohne Ersatzbutton; freigegeben |

### Interaktions- und Darstellungsdelta

- Nach Wahl des Master-Campus-Tabs bleiben Such- und Master-Campus-Tab bedienbar. Die linke
  Portalnavigation rendert nur `Übersicht` und `Einstellungen` als Buttons; alle übrigen Einträge
  bleiben nicht bedienbare Orientierung. `Einstellungen` steht als letzter Listeneintrag.
- Sicherheit und Zwei-Faktor-Authentifizierung sind die jeweils einzigen bedienbaren Inhaltskarten.
  Die übrigen Referenzkarten sind statische Portaloberfläche und erzeugen keine versteckten
  Übergänge.
- Das Handy kann per Drag-and-drop auf den QR-Code gezogen oder als fokussierbares gleichwertiges
  Ziel mit der Tastatur ausgelöst werden. Nach dem Scan erscheint der flüchtige Master-Campus-
  Eintrag in der Authenticator-App; drei deterministische sechsstellige Beispielcodes wechseln in
  der S14-Statechart. Kein Code, Scan- oder Einrichtungszustand wird persistiert oder geloggt.
- `Weiter` nach dem Einrichtungsfeedback öffnet die Anmeldung. Der Passwortmanager füllt den
  lokalen Beispielbenutzernamen und das maskierte Passwort ohne zusätzlichen Klick aus; danach
  erscheint der eigenständige Bestätigungscode-Schritt mit dem Handy unten rechts.
- Nach `Code bestätigen` zeigt die Oberfläche Häkchen und `Angemeldet`. PassWo verweist anschließend
  ohne Ersatzaktion auf die hervorgehobene Browser-Schließen-Steuerung. Das Schließen entfernt die
  Browserüberlagerung und zeigt den aktualisierten Master-Campus-Zustand im bestehenden Netzwerk.
- Farben sind durch Icons, Text, Rahmen und Statuszeichen redundant codiert. Schmale Container
  ordnen Karten und Handy untereinander an; Reduced Motion entfernt Ankunfts-, Autofill- und
  Codeübergangsbewegungen, nicht aber Zustände oder Bedienhandlungen.

## Folgekorrektur — konsistentes Master-Campus-Portal, 26. August 2026

Der ausdrückliche Nutzerauftrag vereinheitlicht die Master-Campus-Portaloberfläche über den frühen
S01-Zustand und die S14-Einrichtung hinweg. Die in S14.4 freigegebene Navigationsliste ist nun die
gemeinsame Contentquelle; S14 ergänzt ausschließlich die bereits festgelegte Bedienbarkeit von
`Übersicht` und `Einstellungen`. Das zugehörige Copy-Delta und der Versionssprung stehen im
S01-Audit unter `Copy-Delta S01 einheitliche Master-Campus-Navigation, 26. August 2026`. Der
sichtbare S14-Wortlaut bleibt unverändert, daher bleibt `S14_MFA_CONTENT_VERSION` bei `1.5.0`.

Darstellungsdelta: Die dunkelblaue Portalnavigation streckt sich bei der längeren
Zwei-Faktor-Einrichtungsseite über die vollständige scrollbare Seitenhöhe. Der Kontokreis in der
Master-Campus-Kopfleiste zeigt statt des festen Platzhalters `P` nur noch die erste Initiale des
flüchtigen Übungsbenutzernamens; ohne Namen wird neutral `C` angezeigt. Persistenz, Interaktion und
Forschungsdaten bleiben unverändert.

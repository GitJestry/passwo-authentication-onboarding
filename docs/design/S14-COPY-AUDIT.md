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
| `S14.concept.mfa` | Nutzerauftrag; noch nicht implementiert | `Multi-Faktor-Authentisierung` / `MFA` | Orientierung | kein | mittige Begriffskarte | neue ausdrücklich vorgegebene Visualisierung |
| `S14.guide.twoFactor` | Nutzerauftrag; noch nicht implementiert | `Eine besonders häufige Form ist die Zwei-Faktor-Authentifizierung (2FA). Dabei kommen genau zwei unterschiedliche Faktoren zusammen.` | Mechanismuserklärung | `Weiter` | `genau zwei unterschiedliche Faktoren` · Akzent | neue ausdrücklich vorgegebene Erklärung; keine Bedeutungsänderung |
| `S14.concept.twoFactor` | Nutzerauftrag; noch nicht implementiert | `Zwei-Faktor-Authentisierung` / `2FA` | Orientierung | kein | abgesetzte Begriffskarte unter MFA | neue ausdrücklich vorgegebene Visualisierung |
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

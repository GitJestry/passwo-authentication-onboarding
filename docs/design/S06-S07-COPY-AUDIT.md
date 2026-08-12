# S06--S07 Copy Audit

## Content-Delta S06 Preview-Beispielreihenfolge, 12. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 12. August 2026. Das lokale Fixture
`reuse-and-derived` zeigt beim ersten Ziel Master Campus eine begrenzte Ähnlichkeit zu Campusgram
und beim zweiten Ziel Campus E-Mail eine exakte Wiederverwendung des Campusgram-Werts.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.5.0` auf `2.6.0` erhöht.

| Segment und Content-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung |
|---|---|---|---|---|---|
| `S06.fixtures.reuse-and-derived.accounts.master-campus.fictionalPassword` | identisch zu Campusgram | `LunaMasterCampus2027?` | fachlicher Beispielwert | kein | macht die erste Preview zum Ergebnis `Ähnlich`; ausdrücklich freigegebene Beispieländerung |
| `S06.fixtures.reuse-and-derived.accounts.campus-email.fictionalPassword` | `LunaMail2027?` | identisch zu Campusgram | fachlicher Beispielwert | kein | macht die zweite Preview zum Ergebnis `Wiederverwendet`; ausdrücklich freigegebene Beispieländerung |

Die Werte bleiben fiktiv und flüchtig. Persistenz, Export, Analysegrenzen und sichtbare
Ergebnislabels ändern sich nicht.

## Copy-Delta S06 sequenzierte Angriffsvorschau, 12. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 12. August 2026. Die vorhandene
Wiederverwendungs-/Ähnlichkeits-Vorschau wird in die ersten beiden Ziele des S06-Angriffsablaufs
eingebunden. Das Delta ändert keine Analyseentscheidung, Persistenz oder Sicherheitsbehauptung.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.4.0` auf `2.5.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung |
|---|---|---|---|---|---|
| `S06.page.attackStart` | generisches `Weiter` nach dem gefundenen Ausgangskonto | `Angriff starten` | Navigation | Sprechblasenaktion startet die sichtbare Angriffslinie zum ersten Zielkonto | passt die Buttonsemantik an die tatsächlich ausgelöste Fachaktion an; Bedeutung begrenzt |
| `S06.comparisonResultLabels.exact-match` | ausführliches Beziehungslabel | `Wiederverwendet` | Ergebnisfeedback | kein | zeigt genau ein kompaktes Ergebnis am Ende der vollständig abgespielten Vorschau; Bedeutung unverändert |
| `S06.comparisonResultLabels.derived-variant-match` | ausführliches Beziehungslabel | `Ähnlich` | Ergebnisfeedback | kein | zeigt genau ein kompaktes Ergebnis am Ende der vollständig abgespielten Vorschau; Bedeutung unverändert |
| `S06.comparisonResultLabels.no-derived-path-recognized` | ausführliches Beziehungslabel | `Keine Übereinstimmung` | Ergebnisfeedback | kein | benennt ausschließlich das Ergebnis des begrenzten Vergleichs; keine Sicherheitsgarantie, Bedeutung begrenzt |

Die drei Ergebnislabels erhalten keine zusätzliche Hervorhebungsphrase; ihr eigener Statusstil
trägt die Ergebnisrolle. Der Weiterklick nach der ersten Vorschau löst ausschließlich deren
sichtbare Auflösung aus. Die zweite Vorschau endet im aktuellen Implementierungsumfang beim
fertig sichtbaren Ergebnis.

## Copy-Delta S06/S07 Vollpasswort-Treffer statt Guess-Schwelle, 11. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 11. August 2026 sowie die in ADR 0014
festgelegte blocklistenartige Vollpasswort-Semantik. Dieses Delta **ersetzt für den aktuellen
Stand** die frühere Copy-Interpretation `kurzer vollständiger Prüfweg`: Die numerische
`estimatedGuesses <= 100000`-Schwelle wird nicht mehr als Simulationsentscheidung verwendet.
S06 und S07 übernehmen nur den bereits in S05 bestimmten Zustand `whole-password-recognized`
oder `no-whole-password-recognized` sowie die davon getrennte Längenorientierung.

`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.3.4` auf `2.4.0` und
`S07_EVALUATION_CONTENT_VERSION` von `1.1.0` auf `1.2.0` erhöht. Persistenz, Export,
Timinggrenzen und die S06-Paarableitung bleiben unverändert.

| Segment / Textbereich | Bisherige Aussage | Freigegebene Aussage | Primäre Rolle | Grund |
|---|---|---|---|---|
| `S06.dispositionLabels.whole-password-recognized` | entsprechend kurzer vollständiger Prüfweg | ein früher Kandidat deckt das vollständige fiktive Passwort ab | Ergebnisfeedback | synchronisiert die Konsequenzdarstellung mit der neuen Vollpasswort-Regel statt einer Guess-Schwelle |
| `S06.dispositionLabels.no-whole-password-recognized` | kein entsprechend kurzer vollständiger Prüfweg | kein vollständiger früher Kandidat in den begrenzten Prüfungen erkannt | Safety Boundary | Gegenkategorie bleibt Nicht-Erkennung, kein Sicherheitsurteil |
| S06 Found-/Blocked-Narrationen | `kurzer vollständiger Prüfweg` | vollständiger früher Kandidat beziehungsweise kein solcher Kandidat in diesen Prüfungen | Mechanismuserklärung | entfernt verbliebene quantitative Implikation |
| `S07.dispositionLabels` | kurzer vollständiger Prüfweg / konkrete Regel | vollständiger früher Kandidat, begrenzte typische Variante oder kein vollständiger früher Kandidat | Diagnose | hält die Kontokarten mit S05/S06 konsistent |
| `S07.problemStatements.local-whole-password-recognized` | lokaler schneller/kurzer Weg | mindestens ein vollständiges Passwort wurde als früher Kandidat erkannt | Diagnose | benennt genau die Evidenzgrenze |
| `S07.page.overviewLabels.noWholePasswordRecognition` | `Kein schnellerer Weg erkannt` | `Kein vollständiger früher Kandidat erkannt` | Orientierung | macht die Gegenkategorie in der Gesamtauswertung sichtbar ohne Stärkeurteil |

Die S07-Längenorientierung bleibt ein eigener Problemtyp. Weder `< 15`, `< 12` noch eine reine
Kleinbuchstabenwahl erzeugen einen Vollpasswort-Treffer. Ebenso bedeutet
`no-whole-password-recognized` nicht `sicher`, `stark`, `bestanden` oder `unangreifbar`.

## Copy-Delta Fortschrittskarte vor S06 und nach S07, 9. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 9. August 2026. Die segmentübergreifende
Fortschrittskarte wird vor S06 mit `Passwörter einzigartig halten` als aktivem Teil und nach S07
mit `Passwörter ändern` als aktivem Teil gezeigt. Beide Textflächen dienen ausschließlich der
Orientierung, haben kein Interaktionsziel und führen keine neue Sicherheitsbehauptung ein. Das
vollständige Copy-Delta einschließlich Content-Version ist im
`S00--S05 Copy and Interaction Audit` dokumentiert.

## Copy-Delta vollständiger Prüfweg und Längenorientierung 3. August 2026

Quelle sind das Trainingsskript, `ADR 0014-Bounded-Password-Guessing` und die technische
S05-Spezifikation. Die Änderung synchronisiert die sichtbare Konsequenz- und Diagnosesprache mit
der tatsächlich implementierten begrenzten Entscheidung. Sie führt keine neue Sicherheitsregel
ein.

`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.2.0` auf `2.3.0` und
`S07_EVALUATION_CONTENT_VERSION` von `1.0.0` auf `1.1.0` erhöht.

| Segment / Textbereich | Bisherige Aussage | Freigegebene Aussage | Grund |
|---|---|---|---|
| `S06.dispositionLabels` | schneller beziehungsweise schnellerer Weg | entsprechend kurzer vollständiger Prüfweg in dieser begrenzten Simulation | Die Entscheidung beruht auf dem vollständigen zxcvbn-Kandidatenweg und nicht auf einem einzelnen Befund. |
| `S06` Found-Narrationen | Passwort über einen schnellen Weg gefunden | begrenzte Analyse erkennt einen entsprechend kurzen vollständigen Prüfweg | Vermeidet ein allgemeines Crack- oder Sicherheitsurteil. |
| `S06.local-check.*-blocked` | kein schneller Weg erkannt | kein entsprechend kurzer vollständiger Prüfweg erkannt | Die Gegenkategorie ist eine begrenzte Nicht-Erkennung, kein Stärkeurteil. |
| `S07.dispositionLabels` | konkrete lokale Regel / kein schnellerer Weg | kurzer vollständiger Prüfweg / kein kurzer vollständiger Prüfweg | Synchronisiert die Diagnose mit der eingefrorenen Simulationsentscheidung. |
| `S07.recommendationLabels.rebuild-below-length-orientation` | nicht vorhanden | selbst erstelltes Passwort mit mindestens 15 Zeichen neu aufbauen | Länge bleibt eine separate NIST-orientierte Handlungsempfehlung und kein Quick-Path-Ersatz. |
| `S07.problemStatements` | lokaler schneller Weg | kurzer vollständiger Rateweg und getrennte 15-Zeichen-Orientierung | Verhindert die Vermischung von Guessability-Befund und Längenorientierung. |

Unzulässig bleiben Teilnehmeraussagen wie `sicher`, `bestanden`, `garantiert stark`, eine exakte
Crack-Zeit oder die Behauptung, dass kein anderer Angreifer einen weiteren Weg finden könne.

### Copy-Delta S06 authored Kontextbegriffe und begrenzte Fuzzy-Erkennung 6. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 6. August 2026. Die drei kontobezogenen authored
Begriffslisten werden um passende Konto-, Dienst- und Umfeldbegriffe sowie explizite
Schreibvarianten ergänzt. Die lokale Analyse erkennt zusätzlich übliche Leetspeak-Formen und
höchstens eine einzelne Zeichenabweichung, etwa `Chat` in `ch4t!`. Die drei flüchtig abgeleiteten
Benutzernamen und fiktiven Konto-Mailadressen bleiben lokale Analyseinputs und werden weder
persistiert noch exportiert. `S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.3.2` auf `2.3.3`
und die Analysekonfiguration von `passwo-bounded-guess-path-v4` auf `passwo-bounded-guess-path-v5`
erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung |
|---|---|---|---|---|
| `S06.accounts.*.accountTerms` | wenige exakte Konto- und Dienstbegriffe | erweiterte kontospezifische Listen mit expliziten Varianten wie `Prüfung`/`Pruefung`, `Klausuren` und `Socials`/`soziale` | fachlicher Kontext | erhöht die Abdeckung der bereits freigegebenen fiktiven Kontoumfelder |
| lokale Konto-/Dienstprüfung | exakte case-insensitive Spans | zusätzlich begrenzte Leetspeak-Normalisierung und maximal eine Damerau-Levenshtein-Abweichung für Tokens ab fünf Zeichen | Analysegrenze | erkennt veränderte Schreibweisen deterministisch, ohne externe oder semantische Fuzzy-Suche |

### Copy-Delta S06 gemeinsame Kontextkataloge und Variantenabdeckung 8. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 8. August 2026. Master Campus, Campus E-Mail und
Campusgram verwenden weiterhin ihre kanonischen kontospezifischen Kataloge. Der authored Matcher
deckt nun die eingefrorene zxcvbn-Leetspeak-Tabelle einschließlich mehrzeichiger Ersetzungen ab;
die begrenzte Damerau-Levenshtein-Regel bleibt unverändert. Teilnehmertexte, Persistenz, Export,
Kandidatenzahl und Quick-Path-Entscheidung bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.3.3` auf `2.3.4` und die
Analysekonfiguration von `passwo-bounded-guess-path-v5` auf `passwo-bounded-guess-path-v6`
erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung |
|---|---|---|---|---|
| `S06.accounts.*.accountTerms` | kanonische kontospezifische Kataloge mit begrenzter Teilmenge typischer Ersetzungen | dieselben Kataloge mit zxcvbn-synchroner authored Variantenprüfung | fachlicher Kontext / Analysegrenze | konsistente Variantenabdeckung für alle drei fiktiven Konten ohne semantische Erweiterung |

### Technische Kompatibilität zur S05-Analysekonfiguration v2

Die S06-QA-Dispositionen verwenden ab dem 3. August 2026 die Konfigurationskennung
`passwo-bounded-guess-path-v2`. Schwelle, Dispositionslogik und Teilnehmertexte bleiben
unverändert. `S06_CONSEQUENCE_CONTENT_VERSION` wird dafür von `2.3.0` auf `2.3.1` erhöht.

# S06--S07 Copy Audit

## Copy- und Ablaufdelta S07 Passphrasen-Suche, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Die bisherige S07-Auswertung
entfällt. Nach dem bestätigten S06-Ende erscheint die vorhandene Fortschrittskarte mit dem
vierten aktiven Teil `Passphrase erstellen`; erst nach dieser Karte wird der S07-Start erfasst.
S07 zeigt danach wieder die drei bekannten, bereits angemeldeten Campus-Websites. Rechts neben
`Campusgram` liegt ein zusätzlicher bedienbarer Tab `Passphrase generieren`. Seine Seite bleibt
in diesem Ausbauschritt absichtlich leer. Die früheren fünf S07-Auswertungs-Fixtures werden durch
den direkten QA-Einstieg `s07-passphrase-search` ersetzt. Persistenz, Export und lokale
Trainingswerte bleiben unverändert.

`S00_CONTENT_VERSION` wird von `1.22.2` auf `1.23.0`,
`S06_CONSEQUENCE_CONTENT_VERSION` von `2.9.0` auf `2.10.0` und der neue
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` auf `2.0.0` gesetzt.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `sectionTransition.change-passwords` | `Passwörter ändern` | `Passphrase erstellen` | Orientierung | kein | benennt den vom Nutzer neu festgelegten Einstieg in S07; ausdrücklich freigegeben | aktiver Fortschrittspunkt |
| `S06.narrations.s06.transition.s07.heading` | `Was folgt nach einem Datenleck?` | `Passphrase erstellen` | Navigation | `Weiter` zur Fortschrittskarte | stimmt die Abschlussankündigung auf den neuen direkten S07-Einstieg ab; begrenzt | keine |
| `S06.narrations.s06.transition.s07.body` | Ankündigung einer Auswertung des Änderungsbedarfs und anschließender Passphrasenhilfe | `Als Nächstes erstellen wir eine neue Passphrase.` | Navigation | `Weiter` zur Fortschrittskarte | entfernt den Verweis auf die gelöschte Auswertung; begrenzt | keine |
| `S07.browser.searchTab.label` | nicht vorhanden | `Passphrase generieren` | Navigation | sichtbarer Browser-Tab | vom Nutzer benannter zusätzlicher Such-Tab; ausdrücklich freigegeben | keine |

Die neue S07 ergänzt keinen PassWo-Sprechschritt und macht noch keine Aussage zur Erzeugung
oder Qualität einer Passphrase. Das sichtbare Interaktionsziel ist allein der neue Browser-Tab.

## Copy- und Ablaufdelta S06 Master Campus, Campus E-Mail und S07-Übergang, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Nach der bereits implementierten
Campusgram-Ausbreitungsprüfung wird S06 bis zur Überleitung in S07 vervollständigt. Die vorhandene
lokale Vollpasswort-Prüfung, Vergleichsvorschau, Angreifer-, Datenleck-, Linien-, Schild- und
Befallen-Darstellung werden wiederverwendet. Master Campus wird als neuer möglicher Ausgangspunkt
lokal geprüft und anschließend **immer ausschließlich mit Campus E-Mail verglichen**. Ein
Vergleich von Master Campus zurück zu Campusgram findet nicht statt. Wurde das Master-Campus-
Passwort lokal nicht erkannt, wird vor dem Vergleich die vorhandene graue `Was wäre, wenn?`-
Darstellung mit der Befallen-Animation am Master-Campus-Knoten wiederverwendet. Der Vergleich
findet auch dann statt, wenn sein Ergebnis `Keine Übereinstimmung` ist, damit die erfolgreiche
Trennung der beiden Passwörter in der Simulation sichtbar erfahrbar wird. Campus E-Mail wird
danach nur noch lokal geprüft; ein redundanter dritter Ausbreitungslauf wird nicht wiederholt.

Die adaptive Endrückmeldung beschreibt ausschließlich in der Übung sichtbare Konsequenzen. Sie
bestätigt getrennte Passwörter als dargestellte Begrenzung der kontoübergreifenden Ausbreitung,
ohne die Person moralisch zu bewerten oder allgemeine Sicherheit zu behaupten. Bei sichtbarer
Wiederverwendung oder Ähnlichkeit benennt sie eine vollständig neue Passwortgrundlage als nächsten
Schutzschritt. Die S07-Überleitung führt anschließend zur Frage, wo nach einem möglichen
Passwortdatenleck eine Änderung sinnvoll ist, und kündigt Passphrasen als mögliche Methode für
neue Passwörter an. `S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.8.0` auf `2.9.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.perspective.master-campus-found` | technischer Perspektivhinweis | lokaler Treffer wird als Ausgangspunkt für den nächsten sichtbaren Angriff eingeordnet | Ergebnisfeedback | `Angriff starten` | verbindet lokale Stärkeprüfung und vorhandene Ausbreitungsanimation ohne Ergebnis vorwegzunehmen | keine |
| `S06.narrations.s06.perspective.master-campus-blocked` | knapper Hinweis auf hypothetischen Vergleich | tatsächlicher Stopp wird benannt; der nächste Weg wird als `Was wäre, wenn?` eingeordnet | Ergebnisfeedback / Orientierung | `Weiter` | trennt tatsächlichen Nicht-Treffer, hypothetische Annahme und anschließenden Angriff in sichtbare Schritte | keine |
| `S06.narrations.s06.incident.master-campus-hypothetical` | nicht vorhanden | angenommenes Bekanntwerden des Master-Campus-Passworts und anschließendes Ausprobieren bei Campus E-Mail | Mechanismuserklärung | `Angriff starten` | folgt erst nach der sichtbaren hypothetischen Befallen-Animation und nimmt das Vergleichsergebnis nicht vorweg | keine |
| `S06` Master-Campus-Vergleich | bedingt; bei lokaler Nicht-Erkennung und `Keine Übereinstimmung` ausgelassen | Master Campus wird immer nur gegen Campus E-Mail geprüft, auch bei `Keine Übereinstimmung` | Ergebnisfeedback / Mechanismuserfahrung | Vergleichsvorschau bis `Fertig` | macht auch erfolgreich getrennte Passwörter unmittelbar sichtbar; kein Rückvergleich zu Campusgram | keine |
| `S06.narrations.s06.transition.campus-email` | nicht vorhanden | „Zum Schluss verschieben wir das Datenleck zu Campus E-Mail und prüfen dieses Passwort für sich.“ | Orientierung | `Weiter` | kündigt nur die lokale Prüfung an, nicht ihr Ergebnis | keine |
| `S06.narrations.s06.local-check.campus-email-found` | rein technischer Treffertext | lokaler Treffer wird unabhängig von den bereits gezeigten Kontoverbindungen als Anlass für ein für sich starkes Passwort eingeordnet | Ergebnisfeedback | `Weiter` | macht den zusätzlichen Nutzen des E-Mail-Perspektivwechsels sichtbar und formuliert den nächsten Schutzschritt motivierend statt verpflichtend | keine |
| `S06.narrations.s06.local-check.campus-email-blocked` | technischer Nicht-Treffer | günstiges begrenztes Ergebnis mit expliziter Nicht-Garantie | Ergebnisfeedback / Safety Boundary | `Weiter` | positive Rückmeldung ohne absolute Sicherheitsbehauptung | keine |
| `S06.narrations.s06.summary.separated` | nicht vorhanden | in den gezeigten Vergleichen keine erkannte Wiederverwendung oder Variante und dadurch begrenzte Ausbreitung | Ergebnisfeedback | `Weiter` | benennt den konkret beobachteten Schutzeffekt des Verhaltens, ohne die Person moralisch zu bewerten oder allgemeine Sicherheit abzuleiten | keine |
| `S06.narrations.s06.summary.connected` | nicht vorhanden | sichtbare Verbindung wird sachlich benannt und auf eine vollständig neue Grundlage verwiesen | Ergebnisfeedback | `Weiter` | non-blaming, handlungsorientierte Rückmeldung | keine |
| `S06.narrations.s06.transition.s07` | allgemeiner Segmentabschluss | möglicher Passwortverlust durch Datenleck, notwendige Ersetzung und Passphrasen als mögliche Hilfe | Orientierung / Guidance | `Weiter` nach S07 | schließt die sichtbare Konsequenzkette mit einem umsetzbaren nächsten Schritt, ohne S07-Ergebnisse vorwegzunehmen | keine |

Der Angreifer wird beim Start nur dann bereits an Campusgram dargestellt, wenn das vollständige
Passwort zuvor erkannt wurde. Bei einem Nicht-Treffer erscheint er erst mit der hypothetischen
Befallen-Animation. Beim Perspektivwechsel wird er am jeweils lokal geprüften Kontoknoten
dargestellt. Während der 1,35 Sekunden langen Angreiferbewegung bleibt der lokal geprüfte
Kontozweig neutral; Ergebnisfarbe und Schild erscheinen erst mit dem Prüfergebnis, bevor PassWo es
einordnet. Die Kennzeichnung `Was wäre, wenn?` steht im hypothetischen Modus
oben; die Endübersicht behält erkannte Passwortverbindungen sichtbar. Die Kennzeichnung
`Datenleck` erscheint nur während der lokalen Ausgangsprüfung; beim anschließenden
kontoübergreifenden Vergleich verschwindet sie. PassWo ist während der Vergleichsvorschau
weiterhin nicht sichtbar. `Weiter` beziehungsweise `Fertig` bleiben die einzigen Controls
innerhalb der Vorschau. Nur die kontoübergreifenden `-path`-Kanten werden zwischen zwei Angriffen
fortgeführt; lokale blaue Schutzkanten aus S05 werden nicht als frühere Angriffswege übernommen.
Die aktuell laufende Angriffskante wird über ihre Kanten-ID isoliert. Bereits sichtbare Kanten mit
demselben Ziel werden dadurch weder erneut gezeichnet noch bei einer blockierten Auflösung
ausgeblendet; dies gilt auch bei reduzierter Bewegung. Ein verspätetes Ende einer früheren
Statusanimation darf außerdem keinen inzwischen gewechselten Schutz- oder Befallston als
abgeschlossen markieren. Im Modus mit reduzierter Bewegung bleibt beim blockierten lokalen Check
nur der statische Schildzustand sichtbar. Die zugänglichen Kurzbeschreibungen der lokalen Checks
verwenden dieselbe begrenzte Vollpasswort-Terminologie wie die sichtbaren Texte.

## Copy- und Darstellungsdelta S06 Datenleck-Kennzeichnung und Angriffstiming, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Der Angreifer am betroffenen
Campusgram-Konto erhält die sichtbare Kennzeichnung `Datenleck`, solange die Darstellung noch
den Ausgangsangriff auf dieses Konto zeigt. Beim Übergang zur Wiederverwendungs- und
Ähnlichkeitsprüfung verschwindet die Kennzeichnung. Die Angriffslinie zeichnet sich nun als ein
einziger, flimmerfreier Pfad bis zum Zielknoten und die Vergleichsvorschau öffnet nach 0,7
Sekunden. Nach dem Schließen bleibt das bereits versionierte Vergleichsergebnis über dem
jeweiligen Zielknoten sichtbar. Inhaltliche Analyseentscheidung, Persistenz und Auswertung
bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.7.0` auf `2.8.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.page.dataLeak` | nicht vorhanden | `Datenleck` | Orientierung | kein | benennt den sichtbar dargestellten Ausgang des Angriffs; ausdrücklich freigegeben, begrenzt | Warnstatus der vorhandenen Angreiferdarstellung |

## Interaktionsdelta S06 wiederholbare Vergleichsvorschau, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Der bereits versionierte
Buttontext `Animation wiederholen` wird in der Vergleichsvorschau sichtbar verwendet. Er startet
ausschließlich die lokale fachliche Vorschau erneut und verändert weder Angriffsergebnis noch
Studienablauf, Persistenz oder Auswertung. Da der vorhandene Wortlaut unverändert bleibt, ist
keine Content-Versionsänderung erforderlich.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.page.replay` | `Animation wiederholen` ist versioniert, aber in der Vergleichsvorschau nicht sichtbar | Wortlaut unverändert sichtbar neben `Weiter` beziehungsweise `Fertig` | Navigation | wiederholt nur die sichtbare Vergleichsanimation | ausdrücklich verlangte Wiederholbarkeit; keine Bedeutungsänderung | keine |

## Copy- und Ablaufdelta S06 real und hypothetisch ab Campusgram, 12. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 12. August 2026. S06 beginnt nach dem
Campusgram-Ergebnis direkt mit dem realen Angriff oder, wenn dieser Weg nicht erkannt wurde,
mit einer klar gekennzeichneten hypothetischen Campusgram-Simulation. Die vorhandenen
Knoten-, Angriffs-, Befallen-, Schild- und Vergleichsmechaniken bleiben die einzigen
Darstellungsmechaniken. Persistenz, Export, Analyse, Vergleichsentscheidung und die spätere
Auswertung ändern sich nicht. `S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.6.0` auf `2.7.0`
erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.incident.campusgram-found` | Begrenzte Vollpasswort-Erkennung | „Da der Angreifer nun das Campusgram-Passwort kennt, probiert er dieses oder ähnliche Varianten davon bei den anderen Konten aus.“ | Mechanismuserklärung | `Angriff starten` | ausdrücklich vorgegebener Einstieg für den realen Pfad; begrenzt | keine |
| `S06.narrations.s06.incident.campusgram-blocked` | „Das Datenleck allein reicht hier nicht aus. Dieser tatsächliche Weg stoppt zunächst.“ | „Da der Angreifer das Campusgram-Passwort nicht herausfinden konnte, stellt sich die Frage: Was wäre passiert, wenn doch?“ | Orientierung | `Weiter` | trennt tatsächliche Nicht-Erkennung und hypothetische Annahme; ausdrücklich freigegeben | keine |
| `S06.narrations.s06.incident.campusgram-hypothetical` | nicht vorhanden | „Angenommen, der Angreifer hätte das Campusgram-Passwort gekannt. Dann hätte er dieses oder ähnliche Varianten bei den anderen Konten ausprobiert.“ | Mechanismuserklärung | `Angriff starten` | folgt erst der sichtbaren Befallen-Animation im hypothetischen Pfad; ausdrücklich freigegeben | keine |
| `S06.modes.hypothetical.overlay` | hypothetisches Beispiel | „Was wäre, wenn?“ | Orientierung | kein | dauerhaft sichtbare Kennzeichnung der hypothetischen Szene; ausdrücklich freigegeben | keine |
| `S06.page.continue`, `S06.page.finish` | kein eigener Vergleichsabschluss | `Weiter`, abschließend `Fertig` | Navigation | öffnet die vorhandene Auflösung der jeweiligen Vergleichsvorschau | ordnet die bestehenden Vorschau-Controls den beiden Angriffen zu; Bedeutung begrenzt | keine |
| `S06.narrations.s06.summary.actual-none` | allgemeine Endübersicht | „Der Angriff blieb auf Campusgram begrenzt. Die beiden anderen Konten blieben in dieser Prüfung geschützt.“ | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebene tatsächliche Null-Ausbreitung; begrenzt | keine |
| `S06.narrations.s06.summary.actual-one` | allgemeine Endübersicht | „Der Angriff konnte sich von Campusgram auf ein weiteres Konto ausbreiten. Das andere Konto blieb in dieser Prüfung geschützt.“ | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebene tatsächliche Einzelausbreitung; begrenzt | keine |
| `S06.narrations.s06.summary.actual-both` | allgemeine Endübersicht | „Der Angriff konnte sich von Campusgram auf beide anderen Konten ausbreiten.“ | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebene tatsächliche Ausbreitung auf beide Konten; begrenzt | keine |
| `S06.narrations.s06.summary.hypothetical-none` | allgemeine Endübersicht | „Selbst wenn das Campusgram-Passwort bekannt gewesen wäre, wäre der Angriff in dieser Simulation auf Campusgram begrenzt geblieben. Die anderen Konten wären geschützt geblieben.“ | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebene hypothetische Null-Ausbreitung; begrenzt | keine |
| `S06.narrations.s06.summary.hypothetical-one` | allgemeine Endübersicht | „Wäre das Campusgram-Passwort bekannt gewesen, hätte sich der Angriff auf ein weiteres Konto ausbreiten können. Das andere wäre in dieser Prüfung geschützt geblieben.“ | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebene hypothetische Einzelausbreitung; begrenzt | keine |
| `S06.narrations.s06.summary.hypothetical-both` | allgemeine Endübersicht | „Wäre das Campusgram-Passwort bekannt gewesen, hätte sich der Angriff auf beide anderen Konten ausbreiten können.“ | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebene hypothetische Ausbreitung auf beide Konten; begrenzt | keine |
| `S06.narrations.s06.transition` | kein eigener Übergang | „Bislang begann der Angriff bei Campusgram. Welches Konto zuerst bekannt wird, lässt sich aber nicht vorhersagen. Deshalb schauen wir uns die Konten jetzt noch einmal aus einer anderen Ausgangslage an.“ | Orientierung | `Weiter` zur nächsten Ausgangslage | ausdrücklich vorgegebene Überleitung nach vollständig aufgelösten Angriffen; ja | keine |

Die Vergleichsvorschau erhält keinen zusätzlichen PassWo-Text. Ihre erste vorhandene
`Weiter`-Steuerung löst ausschließlich die sichtbare Auflösung aus; der zweite Durchlauf endet
mit `Fertig`. Die Folgekarte erscheint erst, nachdem die jeweilige Befallen- oder
Schild-/Linienauflösung abgeschlossen ist.

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

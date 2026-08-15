# S06--S07 Copy Audit

## Copy- und Darstellungsdelta S07 beschriftete Erfolgsschilde, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Auf der
Campusgram-Erfolgskarte erhält der grüne Schild die Beschriftung `Einzigartig` und der blaue
Schild die Beschriftung `Stark`. Die Beschriftungen benennen die beiden bereits dargestellten
Eigenschaften und ersetzen keinen Handlungsschritt. Der bestehende Ergebnisstatus
`Passwort geändert` steht etwas tiefer, damit Schilde und Status visuell getrennt bleiben.
Persistenz, Export, Ablauf und Timing bleiben unverändert.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `4.6.0` auf `4.7.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.campusgramPasswordChangeCompleted.shieldLabels.green` | nicht vorhanden | `Einzigartig` | Ergebnisfeedback | kein | benennt die bereits dargestellte Unabhängigkeit der neuen Passphrase; ausdrücklich freigegeben | weißer Text auf grünem Schild |
| `S07.browser.campusgramPasswordChangeCompleted.shieldLabels.blue` | nicht vorhanden | `Stark` | Ergebnisfeedback | kein | benennt die bereits dargestellte Stärke der neuen Passphrase; ausdrücklich freigegeben | weißer Text auf blauem Schild |

## Copy-, Ablauf- und Darstellungsdelta S07 Generierungsbegleitung, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. PassWo bleibt während der ersten
und jeder weiteren Generierung sichtbar. Seine Sprechblase zeigt dabei den kurzen Status
`Passphrase wird erstellt …` und eine kleine Drei-Punkt-Ladeanimation. Bei Reduced Motion bleiben
die Punkte statisch sichtbar. Nach der ersten Generierung folgen weiterhin zuerst die allgemeine
Merkhilfe und danach der konkrete Merksatz. Bei jeder weiteren Generierung erscheint nach dem
Ladestatus ausschließlich der neue konkrete Merksatz; die allgemeine Merkhilfe wird nicht
wiederholt.

Auf Ansichten bis 880 Pixel Breite berücksichtigt die Generatorfläche zusätzlich den bestehenden
PassWo-Sicherheitsbereich am linken Rand. Der Charakter kann den Generator dadurch nicht mehr
überdecken; die Sprechblase berücksichtigt den Generator weiterhin als dynamisches Hindernis.
Persistenz und Export bleiben unverändert. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von
`4.5.0` auf `4.6.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.generating` | PassWo während der Generierung nicht sichtbar | `Passphrase wird erstellt …` mit Ladepunkten | Ergebnisfeedback | kein | hält die Begleitung während des kurzen Ladezustands sichtbar; begrenzt | animierte Teal-Punkte, bei Reduced Motion statisch |
| `S07.guide.mnemonicIntro` bei weiterer Generierung | wird nach jeder Generierung wiederholt | erscheint nur nach der ersten Generierung | Mechanismuserklärung | `Weiter` | vermeidet die ausdrücklich benannte Wiederholung | keine |
| `S07.guide.mnemonic` bei weiterer Generierung | folgt nach wiederholter allgemeiner Merkhilfe | erscheint direkt nach dem Ladestatus | Mechanismuserklärung | Generatoraktionen | zeigt nur den zur neuen Wortfolge gehörenden Merksatz | keine |
| `S07.browser.generatorPage.compactLayout` | zentrierter Generator kann vom PassWo-Charakter überlagert werden | berücksichtigt auf schmalen Ansichten den reservierten PassWo-Bereich | Orientierung | Generatoraktionen | behebt die sichtbare Überlagerung ohne Ablaufänderung | keine |

## Darstellungsdelta S07 Merkhilfe in zwei Sprechblasen, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Die allgemeine Merkhilfe und der
zur sichtbaren Wortfolge gehörende konkrete Merksatz erscheinen nach jeder Generierung nicht mehr
als zwei Absätze derselben Sprechblase, sondern als zwei aufeinanderfolgende PassWo-Schritte. Die
erste Sprechblase wird mit `Weiter` abgeschlossen; anschließend erscheint der konkrete Merksatz.
Der Wortlaut beider Textflächen bleibt unverändert. Generatoraktionen werden erst im zweiten
Schritt wieder freigegeben. Persistenz, Export und Timing bleiben unverändert.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `4.4.0` auf `4.5.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.mnemonicIntro` | erster Absatz einer gemeinsamen Sprechblase | eigene erste Sprechblase | Mechanismuserklärung | `Weiter` | trennt allgemeinen Merktipp und konkretes Beispiel auf ausdrücklichen Auftrag; keine Textänderung | keine |
| `S07.guide.mnemonic` | zweiter Absatz derselben Sprechblase | eigene zweite Sprechblase | Mechanismuserklärung | Generatoraktionen | ordnet den konkreten Merksatz als eigenen Schritt der sichtbaren Wortfolge zu; keine Textänderung | keine |

## Copy- und Darstellungsdelta S07 zentrierter Generator, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Der separate Intro-Block der
Passphrasen-Werkstatt entfällt vollständig. Die Generatorfläche steht anschließend horizontal
und vertikal mittig im verfügbaren Website-Bereich. Der gesamte Generator-Workspace wird für die
bestehende dynamische PassWo-Sprechblasenpositionierung als Hindernis markiert, damit PassWo und
sein Text die Bedienfläche nicht verdecken. Persistenz, Export, Timing und Generatorlogik bleiben
unverändert. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `4.3.0` auf `4.4.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.generatorPage.eyebrow` | `Mehr Länge, weniger Muster` | entfällt | Orientierung | kein | ausdrücklich verlangte Entfernung des separaten Intro-Blocks; begrenzt | keine |
| `S07.browser.generatorPage.securityMessage` | `Eine lange Passphrase aus zufällig gewählten Wörtern ist schwerer zu erraten und trotzdem gut merkbar.` | entfällt | Mechanismuserklärung | kein | ausdrücklich verlangte Entfernung; die Zufallsauswahl wird weiterhin zuvor durch PassWo erklärt | keine |
| `S07.browser.generatorPage.layout` | Intro links, Generator rechts | Generator mittig im verfügbaren Website-Bereich | Orientierung | Generatoraktionen | rückt die einzige Bedienfläche in den Mittelpunkt und hält sie von der dynamisch positionierten PassWo-Sprechblase frei; keine Bedeutungsänderung | keine |

## Copy- und Ablaufdelta S07 Passphrasenwechsel und S08-Übergang, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Die drei vorgegebenen
PassWo-Schritte ersetzen den bisherigen Methodeneinstieg und führen über das Plus-Symbol, das
Suchsymbol und den ersten Ergebnistreffer zur Werkstatt. Die längeren Einstiegs- und
Erfolgstexte überschreiten das normale Copy-Budget auf ausdrückliche Freigabe, bleiben aber als
getrennte Sprechschritte erhalten. Nach jeder Generierung werden Erinnerungshilfe und zugeordneter
Merksatz gemeinsam gezeigt. Kopieren, Rückkehr, Einsetzen und Absenden bleiben danach ohne
PassWo-Text; die lokale simulierte Zwischenablage bleibt flüchtig.

Weitere Konten werden nur übernommen, wenn ihre eigene begrenzte Analyse einen Volltreffer
ergeben hat oder der gerichtete Vergleich vom alten Campusgram-Passwort einen exakten Treffer
beziehungsweise eine relevante Variation erkennt. Ihre Passwortänderung wird nicht mehr im
Browser wiederholt, sondern als Abkürzung in der S08-Netzansicht ausgelöst. Jedes dort betroffene
Konto besitzt eine eigene einmalige Aktion; es werden weder Passphrasenwerte persistiert noch
exportiert. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `4.2.0` auf `4.3.0` und
`S08_NETWORK_REPLAY_CONTENT_VERSION` von `1.0.0` auf `1.1.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.methodIntro` | `Wir ersetzen das betroffene Passwort jetzt durch eine starke Passphrase. Dabei werden mehrere zufällig ausgewählte Wörter zu einem langen Passwort kombiniert.` | `Für ein starkes Passwort können wir mehrere zufällige Wörter zu einer langen Passphrase verbinden. So erreichen wir schnell mindestens 15 Zeichen, ohne ein selbst gewähltes Muster zu verwenden.` | Mechanismuserklärung | `Weiter` | übernimmt Länge und Mustergrenze wortgleich; ausdrücklich freigegeben | keine |
| `S07.guide.randomnessIntro` | nicht als eigener Schritt vorhanden | `Wichtig ist, dass die Wörter zufällig gewählt werden. Dafür verwenden wir hier eine Passphrase aus mindestens sechs zufälligen Wörtern.` | Mechanismuserklärung | `Weiter` | trennt Zufall und Mindestwortzahl als eigenen Schritt; ausdrücklich freigegeben | keine |
| `S07.guide.searchIntro` | `Dafür schauen wir nach einem Passphrase-Generator.` und `Suche nach einem Generator für eine Passphrase.` | `Du musst sie dir für diese Übung nicht merken. Suche nach einem Passphrase-Generator, erzeuge eine Passphrase und verwende sie für Campusgram.` | Navigation | Browser-`+`, danach Suchsymbol | ersetzt die bisherige doppelte Navigation wortgleich; ausdrücklich freigegeben | Plus etwas deutlicher, Suchsymbol und Ergebnistreffer dezent pulsierend |
| `S07.guide.mnemonicIntro` und `mnemonic` | zwei einmalige Voraberklärungen und anschließend nur der Merksatz | `Eine zufällige Passphrase kann zuerst ungewohnt wirken. Zum Merken kannst du aus den Wörtern ein kleines Bild oder einen Merksatz bauen.` plus `Möglicher Merksatz: [Merksatz]` nach jeder Generierung | Mechanismuserklärung | kein | bindet die Hilfe an jede sichtbare neue Ausgabe; ausdrücklich freigegeben | keine |
| `S07.guide.copied`, `pasteNew`, `pasteConfirm`, `submitChange` | `Die Passphrase ist kopiert ...`, `Setze deine kopierte Passphrase ...`, `Setze dieselbe Passphrase ...` und `Beide Felder stimmen überein ...` | entfallen | Navigation | Campusgram-Tab, Passwortfelder und Submit bleiben direkte Ziele | entfernt ausdrücklich unerwünschte Begleittexte und Hervorhebungen | nur lokaler `Kopiert`-Toast am Klickpunkt |
| `S07.guide.campusgramSuccess` | `Du hast das betroffene Campusgram-Passwort durch eine starke, einzigartige Passphrase ersetzt. Das alte Passwort aus der Datenleck-Datei funktioniert jetzt nicht mehr für Campusgram.` | `Sehr gut geschützt. Dein altes Campusgram-Passwort ist ersetzt. Der Angreifer kann den Treffer aus dem Datenleck für dieses Konto jetzt nicht mehr verwenden.` | Ergebnisfeedback | `Weiter` | ersetzt die bisherige Aussage wortgleich durch die freigegebene begrenzte Wirkung | keine |
| `S07.guide.allUnique` und `allResolved` | `Damit hast du gleichzeitig die bestehende Wiederverwendung beendet. Jedes deiner Konten hat jetzt ein eigenes Passwort.` sowie `Jetzt hat jedes Konto ein eigenes starkes Passwort. Schauen wir uns noch einmal an, was beim gleichen Angriff passiert.` | entfallen | Ergebnisfeedback / Navigation | kein | ausdrücklich verlangte Entfernung der bisherigen Folgesätze | keine |
| `S07.guide.remainingRisk` | `Bei [Konten] sind Passwörter noch gleich oder ähnlich. Das geleakte Passwort könnte dort also weiterhin ausprobiert werden.` | `Bei [Konto] besteht noch ein Treffer oder eine Verbindung zum alten Passwort. Auch dort ersetzen wir das Passwort durch eine eigene, einzigartige Passphrase.` | Ergebnisfeedback | `Weiter` | benennt nur tatsächlich qualifizierte Konten; ausdrücklich freigegeben | Kontonamen nur zur Referenzauflösung |
| `S07.guide.remainingPlan` | kontoweiser Browserzyklus | `Dafür können wir wieder die Kontenübersicht als Abkürzung nutzen. Schließe das Browserfenster.` | Navigation | sichtbare Browser-Fenstersteuerung | verlegt weitere Änderungen in die verlangte Netzansicht; ausdrücklich freigegeben | keine |
| `S08.protectionAction` | nicht vorhanden | `Einzigartige Passphrase erstellen` | Navigation | jeweils betroffener Kontoknoten | eine eigene direkte Aktion pro qualifiziertem Konto; ausdrücklich freigegeben | blau-rotes Schild und dezentes Konfetti nach Aktivierung |
| `S08.allProtected` | bisher unmittelbarer Angriffsrücklauf | `Damit sind die betroffenen Konten mit eigenen Passphrasen geschützt. Jetzt spielen wir den Angriff ein letztes Mal durch und schauen, was sich verändert hat.` | Ergebnisfeedback / Navigation | `Weiter`, danach Angriffsrücklauf | übernimmt die freigegebene Abschlussüberleitung wortgleich | keine |

Der grüne Haken der Campusgram-Bestätigung wird durch das bereits verwendete
Teilnehmer-Schild ersetzt. Dasselbe Schild und dieselbe kurze, bei Reduced Motion entfallende
Konfetti-Rückmeldung werden für die betroffenen S08-Knoten verwendet. Nicht betroffene Konten
bleiben unverändert und erhalten keine Aktion.

## Copy- und Darstellungsdelta S07 Passwortänderung und Plus-Führung, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Der Titel der ausschließlich
fiktiven S07-Passwortänderung wird auf die sichtbare Handlung verkürzt. Die vorhandenen
Sichtbarkeitsaktionen der Passwortfelder sind in S07 wieder bedienbar. Im Schritt, der zum
Öffnen eines neuen Tabs auffordert, wird die Campusgram-Seitenfläche abgedunkelt; der bereits
hervorgehobene Plus-Button im Browser-Chrome bleibt das einzige Fortschrittsziel. Ablauf,
flüchtige Eingaben, Persistenz, Export und Timing bleiben unverändert.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `4.1.0` auf `4.2.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.passwordChangeTitle` | `Campusgram-Passwort ändern` | `Passwort ändern` | Navigation | Passwortformular | ausdrücklich freigegebene Verkürzung auf die sichtbare Handlung; begrenzt | keine |


## Copy-Delta S07 neuer Tab vor der Suche, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Direkt nach dem Öffnen des
Such-Tabs zeigt dessen Beschriftung `Neuer Tab`, solange die vorbereitete Suche noch nicht
ausgeführt wurde. Mit dem Auslösen der Suche wechselt die Beschriftung zu
`Passphrase generieren` und bleibt für Suchergebnisse, Generatorseite und spätere Rückkehrschritte
unverändert. Ablauf, Persistenz, Export und Timing bleiben unverändert.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `4.0.0` auf `4.1.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.searchTab.landingLabel` | `Passphrase generieren` | `Neuer Tab` | Orientierung | kein | bildet den sichtbaren Zustand vor der noch ausstehenden Suche ab; begrenzt | keine |

## Copy- und Ablaufdelta S08 geschützter Angriffsrücklauf, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. S08 verwendet dieselbe
Desktop- und Netzwerkdarstellung wie S06, projiziert den erneuten Angriff nach den flüchtigen
S07-Passwortänderungen jedoch ausschließlich als blockierten Weg. Alle Konten und ihre Bereiche
bleiben geschützt; die frühere hypothetische Ansicht enthält keine rote Ausbreitungskante.
Die große nachfolgende Zusammenfassungskarte bleibt außerhalb dieses Deltas.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S08.replayLabels.attack` | `Auswertung abgeschlossen.` | `Das alte Campusgram-Passwort wird erneut ausprobiert.` | Orientierung | kein | benennt den sichtbaren erneuten Prüfschritt; ausdrücklich freigegeben | keine |
| `S08.replayLabels.whatIf` | nicht vorhanden | `Was wäre, wenn? Auch die anderen Konten bleiben geschützt.` | Ergebnisfeedback | kein | bildet den ausdrücklich verlangten geschützten What-if-Zustand ab; ausdrücklich freigegeben | keine |
| `S08.result` | nicht vorhanden | `Diesmal endet der Angriff bei dem alten geleakten Passwort. Es funktioniert nicht mehr bei Campusgram und kann auch nicht über Wiederverwendung auf deine anderen Konten übertragen werden.` | Ergebnisfeedback | kein | übernimmt die ausdrücklich vorgegebene S08-Einordnung wortgleich | `endet der Angriff bei dem alten geleakten Passwort` als positive Schutzwirkung |

## Copy- und Ablaufdelta S07 vollständiger Passphrasenwechsel, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Die bereits vorhandenen
Campusgram-, Search- und Passphrase-Werkstatt-Frames werden zu einem geführten S07-Ablauf
verbunden. PassWo erklärt jeweils nur den aktuellen Mechanismus oder verweist auf genau das
sichtbare Browserziel. Die im Auftrag vorgegebenen Texte werden wortgleich übernommen.
Kurze ergänzende Navigationssätze benennen ausschließlich den Wechsel zu einem tatsächlich
hervorgehobenen Konto- oder Generator-Tab, die zweite Einsetzen-Handlung und den vorhandenen
Passwortänderungsbutton.

Die fünf vorhandenen Wortfolgen und Merksätze bleiben unverändert. Ihre Reihenfolge wird pro
flüchtigem S07-Durchlauf ohne Wiederholung gemischt; insgesamt sind höchstens fünf Ausgaben
möglich. Der ausgewählte Wert liegt nur im flüchtigen Statechart-Kontext und wird nach dem
zweiten simulierten Einsetzen gelöscht. Native Zwischenablage, Browser-Speicher, Persistenz und
Export bleiben ausgeschlossen. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `3.2.0` auf
`4.0.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.methodIntro` | nicht vorhanden | `Wir ersetzen das betroffene Passwort jetzt durch eine starke Passphrase. Dabei werden mehrere zufällig ausgewählte Wörter zu einem langen Passwort kombiniert.` | Mechanismuserklärung | `Weiter` | ausdrücklich vorgegebener Methodeneinstieg | `starke Passphrase` positiv |
| `S07.guide.searchIntro` | nicht vorhanden | `Dafür schauen wir nach einem Passphrase-Generator.` | Navigation | Browser-`+` | ausdrücklich vorgegebene Überleitung zum erst danach freigegebenen sichtbaren Ziel | `Passphrase-Generator` action |
| `S07.guide.searchAction` | nicht vorhanden | `Suche nach einem Generator für eine Passphrase.` | Navigation | Search-Button | ausdrücklich vorgegebene Handlung | `Generator für eine Passphrase` action |
| `S07.guide.generatorExplanation[0..2]` | Generatorseite ohne PassWo-Erklärung | drei ausdrücklich vorgegebene Schritte zu Länge, wortweisem Ausprobieren, Zufall und vorhersehbarer Selbstauswahl | Mechanismuserklärung | jeweils `Weiter`, danach `Neu generieren` | trennt die drei Lernpunkte entlang des geführten Ablaufs; ausdrücklich freigegeben | je höchstens eine Kernaussage |
| `S07.guide.mnemonicExplanation[0..1]` | vorhandene Merksätze nicht sichtbar | zwei ausdrücklich vorgegebene Schritte zur nachträglichen Erinnerungshilfe | Mechanismuserklärung | jeweils `Weiter`, danach Generatoraktionen | stellt klar, dass der Merksatz die Zufallsauswahl nicht bestimmt | je höchstens eine Kernaussage |
| `S07.browser.generatorPage.passphrases[*].passWoMnemonic` | versioniert, aber nicht sichtbar | Merksatz nach der zugehörigen Generierung sichtbar | Mechanismuserklärung | `Kopieren` oder weitere Generierung | setzt das ausdrücklich vorgegebene Timing um; keine Wortlautänderung | keine |
| `S07.guide.copied` | nicht vorhanden | `Die Passphrase ist kopiert. Geh jetzt zurück zu Campusgram und setze sie als neues Passwort ein.` | Navigation | Campusgram-Tab | ausdrücklich vorgegebene Rückkehrhandlung | `zurück zu Campusgram` action |
| `S07.guide.pasteNew` | nicht vorhanden | `Setze deine kopierte Passphrase hier als neues Passwort ein.` | Navigation | `Einsetzen` am neuen Passwort | ausdrücklich vorgegebene Einsetzen-Handlung | `Setze ... ein` action |
| `S07.guide.pasteConfirm` | nicht vorhanden | `Setze dieselbe Passphrase jetzt zur Bestätigung noch einmal ein.` | Navigation | `Einfügen` an der Bestätigung | notwendige eindeutige Handlungszuordnung; begrenzte Ergänzung | `zur Bestätigung` action |
| `S07.guide.submitChange` | nicht vorhanden | `Beide Felder stimmen überein. Ändere jetzt das Passwort.` | Navigation | `Passwort ändern` | notwendige eindeutige Handlungszuordnung; begrenzte Ergänzung | `Ändere jetzt das Passwort` action |
| `S07.guide.campusgramSuccess` | nicht vorhanden | ausdrücklich vorgegebener Campusgram-Erfolgstext | Ergebnisfeedback | `Weiter` | übernimmt Wirkung und Grenze des fiktiven Passwortwechsels | `funktioniert jetzt nicht mehr für Campusgram` positiv |
| `S07.guide.allUnique` | nicht vorhanden | ausdrücklich vorgegebener Fall-A-Text | Ergebnisfeedback | `Weiter` | dynamische Verzweigung auf den S06-Beziehungszustand | `eigenes Passwort` positiv |
| `S07.guide.remainingRisk` | nicht vorhanden | ausdrücklich vorgegebener Fall-B-Text mit dynamischen Kontonamen | Ergebnisfeedback | `Weiter` | benennt nur tatsächlich verbleibende S06-Beziehungen | Kontonamen als Identitätsmarkierung |
| `S07.guide.remainingPlan` | nicht vorhanden | ausdrücklich vorgegebener Plan für eigene Passphrasen | Navigation | `Weiter`, danach hervorgehobener Konto-Tab | erklärt den folgenden Kontenzyklus | `eigene Passphrase` positiv |
| `S07.guide.openAccount` | nicht vorhanden | `Wechsle jetzt zum Tab [Konto] und öffne dort die Passwortänderung.` | Navigation | hervorgehobener Konto-Tab, danach `Passwort ändern` | notwendige eindeutige Handlungszuordnung | Kontoname als Identitätsmarkierung |
| `S07.guide.openPasswordChange` | nicht vorhanden | `Öffne jetzt die Passwortänderung.` | Navigation | `Passwort ändern` | benennt das nach dem Tabwechsel sichtbare Ziel | `Passwortänderung` action |
| `S07.guide.returnToGenerator` | nicht vorhanden | `Wechsle zurück zum geöffneten Tab „Passphrase generieren“ und erzeuge eine neue Passphrase für dieses Konto.` | Navigation | Generator-Tab | notwendige eindeutige Handlungszuordnung | `Passphrase generieren` action |
| `S07.guide.generateForAccount` | nicht vorhanden | `Erzeuge jetzt eine neue Passphrase für [Konto].` | Navigation | `Neu generieren` | benennt das nach dem Tabwechsel sichtbare Ziel | Kontoname als Identitätsmarkierung |
| `S07.guide.returnToAccount` | nicht vorhanden | `Die neue Passphrase ist kopiert. Geh zurück zu [Konto] und setze sie dort ein.` | Navigation | Konto-Tab | notwendige eindeutige Handlungszuordnung | Kontoname als Identitätsmarkierung |
| `S07.guide.allResolved` | nicht vorhanden | `Jetzt hat jedes Konto ein eigenes starkes Passwort. Schauen wir uns noch einmal an, was beim gleichen Angriff passiert.` | Navigation | `Angriff erneut ansehen` | übernimmt die ausdrücklich vorgegebene S08-Überleitung | `eigenes starkes Passwort` positiv |
| `S07.browser.generatorPage.paste` | `Einfügen` | `Einsetzen` | Navigation | neues beziehungsweise bestätigtes Passwortfeld | gleicht die simulierte Handlung an den ausdrücklich vorgegebenen sichtbaren Aktionsnamen an | `Einsetzen` action |

## Ablaufdelta S06-QA-Abschluss zu S07, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Die vier direkten
S06-QA-Szenarien verbinden den letzten vorhandenen PassWo-Button nun mit der bereits bestehenden
Fortschrittskarte `Passphrase erstellen` und öffnen nach deren Ablauf S07. Zuvor fehlte diesen
isolierten Fixture-Einstiegen der Abschluss-Callback, sodass der Button keine Folgeaktion hatte.
Der Study-Runtime-Statechart, Teilnehmertexte, Content-Version, Persistenz, Export und
Studien-Timing bleiben unverändert.

## Animationsdelta S06 sichtbare Pausen und reaktionsnahe Ausgangslinien, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Sichtbare Befallsanimationen
behalten ihre 1,35 Sekunden lange Laufzeit. Ein lokaler Check ohne Befallsergebnis wartet dagegen
nicht mehr dieselbe unsichtbare Zeit ab. Automatische Netzwerkprüfungen entfernen ihre bisherigen
verdeckten Vor- und Nachpausen; ihre sichtbare Angriffslinie läuft weiterhin vollständig durch.
Rote beziehungsweise schützende Ausgangslinien beginnen 120 statt 400 Millisekunden nach der
Ergebnisauflösung, damit sie dem sichtbaren Kontostatus ohne irritierenden Nachlauf folgen. Die
Angriffslinie startet maskiert und behält nach dem Zeichnen ihren sichtbaren Endzustand, bis der
aufgelöste Pfad übernimmt; dadurch entsteht beim Rendererwechsel kein kurzes Ein-/Ausblenden.
Der letzte sichtbare S06-Weiter-Schritt meldet den Segmentabschluss zusätzlich direkt und
einmalig geschützt an die äußere Statechart, statt ausschließlich vom nachgelagerten generischen
Completion-Callback abzuhängen.

Teilnehmertexte, Content-Version, Persistenz, Export und Studien-Timing ändern sich nicht.

## Ablaufdelta S06 vollständige Ergebnisanimationen und Campus-E-Mail-Übergang, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Nach dem letzten von Master
Campus ausgehenden Vergleich führt der gemeinsame visuelle Abschlussweg wieder in den bereits
vorhandenen PassWo-Sprechschritt zum Perspektivwechsel auf Campus E-Mail. Dessen vorhandener
`Weiter`-Button löst anschließend den tatsächlichen Wechsel des Datenlecks aus. Dieser geführte
Übergang hängt nicht vom Ende einer CSS-Statuskaskade ab: Das aufgelöste Vergleichsnetz bleibt
sichtbar, während PassWo den Perspektivwechsel anbietet.

Bei den Prüfpfaden ohne Passwortvergleichskarte wird nur die Karte ausgelassen. Die zugehörige
Ergebnisanimation bleibt verbindlich: Ein blockierter Weg zeigt den entstehenden grünen Schild,
ein erfolgreicher Weg lässt den betroffenen Zielzweig vollständig rot werden, bevor der nächste
Prüfpfad beginnt. Angriffslinie und Ergebnisauflösung liegen dafür gemeinsam in genau einer
deterministischen Statechart-Sequenz pro Verbindung. Derselbe Ablauf gilt für Master Campus und
Campus E-Mail und führt ohne kontoabhängige Sonderphase über alle weiteren Prüfpfade, die
tatsächliche Campusgram-Ausgangslage und den S07-Übergang. In S06 starten die roten
beziehungsweise schützenden Linien 400 Millisekunden nach der Ergebnisauflösung; das Timing von
S05 bleibt unverändert.

Teilnehmertexte, Content-Version, Persistenz, Export und Studien-Timing ändern sich nicht.

## Darstellungs- und Ablaufdelta S06 stabiler Campus-E-Mail-Befall und Schlusszustand, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026 samt bereitgestelltem Screenshot.
Wenn die lokale Campus-E-Mail-Prüfung keinen vollständigen frühen Kandidaten erkennt, setzt der
anschließende hypothetische Befall Campus E-Mail nun wie bei Master Campus sichtbar auf betroffen:
Der Angreifer bewegt sich in den Hauptknoten, und der gesamte Campus-E-Mail-Zweig wird rot, bevor
die beiden ausgehenden Wege geprüft werden. Bei einem tatsächlichen Fund bleibt derselbe bereits
vorhandene Befallszustand bestehen.

Der Sprechschritt `Als Nächstes erstellen wir eine neue Passphrase.` verändert die unmittelbar
zuvor dargestellte Schlussansicht nicht mehr. Angreifer, Kontostatus, Unterknoten,
Vergleichsergebnisse und Angriffspfade bleiben bis zum tatsächlichen Abschluss von S06
unverändert. Die Schilde der vertikalen Master-Campus-/Campus-E-Mail-Wege erhalten
richtungsabhängige Positionen: vor Campus E-Mail weiter oben, vor Master Campus weiter unten.

Teilnehmertexte, Persistenz, Export und Studien-Timing ändern sich nicht.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.13.0` auf `2.14.0` erhöht.

## Copy- und Ablaufdelta S06 Campus-E-Mail-Befall und bewusste Rückkehr, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Bei einer erfolgreichen lokalen
Prüfung von Campus E-Mail bewegt sich der Angreifer nun während der bestehenden 1,35 Sekunden
langen Befallen-Animation von außen in den Kontoknoten. Dieselbe bereits vorgesehene Bewegung
gilt konsistent für Master Campus. Bei einem blockierten Ergebnis bleibt der Angreifer außen.

Nach dem letzten von Campus E-Mail ausgehenden Prüfpfad bleibt die dargestellte Perspektive
zunächst bestehen. Ein neuer PassWo-Schritt kündigt die Rückkehr zur tatsächlichen
Campusgram-Ausgangslage an; erst `Weiter` stellt diese Schlussansicht wieder her. Alle fiktiven
Werte, Analysen und Ergebnisse bleiben flüchtig. Persistenz, Export und Studien-Timing ändern
sich nicht. `S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.12.0` auf `2.13.0` erhöht.

Die wiederhergestellte Campusgram-Ausgangslage übernimmt auch das ursprüngliche lokale
Prüfergebnis: Wurde das Campusgram-Passwort nicht gefunden, bleiben Konto und Angreifer im
geschützten Zustand, statt den roten Befall aus der hypothetischen Betrachtung zu übernehmen.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.transition.return-to-campusgram` | nicht vorhanden; die Ansicht wechselte unmittelbar | `Damit sind alle drei Ausgangslagen betrachtet. Als Nächstes kehren wir zur tatsächlichen Ausgangslage mit dem Datenleck bei Campusgram zurück.` | Orientierung | `Weiter` | macht den tatsächlichen Ansichtswechsel vor seiner Ausführung erwartbar; ausdrücklich freigegebene Ablaufänderung | keine |
| `S06.narrations.s06.summary.actual-source-blocked` | nicht vorhanden; stattdessen wurde fälschlich ein tatsächlicher Campusgram-Befall zusammengefasst | `In der tatsächlichen Ausgangslage wurde das Campusgram-Passwort in dieser begrenzten Prüfung nicht gefunden. Der Angreifer bleibt deshalb außerhalb des Kontos.` | Ergebnisfeedback | `Weiter` | gleicht Text und Schlussansicht mit dem ursprünglichen lokalen Prüfergebnis ab; fachliche Korrektur, begrenzt | keine |

## Copy- und Ablaufdelta S06 direkte Rückwege und Campus-E-Mail-Ausbreitung, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Die Schlussansicht kehrt immer
zur tatsächlichen Campusgram-Ausgangslage und ihren Folgen zurück; sie trägt weder den
`Was wäre, wenn?`-Hinweis noch einen hypothetischen Abschlusstext. Beim Perspektivwechsel zu
Campus E-Mail werden nun auch die beiden gerichteten Beziehungen zu Master Campus und
Campusgram geprüft. Diese beiden Prüfpfade sowie der bereits bekannte Rückweg von Master Campus
zu Campusgram laufen direkt im Netzwerk: Die Angriffslinie wird gezeichnet und der Zielzweig
anschließend abhängig von `Wiederverwendet`, `Ähnlich` oder `Keine Übereinstimmung` unmittelbar
aufgelöst. Die Passwortvergleichskarte wird für diese Rückwege nicht erneut geöffnet.

Alle fiktiven Werte, Analysen und Ergebnisse bleiben flüchtig. Persistenz, Export und
Studien-Timing ändern sich nicht. `S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.11.0` auf
`2.12.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.transition.campus-email` | `Zum Schluss verschieben wir das Datenleck zu Campus E-Mail und prüfen dieses Passwort für sich.` | `Zum Schluss verschieben wir das Datenleck zu Campus E-Mail und prüfen von dort beide anderen Konten.` | Orientierung | `Weiter` | stimmt die Orientierung mit den zwei neu sichtbaren ausgehenden Prüfpfaden ab; ausdrücklich freigegebene Ablaufänderung | keine |
| `S06.narrations.s06.local-check.campus-email-found` | `Beim Campus-E-Mail-Passwort wurde ein vollständiger früher Kandidat erkannt. Unabhängig von den Verbindungen zu anderen Konten lohnt es sich deshalb, auch dieses Passwort für sich stark zu wählen.` | `Beim Campus-E-Mail-Passwort wurde ein vollständiger früher Kandidat erkannt. Von diesem Konto aus werden nun die beiden anderen Passwörter direkt im Netzwerk geprüft.` | Ergebnisfeedback | `Angriff starten` | kündigt exakt die anschließend automatisch dargestellten Netzwerkprüfungen an; ausdrücklich freigegebene Bedeutungsänderung | keine |
| `S06.narrations.s06.local-check.campus-email-blocked` | `Beim Campus-E-Mail-Passwort wurde in dieser begrenzten Prüfung kein vollständiger früher Kandidat erkannt. Das ist ein günstiges Ergebnis dieser Prüfung, aber keine allgemeine Sicherheitsgarantie.` | `Beim Campus-E-Mail-Passwort wurde in dieser begrenzten Prüfung kein vollständiger früher Kandidat erkannt. Die möglichen weiteren Wege betrachten wir deshalb als „Was wäre, wenn?“.` | Ergebnisfeedback | `Angriff starten` | grenzt die beiden folgenden Rückwege bei fehlender Vollerkennung als hypothetisch ab; ausdrücklich freigegebene Bedeutungsänderung | keine |

Die Überschriften der beiden Campus-E-Mail-Ergebnisse wechseln von `Lokaler Einzelcheck von
Campus E-Mail` zu `Perspektivwechsel zu Campus E-Mail`, weil der Schritt nun nicht mehr lokal
endet, sondern in zwei kontoübergreifende Prüfpfade überleitet. Textrolle, Interaktionsziel und
Hervorhebung entsprechen den jeweiligen Tabellenzeilen.

## Copy- und Ablaufdelta S06 Master Campus prüft beide anderen Konten, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Beim Perspektivwechsel zu
Master Campus wird das fiktive Passwort nun nacheinander bei Campusgram und Campus E-Mail
geprüft. Damit ist die frühere Festlegung, in dieser Perspektive keinen Rückvergleich zu
Campusgram zu zeigen, ersetzt. Die beiden Vergleiche verwenden dieselben begrenzten
Beziehungsarten und dieselbe Vorschau wie die bestehenden S06-Vergleiche. Alle Werte und
Ergebnisse bleiben flüchtig; Persistenz, Export und Studien-Timing ändern sich nicht.

Bereits betroffene Campusgram-Unterknoten und ihre internen Verbindungen behalten während der
folgenden Angriffe ihren roten Status. Der neue Vergleich zu Campusgram projiziert seine
Vorschau links vom rechts liegenden Zielknoten. `S06_CONSEQUENCE_CONTENT_VERSION` wird von
`2.10.0` auf `2.11.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.perspective.master-campus-found` | `Bei Master Campus wurde das vollständige Passwort in dieser begrenzten Prüfung als früher Kandidat erkannt. Von diesem Konto aus kann es nun bei Campus E-Mail ausprobiert werden.` | `Bei Master Campus wurde das vollständige Passwort in dieser begrenzten Prüfung als früher Kandidat erkannt. Von diesem Konto aus kann es nun bei Campusgram und Campus E-Mail ausprobiert werden.` | Mechanismuserklärung | `Angriff starten` | stimmt die Orientierung mit den zwei tatsächlich folgenden Vergleichen ab; begrenzt | keine |
| `S06.narrations.s06.perspective.master-campus-blocked` | `Bei Master Campus wurde in dieser begrenzten Prüfung kein vollständiger früher Kandidat erkannt. Den möglichen weiteren Weg betrachten wir deshalb als „Was wäre, wenn?“.` | `Bei Master Campus wurde in dieser begrenzten Prüfung kein vollständiger früher Kandidat erkannt. Die möglichen weiteren Wege betrachten wir deshalb als „Was wäre, wenn?“.` | Orientierung | `Weiter` | bildet die zwei hypothetisch folgenden Vergleiche grammatisch korrekt ab; keine neue Sicherheitsbehauptung | keine |
| `S06.narrations.s06.incident.master-campus-hypothetical` | `Angenommen, das Master-Campus-Passwort wäre bekannt geworden. Dann würde es oder eine ähnliche Variante bei Campus E-Mail ausprobiert.` | `Angenommen, das Master-Campus-Passwort wäre bekannt geworden. Dann würde es oder eine ähnliche Variante bei Campusgram und Campus E-Mail ausprobiert.` | Mechanismuserklärung | `Angriff starten` | stimmt die hypothetische Orientierung mit beiden sichtbaren Vergleichen ab; begrenzt | keine |

## Copy-Delta S07 Bestätigung des Campusgram-Passwortwechsels, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Nach dem erfolgreichen lokalen
Passwortwechsel bestätigt die Campusgram-Ansicht nun die Verwendung der zuvor erzeugten
Passphrase. Die Änderung gilt ausschließlich für S07; der in S04 verwendete Hinweis auf die
Simulation und das Verwerfen der dortigen Eingaben bleibt unverändert. Ablauf, flüchtiger
React-Zustand, Persistenz und Export ändern sich nicht.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `3.1.0` auf `3.2.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.campusgramPasswordChangeCompleted.title` | `Passwortwechsel simuliert` | `Passwort geändert` | Ergebnisfeedback | kein | übernimmt den ausdrücklich verlangten Ergebnisstatus für den S07-Passphrasenablauf; ausdrücklich freigegeben | keine |
| `S07.browser.campusgramPasswordChangeCompleted.body` | `Die Eingaben wurden verworfen und nicht gespeichert.` | `Die neue Passphrase wird jetzt für Campusgram verwendet.` | Ergebnisfeedback | kein | benennt die sichtbare Folge der zuvor ausgeführten S07-Handlung; ausdrücklich freigegeben | keine |

## Darstellungsdelta S07 Suchstart-Artwork, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Die freie Suchstartseite erhält
statt des einfachen Farbverlaufs ein ruhiges, lokal eingebundenes Artwork aus angeschnittenen
Lupenkreisen, Papierflächen und vierzackigen Sternformen aus der bestehenden Suchmarke. Die
Bildmotive bleiben auf die äußeren Ecken konzentriert, damit Wortmarke und Suchfeld in der Mitte
klar lesbar bleiben. Das dekorative `×` im vorausgefüllten Suchfeld wird kleiner und deutlich
zurückhaltender dargestellt. Teilnehmertexte, Ablauf, Persistenz, Export und Content-Version
bleiben unverändert.

| Element | Vorher | Nachher | Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.searchPage.landingBackground` | einfacher heller Farbverlauf | lokales Lupen- und Stern-Artwork | Orientierung | kein | stärkt die eigenständige Suchmarke ohne die zentrale Handlung zu überlagern; keine Bedeutungsänderung | Randmotive in Teal, Mint und Gold |
| `S07.browser.searchPage.clearQuery` | großes, kontrastreiches dekoratives `×` | kleineres `×` mit reduzierter Deckkraft | Orientierung | kein | ordnet das nicht bedienbare Zeichen der eigentlichen Suchaktion visuell unter; keine Bedeutungsänderung | keine |

## Interaktionsdelta S07 neuer Such-Tab und Ladeablauf, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. S07 zeigt zu Beginn nur die drei
bereits geöffneten Konto-Tabs. Ein hervorgehobener Plus-Button im Browser-Chrome ist das einzige
Ziel zum Öffnen des neuen Such-Tabs. Dieser startet mit einer freien, fiktiven Suchseite und dem
bereits eingetragenen Begriff `passphrase generieren`. Erst das Suchsymbol rechts im Suchfeld
startet die Suche. Danach erscheint unmittelbar das bestehende Suchergebnis-Interface, während
die Treffer für 900 Millisekunden als Ladezustand dargestellt und anschließend eingeblendet
werden. Es werden keine externen Inhalte geladen und keine Eingaben gespeichert.

Die vorhandene Suchanfrage und alle Treffertexte bleiben unverändert. Neu hinzu kommen nur die
barrierefreien Seiten-, Handlungs- und Statusbezeichnungen `Fiktive Suchseite für Passphrase
generieren`, `Nach passphrase generieren suchen` und `Suchergebnisse werden geladen`. Persistenz,
Export und Studien-Timing bleiben unverändert.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `3.0.0` auf `3.1.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.newTab` | Plus-Symbol nur dekorativ | `Neuen Tab öffnen` als zugängliche Bezeichnung | Navigation | Plus-Button im Tab-Chrome | ordnet die ausdrücklich verlangte Öffnung dem sichtbaren Browserziel zu; ausdrücklich freigegeben | Akzentrahmen und Leuchten am Plus-Button |
| `S07.browser.searchPage.landingAriaLabel` | nicht vorhanden | `Fiktive Suchseite für Passphrase generieren` | Orientierung | kein | grenzt die neue freie Suchseite barrierefrei von der späteren Ergebnisseite ab; begrenzt | keine |
| `S07.browser.searchPage.submitLabel` | Suchsymbol nur dekorativ | `Nach passphrase generieren suchen` | Navigation | Suchsymbol rechts im Suchfeld | macht das ausdrücklich verlangte Suchziel tastaturbedienbar und eindeutig; ausdrücklich freigegeben | Akzentfläche und Suchsymbol |
| `S07.browser.searchPage.resultsLoadingLabel` | nicht vorhanden | `Suchergebnisse werden geladen` | Ergebnisfeedback | kein | benennt den sichtbaren, kurzen Ladezustand für assistive Technik; begrenzt | einzelner Ladeindikator, bei Reduced Motion statisch |

## Interaktionsdelta S07 simuliertes Kopieren und Einfügen, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. `Kopieren` legt die aktuell
erzeugte fiktive Passphrase ausschließlich in einem flüchtigen React-State der S07-Szene ab und
zeigt weiterhin kurz `Kopiert`. Nach dem Wechsel zum lokalen Campusgram-Passwortwechsel bietet
`Einfügen` denselben Wert in den Feldern für das neue und das bestätigte Passwort an. Sobald
beide Felder den Wert übernommen haben, wird der simulierte Clipboard-State gelöscht; beim
Szenenende wird er durch das Unmounten ebenfalls verworfen.

Die bisherige unmittelbare S07-Beendigung durch `Kopieren` wird durch die ausdrücklich verlangte
Einfügehandlung ersetzt. Nach dem erfolgreichen Passwortwechsel bleibt die vorhandene
Bestätigungsansicht sichtbar; erst deren bestehende Rückkehrhandlung beendet S07. Die übrige
Dramaturgie bleibt unverändert.

Die S07-Szene blockiert native Copy-, Cut- und Paste-Ereignisse einschließlich der zugehörigen
Cmd-/Ctrl-Tastenkürzel. Es gibt keinen Zugriff auf die System-Zwischenablage, Browser-Speicher,
Persistenz, Export oder Server. Abgesehen vom ausdrücklich ergänzten Buttontext `Einfügen`
bleiben vorhandene Teilnehmertexte, Sicherheitsbotschaften und Hervorhebungen unverändert.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `2.9.0` auf `3.0.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.generatorPage.copy` | `Kopieren` | unverändert | Navigation | simulierte lokale Zwischenablage | Button führt die bereits bezeichnete Handlung nun innerhalb der Forschungsgrenze tatsächlich aus; begrenzt | keine |
| `S07.browser.generatorPage.copied` | `Kopiert` | unverändert | Ergebnisfeedback | kein | Status bestätigt den flüchtigen internen Kopiervorgang; begrenzt | grüner Toast |
| `S07.browser.generatorPage.paste` | nicht vorhanden | `Einfügen` | Navigation | neues beziehungsweise bestätigtes Passwortfeld | ausdrücklich verlangte, realistische interne Einfügehandlung ohne System-Zwischenablage; ausdrücklich freigegeben | keine |

## Darstellungsdelta S07 Datenleck-Fokus, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Beim Einstieg in den
Campusgram-Tab von S07 wird die umgebende Website abgedunkelt. Der bereits sichtbare
Datenleckhinweis bleibt vollständig hell und erhält einen pulsierenden Leuchtrahmen, damit das
Interaktionsziel `Passwort jetzt ändern` vor der freien Tab-Navigation eindeutig erkennbar ist.
Nach dem Öffnen des Passwortwechsels endet die Hervorhebung. Bei `prefers-reduced-motion` bleibt
der Leuchtrahmen statisch.

Teilnehmertexte, Interaktionsablauf, Persistenz und Export bleiben unverändert.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `2.8.0` auf `2.9.0` erhöht.

| Element | Vorher | Nachher | Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.campusgram.dashboardNotice.focus` | Datenleckhinweis ohne Fokusführung im normalen Dashboard | abgedunkelte Umgebung und leuchtender Datenleckhinweis | Navigation | `Passwort jetzt ändern` | macht die vom Nutzer verlangte Navigation durch Kontrast, Kontur und Leuchten sichtbar; keine textliche Bedeutungsänderung | gelber Leuchtrahmen, bei Reduced Motion statisch |

## Interaktionsdelta S07 Campusgram-Passwortwechsel, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Der in S07 bereits sichtbare
Campusgram-Datenleckhinweis zeigt nun zusätzlich die vorhandene Handlung `Passwort jetzt ändern`.
Die Handlung öffnet denselben lokalen, flüchtigen Passwortwechsel wie in S04. Alle Eingaben
bleiben im lokalen React-Zustand, werden beim Abschluss verworfen und weder persistiert noch
exportiert. Die Passphrasen-Suche und der S07-Abschluss bleiben unverändert.

Die Teilnehmertexte werden unverändert aus S04 wiederverwendet; geändert wird ausschließlich,
dass Beratung, Handlung und Passwortwechsel in S07 nicht mehr ausgeblendet sind.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `2.7.0` auf `2.8.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.campusgram.dashboardNotice.advisory` | in S07 ausgeblendet | `Um dein Konto zu schützen, solltest du das fiktive Campusgram-Passwort jetzt ersetzen.` | Safety Boundary | kein | übernimmt den bereits freigegebenen S04-Hinweis in den ausdrücklich verlangten S07-Hintergrund; begrenzt | keine |
| `S07.browser.campusgram.dashboardNotice.passwordChangeLabel` | in S07 ausgeblendet | `Passwort jetzt ändern` | Navigation | öffnet den lokalen Campusgram-Passwortwechsel | macht die ausdrücklich verlangte Handlung im sichtbaren Datenleckhinweis bedienbar; ausdrücklich freigegeben | Schloss-Symbol und vorhandene Aktionsfläche |
| `S07.browser.campusgram.passwordChange` | in S07 nicht erreichbar | unveränderter S04-Passwortwechsel mit ausschließlich fiktiven, flüchtigen Eingaben | Safety Boundary / Navigation | Formular und Rückkehr zu Campusgram | stellt denselben begrenzten Übungsablauf in S07 bereit; ausdrücklich freigegeben | keine |

## Inhalts- und Interaktionsdelta S07 geordnete Passphrasen, 14. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 14. August 2026. Die bisherige Auswahl aus 23
Wortfolgen wird durch fünf vorgegebene Passphrasen in der freigegebenen Reihenfolge ersetzt.
Jede Passphrase bleibt direkt mit dem ebenfalls freigegebenen Merksatz für eine spätere
PassWo-Erklärung verknüpft. Diese statischen Merksätze werden weder angezeigt noch als
Teilnehmer- oder Trainingsentscheidung persistiert oder exportiert.

Die Generatorausgabe startet leer. `Neu generieren` leert die Ausgabe, zeigt für 500 Millisekunden
einen Ladezustand und gibt danach die nächste Passphrase aus. Nach der fünften Passphrase folgt
wieder die erste. `Kopieren` bleibt gesperrt, solange keine Passphrase ausgegeben wurde.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `2.6.0` auf `2.7.0` erhöht.

| Segment und Text-ID | Aktueller Inhalt | Geplanter Inhalt | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.generatorPage.passphrases` | 23 Wortfolgen ohne Merksatz | fünf ausdrücklich vorgegebene Wortfolgen mit jeweils zugeordnetem PassWo-Merksatz | Orientierung | `Neu generieren` | übernimmt Reihenfolge und Wortlaut aus dem Nutzerauftrag; ausdrücklich freigegeben | keine |
| `S07.browser.generatorPage.initialOutput` | erste Wortfolge sofort sichtbar | leere Ausgabe | Ergebnisfeedback | `Neu generieren` | die Website soll ohne vorausgewählten Eintrag starten; ausdrücklich freigegeben | keine |
| `S07.browser.generatorPage.generationDelay` | sofortiger Wechsel | leere Ausgabe mit 500 Millisekunden Ladezustand vor jeder Wortfolge | Ergebnisfeedback | `Neu generieren` | bildet die ausdrücklich gewünschte Generatorverzögerung ab; begrenzt | neutraler Ladeindikator ohne Text |

Die fünf Merksätze haben die primäre Rolle `Mechanismuserklärung`, ihr künftiges
Interaktionsziel ist `kein`, und sie erhalten keine Hervorhebung. Ihr Wortlaut wird aus dem
Nutzerauftrag unverändert übernommen; eine sichtbare PassWo-Einbindung ist nicht Teil dieses
Auftrags.

## Inhaltsdelta S07 weitere Passphrasen-Wortfolgen, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Die bestehende lokale Auswahl
aus drei fiktiven Wortfolgen wird um 20 Folgen erweitert. Jede neue Folge besteht weiterhin aus
sechs großgeschriebenen Wörtern. Die Wortauswahl verwendet bewusst seltenere Begriffe ohne
erkennbaren semantischen Zusammenhang innerhalb einer Folge. Bedienung, sichtbare Begleittexte,
Persistenz, Export und Timing bleiben unverändert. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird
von `2.5.0` auf `2.6.0` erhöht.

| Segment und Text-ID | Aktueller Inhalt | Geplanter Inhalt | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.generatorPage.wordSets` | drei lokale Folgen mit je sechs Wörtern | 23 lokale Folgen mit je sechs Wörtern | Orientierung | `Neu generieren` | erweitert die vom Generator angebotene Variation um ausdrücklich verlangte seltenere, unverbundene Begriffe; keine Änderung der Lernbotschaft | keine |

## Copy- und Darstellungsdelta S07 reduzierte Passphrasen-Werkstatt, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Das Logo des hervorgehobenen
Search-Treffers entspricht nun der Wortmarke der geöffneten Passphrase-Werkstatt. Die Status- und
Vertrauenstexte `Direkt im Browser`, `Bereit` und `Fiktives Beispiel` entfallen. Der Seitentitel
`Passphrase-Generator` steht außerhalb und oberhalb der Generatorfläche. Die bisherige
Handlungsanweisung wird durch eine kurze, begrenzte Mechanismuserklärung ersetzt.

Die drei lokalen Wortfolgen bestehen nun aus jeweils sechs großgeschriebenen Wörtern.
`Neu generieren` steht direkt über dem Ausgabefeld, `Kopieren` darunter. Der Kopiervorgang bleibt
eine lokale Simulation ohne Zugriff auf die System-Zwischenablage, beendet weiterhin S07 und
zeigt bis zum Szenenwechsel den Toast `Kopiert`. Die bisherige Statuszeile unter der Generatorbox
entfällt. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `2.4.0` auf `2.5.0` erhöht.

| Segment und Text-ID | Vorher | Nachher | Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.searchPage.primaryResult.logo` | grüner Buchstabe `P` | Wortmarke der Passphrase-Werkstatt | Orientierung | erster Ergebnistreffer | stellt die visuelle Identität zwischen Treffer und Zielseite her; keine Bedeutungsänderung | eigenständige Teal-Korall-Marke |
| `S07.browser.searchPage.primaryResult.description` | nennt anpassbare Wortanzahl und Trennzeichen | nennt sechs Wörter und ausschließlich die Wahl des Trennzeichens | Orientierung | erster Ergebnistreffer | stimmt die Vorschau auf die tatsächlich angebotenen Generatoroptionen ab; begrenzt | keine |
| `S07.browser.generatorPage.intro` | Handlungsanweisung zur Wortfolge und Lesbarkeit | `Eine lange Passphrase aus zufällig gewählten Wörtern ist schwerer zu erraten und trotzdem gut merkbar.` | Mechanismuserklärung | kein | ersetzt redundante Bedienanweisung durch kurze, begrenzte Sicherheitsinformation; begrenzt | keine |
| `S07.browser.generatorPage.wordCount` | `5 Wörter` | `6 Wörter` | Orientierung | kein | bildet die ausdrücklich verlangte Generatorlänge ab; begrenzt | keine |
| `S07.browser.generatorPage.outputLabel` | `Fiktives Beispiel` | entfällt sichtbar; zugänglicher Name bleibt erhalten | Safety Boundary | kein | reduziert sichtbare Ablenkung bei erhaltener Zugänglichkeit; begrenzt | keine |
| `S07.browser.generatorPage.finish` | `Auswählen & weiter` mit Statuszeile | `Kopieren` mit Toast `Kopiert` | Navigation / Ergebnisfeedback | beendet S07 nach simulierter Kopierhandlung | bildet das gewünschte Website-Muster ab, ohne Passwortdaten in die System-Zwischenablage zu schreiben; begrenzt | Teal-Primärfläche und grüner Toast |

## Copy- und Interaktionsdelta S07 Passphrasen-Werkstatt, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Der erste Pflichttreffer der
bereits vorhandenen fiktiven Search-Seite beendet S07 nicht mehr unmittelbar, sondern öffnet im
selben Browser-Tab die neue fiktive `Passphrase-Werkstatt`. Deren Seitenstruktur orientiert sich
an der bereitgestellten visuellen Referenz, übernimmt aber PassWo-nahe Teal-, Korall-, Flächen-,
Radius- und Typografieentscheidungen sowie eine eigenständige Wortmarke. Die Seite bleibt in
einem Viewport und enthält bewusst weder den Referenzabschnitt `Was ist eine Passphrase?` noch
weitere Ratgeberflächen.

Der Generator zeigt fünf fest vorgegebene Wörter und erlaubt ausschließlich die Wahl zwischen
Bindestrich, Punkt, Unterstrich und Leerzeichen. Kapitalisierung, Großbuchstaben,
Kleinbuchstaben, Zahlen und weitere Optionen entfallen. `Neu generieren` wechselt lokal und
deterministisch zwischen drei fiktiven Wortfolgen. `Auswählen & weiter` beendet S07, ohne die
Wortfolge oder Auswahl zu persistieren, zu exportieren oder in die Zwischenablage zu schreiben.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `2.3.0` auf `2.4.0` erhöht. Timingfelder,
Persistenzvertrag und nachfolgende Segmente bleiben unverändert.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.generatorPage.title` | nicht vorhanden | `Deine neue Passphrase` | Orientierung | kein | benennt die neue Ergebniswebsite knapp; ausdrücklich freigegeben | keine |
| `S07.browser.generatorPage.intro` | nicht vorhanden | `Erzeuge eine neue Wortfolge und wähle das Trennzeichen, das für dich am besten lesbar ist.` | Navigation | Generator und Trennzeichen | bildet ausschließlich die sichtbare Bedienung ab; ausdrücklich freigegeben | keine |
| `S07.browser.generatorPage.separatorLegend` | nicht vorhanden | `Trennzeichen wählen` | Navigation | vier sichtbare Trennzeichen | ersetzt die nicht gewünschten Zeichen- und Zahlenoptionen durch das einzige freigegebene Anpassungsziel; ausdrücklich freigegeben | aktive Auswahl in Teal plus Kontur |
| `S07.browser.generatorPage.outputLabel` | nicht vorhanden | `Fiktives Beispiel` | Safety Boundary | kein | grenzt die lokale Wortfolge von einem echten Passwort ab; begrenzt | keine |
| `S07.browser.generatorPage.generate` | nicht vorhanden | `Neu generieren` | Navigation | wechselt nur die lokale Wortfolge | benennt die tatsächliche wiederholbare Generatorhandlung; ausdrücklich freigegeben | keine |
| `S07.browser.generatorPage.finish` | erster Ergebnisklick beendet S07 | `Auswählen & weiter` | Navigation | beendet S07 ohne Übergabe der Wortfolge | verschiebt den Abschluss auf die sichtbare Generatorhandlung und vermeidet einen vorgetäuschten Zwischenablagezugriff; begrenzt | Teal-Primärfläche |
| `S07.browser.generatorPage.boundary` | nicht vorhanden | `Die angezeigte Wortfolge bleibt nur in dieser Übung.` | Safety Boundary | kein | macht die Datenschutzgrenze an der einzigen stabilen Stelle sichtbar; begrenzt | grüner Statuspunkt plus Text |

## Copy- und Darstellungsdelta S07 Ergebnisabschluss, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Die stark an eine bekannte
Suchmaschine erinnernde Paginierung aus wiederholtem `Search`-Schriftzug, zehn Seitenzahlen und
`Weiter ›` entfällt vollständig. An ihre Stelle tritt eine ruhige PassWo-nahe Orientierungskarte,
die den vorhandenen Ergebnismix als `Werkzeuge`, `Anleitungen` und `Wissen` zusammenfasst. Die
Karte ist bewusst kein Bedienelement und täuscht daher weder zusätzliche Ergebnisse noch eine
nicht implementierte Navigation vor.

`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `2.2.0` auf `2.3.0` erhöht. Persistenz, Export,
Timing und der erste verpflichtende Ergebnisklick bleiben unverändert.

| Segment und Text-ID | Vorher | Nachher | Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.searchPage.pagination` | `Search`, Seitenzahlen `1` bis `10`, `Weiter ›` | entfällt | Orientierung | kein | entfernt das letzte stark anbietercodierte Element und eine vorgetäuschte Navigation; begrenzt | keine |
| `S07.browser.searchPage.resultCollectionSummary.title` | nicht vorhanden | `Mehr Wege zum Thema` | Orientierung | kein | gibt dem langen Seitenende einen eigenständigen, unterstützenden Abschluss; begrenzt | Teal-Iconfläche |
| `S07.browser.searchPage.resultCollectionSummary.description` | nicht vorhanden | `Diese Auswahl verbindet praktische Werkzeuge, verständliche Anleitungen und Hintergrundwissen.` | Orientierung | kein | fasst nur den sichtbaren Ergebnismix zusammen, ohne Wirkungs- oder Sicherheitsbehauptung; begrenzt | keine |
| `S07.browser.searchPage.resultCollectionSummary.topics` | nicht vorhanden | `Werkzeuge`, `Anleitungen`, `Wissen` | Orientierung | kein | übernimmt die bereits eingeführten Search-Kategorien als kompakte Abschlussstruktur; begrenzt | drei neutrale Teal-Flächen |

## Darstellungsdelta S07 eigenständige Search-Gestaltung, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Die verständliche Metapher aus
Suchfeld, URL, Titel, Beschreibung und langer Ergebnisliste bleibt erhalten, wird aber von
Google-spezifischen Darstellungssignalen gelöst. Die Kategorien heißen nun `Ergebnisse`,
`Anleitungen`, `Wissen` und `Werkzeuge` und erscheinen als eigene Auswahlflächen. Ergebnisanzahl,
Suchdauer und `Suchfilter` entfallen. Suchkopf, Kategorien und Trefferflächen übernehmen
PassWo-nahe Teal-, Flächen-, Radius- und Abstandsentscheidungen. Der lindgrüne erste Pflichttreffer
und die blauen Kontexttreffer bleiben in ihrer Handlungszuordnung unverändert.

`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `2.1.0` auf `2.2.0` erhöht. Persistenz, Export,
Timing und Interaktionsablauf ändern sich nicht.

| Segment und Text-ID | Vorher | Nachher | Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.searchPage.navigation` | `Alle`, `Bilder`, `Videos`, `News`, `Bücher`, `Mehr` | `Ergebnisse`, `Anleitungen`, `Wissen`, `Werkzeuge` | Orientierung | kein | vermeidet eine anbieterspezifische Kategorienfolge; begrenzt | aktive Kategorie in Teal |
| `S07.browser.searchPage.resultSummary` | fiktive Ergebnisanzahl und Suchdauer | entfällt | Orientierung | kein | entfernt ein unnötiges stark anbietercodiertes Signal; keine fachliche Bedeutungsänderung | keine |
| `S07.browser.searchPage.searchTools` | `Suchfilter` | entfällt | Orientierung | kein | entfernt eine für die Szene funktionslose Kontrolle; keine fachliche Bedeutungsänderung | keine |
| `S07.browser.searchPage.layout` | weiße, links ausgerichtete Suchseite mit weitgehend ungerahmten Treffern | Teal-geprägter Suchkopf, eigene Kategorienflächen und weich gerahmte Ergebnisflächen | Orientierung | erster Ergebnistitel | bindet die allgemeine Suchmetapher an die bestehende PassWo-Designsprache; begrenzt | erster Treffer weiterhin Lindgrün, übrige Titel Blau |

## Copy- und Darstellungsdelta S07 Search-Ergebnisse, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Die bisher leere Seite im Tab
`Passphrase generieren` wird zu einer langen, realitätsnahen, aber vollständig fiktiven
Suchergebnisseite ausgebaut. Die Suchmarke heißt ausdrücklich `Search`; alle Dienstnamen und
Domains sind erfunden und verwenden reservierte `.example`-Adressen. Der erste Treffer ist als
einziges verpflichtendes Interaktionsziel lindgrün hervorgehoben und beendet S07 beim Anklicken.
Alle übrigen Treffer bleiben blau dargestellter Suchkontext. Zusätzliche Fragen, verwandte
Suchanfragen, Seitennavigation und ein Footer erzeugen die für eine Ergebnisseite typische
Scrolltiefe. Es werden keine externen Seiten geladen und keine Such- oder Eingabewerte gespeichert.

`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `2.0.0` auf `2.1.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.searchPage.brand` | leere Seite | `Search` | Orientierung | kein | vom Nutzer ausdrücklich benannte fiktive Suchmarke; ausdrücklich freigegeben | keine |
| `S07.browser.searchPage.query` | leere Seite | `passphrase generieren` | Orientierung | kein | bildet die vom Tab benannte Suchabsicht realistisch ab; begrenzt | keine |
| `S07.browser.searchPage.primaryResult` | nicht vorhanden | fiktive Passphrase-Werkstatt mit Generator-Kurzbeschreibung | Navigation | erster Ergebnistitel | macht das verlangte nächste Klickziel sichtbar und eindeutig; ausdrücklich freigegeben | gesamter Ergebnistitel in Lindgrün plus gleichfarbige Seitenlinie |
| `S07.browser.searchPage.results.*` | nicht vorhanden | acht weitere fiktive Ergebnisse mit Kurzbeschreibungen | Orientierung | kein | erzeugt realistische Suchkontext- und Scrolltiefe ohne zusätzliche Pflichtaktionen; begrenzt | blaue Ergebnistitel als stabile Suchkonvention |
| `S07.browser.searchPage.questions` | nicht vorhanden | vier typische Anschlussfragen | Orientierung | kein | gliedert die lange Ergebnisseite realistisch; begrenzt | keine |
| `S07.browser.searchPage.relatedSearches` | nicht vorhanden | sechs verwandte Suchanfragen | Orientierung | kein | vervollständigt das typische untere Seitenende; begrenzt | keine |
| `S07.browser.searchPage.footer` | nicht vorhanden | `Deutschland`, `Hilfe`, `Datenschutz`, `Nutzungsbedingungen` | Orientierung | kein | kennzeichnet das fiktive Seitenende ohne reale Anbieteridentität; begrenzt | keine |

## Darstellungsdelta S07 Campusgram-Datenleckinhalt, 13. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 13. August 2026. Die drei Konto-Tabs in S07
zeigen keinen Abschlussstatus und damit keine Häkchen mehr. Der Campusgram-Tab übernimmt den
bereits vorhandenen Datenleck-Warnhinweis aus S04 unverändert. PassWo, Angreifer und Abdunklung
werden nicht übernommen; die anderen Kontoansichten und die leere Passphrasen-Suche bleiben
unverändert. Persistenz, Export, Ablauf und Teilnehmertexte ändern sich nicht.

| Element | Vorher | Nachher | Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.accountTabs.status` | `complete` mit sichtbarem Häkchen | kein Statussymbol | Orientierung | Konto-Tab | entfernt die nicht beauftragte Abschlussmarkierung | keine |
| `S07.browser.campusgram.dashboardNotice` | normales Campusgram-Dashboard | unveränderter Datenleck-Warnhinweis aus S04 im Dashboard | Orientierung | kein | stellt den verlangten inhaltlichen Ausgangszustand ohne zusätzliche Figuren oder Abdunklung her | vorhandene Warnfarbgebung |

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

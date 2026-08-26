# S06--S07 Copy Audit

## Copy-Delta S07 direkter Abschluss nach Campusgram-Wechsel, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Die vier adaptiven
`accountSummary`-Varianten entfallen als eigene PassWo-Sprechblase, weil S06 die Bedeutung von
Passwortverbindungen und lokalen Funden bereits erklärt hat und S08 die konkreten offenen Konten
und Gründe sichtbar markiert. Besteht weiterer Handlungsbedarf, führt S07 nach dem erfolgreichen
Campusgram-Wechsel direkt zur gemeinsamen Handlungsaufforderung. Ohne Handlungsbedarf bleibt eine
kurze positive Abschlussrückmeldung. S08, S09, die Ermittlung der empfohlenen Konten und die
Netzwerklogik bleiben unverändert. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von `4.22.0`
auf `4.23.0`; `SUPPORTIVE_ARTIFACT_VERSION` steigt von `supportive-s00-s17-1.25.0` auf
`supportive-s00-s17-1.26.0`.

| Segment und Text-ID | Quelle | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|
| `S07.guide.accountSummary` | ausdrücklicher Nutzerauftrag vom 2026-08-26 | vier adaptive Varianten zu offener Passwortverbindung, lokal leicht erratbarem Passwort, beiden Befundarten oder keinem Befund | entfällt vollständig | Ergebnisfeedback | wiederholt die in S06 erklärten Begriffe nicht vor dem erneut sichtbaren Netzwerk; begrenzt | kein | keine |
| `S07.guide.remainingPlan` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Die übrigen offenen Punkte siehst du gleich wieder im Netzwerk. Verwende dort bei einem markierten Konto eine eigene Passphrase, bis alle offenen Punkte aufgelöst sind.` | `Die übrigen offenen Punkte siehst du gleich wieder im Netzwerk. Verwende dort bei jedem markierten Konto eine eigene Passphrase, bis alle offenen Punkte behoben sind.` | Navigation / Handlungsempfehlung | benennt alle in S08 markierten Konten als Handlungsziele und übernimmt den gewünschten Abschlussbegriff; ausdrücklich freigegeben | bestehendes `Offene Punkte beheben` | keine |
| `S07.guide.nothingOpen` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | bisherige No-Finding-Variante `Es wurde keine offene Passwortverbindung und kein leicht erratbares Passwort erkannt.` | `Bei den anderen Konten ist hier nichts mehr offen.` | positives Ergebnisfeedback | kurze Abschlussbestätigung nur ohne offene Verbindung und ohne lokalen Fund bei den anderen Konten; begrenzt | `Weiter` schließt S07 ab und führt über die bestehende Segmentgrenze zu S08 | keine |
| S07-Abschlussrouting | ausdrücklicher Nutzerauftrag vom 2026-08-26 | nach dem Campusgram-Erfolg immer erst adaptive Zusammenfassung, bei Handlungsbedarf danach zusätzliche Aufforderung | bei Handlungsbedarf direkt `remainingPlan`; andernfalls genau `nothingOpen` | Navigation | entfernt die redundante Zwischenblase, ohne Empfehlungen oder S08-Verhalten zu ändern | `Offene Punkte beheben` beziehungsweise `Weiter` | keine |

Geschützte Formulierungen bleiben unverändert.

## Copy-Delta S06 erlebnisnahe Konsequenzcopy, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026. Die participant-facing
PassWo-Texte vom Campusgram-Vorfall bis zum S07-Übergang knüpfen nun kürzer an die jeweils gerade
sichtbare Szene an. Die Grenze von `nicht gefunden` wurde bereits am Ende von S05 erklärt und
wird nicht in jeder S06-Ergebnisvariante wiederholt. Das nicht im Klartext vorliegende
Campusgram-Passwort, die Trennung von lokaler Erratbarkeit und Passwortverbindung,
`dasselbe Passwort` und `leichte Abwandlung`, der mögliche Beginn eines Datenlecks bei jedem
Konto sowie die später zu behebenden lokalen Funde bleiben erhalten. Ablauf, Zustandsübergänge,
Visualisierung, Analyse, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.50.0` auf `2.51.0`.

| Segment und Text-ID | Quelle | Copy-Delta | Primäre Rolle | Grund und Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.incident.campusgram-found` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Beim Campusgram-Datenleck stand das Passwort nicht im Klartext. Unsere Übung konnte es trotzdem ermitteln. Jetzt prüfen wir dasselbe Passwort und leichte Abwandlungen bei den anderen Konten.` → `Beim Campusgram-Datenleck stand das Passwort nicht im Klartext. Unsere Übung konnte es trotzdem ermitteln. Jetzt prüfen wir, ob dasselbe Passwort oder leichte Abwandlungen auch zu den anderen Konten führen.` | Orientierung / Navigation | formuliert die folgende Verbindungsfrage ergebnisoffen; begrenzt | bestehendes `Angriff starten` | keine |
| `S06.narrations.s06.incident.campusgram-blocked` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Beim Campusgram-Datenleck stand das Passwort nicht im Klartext. Unsere Übung hat es nicht ermittelt. Mit den gestohlenen Passwortdaten können Angreifer aber weiter mögliche Passwörter prüfen. Deshalb betrachten wir kurz den Fall, dass es später bekannt wird.` → `Beim Campusgram-Datenleck stand das Passwort nicht im Klartext, und unsere Übung hat es nicht ermittelt. Mit den gestohlenen Passwortdaten kann aber weiter versucht werden, es zu ermitteln. Deshalb schauen wir kurz, was passiert, falls es später bekannt wird.` | Safety Boundary / Orientierung | hält Nicht-Klartext und möglichen späteren Fund verständlich zusammen, ohne abstrakte Kandidatenlogik; begrenzt | bestehendes `Angriff starten` im sichtbaren What-if-Pfad | keine |
| `S06.narrations.s06.compare.exact-match` | Nutzerauftrag / vollständige PassWo-Prüfung vom 2026-08-26 | `Das andere Konto verwendet genau dasselbe Passwort. Ein bekanntes Passwort kann dort direkt ausprobiert werden.` → `Wird dieses Passwort bekannt, kann es auch beim anderen Konto ausprobiert werden.` | Konsequenz | wiederholt das sichtbare Ergebnis und die Überschrift `Dasselbe Passwort` nicht; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.compare.derived-variant-match` | Nutzerauftrag / vollständige PassWo-Prüfung vom 2026-08-26 | `Das andere Passwort ist leicht abgewandelt. Nach einem bekannten Passwort werden solche Varianten ebenfalls ausprobiert.` → `Wird dieses Passwort bekannt, liegt die leichte Abwandlung beim anderen Konto nahe.` | Konsequenz | wiederholt das sichtbare Ergebnis und die Überschrift `Leicht abgewandelt` nicht; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.compare.no-derived-path-recognized` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Die hier geprüften Varianten führen nicht zum anderen Passwort. Das ist keine Sicherheitsgarantie.` → `Die hier geprüften Varianten führen nicht zum anderen Passwort.` | Ergebnisfeedback | wiederholt die bereits erklärte Safety Boundary nicht; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.perspective.master-campus-found` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Das Master-Campus-Passwort wird in unserer Übung gefunden. Damit ist es unabhängig von Verbindungen ein offener Punkt. Jetzt prüfen wir noch seine Verbindung zur Campus E-Mail.` → `Auch das Master-Campus-Passwort wird in unserer Übung gefunden. Unabhängig davon prüfen wir jetzt seine Verbindung zur Campus E-Mail.` | Ergebnisfeedback / Navigation | entfernt die abstrakte Wiederholung `offener Punkt`, hält lokale Frage und Verbindung getrennt; nein | bestehendes `Verbindung prüfen` | keine |
| `S06.narrations.s06.perspective.master-campus-exhaustive-found` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Das Master-Campus-Passwort wird hier durch vollständiges Durchprobieren gefunden. Damit ist es unabhängig von Verbindungen ein offener Punkt. Jetzt prüfen wir noch seine Verbindung zur Campus E-Mail.` → `Das vollständige Durchprobieren findet auch das Master-Campus-Passwort. Jetzt prüfen wir noch seine Verbindung zur Campus E-Mail.` | Ergebnisfeedback / Navigation | entfernt die doppelte Einordnung bei unverändertem lokalen Fund; nein | bestehendes `Verbindung prüfen` | keine |
| `S06.narrations.s06.perspective.master-campus-blocked` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Das Master-Campus-Passwort wurde hier nicht gefunden. Ob es mit der Campus E-Mail verbunden ist, ist eine andere Frage; für diesen Vergleich nehmen wir kurz an, es wäre bekannt.` → `Das Master-Campus-Passwort wurde hier nicht gefunden. Ob es mit der Campus E-Mail verbunden ist, prüfen wir trotzdem.` | Ergebnisfeedback / Navigation | der vorherige Perspektivwechsel trägt die What-if-Begründung; lokale Frage und Verbindung bleiben getrennt; begrenzt | bestehendes `Verbindung prüfen` | keine |
| `S06.narrations.s06.transition.master-campus-email-exact-match` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Master Campus und Campus E-Mail verwenden dasselbe Passwort. Wird eines bekannt, kann es direkt beim anderen ausprobiert werden.` → `Master Campus und Campus E-Mail verwenden dasselbe Passwort. Wird eines bekannt, kann es auch beim anderen ausprobiert werden.` | Ergebnisfeedback | natürlichere Folgeformulierung; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.transition.master-campus-email-derived-variant-match` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Die beiden Passwörter sind leicht abgewandelt. Wird eines bekannt, liegt die Variante beim anderen Konto nahe.` → `Die beiden Passwörter sind leicht abgewandelt. Wird eines bekannt, liegt auch die andere Variante nahe.` | Ergebnisfeedback | kürzerer Bezug auf das gerade sichtbare Kontopaar; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.transition.master-campus-email-no-match` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Zwischen den beiden wurde keine leichte Abwandlung erkannt. Diese Verbindung ist hier also kein offener Punkt.` → `Zwischen den beiden wurde keine leichte Abwandlung erkannt.` | Ergebnisfeedback | entfernt die gleichbedeutende Wiederholung; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.transition.campus-email-local-check` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Unabhängig davon prüfen wir jetzt das Campus-E-Mail-Passwort noch für sich.` → `Zum Schluss prüfen wir das Campus-E-Mail-Passwort noch für sich.` | Navigation | ordnet den letzten lokalen Check ohne erneute Abgrenzungsformel ein; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.local-check.campus-email-found` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Das Campus-E-Mail-Passwort wird in unserer Übung gefunden. Damit gibt es unabhängig von Passwortverbindungen einen Grund, es später zu ersetzen.` → `Auch das Campus-E-Mail-Passwort wird in unserer Übung gefunden. Es sollte deshalb später ersetzt werden.` | Ergebnisfeedback / Handlungsempfehlung | bindet die spätere Behebung direkt an den lokalen Fund; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.local-check.campus-email-exhaustive-found` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Auch das Campus-E-Mail-Passwort wird hier gefunden, weil das vollständige Durchprobieren innerhalb der Übungsgrenze liegt. Damit ist es ein weiterer offener Punkt.` → `Das vollständige Durchprobieren findet auch das Campus-E-Mail-Passwort. Es sollte deshalb später ersetzt werden.` | Ergebnisfeedback / Handlungsempfehlung | entfernt wiederholte Grenz- und Offenpunkt-Sprache, behält den lokalen Fundgrund; begrenzt | bestehendes `Weiter` | keine |
| `S06.narrations.s06.local-check.campus-email-blocked` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Für sich wurde das Campus-E-Mail-Passwort in unserer begrenzten Prüfung nicht gefunden. Ob eine Passwortverbindung offen ist, haben wir getrennt davon geprüft.` → `Für sich wurde das Campus-E-Mail-Passwort in unserer Prüfung nicht gefunden.` | Ergebnisfeedback | wiederholt die zuvor vollzogene Trennung und die Safety Boundary nicht; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.summary.actual-none`, `.actual-one`, `.actual-both` | Nutzerauftrag / vollständige PassWo-Prüfung vom 2026-08-26 | jeweilige konkrete Reichweite plus allgemeiner zweiter Folgesatz → nur die konkrete Reichweite von Campusgram über `dasselbe Passwort` oder `leichte Abwandlungen` | Konsequenz | vermeidet eine unmittelbare Verallgemeinerung des gerade sichtbaren Ergebnisses; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.summary.hypothetical-none` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Würde das Campusgram-Passwort später bekannt, führte hier keine solche Verbindung zu den anderen Konten.` → `Falls das Campusgram-Passwort später bekannt wird, bleibt dieser Weg auf Campusgram begrenzt.` | Konsequenz | natürlichere hypothetische Zusammenfassung; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.summary.hypothetical-one` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Würde das Campusgram-Passwort später bekannt, wäre durch dasselbe Passwort oder eine leichte Abwandlung ein weiteres Konto mitgefährdet.` → `Falls das Campusgram-Passwort später bekannt wird, ist über dasselbe Passwort oder eine leichte Abwandlung auch ein weiteres Konto gefährdet.` | Konsequenz | natürlichere hypothetische Zusammenfassung; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.summary.hypothetical-both` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Würde das Campusgram-Passwort später bekannt, wären durch dasselbe Passwort oder leichte Abwandlungen beide anderen Konten mitgefährdet.` → `Falls das Campusgram-Passwort später bekannt wird, sind über dasselbe Passwort oder leichte Abwandlungen auch beide anderen Konten gefährdet.` | Konsequenz | natürlichere hypothetische Zusammenfassung; nein | bestehendes `Weiter` | keine |
| `S06.narrations.s06.transition` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Die Verbindungen von Campusgram haben wir damit geprüft. Jetzt schauen wir Master Campus für sich an und danach seine Verbindung zur Campus E-Mail.` → `Ein Datenleck kann bei jedem Konto passieren. Deshalb prüfen wir jetzt Master Campus für sich und seine Verbindung zur Campus E-Mail.` | Orientierung | motiviert das zweite Ausgangskonto mit dem übertragbaren Datenleckrisiko; ausdrücklich freigegeben | bestehendes `Weiter` | keine |
| `S06.narrations.s06.transition.s07` | ausdrücklicher Nutzerwortlaut vom 2026-08-26 | `Das Campusgram-Passwort ersetzen wir jetzt wegen des Datenlecks, unabhängig davon, wie schwer es hier zu erraten war. Offene Passwortverbindungen oder leicht erratbare Passwörter bei den anderen Konten beheben wir danach.` → `Das Campusgram-Passwort ersetzen wir jetzt wegen des Datenlecks, unabhängig davon, wie schwer es hier zu erraten war. Die übrigen offenen Punkte beheben wir danach.` | Navigation / Handlungsempfehlung | behält Datenleckgrund und späteren Reparaturbedarf, ohne beide Punktarten erneut aufzuzählen; nein | bestehendes `Passwort ersetzen` | bestehender Akzent auf dem ersten Satzteil |

Die Überschrift `Campusgram-Passwort ersetzen`, die Aktionen `Angriff starten`, `Verbindung prüfen`
und `Passwort ersetzen`, der sichtbare `Was wäre, wenn?`-Zustand sowie alle S07-Texte bleiben
unverändert. Geschützte Formulierungen bleiben unverändert.

## Copy-Delta S07 dynamische S08-Handlungsfolge, 26. August 2026

- Quelle: ausdrücklicher Nutzerauftrag vom 26. August 2026 nach dem Abgleich der S07-Analyse mit dem S08-Knotennetzwerk.
- Primäre Textrolle: Handlungsempfehlung und Navigation in den anschließenden Netzwerkabschnitt.
- Interaktionsziel: Schaltfläche `Offene Punkte beheben` und der Übergang in das S08-Kontennetzwerk.
- Copy-Delta: `Die übrigen offenen Punkte siehst du gleich wieder im Netzwerk. Dort bekommt jedes dafür markierte Konto eine eigene Passphrase.` wird zu `Die übrigen offenen Punkte siehst du gleich wieder im Netzwerk. Verwende dort bei einem markierten Konto eine eigene Passphrase, bis alle offenen Punkte aufgelöst sind.`
- Begründung: Bei einer markierten Beziehung genügt die Änderung eines Endpunkts, um den gemeinsamen offenen Punkt aufzulösen. Die neue Formulierung beschreibt deshalb die dynamische Handlungsfolge, ohne zu behaupten, jedes anfangs markierte Konto müsse zwingend geändert werden.
- Semantik: ausschließlich Präzisierung der S07-Handlungsbeschreibung; Zustandsautomat, Knotennetzwerk, Persistenz, Export und Timing bleiben unverändert.
- Versionierung: `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von `4.21.0` auf `4.22.0`; `SUPPORTIVE_ARTIFACT_VERSION` steigt von `supportive-s00-s17-1.24.0` auf `supportive-s00-s17-1.25.0`.


## Copy-Delta S06 Datenleck, Verbindungen und lokale Erratbarkeit, 26. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 26. August 2026 nach Fertigstellung des
Trainings. Die vorhandene S06-Szenenfolge bleibt bestehen. Der Wortlaut trennt nun konsequent
drei Gründe, die vorher teilweise in einer Angriffserzählung vermischt waren: lokale
Erratbarkeit eines Passworts, eine Verbindung als `dasselbe` oder `leicht abgewandelt`, und den
Campusgram-Vorfall. In beiden Campusgram-Ausgängen wird ausdrücklich erklärt, dass das Passwort
im Datenleck nicht im Klartext vorlag. Wenn die begrenzte Übung es nicht ermittelt hat, bleibt
der anschließende Pfad klar als `Was wäre, wenn?` eingeordnet. Die Master-Campus-zu-Campus-E-Mail-
Rückmeldung unterscheidet nun exakt zwischen `dasselbe` und `leicht abgewandelt`; der lokale
Campus-E-Mail-Text behauptet nicht mehr fälschlich, dass kein Verbindungsweg bestanden habe.
Der Übergang nach S07 begründet den Campusgram-Wechsel mit dem Datenleck, unabhängig von der
lokalen Erratbarkeit. `S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.49.0` auf `2.50.0`.

| Segment und Text-ID | Copy-Delta | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsgrenze |
|---|---|---|---|---|
| `S06.narrations.s06.incident.campusgram-found`, `.campusgram-blocked` | Datenleck wird in beiden Pfaden als nicht im Klartext erklärt; Fund beziehungsweise Nicht-Fund wird direkt an die zuvor gezeigten Prüfwege gebunden | Mechanismuserklärung / Safety Boundary | ersten Kontenvergleich starten | stellt den Vorfall als gemeinsame Ursache her; Nicht-Fund wird nicht zu einem Sicherheitsnachweis |
| `S06.narrations.s06.compare.exact-match`, `.derived-variant-match`, `.no-derived-path-recognized` | interne Formulierungen wie `vollständige Werte` und `begrenzter Kandidatenweg` werden durch `Dasselbe Passwort`, `Leicht abgewandelt` und kurze Folgen ersetzt | Mechanismuserklärung | Vergleichsergebnis verstehen | verwendet die bereits eingeführte Teilnehmerterminologie statt Analysejargon |
| `S06.narrations.s06.local-reflection.marking-guide` | `Eigene Beobachtung` → `Master Campus für sich`; kürzere Markieraufforderung | Navigation | lokale Reflexion | lokale Prüfung wird sichtbar von Verbindungen getrennt |
| `S06.narrations.s06.perspective.master-campus-found`, `.master-campus-exhaustive-found`, `.master-campus-blocked` | lokale Einordnung wird als eigener offener Punkt oder begrenzter Nicht-Fund erklärt; beim Nicht-Fund wird der hypothetische Verbindungsvergleich begründet | Ergebnisfeedback / Safety Boundary | Verbindung zur Campus E-Mail vorbereiten | verhindert den unmotivierten Sprung zu einem neuen hypothetischen Angriff |
| `S06.narrations.s06.transition.master-campus-email-exact-match`, `.master-campus-email-derived-variant-match`, `.master-campus-email-no-match` | bisherige gemeinsame Match-Rückmeldung wird in exakte Wiederverwendung, leichte Abwandlung und keinen erkannten Weg aufgeteilt | adaptives Ergebnisfeedback | nächsten lokalen Check vorbereiten | PassWo reagiert auf das tatsächlich sichtbare Vergleichsergebnis |
| `S06.narrations.s06.transition.campus-email-local-check`, `S06.narrations.s06.local-check.campus-email-*` | Campus E-Mail wird ausdrücklich `für sich` geprüft; lokale Fundgründe werden unabhängig von Verbindungen formuliert | Ergebnisfeedback | offenen lokalen Punkt erkennen | entfernt die alte, situationsabhängig falsche Aussage, es habe keinen direkten Weg zu diesem Konto gegeben |
| `S06.narrations.s06.summary.actual-*`, `.hypothetical-*` | Zusammenfassungen benennen konkrete Verbindungen und ihre Reichweite statt abstrakter Angriffsausweitung | Konsequenz | Campusgram-Pfad abschließen | macht kontoübergreifende Folgen sichtbar, ohne eine Sicherheitsgarantie abzuleiten |
| `S06.narrations.s06.transition` | `Ein Datenleck kann bei jedem Konto beginnen` → expliziter Abschluss der Campusgram-Verbindungen und Ankündigung der zwei nächsten Prüfungen | Orientierung | Perspektivwechsel | begründet Reihenfolge statt einen neuen Vorfall einzuführen |
| `S06.page.connectionCheck` und adaptive Verwendung nach dem Master-Campus-Einzelcheck | neuer Button `Verbindung prüfen`; initialer tatsächlicher Campusgram-Pfad behält `Angriff starten` | Navigation | Master Campus → Campus E-Mail | Handlung stimmt mit der unmittelbar vorherigen Sprechblase überein |
| `S06.narrations.s06.transition.s07` | Campusgram-Wechsel wird ausdrücklich mit dem Datenleck begründet; andere offene Verbindungen oder leicht erratbare Passwörter werden als nachfolgende Aufgabe benannt | Handlungsempfehlung | `Passwort ersetzen` | ein starkes oder nicht verbundenes Campusgram-Passwort wird wegen des Vorfalls ersetzt, ohne seine vorherige Einordnung zu entwerten |

## Copy-Delta S07 Datenleck, Passphrase und offene Punkte, 26. August 2026

Quelle ist derselbe Nutzerauftrag vom 26. August 2026. S07 erhält einen eigenen Wortlaut für den
bereits vorhandenen Campusgram-Datenleckhinweis; S04 bleibt unverändert. Der Hinweis nennt erneut,
dass gespeicherte Passwortdaten abgeflossen sind und das Passwort darin nicht im Klartext stand.
Die Passphrase-Einführung knüpft ausdrücklich an die sechs zufälligen Wörter aus S05 an, statt die
Methode neu zu eröffnen. Nach dem Wechsel macht PassWo den Schutzgewinn sichtbar: selbst eine
spätere Ermittlung des alten Passworts aus den gestohlenen Daten macht dieses alte Passwort bei
Campusgram nicht wieder gültig. Die Abschlussrückmeldung unterscheidet weiterhin adaptiv zwischen
Passwortverbindungen und lokaler leichter Erratbarkeit, verwendet aber `offene Punkte` statt alle
Konten pauschal als vom Datenleck betroffen zu bezeichnen. Die fünf Merksatzbeispiele werden
verkürzt, ohne die jeweils sechs erzeugten Wörter zu verlieren. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION`
steigt von `4.20.0` auf `4.21.0`.

| Segment und Text-ID | Copy-Delta | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsgrenze |
|---|---|---|---|---|
| `S07.browser.campusgramIncidentNotice.title/body/advisory` und optionales `CampusgramIncidentNotice.noticeCopy` | S07-spezifischer Hinweis: gespeicherte Passwortdaten abgeflossen, Passwort nicht im Klartext, weitere Kandidatenprüfung trotzdem möglich | Mechanismuserklärung / Handlungsempfehlung | `Passwort jetzt ändern` | Vorfallsgrund bleibt für alle Teilnehmenden sichtbar; S04-Text wird nicht rückwirkend verändert |
| `S07.guide.methodIntro` | Rückbezug `Jetzt nutzen wir die Idee von vorhin` plus kurze Definition `Ein solches Passwort nennt man Passphrase.` | Orientierung / Mechanismuserklärung | Passphrase-Methode starten | schließt den in S05 angekündigten Handlungsbogen |
| `S07.guide.searchIntro` | Suchauftrag auf zwei kurze Handlungssätze reduziert | Navigation | neuen Tab öffnen und Generator nutzen | weniger redundante Erklärung |
| `S07.guide.campusgramSuccess` | erklärt, warum der Wechsel trotz möglicher späterer Ermittlung des alten Passworts schützt | positives Ergebnisfeedback | Schutzwirkung verstehen | macht den positiven Effekt des gerade ausgeführten Schritts sichtbar, ohne Kontosicherheit absolut zu behaupten |
| `S07.guide.accountSummary(...)` | vier adaptive Varianten benennen erkannte Passwortverbindung und lokale leichte Erratbarkeit getrennt; No-risk-Variante bleibt bei `wurde ... erkannt` | adaptives Ergebnisfeedback / Safety Boundary | verbleibende Aufgabe verstehen | kein Konto wird pauschal als sicher oder als vom Datenleck betroffen bezeichnet |
| `S07.guide.remainingPlan`, `.continueAttack` | `betroffene Konten` / `Angriff fortsetzen` → `übrige offene Punkte` / `Offene Punkte beheben` | Handlungsempfehlung / Navigation | Übergang nach S08 | approach-orientierte Handlung statt fortgesetzter Bedrohungserzählung |
| `S07.browser.generatorPage.passphrases[*].passWoMnemonic` | alle fünf Merksätze gekürzt, jeweils dieselben sechs generierten Wörter erhalten | unterstützende Merkhilfe | Passphrase einprägen | reduziert Textlast bei unverändertem spielerischem Beispielcharakter |

Geschützte Formulierungen sowie S08 und S09 bleiben unverändert.

## Copy- und Darstellungsdelta S06 persistente Beziehungslinien und S07 Campusgram-Hinweis, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Beim Verlassen einer
hypothetischen S06-Ausgangslage werden weiterhin die tatsächlichen Knotenstatus
wiederhergestellt. Bereits aufgelöste Passwortbeziehungen und blockierte Wege bleiben nun jedoch
wie vor dem letzten Ablaufpatch als persistente Kanten samt benötigter Blockadeschilde sichtbar.
Die What-if-Quelle selbst bleibt bis zu ihrer Ergebniszusammenfassung betroffen; nur der
anschließende Perspektiv- oder Einzelcheck-Hinweis stellt ihren tatsächlichen Knotenstatus wieder
her. Teilnehmertext, Analyse, Persistenz, Export und Timing ändern sich dadurch nicht.

Der Campusgram-Datenleckhinweis in S07 verwendet weiterhin die kanonische S04-Komponente und
zeigt deshalb ebenfalls deren neuen Beratungssatz `Ändere deshalb dein Campusgram-Passwort.`.
Textrolle, Interaktionsziel und Copy-Delta sind im S04-Audit dokumentiert; es entsteht keine
zweite Textquelle.

## Copy- und Ablaufdelta S06 stabile What-if-Zustände und getrennter Campus-E-Mail-Übergang, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Eine hypothetisch betroffene
Campusgram- oder Master-Campus-Quelle bleibt nun während der gesamten zugehörigen
Vergleichsauflösung und Ergebniszusammenfassung rot betroffen. Die Projektion springt zwischen
Angriffsansicht und Auflösung nicht mehr kurz in den blauen Schutzzustand. Erst der jeweils
nachfolgende, nicht mehr hypothetisch markierte Perspektiv- beziehungsweise Einzelcheck-Hinweis
stellt den vor der What-if-Annahme gemerkten tatsächlichen Zustand wieder her.

Die bisher zusammengeführte Master-Campus-/Campus-E-Mail-Blase wird wieder in Ergebnisfeedback
und Navigation getrennt. Die bedingte erste Blase ordnet weiterhin die erkannte Verbindung oder
begrenzte Nicht-Erkennung ein. Eine zweite Blase verlässt die What-if-Darstellung und führt mit dem
ausdrücklich vorgegebenen Satz zum lokalen Campus-E-Mail-Check. Analyse, Persistenz, Export und
Studien-Timing bleiben unverändert. `S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.48.0` auf
`2.49.0`.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.narrations.s06.transition.master-campus-email-match` | Nutzerauftrag vom 2026-08-24 / vorhandener Content | `Zwischen Master Campus und Campus E-Mail wurde dasselbe Passwort oder eine leichte Abwandlung erkannt. Dieser Weg könnte den Angriff auf Campus E-Mail ausweiten. Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.` | `Zwischen Master Campus und Campus E-Mail wurde dasselbe Passwort oder eine leichte Abwandlung erkannt. Dieser Weg könnte den Angriff auf Campus E-Mail ausweiten.` | Ergebnisfeedback | trennt Ergebnis und Navigation wieder an der sichtbaren What-if-Grenze | nein | `Weiter` zur getrennten Navigation | keine |
| `S06.narrations.s06.transition.master-campus-email-no-match` | Nutzerauftrag vom 2026-08-24 / vorhandener Content | `Zwischen Master Campus und Campus E-Mail wurde hier keine solche Übereinstimmung erkannt. Dieser Weg führt in dieser Übung nicht weiter. Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.` | `Zwischen Master Campus und Campus E-Mail wurde hier keine solche Übereinstimmung erkannt. Dieser Weg führt in dieser Übung nicht weiter.` | Ergebnisfeedback | trennt Ergebnis und Navigation wieder an der sichtbaren What-if-Grenze | nein | `Weiter` zur getrennten Navigation | keine |
| `S06.narrations.s06.transition.campus-email-local-check` | ausdrücklicher Nutzerwortlaut vom 2026-08-24 | bisher letzter Satz der beiden bedingten Ergebnisblasen | `Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.` | Navigation | eigener Sprechschritt verlässt die What-if-Darstellung vor dem lokalen Einzelcheck | nein | `Weiter` zum lokalen Campus-E-Mail-Check | keine |

Geschützter Wortlaut bleibt unverändert.

## Copy-Delta S06 Datenleckgrenze und Passwortwechsel, 24. August 2026

Quelle ist der vom Nutzer am 24. August 2026 zur vollständigen Übernahme vorgegebene
`passwo-v20-candidate-generation.patch`. Der hypothetische S06-Pfad erklärt nun, dass ein in der
begrenzten Übung nicht erratenes Passwort unabhängig davon durch ein Datenleck bekannt werden
kann. Der Übergang zu S07 unterscheidet das betroffene Passwort von gleichen oder leicht
abgewandelten Wiederverwendungen bei anderen Konten. Interaktionen, Persistenz, Export und Timing
bleiben unverändert. `S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.47.0` auf `2.48.0`.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.narrations.s06.incident.campusgram-blocked` | Nutzerauftrag / v20-Patch vom 2026-08-24 | `Das Campusgram-Passwort wurde hier nicht gefunden. Schauen wir trotzdem kurz, was passiert wäre, wenn es bekannt geworden wäre.` | `Auch wenn das Passwort hier nicht erraten wurde, kann es durch ein Datenleck bekannt werden: etwa wenn es unmittelbar im Klartext offengelegt oder aus unzureichend geschützten Passwortdaten nachträglich ermittelt wird. Schauen wir deshalb, was dann bei den anderen Konten passieren würde.` | Safety Boundary | Nicht-Erkennung von einem unabhängigen Datenleckpfad trennen | ausdrücklich freigegeben | `Weiter` in den bestehenden hypothetischen Pfad | keine |
| `S06.narrations.s06.transition.s07` | Nutzerauftrag / v20-Patch vom 2026-08-24 | `Ein Datenleck lässt sich nicht immer verhindern. Danach zählt, die Folgen zu begrenzen: das betroffene Passwort zügig ersetzen und für jedes Konto ein eigenes Passwort verwenden. Genau das machen wir jetzt bei Campusgram.` | `Ein Datenleck lässt sich nicht immer verhindern. Wird ein Passwort dabei bekannt, sollte es zügig ersetzt werden. Wurde dasselbe oder leicht abgewandelt auch bei anderen Konten verwendet, sollten dort ebenfalls neue, jeweils eigene Passwörter eingesetzt werden. Genau damit beginnen wir jetzt bei Campusgram.` | Kerngedanke | Handlung nach dem modellierten Datenleck nach betroffenem und wiederverwendetem Passwort differenzieren | ausdrücklich freigegeben | bestehender Übergang zu Campusgram in S07 | keine |

Geschützter Wortlaut bleibt unverändert.

## Copy- und Darstellungsdelta S06 lokale Fundmarkierung und direkte Vergleichspfeile, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Ausschließlich ein Konto, dessen
fiktives Passwort in der lokalen Einzelprüfung leicht zu erraten ist, trägt auf dem Hauptknoten
das gelieferte Warnlogo `Leicht zu erraten`. Eine Übereinstimmung oder leichte Abwandlung zu einem
anderen Passwort erzeugt dieses Logo nicht. Der tatsächlich simulierte Datenleckzustand bleibt
davon getrennt: Die Angriffsquelle einschließlich ihrer Unterknoten und über eine bestimmte
Passwortbeziehung erreichte Konten werden rot befallen dargestellt. Ein lokal starkes Passwort
behält im entsprechenden What-if-Ausgangszweig seinen blauen Schutzstatus. Der Angreifer bleibt
außerhalb des Kontos und ist über eine feste rote Linie mit ihm verbunden.

In der Vergleichsvorschau wachsen Passwortbausteine und Kontologos. Die rechte Darstellung
`Angreiferweg` entfällt; erkannte Änderungsschritte werden als direkte Pfeile vom jeweiligen
Ausgangs- zum Zielbaustein gezeichnet. Bei `Keine leichte Abwandlung erkannt` verläuft die grüne
Verbindung vollständig von Logo zu Logo. Der Käfer liegt oberhalb der Logos. Gleichheits- und
Abwandlungssymbole erhalten ausschließlich eine weiche Schattenhervorhebung ohne zusätzliche
Kreisfläche. Beim exakten Treffer umfasst die Hervorhebung auf beiden Seiten jeweils den ganzen
Passwortrahmen; der Pfeil verbindet diese beiden Rahmen direkt. Das jeweilige gelieferte Symbol
steht zusätzlich beim Ergebnislabel. Die Karte besitzt keine künstliche Mindesthöhe und verwendet
relationsabhängig nur die für Logos, große Passwortbausteine und Ergebnis benötigte Breite.

Die zugängliche What-if-Zusammenfassung beschreibt nun die Prüfung vorhandener
Passwortverbindungen, statt den lokal starken Ausgangszweig pauschal als betroffen zu bezeichnen.
Die Änderung ist als barrierefreie Anpassung an den sichtbaren Zustand ausdrücklich freigegeben.
Persistenz, Export, Analyse und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.46.0` auf `2.47.0`.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.networkSummary.hypotheticalCampusgram` | Nutzerauftrag vom 2026-08-24 | `Was wäre, wenn? Campusgram wird in dieser hypothetischen Simulation als betroffen dargestellt.` | `Was wäre, wenn? Von Campusgram aus werden bestehende Passwortverbindungen geprüft.` | Orientierung | gleicht die zugängliche Beschreibung an den geschützten lokalen Ausgangszweig und die tatsächliche Beziehungsprüfung an | ausdrücklich freigegeben | kein | keine |
| `S06.networkSummary.hypotheticalIncident` | Nutzerauftrag vom 2026-08-24 | `Was wäre, wenn? [Konto] wird als hypothetisch betroffen dargestellt.` | `Was wäre, wenn? Von [Konto] aus werden bestehende Passwortverbindungen geprüft.` | Orientierung | vermeidet die falsche Vollbefallsaussage bei lokal starkem Passwort | ausdrücklich freigegeben | kein | keine |

## Darstellungsdelta S06 Symbole auf Passwortbeziehungen, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Bereits bestimmte rote
Passwortbeziehungen tragen nun auf ihrem geometrischen Linienmittelpunkt das gelieferte
Gleichheits- oder Abwandlungssymbol. Das vorhandene Beziehungslabel bleibt klein direkt oberhalb
des Symbols sichtbar. Dadurch unterscheiden sich `Dasselbe Passwort` und `Leicht abgewandelt`
durch Text, Symbol und weiterhin unterschiedliche Linienarten; Farbe bleibt ergänzend.

Vergleichsergebnis, Kantenlogik, Zustände, Animation, Teilnehmerwortlaut, Analyse, Persistenz,
Export und Timing bleiben unverändert. Da kein Trainingscontent geändert wird, bleibt
`S06_CONSEQUENCE_CONTENT_VERSION 2.46.0` unverändert.

## Copy- und Darstellungsdelta S06 längere Vergleichsvorschau ohne Rollenlabel, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Die Vergleichskarte erhält mehr
vertikale Höhe und einen größeren Abstand zwischen den beiden Logo-/Passwortzeilen. Auch der
horizontale Abstand zwischen Logo und Passwortbausteinen wächst leicht. Dadurch lassen sich die
beiden vollständigen Bausteinfolgen und ihre verbundenen Änderungen ruhiger vergleichen. Auf
kleinen Ansichten bleibt die Höhe an den verfügbaren Darstellungsraum gebunden.

Das zuletzt allein über dem Ausgangslogo gezeigte Rollenlabel `Bekannt` entfällt vollständig.
Konten und Passwörter bleiben über ihre Logos, Positionen und zugänglichen Beschriftungen
zugeordnet. Analyse, Relation, Animation, Persistenz, Export und Studien-Timing bleiben
unverändert. `S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.45.0` auf `2.46.0`.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.comparisonPathLabels.sourceValue` | Nutzerauftrag vom 2026-08-24 | `Bekannt` über dem Ausgangslogo | entfällt | Orientierung | entfernt das nicht mehr gewünschte Rollenlabel; Logo, Position und zugängliche Kontobeschriftung bleiben bestehen | nein | kein | keine |

## Copy- und Darstellungsdelta S06 kompakter Angreiferweg, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Die Vergleichsvorschau zeigt
weiterhin den geordneten Änderungsweg zwischen dem bekannten Ausgangspasswort und dem fiktiven
Zielpasswort, verzichtet aber auf die darunter wiederholte vollständige Kandidatenfolge. Die
einzelnen Änderungspaare bleiben sichtbar und bestimmen weiterhin unverändert die Animation und
das abschließende Ergebnis.

Die äußere Box um die Passwortbausteine sowie die Rollenzeilen mit Kontonamen entfallen. Nur
`Bekannt` steht zur Orientierung über dem ersten Kontologo. Die Angriffslinie liegt in derselben
Spalte zwischen den beiden Logos; der gewonnene Platz vergrößert die Passwortbausteine und die
Darstellung der erkannten Änderungen. Analyse, Relation, Persistenz, Export und Studien-Timing
bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.44.0` auf `2.45.0`.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.comparisonPathLabels.heading` | Nutzerauftrag vom 2026-08-24 | `So entsteht der Kandidat` | `Angreiferweg` | Orientierung | weniger abstrakte Bezeichnung des sichtbaren Wegs | begrenzt | kein | keine |
| `S06.comparisonPathLabels.sourceValue` | Nutzerauftrag vom 2026-08-24 | `bekannt` mit Kontoname | `Bekannt` allein über dem Ausgangslogo | Orientierung | reduziert redundante Beschriftung und ordnet den Ausgangspunkt direkt zu | nein | kein | keine |
| `S06.comparisonPathLabels.targetValue` | Nutzerauftrag vom 2026-08-24 | `Ziel` mit Kontoname | entfällt | Orientierung | Ziel ist durch zweites Logo und zweite Passwortzeile bereits sichtbar | nein | kein | keine |
| `S06.comparisonPathLabels.candidateProgress` | Nutzerauftrag vom 2026-08-24 | `Kandidat nach jedem Schritt` | entfällt | Mechanismuserklärung | entfernt die wiederholte vollständige Kandidatenfolge unter den weiterhin sichtbaren Änderungsschritten | nein | kein | keine |
| `S06.comparisonPathLabels.generatedCandidate` | Nutzerauftrag vom 2026-08-24 | `Vollständiger Kandidat` | entfällt | Ergebnisvorbereitung | das Zielpasswort steht bereits als vollständige zweite Passwortzeile fest | nein | kein | keine |

## Darstellungsdelta S06 roter Befallszustand im What-if-Pfad, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Nach der hypothetischen
Befallen-Animation verwendet der What-if-Pfad durchgehend denselben roten Befallszustand wie ein
tatsächlicher Vorfall. Der Ausgangsknoten, seine Unterknoten und seine internen Linien bleiben
beim anschließenden Vergleich rot; lokal blockierte grüne Linien und der lila hypothetische
Knotenstatus werden dort nicht erneut projiziert.

Die hypothetische Einordnung bleibt über den grauen Szenenhintergrund, das dauerhaft sichtbare
`Was wäre, wenn?`-Logo und die zugängliche Szenenbeschreibung erhalten. Teilnehmertexte,
Analyse, flüchtige Werte, Persistenz, Export, Timing und
`S06_CONSEQUENCE_CONTENT_VERSION 2.43.0` bleiben unverändert.

## Interaktionsdelta S06 Standardmodus und stabile persönliche Zeichen, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Die lokale Reflexion startet ab
zwei erkannten Teilen im Modus `Zusammenhang`. Wenn nur ein Teil erkannt wurde, bleibt
`Persönliches` der Standardmodus, weil `Zusammenhang` und `Struktur` dort nicht anwendbar sind.

Die gemeinsame Bausteinbox richtet ihren Inhalt in allen drei Modi über dieselbe vertikale
Grundbox aus. Dadurch springt die gesamte Zeichenzeile beim Wechsel zu `Persönliches` nicht nach
oben. Das vorhandene physische Hover- und Druckfeedback der einzelnen Zeichenbuttons bleibt
erhalten. Tastaturbedienung, Fokusdarstellung, Auswahlverhalten, Analyse, flüchtige semantische
Evidenz, Persistenz, Export und Timing ändern sich nicht. Teilnehmertexte und
`S06_CONSEQUENCE_CONTENT_VERSION 2.43.0` bleiben unverändert.

## Interaktionsdelta S06 Filzstift während des gesamten persönlichen Modus, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026 und dessen anschließende
Präzisierung. Solange der Modus `Persönliches` aktiv ist, bleibt der vorhandene lila-pinke
Filzstiftcursor am Zeiger sichtbar. Das gilt für die gesamte Study-Oberfläche und nicht erst in
der Nähe der Passwort-Markierungsfläche oder beim Hover über ein einzelnes Zeichen.
Tastaturbedienung, Fokusdarstellung, Auswahlverhalten, Analyse, ausschließlich flüchtige
semantische Evidenz, Persistenz, Export und Timing ändern sich nicht. Da kein Teilnehmertext oder
Trainingscontent geändert wird, bleibt `S06_CONSEQUENCE_CONTENT_VERSION 2.43.0` unverändert.

Während die linke Maustaste für eine einzelne Auswahl oder zum Aufziehen eines
zusammenhängenden Bereichs gedrückt bleibt, erscheinen die noch nicht bestätigten Zeichen in
einem etwas dunkleren Pink. Erst beim Loslassen wechselt der übernommene Bereich in den bestehenden
helleren finalen Pinkton. Damit bleiben Vorschau und feststehende Markierung auch ohne Bewegung
unterscheidbar; Farbe ist wegen des gedrückten Auswahlzustands und der bestehenden Bereichsgrenzen
nicht der einzige Bedeutungsträger.

## Copy- und Interaktionsdelta S06 freie persönliche Markierung, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Die lokale Reflexion startet
direkt im Modus `Persönliches`; `Zusammenhang` erhält keinen initialen aktiven Zustand. Innerhalb
der gemeinsamen Bausteinansicht können weiterhin einzelne Zeichen oder frei gezogene
zusammenhängende Zeichenbereiche markiert und wieder entfernt werden, auch über Bausteingrenzen
hinweg. Vorhandene Zusammenhangsflächen, Strukturpfeile und Kategorienlogo-Hoverkarten bleiben
dabei sichtbar. Der lila-pinke Filzstiftcursor aus S05 zeigt auf Zeigergeräten unmittelbar die
Markierhandlung an; Tastaturauswahl, Fokusdarstellung und Live-Rückmeldungen bleiben erhalten.

Der Ein-Teil-Hinweis der gesperrten Buttons `Zusammenhang` und `Struktur` wechselt von
`Erst ab zwei Bausteinen verfügbar.` zu dem in S05 verwendeten Text `Nur ein Teil erkannt.`. Die
Textrolle bleibt Navigation. Analyse, ausschließlich flüchtige semantische Evidenz, Persistenz,
Export und Timing bleiben unverändert. `S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.42.0` auf
`2.43.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.page.localReflection.requiresMultipleComponents` | Nutzerauftrag vom 2026-08-24 | `Erst ab zwei Bausteinen verfügbar.` | `Nur ein Teil erkannt.` | Navigation | gleicht den Hover- und Fokushinweis an S05 an | nein | gesperrte Buttons `Zusammenhang` und `Struktur` | durchgestrichenes Kugelsymbol |

## Interaktionsdelta S06 gemeinsame Bausteinansicht, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Der Modus `Persönliches` öffnet
keine separate Zeichenansicht mehr. Alle drei Modi verwenden dieselben sichtbaren Analysebausteine
mit denselben Kategorienlogos und Hover-/Fokuskarten. Bereits markierte Zusammenhänge und
Strukturpfeile bleiben auch im persönlichen Modus sichtbar. Ein Klick auf einen Baustein markiert
oder entfernt dessen vollständigen Zeichenbereich als persönliche Angabe; die lila-pinke
zeichenpräzise Rückmeldung und das persönliche Kategorienlogo bleiben erhalten.

Die Änderung ersetzt für S06 die frühere Vorgabe einer separaten persönlichen Bereichsauswahl.
Analyse und flüchtige semantische Evidenz bleiben in den vorhandenen Ports; Persistenz, Export und
Timing ändern sich nicht. Teilnehmertexte bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.41.0` auf `2.42.0` erhöht.

## Copy- und Interaktionsdelta S06 Ein-Baustein-Sperre und Zusammenhangsvorschau, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Wenn die lokale Projektion eines
fiktiven Passworts nur einen Baustein enthält, sind die Modi `Zusammenhang` und `Struktur` nicht
anwendbar. Beide Modusbuttons werden grau und zeigen das vorhandene durchgestrichene Kugelsymbol.
Hover oder Tastaturfokus zeigt jeweils `Erst ab zwei Bausteinen verfügbar.`. Die Modi bleiben auch
im Controller gesperrt; insbesondere kann der Zusammenhangsmodus keine erste Markierung anlegen.
`Persönliches` und `Fertig` bleiben unabhängig davon verfügbar.

Der bewegte gestrichelte Vorschaurahmen des ersten Zusammenhangsbausteins erhält die Gruppenfarbe
am äußeren Bausteinrahmen, an dem auch die Pseudoelement-Animation liegt. Dadurch ist die bereits
dokumentierte Vorschau in S06 wieder sichtbar. Die A-bis-C-Kugeln und ihre Verbindungslinien
belegen zusätzlich explizite feste Rasterspalten, damit vorhandene und nächste Slots nicht
verrutschen. Analyse, flüchtige Auswahlwerte, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.40.0` auf `2.41.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.page.localReflection.requiresMultipleComponents` | Nutzerauftrag vom 2026-08-24 | nicht vorhanden | `Erst ab zwei Bausteinen verfügbar.` | Navigation | erklärt die fachlich unmögliche Zusammenhangs- und Strukturmarkierung bei nur einem Baustein | nein | ausgegraute Modi `Zusammenhang` und `Struktur` | durchgestrichenes Kugelsymbol und Hover-/Fokushinweis |

Geschützter Wortlaut und PassWo-Sprechschritte bleiben unverändert.

## Copy- und Darstellungsdelta S06 ausgelagerte Gruppenwahl, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Die Farbkugeln liegen außerhalb
der Modusbox unter `Zusammenhang`, sodass die Box selbst nur eine einheitliche Buttonhöhe behält.
Ein weiterer Zusammenhang kann erst geöffnet werden, wenn jeder vorhandene Zusammenhang
mindestens zwei Bausteine enthält. Das entspricht der bereits dokumentierten fachlichen Grenze,
dass ein einzelner Baustein noch keinen Zusammenhang bildet.

Die ausgeschriebenen Bezeichnungen `Zusammenhang` und `Persönliches` werden nicht gekürzt. Der
aktive Modus bleibt ruhig markiert, während die jeweils anderen Modi visuell zurücktreten. Die
persönliche Auswahl arbeitet direkt in den vorhandenen Bausteingrenzen, zeigt dabei aber weder
Zusammenhangsflächen noch Strukturpfeile oder automatische Kategorienflächen. Der separate Button
`Übernehmen` entfällt; der Wechsel erfolgt direkt über die drei dauerhaft sichtbaren Modi.
Bausteinabstände, Steuerungsgrößen und die Gesamtbreite skalieren auf großen Bildschirmen stärker,
während schmale Ansichten die vollständigen Bezeichnungen weiterhin anzeigen.

Der erste Baustein eines Zusammenhangs ist nur eine gestrichelte Vorschau. Erst die Auswahl eines
zweiten Bausteins bestätigt und füllt beide; ein Wechsel zu `Struktur` oder `Persönliches`
verwirft eine einzelne Vorschau. Die persönliche Zeichenmarkierung verzichtet auf die bisherige
Eingangsanimation. Mehrere Kategorienlogos werden überall verkleinert und horizontal angeordnet.
Passwort- und Kontotitel wachsen gegenüber den Passwortbausteinen leicht, `Zusammenhang` steht
ungeachtet der fehlenden Symbolspalte geometrisch mittig im Button. Die responsive Breite bleibt
auf kleinen Screens auf den rechten Bereich begrenzt und wächst auf großen Screens stärker mit.

Die unbestätigte Zusammenhangsvorschau bleibt vollständig transparent und erhält stattdessen einen
umlaufenden gestrichelten Suchrahmen; bei reduzierter Bewegung bleibt der Rahmen statisch. A, B und
C belegen links, mittig und rechts dauerhaft dieselben Außenpositionen unterhalb der Modusbox. Auch
der nächste Plus-Slot steht bereits an seiner späteren Position. Jede Kugel ist mit dem
Zusammenhangsbutton verbunden; die Linie der aktiven Gruppe übernimmt ihre Farbe und läuft sichtbar
in Richtung der Steuerung. Die Strukturpfeile wechseln zu dunklem, kontrastreichem Grau. Das
Markiermodul wird für schmale Stages weiter begrenzt, damit es insbesondere beim Campus-E-Mail-Konto
nicht in die Kontooberfläche hineinragt. Teilnehmerwortlaut und Inhaltsversion bleiben dadurch
unverändert.

Unterschiedlich große einzelne, doppelte und dreifache Kategorienlogos verwenden auch in S06 eine
gemeinsame responsive Höhenzeile, sodass ihre Mittelpunkte stets auf derselben Y-Ebene liegen.

Während der lokalen Passwortbestimmung bleibt das Angreifermodell bis zum sichtbaren
Ergebniszustand in Warteposition; ein bereits neu berechneter Fundstatus löst keine vorgezogene
Knotenbewegung aus. Bei Passwörtern mit einem bis drei Bausteinen rücken die Logo-Informationen
weiter von den Bausteinen ab und reservieren den zusätzlichen Zwischenraum. Die gesamte
Campus-E-Mail-Markieransicht sitzt höher, damit unter ihr mehr freie Kontooberfläche bleibt. Der
unbestätigte Zusammenhang verwendet statt einer rotierenden Rechteckform nun eindeutig laufende
Striche entlang aller vier Randseiten. Diese Änderungen betreffen Darstellung und
Zustandsprojektion, nicht Teilnehmerwortlaut oder Inhaltsversion.

Der Perspektivwechsel zu Master Campus und Campus E-Mail erhält einen eigenen animierten
Datenleckzustand: Nur der neu lokal geprüfte Zweig wird neutralisiert. Bereits bestimmte rote
Befallsbeziehungen und grüne Schutzbeziehungen bleiben in allen weiteren Ansichten sichtbar.
Der rote Knotenzustand wird dagegen für die aktive Datenleckquelle neu projiziert: Rot bleiben nur
die Quelle und Konten, die über eine bereits bestimmte rote Beziehung mit ihr verbunden sind.
Die ursprüngliche Prüfrichtung begrenzt den Ausbreitungsweg nicht. Ein lokaler blauer
Schutzzustand bleibt erhalten; eine grüne Paarbeziehung allein färbt
ihren Zielknoten nicht blau. Blockierte Paarwege verwenden dieselbe statische Darstellung wie
S08: Zwei grüne Linien treffen ein exakt mittiges grünes Schild und ersetzen dort die rote
Angriffslinie.
S06 übernimmt dabei keine S08-Bezeichnungen mit `das alte`; bestehender S06-Wortlaut bleibt
unverändert. Bereits bestimmte rote Beziehungen zeigen dauerhaft die vorhandenen
S06-Ergebnislabels `Dasselbe Passwort` beziehungsweise `Leicht abgewandelt`. Sie verwenden wie in
S08 helle Schrift mit dunkler Kontur und ohne weiße Hintergrundfläche. Die bisherigen zusätzlichen
Knotenlabels entfallen, sodass jedes Ergebnis nur einmal an der Beziehung steht; insbesondere
bleibt `Keine leichte Abwandlung erkannt` auf die Vergleichsvorschau begrenzt. Die primäre Rolle
bleibt Ergebnisfeedback; es entsteht kein neuer Text und keine neue Bedeutungsbehauptung. Der
bisherige Angreifer blendet an seiner Position aus und der neue blendet in identischer,
kontofüllender PNG-Größe an der Zielposition ein. Der langsamere Crossfade hält den
laufenden Angriff anschließend ungefähr eine zusätzliche Sekunde, bevor die Markieransicht weich
erscheint. Master Campus wird von rechts, Campus E-Mail mit längerer vertikaler Linie von unterhalb
des Knotens angegriffen; die spätere Knotenbewegung folgt derselben Richtung. Bereits bestimmte
rote Beziehungen werden bei einem erfolgreichen lokalen Angriff als Ausbreitungsweg in beide
Richtungen verwendet: Master Campus kann dadurch Campusgram erreichen, Campus E-Mail beide zuvor
verbundenen Konten. Grüne blockierte Wege lösen keinen Befall aus. Während der eigentlichen
Markierung sind alle anderen Konten und kontoübergreifenden Verbindungen ausgeblendet; sichtbar
bleiben nur das aktive Konto, seine Unterknoten und deren interne Verbindungen. Die grüne generische
Knotenhervorhebung entfällt in Wechsel, Markierung und lokaler Ergebnisprojektion. Während eines
neuen Angriffs darf der aktuelle Knoten seinen blauen Schild vorübergehend für die rote
Prüfbewegung verlassen; danach gilt wieder das bestimmte rote Befalls- oder blaue Schutzergebnis.
Der abschließende Rückwechsel zu Campusgram behält alle bestimmten Beziehungen und projiziert die
Knotenstatus erneut aus der Campusgram-Perspektive.
`Fertig` startet die Betroffen-/Blockiert-Projektion ohne die bisherige 900-ms-Wartephase und ohne
leeren Zwischen-Render. Die Strukturpfeile werden heller, dicker und auch in der Vorschau weniger
stark abgeblendet. Bei einer Stage unter 1400 px Breite oder 850 px Höhe werden das gesamte
Markiermodul, seine Titel, Passwortbausteine, Modussteuerung, Gruppenkugeln und Abschlussaktion
gemeinsam kompakter. Unterhalb von 760 beziehungsweise 520 Stage-Pixeln ordnet sich die verfügbare
Breite so neu, dass die ausgeschriebenen Modusnamen bedienbar bleiben. Wortlaut und Inhaltsversion
bleiben unverändert.

Auswahlwerte, Analyse, flüchtiger Zustand, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.39.0` auf `2.40.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.page.localReflection.personalApply` | Nutzerauftrag vom 2026-08-24 | `Übernehmen` | entfällt | Navigation | der dauerhafte Moduswechsel übernimmt die Rückkehr und entfernt eine redundante Aktion | nein | kein verbleibendes Ziel | keine |
| `S06.comparisonResultLabels.exact-match` | Nutzerauftrag vom 2026-08-24 | `Dasselbe Passwort`, bisher nur im Vergleichsergebnis | wortgleich zusätzlich auf der dauerhaft bestimmten roten Beziehung | Ergebnisfeedback | hält die bestimmte Beziehungsart in späteren Netzwerkansichten sichtbar | nein | kein | rote Beziehungslinie plus Text |
| `S06.comparisonResultLabels.derived-variant-match` | Nutzerauftrag vom 2026-08-24 | `Leicht abgewandelt`, bisher nur im Vergleichsergebnis | wortgleich zusätzlich auf der dauerhaft bestimmten roten Beziehung | Ergebnisfeedback | hält die bestimmte Beziehungsart in späteren Netzwerkansichten sichtbar | nein | kein | rote Beziehungslinie plus Text |
| `S06.network.comparisonResultOverlay` | Nutzerauftrag vom 2026-08-24 | zusätzliches Ergebnislabel am Zielknoten, einschließlich `Keine leichte Abwandlung erkannt` | entfällt im Knotennetz; die Vergleichsvorschau bleibt unverändert | Ergebnisfeedback | entfernt doppelte Bezeichnungen und begrenzt die Nicht-Erkennung auf die Vorschau | nein | kein verbleibendes Knotenziel | rote Beziehungslinie beziehungsweise Vergleichsvorschau |

Geschützter Wortlaut und PassWo-Sprechschritte bleiben unverändert.

## Copy- und Darstellungsdelta S06 zentrierte Markierungssteuerung, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026. Dieses Delta ersetzt die
untere UI-Anleitung aus der kompakten Markierungssteuerung. PassWo spricht den neuen Hinweis
einmal beim ersten lokalen Markierungsschritt mit Master Campus; bei Campus E-Mail wird er nicht
wiederholt. Der Satz ist als Navigation und freiwillige Übungseinladung klassifiziert. Er fordert
keine echten Passwörter oder persönlichen Angaben an, sondern bezieht sich ausschließlich auf das
bereits sichtbare fiktive Passwort.

Der Campusgram-Passworttitel aus S05 sowie die Passworttitel für Master Campus und Campus E-Mail
werden einheitlich unterstrichen. Moduswahl und Abschluss stehen zentriert unter dem Passwort;
`Fertig` folgt unterhalb der Modusbox. Alle drei Modusbuttons erhalten dieselbe Höhe,
Innenaufteilung und responsive Skalierung. Der Zusammenhangsbutton hat kein Symbol mehr, die
aktiven Modusflächen verwenden eine ruhige einzelne Zustandsmarkierung und die fokussierte
Zusammenhangskugel keinen doppelten Ring. B und C übernehmen wieder ihre jeweilige feste
Gruppenfarbe. `Persönliches` verwendet einen neutralen Button und dieselbe Baustein- und
Zeichenmarkierung wie S05.

Auswahl, Analyse, flüchtiger Zustand, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.38.0` auf `2.39.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.page.localReflection.instruction` | Nutzerauftrag vom 2026-08-23 | `Wähle erst einen Modus. Markiere dann die passenden Teile im Passwort.` | entfällt | Navigation | ersetzt den statischen UI-Hinweis durch eine einmalige PassWo-Einführung | nein | kein verbleibendes UI-Ziel | keine |
| `S06.narrations.s06.local-reflection.marking-guide` | Nutzerauftrag vom 2026-08-24 | nicht vorhanden | `Als Übung kannst du auch hier die Muster und persönlichen Angaben markieren die dir auffallen.` | Navigation | ausdrücklich vorgegebene natürliche PassWo-Einführung; nur beim ersten lokalen Markierungsschritt | begrenzt | sichtbare Modi und fiktive Passwortbausteine | keine |

Geschützter Wortlaut und andere Sprechschritte bleiben unverändert.

## Copy- und Darstellungsdelta S06 kompakte Markierungssteuerung, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026 sowie ausschließlich die
Markierungsdarstellung aus `design idee markieren.png`. Die lokale Passwortreflexion übernimmt
eine kompakte, horizontal angeordnete Modusleiste mit `Zusammenhang`, `Struktur` und
`Persönliches`; die dreiteilige Schrittanzeige entfällt. Unter der Leiste bleibt ausschließlich
der neue Bedienhinweis sichtbar. Er ist als Navigation klassifiziert und verweist auf die
unmittelbar sichtbaren Modi und Passwortbausteine.

Die bisher nach unten wachsende Zusammenhangsliste wird durch höchstens drei beschriftete
Farbkugeln A bis C direkt unter dem Zusammenhangsmodus ersetzt. Der jeweils nächste freie Platz
ist die Plus-Steuerung; bei drei vorhandenen Gruppen entfällt sie. Weitere Gruppen lassen sich
direkt an ihrer Kugel löschen. Der Zusammenhangsmodus übernimmt die Farbe der fokussierten
Gruppe. Die Modussymbole zeigen drei verbundene farbige Bausteine, zwei durch einen Pfeil
verbundene Strukturbausteine beziehungsweise das vorhandene Logo `Persönliche Angaben`. Farbe
bleibt durch Beschriftungen, Fokusformen und `aria-pressed` ein zusätzlicher Bedeutungsträger.

Auswahl, Analyse, flüchtiger Zustand, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.37.0` auf `2.38.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.page.localReflection.instruction` | Nutzerauftrag vom 2026-08-23 | nicht vorhanden | `Wähle erst einen Modus. Markiere dann die passenden Teile im Passwort.` | Navigation | übernimmt ausschließlich die ausdrücklich benannte untere Beschreibung aus der Designidee | nein | Modussteuerung und Passwortbausteine | keine |

Geschützter Wortlaut und bestehende Sprechschritte bleiben unverändert.

## Copy-Delta S06 Zusammenhänge A bis C, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. Die aus S05 übernommenen
Inhaltsgruppen heißen in der lokalen Reflexion nun `Zusammenhang A`, `Zusammenhang B` und
`Zusammenhang C`. Der Plus-Hinweis verwendet entsprechend `Neuer Zusammenhang`; der nicht
interaktive Grenzhinweis lautet `Max. 3 Zusammenhänge`. Auswahl, Löschfunktion, Zuordnung,
Analyse, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.36.0` auf `2.37.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.page.localReflection.{groupLabel,newGroup,maxGroups}` | Nutzerauftrag vom 2026-08-23 | `Gruppe 1–3`; `Neue Gruppe`; `Max. 3 Gruppen` | `Zusammenhang A–C`; `Neuer Zusammenhang`; `Max. 3 Zusammenhänge` | Orientierung | ausdrücklich verlangte Bezeichnung und konsistente Benennung der zugehörigen Steuerungen | nein | jeweiliger Zusammenhang; Plus-Steuerung; kein Ziel beim Grenzhinweis | keine |

Geschützter Wortlaut und bestehende Sprechschritte bleiben unverändert.

## Copy- und Darstellungsdelta S06 Dreier-Gruppenpalette ab #52BE80, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. Dieses Delta ersetzt die bisherige
Vierer-Palette und Obergrenze. S06 übernimmt stabil geordnet genau `#52BE80`, `#A9DFBF` und
`#E8F8F0` aus S05; Gruppe 1 verwendet `#52BE80` als Basisfarbe. Weitere Gruppenfarben werden
nicht zyklisch wiederholt.

Die Gruppenerweiterung ist in Controller und Oberfläche auf drei Gruppen begrenzt. Sobald die
dritte Gruppe vorhanden ist, wird der bisherige Plus-Button zum nicht interaktiven Hinweis
`Max. 3 Gruppen`. Analyse, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.35.0` auf `2.36.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.page.localReflection.maxGroups` | Nutzerauftrag vom 2026-08-23 | `Max. 4 Gruppen` | `Max. 3 Gruppen` | Ergebnisfeedback / Orientierung | synchronisiert den sichtbaren Hinweis mit der ausdrücklich reduzierten Obergrenze | begrenzt | kein; ersetzt den deaktivierten Plus-Button bei drei Gruppen | keine |

Geschützter Wortlaut und bestehende Sprechschritte bleiben unverändert.

## Copy- und Darstellungsdelta S06 Logo-Infos ohne Zusammenfassungskarte, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. Die Karte `Früh geprüft` entfällt
in der lokalen S06-Passwortreflexion vollständig. Die dadurch frei werdende Fläche vergrößert die
Passwortbausteine und ihre Kategorie-Logos. Die Logos bleiben unter den zugeordneten Bausteinen;
mehrere Kategorien werden vertikal gestapelt und abhängig von ihrer Anzahl responsiv skaliert.

Jedes Logo erhält dieselbe erkennbare und tastaturfähige Info-Interaktion wie in S05: Die
bausteingrößenabhängige, durchsichtige Glassy-Kachel gleicht die unterschiedlichen transparenten
Bildränder aus und steht näher am Baustein. Hilfecursor und eine dezente Hover-/Fokus-Leuchte
reichen als Interaktionshinweis; ein zusätzliches Fragezeichen entfällt. Hover oder Fokus öffnet
eine stärker gedeckte gläserne Infokarte mit dem vollständigen Kategorienamen und den konkreten
Befunden unter `Eingestuft als`. Persönliche Bereiche behalten zusätzlich ihre zeichenpräzise
lila-pinke Leuchte. Dauerhafte Logos erhalten größenabhängig reservierten Raum und bedecken keine
Modus- oder Abschlusssteuerung.

Analyse, Auswahl, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.34.0` auf `2.35.0` erhöht.

| Segment und Text-ID | Aktueller Zustand | Geplanter Zustand | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.page.localReflection.earlyChecked` | Karte `Früh geprüft` | entfällt vollständig | Orientierung | kein | entfernt die redundante Zusammenfassung und schafft Platz für die eigentliche Bausteinzuordnung | nein |
| `S06.page.localReflection.blockFindingInfo` | statische kleine Logos | bausteingrößenabhängige fokussierbare Logo-Kacheln mit durchsichtiger gläserner Oberfläche, ausgeglichener Bildposition sowie Kategoriename und konkreter Einstufung in einer stärker gedeckten Hover-/Fokus-Karte | Ergebnisfeedback / Optionaler Hinweis | jeweilige Kachel unter dem Baustein | macht Details platzsparend, erkennbar und tastaturzugänglich | Logo-Kachel und Fokusform |

Bestehende Sprechschritte und geschützter Wortlaut bleiben unverändert.

## Copy- und Darstellungsdelta S06 Kategorienübersicht und Kategorie-Logos, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. Die aus S05 übernommene große
Kategorienzusammenfassung heißt in der lokalen S06-Reflexion nun `Früh geprüft` und zeigt jede
geprüfte Kategorie genau einmal mit einem deutlich großen, responsiv skalierten Logo und ihrem
vollständigen Kategorienamen. Einzelne erkannte Begriffe erscheinen dort nicht. Unter den
eigentlichen Passwortbausteinen ersetzen deutlich größere Kategorie-Logos die bisherigen
Befundlabels; mehrere zutreffende Kategorien werden vertikal gestapelt und abhängig von ihrer
Anzahl skaliert.

Persönliche Bereiche werden ohne rosa Rahmen zeichenpräzise durch leuchtendes Lila-Pink markiert.
Überlappt ein persönlicher Bereich mehrere vorhandene Bausteine, steht das Logo `Persönliche
Angaben` unter jedem dieser Bausteine, während die Zeichenfarbe die genaue Ausdehnung zeigt.
Gruppenflächen, Strukturpfeile und Wiederholungsmarkierungen bleiben unverändert. Logos und
Zeichenmarkierung verhindern eine ausschließlich farbliche Bedeutungszuordnung. Analyse,
Interaktion, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.32.0` auf `2.34.0` erhöht.

| Segment und Text-ID | Aktueller Text/Zustand | Geplanter Text/Zustand | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.page.localReflection.earlyCheckedTitle` | `Zusammenfassung` | `Früh geprüft` | Orientierung | kein | ausdrücklich verlangte Kategorienübersicht; begrenzte Umbenennung | keine |
| `S06.page.localReflection.earlyCheckedEntries` | einzelne erkannte Begriffe mit Kategorienlogo | je geprüfter Kategorie einmal großes Logo plus vollständiger Kategoriename | Orientierung | kein | ausdrücklich verlangte Kategorienübersicht ohne Einzelbefunde; begrenzt | große, responsive Kategorie-Logos |
| `S06.page.localReflection.blockFindings` | Befundtexte unter den Bausteinen | deutlich größere, vertikal gestapelte Logos der übergeordneten Kategorien | Ergebnisfeedback | kein | hält die Kategorienzuordnung direkt am Baustein; Befunde bleiben unverändert | Kategorie-Logos |
| `S06.page.localReflection.personalMarking` | rosa-violetter Bereichsrahmen | exakt betroffene Zeichen leuchten lila-pink; Kategorienlogo unter jedem überlappten Baustein | Ergebnisfeedback | persönliche Bereichsauswahl bleibt unverändert | zeigt den ausgewählten Bereich ohne Änderung der Bausteingrenzen; keine Bedeutungsänderung | lila-pinke Zeichen plus Kategorienlogo |

Bestehende Sprechschritte und geschützter Wortlaut bleiben unverändert.

## Copy- und Darstellungsdelta S06 Vierer-Gruppenpalette und Gruppenlimit, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. Dieses Delta ersetzt die zuvor
am selben Tag festgelegte Sechser-Palette und Obergrenze. S06 übernimmt stabil geordnet genau
`#1E8449`, `#52BE80`, `#A9DFBF` und `#E8F8F0` aus S05; Gruppe 1 verwendet `#1E8449` als
Basisfarbe. Weitere Gruppenfarben werden nicht zyklisch wiederholt.

Die Gruppenerweiterung ist in Controller und Oberfläche auf vier Gruppen begrenzt. Sobald die
vierte Gruppe vorhanden ist, wird der bisherige Plus-Button zum nicht interaktiven Hinweis
`Max. 4 Gruppen`. Analyse, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.31.0` auf `2.32.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.page.localReflection.maxGroups` | Nutzerauftrag vom 2026-08-23 | `Max. 6 Gruppen` | `Max. 4 Gruppen` | Ergebnisfeedback / Orientierung | synchronisiert den sichtbaren Hinweis mit der ausdrücklich reduzierten Obergrenze | begrenzt | kein; ersetzt den deaktivierten Plus-Button bei vier Gruppen | keine |

Geschützter Wortlaut und bestehende Sprechschritte bleiben unverändert.

## Copy- und Darstellungsdelta S06 gruene Gruppenpalette und Gruppenlimit, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. S06 übernimmt dieselbe feste,
stabil geordnete Skala aus sechs klar unterscheidbaren Grüntönen wie S05. Die Gruppenflächen der
Passwortbausteine und die zugehörigen Gruppenbuttons verwenden damit dieselbe visuelle Zuordnung;
die bisherige mehrfarbige Palette mit blauem Ausgangston entfällt. Ab vier Gruppen werden Höhe,
Innenabstand und Zwischenraum der Gruppenbuttons stufenweise reduziert, damit die aufgeklappte
Liste innerhalb der angenommenen Fenstergrößen bleibt.

Die Gruppenerweiterung ist in Controller und Oberfläche auf sechs Gruppen begrenzt. Sobald die
sechste Gruppe vorhanden ist, wird der bisherige Plus-Button zum nicht interaktiven Hinweis
`Max. 6 Gruppen`. Analyse, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` wird von `2.30.0` auf `2.31.0` erhöht.

| Segment und Text-ID | Quelle | Aktueller Text | Geplanter Text | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel | Hervorhebung |
|---|---|---|---|---|---|---|---|---|
| `S06.page.localReflection.maxGroups` | Nutzerauftrag vom 2026-08-23 | nicht vorhanden; Plus-Button bleibt nach weiteren Gruppen sichtbar | `Max. 6 Gruppen` | Ergebnisfeedback / Orientierung | macht die ausdrücklich vorgegebene Obergrenze direkt am bisherigen Erweiterungsziel sichtbar | begrenzt | kein; ersetzt den deaktivierten Plus-Button bei sechs Gruppen | keine |

Geschützter Wortlaut und bestehende Sprechschritte bleiben unverändert.

## Copy-Delta S06 Transition-Karte, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. Ausschließlich die Überschrift
der letzten S06-Transition-Karte wird umbenannt. Ablauf, Bedingungen, Interaktion, Hervorhebung,
Analyse, Persistenz, Export und Timing bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.29.0` auf `2.30.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.transition.s07.heading` | `Passwort sicher ersetzen` | `Betroffenes Passwort ersetzen` | Orientierung | bestehender Passwortwechsel bei Campusgram | ausdrücklich vorgegebene Umbenennung; begrenzt | keine |

## Copy-Delta S06-S07 eigene Passwoerter, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. Ausschließlich die unten
benannten sichtbaren Texte werden ersetzt. Ablauf, Bedingungen, IDs, Interaktion, Analyse,
Persistenz, Export und Timing bleiben unverändert. Bestehende Hervorhebungen bleiben an den
jeweils entsprechenden neuen Textteilen erhalten. `S06_CONSEQUENCE_CONTENT_VERSION` steigt von
`2.28.0` auf `2.29.0`; `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von `4.18.0` auf `4.19.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.local-check.campus-email-found` | bisherige Einordnung zu Einzigartigkeit und Stärke | `Auch dieses Passwort gilt hier als gefunden. Vom bekannten Passwort führte aber kein direkter Weg zu diesem Konto. Trotzdem sollte jedes Passwort auch für sich schwer zu erraten sein.` | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebener Wortlaut; begrenzt | keine |
| `S07.guide.methodIntro` | `… Ein solches Passwort nennt man Passphrase.` | `… Ein Passwort aus mehreren Wörtern nennt man Passphrase.` | Mechanismuserklärung | `Weiter` | ausdrücklich vorgegebener Wortlaut; begrenzt | `Passphrase`, Akzent bleibt erhalten |
| `S07.guide.accountSummary.easyToGuess` | `Die anderen Kontopasswörter sind bereits einzigartig. Mindestens eines lässt sich aber noch leicht erraten.` | `Die anderen Konten verwenden bereits jeweils ein eigenes Passwort. Mindestens eines lässt sich aber noch leicht erraten.` | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebener Wortlaut; begrenzt | keine |
| `S07.guide.accountSummary.clear` | `Die anderen Kontopasswörter sind bereits einzigartig und schwer zu erraten.` | `Die anderen Konten verwenden bereits eigene Passwörter, die sich schwer erraten lassen.` | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebener Wortlaut; begrenzt | keine |
| `S07.browser.campusgramPasswordChangeCompleted.shieldLabels.green` | `Einzigartig` | `Nur für dieses Konto` | Ergebnisfeedback | kein | ausdrücklich vorgegebener Wortlaut; begrenzt | bestehender grüner Schild bleibt erhalten |
| `S07.browser.searchPage.results.netzblick.description` | `Praktische Orientierung zu Länge, Einzigartigkeit und Merkbarkeit …` | `Praktische Orientierung zu Länge, eigenen Passwörtern und Merkbarkeit …` | Orientierung | kein | ausdrücklich vorgegebener Wortlaut; begrenzt | keine |
| `S07.browser.searchPage.results.privacy-labor.title` | `Passphrase kompakt: zufällig, lang und einzigartig` | `Passphrase kompakt: zufällig, lang und für jedes Konto anders` | Orientierung | kein | ausdrücklich vorgegebener Wortlaut; begrenzt | keine |

## Copydelta S06 kurzes Grenzergebnis bei weiteren Konten, 22. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 22. August 2026. S06 übernimmt den neuen letzten
Fundweg aus derselben lokalen Disposition wie S05. Bei Master Campus und Campus E-Mail erklärt
PassWo das vollständige Durchprobieren nicht erneut, sondern nennt unmittelbar, ob es innerhalb
oder außerhalb der bereits eingeführten Grenze liegt. Andere konkrete Fundwege behalten ihre
bestehende knappe Rückmeldung. Die allgemeinen Statusbezeichnungen sprechen deshalb nicht mehr
nur von einem frühen Kandidaten. Persistenz, Export, Timing und die S07-Auswertung bleiben
unverändert. `S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.26.0` auf `2.27.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung |
|---|---|---|---|---|
| `S06.perspective.master-campus-exhaustive-found` | nicht vorhanden | `Das Durchprobieren liegt innerhalb der Grenze. Das Master-Campus-Passwort gilt hier als gefunden. Prüfen wir, ob es bei Campus E-Mail weiterführt.` | Ergebnisfeedback / Navigation | Ergebnis ohne erneute Methodenerklärung |
| `S06.perspective.master-campus-blocked` | allgemeines Nichtgefunden-Ergebnis | unmittelbare Aussage, dass das Durchprobieren außerhalb der Grenze liegt; anschließender hypothetischer Vergleich bleibt erhalten | Ergebnisfeedback / Safety Boundary | begründet den Status mit dem tatsächlich maßgeblichen letzten Weg |
| `S06.local-check.campus-email-exhaustive-found` | nicht vorhanden | `Das Durchprobieren liegt innerhalb der Grenze. Auch dieses Passwort gilt hier als gefunden.` | Ergebnisfeedback | kurze kontospezifische Rückmeldung |
| `S06.local-check.campus-email-blocked` | allgemeines Nichtgefunden-Ergebnis mit positiver Wertung | `Das Durchprobieren liegt außerhalb der Grenze. Dieses Passwort gilt hier nicht als gefunden.` | Ergebnisfeedback / Safety Boundary | entfernt die pauschale positive Bewertung und nennt nur das begrenzte Ergebnis |


## Copy-Delta S07 aggregierte Kontenzusammenfassung, 22. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 22. August 2026. Nach dem Campusgram-Wechsel
fasst PassWo die vorhandenen S06-Ergebnisse nur noch in den vier Kombinationen aus offenen
Wiederverwendungen oder Ähnlichkeiten und lokaler Erratbarkeit zusammen. Konkrete Konten und
Verbindungen bleiben im Netzwerk sichtbar und werden nicht mehr in der Sprechblase aufgezählt.
Bei vollständig einzigartigen und nicht leicht erratbaren Kontopasswörtern folgt keine zweite
Sprechblase; bei jedem anderen Zustand verweist sie auf die direkte Absicherung im Netzwerk.
Erkennung, Netzwerkdarstellung, Persistenz, Angriffssimulation und Navigation bleiben unverändert.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `4.15.0` auf `4.16.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.accountSummary` | 13 Beziehungstexte mit vier Erratbarkeits-Zusätzen | vier aggregierte Zustände zu Wiederverwendung oder Ähnlichkeit und Erratbarkeit | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebene Verdichtung; die zugrunde liegenden Befunde bleiben unverändert | keine |
| `S07.guide.remainingPlan` | `Schau dir jetzt an, was der Angriff noch erreichen kann. Offene Konten kannst du dort direkt mit einer eigenen Passphrase absichern.` | `Du kannst die betroffenen Konten im Netzwerk jetzt direkt mit einer eigenen Passphrase absichern.` | Navigation | betroffene Konten im Netzwerk | ausdrücklich vorgegebener Wortlaut; keine neue Handlung | keine |
| `S07.guide.allAccountsProtected` | `Auch deine anderen Konten sind bereits stark und einzigartig. Schau dir jetzt an, wie der Angriff mit deinen geschützten Konten endet.` | entfällt | Ergebnisfeedback | `kein` | bei Zustand ohne offenen Befund ausdrücklich keine zweite Sprechblase | keine |

## Copy-Delta S07 Passphraseneinstieg präzisiert, 22. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 22. August 2026. Die beiden ersten S07-
Sprechblasen erhalten den vorgegebenen Wortlaut. Die erste erklärt die sechs zufälligen,
voneinander unabhängigen Wörter und benennt die Methode; ausschließlich `Passphrase` wird
akzentuiert. Die zweite verweist auf den eingeblendeten Browser als tatsächliches
Interaktionsziel. Ablauf, Darstellung, Persistenz, Export und Timing bleiben unverändert.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` wird von `4.14.0` auf `4.15.0` erhöht.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.methodIntro` | `Die Passphrase ist genau die Methode für starke Passwörter aus Wörtern, die wir heute schon angesprochen haben. Sie besteht aus mindestens sechs zufällig ausgewählten, voneinander unabhängigen Wörtern.` | `Für das neue Campusgram-Passwort nutzen wir jetzt sechs zufällige, voneinander unabhängige Wörter. Ein solches Passwort nennt man Passphrase.` | Mechanismuserklärung | `Weiter` | ausdrücklich vorgegebener Wortlaut | `Passphrase`, Akzent |
| `S07.guide.searchIntro` | `Lass dir online eine Passphrase generieren und ersetze damit das betroffene Passwort.` | `Lass dir hier im eingeblendeten Browser eine solche Passphrase generieren und ersetze damit das betroffene Passwort.` | Navigation | eingeblendeter Browser | ausdrücklich vorgegebener Wortlaut mit konkretem UI-Ziel | keine |

## Copy-Delta S07 priorisierte Relationsverdichtung, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026. Die gemeinsame
Kontenzusammenfassung zählt nicht mehr alle sichtbaren Relationskanten auf. Beziehungen zum alten
Campusgram-Passwort haben sprachlich Priorität und werden nach identischer Wiederverwendung und
Ähnlichkeit unterschieden. Die direkte Beziehung zwischen Master Campus und Campus E-Mail wird
nur genannt, wenn ihre Lage nicht bereits durch die priorisierten Campusgram-Beziehungen
ausreichend beschrieben ist. Die lokale Erratbarkeit folgt einmal aggregiert in einem optionalen
zweiten Satz. Dadurch umfasst die Rückmeldung höchstens zwei Sätze und beschreibt keine Kante aus
mehreren Perspektiven. Die vollständige Relation bleibt weiterhin visuell im Netzwerk sichtbar.

Persistenz, Export, Timing und die S08-Empfehlung bleiben unverändert.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von `4.13.0` auf `4.14.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.accountSummary.relationships` | je nach Befund bis zu drei nacheinander genannte Relationsaussagen | priorisierte Zustandsbeschreibung mit Beziehungen zum alten Campusgram-Passwort zuerst; direkte Master-Campus-/Campus-E-Mail-Beziehung nur bei zusätzlichem Erkenntniswert | Ergebnisfeedback | `Weiter` | entfernt die ausdrücklich benannte redundante Kantenaufzählung; keine Änderung der Befunde | keine |
| `S07.guide.accountSummary.mixed-example` | `Das Passwort von Master Campus ähnelt noch dem alten Campusgram-Passwort. Die Campus E-Mail verwendet noch das alte Campusgram-Passwort. Die Passwörter von Master Campus und Campus E-Mail ähneln sich noch. Beide Passwörter lassen sich außerdem noch leicht erraten.` | `Die Campus E-Mail verwendet noch das alte Campusgram-Passwort, und das Passwort von Master Campus ähnelt ihm noch. Beide Passwörter lassen sich außerdem leicht erraten.` | Ergebnisfeedback | `Weiter` | ausdrücklich freigegebene Verdichtung des konkreten Mischfalls auf zwei Sätze | keine |

## Copy-Delta S07 kompakte Kontenzusammenfassung, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026. Kurz vor dem Übergang nach S08
fasst PassWo die flüchtigen S06-Befunde nicht mehr in bis zu zwei kontoweisen Absätzen zusammen,
sondern in genau einer gemeinsamen Ergebnisrückmeldung. Die freigegebenen Varianten bilden die
acht möglichen offenen Beziehungsmuster zwischen Master Campus, Campus E-Mail und dem alten
Campusgram-Passwort sowie die vier Kombinationen der lokalen Befunde `leicht erratbar` ab.
`exact-match` wird dabei weiterhin ausdrücklich als identische Wiederverwendung benannt;
`derived-variant-match` bleibt als Ähnlichkeit formuliert. Die Rückmeldung verändert weder die
bestehende Empfehlung für S08 noch Persistenz, Export oder Timing. Auch ohne offenen Befund wird
vor der bestehenden S08-Navigation die dafür gelieferte Variante `Keine offene Verbindung`
angezeigt.

`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von `4.12.0` auf `4.13.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.accountFeedback.*` → `S07.guide.accountSummary` | bis zu zwei kontoweise Texte zu Stärke, Einzigartigkeit, Ähnlichkeit und Erratbarkeit | eine der 32 ausdrücklich gelieferten gemeinsamen Varianten zu offenen Beziehungen und Erratbarkeit | Ergebnisfeedback | `Weiter` | entfernt die ausdrücklich benannte Redundanz und fasst die Lage der Konten in einer Sprachblase zusammen; keine Änderung der zugrunde liegenden Befunde | keine |
| `S07.guide.accountSummary.exact-match` | identische Wiederverwendung wurde in der bisherigen Rückmeldung nur als Ähnlichkeit bezeichnet | `Master Campus und Campus E-Mail verwenden noch dasselbe Passwort.`, `Master Campus verwendet noch das alte Campusgram-Passwort.` beziehungsweise `Die Campus E-Mail verwendet noch das alte Campusgram-Passwort.` | Ergebnisfeedback | `Weiter` | übernimmt die ausdrücklich freigegebenen Ersatzformulierungen und erhält die fachliche Unterscheidung aus S06; begrenzte Bedeutungspräzisierung | keine |

## Copy- und Analysedelta S06 strukturorientierte Bausteinersetzung, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026 nach dem Fehlfall
`PrflbildBonn!` ↔ `PrflbildCampus!`. Die vorherige gerichtete Variantenlogik konnte zwar
Konto-/Dienstbegriffe, Randentfernungen und kleine Oberflächenänderungen erzeugen, aber keinen
einzelnen frei gewählten Wortbaustein im ansonsten stabilen Passwortmuster austauschen. Zusätzlich
konnte die zeichenbasierte LCS-Differenz einen intuitiven Worttausch wie `Kaffee` → `Tasse` in
mehrere unzusammenhängende Zeichenhunks zerlegen. Das führte zu vom konkreten Wortlaut abhängigen
Nicht-Erkennungen.

S06 ergänzt deshalb eine strukturelle, weiterhin gerichtete Kandidatenfamilie. Buchstabenfolgen
werden lokal an Trennzeichen, Ziffer-/Buchstabenwechseln und Camel-Case-Grenzen in sichtbare
Bausteine zerlegt und auf Bausteinebene ausgerichtet. Genau ein ausgetauschter Buchstabenbaustein
mit mindestens drei Zeichen darf als Hauptveränderung verwendet werden, wenn der übrige erzeugte
Kandidat weiterhin einen stabilen gemeinsamen Kern von mindestens vier Zeichen besitzt. Kleine
Änderungen wie Trennzeichen oder typischer Anhang können zusätzlich hinzukommen. Das Oberflächenbudget
wird dabei von zwei auf drei kleine Veränderungen erweitert, damit typische Kombinationen aus
Groß-/Kleinschreibung, kurzer Zahl und Endzeichen nicht künstlich auseinanderfallen. Authored Konto-/Dienstbegriffe behalten die höhere Priorität und werden weiterhin
mit ihrem spezifischen Transformationsweg erklärt.

Die Erweiterung ist keine semantische Wortähnlichkeit, kein Wörterbuchscore und keine allgemeine
Edit-Distance. Zwei frei ausgetauschte Wortbausteine bleiben ausgeschlossen. Deshalb wird
`PrflbildBonn!` ↔ `PrflbildCampus!` als `Ähnlich` erkannt, während
`IchAnanasBinSuperTraurig` ↔ `IchBananeBinSuperGlücklich` weiterhin keinen direkten Variantenweg
erhält. `MorgenKaffee7` ↔ `MorgenTasse7` gilt nun dagegen als ein einzelner Bausteintausch im
stabilen Rahmen `Morgen…7`. Alle fiktiven Werte und Befunde bleiben ausschließlich flüchtig im
Browser.

`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.25.0` auf `2.26.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung |
|---|---|---|---|---|
| `S06.transformationLabels.bounded-component-replaced` | nicht vorhanden | `Ein einzelner klar abgegrenzter Bestandteil wurde innerhalb desselben Musters ausgetauscht.` | Mechanismuserklärung | benennt den neu zugelassenen einzelnen strukturellen Bausteintausch; begrenzte Bedeutungsänderung |
| `S06.transformationLabels.component-replacement-with-small-surface-changes` | nicht vorhanden | `Ein einzelner klar abgegrenzter Bestandteil und bis zu drei kleine typische Merkmale wurden verändert.` | Mechanismuserklärung | erklärt die bestehende Kombinationsgrenze für den neuen Hauptweg; begrenzte Bedeutungsänderung |
| `S06.transformationLabels.bounded-surface-changes` und bestehende `*-with-small-surface-changes` | `bis zu zwei kleine typische Veränderungen/Merkmale` | `bis zu drei kleine typische Veränderungen/Merkmale` | Mechanismuserklärung | erlaubt typische Kombinationen aus Groß-/Kleinschreibung, kurzer Zahl und Endzeichen, ohne die Grenze auf einen allgemeinen Ähnlichkeitsscore zu öffnen |
| lokale S06-Paarableitung | Hauptveränderungen nur authored Konto-/Dienstbegriff, Wiederholungsmuster oder Randentfernung | zusätzlich genau ein strukturell abgegrenzter Buchstabenbaustein im stabilen Muster | Analysegrenze | behebt wortlautabhängige Nicht-Erkennungen ohne globalen Ähnlichkeitsscore oder mehrere freie Wortersetzungen |

## Copy- und Analysedelta S06 gerichtete begrenzte Variantenwege, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026. Die bisherige S06-Ähnlichkeitslogik
erkannte nur den Austausch authored Konto- und Dienstbegriffe, eine auf zwei Jahre begrenzte
Jahresänderung und einen abschließenden Symbolanhang. Dadurch blieben einfache konkrete Varianten
wie `hallo` → `hallo1`, `HandyPasswort` → `Handy-Passwort`, ein entfernter Randbestandteil oder ein
gleiches Wiederholungsmuster unerkannt.

Der lokale Vergleich bleibt gerichtet und erzeugt weiterhin ausschließlich vollständige
Kandidaten. Ein Ziel gilt nur dann als `Ähnlich`, wenn es aus dem bekannten Quellpasswort durch
höchstens eine erkennbare Hauptveränderung und bis zu zwei kleine typische Veränderungen vollständig
erzeugt wird. Hauptveränderungen sind der Austausch eines Konto- oder Dienstbegriffs, der Wechsel
des Zeichens in einem vollständigen Wiederholungsmuster oder das Entfernen eines klar abgegrenzten
vorangestellten beziehungsweise angehängten Bestandteils. Kleine Veränderungen umfassen begrenzte
Jahres- und Zahlenänderungen, kurze Zahlen- oder Symbolanhänge, Groß-/Kleinschreibung, übliche
Trennzeichen, eingefrorene typische Leetspeak-Ersetzungen sowie höchstens einzelne
Zeichenoperationen. Frei erfundene Wörter oder längere Zielreste werden nicht übernommen.

Der vollständige Zielwert muss getroffen werden. Eine gemeinsame Teilzeichenfolge oder derselbe
allgemeine Satzrahmen reichen nicht. Deshalb bleibt
`IchAnanasBinSuperTraurig` → `IchBananeBinSuperGlücklich` ohne erkannten direkten Variantenweg.
`Passwort49u52u` → `Passwort` ist dagegen ein gerichteter Entfernungsweg; die Gegenrichtung wird
nicht erkannt, weil der unbekannte Anhang nicht aus `Passwort` abgeleitet werden kann. Alle Werte,
Transformationen und Ergebnisse bleiben flüchtig im Browser und werden weder persistiert noch
exportiert.

`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.24.0` auf `2.25.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Grund und Bedeutungsänderung |
|---|---|---|---|---|
| `S06.comparisonResultLabels.no-derived-path-recognized` | `Keine Übereinstimmung` | `Keine direkte Variante erkannt` | Ergebnisfeedback / Safety Boundary | vermeidet die zu absolute Aussage, es bestehe keinerlei Gemeinsamkeit; benennt ausschließlich, dass der begrenzte gerichtete Kandidatengenerator keinen vollständigen Weg fand |
| `S06.transformationLabels.*` | sieben enge Konto-, Jahres- und Anhangswege | konkrete Labels für Randbestandteil, Wiederholungsmuster, Trennzeichen, Groß-/Kleinschreibung, typische Zeichenersetzung, einzelne Zeichenoperation und begrenzte Kombinationen | Mechanismuserklärung | erklärt den tatsächlich erzeugten vollständigen Kandidaten statt eines Ähnlichkeitsscores |
| lokale S06-Paarableitung | bis zu Kontoersetzung, Jahresänderung und Symbolanhang | höchstens eine Hauptveränderung plus bis zu zwei kleine typische Veränderungen | Analysegrenze | erweitert klar erkennbare Alltagsvarianten, ohne semantische Wortersetzung oder prozentuale Ähnlichkeit einzuführen |

## Copy- und Darstellungsdelta S06 persönliche Bereiche, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026. Unter `Struktur` ergänzt die
lokale Passwortreflexion den rosa umrandeten Modus `Persönliches`. Er zeigt das fiktive Passwort
als zusammenhängende Zeichenkette und erlaubt dieselbe flüchtige Bereichsauswahl wie S05. Beim
Verlassen werden persönliche Grenzen in die bestehende Bausteinprojektion übernommen; vorhandene
Gruppen und Strukturpfeile werden nur auf weiterhin überlappende beziehungsweise angrenzende
Bausteine abgebildet. Eine entfernte Grenze hinterlässt deshalb keine ungültige Referenz.

Persönliche Bereiche erhalten die bestehende rosa-violette Kategoriefläche, solange keine
Gruppe den Baustein ausgewählt hat. Eine Gruppenfläche hat Darstellungspriorität; das untere
Label `Persönliche Angabe` bleibt als zusätzlicher, nicht ausschließlich farblicher
Bedeutungsträger sichtbar. Angaben bleiben flüchtig und werden weder persistiert noch exportiert.
Analyseverträge, Studien-Timing und Ablauf bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.22.0` auf `2.24.0`.

Der präzisierende Nutzerauftrag vom selben Tag begrenzt die persönliche Zeichenkettenansicht auf
die bestehende Passwortfläche und lässt deren Hintergrund transparent. `Gruppe` und `Struktur`
stehen gleichrangig nebeneinander; `Persönliches` folgt darunter über die gemeinsame Breite statt
als zweite Hälfte neben `Struktur`. Der kleine, durchscheinende Button `Übernehmen` beendet die
persönliche Auswahl. Der direkte Wechsel zu Gruppe oder Struktur übernimmt denselben flüchtigen
Zwischenstand ebenfalls.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.page.localReflection.personalMode` | nicht vorhanden | `Persönliches` | Navigation | flüchtige persönliche Bereichsauswahl | ausdrücklich benannte neue Moduswahl; begrenzt | rosa Umrandung und aktiver Zustand |
| `S06.page.localReflection.personalSelectionLabel` | nicht vorhanden | `Persönliche Angaben im fiktiven Passwort markieren` | Navigation (barrierefreier Name) | Zeichenbereich im fiktiven Passwort | eindeutige Handlungszuordnung für Tastatur und Assistenztechnik; begrenzt | keine |
| `S06.page.localReflection.personalApply` | nicht vorhanden | `Übernehmen` | Navigation | persönliche Auswahl übernehmen und zur Gruppenansicht wechseln | ausdrücklich verlangte sichtbare Bestätigung; begrenzt | kleiner durchscheinender Button |

## Darstellungsdelta S06 Gruppenflächen statt Kategorieflächen, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026. Die Bausteine der lokalen
Passwortreflexion bei Master Campus und Campus E-Mail beginnen mit transparenter Fläche und
neutralem Rand. Automatisch erkannte Kategorien färben die Bausteinfläche nicht mehr. Erst eine
flüchtige Gruppenzuordnung färbt die gesamte Fläche des betreffenden Bausteins in der stabilen
Gruppenfarbe; die Gruppe wird nicht mehr ausschließlich durch einen farbigen Rand dargestellt.
Wiederholungsrahmen, Strukturpfeile, sichtbare Befundlabels und `aria-pressed` bleiben als
zusätzliche, nicht ausschließlich farbliche Bedeutungsträger erhalten. Teilnehmertext,
Content-Version, Analyse, Persistenz, Export und Studien-Timing ändern sich nicht.

## Copy- und Ablaufdelta S06 kompakter Sprechablauf, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026. Er ersetzt den bisherigen
PassWo-Sprechablauf von S06 vollständig. Die neue Fassung nennt Ergebnis und unmittelbare
Bedeutung kürzer, führt beim Master-Campus-Perspektivwechsel nur noch den ausdrücklich
angekündigten Vergleich mit Campus E-Mail aus und geht nach dessen lokalem Einzelcheck ohne
zusätzliche Campus-E-Mail-Einleitung, Rückkehransage oder zweite Endübersicht direkt zum
Folgenschutz in S07 über.

Die hypothetischen Befallanimationen bleiben als eindeutig gekennzeichnete Darstellung erhalten,
erzeugen aber keine zusätzliche Sprechblase mehr: Die jeweilige Nicht-Erkennungsblase enthält die
Annahme bereits. Vor dem letzten S07-Sprechschritt stellt der Controller weiterhin die tatsächliche
Campusgram-Ausgangslage her. Persistenz, Export, Timinggrenzen und Analyseentscheidung bleiben
unverändert. `S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.20.0` auf `2.21.0`.

Der ergänzende Nutzerauftrag vom selben Tag bindet das lokale Ergebnis sichtbar an genau den
Sprechmoment, der es benennt: Sobald die Master-Campus- beziehungsweise Campus-E-Mail-Blase den
Fund oder die Nicht-Erkennung erklärt, verschwindet die Reflexionsfläche und das Kontonetz zeigt
gleichzeitig entweder den roten betroffenen Kontozweig oder den geschützten Kontozweig samt
Schutzschild. Der bisher nachgelagerte lokale Animationsschritt entfällt; der folgende Button
startet nur noch den angekündigten Vergleich beziehungsweise den Übergang. Wortlaut,
Analyseentscheidung, Persistenz, Export und Content-Version bleiben dadurch unverändert.

Ein weiterer Nutzerauftrag vom selben Tag ergänzt nach dem aufgelösten Vergleich von Master
Campus zu Campus E-Mail genau eine bedingte Überleitung. Bei `exact-match` oder
`derived-variant-match` benennt sie die erkannte Verbindung und ihre mögliche Ausbreitungswirkung;
bei `no-derived-path-recognized` benennt sie die begrenzte Nicht-Erkennung. Beide Varianten führen
mit `Weiter` in den lokalen Campus-E-Mail-Check. Persistenz, Export, Timinggrenzen und
Analyseentscheidung bleiben unverändert. `S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.21.0`
auf `2.22.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.incident.campusgram-found` | `Da der Angreifer nun das Campusgram-Passwort kennt …` | `Das Campusgram-Passwort ist nun bekannt. Der Angreifer kann es und ähnliche Varianten jetzt auch bei den anderen Konten ausprobieren.` | Mechanismuserklärung | `Angriff starten` | ausdrücklich vorgegebener, kompakter Einstieg; begrenzt | keine |
| `S06.narrations.s06.incident.campusgram-blocked` | Nicht-Erkennung und offene Was-wäre-wenn-Frage | `Das Campusgram-Passwort wurde hier nicht gefunden. Schauen wir trotzdem kurz, was passiert wäre, wenn es bekannt geworden wäre.` | Orientierung | `Weiter` zur hypothetischen Darstellung | übernimmt die bisher zweite Hypothese-Blase; ausdrücklich freigegebene Ablaufänderung | keine |
| `S06.narrations.s06.summary.actual-none/one/both` | bisherige tatsächliche Ergebnisvarianten | die drei ausdrücklich vorgegebenen Varianten `Hier bleibt …`, `Bei einem weiteren Konto …` und `Bei beiden anderen Konten …` | Ergebnisfeedback | `Weiter` | erklärt Ausbreitung unmittelbar am sichtbaren Ergebnis; ausdrücklich freigegeben | keine |
| `S06.narrations.s06.summary.hypothetical-none/one/both` | bisherige hypothetische Ergebnisvarianten | die drei ausdrücklich vorgegebenen Varianten `Wäre das Campusgram-Passwort bekannt geworden …` | Ergebnisfeedback | `Weiter` | verkürzt den Kontrast ohne Sicherheitsgarantie; ausdrücklich freigegeben | keine |
| `S06.narrations.s06.transition` | mehrsätziger allgemeiner Perspektivwechsel | `Ein Datenleck kann bei jedem Konto beginnen. Schauen wir deshalb noch von Master Campus aus.` | Orientierung | `Weiter` zur lokalen Master-Campus-Reflexion | benennt exakt den nächsten sichtbaren Ausgangspunkt; ausdrücklich freigegeben | keine |
| `S06.narrations.s06.perspective.master-campus-found` | Fund und angekündigte Vergleiche mit Campusgram und Campus E-Mail | `Das Master-Campus-Passwort gilt hier ebenfalls als gefunden. Prüfen wir, ob es bei Campus E-Mail weiterführt.` | Ergebnisfeedback / Navigation | `Angriff starten` | beschränkt Text und Ablauf auf den angekündigten Vergleich; ausdrücklich freigegeben | keine |
| `S06.narrations.s06.perspective.master-campus-blocked` | Nicht-Erkennung und spätere separate Hypothese-Blase | `Das Master-Campus-Passwort wurde hier nicht gefunden. Für den Vergleich nehmen wir kurz an, es wäre bekannt geworden.` | Ergebnisfeedback / Orientierung | `Angriff starten` | integriert die Annahme und entfernt eine redundante Blase; ausdrücklich freigegeben | keine |
| `S06.narrations.s06.transition.master-campus-email-match` | nicht vorhanden | `Zwischen Master Campus und Campus E-Mail wurde ein gleiches oder ähnliches Passwort erkannt. Dieser Weg könnte den Angriff auf Campus E-Mail ausweiten. Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.` | Ergebnisfeedback / Orientierung | `Weiter` zum lokalen Campus-E-Mail-Check | ordnet die sichtbare Übereinstimmung ein und benennt den nächsten Schritt; ausdrücklich freigegeben | keine |
| `S06.narrations.s06.transition.master-campus-email-no-match` | nicht vorhanden | `Zwischen Master Campus und Campus E-Mail wurde hier keine solche Übereinstimmung erkannt. Dieser Weg führt in dieser Übung nicht weiter. Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.` | Ergebnisfeedback / Orientierung | `Weiter` zum lokalen Campus-E-Mail-Check | ordnet die begrenzte Nicht-Erkennung ein und benennt den nächsten Schritt; ausdrücklich freigegeben | keine |
| `S06.narrations.s06.local-check.campus-email-found` | begrenzter früher Kandidat mit allgemeiner Stärkeeinordnung | `Auch dieses Passwort gilt hier als gefunden. Einzigartigkeit verhindert die Ausbreitung zwischen Konten, trotzdem sollte jedes Passwort auch für sich stark sein.` | Ergebnisfeedback / Kerngedanke | `Weiter` | verbindet Einzelstärke und Einzigartigkeit im vorgegebenen Wortlaut; ausdrücklich freigegeben | keine |
| `S06.narrations.s06.local-check.campus-email-blocked` | begrenzte Nicht-Erkennung mit allgemeiner Sicherheitsgrenze | `Dieses Passwort wurde hier nicht gefunden. Das ist ein gutes Ergebnis für diese Übung.` | Ergebnisfeedback | `Weiter` | wertet nur das Übungsergebnis und verspricht keine Sicherheit; ausdrücklich freigegeben | keine |
| `S06.narrations.s06.transition.s07` | allgemeiner Hinweis zum Ersetzen des betroffenen Passworts | `Ein Datenleck lässt sich nicht immer verhindern. Danach zählt, die Folgen zu begrenzen: das betroffene Passwort zügig ersetzen und Wiederverwendung stoppen. Genau das machen wir jetzt bei Campusgram.` | Kerngedanke / Navigation | `Passwort ersetzen` | verbindet Schadensbegrenzung direkt mit der nächsten sichtbaren Handlung; ausdrücklich freigegeben | `zügig ersetzen und Wiederverwendung stoppen`, Akzent |
| bisherige Zusatzblasen und Master-Campus-zu-Campusgram-Vergleich | separate Campusgram-/Master-Hypothese, Campus-E-Mail-Einleitung, Rückkehransage, zweite Endübersicht und zusätzlicher Vergleich | entfallen aus dem sichtbaren Ablauf | Ablaufreduktion | kein | setzt die ausdrücklich vorgegebene Reihenfolge ohne redundante oder widersprüchliche Schritte um; Bedeutungsänderung ausdrücklich freigegeben | keine |

## Copy-, Interaktions- und Darstellungsdelta S06 Passwortreflexion, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026. In der lokalen Passwortreflexion
für Master Campus und Campus E-Mail werden automatisch erkannte Befundlabels kompakter unter den
jeweiligen Bausteinen dargestellt, ohne deren horizontale Abstände zu vergrößern. Gruppenfarben
markieren in S05 und S06 ausschließlich den Rand; die vorhandene Kategoriefläche im Inneren bleibt
sichtbar. Die S06-Reflexion liegt für beide Konten weiter rechts.

Der Strukturmodus übernimmt die S05-Interaktion: Ein Baustein schaltet die gerichtete Verbindung
zum unmittelbar folgenden Baustein. Aktive Verbindungen werden als zusammenhängende Pfeilläufe
gerendert und einzeln als flüchtige Satz-/Phrasenbeziehung ausgewertet. Wiederholte Bausteine
behalten ihren gemeinsamen weißen Rand, aber nur der erste Baustein einer Wiederholungsgruppe
zeigt den Multiplikator. Das redundante untere Label `Wiederholung` entfällt. Persistenz, Export,
Studien-Timing und die begrenzte Passwortanalyse ändern sich nicht.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.19.0` auf `2.20.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.page.localReflection.repetitionFinding` | `Wiederholung` unter jedem betroffenen Baustein | entfällt; Wiederholung bleibt durch gemeinsamen Rand und einmaliges `×N` sichtbar | Ergebnisfeedback | kein | entfernt ausdrücklich benannte Redundanz und unnötige kognitive Last; keine fachliche Bedeutungsänderung | weißer Rand und `×N` am ersten Baustein |

## Copy- und Ablaufdelta S06 lokale Reflexion vor weiteren Datenlecks, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026. Beim Wechsel des fiktiven
Datenlecks zu Master Campus und später zu Campus E-Mail bleiben zunächst nur der jeweilige
Kontoknoten und das zugehörige fiktive Passwort sichtbar. Die bereits lokal erkannten Kategorien
und Wiederholungen sind markiert. Die Person kann über die beiden Modi `Gruppen` und `Struktur`
zusätzliche flüchtige Zusammenhänge angeben und bestätigt sie mit `Fertig`. Erst danach verwendet
die unveränderte begrenzte Passwortanalyse genau diese bestätigte Information und PassWo erklärt
das lokale Ergebnis. `Angriff starten` blendet die Passwortansicht aus, stellt das Kontennetz
wieder her und setzt den bisherigen S06-Ablauf fort. Für Campus E-Mail bleibt der anschließend
ausgeführte Ablauf ein lokaler Einzelcheck ohne ausgehende Kontoprüfung.

Die Angaben werden weder persistiert noch exportiert und bleiben außerhalb des globalen
Machine-Contexts. Persistenz, Export und Studien-Timing ändern sich nicht.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.17.0` auf `2.18.0`.

Der ergänzende Nutzerauftrag vom 17. August 2026 präzisiert die Darstellung: Der aktive
Kontozweig bleibt mit seinen Unterkonten sichtbar. Kontologo und Titel stehen über dem Passwort.
Die Modussteuerung, `Fertig` und die aus S05 übernommene Gruppensteuerung mit `Gruppe 1` und
Plus-Button bilden eine kompakte, horizontal zentrierte Reihe. Die fachliche Auswertung und alle
bestehenden PassWo-Texte bleiben unverändert. `S06_CONSEQUENCE_CONTENT_VERSION` steigt dafür von
`2.18.0` auf `2.19.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.page.localReflection.modeLabel` | neu | `Modus:` | Orientierung | Moduswahl | ausdrücklich verlangte Zuordnung der beiden vorhandenen Reflexionsarten; begrenzt | keine |
| `S06.page.localReflection.groupLabel` | `Gruppen` | `Gruppe 1` | Navigation | erste aktive Inhaltsgruppe | gleicht Benennung und Gruppenmechanik ausdrücklich an S05 an; begrenzt | aktive S05-Gruppenform |
| `S06.page.localReflection.newGroup` | neu | `Neue Gruppe` | Navigation | Plus-Button | übernimmt die vorhandene S05-Gruppenerweiterung; begrenzt | Plus-Button |
| `S06.page.localReflection.passwordTitles.master-campus` | neu | `Master Campus-Passwort` | Orientierung | kein | ordnet Logo und Passwortfläche eindeutig dem aktiven Konto zu; begrenzt | Kontologo |
| `S06.page.localReflection.passwordTitles.campus-email` | neu | `Campus E-Mail-Passwort` | Orientierung | kein | ordnet Logo und Passwortfläche eindeutig dem aktiven Konto zu; begrenzt | Kontologo |
| `S06.page.localReflection.structureMode` | neu | `Struktur` | Navigation | Strukturmodus | ausdrücklich benannter Modus; begrenzt | aktive Buttonform |
| `S06.page.finish` | `Fertig` | wortgleich, zusätzlich in beiden lokalen Reflexionsschritten | Navigation | bestätigte flüchtige Zusatzinformation übernehmen | ordnet die bestehende Handlung dem neuen sichtbaren Schritt zu; keine Bedeutungsänderung | Primärbutton |
| `S06.page.attackStart` | `Angriff starten` | wortgleich, nach dem lokalen Ergebnis für beide Perspektiven | Navigation | Passwortansicht schließen und Netzwerksimulation starten | stimmt den Button mit der ausdrücklich verlangten Reihenfolge ab; begrenzt | Primäraktion |

## Ablaufdelta S07/S08 minimale Passwortänderungen aus S06-Befunden, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Die in S07 gezeigten Befunde zu
eigenständiger Erratbarkeit, Ähnlichkeit und Wiederverwendung bleiben vollständig und wortgleich
erhalten. Für die anschließenden offenen Konten in S08 wird daraus nun getrennt eine minimale,
deterministische Änderungsmenge abgeleitet: Ein eigenständig leicht erratbares Passwort muss
immer ersetzt werden. Eine Verbindung zum alten, geleakten Campusgram-Passwort macht das jeweils
andere Konto erneuerungspflichtig. Besteht ausschließlich eine Verbindung zwischen Master Campus
und Campus E-Mail, genügt die Änderung eines der beiden Passwörter; ist eines davon ohnehin
eigenständig leicht erratbar, wird dieses Konto gewählt, andernfalls deterministisch Master
Campus.

Teilnehmertexte, Persistenz, Export, Timing und Content-Versionen bleiben unverändert. S08 zeigt
nur für die so bestimmten Konten die vorhandene Aktion `Einzigartige Passphrase verwenden`;
nicht betroffene Konten bleiben bereits geschützt dargestellt.

Der ausdrückliche Nutzerauftrag vom 17. August 2026 präzisiert und ersetzt die zuletzt genannte
Einschränkung: Die minimale deterministische Kontomenge aus S07 ist nur noch eine Empfehlung
beziehungsweise ein Default, keine Beschränkung der in S08 erlaubten Entscheidung. S08 trennt
lokale Kontobefunde von offenen Passwortbeziehungen. Ein lokaler Befund bleibt an das betreffende
Konto gebunden. Bei einer ausschließlich relationalen Verbindung sind dagegen beide beteiligten
Konten als mögliche Änderung auswählbar.

Nach dem Ersetzen eines Passworts durch eine starke einzigartige Passphrase entfallen alle damit
gelösten inzidenten Beziehungen samt vorhandener Zerfallsanimation. Anschließend leitet S08 den
offenen Handlungsbedarf erneut aus den verbleibenden lokalen Befunden und Beziehungen ab. Das
andere Konto bleibt nur dann offen, wenn es einen eigenen lokalen Befund oder mindestens eine
weitere problematische Beziehung besitzt. Teilnehmertexte, Persistenz, Export, Studien-Timing
und Content-Versionen bleiben unverändert.

Der ergänzende Darstellungsauftrag vom 17. August 2026 entfernt in S08 den schwarzen Hintergrund
der Beziehungslabels `ähnlich`, `ähnlich zum alten`, `altes wiederverwendet` und des gleichartig
gerenderten Labels `wiederverwendet`. Die unveränderten Buchstaben erhalten stattdessen eine helle
Warnfarbe, eine dunkle Kontur und einen dezenten Schatten beziehungsweise Leuchtsaum. Dadurch
bleiben die Labels vor dem Netzwerk lesbar, ohne als schwarze Textkästen über den roten
gestrichelten Beziehungskanten zu liegen. Teilnehmertext, Content-Version, Ablauf, Persistenz,
Export und Studien-Timing bleiben unverändert.

Der ergänzende Darstellungsauftrag vom selben Tag fügt beim Auflösen einer roten gestrichelten
Beziehung eine kleine Rauchwolken-Explosion am geometrischen Mittelpunkt der betroffenen Kante
hinzu. Ein kurzer heller Impuls und mehrere graue Rauchpartikel begleiten die vorhandene
460-Millisekunden-Zerfallsanimation; andere Kanten bleiben unberührt. Bei `prefers-reduced-motion`
entfällt der zusätzliche Effekt vollständig. Teilnehmertext, Content-Version, Ablauf,
Persistenz, Export und Studien-Timing bleiben unverändert.

## Copy-Delta S06 Rückkehr zur Ausgangslage, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Der letzte Sprechschritt vor der
Rückkehr fasst nun die gezeigte Wirkung von Wiederverwendung und ähnlichen Passwörtern zusammen.
Erst sein vorhandener `Weiter`-Button stellt die tatsächliche Campusgram-Ausgangslage wieder her.
Die vier dort möglichen tatsächlichen Ergebnisvarianten beginnen einheitlich mit `Zurück zu
unserer Ausgangslage:`. Hypothetische Zwischenzusammenfassungen bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.16.0` auf `2.17.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.transition.return-to-campusgram` | `Damit sind alle drei Ausgangslagen betrachtet. Als Nächstes kehren wir zur tatsächlichen Ausgangslage mit dem Datenleck bei Campusgram zurück.` | `Damit haben wir gesehen, warum Wiederverwendung und ähnliche Passwörter ein Datenleck auf weitere Konten ausweiten können.` | Kerngedanke | `Weiter` zur tatsächlichen Campusgram-Ausgangslage | ausdrücklich freigegebene Zusammenfassung; Bedeutungsänderung freigegeben | keine |
| `S06.narrations.s06.summary.actual-none` | bisherige tatsächliche Ergebnisvariante | beginnt mit `Zurück zu unserer Ausgangslage:`; restlicher Wortlaut bleibt erhalten | Ergebnisfeedback | `Weiter` | macht den vollzogenen Ansichtswechsel in jeder Variante eindeutig; begrenzt | keine |
| `S06.narrations.s06.summary.actual-one` | bisherige tatsächliche Ergebnisvariante | beginnt mit `Zurück zu unserer Ausgangslage:`; restlicher Wortlaut bleibt erhalten | Ergebnisfeedback | `Weiter` | macht den vollzogenen Ansichtswechsel in jeder Variante eindeutig; begrenzt | keine |
| `S06.narrations.s06.summary.actual-both` | bisherige tatsächliche Ergebnisvariante | beginnt mit `Zurück zu unserer Ausgangslage:`; restlicher Wortlaut bleibt erhalten | Ergebnisfeedback | `Weiter` | macht den vollzogenen Ansichtswechsel in jeder Variante eindeutig; begrenzt | keine |
| `S06.narrations.s06.summary.actual-source-blocked` | `In der tatsächlichen Ausgangslage wurde das Campusgram-Passwort in dieser begrenzten Prüfung nicht gefunden. Der Angreifer bleibt deshalb außerhalb des Kontos.` | `Zurück zu unserer Ausgangslage: Das Campusgram-Passwort wurde in dieser begrenzten Prüfung nicht gefunden. Der Angreifer bleibt deshalb außerhalb des Kontos.` | Ergebnisfeedback | `Weiter` | vereinheitlicht den Einstieg ohne doppelte Ausgangslagen-Formulierung; begrenzt | keine |

## Darstellungsdelta S06 animierte Befallübernahme, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Neu betroffene Hauptkonten
wurden beim Renderwechsel bisher pauschal als bereits abgeschlossene Statuskaskade behandelt;
lokal als `exposed` markierte Unterknoten wurden ebenfalls ohne Kaskade in den Endzustand
gesetzt. Dadurch sprangen sowohl der erfolgreiche Pfad von Campusgram zu Master Campus als auch
lokale Datenlecks bei einem schwachen Master-Campus- oder Campus-E-Mail-Passwort direkt auf das
vollständig rote Ergebnis.

Bei einem erfolgreichen kontoübergreifenden Pfad bleibt die bereits vollständig gezeichnete
Angriffslinie ruhig stehen. Nur das neue Zielkonto übernimmt sichtbar den roten Status und setzt
von dort die Kaskade zu dessen verbundenen Knoten fort; die Konto-zu-Konto-Linie wird bei
`Wiederverwendet` oder `Ähnlich` nicht erneut gezeichnet. Beim lokalen Datenleck folgt auf die
vorhandene Angreiferbewegung eine kurze sichtbare Übernahme des Hauptkontos; seine verbundenen
Dienste oder Funktionen werden danach über die vorhandenen Kanten rot. Ein
nachfolgender Szenenrender markiert laufende Kaskaden nicht mehr vorschnell als abgeschlossen.
Abgeschlossene Kaskaden werden zugleich sofort im flüchtigen Rendererzustand festgehalten, ohne
einen neuen Render auszulösen. Ein anschließender reiner PassWo-Schritt kann die bereits gezeigten
Befallslinien dadurch nicht erneut starten.
Reduced Motion zeigt weiterhin unmittelbar den vollständigen Endzustand. Teilnehmertexte,
Content-Version, Persistenz, Export und Studien-Timing ändern sich nicht.

## Animationsdelta S06 zweite ausgehende Prüflinie, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Nach einer erkannten
Wiederverwendung oder abgeleiteten Variante wartete die Statechart nach dem vollständigen
Schließen der Vergleichskarte nochmals pauschal 1.350 Millisekunden. Diese zusätzliche Pause war
länger als die sichtbare Ergebnisauflösung und ließ die zweite ausgehende Prüflinie verspätet
wirken. Die deterministische Zusatzpause dauert nun sowohl für erfolgreiche Vergleiche als auch
für `Keine Übereinstimmung` nur noch 120 Millisekunden. Die nächste Prüflinie beginnt dadurch
bereits mit dem sichtbaren Anlauf der Ergebniskaskade beziehungsweise des Schutzschilds, statt
erst nach deren bisheriger Nachlaufzeit. Reduced Motion, Teilnehmertexte, Content-Version,
Persistenz, Export und Studien-Timing ändern sich nicht.

## Copy- und Ablaufdelta S06 Campus-E-Mail-Einzelcheck, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026 sowie die narrative Absicht von
Skriptabschnitt 6.6 auf interner Seite 42. Am Ende von S06 wird Campus E-Mail nur noch mit der
vorhandenen lokalen Vollpasswort-Prüfung für sich betrachtet. Wird das Passwort erkannt, bleiben
der betroffene Kontoknoten und seine vier verbundenen Funktionen als konkrete Auswirkung
sichtbar. Wird es nicht erkannt, bleibt der geschützte Zustand sichtbar; es folgt ausdrücklich
kein `Was wäre, wenn?` und keine ausgehende Prüfung zu den anderen Konten. In beiden Fällen
folgt direkt der vorhandene Sprechschritt zur Rückkehr in die tatsächliche
Campusgram-Ausgangslage. Persistenz, Export und Studien-Timing ändern sich nicht.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.15.0` auf `2.16.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.transition.campus-email` | `Zum Schluss verschieben wir das Datenleck zu Campus E-Mail und prüfen von dort beide anderen Konten.` | `Zum Schluss verschieben wir das Datenleck zu Campus E-Mail und prüfen dieses Passwort für sich.` | Orientierung | `Weiter` | stimmt die Ankündigung auf den ausdrücklich verlangten Einzelcheck ab; begrenzt | keine |
| `S06.narrations.s06.local-check.campus-email-found` | `Beim Campus-E-Mail-Passwort wurde ein vollständiger früher Kandidat erkannt. Von diesem Konto aus werden nun die beiden anderen Passwörter direkt im Netzwerk geprüft.` | `Beim Campus-E-Mail-Passwort wurde ein vollständiger früher Kandidat erkannt. Unabhängig von den Verbindungen zu anderen Konten lohnt es sich deshalb, auch dieses Passwort für sich stark zu wählen.` | Ergebnisfeedback | `Weiter` zur Rückkehr | ordnet den sichtbaren lokalen Befall ohne weitere Ausbreitungsankündigung ein; ausdrücklich freigegebene Ablaufänderung | keine |
| `S06.narrations.s06.local-check.campus-email-blocked` | `Beim Campus-E-Mail-Passwort wurde in dieser begrenzten Prüfung kein vollständiger früher Kandidat erkannt. Die möglichen weiteren Wege betrachten wir deshalb als „Was wäre, wenn?“.` | `Beim Campus-E-Mail-Passwort wurde in dieser begrenzten Prüfung kein vollständiger früher Kandidat erkannt. Das ist ein günstiges Ergebnis dieser Prüfung, aber keine allgemeine Sicherheitsgarantie.` | Ergebnisfeedback / Safety Boundary | `Weiter` zur Rückkehr | entfernt den nicht mehr gezeigten hypothetischen Pfad und begrenzt die Schutzaussage; ausdrücklich freigegebene Ablaufänderung | keine |

Die Formulierungen für den Einzelcheck waren bereits vor der späteren Erweiterung um zwei
ausgehende Campus-E-Mail-Pfade freigegeben und werden unverändert wiederverwendet. Der
Rückkehrtext bleibt bestehen; geschützte Formulierungen und Hervorhebungen sind nicht betroffen.

## Copy-Delta S07 Passphrasen eins und vier, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Die erste und vierte der fünf
festen S07-Wortfolgen sowie ihre konkreten Beispiel-Merksätze werden wortgetreu ersetzt. Ihre
Positionen in der festgelegten Abspielreihenfolge bleiben erhalten. Ablauf, Interaktionen,
Persistenz, Export und Timing ändern sich nicht. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt
von `4.10.0` auf `4.11.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.browser.generatorPage.passphrases[0]` | `Kaktus-Fenster-Regen-Komet-Lampe-Knochen` mit bisherigem Beispiel-Merksatz | `Plexiglas-Dorffest-Knirps-Monieren-Eistee-Bergbahn` mit ausdrücklich vorgegebenem Beispiel-Merksatz | Mechanismuserklärung | Generator beziehungsweise `Kopieren` | ausdrücklich freigegebener Austausch des Beispiels; Bedeutung begrenzt | `Beispiel:`, Akzent |
| `S07.browser.generatorPage.passphrases[3]` | `Pinguin-Leiter-Mango-Wolke-Fahrrad-Koffer` mit bisherigem Beispiel-Merksatz | `Popkultur-Wohnsiedlung-Holzarbeiten-Drohung-Streng-Knieprobleme` mit ausdrücklich vorgegebenem Beispiel-Merksatz | Mechanismuserklärung | Generator beziehungsweise `Kopieren` | ausdrücklich freigegebener Austausch des Beispiels; Bedeutung begrenzt | `Beispiel:`, Akzent |

## Copy- und Darstellungsdelta S07 Einstieg und Zielführung, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Die drei S07-Einstiegsschritte
werden wortgetreu auf Definition, begrenzten Vergleich und anschließende Generatorhandlung
ausgerichtet. Der zweite Schritt überschreitet das normale Zielbudget knapp, weil der ausdrücklich
freigegebene Wortlaut den Kontrast zwischen einem geläufigen Einzelwort und mindestens sechs
zufälligen, unzusammenhängenden Wörtern in einem zusammenhängenden Schritt aufbaut.

Die Hervorhebungen bleiben presentation-only: Im ersten Schritt wird `Passphrase`, im zweiten
Schritt die eine zusammenhängende Phrase `mindestens sechs zufälligen, unzusammenhängenden`
markiert. Der dritte Schritt erhält keine Hervorhebung. Plus-Symbol, Suchaktion und die weiteren
bereits geführten Ziele erhalten einen kontrastreicheren, größeren Leuchtrahmen; Plus und
Suchsymbol werden zusätzlich vergrößert. Bei Reduced Motion bleibt der Rahmen statisch. Ablauf,
Persistenz, Export und Studien-Timing ändern sich nicht.
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von `4.8.0` auf `4.9.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.methodIntro` | `Dafür nutzen wir eine Passphrase: ein Passwort aus mehreren zufälligen Wörtern. Ein einzelnes bekanntes Wort bleibt früh prüfbar, auch wenn es lang ist.` | `Dafür nutzen wir eine Passphrase: eine einfache Methode, starke Passwörter nur aus Wörtern zu bilden.` | Mechanismuserklärung | `Weiter` | ausdrücklich freigegebene Definition; Bedeutungsänderung ausdrücklich freigegeben | `Passphrase`, Akzent |
| `S07.guide.randomnessIntro` | `Mehrere zufällige, unzusammenhängende Wörter vermeiden dagegen typische selbst gewählte Muster.` | `Ein geläufiges Wort kann zwar lang sein, wird von Angreifern aber früh ausprobiert. Eine Passphrase aus mindestens sechs zufälligen, unzusammenhängenden Wörtern macht das Erraten dagegen deutlich aufwendiger.` | Mechanismuserklärung | `Weiter` | ausdrücklich freigegebener Vergleich und Mindestwortzahl; Bedeutungsänderung ausdrücklich freigegeben | `mindestens sechs zufälligen, unzusammenhängenden`, Akzent |
| `S07.guide.searchIntro` | `Lass dir eine Passphrase aus mindestens sechs zufälligen Wörtern online generieren und ersetze damit das betroffene Passwort.` | `Lass dir online eine Passphrase generieren und ersetze damit das betroffene Passwort.` | Navigation | Browser-`+`, Suchsymbol und Generator | entfernt die im vorherigen Schritt bereits erklärte Mindestwortzahl; ausdrücklich freigegeben | keine |
| `S07.browser.guidedTargets` | gelber Leuchtrahmen in Standardgröße | größerer orangefarbener Leuchtrahmen mit stärkerem Kontrast; vergrößerte Plus- und Suchziele | Navigation | Browser-`+`, Suchsymbol und weitere geführte Ziele | macht die verlangte Handlungsfolge auffälliger; keine Bedeutungsänderung | Form, Kontrast und Bewegung; bei Reduced Motion statisch |

## Copy- und Ablaufdelta S06 Abschluss und S07 Kontorückmeldung, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. S06 endet mit der konkreten
Handlung `Passwort ersetzen` und der Übergangskarte `Passwort sicher ersetzen`. Beim
Campusgram-Passwortwechsel erklärt PassWo die Passphrase in drei kurzen Schritten. Die zwei
Hervorhebungen `zufällige` und `unzusammenhängende` bilden den ausdrücklich freigegebenen
Kontrast zum selbst gewählten Muster; alle anderen Schritte bleiben bei einer Hervorhebung.
Nach jeder Generierung folgen die allgemeine Merkhilfe und anschließend der konkrete, mit
`Beispiel:` eingeleitete Merksatz.

Nach dem Campusgram-Wechsel werden die flüchtigen S06-Befunde für Master Campus und Campus
E-Mail erneut projiziert. `whole-password-recognized` führt dabei ausschließlich in die
freigegebene Formulierung `lässt sich ... leicht erraten`; jede in S06 begrenzt erkannte exakte
oder abgeleitete Kontobeziehung führt in die benannte Ähnlichkeitsrückmeldung. Beziehungen werden
pro Kontopaar zusammengeführt und in der Reihenfolge altes Campusgram-Passwort, anderes Konto
genannt. Stark und einzigartig eingeordnete Konten erhalten keine einzelne Nachricht und keine
S08-Schutzaktion. Es werden keine Befunde persistiert oder exportiert.

Sind beide anderen Konten bereits stark und einzigartig, führt `Angriff abschließen` direkt in
den S08-Rücklauf. Andernfalls führt `Angriff fortsetzen` zu S08; dort bleiben ausschließlich die
offenen Konten direkt mit einer eigenen Passphrase bedienbar. Die Inhaltsversionen steigen auf
`S00_CONTENT_VERSION 1.24.0`, `S06_CONSEQUENCE_CONTENT_VERSION 2.15.0`,
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION 4.8.0` und
`S08_NETWORK_REPLAY_CONTENT_VERSION 1.2.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.transition.s07` | `Als Nächstes erstellen wir eine neue Passphrase.` | `Was macht man nach so einem Datenleck? Das betroffene Passwort sollte zügig durch ein neues, starkes Passwort ersetzt werden.` | Navigation | `Passwort ersetzen` | ausdrücklich freigegebene Überleitung zur konkreten Ersatzhandlung | keine |
| `S06.page.replacePassword` | `Weiter` | `Passwort ersetzen` | Navigation | Übergangskarte | benennt die ausgelöste Handlung; ausdrücklich freigegeben | keine |
| `sectionTransition.change-passwords` | `Passphrase erstellen` | `Passwort sicher ersetzen` | Orientierung | kein | ausdrücklich freigegebener Kartentitel | aktiver Fortschrittspunkt |
| `S07.guide.methodIntro` | allgemeine Erklärung zu langer Passphrase und 15 Zeichen | `Dafür nutzen wir eine Passphrase: ein Passwort aus mehreren zufälligen Wörtern. Ein einzelnes bekanntes Wort bleibt früh prüfbar, auch wenn es lang ist.` | Mechanismuserklärung | `Weiter` | trennt Passphrase und bekanntes Einzelwort; ausdrücklich freigegeben | `Passphrase`, Akzent |
| `S07.guide.randomnessIntro` | allgemeiner Hinweis auf zufällige Wortwahl | `Mehrere zufällige, unzusammenhängende Wörter vermeiden dagegen typische selbst gewählte Muster.` | Mechanismuserklärung | `Weiter` | benennt den freigegebenen Kontrast | `zufällige` und `unzusammenhängende`, gruppierter Akzent |
| `S07.guide.searchIntro` | Generator suchen, erzeugen und für Campusgram verwenden | `Lass dir eine Passphrase aus mindestens sechs zufälligen Wörtern online generieren und ersetze damit das betroffene Passwort.` | Navigation | neuer Tab und Generator | stimmt die Aufgabe auf Wortzahl und Ersatzhandlung ab; ausdrücklich freigegeben | `mindestens sechs`, Akzent |
| `S07.guide.mnemonicIntro` | allgemeines Bild oder Merksatz | `Für jetzt musst du sie dir nicht merken. Im Alltag kann eine kleine Geschichte das Erinnern erleichtern.` | Mechanismuserklärung | `Weiter` | freigegebene Entlastung und Alltagstransfer | keine |
| `S07.guide.mnemonic` | `Möglicher Merksatz: [Merksatz]` | `Beispiel: [Merksatz]` nach jeder Generierung | Mechanismuserklärung | Generator beziehungsweise `Kopieren` | ausdrücklich freigegebene Wiederholung und Kennzeichnung | `Beispiel:`, Akzent |
| `S07.browser.campusgramPasswordChangeCompleted` | `Passwort geändert` / `Die neue Passphrase wird jetzt für Campusgram verwendet.` | `Campusgram-Passwort wurde erfolgreich ersetzt`; bisheriger Zusatz entfällt | Ergebnisfeedback | kein | benennt das sichtbare Ergebnis ohne redundanten Zusatz; ausdrücklich freigegeben | bestehende Schilde `Einzigartig` und `Stark` |
| `S07.guide.campusgramSuccess` | allgemeines Lob und längere Angriffseinordnung | `Campusgram ist jetzt geschützt. Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.` | Ergebnisfeedback | `Weiter` | ausdrücklich freigegebene konkrete Schutzwirkung | `Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.`, positiv |
| `S07.guide.accountFeedback.strongSimilar` | pauschale Rest-Rückmeldung | `Das Passwort von [Konto] ist für sich betrachtet stark, ähnelt aber noch [Verbindung].` | Ergebnisfeedback | `Weiter` | übernimmt den passenden flüchtigen S06-Befund; ausdrücklich freigegeben | keine |
| `S07.guide.accountFeedback.uniqueGuessable` | pauschale Rest-Rückmeldung | `Das Passwort von [Konto] ist einzigartig, lässt sich aber noch leicht erraten.` | Ergebnisfeedback | `Weiter` | übernimmt den passenden flüchtigen S06-Befund; ausdrücklich freigegeben | keine |
| `S07.guide.accountFeedback.similarGuessable` | pauschale Rest-Rückmeldung | `Das Passwort von [Konto] ähnelt noch [Verbindung] und lässt sich außerdem leicht erraten.` | Ergebnisfeedback | `Weiter` | übernimmt beide passenden flüchtigen S06-Befunde; ausdrücklich freigegeben | keine |
| `S07.guide.allAccountsProtected` | kein eigener Fall | `Auch deine anderen Konten sind bereits stark und einzigartig. Schau dir jetzt an, wie der Angriff mit deinen geschützten Konten endet.` | Navigation | `Angriff abschließen` | eigener Abschlussweg ohne offene Konten; ausdrücklich freigegeben | keine |
| `S07.guide.remainingPlan` | Browserfenster als Abkürzung schließen | `Schau dir jetzt an, was der Angriff noch erreichen kann. Offene Konten kannst du dort direkt mit einer eigenen Passphrase absichern.` | Navigation | `Angriff fortsetzen` | führt direkt zum tatsächlich sichtbaren S08-Netzwerk; ausdrücklich freigegeben | keine |

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

## Copy- und Ablaufdelta S07 Passphraseneinstieg in zwei Schritten, 17. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 17. August 2026. Der Einstieg in den
Campusgram-Passwortwechsel besteht nicht mehr aus drei, sondern aus zwei PassWo-Sprechschritten.
Die bisher getrennten Erklärungen zur Passphrase und zur zufälligen Wortauswahl werden zu einer
Mechanismuserklärung zusammengeführt. Danach folgt unmittelbar die bestehende Navigation zum
Online-Generator. Der entfallene Zwischenzustand speichert keine Daten und berührt weder
Persistenz, Export noch Studien-Timing. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von
`4.11.0` auf `4.12.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.methodIntro` | `Dafür nutzen wir eine Passphrase: eine einfache Methode, starke Passwörter nur aus Wörtern zu bilden.` | `Die Passphrase ist genau die Methode für starke Passwörter aus Wörtern, die wir heute schon angesprochen haben. Sie besteht aus mindestens sechs zufällig ausgewählten, voneinander unabhängigen Wörtern.` | Mechanismuserklärung | `Weiter` | führt Methode, Mindestwortzahl und Unabhängigkeit im ausdrücklich freigegebenen Wortlaut zusammen; Bedeutungsänderung ausdrücklich freigegeben | `Die Passphrase`, Akzent |
| `S07.guide.randomnessIntro` | `Ein geläufiges Wort kann zwar lang sein, wird von Angreifern aber früh ausprobiert. Eine Passphrase aus mindestens sechs zufälligen, unzusammenhängenden Wörtern macht das Erraten dagegen deutlich aufwendiger.` | entfällt als eigener Sprechschritt; Mindestwortzahl und zufällige Unabhängigkeit stehen im neuen `methodIntro` | Mechanismuserklärung | entfällt | reduziert den Einstieg ausdrücklich von drei auf zwei Sprechblasen; Bedeutung wird in den ersten Schritt übernommen | keine |
| `S07.guide.searchIntro` | `Lass dir online eine Passphrase generieren und ersetze damit das betroffene Passwort.` | wortgleich | Navigation | Browser-`+`, danach Suche und Generator | bleibt als zweiter Einstiegsschritt erhalten und benennt das tatsächliche sichtbare Ziel | keine |
## Copy- und Ablaufdelta S07 Merksatz bei Neugenerierung, 15. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 15. August 2026. Die allgemeine Merkhilfe
`S07.guide.mnemonicIntro` bleibt inhaltlich unverändert, erscheint aber nur nach der ersten
generierten Passphrase. Bei jeder Betätigung von `Neu generieren` folgt auf den bestehenden
Generierungsstatus direkt der konkrete Beispiel-Merksatz der neuen Wortfolge. Dadurch wiederholt
PassWo die bereits vermittelte Mechanismuserklärung nicht. Wortfolgen, Merksätze, Persistenz,
Export und Timing bleiben unverändert. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von
`4.9.0` auf `4.10.0`.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.mnemonicIntro` | unveränderter Wortlaut nach jeder Generierung | unveränderter Wortlaut nur nach der ersten Generierung | Mechanismuserklärung | `Weiter` | entfernt nachweisbare Redundanz; keine Bedeutungsänderung | keine |
| `S07.guide.mnemonic` | konkreter Beispiel-Merksatz nach der allgemeinen Merkhilfe | nach `Neu generieren` direkt der konkrete Beispiel-Merksatz | Mechanismuserklärung | Generator beziehungsweise `Kopieren` | hält die neue Wortfolge ohne wiederholte Erklärung unmittelbar erfassbar; begrenzte Ablaufänderung | `Beispiel:`, Akzent |

## Copy-Delta S05-S09 Terminologie für Passwort-Abwandlungen vereinheitlicht, 22. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 22. August 2026. Die benannten S06- und
S07-PassWo-Sprechblasen verwenden für einen exakten Treffer `dasselbe Passwort`, für einen
aus einfachen Änderungen abgeleiteten Treffer `leichte Abwandlung` und für einen einzelnen
Schritt `Änderung`. Ablauf, Bedingungen, IDs, Auswertungen und Interaktionen bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.26.0` auf `2.27.0`; die
`S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von `4.16.0` auf `4.17.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.narrations.s06.incident.campusgram-found` | `Das Campusgram-Passwort ist nun bekannt. Der Angreifer kann es und ähnliche Varianten jetzt auch bei den anderen Konten ausprobieren.` | `Das Campusgram-Passwort ist nun bekannt. Der Angreifer kann dasselbe Passwort und leichte Abwandlungen jetzt auch bei den anderen Konten ausprobieren.` | Ergebnisfeedback | `Weiter` | exaktes Passwort und Abwandlungen verständlich unterscheiden; begrenzt | keine |
| `S06.narrations.s06.compare.exact-match` | `Das bekannte Passwort kann ohne Veränderung beim Zielkonto ausprobiert werden.` | `Dasselbe Passwort kann beim Zielkonto ausprobiert werden.` | Ergebnisfeedback | `Weiter` | exakten Treffer als dasselbe Passwort bezeichnen; begrenzt | keine |
| `S06.narrations.s06.compare.derived-variant-match` | `Die sichtbare Transformation erzeugt das vollständige fiktive Zielpasswort.` | `Die gezeigte Änderung führt zum vollständigen fiktiven Zielpasswort.` | Ergebnisfeedback | `Weiter` | technischen Begriff durch die konkrete Änderung ersetzen; begrenzt | keine |
| `S06.narrations.s06.transition.master-campus-email-match` | `Zwischen Master Campus und Campus E-Mail wurde ein gleiches oder ähnliches Passwort erkannt. Dieser Weg könnte den Angriff auf Campus E-Mail ausweiten. Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.` | `Zwischen Master Campus und Campus E-Mail wurde dasselbe Passwort oder eine leichte Abwandlung erkannt. Dieser Weg könnte den Angriff auf Campus E-Mail ausweiten. Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.` | Ergebnisfeedback | `Weiter` | Übungsbefund präzise und ohne allgemeine Ähnlichkeitsbehauptung benennen; begrenzt | keine |
| `S06.narrations.s06.summary.actual-one` | `Bei einem weiteren Konto führt ein gleiches oder ähnliches Passwort weiter. So kann aus einem betroffenen Konto ein zweites werden.` | `Bei einem weiteren Konto kann dasselbe Passwort oder eine leichte Abwandlung den Angriff weiterführen. So kann aus einem betroffenen Konto ein zweites werden.` | Ergebnisfeedback | `Weiter` | Übungsbefund präzise und verständlich benennen; begrenzt | keine |
| `S06.narrations.s06.summary.actual-both` | `Bei beiden anderen Konten führt ein gleiches oder ähnliches Passwort weiter. So kann sich ein Datenleck auf mehrere Konten ausweiten.` | `Bei beiden anderen Konten können dasselbe Passwort oder leichte Abwandlungen den Angriff weiterführen. So kann sich ein Datenleck auf mehrere Konten ausweiten.` | Ergebnisfeedback | `Weiter` | Übungsbefund präzise und verständlich benennen; begrenzt | keine |
| `S06.narrations.s06.transition.s07` | `Ein Datenleck lässt sich nicht immer verhindern. Danach zählt, die Folgen zu begrenzen: das betroffene Passwort zügig ersetzen und Wiederverwendung stoppen. Genau das machen wir jetzt bei Campusgram.` | `Ein Datenleck lässt sich nicht immer verhindern. Danach zählt, die Folgen zu begrenzen: das betroffene Passwort zügig ersetzen und für jedes Konto ein eigenes Passwort verwenden. Genau das machen wir jetzt bei Campusgram.` | Navigation | bestehender Passwortwechsel bei Campusgram | konkrete, nutzerseitige Handlung statt abstrakter Wiederverwendung; begrenzt | gleichbedeutende Handlungsphrase im Akzentton |
| `S07.guide.accountSummary` | `Bei den anderen Konten gibt es noch gleiche oder ähnliche Passwörter.` | `Bei den anderen Konten wird noch dasselbe Passwort oder eine leichte Abwandlung verwendet.` | Ergebnisfeedback | `Weiter` | bedingte Zusammenfassung präzise und ohne allgemeine Ähnlichkeitsbehauptung formulieren; begrenzt | keine |

## Copy-Delta S06 Vergleichslabels für Passwort-Abwandlungen vereinheitlicht, 22. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 22. August 2026. Die drei zentralen
S06-Vergleichslabels verwenden nun dieselbe Terminologie wie die PassWo-Sprechblasen. Sie werden
in S06-Vergleichsvorschauen, Netzwerken und nachfolgenden geteilten Darstellungen aus dieser einen
Content-Quelle bezogen. Bedingungen, IDs, Auswertungen und Interaktionen bleiben unverändert.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.27.0` auf `2.28.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.comparisonResultLabels.exact-match` | `Wiederverwendet` | `Dasselbe Passwort` | Ergebnisfeedback | kein | exakten Vergleich laienverständlich und konsistent bezeichnen; begrenzt | keine |
| `S06.comparisonResultLabels.derived-variant-match` | `Ähnlich` | `Leicht abgewandelt` | Ergebnisfeedback | kein | abgeleiteten Treffer auf die geprüften einfachen Änderungen begrenzen; begrenzt | keine |
| `S06.comparisonResultLabels.no-derived-path-recognized` | `Keine direkte Variante erkannt` | `Keine leichte Abwandlung erkannt` | Ergebnisfeedback | kein | Gegenbefund mit derselben begrenzten Terminologie bezeichnen; begrenzt | keine |

## Copy-Delta S07 Campusgram-Erfolgsnachricht präzisiert, 23. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 23. August 2026. Ausschließlich der erste Satz
der bestehenden S07-Erfolgsrückmeldung benennt nun das sichtbare Ersetzen des fiktiven
Campusgram-Passworts. Der zweite Satz sowie Ablauf, Interaktionen, Persistenz und Export bleiben
unverändert. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von `4.17.0` auf `4.18.0`.

| Segment und Text-ID | Aktueller Text | Geplanter Text | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S07.guide.campusgramSuccess` | `Campusgram ist jetzt geschützt. Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.` | `Das Campusgram-Passwort ist jetzt ersetzt. Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.` | Ergebnisfeedback | `Weiter` | ausdrücklich vorgegebene Präzisierung des sichtbaren Ergebnisses; begrenzt | unverändert positiv: `Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.` |

## Copy- und Interaktionsdelta S06 begrenzte Abwandlung und Edit-Pfad, 24. August 2026

Quelle ist der ausdrückliche Nutzerauftrag vom 24. August 2026, die allgemeine Erkennung
`leicht abgewandelt` über eine feste Edit-Distanz zu operationalisieren und die konkrete
Verbindung zwischen Quell- und Zielpasswort nach außen sichtbar zu machen.
`S06_CONSEQUENCE_CONTENT_VERSION` steigt von `2.43.0` auf `2.44.0`.
Persistenz, Export, Forschungsinstrumente und die drei zentralen Ergebnislabels bleiben
unverändert.

Die allgemeine positive Relation verwendet intern die case-sensitive restricted
Damerau-Levenshtein-Distanz mit absoluter Grenze drei und normalisierter Grenze `0,25`. Ein
zusätzlicher begrenzter Pfad darf genau einen vollständigen kontospezifischen Identifier ersetzen
und mit höchstens zwei weiteren Distanzoperationen kombinieren. Diese Parameter werden nicht als
universeller Standard, Crack-Wahrscheinlichkeit oder Stärkeurteil an Teilnehmende ausgegeben.

| Segment und Text-ID | Vorher | Nachher | Primäre Rolle | Interaktionsziel | Grund und Bedeutungsänderung | Hervorhebung |
|---|---|---|---|---|---|---|
| `S06.transformationStepLabels.account-term-replacement` | kein eigener sichtbarer Schritttext | `Kontobegriff ersetzt` | Mechanismuserklärung | kein | benennt das konkret verbundene Quell-/Zielpaar; begrenzt | neben `Quelle → Ziel` |
| `S06.transformationStepLabels.year-change` | nur allgemeines Transformationslabel | `Jahreszahl verändert` | Mechanismuserklärung | kein | erklärt den tatsächlich belegten Edit-Span; begrenzt | neben `Quelle → Ziel` |
| `S06.transformationStepLabels.number-change` | nur allgemeines Transformationslabel | `Zahlenbestandteil verändert` | Mechanismuserklärung | kein | erklärt den tatsächlich belegten Edit-Span; begrenzt | neben `Quelle → Ziel` |
| `S06.transformationStepLabels.suffix-change` | nur allgemeines Transformationslabel | `Endzeichen oder kurzer Anhang verändert` | Mechanismuserklärung | kein | hält Ersetzung, Ergänzung und Entfernung eines terminalen Zeichenspans verständlich zusammen; begrenzt | neben `Quelle → Ziel` |
| `S06.transformationStepLabels.separator-change` | nur allgemeines Transformationslabel | `Trennzeichen verändert` | Mechanismuserklärung | kein | erklärt den konkreten Edit statt einer bloßen Markierung; begrenzt | neben `Quelle → Ziel` |
| `S06.transformationStepLabels.capitalization-change` | Groß-/Kleinschreibung konnte als gemeinsamer Teil erscheinen | `Groß- und Kleinschreibung verändert` | Mechanismuserklärung | kein | macht die Abweichung ausdrücklich sichtbar; begrenzt | neben `Quelle → Ziel` |
| `S06.transformationStepLabels.leet-substitution` | nur allgemeines Transformationslabel | `Typische Zeichenersetzung` | Mechanismuserklärung | kein | verbindet ursprünglichen Buchstaben und Ersatzzeichen direkt; begrenzt | neben `Quelle → Ziel` |
| `S06.transformationStepLabels.character-substitution` | kein eigener sichtbarer Schritttext | `Zeichen ersetzt` | Mechanismuserklärung | kein | benennt eine atomare Ersetzung; begrenzt | neben `Quelle → Ziel` |
| `S06.transformationStepLabels.character-insertion` | Ergänzung erschien ohne sichtbaren Gegenwert | `Zeichen ergänzt` | Mechanismuserklärung | kein | zeigt `nichts → Zeichen`; begrenzt | neben `Quelle → Ziel` |
| `S06.transformationStepLabels.character-deletion` | Entfernung erschien ohne sichtbaren Gegenwert | `Zeichen entfernt` | Mechanismuserklärung | kein | zeigt `Zeichen → nichts`; begrenzt | neben `Quelle → Ziel` |
| `S06.transformationStepLabels.adjacent-transposition` | Vertauschung wurde nur als allgemeine Änderung bezeichnet | `Benachbarte Zeichen vertauscht` | Mechanismuserklärung | kein | benennt die Damerau-Operation verständlich; begrenzt | neben `Quelle → Ziel` |
| `S06.comparisonPathLabels.heading` | keine Überschrift für den Ableitungsweg | `So entsteht der Kandidat` | Orientierung | kein | kündigt die schrittweise Kandidatenbildung an; begrenzt | oberhalb der Änderungsliste |
| `S06.comparisonPathLabels.sourceValue` / `targetValue` | keine Rollenbezeichnung | `bekannt` / `Ziel` | Orientierung | kein | trennt den bekannten Ausgangswert vom noch zu treffenden Zielwert | oberhalb der beiden Passwortzeilen |
| `S06.comparisonPathLabels.emptyValue` | leerer Span wurde ausgeblendet | `nichts` | Mechanismuserklärung | kein | hält Ergänzungen und Entfernungen paarweise lesbar | gestrichelter Gegenwert |
| `S06.comparisonPathLabels.candidateProgress` | kein sichtbarer Zwischenstand | `Kandidat nach jedem Schritt` | Mechanismuserklärung | kein | zeigt nach jeder verbundenen Änderung den tatsächlich entstehenden vollständigen Zwischenwert | über dem fortgeschriebenen Kandidaten |
| `S06.comparisonPathLabels.generatedCandidate` | vollständiger Kandidat wurde nicht in der Vergleichskarte gezeigt | `Vollständiger Kandidat` | Ergebnisvorbereitung | kein | zeigt vor dem Urteil den tatsächlich erzeugten Zielwert | unter den Änderungsschritten |
| `S06.narrations.s06.compare.derived-variant-match.body` | `Die gezeigte Änderung führt zum vollständigen fiktiven Zielpasswort.` | `Die gezeigten Änderungen führen zum vollständigen fiktiven Zielpasswort.` | Ergebnisfeedback | `Weiter` | stimmt Singular/Plural mit dem geordneten Mehrschrittpfad ab; keine neue Sicherheitsbehauptung | keine |
| S06-Vergleichsanimation | unveränderte Teile wurden verbunden; geänderte Teile blieben ohne paarweise Erklärung; Ergebnis und Angriff konnten vor der vollständigen Erklärung beginnen | Quell- und Zielspan jedes Domänenschritts werden nacheinander als `vorher → nachher` verbunden; nach jedem Schritt ersetzt der daraus entstehende Zwischenkandidat den vorherigen Wert; anschließend erscheinen Abschlusslabel, Ergebnis und erst danach die Angriffslinie | Mechanismuserklärung | `Animation wiederholen`, danach bestehendes `Weiter`/`Fertig` | Entscheidung, Erklärung, Zwischenkandidaten und Animation stammen aus demselben Domänenpfad; Bedeutung wird nachvollziehbar, nicht erweitert | geänderte Paare, Pfeil, Schritttext und fortgeschriebener Kandidat |
| Reduced Motion | verkürzte Bewegung ohne vollständige explizite Edit-Zuordnung | statischer Endzustand mit allen Quell-/Zielpaaren, Schritttexten und vollständigem Kandidaten | Barrierefreiheit / Mechanismuserklärung | bestehende Navigation | erhält denselben Informationsgehalt ohne zeitliche Staffelung | alle Schritte unmittelbar sichtbar |

Die umfangreichen `accountTerms` der Einzelanalyse bleiben unverändert. Für den neuen
kontospezifischen S06-Makropfad werden getrennte, kleine `comparisonIdentifiers` verwendet.
Allgemeine Kontextwörter wie `Profil`, `Hilfe`, `Link`, `Service`, `Campus` oder `Mail` allein
begründen dadurch keine kontoübergreifende Ersetzung.

## Technisches Content-Delta S07 Passphrasen-IDs, 25. August 2026

Der Folgeauftrag führt für jede bereits vorhandene vorgegebene Passphrase und jedes vorhandene
Trennzeichen eine stabile Content-ID ein. Es ändert sich kein sichtbarer Teilnehmertext. Die in
S07 ausgewählte Campusgram-Passphrase kann dadurch ab S08 ohne Stringpersistenz referenziert
werden; Master Campus und Campus E-Mail erhalten deterministisch zwei unterschiedliche weitere
IDs aus demselben Pool. `S07_PASSPHRASE_SEARCH_CONTENT_VERSION` steigt von `4.19.0` auf `4.20.0`.

# PassWo Complete Script

Vollständiges Leseskript der PassWo-Figur vom Einstieg bis zum letzten Satz des Trainings. Die kurzen Szenenbeschreibungen erklären, was die teilnehmende Person gerade sieht oder tut; die Zitate geben den implementierten Wortlaut wieder.

**Stand:** 25. September 2026 · Quellenstand `bbe00215914dfd0fc39185bd238e4b10348f4c75`. Diese Datei ist eine redaktionelle Momentaufnahme. Maßgeblich bleiben die [versionierten Trainingsinhalte](packages/training-content/src/) und die [Copy-Regeln](docs/design/TRAINING-COPY.md). Änderungen am Training werden dort gepflegt; dieses Leseskript muss anschließend nachgezogen werden.

**So liest du das Skript:** Die Segmente folgen dem tatsächlichen Trainingsablauf. Jeder zitierte Absatz steht für einen Sprechschritt; mehrere Absätze innerhalb derselben Sprechblase sind ausdrücklich zusammengefasst. **Varianten** stehen als Alternativen an ihrer jeweiligen Stelle, **optionale Hinweise** erscheinen bei Bedarf. Die Szenen-IDs wie `S05-03` dienen der Orientierung in diesem Dokument. Bei frei wählbarer Kontoreihenfolge wird eine mögliche Reihenfolge gezeigt. Wiederholbare Hinweise sind einmal ausgeschrieben.

Platzhalter wie `[Teile]`, `[Angaben]`, `[Begriffe]`, `[Anzahl]`, `[Konto]` und `[offene Bereiche]` stehen für die im jeweiligen Durchlauf eingesetzten lokalen Werte. Es werden keine tatsächlichen Eingaben übernommen. Das Leseskript umfasst den Lerndialog einschließlich seiner Hilfen und Varianten. Technische Speicher-/Fehlermeldungen bei Unterbrechungen sind nicht enthalten. Reine Oberflächenbeschriftungen und Website-Inhalte werden nur dort als Szenenkontext ergänzt, wo sie den Ablauf erklären.

### Navigation

**Sektion 1 · Starke Passwörter**

- [S00 — Begrüßung und Übungsrahmen](#s00)
- [S01 — Drei Konten einrichten](#s01)
- [S02 — Konten und Verbindungen kennenlernen](#s02)
- [S03 — Erneut anmelden](#s03)
- [S04 — Datenleck bei Campusgram](#s04)
- [S05 — Passwortstärke aus Angreiferperspektive verstehen](#s05)
- [S06 — Wiederverwendung und Ähnlichkeit](#s06)
- [S07 — Passphrase erstellen und einsetzen](#s07)
- [S08 — Offene Passwortprobleme beheben](#s08)
- [S09 — Passwortprinzipien zusammenfassen](#s09)
- [S10 — Die drei geschützten Konten einordnen](#s10)
- [S11 — Von drei zu vielen Konten](#s11)

**Sektion 2 · Passwortmanager**

- [S12 — Passwortmanager verstehen](#s12)
- [S13 — Neue und bestehende Konten umstellen](#s13)

**Sektion 3 · Multi-Faktor-Authentifizierung**

- [S14 — Faktoren verstehen und 2FA einrichten](#s14)
- [S15 — Wirkung des zweiten Faktors](#s15)
- [S16 — Wichtige Konten zuerst](#s16)
- [S17 — Übertragung und Trainingsabschluss](#s17)

<a id="s00"></a>

## S00 — Begrüßung und Übungsrahmen

PassWo begrüßt die teilnehmende Person. Sie wählt einen fiktiven Benutzernamen und ein Betriebssystem für den virtuellen PC. Danach beginnt Sektion 1 „Starke Passwörter“.

Quelle: [s00.ts](packages/training-content/src/s00.ts), Content-Version 1.25.1.

### S00-01 — Willkommen und Ausgangssituation

Die Begrüßung erscheint vor dem Start auf der Einstiegsseite.

*Eine Sprechblase mit folgenden Absätzen:*

> Aloha! Ich bin PassWo und begleite dich heute durch das Training.
>
> Stell dir vor, du hast an einer Hochschule drei neue Campuskonten erhalten. Überlege, wie du solche Konten sicher schützen würdest, und wähle für jedes ein starkes Passwort, das du dir gut merken kannst.
>
> Später meldest du dich noch einmal bei allen drei Konten an. Wähle die Passwörter daher so, dass du sie wieder abrufen kannst.
>
> Du arbeitest gleich in einem virtuellen PC. Wähle dafür das Betriebssystem, das deinem Alltag am nächsten kommt.

### S00-02 — Virtuellen Browser kennenlernen

Im Browser sind die drei Übungskonten Master Campus, Campus E-Mail und Campusgram geöffnet. PassWo erklärt den Auftrag und erinnert daran, ausschließlich fiktive Passwörter zu verwenden.

> Das ist dein virtueller Browser: Oben wechselst du zwischen drei Konten und richtest alle drei ein.

> Bitte keine echten Passwörter oder Varianten davon verwenden. Deine Eingaben werden nur für diese Übung verarbeitet und nicht dauerhaft gespeichert. Viel Spaß beim Ausprobieren!

<a id="s01"></a>

## S01 — Drei Konten einrichten

Die Person registriert alle drei offenen Übungskonten mit selbst gewählten fiktiven Passwörtern. Die Tabreihenfolge ist frei.

Quelle: [s01.ts](packages/training-content/src/s01.ts), Content-Version 2.16.5.

### S01-01 — Passwörter für die spätere Anmeldung wählen

PassWo kann während der Einrichtung als Hinweis geöffnet werden.

> Erstelle für jedes der drei Konten ein starkes Passwort, das du dir für die spätere erneute Anmeldung merken kannst.

### S01-02 — Einrichtung abgeschlossen

Sobald alle drei Konten eingerichtet sind, führt das Schließen des simulierten Browserfensters zur Netzwerkansicht.

> Die drei Konten sind eingerichtet. Schließe jetzt das simulierte Browserfenster. Bevor du dich wieder anmeldest, schauen wir uns kurz an, was hinter den Konten steckt.

<a id="s02"></a>

## S02 — Konten und Verbindungen kennenlernen

Die Konten werden als Knoten mit verbundenen Diensten und Inhalten sichtbar. Die Person erkundet alle drei Konten in frei gewählter Reihenfolge.

Quelle: [s02.ts](packages/training-content/src/s02.ts), Content-Version 5.4.1.

### S02-01 — Das Kontonetzwerk verstehen

PassWo erklärt das Modell und entlastet die Person: Die Einzelheiten müssen nicht auswendig gelernt werden.

> Im Alltag ist oft nicht sichtbar, was alles mit einem Konto verbunden ist.

> Du kannst dir jedes Konto als Knoten in einem Netzwerk vorstellen. Die Verbindungen zeigen, was dazugehört.

> Du musst dir dabei keine Einzelheiten merken. Wähle aus, welches Konto du zuerst erkunden möchtest.

### S02-02 — Master Campus erkunden

Vorschauen zeigen Campus Workspace, Campus Services und Campus Cloud.

> Sieh dir nacheinander an, welche Campusdienste du mit Master Campus öffnest.

### S02-03 — Campus E-Mail erkunden

Vorschauen zeigen Benachrichtigungen, Bestätigungen, Zurücksetzungslinks und Kommunikation im eigenen Namen.

> Sieh dir nacheinander typische Nachrichten und Kontovorgänge im Postfach an.

### S02-04 — Campusgram erkunden

Vorschauen zeigen Direktnachrichten, Gruppen und Kontakte sowie Beiträge und Reaktionen.

> Sieh dir nacheinander persönliche Nachrichten, Kontakte und Beiträge an.

### S02-05 — Hinweise innerhalb der freien Erkundung

Diese Hinweise erscheinen passend zum Fortschritt innerhalb eines Kontos und nach dessen Abschluss. Die Listen nennen jeweils die noch offenen Bereiche oder Konten.

> Sieh dir noch [offene Bereiche] an.

> Alles in [Konto] angesehen. Wähle „Fertig“.

> Wähle noch [offene Konten] aus.

### S02-06 — Zum Browser zurückkehren

Nach allen drei Konten wird der Browser wieder freigegeben. Die Formulierung richtet sich nach dem gewählten Betriebssystem.

**macOS:**

> Du hast dir alle drei Konten angesehen. Klicke unten im Dock auf den Browser, um dich wieder anzumelden.

**Linux:**

> Du hast dir alle drei Konten angesehen. Klicke links in der Taskleiste auf den Browser, um dich wieder anzumelden.

**Windows:**

> Du hast dir alle drei Konten angesehen. Klicke unten in der Taskleiste auf den Browser, um dich wieder anzumelden.

<a id="s03"></a>

## S03 — Erneut anmelden: Passwörter abrufen

Die Person meldet sich mit ihren eben gewählten Passwörtern bei den drei Konten an. Bei Bedarf gibt es eine Erinnerungshilfe beziehungsweise eine unterstützte Anmeldung.

Quelle: [s03.ts](packages/training-content/src/s03.ts), Content-Version 1.19.4.

### S03-01 — Erneute Anmeldung

Die drei Konten werden erneut geöffnet.

> Melde dich jetzt mit den eben gewählten Passwörtern erneut an.

### S03-02 — Optionale Unterstützung

Nach dem dritten Fehlversuch weist PassWo auf „Passwort vergessen?“ hin. Beim Aufruf der Hilfe bietet er Unterstützung an. Der erste Hinweis kann später zusammen mit dem Anmeldeauftrag in einer Sprechblase wieder erscheinen.

> Wenn du das Passwort nicht mehr sicher weißt, kannst du unten „Passwort vergessen?“ nutzen.

> Kein Problem. Ein starkes Passwort sollte sich für dieses Konto auch später wieder abrufen lassen. Ich unterstütze dich jetzt bei der Anmeldung.

### S03-03 — Rückmeldung je geöffnetem Konto

Je nach Konto erscheint eine dieser Rückmeldungen; ihre Reihenfolge hängt von der Kontowahl ab.

> Master Campus ist wieder geöffnet.

> Campus E-Mail ist wieder geöffnet.

> Campusgram ist wieder geöffnet.

### S03-04 — Campusalltag fortsetzen und Warnung entdecken

Nach allen drei Anmeldungen wird der Campusalltag fortgesetzt. Danach erscheint im Campusgram-Tab eine Sicherheitsmeldung.

> Alle drei Konten sind wieder geöffnet. Wir können unseren Campusalltag jetzt fortsetzen.

> Bei Campusgram ist eine Sicherheitsmeldung erschienen. Schau bitte nach.

<a id="s04"></a>

## S04 — Datenleck bei Campusgram: zur Angreiferperspektive wechseln

Die Person öffnet die Campusgram-Warnung. Die Oberfläche fordert zum Passwortwechsel auf; der Lernpfad führt zunächst in die Angreiferperspektive.

Quelle: [s04.ts](packages/training-content/src/s04.ts), Content-Version 1.12.0.

### S04-01 — Den fiktiven Vorfall einordnen

PassWo erklärt, was abgeflossen ist, und eröffnet die Frage nach dem Vorgehen des Angreifers.

*Eine Sprechblase mit folgenden Absätzen:*

> Bei Campusgram gab es ein Datenleck. Eine alte Datei mit gespeicherten Passwortdaten ist in fremde Hände geraten.
>
> Wie geht ein Angreifer vor, um das Campusgram-Passwort herauszufinden?

<a id="s05"></a>

## S05 — Passwortstärke aus Angreiferperspektive verstehen

Ausgehend vom fiktiven Campusgram-Passwort zeigt das Training frühe Passwortkandidaten, persönliche und dienstbezogene Bestandteile, Strukturmuster und vollständiges Durchprobieren. Anschließend veranschaulichen Kugeln den Einfluss von Länge und Zufälligkeit. Rückmeldungen beziehen sich ausschließlich auf die begrenzte Übung.

Quelle: [s05.ts](packages/training-content/src/s05.ts), Content-Version 2.136.1.

### S05-01 — Vom Zeichenraten zu merkbaren Bausteinen

Eine zufällige Zeichenfolge und ein merkbares Beispielpasswort werden gegenübergestellt. Das merkbare Beispiel zerfällt in Bausteine, die ein Angreifer kombinieren kann.

> Der Angreifer kann grundsätzlich jede denkbare Zeichenfolge ausprobieren.

> Zufällige Zeichenfolgen sind jedoch schwer zu merken. Selbst gewählte Passwörter enthalten deshalb oft merkbare Elemente wie Wörter, Zahlen oder einfache Zeichenfolgen.

> Du kannst dir diese Teile vereinfacht wie einzelne 'Bausteine' vorstellen.

> Der Angreifer kann solche 'Bausteine' kombinieren und die daraus entstehenden Passwörter ausprobieren.

*Eine Sprechblase mit folgenden Absätzen:*

> Dabei beginnt er mit Passwörtern und Zeichenfolgen, die besonders häufig verwendet werden.
>
> Bitte beachte: Das Modul kann Fehler machen und dient nur zum Verständnis, nicht zur Sicherheitsbewertung.

### S05-02 — Häufig verwendete Passwörter und Zeichenfolgen

Eine Laufbandmaschine zeigt häufige Kandidaten und typische Abwandlungen. Danach prüft die Person das eigene fiktive Campusgram-Passwort.

> Dazu gehören häufig verwendete Passwörter, geläufige Wörter, einfache Tastatur- und Zahlenfolgen wie „123456“ oder „qwertz“ sowie Jahreszahlen.

> Wörter sind nicht grundsätzlich unsicher. Geläufige Wörter können Angreifer jedoch mithilfe von Wörterlisten früh ausprobieren.

> Bei selbst gewählten Passwörtern kommen außerdem oft Änderungen wie Großschreibung, Zeichenersetzungen, Zahlen oder Symbole vor. Auch solche typischen Abwandlungen werden ausprobiert.

> Prüfen wir nun dein gewähltes Passwort auf häufig verwendete Passwörter und Zeichenfolgen.

**Ergebnisvarianten — je nach Befund:**

**Kein Treffer:**

> Hier wurde kein früh geprüfter Bestandteil erkannt.

**Ein Treffer:**

> [Teile] wird häufig verwendet.

**Mehrere Treffer:**

> [Teile] werden häufig verwendet.

Falls die Treffer die gesamte Zeichenfolge abdecken, folgt in derselben Sprechblase zusätzlich einer dieser Absätze:

**Ein Kandidat deckt alles ab:**

> Die gefundene Übereinstimmung deckt bereits die gesamte Zeichenfolge ab.

**Mehrere Treffer decken zusammen alles ab:**

> Mehrere gefundene Übereinstimmungen decken gemeinsam die gesamte Zeichenfolge ab.

### S05-03 — Persönliche Angaben

PassWo erklärt, warum vertraute persönliche Angaben für Angreifer naheliegen können. Die Person markiert mögliche persönliche Bestandteile ausschließlich im fiktiven Übungspasswort.

> Persönliche Angaben sind vertraut und meist leicht zu merken. Gerade weil sie persönlich sind, können sie schwer erratbar wirken.

> Bei einem Datenleck können jedoch Kennungen wie Benutzername, E-Mail-Adresse oder Telefonnummer offengelegt werden.

> Angreifer können damit nach öffentlich verfügbaren Angaben wie Name, Geburtsdatum oder Interessen suchen und diese als mögliche Passwortbestandteile ausprobieren.

> Deine Auswahl wird weder dauerhaft gespeichert noch exportiert. Markiere für den Selbstcheck mögliche persönliche Angaben im fiktiven Passwort.

**Ergebnisvarianten — je nach Befund:**

**Persönliche Angabe markiert:**

> Du hast [Angaben] als persönliche Angabe eingeordnet.

**Keine persönliche Angabe markiert:**

> Du hast keine persönliche Angabe eingeordnet.

Falls die Treffer die gesamte Zeichenfolge abdecken, folgt in derselben Sprechblase zusätzlich einer dieser Absätze:

**Ein Kandidat deckt alles ab:**

> Die gefundene Übereinstimmung deckt bereits die gesamte Zeichenfolge ab.

**Mehrere Treffer decken zusammen alles ab:**

> Mehrere gefundene Übereinstimmungen decken gemeinsam die gesamte Zeichenfolge ab.

### S05-04 — Bezug zum Konto, Dienst oder Umfeld

Das Laufband zeigt kontobezogene Begriffe. Geprüft wird, ob im fiktiven Passwort ein Bezug zu Campusgram erkannt wird.

> Um sich leichter zu merken, welches Passwort zu welchem Konto gehört, werden oft Begriffe mit Bezug zum Konto, zum Dienst oder zu dessen Umfeld eingebaut. Solche Bezüge kann ein Angreifer gezielt mitprüfen.

> Bei Campusgram wären das zum Beispiel der Benutzername, Campus, Nachricht oder der Dienstname. Bei einem WLAN-Passwort etwa WLAN, Router oder Fritzbox.

> Prüfen wir nun dein gewähltes Passwort auf einen möglichen Bezug zu Campusgram.

**Ergebnisvarianten — je nach Befund:**

**Kein Treffer:**

> Hier wurde kein direkter Bezug zu Campusgram erkannt.

**Ein Treffer:**

> [Begriffe] wurde in deinem Passwort als Begriff mit Bezug zu Campusgram erkannt.

**Mehrere Treffer:**

> [Begriffe] wurden in deinem Passwort als Begriffe mit Bezug zu Campusgram erkannt.

Falls die Treffer die gesamte Zeichenfolge abdecken, folgt in derselben Sprechblase zusätzlich einer dieser Absätze:

**Ein Kandidat deckt alles ab:**

> Die gefundene Übereinstimmung deckt bereits die gesamte Zeichenfolge ab.

**Mehrere Treffer decken zusammen alles ab:**

> Mehrere gefundene Übereinstimmungen decken gemeinsam die gesamte Zeichenfolge ab.

### S05-05 — Die bisherigen Bestandteile zusammenfassen

PassWo ordnet die drei Prüfungen ein. Genau eine der folgenden Varianten erscheint.

**Ganzes Passwort als Kandidat gefunden:**

> Das Campusgram-Passwort wurde bei dieser Prüfung bereits gefunden. Die Simulation zeigt dennoch weitere typische Vorgehensweisen.

**Mehrere Treffer decken das Passwort ab:**

> Mehrere frühe Übereinstimmungen decken zusammen das ganze Passwort ab. Erraten ist es dadurch noch nicht. Die Simulation zeigt noch weitere typische Vorgehensweisen.

**Nur Teile erkannt:**

> Bei den bisherigen Prüfungen wurden Teile des Passworts erkannt. Erraten ist es dadurch noch nicht. Die Simulation zeigt noch weitere typische Vorgehensweisen.

**Keine Übereinstimmung:**

> Bei den bisherigen Prüfungen wurde keine Übereinstimmung gefunden. Das bedeutet jedoch nicht, dass bereits alle Angriffsmöglichkeiten geprüft wurden.

### S05-06 — Struktur: Wie werden Bausteine kombiniert?

Der Blick wechselt von einzelnen Bestandteilen zu Zusammenhängen, Satzmustern und Wiederholungen.

> Angreifer prüfen nämlich nicht nur häufige Zeichenfolgen, persönliche Angaben oder Kontobezüge. Sie berücksichtigen auch typische Muster, mit denen solche Elemente zu leichter merkbaren Passwörtern kombiniert werden.

### S05-07 — Naheliegende inhaltliche Zusammenhänge

Beispiele wie WLAN, Wohnzimmer und Familie zeigen verwandte Begriffe. Danach kann die Person zusammengehörige Teile des eigenen fiktiven Passworts gruppieren.

> Auch verschiedene Wörter können zusammen vorhersehbar sein. „WLAN“, „Wohnzimmer“ und „Familie“ passen beispielsweise inhaltlich zusammen.

> Je naheliegender der Zusammenhang, desto besser kann der Angreifer einschätzen, welche Kombinationen sich zuerst zu testen lohnen.

**Mehrere Bausteine vorhanden:**

> Welche Teile gehören für dich inhaltlich zusammen?

**Nur ein Baustein erkannt:**

> Hier wurde nur ein Teil erkannt. Vielleicht siehst du selbst noch Zusammenhänge, die nicht erkannt wurden.

### S05-08 — Vorhersehbare Satz- und Phrasenstrukturen

Bekannte Formulierungen werden sichtbar. Danach kann die Person Satz- oder Phrasenstrukturen im fiktiven Passwort einordnen.

> Auch bekannte oder sprachlich naheliegende Formulierungen machen Bestandteile vorhersagbarer.

> Nach „Ohne Kaffee geht“ liegt etwa „nichts“ als Fortsetzung nahe. Solche Muster kommen zum Beispiel bei Redewendungen, Liedzeilen oder anderen geläufigen Formulierungen vor.

**Mehrere Bausteine vorhanden:**

> Welche Teile bilden für dich eine Satz- oder Phrasenstruktur?

**Nur ein Baustein erkannt:**

> Vielleicht siehst du selbst noch eine Struktur, die nicht erkannt wurde.

### S05-09 — Wiederholungsmuster

Wiederholte Blöcke zeigen, warum mehr Zeichen nicht automatisch mehr unabhängige Auswahl bedeuten. Anschließend erscheint die passende Rückmeldung zum Campusgram-Passwort.

> Auch Wiederholungen können ein Passwort länger wirken lassen, obwohl sich Teile nur wiederholen.

> Erkennt oder vermutet ein Angreifer den wiederholten Grundbaustein, kann er gezielt solche Wiederholungsmuster prüfen.

**Wiederholung erkannt:**

> Dein Campusgram-Passwort enthielt genau so eine Wiederholung.

**Keine entsprechende Wiederholung erkannt:**

> Dein Campusgram-Passwort enthielt so eine Wiederholung nicht.

### S05-10 — Vollständiges Durchprobieren und irreführende Passwortregeln

Zwei Passwörter werden mit einer Regel- und Stärkeanzeige verglichen: ein vorhersehbares Muster und eine zufällige Zeichenfolge. Die Anzeige ist Teil des kritisierten Beispiels.

> Greifen frühe Passwortkandidaten und typische Muster nicht, kann der Angreifer bei einem Datenleck noch alle möglichen Zeichenfolgen durchprobieren.

> Viele bekannte Passwortregeln sollen genau dieses Durchprobieren erschweren.

> Doch sie können täuschen. Passw0rt123! erfüllt alle angezeigten Regeln und wird als stark bewertet.

> Das rechte Passwort ist genauso lang und enthält ebenfalls alle vier Zeichentypen, besteht aber aus zwölf zufällig erzeugten Zeichen.

> Deshalb kann ein Passwort als stark markiert werden, obwohl es typischen Mustern folgt und vom Angreifer früh ausprobiert wird.

> Verschiedene Zeichentypen können ein Passwort stärker machen, werden bei selbst gewählten Passwörtern aber oft vorhersehbar eingesetzt.

> Darauf zu hoffen, dass der Angreifer eine Abwandlung wie „mEin!Pa55w0rt?“ nicht prüft, ist riskant.

> Das musst du auch nicht. Bei selbst gewählten Passwörtern kommt es vor allem auf die Länge an, nicht darauf, bestimmte Zeichentypen einzubauen.

> Wie lang sollte ein solches Passwort mindestens sein? Um das zu sehen, nehmen wir ein Passwort, das nur aus zufälligen Kleinbuchstaben besteht.

### S05-11 — Länge schätzen und die Kugelvisualisierung erkunden

Die Person schätzt eine Mindestlänge. Danach verändert sie in der Kugel-/Messskalenansicht die Länge zufälliger Kleinbuchstaben bis mindestens 16 Zeichen. Während dieser Erkundung gibt es keine weitere PassWo-Sprechblase. Die Darstellung rechnet modellhaft mit unabhängig zufälligen Zeichen, vollständigem Durchprobieren und einer Billion Versuchen pro Sekunde; sie ist keine konkrete Knackzeit-Prognose.

> Was glaubst du: Ab welcher Länge wird es für einen Angreifer zu aufwendig, alle Möglichkeiten durchzuprobieren?

### S05-12 — Zeichenvorrat vergleichen und Längenorientierung ableiten

Eine gelbe Vergleichskugel steht für zwölf zufällige Zeichen aus mehreren Zeichentypen. Danach folgt die Orientierung für selbst gewählte Passwörter. Die zusätzlichen Informationsfelder zur Herkunft der Empfehlung sind Oberflächentexte, kein weiterer PassWo-Dialog.

> Die gelbe Kugel zeigt, warum zwölf zufällige Zeichen aus mehreren Zeichentypen wie „k7#M!9p$2Lq&“ so aufwendig durchzuprobieren sind.“

> Da sich diese Zufälligkeit bei selbst gewählten Passwörtern jedoch nicht voraussetzen lässt, sollten sie mindestens 15 Zeichen lang sein.

### S05-13 — Warum Wörter oft mehr Platz brauchen

Die Visualisierung stellt „Datensicherheit“, mehrere sehr kurze Wörter und vier zufällige Wörter aus einer großen deutschen Wortliste gegenüber. Kugeln und Auswahlpakete zeigen die unterschiedlichen Kombinationsräume.

> Warum selbst gewählte Passwörter oft noch länger werden, schauen wir uns jetzt am Beispiel von Wörtern an.

> Nehmen wir dafür Datensicherheit als Passwort.

> Das ist merkbar und 15 Zeichen lang, für den Angreifer aber nur ein einzelnes deutsches Wort.

> Um bei 15 Zeichen zu bleiben und es schwerer erratbar zu machen, könnten wir stattdessen mehrere Wörter verwenden.

> Je mehr Wörter in 15 Zeichen passen sollen, desto kürzer müssen sie sein. Von sehr kurzen Wörtern gibt es aber nur wenige, sodass ihre Kombinationen schnell durchprobiert sind.

> Vier zufällige Wörter aus einer großen deutschen Wortliste sind dagegen schnell länger als 15 Zeichen. Das Durchprobieren aller Kombinationen dauert hier etwa 1,3 Jahre.

> Mehrere zufällige Wörter brauchen also mehr Platz, wenn das Passwort schwer zu erraten sein soll.

### S05-14 — Größere Wortauswahl oder zusätzliche Wörter

Vier Wörter aus einer deutschen Liste werden mit vier Wörtern aus kombinierten Sprachlisten und mit sechs deutschen Wörtern verglichen. Die genannten Zeiten gehören zum vereinfachten Rechenmodell der Szene.

> Jetzt können wir das Erraten noch weiter erschweren.

> Dafür vergrößern wir die Auswahl pro Wort und legen deutsche, spanische, französische und japanische Wortlisten zusammen.

> Damit vervierfacht sich die Auswahl für jedes Wort.

> Oder wir bleiben bei deutschen Wörtern und fügen zwei weitere zufällige Wörter hinzu. Dann steigt der Aufwand auf etwa 8,3 Milliarden Jahre.

### S05-15 — Länge und Unvorhersehbarkeit verbinden

Der Vergleich kehrt zu einzelnen Zeichen zurück und kündigt die spätere praktische Passphrasenübung an.

> Bei einzelnen Zeichen sehen wir etwas Ähnliches: 16 zufällige Kleinbuchstaben sind aufwendiger durchzuprobieren als 12 zufällige Zeichen aus allen Zeichentypen.

> Zusätzliche Länge kann den Aufwand also stark erhöhen, ohne bestimmte Zeichentypen zu brauchen - aber nur, wenn die neuen Zeichen oder Wörter nicht vorhersehbar sind.

> Wie du mit sechs zufälligen Wörtern ein schwer zu erratendes und trotzdem merkbares Passwort erstellst, probieren wir später praktisch aus.

### S05-16 — Das Campusgram-Passwort in der Übung abschließend einordnen

PassWo erklärt die Grenze der lokalen Prüfung. Danach erscheinen genau eine Ergebnisvariante und eine Längenvariante.

*Eine Sprechblase mit folgenden Absätzen:*

> Bevor wir dazu kommen, schließen wir erst ab, was die bisherigen Prüfungen für dein Campusgram-Passwort bedeuten.
>
> Für diese Übung gilt es als gefunden, wenn einer dieser Wege das ganze Passwort innerhalb der Übungsgrenze erzeugt. Nicht gefunden ist kein Sicherheitsnachweis.

**Früher Kandidat trifft das ganze Passwort:**

> Ein früher Kandidat trifft genau das ganze Campusgram-Passwort. Deshalb gilt es hier als gefunden.

**Kombination oder typische Änderung trifft:**

> Eine Kombination oder typische Änderung trifft genau das ganze Campusgram-Passwort. Deshalb gilt es hier als gefunden.

**Früher Kandidat mit kurzem Rest trifft:**

> Ein früher Kandidat plus ein kurzer durchprobierter Rest trifft das ganze Passwort. Deshalb gilt es hier als gefunden.

**Vollständiges Durchprobieren liegt innerhalb der Grenze:**

> Das vollständige Durchprobieren liegt für dieses Passwort innerhalb der Übungsgrenze. Deshalb gilt es hier als gefunden.

**Kein gezeigter Weg findet das ganze Passwort:**

> Keiner der gezeigten Wege trifft das ganze Campusgram-Passwort innerhalb der Übungsgrenze. Deshalb gilt es hier als nicht gefunden.

**Weniger als 15 Zeichen:**

> Mit [Anzahl] Zeichen liegt es unter der 15-Zeichen-Orientierung für selbst gewählte Passwörter.

**Mindestens 15 Zeichen:**

> Mit [Anzahl] Zeichen erreicht es die 15-Zeichen-Orientierung für selbst gewählte Passwörter.

### S05-17 — Vom einzelnen Passwort zu anderen Konten

Das Kontonetzwerk wird wieder sichtbar. Gleiche und leicht abgewandelte Passwörter leiten zum nächsten Segment über.

> Das Passwort selbst ist damit geprüft. Jetzt schauen wir, ob bei anderen Konten dasselbe Passwort oder eine leichte Abwandlung verwendet wird.

> Wird eines davon bekannt, können Angreifer dasselbe Passwort und leichte Abwandlungen auch bei anderen Konten ausprobieren.

<a id="s06"></a>

## S06 — Wiederverwendung und Ähnlichkeit: Folgen im Kontonetzwerk

Die Übung prüft Wege zwischen den drei Konten und betrachtet Master Campus und Campus E-Mail zusätzlich für sich. Je nach Campusgram-Ergebnis wird ein tatsächlicher oder ein ausdrücklich hypothetischer Verlauf gezeigt.

Quelle: [s06.ts](packages/training-content/src/s06.ts), Content-Version 2.51.0.

### S06-01 — Ausgangspunkt Campusgram

Genau eine Variante knüpft an die Prüfung aus S05 an.

**Campusgram-Passwort gefunden:**

> Beim Campusgram-Datenleck stand das Passwort nicht im Klartext. Unsere Übung konnte es trotzdem ermitteln. Jetzt prüfen wir, ob dasselbe Passwort oder leichte Abwandlungen auch zu den anderen Konten führen.

**Campusgram-Passwort nicht gefunden:**

> Beim Campusgram-Datenleck stand das Passwort nicht im Klartext, und unsere Übung hat es nicht ermittelt. Mit den gestohlenen Passwortdaten kann aber weiter versucht werden, es zu ermitteln. Deshalb schauen wir kurz, was passiert, falls es später bekannt wird.

### S06-02 — Campusgram mit den anderen Konten vergleichen

Für den Vergleich mit Master Campus und mit Campus E-Mail erscheint jeweils die passende Variante. Die gleiche Formulierung kann daher mehrfach vorkommen.

**Dasselbe Passwort:**

> Wird dieses Passwort bekannt, kann es auch beim anderen Konto ausprobiert werden.

**Leichte Abwandlung:**

> Wird dieses Passwort bekannt, liegt die leichte Abwandlung beim anderen Konto nahe.

**Kein erkannter Weg:**

> Die hier geprüften Varianten führen nicht zum anderen Passwort.

### S06-03 — Ausbreitung von Campusgram zusammenfassen

Genau eine Rückmeldung beschreibt die beiden geprüften Verbindungen; tatsächlicher und hypothetischer Verlauf bleiben unterscheidbar.

**Tatsächlicher Verlauf: kein weiteres Konto:**

> Von Campusgram führt hier weder dasselbe Passwort noch eine leichte Abwandlung zu den anderen Konten.

**Tatsächlicher Verlauf: ein weiteres Konto:**

> Von Campusgram führt dasselbe Passwort oder eine leichte Abwandlung zu einem weiteren Konto.

**Tatsächlicher Verlauf: beide anderen Konten:**

> Von Campusgram führen dasselbe Passwort oder leichte Abwandlungen zu beiden anderen Konten.

**Hypothetischer Verlauf: kein weiteres Konto:**

> Falls das Campusgram-Passwort später bekannt wird, bleibt dieser Weg auf Campusgram begrenzt.

**Hypothetischer Verlauf: ein weiteres Konto:**

> Falls das Campusgram-Passwort später bekannt wird, ist über dasselbe Passwort oder eine leichte Abwandlung auch ein weiteres Konto gefährdet.

**Hypothetischer Verlauf: beide anderen Konten:**

> Falls das Campusgram-Passwort später bekannt wird, sind über dasselbe Passwort oder leichte Abwandlungen auch beide anderen Konten gefährdet.

### S06-04 — Perspektivwechsel zu Master Campus

Unabhängig vom ersten Vorfall betrachtet die Übung nun Master Campus für sich. Die Person kann Muster und persönliche Angaben im fiktiven Passwort markieren.

> Ein Datenleck kann bei jedem Konto passieren. Deshalb prüfen wir jetzt Master Campus für sich und seine Verbindung zur Campus E-Mail.

> Markiere kurz Muster oder persönliche Angaben, die dir im Master-Campus-Passwort auffallen.

### S06-05 — Ergebnis der Einzelprüfung für Master Campus

Je nach Ergebnis erscheint eine dieser Varianten.

**Gefunden:**

> Auch das Master-Campus-Passwort wird in unserer Übung gefunden. Unabhängig davon prüfen wir jetzt seine Verbindung zur Campus E-Mail.

**Durch vollständiges Durchprobieren gefunden:**

> Das vollständige Durchprobieren findet auch das Master-Campus-Passwort. Jetzt prüfen wir noch seine Verbindung zur Campus E-Mail.

**Nicht gefunden:**

> Das Master-Campus-Passwort wurde hier nicht gefunden. Ob es mit der Campus E-Mail verbunden ist, prüfen wir trotzdem.

### S06-06 — Master Campus mit Campus E-Mail vergleichen

Die Verbindung zwischen den beiden verbleibenden Konten wird geprüft.

**Dasselbe Passwort:**

> Master Campus und Campus E-Mail verwenden dasselbe Passwort. Wird eines bekannt, kann es auch beim anderen ausprobiert werden.

**Leichte Abwandlung:**

> Die beiden Passwörter sind leicht abgewandelt. Wird eines bekannt, liegt auch die andere Variante nahe.

**Keine leichte Abwandlung:**

> Zwischen den beiden wurde keine leichte Abwandlung erkannt.

### S06-07 — Campus E-Mail für sich prüfen

Zum Schluss folgt die Einzelbetrachtung des E-Mail-Passworts mit passender Ergebnisvariante.

> Zum Schluss prüfen wir das Campus-E-Mail-Passwort noch für sich.

**Gefunden:**

> Auch das Campus-E-Mail-Passwort wird in unserer Übung gefunden. Es sollte deshalb später ersetzt werden.

**Durch vollständiges Durchprobieren gefunden:**

> Das vollständige Durchprobieren findet auch das Campus-E-Mail-Passwort. Es sollte deshalb später ersetzt werden.

**Nicht gefunden:**

> Für sich wurde das Campus-E-Mail-Passwort in unserer Prüfung nicht gefunden.

### S06-08 — Campusgram wegen des Datenlecks ersetzen

Der nächste praktische Schritt ist unabhängig davon nötig, ob die begrenzte Übung das Passwort gefunden hat.

> Das Campusgram-Passwort ersetzen wir jetzt wegen des Datenlecks, unabhängig davon, wie schwer es hier zu erraten war. Die übrigen offenen Punkte beheben wir danach.

<a id="s07"></a>

## S07 — Eine Passphrase erstellen und bei Campusgram einsetzen

Die Person öffnet die simulierte Suche, nutzt den lokalen Passphrasen-Generator und ersetzt das Campusgram-Passwort.

Quelle: [s07.ts](packages/training-content/src/s07.ts), Content-Version 4.23.0.

### S07-01 — Die Methode praktisch anwenden

PassWo greift die sechs zufälligen Wörter aus S05 auf und führt zum neuen Tab.

> Jetzt nutzen wir die Idee von vorhin: sechs zufällige, voneinander unabhängige Wörter. Ein solches Passwort nennt man Passphrase.

> Öffne den neuen Tab und lass dir dort eine Passphrase generieren. Danach setzt du sie bei Campusgram ein.

### S07-02 — Generieren und eine Merkhilfe kennenlernen

Während der Generierung erscheint die kurze Status-Sprechblase. Anschließend erläutert PassWo eine mögliche Erinnerungsstrategie.

> Passphrase wird erstellt …

> Für jetzt musst du sie dir nicht merken. Im Alltag kann eine kleine Geschichte das Erinnern erleichtern.

**Je nach generierter Passphrase erscheint genau eine Beispielgeschichte:**

**Beispielgeschichte 1:**

> Beispiel: Beim Dorffest moniert ein Knirps am Plexiglas, weil sein Eistee in der Bergbahn verschüttet wurde.

**Beispielgeschichte 2:**

> Beispiel: Nach dem Festbesuch korrumpiert ein Infekt Textstellen im Gehirn. Das ist offenbar Physik.

**Beispielgeschichte 3:**

> Beispiel: Im Sommer schwankt beim Seiltanz eine Haartracht. Ein Kennwort leuchtete darin mythisch und verfiel.

**Beispielgeschichte 4:**

> Beispiel: Für Popkultur entstehen Holzarbeiten in der Wohnsiedlung. Nach einer Drohung heißt es streng: Knieprobleme, Schluss.

**Beispielgeschichte 5:**

> Beispiel: Im Nirgendwo wird es beim Querkommen finster. Einen Appell und ein Ersuchen notiere ich mit Bleistift.

### S07-03 — Das Campusgram-Passwort ist ersetzt

Nach dem Einsetzen und Bestätigen erklärt PassWo die Wirkung des Wechsels.

> Das Campusgram-Passwort ist ersetzt. Selbst wenn das alte später aus den gestohlenen Passwortdaten ermittelt wird, funktioniert es dort nicht mehr.

**Weitere offene Punkte im Netzwerk:**

> Die übrigen offenen Punkte siehst du gleich wieder im Netzwerk. Verwende dort bei jedem markierten Konto eine eigene Passphrase, bis alle offenen Punkte behoben sind.

**Keine weiteren offenen Punkte:**

> Bei den anderen Konten ist hier nichts mehr offen.

<a id="s08"></a>

## S08 — Offene Passwortprobleme im Netzwerk beheben

Die Person verwendet bei noch markierten Konten jeweils eine eigene vorgegebene Passphrase. Danach lässt sie den Angriff erneut ablaufen und geht zur Zusammenfassung. Der Auftrag dazu wurde bereits am Ende von S07 gesprochen.

Quelle: [s08.ts](packages/training-content/src/s08.ts), Content-Version 3.8.0.

### S08-01 — Konten überarbeiten und Angriff erneut ansehen

Im aktuellen Trainingslauf erscheint hier keine zusätzliche PassWo-Sprechblase. Die Person bearbeitet offene Konten über „Eigene Passphrase verwenden“, startet den erneuten Angriff und wechselt mit „Zur Zusammenfassung“ weiter. Wenn keine weiteren Punkte offen sind, entfällt die Nacharbeit.

<a id="s09"></a>

## S09 — Passwortprinzipien zusammenfassen

Eine Übersicht bündelt die Passwortprinzipien. S09, S10 und S11 verwenden dieselbe Inhaltsdatei, sind im integrierten Lauf aber getrennte Fortschrittsmarken.

Quelle: [s09.ts](packages/training-content/src/s09.ts), Content-Version 4.9.0.

### S09-01 — Die Übersicht lesen

Hier spricht PassWo keinen zusätzlichen Dialog. Zur szenischen Vollständigkeit folgt der sichtbare Überblick als **Übersichtstext, nicht als Sprechblase**:

- Mindestens 15 Zeichen verwenden.
- Kein bestimmter Zeichenmix nötig: Länge ist wichtiger.
- Persönliche Angaben sowie Konto- oder Dienstbezüge vermeiden.
- Bestandteile ohne Zusammenhang wählen.
- Für jedes Konto ein eigenes Passwort verwenden.
- Merkbare Methode: mindestens sechs zufällig gewählte Wörter als Passphrase.

<a id="s10"></a>

## S10 — Die drei geschützten Konten einordnen

Nach dem Abschließen der Übersicht ist wieder das Netz der drei Trainingskonten zu sehen. PassWo hält das erreichte Ergebnis fest.

Quelle: [s09.ts](packages/training-content/src/s09.ts), Content-Version 4.9.0.

### S10-01 — Ergebnis der Passwortüberarbeitung

Diese Sprechblase gehört zur Fortschrittsmarke S10.

> Für die drei Konten sind die offenen Probleme aufgelöst: Die Passwörter sind stark und keines ist mehr mit einem anderen verbunden.

<a id="s11"></a>

## S11 — Von drei zu vielen Konten: Grenzen des Merkbaren

Das Netzwerk wächst zunächst auf die veranschaulichte Größenordnung von 134 Konten und reduziert sich für die persönliche Einschätzung auf 80. Danach werden problematische Passwortbeziehungen sichtbar und der Passwortmanager angekündigt.

Quelle: [s09.ts](packages/training-content/src/s09.ts), Content-Version 4.9.0.

### S11-01 — Viele Konten im Alltag

Die Größenordnung wird eingeordnet, dann beurteilt die Person die Frage für 80 Konten.

> Im Alltag sind es aber deutlich mehr. Eine CHI-Studie von 2026 schätzt, dass eine typische Person im Laufe der Zeit Accounts bei rund 134 Online-Diensten hatte.

> Bleiben wir darunter: Wie realistisch wäre es für dich, für 80 Konten jeweils ein starkes, eigenes Passwort dauerhaft im Kopf zu behalten?

### S11-02 — Verwaltungsaufwand und typische Auswege

PassWo erklärt, wie Wiederverwendung, Abwandlungen und eigene Listen entstehen können.

> Bei so vielen Konten wird die eigene Passwortverwaltung schnell unüberschaubar.

> Deshalb ist es nachvollziehbar, dass Passwörter wiederverwendet, leicht abgewandelt oder selbst notiert werden.

> Die Risiken davon hast du gerade gesehen. Auch ungeschützte Passwortlisten können selbst zum Risiko werden.

### S11-03 — Übergang zum Passwortmanager

Nach der letzten Sprechblase führt „Passwortmanager kennenlernen“ zur zweiten Sektion mit den Schritten Verstehen, neues Konto einrichten und bestehendes Konto umstellen.

> Die gute Nachricht: Du musst dir all diese Passwörter auch gar nicht selbst merken.

<a id="s12"></a>

## S12 — Passwortmanager verstehen: erzeugen, speichern, ausfüllen

PassWo demonstriert die drei Grundfunktionen, den geschützten Tresorzugang und die Unterschiede zwischen eigenständigen und integrierten Passwortmanagern.

Quelle: [s12.ts](packages/training-content/src/s12.ts), Content-Version 1.11.0.

### S12-01 — Die drei Funktionen kennenlernen

Ein Passwort wird erzeugt, dem passenden Konto im Tresor zugeordnet und in einem Anmeldebeispiel ausgefüllt.

> Ein Passwortmanager kann für jedes Konto ein eigenes Passwort erzeugen, speichern und beim Anmelden wieder ausfüllen.

> Weil du es nicht selbst auswendig lernen musst, kann der Manager ein langes, zufälliges Passwort erzeugen.

> Im Tresor speichert er, welches Passwort zu welchem Konto gehört.

> Beim nächsten Anmelden kann er den passenden gespeicherten Eintrag automatisch ausfüllen.

### S12-02 — Den Zugang zum Tresor schützen

PassWo verlagert den Blick von den einzelnen Kontopasswörtern auf den Zugang zur Passwortverwaltung.

> Die einzelnen Passwörter musst du dir damit nicht mehr merken. Dafür schützt du den Zugang zu deinem Passwortmanager.

### S12-03 — Eigenständige und integrierte Passwortmanager

Die beiden Varianten werden gegenübergestellt. Die bekannte Passphrase dient als Beispiel für ein Masterpasswort.

> Viele Browser und Geräte enthalten bereits einen Passwortmanager. Daneben gibt es eigenständige Passwortmanager.

> Eigenständige Passwortmanager schützen ihren Tresor meist mit einem Masterpasswort. Dafür kannst du zum Beispiel die Passphrase aus Abschnitt 1 verwenden.

> Bei integrierten Passwortmanagern übernimmt häufig dein geschützter Geräte- oder Plattformzugang diese Aufgabe.

### S12-04 — Auftrag für das neue MyShop-Konto

Für die folgende Praxis wird der in den simulierten Browser integrierte Passwortmanager verwendet.

> Für die Übung nutzen wir den Passwortmanager integriert im Browser. Lege damit jetzt ein neues Konto bei MyShop an.

<a id="s13"></a>

## S13 — Passwortmanager anwenden: neue und bestehende Konten umstellen

Die Person registriert MyShop, ändert ein bestehendes Passwort bei Muster Bank und meldet sich bei Campusgram ohne Autofill an. Danach folgen schrittweise Umstellung, Systemwahl, Wiederherstellung und der Übergang zu MFA.

Quelle: [s13.ts](packages/training-content/src/s13.ts), Content-Version 4.8.0.

### S13-01 — MyShop: ein Passwort erzeugen

Optionaler PassWo-Hinweis während der Registrierung.

> Klicke in das Passwortfeld und wähle den Vorschlag des integrierten Passwortmanagers.

### S13-02 — MyShop: registrieren und speichern

Optionaler Handlungshinweis, dann gegebenenfalls die Reaktion auf einen abgelehnten Speicherhinweis.

> Registriere das Konto und bestätige danach den Speichern-Hinweis des Browsers.

**Nur wenn „Speichern“ abgelehnt wurde — zwei aufeinanderfolgende Sprechschritte:**

> Das Passwort ist damit noch nicht im Passwortmanager gespeichert.

> Dann kann er es beim nächsten Anmelden auch nicht wieder für dich einsetzen. Öffne den Speicherhinweis noch einmal und speichere den Eintrag.

### S13-03 — MyShop: den gespeicherten Eintrag verwenden

Nach dem Speichern wird die Anmeldung erneut ausprobiert. Der mittlere Absatz ist der optionale Ausfüllhinweis; zum Schluss wird der Browser geschlossen.

> Der Eintrag ist im Tresor gespeichert. Melde dich noch einmal an.

> Wähle den gespeicherten Eintrag aus und klicke nach dem Ausfüllen selbst auf Anmelden.

> Geschafft! Schließe den Browser und schau, was sich im Netzwerk verändert hat.

### S13-04 — Neues Konto und importierte Zugangsdaten im Netzwerk

MyShop erscheint mit eigenem Passwort. Ein Tresor mit vorhandenen Konten wird gezeigt; Muster Bank besitzt zunächst noch eine Passwortbeziehung zu einem anderen Konto.

> Das neue Konto startet direkt mit einem eigenen starken Passwort.

> Viele Passwortmanager können vorhandene Zugangsdaten auch importieren. In unserer Übung sind sie bereits gespeichert.

> Dadurch ändert sich das Passwort beim jeweiligen Dienst aber noch nicht.

> Muster Bank verwendet zum Beispiel noch dasselbe Passwort wie ein anderes Konto.

> Um das zu ändern, musst du das Passwort direkt bei Muster Bank in den Einstellungen ersetzen. Lass dir dafür vom Passwortmanager ein neues erzeugen.

### S13-05 — Muster Bank: anmelden und den Passwortwechsel finden

Optionale Hinweise führen zur Anmeldung mit dem gespeicherten Eintrag und über die Einstellungen zur Passwortänderung.

> Öffne das Passwortfeld und wähle den gespeicherten Eintrag für Muster Bank.

> Öffne Einstellungen, dann Sicherheit und anschließend Passwort.

> Verwende für beide neuen Passwortfelder den Vorschlag des Passwortmanagers und bestätige mit „Passwort ändern“.

### S13-06 — Muster Bank: den Tresoreintrag aktualisieren

Nach dem Passwortwechsel beim Dienst muss auch der gespeicherte Eintrag aktualisiert werden. Die folgenden drei Hinweise erscheinen nur bei abgelehnter Aktualisierung; der letzte ist der erneut aufrufbare Hinweis.

> Im Passwortmanager ist damit noch das alte Passwort gespeichert.

> Damit er beim nächsten Anmelden das neue verwendet, öffne den Hinweis noch einmal und aktualisiere den Eintrag.

> Aktualisiere den Eintrag, damit der Passwortmanager das neue Passwort verwendet.

**Sobald der Eintrag aktualisiert ist:**

> Jetzt ist auch im Passwortmanager das neue Passwort gespeichert. Melde dich ab und anschließend mit dem neuen Passwort wieder an.

### S13-07 — Muster Bank: automatisches Ausfüllen erleben

Bei der erneuten Anmeldung füllt der Manager direkt aus. Danach führt das Schließen des Browsers zurück ins Netzwerk.

> Vorhin hast du den gespeicherten Eintrag noch selbst ausgewählt. Diesmal hat ihn der Passwortmanager direkt ausgefüllt. Bei vielen Anmeldungen kann er das automatisch übernehmen.

> Schließe den Browser wieder und schau, was die Änderung bei Muster Bank im Netzwerk bewirkt.

### S13-08 — Muster Bank ist umgestellt; Campusgram folgt

Im Netzwerk verschwindet die alte Passwortverbindung. Ein eigener Sprechschritt gibt anschließend den Campusgram-Auftrag.

> Muster Bank hat jetzt ein eigenes Passwort. Der bisherige Verbindungsweg ist weg.

> Versuch dich zum Abschluss noch einmal bei Campusgram anzumelden. Deine Passphrase ist bereits im Passwortmanager gespeichert.

### S13-09 — Campusgram: anmelden, wenn Autofill nicht klappt

Die Person öffnet über die Browser-Einstellungen den Passwortmanager, kopiert den gespeicherten Wert und setzt ihn bei Campusgram ein.

> Bei Campusgram klappt das Ausfüllen hier nicht.

> Öffne über die Browser-Einstellungen den Passwortmanager und kopiere dort das Campusgram-Passwort zum Anmelden.

> Wenn Autofill einmal nicht klappt, kannst du das gespeicherte Passwort also auch selbst kopieren und einsetzen. Merken musst du es dir trotzdem nicht.

### S13-10 — Weitere Konten nach und nach umstellen

PassWo erklärt ein schrittweises Vorgehen. Mit „Alle Passwörter beheben“ wird anschließend das vollständige Beispielnetz geordnet und geschützt dargestellt.

> Die übrigen Konten musst du nicht alle auf einmal umstellen.

> Neue Konten kannst du ab jetzt direkt so anlegen. Bestehende kannst du nach und nach ändern, wenn du sie ohnehin wieder benutzt.

> So sieht das Netzwerk aus, wenn jedes Konto ein eigenes starkes Passwort verwendet.

### S13-11 — Welcher Passwortmanager passt zum Alltag?

Die beiden Varianten erscheinen erneut. Nach PassWos Einordnung beantwortet die Person die sichtbare Auswahlfrage „Was würde eher zu deinem Alltag passen?“ mit „Integriert“ oder „Separat“. Die Frage ist ein Oberflächentext.

> Bleibt noch die Frage, welcher Passwortmanager eher zu deinem Alltag passt.

> Beide Wege können starke und einzigartige Passwörter für dich verwalten.

### S13-12 — Geräteverlust und Wiederherstellung

Die Visualisierung führt vom verlorenen Gerät über einen Wiederherstellungsweg zu einem neuen Gerät.

> Ein verlorenes Gerät heißt nicht automatisch, dass dein Passwort-Tresor verloren ist.

> Viele Passwortmanager bieten einen Weg, ihn auf einem neuen Gerät wieder zu nutzen.

> Schau bei deinem eigenen nach, wie dieser Weg aussieht und was du dafür brauchst.

### S13-13 — Warum eine zweite Hürde nötig ist

Ein Angreifer kennt in der Szene das korrekte Master-Campus-Passwort. PassWo erklärt die verbleibende Grenze. Anschließend startet „Multi-Faktor-Authentifizierung kennenlernen“ die dritte Sektion.

> Passwörter können nicht nur erraten werden, sondern auch auf anderen Wegen bekannt werden.

> Ist ein Passwort einem Angreifer bekannt, reicht selbst ein sehr starkes Passwort allein nicht mehr aus.

> Um den Zugang auch dann zu schützen, brauchen wir eine zweite Hürde.

<a id="s14"></a>

## S14 — Faktoren verstehen und 2FA bei Master Campus einrichten

PassWo unterscheidet Wissen, Besitz und Biometrie. Die Person recherchiert die Aktivierung im simulierten Browser, richtet 2FA mit einer Authenticator-App ein und probiert die Anmeldung aus.

Quelle: [s14.ts](packages/training-content/src/s14.ts), Content-Version 1.7.0.

### S14-01 — MFA und 2FA unterscheiden

Die Begriffe werden nacheinander eingeführt.

> Bei der Multi-Faktor-Authentifizierung (MFA) werden für die Anmeldung mehrere unterschiedliche Faktoren kombiniert.

> Eine besonders häufige Form ist die Zwei-Faktor-Authentifizierung (2FA). Dabei werden genau zwei unterschiedliche Faktoren kombiniert.

### S14-02 — Drei Faktorarten kennenlernen

Die Visualisierung ergänzt nacheinander die Beispiele für Wissen, Besitz und Biometrie.

> Der erste Faktor ist Wissen, zum Beispiel dein Passwort, eine PIN oder die Antwort auf eine Sicherheitsfrage.

> Der zweite Faktor ist Besitz, zum Beispiel eine Authenticator-App auf deinem Handy oder ein Sicherheitsschlüssel.

> Der dritte Faktor ist Biometrie, zum Beispiel Gesichtserkennung oder ein Fingerabdruck.

### S14-03 — Unterschiedliche Faktoren kombinieren

Passwort plus Authenticator-App und Passwort plus Sicherheitsschlüssel werden zwei Passwörtern gegenübergestellt.

> Entscheidend ist, dass die beiden Faktoren unterschiedlich sind.

### S14-04 — Die Aktivierung beim Dienst finden

Die Person sucht die Master-Campus-Hilfe und liest, wo 2FA eingeschaltet wird.

> Wo du 2FA einschaltest, sieht bei jedem Dienst etwas anders aus.

> Finde zuerst heraus, ob Master Campus Zwei-Faktor-Authentifizierung anbietet und wo du sie aktivieren kannst.

> Gefunden. Aktiviere 2FA jetzt bei Master Campus.

### S14-05 — 2FA einrichten und Anmeldung ausprobieren

In den Sicherheitseinstellungen aktiviert die Person die fiktive Authenticator-App, bestätigt das Scannen und den Code. Die folgenden beiden Absätze erscheinen gemeinsam.

*Eine Sprechblase mit folgenden Absätzen:*

> Damit ist die Zwei-Faktor-Authentifizierung für Master Campus eingerichtet.
>
> Probier jetzt aus, was sich beim Anmelden verändert.

### S14-06 — Ins Kontonetzwerk zurückkehren

Nach der Anmeldung mit dem zusätzlichen Faktor wird der Browser geschlossen.

> Schließe den Browser noch einmal und schau, was sich im Kontonetzwerk verändert hat.

<a id="s15"></a>

## S15 — Die Wirkung des zweiten Faktors sichtbar machen

Master Campus trägt im Netzwerk die zusätzliche Schutzmarkierung. PassWo erklärt, welche weitere Hürde ein Angreifer überwinden müsste.

Quelle: [s15-s17.ts](packages/training-content/src/s15-s17.ts), Content-Version 1.2.0.

### S15-01 — Das Passwort allein reicht nicht mehr

Die Wirkung der zuvor eingerichteten 2FA wird in zwei Sprechschritten eingeordnet.

> Jetzt reicht das Passwort allein nicht mehr für die Anmeldung.

> Selbst wenn es bekannt wird, müsste der Angreifer zusätzlich an deinen zweiten Faktor gelangen.

<a id="s16"></a>

## S16 — Wichtige Konten zuerst schützen

PassWo macht die Ausweitung handhabbar: zuerst wichtige Konten, danach weitere.

Quelle: [s15-s17.ts](packages/training-content/src/s15-s17.ts), Content-Version 1.2.0.

### S16-01 — Priorisieren und den Schutz ausweiten

Nach diesen beiden Sprechschritten löst „Schutz auf weitere Konten ausweiten“ die Erweiterung im Beispielnetz aus.

> Es kann sich zuerst nach viel anfühlen, 2FA für viele Konten einzurichten. Das ist völlig normal.

> Fang deshalb auch hier zuerst bei deinen wichtigen Konten an.

<a id="s17"></a>

## S17 — Übertragung auf weitere Konten und Trainingsabschluss

Die zusätzliche Schutzmarkierung erscheint bei weiteren Beispielkonten. PassWo verbindet die eigenen starken Passwörter mit der Wirkung des zusätzlichen Faktors.

Quelle: [s15-s17.ts](packages/training-content/src/s15-s17.ts), Content-Version 1.2.0.

### S17-01 — Das Vorgehen auf andere Konten übertragen

PassWo erklärt die Suche nach 2FA bei weiteren Diensten.

> Bei anderen Konten kannst du genauso vorgehen: Prüfe, ob 2FA angeboten wird, und suche in den Sicherheits- oder Kontoeinstellungen nach der Aktivierung.

### S17-02 — Letzte Sprechblase des Trainings

Dies ist der letzte gesprochene Text der PassWo-Figur. Danach beendet die Person das Training mit „Training abschließen“; es folgt der Studienablauf mit dem Post-Fragebogen.

> Unsere Konten haben jetzt eigene starke Passwörter. Und bei wichtigen Konten reicht das Passwort für den Angreifer allein nicht mehr aus.

---

### Quellen und Pflegehinweise

Die Segmentüberschriften und Szenenbeschreibungen sind redaktionelle Orientierung; der zitierte Wortlaut wurde aus den versionierten Inhalten übernommen. Inhaltlich auffällige Formulierungen und vorhandene Schreibweisen wurden dabei nicht korrigiert. Die Content-Dateien und ihre Versionen stehen jeweils am Segmentanfang.

Die Zuordnung sichtbarer Sprechblasen und ihrer Reihenfolge folgt den aktuellen Trainingsansichten, insbesondere [S05](apps/study-web/src/features/training/segments/S05/S05AnalysisTraining.tsx), [S06](apps/study-web/src/features/training/segments/S06/S06ConsequenceController.ts) und dem [integrierten Ablauf ab S08](apps/study-web/src/features/training/segments/S08/S08NetworkRewindStage.tsx). In den Inhaltsdateien vorhandene, aber nicht als Dialog verwendete Texte wurden nicht als zusätzliche Sprechblasen eingefügt. Dazu gehören beispielsweise die separate Passphrasen-Vorschau und die Schild-Erklärung in S05, die allgemeine `s06.summary` sowie die Statuszusammenfassungen in S08.

Fachlicher Rahmen: [Segmentindex](research/derived/segment-index.md), [Training Copy](docs/design/TRAINING-COPY.md) und die Copy-Audits für [S00–S05](docs/design/S00-S05-COPY-AUDIT.md), [S06–S07](docs/design/S06-S07-COPY-AUDIT.md), [S08–S09](docs/design/S08-S09-COPY-AUDIT.md), [S12](docs/design/S12-COPY-AUDIT.md), [S13](docs/design/S13-COPY-AUDIT.md), [S14](docs/design/S14-COPY-AUDIT.md) und [S15–S17](docs/design/S15-S17-COPY-AUDIT.md).

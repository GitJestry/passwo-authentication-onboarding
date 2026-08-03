# Zweiter und letzter Studienteil nach zehn Tagen

Status: **Version `follow-up-v5`, für Cognitive Pretest und Freigabe festgelegt.**

## Runtime-Grenze

Der zweite Studienteil ist kein Teil des Trainings und kein Instrument der Hauptsitzung. Seine
Fragen werden weder in `instruments-v1.runtime.json` noch im Browser-Bundle der Study Runtime
geführt. Die Hauptanwendung erhebt die verpflichtende Kontaktbestätigung und übergibt die
E-Mail-Adresse ausschließlich an die getrennte Recontact-Datenbank. Wortlaut, Verzweigungen und
Nachrichten liegen in `research/derived/follow-up-v5.yaml`.

Der Schedule-Export liefert Kontaktadresse, Token-Link, Einladung, Erinnerung, Schließung und den
aus `closesAt` abgeleiteten Zeitpunkt der abschließenden Debrief-Mail. Versand und öffentliches
Formular bleiben von Training Runtime und Forschungsdatenbank getrennt.

## Messfenster und Versand

- Forschungsstichtag: exakt `completedAt + 240h`; nur bereits bis dahin abgeschlossene Handlungen
  zählen.
- Erste Einladung: `completedAt + 240h`.
- Höchstens eine neutrale Erinnerung: `completedAt + 288h`.
- Schließung und zusätzliche Debrief-Mail an alle Eingeschlossenen: `completedAt + 336h`.
- Geschätzte Bearbeitungszeit: ein bis zwei Minuten.
- Die E-Mails enthalten weder Authentifizierungsempfehlungen noch Condition, Forschungs-ID,
  Antworten oder Löschcode.

### Erste Einladung

**Betreff:** Zweiter Studienteil ist jetzt verfügbar

> Hallo,
>
> vor zehn Tagen hast du den ersten Teil unserer Studie zu einem digitalen Lernangebot über
> Passwörter und den Schutz von Online-Konten abgeschlossen. Der kurze zweite und letzte
> Studienteil ist jetzt verfügbar und dauert etwa ein bis zwei Minuten.
>
> Zum zweiten Studienteil: `[TOKEN_LINK]`
>
> Bitte beziehe deine Angaben ausschließlich auf den bereits abgeschlossenen Zeitraum bis
> `[STICHTAG]`. Der Link ist bis `[CLOSES_AT]` gültig und darf nicht weitergegeben werden. Deine
> Teilnahme bleibt freiwillig. Nach der Abgabe erhältst du die vollständige Aufklärung zur Studie.
>
> Vielen Dank für deine Unterstützung.

### Einmalige Erinnerung

**Betreff:** Erinnerung: zweiter Studienteil

> Hallo,
>
> dies ist die einmalige Erinnerung an den zweiten und letzten Teil deiner Studienteilnahme. Falls
> du bereits teilgenommen hast, kannst du diese Nachricht ignorieren.
>
> Zum zweiten Studienteil: `[TOKEN_LINK]`
>
> Bitte beziehe deine Angaben ausschließlich auf den bereits abgeschlossenen Zeitraum bis
> `[STICHTAG]`. Der Link ist bis `[CLOSES_AT]` gültig und darf nicht weitergegeben werden. Deine
> Teilnahme bleibt freiwillig.

## Fragebogen und Analyse

Der Formulartitel lautet **„Zweiter und letzter Studienteil“**. Da das 240-Stunden-Messfenster vor
Versand bereits geschlossen ist, dürfen Formular und Items den konkreten Handlungsfokus nennen.
Die drei fokalen Handlungen, Kontextfragen, Barriereverzweigungen, Sicherheitswarnung und getrennte
Auswertung bleiben gegenüber v4 inhaltlich unverändert.

Die drei fokalen Items bilden eine zentral-sekundäre Ergebnisfamilie und werden getrennt als
**selbstberichtete Schutzhandlungen innerhalb von zehn Tagen** ausgewertet:

1. Ersetzung eines wiederverwendeten oder erkennbar variierten Passworts;
2. Erzeugung und Speicherung eines kontospezifischen Passworts mit einem Passwortmanager;
3. Aktivierung von MFA/2FA bei mindestens einem Konto.

Prüfung verfügbarer Funktionen, Abruf beziehungsweise Autofill und Prüfung der MFA-Verfügbarkeit
sind sekundäre deskriptive Handlungen. Es wird kein kombinierter Behavior Score berechnet.
Nichtantwort bleibt fehlend. Der retrospektive Opportunity-Indikator wird nur grob eingeordnet und
fragt weder konkrete Konten noch Passwörter oder Variationsmuster ab.

Es handelt sich nicht um objektive Beobachtung realer Konten und nicht um eine Vorher-Nachher-
Messung desselben Verhaltens. Die Ergebnisse belegen weder korrekt abgeschlossene Konfiguration,
dauerhafte Adoption noch nachhaltige Verhaltensänderung. Direkt nach Abgabe wird das vollständige
Debriefing aus `PARTICIPANT-INFORMATION.md` angezeigt.

## Methodische Restgrenzen

Die neutrale Ankündigung reduziert Demand Characteristics und Question-Behavior-Reaktivität,
beseitigt sie aber nicht. Beide Bedingungen erhalten dieselbe Information; eine
bedingungsspezifische Reaktion auf das Studienwissen kann ohne zusätzliche Kontrollgruppe nicht
ausgeschlossen werden. Die freiwillige Geheimhaltungsbitte kann Kontamination nur mindern.
Eine bei vorzeitigem Rückzug ethisch früh erforderliche Aufklärung kann an später Teilnehmende
weitergegeben werden; dieses Restrisiko wird als Limitation der Bachelorarbeit dokumentiert.

## Entscheidungsgrundlagen

- [DGPs: Berufsethische Richtlinien](https://www.dgps.de/die-dgps/aufgaben-und-ziele/berufsethische-richtlinien/)
  zu Täuschung, frühestmöglicher Aufklärung und Datenrückzug;
- [Art. 13 DSGVO](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679)
  zu vorab erforderlicher Transparenz;
- [Metaanalyse zum Question-Behavior-Effekt](https://pmc.ncbi.nlm.nih.gov/articles/PMC4931712/)
  als Begründung, Reaktivität als klein und heterogen, aber nicht als beseitigt zu behandeln;
- [verdecktes Security-Feldexperiment](https://www.usenix.org/system/files/usenixsecurity25-anliker.pdf)
  und [angekündigter Security-Retest](https://www.usenix.org/system/files/conference/soups2017/soups2017-lastdrager.pdf)
  als Vergleichspunkte für Consent-, Recontact- und Debriefing-Entscheidungen.

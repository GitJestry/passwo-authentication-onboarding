# Separates Follow-up-Instrument nach zehn Tagen

Status: **Version `follow-up-v4`, für den Instrument Freeze festgelegt.**

## Runtime-Grenze

Die Nachbefragung ist kein Teil des Trainings und kein Instrument der Hauptsitzung. Ihre Fragen
werden weder in `instruments-v1.runtime.json` noch im Browser-Bundle der Study Runtime geführt.
Die Hauptanwendung erhebt nur die gesonderte Einwilligung zur erneuten Kontaktaufnahme und die
E-Mail-Adresse in der getrennten Recontact-Datenbank. Der versionierte Wortlaut der E-Mail und
der extern ausgelieferten Nachbefragung liegt ausschließlich in
`research/derived/follow-up-v4.yaml`.

Der bestehende Schedule-Export liefert Kontaktadresse, Token-Link und Versandzeitpunkte. Versand
und Bereitstellung des externen Follow-up-Fragebogens erfolgen getrennt von der Training Runtime.

## Versand

- Erste Einladung: 240 Stunden nach Abschluss der Hauptsitzung.
- Höchstens eine neutrale Erinnerung: 48 Stunden nach der ersten Einladung.
- Schließung des Links: 336 Stunden nach Abschluss der Hauptsitzung.
- Geschätzte Bearbeitungszeit: ein bis zwei Minuten.
- Die E-Mails enthalten keine Authentifizierungsempfehlung und keine Wiederholung des Trainings.

### Erste Einladung

**Betreff:** Kurze Nachbefragung zur Studie

> Hallo,
>
> vor zehn Tagen hast du an unserer Studie zu Passwörtern und dem Schutz von Online-Konten
> teilgenommen und einer kurzen Nachbefragung zugestimmt.
>
> Die Nachbefragung dauert etwa ein bis zwei Minuten. Bitte berichte nur Handlungen, die du nach
> deiner Studienteilnahme und bereits vor dem in der Befragung genannten Stichtag abgeschlossen
> hattest.
>
> Zur Nachbefragung: `[TOKEN_LINK]`
>
> Die Teilnahme ist freiwillig. Der Link ist bis `[CLOSES_AT]` gültig. Bitte leite ihn nicht
> weiter.
>
> Vielen Dank für deine Unterstützung.

### Einmalige Erinnerung

**Betreff:** Erinnerung: kurze Nachbefragung zur Studie

> Hallo,
>
> dies ist die einmalige Erinnerung an die kurze Nachbefragung zu deiner Studienteilnahme. Falls
> du bereits geantwortet hast oder nicht teilnehmen möchtest, kannst du diese Nachricht
> ignorieren.
>
> Zur Nachbefragung: `[TOKEN_LINK]`
>
> Der Link ist bis `[CLOSES_AT]` gültig.

## Fragebogen und Analyse

Der vollständige Wortlaut, die Verzweigungen, Exklusivitätsregeln und die drei fokalen Outcomes
stehen in `research/derived/follow-up-v4.yaml`. Zentral ausgewertet werden getrennt:

1. Ersetzung eines wiederverwendeten oder erkennbar variierten Passworts;
2. Erzeugung und Speicherung eines kontospezifischen Passworts mit einem Passwortmanager;
3. Aktivierung von MFA/2FA bei mindestens einem Konto.

Prüfung verfügbarer Funktionen, Abruf beziehungsweise Autofill und Prüfung der MFA-Verfügbarkeit
sind sekundäre deskriptive Handlungen. Es wird kein kombinierter Verhaltensscore berechnet.
Nichtantwort wird als fehlender Wert behandelt. Der retrospektive Opportunity-Indikator zur
Passwortwiederverwendung wird nur als grobe Einordnung verwendet und fragt weder konkrete Konten
noch Passwörter oder Variationsmuster ab.

Die Ergebnisse sind verzögerte, selbstberichtete Handlungen in einem begrenzten Zeitraum. Sie
belegen keine korrekt abgeschlossene Konfiguration, keine nachhaltige Nutzung und keine dauerhafte
Verhaltensänderung.

# Freiwillige Nachbefragung nach ungefähr zehn Tagen

Status: **implementierte Fassung `follow-up-v6-pilot`.** Der verbindliche Wortlaut liegt in
`research/derived/follow-up-v6.yaml`. Die Nachbefragung ist eine ancillary exploratory extension
und nicht erforderlich, um die Hauptforschungsfrage zu beantworten.

## Auslieferungsgrenze

Die Nachbefragung ist kein Bestandteil des Trainings und wird nicht in den Hauptstudien-Fragebogen
integriert. Sie läuft als getrennte tokenisierte Route derselben Webanwendung. Es gibt keine
zusätzliche Umfrageplattform und keinen späteren manuellen Antwortimport.

Die Hauptstudie kann ohne E-Mail-Adresse vollständig abgeschlossen werden. Nur nach gesondertem
Opt-in wird eine Adresse in der getrennten Recontact-Datenbank gespeichert. Die
Forschungsdatenbank enthält weder E-Mail-Adresse noch Raw Token.

## Zeitplan

- erste Einladung: `completedAt + 240h`;
- höchstens eine Erinnerung: 48 Stunden nach der ersten Einladung;
- Schließung: `completedAt + 336h`;
- geschätzte Bearbeitungszeit: etwa zwei Minuten;
- der berichtete Handlungszeitraum endet vor dem Zeitpunkt der ersten Einladung.

Einladung und Erinnerung enthalten keine Authentifizierungsempfehlung. Das gemeinsame Debriefing
findet bereits vor dem Abschluss der Hauptsitzung statt; es gibt keine verzögerte Debrief-Mail.

## Zugriff und Einwilligung

Der individuelle Link enthält einen kryptographisch zufälligen Raw Token. Der Server vergleicht nur
dessen Hash mit der pseudonymisierten Sitzung. Der Token enthält keine E-Mail-Adresse, Condition,
Forschungs-ID oder Antwortdaten und darf nicht weitergegeben werden.

Vor jeder Follow-up-Antwort wird angezeigt:

> Diese freiwillige Nachbefragung fragt nach einigen Schritten zum Schutz deiner Online-Konten in
> den Tagen nach der damaligen Studie. Falls du einen dieser Schritte nicht unternommen hast,
> kannst du kurz den wichtigsten Grund angeben. Die Bearbeitung dauert etwa zwei Minuten. Deine
> Teilnahme ist freiwillig. Wenn du nicht teilnimmst, entstehen dir keine Nachteile.

Danach ist eine erneute ausdrückliche freiwillige Teilnahmebestätigung erforderlich. Nach gültiger
Abgabe wird der Token für weitere Antworten gesperrt.

## Instrument

Das Instrument enthält genau drei verpflichtende, getrennt berichtete fokale Handlungen:

1. `FU_REUSE_REPLACED`: Ersetzen eines wiederverwendeten oder leicht veränderten Passworts;
2. `FU_PM_ACCOUNT_SPECIFIC`: Erzeugen und Speichern eines kontospezifischen Passworts mit einem
   Passwortmanager;
3. `FU_MFA_ENABLED`: Aktivieren von MFA/2FA bei mindestens einem Konto.

Jede Hauptfrage verwendet ausschließlich `Ja`, `Nein` und `Unsicher`. `Unsicher` ist eine eigene
Kategorie und wird nicht als `Nein` codiert. Nur bei `Nein` erscheint das zugehörige optionale
Reason-Item `FU_REUSE_REPLACED_REASON`, `FU_PM_ACCOUNT_SPECIFIC_REASON` beziehungsweise
`FU_MFA_ENABLED_REASON`. Bei `Ja` und `Unsicher` bleibt der Reason-Wert kanonisch `null`. Es wird
kein Freitext und kein kombinierter Verhaltenswert erhoben. Reasons sind ausschließlich
handlungsspezifischer deskriptiver Kontext und keine Barrierenskala. Nichtantwort ist fehlend und
keine Inaktivität.

## Interpretation

Die Angaben sind eng definierte kurzfristige Selbstberichte, gelegenheits- und
ausgangslagenabhängig und werden nur unter Follow-up-Respondierenden ausgewertet. `Ja`, `Nein` und
`Unsicher` werden je fokaler Handlung separat berichtet; Reasons werden nur für `Nein` deskriptiv
zusammengefasst. Sie belegen weder korrekt abgeschlossene Konfigurationen noch dauerhafte Adoption,
Wissenszuwachs, Gewohnheitsbildung oder langfristige Verhaltensänderung. Condition sowie verfügbare
Baseline-Passwortmanager- und MFA-Angaben bleiben über denselben `researchId` zuordenbar.
Responder und Non-Responder werden nach Condition und verfügbaren Baseline-Merkmalen beschrieben.
Condition-Unterschiede im freiwilligen Follow-up sind responder-selected exploratory estimates und
keine konfirmatorischen kausalen Effekte.

## Kontakt- und Löschprozess

Eine getrennte serverseitige Operations-Schicht bestimmt fällige Einladung und höchstens eine
Erinnerung idempotent. Ohne einen ausdrücklich eingerichteten, idempotenten Mailtransport werden
nur geschützte Nachrichtendateien vorbereitet; der Versand erfolgt kontrolliert über das
Universitätskonto und wird danach einmalig bestätigt. Die Study Runtime speichert keine
Mail-Credentials und versendet nicht selbst.

Spätestens sieben Kalendertage nach Schließung des letzten Follow-up-Fensters werden das getrennte
Kontaktregister, lokale Schedule-Dateien, versandte Follow-up-Nachrichten im
projektkontrollierten Postfach und sonstige projektkontrollierte Kontaktkopien gelöscht.
Die Bestätigung dokumentiert nur Datum, ausführende Person sowie Anzahl vor und nach der Löschung;
sie enthält keine E-Mail-Adresse und keinen Token.

Die weitere pseudonymisierte Verknüpfung der bereits abgegebenen Follow-up-Antworten endet beim
Datensatz-Freeze gemäß `DATA-CONTRACT.md`.

## Versionskompatibilität

`follow_up_version` wird beim Session-Create als `follow-up-v6-pilot` gespeichert und ist derzeit
ein harter Gate-Wert für Zugriff und Scheduler. Ein Versionssprung benötigt deshalb eine
produktive Datenmigration; der laufende Release behält diesen Wert unverändert.

Es gibt keine Hervorhebung und keinen Eingriff in Training, Trainingsdramaturgie, Hauptfragebogen
oder geschützten PassWo-Wortlaut.

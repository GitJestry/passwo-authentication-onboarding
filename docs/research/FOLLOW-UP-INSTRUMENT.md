# Freiwillige Nachbefragung nach ungefähr zehn Tagen

Status: **Pilotkandidat `follow-up-v6-pilot`.** Der verbindliche Wortlaut liegt in
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

> Dieser freiwillige Folgefragebogen untersucht, ob du seit deiner Teilnahme konkrete Schritte
> zum Schutz deiner Online-Konten unternommen hast und welche Gründe eine Umsetzung erleichtert
> oder verhindert haben. Die Bearbeitung dauert etwa zwei Minuten. Deine Teilnahme ist freiwillig.
> Wenn du nicht teilnimmst, entstehen dir keine Nachteile.

Danach ist eine erneute ausdrückliche freiwillige Teilnahmebestätigung erforderlich. Nach gültiger
Abgabe wird der Token für weitere Antworten gesperrt.

## Instrument

Die zwei Mehrfachauswahlfragen erfassen getrennt Passwort-/Passwortmanagerhandlungen und
MFA-Handlungen. `Keine dieser Handlungen` ist jeweils exklusiv. Bei Auswahl dieser Option erscheint
ein domänenspezifisches, freiwilliges Einzelwahl-Item zum wichtigsten Grund. Es wird kein Freitext
erhoben.

Fokale verzögerte Outcomes:

1. Ersetzen eines wiederverwendeten oder erkennbar variierten Passworts;
2. Erzeugen und Speichern eines kontospezifischen Passworts mit einem Passwortmanager;
3. Aktivieren von MFA/2FA bei mindestens einem Konto.

Prüfung verfügbarer Funktionen, bewusster Abruf beziehungsweise Autofill, Prüfung des
Wiederherstellungswegs und MFA-Wartung sind sekundäre deskriptive Handlungen. Es wird kein
kombinierter Verhaltenswert gebildet. Nichtantwort ist fehlend und keine Inaktivität.

## Interpretation

Die Angaben sind Selbstberichte, gelegenheits- und ausgangslagenabhängig und werden nur unter
Follow-up-Respondierenden ausgewertet. Sie belegen weder korrekt abgeschlossene Konfigurationen,
noch dauerhafte Adoption, Wissenszuwachs, Gewohnheitsbildung oder langfristige Verhaltensänderung.
Sie folgen dem zugewiesenen Artefakt, dem gemeinsamen Guardrail, den übrigen Messungen und dem
gemeinsamen korrektiven Debriefing.

## Kontakt- und Löschprozess

Einladung und höchstens eine Erinnerung werden kontrolliert über das Universitätskonto versendet.
Die Study Runtime speichert keine Mail-Credentials und versendet nicht selbst.

Spätestens sieben Kalendertage nach Schließung des letzten Follow-up-Fensters werden das getrennte
Kontaktregister, lokale Schedule-Dateien, versandte Follow-up-Nachrichten im
projektkontrollierten Postfach und sonstige projektkontrollierte Kontaktkopien gelöscht.
Die Bestätigung dokumentiert nur Datum, ausführende Person sowie Anzahl vor und nach der Löschung;
sie enthält keine E-Mail-Adresse und keinen Token.

Die weitere pseudonymisierte Verknüpfung der bereits abgegebenen Follow-up-Antworten endet beim
Datensatz-Freeze gemäß `DATA-CONTRACT.md`.

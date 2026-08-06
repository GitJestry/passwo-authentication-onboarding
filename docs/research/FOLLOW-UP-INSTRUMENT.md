# Freiwillige Nachbefragung nach ungefähr zehn Tagen

Status: **Pilotkandidat `follow-up-v6-pilot`.** Der verbindliche Wortlaut liegt in
`research/derived/follow-up-v6.yaml`. Die Nachbefragung ist eine ancillary exploratory extension
und nicht erforderlich, um die Hauptforschungsfrage zu beantworten.

## Runtime-Grenze

Die Nachbefragung ist kein Bestandteil des Trainings und wird nicht in das Browser-Bundle der
Hauptstudie importiert. Die Hauptanwendung speichert eine E-Mail-Adresse nur nach gesonderter,
freiwilliger Auswahl in einer getrennten Recontact-Datenbank. Die Forschungsdatenbank enthält nur
die zufällige Studien-ID, die Follow-up-Einwilligung, die Follow-up-Version und einen Hash des
zufälligen Verknüpfungstokens; sie enthält weder E-Mail-Adresse noch Raw Token.

## Zeitplan

- erste Einladung: `completedAt + 240h`;
- höchstens eine Erinnerung: 48 Stunden nach der ersten Einladung;
- Schließung: `completedAt + 336h`;
- geschätzte Bearbeitungszeit: etwa zwei Minuten;
- berichteter Handlungszeitraum endet vor dem Zeitpunkt der ersten Einladung.

Einladung und Erinnerung enthalten keine Authentifizierungsempfehlung. Das gemeinsame in-session
Debriefing findet bereits vor Studienabschluss statt; es gibt keine zusätzliche verzögerte
Debrief-Mail.

## Offenlegung beim Follow-up

Vor jeder verzögerten Antwort wird angezeigt:

> Dieser freiwillige Folgefragebogen untersucht, ob du seit deiner Teilnahme konkrete Schritte
> zum Schutz deiner Online-Konten unternommen hast und welche Gründe eine Umsetzung erleichtert
> oder verhindert haben. Die Bearbeitung dauert etwa zwei Minuten. Deine Teilnahme ist freiwillig.
> Wenn du nicht teilnimmst, entstehen dir keine Nachteile.

Danach ist eine ausdrückliche freiwillige Teilnahmebestätigung erforderlich.

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

## Datenschutz und offener Betriebsprozess

Die E-Mail-Adresse wird getrennt gespeichert und nur für Einladung sowie höchstens eine Erinnerung
verwendet. Sie ist nach Abschluss der Follow-up-Phase und dem letzten vorgesehenen Versand zu
löschen. Der aktuelle lokale Schedule-Export versendet nicht selbst und kann den letzten
erfolgreichen Versand nicht zuverlässig bestätigen. Deshalb ist die automatische Löschung noch
nicht implementiert. Vor der Hauptstudie ist ein dokumentierter manueller Löschprozess oder eine
quittierte Versand-/Löschlogik erforderlich.

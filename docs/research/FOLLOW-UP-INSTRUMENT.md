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

## Runtime-Copy-Delta für die same-origin Route

Die Fragen, Antwortoptionen, Auswertungsrolle und Safety-Grenze bleiben unverändert. Für die
beauftragte technische Auslieferung wurden ausschließlich zuvor fehlende Bedien- und Statusflächen
in derselben kanonischen Quelle `research/derived/follow-up-v6.yaml` ergänzt:

| Text-ID | Quelle | Vorher | Ergänzung | Primäre Rolle | Grund | Bedeutungsänderung | Interaktionsziel |
|---|---|---|---|---|---|---|---|
| `FU_UI_DOMAIN_PASSWORD_PM`, `FU_UI_DOMAIN_MFA` | bestehende zwei Instrumentdomänen | fehlte | `Passwörter und Passwortmanager`; `MFA/2FA` | Orientierung | eindeutige Zuordnung der zwei gleichlautenden Fragen | nein | kein |
| `FU_UI_LOADING` | beauftragte same-origin Auslieferung | fehlte | `Nachbefragung wird geladen …` | Ergebnisfeedback | zugänglicher Ladezustand | nein | kein |
| `FU_UI_START`, `FU_UI_SUBMIT`, `FU_UI_SUBMITTING` | vorhandene Einwilligungs- und Abgabelogik | fehlte | `Zur Nachbefragung`; `Antworten absenden`; `Antworten werden gespeichert …` | Navigation | Buttons benennen ihre tatsächliche Aktion | nein | Start beziehungsweise Abgabe |
| `FU_UI_VALIDATION_ERROR`, `FU_UI_SUBMIT_ERROR` | Pflicht der zwei Handlungsfragen und atomarer Write | fehlte | siehe `interface.validationError` und `interface.submitError` | Ergebnisfeedback | Fehler ohne interne Metadaten verständlich machen | nein | erneute Eingabe beziehungsweise Retry |
| `FU_UI_SUBMITTED`, `FU_UI_ALREADY_SUBMITTED` | einmalige Abgabe laut Instrument | fehlte | siehe `interface.submitted*` und `interface.alreadySubmitted*` | Ergebnisfeedback | erfolgreichen beziehungsweise bereits verbrauchten Token erklären | nein | kein |
| `FU_UI_NOT_OPEN`, `FU_UI_EXPIRED`, `FU_UI_INVALID`, `FU_UI_LOAD_ERROR` | dokumentiertes Zeitfenster und Tokenmodell | fehlte | siehe gleichnamige `interface`-Felder | Safety Boundary | keine Eingabe außerhalb eines gültigen Zugriffs | nein | kein |
| `email.body`, `reminderEmail.body` | bestehende Linkzeile | `Zur Nachbefragung: [TOKEN_LINK]` | `Zur freiwilligen Nachbefragung: [TOKEN_LINK]` | Navigation | Linkziel für Teilnehmende eindeutig und freiwillig benennen | nein | Follow-up öffnen |

Es gibt keine Hervorhebung und keinen Eingriff in Training, Trainingsdramaturgie oder geschützten
PassWo-Wortlaut. Da die Messitems und ihre Bedeutung unverändert bleiben und nur die bereits für
`follow-up-v6-pilot` vorgesehene Auslieferungsoberfläche vervollständigt wird, bleibt die
Instrumentversion unverändert.

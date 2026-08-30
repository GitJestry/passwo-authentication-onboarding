# Aktuelle Studienstatistik

Dieses Werkzeug liest die Produktionsdatenbank per SSH ausschließlich im SQLite-Read-only-Modus
aus. Der normale Statistikmodus zeigt aggregierte Zahlen und Zeitstempel sowie die nicht
zugeordneten Einzeldauern abgeschlossener Lernangebote; Session-IDs, Forschungskennungen,
Antwortwerte und Kontaktangaben werden dabei nicht ausgegeben.

## Verwendung

Im Repository genügt:

```bash
pnpm study:stats
```

## E-Mail-Adressen und Follow-up-Fristen

Das getrennte Kontaktregister lässt sich ausdrücklich mit folgendem Modus einsehen:

```bash
pnpm study:stats -- --show-emails
```

Dieser Modus gibt ausschließlich die E-Mail-Adresse sowie Beginn und Ende des geplanten
Follow-up-Fensters in UTC aus. Solange noch kein Follow-up-Fenster geplant wurde – insbesondere vor
Abschluss der Hauptstudie – steht anstelle der Termine `noch nicht terminiert`. Session-IDs,
Forschungskennungen und Tokens werden nicht angezeigt. Die Terminalausgabe enthält personenbezogene
Kontaktdaten und sollte deshalb weder weitergegeben noch in Logs gespeichert werden. Der normale
Statistikmodus greift weiterhin nicht auf das getrennte Kontaktregister zu.

Das Skript verwendet denselben Standardhost wie Deployment und Web-Test. SSH fragt bei Bedarf
automatisch nach der Passphrase des bereits eingerichteten SSH-Keys.

Nur wenn bewusst ein anderer Key verwendet werden soll, kann dessen Pfad zusätzlich angegeben
werden:

```bash
pnpm study:stats -- --identity-file /pfad/zum/ssh-key
```

Der Key bleibt außerhalb des Repositorys und wird nur von `ssh` verwendet. Das Skript kopiert
oder verändert weder den Key noch Daten auf dem Server.

Optional können ein anderer SSH-Host oder Datenbankpfad angegeben werden:

```bash
pnpm study:stats -- \
  --host root@193.23.254.118 \
  --database /var/lib/passwo-study/study.sqlite \
  --identity-file /pfad/zum/ssh-key
```

Alternativ stehen dafür `PASSWO_STATS_HOST`, `PASSWO_STATS_DATABASE` und
`PASSWO_STATS_SSH_KEY` zur Verfügung. Ohne Angaben werden der dokumentierte Produktionshost und
die Produktionsdatenbank verwendet. Ein abweichendes Kontaktregister kann im E-Mail-Modus über
`--recontact-database /anderer/pfad/recontact.sqlite` oder
`PASSWO_STATS_RECONTACT_DATABASE` gewählt werden.

## Bedeutung der wichtigsten Zahlen

- **Studiensessions angelegt:** Einwilligung akzeptiert und Session serverseitig erzeugt.
- **Pre-Fragebogen abgeschlossen:** Alle vorgesehenen Pre-Fragebogenabschnitte wurden gespeichert.
- **Training gestartet:** Mindestens ein serverseitiges Trainingsintervall wurde geöffnet.
- **Training abgeschlossen:** Das Trainingsartefakt wurde regulär bis zum Ende durchlaufen.
- **Durchschnittliche Dauer je Lernangebot:** Mittelwert der bestätigten Trainingsintervalle aller
  regulär abgeschlossenen Lernangebote, getrennt nach PassWo und SecAware. Unterbrechungszeiten
  außerhalb eines bestätigten Intervalls zählen nicht mit. Fallzahl und aufsteigend sortierte
  Einzelzeiten in Minuten werden mit ausgegeben, damit der Mittelwert eingeordnet werden kann.
- **Zeitgefühl und Dauerpassung:** Mittelwert und Antwortzahl der beiden getrennten Zeiturteile je
  Lernangebot. Die kurze Textbeschreibung entspricht dem nächstliegenden Originalanker der
  jeweiligen siebenstufigen Skala; beide Urteile werden nicht zu einem gemeinsamen Score verbunden.
- **Alle Pflichtdaten gespeichert:** Training sowie alle erforderlichen Post- und
  Guardrail-Abschnitte liegen vor. Dieser Zustand setzt die Web-Session automatisch auf
  `completed`; `session-closure` bleibt nur für vor der Umstellung angelegte Altstände lesbar.
- **Studie vollständig abgeschlossen:** Training und nachgelagerte Fragebogenschritte wurden
  abgeschlossen; die Session besitzt den Status `completed`.
- **Rekrutierungsquelle:** Anzahl der angelegten Sessions je über `id` übermittelter Source-ID;
  Sessions ohne gespeicherten Wert werden als `ub` gezählt.

„Letzter bestätigter Checkpoint“ ist ein Wiederaufnahmezustand und keine Live-Anzeige. Das Alter des
letzten Serverkontakts macht verlassene Sessions sichtbar. Nur ein Trainingskontakt innerhalb der
letzten zwei Minuten ist ein belastbarer Näherungswert für ein aktuell geöffnetes Training;
Fragebogenseiten besitzen bewusst keinen eigenen Aktivitäts-Heartbeat.

Die Auffälligkeitstabelle enthält ausschließlich aggregierte Konsistenzhinweise. Sie gibt keine
Session- oder Forschungskennungen aus und verändert keine Produktivdaten.

Voraussetzungen sind ein lokaler OpenSSH-Client, SSH-Zugriff auf den Server und `sqlite3` auf dem
Server.

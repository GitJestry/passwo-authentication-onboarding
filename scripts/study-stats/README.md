# Aktuelle Studienstatistik

Dieses Werkzeug liest die Produktionsdatenbank per SSH ausschließlich im SQLite-Read-only-Modus
aus. Es zeigt nur aggregierte Zahlen und Zeitstempel; Session-IDs, Forschungskennungen,
Antwortwerte, Kontaktangaben und andere Teilnehmerdaten werden nicht ausgegeben.

## Verwendung

Im Repository genügt:

```bash
pnpm study:stats
```

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
die Produktionsdatenbank verwendet.

## Bedeutung der wichtigsten Zahlen

- **Studiensessions angelegt:** Einwilligung akzeptiert und Session serverseitig erzeugt.
- **Pre-Fragebogen abgeschlossen:** Alle vorgesehenen Pre-Fragebogenabschnitte wurden gespeichert.
- **Training gestartet:** Mindestens ein serverseitiges Trainingsintervall wurde geöffnet.
- **Training abgeschlossen:** Das Trainingsartefakt wurde regulär bis zum Ende durchlaufen.
- **Studie vollständig abgeschlossen:** Training und nachgelagerte Fragebogenschritte wurden
  abgeschlossen; die Session besitzt den Status `completed`.

Voraussetzungen sind ein lokaler OpenSSH-Client, SSH-Zugriff auf den Server und `sqlite3` auf dem
Server.

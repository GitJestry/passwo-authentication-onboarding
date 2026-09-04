# Webbetrieb auf `study.statisticslab.de`

Dieses Runbook beschreibt Erstinstallation, Deployment, Betrieb und Abschluss der produktiven
same-origin Webstudie auf `193.23.254.118`.

## Topologie

```text
Nginx :443
  /reference/...  statischer SecAware-Study-Build mit Byte Ranges
  /               study-server 127.0.0.1:3000
  /qa              Basic Auth
    PassWo QA      127.0.0.1:3101, In-Memory-DB
    SecAware QA    127.0.0.1:3102, In-Memory-DB

/var/lib/passwo-study/study.sqlite
/var/lib/passwo-study/recontact.sqlite
```

Nur Nginx ist öffentlich. Produktiv- und QA-Runtime verwenden getrennte `__Host-`-Cookies; Nginx
reicht je Route nur das passende Cookie weiter. QA berührt keine produktiven Daten. Der private
SecAware-Originalsnapshot wird nie übertragen; ausgeliefert wird ausschließlich der lokal gebaute
und verifizierte Study-Build.

## Standarddeployment

Auf dem Entwicklungsrechner im Repository:

```bash
pnpm deploy:web
```

Der Befehl führt das Release-Gate aus, baut Webruntime und Referenzartefakt, überträgt einen neuen
timestamp-basierten Release, installiert die Linux-Abhängigkeiten, schaltet den `current`-Symlink,
startet Produktion und QA neu und prüft Health, Nginx, SecAware-HTML, Video-Range und QA-Schutz.
Bei einem Fehler nach dem Symlinkwechsel wird automatisch zurückgerollt. SQLite-Dateien unter
`/var/lib/passwo-study` werden nicht ersetzt.

Nur für eine ausdrücklich begründete Notfallauslieferung existiert:

```bash
pnpm deploy:web -- --skip-checks
```

Ein ausgerollter Stand kann zusammen mit dem lokalen Release-Gate read-only geprüft werden:

```bash
pnpm test:web:release -- --deployed
```

## Einmalige Hosteinrichtung

### Voraussetzungen

- DNS `study.statisticslab.de` zeigt auf `193.23.254.118`.
- Node.js `24.18.0`, pnpm `11.15.1`, Nginx, Certbot, SQLite und rsync sind installiert.
- Bestätigter SSH-Host-Key-Fingerprint:
  `SHA256:gcxzMSaanCvJwm/i0RvOBQde8rGysKVOX+bLghrPSTc`.

Verzeichnisse und Servicekonto:

```bash
id passwo >/dev/null 2>&1 || \
  useradd --system --home-dir /var/lib/passwo-study --shell /usr/sbin/nologin passwo
install -d -o root -g root -m 0755 /opt/passwo-study/releases
install -d -o root -g passwo -m 0750 /etc/passwo-study
install -d -o passwo -g passwo -m 0700 /var/lib/passwo-study
install -d -o www-data -g www-data -m 0755 /var/www/passwo-certbot
```

Live-QA wird einmalig lokal eingerichtet:

```bash
pnpm qa:live:setup
```

Der Befehl fragt ein mindestens zwölf Zeichen langes Basic-Auth-Passwort ab und installiert
geschützt Htpasswd, QA-Environment und systemd-Unit. Danach übernimmt `pnpm deploy:web` beide
QA-Runtimes.

### Produktionskonfiguration

Vor dem ersten Start wird die Vorlage kopiert:

```bash
cp /opt/passwo-study/current/deploy/env/passwo-study.env.example \
  /etc/passwo-study/passwo-study.env
chown root:passwo /etc/passwo-study/passwo-study.env
chmod 0640 /etc/passwo-study/passwo-study.env
```

`PASSWO_RESUME_CLOSE_AT` wird vor Rekrutierungsbeginn auf den dokumentierten UTC-Schlusszeitpunkt
gesetzt. Die übrigen kanonischen Werte stehen in der Vorlage: öffentliche Origin, Port `3000`,
`permuted-block`, Datenverzeichnis, Follow-up-Route und dateibasierter geschützter Outbox-Transport.

Die versionierten Units werden installiert und aktiviert:

```bash
cp /opt/passwo-study/current/deploy/systemd/passwo-study.service \
  /etc/systemd/system/passwo-study.service
cp /opt/passwo-study/current/deploy/systemd/passwo-study-qa.service \
  /etc/systemd/system/passwo-study-qa.service
cp /opt/passwo-study/current/deploy/systemd/passwo-followup-operations.service \
  /etc/systemd/system/passwo-followup-operations.service
cp /opt/passwo-study/current/deploy/systemd/passwo-followup-operations.timer \
  /etc/systemd/system/passwo-followup-operations.timer
systemctl daemon-reload
systemctl enable --now passwo-study passwo-study-qa passwo-followup-operations.timer
```

TLS wird einmalig mit Certbot Webroot für `study.statisticslab.de` ausgestellt. Danach wird
`deploy/nginx/passwo-study.conf` als Site aktiviert und `certbot renew --dry-run` geprüft.

## Freigabeprüfung

```bash
systemctl is-active passwo-study passwo-study-qa nginx
timedatectl show -p NTPSynchronized --value
curl -fsS https://study.statisticslab.de/api/health
curl -I https://study.statisticslab.de/
curl -sS -o /dev/null -w '%{http_code}\n' https://study.statisticslab.de/qa
```

Erwartet sind aktive Dienste, `yes`, ein Health-JSON, erfolgreiche HTML-Auslieferung und `401` für
QA ohne Zugangsdaten. Der SecAware-Videotest muss auf einen Range-Request mit `206 Partial
Content` antworten.

In `/qa` werden beide direkten Artefakte und beide vollständigen Studienpfade geprüft. Resume,
Segmenttiming, Fragebogenabschluss, synthetische Follow-up-Zustände und QA-Reset laufen vollständig
in den In-Memory-Datenbanken. Der produktive Pfad wird vor Rekrutierungsbeginn einmal mit
ausschließlich fiktiven Testangaben abgeschlossen und danach über den Löschworkflow bereinigt.

## Laufender Betrieb

```bash
systemctl is-active passwo-study passwo-study-qa nginx
curl -fsS http://127.0.0.1:3000/api/health
curl -fsS http://127.0.0.1:3101/api/health
curl -fsS http://127.0.0.1:3102/api/health
```

Aggregierte Studienzahlen werden vom Entwicklungsrechner mit `pnpm study:stats` read-only
abgerufen.

Der kontrollierte Forschungsdatenexport wird ebenfalls vom Entwicklungsrechner gestartet. Der
Befehl verwendet OpenSSH für die interaktive Authentifizierung, führt den read-only Export als
Servicekonto auf dem Server aus und überträgt ausschließlich CSV, JSON, XLSX, Cookbook, Guide und
Manifest. Die rohe SQLite-Datei verlässt den Server nicht:

```bash
pnpm study:export:server -- \
  --profile analysis \
  --output ./study-analysis-export
```

Für die geschützte Auditfassung wird `--profile audit` verwendet. Das lokale Ziel darf noch nicht
existieren. Vor der Ablage prüft der Befehl das erwartete Dateiset und alle im Manifest enthaltenen
SHA-256-Prüfsummen; danach entfernt er den temporären Export auf dem Server. Die SSH-Verbindung
verwendet standardmäßig `root@193.23.254.118`, `/opt/passwo-study/current` und
`/var/lib/passwo-study`. Der unter „Einmalige Hosteinrichtung“ dokumentierte Host-Key muss bereits
bestätigt in `known_hosts` liegen; unbekannte oder geänderte Host-Keys werden abgewiesen.
Abweichende freigegebene Umgebungen können ausschließlich über
`PASSWO_EXPORT_HOST`, `PASSWO_EXPORT_ROOT` und `PASSWO_EXPORT_DATA_DIR` gesetzt werden.

Ab Exportversion `research-export-v10` enthält das Analyseprofil nur Sitzungen, Antworten,
Cookbook und Hinweise in CSV/JSON sowie Excel und Manifest. Legacy-Timing und
Guardrail-Präsentationen gehören ausschließlich zum Auditprofil; leere Freitextprüfdateien
entfallen. Exporter und lokaler Transfer-Verifier müssen dieselbe Exportversion unterstützen.
Vorhandene ältere Exporte werden weder überschrieben noch automatisch konvertiert.

Bei Fehlern:

```bash
journalctl -u passwo-study --since today --no-pager
journalctl -u passwo-study-qa --since today --no-pager
```

Logs enthalten keine Request-Bodies, IP-Adressen, User-Agents, tokenisierten URLs oder Raw Tokens.
SQLite-Dateien werden bei laufendem Dienst weder manuell bearbeitet noch mit `cp` kopiert.

Ein manueller Rollback ändert nur den Release-Symlink und startet Produktion und QA neu; die
Datenbanken bleiben außerhalb der Releases:

```bash
ln -sfn /opt/passwo-study/releases/PREVIOUS_RELEASE_ID /opt/passwo-study/current
systemctl restart passwo-study passwo-study-qa
```

## Follow-up

Der Timer erzeugt ab Fälligkeit je stabiler Operations-ID höchstens eine geschützte
Nachrichtendatei. Vor dem Einzelversand wird die Operation read-only geprüft; unmittelbar nach
erfolgreichem Versand wird sie einmalig bestätigt:

```bash
sudo -u passwo env PATH=/usr/local/bin:/usr/bin:/bin \
  STUDY_DATA_DIR=/var/lib/passwo-study \
  pnpm --dir /opt/passwo-study/current followup:confirm-delivery -- \
  --operation OPERATION_ID

sudo -u passwo env PATH=/usr/local/bin:/usr/bin:/bin \
  STUDY_DATA_DIR=/var/lib/passwo-study \
  pnpm --dir /opt/passwo-study/current followup:confirm-delivery -- \
  --operation OPERATION_ID --confirm
```

Der Versand erfolgt einzeln über das freigegebene Universitätskonto. Kein SMTP-Secret liegt in
Repository oder Runtime. Ein geschützter manueller Schedule ist nur Fallback und wird nicht in
eine externe Plattform importiert.

## Erhebung und Kontakte schließen

Ab `PASSWO_RESUME_CLOSE_AT` lehnt die Runtime neue und wiederaufgenommene Hauptsitzungen ab.
Danach werden Audit-/Analyseexport kontrolliert erzeugt und Follow-up-Fenster beendet.

Nach Schließung des letzten Fensters zuerst den Kontaktlösch-Dry-Run ausführen. Nur bei
`Löschung zulässig: ja` wird der Study-Dienst gestoppt und die bestätigte Löschung ausgeführt:

```bash
sudo -u passwo env PATH=/usr/local/bin:/usr/bin:/bin \
  pnpm --dir /opt/passwo-study/current followup:delete-contacts -- \
  --database /var/lib/passwo-study/recontact.sqlite

systemctl stop passwo-study
sudo -u passwo env PATH=/usr/local/bin:/usr/bin:/bin \
  pnpm --dir /opt/passwo-study/current followup:delete-contacts -- \
  --database /var/lib/passwo-study/recontact.sqlite --confirm
systemctl start passwo-study
```

Schedule-Dateien und Nachrichten im projektkontrollierten Postfach werden ebenfalls gelöscht.
Dokumentiert werden nur Datum, ausführende Person und Anzahl vor/nach der Löschung. Abschließend:

```bash
systemctl disable --now passwo-followup-operations.timer passwo-study passwo-study-qa
```

Anonymisierung und Datensatz-Freeze folgen ausschließlich
[`DATA-CONTRACT.md`](../research/DATA-CONTRACT.md).

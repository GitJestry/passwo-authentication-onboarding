# PassWo Web Deployment auf `study.statisticslab.de`

Dieses Runbook beschreibt den kleinen Produktionsbetrieb der zwölf Tage laufenden Hauptstudie auf
`193.23.254.118`. Es setzt die in ADR 0016 festgelegte same-origin Web-Runtime um. Eine zusätzliche
Backup-, Monitoring- oder Containerarchitektur gehört ausdrücklich nicht zu diesem Deployment.

## 1. Betriebsmodell

```text
Browser
  -> HTTPS https://study.statisticslab.de
  -> Nginx :443
  -> PassWo Study Server 127.0.0.1:3000
     -> Study-Web-Build
     -> lokaler SecAware-r16-Build
     -> /var/lib/passwo-study/study.sqlite
     -> /var/lib/passwo-study/recontact.sqlite
```

Nur Nginx ist öffentlich erreichbar. Der Node-Prozess bindet fest an `127.0.0.1`. Der Browser
speichert nur das `Secure`-/`HttpOnly`-Rückkehr-Cookie; Forschungsantworten und Trainingsinput
werden nicht in Browser-Speichern abgelegt.

## 2. Vorbedingungen

Auf dem lokalen Entwicklungsrechner müssen der aktuelle Repository-Stand, der eingefrorene
SecAware-Quellsnapshot und die in `package.json` festgelegte Toolchain vorhanden sein:

```text
Node 24.18.0
pnpm 11.15.1
```

Vor dem TLS-Schritt muss der DNS-A-Record auf die VM zeigen:

```bash
dig +short study.statisticslab.de
```

Erwartete Ausgabe:

```text
193.23.254.118
```

Der bestätigte SSH-Host-Key-Fingerprint der bestehenden VM lautet:

```text
SHA256:gcxzMSaanCvJwm/i0RvOBQde8rGysKVOX+bLghrPSTc
```

## 3. Lokal den Release-Stand vorbereiten

Im Repository:

```bash
pnpm install --frozen-lockfile
node ./scripts/build-reference-artifact.mjs
node ./scripts/verify-reference-artifact.mjs
pnpm build:web-runtime
```

Der letzte Befehl baut nur Study-Server und Web-Client, nicht Electron. Prüfe danach:

```bash
test -f apps/study-server/dist/production.js
test -f apps/study-web/dist/index.html
test -f research/private/reference/secaware/passwords-authentication/2026-07-26/study-build/scormdriver/indexAPI.html
```

## 4. Basispakete und Toolchain auf der VM installieren

Einmalig als `root`:

```bash
ssh root@193.23.254.118

apt update
apt install -y ca-certificates curl xz-utils rsync nginx certbot sqlite3

NODE_VERSION=24.18.0
cd /tmp
curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz"
curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt"
grep " node-v${NODE_VERSION}-linux-x64.tar.xz$" SHASUMS256.txt | sha256sum --check --strict -
tar -xJf "node-v${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-components=1
npm install --global pnpm@11.15.1

node --version
pnpm --version
```

Erwartet werden exakt `v24.18.0` und `11.15.1`.

## 5. Servicekonto und Verzeichnisse anlegen

```bash
id passwo >/dev/null 2>&1 || \
  useradd --system --home-dir /var/lib/passwo-study --shell /usr/sbin/nologin passwo

install -d -o root -g root -m 0755 /opt/passwo-study/releases
install -d -o root -g passwo -m 0750 /etc/passwo-study
install -d -o passwo -g passwo -m 0700 /var/lib/passwo-study
install -d -o www-data -g www-data -m 0755 /var/www/passwo-certbot
```

Die SQLite-Dateien liegen ausschließlich unter `/var/lib/passwo-study`. Releases unter `/opt`
enthalten keinen Teilnehmerdatensatz.

## 6. Release vom Mac übertragen

Auf dem Mac im Repository:

```bash
RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)"
REMOTE_RELEASE="/opt/passwo-study/releases/${RELEASE_ID}"
REFERENCE_BUILD="research/private/reference/secaware/passwords-authentication/2026-07-26/study-build"

ssh root@193.23.254.118 "mkdir -p '${REMOTE_RELEASE}'"

rsync -az --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.pnpm-store/' \
  --exclude '.DS_Store' \
  --exclude 'apps/study-desktop/out/' \
  --exclude 'research/private/' \
  ./ "root@193.23.254.118:${REMOTE_RELEASE}/"

ssh root@193.23.254.118 \
  "mkdir -p '${REMOTE_RELEASE}/${REFERENCE_BUILD}'"
rsync -az --delete \
  "${REFERENCE_BUILD}/" \
  "root@193.23.254.118:${REMOTE_RELEASE}/${REFERENCE_BUILD}/"

echo "${RELEASE_ID}"
```

Damit bleibt der rohe SecAware-Quellsnapshot lokal. Auf die VM gelangt nur der zuvor deterministisch
gebaute und verifizierte `r16`-Study-Build. Merke dir `RELEASE_ID` für die nächsten Schritte.

## 7. Release auf der VM reproduzierbar bauen

Als `root`, mit dem gerade übertragenen Wert:

```bash
RELEASE_ID=REPLACE_WITH_RELEASE_ID
cd "/opt/passwo-study/releases/${RELEASE_ID}"

pnpm install --frozen-lockfile
pnpm build:web-runtime

test -f apps/study-server/dist/production.js
test -f apps/study-web/dist/index.html
test -f research/private/reference/secaware/passwords-authentication/2026-07-26/study-build/scormdriver/indexAPI.html

chown -R root:root "/opt/passwo-study/releases/${RELEASE_ID}"
chmod -R o-w "/opt/passwo-study/releases/${RELEASE_ID}"
ln -sfn "/opt/passwo-study/releases/${RELEASE_ID}" /opt/passwo-study/current
```

Nicht `node_modules` vom Mac übertragen: `better-sqlite3` benötigt das Linux-x64-Binary der VM.
Der SecAware-Build wird auf der VM nicht erneut transformiert, weil der private Quellsnapshot dort
bewusst nicht vorhanden ist.

## 8. Erhebungsschluss und Umgebungsdatei festlegen

Kopiere die Vorlage:

```bash
cp /opt/passwo-study/current/deploy/env/passwo-study.env.example \
  /etc/passwo-study/passwo-study.env
chmod 0640 /etc/passwo-study/passwo-study.env
chown root:passwo /etc/passwo-study/passwo-study.env
```

Öffne anschließend:

```bash
nano /etc/passwo-study/passwo-study.env
```

Ersetze ausschließlich:

```text
PASSWO_RESUME_CLOSE_AT=REPLACE_WITH_UTC_ISO_DATETIME
```

mit dem vor Rekrutierungsbeginn festgelegten UTC-Zeitpunkt, beispielsweise:

```text
PASSWO_RESUME_CLOSE_AT=2026-09-08T21:59:59.000Z
```

Der Wert ist zugleich der technische Schluss für neue und wiederaufgenommene Hauptsitzungen. Die
Produktionsruntime startet nicht mit einem bereits vergangenen Wert.

Die übrigen produktiven Werte lauten bereits:

```text
PASSWO_PUBLIC_ORIGIN=https://study.statisticslab.de
PASSWO_PORT=3000
PASSWO_ALLOW_DESIGN_LAB=false
STUDY_ASSIGNMENT_MODE=permuted-block
STUDY_DATA_DIR=/var/lib/passwo-study
```

## 9. Systemzeit prüfen

Vor realen Teilnahmen:

```bash
timedatectl

timedatectl show -p NTPSynchronized --value
```

Der zweite Befehl muss `yes` ausgeben. Falls nicht:

```bash
systemctl restart chrony 2>/dev/null || systemctl restart systemd-timesyncd
sleep 5
timedatectl show -p NTPSynchronized --value
```

Die Serverzeitzone bleibt `Etc/UTC`.

## 10. systemd-Service installieren

```bash
cp /opt/passwo-study/current/deploy/systemd/passwo-study.service \
  /etc/systemd/system/passwo-study.service

systemctl daemon-reload
systemctl enable --now passwo-study
systemctl --no-pager --full status passwo-study
```

Lokaler Health-Check auf der VM:

```bash
curl -fsS http://127.0.0.1:3000/api/health
```

Erwartet wird JSON mit `"status":"ok"`.

Bei Startproblemen:

```bash
journalctl -u passwo-study -n 100 --no-pager
```

Die Anwendung loggt keine Request-Bodies, IP-Adressen, User-Agents oder Raw Tokens.

## 11. TLS-Zertifikat ausstellen

Zuerst eine reine HTTP-/ACME-Konfiguration installieren, weil die endgültige Nginx-Datei bereits
auf die noch nicht vorhandenen Zertifikatsdateien verweist:

```bash
cat >/etc/nginx/sites-available/passwo-study <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name study.statisticslab.de;
    access_log off;

    location /.well-known/acme-challenge/ {
        root /var/www/passwo-certbot;
    }

    location / {
        return 404;
    }
}
NGINX

ln -sfn /etc/nginx/sites-available/passwo-study /etc/nginx/sites-enabled/passwo-study
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Zertifikat ausstellen. Ersetze die E-Mail-Adresse durch deine universitäre Kontaktadresse:

```bash
certbot certonly \
  --webroot \
  --webroot-path /var/www/passwo-certbot \
  --domain study.statisticslab.de \
  --email REPLACE_WITH_UNIVERSITY_EMAIL \
  --agree-tos \
  --no-eff-email
```

Danach die endgültige Konfiguration installieren:

```bash
cp /opt/passwo-study/current/deploy/nginx/passwo-study.conf \
  /etc/nginx/sites-available/passwo-study

nginx -t
systemctl reload nginx
systemctl enable nginx
```

Erneuerung prüfen:

```bash
certbot renew --dry-run
```

## 12. Öffentliche Smoke-Tests

Vom Mac:

```bash
curl -fsS https://study.statisticslab.de/api/health
curl -I https://study.statisticslab.de/
```

Danach im Browser einen vollständigen Testlauf mit ausschließlich fiktiven Testangaben durchführen.

### 12.1 Resume prüfen

1. Neue Teilnahme beginnen.
2. Mindestens einen Fragebogenabschnitt regulär speichern.
3. PassWo starten und bis zu einem Segment nach S01 gehen.
4. Tab beziehungsweise Browser schließen.
5. `https://study.statisticslab.de` im selben Browser erneut öffnen.
6. Prüfen, dass gespeicherte Fragebogenabschnitte nicht erneut erscheinen.
7. Prüfen, dass PassWo datenschutzkonform bei S01 beginnt und die flüchtigen fiktiven Werte neu
   aufbauen lässt.
8. Einen zweiten Test in der Referenzbedingung durchführen und prüfen, dass SecAware bei der zuletzt
   bestätigten Lektion fortsetzt.

Ein Reload oder Browser-Schließen darf keinen zweiten Run erzeugen und darf den Run nicht auf
`completed` setzen.

### 12.2 Persistenz über Dienstneustart prüfen

Während eines Testlaufs:

```bash
systemctl restart passwo-study
systemctl is-active passwo-study
```

Öffne die Seite erneut. Bereits bestätigte Fragebogenblöcke und der serverseitige Checkpoint müssen
weiter vorhanden sein.

### 12.3 Regulären Abschluss prüfen

Den Testlauf bis zum gemeinsamen letzten Studienschritt abschließen. Danach auf der VM:

```bash
sqlite3 /var/lib/passwo-study/study.sqlite \
  "SELECT completion_status, COUNT(*) FROM study_sessions GROUP BY completion_status ORDER BY completion_status;"
```

Der abgeschlossene Testfall muss als `completed` erscheinen. Browser-Schließen allein darf diesen
Status nicht erzeugen.

### 12.4 Completed-only-Analyseexport prüfen

```bash
EXPORT_DIR="/var/lib/passwo-study/export-smoke-$(date -u +%Y%m%dT%H%M%SZ)"
install -d -o passwo -g passwo -m 0700 "${EXPORT_DIR}"

sudo -u passwo env PATH=/usr/local/bin:/usr/bin:/bin \
  pnpm --dir /opt/passwo-study/current study:export -- \
  --database /var/lib/passwo-study/study.sqlite \
  --output "${EXPORT_DIR}" \
  --profile analysis

head -n 5 "${EXPORT_DIR}/sessions.csv"
```

Im Analyseprofil dürfen ausschließlich `completed` Runs stehen. Ein parallel angelegter, bewusst
unvollständiger Testlauf darf nicht in `sessions.csv` vorkommen.

Lösche den Smoke-Test-Export anschließend:

```bash
rm -rf -- "${EXPORT_DIR}"
```

## 13. Rekrutierung öffnen

Erst nach den Smoke-Tests:

```bash
systemctl is-active passwo-study
nginx -t
timedatectl show -p NTPSynchronized --value
curl -fsS https://study.statisticslab.de/api/health
```

Dann Testläufe gemäß dem vorgesehenen Löschprozess entfernen und die Rekrutierungsadresse
freigeben.

## 14. Betrieb während der zwölf Tage

Kleine tägliche Prüfung:

```bash
systemctl is-active passwo-study nginx
curl -fsS http://127.0.0.1:3000/api/health
sqlite3 /var/lib/passwo-study/study.sqlite \
  "SELECT completion_status, COUNT(*) FROM study_sessions GROUP BY completion_status;"
```

Für Anwendungsfehler:

```bash
journalctl -u passwo-study --since today --no-pager
```

Es wird keine zusätzliche Backup- oder Monitoringarchitektur betrieben. Während der Erhebung werden
keine SQLite-Dateien bei laufendem Dienst mit `cp` kopiert oder manuell bearbeitet.

## 15. Neues Release und Rollback

Ein neues Release wird wieder in ein neues Verzeichnis unter `/opt/passwo-study/releases` übertragen
und dort gebaut. Danach:

```bash
ln -sfn /opt/passwo-study/releases/NEW_RELEASE_ID /opt/passwo-study/current
systemctl restart passwo-study
curl -fsS http://127.0.0.1:3000/api/health
```

Rollback auf den vorherigen Release-Stand:

```bash
ln -sfn /opt/passwo-study/releases/PREVIOUS_RELEASE_ID /opt/passwo-study/current
systemctl restart passwo-study
curl -fsS http://127.0.0.1:3000/api/health
```

Die Datenbanken bleiben unter `/var/lib/passwo-study` und werden durch den Symlinkwechsel nicht
ersetzt.

## 16. Erhebung schließen

Ab `PASSWO_RESUME_CLOSE_AT` lehnt die Runtime neue und wiederaufgenommene Hauptsitzungen ab. Danach:

1. Keine neue Rekrutierung mehr verbreiten.
2. Den vorgesehenen Audit-/Analyseexport kontrolliert erzeugen.
3. Follow-up und spätere Anonymisierung nach den Forschungsdokumenten durchführen.
4. Den Dienst erst abschalten, wenn kein zulässiger Haupt- oder Follow-up-Zugriff mehr benötigt wird.

Dienst abschalten:

```bash
systemctl disable --now passwo-study
```

#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repository_root}"

remote_host="${PASSWO_DEPLOY_HOST:-root@193.23.254.118}"
public_url="${PASSWO_DEPLOY_PUBLIC_URL:-https://study.statisticslab.de}"
control_path="/tmp/passwo-web-test-ssh-$$"

cleanup() {
  ssh -S "${control_path}" -O exit "${remote_host}" >/dev/null 2>&1 || true
  rm -f "${control_path}" 2>/dev/null || true
}
trap cleanup EXIT

echo "==> SSH-Verbindung öffnen (Passphrase höchstens einmal)"
ssh -M -S "${control_path}" -o ControlPersist=120 -fN "${remote_host}"

ssh -S "${control_path}" "${remote_host}" bash -s <<'REMOTE'
set -euo pipefail

systemctl is-active --quiet passwo-study
systemctl is-active --quiet passwo-study-qa
curl -fsS http://127.0.0.1:3000/api/health >/dev/null
curl -fsS http://127.0.0.1:3101/api/health >/dev/null
curl -fsS http://127.0.0.1:3102/api/health >/dev/null

study_database=/var/lib/passwo-study/study.sqlite
recontact_database=/var/lib/passwo-study/recontact.sqlite
test -r "${study_database}"
test -r "${recontact_database}"
test "$(stat -c '%a' /var/lib/passwo-study)" = 700
test "$(stat -c '%a' "${study_database}")" = 600
test "$(stat -c '%a' "${recontact_database}")" = 600
test "$(sqlite3 "${study_database}" 'PRAGMA quick_check;')" = ok
test -z "$(sqlite3 "${study_database}" 'PRAGMA foreign_key_check;')"
test "$(sqlite3 "${recontact_database}" 'PRAGMA quick_check;')" = ok
test -z "$(sqlite3 "${recontact_database}" 'PRAGMA foreign_key_check;')"

cd /opt/passwo-study/current
./node_modules/.bin/tsx ./scripts/audit-study-data.ts --database "${study_database}"
REMOTE

curl -fsS "${public_url}/api/health" >/dev/null
reference_status="$(curl -sS -o /dev/null -w '%{http_code}' \
  "${public_url}/reference/secaware/passwords-authentication/scormdriver/indexAPI.html")"
test "${reference_status}" = 200
video_status="$(curl -sS -o /dev/null -w '%{http_code}' \
  -H 'Range: bytes=0-1023' \
  "${public_url}/reference/secaware/passwords-authentication/scormcontent/assets/250326_SA_StarkePasswoerte.mp4")"
test "${video_status}" = 206
qa_status="$(curl -sS -o /dev/null -w '%{http_code}' "${public_url}/qa")"
test "${qa_status}" = 401

echo "Ausgerollte Web-Runtime und Datenbanken sind konsistent. Es wurden keine Produktivdaten verändert."

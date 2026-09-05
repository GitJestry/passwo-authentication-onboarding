#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repository_root}"

remote_host="${PASSWO_DEPLOY_HOST:-root@193.23.254.118}"
remote_root="${PASSWO_DEPLOY_ROOT:-/opt/passwo-study}"
public_url="${PASSWO_DEPLOY_PUBLIC_URL:-https://study.statisticslab.de}"
reference_build="research/private/reference/secaware/passwords-authentication/2026-07-26/study-build"
release_id="$(date -u +%Y%m%dT%H%M%SZ)"
remote_release="${remote_root}/releases/${release_id}"
skip_checks=false

if [[ "${1:-}" == "--skip-checks" ]]; then
  skip_checks=true
elif [[ $# -gt 0 ]]; then
  echo "Usage: pnpm deploy:web [--skip-checks]" >&2
  exit 2
fi

if [[ "${skip_checks}" == false ]]; then
  echo "==> Vollständige Web-Release-Tests ausführen"
  pnpm test:web:release
else
  echo "==> Web-Runtime bauen und statische Assets vorkomprimieren"
  pnpm build:web-runtime
fi

test -f apps/study-server/dist/production.js
test -f apps/study-server/dist/qa-production.js
test -f apps/study-web/dist/index.html
test -f "${reference_build}/scormdriver/indexAPI.html"
test -f "${reference_build}/scormdriver/scormdriver.js.gz"

control_path="/tmp/passwo-deploy-ssh-$$"
cleanup() {
  ssh -S "${control_path}" -O exit "${remote_host}" >/dev/null 2>&1 || true
  rm -f "${control_path}" 2>/dev/null || true
}
trap cleanup EXIT

echo "==> SSH-Verbindung öffnen (Passphrase höchstens einmal)"
ssh -M -S "${control_path}" -o ControlPersist=120 -fN "${remote_host}"
ssh_cmd=(ssh -S "${control_path}")
rsync_ssh="ssh -S ${control_path}"

echo "==> Release ${release_id} übertragen"
"${ssh_cmd[@]}" "${remote_host}" "mkdir -p '${remote_release}' '${remote_release}/${reference_build}'"
rsync -az --delete --no-owner --no-group \
  -e "${rsync_ssh}" \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.pnpm-store/' \
  --exclude 'playwright-report/' \
  --exclude 'test-results/' \
  --exclude '.DS_Store' \
  --exclude 'apps/study-desktop/out/' \
  --exclude 'research/private/' \
  ./ \
  "${remote_host}:${remote_release}/"
rsync -az --delete --no-owner --no-group \
  -e "${rsync_ssh}" \
  "${reference_build}/" \
  "${remote_host}:${remote_release}/${reference_build}/"

echo "==> Zielhost vorbereiten, atomar umschalten und Smoke-Tests ausführen"
"${ssh_cmd[@]}" "${remote_host}" bash -s -- \
  "${remote_release}" "${remote_root}" "${public_url}" "${reference_build}" <<'REMOTE'
set -euo pipefail

new_release="$1"
remote_root="$2"
public_url="$3"
reference_build="$4"
current_link="${remote_root}/current"
previous_release="$(readlink -f "${current_link}")"
previous_qa_available=false
if [[ -f "${previous_release}/apps/study-server/dist/qa-production.js" ]]; then
  previous_qa_available=true
fi
nginx_config="/etc/nginx/sites-available/passwo-study"
nginx_backup="$(mktemp)"
cp "${nginx_config}" "${nginx_backup}"
switched=false

rollback() {
  local exit_code=$?
  cp "${nginx_backup}" "${nginx_config}"
  nginx -t >/dev/null 2>&1 || true
  if [[ "${switched}" == true ]]; then
    echo "Deployment fehlgeschlagen; Rollback auf ${previous_release}." >&2
    ln -sfn "${previous_release}" "${current_link}"
    systemctl restart passwo-study || true
    if [[ "${previous_qa_available}" == true ]]; then
      systemctl restart passwo-study-qa || true
    else
      systemctl disable --now passwo-study-qa || true
    fi
    systemctl reload nginx || true
  fi
  rm -f "${nginx_backup}"
  exit "${exit_code}"
}
trap rollback ERR

if [[ ! -f /etc/passwo-study/passwo-study-qa.env || ! -f /etc/nginx/passwo-live-qa.htpasswd ]]; then
  echo "Live-QA ist noch nicht eingerichtet. Einmalig lokal pnpm qa:live:setup ausführen." >&2
  false
fi

cd "${new_release}"
pnpm install --frozen-lockfile
bash ./deploy/scripts/prepare-native-dependencies.sh "${new_release}" "${previous_release}"
chown -R root:root "${new_release}"
chmod -R o-w "${new_release}"

test -f apps/study-server/dist/production.js
test -f apps/study-server/dist/qa-production.js
test -f apps/study-web/dist/index.html
test -f "${reference_build}/scormdriver/indexAPI.html"
test -f "${reference_build}/scormdriver/scormdriver.js.gz"
runuser -u www-data -- test -r "${new_release}/${reference_build}/scormdriver/indexAPI.html"

install -o root -g root -m 0644 \
  deploy/systemd/passwo-study-qa.service \
  /etc/systemd/system/passwo-study-qa.service
systemctl daemon-reload

cp deploy/nginx/passwo-study.conf "${nginx_config}"
nginx -t

ln -sfn "${new_release}" "${current_link}"
switched=true
systemctl enable passwo-study-qa >/dev/null
systemctl restart passwo-study
systemctl restart passwo-study-qa

wait_for_health() {
  local port="$1"
  local service="$2"
  local healthy=false
  for _ in $(seq 1 40); do
    if curl -fsS "http://127.0.0.1:${port}/api/health" >/dev/null 2>&1; then
      healthy=true
      break
    fi
    sleep 0.25
  done
  if [[ "${healthy}" != true ]]; then
    journalctl -u "${service}" -n 60 --no-pager -o cat >&2 || true
    return 1
  fi
}

wait_for_health 3000 passwo-study
wait_for_health 3101 passwo-study-qa
wait_for_health 3102 passwo-study-qa
curl -fsS http://127.0.0.1:3101/qa >/dev/null
curl -fsS http://127.0.0.1:3102/qa/reference/direct >/dev/null

systemctl reload nginx
curl -fsS "${public_url}/api/health" >/dev/null

reference_status="$(curl -sS -o /dev/null -w '%{http_code}' \
  "${public_url}/reference/secaware/passwords-authentication/scormdriver/indexAPI.html")"
[[ "${reference_status}" == "200" ]]

video_status="$(curl -sS -o /dev/null -w '%{http_code}' \
  -H 'Range: bytes=0-1023' \
  "${public_url}/reference/secaware/passwords-authentication/scormcontent/assets/250326_SA_StarkePasswoerte.mp4")"
[[ "${video_status}" == "206" ]]

qa_status="$(curl -sS -o /dev/null -w '%{http_code}' "${public_url}/qa")"
[[ "${qa_status}" == "401" ]]

trap - ERR
rm -f "${nginx_backup}"
echo "Deployment aktiv: ${new_release}"
REMOTE

echo "==> Fertig: ${public_url} (${release_id})"

#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repository_root}"

remote_host="${PASSWO_DEPLOY_HOST:-root@193.23.254.118}"
public_url="${PASSWO_DEPLOY_PUBLIC_URL:-https://study.statisticslab.de}"
username="${PASSWO_QA_USERNAME:-passwo-qa}"

for command in openssl scp ssh; do
  if ! command -v "${command}" >/dev/null 2>&1; then
    echo "Benötigtes Programm fehlt: ${command}" >&2
    exit 1
  fi
done

if [[ ! "${username}" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Der QA-Benutzername darf nur Buchstaben, Ziffern, Punkt, Unterstrich und Bindestrich enthalten." >&2
  exit 2
fi

if [[ -n "${PASSWO_QA_PASSWORD:-}" ]]; then
  password="${PASSWO_QA_PASSWORD}"
else
  read -r -s -p "Passwort für ${username}: " password
  printf '\n'
  read -r -s -p "Passwort wiederholen: " password_confirmation
  printf '\n'
  if [[ "${password}" != "${password_confirmation}" ]]; then
    echo "Die Passwörter stimmen nicht überein." >&2
    exit 2
  fi
fi
if [[ ${#password} -lt 12 ]]; then
  echo "Das Live-QA-Passwort muss mindestens 12 Zeichen lang sein." >&2
  exit 2
fi

password_hash="$(printf '%s\n' "${password}" | openssl passwd -apr1 -stdin)"
unset password
unset password_confirmation 2>/dev/null || true
unset PASSWO_QA_PASSWORD 2>/dev/null || true

temporary_directory="$(mktemp -d)"
control_path="/tmp/passwo-qa-setup-ssh-$$"
cleanup() {
  ssh -S "${control_path}" -O exit "${remote_host}" >/dev/null 2>&1 || true
  rm -rf "${temporary_directory}"
  rm -f "${control_path}" 2>/dev/null || true
}
trap cleanup EXIT

printf '%s:%s\n' "${username}" "${password_hash}" > "${temporary_directory}/passwo-live-qa.htpasswd"
chmod 0600 "${temporary_directory}/passwo-live-qa.htpasswd"
sed "s|^PASSWO_PUBLIC_ORIGIN=.*$|PASSWO_PUBLIC_ORIGIN=${public_url}|" \
  deploy/env/passwo-study-qa.env.example \
  > "${temporary_directory}/passwo-study-qa.env"

ssh -M -S "${control_path}" -o ControlPersist=120 -fN "${remote_host}"
scp_options=(-o "ControlPath=${control_path}")
scp "${scp_options[@]}" \
  "${temporary_directory}/passwo-study-qa.env" \
  deploy/systemd/passwo-study-qa.service \
  "${temporary_directory}/passwo-live-qa.htpasswd" \
  "${remote_host}:/tmp/"

ssh -S "${control_path}" "${remote_host}" bash -s <<'REMOTE'
set -euo pipefail
install -d -o root -g passwo -m 0750 /etc/passwo-study
if [[ ! -f /etc/passwo-study/passwo-study-qa.env ]]; then
  install -o root -g passwo -m 0640 \
    /tmp/passwo-study-qa.env \
    /etc/passwo-study/passwo-study-qa.env
fi
install -o root -g www-data -m 0640 \
  /tmp/passwo-live-qa.htpasswd \
  /etc/nginx/passwo-live-qa.htpasswd
install -o root -g root -m 0644 \
  /tmp/passwo-study-qa.service \
  /etc/systemd/system/passwo-study-qa.service
rm -f \
  /tmp/passwo-study-qa.env \
  /tmp/passwo-live-qa.htpasswd \
  /tmp/passwo-study-qa.service
systemctl daemon-reload
REMOTE

printf 'Live-QA vorbereitet. Jetzt pnpm deploy:web ausführen und anschließend %s/qa öffnen.\n' \
  "${public_url}"

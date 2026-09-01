#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat >&2 <<'USAGE'
Verwendung: pnpm study:export:server -- --profile audit|analysis --output <lokales-verzeichnis>

OpenSSH übernimmt die interaktive Anmeldung. Die rohe SQLite-Datenbank bleibt auf dem Server.
USAGE
}

profile="analysis"
output_argument=""

if [[ "${1:-}" == "--" ]]; then
  shift
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      [[ $# -ge 2 ]] || { usage; exit 2; }
      profile="$2"
      shift 2
      ;;
    --output)
      [[ $# -ge 2 ]] || { usage; exit 2; }
      output_argument="$2"
      shift 2
      ;;
    *)
      usage
      exit 2
      ;;
  esac
done

if [[ "$profile" != "audit" && "$profile" != "analysis" ]]; then
  usage
  exit 2
fi
if [[ -z "$output_argument" ]]; then
  usage
  exit 2
fi

for required_command in ssh rsync pnpm mktemp; do
  if ! command -v "$required_command" >/dev/null 2>&1; then
    echo "Erforderlicher Befehl ist nicht verfügbar: ${required_command}" >&2
    exit 1
  fi
done

remote_host="${PASSWO_EXPORT_HOST:-${PASSWO_DEPLOY_HOST:-root@193.23.254.118}}"
remote_root="${PASSWO_EXPORT_ROOT:-${PASSWO_DEPLOY_ROOT:-/opt/passwo-study}}"
remote_data_directory="${PASSWO_EXPORT_DATA_DIR:-/var/lib/passwo-study}"
remote_database="${remote_data_directory}/study.sqlite"
remote_release="${remote_root}/current"

if [[ ! "$remote_host" =~ ^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$ ]]; then
  echo "Ungültiges SSH-Ziel: ${remote_host}" >&2
  exit 2
fi
if [[
  ! "$remote_root" =~ ^/[A-Za-z0-9._/-]+$ ||
    "$remote_root" == "/" ||
    "$remote_root" =~ (^|/)\.\.(/|$)
]]; then
  echo "Ungültiges Server-Release-Verzeichnis: ${remote_root}" >&2
  exit 2
fi
if [[
  ! "$remote_data_directory" =~ ^/[A-Za-z0-9._/-]+$ ||
    "$remote_data_directory" == "/" ||
    "$remote_data_directory" =~ (^|/)\.\.(/|$)
]]; then
  echo "Ungültiges Server-Datenverzeichnis: ${remote_data_directory}" >&2
  exit 2
fi

output_parent="$(dirname "$output_argument")"
output_name="$(basename "$output_argument")"
if [[ -z "$output_name" || "$output_name" == "." || "$output_name" == ".." || "$output_name" == "/" ]]; then
  echo "Das lokale Zielverzeichnis ist ungültig." >&2
  exit 2
fi
mkdir -p "$output_parent"
absolute_output_parent="$(cd "$output_parent" && pwd -P)"
local_output="${absolute_output_parent}/${output_name}"
if [[ -e "$local_output" ]]; then
  echo "Das lokale Ziel existiert bereits: ${local_output}" >&2
  exit 1
fi

local_staging_directory=""
ssh_control_directory=""
ssh_control_path=""
ssh_connection_open=false
remote_output_directory=""

valid_remote_output_directory() {
  local remote_output_name="${remote_output_directory##*/}"
  [[
    "$remote_output_directory" == "${remote_data_directory}/${remote_output_name}" &&
      "$remote_output_name" =~ ^\.study-export-transfer\.[A-Za-z0-9]+$
  ]]
}

remove_remote_output() {
  if [[ "$ssh_connection_open" != true ]] || ! valid_remote_output_directory; then
    return 0
  fi
  ssh -S "$ssh_control_path" "$remote_host" bash -s -- \
    "$remote_output_directory" "$remote_data_directory" <<'REMOTE_CLEANUP'
set -euo pipefail
output_directory="$1"
data_directory="$2"
output_name="${output_directory##*/}"
if [[
  "$output_directory" != "${data_directory}/${output_name}" ||
    ! "$output_name" =~ ^\.study-export-transfer\.[A-Za-z0-9]+$
]]; then
  echo "Unerwarteter Serverpfad wird nicht entfernt." >&2
  exit 1
fi
runuser -u passwo -- rm -rf -- "$output_directory"
REMOTE_CLEANUP
  remote_output_directory=""
}

cleanup() {
  exit_code=$?
  set +e
  remove_remote_output >/dev/null 2>&1
  if [[ -n "$local_staging_directory" && "$local_staging_directory" == "${absolute_output_parent}"/.passwo-study-export.* ]]; then
    rm -rf -- "$local_staging_directory"
  fi
  if [[ "$ssh_connection_open" == true ]]; then
    ssh -S "$ssh_control_path" -O exit "$remote_host" >/dev/null 2>&1
  fi
  if [[ -n "$ssh_control_directory" && "$ssh_control_directory" == /tmp/passwo-study-export-ssh.* ]]; then
    rm -rf -- "$ssh_control_directory"
  fi
  exit "$exit_code"
}
trap cleanup EXIT
trap 'exit 130' INT TERM

local_staging_directory="$(mktemp -d "${absolute_output_parent}/.passwo-study-export.XXXXXX")"
chmod 0700 "$local_staging_directory"
ssh_control_directory="$(mktemp -d /tmp/passwo-study-export-ssh.XXXXXX)"
ssh_control_path="${ssh_control_directory}/control"

echo "Öffne geschützte SSH-Verbindung zu ${remote_host}. OpenSSH fragt bei Bedarf nach dem Passwort oder der Schlüssel-Passphrase."
ssh -M -S "$ssh_control_path" -o ControlPersist=120 -o StrictHostKeyChecking=yes -fN "$remote_host"
ssh_connection_open=true

remote_output_directory="$(
  ssh -S "$ssh_control_path" "$remote_host" bash -s -- \
    "$remote_release" "$remote_database" "$remote_data_directory" "$profile" <<'REMOTE_EXPORT'
set -euo pipefail
release_directory="$1"
database_path="$2"
data_directory="$3"
profile="$4"

test -f "$database_path"
test -f "${release_directory}/package.json"
if [[
  ! -f "${release_directory}/apps/study-server/src/research-export-cookbook.ts" ||
    ! -f "${release_directory}/apps/study-server/src/research-export-workbook.ts"
]]; then
  echo "Der aktive Server-Release enthält den aktuellen CSV-/Excel-Exporter noch nicht. Bitte zuerst pnpm deploy:web ausführen." >&2
  exit 1
fi

output_directory="$(runuser -u passwo -- mktemp -d "${data_directory}/.study-export-transfer.XXXXXX")"
cleanup_failed_export() {
  output_name="${output_directory##*/}"
  if [[
    "$output_directory" == "${data_directory}/${output_name}" &&
      "$output_name" =~ ^\.study-export-transfer\.[A-Za-z0-9]+$
  ]]; then
    runuser -u passwo -- rm -rf -- "$output_directory"
  fi
}
trap cleanup_failed_export ERR INT TERM

runuser -u passwo -- env PATH=/usr/local/bin:/usr/bin:/bin \
  STUDY_DATA_DIR="$data_directory" \
  pnpm --dir "$release_directory" study:export \
  --database "$database_path" \
  --profile "$profile" \
  --output "$output_directory" >&2

printf '%s\n' "$output_directory"
trap - ERR INT TERM
REMOTE_EXPORT
)"

if ! valid_remote_output_directory; then
  echo "Der Server hat einen unerwarteten Exportpfad zurückgegeben." >&2
  exit 1
fi

echo "Übertrage den gefilterten Export (${profile}) ..."
rsync -rt --no-owner --no-group --chmod=F600,D700 \
  -e "ssh -S ${ssh_control_path}" \
  "${remote_host}:${remote_output_directory}/" \
  "${local_staging_directory}/"

pnpm exec tsx ./scripts/verify-study-export.ts \
  --directory "$local_staging_directory" \
  --profile "$profile"

remove_remote_output
if [[ -e "$local_output" ]]; then
  echo "Das lokale Ziel wurde während der Übertragung angelegt und wird nicht überschrieben." >&2
  exit 1
fi
mv "$local_staging_directory" "$local_output"
local_staging_directory=""

echo "Geprüfter Export (${profile}) gespeichert unter ${local_output}"

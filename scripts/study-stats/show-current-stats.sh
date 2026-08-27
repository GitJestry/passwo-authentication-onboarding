#!/usr/bin/env bash
set -euo pipefail

remote_host="${PASSWO_STATS_HOST:-${PASSWO_DEPLOY_HOST:-root@193.23.254.118}}"
database_path="${PASSWO_STATS_DATABASE:-/var/lib/passwo-study/study.sqlite}"
identity_file="${PASSWO_STATS_SSH_KEY:-}"

usage() {
  cat <<'USAGE'
Verwendung:
  show-current-stats.sh [--identity-file PFAD] [--host USER@HOST] [--database PFAD]

Optionen:
  -i, --identity-file PFAD  Privater SSH-Key; andernfalls gelten SSH-Agent und SSH-Konfiguration.
      --host USER@HOST      SSH-Ziel (Standard: root@193.23.254.118).
      --database PFAD       Datenbank auf dem Server
                            (Standard: /var/lib/passwo-study/study.sqlite).
  -h, --help                Diese Hilfe anzeigen.
USAGE
}

require_option_value() {
  local option="$1"
  local remaining="$2"
  if (( remaining < 2 )); then
    echo "Fehlender Wert für ${option}." >&2
    usage >&2
    exit 2
  fi
}

while (( $# > 0 )); do
  case "$1" in
    -i|--identity-file)
      require_option_value "$1" "$#"
      identity_file="$2"
      shift 2
      ;;
    --host)
      require_option_value "$1" "$#"
      remote_host="$2"
      shift 2
      ;;
    --database)
      require_option_value "$1" "$#"
      database_path="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unbekannte Option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ ! "$remote_host" =~ ^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$ ]]; then
  echo "Ungültiger SSH-Host: ${remote_host}" >&2
  exit 2
fi

if [[ ! "$database_path" =~ ^/[A-Za-z0-9._/-]+$ ]]; then
  echo "Ungültiger absoluter Datenbankpfad: ${database_path}" >&2
  exit 2
fi

ssh_command=( ssh )
if [[ -n "$identity_file" ]]; then
  if [[ ! -r "$identity_file" ]]; then
    echo "SSH-Key ist nicht lesbar: ${identity_file}" >&2
    exit 2
  fi
  ssh_command+=( -i "$identity_file" -o IdentitiesOnly=yes )
fi

echo "Verbinde mit ${remote_host}. SSH fragt bei Bedarf nach deiner Key-Passphrase."
echo "Lese anschließend ausschließlich aggregierte Studienstatistiken ..."
echo

"${ssh_command[@]}" -- "$remote_host" \
  "sqlite3 -readonly -header -column ${database_path}" <<'SQL'
PRAGMA query_only = ON;
BEGIN;

SELECT 'Stand (Serverzeit UTC)' AS Kennzahl, strftime('%Y-%m-%d %H:%M:%S', 'now') AS Wert;

SELECT 'Studiensessions angelegt' AS Funnel, COUNT(*) AS Anzahl
FROM study_sessions
UNION ALL
SELECT 'Pre-Fragebogen abgeschlossen', COUNT(*)
FROM study_sessions
WHERE progress_checkpoint <> 'pre-questionnaire'
UNION ALL
SELECT 'Training gestartet', COUNT(*)
FROM study_sessions AS session
WHERE EXISTS (
  SELECT 1
  FROM web_artifact_intervals AS artifact_interval
  WHERE artifact_interval.session_id = session.session_id
)
UNION ALL
SELECT 'Training abgeschlossen', COUNT(*)
FROM study_sessions
WHERE artifact_completed_at_iso IS NOT NULL
UNION ALL
SELECT 'Post-Fragebogen begonnen', COUNT(DISTINCT session_id)
FROM instrument_submissions
WHERE instrument_id = 'post-v1'
UNION ALL
SELECT 'Studie vollständig abgeschlossen', COUNT(*)
FROM study_sessions
WHERE completion_status = 'completed'
UNION ALL
SELECT 'Follow-up-Einwilligungen', COUNT(*)
FROM study_sessions
WHERE follow_up_consent = 1;

SELECT
  CASE completion_status
    WHEN 'in-progress' THEN 'In Bearbeitung'
    WHEN 'completed' THEN 'Vollständig abgeschlossen'
    WHEN 'technical-abort' THEN 'Technischer Abbruch'
    WHEN 'participant-withdrawal' THEN 'Teilnahme zurückgezogen'
    WHEN 'incomplete-reload' THEN 'Unvollständig nach Reload'
    ELSE completion_status
  END AS Abschlussstatus,
  COUNT(*) AS Anzahl
FROM study_sessions
GROUP BY completion_status
ORDER BY completion_status;

SELECT
  progress_checkpoint AS Aktueller_Checkpoint,
  COUNT(*) AS Anzahl
FROM study_sessions
WHERE completion_status = 'in-progress'
GROUP BY progress_checkpoint
ORDER BY progress_checkpoint;

SELECT
  condition AS Bedingung,
  COUNT(*) AS Sessions,
  SUM(
    CASE WHEN EXISTS (
      SELECT 1
      FROM web_artifact_intervals AS artifact_interval
      WHERE artifact_interval.session_id = session.session_id
    ) THEN 1 ELSE 0 END
  ) AS Training_gestartet,
  SUM(CASE WHEN artifact_completed_at_iso IS NOT NULL THEN 1 ELSE 0 END)
    AS Training_abgeschlossen,
  SUM(CASE WHEN completion_status = 'completed' THEN 1 ELSE 0 END)
    AS Studie_abgeschlossen
FROM study_sessions AS session
GROUP BY condition
ORDER BY condition;

SELECT
  MIN(created_at_iso) AS Erste_Session_UTC,
  MAX(created_at_iso) AS Neueste_Session_UTC,
  MAX(completed_at_iso) AS Letzter_Abschluss_UTC
FROM study_sessions;

SELECT 'Gespeicherte Instrumentabschnitte' AS Datensatztyp, COUNT(*) AS Anzahl
FROM instrument_submissions
UNION ALL
SELECT 'Gespeicherte Antwortzeilen', COUNT(*)
FROM responses
UNION ALL
SELECT 'Timingereignisse', COUNT(*)
FROM timing_events
UNION ALL
SELECT 'Trainingsintervalle', COUNT(*)
FROM web_artifact_intervals;

COMMIT;
SQL

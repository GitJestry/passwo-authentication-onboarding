#!/usr/bin/env bash
set -euo pipefail

remote_host="${PASSWO_STATS_HOST:-${PASSWO_DEPLOY_HOST:-root@193.23.254.118}}"
database_path="${PASSWO_STATS_DATABASE:-/var/lib/passwo-study/study.sqlite}"
recontact_database_path="${PASSWO_STATS_RECONTACT_DATABASE:-/var/lib/passwo-study/recontact.sqlite}"
identity_file="${PASSWO_STATS_SSH_KEY:-}"
show_emails=false

usage() {
  cat <<'USAGE'
Verwendung:
  show-current-stats.sh [--identity-file PFAD] [--host USER@HOST] [--database PFAD]
  show-current-stats.sh --show-emails [--identity-file PFAD] [--host USER@HOST]
                        [--recontact-database PFAD]

Optionen:
  -i, --identity-file PFAD  Privater SSH-Key; andernfalls gelten SSH-Agent und SSH-Konfiguration.
      --host USER@HOST      SSH-Ziel (Standard: root@193.23.254.118).
      --database PFAD       Datenbank auf dem Server
                            (Standard: /var/lib/passwo-study/study.sqlite).
      --show-emails         E-Mail-Adressen und Follow-up-Zeitraum anzeigen.
      --recontact-database PFAD
                            Getrenntes Kontaktregister auf dem Server
                            (Standard: /var/lib/passwo-study/recontact.sqlite).
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
    --show-emails)
      show_emails=true
      shift
      ;;
    --recontact-database)
      require_option_value "$1" "$#"
      recontact_database_path="$2"
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

if [[ ! "$recontact_database_path" =~ ^/[A-Za-z0-9._/-]+$ ]]; then
  echo "Ungültiger absoluter Kontaktregisterpfad: ${recontact_database_path}" >&2
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

if [[ "$show_emails" == true ]]; then
  echo "Verbinde mit ${remote_host}. SSH fragt bei Bedarf nach deiner Key-Passphrase."
  echo "Lese das getrennte Kontaktregister read-only; die Ausgabe enthält personenbezogene Daten."
  echo

  "${ssh_command[@]}" -- "$remote_host" \
    "sqlite3 -readonly -header -column ${recontact_database_path}" <<'SQL'
PRAGMA query_only = ON;
BEGIN;

SELECT
  email AS E_Mail,
  COALESCE(first_invitation_at_iso, 'noch nicht terminiert') AS Follow_up_ab_UTC,
  COALESCE(closes_at_iso, 'noch nicht terminiert') AS Follow_up_bis_UTC
FROM registrations
ORDER BY
  closes_at_iso IS NULL,
  closes_at_iso,
  email;

COMMIT;
SQL
  exit 0
fi

echo "Verbinde mit ${remote_host}. SSH fragt bei Bedarf nach deiner Key-Passphrase."
echo "Lese anschließend ausschließlich aggregierte Studienstatistiken ..."
echo

"${ssh_command[@]}" -- "$remote_host" \
  "sqlite3 -readonly -header -column ${database_path}" <<'SQL'
PRAGMA query_only = ON;
BEGIN;

.print 'ÜBERBLICK'
SELECT strftime('%Y-%m-%d %H:%M:%S', 'now') AS "Stand (UTC)";

WITH metrics (sort_order, label, count) AS (
  SELECT 1, 'Sessions angelegt', COUNT(*)
  FROM study_sessions
  UNION ALL
  SELECT 2, 'Training gestartet', COUNT(*)
  FROM study_sessions AS session
  WHERE EXISTS (
    SELECT 1
    FROM web_artifact_intervals AS artifact_interval
    WHERE artifact_interval.session_id = session.session_id
  )
  UNION ALL
  SELECT 3, 'Training abgeschlossen', COUNT(*)
  FROM study_sessions
  WHERE artifact_completed_at_iso IS NOT NULL
  UNION ALL
  SELECT 4, 'Studie abgeschlossen', COUNT(*)
  FROM study_sessions
  WHERE completion_status = 'completed'
  UNION ALL
  SELECT 5, 'Technische Abbrüche', COUNT(*)
  FROM study_sessions
  WHERE completion_status = 'technical-abort'
  UNION ALL
  SELECT 6, 'Follow-up-Einwilligungen', COUNT(*)
  FROM study_sessions
  WHERE follow_up_consent = 1
)
SELECT
  label AS Kennzahl,
  count AS Anzahl,
  printf(
    '%.1f %%',
    100.0 * count / NULLIF((SELECT COUNT(*) FROM study_sessions), 0)
  ) AS "Anteil an Sessions"
FROM metrics
ORDER BY sort_order;

.print ''
.print 'BEDINGUNGEN'
SELECT
  CASE condition
    WHEN 'supportive' THEN 'PassWo'
    WHEN 'reference' THEN 'SecAware'
    ELSE condition
  END AS Lernangebot,
  COUNT(*) AS Sessions,
  SUM(CASE WHEN artifact_completed_at_iso IS NOT NULL THEN 1 ELSE 0 END)
    AS "Training abgeschlossen",
  SUM(CASE WHEN completion_status = 'completed' THEN 1 ELSE 0 END)
    AS "Studie abgeschlossen",
  printf(
    '%.1f %%',
    100.0 * SUM(CASE WHEN completion_status = 'completed' THEN 1 ELSE 0 END) / COUNT(*)
  ) AS Abschlussquote
FROM study_sessions
GROUP BY condition
ORDER BY
  CASE condition WHEN 'supportive' THEN 1 WHEN 'reference' THEN 2 ELSE 3 END,
  condition;

.print ''
.print 'ZEIT'
WITH completed_artifact_durations AS (
  SELECT
    session.session_id,
    session.condition,
    SUM(artifact_interval.confirmed_elapsed_ms) AS duration_ms
  FROM study_sessions AS session
  JOIN web_artifact_intervals AS artifact_interval
    ON artifact_interval.session_id = session.session_id
  WHERE session.artifact_completed_at_iso IS NOT NULL
  GROUP BY session.session_id, session.condition
),
ranked_artifact_durations AS (
  SELECT
    duration.*,
    ROW_NUMBER() OVER (
      PARTITION BY condition
      ORDER BY duration_ms, session_id
    ) AS duration_rank,
    COUNT(*) OVER (PARTITION BY condition) AS duration_count
  FROM completed_artifact_durations AS duration
),
duration_quartile_parts AS (
  SELECT
    condition,
    duration_count,
    MAX(
      CASE WHEN duration_rank = ((duration_count - 1) / 4) + 1 THEN duration_ms END
    ) AS q1_low,
    MAX(
      CASE WHEN duration_rank = ((duration_count + 2) / 4) + 1 THEN duration_ms END
    ) AS q1_high,
    MAX(
      CASE WHEN duration_rank = ((3 * (duration_count - 1)) / 4) + 1 THEN duration_ms END
    ) AS q3_low,
    MAX(
      CASE WHEN duration_rank = ((3 * (duration_count - 1) + 3) / 4) + 1
        THEN duration_ms END
    ) AS q3_high
  FROM ranked_artifact_durations
  GROUP BY condition, duration_count
),
duration_limits AS (
  SELECT
    condition,
    duration_count,
    q1_low + (q1_high - q1_low) * ((duration_count - 1) % 4) / 4.0 AS q1,
    q3_low + (q3_high - q3_low) * ((3 * (duration_count - 1)) % 4) / 4.0 AS q3
  FROM duration_quartile_parts
),
duration_fit_ratings AS (
  SELECT
    session_id,
    MAX(CAST(json_value AS INTEGER)) AS time_fit
  FROM responses
  WHERE instrument_id = 'post-v1'
    AND section_id = 'duration'
    AND item_id = 'TIME_FIT'
  GROUP BY session_id
),
completed_artifacts_with_fit AS (
  SELECT
    duration.condition,
    duration.duration_ms,
    rating.time_fit,
    CASE
      WHEN limits.duration_count < 4 THEN 1
      WHEN duration.duration_ms BETWEEN
        limits.q1 - 1.5 * (limits.q3 - limits.q1)
        AND limits.q3 + 1.5 * (limits.q3 - limits.q1)
        THEN 1
      ELSE 0
    END AS duration_included
  FROM ranked_artifact_durations AS duration
  JOIN duration_limits AS limits ON limits.condition = duration.condition
  LEFT JOIN duration_fit_ratings AS rating ON rating.session_id = duration.session_id
)
SELECT
  CASE condition
    WHEN 'supportive' THEN 'PassWo'
    WHEN 'reference' THEN 'SecAware'
    ELSE condition
  END AS Lernangebot,
  COUNT(*) AS Abschlüsse,
  CASE
    WHEN SUM(CASE WHEN duration_included = 0 THEN 1 ELSE 0 END) = 0
      THEN printf(
        '%.1f Min.',
        AVG(CASE WHEN duration_included = 1 THEN duration_ms END) / 60000.0
      )
    ELSE printf(
      '%.1f Min. (%d Ausreißer entfernt)',
      AVG(CASE WHEN duration_included = 1 THEN duration_ms END) / 60000.0,
      SUM(CASE WHEN duration_included = 0 THEN 1 ELSE 0 END)
    )
  END AS "Ø Trainingsdauer",
  CASE
    WHEN COUNT(time_fit) = 0 THEN 'noch keine Antworten'
    ELSE printf(
      '%.0f %% genau richtig; %.0f %% zu kurz; %.0f %% zu lang (n=%d)',
      100.0 * SUM(CASE WHEN time_fit = 4 THEN 1 ELSE 0 END) / COUNT(time_fit),
      100.0 * SUM(CASE WHEN time_fit BETWEEN 1 AND 3 THEN 1 ELSE 0 END) / COUNT(time_fit),
      100.0 * SUM(CASE WHEN time_fit BETWEEN 5 AND 7 THEN 1 ELSE 0 END) / COUNT(time_fit),
      COUNT(time_fit)
    )
  END AS Dauerpassung
FROM completed_artifacts_with_fit
GROUP BY condition
ORDER BY
  CASE condition WHEN 'supportive' THEN 1 WHEN 'reference' THEN 2 ELSE 3 END,
  condition;

COMMIT;
SQL

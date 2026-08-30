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

SELECT 'Stand (Serverzeit UTC)' AS Kennzahl, strftime('%Y-%m-%d %H:%M:%S', 'now') AS Wert;

WITH funnel (sort_order, label, count) AS (
  SELECT 1, 'Studiensessions angelegt', COUNT(*)
  FROM study_sessions
  UNION ALL
  SELECT 2, 'Pre-Fragebogen abgeschlossen', COUNT(*)
  FROM study_sessions
  WHERE progress_checkpoint <> 'pre-questionnaire'
  UNION ALL
  SELECT 3, 'Training gestartet', COUNT(*)
  FROM study_sessions AS session
  WHERE EXISTS (
    SELECT 1
    FROM web_artifact_intervals AS artifact_interval
    WHERE artifact_interval.session_id = session.session_id
  )
  UNION ALL
  SELECT 4, 'Training abgeschlossen', COUNT(*)
  FROM study_sessions
  WHERE artifact_completed_at_iso IS NOT NULL
  UNION ALL
  SELECT 5, 'Post-Fragebogen begonnen', COUNT(DISTINCT session_id)
  FROM instrument_submissions
  WHERE instrument_id = 'post-v1'
  UNION ALL
  SELECT 6, 'Alle Pflichtdaten gespeichert', COUNT(*)
  FROM study_sessions
  WHERE completion_status = 'completed'
    OR (completion_status = 'in-progress' AND progress_checkpoint = 'session-closure')
  UNION ALL
  SELECT 7, 'Studie vollständig abgeschlossen', COUNT(*)
  FROM study_sessions
  WHERE completion_status = 'completed'
)
SELECT
  label AS Funnel,
  count AS Anzahl,
  CASE
    WHEN sort_order = 1 THEN NULL
    ELSE (
      SELECT previous.count
      FROM funnel AS previous
      WHERE previous.sort_order = funnel.sort_order - 1
    ) - count
  END AS Verlust_zum_vorherigen_Schritt,
  printf(
    '%.1f %%',
    100.0 * count / NULLIF((SELECT COUNT(*) FROM study_sessions), 0)
  ) AS Anteil_aller_Sessions
FROM funnel
ORDER BY sort_order;

SELECT
  'Follow-up-Einwilligungen' AS Kennzahl,
  COUNT(*) AS Anzahl,
  printf(
    '%.1f %%',
    100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM study_sessions), 0)
  ) AS Anteil_aller_Sessions
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

WITH activity_events AS (
  SELECT session_id, created_at_iso AS activity_at_iso
  FROM study_sessions
  UNION ALL
  SELECT session_id, last_confirmed_at_iso
  FROM web_resume_tokens
  UNION ALL
  SELECT session_id, last_confirmed_at_iso
  FROM web_artifact_intervals
  UNION ALL
  SELECT session_id, submitted_at_iso
  FROM instrument_submissions
),
last_activity AS (
  SELECT session_id, MAX(activity_at_iso) AS last_activity_at_iso
  FROM activity_events
  GROUP BY session_id
),
aged_checkpoints AS (
  SELECT
    session.condition,
    session.progress_checkpoint,
    CASE
      WHEN julianday('now') - julianday(activity.last_activity_at_iso) <= 2.0 / 1440
        THEN 'bis 2 Minuten'
      WHEN julianday('now') - julianday(activity.last_activity_at_iso) <= 15.0 / 1440
        THEN '2 bis 15 Minuten'
      WHEN julianday('now') - julianday(activity.last_activity_at_iso) <= 1
        THEN '15 Minuten bis 24 Stunden'
      WHEN julianday('now') - julianday(activity.last_activity_at_iso) <= 2
        THEN '1 bis 2 Tage'
      ELSE 'mehr als 2 Tage'
    END AS activity_age,
    CASE
      WHEN julianday('now') - julianday(activity.last_activity_at_iso) <= 2.0 / 1440 THEN 1
      WHEN julianday('now') - julianday(activity.last_activity_at_iso) <= 15.0 / 1440 THEN 2
      WHEN julianday('now') - julianday(activity.last_activity_at_iso) <= 1 THEN 3
      WHEN julianday('now') - julianday(activity.last_activity_at_iso) <= 2 THEN 4
      ELSE 5
    END AS activity_rank
  FROM study_sessions AS session
  JOIN last_activity AS activity ON activity.session_id = session.session_id
  WHERE session.completion_status = 'in-progress'
)
SELECT
  condition AS Bedingung,
  progress_checkpoint AS Letzter_bestaetigter_Checkpoint,
  activity_age AS Alter_des_letzten_Serverkontakts,
  COUNT(*) AS Sessions
FROM aged_checkpoints
GROUP BY condition, progress_checkpoint, activity_age, activity_rank
ORDER BY condition, progress_checkpoint, activity_rank;

WITH last_artifact_contact AS (
  SELECT session_id, MAX(last_confirmed_at_iso) AS last_contact_at_iso
  FROM web_artifact_intervals
  GROUP BY session_id
)
SELECT
  session.condition AS Bedingung,
  COUNT(*) AS Unvollstaendige_Trainingssessions,
  SUM(
    CASE WHEN julianday('now') - julianday(contact.last_contact_at_iso) <= 2.0 / 1440
      THEN 1 ELSE 0 END
  ) AS Kontakt_bis_2_Minuten,
  SUM(
    CASE WHEN julianday('now') - julianday(contact.last_contact_at_iso) > 2.0 / 1440
      AND julianday('now') - julianday(contact.last_contact_at_iso) <= 15.0 / 1440
      THEN 1 ELSE 0 END
  ) AS Kontakt_2_bis_15_Minuten,
  SUM(
    CASE WHEN julianday('now') - julianday(contact.last_contact_at_iso) > 15.0 / 1440
      THEN 1 ELSE 0 END
  ) AS Kontakt_aelter_als_15_Minuten
FROM study_sessions AS session
JOIN last_artifact_contact AS contact ON contact.session_id = session.session_id
WHERE session.completion_status = 'in-progress'
  AND session.artifact_completed_at_iso IS NULL
GROUP BY session.condition
ORDER BY session.condition;

SELECT 'Training gestartet, Checkpoint noch artifact-preparation' AS Auffaelligkeit, COUNT(*) AS Anzahl
FROM study_sessions AS session
WHERE session.completion_status = 'in-progress'
  AND session.artifact_completed_at_iso IS NULL
  AND session.progress_checkpoint = 'artifact-preparation'
  AND EXISTS (
    SELECT 1 FROM web_artifact_intervals AS artifact_interval
    WHERE artifact_interval.session_id = session.session_id
  )
UNION ALL
SELECT 'Reference gestartet, aber ohne reference-Checkpoint', COUNT(*)
FROM study_sessions AS session
WHERE session.condition = 'reference'
  AND session.completion_status = 'in-progress'
  AND session.artifact_completed_at_iso IS NULL
  AND session.progress_checkpoint NOT LIKE 'reference:%'
  AND EXISTS (
    SELECT 1 FROM web_artifact_intervals AS artifact_interval
    WHERE artifact_interval.session_id = session.session_id
  )
UNION ALL
SELECT 'SecAware-Ende bestätigt, Training noch nicht abgeschlossen', COUNT(*)
FROM study_sessions
WHERE condition = 'reference'
  AND completion_status = 'in-progress'
  AND artifact_completed_at_iso IS NULL
  AND progress_checkpoint = 'reference:mfa'
UNION ALL
SELECT 'Alle Pflichtdaten vorhanden, Status noch in-progress', COUNT(*)
FROM study_sessions
WHERE completion_status = 'in-progress'
  AND progress_checkpoint = 'session-closure'
UNION ALL
SELECT 'Offenes Trainingsintervall ohne Kontakt seit mehr als 2 Minuten', COUNT(DISTINCT session_id)
FROM web_artifact_intervals
WHERE closed_at_iso IS NULL
  AND julianday('now') - julianday(last_confirmed_at_iso) > 2.0 / 1440
UNION ALL
SELECT 'Training abgeschlossen, Post-Fragebogen noch nicht begonnen', COUNT(*)
FROM study_sessions AS session
WHERE session.completion_status = 'in-progress'
  AND session.artifact_completed_at_iso IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM instrument_submissions AS submission
    WHERE submission.session_id = session.session_id
      AND submission.instrument_id = 'post-v1'
  );

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
    AS Studie_abgeschlossen,
  printf(
    '%.1f %%',
    100.0 * SUM(CASE WHEN completion_status = 'completed' THEN 1 ELSE 0 END) / COUNT(*)
  ) AS Abschlussquote
FROM study_sessions AS session
GROUP BY condition
ORDER BY condition;

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
duration_ratings AS (
  SELECT
    session_id,
    MAX(
      CASE WHEN item_id = 'PERCEIVED_DURATION' THEN CAST(json_value AS REAL) END
    ) AS perceived_duration,
    MAX(
      CASE WHEN item_id = 'TIME_FIT' THEN CAST(json_value AS REAL) END
    ) AS time_fit
  FROM responses
  WHERE instrument_id = 'post-v1'
    AND section_id = 'duration'
    AND item_id IN ('PERCEIVED_DURATION', 'TIME_FIT')
  GROUP BY session_id
),
ordered_completed_artifact_durations AS (
  SELECT
    duration.condition,
    duration.duration_ms,
    rating.perceived_duration,
    rating.time_fit
  FROM completed_artifact_durations AS duration
  LEFT JOIN duration_ratings AS rating ON rating.session_id = duration.session_id
  ORDER BY duration.condition, duration.duration_ms
)
SELECT
  CASE condition
    WHEN 'supportive' THEN 'PassWo'
    WHEN 'reference' THEN 'SecAware'
    ELSE condition
  END AS Lernangebot,
  COUNT(*) AS Abgeschlossene_Lernangebote,
  printf('%.1f Minuten', AVG(duration_ms) / 60000.0) AS Durchschnittliche_Dauer,
  CASE
    WHEN COUNT(perceived_duration) = 0 THEN 'noch keine Antworten'
    ELSE printf(
      '%s (Ø %.1f/7; n=%d)',
      CASE CAST(ROUND(AVG(perceived_duration)) AS INTEGER)
        WHEN 1 THEN 'sehr kurz'
        WHEN 2 THEN 'kurz'
        WHEN 3 THEN 'eher kurz'
        WHEN 4 THEN 'weder kurz noch lang'
        WHEN 5 THEN 'eher lang'
        WHEN 6 THEN 'lang'
        WHEN 7 THEN 'sehr lang'
      END,
      AVG(perceived_duration),
      COUNT(perceived_duration)
    )
  END AS Zeitgefuehl,
  CASE
    WHEN COUNT(time_fit) = 0 THEN 'noch keine Antworten'
    ELSE printf(
      '%s (Ø %.1f/7; n=%d)',
      CASE CAST(ROUND(AVG(time_fit)) AS INTEGER)
        WHEN 1 THEN 'deutlich zu kurz'
        WHEN 2 THEN 'zu kurz'
        WHEN 3 THEN 'eher zu kurz'
        WHEN 4 THEN 'genau richtig'
        WHEN 5 THEN 'eher zu lang'
        WHEN 6 THEN 'zu lang'
        WHEN 7 THEN 'deutlich zu lang'
      END,
      AVG(time_fit),
      COUNT(time_fit)
    )
  END AS Dauerpassung,
  group_concat(printf('%.1f', duration_ms / 60000.0), ', ') AS Einzelzeiten_Minuten
FROM ordered_completed_artifact_durations
GROUP BY condition
ORDER BY condition;

SELECT
  COALESCE(recruitment_source, 'ub') AS Rekrutierungsquelle,
  COUNT(*) AS Sessions
FROM study_sessions
GROUP BY COALESCE(recruitment_source, 'ub')
ORDER BY Rekrutierungsquelle;

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

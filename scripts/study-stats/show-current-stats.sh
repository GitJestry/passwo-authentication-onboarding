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
                        [--database PFAD] [--recontact-database PFAD]

Optionen:
  -i, --identity-file PFAD  Privater SSH-Key; andernfalls gelten SSH-Agent und SSH-Konfiguration.
      --host USER@HOST      SSH-Ziel (Standard: root@193.23.254.118).
      --database PFAD       Datenbank auf dem Server
                            (Standard: /var/lib/passwo-study/study.sqlite).
      --show-emails         E-Mail-Adressen, Follow-up-Abschluss und Erinnerungsfenster anzeigen.
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
  email_colors=0
  if [[ -t 1 && "${TERM:-dumb}" != dumb && -z "${NO_COLOR:-}" ]]; then
    email_colors=1
  fi

  echo "Verbinde mit ${remote_host}. SSH fragt bei Bedarf nach deiner Key-Passphrase."
  echo "Lese Kontaktregister und Follow-up-Abschlussstatus read-only; die Ausgabe enthält personenbezogene Daten."
  echo

  "${ssh_command[@]}" -- "$remote_host" \
    "sqlite3 -readonly -bail -header -column -cmd \"ATTACH DATABASE 'file:${database_path}?mode=ro' AS study;\" ${recontact_database_path}" <<'SQL' | awk -v colors="$email_colors" '
    /^FOLLOW-UP-FENSTER$/ { invitations = 1 }
    /^ERINNERUNGSFENSTER/ { invitations = 0 }
    {
      color = ""
      if (colors && invitations) {
        if ($0 ~ /[[:space:]]versendet[[:space:]]*$/) color = "\033[32m"
        else if ($0 ~ /[[:space:]]fällig[[:space:]]*$/) color = "\033[33m"
      }
      if (color != "") printf "%s%s\033[0m\n", color, $0
      else print
    }
  '
PRAGMA query_only = ON;
BEGIN;

.print 'FOLLOW-UP-FENSTER'
SELECT
  email AS E_Mail,
  COALESCE(first_invitation_at_iso, 'noch nicht terminiert') AS Follow_up_ab_UTC,
  COALESCE(closes_at_iso, 'noch nicht terminiert') AS Follow_up_bis_UTC,
  CASE
    WHEN follow_up.session_id IS NOT NULL THEN 'abgeschlossen'
    ELSE 'noch nicht abgegeben'
  END AS Nachbefragung,
  CASE
    WHEN first_invitation_sent_at_iso IS NOT NULL THEN 'versendet'
    WHEN first_invitation_at_iso IS NULL OR closes_at_iso IS NULL THEN 'noch nicht terminiert'
    WHEN julianday('now') >= julianday(closes_at_iso) THEN 'Fenster geschlossen'
    WHEN julianday('now') >= julianday(first_invitation_at_iso) THEN 'fällig'
    ELSE 'geplant'
  END AS Einladungsstatus
FROM registrations AS registration
LEFT JOIN study.instrument_submissions AS follow_up
  ON follow_up.session_id = registration.session_id
  AND follow_up.instrument_id = 'follow-up-v1'
  AND follow_up.section_id = 'actions'
ORDER BY
  closes_at_iso IS NULL,
  closes_at_iso,
  email;

.print ''
.print 'ERINNERUNGSFENSTER (nach bestätigtem Erstversand)'
.print 'Bereits abgeschlossene Nachbefragungen sind aus dieser Liste ausgeschlossen.'
.print 'Vor einem Versand die Operation mit followup:confirm-delivery ohne --confirm prüfen.'
WITH reminder_windows AS (
  SELECT
    email,
    first_invitation_sent_at_iso,
    closes_at_iso,
    reminder_sent_at_iso,
    -- Match the scheduler: a late first delivery shifts the earliest reminder.
    MAX(
      julianday(reminder_at_iso),
      julianday(first_invitation_sent_at_iso, '+48 hours')
    ) AS reminder_due_julian
  FROM registrations AS registration
  LEFT JOIN study.instrument_submissions AS follow_up
    ON follow_up.session_id = registration.session_id
    AND follow_up.instrument_id = 'follow-up-v1'
    AND follow_up.section_id = 'actions'
  WHERE first_invitation_sent_at_iso IS NOT NULL
    AND follow_up.session_id IS NULL
)
SELECT
  email AS E_Mail,
  first_invitation_sent_at_iso AS Einladung_versendet_UTC,
  CASE
    WHEN reminder_due_julian IS NULL THEN 'noch nicht terminiert'
    WHEN reminder_due_julian >= julianday(closes_at_iso) THEN 'kein Zeitfenster mehr'
    ELSE strftime('%Y-%m-%dT%H:%M:%fZ', reminder_due_julian)
  END AS Erinnerung_fruehestens_UTC,
  COALESCE(closes_at_iso, 'noch nicht terminiert') AS Erinnerung_bis_UTC,
  COALESCE(reminder_sent_at_iso, 'nicht bestätigt') AS Erinnerung_versendet_UTC
FROM reminder_windows
ORDER BY reminder_due_julian IS NULL, reminder_due_julian, email;

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
.print 'REKRUTIERUNGSQUELLEN'
SELECT
  recruitment_source AS Quelle,
  COUNT(*) AS Sessions
FROM study_sessions
GROUP BY recruitment_source
ORDER BY Sessions DESC, recruitment_source;

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

.print ''
.print 'NACHBEFRAGUNG NACH CA. 10 TAGEN (Selbstberichte)'
.print 'n = vollständige Nachbefragungen; je Antwort: Anzahl (Anteil an n). PM = Passwortmanager.'
.print 'Nur Antwortende; fehlende Nachbefragungen zählen nicht als Nein. Explorativ, kein Wirkungsnachweis.'
WITH learning_offers (condition, label, sort_order) AS (
  VALUES ('supportive', 'PassWo', 1), ('reference', 'SecAware', 2)
),
focal_actions (item_id, label, sort_order) AS (
  VALUES
    ('FU_REUSE_REPLACED', 'Wiederverwendung ersetzt', 1),
    ('FU_PM_ACCOUNT_SPECIFIC', 'PM-Passwort erzeugt + gespeichert', 2),
    ('FU_MFA_ENABLED', 'MFA/2FA aktiviert', 3)
),
followup_submissions AS (
  SELECT session.session_id, session.condition, submission.instrument_version
  FROM study_sessions AS session
  JOIN instrument_submissions AS submission
    ON submission.session_id = session.session_id
    AND submission.instrument_id = 'follow-up-v1'
    AND submission.section_id = 'actions'
    AND submission.instrument_version = session.follow_up_version
  WHERE session.completion_status = 'completed'
    AND session.follow_up_consent = 1
    AND session.follow_up_version = 'follow-up-v6-pilot'
),
action_counts AS (
  SELECT
    offer.label AS learning_offer,
    offer.sort_order AS offer_order,
    action.label AS action,
    action.sort_order AS action_order,
    COUNT(submission.session_id) AS respondent_count,
    SUM(CASE WHEN json_extract(response.json_value, '$') = 'yes' THEN 1 ELSE 0 END) AS yes_count,
    SUM(CASE WHEN json_extract(response.json_value, '$') = 'no' THEN 1 ELSE 0 END) AS no_count,
    SUM(CASE WHEN json_extract(response.json_value, '$') = 'unsure' THEN 1 ELSE 0 END) AS unsure_count
  FROM learning_offers AS offer
  CROSS JOIN focal_actions AS action
  LEFT JOIN followup_submissions AS submission ON submission.condition = offer.condition
  LEFT JOIN responses AS response
    ON response.session_id = submission.session_id
    AND response.instrument_id = 'follow-up-v1'
    AND response.instrument_version = submission.instrument_version
    AND response.section_id = 'actions'
    AND response.item_id = action.item_id
  GROUP BY offer.condition, action.item_id
)
SELECT
  learning_offer AS Lernangebot,
  action AS Handlung,
  respondent_count AS n,
  CASE WHEN respondent_count = 0 THEN '—'
    ELSE printf('%d (%.0f %%)', yes_count, 100.0 * yes_count / respondent_count)
  END AS Ja,
  CASE WHEN respondent_count = 0 THEN '—'
    ELSE printf('%d (%.0f %%)', no_count, 100.0 * no_count / respondent_count)
  END AS Nein,
  CASE WHEN respondent_count = 0 THEN '—'
    ELSE printf('%d (%.0f %%)', unsure_count, 100.0 * unsure_count / respondent_count)
  END AS Unsicher
FROM action_counts
ORDER BY offer_order, action_order;

COMMIT;
SQL

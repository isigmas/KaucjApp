#!/usr/bin/env bash
# Nightly backup: pg_dump (custom format) of every database -> Cloudflare R2, with retention.
# Runs on the server via systemd (kaucjapp-backup.timer, installed by bootstrap.sh).
#
#   daily/YYYY-MM-DD/<db>.dump     kept for BACKUP_RETENTION_DAILY_DAYS (default 14)
#   weekly/YYYY-Www/<db>.dump      Sunday's backup, kept for BACKUP_RETENTION_WEEKLY_DAYS (default 56)
#
# Success/failure is reported to healthchecks.io (BACKUP_HEALTHCHECK_URL); a missed run alerts you as well.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

DATABASES=(users_db offers_db auth_db deposit_db notification_db monitor_db)
DAILY_DAYS="$(env_get BACKUP_RETENTION_DAILY_DAYS)"; DAILY_DAYS="${DAILY_DAYS:-14}"
WEEKLY_DAYS="$(env_get BACKUP_RETENTION_WEEKLY_DAYS)"; WEEKLY_DAYS="${WEEKLY_DAYS:-56}"
HC_URL="$(env_get BACKUP_HEALTHCHECK_URL)"
DB_USER="$(env_get DB_USER)"
BUCKET="$(env_get BACKUP_S3_BUCKET)"

export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="$(env_get BACKUP_S3_ACCESS_KEY)"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$(env_get BACKUP_S3_SECRET_KEY)"
export RCLONE_CONFIG_R2_ENDPOINT="$(env_get BACKUP_S3_ENDPOINT)"
export RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true

ping_hc() { # ping_hc [suffix]
  [[ -n "$HC_URL" ]] || return 0
  curl -fsS -m 10 --retry 3 -o /dev/null "${HC_URL}${1:-}" || log "WARN: healthcheck ping failed"
}

STAGING="$(mktemp -d /var/tmp/kaucjapp-backup.XXXXXX)"
cleanup() { rm -rf "$STAGING"; }
on_error() { log "Backup FAILED"; ping_hc /fail; }
trap cleanup EXIT
trap on_error ERR

[[ -n "$BUCKET" ]] || die "BACKUP_S3_BUCKET is not set"
[[ -n "$DB_USER" ]] || die "DB_USER is not set"

ping_hc /start
day="$(date -u +%F)"
week="$(date -u +%G-W%V)"

for db in "${DATABASES[@]}"; do
  log "Dumping $db"
  dc exec -T postgres pg_dump -U "$DB_USER" -d "$db" -Fc --no-owner > "$STAGING/$db.dump"
  # Cheap integrity check: the archive must be readable and contain a table of contents.
  dc exec -T postgres pg_restore --list < "$STAGING/$db.dump" > /dev/null
  [[ -s "$STAGING/$db.dump" ]] || die "$db dump is empty"
done

log "Uploading to R2 daily/$day"
rclone copy "$STAGING" "R2:$BUCKET/daily/$day" --s3-no-check-bucket --quiet
if [[ "$(date -u +%u)" == "7" ]]; then
  log "Sunday: also storing weekly/$week"
  rclone copy "$STAGING" "R2:$BUCKET/weekly/$week" --s3-no-check-bucket --quiet
fi

log "Applying retention (daily ${DAILY_DAYS}d, weekly ${WEEKLY_DAYS}d)"
# Retention is housekeeping: a failure here must not mark an otherwise successful backup as failed.
rclone delete "R2:$BUCKET/daily" --min-age "${DAILY_DAYS}d" --s3-no-check-bucket --quiet || log "WARN: daily retention failed"
rclone delete "R2:$BUCKET/weekly" --min-age "${WEEKLY_DAYS}d" --s3-no-check-bucket --quiet || log "WARN: weekly retention failed"

log "Backup finished"
ping_hc
